<?php
require_once ROOT.'library/Application/validation.php';

class FlashApiModel extends AbstractModel{

	private $db;		// DBコネクション

	function __construct($db){
		parent::init();
		$this->db = $db;
	}

	public function init() {
		// __constructでparent::init()を実行しなければ親の初期化が実行されない
		//parent::init();
	}

	public function createFlashPeerInfo($username, $identity) {
		$flashPeerInfoDao = Application_CommonUtil::getInstance("dao", "FlashPeerInfoDao", $this->db);

		$dict = array();
		$dict['username'] = $username;
		$dict['identity'] = $identity;
		
		// トランザクション開始
		$this->db->beginTransaction();
		try{
			$id = $flashPeerInfoDao->regist($dict);
			$this->db->commit();
		} catch (Exception $e) {
			$this->db->rollBack();
			throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
		}

		if (empty($id)) {
			return null;
		}

		$condition = "(username = '{$username}')";
		
		$flashPeerInfo = $flashPeerInfoDao->getFlashPeerInfo($condition);
		
		return $flashPeerInfo;
	}

	public function deleteFlashPeerInfo($username) {
		$flashPeerInfoDao = Application_CommonUtil::getInstance("dao", "FlashPeerInfoDao", $this->db);

		$condition = "(username = '{$username}')";

		// トランザクション開始
		$this->db->beginTransaction();
		try{
			$flashPeerInfoDao->remove($condition);
			$this->db->commit();
		} catch (Exception $e) {
			$this->db->rollBack();
			throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
		}
	}

	public function getFlashPeerInfo($username) {
		$flashPeerInfoDao = Application_CommonUtil::getInstance("dao", "FlashPeerInfoDao", $this->db);

		$condition = "(username = '{$username}')";
		
		$flashPeerInfo = $flashPeerInfoDao->getFlashPeerInfo($condition);
		
		return $flashPeerInfo;
	}
}
