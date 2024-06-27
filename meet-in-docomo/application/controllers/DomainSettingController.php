<?php
require_once APP_DIR.'/models/Adapter/AuthAdapter.php';

class DomainSettingController extends AbstractController
{
	public function init(){
		parent::init();
		/* Initialize action controller here */
		$auth = Zend_Auth::getInstance();
		if($auth->hasIdentity() == true){
			// 認証情報取出し
			$user = $auth->getIdentity();
		}else{
			http_response_code(401);
			exit;
		}
	}

	/**
	 * 詳細表示
	 * [GET]/domain-setting/fetch-row
	 *
	 * @return void
	 */
	public function fetchRowAction() {
		$form = $this->_getAllParams();
		$domainModel = Application_CommonUtil::getInstance("model", "ApiScDomainModel", $this->db);

		$result = $domainModel->fetchRow($form["id"]);
		echo json_encode($result);
		exit;
	}

	/**
	 * 作成
	 * [POST]/domain-setting/create
	 *
	 * @return void
	 */
	public function createAction() {
		$form = $this->_getAllParams();
		$req = $this->getRequest();
		$domainModel = Application_CommonUtil::getInstance("model", "ApiScDomainModel", $this->db);

		if(!$req->isPost()) {
			echo json_encode(array("status" => false, "result" => array("不正な遷移です")));
			exit;
		}
		$result = $domainModel->create($form["domain"]);
		echo json_encode($result);
		exit;

	}

	/**
	 * 削除
	 * [POST]/domain-setting/delete
	 *
	 * @return void
	 */
	public function deleteAction() {
		$form = $this->_getAllParams();
		$req = $this->getRequest();
		$domainModel = Application_CommonUtil::getInstance("model", "ApiScDomainModel", $this->db);

		if(!$req->isPost()) {
			echo json_encode(array("status" => false, "result" => array("不正な遷移です")));
			exit;
		}
		$result = $domainModel->delete($form["id"]);
		echo json_encode($result);
		exit;
	}
}