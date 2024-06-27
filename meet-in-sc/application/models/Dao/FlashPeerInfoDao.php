<?php

/**
 * FlashPeerInfo クラス
 *
 * FlashのPeer情報を扱うDaoクラス
 *
 * @version 2016/11/24 17:54 李
 * @package Dao
*/
class FlashPeerInfoDao extends AbstractDao {
	
	private $db;
	function __construct($db){
		parent::init();
		$this->db = $db;
	}

	/**
	 * 登録
	 * Enter description here ...
	 * @param unknown_type $form
	 * @throws Exception
	 */
	public function regist($dict) {
		$record = array(
				'username'								=> $dict['username'],
				'identity'								=> $dict['identity'],
				'created_datetime'						=> new Zend_Db_Expr('now()'),
				'updated_datetime'						=> new Zend_Db_Expr('now()'),
		);
		$id = $this->db->insert('flash_peer_info', $record);
		
		return $this->db->lastInsertId('flash_peer_info', 'id');
	}

	public function update($dict, $condition) {
		$dict['updated_datetime'] = new Zend_Db_Expr('now()');
		$n = $this->db->update('flash_peer_info', $dict, $condition);
		
		return $n;
	}

	public function remove($condition) {
		$n = $this->db->delete('flash_peer_info', $condition);
		
		return $n;
	}

	/**
	 * ログのカウント取得
	 * @param unknown $talkBindId
	 * @param unknown $clientId
	 * @return unknown
	 */
	public function getFlashPeerInfoCount($condition){
		$sql = "
			SELECT
				COUNT(*) as count 
			FROM
				flash_peer_info
			WHERE
				{$condition};";
				
		$res = $this->db->fetchRow($sql);
		$count = $res["count"];
		
		return $count;
	}

	/**
	 * ログ取得
	 * @param unknown $talkBindId
	 * @param unknown $clientId
	 * @return unknown
	 */
	public function getFlashPeerInfo($condition){
		$sql = "
			SELECT 
				username,
				identity,
				created_datetime,
				updated_datetime
			FROM
				flash_peer_info 
			WHERE 
				{$condition} 
			;";

		$rtn = $this->db->fetchRow($sql, array());
		return $rtn;
	}
	
	/**
	 * ログ取得
	 * @param unknown $talkBindId
	 * @param unknown $clientId
	 * @return unknown
	 */
	public function getFlashPeerInfoList($condition, $order, $ordertype, $page, $limit){
		
		$offset = 0;
		$page = $page - 1;
		if($page > 0){
			$offset = $page * $limit;
		}
		
		$sql = "
			SELECT 
				username,
				identity,
				created_datetime,
				updated_datetime
			FROM
				flash_peer_info 
			WHERE 
				{$condition} 
			ORDER BY  
				{$order} {$ordertype}
			LIMIT 
				{$limit}
			OFFSET 
				{$offset};";

		$res = $this->db->fetchAll($sql);
		return $res;
	}


/*
///////////////////////////////////////////////////////
// flash_peer_infoのテーブル定義
///////////////////////////////////////////////////////

DROP TABLE IF EXISTS `flash_peer_info`;
CREATE TABLE flash_peer_info (
    username varchar(255) COLLATE utf8_unicode_ci,
    identity varchar(255) COLLATE utf8_unicode_ci,
    created_datetime DATETIME,
    updated_datetime DATETIME,
    PRIMARY KEY (username)
);
CREATE INDEX flash_peer_info_updated_datetime ON flash_peer_info (updated_datetime ASC);

*/
}
?>