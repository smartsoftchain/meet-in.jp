const CONNECTION_TIMEOUT = 100;// コネクションを開始する待ち時間（ミリ秒）
const SEND_TARGET_ALL = null;// コマンドの送信先をALLにする定数
const MY_CAMERA_RESOLUTION = getVideoConstraints("idealVga");	// カメラの解像度
const DEFAULT_CAMERA_ID = null;
const DEFAULT_CAMERA_ID_FLASH = 0;
const DEFAULT_MIC_ID = null;
const DEFAULT_MIC_ID_FLASH = 0;
const DEFAULT_SPEAKER_ID = "default";
const DEFAULT_FPS = 10;
const DEFAULT_BRIGHT= 14;
const MATERIAL_WIDTH = 800;	// 資料等の横幅
const MATERIAL_HEIGHT = 530;	//  資料等の縦幅
const RIGHT_AREA_NAMECARD = 0;		// 右側エリアの通し番号
const RIGHT_AREA_SECRET_MEMO = 1;	// 右側エリアの通し番号
const RIGHT_AREA_SHARE_MEMO = 2;	// 右側エリアの通し番号
const RIGHT_AREA_CHAT_BOARD = 3;	// 右側エリアの通し番号
const RIGHT_AREA_E_CONTRACT = 4;	// 右側エリアの通し番号
var Keyflag = false;
const DEFAULT_CAMERA_FACING = "user";
const BEAUTY_MODE_OFF = 0;		// ビューティーモードOFF時の値
const BEAUTY_MODE_ON = 1;		// ビューティーモードON時の値
// メイン定義
var NEGOTIATION = {};

// カメラボタンの切替用画像
let imgCameraOnHoveron = "/img/gray_camera_on.svg";
let imgCameraOnHoverout = "/img/orange_camera_on.svg";
let imgCameraOffHoveron = "/img/orange_camera_off.svg";
let imgCameraOffHoverout = "/img/gray_camera_off.svg";
let imgCameraErrorHoveron = "/img/orange_camera_error.svg";
let imgCameraErrorHoverout = "/img/gray_camera_error.svg";

// マイクボタンの切替用画像
let imgMicOnHoveron = "/img/gray_mic_on.svg";
let imgMicOnHoverout = "/img/orange_mic_on.svg";
let imgMicOffHoveron = "/img/orange_mic_off.svg";
let imgMicOffHoverout = "/img/gray_mic_off.svg";
let imgMicErrorHoveron = "/img/orange_mic_error.svg";
let imgMicErrorHoverout = "/img/gray_mic_error.svg";


/**
 * 変数定義
 */
NEGOTIATION.makeVar = function (){
	this.isMyCameraCanUse = true;
	this.isMyMicCanUse = true;
	this.isMyCameraOn = false;			// カメラのONOFF状態 old mIsMyCameraOn
	this.isMyCameraError = false;       // カメラのブロック機能の状態
	this.isMyMicOn = false;				// マイクのONOFF状態 old mIsMicOn
	this.isMyMicError = false;          // マイクのブロック機能の状態
	this.videoArray = {show:[],hide:[]};// ビデオのDOM配列、SHOWとHIDEの管理

	this.startTime = new Date();	// 通話開始日時
	this.hour = 0;					// 経過時間関連
	this.min = 0;					// 経過時間関連
	this.sec = 0;					// 経過時間関連
	this.now = 0;					// 経過時間関連
	this.datet = 0;					// 経過時間関連

	this.mUserShowTargetVideo = true;		// ターゲットのビデオを表示するか
	this.mIsMyScreenOn = false;				// 自分の画面共有をしているかどうか
	this.mIsScreenOn = false;				// 画面共有をしているかどうか
	this.isOperator = ($('#is_operator').val() == "1");// オペレーターかどうか
	this.mRecordState = "stop";				// 録画状態
	this.mDocumentTypeArray = new Array();	// 資料、画面共有のフッター配列
	this.showVideoMode = MODE_ONE_BIG;		// ビデオのモード
	this.mIsShowConfirmLeaveDialog = true;	// 商談中画面から別のページに遷移するか、ページ更新の時に警告ダイアログを出すか
	this.localStorageFlg = false;			// ローカルストレージが使えるかどうか

	this.use_camera_id  = DEFAULT_CAMERA_ID;			// カメラデバイスID(現在使用しているID)
	this.use_camera_id_flash  = DEFAULT_CAMERA_ID_FLASH;// Flash用カメラデバイスID(現在使用しているID)
	this.use_fps  = DEFAULT_FPS;						// フレームレート(初期値:10)
	this.use_bright  = DEFAULT_BRIGHT;					// 輝度設定(初期値:14)
	this.use_mic_id = DEFAULT_MIC_ID;					// カメラデバイスID(現在使用しているID)
	this.use_mic_id_flash = DEFAULT_MIC_ID_FLASH;		// Flash用カメラデバイスID(現在使用しているID)

	this.use_speaker_id = DEFAULT_SPEAKER_ID;			// スピーカーデバイスID(現在使用しているID)

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

	// 商談管理の破棄
//	negotiationMainDestroy();

	// 商談中画面から別のページに遷移するか、ページ更新の時に警告ダイアログを出す
	// if (NEGOTIATION.mIsShowConfirmLeaveDialog) {
	// 	// とどまる場合はsetTimeoutが実行されるので、そこに商談管理の初期化処理を入れる
	// 	var run = function() {
	// 		sessionStorage.setItem("beforeUnload", 1);	// true:とどまる
	// 		NEGOTIATION.mIsShowConfirmLeaveDialog = false;
	// 		window.location.reload();
	// 	}
	// 	setTimeout(run, 1000);
	// 	sessionStorage.setItem("beforeUnload", 0);	// デフォルト[false](移動)
	// 	return "ページを遷移してもよろしいですか？";
	// }
});

$(window).on('unload', function(e) {
	console.log("nagitiation_main[unload]");
// 	// 商談管理の破棄
// 	negotiationMainDestroy();
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


	// 推奨ブラウザーか判定 違う場合は警告.
	showSystemRequirementsBrowserDialog(USER_PARAM_BROWSER);

	// 非推奨環境を使用時、アラートを表示する
	// recommendEnvironmentAlert();

	NEGOTIATION.eventBind(); // イベントバインド


	// ビデオを元にレイアウト配置。初期は必ず二人レイアウト
	LayoutCtrl = new LayoutCtrl($("#mi_video_area"));
	this.videoArray.hide = [];
	this.showVideoMode = MODE_ONE_BIG; // ビデオのモード
	LayoutCtrl.apiSetVideo(this.showVideoMode,this.videoArray.show,this.videoArray.hide);

	NEGOTIATION.storageInit();

	if ('Chrome' === USER_PARAM_BROWSER) {

		// 出力するスピーカーの設定 ※ 各ブラウザで実装状況に差異あり(現状Chromeのみ可能).
		setSpeakerDevice(NEGOTIATION.use_speaker_id);  // NEGOTIATION.storageInit()の設定値を利用.

		// 録画拡張機能のリロード
		resetTabCaptureExtention();
	}
};

// 非推奨のモーダル非表示
$('.non_reccomend_cancel').on('click', function() {
	$('.non_reccomend_modal_default').css('display','none');
})

// 非推奨環境を使用時、アラートを表示する
function recommendEnvironmentAlert(){
	// ユーザーエージェント取得
	var userAgent = window.navigator.userAgent.toLowerCase();

	// bit数取得
	var bitNum = platform.os.architecture;
	var deviceMemory = navigator.deviceMemory;

	// os取得
	var os = platform.os.family;

	// クロムのバージョンが8.4よりしたの場合は非推奨
	var platformVersion = platform.version;
	var versionComparison = platformVersion.slice(0, 2);

	/**
	 * ネットワーク速度判定
	 * ネットワーク速度の判定は環境前に行いように修正:2021/01/06
	 */
	// ネットワーク速度を取得
	var start = (new Date()).getTime();
	$.ajax({
		url: "https://" + location.host + "/css/jquery-ui.css",
		type: "GET",
	}).done(function(data) {
		var end = (new Date()).getTime();
		var sec = (end - start) / 1000;
		var bytesPerSec = Math.round(data.length / sec);
		var bytesData = bytesPerSec * 8 / 1000;
		if(bytesData < 15){
			$(".non_reccomend_modal_default").css("display","block");
		}
	}).fail(function(error) {
		console.log(error);
	});

	// バージョンの数値を取得
	// OSバージョンを取得できない場合の対応：2021/01/06
	var version_sum = 0;	// OSバージョン(初期値:0)
	var version = platform.os.version;
	if( version != null ) {
		var versionStringArray = version.split(".");
		var versionNumberArray = [];
		versionStringArray.forEach(function(element) {
			versionNumberArray.push(parseInt(element));
		});
		version_sum = versionNumberArray.reduce(function (sum, num) {
			return sum + num
		}, 0)
	}

	// ブラウザ判定(crome,Edge以外)
	if(userAgent.indexOf('chrome') == -1) {
		$(".non_reccomend_modal_default").css("display","block");
	}else{
		// 画面幅が小さい時、モーダルが崩れるので変更
		if(window.parent.screen.width < 1250){
			$(".non_reccomend_modal_default").css("height","220px");
		}
		// 非推奨環境の条件判定
		if(os == "OS X"){
			// macの場合、64bit以上、メモリが4以上、OSが10.10以前、クロムのバージョンが84以前は非推奨
			if(bitNum < 64 || deviceMemory < 4 || version_sum < 20 || versionComparison<84){
				$(".non_reccomend_modal_default").css("display","block");
			}
		}else if(os == "Windows"){
			// windowsの場合、64bit以上、メモリが4以上、OSが10以前、クロムのバージョンが84以前は非推奨
			if(bitNum < 64 || deviceMemory < 4 || version_sum < 10 || versionComparison<84){
				$(".non_reccomend_modal_default").css("display","block");
			}
		}else if(os == "chrome os"){
			/**
			 * chromebook判定
			 * chromebookの場合、現状OSバージョンは取得出来ないため修正:2021/01/06
			 * 環境のチェックは、OSバージョン以外はWindowsと同様なチェックするように修正:2021/01/06
			 */
			// chrome(chromebook)の場合、64bit以上、メモリが4以上、クロムのバージョンが84以前は非推奨
			if(bitNum < 64 || deviceMemory < 4 || sum < 20 || versionComparison<84){
				$(".non_reccomend_modal_default").css("display","block");
			}
		}
	}

	// ブラウザ判定(Edgeの判定)
	if(userAgent.indexOf('edg') != -1){
		$(".non_reccomend_modal_default").css("display","block");
	}
	// ブラウザ判定(IEの場合非表示)
	if(userAgent.indexOf('trident') > -1){
		$(".non_reccomend_modal_default").css("display","none");
	}
}

/**
 * ローカルストレージの設定
 */
NEGOTIATION.storageInit = function(){
//console.log("◎◎◎　初回ストレージ初期化");
	// ローカルストレージが使えるかどうかチェック
	if(('localStorage' in window) && (window.localStorage !== null)) {
		this.localStorageFlg = true;
		if ('IE' === USER_PARAM_BROWSER){

			if(valueCheck(localStorage.getItem('use_camera_id_flash')) == 0){
				localStorage.setItem('use_camera_id_flash', DEFAULT_CAMERA_ID_FLASH);
				localStorage.setItem('use_fps', DEFAULT_FPS);

				// モバイル対応
				localStorage.setItem('use_camera_facingMode', DEFAULT_CAMERA_FACING);

			} else {
				NEGOTIATION.use_camera_id_flash  = localStorage.getItem('use_camera_id_flash');
				NEGOTIATION.use_fps  = localStorage.getItem('use_fps');

				// モバイル対応
				NEGOTIATION.use_camera_facingMode  = localStorage.getItem('use_camera_facingMode');
			}
			// 商談管理の初期化
			negotiationMainInit(
				null,
				getCameraConstraints()
			);

		}else {
			// カメラIDは同一セッションのみ有効な為、初回入室&再表示(ブラウザ)時は初期化する
			// localStorage.setItem('use_camera_id', DEFAULT_CAMERA_ID);  　※2020/10/19 再入室時はlocalStrageの値を反映させる仕様に変更
			if(valueCheck(localStorage.getItem('use_camera_id')) == 0){
				// 初期値を代入
				localStorage.setItem('use_camera_id', DEFAULT_CAMERA_ID);
				localStorage.setItem('use_bright', DEFAULT_BRIGHT);
				localStorage.setItem('use_fps', DEFAULT_FPS);

				// モバイル対応
				localStorage.setItem('use_camera_facingMode', DEFAULT_CAMERA_FACING);

			}
			else{
				NEGOTIATION.use_camera_id  = localStorage.getItem('use_camera_id');
				NEGOTIATION.use_camera_id  = localStorage.getItem('use_camera_id');
				NEGOTIATION.use_fps  = localStorage.getItem('use_fps');
				NEGOTIATION.use_bright  = localStorage.getItem('use_bright');
				// モバイル対応
				NEGOTIATION.use_camera_facingMode  = localStorage.getItem('use_camera_facingMode');

			}
			// 商談管理の初期化
			negotiationMainInit(
				null,
				getCameraConstraints()
			);
		}

		if(valueCheck(localStorage.getItem('use_mic_id_flash')) == 0){
			localStorage.setItem('use_mic_id_flash', DEFAULT_MIC_ID_FLASH);
		} else {
			NEGOTIATION.use_mic_id_flash  = localStorage.getItem('use_mic_id_flash');
		}

		// マイクIDは同一セッションのみ有効な為、初回入室&再表示(ブラウザ)時は初期化する
		if(valueCheck(localStorage.getItem('use_mic_id')) == 0){
			// 初期値を代入
			localStorage.setItem('use_mic_id', DEFAULT_MIC_ID);
		}
		else{
			NEGOTIATION.use_mic_id  = localStorage.getItem('use_mic_id');
		}


		// スピーカーIDは同一セッションのみ有効な為、初回入室&再表示(ブラウザ)時は初期化する
		if(valueCheck(localStorage.getItem('use_speaker_id')) == 0){
			// 初期値を代入
			localStorage.setItem('use_speaker_id', DEFAULT_SPEAKER_ID);
		}
		else{
			NEGOTIATION.use_speaker_id  = localStorage.getItem('use_speaker_id');
		}

		// ビューティーモードの設定
		if(localStorage.getItem('beauty_mode') === null){
			// 未設定の場合はOFFで初期化する
			localStorage.setItem('beauty_mode', BEAUTY_MODE_OFF);
		}
		// 画面のビューティーモードラジオの値を変更する（ただし、SPでは機能が存在しないので、PCの場合のみ設定する）
		if($("[name=beauty_mode]").length > 0){
			if(localStorage.getItem('beauty_mode') == BEAUTY_MODE_OFF){
				$("#beauty_mode_off").prop('checked', true);
			}else if(localStorage.getItem('beauty_mode') == BEAUTY_MODE_ON){
				$("#beauty_mode_on").prop('checked', true);
			}
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

// カメラ、マイクアイコンを表示する

if(USER_PARAM_BROWSER == "IE"){
	window.onload = function() {
		// IEの場合のみアイコンが接続前に表示されてしまうので、1.5秒待つ。
		setTimeout(function(){
			$('.mi_header_status').css('display','block');
		},2000);
	};
}else{
	window.onload = function() {
		$('.mi_header_status').css('display','block');
	};
}

// hover時のスタイル
var hover_gray = {
	"color": "#b4b4b4",
	"transition": "color 0.25s"
}
var hover_orange = {
	"color": "#0081CC",
	"transition": "color 0.25s"
}

//hover時のカメラアイコンのカラー切り替え
$('#button_camera').hover(
	function(){
		if(NEGOTIATION.isMyCameraError) {
		} else {
			// mouseover時
			if(NEGOTIATION.isMyCameraOn){
				$('#button_camera > img').attr("src", imgCameraOnHoveron);
				$('#button_camera span').css(hover_gray);
			}else{
				$('#button_camera > img').attr("src", imgCameraOffHoveron);
				$('#button_camera span').css(hover_orange);
			}
		}
	},
	function() {
		// mouseout時に
		if(NEGOTIATION.isMyCameraError) {
		} else {
			if(NEGOTIATION.isMyCameraOn){
				$('#button_camera > img').attr("src", imgCameraOnHoverout);
				$('#button_camera span').css(hover_orange);
			}else{
				$('#button_camera > img').attr("src", imgCameraOffHoverout);
				$('#button_camera span').css(hover_gray);
			}
		}
	}
);


//hover時のマイクアイコンのカラー切り替え
$('#button_mic').hover(
function(){
	if(NEGOTIATION.isMyMicError) {
	} else {
		// mouseover時
		if(NEGOTIATION.isMyMicOn){
			$('#button_mic > img').attr("src", imgMicOnHoveron);
			$('#button_mic span').css(hover_gray);
		}else{
			$('#button_mic > img').attr("src", imgMicOffHoveron);
			$('#button_mic span').css(hover_orange);
		}
	}
},
function() {
	// mouseout時に
	if(NEGOTIATION.isMyMicError) {
	} else {
		if(NEGOTIATION.isMyMicOn){
			$('#button_mic > img').attr("src", imgMicOnHoverout);
			$('#button_mic span').css(hover_orange);
		}else{
			$('#button_mic > img').attr("src", imgMicOffHoverout);
			$('#button_mic span').css(hover_gray);
		}
	}
});


// カメラの接続エラーtooltip
$('#button_camera').tooltipster({
	contentAsHTML: true,
	interactive: true,
	touchDevices: false,
	placement: 'bottom',
	maxWidth: 300,
	theme: 'Default',
	animation: 'fade',
	content: '<div class="error_tooltip"><span class="error_title"><img src="/img/exclamation-triangle.svg" class="exclamation_triangle">&nbsp;カメラにエラーが発生しています。</span><br><span class="">あなたの映像が他のユーザに表示されていません。<br/><span id="video_id" class="link-settle">解決しますか？</span></span></div>',
	trigger: 'click',
	// zIndex: 200000001,
	contentCloning: false,
	delay: 1000,
	// autoClose: false,
});


// マイクの接続エラーtooltip
$('#button_mic').tooltipster({
	contentAsHTML: true,
	interactive: true,
	touchDevices: false,
	placement: 'bottom',
	maxWidth: 300,
	theme: 'Default',
	animation: 'fade',
	content: '<div class="error_tooltip"><span class="error_title"><img src="/img/exclamation-triangle.svg" class="exclamation_triangle">&nbsp;マイクにエラーが発生しています。</span></br><span class="">他の参加者に声が聞こえていません。<br/><span id="aoudio_id" class="link-settle">解決しますか？</span></span></div>',
	trigger: 'click',
	// zIndex: 200000001,
	contentCloning: false,
	delay: 1000 ,
	// autoClose: false,
});


/**
 * カメラの存在を確認し、状態を更新する関数
 */
var $button_setting_camera_dialog = $('#button_setting_camera_dialog');
var $button_camera = $('#button_camera');
let imgCameraOn = '<img src="/img/orange_camera_on.svg" class="ui-change-icons"><span classs="button_status">カメラON</span>';
let imgCameraOff = '<img src="/img/orange_camera_off.svg" class="ui-change-icons"><span classs="button_status">カメラOFF</span>';
let imgCameraCanNotUse = '<img src="/img/gray_camera_off.svg" id="ui-chenge-icons-cannot" class="ui-change-icons"><span  classs="button_status">使用不可</span>';
let imgCameraError = '<img src="/img/gray_camera_error.svg" id="ui-chenge-icons-error" class="ui-change-icons"><span classs="button_status">使用不可</span>';

// 入室時・再接続時
NEGOTIATION.updateStatusVideoStream = function(stream) {

	if (stream) {
		if (NEGOTIATION.isMyCameraCanUse && NEGOTIATION.isMyCameraOn) {
			$button_camera.addClass('mi_active');
			$button_camera.html(imgCameraOn);

		} else if (!NEGOTIATION.isMyCameraCanUse && NEGOTIATION.isMyCameraOn) {
			$button_camera.addClass('mi_active');
			$button_camera.html(imgCameraOn);

		} else {
			$button_camera.removeClass('mi_active');
			$button_camera.html(imgCameraOff);
			$button_setting_camera_dialog.removeClass('mi_active');

		}
	} else {
		$button_camera.html(imgCameraCanNotUse);
		$('#button_camera span').css("color", "#b4b4b4");

	}
}

// カメラボタンクリック時
NEGOTIATION.updateStatusVideo = function (){

	// カメラの存在確認。コールバックで使用状況更新
	let constraints = {video:true};
	navigator.mediaDevices.getUserMedia(constraints)
	.then(function(localMediaStream) {　
			// メディアの情報が取得できたら
			NEGOTIATION.isMyCameraError = false;
			//　tooltip非表示にする
			$('#button_camera').tooltipster('disable');

			const userId = $('#user_id').val();
			// マイクoffアイコンの表示判定
			const isShowMicOffIcon = $('#negotiation_target_video_relative_' + userId).find('.video_mic_off_icon').css('display') === 'block'
			let micOffIconWidth;
			if (isShowMicOffIcon) {
				micOffIconWidth = $('#negotiation_target_video_relative_' + userId).find('#video_mic_off_icon').width();
			}
			const userNameAreaWidth =  $("#negotiation_target_video_" + userId).find(".on_video").width();
			const videoFrameWidth = $("#negotiation_target_video_" + userId).width();
			const hasSmall = $('#negotiation_target_video_' + userId).find('.mi_video_icon_wrap').hasClass('small');

			// ブラウザのカメラ情報を読んでカメラの表示を切り替える
			if (NEGOTIATION.isMyCameraCanUse && NEGOTIATION.isMyCameraOn) {
				// カメラが許可されていてカメラONにされたら
				$button_camera.addClass('mi_active');
				$button_camera.html(imgCameraOn);
				// class smallもってたら、left 28に変える
				if (isShowMicOffIcon && hasSmall) {
					$("#negotiation_target_video_" + userId).find(".on_video").css("left", "28px");
				}
				if (isShowMicOffIcon && !hasSmall) {
					$("#negotiation_target_video_" + userId).find(".on_video").css("left", "35px");
				}

				// カメラオンかつマイクoffアイコン表示時に、ユーザー名表示箇所の widthを調整する 
				// マイクoffアイコン分 userNameAreaWidthのwidth を減らす
				if ($button_camera.hasClass('mi_active') && isShowMicOffIcon
					&& videoFrameWidth < userNameAreaWidth + 60) {
					$("#negotiation_target_video_" + userId).find(".on_video").width(userNameAreaWidth - micOffIconWidth);
				} 

			} else if (!NEGOTIATION.isMyCameraCanUse && NEGOTIATION.isMyCameraOn) {
				// カメラが許可されていない状態でカメラONにされたら
				$button_camera.addClass('mi_active');
				$button_camera.html(imgCameraOn);
				// カメラオンかつマイクoffアイコン表示時に、ユーザー名表示箇所の widthを調整する 
				// マイクoffアイコン分 userNameAreaWidthのwidth を減らす
				console.log('hasClass mi_active', $button_camera.hasClass('mi_active'));
				if ($button_camera.hasClass('mi_active') && isShowMicOffIcon
					&& videoFrameWidth < userNameAreaWidth + 60) {
					$("#negotiation_target_video_" + userId).find(".on_video").width(userNameAreaWidth - micOffIconWidth);
				}
			} else {
				// カメラが許可された状態でカメラOFFにされたら
				$button_camera.removeClass('mi_active');
				$button_camera.html(imgCameraOff);
				$button_setting_camera_dialog.removeClass('mi_active');

			}
	})
	.catch(function(err) {

		// デフォルトでエラー表示にしておく
		$button_camera.tooltipster('enable');
		$button_camera.html(imgCameraError);
		$button_camera.removeClass('mi_active');
		$button_setting_camera_dialog.removeClass('mi_active');

		// ブラウザのカメラ情報を読んでカメラの表示を切り替える
		if (!NEGOTIATION.isMyCameraCanUse && !NEGOTIATION.isMyCameraOn) {
			// エラー発生後に再度クリックされた場合はエラー表示のままにする
			if (NEGOTIATION.isMyCameraError){
				// tooltip　ON
				$button_camera.tooltipster('show');
				$('#video_id').click(function(){
					$('#button_camera').tooltipster('hide');
					$('#button_setting_camera_dialog').click();
				});
			}else {
				// 予めブロックして入室した場合にエラーは表示させない
				$button_camera.html(imgCameraCanNotUse);
			}
			$('#button_camera span').css("color", "#b4b4b4");

		} else {
			// ブラウザを更新せずにカメラを切り替えようとするとエラーが出るようにする
			NEGOTIATION.isMyCameraCanUse = false;
			NEGOTIATION.isMyCameraOn = false;
			NEGOTIATION.isMyCameraError = true;
			$('#button_camera span').css("color", "#b4b4b4");

			// tooltip　ON
			$button_camera.tooltipster('show');
			$('#video_id').click(function(){
				$('#button_camera').tooltipster('hide');
				$('#button_setting_camera_dialog').click();
			});
		}
	});
};

/**
 * マイクの存在を確認し、状態を更新する関数
 */
var $button_setting_camera_dialog = $('#button_setting_camera_dialog');
var $button_mic = $('#button_mic');
let imgMicOn = '<img src="/img/orange_mic_on.svg" class="ui-change-icons"><span>マイクON</span>';
let imgMicOff = '<img src="/img/orange_mic_off.svg" class="ui-change-icons"><span>マイクOFF</span>';
let imgMicCanNotUse = '<img src="/img/gray_mic_off.svg" id="ui-chenge-icons-cannot-mic" class="ui-change-icons"><span>使用不可</span>';
let imgMicError = '<img src="/img/gray_mic_error.svg" class="ui-change-icons"><span>使用不可</span>';

// 入室時・再接続時
NEGOTIATION.updateStatusAudioStream = function(stream) {
	if (stream) {
		var userId = $('#user_id').val();

		if (NEGOTIATION.isMyMicCanUse && NEGOTIATION.isMyMicOn) {
			$button_mic.addClass('mi_active');
			$button_mic.html(imgMicOn);
			$('#video_target_video_background_image_mic_' + userId).prop('src', '/img/icon_mic.png');

		} else if (!NEGOTIATION.isMyMicCanUse && NEGOTIATION.isMyMicOn) {
			$button_mic.addClass('mi_active');
			$button_mic.html(imgMicOn);

		} else {
			$button_mic.removeClass('mi_active');
			$button_mic.html(imgMicOff);
			$button_setting_camera_dialog.removeClass('mi_active');
			$('#video_target_video_background_image_mic_' + userId).prop('src', '/img/icon_mic_off.png');

		}
	} else {
		$button_mic.html(imgMicCanNotUse);
		$('#button_mic span').css("color", "#b4b4b4");

	}
}

// マイクボタンクリック時
NEGOTIATION.updateStatusAudio = function (){

	// マイクの存在確認。コールバックで使用状況更新
	let constraints = {audio:true};
	navigator.mediaDevices.getUserMedia(constraints)
	.then(function(localMediaStream) {
		// メディアの情報が取得できたら
		NEGOTIATION.isMyMicError = false;
		var userId = $('#user_id').val();
		// Tooltip OFF
		$button_mic.tooltipster('disable');

		// ブラウザのマイク情報を読んでマイクの表示を切り替える
		if (NEGOTIATION.isMyMicCanUse && NEGOTIATION.isMyMicOn) {
			// マイクが許可されていてWEBアプリでONにされていたら
			$button_mic.addClass('mi_active');
			$button_mic.html(imgMicOn);
			$('#video_target_video_background_image_mic_' + userId).prop('src', '/img/icon_mic.png');
		} else if (!NEGOTIATION.isMyMicCanUse && NEGOTIATION.isMyMicOn) {
			// マイクが許可されていてWEBアプリでONにされていたら
			$button_mic.addClass('mi_active');
			$button_mic.html(imgMicOn);
		} else {
			// マイクがWEBアプリでOFFにされていたら
			$button_mic.removeClass('mi_active');
			$button_mic.html(imgMicOff);
			$button_setting_camera_dialog.removeClass('mi_active');
			$('#video_target_video_background_image_mic_' + userId).prop('src', '/img/icon_mic_off.png');
		}
	})
	.catch(function(err){

		// デフォルトでエラー表示にしておく
		$button_mic.tooltipster('enable');
		$button_mic.html(imgMicError);
		$button_mic.removeClass('mi_active');
		$button_setting_camera_dialog.removeClass('mi_active');
		// カメラOFF時の背景に設定するマイクアイコンの設定
		var userId = $('#user_id').val();
		$('#video_target_video_background_image_mic_' + userId).prop('src', '/img/icon_mic_off.png');


		// ブラウザのマイク情報を読んでマイクの表示を切り替える
		if (!NEGOTIATION.isMyMicCanUse && !NEGOTIATION.isMyMicOn) {
			// エラー発生後に再度クリックされた場合はエラー表示のままにする
			if (NEGOTIATION.isMyMicError){
				// tooltip　ON
				$button_mic.tooltipster('show');
				$('#aoudio_id').click(function(){
					$('#button_mic').tooltipster('hide');
					$('#button_setting_camera_dialog').click();
				});
			}else{
				// 予めブロックして入室した場合にエラーは表示させない
				$button_mic.html(imgMicCanNotUse);
			}
			$('#button_mic span').css("color", "#b4b4b4");

		} else {
			// ブラウザを更新せずにマイクを切り替えようとするとエラーが出るようにする
			NEGOTIATION.isMyMicCanUse = false;
			NEGOTIATION.isMyMicOn = false;
			NEGOTIATION.isMyMicError = true;
			$('#button_mic span').css("color", "#b4b4b4");

			// tooltip　ON
			$button_mic.tooltipster('show');
			$('#aoudio_id').click(function(){
				$('#button_mic').tooltipster('hide');
				$('#button_setting_camera_dialog').click();
			});
		}
	});
};


NEGOTIATION.updateStatusVideoFlash = function (){
	// カメラの存在確認。コールバックで使用状況更新
	var $button_setting_camera_dialog = $('#button_setting_camera_dialog');
	var $button_camera = $('#button_camera');
	let imgCameraOn = '<img src="/img/orange_camera_on.svg" class="ui-change-icons"><span classs="button_status">カメラON</span>';
	let imgCameraOff = '<img src="/img/orange_camera_off.svg" class="ui-change-icons"><span classs="button_status">カメラOFF</span>';
	let imgCameraCanNotUse = '<img src="/img/gray_camera_off.svg" class="ui-change-icons ui-chenge-icons-cannot"><span  classs="button_status">使用不可</span>';
	let imgCameraError = '<img src="/img/gray_camera_error.svg" class="ui-change-icons ui-chenge-icons-error"><span classs="button_status">使用不可</span>';


	// 画面共有中に カメラを切り替えた場合、画面共有解除後に その状態にする為に覚えておく.
	//if(NEGOTIATION.mIsScreenOn) {
	//	NEGOTIATION.setStorageMyCameraFlg(NEGOTIATION.isMyCameraOn); // 画面共有中は カメラUIを操作不能にした為不要となった.
	//}

	if (NEGOTIATION.isMyCameraCanUse) {
		$('#button_camera').tooltipster('disable');
		if (NEGOTIATION.isMyCameraOn) {
			// カメラがWEBアプリでONにされていたら
			NEGOTIATION.isMyCameraError = false;

			$button_camera.addClass('mi_active');
			$button_camera.html(imgCameraOn);
			$('#video-off').hide();
			$button_setting_camera_dialog.attr('class', 'mi_header_status2 mi_active');

		} else {// カメラがWEBアプリでOFFにされていたら
			$button_camera.removeClass('mi_active');
			$button_camera.html(imgCameraOff);
			$('#video-off').show();
			$button_setting_camera_dialog.attr('class', 'mi_header_status2');


		}
	} else {
		// Flashでカメラとマイクへのアクセスを拒否した場合に表示
		// Tooltip 有効
		$button_camera.tooltipster('enable');
		//　カメラのエラー表示
		NEGOTIATION.isMyCameraOn = false;
		NEGOTIATION.isMyCameraError = true;
		$button_camera.removeClass('mi_active');
		$button_camera.html(imgCameraError);
		$('#button_camera').css("color", "#b4b4b4");
		$('#video-off').show();
		$button_setting_camera_dialog.attr('class', 'mi_header_status2');

		// tooltip　ON
		$button_camera.tooltipster('show');
		$('#video_id').off('click');
		$('#video_id').click(function(){
			$('#button_camera').tooltipster('hide');
			$('#button_setting_camera_dialog').click();
		});
	}

};

NEGOTIATION.updateStatusAudioFlash = function (){
	// マイクの存在確認。コールバックで使用状況更新
	var $button_setting_camera_dialog = $('#button_setting_camera_dialog');
	var $button_mic = $('#button_mic');
	let imgMicOn = '<img src="/img/orange_mic_on.svg" class="ui-change-icons"><span>マイクON</span>';
	let imgMicOff = '<img src="/img/orange_mic_off.svg" class="ui-change-icons"><span>マイクOFF</span>';
	let imgMicCanNotUse = '<img src="/img/gray_mic_off.svg" class="ui-change-icons ui-chenge-icons-cannot-mic"><span>使用不可</span>';
	let imgMicError = '<img src="/img/gray_mic_error.svg" class="ui-change-icons"><span>使用不可</span>';

	// カメラOFF時の背景に設定するマイクアイコンの設定
	var userId = $('#user_id').val();

	// 画面共有中に カメラを切り替えた場合、画面共有解除後に その状態にする為に覚えておく.
	//if(NEGOTIATION.mIsScreenOn) {
	//	NEGOTIATION.setStorageMyCameraFlg(NEGOTIATION.isMyCameraOn); // 画面共有中は カメラUIを操作不能にした為不要となった.
	//}

	if (NEGOTIATION.isMyMicCanUse) {
		// Tooltip OFF
		$button_mic.tooltipster('disable');

		if (NEGOTIATION.isMyMicOn) {
			// マイクがWEBアプリで許可されていたら
			NEGOTIATION.isMyMicError = false;
			$button_mic.addClass('mi_active');
			$button_mic.html(imgMicOn);
			$('#audio-off').hide();
			$('#video_target_video_background_image_mic_' + userId).prop('src', '/img/icon_mic.png');
		} else {
			// マイクがWEBアプリでOFFにされていたら
			$button_mic.removeClass('mi_active');
			$button_mic.html(imgMicOff);
			$('#audio-off').show();
			$('#video_target_video_background_image_mic_' + userId).prop('src', '/img/icon_mic_off.png');
		}
	} else {
		// Tooltip 有効
		$button_mic.tooltipster('enable');
		NEGOTIATION.isMyMicOn = false;
		NEGOTIATION.isMyMicError = true;

		//　マイクのエラー表示
		$button_mic.removeClass('mi_active');
		$button_mic.html(imgMicError);
		$('#button_mic span').css("color", "#b4b4b4");
		$('#audio-off').show();
		$('#video_target_video_background_image_mic_' + userId).prop('src', '/img/icon_mic_off.png');

		// tooltip　ON
		$button_mic.tooltipster('show');
		$('#aoudio_id').off('click');
		$('#aoudio_id').click(function(){
			$('#button_mic').tooltipster('hide');
			$('#button_setting_camera_dialog').click();
		});
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

// 強制的にカメラをオフにした時、元のフラグを保持する.
NEGOTIATION.setStorageMyCameraParam = function(camera_pram) {
    document.getElementById('button_camera').setAttribute('data-tmp_camera_on', camera_pram);
}
NEGOTIATION.getStorageMyCameraParam = function() {
	let tmp = document.getElementById('button_camera').dataset.tmp_camera_on;
	if([null, undefined, 'null', 'undefined'].indexOf(tmp) != -1) {
		return [];
	}
	return tmp.split(',');
}
NEGOTIATION.resetStorageMyCameraFlg = function() {
	NEGOTIATION.setStorageMyCameraParam(null);
}
NEGOTIATION.setStorageMyCameraFlg = function(camera_flg) {
	let array = NEGOTIATION.getStorageMyCameraParam();
	array.push(camera_flg ? 1 : 0);
	NEGOTIATION.setStorageMyCameraParam(array.join(','));
}
NEGOTIATION.isStorageMyCameraOn = function() {
	let array = NEGOTIATION.getStorageMyCameraParam();
	let fast_flg = array[0] == undefined ? true : array[0] == "1";
	let last_flg = array[array.length-1] == "1";
	// MEMO. カメラを操作する際、 VideoStream と AudioStreamが 1回づつ合計2回呼ぶことがある(いつもではない)ので3回目以降のフラグ操作を対象にする.
	if(2 < array.length) {
		return last_flg;
	}
	return fast_flg;
}

// 退出時のモーダル表示、非表示
$(function () {
	// モーダル表示
	$('.room_exit_wrap').click(function(){
		if($('#tmp_message_regist_sentiment_analysis').css('display') === 'block'){
			// 音声分析結果登録中（登録中モーダル表示中）は、本当に退室するかどうか確認する。
			if (window.confirm('音声分析結果を登録中です。退室すると結果が登録されません。\n本当に退出しますか？')) {
				$('#exit_modal-content').fadeIn();
			}
		} else {
			$('#exit_modal-content').fadeIn();
		}
	});

	// モーダル非表示
	$('.exit_cancel').click(function(){
	  $('#exit_modal-content').fadeOut();
	});
});