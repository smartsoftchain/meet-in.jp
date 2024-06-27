<?php
class WebinarLeadController extends AbstractController
{

	public function init(){
		parent::init();
		// ヘッダーメニューを非表示にしているアカウントが直接URLアクセス時にリダイレクト
		if (!$this->user["admin_header_enable"]) {
			$this->_redirect('/index/menu');
		}
		/* Initialize action controller here */
		// ログインチェック
		$auth = Zend_Auth::getInstance();
		if($auth->hasIdentity() == true){
			// 認証情報取出し
			$user = $auth->getIdentity();
			$webinarModel = Application_CommonUtil::getInstance("model", "WebinarModel", $this->db);
			if ($webinarModel->clientIdentification($user) == false) {
				// AA or ウェビナー可能時間が0以外ならはじく
				$auth = Zend_Auth::getInstance();
				$auth->clearIdentity();
				Zend_Session::destroy();
				$this->_redirect('/index');
			}
		}else{
			$this->_redirect('/index');
		}
	}
	
	/**
	 * ウェビナーリード一覧を表示する
	 */
	public function listAction(){
		$form = $this->_getAllParams();
		// 操作ログ
		$this->setLog("ウェビナーリード一覧表示", json_encode($form));
		// モデル宣言
		$webinarLeadModel = Application_CommonUtil::getInstance("model", "WebinarLeadModel", $this->db);
		// 画面表示に必要なデータを取得
		$result = $webinarLeadModel->getWebinarLeadList($form, $this->namespace);
		// smartyにデータを設定する
		$this->view->list = $result["listObject"];
		$this->view->registRoute = $result["registRoute"];
		$this->view->freeWord = $this->namespace->free_word;
	}

	/**
	 * ウェビナーリード登録
	 */
	public function registAction(){
		$form = $this->_getAllParams();
		$request = $this->getRequest();
		// モデル宣言
		$webinarLeadModel = Application_CommonUtil::getInstance("model", "WebinarLeadModel", $this->db);
		// 画面表示に必要なデータを取得
		$result = $webinarLeadModel->regist($form, $request, $this->namespace);
		if($result["registCompleteFlg"] == 1){
			// 登録完了の場合は一覧へ遷移
			$this->_redirect("/webinar-lead/list");
		}
		$this->view->webinarLead = $result["webinarLeadDict"];
		$this->view->errorList = $result["errorList"];
	}
	
	/**
	 * ウェビナーリード詳細
	 */
	public function detailAction(){
		$form = $this->_getAllParams();
		$request = $this->getRequest();
		// モデル宣言
		$webinarLeadModel = Application_CommonUtil::getInstance("model", "WebinarLeadModel", $this->db);
		// 画面表示に必要なデータを取得
		$result = $webinarLeadModel->regist($form, $request, $this->namespace);
		if($result["registCompleteFlg"] == 1){
			// 登録完了の場合は一覧へ遷移
			$this->_redirect("/webinar-lead/list");
		}
		$this->view->webinarLead = $result["webinarLeadDict"];
		$this->view->errorList = $result["errorList"];
	}

	/**
	 * ウェビナーリード削除
	 */
	public function deleteWebinarLeadAction(){
		$form = $this->_getAllParams();
		// 操作ログ
		$this->setLog("ウェビナーリード削除", json_encode($form));
		// モデル宣言
		$webinarLeadModel = Application_CommonUtil::getInstance("model", "WebinarLeadModel", $this->db);
		// 画面表示に必要なデータを取得
		$result = $webinarLeadModel->deleteWebinarLead($form);
		echo json_encode($result);
		exit;
	}

	/**
	 * ウェビナーリードCSV登録画面
	 */
	public function registCsvAction(){
		$form = $this->_getAllParams();
		$request = $this->getRequest();
		// 操作ログ
		$this->setLog("ウェビナーリードCSV登録", json_encode($form));
		// モデル宣言
		$webinarLeadModel = Application_CommonUtil::getInstance("model", "WebinarLeadModel", $this->db);
		// 画面表示に必要なデータを取得
		if ($request->isPost()){
			// POSTの場合はCSV登録の非同期処理
			$result = $webinarLeadModel->registLeadCsv($form);
			echo json_encode($result);
			exit;
		}
		// POSTではない場合は、画面表示するのみ
	}

	/**
	 * CSVアップロード画面でアップロードしたCSVファイルを実体化する
	 * その後、データを読み込み返す。（PHPのCSVパース処理を使用したいため）
	 */
	public function uploadCsvFileAction(){
		$form = $this->_getAllParams();
		// 操作ログ
		$this->setLog("ウェビナーリードCSVアップロード", json_encode($form));
		// モデル宣言
		$webinarLeadModel = Application_CommonUtil::getInstance("model", "WebinarLeadModel", $this->db);
		// CSVファイルを実体化し、内容を取得する
		$csvData = $webinarLeadModel->uploadCsvFile($form);
		// 画面返す
		echo $csvData;
		exit;
	}

	/**
	 * ウェビナーリード行動履歴一覧を表示する
	 */
	public function behaviorHistoryListAction(){
		$form = $this->_getAllParams();
		// 操作ログ
		$this->setLog("ウェビナーリード行動履歴一覧表示", json_encode($form));
		// モデル宣言
		$webinarLeadModel = Application_CommonUtil::getInstance("model", "WebinarLeadModel", $this->db);
		// 画面表示に必要なデータを取得
		$result = $webinarLeadModel->getWebinarLeadBehaviorHistoryList($form, $this->namespace);
		// smartyにデータを設定する
		$this->view->list = $result["listObject"];
		$this->view->webinarLead = $result["webinarLead"];
		$this->view->behaviorHistorys = $result["behaviorHistorys"];
		$this->view->freeWord = $this->namespace->free_word;
	}

	/**
	 * ウェビナーリード行動履歴を１件取得する
	 */
	public function behaviorHistoryRowAction(){
		$form = $this->_getAllParams();
		// 操作ログ
		$this->setLog("ウェビナーリード行動履歴メール取得", json_encode($form));
		// モデル宣言
		$webinarLeadModel = Application_CommonUtil::getInstance("model", "WebinarLeadModel", $this->db);
		// 画面表示に必要なデータを取得
		$result = $webinarLeadModel->behaviorHistoryRow($form);
		echo json_encode($result);
		exit;
	}
}
