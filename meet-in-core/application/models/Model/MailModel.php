<?php

/**
 * メール送信で使用するモデル
 * @author admin
 *
 */
class MailModel extends AbstractModel{

	const IDENTIFIER = "mail";		// セッション変数のnamespace
	const ROLE_ADM = 1;				// 管理者
	const ROLE_EMP = 2;				// 社員
	const ROLE_PRT = 3;				// アルバイト
	private $db;							// DBコネクション

	function __construct($db){
		$this->db = $db;

		parent::init();
	}


	/**
	 * AAアカウントを新規・編集した場合のメール送信
	 * パスワードの再発行後の通知でも利用する.
	 *
	 * @param unknown $action 文字列 登録/編集
	 * @param unknown $staff
	 * @param unknown $admin_mail
	 */
	Public  function sendRegistAaAccountMail($staffDict){
		$str_staff_role   = $this->getRoleName($staffDict['staff_role']);
		$str_password = (isset($staffDict['staff_password']) && $staffDict['staff_password'] != '')? $staffDict['staff_password']: '変更なし';
		// webphone設定
		$str_has_webphone = "設定されていません。";
		if($staffDict['webphone_id'] != ""){
			$str_has_webphone = "設定されています。";
		}
		// 登録か編集のメッセージを設定
		$action = "登録";
		if(array_key_exists("staff_id", $staffDict)){
			$action = "編集";
		}
		//-----------------------//
		$admin_mail = $this->config->mail->admin_mail;
		$fromname = $admin_mail;

		$subject =  "【meet-inサポート窓口】アカウント登録情報のお知らせ";

		$message  = '';
		$message .= "----------------------------------------------------------------- \r\n";
		$message .= "アカウント情報の". $action ."が完了しました。 \r\n";
		$message .= "登録されたアカウント情報をお送りします。 \r\n";
		$message .= "-----------------------------------------------------------------\r\n";
		$message .= "▼アカウント登録情報▼\r\n";
		$message .= "\r\n";
		$message .= "アカウントID：\r\n";
		$message .= "「{$staffDict['staff_type']}" .str_pad($staffDict['staff_id'],5,"0",STR_PAD_LEFT). "」\r\n";
		$message .= "\r\n";
		$message .= "パスワード：\r\n";
		$message .= "「{$str_password}」　\r\n";
		$message .= "\r\n";
		$message .= "お名前：\r\n";
		$message .= "「{$staffDict['staff_name']}」\r\n";
		$message .= "\r\n";
		$message .= "メールアドレス：\r\n";
		$message .= "「{$staffDict['staff_email']}」\r\n";
		$message .= "\r\n";
		$message .= "役割：\r\n";
		$message .= "「{$str_staff_role}」\r\n";
		$message .= "\r\n";
		$message .= "Webフォン：\r\n";
		$message .= "「{$str_has_webphone}」\r\n";
		// メール送信処理
		$this->sendMail($fromname, $staffDict['staff_email'], $admin_mail, $subject, $message);
	}


	/**
	 * クライアントを新規・編集した場合のメール送信
	 *
	 * @param unknown $action
	 * @param unknown $client
	 * @param unknown $admin_mail
	 * @param unknown $stafflist
	 * @param unknown $categorynamelist
	 */
	public function sendRegistClientMail($client, $stafflist, $categoryList, $serviceList){
		// 担当者名を,区切りでつなげる
		$staffname = '';
		foreach ($stafflist as $staff){
			$staffname .= $staff['staff_name']. ',';
		}
		$staffname = substr($staffname, 0, -1);
		// カテゴリ
		$category = "";
		foreach($categoryList as $categoryDict){
			$category .= "ジャンル：「". $categoryDict['category1_name']. "」\r\n";
			$category .= "業界：「". $categoryDict['category2_name']. "」\r\n";
			$category .= "業種：「". $categoryDict['category3_name']. "」\r\n";
		}
		// サービス/商品名
		$servicename = '';
		foreach ($serviceList as $service){
			$servicename .= "「". $service["service_name"]. "」\r\n";
		}

		//-----------------------//

		$fromname = $this->config->mail->admin_mail;

		$subject  = "【meet-inサポート窓口】会社情報登録のお知らせ";

		$message  = '';
		$message .= "----------------------------------------------------------------- \r\n";
		$message .= "会社情報の編集が完了しました。 \r\n";
		$message .= "登録された情報をお送りします。 \r\n";
		$message .= "-----------------------------------------------------------------\r\n";
		$message .= "▼登録情報▼\r\n";
		$message .= "\r\n";
		$message .= "クライアントID：\r\n";
		$message .= "「CA".str_pad($client['clientId'],5,"0",STR_PAD_LEFT). "」\r\n";
		$message .= "\r\n";
		$message .= "貴社名：\r\n";
		$message .= "「". $client['client_name']. "」\r\n";
		$message .= "「". $client['client_namepy']. "」\r\n";
		$message .= "\r\n";
		$message .= "貴社住所：\r\n";
		$message .= "「". $client['client_postcode1']. '-'. $client['client_postcode2']. "」\r\n";
		$message .= "「". $client['client_address']. "」\r\n";
		$message .= "\r\n";
		$message .= "御連絡先：\r\n";
		$message .= "「". $client['client_tel1']. '-'. $client['client_tel2']. "-". $client['client_tel3']. "」\r\n";
		$message .= "\r\n";
		$message .= "FAX番号：\r\n";
		$message .= "「". $client['client_fax1']. "-". $client['client_fax2']. "-". $client['client_fax3']. "」\r\n";
		$message .= "\r\n";
		$message .= "代表者様名：\r\n";
		$message .= "「". $client['client_staffleaderfirstname'].$client['client_staffleaderlastname']. "」\r\n";
		$message .= "「". $client['client_staffleaderfirstnamepy'].$client['client_staffleaderlastnamepy']. "」\r\n";
		$message .= "\r\n";
		$message .= "メールアドレス：\r\n";
		$message .= "「". $client['client_staffleaderemail']. "」\r\n";
		$message .= "\r\n";
		$message .= "貴社ホームページ：\r\n";
		$message .= "「". $client['client_homepage']. "」\r\n";
		$message .= "\r\n";
		$message .= "サービス区分：\r\n";
		$message .= $category;
		$message .= "\r\n";
		$message .= "サービス/商品名：\r\n";
		$message .= $servicename;
		$message .= "\r\n";
		$message .= "弊社担当者：\r\n";
		$message .= "「". $staffname. "」\r\n";
		$message .= "\r\n";

		// メール送信処理
		foreach($stafflist as $staff){
			// クライアント担当者宛にメール
			$this->sendMail($fromname, $staff['staff_email'], null, $subject, $message);
		}
		// クライアント代表者宛にメール
		$this->sendMail($fromname, null, null, $subject, $message, $client['client_staffleaderemail']);
		// TMO管理者宛にメール
		$this->sendMail($fromname, null, $fromname, $subject, $message );
	}

	/**
	 * クライアント担当者を新規・編集した場合のメール送信
	 *
	 * @param unknown $action 文字列 登録/編集
	 * @param unknown $staff
	 * @param unknown $admin_mail
	 */
	Public  function sendRegistCeAccountMail($staffDict){
		// 権限の文言取得
		$str_role   = $this->getRoleName($staffDict['staff_role']);
		// webphone設定
		$str_has_webphone = "設定されていません。";
		if($staffDict['webphone_id'] != ""){
			$str_has_webphone = "設定されています。";
		}
		// ログイン可能か不可能かメッセージを設定する
		$loginMsg = "不可";
		if($staffDict["login_flg"] == "1"){
			$loginMsg = "可能";
		}
		// 登録か編集のメッセージを設定
		$action = "登録";
		if(array_key_exists("staff_id", $staff)){
			$action = "編集";
		}
		$str_password = (isset($staffDict['staff_password']) && $staffDict['staff_password'] != '')? $staffDict['staff_password']: '変更なし';

		//-----------------------//
		$admin_mail = $this->config->mail->admin_mail;
		$fromname = $admin_mail;

		$subject =  "【meet-inサポート窓口】アカウント登録情報のお知らせ";

		$message  = '';
		$message .= "----------------------------------------------------------------- \r\n";
		$message .= "アカウント情報の". $action ."が完了しました。 \r\n";
		$message .= "登録されたアカウント情報をお送りします。 \r\n";
		$message .= "-----------------------------------------------------------------\r\n";
		$message .= "▼アカウント登録情報▼\r\n";
		$message .= "\r\n";
		$message .= "アカウントID：\r\n";
		$message .= "「CE".str_pad($staffDict['staff_id'],5,"0",STR_PAD_LEFT). "」\r\n";
		$message .= "\r\n";
		$message .= "パスワード：\r\n";
		$message .= "「". $str_password ."」　\r\n";
		$message .= "\r\n";
		$message .= "お名前：\r\n";
		$message .= "「". $staffDict['staff_firstname'] .$staffDict['staff_lastname'] ."」\r\n";
		$message .= "\r\n";
		$message .= "メールアドレス：\r\n";
		$message .= "「". $staffDict['staff_email'] ."」\r\n";
		$message .= "\r\n";
		$message .= "役割：\r\n";
		$message .= "「". $str_role ."」\r\n";
		$message .= "\r\n";
		$message .= "ログイン：\r\n";
		$message .= "「". $loginMsg ."」\r\n";
		$message .= "\r\n";
		$message .= "サイトURL：\r\n";
		$message .= "「https://meet-in.jp 」\r\n";
		$message .= $this->partsContactInformationMeetIn(); // お問い合わせ先の追加.

		$this->sendMail($fromname, $staffDict['staff_email'], $admin_mail, $subject, $message);

	}

	/**
	 * 在宅アカウントを新規・編集した場合のメール送信
	 *
	 * @param unknown $action 文字列 登録/編集
	 * @param unknown $staff
	 * @param unknown $admin_mail
	 */
	Public  function sendRegistTaAccountMail($staffDict){
		$str_password = (isset($staffDict['staff_password']) && $staffDict['staff_password'] != '')? $staffDict['staff_password']: '変更なし';
		// webphone設定
		$str_has_webphone = "設定されていません。";
		if($staffDict['webphone_id'] != ""){
			$str_has_webphone = "設定されています。";
		}
		// 登録か編集のメッセージを設定
		$action = "登録";
		if(array_key_exists("staff_id", $staffDict)){
			$action = "編集";
		}
		//-----------------------//
		$admin_mail = $this->config->mail->admin_mail;
		$fromname = $admin_mail;

		$subject =  "【meet-inサポート窓口】アカウント登録情報のお知らせ";

		$message  = '';
		$message .= "----------------------------------------------------------------- \r\n";
		$message .= "アカウント情報の". $action ."が完了しました。 \r\n";
		$message .= "登録されたアカウント情報をお送りします。 \r\n";
		$message .= "-----------------------------------------------------------------\r\n";
		$message .= "▼アカウント登録情報▼\r\n";
		$message .= "\r\n";
		$message .= "アカウントID：\r\n";
		$message .= "「TA" .str_pad($staffDict['staff_id'],5,"0",STR_PAD_LEFT). "」\r\n";
		$message .= "\r\n";
		$message .= "パスワード：\r\n";
		$message .= "「". $str_password ."」　\r\n";
		$message .= "\r\n";
		$message .= "お名前：\r\n";
		$message .= "「". $staffDict['staff_name'] ."」\r\n";
		$message .= "\r\n";
		$message .= "メールアドレス：\r\n";
		$message .= "「". $staffDict['staff_email'] ."」\r\n";
		$message .= "\r\n";
		$message .= "契約開始日：\r\n";
		$message .= "「". $staffDict['telework_start_date'] ."」\r\n";
		$message .= "\r\n";
		$message .= "Webフォン：\r\n";
		$message .= "「". $str_has_webphone ."」\r\n";

		$this->sendMail($fromname, $staffDict['staff_email'], $admin_mail, $subject, $message);
	}

	/**
	 * 環境設定でアカウント設定を新規・編集した場合のメール送信
	 *
	 * @param unknown $action 文字列 登録/編集
	 * @param unknown $staff
	 * @param unknown $admin_mail
	 */
	public function sendUpdateUserInfoMail($staffDict) {

		$str_user_id  = ($this->user["staff_type"]).sprintf("%05d ", $this->user['staff_id']);
		$str_password = (isset($staffDict['staff_password']) && $staffDict['staff_password'] != '')? $staffDict['staff_password']: '変更なし';

		// 登録か編集のメッセージを設定
		$action = "編集";

		$admin_mail = $this->config->mail->admin_mail;
		$fromname = $admin_mail;

		$subject =  "【meet-inサポート窓口】アカウント設定登録情報のお知らせ";

		$message  = '';
		$message .= "----------------------------------------------------------------- \r\n";
		$message .= "アカウント設定情報の". $action ."が完了しました。 \r\n";
		$message .= "登録されたアカウント設定情報をお送りします。 \r\n";
		$message .= "-----------------------------------------------------------------\r\n";
		$message .= "▼アカウント設定登録情報▼\r\n";
		$message .= "\r\n";
		$message .= "担当者ID：\r\n";
		$message .= "「" . $str_user_id . "」\r\n";
		$message .= "\r\n";
		$message .= "パスワード：\r\n";
		$message .= "「". $str_password ."」　\r\n";
		$message .= "\r\n";
		$message .= "担当者メールアドレス：\r\n";
		$message .= "「". $staffDict['staff_email'] ."」\r\n";

		// メール送信処理
		$this->sendMail($fromname, $staffDict['staff_email'], null, $subject, $message);
	}

	/**
	 * トライアルユーザーにメールを送信する
	 * @param unknown $staffDict
	 */
	Public  function sendRegistTrialAccountMail($staffDict){
		//-----------------------//
		// 送信者メールアドレス
		$admin_mail = $this->config->mail->admin_mail;
		// タイトル
		$subject =  "【meet-inサポート窓口】アカウント登録情報のお知らせ";
		// 本文
		$message  = '';
		$message .= "----------------------------------------------------------------- \r\n";
		$message .= "アカウント情報の登録が完了しました。 \r\n";
		$message .= "登録されたアカウント情報をお送りします。 \r\n";
		$message .= "-----------------------------------------------------------------\r\n";
		$message .= "▼アカウント登録情報▼\r\n";
		$message .= "\r\n";
		$message .= "アカウントID：\r\n";
		$message .= "「CE".str_pad($staffDict['staff_id'],5,"0",STR_PAD_LEFT). "」\r\n";
		$message .= "\r\n";
		$message .= "パスワード：\r\n";
		$message .= "「". $staffDict["password"] ."」　\r\n";
		$message .= "\r\n";
		$message .= "お名前：\r\n";
		$message .= "「". $staffDict['last_name'] .$staffDict['farst_name'] ."」\r\n";
		$message .= "\r\n";
		$message .= "メールアドレス：\r\n";
		$message .= "「". $staffDict['mail'] ."」\r\n";
		$message .= "\r\n";
		$message .= "役割：\r\n";
		$message .= "「一般」\r\n";
		$message .= "\r\n";
		$message .= "ログイン：\r\n";
		$message .= "「可能」\r\n";
		$message .= "\r\n";
		$message .= "サイトURL：\r\n";
		$message .= "「https://meet-in.jp 」\r\n";
		$this->sendMail($admin_mail, $staffDict['mail'], $admin_mail, $subject, $message);
	}

	/**
	 * トライアルユーザーにメールを送信する
	 * @param unknown $staffDict
	 */
	Public  function sendRegistTrialAccountMailToAdmin($staffDict){
		//-----------------------//
		// 送信者メールアドレス
		$admin_mail = "sales@meet-in.jp";
		// タイトル
		$subject =  "【meet-inサポート窓口】トライアル登録のお知らせ";
		// 本文
		$message  = '';
		$message .= "----------------------------------------------------------------- \r\n";
		$message .= "トライアル情報の登録がされました \r\n";
		$message .= "登録されたトライアル情報をお送りします。 \r\n";
		$message .= "-----------------------------------------------------------------\r\n";
		$message .= "\r\n";
		$message .= "氏名\r\n";
		$message .= "「". $staffDict['last_name'] .$staffDict['farst_name'] ."」\r\n";
		$message .= "\r\n";
		$message .= "会社名\r\n";
		$message .= "「". $staffDict["company"] ."」　\r\n";
		$message .= "\r\n";
		$message .= "電話番号\r\n";
		$message .= "「".$staffDict['tel_number_1']."-".$staffDict['tel_number_2']."-".$staffDict['tel_number_3']."」\r\n";
		$message .= "\r\n";
		$message .= "メールアドレス：\r\n";
		$message .= "「". $staffDict['mail'] ."」\r\n";
		$message .= "\r\n";
		$message .= "使用用途\r\n";
		$message .= "「". $staffDict['use'] ."」\r\n";
		$message .= "\r\n";
		$this->sendMail($admin_mail, $admin_mail, null, $subject, $message);
	}

	/**
	 * パスワード再発行メールを送信する
	 * @param unknown $staffDict
	 */
	public function sendPasswordReissueMail($staffDict){
		//-----------------------//
		// 送信者メールアドレス
		$admin_mail = $this->config->mail->admin_mail;
		// タイトル
		$subject =  "【meet-inサポート窓口】パスワード再発行のお知らせ";
		// 本文
		$message  = '';
		$message .= "----------------------------------------------------------------- \r\n";
		$message .= "パスワードの再発行が完了しました。 \r\n";
		$message .= "登録されたパスワードをお送りします。 \r\n";
		$message .= "-----------------------------------------------------------------\r\n";
		$message .= "▼再発行パスワード▼\r\n";
		$message .= "\r\n";
		$message .= "パスワード：\r\n";
		$message .= "「". $staffDict["password"] ."」　\r\n";
		$message .= "\r\n";
		$message .= "サイトURL：\r\n";
		$message .= "「https://meet-in.jp 」\r\n";
		$this->sendMail($admin_mail, $staffDict['mail'], $admin_mail, $subject, $message);
	}

	/**
	 * 電子契約 承認依頼メールを送信する
	 * @param unknown $staffDict
	 */
	 public function sendApprovalRequestMail($approverMail, $token, $takeOver) {
		// 送信者メールアドレス
		$admin_mail = $this->config->mail->admin_mail;
		$from_address = $this->config->mail->keiyaku_mail;

		// タイトル
		$subject =  "【meet-inサポート窓口】電子契約承認依頼のお知らせ";
		// 本文
		$message  = '';
		$message .= "----------------------------------------------------------------- \r\n";
		$message .= "電子契約承認確認をお願い致します。 \r\n";
		$message .= "下記URLへアクセスし、本メールアドレスを入力して承認画面へ進んでください。 \r\n";
		$message .= "-----------------------------------------------------------------\r\n";
		$message .= "メッセージ\r\n";
		$message .= "\r\n";
		$message .= "$takeOver\r\n";
		$message .= "\r\n";
		$message .= "\r\n";
		$message .= "※下記のURLへ進み、印影を作成、配置して承認してください。\r\n";
		$message .= "\r\n";
		$message .= "承認URL：\r\n";
		$message .= "https://".$_SERVER['SERVER_NAME']."/e-contract-api/email-auth?token=" . $token. "&utm_campaign=receive_document&utm_source=receive&utm_medium=email";
		$this->sendMailFromAdress($from_address, $admin_mail, $approverMail, null, $subject, $message);
	 }

	/**
 	 * 電子契約 承認依頼メールを送信する
 	 * @param unknown $staffDict
 	 */
	public function sendApprovalRequestMail2($approverMail, $token, $takeOver, $approvalMethod = 0) {
		// 送信者メールアドレス
		$admin_mail = $this->config->mail->admin_mail;
		$from_address = $this->config->mail->keiyaku_mail;
		$param = $approvalMethod ? "&approval_method=true" : "";

		// タイトル
		$subject =  "【meet-inサポート窓口】電子契約承認依頼のお知らせ";
 		// 本文
		$message  = '';
		$message .= "----------------------------------------------------------------- \r\n";
		$message .= "電子契約承認確認をお願い致します。 \r\n";
		$message .= "下記URLへアクセスし、本メールアドレスを入力して承認画面へ進んでください。 \r\n";
		$message .= "\r\n";
		if ($approvalMethod == 1) {
			$message .= "書類を開くには、2要素認証（またはIdP認証）でのログインが必要です。 \r\n";
			$message .= "※2要素認証が未設定の場合は、設定完了後に書類が表示されます。 \r\n";
			$message .= "\r\n";
			$message .= "またアカウント登録されてない場合は、アカウント登録（無料）および　\r\n";
			$message .= "2要素認証の設定完了後に書類が表示されます。 \r\n";
		}
		$message .= "※下記のURLへ進み、印影を作成、配置して承認してください。\r\n";
		$message .= "\r\n";
		$message .= "承認URL：\r\n";
		$message .= "https://".$_SERVER['SERVER_NAME']."/e-contract-api/auth?token=" . $token . "&utm_campaign=receive_document&utm_source=receive&utm_medium=email" . $param;
		$message .= "\r\n";
		$message .= "-----------------------------------------------------------------\r\n";
		$message .= "メッセージ\r\n";
		$message .= "\r\n";
		if($takeOver) {
			$message .= "$takeOver\r\n";
			$message .= "\r\n";
		}
		$this->sendMailFromAdress($from_address, $admin_mail, $approverMail, null, $subject, $message);
	}

		/**
 	 * 電子契約 認証コードを送信する
 	 * @param unknown $staffDict
 	 */
 	 public function sendAuthorizationCodeMail($email, $code) {
		// 送信者メールアドレス
		$admin_mail = $this->config->mail->admin_mail;
		$from_address = $this->config->mail->keiyaku_mail;

		// タイトル
		$subject =  "【meet-inサポート窓口】電子契約認証コードのお知らせ";
		// 本文
		$message  = '';
		$message .= "----------------------------------------------------------------- \r\n";
		$message .= "電子契約認証コードをお知らせいたします。 \r\n";
		$message .= "-----------------------------------------------------------------\r\n";
		$message .= "\r\n";
		$message .= "認証コード：" . $code;
		$message .= "\r\n";
		$message .= "\r\n";
		$message .= "※現在接続中ルーム内の電子契約画面で、上記認証コードを入力してください。\r\n";
		$message .= "\r\n";
		$this->sendMailFromAdress($from_address, $admin_mail, $email, null, $subject, $message);
	}

	 /**
 	 * 電子契約 承認依頼メールを再び送信する
 	 * @param unknown $staffDict
 	 */
 	 public function resendApprovalRequestMail2($approverMail, $token, $approvalMethod = 0) {
		// 送信者メールアドレス
		$admin_mail = $this->config->mail->admin_mail;
		$from_address = $this->config->mail->keiyaku_mail;
		$param = $approvalMethod ? "&approval_method=true" : "";

		// タイトル
		$subject =  "【meet-inサポート窓口】電子契約承認依頼のお知らせ（再送）";
 		// 本文
 		$message  = '';
 		$message .= "----------------------------------------------------------------- \r\n";
 		$message .= "電子契約承認確認をお願い致します。 \r\n";
 		$message .= "下記URLへアクセスし、本メールアドレスを入力して承認画面へ進んでください。 \r\n";
 		$message .= "-----------------------------------------------------------------\r\n";
		$message .= "\r\n";
		$message .= "\r\n";
 		if ($approvalMethod == 1) {
			$message .= "書類を開くには、2要素認証（またはIdP認証）でのログインが必要です。 \r\n";
			$message .= "※2要素認証が未設定の場合は、設定完了後に書類が表示されます。 \r\n";
			$message .= "\r\n";
			$message .= "またアカウント登録されてない場合は、アカウント登録（無料）および　\r\n";
			$message .= "2要素認証の設定完了後に書類が表示されます。 \r\n";
		}
 		$message .= "※下記のURLへ進み、印影を作成、配置して承認してください。\r\n";
 		$message .= "\r\n";
 		$message .= "承認URL：\r\n";
 		$message .= "https://".$_SERVER['SERVER_NAME']."/e-contract-api/auth?token=" . $token. "&utm_campaign=receive_document&utm_source=receive&utm_medium=email". $param;
 		$this->sendMailFromAdress($from_address, $admin_mail, $approverMail, null, $subject, $message);
 	 }

	/**
	 * 電子契約 契約を削除したことを通知する.
	 * @param unknown $staffDict
	 */
	public function sendDeleteContract($approverMail, $contractName) {
		// 送信者メールアドレス
		$admin_mail = $this->config->mail->admin_mail;
		$from_address = $this->config->mail->keiyaku_mail;

		// タイトル
		$subject =  "【meet-inサポート窓口】電子契約削除のお知らせ";
		// 本文
		$message  = '';
		$message .= "----------------------------------------------------------------- \r\n";
		$message .= "書類が取り消されました。 \r\n";
		$message .= "下記の書類は閲覧できません。 \r\n";
		$message .= "-----------------------------------------------------------------\r\n";
		$message .= "\r\n";
		$message .= "契約書名：".$contractName."\r\n";
		$message .= "\r\n";
		$this->sendMailFromAdress($from_address, $admin_mail, $approverMail, null, $subject, $message);
	}

	/**
	* 電子契約 電子契約締結完了メールを送信する
	* @param unknown $staffDict
	*/
 	public function sendEContractAgreementMail($staffMail) {
		// 送信者メールアドレス
		$admin_mail = $this->config->mail->admin_mail;
		$from_address = $this->config->mail->keiyaku_mail;

		// タイトル
		$subject =  "【meet-inサポート窓口】電子契約締結のお知らせ";
		// 本文
		$message  = '';
		$message .= "----------------------------------------------------------------- \r\n";
		$message .= "承認依頼中だった電子契約が締結されましたので、連絡いたします。 \r\n";
		$message .= "下記URL契約内容をご確認いただけます。 \r\n";
		$message .= "-----------------------------------------------------------------\r\n";
		$message .= "\r\n";
		$message .= "\r\n";
		$message .= "※下記URLよりmeetinへログインし、電子契約書一覧画面より契約内容をご確認ください。\r\n";
		$message .= "\r\n";
		$message .= "ログインへ：\r\n";
		$message .= "https://".$_SERVER['SERVER_NAME']."/index/login";
		$this->sendMailFromAdress($from_address, $adminMail, $staffMail, null, $subject, $message);
	}

	/**
	 * お問い合わせ先: meet-in.
	 */
	Public function partsContactInformationMeetIn($line = true) {
		return
		($line ? "\r\n----------------------------------------------------------------------\r\n" : null).
		"\r\n" .
		"このメールに身に覚えがない場合や、上記内容に間違いがある場合、\r\n" .
		"ご不明な点がありましたら<support@meet-in.jp>までご連絡ください。\r\n" .
		"\r\n" .
		"----------------------------------------------------------------------\r\n" .
		"\r\n" .
		"■運営会社 株式会社 meet in　https://meet-in.jp\r\n" .
		"\r\n" .
		"◆システムの不具合、操作方法等に関しては\r\n" .
		"・0120-979-542（meet inサポートデスク）\r\n" .
		"※（電話受付時間：土日祝日を除く 平日10：00〜18：00）\r\n" .
		"\r\n" .
		"◆メールでのお問い合わせ：support@meet-in.jp\r\n" .
		"\r\n" .
		"----------------------------------------------------------------------\r\n";
	}

	 /**
 	 * 電子契約 電子契約締結完了メールを送信する
 	 * @param unknown $staffDict
 	 */
 	 public function sendEContractAgreementPartnerMail($partnerMail, $filePath) {
		// 送信者メールアドレス
		$admin_mail = $this->config->mail->admin_mail;
		$from_address = $this->config->mail->keiyaku_mail;

		// タイトル
		$subject =  "【meet-inサポート窓口】電子契約締結のお知らせ";
		// 本文
		$message  = '';
		$message .= "----------------------------------------------------------------- \r\n";
		$message .= "電子契約が締結されましたので、連絡いたします。 \r\n";
		$message .= "下記URLより契約書をご確認いただけます。 \r\n";
		$message .= "-----------------------------------------------------------------\r\n";
		$message .= "\r\n";
		$message .= "\r\n";
		$message .= "契約書ダウンロード：\r\n";
		$message .= "https://".$_SERVER['SERVER_NAME']. $filePath;
		$message .= "\r\n";
		$message .= "\r\n";
		$message .= "※下記のURLより契約書一覧を確認できます。\r\n";
		$message .= "https://".$_SERVER['SERVER_NAME']."/e-contract-api/partner-auth";
		$this->sendMailFromAdress($from_address, $adminMail, $partnerMail, null, $subject, $message);
 	 }

	/**
	* 電子契約 スタッフ向け却下通知メールを送信する
	* @param unknown $staffDict
	*/
	public function sendEContractCancelStaffMail($email) {
		// 送信者メールアドレス
		$admin_mail = $this->config->mail->admin_mail;
		$from_address = $this->config->mail->keiyaku_mail;


		// タイトル
		$subject =  "【meet-inサポート窓口】電子契約却下のお知らせ";
		// 本文
		$message  = '';
		$message .= "----------------------------------------------------------------- \r\n";
		$message .= "電子契約が却下されましたので、連絡いたします。 \r\n";
		$message .= "下記URLより契約書をご確認いただけます。 \r\n";
		$message .= "-----------------------------------------------------------------\r\n";
		$message .= "\r\n";
		$message .= "\r\n";
		$message .= "登録済み案件一覧：\r\n";
		$message .= "https://".$_SERVER['SERVER_NAME']."/e-contract-api/canceled";
		$this->sendMailFromAdress($from_address, $adminMail, $email, null, $subject, $message);
	}

	/**
	* 電子契約 パートナー向け却下通知メールを送信する
	* @param unknown $staffDict
	*/
	public function sendEContractCancelPartnerMail($email) {
		// 送信者メールアドレス
		$admin_mail = $this->config->mail->admin_mail;
		$from_address = $this->config->mail->keiyaku_mail;

		// タイトル
		$subject =  "【meet-inサポート窓口】電子契約却下のお知らせ";
		// 本文
		$message  = '';
		$message .= "----------------------------------------------------------------- \r\n";
		$message .= "電子契約が却下されましたので、連絡いたします。 \r\n";
		$message .= "-----------------------------------------------------------------\r\n";
		$message .= "\r\n";
		$message .= "\r\n";
		$this->sendMailFromAdress($from_address, $adminMail, $email, null, $subject, $message);
	}



/**
	* 電子契約 証明書の申請のシステム管理者への連絡
	* @param unknown $staffDict
	*/
	public function sendCertificateRegistMail($form) {
		// 送信者メールアドレス
		$admin_mail = $this->config->mail->admin_mail;
		$from_address = $this->config->mail->keiyaku_mail;

		// タイトル
		$subject =  "【meet-inサポート窓口】電子契約証明書申請のお知らせ";
		// 本文
		$message  = '';
		$message .= "----------------------------------------------------------------- \r\n";
		$message .= "電子契約証明書申請されましたので、連絡いたします。 \r\n";
		$message .= "-----------------------------------------------------------------\r\n";
		$message .= "名前：\r\n";
		$message .= $form['lastname'].$form['firstname']."\r\n";
		$message .= "\r\n";
		$message .= "フリガナ：\r\n";
		$message .= $form['lastnameReading'].$form['firstnameReading']."\r\n";
		$message .= "\r\n";
		$message .= "所属部署：\r\n";
		$message .= $form['department']."\r\n";
		$message .= "\r\n";
		$message .= "役職：\r\n";
		$message .= $form['title']."\r\n";
		$message .= "\r\n";
		$message .= "メールアドレス：\r\n";
		$message .= $form['email']."\r\n";
		$message .= "\r\n";
		$message .= "電話番号：\r\n";
		$message .= $form['phone']."\r\n";
		$message .= "\r\n";
		$message .= "郵便番号：\r\n";
		$message .= $form['postalCode']."\r\n";
		$message .= "\r\n";
		$message .= "所在地住所：\r\n";
		$message .= $form['address']."\r\n";
		$message .= "\r\n";
		$message .= "法人名：\r\n";
		$message .= $form['organizationName']."\r\n";
		$message .= "\r\n";
		$message .= "法人番号：\r\n";
		$message .= $form['corporationNumber']."\r\n";
		$message .= "\r\n";
		$message .= "屋号：\r\n";
		$message .= $form['businessName']."\r\n";
		$message .= "\r\n";
		$message .= "確認コード：\r\n";
		$message .= $form['onetimepass']."\r\n";
		$message .= "\r\n";
		$message .= "\r\n";
		$this->sendMail($from_address, 'ooshima@aidma-hd.jp', $admin_mail, $subject, $message);
	}


// 	//-------------------------------------------------------------------------

	/**
	 * 権限の数値から対応する文言を返す
	 * @param unknown $role
	 * @return string
	 */
	private function getRoleName($role){
		$role_name = '';
		if($role == self::ROLE_ADM){
			$role_name = '管理者';
		}
		if($role == self::ROLE_EMP){
			$role_name = '一般社員';
		}
		if($role == self::ROLE_PRT){
			$role_name = 'アルバイト';
		}
		return $role_name;
	}

	/**
	 * メールを送信する
	 * @param unknown $message
	 */
	private function sendMail($fromname, $sendto, $admin_mail, $subject, $message, $toLeader=null){

		mb_language("ja");
		mb_internal_encoding("ISO-2022-JP");

		$subject = mb_convert_encoding($subject, "ISO-2022-JP","UTF-8");
		$subject = mb_encode_mimeheader($subject,"ISO-2022-JP", "B", "\n");

		$fromname = mb_convert_encoding($fromname, "ISO-2022-JP","UTF-8");
		$fromname = mb_encode_mimeheader($fromname,"ISO-2022-JP");

		$message = mb_convert_encoding($message,"ISO-2022-JP","UTF-8");

		$from_name = '【meet-inサポート窓口】';
		$from_name = mb_convert_encoding($from_name, "ISO-2022-JP","UTF-8");
		$from_name = mb_encode_mimeheader($from_name,"ISO-2022-JP", "B", "\n");

		//ヘッダエンコード
		$header = '';
		$header .= "Content-Type: text/plain;charset=ISO-2022-JP\n";
		$header .= "Content-Transfer-Encoding: 7bit\n";
		$header .= "MIME-Version: 1.0\n";
		$header .= "X-Mailer:PHP/" . phpversion() . "\n";
		$header .= "From: ".$from_name."<support@meet-in.jp>\n";

		// 登録対象者へメールします
		if(false == is_null($sendto)){
			mail($sendto, $subject, $message, $header);
		}

		//管理者へメールします
		if(false ==is_null($admin_mail)){
			mail($admin_mail,$subject,$message, $header);
		}

		//代表者へメールします
		if(false ==is_null($toLeader)){
			mail($toLeader, $subject,$message, $header);
		}
	}

	/**
	 * メールを送信する
	 * @param unknown $message
	 */
	private function sendMailFromAdress($fromaddress, $fromname, $sendto, $admin_mail, $subject, $message, $toLeader=null){

		mb_language("ja");
		mb_internal_encoding("ISO-2022-JP");

		$subject = mb_convert_encoding($subject, "ISO-2022-JP","UTF-8");
		$subject = mb_encode_mimeheader($subject,"ISO-2022-JP", "B", "\n");

		$fromname = mb_convert_encoding($fromname, "ISO-2022-JP","UTF-8");
		$fromname = mb_encode_mimeheader($fromname,"ISO-2022-JP");

		$message = mb_convert_encoding($message,"ISO-2022-JP","UTF-8");

		$from_name = '【meet-inサポート窓口】';
		$from_name = mb_convert_encoding($from_name, "ISO-2022-JP","UTF-8");
		$from_name = mb_encode_mimeheader($from_name,"ISO-2022-JP", "B", "\n");

		//ヘッダエンコード
		$header = '';
		$header .= "Content-Type: text/plain;charset=ISO-2022-JP\n";
		$header .= "Content-Transfer-Encoding: 7bit\n";
		$header .= "MIME-Version: 1.0\n";
		$header .= "X-Mailer:PHP/" . phpversion() . "\n";
		$header .= "From: ".$from_name."<".$fromaddress.">\n";

		// 登録対象者へメールします
		if(false == is_null($sendto)){
			mail($sendto, $subject, $message, $header);
		}

		//管理者へメールします
		if(false ==is_null($admin_mail)){
			mail($admin_mail,$subject,$message, $header);
		}

		//代表者へメールします
		if(false ==is_null($toLeader)){
			mail($toLeader, $subject,$message, $header);
		}
	}

	/**
	 * 資料送付のアプローチ登録時にメール通知設定をしていた場合、メール通知設定に設定しているユーザーにメール送信する
	 * @param unknown $resultTelephone
	 * @param unknown $approachTarget
	 * @param unknown $sendDict
	 */
	public function sendNotifyMail($resultTelephone, $approachTarget, $sendDict){
		// DAOの宣言
		$mailNotifySettingDao = Application_CommonUtil::getInstance("dao", "MailNotifySettingDao", $this->db);
		$templateSendSituationDao = Application_CommonUtil::getInstance("dao", "TemplateSendSituationDao", $this->db);
		$templateSendMethodDao = Application_CommonUtil::getInstance("dao", "TemplateSendMethodDao", $this->db);
		$approachListDao = Application_CommonUtil::getInstance("dao", "ApproachListDao", $this->db);

		// 状況レベルを取得する
		$sendSituation = $templateSendSituationDao->getAppointSituationByPK($resultTelephone["client_id"], $sendDict["situation"]);
		// 資料送付方法を取得する
		$sendMethod = array("name"=>"");
		if(is_numeric($sendDict["method"])){
			$sendMethod = $templateSendMethodDao->getAppointSituationByPK($resultTelephone["client_id"], $sendDict["method"]);
		}
		// 日付のフォーマットを変換する
		$receptionDate = date('Y/m/d', strtotime($sendDict["reception_date"]));

		// 資料請求の種別により、件名を変更する
		$subject = "【meet-in報告メール】資料請求依頼のご連絡　受付日：{$receptionDate}";
		// 最新の資料送付ステータスを取得する
		$resultSendStatus2 = 2;		// 受付資料請求のステータスナンバー
		$resultSendStatus5 = 5;		// 本人資料請求のステータスナンバー
		if($resultTelephone["tel_status"] == $resultSendStatus2){
			$subject = "【meet-in報告メール】受付資料請求依頼のご連絡　受付日：{$receptionDate}";
		}elseif($resultTelephone["tel_status"] == $resultSendStatus5){
			$subject = "【meet-in報告メール】本人資料請求依頼のご連絡　受付日：{$receptionDate}";
		}

		// アプローチリスト名を取得する
		$condition = " client_id = {$resultTelephone["client_id"]} AND id = {$resultTelephone["approach_list_id"]} ";
		$approachList = $approachListDao->getApproachListRow($condition);
		// アプローチリストに紐付くサービス商品名の名称を取得する
		$service = $approachListDao->getApproachListRelationServiceName($resultTelephone["client_id"], $resultTelephone["approach_list_id"]);

		// メール送信先を取得する
		$condition = " a.notify_send = 1 ";
		$sendMailAddressList = $mailNotifySettingDao->getMailNotifySettingAndMailAddressByCondition($resultTelephone["client_id"], $resultTelephone["approach_list_id"], $condition);
		$sendMailAddressList[] = array('type'=>'ADMIN', 'staff_email'=>$this->config->mail->support_mail, 'staff_name'=>'管理者');
		foreach($sendMailAddressList as $sendMailAddress){
			// 送信先の名前を設定する（ただしCCは名前がないのでクライアント名のみとする）
			$target_name = $this->user["client_name"];
			if($sendMailAddress["type"] != "CC" && $sendMailAddress["type"] != "ADMIN"){
				$target_name .= "\n{$sendMailAddress["staff_name"]}様";
			}else{
				$target_name .= "様";
			}

			// 本文を作成する

			$body = "
{$target_name}

{$this->user['name']}が{$approachTarget['company_name']}の{$sendDict['responsible_staff_name']}様から
資料請求を取得いたしました。

【アプローチリスト】：{$approachList['name']}

【資料請求取得日】：{$receptionDate}

【送付方法】：{$sendMethod["name"]}

【宛先】：{$sendDict['address']}

【部署名】：{$sendDict['division_name']}

【ご担当者】：{$sendDict['responsible_staff_name']}様

 詳細のご確認をお願い致します。

■詳細
【企業名】：{$approachTarget['company_name']}

【代表者名】：{$approachTarget['company_representative_name']}

【設立年月】：{$approachTarget['company_establishment_date']}

【サービス/商品名】：{$serviceName}

【従業員数】：{$approachTarget['company_employee_count']}

【電話番号】：{$approachTarget['tel']}

【メールアドレス】：{$approachTarget['mail']}

【URL】：{$approachTarget['company_url']}

【住所】：{$approachTarget['address']}

【資料請求レベル】：{$sendSituation["name"]}

【備考】：{$sendDict['remarks']}

※情報はmeet-inでもご確認頂けます。

URL：https://meet-in.jp/
			";
			// メールを送信する
			$this->sendApproachMail($sendMailAddress["staff_email"], $subject, $body);
		}
	}

	/**
	 * アポイントのアプローチ登録時にメール通知設定をしていた場合、メール通知設定に設定しているユーザーにメール送信する
	 * @param unknown $resultTelephone
	 * @param unknown $approachTarget
	 * @param unknown $sendDict
	 */
	public function appointNotifyMail($resultTelephone, $approachTarget, $appointDict, $clientStaffId){
		// DAOの宣言
		$mailNotifySettingDao = Application_CommonUtil::getInstance("dao", "MailNotifySettingDao", $this->db);
		$templateAppointSituationDao = Application_CommonUtil::getInstance("dao", "TemplateAppointSituationDao", $this->db);
		$approachListDao = Application_CommonUtil::getInstance("dao", "ApproachListDao", $this->db);
		$appointDao = Application_CommonUtil::getInstance("dao", "AppointDao", $this->db);

		// 状況レベルを取得する
		$appointSituation = $templateAppointSituationDao->getAppointSituationByPK($resultTelephone["client_id"], $appointDict["situation"]);
		// 本文の一部を作成
		$content = array(
				'',
				'',
				"{$this->user["name"]}が{$approachTarget['company_name']}の{$appointDict['responsible_staff_name']}様から\nアポイントを取得しました。",
				"{{$appointDict['approach_target_name']}}様のアポイントメント内容が変更致しました。",
				"日程:{$appointDict['time']}、{$approachTarget['company_name']}様のご商談日程の確認の連絡が完了いたしました。\n当日はどうぞ宜しくお願いします。",
				"日程:{$appointDict['time']}、{$approachTarget['company_name']}様のアポイントメントがキャンセルになりました。\n\n詳細のご確認をお願い致します。"
		);
		$appoint_time = date('Y/m/d H:i', strtotime($appointDict['time']));
		// 件名を作成
		$subjectList = array(
				'',
				'',
				"【meet-in報告メール】アポイント取得のご連絡　訪問日：{$appoint_time}",
				"【meet-in報告メール】アポイントメント内容変更のご連絡　訪問日：{$appoint_time}",
				"【meet-in報告メール】{$approachTarget['company_name']}様　ご商談日程の確認完了のお知らせ：{$appoint_time}",
				"【meet-in報告メール】アポイントメントキャンセルのご連絡日程：{$appoint_time}"
		);
		$subject = $subjectList[$appointDict['mail_status']];
		// アプローチリスト名を取得する
		$condition = " client_id = {$resultTelephone["client_id"]} AND id = {$resultTelephone["approach_list_id"]} ";
		$approachList = $approachListDao->getApproachListRow($condition);
		// 「アポイント管理しない」の場合、サービス商品名を追加
		$serviceName = "";
		if(!is_numeric($appoint['client_staff_id'])){
			$service = $approachListDao->getApproachListRelationServiceName($resultTelephone["client_id"], $resultTelephone["approach_list_id"]);
			$serviceName = $service["service_name"];
		}
		// ステータスにより変化するメッセージを作成
		$statusDependentContents = "";
		if($appointDict['mail_status'] == "2" || $appointDict['mail_status'] == "3"){
			// 最初に登録した日時を取得する為に登録したアポ情報を取得する
			$appoint = $appointDao->getAppointRow($appointDict["id"], $resultTelephone["client_id"]);
			$appointDate = date('Y/m/d', strtotime($appoint['create_date']));
			$statusDependentContents .= "【アポイント取得日時】：{$appointDate}\n";
		}
		if($appointDict['mail_status'] == "2" || $appointDict['mail_status'] == "3" || $appointDict['mail_status'] == "4"){
			$statusDependentContents .= "【訪問予定日】：{$appoint_time}\n";
		}
		if($appointDict['mail_status'] == "5"){
			// 最初に登録した日時を取得する為に登録したアポ情報を取得する
			$appoint = $appointDao->getAppointRow($appointDict["id"], $resultTelephone["client_id"]);
			$appointDate = date('Y/m/d', strtotime($appoint['create_date']));
			$statusDependentContents .= "【キャンセルとなったアポイント】：{$appointDate}\n\n【アポイント詳細】：{$appointDict['memo']}\n";
		}
		// メモを表示するかしないかの設定
		$memoContents = "";
		if($appointDict['mail_status'] == "2" || $appointDict['mail_status'] == "3" || $appointDict['mail_status'] == "4"){
			$memoContents = "【アポイント詳細】：{$appointDict['memo']}\n";
		}

		// 性別の設定
		$gender = array(
				'0' => "-",
				'1' => "男性",
				'2' => "女性",
		);
		// メール送信先を取得する
		$condition = " a.notify_appoint = 1 ";
		$sendMailAddressList = $mailNotifySettingDao->getMailNotifySettingAndMailAddressByCondition($resultTelephone["client_id"], $resultTelephone["approach_list_id"], $condition);
		$sendMailAddressList[] = array('type'=>'ADMIN', 'staff_email'=>$this->config->mail->support_mail, 'staff_name'=>'管理者');
		foreach($sendMailAddressList as $sendMailAddress){
			// 送信先の名前を設定する（ただしCCは名前がないのでクライアント名のみとする）
			$target_name = $this->user["client_name"];
			if($sendMailAddress["type"] != "CC" && $sendMailAddress["type"] != "ADMIN"){
				if($sendMailAddress["type"] == "CE" && $sendMailAddress["id"] == $clientStaffId){
					// 訪問担当者の場合は本文を変更
					$target_name .= "\n訪問担当:{$sendMailAddress["staff_name"]}様";
				}else{
					$target_name .= "\n{$sendMailAddress["staff_name"]}様";
				}
			}else{
				$target_name .= "様";
			}

			$body = "
{$target_name}

{$content[$appointDict['mail_status']]}

【アプローチリスト】：{$approachList['name']}

{$statusDependentContents}
【訪問先名】：{$approachTarget['company_name']}

【部署名】：{$appointDict['clerk_department']}

【ご担当者】：{$appointDict['responsible_staff_name']}様

【性別】：{$gender[$appointDict['gender']]}

詳細のご確認をお願い致します。

■詳細
【企業名】：{$approachTarget['company_name']}

【代表者名】：{$approachTarget['company_representative_name']}

【設立年月】：{$approachTarget['company_establishment_date']}

【サービス/商品名】：{$serviceName}

【従業員数】：{$approachTarget['company_employee_count']}

【電話番号】：{$approachTarget['tel']}

【メールアドレス】：{$approachTarget['mail']}

【URL】：{$approachTarget['company_url']}

【住所】：{$approachTarget['address']}

【アポイントレベル】：{$appointSituation["name"]}

{$memoContents}
【アポイント所感】：
{$appointDict['description']}

URL：https://meet-in.jp/
			";
			// メールを送信する
			$this->sendApproachMail($sendMailAddress["staff_email"], $subject, $body);
		}
	}
	/**
	 * メールを送信する
	 * @param unknown $message
	 */
	public function sendApproachMail($sendto, $subject, $message){

		mb_language("ja");
		mb_internal_encoding("ISO-2022-JP");

		$subject = mb_convert_encoding($subject, "ISO-2022-JP","UTF-8");
		$subject = mb_encode_mimeheader($subject,"ISO-2022-JP");
		$message = mb_convert_encoding($message,"ISO-2022-JP","UTF-8");

		$from_name = '【meet-in報告メール】';
		$from_name = mb_convert_encoding($from_name, "ISO-2022-JP","UTF-8");
		$from_name = mb_encode_mimeheader($from_name,"ISO-2022-JP");

		//ヘッダエンコード
		$header = '';
		$header .= "Content-Type: text/plain;charset=ISO-2022-JP\r\n";
		$header .= "Content-Transfer-Encoding: 7bit\r\n";
		$header .= "MIME-Version: 1.0\r\n";
		$header .= "X-Mailer:PHP/" . phpversion() . "\r\n";
		$header .= "From: ".$from_name."<{$this->config->mail->support_mail}>\n";

		// 対象者へメールします
		if(false == is_null($sendto)){
			mail($sendto, $subject, $message, $header);
		}
	}

	/**
	 * メールを送信する
	 * @param unknown $message
	 */
	public function sendActivationMail($staffDict, $econtractFlg=false) {

		$admin_mail = $this->config->mail->admin_mail;
		$fromname = $admin_mail;
		// MEMO. メールに添付する認証用URL を e-contract-api/activate OR index/activate 切り替える.
		$pass = $econtractFlg ? "/e-contract-api/" : "/index/";
		$email = $econtractFlg ? $staffDict['email'] : $staffDict['staff_email'];

		$subject =  "【meet-inサポート窓口】アカウントパスワードリマインダのお知らせ";

		$message  = '';
		$message .= "----------------------------------------------------------------- \r\n";
		$message .= "アカウントのパスワードリマインダー処理を行います。 \r\n";
		$message .= "登録されたメールアドレスにURLお送りします。 \r\n";
		$message .= "-----------------------------------------------------------------\r\n";
		$message .= "▼アカウント登録情報▼\r\n";
		$message .= "\r\n";
		$message .= "認証用URL：\r\n";
		$message .= "https://".$_SERVER["HTTP_HOST"]. $pass ."activate?id=".$staffDict["activation_code"]."\r\n";
		$message .= "\r\nURLは1日だけ有効です\r\n";

		// メール送信処理
		$this->sendMail($fromname, $email, $admin_mail, $subject, $message);
	}
	/**
	 * メールを送信する
	 * @param unknown $message
	 */
	public function sendEnterFreeRoomMail($mailAddress) {

		$fromname = $mailAddress;
		$url = "https://" . $_SERVER["HTTP_HOST"] . $_SERVER["REQUEST_URI"];
		$enterRoomDate = date("Y/m/d H:i");

		$subject =  "フリールーム入室通知";

		$message  = '';
		$message .= "{$url} ルームへお客様が入室されました。 \r\n";
		$message .= "日時：{$enterRoomDate} \r\n";

		// メール送信処理
		$this->sendApproachMail($mailAddress, $subject, $message);
	}

	/**
	 * セミナーへ参加者申請のメール件名取得
	 */
	public function getSendWebinarParticipantSubject(){
		return "ウェビナー参加申込完了";
	}
	/**
	 * セミナーへ参加者申請のメール本文取得
	 */
	public function getSendWebinarParticipantBody($webinarParticipant, $webinar){
		// キャンセルのURLドメイン
		$commonUrl = (empty($_SERVER['HTTPS']) ? 'http://' : 'https://').$_SERVER['HTTP_HOST'];
		// 終了時間を計算する
		$endingTime = date('Y-m-d H:i:s', strtotime($webinar["holding_date"]."+{$webinar["holding_time"]} minute"));
		// 本文を作成する
		$message  = '';
		$message .= "{$webinarParticipant["name"]}様\r\n";
		$message .= "\r\n";
		$message .= "この度は誠にありがとうございます。\r\n";
		$message .= "ウェビナーへの参加予約を受け付けました。\r\n";
		$message .= "お客様の予約番号は下記になります。\r\n";
		$message .= "\r\n";
		$message .= "■予約番号\r\n";
		$message .= "{$webinarParticipant["reservation_number"]}\r\n";
		$message .= "\r\n";
		$message .= "■ウェビナー情報\r\n";
		$message .= "・ウェビナータイトル：{$webinar["name"]}\r\n";
		$message .= "・定員：{$webinar["max_participant_count"]}名\r\n";
		$message .= "・開始予定日時：{$webinar["holding_date"]}\r\n";
		$message .= "・終了予定日時：{$endingTime}\r\n";
		$message .= "\r\n";
		$message .= "■参加方法\r\n";
		$message .= "当日の開始10分前になりましたら、次の「入場URL」からウェビナー会場に入場ください。\r\n";
		$message .= "入場URL\r\n";
		$message .= "{$commonUrl}/api/webi-room/{$webinar["room_name"]}\r\n";
		$message .= "\r\n";
		$message .= "■ご参加までの流れ：\r\n";
		$message .= "(1)上記の入場用URLをクリックしてください。開始10分前から会場に入場することができます。\r\n";
		$message .= "(2)マイクとカメラの設定を促すモーダルが表示されますので、設定を許可してください。\r\n";
		$message .= "(3)設定後、会場内でウェビナーが始まるまでお待ちください。\r\n";
		$message .= "\r\n";
		/*
		$message .= "下記に写真付きの詳細マニュアルを記載しております。\r\n";
		$message .= "{ウェビナーヘルプページURL}\r\n";
		$message .= "\r\n";
		*/
		$message .= "■キャンセル方法\r\n";
		$message .= "ウェビナー参加をキャンセルされる場合、次のURLから「キャンセル」をクリックして下さい。\r\n";
		$message .= "{$commonUrl}/api/webi-cxl/{$webinar["announce_key"]}\r\n";
		$message .= "\r\n";
		$message .= "【注意事項】\r\n";
		$message .= "必ず下記の対応ブラウザにて入場してください。\r\n";
		$message .= "PC：Chrome、Safari  Edge\r\n";
		$message .= "スマートフォン(iOS)：safari\r\n";
		$message .= "スマートフォン(Android)：Chrome \r\n";
		$message .= "\r\n";
		$message .= "以上、ご不明点がございましたら下記webページ内の「お問い合わせ」よりお手数ですがご連絡下さい。\r\n";
		$message .= "{$commonUrl}/api/webi-desc/{$webinar["announce_key"]}\r\n";
		$message .= "\r\n";
		$message .= "※本メールは送信専用メールアドレスから配信されています。\r\n";
		$message .= "ご返信いただいてもお返事できませんのでご了承ください。\r\n";
		$message .= "\r\n";
		$message .= "------------------------------------------------------------------\r\n";
		$message .= "このメールに身に覚えがない場合や、上記内容に間違いがある場合、\r\n";
		$message .= "ご不明な点がありましたら下記までご連絡ください。\r\n";
		$message .= "------------------------------------------------------------------\r\n";
		$message .= "■運営会社 株式会社meet in \r\n";
		$message .= "https://meet-in.jp/\r\n";
		$message .= "サポートデスク\r\n";
		$message .= "◆お電話でのお問い合わせ ：0120-979-542\r\n";
		$message .= "◆メールでのお問い合わせ ： info@meet-in.jp\r\n";
		$message .= "※(電話受付時間 ： 土日祝日を除く 平日10:00～18:00)\r\n";
		$message .= "------------------------------------------------------------------\r\n";
		return $message;
	}
	/**
	 * セミナーへ参加者申請があった場合のメールを送信する
	 * ※参加申請メールのタイトルが変更された場合は、必ず「最新メール送信タイトル」を変更すること
	 * @param unknown $message
	 */
	public function sendWebinarParticipant($webinarParticipant, $webinar) {
		$admin_mail = $this->config->mail->admin_mail;
		$fromname = $admin_mail;

		// 件名を取得する
		$subject =  $this->getSendWebinarParticipantSubject();
		// 本文を取得する
		$message = $this->getSendWebinarParticipantBody($webinarParticipant, $webinar);
		// メール送信処理(最後の引数に主催者メール)
		$res = $this->webinarSendMail($fromname, $webinarParticipant["mail_address"], null, $subject, $message, $webinar["mail_address"]);
		// 戻り値を返す
		return $res;
	}

	/**
	 * メール送信モーダルからのメール送信処理
	 * @param array $form
	 */
	public function sendWebinarFreeMail($form, $appendedFileList){
		// HTML/TEXT 切り替え
		if($form["mail_type"] == 2) {
			$textType = "html";
		} else {
			$textType = "plain";
		}
		// 件名との半角カナを全角カナに変換する
		$subject = mb_convert_kana($form["mail_subject"], "KV", "UTF-8");
		//日本語の使用宣言
		mb_language("ja");
		mb_internal_encoding("UTF-8");
		// 送信元の設定
		$sender_email = $form["sender_address"];
		$org = $sender_email;
		$from = $form["sender_name"];
		$from = mb_convert_encoding($from, "ISO-2022-JP","UTF-8");
		$from = mb_encode_mimeheader($from,"ISO-2022-JP");
		// ヘッダー設定
		$header = '';
		$header .= "Content-Type: multipart/mixed;boundary=\"__BOUNDARY__\"\n";
		$header .= "Return-Path: " . $org . " \n";
		$header .= "From: " . $from ."<{$sender_email}>\n";
		$header .= "Sender: " . $sender_email ." \n";
		$header .= "Reply-To: " . $org . " \n";
		$header .= "X-Sender: " . $sender_email . " \r\n";
		$header .= "X-Priority: 3 \n";
		// 本文を設定
		$body = "--__BOUNDARY__\n";
		$body .= "Content-Type: text/{$textType}; charset=\"ISO-2022-JP\"\n\n";
		$body .= $form["send_mail_body"] . "\n\n";
		$body .= "--__BOUNDARY__\n";

		// 添付ファイルが存在すれば追加する
		foreach($appendedFileList as $appendedFile){
			$fileName = mb_encode_mimeheader($appendedFile['fileName'], "UTF-8");
			$body .= "Content-Type: application/octet-stream; name=\"{$fileName}\"\n";
			$body .= "Content-Disposition: attachment; filename=\"{$fileName}\"\n";
			$body .= "Content-Transfer-Encoding: base64\n";
			$body .= "\n";
			$body .= chunk_split(base64_encode(file_get_contents($appendedFile["uploadFilePath"])));
			$body .= "--__BOUNDARY__\n";
		}
		// メール送信
		$res = mb_send_mail($form["destination_address"], $subject, $body, $header);
		// 戻り値を返す
		return $res;
	}


	/**
	 * ウェビナーキャンセルメールの件名を取得
	 */
	public function getSendCancelWebinarMailSubject($webinaeName){
		return "【開催中止のお知らせ】{$webinaeName}";
	}
	/**
	 * ウェビナーキャンセルの際に、既に参加申請していた人にメールを送信する。
	 * 必ず「最新メール送信タイトル」を変更すること
	 * @param unknown $message
	 */
	public function sendCancelWebinarMail($webinar, $webinarParticipant) {

		$admin_mail = $this->config->mail->admin_mail;
		$fromname = $admin_mail;
		// 終了時間を計算する
		$endingTime = date('Y-m-d H:i:s', strtotime($webinar["holding_date"]."+{$webinar["holding_time"]} minute"));
		// 件名を取得する
		$subject =  $this->getSendCancelWebinarMailSubject($webinar["name"]);
		// 本文を作成する
		$message  = '';
		$message .= "{$webinarParticipant["name"]} 様\r\n";
		$message .= "\r\n";
		$message .= "お世話になっております。\r\n";
		$message .= "下記ウェビナーが開催中止となりましたことをご連絡いたします。\r\n";
		$message .= "\r\n";
		$message .= "■予約番号\r\n";
		$message .= "{$webinarParticipant["reservation_number"]}\r\n";
		$message .= "\r\n";
		$message .= "■ウェビナーの情報\r\n";
		$message .= "・ウェビナータイトル：{$webinar["name"]}\r\n";
		$message .= "・定員：{$webinar["max_participant_count"]}名\r\n";
		$message .= "・開始予定日時：{$webinar["holding_date"]}\r\n";
		$message .= "・終了予定日時：{$endingTime}\r\n";
		$message .= "\r\n";
		$message .= "せっかくのお申込みに対し、このようなご連絡となってしまい大変申し訳ございません。\r\n";
		$message .= "なにとぞご理解とご了承を賜りますようお願い申し上げます。\r\n";
		$message .= "\r\n";
		$message .= "※本メールは送信専用メールアドレスから配信されています。\r\n";
		$message .= "ご返信いただいてもお返事できませんのでご了承ください。\r\n";
		$message .= "\r\n";
		$message .= "------------------------------------------------------------------\r\n";
		$message .= "このメールに身に覚えがない場合や、上記内容に間違いがある場合、\r\n";
		$message .= "ご不明な点がありましたら下記までご連絡ください。\r\n";
		$message .= "------------------------------------------------------------------\r\n";
		$message .= "■運営会社 株式会社meet in \r\n";
		$message .= "https://meet-in.jp/\r\n";
		$message .= "サポートデスク\r\n";
		$message .= "◆お電話でのお問い合わせ ：0120-979-542\r\n";
		$message .= "◆メールでのお問い合わせ ： info@meet-in.jp\r\n";
		$message .= "※(電話受付時間 ： 土日祝日を除く 平日10:00～18:00)\r\n";
		$message .= "------------------------------------------------------------------\r\n";
		// メール送信処理(主催者には１通のみ送信する)
		$res = $this->webinarSendMail($fromname, $webinarParticipant["mail_address"], null, $subject, $message, null);
		// 戻り値を返す
		return $res;
	}

	/**
	 * ウェビナー参加キャンセルメールの件名を取得
	 */
	public function getSendCancelParticipantMailSubject($webinarName){
		return "【キャンセル受付完了】{$webinarName}";
	}
	/**
	 * ウェビナー参加キャンセルメールの本文を取得
	 */
	public function getSendCancelParticipantMailBody($webinar, $webinarParticipant){
		// 終了時間を計算する
		$endingTime = date('Y-m-d H:i:s', strtotime($webinar["holding_date"]."+{$webinar["holding_time"]} minute"));
		// 本文を作成
		$message = "";
		$message .= "{$webinarParticipant["name"]} 様\r\n";
		$message .= "\r\n";
		$message .= "お世話になっております。\r\n";
		$message .= "下記ウェビナーにキャンセルを承りました。\r\n";
		$message .= "\r\n";
		$message .= "■予約番号\r\n";
		$message .= "{$webinarParticipant["reservation_number"]}\r\n";
		$message .= "\r\n";
		$message .= "■ウェビナーの情報\r\n";
		$message .= "・ウェビナータイトル：{$webinar["name"]}\r\n";
		$message .= "・定員：{$webinar["max_participant_count"]}名\r\n";
		$message .= "・開始予定日時：{$webinar["holding_date"]}\r\n";
		$message .= "・終了予定日時：{$endingTime}\r\n";
		$message .= "\r\n";
		$message .= "また機会がございましたら、お申し込みいただけますと幸いです。\r\n";
		$message .= "\r\n";
		$message .= "※本メールは送信専用メールアドレスから配信されています。\r\n";
		$message .= "ご返信いただいてもお返事できませんのでご了承ください。\r\n";
		$message .= "\r\n";
		$message .= "------------------------------------------------------------------\r\n";
		$message .= "このメールに身に覚えがない場合や、上記内容に間違いがある場合、\r\n";
		$message .= "ご不明な点がありましたら下記までご連絡ください。\r\n";
		$message .= "------------------------------------------------------------------\r\n";
		$message .= "■運営会社 株式会社meet in \r\n";
		$message .= "https://meet-in.jp/\r\n";
		$message .= "サポートデスク\r\n";
		$message .= "◆お電話でのお問い合わせ ：0120-979-542\r\n";
		$message .= "◆メールでのお問い合わせ ： info@meet-in.jp\r\n";
		$message .= "※(電話受付時間 ： 土日祝日を除く 平日10:00～18:00)\r\n";
		$message .= "------------------------------------------------------------------\r\n";
		return $message;
	}
	/**
	 * ウェビナー参加者のキャンセルの際にメールを送信する。
	 * @param unknown $message
	 */
	public function sendCancelParticipantMail($webinar, $webinarParticipant) {
		$admin_mail = $this->config->mail->admin_mail;
		$fromname = $admin_mail;
		// 件名を取得する
		$subject =  $this->getSendCancelParticipantMailSubject($webinar["name"]);
		// 本文を作成する
		$message = $this->getSendCancelParticipantMailBody($webinar, $webinarParticipant);
		// メール送信処理(最後の引数に主催者メール)
		$res = $this->webinarSendMail($fromname, $webinarParticipant["mail_address"], null, $subject, $message, $webinar["mail_address"]);
		// 戻り値を返す
		return $res;
	}

	/**
	 * ウェビナーお問い合わせメールの件名を取得
	 */
	public function getSendWebinarInquirySubject($webinarName){
		return "お問い合わせ／ウェビナー：{$webinarName}";
	}
	/**
	 * ウェビナーお問い合わせメールの本文を取得
	 */
	public function getSendWebinarInquiryBody($form, $webinar){
		// 詳細・予約画面のURLの共通部分
		$commonUrl = (empty($_SERVER['HTTPS']) ? 'http://' : 'https://').$_SERVER['HTTP_HOST'];
		// 本文を作成する
		$message  = '';
		$message .= "{$webinar["client_name"]}\r\n";
		$message .= "主催者様\r\n";
		$message .= "\r\n";
		$message .= "ウェビナー予約ページより、下記お問い合わせがありました。\r\n";
		$message .= "\r\n";
		$message .= "■ウェビナー情報\r\n";
		$message .= "ウェビナー名：{$webinar["name"]}\r\n";
		$message .= "■お問い合わせ内容\r\n";
		$message .= "お名前：{$form["webinarInquiryName"]}\r\n";
		$message .= "企業名：{$form["webinarInquiryCompanyName"]}\r\n";
		$message .= "電話番号：{$form["webinarInquiryTel"]}\r\n";
		$message .= "メールアドレス：{$form["webinarInquiryEmail"]}\r\n";
		$message .= "お問い合わせ内容：\r\n";
		$message .= "{$form["webinarInquiryContent"]}\r\n";
		$message .= "\r\n";
		$message .= "\r\n";
		$message .= "----------\r\n";
		$message .= "\r\n";
		$message .= "■該当ウェビナーに関する詳細は下記よりご確認頂けます。\r\n";
		$message .= "・詳細ページ\r\n";
		$message .= "{$commonUrl}/api/webi-desc/{$form["announceKey"]}\r\n";
		$message .= "・予約ページ\r\n";
		$message .= "{$commonUrl}/api/webinar-participant-form/{$form["announceKey"]}\r\n";
		$message .= "\r\n";
		$message .= "※本メールは送信専用メールアドレスから配信されています。\r\n";
		$message .= "ご返信いただいてもお返事できませんのでご了承ください。\r\n";
		$message .= "※お問い合わせいただいている内容に関するご返信は、\r\n";
		$message .= "お問い合わせ頂いた方の「メールアドレス」宛に各自ご返信をお願いいたします。\r\n";
		$message .= "\r\n";
		$message .= "------------------------------------------------------------------\r\n";
		$message .= "このメールに身に覚えがない場合や、上記内容に間違いがある場合、\r\n";
		$message .= "ご不明な点がありましたら下記までご連絡ください。\r\n";
		$message .= "------------------------------------------------------------------\r\n";
		$message .= "■運営会社 株式会社meet in \r\n";
		$message .= "https://meet-in.jp/\r\n";
		$message .= "■サポートデスク\r\n";
		$message .= "・お電話でのお問い合わせ ：0120-979-542\r\n";
		$message .= "・メールでのお問い合わせ ： info@meet-in.jp\r\n";
		$message .= "※(電話受付時間 ： 土日祝日を除く 平日10:00～18:00)\r\n";
		$message .= "------------------------------------------------------------------\r\n";
		$message .= "\r\n";
		return $message;
	}
	/**
	 * ウェビナーお問い合わせを送信する
	 */
	public function sendWebinarInquiry($form, $webinar){
		$admin_mail = $this->config->mail->admin_mail;
		$fromname = $admin_mail;
		// 件名を取得する
		$subject =  $this->getSendWebinarInquirySubject($webinar["name"]);
		// 本文を取得する
		$message = $this->getSendWebinarInquiryBody($form, $webinar);
		// メール送信処理(最後の引数に主催者メール)
		$res = $this->webinarSendMail($fromname, $webinar["mail_address"], null, $subject, $message, null);
		// 戻り値を返す
		return $res;
	}

	private function webinarSendMail($fromname, $sendto, $admin_mail, $subject, $message, $toLeader=null){

		mb_language("ja");
		mb_internal_encoding("ISO-2022-JP");

		$subject = mb_convert_encoding($subject, "ISO-2022-JP","UTF-8");
		$subject = mb_encode_mimeheader($subject,"ISO-2022-JP", "B", "\n");

		$fromname = mb_convert_encoding($fromname, "ISO-2022-JP","UTF-8");
		$fromname = mb_encode_mimeheader($fromname,"ISO-2022-JP");

		$message = mb_convert_encoding($message,"ISO-2022-JP","UTF-8");

		$from_name = '【Webinarサポート窓口】';
		$from_name = mb_convert_encoding($from_name, "ISO-2022-JP","UTF-8");
		$from_name = mb_encode_mimeheader($from_name,"ISO-2022-JP", "B", "\n");

		//ヘッダエンコード
		$header = '';
		$header .= "Content-Type: text/plain;charset=ISO-2022-JP\n";
		$header .= "Content-Transfer-Encoding: 7bit\n";
		$header .= "MIME-Version: 1.0\n";
		$header .= "X-Mailer:PHP/" . phpversion() . "\n";
		$header .= "From: ".$from_name."<support@meet-in.jp>\n";

		// 戻り値
		$result = false;

		// 登録対象者へメールします
		if(false == is_null($sendto)){
			$result = mail($sendto, $subject, $message, $header);
		}

		//管理者へメールします
		if(false ==is_null($admin_mail)){
			mail($admin_mail,$subject,$message, $header);
		}

		//代表者へメールします
		if(false ==is_null($toLeader)){
			mail($toLeader, $subject,$message, $header);
		}
		// 戻り値を返す
		return $result;
	}
}
