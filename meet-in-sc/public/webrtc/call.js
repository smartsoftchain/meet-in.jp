// js読み込み
document.write('<script src="/webrtc/SIPml-api.js?svn=251" type="text/javascript"></script>');

// 基本情報設定
var sTransferNumber;
var oRingTone, oRingbackTone;
var oSipStack, oSipSessionRegister, oSipSessionCall, oSipSessionTransferCall;
var videoRemote, videoLocal, audioRemote;
var bFullScreen = false;
var oNotifICall;
var bDisableVideo = false;
var viewVideoLocal, viewVideoRemote, viewLocalScreencast; // <video> (webrtc) or <div> (webrtc4all)
var oConfigCall;
var oReadyStateTimer;
// エキスパート設定
var txtWebsocketServerUrl;

C =
{
	divKeyPadWidth: 220
};

window.onload = function () {
	// 基本情報用処理
	window.console && window.console.info && window.console.info("location=" + window.location);

	videoLocal = document.getElementById("video_local");
	videoRemote = document.getElementById("video_remote");
	audioRemote = document.getElementById("audio_remote");

	document.onkeyup = onKeyUp;
	document.body.onkeyup = onKeyUp;
	//divCallCtrl.onmousemove = onDivCallCtrlMouseMove;

	var getPVal = function (PName) {
		var query = window.location.search.substring(1);
		var vars = query.split('&');
		for (var i = 0; i < vars.length; i++) {
			var pair = vars[i].split('=');
			if (decodeURIComponent(pair[0]) === PName) {
				return decodeURIComponent(pair[1]);
			}
		}
		return null;
	}

	var preInit = function () {
		// webrtcのデフォルト設定(初期化前)
		var s_webrtc_type = getPVal("wt");
		var s_fps = getPVal("fps");
		var s_mvs = getPVal("mvs"); 	// maxVideoSize
		var s_mbwu = getPVal("mbwu"); 	// maxBandwidthUp (kbps)
		var s_mbwd = getPVal("mbwd"); 	// maxBandwidthUp (kbps)
		var s_za = getPVal("za"); 		// ZeroArtifacts
		var s_ndb = getPVal("ndb"); 	// NativeDebug

		if (s_webrtc_type) SIPml.setWebRtcType(s_webrtc_type);

		// SIPML5の初期化
		SIPml.init(postInit);

		// 初期化後のその他オプション設定
		if (s_fps) SIPml.setFps(parseFloat(s_fps));
		if (s_mvs) SIPml.setMaxVideoSize(s_mvs);
		if (s_mbwu) SIPml.setMaxBandwidthUp(parseFloat(s_mbwu));
		if (s_mbwd) SIPml.setMaxBandwidthDown(parseFloat(s_mbwd));
		if (s_za) SIPml.setZeroArtifacts(s_za === "true");
		if (s_ndb == "true") SIPml.startNativeDebug();
	}

	oReadyStateTimer = setInterval(function () {
		if (document.readyState === "complete") {
			clearInterval(oReadyStateTimer);
			// initialize SIPML5
			preInit();
		}
	},
	500);
	
	// エキスパート用処理
	txtWebsocketServerUrl = document.getElementById("txtWebsocketServerUrl");
	
	// 自動ログインを実行
	setTimeout(function(){
		sipRegister();
	},500);
};

function postInit() {
	// WebRTCのサポートを確認します
	if (!SIPml.isWebRtcSupported()) {
		// chromeチェック
		if (SIPml.getNavigatorFriendlyName() == 'chrome') {
			if (confirm("WebRTCが有効になっていません。WebRTCを有効にする方法を確認しますか？")) {
				window.location = 'http://www.webrtc.org/running-the-demos';
			}else {
				window.location = "index.html";
			}
			return;
		}else {
			if (confirm("WebRTCの拡張機能がインストールされていません。インストール後再起動しますが、インストールを行いますか？")) {
				window.location = 'https://github.com/sarandogou/webrtc-everywhere';
			}
		}
	}

	// WebRTCのサポートチェック
	if (!SIPml.isWebSocketSupported()) {
		if (confirm('お使いのブラウザはWebSocketをサポートしていません。WebSocket対応ブラザをダウンロードしますか？')) {
			window.location = 'https://www.google.com/intl/en/chrome/browser/';
		}else {
			window.location = "index.html";
		}
		return;
	}

	// FIXME: displays must be per session
	viewVideoLocal = videoLocal;
	viewVideoRemote = videoRemote;

	if (!SIPml.isWebRtcSupported()) {
		if (confirm('お使いのブラウザはWebRTCをサポートしていません。WebRTC対応ブラザをダウンロードしますか？')) {
			window.location = 'https://www.google.com/intl/en/chrome/browser/';
		}
	}

	document.body.style.cursor = 'default';
	oConfigCall = {
		audio_remote: audioRemote,
		video_local: null,
		video_remote: null,
		screencast_window_id: 0x00000000, // entire desktop
		bandwidth: { audio: undefined, video: undefined },
		video_size: { minWidth: undefined, minHeight: undefined, maxWidth: undefined, maxHeight: undefined },
		events_listener: { events: '*', listener: onSipEventSession },
		sip_caps: [
						{ name: '+g.oma.sip-im' },
						{ name: 'language', value: '\"en,fr\"' }
		]
	};
}

function saveCallOptions() {
	if (window.localStorage) {
		window.localStorage.setItem('org.doubango.call.phone_number', txtPhoneNumber.value);
		window.localStorage.setItem('org.doubango.expert.disable_video', bDisableVideo ? "true" : "false");
	}
}

// SIPスタック開始処理(sends SIP REGISTER request to login)
function sipRegister() {
	// IEの為の例外処理(catch exception for IE (DOM not ready))
	try {
		// enable notifications if not already done
		if (window.webkitNotifications && window.webkitNotifications.checkPermission() != 0) {
			window.webkitNotifications.requestPermission();
		}

		// debug level
		SIPml.setDebugLevel("error");

		// create SIP stack
		oSipStack = new SIPml.Stack({
			realm: txtRealm.value,										// Realm					基本設定
			impi: txtPrivateIdentity.value,								// Private Identity			基本設定
			impu: txtPublicIdentity.value,								// Public Identity			基本設定
			password: txtPassword.value,								// Password					基本設定
			display_name: txtDisplayName.value,							// Display Name				基本設定
			websocket_proxy_url: txtWebsocketServerUrl.value,			// WebSocket Server URL		エキスパートモード
			outbound_proxy_url: null,									// SIP outbound Proxy URL	エキスパートモード
			ice_servers: null,											// ICE Servers URL			エキスパートモード
			enable_rtcweb_breaker: false,								// Enable RTCWeb Breaker	エキスパートモード
			events_listener: { events: '*', listener: onSipEventStack },
			enable_early_ims: true, 									// Disable 3GPP Early IMS	エキスパートモード(Must be true unless you're using a real IMS network)
			enable_media_stream_cache: false,							// Cache the media stream	エキスパートモード
			bandwidth: null, 											// Max bandwidth (kbps)		エキスパートモード(could be redefined a session-level)
			video_size: null, 											// Video size				エキスパートモード(could be redefined a session-level)
			sip_headers: [
					{ name: 'User-Agent', value: 'IM-client/OMA1.0 sipML5-v1.2016.03.04' },
					{ name: 'Organization', value: 'Doubango Telecom' }
			]
		}
		);
		if (oSipStack.start() != 0) {
			txtRegStatus.innerHTML = '<b>SIPスタックの起動に失敗しました</b>';
		}
		else return;
	}
	catch (e) {
		txtRegStatus.innerHTML = "<b>:" + e + "</b>";
	}
}

// SIPスタック終了処理(sends SIP REGISTER (expires=0) to logout)
function sipUnRegister() {
	if (oSipStack) {
		oSipStack.stop(); // shutdown all sessions
	}
}

// 通話開始処理(makes a call (SIP INVITE))
function sipCall(s_type) {
	if (oSipStack && !oSipSessionCall && !tsk_string_is_null_or_empty(txtPhoneNumber.value)) {
		if (s_type == 'call-screenshare') {
			if (!SIPml.isScreenShareSupported()) {
				alert('スクリーン共有はサポートされていません。あたなはchrome 26+?を使用しています');
				return;
			}
			if (!location.protocol.match('https')) {
				if (confirm("画面共有はhttpsを必要とします。")) {
					sipUnRegister();
					window.location = 'https://ns313841.ovh.net/call.htm';
				}
				return;
			}
		}

		if (window.localStorage) {
			oConfigCall.bandwidth = tsk_string_to_object(window.localStorage.getItem('org.doubango.expert.bandwidth')); // already defined at stack-level but redifined to use latest values
			oConfigCall.video_size = tsk_string_to_object(window.localStorage.getItem('org.doubango.expert.video_size')); // already defined at stack-level but redifined to use latest values
		}

		// create call session
		oSipSessionCall = oSipStack.newSession(s_type, oConfigCall);
		// make call
		if (oSipSessionCall.call(txtPhoneNumber.value) != 0) {
			oSipSessionCall = null;
			txtCallStatus.value = 'Failed to make call';
			return;
		}
		saveCallOptions();
	}else if (oSipSessionCall) {
		txtCallStatus.innerHTML = '<i>Connecting...</i>';
		oSipSessionCall.accept(oConfigCall);
	}
	// 発信開始
	if(typeof webRtcStartInCall == "function") {
		webRtcStartInCall();
	}
}

// holds or resumes the call
function sipToggleHoldResume() {
	if (oSipSessionCall) {
		var i_ret;
		txtCallStatus.innerHTML = oSipSessionCall.bHeld ? '<i>Resuming the call...</i>' : '<i>Holding the call...</i>';
		i_ret = oSipSessionCall.bHeld ? oSipSessionCall.resume() : oSipSessionCall.hold();
		if (i_ret != 0) {
			txtCallStatus.innerHTML = '<i>Hold / Resume failed</i>';
			return;
		}
	}
}

// Mute or Unmute the call
function sipToggleMute() {
	if (oSipSessionCall) {
		var i_ret;
		var bMute = !oSipSessionCall.bMute;
		txtCallStatus.innerHTML = bMute ? '<i>Mute the call...</i>' : '<i>Unmute the call...</i>';
		i_ret = oSipSessionCall.mute('audio'/*could be 'video'*/, bMute);
		if (i_ret != 0) {
			txtCallStatus.innerHTML = '<i>Mute / Unmute failed</i>';
			return;
		}
		oSipSessionCall.bMute = bMute;
	}
}

// terminates the call (SIP BYE or CANCEL)
function sipHangUp() {
	if (oSipSessionCall) {
		txtCallStatus.innerHTML = '<i>Terminating the call...</i>';
		oSipSessionCall.hangup({ events_listener: { events: '*', listener: onSipEventSession } });
	}
}

function sipSendDTMF(c) {
	if (oSipSessionCall && c) {
		if (oSipSessionCall.dtmf(c) == 0) {
			try { dtmfTone.play(); } catch (e) { }
		}
	}
}

function startRingTone() {
	try { ringtone.play(); }
	catch (e) { }
}

function stopRingTone() {
	try { ringtone.pause(); }
	catch (e) { }
}

function startRingbackTone() {
	try { ringbacktone.play(); }
	catch (e) { }
}

function stopRingbackTone() {
	try { ringbacktone.pause(); }
	catch (e) { }
}

function fullScreen(b_fs) {
	bFullScreen = b_fs;
	if (tsk_utils_have_webrtc4native() && bFullScreen && videoRemote.webkitSupportsFullscreen) {
		if (bFullScreen) {
			videoRemote.webkitEnterFullScreen();
		}
		else {
			videoRemote.webkitExitFullscreen();
		}
	}
	else {
		if (tsk_utils_have_webrtc4npapi()) {
			try { if (window.__o_display_remote) window.__o_display_remote.setFullScreen(b_fs); }
			catch (e) { divVideo.setAttribute("class", b_fs ? "full-screen" : "normal-screen"); }
		}
	}
}

function showNotifICall(s_number) {
	// permission already asked when we registered
	if (window.webkitNotifications && window.webkitNotifications.checkPermission() == 0) {
		if (oNotifICall) {
			oNotifICall.cancel();
		}
		oNotifICall = window.webkitNotifications.createNotification('images/sipml-34x39.png', 'Incaming call', 'Incoming call from ' + s_number);
		oNotifICall.onclose = function () { oNotifICall = null; };
		oNotifICall.show();
	}
}

function onKeyUp(evt) {
	evt = (evt || window.event);
	if (evt.keyCode == 27) {
		fullScreen(false);
	}
	else if (evt.ctrlKey && evt.shiftKey) { // CTRL + SHIFT
		if (evt.keyCode == 65 || evt.keyCode == 86) { // A (65) or V (86)
			bDisableVideo = (evt.keyCode == 65);
			txtCallStatus.innerHTML = '<i>Video ' + (bDisableVideo ? 'disabled' : 'enabled') + '</i>';
			window.localStorage.setItem('org.doubango.expert.disable_video', bDisableVideo);
		}
	}
}

function uiCallTerminated(s_description) {
	if (window.btnBFCP) window.btnBFCP.disabled = true;

	oSipSessionCall = null;

	stopRingbackTone();
	stopRingTone();

	txtCallStatus.innerHTML = "<i>" + s_description + "</i>";

	if (oNotifICall) {
		oNotifICall.cancel();
		oNotifICall = null;
	}

	setTimeout(function () { if (!oSipSessionCall) txtCallStatus.innerHTML = ''; }, 2500);
}

// SIPスタックのコールバック関数(Callback function for SIP Stacks)
function onSipEventStack(e /*SIPml.Stack.Event*/) {
	tsk_utils_log_info('==stack event = ' + e.type);
	switch (e.type) {
		case 'started':
			{
				// catch exception for IE (DOM not ready)
				try {
					// LogIn (REGISTER) as soon as the stack finish starting
					oSipSessionRegister = this.newSession('register', {
						expires: 200,
						events_listener: { events: '*', listener: onSipEventSession },
						sip_caps: [
									{ name: '+g.oma.sip-im', value: null },
									//{ name: '+sip.ice' }, // rfc5768: FIXME doesn't work with Polycom TelePresence
									{ name: '+audio', value: null },
									{ name: 'language', value: '\"en,fr\"' }
						]
					});
					oSipSessionRegister.register();
				}
				catch (e) {
					txtRegStatus.value = txtRegStatus.innerHTML = "<b>1:" + e + "</b>";
				}
				break;
			}
		case 'stopping': case 'stopped': case 'failed_to_start': case 'failed_to_stop':
			{
				var bFailure = (e.type == 'failed_to_start') || (e.type == 'failed_to_stop');
				oSipStack = null;
				oSipSessionRegister = null;
				oSipSessionCall = null;

				stopRingbackTone();
				stopRingTone();

				txtCallStatus.innerHTML = '';
				txtRegStatus.innerHTML = bFailure ? "<i>Disconnected: <b>" + e.description + "</b></i>" : "<i>Disconnected</i>";
				break;
			}

		case 'i_new_call':
			{
				if (oSipSessionCall) {
					// do not accept the incoming call if we're already 'in call'
					e.newSession.hangup(); // comment this line for multi-line support
				}
				else {
					oSipSessionCall = e.newSession;
					// start listening for events
					oSipSessionCall.setConfiguration(oConfigCall);

					startRingTone();

					var sRemoteNumber = (oSipSessionCall.getRemoteFriendlyName() || 'unknown');
					txtCallStatus.innerHTML = "<i>Incoming call from [<b>" + sRemoteNumber + "</b>]</i>";
					showNotifICall(sRemoteNumber);
					// 着信時の処理
					if(typeof webRtcIncomingCall == "function"){
							webRtcIncomingCall();
					}
				}
				break;
			}

		case 'm_permission_requested':
			{
				break;
			}
		case 'm_permission_accepted':
		case 'm_permission_refused':
			{
				if (e.type == 'm_permission_refused') {
					uiCallTerminated('Media stream permission denied');
				}
				break;
			}

		case 'starting': default: break;
	}
};

// SIPセッションのコールバック関数(Callback function for SIP sessions (INVITE, REGISTER, MESSAGE...))
function onSipEventSession(e /* SIPml.Session.Event */) {
	tsk_utils_log_info('==session event = ' + e.type);

	switch (e.type) {
		case 'connecting': case 'connected':
			{
				var bConnected = (e.type == 'connected');
				if (e.session == oSipSessionRegister) {
					txtRegStatus.innerHTML = "<i>" + e.description + "</i>";
				}
				else if (e.session == oSipSessionCall) {
					if (window.btnBFCP) window.btnBFCP.disabled = false;

					if (bConnected) {
						stopRingbackTone();
						stopRingTone();

						if (oNotifICall) {
							oNotifICall.cancel();
							oNotifICall = null;
						}
					}

					txtCallStatus.innerHTML = "<i>" + e.description + "</i>";

					if (SIPml.isWebRtc4AllSupported()) { // IE don't provide stream callback
					}
				}
				break;
			} // 'connecting' | 'connected'
		case 'terminating': case 'terminated':
			{
				// 電話が切られた処理
				if(typeof webRtcHangUp == "function"){
					webRtcHangUp();
				}
				if (e.session == oSipSessionRegister) {

					oSipSessionCall = null;
					oSipSessionRegister = null;

					txtRegStatus.innerHTML = "<i>" + e.description + "</i>";
				}
				else if (e.session == oSipSessionCall) {
					uiCallTerminated(e.description);
				}
				break;
			} // 'terminating' | 'terminated'

		case 'm_stream_video_local_added':
			{
				if (e.session == oSipSessionCall) {
				}
				break;
			}
		case 'm_stream_video_local_removed':
			{
				if (e.session == oSipSessionCall) {
				}
				break;
			}
		case 'm_stream_video_remote_added':
			{
				if (e.session == oSipSessionCall) {
				}
				break;
			}
		case 'm_stream_video_remote_removed':
			{
				if (e.session == oSipSessionCall) {
				}
				break;
			}

		case 'm_stream_audio_local_added':
		case 'm_stream_audio_local_removed':
		case 'm_stream_audio_remote_added':
		case 'm_stream_audio_remote_removed':
			{
				break;
			}

		case 'i_ect_new_call':
			{
				oSipSessionTransferCall = e.session;
				break;
			}

		case 'i_ao_request':
			{
				if (e.session == oSipSessionCall) {
					var iSipResponseCode = e.getSipResponseCode();
					if (iSipResponseCode == 180 || iSipResponseCode == 183) {
						startRingbackTone();
						txtCallStatus.innerHTML = '<i>Remote ringing...</i>';
					}
				}
				break;
			}

		case 'm_early_media':
			{
				if (e.session == oSipSessionCall) {
					stopRingbackTone();
					stopRingTone();
					txtCallStatus.innerHTML = '<i>Early media started</i>';
				}
				break;
			}

		case 'm_local_hold_ok':
			{
				if (e.session == oSipSessionCall) {
					if (oSipSessionCall.bTransfering) {
						oSipSessionCall.bTransfering = false;
						// this.AVSession.TransferCall(this.transferUri);
					}
					txtCallStatus.innerHTML = '<i>Call placed on hold</i>';
					oSipSessionCall.bHeld = true;
				}
				break;
			}
		case 'm_local_hold_nok':
			{
				if (e.session == oSipSessionCall) {
					oSipSessionCall.bTransfering = false;
					txtCallStatus.innerHTML = '<i>Failed to place remote party on hold</i>';
				}
				break;
			}
		case 'm_local_resume_ok':
			{
				if (e.session == oSipSessionCall) {
					oSipSessionCall.bTransfering = false;
					txtCallStatus.innerHTML = '<i>Call taken off hold</i>';
					oSipSessionCall.bHeld = false;

					if (SIPml.isWebRtc4AllSupported()) { // IE don't provide stream callback yet
					}
				}
				break;
			}
		case 'm_local_resume_nok':
			{
				if (e.session == oSipSessionCall) {
					oSipSessionCall.bTransfering = false;
					txtCallStatus.innerHTML = '<i>Failed to unhold call</i>';
				}
				break;
			}
		case 'm_remote_hold':
			{
				if (e.session == oSipSessionCall) {
					txtCallStatus.innerHTML = '<i>Placed on hold by remote party</i>';
				}
				break;
			}
		case 'm_remote_resume':
			{
				if (e.session == oSipSessionCall) {
					txtCallStatus.innerHTML = '<i>Taken off hold by remote party</i>';
				}
				break;
			}
		case 'm_bfcp_info':
			{
				if (e.session == oSipSessionCall) {
					txtCallStatus.innerHTML = 'BFCP Info: <i>' + e.description + '</i>';
				}
				break;
			}

		case 'o_ect_trying':
			{
				if (e.session == oSipSessionCall) {
					txtCallStatus.innerHTML = '<i>Call transfer in progress...</i>';
				}
				break;
			}
		case 'o_ect_accepted':
			{
				if (e.session == oSipSessionCall) {
					txtCallStatus.innerHTML = '<i>Call transfer accepted</i>';
				}
				break;
			}
		case 'o_ect_completed':
		case 'i_ect_completed':
			{
				if (e.session == oSipSessionCall) {
					txtCallStatus.innerHTML = '<i>Call transfer completed</i>';
					if (oSipSessionTransferCall) {
						oSipSessionCall = oSipSessionTransferCall;
					}
					oSipSessionTransferCall = null;
				}
				break;
			}
		case 'o_ect_failed':
		case 'i_ect_failed':
			{
				if (e.session == oSipSessionCall) {
					txtCallStatus.innerHTML = '<i>Call transfer failed</i>';
				}
				break;
			}
		case 'o_ect_notify':
		case 'i_ect_notify':
			{
				if (e.session == oSipSessionCall) {
					txtCallStatus.innerHTML = "<i>Call Transfer: <b>" + e.getSipResponseCode() + " " + e.description + "</b></i>";
					if (e.getSipResponseCode() >= 300) {
						if (oSipSessionCall.bHeld) {
							oSipSessionCall.resume();
						}
					}
				}
				break;
			}
		case 'i_ect_requested':
			{
				if (e.session == oSipSessionCall) {
					var s_message = "Do you accept call transfer to [" + e.getTransferDestinationFriendlyName() + "]?";//FIXME
					if (confirm(s_message)) {
						txtCallStatus.innerHTML = "<i>Call transfer in progress...</i>";
						oSipSessionCall.acceptTransfer();
						break;
					}
					oSipSessionCall.rejectTransfer();
				}
				break;
			}
	}
}

/**
 * 現在通話中か判定する
 * @returns {Boolean}
 */
function isCall(){
	var result = false;
	if(oSipSessionCall){
		result = true;
	}
	return result;
}

//現在の画面から離れようとした場合
window.onbeforeunload = function(event){
	if($("#webphone_type").val() == "2" && isCall()){
		// webRtcで通話中に画面を遷移した場合は通話を切る
		sipHangUp();
	}
}
