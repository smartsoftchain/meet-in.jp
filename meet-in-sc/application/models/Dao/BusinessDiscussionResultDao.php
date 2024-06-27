<?php

/**
 * BusinessDiscussionResultDao クラス
 *
 * 商談結果のDaoクラス
 *
 * @version 2016/12/07 akimoto
 * @package Dao
*/
class BusinessDiscussionResultDao extends AbstractDao {

	private $db;
	function __construct($db){
		parent::init();
		$this->db = $db;
	}

	/**
	 * 対象の商談結果情報を登録（更新・登録）
	 * @param unknown $form
	 * @return unknown
	 */
	public function setBDResult($form) {
		$sTime = "";
		$record = array(
				'staff_type'        => $form["staff_type"],
				'staff_id'          => $form["staff_id"],
				'sharing_memo'      => $form["sharing_memo"],
				'secret_comment'    => $form["secret_comment"],
				'company_name'      => $form["company_name"],
				'staff_name'        => $form["staff_name"],
				'client_service_id' => $form["client_service_id"],
				'executive'         => $form["executive"],
				'tel1'              => $form["tel1"],
				'tel2'              => $form["tel2"],
				'tel3'              => $form["tel3"],
				'fax1'              => $form["fax1"],
				'fax2'              => $form["fax2"],
				'fax3'              => $form["fax3"],
				'email'             => $form["email"],
				'memo'              => $form["memo"],
				'stime'             => new Zend_Db_Expr('now()'),
				'etime'             => new Zend_Db_Expr('now()'),
				'update_date'       => new Zend_Db_Expr('now()')
		);
		if(array_key_exists('client_id', $form)) {
			$record['client_id'] = $form["client_id"];
		}
		if(array_key_exists('del_flg', $form)) {
			$record['del_flg'] = $form["del_flg"];
		}

		if(array_key_exists('stime', $form)) {
			if ( !empty($form["stime"]) ) {	// 空(NULL)以外
				$record['stime'] = $form["stime"];
			}
		}

		if(array_key_exists('negotiation_tmpl_list', $form)) {
			if($form["negotiation_tmpl_list"] != "") {
				$record['template_id'] = $form["negotiation_tmpl_list"];
			} else {
				$record['template_id'] = new Zend_Db_Expr('NULL');
			}
		}
		if(array_key_exists('next_action', $form)) {
			if($form["next_action"] != "") {
				$record['next_action'] = $form["next_action"];
			} else {
				$record['next_action'] = new Zend_Db_Expr('NULL');
			}
		}
		if(array_key_exists('possibility', $form)) {
			if($form["possibility"] != "") {
				$record['possibility'] = $form["possibility"];
			} else {
				$record['possibility'] = new Zend_Db_Expr('NULL');
			}
		}
		if(!array_key_exists('id', $form) || empty($form['id'])){
			$record['create_date'] = new Zend_Db_Expr('now()');
			// 自サーバーに登録
			$this->db->insert('business_discussion_result', $record);
		}else{
			// 自サーバーに登録
			$record['stime'] = $form["stime"];
			$this->db->update('business_discussion_result', $record, "id = '{$form['id']}'" );
			$sTime = $form['stime'];
		}
		return $sTime;
	}

	/**
	 * 商談結果を論理削除する
	 * @param unknown $clientId	クライアントID
	 * @param unknown $staffId	担当者ID
	 * @throws Exception
	 */
	public function deletBDResult($id) {
		// 担当者を論理削除する
		$record["del_flg"] = 1;
//		$this->db->update('business_discussion_result', $record, "staff_type = '{$staff_type}' AND staff_id = {$staff_id} AND stime = '{$stime}'" );
		$this->db->update('business_discussion_result', $record, "id = '{$id}'" );
	}
	
	/**
	 * 商談結果取得条件を指定しカウントを取得する
	 * @param unknown $condition
	 * @param unknown $order
	 * @param unknown $ordertype
	 */
	public function getBDResultCount($condition) {
		$sql = "SELECT
					count(client_id) as count 
				FROM
					business_discussion_result
				WHERE
					del_flg = 0
					{$condition};
				";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn["count"];
	}
	
	
	/**
	 * 商談結果 取得条件を指定しリストを取得する
	 * @param unknown $condition
	 * @param unknown $order
	 * @param unknown $ordertype
	 */
	public function getBDResultList($condition, $order, $ordertype, $page, $limit) {
		$offset = 0;
		$page = $page - 1;
		if($page > 0){
			$offset = $page * $limit;
		}
		$sql = "SELECT
					id,
					staff_type,
					staff_id,
					client_id,
					stime,
					etime,
					TIMEDIFF(etime, stime) as video_time, 
					del_flg,
					template_id,
					next_action,
					possibility,
					sharing_memo,
					secret_comment,
					company_name,
					staff_name,
					client_service_id,
					executive,
					tel1,
					tel2,
					tel3,
					fax1,
					fax2,
					fax3,
					email,
					memo,
					create_date,
					update_date 
				FROM
					business_discussion_result
				WHERE
					del_flg = 0 AND
					etime IS NOT NULL AND
					{$condition}
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
	 * staff_type, staff_id, stimeを指定し商談結果を１件取得する
	 */
	public function getBDResultRow($condition){
		$sql = "SELECT
					id,
					staff_type,
					staff_id,
					client_id,
					stime,
					etime,
					TIMEDIFF(etime, stime) as video_time, 
					del_flg,
					template_id,
					next_action,
					possibility,
					sharing_memo,
					secret_comment,
					company_name,
					staff_name,
					client_service_id,
					executive,
					tel1,
					tel2,
					tel3,
					fax1,
					fax2,
					fax3,
					email,
					memo,
					create_date,
					update_date 
				FROM
					business_discussion_result
				WHERE
					{$condition} AND
					del_flg = 0;";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn;
	}
	
	/**
	 * 有効な商談結果を取得する。
	 *
	 * 有効とは下記の状態を指す。
	 * ・削除されていない商談結果であること。
	 * ・キーワードが指定されている場合、キーワードに一致、もしくは中間一致する商談結果。
	 *
	 * @param unknown $yy_mm
	 * @param unknown $keyword
	 * @return multitype:
	 */
	public function getLikeSearch($keyword) {
	
		$add_condi = '';
		if ($client_name != '') {
			$add_condi = " and (c1.company_name like '%{$keyword}%' or c1.staff_name like '%{$keyword}%' )";
		}
	
		$sql = "
		SELECT
			c1.client_id,
			c1.client_name,
			c1.create_date
		FROM
			business_discussion_result as c1
		WHERE
			c1.del_flg = 0 AND
			etime IS NOT NULL AND
			{$add_condi}
		";
	
		$result = $this->db->fetchAll($sql);
		return $result;
	}

	/**
	 * 条件を指定し商談結果の件数を取得する
	 * @param unknown $condition
	 * @param unknown $order
	 * @param unknown $ordertype
	 * @return unknown
	 */
	public function getBDResultListCount($condition) {
		$sql = "SELECT
					count(*) as count
				FROM
					business_discussion_result
				WHERE
					del_flg = 0  AND
					etime IS NOT NULL AND
					{$condition};
				";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn["count"];
	}
	
}