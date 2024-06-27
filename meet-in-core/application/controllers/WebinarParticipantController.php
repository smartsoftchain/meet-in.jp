<?php
class WebinarParticipantController extends AbstractController
{

	public function init(){
		parent::init();
		/* Initialize action controller here */
		// ログインチェック
		$auth = Zend_Auth::getInstance();
		if($auth->hasIdentity() == true){
			// 認証情報取出し
			$user = $auth->getIdentity();
			if($user['staff_role'] != "AA_1" && $user['staff_role'] != "AA_2"){
				// AA以外ならはじく
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
	 * ウェビナー参加者一覧を表示する
	 */
	public function listAction(){
		$form = $this->_getAllParams();
		// 操作ログ
		$this->setLog("ウェビナー参加者一覧表示", json_encode($form));
		// モデル宣言
		$webinarParticipantModel = Application_CommonUtil::getInstance("model", "WebinarParticipantModel", $this->db);
		// 画面表示に必要なデータを取得
		$result = $webinarParticipantModel->getWebinarParticipantList($form, $this->namespace);
		// smartyにデータを設定する
		$this->view->list = $result["listObject"];
		$this->view->webinar = $result["webinarDict"];
		$this->view->freeWord = $this->namespace->free_word;
		$this->view->webinarId = $this->namespace->webinarId;
	}

	/**
	 * ウェビナー参加者登録
	 */
	public function registAction(){
		$form = $this->_getAllParams();
		$request = $this->getRequest();
		// モデル宣言
		$webinarParticipantModel = Application_CommonUtil::getInstance("model", "WebinarParticipantModel", $this->db);
		// 画面表示に必要なデータを取得
		$result = $webinarParticipantModel->regist($form, $request, $this->namespace);
		if($result["registCompleteFlg"] == 1){
			// 登録完了の場合は一覧へ遷移
			$this->_redirect("/webinar-participant/list?id={$result["webinarDict"]["id"]}");
		}
		$this->view->webinarParticipant = $result["webinarParticipantDict"];
		$this->view->errorList = $result["errorList"];
		$this->view->webinarId = $result["webinarParticipantDict"]["webinarId"];
	}

	/**
	 * ウェビナー参加者詳細
	 */
	public function detailAction(){
		$form = $this->_getAllParams();
		$request = $this->getRequest();
		// モデル宣言
		$webinarParticipantModel = Application_CommonUtil::getInstance("model", "WebinarParticipantModel", $this->db);
		// 画面表示に必要なデータを取得
		$result = $webinarParticipantModel->regist($form, $request, $this->namespace);
		if($result["registCompleteFlg"] == 1){
			// 登録完了の場合は一覧へ遷移
			$this->_redirect("/webinar-participant/list?id={$result["webinarDict"]["id"]}");
		}
		$this->view->webinarParticipant = $result["webinarParticipantDict"];
		$this->view->webinar = $result["webinarDict"];
		$this->view->errorList = $result["errorList"];
		$this->view->webinarId = $result["webinarParticipantDict"]["webinar_id"];
	}

	/**
	 * ウェビナー参加者削除
	 */
	public function deleteParticipantAction(){
		$form = $this->_getAllParams();
		// 操作ログ
		$this->setLog("ウェビナー参加者削除", json_encode($form));
		// モデル宣言
		$webinarParticipantModel = Application_CommonUtil::getInstance("model", "WebinarParticipantModel", $this->db);
		// 画面表示に必要なデータを取得
		$result = $webinarParticipantModel->deleteParticipant($form);
		echo json_encode($result);
		exit;
	}

	/**
	 * ウェビナー参加者行動履歴一覧
	 */
	public function behaviorHistoryListAction(){
		$form = $this->_getAllParams();
		// 操作ログ
		$this->setLog("ウェビナー参加者行動履歴", json_encode($form));
		// モデル宣言
		$webinarParticipantModel = Application_CommonUtil::getInstance("model", "WebinarParticipantModel", $this->db);
		// 画面表示に必要なデータを取得
		$result = $webinarParticipantModel->behaviorHistoryList($form, $this->namespace);
		// smartyにデータを設定する
		$this->view->list = $result["listObject"];
		$this->view->webinarParticipant = $result["webinarParticipantDict"];
		$this->view->behaviorHistorys = $result["behaviorHistorys"];
		$this->view->freeWord = $this->namespace->free_word;
		$this->view->webinarId = $result["webinarParticipantDict"]["webinar_id"];
		$this->view->webinarParticipantId = $result["webinarParticipantDict"]["id"];
	}
	
	/**
	 * ウェビナー参加者行動履歴を１件取得する
	 */
	public function behaviorHistoryRowAction(){
		$form = $this->_getAllParams();
		// 操作ログ
		$this->setLog("ウェビナー参加者行動履歴メール取得", json_encode($form));
		// モデル宣言
		$webinarParticipantModel = Application_CommonUtil::getInstance("model", "WebinarParticipantModel", $this->db);
		// 画面表示に必要なデータを取得
		$result = $webinarParticipantModel->behaviorHistoryRow($form);
		echo json_encode($result);
		exit;
	}
}
