const DEBUG_LEVEL = 0;

const SHOW_MEETIN_UTILITY_LOG = false;

// Compatibility shim
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

// var mediaDevices = navigator.mediaDevices || ((navigator.mozGetUserMedia || navigator.webkitGetUserMedia || navigator.msGetUserMedia) ? {
//     getUserMedia(c) {
//         return new Promise(((y, n) => {
//             (navigator.mozGetUserMedia || navigator.webkitGetUserMedia).call(navigator, c, y, n);
//         }));
//     }
// } : null);

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
	if (peer_id) {
		// PeerJS object
		peer = new Peer(
					peer_id, 
					{
						key: window.__SKYWAY_KEY__, 
						debug: DEBUG_LEVEL
					}
				);
	} else {
		// PeerJS object
		peer = new Peer(
					{
						key: window.__SKYWAY_KEY__, 
						debug: DEBUG_LEVEL
					}
				);
	}
	
	if (SHOW_MEETIN_UTILITY_LOG) {
		if (peer) {
			console.log('[MeetinUtility][createPeer][success]');
		} else {
			console.log('[MeetinUtility][createPeer][error]:peer = null');
		}
	}
	
	if (!peer) {
		return null;
	}
	
	peer.on('open', function(id){
		if (openCallback && typeof openCallback === "function") {
			openCallback(id);
		}
	});

	peer.on('connection', function(dataConnection){
		if (connectionCallback && typeof connectionCallback === "function") {
			connectionCallback(dataConnection);
		}
	});

	peer.on('call', function(mediaConnection){
		if (callCallback && typeof callCallback === "function") {
			callCallback(mediaConnection);
		}
	});

	peer.on('close', function(){
		if (closeCallback && typeof closeCallback === "function") {
			closeCallback();
		}
	});

	peer.on('disconnected', function(){
		if (disconnectedCallback && typeof disconnectedCallback === "function") {
			disconnectedCallback();
		}
	});

	peer.on('error', function(err){
		if (errorCallback && typeof errorCallback === "function") {
			errorCallback(err);
		}
	});

	return peer;
}

// Peerの破棄
function destroyPeer(peer) {
	if (!!peer && !peer.destroyed) {
		if (SHOW_MEETIN_UTILITY_LOG) {
			console.log('[MeetinUtility][destroyPeer]:Peer = ' + peer.id);
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
							console.log('[MeetinUtility][closePeerConnection]:Peer = ' + peer.id + ', Connection = ' + connection.id + ', Connection peer = ' + connection.peer + ', Connection type = ' + connection.type);
						}
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
						console.log('[MeetinUtility][closePeerConnectionToSpecificPeerId]:Peer = ' + peer.id + ', Connection = ' + connection.id + ', Connection peer = ' + connection.peer + ', Connection type = ' + connection.type);
					}
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
							console.log('[MeetinUtility][sendCommandToAllPeer][DataConnection][send]:My Peer = ' + peer.id + ' -> Connection = ' + connection.id + ' -> Target Peer = ' + key + ', data = ' + command);
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
						console.log('[MeetinUtility][sendCommandToSpecificPeerId][DataConnection][send]:My Peer = ' + peer.id + ' -> Connection = ' + connection.id + ' -> Target Peer = ' + target_peer_id + ', data = ' + command);
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
//      console.debug("Could not find the m line for", media);
    return sdp;
  }
//    console.debug("Found the m line for", media, "at line", line);
 
  // Pass the m line
  line++;
 
  // Skip i and c lines
  while(lines[line].indexOf("i=") === 0 || lines[line].indexOf("c=") === 0) {
    line++;
  }
 
  // If we're on a b line, replace it
  if (lines[line].indexOf("b") === 0) {
//      console.debug("Replaced b line at line", line);
    lines[line] = "b=AS:"+bitrate;
    return lines.join("\n");
  }
  
  // Add a new b line
//    console.debug("Adding new b line before line", line);
  var newLines = lines.slice(0, line)
  newLines.push("b=AS:"+bitrate)
  newLines = newLines.concat(lines.slice(line, lines.length))
  return newLines.join("\n")
};

const videoSelect = $('#videoSource');
const selectors = [videoSelect];

function createMediaStream(config, successCallback, errorCallback) {
	if (SHOW_MEETIN_UTILITY_LOG) {
		console.log('[MeetinUtility][createMediaStream]:config = ' + JSON.stringify(config));
	}

	if (USER_PARAM_BROWSER === 'Safari') {
//console.log('Safari');
		if( config.video ) {
			// video
//console.log('video:true');
			// width/heightを指定すると対応していいない解像度のカメラが認識されないので
			// width/heightを指定を削除する
			// 現状Safariの場合(2018/09月時点で)、frameRateも対応していないため削除する
			delete config.video["width"];
			delete config.video["height"];
			delete config.video["frameRate"];

			// モバイル対応
			// iPhoneの場合、デバイスID(video_id)指定での切り替えは行えないため
			if( USER_PARAM_IS_MOBILE ) {
//console.log('video:MOBILE');
				delete config.video["deviceId"];
			}
			else {
//console.log('video:PC');
				if( !config.video.deviceId ) {
					// カメラの指定がない場合
					config = {audio: false, video: true};
				}
			}
//console.log('config = ' + JSON.stringify(config));
		}
		else {
			// audio
//console.log('audio:true');
			if( !config.audio.deviceId ) {
				config = {audio: true, video: false};
			}
		}
	}
	else {
//console.log('not Safari');
		if( config.video ) {
			// video
			// width/heightを指定すると対応していいない解像度のカメラが認識されないので
			// width/heightを指定を削除する
//console.log('video:true');
			delete config.video["width"];
			delete config.video["height"];
			if( !config.video.deviceId ) {
				if( !config.video.frameRate ) {
					config = {audio: false, video: true};
				}
			}
//console.log('config = ' + JSON.stringify(config));
		}
		else {
			// audio
//console.log('audio:true');
			if( !config.audio.deviceId ) {
				config = {audio: true, video: false};
			}
		}
	}

	// ローリングメッセージ表示(開始)
	show_loding_label(config);

// 	if (SHOW_MEETIN_UTILITY_LOG) {
// 		console.time('stream');
// 	}
	navigator.mediaDevices.getUserMedia(config)
	.then(function(stream) {
		if (SHOW_MEETIN_UTILITY_LOG) {
//			console.timeEnd('stream');
			if (stream) {
				console.log('[MeetinUtility][createMediaStream][success]:stream = ' + stream.id);
			} else {
				console.log('[MeetinUtility][createMediaStream][success]:stream = null');
			}
		}

		// ローリングメッセージ終了(終了)
		hide_loding_label();
		if (successCallback && typeof successCallback === "function") {
			successCallback(stream);
		}
	})
	.catch(function(error) {
		if (SHOW_MEETIN_UTILITY_LOG) {
//			console.timeEnd('stream');
			if (error) {
				console.log('[MeetinUtility][createMediaStream][error]:error = ' + error);
			} else {
				console.log('[MeetinUtility][createMediaStream][error]');
			}
		}
		// ローリングメッセージ終了(終了)
		hide_loding_label();
		if (errorCallback && typeof errorCallback === "function") {
			errorCallback(error);
		}
	});
};

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

