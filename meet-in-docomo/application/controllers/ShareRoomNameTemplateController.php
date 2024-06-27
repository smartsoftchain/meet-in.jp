<?php
require_once APP_DIR.'/models/Adapter/AuthAdapter.php';

class ShareRoomNameTemplateController extends AbstractController
{
	const IDENTIFIER = "share-room-name-template";

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
	 * json形式で詳細を取得
	 *
	 * @return void
	 */
	public function detailAction() {
		$form = $this->_getAllParams();
		$model = Application_CommonUtil::getInstance("model", "ShareRoomNameTemplateModel", $this->db);
		$authModel = Application_CommonUtil::getInstance("model", "ApiScAuthModel", $this->db);

		$template = $model->fetchRow($form["client_id"], $form["staff_id"], $form["staff_type"]);
		echo json_encode($template);
		exit;
	}
}
