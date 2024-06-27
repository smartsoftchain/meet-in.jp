const MAX_VIDEO = 6;					// 6はビデオの最大数
const LAYOUT_TYPE_ICON = "icon";		// アイコン表示
const LAYOUT_TYPE_SAME = "same";		// 等倍表示
const LATERAL_DIRECTION = "lateral";	// 画面の持ち方が横方向
const VERTICAL_DIRECTION = "vertical";	// 画面の持ち方が縦方向
$(function() {

	// 共通の初期化処理
	initCommon();
	function initCommon(){
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
		// レイアウトの切り替え実行
		var bigVideoId = $(".big_video_area").data("id");
		if($("#negotiation_share_screen").is(':visible')){
			// 画面共有表示中の場合は、画面共有を優先する
			bigVideoId = "negotiation_share_screen";
		}
		spChangeLayout(bigVideoId, "#1");
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
				$('#meeting__menuBtn').children('img').attr('src', '/img/sp/png/transmission_logo.png');
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
			$("#button_camera").attr('src', '/img/sp/png/movie.png');
			// ビデオOFFにより、アイコン表示
			spToggleVideo($('#user_id').val(), true);
		} else {
			// ビデオボタンを変更
			$("#button_camera").attr('src', '/img/sp/png/unmovie.png');
			// ビデオONにより、アイコン非表示
			spToggleVideo($('#user_id').val(), false);
		}
	});

	// ミュートボタンのONOFFの切り替え
	$('#button_mic').on('click', function() {
		$(this).toggleClass('mute');
		if($(this).hasClass('mute')) {
			$(this).attr('src', '/img/sp/png/mike.png');
		} else {
			$(this).attr('src', '/img/sp/png/unmike.png');
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
		$('#access_photos').trigger('click');
	});
	// ファイルが選択された場合の処理
	$('#access_photos').change(function(){
		if (this.files.length > 0) {
			// ファイル情報取得
			var file = this.files[0];
			var reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = function() {
				//console.log(reader.result);
				// 読み込んだ画像を再度読み込む（画像のサイズ取得を行う必要がある為）
				loadPhotoImage(reader.result);
				// ============================================
				// 画像のアップロードを開始する
				// material_upload.jsの処理を流用する
				// ============================================
				uploadPhoto(reader.result);
			}
		}
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
				type : "HIDE_DOCUMENT"
		};
		sendCommand(SEND_TARGET_ALL, data);
		// 自分の画像を閉じる
		hidePhotoImg();
	});

	// 商談終了処理
	$('#sp_negotiation_finish').on('click', function() {
		if (NEGOTIATION.isOperator) {
			negotiation_finish();
		} else {
			sendNegotiationFinishProcess();
			showNegotiationFinishDialogUser();
		}
		// 商談管理の破棄
		negotiationMainDestroy();
	});

	/**
	 * URLをコピーのイベント
	 */
	$(document).on('click', '#icon_copy_url', function(){
		var meetin_room_url = location.protocol + "//" + location.host + "/room/" + $("#meetin_room_name").text();
		// 画面上見えないタグ<span>へ表示
		$('#share_message').html(meetin_room_url);
		var copytext = $('#share_message').get(0);
		var sel = window.getSelection();
		var range = document.createRange();
		range.selectNode(copytext);
		sel.removeAllRanges();	// 選択解除(念のため)
		sel.addRange(range);	// ALL選択
		$("#copy_msg").text("コピーしました");
		setTimeout(function(){
			$("#copy_msg").text("");
		}, 1500);
	  	// ブラウザのコピー処理を実行する
	  	document.execCommand("copy");
	});

	/**
	 * 招待文をコピーのイベント(Safari対応)
	 * touchstart->clickへ変更(touchstart)だと以下処理が正しく動かないため
	 * Safariだとevent.clipboardData.setData()が正しく動かないため、createRange()/selectNode()
	 * を使用したクリップボードコピーへ変更
	 * 注意：createRangeの場合画面上に見えるタグじゃないとエラーになってしまうので、
	 * タグ内容は表示するが画面上見えない位置にわざと表示してます。
	 */
	$(document).on('click', '#icon_copy_sentence', function(){
		var meetin_room_url = location.protocol + "//" + location.host + "/room/" + $("#meetin_room_name").text();
		// 改行は<br>にする
		var copyMessage = [
			"いつも大変お世話になっております。<br>",
			"下記の日程でオンラインビデオチャットをお願いいたします。<br>",
			"<br>",
			"■00/00　00:00～00:00<br>",
			"<br>",
			"当日は下記URLよりビデオチャットルームにアクセスし、<br>",
			"お待ちいただけますと幸いです。<br>",
			"",
			meetin_room_url+"<br>",
			"<br>",
			"以上、ご不明点がございましたら下記までお問い合わせくださいませ。<br>",
			"<br>",
			"担当者：<br>",
			"連絡先：<br>",
			"メールアドレス：<br>"].join("");

		// 画面上見えないタグ<span>へ表示
		$('#share_message').html(copyMessage);

		//★この部分を追加★
		// タグが非表示だとcopyされたなめ、画面外の見合内タグを設けて
		// その内容をクリップボードへコピーする
		var copytext = $('#share_message').get(0);
		var sel = window.getSelection();
		var range = document.createRange();
		range.selectNode(copytext);
		sel.removeAllRanges();	// 選択解除(念のため)
		sel.addRange(range);	// ALL選択
		//★この部分を追加★
		$("#copy_msg").text("コピーしました");
		setTimeout(function(){
			$("#copy_msg").text("");
		}, 1500);
		// ブラウザのコピー処理を実行する
		document.execCommand("copy");
	});

	/**
	 * ビデオタップ時のイベント
	 */
	$('[id^=video_target_video_]').on('touchstart', function(event) {
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
			// ミュートアイコンを全て初期化し非表示にする
			$(".img_mute").each(function(i) {
				$(this).removeClass("img_small_mute");
				$(this).removeClass("img_big_mute");
				$(this).css("top", "");
				$(this).hide();
			});
			// ユーザーIDを変数に設定
			var userId = e.currentTarget.id.slice(-1)[0];
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
	});
});

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
	// 現在アクティブなビデオ数を取得する
	var activeVideoNo = 0;
	for (var i=0;  i<MAX_VIDEO; i++) {
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
			var videoAreaHeight = $(window).height() / (activeVideoNo - 1);	// 自分のビデオ数を減らす
			// ビデオ表示領域サイズを設定する
			var topOffsetSeed = 0;		// アクティブな相手のビデオループ数を保持する（最初の表示は上端なので0とする）
			for (var i=0;  i<MAX_VIDEO; i++) {
				var idStr = "#negotiation_target_video_" + i;
				// ビデオのスタイルを初期化する
				$(idStr).css({'height':'', 'width':'', "left":'', "bottom":'', "top":''});
				if(bigVideoUserId != i && $(idStr).is(':visible')){
					// 小さいアイコンのスタイル設定
					$(idStr).removeClass("big_video_area");
					$(idStr).addClass("small_video_area");
					$(idStr).height(videoAreaHeight).width(videoAreaWidth);
					$(idStr).css("right", 0);
					// top値を求める
					var videoAreaTop = videoAreaHeight * topOffsetSeed;
					$(idStr).css("top", videoAreaTop);
					topOffsetSeed++;
				}else if(bigVideoUserId == i){
					// 大きいビデオ専用のスタイル設定
					settingBigVideoStyle(idStr, LATERAL_DIRECTION);
				}
			}
			// 画面共有が表示されている場合は、画面共有を大きいビデオとする
			if(bigVideoUserId == "negotiation_share_screen"){
				// 大きいビデオ専用のスタイル設定
				settingBigVideoStyle("#negotiation_share_screen", LATERAL_DIRECTION);
			}
		}else{
			// ================================
			// 縦向きの場合
			// ================================
			// 高さを計算する(5の数値は塩梅)
			var videoAreaHeight = $(window).height() / 5;
			// 幅を計算する
			//var videoAreaWidth = $(window).width() / (activeVideoNo - 1);	// 自分のビデオ数を減らす
			var videoAreaWidth = $(window).width() / 3;	// 自分のビデオ数を減らす
			// 表示位置の高さを計算(フッター領域の大きさとpadding値)
			var videoAreaBottom = $("div.meeting__footer").height() + 15;
			// ビデオ表示領域サイズを設定する
			var leftOffsetSeed = 0;		// アクティブな相手のビデオループ数を保持する（最初の表示は左端なので0とする）
			for (var i=0;  i<MAX_VIDEO; i++) {
				var idStr = "#negotiation_target_video_" + i;
				// ビデオのスタイルを初期化する
				$(idStr).css({'height':'', 'width':'', "left":'', "bottom":'', "top":''});
				if(bigVideoUserId != i && $(idStr).is(':visible')){
					// 小さいアイコンのスタイル設定
					$(idStr).removeClass("big_video_area");
					$(idStr).addClass("small_video_area");
					$(idStr).height(videoAreaHeight).width(videoAreaWidth);
					$(idStr).css("bottom", videoAreaBottom);
					// left値を求める
					var videoAreaLeft = videoAreaWidth * leftOffsetSeed;
					$(idStr).css("left", videoAreaLeft);
					leftOffsetSeed++;
				}else if(bigVideoUserId == i){
					// 大きいビデオ専用のスタイル設定
					settingBigVideoStyle(idStr, VERTICAL_DIRECTION);
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
			for (var i=0;  i<MAX_VIDEO; i++) {
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
			}
		}else if(activeVideoNo == 4){
			// 高さを計算する
			var videoAreaHeight = $(window).height() / 2;
			// 幅を計算する
			var videoAreaWidth = $(window).width() / 2;
			// ビデオ表示領域サイズを設定する
			var topOffsetSeed = 0;
			var leftOffsetSeed = 0;
			for (var i=0;  i<MAX_VIDEO; i++) {
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
			}
		}else if(activeVideoNo == 5){
			// 高さを計算する
			var videoAreaHeight = $(window).height() / 3;
			// 幅を計算する
			var videoAreaWidth = $(window).width() / 2;
			// ビデオ表示領域サイズを設定する
			var topOffsetSeed = 0;
			var leftOffsetSeed = 0;
			for (var i=0;  i<MAX_VIDEO; i++) {
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
			}
		}else if(activeVideoNo == 6){
			// 高さを計算する
			var videoAreaHeight = $(window).height() / 3;
			// 幅を計算する
			var videoAreaWidth = $(window).width() / 2;
			// ビデオ表示領域サイズを設定する
			var topOffsetSeed = 0;
			var leftOffsetSeed = 0;
			for (var i=0;  i<MAX_VIDEO; i++) {
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
			}
		}
		// ビデオレイアウトの種別変更
		$("[name=layout_type]").val(LAYOUT_TYPE_SAME);
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
		var offsetLeft = ($(window).outerWidth() - $(videoId).width()) / 2;
		//console.log("["+$(window).outerWidth()+"]["+$(videoId).width()+"]["+($(window).outerWidth() - $(videoId).width())+"]["+offsetLeft+"]");
		$(videoId).css("left", offsetLeft);
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
function loadPhotoImage(imgData){
	var photoImg = new Image();
	photoImg.src = imgData;
	photoImg.onload = function() {
		// 読み込んだ画像を表示する
		viewDocumentImage(photoImg, imgData, "#sp_img_document");
	}
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
	$(imgTagId).attr("src", srcData);
	$("#sp_document_area").show();
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
	var uploadFileName = $("#access_photos").val().split("\\").slice(-1)[0].replace("jpeg", "jpg");
	// サーバーに画像を送付する
	$.ajax({
		url: "https://" + location.host + "/negotiation/upload-material",
		type: "POST",
		data: {filename : uploadFileName, filedata : imgData, staff_type : staffType, staff_id : staffId, client_id : clientId},
		success: function(resultJson) {
			// jsonをオブジェクトに変換
			var result = $.parseJSON(resultJson);
			var resultMaterialId = 0;

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
		// 有効にしたいタグを記述
		if (event.touches[0].target.tagName.toLowerCase() == "canvas") {
			if(selectLeftTool == TOOL_CURSORE_SELECT){
				// キャンバス押下かつペンツールを未選択の場合はスクロールする
				return;
			}
		}else if(event.touches[0].target.tagName.toLowerCase() == "div"){
			if(event.touches[0].target.id == "chat_board_messages" || event.touches[0].target.className.indexOf('chat') > -1){
				// チャット関連
				return;
			}
		}else if(event.touches[0].target.className == "video_style"){
			// スワイプしたビデオの要素が小さい（small_video_area）の場合はイベントを有効とする
			var videoId = "#" + event.touches[0].target.id;
			if($(videoId).closest("div.small_video_area").length){
				return;
			}
		}else if(event.touches[0].target.className.indexOf('img_video_off') > -1){
			//  スワイプしたビデオの要素が小さい（small_video_area）の場合はイベントを有効とする
			//  この分岐はビデオオフの場合
			var videoId = "#" + event.touches[0].target.id;
			if($(videoId).closest("div.small_video_area").length){
				return;
			}
		}else if(event.touches[0].target.tagName.toLowerCase() == "textarea"){
			// 共有メモ「textarea.share_memo_text」
			return;
		}
		event.preventDefault();
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
