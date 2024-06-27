/**
 * 架電開始/架電停止を通知するDOM
 * このDOMから架電のstart/stopイベントを通知する
 */
const scCallEvent = document.createElement('button');
// 架電開始イベントを発行する
scCallEvent.callStartEvent = (myStream, yourStream) => {
	const event = new CustomEvent('start', {
		detail: {
			myStream: myStream,
			yourStream: yourStream
		}
	});
	scCallEvent.dispatchEvent(event);
};
// 架電終了イベントを発行する
scCallEvent.callStopEvent = () => {
	const event = new CustomEvent('stop');
	scCallEvent.dispatchEvent(event);
};
// ダイヤルパッド保留イベントを発行する
scCallEvent.dialPadOnHold = () => {
	const event = new CustomEvent('dialpad_onhold');
	scCallEvent.dispatchEvent(event);
};


// js読み込み
document.write('<script src="/webrtc/src/jssip.min.js" type="text/javascript"></script>');

// 基本情報設定
var sTransferNumber;
var oRingTone, oRingbackTone;
var oSipStack, oSipSessionRegister, oSipSessionCall, oSipSessionTransferCall;
var audioRemote;
var bFullScreen = false;
var oNotifICall;
var bDisableVideo = false;
var viewVideoLocal, viewVideoRemote, viewLocalScreencast; // <video> (webrtc) or <div> (webrtc4all)
var oConfigCall;
var oReadyStateTimer;


var WebphoneUserAgent;
var WebphoneSession;
var IncommingSession;

// エキスパート設定
var txtWebsocketServerUrl;


function createRandomToken(size, base) {
	var i, r,
		token = '';

	base = base || 32;

	for( i=0; i < size; i++ ) {
		r = Math.random() * base|0;
		token += r.toString(base);
	}
	return token;
}

window.onload = function () {
	audioRemote = document.getElementById("audio_remote");

	// エキスパート用処理
	txtWebsocketServerUrl = document.getElementById("txtWebsocketServerUrl");

	// 自動ログインを実行
	setTimeout(function(){
		console.log("自動ログインを実行");
		sipRegister();
	},500);


};

// SIPスタック開始処理(sends SIP REGISTER request to login)
function sipRegister() {
	// webhoneが設定されていないアカウントは判別しない
	// IEの為の例外処理(catch exception for IE (DOM not ready))
	try {
		// webhoneが設定されていない場合はWebSocket接続行わないようにする
		if(txtPassword.value != '' && txtPrivateIdentity.value != '5000'){
			console.log("webhone設定判別_OK");
			// enable notifications if not already done
			if (window.webkitNotifications && window.webkitNotifications.checkPermission() != 0) {
				window.webkitNotifications.requestPermission();
			}

			var via_host = createRandomToken(12) + '.invalid';

			WebphoneUserAgent = new JsSIP.UA({
				sockets: [
					new JsSIP.WebSocketInterface(txtWebsocketServerUrl.value)
				],
				uri: txtPublicIdentity.value,
				contact_uri: (new JsSIP.URI('sip', txtPrivateIdentity.value, via_host, null, {transport: 'wss'})).toString(),
				display_name: txtPrivateIdentity.value,
				password: txtPassword.value,
				session_timers: false,
				connection_recovery_min_interval: 3600,
				connection_recovery_max_interval: 7200,
			});

			var referrer = "referrer: " + document.referrer;
			var locationUrl = "locationUrl: " + location.href ;

			// 接続開始
			WebphoneUserAgent.on('connecting', function(data){
				// 接続に関してのログを取得しサーバーへ残す
				var message = "WebSocket接続";
				console.log(data);
				callJsConnectionInfo(message, referrer, txtPublicIdentity.value, txtPhoneNumber.value, locationUrl, data);
			});
			// 切断
			WebphoneUserAgent.on('disconnected', function(data){
				// 切断に関してのログを取得しサーバーへ残す
				var message = "WebSocket切断";
				console.log(data);
				callJsConnectionInfo(message, referrer, txtPublicIdentity.value, txtPhoneNumber.value, locationUrl, data);
			});
			// sip接続完了
			WebphoneUserAgent.on('registered', function(data){
				// sip接続完了に関してのログを取得しサーバーへ残す
				var message = "sip接続完了";
				console.log(data);
				callJsConnectionInfo(message, referrer, txtPublicIdentity.value, txtPhoneNumber.value, locationUrl, data);
			});
			// sip接続中止
			WebphoneUserAgent.on('unregistered', function(data){
				// sip接続中止に関してのログを取得しサーバーへ残す
				var message = "sip接続中止";
				console.log(data);
				callJsConnectionInfo(message, referrer, txtPublicIdentity.value, txtPhoneNumber.value, locationUrl, data);
			});
			// 電話サーバーとの接続に失敗
			WebphoneUserAgent.on("registrationFailed", function(data) {
				alert("電話サーバーとの接続に失敗しました。\nパスワードが間違って設定されている可能性がありますので、\n管理者にお問い合わせください。");
				// sip接続失敗に関してのログを取得しサーバーへ残す
				var message = "sip接続失敗";
				console.log(data);
				callJsConnectionInfo(message, referrer, txtPublicIdentity.value, txtPhoneNumber.value, locationUrl, data);

				console.log("電話サーバーとの接続に失敗しました。\nパスワードが間違って設定されている可能性がありますので、\n管理者にお問い合わせください。");
			})

			WebphoneUserAgent.on("newRTCSession", function(data) {
				console.log(data);
				var session = data.session;
				if (session.direction === "incoming") {
					// 受電
					// もし、前のセッションがあれば切る
					// sipHangUp();

					showNotifICall();

					// startRingTone();
					// showNotifICall('a');

					session.on("accepted",function(e){
						// the call has answered
									// console.log('accepted', e);
								});
					session.on("confirmed",function(e){
						// this handler will be called for incoming calls too
									// console.log('confirmed', e);
					});
					session.on("ended",function(e){
						// 架電停止イベント
						scCallEvent.callStopEvent();
						// the call has ended
									// console.log('ended', e);
					});
					session.on("failed",function(e){
						// unable to establish the call
									// console.log('failed', e);
				});


					session.on("connecting", function (e) {
						session.connection.onaddstream = function (obj) {
							audioRemote.srcObject = obj.stream;
							audioRemote.play();
							// 架電開始イベント
							scCallEvent.callStartEvent(null, obj.stream);
						}
					});

					if(typeof webRtcIncomingCall == "function"){
									webRtcIncomingCall();
								}

								IncommingSession = session;


					// Reject call (or hang up it)
					// session.terminate();
				};
			});

			WebphoneUserAgent.start();
		}
	}
	catch (e) {
	// console.error(e);
		var message = "name: ";
		message += e.name;
		message += "\nmessage: ";
		message += e.message;

		console.log(message);
	}
}

// 通話開始処理(makes a call (SIP INVITE))
function sipCall(s_type) {
	console.log('sipCall-start');
	// webhoneが設定されていない場合はWebSocket接続行わないようにする
	if(txtPassword.value == '' || txtPrivateIdentity.value == '5000'){
		alert('電話設定が正しくないため発信できません。管理者へお問い合わせ下さい。');
		return false
	}
	// 切電する
	sipHangUp();

	if (!isCall()) {
		var message = "";
		if (WebphoneUserAgent.isRegistered()){
			message += "Regist:OK\n";
		}else{
			message += "Regist:NG\n";
		}
		if (WebphoneUserAgent.isConnected()){
			message += "電話サーバーと接続がされていますが、何らかの理由で\n";
		}else{
			message += "電話サーバーと接続が切れているため\n";
		}
		console.log('txtPhoneNumber.value'+txtPhoneNumber.value);

		if (window.navigator) {
			window.navigator.getUserMedia({audio: true, video: false},
				function () {
					WebphoneSession = WebphoneUserAgent.call(txtPhoneNumber.value, {
						eventHandlers: {
							progress: function(e) {},
							failed: function(e) {
								console.log(e);
									message += "通話開始に失敗しました。 [ エラーコード：" + e.cause + " ]\n";

								if (!txtPublicIdentity.value) {
									message += "WebPhoneがセットされていません。\n ※画面を再読込するか、一度閉じて開き直して下さい\n";
								}

								message += "※お手数ですが、画面を再読込するか、一度閉じて開き直して下さい\n";

								// エラー内容をサーバーで記録する
								sipCallError(e, txtPublicIdentity.value, txtPhoneNumber.value, message);
								// コネクションを切断し接続する
								WebphoneUserAgent.stop();

								// メッセージ通知
								alert(message);
							},
							ended: function(e) {
								// 電話が切られた処理
								if(typeof webRtcHangUp == "function"){
									webRtcHangUp();
								}
								// 架電停止イベント
								scCallEvent.callStopEvent();
							},
							confirmed: function(e) {}
						},
						pcConfig: {
							// Chrome 57系以降はセキュリティ的にこれを指定しないと発信できない。
							rtcpMuxPolicy: 'negotiate'
						},
						extraHeaders: [
							'+g.oma.sip-im',
							'+audio',
							'language:\"en,ja\"'
						],
						mediaConstraints: { audio: true, video: false }
					});
					WebphoneSession.connection.onaddstream = function (obj) {
						audioRemote.srcObject = obj.stream;
						// 架電開始イベント
						scCallEvent.callStartEvent(null, obj.stream);
					};
					console.log(WebphoneSession);
				},
				function (err) {
					switch (err.name) {
						case 'PermissionDeniedError':
							alert("マイクがブロックされています。\n下記の手順を参考にしてくだい。\nhttps://support.google.com/chrome/answer/2693767?hl=ja");
							break;
						case 'NotAllowedError':
							alert("マイクの使用が許可されていません。\n下記の手順を参考にしてくだい。\nhttps://support.google.com/chrome/answer/2693767?hl=ja");
							break;
						case 'NotFoundError':
							alert("PCにマイクが接続されていない可能性があります。");
							break;
					}
				},
			);
		}
	} else if (IncommingSession) {
		// 受電
		IncommingSession.answer({
			mediaConstraints: {
				audio: true, video: false
			},
			pcConfig: {
				// Chrome 57系以降はセキュリティ的にこれを指定しないと発信できない。
				rtcpMuxPolicy: 'negotiate'
			},
			extraHeaders: [
				'+g.oma.sip-im',
				'+audio',
				'language:\"en,ja\"'
			],
		});
	}
}

// terminates the call (SIP BYE or CANCEL)
function sipHangUp() {
	if (isCall()) {
		if (IncommingSession) {
			IncommingSession.terminate();
			delete IncommingSession;
		} else {
			WebphoneSession.terminate();
		}
	}
}

function sipSendDTMF(c) {
	if (WebphoneSession && c) {
		if (WebphoneSession.sendDTMF(c) == 0) {
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


function sipToggleHoldResume() {
	if (WebphoneSession.isOnHold().local) {
		WebphoneSession.unhold();
	} else {
		WebphoneSession.hold();
		// ダイヤルパッド保留イベントを発行
		scCallEvent.dialPadOnHold()
	}
}

/**
 * 現在通話中か判定する
 * @returns {Boolean}
 */
function isCall(){
	// if (WebphoneUserAgent && )
	return !!WebphoneUserAgent && (
		(!!WebphoneSession && !WebphoneSession.isEnded())
			||
		(!!IncommingSession && !IncommingSession.isEnded())
	);
}

/**
 * 通知
 * @returns {void}
 */
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

//現在の画面から離れようとした場合
window.onbeforeunload = function(event){
	if($("#webphone_type").val() == "2" && isCall()){
		// webRtcで通話中に画面を遷移した場合は通話を切る
		sipHangUp();
	}
}


// エラー内容をAPサーバーへ送信してサーバーで記録する
function sipCallError(err, txtPublicIdentity, txtPhoneNumber, message) {

	var errCause = err.cause;
	var errDetail = JSON.stringify(err);

	$.ajax({
		url: "/common/save-calljs-error",
		type: "POST",
		data: {
			txtPublicIdentity:txtPublicIdentity,
			err:errCause,
			txtPhoneNumber:txtPhoneNumber,
			errdetail:errDetail,
			message:message
		},
		dataType: 'json',
		success: function(result) {
		}
	});
}

// 接続情報をログとしてサーバーへ残すようにする
function callJsConnectionInfo(message, referrer, txtPublicIdentity, txtPhoneNumber, locationUrl, err) {
	var detail = JSON.stringify(err);
	$.ajax({
		url: "/common/save-calljs-connectionlog",
		type: "POST",
		data: {
			message: message,
			referrer:referrer,
			txtPublicIdentity:txtPublicIdentity,
			txtPhoneNumber:txtPhoneNumber,
			locationUrl:locationUrl,
			detail:detail
		},
		dataType: 'json',
		success: function(result) {
		}
	});
}
