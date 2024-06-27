var mIsWebSocketAvaliable = false;
var mCloseConnectionInfo = true;

window.onunload = window.onbeforeunload = function(e) {
	closeConnectionProc(mCloseConnectionInfo);
	mCloseConnectionInfo = true;
};

$(document).ready(function(){
//	checkAndAskForNotificationPermission();

	initWebSocketClient();
});

function connectNoPublish(id) {
	var successCallback = function(data, textStatus, XMLHttpRequest) {
		if ("1" == data.result) {
			var connect_no_original = data.connection_info.connect_no;
			connect_no = connect_no_original.substring(0, 3) + '-' + connect_no_original.substring(3, 7) + '-' + connect_no_original.substring(7, 11);
			
			$('#connection_info_not_published').hide();
			$('#connection_info_published').show();
			$('#connection_info_id').val(data.connection_info.id);
			$('#connect_no_and_type').val(connect_no_original + '-1');
			$('#target_connect_no_and_type').val(connect_no_original + '-0');
			
			if (mIsWebSocketAvaliable) {
				sendAddWebSocketConnection(connect_no);
			} else {
				$('#connect_no').html(connect_no);
			}
			
			var data = {
				connect_no : data.connection_info.connect_no
				};
			
			saveWebRtcParam(
				data,
				null,
				null, 
				null
				);
		} else {
			alert(data.error);
		}
	};

	var errorCallback = function(XMLHttpRequest, textStatus, errorThrown, errorMessage) {
		alert(errorMessage);
		alert(XMLHttpRequest);
		alert(textStatus);
		alert(errorThrown);
	};

	var completeCallback = function(XMLHttpRequest, textStatus) {
	};
	
	createNewConnectionInfo(
		id,
		null,
		$('#client_id').val(),
		$('#staff_type').val(),
		$('#staff_id').val(),
		successCallback,
		errorCallback, 
		completeCallback
		);
}

function saveParam(peer_id) {
	var successCallback = function(data, textStatus, XMLHttpRequest) {
		if ("1" == data.result) {
			$('#peer_id').val(peer_id);
			connectNoPublish(peer_id);
		} else {
			alert(data.error);
		}
	};

	var errorCallback = function(XMLHttpRequest, textStatus, errorThrown, errorMessage) {
		alert(errorMessage);
		alert(XMLHttpRequest);
		alert(textStatus);
		alert(errorThrown);
	};

	var completeCallback = function(XMLHttpRequest, textStatus) {
	};
	
	var data = {
		peer_id : peer_id
		};
	
	saveWebRtcParam(
		data,
		successCallback,
		errorCallback, 
		completeCallback
		);
}

/////////////////
// PeerのCallback
/////////////////

function peerOpenCallback(id) {
	saveParam(id);
}

function peerConnectionCallback(dataConnection) {
	connect(dataConnection, null, runCommandCallback);
}

function peerCallCallback(mediaConnection) {
}

function peerCloseCallback() {
	closeConnectionProc(false);
}

function peerErrorCallback(err) {
	closeConnectionProc(false);
	alert(err.message);
};

/////////////////

function connectNoPublishWithNewPeer() {
	var peerWork = createPeer(
				null,
				peerOpenCallback,
				peerConnectionCallback,
				peerCallCallback,
				peerCloseCallback,
				peerErrorCallback
				);
	
	return peerWork;
}

function onSocketOpenProc(event) {
	mIsWebSocketAvaliable = true;
	$('#connect_no_publish').attr('disabled', '');
}

function onSocketMessageProc(event) {
	var json = JSON.parse(event.data);
	if (json) {
		if (runCommandCallback) {
			runCommandCallback(json);
		}
	} else {
	}
}

function onSocketErrorProc(event) {
	$('#connect_no_publish').attr('disabled', '');
}

function onSocketCloseProc(event) {
}

function runCommandCallback(json) {
	if (json.command === "REQUEST_CHANGE_TO_NEGOTIATION") {
		if (document.hasFocus()) {
		    showConnectionRequestComingDialog(json.user_info);
		} else {
			var onclickCallback = function() {
									window.focus();
									showConnectionRequestComingDialog(json.user_info);
								};
			sendNotification("着信中", json.user_info, null, onclickCallback);
		    showConnectionRequestComingDialog(json.user_info);
		}
	} else if (json.command === "CANCEL_CONNECTION") {
		closeConnectionProc(true);
	} else if (json.command === "ADD_WEBSOCKET_CONNECTION_FINISH") {
		$('#connect_no').html(json.connect_no);
	}
}

function showConnectionRequestComingDialog(user_info) {
	$("#modal-content").show();
	// モーダル内のタグを削除する
	//$("div.inner-wrap").empty();
	// テンプレート生成
	$("div#user_info").text(user_info);
	/*
	var template = '';
	template = template + '<div id="connection_request_comming_dialog">';
	template = template + '<div id="connection_request_comming_dialog_title" class="mi_subtitle" style="font-size: 28px;text-align: center;position:absolute;top: 10%;line-height: 1.8;margin-top: -2.7em;">着信中</div>';
	template = template + '<div id="user_info" class="mi_subtitle" style="font-size: 28px;text-align: center;position:absolute;top: 20%;line-height: 1.8;margin-top: -2.7em;">' + user_info + '</div>';
	template = template + '<img id="connection_request_comming_dialog_face" src="/img/user_face.png" style="position:absolute;top: 20%;"></img>';
	template = template + '<div id="connection_request_comming_dialog_msg" class="mi_subtitle" style="font-size: 18px;text-align: center;position:absolute;top: 70%;line-height: 1.8;margin-top: -2.7em;">ゲストがコンタクトを求めています。</div>';
	template = template + '<a href="javascript:acceptConnectionRequest();" class="btn_link" id="accept_connection_request" style="font-size: 28px;text-align: center;position:absolute;top: 80%;line-height: 1.8;margin-top: -2.7em;">接続</a>';
	template = template + '<a href="javascript:denyConnectionRequest();" class="btn_link" id="deny_connection_request" style="font-size: 28px;text-align: center;position:absolute;top: 90%;line-height: 1.8;margin-top: -2.7em;">接続を拒否する</a>';
	template = template + '</div>';
	$('div.inner-wrap').append(template);
	*/
	// モーダルを表示する為のクリックイベントを発生させる
	$('.modal-open').trigger("click");
}

function acceptConnectionRequest() {
	var successCallback = function(data, textStatus, XMLHttpRequest) {
		if ("1" == data.result) {
			closeConnectionProc(false);
			var url = "https://" + location.host + "/negotiation/negotiation";
//			window.open(url, '_blank', 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=no, fullscreen=yes');
//			window.open(url, '_blank');

			mCloseConnectionInfo = false;
			window.location.href = url;
		} else {
			alert(data.error);
		}
		
		$('#connection_info_not_published').show();
		$('#connection_info_published').hide();
		$("#modal-content").hide();
	};

	var errorCallback = function(XMLHttpRequest, textStatus, errorThrown, errorMessage) {
		alert(errorMessage);
		alert(XMLHttpRequest);
		alert(textStatus);
		alert(errorThrown);
	};

	var completeCallback = function(XMLHttpRequest, textStatus) {
	};
	
	var data = {
		connection_info_id : $('#connection_info_id').val(),
		target_peer_id : $('#target_peer_id').val(),
		operator_peer_id : null,
		user_peer_id : $('#target_peer_id').val(),
		is_operator : 1
		};
	
	saveWebRtcParam(
		data,
		successCallback,
		errorCallback, 
		completeCallback
		);
}

function sendCommandProc(message) {
	if (mIsWebSocketAvaliable) {
		socketSendMessage(message);
	} else {
		sendCommand(message);
	}
}

function sendAddWebSocketConnection(connect_no) {
	var data = {
		command : "ADD_WEBSOCKET_CONNECTION",
		connect_no : connect_no,
		connect_no_and_type : $('#connect_no_and_type').val()
	};
	sendCommandProc(JSON.stringify(data));
}

function sendRemoveWebSocketConnection() {
	var data = {
		command : "REMOVE_WEBSOCKET_CONNECTION",
		connect_no_and_type : $('#connect_no_and_type').val()
	};
	sendCommandProc(JSON.stringify(data));
}

function sendCancelConnection() {
	var data = {
		command : "CANCEL_CONNECTION",
		connection_info_id : $('#connection_info_id').val(),
		peer_id : $('#peer_id').val(),
		target_peer_id : $('#target_peer_id').val(),
		connect_no : $('#connect_no').html(),
		target_connect_no_and_type : $('#target_connect_no_and_type').val()
	};
	sendCommandProc(JSON.stringify(data));
}

function denyConnectionRequest() {

	sendCancelConnection();
	closeConnectionProc(true);
	$('#connection_info_not_published').show();
	$('#connection_info_published').hide();
	$("#modal-content").hide();
}

function closeConnectionProc(isCloseConnectionInfo) {
	if (mIsWebSocketAvaliable) {
		sendRemoveWebSocketConnection();
	}
	closeConnection(isCloseConnectionInfo);
}

// 接続ナンバーを発行する
$('#connect_no_publish').click(function(){
	$(this).html("");
	$(this).html("<div class='lodingimg_efect_wrap connection_number_loding'><div class='lodingimg_efect'></div></div>");

	closeConnectionProc(true);
	
	var run = function() {
		mPeer = connectNoPublishWithNewPeer();
	}
	setTimeout(run, 100);
});

// 再発行
$('#connect_no_republish').click(function(){
	closeConnectionProc(true);

	var run = function() {
		mPeer = connectNoPublishWithNewPeer();
	}
	setTimeout(run, 100);
});

// 接続
$('#accept_connection_request').click(function(){
	acceptConnectionRequest();
});

// 接続を拒否する
$('#deny_connection_request').click(function(){
	denyConnectionRequest();
});
//=============================================================
// クリップボードにコピー
//=============================================================
// コピー領域押下でコピーイベントを発生させる
$(document).on('click', 'div.connection_number', function(){
	// ブラウザのコピー処理を実行する
	document.execCommand("copy");
});
// コピーイベント発生時に実行するイベント発生
document.oncopy = function(event){
	// 通常のコピーイベントをキャンセル
	event.preventDefault();
	// clipboard APIで任意のデータをクリップボードにコピーする
	event.clipboardData.setData('text', $(".connection_number").text());
	alert("コピーしました。");
};