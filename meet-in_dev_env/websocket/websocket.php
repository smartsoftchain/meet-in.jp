<?php
	use Ratchet\MessageComponentInterface;
	use Ratchet\ConnectionInterface;
	use Ratchet\Server\IoServer;
	use Ratchet\WebSocket\WsServer;
	use Ratchet\Http\HttpServer;

	require __DIR__.'/vendor/autoload.php';

	/**
	 * websocket.php
	 * Send any incoming messages to all connected clients (except sender)
	 */
	class myWebsocket implements MessageComponentInterface {

		protected $clients;
		protected $users;
		const USER_SV = 1;						// SVのユーザー種別
		const USER_OPERATOR = 2;				// オペレーターのユーザー種別
		const STAFF_TYPE_AA = "AA";				// スタッフ種別
		const STAFF_TYPE_TA = "TA";				// スタッフ種別
		const STAFF_TYPE_CE = "CE";				// スタッフ種別
		const CALL_STATE = 6;					// アスタリスクから送信されるNotifStateで通話開始を表す6
		const HANGUP_PARK_SLOT = 34;			// ポーク保留中のアプローチ先が切断した場合を表す34
		const LAST_FOUR_DIGIT_MIZ = 4999;		// miz phoneは下４桁が4999までとなっている
		const LAST_FOUR_DIGIT_WEBRTC = 5000;	// miz phoneは下４桁が4999までとなっている

		public function __construct() {
			$this->clients = new \SplObjectStorage;
		}

		public function onOpen(ConnectionInterface $conn) {
			$this->clients->attach($conn);
			echo "New connection! ({$conn->resourceId})\n";
		}

		public function onMessage(ConnectionInterface $from, $msg) {
			// ================================================================================================
			// 引数と戻り値のデータルール
			// ["dataType"=>"画面で受け取った後に何の処理をするかの種別", "dataDict"=>"データ"]
			// ================================================================================================
			try{
				$msgDict = json_decode($msg, true);
				if(array_key_exists("dataType", $msgDict) && array_key_exists("dataDict", $msgDict)){
					// ============================================
					// webブラウザとwebsocketのやり取り
					// ============================================
					$dataType = $msgDict["dataType"];
					$dataDict = $msgDict["dataDict"];
					// 画面から送信されたキーを元に処理を振り分ける
					if($dataType == "handshakeInit"){
						// ハンドシェイク後の初期化処理
						var_dump("Handshake OK:[webphoneId:".$dataDict["webphone_id"]."][name:".$dataDict["name"]."]");
						
						// 新規コネクションを取得したユーザー情報と返信先をグローバル変数に保存する
						$dataDict["client"] = $from;
						$this->users[$dataDict["webphone_id"]] = $dataDict;
						
						// 接続情報取得と接続情報送信処理
						$this->handshakeInit($dataDict, $dataType);
						
					}elseif($dataType == "ringingOperator"){
						// オペレータが架電を開始するとapproach先名をSVへ送信する
						$this->ringingOperator($dataType, $dataDict);
					}elseif($dataType == "hangupOperator"){
						// オペレータが架電を終了すると終了メッセージをSVへ送信する
						$this->hangupOperator($dataType, $dataDict);
					}elseif($dataType == "onPredictCallFlg"){
						// オペレータが一斉発信を行うので、一斉発信フラグを立てる
						$this->onPredictCallFlg($dataType, $dataDict);
					}elseif($dataType == "parkHold"){
						// オペレータがパーク保留を開始するとパーク保留情報をSVへ送信する
						$this->parkHold($dataType, $dataDict);
					}elseif($dataType == "helpCall"){
						// オペレータのヘルプコールをSVへ送信する
						$this->helpCall($dataType, $dataDict);
					}elseif($dataType == "svParkPickup"){
						// スーパーバイザーがパーク保留をピックアップした情報をオペレーターへ送信する
						$this->svParkPickup($dataType, $dataDict);
					}elseif($dataType == "svHangupHelpCall"){
						// スーパーバイザーがHELPコールを切断した情報をオペレーターへ送信する
						$this->svHangupHelpCall($dataType, $dataDict);
					}else{
						$numRecv = count($this->clients) - 1;
						echo sprintf('Connection %d sending message "%s" to %d other connection%s' . "\n" , $from->resourceId, $msg, $numRecv, $numRecv == 1 ? '' : 's');
					}
				}else{
					// astariskからのメッセージ
					$this->sendAstariskMsg($msgDict);
				}
			}catch(Exception $e) {
				// エラーログを出力する
				$this->outputLog($msg, "msgJson");
				$this->outputLog($e->getMessage(), "Error Message");
			}
		}

		public function onClose(ConnectionInterface $conn) {
			$this->clients->detach($conn);
			echo "Connection {$conn->resourceId} has disconnected\n";
		}

		public function onError(ConnectionInterface $conn, \Exception $e) {
			echo date("Y-m-d H:i:s")." : An error has occurred: {$e->getMessage()}\n";
			$conn->close();
		}
		
		/**
		 * 送信対象のオペレーター又はSV全員にメッセージを送信する
		 * @param unknown $sendUser		メッセージを送信するユーザー情報
		 * @param unknown $sendMessage	送信するデータ
		 * @param unknown $sendUserType	SV又はオペレータの種別
		 * @return multitype:Ambigous <ConnectionInterface, unknown>	SV又はオペレータのリスト
		 */
		private function sendMessageOnUserAll($sendUser, $sendMessage, $sendUserType){
			$sendMessageUsers = array();
			foreach($this->users as $webphoneId=>&$user){
				$sendFlg = false;
				$routeNum = 0;
				if($user["user_type"] == $sendUserType && $sendUser["user_type"] == self::USER_SV){
					$routeNum = 1;
					// メッセージ送信者がSVの場合
					if($sendUser["staff_type"] == self::STAFF_TYPE_AA && empty($sendUser["client_id"])){
						$routeNum = 2;
						// AAがクライアント未選択時はAA/TAが送信対象
						if($user["staff_type"] == self::STAFF_TYPE_AA || $user["staff_type"] == self::STAFF_TYPE_TA){
							$routeNum = 3;
							$sendFlg = true;
						}
					}else if($sendUser["staff_type"] == self::STAFF_TYPE_AA && !empty($sendUser["client_id"])){
						$routeNum = 4;
						// AAがクライアント選択時はAA/TAと選択したクライアントの担当者が送信対象
						if($user["staff_type"] == self::STAFF_TYPE_AA || $user["staff_type"] == self::STAFF_TYPE_TA || ($user["staff_type"] == self::STAFF_TYPE_CE && $sendUser["client_id"] == $user["client_id"])){
							$routeNum = 5;
							$sendFlg = true;
						}
					}else if($sendUser["staff_type"] == self::STAFF_TYPE_CE){
						$routeNum = 6;
						// CEの場合は自クライアントの担当者が送信対象
						if($user["staff_type"] == self::STAFF_TYPE_CE && $sendUser["client_id"] == $user["client_id"]){
							$routeNum = 7;
							$sendFlg = true;
						}
					}
				}else if($user["user_type"] == $sendUserType && $sendUser["user_type"] == self::USER_OPERATOR){
					$routeNum = 8;
					// メッセージ送信者がオペレーターの場合
					if($sendUser["staff_type"] == self::STAFF_TYPE_AA && empty($sendUser["client_id"])){
						$routeNum = 9;
						// 送信者がAA且つクライアント未選択の場合はAAにのみにメッセージを送信
						if($user["staff_type"] == self::STAFF_TYPE_AA){
							$routeNum = 10;
							$sendFlg = true;
						}
					}else{
						$routeNum = 11;
						// 上記外の場合はAAと選択しているクライアントへメッセージを送信
						if($user["staff_type"] == self::STAFF_TYPE_AA || ($user["staff_type"] == self::STAFF_TYPE_CE && $sendUser["client_id"] == $user["client_id"])){
							$routeNum = 12;
							$sendFlg = true;
						}
					}
				}
				// ループのユーザーが送信対象の場合メッセージを送信する
				$this->outputLog($routeNum, "Route Status For Send Message From All");
				if($sendFlg){
					// オペレーター情報をリストに保存
					$sendMessageUsers[] = $user;
					// メッセージを送信
					if(!empty($user["client"])){
						// 送信先のオブジェクトが存在すれば送信する
						$user["client"]->send($sendMessage);
					}else{
						// 送信先のオブジェクトが存在しなければ変数から削除する
						unset($this->users[$webphoneId]);
					}
				}
			}
			return $sendMessageUsers;
		}
		
		/**
		 * ハンドシェイク後の初期化処理
		 * SVの場合は現在接続中のオペレータ情報を取得しつつ、オペレーターへSVの情報を送信する
		 * オペレータの場合は現在接続中のSV情報を取得しつつ、SVへオペレーター情報を送信する
		 * @param unknown $handshakeUser
		 * @param unknown $dataType
		 */
		private function handshakeInit($handshakeUser, $dataType){
			// 一部共通処理もあるが、オペレーターとSVの初期化の違いを明確に分ける為冗長に記述
			if($handshakeUser["user_type"]  == self::USER_SV){
				// ================================================
				// SVのハンドシェイク後の初期化処理
				// ================================================
				// オペレータに対しSVがハンドシェイクした事を通知する為の変数
				$result = array(
						"dataType" => $dataType,
						"dataDict" => array("svList" => array($handshakeUser))
				);
				$resultJson = json_encode($result);
				// 現在接続中のオペレータ情報を取得しつつ、SVがハンドシェイクした事を通知し、通知を行ったオペレーター情報を取得する
				$operatorList = $this->sendMessageOnUserAll($handshakeUser, $resultJson, self::USER_OPERATOR);
				// 取得したオペレーターの情報を自身(SV)に送信
				$result = array(
						"dataType" => $dataType,
						"dataDict" => array("operatorList" => $operatorList)
				);
				$resultJson = json_encode($result);
				$handshakeUser["client"]->send($resultJson);
			}elseif($handshakeUser["user_type"]  == self::USER_OPERATOR){
				// ================================================
				// OPERATORのハンドシェイク後の初期化処理
				// ================================================
				// SVに対しSVがハンドシェイクした事を通知する為の変数
				$result = array(
						"dataType" => $dataType,
						"dataDict" => array("operatorList" => array($handshakeUser))
				);
				$resultJson = json_encode($result);
				// 現在接続中のオペレータ情報を取得しつつ、SVがハンドシェイクした事を通知する
				$svList = $this->sendMessageOnUserAll($handshakeUser, $resultJson, self::USER_SV);
				// 取得したオペレーターの情報を自身(SV)に送信
				$result = array(
						"dataType" => $dataType,
						"dataDict" => array("svList" => $svList)
				);
				$resultJson = json_encode($result);
				$handshakeUser["client"]->send($resultJson);
			}
		}
		
		/**
		 * オペレーターが個別架電を行った際にSVへ架電先を通知する
		 * @param unknown $dataDict
		 */
		private function ringingOperator($dataType, $dataDict){
			// オペレータが個別架電を開始するとapproach先情報をSVへ送信する
			$this->users[$dataDict["webphone_id"]]['approach_list_name']	= $dataDict["approach_list_name"];
			$this->users[$dataDict["webphone_id"]]['company_name']			= $dataDict["company_name"];
			$this->users[$dataDict["webphone_id"]]['base_name']				= $dataDict["base_name"];
			$this->users[$dataDict["webphone_id"]]['person_name']			= $dataDict["person_name"];
			$this->users[$dataDict["webphone_id"]]['person_kana']			= $dataDict["person_kana"];
			$result = array(
					"dataType" => $dataType,
					"dataDict" => array("operatorDict" => $this->users[$dataDict["webphone_id"]])
			);
			$resultJson = json_encode($result);
			// 送信対象のSVへメッセージ送信
			$this->sendMessageOnUserAll($this->users[$dataDict["webphone_id"]], $resultJson, self::USER_SV);
		}
		
		/**
		 * オペレーターが架電終了した際にSVにメッセージを通知
		 * @param unknown $dataType
		 * @param unknown $dataDict
		 */
		private function hangupOperator($dataType, $dataDict){
			// オペレータが架電を終了した情報をSVへ送信する
			$this->users[$dataDict["webphone_id"]]['approach_list_name']	= $dataDict["approach_list_name"];
			$this->users[$dataDict["webphone_id"]]['company_name']			= $dataDict["company_name"];
			$this->users[$dataDict["webphone_id"]]['base_name']				= $dataDict["base_name"];
			$this->users[$dataDict["webphone_id"]]['person_name']			= $dataDict["person_name"];
			$this->users[$dataDict["webphone_id"]]['person_kana']			= $dataDict["person_kana"];
			$result = array(
					"dataType" => $dataType,
					"dataDict" => array("operatorDict" => $this->users[$dataDict["webphone_id"]])
			);
			$resultJson = json_encode($result);
			// 送信対象のSVへメッセージ送信
			$this->sendMessageOnUserAll($this->users[$dataDict["webphone_id"]], $resultJson, self::USER_SV);
		}
		
		/**
		 * オペレータが一斉発信を行うのでフラグを立てる
		 * フラグが立っている場合は、アスタリスクのログを監視し、notifStateが6のデータが送信されるとフラグを落とす
		 * @param unknown $dataType
		 * @param unknown $dataDict
		 */
		private function onPredictCallFlg($dataType, $dataDict){
			$this->users[$dataDict["webphone_id"]]["predict_call_flg"]	= "1";
		}
		
		/**
		 * オペレータがパーク保留を開始するとパーク保留情報をSVへ送信する
		 * @param unknown $dataType
		 * @param unknown $dataDict
		 */
		private function parkHold($dataType, $dataDict){
			$result = array(
					"dataType" => $dataType,
					"dataDict" => array("webphone_id" => $dataDict["webphone_id"], "type" => $dataDict["type"])
			);
			$resultJson = json_encode($result);
			// 送信対象のSVへメッセージ送信
			$this->sendMessageOnUserAll($this->users[$dataDict["webphone_id"]], $resultJson, self::USER_SV);
		}
		
		/**
		 * オペレータがヘルプコールをした事をSVへ送信する
		 * @param unknown $dataType
		 * @param unknown $dataDict
		 */
		private function helpCall($dataType, $dataDict){
			$result = array(
					"dataType" => $dataType,
					"dataDict" => array("webphone_id" => $dataDict["webphone_id"], "type" => $dataDict["type"])
			);
			$resultJson = json_encode($result);
			// HELPモーダルで指定したSVへメッセージ送信
			$this->users[$dataDict["sv_websocket_id"]]["client"]->send($resultJson);
		}
		
		/**
		 * スーパーバイザーがパーク保留をピックアップした情報をオペレーターへ送信する
		 * @param unknown $dataType
		 * @param unknown $dataDict
		 */
		private function svParkPickup($dataType, $dataDict){
			$result = array(
					"dataType" => $dataType,
					"dataDict" => array()
			);
			$resultJson = json_encode($result);
			// HELPモーダルで指定したSVへメッセージ送信
			$this->users[$dataDict["operator_webphone_id"]]["client"]->send($resultJson);
		}
		
		/**
		 * スーパーバイザーがHELPコールを切断した情報をオペレーターへ送信する
		 * @param unknown $dataType
		 * @param unknown $dataDict
		 */
		private function svHangupHelpCall($dataType, $dataDict){
			$result = array(
					"dataType" => $dataType,
					"dataDict" => array()
			);
			$resultJson = json_encode($result);
			// HELPモーダルで指定したSVへメッセージ送信
			$this->users[$dataDict["operator_webphone_id"]]["client"]->send($resultJson);
		}
		
		/**
		 * アスタリスクから送信されたメッセージをSVと担当者へ送信する
		 * @param unknown $msgDict
		 */
		private function sendAstariskMsg($msgDict){
			$this->outputLog(json_encode($msgDict), "AstariskMsg");
			
			// webRtcはwebphoneIdが5000足されるので、5000引く処理を追加する
			// 下４桁は必ず4999までになるように業務で回避する仕様となっている
			$lastFourDigit = substr($msgDict["CallerIDNum"], -4);
			if($lastFourDigit > self::LAST_FOUR_DIGIT_MIZ){
				$msgDict["CallerIDNum"] = (string)((int)$msgDict["CallerIDNum"] - self::LAST_FOUR_DIGIT_WEBRTC);
			}
			
			// ユーザーのステータスを書き換える
			if((int)$msgDict["NotifState"] > 99 || (int)$msgDict["NotifState"] == 0){
				// TODO 99以上は架電していないステータスのはずなので情報を初期化する
				$msgDict["NotifState"] = "0";
				$this->users[$msgDict["CallerIDNum"]]['approach_list_name']		= "";
				$this->users[$msgDict["CallerIDNum"]]['company_name']			= "";
				$this->users[$msgDict["CallerIDNum"]]['base_name']				= "";
				$this->users[$msgDict["CallerIDNum"]]['person_name']			= "";
				$this->users[$msgDict["CallerIDNum"]]['person_kana']			= "";
			}
			// 通信の都合によりステータスが前後する可能性があるので、前回のステータスより大きいステータスが来た場合のみメッセージを画面に返す
			if($msgDict["NotifState"] > $this->users[$msgDict["CallerIDNum"]]["status"] || $msgDict["NotifState"] == "0"){
				// オペレーターのステータスを設定する
				$this->users[$msgDict["CallerIDNum"]]["status"] = $msgDict["NotifState"];
				// 戻り値の生成
				$result = array(
						"dataType" => "asteriskLog",
						"dataDict" => $msgDict,
						"telUser"=> $this->users[$msgDict["CallerIDNum"]]
				);
				$resultJson = json_encode($result);
// 				if($this->users[$msgDict["CallerIDNum"]]["user_type"] == self::USER_SV){
// 					// SVのステータス変化は送信対象オペレーターへメッセージを送信する
// 					$this->sendMessageOnUserAll($this->users[$msgDict["CallerIDNum"]], $resultJson, self::USER_OPERATOR);
// 					// SVの通話終了時は自分自身に情報を送信する（ヘルプコール発信後に拒否された場合の処理）
// 					if($msgDict["NotifState"] === "0"){
// 						$svWebphoneId = $msgDict["CallerIDNum"];
// 						$opWebphoneId = $msgDict["Dialstring"];
// 						if($opWebphoneId != ""){
// 							$tmpMsgDict = $msgDict;
// 							$tmpMsgDict["CallerIDNum"] = $opWebphoneId;
// 							$tmpResultJson = json_encode(array(
// 																"dataType" => "asteriskLog",
// 																"dataDict" => $tmpMsgDict,
// 																"telUser"=> $this->users[$opWebphoneId]
// 														));
// 							$this->users[$svWebphoneId]["client"]->send($tmpResultJson);
// 						}
// 					}
// 				}else if($this->users[$msgDict["CallerIDNum"]]["user_type"] == self::USER_OPERATOR){
// 					// オペレーターのステータス変化は送信対象SVへメッセージを送信する
// 					$this->sendMessageOnUserAll($this->users[$msgDict["CallerIDNum"]], $resultJson, self::USER_SV);
// 				}
				// 一斉発信の際はオペレータに接続先を送信する必要があるので、一斉発信フラグが立っている場合のみオペレータへ情報を送信する
				if(!empty($this->users[$msgDict["CallerIDNum"]]["client"]) && $this->users[$msgDict["CallerIDNum"]]["predict_call_flg"] == "1"){
					if($msgDict["NotifState"] == self::CALL_STATE){
						// 架電者が特定できたので、一斉架電フラグを落とす
						$this->users[$msgDict["CallerIDNum"]]["predict_call_flg"] = "0";
						// アスタリスクログだが、ハンドリングした処理なのでdataTypeを変更する
						$result = array(
								"dataType" => "predictCallTarget",
								"dataDict" => $msgDict,
								"telUser"=> $this->users[$msgDict["CallerIDNum"]]
						);
						$resultJson = json_encode($result);
						// 接続先情報をオペレータ画面へ送信する
						$this->users[$msgDict["CallerIDNum"]]["client"]->send($resultJson);
					}
				}
				// パークスロットに居るアプローチ先が切断した場合
				if($msgDict["NotifState"] == self::HANGUP_PARK_SLOT){
					// アスタリスクログだが、ハンドリングした処理なのでdataTypeを変更する
					$result = array(
							"dataType" => "hangupParkSlot",
							"dataDict" => $msgDict,
							"telUser"=> $this->users[$msgDict["CallerIDNum"]]
					);
					$resultJson = json_encode($result);
					// パークスロットに入れたオペレータへ切断通知を送る
					$this->users[$msgDict["CallerIDNum"]]["client"]->send($resultJson);
					// SVにオペレータがパークスロットに入れたアプローチ先が切断した事を送る
					$result = array(
							"dataType" => "parkHold",
							"dataDict" => array("webphone_id" => $msgDict["CallerIDNum"], "type" => "hangupParkSlot")
					);
					$resultJson = json_encode($result);
					$this->sendMessageOnUserAll($this->users[$msgDict["CallerIDNum"]], $resultJson, self::USER_SV);
				}
				if(empty($this->users[$msgDict["CallerIDNum"]]["client"])){
					// 送信先のオブジェクトが存在しなければ変数から削除する
					unset($this->users[$msgDict["CallerIDNum"]]);
				}
			}
		}
		
		/**
		 * ログ出力機能
		 * @param unknown $msg	出力メッセージ
		 * @param string $title	メッセージタイトル
		 */
		private function outputLog($msg, $title = ""){
			$dateTime = date("Y-m-d H:i:s");
			var_dump("{$dateTime} [{$title}] : {$msg}");
		}
	}

	// Run the server application through the WebSocket protocol on port 8080
	$server = IoServer::factory(new HttpServer(new WsServer(new myWebsocket())),3000);
	$server->run();
