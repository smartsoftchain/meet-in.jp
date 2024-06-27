<?php

require_once APP_DIR.'/models/Adapter/AuthAdapter.php';

/**
 * ビデオ情報を操作するコントローラークラス。
 */
class VideoController extends AbstractController
{

	public function init()
	{
		parent::init();
		/* Initialize action controller here */
	}

	/**
	 * URLにアクセスして動画ファイルをダウンロードする。
	 * @return void
	 */
	public function downloadAction()
	{
		$filename = $this->_getParam("name");
		// 操作ログ
		$this->setLog('ルーム 録画ダウンロード開始', json_encode($filename));
		// モデル宣言
		$video_model = Application_CommonUtil::getInstance("model", "VideoModel");

		$res = $video_model->getDownloadFilePath($filename);
		$filepath = $res['result'];

		if ($res['status'] !== $video_model::OK) {
			// 変換中にエラーが発生したのでエラー画面に遷移させる。
			$this->_redirect("/video/error");
		} else {
			if (!$filepath) {
				// ファイル変換中のため再アクセスを促す画面に遷移させる。
				$this->_redirect("/video/please-retry?name={$filename}", $res);
			} else {
				// ファイル変換に成功したのでダウンロード開始する。
				header("Content-Type: video/".pathinfo($filepath, PATHINFO_EXTENSION));
				header("X-Content-Type-Options: nosniff");
				header("Content-Disposition: attachment; filename={$filename}");
				header("Content-Length: ".filesize($filepath));
				header("Connection: close'");

				while (ob_get_level()) {
					ob_end_clean();
				}

				// ダウンロード成功したら該当ファイルをサーバーから削除する。
				if (readfile($filepath)) {
					$video_model->deleteFileFromMeetServer($filepath);
				}

				// 操作ログ
				$this->setLog("ルーム　録画ダウンロード成功", json_encode($filename));
			}
		}

		exit;
	}

	/**
	 * URLにアクセス時に動画ファイルを変換中の際に再アクセスを促す画面表示用。
	 * @return void
	 */
	public function pleaseRetryAction()
	{
		$filename = $this->_getParam("name");
		// 操作ログ
		$this->setLog("ルーム　録画ダウンロードリトライ", json_encode($filename));
		// モデル宣言
		$video_model = Application_CommonUtil::getInstance("model", "VideoModel");

		$this->view->download_url = $video_model->generateDownloadURL($filename);
	}

	/**
	 * 動画ファイル変換失敗画面表示用。
	 * @return void
	 */
	public function errorAction()
	{
		// 操作ログ
		$this->setLog("ルーム　録画ダウンロードエラー");
	}
}