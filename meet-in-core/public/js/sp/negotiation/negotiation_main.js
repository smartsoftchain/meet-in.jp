const CONNECTION_TIMEOUT = 100;// コネクションを開始する待ち時間（ミリ秒）
const SEND_TARGET_ALL = null;// コマンドの送信先をALLにする定数
const MY_CAMERA_RESOLUTION = getVideoConstraintsSP("qvga");	// カメラの解像度
const DEFAULT_CAMERA_ID = null;
const DEFAULT_CAMERA_ID_FLASH = 0;
const DEFAULT_FPS = 10;
const DEFAULT_BRIGHT= 14;
const MATERIAL_WIDTH = 800;	// 資料等の横幅
const MATERIAL_HEIGHT = 530;	//  資料等の縦幅
const RIGHT_AREA_NAMECARD = 0;		// 右側エリアの通し番号
const RIGHT_AREA_SECRET_MEMO = 1;	// 右側エリアの通し番号
const RIGHT_AREA_SHARE_MEMO = 2;	// 右側エリアの通し番号
const RIGHT_AREA_CHAT_BOARD = 3;	// 右側エリアの通し番号
var Keyflag = false;
const DEFAULT_CAMERA_FACING = "user";
// メイン定義
var NEGOTIATION = {};

/**
 * 変数定義
 */
NEGOTIATION.makeVar = function (){
	this.isMyCameraCanUse = true;
	this.isMyMicCanUse = true;
	this.isMyCameraOn = false; // カメラのONOFF状態 old mIsMyCameraOn
	this.isMyMicOn = false; // マイクのONOFF状態 old mIsMicOn
	this.videoArray = {show:[],hide:[]};// ビデオのDOM配列、SHOWとHIDEの管理
	this.startTime = new Date(); // 通話開始日時
	this.hour = 0;	// 経過時間関連
	this.min = 0;	// 経過時間関連
	this.sec = 0;	// 経過時間関連
	this.now = 0;	// 経過時間関連
	this.datet = 0;	// 経過時間関連
	this.mUserShowTargetVideo = true;// ターゲットのビデオを表示するか
	this.mIsMyScreenOn = false;// 自分の画面共有をしているかどうか
	this.mIsScreenOn = false;// 画面共有をしているかどうか
	this.isOperator = ($('#is_operator').val() == "1");// オペレーターかどうか
	this.mRecordState = "stop";// 録画状態
	this.mDocumentTypeArray = new Array();// 資料、画面共有のフッター配列
	this.showVideoMode = MODE_ONE_BIG; // ビデオのモード
	this.mIsShowConfirmLeaveDialog = true; // 商談中画面から別のページに遷移するか、ページ更新の時に警告ダイアログを出すか
	this.localStorageFlg = false; // ローカルストレージが使えるかどうか
	this.use_camera_id  = DEFAULT_CAMERA_ID;
	this.use_camera_id_flash  = DEFAULT_CAMERA_ID_FLASH;
	this.use_fps  = DEFAULT_FPS;
	this.use_bright  = DEFAULT_BRIGHT;
	this.rightAreaDom = [$('.mi_namecard_area'),$('.mi_secret_memo_area'),$('.mi_chat_board_area')]; // 右エリアに表示される要素のDOM一覧
	this.isNegotiationFinish = false;

	// モバイル対応
	// (iosの場合デバイス指定でガメラを切り替えられないので、現在のカメラデバイス状態を持つ)
	// facingMode = {exact:"user"};			フロントカメラ(※デフォルトはフロントカメラ)
	// 　　　　　　　{exact:"environment"};　バックカメラ
	this.use_camera_facingMode = DEFAULT_CAMERA_FACING;	// カメラ指定(初期値：フロント))
};


/**
 * ルート処理
 */
$(document).ready(function(){
	console.log("nagitiation_main[ready]");

	// ブラウザバック対策 （待合室経由させる）
	if (window.performance.navigation.type == 2) {
		location.reload();
	}

	NEGOTIATION.makeVar(); // 変数定義

	NEGOTIATION.init(); // 初期化

	/**
	 * User_id 取得
	 */
	var jqxhr = $.ajax({
		type: "POST",
		url: "https://" + location.host + "/negotiation/get-user-id",
		async: false,
		data: {},
	})
	.done(function(data, status, xhr) {
		var result = JSON.parse(data);
		if(result["status"] == 1){
//console.log("USER_ID=("+result["user_id"]+")");
			$('#user_id').val(result["user_id"]);
		}
		else {
//console.log(result["error"]);
			window.location.href = '/?room='+result["room_name"]+'&error='+result["error"];
		}
	})
	.fail(function(xhr, status, error) {
		//ajax error
	})
	.always(function(arg1, status, arg2) {
	//なにもしない
	});

	// オペレータの画像を設定する
	var userId = $('#user_id').val();
	$('#video_target_video_background_image_' + userId).prop('src', $('#video_background_image').val());

	$("#negotiation_share_screen").hover(
		function () {
			if (NEGOTIATION.mIsMyScreenOn) {
				$('#close_share_screen_btn').show();
			} else {
				$('#close_share_screen_btn').hide();
			}
			$('#fullscreen_screenshare_btn').show();
		},
		function () {
			$('#close_share_screen_btn').hide();
			$('#fullscreen_screenshare_btn').hide();
		}
	);
});

// ページ遷移前の処理
$(window).on('beforeunload', function(e) {
console.log("nagitiation_main[beforeunload]");

	// 自分が画面共有を行っている場合、画面共有をOFFにする
	if (NEGOTIATION.mIsScreenOn) {
		screenOff();
		myScreenStreamStop();
	}

	// チャットルームを退室したことをすべての接続先に伝える
	sendExitRoom();

	// 資料非表示
	if( Keyflag == false ) {
		var uuid = localStorage.UUID;
		if ( uuid == $("#document_uuid").val() ) {
			saveDocument();
			hideDocument();	// 資料を閉じる
		}
	}
});

$(window).on('unload', function(e) {
console.log("nagitiation_main[unload]");
// 	// 商談管理の破棄
// //	negotiationMainDestroy();
});

$(function(){
	//------------------------
	// jQueryキー制御
	//------------------------
	$(document).keydown(function(event){
		// クリックされたキーのコード
		var keyCode = event.keyCode;
		// ファンクションキーを制御する
		// 制限を掛けたくない場合は対象から外す
		if( keyCode == 116 ) {	// F5キーの制御
			Keyflag = true;
			return true;
		}
	});
});

/**
 * 初期化処理
 */
NEGOTIATION.init = function (){

	NEGOTIATION.eventBind();// イベントバインド

	// ビデオを元にレイアウト配置。初期は必ず二人レイアウト
	LayoutCtrl = new LayoutCtrl($("#mi_video_area"));
	this.videoArray.hide = [];
	this.showVideoMode = MODE_ONE_BIG; // ビデオのモード
	LayoutCtrl.apiSetVideo(this.showVideoMode,this.videoArray.show,this.videoArray.hide);

	NEGOTIATION.storageInit();

	// 録画拡張機能のリロード
	if ('Chrome' === USER_PARAM_BROWSER) {
		resetTabCaptureExtention();
	}

	setClassByOrientation(); // 横画面状態の場合にのみクラスを付与する.
};

// 非推奨環境を使用時、アラートを表示する
function recommendEnvironmentAlert() {

	RECOMMENDED_CHECK.alertMeasureNetworkSpeedMbps(function(device, mbps) {

		const normal_level = RECOMMENDED_CHECK.NETWORK_SPEED_MBPS_THRESHOLD_ON_ROOM;
		const low_level    = RECOMMENDED_CHECK.NETWORK_SPEED_MBPS_THRESHOLD_ON_ROOM;

		if(device == "android_tablet" && mbps < low_level){
			$(".cause").append('<li>・ご利用のインターネット速度が低速です</li>');
		} else if(device == "ipad" && mbps < low_level){
			$(".cause").append('<li>・ご利用のインターネット速度が低速です</li>');
		} else if(mbps < normal_level) {
			$(".cause").append('<li>・ご利用のインターネット速度が低速です</li>');
		}
		if(0 < $(".non_reccomend_modal li").length) {
			$(".non_reccomend_modal").show();
		}
	});
	RECOMMENDED_CHECK.alertiPadLowVersion(function() {
		$(".cause").append('<li>・ご利用のiOSタブレットは推奨OSではございません</li>');
	});
	RECOMMENDED_CHECK.alertAndroidTabletLowVersion(function() {
		$(".cause").append('<li>・ご利用のAndroidタブレットは推奨OSではございません</li>');
	});
	RECOMMENDED_CHECK.alertWindowsOSLowVersion(function() {
		$(".cause").append('<li>・ご利用のWindows機器は推奨OSではございません</li>');
	});
	RECOMMENDED_CHECK.alertiPhoneLowVersion(function() {
		$(".cause").append('<li>・ご利用のiOSスマートフォンは推奨OSではございません</li>');
	});
	RECOMMENDED_CHECK.alertAndroidMobileLowVersion(function() {
		$(".cause").append('<li>・ご利用のAndroidスマートフォンは推奨OSではございません</li>');
	});

	RECOMMENDED_CHECK.alertSafariLowVersion(function() {
		$(".cause").append('<li>・ご利用のブラウザの最新版をインストールしてください</li>');
	});
	RECOMMENDED_CHECK.alertChromeLowVersion(function() {
		$(".cause").append('<li>・ご利用のブラウザの最新版をインストールしてください</li>');
	});

	if(0 < $(".non_reccomend_modal li").length) {
		$(".non_reccomend_modal").show();
	}
}
function closenonReccomendModal() {
	$(".non_reccomend_modal").hide();
	$(".cause").empty()
}

/**
 * ローカルストレージの設定
 */
NEGOTIATION.storageInit = function(){
	// ローカルストレージが使えるかどうかチェック
	if(('localStorage' in window) && (window.localStorage !== null)) {
		this.localStorageFlg = true;

		if(valueCheck(localStorage.getItem('use_camera_id_flash')) == 0){
			localStorage.setItem('use_camera_id_flash', DEFAULT_CAMERA_ID_FLASH);
			localStorage.setItem('use_fps', DEFAULT_FPS);
		} else {
			NEGOTIATION.use_camera_id_flash  = localStorage.getItem('use_camera_id_flash');
			NEGOTIATION.use_fps  = localStorage.getItem('use_fps');
		}

		if(valueCheck(localStorage.getItem('use_camera_id')) == 0){
			// 初期値を代入
			localStorage.setItem('use_camera_id', DEFAULT_CAMERA_ID);
			localStorage.setItem('use_bright', DEFAULT_BRIGHT);
			// モバイル対応
			localStorage.setItem('use_camera_facingMode', DEFAULT_CAMERA_FACING);

			// 商談管理の初期化
			negotiationMainInit(
				null,
				getCameraConstraints()
			);
		}else{
			NEGOTIATION.use_camera_id  = localStorage.getItem('use_camera_id');
			NEGOTIATION.use_fps  = localStorage.getItem('use_fps');
			NEGOTIATION.use_bright  = localStorage.getItem('use_bright');
			// モバイル対応
			NEGOTIATION.use_camera_facingMode  = localStorage.getItem('use_camera_facingMode');

			var constraints = getCameraConstraints();

			// 商談管理の初期化
			negotiationMainInit(
				null,
				constraints
			);
		}
	}
	$('#setting-camera-dialog-camera-framerate').val(NEGOTIATION.use_fps);
	$('#setting-camera-dialog-camera-brightness').val(NEGOTIATION.use_bright);
	$( 'input[type=range]').change();

	// 設定の適用
//	settingApply();
};


/**
 * 接続中WAIT画面を閉じる関数
 * @param isCloseConnectionInfo
 */
NEGOTIATION.closeConnection = function(isCloseConnectionInfo) {
	// 商談管理の破棄
	negotiationMainDestroy();
};

/**
 * 存在を確認し、状態を更新する関数
 */
NEGOTIATION.updateStatusVideoAudio = function (){
	// カメラの存在確認。コールバックで使用状況更新
	var $button_setting_camera_dialog = $('#button_setting_camera_dialog');
	var $button_camera = $('#button_camera');
	var $button_mic = $('#button_mic');

	if (NEGOTIATION.isMyCameraCanUse) {
		if (NEGOTIATION.isMyCameraOn) {// カメラがWEBアプリでONにされていたら
			$button_setting_camera_dialog.attr('class', 'mi_header_status2 mi_active');
		} else {// カメラがWEBアプリでOFFにされていたら
			$button_setting_camera_dialog.attr('class', 'mi_header_status2');
		}
	} else {
		NEGOTIATION.isMyCameraOn = false;
		$button_setting_camera_dialog.attr('class', 'mi_header_status2');
	}

	if (NEGOTIATION.isMyMicCanUse) {
		var userId = $('#user_id').val();
		if (NEGOTIATION.isMyMicOn) {// マイクがつかえていたら
			$('#video_target_video_background_image_mic_' + userId).prop('src', '/img/icon_mic.png');
		} else {// マイクがWEBアプリでOFFにされていたら
			$('#video_target_video_background_image_mic_' + userId).prop('src', '/img/icon_mic_off.png');
		}
	} else {
		var userId = $('#user_id').val();
		NEGOTIATION.isMyMicOn = false;
		$('#video_target_video_background_image_mic_' + userId).prop('src', '/img/icon_mic.png');
	}
};

/**
 *
 *  ユーザーのデバイスを返す
 * @param ua_org
 *  @return     true:タブレット系 false:PC系
 */
NEGOTIATION.isDeviceMob = function(ua_org){
	var ua = ua_org.toLowerCase();
	var mobile = {
		0: (ua.indexOf("windows") != -1 && ua.indexOf("phone") != -1)
		|| ua.indexOf("iphone") != -1
		|| ua.indexOf("ipod") != -1
		|| (ua.indexOf("android") != -1 && ua.indexOf("mobile") != -1)
		|| (ua.indexOf("firefox") != -1 && ua.indexOf("mobile") != -1)
		|| ua.indexOf("blackberry") != -1,
		iPhone: (ua.indexOf("iphone") != -1),
		Android: (ua.indexOf("android") != -1 && ua.indexOf("mobile") != -1)
	};
	var tablet = (ua.indexOf("windows") != -1 && ua.indexOf("touach") != -1)
		|| ua.indexOf("ipad") != -1
		|| (ua.indexOf("android") != -1 && ua.indexOf("mobile") == -1)
		|| (ua.indexOf("firefox") != -1 && ua.indexOf("tablet") != -1)
		|| ua.indexOf("kindle") != -1
		|| ua.indexOf("silk") != -1
		|| ua.indexOf("playbook") != -1;

	return (mobile[0] || mobile['iPhone'] || mobile['Android'] || tablet);
};


// 経過時間
NEGOTIATION.displayTime = function(){
	this.now = new Date();

	this.datet = parseInt((this.now.getTime() - this.startTime.getTime()) / 1000);

	this.hour = parseInt(this.datet / 3600);
	this.min = parseInt((this.datet / 60) % 60);
	this.sec = this.datet % 60;

	// 数値が1桁の場合、頭に0を付けて2桁で表示する指定
	if(this.hour < 10) { this.hour = "0" + this.hour; }
	if(this.min < 10) { this.min = "0" + this.min; }
	if(this.sec < 10) { this.sec = "0" + this.sec; }

	// フォーマットを指定（不要な行を削除する）
	var timer1 = this.hour + ':' + this.min + ':' + this.sec; // パターン1

	// テキストフィールドにデータを渡す処理（不要な行を削除する）
	$('#time').html(timer1);

	setTimeout("NEGOTIATION.displayTime()", 1000);
};

NEGOTIATION.isShowVideoFrame = function(user_id) {
	var _found = false;
	$.each(this.videoArray.show, function(key, value) {
		if(user_id == value.data('id')) {
			_found = true;
			return true;
		}
	});
	return _found;
}

NEGOTIATION.isHideVideoFrame = function(user_id) {
	var _found = false;
	$.each(this.videoArray.hide, function(key, value) {
		if(user_id == value.data('id')) {
			_found = true;
			return true;
		}
	});
	return _found;
}
