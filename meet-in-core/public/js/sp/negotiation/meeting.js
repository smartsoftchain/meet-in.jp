const MAX_VIDEO = 6;					// 6はビデオの最大数
const LAYOUT_TYPE_ICON = "icon";		// アイコン表示
const LAYOUT_TYPE_SAME = "same";		// 等倍表示
const LATERAL_DIRECTION = "lateral";	// 画面の持ち方が横方向
const VERTICAL_DIRECTION = "vertical";	// 画面の持ち方が縦方向

var video_reload_flg = false;	// ビデオ再読込フラグ


$(function() {

	// 共通の初期化処理
	initCommon();
	function initCommon(){
		const staffRole = $("#staff_role").val();
		// アルバイト権限ユーザーはファイルアップロード不可
		if (staffRole == "CE_3" || staffRole == "AA_3") {
		$('#trigger_access_photos').css('display', 'none');
		}
		// メインコンテンツの高さを設定
		$(".content__wrap").height($(window).outerHeight());
		// 画面下のアイコンの大きさを変更する
		if(Math.abs(window.orientation) === 90) {	// 横向きの場合
			// フッターアイコンの大きさを変更する
			$("div.meeting__footer").find("img").each(function(i) {
				$(this).removeClass("meeting__footer--btn-v");
				$(this).addClass("meeting__footer--btn-h");
			});
		}else{										// 縦向きの場合
			// フッターアイコンの大きさを変更する
			$("div.meeting__footer").find("img").each(function(i) {
				$(this).removeClass("meeting__footer--btn-h");
				$(this).addClass("meeting__footer--btn-v");
			});
		}
	}

	$(window).on("orientationchange resize", function(){
		// 共通の初期化処理
		initCommon();
		if(!$("#sp_document_area").isShow()) {
			// 資料共有時は相手の書き込みなどが消えてしまうので初期化しない
			requestInitData();
		}
		// レイアウトの切り替え実行
		var bigVideoId = $(".big_video_area").data("id");
		if($("#negotiation_share_screen").is(':visible')){
			// 画面共有表示中の場合は、画面共有を優先する
			bigVideoId = "negotiation_share_screen";
		}
		// ビデオオフ画像のサイズを再設定する
		spChangeLayout(bigVideoId, "#1");

		setClassByOrientation(); // 横画面状態の場合にのみクラスを付与する.

	});
	// 自分のビデオ領域リサイズイベントを取得する
	$("#video_target_video_" + $('#user_id').val()).on('loadedmetadata', function() {
		var bigVideoId = $(".big_video_area").data("id");
		if($("#negotiation_share_screen").is(':visible')){
			// 画面共有表示中の場合は、画面共有を優先する
			bigVideoId = "negotiation_share_screen";
		}
		// ビデオのロードが完了し、サイズ決定後にレイアウトの切り替え実行
		spChangeLayout(bigVideoId, "#2");
	});


	// メンバー画像のサイズ調整
	let imgWidth = $('.meeting__members--item').width();
	$('.meeting__members--img').css({'height': imgWidth + 'px'});

	// トップ人画像表示サンプル
	$('#onePerson').on('click', function() {
		$('#twoPersons').show('scale', {percent: 100}, 900);
		$('#meeting__members--wrap').addClass('threePersons');
	});
	$('#twoPersons').on('click', function() {
		$('#threePersons').show('scale', {percent: 100}, 900);
		$('#meeting__members--wrap').removeClass('threePersons');
		$('#meeting__members--wrap').addClass('fourPersons');
	});
	$('#threePersons').on('click', function() {
		$('#fourPersons').show('scale', {percent: 100}, 900);
		$('#meeting__members--wrap').removeClass('fourPersons');
		$('#meeting__members--wrap').addClass('fivePersons');
	});
	$('#fourPersons').on('click', function() {
		$('#fivePersons').show('scale', {percent: 100}, 900);
		$('#meeting__members--wrap').removeClass('fivePersons');
		$('#meeting__members--wrap').addClass('sixPersons');
	});
	$('#fivePersons').on('click', function() {
		$('#twoPersons, #threePersons, #fourPersons, #fivePersons').hide();
		$('#meeting__members--wrap').removeClass('sixPersons');
	});

	// 複数人表示モード切り替え
	$('#change_multiMember').on('click', function() {
		// hiddenで埋め込んでいる値を変更する
		if($("[name=layout_type]").val() == LAYOUT_TYPE_ICON){
			// アイコンから等倍に変更
			$("[name=layout_type]").val(LAYOUT_TYPE_SAME);
		}else{
			// 等倍からアイコンに変更
			$("[name=layout_type]").val(LAYOUT_TYPE_ICON);
		}
		// レイアウトの切り替え実行
		spChangeLayout($(".big_video_area").data("id"), "#3");
		// ビデオタグの移動後は再接続を行う
		//sendReconnectStart();
		//mNegotiationMain.reconnect();
	});

	// サイドバーボタンの切り替え
	$('#meeting__menuBtn').on('click', function() {
		$(this).next().stop().slideToggle();
		$('#meeting__sidebar').toggleClass('open');
		if($('#meeting__sidebar').hasClass('open')) {
			$(this).children('img').attr('src', '/img/sp/png/x_btn.png');
		} else {
			setTimeout(function(){
				$('#meeting__menuBtn').children('img').attr('src', '/img/sp/png/sp_menu_btn.png');
			}, 350);
		}
		return false;
	});

	// サイドバーミュートボタンの切り替え
	$('#change_sidebarMute').on('click', function() {
		$(this).toggleClass('sidebarMute');
		if($(this).hasClass('sidebarMute')) {
			$(this).attr('src', '/img/sp/png/unmute.png');
		} else {
			$(this).attr('src', '/img/sp/png/mute.png');
		}
	});

	// VideoのONOFFの切り替え
	$('#button_camera').on('click', function() {
		$(this).toggleClass('off');
		if($(this).hasClass('off')) {
			// ビデオボタンを変更
			$("#button_camera").attr('src', '/img/sp/svg/sp_gray_camera_off.svg');
			// ビデオOFFにより、アイコン表示
			spToggleVideo($('#user_id').val(), true);
		} else {
			// ビデオボタンを変更
			$("#button_camera").attr('src', '/img/sp/png/movie.png');
			// ビデオONにより、アイコン非表示
			spToggleVideo($('#user_id').val(), false);
		}
	});

	// ミュートボタンのONOFFの切り替え
	$('#button_mic').on('click', function() {
		$(this).toggleClass('mute');
		if($(this).hasClass('mute')) {
			// マイクOFFの際の処理
			$(this).attr('src', '/img/sp/svg/sp_gray_mic_off.svg');
		} else {
			$(this).attr('src', '/img/sp/png/mike.png');
		}
	});

	// チャットコメント入力エリアの出現
	$('#chat__addComment').on('click', function() {
		$('#chat__footer').toggleClass('open');
		if($('#chat__footer').hasClass('open')) {
			// メッセージ表示領域を縮める
			$('.chat__content').css('height', 'calc(100% - 145px)');
			// メッセージ入力領域を広げる
			$('.chat__footer').css('height', '140px');
			$('.chat__textArea').show();
		} else {
			// メッセージ表示領域を広げる
			$('.chat__content').css('height', 'calc(100% - 55px)');
			// メッセージ入力領域を縮める
			$('.chat__textArea').hide();
			$('.chat__footer').css('height', '50px');
		}
		return false;
	});

	// カメラの切り替え
	$('#change_camera').on('click', function() {
		settingApply();
	});

	// 端末の写真にアクセスする
	$('#trigger_access_photos').on('click', function() {
//console.log("trigger_access_photos::click");
		$('#access_photos').trigger('click');
		video_reload_flg = true;
	});

	// ファイルが選択された場合の処理
	$('#access_photos').change(function(){
//console.log("trigger_access_photos::change");
		if (this.files.length > 0) {
			// ファイル情報取得
			var file = this.files[0];
			var reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = function() {
				//console.log(reader.result);
				// ============================================
				// 画像のアップロードを開始する
				// material_upload.jsの処理を流用する
				// ============================================
				console.log('アップ完了')
				uploadPhoto(reader.result);
			}
			// スマホの向きを監視
			$(window).on("orientationchange", function() {
				console.log('向き変えた')
				uploadPhoto(reader.result);
		　	});
		}
// 		else {
// console.log("trigger_access_photos::キャンセル");
// 		}
	});
// 	//テキストボックスのフォーカスが外れたら発動
// 	$('#access_photos').blur(function() {
// console.log("access_photos::フォーカスが外れた");
// 		// //背景色を白にする
// 		// $(this).css('background', '#fff');
// 	});


	// カラーパレット初期表示
	$(window).load(function(){
		$('.color_palet_circle').css('display', 'none');
	});

	// カラーパレット出現
	$('.color_palet_circle').on('click', function(){
		$('.paint__footer').css('display', 'flex')
		$('.color_palet_circle').hide()
		$('.sp_document_content .sp_img_document_area').css('height','74%')
	})

	// カラーパレット閉じる
	const style = {
		height:"100%",
		width:"100%",
	}
	$('.paint__footerClose').on('click', function(){
		$('.paint__footer').hide()
		$('.color_palet_circle').show()
		$('.sp_document_content .sp_img_document_area').css('height', '90%')
		$('#white_board_area .canvas_area').css(style)
	});

	// 画像表示領域を閉じる
	$('#sp_document_close').on('click', function() {
		// SPユーザーに画像の非表示通知を行う
		var data = {
				command : "DOCUMENT",
				type : "SP_HIDE_DOCUMENT"
		};
		sendCommand(SEND_TARGET_ALL, data);
		// PCユーザーに資料の非表示を通知する
		var data = {
				command : "DOCUMENT",
				type : "CLOSE_DOCUMENT"
		};
		sendCommand(SEND_TARGET_ALL, data);
		// 自分の画像を閉じる
		hidePhotoImg();

		// 再接続
		spRequestVideoStream();
	});

	// 商談終了処理
	$('#sp_negotiation_finish').on('click', function() {
		/*
		if (NEGOTIATION.isOperator) {
			negotiation_finish();
		} else {
			sendNegotiationFinishProcess();
			showNegotiationFinishDialogUser();
		}
		*/
		// 暫定で今は商談結果の登録を行わない
		sendNegotiationFinishProcess();
		showNegotiationFinishDialogUser();
		// 商談管理の破棄
		negotiationMainDestroy();

		secretVoice.onClose();
	});

	/**
	 * URLをコピーのイベント
	 */
	$(document).on('click', '#icon_copy_url', function(){
		var meetin_room_url = location.protocol + "//" + location.host + "/room/" + $("#meetin_room_name").text();
		
		var msgDisplayElement = $('#copy_msg');
		var showMsgText = "コピーしました";
		var showMsgDuration = 1500;

		executeCopyTarget(meetin_room_url, msgDisplayElement, showMsgText, showMsgDuration);

	});

	/**
	 * 招待文をコピーのイベント
	 */
	$(document).on('click', '#icon_copy_sentence', function(){
		var meetin_room_url = location.protocol + "//" + location.host + "/room/" + $("#meetin_room_name").text();
	
		var copyMessage = replaceTagAtSendMessage(sendMessage, meetin_room_url);
		var msgDisplayElement = $('#copy_msg');
		var showMsgText = "コピーしました";
		var showMsgDuration = 1500;

		executeCopyTarget(copyMessage, msgDisplayElement, showMsgText, showMsgDuration);

	});

	/**
	 * ビデオタップ時のイベント
	 */
	$('[id^=video_target_video_]').on('touchstart', function(event) {
		if( video_reload_flg ) {
			spRequestVideoStream();
		}
		// 初期化を行う
		$(this).closest(".video_target_area").find(".img_mute").removeClass("img_small_mute");
		$(this).closest(".video_target_area").find(".img_mute").removeClass("img_big_mute");
		$(this).closest(".video_target_area").find(".img_mute").css("top", "");
		// ビデオの大きさにより、スタイルを変更する
		if($(this).closest("div.big_video_area").length){
			// 大きビデオ専用のスタイルをあてる
			$(this).closest(".video_target_area").find(".img_mute").addClass("img_big_mute");
			// 左上だとヘッダー領域で隠れて触れないので位置を調整する
			$(this).closest(".video_target_area").find(".img_mute").css("top", $("div.meeting__header").height());
		}else{
			// 小さいビデオ専用のスタイルをあてる
			$(this).closest(".video_target_area").find(".img_mute").addClass("img_small_mute");
		}
		$(this).closest(".video_target_area").find(".img_mute").toggle();
	});

	/**
	 * ミュートボタン押下時のイベント
	 * @returns
	 */
	$('.img_mute').on('click', function(event) {
		// ビデオ領域タップ時のイベントがあるので、イベントを止める
		event.stopPropagation();
		// ミュート画像を切り替える
		if($(this).data("muted")){
			// 現在ミュートなので次をミュートを外す場合
			$(this).attr("src", "/img/sp/png/mute.png");
		}else{
			// 現在ミュートになっていないので次をミュートとする場合
			$(this).attr("src", "/img/sp/png/unmute.png");
		}
		// マイクミュートの処理(以下の処理はPCを移植なのでそちらを参照)
		var video_id = $(this).data("id");
		var muted = $(this).data("muted");
		muted = !muted;
		$(this).data("muted", muted);
		var flash = null;
		if (navigator.appName.indexOf("Microsoft") != -1) {
			// IE
			flash = window['negotiation_target_flash_' + video_id];
		} else {
			flash = document['negotiation_target_flash_' + video_id];
		}
		if(flash) {
			meetinFlashTargetVideo_muteAudio(video_id, muted);
		} else {
			mNegotiationMain.muteTargetAudio(video_id, muted);
		}
		if(muted == false) {
			$(this).find(".mi_video_icon").removeClass('icon-microphone-off');
			$(this).find(".mi_video_icon").addClass('icon-microphone');
		} else {
			$(this).find(".mi_video_icon").removeClass('icon-microphone');
			$(this).find(".mi_video_icon").addClass('icon-microphone-off');
		}
	});

	// ビデオをタッチした座標
	var videoTouchPositionY = 0;
	// ビデオが移動した座標
	var videoMovePositionY = 0;
	/**
	 * ビデオもしくはビデオオフ画像を上にフリックすることにより、画像を大きくする処理
	 * @param event
	 * @returns
	 */
	$(".video_style, .img_video_off").bind('touchstart', function(e) {
		if(e.originalEvent.touches[0]){
			// ビデオをタッチした時の座標を取得
			videoTouchPositionY = e.originalEvent.touches[0].pageY;
		}
	});
	$(".video_style, .img_video_off").bind('touchmove', function(e) {
		if(e.originalEvent.touches[0]){
			var moveY = e.originalEvent.touches[0].pageY;
			videoMovePositionY = Math.round(videoTouchPositionY - moveY);
		}
	});
	$(".video_style, .img_video_off").bind('touchend', function(e) {
		if(videoMovePositionY > 50){
			// 座標の初期化
			videoTouchPositionY = 0;
			videoMovePositionY = 0;
			// ユーザーIDを変数に設定
			var userId = e.currentTarget.id.slice(-1)[0];

			spChangeTargetVideoBig(userId);
		}
	});
});

function spChangeTargetVideoBig(userId) {
	// ミュートアイコンを全て初期化し非表示にする.
	$("#negotiation_target_video_" + userId + " .img_mute").each(function(i) {
		$(this).removeClass("img_small_mute");
		$(this).removeClass("img_big_mute");
		$(this).css("top", "");
		$(this).hide();
	});

	// フリック対象がビデオオフの場合
	if($("#img_video_off_" + userId).is(':visible')){
		// ビデオオフアイコンを拡大化する
		$("#img_video_off_" + userId).height($("div.full_screen__wrap").height()).width($("div.full_screen__wrap").width());
	}
	// 現在の大きいアイコンがビデオオフの場合は幅と高さを設定しているので初期化する
	if($(".big_video_area").find(".img_video_off").is(':visible')){
		$(".big_video_area").find(".img_video_off").css({'height':'', 'width':''});
	}
	// レイアウトの切り替え実行
	spChangeLayout(userId, "#4");
}


/**
 * スマートフォン専用のビデオ再接続
 * 自分以外のvideoストリームの再取得要求を行う
 *
 * これは、iPhone(Safari)の場合、INPUT(type=file)でファイル選択ダイアログを出すと
 * WebRtc通信中のvideo映像が止まる(黒くなる)ため実施。
 * 注意：iPhone（Safari）問題なので解消した場合は不要です。
 *
 */
function spRequestVideoStream() {
	video_reload_flg = false;
	// 再接続
	var mUserId = $('#user_id').val();
//console.log("My_user_id=("+ mUserId +")");

	for (var target_user_id = 1; target_user_id < MEETIN_MAIN_MAX_PEOPLE; target_user_id++) {
		if (target_user_id != mUserId) {
//console.log("target_user_id=("+ target_user_id +")");

			// WebRTC？Flash？
			var flash = null;
			if (navigator.appName.indexOf("Microsoft") != -1) {
				// IE
				flash = window['negotiation_target_flash_' + target_user_id];
			} else {
				// その他
				flash = document['negotiation_target_flash_' + target_user_id];
			}

			if (flash) {
//console.log("target Flash=("+ target_user_id +")");
				// Flash は表示されないので、なにも行わない！！。
			} else {
//console.log("target WebRTC=("+ target_user_id +")");
				var videoConnectionId = $('#video_target_video_connection_id_' + target_user_id).val();
				if (videoConnectionId && videoConnectionId.length > 0) {
					// video 接続有り
					var video = document.getElementById('video_target_video_' + target_user_id);
					if (video) {
						// video 有り
//console.log("sendRequestVideoStreamByUserId=("+ target_user_id +")");
						// 映像の再要求
						mNegotiationMain.sendRequestVideoStreamByUserId(target_user_id, null);
					}
				}
			}
		}
	}
}

// $(window).unload(function() {
// 	if (NEGOTIATION.isOperator) {
// 		negotiation_finish();
// 	} else {
// 		sendNegotiationFinishProcess();
// 		showNegotiationFinishDialogUser();
// 	}
// 	// 商談管理の破棄
// 	negotiationMainDestroy();
// });

/**
 * スマートフォン専用のレイアウト変更関数
 * 初期表示や画面サイズ変更時の他、アイコンと等倍のレイアウト変更で使用する
 * @param bigVideoUserId	大きいビデオにするのユーザーIDを渡す
 * @param callerMark		どの場所から呼ばれたのかを確認するためのマーカー
 * @returns
 */
function spChangeLayout(bigVideoUserId, callerMark){
	// ビデオオフアイコンの初期化
	resizeVideoOffImage(bigVideoUserId);

	// 1つずつ見て表示切り替えるまでは、マイクオフアイコンを非表示にしておく
	$('.sp_video_mic_off_icon').css('display', 'none');

	//画面共有中は、SP 小videoを隠す
	if ($('#video_share_screen').is(':visible')) {
		$('.small_video_area').css('visibility', 'hidden');
	} else {
		$('.small_video_area').css('visibility', 'visible');
	}

	// 現在アクティブなビデオ数を取得する
	var activeVideoNo = 0;
	for (var i=0;  i<=MAX_VIDEO; i++) {
		// ビデオタグの領域IDを作成
		var idStr = "#negotiation_target_video_" + i;
		// 現在ビデオを表示中か判定する
		if($(idStr).is(':visible')){
			activeVideoNo++;
		}
	}
	// アイコン形式、等倍形式にレイアウトを変更する
	if($("[name=layout_type]").val() == LAYOUT_TYPE_ICON){

		//console.log("oldestUserId:"+oldestUserId);
		if(Math.abs(window.orientation) === 90) {
			// ================================
			// 横向きの場合
			// ================================
			// 幅を計算する
			var videoAreaWidth = $(window).width() / 5;
			// 高さを計算する
			var videoAreaHeight = $(window).height();
			if(activeVideoNo > 1){
				videoAreaHeight = videoAreaHeight / (activeVideoNo - 1);	// 自分のビデオ数を減らす
			}
			// ビデオ表示領域サイズを設定する
			var topOffsetSeed = 0;		// アクティブな相手のビデオループ数を保持する（最初の表示は上端なので0とする）
			for (var i=0;  i<=MAX_VIDEO; i++) {
				var idStr = "#negotiation_target_video_" + i;
				var micIdStr = "#video_target_mic_" + i;
				// ビデオのスタイルを初期化する
				$(idStr).css({'height':'', 'width':'', "left":'', "bottom":'', "top":''});
				if(bigVideoUserId != i && $(idStr).is(':visible')){
					// 小さいアイコンのスタイル設定
					$(idStr).removeClass("big_video_area");
					$(idStr).addClass("small_video_area");
					$(micIdStr).addClass("sp_mic_off_icon_side");
					$(idStr).height(videoAreaHeight).width(videoAreaWidth);
					$(idStr).css("right", 0);
					// top値を求める
					var videoAreaTop = videoAreaHeight * topOffsetSeed;
					$(idStr).css("top", videoAreaTop);

					// 小さいビデオはビデオの大きさに合わせて可変にする
					$(".sp_mic_off_icon_side").css('left', $(idStr).width() * 0.22 + 'px');
					$(".sp_mic_off_icon_side").css('top', $(idStr).height() * 0.25 + 'px');	
					// ビデオが2つの場合、4つ以下の場合はレイアウトが異なるので指定
					if(activeVideoNo == 2){
						$(".sp_mic_off_icon_side").css('top', '150px');
					}
					if(activeVideoNo <= 4){
						$(".sp_mic_off_icon_side").css('left', '7px');
					}
					topOffsetSeed++;
				}else if(bigVideoUserId == i){
					$(micIdStr).removeClass("sp_mic_off_icon_side");
					settingBigVideoMicOff(micIdStr, LATERAL_DIRECTION);
					// 大きいビデオ専用のスタイル設定
					settingBigVideoStyle(idStr, LATERAL_DIRECTION);
				}
				// ビューティーモード対応
				if($(idStr).find("video").hasClass("beauty_mode_on")){
					settingBeautyMode(i, BEAUTY_MODE_ON);
				}else{
					settingBeautyMode(i, BEAUTY_MODE_OFF);
				}
			}
			// 画面共有が表示されている場合は、画面共有を大きいビデオとする
			if(bigVideoUserId == "negotiation_share_screen"){
				// 大きいビデオ専用のスタイル設定
				settingBigVideoStyle("#negotiation_share_screen", LATERAL_DIRECTION);
			}

			// 横画面に変更.
			$(".meeting__header").addClass("landscape");
			$(".meeting__footer").addClass("landscape");
		}else{
			if(bigVideoUserId == "negotiation_share_screen"){
				// 大きいビデオ専用のスタイル設定
				settingBigVideoStyle("#negotiation_share_screen", LATERAL_DIRECTION);
				activeVideoNo ++;
			}
			// 横画面を解除.
			$(".meeting__header").removeClass("landscape");
			$(".meeting__footer").removeClass("landscape");

			// ================================
			// 縦向きの場合
			// ================================
			// 高さを計算する(5の数値は塩梅)
			var videoAreaHeight = $(window).height() / 5;
			// 幅を計算する
			//var videoAreaWidth = $(window).width() / (activeVideoNo - 1);	// 自分のビデオ数を減らす
			//var videoAreaWidth = $(window).width() / 3;	// 自分のビデオ数を減らす
			// 小ビデオを横並びで表示.
			var videoAreaWidth = $(window).width();

			// 画面共有時に消えるのは、一番古い画面（入室順）
			if(activeVideoNo > 1){
				// MEMO. 大ビデオ(big_video_area)が1つある為 小ビデオ(small_video_area)枠は1つ少ない.
				let widthRatio = activeVideoNo - 1;
				if(widthRatio <= 3) {
					widthRatio = 3; // 3つまでは固定幅にする.
				}
				videoAreaWidth = videoAreaWidth / widthRatio;
			}

			// 表示位置の高さを計算(フッター領域の大きさとpadding値)
			var videoAreaBottom = $("div.meeting__footer").height() + 15;
			// ビデオ表示領域サイズを設定する
			var leftOffsetSeed = 0;		// アクティブな相手のビデオループ数を保持する（最初の表示は左端なので0とする）
			for (var i=0;  i<=MAX_VIDEO; i++) {
				var idStr = "#negotiation_target_video_" + i;
				var micIdStr = "#video_target_mic_" + i;
				var bigVideoAreaFlg = $('.big_video_area');

				// ビデオのスタイルを初期化する
				$(idStr).css({'height':'', 'width':'', "left":'', "bottom":'', "top":''});

				if((bigVideoUserId != i && $(idStr).is(':visible')) 
				|| ($('#negotiation_share_screen').is(':visible') && $(idStr).is(':visible')) ){
					// 小さいアイコンのスタイル設定
					$(idStr).removeClass("big_video_area");
					$(idStr).addClass("small_video_area");
					$(micIdStr).addClass("sp_mic_off_icon_side");
					$(idStr).height(videoAreaHeight).width(videoAreaWidth);
					$(idStr).css("bottom", videoAreaBottom);
					// left値を求める
					var videoAreaLeft = videoAreaWidth * leftOffsetSeed;
					$(idStr).css("left", videoAreaLeft);

					// 小さいビデオはビデオの大きさに合わせて可変にする
					if(bigVideoAreaFlg){
						$(micIdStr).css('left', $(idStr).width() * 0.14 + 'px');
						$(micIdStr).css('top', $(idStr).height() * 0.3 + 'px');	
					}

					leftOffsetSeed++;
				}else
				if(bigVideoUserId == i){
					$(micIdStr).removeClass("sp_mic_off_icon_side");
					settingBigVideoMicOff(micIdStr, VERTICAL_DIRECTION);
					// 大きいビデオ専用のスタイル設定
					settingBigVideoStyle(idStr, VERTICAL_DIRECTION);

				}
				// ビューティーモード対応
				if($(idStr).find("video").hasClass("beauty_mode_on")){
					settingBeautyMode(i, BEAUTY_MODE_ON);
				}else{
					settingBeautyMode(i, BEAUTY_MODE_OFF);
				}
			}
			// 画面共有が表示されている場合は、画面共有を大きいビデオとする
			if(bigVideoUserId == "negotiation_share_screen"){
				// 大きいビデオ専用のスタイル設定
				settingBigVideoStyle("#negotiation_share_screen", VERTICAL_DIRECTION);
			}
		}
		// ビデオレイアウトの種別変更
		$("[name=layout_type]").val(LAYOUT_TYPE_ICON);
	}else{
		// 等倍表示は接続人数により、レイアウト計算を変更する
		if(activeVideoNo == 2 || activeVideoNo == 3){
			// 高さを計算する
			var videoAreaHeight = $(window).height() / activeVideoNo;
			// 幅を計算する
			var videoAreaWidth = $(window).width();
			// ビデオ表示領域サイズを設定する
			var topOffsetSeed = 0;		// アクティブな相手のビデオループ数を保持する（最初の表示は左端なので0とする）
			for (var i=0;  i<=MAX_VIDEO; i++) {
				var idStr = "#negotiation_target_video_" + i;
				if($(idStr).is(':visible')){
					// ビデオのサイズを設定
					$(idStr).height(videoAreaHeight).width(videoAreaWidth);
					// top値を求める
					var videoAreaTop = videoAreaHeight * topOffsetSeed;
					// アニメーションさせつつ、場所を移動
					$(idStr).animate({"left":0, "bottom":0, "top":videoAreaTop}, 1000);
					topOffsetSeed++;
				}
				// ビューティーモード対応
				if($(idStr).find("video").hasClass("beauty_mode_on")){
					settingBeautyMode(i, BEAUTY_MODE_ON);
				}else{
					settingBeautyMode(i, BEAUTY_MODE_OFF);
				}
			}
		}else if(activeVideoNo == 4){
			// 高さを計算する
			var videoAreaHeight = $(window).height() / 2;
			// 幅を計算する
			var videoAreaWidth = $(window).width() / 2;
			// ビデオ表示領域サイズを設定する
			var topOffsetSeed = 0;
			var leftOffsetSeed = 0;
			for (var i=0;  i<=MAX_VIDEO; i++) {
				var idStr = "#negotiation_target_video_" + i;
				if($(idStr).is(':visible')){
					// ビデオのサイズを設定
					$(idStr).height(videoAreaHeight).width(videoAreaWidth);
					// top値を求める
					var videoAreaTop = videoAreaHeight * topOffsetSeed;
					// left値を求める(横に２つ並べるので2の余りを使用する)
					var videoAreaLeft = videoAreaWidth * (leftOffsetSeed % 2);
					// アニメーションさせつつ、場所を移動
					$(idStr).animate({"left":videoAreaLeft, "bottom":0, "top":videoAreaTop}, 1000);
					// 縦の並びを計算
					if((leftOffsetSeed % 2) == 1){
						// 横に二つ並んだら縦を増やす
						topOffsetSeed++;
					}
					// 横の数値は常に増やす
					leftOffsetSeed++;
				}
				// ビューティーモード対応
				if($(idStr).find("video").hasClass("beauty_mode_on")){
					settingBeautyMode(i, BEAUTY_MODE_ON);
				}else{
					settingBeautyMode(i, BEAUTY_MODE_OFF);
				}
			}
		}else if(activeVideoNo == 5){
			// 高さを計算する
			var videoAreaHeight = $(window).height() / 3;
			// 幅を計算する
			var videoAreaWidth = $(window).width() / 2;
			// ビデオ表示領域サイズを設定する
			var topOffsetSeed = 0;
			var leftOffsetSeed = 0;
			for (var i=0;  i<=MAX_VIDEO; i++) {
				var idStr = "#negotiation_target_video_" + i;
				if($(idStr).is(':visible')){
					// ビデオのサイズを設定
					$(idStr).height(videoAreaHeight).width(videoAreaWidth);
					// top値を求める
					var videoAreaTop = videoAreaHeight * topOffsetSeed;
					// left値を求める(横に２つ並べるので2の余りを使用する)
					var videoAreaLeft = videoAreaWidth * (leftOffsetSeed % 2);
					// 5つ目のビデオの場合は中央に表示する
					if(leftOffsetSeed == 4){
						videoAreaLeft = videoAreaWidth / 2;
					}
					// アニメーションさせつつ、場所を移動
					$(idStr).animate({"left":videoAreaLeft, "bottom":0, "top":videoAreaTop}, 1000);
					// 縦の並びを計算
					if((leftOffsetSeed % 2) == 1){
						// 横に二つ並んだら縦を増やす
						topOffsetSeed++;
					}
					// 横の数値は常に増やす
					leftOffsetSeed++;
				}
				// ビューティーモード対応
				if($(idStr).find("video").hasClass("beauty_mode_on")){
					settingBeautyMode(i, BEAUTY_MODE_ON);
				}else{
					settingBeautyMode(i, BEAUTY_MODE_OFF);
				}
			}
		}else if(activeVideoNo == 6){
			// 高さを計算する
			var videoAreaHeight = $(window).height() / 3;
			// 幅を計算する
			var videoAreaWidth = $(window).width() / 2;
			// ビデオ表示領域サイズを設定する
			var topOffsetSeed = 0;
			var leftOffsetSeed = 0;
			for (var i=0;  i<=MAX_VIDEO; i++) {
				var idStr = "#negotiation_target_video_" + i;
				if($(idStr).is(':visible')){
					// ビデオのサイズを設定
					$(idStr).height(videoAreaHeight).width(videoAreaWidth);
					// top値を求める
					var videoAreaTop = videoAreaHeight * topOffsetSeed;
					// left値を求める(横に２つ並べるので2の余りを使用する)
					var videoAreaLeft = videoAreaWidth * (leftOffsetSeed % 2);
					// アニメーションさせつつ、場所を移動
					$(idStr).animate({"left":videoAreaLeft, "bottom":0, "top":videoAreaTop}, 1000);
					// 縦の並びを計算
					if((leftOffsetSeed % 2) == 1){
						// 横に二つ並んだら縦を増やす
						topOffsetSeed++;
					}
					// 横の数値は常に増やす
					leftOffsetSeed++;
				}
				// ビューティーモード対応
				if($(idStr).find("video").hasClass("beauty_mode_on")){
					settingBeautyMode(i, BEAUTY_MODE_ON);
				}else{
					settingBeautyMode(i, BEAUTY_MODE_OFF);
				}
			}
		}
		// ビデオレイアウトの種別変更
		$("[name=layout_type]").val(LAYOUT_TYPE_SAME);
	}
}

/**
 * 大きいビデオのマイクの表示位置を設定
 * @param micOffId		ビデオタグのID
 * @returns
 */
function settingBigVideoMicOff(micOffId, direction){
	// idを取得
	$(micOffId).css("top","100px");
	// 端末の向きに合わせ、クラスを設定する
	if(direction == VERTICAL_DIRECTION){
		// 縦の場合
		$(micOffId).css("left","5px");
	}else{
		// 横の場合
		console.log(MAX_VIDEO,"MAX_VIDEO");
		// マイクoffアイコンの横余白指定
		$(micOffId).css("left","50px");
	}
}

/**
 * 大きいビデオのスタイルを設定する為の関数
 * カメラ映像以外に、画面共有の概念が入ったので別途関数に切り出し
 * @param videoId		ビデオタグのID
 * @param direction		縦持ちと横持ちの判定用
 * @returns
 */
function settingBigVideoStyle(videoId, direction){
	// 画面共有はleft値の初期化が実行されないので、ここで保証する
	$(videoId).css("left", '');
	$(videoId).css("right", '');
	// 端末の向きに合わせ、クラスを設定する
	if(direction == VERTICAL_DIRECTION){
		// 縦の場合
		$(videoId).removeClass("small_video_area");
		$(videoId).addClass("big_video_area");
		$(videoId).removeClass("video_target_area_side");
		$(videoId).addClass("video_target_area_vertical");
	}else{
		// 横の場合
		$(videoId).removeClass("small_video_area");
		$(videoId).addClass("big_video_area");
		// 横向きの場合
		$(videoId).removeClass("video_target_area_vertical");
		$(videoId).addClass("video_target_area_side");
		// 横長の場合のみビデオを中央表示する
		//var offsetLeft = ($(window).outerWidth() - $(videoId).width()) / 2;
		//console.log("["+$(window).outerWidth()+"]["+$(videoId).width()+"]["+($(window).outerWidth() - $(videoId).width())+"]["+offsetLeft+"]");
		//$(videoId).css("left", offsetLeft);
	}
}

/**
 * スマフォの現在の向きを計算しスタイルを変更する
 * @returns
 */
function changeDirectionVideo(idNo){
	// 自分のビデオを特定するためのキー
	var idStr = "#negotiation_target_video_" + idNo;
	// ビデオレイアウトの設定
	if(Math.abs(window.orientation) === 90) {
		// 横向きの場合
		$(idStr).removeClass("video_target_area_vertical");
		$(idStr).addClass("video_target_area_side");
		// 横長の場合のみビデオを中央表示する
		var offsetLeft = ($(window).outerWidth() - $(idStr).width()) / 2;
		$(idStr).css("left", offsetLeft);
	}else{
		// 縦向きの場合
		$(idStr).removeClass("video_target_area_side");
		$(idStr).addClass("video_target_area_vertical");
	}
}

/**
 * ビデオのON・OFF切り替え時のアイコン制御
 * @param isOffVideo
 * @returns
 */
function spToggleVideo(userId, isOffVideo){
	// ビデオOFF時の画像を操作する為のID作成
	var negotiationTargetVideoId = "#negotiation_target_video_" + userId;
	var imgVideoOffId = "#img_video_off_" + userId;
	if(isOffVideo) {
		// ビデオOFFアイコンのサイズを指定する
		if($(negotiationTargetVideoId).hasClass("big_video_area") && $("[name=layout_type]").val() == LAYOUT_TYPE_ICON){
			// 自分のビデオを非表示かつ、アイコンレイアウトの場合はビデオOFF画像を大きくする
			$(negotiationTargetVideoId).find(imgVideoOffId).height($("div.full_screen__wrap").height()).width($("div.full_screen__wrap").width());
		}
		$(negotiationTargetVideoId).find(imgVideoOffId).show();
	} else {
		// ビデオOFFアイコンのサイズを削除する
		if($(negotiationTargetVideoId).hasClass("small_video_area") && $("[name=layout_type]").val()){
			// ビデオOFFアイコンのサイズ変更は自分のビデオの場合のみ変更される
			$(negotiationTargetVideoId).find(imgVideoOffId).css("height", '');
			$(negotiationTargetVideoId).find(imgVideoOffId).css("width", '');
		}
		$(negotiationTargetVideoId).find(imgVideoOffId).hide();
	}
}

/**
 * チャットウインドウの表示
 * @returns
 */
function showChatBord(){
	// チャットウインドウ表示処理
	$('#meeting__wrap').hide();
	$('#content__wrap').css('background-color', '#878787');
	$('.full_screen__wrap').css({'filter':'blur(15px)', 'opacity':'0.6'});
	$('#chat__wrap').show();

	// メッセージの最後を表示するように、一番下へスクロールする
	showLatestChatMessage();
}
/**
 * メッセージの最後を表示するように、一番下へスクロールする
 * 複数箇所で呼ぶので一元化する為に関数化
 * @returns
 */
function showLatestChatMessage(){
	$('#chat_board_messages').animate({scrollTop: $('#chat_board_messages')[0].scrollHeight}, 'fast');
}

/**
 * チャットウインドウの非表示
 * @returns
 */
function hideChatBord(){
	$('#chat__wrap').hide();
	$('#content__wrap').css('background-color', '');
	$('.full_screen__wrap').css({'filter':'', 'opacity':''});
	$('#meeting__wrap').show();
}

/**
 * 読み込んだ画像を再度読み込み直す（サイスを取得する為）
 * @param imgData
 * @returns
 */
function loadPhotoImage(fileName){
	// サーバー保存ファイルのパス
	var documentPath = "/negotiation_document/negotiation_"+ $("#connection_info_id").val() + "/";
	// 乱数の文字を取得
	var uuid = UUID.generate();
	var uniqueStr = uuid.replace(/\-/g, '');
	var loadPhotoPathImage = documentPath + fileName + "?" + uniqueStr;

	// ファイルを読み込む
	var photoImg = new Image();
	photoImg.onload = function() {
		// 読み込んだ画像を表示する
		viewDocumentImage(photoImg, loadPhotoPathImage, "#sp_img_document");
	}
	photoImg.onerror = function() {
		// サーバー側でまだ画像の生成が完了していない場合があるので、2秒後に再帰する
		setTimeout(function(){
			loadPhotoImage(fileName);
		}, 2000);
	}
	photoImg.src = loadPhotoPathImage;
}

/**
 * 読み込んだ画像を表示する
 * @param documentImg	ロード結果のimgオブジェクト
 * @param srcData		ロード対象のデータ
 * @oaram imgTagId		画像を設定するタグのID[sp_img_document][]
 * @returns
 */
function viewDocumentImage(documentImg, srcData, imgTagId){
	// 画像の幅と高さを取得する
	var documentImgWidth = documentImg.width;
	var documentImgHeight = documentImg.height;
	// 縦長と横長の画像を判定し、表示サイズを設定する
	if(documentImgWidth > documentImgHeight){
		// 横長画像
		$(imgTagId).addClass("height_long_image");
		$(imgTagId).removeClass("width_long_image");
	}else{
		// 縦長画像
		$(imgTagId).addClass("width_long_image");
		$(imgTagId).removeClass("height_long_image");
	}
	// 画像を表示
	if(imgTagId == '#sp_img_document') {
		$(imgTagId).attr("src", srcData);
		$("#sp_document_area").show();
		var colorWidth = $('#sp_document_area .color__white').width();
		$('#sp_document_area .color__white, #sp_document_area .color__black, #sp_document_area .color__green, #sp_document_area .color__yellow, #sp_document_area .color__red, #sp_document_area .color__blue').css({'height': colorWidth + 'px'});
	}

	// キャンバスを表示
	if(imgTagId == '#sp_img_document') {
		setTimeout(function(){
			// 資料書き込み用ののキャンバスサイズを指定する
			var documentWdth = getDocumentWdth();
			var documentHeight = getDocumentHeight();
			var canvas = document.getElementById("sp_img_canvas");
			var ctx = canvas.getContext('2d');
			canvas.width = documentWdth;     // 画像ファイルの横幅がcanvasの横幅になります
			canvas.height = documentHeight;
			ctx.drawImage(documentImg, 0, 0, documentWdth, documentHeight);
			ctx.clearRect(0, 0, documentWdth, documentHeight);
		}, 500);
	}
}

function getDocumentWdth() {
	var documentWdth = $("#sp_img_document").width();
	return documentWdth;
}
function getDocumentHeight() {
	var documentHeight = $("#sp_img_document").height();
	return documentHeight;
}

/**
 * SP内の画像アップロード処理
 * @param imgData
 * @returns
 */
function uploadPhoto(imgData){

	// 他のユーザーに資料アップロード開始を通知する
	var data = {
			command : "DOCUMENT",
			type : "UPLOAD_DOCUMENT_BEGIN"
	};
	sendCommand(SEND_TARGET_ALL, data);

	var staffType = $("#staff_type").val();
	var staffId = $("#staff_id").val();
	var clientId = $("#client_id").val();
	var uuId = localStorage.UUID;
	if( !uuId ) {	// 空
		uuId = UUID.generate();
		localStorage.UUID = uuId;
	}
	// ファイル名を取得する
	var uploadFileName = $("#access_photos").val().toLowerCase().split("\\").slice(-1)[0].replace("jpeg", "jpg");
	// サーバーに画像を送付する
	$.ajax({
		url: "https://" + location.host + "/negotiation/upload-material",
		type: "POST",
		data: {filename : uploadFileName, filedata : imgData, staff_type : staffType, staff_id : staffId, client_id : clientId},
		success: function(resultJson) {
			// jsonをオブジェクトに変換
			var result = $.parseJSON(resultJson);
			var resultMaterialId = result["material_basic"]["material_id"];

			// 他のユーザーに資料アップロード終了を通知する
			// UPしたユーザのUUID追加
			var data = {
					command : "DOCUMENT",
					type : "UPLOAD_DOCUMENT_END",
					resultMaterialId : resultMaterialId,
					registUserId : $('#user_id').val(),
					staff_type : staffType,
					staff_id : staffId,
					client_id : clientId,
					uu_id : uuId
			};
			sendCommand(SEND_TARGET_ALL, data);

			if(result["status"] == 1){
				// 自分の画面に画像を表示する(SPの画像ファイルは必ず１つとなるので添字は0とする)
				loadPhotoImage(result["material_detail"][0]["material_filename"]);

				// 資料IDの設定
				resultMaterialId = result["material_basic"]["material_id"];
				// PCユーザー向けに専用の関数呼び出し
				spLoadAndShowMaterial(resultMaterialId, $('#user_id').val(), staffType, staffId, clientId, uuId);
				// SPユーザー向けに専用の関数呼び出し
				var data = {
						command : "DOCUMENT",
						type : "SP_UPLOAD_DOCUMENT_END",
						resultMaterialId : resultMaterialId,
						registUserId : $('#user_id').val(),
						staff_type : staffType,
						staff_id : staffId,
						client_id : clientId,
						uu_id : uuId
				};
				sendCommand(SEND_TARGET_ALL, data);
				// 現在表示している資料のIDを設定
				currentDocumentId = resultMaterialId;
			}else{
				$("div.upload_document_message").text("アップロード失敗しました");
			}
		}
	});
}
/**
 * SP用の画像を閉じる
 * @returns
 */
function hidePhotoImg(){
	$("#access_photos").val("");
	$("#sp_document_area").hide();
	// 画面共有中の下に資料展開している時は、再表示するため初期化しない
	if (!NEGOTIATION.mIsScreenOn && $('#document_material_id').val()) {
		// 現在表示中の資料IDを初期化する
		currentDocumentId = 0;
		// 現在表示中のページを初期化する
		currentPage = 0;
		$("#document_material_id").val("");
		$("#document_uuid").val("");
		$("#document_user_id").val("");
	}
	initScale();
	return_scaling();
	returnZoomInAndOutDocument();
}

var t = 0;
document.documentElement.addEventListener('touchend', function (e) {
	var now = new Date().getTime();
	if ((now - t) < 350){
		e.preventDefault();
	}
	t = now;
}, false);

/**
 * 画面を上下にスワイプした際にビヨーンと伸びる動きを切る
 * @param event
 * @returns
 */
function preventScroll(event){
	if(event.touches[0]){
		// ピンチイン・アウトを行う場所のみイベントを止める
		var stopEvent = false;
		if(event.touches[0].target.tagName.toLowerCase() == "video"){
			// 小さいビデオ操作の場合のみ、イベントを止める
			var videoId = "#" + event.touches[0].target.id;
			if($(videoId).closest("div.small_video_area").length){
				stopEvent = true;
			}
		}else if(event.touches[0].target.className.indexOf('img_video_off') > -1){
			var videoId = "#" + event.touches[0].target.id;
			if($(videoId).closest("div.small_video_area").length){
				stopEvent = true;
			}
		}else if(event.touches[0].target.id == "sp_img_canvas"){
			// ホワイトボード操作の指アイコン押下以外の場合は
			if(selectLeftTool != TOOL_CURSORE_SELECT){
				stopEvent = true;
			}
		}else if (event.touches[0].target.id == "sp_img_canvas") {
			// 資料操作の指アイコン押下以外の場合は
			if(selectLeftTool != TOOL_CURSORE_SELECT){
				stopEvent = true;
			}
		}
		if(stopEvent){
			event.preventDefault();
		}
	}
}
// ボタンのタップは有効にしたいので、touchstartにはイベントを追加しない
//document.addEventListener("touchstart", preventScroll, {"passive": false});
document.addEventListener("touchmove", preventScroll, {"passive": false});
document.addEventListener("touchend", preventScroll, {"passive": false});

/**
 * 二本指で操作した際はスクロールロックを解除する
 * @param event
 * @returns
 */
/*
var lockScrollFlg = true;
function beginPossibleScroll(event){
	// スクロールのロックを解除する
	lockScrollFlg = false;
}
function endPossibleScroll(event){
	// スクロールをロックする
	lockScrollFlg = true;
}
document.addEventListener("gesturestart", beginPossibleScroll, false);
document.addEventListener("gesturechange", beginPossibleScroll, false);
document.addEventListener("gestureend", endPossibleScroll, false);
*/

/**
 * 画像の向きを取得する
 * @param imgDataURL
 * @returns
 */
function getOrientation(imgData){
	var byteString = atob(imgData.split(',')[1]);
	var orientaion = byteStringToOrientation(byteString);
	return orientaion;

	function byteStringToOrientation(img){
		var head = 0;
		var orientation;
		while (1){
			if (img.charCodeAt(head) == 255 & img.charCodeAt(head + 1) == 218) {break;}
			if (img.charCodeAt(head) == 255 & img.charCodeAt(head + 1) == 216) {
			head += 2;
		}
		else {
			var length = img.charCodeAt(head + 2) * 256 + img.charCodeAt(head + 3);
			var endPoint = head + length + 2;
			if (img.charCodeAt(head) == 255 & img.charCodeAt(head + 1) == 225) {
				var segment = img.slice(head, endPoint);
					var bigEndian = segment.charCodeAt(10) == 77;
					var count;
					if (bigEndian) {
						count = segment.charCodeAt(18) * 256 + segment.charCodeAt(19);
					} else {
						count = segment.charCodeAt(18) + segment.charCodeAt(19) * 256;
					}
					for (i=0; i < count; i++){
						var field = segment.slice(20 + 12 * i, 32 + 12 * i);
						if ((bigEndian && field.charCodeAt(1) == 18) || (!bigEndian && field.charCodeAt(0) == 18)) {
							orientation = bigEndian ? field.charCodeAt(9) : field.charCodeAt(8);
						}
					}
					break;
				}
				head = endPoint;
			}
			if (head > img.length){break;}
		}
		return orientation;
	}
}

/**
 * ビデオ表示ユーザーの中で、最後に入室したユーザーを
 * 強制的に大きいビデオにし、レイアウトを表示する関数
 * @returns
 */
function forcedNewUserBigLayout(){
	// 大きいビデオを表示している中で最後に入室したユーザーを大きくする
	var bigVideoUserId = 0;
	for (var i=0;  i<=MAX_VIDEO; i++) {
		// ビデオタグの領域IDを作成
		var idStr = "#negotiation_target_video_" + i;
		// 現在ビデオを表示中か判定する
		if($(idStr).is(':visible') && $(idStr).data("roomMode") == 1){
			bigVideoUserId = i;
		}
	}
	// レイアウトリセットを実行する
	spChangeLayout(bigVideoUserId, "#8");
}

/**
 * 全ユーザーのビデオを小さいアイコンようのスタイルに変更する
 * @returns
 */
function forcedAllUserSmallLayout(){
	for (var i=0;  i<=MAX_VIDEO; i++) {
		// ビデオタグの領域IDを作成
		var idStr = "#negotiation_target_video_" + i;
		// 現在ビデオを表示中か判定する
		if($(idStr).is(':visible') && $(idStr).hasClass("big_video_area")){
			$(idStr).removeClass("big_video_area");
			$(idStr).addClass("small_video_area");
		}
	}
}

/**
 * ビデオオフ画像のサイズを再設定する
 * 画面共有の場合は、画面共有が大きいビデオになるので全ビデオOFFアイコンを小さくする
 * この初期化は現在spChangeLayout()からしか呼ばれない。
 * bigVideoUserIdには現在の大きいビデオもしくは、大きいビデオにしたいユーザーIDを設定
 * @returns
 */
function resizeVideoOffImage(bigVideoUserId){
	for (var i=0;  i<=MAX_VIDEO; i++) {
		// ビデオタグの領域IDを作成
		var idStr = "#negotiation_target_video_" + i;
		if(bigVideoUserId == i){
			// 大きいビデオのビデオオフアイコンのサイズを設定する
			$(idStr).find(".img_video_off").height($("div.full_screen__wrap").height()).width($("div.full_screen__wrap").width());
		}else{
			$(idStr).find(".img_video_off").css({'height':'', 'width':''});
		}
	}
}

function resetLayout(){
	var bigVideoId = $(".big_video_area").data("id");
	if($("#negotiation_share_screen").is(':visible')){
		// 画面共有表示中の場合は、画面共有を優先する
		bigVideoId = "negotiation_share_screen";
	}
	spChangeLayout(bigVideoId, "#9");
}

/**
 *	横画面レイアウト用のデザイン要望に対しての対策.
 */
function setClassByOrientation() {
	// 画面の横レイアウトの場合のみ body に landscapeクラスを付ける.
	if(Math.abs(window.orientation) === 90) {
		$("body").addClass("landscape");
	} else {
		$("body").removeClass("landscape");
	}
}
