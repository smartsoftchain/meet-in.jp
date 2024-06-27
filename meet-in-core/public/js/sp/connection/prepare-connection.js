const GUEST_DATACONNECTION_RETRY_WAIT = 5000;
const GUEST_DATACONNECTION_RETRY_WAIT_2 = 5000;
var mDataConnectionTimeout = null;
var mDataConnectionTryCounter = 0;

const TARGET_NOT_FOUND_RETRY_MAX = 5;
const TARGET_NOT_FOUND_RETRY_WAIT = 5000;
var mTargetNotFoundRetryCounter = 0;
var mTargetNotFoundRetryTimeout = null;

// 接続管理
var mMeetinConnection = (typeof MeetinConnectionManager !== 'undefined') ? new MeetinConnectionManager.MeetinConnection() : null;
var mMeetinWebSocket = new MeetinWebSocketManager.MeetinWebSocket();

var mConnectionTimeout = null;

// Ohta
// 接続コマンド(RequestChangeToNegotiation)の送信タイムアウト処理
// ・指定時間内(1000秒以内)に接続受信(REQUEST_CHANGE_TO_NEGOTIATION_RECEIVED)コマンドが返ってこない場合、
//   再度、接続コマンドを送信する。
//   リトライ関数に関しては、TARGET_NOT_FOUNDを加味する必要があるので要注意！！
var mSendRequestChangeToNegotiationTimeout = null;

var mCallConnectionInfoId = null;
var mCallConnectNo = null;
var mCallClientId = null;
var mTargetPeerId = null;

var mReady = false;
var mBandwidth = null;
var mUploadBandwidth = null;
var mReceivedJsonCommand = null;
var mPreventCancelClick = false;

var mPeerId = null;

var mOldConnectionInfoId = null;
var mOldPeerId = null;
var mCloseConnectionInfo = true;

// WebRTC通信コマンドフラフ
// trueの場合WebRTCにてコマンドを送受信する
// false の場合はWebSocketサーバ経由でコマンドの送受信を行う。
var mCanUseWebRTC = false;

$(window).on('beforeunload', function(e) {
	if (mCloseConnectionInfo && mTargetPeerId) {
		sendRequestChangeToNegotiationTimeout(mTargetPeerId);
	}

	meetinGeneralConnection_destroy();
	mReady = false;

	if (mOldConnectionInfoId && mOldConnectionInfoId.length > 0 && mOldPeerId && mOldPeerId.length) {
		removePeerIdFromConnectionInfo(
			mOldConnectionInfoId,
			mOldPeerId,
			null,
			null,
			null
		);
	}
});

$(document).ready(function(){
	// 画面表示時にダイアログが表示されないよう設定
	$('#request_operator_connection').dialog({ autoOpen: false });

	var auto_dial = $('#auto_dial').val();
	if (1 == auto_dial) {
		$('#connect').trigger('click');
	}

	if (DEFAULT_AUTO_DETECT_BANDWIDTH) {
		var callback = function(timings) {
			mBandwidth = timings.throughput * 8;
			mUploadBandwidth = timings.uploadBandwidth * 8;
			if (mReceivedJsonCommand) {
				runCommandCallback(mReceivedJsonCommand);
				mReceivedJsonCommand = null;
			}
	//		createModalOkDialog("帯域幅(kbps)", '上り：' + mUploadBandwidth + '(kbps), 下り：' + mBandwidth + '(kbps)');
		};

		// 帯域幅を調べる
		detectSpeed.startSpeedCheck("https://" + location.host + "/img/login_img-1.jpg", callback);
	} else {
		mBandwidth = 1;
		mUploadBandwidth = 1;
	}
/*
	if (USER_PARAM_BROWSER === 'Safari' || USER_PARAM_BROWSER === 'IE') {
	} else {
		if (AdapterJS.WebRTCPlugin.isPluginInstalled) {
			AdapterJS.WebRTCPlugin.isPluginInstalled(
				AdapterJS.WebRTCPlugin.pluginInfo.prefix,
				AdapterJS.WebRTCPlugin.pluginInfo.plugName,
				AdapterJS.WebRTCPlugin.pluginInfo.type,
				onCanUseWebRTC,
				onCannotUseWebRTC
			);
		} else {
			mCanUseWebRTC = true;
		}
	}
*/
});

//////////////////////////////////////////////////////////
// コールバック
//////////////////////////////////////////////////////////

// PeerServerへの接続が確立した時
function peerOpenCallback(peer, peerId) {
	mReady = true;

	saveParam(peerId, $('#connect_no').val());
	mPeerId = peerId;
}

// 接続先のピアと接続が確立した時
function peerConnectionCallback(peer, dataConnection) {
}

// 接続先が自分に発信してきた時
function peerCallCallback(peer, mediaConnection) {
}

// ピアとの接続がdestroyedとなった時
function peerCloseCallback(peer) {
}

function peerDisconnectedCallback(peer) {
	meetinGeneralConnection_peerDataReconnect();
}

// ピアのエラーが起きた時
function peerErrorCallback(peer, err) {
	if (mDataConnectionTimeout) {
		clearTimeout(mDataConnectionTimeout);
		mDataConnectionTimeout = null;
	}
	if (mConnectionTimeout) {
		clearTimeout(mConnectionTimeout);
		mConnectionTimeout = null;
	}
	if (mTargetNotFoundRetryTimeout) {
		clearTimeout(mTargetNotFoundRetryTimeout);
		mTargetNotFoundRetryTimeout = null;
	}
// Ohta
	if (mSendRequestChangeToNegotiationTimeout) {
		clearTimeout(mSendRequestChangeToNegotiationTimeout);
		mSendRequestChangeToNegotiationTimeout = null;
	}
	mPreventCancelClick = false;
	if (!mReady) {
		return;
	}

	meetinGeneralConnection_destroy();
	mReady = false;

	var buttonNameAndFunctionArray = {};
	buttonNameAndFunctionArray["OK"] = function() {
		cancelConncetion(false);

		var auto_dial = $('#auto_dial').val();
		if (1 == auto_dial) {
			var page_from = $('#page_from').val();
			var url = decodeURIComponent(page_from);
			window.location.href = url;
		}
	};

//TraceLog(null ,null ,10 ,'---[prepare-connection][peerErrorCallback] err.type=('+err.type+') buttonNameAndFunctionArray=('+buttonNameAndFunctionArray+')', null, null, null);
	if (err.type === 'peer-unavailable') {
		createModalDialogWithButtonFunction("お知らせ", "担当の方が席を外しております。", buttonNameAndFunctionArray);
	} else {
		createModalDialogWithButtonFunction("お知らせ", "接続エラー\n(" + err.type + ")", buttonNameAndFunctionArray);
	}
};

// データ受信時
function dataConnectionDataCallback(dataConnection, data, myPeerId, targetPeerId, connectionId) {
	var json = JSON.parse(data);

	if (json && json.command) {
		runCommandCallback(json);
	}
};

// コネクションが利用可能となった時
function dataConnectionOpenCallback(dataConnection, myPeerId, targetPeerId, connectionId) {
	var run = function() {
		commandCallback();
	};
	// 接続要求を１秒後に実行
	setTimeout(run, 1000);
};

// 自分がクローズした、または接続先にクローズされた時
function dataConnectionCloseCallback(dataConnection, myPeerId, targetPeerId, connectionId) {
//TraceLog(null ,null ,10 ,'---[prepare-connection][dataConnectionCloseCallback]:connectionId=('+connectionId+')', null, myPeerId, targetPeerId);
	if (mDataConnectionTimeout) {
		clearTimeout(mDataConnectionTimeout);
		mDataConnectionTimeout = null;
	}
	if (mConnectionTimeout) {
		clearTimeout(mConnectionTimeout);
		mConnectionTimeout = null;
	}
// タイマー
	if (mSendRequestChangeToNegotiationTimeout) {
		clearTimeout(mSendRequestChangeToNegotiationTimeout);
		mSendRequestChangeToNegotiationTimeout = null;
	}
	mPreventCancelClick = false;
};

// DataConnectionのエラーが起きた時
function dataConnectionErrorCallback(dataConnection, err, myPeerId, targetPeerId, connectionId) {
TraceLog(null ,null ,10 ,'---[prepare-connection][dataConnectionErrorCallback]:connectionId=('+connectionId+') err=('+err+')',null,myPeerId,targetPeerId);
};

//////////////////////////////////////////////////////////
// コネクションが利用可能となったとき
//////////////////////////////////////////////////////////

/**
 * 接続要求を mTargetPeerIdへ送信する
 * ※コネクションガードタイマーも同時に掛ける(30秒)
 */
function commandCallback() {
//TraceLog(null ,null ,10 ,'---[prepare-connection][commandCallback]:mTargetPeerId=('+mTargetPeerId+')',null,null,null);

	if (mCanUseWebRTC) {
		mPreventCancelClick = false; //true;
	}
	sendRequestChangeToNegotiation(mTargetPeerId);

	if (mDataConnectionTimeout) {
		clearTimeout(mDataConnectionTimeout);
		mDataConnectionTimeout = null;
	}
	if (mConnectionTimeout) {
		clearTimeout(mConnectionTimeout);
		mConnectionTimeout = null;
	}

	var run = function() {
		sendRequestChangeToNegotiationTimeout(mTargetPeerId);
		cancelConncetion(true);
	}
	mConnectionTimeout = setTimeout(run, 30000);
}

//////////////////////////////////////////////////////////
// コマンド受信
//////////////////////////////////////////////////////////

function runCommandCallback(json) {
//TraceLog(json.connection_info_id ,json.connect_no ,10 ,'---[prepare-connection][runCommandCallback] Recv json='+JSON.stringify(json),json.command,json.from_peer_id,json.to_peer_id);

// タイマー
	if (mSendRequestChangeToNegotiationTimeout) {
		clearTimeout(mSendRequestChangeToNegotiationTimeout);
		mSendRequestChangeToNegotiationTimeout = null;
	}

	if (json.command === "REQUEST_CHANGE_TO_NEGOTIATION") {
		if (!mBandwidth) {
			mReceivedJsonCommand = json;
		} else {
			if (mConnectionTimeout) {
				clearTimeout(mConnectionTimeout);
				mConnectionTimeout = null;
			}
/*
		// コネクトフォームを元に戻す
		$("div.mi_connect_circle").show();
		$("div.mi_guest_background").show();
		$("div.content_wrap").hide();
		$("div.mi_login_btn").show();
*/
			mTargetPeerId = json.from_peer_id;
			gotoNegotiation(mCallConnectionInfoId, mCallConnectNo, mCallClientId, mTargetPeerId, json);
		}
	} else if (json.command === "REQUEST_CHANGE_TO_NEGOTIATION_RECEIVED") {
		var run = function() {
			mPreventCancelClick = false;
		}
		setTimeout(run, 1000);
	} else if (json.command === "REFUSE_CHANGE_TO_NEGOTIATION") {
		if (json.error_message && json.error_message.length > 0) {
			cancelConncetion(false);

			var buttonNameAndFunctionArray = {};
			buttonNameAndFunctionArray["OK"] = function() {
				cancelConncetion(false);

				var auto_dial = $('#auto_dial').val();
				if (1 == auto_dial) {
					var page_from = $('#page_from').val();
					var url = decodeURIComponent(page_from);
					window.location.href = url;
				}
			};
			createModalDialogWithButtonFunction("お知らせ", json.error_message, buttonNameAndFunctionArray);
		} else {
			cancelConncetion(false);
		}
	} else if (json.command === "CANCEL_CONNECTION") {
		if (json.message && json.message.length > 0) {
			cancelConncetion(false);

			var buttonNameAndFunctionArray = {};
			buttonNameAndFunctionArray["OK"] = function() {
				cancelConncetion(false);

				var auto_dial = $('#auto_dial').val();
				if (1 == auto_dial) {
					var page_from = $('#page_from').val();
					var url = decodeURIComponent(page_from);
					window.location.href = url;
				}
			};
			createModalDialogWithButtonFunction("お知らせ", json.message, buttonNameAndFunctionArray);
		} else {
			cancelConncetion(true);
		}
	} else if (json.command === "CANCEL_CONNECTION_2") {
		if (json.message && json.message.length > 0) {
			cancelConncetion(false);

			var buttonNameAndFunctionArray = {};
			buttonNameAndFunctionArray["OK"] = function() {
				cancelConncetion(false);

				var auto_dial = $('#auto_dial').val();
				if (1 == auto_dial) {
					var page_from = $('#page_from').val();
					var url = decodeURIComponent(page_from);
					window.location.href = url;
				}
			};
			createModalDialogWithButtonFunction("お知らせ", json.message, buttonNameAndFunctionArray);
		} else {
			cancelConncetion(true);
		}
	} else if (json.command === "RESEND_REQUEST_CHANGE_TO_NEGOTIATION") {
		$('#connect').trigger('click');
	}
	else if ( json.command === "TARGET_NOT_FOUND") {	// 送信先が見つからない場合
		var oldJson = JSON.parse(json.message);

//TraceLog(json.connection_info_id ,json.connect_no , 10,'---[TARGET_NOT_FOUND] oldJson='+oldJson ,json.command,json.from_peer_id,json.to_peer_id);

		// 接続要求を出したが,要求したピアIDがいない(もしくはピアIDが変わっている)
		if ( oldJson.command === "REQUEST_CHANGE_TO_NEGOTIATION" )
		{
			if (mTargetNotFoundRetryCounter < TARGET_NOT_FOUND_RETRY_MAX) {
				// 再度、接続要求を送信する
				++mTargetNotFoundRetryCounter

				var run = function() {
					if (mMeetinWebSocket && mCallConnectNo) {
						connectWithConnectNo(mMeetinWebSocket.getPeerId(), mCallConnectNo);
// タイマー(再送)
						// 接続要求の信号が消えた(相手へ届いていない)場合の事を考慮し、接続要求再送を設定する。
						var run2 = function() {
							if (mTargetNotFoundRetryCounter < TARGET_NOT_FOUND_RETRY_MAX) {
TraceLog(null ,null ,10 ,'■■■[prepare-connection][runCommandCallback]:mTargetNotFoundRetryCounter=('+mTargetNotFoundRetryCounter+')',null,null,null );
								mTargetNotFoundRetryCounter++;
								if (mMeetinWebSocket && mCallConnectNo) {
									connectWithConnectNo(mMeetinWebSocket.getPeerId(), mCallConnectNo);
								}
							}
						}
						mSendRequestChangeToNegotiationTimeout = setTimeout(run2, 5000);
					}
				};
				mTargetNotFoundRetryTimeout = setTimeout(run, TARGET_NOT_FOUND_RETRY_WAIT);

			} else {
				var err = new Error('担当の方が席を外しております。');
				err.type = 'peer-unavailable';
				peerErrorCallback(null, err);
			}
		}
	}
}

//////////////////////////////////////////////////////////
// コマンド送信
//////////////////////////////////////////////////////////

function sendRequestChangeToNegotiationSub(target_peer_id, connection_info_id, connect_no, client_id) {
	var data = {
		command : "REQUEST_CHANGE_TO_NEGOTIATION",
		connection_info_id : connection_info_id,
		connect_no : connect_no,
		client_id : client_id,
		user_info : $('#user_info').val(),
		without_dialog : false,
		from_peer_id : meetinGeneralConnection_getPeerDataId(),
		user_id : 0,
		page : "index",
		from_browser : USER_PARAM_BROWSER
	};

//TraceLog(connection_info_id ,connect_no ,10 ,'---[prepare-connection][sendRequestChangeToNegotiationSub]:REQUEST_CHANGE_TO_NEGOTIATION target_peer_id=('+ target_peer_id +')', data.command, data.from_peer_id, target_peer_id );
	meetinGeneralConnection_sendCommandToSpecificTargetPeerData(target_peer_id, data);
}

function sendRequestChangeToNegotiation(target_peer_id) {
	sendRequestChangeToNegotiationSub(target_peer_id, mCallConnectionInfoId, mCallConnectNo, mCallClientId);
}

function sendRequestChangeToNegotiationTimeout(target_peer_id) {
	var data = {
		command : "REQUEST_CHANGE_TO_NEGOTIATION_TIMEOUT",
		connection_info_id : mCallConnectionInfoId,
		connect_no : mCallConnectNo,
		client_id : mCallClientId,
		from_peer_id : meetinGeneralConnection_getPeerDataId(),
		connect_no : $('#connect_no').val()
	};

//TraceLog(mCallConnectionInfoId ,mCallConnectNo ,1 ,'---[prepare-connection][sendRequestChangeToNegotiationTimeout]:REQUEST_CHANGE_TO_NEGOTIATION_TIMEOUT', data.command, data.from_peer_id, target_peer_id );
	meetinGeneralConnection_sendCommandToSpecificTargetPeerData(target_peer_id, data);
}

//////////////////////////////////////////////////////////
// その他
//////////////////////////////////////////////////////////

/**
 * 接続番号による接続
 * DB(ConnectionInfo)を取得し、オペレータピアIDへ接続要求を送信する
 * その際にConnectionInfoのピアID(operator～user8)をチェックしチャットルームが満員かどうか判定する
 * @param {*} peer_id
 * @param {*} connect_no
 */
function connectWithConnectNo(peer_id, connect_no) {
	var successCallback = function(data, textStatus, XMLHttpRequest) {
		if ("1" == data.result) {
			// チャットルームが満員か？
			if ((MEETIN_MAIN_MAX_PEOPLE < 1 || (data.connection_info.operator_peer_id && data.connection_info.operator_peer_id.length > 0))
				&& (MEETIN_MAIN_MAX_PEOPLE < 2 || (data.connection_info.user_peer_id_1 && data.connection_info.user_peer_id_1.length > 0))
				&& (MEETIN_MAIN_MAX_PEOPLE < 3 || (data.connection_info.user_peer_id_2 && data.connection_info.user_peer_id_2.length > 0))
				&& (MEETIN_MAIN_MAX_PEOPLE < 4 || (data.connection_info.user_peer_id_3 && data.connection_info.user_peer_id_3.length > 0))
				&& (MEETIN_MAIN_MAX_PEOPLE < 5 || (data.connection_info.user_peer_id_4 && data.connection_info.user_peer_id_4.length > 0))
				&& (MEETIN_MAIN_MAX_PEOPLE < 6 || (data.connection_info.user_peer_id_5 && data.connection_info.user_peer_id_5.length > 0))
				&& (MEETIN_MAIN_MAX_PEOPLE < 7 || (data.connection_info.user_peer_id_6 && data.connection_info.user_peer_id_6.length > 0))
				&& (MEETIN_MAIN_MAX_PEOPLE < 8 || (data.connection_info.user_peer_id_7 && data.connection_info.user_peer_id_7.length > 0))
				&& (MEETIN_MAIN_MAX_PEOPLE < 9 || (data.connection_info.user_peer_id_8 && data.connection_info.user_peer_id_8.length > 0))
				) {
				var buttonNameAndFunctionArray = {};
				buttonNameAndFunctionArray["OK"] = function() {
					// コネクトフォームを元に戻す
					$("div.mi_connect_circle").show();
					$("div.mi_guest_background").show();
					$("div.content_wrap").hide();
					$("div.mi_login_btn").show();

				};

TraceLog(null ,null ,10 ,'---[prepare-connection][connectWithConnectNo]:現在満員の為、接続できません。MEETIN_MAIN_MAX_PEOPLE=('+ MEETIN_MAIN_MAX_PEOPLE +') data='+JSON.stringify(data), null,null,null );
				createModalDialogWithButtonFunction("お知らせ", "現在満員の為、接続できません。", buttonNameAndFunctionArray);
			}
			else {
				// DB(ConnectionInfo)を内部変数へ設定
				mCallConnectionInfoId = data.connection_info.id;
				mCallConnectNo = data.connection_info.connect_no;
				mCallClientId = data.connection_info.operator_client_id;
				mTargetPeerId = data.connection_info.operator_peer_id;
//TraceLog(mCallConnectionInfoId ,mCallConnectNo ,10 ,'---[prepare-connection][connectWithConnectNo]:result=('+data.result+') data='+JSON.stringify(data), null,null,mTargetPeerId );

				if (mCanUseWebRTC) {
					mMeetinConnection.connectDataConnection(
						mTargetPeerId,
						null,
						dataConnectionDataCallback,
						dataConnectionOpenCallback,
						dataConnectionCloseCallback,
						dataConnectionErrorCallback
						);

						++mDataConnectionTryCounter;

						if (mDataConnectionTimeout) {
						clearTimeout(mDataConnectionTimeout);
						mDataConnectionTimeout = null;
					}
					var run = function() {
						if (mDataConnectionTryCounter > 3) {
							meetinGeneralConnection_destroy();

							if (mConnectionTimeout) {
								clearTimeout(mConnectionTimeout);
								mConnectionTimeout = null;
							}

							var buttonNameAndFunctionArray = {};
							buttonNameAndFunctionArray["OK"] = function() {
								// コネクトフォームを元に戻す
								$("div.mi_connect_circle").show();
								$("div.mi_guest_background").show();
								$("div.content_wrap").hide();
								$("div.mi_login_btn").show();

							};
							createModalDialogWithButtonFunction("お知らせ", "担当の方に接続できません。", buttonNameAndFunctionArray);
						} else {
							meetinGeneralConnection_destroy();
							meetinGeneralConnection_init(
								null,
								peerOpenCallback,
								peerConnectionCallback,
								peerCallCallback,
								peerCloseCallback,
								peerDisconnectedCallback,
								peerErrorCallback,
								dataConnectionDataCallback,
								null,
								dataConnectionCloseCallback,
								dataConnectionErrorCallback,
								null,
								null,
								null
							);
						}
					}
					if (mDataConnectionTryCounter <= 1) {
						mDataConnectionTimeout = setTimeout(run, GUEST_DATACONNECTION_RETRY_WAIT);
					} else {
						mDataConnectionTimeout = setTimeout(run, GUEST_DATACONNECTION_RETRY_WAIT_2);
					}
				} else {
					// WebSocket接続要求
					commandCallback();
				}
			}
		} else {
			//##########################
			// DB(ConnectionInfo)取得失敗
			//##########################

			// 各種タイマークリア
			if (mConnectionTimeout) {
				clearTimeout(mConnectionTimeout);
				mConnectionTimeout = null;
			}
			if (mDataConnectionTimeout) {
				clearTimeout(mDataConnectionTimeout);
				mDataConnectionTimeout = null;
			}

			// お知らせ（エラー）画面を表示
			var buttonNameAndFunctionArray = {};
			buttonNameAndFunctionArray["OK"] = function() {
				// コネクトフォームを元に戻す
				$("div.mi_connect_circle").show();
				$("div.mi_guest_background").show();
				$("div.content_wrap").hide();
				$("div.mi_login_btn").show();

				var auto_dial = $('#auto_dial').val();
				if (1 == auto_dial) {
					var page_from = $('#page_from').val();
					var url = decodeURIComponent(page_from);
					window.location.href = url;
				}
			};
TraceLog(null ,null ,10 ,'---[prepare-connection][connectWithConnectNo]:無効な番号です。data='+JSON.stringify(data), null,null,null );
			createModalDialogWithButtonFunction("お知らせ", "無効な番号です。", buttonNameAndFunctionArray);
		}
	};

	var errorCallback = function(XMLHttpRequest, textStatus, errorThrown, errorMessage) {
//		alert(errorMessage);
//		alert(XMLHttpRequest);
//		alert(textStatus);
//		alert(errorThrown);
	};

	var completeCallback = function(XMLHttpRequest, textStatus) {
	};

	getConnectionInfoByConnectNo(
		connect_no,
		successCallback,
		errorCallback,
		completeCallback
	);
}

// パラメータをセッションに保存
function saveParam(peer_id, connect_no) {
	var successCallback = function(data, textStatus, XMLHttpRequest) {
		if ("1" == data.result) {
			var connect_no_work = connect_no.replace(/-/g, '');
			connectWithConnectNo(peer_id, connect_no_work);

//タイマー
			// 接続要求の信号が消えた(相手へ届いていない)場合の事を考慮し、接続要求再送を設定する。
			var run2 = function() {
				if (mTargetNotFoundRetryCounter < TARGET_NOT_FOUND_RETRY_MAX) {
TraceLog(null ,null ,10 ,'■■■[prepare-connection][saveParam]:mTargetNotFoundRetryCounter=('+mTargetNotFoundRetryCounter+')',null,null,null );
					mTargetNotFoundRetryCounter++;
					if (peer_id && connect_no_work) {
						connectWithConnectNo(peer_id, connect_no);
					}
				}
			}
			mSendRequestChangeToNegotiationTimeout = setTimeout(run2, 5000);

		} else {
			var buttonNameAndFunctionArray = {};
			buttonNameAndFunctionArray["OK"] = function() {
				var auto_dial = $('#auto_dial').val();
				if (1 == auto_dial) {
					var page_from = $('#page_from').val();
					var url = decodeURIComponent(page_from);
					window.location.href = url;
				}
			};
			createModalDialogWithButtonFunction("お知らせ", data.error, buttonNameAndFunctionArray);
		}
	};

	var errorCallback = function(XMLHttpRequest, textStatus, errorThrown, errorMessage) {
//		alert(errorMessage);
//		alert(XMLHttpRequest);
//		alert(textStatus);
//		alert(errorThrown);
	};

	var completeCallback = function(XMLHttpRequest, textStatus) {
	};

	var data = {
		peer_id : peer_id,
		connect_no : connect_no
		};

	saveWebRtcParam(
		data,
		successCallback,
		errorCallback,
		completeCallback
		);
}

// 商談中画面に遷移
function gotoNegotiation(connection_info_id, connect_no, client_id, peer_id, json) {

	var successCallback = function(data, textStatus, XMLHttpRequest) {
		if ("1" == data.result) {
			meetinGeneralConnection_destroy();
			mReady = false;
			var url = "https://" + location.host + "/negotiation/negotiation";
//			window.open(url, '_blank', 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=no, fullscreen=yes');

			mCloseConnectionInfo = false;
			window.location.href = url;
		} else {
			var buttonNameAndFunctionArray = {};
			buttonNameAndFunctionArray["OK"] = function() {
				var auto_dial = $('#auto_dial').val();
				if (1 == auto_dial) {
					var page_from = $('#page_from').val();
					var url = decodeURIComponent(page_from);
					window.location.href = url;
				}
			};
			createModalDialogWithButtonFunction("お知らせ", data.error, buttonNameAndFunctionArray);
		}

		closeRequestChangeToNegotiationDialog();
	};

	var errorCallback = function(XMLHttpRequest, textStatus, errorThrown, errorMessage) {
//		alert(errorMessage);
//		alert(XMLHttpRequest);
//		alert(textStatus);
//		alert(errorThrown);
	};

	var completeCallback = function(XMLHttpRequest, textStatus) {
	};

	var data = {
		connection_info_id : connection_info_id,
		connect_no : connect_no,
		client_id : client_id,
		peer_id : meetinGeneralConnection_getPeerDataId(),
		target_peer_id : peer_id,
		is_operator : json.is_operator,
		screen_type : json.screen_type,
		user_id : json.user_id,
		user_info : $('#user_info').val(),
		send_bandwidth : mBandwidth,
		receive_bandwidth : mUploadBandwidth
		};

	saveWebRtcParam(
		data,
		successCallback,
		errorCallback,
		completeCallback
		);

}

//////////////////////////////////////////////////////////
// UI関連
//////////////////////////////////////////////////////////
/**
 * 接続中画面表示
 */
function showRequestChangeToNegotiationDialog() {
	// 現在のコネクトフォームを非表示にし、接続中の画面に切り替える
	$("div.mi_connect_circle").hide();
	$("div.mi_guest_background").hide();
	$("div.content_wrap").show();
	$("div.mi_login_btn").hide();
}

/**
 * キャンセル処理
 * @param {*} showDialog
 */
function cancelConncetion(showDialog) {
	if (mConnectionTimeout) {
		clearTimeout(mConnectionTimeout);
		mConnectionTimeout = null;
	}
	if (mTargetNotFoundRetryTimeout) {
		clearTimeout(mTargetNotFoundRetryTimeout);
		mTargetNotFoundRetryTimeout = null;
	}
// タイマー
	if (mSendRequestChangeToNegotiationTimeout) {
		clearTimeout(mSendRequestChangeToNegotiationTimeout);
		mSendRequestChangeToNegotiationTimeout = null;
	}

	meetinGeneralConnection_destroy();
	mReady = false;

	if (showDialog) {
		var buttonNameAndFunctionArray = {};
		buttonNameAndFunctionArray["OK"] = function() {
			// コネクトフォームを元に戻す
			$("div.mi_connect_circle").show();
			$("div.mi_guest_background").show();
			$("div.content_wrap").hide();
			$("div.mi_login_btn").show();

			closeRequestChangeToNegotiationDialog();

			var auto_dial = $('#auto_dial').val();
			if (1 == auto_dial) {
				var page_from = $('#page_from').val();
				var url = decodeURIComponent(page_from);
				window.location.href = url;
			}
		};
TraceLog(null ,null ,10 ,'---[prepare-connection][cancelConncetion]:こちらの番号は只今ご使用できません。',null,null,null );
		createModalDialogWithButtonFunction("お知らせ", "こちらの番号は只今ご使用できません。", buttonNameAndFunctionArray);
	} else {
		// コネクトフォームを元に戻す
		$("div.mi_connect_circle").show();
		$("div.mi_guest_background").show();
		$("div.content_wrap").hide();
		$("div.mi_login_btn").show();

		closeRequestChangeToNegotiationDialog();
	}
}

function closeRequestChangeToNegotiationDialog() {
	$("#modal-content").hide();
}

/**
 * 接続キャンセルクリック
 */
$('#cancel_connection').click(function(){
	if (mPreventCancelClick){
		return;
	}

	mOldConnectionInfoId = mCallConnectionInfoId;
	mOldPeerId = mPeerId;

	sendRequestChangeToNegotiationTimeout(mTargetPeerId);
	cancelConncetion(false);
});

function fetchPost(url, formData)
{
  return fetch(url, {
    method: "POST",
    body: formData,
    credentials: "same-origin",
  })
  .catch(error => console.log('Error:', error))
  .then((response) => {
    if (!response.ok) {
      return Promise.reject(new Error(`${response.status}: ${response.statusText}`));
    } else {
      return response.json();
    }
  });
}

/**
 * 接続ボタンクリック
 */
$('#connect').click(function(){
	showRequestChangeToNegotiationDialog();

	mTargetNotFoundRetryCounter = 0;

	// cookie情報を削除(念のためにゲストログイン時は削除)
	var date = new Date();
	date.setTime( date.getTime() - 1 );
	document.cookie = "connection_staff_type=;expires="+date.toGMTString();
	document.cookie = "connection_staff_id=;expires="+date.toGMTString();
	document.cookie = "connection_client_id=;expires="+date.toGMTString();

	if (!mConnectionTimeout) {
		var run = function() {
			sendRequestChangeToNegotiationTimeout(mTargetPeerId);
//TraceLog(null ,null ,10 ,'---[prepare-connection][#connect]:30,000ms',null,null,null );
			cancelConncetion(true);
		}
		mConnectionTimeout = setTimeout(run, 30000);
	}

	var	run = function() {
		mDataConnectionTryCounter = 0;

		meetinGeneralConnection_destroy();

		// 接続管理の初期化
		mReady = true;
		meetinGeneralConnection_init(
			null,
			peerOpenCallback,
			peerConnectionCallback,
			peerCallCallback,
			peerCloseCallback,
			peerDisconnectedCallback,
			peerErrorCallback,
			dataConnectionDataCallback,
			null,
			dataConnectionCloseCallback,
			dataConnectionErrorCallback,
			null,
			null,
			null
		);
	}

	if (mOldConnectionInfoId && mOldConnectionInfoId.length > 0 && mOldPeerId && mOldPeerId.length) {
		var completeCallback = function(XMLHttpRequest, textStatus) {
			run();
		};

		removePeerIdFromConnectionInfo(
			mOldConnectionInfoId,
			mOldPeerId,
			null,
			null,
			completeCallback
		);
	} else {
		run();
	}
});

/**
 * 接続ボタンクリック(ルーム指定用)
 * index.tpl のcontent_wrapタグは不要なので後で削除する(太田)
 */
$("#connect_room").on('click', function() {

//console.log("ブラウザ=["+ platform.name +"] version=["+ platform.version +"] OS=["+ platform.os +"] version=["+ platform.os.version +"]");
// EdgeはNG
if ( platform.name == 'Microsoft Edge' ) {
	console.log("対処外 ブラウザ=("+ platform.name +")");
	$(".connect_alert").html("ブラウザが対応していません。<br><br>このブラウザでは利用できません。Chrome を利用してアクセスしてください。");
	$(".connect_alert").show();
	setTimeout(function(){
		$(".connect_alert").fadeOut("slow");
		},1500
	);
	return;
}
else if ( platform.name == 'Safari' ) {
	// Safari(※Mac OS以外はNG)
// 	if( platform.os.family == "iOS") {
// 		// 対処外
// //		console.log("対処外 OS family=("+ platform.os.familyos_ver +")");
// 		$(".connect_alert").html("ブラウザが対応していません。<br><br>この環境では利用できません。macOS 10.13.4 の Safari 11.1 以上の環境にてアクセスしてください。");
// 		$(".connect_alert").show();
// 		setTimeout(function(){
// 			$(".connect_alert").fadeOut("slow");
// 			},1500
// 		);
// 		return;
// 	}
	// MacOS 10.13.4 の Safari 11.1 以下は NG
	let os_ver = 0;
	let browser_ver = 0;
	// 例.MacOS 10.13.4 ==> 101304
	//   .Safari 11.1   ==> 110100
	os_ver = parseIntToVersion(platform.os.version);
	browser_ver = parseIntToVersion(platform.version);
// 	if( os_ver < 101304 || browser_ver < 110100 ) {
// 		// バージョン対処外
// //		console.log("対処外 OS ver=("+ os_ver +") browser ver=("+ browser_ver +")");
// 		$(".connect_alert").html("ブラウザが対応していません。<br><br>この環境では利用できません。macOS 10.13.4 の Safari 11.1 以上の環境にてアクセスしてください。");
// 		$(".connect_alert").show();
// 		setTimeout(function(){
// 			$(".connect_alert").fadeOut("slow");
// 			},1500
// 		);
// 		return;
// 	}
}

	// 空欄or半角英数32文字以外はエラー
	var room_name = $("#room_name").val();
	if(room_name.length === 0) {
		$(".connect_alert").text("ルーム名は未入力です");
		$(".connect_alert").show();
		setTimeout(function(){
			$(".connect_alert").fadeOut("slow");
			},1500
		);
		return;
	}
	if(!room_name.match(/^[0-9a-zA-Z\-_]{1,32}$/)) {
		$(".connect_alert").text("ルーム名は半角英数字、アンダーバー(_)、ハイフン(-)の32文字迄です");
		$(".connect_alert").show();
		setTimeout(function(){
			$(".connect_alert").fadeOut("slow");
			},1500
		);
		return;
	}
	// 同席モードの設定
	var roomMode = "";
	if($("#room_mode").prop('checked')){
		// モニタリングするにチェックが入っている場合
		roomMode = "?room_mode=2"
	}
	// MCU 振り分け
	let fd = new FormData();
	fd.append('room_name', room_name);
	fetchPost('/negotiation/get-negotiation-room-type', fd)
	.then((response) => {
//console.log(response);
		let negotiation_room_type = response.data.negotiation_room_type || "0";
		if (negotiation_room_type == "0") {
			// /room/
			window.location.assign(location.protocol + "//" + location.host + "/room/" + room_name + roomMode);
		} else {
			// rooms/
			fetchPost('/negotiation/update-mcu-server', fd)
			.then((response) => {
				window.location.assign(location.protocol + "//" + location.host + "/rooms/" + room_name + roomMode);
			})
			.catch((err) => {
				window.location.assign(location.protocol + "//" + location.host + "/rooms/" + room_name + roomMode);
			});
		}
	})
	.catch((error) => {
console.log(error);
	});

	// ルーム
//	window.location.assign(location.protocol + "//" + location.host + "/room/" + room_name + roomMode);
});

/**
 * 現在未使用(2017/12/07)
 */
function onCanUseWebRTC() {
	mCanUseWebRTC = true;
}

// WebRTCが使えず、かつプラグインがインストールされていない場合
/**
 * 現在未使用(2017/12/07)
 */
function onCannotUseWebRTC() {
	mCanUseWebRTC = false;
	mPreventCancelClick = false;
}

///////////////////////////////////////////////////////////////////////////////////////
// インターフェース
///////////////////////////////////////////////////////////////////////////////////////
/**
 * WebSoket初期化処理
 * @param {*} existPeerId
 * @param {*} peerOpenCallback
 * @param {*} peerConnectionCallback
 * @param {*} peerCallCallback
 * @param {*} peerCloseCallback
 * @param {*} peerDisconnectedCallback
 * @param {*} peerErrorCallback
 * @param {*} dataConnectionDataCallback
 * @param {*} dataConnectionOpenCallback
 * @param {*} dataConnectionCloseCallback
 * @param {*} dataConnectionErrorCallback
 * @param {*} mediaConnectionStreamCallback
 * @param {*} mediaConnectionCloseCallback
 * @param {*} mediaConnectionErrorCallback
 */
function meetinGeneralConnection_init(
		existPeerId,
		peerOpenCallback,
		peerConnectionCallback,
		peerCallCallback,
		peerCloseCallback,
		peerDisconnectedCallback,
		peerErrorCallback,
		dataConnectionDataCallback,
		dataConnectionOpenCallback,
		dataConnectionCloseCallback,
		dataConnectionErrorCallback,
		mediaConnectionStreamCallback,
		mediaConnectionCloseCallback,
		mediaConnectionErrorCallback
	) {
	if (mCanUseWebRTC) {
		mMeetinConnection.init(
			existPeerId,
			peerOpenCallback,
			peerConnectionCallback,
			peerCallCallback,
			peerCloseCallback,
			peerDisconnectedCallback,
			peerErrorCallback,
			dataConnectionDataCallback,
			dataConnectionOpenCallback,
			dataConnectionCloseCallback,
			dataConnectionErrorCallback,
			mediaConnectionStreamCallback,
			mediaConnectionCloseCallback,
			mediaConnectionErrorCallback
		);
	} else {
		var openCallbackWork = function(peerId) {
			if (peerOpenCallback && typeof peerOpenCallback === "function") {
				peerOpenCallback(null, peerId);
			}
		};

		// socket受信
		var messageCallbackWork = function(event, json) {
			if (dataConnectionDataCallback && typeof dataConnectionDataCallback === "function") {
				var data = JSON.stringify(json);
				dataConnectionDataCallback(null, data, mMeetinWebSocket.getPeerId(), json.from_peer_id, null);
			}
		};

		var errorCallbackWork = function(event) {
//			if (peerErrorCallback && typeof peerErrorCallback === "function") {
//				var err = new Error(event);
//				err.type = 'websocket-error';
//				peerErrorCallback(null, err);
//			}
		};

		// socket切断
		var closeCallbackWork = function(event) {
			if (peerErrorCallback && typeof peerErrorCallback === "function") {
				if( event.code != 1000 ) {
					var err = new Error(event);
					err.type = 'websocket-error code=('+event.code+')';
					peerErrorCallback(null, err);
				}
			}

			if (peerCloseCallback && typeof peerCloseCallback === "function") {
				peerCloseCallback();
			}
		};

		// socket接続失敗
		var socketConnectionFailCallbackWork = function(exception, requestPeerId) {
			if (peerErrorCallback && typeof peerErrorCallback === "function") {
				var err = new Error(exception);
				err.type = 'websocket-connection-fail';
				peerErrorCallback(null, err);
			}
		};

		mMeetinWebSocket.init(
			existPeerId,
			null,
			false,
			openCallbackWork,
			messageCallbackWork,
			null,
			errorCallbackWork,
			closeCallbackWork,
			socketConnectionFailCallbackWork
		);
	}
}

/**
 * コネクション(コマンド)破棄処理
 */
function meetinGeneralConnection_destroy() {
	if (mCanUseWebRTC) {
		mMeetinConnection.destroy();
	} else {
		mMeetinWebSocket.destroy();
	}
}

/**
 * コネクション(コマンド)再接続処理
 * 注意：WebSoketの再接続処理は行っていない！！。
 */
function meetinGeneralConnection_peerDataReconnect() {
	if (mCanUseWebRTC) {
		mMeetinConnection.peerDataReconnect();
	}
}

/**
 * コネクション(コマンド)ピアID取得
 * 自分ピアID
 */
function meetinGeneralConnection_getPeerDataId() {
	if (mCanUseWebRTC) {
		return mMeetinConnection.getPeerDataId();
	} else {
		return mMeetinWebSocket.getPeerId();
	}
}

/**
 * 指定されたピアIDへコマンドデータ(JSON形式)を送信する
 * WebSoket通信
 * @param {*} target_peer_id 対象ピアID
 * @param {*} data コマンドデータ
 */
function meetinGeneralConnection_sendCommandToSpecificTargetPeerData(target_peer_id, data) {
//TraceLog(null ,null ,10 ,'---[prepare-connection][sendCommandToSpecificTargetPeerData]:target_peer_id=('+target_peer_id+') data='+JSON.stringify(data),null,null,target_peer_id );
	if (target_peer_id && target_peer_id.length > 0) {
		if (mCanUseWebRTC) {
			return mMeetinConnection.sendCommandToSpecificTargetPeerData(target_peer_id, JSON.stringify(data));
		}
		else {
			// ピアIDが16桁の場合は先頭に’S’を付与する
			if (MEETIN_WEBRTC_PEER_ID_LENGTH == target_peer_id.length) {
				target_peer_id = "S" + target_peer_id;
			}
			data.from_peer_id = mMeetinWebSocket.getPeerId();
			data.to_peer_id = target_peer_id;
//TraceLog(null ,null ,10 ,'---[prepare-connection][sendMessage]:data='+JSON.stringify(data),null,data.from_peer_id,data.to_peer_id );
			return mMeetinWebSocket.sendMessage(JSON.stringify(data));
		}
	}
	// ピアIDがNULLでも送信する
	else {
		// 送信先ピアIDが null の場合も送信する。
		data.from_peer_id = mMeetinWebSocket.getPeerId();
		data.to_peer_id = target_peer_id;
TraceLog(null ,null ,10 ,'★★★[prepare-connection][sendMessage]:target_peer_id=('+target_peer_id+') data='+JSON.stringify(data),data.command,data.from_peer_id,data.to_peer_id );
		return mMeetinWebSocket.sendMessage(JSON.stringify(data));
	}
}

function meetinGeneralConnection_connectDataConnection(
		target_peer_id,
		errorCallback,
		dataConnectionDataCallback,
		dataConnectionOpenCallback,
		dataConnectionCloseCallback,
		dataConnectionErrorCallback
	) {
	if (mCanUseWebRTC) {
		return mMeetinConnection.connectDataConnection(
			target_peer_id,
			errorCallback,
			dataConnectionDataCallback,
			dataConnectionOpenCallback,
			dataConnectionCloseCallback,
			dataConnectionErrorCallback
			);
	} else {
		return null;
	}
}
