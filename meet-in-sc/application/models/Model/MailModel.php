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

// 	Public  function newStaffMail($staff,$staff_password_before,$adm_mail){

// 		mb_language("ja");
// 		mb_internal_encoding("ISO-2022-JP");

// 		$fromname = "TMO管理者";
// 		$subject = "【TMO】アカウント登録情報のお知らせ";
// 		$message = " -----------------------------------------------------------------\n\n";
// 		$message .= "TEL Marketingに新規アカウントを登録しました。\n";
// 		$message .= "アカウント登録情報と自動生成したパスワードをお送りします。 \n\n";
// 		$message .= "-----------------------------------------------------------------\n\n";

// 		$content = "▼アカウント登録情報▼\n";
// 		$content .= "アカウントID：\n";
// 		$content .= "AA".str_pad($staff->staff_id,5,"0",STR_PAD_LEFT)."\n\n";

// 		$content .= "パスワード： \n";
// 		$content .= $staff_password_before." \n\n";

// 		$content .= "※パスワードは、アカウント管理者のみ変更することができます。\n";
// 		$content .= " 変更を希望される場合は、アカウント管理者までお問い合わせください。\n\n";

// 		$content .= "担当者名：\n";
// 		$content .= $staff->staff_name."\n\n";

// 		$content .= "担当者名(フリガナ)：\n";
// 		$content .= $staff->staff_firstnamepy." ".$staff->staff_lastnamepy."\n\n";

// 		$content .= "担当者メールアドレス： \n";
// 		$content .= $staff->staff_email."\n\n";

// 		$content .= "備考： \n";
// 		if($staff->staff_comment == ""){
// 			$content .= "未登録\n\n";
// 		}else{
// 			$content .= $staff->staff_comment."\n\n";
// 		}

// 		$content .= "-----------------------------------------------------------------\n";
// 		$content .= "TEL Marketing Optimization \n\n";

// 		$message .= $content;

// 		$subject = mb_convert_encoding($subject, "ISO-2022-JP","UTF-8");
// 		$subject = mb_encode_mimeheader($subject,"ISO-2022-JP");
// 		$fromname = mb_convert_encoding($fromname, "ISO-2022-JP","UTF-8");
// 		$fromname = mb_encode_mimeheader($fromname,"ISO-2022-JP");
// 		$message = mb_convert_encoding($message,"ISO-2022-JP","UTF-8");

// 		//ヘッダエンコード
// 		$header .= "Content-Type: text/plain;charset=ISO-2022-JP\r\n";
// 		$header .= "Content-Transfer-Encoding: 7bit\r\n";
// 		$header .= "MIME-Version: 1.0\r\n";
// 		$header .= "X-Mailer:PHP/" . phpversion() . "\r\n";
// 		$header .= "From: \"" . $fromname . "\" <" . $adm_mail . ">";

// 		//アカウントメールアドへ
// 		mail($staff->staff_email,$subject,$message,$header);
// 		//管理者へメールします
// 		$adm_subject = "【TMO】AA".str_pad($staff->staff_id,5,"0",STR_PAD_LEFT).": 登録完了通知";
// 		$adm_subject = mb_convert_encoding($adm_subject, "ISO-2022-JP","UTF-8");
// 		$adm_subject = mb_encode_mimeheader($adm_subject,"ISO-2022-JP");

// 		$adm_message = $content;
// 		$adm_message = mb_convert_encoding($adm_message,"ISO-2022-JP","UTF-8");

// 		mail($adm_mail,$adm_subject,$adm_message,$header);
// 	}

// 	Public function editStaffMail($staff,$staff_password_before,$adm_mail){

// 		mb_language("ja");
// 		mb_internal_encoding("ISO-2022-JP");

// 		$fromname = "TMO管理者";
// 		$subject = "【TMO】アカウント編集完了のお知らせ";
// 		$message = " -----------------------------------------------------------------\n\n";
// 		$message .= "TEL Marketing Optimization へのアカウント情報編集が完了しました。\n";
// 		$message .= "編集されたアカウント情報をお送りします。\n\n";
// 		$message .= "-----------------------------------------------------------------\n\n";

// 		$content = "▼アカウント登録情報▼\n";
// 		$content .= "アカウントID：\n";
// 		$content .= "AA".str_pad($staff->staff_id,5,"0",STR_PAD_LEFT)."\n\n";

// 		$content .= "パスワード： \n";
// 		$content .= $staff_password_before." \n\n";

// 		$content .= "※パスワードは、アカウント管理者のみ変更することができます。\n";
// 		$content .= " 変更を希望される場合は、アカウント管理者までお問い合わせください。\n\n";

// 		$content .= "担当者名：\n";
// 		$content .= $staff->staff_name."\n\n";

// 		$content .= "担当者名(フリガナ)：\n";
// 		$content .= $staff->staff_firstnamepy." ".$staff->staff_lastnamepy."\n\n";

// 		$content .= "担当者メールアドレス： \n";
// 		$content .= $staff->staff_email."\n\n";

// 		$content .= "備考： \n";
// 		if($staff->staff_comment == ""){
// 			$content .= "未登録\n\n";
// 		}else{
// 			$content .= $staff->staff_comment."\n\n";
// 		}

// 		$content .= "-----------------------------------------------------------------\n";
// 		$content .= "TEL Marketing Optimization \n\n";

// 		$message .= $content;

// 		$subject = mb_convert_encoding($subject, "ISO-2022-JP","UTF-8");
// 		$subject = mb_encode_mimeheader($subject,"ISO-2022-JP");
// 		$fromname = mb_convert_encoding($fromname, "ISO-2022-JP","UTF-8");
// 		$fromname = mb_encode_mimeheader($fromname,"ISO-2022-JP");
// 		$message = mb_convert_encoding($message,"ISO-2022-JP","UTF-8");

// 		//ヘッダエンコード
// 		$header .= "Content-Type: text/plain;charset=ISO-2022-JP\r\n";
// 		$header .= "Content-Transfer-Encoding: 7bit\r\n";
// 		$header .= "MIME-Version: 1.0\r\n";
// 		$header .= "X-Mailer:PHP/" . phpversion() . "\r\n";
// 		$header .= "From: \"" . $fromname . "\" <" . $adm_mail . ">";

// 		//アカウントメールアドへ
// 		mail($staff->staff_email,$subject,$message,$header);

// 		//管理者へメールします
// 		$adm_subject = "【TMO】AA".str_pad($staff->staff_id,5,"0",STR_PAD_LEFT).": 編集完了通知";
// 		$adm_subject = mb_convert_encoding($adm_subject, "ISO-2022-JP","UTF-8");
// 		$adm_subject = mb_encode_mimeheader($adm_subject,"ISO-2022-JP");

// 		$adm_message = $content;
// 		$adm_message = mb_convert_encoding($adm_message,"ISO-2022-JP","UTF-8");

// 		mail($adm_mail,$adm_subject,$adm_message,$header);

// 	}

// 	Public function newTeleworkerMail($staff,$staff_password_before,$adm_mail){

// 		mb_language("ja");
// 		mb_internal_encoding("ISO-2022-JP");

// 		$fromname = "TMO管理者";
// 		$subject = "【TMO】アカウント登録情報のお知らせ";
// 		$message = " -----------------------------------------------------------------\n\n";
// 		$message .= "TEL Marketingに新規アカウントを登録しました。\n";
// 		$message .= "アカウント登録情報と自動生成したパスワードをお送りします。 \n\n";
// 		$message .= "-----------------------------------------------------------------\n\n";

// 		$content = "▼アカウント登録情報▼\n";
// 		$content .= "アカウントID：\n";
// 		$content .= "TA".str_pad($staff->staff_id,5,"0",STR_PAD_LEFT)."\n\n";

// 		$content .= "パスワード： \n";
// 		$content .= $staff_password_before." \n\n";

// 		$content .= "※パスワードは、アカウント管理者のみ変更することができます。\n";
// 		$content .= " 変更を希望される場合は、アカウント管理者までお問い合わせください。\n\n";

// 		$content .= "担当者名：\n";
// 		$content .= $staff->staff_name."\n\n";

// 		$content .= "担当者名(フリガナ)：\n";
// 		$content .= $staff->staff_firstnamepy." ".$staff->staff_lastnamepy."\n\n";

// 		$content .= "担当者メールアドレス： \n";
// 		$content .= $staff->staff_email."\n\n";

// 		$content .= "備考： \n";
// 		if($staff->staff_comment == ""){
// 			$content .= "未登録\n\n";
// 		}else{
// 			$content .= $staff->staff_comment."\n\n";
// 		}

// 		$content .= "-----------------------------------------------------------------\n";
// 		$content .= "TEL Marketing Optimization \n\n";

// 		$message .= $content;

// 		$subject = mb_convert_encoding($subject, "ISO-2022-JP","UTF-8");
// 		$subject = mb_encode_mimeheader($subject,"ISO-2022-JP");
// 		$fromname = mb_convert_encoding($fromname, "ISO-2022-JP","UTF-8");
// 		$fromname = mb_encode_mimeheader($fromname,"ISO-2022-JP");
// 		$message = mb_convert_encoding($message,"ISO-2022-JP","UTF-8");

// 		//ヘッダエンコード
// 		$header .= "Content-Type: text/plain;charset=ISO-2022-JP\r\n";
// 		$header .= "Content-Transfer-Encoding: 7bit\r\n";
// 		$header .= "MIME-Version: 1.0\r\n";
// 		$header .= "X-Mailer:PHP/" . phpversion() . "\r\n";
// 		$header .= "From: \"" . $fromname . "\" <" . $adm_mail . ">";

// 		//アカウントメールアドへ
// 		mail($staff->staff_email,$subject,$message,$header);
// 		//管理者へメールします
// 		$adm_subject = "【TMO】TA".str_pad($staff->staff_id,5,"0",STR_PAD_LEFT).": 登録完了通知";
// 		$adm_subject = mb_convert_encoding($adm_subject, "ISO-2022-JP","UTF-8");
// 		$adm_subject = mb_encode_mimeheader($adm_subject,"ISO-2022-JP");

// 		$adm_message = $content;
// 		$adm_message = mb_convert_encoding($adm_message,"ISO-2022-JP","UTF-8");

// 		mail($adm_mail,$adm_subject,$adm_message,$header);
// 	}

// 	Public function editTeleworkerMail($staff,$staff_password_before,$adm_mail){

// 		mb_language("ja");
// 		mb_internal_encoding("ISO-2022-JP");

// 		$fromname = "TMO管理者";
// 		$subject = "【TMO】アカウント編集完了のお知らせ";
// 		$message = " -----------------------------------------------------------------\n\n";
// 		$message .= "TEL Marketing Optimization へのアカウント情報編集が完了しました。\n";
// 		$message .= "編集されたアカウント情報をお送りします。\n\n";
// 		$message .= "-----------------------------------------------------------------\n\n";

// 		$content = "▼アカウント登録情報▼\n";
// 		$content .= "アカウントID：\n";
// 		$content .= "TA".str_pad($staff->staff_id,5,"0",STR_PAD_LEFT)."\n\n";

// 		$content .= "パスワード： \n";
// 		$content .= $staff_password_before." \n\n";

// 		$content .= "※パスワードは、アカウント管理者のみ変更することができます。\n";
// 		$content .= " 変更を希望される場合は、アカウント管理者までお問い合わせください。\n\n";

// 		$content .= "担当者名：\n";
// 		$content .= $staff->staff_name."\n\n";

// 		$content .= "担当者名(フリガナ)：\n";
// 		$content .= $staff->staff_firstnamepy." ".$staff->staff_lastnamepy."\n\n";

// 		$content .= "担当者メールアドレス： \n";
// 		$content .= $staff->staff_email."\n\n";

// 		$content .= "備考： \n";
// 		if($staff->staff_comment == ""){
// 			$content .= "未登録\n\n";
// 		}else{
// 			$content .= $staff->staff_comment."\n\n";
// 		}

// 		$content .= "-----------------------------------------------------------------\n";
// 		$content .= "TEL Marketing Optimization \n\n";

// 		$message .= $content;

// 		$subject = mb_convert_encoding($subject, "ISO-2022-JP","UTF-8");
// 		$subject = mb_encode_mimeheader($subject,"ISO-2022-JP");
// 		$fromname = mb_convert_encoding($fromname, "ISO-2022-JP","UTF-8");
// 		$fromname = mb_encode_mimeheader($fromname,"ISO-2022-JP");
// 		$message = mb_convert_encoding($message,"ISO-2022-JP","UTF-8");

// 		//ヘッダエンコード
// 		$header .= "Content-Type: text/plain;charset=ISO-2022-JP\r\n";
// 		$header .= "Content-Transfer-Encoding: 7bit\r\n";
// 		$header .= "MIME-Version: 1.0\r\n";
// 		$header .= "X-Mailer:PHP/" . phpversion() . "\r\n";
// 		$header .= "From: \"" . $fromname . "\" <" . $adm_mail . ">";

// 		//アカウントメールアドへ
// 		mail($staff->staff_email,$subject,$message,$header);

// 		//管理者へメールします
// 		$adm_subject = "【TMO】TA".str_pad($staff->staff_id,5,"0",STR_PAD_LEFT).": 編集完了通知";
// 		$adm_subject = mb_convert_encoding($adm_subject, "ISO-2022-JP","UTF-8");
// 		$adm_subject = mb_encode_mimeheader($adm_subject,"ISO-2022-JP");

// 		$adm_message = $content;
// 		$adm_message = mb_convert_encoding($adm_message,"ISO-2022-JP","UTF-8");

// 		mail($adm_mail,$adm_subject,$adm_message,$header);

// 	}


// 	Public function newClientMail($client,$client_password_before,$adm_mail){

// 		mb_language("ja");
// 		mb_internal_encoding("ISO-2022-JP");

// 		$fromname = "TMO管理者";
// 		$subject = "【TMO】クライアント登録情報のお知らせ";
// 		$message = " -----------------------------------------------------------------\n\n";
// 		$message .= "TEL Marketing Optimization への新規クライアント登録が完了しました。\n";
// 		$message .= "クライアント登録情報と自動生成したパスワードをお送りします。\n\n";
// 		$message .= "-----------------------------------------------------------------\n\n";

// 		$content = "▼クライアント登録情報▼\n";

// 		$content .= "クライアントID：\n";
// 		$content .= "CA".str_pad($client->client_id,5,"0",STR_PAD_LEFT)."\n\n";

// 		$content .= "パスワード：\n";
// 		$content .= $client_password_before."\n\n";
// 		$content .= "※パスワードは、アカウント管理者のみ変更することができます。\n";
// 		$content .= "変更を希望される場合は、アカウント管理者までお問い合わせください。\n\n";

// 		$content .= "会社名：\n";
// 		$content .= $client->client_name."\n\n";

// 		$content .= "会社名(フリガナ)：\n";
// 		$content .= $client->client_namepy."\n\n";

// 		$content .= "会社住所：\n";
// 		$content .= $client->client_postcode1."-".$client->client_postcode2."\n".$client->client_address."\n\n";

// 		$content .= "会社電話番号：\n";
// 		$content .= $client->client_tel1."-".$client->client_tel2."-".$client->client_tel2."\n\n";

// 		$content .= "会社FAX番号：\n";
// 		if($client->client_fax1=="" && $client->client_fax2=="" && $client->client_fax3 ==""){
// 			$content .= "未登録\n\n";
// 		}else{
// 			$content .= $client->client_fax1."-".$client->client_fax2."-".$client->client_fax3."\n\n";
// 		}

// 		$content .= "HPアドレス：\n";
// 		if($client->client_homepage == ""){
// 			$content .= "未登録\n\n";
// 		}else{
// 			$content .= $client->client_homepage."\n\n";
// 		}
// 		$content .= "担当者名：\n";
// 		$content .= $client->client_staffleaderfirstname." ".$client->client_staffleaderlastname."\n\n";

// 		$content .= "担当者名（フリガナ）： \n";
// 		$content .= $client->client_staffleaderfirstnamepy." ".$client->client_staffleaderlastnamepy."\n\n";

// 		$content .= "担当者メールアドレス：\n";
// 		$content .= $client->client_staffleaderemail."\n\n";

// 		$content .= "備考：\n";
// 		if($client->client_comment == ""){
// 			$content .= "未登録\n\n";
// 		}else{
// 			$content .= $client->client_comment."\n\n";
// 		}

// 		$content .= "-----------------------------------------------------------------\n";
// 		$content .= "TEL Marketing Optimization \n\n";

// 		$message .= $content;

// 		$subject = mb_convert_encoding($subject, "ISO-2022-JP","UTF-8");
// 		$subject = mb_encode_mimeheader($subject,"ISO-2022-JP");
// 		$fromname = mb_convert_encoding($fromname, "ISO-2022-JP","UTF-8");
// 		$fromname = mb_encode_mimeheader($fromname,"ISO-2022-JP");
// 		$message = mb_convert_encoding($message,"ISO-2022-JP","UTF-8");

// 		//ヘッダエンコード
// 		$header .= "Content-Type: text/plain;charset=ISO-2022-JP\r\n";
// 		$header .= "Content-Transfer-Encoding: 7bit\r\n";
// 		$header .= "MIME-Version: 1.0\r\n";
// 		$header .= "X-Mailer:PHP/" . phpversion() . "\r\n";
// 		$header .= "From: \"" . $fromname . "\" <" . $adm_mail . ">";

// 		//アカウントメールアドへ
// 		mail($client->client_staffleaderemail,$subject,$message,$header);

// 		//管理者へメールします
// 		$adm_subject = "【TMO】CA".str_pad($client->client_id,5,"0",STR_PAD_LEFT).": 登録完了通知";
// 		$adm_subject = mb_convert_encoding($adm_subject, "ISO-2022-JP","UTF-8");
// 		$adm_subject = mb_encode_mimeheader($adm_subject,"ISO-2022-JP");

// 		$adm_message = $content;
// 		$adm_message = mb_convert_encoding($adm_message,"ISO-2022-JP","UTF-8");

// 		mail($adm_mail,$adm_subject,$adm_message,$header);
// 	}

// 	Public function editClientMail($staff,$client_password_before,$adm_mail){

// 		mb_language("ja");
// 		mb_internal_encoding("ISO-2022-JP");

// 		$fromname = "TMO管理者";
// 		$subject = "【TMO】アカウント編集完了のお知らせ";
// 		$message = " -----------------------------------------------------------------\n\n";
// 		$message .= "TEL Marketing Optimization へのアカウント情報編集が完了しました。\n";
// 		$message .= "編集されたアカウント情報をお送りします。\n\n";
// 		$message .= "-----------------------------------------------------------------\n\n";

// 		$content = "▼クライアント登録情報▼\n";

// 		$content .= "クライアントID：\n";
// 		$content .= "CA".str_pad($client->client_id,5,"0",STR_PAD_LEFT)."\n\n";

// 		$content .= "パスワード：\n";
// 		$content .= $client_password_before."\n\n";
// 		$content .= "※パスワードは、アカウント管理者のみ変更することができます。\n";
// 		$content .= "変更を希望される場合は、アカウント管理者までお問い合わせください。\n\n";

// 		$content .= "会社名：\n";
// 		$content .= $client->client_name."\n\n";

// 		$content .= "会社名(フリガナ)：\n";
// 		$content .= $client->client_namepy."\n\n";

// 		$content .= "会社住所：\n";
// 		$content .= $client->client_postcode1."-".$client->client_postcode2."\n".$client->client_address."\n\n";

// 		$content .= "会社電話番号：\n";
// 		$content .= $client->client_tel1."-".$client->client_tel2."-".$client->client_tel2."\n\n";

// 		$content .= "会社FAX番号：\n";
// 		if($client->client_fax1=="" && $client->client_fax2=="" && $client->client_fax3 ==""){
// 			$content .= "未登録\n\n";
// 		}else{
// 			$content .= $client->client_fax1."-".$client->client_fax2."-".$client->client_fax3."\n\n";
// 		}

// 		$content .= "HPアドレス：\n";
// 		if($client->client_homepage == ""){
// 			$content .= "未登録\n\n";
// 		}else{
// 			$content .= $client->client_homepage."\n\n";
// 		}

// 		$content .= "担当者名：\n";
// 		$content .= $client->client_staffleaderfirstname." ".$client->client_staffleaderlastname."\n\n";

// 		$content .= "担当者名（フリガナ）： \n";
// 		$content .= $client->client_staffleaderfirstnamepy." ".$client->client_staffleaderlastnamepy."\n\n";

// 		$content .= "担当者メールアドレス：\n";
// 		$content .= $client->client_staffleaderemail."\n\n";

// 		$content .= "備考：\n";
// 		if($client->client_comment == ""){
// 			$content .= "未登録\n\n";
// 		}else{
// 			$content .= $client->client_comment."\n\n";
// 		}

// 		$content .= "-----------------------------------------------------------------\n";
// 		$content .= "TEL Marketing Optimization \n\n";

// 		$message .= $content;

// 		$subject = mb_convert_encoding($subject, "ISO-2022-JP","UTF-8");
// 		$subject = mb_encode_mimeheader($subject,"ISO-2022-JP");
// 		$fromname = mb_convert_encoding($fromname, "ISO-2022-JP","UTF-8");
// 		$fromname = mb_encode_mimeheader($fromname,"ISO-2022-JP");
// 		$message = mb_convert_encoding($message,"ISO-2022-JP","UTF-8");

// 		//ヘッダエンコード
// 		$header .= "Content-Type: text/plain;charset=ISO-2022-JP\r\n";
// 		$header .= "Content-Transfer-Encoding: 7bit\r\n";
// 		$header .= "MIME-Version: 1.0\r\n";
// 		$header .= "X-Mailer:PHP/" . phpversion() . "\r\n";
// 		$header .= "From: \"" . $fromname . "\" <" . $adm_mail . ">";

// 		//アカウントメールアドへ
// 		mail($staff->staff_email,$subject,$message,$header);
// 		//管理者へメールします
// 		$adm_subject = "【TMO】CA".str_pad($client->client_id,5,"0",STR_PAD_LEFT).": 編集完了通知";
// 		$adm_subject = mb_convert_encoding($adm_subject, "ISO-2022-JP","UTF-8");
// 		$adm_subject = mb_encode_mimeheader($adm_subject,"ISO-2022-JP");

// 		$adm_message = $content;
// 		$adm_message = mb_convert_encoding($adm_message,"ISO-2022-JP","UTF-8");

// 		mail($adm_mail,$adm_subject,$adm_message,$header);
// 	}

// 	/**
// 	 * 週次報告コメント記述時のメール送信処理
// 	 * @param unknown $adm_mail
// 	 * @param unknown $client_id
// 	 */
// 	Public function createCommentMail($adm_mail, $client_id, $date1, $date2){

// 		// メイル送信者のアドレスを取得
// 		$manager_clientstaff = new ClientStaff();
// 		$clientStaffList = $manager_clientstaff->getClientStaffByClientId($client_id);
// 		$sendToList = array();
// 		foreach($clientStaffList as $clientStaff){
// 			$sendToList[] = $clientStaff->email;
// 		}
// 		$sendTo = join(",", $sendToList);

// 		// メール送信処理
// 		$mail = new MailSender();
// 		// ヘッダ情報のセット
// 		$mail->setTo($sendTo);
// 		$mail->setFrom($adm_mail);

// 		// 本文データの位置
// 		$body = '../mail_template/comment.txt';

// 		// 本文に差し込む配列の設定
// 		$manager_client = new Client();
// 		$client = $manager_client->getClient("client_id", $client_id);
// 		$body_param = Array();
// 		$body_param['client_name'] = $client->client_name;
// 		$body_param['from'] = $date1;
// 		$body_param['to'] = $date2;

// 		// 本文データ取得し、キーを差し込む
// 		$mail->setBody($body, $body_param);
// 		// 送信！
// 		$mail->send();

// 	}

// 	/**
// 	 * クライアントに担当者追加時のメール送信処理
// 	 * @param unknown $adm_mail
// 	 * @param unknown $client_id
// 	 */
// 	Public function createClientStaffMail($adm_mail, $client_id, $password_before , $seq){

// 		// メイル送信者のアドレスを取得
// 		$manager_client = new Client();
// 		$client = $manager_client->getClient("client_id", $client_id);
// 		$conditio = "seq = '" . $seq . "' AND " . "del_flg = 0";

// 		$manager_clientstaff = new ClientStaff();
// 		$clientStaff = $manager_clientstaff->getClientStaffByCondition($client_id, $conditio);
// 		if(!is_null($client) && !is_null($clientStaff)){
// 			// メール送信処理
// 			$mail = new MailSender();
// 			// ヘッダ情報のセット
// 			$mail->setTo($client->client_staffleaderemail);
// 			$mail->setFrom($adm_mail);

// 			// 本文データの位置
// 			$body = '../mail_template/createClientStaff.txt';

// 			// 本文に差し込む配列の設定
// 			$body_param = Array();
// 			$body_param['idchar'] = $clientStaff[0]->idchar;
// 			$body_param['password_before'] = $password_before;

// 			$body_param['client_stafffirstname'] = $clientStaff[0]->firstname . " " . $clientStaff[0]->lastname;
// 			$body_param['client_stafffirstnamepy'] = $clientStaff[0]->firstnamepy . " " . $clientStaff[0]->lastnamepy;
// 			$body_param['client_staffemail'] = $clientStaff[0]->email;

// 			// 本文データ取得し、キーを差し込む
// 			$mail->setBody($body, $body_param);
// 			// 送信！
// 			$mail->send();
// 		}
// 	}

// 	/**
// 	 * クライアントに担当者追加時のメール送信処理
// 	 * @param unknown $adm_mail
// 	 * @param unknown $client_id
// 	 */
// 	Public function editClientStaffMail($adm_mail, $client_id, $password_before , $seq){

// 		// メイル送信者のアドレスを取得
// 		$manager_client = new Client();
// 		$client = $manager_client->getClient("client_id", $client_id);
// 		$conditio = "seq = '" . $seq . "' AND " . "del_flg = 0";

// 		$manager_clientstaff = new ClientStaff();
// 		$clientStaff = $manager_clientstaff->getClientStaffByCondition($client_id, $conditio);
// 		if(!is_null($client) && !is_null($clientStaff)){
// 			// メール送信処理
// 			$mail = new MailSender();
// 			// ヘッダ情報のセット
// 			$mail->setTo($client->client_staffleaderemail);
// 			$mail->setFrom($adm_mail);

// 			// 本文データの位置
// 			$body = '../mail_template/editClientStaff.txt';

// 			// 本文に差し込む配列の設定
// 			$body_param = Array();
// 			$body_param['idchar'] = $clientStaff[0]->idchar;
// 			$body_param['password_before'] = $password_before;

// 			$body_param['client_stafffirstname'] = $clientStaff[0]->firstname . " " . $clientStaff[0]->lastname;
// 			$body_param['client_stafffirstnamepy'] = $clientStaff[0]->firstnamepy . " " . $clientStaff[0]->lastnamepy;
// 			$body_param['client_staffemail'] = $clientStaff[0]->email;

// 			// 本文データ取得し、キーを差し込む
// 			$mail->setBody($body, $body_param);
// 			// 送信！
// 			$mail->send();
// 		}
// 	}

// 	/**
// 	 * 資料送付ステータスが「担当者へ送付依頼」に設定された場合のメール送信処理
// 	 * @param unknown $adm_mail
// 	 * @param unknown $client_id
// 	 * @param unknown $project_id
// 	 */
// 	Public function sendDocumentMail($adm_mail, $client_id, $project_id, $consumer_name, $send_reception_date){

// 		// メイル送信者のアドレスを取得
// 		$manager_project = new Project();
// 		$project = $manager_project->getProject("project_id", $project_id);
// 		if(!is_null($project)){
// 			$clientStaffNameList = explode(",", $project->project_clientstaffname);
// 			foreach($clientStaffNameList as $clientStaffName){
// 				$conditions[] = " name = AES_ENCRYPT('{$clientStaffName}',@key) ";
// 			}
// 			$conditions = join("OR", $conditions);

// 			$manager_clientstaff = new ClientStaff();
// 			$clientStaffList = $manager_clientstaff->getClientStaffByCondition($client_id, $conditions);
// 			$sendToList = array();
// 			foreach($clientStaffList as $clientStaff){
// 				$sendToList[] = $clientStaff->email;
// 			}
// 			$sendTo = join(",", $sendToList);

// 			// メール送信処理
// 			$mail = new MailSender();
// 			// ヘッダ情報のセット
// 			$mail->setTo($sendTo);
// 			$mail->setFrom($adm_mail);

// 			// 本文データの位置
// 			$body = '../mail_template/sendDocument.txt';

// 			// 本文に差し込む配列の設定
// 			$body_param = Array();
// 			$body_param['date'] = $send_reception_date;
// 			$body_param['project_name'] = $project->project_name;
// 			$body_param['consumer_name'] = $consumer_name;

// 			// 本文データ取得し、キーを差し込む
// 			$mail->setBody($body, $body_param);
// 			// 送信！
// 			$mail->send();
// 		}
// 	}

// 	/**
// 	 * アイドマ担当者へアポイントの確認を促すメールを送る
// 	 * @param unknown $adm_mail
// 	 * @param unknown $client_id
// 	 * @param unknown $appoint_clientstaffname
// 	 */
// 	Public function appointCheckedMail($adm_mail, $client_id, $project_id, $appoint_clientstaffseq, $consumer_name, $result_projectheader, $result_clerkdepartment, $result_time_day, $result_time_hour, $result_time_min){

// 		// メイル送信者のアドレスを取得
// 		$manager_clientstaff = new ClientStaff();
// 		$conditions =  " seq = '". $appoint_clientstaffseq ."' ";
// 		$clientStaffList = $manager_clientstaff->getClientStaffByCondition($client_id, $conditions);

// 		$sendToList = array();
// 		foreach($clientStaffList as $clientStaff){
// 			$sendToList[] = $clientStaff->email;
// 		}
// 		$sendTo = join(",", $sendToList);

// 		// メール送信処理
// 		$mail = new MailSender();

// 		// ヘッダ情報のセット
// 		$mail->setTo($sendTo);
// 		$mail->setFrom($adm_mail);

// 		// 本文データの位置
// 		$body = '../mail_template/appointChecked.txt';

// 		// 本文に差し込む配列の設定
// 		$manager_project = new Project();
// 		$project = $manager_project->getProject("project_id", $project_id);
// 		$dateList = explode("/", $result_time_day);
// 		$date = $dateList[0]."年".$dateList[1]."月".$dateList[2]."日　".$result_time_hour."時".$result_time_min."分";
// 		$manager_clientstaff = new ClientStaff();
// 		$clientStaff = $manager_clientstaff->getClientStaff("seq", $appoint_clientstaffseq);

// 		$body_param = Array();
// 		$body_param['date'] = $date;
// 		$body_param['clientstaff_name'] = $clientStaff->name;
// 		$body_param['project_name'] = $project->project_name;
// 		$body_param['consumer_name'] = $consumer_name;
// 		$body_param['division_name'] = $result_clerkdepartment;
// 		$body_param['opponent_name'] = $result_projectheader;

// 		// 本文データ取得し、キーを差し込む
// 		$mail->setBody($body, $body_param);
// 		// 送信！
// 		$mail->send();
// 	}

// 	/**
// 	 * 担当者へアポイントの確認を促すメールを送る
// 	 * @param unknown $adm_mail
// 	 * @param unknown $client_id
// 	 * @param unknown $appoint_clientstaffname
// 	 */
// 	Public function appointReservationMail($adm_mail, $client_id, $project_id, $appoint_clientstaffseq, $consumer_name, $result_projectheader, $result_clerkdepartment, $result_time_day, $result_time_hour, $result_time_min){

// 		// メイル送信者のアドレスを取得
// 		$conditions =  " seq = '". $appoint_clientstaffseq ."' ";
// 		$clientStaffList = ClientStaffHelper::GetClientStaffByCondition($client_id, $conditions);
// 		$sendToList = array();
// 		foreach($clientStaffList as $clientStaff){
// 			$sendToList[] = $clientStaff->email;
// 		}
// 		$sendTo = join(",", $sendToList);

// 		// メール送信処理
// 		$mail = new MailSender();
// 		// ヘッダ情報のセット
// 		$mail->setTo($sendTo);
// 		$mail->setFrom($adm_mail);

// 		// 本文データの位置
// 		$body = '../mail_template/appointReservation.txt';

// 		// 本文に差し込む配列の設定
// 		$manager_client = new Client();
// 		$manager_project = new Project();
// 		$manager_clientstaff = new ClientStaff();
// 		$client = $manager_client->getClient("client_id", $client_id);
// 		$project = $manager_project->getProject("project_id", $project_id);
// 		$dateList = explode("/", $result_time_day);
// 		$date = $dateList[0]."年".$dateList[1]."月".$dateList[2]."日　".$result_time_hour."時".$result_time_min."分";
// 		$clientStaff = $manager_clientstaff->getClientStaff("seq", $appoint_clientstaffseq);

// 		$body_param = Array();
// 		$body_param['client_name'] = $client->client_name;
// 		$body_param['date'] = $date;
// 		$body_param['clientstaff_name'] = $clientStaff->name;
// 		$body_param['project_name'] = $project->project_name;
// 		$body_param['consumer_name'] = $consumer_name;
// 		$body_param['division_name'] = $result_clerkdepartment;
// 		$body_param['opponent_name'] = $result_projectheader;

// 		// 本文データ取得し、キーを差し込む
// 		$mail->setBody($body, $body_param);
// 		// 送信！
// 		$mail->send();
// 	}

// 	/**
// 	 * 二重チェック済：メール通知
// 	 * @param unknown $adm_mail
// 	 * @param unknown $client_id
// 	 * @param unknown $appoint_clientstaffname
// 	 */
// 	Public function appointDoubleCheckedMail($adm_mail, $client_id, $project_id, $appoint_clientstaffseq, $consumer_name, $result_projectheader, $result_clerkdepartment, $result_time_day, $result_time_hour, $result_time_min){

// 		// メイル送信者のアドレスを取得
// 		$manager_clientstaff = new ClientStaff();
// 		$conditions =  " seq = '". $appoint_clientstaffseq ."' ";
// 		$clientStaffList = $manager_clientstaff->getClientStaffByCondition($client_id, $conditions);

// 		$sendToList = array();
// 		foreach($clientStaffList as $clientStaff){
// 			$sendToList[] = $clientStaff->email;
// 		}
// 		$sendTo = join(",", $sendToList);

// 		// メール送信処理
// 		$mail = new MailSender();

// 		// ヘッダ情報のセット
// 		$mail->setTo($sendTo);
// 		$mail->setFrom($adm_mail);

// 		// 本文データの位置
// 		$body = '../mail_template/appointChecked.txt';

// 		// 本文に差し込む配列の設定
// 		$manager_project = new Project();
// 		$project = $manager_project->getProject("project_id", $project_id);
// 		$dateList = explode("/", $result_time_day);
// 		$date = $dateList[0]."年".$dateList[1]."月".$dateList[2]."日　".$result_time_hour."時".$result_time_min."分";
// 		$clientStaff = $manager_clientstaff->getClientStaff("seq", $appoint_clientstaffseq);

// 		$body_param = Array();
// 		$body_param['date'] = $date;
// 		$body_param['clientstaff_name'] = $clientStaff->name;
// 		$body_param['project_name'] = $project->project_name;
// 		$body_param['consumer_name'] = $consumer_name;
// 		$body_param['division_name'] = $result_clerkdepartment;
// 		$body_param['opponent_name'] = $result_projectheader;

// 		// 本文データ取得し、キーを差し込む
// 		$mail->setBody($body, $body_param);
// 		// 送信！
// 		$mail->send();
// 	}

// 	/**
// 	 * 予定変更：再メール
// 	 * @param unknown $adm_mail
// 	 * @param unknown $client_id
// 	 * @param unknown $appoint_clientstaffname
// 	 */
// 	Public function appointChangeScheduleMail($adm_mail, $client_id, $project_id, $appoint_clientstaffseq, $consumer_name, $result_projectheader, $result_clerkdepartment, $result_time_day, $result_time_hour, $result_time_min){

// 		// メイル送信者のアドレスを取得
// 		$manager_clientstaff = new ClientStaff();
// 		$conditions =  " seq = '". $appoint_clientstaffseq ."' ";
// 		$clientStaffList = $manager_clientstaff->getClientStaffByCondition($client_id, $conditions);
// 		$sendToList = array();
// 		foreach($clientStaffList as $clientStaff){
// 			$sendToList[] = $clientStaff->email;
// 		}
// 		$sendTo = join(",", $sendToList);

// 		// メール送信処理
// 		$mail = new MailSender();
// 		// ヘッダ情報のセット
// 		$mail->setTo($sendTo);
// 		$mail->setFrom($adm_mail);

// 		// 本文データの位置
// 		$body = '../mail_template/appointChangeSchedule.txt';

// 		// 本文に差し込む配列の設定
// 		$manager_client = new Client();
// 		$manager_project = new Project();
// 		$manager_clientstaff = new ClientStaff();
// 		$client = $manager_client->getClient("client_id", $client_id);
// 		$project = $manager_project->getProject("project_id", $project_id);
// 		$dateList = explode("/", $result_time_day);
// 		$date = $dateList[0]."年".$dateList[1]."月".$dateList[2]."日　".$result_time_hour."時".$result_time_min."分";
// 		$clientStaff = $manager_clientstaff->getClientStaff("seq", $appoint_clientstaffseq);

// 		$body_param = Array();
// 		$body_param['client_name'] = $client->client_name;
// 		$body_param['date'] = $date;
// 		$body_param['clientstaff_name'] = $clientStaff->name;
// 		$body_param['project_name'] = $project->project_name;
// 		$body_param['consumer_name'] = $consumer_name;
// 		$body_param['division_name'] = $result_clerkdepartment;
// 		$body_param['opponent_name'] = $result_projectheader;

// 		// 本文データ取得し、キーを差し込む
// 		$mail->setBody($body, $body_param);
// 		// 送信！
// 		$mail->send();
// 	}

// 	/**
// 	 * 訪問予定確認済：メール通知
// 	 * @param unknown $adm_mail
// 	 * @param unknown $client_id
// 	 * @param unknown $appoint_clientstaffname
// 	 */
// 	Public function appointVisitConfirmMail($adm_mail, $client_id, $project_id, $appoint_clientstaffseq, $consumer_name, $result_projectheader, $result_clerkdepartment, $result_time_day, $result_time_hour, $result_time_min){

// 		// メイル送信者のアドレスを取得
// 		$manager_clientstaff = new ClientStaff();
// 		$conditions =  " seq = '". $appoint_clientstaffseq ."' ";
// 		$clientStaffList = $manager_clientstaff->getClientStaffByCondition($client_id, $conditions);
// 		$sendToList = array();
// 		foreach($clientStaffList as $clientStaff){
// 			$sendToList[] = $clientStaff->email;
// 		}
// 		$sendTo = join(",", $sendToList);

// 		// メール送信処理
// 		$mail = new MailSender();
// 		// ヘッダ情報のセット
// 		$mail->setTo($sendTo);
// 		$mail->setFrom($adm_mail);

// 		// 本文データの位置
// 		$body = '../mail_template/appointReservation.txt';

// 		// 本文に差し込む配列の設定
// 		$manager_client = new Client();
// 		$manager_project = new Project();
// 		$client = $manager_client->getClient("client_id", $client_id);
// 		$project = $manager_project->getProject("project_id", $project_id);
// 		$dateList = explode("/", $result_time_day);
// 		$date = $dateList[0]."年".$dateList[1]."月".$dateList[2]."日　".$result_time_hour."時".$result_time_min."分";
// 		$clientStaff = $manager_clientstaff->getClientStaff("seq", $appoint_clientstaffseq);

// 		$body_param = Array();
// 		$body_param['client_name'] = $client->client_name;
// 		$body_param['date'] = $date;
// 		$body_param['clientstaff_name'] = $clientStaff->name;
// 		$body_param['project_name'] = $project->project_name;
// 		$body_param['consumer_name'] = $consumer_name;
// 		$body_param['division_name'] = $result_clerkdepartment;
// 		$body_param['opponent_name'] = $result_projectheader;

// 		// 本文データ取得し、キーを差し込む
// 		$mail->setBody($body, $body_param);
// 		// 送信！
// 		$mail->send();
// 	}

// 	/**
// 	 * アポイントキャンセル：メール通知
// 	 * @param unknown $adm_mail
// 	 * @param unknown $client_id
// 	 * @param unknown $appoint_clientstaffname
// 	 */
// 	Public function appointCancelMail($adm_mail, $client_id, $project_id, $appoint_clientstaffseq, $consumer_name, $result_projectheader, $result_clerkdepartment, $result_time_day, $result_time_hour, $result_time_min){

// 		// メイル送信者のアドレスを取得
// 		$manager_clientstaff = new ClientStaff();
// 		$conditions =  " seq = '". $appoint_clientstaffseq ."' ";
// 		$clientStaffList = $manager_clientstaff->getClientStaffByCondition($client_id, $conditions);
// 		$sendToList = array();
// 		foreach($clientStaffList as $clientStaff){
// 			$sendToList[] = $clientStaff->email;
// 		}
// 		$sendTo = join(",", $sendToList);

// 		// メール送信処理
// 		$mail = new MailSender();
// 		// ヘッダ情報のセット
// 		$mail->setTo($sendTo);
// 		$mail->setFrom($adm_mail);

// 		// 本文データの位置
// 		$body = '../mail_template/appointCancel.txt';

// 		// 本文に差し込む配列の設定
// 		$manager_client = new Client();
// 		$manager_project = new Project();
// 		$client = $manager_client->getClient("client_id", $client_id);
// 		$project = $manager_project->getProject("project_id", $project_id);
// 		$dateList = explode("/", $result_time_day);
// 		$date = $dateList[0]."年".$dateList[1]."月".$dateList[2]."日　".$result_time_hour."時".$result_time_min."分";
// 		$clientStaff = $manager_clientstaff->getClientStaff("seq", $appoint_clientstaffseq);

// 		$body_param = Array();
// 		$body_param['client_name'] = $client->client_name;
// 		$body_param['date'] = $date;
// 		$body_param['clientstaff_name'] = $clientStaff->name;
// 		$body_param['project_name'] = $project->project_name;
// 		$body_param['consumer_name'] = $consumer_name;
// 		$body_param['division_name'] = $result_clerkdepartment;
// 		$body_param['opponent_name'] = $result_projectheader;

// 		// 本文データ取得し、キーを差し込む
// 		$mail->setBody($body, $body_param);
// 		// 送信！
// 		$mail->send();
// 	}

// 	//------------------------------------------------------------------------------------------------//

	/**
	 * AAアカウントを新規・編集した場合のメール送信
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

		$subject =  "【Meetinサポート窓口】アカウント登録情報のお知らせ";

		$message  = '';
		$message .= "----------------------------------------------------------------- \r\n";
		$message .= "アカウント情報の". $action ."が完了しました。 \r\n";
		$message .= "登録されたアカウント情報をお送りします。 \r\n";
		$message .= "-----------------------------------------------------------------\r\n";
		$message .= "▼アカウント登録情報▼\r\n";
		$message .= "\r\n";
		$message .= "アカウントID：\r\n";
		$message .= "「AA" .str_pad($staffDict['staff_id'],5,"0",STR_PAD_LEFT). "」\r\n";
		$message .= "\r\n";
		$message .= "パスワード：\r\n";
		$message .= "「{$str_password}」　\r\n";
		$message .= "\r\n";
		$message .= "※パスワードは、プロフィール画面から変更が可能です。\r\n";
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

		$subject  = "【Meetinサポート窓口】会社情報登録のお知らせ";

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

		$subject =  "【Meetinサポート窓口】アカウント登録情報のお知らせ";

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
		$message .= "※パスワードは、プロフィール画面から変更が可能です。\r\n";
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

		$subject =  "【Meetintサポート窓口】アカウント登録情報のお知らせ";

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
		$message .= "※パスワードは、プロフィール画面から変更が可能です。\r\n";
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

		$subject =  "【Meetinサポート窓口】アカウント設定登録情報のお知らせ";

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
	private function  sendMail($fromname, $sendto, $admin_mail, $subject, $message, $toLeader=null){

		mb_language("ja");
		mb_internal_encoding("ISO-2022-JP");

		$subject = mb_convert_encoding($subject, "ISO-2022-JP","UTF-8");
		$subject = mb_encode_mimeheader($subject,"ISO-2022-JP", "B", "\n");

		$fromname = mb_convert_encoding($fromname, "ISO-2022-JP","UTF-8");
		$fromname = mb_encode_mimeheader($fromname,"ISO-2022-JP");

		$message = mb_convert_encoding($message,"ISO-2022-JP","UTF-8");

		$from_name = '【Meetinサポート窓口】';
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
		$subject = "【Meetin報告メール】資料請求依頼のご連絡　受付日：{$receptionDate}";
		// 最新の資料送付ステータスを取得する
		$resultSendStatus2 = 2;		// 受付資料請求のステータスナンバー
		$resultSendStatus5 = 5;		// 本人資料請求のステータスナンバー
		if($resultTelephone["tel_status"] == $resultSendStatus2){
			$subject = "【Meetin報告メール】受付資料請求依頼のご連絡　受付日：{$receptionDate}";
		}elseif($resultTelephone["tel_status"] == $resultSendStatus5){
			$subject = "【Meetin報告メール】本人資料請求依頼のご連絡　受付日：{$receptionDate}";
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

※情報はMeetinでもご確認頂けます。

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
				"【Meetin報告メール】アポイント取得のご連絡　訪問日：{$appoint_time}",
				"【Meetin報告メール】アポイントメント内容変更のご連絡　訪問日：{$appoint_time}",
				"【Meetin報告メール】{$approachTarget['company_name']}様　ご商談日程の確認完了のお知らせ：{$appoint_time}",
				"【Meetin報告メール】アポイントメントキャンセルのご連絡日程：{$appoint_time}"
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
	
		$from_name = '【Meetin報告メール】';
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
	public function sendActivationMail($staffDict) {

		$admin_mail = $this->config->mail->admin_mail;
		$fromname = $admin_mail;

		$subject =  "【Meetinサポート窓口】アカウントパスワードリマインダのお知らせ";

		$message  = '';
		$message .= "----------------------------------------------------------------- \r\n";
		$message .= "アカウントのパスワードリマインダー処理を行います。 \r\n";
		$message .= "登録されたメールアドレスにURLお送りします。 \r\n";
		$message .= "-----------------------------------------------------------------\r\n";
		$message .= "▼アカウント登録情報▼\r\n";
		$message .= "\r\n";
		$message .= "認証用URL：\r\n";
		$message .= "https://".$_SERVER["HTTP_HOST"]."/index/activate?id=".$staffDict["activation_code"]."\r\n";
		$message .= "\r\nURLは1日だけ有効です\r\n";

		// メール送信処理
		$this->sendMail($fromname, $staffDict['staff_email'], $admin_mail, $subject, $message);
	}
}