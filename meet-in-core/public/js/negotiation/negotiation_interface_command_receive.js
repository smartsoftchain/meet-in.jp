var mScreenImageTimer = null;

const MEETIN_SCREEN_CAPTURE_BY_CANVAS_SHOW_WAIT = 1000;
var receiveMsgCount = 0;				// 画面共有 読込メッセージ完了数
var receiveMsgTimer = null;
const ROOM_MODE_1 = 1;					// 通常ユーザー
const ROOM_MODE_2 = 2;					// 同席ユーザー
const BORDER_SAFARI_VERSION = 11;		// meet-inを使用できるsafariのバージョン敷居値(11以上が使用できる）
const BORDER_IE_VERSION = 11;
const BORDER_EDGE_VERSION = 15;
const BORDER_FIREFOX_VERSION = 65;
const BORDER_CHROME_VERSION = 66;
const BORDER_OPERA_VERSION = 43;
const BORDER_ANDROID_BROWSER_VERSION = 76;
const BORDER_ANDROID_CHROME_VERSION = 69;
const BORDER_ANDROID_FIREFOX_VERSION = 68;

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
		procRequestCloseScreenChooseDialog(json);
	}

	// 画面読み込み処理を行う
	else if (json.command === "REQUEST_WRITE_FINISHED") {
		// IEのみ対応する
		// IEはWebRtc I/Fにて画面共有を行えないため、サーバの画像を読込表示する
		if ( (USER_PARAM_BROWSER === 'IE') ) {
			procSetScreen(json);
		}
		//procSetScreen(json);
	}

	// 画面書き込み処理を行う
	else if (json.command === "REQUEST_READ_FINISHED") {

		++receiveMsgCount;
//console.log("=== REQUEST_READ_FINISHED::receiveMsgCount=("+receiveMsgCount+")");

		// 接続先の人数分のメッセージがきたら、書き込み処理
		if (mNegotiationMain.getTotalTargetPeerData() == receiveMsgCount) {
//console.log("●●● REQUEST_READ_FINISHED::getTotalTargetPeerData=("+mNegotiationMain.getTotalTargetPeerData()+")");
			receiveMsgCount = 0;
			if(receiveMsgTimer !== null){
				clearTimeout(receiveMsgTimer);
				receiveMsgTimer = null;
			}
			screenCaptureByCanvasProc(json);
		}
		// 一人目からのメッセージが来て、3秒後に強制実行
		if (receiveMsgCount == 1 || receiveMsgCount > mNegotiationMain.getTotalTargetPeerData() ) {
//console.log("◎◎◎REQUEST_READ_FINISHED::３秒");
			receiveMsgTimer = setTimeout(screenCaptureByCanvasProc(json),  3000);
		}
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
		// ユーザー名表示箇所のwidthを調整 videoが小さくなる
		adjustUserNameWidth(userNamesOriginalWidthForVideo, true);
	}

	else if (json.command === "DRAW_TEXT") {
		receiveDocumentDrawTextJson(json);
	}

	//////////////////////////////////////////////////////////
	// 挙手・リアクション関連
	//////////////////////////////////////////////////////////
	else if (json.command === "REACTION") {
		receiveReactionCommandJson(json)
	}
	else if (json.command === "CLOSE_CONNECTION") {
		receiveCloseConnectionJson(json);
	}

	//////////////////////////////////////////////////////////
	// 共有メモ・ホワイトボード・資料・文字起こし の同期関連
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

	//////////////////////////////////////////////////////////
	// 電子契約共有関連
	//////////////////////////////////////////////////////////

	else if (json.command === "E_CONTRACT") {
		receiveEContractJson(json);
	}

	// Staff 情報が届いたとき
	else if (json.command === "SEND_TARGET_ALL") {
		setTagetAll(json);
	}

	// Staff 情報が届いたとき
	else if (json.command === "SEND_LOCK") {
		setLock(json);
	}
	else if (json.command === "SEND_ENTER_LOCKED_ROOM_RESULT") {
		clearRequestEnterLockedRoomHtml(json.locked_token);
	}

	//////////////////////////////////////////////////////////
	// 文字起こし関連
	//////////////////////////////////////////////////////////

	else if (json.command === "AUDIO_TEXT") {
		receiveAudioTextJson(json);
	}

	else if (json.command === "SENTIMENT_ANALYSIS") {
		receiveSentimentAnalysis(json);
	}

	else if (json.command === "AUDIO_OR_SENTIMENT_STATUS") {
		receiveAudioOrSentimentStatus(json);
	}

	// ========================================================================
	// SPからの特別なメッセージ処理
	// 現在はIEに対してビデオをオフにする機能だけなので直接記述していますが
	// この先処理が増えるようなら別関数へ切り出す
	// ========================================================================
	else if (json.command === "SP_COMMON") {
		$('#negotiation_target_video_relative_no_video_'+json.userId).addClass("forced_img_video_off");
	}
	// ビューティーモード通知
	else if (json.command === "BEAUTY_MODE") {
		// ビューティーモードの反映
		settingBeautyMode(json.requestUserId, json.beautyMode);
	}
	// 輝度設定の同期処理
	else if(json.command === "CAMERA_BRIGHT") {
		var brightVal = 100 + parseInt(json.cameraBright);
		$('#video_target_video_'+ json.requestUserId ).css('filter','brightness('+brightVal+'%)');
	}
	// IEユーザーの退室処理
	else if(json.command === "IE_LEAVE_ROOM"){
		if (!mNegotiationMainReconnectDialogId) {
			mNegotiationMainReconnectDialogId = createCommonDialogWithButton(
					"退室",
					"このルームにはIEで入室できません。",
					true,
					true,
					false,
					null,
					null,
					100000001,
					true,
					true,
					"終了",
					function() {
						// 終了ボタン押下イベント
						$("#button_negotiation_finish").trigger('click');
						$("#footer_button_negotiation_finish").trigger('click');
					}
				);
		}
	}
	// メッセージを送った相手がいない.
	else if(json.command === "TARGET_NOT_FOUND"){
		// 画面にコントロール不能なUIが残っていれば退出扱いで撤去.
		for(key in mUsersInfoDict){
			if(mUsersInfoDict[key].from_peer_id === json.target_peer_id) {
				procExitRoom({from_user_id:key});
			}
		}
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
		$('#negotiation_target_video_relative_no_video_' + json.from_user_id).hide();
		myVideoCapture(json.from_user_id);
	} else {
		$('#video_target_video_background_image_camera_' + json.from_user_id).prop('src', '/img/icon_video_off.png');
		$('#negotiation_target_video_relative_no_video_' + json.from_user_id).show();
		// ヘッダーアイコンをmeet inアイコンに変更する
		$("li#video_list_" + json.from_user_id).find("img").attr("src", "/img/meet-in-logo_gray.png");
	}

	if (json.has_audio_stream) {// マイクの状態を更新
		$('#video_target_video_background_image_mic_' + json.from_user_id).prop('src', '/img/icon_mic.png');
		$('.other_video_mic_off_icon_' + json.from_user_id).css("display", "none");
	} else {
		$('#video_target_video_background_image_mic_' + json.from_user_id).prop('src', '/img/icon_mic_off.png');
		$('.other_video_mic_off_icon_' + json.from_user_id).css("display", "block");
	}

	// DOMに書き込み、それを元に設定する方法にする
	// ユーザーの名前の更新
	video_list.find('.user_info').text(valueCheck(json.from_user_info) ? json.from_user_info : DEFAULT_USER_NAME);
	// ユーザー入力の名前がある場合に、その名前をユーザー一覧で表示する
	let user_name = '';
	if (valueCheck(json.from_user_info)) {
		user_name = json.from_user_info;
	} else if (valueCheck(json.from_user_name)) {
		user_name = json.from_user_name;
	} else {
		user_name = DEFAULT_USER_NAME;
	}
	video_list.find('.user_name').text(user_name);
	video_list.find('span.user_info').text(user_name); // スペック詳細表示箇所のユーザー名も更新する

	// 更新されたユーザー名一覧を再取得し、videoに反映させる
	const userListElements = $('.video_list_wrap').children('li');
	const userNamesForVideo = {};

	userListElements.each(function() {
		if ($(this).css('display') !== 'none') {
			const dataId = $(this).attr('data-id');
			const userName = $('#video_list_' + dataId).find('.video_user_name').text();
			userNamesForVideo[dataId] = userName;
		}
	});
	// tplの該当箇所にユーザー名を反映する
	Object.keys(userNamesForVideo).forEach(function(dataId) {
		$('#negotiation_target_video_' + dataId).find('.user_name').text(userNamesForVideo[dataId]);
		calculateWidthFromString(userNamesForVideo[dataId]);

		const originalUserNameAreaWidth = calculateWidthFromString(userNamesForVideo[dataId]);
		userNamesOriginalWidthForVideo[dataId] = originalUserNameAreaWidth + 30; // 30は調整値
	});

	Object.keys(userNamesOriginalWidthForVideo).forEach(function(dataId) {
		//画面描画時に反映
		adjustWidthInVideo(dataId, userNamesOriginalWidthForVideo);

		// リサイズ時にwidth調節
		$("#negotiation_target_video_" + dataId).resize( function(e) {
			adjustWidthInVideo(dataId, userNamesOriginalWidthForVideo);
		});
		
	});

	// フォーカス状態の更新
	video_list.find('.icon-browse-focus').changeClass(json.has_focus,'mi_active');
	video_list.find('.icon-browse-focus').addClass("video-tooltip-color");
	// ビデオ状態の更新
	video_list.find('.icon-video').changeClass(json.has_video_stream,'mi_active');
	// マイクの状態を更新
	video_list.find('.icon-microphone').changeClass(json.has_audio_stream,'mi_active');

	// ユーザーのデバイスの更新
	video_list.find('.icon-device').changeClass(!NEGOTIATION.isDeviceMob(json.user_agent),'icon-pc');
	video_list.find('.icon-device').changeClass(NEGOTIATION.isDeviceMob(json.user_agent),'icon-tab');

	// OS, ブラウザ, ブラウザバージョンの表示文字列
	var platformInfo = json.from_os + "(" + json.from_os_version + ") on " + json.from_browser;
	var browserVersion = " (<span class='version_color'>"+json.from_browser_version+"</span>)";
	video_list.find('.browser_version').html(browserVersion);

	// ブラウザのメジャーバージョンのみ取得する
	var browserMajorVersion = Number(json.from_browser_version.split(".")[0]);
	// 使用可能なブラウザか判定結果用フラグ
	var permissionBrowserFlg = true;
	if(!NEGOTIATION.isDeviceMob(json.user_agent)){
		// PC用アイコンを表示する
		video_list.find('.icon-pc').attr('user-platform', platformInfo);
		// ブラウザ毎のバージョン判定を行う
		if (json.from_browser === 'Chrome' && browserMajorVersion < BORDER_CHROME_VERSION) {
			permissionBrowserFlg = false;
		} else if (json.from_browser === 'Firefox' && browserMajorVersion < BORDER_FIREFOX_VERSION) {
			permissionBrowserFlg = false;
		} else if (json.from_browser === 'IE' && browserMajorVersion < BORDER_IE_VERSION) {
			permissionBrowserFlg = false;
		} else if (json.from_browser === 'Safari' && browserMajorVersion < BORDER_SAFARI_VERSION) {
			permissionBrowserFlg = false;
		}else if (json.from_browser === 'Edge' && browserMajorVersion < BORDER_EDGE_VERSION) {
			permissionBrowserFlg = false;
		}
	}else{
		// タブレット用アイコンを表示する
		video_list.find('.icon-tab').attr('user-platform', platformInfo);
		// ブラウザ毎のバージョン判定を行う
		if (json.from_browser === 'Chrome' && browserMajorVersion < BORDER_ANDROID_CHROME_VERSION) {
			permissionBrowserFlg = false;
		} else if (json.from_browser === 'Firefox' && browserMajorVersion < BORDER_ANDROID_FIREFOX_VERSION) {
			permissionBrowserFlg = false;
		} else if (json.from_browser === 'Safari' && browserMajorVersion < BORDER_SAFARI_VERSION) {
			permissionBrowserFlg = false;
		}
	}
	// ブラウザのバージョン判定結果により、使用不可の場合はバージョンの色を変更する
	if(!permissionBrowserFlg){
		video_list.find('.version_color').css("color", "#E65D5D");
	}

	// DOMを元に吹き出し設定
	video_list.tooltipster(
		'content', video_list.find('.mi_header_status_icon').html()
	);

	mUserIdAndUserInfoArray[json.from_user_id] = json.from_user_info;
	mUserIdAndBrowserTable[json.from_user_id] = json.from_browser;

	// ルームモードが同席モードの場合ルームモードを一旦退避し、ユーザ状態を更新後、ルームモードが更新されないようにする
	// ※同席コードは変更されないようにする
	var from_room_mode_old = null;
	if( typeof mUsersInfoDict[json.from_user_id] != "undefined" ) {
		if( mUsersInfoDict[json.from_user_id]["from_room_mode"] == ROOM_MODE_2) {
			from_room_mode_old = mUsersInfoDict[json.from_user_id]["from_room_mode"];
		}
	}
	mUsersInfoDict[json.from_user_id] = json;
	if( from_room_mode_old ) {
		mUsersInfoDict[json.from_user_id]["from_room_mode"] = from_room_mode_old;
	}
}

// 相手のカメラがオンになったときの処理
function procCameraIsOn(json) {
	var $video_list =	$('#video_list_' + json.from_user_id);

	$('#video_target_video_background_image_camera_' + json.from_user_id).prop('src', '/img/icon_video.png');
	$('#negotiation_target_video_relative_' + json.from_user_id).show();
	$('#negotiation_target_video_relative_no_video_' + json.from_user_id).hide();

	// マイクオフアイコン表示時のスタイル指定
	const isShowMicOffIcon = $('#negotiation_target_video_relative_' + json.from_user_id).find('.other_video_mic_off_icon_' + json.from_user_id).css('display') === 'block';
	const targetIconWrapElement = $('#negotiation_target_video_' + json.from_user_id).find('.mi_video_icon_wrap');
	const hasLessThanSmall = targetIconWrapElement.hasClass('small') || targetIconWrapElement.hasClass('more_small') || targetIconWrapElement.hasClass('extra_small');

	let leftAdjustValue = '10px';
	if (isShowMicOffIcon) {
		// マイクオフアイコン表示時の場合
		leftAdjustValue = '35px';
	}
	if (isShowMicOffIcon && hasLessThanSmall) {
		// マイクオフアイコン表示時　かつ 小さいアイコン表示の場合
		leftAdjustValue = '28px';
	}
	$('#negotiation_target_video_relative_' + json.from_user_id).find('.on_video').css('left', leftAdjustValue);

	// DOMに書き込み、それを元に設定する方法にする
	// ビデオ状態の更新
	$video_list.find('.icon-video').changeClass(true,'mi_active');
	$video_list.find('.icon-video').addClass("video-tooltip-color");

	// DOMを元に吹き出し設定
	$video_list.tooltipster('content', $video_list.find('.mi_header_status_icon').html());
}

// 相手のカメラがオフになったときの処理
function procCameraIsOff(json) {
	var $video_list =	$('#video_list_' + json.from_user_id);

	$('#video_target_video_background_image_camera_' + json.from_user_id).prop('src', '/img/icon_video_off.png');
	$('#negotiation_target_video_relative_no_video_' + json.from_user_id).show();
	// マイクオフアイコンオン時のスタイル指定
	$('#negotiation_target_video_relative_' + json.from_user_id).find('.on_video').css('left', '10px');

	// DOMに書き込み、それを元に設定する方法にする
	// ビデオ状態の更新
	$video_list.find('.icon-video').changeClass(false,'mi_active');
	$video_list.find('.icon-video').addClass("video-tooltip-color");

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
	$video_list.find('.icon-microphone').addClass("video-tooltip-color");

	// DOMを元に吹き出し設定
	$video_list.tooltipster('content', $video_list.find('.mi_header_status_icon').html());

	// 相手のマイクOFFアイコンを非表示
	$('.other_video_mic_off_icon_' + json.from_user_id).css('display', 'none');
	// マイクオフアイコン非表示時のleftに戻す
	$('#negotiation_target_video_relative_' + json.from_user_id).find('.on_video').css('left', '10px');
}

// 相手のマイクがオフになったときの処理
function procMicIsOff(json) {
	var $video_list =	$('#video_list_' + json.from_user_id);

	$('#video_target_video_background_image_mic_' + json.from_user_id).prop('src', '/img/icon_mic_off.png');

	// DOMに書き込み、それを元に設定する方法にする
	// マイクの状態を更新
	$video_list.find('.icon-microphone').changeClass(false,'mi_active');
	$video_list.find('.icon-microphone').addClass("video-tooltip-color");

	// DOMを元に吹き出し設定
	$video_list.tooltipster('content', $video_list.find('.mi_header_status_icon').html());

	// 相手のマイクOFFアイコンを表示
	$('.other_video_mic_off_icon_' + json.from_user_id).css('display', 'block');

	const isShowMicOffIcon = $('#negotiation_target_video_relative_' + json.from_user_id).find('.other_video_mic_off_icon_' + json.from_user_id).css('display') === 'block';
	const targetIconWrapElement = $('#negotiation_target_video_' + json.from_user_id).find('.mi_video_icon_wrap');
	const hasLessThanSmall = targetIconWrapElement.hasClass('small') || targetIconWrapElement.hasClass('more_small') || targetIconWrapElement.hasClass('extra_small');

	let leftAdjustValue = '10px';
	if (isShowMicOffIcon) {
		// マイクオフアイコン表示時の場合
		leftAdjustValue = '35px';
	}
	if (isShowMicOffIcon && hasLessThanSmall) {
		// マイクオフアイコン表示時　かつ 小さいアイコン表示の場合
		leftAdjustValue = '28px';
	}
	$('#negotiation_target_video_relative_' + json.from_user_id).find('.on_video').css('left', leftAdjustValue);
}

// 相手の画面共有がオンになったときの処理
function procScreenIsOn(json) {

	// 画面共有の際に 強制的にカメラをオフにする為、画面共有から戻ったときの為に値を保持する.
	NEGOTIATION.setStorageMyCameraFlg(NEGOTIATION.isMyCameraOn);

	NEGOTIATION.mIsScreenOn = true;
	hideBehindDocument(); // 資料が表示されていたら、資料を非表示にする

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
		// if (NEGOTIATION.isMyCameraOn) {
		// 	$('#button_camera').trigger("click");
		// }
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

	if (NEGOTIATION.mIsScreenOn) { // 画面共有前に資料を展開していたら、表示する
		showBehindDocument();
	}

	NEGOTIATION.mIsScreenOn = false;

	if (mScreenImageTimer) {
		clearInterval(mScreenImageTimer);
		mScreenImageTimer = null;
	}

	var doc = window.document;
	var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
	if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
//		console.log("通常表示");
	}
	else {
//		console.log("フルスクリーン表示中！！");
		cancelFullScreen.call(doc);
	}

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

	// 画面共有終了時に、画面共有前のカメラがオンだった場合にカメラをオンにする
	if (NEGOTIATION.isStorageMyCameraOn()) {
	// 	$('#button_camera').trigger("click"); // 画面共有中カメラを切らなくしたため操作しないようになった.
	}
	NEGOTIATION.resetStorageMyCameraFlg();

	$("#header_video_reset").trigger('click');　// レイアウト元に戻す（初期化）
}

// 誰かが入室したときの処理
// json.from_peer_id：相手のピアID
// json.from_user_id：相手のユーザーID
// json.from_user_info：相手の氏名
function procEnterRoom(json) {
	// IEユーザーの場合は、このルームに同席者が存在する場合、入室制限を行う
	var chechRoomMode2 = false;
	if ( (json.from_browser === 'IE') || (USER_PARAM_BROWSER === 'IE') ) {
		if($("#room_mode").val() == ROOM_MODE_2){
			// 自分が同席モードの場合
			chechRoomMode2 = true;
		}else{
			// 自分以外のユーザーをチェック
			for(key in mUsersInfoDict){
				if(mUsersInfoDict[key]["from_room_mode"] == ROOM_MODE_2){
					chechRoomMode2 = true;
					break;
				}
			}
		}
		if(chechRoomMode2){
			// 同席者が存在する場合はメッセージを返す
			var data = {
					command : "IE_LEAVE_ROOM"
			};
			sendCommandByUserId(json.from_user_id, data);
		}
	}

	// 入室者が「同席者ではない」と「IEユーザーの入室かつ、このルームに同席者が存在しない」場合のみ、ビデオなどの初期化を行う
	if(json.from_room_mode == ROOM_MODE_1 && !chechRoomMode2){
		//入室時に通知音を鳴らす
		wa.loadFile("/webrtc/sounds/notification-chime.wav", function(buffer) {
			wa.play(buffer);
		});

		if($("#desktop_notify_flg").val() != 0) {
			var name = (json.from_user_info == '') ? 'ゲスト' : json.from_user_info;
			displayNotification(name + 'が入室しました', null, 'meet-in');
		}

		LayoutCtrl.enterRoom(json.from_user_id,json.from_user_info,NEGOTIATION.videoArray);
		LayoutCtrl.apiSetVideo(NEGOTIATION.showVideoMode,NEGOTIATION.videoArray.show,NEGOTIATION.videoArray.hide);

		mUserIdAndUserInfoArray[json.from_user_id] = json.from_user_info;
		mUserIdAndBrowserTable[json.from_user_id] = json.from_browser;
		mUsersIdAndUserEnterDateTime[json.from_user_id] = json.enter_datetime;

		// ルームモードが同席モードの場合ルームモードを一旦退避し、ユーザ状態を更新後、ルームモードが更新されないようにする
		// ※同席コードは変更されないようにする
		var from_room_mode_old = null;
		if( typeof mUsersInfoDict[json.from_user_id] != "undefined" ) {
			if( mUsersInfoDict[json.from_user_id]["from_room_mode"] == ROOM_MODE_2) {
				from_room_mode_old = mUsersInfoDict[json.from_user_id]["from_room_mode"];
			}
		}
		mUsersInfoDict[json.from_user_id] = json;
		if( from_room_mode_old ) {
			mUsersInfoDict[json.from_user_id]["from_room_mode"] = from_room_mode_old;
		}

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
			var id = 'negotiation_target_flash_' + json.from_user_id;

			$('#negotiation_target_video_relative_' + json.from_user_id).show();
			$('#negotiation_target_video_relative_no_video_' + json.from_user_id).hide();

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
		updateRoomMembersWrap();
		procSendTargetAll(json);
	}
	// 入室者に自分のビューティモード設定を通知する
	var data = {
			command : "BEAUTY_MODE",
			requestUserId : userId,
			beautyMode : localStorage.getItem('beauty_mode')
	};
	sendCommandByUserId(json.from_user_id, data);
	
	// 輝度設定の同期処理
    var data = {
        command : "CAMERA_BRIGHT",
        requestUserId : $('#user_id').val(),
        cameraBright : localStorage.getItem('use_bright')
    };
	sendCommandByUserId(json.from_user_id, data);

	mNegotiationMain.sendEnterRoomReceived(json.from_peer_id);

	// SPEC: 1番最後に入室した人(自分を除く)を大きく表示されるようにする.
	if(json.from_room_mode == ROOM_MODE_1) {
		$('#negotiation_target_video_' + json.from_user_id).find('.video_big_icon').trigger("click");
	}

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
		// 「src = ""」を行うと、Edgeでのみhttps://xxx/roomのリクエストを投げるのでコメント化
		//video.src = "";
		video.srcObject = null;
	}

	// audioタグの音声ファイルを外す
	var audio = document.getElementById('video_target_audio_' + json.from_user_id);
	if (audio) {
		// 「src = ""」を行うと、Edgeでのみhttps://xxx/roomのリクエストを投げるのでコメント化
		//audio.src = "";
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
	if (json.from_user_id in mUsersInfoDict) {
		delete mUsersInfoDict[json.from_user_id];
	}

	// 名刺表示アイコン(非表示)
	$("#video_target_icon_" + json.from_user_id).find('.video_card_icon').hide();
	// 人数を更新
	updateRoomMembersWrap();

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

	/*
	// 前回 画面共有で親になったユーザ が ブラウザの「共有を停止」を押下して終わらせてしまった状況を救済.
	if( $('#negotiation_share_screen_icon_frame')) {
		$('#negotiation_share_screen_icon_frame').css('background-color','rgba(0,0,0,0)'); // 黒幕を一時的に撤去(故に元に戻す必要なし)
	}
	*/

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
		// 「src = ""」を行うと、Edgeでのみhttps://xxx/roomのリクエストを投げるのでコメント化
		//video.src = "";
		video.srcObject = null;
	}

	// audioタグの音声ファイルを外す
	var audio = document.getElementById('video_target_audio_' + json.from_user_id);
	if (audio) {
		// 「src = ""」を行うと、Edgeでのみhttps://xxx/roomのリクエストを投げるのでコメント化
		//audio.src = "";
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
	if (json.from_user_id in mUsersInfoDict) {
		delete mUsersInfoDict[json.from_user_id];
	}
	mNegotiationMain.removeUserId(json.from_user_id);
	// 人数更新
	updateRoomMembersWrap();

	// SPEC. 最後に入室した人が退室した場合は、その前に入室した人が表示される(自分を除く).
	delete mUsersIdAndUserEnterDateTime[json.from_user_id]; // 退室した人の入室時間を削除.
	let last_enter_user = Object.entries(mUsersIdAndUserEnterDateTime).sort((a, b) => new Date(a[1]) - new Date(b[1])).slice(-1)[0];
	if(last_enter_user != undefined) {
		$('#negotiation_target_video_' + last_enter_user[0]).find('.video_big_icon').trigger("click");
	}

}

// 再接続開始
function procReconnectStart(json) {
	// videoタグの映像ファイルを外す
	var video = document.getElementById('video_target_video_' + json.from_user_id);
	if (video) {
		// 「src = ""」を行うと、Edgeでのみhttps://xxx/roomのリクエストを投げるのでコメント化
		//video.src = "";
		video.srcObject = null;
	}

	// audioタグの音声ファイルを外す
	var audio = document.getElementById('video_target_audio_' + json.from_user_id);
	if (audio) {
		// 「src = ""」を行うと、Edgeでのみhttps://xxx/roomのリクエストを投げるのでコメント化
		//audio.src = "";
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


		// モニタリングモード時のUIの整理
		if(ROOM_MODE_2 != $('#room_mode').val()) {
			// サイドメニュー表示
			$("#video_target_icon_" + json.from_user_id).find('.video_card_icon').show();	// 名刺
		}
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

		clearRequestEnterLockedRoomInterval();
	}else{
		// Roomロック
		$(".icon-login").css('color','#000');
		$(".icon-login").css('visibility','visible');
		$(".icon-login").css('display','');
		$("#button_lock_key").text("このルームのロックを解除する");

		setRequestEnterLockedRoomInterval();
	}

}

/**
 * 同席モードユーザーの追加により、
 * メンバーのカウント方法が変わったのでラッパー関数を作成
 * 同席メンバーはカウントしない。
 * @returns
 */
function updateRoomMembersWrap(){

	/*
	// 元の呼び出しが「Object.keys(mUserIdAndUserInfoArray).length + 1」なので１から始める
	var memberCount = 1;
	if($("#room_mode").val() == ROOM_MODE_2){
		// ただし自分が同席モードの場合は0から始める
		memberCount = 0;
	}
	for(key in mUsersInfoDict){
		if(mUsersInfoDict[key]["from_room_mode"] == ROOM_MODE_1){
			memberCount++;
		}
	}
	*/

	// この処理が呼ばれる前に mUsersInfoDict 辞書にdeleteを実行するなど、「項目」を作ったときと時系列的に状態が違い結果がずれてしまうことがあった.
	// 項目と、カウンターで2重で計算を行わず、項目を作った1度目の処理の結果をカウントすることで絶対にずれないようにした.
	var memberCount = 0;
	var videoElements = document.querySelectorAll(".video_list_wrap li");
	Array.prototype.forEach.call(videoElements,function(e)
	{
		// 表示状態を確認.
		if($(e).css('display') == 'block')
		{
			var key = $(e).data('id');
			// 同席モードはカウントしない.
			if(!mUsersInfoDict[key] || mUsersInfoDict[key]["from_room_mode"] != ROOM_MODE_2) {
				memberCount++;
			}
		}
	});
	updateRoomMembers(memberCount);

	$("#header_video_reset").trigger('click');　// レイアウトを元に戻す.

	let showVideoCount = 0;
	$('.video_wrap').each(function() {
		const dataId = $(this).attr('data-id');
		// 非表示の方法等変更する場合は、こちらも併せて変更すること。
		const isHidden = $('#negotiation_target_video_' + dataId).css('left') === '-99999px';
		if ($('#negotiation_target_video_' + dataId).css('display') !== 'none'
		&& !isHidden) {
			showVideoCount++;
		}
	});
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
