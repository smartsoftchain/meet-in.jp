var mNegotiationMainReconnectDialogId = null;

// 商談管理の初期化
// 引数1：constraints
//        指定するカメラの解像度
function negotiationMainInit(
		exist_peer_id,
		constraints
	) {
	var run = function() {
		mNegotiationMain.init(
			exist_peer_id,
			constraints,
			true,
			initCompleteCallback,
			runCommandAfterConnectionStart,
			peerDataConnectionClose,
			receiveCoreCommand,
			receiveCommonCommand,
			initErrorCallback,
			receiveTargetVideoStream,
			targetVideoStreamClose,
			null,
			receiveTargetAudioStream,
			targetAudioStreamClose,
			null,
			receiveTargetScreenStream,
			targetScreenStreamClose,
			null,
			initCompleteCallback_websocket,
			openCallback_websocket,
			receiveCoreCommand, //coreCommandCallback_websocket,
			receiveCommonCommand, //commonCommandCallback_websocket,
			binaryCallback_websocket,
			errorCallback_websocket,
			closeCallback_websocket,
			socketConnectionFailCallback_websocket
		);
	}
	setTimeout(run, 100);
}

// 商談管理の破棄
function negotiationMainDestroy() {
	mNegotiationMain.destroy(false);
}

// 商談管理の再接続
function negotiationMainReconnect() {
	if (!mNegotiationMainReconnectDialogId) {
		mNegotiationMainReconnectDialogId = createCommonDialogWithButton(
				"再接続",
				"再接続しますか？",
				true,
				true,
				false,
				null,
				null,
				10000000,
				true,
				true,
				"はい",
				function() {
					var successCallback = function(data, textStatus, XMLHttpRequest) {
						if ("1" == data.result) {
//
// 再接続時入室時間は更新しない
//							$('#enter_negotiation_datetime').val(data.datetime);
						}
					};

					var completeCallback = function(XMLHttpRequest, textStatus) {
						// 画面更新せずに再接続
						sendReconnectStart();
						mNegotiationMain.reconnect();
						viewThumbnail();
						mNegotiationMainReconnectDialogId = null;
					};

					getServerDatetime(
						successCallback,
						null,
						completeCallback
					);

				},
				"いいえ",
				function(){
					mNegotiationMainReconnectDialogId = null;
				},
				null,
				null,
				null,
				null,
				null,
				null
			);
	}
	// ページのリロードで再接続する
	//	window.location.reload();
}

// ルーム入室画面へ遷移
function negotiationFinishClick2() {
	$('#button_lock_key').css('display', 'none');
	window.location.href = "https://" + location.host + "/index/room";
}

// 入室時にWebsoket(接続失敗)
function negotiationErrorConvergence() {
	if ( !mNegotiationMainReconnectDialogId ) {
		var message = "";
		message += "<br>ただいま混みあっており繋がりにくなっております。";
		message += "<br>";
		message += "<br>お手数ですがしばらくしてから入室して下さい。";
		message += "<br>";
		message += "<br>一度ルームを退出いたします。";

		var buttonNameAndFunctionArray = {};
		buttonNameAndFunctionArray["OK"] = function() {
			negotiationFinishClick2();
		};

		mNegotiationMainReconnectDialogId = createCommonDialog(
			"サーバー接続エラー(web-socket-error)",	// title
			message,	// message
			true,		// modal(true/false)
			true,		// draggable
			false,		// resizable
			null,		// height
			440,		// width
			buttonNameAndFunctionArray,		// buttonNameAndFunctionArray
			true,		// autoOkButtonWhenNoButtonDefined
			true		// closeWhenButtonPressed
		);
	}
}


function negotiationFinishClick() {
	mNegotiationMainReconnectDialogId = null;
	// 商談終了
	$('#sp_negotiation_finish').trigger('click');
}

// 商談管理の再接続(接続エラー用)
function negotiationErrorReconnect() {

	// 汎用モーダルを　WebSocketエラーテンプレートに変形.
	$("#modal-content").show();
	$("div.inner-wrap").empty();
	$('div.inner-wrap').append(Handlebars.compile($('#web-socket-error-modal-template').html()));
	// モーダルを表示する為のクリックイベントを発生させる
	$('.modal-open').trigger("click");

}

// 初期化・再接続が完了したときの処理
// 引数1：connection_info
//        connection_infoテーブルのレコード
// 引数2：videoStream
//        自分のカメラのメディアストリーム
// 引数3：audioStream
//        自分のマイクのメディアストリーム
// 引数4：screenStream
//        自分の画面共有のメディアストリーム
function initCompleteCallback(peerId, connection_info, videoStream, audioStream, screenStream, videoStreamError, audioStreamError, screenStreamError) {
	var connection_info_id = $('#connection_info_id').val();
	var user_id = $('#user_id').val();

//console.log("誰かが入室したか、切断されたと思う！！ peerId=["+peerId+"] connection_info_id=("+connection_info.id+")");

	// 接続開始日時を設定
	if ((0 == user_id)
		&& (window.performance.navigation.type != window.performance.navigation.TYPE_RELOAD)
		) {
		startConnectionInfo(
			connection_info_id,
			null,
			null,
			null
			);
	}
	NEGOTIATION.displayTime();

	// 名刺アイコンを復帰
	var staff_type = $.cookie()["staff_type"];
	var staff_id = $.cookie()["staff_id"];
	var client_id = $.cookie()["client_id"];

//	console.log(JSON.stringify(staff_type) + ':' + JSON.stringify(staff_id) + ':' + JSON.stringify(client_id)  + ':' + JSON.stringify(user_id));
	if(staff_type != null && staff_id != null && client_id != null) {
		$('#staff_type').val(staff_type);
		$('#staff_id').val(staff_id);
		$('#client_id').val(client_id);
		sendLogin();
		// 情報更新
		mNegotiationMain.setUserInfo($('#my_user_info').val());
		sendSystemInfoDetail(null);
		// ユーザー一覧の自分の名前更新
		var video_list = $('#video_list_' + user_id);
		video_list.find('.user_name').text($('#my_user_info').val());
	}

	// 各メディアストリームを画面に設定する
	if($("#room_mode").val() == ROOM_MODE_1){
		receiveMyVideoStream(videoStream, videoStreamError);
		receiveMyAudioStream(audioStream, audioStreamError);
		receiveMyScreenStream(screenStream, screenStreamError);
	
		for (var i = 1; i <= MEETIN_MAIN_MAX_PEOPLE; ++i) {
			LayoutCtrl.enterRoom(i,DEFAULT_USER_NAME,NEGOTIATION.videoArray);
		}
		for (var i = 1; i <= MEETIN_MAIN_MAX_PEOPLE; ++i) {
			if (i != user_id) {
				LayoutCtrl.exitRoom(i,NEGOTIATION.videoArray);
			}
		}
		LayoutCtrl.apiSetVideo(NEGOTIATION.showVideoMode,NEGOTIATION.videoArray.show,NEGOTIATION.videoArray.hide);
	}else{
		// 明示的にマイクをOFFにする
		micOff();
		NEGOTIATION.isMyMicOn = false;
		// マイクとビデオ状態の更新
		NEGOTIATION.updateStatusVideoAudio();
	}

	// レイアウトの準備が完了したので、準備中画面を非表示にする
	$("div.content_wrap").hide();

	recommendEnvironmentAlert(); // 非推奨環境を使用時、アラートを表示する(非同期処理のネット回線速度測定含む).

//	createModalOkDialog("帯域幅(kbps)", '上り：' + $('#send_bandwidth').val() + '(kbps), 下り：' + $('#receive_bandwidth').val() + '(kbps)');

/*
	// ネット回線のアップロード速度
	var send_bandwidth = $('#send_bandwidth').val();

	// ネット回線のダウンロード速度
	var receive_bandwidth = $('#receive_bandwidth').val();

	var report = checkBandwidthState(send_bandwidth, receive_bandwidth);
	var title = "自分のネット回線状況";
	createCheckBandwidthStateReportDialog(report, title);
*/
};

function initCompleteCallback_websocket(peerId, connection_info) {
	var connection_info_id = $('#connection_info_id').val();
	var user_id = $('#user_id').val();

	// ブラウザがIEかSafariの場合、自分のカメラのビデオフレームをドラッグできないようにする
	// セキュリティパネルが操作できないための対策

	// Safariを除外
	if (USER_PARAM_BROWSER === 'IE') {
	// if ((USER_PARAM_BROWSER === 'Safari')
	// 	|| (USER_PARAM_BROWSER === 'IE')
	// ) {
		$('#negotiation_target_video_relative_' + user_id).show();
		$('#negotiation_target_video_relative_no_video_' + user_id).hide();
	}

	// 接続開始日時を設定
	if ((0 == user_id)
		&& (window.performance.navigation.type != window.performance.navigation.TYPE_RELOAD)
		) {
		startConnectionInfo(
			connection_info_id,
			null,
			null,
			null
			);
	}
	NEGOTIATION.displayTime();

	// ゲストは常にオペレーターが先頭で後は入室順。オペレータ自身は入室順の一番最後に自分を追加する
	// チャット内のユーザーのビデオをONにする とても汚いが、構造上仕方がないらしい　オペはかならずいるがビデオの順番的にIFで導入タイミングをずらす //todo いつかリメイクしたい
	for (var i = 0; i < MEETIN_MAIN_MAX_PEOPLE; ++i) {
		LayoutCtrl.enterRoom(i,DEFAULT_USER_NAME,NEGOTIATION.videoArray);
	}
	for (var i = 0; i < MEETIN_MAIN_MAX_PEOPLE; ++i) {
		if (i != user_id) {
			LayoutCtrl.exitRoom(i,NEGOTIATION.videoArray);
		}
	}
	LayoutCtrl.apiSetVideo(NEGOTIATION.showVideoMode,NEGOTIATION.videoArray.show,NEGOTIATION.videoArray.hide);

	// レイアウトの準備が完了したので、準備中画面を非表示にする
	$("div.content_wrap").hide();
};

// 初期化にエラーが起きたときの処理
// 引数1：err
//        エラー
function initErrorCallback(err) {
	// 再接続
	if (err.type === 'network') {
//		onReconnectBegin();
	}
	// 想定外の状況で接続が切れた
	else if (err.type === 'peer-close-in-unexpected-situation') {
//		showIsReEnterDialog();
	}
	// WebSocketサーバーとの接続が切れたときに再接続する
	else if (err.type === 'web-socket-error') {
		negotiationErrorReconnect();
	}
	// WebSocket接続時にpeerid-updateに失敗した場合
	else if (err.type === 'peerid-update') {
		negotiationErrorReconnect();
	}
};

function binaryCallback_websocket(event) {
	document.getElementById('video_share_screen_image').src = (URL || WebKit).createObjectURL(event.data);

	NEGOTIATION.mIsScreenOn = true;
	$('#close_share_screen_btn').hide();

	// 画面設定
	$('#negotiation_share_screen').show();
	LayoutCtrl.apiMoveAllVideoFrameToHeader();
};

function errorCallback_websocket(event) {
};

function closeCallback_websocket(event) {
	if (USER_PARAM_BROWSER === 'IE') {
		NEGOTIATION.mIsShowConfirmLeaveDialog = false;
		window.location.reload();
	}
};

function socketConnectionFailCallback_websocket(exception, requestPeerId) {
};

// 接続先のピアと接続が確立したときの処理
// 引数1：dataConnection
//        PeerJSのDataConnection
//        http://nttcom.github.io/skyway/docs/#dataconnection
function runCommandAfterConnectionStart(dataConnection, myPeerId, targetPeerId, connectionId) {
	$('#connection_state').attr('class', 'icon-pc mi_default_label_icon_3 mi_active');
}

function openCallback_websocket(myPeerId) {
	$('#peer_id').val(myPeerId);
	$('#connection_state').attr('class', 'icon-pc mi_default_label_icon_3 mi_active');
}

function peerDataConnectionClose(dataConnection, userId, myPeerId, targetPeerId, connectionId) {

	var video = document.getElementById('video_target_video_' + userId);
	if (video) {
		if (!video.paused) {
			video.pause();
			video.currentTime -= 0.1;
		}
	}

	if ($('#video_target_video_' + userId)) {
		$('#video_target_video_' + userId).hide();
		$('#video_target_connecting_' + userId).show();
	}

	video = document.getElementById('video_share_screen');
	if (video) {
		if (!video.paused) {
			video.pause();
			video.currentTime -= 0.1;
		}
	}

	$('#video_share_screen').hide();
	$('#video_share_screen_connecting').show();
}