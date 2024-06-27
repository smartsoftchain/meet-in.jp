<?php

class SettingLogController extends AbstractController {

	public function init(){
		parent::init();
		
		/* Initialize action controller here */
		if(empty($this->user['client_id'])){
			$this->_redirect('/error/notclient');
		}
		
		if($this->user['staff_role'] != "AA_1" && $this->user['staff_role'] != "AA_2" && $this->user['staff_role'] != "CE_1"){
			$this->_redirect('error?msg=不正な遷移です。');
		}
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
		if(!strpos($_SERVER['HTTP_USER_AGENT'],'iPad') && !strpos($_SERVER['HTTP_USER_AGENT'],'iPhone')){
			// iPad以外はsjisに変換する
			$csvData = mb_convert_encoding($csvData, 'sjis-win', 'UTF-8');
		}
		
		header('Pragma: public');
		$this->getResponse()
			->setHeader('Content-disposition','attachment; filename*=UTF-8\'\'' . rawurlencode($fileName))
			->setHeader('Content-type', 'test/x-csv')
			->sendHeaders();
		
		$this->getResponse()->appendBody($csvData);
		$this->getResponse()->outputBody();
			
		exit;		
	}
}