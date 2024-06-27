<?php
require_once ROOT.'library/Application/validation.php';

class McuInfoModel extends AbstractModel{

	private $db;		// DBコネクション

	function __construct($db){
		parent::init();
		$this->db = $db;
	}

	public function init() {
		// __constructでparent::init()を実行しなければ親の初期化が実行されない
		//parent::init();
	}

	/**
	 * MCUサーバ情報抽出
	 *
	 * ルーム名で紐づくMCUサーバ情報を取得する
	 *  ・存在すれば、取得したサーバ情報を返す
	 *  ・存在しなければ、サーバ情報よりルーム数の少ないMCUサーバを抽出する
	 *    -> 抽出したMCUサーバ情報に紐づくMCUルーム情報を追加する
	 */
	public function getMcuServerInfoByRoom($room_name) {

		$mcuInfoDao = Application_CommonUtil::getInstance("dao", "McuInfoDao", $this->db);
		$mcuRoomInfoDao = Application_CommonUtil::getInstance("dao", "McuRoomInfoDao", $this->db);

		// ルーム名で紐づくMCUサーバ情報を取得する
		$condition = "room_name = '{$room_name}'";
		$mcuInfo = $mcuInfoDao->getMcuServerByRoomName($condition);
		// 存在すれば、取得したサーバ情報を返す

		// トランザクション開始
		$this->db->beginTransaction();
		try{
			if( $mcuInfo ) {
			}
			else {
// $this->_logger->debug("getMcuServerInfoByRoom mcuInfoDao->getMcuServer ■■■■■■");
				// 存在しなければ、サーバ情報よりルーム数の少ないMCUサーバを抽出する
				$mcuInfo = $mcuInfoDao->getMcuServer();

				/**
				 * 抽出したMCUサーバ情報に紐づくMCUルーム情報を追加する
				 */
				$dict = array();
				$dict['mcu_info_id'] = $mcuInfo[0]["id"];
				$dict['room_name'] = $room_name;
				$id = $mcuRoomInfoDao->regist($dict);
				// $this->_logger->debug("getMcuServerInfoByRoom mcuRoomInfoDao->regist id=[". $id ."]");

				// ルーム数＆アクセス数UP
				$room_cnt = $mcuInfo[0]["room_cnt"] + 1;	// room+1 UP
				$ret = $mcuInfoDao->updateMcuServer($mcuInfo[0]["id"], $room_cnt, $mcuInfo[0]["access_cnt"]);
			}
			$this->db->commit();
		}
		catch (Exception $e) {
			$this->db->rollBack();
			$this->_logger->error("getMcuServerInfoByRoom Exception ret=[". $e->getMessage() ."]");
		}
		return ($mcuInfo[0]);
	}

	/**
	 * MCUサーバ情報更新
	 */
	public function updateMcuServerInfo($room_name) {

		$mcuInfoDao = Application_CommonUtil::getInstance("dao", "McuInfoDao", $this->db);
		$mcuRoomInfoDao = Application_CommonUtil::getInstance("dao", "McuRoomInfoDao", $this->db);

		// ルーム名で紐づくMCUサーバ情報を取得する
		$condition = "room_name = '{$room_name}'";
		$mcuInfo = $mcuInfoDao->getMcuServerByRoomName($condition);

		// トランザクション開始
		$this->db->beginTransaction();
		try{
			if( $mcuInfo ){
				// アクセス数をUP
				$access_cnt = $mcuInfo[0]["access_cnt"] + 1;	// access+1 UP
				$ret = $mcuInfoDao->updateMcuServer($mcuInfo[0]["id"], $mcuInfo[0]["room_cnt"], $access_cnt);
				$this->_logger->debug("updateMcuServerInfo mcuRoomInfoDao->updateMcuServer ret=[". $ret ."]");

				/**
				 * 抽出したMCUサーバ情報に紐づくMCUルーム情報を更新する
				 */
				$dict = array();
				$dict['room_name'] = $room_name;
				$ret = $mcuRoomInfoDao->update($dict ,$condition);
				$this->_logger->debug("updateMcuServerInfo mcuRoomInfoDao->update ★★★★★ ret=[". $ret ."]");
			}
			else {
				$this->_logger->warn("updateMcuServerInfo room_name not found room_name=[". $room_name ."]");
			}
			$this->db->commit();
		}
		catch (Exception $e) {
			$this->db->rollBack();
			$this->_logger->error("updateMcuServerInfo Exception ret=[". $e->getMessage() ."]");
		}
		return ($mcuInfo[0]);
	}

	/**
	 * MCUサーバ情報取得
	 */
	public function getMcuServerInfoList() {
		// $this->_logger->debug("getMcuServerInfoList START");
		$mcuInfoDao = Application_CommonUtil::getInstance("dao", "McuInfoDao", $this->db);
		// ルーム名で紐づくMCUサーバ情報を取得する
		$mcuInfoList = $mcuInfoDao->getMcuServerlist();
		// $this->_logger->debug("getMcuServerInfoList END");
		return $mcuInfoList;
	}

	/**
	 * MCURom情報削除
	 */
	public function deleteMcuRoom($room_name) {

		$mcuRoomInfoDao = Application_CommonUtil::getInstance("dao", "McuRoomInfoDao", $this->db);

		// ルーム名
		$condition = "room_name = '{$room_name}'";

		// トランザクション開始
		$this->db->beginTransaction();
		try{
			$mcuRoomInfoDao->remove($condition);
			$this->db->commit();
		}
		catch (Exception $e) {
			$this->db->rollBack();
			$this->_logger->error("updateMcuServerInfo Exception ret=[". $e->getMessage() ."]");
		}
		return 0;
	}

	public function isAvaliableToMcuConnectionInfo($room_name) {
// $this->_logger->debug("isAvaliableToMcuConnectionInfo room_name=[". $room_name ."]");

		$mcuRoomInfoDao = Application_CommonUtil::getInstance("dao", "McuRoomInfoDao", $this->db);
		$condition = "room_name='{$room_name}' AND TIMESTAMPDIFF(SECOND, connect_datetime, now()) > 30";

		$count = $mcuRoomInfoDao->getMcuRoomInfCount($condition);
// $this->_logger->debug("isAvaliableToMcuConnectionInfo count=(". $count .")");
		if ($count <= 0) {
			return false;
		}
		return true;
	}


}