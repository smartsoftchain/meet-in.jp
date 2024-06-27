const DEBUG_LEVEL = 0;

const SHOW_MEETIN_UTILITY_LOG = false;

const RTCNT = 5;

//カスタムイベント発火のため生成
const roomConnectionEvent = document.createElement('button');

// Compatibility shim
//navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
navigator.mediaDevices = navigator.mediaDevices || ((navigator.mozGetUserMedia || navigator.webkitGetUserMedia) ? {
	getUserMedia: function(c) {
		return new Promise(function(y, n) {
			(navigator.mozGetUserMedia || navigator.webkitGetUserMedia).call(navigator, c, y, n);
		});
	}
} : null);

// Peerの作成
function createPeer(
	peer_id,
	openCallback,
	connectionCallback,
	callCallback,
	closeCallback,
	disconnectedCallback,
	errorCallback
	) {
	var peer = null;
	try {
		if (peer_id) {
			peer = new Peer(peer_id,
				{
					// key: window.__SKYWAY_KEY__,
					key: getSkywayKey(),
					debug: DEBUG_LEVEL
				}
			);
		} else {
			peer = new Peer(
				{
					// key: window.__SKYWAY_KEY__,
					key: getSkywayKey(),
					debug: DEBUG_LEVEL
				}
			);
		}
	} catch( e ) {
		ErrorLog( $('#connection_info_id').val() ,$('#Room_name').val() ,$('#user_id').val() ,1
				 ,$('#peer_id').val(),"createPeer Peer" ,e.stack);
		if (SHOW_MEETIN_UTILITY_LOG) {
			clientLog('ERROR', e.stack);
		}
	}

	if (SHOW_MEETIN_UTILITY_LOG) {
		if (peer) {
			clientLog('INFO', '[MeetinUtility][createPeer][success]');
		} else {
			clientLog('ERROR', '[MeetinUtility][createPeer][error]:peer = null');
		}
	}

	if (!peer) {
		return null;
	}

// var meetinU_getPeerConnection = 0;
	peer.on('open', function(id){
		if (SHOW_MEETIN_UTILITY_LOG) {
			clientLog('INFO', '[MeetinUtility][peer][open] id=('+ id +')');
		}
console.log("peer::open");
		if (openCallback && typeof openCallback === "function") {
			openCallback(id);
		}
	});

	peer.on('connection', function(dataConnection){
		if (SHOW_MEETIN_UTILITY_LOG) {
			clientLog('INFO', '[MeetinUtility][peer][connection]');
		}
console.log("peer::connection");
		if (connectionCallback && typeof connectionCallback === "function") {
			connectionCallback(dataConnection);
		}
	});

	peer.on('call', function(mediaConnection){
		if (SHOW_MEETIN_UTILITY_LOG) {
			clientLog('INFO', '[MeetinUtility][peer][call]');
		}
		if (callCallback && typeof callCallback === "function") {
			callCallback(mediaConnection);
		}
console.log("peer::Call");

		// 統計情報(経路情報)取得
		try {
			RTCStatsSync(mediaConnection);
		} catch( e ) {
			console.log("ERROR :: "+ e.stack);
		}
	});

	peer.on('close', function(){
		if (SHOW_MEETIN_UTILITY_LOG) {
			clientLog('INFO', '[MeetinUtility][peer][close]');
		}
console.log("peer::close");
		if (closeCallback && typeof closeCallback === "function") {
			closeCallback();
		}
		const peerId = $('#peer_id').val();

		// 相手に退室orリダイレクトしたこと送る（挙手ツールチップで使用していたpeerIdが使えなくなるため）
		var data = {
			command: "CLOSE_CONNECTION",
			type: "CLOSE_CONNECTION"
		}
		sendCommand(SEND_TARGET_ALL, data);

	});

	peer.on('disconnected', function(){
		if (SHOW_MEETIN_UTILITY_LOG) {
			clientLog('INFO', '[MeetinUtility][peer][disconnected]');
		}
console.log("peer::disconnected");
		if (disconnectedCallback && typeof disconnectedCallback === "function") {
			disconnectedCallback();
		}
	});

	peer.on('error', function(err){
		ErrorLog( $('#connection_info_id').val() ,$('#Room_name').val() ,$('#user_id').val() ,2 ,$('#peer_id').val(), err.type, err);
		if (SHOW_MEETIN_UTILITY_LOG) {
			clientLog('ERROR', '[MeetinUtility][peer][error] err.type=('+ err.type +') err=('+ err +')');
		}
console.log("peer::Error");
		if (errorCallback && typeof errorCallback === "function") {
			errorCallback(err);
		}
	});

	return peer;
}

function getSkywayKey() {
	var key = window.__SKYWAY_KEY__;

    var dt = new Date();
    var enter_negotiation_datetime = $('#enter_negotiation_datetime').val();
    if( !enter_negotiation_datetime ) {
        dt = new Date(enter_negotiation_datetime);
    }
    // 日替わりをAM4:00にするため4h減算
    dt.setHours(dt.getHours() - 4); //4時間前

	// 一定間隔(7日毎)でSKYWAY_KEYを変更する
	switch(Math.floor(dt.getDate()/7)) {
		case 0:
			key = window.__SKYWAY_KEY1__;
			break;
		case 1:
			key = window.__SKYWAY_KEY2__;
			break;
		case 2:
			key = window.__SKYWAY_KEY3__;
			break;
		case 3:
			key = window.__SKYWAY_KEY4__;
			break;
		case 4:
			key = window.__SKYWAY_KEY5__;
			break;
		default:
			key = window.__SKYWAY_KEY__;
	}
	return key;
}

// Peerの破棄
function destroyPeer(peer) {
	if (!!peer && !peer.destroyed) {
		if (SHOW_MEETIN_UTILITY_LOG) {
			clientLog('DEBUG', '[MeetinUtility][destroyPeer]:Peer = ' + peer.id);
		}
		peer.destroy();
	}
}

// すべてのPeerとの接続を切断
function closePeerConnection(peer) {
	if (peer) {
		for (var key in peer.connections) {
			var connections = peer.connections[key];
			if (connections) {
				for (var i = 0, ii = connections.length; i < ii; i += 1) {
					var connection = connections[i];
					if (connection) {
						if (SHOW_MEETIN_UTILITY_LOG) {
							clientLog('DEBUG', '[MeetinUtility][closePeerConnection]:Peer = ' + peer.id + ', Connection = ' + connection.id + ', Connection peer = ' + connection.peer + ', Connection type = ' + connection.type);
						}
console.log('closePeerConnection::Close');
						connection.close();
					}
				}
			}
		}
	}
}

// 特定なPeerとの接続を切断
function closePeerConnectionToSpecificPeerId(peer, target_peer_id) {
	if (peer) {
		var connections = peer.connections[target_peer_id];
		if (connections) {
			for (var i = 0, ii = connections.length; i < ii; i += 1) {
				var connection = connections[i];
				if (connection) {
					if (SHOW_MEETIN_UTILITY_LOG) {
						clientLog('DEBUG', '[MeetinUtility][closePeerConnectionToSpecificPeerId]:Peer = ' + peer.id + ', Connection = ' + connection.id + ', Connection peer = ' + connection.peer + ', Connection type = ' + connection.type);
					}
console.log('closePeerConnectionToSpecificPeerId::Close');
					connection.close();
				}
			}
//			delete peer.connections[target_peer_id];
		}
	}
}

// すべてのPeerにメッセージを送る
function sendCommandToAllPeer(peer, command) {

	var send_target_array = new Array();

	if (peer && !peer.disconnected && !peer.destroyed) {
		for (var key in peer.connections) {
			var connections = peer.connections[key];
			var send = false;
			if (connections) {
				for (var i = 0, ii = connections.length; i < ii; i += 1) {
					var connection = connections[i];
					if (connection && connection.open && connection.label === 'command') {
						connection.send(command);
						send = true;
						if (SHOW_MEETIN_UTILITY_LOG) {
							clientLog('DEBUG', '[MeetinUtility][sendCommandToAllPeer][DataConnection][send]:My Peer = ' + peer.id + ' -> Connection = ' + connection.id + ' -> Target Peer = ' + key + ', data = ' + command);
						}
					}
				}
			}
			if (send) {
				send_target_array.push(key);
			}
		}
	}
	return send_target_array;
}


// 特定なPeerにメッセージを送る
function sendCommandToSpecificPeerId(peer, command, target_peer_id) {

	if (!target_peer_id) {
		return false;
	}

	if (target_peer_id.length < 1) {
		return false;
	}

	var result = false;
	if (peer && !peer.disconnected && !peer.destroyed) {
		var connections = peer.connections[target_peer_id];
		if (connections) {
			for (var i = 0, ii = connections.length; i < ii; i += 1) {
				var connection = connections[i];
				if (connection && connection.open && connection.label === 'command') {
					connection.send(command);
					result = true;
					if (SHOW_MEETIN_UTILITY_LOG) {
						clientLog('DEBUG', '[MeetinUtility][sendCommandToSpecificPeerId][DataConnection][send]:My Peer = ' + peer.id + ' -> Connection = ' + connection.id + ' -> Target Peer = ' + target_peer_id + ', data = ' + command);
					}
				}
			}
		}
	}
	return result;
}

function createBandwidthSdp(sdp, media, bitrate) {
  var lines = sdp.split("\n");
  var line = -1;
  for (var i = 0; i < lines.length; i++) {
    if (lines[i].indexOf("m="+media) === 0) {
      line = i;
      break;
    }
  }
  if (line === -1) {
    return sdp;
  }

  // Pass the m line
  line++;

  // Skip i and c lines
  while(lines[line].indexOf("i=") === 0 || lines[line].indexOf("c=") === 0) {
    line++;
  }

  // If we're on a b line, replace it
  if (lines[line].indexOf("b") === 0) {
    lines[line] = "b=AS:"+bitrate;
    return lines.join("\n");
  }

  // Add a new b line
  // console.debug("Adding new b line before line", line);
  var newLines = lines.slice(0, line)
  newLines.push("b=AS:"+bitrate)
  newLines = newLines.concat(lines.slice(line, lines.length))
  return newLines.join("\n")
};

const videoSelect = $('#videoSource');
const selectors = [videoSelect];

function createMediaStream(config, successCallback, errorCallback) {
	if (SHOW_MEETIN_UTILITY_LOG) {
		clientLog('DEBUG', '[MeetinUtility][createMediaStream]:config = ' + JSON.stringify(config));
	}

	// URLパラメータを取得し、同席モードかを判定する
	// 同席モードの場合はガメラ＆マイクデバイスへのアクセスは行わない
	var param = getParams();
//	console.log( param );
	if( param.length != 0 ) {
		if(param.room_mode !== undefined && param.room_mode !== null){
			if( param.room_mode == '2' ) { // 同席モード
				console.log( "★★★同席モード" );

				// iOS11からSafariオーディオデバイスの仕様が変わった為、自動再生が行えない！
				// ■オーディオデバイスへのアクセス許可
				// そのため、同席モード時はマイクは使用しないがオーディオデバイスへのアクセス許可を
				// とる必要があるため、一度オーディオデバイスへアクセス(Open)し、即クローズを行う。
				if (USER_PARAM_BROWSER === 'Safari') {
					if( !config.video ) {
						// オーディオアクセス許可
						allowed_audio(config);
						if (successCallback && typeof successCallback === "function") {
							successCallback(null);
						}
						return;
					}
				}
				// Chrome(Satari以外)
				// または、Safariのカメラ
				if (successCallback && typeof successCallback === "function") {
					successCallback(null);
				}
				return;
			}
		}
	}

	if (USER_PARAM_BROWSER === 'Safari') {
		if( config.video ) {
			// 映像(video)
			// PC:現状Safariの場合(2018/11月時点で)、deviceIdを指定するとカメラが認識されないため削除しておく
			// モバイル対応：iPhoneの場合、デバイスID(video_id)指定での切り替えは行えないため
			delete config.video["deviceId"];
console.log('Safari video config = ' + JSON.stringify(config));
		}
		else {
			// 映像以外(audio:音声)※音声のオプションは変更しない！！
console.log('Safari audio config = ' + JSON.stringify(config));
		}
	}
	else if(USER_PARAM_BROWSER === 'Edge') {
		if( config.video ) {
console.log('Edge::video config = ' + JSON.stringify(config));
		}
		else {
			// 映像以外(audio:音声)※音声のオプションは変更しない！！
console.log('Edge::audio config = ' + JSON.stringify(config));
		}
	}
	else {
		if( config.video ) {
			// 映像(video)
console.log('video config = ' + JSON.stringify(config));
		}
		else {
			// 映像以外(audio:音声)※音声のオプションは変更しない！！
console.log('audio config = ' + JSON.stringify(config));
		}
	}

	// ローリングメッセージ表示(開始)
	show_loding_label(config);

	navigator.mediaDevices.getUserMedia(config)
	.then(function(stream) {
		if (SHOW_MEETIN_UTILITY_LOG) {
			if (stream) {
				clientLog('INFO', '[MeetinUtility][createMediaStream][success]:stream = ' + stream.id);
			} else {
				clientLog('INFO', '[MeetinUtility][createMediaStream][success]:stream = null');
			}
		}

		// ローリングメッセージ終了(終了)
		hide_loding_label();
		if (successCallback && typeof successCallback === "function") {
			successCallback(stream);
		}
	})
	.catch(function(error) {
		out_error_log(error, config);

		//
		// AbortError :ハードウェアの問題
		// NotAllowedError :ユーザーは、現在のブラウザインスタンスのアクセス要求を拒否し、
		//					アクセス拒否または現在のセッションのユーザー、拒否またはユーザーは、
		//					グローバルにすべてのメディアへのアクセスを要求します。
		// NotFoundError :リクエストパラメータを満たすために、メディアの種類を見つけることができません。
		// NotReadableError :オペレーティングシステム、Webブラウザやデバイスの発生のレベルの
		//					ハードウェア・エラーがアクセスすることができません。
		// OverConstrainedError :指定された要件は、デバイスを満たすことができません。
		// SecurityError :セキュリティエラー、 getUserMedia()呼び出されたDocument
		//				  上記、デバイスメディアの使用は禁止されています。
		//				  このメカニズムをオンまたはオフにするかどうかは、個々のユーザーの設定に依存します。
		//

		// ユーザ拒否の場合(リトライなし)
		// 大文字小文字を無視(全て大文字)
		if( error && error.name ) {
			if( error.name.toUpperCase() == "NotAllowedError".toUpperCase() ) {
				// ローリングメッセージ終了(終了)
				hide_loding_label();
				if (errorCallback && typeof errorCallback === "function") {
					errorCallback(error);
				}
				return;
			}
		}

		//----------------------------------------------------
		// コンフィグを変えて再取得してみる
		//
		var retry_config;
		if( config.video ) {
			retry_config = {audio: false, video: true};
			if( USER_PARAM_IS_MOBILE ) {		// モバイル
				if( config.video.facingMode ) {	// カメラ指定あり
					retry_config = { audio: false, video: { facingMode: "user" } };
				}
			}
		}
		else {
			retry_config = {audio: true, video: false};
		}
		if (SHOW_MEETIN_UTILITY_LOG) {
			clientLog('INFO', '[MeetinUtility][createMediaStream][success]:retry_config=' + JSON.stringify(retry_config));
		}

		navigator.mediaDevices.getUserMedia(retry_config)
		.then(function(stream) {
			if (SHOW_MEETIN_UTILITY_LOG) {
				if (stream) {
					clientLog('DEBUG', '[MeetinUtility][createMediaStream][success]:stream = ' + stream.id);
				} else {
					clientLog('DEBUG', '[MeetinUtility][createMediaStream][success]:stream = null');
				}
			}
			var msg = "success::";
			msg += ' config=' + JSON.stringify(retry_config);
			ErrorLog( $('#connection_info_id').val() ,$('#Room_name').val() ,$('#user_id').val() ,0 ,$('#peer_id').val() ,"MeetinUtility::createMediaStream"  ,msg);

			// ローリングメッセージ終了(終了)
			hide_loding_label();
			if (successCallback && typeof successCallback === "function") {
				successCallback(stream);
			}
		})
		.catch(function(error) {
			out_error_log(error, retry_config);
			// ローリングメッセージ終了(終了)
			hide_loding_label();
			if (errorCallback && typeof errorCallback === "function") {
				errorCallback(error);
			}
		});
	});
};

// オーディオデバイス許可(同席モード用)
function allowed_audio() {
	const config = {audio: true, video: false};
	// オーディオアクセス許可
	navigator.mediaDevices.getUserMedia(config)
	.then(function(stream) {
console.log('Safari video OK');
		// マイクをミュートする
		stream.getAudioTracks()[0].enabled = false;
	})
	.catch(function(error) {
console.log('Safari video NG');
	});
}

// エラー出力
//
function out_error_log(error, config) {
	var msg = "";
	if ( error ) {
		msg = 'error=' + error;
	} else {
		msg = 'error';
	}
	msg += ' config=' + JSON.stringify(config);
	ErrorLog( $('#connection_info_id').val() ,$('#Room_name').val() ,$('#user_id').val() ,0 ,$('#peer_id').val() ,"MeetinUtility::createMediaStream"  ,msg);
	if (SHOW_MEETIN_UTILITY_LOG) {
		clientLog('ERROR', '[MeetinUtility][createMediaStream][error] msg=[' + msg + ']');
	}
}

// デバイスの取得状態をローリング中に表示する
// videoとaudio
function show_loding_label(config) {
	if( $('#conect_text_id').size() ){
		$("#conect_text_id").empty()
		if( config.video ) {
			$("#conect_text_id").prepend('カメラ接続中です。<br>少々お待ちください。');
		}
		else {
			$("#conect_text_id").prepend("オーディオ接続中です。<br>少々お待ちください。");
		}
	}
}

// ローディング中のデバイス取得状態を非表示にする
// 準備中に戻す
function hide_loding_label() {
	if( $('#conect_text_id').size() ){
		$("#conect_text_id").empty()
		$("#conect_text_id").prepend("準備中です。<br>少々お待ちください。");
	}
}

// 帯域状況を分析
function checkBandwidthState(sendBandwidth, receiveBandwidth) {
	var report = {};

	report.sendBandwidth = sendBandwidth;
	report.receiveBandwidth = receiveBandwidth;

	// 推奨アップロード速度
	report.recommandSendBandwidth = (MEETIN_MAIN_MAX_VIDEO_SEND_BANDWIDTH + MEETIN_MAIN_MAX_AUDIO_SEND_BANDWIDTH + MEETIN_MAIN_MAX_SCREEN_SEND_BANDWIDTH) * (MEETIN_MAIN_MAX_PEOPLE - 1) + MEETIN_MAIN_DATA_BANDWIDTH;

	// 推奨ダウンロード速度
	report.recommandReceiveBandwidth = (MEETIN_MAIN_MAX_VIDEO_RECEIVE_BANDWIDTH + MEETIN_MAIN_MAX_AUDIO_RECEIVE_BANDWIDTH) * (MEETIN_MAIN_MAX_PEOPLE - 1) + MEETIN_MAIN_MAX_SCREEN_RECEIVE_BANDWIDTH + MEETIN_MAIN_DATA_BANDWIDTH;

	// 最低限のアップロード速度
	report.minSendBandwidth = (MEETIN_MAIN_MIN_VIDEO_SEND_BANDWIDTH + MEETIN_MAIN_MIN_AUDIO_SEND_BANDWIDTH + MEETIN_MAIN_MIN_SCREEN_SEND_BANDWIDTH) * (MEETIN_MAIN_MAX_PEOPLE - 1) + MEETIN_MAIN_DATA_BANDWIDTH;

	// 最低限のダウンロード速度
	report.minReceiveBandwidth = (MEETIN_MAIN_MIN_VIDEO_RECEIVE_BANDWIDTH + MEETIN_MAIN_MIN_AUDIO_RECEIVE_BANDWIDTH) * (MEETIN_MAIN_MAX_PEOPLE - 1) + MEETIN_MAIN_MIN_SCREEN_RECEIVE_BANDWIDTH + MEETIN_MAIN_DATA_BANDWIDTH;

	var maxGuest = MEETIN_MAIN_MAX_PEOPLE;
	var sendClear = true;
	var receiveClear = true;
	if (sendBandwidth < report.recommandSendBandwidth) {
		for (var i = 0; i < MEETIN_MAIN_MAX_PEOPLE; ++i) {
			var minSendBandwidthNeed = (MEETIN_MAIN_MAX_VIDEO_SEND_BANDWIDTH + MEETIN_MAIN_MAX_AUDIO_SEND_BANDWIDTH + MEETIN_MAIN_MAX_SCREEN_SEND_BANDWIDTH) * i + MEETIN_MAIN_DATA_BANDWIDTH;
			if (minSendBandwidthNeed > sendBandwidth) {
				if (i < maxGuest) {
					maxGuest = i;
				}
				sendClear = false;
				break;
			}
		}
	}

	if (receiveBandwidth < report.recommandReceiveBandwidth) {
		for (var i = 0; i < MEETIN_MAIN_MAX_PEOPLE; ++i) {
			var minReceiveBandwidthNeed = (MEETIN_MAIN_MAX_VIDEO_RECEIVE_BANDWIDTH + MEETIN_MAIN_MAX_AUDIO_RECEIVE_BANDWIDTH) * i + MEETIN_MAIN_MAX_SCREEN_RECEIVE_BANDWIDTH + MEETIN_MAIN_DATA_BANDWIDTH;
			if (minReceiveBandwidthNeed > receiveBandwidth) {
				if (i < maxGuest) {
					maxGuest = i;
				}
				receiveClear = false;
				break;
			}
		}
	}
	if (!sendClear || !receiveClear) {
		report.recommandMaxPeople = (maxGuest + 1);
	}
	return report;
}

// 帯域状況を分析
function createCheckBandwidthStateReportDialog(report, title) {
	var message = "";
	message += "ネット回線のアップロード速度：" + report.sendBandwidth + "(kbps)";
	message += "<br>" + "ネット回線のダウンロード速度：" + report.receiveBandwidth + "(kbps)";
	message += "<br>";
	message += "<br>" + MEETIN_MAIN_MAX_PEOPLE + "人商談の推奨アップロード速度：" + report.recommandSendBandwidth + "(kbps)";
	message += "<br>" + MEETIN_MAIN_MAX_PEOPLE + "人商談の推奨ダウンロード速度：" + report.recommandReceiveBandwidth + "(kbps)";
	message += "<br>";
	message += "<br>" + MEETIN_MAIN_MAX_PEOPLE + "人商談の最低限のアップロード速度：" + report.minSendBandwidth + "(kbps)";
	message += "<br>" + MEETIN_MAIN_MAX_PEOPLE + "人商談の最低限のダウンロード速度：" + report.minReceiveBandwidth + "(kbps)";
	message += "<br>";

	if (report.recommandMaxPeople) {
		message += '<br><FONT color="red">' + report.recommandMaxPeople + "人以上の商談では接続・映像・音声が不安定になる可能性があります。</FONT>";
	}

	var dialogId = createCommonDialogWithButton(
						title,
						message,
						true,
						true,
						false,
						null,
						550,
						null,
						true,
						true,
						"OK",
						function(){},
						null,
						null,
						null,
						null,
						null,
						null,
						null,
						null
					);
}

function getSendBandwidthLevel() {
	if(('localStorage' in window) && (window.localStorage !== null)) {
		var bandwidth_level = localStorage.getItem('send_bandwidth_level');

		if (!bandwidth_level || bandwidth_level.length < 1) {
			return DEFAULT_SEND_BANDWIDTH_LEVEL;
		}

		return bandwidth_level;
	}
	return DEFAULT_SEND_BANDWIDTH_LEVEL;
}

function getReceiveBandwidthLevel() {
	if(('localStorage' in window) && (window.localStorage !== null)) {
		var bandwidth_level = localStorage.getItem('receive_bandwidth_level');

		if (!bandwidth_level || bandwidth_level.length < 1) {
			return DEFAULT_RECEIVE_BANDWIDTH_LEVEL;
		}
		return bandwidth_level;
	}
	return DEFAULT_RECEIVE_BANDWIDTH_LEVEL;
}

function exitFullscreen() {
	document.exitFullscreen = document.exitFullscreen || document.cancelFullScreen || document.mozCancelFullScreen || document.webkitCancelFullScreen || document.msExitFullscreen;
	if(document.exitFullscreen) {
		document.exitFullscreen();
	}
}

function getParams(){
	const params = location.href;
	const regex = /[?&]([^=#]+)=([^&#]*)/g;
	const params_obj = {};
	let match;
	while(match = regex.exec(params)){
		params_obj[match[1]] = match[2];
	}
	return params_obj;
}
