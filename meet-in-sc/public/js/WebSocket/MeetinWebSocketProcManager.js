// WebSocketProc管理クラス
var MeetinWebSocketProcManager;
(function (MeetinWebSocketProcManager) {
	// ログ表示
	const SHOW_LOG = false;

	// データベースへの再接続の上限回数
	const MEETIN_MAIN_MAX_TRY_updateConnectionInfoPeerId = 60;
	// データベースへの再接続間隔（秒）
	const MEETIN_MAIN_TRY_updateConnectionInfoPeerId_WAIT = 1000;
	
	// WebSocketProc管理のコンストラクタ
	var MeetinWebSocketProc = (function () {

		// connection_info_id：connection_infoテーブルの[id]
		var mConnectionInfoId = null;
		
		var mCanUseWebRTC = false;
		
		// userId：チャットルーム内のユーザーID。
		//         オペレータ = 0
		//         ゲスト = 1～5
		var mUserId = null;
		
		// connection_info_id：connection_infoテーブルの[connect_no]
		var mConnectNo = null;
		
		// クライアントID
		var mClientId = null;

		// ユーザーの名称
		var mUserInfo = null;

		// 回線の帯域
		var mSendBandwidth = null;
		var mReceiveBandwidth = null;
		
		// ブラウザの種類
		var mBrowser = null;

		var mRequestPeerId = null;
		var mConstraints = null;
		var mUpdateDatabase = false;
		var mInitCompleteCallback = null;
		var mOpenCallback = null;
		var mMessageCallback = null;
		var mCoreCommandCallback = null;
		var mCommonCommandCallback = null;
		var mBinaryCallback = null;
		var mErrorCallback = null;
		var mCloseCallback = null;
		var mSocketConnectionFailCallback = null;

		var mMeetinWebSocket = new MeetinWebSocketManager.MeetinWebSocket();
		
		var mUserIdAndPeerDataIdTable = {};
		
		var mReady = false;

		var mPingTimeout = null;
		var mSendPingTimeout = null;
		
		function MeetinWebSocketProc(
			connection_info_id,
			userId,
			connect_no,
			client_id,
			user_info,
			sendBandwidth,
			receiveBandwidth,
			browser,
			canUseWebRTC
		) {
			mConnectionInfoId = connection_info_id;
			mUserId = userId;
			mConnectNo = connect_no;
			mClientId = client_id;
			mUserInfo = user_info;
			mSendBandwidth = sendBandwidth;
			mReceiveBandwidth = receiveBandwidth;
			mBrowser = browser;
			mCanUseWebRTC = canUseWebRTC;
		}
		
		var init = function(
			requestPeerId,
			constraints,
			updateDatabase,
			initCompleteCallback,
			openCallback,
			coreCommandCallback,
			commonCommandCallback,
			binaryCallback,
			errorCallback,
			closeCallback,
			socketConnectionFailCallback
			) {

			mRequestPeerId = requestPeerId;
			mConstraints = constraints;
			mUpdateDatabase = updateDatabase;
			mInitCompleteCallback = initCompleteCallback;
			mOpenCallback = openCallback;
			mCoreCommandCallback = coreCommandCallback;
			mCommonCommandCallback = commonCommandCallback;
			mBinaryCallback = binaryCallback;
			mErrorCallback = errorCallback;
			mCloseCallback = closeCallback;
			mSocketConnectionFailCallback = socketConnectionFailCallback;

			var openCallbackWork = function(peerId) {
				if (openCallback && typeof openCallback === "function") {
					openCallback(peerId);
				}

				if (updateDatabase) {
					var initDatabase_finishCallback = function(connection_info) {
						if (SHOW_LOG) {
							console.log('[MeetinWebSocketProc][init][complete]:peerId = '+ peerId + ', connection_info = '+ connection_info);
						}

						sendInitData(connection_info);

						// Safariを除外
						if (USER_PARAM_BROWSER === 'IE') {
						// if ((USER_PARAM_BROWSER === 'Safari')
						// 	|| (USER_PARAM_BROWSER === 'IE'))
						// {
							showMyFlash(constraints);
						}

						mReady = true;
						sendPing();
						
						// 初期化はここまで、初期化完了コールバックを呼び出す
						if (initCompleteCallback && typeof initCompleteCallback === "function") {
							initCompleteCallback(
								peerId,
								connection_info
							);
						}
					};
					
					// データベースの更新
					initDatabase(
						mConnectionInfoId,
						mUserId,
						peerId,
						errorCallback,
						initDatabase_finishCallback
					);
				} else {
					var successCallback = function(data, textStatus, XMLHttpRequest) {
						if ("1" == data.result) {
							if (SHOW_LOG) {
								console.log('[MeetinWebSocketProc][init][complete]:peerId = '+ peerId + ', connection_info = '+ data.connection_info);
							}
							
							sendInitData(data.connection_info);

							// Safariを除外
							if (USER_PARAM_BROWSER === 'IE') {
							// if ((USER_PARAM_BROWSER === 'Safari')
							// 	|| (USER_PARAM_BROWSER === 'IE'))
							// {
								showMyFlash(constraints);
							}
							
							mReady = true;
							sendPing();
							
							if (initCompleteCallback && typeof initCompleteCallback === "function") {
								initCompleteCallback(
									peerId,
									data.connection_info
								);
							}
						}
					};
				
					var errorCallback = function(XMLHttpRequest, textStatus, errorThrown, errorMessage) {
					};
	
					var completeCallback = function(XMLHttpRequest, textStatus) {
					};
				
					getConnectionInfo(
						mConnectionInfoId,
						successCallback, 
						errorCallback, 
						completeCallback
					)
				}
			};
			
			var messageCallbackWork = function(event, json) {
				if (json && json.command) {
					if (json.core_command) {
						if (!runCoreCommandCallback(json)) {
							if (coreCommandCallback && typeof coreCommandCallback === "function") {
								coreCommandCallback(json);
							}
						}
					} else {
						if (commonCommandCallback && typeof commonCommandCallback === "function") {
							commonCommandCallback(json);
						}
					}
				}
			};
			
			var binaryCallbackWork = function(event) {
				if (binaryCallback && typeof binaryCallback === "function") {
					binaryCallback(event);
				}
			};
			
			var errorCallbackWork = function(event) {
				if (errorCallback && typeof errorCallback === "function") {
					var err = new Error('サーバー接続エラー');
					err.type = 'web-socket-error';
					errorCallback(err);
				}
			};
	
			var closeCallbackWork = function(event) {
				// WebSocketサーバーとの接続が切れたときに再接続する
//				if (mReady) {
//					tryReconnect();
//				}
				
				if (closeCallback && typeof closeCallback === "function") {
					closeCallback(event);
				}
			};
			
			var socketConnectionFailCallbackWork = function(exception, requestPeerId) {
				if (socketConnectionFailCallback && typeof socketConnectionFailCallback === "function") {
					socketConnectionFailCallback(exception, requestPeerId);
				}
			};

			return mMeetinWebSocket.init(
				requestPeerId,
				mConnectionInfoId,
				mCanUseWebRTC,
				openCallbackWork,
				messageCallbackWork,
				binaryCallbackWork,
				errorCallbackWork,
				closeCallbackWork,
				socketConnectionFailCallbackWork
			);
		};
		
		MeetinWebSocketProc.prototype.init = function(
				requestPeerId,
				constraints,
				updateDatabase,
				initCompleteCallback,
				openCallback,
				coreCommandCallback,
				commonCommandCallback,
				binaryCallback,
				errorCallback,
				closeCallback,
				socketConnectionFailCallback
			) {
			return init(
				requestPeerId,
				constraints,
				updateDatabase,
				initCompleteCallback,
				openCallback,
				coreCommandCallback,
				commonCommandCallback,
				binaryCallback,
				errorCallback,
				closeCallback,
				socketConnectionFailCallback
			);
		};

		var initDatabase = function(
				connectionInfoId,
				userId,
				peerId,
				errorCallback,
				finishCallback
			) {
			if (SHOW_LOG) {
				console.log('[MeetinWebSocketProc][initDatabase][start]');
			}

			var counter = 0;
			
			var updateConnectionInfoPeerIdSuccessCallback = function(data, textStatus, XMLHttpRequest) {
				// 接続情報取得成功
				if ("1" == data.result) {
					// 初期化はここまで、初期化完了コールバックを呼び出す
					if (finishCallback && typeof finishCallback === "function") {
						finishCallback(
							data.connection_info
						);
					}
				} else {
					// データベースに再接続する
					if (counter < MEETIN_MAIN_MAX_TRY_updateConnectionInfoPeerId) {
						var run = function() {
							// ピアIDをデータベースに保存
							updateConnectionInfo(
								connectionInfoId,
								userId,
								peerId,
								updateConnectionInfoPeerIdSuccessCallback,
								updateConnectionInfoPeerIdErrorCallback
							);
						}
						setTimeout(run, MEETIN_MAIN_TRY_updateConnectionInfoPeerId_WAIT);
						
						++counter;
					} else {
						if (errorCallback && typeof errorCallback === "function") {
							var err = new Error('接続情報更新エラー');
							err.type = 'database-update';
							errorCallback(err);
						}
					}
				}
			};
			
			var updateConnectionInfoPeerIdErrorCallback = function(XMLHttpRequest, textStatus, errorThrown) {
				// データベースに再接続する
				if (counter < MEETIN_MAIN_MAX_TRY_updateConnectionInfoPeerId) {
					var run = function() {
						// ピアIDをデータベースに保存
						updateConnectionInfo(
							connectionInfoId,
							userId,
							peerId,
							updateConnectionInfoPeerIdSuccessCallback,
							updateConnectionInfoPeerIdErrorCallback
						);
					}
					setTimeout(run, MEETIN_MAIN_TRY_updateConnectionInfoPeerId_WAIT);
					
					++counter;
				} else {
					if (errorCallback && typeof errorCallback === "function") {
						var err = new Error('データベース接続エラー');
						err.type = 'database-connection';
						errorCallback(err);
					}
				}
			};
			
			// ピアIDをデータベースに保存
			updateConnectionInfo(
				connectionInfoId,
				userId,
				peerId,
				updateConnectionInfoPeerIdSuccessCallback,
				updateConnectionInfoPeerIdErrorCallback
			);
		};

		var destroy = function(
			) {
			if (SHOW_LOG) {
				console.log('[MeetinWebSocketProc][destroy][start]');
			}

			if (mSendPingTimeout) {
				clearTimeout(mSendPingTimeout);
				mSendPingTimeout = null;
			}
	
			if (mPingTimeout) {
				clearTimeout(mPingTimeout);
				mPingTimeout = null;
			}
			
			if (0 != mUserId) {
				// ピアIDをデータベースに保存
				updateConnectionInfo(
					mConnectionInfoId,
					mUserId,
					null,
					null,
					null
				);
			}
			
			mReady = false;

			mMeetinWebSocket.destroy();
		};

		MeetinWebSocketProc.prototype.destroy = function(
			) {
			destroy(
			);
		};
		
		var reconnect = function(
			) {
			if (SHOW_LOG) {
				console.log('[MeetinWebSocketProc][reconnect][start]');
			}

			if (mSendPingTimeout) {
				clearTimeout(mSendPingTimeout);
				mSendPingTimeout = null;
			}
	
			if (mPingTimeout) {
				clearTimeout(mPingTimeout);
				mPingTimeout = null;
			}

			mMeetinWebSocket.destroy();
			
			init(
				mRequestPeerId,
				mConstraints,
				mUpdateDatabase,
				mInitCompleteCallback,
				mOpenCallback,
				mCoreCommandCallback,
				mCommonCommandCallback,
				mBinaryCallback,
				mErrorCallback,
				mCloseCallback,
				mSocketConnectionFailCallback
			);
		};
		
		// 再接続
		MeetinWebSocketProc.prototype.reconnect = function(
			) {
			reconnect();
		};
		
		var tryReconnect = function() {
			// 再接続
			if (SHOW_LOG) {
				console.log('[MeetinWebSocketProc][tryReconnect][start]');
			}

			if (mSendPingTimeout) {
				clearTimeout(mSendPingTimeout);
				mSendPingTimeout = null;
			}
	
			if (mPingTimeout) {
				clearTimeout(mPingTimeout);
				mPingTimeout = null;
			}
	
			mMeetinWebSocket.destroy();

			init(
				mRequestPeerId,
				mConstraints,
				mUpdateDatabase,
				mInitCompleteCallback,
				mOpenCallback,
				mCoreCommandCallback,
				mCommonCommandCallback,
				mBinaryCallback,
				mErrorCallback,
				mCloseCallback,
				mSocketConnectionFailCallback
			);
		};
		
		var showMyFlash = function(constraints) {
			var elementID = 'video_target_video_area_' + mUserId;
			var id = 'negotiation_target_flash_' + mUserId;
			var urlString = "/swf/MeetinFlashMyVideo.swf?" + $('#application_version').val();
//			$('#negotiation_target_video_' + mUserId).draggable( "disable" );
			$('#video_target_video_area_' + mUserId).empty();

			// 映像品質値を取得
			mOldReceiveBandwidthLevel = getReceiveBandwidthLevel();
			var qualityVal = "60";

			//  品質の値でクオリティ設定
			switch (mOldReceiveBandwidthLevel) {
				case '0':		// 低
					qualityVal = '20';
					break;
				case '1':		// 中低
					qualityVal = '40';
					break;
				case '2':		// 中
					qualityVal = '60';
					break;
				case '3':		// 中高
					qualityVal = '80';
					break;
				case '4':		// 高
					qualityVal = '100';
					break;
				default:
					break;
			}
			
			var flashvars = getFlashVideoFlashvars(constraints);
			flashvars.cameraIndex = NEGOTIATION.use_camera_id_flash;
			flashvars.cameraWidth = DEFAULT_FLASH_CAMERA_WIDTH;
			flashvars.cameraHeight = DEFAULT_FLASH_CAMERA_HEIGHT;
			flashvars.cameraFramerate = NEGOTIATION.use_fps;
			flashvars.cameraQuality = qualityVal;		// カメラ画像の品質（0～100）
			flashvars.speexQuality = DEFAULT_FLASH_SPEEX_QUALITY;
			flashvars.nellymoserRate = DEFAULT_FLASH_NELLYMOSER_RATE;
			flashvars.micGain = DEFAULT_FLASH_MIC_GAIN;
			
			// flashを追加する
			showSWF(urlString, elementID, id, flashvars);
			$('#video_target_icon_area_' + mUserId).hide();
			if (!USER_PARAM_IS_MOBILE) {
				$('#negotiation_target_video_' + mUserId).draggable( "disable" );
			}
		};
		
		var sendInitData = function(connection_info) {
			if (SHOW_LOG) {
				console.log('[MeetinWebSocketProc][sendInitData][start]:connection_info = ' + JSON.stringify(connection_info));
			}

			var target_peer_id_array = new Array();

			target_peer_id_array.push(connection_info.operator_peer_id);
			target_peer_id_array.push(connection_info.user_peer_id_1);
			target_peer_id_array.push(connection_info.user_peer_id_2);
			target_peer_id_array.push(connection_info.user_peer_id_3);
			target_peer_id_array.push(connection_info.user_peer_id_4);
			target_peer_id_array.push(connection_info.user_peer_id_5);
			target_peer_id_array.push(connection_info.user_peer_id_6);
			target_peer_id_array.push(connection_info.user_peer_id_7);
			target_peer_id_array.push(connection_info.user_peer_id_8);

			for (var i = 0; i < MEETIN_MAIN_MAX_PEOPLE; ++i) {
				if (target_peer_id_array.length > i && target_peer_id_array[i] && i != mUserId) {
					var targetPeerId = target_peer_id_array[i];

					var send = false;
					// Safariを除外
					if (mBrowser === 'IE') {
					// if ((mBrowser === 'Safari')
					// 	|| (mBrowser === 'IE')
					// ) {
						send = true;
					} else {
						if (17 == targetPeerId.length) {
							send = true;
						}
					}

					if (send) {
						mUserIdAndPeerDataIdTable[i] = targetPeerId;
	
						if (16 == targetPeerId.length) {
							targetPeerId = "S" + targetPeerId;
						}

						// チャットルームに入室したことををすべての接続先に伝える
						sendEnterRoom(targetPeerId);
						
						sendRequestEnterRoom(targetPeerId);
					}
				}
			}
		};

		//////////////////////////////////////////////////////////
		// カメラ関連
		//////////////////////////////////////////////////////////

		var cameraOn = function() {
			sendCameraIsOn(
				null,
				null,
				null
			);
		};
		
		MeetinWebSocketProc.prototype.cameraOn = function(
			) {
			return cameraOn(
			);
		};
		
		var cameraOff = function() {
			sendCameraIsOff(
				null
			);
		};
		
		MeetinWebSocketProc.prototype.cameraOff = function(
			) {
			return cameraOff(
			);
		};

		//////////////////////////////////////////////////////////
		// マイク関連
		//////////////////////////////////////////////////////////

		var micOn = function() {
			sendMicIsOn(
				null,
				null,
				null
			);
		};
		
		MeetinWebSocketProc.prototype.micOn = function(
			) {
			return micOn(
			);
		};

		var micOff = function() {
			sendMicIsOff(
				null
			);
		};
		
		MeetinWebSocketProc.prototype.micOff = function(
			) {
			return micOff(
			);
		};

		//////////////////////////////////////////////////////////
		// コマンド（受信）
		//////////////////////////////////////////////////////////

		// コマンド実行
		var runCoreCommandCallback = function(
				json
			) {
			// 送信側の視点：相手の状態を要求する
			// →受信側の視点：自分の状態を返す
			if (json.command === "REQUEST_SYSTEM_INFO_DETAIL") {
				return runRequestSystemInfoDetail(json);
			}
			// 送信側の視点：自分の状態を相手に送る
			// →受信側の視点：相手の状態をもとに何らかの処理を行う
			else if (json.command === "SYSTEM_INFO_DETAIL") {
				return runSystemInfoDetail(json);
			}
			// 送信側の視点：相手のメディアストリーム（映像）を要求する
			// →受信側の視点：相手のピアに自分のメディアストリーム（映像）を送る
			else if (json.command === "REQUEST_VIDEO_STREAM") {
				return runRequestVideoStream(json);
			}
			// 送信側の視点：相手のメディアストリーム（マイク）を要求する
			// →受信側の視点：相手のピアに自分のメディアストリーム（マイク）を送る
			else if (json.command === "REQUEST_AUDIO_STREAM") {
				return runRequestAudioStream(json);
			}
			// 送信側の視点：相手のメディアストリーム（画面共有）を要求する
			// →受信側の視点：相手のピアに自分のメディアストリーム（画面共有）を送る
			else if (json.command === "REQUEST_SCREEN_STREAM") {
				return runRequestScreenStream(json);
			}
			// 送信側の視点：自分のカメラがオンになった
			// →受信側の視点：相手のカメラがオンになったときの処理
			else if (json.command === "CAMERA_IS_ON") {
				return runCameraIsOn(json);
			}
			// 送信側の視点：自分のカメラがオフになった
			// →受信側の視点：相手のカメラがオフになったときの処理
			else if (json.command === "CAMERA_IS_OFF") {
				return runCameraIsOff(json);
			}
			// 送信側の視点：自分のマイクがオンになった
			// →受信側の視点：相手のマイクがオンになったときの処理
			else if (json.command === "MIC_IS_ON") {
				return runMicIsOn(json);
			}
			// 送信側の視点：自分のマイクがオフになった
			// →受信側の視点：相手のマイクがオフになったときの処理
			else if (json.command === "MIC_IS_OFF") {
				return runMicIsOff(json);
			}
			// 送信側の視点：自分の画面共有がオンになった
			// →受信側の視点：相手の画面共有がオンになったときの処理
			else if (json.command === "SCREEN_IS_ON") {
				return runScreenIsOn(json);
			}
			// 送信側の視点：自分の画面共有がオフになった
			// →受信側の視点：相手の画面共有がオフになったときの処理
			else if (json.command === "SCREEN_IS_OFF") {
				return runScreenIsOff(json);
			}
			// 送信側の視点：チャットルームに入室したことををすべての接続先に伝える
			// →受信側の視点：何らかの処理を行う
			else if (json.command === "ENTER_ROOM") {
				runEnterRoom(json);
				return false;
			}
			else if (json.command === "ENTER_ROOM_RECEIVED") {
				runEnterRoomReceived(json);
				return false;
			}
			else if (json.command === "REQUEST_ENTER_ROOM") {
				return runRequestEnterRoom(json);
			}
			// 送信側の視点：チャットルームを退室したことををすべての接続先に伝える
			// →受信側の視点：何らかの処理を行う
			else if (json.command === "EXIT_ROOM") {
				runExitRoom(json);
				return false;
			}
			// 送信側の視点：Connectionを閉じるコマンドを送る
			// →受信側の視点：Connectionを閉じる
			else if (json.command === "REQUEST_CLOSE_CONNECTION_BY_CONNECTION_ID") {
				return runRequestCloseConnectionByConnectionId(json);
			}
			// 送信側の視点：ストリームの状態を送る
			// →受信側の視点：
			else if (json.command === "STREAM_INFO_DETAIL") {
				return runStreamInfoDetail(json);
			}
			else if (json.command === "PING_RECEIVED") {
				return runPingReceived(json);
			}

			return false;
		};

		// コマンド実行
		MeetinWebSocketProc.prototype.runCoreCommandCallback = function(
				json
			) {
			return runCoreCommandCallback(
				json
			);
		};

		//////////////////////////////////////////////////////////
		// コマンド（送信）
		//////////////////////////////////////////////////////////

		// コマンドを相手に送る
		var sendCommand = function(
				target_peer_id,
				isCoreCommand,
				data
			) {
			if (!mMeetinWebSocket.isReady()) {
				return null;
			}
			
			data.core_command = isCoreCommand;
			data.from_peer_id = mMeetinWebSocket.getPeerId();
			data.from_user_id = mUserId;
			data.from_user_info = mUserInfo;
			data.from_browser = mBrowser;
			data.from_webrtc = false;
			data.from_websocket = true;
			
			if (target_peer_id && target_peer_id.length > 0) {
				if (16 == target_peer_id.length) {
					target_peer_id = "S" + target_peer_id;
				}
				data.to_peer_id = target_peer_id;
				return mMeetinWebSocket.sendMessage(JSON.stringify(data));
			} else {
				var send_target_array = new Array();
				for (var key in mUserIdAndPeerDataIdTable) {
					var to_peer_id = mUserIdAndPeerDataIdTable[key];
					if (16 == key.length) {
						to_peer_id = "S" + mUserIdAndPeerDataIdTable[key];
					}
					data.to_peer_id = to_peer_id;
					var send = mMeetinWebSocket.sendMessage(JSON.stringify(data));
					if (send) {
						send_target_array.push(mUserIdAndPeerDataIdTable[key]);
					}
				}
				return send_target_array;
			}
		};

		// コマンドを相手に送る
		MeetinWebSocketProc.prototype.sendCommand = function(
				target_peer_id,
				isCoreCommand,
				data
			) {
			return sendCommand(
				target_peer_id,
				isCoreCommand,
				data
			);
		};
		
		// コマンドを相手に送る
		var sendCommandByUserId = function(
				target_user_id,
				isCoreCommand,
				data
			) {
			var target_peer_id = null;
			if (0 <= target_peer_id && target_peer_id < MEETIN_MAIN_MAX_PEOPLE) {
				target_peer_id = mUserIdAndPeerDataIdTable[target_user_id];
				var result = sendCommand(
					target_peer_id,
					isCoreCommand,
					data
				);
				return changePeerDataIdArrayToUserIdArray(result);
			} else {
				return null;
			}
		};

		// コマンドを相手に送る
		MeetinWebSocketProc.prototype.sendCommandByUserId = function(
				target_user_id,
				isCoreCommand,
				data
			) {
			return sendCommandByUserId(
				target_user_id,
				isCoreCommand,
				data
			);
		};

		// 自分の状態を相手に送る
		var sendSystemInfoDetail = function(
				target_peer_id
			) {
			var user_agent = navigator.userAgent;
			var has_focus = document.hasFocus();

			var data = {
				command : "SYSTEM_INFO_DETAIL",
				user_agent : user_agent,
				browser : mBrowser,
				has_focus : has_focus,
				has_video_stream : NEGOTIATION.isMyCameraOn,
				has_audio_stream : NEGOTIATION.isMyMicOn,
				has_screen_stream : false,
				video_stream_id : null,
				audio_stream_id : null,
				screen_stream_id : null,
				send_bandwidth : 0,
				receive_bandwidth : 0
			};
			return sendCommand(target_peer_id, true, data);
		};

		// 自分の状態を相手に送る
		MeetinWebSocketProc.prototype.sendSystemInfoDetail = function(
				target_peer_id
			) {
			return sendSystemInfoDetail(
				target_peer_id
			);
		};

		// 相手の状態を要求する
		var sendRequestSystemInfoDetail = function(
				target_peer_id
			) {
			var data = {
				command : "REQUEST_SYSTEM_INFO_DETAIL"
			};
			
			return sendCommand(target_peer_id, true, data);
		};

		// 相手の状態を要求する
		MeetinWebSocketProc.prototype.sendRequestSystemInfoDetail = function(
				target_peer_id
			) {
			return sendRequestSystemInfoDetail(
				target_peer_id
			);
		};

		// 相手の状態を要求する
		var sendRequestSystemInfoDetailByUserId = function(
				target_user_id
			) {
			var target_peer_id = null;
			if (0 <= target_peer_id && target_peer_id < MEETIN_MAIN_MAX_PEOPLE) {
				target_peer_id = mUserIdAndPeerDataIdTable[target_user_id];
				var result = sendRequestSystemInfoDetail(
					target_peer_id
				);
				return changePeerDataIdArrayToUserIdArray(result);
			} else {
				return null;
			}
		};

		// 相手の状態を要求する
		MeetinWebSocketProc.prototype.sendRequestSystemInfoDetailByUserId = function(
				target_user_id
			) {
			return sendRequestSystemInfoDetailByUserId(
				target_user_id
			);
		};

		// 自分の状態を相手に送る
		var sendSystemInfoDetail = function(
				target_peer_id
			) {
			var user_agent = navigator.userAgent;
			var has_focus = document.hasFocus();

			var data = {
				command : "SYSTEM_INFO_DETAIL",
				user_agent : user_agent,
				browser : mBrowser,
				has_focus : has_focus,
				has_video_stream : NEGOTIATION.isMyCameraOn,
				has_audio_stream : NEGOTIATION.isMyMicOn,
				has_screen_stream : false,
				video_stream_id : null,
				audio_stream_id : null,
				screen_stream_id : null,
				send_bandwidth : 0,
				receive_bandwidth : 0
			};
			
			return sendCommand(target_peer_id, true, data);
		};

		// 自分の状態を相手に送る
		MeetinWebSocketProc.prototype.sendSystemInfoDetail = function(
				target_peer_id
			) {
			return sendSystemInfoDetail(
				target_peer_id
			);
		};

		// 自分の状態を相手に送る
		var sendSystemInfoDetailByUserId = function(
				target_user_id
			) {
			var target_peer_id = null;
			if (0 <= target_peer_id && target_peer_id < MEETIN_MAIN_MAX_PEOPLE) {
				target_peer_id = mUserIdAndPeerDataIdTable[target_user_id];
			
				var result = sendSystemInfoDetail(
					target_peer_id
				);
			
				return changePeerDataIdArrayToUserIdArray(result);
			} else {
				return null;
			}
		};

		// 自分の状態を相手に送る
		MeetinWebSocketProc.prototype.sendSystemInfoDetailByUserId = function(
				target_user_id
			) {
			return sendSystemInfoDetailByUserId(
				target_user_id
			);
		};

		// 相手のメディアストリーム（映像）を要求する
		var sendRequestVideoStream = function(
				target_user_id,
				target_peer_id,
				peer_id
			) {
			$('#negotiation_target_flash_' + target_user_id).show();
			
			var data = {
				command : "REQUEST_VIDEO_STREAM",
				media_stream_peer_id : peer_id
			};
			
			return sendCommand(target_peer_id, true, data);
		};

		// 相手のメディアストリーム（映像）を要求する
		MeetinWebSocketProc.prototype.sendRequestVideoStream = function(
				target_user_id,
				target_peer_id,
				peer_id
			) {
			return sendRequestVideoStream(
				target_user_id,
				target_peer_id,
				peer_id
			);
		};

		// 相手のメディアストリーム（映像）を要求する
		var sendRequestVideoStreamByUserId = function(
				target_user_id,
				peer_id
			) {
			var target_peer_id = null;
			if (0 <= target_peer_id && target_peer_id < MEETIN_MAIN_MAX_PEOPLE) {
				target_peer_id = mUserIdAndPeerDataIdTable[target_user_id];
			
				var result = sendRequestVideoStream(
					target_user_id,
					target_peer_id,
					peer_id
				);
			
				return changePeerDataIdArrayToUserIdArray(result);
			} else {
				return null;
			}
		};

		// 相手のメディアストリーム（映像）を要求する
		MeetinWebSocketProc.prototype.sendRequestVideoStreamByUserId = function(
				target_user_id,
				peer_id
			) {
			return sendRequestVideoStreamByUserId(
				target_user_id,
				peer_id
			);
		};
		
		// 相手のメディアストリーム（マイク）を要求する
		var sendRequestAudioStream = function(
				target_user_id,
				target_peer_id,
				peer_id
			) {
			var data = {
				command : "REQUEST_AUDIO_STREAM",
				media_stream_peer_id : peer_id
			};
			
			return sendCommand(target_peer_id, true, data);
		};

		// 相手のメディアストリーム（マイク）を要求する
		MeetinWebSocketProc.prototype.sendRequestAudioStream = function(
				target_user_id,
				target_peer_id,
				peer_id
			) {
			return sendRequestAudioStream(
				target_user_id,
				target_peer_id,
				peer_id
			);
		};

		// 相手のメディアストリーム（マイク）を要求する
		var sendRequestAudioStreamByUserId = function(
				target_user_id,
				peer_id
			) {
			var target_peer_id = null;
			if (0 <= target_peer_id && target_peer_id < MEETIN_MAIN_MAX_PEOPLE) {
				target_peer_id = mUserIdAndPeerDataIdTable[target_user_id];
			
				var result = sendRequestAudioStream(
					target_user_id,
					target_peer_id,
					peer_id
				);
			
				return changePeerDataIdArrayToUserIdArray(result);
			} else {
				return null;
			}
		};
		
		// 相手のメディアストリーム（マイク）を要求する
		MeetinWebSocketProc.prototype.sendRequestAudioStreamByUserId = function(
				target_user_id,
				peer_id
			) {
			return sendRequestAudioStreamByUserId(
				target_user_id,
				peer_id
			);
		};
		
		// 相手のメディアストリーム（画面共有）を要求する
		var sendRequestScreenStream = function(
				target_user_id,
				target_peer_id,
				peer_id
			) {
			var data = {
				command : "REQUEST_SCREEN_STREAM",
				media_stream_peer_id : peer_id
			};
			
			return sendCommand(target_peer_id, true, data);
		};

		// 相手のメディアストリーム（画面共有）を要求する
		MeetinWebSocketProc.prototype.sendRequestScreenStream = function(
				target_user_id,
				target_peer_id,
				peer_id
			) {
			return sendRequestScreenStream(
				target_user_id,
				target_peer_id,
				peer_id
			);
		};

		// 相手のメディアストリーム（画面共有）を要求する
		var sendRequestScreenStreamByUserId = function(
				target_user_id,
				peer_id
			) {
			var target_peer_id = null;
			if (0 <= target_peer_id && target_peer_id < MEETIN_MAIN_MAX_PEOPLE) {
				target_peer_id = mUserIdAndPeerDataIdTable[target_user_id];
			
				return sendRequestScreenStream(
					target_user_id,
					target_peer_id,
					peer_id
				);
			} else {
				return null;
			}
		};

		// 相手のメディアストリーム（画面共有）を要求する
		MeetinWebSocketProc.prototype.sendRequestScreenStreamByUserId = function(
				target_user_id,
				peer_id
			) {
			return sendRequestScreenStreamByUserId(
				target_user_id,
				peer_id
			);
		};

		// 自分のカメラがオンになったことをすべての接続先に伝える
		var sendCameraIsOn = function(
				target_peer_id,
				stream_id, 
				connection_id
			) {
			var data = {
				command : "CAMERA_IS_ON",
				stream_id : null,
				connection_id : null
			};
			return sendCommand(target_peer_id, true, data);
		}

		// 自分のカメラがオンになったことをすべての接続先に伝える
		MeetinWebSocketProc.prototype.sendCameraIsOn = function(
				target_peer_id,
				stream_id, 
				connection_id
			) {
			return sendCameraIsOn(
				target_peer_id,
				stream_id, 
				connection_id
			);
		};

		// 自分のカメラがオフになったことをすべての接続先に伝える
		var sendCameraIsOff = function(stream_id) {
			var data = {
				command : "CAMERA_IS_OFF",
				stream_id : stream_id,
				connection_id_list : null
			};
			return sendCommand(null, true, data);
		}

		// 自分のカメラがオフになったことをすべての接続先に伝える
		MeetinWebSocketProc.prototype.sendCameraIsOff = function(
				stream_id
			) {
			return sendCameraIsOff(
				stream_id
			);
		};

		// 自分のマイクがオンになったことをすべての接続先に伝える
		var sendMicIsOn = function(
				target_peer_id,
				stream_id, 
				connection_id
			) {
			var data = {
				command : "MIC_IS_ON",
				stream_id : null,
				connection_id : null
			};
			return sendCommand(target_peer_id, true, data);
		}

		// 自分のマイクがオンになったことをすべての接続先に伝える
		MeetinWebSocketProc.prototype.sendMicIsOn = function(
				target_peer_id,
				stream_id, 
				connection_id
			) {
			return sendMicIsOn(
				target_peer_id,
				stream_id, 
				connection_id
			);
		};

		// 自分のマイクがオフになったことをすべての接続先に伝える
		var sendMicIsOff = function(stream_id) {
			var data = {
				command : "MIC_IS_OFF",
				stream_id : stream_id,
				connection_id_list : null
			};
			return sendCommand(null, true, data);
		}

		// 自分のマイクがオフになったことをすべての接続先に伝える
		MeetinWebSocketProc.prototype.sendMicIsOff = function(
				stream_id
			) {
			return sendMicIsOff(
				stream_id
			);
		};

		// 自分の画面共有がオフになったことをすべての接続先に伝える
		var sendScreenIsOn = function(
				target_peer_id,
				stream_id, 
				connection_id
			) {
			var data = {
				command : "SCREEN_IS_ON",
				stream_id : null,
				connection_id : null
			};
			return sendCommand(target_peer_id, true, data);
		}

		// 自分の画面共有がオフになったことをすべての接続先に伝える
		MeetinWebSocketProc.prototype.sendScreenIsOn = function(
				target_peer_id,
				stream_id, 
				connection_id
			) {
			return sendScreenIsOn(
				target_peer_id,
				stream_id, 
				connection_id
			);
		};

		// 自分の画面共有がオフになったことをすべての接続先に伝える
		var sendScreenIsOff = function(stream_id) {
			var data = {
				command : "SCREEN_IS_OFF",
				stream_id : stream_id,
				connection_id_list : null
			};
			return sendCommand(null, true, data);
		}

		// 自分の画面共有がオフになったことをすべての接続先に伝える
		MeetinWebSocketProc.prototype.sendScreenIsOff = function(
				stream_id
			) {
			return sendScreenIsOff(
				stream_id
			);
		};

		// チャットルームに入室したことををすべての接続先に伝える
		var sendEnterRoom = function(target_peer_id) {
			var data = {
				command : "ENTER_ROOM",
				send_bandwidth : 0,
				receive_bandwidth : 0
			};
			return sendCommand(target_peer_id, true, data);
		}

		// チャットルームに入室したことををすべての接続先に伝える
		MeetinWebSocketProc.prototype.sendEnterRoom = function(
				target_peer_id
			) {
			return sendEnterRoom(
				target_peer_id
			);
		};

		var sendEnterRoomReceived = function(target_peer_id) {
			var data = {
				command : "ENTER_ROOM_RECEIVED"
			};
			return sendCommand(target_peer_id, true, data);
		}

		MeetinWebSocketProc.prototype.sendEnterRoomReceived = function(
				target_peer_id
			) {
			return sendEnterRoomReceived(
				target_peer_id
			);
		};

		var sendRequestEnterRoom = function(target_peer_id) {
			var data = {
				command : "REQUEST_ENTER_ROOM",
				send_bandwidth : 0,
				receive_bandwidth : 0
			};
			return sendCommand(target_peer_id, true, data);
		}

		MeetinWebSocketProc.prototype.sendRequestEnterRoom = function(
				target_peer_id
			) {
			return sendRequestEnterRoom(
				target_peer_id
			);
		};

		// チャットルームを退室したことをすべての接続先に伝える
		var sendExitRoom = function() {
			var data = {
				command : "EXIT_ROOM"
			};
			return sendCommand(null, true, data);
		}

		// チャットルームを退室したことをすべての接続先に伝える
		MeetinWebSocketProc.prototype.sendExitRoom = function(
			) {
			return sendExitRoom(
			);
		};
		
		// Connectionを閉じるコマンドを送る
		var sendRequestCloseConnectionByConnectionId = function(
				target_peer_id,
				connection_id
			) {
			var data = {
				command : "REQUEST_CLOSE_CONNECTION_BY_CONNECTION_ID",
				connection_id : connection_id
			};
			return sendCommand(target_peer_id, true, data);
		};
		
		// Connectionを閉じるコマンドを送る
		MeetinWebSocketProc.prototype.sendRequestCloseConnectionByConnectionId = function(
				target_peer_id,
				connection_id
			) {
			return sendRequestCloseConnectionByConnectionId(
				target_peer_id,
				connection_id
			);
		};
		
		var sendRequestCloseConnectionByConnectionIdByUserId = function(
				target_user_id,
				connection_id
			) {
			var target_peer_id = null;
			if (0 <= target_peer_id && target_peer_id < MEETIN_MAIN_MAX_PEOPLE) {
				target_peer_id = mUserIdAndPeerDataIdTable[target_user_id];
				return sendRequestCloseConnectionByConnectionId(
					target_peer_id,
					connection_id
				);
			} else {
				return null;
			}
		};
		
		MeetinWebSocketProc.prototype.sendRequestCloseConnectionByConnectionIdByUserId = function(
				target_user_id,
				connection_id
			) {
			return sendRequestCloseConnectionByConnectionIdByUserId(
				target_user_id,
				connection_id
			);
		};

		// 自分のストリームの状態を相手に送る
		var sendStreamInfoDetail = function(
				target_peer_id
			) {
			var data = {
				command : "STREAM_INFO_DETAIL",
				video_stream_id : null,
				audio_stream_id : null,
				screen_stream_id : null
			};
			return sendCommand(target_peer_id, true, data);
		};

		// 自分のストリームの状態を相手に送る
		MeetinWebSocketProc.prototype.sendStreamInfoDetail = function(
				target_peer_id
			) {
			return sendStreamInfoDetail(
				target_peer_id
			);
		};

		var sendPing = function() {
			if (mPingTimeout) {
				clearTimeout(mPingTimeout);
				mPingTimeout = null;
			}
			if (mSendPingTimeout) {
				clearTimeout(mSendPingTimeout);
				mSendPingTimeout = null;
			}
	
			if (mReady) {
				var data = {
					command : "PING",
					from_peer_id : mMeetinWebSocket.getPeerId()
				};
			
				mMeetinWebSocket.sendMessage(JSON.stringify(data));
				
				var run = function() {
					if (mReady) {
						reconnect();
					}
				};
				mPingTimeout = setTimeout(run, DEFAULT_PING_TIMEOUT);
			}
		};
		
		//////////////////////////////////////////////////////////
		// バイナリ（送信）
		//////////////////////////////////////////////////////////

		//////////////////////////////////////////////////////////
		// 受信したコマンドを実行
		//////////////////////////////////////////////////////////

		// 自分の状態を返す
		var runRequestSystemInfoDetail = function(
				json
			) {
			sendSystemInfoDetail(json.from_peer_id);
			
			return true;
		};

		// 自分の状態を返す
		MeetinWebSocketProc.prototype.runRequestSystemInfoDetail = function(
				json
			) {
			return runRequestSystemInfoDetail(
				json
			);
		};

		// 相手の状態をもとに何らかの処理を行う
		var runSystemInfoDetail = function(
				json
			) {
			return false;
		};

		// 相手の状態をもとに何らかの処理を行う
		MeetinWebSocketProc.prototype.runSystemInfoDetail = function(
				json
			) {
			return runSystemInfoDetail(
				json
			);
		};
		
		// 相手のピアに自分のメディアストリーム（映像）を送る
		var runRequestVideoStream = function(
				json
			) {
				return null;
		};

		// 相手のピアに自分のメディアストリーム（映像）を送る
		MeetinWebSocketProc.prototype.runRequestVideoStream = function(
				json
			) {
			return runRequestVideoStream(
				json
			);
		};

		// 相手のピアに自分のメディアストリーム（マイク）を送る
		var runRequestAudioStream = function(
				json
			) {
			return null;
		};

		// 相手のピアに自分のメディアストリーム（マイク）を送る
		MeetinWebSocketProc.prototype.runRequestAudioStream = function(
				json
			) {
			return runRequestAudioStream(
				json
			);
		};

		// 相手のピアに自分のメディアストリーム（画面共有）を送る
		var runRequestScreenStream = function(
				json
			) {
			return null;
		};

		// 相手のピアに自分のメディアストリーム（画面共有）を送る
		MeetinWebSocketProc.prototype.runRequestScreenStream = function(
				json
			) {
			return runRequestScreenStream(
				json
			);
		};
		
		// 相手のカメラがオンになったときの処理
		var runCameraIsOn = function(json) {
			return false;
		};

		// 相手のカメラがオンになったときの処理
		MeetinWebSocketProc.prototype.runCameraIsOn = function(
				json
			) {
			return runCameraIsOn(
				json
			);
		};

		// 相手のカメラがオフになったときの処理
		var runCameraIsOff = function(json) {
			return false;
		};

		// 相手のカメラがオフになったときの処理
		MeetinWebSocketProc.prototype.runCameraIsOff = function(
				json
			) {
			return runCameraIsOff(
				json
			);
		};

		// 相手のマイクがオンになったときの処理
		var runMicIsOn = function(json) {
			return false;
		};

		// 相手のマイクがオンになったときの処理
		MeetinWebSocketProc.prototype.runMicIsOn = function(
				json
			) {
			return runMicIsOn(
				json
			);
		};
		
		// 相手のマイクがオフになったときの処理
		var runMicIsOff = function(
				json
			) {
			return false;
		};

		// 相手のマイクがオフになったときの処理
		MeetinWebSocketProc.prototype.runMicIsOff = function(
				json
			) {
			return runMicIsOff(
				json
			);
		};

		// 相手の画面共有がオンになったときの処理
		var runScreenIsOn = function(json) {
			return false;
		};

		// 相手の画面共有がオンになったときの処理
		MeetinWebSocketProc.prototype.runScreenIsOn = function(
				json
			) {
			return runScreenIsOn(
				json
			);
		};
		
		// 相手の画面共有がオフになったときの処理
		var runScreenIsOff = function(
				json
			) {
			return false;
		};

		// 相手の画面共有がオフになったときの処理
		MeetinWebSocketProc.prototype.runScreenIsOff = function(
				json
			) {
			return runScreenIsOff(
				json
			);
		};

		var runEnterRoom = function(
				json
			) {
			// 相手のピアIDとuserIdを保存
			if (json.from_user_id) {
				if (0 <= json.from_user_id && json.from_user_id < MEETIN_MAIN_MAX_PEOPLE) {
					mUserIdAndPeerDataIdTable[json.from_user_id] = json.from_peer_id;
					
					if (SHOW_LOG) {
						console.log('[MeetinWebSocketProc][runEnterRoom]:mUserIdAndPeerDataIdTable = '+ JSON.stringify(mUserIdAndPeerDataIdTable));
					}
				}
			}

			return false;
		};

		MeetinWebSocketProc.prototype.runEnterRoom = function(
				json
			) {
			return runEnterRoom(
				json
			);
		};

		var runEnterRoomReceived = function(
				json
			) {
			var targetPeerId = json.from_peer_id;

			// 自分のメディアストリーム（映像）を送る
			sendCameraIsOn(
				targetPeerId,
				null,
				null
			);

			sendMicIsOn(
				targetPeerId,
				null,
				null
			);

			// 自分の状態を相手に送る
			sendSystemInfoDetail(targetPeerId);

			sendRequestSystemInfoDetail(targetPeerId);

			return false;
		};

		MeetinWebSocketProc.prototype.runEnterRoomReceived = function(
				json
			) {
			return runEnterRoomReceived(
				json
			);
		};

		var runRequestEnterRoom = function(
				json
			) {
			sendEnterRoom(json.from_peer_id);
			return false;
		};

		MeetinWebSocketProc.prototype.runRequestEnterRoom = function(
				json
			) {
			return runRequestEnterRoom(
				json
			);
		};

		// 接続先がチャットルームを退室したら、明示的にその接続先との接続を切る
		var runExitRoom = function(json) {
			return false;
		};

		// 接続先がチャットルームを退室したら、明示的にその接続先との接続を切る
		MeetinWebSocketProc.prototype.runExitRoom = function(
				json
			) {
			return runExitRoom(
				json
			);
		};

		var runStreamInfoDetail = function(json) {
			return false;
		};

		MeetinWebSocketProc.prototype.runStreamInfoDetail = function(
				json
			) {
			return runStreamInfoDetail(
				json
			);
		};

		var runPingReceived = function(json) {
			if (mPingTimeout) {
				clearTimeout(mPingTimeout);
				mPingTimeout = null;
			}
			if (mSendPingTimeout) {
				clearTimeout(mSendPingTimeout);
				mSendPingTimeout = null;
			}
			
			mSendPingTimeout = setTimeout(
				function() {
					sendPing();
				}, 
				DEFAULT_SEND_PING_WAIT
			);
		};
		
		//////////////////////////////////////////////////////////
		// 汎用関数
		//////////////////////////////////////////////////////////

		// ピアIDをデータベースに保存
		// peerId：データベースに保存するピアID
		var updateConnectionInfo = function(
				connectionInfoId,
				userId,
				peerId,
				successCallback,
				errorCallback
			) {
			var updateConnectionInfoPeerIdSuccessCallbackWork = function(data, textStatus, XMLHttpRequest) {
				if (successCallback && typeof successCallback === "function") {
					successCallback(data, textStatus, XMLHttpRequest);
				}
			}
			
			var updateConnectionInfoPeerIdErrorCallbackWork = function(XMLHttpRequest, textStatus, errorThrown) {
				if (errorCallback && typeof errorCallback === "function") {
					errorCallback(XMLHttpRequest, textStatus, errorThrown);
				}
			};
		
			var updateConnectionInfoPeerIdCompleteCallbackWork = function(XMLHttpRequest, textStatus) {
			};

			// ピアIDをデータベースに保存
			updateConnectionInfoPeerId(
				connectionInfoId,
				userId,
				peerId,
				updateConnectionInfoPeerIdSuccessCallbackWork,
				updateConnectionInfoPeerIdErrorCallbackWork, 
				updateConnectionInfoPeerIdCompleteCallbackWork
			);
		};

		// 空きのuserIdを取得
		var getEmptyUserId = function(
			) {
			for (var i = 0; i < MEETIN_MAIN_MAX_PEOPLE; ++i) {
				if (i != mUserId) {
					if (i in mUserIdAndPeerDataIdTable) {
					} else {
						return i;
					}
				}
			}
			
			return -1;
		};

		// 空きのuserIdを取得
		MeetinWebSocketProc.prototype.getEmptyUserId = function(
			) {
			return getEmptyUserId();
		};

		MeetinWebSocketProc.prototype.removeUserId = function(
				target_user_id
			) {
			if (target_user_id in mUserIdAndPeerDataIdTable) {
				delete mUserIdAndPeerDataIdTable[target_user_id];
			}
		};

		// 接続中の接続先の数を取得する
		var getTotalTargetPeerData = function() {
			if (mUserId in mUserIdAndPeerDataIdTable) {
				return Object.keys(mUserIdAndPeerDataIdTable).length - 1;
			} else {
				return Object.keys(mUserIdAndPeerDataIdTable).length;
			}
		};
		
		// 接続中の接続先の数を取得する
		MeetinWebSocketProc.prototype.getTotalTargetPeerData = function(
			) {
			return getTotalTargetPeerData();
		};

		// 接続中のuserIdのリストを取得する
		// {
		//   [１人目のuserId] : [１人目のピアID],
		//   [２人目のuserId] : [２人目のピアID],
		//   …
		//   [Ｎ人目のuserId] : [Ｎ人目のピアID]
		// }
		var getConnectedUserIdList = function(
			) {
			var userIdList = {};
			
			for (var i = 0; i < MEETIN_MAIN_MAX_PEOPLE; ++i) {
				if (i != mUserId) {
					if (mUserIdAndPeerDataIdTable[i] && mUserIdAndPeerDataIdTable[i].length >= 0) {
						userIdList[i] = mUserIdAndPeerDataIdTable[i];
					}
				}
			}
			
			return userIdList;
		};
		
		// 接続中のuserIdのリストを取得する
		MeetinWebSocketProc.prototype.getConnectedUserIdList = function(
			) {
			return getConnectedUserIdList(
			);
		};

		// ピアIDの配列をuserIdの配列に変換
		var changePeerDataIdArrayToUserIdArray = function(
				peer_data_id_array
			) {
			if (!peer_data_id_array) {
				return null;
			}
			
			var user_id_array = new Array();
			
			for (var i = 0; i < peer_data_id_array.length; ++i) {
				for (var key in mUserIdAndPeerDataIdTable) {
					if (peer_data_id_array[i] === mUserIdAndPeerDataIdTable[key]) {
						user_id_array.push(key);
						break;
					}
				}
			}
			
			return user_id_array;
		};

		// ピアIDの配列をuserIdの配列に変換
		MeetinWebSocketProc.prototype.changePeerDataIdArrayToUserIdArray = function(
				peer_data_id_array
			) {
			return changePeerDataIdArrayToUserIdArray(
				peer_data_id_array
			);
		};
		
		var changePeerDataIdToUserId = function(
				peer_data_id
			) {
			if (peer_data_id && peer_data_id.length > 0) {
				for (var key in mUserIdAndPeerDataIdTable) {
					if (peer_data_id === mUserIdAndPeerDataIdTable[key]) {
						return key;
					}
				}
			}
			
			return null;
		};

		var closeDataConnection = function(target_peer_id) {
			for (var key in mUserIdAndPeerDataIdTable) {
				if (mUserIdAndPeerDataIdTable[key] === target_peer_id) {
					delete mUserIdAndPeerDataIdTable[key];
				}
			}
		};

		// 接続先がチャットルームを退室したら、明示的にその接続先との接続を切る
		MeetinWebSocketProc.prototype.closeDataConnection = function(
				target_peer_id
			) {
			return closeDataConnection(
				target_peer_id
			);
		};

		MeetinWebSocketProc.prototype.changePeerDataIdToUserId = function(
				peer_data_id
			) {
			return changePeerDataIdToUserId(
				peer_data_id
			);
		};
		
		MeetinWebSocketProc.prototype.getPeerId = function(
			) {
			return mMeetinWebSocket.getPeerId(
			);
		};

		MeetinWebSocketProc.prototype.getMeetinWebSocketConnection = function(
			) {
			return mMeetinWebSocket;
		};

		MeetinWebSocketProc.prototype.setUserInfo = function(
			user_info
			) {
			mUserInfo = user_info;
			return mMeetinWebSocket;
		};

		return MeetinWebSocketProc;
	})();
	MeetinWebSocketProcManager.MeetinWebSocketProc = MeetinWebSocketProc;

})(MeetinWebSocketProcManager || (MeetinWebSocketProcManager = {}));
