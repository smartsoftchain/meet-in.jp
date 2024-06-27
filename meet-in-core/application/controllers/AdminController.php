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
    const ROLE_CE_ADM = "CE_1";
    const ROLE_CE_STF = "CE_2";
    const IDENTIFIER = "notification";

    public function init()
    {
        parent::init();
        /* Initialize action controller here */

        // ログインチェック
        $auth = Zend_Auth::getInstance();
        if ($auth->hasIdentity() == true) {

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
        } else {
            $form = $this->_getAllParams();
            if ($form['action'] != 'index' && $form['action'] != 'login') {
                $this->_redirect('/index');
            }
        }
    }

    /**
     * インデックス画面
     */
    public function indexAction()
    {
        $this->_redirect('/index');
    }


    /**
     * 担当者一覧
     */
    public function aggregateListAction()
    {
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
    public function staffListAction()
    {
        $this->authCheckStaffList();
        $form = $this->_getAllParams();

        // MEMO. すべてのリンクは AAの場合のみ表示するようにしている AAではないユーザが開いてはならない.
        if($this->user['staff_type'] !== "AA") {
            $this->_redirect('/index/menu');
        }

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
        $staffDict["delete_general_authority_flg"] = $form["delete_general_authority_flg"];
        $staffDict["e_contract_authority_flg"] = $form["e_contract_authority_flg"];
        $this->view->staffDict = $staffDict;
        $pram = array();
        if (!empty($form["staff_type"])) {
            $pram["staff_type"] = $form["staff_type"];
        }
        if (!empty($form["client_id"])) {
            $pram["client_id"] = $form["client_id"];
        }
        $this->view->pram = $pram;
        // プランを画面に渡す
        $masterClientDao = Application_CommonUtil::getInstance('dao', "MasterClientDao", $this->db);
        $client = $masterClientDao->getMasterClientRow($staffDict["client_id"]);
        $this->view->plan = $client["plan"];
        // 担当者を追加可能か判定用フラグ取得
        $addStaffFlg = true;
        if ($pram["staff_type"] == "CE" && $form["client_id"]) {
            $adminClientModel = Application_CommonUtil::getInstance("model", "AdminClientModel", $this->db);
            $addStaffFlg = $adminClientModel->checkAddStaff($staffDict["client_id"], $client["plan_this_month"]);
        }
        $this->view->addStaffFlg = $addStaffFlg;
    }

    /**
     * 担当者一覧
     */
    public function clientEditAction()
    {
        $this->authCheckClient();
        $form = $this->_getAllParams();
        $request = $this->getRequest();
        $form["plan_select_type"] = $form["staff_type"];
        $form["staff_type"] = "CE";
        // モデル宣言
        $adminClientModel = Application_CommonUtil::getInstance("model", "AdminClientModel", $this->db);
        // 画面表示に必要なデータを取得
        $result = $adminClientModel->clientRegist($form, $request);
        if ($result["registCompleteFlg"] == 1) {
            // 登録完了の場合は一覧へ遷移
            $this->_redirect("/admin/client-edit?client_id={$result["client_id"]}&ret={$result["ret"]}");
        }
        $this->view->clientDict = $result["clientDict"];
        $this->view->aaStaffListJson = $result["aaStaffListJson"];
        $this->view->checkAAStaffListJson = $result["checkAAStaffListJson"];
        $this->view->errorList = $result["errorList"];
        $this->view->plan = $result["plan"];
        $this->view->addStaffFlg = $result["addStaffFlg"];
        $this->view->clientTypes = $result["clientTypes"];
        $this->view->distributorList = $result["distributorList"];
        foreach ($result["distributorList"] as $distributor) {
            if ($distributor['client_id'] == $result["clientDict"]['distribution_channel_client_id']) {
                $this->view->distributor = $distributor;
                break;
            }
        }

        $this->view->distributorList = $result["distributorList"];



        //		$this->authCheckStaffList();
        //		$form = $this->_getAllParams();

        // モデル宣言
        $adminModel = Application_CommonUtil::getInstance("model", "AdminModel", $this->db);
        $authModel = Application_CommonUtil::getInstance("model", "ApiScAuthModel", $this->db);
        $mtaModel = Application_CommonUtil::getInstance("model", "ApiScMtaModel", $this->db);
        $domainModel = Application_CommonUtil::getInstance("model", "ApiScDomainModel", $this->db);

        $authResult = $authModel->isAuthenticated();
        $mtaSettings = array();
        $domains = array();
        if ($authResult["status"] === true) {
            $mtaSettings = $mtaModel->fetchAll();
            $domains = $domainModel->fetchAll();
        }
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
        $this->view->accountMtas = $mtaSettings["result"];
        $this->view->accountDomains = $domains["result"];
        $this->view->authResult = $mtaSettings["status"];
    }

         /**
         * ユーザー一覧CSVダウンロード
         */
        public function downloadCsvAction() {

                // ユーザー一覧
                $this->setLog("ユーザー一覧ダウンロード", json_encode($this->_getAllParams()));
                $form = $this->_getAllParams();
                $form["plan_select_type"] = $form["staff_type"];
                $form["staff_type"] = "CE";

                $adminModel = Application_CommonUtil::getInstance("model", "AdminModel", $this->db);

                // CSVデータを取得する
                $csvData = $adminModel->getCsvResult();

                // ファイル名を設定
                $fileName = "userlist.csv";

                // 文字コードをSJISに変換
                $userAgent = $_SERVER['HTTP_USER_AGENT'];
                if(strpos($userAgent,'iPad') && strpos($userAgent,'iPhone')){
                }else if (strpos($userAgent,'Mac') && strpos($userAgent,'Safari')) {
                        // iPad　iOS13以上のデスクトップ表示対策
                } else {
                        // iPad以外はsjisに変換する
                        $csvData = mb_convert_encoding($csvData, 'sjis-win', 'UTF-8');
                }

                header('Pragma: public');
                $this->getResponse()
                        ->setHeader('Content-disposition','attachment; filename*=UTF-8\'\'' . rawurlencode($fileName))
                        ->setHeader('Content-type', 'test/x-csv')
                        ->setHeader('Pragma', 'no-cache')
                        ->sendHeaders();

                $this->getResponse()->appendBody($csvData);
                $this->getResponse()->outputBody();

                exit;
	}

    /**
     * クライアントの担当スタッフ一覧取得
     */
    public function getClientStaffListAction()
    {
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
    public function clientEditoneAction()
    {
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
    public function staffRegistAction()
    {
        $this->authCheckStaffRegist();
        $form = $this->_getAllParams();
        $request = $this->getRequest();

        // MEMO. staff_id を持っていない場合は 新規登録画面のときとしてありえる。 URLのstaff_id を操作して 違う会社のスタッフを閲覧できたのでclient_idを確認する.
        if(array_key_exists("staff_id", $form) && $this->user['client_id'] != $form['client_id'] && $this->user['staff_type'] !== "AA"){
            $this->_redirect('/index/menu');
        }

        $ret = array();
        $ret["top"] = "0";
        if (array_key_exists("ret", $form) && $form["ret"] == "top") {
            $ret["top"] = "1";
        }
        // モデル宣言
        $adminModel = Application_CommonUtil::getInstance("model", "AdminModel", $this->db);
        // 画面表示に必要なデータを取得
        $result = $adminModel->staffRegist($form, $request);

        // データの取得結果で分岐を変更する.
        $act = "";
        if($result==false) {
            $act = "/index/menu"; // URLの不正操作の疑い.
        } else if ($result["registCompleteFlg"] == 1) {
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
                if ($this->user["staff_type"] == "AA") {
                    $act = "/admin/staff-list?staff_type={$result["staffDict"]['staff_type']}&client_id={$form['client_id']}";
                } else {
                    // CE管理者の場合は組織情報画面に遷移させる（この処理へは、CE管理者しか来れないので、CEのみ判定）
                    $act = "/admin/client-edit?staff_type=CE&client_id={$this->user['client_id']}&ret=top";
                }
            }
        }
        if($act !== "") {
            $this->_redirect('' . $act);
        }

        $this->view->staffDict = $result["staffDict"];
        $this->view->shareRoomNameTemplate = $result["shareRoomNameTemplate"];
        $this->view->errorList = $result["errorList"];
        $this->view->ret = $ret;
        $this->view->pageStaffType = $form["staff_type"];

        //		$this->view->payment_type_select = $adminModel->getPaymentTypeSelectBox();
    }

    /**
     * 担当者登録画面
     */
    public function staffRegistoneAction()
    {
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
    public function staffDeleteAction()
    {
        $this->authCheckStaffList();
        $form = $this->_getAllParams();
        $request = $this->getRequest();
        // モデル宣言
        $adminModel = Application_CommonUtil::getInstance("model", "AdminModel", $this->db);
        $result = $adminModel->staffDelete($form, $request);
        echo $result;
    }

    /**
     * 担当者の二要素認証
     * /admin/authenticate-staff
     * 個人設定画面にQRコードを表示する
     */
    public function authenticateStaffAction()
    {
        $this->authCheckStaffList();
        $form = $this->_getAllParams();
        // セッションを取得
        $session = Application_CommonUtil::getSession(self::IDENTIFIER);
        // モデル宣言
        $authenticateInfoModel = Application_CommonUtil::getInstance("model", "AuthenticateInfoModel", $this->db);
        // QRコード情報を取得
        $result = $authenticateInfoModel->getAuthenticate($form);

        echo $result["qrUrl"];
        exit;
    }

    /**
     * QRコードによる二要素認証
     * /admin/verify
     */
    public function verifyAction()
    {
        $this->authCheckStaffList();
        $form = $this->_getAllParams();
        $req = $this->getRequest();
        // モデル宣言
        $authenticateInfoModel = Application_CommonUtil::getInstance("model", "AuthenticateInfoModel", $this->db);
        // コード検証
        $result = $authenticateInfoModel->verifyCode($form, $req);
        echo $result;
        exit;
    }

    /**
     * クライアント一覧画面
     */
    public function clientListAction()
    {
        $this->authCheckClient();
        $form = $this->_getAllParams();

        if($this->user['staff_type'] !== "AA") {
            $this->_redirect('/index/menu');
        }

        // モデル宣言
        $adminClientModel = Application_CommonUtil::getInstance("model", "AdminClientModel", $this->db);
        // 画面表示に必要なデータを取得
        $result = $adminClientModel->getClientList($form, $this->namespace);
        if ($form['order']) {
            $this->view->select_css = $form['order'] . "-" . $form['ordertype'];
        } else {
            $this->view->select_css = '';
        }
        $this->view->list = $result["list"];
        $this->view->free_word = $this->namespace->free_word;
        $this->view->registMsg = $result["registMsg"];
    }


    /**
     * クライアント登録画面
     */
    public function clientRegistAction()
    {
        $this->authCheckClient();
        $form = $this->_getAllParams();
        $request = $this->getRequest();

        if (isset($form["negotiation_audio_text_remaining_hour"]) && 0 < $form["negotiation_audio_text_remaining_hour"]) {
            $form["negotiation_audio_text_time_limit_second"] = $form["negotiation_audio_text_remaining_hour"];
        }
        if (isset($form["negotiation_audio_analysis_remaining_hour"]) && 0 < $form["negotiation_audio_analysis_remaining_hour"]) {
            $form["negotiation_audio_analysis_time_limit_second"] = $form["negotiation_audio_analysis_remaining_hour"];
        }


        // モデル宣言
        $adminClientModel = Application_CommonUtil::getInstance("model", "AdminClientModel", $this->db);
        // 画面表示に必要なデータを取得
        $result = $adminClientModel->clientRegist($form, $request);
        if ($result["registCompleteFlg"] == 1) {
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
        $this->view->plan = $result["plan"];
        $this->view->clientTypes = $result["clientTypes"];
        $this->view->distributorList = $result["distributorList"];
    }

    /**
     * クライアント削除処理
     */
    public function clientDeleteAction()
    {
        $this->authCheckClient();
        $form = $this->_getAllParams();
        $request = $this->getRequest();
        // モデル宣言
        $adminClientModel = Application_CommonUtil::getInstance("model", "AdminClientModel", $this->db);
        $result = $adminClientModel->clientDelete($form, $request);
        // 登録完了の場合は一覧へ遷移
        $this->_redirect('/admin/client-list');
        echo $result;
    }

    /**
     * クライアント担当者一覧
     */
    public function clientStaffListAction()
    {
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
    public function clientStaffRegistAction()
    {
        $this->authCheckClient();
        $form = $this->_getAllParams();
        $request = $this->getRequest();

        // モデル宣言
        $adminModel = Application_CommonUtil::getInstance("model", "AdminModel", $this->db);
        // 画面表示に必要なデータを取得
        $result = $adminModel->clientStaffRegist($form, $request);
        if ($result["registCompleteFlg"] == 1) {
            // 登録完了の場合は一覧へ遷移
            $this->_redirect("/admin/client-staff-list?client_id={$result["client_id"]}");
        }
        $this->view->clientStaffDict = $result["clientStaffDict"];
        $this->view->errorList = $result["errorList"];

        $this->view->payment_type_select = $adminModel->getPaymentTypeSelectBox();
    }

    /*
     * 販売店一覧.
     * クライアントのうち代理店の一覧表示.
     */
    public function distributorListAction()
    {
        $this->authCheckClient();

        // モデル宣言
        $adminClientModel = Application_CommonUtil::getInstance("model", "AdminClientModel", $this->db);
        // 画面表示に必要なデータを取得
        $result = $adminClientModel->getDistributorList($this->_getAllParams(), $this->namespace);

        $_filters = array(
            'active' => true,
            'near_expiration' => true,
            'expiration' => true
        );
        $filters = $_filters;
        foreach ($filters as $key => $val) {
            $filters[$key] = array_key_exists($key, $this->_getAllParams());
        }
        if (!in_array(true, $filters)) {
            $filters = $_filters;
        }

        $this->view->list = $result["list"];
        $this->view->filters = $filters;
        $this->view->free_word = $this->namespace->free_word;
        $this->view->registMsg = $result["registMsg"];
    }

    /*
     * 販売店の顧客一覧.
     * クライアントのうち引数で指定した代理店が販売した顧客の一覧表示.
     */
    public function distributorClientListAction()
    {
        // 認証
        $this->authCheckDistributor($this->_getAllParams()['client_id'] == $this->user['client_id']);

        // モデル宣言
        $adminClientModel = Application_CommonUtil::getInstance("model", "AdminClientModel", $this->db);
        // 画面表示に必要なデータを取得
        $result = $adminClientModel->getDistributorClientList($this->_getAllParams(), $this->namespace);

        $_filters = array(
            'active' => true,
            'not_active' => true,
            'valid' => true,
            'near_expiration' => true,
            'expiration' => true
        );
        $filters = $_filters;
        foreach ($filters as $key => $val) {
            $filters[$key] = array_key_exists($key, $this->_getAllParams());
        }
        if (!in_array(true, $filters)) {
            $filters = $_filters;
        }

        $this->view->param = array('client_id' => $this->_getAllParams()['client_id']);

        $this->view->list = $result["list"];
        $this->view->free_word = $this->namespace->free_word;
        $this->view->filters = $filters;
        $this->view->registMsg = $result["registMsg"];
        $this->view->currentClientID = $this->_getAllParams()['client_id'];
    }


    /*
     * 販売店の顧客データ.
     * クライアントのうち引数で指定した 代理店が販売した顧客1件表示.
     */
    public function distributorClientDataAction()
    {

        // モデル宣言
        $adminClientModel = Application_CommonUtil::getInstance("model", "AdminClientModel", $this->db);
        $result = $adminClientModel->getClient($this->_getAllParams());

        // 不正に他の代理店が取った契約を閲覧しようとしていた場合 user->client_id と distribution_channel_client_id(購入経路)は一致しない.
        $this->authCheckDistributor($this->user['client_id'] == $result["clientDict"]['distribution_channel_client_id']);

        if ($result["clientDict"]['aa_staff_id_list'] != "") {
            $adminModel = Application_CommonUtil::getInstance("model", "AdminModel", $this->db);
            $result["clientDict"]['aa_staff_list'] = $adminModel->getStaffListFromAAStaffIdList($result["clientDict"]['aa_staff_id_list']);
        }

        $this->view->clientDict = $result["clientDict"];
        $this->view->distributorDict = $result["distributorDict"];
        $this->view->clientTypes = $result["clientTypes"];
        $this->view->plan = $result["plan"];
        $this->view->plan = $result["plan"];
    }



    public function authCheckStaffList()
    {
        $prm = $this->_getAllParams();

        // 認証
        if ($this->user['staff_type'] == "AA") {
        } elseif ($this->user['staff_type'] == "CE") {
        } else {
            // 不正アクセスの場合
            $this->_redirect('/index/menu');
        }
    }

    public function authCheckStaffRegist()
    {
        $prm = $this->_getAllParams();

        // 認証
        if ($this->user['staff_type'] == "AA" && $this->user['staff_role'] == self::ROLE_ADM) {
        } elseif ($prm['staff_type'] == $this->user['staff_type'] &&
                    $prm['staff_id'] == $this->user['staff_id']) {
        } elseif ($this->user['staff_role'] == self::ROLE_CE_ADM) {
            // CEの管理者の場合は担当者追加ができるようになった
        } else {
            // 不正アクセスの場合
            $this->_redirect('/index/menu');
        }
    }

    public function authCheckClient()
    {
        $prm = $this->_getAllParams();

        // 認証
        if ($this->user['staff_type'] == "AA") {
        } elseif ($prm['client_id'] == $this->user['client_id']) {
        } else {
            // 不正アクセスの場合
            $this->_redirect('/index/menu');
        }
    }

    public function authCheckDistributor($is_client_id_check = true)
    {

        // 認証
        if ($this->user['staff_type'] == "AA" || $this->user['client_type'] == "2" && $is_client_id_check) {
            return;
        }

        // 不正アクセスの場合
        $this->_redirect('/index/menu');
    }

    // 文字起こしの時間を即時登録（秒数に反映）する処理
    public function updateNegotiationAudioTextTimeImmediatelyAction()
    {
        $this->authCheckClient();
        $form = $this->_getAllParams();
         //バリデーション AA以外を弾く
        if ($this->user['staff_type'] !== "AA") {
             // 不正アクセスの場合
            $this->_redirect('/index/menu');
            return;
        }

        $adminClientModel = Application_CommonUtil::getInstance("model", "AdminClientModel", $this->db);
        $result = $adminClientModel->updateNegotiationAudioTextTimeLimitSecondImmediately($form);

        if ($result["validationError"] && $result["validationError"] == true) {
            // 不正アクセスの場合
            $this->_redirect('/index/menu');
            return;
        }

        echo json_encode($result);
		exit;
    }

    // 音声分析の時間を即時登録（秒数に反映）する処理
    public function updateNegotiationAudioAnalysisTimeImmediatelyAction()
    {

        $this->authCheckClient();
        $form = $this->_getAllParams();
        
        //バリデーション AA以外を弾く
        if ($this->user['staff_type'] !== "AA") {
            // 不正アクセスの場合
            $this->_redirect('/index/menu');
            return;
        }

        $adminClientModel = Application_CommonUtil::getInstance("model", "AdminClientModel", $this->db);
        $result = $adminClientModel->updateNegotiationAudioAnalysisTimeLimitSecondImmediately($form);

        if ($result["validationError"] && $result["validationError"] == true) {
            // 不正アクセスの場合
            $this->_redirect('/index/menu');
            return;
        }
        
		echo json_encode($result);
		exit;
    }

    public function materialListAction()
    {
        // ヘッダーメニューを非表示にしているアカウントが直接URLアクセス時にリダイレクト
		if (!$this->user["admin_header_enable"]) {
            $this->_redirect('/index/menu');
        }
        $this->authCheckStaffList();
        $form = $this->_getAllParams();

        if (isset($form["document_narrow_flg"])) {
            $_SESSION['document_narrow_flg'] = $form["document_narrow_flg"];
        }else {
            $form["document_narrow_flg"] = $_SESSION['document_narrow_flg'] ? $_SESSION['document_narrow_flg'] : 0;
        }

        $adminModel = Application_CommonUtil::getInstance("model", "AdminModel", $this->db);
        $result = $adminModel->getMaterialList($form, $this->namespace);
        $this->view->list = $result["list"];
        $this->view->document_narrow_flg = $form["document_narrow_flg"];
        $this->view->materialSizeDict = $result["materialSizeDict"];
    }
    public function materialEditAction()
    {
        $this->authCheckStaffList();
        $form = $this->_getAllParams();
        $request = $this->getRequest();

        $adminModel = Application_CommonUtil::getInstance("model", "AdminModel", $this->db);
        $result = $adminModel->editMaterial($form, $request);
        $this->view->material = $result["material"];
        $this->view->errorList = $result["errorList"];
        if ($request->isPost()) {
            // 登録・更新
            if (empty($result["errorList"])) {
                // エラーがなければ一覧に戻る
                $this->_redirect('/admin/material-list');
            } else {
                // エラーがあれば編集画面のまま
                $this->view->material = $form;
            }
        }
    }
    public function materialDetailEditAction()
    {
        $this->authCheckStaffList();
        $form = $this->_getAllParams();

        $adminModel = Application_CommonUtil::getInstance("model", "AdminModel", $this->db);
        $result = $adminModel->getMaterialDetailList($form);
        $this->view->material = $result["material"];
        $this->view->materialDetailList = $result["list"];
        $this->view->errorList = $result["errorList"];
    }
    public function deleteMaterialAction()
    {
        $form = $this->_getAllParams();
        $request = $this->getRequest();
        $result = array();
        $adminModel = Application_CommonUtil::getInstance("model", "AdminModel", $this->db);
        $result = $adminModel->deleteMaterial($form, $request);
        echo json_encode($result);
        exit;
    }
    public function deleteMaterialDetailPageAction()
    {
        $form = $this->_getAllParams();
        $request = $this->getRequest();
        $result = array();
        $adminModel = Application_CommonUtil::getInstance("model", "AdminModel", $this->db);
        $result = $adminModel->deleteMaterialDetailPage($form, $request);
        echo json_encode($result);
        exit;
    }
    public function getMaterialDetailAction()
    {
        $form = $this->_getAllParams();
        $request = $this->getRequest();

        $result = array();
        $adminModel = Application_CommonUtil::getInstance("model", "AdminModel", $this->db);
        $result = $adminModel->getMaterialDetail($form, $request);
        echo json_encode($result);
        exit;
    }
    public function setMaterialDetailAction()
    {
        $form = $this->_getAllParams();
        $request = $this->getRequest();

        $result = array();
        $adminModel = Application_CommonUtil::getInstance("model", "AdminModel", $this->db);
        $result = $adminModel->setMaterialDetail($form, $request);
        echo json_encode($result);
        exit;
    }
    public function setMaterialDetailPageAction()
    {
        $form = $this->_getAllParams();
        $request = $this->getRequest();
        error_log(json_encode($form));
        $result = array();
        $adminModel = Application_CommonUtil::getInstance("model", "AdminModel", $this->db);
        $result = $adminModel->swapMaterialDetailPage($form, $request);
        echo json_encode($result);
        exit;
    }
    public function checkStaffPasswordAction()
    {
        $form = $this->_getAllParams();
        $request = $this->getRequest();
        $result = array();
        $adminModel = Application_CommonUtil::getInstance("model", "AdminModel", $this->db);
        $result = $adminModel->checkStaffPassword($form, $request);
        echo json_encode($result);
        exit;
    }
    public function authLoginStaff($param = array())
    {
        if (!isset($this->user["staff_type"]) || empty($this->user["staff_type"])) {
            return false;
        }
        if (is_array($param['staff_type'])) {
            foreach ($param['staff_type'] as $staff_type) {
                if ($this->user["staff_type"] == $staff_type) {
                    return true;
                }
            }
        }
        return false;
    }
    public function negotiationTmplListAction()
    {
        // クライアントIDがない場合はindex/menu
        $form = $this->_getAllParams();
        if (!$this->authLoginStaff(array("staff_type" => array("AA", "CE"))) || ($this->user["client_id"] == 0)) {
            if ($this->user["staff_type"] == "AA") {
                $this->_redirect('/client/list');
            } else {
                $this->_redirect('/index/menu');
            }
        }
        if (!empty($this->user["client_id"])) {
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
    public function negotiationTmplEditAction()
    {
        // クライアントIDがない場合はindex/menu
        if (!$this->authLoginStaff(array("staff_type" => array("AA", "CE"))) ||
                ($this->user["client_id"] == 0)) {
            if ($this->user["staff_type"] == "AA") {
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
        if (!empty($result["tmpl"]["result_list"])) {
            $this->view->tmpl_result_list = json_decode($result["tmpl"]["result_list"]);
        }
        if (!empty($result["tmpl"]["next_action_list"])) {
            $this->view->tmpl_next_action_list = json_decode($result["tmpl"]["next_action_list"]);
        }

        $this->view->errorList = $result["errorList"];
        if ($request->isPost()) {
            // 登録・更新
            if (empty($result["errorList"])) {
                // エラーがなければ一覧に戻る
                $this->_redirect("/admin/negotiation-tmpl-list");
            } else {
                // エラーがあれば編集画面のまま
                $this->view->tmpl = $form;
            }
        }
    }
    public function negotiationTmplDeleteAction()
    {
        $result = array();
        if (!$this->authLoginStaff(array("staff_type" => array("AA", "CE"))) || $this->user["client_id"] == 0) {
            echo json_encode($result);
            exit;
        }
        $form = $this->_getAllParams();
        $adminModel = Application_CommonUtil::getInstance("model", "AdminModel", $this->db);
        $result = $adminModel->deleteNegotiationTmpl($form, $request);
        echo json_encode($result);
        exit;
    }
    public function embedLinkPublishAction()
    {
        // クライアントIDがない場合はindex/menu
        $form = $this->_getAllParams();
        if (!$this->authLoginStaff(array("staff_type" => array("AA", "CE"))) || ($this->user["client_id"] == 0)) {
            if ($this->user["staff_type"] == "AA") {
                $this->_redirect('/client/list');
            } else {
                $this->_redirect('/index/menu');
            }
        }
        if (!empty($this->user["client_id"])) {
            $form["client_id"] = $this->user["client_id"];
        }
    }

    /**
     * 名刺データアップロード
     * 名刺データを一時フォルダーへ保存する
     */
    public function namecardSaveAction()
    {
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
    private function tempPhotoFile($param)
    {
        if (isset($_FILES[$param['files']]) && $_FILES[$param['files']]["error"] == 0) {
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

            if (is_uploaded_file($tmp)) {
                // 一時アップロードディレクトリが存在しない場合は作成
                $directory_path = "{$param['document_root']}{$param['upload_dir']}";
                //「$directory_path」で指定されたディレクトリが存在するか確認
                if (!file_exists($directory_path)) {
                    //存在しない場合
                    if (mkdir($directory_path, 0777)) {
                        chmod($directory_path, 0777);
                    } else {
                        //作成に失敗した時の処理
                        error_log('ディレクトリ作成に失敗しました');
                    }
                }

                // 元ファイルを削除
                $delete_files = "{$param['document_root']}{$param['upload_dir']}{$tempFile}.*";
                //error_log("delete_files[".$delete_files."]\n", 3, "/var/tmp/negotiation.log");
                foreach (glob($delete_files) as $file) {
                    error_log($file);
                    unlink($file);
                }
                $filename = "{$tempFile}.{$ext}";
                $fullfile = "{$param['document_root']}{$tempFile}.{$ext}";
                //error_log("fullfile[".$fullfile."]\n", 3, "/var/tmp/negotiation.log");
                //error_log("return[".$filename."]\n", 3, "/var/tmp/negotiation.log");
                if (move_uploaded_file($tmp, $fullfile)) {
                    error_log('temp-data move_uploaded_file success');
                    return $filename;
                }
                return $filename;
            }
        }
        null;
    }

    /**
     * お知らせ一覧画面
     */
    public function notificationListAction()
    {
        $form = $this->_getAllParams();

        // モデルの宣言
        $adminModel = Application_CommonUtil::getInstance("model", "AdminModel", $this->db);
        $result = $adminModel->getNotificationList($form, $this->namespace);
        $this->view->list = $result["list"];

        // お知らせ未読関係の値をセッションから取得
        $session = Application_CommonUtil::getSession(self::IDENTIFIER);
        $unreadNotificationCount = $session->unreadNotificationCount;
        $alreadyReadNotificationsArray = $session->alreadyReadNotificationsArray;
        
        $this->view->unreadNotificationCount = $unreadNotificationCount;
        $this->view->alreadyReadNotificationsArray = $alreadyReadNotificationsArray;
    }

    /**
    * お知らせ登録・編集画面
    */
    public function notificationRegistAction()
    {
        $form = $this->_getAllParams();
        $request = $this->getRequest();

        // モデルの宣言
        $adminModel = Application_CommonUtil::getInstance("model", "AdminModel", $this->db);
        // 画面表示に必要なデータを取得
        $result = $adminModel->registNotification($form, $request);

        //お知らせ未読関連のセッション値を取り直して設定する
		$notificationModel = Application_CommonUtil::getInstance("model", "NotificationModel", $this->db);
		$notificationStaffReadsModel = Application_CommonUtil::getInstance("model", "NotificationStaffReadsModel", $this->db);
		if (isset($this->user)) {
			$alreadyReadNotifications =  $notificationStaffReadsModel->getAlreadyReadNotificationsId($this->user);
			$alreadyReadNotificationsArray = explode(',', ltrim($alreadyReadNotifications["already_read_notification_id_list"], ','));
			$unreadNotificationCount = $notificationModel->getUnreadNotificationCount($alreadyReadNotifications);

            // お知らせ関連のセッション値クリア
			Application_CommonUtil::unsetSession('notification');

			// セッションに既読お知らせ関連の値を設定する
			$session = Application_CommonUtil::getSession('notification');

			$session->alreadyReadNotifications = $alreadyReadNotifications;
			$session->alreadyReadNotificationsArray = $alreadyReadNotificationsArray;
			$session->unreadNotificationCount = $unreadNotificationCount;

            $this->view->unreadNotificationCount = $unreadNotificationCount;
        }

        $this->view->notification = $result["notification"];
        $this->view->errorList = $result["errorList"];

        if ($result["registCompleteFlg"] == 1) {
            // 登録完了の場合は一覧に遷移
            $this->_redirect('/admin/notification-list');
        }
    }

    /**
     * お知らせの削除処理
     */
    public function deleteNotificationAction()
    {
        $form = $this->_getAllParams();
        $request = $this->getRequest();
        // モデルの宣言
        $adminModel = Application_CommonUtil::getInstance("model", "AdminModel", $this->db);
        $result = $adminModel->deleteNotification($form, $request);

         //お知らせ未読関連のセッション値を取り直して設定する
		$notificationModel = Application_CommonUtil::getInstance("model", "NotificationModel", $this->db);
		$notificationStaffReadsModel = Application_CommonUtil::getInstance("model", "NotificationStaffReadsModel", $this->db);
		if (isset($this->user['client_id']) && isset($this->user['staff_id']) && isset($this->user['staff_type'])) {
			$alreadyReadNotifications =  $notificationStaffReadsModel->getAlreadyReadNotificationsId($this->user);
			$alreadyReadNotificationsArray = explode(',', ltrim($alreadyReadNotifications["already_read_notification_id_list"], ','));
			$unreadNotificationCount = $notificationModel->getUnreadNotificationCount($alreadyReadNotifications);

            // お知らせ関連のセッション値クリア
			Application_CommonUtil::unsetSession('notification');

			// セッションに既読お知らせ関連の値を設定する
			$session = Application_CommonUtil::getSession('notification');

			$session->alreadyReadNotifications = $alreadyReadNotifications;
			$session->alreadyReadNotificationsArray = $alreadyReadNotificationsArray;
			$session->unreadNotificationCount = $unreadNotificationCount;

            $this->view->unreadNotificationCount = $unreadNotificationCount;
		}

        echo $result;
    }

    /**
     * お知らせ表示閉じる状態の保持
     * お知らせ未読表示改修の際に、閉じるボタンが消えたが今後の復活可能性が0ではないため残しておく
     */
    public function keepNotificationCloseAction()
    {
        // セッションを取得
        $session = Application_CommonUtil::getSession(self::IDENTIFIER);
        // お知らせ閉じる状態をセッションに保持する
        $session->close = true;
        // レンダリングを無効にする
        $this->_helper->viewRenderer->setNoRender();
    }

    /**
     * 背景設定画面
     */
    public function documentSettingsBackgroundAction()
    {
        // ヘッダーメニューを非表示にしているアカウントが直接URLアクセス時にリダイレクト
		if (!$this->user["admin_header_enable"]) {
            $this->_redirect('/index/menu');
        }
        error_log('documentSettingsBackgroundAction IN');
        // 認証
        $this->authCheckStaffList();
        // 取得
        $form = $this->_getAllParams();
        $adminModel = Application_CommonUtil::getInstance("model", "AdminModel", $this->db);
        $result = $adminModel->getBodypixInfo($form, $this->namespace);
        $this->view->bodypix_background_path = $result["bodypix_background_path"];
        $this->view->bodypix_internal_resolution = $result["bodypix_internal_resolution"];
        $this->view->bodypix_segmentation_threshold = $result["bodypix_segmentation_threshold"];
        $this->view->bodypix_mask_blur_amount = $result["bodypix_mask_blur_amount"];
    }
    /**
     * 背景情報保存
     */
    public function saveBackgroundAction()
    {
        $form = $this->_getAllParams();

        error_log('saveBackgroundAction IN');
        // 認証
        $this->authCheckStaffList();
        // 保存
        $adminModel = Application_CommonUtil::getInstance("model", "AdminModel", $this->db);
        $result = $adminModel->saveBodypixInfo($form, $this->namespace);

        header("Access-Control-Allow-Origin: *");
        echo json_encode($result);
        exit;
    }
    /**
    * 背景設定テンプレート
    */
    public function documentSettingsBackgroundTmpAction()
    {
        error_log('documentSettingsBackgroundAction IN');
        // 認証
        $this->authCheckStaffList();
        // 取得
        $form = $this->_getAllParams();
    }
}
