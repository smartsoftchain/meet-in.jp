var mScreenImageTimer = null;

const MEETIN_SCREEN_CAPTURE_BY_CANVAS_SHOW_WAIT = 1000;
var receiveMsgCount = 0;		// 画面共有 読込メッセージ完了数
var receiveMsgTimer = null;

// コマンド受信（MeetinCoreManagerのコマンド）
// 引数1：json
//        json型のコマンド
function receiveCoreCommand(json) {
	// 送信側の視点：自分の状態を相手に送る
	// →受信側の視点：相手の状態をもとに何らかの処理を行う
	if (json.command === "SYSTEM_INFO_DETAIL") {
		procSystemInfoDetail(json);
	}
	else if (json.command === "CAMERA_IS_ON") {
		procCameraIsOn(json);
	}
	// 送信側の視点：自分のカメラがオフになった
	// →受信側の視点：相手のカメラがオフになったときの処理
	else if (json.command === "CAMERA_IS_OFF") {
		procCameraIsOff(json);
	}
	else if (json.command === "MIC_IS_ON") {
		procMicIsOn(json);
	}
	// 送信側の視点：自分のマイクがオフになった
	// →受信側の視点：相手のマイクがオフになったときの処理
	else if (json.command === "MIC_IS_OFF") {
		procMicIsOff(json);
	}
	else if (json.command === "SCREEN_IS_ON") {
		procScreenIsOn(json);
	}
	// 送信側の視点：自分の画面共有がオフになった
	// →受信側の視点：相手の画面共有がオフになったときの処理
	else if (json.command === "SCREEN_IS_OFF") {
		procScreenIsOff(json);
	}
	// 送信側の視点：接続画面に入室したことををすべての接続先に伝える
	// →受信側の視点：何らかの処理を行う
	else if (json.command === "ENTER_ROOM") {
		procEnterRoom(json);
	}
	else if (json.command === "ENTER_ROOM_RECEIVED") {
		procEnterRoomReceived(json);
	}
	// 送信側の視点：接続画面を退室したことををすべての接続先に伝える
	// →受信側の視点：何らかの処理を行う
	else if (json.command === "EXIT_ROOM") {
		procExitRoom(json);
	}
	// 送信側の視点：ストリームの状態を送る
	// →受信側の視点：再生中のストリームの状態をチェックする
	else if (json.command === "STREAM_INFO_DETAIL") {
		procStreamInfoDetail(json);
	}
	else if (json.command === 'PING_RECEIVED') {
		// マイクの状態をチェックし変更する
		changeMicStat();
	}
}

// コマンド受信（通常のコマンド）
// 引数1：json
//        json型のコマンド
function receiveCommonCommand(json) {
	if (json.command === "") {
	}
	//////////////////////////////////////////////////////////
	// システム状態関連
	//////////////////////////////////////////////////////////

	// フォーカスがMeetinに戻った
	else if (json.command === "TAB_IS_FOCUS") {
		procTabIsFocus(json);
	}
	// フォーカスがMeetinから離れた
	else if (json.command === "TAB_IS_BLUR") {
		procTabIsBlur(json);
	}

	// ページ遷移日時が要求されたとき
	else if (json.command === "REQUEST_ENTER_NEGOTIATION_DATETIME") {
		procRequestEnterNegotiationDatetime(json);
	}

	// 相手のページ遷移日時を送られたとき
	else if (json.command === "ENTER_NEGOTIATION_DATETIME") {
		procEnterNegotiationDatetime(json);
	}

	//////////////////////////////////////////////////////////
	// カメラ関連
	//////////////////////////////////////////////////////////

	else if (json.command === "REQUEST_FLASH_RE_ENTER_ROOM") {
		procRequestFlashReEnterRoom(json);
	}

	//////////////////////////////////////////////////////////
	// マイク関連
	//////////////////////////////////////////////////////////

	//////////////////////////////////////////////////////////
	// 画面共有関連
	//////////////////////////////////////////////////////////

	// 画面共有対象選択ダイアログを閉じる
	else if (json.command === "REQUEST_CLOSE_SCREEN_CHOOSE_DIALOG") {
// スマホ側から画面共有を行うことはないので下記の処理は不要なためコメント
		// procRequestCloseScreenChooseDialog(json);
	}
	// 画面読み込み処理を行う
	else if (json.command === "REQUEST_WRITE_FINISHED") {
// スマホ側でIEを使用しないため不要
//		procSetScreen(json);
	}
	// 画面書き込み処理を行う
	else if (json.command === "REQUEST_READ_FINISHED") {
// スマホ側から画面共有を行うことはないので下記の処理は不要なためコメント
		// ++receiveMsgCount;
		// // 接続先の人数分のメッセージがきたら、書き込み処理
		// if (mNegotiationMain.getTotalTargetPeerData() == receiveMsgCount) {
		// 	receiveMsgCount = 0;
		// 	if(receiveMsgTimer !== null){
		// 		clearTimeout(receiveMsgTimer);
		// 		receiveMsgTimer = null;
		// 	}
		// 	screenCaptureByCanvasProc(json);
		// }
		// // 一人目からのメッセージが来て、3秒後に強制実行
		// if (receiveMsgCount == 1 || receiveMsgCount  > mNegotiationMain.getTotalTargetPeerData() ) {
		// 	receiveMsgTimer = setTimeout(screenCaptureByCanvasProc(json),  3000);
		// }
	}

	//////////////////////////////////////////////////////////
	// 接続関連
	//////////////////////////////////////////////////////////

	// 送信側の視点：商談中画面に遷移する許可を要求する
	// →受信側の視点：許可／拒否
	else if (json.command === "REQUEST_CHANGE_TO_NEGOTIATION") {
		if (NEGOTIATION.isOperator) {
			procRequestChangeToNegotiation(json);
		}
	}

	// ゲストが入室要求をキャンセルした場合
	else if (json.command === "REQUEST_CHANGE_TO_NEGOTIATION_TIMEOUT") {
		procRequestChangeToNegotiationTimeout(json);
	}

	// 商談終了
	else if (json.command === "NEGOTIATION_FINISH_PROCESS") {
		procNegotiationFinishProcess(json);
	}

	// 再接続開始
	else if (json.command === "RECONNECT_START") {
		procReconnectStart(json);
	}

	// ゲスト側からの入室キャンセル
	else if (json.command === "CANCEL_CONNECTION") {
		procCancelConnection(json);
	}
	else if (json.command === "REQUEST_CHANGE_TO_NEGOTIATION_TIMEOUT") {
		procRequestChangeToNegotiationTimeout(json);
	}

	// ログイン(商談中のログイン)
	else if (json.command === "SEND_LOGIN") {
		procSendLogin(json);
	}

	//////////////////////////////////////////////////////////
	// ビデオフレーム関連
	//////////////////////////////////////////////////////////

	// プロフィール画像が要求されたとき
	else if (json.command === "REQUEST_PROFILE_IMAGE") {
		procRequestProfileImage(json);
	}
	// プロフィール画像のリンクが届いたとき
	else if (json.command === "PROFILE_IMAGE") {
		procProfileImage(json);
	}

	//////////////////////////////////////////////////////////
	// 共有メモ関連
	//////////////////////////////////////////////////////////

	else if (json.command === "SHARE_MEMO") {
		receiveShareMemoJson(json);
	}

	//////////////////////////////////////////////////////////
	// ホワイトボード関連
	//////////////////////////////////////////////////////////

	else if (json.command === "WHITE_BOARD") {
		receiveWhiteBoardJson(json);
	}

	//////////////////////////////////////////////////////////
	// チャットボード関連
	//////////////////////////////////////////////////////////
	else if (json.command === "CHAT_BOARD") {
		receiveChatBoardJson(json);
	}

	//////////////////////////////////////////////////////////
	// 資料共有関連
	//////////////////////////////////////////////////////////

	else if (json.command === "DOCUMENT") {
		receiveDocumentJson(json);
	}

	//////////////////////////////////////////////////////////
	// 共有メモ・ホワイトボード・資料の同期関連
	//////////////////////////////////////////////////////////

	else if (json.command === "INIT_SYNC") {
		receiveSyncJson(json);
	}

	//////////////////////////////////////////////////////////
	// 名刺表示関連
	//////////////////////////////////////////////////////////

	else if (json.command === "NAME_CARD") {
		receiveNameCardJson(json);
	}

	// Staff 情報が届いたとき
	else if (json.command === "SEND_TARGET_ALL") {
		setTagetAll(json);
	}

	// Staff 情報が届いたとき
	else if (json.command === "SEND_LOCK") {
		setLock(json);
	}

	//////////////////////////////////////////////////////////
	// その他
	//////////////////////////////////////////////////////////

	else {
		if (receiveCommonCommandExtra && typeof receiveCommonCommandExtra === "function") {
			receiveCommonCommandExtra(json);
		}
	}
}

//////////////////////////////////////////////////////////
// MeetinCoreManagerのコマンドを受信したときの処理
//////////////////////////////////////////////////////////

// 相手の状態が届いたとき
// json.command：コマンド名
// json.user_agent：相手のブラウザのユーザーエージェント
// json.has_focus：true = 相手の現在のフォーカスが商談中画面にある。false = 相手の現在のフォーカスが商談中画面以外にある。（商談中画面が一つしか開けないことが前提）
// json.has_video_stream：true = 相手のカメラがONになっている。false = 相手のカメラがOFFになっている。
// json.has_audio_stream：true = 相手のマイクがONになっている。false = 相手のマイクがOFFになっている。
// json.has_screen_stream：true = 相手が画面共有している。false = 相手が画面共有していない。
// json.from_peer_id：相手のピアID
// json.from_user_id：相手のユーザーID
// json.from_user_info：相手の氏名
function procSystemInfoDetail(json) {
	var video_list =	$('#video_list_' + json.from_user_id);

	if (json.has_video_stream) {
		$('#video_target_video_background_image_camera_' + json.from_user_id).prop('src', '/img/icon_video.png');
		$('#negotiation_target_video_relative_' + json.from_user_id).show();
		//$('#negotiation_target_video_relative_no_video_' + json.from_user_id).hide();
		// ビデオONにより、アイコン非表示
		spToggleVideo(json.from_user_id, false);
		myVideoCapture(json.from_user_id);
	} else {
		$('#video_target_video_background_image_camera_' + json.from_user_id).prop('src', '/img/icon_video_off.png');
		//$('#negotiation_target_video_relative_no_video_' + json.from_user_id).show();
		// ビデオOFFにより、アイコン表示
		spToggleVideo(json.from_user_id, true);
		// ヘッダーアイコンをmeet inアイコンに変更する
		$("li#video_list_" + json.from_user_id).find("img").attr("src", "/img/meet-in-logo_gray.png");
	}

	if (json.has_audio_stream) {// マイクの状態を更新
		$('#video_target_video_background_image_mic_' + json.from_user_id).prop('src', '/img/icon_mic.png');
	} else {
		$('#video_target_video_background_image_mic_' + json.from_user_id).prop('src', '/img/icon_mic_off.png');
	}

	// DOMに書き込み、それを元に設定する方法にする
	// ユーザーの名前の更新
	video_list.find('.user_info').text(valueCheck(json.from_user_info) ? json.from_user_info : DEFAULT_USER_NAME);
	video_list.find('.user_name').text(valueCheck(json.from_user_info) ? json.from_user_info : DEFAULT_USER_NAME);
	// フォーカス状態の更新
	video_list.find('.icon-browse-focus').changeClass(json.has_focus,'mi_active');

	// ビデオ状態の更新
	video_list.find('.icon-video').changeClass(json.has_video_stream,'mi_active');
	// マイクの状態を更新
	video_list.find('.icon-microphone').changeClass(json.has_audio_stream,'mi_active');

	// ユーザーのデバイスの更新
	video_list.find('.icon-device').changeClass(!NEGOTIATION.isDeviceMob(json.user_agent),'icon-pc');
	video_list.find('.icon-device').changeClass(NEGOTIATION.isDeviceMob(json.user_agent),'icon-tab');

	// 使用しているブラウザ
	if (json.from_browser === 'Chrome') {
		video_list.find('.icon-browser-type').changeClass(true, 'icon-browser-type-chrome');
	} else if (json.from_browser === 'Firefox') {
		video_list.find('.icon-browser-type').changeClass(true, 'icon-browser-type-firefox');
	} else if (json.from_browser === 'IE') {
		video_list.find('.icon-browser-type').changeClass(true, 'icon-browser-type-ie');
	} else if (json.from_browser === 'Safari') {
		video_list.find('.icon-browser-type').changeClass(true, 'icon-browser-type-safari');
	}else if (json.from_browser === 'Edge') {
		video_list.find('.icon-browser-type').changeClass(true, 'icon-browser-type-edge');
	}

	// DOMを元に吹き出し設定
	video_list.tooltipster(
		'content', video_list.find('.mi_header_status_icon').html()
	);

	mUserIdAndUserInfoArray[json.from_user_id] = json.from_user_info;
	mUserIdAndBrowserTable[json.from_user_id] = json.from_browser;
}

// 相手のカメラがオンになったときの処理
function procCameraIsOn(json) {
	var $video_list =	$('#video_list_' + json.from_user_id);

	$('#video_target_video_background_image_camera_' + json.from_user_id).prop('src', '/img/icon_video.png');
	$('#negotiation_target_video_relative_' + json.from_user_id).show();
	//$('#negotiation_target_video_relative_no_video_' + json.from_user_id).hide();
	// ビデオONにより、アイコン表示
	spToggleVideo(json.from_user_id, false);

	// DOMに書き込み、それを元に設定する方法にする
	// ビデオ状態の更新
	$video_list.find('.icon-video').changeClass(true,'mi_active');

	// DOMを元に吹き出し設定
	$video_list.tooltipster('content', $video_list.find('.mi_header_status_icon').html());
}

// 相手のカメラがオフになったときの処理
function procCameraIsOff(json) {
	var $video_list =	$('#video_list_' + json.from_user_id);

	$('#video_target_video_background_image_camera_' + json.from_user_id).prop('src', '/img/icon_video_off.png');
	//$('#negotiation_target_video_relative_no_video_' + json.from_user_id).show();
	// ビデオOFFにより、アイコン非表示
	spToggleVideo(json.from_user_id, true);

	// DOMに書き込み、それを元に設定する方法にする
	// ビデオ状態の更新
	$video_list.find('.icon-video').changeClass(false,'mi_active');

	// DOMを元に吹き出し設定
	$video_list.tooltipster('content', $video_list.find('.mi_header_status_icon').html());
}

// 相手のマイクがオンになったときの処理
function procMicIsOn(json) {
	var $video_list =	$('#video_list_' + json.from_user_id);

	$('#video_target_video_background_image_mic_' + json.from_user_id).prop('src', '/img/icon_mic.png');

	// DOMに書き込み、それを元に設定する方法にする
	// マイクの状態を更新
	$video_list.find('.icon-microphone').changeClass(true,'mi_active');

	// DOMを元に吹き出し設定
	$video_list.tooltipster('content', $video_list.find('.mi_header_status_icon').html());
}

// 相手のマイクがオフになったときの処理
function procMicIsOff(json) {
	var $video_list =	$('#video_list_' + json.from_user_id);

	$('#video_target_video_background_image_mic_' + json.from_user_id).prop('src', '/img/icon_mic_off.png');

	// DOMに書き込み、それを元に設定する方法にする
	// マイクの状態を更新
	$video_list.find('.icon-microphone').changeClass(false,'mi_active');

	// DOMを元に吹き出し設定
	$video_list.tooltipster('content', $video_list.find('.mi_header_status_icon').html());
}

// 相手の画面共有がオンになったときの処理
function procScreenIsOn(json) {
	NEGOTIATION.mIsScreenOn = true;
	$('#close_share_screen_btn').hide();

	// 画面設定
	$('#negotiation_share_screen').show();

	// ユーザー一覧ダイアログ表示中の場合は閉じる
	if($('#room-userlist-dialog').hasClass("ui-dialog-content") && $('#room-userlist-dialog').dialog('isOpen')) {
		$('#room-userlist-dialog').dialog('close');
	}

	// Safariを除外
	if ( (USER_PARAM_BROWSER === 'IE') ) {
	// if ((USER_PARAM_BROWSER === 'Safari')
	// 	|| (USER_PARAM_BROWSER === 'IE')
	// ) {
		// 画面共有時にカメラをオフにする
		if (NEGOTIATION.isMyCameraOn) {
			$('#button_camera').trigger("click");
		}
	}

	// Safariを除外
	if ( (json.from_browser === 'IE') || (USER_PARAM_BROWSER === 'IE') ) {
	// if ((json.from_browser === 'Safari')
	// 	|| (json.from_browser === 'IE')
	// 	|| (USER_PARAM_BROWSER === 'Safari')
	// 	|| (USER_PARAM_BROWSER === 'IE')
	// ) {
		// 検証の為、ビデオフレームをヘッダーにしまわない
		LayoutCtrl.apiMoveAllVideoFrameToHeader();

		if (mScreenImageTimer) {
			clearInterval(mScreenImageTimer);
			mScreenImageTimer = null;
		}

		$('#video_share_screen_image').show();
	}
}

// 画面共有の画像をビデオ領域にセットする
// スマホ対応(2019/10/10)
// スマホ側では通常の画面共有が行えるため、画像は使用しないため
// 画像処理は行わない（※呼び出さない)
//
function procSetScreen(json){
	var img = document.getElementById('video_share_screen_image');
	img.src = DEFAULT_MEETIN_SCREEN_CAPTURE_PATH + "screen.jpg?" + createRandomString(10);
	img.onload = function() {
		// 現在の画面共有の表示領域のサイズを取得
		orgScreenWidth = $("div#negotiation_share_screen").width();
		orgScreenHeight = $("div#negotiation_share_screen").height();
		// 画像で表示している場合
		var shareScreen = document.getElementById("video_share_screen_image");
		// ビデオ表示領域に表示できる最大のサイズを計算
		getShareScreenSize({"height" : shareScreen.naturalHeight, "width": shareScreen.naturalWidth},  orgScreenHeight, orgScreenWidth, orgScreenHeight, orgScreenWidth);
		// 計算結果を元に画面共有のフレームサイズを再設定する
		$("div#negotiation_share_screen").width(shareScreenWidth).height(shareScreenHeight);
		var left = ($("#fit_rate").width() - $("div#negotiation_share_screen").width()) / 2;
		var top = ($("#fit_rate").height() - $("div#negotiation_share_screen").height()) / 2;
		$("div#negotiation_share_screen").css('left', left + 'px');
		$("div#negotiation_share_screen").css('top', top + 'px');
		img.onload = null;
		// 読み込み完了のメッセージを送る
		sendRequestScreenReadFinished(json.from_peer_id);
	};
}

// 相手の画面共有がオフになったときの処理
function procScreenIsOff(json) {
	if (mScreenImageTimer) {
		clearInterval(mScreenImageTimer);
		mScreenImageTimer = null;
	}

	NEGOTIATION.mIsScreenOn = false;
	$('#negotiation_share_screen').hide();

	// 検証の為、ビデオフレームをヘッダーにしまわない
	LayoutCtrl.apiMoveAllVideoFrameToCenter();

// ビデオレイアウトのリセットは行わない
// 2018/04/20 太田
//	// ビデオレイアウトのリセット
//	$.each(NEGOTIATION.videoArray.show,function(){
//		// ビデオタグのstyleを削除する（移動やリサイズすると付与される）
//		this.removeAttr('style');
//		// ビデオタグを表示するためにstyleを付与する
//		this.css("display", "block");
//	});

	// 画面共有終了したら、カメラをオンにする
	if (!NEGOTIATION.isMyCameraOn) {
		$('#button_camera').trigger("click");
//		refreshMeetinFlashTargetVideo();
	}
}

// 誰かが入室したときの処理
// json.from_peer_id：相手のピアID
// json.from_user_id：相手のユーザーID
// json.from_user_info：相手の氏名
function procEnterRoom(json) {

	//入室時に通知音を鳴らす
	var notification_audio = document.createElement('audio');
	notification_audio.id = "notification_audio";
	notification_audio.src="/webrtc/sounds/notification-chime.wav";
	notification_audio.style.display="none";
	notification_audio.play();

	if($("#desktop_notify_flg").val() != 0) {
		var name = (json.from_user_info == '') ? 'ゲスト' : json.from_user_info;
		displayNotification(name + 'が入室しました', null, 'meet-in');
	}

	LayoutCtrl.enterRoom(json.from_user_id,json.from_user_info,NEGOTIATION.videoArray);
	LayoutCtrl.apiSetVideo(NEGOTIATION.showVideoMode,NEGOTIATION.videoArray.show,NEGOTIATION.videoArray.hide);
	//showEnterRoomDialog(json.from_peer_id, json.from_user_info);

	mUserIdAndUserInfoArray[json.from_user_id] = json.from_user_info;
	mUserIdAndBrowserTable[json.from_user_id] = json.from_browser;

	var userId = $('#user_id').val();

	var elementID = 'video_target_video_area_' + json.from_user_id;

	// Flashでビデオチャット
	// Safariを除外
	if ( (json.from_browser === 'IE') || (USER_PARAM_BROWSER === 'IE') ) {
	// if ((json.from_browser === 'Safari')
	// 	|| (json.from_browser === 'IE')
	// 	|| (USER_PARAM_BROWSER === 'Safari')
	// 	|| (USER_PARAM_BROWSER === 'IE')
	// ) {
		// IEユーザーが入室の場合はビデオOFF画像を表示するようにする(表示を強制するクラスを追加する)
		var imgVideoOffId = "#img_video_off_" + json.from_user_id;
		$(imgVideoOffId).height($("div.full_screen__wrap").height()).width($("div.full_screen__wrap").width());
		$(imgVideoOffId).addClass("forced_img_video_off");
		// IEユーザーにSPユーザーの画面をOFFにするよう通知する
		var data = {
				command : "SP_COMMON",
				userId : $('#user_id').val(),
				connectionId : $('#connection_info_id').val()
		};
		sendCommandByUserId(json.from_user_id, data);

		/*
		var id = 'negotiation_target_flash_' + json.from_user_id;

		$('#negotiation_target_video_relative_' + json.from_user_id).show();
		$('#negotiation_target_video_relative_no_video_' + json.from_user_id).hide();
		// ビデオONにより、アイコン非表示
		spToggleVideo(json.from_user_id, false);

		// Flashがすでに追加されたか？
		var flash = document.getElementById(id);

		// もう追加された
		if (flash) {
		} else
		// まだついかされていない
		{
			var urlString = "/swf/VideoMeeting.swf?" + $('#application_version').val();
			$('#video_target_video_area_' + json.from_user_id).empty();
			var date = new Date();

			// 映像品質値を取得
			mOldReceiveBandwidthLevel = getReceiveBandwidthLevel();
			var qualityVal = "60";

			//  品質の値でクオリティ設定
			switch (mOldReceiveBandwidthLevel) {
				case '0':		// 低
					qualityVal = '20';
					break;
				case '1':		// 中低
					qualityVal = '40';
					break;
				case '2':		// 中
					qualityVal = '60';
					break;
				case '3':		// 中高
					qualityVal = '80';
					break;
				case '4':		// 高
					qualityVal = '100';
					break;
				default:
					break;
			}

			var flashvars = {};
			flashvars.host = location.hostname;
			flashvars.pathname = "test/Meeting";
			if (userId < json.from_user_id) {
				flashvars.room = $('#connection_info_id').val() + "_" + userId + "_" + json.from_user_id;
			} else {
				flashvars.room = $('#connection_info_id').val() + "_" + json.from_user_id + "_" + userId;
			}
			flashvars.username = $('#user_id').val() + "_" + date.getTime();
			flashvars.userId = $('#user_id').val();
			flashvars.targetUserId = json.from_user_id;
			flashvars.width = DEFAULT_FLASH_CAMERA_WIDTH;
			flashvars.height = DEFAULT_FLASH_CAMERA_HEIGHT;
			flashvars.cameraIndex = NEGOTIATION.use_camera_id_flash;
			flashvars.cameraWidth = DEFAULT_FLASH_CAMERA_WIDTH;
			flashvars.cameraHeight = DEFAULT_FLASH_CAMERA_HEIGHT;
			flashvars.cameraFramerate = NEGOTIATION.use_fps;
			flashvars.cameraQuality = qualityVal;		// カメラ画像の品質（0～100）
			flashvars.speexQuality = DEFAULT_FLASH_SPEEX_QUALITY;
			flashvars.nellymoserRate = DEFAULT_FLASH_NELLYMOSER_RATE;
			flashvars.micGain = DEFAULT_FLASH_MIC_GAIN;

			// flashを追加する
			showSWF(urlString, elementID, id, flashvars);
			$('#video_target_connecting_' + json.from_user_id).hide();
			$('#video_target_icon_area_' + json.from_user_id).hide();
			if (!USER_PARAM_IS_MOBILE) {
				$('#negotiation_target_video_' + json.from_user_id).draggable( "disable" );
			}
		}

		$('#video_target_connecting_' + json.from_user_id).hide();
		*/
	} else
	// WebRTCでビデオチャット
	{
		// Videoタグであるか
		var id = 'video_target_video_' + json.from_user_id;
		var id_connection = 'video_target_connecting_' + json.from_user_id;
		var video = document.getElementById(id);
		// videoタグがある
		if (video) {
			// 何もしない
		} else
		// videoタグがない
		{
			$('#video_target_video_area_' + json.from_user_id).empty();
			// videoタグを追加
			addVideoTag(
				elementID,
				id,
				id_connection,
				"video_basis",
				"object-fit: cover;position:absolute; width: 100%; height: 100%;"
			);
			mNegotiationMain.sendRequestVideoStreamByUserId(json.from_user_id, null);
			$('#video_target_connecting_' + json.from_user_id).show();
		}
	}

	$('#negotiation_target_video_' + json.from_user_id).removeAttr('style');
	$('#negotiation_target_video_' + json.from_user_id).css("display", "block");

	for (var key in mMeetinFlashSecurityPanelUserIdTable) {
		$('#negotiation_target_video_' + key).find('.video_big_icon').trigger("click");
		break;
	}

	// 画面共有中にビデオフレームをヘッダーにしまう
	if (NEGOTIATION.mIsScreenOn) {
		LayoutCtrl.apiMoveAllVideoFrameToHeader();
	} else {
	}

	// 名刺表示アイコン(非表示)
	$("#video_target_icon_" + json.from_user_id).find('.video_card_icon').hide();
	updateRoomMembers(Object.keys(mUserIdAndUserInfoArray).length + 1);
	procSendTargetAll(json);

	// レイアウト変更
	spChangeLayout(json.from_user_id, "#5");

	mNegotiationMain.sendEnterRoomReceived(json.from_peer_id);
}

// 接続済みのユーザ情報を送信する(名刺拡張機能で使用するため)
// json.from_peer_id：相手のピアID
// json.from_user_id：相手のユーザーID
// json.from_user_info：相手の氏名
function procSendTargetAll(json) {
	// 接続ユーザへ送信
	sendRequestTargetAll(json.from_peer_id);
}

function procEnterRoomReceived(json) {
	sendRequestProfileImage(json.from_peer_id);
	sendProfileImage(json.from_peer_id);
}

// 誰かが退室したときの処理
// json.from_peer_id：相手のピアID
// json.from_user_id：相手のユーザーID
// json.from_user_info：相手の氏名
function procExitRoom(json) {
	// videoタグの映像ファイルを外す
	var video = document.getElementById('video_target_video_' + json.from_user_id);
	if (video) {
		video.src = "";
		video.srcObject = null;
	}

	// audioタグの音声ファイルを外す
	var audio = document.getElementById('video_target_audio_' + json.from_user_id);
	if (audio) {
		audio.src = "";
		audio.srcObject = null;
	}

	// 相手から受信するストリームのMediaConnectionを切る
	var videoConnectionId = $('#video_target_video_connection_id_' + json.from_user_id).val();
	if (videoConnectionId && videoConnectionId.length > 0) {
		mNegotiationMain.closeConnectionByConnectionId(videoConnectionId);
	}
	var audioConnectionId = $('#video_target_audio_connection_id_' + json.from_user_id).val();
	if (audioConnectionId && audioConnectionId.length > 0) {
		mNegotiationMain.closeConnectionByConnectionId(audioConnectionId);
	}

	LayoutCtrl.exitRoom(json.from_user_id,NEGOTIATION.videoArray);
	LayoutCtrl.apiSetVideo(NEGOTIATION.showVideoMode,NEGOTIATION.videoArray.show,NEGOTIATION.videoArray.hide);
	LayoutCtrl.removeArray(json.from_user_id,NEGOTIATION.videoArray,false);

	// ビデオフレームのローディング画面を表示
	$('#video_target_connecting_' + json.from_user_id).show();

	if (json.from_user_id in mUserIdAndUserInfoArray) {
		delete mUserIdAndUserInfoArray[json.from_user_id];
	}
	if (json.from_user_id in mUserIdAndBrowserTable) {
		delete mUserIdAndBrowserTable[json.from_user_id];
	}

	// 名刺表示アイコン(非表示)
	$("#video_target_icon_" + json.from_user_id).find('.video_card_icon').hide();
	// 人数を更新
	updateRoomMembers(Object.keys(mUserIdAndUserInfoArray).length + 1);

	// 強制ビデオオフの場合はクラスが付いているので、次のユーザーのために外す
	$("#negotiation_target_video_" + json.from_user_id).find(".forced_img_video_off").removeClass("forced_img_video_off");

}

// 再生中のストリームの状態をチェックする
function procStreamInfoDetail(json) {
	var userId = json.from_user_id;
	if (userId) {

		if (json.video_stream_id) {
			var streamId = $('#video_target_video_stream_id_' + userId).val();
			if (json.video_stream_id !== streamId) {
				var connection_id = $('#video_target_video_connection_id_' + userId).val();
				mNegotiationMain.sendRequestVideoStream(
					userId,
					json.from_peer_id,
					null
				);

			}
		}

		if (json.audio_stream_id) {
			var streamId = $('#video_target_audio_stream_id_' + userId).val();
			if (json.audio_stream_id !== streamId) {
				var connection_id = $('#video_target_audio_connection_id_' + userId).val();
				mNegotiationMain.sendRequestAudioStream(
					userId,
					json.from_peer_id,
					null
				);

			}
		}

		if (json.screen_stream_id) {
			var streamId = $('#video_share_screen_stream_id').val();
			if (json.screen_stream_id !== streamId) {
				var connection_id = $('#video_share_screen_connection_id').val();
				mNegotiationMain.sendRequestScreenStream(
					userId,
					json.from_peer_id,
					null
				);

			}
		}
	}
}


//////////////////////////////////////////////////////////
// システム状態関連
//////////////////////////////////////////////////////////

// フォーカスがMeetinに戻った
function procTabIsFocus(json) {
	//$('#user_state_target_focus').attr('class', 'icon-browse-out mi_default_label_icon_3 mi_active');
}

// フォーカスがMeetinから離れた
function procTabIsBlur(json) {
	//$('#user_state_target_focus').attr('class', 'icon-browse-out mi_default_label_icon_3');
}

// ページ遷移日時が要求されたとき
function procRequestEnterNegotiationDatetime(json) {
	sendEnterNegotiationDatetime(json.from_peer_id);
}

// 相手のページ遷移日時を送られたとき
// json.enter_negotiation_datetime：相手のページ遷移日時
// json.from_user_id：相手のuserId
function procEnterNegotiationDatetime(json) {
}

//////////////////////////////////////////////////////////
// カメラ関連
//////////////////////////////////////////////////////////

function procRequestFlashReEnterRoom(json) {
	// WebRTC？Flash？
	var flash = null;
	if (navigator.appName.indexOf("Microsoft") != -1) {
		flash = window['negotiation_target_flash_' + json.from_user_id];
	} else {
		flash = document['negotiation_target_flash_' + json.from_user_id];
	}

	if (flash) {
		meetinFlashTargetVideo_endSession(json.from_user_id);
		meetinFlashTargetVideo_reRegister(json.from_user_id);
	}
}

//////////////////////////////////////////////////////////
// マイク関連
//////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////
// 画面共有関連
//////////////////////////////////////////////////////////

// 画面共有対象選択ダイアログを閉じる
function procRequestCloseScreenChooseDialog(json) {
	mNegotiationMain.cancelChooseDesktopMedia();
}

//////////////////////////////////////////////////////////
// 接続関連
//////////////////////////////////////////////////////////

// 接続先に商談中画面への遷移を許可、または拒否する
function procRequestChangeToNegotiation(json) {
	// 接続画面に空きがあるか？
	var user_id = mNegotiationMain.getEmptyUserId();
	if (!(1 <= user_id && user_id < MEETIN_MAIN_MAX_PEOPLE)) {
		// 接続画面が満員なので、商談中画面への遷移を拒否する
		sendRefuseChangeToNegotiation(json.from_peer_id, 2, "現在満員の為、接続できません");

		return;
	}

	// ３人目以降のFlash禁止処理
	if (NOT_ALLOW_FLASH_FOR_EQUAL_OR_MORE_THEN_3_PEOPLE) {
		// 現在接続中のユーザーにSafariかIEを使ってるユーザーがいるか？
		var totalSafariBrowser = 0;
		var totalIeBrowser = 0;

		for (var key in mUserIdAndBrowserTable) {
			// Safariを除外
			if (mUserIdAndBrowserTable[key] === 'IE') {
				++totalIeBrowser;
			}
			// if (mUserIdAndBrowserTable[key] === 'Safari') {
			// 	++totalSafariBrowser;
			// } else if (mUserIdAndBrowserTable[key] === 'IE') {
			// 	++totalIeBrowser;
			// }
		}

		// SafariかIEがある場合、３人目以降の接続を拒否する
		if (totalSafariBrowser > 0 || totalIeBrowser > 0) {
			sendRefuseChangeToNegotiation(json.from_peer_id, 7, "現在満員です。");
			return;
		}

		// 入室要求を出したユーザーのブラウザがIEの場合
		if (json.from_browser === 'IE') {
		// if (json.from_browser === 'Safari' || json.from_browser === 'IE') {
			// 現在の接続人数を確認（接続人数）
			if (mNegotiationMain.getTotalTargetPeerData() >= 1) {
				sendRefuseChangeToNegotiation(json.from_peer_id, 8, "満員になりました。");
				return;
			}
		}
	}

	// 接続画面入室許可・拒否ダイアログを出す
	showConnectionRequestComingDialog(json.from_peer_id, json.user_info, json.req_staff_type, json.req_staff_id, json.req_client_id);
}

// ゲストが入室要求をキャンセルした場合
function procRequestChangeToNegotiationTimeout(json) {
	var target_peer_id = json.from_peer_id;
	if (target_peer_id in mConnectionRequestComingDialogTargetPeerIdAndDialogIdTable) {
		delete mConnectionRequestComingDialogTargetPeerIdAndDialogIdTable[target_peer_id];
	}

	var id = 'enter_room_dialog_' + target_peer_id;
	$('#' + id).hide();
	hideEnterRoomDialogBackgroundArea();
}

// 商談終了
function procNegotiationFinishProcess(json) {
	// videoタグの映像ファイルを外す
	var video = document.getElementById('video_target_video_' + json.from_user_id);
	if (video) {
		video.src = "";
		video.srcObject = null;
	}

	// audioタグの音声ファイルを外す
	var audio = document.getElementById('video_target_audio_' + json.from_user_id);
	if (audio) {
		audio.src = "";
		audio.srcObject = null;
	}

	// 相手から受信するストリームのMediaConnectionを切る
	var videoConnectionId = $('#video_target_video_connection_id_' + json.from_user_id).val();
	if (videoConnectionId && videoConnectionId.length > 0) {
		mNegotiationMain.closeConnectionByConnectionId(videoConnectionId);
	}
	var audioConnectionId = $('#video_target_audio_connection_id_' + json.from_user_id).val();
	if (audioConnectionId && audioConnectionId.length > 0) {
		mNegotiationMain.closeConnectionByConnectionId(audioConnectionId);
	}

	// 自分が相手に送信するストリームのMediaConnectionを切る
	mNegotiationMain.stopSendVideoStream(json.from_peer_id);
	mNegotiationMain.stopSendAudioStream(json.from_peer_id);
	mNegotiationMain.stopSendScreenStream(json.from_peer_id);

	// ビデオフレームのローディング画面を表示
	$('#video_target_connecting_' + json.from_user_id).show();

	LayoutCtrl.exitRoom(json.from_user_id,NEGOTIATION.videoArray);
	LayoutCtrl.apiSetVideo(NEGOTIATION.showVideoMode,NEGOTIATION.videoArray.show,NEGOTIATION.videoArray.hide);
	LayoutCtrl.removeArray(json.from_user_id,NEGOTIATION.videoArray,false);

	if (json.from_user_id in mUserIdAndUserInfoArray) {
		delete mUserIdAndUserInfoArray[json.from_user_id];
	}
	if (json.from_user_id in mUserIdAndBrowserTable) {
		delete mUserIdAndBrowserTable[json.from_user_id];
	}
	mNegotiationMain.removeUserId(json.from_user_id);
	// 人数更新
	updateRoomMembers(Object.keys(mUserIdAndUserInfoArray).length + 1);
	// 退室者のビデオ領域を非表示にする
	$("#negotiation_target_video_" + json.from_user_id).hide();
	// 強制ビデオオフの場合はクラスが付いているので、次のユーザーのために外す
	$("#negotiation_target_video_" + json.from_user_id).find(".forced_img_video_off").removeClass("forced_img_video_off");
	// レイアウト変更
	var nextBigId = $(".big_video_area").data("id");
	if(nextBigId == json.from_user_id){
		// 大きい映像の人が抜ける場合は自分を大きくする
		nextBigId = $('#user_id').val();
	}
	spChangeLayout(nextBigId, "#6");
}

// 再接続開始
function procReconnectStart(json) {
	// videoタグの映像ファイルを外す
	var video = document.getElementById('video_target_video_' + json.from_user_id);
	if (video) {
		video.src = "";
		video.srcObject = null;
	}

	// audioタグの音声ファイルを外す
	var audio = document.getElementById('video_target_audio_' + json.from_user_id);
	if (audio) {
		audio.src = "";
		audio.srcObject = null;
	}

	// 相手から受信するストリームのMediaConnectionを切る
	var videoConnectionId = $('#video_target_video_connection_id_' + json.from_user_id).val();
	if (videoConnectionId && videoConnectionId.length > 0) {
		mNegotiationMain.closeConnectionByConnectionId(videoConnectionId);
	}
	var audioConnectionId = $('#video_target_audio_connection_id_' + json.from_user_id).val();
	if (audioConnectionId && audioConnectionId.length > 0) {
		mNegotiationMain.closeConnectionByConnectionId(audioConnectionId);
	}

	// 自分が相手に送信するストリームのMediaConnectionを切る
	mNegotiationMain.stopSendVideoStream(json.from_peer_id);
	mNegotiationMain.stopSendAudioStream(json.from_peer_id);
	mNegotiationMain.stopSendScreenStream(json.from_peer_id);

	// ビデオフレームのローディング画面を表示
	$('#video_target_connecting_' + json.from_user_id).show();
}

// ゲスト側からの入室キャンセル
function procCancelConnection(json) {
	var target_peer_id = json.from_peer_id;
	if (target_peer_id in mConnectionRequestComingDialogTargetPeerIdAndDialogIdTable) {
		delete mConnectionRequestComingDialogTargetPeerIdAndDialogIdTable[target_peer_id];
	}

	var id = 'enter_room_dialog_' + target_peer_id;
	$('#' + id).hide();
	hideEnterRoomDialogBackgroundArea();
}

// ゲスト側からの入室キャンセル
function procRequestChangeToNegotiationTimeout(json) {
	var target_peer_id = json.from_peer_id;
	if (target_peer_id in mConnectionRequestComingDialogTargetPeerIdAndDialogIdTable) {
		delete mConnectionRequestComingDialogTargetPeerIdAndDialogIdTable[target_peer_id];
	}

	var id = 'enter_room_dialog_' + target_peer_id;
	$('#' + id).hide();
	hideEnterRoomDialogBackgroundArea();
}

// ログイン情報通知
function procSendLogin(json) {
	// ビデオタグ設定
//console.log('procSendLogin id=('+json.from_user_id+') staff_type=('+json.req_staff_type+') staff_id=('+json.req_staff_id+') client_id=('+json.req_client_id+')');
	if( json.from_user_id ){
		$("#target_video_staff_type_" + json.from_user_id).val(json.req_staff_type);
		$("#target_video_staff_id_" + json.from_user_id).val(json.req_staff_id);
		$("#target_video_client_id_" + json.from_user_id).val(json.req_client_id);

		// サイドメニュー表示
		$("#video_target_icon_" + json.from_user_id).find('.video_card_icon').show();	// 名刺
	}
}

function setTagetAll(json) {
//	console.log('setTagetAll id=('+json.from_user_id+') staff_type=('+json.req_staff_type+') staff_id=('+json.req_staff_id+') client_id=('+json.req_client_id+')');
	if( json.from_user_id ){
		$("#target_video_staff_type_" + json.from_user_id).val(json.req_staff_type);
		$("#target_video_staff_id_" + json.from_user_id).val(json.req_staff_id);
		$("#target_video_client_id_" + json.from_user_id).val(json.req_client_id);
	}
}

function setLock(json) {
	console.log('setLock room_locked=('+json.room_locked+')');
	$("#room_locked").val(json.room_locked);

	if(json.room_locked == "0"){
		// Roomアンロック
		$(".icon-login").css('color','');
		$(".icon-login").css('visibility','hidden');
		$(".icon-login").css('display','none');
		$("#button_lock_key").text("このルームをロックする");
	}else{
		// Roomロック
		$(".icon-login").css('color','#000');
		$(".icon-login").css('visibility','visible');
		$(".icon-login").css('display','');
		$("#button_lock_key").text("このルームのロックを解除する");
	}

}

function updateRoomMembers(members) {
	$('#room_members').html(members);
}

//////////////////////////////////////////////////////////
// ビデオフレーム関連
//////////////////////////////////////////////////////////

// プロフィール画像のリンクを送る
function procRequestProfileImage(json) {
	sendProfileImage(json.from_peer_id);
}

// プロフィール画像のリンクが届いたときの処理
function procProfileImage(json) {
	$('#video_target_video_background_image_' + json.from_user_id).prop('src', json.profile_image);
}

//////////////////////////////////////////////////////////
// 共有メモ関連
//////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////
// ホワイトボード関連
//////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////
// 資料共有関連
//////////////////////////////////////////////////////////
