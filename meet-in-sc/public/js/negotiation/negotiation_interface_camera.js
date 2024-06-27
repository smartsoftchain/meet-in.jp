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
//	$('#negotiation_target_video_relative_' + userId).hide();
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
					}
				}else{
					$('#video_target_connecting_' + userId).hide();
					// 自分のカメラがOFFからONに切り替わったら、ヘッダーアイコンをキャプチャ画像にする
					video.onplay = function(){
						myVideoCapture(myUserId);
					};
				}
				
	//			var text_div = document.getElementById('video_target_connecting_text_' + userId);
	//			if (text_div) {
	//				text_div.innerHTML = "準備中";
	//			}
	/*
				video.onloadstart = function(){
	//				console.log("video onloadstart");
				};
		
	//			video.onprogress = function(){
	//				console.log("video onprogress");
	//			};
	
				video.onsuspend = function(){
					console.log("video onsuspend");
				};
	
				video.onemptied = function(){
					console.log("video onemptied");
				};
	
				video.onstalled = function(){
					console.log("video onstalled");
				};
	
				video.onloadedmetadata = function(){
					console.log("video onloadedmetadata");
				};
	
				video.onloadeddata = function(){
					console.log("video onloadeddata");
				};
	
				video.oncanplay = function(){
					console.log("video oncanplay");
				};
	
				video.oncanplaythrough = function(){
					console.log("video oncanplaythrough");
				};
	
				video.onplaying = function(){
					console.log("video onplaying");
				};
	
				video.onwaiting = function(){
					console.log("video onwaiting");
				};
	
				video.onseeking = function(){
					console.log("video onseeking");
				};
	
				video.onseeked = function(){
					console.log("video onseeked");
				};
	
				video.onended = function(){
					console.log("video onended");
				};
	
				video.ondurationchange = function(){
					console.log("video ondurationchange");
				};
	*/
	//			video.ontimeupdate = function(){
	//				console.log("video ontimeupdate");
	//			};
	
	/*
				video.onplay = function(){
					console.log("video onplay");
				};
	*/
	/*
				video.onpause = function(){
					console.log("video onpause");
				};
	
				video.onratechange = function(){
					console.log("video onratechange");
				};
	
				video.onvolumechange = function(){
					console.log("video onvolumechange");
				};
	*/			
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
/*
		$('#negotiation_target_video_relative_' + userId).hide();
		$('#negotiation_target_video_relative_no_video_' + userId).show();
	
		var video = document.getElementById('video_target_video_' + userId);
		video.srcObject = null;
		
		$('#video_target_video_connection_id_' + userId).val("");
*/
	}
}

function startCheckTargetVideoStreamStart0(video) {
/*
	video.onloadstart = function(){
		var run = function() {
			$('#video_target_video_connection_id_0').val('');
			$('#video_target_video_stream_id_0').val('');
			mNegotiationMain.sendRequestVideoStreamByUserId(
				0, 
				null
			);
		};
		
		var timer = $('#video_target_video_stream_check_timer_0').val();
		if (timer && timer.length > 0) {
			clearTimeout(timer);
		}
//		timer = setTimeout(run, MEETIN_CHECK_VIDEO_PLAY_START_TIMEOUT);
		$('#video_target_video_stream_check_timer_0').val(timer);

//		console.log("video 0 onloadstart");
	};

	video.onpause = function(){
		var run = function() {
			$('#video_target_video_connection_id_0').val('');
			$('#video_target_video_stream_id_0').val('');
			mNegotiationMain.sendRequestVideoStreamByUserId(
				0, 
				null
			);
		};
		
		var timer = $('#video_target_video_stream_check_timer_0').val();
		if (timer && timer.length > 0) {
			clearTimeout(timer);
		}
//		timer = setTimeout(run, MEETIN_CHECK_VIDEO_PLAY_START_TIMEOUT);
		$('#video_target_video_stream_check_timer_0').val(timer);

//		console.log("video 0 onpause");
	};
*/
	video.oncanplay = function(){
//		var timer = $('#video_target_video_stream_check_timer_0').val();
//		if (timer && timer.length > 0) {
//			clearTimeout(timer);
//		}
//		$('#video_target_video_stream_check_timer_0').val("");
		
		$('#video_target_video_0').show();
		$('#video_target_connecting_0').hide();

		// 相手のカメラがONに切り替わったら、ヘッダーアイコンをキャプチャ画像にする
		myVideoCapture(0);
		
//		console.log("video 0 oncanplay");
	};
}

function startCheckTargetVideoStreamStart1(video) {
/*
	video.onloadstart = function(){
		var run = function() {
			$('#video_target_video_connection_id_1').val('');
			$('#video_target_video_stream_id_1').val('');
			mNegotiationMain.sendRequestVideoStreamByUserId(
				1, 
				null
			);
		};
		
		var timer = $('#video_target_video_stream_check_timer_1').val();
		if (timer && timer.length > 0) {
			clearTimeout(timer);
		}
//		timer = setTimeout(run, MEETIN_CHECK_VIDEO_PLAY_START_TIMEOUT);
		$('#video_target_video_stream_check_timer_1').val(timer);

//		console.log("video 1 onloadstart");
	};

	video.onpause = function(){
		var run = function() {
			$('#video_target_video_connection_id_1').val('');
			$('#video_target_video_stream_id_1').val('');
			mNegotiationMain.sendRequestVideoStreamByUserId(
				1, 
				null
			);
		};
		
		var timer = $('#video_target_video_stream_check_timer_1').val();
		if (timer && timer.length > 0) {
			clearTimeout(timer);
		}
//		timer = setTimeout(run, MEETIN_CHECK_VIDEO_PLAY_START_TIMEOUT);
		$('#video_target_video_stream_check_timer_1').val(timer);

//		console.log("video 1 onpause");
	};
*/
	video.oncanplay = function(){
//		var timer = $('#video_target_video_stream_check_timer_1').val();
//		if (timer && timer.length > 0) {
//			clearTimeout(timer);
//		}
//		$('#video_target_video_stream_check_timer_1').val("");
		
		$('#video_target_video_1').show();
		$('#video_target_connecting_1').hide();

		// 相手のカメラがONに切り替わったら、ヘッダーアイコンをキャプチャ画像にする
		myVideoCapture(1);
		
//		console.log("video 1 oncanplay");
	};
}

function startCheckTargetVideoStreamStart2(video) {
/*
	video.onloadstart = function(){
		var run = function() {
			$('#video_target_video_connection_id_2').val('');
			$('#video_target_video_stream_id_2').val('');
			mNegotiationMain.sendRequestVideoStreamByUserId(
				2, 
				null
			);
		};
		
		var timer = $('#video_target_video_stream_check_timer_2').val();
		if (timer && timer.length > 0) {
			clearTimeout(timer);
		}
//		timer = setTimeout(run, MEETIN_CHECK_VIDEO_PLAY_START_TIMEOUT);
		$('#video_target_video_stream_check_timer_2').val(timer);

//		console.log("video 2 onloadstart");
	};

	video.onpause = function(){
		var run = function() {
			$('#video_target_video_connection_id_2').val('');
			$('#video_target_video_stream_id_2').val('');
			mNegotiationMain.sendRequestVideoStreamByUserId(
				2, 
				null
			);
		};
		
		var timer = $('#video_target_video_stream_check_timer_2').val();
		if (timer && timer.length > 0) {
			clearTimeout(timer);
		}
//		timer = setTimeout(run, MEETIN_CHECK_VIDEO_PLAY_START_TIMEOUT);
		$('#video_target_video_stream_check_timer_2').val(timer);

//		console.log("video 2 onpause");
	};
*/
	video.oncanplay = function(){
//		var timer = $('#video_target_video_stream_check_timer_2').val();
//		if (timer && timer.length > 0) {
//			clearTimeout(timer);
//		}
//		$('#video_target_video_stream_check_timer_2').val("");
		
		$('#video_target_video_2').show();
		$('#video_target_connecting_2').hide();

		// 相手のカメラがONに切り替わったら、ヘッダーアイコンをキャプチャ画像にする
		myVideoCapture(2);
		
//		console.log("video 2 oncanplay");
	};
}

function startCheckTargetVideoStreamStart3(video) {
/*
	video.onloadstart = function(){
		var run = function() {
			$('#video_target_video_connection_id_3').val('');
			$('#video_target_video_stream_id_3').val('');
			mNegotiationMain.sendRequestVideoStreamByUserId(
				3, 
				null
			);
		};
		
		var timer = $('#video_target_video_stream_check_timer_3').val();
		if (timer && timer.length > 0) {
			clearTimeout(timer);
		}
//		timer = setTimeout(run, MEETIN_CHECK_VIDEO_PLAY_START_TIMEOUT);
		$('#video_target_video_stream_check_timer_3').val(timer);

//		console.log("video 3 onloadstart");
	};

	video.onpause = function(){
		var run = function() {
			$('#video_target_video_connection_id_3').val('');
			$('#video_target_video_stream_id_3').val('');
			mNegotiationMain.sendRequestVideoStreamByUserId(
				3, 
				null
			);
		};
		
		var timer = $('#video_target_video_stream_check_timer_3').val();
		if (timer && timer.length > 0) {
			clearTimeout(timer);
		}
//		timer = setTimeout(run, MEETIN_CHECK_VIDEO_PLAY_START_TIMEOUT);
		$('#video_target_video_stream_check_timer_3').val(timer);

//		console.log("video 3 onpause");
	};
*/
	video.oncanplay = function(){
//		var timer = $('#video_target_video_stream_check_timer_3').val();
//		if (timer && timer.length > 0) {
//			clearTimeout(timer);
//		}
//		$('#video_target_video_stream_check_timer_3').val("");
		
		$('#video_target_video_3').show();
		$('#video_target_connecting_3').hide();

		// 相手のカメラがONに切り替わったら、ヘッダーアイコンをキャプチャ画像にする
		myVideoCapture(3);
		
//		console.log("video 3 oncanplay");
	};
}

function startCheckTargetVideoStreamStart4(video) {
/*
	video.onloadstart = function(){
		var run = function() {
			$('#video_target_video_connection_id_4').val('');
			$('#video_target_video_stream_id_4').val('');
			mNegotiationMain.sendRequestVideoStreamByUserId(
				4, 
				null
			);
		};
		
		var timer = $('#video_target_video_stream_check_timer_4').val();
		if (timer && timer.length > 0) {
			clearTimeout(timer);
		}
//		timer = setTimeout(run, MEETIN_CHECK_VIDEO_PLAY_START_TIMEOUT);
		$('#video_target_video_stream_check_timer_4').val(timer);

//		console.log("video 4 onloadstart");
	};

	video.onpause = function(){
		var run = function() {
			$('#video_target_video_connection_id_4').val('');
			$('#video_target_video_stream_id_4').val('');
			mNegotiationMain.sendRequestVideoStreamByUserId(
				4, 
				null
			);
		};
		
		var timer = $('#video_target_video_stream_check_timer_4').val();
		if (timer && timer.length > 0) {
			clearTimeout(timer);
		}
//		timer = setTimeout(run, MEETIN_CHECK_VIDEO_PLAY_START_TIMEOUT);
		$('#video_target_video_stream_check_timer_4').val(timer);

//		console.log("video 4 onpause");
	};
*/
	video.oncanplay = function(){
//		var timer = $('#video_target_video_stream_check_timer_4').val();
//		if (timer && timer.length > 0) {
//			clearTimeout(timer);
//		}
//		$('#video_target_video_stream_check_timer_4').val("");
		
		$('#video_target_video_4').show();
		$('#video_target_connecting_4').hide();

		// 相手のカメラがONに切り替わったら、ヘッダーアイコンをキャプチャ画像にする
		myVideoCapture(4);
		
//		console.log("video 4 oncanplay");
	};
}

function startCheckTargetVideoStreamStart5(video) {
/*
	video.onloadstart = function(){
		var run = function() {
			$('#video_target_video_connection_id_5').val('');
			$('#video_target_video_stream_id_5').val('');
			mNegotiationMain.sendRequestVideoStreamByUserId(
				5, 
				null
			);
		};
		
		var timer = $('#video_target_video_stream_check_timer_5').val();
		if (timer && timer.length > 0) {
			clearTimeout(timer);
		}
//		timer = setTimeout(run, MEETIN_CHECK_VIDEO_PLAY_START_TIMEOUT);
		$('#video_target_video_stream_check_timer_5').val(timer);

//		console.log("video 5 onloadstart");
	};

	video.onpause = function(){
		var run = function() {
			$('#video_target_video_connection_id_5').val('');
			$('#video_target_video_stream_id_5').val('');
			mNegotiationMain.sendRequestVideoStreamByUserId(
				5, 
				null
			);
		};
		
		var timer = $('#video_target_video_stream_check_timer_5').val();
		if (timer && timer.length > 0) {
			clearTimeout(timer);
		}
//		timer = setTimeout(run, MEETIN_CHECK_VIDEO_PLAY_START_TIMEOUT);
		$('#video_target_video_stream_check_timer_5').val(timer);

//		console.log("video 5 onpause");
	};
*/
	video.oncanplay = function(){
//		var timer = $('#video_target_video_stream_check_timer_5').val();
//		if (timer && timer.length > 0) {
//			clearTimeout(timer);
//		}
//		$('#video_target_video_stream_check_timer_5').val("");
		
		$('#video_target_video_5').show();
		$('#video_target_connecting_5').hide();

		// 相手のカメラがONに切り替わったら、ヘッダーアイコンをキャプチャ画像にする
		myVideoCapture(5);
		
//		console.log("video 5 oncanplay");
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