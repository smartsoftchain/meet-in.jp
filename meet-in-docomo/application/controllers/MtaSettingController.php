<?php
require_once APP_DIR.'/models/Adapter/AuthAdapter.php';

class MtaSettingController extends AbstractController
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
	 * 作成・編集・削除
	 * [POST]/mta-setting/create
	 *
	 * @return void
	 */
	public function createAction() {
		$model = Application_CommonUtil::getInstance("model", "ApiScMtaModel", $this->db);
		$form = $this->_getAllParams();
		$req = $this->getRequest();

		if(!$req->isPost()) {
			echo json_encode(array("status" => false, "result" => array("不正な遷移です")));
			exit;
		}
		$result = $model->create(json_decode($form["settings"], true));
		echo json_encode($result);
		exit;
	}
}