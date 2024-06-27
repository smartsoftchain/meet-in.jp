<?php
require_once ROOT.'library/Application/validation.php';

class ChatDetailModel extends AbstractModel{

	private $db;		// DBコネクション

	function __construct($db){
		parent::init();
		$this->db = $db;
	}

	public function init() {
		// __constructでparent::init()を実行しなければ親の初期化が実行されない
		//parent::init();
	}

	public function createChatDetail($connectionInfo, $user_id, $uu_id, $message) {
		$chatDetailDao = Application_CommonUtil::getInstance("dao", "ChatDetailDao", $this->db);
error_log("createChatDetail UUID=[".$uu_id."]\n", 3, "/var/tmp/negotiation.log");

		$dict = array();
		$dict['connection_info_id'] = $connectionInfo['id'];
		$dict['room_name'] = $connectionInfo['room_name'];
		$dict['collabo_id'] = $connectionInfo['collabo_id'];
		$dict['user_id'] = $user_id;
		$dict['uuid'] = $uu_id;
		$dict['message'] = $message;

		// トランザクション開始
		$this->db->beginTransaction();
		try{
			$id = $chatDetailDao->regist($dict);
			$this->db->commit();
		}
		catch (Exception $e) {
			$this->db->rollBack();
			throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
		}

		if (empty($id)) {
			return null;
		}

		$condition = "(id = '{$id}')";
		$chatDetail = $chatDetailDao->getFlashPeerInfo($condition);
		return $chatDetail;
	}

	public function deleteChatDetail($connection_info_id) {
		$chatDetailDao = Application_CommonUtil::getInstance("dao", "ChatDetailDao", $this->db);

		$condition = "(connection_info_id = '{$connection_info_id}')";

		// トランザクション開始
		$this->db->beginTransaction();
		try{
			$chatDetailDao->remove($condition);
			$this->db->commit();
		}
		catch (Exception $e) {
			$this->db->rollBack();
			throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
		}
	}

	public function getChatDetail($connection_info_id) {
		$chatDetailDao = Application_CommonUtil::getInstance("dao", "ChatDetailDao", $this->db);

		$condition = "connection_info_id = '{$connection_info_id}'";
		$chatDetail = $chatDetailDao->getChatDetail($condition);

		return json_encode($chatDetail);
	}
}
