var mRecordRTC_Screen = null;
var mScreenStream = null;
var mCallScreen = null;
var mScreen = new SkyWay.ScreenShare({debug: false});

function callProcScreen(call, callStreamScreenCallback, callCloseScreenCallback) {
	// Hang up on an existing call if present
	if (mCallScreen) {
		mCallScreen.close();
	}

	// Wait for stream on the call, then set peer video display
	call.on('stream', function(stream){
		if (callStreamScreenCallback) {
			callStreamScreenCallback(stream);
		}
	});

	// UI stuff
	mCallScreen = call;

	call.on('close', function(){
		if (callCloseScreenCallback) {
			callCloseScreenCallback();
		}
	});
}

function startScreenShare(target_peer_id_screen, width, height, frameRate, videoDom, startScreenShareSuccessCallback, startScreenShareErrorCallback, startScreenShareStopCallback, callStreamScreenCallback, callCloseScreenCallback) {

console.log("#### startScreenShare ####");
	if(mScreen.isEnabledExtension()){
		mScreen.startScreenShare({
			Width: width,
			Height: height,
			FrameRate: frameRate
		},function (stream){
			attachMediaStream_(videoDom,stream);
			var call = mPeerScreen.call(target_peer_id_screen, stream);
			callProcScreen(call, callStreamScreenCallback, callCloseScreenCallback);
			mScreenStream = stream;
			if (startScreenShareSuccessCallback) {
				startScreenShareSuccessCallback(stream);
			}
		},function(error){
			if (startScreenShareErrorCallback) {
				startScreenShareErrorCallback(error);
			}
//			alert(JSON.stringify(error));
		},function(){
			if (startScreenShareStopCallback) {
				startScreenShareStopCallback
			}
//			alert('ScreenShareを終了しました');
		});
	}else{
//		alert('Meetin画面共有をインストールして下さい');
		$('.screenshare_button_tooltip').tooltipster('open');
	}
}

function stopScreenShare() {
	if (mScreenStream) {
		mScreenStream.stop();
		mScreenStream = null;
	}

	mScreen.stopScreenShare();
}

function captrueScreen(streamWithAudio, width, height, frameRate, withSound) {
	if(mScreen.isEnabledExtension()){
		var screenConstraints = {
			Width: width,
			Height: height,
			FrameRate: frameRate
		};

		mScreen.startScreenShare(screenConstraints,
			function (screenStreamWork){
				if (webrtcDetectedBrowser !== 'firefox') { // opera or chrome etc.
					if (streamWithAudio) {
						var audioTrack = streamWithAudio.getAudioTracks();
						if (audioTrack.length > 0) {
							for (var i = 0; i < audioTrack.length; i++) {
								audioTrack[i].enabled = withSound;
							}
						}

						screenStreamWork.addTrack(streamWithAudio.getAudioTracks()[0]);
					}

					mScreenStream = screenStreamWork;

					mRecordRTC_Screen = RecordRTC(screenStreamWork,
						{
							type: 'video',
							disableLogs: true
						}
					);

					mRecordRTC_Screen.startRecording();
				} else {
//					screenConstraints.audio = withSound;

					mScreenStream = screenStreamWork;

					mRecordRTC_Screen = RecordRTC(screenStreamWork,
						{
							type: 'video',
							disableLogs: true
						}
					);

					mRecordRTC_Screen.startRecording();
				}
			},function(error){
//				alert(error);
			},function(){
//				alert('ScreenShareを終了しました');
			}
		);
	}else{
		$('.screenshare_button_tooltip').tooltipster(
			'content', 'Meetin画面共有をインストールしてください。<br>インストールは<a href="https://chrome.google.com/webstore/detail/meetin画面共有/pfkkknnhliihpaolobjbnkpdkhcfneio" target="_blank">こちら</a>'
		);
	}
}

function attachMediaStream_(videoDom, stream){
//console.log("attachMediaStream_");
	// Adapter.jsをインクルードしている場合はそちらのFunctionを利用する
	if(typeof (attachMediaStream) !== 'undefined' && attachMediaStream){
//console.log("Adapter");
		attachMediaStream(videoDom,stream);
	}else{
//console.log("srcObject");
//		videoDom.setAttribute('src', URL.createObjectURL(stream));
		videoDom.setAttribute('srcObject', stream)
	}
}
