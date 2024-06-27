<?php


/**
 * 管理者画面用モデル
 * @author admin
 *
 */
class AdminModel extends AbstractModel{
	
	const IDENTIFIER = "admin";									// セッション変数のnamespace
	const REFERER_STAFF_REGIST = "staff-regist";				// AA担当者登録のリファラー
	const REFERER_STAFF_LIST = "staff-list";					// AA担当者削除のリファラー
	const REFERER_HOME_STAFF_REGIST = "home-staff-regist";		// TA担当者登録のリファラー
	const REFERER_HOME_STAFF_LIST = "home-staff-list";			// TA担当者削除のリファラー
	const REFERER_CLEINT_STAFF_REGIST = "client-staff-regist";	// クライアント担当者登録のリファラー
	const REFERER_CLEINT_STAFF_LIST = "client-staff-list";		// クライアント担当者削除のリファラー
	const STAFF_TYPE_AA = "AA";									// 担当者種別AA
	const STAFF_TYPE_TA = "TA";									// 担当者種別TA
	const STAFF_TYPE_CE = "CE";									// 担当者種別CA
	const STAFF_ROLE_1 = 1;										// 管理者
	const STAFF_ROLE_2 = 2;										// 社員
	const STAFF_ROLE_3 = 3;										// バイト
	const CALL_TYPE_COPY = 1;									// 通話方式[1：クリップボードに電話番号を保存]',
	const CALL_TYPE_TELEPHONE = 2;								// 通話方式[2：WEB電話で通話開始]',
	
	private $db;									// DBコネクション
	// master_staffテーブルの初期値
	private $masterStaffDict = array(
								"staff_type" 			=>"",
								"staff_id" 				=>"",
								"staff_password" 		=>"",
								"client_id" 			=>"",
								"client_name" 			=>"",
								"staff_del_flg" 		=>"0",
								"staff_firstname" 		=>"",
								"staff_firstnamepy" 	=>"",
								"staff_comment" 		=>"",
								"staff_lastname" 		=>"",
								"staff_lastnamepy" 		=>"",
								"staff_name" 			=>"",
								"staff_email" 			=>"",
								"staff_role" 			=>"1",
								"webphone_id" 			=>"",
								"webphone_pass" 		=>"",
								"webphone_ip" 			=>"",
								"gaccount" 				=>"",
								"gaccount_pass" 		=>"",
								"telework_start_date" 	=>"",
								"telework_end_date" 	=>"",
								"call_type" 			=>"2",
								"sum_span_type" 		=>"3",
								"telephone_hour_price" 	=>"1500",
								"staff_payment_type" 	=>"1",
								"telephone_one_price"	=>"150",
								"maildm_hour_price"		=>"1500",
								"maildm_one_price"		=>"150",
								"inquiry_hour_price"	=>"1500",
								"inquiry_one_price"		=>"150",
								"auto_call" 			=>"0",
								"login_flg" 			=>"1",
								"desktop_notify_flg"	=> "1",
							);
	
	// 支払種別セレクト
	private $payment_type_select = array(
		"1" => "時給",
		"2"	=> "日給",
		"3"	=> "月給"
	);
	
	
	function __construct($db){
		parent::init();
		$this->db = $db;
	}
	
	public function init() {
	}
	
	/**
	 * 担当者一覧を取得する
	 * @param unknown $code
	 * @return string
	 */
	private function codeToMessage($code) {
		$message = "";
		switch($code) {
			case UPLOAD_ERR_OK:
				$message = 'アップロード成功';
				break;
			case UPLOAD_ERR_INI_SIZE:
			case UPLOAD_ERR_FORM_SIZE:
				$message = 'ファイルサイズオーバーです';
				break;
			case UPLOAD_ERR_PARTIAL:
				$message = 'ファイルの一部しかアップロードされていません';
				break;
			case UPLOAD_ERR_NO_FILE:
				$message = 'アップロードファイルがありません';
				break;
			case UPLOAD_ERR_NO_TMP_DIR:
				$message = 'テンポラリフォルダがありません';
				break;
			case UPLOAD_ERR_CANT_WRITE:
				$message = 'ディスクへの書き込みに失敗しました';
				break;
			case UPLOAD_ERR_EXTENSION:
				$message = '拡張によってアップロードが失敗しました';
				break;
			default:
				$message = '原因不明の失敗';
				break;
		}
		return $message;
	}
	public function getConnectionInfoList($form, &$screenSession){
		// セッションの初期化
		if($screenSession->isnew == true){
			$screenSession->order = 'room_access_cnt';
			$screenSession->page = 1;
			$screenSession->pagesize = 100;
			$screenSession->ordertype = 'desc';	// 任意
			$screenSession->free_word = "";
		}
		// パラメータをセッションに格納
		foreach($form as $key=>$val){
			$screenSession->$key = $val;
		}
		$condition = "1";
		// daoの宣言
		$connectionInfoDao = Application_CommonUtil::getInstance('dao', "ConnectionInfoDao", $this->db);
		$connectionInfoCount = $connectionInfoDao->getConnectionInfoCount($condition);
		$connectionInfoList = $connectionInfoDao->getConnectionInfoList($condition, $screenSession->order, $screenSession->ordertype, $screenSession->page, $screenSession->pagesize);
		// ページャ設定
		$list = new Application_Pager(array(
				"itemData" => $connectionInfoList,				// リスト
				"itemCount" => $connectionInfoCount,			// カウント
				"perPage" => $screenSession->pagesize,		// ページごと表示件数
				"curPage" => $screenSession->page,			// 表示するページ
				"order" => $screenSession->order,			// ソートカラム名
				"orderType" => $screenSession->ordertype,	// asc or desc
		));
		// 戻り値を作成する
		$result["list"] = $list;
		return $result;
	}
	/**
	 * 担当者一覧を取得する
	 * @param unknown $form
	 * @param unknown $screenSession
	 * @return Application_Pager
	 */
	function getStaffList($form, &$screenSession){
		// セッションの初期化
		if($screenSession->isnew == true){
			$screenSession->order = 'staff_id';
			$screenSession->page = 1;
			$screenSession->pagesize = 100;
			$screenSession->ordertype = 'asc';	// 任意
			$screenSession->free_word = "";
		}
		// パラメータをセッションに格納
		foreach($form as $key=>$val){
			$screenSession->$key = $val;
		}
		// daoの宣言
		$masterStaffDao = Application_CommonUtil::getInstance('dao', "MasterStaffDao", $this->db);
		// 変数宣言
		$condition = " staff_del_flg = 0";		// SQLの検索条件を設定
		if(array_key_exists("staff_type", $form)){
			$condition .= " AND staff_type = '{$form['staff_type']}' ";
		}
		if(array_key_exists("client_id", $form) && !empty($form["client_id"])){
				$condition .= " AND client_id = '{$form['client_id']}' ";
		}
		// 検索ボタンが押下された場合、ページを初期化する
		if(array_key_exists("free_word", $form)){
			$screenSession->page = 1;
		}
		// 検索条件が存在する場合は検索条件を作成する
		if($screenSession->free_word != ""){
			$escapeText = $this->escape($screenSession->free_word);
			$condition .= " AND (staff_id like '%{$escapeText}%' OR AES_DECRYPT(staff_name, @key) LIKE '%{$escapeText}%' OR staff_firstnamepy LIKE '%{$escapeText}%' OR staff_lastnamepy LIKE '%{$escapeText}%' OR staff_email LIKE '%{$escapeText}%' OR webphone_id LIKE '%{$escapeText}%') ";
		}
		// 検索実施
		$masterStaffCount = $masterStaffDao->getMasterStaffCount($condition);
		$masterStaffList = $masterStaffDao->getMasterStaffList($condition, $screenSession->order, $screenSession->ordertype , $screenSession->page, $screenSession->pagesize);
		// ページャ設定
		$list = new Application_Pager(array(
				"itemData" => $masterStaffList,				// リスト
				"itemCount" => $masterStaffCount,			// カウント
				"perPage" => $screenSession->pagesize,		// ページごと表示件数
				"curPage" => $screenSession->page,			// 表示するページ
				"order" => $screenSession->order,			// ソートカラム名
				"orderType" => $screenSession->ordertype,	// asc or desc
		));
		// 戻り値を作成する
		$result["list"] = $list;
		$result["registMsg"] = "";
		// セッション取得
		$session = Application_CommonUtil::getSession(self::IDENTIFIER);
		if(!is_null($session->registComplete)){
			// セッション情報を初期化する
			Application_CommonUtil::unsetSession(self::IDENTIFIER);
			// メッセージを設定する
			$result["registMsg"] = $this->message->success->regist->aa_staff;
		}
		return $result;
	}

	public function checkStaffPassword($form, $request){
		// 戻り値の宣言
		$result = array();
		$masterStaffDao = Application_CommonUtil::getInstance('dao', "MasterStaffDao", $this->db);
		if(array_key_exists("staff_type", $form) && array_key_exists("staff_id", $form)){
			// 更新の場合はDBからデータを取得する
			$staffType = $this->escape($form["staff_type"]);
			$staffId = $this->escape($form["staff_id"]);
			$condition = " staff_type = '{$staffType}' AND staff_id = {$staffId} ";
			$staffDict = $masterStaffDao->getMasterStaffRow($condition);
			// パスワード一致チェック
			if(md5($form["staff_password"]) == $staffDict["staff_password"]){
				$result["result"] = 'true';
			} else {
				$result["result"] = 'false';
			}
		}
		return $result;
	}

	/**
	 * 画像一時保存
	 * ※アップロード画像を一時保存しURL(パス)を返す
	 */
    public function tempPhotoFile($param) {

		if(isset($_FILES[$param["files"]]) && $_FILES[$param["files"]]["error"] == 0) {

		// 一時ファイル名(client_id)が存在しない場合は、ファイル名に含めない
			$tempFile = "{$param['upload_dir']}/tmp_{$param['staff_type']}_{$param['staff_id']}-{$param['surffix']}";
			if( $param['client_id'] ) {
				$tempFile = "{$param['upload_dir']}/tmp_{$param['staff_type']}_{$param['staff_id']}_{$param['client_id']}-{$param['surffix']}";
			}
error_log("tempFile[".$tempFile."]\n", 3, "/var/tmp/negotiation.log");

			error_log(json_encode($_FILES[$param["files"]]));
			// UPロードされた画像の拡張子
			$ext = preg_replace('/(.+)\.(.+)/', '$2', $_FILES[$param["files"]]['name']);
			// UPロードされた画像のファイル名
			$tmp = $_FILES[$param["files"]]['tmp_name'];
error_log("tmp[".$tmp."]\n", 3, "/var/tmp/negotiation.log");

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
				$delete_files = "{$param['document_root']}{$tempFile}.*";
error_log("delete_files[".$delete_files."]\n", 3, "/var/tmp/negotiation.log");
				foreach(glob($delete_files) as $file) {
					error_log($file);
					unlink($file);
				}
				$filename = "{$tempFile}.{$ext}";
				$fullfile = "{$param['document_root']}{$tempFile}.{$ext}";
error_log("fullfile[".$fullfile."]\n", 3, "/var/tmp/negotiation.log");
error_log("return[".$filename."]\n", 3, "/var/tmp/negotiation.log");

				if(move_uploaded_file($tmp, $fullfile)) {
					error_log('temp-data move_uploaded_file success');
					return $filename;
				}
				return $filename;
			}
		}
		null;
	}

	/**
	 * 写真(写真１/写真２)本登録
	 * ただし、一時ファイル(tmpfiles)として保存されている場合のみ
	 */
    public function uploadPhotoFile($param) {
        if( $param["tmpfiles"] !== '' ) {
            $ext = preg_replace('/(.+)\.(.+)/', '$2', $param["tmpfiles"]);
            $tmp = "{$_SERVER['DOCUMENT_ROOT']}{$param["tmpfiles"]}";   // /www/

            if(file_exists($tmp)) {
                // 元ファイルを削除
                $delete_files = "{$param['upload_dir']}/{$param['staff_type']}_{$param['staff_id']}_{$param['client_id']}-{$param['surffix']}.*";
                foreach(glob($delete_files) as $file){
                    error_log($file);
                    unlink($file);
                }
                $fullfile = "{$param['upload_dir']}/{$param['staff_type']}_{$param['staff_id']}_{$param['client_id']}-{$param['surffix']}.{$ext}";

                if(rename($tmp, $fullfile)) {
                    error_log('photo-data move_uploaded_file success');
                }
            }
        }
    }

    /**
	 * プロフィール写真_本登録
	 * ただし、一時ファイル(tmpfiles)として保存されている場合のみ
	 */
	public function uploadProfileFile($param) {
		if( $param["tmpfiles"] !== '' ) {
			$ext = preg_replace('/(.+)\.(.+)/', '$2', $param["tmpfiles"]);
			$tmp = "{$_SERVER['DOCUMENT_ROOT']}{$param["tmpfiles"]}";   // /www/

			if(file_exists($tmp)) {
				// 元ファイルを削除
				$delete_files = "{$param['upload_dir']}/{$param['staff_type']}_{$param['staff_id']}.*";

				foreach(glob($delete_files) as $file){
					error_log($file);
					unlink($file);
				}
				$fullfile = "{$param['upload_dir']}/{$param['staff_type']}_{$param['staff_id']}.{$ext}";

				if(rename($tmp, $fullfile)) {
					error_log('Profile-data move_uploaded_file success');
				}
			}
		}
	}

	/**
	 * 名刺データ（画像 or PDF）_本登録
	 * ただし、一時ファイル(tmpfiles)として保存されている場合のみ
	 */
	public function uploadNamecardFile($param) {
		if( $param["tmpfiles"] !== '' ) {
			$ext = preg_replace('/(.+)\.(.+)/', '$2', $param["tmpfiles"]);
			$tmp = "{$_SERVER['DOCUMENT_ROOT']}{$param["tmpfiles"]}";

			if(file_exists($tmp)) {
				// 元ファイルを削除(移動前に、移動先ファイル削除)
				$delete_files = "{$param['upload_dir']}/{$param['staff_type']}_{$param['staff_id']}_{$param["client_id"]}.*";
				foreach(glob($delete_files) as $file){
					error_log($file);
					unlink($file);
				}

				// 移動(tmp -> $fullfile)
				$fullfile = "{$param['upload_dir']}/{$param['staff_type']}_{$param['staff_id']}_{$param["client_id"]}.{$ext}";
				if(rename($tmp, $fullfile)) {
					error_log('Namecard-data move_uploaded_file success');
				}
			}
		}
	}

	/**
	 * プロファイル画像削除
	 * アップロードされているプロファイル画像を削除する
	 */
	public function deleteProfileFile($param) {
error_log("deleteProfileFile delete_flg:(".$param["delete_flg"].")\n", 3, "/var/tmp/negotiation.log");
		if( $param["delete_flg"] === "0" ) {
			// ファイルを削除
			$delete_files = "{$param['upload_dir']}/{$param['staff_type']}_{$param['staff_id']}.*";
			foreach(glob($delete_files) as $file){
				error_log($file);
				unlink($file);
			}
		}
	}
	/**
	 * 名刺データ画像削除
	 * アップロードされている名刺データを削除する
	 */
	public function deleteNamecardFile($param) {
error_log("deleteNamecardFile delete_flg:(".$param["delete_flg"].")\n", 3, "/var/tmp/negotiation.log");
		if( $param["delete_flg"] === "0" ) {
			// ファイルを削除
			$delete_files = "{$param['upload_dir']}/{$param['staff_type']}_{$param['staff_id']}_{$param['client_id']}.*";
			foreach(glob($delete_files) as $file){
				error_log($file);
				unlink($file);
			}
		}
	}
	/**
	 * 写真画像削除
	 * アップロードされている写真(1&2)を削除する
	 */
	public function deletePhotoFile($param) {
error_log("deletePhotoFile delete_flg:(".$param["delete_flg"].")\n", 3, "/var/tmp/negotiation.log");
		if( $param["delete_flg"] === "0" ) {
			// ファイルを削除
			$delete_files = "{$param['upload_dir']}/{$param['staff_type']}_{$param['staff_id']}_{$param['client_id']}-{$param['surffix']}.*";
			foreach(glob($delete_files) as $file){
				error_log($file);
				unlink($file);
			}
		}
	}

	/**
	 * 担当者登録処理
	 * @param unknown $form
	 */
	public function staffRegist($form, $request){
		// 戻り値の宣言
		$result = array();
		$result["registCompleteFlg"] = 0;
		$result["errorList"] = array();
		// daoの宣言
		$masterStaffDao = Application_CommonUtil::getInstance('dao', "MasterStaffDao", $this->db);

		/*****************
		 * ファイル一時保存
		 *****************/
		// プロフィール写真
		$namecardProfileImgPath = null;
		$namecardProfileImgPath = $this->tempPhotoFile(array(
			"files" => "picture_file",
			"document_root" => $_SERVER['DOCUMENT_ROOT'],
			"upload_dir" => "/img/tmp_profile",
			"staff_type" => $form['staff_type'],
			"staff_id" => $form['staff_id'],
			"surffix" => 0,
		));
		if( $namecardProfileImgPath == null ) {
			$namecardProfileImgPath = $form['tmp_profile'];
		} else {
			$form['tmp_profile'] = $namecardProfileImgPath;
		}
		// 名刺データ（namecard_file）
		$namecardImgPath = null;
		$namecardImgPath = $this->tempPhotoFile(array(
			"files" => "namecard_file",
			"document_root" => $_SERVER['DOCUMENT_ROOT'],
			"upload_dir" => "/img/tmp_namecard",
			"staff_type" => $form['staff_type'],
			"staff_id" => $form['staff_id'],
			"client_id" => $form['namecard_client_id'],
			"surffix" => 0,
		));
		if( $namecardImgPath == null ) {
			$namecardImgPath = $form['tmp_namecard'];
		} else {
			$form['tmp_namecard'] = $namecardImgPath;
		}
		// 写真１
		$namecardPhoto1ImgPath = null;
		$namecardPhoto1ImgPath = $this->tempPhotoFile(array(
			"files" => "namecard_photo1",
			"document_root" => $_SERVER['DOCUMENT_ROOT'],
			"upload_dir" => "/img/tmp_profile",
			"staff_type" => $form['staff_type'],
			"staff_id" => $form['staff_id'],
			"client_id" => $form['namecard_client_id'],
			"surffix" => 1,
		));
		if( $namecardPhoto1ImgPath == null ) {
			$namecardPhoto1ImgPath = $form['tmpNamecard_photo1'];
		} else {
			$form['tmpNamecard_photo1'] = $namecardPhoto1ImgPath;
		}
		// 写真２
		$namecardPhoto2ImgPath = null;
		$namecardPhoto2ImgPath = $this->tempPhotoFile(array(
			"files" => "namecard_photo2",
			"document_root" => $_SERVER['DOCUMENT_ROOT'],
			"upload_dir" => "/img/tmp_profile",
			"staff_type" => $form['staff_type'],
			"staff_id" => $form['staff_id'],
			"client_id" => $form['namecard_client_id'],
			"surffix" => 2,
		));
		if( $namecardPhoto2ImgPath == null ) {
			$namecardPhoto2ImgPath = $form['tmpNamecard_photo2'];
		} else {
			$form['tmpNamecard_photo2'] = $namecardPhoto2ImgPath;
		}

		/**
		 * 登録処理
		 */
		if ($request->isPost() && Application_CommonUtil::refererCheck(self::REFERER_STAFF_REGIST)) {
			// 登録処理を行う
			// バリデーションを実行する
			$errorList = $this->masterStaffValidation($form, $masterStaffDao);
			if(count($errorList) == 0){
				// セッション取得
				$session = Application_CommonUtil::getSession(self::IDENTIFIER);
				// 画面で設定した値をその他の情報とマージする
				$staffDict = array_merge($session->staffRegist["staffDict"], $form);
				// webphone_idの設定によってcall_typeの設定値を変更する
				if($staffDict['webphone_id'] != ''){
					$staffDict['call_type'] = self::CALL_TYPE_TELEPHONE;	// 通話方式=WEB電話で通話開始
				}else{
					$staffDict['call_type'] = self::CALL_TYPE_COPY;			// クリップボードに電話番号を保存
				}
				// 氏名を結合したデータを作成する
				$staffDict["staff_name"] = "{$form['staff_firstname']} {$form['staff_lastname']}";
				// トランザクションスタート
				$this->db->beginTransaction();
				try{
					// 登録処理
					$sType = $staffDict['staff_type'];
					$staffDict['staff_id'] = $masterStaffDao->setStaff($staffDict);
					if($staffDict['staff_id'] == 0) {
						$errorList["error"][] = 'meetin番号の採番に失敗しました';
						throw new Exception('meetin number generation failure');
					}
					// メールを送信する
					$mailModel = Application_CommonUtil::getInstance('model', "MailModel", $this->db);
					if($sType == 'AA') {
						$mailModel->sendRegistAaAccountMail($staffDict);
					} else if($sType == 'CE') {
						$mailModel->sendRegistCeAccountMail($staffDict);
					}

					// プロフィール写真
					$this->uploadProfileFile(array(
						"files" => "picture_file",
						"staff_type" => $sType,
						"staff_id" => $staffDict['staff_id'],
						"upload_dir" => $_SERVER['DOCUMENT_ROOT'] . "/img/profile",
						"tmpfiles" => $form['tmp_profile']
					));
					// プロフィール写真削除(ただしpicture_flg='0'の場合のみ)
					$this->deleteProfileFile(array(
						"staff_type" => $sType,
						"staff_id" => $staffDict['staff_id'],
						"upload_dir" => $_SERVER['DOCUMENT_ROOT'] . "/img/profile",
						"delete_flg" => $form['picture_flg']
					));

					// 名刺
					$this->uploadNamecardFile(array(
						"files" => "namecard_file",
						"staff_type" => $sType,
						"staff_id" => $staffDict['staff_id'],
						"client_id" => $form['namecard_client_id'],
						"upload_dir" => $_SERVER['DOCUMENT_ROOT'] . "/img/namecard",
						"tmpfiles" => $form['tmp_namecard']
					));
					// 名刺データ削除(ただしnamecard_flg='0'の場合のみ)
					$this->deleteNamecardFile(array(
						"staff_type" => $sType,
						"staff_id" => $staffDict['staff_id'],
						"client_id" => $form['namecard_client_id'],
						"upload_dir" => $_SERVER['DOCUMENT_ROOT'] . "/img/namecard",
						"delete_flg" => $form['namecard_flg']
					));

					// 写真１
					$this->uploadPhotoFile(array(
						"files" => "namecard_photo1",
						"staff_type" => $sType,
						"staff_id" => $staffDict['staff_id'],
						"client_id" => $form['namecard_client_id'],
						"upload_dir" => $_SERVER['DOCUMENT_ROOT'] . "/img/photo-data",
						"surffix" => 1,
						"tmpfiles" => $form['tmpNamecard_photo1']
					));
					// 写真１削除(ただしphoto1_flg='0'の場合のみ)
					$this->deletePhotoFile(array(
						"staff_type" => $sType,
						"staff_id" => $staffDict['staff_id'],
						"client_id" => $form['namecard_client_id'],
						"upload_dir" => $_SERVER['DOCUMENT_ROOT'] . "/img/photo-data",
						"surffix" => 1,
						"delete_flg" => $form['photo1_flg']
					));

					// 写真２
					$this->uploadPhotoFile(array(
						"files" => "namecard_photo2",
						"staff_type" => $sType,
						"staff_id" => $staffDict['staff_id'],
						"client_id" => $form['namecard_client_id'],
						"upload_dir" => $_SERVER['DOCUMENT_ROOT'] . "/img/photo-data",
						"surffix" => 2,
						"tmpfiles" => $form['tmpNamecard_photo2']
					));
					// 写真２削除(ただしphoto2_flg='0'の場合のみ)
					$this->deletePhotoFile(array(
						"staff_type" => $sType,
						"staff_id" => $staffDict['staff_id'],
						"client_id" => $form['namecard_client_id'],
						"upload_dir" => $_SERVER['DOCUMENT_ROOT'] . "/img/photo-data",
						"surffix" => 2,
						"delete_flg" => $form['photo2_flg']
					));

					// 自分自身の変更かつ名前に変更があった場合はセッションの名前を変更する
					if(($this->user["staff_id"] == $staffDict["staff_id"]) && (($this->user["staff_type"] == $staffDict["staff_type"]))){
						$this->user["staff_firstname"] = $staffDict["staff_firstname"];
						$this->user["staff_lastname"] = $staffDict["staff_lastname"];
						$this->user["staff_name"] = $staffDict["staff_name"];
						$this->user["desktop_notify_flg"] = $staffDict["desktop_notify_flg"];
						// meetin番号が変わった場合、接続情報を更新する
						if(($this->user["meetin_number"] != $staffDict["meetin_number"]) && ($this->user["client_id"] != 0)) {
							$dict = array(
								'connect_no' => $staffDict["meetin_number"],
							);
							$condition = "(connect_no = '{$this->user["meetin_number"]}') AND (connection_request_start_datetime IS NULL) AND (connection_state <> 5)";
							// dao宣言
							$connectionInfoDao = Application_CommonUtil::getInstance("dao", "ConnectionInfoDao", $this->db);
							$connectionInfoDao->update($dict, $condition);
							$this->user["meetin_number"] = $staffDict["meetin_number"];
						}
						Zend_Auth::getInstance()->getStorage()->write($this->user);
					}
					$this->db->commit();
				}catch(Exception $e){
					$this->db->rollBack();
					throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
				}
				// 一覧画面でメッセージ表示用にセッションにデータを設定する
				$session->registComplete = 1;
				// 登録完了の場合は一覧へ遷移するためフラグを立てる
				$result["registCompleteFlg"] = 1;
				$result["staffDict"] = $staffDict;
			}else{
				// エラーの場合は登録画面へ戻るのでデータを設定する
				$form["namecard_name_public_flg"] = $form["name_public_flg"];
				$form["namecard_meetin_public_flg"] = $form["meetin_id_public_flg"];
				$form["namecard_client_name"] = $form["client_name"];
				$form["namecard_client_name_public_flg"] = $form["client_name_public_flg"];
				$form["namecard_email"] = $form["namecard_email"];
				$form["namecard_email_public_flg"] = $form["email_public_flg"];
				$form["namecard_picture_public_flg"] = $form["picture_public_flg"];
				$form["namecard_card_public_flg"] = $form["namecard_public_flg"];
				$form["namecard_department"] = $form["department"];
				$form["namecard_department_public_flg"] = $form["department_name_public_flg"];
				$form["namecard_executive"] = $form["executive"];
				$form["namecard_executive_public_flg"] = $form["executive_name_public_flg"];
				$form["namecard_postcode1"] = $form["client_postcode1"];
				$form["namecard_postcode2"] = $form["client_postcode2"];
				$form["namecard_address"] = $form["address"];
				$form["namecard_address_public_flg"] = $form["address_public_flg"];
				$form["namecard_tel1"] = $form["tel1"];
				$form["namecard_tel2"] = $form["tel2"];
				$form["namecard_tel3"] = $form["tel3"];
				$form["namecard_tel_public_flg"] = $form["tel_public_flg"];
				$form["namecard_cell1"] = $form["cell1"];
				$form["namecard_cell2"] = $form["cell2"];
				$form["namecard_cell3"] = $form["cell3"];
				$form["namecard_cell_public_flg"] = $form["cell_public_flg"];
				$form["namecard_fax1"] = $form["fax1"];
				$form["namecard_fax2"] = $form["fax2"];
				$form["namecard_fax3"] = $form["fax3"];
				$form["namecard_fax_public_flg"] = $form["fax_public_flg"];
				$form["namecard_facebook"] = $form["facebook"];
				$form["namecard_facebook_public_flg"] = $form["facebook_public_flg"];
				$form["namecard_sns"] = $form["sns"];
				$form["namecard_sns_public_flg"] = $form["sns_public_flg"];
				$form["namecard_free1_name"] = $form["free_item_name1"];
				$form["namecard_free1_val"] = $form["free_item_val1"];
				$form["namecard_free1_public_flg"] = $form["free1_public_flg"];
				$form["namecard_free2_name"] = $form["free_item_name2"];
				$form["namecard_free2_val"] = $form["free_item_val2"];
				$form["namecard_free2_public_flg"] = $form["free2_public_flg"];
				$form["namecard_free3_name"] = $form["free_item_name3"];
				$form["namecard_free3_val"] = $form["free_item_val3"];
				$form["namecard_free3_public_flg"] = $form["free3_public_flg"];
				$form["namecard_free4_name"] = $form["free_item_name4"];
				$form["namecard_free4_val"] = $form["free_item_val4"];
				$form["namecard_free4_public_flg"] = $form["free4_public_flg"];
				$form["namecard_free5_name"] = $form["free_item_name5"];
				$form["namecard_free5_val"] = $form["free_item_val5"];
				$form["namecard_free5_public_flg"] = $form["free5_public_flg"];
				$form["namecard_url"] = $form["namecard_url"];
				$form["namecard_url_public_flg"] = $form["url_public_flg"];

				// 写真画像
				$form["staffImgPath"] = ( $namecardProfileImgPath != null ? $namecardProfileImgPath: $this->getProfileImgPath($form) );
				$form["tmpProfileImgPath"] = ( $namecardProfileImgPath != null ? $namecardProfileImgPath: '' );
				// 名刺画像
				$form["staffNamecardImgPath"] = ( $namecardImgPath != null ? $namecardImgPath: $this->getNamecardImgPath($form) );
				$form["tmpNamecardImgPath"] = ( $namecardImgPath != null ? $namecardImgPath: '' );
				// 写真1
				$form["namecardPhoto1ImgPath"] = ( $namecardPhoto1ImgPath != null ? $namecardPhoto1ImgPath: $this->getNamecardPhoto1Path($form) );
				$form["tmpNamecardPhoto1ImgPath"] = ( $namecardPhoto1ImgPath != null ? $namecardPhoto1ImgPath: '' );
				// 写真2
                $form["namecardPhoto2ImgPath"] = ( $namecardPhoto2ImgPath != null ? $namecardPhoto2ImgPath: $this->getNamecardPhoto2Path($form) );
                $form["tmpNamecardPhoto2ImgPath"] = ( $namecardPhoto2ImgPath != null ? $namecardPhoto2ImgPath: '' );

                $result["staffDict"] = $form;
				$result["errorList"] = $errorList;
			}
		}else{
			// セッション情報を初期化する
			Application_CommonUtil::unsetSession(self::IDENTIFIER);
			// セッション取得
			$session = Application_CommonUtil::getSession(self::IDENTIFIER);
			$staffDict = array();
			if(array_key_exists("staff_type", $form) && array_key_exists("staff_id", $form)){
				// 更新の場合はDBからデータを取得する
				$staffType = $this->escape($form["staff_type"]);
				$staffId = $this->escape($form["staff_id"]);
				$join_condition = ' a.staff_type = b.staff_type AND a.staff_id = b.staff_id ';
				$condition = " a.staff_type = '{$staffType}' AND a.staff_id = {$staffId} ";
				// AAでかつclient_idが0以外
//				error_log('*'.$form["client_id"] .'*' . $this->user["client_id"] . '*' . $form["namecard_client_id"]);
				if($staffType == 'AA' && $form["client_id"] != 0) {
					$join_condition .= " AND b.client_id = {$form["client_id"]}";
				} else {
					$join_condition .= ' AND a.client_id = b.client_id';
				}
//				error_log('cond '. $condition . '   join_cond '.$join_condition);
				$staffDict = $masterStaffDao->getMasterStaffClientRow($condition, $join_condition);
			}else{
				// 新規作成の場合
				$staffDict = $this->masterStaffDict;
				$staffDict["staff_type"] = $this->escape($form["staff_type"]);
				if(array_key_exists("client_id", $form)){
					$staffDict["client_id"] = $this->escape($form["client_id"]);
				} else {
					$staffDict["client_id"] = 0;
				}
				$staffDict["staff_password"] = substr(uniqid(MD5(rand()), true), 0, 8);
				$staffDict["new"] = "1";
			}
			$session->staffRegist = array("staffDict"=>$staffDict);
			
			// 写真画像
			$staffDict["staffImgPath"] = $this->getProfileImgPath($staffDict);
			// 名刺画像
			$staffDict["staffNamecardImgPath"] = $this->getNamecardImgPath($staffDict);
			// 写真１
			$staffDict["namecardPhoto1ImgPath"] = $this->getNamecardPhoto1Path($staffDict);
			// 写真２
			$staffDict["namecardPhoto2ImgPath"] = $this->getNamecardPhoto2Path($staffDict);
			// 画面に表示するデータを戻り値に設定する
			$result["staffDict"] = $staffDict;
		}
		return $result;
	}

	private function getProfileImgPath($form) {
		$imgPath = "";
		if(!empty($form["staff_type"]) && !empty($form["staff_type"])) {
			$wildImgPath = "{$_SERVER['DOCUMENT_ROOT']}/img/profile/{$form["staff_type"]}_{$form["staff_id"]}.*";
			foreach(glob($wildImgPath) as $file){
				if(is_file($file)){
					$imgPath = str_replace($_SERVER['DOCUMENT_ROOT'], "", $file);
				}
			}
		}
		return $imgPath;
	}
	private function getNamecardImgPath($form) {
		$imgPath = "";
		if(!empty($form["staff_type"]) && !empty($form["staff_type"]) && !empty($form["namecard_client_id"])) {
			$wildImgPath = "{$_SERVER['DOCUMENT_ROOT']}/img/namecard/{$form["staff_type"]}_{$form["staff_id"]}_{$form["namecard_client_id"]}.*";
			foreach(glob($wildImgPath) as $file){
				if(is_file($file)){
					$imgPath = str_replace($_SERVER['DOCUMENT_ROOT'], "", $file);
				}
			}
		}
		return $imgPath;
	}
	private function getNamecardPhoto1Path($form) {
		$imgPath = "";
		if(!empty($form["staff_type"]) && !empty($form["staff_type"]) && !empty($form["namecard_client_id"])) {
			$wildImgPath = "{$_SERVER['DOCUMENT_ROOT']}/img/photo-data/{$form["staff_type"]}_{$form["staff_id"]}_{$form["namecard_client_id"]}-1.*";
			foreach(glob($wildImgPath) as $file){
				if(is_file($file)){
					$imgPath = str_replace($_SERVER['DOCUMENT_ROOT'], "", $file);
				}
			}
		}
		return $imgPath;
	}
	private function getNamecardPhoto2Path($form) {
		$imgPath = "";
		if(!empty($form["staff_type"]) && !empty($form["staff_type"]) && !empty($form["namecard_client_id"])) {
			$wildImgPath = "{$_SERVER['DOCUMENT_ROOT']}/img/photo-data/{$form["staff_type"]}_{$form["staff_id"]}_{$form["namecard_client_id"]}-2.*";
			foreach(glob($wildImgPath) as $file){
				if(is_file($file)){
					$imgPath = str_replace($_SERVER['DOCUMENT_ROOT'], "", $file);
				}
			}
		}
		return $imgPath;
	}

	/**
	 * 支払種別のリストボックス連想配列を取得
	 * @return multitype:string
	 */
	public function getPaymentTypeSelectBox() {
		return $this->payment_type_select;
	}
	
	/**
	 * 担当者を削除する処理（AA,TA,CE共通）
	 * @param unknown $staffType
	 * @param unknown $form
	 * @throws Exception
	 * @return multitype:string
	 */
	public function staffDelete($form, $request){
		$result = 0;
		$refererFlg = 0;
		$staffType = $form["staff_type"];
		$staffId = $this->escape($form["staff_id"]);

		if(isset($staffType) && isset($staffId)){
			// daoの宣言
			$masterStaffDao = Application_CommonUtil::getInstance('dao', "MasterStaffDao", $this->db);
			// トランザクションスタート
			$this->db->beginTransaction();
			try{
				// 担当者の論理削除
				$masterStaffDao->deletStaff($staffType, $staffId);
				$this->db->commit();
				$result = 1;
			}catch(Exception $e){
				$this->db->rollBack();
				throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
			}
		}

		return $result;
	}
	
	/**
	 * 担当者登録処理
	 * @param unknown $form
	 */
	public function staffRegistOne($form, $request){
		// 戻り値の宣言
		$result = array();
		$result["registCompleteFlg"] = 0;
		$result["errorList"] = array();
		// daoの宣言
		$masterStaffDao = Application_CommonUtil::getInstance('dao', "MasterStaffDao", $this->db);
		
//		if ($request->isPost() && Application_CommonUtil::refererCheck(self::REFERER_STAFF_REGIST)) {
//			// 登録処理を行う
//			// バリデーションを実行する
//			$errorList = $this->masterStaffValidation($form);
//			if(count($errorList) == 0){
//				// セッション取得
//				$session = Application_CommonUtil::getSession(self::IDENTIFIER);
//				// 画面で設定した値をその他の情報とマージする
//				$staffDict = array_merge($session->staffRegist["staffDict"], $form);
				$staffDict = $form;
//				// webphone_idの設定によってcall_typeの設定値を変更する
//				if($staffDict['webphone_id'] != ''){
//					$staffDict['call_type'] = self::CALL_TYPE_TELEPHONE;	// 通話方式=WEB電話で通話開始
//				}else{
//					$staffDict['call_type'] = self::CALL_TYPE_COPY;			// クリップボードに電話番号を保存
//				}
//				// 氏名を結合したデータを作成する
//				$staffDict["staff_name"] = "{$form['staff_firstname']} {$form['staff_lastname']}";
				// トランザクションスタート
				$this->db->beginTransaction();
				try{
					// 登録処理
					$sType = $staffDict['staff_type'];
					$staffDict['staff_id'] = $masterStaffDao->setStaffOne($staffDict);
					// メールを送信する
					$mailModel = Application_CommonUtil::getInstance('model', "MailModel", $this->db);
					$mailModel->sendRegistAaAccountMail($staffDict);
					$this->db->commit();
					$tmpFile = "{$_SERVER['DOCUMENT_ROOT']}/img/profile/work.tmp";
					if (file_exists($tmpFile)) {
						$fullfile = "{$_SERVER['DOCUMENT_ROOT']}/img/profile/" . $sType . "_{$staffDict['staff_id']}.jpg";
						rename($tmpFile, $fullfile);
					}
					// 名刺
					$tmpFile = "{$_SERVER['DOCUMENT_ROOT']}/img/namecard/namecard.tmp";
					if (file_exists($tmpFile)) {
						$fullfile = "{$_SERVER['DOCUMENT_ROOT']}/img/namecard/" . $sType . "_{$staffDict['staff_id']}.pdf";
						rename($tmpFile, $fullfile);
					}
				}catch(Exception $e){
					$this->db->rollBack();
					throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
				}
//				// 一覧画面でメッセージ表示用にセッションにデータを設定する
//				$session->registComplete = 1;
//				// 登録完了の場合は一覧へ遷移するためフラグを立てる
//				$result["registCompleteFlg"] = 1;
//				$result["staff_type"] = $staffDict["staff_type"];
//			}else{
//				// エラーの場合は登録画面へ戻るのでデータを設定する
//				$result["staffDict"] = $form;
//				$result["errorList"] = $errorList;
//			}
//		}
		return $result;
	}
	
	/**
	 * マスタースタッフ用のバリデーション
	 * @param unknown $form
	 */
	function masterStaffValidation($data, $masterStaffDao){
		$validationDict = array(
			"staff_firstname"   =>array("name" =>"名前(姓)", 			"length" => 8, 	"validate" => array(1)),
			"staff_lastname"    =>array("name" =>"名前(名)", 			"length" => 8, 	"validate" => array(1)),
			"staff_firstnamepy" =>array("name" =>"フリガナ(姓)", 			"length" => 10, 	"validate" => array()),
			"staff_lastnamepy"  =>array("name" =>"フリガナ(名)", 			"length" => 10, 	"validate" => array()),
			"client_name"       =>array("name" =>"会社名", 		"length" => 22, 	"validate" => array()),
			"department"        =>array("name" =>"部署名", 		"length" => 22, 	"validate" => array()),
			"executive"         =>array("name" =>"役職", 		    "length" => 20, 	"validate" => array()),
			"client_postcode1"  =>array("name" =>"住所(郵便番号1)", 		"length" => 3, 	"validate" => array(1)),
			"client_postcode2"  =>array("name" =>"住所(郵便番号2)", 		"length" => 4, 	"validate" => array(1)),
			"address"           =>array("name" =>"住所", 			"length" => 26, 	"validate" => array(1)),
			"namecard_email"    =>array("name" =>"名刺用メールアドレス", 			"length" => 30, 	"validate" => array()),
			"namecard_url"      =>array("name" =>"URL",	"length" => 38, "validate" => array(8)),
			"tel1"              =>array("name" =>"電話番号1", 		"length" => 4, 		"validate" => array(1)),
			"tel2"              =>array("name" =>"電話番号2", 		"length" => 4, 		"validate" => array(1)),
			"tel3"              =>array("name" =>"電話番号3", 		"length" => 4, 		"validate" => array(1)),
			"cell1"             =>array("name" =>"携帯番号1", 		"length" => 4, 		"validate" => array()),
			"cell2"             =>array("name" =>"携帯番号2", 		"length" => 4, 		"validate" => array()),
			"cell3"             =>array("name" =>"携帯番号3", 		"length" => 4, 		"validate" => array()),
//			"meetin_number"     =>array("name" =>"meetin番号", 		"length" => 11, 	"validate" => array()),
			"room_name"         =>array("name" =>"ルーム名", 		"length" => 32, 	"validate" => array(4)),
			"fax1"              =>array("name" =>"FAX番号1", 		"length" => 4, 		"validate" => array()),
			"fax2"              =>array("name" =>"FAX番号2", 		"length" => 4, 		"validate" => array()),
			"fax3"              =>array("name" =>"FAX番号3", 		"length" => 4, 		"validate" => array()),
			"facebook"          =>array("name" =>"Facebook", "length" => 255, "validate" => array(8)),
			"sns"               =>array("name" =>"SNS", "length" => 255, "validate" => array(8)),
			"staff_email"       =>array("name" =>"メールアドレス", 		"length" => 30, 	"validate" => array(1,7)),
			"staff_role"        =>array("name" =>"権限", 		"length" => 2, 	"validate" => array(1)),
			"webphone_id"       =>array("name" =>"WebPhoneID", 		"length" => 11, 	"validate" => array(2)),
			"webphone_pass"     =>array("name" =>"WebPhonePasswd", 	"length" => 20, 	"validate" => array(4)),
			"webphone_ip"       =>array("name" =>"WebPhoneIP", 		"length" => 20, 	"validate" => array(9)),
			"namecard_cate1_title" =>array("name" =>"カテゴリ１タイトル", 		"length" => 20, 	"validate" => array()),
			"namecard_cate2_title" =>array("name" =>"カテゴリ２タイトル", 		"length" => 20, 	"validate" => array()),
			"namecard_cate3_title" =>array("name" =>"カテゴリ３タイトル", 		"length" => 20, 	"validate" => array()),
			"namecard_cate4_title" =>array("name" =>"カテゴリ４タイトル", 		"length" => 20, 	"validate" => array()),
			"free_item_name1"   =>array("name" =>"フリー項目１名称", 		"length" => 6, 	"validate" => array()),
			"free_item_val1"    =>array("name" =>"フリー項目１説明", 		"length" => 20, 	"validate" => array()),
			"free_item_name2"   =>array("name" =>"フリー項目２名称", 		"length" => 6, 	"validate" => array()),
			"free_item_val2"    =>array("name" =>"フリー項目２説明", 		"length" => 20, 	"validate" => array()),
			"free_item_name3"   =>array("name" =>"フリー項目３名称", 		"length" => 6, 	"validate" => array()),
			"free_item_val3"    =>array("name" =>"フリー項目３説明", 		"length" => 20, 	"validate" => array()),
			"free_item_name4"   =>array("name" =>"フリー項目４名称", 		"length" => 6, 	"validate" => array()),
			"free_item_val4"    =>array("name" =>"フリー項目４説明", 		"length" => 20, 	"validate" => array()),
			"free_item_name5"   =>array("name" =>"フリー項目５名称", 		"length" => 6, 	"validate" => array()),
			"free_item_val5"    =>array("name" =>"フリー項目５説明", 		"length" => 20, 	"validate" => array()),
			"namecard_photo1_desc"  =>array("name" =>"写真１説明文", 				"length" => 40, 	"validate" => array()),
			"namecard_photo2_desc"  =>array("name" =>"写真２説明文", 				"length" => 40, 	"validate" => array()),
			"namecard_introduction" =>array("name" =>"紹介文",			 			"length" => 300, 	"validate" => array()),
		);
		$errorList = executionValidation($data, $validationDict);
		// 新規登録か編集かつパスワード変更時、パスワードのチェックを行う
		if($data["staff_password_mod"] == 1) {
			// パスワードのサイズチェックは独自バリデーション
			if(isset($data["staff_password"])) {
				if(empty($data["staff_password"])) {
					$errorList["error"][] = "パスワードが未入力です";
				} else if(strlen($data["staff_password"]) < 8) {
					$errorList["error"][] = "パスワードが8文字より小さいです";
				}
			}
		}
		// meetin番号の編集は独自バリデーションチェック
		// if(isset($data["meetin_number"])) {
		// 	// 先頭3桁が090/080/070かつ数値で11桁固定
		// 	if(!preg_match('/^0[789]0[0-9]{8}$/', $data["meetin_number"])) {
		// 		$errorList["error"][] = "meetin番号が不正です(先頭3桁は090/080/070で半角数値11桁のみ)";
		// 	} else {
		// 		// 存在チェック(自分自身の番号は除外)
		// 		if(false == $masterStaffDao->existMeetinNumber($data["meetin_number"], $data["staff_type"], $data["staff_id"])) {
		// 			$errorList["error"][] = "設定したmeetin番号は既に使用されています";
		// 		}
		// 	}
		// }

		// ルーム名の重複チェック
		if(isset($data["room_name"])) {
			// 存在チェック(自分自身は除外)
			if(false == $masterStaffDao->existRoomName($data["room_name"], $data["staff_type"], $data["staff_id"])) {
				$errorList["error"][] = "設定したルーム名は既に使用されています";
			}
		}
		// 名刺表示項目が以下の項目から４より大きい場合、エラーとする
		$checkedCount = 0;
		$allowedContactItemDict = array(
			"address_public_flg",
			"email_public_flg",
			"url_public_flg",
			"tel_public_flg",
			"cell_public_flg",
			"meetin_id_public_flg",
			"fax_public_flg",
		);
		foreach($allowedContactItemDict as $val) {
			if(isset($data[$val]) && $data[$val] == "1") {
				$checkedCount++;
			}
		}
		if($checkedCount > 4) {
					$errorList["error"][] = "名刺情報に表示できる連絡先項目は４種類です";
		}
		// 権限のバリデーション
		return $errorList;
	}
	
	/**
	 * 資料共有のバリデーション
	 * @param unknown $form
	 */
	function materialFormValidation($data){
		$validationDict = array(
			"material_name" => array(
				"name" => "資料名",
				"length" => "64",
				"validate" => array(1)
			),
			"note" => array(
				"name" => "備考",
				"length" => "200",
				"validate" => array()
			),
		);
		if(isset($data["material_type"]) && ($data["material_type"] == 0)) {
		} else {
			$validationDict["material_url"] = array(
				"name" => "URL",
				"length" => "200",
				"validate" => array(1,8)
			);
		}
		$errorList = executionValidation($data, $validationDict);
		// 資料タイプがファイルの場合はアップロードファイルチェック
		if (isset($data["material_type"]) && ($data["material_type"] == 0 || $data["material_type"] == 2) && $_FILES['material_file']['error'] != UPLOAD_ERR_OK) {
			$errorList["material_file"] = "資料データエラー (" . $this->codeToMessage($_FILES['material_file']['error']) . ")";
		}
		if(isset($data["material_type"]) && ($data["material_type"] == 0 || $data["material_type"] == 2)) {
			if(isset($_FILES['material_file'])) {
				// アップロードファイルがある場合、拡張子チェック
				if(!$this->validateDocumentUploadFile($_FILES['material_file'])) {
					$errorList["material_file"] = 'アップロードファイルの拡張子はdoc/docx/ppt/pptx/xls/xlsx/pdf/gif/jpg/pngのみです';
				}
			}
		}
		return $errorList;
	}

	/**
	 * 権限のバリデーションを行う
	 * @param unknown $data
	 * @param unknown $errorList
	 */
	private function authValidation($data, $errorList){
		
	}

	/**
	 * 日付関係の値を取得
	 * @param unknown $form
	 * @return multitype:Ambigous <unknown, string> Ambigous <string, unknown> multitype:number  multitype:string
	 */
	public function getDownloadDateDict($screenSession) {
		
		// 初期表示設定
		$before3month = date('Y-m-d', strtotime(" -3 month"));
	
		// パラメータ初期化（セッションに値があれば取り出しておく）
		$st_yy   = !empty($screenSession->st_yy)? $screenSession->st_yy : date('Y', strtotime($before3month));
		$st_mm   = !empty($screenSession->st_mm)? $screenSession->st_mm : date('m', strtotime($before3month));
		$ed_yy   = !empty($screenSession->ed_yy)? $screenSession->ed_yy : date('Y');
		$ed_mm   = !empty($screenSession->ed_mm)? $screenSession->ed_mm : date('m');
		
		// 開始が終了より後だったら開始と終了を入れ替える
		if (strtotime($st_yy. '-'. $st_mm. '-1') > strtotime($ed_yy. '-'. $ed_mm. '-1')){
			$tmp_yy = $st_yy;
			$tmp_mm = $st_mm;
			$st_yy = $ed_yy;
			$st_mm = $ed_mm;
			$ed_yy = $tmp_yy;
			$ed_mm = $tmp_mm;
		}
		
		// 終了が現在の月を超えていた場合は補正
		if (strtotime($ed_yy. '-'. $ed_mm. '-1') > strtotime(date('Y-m-1'))){
			$ed_yy = date('Y');
			$ed_mm = date('m');
		}
		
		// DL機能リリース日を最古とし、年月セレクションを作成する
		$html_yy = array();
		$html_mm = array();
		$cur_yy = date('Y', strtotime(DL_MANAGE_RELEASE));
		$now_yy = date('Y');
		
		while(true) {
			if ($cur_yy > $now_yy){ break; }
			$html_yy[] = $cur_yy;
			$cur_yy++;
		}
		
		for($i=1; $i<=12; $i++){
			$html_mm[] = $i;
		}
		
		return array(
			"st_yy"   => $st_yy,		// 検索開始期間「年」
			"st_mm"   => $st_mm,		// 検索開始期間「月」
			"ed_yy"   => $ed_yy,		// 検索終了期間「年」
			"ed_mm"   => $ed_mm,		// 検索開始期間「月」
			"html_yy" => $html_yy,		// 年リスト
			"html_mm" => $html_mm 		// 月リスト
		);
	}
	/**
	 * 資料一覧を取得する
	 * @param unknown $form
	 * @param unknown $screenSession
	 * @return Application_Pager
	 */
	public function getMaterialList($form, &$screenSession){
		// セッションの初期化
		if($screenSession->isnew == true){
			$screenSession->order = 'material_id';
			$screenSession->page = 1;
			$screenSession->pagesize = 100;
			$screenSession->ordertype = 'asc';	// 任意
		}
		// パラメータをセッションに格納
		foreach($form as $key=>$val){
			$screenSession->$key = $val;
		}
		// daoの宣言
		$materialDao = Application_CommonUtil::getInstance('dao', "MaterialDao", $this->db);
		
		// 変数宣言
		// 選択クライアントのみ表示
		// 自分が追加した資料、か他アカウントで共有フラグが１の資料は表示
		$condition = "((create_staff_type='{$this->user["staff_type"]}' AND create_staff_id={$this->user["staff_id"]}) OR ((create_staff_type!='{$this->user["staff_type"]}' OR create_staff_id!={$this->user["staff_id"]}) AND shareable_flg=1)) AND client_id = {$this->user["client_id"]}"; // " del_flg = 0";		// SQLの検索条件を設定
		// 検索実施
		$dataCount = $materialDao->getMaterialCount($condition);
		$dataList = $materialDao->getMaterialList($condition, $screenSession->order, $screenSession->ordertype , $screenSession->page, $screenSession->pagesize);
		// ページャ設定
		$list = new Application_Pager(array(
				"itemData" => $dataList,				// リスト
				"itemCount" => $dataCount,			// カウント
				"perPage" => $screenSession->pagesize,		// ページごと表示件数
				"curPage" => $screenSession->page,			// 表示するページ
				"order" => $screenSession->order,			// ソートカラム名
				"orderType" => $screenSession->ordertype,	// asc or desc
		));
		// 戻り値を作成する
		$result["list"] = $list;
		$result["registMsg"] = "";
		// セッション取得
		$session = Application_CommonUtil::getSession(self::IDENTIFIER);
		if(!is_null($session->registComplete)){
			// セッション情報を初期化する
			Application_CommonUtil::unsetSession(self::IDENTIFIER);
			// メッセージを設定する
			$result["registMsg"] = $this->message->success->regist->aa_staff;
		}
		return $result;
	}
	public function validateDocumentUploadFile($file) {
		$ext = preg_replace('/(.+)\.(.+)/', '$2', $file['name']);
		if(!preg_match('/(gif|jpg|png|docx?|pptx?|xlsx?|pdf)/i', $ext, $matches)) {
			return false;
		}
		return true;
	}
	/**
	 * 資料取得処理
	 * @param unknown $form
	 */
	public function editMaterial($form, $request){
		// 戻り値の宣言
		$result = array();
		$result["errorList"] = array();
		$result["material"] = array();
		// アップロードディレクトリ
		$uploaddir = "{$_SERVER['DOCUMENT_ROOT']}/cmn-data/";

		// daoの宣言
		$materialDao = Application_CommonUtil::getInstance('dao', "MaterialDao", $this->db);
		$condition = "";
		$newFlg = true;
		$EXT_NAME = '';
		if($request->isPost()) {
			// 新規・更新アクション
			$errorList = $this->materialFormValidation($form);
			if(count($errorList) > 0) {
				$result["errorList"] = $errorList;
				return $result;
			}
			$this->db->beginTransaction();
			try{
				$result = $materialDao->setMaterial($form);
				$this->db->commit();
			}catch(Exception $e){
				$this->db->rollBack();
				error_log($e->getMessage());
				throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
			}
			if($form["material_type"] == "0" || $form["material_type"] == "2") {
				// 資料データ
				$tmp = $_FILES['material_file']['tmp_name'];
				// 新規登録時
				if(is_uploaded_file($tmp) && $_FILES['material_file']['error'] == 0) {
					error_log(json_encode($_FILES['material_file']));
					// DBの詳細情報削除
					$condition = "material_id = {$result["material"]["material_id"]}";
					$materialDao->deleteMaterialDetailRow($condition);
					// 元のファイルは削除
					$unlinkfiles = $uploaddir.md5($result["material"]["material_id"]).'*';
					foreach(glob($unlinkfiles) as $val) {
						unlink($val);
					}
					$ext = preg_replace('/(.+)\.(.+)/', '$2', $_FILES['material_file']['name']);
					$uploadfile = $uploaddir . md5($result["material"]["material_id"])."." . strtolower($ext);
					$pdffile    = $uploaddir . md5($result["material"]["material_id"]).".pdf";
					if(move_uploaded_file($tmp, $uploadfile)) {
						if(preg_match('/(gif|jpg|png)/i', $ext, $matches)) {
							// 画像ファイル
							$outfile = $uploaddir . md5($result["material"]["material_id"]) . "-1." . strtolower($ext);
							copy($uploadfile, $outfile);
							$EXT_NAME = strtolower($ext);
						}
						else {
							$EXT_NAME = 'jpg';
							// Officeファイルかpdfファイル
							if(preg_match('/(docx?|pptx?|xlsx?)/i', $ext, $matches)) {
								// オフィスファイルをpdfファイル
								$res = exec('/usr/local/bin/mstopdf.sh ' . $uploadfile , $output, $status);
								if($status !== 0) {
									error_log(json_encode($status));
									error_log(json_encode($output));
								}
								// アップロードファイル削除
								unlink($uploadfile);
							}
							// PPM変換
							$cmd = '/usr/bin/pdftoppm -r 200 '.$pdffile.' '.$uploaddir.md5($result["material"]["material_id"]);
							$res = exec($cmd, $output, $status);
							if($status !== 0) {
								error_log(json_encode($status));
								error_log(json_encode($output));
							}
							// 元PDFファイルは削除しない(リンク取得で使用)
							// 連番リネーム
							// PPMはゼロパディングされているのでゼロサプレス
							// hoge-01.ppm -> hoge-1.ppm
							// hoge-001.ppm -> hoge-1.ppm
							$ppmfiles = $uploaddir.md5($result["material"]["material_id"]).'-*.ppm';
							foreach(glob($ppmfiles) as $ppm) {
								if(preg_match('/(.+)-([\d]+)(\.ppm)$/', $ppm, $matches)) {
									if(preg_match('/^0+/', $matches[2], $submatches)) {
										$matches[2] = preg_replace('/^0+/', '', $matches[2]);
										$outfile = $matches[1].'-'.$matches[2].$matches[3];
										rename($ppm, $outfile);
									}
								}
							}
							// JPG変換
							$cmd = '/usr/bin/mogrify -format jpg '.$uploaddir.md5($result["material"]["material_id"]).'-*.ppm';
//								$cmd = '/usr/bin/mogrify -resize "1024x960>" -format jpg '.$uploaddir.md5($result["material"]["material_id"]).'-*.ppm';
							$res = exec($cmd, $output, $status);
							if($status !== 0) {
								error_log(json_encode($status));
								error_log(json_encode($output));
							}
							// 元PPMファイル削除
							$unlinkfiles = $uploaddir.md5($result["material"]["material_id"]).'-*.ppm';
							foreach(glob($unlinkfiles) as $val) {
								unlink($val);
							}
						}
					}
				}else{
					$newFlg = false;
				}
			} else if($form["material_type"] == "1") {
				$EXT_NAME = 'jpg';
				// URLのキャプチャ画像
				if($form["material_id"] == null){
					$cmd = '/usr/local/bin/wkhtmltoimage -q --quality 100 --height 600 --width 1024 '.$form["material_url"].' '.$uploaddir.md5($result["material"]["material_id"]).'-1.jpg';
					$res = exec($cmd, $output, $status);
					if($status !== 0) {
						error_log(json_encode($status));
						error_log(json_encode($output));
					}
				}else{
					$newFlg = false;
				}
			}
			// 更新
			$this->db->beginTransaction();
			// 新規登録の場合のみMaterialDetailに登録
			if($newFlg){
				try {
					// 拡張子更新
					$params = array(
						'material_id' => $result['material']['material_id'],
					);
					if($EXT_NAME != '') {
						$params['material_ext'] = $EXT_NAME;
					}
					error_log(json_encode($params));
					$result = $materialDao->setMaterial($params);
					// 分割ファイル数分をdetailに追加
					$materialDao->setMaterialDetail($result["material"]);
					$this->db->commit();
				}catch(Exception $e){
					$this->db->rollBack();
					error_log($e->getMessage());
					throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
				}
				$result["errorList"] = $errorList;
			}
		} else {
			// 編集画面表示
			if(isset($form['id']) && !empty($form['id'])){
				$condition = " material_id = {$form['id']}";
				$result["material"] = $materialDao->getMaterialRow($condition);
			}
		}
		return $result;
	}
	public function deleteMaterial($form, $request) {
		// daoの宣言
		$materialDao = Application_CommonUtil::getInstance('dao', "MaterialDao", $this->db);
		$data = array();
		$condition = "";
		$cond_list = array();
		// 要素がない場合は無処理
		foreach(explode(',', $form['material_ids']) as $val) {
			$cond_list[] = "material_id = {$val}";
		}
		if(count($cond_list) == 0) {
			return $data;
		}
		$condition = " " . implode(" OR ", $cond_list);
		$this->db->beginTransaction();
		try {
			$data = $materialDao->deleteMaterialRow($condition);
			$this->db->commit();
			// ファイル削除
			$uploaddir = "{$_SERVER['DOCUMENT_ROOT']}/cmn-data/";
			foreach(explode(',', $form['material_ids']) as $id) {
				$deletefiles = $uploaddir.md5($id)."-*.*";
//				error_log($deletefiles);
				foreach(glob($deletefiles) as $file) {
//					error_log($file);
					unlink($file);
				}
			}
		}catch(Exception $e){
			$this->db->rollBack();
			error_log($e->getMessage());
			throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
		}
		// 戻り値を作成する
		return $data;
	}
	public function deleteMaterialDetailPage($form) {
		// daoの宣言
		$materialDao = Application_CommonUtil::getInstance('dao', "MaterialDao", $this->db);
		$data = array();
		$condition = '';
		if(!isset($form['material_id']) || !isset($form['material_page']) || !isset($form['material_filename'])) {
			return $data;
		}
		if(isset($form['material_id'])) {
			$condition .= " material_id = {$form['material_id']}";
		}
		if(isset($form['material_page'])) {
			$condition .= " AND material_page = {$form['material_page']}";
		}
		// 要素がない場合は無処理
		$this->db->beginTransaction();
		try {
			$data = $materialDao->deleteMaterialDetailByPage($form, $condition);
			$this->db->commit();
		}catch(Exception $e){
			$this->db->rollBack();
			error_log($e->getMessage());
			throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
		}
	}
	public function getMaterialDetailList($form){
		// daoの宣言
		$materialDao = Application_CommonUtil::getInstance('dao', "MaterialDao", $this->db);
		$condition = " material_id = {$form['id']}";
		$dataList = $materialDao->getMaterialDetailList($condition);
		$data = $materialDao->getMaterialRow($condition);
		// 戻り値を作成する
		$result["list"] = $dataList;
		$result["material"] = $data;
		$result["registMsg"] = "";
		return $result;
	}

	public function getMaterialDetail($form,$request){
		// daoの宣言
		$materialDao = Application_CommonUtil::getInstance('dao', "MaterialDao", $this->db);
		$condition = " material_id = {$form['material_id']} AND material_page = {$form['material_page']}";
		$data = $materialDao->getMaterialDetailRow($condition);
		// 戻り値を作成する
		return $data;
	}

	public function setMaterialDetail($form,$request){
		// daoの宣言
		$materialDao = Application_CommonUtil::getInstance('dao', "MaterialDao", $this->db);
		$condition = " material_id = {$form['material_id']} AND material_page = {$form['material_page']}";
		//バリデーションチェック
		if(isset($form["material_memo"]) && (mb_strlen($form["material_memo"]) > 20000)) {
			// エラー
			return $this->getMaterialDetail($form,$request);
		}
		$this->db->beginTransaction();
		try {
			$data = $materialDao->setMaterialDetailRow($form,$condition);
			$this->db->commit();
		}catch(Exception $e){
			$this->db->rollBack();
			error_log($e->getMessage());
			throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
		}
		$data = $this->getMaterialDetail($form,$request);
		// 戻り値を作成する
		return $data;
	}
	public function swapMaterialDetailPage($form,$request) {
		$swapPages = array();
		$pages = array();
		$condition = '';
		$toPageNo = 1;
		foreach(explode(',', $form['material_page_list']) as $fromPageNo) {
			if($toPageNo != $fromPageNo) {
				$swapPages[] = array(
					'toPageNo'   => $toPageNo,
					'fromPageNo' => $fromPageNo,
				);
				$pages[] = (string)$toPageNo;
				$pages[] = (string)$fromPageNo;
			}
			$toPageNo++;
		}
		$pages = array_unique($pages);
		$condition = "material_id = {$form['material_id']}";
		if(count($pages) > 1) {
			$condition .= " AND material_page IN (" . implode(',', $pages) . ")";
		}
		// 入替が発生した場合のみ更新
		if(count($swapPages) > 1) {
			// daoの宣言
			$materialDao = Application_CommonUtil::getInstance('dao', "MaterialDao", $this->db);
			$this->db->beginTransaction();
			try{
				$materialDao->swapMaterialDetailRow($swapPages, $condition);
				$this->db->commit();
			}catch(Exception $e){
				$this->db->rollBack();
				error_log($e->getMessage());
				throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
			}
			// 一覧情報を取得
			$result = $this->getMaterialDetailList(array('id' => $form['material_id']));
		}
		return $result['list'];
	}

	public function negotiationResultTmplFormValidation($data) {
		$errorList = array();
		$validationDict = array(
				"template_name" 		=>array("name" =>"タイトル", 				"length" => 64, 	"validate" => array(1)),
		);
		$errorList = executionValidation($data, $validationDict);
		return $errorList;
	}
	
	public function getNegotiationTmplList($form, &$screenSession){
		// セッションの初期化
		if($screenSession->isnew == true){
			$screenSession->order = 'create_date';
			$screenSession->page = 1;
			$screenSession->pagesize = 100;
			$screenSession->ordertype = 'asc';	// 任意
			$screenSession->free_word = "";
		}
		// パラメータをセッションに格納
		foreach($form as $key=>$val){
			$screenSession->$key = $val;
		}
		if (array_key_exists("srt", $form)) {
			if ($form["srt"]=="1") {
				$screenSession->order = 'template_name';
				$screenSession->ordertype = "asc";
			} else if ($form["srt"]=="2") {
				$screenSession->order = 'template_name';
				$screenSession->ordertype = "desc";
			} else if ($form["srt"]=="3") {
				$screenSession->order = 'update_date';
				$screenSession->ordertype = "asc";
			} else if ($form["srt"]=="4") {
				$screenSession->order = 'update_date';
				$screenSession->ordertype = "desc";
			}
		}
		$list = array();
		// ページャ設定
		$list = new Application_Pager(array(
				"itemData" => $masterStaffList,				// リスト
				"itemCount" => $masterStaffCount,			// カウント
				"perPage" => $screenSession->pagesize,		// ページごと表示件数
				"curPage" => $screenSession->page,			// 表示するページ
				"order" => $screenSession->order,			// ソートカラム名
				"orderType" => $screenSession->ordertype,	// asc or desc
		));
		// daoの宣言
		$negRsltTmplDao = Application_CommonUtil::getInstance('dao', "NegotiationResultTmplDao", $this->db);
		$condition = " template_del_flg = 0";		// SQLの検索条件を設定
		if(array_key_exists("client_id", $form) && !empty($form["client_id"])){
				$condition .= " AND client_id = '{$form['client_id']}' ";
		}
		// 検索ボタンが押下された場合、ページを初期化する
		if(array_key_exists("free_word", $form)){
			$screenSession->page = 1;
		}
		if($screenSession->free_word != ""){
			$escapeText = $this->escape($screenSession->free_word);
			$condition .= " AND (template_name like '%{$escapeText}%') ";
		}
		// 検索実施
		$tmplCount = $negRsltTmplDao->getTmplCount($condition);
		$tmplList = $negRsltTmplDao->getTmplList($condition, $screenSession->order, $screenSession->ordertype , $screenSession->page, $screenSession->pagesize);
		// ページャ設定
		$list = new Application_Pager(array(
				"itemData" => $tmplList,				// リスト
				"itemCount" => $tmplCount,			// カウント
				"perPage" => $screenSession->pagesize,		// ページごと表示件数
				"curPage" => $screenSession->page,			// 表示するページ
				"order" => $screenSession->order,			// ソートカラム名
				"orderType" => $screenSession->ordertype,	// asc or desc
		));

		// 戻り値を作成する
		$result["list"] = $list;
		$result["registMsg"] = "";
		// セッション取得
		$session = Application_CommonUtil::getSession(self::IDENTIFIER);
		if(!is_null($session->registComplete)){
			// セッション情報を初期化する
			Application_CommonUtil::unsetSession(self::IDENTIFIER);
			// メッセージを設定する
			$result["registMsg"] = $this->message->success->regist->aa_staff;
		}
		return $result;
	}
	public function getNegotiationTmplListAll($form) {
		// daoの宣言
		$negRsltTmplDao = Application_CommonUtil::getInstance('dao', "NegotiationResultTmplDao", $this->db);
		$condition = " template_del_flg = 0";		// SQLの検索条件を設定
		if(array_key_exists("client_id", $form) && !empty($form["client_id"])){
				$condition .= " AND client_id = '{$form['client_id']}' ";
		}
		$tmplList = $negRsltTmplDao->getTmplList($condition, null, null, null, null);
		return $tmplList;
	}
	public function editNegotiationTmpl($form, $request) {
		// 戻り値の宣言
		$result = array();
		$result["errorList"] = array();
		$result["material"] = array();
		// daoの宣言
		$negRsltTmplDao = Application_CommonUtil::getInstance('dao', "NegotiationResultTmplDao", $this->db);
		$condition = " template_del_flg = 0";		// SQLの検索条件を設定
		if(array_key_exists("client_id", $form) && !empty($form["client_id"])){
				$condition .= " AND client_id = '{$form['client_id']}' ";
		}
		if($request->isPost()) {
			// 新規・更新アクション
			$errorList = $this->negotiationResultTmplFormValidation($form);
			if(count($errorList) > 0) {
				$result["errorList"] = $errorList;
				return $result;
			}
			// 商談結果リストと次回アクションリストは空要素を削除
			if(isset($form["negotiation_result_list"]) && is_array($form["negotiation_result_list"])) {
				$form["negotiation_result_list"] = array_filter($form["negotiation_result_list"], "strlen");
				$form["negotiation_result_list"] = array_values($form["negotiation_result_list"]);
			}
			if(isset($form["negotiation_next_action_list"]) && is_array($form["negotiation_next_action_list"])) {
				$form["negotiation_next_action_list"] = array_filter($form["negotiation_next_action_list"], "strlen");
				$form["negotiation_next_action_list"] = array_values($form["negotiation_next_action_list"]);
			}
			$this->db->beginTransaction();
			try{
				$res = $negRsltTmplDao->setTmpl($form);
				$this->db->commit();
			}catch(Exception $e){
				$this->db->rollBack();
				error_log($e->getMessage());
				throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
			}
		} else {
			// 編集画面表示
			if(array_key_exists("id", $form)){
				$condition = " template_id = {$form['id']}";
				$result["tmpl"] = $negRsltTmplDao->getTmplRow($condition);
			}
		}
		return $result;
	}
	public function deleteNegotiationTmpl($form, $request) {
		// daoの宣言
		$negRsltTmplDao = Application_CommonUtil::getInstance('dao', "NegotiationResultTmplDao", $this->db);
		$data = array();
		$condition = "";
		$cond_list = array();
		// 要素がない場合は無処理
		foreach(explode(',', $form['template_ids']) as $val) {
			$cond_list[] = "template_id = {$val}";
		}
		if(count($cond_list) == 0) {
			return $data;
		}
		$condition = " " . implode(" OR ", $cond_list);
		$this->db->beginTransaction();
		try {
			$data = $negRsltTmplDao->deleteTmpl($condition);
			$this->db->commit();
		}catch(Exception $e){
			$this->db->rollBack();
			error_log($e->getMessage());
			throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
		}
		// 戻り値を作成する
		return $data;
	}
	public function makeRandom($length = 10) {
		$ch = array_flip(array_merge(range('a','z'),range('A','Z'),range('0','9')));
		$str = '';
		for($i=0; $i < $length; $i++) {
			$str .= array_rand($ch);
		}
		return $str;
	}
	public function sendMailReminderAccount($form, $request) {
		$errorList = array();
		if($request->isPost()) {
			if(!isset($form["id"]) || empty($form["id"])) {
				$errorList[] = "IDが未入力です";
				return array(
					"errorList" => $errorList,
				);
			}
			if(!preg_match('/([A-Z]{2})0*([0-9]+)/', $form["id"], $match)) { // 入力値がAA + 数値
				$errorList[] = "ID形式が不正です";
				return array(
					"errorList" => $errorList,
				);
			}
			// daoの宣言
			$masterStaffDao = Application_CommonUtil::getInstance('dao', "MasterStaffDao", $this->db);
			$condition = " staff_type = '{$match[1]}' AND staff_id = {$match[2]} ";
			$staffDict = $masterStaffDao->getMasterStaffRow($condition);
			if(empty($staffDict)) {
				return array();
			}
			// トランザクションスタート
			$this->db->beginTransaction();
			try {
				$staffDict["activation_code"] = $this->makeRandom(32);
				$staffDict["temp_pw"] = md5($form["temp_pw"]);
				// DB更新
				if(true == $masterStaffDao->setActivationStaff($staffDict, $condition)) {
					// メールを送信する
					$mailModel = Application_CommonUtil::getInstance('model', "MailModel", $this->db);
					$mailModel->sendActivationMail($staffDict);
					$errorList[] = "登録アドレスに再設定用のメールを送信しました";
				} else {
					$errorList[] = "既に登録アドレスに再設定用のメールを送信しています";
				}
				$this->db->commit();
			}catch(Exception $e){
				$this->db->rollBack();
				throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
			}
		}
		return array(
			"errorList" => $errorList,
		);
	}
	public function getActivationStaff($form, $request) {
		$staffDict = array();
		if($request->isPost()) {
			return array(
				'staffDict' => $staffDict
			);
		}
		// daoの宣言
		$masterStaffDao = Application_CommonUtil::getInstance('dao', "MasterStaffDao", $this->db);
		$condition = " activation_code = '{$form['id']}' ";
		$staffDict = $masterStaffDao->getActivateStaff($condition);
		if(!empty($staffDict)) {
			$staffDict["temp_pw"] = "";
		}
		return array(
			'staffDict' => $staffDict,
			'errorList' => '',
		);
	}
	public function activateStaff($form, $request) {
		$errorList = array();
		$staffDict = array(
			'staff_id' => $form["id"],
			'temp_pw' => $form["temp_pw"],
			'password' => $form["password"],
			'confirm_password' => $form["confirm_password"],
		);
		if($request->isPost()) {
			// daoの宣言
			$masterStaffDao = Application_CommonUtil::getInstance('dao', "MasterStaffDao", $this->db);
			// バリデーションチェック
			$errorList = $masterStaffDao->validateActivationStaff($form);
			if(count($errorList) == 0) {
				// トランザクションスタート
				$this->db->beginTransaction();
				try{
					$staffDict = $masterStaffDao->activateStaff($form);
					$errorList[] = 'パスワードが変更されました';
					$staffDict["staff_password"] = $form["password"];
					// メールを送信する
					$mailModel = Application_CommonUtil::getInstance('model', "MailModel", $this->db);
					$mailModel->sendRegistAaAccountMail($staffDict);
					
					$this->db->commit();
				}catch(Exception $e){
					$this->db->rollBack();
					throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
				}
			}
		}
		return array(
			'staffDict' => $staffDict,
			'errorList' => $errorList,
		);
	}
	public function getStaffNamecard($form) {
		// daoの宣言
		$masterStaffDao = Application_CommonUtil::getInstance('dao', "MasterStaffDao", $this->db);

		$staffType = $this->escape($form["staff_type"]);
		$staffId = $this->escape($form["staff_id"]);
		$join_condition = ' a.staff_type = b.staff_type AND a.staff_id = b.staff_id ';
		$condition = " a.staff_type = '{$staffType}' AND a.staff_id = {$staffId} ";
		// AAでかつclient_idが0以外
		if($staffType == 'AA' && $form["client_id"] != 0) {
			$join_condition .= " AND b.client_id = {$form["client_id"]}";
		} else {
			$join_condition .= ' AND a.client_id = b.client_id';
		}
		$staffDict = $masterStaffDao->getMasterStaffClientRow($condition, $join_condition);
		// 写真画像
		$staffDict["staffImgPath"] = $this->getProfileImgPath($staffDict);
		// 名刺画像
		$staffDict["staffNamecardImgPath"] = $this->getNamecardImgPath($staffDict);
		// 名刺用写真１
		$staffDict["namecardPhoto1ImgPath"] = $this->getNamecardPhoto1Path($staffDict);
		// 名刺用写真２
		$staffDict["namecardPhoto2ImgPath"] = $this->getNamecardPhoto2Path($staffDict);
		return $staffDict;
	}
}
