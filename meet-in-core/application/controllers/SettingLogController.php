<?php

class SettingLogController extends AbstractController {

	public function init(){
		parent::init();
		
		/* Initialize action controller here */
		if(empty($this->user['client_id'])){
			$this->_redirect('/error/notclient');
		}
		
		if($this->user['staff_role'] != "AA_1" && $this->user['staff_role'] != "AA_2" && $this->user['staff_role'] != "CE_1" && $this->user['staff_role'] != "CE_2" && $this->user['staff_role'] != "CE_3"){
			$this->_redirect('error?msg=不正な遷移です。');
		}
	}


	/**
	 * アカウント一覧の取得
	 */
	public function getActiveRoomAction() {
		$this->_helper->viewRenderer->setNoRender(true);
		$form = $this->_getAllParams();

		$operationLogModel = Application_CommonUtil::getInstance("model", "OperationLogModel", $this->db);
		// $uniqueActiveRoomNameArray = $operationLogModel->getActiveRoom($form, $this->namespace);
		if($form["select_page"] == NULL){
			$uniqueActiveRoomNameArray = $operationLogModel->getActiveRoom($form, 1);
		}else{
			$uniqueActiveRoomNameArray = $operationLogModel->getActiveRoom($form, $form["select_page"]);
		}

		$resObj = array(
			"logLength" => $uniqueActiveRoomNameArray[1],
			"data" => $uniqueActiveRoomNameArray[0]
		);

		echo json_encode($resObj);
	}

	/**
	 * 期間選択時のデータを取得
	 */
	public function getPeriodSelectionLogAction() {
		$this->_helper->viewRenderer->setNoRender(true);
		$form = $this->_getAllParams();

		$operationLogModel = Application_CommonUtil::getInstance("model", "OperationLogModel", $this->db);
		$uniqueActiveRoomNameArray = $operationLogModel->getPeriodSelectionLogAction($form);	

		echo json_encode($uniqueActiveRoomNameArray);
	}

	/**
	 * クライアントのログ出力
	 */
	public function clientLogDetailAction(){
		$form = $this->_getAllParams();
		$operationLogModel = Application_CommonUtil::getInstance("model", "OperationLogModel", $this->db);
		// 選択されたユーザーを名前のみの文字列に変更
		if($form["select_user_data"]){
			foreach($form["select_user_data"] as $key => $data){
				$userDataArray = explode(" / ", $data);
				$form["select_user_data"][$key] = $userDataArray[0];
			}
		}

		// ここで項目別で分岐させる(デフォルトは接続時時間別)
		switch($form["list_type"]) {
			case 1:
				// 接続時間別
				if($form["select_page"] == NULL){
					$setSelectTypeData = $operationLogModel->getEachConnectionTimeLog($form, 1);
				}else{
					$setSelectTypeData = $operationLogModel->getEachConnectionTimeLog($form, $form["select_page"]);
				}
				echo json_encode($setSelectTypeData);
				exit;
				break;

			case 2:
				// 時間帯別
				$setSelectTypeData = $operationLogModel->getEachConnectionTimeZoneLog($form, "timeZone", $form["select_page"]);
				echo json_encode($setSelectTypeData);
				exit;
				break;

			case 3:
				// 曜日別
				$setSelectTypeData = $operationLogModel->getEachDayOfWeekLog($form);
				echo json_encode($setSelectTypeData);
				exit;
				break;

			case 4:
				// 日付別
				$setSelectTypeData = $operationLogModel->getEachConnectionTimeZoneLog($form, "day", $form["select_page"]);
				echo json_encode($setSelectTypeData);
				exit;
				break;

			case 5:
				// 週別
				$setSelectTypeData = $operationLogModel->getEachConnectionTimeZoneLog($form, "week", $form["select_page"]);
				echo json_encode($setSelectTypeData);
				exit;
				break;

			case 6:
				// 月別
				$setSelectTypeData = $operationLogModel->getEachConnectionTimeZoneLog($form, "month", $form["select_page"]);
				echo json_encode($setSelectTypeData);
				exit;
				break;

			case 7:
				// room別
				$setSelectTypeData = $operationLogModel->getEachUseRoomLog($form, $form["select_page"]);
				echo json_encode($setSelectTypeData);
				exit;
				break;
	
			case 8:
				// 機能別
				$setSelectTypeData = $operationLogModel->getEachFunctionLog($form);
				echo json_encode($setSelectTypeData);
				exit;
				break;

			case 9:
				// 資料別
				$setSelectTypeData = $operationLogModel->getEachUseMaterialLog($form, $form["select_page"]);
				echo json_encode($setSelectTypeData);
				exit;
				break;
		}
	}

	/**
	 * インクリメンタルサーチ
	 */
	public function accountNameSearchAction() {
		$form = $this->_getAllParams();
		$operationLogModel = Application_CommonUtil::getInstance("model", "OperationLogModel", $this->db);
		$accountName = $operationLogModel->getAccountName($form["keyword"]);
		echo json_encode($accountName);
		exit;
	}

	/**
	 * 操作ログ抽出画面
	 */
	public function operationLogListAction() {

		// 操作ログ
		$this->setLog("環境設定_操作ログ一覧", json_encode($this->_getAllParams()));
		$form = $this->_getAllParams();

		$operationLogModel = Application_CommonUtil::getInstance("model", "OperationLogModel", $this->db);
		$logList = $operationLogModel->getLogList($form, $this->namespace);

		// smartyにデータを設定する
		$this->view->list        = $logList["list"];

		$this->view->free_word   = $this->namespace->free_word;
	}

	/**
	 * 操作ログCSVダウンロード
	 */
	public function downloadCsvAction() {

		// 操作ログ
		$this->setLog("環境設定_操作ログダウンロード", json_encode($this->_getAllParams()));
		$form = $this->_getAllParams();

		$operationLogModel = Application_CommonUtil::getInstance("model", "OperationLogModel", $this->db);

		// CSVデータを取得する
		$csvData = $operationLogModel->getCsvResult();

		// ファイル名を設定
		$fileName = "log.csv";

		// 文字コードをSJISに変換
		$userAgent = $_SERVER['HTTP_USER_AGENT'];
		if(strpos($userAgent,'iPad') && strpos($userAgent,'iPhone')){
		}else if (strpos($userAgent,'Mac') && strpos($userAgent,'Safari')) {
			// iPad　iOS13以上のデスクトップ表示対策
		} else {
			// iPad以外はsjisに変換する
			$csvData = mb_convert_encoding($csvData, 'sjis-win', 'UTF-8');
		}

		header('Pragma: public');
		$this->getResponse()
			->setHeader('Content-disposition','attachment; filename*=UTF-8\'\'' . rawurlencode($fileName))
			->setHeader('Content-type', 'test/x-csv')
			->setHeader('Pragma', 'no-cache')
			->sendHeaders();

		$this->getResponse()->appendBody($csvData);
		$this->getResponse()->outputBody();

		exit;
	}

	/**
	 * 代理店の顧客の操作ログ抽出画面
	 */
	public function operationDistributorClientLogListAction() {

		if($this->user['client_type'] !== "2" || !in_array($this->user["staff_role"], ["AA_1", "CE_1", "CE_2"]) || !$this->user["admin_header_enable"]) {
			$this->_redirect('/index/menu');
		}

		// 操作ログ
		$this->setLog("環境設定_代理店顧客操作ログ一覧", json_encode($this->_getAllParams()));
		$form = $this->_getAllParams();

		$operationLogModel = Application_CommonUtil::getInstance("model", "OperationLogModel", $this->db);
		$logList = $operationLogModel->getDistributorClientLogList($form, $this->namespace);

		$this->view->list        = $logList["list"];
		$this->view->free_word   = $this->namespace->free_word;
	}

	/**
	 * 代理店の顧客の操作ログCSVダウンロード
	 */
	public function downloadDistributorClientCsvAction() {

		if($this->user['client_type'] !== "2" || !in_array($this->user["staff_role"], ["AA_1", "CE_1", "CE_2"])) {
			exit;
		}


		// 操作ログ
		$this->setLog("環境設定_代理店顧客操作ログダウンロード", json_encode($this->_getAllParams()));
		$form = $this->_getAllParams();

		$operationLogModel = Application_CommonUtil::getInstance("model", "OperationLogModel", $this->db);

		// CSVデータを取得する
		$csvData = $operationLogModel->getDistributorClientCsvResult($form, $this->namespace);

		// ファイル名を設定
		$fileName = "log.csv";

		// 文字コードをSJISに変換
		$userAgent = $_SERVER['HTTP_USER_AGENT'];
		if(strpos($userAgent,'iPad') && strpos($userAgent,'iPhone')){
		}else if (strpos($userAgent,'Mac') && strpos($userAgent,'Safari')) {
			// iPad　iOS13以上のデスクトップ表示対策
		} else {
			// iPad以外はsjisに変換する
			$csvData = mb_convert_encoding($csvData, 'sjis-win', 'UTF-8');
		}

		header('Pragma: public');
		$this->getResponse()
			->setHeader('Content-disposition','attachment; filename*=UTF-8\'\'' . rawurlencode($fileName))
			->setHeader('Content-type', 'test/x-csv')
			->setHeader('Pragma', 'no-cache')
			->sendHeaders();

		$this->getResponse()->appendBody($csvData);
		$this->getResponse()->outputBody();

		exit;
	}


	/**
	 * 画面共有のログ取得
	 */
	public function getShareScreenLogAction() {
		$this->_helper->viewRenderer->setNoRender(true);
		$form = $this->_getAllParams();
		$this->setLog("画面共有を使用", json_encode($form));
	}

	/**
	 * 共有メモのログ取得
	 */
	public function getShareMemoLogAction() {
		$this->_helper->viewRenderer->setNoRender(true);
		$form = $this->_getAllParams();
		$this->setLog("共有メモを使用", json_encode($form));
	}
	
	/**
	 * ホワイトボードのログ取得
	 */
	public function getWhiteBoardLogAction() {
		$this->_helper->viewRenderer->setNoRender(true);
		$form = $this->_getAllParams();
		$this->setLog("ホワイトボードを使用", json_encode($form));
	}
	
	/**
	 * 画面キャプチャのログ取得
	 */
	public function getScreenCaptureLogAction() {
		$this->_helper->viewRenderer->setNoRender(true);
		$form = $this->_getAllParams();
		$this->setLog("画面キャプチャを使用", json_encode($form));
	}

	/**
	 * チャットのログ取得
	 */
	public function getChatBoardLogAction() {
		$this->_helper->viewRenderer->setNoRender(true);
		$form = $this->_getAllParams();
		$this->setLog("チャットを使用", json_encode($form));
	}

	/**
	 * シークレットメモのログ取得
	 */
	public function getSecretMemoLogAction() {
		$this->_helper->viewRenderer->setNoRender(true);
		$form = $this->_getAllParams();
		$this->setLog("シークレットメモを使用", json_encode($form));
	}

	/**
	 * 録画のログ取得
	 */
	public function getRecordingLogAction() {
		$this->_helper->viewRenderer->setNoRender(true);
		$form = $this->_getAllParams();
		$this->setLog("録画を使用", json_encode($form));
	}

	/**
	 * 音声分析開始のログ取得
	 */
	public function getAudioAnalysisStartLogAction() {
		$this->_helper->viewRenderer->setNoRender(true);
		$form = $this->_getAllParams();
		$this->setLog("音声分析　時間カウント開始", json_encode($form));
	}

	/**
	 * 音声分析停止のログ取得
	 */
	public function getAudioAnalysisStopLogAction() {
		$this->_helper->viewRenderer->setNoRender(true);
		$form = $this->_getAllParams();
		$this->setLog("音声分析　時間カウント停止", json_encode($form));
	}
}