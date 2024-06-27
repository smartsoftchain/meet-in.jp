<?php
class WebinarParticipantBehaviorHistoryDao extends AbstractDao {

	// システムから送信されるメールの送信元メールアドレス
	const SYSTEM_SENDER_ADDRESS = "";
	// システムから送信されるメールの送信元名称
	const SYSTEM_SENDER_NAME = "system";
	
	private $db;
	function __construct($db){
		parent::init();
		$this->db = $db;
	}

	/**
	 * ウェビナー参加者のメールを送信しない行動履歴登録を行う
	 * メール送信がないので、「send_mail_flg」は0となる。
	 * @param array	$webinarParticipant		参加者の情報
	 * @param int	$behaviorStatus			行動履歴のステータス
	 */
	public function setWebinarParticipantBehaviorHistory($webinarParticipant, $behaviorStatus){
		// 登録するデータのみのdictを作成する
		$record = array(
			'webinar_id' 				=> $webinarParticipant["webinar_id"],
			'webinar_participant_id' 	=> $webinarParticipant["id"],
			'id'						=> new Zend_Db_Expr('webinar_participant_behavior_history_increment(webinar_id, webinar_participant_id)'),
			'client_id'					=> $webinarParticipant["client_id"], 
			'behavior_status' 			=> $behaviorStatus,
			'mail_subject' 				=> $webinarParticipant["latest_mail_subject"],
			'send_mail_flg'				=> 0, 
			'create_date' 				=> new Zend_Db_Expr('now()')
		);
		// 新規登録
		$this->db->insert('webinar_participant_behavior_history', $record);
	}

	/**
	 * ウェビナー参加者へシステムからのメール送信を伴う行動履歴登録を行う
	 * 予約、キャンセル、お問い合わせなど
	 * メール送信があるので、「send_mail_flg」は1となる。
	 * @param array	$webinarParticipant		参加者の情報
	 * @param int	$behaviorStatus			行動履歴のステータス
	 * @param string $destinationAddress	送信先メールアドレス
	 * @param string $subject				メールタイトル
	 * @param string $body					メール本文
	 */
	public function setWebinarParticipantBehaviorHistorySendSystemMail($webinarParticipant, $behaviorStatus, $destinationAddress, $subject, $body){
		// 登録するデータのみのdictを作成する
		$record = array(
			'webinar_id' 				=> $webinarParticipant["webinar_id"],
			'webinar_participant_id' 	=> $webinarParticipant["id"],
			'id'						=> new Zend_Db_Expr('webinar_participant_behavior_history_increment(webinar_id, webinar_participant_id)'),
			'client_id'					=> $webinarParticipant["client_id"], 
			'behavior_status' 			=> $behaviorStatus,
			'mail_subject' 				=> $subject,
			'send_mail_flg'				=> 1, 
			'destination_address' 		=> $destinationAddress,
			'sender_address' 			=> self::SYSTEM_SENDER_ADDRESS,
			'sender_name' 				=> self::SYSTEM_SENDER_NAME,
			'mail_body'					=> $body,
			'create_date' 				=> new Zend_Db_Expr('now()')
		);
		// 新規登録
		$this->db->insert('webinar_participant_behavior_history', $record);
	}

	/**
	 * ウェビナー参加者へメール送信機能からメール送信を伴う行動履歴登録を行う
	 * メール送信があるので、「send_mail_flg」は1となる。
	 * @param array	$webinarParticipant		参加者の情報
	 * @param int	$behaviorStatus			行動履歴のステータス
	 * @param array $form					画面で設定したデータ
	 * @param array $appendedFileList		添付資料情報
	 */
	public function setWebinarParticipantBehaviorHistorySendFreeMail($webinarParticipant, $behaviorStatus, $form, $appendedFileList){
		// 登録するデータのみのdictを作成する
		$record = array(
			'webinar_id' 				=> $webinarParticipant["webinar_id"],
			'webinar_participant_id' 	=> $webinarParticipant["id"],
			'id'						=> new Zend_Db_Expr('webinar_participant_behavior_history_increment(webinar_id, webinar_participant_id)'),
			'client_id'					=> $webinarParticipant["client_id"], 
			'behavior_status' 			=> $behaviorStatus,
			'mail_subject' 				=> $form["mail_subject"],
			'send_mail_flg'				=> 1, 
			'destination_address' 		=> $form["destination_address"],
			'sender_address' 			=> $form["sender_address"],
			'sender_name' 				=> $form["sender_name"],
			'mail_body'					=> $form["send_mail_body"],
			'create_date' 				=> new Zend_Db_Expr('now()')
		);
		// 即時メール送信の場合は送信予約は存在しない
		if(array_key_exists("sendDateTime", $form)){
			$record["send_mail_date"] = $form["sendDateTime"];
		}
		// 添付ファイル名とファイルパスの設定
		$count = 1;
		foreach($appendedFileList as $appendedFile){
			$record["attachment_file_name{$count}"] = $appendedFile["fileName"];
			$record["attachment_file_path{$count}"] = $appendedFile["uploadFilePath"];
			$count++;
		}
		// 新規登録
		$this->db->insert('webinar_participant_behavior_history', $record);
	}

	/**
	 * ウェビナー参加者の行動履歴の最大IDを取得する
	 * 使用用途は登録後直ぐにデータを取得し、IDを参照するため
	 * @param array	$webinarParticipant		参加者の情報
	 * @param int	$behaviorStatus			行動履歴のステータス
	 * @return id
	 */
	public function getBehaviorHistoryMaxIdByAllCondition($webinarParticipant, $behaviorStatus){
		// 登録したデータのIDを取得する
		$sql = "SELECT
					MAX(id) as id 
				FROM
					webinar_participant_behavior_history
				WHERE 
					webinar_id = {$webinarParticipant["webinar_id"]} AND 
					webinar_participant_id = {$webinarParticipant["id"]} AND 
					client_id = {$webinarParticipant["client_id"]} AND 
					behavior_status = {$behaviorStatus} AND 
					mail_subject = '{$webinarParticipant["latest_mail_subject"]}' AND 
					del_flg = 0;
		";
		$rtn = $this->db->fetchRow($sql, array());
		// 戻り値を返す
		return $rtn["id"];
	}

	/**
	 * ウェビナー参加者行動履歴一覧でフリーワード検索が存在した場合に検索条件を作成する
	 * 今までは、modelに検索条件作成処理を持たせていたが、カラム変更などを考慮し
	 * daoにその機能を持たせるように変更した。
	 * @param string	$freeWord	フリーワード
	 * @return string
	 */
	private function wpBehaviorHistoryListDisplayCondition($freeWord){
		// 戻り値の検索条件
		$condition = "";
		if($freeWord != ""){
			// フリーワードが入力されている場合
			$condition = " (
								`mail_subject` like '%{$freeWord}%' 
							) AND ";
		}
		// 戻り値を返す
		return $condition;
	}

	/**
	 * ウェビナー参加者の行動履歴一覧の取得条件を指定しカウントを取得する
	 * @param int		$webinarId				ウェビナーID
	 * @param int		$webinarParticipantid	ウェビナー参加者ID
	 * @param int		$clientId				クライアントID
	 * @param string	$freeWord				フリーワード検索条件
	 * @return int
	 */
	public function getBehaviorHistoryCount($webinarId, $webinarParticipantid, $clientId, $freeWord) {
		// フリーワードから検索条件を作成する
		$condition = $this->wpBehaviorHistoryListDisplayCondition($freeWord);
		// クエリ作成
		$sql = "SELECT
					count(id) as count
				FROM
					webinar_participant_behavior_history
				WHERE 
					webinar_id = {$webinarId} AND 
					webinar_participant_id = {$webinarParticipantid} AND 
					client_id = {$clientId} AND 
					{$condition}
					del_flg = 0;
				";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn["count"];
	}


	/**
	 * ウェビナー参加者の行動履歴一覧の取得条件を指定しリストを取得する
	 * @param int		$webinarId				ウェビナーID
	 * @param int		$webinarParticipantid	ウェビナー参加者ID
	 * @param int		$clientId				クライアントID
	 * @param string	$freeWord				フリーワード検索条件
	 * @param string	$order					並び替えのカラム
	 * @param string	$ordertype				昇順・降順
	 * @param int		$page					表示ページ
	 * @param int		$limit					表示件数
	 * @return array
	 */
	public function getBehaviorHistoryList($webinarId, $webinarParticipantid, $clientId, $freeWord, $order, $ordertype, $page, $limit) {
		// 何ページ目を表示するかの値を設定
		$offset = 0;
		$page = $page - 1;
		if($page > 0){
			$offset = $page * $limit;
		}
		// フリーワードから検索条件を作成する
		$condition = $this->wpBehaviorHistoryListDisplayCondition($freeWord);
		// クエリ作成
		$sql = "SELECT
					*
				FROM
					webinar_participant_behavior_history
				WHERE 
					webinar_id = {$webinarId} AND 
					webinar_participant_id = {$webinarParticipantid} AND 
					client_id = {$clientId} AND 
					{$condition}
					del_flg = 0 
				ORDER BY
					{$order} {$ordertype}
				LIMIT
					{$limit}
				OFFSET
					{$offset};
		";
		$rtn = $this->db->fetchAll($sql, array());
		return $rtn;
	}

	/**
	 * ウェビナー参加者の行動履歴を１件取得する
	 * @param int		$webinarId				ウェビナーID
	 * @param int		$webinarParticipantid	ウェビナー参加者ID
	 * @param int		$id						テーブル内のID
	 * @param int		$clientId				クライアントID
	 * @return array
	 */
	public function getBehaviorHistoryRow($webinarId, $webinarParticipantid, $id, $clientId) {
		// クエリ作成
		$sql = "SELECT
					*
				FROM
					webinar_participant_behavior_history
				WHERE 
					webinar_id = {$webinarId} AND 
					webinar_participant_id = {$webinarParticipantid} AND 
					id = {$id} AND 
					client_id = {$clientId} AND
					del_flg = 0;
		";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn;
	}
}
