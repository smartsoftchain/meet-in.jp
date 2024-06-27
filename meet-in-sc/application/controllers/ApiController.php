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
		if (!isset($id)) {
			$data["result"] = 3;
			$data["error"] = "IDがありません";
		} else if (!isset($userId)) {
			$data["result"] = 5;
			$data["error"] = "User IDがありません";
		} else if ($userId < 0 || $userId > 8) {
			$data["result"] = 6;
			$data["error"] = "User IDが正しくありません";
		} else {

			// 認証済み情報を取り出す
			$loginFlg = 0;
			if ($this->user) {
				$loginFlg = 1;
			}
			$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);

			$apiModel->saveWebRtcParam(array('peer_id' => $peerId));

			$connectionInfo = $apiModel->updateConnectionInfoPeerId($id, $userId, $peerId, $loginFlg);
			if (empty($connectionInfo)) {
				$data["result"] = 4;
				$data["error"] = "接続情報が取得できませんでした";
			} else {
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

error_log(date("Y年m月d日 H時i分s秒")."商談終了(finishConnectionInfoAction) START：".json_encode($form)."\n", 3, "/var/tmp/negotiation.log");

		$data = array();
		if (empty($form["id"])) {
			$data["result"] = 2;
			$data["error"] = "接続情報のIDがありません";
//error_log(date("Y年m月d日 H時i分s秒")."接続情報のIDがありません：".json_encode($form)."\n", 3, "/var/tmp/negotiation.log");
		} else {
			$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);
			$count = $apiModel->finishConnectionInfo($form["id"]);
			if ($count > 0) {
				$data["result"] = 1;
			} else {
				$data["result"] = 3;
				$data["error"] = "接続情報が見つかりませんでした";
//error_log(date("Y年m月d日 H時i分s秒")."接続情報が見つかりませんでした：".json_encode($form)."\n", 3, "/var/tmp/negotiation.log");
			}
		}

		// 処理結果を返す
//error_log(date("Y年m月d日 H時i分s秒")."商談終了 END：".$result."\n", 3, "/var/tmp/negotiation.log");
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

		$apiModel->TraceLog($connection_info_id, $connect_no, $message, $type, $user_agent, $ip, $command, $from_peer_id, $to_peer_id);

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

}
