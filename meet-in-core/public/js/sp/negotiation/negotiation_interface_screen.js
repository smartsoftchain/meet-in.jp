//////////////////////////////////////////////////////////
// 画面共有制御
//////////////////////////////////////////////////////////

const MEETIN_CHECK_SCREEN_PLAY_START_TIMEOUT = 5000;
const MEETIN_SCREEN_CAPTURE_BY_CANVAS_WAIT = 1000;

// 画面共有開始
function screenOn() {
	sendRequestCloseScreenChooseDialog();
	mNegotiationMain.screenOn(
		640,
		480,
		10,
		myScreenStreamStop,
		noScreenExtensionError,
		receiveMyScreenStream
	);
}

// 画面共有停止
function screenOff() {
	mNegotiationMain.screenOff();
}

//////////////////////////////////////////////////////////
// 自分の画面共有のメディアストリーム関連
//////////////////////////////////////////////////////////

// 自分の画面共有のメディアストリームを受け取ったときのコールバック
// 引数1：stream
//        自分の画面共有のメディアストリーム
// 引数2：error
//        エラー内容
function receiveMyScreenStream(stream, error) {
	if (stream) {
		if (NEGOTIATION.mIsScreenOn) {
			mNegotiationMain.destroyScreenStreamSub();
		} else {
			var video = document.getElementById('video_share_screen');
			var style = video.getAttribute('style');
			video = attachMediaStream(video, stream);
			video.setAttribute('style', style);
			NEGOTIATION.mIsScreenOn = true;
			NEGOTIATION.mIsMyScreenOn = true;

			// 画面共有終了したら、カメラをオンにする
			// if (NEGOTIATION.isMyCameraOn) {
			// 	$('#button_camera').trigger("click");
			// }

			// 画面設定
			//LayoutCtrl.centerOneShow($('#negotiation_share_screen'));
			$('#negotiation_share_screen').show();

			// 検証の為、ビデオフレームをヘッダーにしまわない
			LayoutCtrl.apiMoveAllVideoFrameToHeader();

			$('#video_share_screen_stream_id').val(stream.id);

			$('#video_share_screen').show();
			$('#video_share_screen_connecting').hide();

			video.oncanplay = function(){
				// 現在の画面共有の表示領域のサイズを取得
				orgScreenWidth = $("div#negotiation_share_screen").width();
				orgScreenHeight = $("div#negotiation_share_screen").height();
				// ビデオタグで表示している場合
				var shareScreen = document.getElementById('video_share_screen');
				var videoHeight = shareScreen.videoHeight;
				var videoWidth = shareScreen.videoWidth;
//				console.log("videoWidth:"+videoWidth+" | videoHeight:"+videoHeight);
				// ビデオ表示領域に表示できる最大のサイズを計算
				getShareScreenSize({"height" : videoHeight, "width": videoWidth},  orgScreenHeight, orgScreenWidth, orgScreenHeight, orgScreenWidth);
//				console.log("shareScreenWidth:"+shareScreenWidth+" | shareScreenHeight:"+shareScreenHeight);
				// 計算結果を元に画面共有のフレームサイズを再設定する
				$("div#negotiation_share_screen").width(shareScreenWidth).height(shareScreenHeight);
				var left = ($("#fit_rate").width() - $("div#negotiation_share_screen").width()) / 2;
				var top = ($("#fit_rate").height() - $("div#negotiation_share_screen").height()) / 2;
				$("div#negotiation_share_screen").css('left', left + 'px');
				$("div#negotiation_share_screen").css('top', top + 'px');
			};

			// 画面共有領域をキャプチャする
			screenCaptureByCanvasStart();
		}
	}

	if (error) {
		// 画面共有停止
//		screenOff();
	}
}

// 自分の画面共有のメディアストリームが停止したときのコールバック
function myScreenStreamStop() {
	if (NEGOTIATION.mIsMyScreenOn) {
		// 画面共有停止
		screenOff();

		var video = document.getElementById('video_share_screen');
	//	video.src = "";
		video.srcObject = null;

		NEGOTIATION.mIsScreenOn = false;
		NEGOTIATION.mIsMyScreenOn = false;
		$('#negotiation_share_screen').hide();
		$('#close_share_screen_btn').hide();
		$('#video_share_screen').hide();
		$('#video_share_screen_connecting').show();

		// 検証の為、ビデオフレームをヘッダーにしまわない
		LayoutCtrl.apiMoveAllVideoFrameToCenter();
// 画面共有の処理でビデオレイアウトのリセットがあるとVideo画面が勝手に変わってしまうため処理削除(コメント)
// 2018/04/20 太田
//		// ビデオレイアウトのリセット
//		$.each(NEGOTIATION.videoArray.show,function(){
//			// ビデオタグのstyleを削除する（移動やリサイズすると付与される）
//			this.removeAttr('style');
//			// ビデオタグを表示するためにstyleを付与する
//			this.css("display", "block");
//		});

		// 画面共有終了したら、カメラをオンにする
		// if (!NEGOTIATION.isMyCameraOn) {
		// 	$('#button_camera').trigger("click");
		// }

		mNegotiationMain.sendScreenIsOff();
	}
}

//////////////////////////////////////////////////////////
// 接続先の画面共有のメディアストリーム関連
//////////////////////////////////////////////////////////

// 接続先の画面共有のメディアストリームを受け取ったときのコールバック
// 引数1：userId
//        接続先のユーザーID
// 引数2：stream
//        接続先の画面共有のメディアストリーム
function receiveTargetScreenStream(
		userId,
		stream,
		myPeerId,
		targetPeerId,
		connectionId
	) {
	if (stream) {
		if ('live' === stream.getVideoTracks()[0].readyState) {
			var video = document.getElementById('video_share_screen');
			if (video) {
				//var style = video.getAttribute('style');
				video = attachMediaStream(video, stream);
				//video.setAttribute('style', style);
				startCheckTargetScreenStreamStart(video, userId);
			}
			NEGOTIATION.mIsScreenOn = true;
			$('#close_share_screen_btn').hide();
			// 画面設定
			$('#negotiation_share_screen').show();
			video.oncanplay = function(){
				// 画面共有を行ったユーザーのビデオを非表示にする
				$("#negotiation_target_video_"+userId).hide();
				// 画面共有表示時専用のレイアウト設定
				spChangeLayout("negotiation_share_screen", "receiveTargetScreenStream");
			};

			$('#video_share_screen_connection_id').val(connectionId);
			$('#video_share_screen_stream_id').val(stream.id);
		} else {
			// エラーが起きたので、画面共有ストリームを再要求する
			sendRequestScreenStreamByUserId(userId, null);
		}
	} else {
		// エラーが起きたので、画面共有ストリームを再要求する
		sendRequestScreenStreamByUserId(userId, null);
	}
}

// 接続先の画面共有のメディアストリームがクローズされたときのコールバック
// 引数1：type
//        'stream'：MediaConnectionがクローズされた
//                  http://nttcom.github.io/skyway/docs/#mediaconnection-on-close
//        'peer'：メディアストリーム転送用のピアがクローズされた
//                http://nttcom.github.io/skyway/docs/#peeron-close
// 引数2：userId
//        接続先のユーザーID
function targetScreenStreamClose(
		userId,
		myPeerId,
		targetPeerId,
		connectionId
	) {
	if (connectionId === $('#video_share_screen_connection_id').val()) {
		var video = document.getElementById('video_share_screen');
		if (video) {
			if (!video.paused) {
				video.pause();
				video.currentTime -= 0.1;
			}
		}
		// 画面共有のタグを非表示にする
		$('#negotiation_share_screen').hide();
		// 画面共有を終了したユーザーのビデオを表示にする
		$("#negotiation_target_video_"+userId).show();
		// ビデオ領域を表示して直ぐは幅が取れないのでタイマーでループさせる
		var getVideoTargetWidth = function(){
			var id = setTimeout(getVideoTargetWidth, 1000);
			if($("#negotiation_target_video_"+userId).width() > 0){
				// ループを止める
				clearTimeout(id);
				// 画面共有終了時専用のレイアウト設定
				spChangeLayout(userId, "targetScreenStreamClose");
			}
		}
	}
}

function startCheckTargetScreenStreamStart(video, userId) {
	video.onloadstart = function(){
		var run = function() {
			$('#video_share_screen_connection_id').val('');
			$('#video_share_screen_stream_id').val('');
			mNegotiationMain.sendRequestScreenStreamByUserId(
				userId,
				null
			);
		};

		var timer = setTimeout(run, MEETIN_CHECK_SCREEN_PLAY_START_TIMEOUT);
		$('#video_share_screen_stream_check_timer').val(timer);
	};

	video.onpause = function(){
		var run = function() {
			$('#video_share_screen_connection_id').val('');
			$('#video_share_screen_stream_id').val('');
			mNegotiationMain.sendRequestScreenStreamByUserId(
				userId,
				null
			);
		};

		var timer = setTimeout(run, MEETIN_CHECK_SCREEN_PLAY_START_TIMEOUT);
		$('#video_share_screen_stream_check_timer').val(timer);
	};

	video.onplay = function(){
		var timer = $('#video_share_screen_stream_check_timer').val();
		if (timer && timer.length > 0) {
			clearTimeout(timer);
		}
		$('#video_share_screen_stream_check_timer').val("");

		$('#video_share_screen').show();
		$('#video_share_screen_connecting').hide();
	};
}

//////////////////////////////////////////////////////////
// 拡張機能関連
//////////////////////////////////////////////////////////

// 画面共有拡張機能がインストロールされていない場合のコールバック
function noScreenExtensionError() {
	$('.screenshare_button_tooltip').tooltipster('open');
}

//////////////////////////////////////////////////////////
// WebSocket関連
//////////////////////////////////////////////////////////

// 画面共有領域をキャプチャする
function screenCaptureByCanvasStart() {
	// 商談ルームにWebRTCをサポートしていないブラウザを使ってるユーザーがいる場合のみ、画面共有領域をキャプチャして画面共有する
//	if (totalSafariBrowser > 0 || totalIeBrowser > 0) {
		mNegotiationMain.sendScreenIsOn(null);
		setTimeout(screenCaptureByCanvasProc, MEETIN_SCREEN_CAPTURE_BY_CANVAS_WAIT);
//	}
}

function screenCaptureByCanvasProc() {
	var video = document.getElementById('video_share_screen');
	if (video) {
		// キャンバスノードの生成
		var canvas = document.createElement('canvas');
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;
		var context = canvas.getContext('2d');

		// キャンバスに描画
		context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

		var type = 'image/jpeg';
		// canvas から DataURL で画像を出力
		var data = canvas.toDataURL(type);
		var connection_info_id = $('#connection_info_id').val();

		var successCallback = function(data, textStatus, XMLHttpRequest) {
			if (NEGOTIATION.mIsMyScreenOn) {
				// setTimeout(screenCaptureByCanvasProc, MEETIN_SCREEN_CAPTURE_BY_CANVAS_WAIT);

				// 書き込み完了のメッセージを送る
				sendRequestScreenWriteFinished();
			}
		};

		var errorCallback = function(XMLHttpRequest, textStatus, errorThrown, errorMessage) {
		};

		var completeCallback = function(XMLHttpRequest, textStatus) {
		};

		saveFile(
			connection_info_id,
			data,
			successCallback,
			errorCallback,
			completeCallback
			);
	}
}
