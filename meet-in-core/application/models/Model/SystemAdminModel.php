<?php


/**
 * 管理者画面用モデル
 * @author admin
 *
 */
class SystemAdminModel extends AbstractModel{

	const IDENTIFIER = 'system-admin';	// セッション変数のnamespace

	private $db;	// DBコネクション

	function __construct($db){
		parent::init();
		$this->db = $db;
	}

	public function init() {
	}

	/**
	 * 背景画像一覧を取得する
	 * @return array
	 */
	public function getBackgroundList() {
		error_log('[SystemAdminModel.getBackgroundList] IN');

		// フォルダ内のファイル一覧を取得
		$path = "{$_SERVER['DOCUMENT_ROOT']}/img/background/";
		$files = glob($path . '{*.jpg,*.png}', GLOB_BRACE);

		// ファイル一覧情報を制定
		$list = array();
		foreach($files as &$file) {
			$pathinfo = pathinfo($file);
			
			// ファイル名からindexを抜き出す
			$index = split('[_]', $pathinfo['filename'])[0];

			// データ格納
			array_push($list, [
				'index' => $index,
				'dirname' => $pathinfo['dirname'],
				'filename' => $pathinfo['filename'],
				'extension' => $pathinfo['extension'],
			]);
		}

		// 並び替え
		$sortKey = array();
		foreach ($list as $index => $val) {
			$sortKey[$index] = $val['index'];
		}
		array_multisort($sortKey, SORT_ASC, $list);
		// var_dump($list);exit;
		$result['list'] = $list;
		
		// 使用されているindexの一番大きな値を求める
		if (count($list) > 0) {
			$lastItem = $list[count($list) - 1];
			$result['lastIndex'] = $lastItem['index'];
		}
		else {
			$result['lastIndex'] = 0;
		}
		return $result;
	}

	/**
	 * 背景画像一覧を登録する
	 * @param unknown $form
	 */
	public function registBackgroundList($form) {
		// DAOの宣言
		$bodypixImageDao = Application_CommonUtil::getInstance("dao", "BodypixImageDao", $this->db);

		$requestActions = json_decode($form['request_actions'], true);

		// ファイル一覧取得
		$list = $this->getBackgroundList()['list'];
		// リストの最後のファイルのindexから次のindexを決める
		$nextIndex = 0;
		if (count($list) > 0) {
			$lastItem = $list[count($list) - 1];
			$nextIndex = $lastItem['index'] + 1;
		}
		// トランザクションスタート
		$this->db->beginTransaction();
		try{
			// 追加
			foreach ($requestActions as $infoIndex => $action) {
				if ($action == "add") {
					// すでに同じindexの画像が存在するか
					if($this->findBackground($infoIndex) != "") {
						// 一旦削除する
						$this->deleteBackground($infoIndex, $bodypixImageDao);
						// 同じindexで追加し直し
						$this->addBackground($infoIndex, $_FILES['file_' .$infoIndex], $bodypixImageDao);
					}
					else {
						// 追加
						$this->addBackground($nextIndex, $_FILES['file_' .$infoIndex], $bodypixImageDao);
						$nextIndex++;
					}
				}
			}
			// コミットする（メールの送信結果に関わらず、DBはコミットする）
			$this->db->commit();
		}catch(Exception $e){
			$this->db->rollBack();
		}
		// 元々の作りで戻り値が存在しないので、例外発生時も取り敢えず前の処理にならう
	}

	/**
	 * 背景画像を追加する
	 */
	private function addBackground($index, $file, $bodypixImageDao) {
		$tmp = $file['tmp_name'];
		$error = $file['error'];
		$name = $file['name'];
		$ext = strtolower(preg_replace('/(.+)\.(.+)/', '$2', $name));
		
		// アップロードされたファイルか検査
		if(!is_uploaded_file($tmp) || $error != 0) {
			return;
		}

		// ファイルをpublic配下に移動
		$filename = $index . '_' . uniqid() . '.' . $ext;
		$filepath = "{$_SERVER['DOCUMENT_ROOT']}/img/background/" . $filename;
		if(move_uploaded_file($tmp, $filepath)) {
			error_log('upload file = ' . $filepath);
			// DBにファイルパスを登録する(管理者の場合は第二引数がnullとなる)
			$registFilepath = "/img/background/{$filename}";
			$bodypixImageDao->setBodypixImage($registFilepath, null);
		}
	}

	/**
	 * 背景画像を削除する
	 */
	private function deleteBackground($index, $bodypixImageDao) {
		$filename = $this->findBackground($index);
		if ($filename != "") {
			error_log('unlink file = ' . $filename);
			unlink($filename);
			// DBからデータを削除する(管理者の場合は、staff_typeとstaff_idがnullとなる)
			$deleteFilepath = "/img/background/" . end(explode("/", $filename));
			$bodypixImageDao->delBodypixImage($deleteFilepath, null, null);
		}
	}

	/**
	 * 背景画像を検索する
	 */
	private function findBackground($index) {
		$filename = $index . '_*';
		$deletefiles = "{$_SERVER['DOCUMENT_ROOT']}/img/background/" . $filename;
		foreach(glob($deletefiles) as $file) {
			return $file;
		}

		return "";
	}

	/**
	 * 導入企業数を取得する
	 */
	public function getCompanyNumber() {
		// DAOの宣言
		$companyDao = Application_CommonUtil::getInstance("dao", "CompanyCountDao", $this->db);
		return $companyDao->getCompanyNumber();
	}

	/**
	 * 導入企業数を設定する
	 */
	public function setCompanyNumber($number) {
		// DAOの宣言
		$companyDao = Application_CommonUtil::getInstance("dao", "CompanyCountDao", $this->db);
		return $companyDao->setCompanyNumber($number);
	}

	/**
	 * 導入企業数のバリデーション
	 * @param unknown $form
	 */
    public function companyNumberValidation($number)
    {

		$errorList = array();
		if (!preg_match("#^\d{1,5}+$#", $number)) {
			$errorList[] = "カンマ除く半角数字5桁で入力してください。";
		}

	    return $errorList;
    }

}
