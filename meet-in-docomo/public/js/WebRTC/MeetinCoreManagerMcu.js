// チャットルームの人数上限（オペレータ１人＋ゲストの人数）
const MEETIN_MAIN_DATA_BANDWIDTH = 1000;

// 送信の最大帯域
const MEETIN_MAIN_MAX_VIDEO_SEND_BANDWIDTH = 2000;
const MEETIN_MAIN_MAX_AUDIO_SEND_BANDWIDTH = 510;
const MEETIN_MAIN_MAX_SCREEN_SEND_BANDWIDTH = 2000;

// 送信の最少帯域
const MEETIN_MAIN_MIN_VIDEO_SEND_BANDWIDTH = 100;
const MEETIN_MAIN_MIN_AUDIO_SEND_BANDWIDTH = 300;
const MEETIN_MAIN_MIN_SCREEN_SEND_BANDWIDTH = 2000;

// 受信の最大帯域
const MEETIN_MAIN_MAX_VIDEO_RECEIVE_BANDWIDTH = 2000;
const MEETIN_MAIN_MAX_AUDIO_RECEIVE_BANDWIDTH = 510;
const MEETIN_MAIN_MAX_SCREEN_RECEIVE_BANDWIDTH = 2000;

// 受信の最少帯域
const MEETIN_MAIN_MIN_VIDEO_RECEIVE_BANDWIDTH = 100;
const MEETIN_MAIN_MIN_AUDIO_RECEIVE_BANDWIDTH = 300;
const MEETIN_MAIN_MIN_SCREEN_RECEIVE_BANDWIDTH = 2000;

// 送信帯域の既定値
const DEFAULT_MEETIN_MAIN_VIDEO_SEND_BANDWIDTH =		[	100, 	200, 	500, 	1000, 	2000];
const DEFAULT_MEETIN_MAIN_AUDIO_SEND_BANDWIDTH =		[	20, 	50, 	132, 	255, 	510];
const DEFAULT_MEETIN_MAIN_SCREEN_SEND_BANDWIDTH =		[	100, 	200, 	500, 	1000, 	2000];

// 受信帯域の既定値
const DEFAULT_MEETIN_MAIN_VIDEO_RECEIVE_BANDWIDTH =	[	100, 	200, 	500, 	1000, 	2000];
const DEFAULT_MEETIN_MAIN_AUDIO_RECEIVE_BANDWIDTH =	[	20, 	50, 	133, 	255, 	510];
const DEFAULT_MEETIN_MAIN_SCREEN_RECEIVE_BANDWIDTH =	[	100, 	200, 	500, 	1000, 	2000];

// Meetin管理クラス
var MeetinCoreManager;
(function (MeetinCoreManager) {
	// ログ表示
	const SHOW_LOG = false;

	// 接続状態のログをデータベースに保存するフラグ
	const SAVE_CONNECTION_LOG_TO_DATABASE = false;

	// データベースへの再接続の上限回数
	const MEETIN_MAIN_MAX_TRY_updateConnectionInfoPeerId = 60;
	// データベースへの再接続間隔（秒）
	const MEETIN_MAIN_TRY_updateConnectionInfoPeerId_WAIT = 1000;

	// ネットワークエラーが起きた時の再接続間隔（秒）
	const MEETIN_MAIN_RECONNECT_WAIT = 3000;
	const MEETIN_MAIN_TRY_RECONNECT_WAIT = 3000;
	const MEETIN_MAIN_TRY_RECONNECT_TIMEOUT = 2000;
	const MEETIN_MAIN_CONNECT_TO_TARGET_WAIT = 500;
	const MEETIN_MAIN_TRY_DATA_CONNECTION_RECONNECT_START_TIMEOUT = 100;
	const MEETIN_MAIN_TRY_DATA_CONNECTION_RECONNECT_TIMEOUT = 10000;
	const MEETIN_MAIN_MAX_TRY_DATA_CONNECTION = 99999999;
	const MEETIN_MAIN_MEDIA_CONNECTION_CALL_TRY_CHECK_TIMER_INTERVAL = 5000;
	const MEETIN_MAIN_MEDIA_CONNECTION_CALL_TRY_CHECK_DIFF = 1;
	const MEETIN_MAIN_CHECK_STREAM_TIMER_INTERVAL = 5000;
	const MEETIN_MAIN_SEND_STREAM_INFO_DETAIL_INTERVAL = 5000;
//	const MEETIN_MAIN_AUTO_CHECK_ENTER_ROOM_STATE_INTERVAL = 10000;

	// true:ユーザーが入室・退室時に自動で各MediaConnectionの最適な帯域上限値を計算し適用する
	// false:固定な帯域上限値を適用する
	const MEETIN_MAIN_AUTO_CHANGE_SEND_BANDWIDTH = false;
	const MEETIN_MAIN_AUTO_CHANGE_RECEIVE_BANDWIDTH = false;

	const MEETIN_MAIN_AUTO_CHECK_ENTER_ROOM_STATE = true;

	// Meetin管理のコンストラクタ
	var MeetinCore = (function () {
		var mWebSoketCnt = 0;

		var mExistPeerId = null;

		// connection_info_id：connection_infoテーブルの[id]
		var mConnectionInfoId = null;

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

		// カメラのConstraints
		var mConstraints = null;

		// 背景合成ストリーム
		var mChromakeyStream = null;
		var mIsChromakey = false;

		// 初期化・再接続完了のコールバック
		// 引数1：connection_info
		//        connection_infoテーブルのレコード
		// 引数2：videoStream
		//        自分のカメラのメディアストリーム
		// 引数3：audioStream
		//        自分のマイクのメディアストリーム
		// 引数4：screenStream
		//        自分の画面共有のメディアストリーム
		var mInitInitCompleteCallback = null;

		// コネクションが利用可能となったときのコールバック
		// 引数1：dataConnection
		//        PeerJSのDataConnection
		//        http://nttcom.github.io/skyway/docs/#dataconnection
		var mInitDataConnectionOpenCallback = null;

		var mInitDataConnectionCloseCallback = null;

		// Meetinのシステムコマンドを受信したときのコールバック
		// 引数1：json
		//        json型のコマンド
		var mInitCoreCommandCallback = null;

		// 通常のコマンドを受信したときのコールバック
		// 引数1：json
		//        json型のコマンド
		var mInitCommonCommandCallback = null;

		// 初期化にエラーが起きたときのコールバック
		// 引数1：err
		//        エラー
		var mInitErrorCallback = null;

		// 接続先のカメラのメディアストリームを受け取ったときのコールバック
		// 引数1：userId
		//        接続先のユーザーID
		// 引数2：stream
		//        接続先のカメラのメディアストリーム
		var mInitReceiveTargetVideoStreamCallback = null;

		// 接続先のカメラのメディアストリームがクローズされたときのコールバック
		// 引数1：type
		//        'stream'：MediaConnectionがクローズされた
		//                  http://nttcom.github.io/skyway/docs/#mediaconnection-on-close
		//        'peer'：メディアストリーム転送用のピアがクローズされた
		//                http://nttcom.github.io/skyway/docs/#peeron-close
		// 引数2：userId
		//        接続先のユーザーID
		var mInitTargetVideoStreamCloseCallback = null;

		// 接続先のカメラのメディアストリームにエラーが起きたときのコールバック
		// 引数1：type
		//        'stream'：MediaConnectionにエラーが起きた
		//                  http://nttcom.github.io/skyway/docs/#mediaconnection-on-error
		//        'peer'：メディアストリーム転送用のピアにエラーが起きた
		//                http://nttcom.github.io/skyway/docs/#peeron-error
		// 引数2：userId
		//        接続先のユーザーID
		// 引数3：error
		//      ：エラー内容
		var mInitTargetVideoStreamErrorCallback = null;

		// 接続先のマイクのメディアストリームを受け取ったときのコールバック
		// 引数1：userId
		//        接続先のユーザーID
		// 引数2：stream
		//        接続先のマイクのメディアストリーム
		var mInitReceiveTargetAudioStreamCallback = null;

		// 接続先のマイクのメディアストリームがクローズされたときのコールバック
		// 引数1：type
		//        'stream'：MediaConnectionがクローズされた
		//                  http://nttcom.github.io/skyway/docs/#mediaconnection-on-close
		//        'peer'：メディアストリーム転送用のピアがクローズされた
		//                http://nttcom.github.io/skyway/docs/#peeron-close
		// 引数2：userId
		//        接続先のユーザーID
		var mInitTargetAudioStreamCloseCallback = null;

		// 接続先のマイクのメディアストリームにエラーが起きたときのコールバック
		// 引数1：type
		//        'stream'：MediaConnectionにエラーが起きた
		//                  http://nttcom.github.io/skyway/docs/#mediaconnection-on-error
		//        'peer'：メディアストリーム転送用のピアにエラーが起きた
		//                http://nttcom.github.io/skyway/docs/#peeron-error
		// 引数2：userId
		//        接続先のユーザーID
		// 引数3：error
		//      ：エラー内容
		var mInitTargetAudioStreamErrorCallback = null;

		// 接続先の画面共有のメディアストリームを受け取ったときのコールバック
		// 引数1：userId
		//        接続先のユーザーID
		// 引数2：stream
		//        接続先の画面共有のメディアストリーム
		var mInitReceiveTargetScreenStreamCallback = null;

		// 接続先の画面共有のメディアストリームがクローズされたときのコールバック
		// 引数1：type
		//        'stream'：MediaConnectionがクローズされた
		//                  http://nttcom.github.io/skyway/docs/#mediaconnection-on-close
		//        'peer'：メディアストリーム転送用のピアがクローズされた
		//                http://nttcom.github.io/skyway/docs/#peeron-close
		// 引数2：userId
		//        接続先のユーザーID
		var mInitTargetScreenStreamCloseCallback = null;

		// 接続先の画面共有のメディアストリームにエラーが起きたときのコールバック
		// 引数1：type
		//        'stream'：MediaConnectionにエラーが起きた
		//                  http://nttcom.github.io/skyway/docs/#mediaconnection-on-error
		//        'peer'：メディアストリーム転送用のピアにエラーが起きた
		//                http://nttcom.github.io/skyway/docs/#peeron-error
		// 引数2：userId
		//        接続先のユーザーID
		// 引数3：error
		//      ：エラー内容
		var mInitTargetScreenStreamErrorCallback = null;

		// ユーザーIDとメッセージ交換用ピアIDを関連付けるテーブル
		var mUserIdAndPeerDataIdTable = {};
		var mUserIdAndPeerDataIdTable_WebRTC = {};
		var mUserIdAndPeerDataIdTable_Flash = {};
		var mUserIdAndReceiveVideoStreamConnectionTable = {};
		var mUserIdAndReceiveAudioStreamConnectionTable = {};
		var mUserIdAndReceiveScreenStreamConnectionTable = {};

		// 送信の帯域幅を制限するかどうか
		var mLimitSendBandwidth = true;
		// 受信の帯域幅を制限するかどうか
		var mLimitReceiveBandwidth = true;

		var mOldPeerDataIdAndVideoSendBandwidthOptionsTableString = null;
		var mOldPeerDataIdAndAudioSendBandwidthOptionsTableString = null;
		var mOldPeerDataIdAndScreenSendBandwidthOptionsTableString = null;

		var mOldPeerDataIdAndVideoReceiveBandwidthOptionsTableString = null;
		var mOldPeerDataIdAndAudioReceiveBandwidthOptionsTableString = null;
		var mOldPeerDataIdAndScreenReceiveBandwidthOptionsTableString = null;

		// 画面共有中フラグ
		var mIsSendScreenOn = false;
		var mIsReceiveScreenOn = false;

		// 回線の帯域
		var mSendBandwidth = null;
		var mReceiveBandwidth = null;
		var mDefaultSendBandwidthLevel = DEFAULT_MEETIN_MAIN_SEND_BANDWIDTH_LEVEL_0;
		var mDefaultReceiveBandwidthLevel = DEFAULT_MEETIN_MAIN_RECEIVE_BANDWIDTH_LEVEL_0;

		// 送信の帯域制限
		var mPeerDataIdAndVideoSendBandwidthOptionsTable = {};
		var mPeerDataIdAndAudioSendBandwidthOptionsTable = {};
		var mPeerDataIdAndScreenSendBandwidthOptionsTable = {};

		// 受信の帯域制限
		var mPeerDataIdAndVideoReceiveBandwidthOptionsTable = {};
		var mPeerDataIdAndAudioReceiveBandwidthOptionsTable = {};
		var mPeerDataIdAndScreenReceiveBandwidthOptionsTable = {};

		// メディア管理
		var mMeetinMedia = new MeetinMediaManager.MeetinMedia();
		// 接続管理
		var mMeetinConnection = new MeetinConnectionManager.MeetinConnection();
		// WebSocket
		var mMeetinWebSocket = new MeetinWebSocketManager.MeetinWebSocket();

		var mReady = false;

		var mReconncetTimer = false;
		var mTryReconncetTimer = false;

		var mMediaConnectionCallTryTable = {};
		var mMediaConnectionCallTryCheckTimer = null;

		var mCheckStreamTimer = null;
		var mSendStreamInfoDetailTimer = null;
		var mCheckEnterRoomStateTimer = null;

		var mPingTimeout = null;
		var mSendPingTimeout = null;

		// media_typeがないMediaConnectionの管理
		var mConnectionIdAndMediaConnection = {};
		var mUserIdAndVideoStreamConnectionIdArray = [new Array(), new Array(), new Array(), new Array(), new Array(), new Array(),];
		var mUserIdAndAudioStreamConnectionIdArray = [new Array(), new Array(), new Array(), new Array(), new Array(), new Array(),];
		var mUserIdAndScreenStreamConnectionIdArray = [new Array(), new Array(), new Array(), new Array(), new Array(), new Array(),];

		var mBrowser = null;

		function MeetinCore(
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
			mConnectionInfoId = connection_info_id;
			mUserId = userId;
			mConnectNo = connect_no;
			mClientId = client_id;
			mUserInfo = user_info;
			mSendBandwidth = sendBandwidth;
			mReceiveBandwidth = receiveBandwidth;
			mDefaultSendBandwidthLevel = defaultSendBandwidthLevel;
			mDefaultReceiveBandwidthLevel = defaultReceiveBandwidthLevel;
			mBrowser = browser;
		}

		//////////////////////////////////////////////////////////
		// ・初期化
		// ・破棄
		//////////////////////////////////////////////////////////

		// Meetin管理の初期化
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
				targetScreenStreamErrorCallback
			) {
			if (SHOW_LOG) {
				console.log('[MeetinCore][init][start]:exist_peer_id = '+ exist_peer_id);
			}

			// 引数を覚える。再接続するときに初期化
			mExistPeerId = exist_peer_id;
			mConstraints = constraints;
			mInitInitCompleteCallback = initCompleteCallback;
			mInitDataConnectionOpenCallback = dataConnectionOpenCallback;
			mInitDataConnectionCloseCallback = dataConnectionCloseCallback;
			mInitCoreCommandCallback = coreCommandCallback;
			mInitCommonCommandCallback = commonCommandCallback;
			mInitErrorCallback = errorCallback;
			mInitReceiveTargetVideoStreamCallback = receiveTargetVideoStreamCallback;
			mInitTargetVideoStreamCloseCallback = targetVideoStreamCloseCallback;
			mInitTargetVideoStreamErrorCallback = targetVideoStreamErrorCallback;
			mInitReceiveTargetAudioStreamCallback = receiveTargetAudioStreamCallback;
			mInitTargetAudioStreamCloseCallback = targetAudioStreamCloseCallback;
			mInitTargetAudioStreamErrorCallback = targetAudioStreamErrorCallback;
			mInitReceiveTargetScreenStreamCallback = receiveTargetScreenStreamCallback;
			mInitTargetScreenStreamCloseCallback = targetScreenStreamCloseCallback;
			mInitTargetScreenStreamErrorCallback = targetScreenStreamErrorCallback;

			var initMediaStream_finishCallback = function(videoStream, audioStream, screenStream, videoStreamError, audioStreamError, screenStreamError) {
				var initPeer_finishCallback = function(peerId) {
					var openCallback = function(peerId) {
						var initDatabase_finishCallback = function(connection_info) {
							sendInitData(connection_info);

							if (SHOW_LOG) {
								var videoStreamId = null;
								var audioStreamId = null;
								var screenStreamId = null;
								if (videoStream) {
									videoStreamId = videoStream.id;
								}
								if (audioStream) {
									audioStreamId = audioStream.id;
								}
								if (screenStream) {
									screenStreamId = screenStream.id;
								}
								console.log('[MeetinCore][init][complete]:peerId = '+ peerId + ', connection_info = '+ connection_info + ', video stream = ' + videoStreamId + ', audio stream = ' + audioStreamId + ', screen stream = ' + screenStreamId);
							}
							mReady = true;

							sendPing();

							// 初期化はここまで、初期化完了コールバックを呼び出す
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

						// データベースの更新
						initDatabase(
							mConnectionInfoId,
							mUserId,
							peerId,
							errorCallback,
							initDatabase_finishCallback
						);
					};

					initWebSocket(
						"S" + peerId,
						mConnectionInfoId,
						true,
						openCallback,
						coreCommandCallback,
						commonCommandCallback,
						null,
						errorCallback,
						null,
						null
					);
				};

				// ピアの初期化
				initPeer(
					exist_peer_id,
					dataConnectionOpenCallback,
					dataConnectionCloseCallback,
					coreCommandCallback,
					commonCommandCallback,
					errorCallback,
					initPeer_finishCallback
				);
			};

			// メディアストリームの初期化
			if (initMedia) {
				initMediaStream(
					constraints,
					initMediaStream_finishCallback
				);
			} else {
				initMediaStream_finishCallback(
					mMeetinMedia.getVideoStream(),
					mMeetinMedia.getAudioStream(),
					mMeetinMedia.getScreenStream(),
					null,
					null,
					null
				);
			}
		};

		// Meetin管理の初期化
		MeetinCore.prototype.init = function(
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
				targetScreenStreamErrorCallback
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
				targetScreenStreamErrorCallback
			);
		};

		var initWebSocket = function(
			requestPeerId,
			connectionInfoId,
			canUseWebRTC,
			openCallback,
			coreCommandCallback,
			commonCommandCallback,
			binaryCallback,
			errorCallback,
			closeCallback,
			socketConnectionFailCallback
		) {
			var openCallbackWork = function(peerId) {
				mWebSoketCnt=0;	// Openできたのでカウンタを初期化(0)する
				if (openCallback && typeof openCallback === "function") {
					openCallback(peerId);
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
				if (mReady) {
					if (errorCallback && typeof errorCallback === "function") {
						mReady = false;
						var err = new Error('サーバー接続エラー');
						err.type = 'web-socket-error';
						errorCallback(err);
					}
				}
			};

			var closeCallbackWork = function(event) {
				// WebSocketサーバーとの接続が切れたときに再接続する
				// ただし接続が解消されない場合はエラーとし、ユーザへ再接続メッセージを表示し促す。
				if (mReady) {
					mWebSoketCnt++;
					console.log("★★★MeetinCoreManager closeCallbackWork mWebSoketCnt["+ mWebSoketCnt +"] code("+event.code+")");
					if( mWebSoketCnt > 5) {
						if (errorCallback && typeof errorCallback === "function") {
							mReady = false;
							var err = new Error('サーバー接続エラー');
							err.type = 'web-socket-error';
							errorCallback(err);
						}
					}
				}
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
				true,
				openCallbackWork,
				messageCallbackWork,
				binaryCallbackWork,
				errorCallbackWork,
				closeCallbackWork,
				socketConnectionFailCallbackWork
			);
		};

		var initMediaStream = function (
			constraints,
			finishCallback
			) {
			if (SHOW_LOG) {
				console.log('[MeetinCore][initMediaStream][start]');
			}

			var createVideoStreamCompleteCallback = function(videoStream, videoStreamError) {
				var createAudioStreamCompleteCallback = function(audioStream, audioStreamError) {
					if (SHOW_LOG) {
						var videoStreamId = null;
						var audioStreamId = null;
						if (videoStream) {
							videoStreamId = videoStream.id;
						}
						if (audioStream) {
							audioStreamId = audioStream.id;
						}
						console.log('[MeetinCore][initMediaStream][complete]:video stream = '+ videoStreamId + ', audio stream = ' + audioStreamId);
					}

					// 初期化はここまで、初期化完了コールバックを呼び出す
					if (finishCallback && typeof finishCallback === "function") {
						finishCallback(
							videoStream,
							audioStream,
							null,
							videoStreamError,
							audioStreamError,
							null
						);
					}
				};

				// メディアストリーム（マイク）の作成
				mMeetinMedia.createAudioStream(
					null,
					null,
					createAudioStreamCompleteCallback
				);
			};

			// メディアストリーム（映像）の作成
			mMeetinMedia.createVideoStream(
				constraints,
				null,
				null,
				createVideoStreamCompleteCallback
			);
		};

		var initPeer = function(
				exist_peer_id,
				dataConnectionOpenCallback,
				dataConnectionCloseCallback,
				coreCommandCallback,
				commonCommandCallback,
				errorCallback,
				finishCallback
			) {
			if (SHOW_LOG) {
				console.log('[MeetinCore][initPeer][start]');
			}

			// PeerServerへの接続が確立した時
			var peerOpenCallbackWork = function(peerData, peerId) {
				mExistPeerId = peerId;

				// // セッションをクリアする
				// var data = {
				// 	peer_id : peerId
				// 	};

				// saveWebRtcParam(
				// 	data,
				// 	null,
				// 	null,
				// 	null
				// );

				// ピアIDをuserIdに関連付ける
				mUserIdAndPeerDataIdTable[mUserId] = peerId;

				// ピアIDをpeer_id変数へ設定する("S"付きで)※「#peer_id」が存在した場合
				if($('#peer_id').size()){
					var id = peerId;
					if (16 == peerId.length) {
						id = "S" + peerId;
					}
					$('#peer_id').val(id);
				}

				if (SHOW_LOG) {
					console.log('[MeetinCore][initPeer][peerOpenCallbackWork]:mUserIdAndPeerDataIdTable = '+ JSON.stringify(mUserIdAndPeerDataIdTable));
				}

				if (finishCallback && typeof finishCallback === "function") {
					finishCallback(peerId);
				}
			}

			// 接続先のピアと接続が確立した時
			var peerConnectionCallbackWork = function(peerData, dataConnection) {
			}

			// 接続先が自分に発信してきた時
			var peerCallCallbackWork = function(peerData, mediaConnection) {
				var option = {};
				if (mLimitReceiveBandwidth && MEETIN_MAIN_AUTO_CHANGE_RECEIVE_BANDWIDTH) {
					// カメラの映像
					if (mediaConnection.metadata.media_type === 'camera') {
						if (SHOW_LOG) {
							console.log('[MeetinCore][initPeer][peerCallCallbackWork][mediaConnection]:id = '+ mediaConnection.id + ', media_type = ' + mediaConnection.metadata.media_type + ', options = ' + JSON.stringify(mPeerDataIdAndVideoReceiveBandwidthOptionsTable[mediaConnection.peer]));
						}

						if (mReceiveBandwidth && !MEETIN_MAIN_AUTO_CHANGE_RECEIVE_BANDWIDTH) {
							mPeerDataIdAndVideoReceiveBandwidthOptionsTable[mediaConnection.peer] = {video_bandwidth : DEFAULT_MEETIN_MAIN_VIDEO_RECEIVE_BANDWIDTH[mDefaultReceiveBandwidthLevel], audio_bandwidth : 0, media_type : 'camera'};
							options = {
								videoBandwidth: DEFAULT_MEETIN_MAIN_VIDEO_RECEIVE_BANDWIDTH[mDefaultReceiveBandwidthLevel],
								audioBandwidth: 0,
								metadata: {
									media_type: 'camera',
								}
							};
						}
						// 受信したストリームを許可する（映像）
						mediaConnection.answer(null, options);

						if (SAVE_CONNECTION_LOG_TO_DATABASE) {
							if (peerData) {
								mediaConnectionAnswerLog(
									mConnectionInfoId,
									2,
									mediaConnection.id,
									mediaConnection.peer,
									peerData.id,
									mUserId,
									null,
									null,
									null
								);
							}
						}
					}
					// マイクの音声
					else if (mediaConnection.metadata.media_type === 'mic') {
						if (SHOW_LOG) {
							console.log('[MeetinCore][initPeer][peerCallCallbackWork][mediaConnection]:id = '+ mediaConnection.id + ', media_type = ' + mediaConnection.metadata.media_type + ', options = ' + JSON.stringify(mPeerDataIdAndAudioReceiveBandwidthOptionsTable[mediaConnection.peer]));
						}

						if (mReceiveBandwidth && !MEETIN_MAIN_AUTO_CHANGE_RECEIVE_BANDWIDTH) {
							mPeerDataIdAndAudioReceiveBandwidthOptionsTable[mediaConnection.peer] = {video_bandwidth : 0, audio_bandwidth : DEFAULT_MEETIN_MAIN_AUDIO_RECEIVE_BANDWIDTH[mDefaultReceiveBandwidthLevel], media_type : 'mic'};
							options = {
								videoBandwidth: 0,
								audioBandwidth: DEFAULT_MEETIN_MAIN_AUDIO_RECEIVE_BANDWIDTH[mDefaultReceiveBandwidthLevel],
								metadata: {
									media_type: 'mic',
								}
							};
						}

						// 受信したストリームを許可する(マイク)
						mediaConnection.answer(null, options);

						if (SAVE_CONNECTION_LOG_TO_DATABASE) {
							if (peerData) {
								mediaConnectionAnswerLog(
									mConnectionInfoId,
									3,
									mediaConnection.id,
									mediaConnection.peer,
									peerData.id,
									mUserId,
									null,
									null,
									null
								);
							}
						}
					}

					// 画面共有の映像
					else if (mediaConnection.metadata.media_type === 'screen') {
						if (SHOW_LOG) {
							console.log('[MeetinCore][initPeer][peerCallCallbackWork][mediaConnection]:id = '+ mediaConnection.id + ', media_type = ' + mediaConnection.metadata.media_type + ', options = ' + JSON.stringify(mPeerDataIdAndScreenReceiveBandwidthOptionsTable[mediaConnection.peer]));
						}

						if (mReceiveBandwidth && !MEETIN_MAIN_AUTO_CHANGE_RECEIVE_BANDWIDTH) {
							mPeerDataIdAndScreenReceiveBandwidthOptionsTable[mediaConnection.peer] = {video_bandwidth : DEFAULT_MEETIN_MAIN_SCREEN_RECEIVE_BANDWIDTH[mDefaultReceiveBandwidthLevel], audio_bandwidth : 0, media_type : 'screen'};
							options = {
								videoBandwidth: DEFAULT_MEETIN_MAIN_SCREEN_RECEIVE_BANDWIDTH[mDefaultReceiveBandwidthLevel],
								audioBandwidth: 0,
								metadata: {
									media_type: 'screen',
								}
							};
						}

console.log('[MeetinCore][initPeer][peerCallCallbackWork][mediaConnection]::options('+ JSON.stringify(options) +')');

						// 受信したストリームを許可する（共有）
						mediaConnection.answer(null, options);

						if (SAVE_CONNECTION_LOG_TO_DATABASE) {
							if (peerData) {
								mediaConnectionAnswerLog(
									mConnectionInfoId,
									4,
									mediaConnection.id,
									mediaConnection.peer,
									peerData.id,
									mUserId,
									null,
									null,
									null
								);
							}
						}
					}
					// その他
					else {
						if (SHOW_LOG) {
							console.log('[MeetinCore][initPeer][peerCallCallbackWork][mediaConnection]:id = '+ mediaConnection.id + ', media_type = ' + mediaConnection.metadata.media_type + ', options = null');
						}

						if (mReceiveBandwidth && !MEETIN_MAIN_AUTO_CHANGE_RECEIVE_BANDWIDTH) {
							option = {
								videoBandwidth: DEFAULT_MEETIN_MAIN_VIDEO_RECEIVE_BANDWIDTH[mDefaultReceiveBandwidthLevel],
								audioBandwidth : DEFAULT_MEETIN_MAIN_AUDIO_RECEIVE_BANDWIDTH[mDefaultReceiveBandwidthLevel]
							};
						}

						// 受信したストリームを許可する（その他）
						mediaConnection.answer(null, option);

						if (SAVE_CONNECTION_LOG_TO_DATABASE) {
							if (peerData) {
								mediaConnectionAnswerLog(
									mConnectionInfoId,
									-1,
									mediaConnection.id,
									mediaConnection.peer,
									peerData.id,
									mUserId,
									null,
									null,
									null
								);
							}
						}
					}
				} else {
					// 自動帯域無
					if (SHOW_LOG) {
						console.log('[MeetinCore][initPeer][peerCallCallbackWork][mediaConnection]:id = '+ mediaConnection.id + ', media_type = ' + mediaConnection.metadata.media_type);
					}

					if (mReceiveBandwidth && !MEETIN_MAIN_AUTO_CHANGE_RECEIVE_BANDWIDTH) {
						option = {
							videoBandwidth : DEFAULT_MEETIN_MAIN_VIDEO_RECEIVE_BANDWIDTH[mDefaultReceiveBandwidthLevel],
							audioBandwidth : DEFAULT_MEETIN_MAIN_AUDIO_RECEIVE_BANDWIDTH[mDefaultReceiveBandwidthLevel]
						};
					}

					if (SAVE_CONNECTION_LOG_TO_DATABASE) {
						if (peerData) {
							var connection_type = 0;
							if ('camera' === mediaConnection.metadata.media_type) {
								connection_type = 2;
							} else if ('mic' === mediaConnection.metadata.media_type) {
								connection_type = 3;
							} else if ('screen' === mediaConnection.metadata.media_type) {
								connection_type = 4;
							}

							mediaConnectionAnswerLog(
								mConnectionInfoId,
								connection_type,
								mediaConnection.id,
								mediaConnection.peer,
								peerData.id,
								mUserId,
								null,
								null,
								null
							);
						}
					}
if ('camera' === mediaConnection.metadata.media_type) {
	console.log('カメラ1');
}
else if ('mic' === mediaConnection.metadata.media_type) {
	console.log('マイク2');
}
else if ('screen' === mediaConnection.metadata.media_type) {
	console.log('共有3');
}
else {
	console.log('その他4');
}
console.log('[MeetinCore][initPeer][peerCallCallbackWork][mediaConnection]:自動帯域無:options('+ JSON.stringify(option) +')');

					// 受信したストリームを許可する
					mediaConnection.answer(null, option);
				}
			}

			// ピアとの接続がdestroyedとなった時
			var peerCloseCallbackWork = function(peerData) {
			}

			// disconnectedが起きた時
			var peerDisconnectedCallbackWork = function(peerData) {
				if (mReady) {
					if (window.navigator.onLine) {
						mMeetinConnection.peerDataReconnect();
					}
				}
			}

			// ピアのエラーが起きた時
			var peerErrorCallbackWork = function(peerData, err) {
				// 致命的エラー
				// 利用しようとしているwebRTC機能のすべて、またはいくつかについて、クライアントのブラウザがサポートしていません
				if (err.type === 'browser-incompatible') {
				}
				// You've already disconnected this peer from the server and can no longer make any new connections on it.
				else if (err.type === 'disconnected') {
					tryReconnect();
				}
				// 致命的エラー
				// Peerコンストラクタへ渡されたIDに、不正な文字が含まれています。
				else if (err.type === 'invalid-id') {
					tryReconnect();
				}
				// 致命的エラー
				// Peerコンストラクタへ渡されたAPI Keyが不正な文字列を含んでいます。または、API Keyが含まれていません（クラウド上のサーバを利用する場合のみ）。
				else if (err.type === 'invalid-key') {
				}
				// Lost or cannot establish a connection to the signalling server.
				else if (err.type === 'network') {
					tryReconnect();
				}
				// The peer you're trying to connect to does not exist.
				else if (err.type === 'peer-unavailable') {
				}
				// 致命的エラー
				// PeerJSはsecureな状態を利用しますが、クラウド上のサーバはSSLをサポートしていません。独自のPeerServerを利用してください。
				else if (err.type === 'ssl-unavailable') {
				}
				// 致命的エラー
				// サーバに到達できません。
				else if (err.type === 'server-error') {
					tryReconnect();
				}
				// 致命的エラー
				// ソケットからのエラーです。
				else if (err.type === 'socket-error') {
					tryReconnect();
				}
				// 致命的エラー
				// ソケットが予期せずクローズしました。
				else if (err.type === 'socket-closed') {
					tryReconnect();
				}
				// 致命的エラー
				// Peerコンストラクタへ渡されたIDは既に利用されています。
				else if (err.type === 'unavailable-id') {
					tryReconnect();
				}
				// 既にこのPeerとの接続が切断されており、新しいコネクションを作成できません。
				else if (err.type === 'server-disconnected') {
					tryReconnect();
				}

				if (errorCallback && typeof errorCallback === "function") {
					errorCallback(err);
				}
			};

			var mediaConnectionStreamCallbackWork = function(mediaConnection, stream, myPeerId, targetPeerId, connectionId) {
				if (connectionId) {
					if (stream) {
						var targetUserId = mediaConnection.metadata.extra1;
						mUserIdAndPeerDataIdTable_WebRTC[targetUserId] = targetPeerId;

						if (SHOW_LOG) {
							console.log('[MeetinCore][initPeer][mediaConnectionStreamCallbackWork]:media_type = '+ mediaConnection.metadata.media_type + ', stream = ' + stream.id + ', targetPeerId = ' + targetPeerId + ', targetUserId = ' + targetUserId + ', connectionId = ' + connectionId);
						}

						if (mediaConnection.metadata.media_type === 'camera') {
							mUserIdAndReceiveVideoStreamConnectionTable[targetUserId] = mediaConnection;

							if (mInitReceiveTargetVideoStreamCallback && typeof mInitReceiveTargetVideoStreamCallback === "function") {
								mInitReceiveTargetVideoStreamCallback(
									targetUserId,
									stream,
									myPeerId,
									targetPeerId,
									connectionId
								);

							}

							if (SAVE_CONNECTION_LOG_TO_DATABASE) {
								mediaConnectionStream2Log(
									mConnectionInfoId,
									2,
									connectionId,
									targetPeerId,
									myPeerId,
									null,
									null,
									null
								);
							}

							sendStreamReceived(
								targetPeerId,
								stream.id,
								connectionId,
								mediaConnection.metadata.media_type
							);
						} else if (mediaConnection.metadata.media_type === 'mic') {
							mUserIdAndReceiveAudioStreamConnectionTable[targetUserId] = mediaConnection;

							if (mInitReceiveTargetAudioStreamCallback && typeof mInitReceiveTargetAudioStreamCallback === "function") {
								mInitReceiveTargetAudioStreamCallback(
									targetUserId,
									stream,
									myPeerId,
									targetPeerId,
									connectionId
								);
							}

							if (SAVE_CONNECTION_LOG_TO_DATABASE) {
								mediaConnectionStream2Log(
									mConnectionInfoId,
									3,
									connectionId,
									targetPeerId,
									myPeerId,
									null,
									null,
									null
								);
							}

							sendStreamReceived(
								targetPeerId,
								stream.id,
								connectionId,
								mediaConnection.metadata.media_type
							);
						} else if (mediaConnection.metadata.media_type === 'screen') {
							mUserIdAndReceiveScreenStreamConnectionTable[targetUserId] = mediaConnection;

							if (mInitReceiveTargetScreenStreamCallback && typeof mInitReceiveTargetScreenStreamCallback === "function") {
								mInitReceiveTargetScreenStreamCallback(
									targetUserId,
									stream,
									myPeerId,
									targetPeerId,
									connectionId
								);
							}

							mIsReceiveScreenOn = true;

							if (SAVE_CONNECTION_LOG_TO_DATABASE) {
								mediaConnectionStream2Log(
									mConnectionInfoId,
									4,
									connectionId,
									targetPeerId,
									myPeerId,
									null,
									null,
									null
								);
							}

							sendStreamReceived(
								targetPeerId,
								stream.id,
								connectionId,
								mediaConnection.metadata.media_type
							);
						} else {
							// media_typeがないときの対応

							var findTarget = false;

							if (!findTarget) {
								for (var j = 0; j < mUserIdAndVideoStreamConnectionIdArray.length; ++j) {
									var connectionIdArray = mUserIdAndVideoStreamConnectionIdArray[j];

									for (var i = 0; i < connectionIdArray.length; ++i) {
										if (connectionId === connectionIdArray[i]) {
											findTarget = true;

											mUserIdAndReceiveVideoStreamConnectionTable[j] = mediaConnection;

											if (mInitReceiveTargetVideoStreamCallback && typeof mInitReceiveTargetVideoStreamCallback === "function") {
												mInitReceiveTargetVideoStreamCallback(
													j,
													stream,
													myPeerId,
													targetPeerId,
													connectionId
												);

											}

											if (SAVE_CONNECTION_LOG_TO_DATABASE) {
												mediaConnectionStream2Log(
													mConnectionInfoId,
													2,
													connectionId,
													targetPeerId,
													myPeerId,
													null,
													null,
													null
												);
											}

											sendStreamReceived(
												targetPeerId,
												stream.id,
												connectionId,
												'camera'
											);

											break;
										}
									}

									if (findTarget) {
										break;
									}
								}
							}

							if (!findTarget) {
								for (var j = 0; j < mUserIdAndAudioStreamConnectionIdArray.length; ++j) {
									var connectionIdArray = mUserIdAndAudioStreamConnectionIdArray[j];

									for (var i = 0; i < connectionIdArray.length; ++i) {
										if (connectionId === connectionIdArray[i]) {
											findTarget = true;

											mUserIdAndReceiveAudioStreamConnectionTable[j] = mediaConnection;

											if (mInitReceiveTargetAudioStreamCallback && typeof mInitReceiveTargetAudioStreamCallback === "function") {
												mInitReceiveTargetAudioStreamCallback(
													j,
													stream,
													myPeerId,
													targetPeerId,
													connectionId
												);

											}

											if (SAVE_CONNECTION_LOG_TO_DATABASE) {
												mediaConnectionStream2Log(
													mConnectionInfoId,
													3,
													connectionId,
													targetPeerId,
													myPeerId,
													null,
													null,
													null
												);
											}

											sendStreamReceived(
												targetPeerId,
												stream.id,
												connectionId,
												'mic'
											);

											break;
										}
									}

									if (findTarget) {
										break;
									}
								}
							}

							if (!findTarget) {
								for (var j = 0; j < mUserIdAndScreenStreamConnectionIdArray.length; ++j) {
									var connectionIdArray = mUserIdAndScreenStreamConnectionIdArray[j];

									for (var i = 0; i < connectionIdArray.length; ++i) {
										if (connectionId === connectionIdArray[i]) {
											findTarget = true;

											mUserIdAndReceiveScreenStreamConnectionTable[j] = mediaConnection;

											if (mInitReceiveTargetScreenStreamCallback && typeof mInitReceiveTargetScreenStreamCallback === "function") {
												mInitReceiveTargetScreenStreamCallback(
													j,
													stream,
													myPeerId,
													targetPeerId,
													connectionId
												);

											}

											if (SAVE_CONNECTION_LOG_TO_DATABASE) {
												mediaConnectionStream2Log(
													mConnectionInfoId,
													4,
													connectionId,
													targetPeerId,
													myPeerId,
													null,
													null,
													null
												);
											}

											sendStreamReceived(
												targetPeerId,
												stream.id,
												connectionId,
												'screen'
											);

											break;
										}
									}

									if (findTarget) {
										break;
									}
								}
							}


							if (!findTarget) {
								mConnectionIdAndMediaConnection[connectionId] = mediaConnection;
							}
						}
					}
				}
			};

			var mediaConnectionCloseCallbackWork = function(mediaConnection, myPeerId, targetPeerId, connectionId) {
				if (connectionId && connectionId.length > 0) {
					sendRequestCloseConnectionByConnectionId(
						targetPeerId,
						connectionId
					);

					var targetUserId = mediaConnection.metadata.extra1;

					if (SHOW_LOG) {
						console.log('[MeetinCore][initPeer][mediaConnectionCloseCallbackWork]:media_type = '+ mediaConnection.metadata.media_type + ', targetPeerId = ' + targetPeerId + ', targetUserId = ' + targetUserId + ', connectionId = ' + connectionId);
					}

					if (mediaConnection.metadata.media_type === 'camera') {
						if (mInitTargetVideoStreamCloseCallback && typeof mInitTargetVideoStreamCloseCallback === "function") {
							mInitTargetVideoStreamCloseCallback(
								targetUserId,
								myPeerId,
								targetPeerId,
								connectionId
							);
						}

						if (SAVE_CONNECTION_LOG_TO_DATABASE) {
							mediaConnectionClose2Log(
								mConnectionInfoId,
								2,
								connectionId,
								targetPeerId,
								myPeerId,
								null,
								null,
								null
							);
						}
					} else if (mediaConnection.metadata.media_type === 'mic') {
						if (mInitTargetAudioStreamCloseCallback && typeof mInitTargetAudioStreamCloseCallback === "function") {
							mInitTargetAudioStreamCloseCallback(
								targetUserId,
								myPeerId,
								targetPeerId,
								connectionId
							);
						}

						if (SAVE_CONNECTION_LOG_TO_DATABASE) {
							mediaConnectionClose2Log(
								mConnectionInfoId,
								3,
								connectionId,
								targetPeerId,
								myPeerId,
								null,
								null,
								null
							);
						}
					} else if (mediaConnection.metadata.media_type === 'screen') {
						if (mInitTargetScreenStreamCloseCallback && typeof mInitTargetScreenStreamCloseCallback === "function") {
							mInitTargetScreenStreamCloseCallback(
								targetUserId,
								myPeerId,
								targetPeerId,
								connectionId
							);
						}

						if (SAVE_CONNECTION_LOG_TO_DATABASE) {
							mediaConnectionClose2Log(
								mConnectionInfoId,
								4,
								connectionId,
								targetPeerId,
								myPeerId,
								null,
								null,
								null
							);
						}
					} else {
						var findTarget = false;

						if (!findTarget) {
							for (var j = 0; j < mUserIdAndVideoStreamConnectionIdArray.length; ++j) {
								var connectionIdArray = mUserIdAndVideoStreamConnectionIdArray[j];

								for (var i = 0; i < connectionIdArray.length; ++i) {
									if (connectionId === connectionIdArray[i]) {
										connectionIdArray.splice(i, 1);
										findTarget = true;

										if (mInitTargetVideoStreamCloseCallback && typeof mInitTargetVideoStreamCloseCallback === "function") {
											mInitTargetVideoStreamCloseCallback(
												j,
												myPeerId,
												targetPeerId,
												connectionId
											);
										}

										if (SAVE_CONNECTION_LOG_TO_DATABASE) {
											mediaConnectionClose2Log(
												mConnectionInfoId,
												2,
												connectionId,
												targetPeerId,
												myPeerId,
												null,
												null,
												null
											);
										}

										break;
									}
								}

								if (findTarget) {
									break;
								}
							}
						}

						if (!findTarget) {
							for (var j = 0; j < mUserIdAndAudioStreamConnectionIdArray.length; ++j) {
								var connectionIdArray = mUserIdAndAudioStreamConnectionIdArray[j];

								for (var i = 0; i < connectionIdArray.length; ++i) {
									if (connectionId === connectionIdArray[i]) {
										connectionIdArray.splice(i, 1);
										findTarget = true;

										if (mInitTargetAudioStreamCloseCallback && typeof mInitTargetAudioStreamCloseCallback === "function") {
											mInitTargetAudioStreamCloseCallback(
												j,
												myPeerId,
												targetPeerId,
												connectionId
											);
										}

										if (SAVE_CONNECTION_LOG_TO_DATABASE) {
											mediaConnectionClose2Log(
												mConnectionInfoId,
												3,
												connectionId,
												targetPeerId,
												myPeerId,
												null,
												null,
												null
											);
										}

										break;
									}
								}

								if (findTarget) {
									break;
								}
							}
						}

						if (!findTarget) {
							for (var j = 0; j < mUserIdAndScreenStreamConnectionIdArray.length; ++j) {
								var connectionIdArray = mUserIdAndScreenStreamConnectionIdArray[j];

								for (var i = 0; i < connectionIdArray.length; ++i) {
									if (connectionId === connectionIdArray[i]) {
										connectionIdArray.splice(i, 1);
										findTarget = true;

										if (mInitTargetScreenStreamCloseCallback && typeof mInitTargetScreenStreamCloseCallback === "function") {
											mInitTargetScreenStreamCloseCallback(
												j,
												myPeerId,
												targetPeerId,
												connectionId
											);
										}

										if (SAVE_CONNECTION_LOG_TO_DATABASE) {
											mediaConnectionClose2Log(
												mConnectionInfoId,
												4,
												connectionId,
												targetPeerId,
												myPeerId,
												null,
												null,
												null
											);
										}

										break;
									}
								}

								if (findTarget) {
									break;
								}
							}
						}


						if (!findTarget) {
							mConnectionIdAndMediaConnection[connectionId] = mediaConnection;
						}
					}
				}
			};
			var mediaConnectionErrorCallbackWork = function(mediaConnection, err, myPeerId, targetPeerId, connectionId) {
				if (errorCallback && typeof errorCallback === "function") {
					errorCallback(err);
				}
			};

			// 接続管理の初期化
			return mMeetinConnection.init(
				exist_peer_id,
				peerOpenCallbackWork,
				peerConnectionCallbackWork,
				peerCallCallbackWork,
				peerCloseCallbackWork,
				peerDisconnectedCallbackWork,
				peerErrorCallbackWork,
				null, // dataConnectionDataCallbackWork,
				null, // dataConnectionOpenCallbackWork,
				null, // dataConnectionCloseCallbackWork,
				null, // dataConnectionErrorCallbackWork,
				mediaConnectionStreamCallbackWork,
				mediaConnectionCloseCallbackWork,
				mediaConnectionErrorCallbackWork
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
				console.log('[MeetinCore][initDatabase][start]');
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
				}
				// else if("7" == data.result) {
				// 	// 接続情報が他人に奪われた
				// 	if (errorCallback && typeof errorCallback === "function") {
				// 		var err = new Error('接続情報更新エラー');
				// 		err.type = 'peerid-update';
				// 		errorCallback(err);
				// 	}
				// }
				else {
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

		// Meetin管理の破棄
		// isCloseConnectionInfo：データベースに保存した接続情報を更新するか？
		var destroy = function(
				isCloseConnectionInfo
			) {
			if (SHOW_LOG) {
				console.log('[MeetinCore][destroy][start]');
			}

			if (mTryReconncetTimer !== false) {
				clearTimeout(mTryReconncetTimer);
				mTryReconncetTimer = false;
			}

			if (mMediaConnectionCallTryCheckTimer) {
				clearInterval(mMediaConnectionCallTryCheckTimer);
				mMediaConnectionCallTryCheckTimer = null;
			}

			if (mCheckStreamTimer) {
				clearInterval(mCheckStreamTimer);
				mCheckStreamTimer = null;
			}

			if (mSendStreamInfoDetailTimer) {
				clearInterval(mSendStreamInfoDetailTimer);
				mSendStreamInfoDetailTimer = null;
			}

			if (mCheckEnterRoomStateTimer) {
				clearInterval(mCheckEnterRoomStateTimer);
				mCheckEnterRoomStateTimer = null;
			}

			if (mSendPingTimeout) {
				clearTimeout(mSendPingTimeout);
				mSendPingTimeout = null;
			}

			if (mPingTimeout) {
				clearTimeout(mPingTimeout);
				mPingTimeout = null;
			}

			sendRequestChangeAllMediaConnectionState(
				null,
				false
			);

			mReady = false;

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

			destroyScreenStream();

			// 接続管理の破棄
			mMeetinConnection.destroy(
				isCloseConnectionInfo,
				mConnectionInfoId
			);
			mMeetinWebSocket.destroy();

			mUserIdAndPeerDataIdTable = {};
			mUserIdAndPeerDataIdTable_WebRTC = {};
			mUserIdAndPeerDataIdTable_Flash = {};
			mUserIdAndReceiveVideoStreamConnectionTable = {};
			mUserIdAndReceiveAudioStreamConnectionTable = {};
			mUserIdAndReceiveScreenStreamConnectionTable = {};

			mMediaConnectionCallTryTable = {};

			mOldPeerDataIdAndVideoSendBandwidthOptionsTableString = null;
			mOldPeerDataIdAndAudioSendBandwidthOptionsTableString = null;
			mOldPeerDataIdAndScreenSendBandwidthOptionsTableString = null;
			mOldPeerDataIdAndVideoReceiveBandwidthOptionsTableString = null;
			mOldPeerDataIdAndAudioReceiveBandwidthOptionsTableString = null;
			mOldPeerDataIdAndScreenReceiveBandwidthOptionsTableString = null;

			mConnectionIdAndMediaConnection = {};
			mUserIdAndVideoStreamConnectionIdArray = [new Array(), new Array(), new Array(), new Array(), new Array(), new Array(),];
			mUserIdAndAudioStreamConnectionIdArray = [new Array(), new Array(), new Array(), new Array(), new Array(), new Array(),];
			mUserIdAndScreenStreamConnectionIdArray = [new Array(), new Array(), new Array(), new Array(), new Array(), new Array(),];
		};

		// Meetin管理の破棄
		// isCloseConnectionInfo：データベースに保存した接続情報を更新するか？
		MeetinCore.prototype.destroy = function(
				isCloseConnectionInfo
			) {
			destroy(
				isCloseConnectionInfo
			);
		};

		//////////////////////////////////////////////////////////
		// 接続処理
		// ・すべての相手に接続する
		// ・特定な相手に接続する
		// ・再接続
		//////////////////////////////////////////////////////////

		// 再接続
		var reconnect = function(
			) {
			if (mReconncetTimer !== false) {
				clearTimeout(mReconncetTimer);
				mReconncetTimer = false;
			}

			if (SHOW_LOG) {
				console.log('[MeetinCore][reconnect][start]');
			}

			if (mMediaConnectionCallTryCheckTimer) {
				clearInterval(mMediaConnectionCallTryCheckTimer);
				mMediaConnectionCallTryCheckTimer = null;
			}

			if (mCheckStreamTimer) {
				clearInterval(mCheckStreamTimer);
				mCheckStreamTimer = null;
			}

			if (mSendStreamInfoDetailTimer) {
				clearInterval(mSendStreamInfoDetailTimer);
				mSendStreamInfoDetailTimer = null;
			}

			if (mCheckEnterRoomStateTimer) {
				clearInterval(mCheckEnterRoomStateTimer);
				mCheckEnterRoomStateTimer = null;
			}

			if (mSendPingTimeout) {
				clearTimeout(mSendPingTimeout);
				mSendPingTimeout = null;
			}

			if (mPingTimeout) {
				clearTimeout(mPingTimeout);
				mPingTimeout = null;
			}

			// 接続管理を破棄（メディアストリームはそのままで破棄しない）
			mMeetinConnection.destroy(
				false,
				mConnectionInfoId
			);

			mMeetinWebSocket.destroy();

			mUserIdAndPeerDataIdTable = {};
			mUserIdAndPeerDataIdTable_WebRTC = {};
			mUserIdAndPeerDataIdTable_Flash = {};
			mUserIdAndReceiveVideoStreamConnectionTable = {};
			mUserIdAndReceiveAudioStreamConnectionTable = {};
			mUserIdAndReceiveScreenStreamConnectionTable = {};

			mOldPeerDataIdAndVideoSendBandwidthOptionsTableString = null;
			mOldPeerDataIdAndAudioSendBandwidthOptionsTableString = null;
			mOldPeerDataIdAndScreenSendBandwidthOptionsTableString = null;
			mOldPeerDataIdAndVideoReceiveBandwidthOptionsTableString = null;
			mOldPeerDataIdAndAudioReceiveBandwidthOptionsTableString = null;
			mOldPeerDataIdAndScreenReceiveBandwidthOptionsTableString = null;


			// 接続管理を初期化（メディアストリームはそのままで初期化しない）
			init(
				null,
				mConstraints,
				false,
				mInitInitCompleteCallback,
				mInitDataConnectionOpenCallback,
				mInitDataConnectionCloseCallback,
				mInitCoreCommandCallback,
				mInitCommonCommandCallback,
				mInitErrorCallback,
				mInitReceiveTargetVideoStreamCallback,
				mInitTargetVideoStreamCloseCallback,
				mInitTargetVideoStreamErrorCallback,
				mInitReceiveTargetAudioStreamCallback,
				mInitTargetAudioStreamCloseCallback,
				mInitTargetAudioStreamErrorCallback,
				mInitReceiveTargetScreenStreamCallback,
				mInitTargetScreenStreamCloseCallback,
				mInitTargetScreenStreamErrorCallback
			);
		};

		// 再接続
		MeetinCore.prototype.reconnect = function(
			) {
			reconnect();
		};

		var tryReconnect = function() {
			if (mTryReconncetTimer !== false) {
				clearTimeout(mTryReconncetTimer);
				mTryReconncetTimer = false;
			}

			if (mMediaConnectionCallTryCheckTimer) {
				clearInterval(mMediaConnectionCallTryCheckTimer);
				mMediaConnectionCallTryCheckTimer = null;
			}

			if (mCheckStreamTimer) {
				clearInterval(mCheckStreamTimer);
				mCheckStreamTimer = null;
			}

			if (mSendStreamInfoDetailTimer) {
				clearInterval(mSendStreamInfoDetailTimer);
				mSendStreamInfoDetailTimer = null;
			}

			if (mCheckEnterRoomStateTimer) {
				clearInterval(mCheckEnterRoomStateTimer);
				mCheckEnterRoomStateTimer = null;
			}

			if (mSendPingTimeout) {
				clearTimeout(mSendPingTimeout);
				mSendPingTimeout = null;
			}

			if (mPingTimeout) {
				clearTimeout(mPingTimeout);
				mPingTimeout = null;
			}

			// 接続管理を破棄（メディアストリームはそのままで破棄しない）
			mMeetinConnection.destroy(
				false,
				mConnectionInfoId
			);

			mMeetinWebSocket.destroy();

			mTryReconncetTimer = setTimeout(function() {
				// 再接続
				var timer = null;
				var run = function() {
					if (window.navigator.onLine) {
						if (mReady) {
							if (timer) {
								clearInterval(timer);
							}

							if (SHOW_LOG) {
								console.log('[MeetinCore][tryReconnect][start]');
							}

							// 接続管理を初期化（メディアストリームはそのままで初期化しない）
							init(
								null,
								mConstraints,
								false,
								mInitInitCompleteCallback,
								mInitDataConnectionOpenCallback,
								mInitDataConnectionCloseCallback,
								mInitCoreCommandCallback,
								mInitCommonCommandCallback,
								mInitErrorCallback,
								mInitReceiveTargetVideoStreamCallback,
								mInitTargetVideoStreamCloseCallback,
								mInitTargetVideoStreamErrorCallback,
								mInitReceiveTargetAudioStreamCallback,
								mInitTargetAudioStreamCloseCallback,
								mInitTargetAudioStreamErrorCallback,
								mInitReceiveTargetScreenStreamCallback,
								mInitTargetScreenStreamCloseCallback,
								mInitTargetScreenStreamErrorCallback
							)
						}
					}
				}
				timer = setInterval(run, MEETIN_MAIN_TRY_RECONNECT_WAIT);
			}, MEETIN_MAIN_TRY_RECONNECT_TIMEOUT);
		};

		// MediaConnectionが規定時間内に返答されたかをチェックする処理
		var mediaConnectionCallTryCheckProc = function() {
			if (SHOW_LOG) {
				console.log('[MeetinCore][mediaConnectionCallTryCheckProc][start]');
			}

			if (!mReady) {
				if (mMediaConnectionCallTryCheckTimer) {
					clearInterval(mMediaConnectionCallTryCheckTimer);
					mMediaConnectionCallTryCheckTimer = null;
				}
				return;
			}

			var deleteArray = new Array();

			var nowTimestamp = Math.floor(Date.now());
			for (var key in mMediaConnectionCallTryTable) {
				if (nowTimestamp - mMediaConnectionCallTryTable[key] >= MEETIN_MAIN_MEDIA_CONNECTION_CALL_TRY_CHECK_DIFF) {
					if (SHOW_LOG) {
						console.log('[MeetinCore][mediaConnectionCallTryCheckProc][close]:connection_id = ' + key);
					}
					mMeetinConnection.closeConnectionByConnectionId(key);

					deleteArray.push(key);
				}
			}

			for (var i = 0; i < deleteArray.length; ++i) {
				delete mMediaConnectionCallTryTable[deleteArray[i]];
			}
		};

		// ストリームの有効性を確認
		var checkStreamProc = function() {
			if (SHOW_LOG) {
				console.log('[MeetinCore][checkStreamProc][start]');
			}

			if (!mReady) {
				if (mCheckStreamTimer) {
					clearInterval(mCheckStreamTimer);
					mCheckStreamTimer = null;
				}
				return;
			}

			for (var key in mUserIdAndReceiveVideoStreamConnectionTable) {
				var connection = mUserIdAndReceiveVideoStreamConnectionTable[key];
				if (connection && connection.open) {
				} else {
					sendRequestVideoStream(key, connection.peer, null);
				}
			}

			for (var key in mUserIdAndReceiveAudioStreamConnectionTable) {
				var connection = mUserIdAndReceiveAudioStreamConnectionTable[key];
				if (connection && connection.open) {
				} else {
					sendRequestAudioStream(key, connection.peer, null);
				}
			}

			for (var key in mUserIdAndReceiveScreenStreamConnectionTable) {
				var connection = mUserIdAndReceiveScreenStreamConnectionTable[key];
				if (connection && connection.open) {
				} else {
					sendRequestScreenStream(key, connection.peer, null);
				}
			}
		};

		var sendInitData = function(connection_info) {
			if (SHOW_LOG) {
				console.log('[MeetinCore][sendInitData][start]:connection_info = ' + JSON.stringify(connection_info));
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

					if (MEETIN_WEBRTC_PEER_ID_LENGTH == targetPeerId.length) {
						mUserIdAndPeerDataIdTable_WebRTC[i] = targetPeerId;
					} else {
						mUserIdAndPeerDataIdTable_Flash[i] = targetPeerId;
					}

					mUserIdAndPeerDataIdTable[i] = targetPeerId;

					if (16 == targetPeerId.length) {
						targetPeerId = "S" + targetPeerId;
					}

					// チャットルームに入室したことををすべての接続先に伝える
					sendEnterRoom(targetPeerId);

					sendRequestEnterRoom(targetPeerId);
				}
			}
		};

		//////////////////////////////////////////////////////////
		// メディアストリーム（映像）関連
		//////////////////////////////////////////////////////////

		// メディアストリーム（映像）を作って送る
		var createAndSendVideoStream = function(
				target_peer_id,
				constraints,
				options,
				successCallback,
				errorCallback,
				completeCallback,
				mediaConnectionStreamCallback,
				mediaConnectionCloseCallback,
				mediaConnectionErrorCallback
			) {
			if (SHOW_LOG) {
				console.log('[MeetinCore][createAndSendVideoStream][start]:target_peer_id = ' + target_peer_id + ', constraints = ' + JSON.stringify(constraints) + ', options = ' + JSON.stringify(options));
			}

			var completeCallbackWork = function(stream, err) {
				if (stream) {
					var mediaConnection = sendVideoStream(
						target_peer_id,
						stream,
						options,
						errorCallback,
						mediaConnectionStreamCallback,
						mediaConnectionCloseCallback,
						mediaConnectionErrorCallback
					);

					if (mediaConnection) {
						sendCameraIsOn(
							target_peer_id,
							stream.id,
							mediaConnection.id,
							mediaConnection.metadata.media_type
						);
					}
				}

				if (completeCallback && typeof completeCallback === "function") {
					completeCallback(stream, err);
				}
			};

			mMeetinMedia.createVideoStreamIfNotExist(
				constraints,
				successCallback,
				errorCallback,
				completeCallbackWork
			);
		};

		// メディアストリーム（映像）を作って送る
		MeetinCore.prototype.createAndSendVideoStream = function(
				target_peer_id,
				constraints,
				options,
				successCallback,
				errorCallback,
				completeCallback,
				mediaConnectionStreamCallback,
				mediaConnectionCloseCallback,
				mediaConnectionErrorCallback
			) {
			createAndSendVideoStream(
				target_peer_id,
				constraints,
				options,
				successCallback,
				errorCallback,
				completeCallback,
				mediaConnectionStreamCallback,
				mediaConnectionCloseCallback,
				mediaConnectionErrorCallback
			);
		};

		var replaceAndSendVideoStreamToAllTarget = function(
				target_peer_id,
				constraints,
				stream,
				successCallback,
				errorCallback,
				completeCallback,
				mediaConnectionStreamCallback,
				mediaConnectionCloseCallback,
				mediaConnectionErrorCallback
			) {
				if (stream) {
					mIsChromakey = true;
					mChromakeyStream = stream;
				} else {
					mIsChromakey = false;
					mChromakeyStream = null;
					stream = mMeetinMedia.getVideoStream();
				}
if(stream) {
 console.log(`replaceAndSendVideoStreamToAllTarget: ${stream.id}`);
}
				for (var key in mUserIdAndPeerDataIdTable_WebRTC) {
					var targetPeerId = mUserIdAndPeerDataIdTable_WebRTC[key];
					var mediaConnection = sendVideoStreamForce(
						targetPeerId,
						stream,
						mPeerDataIdAndVideoSendBandwidthOptionsTable[targetPeerId],
						errorCallback,
						mediaConnectionStreamCallback,
						mediaConnectionCloseCallback,
						mediaConnectionErrorCallback
					);
					if (mediaConnection) {
						sendCameraIsOn(
							targetPeerId,
							stream.id,
							mediaConnection.id,
							mediaConnection.metadata.media_type
						);
					}
				}
		};

		MeetinCore.prototype.replaceAndSendVideoStreamToAllTarget = function(
				target_peer_id,
				constraints,
				stream,
				successCallback,
				errorCallback,
				completeCallback,
				mediaConnectionStreamCallback,
				mediaConnectionCloseCallback,
				mediaConnectionErrorCallback
			) {
			replaceAndSendVideoStreamToAllTarget(
				target_peer_id,
				constraints,
				stream,
				successCallback,
				errorCallback,
				completeCallback,
				mediaConnectionStreamCallback,
				mediaConnectionCloseCallback,
				mediaConnectionErrorCallback
			);
		};


		// メディアストリーム（映像）を作って送る
		var createAndSendVideoStreamToAllTarget = function(
				target_peer_id,
				constraints,
				successCallback,
				errorCallback,
				completeCallback,
				mediaConnectionStreamCallback,
				mediaConnectionCloseCallback,
				mediaConnectionErrorCallback
			) {
			if (SHOW_LOG) {
				console.log('[MeetinCore][createAndSendVideoStreamToAllTarget][start]:target_peer_id = ' + target_peer_id + ', constraints = ' + JSON.stringify(constraints));
			}

			var completeCallbackWork = function(stream, err) {
				if (stream) {
					for (var key in mUserIdAndPeerDataIdTable_WebRTC) {
						var targetPeerId = mUserIdAndPeerDataIdTable_WebRTC[key];
						var mediaConnection = sendVideoStream(
							targetPeerId,
							stream,
							mPeerDataIdAndVideoSendBandwidthOptionsTable[targetPeerId],
							errorCallback,
							mediaConnectionStreamCallback,
							mediaConnectionCloseCallback,
							mediaConnectionErrorCallback
						);

						if (mediaConnection) {
							sendCameraIsOn(
								targetPeerId,
								stream.id,
								mediaConnection.id,
								mediaConnection.metadata.media_type
							);
						}
					}
				}

				if (completeCallback && typeof completeCallback === "function") {
					completeCallback(stream, err);
				}
			};

			mMeetinMedia.createVideoStreamIfNotExist(
				constraints,
				successCallback,
				errorCallback,
				completeCallbackWork
			);
		};

		// メディアストリーム（映像）を作って送る
		MeetinCore.prototype.createAndSendVideoStreamToAllTarget = function(
				target_peer_id,
				constraints,
				successCallback,
				errorCallback,
				completeCallback,
				mediaConnectionStreamCallback,
				mediaConnectionCloseCallback,
				mediaConnectionErrorCallback
			) {
			createAndSendVideoStreamToAllTarget(
				target_peer_id,
				constraints,
				successCallback,
				errorCallback,
				completeCallback,
				mediaConnectionStreamCallback,
				mediaConnectionCloseCallback,
				mediaConnectionErrorCallback
			);
		};


		// メディアストリーム（映像）を送る
		var sendVideoStreamForce = function(
				target_peer_id,
				stream,
				options,
				errorCallback,
				mediaConnectionStreamCallback,
				mediaConnectionCloseCallback,
				mediaConnectionErrorCallback
			) {
			if (SHOW_LOG) {
				var streamId = null;
				if (stream) {
					streamId = stream.id;
				}
				console.log('[MeetinCore][sendVideoStream][start]:target_peer_id = ' + target_peer_id + ', stream.id = ' + streamId + ', options = ' + JSON.stringify(options));
			}

			if (!mMeetinConnection.isPeerDataValid()) {
				if (errorCallback && typeof errorCallback === "function") {
					var err = new Error('接続先のピアが有効ではない。');
					err.type = 'peer-not-valid';
					errorCallback(err);
				}
			}

			var errorCallbackWork = function(err) {
				if (errorCallback && typeof errorCallback === "function") {
					errorCallback();
				}
			};

			var mediaConnectionStreamCallbackWork = function(mediaConnection, stream, myPeerId, targetPeerId, connectionId) {
				if (SAVE_CONNECTION_LOG_TO_DATABASE) {
					mediaConnectionStream1Log(
						mConnectionInfoId,
						2,
						connectionId,
						myPeerId,
						targetPeerId,
						null,
						null,
						null
					);
				}
			};

			var mediaConnectionCloseCallbackWork = function(mediaConnection, myPeerId, targetPeerId, connectionId) {
				if (SAVE_CONNECTION_LOG_TO_DATABASE) {
					mediaConnectionClose1Log(
						mConnectionInfoId,
						2,
						connectionId,
						myPeerId,
						targetPeerId,
						null,
						null,
						null
					);
				}

				if (SHOW_LOG) {
					console.log('[MeetinCore][sendVideoStream][mediaConnectionCloseCallbackWork][runRequestVideoStream]:targetPeerId = ' + targetPeerId);
				}
			};

			var mediaConnectionErrorCallbackWork = function(mediaConnection, err, myPeerId, targetPeerId, connectionId) {
			};

			if (!options) {
				options = {};
			}
			if (!mLimitSendBandwidth) {
				delete options.video_bandwidth;
				delete options.audio_bandwidth;
			} else if (!MEETIN_MAIN_AUTO_CHANGE_SEND_BANDWIDTH) {
				options.video_bandwidth = DEFAULT_MEETIN_MAIN_VIDEO_SEND_BANDWIDTH[mDefaultSendBandwidthLevel];
			}

			options.extra1 = mUserId;
			options.extra2 = true;
			options.videoBandwidth = 200;	// 最大帯域幅(kbps)
			options.media_type = 'camera';
			options.metadata = {
				extra1: mUserId,
				extra2: true,
				media_type: 'camera',
			};

			if (MEETIN_WEBSOCKET_PEER_ID_LENGTH == target_peer_id.length) {
				target_peer_id = target_peer_id.substr(1, MEETIN_WEBRTC_PEER_ID_LENGTH);
			}

			var mediaConnection = mMeetinConnection.connectMediaConnectionForce(
				target_peer_id,
				stream,
				options,
				errorCallbackWork,
				mediaConnectionStreamCallbackWork,
				mediaConnectionCloseCallbackWork,
				mediaConnectionErrorCallbackWork
			);

			if (mediaConnection) {
				mMediaConnectionCallTryTable[mediaConnection.id] = Math.floor(Date.now());

				if (SAVE_CONNECTION_LOG_TO_DATABASE) {
					mediaConnectionCallLog(
						mConnectionInfoId,
						mConnectNo,
						2,
						mediaConnection.id,
						mMeetinConnection.getPeerDataId(),
						target_peer_id,
						mUserId,
						null,
						null,
						null
					);
				}
			}

			return mediaConnection;
		};

		// メディアストリーム（映像）を送る
		MeetinCore.prototype.sendVideoStreamForce = function(
				target_peer_id,
				stream,
				options,
				errorCallback,
				mediaConnectionStreamCallback,
				mediaConnectionCloseCallback,
				mediaConnectionErrorCallback
			) {
			return sendVideoStreamForce(
				target_peer_id,
				stream,
				options,
				errorCallback,
				mediaConnectionStreamCallback,
				mediaConnectionCloseCallback,
				mediaConnectionErrorCallback
			);
		};


		// メディアストリーム（映像）を送る
		var sendVideoStream = function(
				target_peer_id,
				stream,
				options,
				errorCallback,
				mediaConnectionStreamCallback,
				mediaConnectionCloseCallback,
				mediaConnectionErrorCallback
			) {
			if (SHOW_LOG) {
				var streamId = null;
				if (stream) {
					streamId = stream.id;
				}
				console.log('[MeetinCore][sendVideoStream][start]:target_peer_id = ' + target_peer_id + ', stream.id = ' + streamId + ', options = ' + JSON.stringify(options));
			}

			if (!mMeetinConnection.isPeerDataValid()) {
				if (errorCallback && typeof errorCallback === "function") {
					var err = new Error('接続先のピアが有効ではない。');
					err.type = 'peer-not-valid';
					errorCallback(err);
				}
			}

			var errorCallbackWork = function(err) {
				if (errorCallback && typeof errorCallback === "function") {
					errorCallback();
				}
			};

			var mediaConnectionStreamCallbackWork = function(mediaConnection, stream, myPeerId, targetPeerId, connectionId) {
				if (SAVE_CONNECTION_LOG_TO_DATABASE) {
					mediaConnectionStream1Log(
						mConnectionInfoId,
						2,
						connectionId,
						myPeerId,
						targetPeerId,
						null,
						null,
						null
					);
				}
			};

			var mediaConnectionCloseCallbackWork = function(mediaConnection, myPeerId, targetPeerId, connectionId) {
				if (SAVE_CONNECTION_LOG_TO_DATABASE) {
					mediaConnectionClose1Log(
						mConnectionInfoId,
						2,
						connectionId,
						myPeerId,
						targetPeerId,
						null,
						null,
						null
					);
				}

				if (SHOW_LOG) {
					console.log('[MeetinCore][sendVideoStream][mediaConnectionCloseCallbackWork][runRequestVideoStream]:targetPeerId = ' + targetPeerId);
				}
			};

			var mediaConnectionErrorCallbackWork = function(mediaConnection, err, myPeerId, targetPeerId, connectionId) {
			};

			if (!options) {
				options = {};
			}
			if (!mLimitSendBandwidth) {
				delete options.video_bandwidth;
				delete options.audio_bandwidth;
			} else if (!MEETIN_MAIN_AUTO_CHANGE_SEND_BANDWIDTH) {
				options.video_bandwidth = DEFAULT_MEETIN_MAIN_VIDEO_SEND_BANDWIDTH[mDefaultSendBandwidthLevel];
			}

			options.extra1 = mUserId;
			options.extra2 = true;
			options.videoBandwidth = 200;	// 最大帯域幅(kbps)
			options.media_type = 'camera';
			options.metadata = {
				extra1: mUserId,
				extra2: true,
				media_type: 'camera',
			};

			if (MEETIN_WEBSOCKET_PEER_ID_LENGTH == target_peer_id.length) {
				target_peer_id = target_peer_id.substr(1, MEETIN_WEBRTC_PEER_ID_LENGTH);
			}

			var mediaConnection = mMeetinConnection.connectMediaConnection(
				target_peer_id,
				stream,
				options,
				errorCallbackWork,
				mediaConnectionStreamCallbackWork,
				mediaConnectionCloseCallbackWork,
				mediaConnectionErrorCallbackWork
			);

			if (mediaConnection) {
				mMediaConnectionCallTryTable[mediaConnection.id] = Math.floor(Date.now());

				if (SAVE_CONNECTION_LOG_TO_DATABASE) {
					mediaConnectionCallLog(
						mConnectionInfoId,
						mConnectNo,
						2,
						mediaConnection.id,
						mMeetinConnection.getPeerDataId(),
						target_peer_id,
						mUserId,
						null,
						null,
						null
					);
				}
			}

			return mediaConnection;
		};

		// メディアストリーム（映像）を送る
		MeetinCore.prototype.sendVideoStream = function(
				target_peer_id,
				stream,
				options,
				errorCallback,
				mediaConnectionStreamCallback,
				mediaConnectionCloseCallback,
				mediaConnectionErrorCallback
			) {
			return sendVideoStream(
				target_peer_id,
				stream,
				options,
				errorCallback,
				mediaConnectionStreamCallback,
				mediaConnectionCloseCallback,
				mediaConnectionErrorCallback
			);
		};

		// メディアストリーム（映像）の破棄
		var destroyVideoStream = function(
			) {
			if (SHOW_LOG) {
				console.log('[MeetinCore][destroyVideoStream][start]');
			}

			var streamId = null;
			var stream = mMeetinMedia.getVideoStream();
			if (stream) {
				streamId = stream.id;
				sendCameraIsOff(streamId);
				mMeetinMedia.destroyVideoStream();
				closeMediaConnectionByStreamId(streamId);
			}
		};

		// メディアストリーム（映像）の破棄
		MeetinCore.prototype.destroyVideoStream = function(
			) {
			destroyVideoStream();
		};

		//////////////////////////////////////////////////////////
		// メディアストリーム（マイク）関連
		//////////////////////////////////////////////////////////

		// メディアストリーム（音声）を作って送る
		var createAndSendAudioStream = function(
				target_peer_id,
				options,
				successCallback,
				errorCallback,
				completeCallback,
				mediaConnectionStreamCallback,
				mediaConnectionCloseCallback,
				mediaConnectionErrorCallback
			) {
			if (SHOW_LOG) {
				console.log('[MeetinCore][createAndSendAudioStream][start]:target_peer_id = ' + target_peer_id + ', options = ' + JSON.stringify(options));
			}

			var completeCallbackWork = function(stream, err) {
				if (stream) {
					var mediaConnection = sendAudioStream(
						target_peer_id,
						stream,
						options,
						errorCallback,
						mediaConnectionStreamCallback,
						mediaConnectionCloseCallback,
						mediaConnectionErrorCallback
					);

					if (mediaConnection) {
						sendMicIsOn(
							target_peer_id,
							stream.id,
							mediaConnection.id,
							mediaConnection.metadata.media_type
						);
					}
				}

				if (completeCallback && typeof completeCallback === "function") {
					completeCallback(stream, err);
				}
			};

			mMeetinMedia.createAudioStreamIfNotExist(
				successCallback,
				errorCallback,
				completeCallbackWork
			);
		};

		// メディアストリーム（音声）を作って送る
		MeetinCore.prototype.createAndSendAudioStream = function(
				target_peer_id,
				options,
				successCallback,
				errorCallback,
				completeCallback,
				mediaConnectionStreamCallback,
				mediaConnectionCloseCallback,
				mediaConnectionErrorCallback
			) {
			createAndSendAudioStream(
				target_peer_id,
				options,
				successCallback,
				errorCallback,
				completeCallback,
				mediaConnectionStreamCallback,
				mediaConnectionCloseCallback,
				mediaConnectionErrorCallback
			);
		};

		// メディアストリーム（音声）を作って送る
		var createAndSendAudioStreamToAllTarget = function(
				target_peer_id,
				successCallback,
				errorCallback,
				completeCallback,
				mediaConnectionStreamCallback,
				mediaConnectionCloseCallback,
				mediaConnectionErrorCallback
			) {
			if (SHOW_LOG) {
				console.log('[MeetinCore][createAndSendAudioStreamToAllTarget][start]:target_peer_id = ' + target_peer_id);
			}

			var completeCallbackWork = function(stream, err) {
				if (stream) {
					for (var key in mUserIdAndPeerDataIdTable_WebRTC) {
						var targetPeerId = mUserIdAndPeerDataIdTable_WebRTC[key];
						var mediaConnection = sendAudioStream(
							targetPeerId,
							stream,
							mPeerDataIdAndAudioSendBandwidthOptionsTable[targetPeerId],
							errorCallback,
							mediaConnectionStreamCallback,
							mediaConnectionCloseCallback,
							mediaConnectionErrorCallback
						);

						if (mediaConnection) {
							sendMicIsOn(
								targetPeerId,
								stream.id,
								mediaConnection.id,
								mediaConnection.metadata.media_type
							);
						}
					}
				}

				if (completeCallback && typeof completeCallback === "function") {
					completeCallback(stream, err);
				}
			};

			mMeetinMedia.createAudioStreamIfNotExist(
				successCallback,
				errorCallback,
				completeCallbackWork
			);
		};

		// メディアストリーム（音声）を作って送る
		MeetinCore.prototype.createAndSendAudioStreamToAllTarget = function(
				target_peer_id,
				successCallback,
				errorCallback,
				completeCallback,
				mediaConnectionStreamCallback,
				mediaConnectionCloseCallback,
				mediaConnectionErrorCallback
			) {
			createAndSendAudioStreamToAllTarget(
				target_peer_id,
				successCallback,
				errorCallback,
				completeCallback,
				mediaConnectionStreamCallback,
				mediaConnectionCloseCallback,
				mediaConnectionErrorCallback
			);
		};

		// メディアストリーム（音声）を送る
		var sendAudioStream = function(
				target_peer_id,
				stream,
				options,
				errorCallback,
				mediaConnectionStreamCallback,
				mediaConnectionCloseCallback,
				mediaConnectionErrorCallback
			) {
			if (SHOW_LOG) {
				var streamId = null;
				if (stream) {
					streamId = stream.id;
				}
				console.log('[MeetinCore][sendAudioStream][start]:target_peer_id = ' + target_peer_id + ', stream.id = ' + streamId + ', options = ' + JSON.stringify(options));
			}

			if (!mMeetinConnection.isPeerDataValid()) {
				if (errorCallback && typeof errorCallback === "function") {
					var err = new Error('接続先のピアが有効ではない。');
					err.type = 'peer-not-valid';
					errorCallback(err);
				}
			}

			var errorCallbackWork = function(err) {
				if (errorCallback && typeof errorCallback === "function") {
					errorCallback();
				}
			};

			var mediaConnectionStreamCallbackWork = function(mediaConnection, stream, myPeerId, targetPeerId, connectionId) {
				if (SAVE_CONNECTION_LOG_TO_DATABASE) {
					mediaConnectionStream1Log(
						mConnectionInfoId,
						3,
						connectionId,
						myPeerId,
						targetPeerId,
						null,
						null,
						null
					);
				}
			};

			var mediaConnectionCloseCallbackWork = function(mediaConnection, myPeerId, targetPeerId, connectionId) {
				if (SAVE_CONNECTION_LOG_TO_DATABASE) {
					mediaConnectionClose1Log(
						mConnectionInfoId,
						3,
						connectionId,
						myPeerId,
						targetPeerId,
						null,
						null,
						null
					);
				}

				if (SHOW_LOG) {
					console.log('[MeetinCore][sendAudioStream][mediaConnectionCloseCallbackWork][runRequestAudioStream]:targetPeerId = ' + targetPeerId);
				}
			};

			var mediaConnectionErrorCallbackWork = function(mediaConnection, err, myPeerId, targetPeerId, connectionId) {
			};

			if (!options) {
				options = {};
			}
			if (!mLimitSendBandwidth) {
				delete options.video_bandwidth;
				delete options.audio_bandwidth;
			} else if (!MEETIN_MAIN_AUTO_CHANGE_SEND_BANDWIDTH) {
				options.audio_bandwidth = DEFAULT_MEETIN_MAIN_AUDIO_SEND_BANDWIDTH[mDefaultSendBandwidthLevel];
			}

			options.extra1 = mUserId;
			options.extra2 = true;
			options.media_type = 'mic';
			options.audioBandwidth = 32;	// 音声の最大帯域幅(kbps)
			options.metadata = {
				extra1: mUserId,
				extra2: true,
				media_type: 'mic',
			};

			if (MEETIN_WEBSOCKET_PEER_ID_LENGTH == target_peer_id.length) {
				target_peer_id = target_peer_id.substr(1, MEETIN_WEBRTC_PEER_ID_LENGTH);
			}

			var mediaConnection = mMeetinConnection.connectMediaConnection(
				target_peer_id,
				stream,
				options,
				errorCallbackWork,
				mediaConnectionStreamCallbackWork,
				mediaConnectionCloseCallbackWork,
				mediaConnectionErrorCallbackWork
			);

			if (mediaConnection) {
				mMediaConnectionCallTryTable[mediaConnection.id] = Math.floor(Date.now());

				if (SAVE_CONNECTION_LOG_TO_DATABASE) {
					mediaConnectionCallLog(
						mConnectionInfoId,
						mConnectNo,
						3,
						mediaConnection.id,
						mMeetinConnection.getPeerDataId(),
						target_peer_id,
						mUserId,
						null,
						null,
						null
					);
				}
			}

			return mediaConnection;
		};

		// メディアストリーム（音声）を送る
		MeetinCore.prototype.sendAudioStream = function(
				target_peer_id,
				stream,
				options,
				errorCallback,
				mediaConnectionStreamCallback,
				mediaConnectionCloseCallback,
				mediaConnectionErrorCallback
			) {
			return sendAudioStream(
				target_peer_id,
				stream,
				options,
				errorCallback,
				mediaConnectionStreamCallback,
				mediaConnectionCloseCallback,
				mediaConnectionErrorCallback
			);
		};

		// メディアストリーム（音声）の破棄
		var destroyAudioStream = function(
			) {
			if (SHOW_LOG) {
				var streamId = null;
				if (stream) {
					streamId = stream.id;
				}
				console.log('[MeetinCore][destroyAudioStream][start]');
			}

			var streamId = null;
			var stream = mMeetinMedia.getAudioStream();
			if (stream) {
				streamId = stream.id;
				sendMicIsOff(streamId);
				mMeetinMedia.destroyAudioStream();
				closeMediaConnectionByStreamId(streamId);
			}
		};

		// メディアストリーム（音声）の破棄
		MeetinCore.prototype.destroyAudioStream = function(
			) {
			destroyAudioStream();
		};

		// メディアストリーム（音声）の状態
		MeetinCore.prototype.getAudioStreamStat = function() {
			if (SHOW_LOG) {
				console.log('[MeetinCore][getAudioStreamStat]');
			}
			var streamId = null;
			// MCU mod
			let stream = getLocalStream();
			if (stream) {
				let audioTracks = stream.getAudioTracks();
				if (audioTracks.length > 0) {
					return audioTracks[0].readyState;
				}
			}
//			var stream = mMeetinMedia.getAudioStream();
//			if (stream) {
//				var	tracks = stream.getAudioTracks();
//				if( tracks.length ) {
//					return stream.getAudioTracks()[0].readyState;
//				}
//			}
			return null;
		};

		//////////////////////////////////////////////////////////
		// メディアストリーム（画面共有）関連
		//////////////////////////////////////////////////////////

		// メディアストリーム（画面共有）を作って送る
		// defaultWidth、defaultHeight、defaultFrameRateについて：
		//   拡張機能に設定された幅、高さ、フレームレートが優先的に
		//   適用される。設定されていない場合のみdefaultWidth、
		//   defaultHeight、defaultFrameRateが使われる
		var createAndSendScreenStream = function(
				target_peer_id,
				defaultWidth,
				defaultHeight,
				defaultFrameRate,
				options,
				successCallback,
				errorCallback,
				stopCallback,
				noExtensionErrorCallback,
				completeCallback,
				mediaConnectionStreamCallback,
				mediaConnectionCloseCallback,
				mediaConnectionErrorCallback
			) {
			if (SHOW_LOG) {
				console.log('[MeetinCore][createAndSendScreenStream][start]:target_peer_id = ' + target_peer_id + ', options = ' + JSON.stringify(options));
			}

			var completeCallbackWork = function(stream, err) {
				if (stream) {
					var mediaConnection = sendScreenStream(
						target_peer_id,
						stream,
						options,
						errorCallback,
						mediaConnectionStreamCallback,
						mediaConnectionCloseCallback,
						mediaConnectionErrorCallback
					);

					if (mediaConnection) {
						sendScreenIsOn(
							target_peer_id,
							stream.id,
							mediaConnection.id,
							mediaConnection.metadata.media_type
						);
					}
				}

				if (completeCallback && typeof completeCallback === "function") {
					completeCallback(stream, err);
				}
			};

			mMeetinMedia.createScreenStreamIfNotExist(
				defaultWidth,
				defaultHeight,
				defaultFrameRate,
				successCallback,
				errorCallback,
				stopCallback,
				noExtensionErrorCallback,
				completeCallbackWork
			);
		};

		// メディアストリーム（画面共有）を作って送る
		// defaultWidth、defaultHeight、defaultFrameRateについて：
		//   拡張機能に設定された幅、高さ、フレームレートが優先的に
		//   適用される。設定されていない場合のみdefaultWidth、
		//   defaultHeight、defaultFrameRateが使われる
		MeetinCore.prototype.createAndSendScreenStream = function(
				target_peer_id,
				defaultWidth,
				defaultHeight,
				defaultFrameRate,
				options,
				successCallback,
				errorCallback,
				stopCallback,
				noExtensionErrorCallback,
				completeCallback,
				mediaConnectionStreamCallback,
				mediaConnectionCloseCallback,
				mediaConnectionErrorCallback
			) {
			createAndSendScreenStream(
				target_peer_id,
				defaultWidth,
				defaultHeight,
				defaultFrameRate,
				options,
				successCallback,
				errorCallback,
				stopCallback,
				noExtensionErrorCallback,
				completeCallback,
				mediaConnectionStreamCallback,
				mediaConnectionCloseCallback,
				mediaConnectionErrorCallback
			);
		};

		// メディアストリーム（画面共有）を作って送る
		var createAndSendScreenStreamToAllTarget = function(
				target_peer_id,
				defaultWidth,
				defaultHeight,
				defaultFrameRate,
				successCallback,
				errorCallback,
				stopCallback,
				noExtensionErrorCallback,
				completeCallback,
				mediaConnectionStreamCallback,
				mediaConnectionCloseCallback,
				mediaConnectionErrorCallback
			) {
			if (SHOW_LOG) {
				console.log('[MeetinCore][createAndSendScreenStreamToAllTarget][start]:target_peer_id = ' + target_peer_id);
			}

			var completeCallbackWork = function(stream, err) {
				if (completeCallback && typeof completeCallback === "function") {
					completeCallback(stream, err);
				}

				if (stream && !err) {
					mIsSendScreenOn = true;

					for (var key in mUserIdAndPeerDataIdTable_WebRTC) {
						var targetPeerId = mUserIdAndPeerDataIdTable_WebRTC[key];
						var mediaConnection = sendScreenStream(
							targetPeerId,
							stream,
							mPeerDataIdAndScreenSendBandwidthOptionsTable[targetPeerId],
							errorCallback,
							mediaConnectionStreamCallback,
							mediaConnectionCloseCallback,
							mediaConnectionErrorCallback
						);

						if (mediaConnection) {
							sendScreenIsOn(
								targetPeerId,
								stream.id,
								mediaConnection.id,
								mediaConnection.metadata.media_type
							);
						}
					}
					for (var key in mUserIdAndPeerDataIdTable_Flash) {
						var targetPeerId = mUserIdAndPeerDataIdTable_Flash[key];
						sendScreenIsOn(
							targetPeerId,
							null,
							null,
							null
						);
					}
				}
			};

			mMeetinMedia.createScreenStreamIfNotExist(
				defaultWidth,
				defaultHeight,
				defaultFrameRate,
				successCallback,
				errorCallback,
				stopCallback,
				noExtensionErrorCallback,
				completeCallbackWork
			);
		};

		// メディアストリーム（画面共有）を作って送る
		MeetinCore.prototype.createAndSendScreenStreamToAllTarget = function(
				target_peer_id,
				defaultWidth,
				defaultHeight,
				defaultFrameRate,
				successCallback,
				errorCallback,
				stopCallback,
				noExtensionErrorCallback,
				completeCallback,
				mediaConnectionStreamCallback,
				mediaConnectionCloseCallback,
				mediaConnectionErrorCallback
			) {
			createAndSendScreenStreamToAllTarget(
				target_peer_id,
				defaultWidth,
				defaultHeight,
				defaultFrameRate,
				successCallback,
				errorCallback,
				stopCallback,
				noExtensionErrorCallback,
				completeCallback,
				mediaConnectionStreamCallback,
				mediaConnectionCloseCallback,
				mediaConnectionErrorCallback
			);
		};

		// メディアストリーム（画面共有）を送る
		var sendScreenStream = function(
				target_peer_id,
				stream,
				options,
				errorCallback,
				mediaConnectionStreamCallback,
				mediaConnectionCloseCallback,
				mediaConnectionErrorCallback
			) {
			if (SHOW_LOG) {
				var streamId = null;
				if (stream) {
					streamId = stream.id;
				}
				console.log('[MeetinCore][sendScreenStream][start]:target_peer_id = ' + target_peer_id + ', stream.id = ' + streamId + ', options = ' + JSON.stringify(options));
			}

			if (!mMeetinConnection.isPeerDataValid()) {
				if (errorCallback && typeof errorCallback === "function") {
					var err = new Error('接続先のピアが有効ではない。');
					err.type = 'peer-not-valid';
					errorCallback(err);
				}
			}

			var errorCallbackWork = function(err) {
console.log('[MeetinCore][sendScreenStream]:errorCallbackWork = ' + err + ')');
				if (errorCallback && typeof errorCallback === "function") {
					errorCallback();
				}
			};

			var mediaConnectionStreamCallbackWork = function(mediaConnection, stream, myPeerId, targetPeerId, connectionId) {
				if (SAVE_CONNECTION_LOG_TO_DATABASE) {
					mediaConnectionStream1Log(
						mConnectionInfoId,
						4,
						connectionId,
						myPeerId,
						targetPeerId,
						null,
						null,
						null
					);
				}
			};

			var mediaConnectionCloseCallbackWork = function(mediaConnection, myPeerId, targetPeerId, connectionId) {
				if (SAVE_CONNECTION_LOG_TO_DATABASE) {
					mediaConnectionClose1Log(
						mConnectionInfoId,
						4,
						connectionId,
						myPeerId,
						targetPeerId,
						null,
						null,
						null
					);
				}

				if (SHOW_LOG) {
					console.log('[MeetinCore][sendScreenStream][mediaConnectionCloseCallbackWork][runRequestScreenStream]:targetPeerId = ' + targetPeerId);
				}
			};

			var mediaConnectionErrorCallbackWork = function(mediaConnection, err, myPeerId, targetPeerId, connectionId) {
console.log('[MeetinCore][sendScreenStream]:mediaConnectionErrorCallbackWork = ' + err + ')');
			};

			if (!options) {
				options = {};
			}
			if (!mLimitSendBandwidth) {
				delete options.video_bandwidth;
				delete options.audio_bandwidth;
			} else if (!MEETIN_MAIN_AUTO_CHANGE_SEND_BANDWIDTH) {
				options.video_bandwidth = DEFAULT_MEETIN_MAIN_SCREEN_SEND_BANDWIDTH[mDefaultSendBandwidthLevel];
			}

			options.extra1 = mUserId;
			options.extra2 = true;
			options.media_type = 'screen';
			options.videoBandwidth = 200;	// 最大帯域幅(kbps)
			options.metadata = {
				extra1: mUserId,
				extra2: true,
				media_type: 'screen',
			};
console.log('[MeetinCore][sendScreenStream]:options = ' + JSON.stringify(options) + ')');

			if (MEETIN_WEBSOCKET_PEER_ID_LENGTH == target_peer_id.length) {
				target_peer_id = target_peer_id.substr(1, MEETIN_WEBRTC_PEER_ID_LENGTH);
			}

			var mediaConnection = mMeetinConnection.connectMediaConnection(
				target_peer_id,
				stream,
				options,
				errorCallbackWork,
				mediaConnectionStreamCallbackWork,
				mediaConnectionCloseCallbackWork,
				mediaConnectionErrorCallbackWork
			);

			if (mediaConnection) {
				mMediaConnectionCallTryTable[mediaConnection.id] = Math.floor(Date.now());

				if (SAVE_CONNECTION_LOG_TO_DATABASE) {
					mediaConnectionCallLog(
						mConnectionInfoId,
						mConnectNo,
						4,
						mediaConnection.id,
						mMeetinConnection.getPeerDataId(),
						target_peer_id,
						mUserId,
						null,
						null,
						null
					);
				}
			}

			return mediaConnection;
		};

		// メディアストリーム（画面共有）を送る
		MeetinCore.prototype.sendScreenStream = function(
				target_peer_id,
				stream,
				options,
				errorCallback,
				mediaConnectionStreamCallback,
				mediaConnectionCloseCallback,
				mediaConnectionErrorCallback
			) {
			return sendScreenStream(
				target_peer_id,
				stream,
				options,
				errorCallback,
				mediaConnectionStreamCallback,
				mediaConnectionCloseCallback,
				mediaConnectionErrorCallback
			);
		};

		// メディアストリーム（画面共有）の破棄
		var destroyScreenStream = function(
			) {
			if (SHOW_LOG) {
				console.log('[MeetinCore][destroyScreenStream][start]');
			}

			var streamId = null;
//			var stream = mMeetinMedia.getScreenStream();
			var stream = getSharescreenStream();
			if (stream) {
				streamId = stream.id;
				sendScreenIsOff(streamId);
//				mMeetinMedia.destroyScreenStream();

				mIsSendScreenOn = false;
				if (mLimitSendBandwidth && MEETIN_MAIN_AUTO_CHANGE_SEND_BANDWIDTH) {
				} else {
					closeMediaConnectionByStreamId(streamId);
				}
			}
		};

		// メディアストリーム（画面共有）の破棄
		MeetinCore.prototype.destroyScreenStream = function(
			) {
			destroyScreenStream();
		};

		// メディアストリーム（画面共有）の破棄
		MeetinCore.prototype.destroyScreenStreamSub = function(
			) {
			mMeetinMedia.destroyScreenStream();
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
			// 送信側の視点：ストリームを受け入れた
			// →受信側の視点：タイマー解除
			else if (json.command === "STREAM_RECEIVED") {
				return runStreamReceived(json);
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
			// 送信側の視点：指定したピアに接続するコマンド
			// →受信側の視点：指定したピアに接続する
			else if (json.command === "CONNECT_TO_SPECIFIC_PEER_ID") {
				return runConnectToSpecificPeerId(json);
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
			// 送信側の視点：帯域更新コマンドを送る
			// →受信側の視点：帯域更新
			else if (json.command === "REQUEST_UPDATE_BANDWIDTH") {
				return runRequestUpdateBandwidth(json);
			}
			// 送信側の視点：ストリームの状態を送る
			// →受信側の視点：
			else if (json.command === "STREAM_INFO_DETAIL") {
				return runStreamInfoDetail(json);
			}
			else if (json.command === "REQUEST_CHANGE_ALL_MEDIA_CONNECTION_STATE") {
				return runRequestChangeAllMediaConnectionState(json);
			}
			else if (json.command === "PING_RECEIVED") {
				return runPingReceived(json);
			}
			return false;
		};

		// コマンド実行
		MeetinCore.prototype.runCoreCommandCallback = function(
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

			data.core_command = isCoreCommand;
			data.from_peer_id = mMeetinWebSocket.getPeerId();
			data.from_user_id = mUserId;
			data.from_user_info = mUserInfo;
			data.from_browser = mBrowser;
			data.from_webrtc = true;
			data.from_websocket = false;
			data.from_room_mode = $("#room_mode").val();
			data.from_browser_version = platform.version;
			data.from_os = platform.os.family;
			data.from_os_version = platform.os.version;
			// MCU add
			data.from_mcu_peer_id = publisher.room.myId;
/*	MCU delete
			if (target_peer_id && target_peer_id.length > 0) {
				if (MEETIN_WEBRTC_PEER_ID_LENGTH == target_peer_id.length) {
					target_peer_id = "S" + target_peer_id;
				}
				data.to_peer_id = target_peer_id;

				return mMeetinWebSocket.sendMessage(JSON.stringify(data));
			} else {
				for (var key in mUserIdAndPeerDataIdTable) {
					if (key != mUserId) {
						var target_peer_id_work = mUserIdAndPeerDataIdTable[key];
						if (target_peer_id_work) {
							if (MEETIN_WEBRTC_PEER_ID_LENGTH == target_peer_id_work.length) {
								target_peer_id_work = "S" + target_peer_id_work;
							}
							data.to_peer_id = target_peer_id_work;
							mMeetinWebSocket.sendMessage(JSON.stringify(data));
						}
					}
				}
			}
*/
			let room = getPublisherRoom();
			if (room != null) {
				room.send(JSON.stringify(data));
			}
		};

		// コマンドを相手に送る
		MeetinCore.prototype.sendCommand = function(
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
		MeetinCore.prototype.sendCommandByUserId = function(
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
		MeetinCore.prototype.sendRequestSystemInfoDetail = function(
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
		MeetinCore.prototype.sendRequestSystemInfoDetailByUserId = function(
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
/*			var videoStream = mMeetinMedia.getVideoStream(); */
			let videoEnabled = false;
			let audioEnabled = false;
			let stream = getLocalStream();
			if (stream) {
				videoEnabled = stream.getVideoTracks()[0].enabled;
				audioEnabled = stream.getAudioTracks()[0].enabled;
			}
			var videoStream = (mIsChromakey == false) ? mMeetinMedia.getVideoStream() : mChromakeyStream;
			var audioStream = mMeetinMedia.getAudioStream();
			var screenStream = mMeetinMedia.getScreenStream();

			var user_agent = navigator.userAgent;
			var has_focus = document.hasFocus();
			var has_video_stream = (videoStream) ? true : false;
			if (mIsChromakey == true) {
				has_video_stream = NEGOTIATION.isMyCameraOn;
			}
			var has_video_stream = videoEnabled;
//			var has_audio_stream = (audioStream) ? true : false;
			var has_audio_stream = audioEnabled;
			var has_screen_stream = (screenStream) ? true : false;
			var video_stream_id = (videoStream) ? videoStream.id : null;
			var audio_stream_id = (audioStream) ? audioStream.id : null;
			var screen_stream_id = (screenStream) ? screenStream.id : null;

			var data = {
				command : "SYSTEM_INFO_DETAIL",
				user_agent : user_agent,
				has_focus : has_focus,
				has_video_stream : has_video_stream,
				has_audio_stream : has_audio_stream,
				has_screen_stream : has_screen_stream,
				video_stream_id : video_stream_id,
				audio_stream_id : audio_stream_id,
				screen_stream_id : screen_stream_id,
				send_bandwidth : mSendBandwidth,
				receive_bandwidth : mReceiveBandwidth,
				from_room_mode : $("#room_mode").val(),
				from_browser_version : platform.version,
				from_os : platform.os.family,
				from_os_version : platform.os.version
			};
			return sendCommand(target_peer_id, true, data);
		};

		// 自分の状態を相手に送る
		MeetinCore.prototype.sendSystemInfoDetail = function(
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
		MeetinCore.prototype.sendSystemInfoDetailByUserId = function(
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
			var data = {
				command : "REQUEST_VIDEO_STREAM",
				media_stream_peer_id : peer_id
			};

			return sendCommand(target_peer_id, true, data);
		};

		// 相手のメディアストリーム（映像）を要求する
		MeetinCore.prototype.sendRequestVideoStream = function(
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
		MeetinCore.prototype.sendRequestVideoStreamByUserId = function(
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
		MeetinCore.prototype.sendRequestAudioStream = function(
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
		MeetinCore.prototype.sendRequestAudioStreamByUserId = function(
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
		MeetinCore.prototype.sendRequestScreenStream = function(
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
		MeetinCore.prototype.sendRequestScreenStreamByUserId = function(
				target_user_id,
				peer_id
			) {
			return sendRequestScreenStreamByUserId(
				target_user_id,
				peer_id
			);
		};

		var sendStreamReceived = function(
				target_peer_id,
				stream_id,
				connection_id,
				media_type
			) {
			var data = {
				command : "STREAM_RECEIVED",
				stream_id : stream_id,
				connection_id : connection_id,
				media_type : media_type
			};
			return sendCommand(target_peer_id, true, data);
		};

		// 自分のカメラがオンになったことをすべての接続先に伝える
		var sendCameraIsOn = function(
				target_peer_id,
				stream_id,
				connection_id,
				media_type
			) {
//			var stream = mMeetinMedia.getVideoStream();
			var stream = (mIsChromakey == false) ? mMeetinMedia.getVideoStream() : mChromakeyStream;
			if (mIsChromakey == true) {
				stream = null;
			}
			if (!stream) {
				return null;
			}

			var data = {
				command : "CAMERA_IS_ON",
				stream_id : stream_id,
				connection_id : connection_id,
				media_type : media_type
			};
			return sendCommand(target_peer_id, true, data);
		}

		// 自分のカメラがオンになったことをすべての接続先に伝える
		MeetinCore.prototype.sendCameraIsOn = function(
				target_peer_id,
				stream_id,
				connection_id,
				media_type
			) {
			return sendCameraIsOn(
				target_peer_id,
				stream_id,
				connection_id,
				media_type
			);
		};

		// 自分のカメラがオフになったことをすべての接続先に伝える
		var sendCameraIsOff = function(stream_id) {
			var connectionIdList = mMeetinConnection.getConnectionIdListByStreamId(stream_id);

			var data = {
				command : "CAMERA_IS_OFF",
				stream_id : stream_id,
				connection_id_list : connectionIdList
			};
			return sendCommand(null, true, data);
		}

		// 自分のカメラがオフになったことをすべての接続先に伝える
		MeetinCore.prototype.sendCameraIsOff = function(
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
				connection_id,
				media_type
			) {
			var stream = mMeetinMedia.getAudioStream();
			if (!stream) {
				return null;
			}

			var data = {
				command : "MIC_IS_ON",
				stream_id : stream_id,
				connection_id : connection_id,
				media_type : media_type
			};
			return sendCommand(target_peer_id, true, data);
		}

		// 自分のマイクがオンになったことをすべての接続先に伝える
		MeetinCore.prototype.sendMicIsOn = function(
				target_peer_id,
				stream_id,
				connection_id,
				media_type
			) {
			return sendMicIsOn(
				target_peer_id,
				stream_id,
				connection_id,
				media_type
			);
		};

		// 自分のマイクがオフになったことをすべての接続先に伝える
		var sendMicIsOff = function(stream_id) {
			var connectionIdList = mMeetinConnection.getConnectionIdListByStreamId(stream_id);

			var data = {
				command : "MIC_IS_OFF",
				stream_id : stream_id,
				connection_id_list : connectionIdList
			};
			return sendCommand(null, true, data);
		}

		// 自分のマイクがオフになったことをすべての接続先に伝える
		MeetinCore.prototype.sendMicIsOff = function(
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
				connection_id,
				media_type
			) {
			var stream = mMeetinMedia.getScreenStream();
			if (!stream) {
				return null;
			}

			var data = {
				command : "SCREEN_IS_ON",
				stream_id : stream_id,
				connection_id : connection_id,
				media_type : media_type
			};
			return sendCommand(target_peer_id, true, data);
		}

		// 自分の画面共有がオフになったことをすべての接続先に伝える
		MeetinCore.prototype.sendScreenIsOn = function(
				target_peer_id,
				stream_id,
				connection_id,
				media_type
			) {
			return sendScreenIsOn(
				target_peer_id,
				stream_id,
				connection_id,
				media_type
			);
		};

		// 自分の画面共有がオフになったことをすべての接続先に伝える
		var sendScreenIsOff = function(stream_id) {
			var connectionIdList = mMeetinConnection.getConnectionIdListByStreamId(stream_id);

			var data = {
				command : "SCREEN_IS_OFF",
				stream_id : stream_id,
				connection_id_list : connectionIdList
			};
			return sendCommand(null, true, data);
		}

		// 自分の画面共有がオフになったことをすべての接続先に伝える
		MeetinCore.prototype.sendScreenIsOff = function(
				stream_id
			) {
			return sendScreenIsOff(
				stream_id
			);
		};

		// 指定したピアに接続するコマンド
		var sendRequestConnectToSpecificPeerId = function(
				target_peer_id,
				connect_target_peer_id,
				connect_target_user_id
			) {
			var data = {
				command : "CONNECT_TO_SPECIFIC_PEER_ID",
				connect_target_peer_id : connect_target_peer_id,
				connect_target_user_id : connect_target_user_id
			};
			return sendCommand(target_peer_id, true, data);
		}

		// 指定したピアに接続するコマンド
		MeetinCore.prototype.sendRequestConnectToSpecificPeerId = function(
				target_peer_id,
				connect_target_peer_id,
				connect_target_user_id
			) {
			return sendRequestConnectToSpecificPeerId(
				target_peer_id,
				connect_target_peer_id,
				connect_target_user_id
			);
		};

		// 指定したピアに接続するコマンド
		var sendRequestConnectToSpecificPeerIdByUserId = function(
				target_user_id,
				connect_target_peer_id,
				connect_target_user_id
			) {
			var target_peer_id = null;
			if (0 <= target_peer_id && target_peer_id < MEETIN_MAIN_MAX_PEOPLE) {
				target_peer_id = mUserIdAndPeerDataIdTable[target_user_id];

				return sendRequestConnectToSpecificPeerId(
					target_peer_id,
					connect_target_peer_id,
					connect_target_user_id
				);
			} else {
				return null;
			}
		};

		// 指定したピアに接続するコマンド
		MeetinCore.prototype.sendRequestConnectToSpecificPeerIdByUserId = function(
				target_user_id,
				connect_target_peer_id,
				connect_target_user_id
			) {
			return sendRequestConnectToSpecificPeerIdByUserId(
				target_user_id,
				connect_target_peer_id,
				connect_target_user_id
			);
		};

		// チャットルームに入室したことををすべての接続先に伝える
		var sendEnterRoom = function(target_peer_id) {
			var data = {
				command : "ENTER_ROOM",
				send_bandwidth : mSendBandwidth,
				receive_bandwidth : mReceiveBandwidth
			};
			return sendCommand(target_peer_id, true, data);
		}

		// チャットルームに入室したことををすべての接続先に伝える
		MeetinCore.prototype.sendEnterRoom = function(
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

		// チャットルームに入室したことををすべての接続先に伝える
		MeetinCore.prototype.sendEnterRoomReceived = function(
				target_peer_id
			) {
			return sendEnterRoomReceived(
				target_peer_id
			);
		};

		var sendRequestEnterRoom = function(target_peer_id) {
			var data = {
				command : "REQUEST_ENTER_ROOM",
			};
			return sendCommand(target_peer_id, true, data);
		}

		MeetinCore.prototype.sendRequestEnterRoom = function(
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
		MeetinCore.prototype.sendExitRoom = function(
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
		MeetinCore.prototype.sendRequestCloseConnectionByConnectionId = function(
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

		MeetinCore.prototype.sendRequestCloseConnectionByConnectionIdByUserId = function(
				target_user_id,
				connection_id
			) {
			return sendRequestCloseConnectionByConnectionIdByUserId(
				target_user_id,
				connection_id
			);
		};

		// 帯域更新のコマンドを送る
		var sendRequestUpdateBandwidth = function(
				target_peer_id,
				update_send_bandwidth,
				update_receive_bandwidth
			) {
			var data = {
				command : "REQUEST_UPDATE_BANDWIDTH",
				update_send_bandwidth : update_send_bandwidth,
				update_receive_bandwidth : update_receive_bandwidth
			};
			return sendCommand(target_peer_id, true, data);
		};

		// 帯域更新のコマンドを送る
		MeetinCore.prototype.sendRequestUpdateBandwidth = function(
				target_peer_id,
				update_send_bandwidth,
				update_receive_bandwidth
			) {
			return sendRequestUpdateBandwidth(
				target_peer_id,
				update_send_bandwidth,
				update_receive_bandwidth
			);
		};

		// 自分のストリームの状態を相手に送る
		var sendStreamInfoDetail = function(
				target_peer_id
			) {
//			var videoStream = mMeetinMedia.getVideoStream();
			var videoStream = (mIsChromakey == false) ? mMeetinMedia.getVideoStream() : mChromakeyStream;
			var audioStream = mMeetinMedia.getAudioStream();
			var screenStream = mMeetinMedia.getScreenStream();

			var video_stream_id = (videoStream) ? videoStream.id : null;
			var audio_stream_id = (audioStream) ? audioStream.id : null;
			var screen_stream_id = (screenStream) ? screenStream.id : null;

			var data = {
				command : "STREAM_INFO_DETAIL",
				video_stream_id : video_stream_id,
				audio_stream_id : audio_stream_id,
				screen_stream_id : screen_stream_id
			};

			return sendCommand(target_peer_id, true, data);
		};

		// 自分のストリームの状態を相手に送る
		MeetinCore.prototype.sendStreamInfoDetail = function(
				target_peer_id
			) {
			return sendStreamInfoDetail(
				target_peer_id
			);
		};

		var sendStreamInfoDetailToAllTarget = function(
			) {
			return sendStreamInfoDetail(
				null
			);
		};

		var sendRequestChangeAllMediaConnectionState = function(
				target_peer_id,
				extra2
			) {
			var data = {
				command : "REQUEST_CHANGE_ALL_MEDIA_CONNECTION_STATE",
				extra2 : extra2
			};

			return sendCommand(target_peer_id, true, data);
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

		var sendForceExitRoom = function(
				target_peer_id,
				not_exist_table
			) {
			var data = {
				command : "FORCE_EXIT_ROOM",
				not_exist_table : not_exist_table
			};

			return sendCommand(target_peer_id, true, data);
		};

		var sendRoomAllowUser = function(
				target_peer_id,
				user_id_table
			) {
			var data = {
				command : "ROOM_ALLOW_USER",
				user_id_table : user_id_table
			};

			return sendCommand(target_peer_id, true, data);
		};

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
		MeetinCore.prototype.runRequestSystemInfoDetail = function(
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
		MeetinCore.prototype.runSystemInfoDetail = function(
				json
			) {
			return runSystemInfoDetail(
				json
			);
		};

		var stopSendVideoStream = function(
				target_peer_id
			) {
//			var stream = mMeetinMedia.getVideoStream();
			var stream = (mIsChromakey == false) ? mMeetinMedia.getVideoStream() : mChromakeyStream;

			if (stream) {
				if (MEETIN_WEBSOCKET_PEER_ID_LENGTH == target_peer_id.length) {
					target_peer_id = target_peer_id.substr(1, MEETIN_WEBRTC_PEER_ID_LENGTH);
				}

				var connection = mMeetinConnection.getMediaConnectionByTargetPeerIdAndStreamId(target_peer_id, stream.id);
				if (connection) {
					connection.extra2 = false;
					connection.close();
					return true;
				}
			}

			return false;
		};

		MeetinCore.prototype.stopSendVideoStream = function(
				target_peer_id
			) {
			return stopSendVideoStream(
				target_peer_id
			);
		};

		var stopSendAudioStream = function(
				target_peer_id
			) {
			var stream = mMeetinMedia.getAudioStream();

			if (stream) {
				if (MEETIN_WEBSOCKET_PEER_ID_LENGTH == target_peer_id.length) {
					target_peer_id = target_peer_id.substr(1, MEETIN_WEBRTC_PEER_ID_LENGTH);
				}

				var connection = mMeetinConnection.getMediaConnectionByTargetPeerIdAndStreamId(target_peer_id, stream.id);
				if (connection) {
					connection.extra2 = false;
					connection.close();
					return true;
				}
			}
			return false;
		};

		MeetinCore.prototype.stopSendAudioStream = function(
				target_peer_id
			) {
			return stopSendAudioStream(
				target_peer_id
			);
		};

		var stopSendScreenStream = function(
				target_peer_id
			) {
			var stream = mMeetinMedia.getScreenStream();

			if (stream) {
				if (MEETIN_WEBSOCKET_PEER_ID_LENGTH == target_peer_id.length) {
					target_peer_id = target_peer_id.substr(1, MEETIN_WEBRTC_PEER_ID_LENGTH);
				}

				var connection = mMeetinConnection.getMediaConnectionByTargetPeerIdAndStreamId(target_peer_id, stream.id);
				if (connection) {
					connection.extra2 = false;
					connection.close();
					return true;
				}
			}
			return false;
		};

		MeetinCore.prototype.stopSendScreenStream = function(
				target_peer_id
			) {
			return stopSendScreenStream(
				target_peer_id
			);
		};

		var runRequestVideoStreamSub = function(
				json
			) {
			var mediaConnection = null;
//			var stream = mMeetinMedia.getVideoStream();
			var stream = (mIsChromakey == false) ? mMeetinMedia.getVideoStream() : mChromakeyStream;
			if (mMeetinMedia.getVideoStream() == null) {
				stream = null;
			}
			if (stream) {
				var target_peer_id = json.from_peer_id;
				if (MEETIN_WEBSOCKET_PEER_ID_LENGTH == target_peer_id.length) {
					target_peer_id = target_peer_id.substr(1, MEETIN_WEBRTC_PEER_ID_LENGTH);
				}

				var connection = mMeetinConnection.getMediaConnectionByTargetPeerIdAndStreamId(target_peer_id, stream.id);
				if (connection) {
					connection.extra2 = false;
					connection.close();

					mediaConnection = sendVideoStream(
						target_peer_id,
						stream,
						json.options,
						null,
						null,
						null,
						null
					);

					if (mediaConnection) {
						sendCameraIsOn(
							target_peer_id,
							stream.id,
							mediaConnection.id,
							mediaConnection.metadata.media_type
						);
					}
				} else {
					mediaConnection = sendVideoStream(
						target_peer_id,
						stream,
						json.options,
						null,
						null,
						null,
						null
					);

					if (mediaConnection) {
						sendCameraIsOn(
							target_peer_id,
							stream.id,
							mediaConnection.id,
							mediaConnection.metadata.media_type
						);
					}
				}
			}

			return mediaConnection;
		};

		// 相手のピアに自分のメディアストリーム（映像）を送る
		var runRequestVideoStream = function(
				json
			) {
			runRequestVideoStreamSub(json);

			return true;
		};

		// 相手のピアに自分のメディアストリーム（映像）を送る
		MeetinCore.prototype.runRequestVideoStream = function(
				json
			) {
			return runRequestVideoStream(
				json
			);
		};

		var runRequestAudioStreamSub = function(
				json
			) {
			var mediaConnection = null;
			var stream = mMeetinMedia.getAudioStream();

			if (stream) {
				var target_peer_id = json.from_peer_id;
				if (MEETIN_WEBSOCKET_PEER_ID_LENGTH == target_peer_id.length) {
					target_peer_id = target_peer_id.substr(1, MEETIN_WEBRTC_PEER_ID_LENGTH);
				}

				var connection = mMeetinConnection.getMediaConnectionByTargetPeerIdAndStreamId(target_peer_id, stream.id);
				if (connection) {
					connection.extra2 = false;
					connection.close();

					mediaConnection = sendAudioStream(
						target_peer_id,
						stream,
						json.options,
						null,
						null,
						null,
						null
					);

					if (mediaConnection) {
						sendMicIsOn(
							target_peer_id,
							stream.id,
							mediaConnection.id,
							mediaConnection.metadata.media_type
						);
					}
				} else {
					mediaConnection = sendAudioStream(
						target_peer_id,
						stream,
						json.options,
						null,
						null,
						null,
						null
					);

					if (mediaConnection) {
						sendMicIsOn(
							target_peer_id,
							stream.id,
							mediaConnection.id,
							mediaConnection.metadata.media_type
						);
					}
				}
			}

			return mediaConnection;
		};

		// 相手のピアに自分のメディアストリーム（マイク）を送る
		var runRequestAudioStream = function(
				json
			) {
			runRequestAudioStreamSub(json);

			return true;
		};

		// 相手のピアに自分のメディアストリーム（マイク）を送る
		MeetinCore.prototype.runRequestAudioStream = function(
				json
			) {
			return runRequestAudioStream(
				json
			);
		};

		var runRequestScreenStreamSub = function(
				json
			) {
			var mediaConnection = null;
			var stream = mMeetinMedia.getScreenStream();

			if (stream) {
				var target_peer_id = json.from_peer_id;
				if (MEETIN_WEBSOCKET_PEER_ID_LENGTH == target_peer_id.length) {
					target_peer_id = target_peer_id.substr(1, MEETIN_WEBRTC_PEER_ID_LENGTH);
				}

				var connection = mMeetinConnection.getMediaConnectionByTargetPeerIdAndStreamId(target_peer_id, stream.id);
				if (connection) {
					connection.extra2 = false;
					connection.close();

					mediaConnection = sendScreenStream(
						target_peer_id,
						stream,
						json.options,
						null,
						null,
						null,
						null
					);

					if (mediaConnection) {
						sendScreenIsOn(
							target_peer_id,
							stream.id,
							mediaConnection.id,
							mediaConnection.metadata.media_type
						);
					}
				} else {
					mediaConnection = sendScreenStream(
						target_peer_id,
						stream,
						json.options,
						null,
						null,
						null,
						null
					);

					if (mediaConnection) {
						sendScreenIsOn(
							target_peer_id,
							stream.id,
							mediaConnection.id,
							mediaConnection.metadata.media_type
						);
					}
				}
			}

			return mediaConnection;
		};

		// 相手のピアに自分のメディアストリーム（画面共有）を送る
		var runRequestScreenStream = function(
				json
			) {
			runRequestScreenStreamSub(json);

			return true;
		};

		// 相手のピアに自分のメディアストリーム（画面共有）を送る
		MeetinCore.prototype.runRequestScreenStream = function(
				json
			) {
			return runRequestScreenStream(
				json
			);
		};

		var runStreamReceived = function(json) {
			if (json.connection_id in mMediaConnectionCallTryTable) {
				delete mMediaConnectionCallTryTable[json.connection_id];

				if (SAVE_CONNECTION_LOG_TO_DATABASE) {
					var connection_type = 0;
					if ('camera' === json.media_type) {
						connection_type = 2;
					} else if ('mic' === json.media_type) {
						connection_type = 3;
					} else if ('screen' === json.media_type) {
						connection_type = 4;
					}
					mediaConnectionStreamSendConfirmLog(
						mConnectionInfoId,
						connection_type,
						json.connection_id,
						mMeetinConnection.getPeerDataId(),
						json.from_peer_id,
						null,
						null,
						null
					);
				}
			}
		};

		// 相手のカメラがオンになったときの処理
		var runCameraIsOn = function(json) {
			// media_typeがない場合の対応
			if (!json.media_type
				|| !(json.media_type === 'camera' || json.media_type === 'mic' || json.media_type === 'screen')
				) {
				var exist = false;

				for (var key in mConnectionIdAndMediaConnection) {
					if (json.connection_id === key) {
						var mediaConnection = mConnectionIdAndMediaConnection[key];
						var stream = mediaConnection.remoteStream;

						mUserIdAndReceiveVideoStreamConnectionTable[json.from_user_id] = mediaConnection;

						if (mInitReceiveTargetVideoStreamCallback && typeof mInitReceiveTargetVideoStreamCallback === "function") {
							mInitReceiveTargetVideoStreamCallback(
								json.from_user_id,
								stream,
								mMeetinConnection.getPeerDataId(),
								json.from_peer_id,
								json.connection_id
							);
						}

						if (SAVE_CONNECTION_LOG_TO_DATABASE) {
							mediaConnectionStream2Log(
								mConnectionInfoId,
								2,
								json.connection_id,
								json.from_peer_id,
								mMeetinConnection.getPeerDataId(),
								null,
								null,
								null
							);
						}

						sendStreamReceived(
							json.from_peer_id,
							stream.id,
							json.connection_id,
							'camera'
						);

						delete mConnectionIdAndMediaConnection[key];
						exist = true;
						break;
					}
				}

				if (!exist) {
					var userId = parseInt(json.from_user_id);
					if (0 <= userId && userId < MEETIN_MAIN_MAX_PEOPLE) {
						mUserIdAndVideoStreamConnectionIdArray[userId].push(json.connection_id);
					}
				}
			}

			return false;
		};

		// 相手のカメラがオンになったときの処理
		MeetinCore.prototype.runCameraIsOn = function(
				json
			) {
			return runCameraIsOn(
				json
			);
		};

		// 相手のカメラがオフになったときの処理
		var runCameraIsOff = function(json) {
			var connectionIdList = json.connection_id_list;
			if (connectionIdList) {
				for (var i = 0; i < connectionIdList.length; ++i) {
					mMeetinConnection.closeConnectionByConnectionId(connectionIdList[i]);
				}
			}

			return false;
		};

		// 相手のカメラがオフになったときの処理
		MeetinCore.prototype.runCameraIsOff = function(
				json
			) {
			return runCameraIsOff(
				json
			);
		};

		// 相手のマイクがオンになったときの処理
		var runMicIsOn = function(json) {
			// media_typeがない場合の対応
			if (!json.media_type
				|| !(json.media_type === 'camera' || json.media_type === 'mic' || json.media_type === 'screen')
				) {
				var exist = false;

				for (var key in mConnectionIdAndMediaConnection) {
					if (json.connection_id === key) {
						var mediaConnection = mConnectionIdAndMediaConnection[key];
						var stream = mediaConnection.remoteStream;

						mUserIdAndReceiveAudioStreamConnectionTable[json.from_user_id] = mediaConnection;

						if (mInitReceiveTargetAudioStreamCallback && typeof mInitReceiveTargetAudioStreamCallback === "function") {
							mInitReceiveTargetAudioStreamCallback(
								json.from_user_id,
								stream,
								mMeetinConnection.getPeerDataId(),
								json.from_peer_id,
								json.connection_id
							);
						}

						if (SAVE_CONNECTION_LOG_TO_DATABASE) {
							mediaConnectionStream2Log(
								mConnectionInfoId,
								3,
								json.connection_id,
								json.from_peer_id,
								mMeetinConnection.getPeerDataId(),
								null,
								null,
								null
							);
						}

						sendStreamReceived(
							json.from_peer_id,
							stream.id,
							json.connection_id,
							'mic'
						);

						delete mConnectionIdAndMediaConnection[key];
						exist = true;
						break;
					}
				}

				if (!exist) {
					var userId = parseInt(json.from_user_id);
					if (0 <= userId && userId < MEETIN_MAIN_MAX_PEOPLE) {
						mUserIdAndAudioStreamConnectionIdArray[userId].push(json.connection_id);
					}
				}
			}

			return false;
		};

		// 相手のマイクがオンになったときの処理
		MeetinCore.prototype.runMicIsOn = function(
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
			var connectionIdList = json.connection_id_list;
			if (connectionIdList) {
				for (var i = 0; i < connectionIdList.length; ++i) {
					mMeetinConnection.closeConnectionByConnectionId(connectionIdList[i]);
				}
			}
			return false;
		};

		// 相手のマイクがオフになったときの処理
		MeetinCore.prototype.runMicIsOff = function(
				json
			) {
			return runMicIsOff(
				json
			);
		};

		// 相手の画面共有がオンになったときの処理
		var runScreenIsOn = function(json) {
			// media_typeがない場合の対応
			if (!json.media_type
				|| !(json.media_type === 'camera' || json.media_type === 'mic' || json.media_type === 'screen')
				) {
				var exist = false;

				for (var key in mConnectionIdAndMediaConnection) {
					if (json.connection_id === key) {
						var mediaConnection = mConnectionIdAndMediaConnection[key];
						var stream = mediaConnection.remoteStream;

						mUserIdAndReceiveScreenStreamConnectionTable[json.from_user_id] = mediaConnection;

						if (mInitReceiveTargetScreenStreamCallback && typeof mInitReceiveTargetScreenStreamCallback === "function") {
							mInitReceiveTargetScreenStreamCallback(
								json.from_user_id,
								stream,
								mMeetinConnection.getPeerDataId(),
								json.from_peer_id,
								json.connection_id
							);
						}

						if (SAVE_CONNECTION_LOG_TO_DATABASE) {
							mediaConnectionStream2Log(
								mConnectionInfoId,
								4,
								json.connection_id,
								json.from_peer_id,
								mMeetinConnection.getPeerDataId(),
								null,
								null,
								null
							);
						}

						sendStreamReceived(
							json.from_peer_id,
							stream.id,
							json.connection_id,
							'screen'
						);

						delete mConnectionIdAndMediaConnection[key];
						exist = true;
						break;
					}
				}

				if (!exist) {
					var userId = parseInt(json.from_user_id);
					if (0 <= userId && userId < MEETIN_MAIN_MAX_PEOPLE) {
						mUserIdAndScreenStreamConnectionIdArray[userId].push(json.connection_id);
					}
				}
			}

			return false;
		};

		// 相手の画面共有がオンになったときの処理
		MeetinCore.prototype.runScreenIsOn = function(
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
			mIsReceiveScreenOn = false;

			var connectionIdList = json.connection_id_list;
			if (connectionIdList) {
				for (var i = 0; i < connectionIdList.length; ++i) {
					mMeetinConnection.closeConnectionByConnectionId(connectionIdList[i]);
				}
			}
			return false;
		};

		// 相手の画面共有がオフになったときの処理
		MeetinCore.prototype.runScreenIsOff = function(
				json
			) {
			return runScreenIsOff(
				json
			);
		};

		// 指定したピアに接続する
		var runConnectToSpecificPeerId = function(json) {
			if (json.connect_target_peer_id == mMeetinConnection.getPeerDataId()) {
				return true;
			}

			connectToTarget(
				json.connect_target_user_id,
				json.connect_target_peer_id,
				mInitCoreCommandCallback,
				mInitCommonCommandCallback,
				null,
				null
			);

			return true;
		};

		// 相手の画面共有がオフになったので、関連ピアを破棄する
		MeetinCore.prototype.runConnectToSpecificPeerId = function(
				json
			) {
			return runConnectToSpecificPeerId(
				json
			);
		};

		var runEnterRoom = function(json) {
			// 相手のピアIDとuserIdを保存
			if (json.from_user_id) {
				if (0 <= json.from_user_id && json.from_user_id < MEETIN_MAIN_MAX_PEOPLE) {
					mUserIdAndPeerDataIdTable[json.from_user_id] = json.from_peer_id;

					if (json.from_websocket) {
						mUserIdAndPeerDataIdTable_Flash[json.from_user_id] = json.from_peer_id;
					}
					if (json.from_webrtc) {
						mUserIdAndPeerDataIdTable_WebRTC[json.from_user_id] = json.from_peer_id;
					}

					if (SHOW_LOG) {
						console.log('[MeetinCore][runEnterRoom]:mUserIdAndPeerDataIdTable = '+ JSON.stringify(mUserIdAndPeerDataIdTable));
					}
				}
			}
			return false;
		};

		MeetinCore.prototype.runEnterRoom = function(
				json
			) {
			return runEnterRoom(
				json
			);
		};

		var runEnterRoomReceived = function(json) {
			var targetPeerId = json.from_peer_id;

			// 自分の状態を相手に送る
			sendSystemInfoDetail(targetPeerId);

			var jsonVideo = {
				from_peer_id : targetPeerId,
				options : mPeerDataIdAndVideoSendBandwidthOptionsTable[targetPeerId],
				media_type : 'camera'
			};
			if (SHOW_LOG) {
				console.log('[MeetinCore][runEnterRoomReceived][runRequestVideoStreamSub]:json = ' + JSON.stringify(jsonVideo));
			}
			runRequestVideoStreamSub(jsonVideo);

			var jsonAudio = {
				from_peer_id : targetPeerId,
				options : mPeerDataIdAndAudioSendBandwidthOptionsTable[targetPeerId],
				media_type : 'mic'
			};
			if (SHOW_LOG) {
				console.log('[MeetinCore][runEnterRoomReceived][runRequestAudioStreamSub]:json = ' + JSON.stringify(jsonAudio));
			}
			runRequestAudioStreamSub(jsonAudio);

			var jsonScreen = {
				from_peer_id : targetPeerId,
				options : mPeerDataIdAndScreenSendBandwidthOptionsTable[targetPeerId],
				media_type : 'screen'
			};
			if (SHOW_LOG) {
				console.log('[MeetinCore][runEnterRoomReceived][runRequestScreenStreamSub]:json = ' + JSON.stringify(jsonScreen));
			}
			runRequestScreenStreamSub(jsonScreen);

			return false;
		};

		MeetinCore.prototype.runEnterRoomReceived = function(
				json
			) {
			return runEnterRoomReceived(
				json
			);
		};

		var runRequestEnterRoom = function(json) {
			sendEnterRoom(json.from_peer_id);
			return false;
		};

		MeetinCore.prototype.runRequestEnterRoom = function(
				json
			) {
			return runRequestEnterRoom(
				json
			);
		};

		// 接続先がチャットルームを退室したら、明示的にその接続先との接続を切る
		var runExitRoom = function(json) {
			mMeetinConnection.closeConnectionByPeerId(
				json.from_peer_id
			);

			// ピアIDとuserIdの関連性を更新
			for (var key in mUserIdAndPeerDataIdTable) {
				if (mUserIdAndPeerDataIdTable[key] === json.from_peer_id) {
					delete mUserIdAndPeerDataIdTable[key];
					delete mUserIdAndPeerDataIdTable_WebRTC[key];
					delete mUserIdAndPeerDataIdTable_Flash[key];
				}
			}

			return false;
		};

		// 接続先がチャットルームを退室したら、明示的にその接続先との接続を切る
		MeetinCore.prototype.runExitRoom = function(
				json
			) {
			return runExitRoom(
				json
			);
		};

		// Connectionを閉じる
		var runRequestCloseConnectionByConnectionId = function(json) {
			mMeetinConnection.closeConnectionByConnectionId(
				json.connection_id
			);

			return false;
		};

		// Connectionを閉じる
		MeetinCore.prototype.runRequestCloseConnectionByConnectionId = function(
				json
			) {
			return runRequestCloseConnectionByConnectionId(
				json
			);
		};

		// 帯域更新
		var runRequestUpdateBandwidth = function(json) {
			return false;
		};

		// 帯域更新
		MeetinCore.prototype.runRequestUpdateBandwidth = function(
				json
			) {
			return runRequestUpdateBandwidth(
				json
			);
		};

		var runStreamInfoDetail = function(json) {
			return false;
		};

		MeetinCore.prototype.runStreamInfoDetail = function(
				json
			) {
			return runStreamInfoDetail(
				json
			);
		};

		var runRequestChangeAllMediaConnectionState = function(json) {
			for (var key in mUserIdAndReceiveVideoStreamConnectionTable) {
				var connection = mUserIdAndReceiveVideoStreamConnectionTable[key];
				if (connection && connection.open && connection.peer === json.from_peer_id) {
					connection.extra2 = json.extra2;
				}
			}

			for (var key in mUserIdAndReceiveAudioStreamConnectionTable) {
				var connection = mUserIdAndReceiveAudioStreamConnectionTable[key];
				if (connection && connection.open && connection.peer === json.from_peer_id) {
					connection.extra2 = json.extra2;
				}
			}

			for (var key in mUserIdAndReceiveScreenStreamConnectionTable) {
				var connection = mUserIdAndReceiveScreenStreamConnectionTable[key];
				if (connection && connection.open && connection.peer === json.from_peer_id) {
					connection.extra2 = json.extra2;
				}
			}

			return false;
		};

		MeetinCore.prototype.runRequestChangeAllMediaConnectionState = function(
				json
			) {
			return runRequestChangeAllMediaConnectionState(
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
		// ・ピアIDをデータベースに保存
		// ・空きのuserIdを取得
		// ・接続中の接続先の数を取得する
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
			sync_updateConnectionInfoPeerId(
				connectionInfoId,
				userId,
				peerId,
				updateConnectionInfoPeerIdSuccessCallbackWork,
				updateConnectionInfoPeerIdErrorCallbackWork,
				updateConnectionInfoPeerIdCompleteCallbackWork
			);
			// // ピアIDをデータベースに保存
			// updateConnectionInfoPeerId(
			// 	connectionInfoId,
			// 	userId,
			// 	peerId,
			// 	updateConnectionInfoPeerIdSuccessCallbackWork,
			// 	updateConnectionInfoPeerIdErrorCallbackWork,
			// 	updateConnectionInfoPeerIdCompleteCallbackWork
			// );
		};

		// ピアIDをデータベースに保存
		// peerId：データベースに保存するピアID
		MeetinCore.prototype.updateConnectionInfo = function(
				connectionInfoId,
				userId,
				peerId,
				successCallback,
				errorCallback
			) {
			updateConnectionInfo(
				connectionInfoId,
				userId,
				peerId,
				successCallback,
				errorCallback
			);
		};

		MeetinCore.prototype.removeUserId = function(
				target_user_id
			) {
			if (target_user_id in mUserIdAndPeerDataIdTable) {
				delete mUserIdAndPeerDataIdTable[target_user_id];
			}
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
		MeetinCore.prototype.getEmptyUserId = function(
			) {
			return getEmptyUserId();
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
		MeetinCore.prototype.getConnectedUserIdList = function(
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
		MeetinCore.prototype.changePeerDataIdArrayToUserIdArray = function(
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

		MeetinCore.prototype.changePeerDataIdToUserId = function(
				peer_data_id
			) {
			return changePeerDataIdToUserId(
				peer_data_id
			);
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
		MeetinCore.prototype.getTotalTargetPeerData = function(
			) {
			return getTotalTargetPeerData();
		};
		// 指定した接続先との接続状態を取得する
		MeetinCore.prototype.isConnectedToUserId = function(
				target_user_id
			) {
			return isConnectedToUserId(
				target_user_id
			);
		};

		MeetinCore.prototype.getPeerDataId = function(
			) {
			return mMeetinConnection.getPeerDataId();
		};

		MeetinCore.prototype.getMeetinConnection = function(
			) {
			return mMeetinConnection;
		};

		var closeAllMediaConnection = function(
			) {
			return mMeetinConnection.closeAllMediaConnection();
		};

		MeetinCore.prototype.closeAllMediaConnection = function(
			) {
			return closeAllMediaConnection();
		};

		var closeMediaConnectionByStreamId = function(
				streamId
			) {
			return mMeetinConnection.closeMediaConnectionByStreamId(streamId);
		};

		MeetinCore.prototype.closeMediaConnectionByStreamId = function(
				streamId
			) {
			return closeMediaConnectionByStreamId(streamId);
		};

		var closeConnectionByConnectionId = function(
				connection_id
			) {
			return mMeetinConnection.closeConnectionByConnectionId(connection_id);
		};

		MeetinCore.prototype.closeConnectionByConnectionId = function(
				connection_id
			) {
			return closeConnectionByConnectionId(connection_id);
		};

		MeetinCore.prototype.cancelChooseDesktopMedia = function(
			) {
			return mMeetinMedia.cancelChooseDesktopMedia();
		};

		MeetinCore.prototype.getMeetinWebSocketConnection = function(
			) {
			return mMeetinWebSocket;
		};

		MeetinCore.prototype.debug1 = function(
			) {
			var total = 0;
			for (var key in mUserIdAndReceiveVideoStreamConnectionTable) {
				var connection = mUserIdAndReceiveVideoStreamConnectionTable[key];
				if (connection && connection.open) {
					var sdp = createBandwidthSdp(connection.pc.localDescription.sdp, 'video', 100);
					connection.pc.setLocalDescription(connection.pc.localDescription);
				}
			}

			return total;
		};

		MeetinCore.prototype.debug2 = function(
			) {
			var total = 0;
			for (var key in mUserIdAndReceiveVideoStreamConnectionTable) {
				var connection = mUserIdAndReceiveVideoStreamConnectionTable[key];
				if (connection) {
					var sdp = createBandwidthSdp(connection.pc.localDescription.sdp, 'video', 2000);
					connection.pc.setLocalDescription(connection.pc.localDescription);
				}
			}

			return total;
		};

		// ユーザー名を設定する
		MeetinCore.prototype.setUserInfo = function(
			user_info
			) {
			mUserInfo = user_info;
		};

		var muteTargetAudio = function(
			video_id,
			muted
			) {

			for(var key in mUserIdAndReceiveAudioStreamConnectionTable) {
				if(key == video_id) {
					var mc = mUserIdAndReceiveAudioStreamConnectionTable[key];
					if(mc.remoteStream) {
						if(true === muted) {
							mc.remoteStream.getAudioTracks()[0].enabled = false;
							secretVoice.syncSecretVoiceAudioOff(mc.remoteId);
						}else {
							mc.remoteStream.getAudioTracks()[0].enabled = true;
							secretVoice.syncSecretVoiceAudioOn(mc.remoteId);
						}
					}
				}
			}
		};

		MeetinCore.prototype.muteTargetAudio = function(
			video_id,
			muted
			) {
			return muteTargetAudio(video_id, muted);
		};

		var cameraStreamDisable = function() {
			let stream = mMeetinMedia.getVideoStream();
			if (stream) {
				stream.getVideoTracks()[0].enabled = false;
			}
		}
		MeetinCore.prototype.cameraStreamDisable = function() {
			return cameraStreamDisable();
		}

		var cameraStreamEnable = function() {
			let stream = mMeetinMedia.getVideoStream();
			if (stream) {
				stream.getVideoTracks()[0].enabled = true;
			}
		}
		MeetinCore.prototype.cameraStreamEnable = function() {
			return cameraStreamEnable();
		}

		return MeetinCore;
	})();
	MeetinCoreManager.MeetinCore = MeetinCore;

})(MeetinCoreManager || (MeetinCoreManager = {}));
