//////////////////////////////////////////////////////////
// 画面共有制御
//////////////////////////////////////////////////////////

const MEETIN_CHECK_SCREEN_PLAY_START_TIMEOUT = 5000;
const MEETIN_SCREEN_CAPTURE_BY_CANVAS_WAIT = 1000;

// 画面共有開始
function screenOn() {

	NEGOTIATION.setStorageMyCameraFlg(NEGOTIATION.isMyCameraOn); // カメラをオンの場合、状態を保持する
	// widthとheightとflamerateは拡張機能使用時の設定を利用
	sendRequestCloseScreenChooseDialog();
	mNegotiationMain.screenOn(
		window.screen.width > 1920 ? window.screen.width : 1920,
		window.screen.height > 1080 ? window.screen.height : 1080,
		15,
		myScreenStreamStop,
		function() {},
		receiveMyScreenStream
	);
}

// 画面共有停止
function screenOff() {
	mNegotiationMain.screenOff();
	$('#share_screen_modal').css('display','none');
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
			if (NEGOTIATION.isMyCameraOn) {
				//$('#button_camera').trigger("click"); // 画面共有中 裏でカメラを起動していても支障が無い為切らないことにした.
				$('#share_screen_modal').css('display','none');
			}

			// 画面設定
			//LayoutCtrl.centerOneShow($('#negotiation_share_screen'));
			$('#negotiation_share_screen').css('display', 'none'); // 鏡合わせのやつ
			$('#share_screen_modal').css('display','block');

			// 検証の為、ビデオフレームをヘッダーにしまわない
			LayoutCtrl.apiMoveAllVideoFrameToHeader();

			$('#video_share_screen_stream_id').val(stream.id);

//console.log("★★★ receiveMyScreenStream:video::show");
			$('#video_share_screen').show();
			$('#video_share_screen_connecting').hide();

			video.oncanplay = function(){
				// 拡張機能を利用しないで画面共有を行う実装に際して、共有方法(画面全体、ウィンドウ、chromeタブ)や
				// 共有される画面の大きさによって共有を行うたびに映像が縮小してしまう為、初回リサイズ処理を削除

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
		// 画面共有前に資料を展開してた場合、表示する
		showBehindDocument();

		var video = document.getElementById('video_share_screen');
		video.srcObject = null;

		NEGOTIATION.mIsScreenOn = false;
		NEGOTIATION.mIsMyScreenOn = false;
		$('#negotiation_share_screen').hide();
		$('#close_share_screen_btn').hide();
//console.log("★★★ myScreenStreamStop:video::hide");
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

		// 画面共有終了時に、画面共有前のカメラがオンだった場合にカメラをオンにする
		if (NEGOTIATION.isStorageMyCameraOn()) {
			//$('#button_camera').trigger("click"); // 画面共有中 カメラを切らない為 カメラを操作する必要がなくなった.
		}
		NEGOTIATION.resetStorageMyCameraFlg();

		mNegotiationMain.sendScreenIsOff();

		$("#header_video_reset").trigger('click');　// レイアウト元に戻す（初期化）
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
//console.log("receiveTargetScreenStream::video [live]");

			// 画面共有時にカメラをオフにする
			if (NEGOTIATION.isMyCameraOn) {
				// $('#button_camera').trigger("click");
			}

			var video = document.getElementById('video_share_screen');
			if (video) {
				var style = video.getAttribute('style');
				video = attachMediaStream(video, stream);
				video.setAttribute('style', style);
				startCheckTargetScreenStreamStart(video, userId);
			}
			NEGOTIATION.mIsScreenOn = true;

			// 画面設定
			$('#close_share_screen_btn').hide();
			$('#negotiation_share_screen').show();

			// 検証の為、ビデオフレームをヘッダーにしまわない
			LayoutCtrl.apiMoveAllVideoFrameToHeader();

			// 動画の再生準備ができたとき
			video.oncanplay = function(){
//console.log("receiveTargetScreenStream::video.oncanplay [START]");
				// 拡張機能を利用しないで画面共有を行う実装に際して、共有方法(画面全体、ウィンドウ、chromeタブ)や
				// 共有される画面の大きさによって共有を行うたびに映像が縮小してしまう為、初回リサイズ処理を削除

				var left = ($("#fit_rate").width() - $("div#negotiation_share_screen").width()) / 2;
				var top = ($("#fit_rate").height() - $("div#negotiation_share_screen").height()) / 2;
				$("div#negotiation_share_screen").css('left', left + 'px');
				$("div#negotiation_share_screen").css('top', top + 'px');

				// MacOS(Safari)の場合、画面共有を2回目以降(一度非表示にすると)自動再生が
				// 効かなくなる為、強制的に再生する
				video.play();
			};

			$('#video_share_screen_connection_id').val(connectionId);
			$('#video_share_screen_stream_id').val(stream.id);
		}
		else {
console.log("Error receiveTargetScreenStream:stream.readyState["+ stream.getVideoTracks()[0].readyState +"]");
			// エラーが起きたので、画面共有ストリームを再要求する
			sendRequestScreenStreamByUserId(userId, null);
		}
	}
	else {
console.log("Error receiveTargetScreenStream:stream("+ stream +")");
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
				//video.currentTime -= 0.1;
			}
		}
//console.log("★★★ targetScreenStreamClose:video::hide");
		$('#video_share_screen').hide();
		$('#video_share_screen_connecting').show();
	}
}

function startCheckTargetScreenStreamStart(video, userId) {

//console.log("▲▲▲ startCheckTargetScreenStreamStart");

	// 動画のロードが開始されたとき
	// netWorkState属性の値がNETWORK_LOADINGになったときと同じタイミングで発火します。
	// ページにアクセスして一度だけ発火するイベントです。
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

	// 動画が一時停止されたとき
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

	// 動画の再生が開始されたとき
	video.onplay = function(){
		var timer = $('#video_share_screen_stream_check_timer').val();
		if (timer && timer.length > 0) {
			clearTimeout(timer);
		}
		$('#video_share_screen_stream_check_timer').val("");
//console.log("★★★ startCheckTargetScreenStreamStart:video.onplay::show");
		$('#video_share_screen').show();
		$('#video_share_screen_connecting').hide();
	};

	// 動画が再生されているときに発火するイベント
	video.onplaying = function(){
		var timer = $('#video_share_screen_stream_check_timer').val();
		if (timer && timer.length > 0) {
			clearTimeout(timer);
		}
		$('#video_share_screen_stream_check_timer').val("");

//console.log("★★★ startCheckTargetScreenStreamStart:video.onplaying::show");
		$('#video_share_screen').show();
		$('#video_share_screen_connecting').hide();
	};
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
