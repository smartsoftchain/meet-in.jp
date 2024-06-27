<?php

// require_once ROOT.'library/Application/validation.php';

class EContractApiController extends AbstractController
{

//   const IDENTIFIER = "e_contract_api";
//   const API_URI = "https://api.staging-0001.rakuraku.nishigaki-dev.work/";
//   const IMAGICK_FILTER = Imagick::FILTER_BLACKMAN;

//   const IMAGICK_BLUR_VERTICAL = 0.7;
//   const IMAGICK_BLUR_HORIZONTAL = 0.7;
//   const IMAGICK_BLUR = 1.0;

//   public function init(){
//     parent::init();
//   }

//   /***
//   * 電子契約書テンプレート
//   * /e-contract-api/templates
//   * GET 電子契約テンプレート一覧
//   ***/
//   public function templatesAction() {
//     $this->authCheckStaffList();
//     $form = $this->_getAllParams();

//     // モデル宣言
//     $eContractApiModel = Application_CommonUtil::getInstance("model", "EContractApiModel", $this->db);
//     $result = $eContractApiModel->getDocumentList($form, $this->namespace);

//     $this->view->list = $result["list"];
//   }

//   /***
//   * 電子契約書テンプレート
//   * /e-contract-api/delete-document
//   * GET 電子契約テンプレート削除
//   ***/
//   public function deleteDocumentAction() {
//     $form = $this->_getAllParams();
//     $request = $this->getRequest();
//     $result = array();

//     // モデル宣言
//     $eContractApiModel = Application_CommonUtil::getInstance("model", "EContractApiModel", $this->db);
//     $result = $eContractApiModel->deleteDocument($form, $request);
//     echo json_encode($result);
//     exit;
//   }

//   /***
//   * 電子契約書テンプレート
//   * /e-contract-api/files
//   * GET 契約書ファイルアップロードページ
//   ***/
//   public function filesAction()
//   {

//     $this->authCheckStaffList();
//     $form = $this->_getAllParams();
//     $request = $this->getRequest();

//     // モデル宣言
//     $eContractApiModel = Application_CommonUtil::getInstance("model", "EContractApiModel", $this->db);

//     if($request->isPost()) {
//       // １ページ目から２ページ目へ移動.
//       $result = $eContractApiModel->editMaterial($form, $request);
//       if(empty($result["errorList"])) {
//         //  入力を保存に問題がなければ ２ページ目へ移動.
//         $this->_redirect('/e-contract-api/forms?id=' . $result["document"]["document_id"]);
//       } else {
//         $this->view->document  = $result["document"];
//         $this->view->errorList = $result["errorList"];
//       }
//     }

//     if(isset($form['id'])) {

//       // バリデーション GET値を操作されていないか.
//       $validation[] = is_numeric($form["id"]) && 0 < $form["id"];
//       if(in_array(false, $validation)){
//           $this->_redirect('/index/menu');
//       }

//       $result = $eContractApiModel->getFileDetailList($form);

//       // URLを操作した不正な閲覧の場合.
//       if($result["document"]["client_id"] != $this->user["client_id"] && $this->user['staff_type'] != "AA") {
//         $this->setLog("電子契約 電子契約契約書詳細 不正操作", json_encode($form));
//         $this->_redirect('/index/menu');
//       }

//       $this->view->addressList = $result['addressList'];
//       $form['e_contract_document_id'] = $result["document"]['id'];
//       $form['template_name']          = $result["document"]['name'];
//     }
//     $this->view->material = $form;

//   }


//   /***
//   * 電子契約書テンプレート
//   * /e-contract-api/forms?id=***
//   * GET 契約書に印影、テキストエリア、チェックボックスの配置画面
//   ***/
//   public function formsAction() {
//     $this->authCheckStaffList();
//     $form = $this->_getAllParams();

//     // バリデーション GET値を操作されていないか.
//     $validation[] = is_numeric($form["id"]) && 0 < $form["id"];
//     if(in_array(false, $validation)){
//         $this->_redirect('/index/menu');
//     }

//     // モデル宣言
//     $eContractApiModel = Application_CommonUtil::getInstance("model", "EContractApiModel", $this->db);
//     $result = $eContractApiModel->getFileDetailList($form);

//     // URLを操作した不正な閲覧の場合.
//     if($result["document"]["client_id"] != $this->user["client_id"] && $this->user['staff_type'] != "AA") {
//       $this->setLog("電子契約 電子契約契約書詳細 不正操作", json_encode($form));
//       $this->_redirect('/index/menu');
//     }

//     $this->view->document = $result["document"];
//     $this->view->fileList = $result["fileList"];
//     $this->view->materialList = $result["materialList"];
//     $this->view->formList = $result["formList"];
//   }

//   /***
//   * 電子契約書テンプレート
//   * /e-contract-api/regist-form
//   * POST フォームデータ登録
//   ***/
//   public function registFormAction() {
//     $form = $this->_getAllParams();
//     $req = $this->getRequest();

//     // 操作ログ
//     $this->setLog("電子契約 フォーム登録", json_encode($form));
//     // モデル宣言
//     $eContractApiModel = Application_CommonUtil::getInstance("model", "EContractApiModel", $this->db);

//     // POST
//     if($req->isPost()) {
//       $this->db->beginTransaction();
//       try {
//         $result = $eContractApiModel->creareForm($form);
//         $this->db->commit();
//         echo json_encode($result);
//         exit;
//       } catch(Exception $e) {
//         $this->db->rollBack();
//         error_log($e->getMessage());
//         throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
//       }
//     }
//   }


//   /***
//   * 電子契約書テンプレート
//   * /e-contract-api/delete-form
//   * POST フォームデータ削除
//   ***/
//   public function deleteFormAction() {
//     $form = $this->_getAllParams();
//     $req = $this->getRequest();

//     // 操作ログ
//     $this->setLog("電子契約 フォーム削除", json_encode($form));
//     // モデル宣言
//     $eContractApiModel = Application_CommonUtil::getInstance("model", "EContractApiModel", $this->db);

//     // POST
//     if($req->isPost()) {
//       $this->db->beginTransaction();
//       try {
//         $result = $eContractApiModel->deleteForm($form);
//         $this->db->commit();
//         echo json_encode($result);
//         exit;
//       } catch(Exception $e) {
//         $this->db->rollBack();
//         error_log($e->getMessage());
//         throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
//       }
//     }
//   }

//   /***
//   * 電子契約書テンプレート
//   * /e-contract-api/update-form
//   * POST フォームデータ更新
//   ***/
//   public function updateFormAction() {
//     $form = $this->_getAllParams();
//     $req = $this->getRequest();

//     // 操作ログ
//     $this->setLog("電子契約 フォーム更新", json_encode($form));
//     // モデル宣言
//     $eContractApiModel = Application_CommonUtil::getInstance("model", "EContractApiModel", $this->db);

//     // POST
//     if($req->isPost()) {
//       $this->db->beginTransaction();
//       try {
//         $result = $eContractApiModel->updateForm($form);
//         $this->db->commit();
//         echo json_encode($result);
//         exit;
//       } catch(Exception $e) {
//         $this->db->rollBack();
//         error_log($e->getMessage());
//         throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
//       }
//     }
//   }

//   /***
//   * 電子契約書テンプレート
//   * /e-contract-api/template-confirm?id=***
//   * GET 契約書テンプレート登録前の確認画面
//   ***/
//   public function templateConfirmAction() {
//     $this->authCheckStaffList();
//     $form = $this->_getAllParams();

//     // バリデーション GET値を操作されていないか.
//     $validation[] = is_numeric($form["id"]) && 0 < $form["id"];
//     if(in_array(false, $validation)){
//         $this->_redirect('/index/menu');
//     }

//     // モデル宣言
//     $eContractApiModel = Application_CommonUtil::getInstance("model", "EContractApiModel", $this->db);
//     $result = $eContractApiModel->getFileDetailList($form);

//     // URLを操作した不正な閲覧の場合.
//     if($result["document"]["client_id"] != $this->user["client_id"] && $this->user['staff_type'] != "AA") {
//       $this->setLog("電子契約 電子契約契約書詳細 不正操作", json_encode($form));
//       $this->_redirect('/index/menu');
//     }

//     $this->view->document = $result["document"];
//     $this->view->fileList = $result["fileList"];
//     $this->view->materialList = $result["materialList"];
//     $this->view->formList = $result["formList"];
//     $this->view->addressList  = $result["addressList"];

//   }

//   /***
//   * 電子契約書
//   * /e-contract-api/partners
//   * GET 電子契約宛先の設定
//   ***/
//   public function partnersAction() {
//     $this->authCheckStaffList();
//     $form = $this->_getAllParams();
//     $request = $this->getRequest();

//     // セッションを取得
//     $session = Application_CommonUtil::getSession(self::IDENTIFIER);
//     // モデル宣言
//     $eContractApiModel = Application_CommonUtil::getInstance("model", "EContractApiModel", $this->db);

//     if($form["id"]) {

//       // バリデーション GET値を操作されていないか.
//       $validation[] = is_numeric($form["id"]) && 0 < $form["id"];
//       if(in_array(false, $validation)){
//           $this->_redirect('/index/menu');
//       }

//       $result = $eContractApiModel->getPartnerList($form, false);

//       // URLを操作した不正な閲覧の場合　特に 完成した契約書を開き「入力者設定へ」を押されると 入力済みのパーツを初期化(↓下記分岐 editPartner())することからデータが壊れる為許可しない.
//       if($result["case"]["is_done"] || $result["case"]["client_id"] != $this->user["client_id"] && $this->user['staff_type'] != "AA") {
//         $this->setLog("電子契約 電子契約契約書詳細 不正操作", json_encode($form));
//         $this->_redirect('/index/menu');
//       }


//       $this->view->case = $result["case"];
//       $this->view->partnerList = $result["partnerList"];
//     }

//     $documentList = $eContractApiModel->getDocumentAllList();
//     $this->view->documentList = $documentList;

//     if($request->isPost()) {
//       // 案件、パートナー、資料を登録
//       $result = $eContractApiModel->editPartner($form, $request);
//       $this->view->partner = $result["partner"];
//       $this->view->errorList = $result["errorList"];

//       // 登録・更新
//       if(empty($result["errorList"])) {
//         // ルーム内契約（Ajax）の場合
//         if(isset($_SERVER['HTTP_X_REQUESTED_WITH']) && (strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest')) {
//           echo $result["case"]["case_id"];
//           exit;
//         } else {
//           // エラーがなければ一覧に戻る
//           $this->_redirect('/e-contract-api/inputs?id=' . $result["case"]["case_id"]);
//         }
//       } else {
//         // エラーがあれば編集画面のまま
//         $this->view->material = $form;
//       }
//     }
//   }

//   /***
//   * 電子契約書
//   * /e-contract-api/get-address-list
//   * GET 電子契約宛先の取得
//   ***/
//   public function getAddressListAction() {
//     $form = $this->_getAllParams();
//     $eContractApiModel = Application_CommonUtil::getInstance("model", "EContractApiModel", $this->db);
//     $result = $eContractApiModel->getEContractAddressList($form['id']);
//     echo json_encode($result);
//     exit;
//   }

//   /***
//    * 電子契約書
//    * /e-contract-api/get-tag-list
//    */
//   public function getTagListAction() {
//     $form = $this->_getAllParams();
//     $eContractApiModel = Application_CommonUtil::getInstance("model", "EContractApiModel", $this->db);
//     $result = $eContractApiModel->getEContractTagList($form['param']);
//     echo json_encode($result);
//     exit;
//   }

//   /**
//    * 電子契約書タグの保存
//    * /e-contract-api/set-contract-tag
//    */
//   public function setContractTagAction() {
//     $form = $this->_getAllParams();

//     // タグを登録する
//     $tagCount = count($form['tags']);

//     $eContractTagDao = Application_CommonUtil::getInstance('dao', "EContractTagDao", $this->db);

//     $eContractTagCondition = "e_contract_case_id = {$form['id']}";
//     $eContractTagDao->delete($eContractTagCondition);

//     // パートナー情報を登録する

//       try {
//         $this->db->beginTransaction();
//           for ($i=0; $i<$tagCount; $i++) {
//               // アクセストークン作成
//               $params['e_contract_case_id'] = $form['id'];
//               $params['name'] = $form['tags'][$i];
//               $params['create_date'] = new Zend_Db_Expr('now()');
//               $params['update_date'] = new Zend_Db_Expr('now()');
//               $eContractTagDao->insert($params);
//           }
//           $this->db->commit();
//       }catch(Exception $e) {
//           $this->db->rollback();
//       }
//     echo json_encode(['status' => 'success']);
//     exit;
//   }


//   /***
//   * 電子契約書
//   * /e-contract-api/inputs?id=***
//   * GET 契約書に印影、テキストエリア、チェックボックスの入力者設定画面
//   ***/
//   public function inputsAction() {
//     $this->authCheckStaffList();

//     $form = $this->_getAllParams();
//     // バリデーション GET値を操作されていないか.
//     $validation[] = is_numeric($form["id"]) && 0 < $form["id"];
//     if(in_array(false, $validation)){
//         $this->_redirect('/index/menu');
//     }

//     $request = $this->getRequest();

//     // モデル宣言
//     $eContractApiModel = Application_CommonUtil::getInstance("model", "EContractApiModel", $this->db);

//     // ファイルを差し替え.
//     if($form['change_material_file']) {
//       $result = $eContractApiModel->replacementMaterial($form, $request);
//       echo json_encode($result);
//       exit;
//     }

//     // ルーム内契約（Ajax）の場合
//     if(isset($_SERVER['HTTP_X_REQUESTED_WITH']) && (strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest')) {

//       // 案件とパートナー、契約書データ、フォームデータを取得
//       $result = $eContractApiModel->getPartnerList($form, true);

//       echo json_encode($result);
//       exit;
//     } else {

//       // 案件とパートナー、契約書データ、フォームデータを取得
//       $result = $eContractApiModel->getPartnerList($form, false);

//       // URLを操作した不正な閲覧の場合 特に完成した契約書を開かれると 契約後のデータに未入力のパーツを置かれるなどデータの整合性が崩れる為許可しない.
//       if($result["case"]["is_done"] || $result["case"]["client_id"] != $this->user["client_id"] && $this->user['staff_type'] != "AA") {
//         $this->setLog("電子契約 電子契約契約書詳細 不正操作", json_encode($form));
//         $this->_redirect('/index/menu');
//       }

//       $this->view->case = $result["case"];
//       $this->view->partnerList = $result["partnerList"];
//       $this->view->fileList = $result["fileList"];
//       $this->view->materialList = $result["materialList"];
//       $this->view->formList = $result["formList"];
//       $this->view->inputList = $result["inputList"];
//     }
//   }


//   /***
//   * 電子契約書
//   * /e-contract-api/regist-input
//   * POST インプット領域登録
//   ***/
//   public function registInputAction() {
//     $form = $this->_getAllParams();
//     $req = $this->getRequest();

//     // 操作ログ
//     $this->setLog("電子契約 フォーム登録", json_encode($form));
//     // モデル宣言
//     $eContractApiModel = Application_CommonUtil::getInstance("model", "EContractApiModel", $this->db);

//     // POST
//     if($req->isPost()) {
//       $this->db->beginTransaction();
//       try {
//         $result = $eContractApiModel->creareInput($form);
//         $this->db->commit();

//       } catch(Exception $e) {
//         $this->db->rollBack();
//         error_log($e->getMessage());
//         throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
//       }
//     }
//     echo json_encode($result);
//     exit;
//   }


//   /***
//   * 電子契約書 パーツ(複数ページから呼び出し).
//   * /e-contract-api/set-input
//   * POST入力者の登録、更新
//   ***/
//   public function setInputAction() {
//     $form = $this->_getAllParams();
//     $req = $this->getRequest();

//     // 操作ログ
//     $this->setLog("電子契約 入力者の登録、更新", json_encode($form));
//     // モデル宣言
//     $eContractApiModel = Application_CommonUtil::getInstance("model", "EContractApiModel", $this->db);

//     // フォーム情報を取得
//     $formRow = $eContractApiModel->getFormRow($form);

//     // POST
//     if($req->isPost()) {
//       $this->db->beginTransaction();
//       try {
//         $result = $eContractApiModel->setInput($form, $formRow);
//         $this->db->commit();
//         echo json_encode($result);
//         exit;
//       } catch(Exception $e) {
//         $this->db->rollBack();
//         error_log($e->getMessage());
//         throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
//       }
//     }
//   }

//   /**
//   * 電子契約書 パーツ(複数ページから呼び出し).
//   * /e-contract-api/delete-input
//   * POST フォームデータ削除
//   ***/
//   public function deleteInputAction() {
//     $form = $this->_getAllParams();
//     $req = $this->getRequest();

//     // 操作ログ
//     $this->setLog("電子契約 インプット削除", json_encode($form));
//     // モデル宣言
//     $eContractApiModel = Application_CommonUtil::getInstance("model", "EContractApiModel", $this->db);

//     // POST
//     if($req->isPost()) {
//       $this->db->beginTransaction();
//       try {
//         $result = $eContractApiModel->deleteInput($form);
//         $this->db->commit();
//         echo json_encode($result);
//         exit;
//       } catch(Exception $e) {
//         $this->db->rollBack();
//         error_log($e->getMessage());
//         throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
//       }
//     }
//   }

//   /***
//   * 電子契約書
//   * /e-contract-api/confirm?id=***
//   * GET 電子契約送信前確認画面
//   ***/
//   public function confirmAction() {
//     $this->authCheckStaffList();
//     $form = $this->_getAllParams();
//     // バリデーション GET値を操作されていないか.
//     $validation[] = is_numeric($form["id"]) && 0 < $form["id"];
//     if(in_array(false, $validation)){
//         $this->_redirect('/index/menu');
//     }

//     $request = $this->getRequest();

//     // 操作ログ
//     $this->setLog("電子契約 送信前確認画面", json_encode($form));
//     // モデル宣言
//     $eContractApiModel = Application_CommonUtil::getInstance("model", "EContractApiModel", $this->db);

//     // 案件とパートナー、契約書データ、フォームデータを取得
//     $result = $eContractApiModel->getContractList($form);

//     // URLを操作した不正な閲覧の場合  特に 完成した契約書を開いた場合 [再送信]されてしまう為許可しない.
//     if($result["case"]["is_done"] || $result["case"]["client_id"] != $this->user["client_id"] && $this->user['staff_type'] != "AA") {
//       $this->setLog("電子契約 電子契約契約書詳細 不正操作", json_encode($form));
//       $this->_redirect('/index/menu');
//     }

//     // ルーム内契約（Ajax）の場合
//     if(isset($_SERVER['HTTP_X_REQUESTED_WITH']) && (strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest')) {
//       echo json_encode($result);
//       exit;
//     } else {
//       $this->view->case = $result["case"];
//       $this->view->document = $result["document"];
//       $this->view->partnerList = $result["partnerList"];
//       $this->view->fileList = $result["fileList"];
//       $this->view->materialList = $result["materialList"];
//       $this->view->formList = $result["formList"];
//     }
//   }

//   /***
//   * 電子契約書
//   * /e-contract-api/send-approval-request
//   * POST パートナーに承認依頼メールを送信する
//   ***/
//   public function sendApprovalRequestAction() {
//     $form = $this->_getAllParams();
//     $req = $this->getRequest();

//     // 操作ログ
//     $this->setLog("電子契約 パートナーに承認依頼メールを送信", json_encode($form));
//     // モデル宣言
//     $eContractApiModel = Application_CommonUtil::getInstance("model", "EContractApiModel", $this->db);

//     // POST
//     if($req->isPost()) {
//       $result = $eContractApiModel->sendApprovalRequest($form);
//       echo json_encode($result);
//       exit;
//     }
//   }

//   /***
//   * 電子契約書
//   * /e-contract-api/sent
//   * GET 電子契約送信完了画面
//   ***/
//   public function sentAction() {
//     $this->authCheckStaffList();
//     // 操作ログ
//     $this->setLog("電子契約 送信完了画面", json_encode($form));
//   }

//   /***
//   * /e-contract-api/confirming
//   * GET 確認中電子契約一覧
//   ***/
//   public function confirmingAction() {
//     $this->authCheckStaffList();
//     $form = $this->_getAllParams();

//     $eContractApiModel = Application_CommonUtil::getInstance("model", "EContractApiModel", $this->db);
//     $result = $eContractApiModel->getConfirmingList($form, $this->namespace);

//     $this->view->list = $result["list"];
//     $this->view->completedCount = $result["completedCount"];
//     $this->view->canceledCount = $result["canceledCount"];
//   }

//   /***
//   * /e-contract-api/partner-confirming
//   * GET ゲスト確認中電子契約一覧
//   ***/
//   public function partnerConfirmingAction() {
//     $form = $this->_getAllParams();

//     $eContractApiModel = Application_CommonUtil::getInstance("model", "EContractApiModel", $this->db);
//     $result = $eContractApiModel->getPartnerConfirmingList($form, $this->namespace);

//     $this->view->list = $result["list"];
//     $this->view->completedCount = $result["completedCount"];
//     $this->view->canceledCount = $result["canceledCount"];
//   }

//   /***
//   * /e-contract-api/completed
//   * GET 締結済み電子契約一覧
//   ***/
//   public function completedAction() {
//     $this->authCheckStaffList();
//     $form = $this->_getAllParams();

//     $eContractApiModel = Application_CommonUtil::getInstance("model", "EContractApiModel", $this->db);
//     $result = $eContractApiModel->getCompletedList($form, $this->namespace);

//     $this->view->list = $result["list"];
//     $this->view->confirmingCount = $result["confirmingCount"];
//     $this->view->canceledCount = $result["canceledCount"];
//   }

//   /***
//   * /e-contract-api/completed-file-download
//   * GET 締結済み電子契約一覧
//   ***/
//   public function completedFileDownloadAction() {

//     $this->authCheckStaffList();
//     $form = $this->_getAllParams();

//     // バリデーション GET値を操作されていないか.
//     $validation = preg_replace('/[,0-9]/s', '', $form["id"]);
//     if(strlen($form["id"]) == 0 || 0 < strlen($form["id"]) && 0 < strlen($validation)) {
//         $this->setLog("電子契約 電子契約書の一括ダウンロード 不正操作", json_encode($form));
//         $this->_redirect('/index/menu');
//     }

//     // Daoの宣言
//     $eContractCaseDao = Application_CommonUtil::getInstance('dao', "EContractCaseDao", $this->db);

//     // GET値を操作することで自社以外の契約書を取得することが出来る為、ユーザのclient_idのみの絞り込みを固定で行うことでハッキング対策とする.
//     $rows = $eContractCaseDao->getCaseAll(sprintf('uid != "" AND id in (%s) AND client_id = %s', $form["id"], $this->user['client_id']));
//     if(0 == count($rows)) {
//       $this->_redirect('/e-contract-api/completed');
//     }

//     // 操作ログ
//     $this->setLog("電子契約 電子契約書の一括ダウンロード", json_encode($form));

//     // ダウンロードファイルの作成 １件はPDFのまま 複数件はZIPデータにする.
//     $PDF_FILE_FORMAT = '/mnt/datastore/e_contract_documents/%s/%s.pdf';
//     $ZIP_TMP_PATH    = '/tmp/completed_e_contract_documents.zip';
//     if(1 == count($rows)) {

//       $PDF_FILE_PATH = sprintf($PDF_FILE_FORMAT, $rows[0]['client_id'], $rows[0]['uid']);
//       header(sprintf("Content-Disposition: attachment; filename=%s.pdf", $rows[0]['uid']));
//       readfile($PDF_FILE_PATH);

//     } else {

//       $zip = new ZipArchive;
//       $res = $zip->open($ZIP_TMP_PATH, ZipArchive::CREATE);
//       if ($res === TRUE) {
//           foreach($rows as $row) {
//             $PDF_FILE_PATH = sprintf($PDF_FILE_FORMAT, $row['client_id'], $row['uid']);
//             $zip->addFile($PDF_FILE_PATH, sprintf("%s.pdf",$row['uid']));
//           }
//           $zip->close();

//           header("Content-Type: application/zip");
//           header("Content-Transfer-Encoding: Binary");
//           header("Content-Length: ".filesize($ZIP_TMP_PATH));
//           header('Content-Disposition: attachment; filename*=UTF-8\'\'' . 'e_contract_documents.zip');
//           ob_end_clean();
//           readfile($ZIP_TMP_PATH);
//           unlink($ZIP_TMP_PATH);
//       }
//     }

//   }


//   /***
//   * /e-contract-api/partner-completed
//   * GET ゲスト締結済み電子契約一覧
//   ***/
//   public function partnerCompletedAction() {
//     $form = $this->_getAllParams();

//     $eContractApiModel = Application_CommonUtil::getInstance("model", "EContractApiModel", $this->db);
//     $result = $eContractApiModel->getPartnerCompletedList($form, $this->namespace);

//     $this->view->list = $result["list"];
//     $this->view->confirmingCount = $result["confirmingCount"];
//     $this->view->canceledCount = $result["canceledCount"];
//   }

//   /***
//   * /e-contract-api/canceled
//   * GET 却下電子契約一覧
//   ***/
//   public function canceledAction() {
//     $this->authCheckStaffList();
//     $form = $this->_getAllParams();

//     $eContractApiModel = Application_CommonUtil::getInstance("model", "EContractApiModel", $this->db);
//     $result = $eContractApiModel->getCanceledList($form, $this->namespace);

//     $this->view->list = $result["list"];
//     $this->view->confirmingCount = $result["confirmingCount"];
//     $this->view->completedCount = $result["completedCount"];
//   }

//   /***
//   * /e-contract-api/partner-canceled
//   * GET ゲスト却下電子契約一覧
//   ***/
//   public function partnerCanceledAction() {
//     $form = $this->_getAllParams();

//     $eContractApiModel = Application_CommonUtil::getInstance("model", "EContractApiModel", $this->db);
//     $result = $eContractApiModel->getPartnerCanceledList($form, $this->namespace);

//     $this->view->list = $result["list"];
//     $this->view->confirmingCount = $result["confirmingCount"];
//     $this->view->completedCount = $result["completedCount"];
//   }

//   /***
//   * /e-contract-api/detail?id=***
//   * GET  電子契約契約書詳細
//   ***/
//   public function detailAction() {
//     $form = $this->_getAllParams();
//     $request = $this->getRequest();


//     // バリデーション GET値を操作されていないか.
//     $validation[] = is_numeric($form["id"]) && 0 < $form["id"];
//     if(in_array(false, $validation)){
//         $this->_redirect('/index/menu');
//     }

//     // $this->authCheckStaffList();
//     if($this->user['staff_type'] != "AA" && $this->user['staff_type'] != "CE") {

//       // Daoの宣言
//       $eContractCaseDao = Application_CommonUtil::getInstance('dao', "EContractCaseDao", $this->db);

//       // セッション取得
//       $session = Application_CommonUtil::getSession(self::IDENTIFIER);

//       // ゲスト承認者のメールアドレスとパスワードが正しいかチェック
//       $condition = "email = '" . $session->partnerEmail . "' AND password = '" . md5($session->partnerPassword) . "'";
//       $count = $eContractCaseDao->getCaseCountWithPartner($form["id"], $session->partnerEmail);
//       if($count == '0') {
//         $this->_redirect('/index/menu');
//       }

//     }

//     // モデル宣言
//     $eContractApiModel = Application_CommonUtil::getInstance("model", "EContractApiModel", $this->db);

//     // 案件とパートナー、契約書データ、フォームデータを取得
//     $result = $eContractApiModel->getContractList($form);

//     // 削除済みの電子契約書の場合 Webアプリケーションである以上、ブラウザの「お気に入り」に登録されるなどで削除後にURLを開かれる可能性を考慮する.
//     if($result["case"]["delete_date"] != null) {
//       $this->_redirect('/index/menu');
//     }

//     // 操作ログ
//     $this->setLog("電子契約 電子契約契約書詳細", json_encode($form));


//     // ゲストログイン関係の セッション取得
//     $session = Application_CommonUtil::getSession('e_contract_api');

//     // MEMO.
//     // e-contract-api/partner-confirming　からの遷移 = ゲストが署名後、署名付きPDFを閲覧しににきた場合を想定した関係者かの確認.
//     // 署名者リストと、ゲストのログイン時の入力したemail値と比較.
//     $is_partner = in_array($session->partnerEmail , array_column($result["partnerList"], 'email'));

//     // URLを操作した不正な閲覧の場合.
//     if(!$is_partner && $result["case"]["client_id"] != $this->user["client_id"] && $this->user['staff_type'] != "AA") {
//       $this->setLog("電子契約 電子契約契約書詳細 不正操作", json_encode($form));
//       $this->_redirect('/index/menu');
//     }

//     $approvedCount = 0;
//     $rejectedCount = 0;
//     foreach ($result["partnerList"] as $partner) {
//       if($partner['approval_status'] == 1) {
//         $approvedCount++;
//       } elseif($partner['approval_status'] == 2) {
//         $rejectedCount++;
//       }
//     }

//     // タグの取得
//     // Daoの宣言
//     $eContractTagDao = Application_CommonUtil::getInstance('dao', "EContractTagDao", $this->db);
//     $tags = $eContractTagDao->find("e_contract_case_id = {$form["id"]}"); 
//     $tmpTags = [];
//     foreach($tags as $tag) {
//       $tmpTags[] = $tag['name'] ;
//     }
//     $this->view->tags = $tmpTags;
//     $this->view->case = $result["case"];
//     $this->view->document = $result["document"];
//     $this->view->partnerList = $result["partnerList"];
//     $this->view->fileList = $result["fileList"];
//     $this->view->materialList = $result["materialList"];
//     $this->view->formList = $result["formList"];
//     $this->view->approvedCount = $approvedCount;
//     $this->view->rejectedCount = $rejectedCount;
//     $this->view->resendFlg = 0;
//     $this->view->referer_url = $_SERVER['HTTP_REFERER'];
//   }

//   /***
//   * /e-contract-api/resend-approval-request
//   * POST パートナーに承認依頼メールを再送信する
//   ***/
//   public function resendApprovalRequestAction() {
//     $form = $this->_getAllParams();
//     $req = $this->getRequest();

//     // 操作ログ
//     $this->setLog("電子契約 パートナーに承認依頼メールを再送信する", json_encode($form));
//     // モデル宣言
//     $eContractApiModel = Application_CommonUtil::getInstance("model", "EContractApiModel", $this->db);

//     // POST
//     if($req->isPost()) {
//       $result = $eContractApiModel->resendApprovalRequest($form);
//       echo json_encode($result);
//       exit;
//     }
//   }

//   /***
//   * /e-contract-api/delete-contract
//   * POST 詳細ページ 電子契約書を論理削除を行う
//   ***/
//   public function deleteContractAction() {
//     $form = $this->_getAllParams();
//     $req = $this->getRequest();

//     // 操作ログ
//     if($this->user == null) {
//       // ゲストが JSを解析して強引に電子契約書を消そうとした不正行為の疑いあり.
//       $this->setLog("電子契約 電子契約書の論理削除を未ログインで実行", json_encode($form));
//       echo json_encode(['error' => "-1", "message" => 'ログイン情報が見つかりませんでした']);
//       exit;
//     } elseif(isset($form["document_id"]) && !ctype_digit($form["document_id"])) {
//       echo json_encode(['error' => "-2", "message" => '不正なパラメータを検知致しました']);
//       $this->setLog("電子契約 電子契約書の論理削除 不正なパラメータの検知", json_encode($form));
//       exit;
//     }

//     // モデル宣言
//     $eContractApiModel = Application_CommonUtil::getInstance("model", "EContractApiModel", $this->db);

//     // POST
//     if($req->isPost()) {
//       $result = $eContractApiModel->deleteContractList($form);
//       echo json_encode(['error' => $result]);
//       $this->setLog("電子契約 電子契約書の論理削除", json_encode($form));
//       exit;
//     }
//   }


//   /***
//   * /e-contract-api/auth?token=***
//   * GET  ゲスト承認メール認証画面
//   ***/
//   public function authAction() {
//     $form = $this->_getAllParams();
//     $request = $this->getRequest();
//     // 操作ログ
//     $this->setLog("電子契約 ゲスト承認メール認証画面", json_encode($form));
//     // モデル宣言
//     $eContractApiModel = Application_CommonUtil::getInstance("model", "EContractApiModel", $this->db);

//     // メールアドレスが正しいかチェックする
//     $result = $eContractApiModel->checkPartnerEmail2($form, $request);

//     // SPの場合
//     if(boolval($this->isMobile()) && $form['approval_method']) {
//       $this->_redirect('/e-contract-api/deprecated-auth');
//     }

//     // メールアドレス認証が通ったら承認ページへ移動
//     if($result['authFlg'] == 1) {
//       // セッションを取得
//       $session = Application_CommonUtil::getSession(self::IDENTIFIER);
//       // 承認者メールアドレスとトークン、IDをセッションに保持
//       $session->partnerEmail = $form['email'];
//       $session->partnerToken = $form['token'];
//       $session->partnerId = $result['partnerId'];

//       // 有効期限は12時間
//       $session->setExpirationSeconds(43200, 'partnerEmail');
//       $session->setExpirationSeconds(43200, 'partnerToken');
//       $session->setExpirationSeconds(43200, 'partnerId');

//       // 二要素認証が指定されてる場合
//       if ($result['approvalMethod'] == 1) {
//         // MEMO. この段階でログインユーザならスキップ
//         // 過去に認証登録済みの場合はパスワード入力、新規の場合はパスワード設定
//         if (is_null($this->user)) {
//           if (!empty($result['authenticatedPartner'])) {
//             $this->_redirect('/e-contract-api/password-input');
//           } else {
//             $this->_redirect('/e-contract-api/password-regist');
//           }
//         }
//       }

//       $this->_redirect('/e-contract-api/sign');
//       if(isset($_GET['error'])){
//         $result['error'] = $_GET['error'];
//       }

//     }

//     $this->view->token = $form["token"];
//     $this->view->error = $result['error'];
//     $this->view->approvalMethod = $form['approval_method'];
//   }

//   /**
//    * /e-contract-api/deprecated-auth
//    * SPの非推奨ページ
//   */
//   public function deprecatedAuthAction() {
//     // 操作ログ
//     $this->setLog("電子契約　非推奨環境エラー", json_encode($this->_getAllParams()));

//     // パラメータを取得
//     $auth = $this->getRequest()->getQuery('auth');

//     $this->view->auth = $auth;
//     $this->view->host = $_SERVER["HTTP_HOST"];

//   }

//   /**
//    * /e-contract-api/password-input
//    * 承認者パスワード入力画面
//   */
//   public function passwordInputAction() {
//     $form = $this->_getAllParams();
//     $req = $this->getRequest();
//     // セッションを取得
//     $session = Application_CommonUtil::getSession(self::IDENTIFIER);
//     // 操作ログ
//     $this->setLog("電子契約 パスワード入力画面", json_encode($form));
//     // モデル宣言
//     $eContractApiModel = Application_CommonUtil::getInstance("model", "EContractApiModel", $this->db);

//     // 直リンク対策
//     if (empty($session->partnerEmail) || empty($session->partnerToken)) {
//       $this->_redirect('/index');
//     }
//     if ($this->user) {
//       $this->_redirect('/e-contract-api/sign');
//     }

//     $result = $eContractApiModel->checkPartnerPassword($form, $req);
//     // 認証が通ったら契約書を表示
//     if(empty($result['error']) && $result['authFlg'] == 1) {
//       // 二要素認証済みフラグがセッションに保持されている期間はスキップする
//       if($session->partnerAuthenticateFlg == 1) {
//         $this->_redirect('/e-contract-api/sign');
//       } else {
//         $this->_redirect("/e-contract-api/authenticate");
//       }
//     }

//     $this->view->email = $session->partnerEmail;
//     $this->view->error = $result['error'];
//   }

//   /**
//    * /e-contract-api/password-regist
//    * 承認者パスワード登録画面
//   */
//   public function passwordRegistAction() {
//     $form = $this->_getAllParams();
//     $req = $this->getRequest();
//     // セッションを取得
//     $session = Application_CommonUtil::getSession(self::IDENTIFIER);
//     // 操作ログ
//     $this->setLog("電子契約 パスワード登録画面", json_encode($form));
//     // モデル宣言
//     $eContractApiModel = Application_CommonUtil::getInstance("model", "EContractApiModel", $this->db);

//     // 直リンク対策
//     if (empty($session->partnerEmail) || empty($session->partnerToken)) {
//       $this->_redirect('/index');
//     }
//     if ($this->user) {
//       $this->_redirect('/e-contract-api/sign');
//     }

//     if ($req->isPost()) {

//       // 入力チェック
//       if(empty($form["password"])) {
//         $errorList[] = "パスワードが未入力です";
//       } else if(strlen($form["password"]) < 8) {
//         $errorList[] = "パスワードが8文字より小さいです";
//       } else if(!preg_match("/^[a-zA-Z0-9]+$/", $form["password"])) {
//         $errorList[] = "パスワードは半角英数字です。";
//       }

//       if (count($errorList) == 0) {
//         // パートナー情報取得
//         $partner = $eContractApiModel->getPartner2($session->partnerEmail, $session->partnerToken);
//         if (empty($partner)) {
//           $errorList[] = "パスワード設定する承認者情報が見当たりません";
//         }
//         // パスワードを登録
//         $result = $eContractApiModel->setPassword($partner, $form['password']);

//         if ($result) {
//           $this->_redirect('/e-contract-api/authenticate');
//         }
//       }
//       $this->view->errorList = $errorList;
//     }

//   }

//   /**
//    * /e-contract-api/password-reminder
//    * パスワードリマインダー
//   */
//   public function passwordReminderAction() {
//     $form = $this->_getAllParams();
//     $req = $this->getRequest();
//     // セッションを取得
//     $session = Application_CommonUtil::getSession(self::IDENTIFIER);
//     // 操作ログ
//     $this->setLog("電子契約　リマインダー画面表示", json_encode($this->_getAllParams()));
//     // モデル宣言
//     $eContractApiModel = Application_CommonUtil::getInstance("model", "EContractApiModel", $this->db);

//     if (empty($session->partnerId)) {
//       $this->_redirect('/index');
//     }

//     if($req->isPost()) {
//       $result = $eContractApiModel->sendMailReminderAccount($form, $req);
//       if(empty($result["errorList"])) {
//         return $this->_redirect('/index');
//       }
//       $this->view->errors = $result["errorList"];
//     }
//     $this->view->partnerId = $session->partnerId;
//   }

//   /**
//    * /e-contract-api/activate
//    * パスワード再設定
//   */
//   public function activateAction() {
//     $form = $this->_getAllParams();
// 		$req = $this->getRequest();
//     // 操作ログ
//     $this->setLog("電子契約　アクティベーション画面表示", json_encode($this->_getAllParams()));
//     // モデル宣言
//     $eContractApiModel = Application_CommonUtil::getInstance("model", "EContractApiModel", $this->db);
//     $adminModel = Application_CommonUtil::getInstance('model', "AdminModel", $this->db);

//     if($req->isPost()) {
//       // パスワード変更
//       $result = $eContractApiModel->activateStaff($form, $req);

//       if($result['staffDict']['actFlg'] == 1) {
//         // パスワード入力画面へ
//         $this->_redirect('/e-contract-api/password-input');
//       }
//     } else {
//       // アクティベーション画面表示の条件
//       if(!isset($form["id"]) || empty($form["id"]) || !preg_match('/[0-9a-zA-Z]{32}/', $form["id"])) {
//         $this->_redirect('/index');
//       }
//       $result = $adminModel->getActivationStaff($form, $req);
//       if(empty($result["staffDict"])) {
//         $this->_redirect('/index');
//       }
//       $this->view->staffDict = $result["staffDict"];
//     }
//   }

//   /**
//    * /e-contract-api/authenticate
//    * QRコード認証画面　（電子契約承認前の本人認証に使用）
//   */
//   public function authenticateAction() {
//       $form = $this->_getAllParams();
//       $req = $this->getRequest();
//       // セッションを取得
//       $session = Application_CommonUtil::getSession(self::IDENTIFIER);
//       // モデル宣言
//       $authenticateInfoModel = Application_CommonUtil::getInstance("model", "AuthenticateInfoModel", $this->db);
//       $eContractApiModel = Application_CommonUtil::getInstance("model", "EContractApiModel", $this->db);

//       if($session->partnerId == '') {
//         $this->_redirect('/index');
//       }
//       $form['staff_id'] = $session->partnerId;
//       $form['staff_type'] = "DD"; //MEMO. 認証用アカウントとしての振る舞いをさせる

//       if ($req->isPost()) {
//         $result = $authenticateInfoModel->verifyCode($form, $req);

//         if ($result) {
//           // パートナー情報の二要素認証フラグを更新
//           $eContractApiModel->setAuthenticateState($session->partnerId);
//           // 認証フラグをセッションに保持
//           $session->partnerAuthenticateFlg = 1;
//           // 有効期限は12時間
//           $session->setExpirationSeconds(43200, 'partnerAuthenticateFlg');

//           $this->_redirect('/e-contract-api/sign');
//         } else {
//           // QRコード再表示
//           $result = $authenticateInfoModel->getAuthenticate($form);
//           $result['error'] = '不正な認証コードです。再度QRコードを読み取ってください。';
//         }

//       } else {
//         $result = $authenticateInfoModel->getAuthenticate($form);
//         // 認証済みの場合
//         if ($result['varify_flg'] == 1) {
//           $this->_redirect('/e-contract-api/sign');
//         }
//         if ($result['qrUrl'] == '') {
//           $result['error'] = 'QRコードの取得に失敗しました。';
//         }
//       }
//       $this->view->qrUrl = $result['qrUrl'];
//       $this->view->error = $result['error'];
//   }


//   /***
//   * /e-contract-api/sign
//   * GET  パートナー承認画面
//   ***/
//   public function signAction() {
//     $form = $this->_getAllParams();
//     $request = $this->getRequest();
//     // セッションを取得
//     $session = Application_CommonUtil::getSession(self::IDENTIFIER);
//     // 操作ログ
//     $this->setLog("電子契約 パートナー承認画面", json_encode($form));
//     // モデル宣言
//     $eContractApiModel = Application_CommonUtil::getInstance("model", "EContractApiModel", $this->db);

//     // URL操作での直リンク対策.
//     $check = $eContractApiModel->checkPartnerEmail2(["email" => $session->partnerEmail, "token" => $session->partnerToken], $request, true);
//     if($check['error']!=""){
//       $this->_redirect('/e-contract-api/auth?token='.$session->partnerToken.'&error='.$check['error']);
//     }

//     // パートナーデータを取得
//     $partner = $eContractApiModel->getPartner2($session->partnerEmail, $session->partnerToken);

//     // パートナーの持つ契約書データ、フォームデータを取得
//     $result = $eContractApiModel->getPartnerHasInputList($partner);

//     // 取り消された契約書を開こうとした場合.
//     if($result["case"]["delete_date"] != NULL) {
//       $this->_redirect('/e-contract-api/auth?token='.$session->partnerToken); // 有効な契約書ではない承認画面へ追い出す.
//     }

//     // クレデンシャルを発行する
//     $credential = $eContractApiModel->getCredentialToPartner($result["case"]["client_id"]);

//     $this->view->partner = $partner;
//     $this->view->case = $result["case"];
//     $this->view->fileList = $result["fileList"];
//     $this->view->materialList = $result["materialList"];
//     $this->view->formList = $result["formList"];
//     $this->view->formCount = $result["formCount"];
//     $this->view->credential = $credential["body"]["credential"];
//     $this->view->partnerToken = $session->partnerToken;
//   }

//   /***
//   * /e-contract-api/value-input
//   * POST  インプットの更新
//   ***/
//   public function valueInputAction() {
//     $form = $this->_getAllParams();
//     $req = $this->getRequest();

//     // モデル宣言
//     $eContractApiModel = Application_CommonUtil::getInstance("model", "EContractApiModel", $this->db);

//     // フォーム情報を取得
//     $inputRow = $eContractApiModel->getInputRow($form);

//     // POST
//     if($req->isPost()) {
//       $this->db->beginTransaction();
//       try {
//         $result = $eContractApiModel->valueInput($form, $inputRow);
//         $this->db->commit();
//         echo json_encode($result);
//         exit;
//       } catch(Exception $e) {
//         $this->db->rollBack();
//         error_log($e->getMessage());
//         throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
//       }
//     }
//   }

//   /***
//   * /e-contract-api/check-credential
//   * GET 電子契約証明書発行状況を取得する
//   ***/
//   public function checkCredentialAction() {

//     $result['is_e_conteact_credential'] = 0;
//     $result['is_e_conteact_sign_image'] = 0;
//     $result['is_e_conteact_certificate'] = 0;

//     // 電子契約証明書が発行されている場合はフラグを立てる
//     $session = Application_CommonUtil::getSession('e_contract_api');
//     if($session->credential) {
//       $result['is_e_conteact_credential'] = 1;
//     }
//     if($session->signImage) {
//       $result['is_e_conteact_sign_image'] = 1;
//     }
//     if($session->certificate) {
//       $result['is_e_conteact_certificate'] = 1;
//     }

//     echo json_encode($result);
//     exit;
//   }

//   /***
//   * /e-contract-api/approval-and-next
//   * POST 承認して次の承認者へメールを送信する
//   ***/
//   public function approvalAndNextAction() {
//     $form = $this->_getAllParams();
//     $req = $this->getRequest();

//     // 操作ログ
//     $this->setLog("電子契約 承認して次の承認者へメールを送信", json_encode($form));
//     // モデル宣言
//     $eContractApiModel = Application_CommonUtil::getInstance("model", "EContractApiModel", $this->db);
//     $eContractCaseDao = Application_CommonUtil::getInstance('dao', "EContractCaseDao", $this->db);

//     // POST
//     if($req->isPost()) {

//       $caseCondition = "id = {$form["case_id"]}";
//       $case = $eContractCaseDao->getCase($caseCondition);
//       // 削除済みの契約書の場合は処理を中断する.
//       if($case["delete_date"] !== null) {
//         echo json_encode(["status" => "delete"]);
//         exit;
//       }

//       $result = $eContractApiModel->approvalAndNext($form);
//       echo json_encode($result);
//       exit;
//     }
//   }

//   /***
//   * /e-contract-api/reject
//   * POST 却下して全員へ却下メールを送信する
//   ***/
//   public function rejectAction() {
//     $form = $this->_getAllParams();
//     $req = $this->getRequest();

//     // 操作ログ
//     $this->setLog("電子契約 却下して全員へ却下メールを送信する", json_encode($form));
//     // モデル宣言
//     $eContractApiModel = Application_CommonUtil::getInstance("model", "EContractApiModel", $this->db);
//     $eContractCaseDao = Application_CommonUtil::getInstance('dao', "EContractCaseDao", $this->db);
//     // POST
//     if($req->isPost()) {

//       $caseCondition = "id = {$form["case_id"]}";
//       $case = $eContractCaseDao->getCase($caseCondition);
//       // 削除済みの契約書の場合は処理を中断する.
//       if($case["delete_date"] !== null) {
//         echo json_encode(["status" => "delete"]);
//         exit;
//       }

//       $result = $eContractApiModel->reject($form);
//       echo json_encode($result);
//       exit;
//     }
//   }

//   /***
//   * /e-contract-api/rejected
//   * GET 却下完了画面
//   ***/
//   public function rejectedAction() {
//     // 操作ログ
//     $form = $this->_getAllParams();
//     $this->setLog("電子契約 却下完了画面", json_encode($form));
//   }

//   /***
//   * /e-contract-api/approved
//   * GET 承認完了画面
//   ***/
//   public function approvedAction() {
//     // 操作ログ
//     $form = $this->_getAllParams();
//     $this->setLog("電子契約 承認完了画面", json_encode($form));
//   }

//   /***
//   * /e-contract-api/contracted
//   * GET 契約完了画面
//   ***/
//   public function contractedAction() {
//     // 操作ログ
//     $form = $this->_getAllParams();
//     $this->setLog("電子契約 契約完了画面", json_encode($form));
//   }

//   /***
//   * /e-contract-api/pdf?id=1
//   * 電子契約書作成テスト.
//   ***/
// //  public function pdfAction() {
// //
// //    ini_set('xdebug.var_display_max_children', -1);
// //    ini_set('xdebug.var_display_max_data', -1);
// //    ini_set('xdebug.var_display_max_depth', -1);
// //
// //    $form = $this->_getAllParams(); // いちいちコードを書き換えるのが面倒だから  GET渡しで case_id を指定する.
// //    $form["case_id"] = $form["id"];
// //    // var_dump($form); exit;
// //
// //    $resut = $this->makeEContractPDF($form, true);
// //    header("Content-Disposition: attachment; filename=download.pdf");
// //    readfile($resut['documents'][0]['path']);
// //  }


//   /*
//    *  電子契約書PDFと、電子署名付き印影を押したPDFを取得するためのパラメータを作成する.
//    */
//   private function makeEContractPDF($form, $isDebug = false) {

//     // モデル宣言
//     $eContractApiModel = Application_CommonUtil::getInstance("model", "EContractApiModel", $this->db);
//     $eContractPartnerDao = Application_CommonUtil::getInstance('dao', "EContractPartnerDao", $this->db);

//     // 契約、承認者、フォームデータを取得
//     $data = $eContractApiModel->getContractData($form["case_id"]);

//     // 契約情報
//     $postDict['params']['name']                                       = $data['case']['case_title'];
//     if($data['case']['have_amount'] == '0') {
//       $postDict['params']['haveAmount']                               = false;
//     } else {
//       $postDict['params']['haveAmount']                               = true;
//     }
//     $postDict['params']['amount']                                     = intval(($data['case']['amount'] === NULL) ? "" : $data['case']['amount']);
//     $postDict['params']['agreementDate']                              = ($data['case']['agreement_date'] === NULL) ? "" : $data['case']['agreement_date'];
//     $postDict['params']['effectiveDate']                              = ($data['case']['effective_date'] === NULL) ? "" : $data['case']['effective_date'];
//     $postDict['params']['expireDate']                                 = ($data['case']['expire_date'] === NULL) ? "" : $data['case']['expire_date'];
//     if($data['case']['auto_renewal'] == '0') {
//       $postDict['params']['autoRenewal']                              = false;
//     } else {
//       $postDict['params']['autoRenewal']                              = true;
//     }
//     $postDict['params']['managementNumber']                           = $data['case']['management_number'];
//     $postDict['params']['comment']                                    = $data['case']['comment'];


//     // 契約書ドキュメント
//     $postDict['documents'][0]['idx']   = 0;
//     $postDict['documents'][0]['title'] = $data['fileList'][0]['title'];
//     $postDict['documents'][0]['name']  = $data['fileList'][0]['name'];
//     $postDict['documents'][0]['type']  = $data['fileList'][0]['type'];

//     try {

//       // MEMO.
//       // らくらく電子APIは、２つしか印影をつけることができない. 仕様で連立で何人も署名出来る為、２つ以上の印影が必要になる場合もあるがそれは出来ない、
//       // ３つ目以降の印影は、APIがエンドユーザに署名させるまでの流れで、サンプルで作成した「電子署名効果なし印影」を流用してPDFに埋め込み「それっぽくみせる」.
//       $set_self_sign    = $isDebug ? true : false; // APIに処理させる２つの印影のうち オーナの印影.
//       $set_partner_sign = $isDebug ? true : false; // APIに処理させる２つの印影のうち パートナーの印影.

//       // フォームを組み合わせたPDFを作成
//       // $originalDocumentDir = $this->config->file->original_document->path;
//       // 開発用path
//       $originalDocumentDir = 'cmn-e-contract';
//       $jpgFiles = '';
//       foreach($data['fileDetailList'] as $i => $fileDetail) {
//         // jpgデータ
//         $documentDetail = new Imagick("{$originalDocumentDir}/{$fileDetail['filename']}");

//         $fileSize = getimagesize("{$originalDocumentDir}/{$fileDetail['filename']}");

//         // MEMO.
//         // 契約書の用紙の長い辺が 2000px程度のA4だろうが、3000pxを越えるB4用紙だろうが.
//         // 以下のサイズのサムネイル画面でエンドユーザに入力させるので、用紙のサイズの解像度に合わせて計算してPDFにする必要がある.
//         // 計算式は サムネイルサイズと契約書原寸サイズの連立方程式で計算.
//         // サムネイル横用紙 718 1016.
//         // サムネイル縦用紙 718 508.
//         // 尚、 上記のサイズは フロントの電子契約書作成2ページ目の入力HTMLのCSSのサムネイル表示.
//         // そちらのIMG表示サイズのCSSをいじったらこの計算式の値も変えること!(CSSデザインが処理の計算を狂わせる) ※ ルーム内電子契約書機能にも同じく入力HTMLがある点 留意. 

//         $sheet_width  = 0;
//         $sheet_height = 0;
//         if($fileSize[0] <= $fileSize[1]) {
//           $sheet_width  = 718;
//           $sheet_height = 1016;
//         } else {
//           $sheet_width  = 718;
//           $sheet_height = 508;
//         }

//         // フォーム合成
//         foreach($data['formList'] as $fi => $_form) {
//           if($_form['page'] == $i + 1) {
//             if($_form['type'] == 'text' || $_form['type'] == 'textarea') {
//               // テキスト合成
//               $draw = new ImagickDraw();
//               $string = $_form['value'];

//               $tmp_font_size = ($fileSize[1] * intval($_form['font_size'])) / $sheet_height;


//               $draw->setFontSize($tmp_font_size);
//               $draw->setFillColor('#222222');
//               $draw->setFont('./fonts/ipaexm.ttf');

//               // MEMO. 計算式のうちの微調整値は、インターフェースの帯からのCSS 的な margin や padding で生じたズレの補正.
//               $tmp_x = ($fileSize[0] * (intval($_form['x'])+20)) / $sheet_width;
//               $tmp_y = ($fileSize[1] * (intval($_form['y'])+16+intval($_form['font_size']))) / $sheet_height; // ffont_sizeで勝手に付く行間のズレを計算に含めた.

//               $draw->annotation($tmp_x, $tmp_y, $string);
//               $documentDetail->drawImage($draw);
//             } elseif($_form['type'] == 'checkbox') {

//               // MEMO.
//               // チェックボックスには 「入力を必須にする」で 必須か否かを設定出来る為 img_dataが 空のケースは未入力としスルーする.
//               if(strlen($_form['img_data']) == 0) {
//                 continue;
//               }

//               // チェックボックス合成
//               $checkboxBlob = base64_decode($_form['img_data']);
//               $checkbox = new Imagick();
//               $checkbox->readImageBlob($checkboxBlob);

//               // MEMO. 計算式のうちの微調整値は、インターフェースの帯からのCSS 的な margin や padding で生じたズレの補正.
//               $tmp_x = ($fileSize[0] * (intval($_form['x'])+14)) / $sheet_width;
//               $tmp_y = ($fileSize[1] * (intval($_form['y'])+12)) / $sheet_height;
//               $tmp_width  = ($fileSize[0] * (intval($_form['width'])+0)) / $sheet_width;
//               $tmp_height = ($fileSize[1] * (intval($_form['height'])+0)) / $sheet_height;

//               $checkbox->resizeImage($tmp_width, $tmp_height, self::IMAGICK_FILTER, self::IMAGICK_BLUR);
//               $documentDetail->compositeImage($checkbox, imagick::COMPOSITE_DEFAULT, $tmp_x, $tmp_y);
//             }
//           }
//         }

//         // ホスト印影の合成
//         foreach($data['selfSignList'] as  $si => $selfSign) {
//           if($selfSign['page'] == $i + 1) {
//             // MEMO.
//             // 計算式のうちの微調整値は、インターフェースの帯からのCSS 的な margin や padding で生じたズレの補正.
//             $tmp_x = ($fileSize[0] * (intval($selfSign['x'])+14)) / $sheet_width;
//             $tmp_y = ($fileSize[1] * (intval($selfSign['y'])+8)) / $sheet_height;
//             $tmp_width  = ($fileSize[0] * (intval($selfSign['width'])+0)) / $sheet_width;
//             $tmp_height = ($fileSize[1] * (intval($selfSign['height'])+0)) / $sheet_height;

//             // APIに電子署名(少し色が暗く,年月日入の電子署名入りの印影) させるか、PDFにサンプルの印影を帳尻合わせで差し込むかの分岐.
//             if(!$set_self_sign) {
//               $postDict['signInfos']['self']['isDigitalSign']           = true;
//               $postDict['signInfos']['self']['signTurn']                = 2;
//               $postDict['signInfos']['self']['signAreas'][0]['x']       = floatval($tmp_x);
//               $postDict['signInfos']['self']['signAreas'][0]['y']       = floatval($tmp_y);
//               $postDict['signInfos']['self']['signAreas'][0]['width']   = intval($tmp_width);
//               $postDict['signInfos']['self']['signAreas'][0]['height']  = intval($tmp_height);
//               $postDict['signInfos']['self']['signAreas'][0]['page']    = intval($selfSign['page']);
//               $postDict['signInfos']['self']['signAreas'][0]['docIdx']  = intval($selfSign['doc_idx']);

//               $set_self_sign = true; // １件だけ電子署名印影が作成出来る (２つ以上のデータをAPIに含めるとAPIがコケる).

//             } else {

//               $signBlob = base64_decode($selfSign['img_data']);
//               $sign = new Imagick();
//               $sign->readImageBlob($signBlob);
//               $sign->resizeImage($tmp_width, $tmp_height, self::IMAGICK_FILTER, 1);
//               $documentDetail->compositeImage($sign, imagick::COMPOSITE_DEFAULT, $tmp_x, $tmp_y);
//             }
//           }
//         }

//         // ゲスト印影の合成
//         foreach($data['partnerSignList'] as $pi => $partnerSignList) {
//           foreach($partnerSignList['sign'] as $psi => $signData) {
//             if($signData['page'] == $i + 1) {

//               // MEMO. 計算式のうちの微調整値は、インターフェースの帯からのCSS 的な margin や padding で生じたズレの補正.
//               $tmp_x = ($fileSize[0] * (intval($signData['x'])+14)) / $sheet_width;
//               $tmp_y = ($fileSize[1] * (intval($signData['y'])+8)) / $sheet_height;
//               $tmp_width  = ($fileSize[0] * (intval($signData['width'])+0)) / $sheet_width;
//               $tmp_height = ($fileSize[0] * (intval($signData['height'])+0)) / $sheet_width;

//               // APIに電子署名(少し色が暗く,年月日入の電子署名入りの印影) させるか、PDFにサンプルの印影を帳尻合わせで差し込むかの分岐.
//               if(!$set_partner_sign) {

//                 // パートナー情報
//                 $postDict['signInfos']['partners'][0]['info']['email']            = $data['partnerList'][$pi]['email'];
//                 $postDict['signInfos']['partners'][0]['info']['lastname']         = $data['partnerList'][$pi]['lastname'];
//                 $postDict['signInfos']['partners'][0]['info']['firstname']        = $data['partnerList'][$pi]['firstname'];
//                 $postDict['signInfos']['partners'][0]['info']['title']            = $data['partnerList'][$pi]['title'];
//                 $postDict['signInfos']['partners'][0]['info']['organizationName'] = $data['partnerList'][$pi]['organization_name'];

//                 // パートナー印影エリア
//                 $postDict['signInfos']['partners'][0]['signAreas'][0]['x']        = floatval($tmp_x);
//                 $postDict['signInfos']['partners'][0]['signAreas'][0]['y']        = floatval($tmp_y);
//                 $postDict['signInfos']['partners'][0]['signAreas'][0]['width']    = intval($tmp_width);
//                 $postDict['signInfos']['partners'][0]['signAreas'][0]['height']   = intval($tmp_height);
//                 $postDict['signInfos']['partners'][0]['signAreas'][0]['page']     = intval($signData['page']);
//                 $postDict['signInfos']['partners'][0]['signAreas'][0]['docIdx']   = intval($signData['doc_idx']);

//                 // パートナー印影イメージ
//                 $postDict['signInfos']['partners'][0]['signImage']['data']        = $signData['img_data'];
//                 $postDict['signInfos']['partners'][0]['signImage']['type']        = $signData['img_type'];
//                 $postDict['signInfos']['partners'][0]['signImage']['size']        = intval($signData['img_size']);
//                 $postDict['signInfos']['partners'][0]['signImage']['width']       = intval($signData['img_width']);
//                 $postDict['signInfos']['partners'][0]['signImage']['height']      = intval($signData['img_height']);

//                 $set_partner_sign = true; // １件だけ電子署名印影が作成出来る (２つ以上のデータをAPIに含めるとAPIがコケる).

//               } else {

//                 $signBlob = base64_decode($signData['img_data']);
//                 $sign = new Imagick();
//                 $sign->readImageBlob($signBlob);
//                 $sign->resizeImage($tmp_width, $tmp_height, self::IMAGICK_FILTER, 1);
//                 $documentDetail->compositeImage($sign, imagick::COMPOSITE_DEFAULT, $tmp_x, $tmp_y);
//               }

//             }
//           }
//         }
//         // フォーム合成PDF作成
//         // $documentDetail->setImageFormat('pdf'); // 引き継ぎ時から未使用.

//         // PDFファイル書き出し
//         $jpgPath = $originalDocumentDir . '/e_contract_document_sample' . $i . '.jpg';
//         $documentDetail->setImageCompressionQuality(10);
//         $documentDetail->writeImage($jpgPath);

//         $jpgFiles = $jpgFiles . ' ' . $jpgPath; // コマンド用 契約書の１ページjpgごとのパスを スペース区切りで繋ぐ.
//       }

//       $pdfPath = $originalDocumentDir . '/e_contract_document_sample.pdf';

//       // JPGを結合して 署名済みのPDFにする.
//       exec(sprintf("convert -strip -quality 50 {$jpgFiles} {$pdfPath}"));

//       // PDFファイルサイズ取得
//       $postDict['documents'][0]['size'] = filesize($pdfPath);

//       // PDFファイルデータ取得
//       $postDict['documents'][0]['data'] = base64_encode(file_get_contents($pdfPath));

//       if($isDebug) {
//         $postDict['documents'][0]['path'] = $pdfPath;
//       }

//       // 一時ファイルの削除
//       foreach(glob($originalDocumentDir . "/e_contract_document_sample*") as $val) {
//         if(!$isDebug) {
//           unlink($val);
//         }
//       }

//     } catch (Exception $e) {
//       var_dump($e);
//     }

//     return $postDict;
//   }


//   /***
//   * /e-contract-api/onestop-signing
//   * POST  案件ワンストップ登録押印
//   ***/
//   public function onestopSigningAction() {
//     $form = $this->_getAllParams();
//     $req = $this->getRequest();

//     // 操作ログ
//     $this->setLog("電子契約 案件ワンストップ登録押印", json_encode($form));
//     // モデル宣言
//     $eContractApiModel = Application_CommonUtil::getInstance("model", "EContractApiModel", $this->db);
//     $eContractPartnerDao = Application_CommonUtil::getInstance('dao', "EContractPartnerDao", $this->db);

//     // 契約、承認者、フォームデータを取得
//     $data = $eContractApiModel->getContractData($form["case_id"]);
//     // client_idからクレデンシャルを取得
//     $credential = $form["credential"];

//     // POST
//     if($req->isPost()) {

//       $onestopResult["status"] = -1; // 初期値.

//       // 案件ワンストップ登録押印
//       $client = new Zend_Http_Client(self::API_URI.'v1/cases/onestop_sign', array(
//         'maxredirects'  => 0,
//         'timeout'    => 30)
//       );
//       $client->setHeaders(array(
//         'Content-Type: application/json; charset=utf-8',
//         'Accept: application/json; charset=utf-8',
//         'X-Requested-With: XMLHttpRequest',
//         'Authorization: Bearer '.$credential
//       ));


//       try {

//         // PDFの作成、及び APIに電子署名させる為の 印影の位置と大きさ等の情報の整形.
//         $postDict = $this->makeEContractPDF($form);

//         // API用にJSONに変換
//         $postJson = json_encode($postDict, JSON_UNESCAPED_SLASHES);

//         // 案件ワンストップ登録押印
//         $onestopResponse = $client->setRawData($postJson, "text/json")->request('POST');

//         // 戻り値
//         $onestopResult = $this->getResponce($onestopResponse);

//         // uidが戻ってこない場合締結ができていないのでエラーにする
//         if($onestopResult['status'] == 200 && isset($onestopResult['body']['id'])) {
//           // uidを保存
//           $eContractApiModel->updateCaseUid($data['case']['id'], $onestopResult['body']['id']);

//           // 登録済み契約書PDFを保存
//           $document = base64_decode($onestopResult['body']['documents'][0]['data']);
//           // ディレクトリがなければ作成して保存
//           $directoryPath = 'e_contract_documents/'.$data['case']['client_id'];
//           $filePath = $directoryPath.'/'.$onestopResult['body']['id'].'.pdf';
//           if(file_exists($directoryPath)) {
//             file_put_contents($filePath, $document);
//           } else {
//             mkdir($directoryPath);
//             file_put_contents($filePath, $document);
//           }
//           $onestopResult['filePath'] = '/e_contract_documents/'.$data['case']['client_id'].'/'.$onestopResult['body']['id'].'.pdf';
//           // ホストスタッフに契約完了通知メールを送信する
//           $eContractApiModel->sendEContractAgreementMail($data['case']['staff_type'], $data['case']['staff_id']);
//           // 承認者全員に契約完了通知メールを送信する
//           $eContractApiModel->sendEContractAgreementPartnersMail($data['case']['id'], $onestopResult['filePath']);
//         }

//       } catch (Exception $e) {
//         $onestopResult["status"] = -2;
//       }

//       //  TODO. 最後の人物しからくらく電子APIを送信出来ない現状の処理がおかしい 設計を見直す必要あり = e_contract_caseで完了を管理する設計へ.
//       // [応急処置] approvalAndNext() で承認済みにした 処理を元に戻す = 承認順のうち 最後の人物は何度でも承認画面に出入り出来る.
//       if($onestopResult['status'] != 200) {

//         $form["api_result"] = $onestopResult;
//         if (array_key_exists('documents', $form["api_result"]['body'])) {
//           $form["api_result"]['body']['documents'] = []; // PDFデータをDBに保存してしまわないように潰す.
//         }

//         $this->setLog("電子契約 API署名失敗", json_encode($form));

//         try{
//           $this->db->beginTransaction();
//           $eContractPartnerDao->resetApprovalStatus("e_contract_case_id = {$form["case_id"]} AND token = '{$form["partnerToken"]}'");
//           $this->db->commit();
//         }catch(Exception $e) {
//           $this->db->rollBack();
//           throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
//         }
//       }

//     }

//     echo json_encode($onestopResult);
//     exit;
//   }

//   /***
//   * /e-contract-api/partner-auth
//   * GET  ゲスト保持契約書認証画面
//   ***/
//   public function partnerAuthAction() {
//     $form = $this->_getAllParams();
//     $request = $this->getRequest();
//     // 操作ログ
//     $log_param = $form;
// 		$log_param['password'] = md5($form['password']);
//     $this->setLog("電子契約 ゲスト保持契約書認証画面", json_encode($log_param));
//     // モデル宣言
//     $eContractApiModel = Application_CommonUtil::getInstance("model", "EContractApiModel", $this->db);


//     // メールアドレスとパスワードが正しいかチェックする
//     $result = $eContractApiModel->checkPartnerPassword($form, $request);
//     // 認証が通ったら契約書一覧ページへ移動
//     if(empty($result['error']) && $result['authFlg'] == 1) {
//       // セッションを取得
//       $session = Application_CommonUtil::getSession(self::IDENTIFIER);
//       // 承認者メールアドレスとトークンをセッションに保持
//       $session->partnerEmail = $form['email'];
//       $session->partnerPassword = $form['password'];

//       // 有効期限は12時間
//       $session->setExpirationSeconds(43200, 'partnerEmail');
//       $session->setExpirationSeconds(43200, 'partnerPassword');

//       $this->_redirect('/e-contract-api/partner-confirming');
//     }

//     $this->view->token = $form["token"];
//     $this->view->error = $result['error'];
//   }

//   /***
//   * /e-contract-api/credential
//   * POST 電子契約APIのクレデンシャル発行
//   * GET  クレデンシャル状況表示
//   ***/
//   public function credentialAction() {
//     $form = $this->_getAllParams();
//     $req = $this->getRequest();
//     // セッションを取得
//     $session = Application_CommonUtil::getSession(self::IDENTIFIER);
//     // 操作ログ
//     $this->setLog("電子契約API クレデンシャル発行", json_encode($form));

//     // モデルを宣言
//     $eContractApiModel = Application_CommonUtil::getInstance("model", "EContractApiModel", $this->db);
//     $masterClientDao   = Application_CommonUtil::getInstance("dao", "MasterClientDao", $this->db);

//     // POST
//     if($req->isPost()) {

//       $errorList = [];

//       // DBからこのクライアントのAPIアカウント情報を取得して、もし作られてなければAPIアカウントを作成する
//       $account = $eContractApiModel->getEContractAccount();  // 接続情報取得 1回目.
//       if($account == false) {

//         // クライアント情報を取得
//         $company = $masterClientDao->getMasterClientRow($this->user['client_id']);
//         // 電子契約API アカウント作成
//         $result = $eContractApiModel->apiAccountRegist($company);

//         // 登録が成功した場合にアカウント情報をデータベースに情報を保管
//         if($result['isSuccess']) {
//           // 次回から接続情報でログインする為保存する.
//           $accountRegistResult = $eContractApiModel->accountRegist($company);
//           $account = $eContractApiModel->getEContractAccount(); // 接続情報取得 今回は取得出来るはず.

//         } else if($result['body']['error']['message'] == 'already registered' ) {
//           $errorList = ['message' => 'アカウント作成にてエラーが発生しました、メールアドレスが既に利用されています。['.$company['client_staffleaderemail'].']'];
//         } else {
//           $errorList = ['message' => 'アカウント作成にてエラーが発生しました、お問い合わせください。['.$result['status'].':'.$result['body']['error']['message'].']'];
//         }

//       }

//       // APIアカウント 接続情報から クレデンシャル発行を試みる.
//       if($account != false) {
//         // 電子契約API クレデンシャル発行
//         $result = $eContractApiModel->getApiCredential($account);
//         if($result['status'] == 200) {
//           // クレデンシャルが発行されたらセッションで保持する
//           $session->credential = $result['body']['credential'];
//           // 有効期限は12時間
//           $session->setExpirationSeconds(43200, 'credential');

//           // 印影画像が設定されているかセッションで保持する
//           $client = new Zend_Http_Client(self::API_URI.'v1/users/sign_images', array(
//             'maxredirects'  => 0,
//             'timeout'    => 30)
//           );
//           $client->setHeaders(array(
//             'Accept: application/json; charset=utf-8',
//             'X-Requested-With: XMLHttpRequest',
//             'Authorization: Bearer '.$session->credential
//           ));
//           $response = $client->request();
//           // 設定済み印影画像 戻り値
//           $result = $this->getResponce($response);
//           if($result['status'] == 200) {
//             $session->signImage = true;
//             // 有効期限は12時間
//             $session->setExpirationSeconds(43200, 'signImage');
//           }

//           // 電子証明書が発行されているかセッションで保持する
//           $client = new Zend_Http_Client(self::API_URI.'v1/users/certificate?status=all', array(
//             'maxredirects'  => 0,
//             'timeout'    => 30
//           ));
//           $client->setHeaders(array(
//             'Accept: application/json; charset=utf-8',
//             'X-Requested-With: XMLHttpRequest',
//             'Authorization: Bearer '.$session->credential
//           ));
//           $certificateResponse = $client->request();
//           // 電子証明書付与状態 戻り値
//           $certificateResult = $this->getResponce($certificateResponse);
//           if($certificateResult['isSuccess']) {
//             $session->certificate = true;
//             // 有効期限は12時間
//             $session->setExpirationSeconds(43200, 'certificate');
//           }
//         } else if($result['body']['error']['message'] == 'bad username or password') {
//           $errorList = ['message' => 'クレデンシャル発行にてエラーが発生しました、お問い合わせください。['.$result['status'].':アカウント取得失敗]'];
//         }  else {
//           $errorList = ['message' => 'クレデンシャル発行にてエラーが発生しました、お問い合わせください。['.$result['status'].':'.$result['body']['error']['message'].']'];
//         }

//       }

//       if($session->credential !== "") {
//           $credentialFlg = true;
//       }

//     }

//     // クレデンシャルが有効な場合は判定フラグを立てる
//     if($session->credential !== "" && $session->signImage === true && $session->certificate === true) {
//       $credentialFlg = true;
//     }

//     $this->view->credentialFlg  = $credentialFlg;
//     $this->view->errorList = $errorList;
//   }

//   /***
//   * /e-contract-api/certificate-regist
//   * POST 電子契約APIの電子証明書申請・再申請
//   * GET  電子証明書申請フォームを表示
//   ***/
//   public function certificateRegistAction() {
//     $form = $this->_getAllParams();
//     $req = $this->getRequest();
//     // セッションを取得
//     $session = Application_CommonUtil::getSession(self::IDENTIFIER);
//     // 操作ログ
//     $this->setLog("電子契約 電子証明書申請", json_encode($form));
//     // モデルを宣言
//     $eContractApiModel = Application_CommonUtil::getInstance("model", "EContractApiModel", $this->db);
//     // 現在のユーザーの証明書情報を取得
//     $certificate = $eContractApiModel->getEContractCertificate();
//     // 付与状態の判定フラグ
//     if($certificate) {
//       $certificateFlg = true;
//     }

//     // POST
//     if($req->isPost()) {
//       // 電子証明書申請バリデーションを実行する
//       $errorList = $this->eContractCertificateValidation($form);
//       if(count($errorList) == 0) {
//         // 電子契約書申請
//         $client = new Zend_Http_Client(self::API_URI.'v1/certificates', array(
//           'maxredirects'  => 0,
//           'timeout'    => 30)
//         );
//         $client->setHeaders(array(
//           'Content-Type: application/json; charset=utf-8',
//           'Accept: application/json; charset=utf-8',
//           'X-Requested-With: XMLHttpRequest',
//           'Authorization: Bearer '.$session->credential
//         ));
//         $postDict['agree']             = true;
//         $postDict['lastname']          = $form['lastname'];
//         $postDict['firstname']         = $form['firstname'];
//         $postDict['lastnameReading']   = $form['lastnameReading'];
//         $postDict['firstnameReading']  = $form['firstnameReading'];
//         $postDict['email']             = $form['email'];
//         $postDict['phone']             = $form['phone'];
//         $postDict['postalCode']        = $form['postalCode'];
//         $postDict['address']           = $form['address'];
//         $postDict['organizationType']  = 'corporation';
//         $postDict['organizationName']  = $form['organizationName'];
//         $postDict['corporationNumber'] = $form['corporationNumber'];
//         $postDict['title']             = $form['title'];
//         $postDict['department']        = $form['department'];
//         $postDict['businessName']      = $form['businessName'];

//         // API用にJSONに変換
//         $postJson = json_encode($postDict);

//         if($certificate) {
//           // 電子契約書申請データがあれば更新
//           $response = $client->setRawData($postJson, "text/json")->request('PUT');
//           // 戻り値
//           $result = $this->getResponce($response);

//           // 電子証明書申請が成功した場合
//           if($result['status'] == 200) {
//             // 電子証明書情報をデータベースで更新
//             $form['client_id']   = $this->user['client_id'];
//             $form['status']      = $certificate['status'];
//             $form['validFrom']   = $certificate['validFrom'];
//             $form['validTo']     = $certificate['validTo'];
//             $form['create_date'] = $certificate['create_date'];
//             $updateResult = $eContractApiModel->certificateUpdate($form);
//             if($updateResult["registCompleteFlg"] == 1){
//               // 完了の場合は電子契約書申請状況画面へ遷移
//               $this->_redirect('/e-contract-api/certificate');
//             }
//           } else if($result['body']['error']['message'] == 'invalid corp num' || $result['body']['error']['message'] == 'invalid corp name') {
//             $errorList = ['message' => '法人名と法人番号が合っていません。'];
//           }
//         } else {
//           // 電子契約書申請データがなければ新規申請
//           $response = $client->setRawData($postJson, "text/json")->request('POST');
//           // 戻り値
//           $result = $this->getResponce($response);

//           // 電子証明書申請が成功した場合
//           if($result['status'] == 200) {
//             // 電子証明書情報をデータベースに登録
//             $registResult = $eContractApiModel->certificateRegist($form);
//             if($registResult["registCompleteFlg"] == 1){
//               // 完了の場合は電子契約書申請状況画面へ遷移
//               $this->_redirect('/e-contract-api/certificate');
//             }
//           } else if($result['body']['error']['message'] == 'invalid corp num' || $result['body']['error']['message'] == 'invalid corp name') {
//             $errorList = ['message' => '法人名と法人番号が合っていません。'];
//           }
//         }
//       }
//     }
//     // クレデンシャルが有効な場合は判定フラグを立てる
//     if($session->credential != "") {
//       $credentialFlg = true;
//     }
//     $this->view->form           = $form;
//     $this->view->certificateFlg = $certificateFlg;
//     $this->view->credentialFlg  = $credentialFlg;
//     // エラーの場合は作成画面へ戻るのでデータを設定する
//     $this->view->errorList      = $errorList;
//   }

//   /***
//   * /e-contract-api/certificate
//   * GET 電子証明書付与状態ページ
//   ***/
//   public function certificateAction() {
//     $form = $this->_getAllParams();
//     // セッションを取得
//     $session = Application_CommonUtil::getSession(self::IDENTIFIER);
//     // 操作ログ
//     $this->setLog("電子契約 電子証明書付与状態", json_encode($form));
//     // モデルを宣言
//     $eContractApiModel = Application_CommonUtil::getInstance("model", "EContractApiModel", $this->db);

//     // クレデンシャルが発行されている場合のみ表示
//     if($session->credential) {
//       // 現在のクライアントの電子証明書情報を1件取得
//       $certificate = $eContractApiModel->getEContractCertificate();

//       // APIで電子証明書付与状態を取得
//       $client = new Zend_Http_Client(self::API_URI.'v1/users/certificate?status=all', array(
//         'maxredirects'  => 0,
//         'timeout'    => 30
//       ));
//       $client->setHeaders(array(
//         'Accept: application/json; charset=utf-8',
//         'X-Requested-With: XMLHttpRequest',
//         'Authorization: Bearer '.$session->credential
//       ));
//       $certificateResponse = $client->request();
//       // 電子証明書付与状態 戻り値
//       $certificateResult = $this->getResponce($certificateResponse);

//       if($certificateResult['status'] == 200) {
//         $certificateFlg = 1;

//         // 電子証明書が付与中データをセッションに持たせる（有効期限は12時間）
//         $session->certificate = true;
//         $session->setExpirationSeconds(43200, 'certificate');

//         // 返ってきた有効開始時刻
//         $validFrom = date('Y-m-d H:i:s', $certificateResult["body"]["validFrom"]);

//         // 電子証明書付与状態が更新されていたらデータベースも更新する
//         // if($validFrom !== $certificate['validFrom']) {
//         //   $certificate['status'] = 1;
//         //   $certificate['validFrom'] = $validFrom;
//         //   $certificate['validTo'] = date('Y-m-d H:i:s', $certificateResult["body"]["validTo"]);
//         //   $eContractApiModel->certificateUpdate($certificate);
//         //   // 更新したので再度証明書データを取得
//         //   $certificate = $eContractApiModel->getEContractCertificate();
//         // }
//       } else {
//         $certificateFlg = 0;
//       }
//       $this->view->certificate    = $certificate;
//       $this->view->certificateFlg = $certificateFlg;
//     }
//     $this->view->credential = $session->credential;
//   }

//   /***
//   * /e-contract-api/sign-image-regist
//   * POST 電子契約APIの印影画像の作成と設定
//   * GET  印影画像作成フォームを表示
//   ***/
//   public function signImageRegistAction() {
//     $form = $this->_getAllParams();
//     $req = $this->getRequest();
//     // セッションを取得
//     $session = Application_CommonUtil::getSession(self::IDENTIFIER);
//     // 操作ログ
//     $this->setLog("電子契約 印影画像作成・設定", json_encode($form));

//     // 設定済み印影画像を取得
//     $client = new Zend_Http_Client(self::API_URI.'v1/users/sign_images', array(
//       'maxredirects'  => 0,
//       'timeout'    => 30)
//     );
//     $client->setHeaders(array(
//       'Accept: application/json; charset=utf-8',
//       'X-Requested-With: XMLHttpRequest',
//       'Authorization: Bearer '.$session->credential
//     ));

//     $response = $client->request();
//     // 設定済み印影画像 戻り値
//     $result = $this->getResponce($response);

//     // POST
//     if($req->isPost()) {
//       // 印影作成文字列のバリデーションを実行する
//       $errorList = $this->eContractSignImageValidation($form);
//       if(count($errorList) == 0) {
//         // 印影画像作成・設定
//         $client = new Zend_Http_Client(self::API_URI.'v1/users/sign_image', array(
//           'maxredirects'  => 0,
//           'timeout'    => 30)
//         );
//         $client->setHeaders(array(
//           'Content-Type: application/json; charset=utf-8',
//           'Accept: application/json; charset=utf-8',
//           'X-Requested-With: XMLHttpRequest',
//           'Authorization: Bearer '.$session->credential
//         ));

//         $postDict['texts'] = array($form['sign1']);
//         if($form['sign2'] != "") {
//           array_push($postDict['texts'], $form['sign2']);
//         }
//         if($form['sign3'] != "") {
//           array_push($postDict['texts'], $form['sign3']);
//         }
//         if($form['sign4'] != "") {
//           array_push($postDict['texts'], $form['sign4']);
//         }
//         // API用にJSONに変換
//         $postJson = json_encode($postDict);

//         // APIで印影の作成と設定
//         $response = $client->setRawData($postJson, "text/json")->request('PUT');
//         // 戻り値
//         $result = $this->getResponce($response);

//         if($result['status'] == 200) {
//           // 印影画像保持中データをセッションに持たせる
//           $session->signImage = true;
//           // 有効期限は12時間
//           $session->setExpirationSeconds(43200, 'signImage');
//           // 印影の作成と設定が成功した場合、リロード
//           $this->_redirect('/e-contract-api/sign-image-regist');
//         }
//       }
//     }
//     // クレデンシャルが有効な場合は判定フラグを立てる
//     if($session->credential != "") {
//       $credentialFlg = true;
//     }
//     // 設定中の印影画像データ
//     $this->view->signImage     = $result['body']['signImages'][0];
//     $this->view->credentialFlg = $credentialFlg;
//     // エラーの場合は作成画面へ戻るのでデータを設定する
//     $this->view->errorList = $errorList;
//     $this->view->form = $form;
//   }

//   /***
//   * /e-contract-api/get-auth-count
//   * GET  API認証済みのパートナー数を取得
//   ***/
//   public function getAuthCountAction() {
//     // ビューを表示させない
//     $this->_helper->viewRenderer->setNoRender();

//     $form = $this->_getAllParams();
//     $req = $this->getRequest();
//     // 操作ログ
//     $this->setLog("API認証済みのパートナー数を取得", json_encode($form));
//     // モデル宣言
//     $eContractApiModel = Application_CommonUtil::getInstance("model", "EContractApiModel", $this->db);

//     $result = $eContractApiModel->getAuthCount($form["token"]);

//     echo $result;
//   }

//   /***
//   * /e-contract-api/get-partner-with-id
//   * GET パートナーを取得
//   ***/
//   public function getPartnerWithIdAction() {
//     // ビューを表示させない
//     $this->_helper->viewRenderer->setNoRender();

//     $form = $this->_getAllParams();
//     $req = $this->getRequest();
//     // 操作ログ
//     $this->setLog("パートナーを取得", json_encode($form));

//     // モデル宣言
//     $eContractApiModel = Application_CommonUtil::getInstance("model", "EContractApiModel", $this->db);

//     $result = $eContractApiModel->getPartnerWithId($form["partner_id"]);
//     echo $result["approval_status"];
//   }

//   /***
//   * /e-contract-api/get-sign-image
//   * GET  設定済み印影画像データを取得
//   ***/
//   public function getSignImageAction() {
//     // ビューを表示させない
//     $this->_helper->viewRenderer->setNoRender();

//     $form = $this->_getAllParams();
//     $req = $this->getRequest();
//     // セッションを取得
//     $session = Application_CommonUtil::getSession(self::IDENTIFIER);
//     // 操作ログ
//     $this->setLog("電子契約 設定済み印影画像データを取得", json_encode($form));

//     // 設定済み印影画像を取得
//     $client = new Zend_Http_Client(self::API_URI.'v1/users/sign_images', array(
//       'maxredirects'  => 0,
//       'timeout'    => 30)
//     );
//     $client->setHeaders(array(
//       'Accept: application/json; charset=utf-8',
//       'X-Requested-With: XMLHttpRequest',
//       'Authorization: Bearer '.$session->credential
//     ));

//     $response = $client->request();
//     // 設定済み印影画像 戻り値
//     $result = $this->getResponce($response);
//     // 設定済み印影画像データのjsonデータを返す
//     echo $result['body']['signImages'][0]['data'];
//   }

//   /***
//   * /e-contract-api/create-sign-image
//   * GET 印影画像の作成（設定はしない）
//   ***/
//   public function createSignImageAction() {
//     $form = $this->_getAllParams();
//     $req = $this->getRequest();
//     // セッションを取得
//     $session = Application_CommonUtil::getSession(self::IDENTIFIER);
//     // 操作ログ
//     $this->setLog("電子契約 印影画像の作成", json_encode($form));

//     // POST
//     if($req->isPost()) {
//       // パートナーの印影画像を作成
//       $texts = array();
//       // $texts = '?texts[]='.$form['sign1'];
//       if($form['texts'][0] != "") {
//         $texts[] = $form['texts'][0];
//       }
//       if($form['texts'][1] != "") {
//         $texts[] = $form['texts'][1];
//       }
//       if($form['texts'][2] != "") {
//         $texts[] = $form['texts'][2];
//       }
//       if($form['texts'][3] != "") {
//         $texts[] = $form['texts'][3];
//       }
//       $client = new Zend_Http_Client(self::API_URI.'v1/sign_images', array(
//         'maxredirects'  => 0,
//         'timeout'    => 30
//       ));
//       $client->setHeaders(array(
//         'Accept: application/json; charset=utf-8',
//         'X-Requested-With: XMLHttpRequest',
//         'Authorization: Bearer '.$form['credential']
//       ));
//       $client->setParameterGet('texts', $texts);
//       $response = $client->request();
//       // 電子証明書画像 戻り値
//       $result = $this->getResponce($response);
//       // 設定済み印影画像データのjsonデータを返す
//       echo $result["body"]["data"];
//       exit;
//     }
//   }

//   /***
//   * /e-contract-api/get-sign-image-for-approval
//   * GET パートナー承認画面用の設定済み印影画像データを取得
//   ***/
	public function getSignImageForApprovalAction() {
//     // ビューを表示させない
//     $this->_helper->viewRenderer->setNoRender();

//     $form = $this->_getAllParams();
//     $req = $this->getRequest();
//     // セッションを取得
//     $session = Application_CommonUtil::getSession(self::IDENTIFIER);
//     // 操作ログ
//     $this->setLog("電子契約 パートナー画面用に設定済み印影画像データを取得", json_encode($form));

//     // 設定済み印影画像を取得
//     $client = new Zend_Http_Client(self::API_URI.'v1/users/sign_images', array(
//       'maxredirects'  => 0,
//       'timeout'    => 30)
//     );
//     $client->setHeaders(array(
//       'Accept: application/json; charset=utf-8',
//       'X-Requested-With: XMLHttpRequest',
//       'Authorization: Bearer '.$form['credential']
//     ));

//     $response = $client->request();
//     // 設定済み印影画像 戻り値
//     $result = $this->getResponce($response);
//     // 設定済み印影画像データのjsonデータを返す
//     echo $result['body']['signImages'][0]['data'];
	}

//   /***
//   * /e-contract-api/regist-tmp-data
//   * POST 契約情報の一時登録と承認依頼メールの送付
//   ***/
//   public function registTmpDataAction() {
//     $form = $this->_getAllParams();
//     $req = $this->getRequest();

//     // 操作ログ
//     $this->setLog("電子契約 契約情報の一時登録と承認依頼メールの送付", json_encode($form));

//     // モデルを宣言
//     $eContractApiModel = Application_CommonUtil::getInstance("model", "EContractApiModel", $this->db);

//     // 電子契約API アカウント作成
//     $result = $eContractApiModel->tmpDataRegist($form);

//     echo json_encode($result);
//     exit;
//   }

//   /***
//   * /e-contract-api/onestop-sign
//   * POST  案件ワンストップ登録押印
//   ***/
//   public function onestopSignAction() {
//     $form = $this->_getAllParams();
//     $req = $this->getRequest();
//     // セッションを取得
//     $session = Application_CommonUtil::getSession(self::IDENTIFIER);
//     // 操作ログ
//     $this->setLog("電子契約 案件ワンストップ登録押印", json_encode($form));
//     // モデル宣言
//     $eContractApiModel = Application_CommonUtil::getInstance("model", "EContractApiModel", $this->db);

//     // パートナーデータを取得
//     $partner = $eContractApiModel->getPartner($session->partnerEmail, $session->partnerToken);
//     // 一時保管契約情報を取得
//     $tmpInfo = $eContractApiModel->getTmpInfo($partner["e_contract_tmp_info_id"]);
//     // client_idからクレデンシャルを取得
//     $credentialResult = $eContractApiModel->getCredentialToPartner($tmpInfo['client_id']);

//     // POST
//     if($req->isPost()) {
//       // 案件ワンストップ登録押印
//       $client = new Zend_Http_Client(self::API_URI.'v1/cases/onestop_sign', array(
//         'maxredirects'  => 0,
//         'timeout'    => 30)
//       );
//       $client->setHeaders(array(
//         'Content-Type: application/json; charset=utf-8',
//         'Accept: application/json; charset=utf-8',
//         'X-Requested-With: XMLHttpRequest',
//         'Authorization: Bearer '.$credentialResult["body"]["credential"]
//       ));

//       // 契約情報
//       $postDict['params']['name']                                       = $tmpInfo['name'];
//       if($tmpInfo['have_amount'] == '0') {
//         $postDict['params']['haveAmount']                               = false;
//       } else {
//         $postDict['params']['haveAmount']                               = true;
//       }
//       $postDict['params']['amount']                                     = intval(($tmpInfo['amount'] === NULL) ? "" : $tmpInfo['amount']);
//       $postDict['params']['agreementDate']                              = ($tmpInfo['agreement_date'] === NULL) ? "" : $tmpInfo['agreement_date'];
//       $postDict['params']['effectiveDate']                              = ($tmpInfo['effective_date'] === NULL) ? "" : $tmpInfo['effective_date'];
//       $postDict['params']['expireDate']                                 = ($tmpInfo['expire_date'] === NULL) ? "" : $tmpInfo['expire_date'];
//       if($tmpInfo['auto_renewal'] == '0') {
//         $postDict['params']['autoRenewal']                              = false;
//       } else {
//         $postDict['params']['autoRenewal']                              = true;
//       }
//       $postDict['params']['managementNumber']                           = $tmpInfo['management_number'];
//       $postDict['params']['comment']                                    = $tmpInfo['comment'];
//       // ユーザー印影エリア
//       $postDict['signInfos']['self']['isDigitalSign']                   = true;
//       $postDict['signInfos']['self']['signTurn']                        = 2;
//       $postDict['signInfos']['self']['signAreas'][0]['x']               = floatval($tmpInfo['sign_x']) * floatval($form['scale']);
//       $postDict['signInfos']['self']['signAreas'][0]['y']               = floatval($tmpInfo['sign_y']) * floatval($form['scale']);
//       $postDict['signInfos']['self']['signAreas'][0]['width']           = floatval($tmpInfo['sign_width']) * floatval($form['scale']);
//       $postDict['signInfos']['self']['signAreas'][0]['height']          = floatval($tmpInfo['sign_height']) * floatval($form['scale']);
//       $postDict['signInfos']['self']['signAreas'][0]['page']            = 1;
//       $postDict['signInfos']['self']['signAreas'][0]['docIdx']          = 0;
//       // パートナー情報
//       $postDict['signInfos']['partners'][0]['info']['email']            = $partner['email'];
//       $postDict['signInfos']['partners'][0]['info']['lastname']         = $partner['lastname'];
//       $postDict['signInfos']['partners'][0]['info']['firstname']        = $partner['firstname'];
//       $postDict['signInfos']['partners'][0]['info']['title']            = $partner['title'];
//       $postDict['signInfos']['partners'][0]['info']['organizationName'] = $partner['organization_name'];
//       // パートナー印影エリア
//       $postDict['signInfos']['partners'][0]['signAreas'][0]['x']        = floatval($form['x']) * floatval($form['scale']);
//       $postDict['signInfos']['partners'][0]['signAreas'][0]['y']        = floatval($form['y']) * floatval($form['scale']);
//       $postDict['signInfos']['partners'][0]['signAreas'][0]['width']    = floatval($form['width']) * floatval($form['scale']);
//       $postDict['signInfos']['partners'][0]['signAreas'][0]['height']   = floatval($form['height']) * floatval($form['scale']);
//       $postDict['signInfos']['partners'][0]['signAreas'][0]['page']     = 1;
//       $postDict['signInfos']['partners'][0]['signAreas'][0]['docIdx']   = 0;
//       // パートナー印影イメージ
//       $postDict['signInfos']['partners'][0]['signImage']['data']        = $form['data'];
//       $postDict['signInfos']['partners'][0]['signImage']['type']        = 'image/png';
//       $postDict['signInfos']['partners'][0]['signImage']['size']        = intval($form['size']);
//       $postDict['signInfos']['partners'][0]['signImage']['width']       = intval($form['width']);
//       $postDict['signInfos']['partners'][0]['signImage']['height']      = intval($form['height']);
//       // 契約書ドキュメント
//       $postDict['documents'][0]['idx']     = 0;
//       $postDict['documents'][0]['title']   = $tmpInfo["doc_title"];
//       $postDict['documents'][0]['name']    = $tmpInfo["doc_name"];
//       $postDict['documents'][0]['type']    = $tmpInfo['doc_type'];
//       $postDict['documents'][0]['size']    = intval($tmpInfo['doc_size']);
//       $postDict['documents'][0]['data']    = $tmpInfo['doc_data'];

//       // API用にJSONに変換
//       $postJson = json_encode($postDict, JSON_UNESCAPED_SLASHES);

//       // 案件ワンストップ登録押印
//       $onestopResponse = $client->setRawData($postJson, "text/json")->request('POST');

//       // 戻り値
//       $onestopResult = $this->getResponce($onestopResponse);

//       if($onestopResult['status'] == 200) {

//         // 登録済み契約書PDFを保存
//         $document = base64_decode($onestopResult['body']['documents'][0]['data']);
//         // ディレクトリがなければ作成して保存
//         $directoryPath = ROOT.'public/e_contract_documents/'.$tmpInfo['client_id'];
//         $filePath = $directoryPath.'/'.$onestopResult['body']['id'].'.pdf';
//         if(file_exists($directoryPath)) {
//           file_put_contents($filePath, $document);
//         } else {
//           mkdir($directoryPath);
//           file_put_contents($filePath, $document);
//         }
//         $onestopResult['filePath'] = '/e_contract_documents/'.$tmpInfo['client_id'].'/'.$onestopResult['body']['id'].'.pdf';
//         // クライアントスタッフに契約完了通知メールを送信する
//         $eContractApiModel->sendEContractAgreementMail($tmpInfo["staff_type"], $tmpInfo["staff_id"]);
//         // パートナー印影情報をDBに保管する
//         $eContractApiModel->registPartnerSign($form, $session->partnerToken);
//       }
//     }

//     echo json_encode($onestopResult);
//     exit;
//   }

//   /***
//   * /e-contract-api/cases
//   * GET  案件一覧を表示
//   ***/
//   public function casesAction() {

//     // 2021/03/15 この機能を削除したため、直でアクセスしてきた場合はクレデンシャル発行画面へ誘導する
//     $this->_redirect('/e-contract-api/credential');
//   }

//   /***
//   * /e-contract-api/case
//   * GET  案件詳細を表示
//   ***/
//   public function caseAction() {

//     // 2021/03/15 この機能を削除したため、直でアクセスしてきた場合はクレデンシャル発行画面へ誘導する
//     $this->_redirect('/e-contract-api/credential');
//   }

//   /***
//   * /e-contract-api/email-auth
//   * GET  ゲスト承認メール認証画面
//   ***/
//   public function emailAuthAction() {
//     $form = $this->_getAllParams();
//     $request = $this->getRequest();
//     // 操作ログ
//     $this->setLog("電子契約 ゲスト承認メール認証画面", json_encode($form));
//     // モデル宣言
//     $eContractApiModel = Application_CommonUtil::getInstance("model", "EContractApiModel", $this->db);

//     // メールアドレスが正しいかチェックする
//     $result = $eContractApiModel->checkPartnerEmail($form, $request);
//     // メールアドレス認証が通ったら承認ページへ移動
//     if($result['authFlg'] == 1) {
//       // セッションを取得
//       $session = Application_CommonUtil::getSession(self::IDENTIFIER);
//       // 承認者メールアドレスとトークンをセッションに保持
//       $session->partnerEmail = $form['email'];
//       $session->partnerToken = $form['token'];
//       // 有効期限は12時間
//       $session->setExpirationSeconds(43200, 'partnerEmail');
//       $session->setExpirationSeconds(43200, 'partnerToken');

//       $this->_redirect('/e-contract-api/approval');
//     }

//     $this->view->token = $form["token"];
//     $this->view->error = $result['error'];
//   }

//   /***
//   * /e-contract-api/approval
//   * GET  ゲスト承認画面
//   ***/
//   public function approvalAction() {
//     $form = $this->_getAllParams();
//     $request = $this->getRequest();
//     // セッションを取得
//     $session = Application_CommonUtil::getSession(self::IDENTIFIER);
//     // 操作ログ
//     $this->setLog("電子契約 ゲスト承認画面", json_encode($form));
//     // モデル宣言
//     $eContractApiModel = Application_CommonUtil::getInstance("model", "EContractApiModel", $this->db);

//     // パートナーデータを取得
//     $partner = $eContractApiModel->getPartner($session->partnerEmail, $session->partnerToken);
//     // 一時保管契約情報を取得
//     $tmpInfo = $eContractApiModel->getTmpInfo($partner["e_contract_tmp_info_id"]);
//     // client_idからクレデンシャルを取得
//     $credentialResult = $eContractApiModel->getCredentialToPartner($tmpInfo['client_id']);

//     $this->view->credential = $credentialResult["body"]["credential"];
//     $this->view->name       = $tmpInfo["name"];
//     $this->view->docPath    = $tmpInfo["doc_path"];
//     $this->view->signX      = $tmpInfo["sign_x"];
//     $this->view->signY      = $tmpInfo["sign_y"];
//     $this->view->signWidth  = $tmpInfo["sign_width"];
//     $this->view->signHeight = $tmpInfo["sign_height"];
//     $this->view->host       = $_SERVER["HTTP_HOST"];
//   }

//   /***
//   * /e-contract-api/approval-done
//   * GET  ゲスト承認完了画面
//   ***/
//   public function approvalDoneAction() {
//     // 操作ログ
//     $this->setLog("電子契約 ゲスト承認完了画面", json_encode($form));
//   }

//   /***
//   * /e-contract-api/hold-credential
//   * GET  クレデンシャル情報をセッションに保持する
//   ***/
//   public function holdCredentialAction() {
//     $form = $this->_getAllParams();

//     // セッションを取得
//     $session = Application_CommonUtil::getSession(self::IDENTIFIER);

//     // クレデンシャルが発行されたらセッションで保持する
//     $session->credential = $form["credential"];
//     // 有効期限は12時間
//     $session->setExpirationSeconds(43200, 'credential');
//   }

//   /***
//   * /e-contract-api/pre-call-auto
//   * POST Smart-in PreCallAuto APIを叩く
//   ***/
//   public function preCallAutoAction() {
//     $form = $this->_getAllParams();

//     // 操作ログ
//     $this->setLog("電子契約 Smart-in PreCallAuto", json_encode($form));

//     $client = new Zend_Http_Client('https://mobile-passport.biz/request_pr.cgi', array(
//       'maxredirects'  => 0,
//       'timeout'    => 30)
//     );
//     $client->setHeaders(array(
//       'Content-Type: application/x-www-form-urlencoded; charset=utf-8',
//       'Accept: application/json; charset=utf-8',
//       'X-Requested-With: XMLHttpRequest'
//     ));

//     // 電話番号の暗号化
//     exec('../../html_meet/Smart-in/Client/PreCallAuto/Lib/Linux/64bit/authcode_crypt ' . $form['tel'], $encTel);

//     // テスト
//     // $post = 'company=9003&code=C60&telno=' . $encTel[0] . '&response_url=https://' . $_SERVER["HTTP_HOST"] . '/e-contract-api/return-pre-call-auto&timer=600sec';
//     // 本番
//     $post = 'company=1006&code=C60&telno=' . $encTel[0] . '&response_url=https://' . $_SERVER["HTTP_HOST"] . '/e-contract-api/return-pre-call-auto&timer=600sec';
    
//     // Smart-in PreCallAuto API
//     $preCallAutoResponse = $client->setRawData($post)->request('POST');
//     // 戻り値
//     $preCallAutoResponse = $this->getResponce($preCallAutoResponse);

//     echo json_encode($preCallAutoResponse['body']);
//     exit;
//   }

//   /***
//   * /e-contract-api/create-authorization
//   * POST e_contract_authorizationを登録する
//   ***/
//   public function createAuthorizationAction() {
//     $form = $this->_getAllParams();

//     // 操作ログ
//     $this->setLog("電子契約 e_contract_authorizationを登録する", json_encode($form));
//     // モデルを宣言
//     $eContractApiModel = Application_CommonUtil::getInstance("model", "EContractApiModel", $this->db);

//     $this->db->beginTransaction();
//     try {
//       $result = $eContractApiModel->createAuthorization($form);
//       $this->db->commit();
//       echo json_encode($result);
//       exit;
//     } catch(Exception $e) {
//       $this->db->rollBack();
//       error_log($e->getMessage());
//       throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
//     }
//   }

//   /***
//   * /e-contract-api/return-pre-call-auto
//   * POST Smart-in PreCallAuto API 認証結果通知
//   ***/
//   public function returnPreCallAutoAction() {
//     $form = $this->_getAllParams();
//     $request = $this->getRequest();

//     // 操作ログ
//     $this->setLog("電子契約 Smart-in PreCallAuto認証結果通知", json_encode($form));

//     // POST
//     if($request->isPost()) {
//       // モデルを宣言
//       $eContractApiModel = Application_CommonUtil::getInstance("model", "EContractApiModel", $this->db);

//       $eContractApiModel->returnPreCallAuto($form);

//       // 戻り値の設定
//       http_response_code(200);
//       $response = ['code' => 'OK'];
//       echo json_encode($response);
//     }
//   }
  

//   /***
//   * Zend_Http_Clientからデータを取得するための関数
//   * typeがarrayの場合は例外が発生しcatchでハンドリングした結果
//   ***/
//   private function getResponce($response) {
//     $result = array();
//     if(is_array($response)){
//       $result = $response;
//     }else{
//       $result["status"] = $response->getStatus();
//       $result["isSuccess"] = $response->isSuccessful();
//       $result["isError"] = $response->isError();
//       $result["message"] = $response->getMessage();
//       $result["body"] = json_decode($response->getBody(), true);
//     }
//     return $result;
//   }

//   /**
//    * 電子証明書申請のバリデーション
//    * @param unknown $form
//    */
//   function eContractCertificateValidation($form) {
//     $validationDict = array(
//       "lastname"          => array("name" =>"姓",           "length" => 32,   "validate" => array(1)),
//       "firstname"         => array("name" =>"名",           "length" => 32,   "validate" => array(1)),
//       "lastnameReading"   => array("name" =>"姓（フリガナ）", "length" => 32,   "validate" => array(1, 10)),
//       "firstnameReading"  => array("name" =>"名（フリガナ）", "length" => 32,   "validate" => array(1, 10)),
//       "department"        => array("name" =>"所属部署",      "length" => 32,   "validate" => array(1)),
//       "title"             => array("name" =>"役職",         "length" => 32,   "validate" => array(1)),
//       "email"             => array("name" =>"メールアドレス", "length" => 100,  "validate" => array(7)),
//       "phone"             => array("name" =>"電話番号",      "length" => 20,   "validate" => array(11)),
//       "postalCode"        => array("name" =>"郵便番号",      "length" => 20,   "validate" => array(12)),
//       "address"           => array("name" =>"所在地住所",    "length" => 100,  "validate" => array(1)),
//       "organizationName"  => array("name" =>"法人名",       "length" => 100,  "validate" => array(1)),
//       "corporationNumber" => array("name" =>"法人番号",     "length" => 20,   "validate" => array(1, 2)),
//       "businessName"      => array("name" =>"屋号",         "length" => 100,  "validate" => array(1)),
//       "onetimepass"      => array("name" =>"確認コード",         "length" => 8,  "validate" => array(1))
//     );
//     $errorList = executionValidation($form, $validationDict);
//     if (!empty($form['onetimepass']) && mb_strlen($form['onetimepass']) !== 8) {
//       $errorList[] = ['onetimepass' => '確認コードは半角数字8文字で入力してください。'];
//     }
//     return $errorList;
//   }

//   /**
//    * 印影画像作成・設定のバリデーション
//    * @param unknown $form
//    */
//   function eContractSignImageValidation($form) {
//     $validationDict = array(
//       "sign1" => array("name" =>"1行目", "length" => 10, "validate" => array(1)),
//       "sign2" => array("name" =>"2行目", "length" => 10, "validate" => array()),
//       "sign3" => array("name" =>"3行目", "length" => 10, "validate" => array()),
//       "sign4" => array("name" =>"4行目", "length" => 10, "validate" => array())
//     );
//     $errorList = executionValidation($form, $validationDict);
//     return $errorList;
//   }

//   /**
//    * AAもしくはCEアカウント以外をトップへリダイレクトさせる
//    */
//   public function authCheckStaffList(){
//     $prm = $this->_getAllParams();

//     // 認証
//     if ($this->user['staff_type'] == "AA" ) {
//     } else if ($this->user['staff_type'] == "CE") {
//     } else {
//       // 不正アクセスの場合
//       $this->_redirect('/index/menu');
//     }
//   }

}
