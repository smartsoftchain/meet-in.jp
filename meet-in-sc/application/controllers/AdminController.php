<?php

require_once APP_DIR.'/models/Adapter/AuthAdapter.php';
require_once ROOT.'library/Application/validation.php';

// 権限
define('ROLE_ADM', 1); // 管理者
define('ROLE_EMP', 2); // 社員
define('ROLE_PRT', 3); // アルバイト

class AdminController extends AbstractController
{
	const ROLE_ADM = "AA_1";
	
	public function init(){
		parent::init();
		/* Initialize action controller here */
		
		// ログインチェック
		$auth = Zend_Auth::getInstance();
		if($auth->hasIdentity() == true){
	
			// 認証情報取出し
			$user = $auth->getIdentity();
	
//			// 管理者以外ははじく
//			if($user['staff_role'] != self::ROLE_ADM){
//				// AA管理者以外ならはじく
//				$auth = Zend_Auth::getInstance();
//				$auth->clearIdentity();
//				Zend_Session::destroy();
//				$this->_redirect('/admin/index');
//			}
		}else{
			$form = $this->_getAllParams();
			if($form['action'] != 'index' && $form['action'] != 'login'){
				$this->_redirect('/index');
			}
		}
	}
	
	/**
	 * インデックス画面
	 */
	public function indexAction(){
		$this->view->is_login_page = true;
	}
	
	/**
	 * ログイン処理
	 */
	public function loginAction(){
		$form = $this->_getAllParams();
		
		// 入力チェック
		$filters = array(
				'id' => 'StringTrim',
				'password' => 'StringTrim',
		);
		$validators = array(
				'id' => array(
						array('NotEmpty'),
						'messages' => array(
								'IDを入力してください',
						)
				),
				'password' => array(
						array('NotEmpty'),
						'messages' => array(
								'パスワードを入力してください',
						)
				),
		);
		// バリデーション実行
		$result = new Zend_Filter_Input($filters, $validators, $form);
		if(false == $result->isValid()){
			$this->view->errors = $result->getMessages();
			$this->render('/index');
			return;
		}
		
		$auth = Zend_Auth::getInstance();
		$adapter = new Adapter_AuthAdapter($form);
		$result = $auth->authenticate($adapter);
	
		if($result->isValid() == false){
			$this->view->errors = $result->getMessages();
			$this->render('/index');
			return;
		}
		$user = $auth->getIdentity();
		$this->_redirect('/admin/menu');
	}
	
	/**
	 * ログアウト画面
	 */
	public function logoutAction(){
		// セッション情報を初期化する
		$auth = Zend_Auth::getInstance();
		$auth->clearIdentity();
		Zend_Session::destroy();
		// ログイン画面へ遷移する
		$this->_redirect('/admin/index');
	}
	
	/**
	 * メニュー表示
	 */
	public function menuAction(){
	}
	/**
	 * 担当者一覧
	 */
	public function aggregateListAction() {
		if (!parent::isSpecialStaff()) {
			$this->_redirect('/index/menu');
		}
		$form = $this->_getAllParams();
		// モデル宣言
		$adminModel = Application_CommonUtil::getInstance("model", "AdminModel", $this->db);
		// 画面表示に必要なデータを取得
		$result = $adminModel->getConnectionInfoList($form, $this->namespace);
		$this->view->list = $result["list"];
	}
	/**
	 * 担当者一覧
	 */
	public function staffListAction(){
		$this->authCheckStaffList();
		$form = $this->_getAllParams();
		// モデル宣言
		$adminModel = Application_CommonUtil::getInstance("model", "AdminModel", $this->db);
		// 画面表示に必要なデータを取得
//		$result = $adminModel->getAAStaffList($form, $this->namespace);
		$result = $adminModel->getStaffList($form, $this->namespace);
		$this->view->list = $result["list"];
		$this->view->free_word = $this->namespace->free_word;
		$this->view->registMsg = $result["registMsg"];
		$staffDict = array();
		$staffDict["staff_type"] = $form["staff_type"];
		$staffDict["client_id"] = $form["client_id"];
		$staffDict["addURL"] = "staff_type=" . $form["staff_type"] . "&client_id=" . $form["client_id"];
		$this->view->staffDict = $staffDict;
		$pram = array();
		if (!empty($form["staff_type"])) {
			$pram["staff_type"] = $form["staff_type"];
		}
		if (!empty($form["client_id"])) {
			$pram["client_id"] = $form["client_id"];
		}
		$this->view->pram = $pram;
	}
	
	/**
	 * 担当者一覧
	 */
	public function clientEditAction(){
		$this->authCheckClient();
		$form = $this->_getAllParams();
		$request = $this->getRequest();
		$form["staff_type"] = "CE";
		// モデル宣言
		$adminClientModel = Application_CommonUtil::getInstance("model", "AdminClientModel", $this->db);
		// 画面表示に必要なデータを取得
		$result = $adminClientModel->clientRegist($form, $request);
		if($result["registCompleteFlg"] == 1){
			// 登録完了の場合は一覧へ遷移
			$this->_redirect("/admin/client-edit?client_id={$result["client_id"]}&ret={$result["ret"]}");
		}
		$this->view->clientDict = $result["clientDict"];
		$this->view->aaStaffListJson = $result["aaStaffListJson"];
		$this->view->checkAAStaffListJson = $result["checkAAStaffListJson"];
		$this->view->errorList = $result["errorList"];

//		$this->authCheckStaffList();
//		$form = $this->_getAllParams();
		
		// モデル宣言
		$adminModel = Application_CommonUtil::getInstance("model", "AdminModel", $this->db);
		// 画面表示に必要なデータを取得
//		$result = $adminModel->getAAStaffList($form, $this->namespace);
		$result = $adminModel->getStaffList($form, $this->namespace);
		$this->view->list = $result["list"];
		$this->view->free_word = $this->namespace->free_word;
		$this->view->registMsg = $result["registMsg"];
		$staffDict = array();
		$staffDict["staff_type"] = $form["staff_type"];
		$staffDict["client_id"] = $form["client_id"];
		$staffDict["addURL"] = "staff_type=" . $form["staff_type"] . "&client_id=" . $form["client_id"];
		$this->view->staffDict = $staffDict;
		$pram = array();
		if (!empty($form["staff_type"])) {
			$pram["staff_type"] = $form["staff_type"];
		}
		if (!empty($form["client_id"])) {
			$pram["client_id"] = $form["client_id"];
		}
		if (!empty($form["ret"])) {
			$pram["ret"] = $form["ret"];
		}
		$this->view->pram = $pram;
	}
	
	/**
	 * クライアントの担当スタッフ一覧取得
	 */
	public function getClientStaffListAction() {
		$this->authCheckStaffList();
		$form = $this->_getAllParams();
		$result = array();
		
		// dao
		$masterStaffDao = Application_CommonUtil::getInstance('dao', "MasterStaffDao", $this->db);
		$condition = " staff_type = 'AA' ";
		$result = $masterStaffDao->getSelectMasterStaffAllList($condition, "staff_id", "asc");
		echo json_encode($result);
		exit;
	}
	/**
	 * クライアント登録画面
	 */
	public function clientEditoneAction(){
		$form = $this->_getAllParams();
		$request = $this->getRequest();
		
		// モデル宣言
		$adminClientModel = Application_CommonUtil::getInstance("model", "AdminClientModel", $this->db);
		// 画面表示に必要なデータを取得
		$result = $adminClientModel->clientRegistOne($form, $request);

		echo $result;
		exit;
	}
	
	/**
	 * 担当者登録画面
	 */
	public function staffRegistAction(){
		$this->authCheckStaffRegist();
		$form = $this->_getAllParams();
		$request = $this->getRequest();
		$ret = array();
		$ret["top"] = "0";
		if (array_key_exists("ret", $form) && $form["ret"] == "top") {
			$ret["top"] = "1";
		}
		// モデル宣言
		$adminModel = Application_CommonUtil::getInstance("model", "AdminModel", $this->db);
		// 画面表示に必要なデータを取得
		$result = $adminModel->staffRegist($form, $request);
		if($result["registCompleteFlg"] == 1){
			$act = "";
			// 登録完了
			if ($this->user["staff_type"] == $result["staffDict"]["staff_type"] && $this->user["staff_id"] == $result["staffDict"]["staff_id"]) {
				// 自アカウントの編集
				if (($this->user["staff_type"] == "AA") && (empty($this->user["client_id"]) || $this->user["client_id"] == 0)) {
					// AAアカウントでかつクライアント未選択時
					$act = "/client/list";
				} else {
					// AAアカウント以外
					$act = "/index/menu";
				}
			} else {
				// 他アカウントの編集
				$act = "/admin/staff-list?staff_type={$result["staffDict"]['staff_type']}&client_id={$form['client_id']}";
			}
			$this->_redirect('' . $act);
		}
		$this->view->staffDict = $result["staffDict"];
		$this->view->errorList = $result["errorList"];
		$this->view->ret = $ret["top"];
		
//		$this->view->payment_type_select = $adminModel->getPaymentTypeSelectBox();
	}
	
	/**
	 * 担当者登録画面
	 */
	public function staffRegistoneAction(){
		$form = $this->_getAllParams();
		$request = $this->getRequest();
		
		// モデル宣言
		$adminModel = Application_CommonUtil::getInstance("model", "AdminModel", $this->db);
		// 画面表示に必要なデータを取得
		$result = $adminModel->staffRegistOne($form, $request);

		echo $result;
		exit;
	}
	
	/**
	 * 担当者削除の共通処理
	 */
	public function staffDeleteAction(){
		$this->authCheckStaffList();
		$form = $this->_getAllParams();
		$request = $this->getRequest();
		// モデル宣言
		$adminModel = Application_CommonUtil::getInstance("model", "AdminModel", $this->db);
		$result = $adminModel->staffDelete($form, $request);
		echo $result;
	}

	/**
	 * クライアント一覧画面
	 */
	public function clientListAction(){
		$this->authCheckClient();
		$form = $this->_getAllParams();
		
		// モデル宣言
		$adminClientModel = Application_CommonUtil::getInstance("model", "AdminClientModel", $this->db);
		// 画面表示に必要なデータを取得
		$result = $adminClientModel->getClientList($form, $this->namespace);
		$this->view->list = $result["list"];
		$this->view->free_word = $this->namespace->free_word;
		$this->view->registMsg = $result["registMsg"];
	}
	
	
	/**
	 * クライアント登録画面
	 */
	public function clientRegistAction(){
		$this->authCheckClient();
		$form = $this->_getAllParams();
		$request = $this->getRequest();
		
		// モデル宣言
		$adminClientModel = Application_CommonUtil::getInstance("model", "AdminClientModel", $this->db);
		// 画面表示に必要なデータを取得
		$result = $adminClientModel->clientRegist($form, $request);
		if($result["registCompleteFlg"] == 1){
			// 登録完了の場合は一覧へ遷移
			$this->_redirect('/admin/client-list');
		}
		$this->view->clientDict = $result["clientDict"];
		$this->view->clientCategoryList = $result["clientCategoryList"];
		$this->view->clientServiceList = $result["clientServiceList"];
		$this->view->businessCategory1 = $result["businessCategory1"];
		$this->view->businessCategory1Json = $result["businessCategory1Json"];
		$this->view->aaStaffListJson = $result["aaStaffListJson"];
		$this->view->checkAAStaffListJson = $result["checkAAStaffListJson"];
		$this->view->errorList = $result["errorList"];
	}
	
	/**
	 * クライアント削除処理
	 */
	public function clientDeleteAction(){
		$this->authCheckClient();
		$form = $this->_getAllParams();
		$request = $this->getRequest();
		// モデル宣言
		$adminClientModel = Application_CommonUtil::getInstance("model", "AdminClientModel", $this->db);
		$result = $adminClientModel->clientDelete($form, $request);
		echo $result;
	}

	/**
	 * クライアント担当者一覧
	 */
	public function clientStaffListAction(){
		$this->authCheckClient();
		$form = $this->_getAllParams();
		
		// モデル宣言
		$adminModel = Application_CommonUtil::getInstance("model", "AdminModel", $this->db);
		// 画面表示に必要なデータを取得
		$result = $adminModel->getCEStaffList($form, $this->namespace);
		$this->view->list = $result["list"];
		$this->view->free_word = $this->namespace->free_word;
		$this->view->registMsg = $result["registMsg"];
	}
	
	/**
	 * クライアント担当者登録画面
	 */
	public function clientStaffRegistAction(){
		$this->authCheckClient();
		$form = $this->_getAllParams();
		$request = $this->getRequest();
		
		// モデル宣言
		$adminModel = Application_CommonUtil::getInstance("model", "AdminModel", $this->db);
		// 画面表示に必要なデータを取得
		$result = $adminModel->clientStaffRegist($form, $request);
		if($result["registCompleteFlg"] == 1){
			// 登録完了の場合は一覧へ遷移
			$this->_redirect("/admin/client-staff-list?client_id={$result["client_id"]}");
		}
		$this->view->clientStaffDict = $result["clientStaffDict"];
		$this->view->errorList = $result["errorList"];
		
		$this->view->payment_type_select = $adminModel->getPaymentTypeSelectBox();
	}
	
	public function authCheckStaffList(){
		$prm = $this->_getAllParams();

		// 認証
		if ($this->user['staff_type'] == "AA" ) {
		} else if ($this->user['staff_type'] == "CE") {
		} else {
			// 不正アクセスの場合
			$this->_redirect('/index/menu');
		}
	}
	
	public function authCheckStaffRegist(){
		$prm = $this->_getAllParams();

		// 認証
		if ($this->user['staff_type'] == "AA" && $user['staff_role'] != self::ROLE_ADM) {
		} else if ($prm['staff_type'] == $this->user['staff_type'] &&
					$prm['staff_id'] == $this->user['staff_id'] ) {
		} else {
			// 不正アクセスの場合
			$this->_redirect('/index/menu');
		}
	}
	
	public function authCheckClient(){
		$prm = $this->_getAllParams();

		// 認証
		if ($this->user['staff_type'] == "AA" ) {
		} else if ($prm['client_id'] == $this->user['client_id']) {
		} else {
			// 不正アクセスの場合
			$this->_redirect('/index/menu');
		}
	}
	public function materialListAction(){
		$this->authCheckStaffList();
		$form = $this->_getAllParams();

		$adminModel = Application_CommonUtil::getInstance("model", "AdminModel", $this->db);
		$result = $adminModel->getMaterialList($form, $this->namespace);
		$this->view->list = $result["list"];
	}
	public function materialEditAction(){
		$this->authCheckStaffList();
		$form = $this->_getAllParams();
		$request = $this->getRequest();

		$adminModel = Application_CommonUtil::getInstance("model", "AdminModel", $this->db);
		$result = $adminModel->editMaterial($form, $request);
		$this->view->material = $result["material"];
		$this->view->errorList = $result["errorList"];
		if($request->isPost()) {
			// 登録・更新
			if(empty($result["errorList"])) {
				// エラーがなければ一覧に戻る
				$this->_redirect('/admin/material-list');
			} else {
				// エラーがあれば編集画面のまま
				$this->view->material = $form;
			}
		}
	}
	public function materialDetailEditAction(){
		$this->authCheckStaffList();
		$form = $this->_getAllParams();

		$adminModel = Application_CommonUtil::getInstance("model", "AdminModel", $this->db);
		$result = $adminModel->getMaterialDetailList($form);
		$this->view->material = $result["material"];
		$this->view->materialDetailList = $result["list"];
		$this->view->errorList = $result["errorList"];
	}
	public function deleteMaterialAction(){
		$form = $this->_getAllParams();
		$request = $this->getRequest();
		$result = array();
		$adminModel = Application_CommonUtil::getInstance("model", "AdminModel", $this->db);
		$result = $adminModel->deleteMaterial($form,$request);
		echo json_encode($result);
		exit;
	}
	public function deleteMaterialDetailPageAction() {
		$form = $this->_getAllParams();
		$request = $this->getRequest();
		$result = array();
		$adminModel = Application_CommonUtil::getInstance("model", "AdminModel", $this->db);
		$result = $adminModel->deleteMaterialDetailPage($form,$request);
		echo json_encode($result);
		exit;
	}
	public function getMaterialDetailAction(){
		$form = $this->_getAllParams();
		$request = $this->getRequest();

		$result = array();
		$adminModel = Application_CommonUtil::getInstance("model", "AdminModel", $this->db);
		$result = $adminModel->getMaterialDetail($form,$request);
		echo json_encode($result);
		exit;
	}
	public function setMaterialDetailAction(){
		$form = $this->_getAllParams();
		$request = $this->getRequest();

		$result = array();
		$adminModel = Application_CommonUtil::getInstance("model", "AdminModel", $this->db);
		$result = $adminModel->setMaterialDetail($form,$request);
		echo json_encode($result);
		exit;
	}
	public function setMaterialDetailPageAction() {
		$form = $this->_getAllParams();
		$request = $this->getRequest();
		error_log(json_encode($form));
		$result = array();
		$adminModel = Application_CommonUtil::getInstance("model", "AdminModel", $this->db);
		$result = $adminModel->swapMaterialDetailPage($form,$request);
		echo json_encode($result);
		exit;
	}
	public function checkStaffPasswordAction(){
		$form = $this->_getAllParams();
		$request = $this->getRequest();
		$result = array();
		$adminModel = Application_CommonUtil::getInstance("model", "AdminModel", $this->db);
		$result = $adminModel->checkStaffPassword($form,$request);
		echo json_encode($result);
		exit;
	}
	public function authLoginStaff($param = array()) {
		if(!isset($this->user["staff_type"]) || empty($this->user["staff_type"])) {
			return false;
		}
		if(is_array($param['staff_type'])) {
			foreach($param['staff_type'] as $staff_type) {
				if($this->user["staff_type"] == $staff_type) {
					return true;
				}
			}
		}
		return false;
	}
	public function negotiationTmplListAction() {
		// クライアントIDがない場合はindex/menu
		$form = $this->_getAllParams();
		if (!$this->authLoginStaff(array("staff_type" => array("AA", "CE"))) || ($this->user["client_id"] == 0)) {
			if($this->user["staff_type"] == "AA") {
				$this->_redirect('/client/list');
			} else {
				$this->_redirect('/index/menu');
			}
		}
		if(!empty($this->user["client_id"])) {
			$form["client_id"] = $this->user["client_id"];
		}
		// モデル宣言
		$adminModel = Application_CommonUtil::getInstance("model", "AdminModel", $this->db);
		$result = $adminModel->getNegotiationTmplList($form, $this->namespace);
		$this->view->list = $result["list"];
		$this->view->free_word = $this->namespace->free_word;
		$this->view->registMsg = $result["registMsg"];
		if (array_key_exists("srt", $form)) {
			$this->view->srt = $form["srt"];
		} else {
			$this->view->srt = "";
		}
	}
	public function negotiationTmplEditAction() {
		// クライアントIDがない場合はindex/menu
		if (!$this->authLoginStaff(array("staff_type" => array("AA", "CE"))) ||
				($this->user["client_id"] == 0)) {
			if($this->user["staff_type"] == "AA") {
				$this->_redirect('/client/list');
			} else {
				$this->_redirect('/index/menu');
			}
		}
		$form = $this->_getAllParams();
		$request = $this->getRequest();
		// モデル宣言
		$adminModel = Application_CommonUtil::getInstance("model", "AdminModel", $this->db);
		$result = $adminModel->editNegotiationTmpl($form, $request);
		$this->view->tmpl = $result["tmpl"];
		if(!empty($result["tmpl"]["result_list"])) {
			$this->view->tmpl_result_list = json_decode($result["tmpl"]["result_list"]);
		}
		if(!empty($result["tmpl"]["next_action_list"])) {
			$this->view->tmpl_next_action_list = json_decode($result["tmpl"]["next_action_list"]);
		}

		$this->view->errorList = $result["errorList"];
		if($request->isPost()) {
			// 登録・更新
			if(empty($result["errorList"])) {
				// エラーがなければ一覧に戻る
				$this->_redirect("/admin/negotiation-tmpl-list");
			} else {
				// エラーがあれば編集画面のまま
				$this->view->tmpl = $form;
			}
		}
	}
	public function negotiationTmplDeleteAction() {
		$result = array();
		if(!$this->authLoginStaff(array("staff_type" => array("AA", "CE"))) || $this->user["client_id"] == 0) {
			echo json_encode($result);
			exit;
		}
		$form = $this->_getAllParams();
		$adminModel = Application_CommonUtil::getInstance("model", "AdminModel", $this->db);
		$result = $adminModel->deleteNegotiationTmpl($form, $request);
		echo json_encode($result);
		exit;
	}
	public function embedLinkPublishAction() {
		// クライアントIDがない場合はindex/menu
		$form = $this->_getAllParams();
		if (!$this->authLoginStaff(array("staff_type" => array("AA", "CE"))) || ($this->user["client_id"] == 0)) {
			if($this->user["staff_type"] == "AA") {
				$this->_redirect('/client/list');
			} else {
				$this->_redirect('/index/menu');
			}
		}
		if(!empty($this->user["client_id"])) {
			$form["client_id"] = $this->user["client_id"];
		}
	}

	/**
	 * 名刺データアップロード
	 * 名刺データを一時フォルダーへ保存する
	 */
	public function namecardSaveAction(){
		$form = $this->_getAllParams();
//error_log("START:".print_r($form,true)."\n", 3, "/var/tmp/negotiation.log");
		
//	//画像の拡張子を取得
//	$file_ext = pathinfo($_FILES['namecard_file']['name']);
//error_log("file_ext[".print_r($file_ext,true)."]\n", 3, "/var/tmp/negotiation.log");
//error_log("_FILES['namecard_file']".print_r($_FILES['file'],true)."]\n", 3, "/var/tmp/negotiation.log");

		// 名刺データ（namecard_file）
		$namecardImgPath = null;
		$namecardImgPath = $this->tempPhotoFile(array(
			"files" => "namecard_file",
			"staff_type" => $form['staff_type'],
			"staff_id" => $form['staff_id'],
			"client_id" => $form['namecard_client_id'],

			"document_root" => $_SERVER['DOCUMENT_ROOT'],
			"upload_dir" => "/img/tmp_namecard"
		));

		$result = array();
		// 処理結果（0=失敗, 1=成功）
		$result["status"] = 1;
		// 一時ファイル
		$result["filename"] = $namecardImgPath;

//		header('Content-Type: application/json');
		header("Access-Control-Allow-Origin: *");
		echo json_encode($result);

//error_log("RETURN:".print_r($result,true)."]\n", 3, "/var/tmp/negotiation.log");
		exit;
	}

	/**
	 * 画像一時保存
	 * ※アップロード画像を一時保存しURL(パス)を返す
	 */
	private function tempPhotoFile($param) {

		if(isset($_FILES[$param['files']]) && $_FILES[$param['files']]["error"] == 0) {
			error_log(json_encode($_FILES[$param['files']]));
			
			// 一時ファイル名(client_id)が存在しない場合は、ファイル名に含めない
			$tempFile = "{$param['upload_dir']}/{$param['staff_type']}_{$param['staff_id']}_{$param['client_id']}";
//error_log("tempFile[".$tempFile."]\n", 3, "/var/tmp/negotiation.log");

			//画像の拡張子を取得
			$file_ext = pathinfo($_FILES[$param['files']]['name']);
			// UPロードされた画像の拡張子
			$ext = $file_ext[extension];

			// UPロードされた一時画像のファイル名
			$tmp = $_FILES[$param["files"]]['tmp_name'];
//error_log("tmp[".$tmp."]\n", 3, "/var/tmp/negotiation.log");

			if(is_uploaded_file($tmp)) {
				// 一時アップロードディレクトリが存在しない場合は作成
				$directory_path = "{$param['document_root']}{$param['upload_dir']}";
				//「$directory_path」で指定されたディレクトリが存在するか確認
				if( !file_exists($directory_path) ){
					//存在しない場合
					if(mkdir($directory_path, 0777)) {
						chmod($directory_path, 0777);
					}else{
						//作成に失敗した時の処理
						error_log('ディレクトリ作成に失敗しました');
					}
				}

				// 元ファイルを削除
				$delete_files = "{$param['document_root']}{$param['upload_dir']}{$tempFile}.*";
//error_log("delete_files[".$delete_files."]\n", 3, "/var/tmp/negotiation.log");
				foreach(glob($delete_files) as $file) {
					error_log($file);
					unlink($file);
				}
				$filename = "{$tempFile}.{$ext}";
				$fullfile = "{$param['document_root']}{$tempFile}.{$ext}";
//error_log("fullfile[".$fullfile."]\n", 3, "/var/tmp/negotiation.log");
//error_log("return[".$filename."]\n", 3, "/var/tmp/negotiation.log");
				if(move_uploaded_file($tmp, $fullfile)) {
					error_log('temp-data move_uploaded_file success');
					return $filename;
				}
				return $filename;
			}
		}
		null;
	}

}
