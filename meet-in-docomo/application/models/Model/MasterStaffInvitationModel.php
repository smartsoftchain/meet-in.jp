<?php
/**
 * スタッフ招待機能
 * @author t-nishimura
 *
 */
class MasterStaffInvitationModel extends AbstractModel {

	private $db;									// DBコネクション
	private $dao;								// DBコネクション

	const IDENTIFIER = "admin";									// セッション変数のnamespace

	function __construct($db){
		parent::init();
		$this->db = $db;
		$this->dao = Application_CommonUtil::getInstance("dao", "MasterStaffInvitationDao", $this->db);
	}
	public function init() {
	}

	public function sendStaffInvitation($sender, $form) {

		$processedList = []; // 実際に招待メールを送信したメールアドレス.
		$errorList = [];	 // エラーの件数.

		$adminClientModel           = Application_CommonUtil::getInstance("model", "AdminClientModel", $this->db);
		$mailModel                  = Application_CommonUtil::getInstance("model", "MailModel", $this->db);
		$collaborativeServicesModel = Application_CommonUtil::getInstance("model", "CollaborativeServicesModel", $this->db);

		// バリデーション.
		$validation = [];
		$validation["staff_role"] = in_array($sender["staff_role"], ['CE_1', 'AA_1'], true); // 権限確認（直リンク対策).
		$validation["plan"]		  = $adminClientModel->checkAddStaff($sender["client_id"], $sender["plan_this_month"]); // プランの空きスタッフ枠確認.
		if(in_array(false, $validation, true)) {
			if(!$validation["staff_role"]) {
				$errorList[] = '招待メールの送信は 管理者権限のユーザのみ実行可能です。';
			}
			if(!$validation["plan"]) {
				$errorList[] = 'スタッフの人数がプランの上限以上になる為、招待出来ません。';
			}
			return $errorList;
		}

		// 送信すべきメールアドレスの場合は送信する.
		$emails = [];
		if(0 < strlen($form['emails'])) {
			// MEMO. エンドユーザ向けに tpl上で　セミコロン(;)で区切れと書いてあるとおりの処理.
			foreach(explode(';', $form['emails']) as $_email) {
				$tmp_email = trim($_email);
				if(0 < strlen($tmp_email)) {
					// メールフォーマットを確認.
					$reg_str = "/^([a-zA-Z0-9])+([a-zA-Z0-9._-])*@([a-zA-Z0-9_-])+([a-zA-Z0-9._-]+)+$/";
					if (preg_match($reg_str, $tmp_email)) {
						$emails[] = $tmp_email; // 招待メールを送るべきメールアドレスと認める.
					} else {
						$errorList[] = "{$tmp_email}は、正しくないメールアドレスです。";
					}
				}
			}
		}
		if(0 == count($errorList) AND 0 < count($emails)) {

			// 既にスタッフとして登録されているメアドがないか確認しておく = 重複を許すとログインしたときstaffマスタから複数件のレコードが取れてしまい混線してしまう.
			$collaborativeServicesProvidedDataDao = Application_CommonUtil::getInstance("dao", "CollaborativeServicesProvidedDataDao", $this->db);
			$_emails = [];
			foreach($emails as $d) {
				$_emails[] = sprintf("'%s'", $d);
			}

			$condition = "dprofile_email in (".implode(',', $_emails).")";
			$invitationStaffs = $collaborativeServicesProvidedDataDao->fetchAll($condition);
			if(0 < count($invitationStaffs)) {
				foreach($invitationStaffs as $processed) {
					$errorList[] = $processed['dprofile_email']." は、サービスに登録されています。";
				}
			} else {
				// 招待メールを送り、DBに記録する.
				$mailModel = Application_CommonUtil::getInstance('model', "MailModel", $this->db);
				foreach($emails as $email) {
					$hashKey = md5($email);
					$unix = time();
					$createTime = date('Y-m-d H:i:s', $unix);
					$mailTime	= date('ymdHis', $unix);
					//$checkTime = date('Y-m-d H:i:s', strtotime('20'.$mailTime)); // 復号テスト = メールに添付する $mailTime ろ $createTimeに復号してDB検索出来るか？.
					$url = $collaborativeServicesModel->getRedirectUriStaffInvitation().sprintf("?id=%s&acttime=%s", $hashKey, $mailTime);

					$mailModel->sendStaffInvitationMail($sender, $email, $url); // メールの送信.
					$this->dao->insert($sender, $email, $hashKey, $createTime);

					$processedList[] = $mail; // 送信を官僚したメールアドレスを画面出力用に持つ.
				}
			}
		}

		// 特にエラーもなく、1件も招待メールを送れないケースは エンドユーザに原因を押し付けておく.
		if(0 == count($errorList) AND 0 == count($processedList)) {
			$errorList[] = "ビジネスdアカウントに登録している連絡先メールアドレスを入力してください。";
		}

		return ['errorList' => $errorList, 'processedList' => $processedList];

	}

	public function autoStaffRegist($userInfo, $hashKey, $createTime) {

		$adminModel = Application_CommonUtil::getInstance("model", "AdminModel", $this->db);

		// dアカウントに登録されているメールアドレスがキャリアと企業で分かれており、
		// emailにはキャリアのメールアドレスが優先して入るようになっており、キャリアがない場合は企業が入るようになっているので
		// 登録時はemailの項目に入っているデータを利用するようにする
		$dprofileEmail = $userInfo['email'];


		// 招待者の情報から 所属するクライアント情報を解決する.
		$invitationSql = "hash_key = \"{$hashKey}\" AND create_time = \"$createTime\" AND dprofile_email = \"{$dprofileEmail}\"";
		$invitationInfos = $this->dao->fetchAll($invitationSql);
		
		if(empty($invitationInfos)) {
			// 初回で企業メールアドレスが登録されキャリアを後で登録した場合？一致しない場合は企業のメールアドレスで再度検索をする
			$dprofileEmail = $userInfo['dprofile_GeneralMlAddr'];
			$invitationSql = "hash_key = \"{$hashKey}\" AND create_time = \"$createTime\" AND dprofile_email = \"{$dprofileEmail}\"";
			$invitationInfos = $this->dao->fetchAll($invitationSql);
		}

		// スタッフの自動登録の開始.
		if(0 < count($invitationInfos)) {
			$invitationInfo = $invitationInfos[0];

			// クライアントのスタッフの空き枠を確認する.
			$masterClientDao = Application_CommonUtil::getInstance('dao', "MasterClientDao", $this->db);
			$senderClient = $masterClientDao->getMasterClientRow($invitationInfo['send_client_id']);
			$adminClientModel = Application_CommonUtil::getInstance("model", "AdminClientModel", $this->db);
			$plan = $adminClientModel->checkAddStaff($invitationInfo['send_client_id'], $senderClient["plan_this_month"]); // プランの空きスタッフ枠確認.
			if(!$plan) {
				return "ご登録できる上限を超えております。<br>ご招待をされた管理者様にご確認をお願い致します。";
			}


			// MEMO. docomo版ではかなりの機能を隠しているがDBにcolumnはあるので insertがコケないよう適当な初期値を設定している.
			$form = [
				"staff_type"                    => "CE",
				"staff_id"                      => "",
				"staff_password"                => $userInfo['accountid'],
				"client_id"                     => $invitationInfo['send_client_id'],
				"client_name"                   => $userInfo['corp_company'],
				"staff_del_flg"                 => "0",
				"staff_firstname"               => $userInfo['corp_profile_name'],
				"staff_firstnamepy"             => $userInfo['corp_profile_name_kana'],
				"staff_comment"                 => "",
				"staff_lastname"                => "",
				"staff_lastnamepy"              => "",
				"staff_name"                    => "",
				"staff_email"                   => $dprofileEmail,
				"staff_role"                    => "2",
				"webphone_id"                   => "",
				"webphone_pass"                 => "",
				"webphone_ip"                   => "",
				"gaccount"                      => "",
				"gaccount_pass"                 => "",
				"telework_start_date"           => "",
				"telework_end_date"             => "",
				"call_type"                     => 1,
				"sum_span_type"                 => "3",
				"telephone_hour_price"          => "1500",
				"staff_payment_type"            => "1",
				"telephone_one_price"           => "150",
				"maildm_hour_price"             => "1500",
				"maildm_one_price"              => "150",
				"inquiry_hour_price"            => "1500",
				"inquiry_one_price"             => "150",
				"auto_call"                     => "0",
				"login_flg"                     => "1",
				"desktop_notify_flg"            => "1",
				"salescrowd_staff_type"         => "",
				"salescrowd_staff_id"           => "",
				"salescrowd_token"              => "",
				"new"                           => "1",
				"controller"                    => "admin",
				"action"                        => "staff-regist",
				"module"                        => "default",
				"dummypass"                     => "",
				"tmp_profile"                   => "",
				"picture_flg"                   => "",
				"staff_password_mod"            => "1",
				"delete_general_authority_flg"  => "0",
				"DocomoID"                      => $userInfo['DocomoID'],
				"accountid"                     => $userInfo['accountid'],
				"dprofile_email"                => $dprofileEmail,
				"namecard_client_id"            => $invitationInfo['send_client_id'],
				"namecard_email"                => $dprofileEmail,
				"namecard_url"                  => "",
				"department"                    => $userInfo['corp_department'],
				"client_postcode1"              => "",
				"client_postcode2"              => "",
				"address"                       => "",
				"tel1"						    => "",
				"tel2"						    => "",
				"tel3"						    => "",
				"cell1"                         => "",
				"cell2"                         => "",
				"cell3"                         => "",
				"fax1"                          => "",
				"fax2"                          => "",
				"fax3"                          => "",
				"facebook"                      => "",
				"sns"                           => "",
				"free_item_name1"               => "",
				"free_item_val1"                => "",
				"free_item_name2"               => "",
				"free_item_val2"                => "",
				"free_item_name3"               => "",
				"free_item_val3"                => "",
				"free_item_name4"               => "",
				"free_item_val4"                => "",
				"free_item_name5"               => "",
				"free_item_val5"                => "",
				'namecard_photo1_desc'          => "",
				'namecard_photo2_desc'          => "",
				'namecard_introduction'         => "",
				'namecard_cate1_title'          => "",
				'namecard_cate2_title'          => "",
				'namecard_cate3_title'          => "",
				'namecard_cate4_title'          => "",
				"meetin_number"                 => 0,

			];

			// スタッフレコード作成.
			$result = $this->staffRegist($form);
			if(0 < count($result['errorList'])){
				return $result['errorList'][0];
			}

			// 招待メールを実行した記録をつける.
			$invitationInfo['processed_time'] = new Zend_Db_Expr('now()');
			$this->dao->update($invitationSql, $invitationInfo);

		} else {

			return '招待についての情報が見つかりませんでした。<br><br>招待を受け取ったメールアドレスが、<br>ビジネスｄアカウントに登録したメールアドレスと<br>一致しない為に発生した場合が含まれます。';
		}
	}

	/*
	 * 招待メール用の スタッフを作成する処理.
	 * application/models/Model/AdminModel.php の　簡易版.
	 *
	 * 管理者(別人)や本人含めて誰もログイン状態ではない状態で実行する点など、シュチュエーションの違いから$this->userが使えない等から元を拡張するのは面倒だった為.
	 * 単純に staffマスタに1レコード作成するものを作った.
	 */
	private function staffRegist($form) {

		// 戻り値の宣言
		$result = array();
		$result["registCompleteFlg"] = 0;
		$result["errorList"] = array();
		// daoの宣言
		$masterStaffDao = Application_CommonUtil::getInstance('dao', "MasterStaffDao", $this->db);
		$collaborativeServicesProvidedDataDao = Application_CommonUtil::getInstance("dao", "CollaborativeServicesProvidedDataDao", $this->db);
		// modelの宣言
		$apiScAuthModel = Application_CommonUtil::getInstance('model', "ApiScAuthModel", $this->db);
		$adminModel = Application_CommonUtil::getInstance('model', "AdminModel", $this->db);

		/*****************
		 * ファイル一時保存
		 *****************/
		// プロフィール写真
		$namecardProfileImgPath = null;
		$namecardProfileImgPath = $adminModel->tempPhotoFile(array(
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
		$namecardImgPath = $adminModel->tempPhotoFile(array(
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
		$namecardPhoto1ImgPath = $adminModel->tempPhotoFile(array(
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
		$namecardPhoto2ImgPath = $adminModel->tempPhotoFile(array(
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

		// 登録処理を行う
		// バリデーションを実行する
		//$errorList = $adminModel->masterStaffValidation($form, $masterStaffDao);
		if(true){

			$staffDict = $form;

			// MEMO. docomo案件の エンドユーザアカウントは、dアカウントが提供する値でパスワードにして自動ログイン出来るようにしている.
			if($staffDict['staff_type'] == 'CE' && $staffDict['accountid'] != ''){
				$staffDict['staff_password'] = implode("", array_reverse(str_split($staffDict['accountid'], 3))); // accountid の アナグラム.
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
					$errorList["error"][] = 'ユーザ登録に失敗しました。';//'meetin番号の採番に失敗しました';
					//throw new Exception('meetin number generation failure');
					return ['errorList' => $errorList];
				}
				$this->insertNamecard($staffDict);


				// メールを送信する
				$mailModel = Application_CommonUtil::getInstance('model', "MailModel", $this->db);
				if($sType == 'AA') {
					$mailModel->sendRegistAaAccountMail("登録", $staffDict);
				} else if($sType == 'CE') {
					$masterClientDao = Application_CommonUtil::getInstance('dao', "MasterClientDao", $this->db);
					$client = $masterClientDao->getMasterClientRow($staffDict["client_id"]);
					$mailModel->sendRegistCeAccountMail("登録", $staffDict, $client);
				}

				// プロフィール写真
				$adminModel->uploadProfileFile(array(
					"files" => "picture_file",
					"staff_type" => $sType,
					"staff_id" => $staffDict['staff_id'],
					"upload_dir" => $_SERVER['DOCUMENT_ROOT'] . "/img/profile",
					"tmpfiles" => $form['tmp_profile']
				));
				// プロフィール写真削除(ただしpicture_flg='0'の場合のみ)
				$adminModel->deleteProfileFile(array(
					"staff_type" => $sType,
					"staff_id" => $staffDict['staff_id'],
					"upload_dir" => $_SERVER['DOCUMENT_ROOT'] . "/img/profile",
					"delete_flg" => $form['picture_flg']
				));

				// 名刺
				$adminModel->uploadNamecardFile(array(
					"files" => "namecard_file",
					"staff_type" => $sType,
					"staff_id" => $staffDict['staff_id'],
					"client_id" => $form['namecard_client_id'],
					"upload_dir" => $_SERVER['DOCUMENT_ROOT'] . "/img/namecard",
					"tmpfiles" => $form['tmp_namecard']
				));
				// 名刺データ削除(ただしnamecard_flg='0'の場合のみ)
				$adminModel->deleteNamecardFile(array(
					"staff_type" => $sType,
					"staff_id" => $staffDict['staff_id'],
					"client_id" => $form['namecard_client_id'],
					"upload_dir" => $_SERVER['DOCUMENT_ROOT'] . "/img/namecard",
					"delete_flg" => $form['namecard_flg']
				));

				// 写真１
				$adminModel->uploadPhotoFile(array(
					"files" => "namecard_photo1",
					"staff_type" => $sType,
					"staff_id" => $staffDict['staff_id'],
					"client_id" => $form['namecard_client_id'],
					"upload_dir" => $_SERVER['DOCUMENT_ROOT'] . "/img/photo-data",
					"surffix" => 1,
					"tmpfiles" => $form['tmpNamecard_photo1']
				));
				// 写真１削除(ただしphoto1_flg='0'の場合のみ)
				$adminModel->deletePhotoFile(array(
					"staff_type" => $sType,
					"staff_id" => $staffDict['staff_id'],
					"client_id" => $form['namecard_client_id'],
					"upload_dir" => $_SERVER['DOCUMENT_ROOT'] . "/img/photo-data",
					"surffix" => 1,
					"delete_flg" => $form['photo1_flg']
				));

				// 写真２
				$adminModel->uploadPhotoFile(array(
					"files" => "namecard_photo2",
					"staff_type" => $sType,
					"staff_id" => $staffDict['staff_id'],
					"client_id" => $form['namecard_client_id'],
					"upload_dir" => $_SERVER['DOCUMENT_ROOT'] . "/img/photo-data",
					"surffix" => 2,
					"tmpfiles" => $form['tmpNamecard_photo2']
				));
				// 写真２削除(ただしphoto2_flg='0'の場合のみ)
				$adminModel->deletePhotoFile(array(
					"staff_type" => $sType,
					"staff_id" => $staffDict['staff_id'],
					"client_id" => $form['namecard_client_id'],
					"upload_dir" => $_SERVER['DOCUMENT_ROOT'] . "/img/photo-data",
					"surffix" => 2,
					"delete_flg" => $form['photo2_flg']
				));


				$this->db->commit();
			}catch(Exception $e){
				$this->db->rollBack();
				throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
			}

			$collaborativeServicesProvidedDataDao->insert([
				"staff_type"			 => $staffDict["staff_type"],
				"staff_id"				 => $staffDict["staff_id"],
				"accountid"				 => $form["accountid"],
				"DocomoID"				 => $form["DocomoID"],
				"dprofile_email"         => $form["dprofile_email"]
			]);

			// 登録完了の場合は一覧へ遷移するためフラグを立てる
			$result["registCompleteFlg"] = 1;
			$result["staffDict"] = $staffDict;

		}else{

			$result["staffDict"] = $form;
			$result["errorList"] = $errorList;
		}

		return $result;
	}

	private function insertNamecard($form) {
		$masterStaffDao = Application_CommonUtil::getInstance('dao', "MasterStaffDao", $this->db);
		$namecard_record = array(
			'client_id' => $form["namecard_client_id"],
			'staff_type' => $form["staff_type"],
			'staff_id' => $form["staff_id"],
			'staff_firstname' => new Zend_Db_Expr("AES_ENCRYPT({$this->db->quote($form['staff_firstname'])}, @key)"),
			'staff_lastname' => new Zend_Db_Expr("AES_ENCRYPT({$this->db->quote($form['staff_lastname'])}, @key)"),
			'namecard_name_public_flg' => $masterStaffDao->returnNullZero($form['name_public_flg']),
			'namecard_meetin_public_flg' => $masterStaffDao->returnNullZero($form['meetin_id_public_flg']),
			'namecard_room_public_flg' => $masterStaffDao->returnNullZero($form['namecard_room_public_flg']),
			'namecard_client_name' => $form['client_name'],
			'namecard_client_name_public_flg' => $masterStaffDao->returnNullZero($form['client_name_public_flg']),
			'namecard_email' => $form["namecard_email"],
			'namecard_email_public_flg' => $masterStaffDao->returnNullZero($form['email_public_flg']),
			'namecard_url' => $form["namecard_url"],
			'namecard_url_public_flg' => $masterStaffDao->returnNullZero($form['url_public_flg']),
			'namecard_picture_public_flg' => $masterStaffDao->returnNullZero($form['picture_public_flg']),
			'namecard_card_public_flg' => $masterStaffDao->returnNullZero($form['namecard_public_flg']),
			'namecard_department' => $form["department"],
			'namecard_department_public_flg' => $masterStaffDao->returnNullZero($form['department_name_public_flg']),
			'namecard_executive' => $form["executive"],
			'namecard_executive_public_flg' => $masterStaffDao->returnNullZero($form['executive_name_public_flg']),
			'namecard_postcode1' => $form["client_postcode1"],
			'namecard_postcode2' => $form["client_postcode2"],
			'namecard_address' => $form["address"],
			'namecard_address_public_flg' => $masterStaffDao->returnNullZero($form['address_public_flg']),
			'namecard_tel1' => $form["tel1"],
			'namecard_tel2' => $form["tel2"],
			'namecard_tel3' => $form["tel3"],
			'namecard_tel_public_flg' => $masterStaffDao->returnNullZero($form['tel_public_flg']),
			'namecard_cell1' => $form["cell1"],
			'namecard_cell2' => $form["cell2"],
			'namecard_cell3' => $form["cell3"],
			'namecard_cell_public_flg' => $masterStaffDao->returnNullZero($form['cell_public_flg']),
			'namecard_fax1' => $form["fax1"],
			'namecard_fax2' => $form["fax2"],
			'namecard_fax3' => $form["fax3"],
			'namecard_fax_public_flg' => $masterStaffDao->returnNullZero($form['fax_public_flg']),
			'namecard_facebook' => $form["facebook"],
			'namecard_facebook_public_flg' => $masterStaffDao->returnNullZero($form['facebook_public_flg']),
			'namecard_sns' => $form["sns"],
			'namecard_sns_public_flg' => $masterStaffDao->returnNullZero($form['sns_public_flg']),
			'namecard_free1_name' => $form["free_item_name1"],
			'namecard_free1_val' => $form["free_item_val1"],
			'namecard_free1_public_flg' => $masterStaffDao->returnNullZero($form['free1_public_flg']),
			'namecard_free2_name' => $form["free_item_name2"],
			'namecard_free2_val' => $form["free_item_val2"],
			'namecard_free2_public_flg' => $masterStaffDao->returnNullZero($form['free2_public_flg']),
			'namecard_free3_name' => $form["free_item_name3"],
			'namecard_free3_val' => $form["free_item_val3"],
			'namecard_free3_public_flg' => $masterStaffDao->returnNullZero($form['free3_public_flg']),
			'namecard_free4_name' => $form["free_item_name4"],
			'namecard_free4_val' => $form["free_item_val4"],
			'namecard_free4_public_flg' => $masterStaffDao->returnNullZero($form['free4_public_flg']),
			'namecard_free5_name' => $form["free_item_name5"],
			'namecard_free5_val' => $form["free_item_val5"],
			'namecard_free5_public_flg' => $masterStaffDao->returnNullZero($form['free5_public_flg']),
			'namecard_photo1_desc' => $form['namecard_photo1_desc'],
			'namecard_photo1_desc_public_flg' => $masterStaffDao->returnNullZero($form['namecard_photo1_desc_public_flg']),
			'namecard_photo1_public_flg' => $masterStaffDao->returnNullZero($form['namecard_photo1_public_flg']),
			'namecard_photo2_desc' => $form['namecard_photo2_desc'],
			'namecard_photo2_desc_public_flg' => $masterStaffDao->returnNullZero($form['namecard_photo2_desc_public_flg']),
			'namecard_photo2_public_flg' => $masterStaffDao->returnNullZero($form['namecard_photo2_public_flg']),
			'namecard_introduction' => $form['namecard_introduction'],
			'namecard_introduction_public_flg' => $masterStaffDao->returnNullZero($form['namecard_introduction_public_flg']),
			'namecard_cate1_title' => $form['namecard_cate1_title'],
			'namecard_cate1_title_public_flg' => $masterStaffDao->returnNullZero($form['namecard_cate1_title_public_flg']),
			'namecard_cate2_title' => $form['namecard_cate2_title'],
			'namecard_cate2_title_public_flg' => $masterStaffDao->returnNullZero($form['namecard_cate2_title_public_flg']),
			'namecard_cate3_title' => $form['namecard_cate3_title'],
			'namecard_cate3_title_public_flg' => $masterStaffDao->returnNullZero($form['namecard_cate3_title_public_flg']),
			'namecard_cate4_title' => $form['namecard_cate4_title'],
			'namecard_cate4_title_public_flg' => $masterStaffDao->returnNullZero($form['namecard_cate4_title_public_flg']),
			'update_date' => new Zend_Db_Expr('now()'),
		);
		$namecard_record["create_date"] = new Zend_Db_Expr('now()');
		$this->db->insert('staff_client',$namecard_record);
	}

}
