/**
 * Created by matsuno.masahiro on 2017/02/14.
 * negotiation のイベント関数。
 * 必須：negotiation.js
 */

var mReconnectTimer = false;
//var mRoomLocked = false;
// チャットディスプレイが一度でも開かれたか？
var mChatBoardDsp = false;

// ロック状態の部屋に入室する.
const WANT_ENTER_LOCKED_ROOM_STATUS = {
	INPUT_VIEW: 1,
	RESPONSE_WAIT: 2,
	REQUEST_APPROVAL: 3,
	REQUEST_REJECTED: 4,
	REQUEST_CANCEL: 5
}


/**
 * イベントをバインドする関数
 */
NEGOTIATION.eventBind = function (){
	//window
	$(window).focus( function () {
		document.focus =true;// イベント発生時点でdocument.hasFocus()がtrueにならないため無理やりやる
		sendSystemInfoDetail(null);
	} );
	$(window).blur( function () {
		sendSystemInfoDetail(null);
	} );

	window.addEventListener(
		"message",
		function(event){
			if (event.source != window) {
				return;
			}
			if (event.data.type == 'TabCaptureExtentionReady') {
				return;
			} else if (event.data.type == 'TabCaptureExtentionNotReady') {
				var title = 'お知らせ';
				var message = "Meetin録画を起動して下さい。";

				return createCommonDialog(
					title,
					message,
					false,
					true,
					false,
					null,
					null,
					null,
					true,
					true
				);
			} else if (event.data.type == 'StartCaptureTabCapture_recording') {
				return;
			} else if (event.data.type == 'StartCaptureTabCapture_paused') {
				return;
			} else if (event.data.type == 'StartCaptureTabCapture_error') {
				return;
			} else if (event.data.type == 'StartCaptureTabCapture_success') {
				NEGOTIATION.mRecordState = "recording";
				$('#button_record').attr('class', 'mi_header_status mi_active');
				$('#button_record').html('<span class="icon-rec mi_default_label_icon_2"></span>録画中');
				return;
			} else if (event.data.type == 'PauseCaptureTabCapture_success') {
				NEGOTIATION.mRecordState = "pause";
				$('#button_record').attr('class', 'mi_header_status');
				$('#button_record').html('<span class="icon-rec mi_default_label_icon_2"></span>中断中');
				return;
			} else if (event.data.type == 'ResumeCaptureTabCapture_success') {
				NEGOTIATION.mRecordState = "recording";
				$('#button_record').attr('class', 'mi_header_status mi_active');
				$('#button_record').html('<span class="icon-rec mi_default_label_icon_2"></span>録画中');
				return;
			} else if (event.data.type == 'StopCaptureTabCapture_success') {
				NEGOTIATION.mRecordState = "stop";
				$('#button_record').attr('class', 'mi_header_status');
				$('#button_record').html('<span class="icon-rec mi_default_label_icon_2"></span>録画');
				return;
			} else if (event.data.type == 'ADD_ICE_CANDIDATE_ERROR') {
/*
				// なぜか下記のエラーが起きたので、再接続で対応
				// Uncaught (in promise) DOMException: Error processing ICE candidate
				if (mReconnectTimer !== false) {
					clearTimeout(mReconnectTimer);
				}

				var run = function() {
					negotiationMainReconnect();
					console.log('ADD_ICE_CANDIDATE_ERRORによる再接続');
				}
				mReconnectTimer = setTimeout(run, 1000);
*/
			}

		},
		false
	);

	//////////////////////////////////
	// ボタン操作
	//////////////////////////////////

	// ユーザー一覧表示ボタンクリック
	$(document).on('click', '[id=header_status_users]', function() {
		// 画面共有中は表示しない
		if (NEGOTIATION.mIsScreenOn) {
			createModalOkDialog("お知らせ", "画面共有中は表示できません");
		} else {
			$("#room-userlist-dialog").dialog({
				modal: true,
				draggable: false,
				resizable: false,
				width: '460',
				closeOnEscape: true,
				position: { my: "left top", at: "center bottom", of: '#header_status_users' },
				show: false,
				hide: false,
				open: function(event, ui) {
					var video_list = $('li[id^=video_list]');
					var staff_type = $.cookie()['staff_type'];
					var staff_id = $.cookie()['staff_id'];
					var client_id = $.cookie()['client_id'];
					var room_locked = $('#room_locked').val();
					if(room_locked == 0) {
						$("#button_lock_key").text("このルームをロックする");
					} else {
						$("#button_lock_key").text("このルームのロックを解除する");
					}
					// ゲストにはロックボタンは非表示
					if(staff_type == null || staff_id == null || client_id == null) {
						$('#button_lock_key').css('display', 'none');
					}
					// ビデオ表示非表示項目の設定

					$.each(video_list, function() {
						user_id = $(this).data('id');
						if(true == NEGOTIATION.isShowVideoFrame(user_id)) {
							showUserlistCamBtn($(this), false);
						} else {
							showUserlistCamBtn($(this), true);
						}
					});
					// オーバーレイエリアクリックで閉じる
					$('.ui-widget-overlay').on('click', function() {
						$('#room-userlist-dialog').dialog('close');
					});
				},
				dialogClass: 'negotiation-dialog',
				buttons: [
	//			{
	//				text: '閉じる',
	//				click: function(event, ui) {
	//					$(this).dialog('close');
	//				},
	//			},
					{
						text: 'このルームをロックする',
						width: "240",
						"id": "button_lock_key",
						click: function(event, ui) {
							$(this).dialog('close');
						},
				}],
			});
			$('.ui-widget-overlay').addClass('negotiation-dialog-overlay');
	//		$('.ui-dialog-titlebar').removeClass('ui-widget-header');
			$('.ui-dialog-titlebar').hide();
		}
	});

	// ロックのON/OFF
	$(document).on('click', '[id=button_lock_key]', function(){
		var connectionInfoId = $("#connection_info_id").val();
		var mRoomLocked = $("#room_locked").val();

		if(mRoomLocked == "0"){
			// Roomロック
			$(".icon-login").css('color','#000');
			$(".icon-login").css('visibility','visible');
			$(".icon-login").css('display','');

			// ロックデータ登録(ロック)
			mRoomLocked = "1";
			$.ajax({
				url: "https://" + location.host + "/negotiation/set-negotiation-room-state",
				type: "POST",
				data: {
					connection_info_id : connectionInfoId,
					room_state : mRoomLocked
				}
			}).done(function(res) {
				// 正常
				Result = JSON.parse(res);

				$("#room_locked").val(mRoomLocked);
				sendLock( mRoomLocked );
			}).fail(function(res) {
			});

		}else{
			// Roomアンロック
			$(".icon-login").css('color','');
			$(".icon-login").css('visibility','hidden');
			$(".icon-login").css('display','none');

			// ロックデータ登録(アンロック)
			mRoomLocked = "0";
			$.ajax({
				url: "https://" + location.host + "/negotiation/set-negotiation-room-state",
				type: "POST",
				data: {
					"connection_info_id": $("#connection_info_id").val(),
					"room_state" : mRoomLocked
				}
			}).done(function(res) {
				// 正常
				Result = JSON.parse(res);

				$("#room_locked").val(mRoomLocked);
				sendLock( mRoomLocked );
			}).fail(function(res) {
			});
		}
	});

	// カメラのON/OFF
	$('#button_camera').click(function(){
		// カメラが使用可能ならば、動作させる
		if (NEGOTIATION.isMyCameraCanUse) {

			NEGOTIATION.buttonCamera();

		}
		// NEGOTIATION.buttonCamera();
	});

	// マイクのON/OFF
	$('#button_mic').click(function(){
		// マイクが使用可能ならば、動作させる
		if (NEGOTIATION.isMyMicCanUse) {

			NEGOTIATION.buttonMic();

		}
		// NEGOTIATION.buttonMic();
	});

	// 録画
	$('#button_record').click(function(){
		NEGOTIATION.buttonRecord();
	});

	// シークレットメモ
	$('#button_secret_memo').click(function(){
		NEGOTIATION.buttonSecretMemo();
		// 資料が表示されている場合位置が変わるので資料を再描画する
		documentResizeEvent();
	});

	// 再接続
	$('#button_reconnect').click(function(){
		NEGOTIATION.buttonReconnect();
	});

	// 画面共有
	$('#button_share_screen').click(function(){
		NEGOTIATION.buttonShareScreen();
	});

	// 画面共有終了
	$(document).on('click','.close_share_screen_btn',function(){
		NEGOTIATION.buttonShareScreen();
	});

	// 共有メモ
	$('#button_share_memo').click(function(){
		NEGOTIATION.buttonShareMemo();
	});

	// ホワイトボード
	$('#change_paint').click(function(){
		NEGOTIATION.buttonWhiteBoard();
	});

	// チャットボード
	$('#button_chat_board').click(function(){
		NEGOTIATION.chatBoard();
	});

	//　挙手
	$('#button_raise_your_hand').click(function () {
		NEGOTIATION.buttonRaiseHands();
		// メニューを閉じるために疑似クリックを発生させる
		$("div#meeting__menuBtn").trigger('click');
	});
	// いいねリアクションをする
	$('#button_good_reaction').click(function() {
		NEGOTIATION.buttonReaction();
		// メニューを閉じるために疑似クリックを発生させる
		$("div#meeting__menuBtn").trigger('click');
	});

	// 相手のビデオを表示
	$('#button_target_video_on').click(function(){
		NEGOTIATION.buttonTargetVideoOn();
	});
	// 相手のビデオを非表示
	$('#button_target_video_off').click(function(){
		NEGOTIATION.buttonTargetVideoOff();
	});
	// 相手のビデオを表示・非表示
	$('#button_target_video_on_off').click(function(){
		NEGOTIATION.buttonTargetVideoOnOff();
	});

	// 右メニュー
	$('#negotiation_right_menu_button').click(function(){
		NEGOTIATION.negotiationRightMenuButton();
	});

	// 名刺表示
	$('.video_card_icon').click(function(){

		// 選択された情報
		var video_id = $(this).data("id");
		var staff_type = $("#target_video_staff_type_" + video_id).val();
		var staff_id = $("#target_video_staff_id_" + video_id).val();
		var client_id = $("#target_video_client_id_" + video_id).val();
//console.log(document.cookie);
//console.log('video_id=('+video_id+') staff_type=('+staff_type+') staff_id=('+staff_id+') client_id=('+client_id+')');

		//######################
		// 接続者全員に名刺を表示
		// ログイン時のユーザ情報(staff_type/staff_id)をチェックし、異なっていれば
		// 名刺表示コマンドは送信しない。
		//######################

		// ログイン時の情報取得
		var cookie_staff_type = $.cookie()["staff_type"];
		var cookie_staff_id = $.cookie()["staff_id"];
		var cookie_client_id = $.cookie()["client_id"];

//console.log('名刺表示(Video) staff_type=('+staff_type+') staff_id=('+staff_id+') client_id=('+client_id+')');
		// ログイン時の情報と名刺選択(video)時の情報と比較し一致なら、全ユーザへ名刺表示コマンドを発行！！
		if( cookie_staff_type == staff_type && cookie_staff_id == staff_id && cookie_client_id == client_id) {
			NEGOTIATION.buttonShowNameCard(staff_type, staff_id, client_id);
		}

		// 名刺表示
		showNameCard(staff_type, staff_id, client_id);
	});

	// 名刺の非表示(名刺の外側)
	$('.mi_namecard_modal_shadow').click(function(){
		var staff_type = $("#staff_type").val();
		var staff_id = $("#staff_id").val();
//		var client_id = $("#client_id").val();

		// ログイン時の情報取得
		var cookie_staff_type = $.cookie()["staff_type"];
		var cookie_staff_id = $.cookie()["staff_id"];
		var cookie_client_id = $.cookie()["client_id"];

		// ログイン時の情報と名刺選択(video)時の情報と比較し一致なら、全ユーザへ名刺コマンドを発行！！
//console.log('名刺非表示(Video) staff_type=('+staff_type+') staff_id=('+staff_id+') client_id=('+client_id+')');
		if( cookie_staff_type == staff_type && cookie_staff_id == staff_id ) {
			// 現在表示している名刺が自分の名刺の場合は、全ユーザへ名刺コマンドを発行
			if( cookie_staff_type == $("#ShowNameCard_staff_type").val()
			 && cookie_staff_id == $("#ShowNameCard_staff_id").val()
			 && cookie_client_id == $("#ShowNameCard_client_id").val() ) {
				// 非教示
				NEGOTIATION.buttonHideNameCard();
			 }
		}
		hideNameCard();
	});

	// 全員の名刺を非表示にするボタンを押下する
	$(document).on('click', '.modal-close',function(){

		var staff_type = $("#staff_type").val();
		var staff_id = $("#staff_id").val();
//		var client_id = $("#client_id").val();
		// ログイン時の情報取得
		var cookie_staff_type = $.cookie()["staff_type"];
		var cookie_staff_id = $.cookie()["staff_id"];
		var cookie_client_id = $.cookie()["client_id"];

		// ログイン時の情報と名刺選択(video)時の情報と比較し一致なら、全ユーザへ名刺コマンドを発行！！
//console.log('名刺非表示(Video) staff_type=('+staff_type+') staff_id=('+staff_id+') client_id=('+client_id+')');
		if( cookie_staff_type == staff_type && cookie_staff_id == staff_id) {
			// 現在表示している名刺が自分の名刺の場合は、全ユーザへ名刺コマンドを発行
			if( cookie_staff_type == $("#ShowNameCard_staff_type").val()
			 && cookie_staff_id == $("#ShowNameCard_staff_id").val()
			 && cookie_client_id == $("#ShowNameCard_client_id").val() ) {
				// 非教示
				NEGOTIATION.buttonHideNameCard();
			 }
		}
		hideNameCard();
	});

	// シークレットメモを閉じる
	$('.secret_memo_close').click(function(){
		NEGOTIATION.buttonSecretMemo();
		// 資料が表示されている場合位置が変わるので資料を再描画する
		//documentResizeEvent();
	});

	// ビデオフレームの更新
	$('.stream_reconnect_icon').click(function(){
		var userId = $('#user_id').val();
		var target_user_id = $(this).data("id");
		if (userId != target_user_id) {
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
				meetinFlashTargetVideo_endSession(target_user_id);
				meetinFlashTargetVideo_reRegister(target_user_id);
				sendRequestFlashReEnterRoomByUserId(target_user_id);
			} else {
	//			var videoStreamId = $('#video_target_video_stream_id_' + target_user_id).val();
				var videoConnectionId = $('#video_target_video_connection_id_' + target_user_id).val();
	//			var audioStreamId = $('#video_target_audio_stream_id_' + target_user_id).val();
				var audioConnectionId = $('#video_target_audio_connection_id_' + target_user_id).val();

				/**
				 * 映像の再接続
				 */
				mNegotiationMain.sendRequestVideoStreamByUserId(
					target_user_id,
					null
				);

				if (videoConnectionId && videoConnectionId.length > 0) {
					mNegotiationMain.closeConnectionByConnectionId(videoConnectionId);
				}

				/**
				 * 音 の再接続
				 */
				mNegotiationMain.sendRequestAudioStreamByUserId(
					target_user_id,
					null
				);

				if (audioConnectionId && audioConnectionId.length > 0) {
					mNegotiationMain.closeConnectionByConnectionId(audioConnectionId);
				}

				$('#video_target_video_' + target_user_id).hide();
				$('#video_target_connecting_' + target_user_id).show();
			}
		}
	});

	// ビデオフレームの更新
	$('.screen_stream_reconnect_icon').click(function(){
		var userId = $('#user_id').val();
		if (userId != 0) {
//			var screenStreamId = $('#video_share_screen_stream_id').val();
			var screenConnectionId = $('#video_share_screen_connection_id').val();

			// 共有画面の再接続
			mNegotiationMain.sendRequestScreenStreamByUserId(
				0,
				null
			);
		}
	});

	// ビデオ表示・非表示
	$('.user_name').click(function() {
		var user_id = $('#user_id').val();
		var target_user_id = $(this).parent().data('id');
		toggleVideoFrame(user_id, target_user_id);
	});
	// ビデオ表示・非表示
	$('.video_list_sel').click(function() {
		var user_id = $('#user_id').val();
		var target_user_id = $(this).parents().data('id');
		toggleVideoFrame(user_id, target_user_id);
	});
	// ビデオフレーム内非表示押下
	$('.video_remove_icon').click(function(){
		var userId = $('#user_id').val();
		var target_user_id = $(this).data("id");
		toggleVideoFrame(user_id, target_user_id);
	});

// ヘッダー領域ビデオアイコンが無くなった為処理不要
// 2018/04/20 太田
//	// ヘッダー領域ビデオアイコン押下
//	$('.video_list').click(function(){
//		var userId = $('#user_id').val();
//		var target_user_id = $(this).data("id");
//
//		if (NEGOTIATION.mIsScreenOn) {
//			createModalOkDialog("お知らせ", "画面共有中は表示できません");
//		}
//		else {
//			from_dom = $('.video_wrap[data-id="'+ target_user_id +'"]');
//			LayoutCtrl.moveVideoArray(NEGOTIATION.videoArray,from_dom,false);
//			// 終わったら再描画
//			LayoutCtrl.apiSetVideo(NEGOTIATION.showVideoMode,NEGOTIATION.videoArray.show,NEGOTIATION.videoArray.hide);
//
//			resetLayout();
//		}
//	});

	// Videoフレーム内(右)、拡大ボタン押下
	$('.video_big_icon').click(function(){
		// レイアウトをリセットする
		resetLayout();

		var from_dom =	$('.video_wrap[data-id="'+ $(this).data("id") +'"]');
		var to_dom =	$('.video_wrap.big');
		var firstShowVideo = [];
		var tmpShowVideoArray = [];

		if(to_dom.length == 0){// 存在しないなら順番を入れ替えて,モードを変更し、再描画
			$.each(NEGOTIATION.videoArray.show,function(){
				if(from_dom.get(0) === this.get(0)){
					firstShowVideo.push(this);
				}else{
					tmpShowVideoArray.push(this);
				}
			});
			NEGOTIATION.videoArray.show = firstShowVideo.concat(tmpShowVideoArray);
			NEGOTIATION.showVideoMode = MODE_ONE_BIG;
			LayoutCtrl.apiSetVideo(NEGOTIATION.showVideoMode,NEGOTIATION.videoArray.show,NEGOTIATION.videoArray.hide);
		}else{
			// 最大が存在するなら入れ替えるだけ
			LayoutCtrl.cssSwap(from_dom, to_dom);
		}
	});

	// Videoフレーム内(右)、標準(縮小)ボタン押下
	$('.video_small_icon').click(function(){
		// レイアウトをリセットする
		resetLayout();

		saveDocument();
		// モードチェンジ、再描画// 資料を閉じる
		hideDocument();
		NEGOTIATION.showVideoMode = MODE_ALL_MINIMUM;
		LayoutCtrl.apiSetVideo(NEGOTIATION.showVideoMode,NEGOTIATION.videoArray.show,NEGOTIATION.videoArray.hide);
	});

	var meetinExitFullscreen = function() {
		var video_id = $(this).data("id");
		var target = (video_id) ? $('#video_target_video_area_'+video_id).get(0) : undefined;

		// 取得エラーの場合は画面共有から
		if(!target) {
			target = $('#video_share_screen').get(0);
		}

	}
	$(document).on('webkitfullscreenchange mozfullscreenchange MSFullscreenChange fullscreenchange', function(e) {
		if (!window.screenTop && !window.screenY) {
			console.log('not fullscreen');
		} else {
			console.log('fullscreen');
		}
	});

	var onErrorFullscreen = function(e) {
//		console.log(e);
	}
	/**
	 * フルスクリーンイベント変更イベント関数
	 * ※フルスクリン画面表示が完了したら呼び出される
	 * @param {} video_id
	 */
	var onChangeFullscreen = function(e) {
		var video_id = $(this).data("id");
		var target = (video_id) ? $('#video_target_video_area_'+video_id).get(0) : undefined;

		// 取得エラーの場合は画面共有から
		if(!target) {
			target = $('#video_share_screen').get(0);
		}

		// イベント削除(フルスクリーン表示時にのみ本関数を実行させるため、ここでイベント削除)
		target.requestFullscreen = target.requestFullscreen || target.mozRequestFullScreen || target.webkitRequestFullscreen || target.msRequestFullscreen
		if (target.requestFullscreen) {
			target.removeEventListener("fullscreenchange",onChangeFullscreen);
			target.removeEventListener("fullscreenerror",onErrorFullscreen);
		}

		// Flashの判定
		var flash = null;
		if (navigator.appName.indexOf("Microsoft") != -1) {
			// IE
			flash = window['negotiation_target_flash_' + video_id];
		} else {
			// その他
			flash = document['negotiation_target_flash_' + video_id];
		}

		if (flash) {
			// Flash オブジェクトをFull画面にする必要がある
			// 尚、widthとheightをパラメータして渡しているが、フルスクリーン時のサイズは
			// meetinFlashTargetVideo_changeSize()関数内で判定し設定しているので、
			// ここで渡している値は意味はないです。
			meetinFlashTargetVideo_changeSize(video_id, target.clientWidth, target.clientHeight);
		}
	}

	// Videoフレーム内(左)、ビデオ全画面(フルスクリーン)表示押下
	$('.video_full-screen_icon').click(function(){
		var video_id = $(this).data("id");
		var target = (video_id) ? $('#video_target_video_area_'+video_id).get(0) : undefined;

		if(!target) {
			target = $('#video_share_screen').get(0);
		}

		target.requestFullscreen = target.requestFullscreen || target.mozRequestFullScreen || target.webkitRequestFullscreen || target.msRequestFullscreen
		if(!target.requestFullscreen) {
			alert('ご利用のブラウザはフルスクリーン操作に対応していません');
			return;
		}

		target.requestFullscreen();
		target.addEventListener("fullscreenchange", onChangeFullscreen, false);
		target.addEventListener("fullscreenerror", onErrorFullscreen, false);
		return;
	});

	$('.video_mic_icon').click(function(){
		var video_id = $(this).data("id");
		var flash = null;
		if (navigator.appName.indexOf("Microsoft") != -1) {
			// IE
			flash = window['negotiation_target_flash_' + video_id];
		} else {
			flash = document['negotiation_target_flash_' + video_id];
		}
		if(flash) {
			flash.muteAudio();
//			meetinFlashTargetVideo_stopMic(video_id);
		} else {
			mNegotiationMain.toggleTargetMic(video_id, false);
		}
	});

	// 商談終了
	$('#button_negotiation_finish').click(function(){
		if ("recording" === NEGOTIATION.mRecordState || "pause" === NEGOTIATION.mRecordState) {
			// 録画中、中断中だったらビデオを保存する
			stopAndSaveCaptureTabCapture();
		}

		var uuid = localStorage.UUID;
		// 資料を表示したユーザが自分の場合は、資料を閉じる(ゲストの場合はUUIDを使用)
		if ( uuid == $("#document_uuid").val() ) {
			hideDocument();	// 資料を閉じる
		}
		// 資料情報削除
		deleteDocument(uuid);

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
	 * 資料情報削除
	 * セッションストレージ削除(自分の資料)
	 * サムネイル削除をゲストへ通知する（メモリー上の資料を削除する）
	 */
	function deleteDocument(uuid) {
		if( sessionStorageKeys.length > 0 ) {
			var thumbnailviewCount = 0;
			var del_keyName = [];
			for ( var i = 0; i < sessionStorageKeys.length; i++) {
				var keyName = sessionStorageKeys[i];
				// セッションストレージから資料データを取得する
				var mtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));
				if( mtSessionStorage ) {
					if( uuid == mtSessionStorage[keyName]["UUID"] ) {
						var material_id = mtSessionStorage[keyName]["material_basic"]["material_id"];
//console.log("DELETE keyName=["+keyName+"] material_id=("+material_id+")");
						// サムネイル削除をゲストへ通知する（メモリー上の資料を削除する）
						var data = {
							command : "DOCUMENT",
							type : "DELETE_DOCUMENT",
							keyName : keyName,
							localMaterialId : material_id
						};
						sendCommand(SEND_TARGET_ALL, data);
						del_keyName.push(material_id);
					}
				}
			}
			// ストレージのキャンバス削除実行
			var connectionInfoId = $("#connection_info_id").val();
//console.log("delete-canvas-material=["+del_keyName+"]");
			$.ajax({
					url: "https://" + location.host + "/negotiation/delete-canvas-material",
					type: "POST",
					dataType: "json",
					data: {connectionInfoId: connectionInfoId, materialIds : del_keyName},
				}).done(function(res) {
			});

		}
	}

	// ビデオ表示リセットボタン押下
	$('#header_video_reset').click(function(){
		// 表示
		if (!NEGOTIATION.mIsScreenOn) {
			// レイアウトをリセットする
			LayoutCtrl.apiMoveAllVideoFrameToShow();
			resetLayout();
		}
	});

	/**
	 * レイアウトをリセットする処理の実体
	 */
	function resetLayout(){
		// ビデオレイアウトのリセット
		$.each(NEGOTIATION.videoArray.show,function(){
			// ビデオタグのstyleを削除する（移動やリサイズすると付与される）
			this.removeAttr('style');
			// ビデオタグを表示するためにstyleを付与する
			this.css("display", "block");
		});
		// 資料のリセット
		if($("div#mi_docment_area").is(':visible') && currentDocumentId != 0){
			// 資料タグのstyleを削除する（移動やリサイズすると付与される）
			$("div#mi_docment_area").removeAttr('style');
			// 資料タグを表示するためにstyleを付与する
			$("div#mi_docment_area").css("display", "block");
			// アイコンなどの表示位置をリセットする
			documentResizeEvent();
		}
		// Flashの描画領域を変更する
		for (var i = 0; i < MEETIN_MAIN_MAX_PEOPLE; ++i) {
			meetinFlashTargetVideo_changeSize(i, $("#negotiation_target_video_" + i).width(), $("#negotiation_target_video_" + i).height());
		}
	}

	// ウィンドウリサイズ時
	var resizeTimer = false;
	var FSelment = null;
	$(window).resize(function(e) {
		if (e.target == window) {// draggableの処理と競合しないように

			// フルスクリーン時はVidoeレイアウトの変更は行わない
			var full = getFSelment();
			if( full != null ) {
				FSelment = full;
				return;
			}
			else {
				// フルスクリーンから抜けた直後もVidoeレイアウトの変更は行わない
				if( FSelment != null ) {
					FSelment = null;	// OFF
					return;
				}
			}

			// リサイズが止まるまでタイマーをつけては消してを繰り返す
			if (resizeTimer !== false) {
				clearTimeout(resizeTimer);
			}
			resizeTimer = setTimeout(function () {
				LayoutCtrl.apiSetVideo(NEGOTIATION.showVideoMode, NEGOTIATION.videoArray.show, NEGOTIATION.videoArray.hide);
				resetLayout();
				documentResizeEvent();

				// セキュリティパネルが表示されているビデオフレームがあれば、そのビデオフレームを最大化する
				for (var key in mMeetinFlashSecurityPanelUserIdTable) {
					$('#negotiation_target_video_' + key).find('.video_big_icon').trigger("click");
					break;
				}
				resizeTimer = false;
			}, 200);
		}
	});

	// ドラッグイベント設定
	var video_list = $('li[id^=video_list]');
	var $video_wrap = $(".video_wrap");
	video_list.draggable({
		revert: 'invalid',
		snap: true,
		scroll: false,
		snapMode: "inner",
		helper: "clone",
		opacity: 0.3
	});
	// 各ビデオのドラッグ時
	$video_wrap.draggable( {
		containment: "div#mi_video_area",
		scroll: false,
		snapMode: "inner"
	} );
	// 各ビデオのドロップ時
	$video_wrap.droppable( {
		drop: function(ev, ui) {// css情報を入れ替える
			//LayoutCtrl.cssSwap(ui.draggable, $(this));
		}
	} );
	// 各ビデオのリサイズ時
	var videoLeft = 0;
	$video_wrap.resizable({
		minHeight: 260,
		minWidth: 260,
		containment : "div#mi_video_area",
		handles: "ne, se, sw, nw",
		start: function() {
			// left座標がマイナスの場合のみ現在のleft設定する
			if($(this).position().left < 0){
				videoLeft = $(this).position().left;
			}
		},
		resize: function() {
			// なぜかleft値がマイナスの場合は0にされるので、設定しなおす
			if(videoLeft < 0){
				videoLeft = $(this).position().left + videoLeft;
				$(this).css("left", videoLeft);
				// 一度設定すればよいので初期値に戻す
				videoLeft = 0;
			}

			if($(this).find("object").length){
				var objTagIds = $(this).find("object").attr("id").split("_");
				var userId = objTagIds[objTagIds.length - 1];
				var width = $(this).width();
				var height = $(this).height();
				// IEの場合はDIVの大きさを取得し、ビデオサイズを変更する
				meetinFlashTargetVideo_changeSize(userId, width, height);
			}
		}
	});
	// ビデオ移動アイコンを押下した際の処理
	$(document).on('click', '.mi_video_move_icon', function(){
		// ビデオ領域を移動できるようにする
		$(this).closest(".video_wrap").draggable("enable");
	});
	$(document).on('mouseup', '.mi_video_move_icon', function(){
		// ビデオ領域を移動できるようにする
		$(this).closest(".video_wrap").draggable("disable");
	});


	$("#mi_video_area").droppable({
		accept: ".video_list",
		tolerance: "pointer",
		drop: function(ev, ui) {// ヘッダーからビデオを取り出す　evはビデオ領域なのでどうでもいい
			// （2）ヘッダーからビデオを出そうとすると、「画面共有中は表示できません」と出てくる。戻せないようにする。
			if (NEGOTIATION.mIsScreenOn) {
				createModalOkDialog("お知らせ", "画面共有中は表示できません");
			} else {
				LayoutCtrl.moveVideoArray(NEGOTIATION.videoArray,$('.video_wrap[data-id="'+ui.draggable.data("id")+'"]'),false);
				//終わったら再描画
				LayoutCtrl.apiSetVideo(NEGOTIATION.showVideoMode,NEGOTIATION.videoArray.show,NEGOTIATION.videoArray.hide);

				// 表示の場合はヘッダーユーザーアイコンに線を付ける
				$("li#video_list_"+ui.draggable.data("id")).addClass("video_list_border");
			}
		}
	});
	$('header').droppable( {
		accept: ".video_wrap",
		tolerance: "pointer",
		hoverClass: "drag-hover",
		over: function(ev, ui) {
			// 要素が上に乗った時の処理
			var userId = ui.draggable.data("id");
			// サイドメニューの表示位置を変更し、サイズを変更する
			$("div.mi_left_sidebar").addClass("mi_left_sidebar_hover");
			// 自分のヘッダーアイコンを拡大し、点線枠を付与する
			$("li#video_list_"+userId).addClass("video_list_hover");
			// ヘッダーアイコンを縦中央に寄せる
			$("#mi_header_title").addClass("margin_top_10");
			$("div.mi_flt-r").addClass("margin_top_10");
		},
		out: function(ev, ui) {
			// 要素が外れた時の処理
			var userId = ui.draggable.data("id");
			// サイドメニューの表示位置を変更し、サイズを変更する
			$("div.mi_left_sidebar").removeClass("mi_left_sidebar_hover");
			// 自分のヘッダーアイコンを拡大し、点線枠を付与する
			$("li#video_list_"+userId).removeClass("video_list_hover");
			// ヘッダーアイコンを縦中央から元の位置に戻す
			$("#mi_header_title").removeClass("margin_top_10");
			$("div.mi_flt-r").removeClass("margin_top_10");
		},
		drop: function(ev, ui) {// ヘッダーにビデオを格納する　evはヘッダーなのでどうでもいい
			LayoutCtrl.moveVideoArray(NEGOTIATION.videoArray,ui.draggable,true);
			// 終わったら再描画
			LayoutCtrl.apiSetVideo(NEGOTIATION.showVideoMode,NEGOTIATION.videoArray.show,NEGOTIATION.videoArray.hide);

			// 要素をドロップした時の処理
			var userId = ui.draggable.data("id");
			// サイドメニューの表示位置を変更し、サイズを変更する
			$("div.mi_left_sidebar").removeClass("mi_left_sidebar_hover");
			// 自分のヘッダーアイコンを拡大し、点線枠を付与する
			$("li#video_list_"+userId).removeClass("video_list_hover");
			// ビデオ表示の場合はヘッダーアイコンの点線を削除
			$("li#video_list_"+userId).removeClass("video_list_border");
			// ヘッダーアイコンを縦中央から元の位置に戻す
			$("#mi_header_title").removeClass("margin_top_10");
			$("div.mi_flt-r").removeClass("margin_top_10");
		}
	} );

	// 表示されている資料に重なったとき
	$('#mi_docment_area').droppable( {
		accept: ".video_wrap",
		tolerance: "pointer",
		hoverClass: "drag-hover-document",
		drop: function(ev, ui) {
			var firstShowVideo = [];
			var tmpShowVideoArray = [];
			// 資料を閉じる
			saveDocument();
			hideDocument();

			//ui.draggable を先頭にする
			$.each(NEGOTIATION.videoArray.show,function(){
				if(ui.draggable.get(0) === this.get(0)){
					firstShowVideo.push(this);
				}else{
					tmpShowVideoArray.push(this);
				}
			});

			NEGOTIATION.videoArray.show = firstShowVideo.concat(tmpShowVideoArray);
			LayoutCtrl.videoShow2(NEGOTIATION.showVideoMode,NEGOTIATION.videoArray.show);
//			NEGOTIATION.showVideoMode = MODE_ONE_BIG;
//
//			// 終わったら再描画
//			LayoutCtrl.apiSetVideo(NEGOTIATION.showVideoMode,NEGOTIATION.videoArray.show,NEGOTIATION.videoArray.hide);
		}
	} );

	// 画面共有で使用するグローバル変数
	var orgScreenWidth = MATERIAL_WIDTH;		// キャンバスのデフォルトサイズ幅
	var orgScreenHeight = MATERIAL_HEIGHT;		// キャンバスのデフォルトサイズ丈
	var shareScreenWidth = MATERIAL_WIDTH;			// キャンバスの実サイズ幅
	var shareScreenHeight =  MATERIAL_HEIGHT;		// キャンバスの実サイズ丈
	/**
	 * 画面共有のリサイズイベント
	 */
	/*
	$("div#negotiation_share_screen").resizable({
		minHeight: 260,
		minWidth: 260,
		containment : "#mi_video_area",
		handles: "ne, se, sw, nw",
		stop: function() {
			// 現在の画面共有の表示領域のサイズを取得
			orgScreenWidth = $("div#negotiation_share_screen").width();
			orgScreenHeight = $("div#negotiation_share_screen").height();
			if(!$(this).find("img#video_share_screen_image").is(':visible')){
				// ビデオタグで表示している場合
				var shareScreen = document.getElementById('video_share_screen');
				// ビデオ表示領域に表示できる最大のサイズを計算
				getShareScreenSize({"height" : shareScreen.videoHeight, "width": shareScreen.videoWidth},  orgScreenHeight, orgScreenWidth, orgScreenHeight, orgScreenWidth);
			}else{
				// 画像で表示している場合
				var shareScreen = document.getElementById("video_share_screen_image");
				// ビデオ表示領域に表示できる最大のサイズを計算
				getShareScreenSize({"height" : shareScreen.naturalHeight, "width": shareScreen.naturalWidth},  orgScreenHeight, orgScreenWidth, orgScreenHeight, orgScreenWidth);
			}
//			console.log("shareScreenWidth:"+shareScreenWidth+" | shareScreenHeight:"+shareScreenHeight);
			// 計算結果を元に画面共有のフレームサイズを再設定する
			$("div#negotiation_share_screen").width(shareScreenWidth).height(shareScreenHeight);
		}
	});
	*/

	/**
	 * 画面共有のフレームサイズをフィットさせるための計算を行う関数
	 */
	function getShareScreenSize(shareScreen, localShareScreenHeight, localShareScreenWidth, viewShareScreenHeight, viewShareScreenWidth){
		if(shareScreen["height"] > shareScreen["width"]){
			// 縦長画像の場合
			localShareScreenWidth = shareScreen["width"] * localShareScreenHeight / shareScreen["height"];
			if(localShareScreenWidth > viewShareScreenWidth){
				// 縦に合わせ横を計算した結果、横が枠より大きい場合は縦サイズを縮めて再計算する
				localShareScreenHeight = localShareScreenHeight - 1;
				getShareScreenSize(shareScreen, localShareScreenHeight, localShareScreenWidth, viewShareScreenHeight, viewShareScreenWidth);
			}else{
				// グローバル変数に値を設定する
				shareScreenHeight = localShareScreenHeight;
				shareScreenWidth = localShareScreenWidth;
			}
		}else{
			// 横長画像の場合
			localShareScreenHeight = shareScreen["height"] * localShareScreenWidth / shareScreen["width"];
			if(localShareScreenHeight > viewShareScreenHeight){
				// 横に合わせ縦を計算した結果、縦が枠より大きい場合は横サイズを縮めて再計算する
				localShareScreenWidth = localShareScreenWidth - 1;
				// 自身の関数で再帰する
				getShareScreenSize(shareScreen, localShareScreenHeight, localShareScreenWidth, viewShareScreenHeight, viewShareScreenWidth);
			}else{
				// グローバル変数に値を設定する
				shareScreenHeight = localShareScreenHeight;
				shareScreenWidth = localShareScreenWidth;
			}
		}
	}

	/**
	 * 画面共有の移動イベント
	 */
	/*
	$("div#negotiation_share_screen").draggable({
		containment: "#mi_video_area",
		scroll: false,
		snapMode: "inner"
	});
	*/
	/**
	 * ライブラリーのバインド
	 */
	video_list.tooltipster({
		contentAsHTML: true,
		interactive: true,
		animation: 'fade',
		trigger: 'hover',
		theme: 'Default',
		position: ['right', 'bottom'],
		content: null,
		zIndex: 200000002,
	});
	//$video_list.find('img').tooltipster({
	//	contentAsHTML: true,
	//	interactive: true,
	//	animation: 'fade',
	//	timer: 500,
	//	trigger: 'none',
	//	theme: 'tooltipster-light',
	//	content: 'ほかのページを見ています'
	//});
	$('#video_list_' + $('#user_id').val()).tooltipster('content', null);// 自分のものはいらないから撤去
	// video_listをツールチップの一覧に格納
	$('#header_status_users').tooltipster({
		functionInit: function(instance, helper) {
		},
		// チップが表示される前に実行される
		functionBefore: function(instance, helper) {
			instance.content('<span class="tooltip_header_status_users">現在<span class="room_members_count">'+ $('#room_members').text() +'</span>人が接続中</span>');
		},
		functionPosition: function(instance, helper, position) {
			position.coord.left += 45;
			position.coord.top += 10;
			return position;
		},
		contentAsHTML: true,
		interactive: true,
		theme: 'Default',
		animation: 'fade',
		trigger: 'hover',
		zIndex: 200000001,
		content: $('.tooltip_header_status_users'),
		contentCloning: false,
	});

	$('.record_button_tooltip').tooltipster({
		contentAsHTML: true,
		interactive: true,
		animation: 'fade',
		trigger: 'custom',
		triggerClose: {
			click: true,
			originClick: true,
		},
		theme: 'tooltipster-light',
		content: __CHROME_EXT_SCREENRECORDER__.name + 'をインストールしてください。<br>インストールは<a href="' + __CHROME_EXT_SCREENRECORDER__.url + '" target="_blank">こちら</a>'
	});
	$('.screenshare_button_tooltip').tooltipster({
		contentAsHTML: true,
		interactive: true,
		animation: 'fade',
		trigger: 'custom',
		triggerClose: {
			click: true,
			originClick: true,
		},
		theme: 'tooltipster-light',
		contentCloning: true,
		content: __CHROME_EXT_SCREENSHARE__.name + 'をインストールしてください。<br>インストールは<a href="' + __CHROME_EXT_SCREENSHARE__.url + '" target="_blank">こちら</a>'
	});
	$('.copy_room_url_tooltip').tooltipster({
		contentAsHTML: true,
		interactive: true,
		animation: 'fade',
		trigger: 'custom',
		triggerClose: {
			click: true,
			originClick: true,
		},
		theme: 'tooltipster-light',
		contentCloning: true,
		content: '商談ルームのURLをコピーしました。'
	});
	$('.screencapture_button_tooltip').tooltipster({
		contentAsHTML: true,
		interactive: true,
		animation: 'fade',
		trigger: 'custom',
		triggerClose: {
			click: true,
			originClick: true,
		},
		theme: 'tooltipster-light',
		contentCloning: true,
		content: __CHROME_EXT_SCREENCAPTURE__.name + 'をインストールしてください。<br>インストールは<a href="' + __CHROME_EXT_SCREENCAPTURE__.url + '" target="_blank">こちら</a>'
	});

	// スライダーのバインド
	// 全部のinput要素の変化を監視
	$( 'input[type=range]' ).on( 'input', function () {
		$(this).next("output").text($(this).val());
	}).change(function() {
		$(this).next("output").text($(this).val());
	});

	// 商談終了
	$(document).on('click', '[name=btn_guest_end]', function(){
		// オペレータとゲストで遷移先を分ける
		if (NEGOTIATION.isOperator) {
			// ルーム作成ページへ戻る
			window.location.href =  "https://" + location.host + "/index/room";
		}else{
			/**
			 * ログアウト(ゲスト用)
		 	 * (クッキーとセッションを削除する)
		 	 */
			 $.ajax({
				type: "POST",
				url: "https://" + location.host + "/index/new-logout",
				dataType: "json",
				data: {
					user_id:  $('#user_id').val(),
					connection_info_id: $('#connection_info_id').val()
				}
			})
			.done(function(res) {
				// TOPページへ戻る
				window.location.href =  "https://" + location.host + "/";
			})
			.fail(function(res) {
				// TOPページへ戻る
				window.location.href =  "https://" + location.host + "/";
			})
			// .always(() => {
			// 	// TOPページへ戻る
			// 	window.location.href =  "https://" + location.host + "/";
			// })
//			window.location.href =  "https://" + location.host + "/";
//			window.location.href =  "https://" + "meet-in.jp" + "/";
		}
	});

	// ロック状態
	if($("#room_locked").val() == "0"){
		$(".icon-login").css('visibility','hidden');
		$(".icon-login").css('display','none');

	} else {
		$(".icon-login").css('visibility','visible');
		$(".icon-login").css('display','');

		setRequestEnterLockedRoomInterval(); // ルームをロックしている場合の処理.
	}
};

function showUserlistCamBtn(video_list, enabler) {
	if(enabler) {
		video_list.find('.video_list_cam_btn').html('<span class="icon-video-off video_list_cam_icon"></span>表示する');
	} else {
		video_list.find('.video_list_cam_btn').html('<span class="icon-video video_list_cam_icon"></span>隠す');
	}
}


// ビデオフレームの表示非表示制御
// function toggleVideoFrame(user_id, target_user_id) {
// 	var enabler = NEGOTIATION.isShowVideoFrame(target_user_id);
//
// 	if(enabler == false) {
// 		// 表示
// 		if (NEGOTIATION.mIsScreenOn) {
// 			createModalOkDialog("お知らせ", "画面共有中は表示できません");
// 		}
// 		else {
// 			from_dom = $('.video_wrap[data-id="'+ target_user_id +'"]');
// 			LayoutCtrl.videoHide()
// 			LayoutCtrl.moveVideoArray(NEGOTIATION.videoArray,from_dom,false);
// 			// 終わったら再描画
// 			LayoutCtrl.apiSetVideo(NEGOTIATION.showVideoMode,NEGOTIATION.videoArray.show,NEGOTIATION.videoArray.hide);
//
// 			resetLayout();
// 			var video_list = $('#video_list_' + target_user_id);
// 			showUserlistCamBtn(video_list, enabler);
// 		}
// 	} else {
// 		// 隠す
// 		from_dom = $('.video_wrap[data-id="'+ target_user_id +'"]');
// 		LayoutCtrl.moveVideoArray(NEGOTIATION.videoArray,from_dom,true);
// 		// 終わったら再描画
// 		LayoutCtrl.apiSetVideo(NEGOTIATION.showVideoMode,NEGOTIATION.videoArray.show,NEGOTIATION.videoArray.hide);
//
// 		// 表示するアイコンを変更
// 		var video_list = $('#video_list_' + target_user_id);
// 		showUserlistCamBtn(video_list, enabler);
// 	}
// }

// ビデオフレームの表示非表示制御
function toggleVideoFrame(user_id, target_user_id) {
	var enabler = NEGOTIATION.isShowVideoFrame(target_user_id);

	if(enabler == false) {
		// 表示
		if (NEGOTIATION.mIsScreenOn) {
			createModalOkDialog("お知らせ", "画面共有中は表示できません");
		}
		else {
			from_dom = $('.video_wrap[data-id="'+ target_user_id +'"]');
			LayoutCtrl.moveVideoArray(NEGOTIATION.videoArray,from_dom,false);

			LayoutCtrl.videoShow2(NEGOTIATION.showVideoMode,NEGOTIATION.videoArray.show);

			// 表示するアイコンを変更
			var video_list = $('#video_list_' + target_user_id);
			showUserlistCamBtn(video_list, enabler);
		}
	} else {
		// 隠す
		from_dom = $('.video_wrap[data-id="'+ target_user_id +'"]');
		LayoutCtrl.moveVideoArray(NEGOTIATION.videoArray,from_dom,true);

		var hideVideoArrayCopy = $.extend(true, [],NEGOTIATION.videoArray.hide);
		LayoutCtrl.videoHide(hideVideoArrayCopy);

		// 表示するアイコンを変更
		var video_list = $('#video_list_' + target_user_id);
		showUserlistCamBtn(video_list, enabler);
	}
}

// 名刺PDFクリック
$(function (){
    // $("[id=namecard_download]").click(function() {
    $(document).on('click', '.mi_pdf_dl_button',function(){
        // バイナリの送受信のためajaxではなくXMLHttpResquest
        var mime_types = {
            jpg:  'image/jpeg',
            jpeg: 'image/jpeg',
            pdf:  'application/pdf',
        };
        var namecard_url  = $(this).data('namecardUrl');
        var namecard_file = $(this).data('namecardName');
        if (namecard_url != '' && namecard_file != '' ) {
            var namecard_ext  = namecard_url.match(/(.*)(?:\.([^.]+$))/)[2];
            var xhr = new XMLHttpRequest();
            xhr.open('GET', namecard_url, true);
            xhr.responseType = 'arraybuffer';
            xhr.onload = function(e) {
                var blob = new Blob([xhr.response], {"type": mime_types[namecard_ext]});
                var fileName = namecard_file + '.' + namecard_ext;
                // IEの場合は、バイナリのダウンロード方法が変わるため、分岐
                if(getBrowserType() != "IE"){
                    $("a[name=download_namcard_link]").attr("href", URL.createObjectURL(blob));
                    $("a[name=download_namcard_link]").attr("download", fileName);
                    $("a[name=download_namcard_link]")[0].click();
                }else{
                    // IEでのダウンロード処理
                    window.navigator.msSaveBlob(blob, fileName);
                }
            };
            xhr.send();
        }
        return false;
    });
});

/**
 * カメラONOFFボタン押下イベント。自分カメラの映像のONOFFを切り替える。
 */
NEGOTIATION.buttonCamera = function() {
	if (NEGOTIATION.isMyCameraOn) {
		cameraOff();
		NEGOTIATION.isMyCameraOn = false;
	} else {
		cameraOn(getCameraConstraints());
	}
	// マイクとビデオ状態の更新
	NEGOTIATION.updateStatusVideoAudio();
};

/**
 * マイクONOFFボタン押下イベント。自分マイクのONOFFを切り替える。
 */
NEGOTIATION.buttonMic = function() {

	secretVoice.setMyMike(!NEGOTIATION.isMyMicOn)

	if (NEGOTIATION.isMyMicOn) {
		// 手動でマイクをoffにした際にアイコン切り替え
		$('.sp_own_mic_off_icon').css("display", "block");
		micOff();
		NEGOTIATION.isMyMicOn = false;
	} else {
		// 手動でマイクをonにした際にアイコン切り替え
		$('.sp_own_mic_off_icon').css("display", "none");
		micOn();
	}
	// マイクとビデオ状態の更新
	NEGOTIATION.updateStatusVideoAudio();
};


/**
 * 右下メニューボタン押下イベント。メニューをトグルする
 */
NEGOTIATION.negotiationRightMenuButton = function() {
	$('#negotiation_right_menu').toggleClass('mi_active');
	$('#negotiation_right_menu_button_list').toggle();
	if($("#negotiation_right_menu").hasClass("mi_active")){
		$("#negotiation_right_menu_button #label").text("メニューを閉じる");
	}else{
		$("#negotiation_right_menu_button #label").text("メニューを開く");
	}
};

/**
 * 相手のビデオ表示ボタン押下イベント。
 */
NEGOTIATION.buttonTargetVideoOn = function() {
	$('#negotiation_target_video_relative_no_video_0').hide();
	$('#negotiation_target_video_relative_0').show();
	$('#negotiation_target_video_0').show();
	NEGOTIATION.mUserShowTargetVideo = true;
};

/**
 * 相手のビデオ非表示ボタン押下イベント。
 */
NEGOTIATION.buttonTargetVideoOff = function() {
//	$('#negotiation_target_video_relative_0').hide();
	$('#negotiation_target_video_relative_no_video_0').show();
	NEGOTIATION.mUserShowTargetVideo = false;
};

/**
 * 相手のビデオを表示非表示切り替える関数
 */
NEGOTIATION.buttonTargetVideoOnOff = function() {
	var target = $("#button_target_video_on_off");
	// ボタンをトグルする
	target.toggleClass("toggle_on");

	// 自分以外のビデオフレーム全隠し
	var from_dom;
	var showFlg = target.hasClass("toggle_on");

	Object.keys(mUserIdAndUserInfoArray).forEach(function(index) {
		from_dom = $('.video_wrap[data-id="'+ index +'"]');
		LayoutCtrl.moveVideoArray(NEGOTIATION.videoArray,from_dom,showFlg);
	});

	// 終わったら再描画
	LayoutCtrl.apiSetVideo(NEGOTIATION.showVideoMode,NEGOTIATION.videoArray.show,NEGOTIATION.videoArray.hide);
};

/**
 * 録画ボランが押されたときの処理
 */
NEGOTIATION.buttonRecord = function() {
	if ("recording" === NEGOTIATION.mRecordState) {
		pauseCaptureTabCapture(); // 中断
		//stopAndSaveCaptureTabCapture();// 中断して保存する
	}else if ("stop" === NEGOTIATION.mRecordState) {
		startCaptureTabCapture();// 録画開始
	} else if ("pause" === NEGOTIATION.mRecordState) {
		resumeCaptureTabCapture();// 録画再開
	}
};

/**
 * 画面共有ボタン押下イベント
 */
NEGOTIATION.buttonShareScreen = function() {
	if (NEGOTIATION.mIsScreenOn) {
		screenOff();
		myScreenStreamStop();
	} else {
		// 商談がまだ終わってなければ
		if (!NEGOTIATION.isNegotiationFinish) {
			screenOn();
		}
	}
};

/**
 * シークレットメモ押下イベント
 */
NEGOTIATION.buttonSecretMemo = function() {
	swapToggleHide(NEGOTIATION.rightAreaDom,RIGHT_AREA_SECRET_MEMO);
};

/**
 * 名刺ボタン押下イベント
 */
NEGOTIATION.buttonNegotiationNamecard = function(showFlg) {
	if(showFlg){
		// 名刺の表示
//		$('.mi_namecard_area').show();
//		$('#modal-content-preview-namecard').show();
		// オーバーレイの表示
//		$(".namecard_overlay").show();
//		$('.namecard_overlay').show();
	}else{
		// 名刺の非表示
		$('#modal-content-preview-namecard').hide();
		// オーバーレイの非表示
		$(".namecard_overlay").hide();
	}
};

/**
 * 接続者全員に名刺を表示するイベント処理
 * ログイン後で自分の名刺を選択時のみ名刺表示コマンドを全員へ送信する
 */
NEGOTIATION.buttonShowNameCard = function(staffType, staffId, clientId) {

	// 自分のデータを取得
//	var staffType = $('#staff_type').val();
//	var staffId = $('#staff_id').val();
//	var clientId = $('#client_id').val();

	// 名刺表示イベントを送信する
	var data = {
			command : "NAME_CARD",
			type : "SHOW_NAME_CARD",
			staff_type : staffType,
			staff_id : staffId,
			client_id : clientId
	};
	// 接続している全員にメッセージを送信する
	sendCommand(SEND_TARGET_ALL, data);
};

/**
 * 接続者全員に名刺を非表示するイベント処理
 */
NEGOTIATION.buttonHideNameCard = function() {
	// 名刺表示イベントを送信する
	var data = {
			command : "NAME_CARD",
			type : "HIDE_NAME_CARD"
	};
	// 接続している全員にメッセージを送信する
	sendCommand(SEND_TARGET_ALL, data);
};


/**
 * 共有メモの押下イベント
 */
NEGOTIATION.buttonShareMemo = function() {
	// 商談がまだ終わってなければ
	if (!NEGOTIATION.isNegotiationFinish) {
		$('#share_memo_area').toggle();
		var data = {
			command : "SHARE_MEMO",
			type : "TOGGLE_SHARE_MEMO",
			display : $("#share_memo_area").css('display')
		};
		sendCommand(SEND_TARGET_ALL, data);
	}
};

NEGOTIATION.buttonWhiteBoard = function() {
	// 商談がまだ終わってなければ
	if (!NEGOTIATION.isNegotiationFinish) {
		var data = {
				command : "WHITE_BOARD",
				type : "TOGGLE_WHITE_BOARD",
				display : $("#white_board_area").css('display')
		};
		sendCommand(SEND_TARGET_ALL, data);
	}
};

/** チャット画面 */
function  completeFunc() {

	// 表示完了
	console.log("OffFunc");

	var data = {
		command : "CHAT_BOARD",
		type : "TOGGLE_CHAT_BOARD",
		display : "block"
	};
	sendCommand(SEND_TARGET_ALL, data);

	mChatBoardDsp = true;
}
/**
 * チャットボードの押下イベント
 */
NEGOTIATION.chatBoard = function() {
	// 商談がまだ終わってなければ
	if (!NEGOTIATION.isNegotiationFinish) {
		// チャットウインドウの表示
		showChatBord();
		// チャットの設定
		completeFunc();
	}
};

/**
 * 再接続ボタン押下イベント
 */
NEGOTIATION.buttonReconnect = function() {
	if (!navigator.onLine) {
		return;
	}

	if (NEGOTIATION.mIsScreenOn) {
		createModalOkDialog("お知らせ", "画面共有中は表示できません");
	}
	else {
		// 商談管理の再接続
		var run = function() {
			negotiationMainReconnect();
		}
		setTimeout(run, 100);
		if (NEGOTIATION.isOperator) {
			$('#negotiation_right_menu').attr('class', "mi_select_action");
			$('#negotiation_right_menu_button_list').hide();
		}
	}
};

/**
 * 渡された配列の通し番号だけ表示トグルして、後は全部HIDEする
 */
function swapToggleHide(domArray,targetNum){
	var count = 0;
	var viewCount = 0;

	// 各ドム表示切り替え
	$.each(domArray,function(){
		if(count == targetNum){
			this.toggle();
		}

		if(this.isShow()){
			viewCount++;
		}

		count++;
	});

}


//////////////////// イベントに付属する処理　L作成。M_NO_TOUCHいつかはリファクタしたい

//////////////////////////////////
// 商談終了
//////////////////////////////////
function negotiation_finish() {
//	micOff();
//	cameraOff();
	sendNegotiationFinishProcess();
	showNegotiationFinishDialogOperator();
}

//////////////////////////////////
// ダイアログ
//////////////////////////////////

function showNegotiationFinishDialogOperator() {
	clearWebRtcParam(
		null,
		null,
		null
	);

	// ピアIDをデータベースに保存
	updateConnectionInfoPeerId(
		$('#connection_info_id').val(),
		$('#user_id').val(),
		null,
		null,
		null,
		null
	);

//	micOff();
//	cameraOff();
	NEGOTIATION.mIsShowConfirmLeaveDialog = false;
	NEGOTIATION.isNegotiationFinish = true;

	// 商談結果テンプレートのデータ取得
	$.ajax({
		url: "https://" + location.host + "/negotiation/get-negotiation-tmpl-list",
		dataType: 'text',
		data: {
			client_id: $("input[id=client_id]").val(),
		}
	}).done(function(res) {
		negotiationResultTmpl = JSON.parse(res);
		$("#modal-content").show();
		// モーダル内のタグを削除する
		$("div.inner-wrap", "#modal-content").empty();
		// テンプレート生成
		var template = Handlebars.compile($('#noti-modal-template').html());
		$('div.inner-wrap', "#modal-content").append(template({
			"tmplList": negotiationResultTmpl,
		}));

		// 共有メモを設定する
		$("[name=sharing_memo]").val($(".share_memo_text").val());

		// シークレットメモを設定する
		$("[name=secret_comment]").val($(".secret_memo_text").val());

		// モーダルを表示する為のクリックイベントを発生させる
		$('.modal-open').trigger("click");

		var connection_info_id = $("#connection_info_id").val();
		$("[name=connectioninfoidtemp]").val(connection_info_id);
		$("[id=nego_rslt_staff_type]").val($("input[id=staff_type]").val());
		$("[id=nego_rslt_staff_id]").val($("input[id=staff_id]").val());
		$("[id=nego_rslt_client_id]").val($("input[id=client_id]").val());
		$("[id=nego_rslt_user_id]").val($("#user_id").val());
		$("[id=nego_stime]").val($("#enter_negotiation_datetime").val());

		//!消さないこと！！
		//negotiationFinishOperator();
	}).fail(function(res) {
	});
}

function showNegotiationFinishDialogUser() {
	clearWebRtcParam(
		null,
		null,
		null
	);
	// ピアIDをデータベースに保存
	updateConnectionInfoPeerId(
		$('#connection_info_id').val(),
		$('#user_id').val(),
		null,
		null,
		null,
		null
	);

	micOff();
	cameraOff();
	NEGOTIATION.mIsShowConfirmLeaveDialog = false;
	NEGOTIATION.isNegotiationFinish = true;

//	alert("本日はお忙しいところ、誠にありがとうございました。閉じるをクリックして終了してください。");
//	window.close();
	$("#modal-content").show();
	// モーダル内のタグを削除する
	$("div.inner-wrap").empty();
	// テンプレート生成
	var template = Handlebars.compile($('#guest-end-modal-template').html());

	$('div.inner-wrap').append(template());

	// モーダルを表示する為のクリックイベントを発生させる
	$('.modal-open').trigger("click");
}

$('#button_debug').click(function(){

});

// オペレータ終了時不要な接続情報を削除する
function negotiationFinishOperator() {
	deleteConnectionInfo(
		$("#connection_info_id").val(),
		null,
		null,
		null
		);
}

//=============================================================
// クリップボードにコピー
//=============================================================
// コピー領域押下でコピーイベントを発生させる
$(document).on('click', 'div.meetin_room_label', function(){
	if(getBrowserType() =='IE') {
		var meetin_room_url = location.protocol + "//" + location.host + "/room/" + $("#meetin_room_name").text();
		window.clipboardData.setData('text', meetin_room_url);
		$('.copy_room_url_tooltip').tooltipster('open');
		setTimeout(function(){
			$(".copy_room_url_tooltip").tooltipster('close');
		}, 1500);
	} else {
		document.addEventListener('copy', function(event) {
			event.preventDefault();
			var meetin_room_url = location.protocol + "//" + location.host + "/room/" + $("#meetin_room_name").text();
			event.clipboardData.setData('text', meetin_room_url);
			$('.copy_room_url_tooltip').tooltipster('open');
			setTimeout(function(){
				$(".copy_room_url_tooltip").tooltipster('close');
			}, 1500);
		}, {once:true});
	}
	// ブラウザのコピー処理を実行する
	document.execCommand("copy");
});
////////////////////////////////////////////////////////////////
// ログインダイアログ
////////////////////////////////////////////////////////////////
//	ユーザーメニューのログインボタンクリック
////////////////////////////////////////////////////////////////
// クライアント選択ダイアログ
////////////////////////////////////////////////////////////////
//クライアント一覧取得
function getClientList(free_word){
	//クライアント一覧取得＆画面表示
	var jqxhr = $.ajax({
			type: "POST",
			url: "https://" + location.host + "/client/get-list",
			data: {
					free_word : free_word
			}
	})
	.done(function(data, status, xhr) {
		//console.log(data);
		var parsed = JSON.parse(data);
		console.log(parsed);
		var stored_client_id = $.cookie()['client_id'];

		var tabledata = "";
		for(var i=0; i < parsed.list.length; i++){
			var client_id = parsed.list[i]["client_id"];

			tabledata += "<tr>";
			tabledata += "<td class=\"mi_table_item_1\">";// + String(i+1) +"\">";//連番じゃなくて常に１だった
			tabledata += "<label class=\"radio-client-container\">";

			tabledata += "<input type=\"radio\" name=\"client_id\" value=\"" + parsed.list[i]["client_id"] + "\"";//></td>";
			tabledata += " client_name=\"" + parsed.list[i]["client_name"] + "\"";// ></td>";

		if(stored_client_id == client_id){
			tabledata += " checked=\"true\"";
		}
		tabledata += " >";
		tabledata += "<span class=\"checkmark\"></span>";
		tabledata += "</label>";
		tabledata += "</td>";
		tabledata += "<td>CA" + ('00000' + parsed.list[i]["client_id"]).slice(-5) +"</td>";
		tabledata += "<td>" + parsed.list[i]["client_name"] + "</td>";
		tabledata += "</tr>";
		}
//		console.log(tabledata);
		//alert( data );
		$("#client_table_body").html(tabledata);
	})
	.fail(function(xhr, status, error) {
		//ajax error
		alert( "error:" + error);
	})
	.always(function(arg1, status, arg2) {
		//なにもしない
	});

};

//クライアント選択クリック
$(".client_dialog_open").click(function(){
	$("#setting-client-dialog").dialog(
	{
		modal: true,
		draggable: false,
		resizable: false,
		closeOnEscape: false,
		position: { my: "center", at: "center", of: window },
		show: false,
		hide: false,
		width: 580,
		height: 420,
		open: function() {
			$(this).dialog('widget')
			.removeClass('ui-corner-all')
			.css('background','white')
			.css('box-shadow','1px 1px 3px 0px #333')
			.css('border', '0')

			$("#setting-client-dialog").height(420);
		}
	});

	$('.ui-widget-overlay').addClass('setting-client-dialog-overlay');
	$('.ui-dialog-titlebar').hide();
	getClientList("");
});

// クライアント設定ダイアログを閉じる
$(document).on('click', '[id=setting-client-dialog-cancel-button]', function(){
	if($("[name='client_id']").filter(":checked").length <= 0 || $.cookie()['client_id'] == 0){
		alert("クライアントを選択してください。");
		return;
	}

	$("#setting-client-dialog").dialog("close");
});

// クライアント選択ボタンクリック
$(document).on('click', '[id=setting-client-dialog-enter-button]', function(){
	var selelem = $("[name='client_id']").filter(":checked");
	var client_id = $("[name='client_id']").filter(":checked").attr("value");

	//クライアントが選択されていない場合は表示を続ける
	if(client_id == null) return;

	//すでに選択済みで同一選択の場合閉じて終了
	if( $.cookie()['client_id'] == client_id){
		$("#setting-client-dialog").dialog("close");
		return;
	}

	var jqxhr = $.ajax({
			type: "POST",
			url: "https://" + location.host + "/client/change",
			data: {
					"client_id":  client_id
			}
	})
	.done(function(data, status, xhr) {
		// 共有タグ変更
		$("#header_clientname").text($("[name='client_id']").filter(":checked").attr("client_name"));
		$('#client_id').val(client_id);

		// クッキー設定
		$.cookie("client_id" ,client_id ,{path: '/'});

		// ログイン情報を全ての接続先へ送信する
		// #user_id / #client_id / #staff_type / #staff_id
		sendLogin();

		// 名刺表示
		// ユーザタイプが存在したらログインとし名刺表示メニューを表示する
		var user_id = $("#user_id").val();;
		if( $("#target_video_staff_type_" + user_id).val() ) {
			$("#video_target_icon_" + user_id).find('.video_card_icon').show();	// 名刺アイコン表示

			// 録画ボタン表示
			// $("#button_record").css('visibility', 'visible');
			$("#button_record").css('display', '');
			// Lockボタン表示
			$("#lock_button").css('visibility', 'visible');
		}

		$("#modal-content-client").hide();

		//////////////////////////////////////////
		//ログイン後の初期設定
		$('#is_operator').val(1);
		NEGOTIATION.isOperator = true;

		// 資料サムネイル再表示
		viewThumbnail();
		$("#show_material_modal").show();
		$("#button_secret_memo").show();
		// ========================================================
		// シークレットメモの同期処理を行うための処理
		// ========================================================
		var secretMemo = sessionStorage.getItem("secretMemo");
		if(secretMemo){
			// ストレージにデータが存在すれば設定する
			$("textarea.secret_memo_text").val(secretMemo);
		}
		/****************************************/
		$("#setting-client-dialog").dialog("close");
	})
	.fail(function(xhr, status, error) {
		//ajax error
		console.log(error);
	})
	.always(function(arg1, status, arg2) {
		//なにもしない
	});

});

// クライアント一覧検索取得
$(document).on('click', '[id=client-dialog-search]', function(){
	var id = $.cookie()['client_id'];
	//alert("search click");
	getClientList($("#client_search_keyword").val());
});

// シークレットメモ
/*$(document).on('click', '[id=button_secret_memo]', function(){
	NEGOTIATION.buttonSecretMemo();
	// 資料が表示されている場合位置が変わるので資料を再描画する
	documentResizeEvent();
});
*/

/*
// 再接続
$(document).on('click', '[id=button_reconnect]', function(){
	NEGOTIATION.buttonReconnect();
});
*/

// cookie削除
function clearCookie() {
	$.cookie('staff_type', "", {path: "/", expires: -1});
	$.cookie('staff_id', "", {path: "/", expires: -1});
	$.cookie('client_id', "", {path: "/", expires: -1});
}

// ルームを共有
$(document).on('touchstart', '[id=button_room_share]', function(){
	$("#modal_share_room").show();
	// メニューを閉じるために疑似クリックを発生させる
	$("div#meeting__menuBtn").trigger('click');
});

// 閉じるボタンクリック
$(document).on('touchstart', '[id=room-share-close]', function(){
	$("#modal_share_room").hide();
});

var requestEnterLockedRoomIntervalID = 0;
function setRequestEnterLockedRoomInterval() {
	checkRequestEnterLockedRoom();
	requestEnterLockedRoomIntervalID = setInterval(e => {
		checkRequestEnterLockedRoom();
	}, 10000);
}
function clearRequestEnterLockedRoomInterval() {
	if(0 < requestEnterLockedRoomIntervalID) {
		clearInterval(requestEnterLockedRoomIntervalID);
		requestEnterLockedRoomIntervalID = 0;
	}
	$(".tooltip-enter-locked-room").remove();
}

function checkRequestEnterLockedRoom() {

	// 自己の状態で処理を中断.
	// ログインしていないユーザにはツールチップは見せない.
	let is_login = $("#client_id").val() !== "0";
	if(!is_login) {
		return false;
	}

	// モニタリングモードの場合はツールチップを見せない.
	is_room_mode2 = $("#room_mode").val() == ROOM_MODE_2;
	if(is_room_mode2) {
		return false;
	}

	// 満室の場合は形態を変える.
	setRequestEnterLockedRoomOverCapacity();

	$.ajax({
		url: '/negotiation/check-enter-locked-room',
		type: "POST",
		dataType: 'json',
		data: {
			connection_info_id: $("#connection_info_id").val()
		},
		success: function (res) {

			if(typeof(res.result.users_want_enter_locked_room) !== "undefined" && res.result.users_want_enter_locked_room !== "[]") {
				let data = $.parseJSON(res.result.users_want_enter_locked_room);
				if(data == null) {
					return;
				}

				if(data.length == undefined) {
					data = [data];
				}

				// リクエストを処理する.
				data.filter(e=> e.status == WANT_ENTER_LOCKED_ROOM_STATUS.RESPONSE_WAIT)
				.map(e=>{

					// アラートの作成がなければ作成.
					openAlertEnterLockedRoom(true);

					// 音を鳴らす.
					let exist = document.querySelector('.request-enter-locked-room[data-locked_token="'+e.locked_token+'"]');
					if(exist == null) {
						wa.loadFile("/webrtc/sounds/raise-hands-bell.wav", function(buffer) {
							wa.play(buffer);
						});
					}

					// 項目を追加する
					if(!exitRequestEnterLockedRoomHtml(e.locked_token)) {
						$("#list_enter_locked_room #contents").append(formatRequestEnterLockedRoomHtml(e.user_name, e.locked_token));
					}


				});
				// キャンセルは消す(SP版の挙動).
				data.filter(e=> e.status == WANT_ENTER_LOCKED_ROOM_STATUS.REQUEST_CANCEL)
				.map(e=>{
					// MEMO. 複数ツールチップが存在する可能性から要請の取り下げは一番最後に並べる為に随時作り直して最後に回す.
					let exist = document.querySelector('.request-enter-locked-room[data-locked_token="'+e.locked_token+'"]');
					if(exist !== null) {
						clearRequestEnterLockedRoomHtml(e.locked_token);
					}
				});

			}
		}
	});
}
function openAlertEnterLockedRoom(bool) {
	document.querySelector('#alert_enter_locked_room').style.display = bool ? 'block' : 'none';
}
function openListEnterLockedRoom(bool) {
	document.querySelector('#list_enter_locked_room').style.display = bool ? 'block' : 'none';
}
$(document).on('click', '[id=btn_list_enter_locked_room_open]', function(){
	openListEnterLockedRoom(true);
});
$(document).on('click', '[id=btn_list_enter_locked_room_close]', function(){
	openListEnterLockedRoom(false);
});
function formatRequestEnterLockedRoomHtml(user_name, locked_token) {
	return `
					<div class="request-enter-locked-room" data-locked_token="${locked_token}" data-type="${WANT_ENTER_LOCKED_ROOM_STATUS.INPUT_VIEW}">
						<div class="user-name">
							<div class="center">
								${user_name}
							</div>
						</div>
						<div class="btn-area">
							<button type="button" class="btn-rejection" onclick="requestEnterLockedRoomRejection(this)">拒否</button>
							<button type="button" class="btn-permission" onclick="requestEnterLockedRoomPermission(this)">許可</button>
						</div>
					</div>`;
}
function getRequestEnterLockedRoomElement(locked_token) {
	return document.querySelector('#list_enter_locked_room #contents .request-enter-locked-room[data-locked_token="'+locked_token+'"]');
}
function exitRequestEnterLockedRoomHtml(locked_token) {
	return getRequestEnterLockedRoomElement(locked_token) !== null;
}
function clearRequestEnterLockedRoomHtml(locked_token) {
	getRequestEnterLockedRoomElement(locked_token).remove();

	// 項目が全て消えたらノック機能を消す.
	if(0 == $("#list_enter_locked_room #contents .request-enter-locked-room").length) {
		openAlertEnterLockedRoom(false);
		openListEnterLockedRoom(false);
	}

}
function requestEnterLockedRoomPermission(e) {

	// バリデーション.
	if(parseInt($('#room_members').text()) == parseInt($("#connectMaxCount").val())) {
		return;
	}

	let locked_token = e.closest(".request-enter-locked-room").dataset.locked_token;
	setRequestEnterLockedRoom(locked_token, WANT_ENTER_LOCKED_ROOM_STATUS.REQUEST_APPROVAL, ()=> {
		clearRequestEnterLockedRoomHtml(locked_token);
		sendEnterLockedRoomResult(locked_token);
	});
}
function requestEnterLockedRoomRejection(e) {
	let locked_token = e.closest(".request-enter-locked-room").dataset.locked_token;
	setRequestEnterLockedRoom(locked_token, WANT_ENTER_LOCKED_ROOM_STATUS.REQUEST_REJECTED, ()=> {
		clearRequestEnterLockedRoomHtml(locked_token);
		sendEnterLockedRoomResult(locked_token);
	});
}
function setRequestEnterLockedRoom(locked_token, status, endEvent) {
	$.ajax({
		url: '/negotiation/set-enter-locked-room-result',
		type: "POST",
		dataType: 'json',
		data: {
			connection_info_id: $("#connection_info_id").val(),
			locked_token: locked_token,
			status: status
		},
		success: function (res) {
			endEvent();
		}
	});
}

// デスクトップ通知の許可処理
$(function() {
	if("Notification" in window) {
		var permission = Notification.permission;

		if(permission === "denied" || permission === "granted") {
			return;
		}
		Notification.requestPermission(function(result) {
			if(result === 'denied') {
			} else if(result === 'default') {
			}
		});
	}
});

/* 画面キャプチャ用の処理 */
$(function() {

if(getBrowserType() != 'Chrome') {
} else {
	var imgWidth = 1920;
	var imgHeight = 0;
	var video  = null;
	var canvas = null;
	var mScreenCaptureStream = null;
	var ScreenCaptureTimeout = null;
	var mNotification = null;
	var mScreenCapture = new MeetinExt.ScreenCapture({debug: false});

	var paddingZero = function(n, digit) {
		var _zero = Array(digit + 1).join("0");
		return (_zero + n).slice(-digit);
	};
	var SaveScreenCaptureProc = function(stream, video, canvas) {
		var ctx = canvas.getContext('2d');
		ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
		var imgData = canvas.toDataURL('image/png');
		// 資料アップロードと同じプロセス
		$("div.upload_document_message").text("アップロード中です");
		$("div.upload_document_message_area").show();
		// 他のユーザーに資料アップロード開始を通知する
		var data = {
				command : "DOCUMENT",
				type : "UPLOAD_DOCUMENT_BEGIN"
		};
		sendCommand(SEND_TARGET_ALL, data);
		var staffType = $("#staff_type").val();
		var staffId = $("#staff_id").val();
		var clientId = $("#client_id").val();
		var now = new Date();
		var datetime = {
			year: paddingZero(now.getFullYear(), 4),
			mon: paddingZero(now.getMonth() + 1, 2),
			day: paddingZero(now.getDate(), 2),
			hour: paddingZero(now.getHours(), 2),
			min: paddingZero(now.getMinutes(), 2),
			sec: paddingZero(now.getSeconds(), 2),
			msec: paddingZero(now.getMilliseconds(), 3)
		};
		var ymdhms = datetime.year + datetime.mon + datetime.day + datetime.hour + datetime.min + datetime.sec + datetime.msec;
		var uuId = localStorage.UUID;
		if( !uuId ) {	// 空
			uuId = UUID.generate();
			localStorage.UUID = uuId;
		}
		// 資料としてアップロード
		$.ajax({
			url: "https://" + location.host + "/negotiation/upload-material",
			type: "POST",
			data: {filename : "captured_" + ymdhms + ".png", filedata : imgData, staff_type : staffType, staff_id : staffId, client_id : clientId},
			success: function(resultJson) {
				// jsonをオブジェクトに変換
				var result = $.parseJSON(resultJson);
				var resultMaterialId = 0;
				if(result["status"] == 1){
					// 資料IDの設定
					resultMaterialId = result["material_basic"]["material_id"];
					// アップロードした資料を1件読み直す
					getMaterial(resultMaterialId, $('#user_id').val(), staffType, staffId, clientId, uuId);
					// ファイル読み込みメッセージを表示する
					$("div.upload_document_message").text("アップロード完了しました");
				}else{
					$("div.upload_document_message").text("アップロード失敗しました");
				}
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
				// アップロードメッセージを消すためのタイマーを設定
				setTimeout(function(){
					$("div.upload_document_message_area").hide();
				},2000);
				// tooltip表示
				$('.material_button_tooltip').tooltipster('open');
				// アップロードメッセージを消すためのタイマーを設定
				setTimeout(function(){
					$('.material_button_tooltip').tooltipster('close');
				},2000);
			}
		});
	}

	var OnClickCallback = function(event) {
		if (ScreenCaptureTimeout) {
			clearTimeout(ScreenCaptureTimeout);
			ScreenCaptureTimeout = null;
		}
		if( mNotification ) {
			mNotification.close();
			mNotification = null;;
		}

		// 非表示キャンバスに設定
		if(mScreenCaptureStream && canvas && video) {
			// 画面をキャプチャして資料としてアップロードする
			SaveScreenCaptureProc(mScreenCaptureStream, video, canvas)
		}

		// キャプチャを停止する
		mScreenCapture.stopScreenCapture();
		if (mScreenCaptureStream) {
			mScreenCaptureStream.getTracks().forEach(function(track) {
				track.stop();
			});
			mScreenCaptureStream = null;
		}
	}

	var OnCloseCallback = function(event) {
		if (ScreenCaptureTimeout) {
			clearTimeout(ScreenCaptureTimeout);
			ScreenCaptureTimeout = null;
		}

		if( mNotification ) {
			mNotification.close();
			mNotification = null;;
		}

		if(canvas) {
			canvas = null;
		}
		if(video) {
			video = null;
		}
		// キャプチャを停止する
		mScreenCapture.stopScreenCapture();
		if (mScreenCaptureStream) {
			mScreenCaptureStream.getTracks().forEach(function(track) {
				track.stop();
			});
			mScreenCaptureStream = null;
		}
	}

	var ScreenCaptureSuccessCallback = function(stream, _paramsCb) {
//		console.log('ScreenCaptureSuccessCallback ' + JSON.stringify(stream));
		mScreenCaptureStream = stream;

		// 非表示キャンバスに設定
		video  = document.getElementById("video_capture_screen");
		canvas = document.getElementById("canvas_capture_screen");
		var _delayTimer = 60000;	// 60秒

		if( _paramsCb && _paramsCb.delayTimer >= 0) {
			_delayTimer = _paramsCb.delayTimer * 1000;
		}

		if(video && canvas) {
			video.addEventListener('canplay', function(ev) {
				imgHeight = video.videoHeight / (video.videoWidth/imgWidth);
				video.setAttribute('width', imgWidth);
				video.setAttribute('height', imgHeight);
				canvas.setAttribute('width', imgWidth);
				canvas.setAttribute('height', imgHeight);
			}, false);
			video = attachMediaStream(video, stream);

			// 通知(Notification)メッセージ表示
			var body = "本通知メッセージをクリックするとキャプチャを実行します。\n尚"+(_delayTimer/1000)+"秒経過すると自動でキャプチャされます。\n\n";
			var icon = null;
			if (typeof Notification !== 'undefined') {
				var options = {
						body: body,
						icon: icon,
						tag: 'renotify',
						renotify: true
				};
				mNotification = new Notification('', options);
				if (OnClickCallback && typeof OnClickCallback === "function") {
					mNotification.onclick = OnClickCallback;
				}
				if (OnCloseCallback && typeof OnCloseCallback === "function") {
					mNotification.onclose = OnCloseCallback;
				}
			}

			// n秒後に画像データを取得
			ScreenCaptureTimeout = setTimeout(function() {
				if( mNotification ) {
					mNotification.close();
					mNotification = null;
				}
				if(mScreenCaptureStream && canvas && video) {
					// 画面をキャプチャして資料としてアップロードする
					SaveScreenCaptureProc(mScreenCaptureStream, video, canvas)
				}
				// キャプチャを停止する
				mScreenCapture.stopScreenCapture();
				if (mScreenCaptureStream) {
					mScreenCaptureStream.getTracks().forEach(function(track) {
						track.stop();
					});
					mScreenCaptureStream = null;
				}
			}, _delayTimer);
		}
	};

	var ScreenCaptureErrorCallback = function(error) {
//		console.log('ScreenCaptureErrorCallback' + JSON.stringify(error));
		mScreenCapture.stopScreenCapture();
	};
	var ScreenCaptureOnEndedEventCallback = function() {
//		console.log('ScreenCaptureOnEndedEventCallback');
		mScreenCapture.stopScreenCapture();
	};
//	var mScreenCapture = new MeetinExt.ScreenCapture({debug: false});
	window.addEventListener('message', function(ev) {
		if(ev.data.type === "ScreenCaptureExtentionInjected") {
//console.log('screen share extension is injected, get ready to use');
//     startScreenShare();
		}
	}, false);
	var noInstalledScreenCaptureExtentionProc = function() {
		$('.screencapture_button_tooltip').tooltipster('open');
	};
	$(document).on('click', '#button_capture_screen', function() {
		// 画面共有中は表示しない
		if (NEGOTIATION.mIsScreenOn) {
			createModalOkDialog("お知らせ", "画面共有中は表示できません");
		}
		else {
			// 拡張機能インストール判定
			if(false === mScreenCapture.isEnabledExtension()) {
				// ツールチップ表示
				noInstalledScreenCaptureExtentionProc();
			} else {
				if (mScreenCaptureStream) {
					mScreenCaptureStream.getTracks().forEach(function(track) {
						track.stop();
					});
					mScreenCaptureStream = null;
					if( mNotification ) {
						mNotification.close();
						mNotification = null;
					}
				}

				mScreenCapture.startScreenCapture({
					Width: 1920,
					Height: 1080,
					FrameRate: 10},
					ScreenCaptureSuccessCallback,
					ScreenCaptureErrorCallback,
					ScreenCaptureOnEndedEventCallback);
			}
		}
	});
}
});


/* iOSでも音を鳴らすための、webAudioAPI　簡易ライブラリ */
(function(window){

  var wa = {

    context: null,
    _buffers: {},

    _initialize: function() {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
    },

    playSilent: function() {
      var context = this.context;
      var buf = context.createBuffer(1, 1, 22050);
      var src = context.createBufferSource();
      src.buffer = buf;
      src.connect(context.destination);
      src.start(0);
    },

    play: function(buffer) {
      // ファイル名で指定
      if (typeof buffer === "string") {
        buffer = this._buffers[buffer];
        if (!buffer) {
          console.error('ファイルが用意できてません!');
          return;
        }
      }

      var context = this.context;
      var source = context.createBufferSource();
      var gainNode = context.createGain();
      source.connect(gainNode);
      gainNode.connect(context.destination);
      // 音量はここで調整
      gainNode.gain.value = 0.1;
      source.buffer = buffer;
      source.start(0);
    },

    loadFile: function(src, cb) {
      var self = this;
      var context = this.context;
      var xml = new XMLHttpRequest();
      xml.open('GET', src);
      xml.onreadystatechange = function() {
        if (xml.readyState === 4) {
          if ([200, 201, 0].indexOf(xml.status) !== -1) {

            var data = xml.response;

            // webaudio 用に変換
            context.decodeAudioData(data, function(buffer) {
              // buffer登録
              var s = src.split('/');
              var key = s[s.length-1];
              self._buffers[key] = buffer;

              // コールバック
              cb(buffer);
            });

          } else if (xml.status === 404) {
            // not found
            console.error("not found");
          } else {
            // サーバーエラー
            console.error("server error");
          }
        }
      };

      xml.responseType = 'arraybuffer';

      xml.send(null);
    },

  };

  wa._initialize(); // audioContextを新規作成

  window.wa = wa;

}(window));
