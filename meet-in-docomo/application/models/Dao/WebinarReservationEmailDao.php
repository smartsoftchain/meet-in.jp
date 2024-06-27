<?php
class WebinarReservationEmailDao extends AbstractDao {

	private $db;
	function __construct($db){
		parent::init();
		$this->db = $db;
	}

	/**
	 * メール送信予約登録を行う
	 * @param array	$form				参加者の入力した情報
	 * @param array	$mailTarget			参加者情報若しくはリード情報
	 * @param array	$appendedFileList	添付資料の実ファイル名とファイルパスのリスト
	 * @param array	$user				操作担当者情報
	 */
	public function setWebinarReservationEmail($form, $mailTarget, $appendedFileList, $user){
		// 登録するデータのみのdictを作成する
		$record = array(
			'reservation_key' 		=> $form["reservationKey"],
			'id'					=> new Zend_Db_Expr('webinar_reservation_email_increment(reservation_key)'), 
			'client_id' 			=> $mailTarget["client_id"],
			'send_mail_date' 		=> $form["sendDateTime"],
			'destination_address' 	=> $form["destination_address"],
			'sender_address' 		=> $form["sender_address"],
			'sender_name' 			=> $form["sender_name"],
			'subject'				=> $form["mail_subject"],
			'mail_body'				=> $form["send_mail_body"],
			'staff_type'			=> $user["staff_type"],
			'staff_id'				=> $user["staff_id"],
			'create_date' 			=> new Zend_Db_Expr('now()')
		);
		// 参加者とリードで登録項目が分岐する
		if(array_key_exists("webinar_id", $mailTarget)){
			// webinar_idが存在する場合は参加者のメール
			$record["webinar_id"] = $mailTarget["webinar_id"];
			$record["webinar_participant_id"] = $mailTarget["id"];
			$record["webinar_lead_id"] = new Zend_Db_Expr('null');
		}else{
			// webinar_idが存在しない場合はリードのメール
			$record["webinar_id"] = new Zend_Db_Expr('null');
			$record["webinar_participant_id"] = new Zend_Db_Expr('null');
			$record["webinar_lead_id"] = $mailTarget["id"];
		}
		// 添付ファイル名とファイルパスの設定
		$count = 1;
		foreach($appendedFileList as $appendedFile){
			$record["attachment_file_name{$count}"] = $appendedFile["fileName"];
			$record["attachment_file_path{$count}"] = $appendedFile["uploadFilePath"];
			$count++;
		}
		// 新規登録
		$this->db->insert('webinar_reservation_email', $record);
	}

}
