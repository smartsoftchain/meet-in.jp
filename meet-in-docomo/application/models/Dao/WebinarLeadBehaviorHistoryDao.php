<?php
class WebinarLeadBehaviorHistoryDao extends AbstractDao {

	private $db;
	function __construct($db){
		parent::init();
		$this->db = $db;
	}

	// システムから送信されるメールの送信元メールアドレス
	const SYSTEM_SENDER_ADDRESS = "";
	// システムから送信されるメールの送信元名称
	const SYSTEM_SENDER_NAME = "system";

	/**
	 * 参加者登録からのリードの行動履歴登録を行う
	 * メール送信があるので、「send_mail_flg」は1となる。
	 * @param array	$webinarParticipant		参加者の情報
	 * @param int	$behaviorStatus			行動履歴種別
	 * @param int	$registRoute			流入経路種別
	 * @param string $destinationAddres		メール送信先アドレス
	 * @param string $mailSubject			メール送信タイトル
	 * @param string $body					メール本文
	 */
	public function setWebinarLeadBehaviorHistoryFromParticipant($webinarLead, $behaviorStatus, $destinationAddress, $mailSubject, $body){
		// 登録するデータのみのdictを作成する
		$record = array(
			'webinar_lead_id'			=> $webinarLead["id"],
			'id'						=> new Zend_Db_Expr('webinar_lead_behavior_history_increment(webinar_lead_id)'),
			'client_id'					=> $webinarLead["client_id"], 
			'behavior_status' 			=> $behaviorStatus,
			'mail_subject' 				=> $mailSubject,
			'send_mail_flg'				=> 1, 
			'destination_address' 		=> $destinationAddress,
			'sender_address' 			=> self::SYSTEM_SENDER_ADDRESS,
			'sender_name' 				=> self::SYSTEM_SENDER_NAME,
			'mail_body'					=> $body,
			'webinar_id' 				=> $webinarLead["wp_webinar_id"],
			'webinar_participant_id'	=> $webinarLead["wp_id"],
			'wpbh_id' 					=> $webinarLead["wpbh_id"],
			'create_date' 				=> new Zend_Db_Expr('now()')
		);
		// 新規登録
		$this->db->insert('webinar_lead_behavior_history', $record);
	}
	/**
	 * リードの行動履歴登録を行う
	 * メール送信がないので、「send_mail_flg」は0となる。
	 * @param array	$webinarLead		リードの情報
	 * @param int	$webinarId			ウェビナーID
	 * @param int	$behaviorStatus		行動履歴種別
	 */
	public function setWebinarLeadBehaviorHistory($webinarLead, $webinarId, $behaviorStatus){
		// 登録するデータのみのdictを作成する
		$record = array(
			'webinar_lead_id'			=> $webinarLead["id"],
			'id'						=> new Zend_Db_Expr('webinar_lead_behavior_history_increment(webinar_lead_id)'),
			'client_id'					=> $webinarLead["client_id"], 
			'behavior_status' 			=> $behaviorStatus,
			'send_mail_flg'				=> 0, 
			'create_date' 				=> new Zend_Db_Expr('now()')
		);
		// 存在すれば登録する項目
		if(array_key_exists("latest_mail_subject", $webinarLead)){
			$record["mail_subject"] = $webinarLead["latest_mail_subject"];
		}
		if(!is_null($webinarId)){
			$record["webinar_id"] = $webinarId;
		}
		// 新規登録
		$this->db->insert('webinar_lead_behavior_history', $record);
	}

	/**
	 * リードへメール送信機能からメール送信を伴う行動履歴登録を行う
	 * メール送信があるので、「send_mail_flg」は1となる。
	 * @param array	$webinarLead			リードの情報
	 * @param int	$behaviorStatus			行動履歴種別
	 * @param array $form					画面で設定したデータ
	 * @param array $appendedFileList		添付資料情報
	 */
	public function setWebinarLeadBehaviorHistorySendFreeMail($webinarLead, $behaviorStatus, $form, $appendedFileList){
		// 登録するデータのみのdictを作成する
		$record = array(
			'webinar_lead_id'			=> $webinarLead["id"],
			'id'						=> new Zend_Db_Expr('webinar_lead_behavior_history_increment(webinar_lead_id)'),
			'client_id'					=> $webinarLead["client_id"], 
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
		$this->db->insert('webinar_lead_behavior_history', $record);
	}

	/**
	 * リードへシステムからのメール送信を伴う行動履歴登録を行う
	 * メール送信があるので、「send_mail_flg」は1となる。
	 * @param array	$webinarLead			リードの情報
	 * @param int	$behaviorStatus			行動履歴種別
	 * @param string $destinationAddress	送信先メールアドレス
	 * @param string $subject				メールタイトル
	 * @param string $body					メール本文
	 */
	public function setWebinarLeadBehaviorHistorySystemMail($webinarLead, $webinarId, $behaviorStatus, $destinationAddress, $subject, $body){
		// 登録するデータのみのdictを作成する
		$record = array(
			'webinar_lead_id'			=> $webinarLead["id"],
			'id'						=> new Zend_Db_Expr('webinar_lead_behavior_history_increment(webinar_lead_id)'),
			'client_id'					=> $webinarLead["client_id"], 
			'behavior_status' 			=> $behaviorStatus,
			'mail_subject' 				=> $subject,
			'send_mail_flg'				=> 1, 
			'destination_address' 		=> $destinationAddress,
			'sender_address' 			=> self::SYSTEM_SENDER_ADDRESS,
			'sender_name' 				=> self::SYSTEM_SENDER_NAME,
			'mail_body'					=> $body,
			'create_date' 				=> new Zend_Db_Expr('now()')
		);
		if(!is_null($webinarId)){
			$record["webinar_id"] = $webinarId;
		}
		// 新規登録
		$this->db->insert('webinar_lead_behavior_history', $record);
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
	 * ウェビナーリードの行動履歴一覧の取得条件を指定しカウントを取得する
	 * @param int		$webinarLeadId		リードID
	 * @param int		$clientId			クライアントID
	 * @param string	$freeWord			フリーワード検索条件
	 * @return int
	 */
	public function getBehaviorHistoryCount($webinarLeadId, $clientId, $freeWord) {
		// フリーワードから検索条件を作成する
		$condition = $this->wpBehaviorHistoryListDisplayCondition($freeWord);
		// クエリ作成
		$sql = "SELECT
					count(id) as count
				FROM
					webinar_lead_behavior_history
				WHERE 
					webinar_lead_id = {$webinarLeadId} AND 
					client_id = {$clientId} AND 
					{$condition}
					del_flg = 0;
				";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn["count"];
	}


	/**
	 * ウェビナーリードの行動履歴一覧の取得条件を指定しリストを取得する
	 *  @param int		$webinarLeadId		リードID
	 * @param int		$clientId			クライアントID
	 * @param string	$freeWord			フリーワード検索条件
	 * @param string	$order				並び替えのカラム
	 * @param string	$ordertype			昇順・降順
	 * @param int		$page				表示ページ
	 * @param int		$limit				表示件数
	 * @return array
	 */
	public function getBehaviorHistoryList($webinarLeadId, $clientId, $freeWord, $order, $ordertype, $page, $limit) {
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
					webinar_lead_behavior_history
				WHERE 
					webinar_lead_id = {$webinarLeadId} AND 
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
	 * 同じメールアドレスで行動履歴をまとめる
	 * @param int		$webinarLeadId		リードID
	 * @param string	$mailAddress		メールアドレス
	 * @return array
	 */
	public function collectBehaviorHistory($webinarLeadId, $clientId, $mailAddress){
		// 可読性を上げるために先に対象を取得する（と言いつつ、下にあるクエリがうまく動かなかったので、取り急ぎの実装）
		$sql = "
				SELECT 
					a.*
				FROM 
					webinar_lead_behavior_history as a 
				INNER JOIN 
					webinar_lead as b 
				ON 
					a.webinar_lead_id = b.id 
				WHERE 
					b.client_id = {$clientId} AND 
					b.mail_address = '{$mailAddress}' AND 
					b.del_flg = 0 AND 
					a.del_flg = 0
				ORDER BY 
					a.webinar_lead_id, a.id;
		";
		$webinarLeadBehaviorHistoryList = $this->db->fetchAll($sql, array());
		foreach($webinarLeadBehaviorHistoryList as $webinarLeadBehaviorHistory){
			$record = array(
				'webinar_lead_id'			=> $webinarLeadId,
				'id'						=> new Zend_Db_Expr('webinar_lead_behavior_history_increment(webinar_lead_id)'),
				'client_id'					=> $webinarLeadBehaviorHistory["client_id"], 
				'behavior_status' 			=> $webinarLeadBehaviorHistory["behavior_status"],
				'mail_subject' 				=> $webinarLeadBehaviorHistory["mail_subject"],
				'webinar_id' 				=> $webinarLeadBehaviorHistory["webinar_id"],
				'webinar_participant_id'	=> $webinarLeadBehaviorHistory["webinar_participant_id"],
				'wpbh_id' 					=> $webinarLeadBehaviorHistory["wpbh_id"],
				'create_date' 				=> $webinarLeadBehaviorHistory["create_date"]
			);
			// 新規登録
			$this->db->insert('webinar_lead_behavior_history', $record);
		}
		/*
			$sql = "
				INSERT INTO 
					webinar_lead_behavior_history
				(
					webinar_lead_id,
					id,
					client_id, 
					behavior_status,
					mail_subject,
					webinar_id,
					webinar_participant_id,
					wpbh_id,
					create_date
				)
				SELECT 
					{$webinarLeadId},
					webinar_lead_behavior_history_increment(webinar_lead_id),
					a.client_id, 
					a.behavior_status,
					a.mail_subject,
					a.webinar_id,
					a.webinar_participant_id,
					a.wpbh_id,
					a.create_date 
				FROM 
					webinar_lead_behavior_history as a 
				INNER JOIN 
					webinar_lead as b 
				ON 
					a.webinar_lead_id = b.id 
				WHERE 
					b.client_id = {$clientId} AND 
					b.mail_address = '{$mailAddress}' AND 
					b.del_flg = 0 AND 
					a.del_flg = 0
				ORDER BY 
					a.webinar_lead_id, a.id;
			";
			$this->db->query($sql);
		*/
	}

	/**
	 * 同じメールアドレスのリードに紐ずく行動履歴データを論理削除する
	 * @param array	$registLeadData	リードデータのDICT
	 */
	public function deleteDuplicationMailAddress($webinarLeadId, $clientId, $mailAddress){
		// 可読性を上げるために先に対象を取得する
		$sql = "
			SELECT 
				id 
			FROM 
				webinar_lead 
			WHERE 
				id <> {$webinarLeadId} AND 
				client_id = {$clientId} AND 
				mail_address = '{$mailAddress}' AND 
				del_flg = 0 
		";
		$webinarLeads = $this->db->fetchAll($sql, array());
		// 行動履歴が存在する場合のみ削除処理を実行する
		if($webinarLeads){
			// 削除対象のIDを取得するし、カンマでつなげた文字列とする
			$deleteLeadIds = join(",", array_column($webinarLeads, "id"));
			// 更新（IDがPKだが念のためにclient_idも更新上検討する）
			$this->db->update('webinar_lead_behavior_history', array("del_flg"=>1), "webinar_lead_id IN ({$deleteLeadIds}) AND client_id = {$clientId} AND del_flg = 0" );
		}
	}

	/**
	 * ウェビナー参加者の行動履歴を１件取得する
	 * @param int		$webinarId				ウェビナーID
	 * @param int		$id						テーブル内のID
	 * @param int		$clientId				クライアントID
	 * @return array
	 */
	public function getBehaviorHistoryRow($webinarLeadId, $id, $clientId) {
		// クエリ作成
		$sql = "SELECT
					*
				FROM
					webinar_lead_behavior_history
				WHERE 
					webinar_lead_id = {$webinarLeadId} AND 
					id = {$id} AND 
					client_id = {$clientId} AND
					del_flg = 0;
		";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn;
	}
}
