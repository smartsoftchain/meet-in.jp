<?php
//require_once 'AbstractController.php';

class ClientController extends AbstractController
{

	public function init(){
		parent::init();
		/* Initialize action controller here */
		// ログインチェック
		$auth = Zend_Auth::getInstance();
		if($auth->hasIdentity() == true){
			// 認証情報取出し
			$user = $auth->getIdentity();
			if($user['staff_type'] != "AA"){
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
	 * クライアント一覧を取得する
	 */
	public function getListAction(){
		$form = $this->_getAllParams();
		// 操作ログ
		$this->setLog("クライアント一覧表示", json_encode($form));
		// モデル宣言
		$clientModel = Application_CommonUtil::getInstance("model", "ClientModel", $this->db);
		// 画面表示に必要なデータを取得
		$clientList = $clientModel->getClientList($form, $this->namespace);
		
		$result = json_encode($clientList["list"]);
		echo($result);
		exit;
	}
	
	/**
	 * クライアント一覧を表示する
	 */
	public function listAction(){
		$form = $this->_getAllParams();
		// 操作ログ
		$this->setLog("クライアント一覧表示", json_encode($form));
		// モデル宣言
		$clientModel = Application_CommonUtil::getInstance("model", "ClientModel", $this->db);
		// 画面表示に必要なデータを取得
		$result = $clientModel->getClientList($form, $this->namespace);
		// smartyにデータを設定する
		$this->view->list = $result["list"];
		$this->view->freeWord = $this->namespace->free_word;
		$this->view->err = $this->namespace->err;
	}

	/**
	 * 自身のクライアント情報をセッションに設定する
	 */
	public function changeAction(){
		// クライアント選択の切替
		$form = $this->_getAllParams();
		// 操作ログ
		$this->setLog("クライアント選択完了", json_encode($form));
		// モデル宣言
		$clientModel = Application_CommonUtil::getInstance("model", "ClientModel", $this->db);
		// クライアント一覧で選択したクライアントに成り変わる
		$result = $clientModel->changeClient($form['client_id']);
		echo $result["errFlg"];
		exit;
		// changeClient()の結果により遷移先を変える
// 		if($result["errFlg"]){
// 			// クライアント一覧へ遷移する
// 			$this->_redirect("/client/list?err=1");
// 		}else{
// 			// メニューへ遷移する
// 			$this->_redirect("/index/menu");
// 		}
	}
}

