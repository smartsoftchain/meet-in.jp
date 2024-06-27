<?php

require_once ROOT.'vendor/autoload.php';

/**
 * ビデオを操作するモデルクラス。
 */
class VideoModel extends AbstractModel
{
	/** 拡張子の定数 */
	const WEBM = 'webm';
	const MP4  = 'mp4';

	/** meet-inサーバー内の一時的な動画ファイルを置くディレクトリ */
	const RECORDING_FILE_DIR = 'recording-video/';

	/** sessionの識別key */
	/** チャンク化して一時バケットに溜まっていくオブジェクトの名前の配列 */
	const CHUNKED_MEDIA_NAMES = 'chunked_media_names';

	/** レスポンスステータス */
	const OK           = 200;
	const BAD_REQUEST  = 400;
	const SERVER_ERROR = 500;
	const GCS_ERROR    = 1000;

	/** レスポンスメッセージ */
	const MSG_UPLOAD_ERROR          = '録画ファイルのアップロードに失敗しました。';
	const MSG_UPLOAD_SUCCESS        = '録画ファイルのアップロードに成功しました。';
	const MSG_CREATE_FILE_ERROR     = '録画ファイルの作成に失敗しました。';
	const MSG_CREATE_FILE_SUCCESS   = '録画ファイルの作成に成功しました。';
	const MSG_FILE_NOT_EXIST        = '録画ファイルは現在見つかりませんでした。';
	const MSG_FILE_DOWNLOAD_SUCCESS = '録画ファイルのダウンロードに成功しました。';
	const MSG_BUCKET_NOT_EXIST      = 'Google Cloud Storageにバケットが見つかりませんでした。';

	/** StorageClientインスタンス */
	private $STORAGE_CLIENT;

	/** Google Cloud Storage バケット名 */
	private $BUCKET_NAME     = '';
	private $TMP_BUCKET_NAME = '';

	public function __construct()
	{
		parent::init();
		$this->STORAGE_CLIENT  = $this->generateStorageClient($this->initCredentials());
		$this->BUCKET_NAME     = $this->config->googleCloudStorage->bucket_name;
		$this->TMP_BUCKET_NAME = $this->config->googleCloudStorage->tmp_bucket_name;
	}

	/**
	 * 一時的にバケットにアップロードしていたチャンク化されたメディアを結合して変換用バケットにアップロードする。
	 * また、変換完了後のダウンロード用URLを返却する。
	 * @return array レスポンス
	 */
	public function compose()
	{
		$tmp_storage_objects = [];
		$bucket = $this->STORAGE_CLIENT->bucket($this->BUCKET_NAME);
		$tmp_bucket = $this->STORAGE_CLIENT->bucket($this->TMP_BUCKET_NAME);

		$string = '';
		$webm_filename = '';

		try {
			$this->isBucket($bucket);
			$this->isBucket($tmp_bucket);
		} catch (\Exception $e) {
			error_log($e->getMessage());
			return $this->generateResponseMessage(
				self::GCS_ERROR,
				self::MSG_BUCKET_NOT_EXIST
			);
		}

		try {
			$tmp_storage_objects = $this->generateStorageObjectsFromTmpBucket();
			unset($_SESSION[self::CHUNKED_MEDIA_NAMES]);

			if (count($tmp_storage_objects) <= 0) {
				return $this->generateResponseMessage(
					self::GCS_ERROR,
					self::MSG_UPLOAD_ERROR
				);
			} else if (count($tmp_storage_objects) === 1) {
				// メディアを分割する時間まで録画していないケース（10分未満の録画）
				$webm_filename = $tmp_storage_objects[0]->name();
				$string = pathinfo($webm_filename, PATHINFO_FILENAME);
			} else {
				$string = $this->generateHashString();
				$webm_filename = $this->generateFileName($string, self::WEBM);
				// チャンク化されたメディアを全て結合する。
				$tmp_bucket->compose(
					$tmp_storage_objects,
					$webm_filename,
					$this->generateUploadOption($webm_filename)
				);
				// 一時バケットにあるチャンク化されたメディアを全て削除する。
				$this->deleteStorageObjects($tmp_storage_objects);
			}

			$this->moveStorageObject(
				$this->TMP_BUCKET_NAME,
				$webm_filename,
				$this->BUCKET_NAME,
				$webm_filename
			);

			$mp4_filename = $this->generateFileName($string, self::MP4);
			return $this->generateResponseMessage(
				self::OK,
				self::MSG_UPLOAD_SUCCESS,
				$this->generateDownloadURL($mp4_filename)
			);
		} catch (\Exception $e) {
			error_log($e->getMessage());
			return $this->generateResponseMessage(
				self::GCS_ERROR,
				self::MSG_UPLOAD_ERROR
			);
		}
	}

	/**
	 * あとで結合するために一時的にバケットにチャンク化されたメディアをアップロードする。
	 * ファイルサイズが大きくなり過ぎるため分割してアップロードしていく。
	 * @param Blob $chunk
	 * @return void
	 */
	public function uploadChunkToTemporaryBucket($chunk)
	{
		$tmp_bucket = $this->STORAGE_CLIENT->bucket($this->TMP_BUCKET_NAME);
		$string = $this->generateHashString();
		$webm_filename = $this->generateFileName($string, self::WEBM);
		$webm_filepath = $this->generateFilePath($webm_filename);

		try {
			$this->isBucket($tmp_bucket);
		} catch (\Exception $e) {
			error_log($e->getMessage());
			// アップロード失敗時は webm 形式で recording-videoディレトリに保存する。
			file_put_contents($webm_filepath, $chunk);
			return $this->generateResponseMessage(
				self::GCS_ERROR,
				self::MSG_BUCKET_NOT_EXIST
			);
		}

		try {
			$tmp_bucket->upload($chunk, $this->generateUploadOption($webm_filename));
			$_SESSION[self::CHUNKED_MEDIA_NAMES][] = $webm_filename;
		} catch (Exception $e) {
			error_log($e->getMessage());
			// アップロード失敗時は webm 形式で recording-videoディレトリに保存する。
			file_put_contents($webm_filepath, $chunk);
			return $this->generateResponseMessage(
				self::GCS_ERROR,
				self::MSG_UPLOAD_ERROR
			);
		}
	}

	/**
	 * Google Cloud Storage バケットからmeet-inのサーバーにファイルをコピーし、
	 * そのファイルのパスを返却する
	 * @param string $filename ダウンロードしたいファイルのファイル名
	 * @return string 成功: ダウンロードしたいファイルのパス | 失敗: ''
	 */
	public function getDownloadFilePath($filename)
	{
		$bucket = $this->STORAGE_CLIENT->bucket($this->BUCKET_NAME);
		try {
			$this->isBucket($bucket);
		} catch (\Exception $e) {
			error_log($e->getMessage());
			return $this->generateResponseMessage(
				self::GCS_ERROR,
				self::MSG_BUCKET_NOT_EXIST
			);
		}

		$storage_object = $bucket->object($filename);

		if (!$storage_object->exists()) {
			return $this->generateResponseMessage(
				self::OK,
				self::MSG_FILE_NOT_EXIST
			);
		} else {
			try {
				// meet-inのサーバー内に一時的にファイルを作成する。
				$filepath = $this->generateFilePath($filename);
				if (!file_exists($filepath)) {
					$storage_object->downloadToFile($filepath);
				}
				$this->isFile($filepath);
				return $this->generateResponseMessage(
					self::OK,
					self::MSG_CREATE_FILE_SUCCESS,
					$filepath
				);
			} catch (\Exception $e) {
				error_log($e->getMessage());
				return $this->generateResponseMessage(
					self::GCS_ERROR,
					self::MSG_CREATE_FILE_ERROR
				);
			}
		}
		exit;
	}

	/**
	 * ダウンロード用のURLを生成して返却する。
	 * @param string $filename IAM情報
	 * @return string URL
	 */
	public function generateDownloadURL($filename)
	{
		return "https://{$_SERVER['SERVER_NAME']}/video/download?name={$filename}";
	}

	/**
	 * meet-inサーバー内の `/recording-video` ディレクトリ以下にある動画ファイルを削除する。
	 * @param string $filename (/recording-video 以下のファイル名) | ファイルのパス ex:(hoge.mp4 | recording-video/hoge.mp4)
	 * @return boolean
	 */
	public function deleteFileFromMeetServer($filename)
	{
		if (substr($filename, 0, 16) !== self::RECORDING_FILE_DIR) {
			$filename = $this->generateFilePath($filename);
		}
		return unlink($filename);
	}

	/**
	 * Google Developer's Console から取得したサービスアカウント認証情報を返却する。
	 */
	private function initCredentials()
	{
		return json_decode(file_get_contents(APP_DIR."{$this->config->googleCloudStorage->credentials->path}"), true);
	}

	/**
	 * StorageClientインスタンスを生成して返却する。
	 * @param array $credentials IAM情報
	 * @return StorageClient インスタンス
	 */
	private function generateStorageClient($credentials)
	{
		return new \Google\Cloud\Storage\StorageClient([
			'projectId' => $credentials['project_id'],
			'keyFile' => $credentials,
		]);
	}

	/**
	 * ランダムな文字列を生成して返却する。
	 * @return string ランダムな文字列
	 */
	private function generateHashString()
	{
		$now = new DateTime();
		return md5("{$now->format('Y_m_d_H_i_s')}_{$this->user['staff_type']}{$this->user['staff_id']}");
	}

	/**
	 * 文字列を拡張子付きファイル名にして返却する。
	 * @param string $string ファイル名になる文字列
	 * @param string $extension 拡張子
	 * @return string ファイル名
	 */
	private function generateFileName($string, $extension)
	{
		return "{$string}.{$extension}";
	}

	/**
	 * ファイル名を recording-video/ 以下のパスにして返却する。
	 * @param string $name ファイル名
	 * @return string ファイル名
	 */
	private function generateFilePath($name)
	{
		return self::RECORDING_FILE_DIR.$name;
	}

	/**
	 * バケットに動画データをアップロードする際のオプションを生成して返却する。
	 * @param string $filename ファイル名
	 * @return array オプション
	 */
	private function generateUploadOption($filename)
	{
		return [
			'name' => $filename,
			'resumable' => true,
			'metadata' => [
				'contentType' => 'video/'.pathinfo($filename, PATHINFO_EXTENSION)
			]
		];
	}

	/**
	 * レスポンス用の配列を生成して返却する。
	 * @param string $status レスポンスステータス
	 * @param string $message レスポンスメッセージ
	 * @param any $result 結果データ
	 * @return array レスポンス
	 */
	private function generateResponseMessage($status, $message = '', $result = null)
	{
		return [
			'status' => $status,
			'message' => $message,
			'result' => $result
		];
	}

	/**
	 * セッションに保持されている名前と一致する一時バケット内の Storage Object の配列を返却する。
	 * @param boolean $isDeleteSession セッションを消すかフラグ
	 * @return array レスポンス
	 */
	private function generateStorageObjectsFromTmpBucket($isDeleteSession = true)
	{
		$storage_objects = [];

		$tmp_bucket = $this->STORAGE_CLIENT->bucket($this->TMP_BUCKET_NAME);

		foreach ($_SESSION[self::CHUNKED_MEDIA_NAMES] as $chunked_media_name) {
			$storage_object = $tmp_bucket->object($chunked_media_name);
			if ($storage_object->exists()) {
				$storage_objects[] = $storage_object;
			}
		}

		if ($isDeleteSession) {
			unset($_SESSION[self::CHUNKED_MEDIA_NAMES]);
		}
		return $storage_objects;
	}

	/**
	 * バケットを跨いで Storage Object を移動させる。
	 * @param string $bucket_name バケット名
	 * @param string $object_name Storage Object の名前
	 * @param string $new_bucket_name 移動先のバケット名
	 * @param string $new_object_name 移動先のStorage Object の名前
	 * @return void
	 */
	private function moveStorageObject($bucket_name, $object_name, $new_bucket_name, $new_object_name)
	{
		$bucket = $this->STORAGE_CLIENT->bucket($bucket_name);
		$object = $bucket->object($object_name);
		$object->copy($new_bucket_name, ['name' => $new_object_name]);
		$this->deleteStorageObjects($object);
	}

	/**
	 * Storage Object を全て削除する。
	 * @param string $storage_objects Storage Object の配列
	 * @return void
	 */
	private function deleteStorageObjects($storage_objects)
	{
		if (!$storage_objects || empty($storage_objects)) return;

		if (!is_array($storage_objects) && $storage_objects->exists()) {
			$storage_objects->delete();
		} else {
			foreach ($storage_objects as $object) {
				if ($object->exists()) {
					$object->delete();
				}
			}
		}
	}

	/**
	 * バケットが存在しているか確認する。
	 * 存在していない場合に処理を中断したい際に使用する。
	 * @param string $filename バケットのインスタンス
	 * @return true|Exception
	 */
	private function isBucket($bucket)
	{
		if (!($bucket && $bucket->exists())) {
			throw new Exception('The bucket cannot be found in `Google Cloud Storage`.');
		}
		return true;
	}

	/**
	 * meet-inサーバー内の `/recording-video` ディレクトリ以下に動画ファイルが存在しているか確認する。
	 * 存在していない場合に処理を中断したい際に使用する。
	 * @param string $filename (/recording-video 以下のファイル名) | ファイルのパス ex:(hoge.mp4 | recording-video/hoge.mp4)
	 * @return true|Exception
	 */
	private function isFile($filename)
	{
		if (substr($filename, 0, 16) !== self::RECORDING_FILE_DIR) {
			$filename = $this->generateFilePath($filename);
		}

		if (!file_exists($filename)) {
			throw new Exception('The file cannot be found in the `recording-video` directory on the `meet-in` server.');
		}
		return true;
	}


	/**
	 * GCSにファイルがあるかを判断する
	 * @param string $filename 拡張子込みのファイル名を指定する($this->BUCKET_NAME バケット内には階層などなく、webmとmp4が一緒にぶちまけられている)
	 * @return true
	 */
	public function isFileBucketExists($filename) {
		return $this->STORAGE_CLIENT->bucket($this->BUCKET_NAME)->object($filename)->exists();
	}


}