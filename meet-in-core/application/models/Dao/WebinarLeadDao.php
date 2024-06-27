<?php
class WebinarLeadDao extends AbstractDao {

	private $db;
	function __construct($db){
		parent::init();
		$this->db = $db;
	}

	/**
	 * ウェビナーリードの登録
	 * @param array $record		画面で入力したデータ
	 * @return unknown
	 */
	public function setWebinarLead($form){
		// 登録するデータのみのdictを作成する
		$record = array(
			'client_id' 			=> $form["client_id"],
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
			"staff_type"			=> $form["staff_type"],
			"staff_id"				=> $form["staff_id"],
			'update_date' 			=> new Zend_Db_Expr('now()')
		);
		// 存在すれば登録するデータ設定
		if(array_key_exists("latest_mail_subject", $form)){
			$record["latest_mail_subject"] = $form["latest_mail_subject"];
		}
		if(array_key_exists("wp_webinar_id", $form)){
			$record["wp_webinar_id"] = $form["wp_webinar_id"];
		}
		if(array_key_exists("wp_id", $form)){
			$record["wp_id"] = $form["wp_id"];
		}
		if(array_key_exists("staff_type", $form)){
			$record["staff_type"] = $form["staff_type"];
		}
		if(array_key_exists("staff_id", $form)){
			$record["staff_id"] = $form["staff_id"];
		}
		// 戻り値
		$lastId = null;
		if(!array_key_exists("id", $form) || $form['id'] == ''){
			// 新規時のみ設定する項目
			$record['unique_key'] = $form["unique_key"];
			$record['regist_route'] = $form["regist_route"];
			$record['create_date'] = new Zend_Db_Expr('now()');
			// 新規登録
			$this->db->insert('webinar_lead', $record);
			$lastId = $this->db->lastInsertId();
		}else{
			// 更新（IDがPKだが念のためにclient_idも更新上検討する）
			$this->db->update('webinar_lead', $record, "id = {$form['id']} AND client_id = {$form['client_id']}" );
			// 戻り値を設定する
			$lastId = $form['id'];
		}
		return $lastId;
	}
	/**
	 * リードキーを作成する
	 * 桁数を８桁に減らすため仕様変更と共に、未使用になった
	 * @param int $id			リードのPK
	 * @param array $record		画面で入力したデータ
	 * @return string			md5の32文字
	 */
	private function createLeadKey($id, $record){
		return md5("{$id}_{$record["mail_address"]}" . date("Y-m-d H:i:s"));
	}
	/**
	 * ウェビナーリード一覧の取得条件を指定しカウントを取得する
	 * [plan→予定][end→終了][all→全件数]
	 * @param int		$clientId	クライアントID
	 * @param string	$freeWord	フリーワード検索条件
	 * @return int
	 */
	public function getWebinarLeadCount($clientId, $freeWord) {
		// フリーワードから検索条件を作成する
		$condition = $this->webinarLeadListDisplayCondition($freeWord);
		// クエリ作成
		$sql = "SELECT
					count(id) as count
				FROM
					webinar_lead as a
				WHERE 
					client_id = {$clientId} AND 
					{$condition}
					del_flg = 0;
				";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn["count"];
	}


	/**
	 * ウェビナーリード一覧の取得条件を指定しリストを取得する
	 * [plan→予定][end→終了][all→全件数]
	 * @param int		$clientId	クライアントID
	 * @param string	$freeWord	フリーワード検索条件
	 * @param string	$order		並び替えのカラム
	 * @param string	$ordertype	昇順・降順
	 * @param int		$page		表示ページ
	 * @param int		$limit		表示件数
	 * @return array
	 */
	public function getWebinarLeadList($clientId, $freeWord, $order, $ordertype, $page, $limit) {
		// 何ページ目を表示するかの値を設定
		$offset = 0;
		$page = $page - 1;
		if($page > 0){
			$offset = $page * $limit;
		}
		// フリーワードから検索条件を作成する
		$condition = $this->webinarLeadListDisplayCondition($freeWord);
		// クエリ作成
		$sql = "SELECT
					a.* 
				FROM
					webinar_lead as a 
				WHERE 
					a.client_id = {$clientId} AND 
					{$condition} 
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
	 * ウェビナーリード一覧でフリーワード検索が存在した場合に検索条件を作成する
	 * 今までは、modelに検索条件作成処理を持たせていたが、カラム変更などを考慮し
	 * daoにその機能を持たせるように変更した。
	 * @param string	$freeWord	フリーワード
	 * @return string
	 */
	private function webinarLeadListDisplayCondition($freeWord){
		// 戻り値の検索条件
		$condition = "";
		if($freeWord != ""){
			// フリーワードが入力されている場合
			$condition = " (
								a.`name` like '%{$freeWord}%' 
								
							) AND ";
		}
		// 戻り値を返す
		return $condition;
	}

	/**
	 * ウェビナーリード情報を１件取得する。
	 * @param int	$id				ウェビナーリードのPK
	 * @param int	$clientId		企業ID
	 * @return array
	 */
	public function getWebinarLeadRow($id, $clientId){
		// クエリ作成
		$sql = "SELECT
					*
				FROM
					webinar_lead
				WHERE 
					id = {$id} AND 
					client_id = {$clientId} AND 
					del_flg = 0;
		";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn;
	}

	/**
	 * PKのIDとクライアントIDを指定し、ウェビナーリード情報を１件論理削除する。
	 * クライアントIDは念のため付与しているだけで、PK指定なので１件確定となる。
	 * @param int	$id			ウェビナーリードのPK
	 * @param int	$clientId	クライアントID
	 * @return array
	 */
	public function deleteWebinarLead($id, $clientId){
		// 登録するデータのみのdictを作成する
		$record = array(
			'del_flg'		=> 1,
			'update_date' 	=> new Zend_Db_Expr('now()')
		);
		$this->db->update('webinar_lead', $record, "id = {$id} AND client_id = {$clientId}");
	}

	/**
	 * 最新メールタイトルを登録する
	 * @param int		$id					リードのPK
	 * @param int		$clientId			企業ID
	 * @param string	$latestMailSubject	メールタイトル
	 */
	public function setLatestMailSubject($id, $clientId, $latestMailSubject){
		// 登録するデータのみのdictを作成する
		$record = array(
			'latest_mail_subject'	=> $latestMailSubject,
			'update_date' 			=> new Zend_Db_Expr('now()')
		);
		// 更新（IDがPKだが念のためにclient_idも更新上検討する）
		$this->db->update('webinar_lead', $record, "id = {$id} AND client_id = {$clientId}" );
	}


	/**
	 * 同じメールアドレスのリードデータを論理削除する
	 * @param array	$registLeadData	リードデータのDICT
	 */
	public function deleteDuplicationMailAddress($webinarLeadId, $registLeadData){
		// 登録するデータのみのdictを作成する
		$record = array(
			'del_flg'			=> 1,
			'update_date' 		=> new Zend_Db_Expr('now()')
		);
		// 更新（IDがPKだが念のためにclient_idも更新上検討する）
		$this->db->update('webinar_lead', $record, "id <> {$webinarLeadId} AND mail_address = '{$registLeadData["mail_address"]}' AND client_id = {$registLeadData["client_id"]} AND del_flg = 0" );
	}

	/**
	 * ユニークキーを指定してリードを取得する
	 * @param int	$uniqueKey	ユニークキー
	 * @return array
	 */
	public function getWebinarLeadByUniqueKey($uniqueKey){
		// クエリ作成
		$sql = "SELECT
					*
				FROM
					webinar_lead
				WHERE 
					unique_key = '{$uniqueKey}' AND 
					del_flg = 0;
		";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn;
	}

	/**
	 * ユニークキーを指定してリードを取得する
	 * 重複チェックなので削除フラグ関係なくチェックする
	 * @param int	$uniqueKey	ユニークキー
	 * @return array
	 */
	public function searchSameUniqueKey($uniqueKey){
		// クエリ作成
		$sql = "SELECT
					*
				FROM
					webinar_lead
				WHERE 
					unique_key = '{$uniqueKey}';
		";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn;
	}
}
