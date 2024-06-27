<?php
class WebinarParticipantDao extends AbstractDao {

	private $db;
	function __construct($db){
		parent::init();
		$this->db = $db;
	}

	/**
	 * ウェビナーへの参加登録を行う
	 * @param array	$form		参加者の入力した情報
	 * @param array	$webinar	参加するウェビナー情報
	 */
	public function setWebinarParticipant($form, $webinar){
		// 登録するデータのみのdictを作成する
		$record = array(
			'webinar_id' 			=> $webinar["id"],
			'client_id' 			=> $webinar["client_id"],
			'name' 					=> $form["name"],
			'kana' 					=> $form["kana"],
			'tel_number' 			=> $form["tel_number"],
			'mail_address' 			=> $form["mail_address"],
			'postcode'				=> $form["postcode"],
			'street_address'		=> $form["street_address"],
			'company_name' 			=> $form["company_name"],
			'company_department'	=> $form["company_department"],
			'company_position'		=> $form["company_position"],
			'remarks'				=> $form["remarks"],
			'update_date' 			=> new Zend_Db_Expr('now()')
		);
		if(!array_key_exists("id", $form) || $form['id'] == ''){
			// 新規作成時のみ登録するデータ設定
			$record['id'] = new Zend_Db_Expr('webinar_participant_increment(webinar_id)');
			$record['unique_key'] = $form["unique_key"];
			$record['reservation_number'] = $form["reservation_number"];
			$record['latest_mail_subject'] = $form["latest_mail_subject"];
			$record['create_date'] = new Zend_Db_Expr('now()');
			// リードからメールを送信し、参加予約の場合のみリードIDを設定する
			if(array_key_exists("lead_id", $form)){
				$record['lead_id'] = $form["lead_id"];
			}
			// 新規登録
			$this->db->insert('webinar_participant', $record);
		}else{
			// 更新時はstatusが存在すれば参加申請・キャンセルの切り替えができる
			if(array_key_exists("cancel_flg", $form)){
				$record["cancel_flg"] = $form["cancel_flg"];
			}
			// 更新（IDがPKだが念のためにclient_idも更新上検討する）
			$this->db->update('webinar_participant', $record, "webinar_id = {$webinar['id']} AND id = {$form['id']} AND client_id = {$webinar['client_id']}" );
		}
	}

	/**
	 * オープンセミナーへの参加登録を行う
	 * @param array	$form		参加者情報
	 * @param array	$webinar	参加するウェビナー情報
	 */
	public function setOpenSeminar($form, $webinar){
		// 登録するデータのみのdictを作成する
		$record = array(
			'webinar_id' 			=> $webinar["id"],
			'id'					=> new Zend_Db_Expr('webinar_participant_increment(webinar_id)'),
			'client_id' 			=> $webinar["client_id"],
			'unique_key'			=> $form["unique_key"],
			'reservation_number'	=> $form["reservation_number"],
			'create_date' 			=> new Zend_Db_Expr('now()'),
			'update_date' 			=> new Zend_Db_Expr('now()')
		);
		// 新規登録
		$this->db->insert('webinar_participant', $record);
	}

	/**
	 * ウェビナー参加者の一意キー登録を行う
	 * 桁数を８桁に減らすため仕様変更と共に、未使用になった
	 * @param array	$form		参加者の入力した情報
	 * @param array	$webinar	参加するウェビナー情報
	 */
	public function setWebinarParticipantKey($webinarParticipant){
		// ユニークキーを作成する
		$participantKey = md5("{$webinarParticipant["webinar_id"]}_{$webinarParticipant["id"]}_{$webinarParticipant["client_id"]}" . date("Y-m-d H:i:s"));
		$this->db->update('webinar_participant', array("unique_key"=>$participantKey), "webinar_id = {$webinarParticipant['webinar_id']} AND id = {$webinarParticipant['id']} AND client_id = {$webinarParticipant['client_id']}" );
	}

	/**
	 * 参加者が重複していないかチェックする
	 * @param array	$webinarId		ウェビナーのPK
	 * @param array	$mailAddress	参加者のメールアドレス
	 * @return array
	 */
	public function duplicationWebinarParticipant($webinarId, $mailAddress){
		$sql = "SELECT
					*
				FROM
					webinar_participant
				WHERE 
					webinar_id = {$webinarId} AND 
					mail_address = '{$mailAddress}';
		";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn;
	}

	/**
	 * ウェビナー一覧の取得条件を指定しカウントを取得する
	 * @param int		$webinarId	ウェビナーID
	 * @param int		$clientId	クライアントID
	 * @param string	$freeWord	フリーワード検索条件
	 * @return int
	 */
	public function getWebinarParticipantCount($webinarId, $clientId, $freeWord) {
		// フリーワードから検索条件を作成する
		$condition = $this->webinarParticipantListDisplayCondition($freeWord);
		// クエリ作成
		$sql = "SELECT
					count(id) as count
				FROM
					webinar_participant
				WHERE 
					webinar_id = {$webinarId} AND 
					client_id = {$clientId} AND 
					{$condition}
					del_flg = 0;
				";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn["count"];
	}


	/**
	 * ウェビナー一覧の取得条件を指定しリストを取得する
	 * @param int		$webinarId	ウェビナーID
	 * @param int		$clientId	クライアントID
	 * @param string	$freeWord	フリーワード検索条件
	 * @param string	$order		並び替えのカラム
	 * @param string	$ordertype	昇順・降順
	 * @param int		$page		表示ページ
	 * @param int		$limit		表示件数
	 * @return array
	 */
	public function getWebinarParticipantList($webinarId, $clientId, $freeWord, $order, $ordertype, $page, $limit) {
		// 何ページ目を表示するかの値を設定
		$offset = 0;
		$page = $page - 1;
		if($page > 0){
			$offset = $page * $limit;
		}
		// フリーワードから検索条件を作成する
		$condition = $this->webinarParticipantListDisplayCondition($freeWord);
		// クエリ作成
		$sql = "SELECT
					*
				FROM
					webinar_participant
				WHERE 
					webinar_id = {$webinarId} AND 
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
	 * 参加者情報を１件取得する。
	 * @param int	$webinarId		ウェビナーID
	 * @param int	$id				ウェビナーID内での通番
	 * @param int	$clientId		企業ID
	 * @return array
	 */
	public function getWebinarParticipantRow($webinarId, $id, $clientId){
		// クエリ作成
		$sql = "SELECT
					*
				FROM
					webinar_participant
				WHERE 
					webinar_id = {$webinarId} AND 
					id = {$id} AND 
					client_id = {$clientId} AND 
					del_flg = 0;
		";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn;
	}

	/**
	 * ウェビナー参加者の予約番号が、同一ウェビナー内で重複していないかチェックする
	 * @param int		$webinarId					ウェビナーID
	 * @param string	$freeWoreservationNumberrd	予約番号
	 * @return array
	 */
	public function searchSameReservationNumber($webinarId, $reservationNumber){
		// クエリ作成
		$sql = "SELECT
					* 
				FROM
					webinar_participant
				WHERE 
					webinar_id = {$webinarId} AND 
					reservation_number = '{$reservationNumber}' AND 
					del_flg = 0;
				";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn;
	}

	/**
	 * ウェビナー参加者一覧でフリーワード検索が存在した場合に検索条件を作成する
	 * 今までは、modelに検索条件作成処理を持たせていたが、カラム変更などを考慮し
	 * daoにその機能を持たせるように変更した。
	 * @param string	$freeWord	フリーワード
	 * @return string
	 */
	private function webinarParticipantListDisplayCondition($freeWord){
		// 戻り値の検索条件
		$condition = "";
		if($freeWord != ""){
			// フリーワードが入力されている場合
			$condition = " (
								`name` like '%{$freeWord}%' OR 
								DATE_FORMAT(`create_date`, '%Y-%m-%d %H:%i:%s' ) like '%{$freeWord}%' OR 
								`tel_number` like '%{$freeWord}%' OR 
								`mail_address` like '%{$freeWord}%' OR 
								`company_name` like '%{$freeWord}%' 
							) AND ";
		}
		// 戻り値を返す
		return $condition;
	}

	/**
	 * ウェビナーに入室した人数を取得する
	 * @param int	$webinarId	webinarテーブルのPK
	 * @param int	$clientId	企業ID
	 * @return string
	 */
	public function getWebinarEnterRoomCount($webinarId, $clientId){
		// クエリ作成
		$sql = "SELECT
					count(id) as count
				FROM
					webinar_participant
				WHERE 
					webinar_id = {$webinarId} AND 
					client_id = {$clientId} AND 
					entry_room_date IS NOT NULL AND
					del_flg = 0;
		";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn["count"];
	}
	/**
	 * キャンセルした人数を取得する
	 * @param int	$webinarId	webinarテーブルのPK
	 * @param int	$clientId	企業ID
	 * @return string
	 */
	public function getWebinarCancelCount($webinarId, $clientId){
		// クエリ作成
		$sql = "SELECT
					count(id) as count
				FROM
					webinar_participant
				WHERE 
					webinar_id = {$webinarId} AND 
					client_id = {$clientId} AND 
					cancel_flg = 1 AND 
					del_flg = 0;
		";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn["count"];
	}
	
	/**
	 * 最新メールタイトルを登録する
	 * @param int		$webinarId			ウェビナーID
	 * @param int		$id					参加者ID
	 * @param int		$clientId			企業ID
	 * @param string	$latestMailSubject	メールタイトル
	 */
	public function setLatestMailSubject($webinarId, $id, $clientId, $latestMailSubject){
		// 登録するデータのみのdictを作成する
		$record = array(
			'latest_mail_subject'		=> $latestMailSubject,
			'update_date' 			=> new Zend_Db_Expr('now()')
		);
		// 更新（IDがPKだが念のためにclient_idも更新上検討する）
		$this->db->update('webinar_participant', $record, "webinar_id = {$webinarId} AND id = {$id} AND client_id = {$clientId}" );
		// 件名を返す
		return $latestMailSubject;
	}

	/**
	 * ウェビナーがキャンセルされた際に、キャンセル通知を行う参加者情報を取得する
	 * @param int	$webinarId		ウェビナーID
	 * @param int	$clientId		企業ID
	 * @return array
	 */
	public function getCancelWebinarNotification($webinarId, $clientId){
		// クエリ作成
		$sql = "SELECT
					*
				FROM
					webinar_participant
				WHERE 
					webinar_id = {$webinarId} AND 
					client_id = {$clientId} AND 
					cancel_flg = 0 AND 
					del_flg = 0;
		";
		$rtn = $this->db->fetchAll($sql, array());
		return $rtn;
	}

	/**
	 * PKのIDとクライアントIDを指定し、ウェビナー参加者情報を１件論理削除する。
	 * クライアントIDは念のため付与しているだけで、PK指定なので１件確定となる。
	 * @param int	$webinarId	ウェビナーID
	 * @param int	$id			ウェビナー内の通版
	 * @param int	$clientId	クライアントID
	 * @return array
	 */
	public function deleteParticipant($webinarId, $id, $clientId){
		// 登録するデータのみのdictを作成する
		$record = array(
			'del_flg'		=> 1,
			'update_date' 	=> new Zend_Db_Expr('now()')
		);
		$this->db->update('webinar_participant', $record, "webinar_id = {$webinarId} AND id = {$id} AND client_id = {$clientId}");
	}

	/**
	 * 参加者のキャンセル依頼があった際に、参加者を特定する。
	 * @param string	$announceKey		ウェビナーの一意になるキー
	 * @param string	$mailAddress		参加者のメールアドレス
	 * @param string	$reservationNumber	参加者の予約番号
	 * @return array
	 */
	public function getChancelReservationRow($announceKey, $mailAddress, $reservationNumber){
		// クエリ作成
		$sql = "SELECT
					a.*
				FROM
					webinar_participant as a 
				INNER JOIN 
					webinar as b 
				ON 
					a.webinar_id = b.id AND 
					a.client_id = b.client_id 
				WHERE 
					b.announce_key = '{$announceKey}' AND 
					a.mail_address = '{$mailAddress}' AND 
					a.reservation_number = '{$reservationNumber}' AND 
					a.del_flg = 0 AND 
					b.del_flg = 0;
		";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn;
	}

	/**
	 * 参加者予約情報のキャンセルフラグを立てる
	 * @param int	$announceKey	ウェビナーの一意になるキー
	 * @param int	$mailAddress	参加者のメールアドレス
	 * @param int	$clientid		企業ID
	 * @return array
	 */
	public function chancelWebinarParticipant($webinarId, $id, $clientId){
		// 登録するデータのみのdictを作成する
		$record = array(
			'cancel_flg'		=> 1,
			'update_date' 	=> new Zend_Db_Expr('now()')
		);
		$this->db->update('webinar_participant', $record, "webinar_id = {$webinarId} AND id = {$id} AND client_id = {$clientId}");
	}

	/**
	 * 参加者登録後に登録した参加者情報を取得する
	 * @param int	$webinarId			ウェビナーの一意になるキー
	 * @param int	$mailAddress		参加者のメールアドレス
	 * @param int	$reservationNumber	予約番号
	 * @return array
	 */
	public function getWebinarParticipantAfterCreation($webinarId, $mailAddress, $reservationNumber){
		// クエリ作成
		$sql = "SELECT
					*
				FROM
					webinar_participant 
				WHERE 
					webinar_id = {$webinarId} AND 
					mail_address = '{$mailAddress}' AND 
					reservation_number = '{$reservationNumber}' AND 
					del_flg = 0;
		";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn;
	}

	/**
	 * ユニークキーを指定し参加者情報を取得する
	 * @param string	$uniqueKey	ユニークキー
	 * @return array
	 */
	public function getWebinarParticipantByUniqueKey($uniqueKey){
		$sql = "SELECT
					*
				FROM
					webinar_participant
				WHERE 
					unique_key = '{$uniqueKey}' AND 
					del_flg = 0;
		";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn;
	}

	/**
	 * ユニークキーを指定し参加者情報を取得する
	 * 重複チェックなので削除フラグ関係なくチェックする
	 * @param string	$uniqueKey	ユニークキー
	 * @return array
	 */
	public function searchSameUniqueKey($uniqueKey){
		$sql = "SELECT
					*
				FROM
					webinar_participant
				WHERE 
					unique_key = '{$uniqueKey}';
		";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn;
	}
}
