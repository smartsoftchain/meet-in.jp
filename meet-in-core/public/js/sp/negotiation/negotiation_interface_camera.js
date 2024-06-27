//////////////////////////////////////////////////////////
// カメラ制御
//////////////////////////////////////////////////////////

const MEETIN_CHECK_VIDEO_PLAY_START_TIMEOUT = 5000;

// カメラをON
// 引数1：constraints
//        指定するカメラの解像度
function cameraOn(constraints) {
	mNegotiationMain.cameraOn(
		constraints,
		receiveMyVideoStream
	);
}

// カメラをOFF
function cameraOff() {
	mNegotiationMain.cameraOff();

	var userId = $('#user_id').val();
	$('#negotiation_target_video_relative_no_video_' + userId).show();
	var video = document.getElementById('video_target_video_' + userId);
	if (video) {
		video.srcObject = null;
	}
	$('#video_target_video_connection_id_' + userId).val("");
	// ヘッダーアイコンをmeet inアイコンに変更する
	$("li#video_list_"+userId).find("img").attr("src", "/img/meet-in-logo_gray.png");

	// 自分の状態を全員に送る
	sendSystemInfoDetail(null);
}

//////////////////////////////////////////////////////////
// 自分のカメラのメディアストリーム関連
//////////////////////////////////////////////////////////

// 自分のカメラのメディアストリームを受け取ったときのコールバック
// 引数1：stream
//        自分のカメラのメディアストリーム
// 引数2：error
//        エラー内容
function receiveMyVideoStream(stream, error) {
	// メディアストリームがある場合
	if (stream) {
		// メディアストリームを画面に設定して再生する
		var userId = $('#user_id').val();
		receiveTargetVideoStream(userId, stream);
		NEGOTIATION.isMyCameraOn = true;
		NEGOTIATION.updateStatusVideoAudio();
		
		$('#video_target_video_stream_id_' + userId).val(stream.id);
		
		// 自分の状態を全員に送る
		sendSystemInfoDetail(null);
	}
	
	if (error) {
		// カメラをOFF
		cameraOff();
		NEGOTIATION.isMyCameraCanUse = false;
		NEGOTIATION.updateStatusVideoAudio();
	}
}

//////////////////////////////////////////////////////////
// 接続先のカメラのメディアストリーム関連
//////////////////////////////////////////////////////////

// 接続先のカメラのメディアストリームを受け取ったときのコールバック
// 引数1：userId
//        接続先のユーザーID
// 引数2：stream
//        接続先のカメラのメディアストリーム
function receiveTargetVideoStream(
		userId, 
		stream, 
		myPeerId, 
		targetPeerId, 
		connectionId
	) {
	if (stream) {
		if ('live' === stream.getVideoTracks()[0].readyState) {
			var video = document.getElementById('video_target_video_' + userId);
			if (video) {
				var style = video.getAttribute('style');
				video = attachMediaStream(video, stream);
				video.setAttribute('style', style);
				$('#video_target_connecting_' + userId).show();
				
				var myUserId = $('#user_id').val();
				if (myUserId != userId) {
					if (0 == userId) {
						startCheckTargetVideoStreamStart0(video);
					} else if (1 == userId) {
						startCheckTargetVideoStreamStart1(video);
					} else if (2 == userId) {
						startCheckTargetVideoStreamStart2(video);
					} else if (3 == userId) {
						startCheckTargetVideoStreamStart3(video);
					} else if (4 == userId) {
						startCheckTargetVideoStreamStart4(video);
					} else if (5 == userId) {
						startCheckTargetVideoStreamStart5(video);
					} else if (6 == userId) {
						startCheckTargetVideoStreamStart6(video);
					}
				}else{
					$('#video_target_connecting_' + userId).hide();
					// 自分のカメラがOFFからONに切り替わったら、ヘッダーアイコンをキャプチャ画像にする
					video.onplay = function(){
						myVideoCapture(myUserId);
					};
				}
				
			}
	
			$('#negotiation_target_video_relative_' + userId).show();
			$('#negotiation_target_video_relative_no_video_' + userId).hide();
			
			$('#video_target_video_connection_id_' + userId).val(connectionId);
			$('#video_target_video_stream_id_' + userId).val(stream.id);
			
	//		console.log('ユーザー' + userId + '(' + peerId + ')からのストリーム(' + streamId + ')' + 'をvideoタグにセット');
		} else {
			// エラーが起きたので、映像ストリームを再要求する
			sendRequestVideoStreamByUserId(userId, null);
		}
	} else {
//		console.log('ユーザー' + userId + '(' + peerId + ')からのストリームがnullである');
		// エラーが起きたので、映像ストリームを再要求する
		sendRequestVideoStreamByUserId(userId, null);
	}
}

// 接続先のカメラのメディアストリームがクローズされたときのコールバック
// 引数1：type
//        'stream'：MediaConnectionがクローズされた
//                  http://nttcom.github.io/skyway/docs/#mediaconnection-on-close
//        'peer'：メディアストリーム転送用のピアがクローズされた
//                http://nttcom.github.io/skyway/docs/#peeron-close
// 引数2：userId
//        接続先のユーザーID
function targetVideoStreamClose(
		userId, 
		myPeerId, 
		targetPeerId, 
		connectionId
	) {
	if (connectionId === $('#video_target_video_connection_id_' + userId).val()) {
		var video = document.getElementById('video_target_video_' + userId);
		if (video) {
			video.srcObject = null;
//			if (!video.paused) {
//				video.pause();
//				video.currentTime -= 0.1;
//			}
		}
		mNegotiationMain.sendRequestCloseConnectionByConnectionIdByUserId(
			userId,
			connectionId
		);
		
		
//		var text_div = document.getElementById('video_target_connecting_text_' + userId);
//		if (text_div) {
//			text_div.innerHTML = "再接続中";
//		}
		$('#video_target_video_' + userId).hide();
		$('#video_target_connecting_' + userId).show();
	}
}

function startCheckTargetVideoStreamStart0(video) {
	video.oncanplay = function(){
		$('#video_target_video_0').show();
		$('#video_target_connecting_0').hide();

		// 相手のカメラがONに切り替わったら、ヘッダーアイコンをキャプチャ画像にする
		myVideoCapture(0);
	};
}

function startCheckTargetVideoStreamStart1(video) {
	video.oncanplay = function(){
		$('#video_target_video_1').show();
		$('#video_target_connecting_1').hide();

		// 相手のカメラがONに切り替わったら、ヘッダーアイコンをキャプチャ画像にする
		myVideoCapture(1);
	};

	video.suspend = function(){
console.log("video1 :: suspend");
	};
	video.abort = function(){
console.log("video1 :: abort");
	};
	video.error = function(){
		console.log("video1 :: error");
	};
	video.emptied = function(){
		console.log("video1 :: emptied");
	};
	video.stalled = function(){
		console.log("video1 :: stalled");
	};
	video.playing = function(){
		console.log("video1 :: playing");
	};
	video.waiting = function(){
		console.log("video1 :: waiting");
	};
	video.pause = function(){
		console.log("video1 :: pause");
	};
	video.pause = function(){
		console.log("video1 :: pause");
	};


}

function startCheckTargetVideoStreamStart2(video) {
	video.oncanplay = function(){

		$('#video_target_video_2').show();
		$('#video_target_connecting_2').hide();

		// 相手のカメラがONに切り替わったら、ヘッダーアイコンをキャプチャ画像にする
		myVideoCapture(2);
		
//		console.log("video 2 oncanplay");
	};
}

function startCheckTargetVideoStreamStart3(video) {
	video.oncanplay = function(){

		$('#video_target_video_3').show();
		$('#video_target_connecting_3').hide();

		// 相手のカメラがONに切り替わったら、ヘッダーアイコンをキャプチャ画像にする
		myVideoCapture(3);
		
//		console.log("video 3 oncanplay");
	};
}

function startCheckTargetVideoStreamStart4(video) {
	video.oncanplay = function(){
		$('#video_target_video_4').show();
		$('#video_target_connecting_4').hide();

		// 相手のカメラがONに切り替わったら、ヘッダーアイコンをキャプチャ画像にする
		myVideoCapture(4);
		
//		console.log("video 4 oncanplay");
	};
}

function startCheckTargetVideoStreamStart5(video) {
	video.oncanplay = function(){
		$('#video_target_video_5').show();
		$('#video_target_connecting_5').hide();

		// 相手のカメラがONに切り替わったら、ヘッダーアイコンをキャプチャ画像にする
		myVideoCapture(5);
		
//		console.log("video 5 oncanplay");
	};
}


function startCheckTargetVideoStreamStart6(video) {
	video.oncanplay = function(){
		$('#video_target_video_6').show();
		$('#video_target_connecting_6').hide();

		// 相手のカメラがONに切り替わったら、ヘッダーアイコンをキャプチャ画像にする
		myVideoCapture(6);
		
//		console.log("video 6 oncanplay");
	};
}


/**
 * ヘッダーアイコンにビデオのキャプチャを設定する関数
 * @param userId
 * @returns
 */
function myVideoCapture(userId){
	var tmp = $('.video_list_vert[data-id="'+userId+'"]');
	var canvas = document.createElement("canvas");
	var video = $("div#negotiation_target_video_"+userId).find('#video_target_video_'+userId).get(0);
	if(video){
		// webrtc
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;
		canvas.getContext('2d').drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
		var url = canvas.toDataURL('image/jpeg');
		if(url == "data:,"){// イメージが取れないときにこうなるので、デフォアイコンをセット
			tmp.find('img').attr('src','/img/meet-in-logo_gray.png');
		}else{
			tmp.find('img').attr('src',canvas.toDataURL('image/jpeg'))
		}
	}else{
		// ieはキャプチャできないのでmeet-inアイコンを使用
		tmp.find('img').attr('src','/img/meet-in-logo_gray.png');
	}
}