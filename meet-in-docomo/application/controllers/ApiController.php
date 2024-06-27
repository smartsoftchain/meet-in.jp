<?php
require_once APP_DIR.'/models/Adapter/AuthAdapter.php';

class ApiController extends AbstractApiController
{

	public function init(){
		parent::init();
		/* Initialize action controller here */
	}

	public function getWebRtcParamAction(){
		$form = $this->_getAllParams();

		$data = array();

		$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);

		$params = $apiModel->getWebRtcParam();

		$data["result"] = 1;
		$data["params"] = $params;

		// 処理結果を返す
		$result = json_encode($data);
		header("Access-Control-Allow-Origin: *");
		echo($result);
		exit;
	}

	public function saveWebRtcParamAction(){
		$form = $this->_getAllParams();

		$data = array();

		$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);

		$apiModel->saveWebRtcParam($form);

		$data["result"] = 1;

		// 処理結果を返す
		$result = json_encode($data);
		header("Access-Control-Allow-Origin: *");
		echo($result);
		exit;
	}

	public function clearWebRtcParamAction(){
		$form = $this->_getAllParams();

		$data = array();

		$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);

		$apiModel->clearWebRtcParam();

		$data["result"] = 1;

		// 処理結果を返す
		$result = json_encode($data);
		header("Access-Control-Allow-Origin: *");
		echo($result);
		exit;
	}

	public function createNewConnectionInfoAction(){
		$form = $this->_getAllParams();

		$data = array();
		$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);

		$preCode = '010';
		$companyCode = sprintf("%04d", $this->user["client_id"]);
		$operatorPeerId = $form["operatorPeerId"];
		$userPeerId = $form["userPeerId"];
		$clientId = $form["clientId"];
		$staffType = $form["staffType"];
		$staffId = $form["staffId"];
		$connectNo = $form["connectNo"];

		if ($apiModel->isAvaliableToCreateNewConnectionInfo($clientId, $staffType, $staffId)) {
			// // お問い合わせを行った企業情報をDBに登録する
			// $connectionInfo = $apiModel->createNewConnectionInfo($preCode, $companyCode, $connectNo, $operatorPeerId, $userPeerId, $clientId, $staffType, $staffId);

			// if (empty($connectionInfo)) {
			// 	$data["result"] = 3;
			// 	$data["error"] = "接続情報が作成できませんでした";
			// } else {
			// 	$data["result"] = 1;
			// 	$data["connection_info"] = $connectionInfo;
			// }

			$connectionInfo = $apiModel->getConnectionInfo($form["id"]);
			if (empty($connectionInfo)) {
				$data["result"] = 3;
				$data["error"] = "接続情報が見つかりませんでした";
			} else {
$this->_logger->info("createNewConnectionInfoAction connectionInfo=[". print_r($connectionInfo, true) ."]");
				$data["result"] = 1;
				$data["connection_info"] = $connectionInfo;
			}
		} else {
			$data["result"] = 2;
			$data["error"] = "作成可能な接続番号数が上限に達しました";
		}

		// 処理結果を返す
		$result = json_encode($data);
		header("Access-Control-Allow-Origin: *");
		echo($result);
		exit;
	}

	public function createEmptyConnectionInfoAction(){
		$form = $this->_getAllParams();

		$data = array();
		if (empty($form["connectNo"])) {
			$data["result"] = 2;
			$data["error"] = "接続番号がありません";
		} else {
			$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);

			// $connectNo = $form["connectNo"];
			// $clientId = $form["clientId"];
			// $staffType = $form["staffType"];
			// $staffId = $form["staffId"];

			// // お問い合わせを行った企業情報をDBに登録する
			// $connectionInfo = $apiModel->createEmptyConnectionInfo($connectNo, $clientId, $staffType, $staffId);

			// if (empty($connectionInfo)) {
			// 	$data["result"] = 3;
			// 	$data["error"] = "接続情報が作成できませんでした";
			// } else {
			// 	$data["result"] = 1;
			// 	$data["connection_info"] = $connectionInfo;
			// }

			$connectionInfo = $apiModel->getConnectionInfo($form["id"]);
			if (empty($connectionInfo)) {
				$data["result"] = 3;
				$data["error"] = "接続情報が見つかりませんでした";
			} else {
				$this->_logger->info("createEmptyConnectionInfoAction connectionInfo=[".print_r($connectionInfo, true)."]");
				$data["result"] = 1;
				$data["connection_info"] = $connectionInfo;
			}
		}

		// 処理結果を返す
		$result = json_encode($data);
		header("Access-Control-Allow-Origin: *");
		echo($result);
		exit;
	}

	public function cloneConnectionInfoAction(){
		$form = $this->_getAllParams();

		$data = array();
		if (empty($form["id"])) {
			$data["result"] = 2;
			$data["error"] = "接続情報IDがありません";
		} else {
			$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);

			// $connectionInfoId = $form["id"];
			// $connectionInfo = $apiModel->cloneConnectionInfo($connectionInfoId);
			// if (empty($connectionInfo)) {
			// 	$data["result"] = 3;
			// 	$data["error"] = "接続情報が作成できませんでした";
			// } else {
			// 	$data["result"] = 1;
			// 	$data["connection_info"] = $connectionInfo;
			// }

			$connectionInfo = $apiModel->getConnectionInfo($form["id"]);
			if (empty($connectionInfo)) {
				$data["result"] = 3;
				$data["error"] = "接続情報が見つかりませんでした";
			} else {
				$this->_logger->info("cloneConnectionInfoAction connectionInfo=[".print_r($connectionInfo, true)."]");
				$data["result"] = 1;
				$data["connection_info"] = $connectionInfo;
			}
		}

		// 処理結果を返す
		$result = json_encode($data);
		header("Access-Control-Allow-Origin: *");
		echo($result);
		exit;
	}

	public function callConnectionInfoAction(){
		$form = $this->_getAllParams();

		$data = array();
		if (empty($form["connectNo"])) {
			$data["result"] = 3;
			$data["error"] = "接続番号がありません";
//		} else if (empty($form["operatorPeerId"]) && empty($form["userPeerId"])) {
//			$data["result"] = 2;
//			$data["error"] = "Peer IDがありません";
		} else {
			$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);

			// 接続番号の変換
			// 全角数値は半角に変換
			// 数値のみ抽出
			$connectNo = mb_convert_kana($form["connectNo"], "n", "utf-8");
			$connectNo = preg_replace('/[^0-9]/', '', $connectNo);
			$operatorPeerId = $form["operatorPeerId"];
			$userPeerId = $form["userPeerId"];

			// お問い合わせを行った企業情報をDBに登録する
			$connectionInfo = $apiModel->callConnectionInfo($connectNo, $operatorPeerId, $userPeerId);

			if (empty($connectionInfo)) {
				$data["result"] = 4;
				$data["error"] = "該当接続番号の情報が取得できませんでした";
			} else {
				$this->_logger->info("callConnectionInfoAction connectionInfo=[".print_r($connectionInfo, true)."]");
				$data["result"] = 1;
				$data["connection_info"] = $connectionInfo;
			}
		}

		// 処理結果を返す
		$result = json_encode($data);
		header("Access-Control-Allow-Origin: *");
		echo($result);
		exit;
	}

	public function updateConnectionInfoPeerIdAction(){
		$form = $this->_getAllParams();

		$id = $form["id"];
		$userId = $form["userId"];
		$peerId = $form["peerId"];

		$data = array();
		$data["result"] = 1;
		/**
		 * 入力パラメータチェック
		 */
		if (!isset($id)) {
			$data["result"] = 3;
			$data["error"] = "IDがありません";
		} else if (!isset($userId)) {
			$data["result"] = 5;
			$data["error"] = "User IDがありません";
		} else if ($userId < 0 || $userId > 8) {
			$data["result"] = 6;
			$data["error"] = "User IDが正しくありません";
		}
		// パラメータエラーあり
		if($data["result"] != 1) {
			// 処理結果を返す
			$result = json_encode($data);
			header("Access-Control-Allow-Origin: *");
			echo($result);
			exit;
		}
		$this->_logger->info(" updateConnectionInfoPeerIdAction ".json_encode($form). " session_id=(". session_id() .")");

		// 認証済み情報を取り出す(ログイン者)
		$loginFlg = 0;
		if ($this->user) {
			$loginFlg = 1;
		}

		// セッション情報取得
		$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);
		$params = $apiModel->getWebRtcParam();
		// 接続情報
		$connectionInfo = $apiModel->getConnectionInfo($id);
		if (empty($connectionInfo)) {
			$data["result"] = 3;
			$data["error"] = "接続情報が見つかりませんでした";
			// 処理結果を返す
			$result = json_encode($data);
			header("Access-Control-Allow-Origin: *");
			echo($result);
			exit;
		}

		/**
		 * ピアIDが正しいかチェックする
		 */
		$this->_logger->debug("updateConnectionInfoPeerIdAction connectionInfo=[".print_r($connectionInfo, true)."]");
		$this->_logger->info("updateConnectionInfoPeerIdAction セッションの user_id=[". $userId ."]");
		switch ($userId) {
			case '1':
				$peer_id = $connectionInfo['user_peer_id_1'];
			break;
			case '2':
				$peer_id = $connectionInfo['user_peer_id_2'];
			break;
			case '3':
				$peer_id = $connectionInfo['user_peer_id_3'];
			break;
			case '4':
				$peer_id = $connectionInfo['user_peer_id_4'];
			break;
			case '5':
				$peer_id = $connectionInfo['user_peer_id_5'];
			break;
			case '6':
				$peer_id = $connectionInfo['user_peer_id_6'];
			break;
			case '7':
				$peer_id = $connectionInfo['user_peer_id_7'];
			break;
			case '8':
				$peer_id = $connectionInfo['user_peer_id_8'];
			break;
			default:
			$peer_id = "";
		}

		// DBのピアIDがnull の場合は空き
		// DBのピアIDとセッション(前回のピアID)が異なっている場合、他の人に使用されているためエラーとする
		// DBのピアIDが'X'の場合は、本人の予約IピアIDなので正常とし更新対象とする
		$this->_logger->info("updateConnectionInfoPeerIdAction peer_id DB=[". $peer_id ."] peer_id(前回:セッション)=[". $params["peer_id"] ."]");
		if ( $peer_id != null ) {
			if( $peer_id != 'X') {
				// if ($peer_id != $params["peer_id"]) {
				// 	$data["result"] = 7;
				// 	$data["error"] = "User IDが正しくありません";
				// 	// 処理結果を返す
				// 	$result = json_encode($data);
				// 	header("Access-Control-Allow-Origin: *");
				// 	echo($result);
				// 	exit;
				// }
			}
		}

		// peerId更新
		$this->_logger->info("updateConnectionInfoPeerIdAction peer_id DB=[". $peer_id ."] peer_id(前回:セッション)=[". $params["peer_id"] ."]");
		$connectionInfo = $apiModel->updateConnectionInfoPeerId($id, $userId, $peerId, $loginFlg);
		$this->_logger->debug("updateConnectionInfoPeerIdAction connectionInfo=[".print_r($connectionInfo, true)."]");
		if (empty($connectionInfo)) {
			$data["result"] = 4;
			$data["error"] = "接続情報が取得できませんでした";
		}
		else {
			// 正しくpeer_id更新
			$apiModel->saveWebRtcParam(array('peer_id' => $peerId));
			$data["result"] = 1;
			$data["connection_info"] = $connectionInfo;
		}

		// 処理結果を返す
		$result = json_encode($data);
		header("Access-Control-Allow-Origin: *");
		echo($result);
		exit;
	}

	public function getConnectionInfoAction(){
		$form = $this->_getAllParams();

		$data = array();
		if (empty($form["id"])) {
			$data["result"] = 2;
			$data["error"] = "IDがありません";
		} else {
			$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);

			$connectionInfo = $apiModel->getConnectionInfo($form["id"]);

			if (empty($connectionInfo)) {
				$data["result"] = 3;
				$data["error"] = "接続情報が見つかりませんでした";
			} else {
				$this->_logger->info("getConnectionInfoAction connectionInfo=[".print_r($connectionInfo, true)."]");
				$data["result"] = 1;
				$data["connection_info"] = $connectionInfo;
			}
		}

		// 処理結果を返す
		$result = json_encode($data);
		header("Access-Control-Allow-Origin: *");
		echo($result);
		exit;
	}

	public function getConnectionInfoByConnectNoAction(){
		$form = $this->_getAllParams();

		$data = array();
		if (empty($form["connect_no"])) {
			$data["result"] = 2;
			$data["error"] = "接続番号がありません";
		} else {
			$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);

			$connectionInfo = $apiModel->getConnectionInfoByConnectNo($form["connect_no"]);

			if (empty($connectionInfo)) {
				$data["result"] = 3;
				$data["error"] = "接続情報が見つかりませんでした";
			} else {
				$this->_logger->info("getConnectionInfoByConnectNoAction connectionInfo=[".print_r($connectionInfo, true)."]");
				$data["result"] = 1;
				$data["connection_info"] = $connectionInfo;
			}
		}

		// 処理結果を返す
		$result = json_encode($data);
		header("Access-Control-Allow-Origin: *");
		echo($result);
		exit;
	}

	public function startConnectionInfoAction(){
		$form = $this->_getAllParams();

		$data = array();
		if (empty($form["id"])) {
			$data["result"] = 2;
			$data["error"] = "接続情報のIDがありません";
		} else {
			$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);

			$count = $apiModel->startConnectionInfo($form["id"]);
			if ($count > 0) {
				$this->_logger->info("startConnectionInfoAction count=(".$count.")");
				$data["result"] = 1;
			} else {
				$data["result"] = 3;
				$data["error"] = "接続情報が見つかりませんでした";
			}
		}

		// 処理結果を返す
		$result = json_encode($data);
		header("Access-Control-Allow-Origin: *");
		echo($result);
		exit;
	}

	public function stopConnectionInfoAction(){
		$form = $this->_getAllParams();

		$data = array();
		if (empty($form["id"])) {
			$data["result"] = 2;
			$data["error"] = "接続情報のIDがありません";
		} else {
			$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);

			$count = $apiModel->stopConnectionInfo($form["id"]);
			if ($count > 0) {
				$this->_logger->info("stopConnectionInfoAction count=(".$count.")");
				$data["result"] = 1;
			} else {
				$data["result"] = 3;
				$data["error"] = "接続情報が見つかりませんでした";
			}
		}

		// 処理結果を返す
		$result = json_encode($data);
		header("Access-Control-Allow-Origin: *");
		echo($result);
		exit;
	}

	public function closeConnectionInfoAction(){
		$form = $this->_getAllParams();

		$data = array();
		if (empty($form["id"])) {
			$data["result"] = 2;
			$data["error"] = "接続情報のIDがありません";
		} else {
			$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);

			$count = $apiModel->closeConnectionInfo($form["id"]);
			if ($count > 0) {
				$this->_logger->info("closeConnectionInfoAction count=(".$count.")");
				$data["result"] = 1;
			} else {
				$data["result"] = 3;
				$data["error"] = "接続情報が見つかりませんでした";
			}
		}

		// 処理結果を返す
		$result = json_encode($data);
		header("Access-Control-Allow-Origin: *");
		echo($result);
		exit;
	}

	/**
	 * 管理者終了
	 */
	public function finishConnectionInfoAction(){
		$form = $this->_getAllParams();
		$this->_logger->info("商談終了(finishConnectionInfoAction) START：".json_encode($form));

		$data = array();
		if (empty($form["id"])) {
			$data["result"] = 2;
			$data["error"] = "接続情報のIDがありません";
		} else {
			$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);
			$count = $apiModel->finishConnectionInfo($form["id"]);
			if ($count > 0) {
				$data["result"] = 1;
			} else {
				$data["result"] = 3;
				$data["error"] = "接続情報が見つかりませんでした";
			}
		}

		// 処理結果を返す
		$result = json_encode($data);
		header("Access-Control-Allow-Origin: *");
		echo($result);
		exit;
	}

	public function updateUnexpireConnectionInfoPeerIdAction(){
		$form = $this->_getAllParams();

		$data = array();
		if (empty($form["operatorPeerId"])) {
			$data["result"] = 2;
			$data["error"] = "Peer IDがありません";
		} else {
			$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);

			$clientId = $form["clientId"];
			$staffType = $form["staffType"];
			$staffId = $form["staffId"];
			$operatorPeerId = $form["operatorPeerId"];

			$count = $apiModel->updateUnexpireConnectionInfoPeerId($clientId, $staffType, $staffId, $operatorPeerId);

			if ($count < 1) {
				$data["result"] = 4;
				$data["error"] = "更新した接続情報がありませんでした。";
			} else {
				$this->_logger->info("updateUnexpireConnectionInfoPeerIdAction count=(".$count.")");
				$data["result"] = 1;
				$data["count"] = $count;
			}
		}

		// 処理結果を返す
		$result = json_encode($data);
		header("Access-Control-Allow-Origin: *");
		echo($result);
		exit;
	}

	public function closeExpireConnectionInfoAction(){
		$form = $this->_getAllParams();

		$data = array();
		$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);

		$clientId = $form["clientId"];
		$staffType = $form["staffType"];
		$staffId = $form["staffId"];
		$count = $apiModel->closeExpireConnectionInfo($clientId, $staffType, $staffId);
		$data["result"] = 1;
		$data["count"] = $count;

		// 処理結果を返す
		$result = json_encode($data);
		header("Access-Control-Allow-Origin: *");
		echo($result);
		exit;
	}

	public function getUnexpireConnectionInfoListAction(){
		$form = $this->_getAllParams();

		$data = array();
		$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);

		$clientId = $form["clientId"];
		$staffType = $form["staffType"];
		$staffId = $form["staffId"];
		$connectionInfoList = $apiModel->getUnexpireConnectionInfoList($clientId, $staffType, $staffId);

		if (empty($connectionInfoList)) {
			$data["result"] = 3;
			$data["error"] = "接続情報が見つかりませんでした";
		} else {
			$data["result"] = 1;
			$data["connection_info_list"] = $connectionInfoList;
		}

		// 処理結果を返す
		$result = json_encode($data);
		header("Access-Control-Allow-Origin: *");
		echo($result);
		exit;
	}

	public function getServerDatetimeAction(){
		$form = $this->_getAllParams();

		$timestamp = time();

		$data = array();
		$data["result"] = 1;
		$data["datetime"] = date("Y-m-d H:i:s", $timestamp);

		// 処理結果を返す
		$result = json_encode($data);
		header("Access-Control-Allow-Origin: *");
		echo($result);
		exit;
	}

	public function removePeerIdFromConnectionInfoAction(){
		$form = $this->_getAllParams();

		$id = $form["id"];
		$peerId = $form["peerId"];

		$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);

		$connectionInfo = $apiModel->removePeerIdFromConnectionInfo($id, $peerId);

		if (empty($connectionInfo)) {
			$data["result"] = 4;
			$data["error"] = "接続情報が取得できませんでした";
		} else {
			$data["result"] = 1;
			$data["connection_info"] = $connectionInfo;
		}

		// 処理結果を返す
		$result = json_encode($data);
		header("Access-Control-Allow-Origin: *");
		echo($result);
		exit;
	}

	public function dataConnectionConnectLogAction(){
		$form = $this->_getAllParams();

		$data = array();
		$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);

		$connection_info_id = $form["connection_info_id"];
		$connect_no = $form["connect_no"];
		$connection_type = $form["connection_type"];
		$connection_id = $form["connection_id"];
		$from_peer_id = $form["from_peer_id"];
		$to_peer_id = $form["to_peer_id"];
		$from_user_id = $form["from_user_id"];
		$to_user_id = $form["to_user_id"];

		$id = $apiModel->dataConnectionConnectLog($connection_info_id, $connect_no, $connection_type, $connection_id, $from_peer_id, $to_peer_id, $from_user_id, $to_user_id);

		if (empty($id)) {
			$data["result"] = 2;
			$data["error"] = "DataConnectionのログが作成できませんでした";
		} else {
			$data["result"] = 1;
			$data["id"] = $id;
		}

		// 処理結果を返す
		$result = json_encode($data);
		header("Access-Control-Allow-Origin: *");
		echo($result);
		exit;
	}

	public function dataConnectionOpen1LogAction(){
		$form = $this->_getAllParams();

		$data = array();
		$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);

		$connection_info_id = $form["connection_info_id"];
		$connection_type = $form["connection_type"];
		$connection_id = $form["connection_id"];
		$from_peer_id = $form["from_peer_id"];
		$to_peer_id = $form["to_peer_id"];

		$count = $apiModel->dataConnectionOpen1Log($connection_info_id, $connection_type, $connection_id, $from_peer_id, $to_peer_id);

		if (empty($count)) {
			$data["result"] = 2;
			$data["error"] = "DataConnectionのログが更新されませんでした";
		} else {
			$data["result"] = 1;
			$data["count"] = $count;
		}

		// 処理結果を返す
		$result = json_encode($data);
		header("Access-Control-Allow-Origin: *");
		echo($result);
		exit;
	}

	public function dataConnectionOpen2LogAction(){
		$form = $this->_getAllParams();

		$data = array();
		$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);

		$connection_info_id = $form["connection_info_id"];
		$connection_type = $form["connection_type"];
		$connection_id = $form["connection_id"];
		$from_peer_id = $form["from_peer_id"];
		$to_peer_id = $form["to_peer_id"];

		$count = $apiModel->dataConnectionOpen2Log($connection_info_id, $connection_type, $connection_id, $from_peer_id, $to_peer_id);

		if (empty($count)) {
			$data["result"] = 2;
			$data["error"] = "DataConnectionのログが更新されませんでした";
		} else {
			$data["result"] = 1;
			$data["count"] = $count;
		}

		// 処理結果を返す
		$result = json_encode($data);
		header("Access-Control-Allow-Origin: *");
		echo($result);
		exit;
	}

	public function dataConnectionClose1LogAction(){
		$form = $this->_getAllParams();

		$data = array();
		$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);

		$connection_info_id = $form["connection_info_id"];
		$connection_type = $form["connection_type"];
		$connection_id = $form["connection_id"];
		$from_peer_id = $form["from_peer_id"];
		$to_peer_id = $form["to_peer_id"];

		$count = $apiModel->dataConnectionClose1Log($connection_info_id, $connection_type, $connection_id, $from_peer_id, $to_peer_id);

		if (empty($count)) {
			$data["result"] = 2;
			$data["error"] = "DataConnectionのログが更新されませんでした";
		} else {
			$data["result"] = 1;
			$data["count"] = $count;
		}

		// 処理結果を返す
		$result = json_encode($data);
		header("Access-Control-Allow-Origin: *");
		echo($result);
		exit;
	}

	public function dataConnectionClose2LogAction(){
		$form = $this->_getAllParams();

		$data = array();
		$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);

		$connection_info_id = $form["connection_info_id"];
		$connection_type = $form["connection_type"];
		$connection_id = $form["connection_id"];
		$from_peer_id = $form["from_peer_id"];
		$to_peer_id = $form["to_peer_id"];

		$count = $apiModel->dataConnectionClose2Log($connection_info_id, $connection_type, $connection_id, $from_peer_id, $to_peer_id);

		if (empty($count)) {
			$data["result"] = 2;
			$data["error"] = "DataConnectionのログが更新されませんでした";
		} else {
			$data["result"] = 1;
			$data["count"] = $count;
		}

		// 処理結果を返す
		$result = json_encode($data);
		header("Access-Control-Allow-Origin: *");
		echo($result);
		exit;
	}

	public function mediaConnectionCallLogAction(){
		$form = $this->_getAllParams();

		$data = array();
		$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);

		$connection_info_id = $form["connection_info_id"];
		$connect_no = $form["connect_no"];
		$connection_type = $form["connection_type"];
		$connection_id = $form["connection_id"];
		$from_peer_id = $form["from_peer_id"];
		$to_peer_id = $form["to_peer_id"];
		$from_user_id = $form["from_user_id"];

		$id = $apiModel->mediaConnectionCallLog($connection_info_id, $connect_no, $connection_type, $connection_id, $from_peer_id, $to_peer_id, $from_user_id);

		if (empty($id)) {
			$data["result"] = 2;
			$data["error"] = "MediaConnectionのログが作成できませんでした";
		} else {
			$data["result"] = 1;
			$data["id"] = $id;
		}

		// 処理結果を返す
		$result = json_encode($data);
		header("Access-Control-Allow-Origin: *");
		echo($result);
		exit;
	}

	public function mediaConnectionAnswerLogAction(){
		$form = $this->_getAllParams();

		$data = array();
		$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);

		$connection_info_id = $form["connection_info_id"];
		$connection_type = $form["connection_type"];
		$connection_id = $form["connection_id"];
		$from_peer_id = $form["from_peer_id"];
		$to_peer_id = $form["to_peer_id"];
		$to_user_id = $form["to_user_id"];

		$count = $apiModel->mediaConnectionAnswerLog($connection_info_id, $connection_type, $connection_id, $from_peer_id, $to_peer_id, $to_user_id);

		if (empty($count)) {
			$data["result"] = 2;
			$data["error"] = "MediaConnectionのログが更新されませんでした";
		} else {
			$data["result"] = 1;
			$data["count"] = $count;
		}

		// 処理結果を返す
		$result = json_encode($data);
		header("Access-Control-Allow-Origin: *");
		echo($result);
		exit;
	}

	public function mediaConnectionStreamSendConfirmLogAction(){
		$form = $this->_getAllParams();

		$data = array();
		$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);

		$connection_info_id = $form["connection_info_id"];
		$connection_type = $form["connection_type"];
		$connection_id = $form["connection_id"];
		$from_peer_id = $form["from_peer_id"];
		$to_peer_id = $form["to_peer_id"];

		$count = $apiModel->mediaConnectionStreamSendConfirmLog($connection_info_id, $connection_type, $connection_id, $from_peer_id, $to_peer_id);

		if (empty($count)) {
			$data["result"] = 2;
			$data["error"] = "MediaConnectionのログが更新されませんでした";
		} else {
			$data["result"] = 1;
			$data["count"] = $count;
		}

		// 処理結果を返す
		$result = json_encode($data);
		header("Access-Control-Allow-Origin: *");
		echo($result);
		exit;
	}

	public function mediaConnectionStream1LogAction(){
		$form = $this->_getAllParams();

		$data = array();
		$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);

		$connection_info_id = $form["connection_info_id"];
		$connection_type = $form["connection_type"];
		$connection_id = $form["connection_id"];
		$from_peer_id = $form["from_peer_id"];
		$to_peer_id = $form["to_peer_id"];

		$count = $apiModel->mediaConnectionStream1Log($connection_info_id, $connection_type, $connection_id, $from_peer_id, $to_peer_id);

		if (empty($count)) {
			$data["result"] = 2;
			$data["error"] = "MediaConnectionのログが更新されませんでした";
		} else {
			$data["result"] = 1;
			$data["count"] = $count;
		}

		// 処理結果を返す
		$result = json_encode($data);
		header("Access-Control-Allow-Origin: *");
		echo($result);
		exit;
	}

	public function mediaConnectionStream2LogAction(){
		$form = $this->_getAllParams();

		$data = array();
		$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);

		$connection_info_id = $form["connection_info_id"];
		$connection_type = $form["connection_type"];
		$connection_id = $form["connection_id"];
		$from_peer_id = $form["from_peer_id"];
		$to_peer_id = $form["to_peer_id"];

		$count = $apiModel->mediaConnectionStream2Log($connection_info_id, $connection_type, $connection_id, $from_peer_id, $to_peer_id);

		if (empty($count)) {
			$data["result"] = 2;
			$data["error"] = "MediaConnectionのログが更新されませんでした";
		} else {
			$data["result"] = 1;
			$data["count"] = $count;
		}

		// 処理結果を返す
		$result = json_encode($data);
		header("Access-Control-Allow-Origin: *");
		echo($result);
		exit;
	}

	public function mediaConnectionClose1LogAction(){
		$form = $this->_getAllParams();

		$data = array();
		$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);

		$connection_info_id = $form["connection_info_id"];
		$connection_type = $form["connection_type"];
		$connection_id = $form["connection_id"];
		$from_peer_id = $form["from_peer_id"];
		$to_peer_id = $form["to_peer_id"];

		$count = $apiModel->mediaConnectionClose1Log($connection_info_id, $connection_type, $connection_id, $from_peer_id, $to_peer_id);

		if (empty($count)) {
			$data["result"] = 2;
			$data["error"] = "MediaConnectionのログが更新されませんでした";
		} else {
			$data["result"] = 1;
			$data["count"] = $count;
		}

		// 処理結果を返す
		$result = json_encode($data);
		header("Access-Control-Allow-Origin: *");
		echo($result);
		exit;
	}

	public function mediaConnectionClose2LogAction(){
		$form = $this->_getAllParams();

		$data = array();
		$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);

		$connection_info_id = $form["connection_info_id"];
		$connection_type = $form["connection_type"];
		$connection_id = $form["connection_id"];
		$from_peer_id = $form["from_peer_id"];
		$to_peer_id = $form["to_peer_id"];

		$count = $apiModel->mediaConnectionClose2Log($connection_info_id, $connection_type, $connection_id, $from_peer_id, $to_peer_id);

		if (empty($count)) {
			$data["result"] = 2;
			$data["error"] = "MediaConnectionのログが更新されませんでした";
		} else {
			$data["result"] = 1;
			$data["count"] = $count;
		}

		// 処理結果を返す
		$result = json_encode($data);
		header("Access-Control-Allow-Origin: *");
		echo($result);
		exit;
	}

	public function saveFileAction() {
		$this->config = Zend_Registry::get('config');

		$uploadData = $_POST['data'];
		$uploadData = substr($uploadData,strpos($uploadData,",")+1);
		$uploadData = base64_decode($uploadData);
		$file = $this->config->screen_capture->filename;
		$screenCaptureDir = $this->config->screen_capture->path . "screen_capture_".$_POST['connection_info_id'];
		file_put_contents($screenCaptureDir.'/'.$file, $uploadData);

		// 処理結果を返す
		$data = array();
		$data["result"] = 1;
		$data["screenCaptureDir"] = $screenCaptureDir;
		$data["file"] = $file;
		$result = json_encode($data);
		header("Access-Control-Allow-Origin: *");
		echo($result);
		exit;
	}

	public function traceLogAction(){
		$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);

		$form = $this->_getAllParams();
		$connection_info_id = $form["connection_info_id"];	// connection_infoのID
		$connect_no =  $form["connect_no"];
		$message = $form["message"];						// メッセージ
		$type = $form["type"];								// 種類(0:初期値)

		$command = (!empty($form["command"]) ? $form["command"]:null);						// コマンド
		$from_peer_id = (!empty($form["from_peer_id"]) ? $form["from_peer_id"]:null);		// From_id
		$to_peer_id = (!empty($form["to_peer_id"]) ? $form["to_peer_id"]:null);				// To_id

		$user_agent = $_SERVER['HTTP_USER_AGENT'];			// ユーザエージェント
		$ip = $_SERVER["REMOTE_ADDR"];						// IPアドレス

		// 処理結果を返す(先にブラウザへ結果を返し処理する)
		$data = array();
		$data["result"] = 1;
		$result = json_encode($data);
		header("Access-Control-Allow-Origin: *");
		echo($result);
		// 出力バッファの内容を送信する
		@ob_flush();
		@flush();

//		$apiModel->TraceLog($connection_info_id, $connect_no, $message, $type, $user_agent, $ip, $command, $from_peer_id, $to_peer_id);

		exit;
	}

	public function errorLogAction(){
		$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);

		$form = $this->_getAllParams();

		$type = $form["Type"];																		// 種類(0:初期値)
		$connection_id = (!empty($form["Connection_info_id"]) ? $form["Connection_info_id"]:null);	// connection_infoのID
		$room_name = (!empty($form["Room_name"]) ? $form["Room_name"]:null);						// Room_name
		$user_id = (!empty($form["User_id"]) ? $form["User_id"]:null);								// User_id
		$peer_id = (!empty($form["Peer_id"]) ? $form["Peer_id"]:null);								// Peer_id
		$command = (!empty($form["Command"]) ? $form["Command"]:null);								// Command
		$message = $form["Message"];																// メッセージ

		$user_agent = $_SERVER['HTTP_USER_AGENT'];	// ユーザエージェント
		$ip = $_SERVER["REMOTE_ADDR"];				// IPアドレス

		$this->_logger->debug("errorLogAction connection_id=(".$connection_id.")");
		$this->_logger->debug("errorLogAction room_name=(".$room_name.")");
		$this->_logger->debug("errorLogAction user_id=(".$user_id.")");

		// 処理結果を返す(先にブラウザへ結果を返し処理する)
		$data = array();
		$data["result"] = 1;
		$result = json_encode($data);
		header("Access-Control-Allow-Origin: *");
		echo($result);

		// 出力バッファの内容を送信する
		@ob_flush();
		@flush();

		$apiModel->ErrorLog($connection_id ,$room_name, $user_id, $type, $peer_id, $command, $message, $user_agent, $ip);
		exit;
	}

	// ルーム名存在チェック(ajax)
	//
	public function existRoomNameAction() {
		// 操作ログ
		$form = $this->_getAllParams();
		// モデル宣言
		$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);
		$result = $apiModel->existRoomName($form);
		echo $result;
		exit;
	}
	// ルームロック状態取得
	public function getRoomStatusAction() {
		$form = $this->_getAllParams();
		// モデル宣言
		$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);

		echo $result;
		exit;
	}
	// ルームロック状態設定
	public function setRoomStatusAction() {
		$form = $this->_getAllParams();
		// モデル宣言
		$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);

		echo $result;
		exit;
	}

	// クライアントからのログ書き込み要求
	public function clientLogAction(){
		$form = $this->_getAllParams();
$this->_logger->info("clientLogAction [START]");
$this->_logger->info("FROM params=[". print_r($form, true) ."]");

		$level = $form["Level"];												// LogLevel(DEBUG,INFO,ERROR)
		$room_name = (!empty($form["Room_name"]) ? $form["Room_name"]:null);	// Room_name
		$user_id = (!empty($form["User_id"]) ? $form["User_id"]:null);			// User_id
		$staff_id = (!empty($form["Staff_id"]) ? $form["Staff_id"]:null);		// Staff_id
		$peer_id = (!empty($form["Peer_id"]) ? $form["Peer_id"]:null);			// Peer_id
		$user_name = (!empty($form["User_name"]) ? $form["User_name"]:null);		// User_name
		$message = $form["Message"];											// メッセージ

		$user_agent = $_SERVER['HTTP_USER_AGENT'];	// ユーザエージェント
		$ip = $_SERVER["REMOTE_ADDR"];				// IPアドレス

		$outstr = "clientLogAction room_name=(".$room_name."),";
		$outstr .= "user_id=(".$user_id."),";
		$outstr .= "staff_id=(".$staff_id."),";
		$outstr .= "peer_id=(".$peer_id."),";
		$outstr .= "user_agent=(".$user_agent."),";
		$outstr .= "remote_ip=(".$ip."),";
		$outstr .= "user_name=(".$user_name."),";
		$outstr .= "message=(".$message.")";
		if ($level == "ERROR") {
			$this->_logger2->error($outstr);
		} else if ($level == "INFO") {
			$this->_logger2->info($outstr);
		} else {
			$this->_logger2->debug($outstr);
		}

		// 処理結果を返す
		$data = array();
		$data["result"] = 1;
		$result = json_encode($data);
		header("Access-Control-Allow-Origin: *");
		echo($result);

$this->_logger->info("clientLogAction [END]");
		exit;
	}

	/**
	 * ウェビナー申し込み前の説明画面を表示する
	 */
	public function webinarDescriptionAction() {
		$form = $this->_getAllParams();
		$request = $this->getRequest();
		// モデル宣言
		$webinarParticipantModel = Application_CommonUtil::getInstance("model", "WebinarParticipantModel", $this->db);
		// ウェビナー参加フォームに必要な情報を取得する
		$webinar = $webinarParticipantModel->getParticipantFormInfo($form);
		if($webinar){
			// ウェビナー情報が取得できた場合は、参加フォームを表示する
			$this->view->webinar = $webinar;
			echo $this->view->render(realpath('../application/smarty/templates/webinar-participant/webinar-description.tpl'));
		}else{
			// ウェビナー情報が取得できなかった場合は、不正なURLなので説明ページへ遷移する
			echo $this->view->render(realpath('../application/smarty/templates/webinar-participant/bad-webinar-url.tpl'));
		}	
	}

	/**
	 * ウェビナー申し込み前の説明画面を表示する
	 * 短縮URLバージョン（webinarDescriptionAction()と同じ処理を行う）
	 */
	public function webiDescAction() {
		$form = $this->_getAllParams();
		$request = $this->getRequest();
		// モデル宣言
		$webinarParticipantModel = Application_CommonUtil::getInstance("model", "WebinarParticipantModel", $this->db);
		// ウェビナー参加フォームに必要な情報を取得する
		$webinar = $webinarParticipantModel->getParticipantFormInfo($form);
		if($webinar){
			// ウェビナー情報が取得できた場合は、参加フォームを表示する
			$this->view->webinar = $webinar;
			echo $this->view->render(realpath('../application/smarty/templates/webinar-participant/webinar-description.tpl'));
		}else{
			// ウェビナー情報が取得できなかった場合は、不正なURLなので説明ページへ遷移する
			echo $this->view->render(realpath('../application/smarty/templates/webinar-participant/bad-webinar-url.tpl'));
		}	
	}

	/**
	 * ウェビナー説明画面のお問い合わせ送信
	 */
	public function sendWebinarInquiryAction() {
		$form = $this->_getAllParams();
		$request = $this->getRequest();
		// モデル宣言
		$webinarParticipantModel = Application_CommonUtil::getInstance("model", "WebinarParticipantModel", $this->db);
		// ウェビナーのお問い合わせを主催者に送信する
		$result = $webinarParticipantModel->sendWebinarInquiry($form);
		echo json_encode($result);
		exit;
	}

	/**
	 * ウェビナー申し込み
	 * 初期表示と、登録処理を行う
	 */
	public function webinarParticipantFormAction() {
		$form = $this->_getAllParams();
		$request = $this->getRequest();
		// モデル宣言
		$webinarParticipantModel = Application_CommonUtil::getInstance("model", "WebinarParticipantModel", $this->db);
		// POSTデータが存在する場合は、登録・更新処理を行う
		if ($request->isPost()){
			// ウェビナー参加申請登録
			$result = $webinarParticipantModel->registParticipantForm($form);
			echo json_encode($result);
			exit;
		}else{
			// ウェビナー参加フォームに必要な情報を取得する
			$webinar = $webinarParticipantModel->getParticipantFormInfo($form);
			if($webinar){
				// ウェビナー情報が取得できた場合は、参加フォームを表示する
				$this->view->webinar = $webinar;
				if (preg_match('/Android|iPhone|iPad|iPod|BlackBerry|IEMobile/i', $_SERVER['HTTP_USER_AGENT'])) {
					// モバイルの場合
					echo $this->view->render(realpath('../application/smarty/templates/webinar-participant/webinar-participant-form-sp.tpl'));
				}else{
					// PCの場合
					echo $this->view->render(realpath('../application/smarty/templates/webinar-participant/webinar-participant-form.tpl'));
				}
			}else{
				// ウェビナー情報が取得できなかった場合は、不正なURLなので説明ページへ遷移する
				echo $this->view->render(realpath('../application/smarty/templates/webinar-participant/bad-webinar-url.tpl'));
			}	
		}
	}
	/**
	 * ウェビナー登録完了画面表示用
	 */
	public function webinarParticipantCompleteAction() {
		$form = $this->_getAllParams();
		// モデル宣言
		$webinarParticipantModel = Application_CommonUtil::getInstance("model", "WebinarParticipantModel", $this->db);
		// ウェビナー情報取得
		$webinar = $webinarParticipantModel->getWebinarInfo($form);
		// ウェビナー情報を画面に設定
		$this->view->webinar = $webinar;
		echo $this->view->render(realpath('../application/smarty/templates/webinar-participant/webinar-participant-complete.tpl'));
	}

	/**
	 * ウェビナーキャンセル
	 */
	public function webinarParticipantCancelAction() {
		$form = $this->_getAllParams();
		$request = $this->getRequest();
		// モデル宣言
		$webinarParticipantModel = Application_CommonUtil::getInstance("model", "WebinarParticipantModel", $this->db);
		// POSTデータが存在する場合は、登録・更新処理を行う
		if ($request->isPost()){
			// ウェビナーキャンセル申請登録
			$result = $webinarParticipantModel->cancelParticipantForm($form);
			echo json_encode($result);
			exit;
		}else{
			// ウェビナー参加フォームに必要な情報を取得する
			$webinar = $webinarParticipantModel->getParticipantCancel($form);
			if($webinar){
				// ウェビナー情報が取得できた場合は、参加フォームを表示する
				$this->view->webinar = $webinar;
				echo $this->view->render(realpath('../application/smarty/templates/webinar-participant/webinar-participant-cancel.tpl'));
			}else{
				// ウェビナー情報が取得できなかった場合は、不正なURLなので説明ページへ遷移する
				echo $this->view->render(realpath('../application/smarty/templates/webinar-participant/bad-webinar-url.tpl'));
			}	
		}
	}

	/**
	 * ウェビナーキャンセル
	 * 短縮URLバージョン（webinarParticipantCancelAction()と同じ処理を行う）
	 */
	public function webiCxlAction() {
		$form = $this->_getAllParams();
		$request = $this->getRequest();
		// モデル宣言
		$webinarParticipantModel = Application_CommonUtil::getInstance("model", "WebinarParticipantModel", $this->db);
		// POSTデータが存在する場合は、登録・更新処理を行う
		if ($request->isPost()){
			// ウェビナーキャンセル申請登録
			$result = $webinarParticipantModel->cancelParticipantForm($form);
			echo json_encode($result);
			exit;
		}else{
			// ウェビナー参加フォームに必要な情報を取得する
			$webinar = $webinarParticipantModel->getParticipantCancel($form);
			if($webinar){
				// ウェビナー情報が取得できた場合は、参加フォームを表示する
				$this->view->webinar = $webinar;
				echo $this->view->render(realpath('../application/smarty/templates/webinar-participant/webinar-participant-cancel.tpl'));
			}else{
				// ウェビナー情報が取得できなかった場合は、不正なURLなので説明ページへ遷移する
				echo $this->view->render(realpath('../application/smarty/templates/webinar-participant/bad-webinar-url.tpl'));
			}	
		}
	}

	/**
	 * ウェビナーキャンセル完了画面表示用
	 */
	public function webinarParticipantCancelCompleteAction() {
		$form = $this->_getAllParams();
		// モデル宣言
		$webinarParticipantModel = Application_CommonUtil::getInstance("model", "WebinarParticipantModel", $this->db);
		// ウェビナー情報取得
		$webinar = $webinarParticipantModel->getWebinarInfo($form);
		// ウェビナー情報を画面に設定
		$this->view->webinar = $webinar;
		echo $this->view->render(realpath('../application/smarty/templates/webinar-participant/webinar-participant-cancel-complete.tpl'));
	}

	/**
	 * メールの開封通知を登録する
	 */
	public function getEmailImageAction() {
		error_log("getEmailImageAction:".json_encode($_SERVER));
		// モデル宣言
		$webinarMailModel = Application_CommonUtil::getInstance("model", "WebinarMailModel", $this->db);
		// メール開封通知を設定する
		$result = $webinarMailModel->registDisplayEmail();
		echo "";
		exit;
	}

	/**
	 * セッションの有無を判定し、主催者か参加者かを判定し
	 * 適切なウェビナールームへ遷移させる
	 */
	public function webiRoomAction() {
		error_log("webinarRoomAction:".json_encode($_SERVER));
		// ルーム名を取得する
		$webinarRooName = end(explode("/", $_SERVER['REQUEST_URI']));
		if($this->user){
			// モデル宣言
			$webinarModel = Application_CommonUtil::getInstance("model", "WebinarModel", $this->db);
			// ウェビナー情報取得
			$webinarAdminKey = $webinarModel->getWebinarAdminKey($webinarRooName);
			if($webinarAdminKey != ""){
				// 主催者複数人対応でURLのパラメータ追加(staff_type/AA/staff_id/2/client_id/2)
				$publisherParam = base64_encode(json_encode(array(
					"staff_type" => $this->user["staff_type"], 
					"staff_id" => $this->user["staff_id"], 
					"client_id" => $this->user["client_id"] 
				)));
				$url = parent::getWebinarRoomUrl()."/publisher/{$webinarAdminKey}/staff_info/{$publisherParam}";
				header("Location: {$url}");
			}
		}else{
			// 参加者はルーム名を元にウェビナー画面へ遷移する
			$url = parent::getWebinarRoomUrl()."/seminar/{$webinarRooName}";
			header("Location: {$url}");
		}
		exit;
	}

	/**
	 * 主催者用のオープンセミナーURL
	 * 主催者はMEETINトップメニューから非同期で通信するので、
	 * 一度戻り値を返し、画面のJSから遷移させる。
	 */
	public function publisherOpenSeminarAction() {
		error_log("publisherOpenSeminarAction:".json_encode($_SERVER));
		// 戻り値を設定
		$result = array("status"=>0);
		if($this->user){
			// 主催者の入室
			$form = $this->_getAllParams();
			// モデル宣言
			$openSeminarModel = Application_CommonUtil::getInstance("model", "OpenSeminarModel", $this->db);
			// ウェビナー情報の作成（存在する場合は、取得し流用する）
			$result = $openSeminarModel->setOpenRoom($form);
			if($result["status"]){
				// リダイレクトURLを作成
				$result["url"] = parent::getWebinarRoomUrl()."/publisher/{$result['webinarAdminKey']}";
			}
		}
		echo json_encode($result);
		exit;
	}

	/**
	 * 利用者用のオープンセミナーURL
	 * 利用者はURLを実行し通信するので、この機能で遷移させる。
	 */
	public function openSeminarAction() {
		error_log("openSeminarAction:".json_encode($_SERVER));
		// ルーム名を取得する
		$webinarName = end(explode("/", $_SERVER['REQUEST_URI']));
		// モデル宣言
		$openSeminarModel = Application_CommonUtil::getInstance("model", "OpenSeminarModel", $this->db);
		// 参加者情報を登録する
		$result = $openSeminarModel->setOpenSeminarParticipant($webinarName);
		if($result["uniqueKey"]){
			// 参加者登録が完了した場合は、ウェビナーへ遷移させる
			$url = parent::getWebinarRoomUrl()."/seminar/{$result["uniqueKey"]}";
			header("Location: {$url}");
		}else{
			// meet-in TOPへ遷移
			$url = "https://" . $_SERVER['SERVER_NAME'];
			header("Location: {$url}");
		}
	}

	/**
	 * =======================================================
	 * 以下、webinarサーバーからの外部接続受付API
	 * サーバーが特定できているので、接続元のIPを参照し認証を行う
	 * =======================================================
	 */
	/**
	 * ウェビナーサーバーから外部接続した場合に、
	 * 接続元が正しいか認証する
	 */
	private function webinarAuth(){
		// 外部接続してくるwebinarサーバーのIP一覧
		$webinarServerIps = array(
			"153.126.171.24",
			"133.242.23.227",
			"153.120.82.81",
		);
		// webinarサーバーのIP一覧に存在するIPからの接続であれば認証する
		$auth = false;
		if(in_array($_SERVER["REMOTE_ADDR"], $webinarServerIps)){
			$auth = true;
		}
		return $auth;
	}
	/**
	 * 接続テスト用
	 */
	public function connectionTestAction(){
		// webinar認証
		if($this->webinarAuth()){
			$form = $this->_getAllParams();
			echo json_encode($form);
		}else{
			// 不正な接続
			echo json_encode(array());
			exit;
		}
	}
	/**
	 * 資料を保存する
	 * ページ変更やビデオ表示時の保存処理
	 */
	public function saveMaterialAction() {
		// webinar認証
		if($this->webinarAuth()){
			$form = $this->_getAllParams();
			// モデル宣言
			$materialModel = Application_CommonUtil::getInstance("model", "MaterialModel", $this->db);
			$materialModel->saveMaterial($form);
			echo "1";
		}else{
			// 不正な接続
			echo json_encode(array());
		}
		exit;
	}
	/**
	 * 資料共有のキャンバスを削除する
	 */
	public function deleteCanvasMaterialAction() {
		// webinar認証
		if($this->webinarAuth()){
			$form = $this->_getAllParams();
			// モデル宣言
			$materialModel = Application_CommonUtil::getInstance("model", "MaterialModel", $this->db);
			$resultJson = $materialModel->deleteCanvasMaterial($form);
			// 資料のjsonデータを画面に返す
			echo $resultJson;	
		}else{
			// 不正な接続
			echo json_encode(array());
		}
		exit;
	}
	public function chackCanvasImgAction(){
		// webinar認証
		if($this->webinarAuth()){
			$form = $this->_getAllParams();
			// モデル宣言
			$materialModel = Application_CommonUtil::getInstance("model", "MaterialModel", $this->db);
			$result = $materialModel->chackCanvasImg($form);
			echo $result;
		}else{
			// 不正な接続
			echo json_encode(array());
		}
		exit;
	}
	/**
	 * 資料共有のモーダルで選択した資料を取得する
	 */
	public function getMaterialAction(){
		// webinar認証
		if($this->webinarAuth()){
			$form = $this->_getAllParams();
			// モデル宣言
			$materialModel = Application_CommonUtil::getInstance("model", "MaterialModel", $this->db);
			$resultJson = $materialModel->getMaterial($form);
			// 資料のjsonデータを画面に返す
			echo $resultJson;
		}else{
			// 不正な接続
			echo json_encode(array());
		}
		exit;
	}
	/**
	 * 資料をダウンロードする
	 */
	public function downloadDocumentAction(){
		// webinar認証
		if($this->webinarAuth()){
			$form = $this->_getAllParams();
			// モデル宣言
			$materialModel = Application_CommonUtil::getInstance("model", "MaterialModel", $this->db);
			$pdfFilePath = $materialModel->createDocumentPdf($form);
			if($pdfFilePath){
				// 出力するファイル名
				$pdfFileName = "document_".date("Ymdhis").".pdf";
				// ダウンロードするダイアログを出力
				header("Content-Disposition: attachment; filename={$pdfFileName}");
				// ファイルを読み込んで出力
				readfile($pdfFilePath);
			}
		}else{
			// 不正な接続
			echo json_encode(array());
		}
		exit;
	}

	/**
	 * 資料をアップロードする
	 */
	public function uploadMaterialAction()
	{
		// webinar認証
		if($this->webinarAuth()){
			$form = $this->_getAllParams();
			// モデル宣言
			$materialModel = Application_CommonUtil::getInstance("model", "MaterialModel", $this->db);
			$result = $materialModel->uploadMaterial($form);
			echo json_encode($result);
		}else{
			// 不正な接続
			echo json_encode(array());
		}
		exit;
	}
}
