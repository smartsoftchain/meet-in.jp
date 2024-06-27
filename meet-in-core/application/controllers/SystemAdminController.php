<?php

class SystemAdminController extends AbstractController
{
	public function init(){
		parent::init();
		/* Initialize action controller here */

		// ログインチェック
		$auth = Zend_Auth::getInstance();
		if($auth->hasIdentity() == true){

			// 認証情報取出し
			$user = $auth->getIdentity();

		}else{
			$form = $this->_getAllParams();
			if($form['action'] != 'index' && $form['action'] != 'login'){
				$this->_redirect('/index');
			}
		}
	}

	/**
	 * 認証チェック
	 */
	public function authCheckStaffList() {
		// error_log("[SystemAdminController.authCheckStaffList] IN");
		if ($this->user['staff_type'] != "system_admin") {
			// error_log("[SystemAdminController.authCheckStaffList] Unauthorized access : staff_type = " . $this->user['staff_type']);
			// 不正アクセスの場合
			$this->_redirect('/index/menu');
		}
	}

	/**
	 * インデックス画面
	 */
	public function indexAction() {
		error_log("[SystemAdminController.indexAction] IN");

		// 一覧取得
		$form = $this->_getAllParams();

		$systemAdminModel = Application_CommonUtil::getInstance("model", "SystemAdminModel", $this->db);
		$result = $systemAdminModel->getCompanyNumber();

		$this->view->number = $result;
		$this->view->msg = $form['msg'];

		// ユーザー認証
		$this->authCheckStaffList();
	}

	/**
	 * クライアント管理画面（MCUサーバー切換）
	**/
	public function clientListAction() {
		error_log("[SystemAdminController.clientListAction] IN");

		// ユーザー認証
		$this->authCheckStaffList();

		// 一覧取得
		$form = $this->_getAllParams();

		$adminClientModel = Application_CommonUtil::getInstance("model", "AdminClientModel", $this->db);
		$result = $adminClientModel->getClientList($form, $this->namespace);

		$this->view->list = $result["list"];

	}

	/**
	 * クライアント更新処理（MCUサーバー切換）
	**/
	public function updateClientAction() {
//		error_log("[SystemAdminController.updateClientAction] IN");
//		$this->_logger->info("updateClientAction::". json_encode($this->_getAllParams()));
		$result = array();

		// ユーザー認証
		$this->authCheckStaffList();

		$form = $this->_getAllParams();
		$request = $this->getRequest();

		$adminClientModel = Application_CommonUtil::getInstance("model", "AdminClientModel", $this->db);
		$result = $adminClientModel->updateNegotiationRoomType($form);

		echo json_encode($result);
		exit;
	}

	/**
	 * 背景登録画面
	 */
	public function backgroundListAction() {
		error_log("[SystemAdminController.backgroundListAction] IN");

		// ユーザー認証
		$this->authCheckStaffList();

		// 一覧取得
		$form = $this->_getAllParams();
		$systemAdminModel = Application_CommonUtil::getInstance("model", "SystemAdminModel", $this->db);
		$result = $systemAdminModel->getBackgroundList($form, $this->namespace);

		$this->view->list = $result["list"];
		$this->view->lastIndex = $result["lastIndex"];
	}

	/**
	 * 背景画像の登録
	 */
	public function registBackgroundAction() {
		error_log("[SystemAdminController.registBackgroundAction] IN");

		// ユーザー認証
		$this->authCheckStaffList();

		// 登録
		$form = $this->_getAllParams();
		$request = $this->getRequest();
		$systemAdminModel = Application_CommonUtil::getInstance("model", "SystemAdminModel", $this->db);
		$systemAdminModel->registBackgroundList($form, $this->namespace);

		// 画面更新
		$this->_redirect('/system-admin/background-list');
	}

	/**
	 * 導入企業数管理
	 */
	public function registCompanyAction() {
		error_log("[SystemAdminController.registCompanyAction] IN");

		// ユーザー認証
		$this->authCheckStaffList();

		// 登録
		$form = $this->_getAllParams();
		$request = $this->getRequest();

		$number = str_replace(",", "", $form['number']);

		$systemAdminModel = Application_CommonUtil::getInstance("model", "SystemAdminModel", $this->db);
		if($errorList = $systemAdminModel->companyNumberValidation($number)) {
			// 画面更新
			$this->_redirect('/system-admin/index?msg=' . $errorList[0]);
		} else {
			$systemAdminModel->setCompanyNumber($number);
			$this->_redirect('/system-admin/index');
		}
	}
}
