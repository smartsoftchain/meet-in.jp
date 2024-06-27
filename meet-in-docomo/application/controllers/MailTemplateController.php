<?php
require_once APP_DIR.'/models/Adapter/AuthAdapter.php';

class MailTemplateController extends AbstractController
{
	const IDENTIFIER = "mail-template";

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
	 * 一覧画面表示
	 * [GET]/mail-template/
	 *
	 * @return void
	 */
	public function indexAction() {
		$form = $this->_getAllParams();
		$model = Application_CommonUtil::getInstance("model", "MailTemplateModel", $this->db);

		$list = $model->fetchAllScreen($form, $this->namespace);
		$this->view->keyword = $this->namespace->keyword;
		$this->view->list = $list;
	}

	/**
	 * 新規作成・編集画面表示
	 * [GET]/mail-template/create-screen
	 *
	 * @return void
	 */
	public function createScreenAction() {
		$form = $this->_getAllParams();
		$model = Application_CommonUtil::getInstance("model", "MailTemplateModel", $this->db);
		// $fromList = $model->fetchFromList();
		if(!empty($form["id"])) {
			$template = $model->fetchRow($form["id"]);
		}
		// $this->view->fromList = $fromList["result"];
		$this->view->template = $template;
	}

	/**
	 * 新規作成[POST]
	 * [POST] /mta-setting/create
	 *
	 * @return json
	 */
	public function createAction() {
		$form = $this->_getAllParams();
		$req = $this->getRequest();
		if(!$req->isPost()) {
			echo json_encode(array("status" => false, "result" => array("不正な遷移です")));
			exit;
		}
		$model = Application_CommonUtil::getInstance("model", "MailTemplateModel", $this->db);
		$result = $model->create($form, empty($form["id"])? NULL:$form["id"]);
		echo json_encode($result);
		exit;
	}

	/**
	 * 編集[POST]
	 *
	 * @return json
	 */
	public function editAction() {
		$form = $this->_getAllParams();
		$req = $this->getRequest();
		if(!$req->isPost()) {
			echo json_encode(array("status" => false, "result" => array("不正な遷移です")));
			exit;
		}
		$model = Application_CommonUtil::getInstance("model", "MailTemplateModel", $this->db);
		$result = $model->create($form, $form["id"]);
		echo json_encode($result);
		exit;
	}

	/**
	 * 削除[POST]
	 *
	 * @return json
	 */
	public function deleteAction() {
		$form = $this->_getAllParams();
		$req = $this->getRequest();
		if(!$req->isPost()) {
			echo json_encode(array("status" => false, "result" => array("不正な遷移です")));
			exit;
		}
		$model = Application_CommonUtil::getInstance("model", "MailTemplateModel", $this->db);
		$result = $model->deleteAll(json_decode($form["ids"]));
		echo json_encode($result);
		exit;
	}

	/**
	 * json形式で一覧を取得
	 *
	 * @return void
	 */
	public function listAction() {
		$form = $this->_getAllParams();
		$model = Application_CommonUtil::getInstance("model", "MailTemplateModel", $this->db);
		$authModel = Application_CommonUtil::getInstance("model", "ApiScAuthModel", $this->db);

		$result = $model->fetchAll();
		echo json_encode($result);
		exit;
	}

	/**
	 * json形式で詳細を取得
	 *
	 * @return void
	 */
	public function detailAction() {
		$form = $this->_getAllParams();
		$model = Application_CommonUtil::getInstance("model", "MailTemplateModel", $this->db);
		$authModel = Application_CommonUtil::getInstance("model", "ApiScAuthModel", $this->db);

		$template = $model->fetchRow($form["id"]);
		echo json_encode($template);
		exit;
	}

	/**
	 * テスト送信画面表示
	 *
	 * @return void
	 */
	public function testAction() {
		$form = $this->_getAllParams();
		$model = Application_CommonUtil::getInstance("model", "MailTemplateModel", $this->db);
		$template = $model->fetchRow($form["id"]);
		$this->view->template = $template;
	}

	/**
	 * メールを送信する（PHP）
	 *
	 * @return void
	 */
	public function sendAction() {
		$model = Application_CommonUtil::getInstance("model", "MailTemplateModel", $this->db);
		$form = $this->_getAllParams();
		$req = $this->getRequest();
		if(!$req->isPost()) {
			echo json_encode(array("status" => false, "result" => array("不正な遷移です")));
			exit;
		}

		echo $model->sendMail($form["recipient"], $form["id"]);
		exit;
	}
}