// WebSocket管理クラス
var MeetinWebSocketManager;
(function (MeetinWebSocketManager) {
	// ログ表示
	const SHOW_LOG = false;

	const SHOW_LOG2 = false;
	// ポート
	//const WEB_SOCKET_PORT = 3000;
	const WEB_SOCKET_PORT = 443;
	// URL
	if(location.hostname == '172.22.1.90' || location.hostname == '192.168.33.12'  || location.hostname == '192.168.56.12') {
		// アイドマの開発環境の場合ステージのwebsocketをお借りする
		var WEB_SOCKET_HOST = 'wss://dev3.meet-in.jp:' + WEB_SOCKET_PORT + "/ws/";
	}else{
		var WEB_SOCKET_HOST = 'wss://' + location.hostname + ':' + WEB_SOCKET_PORT + "/ws/";
	}

	// WebSocket管理のコンストラクタ
	var MeetinWebSocket = (function () {

		// ソケット
		var mSocket = null;
		var mPeerId = null;

		var mRequestPeerId = null;

		var mConnectionInfoId = null;

		var mCanUseWebRTC = false;

// Ohta
		var send1_cnt = 0;
		var recv1_cnt = 0;

		function MeetinWebSocket(
		) {
		}

		// WebSocket管理の初期化
		var init = function(
				requestPeerId,
				connectionInfoId,
				canUseWebRTC,
				openCallback,
				messageCallback,
				binaryCallback,
				errorCallback,
				closeCallback,
				socketConnectionFailCallback
			) {

			try {
				if (SHOW_LOG) {
					console.log('[MeetinWebSocket][init][start]');
				}
if (SHOW_LOG2) {
	TraceLog(null ,null ,0 ,'▲▲▲[MeetinWebSocket][init][start]',null,null,null);
}
				mRequestPeerId = requestPeerId;
				mConnectionInfoId = connectionInfoId;
				mCanUseWebRTC = canUseWebRTC;

				var openCallbackWork = function(event) {
//					if (openCallback && typeof openCallback === "function") {
//						openCallback(event);
//					}
//					TraceLog(null ,null ,0 ,'▲▲▲[MeetinWebSocket][init][start]',null,null,null);
				}

				var messageCallbackWork = function(event) {
					try {
						var json = JSON.parse(event.data);
						if (json) {
if (SHOW_LOG2) {
	RecvMeetinLog(mConnectionInfoId, event.data);
}
							// ソケットの接続が完了
							if (json.command === 'SOCKET_CONNECT_READY') {
								mPeerId = json.new_peer_id;
								if (mRequestPeerId && mRequestPeerId.length > 0) {
									sendRequestChangePeerId(mRequestPeerId);
								} else {
									sendRequestChangePeerId(mPeerId);
	//								if (openCallback && typeof openCallback === "function") {
	//									openCallback(mPeerId);
	//								}
								}
							}
							// 接続ID変更完了
							else if (json.command === 'CHANGE_PEER_ID_FINISH') {
								mPeerId = json.new_peer_id;

								if (SHOW_LOG) {
									console.log('[MeetinWebSocket][init][openCallback]:mPeerId = ' + mPeerId);
								}

								if (openCallback && typeof openCallback === "function") {
									openCallback(mPeerId);
								}
							}
							else if (messageCallback && typeof messageCallback === "function") {
								if (SHOW_LOG) {
									console.log('[MeetinWebSocket][init][messageCallback]:event.data = ' + event.data);
								}
								messageCallback(event, json);
							}
						} else {
							binaryCallback(event);
						}
					} catch (exception2) {
						binaryCallback(event);
					}
				}

				var errorCallbackWork = function(event) {
					if (SHOW_LOG) {
						console.log('[MeetinWebSocket][init][errorCallbackWork]:event = ' + JSON.stringify(event));
					}
//					negotiationErrorConvergence();
//console.log("errorCallbackWork::" + JSON.stringify(event) );
					if (errorCallback && typeof errorCallback === "function") {
						errorCallback(event);
					}
					console.log('error::['+ JSON.stringify(event) +']');
					ErrorLog(null ,null ,0 ,3 ,null ,'MeetinWebSocketManager.init.errorCallbackWork' ,JSON.stringify(event));
				}

				var closeCallbackWork = function(event) {
					if (SHOW_LOG) {
						console.log('[MeetinWebSocket][init][closeCallbackWork]:event = ' + JSON.stringify(event));
					}
if (SHOW_LOG2) {
	TraceLog(mConnectionInfoId ,null ,0 ,'▲▲▲[MeetinWebSocket][init][closeCallbackWork]:event='+event.code, null,null,null);
}

					if (closeCallback && typeof closeCallback === "function") {
						closeCallback(event);
					}
				}

				destroy();

				mSocket = new WebSocket(WEB_SOCKET_HOST, 'echo-protocol');
				mSocket.onopen = openCallbackWork;
				mSocket.onmessage = messageCallbackWork;
				mSocket.onerror = errorCallbackWork;
				mSocket.onclose = closeCallbackWork;
				return mSocket;
			} catch (exception) {
				if (SHOW_LOG) {
					console.log('[MeetinWebSocket][init][error]:exception = ' + exception);
				}
				// negotiationErrorConvergence();
				// console.log('[MeetinWebSocket][init][error]:exception = ' + exception.message);
				// TraceLog(null ,null ,0 ,'[MeetinWebSocket][init][error]:ex.name=('+ exception.name+') ex.message=('+ exception.message+')',null,null,null);
				if (socketConnectionFailCallback && typeof socketConnectionFailCallback === "function") {
					socketConnectionFailCallback(exception, requestPeerId);
				}
				ErrorLog(null ,null ,0 ,3 ,null ,'MeetinWebSocketManager.init.closeCallbackWork' ,'ex.name=('+ exception.name+') ex.message=('+ exception.message+')');
				return null;
			}
		};

		// WebSocket管理の初期化
		MeetinWebSocket.prototype.init = function(
				requestPeerId,
				connectionInfoId,
				canUseWebRTC,
				openCallback,
				messageCallback,
				binaryCallback,
				errorCallback,
				closeCallback,
				socketConnectionFailCallback
			) {
			return init(
				requestPeerId,
				connectionInfoId,
				canUseWebRTC,
				openCallback,
				messageCallback,
				binaryCallback,
				errorCallback,
				closeCallback,
				socketConnectionFailCallback
			);
		};

		// 破棄
		var destroy = function(
			) {
			if (!mSocket || mSocket.readyState != WebSocket.OPEN) {
				return;
			}

			mSocket.close();
			mSocket = null;
		};
		// 破棄
		MeetinWebSocket.prototype.destroy = function(
			) {
			destroy(
			);
		};

		// メッセージ送信
		var sendMessage = function(
				message
			) {
			if (!mSocket || mSocket.readyState != WebSocket.OPEN) {
				return false;
			}

			if (SHOW_LOG) {
				console.log('[MeetinWebSocket][sendMessage]:message = ' + message);
			}
// Ohta
if (SHOW_LOG2) {
	sendMeetinLog(message);
}
			mSocket.send(message);
			return true;
		};

		// メッセージ送信
		MeetinWebSocket.prototype.sendMessage = function(
				message
			) {
			sendMessage(
				message
			);
		};

// Ohta
		var sendMeetinLog = function(message) {
			try {
				var json = JSON.parse(message);
				if (json) {
					switch (json.command) {
						// 以下のコマンドはWebSoketコマンド送信が多いため、ログ出力は行わない。
						case "MOVE_SHARE_MEMO":	// 共有メモ
						case "SHARE_MEMO":		// 共有メモ
						case "WHITE_BOARD":		// ホワイトボード
						case "DOCUMENT":		// 資料
						case "REQUEST_WRITE_FINISHED":	// 画面共有(画像書き込み)
						case "REQUEST_READ_FINISHED":	// 画面共有(画像書き込み)
							break;

						// 以降のWebSoketコマンドはログ出力対象
						//
						// PING に関して定期的に出力されるため、ログ出力は10回に１回出力する
						case "REQUEST_CHANGE_PEER_ID":
							TraceLog(mConnectionInfoId ,null ,0 ,'[sendMsg] message=['+message+']', json.command,json.from_peer_id,null);
							break;
						case "PING":
							send1_cnt++;
							if( (send1_cnt % 10) == 0 ) {   // 10回に1回出力
								TraceLog(mConnectionInfoId ,null ,0 ,'[sendMsg] message=['+message+']', json.command,json.from_peer_id,json.to_peer_id);
								send1_cnt=0;
							}
							break;
						default:
							TraceLog(mConnectionInfoId ,null ,0 ,'[sendMsg] message=['+message+']', json.command,json.from_peer_id,json.to_peer_id);
					}
				} else {
					// 内容不明
					TraceLog( mConnectionInfoId, null, 0, 'WebSocket::mSocket.send(不明):['+message+']', null,null,null);
				}
			} catch (exception2) {
				// console.log('異常終了::'+ exception2.name);
				// console.log('異常終了::'+ exception2.message);
				// 異常
			}
		};

		var RecvMeetinLog = function(connection_info_id,message) {
			try {
				var json = JSON.parse(message);
//console.log('RecvMeetinLog::id=('+ connection_info_id+') command=('+json.command+')');
				if (json) {
					switch (json.command) {
						// 以下のコマンドはWebSoketコマンド送信が多いため、ログ出力は行わない。
						case "MOVE_SHARE_MEMO":			// 共有メモ
						case "SHARE_MEMO":				// 共有メモ
						case "WHITE_BOARD":				// ホワイトボード
						case "DOCUMENT":				// 資料
						case "REQUEST_WRITE_FINISHED":	// 画面共有(画像書き込み)
						case "REQUEST_READ_FINISHED":	// 画面共有(画像書き込み)
							break;
						// 以降のWebSoketコマンドはログ出力対象
						//
						// PING/CHANGE_PEER_ID_FINISH に関して定期的に出力されるため、ログ出力は10回に１回出力する
//						mPeerId = json.new_peer_id;
						case "SOCKET_CONNECT_READY":
//console.log('RecvMeetinLog::id=('+ connection_info_id+') command=('+json.command+') new_peer_id=('+json.new_peer_id+')');
							TraceLog(connection_info_id ,null ,1 ,'[RecvMsg] message=['+message+']', json.command, json.new_peer_id, null);
//console.log('OK->RecvMeetinLog::id=('+ connection_info_id+') command=('+json.command+') new_peer_id=('+json.new_peer_id+')');
							break;

						case "CHANGE_PEER_ID_FINISH":
//console.log('RecvMeetinLog::id=('+ connection_info_id+') command=('+json.command+') old_peer_id=('+json.old_peer_id+') new_peer_id=('+json.new_peer_id+')');
							TraceLog(connection_info_id ,null ,1 ,'[RecvMsg] message=['+message+']', json.command, json.old_peer_id, json.new_peer_id);
//console.log('OK->RecvMeetinLog::id=('+ connection_info_id+') command=('+json.command+') old_peer_id=('+json.old_peer_id+') new_peer_id=('+json.new_peer_id+')');
							break;
						case "PING_RECEIVED":
//							console.log('RecvMeetinLog::recv1_cnt='+ recv1_cnt);
							recv1_cnt++;
							if( (recv1_cnt % 10) == 0 ) {   // 10回に1回出力
								recv1_cnt=0;
								TraceLog(connection_info_id ,null ,1 ,'[RecvMsg] message=['+message+']', json.command, null, null);
							}
							break;
						default:
//console.log('RecvMeetinLog::recv1_cnt='+ recv1_cnt);
							from_peer_id = (json.from_peer_id != 'undefined' ? json.from_peer_id : null);
							to_peer_id = (json.to_peer_id != 'undefined' ? json.to_peer_id : null);
							TraceLog(connection_info_id ,null ,1 ,'[RecvMsg] message=['+message+']', json.command, from_peer_id, to_peer_id);
//console.log('OK->RecvMeetinLog::recv1_cnt='+ recv1_cnt);
						}
				} else {
					// 内容不明
					TraceLog( connection_info_id, null, 1, 'WebSocket::mSocket.Recv(不明):['+message+']', null,null,null);
				}
			} catch (exception2) {
			}
		};

/*
		// バイナリ送信
		var sendBinary = function(
				binary
			) {
			if (!mSocket || mSocket.readyState != WebSocket.OPEN) {
				return false;
			}

			if (SHOW_LOG) {
				console.log('[MeetinWebSocket][sendBinary]');
			}

			mSocket.send(binary);
			return true;
		};

		// バイナリ送信
		MeetinWebSocket.prototype.sendBinary = function(
				binary
			) {
			sendBinary(
				binary
			);
		};
*/
		// 接続IDの変更を要求する
		var sendRequestChangePeerId = function(
				to_peer_id
			) {
			var data = {
				command : "REQUEST_CHANGE_PEER_ID",
				from_peer_id : mPeerId,
				to_peer_id : to_peer_id,
				connection_info_id : mConnectionInfoId,
				can_use_webrtc : mCanUseWebRTC
			};

			sendMessage(JSON.stringify(data));
		};

		// 接続IDの変更を要求する
		MeetinWebSocket.prototype.sendRequestChangePeerId = function(
				to_peer_id
			) {
			sendRequestChangePeerId(
				to_peer_id
			);
		};

		// ＩＤを取得
		MeetinWebSocket.prototype.getPeerId = function(
			) {
			return mPeerId;
		};

		MeetinWebSocket.prototype.isReady = function(
			) {
			if (!mSocket || mSocket.readyState != WebSocket.OPEN) {
				return false;
			}

			return true;
		};

		return MeetinWebSocket;
	})();
	MeetinWebSocketManager.MeetinWebSocket = MeetinWebSocket;

})(MeetinWebSocketManager || (MeetinWebSocketManager = {}));
