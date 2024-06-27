//////////////////////////////////////////////////////////
// マイク制御
//////////////////////////////////////////////////////////

// マイクをON
function micOn() {
/*
	mNegotiationMain.micOn(
		receiveMyAudioStream
	);
*/
	let localStream = getLocalStream();
	if (localStream) {
		let audioTrack = localStream.getAudioTracks()[0];
		audioTrack.enabled = true;
		NEGOTIATION.isMyMicOn = true;

		// 自分の状態を全員に送る
		sendSystemInfoDetail(null);
	}
}

// マイクをOFF
function micOff() {
/*
	mNegotiationMain.micOff();
*/
	let localStream = getLocalStream();
	if (localStream) {
		let audioTrack = localStream.getAudioTracks()[0];
		audioTrack.enabled = false;
		NEGOTIATION.isMyMicOn = false;

		var userId = $('#user_id').val();
		$('#video_target_video_background_image_mic_' + userId).prop('src', '/img/icon_mic_off.png');

		targetAudioStreamClose(null, userId);

		// 自分の状態を全員に送る
		sendSystemInfoDetail(null);
	}
}

/**
 * マイクステイタス変更
 * 現在接続中のストリームをチェックし、状態が"ended"「入力がこれ以上データを提供しない状態」の
 * 場合、マイクの状態をOFFに設定する
 * 
 * "live"は、入力が接続され、リアルタイムなデータが提供されている状態を示します。
 */
function changeMicStat() {
	var MicStat = getMicStat();
//console.log("changeMicStat getMicStat=["+MicStat+"]");
	if( MicStat ) {
		if( MicStat == 'ended' ) {
			micOff();
			mNegotiationMain.isMyMicOn = false;
			NEGOTIATION.isMyMicOn = false;
			// NEGOTIATION.updateStatusAudio();
		}
	}
}

// マイク状態
function getMicStat() {
//console.log("getMicStat");
	return mNegotiationMain.getAudioStreamStat();
}

//////////////////////////////////////////////////////////
// 自分のマイクのメディアストリーム関連
//////////////////////////////////////////////////////////

// 自分のマイクのメディアストリームを受け取ったときのコールバック
// 引数1：stream
//        自分のマイクのメディアストリーム
// 引数2：error
//        エラー内容
function receiveMyAudioStream(stream, error) {
	// メディアストリームがある場合
	if (stream) {
		mIsTargetMicOn = true;
		var userId = $('#user_id').val();
		$('#video_target_video_background_image_mic_' + userId).prop('src', '/img/icon_mic.png');

		// ハウリング対策で自分のマイクの音声を再生しない

		NEGOTIATION.isMyMicOn = true;
		NEGOTIATION.updateStatusAudioStream(stream);

		$('#video_target_audio_stream_id_' + userId).val(stream.id);

		// 自分の状態を全員に送る
		sendSystemInfoDetail(null);
	}

	if (error) {
		mIsTargetMicOn = false;
		// マイクをOFF
		micOff();
		NEGOTIATION.isMyMicCanUse = false;
		NEGOTIATION.isMyMicError = true;
		NEGOTIATION.updateStatusAudioStream(stream);
	}

	// 自分のマイクのon/offをチェック
	if(!mIsTargetMicOn){
		$('.video_mic_off_icon').css("display", "block");
	}
}

//////////////////////////////////////////////////////////
// 接続先のマイクのメディアストリーム関連
//////////////////////////////////////////////////////////

// 接続先のマイクのメディアストリームを受け取ったときのコールバック
// 引数1：userId
//        接続先のユーザーID
// 引数2：stream
//        接続先のマイクのメディアストリーム
function receiveTargetAudioStream(
		userId, 
		stream, 
		myPeerId, 
		targetPeerId, 
		connectionId
	) {
	if (stream) {
		if ('live' === stream.getAudioTracks()[0].readyState) {
			var audio = document.getElementById('video_target_audio_' + userId);
			if (audio) {
				var style = audio.getAttribute('style');
				audio = attachMediaStream(audio, stream);
				audio.setAttribute('style', style);
				/**
				 * 相手の音声をミュートしている場合はミュート状態にする
				 */
				var muted = $("#video_target_icon_" + userId).find(".video_mute_audio").data("muted");
				if( muted != false) {
					var flash = null;
					if (navigator.appName.indexOf("Microsoft") != -1) {	// IE
						flash = window['negotiation_target_flash_' + userId];
					} else {
						flash = document['negotiation_target_flash_' + userId];
					}
					if(flash) {
						// Flash接続の場合
						meetinFlashTargetVideo_muteAudio(userId, muted);
					} else {
						// WebRtc接続の場合
						mNegotiationMain.muteTargetAudio(userId, muted);
					}
				}
			}
			
			$('#video_target_audio_connection_id_' + userId).val(connectionId);
			$('#video_target_audio_stream_id_' + userId).val(stream.id);
		} else {
			// エラーが起きたので、音声ストリームを再要求する
			sendRequestAudioStreamByUserId(userId, null);
		}
	} else {
		// エラーが起きたので、音声ストリームを再要求する
		sendRequestAudioStreamByUserId(userId, null);
	}
}

// 接続先のマイクのメディアストリームがクローズされたときのコールバック
// 引数1：type
//        'stream'：MediaConnectionがクローズされた
//                  http://nttcom.github.io/skyway/docs/#mediaconnection-on-close
//        'peer'：メディアストリーム転送用のピアがクローズされた
//                http://nttcom.github.io/skyway/docs/#peeron-close
// 引数2：userId
//        接続先のユーザーID
function targetAudioStreamClose(
		userId, 
		myPeerId, 
		targetPeerId, 
		connectionId
	) {
	if (connectionId === $('#video_target_audio_stream_id_' + userId).val()) {
		mNegotiationMain.sendRequestCloseConnectionByConnectionIdByUserId(
			userId,
			connectionId
		);
	}
}

