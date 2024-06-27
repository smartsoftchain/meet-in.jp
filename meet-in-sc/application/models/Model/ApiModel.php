<?php
require_once ROOT.'library/Application/validation.php';

class ApiModel extends AbstractModel{

	const WEBRTC_PARAM_IDENTIFIER = 						"WEBRTC_PARAM";
	const CONNECT_NO_VALID_DATE = 7;
//	const MAX_CONNECT_NO = 101;	// 固定番号１個と一時番号１００個
	const MAX_CONNECT_NO = 99999999;	// 固定番号１個と一時番号１００個
	const MAX_TRY_GENERATOR_CONNECT_NO = 1000;

	private $db;		// DBコネクション
	private $clientId;

	function __construct($db){
		parent::init();
		$this->db = $db;
		$this->clientId = $this->user["client_id"];
	}

	public function init() {
		// __constructでparent::init()を実行しなければ親の初期化が実行されない
		//parent::init();
	}

	public function getWebRtcParam() {
		$session = Application_CommonUtil::getSession(self::WEBRTC_PARAM_IDENTIFIER);

		$data = array();
		foreach($session as $key => $val) {
			$data[$key] = $val;
		}
//error_log("getWebRtcParam() data=[".json_encode($data)."]\n", 3, "/var/tmp/negotiation.log");
		return $data;
	}

	public function saveWebRtcParam($form) {
		$session = Application_CommonUtil::getSession(self::WEBRTC_PARAM_IDENTIFIER);

		// パラメータをセッションに格納
		foreach($form as $key=>$val){
			$session->$key = $val;
		}

// DEBUG
//		$data = array();
//		foreach($session as $key => $val) {
//			$data[$key] = $val;
//		}
//error_log("saveWebRtcParam(form) data=[".json_encode($data)."]\n", 3, "/var/tmp/negotiation.log");
	}
	
	public function clearWebRtcParam() {
//error_log("clearWebRtcParam \n", 3, "/var/tmp/negotiation.log");
		Application_CommonUtil::unsetSession(self::WEBRTC_PARAM_IDENTIFIER);
	}

	// 接続番号の払出し方法がまだ決まっていない！！！
	private function createConnectNo($preCode, $companyCode) {
		$preCode = "0".sprintf('%1d', rand(1, 3))."0";
		$randomNo = sprintf('%04d', rand(0, 9999));

		return "{$preCode}{$randomNo}{$companyCode}";
	}

	public function isAvaliableToCreateNewConnectionInfo($clientId, $staffType, $staffId) {
		$connectionInfoDao = Application_CommonUtil::getInstance("dao", "ConnectionInfoDao", $this->db);
	
		if ("AA" == $staffType) {
			$condition = "((operator_staff_type = '{$staffType}') AND (operator_staff_id = '{$staffId}')) AND (connection_state <> 5) AND (DATEDIFF(now(),  created_datetime) <= ".self::CONNECT_NO_VALID_DATE.")";
		} else {
			$condition = "((operator_client_id = '{$clientId}') AND (operator_staff_type = '{$staffType}') AND (operator_staff_id = '{$staffId}')) AND (connection_state <> 5) AND (DATEDIFF(now(),  created_datetime) <= ".self::CONNECT_NO_VALID_DATE.")";
		}
		$count = $connectionInfoDao->getConnectionInfoCount($condition);
		if ($count >= self::MAX_CONNECT_NO) {
			return false;
		}
		
		return true;
	}
	
// 	public function createNewConnectionInfo($preCode, $companyCode, $connect_no, $operatorPeerId, $userPeerId, $clientId, $staffType, $staffId) {
// 		$connectionInfoDao = Application_CommonUtil::getInstance("dao", "ConnectionInfoDao", $this->db);

// 		if (!empty($connect_no)) {
// 			$condition = "(connect_no = '{$connect_no}') AND connection_state <> 5";
// 			$count = $connectionInfoDao->getConnectionInfoCount($condition);
		
// 			if ($count > 0) {
// 				return null;
// 			}
// 		} else {
// 			for ($i = 0; $i < self::MAX_TRY_GENERATOR_CONNECT_NO; $i++) {
// 				$connect_no = $this->createConnectNo($preCode, $companyCode);
// 				$condition = "(connect_no = '{$connect_no}') AND connection_state <> 5";
// 				$count = $connectionInfoDao->getConnectionInfoCount($condition);
			
// 				if ($count < 1) {
// 					break;
// 				}
// 			}
// 		}

// 		$dict = array();
// 		$dict['connect_no'] = $connect_no;

// 		if (!empty($operatorPeerId)) {
// 			$dict['operator_peer_id'] = $operatorPeerId;
// 			$dict['connection_state'] = 0;
// 		} else if (!empty($userPeerId)) {
// 			$dict['user_peer_id_1'] = $userPeerId;
// 			$dict['connection_state'] = 2;
// 		} else {
// 			$dict['connection_state'] = 0;
// 		}

// 		$dict['connection_request_start_datetime'] = new Zend_Db_Expr('now()');
// //		$dict['connection_start_datetime'] = "";
// //		$dict['connection_stop_datetime'] = "";

// 		$dict['operator_client_id'] = $clientId;
// 		$dict['operator_staff_type'] = $staffType;
// 		$dict['operator_staff_id'] = $staffId;
		
// 		// トランザクション開始
// 		$this->db->beginTransaction();
// 		try{
// 			$id = $connectionInfoDao->regist($dict);
// 			$this->db->commit();
// 		} catch (Exception $e) {
// 			$this->db->rollBack();
// 			throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
// 		}
		
// 		if (empty($id)) {
// 			return null;
// 		}

// 		$condition = "(id = '{$id}')";
// 		$connectionInfo = $connectionInfoDao->getConnectionInfo($condition);

// 		return $connectionInfo;
// 	}

	// public function createEmptyConnectionInfo($connect_no, $clientId, $staffType, $staffId) {
	// 	$connectionInfoDao = Application_CommonUtil::getInstance("dao", "ConnectionInfoDao", $this->db);
		
	// 	$dict = array();
	// 	$dict['connect_no'] = $connect_no;
	// 	$dict['operator_client_id'] = $clientId;
	// 	$dict['operator_staff_type'] = $staffType;
	// 	$dict['operator_staff_id'] = $staffId;
	// 	$dict['connection_state'] = 0;
		
	// 	// トランザクション開始
	// 	$this->db->beginTransaction();
	// 	try{
	// 		$id = $connectionInfoDao->regist($dict);
	// 		$this->db->commit();
	// 	} catch (Exception $e) {
	// 		$this->db->rollBack();
	// 		throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
	// 	}
		
	// 	if (empty($id)) {
	// 		return null;
	// 	}

	// 	$condition = "(id = '{$id}')";
	// 	$connectionInfo = $connectionInfoDao->getConnectionInfo($condition);

	// 	return $connectionInfo;
	// }

	// public function cloneConnectionInfo($connectionInfoId) {
	// 	$connectionInfoDao = Application_CommonUtil::getInstance("dao", "ConnectionInfoDao", $this->db);

	// 	$condition = "(id = '{$connectionInfoId}')";
	// 	$connectionInfo = $connectionInfoDao->getConnectionInfo($condition);
	// 	if (empty($connectionInfo)) {
	// 		return null;
	// 	}
		
	// 	$dict = array();
	// 	$dict['connect_no'] = $connectionInfo['connect_no'];
	// 	$dict['connection_state'] = 0;
	// 	$dict['operator_client_id'] = $connectionInfo['operator_client_id'];
	// 	$dict['operator_staff_type'] = $connectionInfo['operator_staff_type'];
	// 	$dict['operator_staff_id'] = $connectionInfo['operator_staff_id'];
	// 	$dict['created_datetime'] = $connectionInfo['created_datetime'];
	// 	$dict['updated_datetime'] = $connectionInfo['updated_datetime'];

	// 	// トランザクション開始
	// 	$this->db->beginTransaction();
	// 	try{
	// 		$id = $connectionInfoDao->regist($dict);
	// 		$this->db->commit();
	// 	} catch (Exception $e) {
	// 		$this->db->rollBack();
	// 		throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
	// 	}
		
	// 	if (empty($id)) {
	// 		return null;
	// 	}

	// 	$condition = "(id = '{$id}')";
		
	// 	$connectionInfo = $connectionInfoDao->getConnectionInfo($condition);
	// 	return $connectionInfo;
	// }

	public function callConnectionInfo($connect_no, $operatorPeerId, $userPeerId) {

		//トランザクション分離レベル変更
		// MySQLのでデフォルトだとREPEATABLE-READのため
		// (※レコードを更新しトランザクションを確定しても、他のDBセッションから確定後の値を参照することが出来ないため)
		$this->db->exec("SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED");

		$connectionInfoDao = Application_CommonUtil::getInstance("dao", "ConnectionInfoDao", $this->db);

		$dict = array();
 		$condition = "(connect_no = '{$connect_no}') ";

		if (!empty($operatorPeerId)) {
			$dict['operator_peer_id'] = $operatorPeerId;

			$condition .= " AND (connection_state <> 5) ";
		} else {
			$dict['user_peer_id_1'] = $userPeerId;
error_log("callConnectionInfo user_peer_id_1(".$userPeerId.")\n", 3, "/var/tmp/negotiation.log");
			$condition .= " AND (connection_state <> 5) ";
		}

		// トランザクション開始
		$this->db->beginTransaction();
		try{
			$count = $connectionInfoDao->update($dict, $condition);
			if ($count > 0) {
				$this->db->commit();
			}
			else {
				$this->db->rollBack();
			}
			// 更新後の情報を取得
			$connectionInfo = $connectionInfoDao->getConnectionInfo($condition);
		} catch (Exception $e) {
			$this->db->rollBack();
			throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
		}

		return $connectionInfo;
	}

	public function updateConnectionInfoPeerId($id, $userId, $peerId, $loginFlg) {

		if (isset($peerId) && strlen($peerId) == 0) {
			$peerId = null;
			$loginFlg = 0;
		}

		$dict = array();
		if (0 == $userId) {
			$dict['operator_peer_id'] = $peerId;
		} else if (1 == $userId) {
			$dict['user_peer_id_1'] = $peerId;
			$dict['login_flg1'] = $loginFlg;
			$dict['connect_datetime1'] = new Zend_Db_Expr('now()');
error_log("★★★updateConnectionInfoPeerId user_peer_id_1(".$peerId.")\n", 3, "/var/tmp/negotiation.log");
		} else if (2 == $userId) {
			$dict['user_peer_id_2'] = $peerId;
			$dict['login_flg2'] = $loginFlg;
			$dict['connect_datetime2'] = new Zend_Db_Expr('now()');
		} else if (3 == $userId) {
			$dict['user_peer_id_3'] = $peerId;
			$dict['login_flg3'] = $loginFlg;
			$dict['connect_datetime3'] = new Zend_Db_Expr('now()');
		} else if (4 == $userId) {
			$dict['user_peer_id_4'] = $peerId;
			$dict['login_flg4'] = $loginFlg;
			$dict['connect_datetime4'] = new Zend_Db_Expr('now()');
		} else if (5 == $userId) {
			$dict['user_peer_id_5'] = $peerId;
			$dict['login_flg5'] = $loginFlg;
			$dict['connect_datetime5'] = new Zend_Db_Expr('now()');
		} else if (6 == $userId) {
			$dict['user_peer_id_6'] = $peerId;
			$dict['login_flg6'] = $loginFlg;
			$dict['connect_datetime6'] = new Zend_Db_Expr('now()');
		} else if (7 == $userId) {
			$dict['user_peer_id_7'] = $peerId;
			$dict['login_flg7'] = $loginFlg;
			$dict['connect_datetime7'] = new Zend_Db_Expr('now()');
		} else if (8 == $userId) {
			$dict['user_peer_id_8'] = $peerId;
			$dict['login_flg8'] = $loginFlg;
			$dict['connect_datetime8'] = new Zend_Db_Expr('now()');
		} else {
			return null;
		}
 		$condition = "(id = '{$id}') ";

		//トランザクション分離レベル変更
		// MySQLのでデフォルトだとREPEATABLE-READのため
		// (※レコードを更新しトランザクションを確定しても、他のDBセッションから確定後の値を参照することが出来ないため)
		$this->db->exec("SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED");

		$connectionInfoDao = Application_CommonUtil::getInstance("dao", "ConnectionInfoDao", $this->db);

		// トランザクション開始
		$this->db->beginTransaction();
		try{
			$count = $connectionInfoDao->update($dict, $condition);
			if ($count > 0) {
				$this->db->commit();
			}
			else {
				$this->db->rollBack();
			}
			$connectionInfo = $connectionInfoDao->getConnectionInfo($condition);
		} catch (Exception $e) {
			$this->db->rollBack();
			throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
		}
		return $connectionInfo;
	}

	public function updateConnectionInfoLogin($id, $userId, $loginFlg) {

		$dict = array();
		switch($userId) {
			case 1:
				$dict['login_flg1'] = $loginFlg;
				break;
			case 2:
				$dict['login_flg2'] = $loginFlg;
				break;
			case 3:
				$dict['login_flg3'] = $loginFlg;
				break;
			case 4:
				$dict['login_flg4'] = $loginFlg;
				break;
			case 5:
				$dict['login_flg5'] = $loginFlg;
				break;
			case 6:
				$dict['login_flg6'] = $loginFlg;
				break;
			case 7:
				$dict['login_flg7'] = $loginFlg;
				break;
			case 8:
				$dict['login_flg8'] = $loginFlg;
				break;
			default:
				return null;
		}
		$condition = "(id = '{$id}') ";

		//トランザクション分離レベル変更
		// MySQLのでデフォルトだとREPEATABLE-READのため
		// (※レコードを更新しトランザクションを確定しても、他のDBセッションから確定後の値を参照することが出来ないため)
		$this->db->exec("SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED");

		$connectionInfoDao = Application_CommonUtil::getInstance("dao", "ConnectionInfoDao", $this->db);
		// トランザクション開始
		$this->db->beginTransaction();
		try{
			$count = $connectionInfoDao->update($dict, $condition);
			if ($count > 0) {
				$this->db->commit();
			}
			else {
				$this->db->rollBack();
			}
			$connectionInfo = $connectionInfoDao->getConnectionInfo($condition);
		} catch (Exception $e) {
			$this->db->rollBack();
			throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
		}
		return $connectionInfo;
	}

	private function createConnectionInfo($params) {
		//トランザクション分離レベル変更
		// MySQLのでデフォルトだとREPEATABLE-READのため
		// (※レコードを更新しトランザクションを確定しても、他のDBセッションから確定後の値を参照することが出来ないため)
		$this->db->exec("SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED");

		$connectionInfoDao = Application_CommonUtil::getInstance("dao", "ConnectionInfoDao", $this->db);

		// トランザクション開始
		$this->db->beginTransaction();
		try{
			$id = $connectionInfoDao->regist($params);
			$this->db->commit();
		} catch (Exception $e) {
			$this->db->rollBack();
			throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
		}
		
		if (empty($id)) {
			return null;
		}

		$condition = "(id = '{$id}')";
		$connectionInfo = $connectionInfoDao->getConnectionInfo($condition);

		return $connectionInfo;
	}

	public function getRoomInfo($room_name, $collabo_id) {
		//トランザクション分離レベル変更
		// MySQLのでデフォルトだとREPEATABLE-READのため
		// (※レコードを更新しトランザクションを確定しても、他のDBセッションから確定後の値を参照することが出来ないため)
		$this->db->exec("SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED");

		$connectionInfoDao = Application_CommonUtil::getInstance("dao", "ConnectionInfoDao", $this->db);
		$connectionInfo = array();
		if(!empty($room_name)) {
			$condition = "(room_name = '{$room_name}') AND (collabo_id = '{$collabo_id}')";
			$connectionInfo = $connectionInfoDao->getConnectionInfo($condition);
			if(!empty($connectionInfo)) {
				return $connectionInfo;
			}
		}
		// 新規作成
		$connectionInfo = $this->createConnectionInfo(
			array(
				'connect_no' => '99999999999',
				'connection_state' => 0,
				'room_name' => $room_name,
				'collabo_id' => $collabo_id
			)
		);
		return $connectionInfo;
	}

	// 他のアカウントが使用中かどうか
	public function existRoomName($form) {
		$condition = "";
		$connectionInfo = "";
		$result = array(
			'result' => false,
		);
		if(isset($form["room_name"]) && isset($form["collabo_id"])) {
			$condition = "(room_name = '{$form["room_name"]}') AND (collabo_id = '{$form["collabo_id"]}')";
		}

		if(!empty($condition)) {
			//トランザクション分離レベル変更
			// MySQLのでデフォルトだとREPEATABLE-READのため
			// (※レコードを更新しトランザクションを確定しても、他のDBセッションから確定後の値を参照することが出来ないため)
			$this->db->exec("SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED");

			$connectionInfoDao = Application_CommonUtil::getInstance('dao', "ConnectionInfoDao", $this->db);
			$connectionInfo = $connectionInfoDao->getConnectionInfo($condition);
		}
		if(!empty($connectionInfo)) {
			$result["result"] = true;
		}
		return json_encode($result);
	}

	public function getConnectionInfo($id) {
		//トランザクション分離レベル変更
		// MySQLのでデフォルトだとREPEATABLE-READのため
		// (※レコードを更新しトランザクションを確定しても、他のDBセッションから確定後の値を参照することが出来ないため)
		$this->db->exec("SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED");

		$connectionInfoDao = Application_CommonUtil::getInstance("dao", "ConnectionInfoDao", $this->db);
		$condition = "(id = '{$id}')";

		$connectionInfo = $connectionInfoDao->getConnectionInfo($condition);
		return $connectionInfo;
	}

	public function getConnectionInfoByConnectNo($connect_no) {
		//トランザクション分離レベル変更
		// MySQLのでデフォルトだとREPEATABLE-READのため
		// (※レコードを更新しトランザクションを確定しても、他のDBセッションから確定後の値を参照することが出来ないため)
		$this->db->exec("SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED");

		$connectionInfoDao = Application_CommonUtil::getInstance("dao", "ConnectionInfoDao", $this->db);
		$condition = "(connect_no = '{$connect_no}') AND (connection_state <> 5) AND (connection_state <> 6) ORDER BY created_datetime DESC";
		$connectionInfo = $connectionInfoDao->getConnectionInfo($condition);
		return $connectionInfo;
	}

	public function startConnectionInfo($id) {
		//トランザクション分離レベル変更
		// MySQLのでデフォルトだとREPEATABLE-READのため
		// (※レコードを更新しトランザクションを確定しても、他のDBセッションから確定後の値を参照することが出来ないため)
		$this->db->exec("SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED");

		$connectionInfoDao = Application_CommonUtil::getInstance("dao", "ConnectionInfoDao", $this->db);

		$dict = array();
		$dict["connection_state"] = 3;
		$dict['connection_start_datetime'] = new Zend_Db_Expr('now()');
 		$condition = "(id = '{$id}') AND (connection_state IN (0, 1, 2, 3))";

		// トランザクション開始
		$this->db->beginTransaction();
		try{
			$count = $connectionInfoDao->update($dict, $condition);
			if ($count > 0) {
				$this->db->commit();
				return $count;
			} else {
				$dict = array();
				$dict["connection_state"] = 3;
		 		$condition = "(id = '{$id}') AND (connection_state = 4)";
				$count = $connectionInfoDao->update($dict, $condition);
				if ($count > 0) {
					$this->db->commit();
					return $count;
				}
			}
			$this->db->rollBack();
		} catch (Exception $e) {
			$this->db->rollBack();
			throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
		}
	}

	public function stopConnectionInfo($id) {
		//トランザクション分離レベル変更
		// MySQLのでデフォルトだとREPEATABLE-READのため
		// (※レコードを更新しトランザクションを確定しても、他のDBセッションから確定後の値を参照することが出来ないため)
		$this->db->exec("SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED");

		$connectionInfoDao = Application_CommonUtil::getInstance("dao", "ConnectionInfoDao", $this->db);

		$dict = array();
		$dict["connection_state"] = 4;
		$dict['connection_stop_datetime'] = new Zend_Db_Expr('now()');
 		$condition = "(id = '{$id}') AND (connection_state <> 5) ";

		// トランザクション開始
		$this->db->beginTransaction();
		try{
			$count = $connectionInfoDao->update($dict, $condition);
			if ($count > 0) {
				$this->db->commit();
				return $count;
			}
			$this->db->rollBack();
		} catch (Exception $e) {
			$this->db->rollBack();
			throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
		}
	}

	public function closeConnectionInfo($id) {
		//トランザクション分離レベル変更
		// MySQLのでデフォルトだとREPEATABLE-READのため
		// (※レコードを更新しトランザクションを確定しても、他のDBセッションから確定後の値を参照することが出来ないため)
		$this->db->exec("SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED");

		$connectionInfoDao = Application_CommonUtil::getInstance("dao", "ConnectionInfoDao", $this->db);

		$dict = array();
		$dict["connection_state"] = 3;
		$condition = "(id = '{$id}') ";

		// コネクション状態確認
		// 接続ピアIDが1以下の場合は状態を切断(5)にする
		$connectionInfo = $connectionInfoDao->getConnectionInfo($condition);
		$cnt = 0;
		if (!empty($connectionInfo)) {
			if ($connectionInfo["operator_peer_id"] != null) {
				$cnt++;
			} else if ($connectionInfo["user_peer_id_1"] != null) {
				$cnt++;
			} else if ($connectionInfo["user_peer_id_2"] != null) {
				$cnt++;
			} else if ($connectionInfo["user_peer_id_3"] != null) {
				$cnt++;
			} else if ($connectionInfo["user_peer_id_4"] != null) {
				$cnt++;
			} else if ($connectionInfo["user_peer_id_5"] != null) {
				$cnt++;
			} else if ($connectionInfo["user_peer_id_6"] != null) {
				$cnt++;
			} else if ($connectionInfo["user_peer_id_7"] != null) {
				$cnt++;
			} else if ($connectionInfo["user_peer_id_8"] != null) {
				$cnt++;
			}
		}
 		if( $cnt < 1 ) {
			$dict["connection_state"] = 5;
		}

		// トランザクション開始
		$this->db->beginTransaction();
		try{
			$count = $connectionInfoDao->update($dict, $condition);
			if ($count > 0) {
				$this->db->commit();
				return $count;
			}
			$this->db->rollBack();
		} catch (Exception $e) {
			$this->db->rollBack();
			throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
		}
	}

	public function finishConnectionInfo($id) {
		//トランザクション分離レベル変更
		// MySQLのでデフォルトだとREPEATABLE-READのため
		// (※レコードを更新しトランザクションを確定しても、他のDBセッションから確定後の値を参照することが出来ないため)
		$this->db->exec("SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED");
error_log("finishConnectionInfo\n", 3, "/var/tmp/negotiation.log");

		$connectionInfoDao = Application_CommonUtil::getInstance("dao", "ConnectionInfoDao", $this->db);

		$condition = "(id = '{$id}')";
		$connectionInfo = $connectionInfoDao->getConnectionInfo($condition);
		if (empty($connectionInfo)) {
			return null;
		}

		$connect_no = $connectionInfo['connect_no'];
		$condition = "(connect_no = '{$connect_no}') AND connection_state = 0 AND operator_peer_id IS NULL";

		// トランザクション開始
		$this->db->beginTransaction();
		try{
			$cnt = $connectionInfoDao->deleteConnectionInfo($condition);
			$this->db->commit();
			return $cnt;
		} catch (Exception $e) {
			$this->db->rollBack();
			throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
		}
	}

	public function updateUnexpireConnectionInfoPeerId($clientId, $staffType, $staffId, $operatorPeerId) {
		//トランザクション分離レベル変更
		// MySQLのでデフォルトだとREPEATABLE-READのため
		// (※レコードを更新しトランザクションを確定しても、他のDBセッションから確定後の値を参照することが出来ないため)
		$this->db->exec("SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED");

		$connectionInfoDao = Application_CommonUtil::getInstance("dao", "ConnectionInfoDao", $this->db);

		$dict = array();
		if ("AA" == $staffType) {
 			$condition = "((operator_staff_type = '{$staffType}') AND (operator_staff_id = '{$staffId}')) AND (connection_state <> 5) AND (DATEDIFF(now(),  created_datetime) <= ".self::CONNECT_NO_VALID_DATE.")";
		} else {
 			$condition = "((operator_client_id = '{$clientId}') AND (operator_staff_type = '{$staffType}') AND (operator_staff_id = '{$staffId}')) AND (connection_state <> 5) AND (DATEDIFF(now(),  created_datetime) <= ".self::CONNECT_NO_VALID_DATE.")";
 		}

		$dict['operator_peer_id'] = $operatorPeerId;

		// トランザクション開始
		$this->db->beginTransaction();
		try{
			$count = $connectionInfoDao->update($dict, $condition);
			if ($count > 0) {
				$this->db->commit();
				return $count;
			}
			$this->db->rollBack();
		} catch (Exception $e) {
			$this->db->rollBack();
			throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
		}
		return $count;
	}

	public function closeExpireConnectionInfo($clientId, $staffType, $staffId) {
		//トランザクション分離レベル変更
		// MySQLのでデフォルトだとREPEATABLE-READのため
		// (※レコードを更新しトランザクションを確定しても、他のDBセッションから確定後の値を参照することが出来ないため)
		$this->db->exec("SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED");

		$connectionInfoDao = Application_CommonUtil::getInstance("dao", "ConnectionInfoDao", $this->db);

		$dict = array();
		$dict["connection_state"] = 5;
		if ("AA" == $staffType) {
 			$condition = "((operator_staff_type = '{$staffType}') AND (operator_staff_id = '{$staffId}')) AND (connection_state <> 5) AND (DATEDIFF(now(),  created_datetime) > ".self::CONNECT_NO_VALID_DATE.")";
		} else {
 			$condition = "((operator_client_id = '{$clientId}') AND (operator_staff_type = '{$staffType}') AND (operator_staff_id = '{$staffId}')) AND (connection_state <> 5) AND (DATEDIFF(now(),  created_datetime) > ".self::CONNECT_NO_VALID_DATE.")";
 		}

		// トランザクション開始
		$this->db->beginTransaction();
		try{
			$count = $connectionInfoDao->update($dict, $condition);
			if ($count > 0) {
				$this->db->commit();
				return $count;
			}
			$this->db->rollBack();
		} catch (Exception $e) {
			$this->db->rollBack();
			throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
		}
	}
	
	public function getUnexpireConnectionInfoList($clientId, $staffType, $staffId) {
		$order = 'created_datetime';
		$page = 1;
		$pagesize = 100;
		$ordertype = 'desc';	// 任意

		//トランザクション分離レベル変更
		// MySQLのでデフォルトだとREPEATABLE-READのため
		// (※レコードを更新しトランザクションを確定しても、他のDBセッションから確定後の値を参照することが出来ないため)
		$this->db->exec("SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED");

		$connectionInfoDao = Application_CommonUtil::getInstance("dao", "ConnectionInfoDao", $this->db);

		if ("AA" == $staffType) {
 			$condition = "((operator_staff_type = '{$staffType}') AND (operator_staff_id = '{$staffId}')) AND (connection_state <> 5) AND (DATEDIFF(now(),  created_datetime) <= ".self::CONNECT_NO_VALID_DATE.")";
		} else {
 			$condition = "((operator_client_id = '{$clientId}') AND (operator_staff_type = '{$staffType}') AND (operator_staff_id = '{$staffId}')) AND (connection_state <> 5) AND (DATEDIFF(now(),  created_datetime) <= ".self::CONNECT_NO_VALID_DATE.")";
		}
		
		$connectionInfoList = $connectionInfoDao->getConnectionInfoList($condition, $order, $ordertype, $page, $pagesize);
		
		return $connectionInfoList;
	}
	
	public function removePeerIdFromConnectionInfo($id, $peerId) {
		if (isset($peerId) && strlen($peerId) > 0) {
			//トランザクション分離レベル変更
			// MySQLのでデフォルトだとREPEATABLE-READのため
			// (※レコードを更新しトランザクションを確定しても、他のDBセッションから確定後の値を参照することが出来ないため)
			$this->db->exec("SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED");

			$connectionInfoDao = Application_CommonUtil::getInstance("dao", "ConnectionInfoDao", $this->db);

			$connectionInfoWork = $this->getConnectionInfo($id);
			
			if (!empty($connectionInfoWork)) {
				$dict = array();
				$condition = null;
				if ($connectionInfoWork["operator_peer_id"] == $peerId) {
					$condition = "(id = '{$id}') AND (operator_peer_id = '{$peerId}')";
					$dict['operator_peer_id'] = null;
				} else if ($connectionInfoWork["user_peer_id_1"] == $peerId) {
					$condition = "(id = '{$id}') AND (user_peer_id_1 = '{$peerId}')";
					$dict['user_peer_id_1'] = null;
error_log("removePeerIdFromConnectionInfo user_peer_id_1(".$peerId.")\n", 3, "/var/tmp/negotiation.log");
				} else if ($connectionInfoWork["user_peer_id_2"] == $peerId) {
					$condition = "(id = '{$id}') AND (user_peer_id_2 = '{$peerId}')";
					$dict['user_peer_id_2'] = null;
				} else if ($connectionInfoWork["user_peer_id_3"] == $peerId) {
					$condition = "(id = '{$id}') AND (user_peer_id_3 = '{$peerId}')";
					$dict['user_peer_id_3'] = null;
				} else if ($connectionInfoWork["user_peer_id_4"] == $peerId) {
					$condition = "(id = '{$id}') AND (user_peer_id_4 = '{$peerId}')";
					$dict['user_peer_id_4'] = null;
				} else if ($connectionInfoWork["user_peer_id_5"] == $peerId) {
					$condition = "(id = '{$id}') AND (user_peer_id_5 = '{$peerId}')";
					$dict['user_peer_id_5'] = null;
				} else if ($connectionInfoWork["user_peer_id_6"] == $peerId) {
					$condition = "(id = '{$id}') AND (user_peer_id_6 = '{$peerId}')";
					$dict['user_peer_id_6'] = null;
				} else if ($connectionInfoWork["user_peer_id_7"] == $peerId) {
					$condition = "(id = '{$id}') AND (user_peer_id_7 = '{$peerId}')";
					$dict['user_peer_id_7'] = null;
				} else if ($connectionInfoWork["user_peer_id_8"] == $peerId) {
					$condition = "(id = '{$id}') AND (user_peer_id_8 = '{$peerId}')";
					$dict['user_peer_id_8'] = null;
				}
				
				if (!empty($condition)) {
				
					// トランザクション開始
					$this->db->beginTransaction();
					try{
						$count = $connectionInfoDao->update($dict, $condition);
						if ($count > 0) {
							$this->db->commit();
						}
						else {
							$this->db->rollBack();
						}
						$condition = "(id = '{$id}')";
						$connectionInfo = $connectionInfoDao->getConnectionInfo($condition);
					} catch (Exception $e) {
						$this->db->rollBack();
						throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
					}
					return $connectionInfo;
				}
			}
		}
		
		return null;
	}
	
	public function dataConnectionConnectLog($connection_info_id, $connect_no, $connection_type, $connection_id, $from_peer_id, $to_peer_id, $from_user_id, $to_user_id) {
		$negotiationConnectionLogDao = Application_CommonUtil::getInstance("dao", "NegotiationConnectionLogDao", $this->db);
		
		$dict = array();
		$dict['connection_info_id'] = $connection_info_id;
		$dict['connect_no'] = $connect_no;
		$dict['connection_type'] = $connection_type;
		$dict['connection_id'] = $connection_id;
		$dict['from_peer_id'] = $from_peer_id;
		$dict['to_peer_id'] = $to_peer_id;
		$dict['from_user_id'] = $from_user_id;
		$dict['to_user_id'] = $to_user_id;
		$dict['data_connection_connect_datetime'] = new Zend_Db_Expr('now()');
		
		// トランザクション開始
		$this->db->beginTransaction();
		try{
			$id = $negotiationConnectionLogDao->regist($dict);
			$this->db->commit();
			return $id;
		} catch (Exception $e) {
			$this->db->rollBack();
			throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
		}
		
		return null;
	}
	
	public function dataConnectionOpen1Log($connection_info_id, $connection_type, $connection_id, $from_peer_id, $to_peer_id) {
		$negotiationConnectionLogDao = Application_CommonUtil::getInstance("dao", "NegotiationConnectionLogDao", $this->db);
		
		$dict = array();
		$dict['data_connection_open_datetime_1'] = new Zend_Db_Expr('now()');
		
		$condition = "((connection_info_id = '{$connection_info_id}') AND (connection_type = '{$connection_type}') AND (connection_id = '{$connection_id}') AND (from_peer_id = '{$from_peer_id}') AND (to_peer_id = '{$to_peer_id}'))";

		// トランザクション開始
		$this->db->beginTransaction();
		try{
			$count = $negotiationConnectionLogDao->update($dict, $condition);
			if ($count > 0) {
				$this->db->commit();
				return $count;
			}
			$this->db->rollBack();
		} catch (Exception $e) {
			$this->db->rollBack();
			throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
		}
		return null;
	}

	public function dataConnectionOpen2Log($connection_info_id, $connection_type, $connection_id, $from_peer_id, $to_peer_id) {
		$negotiationConnectionLogDao = Application_CommonUtil::getInstance("dao", "NegotiationConnectionLogDao", $this->db);
		
		$dict = array();
		$dict['data_connection_open_datetime_2'] = new Zend_Db_Expr('now()');
		
		$condition = "((connection_info_id = '{$connection_info_id}') AND (connection_type = '{$connection_type}') AND (connection_id = '{$connection_id}') AND (from_peer_id = '{$from_peer_id}') AND (to_peer_id = '{$to_peer_id}'))";

		// トランザクション開始
		$this->db->beginTransaction();
		try{
			$count = $negotiationConnectionLogDao->update($dict, $condition);
			if ($count > 0) {
				$this->db->commit();
				return $count;
			}
			$this->db->rollBack();
		} catch (Exception $e) {
			$this->db->rollBack();
			throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
		}
		return null;
	}

	public function dataConnectionClose1Log($connection_info_id, $connection_type, $connection_id, $from_peer_id, $to_peer_id) {
		$negotiationConnectionLogDao = Application_CommonUtil::getInstance("dao", "NegotiationConnectionLogDao", $this->db);
		
		$dict = array();
		$dict['data_connection_close_datetime_1'] = new Zend_Db_Expr('now()');
		
		$condition = "((connection_info_id = '{$connection_info_id}') AND (connection_type = '{$connection_type}') AND (connection_id = '{$connection_id}') AND (from_peer_id = '{$from_peer_id}') AND (to_peer_id = '{$to_peer_id}'))";

		// トランザクション開始
		$this->db->beginTransaction();
		try{
			$count = $negotiationConnectionLogDao->update($dict, $condition);
			if ($count > 0) {
				$this->db->commit();
				return $count;
			}
			$this->db->rollBack();
		} catch (Exception $e) {
			$this->db->rollBack();
			throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
		}
		return null;
	}

	public function dataConnectionClose2Log($connection_info_id, $connection_type, $connection_id, $from_peer_id, $to_peer_id) {
		$negotiationConnectionLogDao = Application_CommonUtil::getInstance("dao", "NegotiationConnectionLogDao", $this->db);
		
		$dict = array();
		$dict['data_connection_close_datetime_2'] = new Zend_Db_Expr('now()');
		
		$condition = "((connection_info_id = '{$connection_info_id}') AND (connection_type = '{$connection_type}') AND (connection_id = '{$connection_id}') AND (from_peer_id = '{$from_peer_id}') AND (to_peer_id = '{$to_peer_id}'))";

		// トランザクション開始
		$this->db->beginTransaction();
		try{
			$count = $negotiationConnectionLogDao->update($dict, $condition);
			if ($count > 0) {
				$this->db->commit();
				return $count;
			}
			$this->db->rollBack();
		} catch (Exception $e) {
			$this->db->rollBack();
			throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
		}
		return null;
	}

	public function mediaConnectionCallLog($connection_info_id, $connect_no, $connection_type, $connection_id, $from_peer_id, $to_peer_id, $from_user_id) {
		$negotiationConnectionLogDao = Application_CommonUtil::getInstance("dao", "NegotiationConnectionLogDao", $this->db);

		$dict = array();
		$dict['from_user_id'] = $from_user_id;
		$dict['media_connection_call_datetime'] = new Zend_Db_Expr('now()');

		$condition = "((connection_info_id = '{$connection_info_id}') AND (connection_type = '{$connection_type}') AND (connection_id = '{$connection_id}') AND (from_peer_id = '{$from_peer_id}') AND (to_peer_id = '{$to_peer_id}'))";
		
		// トランザクション開始
		$this->db->beginTransaction();
		try{
			$count = $negotiationConnectionLogDao->update($dict, $condition);
			if ($count > 0) {
				$this->db->commit();
				return $count;
			} else {
				$dict['connection_info_id'] = $connection_info_id;
				$dict['connect_no'] = $connect_no;
				$dict['connection_type'] = $connection_type;
				$dict['connection_id'] = $connection_id;
				$dict['from_peer_id'] = $from_peer_id;
				$dict['to_peer_id'] = $to_peer_id;
			
				$id = $negotiationConnectionLogDao->regist($dict);
				$this->db->commit();
				return 1;
			}
		} catch (Exception $e) {
			$this->db->rollBack();
			throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
		}
		return null;
	}

	public function mediaConnectionAnswerLog($connection_info_id, $connection_type, $connection_id, $from_peer_id, $to_peer_id, $to_user_id) {
		$negotiationConnectionLogDao = Application_CommonUtil::getInstance("dao", "NegotiationConnectionLogDao", $this->db);
		
		$dict = array();
		$dict['to_user_id'] = $to_user_id;
		$dict['media_connection_answer_datetime'] = new Zend_Db_Expr('now()');
		
		$condition = "((connection_info_id = '{$connection_info_id}') AND (connection_id = '{$connection_id}') AND (from_peer_id = '{$from_peer_id}') AND (to_peer_id = '{$to_peer_id}'))";

		// トランザクション開始
		$this->db->beginTransaction();
		try{
			$count = $negotiationConnectionLogDao->update($dict, $condition);
			if ($count > 0) {
				$this->db->commit();
				return $count;
			} else {
				$dict['connection_info_id'] = $connection_info_id;
				$dict['connection_type'] = $connection_type;
				$dict['connection_id'] = $connection_id;
				$dict['to_peer_id'] = $to_peer_id;
			
				$id = $negotiationConnectionLogDao->regist($dict);
				$this->db->commit();
				return 1;
			}
		} catch (Exception $e) {
			$this->db->rollBack();
			throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
		}
		return null;
	}

	public function mediaConnectionStreamSendConfirmLog($connection_info_id, $connection_type, $connection_id, $from_peer_id, $to_peer_id) {
		$negotiationConnectionLogDao = Application_CommonUtil::getInstance("dao", "NegotiationConnectionLogDao", $this->db);
		
		$dict = array();
		$dict['media_connection_stream_send_confirm_datetime'] = new Zend_Db_Expr('now()');
		
		$condition = "((connection_info_id = '{$connection_info_id}') AND (connection_type = '{$connection_type}') AND (connection_id = '{$connection_id}') AND (from_peer_id = '{$from_peer_id}') AND (to_peer_id = '{$to_peer_id}'))";

		// トランザクション開始
		$this->db->beginTransaction();
		try{
			$count = $negotiationConnectionLogDao->update($dict, $condition);
			if ($count > 0) {
				$this->db->commit();
				return $count;
			}
			$this->db->rollBack();
		} catch (Exception $e) {
			$this->db->rollBack();
			throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
		}
		return null;
	}

	public function mediaConnectionStream1Log($connection_info_id, $connection_type, $connection_id, $from_peer_id, $to_peer_id) {
		$negotiationConnectionLogDao = Application_CommonUtil::getInstance("dao", "NegotiationConnectionLogDao", $this->db);
		
		$dict = array();
		$dict['media_connection_stream_datetime_1'] = new Zend_Db_Expr('now()');
		
		$condition = "((connection_info_id = '{$connection_info_id}') AND (connection_type = '{$connection_type}') AND (connection_id = '{$connection_id}') AND (from_peer_id = '{$from_peer_id}') AND (to_peer_id = '{$to_peer_id}'))";

		// トランザクション開始
		$this->db->beginTransaction();
		try{
			$count = $negotiationConnectionLogDao->update($dict, $condition);
			if ($count > 0) {
				$this->db->commit();
				return $count;
			}
			$this->db->rollBack();
		} catch (Exception $e) {
			$this->db->rollBack();
			throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
		}
		return null;
	}

	public function mediaConnectionStream2Log($connection_info_id, $connection_type, $connection_id, $from_peer_id, $to_peer_id) {
		$negotiationConnectionLogDao = Application_CommonUtil::getInstance("dao", "NegotiationConnectionLogDao", $this->db);
		
		$dict = array();
		$dict['media_connection_stream_datetime_2'] = new Zend_Db_Expr('now()');
		
		$condition = "((connection_info_id = '{$connection_info_id}') AND (connection_type = '{$connection_type}') AND (connection_id = '{$connection_id}') AND (from_peer_id = '{$from_peer_id}') AND (to_peer_id = '{$to_peer_id}'))";

		// トランザクション開始
		$this->db->beginTransaction();
		try{
			$count = $negotiationConnectionLogDao->update($dict, $condition);
			if ($count > 0) {
				$this->db->commit();
				return $count;
			}
			$this->db->rollBack();
		} catch (Exception $e) {
			$this->db->rollBack();
			throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
		}
		return null;
	}

	public function mediaConnectionClose1Log($connection_info_id, $connection_type, $connection_id, $from_peer_id, $to_peer_id) {
		$negotiationConnectionLogDao = Application_CommonUtil::getInstance("dao", "NegotiationConnectionLogDao", $this->db);
		
		$dict = array();
		$dict['media_connection_close_datetime_1'] = new Zend_Db_Expr('now()');
		
		$condition = "((connection_info_id = '{$connection_info_id}') AND (connection_type = '{$connection_type}') AND (connection_id = '{$connection_id}') AND (from_peer_id = '{$from_peer_id}') AND (to_peer_id = '{$to_peer_id}'))";

		// トランザクション開始
		$this->db->beginTransaction();
		try{
			$count = $negotiationConnectionLogDao->update($dict, $condition);
			if ($count > 0) {
				$this->db->commit();
				return $count;
			}
			$this->db->rollBack();
		} catch (Exception $e) {
			$this->db->rollBack();
			throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
		}
		return null;
	}

	public function mediaConnectionClose2Log($connection_info_id, $connection_type, $connection_id, $from_peer_id, $to_peer_id) {
		$negotiationConnectionLogDao = Application_CommonUtil::getInstance("dao", "NegotiationConnectionLogDao", $this->db);
		
		$dict = array();
		$dict['media_connection_close_datetime_2'] = new Zend_Db_Expr('now()');
		
		$condition = "((connection_info_id = '{$connection_info_id}') AND (connection_type = '{$connection_type}') AND (connection_id = '{$connection_id}') AND (from_peer_id = '{$from_peer_id}') AND (to_peer_id = '{$to_peer_id}'))";

		// トランザクション開始
		$this->db->beginTransaction();
		try{
			$count = $negotiationConnectionLogDao->update($dict, $condition);
			if ($count > 0) {
				$this->db->commit();
				return $count;
			}
			$this->db->rollBack();
		} catch (Exception $e) {
			$this->db->rollBack();
			throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
		}
		return null;
	}

// koko
	/**
	 * ルーム内の仮予約を初期化する
	 * ※ただし、更新時間が10秒以前のピアIDのみ
	 */
	public function clearConnectionInfoPeerId($connection_info_id) {
		//トランザクション分離レベル変更
		// MySQLのでデフォルトだとREPEATABLE-READのため
		// (※レコードを更新しトランザクションを確定しても、他のDBセッションから確定後の値を参照することが出来ないため)
		$this->db->exec("SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED");

		$connectionInfoDao = Application_CommonUtil::getInstance("dao", "ConnectionInfoDao", $this->db);

		try{
			// トランザクション開始
			$this->db->beginTransaction();

			for ($iCnt=1; $iCnt < 5; $iCnt++) { 
				$dict = array();
				$condition = "";
				switch( $iCnt ) {
					case	1:
						$dict["user_peer_id_1"] = null;
						$condition = "id = '{$connection_info_id}' AND user_peer_id_1 = 'X' AND connect_datetime1 < (NOW() - INTERVAL 10 SECOND)";
//error_log("clearConnectionInfoPeerId user_peer_id_1=null connection_info_id(".$connection_info_id.")\n", 3, "/var/tmp/negotiation.log");
						break;
					case	2:
						$dict["user_peer_id_2"] = null;
						$condition = "id = '{$connection_info_id}' AND user_peer_id_2 = 'X' AND connect_datetime2 < (NOW() - INTERVAL 10 SECOND)";
						break;
					case	3:
						$dict["user_peer_id_3"] = null;
						$condition = "id = '{$connection_info_id}' AND user_peer_id_3 = 'X' AND connect_datetime3 < (NOW() - INTERVAL 10 SECOND)";
						break;
					case	4:
						$dict["user_peer_id_4"] = null;
						$condition = "id = '{$connection_info_id}' AND user_peer_id_4 = 'X' AND connect_datetime4 < (NOW() - INTERVAL 10 SECOND)";
						break;
					case	5:
						$dict["user_peer_id_5"] = null;
						$condition = "id = '{$connection_info_id}' AND user_peer_id_5 = 'X' AND connect_datetime5 < (NOW() - INTERVAL 10 SECOND)";
						break;
					case	6:
						$dict["user_peer_id_6"] = null;
						$condition = "id = '{$connection_info_id}' AND user_peer_id_6 = 'X' AND connect_datetime6 < (NOW() - INTERVAL 10 SECOND)";
						break;
					case	7:
						$dict["user_peer_id_7"] = null;
						$condition = "id = '{$connection_info_id}' AND user_peer_id_7 = 'X' AND connect_datetime7 < (NOW() - INTERVAL 10 SECOND)";
						break;
					case	8:
						$dict["user_peer_id_8"] = null;
						$condition = "id = '{$connection_info_id}' AND user_peer_id_8 = 'X' AND connect_datetime8 < (NOW() - INTERVAL 10 SECOND)";
					break;
				}
				$count += $connectionInfoDao->update($dict, $condition);
error_log("clearConnectionInfoPeerId iCnt=(".$iCnt.") count=(".$count.")\n", 3, "/var/tmp/negotiation.log");
			}

			if ($count > 0) {
				$this->db->commit();
error_log("clearConnectionInfoPeerId commit count=(".$count.")\n", 3, "/var/tmp/negotiation.log");
				return $count;
			}
			$this->db->rollBack();
		}
		catch (Exception $e) {
			$this->db->rollBack();
			throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
		}
		return 0;
	}

	/**
	 * 
	 */
	public function updateConnectionInfoRoomState($connection_info_id, $room_State) {
		//トランザクション分離レベル変更
		// MySQLのでデフォルトだとREPEATABLE-READのため
		// (※レコードを更新しトランザクションを確定しても、他のDBセッションから確定後の値を参照することが出来ないため)
		$this->db->exec("SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED");

		$connectionInfoDao = Application_CommonUtil::getInstance("dao", "ConnectionInfoDao", $this->db);

		$dict = array();
		if ($room_State == '1') {
			$dict["room_state"] = '1';
		} else {
			$dict["room_state"] = '0';
		}
		$condition = "(id = '{$connection_info_id}')";

		try{
			// トランザクション開始
			$this->db->beginTransaction();

			$count = $connectionInfoDao->update($dict, $condition);
			if ($count > 0) {
				$this->db->commit();
				return $count;
			}
			$this->db->rollBack();
		} catch (Exception $e) {
			$this->db->rollBack();
			throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
		}
		return 0;
	}

	/**
	 * 
	 */
	public function updateConnectionInfoRoomStateOff($connection_info_id) {
		//トランザクション分離レベル変更
		// MySQLのでデフォルトだとREPEATABLE-READのため
		// (※レコードを更新しトランザクションを確定しても、他のDBセッションから確定後の値を参照することが出来ないため)
		$this->db->exec("SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED");
		$connectionInfoDao = Application_CommonUtil::getInstance("dao", "ConnectionInfoDao", $this->db);

//error_log("updateConnectionInfoRoomStateOff1\n", 3, "/var/tmp/negotiation.log");
		$dict = array();
		$dict["room_state"] = '0';
//error_log("updateConnectionInfoRoomStateOff2\n", 3, "/var/tmp/negotiation.log");
		$condition = "(id='{$connection_info_id}' AND room_state!=0 AND login_flg1!=1 AND login_flg2!=1 AND login_flg3!=1 AND login_flg4!=1)";

//error_log("updateConnectionInfoRoomStateOff3\n", 3, "/var/tmp/negotiation.log");
		try {
			// トランザクション開始
			$this->db->beginTransaction();

//error_log("updateConnectionInfoRoomStateOff4\n", 3, "/var/tmp/negotiation.log");
			$count = $connectionInfoDao->update($dict, $condition);
			if ($count > 0) {
				$this->db->commit();
				return $count;
			}
			$this->db->rollBack();
		} catch (Exception $e) {
error_log("updateConnectionInfoRoomStateOff error=[".$e->getMessage()."]\n", 3, "/var/tmp/negotiation.log");
			$this->db->rollBack();
			throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
		}
//error_log("updateConnectionInfoRoomStateOff cnt=0\n", 3, "/var/tmp/negotiation.log");
		return 0;
	}

	/**
	 * ルーム入室
	 * 
	 * 戻り値
	 * -1: ロック状態
	 * -2: 人数オーバー
	 * 0>=: USER_ID (入室ユーザID)
	 * 
	 * 同時に入室した場合、入室数が2人となり１人目の入室が判定できないため
	 * 入室数判定(enterRoom)時にSELECT FRO UPDATE で参照ロックを掛け
	 * 必ず１人目が終わってから２人目以降の処理を行うようなする。
	 * 尚、参照ロックは入室予約('X')の更新時に解除する。
	 */
	public function enterRoom($connectionInfo, $collabo_id) {

		//トランザクション分離レベル変更
		// MySQLのでデフォルトだとREPEATABLE-READのため
		// (※レコードを更新しトランザクションを確定しても、他のDBセッションから確定後の値を参照することが出来ないため)
		$this->db->exec("SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED");

		// トランザクション開始
		$this->db->beginTransaction();
		$user_id = 0;
		try{
// ##### ▼ ここからDBの排他(レコードロック)
			$result = $this->pGetRoomInfoForUpdate($connectionInfo['room_name'], $collabo_id);
			switch( $result ) {
				case	-1:	// ルームロック
					$this->db->rollBack();
					return -1;
				case	-2:	// 人数オーバー
					$this->db->rollBack();
					return -2;
			}

			/**
			 * あいているいているuser_idを取得する
			 * ただしここで取得するuser_idは商談画面へ遷移するための仮。
			 * 正式なuser_idは「negotiation_main->getUserIdAction()」を呼び出し取得する
			 */
error_log("enterRoom connectionInfo=[".print_r($connectionInfo, true)."]\n", 3, "/var/tmp/negotiation.log");

			$user_id = $this->pGetEmptyUserId($connectionInfo);
error_log("enterRoom session_id=(". session_id() .") user_id(". $user_id .")\n", 3, "/var/tmp/negotiation.log");
			// PeerId予約 (空で埋める)
			$updateConnectionInfo = $this->pUpdateConnectionInfoPeerId($connectionInfo['id'], $user_id);
			$this->db->commit();

// ##### ▲ ここまでDBの排他(レコードロック)

			// 1以上の場合は同期相手のピアIDがセットされるまでリトライする(１人目はチェック不要)
			if( $result > 1 ) {
				for ($iCnt=0; $iCnt < 40; $iCnt++) { 
					$count = 0;
error_log("enterRoom connectionInfo=[".print_r($connectionInfo, true)."]\n", 3, "/var/tmp/negotiation.log");
					foreach($connectionInfo as $key=>$val) {
						if(preg_match("/^user_peer_id_\d+$/", $key) ) {
							if( !is_null($val) && $val != 'X' ) {
								$count++;
							}
						}
					}
					if( $count > 0 ) {
						break;
					}
					// 0.5 秒間遅延させる
					usleep(500000);
					$connectionInfo = $apiModel->getConnectionInfo($connectionInfo['id']);
				}
error_log("enterRoom BREAK iCnt=(".$iCnt.")\n", 3, "/var/tmp/negotiation.log");
			}
		}
		catch (Exception $e) {
error_log("enterRoom Exception=[". $e->getMessage() ."]\n", 3, "/var/tmp/negotiation.log");
			$this->db->rollBack();
			return -3;
		}

//error_log("enterRoom connectionInfo=[".print_r($connectionInfo, true)."]\n", 3, "/var/tmp/negotiation.log");
		return $user_id;
	}

	/**
	 * 商談ローム入室可能判定
	 * -1: ロック状態
	 * -2: 人数オーバー
	 * 0>=: 入室OK (入室人数)
	 */
	private function pGetRoomInfoForUpdate($room_name, $collabo_id) {

		//トランザクション分離レベル変更
		// MySQLのでデフォルトだとREPEATABLE-READのため
		// (※レコードを更新しトランザクションを確定しても、他のDBセッションから確定後の値を参照することが出来ないため)
		$this->db->exec("SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED");

		$connectionInfoDao = Application_CommonUtil::getInstance("dao", "ConnectionInfoDao", $this->db);
		$connectionInfo = array();

		$condition = "(room_name = '{$room_name}') AND (collabo_id = '{$collabo_id}')";
		$connectionInfo = $connectionInfoDao->getConnectionInfoForUpdate($condition);

		if($connectionInfo["room_state"] == "1") {
			return -1;
		}
		else {
			$count = 0;
			foreach($connectionInfo as $key=>$val) {
				if(preg_match("/^user_peer_id_\d+$/", $key) ) {
					if(!is_null($val)) {
						$count++;
					}
				}
			}
			$config = new Zend_Config_Ini(APP_DIR . 'configs/system.ini', "production");
			if( $count >= $config->meet->room->connectMaxCount ) {
				return -2;
			}
		}
		return $count;
	}

	private function pGetEmptyUserId($connectionInfo) {
		$empty_fields = array(
			'user_peer_id_1' => 1,
			'user_peer_id_2' => 2,
			'user_peer_id_3' => 3,
			'user_peer_id_4' => 4,
			'user_peer_id_5' => 5,
			'user_peer_id_6' => 6,
			'user_peer_id_7' => 7,
			'user_peer_id_8' => 8,
		);
		
		foreach($empty_fields as $key => $val) {
			if(empty($connectionInfo[$key])) {
				return $val;
			}
		}
		return 0;
	}

	private function pUpdateConnectionInfoPeerId($id, $userId, $peerId='X', $loginFlg=0) {

		if (isset($peerId) && strlen($peerId) == 0) {
			$peerId = null;
			$loginFlg = 0;
		}

		$dict = array();
		if (0 == $userId) {
			$dict['operator_peer_id'] = $peerId;
		} else if (1 == $userId) {
			$dict['user_peer_id_1'] = $peerId;
			$dict['login_flg1'] = $loginFlg;
			$dict['connect_datetime1'] = new Zend_Db_Expr('now()');
error_log("clearConnepUpdateConnectionInfoPeerId user_peer_id_1=(".$peerId.")\n", 3, "/var/tmp/negotiation.log");
		} else if (2 == $userId) {
			$dict['user_peer_id_2'] = $peerId;
			$dict['login_flg2'] = $loginFlg;
			$dict['connect_datetime2'] = new Zend_Db_Expr('now()');
		} else if (3 == $userId) {
			$dict['user_peer_id_3'] = $peerId;
			$dict['login_flg3'] = $loginFlg;
			$dict['connect_datetime3'] = new Zend_Db_Expr('now()');
		} else if (4 == $userId) {
			$dict['user_peer_id_4'] = $peerId;
			$dict['login_flg4'] = $loginFlg;
			$dict['connect_datetime4'] = new Zend_Db_Expr('now()');
		} else if (5 == $userId) {
			$dict['user_peer_id_5'] = $peerId;
			$dict['login_flg5'] = $loginFlg;
			$dict['connect_datetime5'] = new Zend_Db_Expr('now()');
		} else if (6 == $userId) {
			$dict['user_peer_id_6'] = $peerId;
			$dict['login_flg6'] = $loginFlg;
			$dict['connect_datetime6'] = new Zend_Db_Expr('now()');
		} else if (7 == $userId) {
			$dict['user_peer_id_7'] = $peerId;
			$dict['login_flg7'] = $loginFlg;
			$dict['connect_datetime7'] = new Zend_Db_Expr('now()');
		} else if (8 == $userId) {
			$dict['user_peer_id_8'] = $peerId;
			$dict['login_flg8'] = $loginFlg;
			$dict['connect_datetime8'] = new Zend_Db_Expr('now()');
		} else {
			return null;
		}
 		$condition = "(id = '{$id}') ";

		//トランザクション分離レベル変更
		// MySQLのでデフォルトだとREPEATABLE-READのため
		// (※レコードを更新しトランザクションを確定しても、他のDBセッションから確定後の値を参照することが出来ないため)
		$this->db->exec("SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED");
		$connectionInfoDao = Application_CommonUtil::getInstance("dao", "ConnectionInfoDao", $this->db);

		try{
			$count = $connectionInfoDao->update($dict, $condition);
			$connectionInfo = $connectionInfoDao->getConnectionInfo($condition);
		}
		catch (Exception $e) {
			throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
		}
		return $connectionInfo;
	}

// ########################################################################################### //
	private function pTraceLog($connection_info_id, $connect_no, $message, $command, $from_peer_id, $to_peer_id) {

		$user_agent = $_SERVER['HTTP_USER_AGENT'];  // ユーザエージェント
		$ip = $_SERVER["REMOTE_ADDR"];              // IPアドレス
		$this->TraceLog($connection_info_id, $connect_no, $message, 5, $user_agent, $ip, $command, $from_peer_id, $to_peer_id);
	}

	public function TraceLog($connection_info_id, $connect_no, $message, $type, $user_agent, $ip, $command, $from_peer_id, $to_peer_id) {
		$connectionInfoDao = Application_CommonUtil::getInstance("dao", "ConnectionInfoDao", $this->db);
		$meetinLogDao = Application_CommonUtil::getInstance("dao", "MeetinLogDao", $this->db);

		// connect_noが空の場合は、connection_info_idを元にconnectionInfoテーブルを検索・取得しconnect_noを設定する
		if ( empty($connect_no) ) {
			// connect_no(電話番号が空)
			$connect_no = null;
			if ( !empty($connection_info_id) ) {
				// connection_info_idあり
				$condition = "(id = '{$connection_info_id}')";
				$connectionInfo = $connectionInfoDao->getConnectionInfo($condition);
				if ( !empty($connectionInfo) ) {
					$connect_no = $connectionInfo['connect_no'];
				}
			}
			 else {
				// connection_info_idが無い(from_peer_idから求める)
				$order = 'created_datetime';
				$page = 1;
				$pagesize = 1;
				$ordertype = 'desc';	//降順
	 			$condition = "((operator_staff_type = '{$staffType}') AND (operator_staff_id = '{$staffId}')) AND (connection_state <> 5) AND (DATEDIFF(now(),  created_datetime) <= ".self::CONNECT_NO_VALID_DATE.")";
				$connectionInfo = $connectionInfoDao->getConnectionInfoList($condition, $order, $ordertype, $page, $pagesize);
				if ( !empty($connectionInfo) ) {
					$connection_info_id = $connectionInfo['id'];
					$connect_no = $connectionInfo['connect_no'];
				}
			}
		}

		$dict = array();
		$dict['connection_info_id'] = ( !empty($connection_info_id) ? $connection_info_id:null );
		$dict['connect_no'] = $connect_no;
		$dict['ip'] = $ip;
		$dict['message'] = $message;
		$dict['type'] = $type;
		$dict['user_agent'] = $user_agent;

		$dict['command'] = $command;
		$dict['from_peer_id'] = $from_peer_id;
		$dict['to_peer_id'] = $to_peer_id;
		//error_log("ApiModel.php_TraceLog() idct=(". json_encode($dict) .")\n", 3, "/var/tmp/negotiation.log");

		// トランザクション開始
		$this->db->beginTransaction();
		try{
			$id = $meetinLogDao->regist($dict);
			$this->db->commit();
			return $id;
		}
		catch (Exception $e) {
			$this->db->rollBack();
			throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
		}
		return null;
	}

}
