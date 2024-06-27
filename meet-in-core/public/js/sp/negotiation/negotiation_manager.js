// 商談管理クラス
var NegotiationManager;
(function (NegotiationManager) {

	// 商談管理のコンストラクタ
	var NegotiationMain = (function () {

		// connection_info_id：connection_infoテーブルの[id]
		var mConnectionInfoId = null;
		// userId：チャットルーム内のユーザーID。
		//         オペレータ = 0
		//         ゲスト = 1～8
		var mUserId = null;
		// connection_info_id：connection_infoテーブルの[connect_no]
		var mConnectNo = null;
		// クライアントID
		var mClientId = null;
		// ユーザーの名称
		var mUserInfo = null;

		var mMeetinCore = null;
		var mMeetinWebSocketProc = null;

		var mBrowser = null;

		function NegotiationMain(
			connection_info_id,
			userId,
			connect_no,
			client_id,
			user_info,
			sendBandwidth,
			receiveBandwidth,
			defaultSendBandwidthLevel,
			defaultReceiveBandwidthLevel,
			browser
		) {
			// connection_info_id：connection_infoテーブルの[id]
			mConnectionInfoId = connection_info_id;
			// userId：チャットルーム内のユーザーID。
			//         オペレータ = 0
			//         ゲスト = 1～8
			mUserId = userId;
			// connection_info_id：connection_infoテーブルの[connect_no]
			mConnectNo = connect_no;
			// クライアントID
			mClientId = client_id;
			// ユーザーの名称
			mUserInfo = user_info;

			mBrowser = browser;

			// Safariを除外
			if (browser === 'IE') {
			// if ((browser === 'Safari')
			// 	|| (browser === 'IE')
			// ) {
				mMeetinWebSocketProc = new MeetinWebSocketProcManager.MeetinWebSocketProc(
					connection_info_id,
					userId,
					connect_no,
					client_id,
					user_info,
					sendBandwidth,
					receiveBandwidth,
					browser,
					false
				);
			} else {
				mMeetinCore = new MeetinCoreManager.MeetinCore(
					connection_info_id,
					userId,
					connect_no,
					client_id,
					user_info,
					sendBandwidth,
					receiveBandwidth,
					defaultSendBandwidthLevel,
					defaultReceiveBandwidthLevel,
					browser
				);
			}
		}

		//////////////////////////////////////////////////////////
		// ・初期化
		// ・破棄
		// ・再接続
		//////////////////////////////////////////////////////////

		// 商談管理の初期化
		var init = function(
				exist_peer_id,
				constraints,
				initMedia,
				initCompleteCallback,
				dataConnectionOpenCallback,
				dataConnectionCloseCallback,
				coreCommandCallback,
				commonCommandCallback,
				errorCallback,
				receiveTargetVideoStreamCallback,
				targetVideoStreamCloseCallback,
				targetVideoStreamErrorCallback,
				receiveTargetAudioStreamCallback,
				targetAudioStreamCloseCallback,
				targetAudioStreamErrorCallback,
				receiveTargetScreenStreamCallback,
				targetScreenStreamCloseCallback,
				targetScreenStreamErrorCallback,
				initCompleteCallback_websocket,
				openCallback_websocket,
				coreCommandCallback_websocket,
				commonCommandCallback_websocket,
				binaryCallback_websocket,
				errorCallback_websocket,
				closeCallback_websocket,
				socketConnectionFailCallback_websocket
			) {
			if (mMeetinCore) {
				var initCompleteCallbackWork = function(peerId, connection_info, videoStream, audioStream, screenStream,videoStreamError, audioStreamError, screenStreamError) {
					if (initCompleteCallback && typeof initCompleteCallback === "function") {
						initCompleteCallback(
							peerId,
							connection_info,
							videoStream,
							audioStream,
							screenStream,
							videoStreamError,
							audioStreamError,
							screenStreamError
								);
					}
				};

				return mMeetinCore.init(
					exist_peer_id,
					constraints,
					initMedia,
					initCompleteCallbackWork,
					dataConnectionOpenCallback,
					dataConnectionCloseCallback,
					coreCommandCallback,
					commonCommandCallback,
					errorCallback,
					receiveTargetVideoStreamCallback,
					targetVideoStreamCloseCallback,
					targetVideoStreamErrorCallback,
					receiveTargetAudioStreamCallback,
					targetAudioStreamCloseCallback,
					targetAudioStreamErrorCallback,
					receiveTargetScreenStreamCallback,
					targetScreenStreamCloseCallback,
					targetScreenStreamErrorCallback
				);
			} else if (mMeetinWebSocketProc){
				return mMeetinWebSocketProc.init(
					exist_peer_id,
					constraints,
					true,
					initCompleteCallback_websocket,
					openCallback_websocket,
					coreCommandCallback_websocket,
					commonCommandCallback_websocket,
					binaryCallback_websocket,
					errorCallback_websocket,
					closeCallback_websocket,
					socketConnectionFailCallback_websocket
				);
			}

			return false;
		};

		// 商談管理の初期化
		NegotiationMain.prototype.init = function(
				exist_peer_id,
				constraints,
				initMedia,
				initCompleteCallback,
				dataConnectionOpenCallback,
				dataConnectionCloseCallback,
				coreCommandCallback,
				commonCommandCallback,
				errorCallback,
				receiveTargetVideoStreamCallback,
				targetVideoStreamCloseCallback,
				targetVideoStreamErrorCallback,
				receiveTargetAudioStreamCallback,
				targetAudioStreamCloseCallback,
				targetAudioStreamErrorCallback,
				receiveTargetScreenStreamCallback,
				targetScreenStreamCloseCallback,
				targetScreenStreamErrorCallback,
				initCompleteCallback_websocket,
				openCallback_websocket,
				coreCommandCallback_websocket,
				commonCommandCallback_websocket,
				binaryCallback_websocket,
				errorCallback_websocket,
				closeCallback_websocket,
				socketConnectionFailCallback_websocket
			) {
			return init(
				exist_peer_id,
				constraints,
				initMedia,
				initCompleteCallback,
				dataConnectionOpenCallback,
				dataConnectionCloseCallback,
				coreCommandCallback,
				commonCommandCallback,
				errorCallback,
				receiveTargetVideoStreamCallback,
				targetVideoStreamCloseCallback,
				targetVideoStreamErrorCallback,
				receiveTargetAudioStreamCallback,
				targetAudioStreamCloseCallback,
				targetAudioStreamErrorCallback,
				receiveTargetScreenStreamCallback,
				targetScreenStreamCloseCallback,
				targetScreenStreamErrorCallback,
				initCompleteCallback_websocket,
				openCallback_websocket,
				coreCommandCallback_websocket,
				commonCommandCallback_websocket,
				binaryCallback_websocket.
				errorCallback_websocket,
				closeCallback_websocket,
				socketConnectionFailCallback_websocket
			);
		};

		// 商談管理の破棄
		var destroy = function(
				isCloseConnectionInfo
			) {
			if (mMeetinCore) {
				mMeetinCore.destroy(
					isCloseConnectionInfo
				);
			}

			if (mMeetinWebSocketProc) {
				mMeetinWebSocketProc.destroy();
			}
		};

		// 商談管理の破棄
		NegotiationMain.prototype.destroy = function(
				isCloseConnectionInfo
			) {
			destroy(
				isCloseConnectionInfo
			);
		};

		// 再接続
		var reconnect = function(
			) {
			if (mMeetinWebSocketProc) {
				mMeetinWebSocketProc.destroy();
			}
			if (mMeetinCore) {
				for (var i = 0; i < MEETIN_MAIN_MAX_PEOPLE; ++i) {
					if (i != mUserId) {
						// Videoタグであるか
						var elementID = 'video_target_video_area_' + i;
						var id = 'video_target_video_' + i;
						var id_connection = 'video_target_connecting_' + i;
						var video = document.getElementById(id);
						// videoタグがある
						if (video) {
							// 何もしない
						} else
						// videoタグがない
						{
							$('#video_target_video_area_' + i).empty();
							// videoタグを追加
							addVideoTag(
								elementID,
								id,
								id_connection,
								"video_basis",
								"object-fit: cover;position:absolute; width: 100%; height: 100%;"
							);
							$('#video_target_connecting_' + i).show();
						}
					}
				}
				mMeetinCore.reconnect();
			} else if (mMeetinWebSocketProc) {
				mMeetinWebSocketProc.reconnect();
			}
		};

		// 再接続
		NegotiationMain.prototype.reconnect = function(
			) {
			reconnect();
		};

		//////////////////////////////////////////////////////////
		// カメラ
		//////////////////////////////////////////////////////////

		// カメラをON
		var cameraOn = function(
				constraints,
				completeCallback
			) {
			NEGOTIATION.isMyCameraOn = true;

			if (mMeetinCore) {
				for (var i = 0; i < MEETIN_MAIN_MAX_PEOPLE; ++i) {
					if (i != mUserId) {
						var flash = document.getElementById('negotiation_target_flash_' + i);
						if (flash) {
							meetinFlashTargetVideo_startCamera(i);
							mMeetinCore.sendCameraIsOn(
								i,
								null,
								null,
								null
							);
						}
					}
				}

				mMeetinCore.createAndSendVideoStreamToAllTarget(
					null,
					constraints,
					null,
					null,
					completeCallback,
					null,
					null,
					null
				);
			} else if (mMeetinWebSocketProc) {
				meetinFlashMyVideo_startCamera();

				$('#negotiation_target_video_relative_' + mUserId).show();
				$('#negotiation_target_video_relative_no_video_' + mUserId).hide();

				for (var i = 0; i < MEETIN_MAIN_MAX_PEOPLE; ++i) {
					if (i != mUserId) {
						meetinFlashTargetVideo_startCamera(i);
					}
				}

				mMeetinWebSocketProc.cameraOn();
			}
		};

		// カメラをON
		NegotiationMain.prototype.cameraOn = function(
				constraints,
				completeCallback
			) {
			cameraOn(
				constraints,
				completeCallback
			);
		};

		// カメラをOFF
		var cameraOff = function(
			) {
			NEGOTIATION.isMyCameraOn = false;

			if (mMeetinCore) {
				for (var i = 0; i < MEETIN_MAIN_MAX_PEOPLE; ++i) {
					if (i != mUserId) {
						var flash = document.getElementById('negotiation_target_flash_' + i);
						if (flash) {
							meetinFlashTargetVideo_stopCamera(i);
						}
					}
				}

				mMeetinCore.destroyVideoStream();
			} else if (mMeetinWebSocketProc) {
				meetinFlashMyVideo_stopCamera();
				$('#negotiation_target_video_relative_no_video_' + mUserId).show();

				for (var i = 0; i < MEETIN_MAIN_MAX_PEOPLE; ++i) {
					if (i != mUserId) {
						meetinFlashTargetVideo_stopCamera(i);
					}
				}

				mMeetinWebSocketProc.cameraOff();
			}
		};

		// カメラをOFF
		NegotiationMain.prototype.cameraOff = function(
			) {
			cameraOff();
		};

		//////////////////////////////////////////////////////////
		// マイク
		//////////////////////////////////////////////////////////

		// マイクをON
		var micOn = function(
				completeCallback
			) {
			NEGOTIATION.isMyMicOn = true;

			if (mMeetinCore) {
				for (var i = 0; i < MEETIN_MAIN_MAX_PEOPLE; ++i) {
					if (i != mUserId) {
						var flash = document.getElementById('negotiation_target_flash_' + i);
						if (flash) {
							meetinFlashTargetVideo_startMic(i);
							mMeetinCore.sendMicIsOn(
								i,
								null,
								null,
								null
							);
						}
					}
				}

				mMeetinCore.createAndSendAudioStreamToAllTarget(
					null,
					null,
					null,
					completeCallback,
					null,
					null,
					null
				);
			} else if (mMeetinWebSocketProc) {
				for (var i = 0; i < MEETIN_MAIN_MAX_PEOPLE; ++i) {
					if (i != mUserId) {
						meetinFlashTargetVideo_startMic(i);
					}
				}

				mMeetinWebSocketProc.micOn();
			}
		};

		// マイクをON
		NegotiationMain.prototype.micOn = function(
				completeCallback
			) {
			micOn(
				completeCallback
			);
		};

		// マイクをOFF
		var micOff = function(
			) {
			NEGOTIATION.isMyMicOn = false;

			if (mMeetinCore) {
				for (var i = 0; i < MEETIN_MAIN_MAX_PEOPLE; ++i) {
					if (i != mUserId) {
						var flash = document.getElementById('negotiation_target_flash_' + i);
						if (flash) {
							meetinFlashTargetVideo_stopMic(i);
						}
					}
				}

				mMeetinCore.destroyAudioStream();
			} else if (mMeetinWebSocketProc) {
				for (var i = 0; i < MEETIN_MAIN_MAX_PEOPLE; ++i) {
					if (i != mUserId) {
						meetinFlashTargetVideo_stopMic(i);
					}
				}

				mMeetinWebSocketProc.micOff();
			}
		};

		// マイクをOFF
		NegotiationMain.prototype.micOff = function(
			) {
			micOff();
		};

		// マイク状態
		var getAudioStreamStat = function() {
			if (mMeetinCore) {
				return mMeetinCore.getAudioStreamStat();
			}
			else if (mMeetinWebSocketProc) {
				// なし
				return null;
			}
		};

		// マイク状態
		NegotiationMain.prototype.getAudioStreamStat = function() {
			return getAudioStreamStat();
		};

		//////////////////////////////////////////////////////////
		// 画面共有
		//////////////////////////////////////////////////////////

		// 画面共有開始
		// defaultWidth、defaultHeight、defaultFrameRateについて：
		//   拡張機能に設定された幅、高さ、フレームレートが優先的に
		//   適用される。設定されていない場合のみdefaultWidth、
		//   defaultHeight、defaultFrameRateが使われる
		var screenOn = function(
				defaultWidth,
				defaultHeight,
				defaultFrameRate,
				stopCallback,
				noExtensionErrorCallback,
				completeCallback
			) {
			if (mMeetinCore) {
				mMeetinCore.createAndSendScreenStreamToAllTarget(
					null,
					defaultWidth,
					defaultHeight,
					defaultFrameRate,
					null,
					null,
					stopCallback,
					noExtensionErrorCallback,
					completeCallback,
					null,
					null,
					null
				);
			}
		};

		// 画面共有開始
		// defaultWidth、defaultHeight、defaultFrameRateについて：
		//   拡張機能に設定された幅、高さ、フレームレートが優先的に
		//   適用される。設定されていない場合のみdefaultWidth、
		//   defaultHeight、defaultFrameRateが使われる
		NegotiationMain.prototype.screenOn = function(
				defaultWidth,
				defaultHeight,
				defaultFrameRate,
				stopCallback,
				noExtensionErrorCallback,
				completeCallback
			) {
			screenOn(
				defaultWidth,
				defaultHeight,
				defaultFrameRate,
				stopCallback,
				noExtensionErrorCallback,
				completeCallback
			);
		};

		// 画面共有停止
		var screenOff = function(
			) {
			if (mMeetinCore) {
				mMeetinCore.destroyScreenStream();
			}
		};

		// 画面共有停止
		NegotiationMain.prototype.screenOff = function(
			) {
			screenOff();
		};

		// メディアストリーム（画面共有）の破棄
		NegotiationMain.prototype.destroyScreenStreamSub = function(
			) {
			if (mMeetinCore) {
				mMeetinCore.destroyScreenStreamSub();
			}
		};

		//////////////////////////////////////////////////////////
		// コマンド
		//////////////////////////////////////////////////////////

		// コマンド送信
		var sendCommand = function(
			target_peer_id,
			data
			) {
			if (mMeetinCore) {
				mMeetinCore.sendCommand(
					target_peer_id,
					false,
					data
				);
			}

			if (mMeetinWebSocketProc) {
				mMeetinWebSocketProc.sendCommand(
					target_peer_id,
					false,
					data
				);
			}

			return true;
		};

		// コマンド送信
		NegotiationMain.prototype.sendCommand = function(
				target_peer_id,
				data
			) {
			return sendCommand(
				target_peer_id,
				data
			);
		};

		// コマンド送信
		var sendCommandByUserId = function(
				target_user_id,
				data
			) {
			if (mMeetinCore) {
				mMeetinCore.sendCommandByUserId(
					target_user_id,
					false,
					data
				);
			}

			if (mMeetinWebSocketProc) {
				mMeetinWebSocketProc.sendCommandByUserId(
					target_user_id,
					false,
					data
				);
			}

			return true;
		};

		// コマンド送信
		NegotiationMain.prototype.sendCommandByUserId = function(
				target_user_id,
				data
			) {
			return sendCommandByUserId(
				target_user_id,
				data
			);
		};

		// 相手の状態を要求する
		var sendRequestSystemInfoDetail = function(
				target_peer_id
			) {
			if (mMeetinCore) {
				mMeetinCore.sendRequestSystemInfoDetail(
					target_peer_id
				);
			}

			if (mMeetinWebSocketProc) {
				mMeetinWebSocketProc.sendRequestSystemInfoDetail(
					target_peer_id
				);
			}

			return true;
		};

		// 相手の状態を要求する
		NegotiationMain.prototype.sendRequestSystemInfoDetail = function(
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
			if (mMeetinCore) {
				mMeetinCore.sendRequestSystemInfoDetailByUserId(
					target_user_id
				);
			}

			if (mMeetinWebSocketProc) {
				mMeetinWebSocketProc.sendRequestSystemInfoDetailByUserId(
					target_user_id
				);
			}

			return true;
		};

		// 相手の状態を要求する
		NegotiationMain.prototype.sendRequestSystemInfoDetailByUserId = function(
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
			if (mMeetinCore) {
				mMeetinCore.sendSystemInfoDetail(
					target_peer_id
				);
			}

			if (mMeetinWebSocketProc) {
				mMeetinWebSocketProc.sendSystemInfoDetail(
					target_peer_id
				);
			}

			return true;
		};

		// 自分の状態を相手に送る
		NegotiationMain.prototype.sendSystemInfoDetail = function(
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
			if (mMeetinCore) {
				mMeetinCore.sendSystemInfoDetailByUserId(
					target_user_id
				);
			}

			if (mMeetinWebSocketProc) {
				mMeetinWebSocketProc.sendSystemInfoDetailByUserId(
					target_user_id
				);
			}

			return true;
		};

		// 自分の状態を相手に送る
		NegotiationMain.prototype.sendSystemInfoDetailByUserId = function(
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
			if (mMeetinCore) {
				mMeetinCore.sendRequestVideoStream(
					target_user_id,
					target_peer_id,
					peer_id
				);
			}

			if (mMeetinWebSocketProc) {
				mMeetinWebSocketProc.sendRequestVideoStream(
					target_user_id,
					target_peer_id,
					peer_id
				);
			}

			return true;
		};

		// 相手のメディアストリーム（映像）を要求する
		NegotiationMain.prototype.sendRequestVideoStream = function(
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
			if (mMeetinCore) {
				mMeetinCore.sendRequestVideoStreamByUserId(
					target_user_id,
					peer_id
				);
			}

			if (mMeetinWebSocketProc) {
				mMeetinWebSocketProc.sendRequestVideoStreamByUserId(
					target_user_id,
					peer_id
				);
			}

			return true;
		};

		// 相手のメディアストリーム（映像）を要求する
		NegotiationMain.prototype.sendRequestVideoStreamByUserId = function(
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
			if (mMeetinCore) {
				mMeetinCore.sendRequestAudioStream(
					target_user_id,
					target_peer_id,
					peer_id
				);
			}

			if (mMeetinWebSocketProc) {
				mMeetinWebSocketProc.sendRequestAudioStream(
					target_user_id,
					target_peer_id,
					peer_id
				);
			}

			return true;
		};

		// 相手のメディアストリーム（マイク）を要求する
		NegotiationMain.prototype.sendRequestAudioStream = function(
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
			if (mMeetinCore) {
				mMeetinCore.sendRequestAudioStreamByUserId(
					target_user_id,
					peer_id
				);
			}

			if (mMeetinWebSocketProc) {
				mMeetinWebSocketProc.sendRequestAudioStreamByUserId(
					target_user_id,
					peer_id
				);
			}

			return true;
		};

		// 相手のメディアストリーム（マイク）を要求する
		NegotiationMain.prototype.sendRequestAudioStreamByUserId = function(
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
			if (mMeetinCore) {
				mMeetinCore.sendRequestScreenStream(
					target_user_id,
					target_peer_id,
					peer_id
				);
			}

			if (mMeetinWebSocketProc) {
				mMeetinWebSocketProc.sendRequestScreenStream(
					target_user_id,
					target_peer_id,
					peer_id
				);
			}

			return true;
		};

		// 相手のメディアストリーム（画面共有）を要求する
		NegotiationMain.prototype.sendRequestScreenStream = function(
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
			if (mMeetinCore) {
				mMeetinCore.sendRequestScreenStreamByUserId(
					target_user_id,
					peer_id
				);
			}

			if (mMeetinWebSocketProc) {
				mMeetinWebSocketProc.sendRequestScreenStreamByUserId(
					target_user_id,
					peer_id
				);
			}

			return true;
		};

		// 相手のメディアストリーム（画面共有）を要求する
		NegotiationMain.prototype.sendRequestScreenStreamByUserId = function(
				target_user_id,
				peer_id
			) {
			return sendRequestScreenStreamByUserId(
				target_user_id,
				peer_id
			);
		};

		var sendScreenIsOn = function(
				target_peer_id
			) {
			if (mMeetinWebSocketProc) {
				mMeetinWebSocketProc.sendScreenIsOn(
					target_peer_id,
					null,
					null
				);
			}

			return true;
		};

		NegotiationMain.prototype.sendScreenIsOn = function(
			) {
			return sendScreenIsOn(
			);
		};

		var sendScreenIsOff = function(
			) {
			if (mMeetinWebSocketProc) {
				mMeetinWebSocketProc.sendScreenIsOff(
					null
				);
			}

			return true;
		};

		NegotiationMain.prototype.sendScreenIsOff = function(
			) {
			return sendScreenIsOff(
			);
		};

		// チャットルームを退室したことをすべての接続先に伝える
		var sendEnterRoomReceived = function(
				target_peer_id
			) {
			if (mMeetinCore) {
				mMeetinCore.sendEnterRoomReceived(
					target_peer_id
				);
			}

			if (mMeetinWebSocketProc) {
				mMeetinWebSocketProc.sendEnterRoomReceived(
					target_peer_id
				);
			}

			return true;
		};

		// チャットルームを退室したことをすべての接続先に伝える
		NegotiationMain.prototype.sendEnterRoomReceived = function(
				target_peer_id
			) {
			return sendEnterRoomReceived(
				target_peer_id
			);
		};

		// チャットルームを退室したことをすべての接続先に伝える
		var sendExitRoom = function(
			) {
			if (mMeetinCore) {
				mMeetinCore.sendExitRoom(
			);
			}

			if (mMeetinWebSocketProc) {
				mMeetinWebSocketProc.sendExitRoom();
			}

			return true;
		};

		// チャットルームを退室したことをすべての接続先に伝える
		NegotiationMain.prototype.sendExitRoom = function(
			) {
			return sendExitRoom();
		};

		// Connectionを閉じるコマンドを送る
		NegotiationMain.prototype.sendRequestCloseConnectionByConnectionIdByUserId = function(
				target_user_id,
				connection_id
			) {
			if (mMeetinCore) {
				mMeetinCore.sendRequestCloseConnectionByConnectionIdByUserId(
					target_user_id,
					connection_id
				);
			}

			if (mMeetinWebSocketProc) {
				mMeetinWebSocketProc.sendRequestCloseConnectionByConnectionIdByUserId(
					target_user_id,
					connection_id
				);
			}

			return true;
		};

		NegotiationMain.prototype.stopSendVideoStream = function(
				target_peer_id
			) {
			if (mMeetinCore) {
				return mMeetinCore.stopSendVideoStream(
					target_peer_id
				);
			}

			return false;
		};

		NegotiationMain.prototype.stopSendAudioStream = function(
				target_peer_id
			) {
			if (mMeetinCore) {
				return mMeetinCore.stopSendAudioStream(
					target_peer_id
				);
			}

			return false;
		};

		NegotiationMain.prototype.stopSendScreenStream = function(
				target_peer_id
			) {
			if (mMeetinCore) {
				return mMeetinCore.stopSendScreenStream(
					target_peer_id
				);
			}

			return false;
		};

		//////////////////////////////////////////////////////////
		// その他
		//////////////////////////////////////////////////////////

		// 空きのuserIdを取得
		var getEmptyUserId = function(
			) {
			if (mMeetinCore) {
				return mMeetinCore.getEmptyUserId();
			} else if (mMeetinWebSocketProc) {
				return mMeetinWebSocketProc.getEmptyUserId();
			}

			return -1;
		};

		// 空きのuserIdを取得
		NegotiationMain.prototype.getEmptyUserId = function(
			) {
			return getEmptyUserId();
		};

		// userIdを削除
		NegotiationMain.prototype.removeUserId = function(
				target_user_id
			) {
			if (mMeetinCore) {
				return mMeetinCore.removeUserId(target_user_id);
			} else if (mMeetinWebSocketProc) {
				return mMeetinWebSocketProc.removeUserId(target_user_id);
			}
		};

		// 接続中のuserIdのリストを取得する
		var getConnectedUserIdList = function(
			) {
			if (mMeetinCore) {
				return mMeetinCore.getConnectedUserIdList();
			} else if (mMeetinWebSocketProc) {
				return mMeetinWebSocketProc.getConnectedUserIdList();
			}

			return null;
		};

		// 接続中のuserIdのリストを取得する
		NegotiationMain.prototype.getConnectedUserIdList = function(
			) {
			return getConnectedUserIdList();
		};

		// WebSocketを使うユーザーのpeerIdを取得
		var getConnectedUserIdList_websocket = function(
			) {
			if (mMeetinWebSocketProc) {
				return mMeetinWebSocketProc.getConnectedUserIdList();
			}

			return null;
		};

		// 接続中のuserIdのリストを取得する
		NegotiationMain.prototype.getConnectedUserIdList_websocket = function(
			) {
			return getConnectedUserIdList_websocket();
		};

		// 接続中の接続先の数を取得する
		var getTotalTargetPeerData = function() {
			if (mMeetinCore && !mMeetinWebSocketProc) {
				return mMeetinCore.getTotalTargetPeerData();
			} else if (mMeetinWebSocketProc) {
				return mMeetinWebSocketProc.getTotalTargetPeerData();
			}

			return 0;
		};

		// 接続中の接続先の数を取得する
		NegotiationMain.prototype.getTotalTargetPeerData = function(
			) {
			return getTotalTargetPeerData();
		};

		var muteTargetAudio = function(
			video_id,
			muted
			) {
			if(mMeetinCore && !mMeetinWebSocketProc) {
				return mMeetinCore.muteTargetAudio(video_id,muted);
			} else if(mMeetinWebSocketProc) {
				return mMeetinWebSocketProc.muteTargetAudio(video_id, muted);
			}
		};

		NegotiationMain.prototype.muteTargetAudio = function(
			video_id,
			muted
			) {
			return muteTargetAudio(video_id, muted);
		};

		NegotiationMain.prototype.getMeetinConnection = function(
			) {
			if (mMeetinCore) {
				return mMeetinCore.getMeetinConnection();
			}

			return null;
		};

		NegotiationMain.prototype.getMeetinWebSocketConnection = function(
			) {
			if (mMeetinCore) {
				return mMeetinCore.getMeetinWebSocketConnection();
			}
			if (mMeetinWebSocketProc) {
				return mMeetinWebSocketProc.getMeetinWebSocketConnection();
			}

			return null;
		};

		NegotiationMain.prototype.closeConnectionByConnectionId = function(
				connection_id
			) {
			if (mMeetinCore) {
			return mMeetinCore.closeConnectionByConnectionId(connection_id);
			}

			return 0;
		};

		NegotiationMain.prototype.cancelChooseDesktopMedia = function(
			) {
			if (mMeetinCore) {
				return mMeetinCore.cancelChooseDesktopMedia();
			}

			return false;
		};

		NegotiationMain.prototype.getWebSocketPeerId = function(
			) {
			if (mMeetinWebSocketProc) {
				return mMeetinWebSocketProc.getPeerId();
			}

			return null;
		};

		NegotiationMain.prototype.debug1 = function(
			) {
			if (mMeetinCore) {
				return mMeetinCore.debug1();
			}

			return false;
		};

		NegotiationMain.prototype.debug2 = function(
			) {
			if (mMeetinCore) {
				return mMeetinCore.debug2();
			}

			return false;
		};

		// ユーザー名を設定する
		NegotiationMain.prototype.setUserInfo = function(
			user_info
			) {
			mUserInfo = user_info;
			if(mMeetinCore){
				mMeetinCore.setUserInfo(mUserInfo);
			}
			if(mMeetinWebSocketProc) {
				mMeetinWebSocketProc.setUserInfo(user_info);
			}
		};

		return NegotiationMain;
	})();
	NegotiationManager.NegotiationMain = NegotiationMain;

})(NegotiationManager || (NegotiationManager = {}));
