<?php
class WebinarDao extends AbstractDao {

	private $db;
	function __construct($db){
		parent::init();
		$this->db = $db;
	}

	/**
	 * ウェビナーの登録
	 * @param array $form		画面で入力したデータ
	 * @param array $user		ログインユーザーデータ
	 * @return unknown
	 */
	public function setWebinar($form, $user) {
		// 戻り値のIDを保存する変数
		$resultId = "";
		// 値の補正を行う
		if($form["holding_date"] == ""){
			$form["holding_date"] = new Zend_Db_Expr('null');
		}
		if($form["from_reservation_date"] == ""){
			$form["from_reservation_date"] = new Zend_Db_Expr('null');
		}
		if($form["to_reservation_date"] == ""){
			$form["to_reservation_date"] = new Zend_Db_Expr('null');
		}
		// 登録するデータのみのdictを作成する
		$record = array(
			'client_id' 			=> $user["client_id"],
			'name' 					=> $form["name"],
			'img_path' 				=> $form["img_path"],
			'logo_reservation_path' => $form["logo_reservation_path"],
			'logo_webinar_path' 	=> $form["logo_webinar_path"],
			'outline' 				=> $form["outline"],
			'holding_date' 			=> $form["holding_date"],
			'holding_time' 			=> $form["holding_time"],
			'from_reservation_date' => $form["from_reservation_date"],
			'to_reservation_date' 	=> $form["to_reservation_date"],
			'max_participant_count' => $form["max_participant_count"],
			'mail_address'			=> $form["mail_address"], 
			'theme_color'			=> $form["theme_color"], 
			'character_color'		=> $form["character_color"], 
			'explanation_text'		=> $form["explanation_text"], 
			'staff_type' 			=> $user["staff_type"],
			'staff_id' 				=> $user["staff_id"],
			'update_date' 			=> new Zend_Db_Expr('now()')
		);
		if(!array_key_exists("id", $form) || $form['id'] == ''){
			// 新規作成時のみ登録するデータ設定
			$record['room_name'] = $form["room_name"];
			$record['admin_key'] = $form["admin_key"];
			$record['announce_key'] = $form["announce_key"];
			$record['create_date'] = new Zend_Db_Expr('now()');
			// 新規登録
			$this->db->insert('webinar', $record);
			// 新規登録したデータのID
			$resultId = $this->db->lastInsertId();
		}else{
			// 更新（IDがPKだが念のためにclient_idも更新上検討する）
			$this->db->update('webinar', $record, "id = {$form['id']} AND client_id = {$user['client_id']}" );
			// 更新したデータのID
			$resultId = $form['id'];
		}
		// 戻り値を返す
		return $resultId;
	}

	/**
	 * オープンセミナーの登録
	 * @param array $form		画面で入力したデータ
	 * @param array $user		ログインユーザーデータ
	 */
	public function setOpenSeminar($form, $user){
		$holdingDate = date("Y-m-d H:i") . ":00";
		// 登録するデータのみのdictを作成する
		$record = array(
			'client_id' 			=> $user["client_id"],
			'room_name'				=> $form["room_name"],
			'admin_key'				=> $form["admin_key"],
			'announce_key'			=> $form["announce_key"],
			'name' 					=> $form["open_seminar_name"],
			'logo_webinar_path' 	=> $form["logo_webinar_path"],
			'holding_date' 			=> $holdingDate,
			'holding_time' 			=> $form["holding_time"],
			'max_participant_count' => $form["max_participant_count"],
			'mail_address'			=> $form["mail_address"], 
			'theme_color'			=> $form["theme_color"], 
			'character_color'		=> $form["character_color"], 
			'open_seminar_flg'		=> 1,
			'staff_type' 			=> $user["staff_type"],
			'staff_id' 				=> $user["staff_id"],
			'create_date' 			=> new Zend_Db_Expr('now()'),
			'update_date' 			=> new Zend_Db_Expr('now()')
		);
		// 新規登録
		$this->db->insert('webinar', $record);
		// 新規登録したデータのID
		$resultId = $this->db->lastInsertId();
		// 戻り値を返す
		return $resultId;
	}

	/**
	 * ウェビナー一覧の取得条件と、種別を指定しカウントを取得する
	 * [plan→予定][end→終了][all→全件数]
	 * @param int		$clientId	クライアントID
	 * @param string	$freeWord	フリーワード検索条件
	 * @param string	$type		種別
	 * @return int
	 */
	public function getWebinarCount($clientId, $freeWord, $type) {
		// フリーワードから検索条件を作成する
		$condition = $this->webinarListDisplayCondition($freeWord);
		// 種別により条件を追加する
		$typeCondition = "";
		if($type == "plan"){
			// まだウェビナーが開始していないデータを取得する（開催時間内はカウントしない）
			$typeCondition = " now() < (holding_date + INTERVAL holding_time MINUTE) AND cancel_flg = 0 AND ";
		}elseif($type == "end"){
			// 既にウェビナーが終了したデータを取得する（開催時間内はカウントしない）
			$typeCondition = " now() > (holding_date + INTERVAL holding_time MINUTE) AND cancel_flg = 0 AND ";
		}elseif($type == "cancel"){
			// ウェビナーがキャンセルされたデータを取得する
			$typeCondition = " cancel_flg = 1 AND ";
		}
		// クエリ作成
		$sql = "SELECT
					count(id) as count
				FROM
					webinar as a
				WHERE 
					client_id = {$clientId} AND 
					{$condition}
					{$typeCondition}
					del_flg = 0;
				";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn["count"];
	}


	/**
	 * ウェビナー一覧の取得条件と、種別を指定しリストを取得する
	 * [plan→予定][end→終了][all→全件数]
	 * @param int		$clientId	クライアントID
	 * @param string	$freeWord	フリーワード検索条件
	 * @param string	$type		種別
	 * @param string	$order		並び替えのカラム
	 * @param string	$ordertype	昇順・降順
	 * @param int		$page		表示ページ
	 * @param int		$limit		表示件数
	 * @return array
	 */
	public function getWebinarList($clientId, $freeWord, $type, $order, $ordertype, $page, $limit) {
		// 何ページ目を表示するかの値を設定
		$offset = 0;
		$page = $page - 1;
		if($page > 0){
			$offset = $page * $limit;
		}
		// フリーワードから検索条件を作成する
		$condition = $this->webinarListDisplayCondition($freeWord);
		// 種別により条件を追加する
		$typeCondition = "";
		if($type == "plan"){
			// まだウェビナーが開始していないデータを取得する（開催時間内はカウントしない）
			$typeCondition = " now() < (holding_date + INTERVAL holding_time MINUTE) AND a.cancel_flg = 0 AND ";
		}elseif($type == "end"){
			// 既にウェビナーが終了したデータを取得する（開催時間内はカウントしない）
			$typeCondition = " now() > (holding_date + INTERVAL holding_time MINUTE) AND a.cancel_flg = 0 AND ";
		}elseif($type == "cancel"){
			// ウェビナーがキャンセルされたデータを取得する
			$typeCondition = " a.cancel_flg = 1 AND ";
		}
		// クエリ作成
		$sql = "SELECT
					a.*, 
					COUNT(b.id) participant_count 
				FROM
					webinar as a 
				LEFT OUTER JOIN 
					webinar_participant as b 
				ON 
					a.id = b.webinar_id AND 
					b.client_id = {$clientId} AND
					b.cancel_flg = 0 AND
					b.entry_room_date IS NOT NULL AND 
					b.del_flg = 0 
				WHERE 
					a.client_id = {$clientId} AND 
					{$condition} 
					{$typeCondition}
					a.del_flg = 0 
				GROUP BY 
					a.id  
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
	 * ウェビナー一覧でフリーワード検索が存在した場合に検索条件を作成する
	 * 今までは、modelに検索条件作成処理を持たせていたが、カラム変更などを考慮し
	 * daoにその機能を持たせるように変更した。
	 * @param string	$freeWord	フリーワード
	 * @return string
	 */
	private function webinarListDisplayCondition($freeWord){
		// 戻り値の検索条件
		$condition = "";
		if($freeWord != ""){
			// フリーワードが入力されている場合
			$condition = " (
								a.`name` like '%{$freeWord}%' OR 
								DATE_FORMAT(`holding_date`, '%Y-%m-%d %H:%i:%s' ) like '%{$freeWord}%' OR 
								`max_participant_count` like '%{$freeWord}%' 
							) AND ";
		}
		// 戻り値を返す
		return $condition;
	}

	/**
	 * PKのIDとクライアントIDを指定し、ウェビナー情報を１件取得する。
	 * クライアントIDは念のため付与しているだけで、PK指定なので１件確定となる。
	 * @param int	$id			PK
	 * @param int	$clientId	クライアントID
	 * @return array
	 */
	public function getWebinarRowByIdAndClientId($id, $clientId){
		// クエリ作成
		$sql = "SELECT
					*
				FROM
					webinar
				WHERE 
					id = {$id} AND 
					client_id = {$clientId} AND 
					del_flg = 0;
		";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn;
	}

	/**
	 * 重複しない admin_key による ウェビナー情報の取得.
	 * @param int	$adminKey	主催者がルームにログインする為に使用する一意なキー
	 * @return array
	 */
	public function getWebinarRowByAdminKey($adminKey){
		// クエリ作成
		$sql = "SELECT
					*
				FROM
					webinar
				WHERE 
					admin_key = '{$adminKey}' AND 
					del_flg = 0;
		";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn;
	}


	/**
	 * 3ヶ月以内に同じルーム名が存在する場合はデータを取得する
	 * @param string	$roomName	8桁の数値
	 * @return array
	 */
	public function searchSameRoomName($roomName){
		$sql = "SELECT
					*
				FROM
					webinar
				WHERE 
					room_name = '{$roomName}' AND 
					holding_date > (NOW() - INTERVAL 3 MONTH);
		";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn;
	}

	/**
	 * 同じデータがキーデータが存在する場合はデータを取得する
	 * @param string	$keyValue	キーの値
	 * @param string	$keyColumn	比較するカラム名[admin_key][announce_key]
	 * @return array
	 */
	public function searchSameKeyValue($keyValue, $keyColumn){
		$sql = "SELECT
					*
				FROM
					webinar
				WHERE 
					{$keyColumn} = '{$keyValue}';
		";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn;
	}

	/**
	 * アナウンスキーを指定し、１件のデータを取得する
	 * @param string	$uniqueKey	暫定で32文字のmd5値
	 */
	public function getWebinarByAnnounceKey($announceKey){
		$sql = "SELECT
					a.*, 
					b.client_name, 
					b.client_address, 
					b.client_tel1,
					b.client_tel2,
					b.client_tel3 
				FROM
					webinar as a 
				INNER JOIN 
					master_client_new as b 
				ON 
					a.client_id = b.client_id 
				WHERE 
					announce_key = '{$announceKey}';
		";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn;
	}

	/**
	 * ウェビナーの最大参加人数を更新する
	 * @param array	$webinarId			ウェビナーのPK
	 * @param array	$participantCount	参加するウェビナー人数
	 */
	public function updateWebinarParticipantCount($webinarId, $participantCount) {
		// 更新（IDがPKだが念のためにclient_idも更新上検討する）
		$this->db->update('webinar', array("current_participant_count" => $participantCount), "id = {$webinarId}");
	}

	/**
	 * PKのIDとクライアントIDを指定し、ウェビナー情報を１件論理削除する。
	 * クライアントIDは念のため付与しているだけで、PK指定なので１件確定となる。
	 * @param int	$id			PK
	 * @param int	$clientId	クライアントID
	 * @return array
	 */
	public function deleteWebinar($id, $clientId){
		// 登録するデータのみのdictを作成する
		$record = array(
			'staff_type' 	=> $this->user["staff_type"],
			'staff_id' 		=> $this->user["staff_id"],
			'del_flg'		=> 1,
			'update_date' 	=> new Zend_Db_Expr('now()')
		);
		$this->db->update('webinar', $record, "id = {$id} AND client_id = {$clientId}");
	}

	/**
	 * PKのIDとクライアントIDを指定し、ウェビナー情報を１件キャンセルする。
	 * クライアントIDは念のため付与しているだけで、PK指定なので１件確定となる。
	 * @param int	$id			PK
	 * @param int	$clientId	クライアントID
	 * @return array
	 */
	public function cancelWebinar($id, $clientId){
		// 登録するデータのみのdictを作成する
		$record = array(
			'staff_type' 	=> $this->user["staff_type"],
			'staff_id' 		=> $this->user["staff_id"],
			'cancel_flg'	=> 1,
			'update_date' 	=> new Zend_Db_Expr('now()')
		);
		$this->db->update('webinar', $record, "id = {$id} AND client_id = {$clientId}");
	}

	/**
	 * クライアントIDに紐づく、削除されていないウェビナーを全件取得する
	 * @param int	$clientId	クライアントID
	 * @return array
	 */
	public function getWebinarByClientId($clientId){
		$sql = "SELECT
					* 
				FROM
					webinar 
				WHERE 
					client_id = {$clientId} AND 
					del_flg = 0 
				ORDER BY 
					create_date desc;
			";
		$rtn = $this->db->fetchAll($sql, array());
		return $rtn;
	}

	/**
	 * アンケート結果一覧の検索
	 * @param string	$freeWord	フリーワード
	 * @return string
	 */
	private function questionnaireResultListDisplayCondition($freeWord){
		// 戻り値の検索条件
		$condition = "";
		if($freeWord != ""){
			// フリーワードが入力されている場合
			$condition = " AND (
								b.`title` like '%{$freeWord}%' OR 
								DATE_FORMAT(a.`create_date`, '%Y-%m-%d %H:%i:%s' ) like '%{$freeWord}%' 
							) ";
		}
		// 戻り値を返す
		return $condition;
	}

	/**
	 * アンケート結果を取得する
	 * アンケート、アンケート集が削除されていてもデータを取得する
	 * @param int		$clientId	クライアントID
	 * @param int		$webinarId	ウェビナーID
	 * @param string	$freeWord	フリーワード
	 * @return string
	 */
	public function getQuestionnaireResultCount($clientId, $webinarId, $freeWord){
		// フリーワードから検索条件を作成する
		$condition = $this->questionnaireResultListDisplayCondition($freeWord);
		// 種別により条件を追加する
		// クエリ作成
		$sql = "SELECT
					count(a.id) as count
				FROM
					questionnaire_history as a 
				INNER JOIN 
					questionnaire as b 
				ON 
					a.questionnaire_id = b.id 
				INNER JOIN 
					questionnaire_group as c 
				ON 
					b.group_id = c.id 
				WHERE 
					a.webinar_id = {$webinarId} AND 
					c.client_id = {$clientId}  
					{$condition};
				";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn["count"];
	}

	/**
	 * アンケート結果を取得する
	 * アンケート、アンケート集が削除されていてもデータを取得する
	 * @param int		$clientId	クライアントID
	 * @param int		$webinarId	ウェビナーID
	 * @param string	$freeWord	フリーワード
	 * @param string	$order		並び替えのカラム
	 * @param string	$ordertype	昇順・降順
	 * @param int		$page		表示ページ
	 * @param int		$limit		表示件数
	 * @return string
	 */
	public function getQuestionnaireResultList($clientId, $webinarId, $freeWord, $type, $order, $ordertype, $page, $limit){
		// 何ページ目を表示するかの値を設定
		$offset = 0;
		$page = $page - 1;
		if($page > 0){
			$offset = $page * $limit;
		}
		// フリーワードから検索条件を作成する
		$condition = $this->questionnaireResultListDisplayCondition($freeWord);
		// 種別により条件を追加する
		// クエリ作成
		$sql = "SELECT
					a.id as history_id, 
					a.participant_count as participant_count,
					a.create_date as create_date, 
					b.title as title,
					b.answer_type as answer_type,
					COUNT(d.id) as answer_count,
					TRUNCATE(COUNT(d.id) / a.participant_count * 100, 0) as answer_rate
				FROM
					questionnaire_history as a 
				INNER JOIN 
					questionnaire as b 
				ON 
					a.questionnaire_id = b.id 
				INNER JOIN 
					questionnaire_group as c 
				ON 
					b.group_id = c.id 
				INNER JOIN 
					questionnaire_answer as d 
				ON 
					a.webinar_id = d.webinar_id AND 
					a.id = d.history_id
				WHERE 
					a.webinar_id = {$webinarId} AND 
					c.client_id = {$clientId} 
					{$condition} 
				GROUP BY 
					a.id 
				ORDER BY
					{$order} {$ordertype}
				LIMIT
					{$limit}
				OFFSET
					{$offset}
				";
		$rtn = $this->db->fetchAll($sql, array());
		return $rtn;
	}

	/**
	 * アンケート履歴からアンケート情報を取得する
	 * @param int		$clientId	クライアントID
	 * @param int		$webinarId	ウェビナーID
	 * @param int		$historyId	アンケート履歴ID
	 */
	function getQuestionnaireRow($clientId, $webinarId, $historyId){
		$sql = "
				SELECT
					b.*,
					a.participant_count 
				FROM
					questionnaire_history as a 
				INNER JOIN 
					questionnaire as b 
				ON 
					a.questionnaire_id = b.id 
				INNER JOIN 
					questionnaire_group as c 
				ON 
					b.group_id = c.id 
				WHERE 
					a.id = {$historyId} AND 
					a.webinar_id = {$webinarId} AND 
					c.client_id = {$clientId};
				";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn;
	}

	/**
	 * アンケートの集計に必要な情報を取得する
	 * @param int		$clientId	クライアントID
	 * @param int		$webinarId	ウェビナーID
	 * @param int		$historyId	アンケート履歴ID
	 */
	public function getQuestionnaireAggregate($clientId, $webinarId, $historyId, $orderBy){
		$sql = "
				SELECT 
					MIN(a.id) as id,
					count(DISTINCT a.answer) as count, 
					a.answer,
					a.answer_type 
				FROM 
					questionnaire_answer as a 
				INNER JOIN 
					questionnaire_history as b
				ON 
					a.history_id = b.id AND 
					a.webinar_id = b.webinar_id 
				INNER JOIN 
					questionnaire as c 
				ON 
					b.questionnaire_id = c.id 
				INNER JOIN 
					questionnaire_group as d 
				ON 
					c.group_id = d.id 
				WHERE 
					a.webinar_id = {$webinarId} AND 
					a.history_id = {$historyId} AND 
					d.client_id = {$clientId}
				GROUP BY 
					a.answer 
				ORDER BY 
					{$orderBy};
		";
		$rtn = $this->db->fetchAll($sql, array());
		return $rtn;
	}

	/**
	 * 今月のウェビナー使用時間を取得する
	 * @param int $clientId		クライアントID
	 */
	public function getSumWebinarUseTime($clientId){
		$sql = "
				SELECT
					sum(webinar_use_time) as webinar_use_time
				FROM
					webinar as a
				WHERE 
					client_id = {$clientId} AND 
					webinar_use_time IS NOT NULL AND
					DATE_FORMAT(holding_date, '%Y%m') = DATE_FORMAT(NOW(), '%Y%m') AND 
					del_flg = 0;
		";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn;
	}

	/**
	 * room_nameからウェビナーを特定する
	 * @param string $roomName	テーブル内でユニークなキー
	 */
	public function getWebinarByRoomName($roomName){
		$sql = "
			SELECT
				* 
			FROM
				webinar 
			WHERE 
				room_name = '{$roomName}' AND 
				holding_date > (NOW() - INTERVAL 3 MONTH) AND 
				del_flg = 0;
		";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn;
	}

	/**
	 * ウェビナー可能時間が0かどうか判定
	 * @param string $clientId
	 */
	public function boolWebinarAvailableTime($clientId){
		$sql = "
			SELECT
				webinar_available_time
			FROM
				master_client_new 
			WHERE 
				client_id = '{$clientId}'
		";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn;
	}

	/**
	 * 同じnameのオープンセミナーを取得する
	 * ３ヶ月以内に作成されたオープンセミナーを対象とする
	 * @param string $name		オープンセミナー名
	 */
	public function getOpenSeminarByName($name){
		$sql = "
			SELECT
				* 
			FROM
				webinar 
			WHERE 
				name = '{$name}' AND 
				create_date > (NOW() - INTERVAL 3 MONTH) AND 
				open_seminar_flg = 1 AND 
				del_flg = 0;
		";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn;
	}

	/**
	 * ユニークなroom_nameを指定しオープンセミナーを取得する
	 * ３ヶ月以内に作成されたオープンセミナーを対象とする
	 * @param string $roomName	テーブル内でユニークなキー
	 */
	public function getOpenSeminarByRoomName($roomName){
		$sql = "
			SELECT
				* 
			FROM
				webinar 
			WHERE 
				room_name = '{$roomName}' AND 
				create_date > (NOW() - INTERVAL 3 MONTH) AND 
				open_seminar_flg = 1 AND 
				del_flg = 0;
		";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn;
	}

	/**
	 * ウェビナー可能時間 + ウェビナー追加購入時間が0かどうか判定
	 * @param string $clientId
	 */
	public function boolWebinarAvailableClient($clientId){
		$sql = "
			SELECT
				webinar_available_time
			FROM
				master_client_new 
			WHERE 
				client_id = '{$clientId}'
		";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn;
	}
}