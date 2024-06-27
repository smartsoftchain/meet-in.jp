<?php
class OpenSeminarDao extends AbstractDao {

	private $db;
	function __construct($db){
		parent::init();
		$this->db = $db;
	}

	/**
	 * オープンセミナーデフォルトの登録
	 * @param array $record		画面で入力したデータ
	 * @param array $user		ログインユーザーデータ
	 * @return unknown
	 */
	public function setOpenSeminarDefault($form, $user) {
		// 登録するデータのみのdictを作成する
		$record = array(
			'client_id' 			=> $user["client_id"],
			'logo_webinar_path' 	=> $form["logo_webinar_path"],
			'holding_time' 			=> $form["holding_time"],
			'max_participant_count' => $form["max_participant_count"],
			'mail_address'			=> $form["mail_address"], 
			'theme_color'			=> $form["theme_color"], 
			'character_color'		=> $form["character_color"], 
			'staff_type' 			=> $user["staff_type"],
			'staff_id' 				=> $user["staff_id"],
			'update_date' 			=> new Zend_Db_Expr('now()')
		);
		if(!$this->getOpenSeminarDefault($user["client_id"])){
			// 新規作成時のみ登録するデータ設定
			$record['create_date'] = new Zend_Db_Expr('now()');
			// 新規登録
			$this->db->insert('open_seminar_default', $record);
		}else{
			// 更新
			$this->db->update('open_seminar_default', $record, "client_id = {$user['client_id']}" );
		}
	}

	/**
	 * オープンセミナーテンプレートの登録
	 * @param array $record		画面で入力したデータ
	 * @param array $user		ログインユーザーデータ
	 * @return unknown
	 */
	public function setOpenSeminarTemplate($form, $user) {
		// 登録するデータのみのdictを作成する
		$record = array(
			'client_id' 			=> $user["client_id"],
			'name' 					=> $form["name"],
			'logo_webinar_path' 	=> $form["logo_webinar_path"],
			'holding_time' 			=> $form["holding_time"],
			'max_participant_count' => $form["max_participant_count"],
			'mail_address'			=> $form["mail_address"], 
			'theme_color'			=> $form["theme_color"], 
			'character_color'		=> $form["character_color"], 
			'staff_type' 			=> $user["staff_type"],
			'staff_id' 				=> $user["staff_id"],
			'update_date' 			=> new Zend_Db_Expr('now()')
		);
		if(!array_key_exists("id", $form) || $form['id'] == ''){
			// 新規作成時のみ登録するデータ設定
			$record['id'] = new Zend_Db_Expr('open_seminar_template_increment(client_id)');
			$record['create_date'] = new Zend_Db_Expr('now()');
			// 新規登録
			$this->db->insert('open_seminar_template', $record);
		}else{
			// 更新
			$this->db->update('open_seminar_template', $record, "client_id = {$user['client_id']} AND id = {$form['id']}" );
		}
	}

	/**
	 * クライアントIDを指定しデータを取得する。
	 * デフォルトは１件しか存在しない。
	 * @param int	$clientId	クライアントID(PK)
	 * @return array
	 */
	public function getOpenSeminarDefault($clientId){
		// クエリ作成
		$sql = "SELECT
					*
				FROM
					open_seminar_default
				WHERE 
					client_id = {$clientId};
		";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn;
	}

	/**
	 * ウェビナー一覧の取得条件と、種別を指定しリストを取得する
	 * [plan→予定][end→終了][all→全件数]
	 * @param int		$clientId	クライアントID
	 * @param string	$freeWord	フリーワード検索条件
	 * @param string	$order		並び替えのカラム
	 * @param string	$ordertype	昇順・降順
	 * @param int		$page		表示ページ
	 * @param int		$limit		表示件数
	 * @return array
	 */
	public function getOpenSeminarTemplateList($clientId, $freeWord, $order, $ordertype, $page, $limit){
		// 何ページ目を表示するかの値を設定
		$offset = 0;
		$page = $page - 1;
		if($page > 0){
			$offset = $page * $limit;
		}
		// フリーワードから検索条件を作成する
		$condition = $this->getOpenSeminarTemplateCondition($freeWord);
		// クエリ作成
		$sql = "SELECT
					* 
				FROM
					open_seminar_template 
				WHERE 
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
	 * オープンセミナーテンプレート一覧でフリーワード検索が存在した場合に検索条件を作成する
	 * 今までは、modelに検索条件作成処理を持たせていたが、カラム変更などを考慮し
	 * daoにその機能を持たせるように変更した。
	 * @param string	$freeWord	フリーワード
	 * @return string
	 */
	private function getOpenSeminarTemplateCondition($freeWord){
		// 戻り値の検索条件
		$condition = "";
		if($freeWord != ""){
			// フリーワードが入力されている場合
			$condition = " (
								`name` like '%{$freeWord}%' OR 
								`holding_time` like '%{$freeWord}%' OR 
								`max_participant_count` like '%{$freeWord}%' OR 
								`mail_address` like '%{$freeWord}%'
							) AND ";
		}
		// 戻り値を返す
		return $condition;
	}

	/**
	 * PKのクライアントIDとIDを指定し、オープンセミナーテンプレート情報を１件取得する。
	 * @param int	$clientId	クライアントID
	 * @param int	$id			PK
	 * @return array
	 */
	public function getOpenSeminarTemplateRow($clientId, $id){
		// クエリ作成
		$sql = "SELECT
					*
				FROM
					open_seminar_template
				WHERE 
					client_id = {$clientId} AND 
					id = {$id} AND 
					del_flg = 0;
		";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn;
	}

	/**
	 * オープンセミナーテンプレートを論理削除する
	 * @param int	$clientId			クライアントID
	 * @param int	$deleteIdCondition	IDをカンマで繋げた文字列
	 */
	public function deleteOpenSeminarTemplate($clientId, $deleteIdCondition){
		// 登録するデータのみのdictを作成する
		$record = array(
			'staff_type' 	=> $this->user["staff_type"],
			'staff_id' 		=> $this->user["staff_id"],
			'del_flg'		=> 1,
			'update_date' 	=> new Zend_Db_Expr('now()')
		);
		$this->db->update('open_seminar_template', $record, "client_id = {$clientId} AND id IN({$deleteIdCondition})");
	}

	/**
	 * クライアントに紐づくオープンセミナーテンプレートを全て取得する
	 * @param int	$clientId			クライアントID
	 * @param int	$deleteIdCondition	IDをカンマで繋げた文字列
	 */
	public function getOpenSeminarTemplateListByClientId($clientId){
		// クエリ作成
		$sql = "SELECT
					* 
				FROM
					open_seminar_template 
				WHERE 
					client_id = {$clientId} AND 
					del_flg = 0 
				ORDER BY
					id;
		";
		$rtn = $this->db->fetchAll($sql, array());
		// 戻り値を返す
		return $rtn;
	}
}