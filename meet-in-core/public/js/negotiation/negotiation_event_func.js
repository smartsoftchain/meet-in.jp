/**
 * Created by matsuno.masahiro on 2017/02/14.
 * negotiation のイベント関数。
 * 必須：negotiation.js
 */

var mReconnectTimer = false;
//var mRoomLocked = false;
// チャットディスプレイが一度でも開かれたか？
var mChatBoardDsp = false;

const VIDEO_SMALL_ICON_PARENT_SIZE_WIDTH = 400;// ビデオ用のアイコンの大小を決めるwidthしきい値
const VIDEO_SMALL_ICON_PARENT_SIZE_HEIGHT = 300;// ビデオ用のアイコンの大小を決めるheightしきい値

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
NEGOTIATION.eventBind = function () {
	//window
	$(window).focus(function () {
		document.focus = true;// イベント発生時点でdocument.hasFocus()がtrueにならないため無理やりやる
		sendSystemInfoDetail(null);
	});
	$(window).blur(function () {
		sendSystemInfoDetail(null);
	});

	window.addEventListener(
		"message",
		function (event) {
			if (event.source != window) {
				return;
			}
			if (event.data.type == 'TabCaptureExtentionReady') {
				return;
			} else if (event.data.type == 'TabCaptureExtentionNotReady') {
				$('#record_modal-content').fadeIn();
			} else if (event.data.type == 'StartCaptureTabCapture_recording') {
				return;
			} else if (event.data.type == 'StartCaptureTabCapture_paused') {
				return;
			} else if (event.data.type == 'StartCaptureTabCapture_error') {
				return;
			} else if (event.data.type == 'StartCaptureTabCapture_success') {
				NEGOTIATION.mRecordState = "recording";
				countUpRecordingTime();
				showRecordingTimeTooltips();
				$('#button_record').attr('class', 'mi_header_status mi_active');
				$('#button_record').html('<span class="icon-rec mi_default_label_icon_2"></span>録画中');
				$('#button_record').css('margin-right', '');
				return;
			} else if (event.data.type == 'PauseCaptureTabCapture_success') {
				NEGOTIATION.mRecordState = "pause";
				pauseRecordingTime();
				$('#button_record').attr('class', 'mi_header_status');
				$('#button_record').html('<span class="icon-rec mi_default_label_icon_2"></span>一時停止中');
				$('#button_record').css('margin-right', '5px');
				// ダウンロード指示テキスト表示ツールチップ風モーダルを表示
				$('.download_mention_tooltip').show();

				return;
			} else if (event.data.type == 'ResumeCaptureTabCapture_success') {
				NEGOTIATION.mRecordState = "recording";
				countUpRecordingTime();
				$('#button_record').attr('class', 'mi_header_status mi_active');
				$('#button_record').html('<span class="icon-rec mi_default_label_icon_2"></span>録画中');
				$('#button_record').css('margin-right', '');
				return;
			} else if (event.data.type == 'StopCaptureTabCapture_success') {
				NEGOTIATION.mRecordState = "stop";
				$('#button_record').attr('class', 'mi_header_status');
				$('#button_record').html('<span class="icon-rec mi_default_label_icon_2"></span>録画');
				$('#button_record').css('margin-right', '');
				return;
			} else if (event.data.type === 'FileUploadStart') {
				$('#button_record').css('margin-right', '');
				Handlebars.compile($('#loading-upload-modal-template').html());
				$('#loading-upload-modal-template').css('display', 'flex');
				$("#loading-upload-modal-template .mi_modal_shadow").css('background', 'rgba(0, 0, 0)');
			} else if (event.data.type === 'FileUploadEnd') {
					if (isJSON(event.data.result)) {
						const res = JSON.parse(event.data.result);
						if (res.status === 200 && res.result) {
							// アップロード成功
							// 商談終了後に入力するダイアログの「●画面録画ダウンロードURL」項目にURLを設定する。
							$('#download_url_input').val(res.result);
							$("#download_url_body").attr("href", res.result);
							$("#download_url_body").text(res.result);
							$('.alert_message').show();
						}　else {
							// アップロード失敗
							alert(res.message);
						}
					// アップロードの結果に関わらずローディングを終了する。
					$('#loading-upload-modal-template').hide();
					return;
				} else {
					alert('アップロードに失敗しました。');
					// アップロードの結果に関わらずローディングを終了する。
					$('#loading-upload-modal-template').hide();
					return;
				}
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
	// ブラウザ閉じる操作
	//////////////////////////////////

	window.addEventListener("beforeunload", function () {
		// ブラウザの閉じるを使用された場合にも退出処理をするようにする
		// ただし全ての処理が確実に完了できるわけではない
		// 退出したはずが音声、映像が残ってしまうケースがあるそうなので仮説としての対応
		sendNegotiationFinishProcess();
		negotiationMainDestroy();
		secretVoice.onClose();
	});


	//////////////////////////////////
	// ボタン操作
	//////////////////////////////////

	// ユーザー一覧表示ボタンクリック
	$(document).on('click', '[id=header_status_users]', function () {
		$('.user_list_pseudo_button').css('display','block');
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
				open: function (event, ui) {
					var video_list = $('li[id^=video_list]');
					var staff_type = $.cookie()['staff_type'];
					var staff_id = $.cookie()['staff_id'];
					var client_id = $.cookie()['client_id'];
					var room_locked = $('#room_locked').val();
					if (room_locked == 0) {
						$("#button_lock_key").text("このルームをロックする");
					} else {
						$("#button_lock_key").text("このルームのロックを解除する");
					}
					// ゲストにはロックボタンは非表示
					if (staff_type == null || staff_id == null || client_id == null) {
						$('#button_lock_key').css('display', 'none');
					}
					// ビデオ表示非表示項目の設定

					$.each(video_list, function () {
						user_id = $(this).data('id');
						if (true == NEGOTIATION.isShowVideoFrame(user_id)) {
							showUserlistCamBtn($(this), false);
						} else {
							showUserlistCamBtn($(this), true);
						}
					});
					// オーバーレイエリアクリックで閉じる
					$('.ui-widget-overlay').on('click', function () {
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
						click: function (event, ui) {
							$(this).dialog('close');
						},
					}],
			});
			$('.ui-widget-overlay').addClass('negotiation-dialog-overlay');
			$('#button_lock_key').removeClass('ui-button').removeClass('ui-widget').removeClass('ui-state-default').removeClass('ui-corner-all').removeClass('ui-button-text-only');
			//		$('.ui-dialog-titlebar').removeClass('ui-widget-header');
			$('.ui-dialog-titlebar').hide();
		}
		$('.user_list_pseudo_button').trigger("click");
		$('.user_list_pseudo_button').css('display','none');
	});
	// ユーザー一覧[X]
	$('.room_userlist_close').click(function(){
		$(this).parent().dialog('close');
	});

	// ロックのON/OFF
	$(document).on('click', '[id=button_lock_key]', function () {
		var connectionInfoId = $("#connection_info_id").val();
		var mRoomLocked = $("#room_locked").val();

		if (mRoomLocked == "0") {
			// Roomロック
			$(".icon-login").css('color', '#000');
			$(".icon-login").css('visibility', 'visible');
			$(".icon-login").css('display', '');

			// ロックデータ登録(ロック)
			mRoomLocked = "1";
			$.ajax({
				url: "https://" + location.host + "/negotiation/set-negotiation-room-state",
				type: "POST",
				data: {
					connection_info_id: connectionInfoId,
					room_state: mRoomLocked
				}
			}).done(function (res) {
				// 正常
				Result = JSON.parse(res);

				$("#room_locked").val(mRoomLocked);
				sendLock(mRoomLocked);

				setRequestEnterLockedRoomInterval();

			}).fail(function (res) {
			});

		} else {
			// Roomアンロック
			$(".icon-login").css('color', '');
			$(".icon-login").css('visibility', 'hidden');
			$(".icon-login").css('display', 'none');

			// ロックデータ登録(アンロック)
			mRoomLocked = "0";
			$.ajax({
				url: "https://" + location.host + "/negotiation/set-negotiation-room-state",
				type: "POST",
				data: {
					"connection_info_id": $("#connection_info_id").val(),
					"room_state": mRoomLocked
				}
			}).done(function (res) {
				// 正常
				Result = JSON.parse(res);

				$("#room_locked").val(mRoomLocked);
				sendLock(mRoomLocked);

				clearRequestEnterLockedRoomInterval();

			}).fail(function (res) {
			});
		}
	});

	// カメラのON/OFF
	$('#button_camera').click(function () {
		// カメラが使用可能ならば、動作させる
		// MEMO. 尚 カメラの権限より強い 「画面共有」の最中は 操作不能とする.
		NEGOTIATION.buttonCamera();

	});

	// マイクのON/OFF
	$('#button_mic').click(function () {
		// マイクが使用可能ならば、動作させる
		NEGOTIATION.buttonMic();
	});

	// 録画
	$('#button_record').click(function () {
		NEGOTIATION.buttonRecord();
	});

	// ROOM_MODE_2の場合は
	if ($("#room_mode").val() == ROOM_MODE_2) {
		$('.mi_header_users').css('pointer-events','none');
		$('.mi_client_detail').css('pointer-events','none');
		$('.header_contact-wrap').css('pointer-events','none');
		$('.header_help-wrap').css('pointer-events','none');
		$('.negotiation_button_area>.dropdown').css('pointer-events','none');
		$('#button_raise_your_hand').css('pointer-events','none');
		$('#button_reaction').css('pointer-events','none');
		$('#button_mic').css('pointer-events','none');
		$('#button_camera').css('pointer-events','none');
	}

	// 録画モーダル削除
	$('.record_ok_button').click(function(){
		$('#record_modal-content').fadeOut();
	});

	// お問い合わせ
	$('#button_contact').click(function () {
		$('.user_list_pseudo_button').css('display','block');
		// ダイアログ表示
		$("#contact-dialog").dialog({
			modal: true,
			draggable: false,
			resizable: false,
			width: 360,
			minHeight: false,
			closeOnEscape: true,
			position: { my: "right top", at: "left bottom", of: '#button_contact' },
			show: false,
			hide: false,
			open: function (event, ui) {
				// オーバーレイエリアクリックで閉じる
				$('.ui-widget-overlay').on('click', function () {
					$('#contact-dialog').dialog('close');
				});
			},
			dialogClass: 'negotiation-dialog',
		});
		$('.ui-widget-overlay').addClass('negotiation-dialog-overlay');
		$('.ui-dialog-titlebar').hide();
	});
	// お問い合わせ[X]
	$('.contact_modal_close').click(function(){
		$(this).parent().dialog('close');
	});

	// シークレットメモ
	$('#button_secret_memo').click(function () {
	    // 画面共有時はシークレットメモを表示させない
            if(!$("#negotiation_share_screen").isShow() && !$("#share_screen_modal").isShow()){
		NEGOTIATION.buttonSecretMemo();
		// シークレットメモを起動したものをトリガーにするためにajax通信
		$.ajax({
			url:'/setting-log/get-secret-memo-log',
			type:'post',
			dataType:'json',
		});
		// 資料が表示されている場合位置が変わるので資料を再描画する
		documentResizeEvent();

		// メニューを閉じるために疑似クリックを発生させる
		$("div#negotiation_right_menu_button").trigger('click');
            }else{
	    }
	});

	// カレンダー
        $('#button_calendar').click(function () {
                window.open("https://crowd-calendar.com/lp", '_blank');
                // メニューを閉じるために疑似クリックを発生させる
                $("div#negotiation_right_menu_button").trigger('click');
        });

	// 挙手をする
	$('#button_raise_your_hand').click(function () {
		NEGOTIATION.buttonRaiseHands();
	});

	// リアクションをする
	$('#button_reaction').click(function() {
		NEGOTIATION.buttonReaction();
	})

	// 再接続
	$('#button_reconnect').click(function () {
		NEGOTIATION.buttonReconnect();
	});

	// 画面共有
	$('#button_share_screen').click(function () {
		// シークレットメモが開いている場合は閉じる
	        if($("#secret_memo_area").isShow()){
		    $('.secret_memo_close').trigger("click");
	        }
		NEGOTIATION.buttonShareScreen();
		// 画面共有を起動したものをトリガーにするためにajax通信
		$.ajax({
			url:'/setting-log/get-share-screen-log',
			type:'post',
			dataType:'json',
		});
	});

	// モーダル内画面共有モーダル非表示ボタン押下時
	$(document).on('click','#modal_button',function(){
		// NEGOTIATION.buttonShareScreen();
		$('#share_screen_modal').css('display','none');
		$('#negotiation_share_screen').show();
	});

	//モーダル内メッセージクリック時モーダルを閉じる処理
	$(document).on('click','#modal_close',function(){
		$('#share_screen_modal').css('display','none');
	});

	// 画面共有終了　// 鏡合わせ状態に出てる右上の×ボタン
	$(document).on('click', '.close_share_screen_btn', function () {
		NEGOTIATION.buttonShareScreen();
		$('#share_screen_modal').css('display','none');
	});

	// 共有メモ
	$('#button_share_memo').click(function () {
		NEGOTIATION.buttonShareMemo();
		// 共有メモを起動したものをトリガーにするためにajax通信
		$.ajax({
			url:'/setting-log/get-share-memo-log',
			type:'post',
			dataType:'json',
		});
	});

	// ホワイトボード
	$('#button_white_board').click(function () {
		NEGOTIATION.buttonWhiteBoard();
		// ホワイトボードを起動したものをトリガーにするためにajax通信
		$.ajax({
			url:'/setting-log/get-white-board-log',
			type:'post',
			dataType:'json',
		});
	});

	// チャットボード
	$('#button_chat_board').click(function () {
		NEGOTIATION.chatBoard();
		// チャットを起動したものをトリガーにするためにajax通信
		$.ajax({
			url:'/setting-log/get-chat-board-log',
			type:'post',
			dataType:'json',
		});
	});


	// 相手のビデオを表示
	$('#button_target_video_on').click(function () {
		NEGOTIATION.buttonTargetVideoOn();
	});
	// 相手のビデオを非表示
	$('#button_target_video_off').click(function () {
		NEGOTIATION.buttonTargetVideoOff();
	});
	// 相手のビデオを表示・非表示
	$('#button_target_video_on_off').click(function () {
		NEGOTIATION.buttonTargetVideoOnOff();
	});

	// 右メニュー
	$('#negotiation_right_menu_button').click(function () {
		NEGOTIATION.negotiationRightMenuButton();
	});

	// 電子契約画面を表示
	$('#button_e_contract').click(function () {
		// ビデオチャット画面の資料展開がされないようにする
		if ($('#mi_content_area_negotiation').attr('ondrop')) {
			$('#mi_content_area_negotiation').removeAttr('ondrop');
		} else {
			$('#mi_content_area_negotiation').attr('ondrop', 'materialDrop(event)');
		}
		NEGOTIATION.buttonEContract();
	});

	// 名刺表示
	$('.video_card_icon').click(function () {

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
		if (cookie_staff_type == staff_type && cookie_staff_id == staff_id && cookie_client_id == client_id) {
			NEGOTIATION.buttonShowNameCard(staff_type, staff_id, client_id);
		}

		// 名刺表示
		showNameCard(staff_type, staff_id, client_id);
	});

	// 名刺の非表示(名刺の外側)
	$('.mi_namecard_modal_shadow').click(function () {
		var staff_type = $("#staff_type").val();
		var staff_id = $("#staff_id").val();
		//		var client_id = $("#client_id").val();

		// ログイン時の情報取得
		var cookie_staff_type = $.cookie()["staff_type"];
		var cookie_staff_id = $.cookie()["staff_id"];
		var cookie_client_id = $.cookie()["client_id"];

		// ログイン時の情報と名刺選択(video)時の情報と比較し一致なら、全ユーザへ名刺コマンドを発行！！
		//console.log('名刺非表示(Video) staff_type=('+staff_type+') staff_id=('+staff_id+') client_id=('+client_id+')');
		if (cookie_staff_type == staff_type && cookie_staff_id == staff_id) {
			// 現在表示している名刺が自分の名刺の場合は、全ユーザへ名刺コマンドを発行
			if (cookie_staff_type == $("#ShowNameCard_staff_type").val()
				&& cookie_staff_id == $("#ShowNameCard_staff_id").val()
				&& cookie_client_id == $("#ShowNameCard_client_id").val()) {
				// 非教示
				NEGOTIATION.buttonHideNameCard();
			}
		}
		hideNameCard();
	});

	// 全員の名刺を非表示にするボタンを押下する
	$(document).on('click', '.modal-close', function () {

		var staff_type = $("#staff_type").val();
		var staff_id = $("#staff_id").val();
		//		var client_id = $("#client_id").val();
		// ログイン時の情報取得
		var cookie_staff_type = $.cookie()["staff_type"];
		var cookie_staff_id = $.cookie()["staff_id"];
		var cookie_client_id = $.cookie()["client_id"];

		// ログイン時の情報と名刺選択(video)時の情報と比較し一致なら、全ユーザへ名刺コマンドを発行！！
		//console.log('名刺非表示(Video) staff_type=('+staff_type+') staff_id=('+staff_id+') client_id=('+client_id+')');
		if (cookie_staff_type == staff_type && cookie_staff_id == staff_id) {
			// 現在表示している名刺が自分の名刺の場合は、全ユーザへ名刺コマンドを発行
			if (cookie_staff_type == $("#ShowNameCard_staff_type").val()
				&& cookie_staff_id == $("#ShowNameCard_staff_id").val()
				&& cookie_client_id == $("#ShowNameCard_client_id").val()) {
				// 非教示
				NEGOTIATION.buttonHideNameCard();
			}
		}
		hideNameCard();
	});

	// シークレットメモを閉じる
	$('.secret_memo_close').click(function () {
		NEGOTIATION.buttonSecretMemo();
		// 資料が表示されている場合位置が変わるので資料を再描画する
		//documentResizeEvent();
	});

	// ビデオフレームの更新
	$('.stream_reconnect_icon').click(function () {
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
	$('.screen_stream_reconnect_icon').click(function () {
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
	$('.user_name').click(function () {
		var user_id = $('#user_id').val();
		var target_user_id = $(this).parent().data('id');
		toggleVideoFrame(user_id, target_user_id);
	});
	// ビデオ表示・非表示
	$('.video_list_sel').click(function () {
		var user_id = $('#user_id').val();
		var target_user_id = $(this).parents().data('id');
		toggleVideoFrame(user_id, target_user_id);
	});
	// ビデオフレーム内非表示押下
	$('.video_remove_icon').click(function () {
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
	$('.video_big_icon').click(function () {
		// レイアウトをリセットする
		resetLayout();
		let showVideoCount = 0;
		const targetVideoList = $('.video_wrap');
		targetVideoList.each(function() {
			const dataId = $(this).attr('data-id');
			// room左上のユーザー名一覧箇所のアイコンの状態判断では、showVideoCountが 0になることがあったため、
			// 下記の方法で判定し、取得するようにした。非アクティブの値や方法変更の場合はこちらも併せて変更すること。
			const isHidden = $('#negotiation_target_video_' + dataId).css('left') === '-99999px';

			if ($('#negotiation_target_video_' + dataId).css('display') !== 'none'
					&& !isHidden) {
						showVideoCount++;
			}
		});

		var from_dom = $('.video_wrap[data-id="' + $(this).data("id") + '"]');
		var to_dom = $('.video_wrap.big');
		var firstShowVideo = [];
		var tmpShowVideoArray = [];

		if (to_dom.length == 0) {// 存在しないなら順番を入れ替えて,モードを変更し、再描画
			$.each(NEGOTIATION.videoArray.show, function () {
				if (from_dom.get(0) === this.get(0)) {
					firstShowVideo.push(this);
				} else {
					tmpShowVideoArray.push(this);
				}
			});
			NEGOTIATION.videoArray.show = firstShowVideo.concat(tmpShowVideoArray);
			NEGOTIATION.showVideoMode = MODE_ONE_BIG;
			LayoutCtrl.apiSetVideo(NEGOTIATION.showVideoMode, NEGOTIATION.videoArray.show, NEGOTIATION.videoArray.hide);
			// ユーザー名表示箇所のwidthを調整
			adjustUserNameWidth(userNamesOriginalWidthForVideo, true);
		} else {
			// 最大が存在するなら入れ替えるだけ
			LayoutCtrl.cssSwap(from_dom, to_dom);
			// ユーザー名表示箇所のwidthを調整
			adjustUserNameWidth(userNamesOriginalWidthForVideo, true);
		}
	});


	// Videoフレーム内(右)、標準(縮小)ボタン押下
	$('.video_small_icon').click(function () {
		// レイアウトをリセットする
		resetLayout();
		// ユーザー名表示箇所のwidthを調整
		adjustUserNameWidth(userNamesOriginalWidthForVideo, false);

		saveDocument();
		// モードチェンジ、再描画// 資料を閉じる 資料表示中に標準ボタンは表示されない
		hideDocument();
		NEGOTIATION.showVideoMode = MODE_ALL_MINIMUM;
		LayoutCtrl.apiSetVideo(NEGOTIATION.showVideoMode, NEGOTIATION.videoArray.show, NEGOTIATION.videoArray.hide);
	});

 	// iPad用向き検知して、横向きのときに、widthを調整する処理
	$(window).bind('orientationchange', function() {
		if (Math.abs(window.orientation) === 90) {
			// 横向き 回転後のレイアウト情報を取得するため、少し遅らせる
			setTimeout( function() {
				adjustUserNameWidth(userNamesOriginalWidthForVideo, true);
				$("#header_video_reset").trigger('click');　//レイアウトを向きに合わせて戻す
			}, 500);

		} else {
			// 縦向き 回転後のレイアウト情報を取得するため、少し遅らせる
			setTimeout( function() {
				adjustUserNameWidth(userNamesOriginalWidthForVideo, false);	
				$("#header_video_reset").trigger('click');　//レイアウトを向きに合わせて戻す
			}, 500);
		}
	});


	// ユーザー名表示エリアが videoFrame幅を超えそうな場合などにwidthを調整する処理
	function adjustUserNameWidth(userNamesOriginalWidthForVideo, isEnlarge) {
		Object.keys(userNamesOriginalWidthForVideo).forEach(function(dataId) {

			let userNameAreaWidth;
			let originalWidth = userNamesOriginalWidthForVideo[dataId];
			
			// originalWidthでmaxWidthを指定　念のため設定しなおす
			$("#negotiation_target_video_" + dataId).find(".no_video").css("max-width", originalWidth + 'px');
			$("#negotiation_target_video_" + dataId).find(".on_video").css("max-width", originalWidth + 'px');

			const videoFrameWidth = $("#negotiation_target_video_" + dataId).width();

				if (videoFrameWidth !== null && videoFrameWidth > 0) {
						// カメラのオンオフで取得する方を変更する
				if ($('#negotiation_target_video_relative_no_video_' + dataId).css('display') === 'block') {
					// カメラoff時
					userNameAreaWidth =  $("#negotiation_target_video_" + dataId).find(".no_video").width();
				} else {
					// カメラon時
					userNameAreaWidth =  $("#negotiation_target_video_" + dataId).find(".on_video").width();
				}
					let defaultAdjustWidth = 50;
					let leftAdjustValue = 10;

					const isShowIcon = $("#negotiation_target_video_" + dataId).find('.video_mic_off_icon').css('display') === 'block'
						|| $("#other_video_mic_off_icon_" + dataId).css('display') === 'block';
					
					const targetIconWrapElement = $('#negotiation_target_video_' + dataId).find('.mi_video_icon_wrap');
					const hasLessThanSmall = targetIconWrapElement.hasClass('small') || targetIconWrapElement.hasClass('more_small') || targetIconWrapElement.hasClass('extra_small');

					// 標準のときは小アイコンになる
					if (!isEnlarge) {
						hasLessThanSmall === true;
					}

					if (isShowIcon) {
						defaultAdjustWidth = 70;
						leftAdjustValue = 35;

						if (hasLessThanSmall) {
							leftAdjustValue = 28;
						}
						$("#negotiation_target_video_" + dataId).find(".on_video").css("left", leftAdjustValue);
					} else {
						$("#negotiation_target_video_" + dataId).find(".on_video").css("left", leftAdjustValue);
					}
				
					if( userNameAreaWidth < originalWidth) {
						// width0が入ることがあり、正しく判定されないことから、入れておく。
						userNameAreaWidth = originalWidth;
					}

					// 調整値を拡大用と、縮小（標準用で分ける）
					let totalAdjustValue = 0;
					if (isEnlarge) {
						totalAdjustValue = defaultAdjustWidth + leftAdjustValue;
					} else {
						totalAdjustValue = leftAdjustValue;
					}
					
				
					if (videoFrameWidth < userNameAreaWidth + totalAdjustValue) {
						$("#negotiation_target_video_" + dataId).find(".no_video").width(videoFrameWidth - defaultAdjustWidth);
						$("#negotiation_target_video_" + dataId).find(".on_video").width(videoFrameWidth - defaultAdjustWidth);
					} else {
						$("#negotiation_target_video_" + dataId).find(".no_video").width('auto');
						$("#negotiation_target_video_" + dataId).find(".on_video").width('auto');
					}
				}
		});
	}

	var meetinExitFullscreen = function () {
		var video_id = $(this).data("id");
		var target = (video_id) ? $('#video_target_video_area_' + video_id).get(0) : undefined;

		// 取得エラーの場合は画面共有から
		if (!target) {
			target = $('#video_share_screen').get(0);
		}

	}
	$(document).on('webkitfullscreenchange mozfullscreenchange MSFullscreenChange fullscreenchange', function (e) {
		if (!window.screenTop && !window.screenY) {
			console.log('not fullscreen');
		} else {
			console.log('fullscreen');
		}
	});

	var onErrorFullscreen = function (e) {
		//		console.log(e);
	}
	/**
	 * フルスクリーンイベント変更イベント関数
	 * ※フルスクリン画面表示が完了したら呼び出される
	 * @param {} video_id
	 */
	var onChangeFullscreen = function (e) {
		var video_id = $(this).data("id");
		var target = (video_id) ? $('#video_target_video_area_' + video_id).get(0) : undefined;

		// 取得エラーの場合は画面共有から
		if (!target) {
			target = $('#video_share_screen').get(0);
		}

		// イベント削除(フルスクリーン表示時にのみ本関数を実行させるため、ここでイベント削除)
		target.requestFullscreen = target.requestFullscreen || target.mozRequestFullScreen || target.webkitRequestFullscreen || target.msRequestFullscreen
		if (target.requestFullscreen) {
			target.removeEventListener("fullscreenchange", onChangeFullscreen);
			target.removeEventListener("fullscreenerror", onErrorFullscreen);
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
	$('.video_full-screen_icon').click(function () {
		var video_id = $(this).data("id");
		var target = (video_id) ? $('#video_target_video_area_' + video_id).get(0) : undefined;

		if (!target) {
			target = $('#video_share_screen').get(0);
		}

		target.requestFullscreen = target.requestFullscreen || target.mozRequestFullScreen || target.webkitRequestFullscreen || target.msRequestFullscreen
		if (!target.requestFullscreen) {
			alert('ご利用のブラウザはフルスクリーン操作に対応していません');
			return;
		}

		target.requestFullscreen();
		target.addEventListener("fullscreenchange", onChangeFullscreen, false);
		target.addEventListener("fullscreenerror", onErrorFullscreen, false);
		return;
	});

	$('.video_mic_icon').click(function () {
		var video_id = $(this).data("id");
		var flash = null;
		if (navigator.appName.indexOf("Microsoft") != -1) {
			// IE
			flash = window['negotiation_target_flash_' + video_id];
		} else {
			flash = document['negotiation_target_flash_' + video_id];
		}
		if (flash) {
			flash.muteAudio();
			//			meetinFlashTargetVideo_stopMic(video_id);
		} else {
			mNegotiationMain.toggleTargetMic(video_id, false);
		}
	});

	// 商談終了(モーダルでの終了)
	$('#button_negotiation_finish').click(function () {
		// 商談終了モーダルが表示される際に「ルームを退出しますか？」モーダルが、残ってしまうので事前に消す
		$('#exit_modal-content').css('display','none');
		if ("recording" === NEGOTIATION.mRecordState || "pause" === NEGOTIATION.mRecordState) {
			// 録画中、中断中だったらビデオを保存する
			stopAndSaveCaptureTabCapture();
		}

		// 文字起こしを保存する.
		if(isPlayAudioText()) {
			$('#audio-text-stop').trigger('click'); // 文字起こし中だった場合停止.
		}
		audioTextSave();
		clearAudioTextData();
		sendAudioTextEnd();

		var uuid = localStorage.UUID;
		// 資料を表示したユーザが自分の場合は、資料を閉じる(ゲストの場合はUUIDを使用)
		if (uuid == $("#document_uuid").val()) {
			hideDocument();	// 資料を閉じる
		}
		// 資料情報削除
		deleteDocument(uuid);

		// プランを取得する
		var planThisMonth = $("#plan_this_month").val();
		// ママワークスからのアクセスした場合、退出をゲストと同様の動作にする
		var staffAcount = $("[name=staff_type]").val()+ $("[name=staff_id]").val();
		if (NEGOTIATION.isOperator && planThisMonth > 1 && staffAcount != "CE18208") {
			// オペレーターかつ、プランがスタンダードの場合のみ結果を登録できる
			negotiation_finish();
		} else {
			sendNegotiationFinishProcess();
			showNegotiationFinishDialogUser();
		}
		// 商談管理の破棄
		negotiationMainDestroy();

		secretVoice.onClose();

	});

	// 商談終了（メニューからの終了）
	$('#footer_button_negotiation_finish').click(function () {
		if($('#tmp_message_regist_sentiment_analysis').css('display') === 'block'){
			// 音声分析結果登録中（登録中モーダル表示中）は、本当に退室するかどうか確認する。
			if (window.confirm('音声分析結果を登録中です。退室すると結果が登録されません。\n本当に退出しますか？')) {
				exitNegotiationProcedure();
			}
		} else {
			exitNegotiationProcedure();
		}

});

	/**
	 * 退室手続き処理
	 * 録画や文字起こし中だった場合、停止、保存するなど
	 */
	function exitNegotiationProcedure() {
		if ("recording" === NEGOTIATION.mRecordState || "pause" === NEGOTIATION.mRecordState) {
			// 録画中、中断中だったらビデオを保存する
			stopAndSaveCaptureTabCapture();
		}

		// 文字起こしを保存する.
		if(isPlayAudioText()) {
			$('#audio-text-stop').trigger('click'); // 文字起こし中だった場合停止.
		}

		audioTextSave();
		clearAudioTextData();
		sendAudioTextEnd();

		var uuid = localStorage.UUID;
		// 資料を表示したユーザが自分の場合は、資料を閉じる(ゲストの場合はUUIDを使用)
		if (uuid == $("#document_uuid").val()) {
			hideDocument();	// 資料を閉じる
		}
		// 資料情報削除
		deleteDocument(uuid);

		// プランを取得する
		var planThisMonth = $("#plan_this_month").val();

		// ママワークスからのアクセスした場合、退出をゲストと同様の動作にする
		var staffAcount = $("[name=staff_type]").val()+ $("[name=staff_id]").val();
		if (NEGOTIATION.isOperator && planThisMonth > 1 && staffAcount != "CE18208") {
			// オペレーターかつ、プランがスタンダードの場合のみ結果を登録できる
			negotiation_finish();
		} else {
			sendNegotiationFinishProcess();
			showNegotiationFinishDialogUser();
		}
		// 商談管理の破棄
		negotiationMainDestroy();

		secretVoice.onClose();
	}

	/**
	 * 資料情報削除
	 * セッションストレージ削除(自分の資料)
	 * サムネイル削除をゲストへ通知する（メモリー上の資料を削除する）
	 */
	function deleteDocument(uuid) {
		if (sessionStorageKeys.length > 0) {
			var thumbnailviewCount = 0;
			var del_keyName = [];
			for (var i = 0; i < sessionStorageKeys.length; i++) {
				var keyName = sessionStorageKeys[i];
				// セッションストレージから資料データを取得する
				var mtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));
				if (mtSessionStorage) {
					if (uuid == mtSessionStorage[keyName]["UUID"]) {
						var material_id = mtSessionStorage[keyName]["material_basic"]["material_id"];
						//console.log("DELETE keyName=["+keyName+"] material_id=("+material_id+")");
						// サムネイル削除をゲストへ通知する（メモリー上の資料を削除する）
						var data = {
							command: "DOCUMENT",
							type: "DELETE_DOCUMENT",
							keyName: keyName,
							localMaterialId: material_id
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
				data: { connectionInfoId: connectionInfoId, materialIds: del_keyName },
			}).done(function (res) {
			});

		}
	}

	// ビデオ表示リセットボタン押下
	$('#header_video_reset').click(function () {
		// 表示
		if (!NEGOTIATION.mIsScreenOn) {
			// レイアウトをリセットする
			LayoutCtrl.apiMoveAllVideoFrameToShow();
			resetLayout();
			// フレーム内のボタン更新
			LayoutCtrl.updateVideoIcon(NEGOTIATION.videoArray.show);
			// ユーザー名表示箇所のwidth調整
			adjustUserNameWidth(userNamesOriginalWidthForVideo, true);
		}
	});

	/**
	 * レイアウトをリセットする処理の実体
	 */
	function resetLayout() {
		// ビデオレイアウトのリセット
		$.each(NEGOTIATION.videoArray.show, function () {
			// ビデオタグのstyleを削除する（移動やリサイズすると付与される）
			this.removeAttr('style');
			// ビデオタグを表示するためにstyleを付与する
			this.css("display", "block");
		});
		// 資料のリセット
		if ($("div#mi_docment_area").is(':visible') && currentDocumentId != 0) {
			// URL展開時は制御を分岐
			if(!getDocumentUrl()){
				// 資料タグのstyleを削除する（移動やリサイズすると付与される）
				$("div#mi_docment_area").removeAttr('style');
				// 資料タグを表示するためにstyleを付与する
				$("div#mi_docment_area").css("display", "block");
			}else{
				$("div#mi_docment_area").css({
					'width':'789px',
					'height':`${$("#document_canvas").height() + 100}px`,
					'background':'white',
					'border':'1px solid #FFAA00',
					'border-radius':'5px'
				});
				// URLレイアウト用に設定してあるstyleを削除する
				$("div#mi_docment_area").css({
					"inset":""
				});
				$("#document_canvas").css({
					'width':`${$("#mi_docment_area").width() - 100}px`,
					'height':''
				});
				$(".document_img").css({
					'width':`${$("#mi_docment_area").width() - 100}px`,
					'height':''
				});
				// 処理が効かない場合があるため、2度適用
				$("div#mi_docment_area").css({
					'width':'789px',
					'height':`${$("#document_canvas").height() + 100}px`,
					'background':'white',
					'border':'1px solid #FFAA00',
					'border-radius':'5px'
				});
			}
			
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
	$(window).resize(function (e) {
		if (e.target == window) {// draggableの処理と競合しないように

			// フルスクリーン時はVidoeレイアウトの変更は行わない
			var full = getFSelment();
			if (full != null) {
				FSelment = full;
				return;
			}
			else {
				// フルスクリーンから抜けた直後もVidoeレイアウトの変更は行わない
				if (FSelment != null) {
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
	$video_wrap.draggable({
		containment: "div#mi_video_area",
		scroll: false,
		snapMode: "inner"
	});
	// 各ビデオのドロップ時
	$video_wrap.droppable({
		drop: function (ev, ui) {// css情報を入れ替える
			//LayoutCtrl.cssSwap(ui.draggable, $(this));
		}
	});
	// 各ビデオのリサイズ時
	var videoLeft = 0;
	$video_wrap.resizable({
		minHeight: 190,
		minWidth: 190,
		containment: "div#mi_video_area",
		handles: "ne, se, sw, nw",
		start: function () {
			// left座標がマイナスの場合のみ現在のleft設定する
			if ($(this).position().left < 0) {
				videoLeft = $(this).position().left;
			}
		},
		resize: function () {
			// なぜかleft値がマイナスの場合は0にされるので、設定しなおす
			if (videoLeft < 0) {
				videoLeft = $(this).position().left + videoLeft;
				$(this).css("left", videoLeft);
				// 一度設定すればよいので初期値に戻す
				videoLeft = 0;
			}

			if ($(this).find("object").length) {
				var objTagIds = $(this).find("object").attr("id").split("_");
				var userId = objTagIds[objTagIds.length - 1];
				var width = $(this).width();
				var height = $(this).height();
				// IEの場合はDIVの大きさを取得し、ビデオサイズを変更する
				meetinFlashTargetVideo_changeSize(userId, width, height);
			}
		},
		stop: function() {
			// リサイズ後のサイズに合わせてアイコンのサイズ変更する
			if($(this).width() < VIDEO_SMALL_ICON_PARENT_SIZE_WIDTH 
				|| $(this).height() < VIDEO_SMALL_ICON_PARENT_SIZE_HEIGHT
				){
				$(this).removeClass("big");
				$(this).removeClass("more_small");
				$(this).removeClass("extra_small");
				$(this).addClass("small");
				// 現状リサイズの最小が190×190のため、リサイズではmore_small,extra_smallに切り替えることはない。
				// リサイズの最小サイズ変更時は、上記のサイズ変更と同様の形で、more_smallなどaddClassする形にする。
			} else {
				$(this).removeClass("small");
				$(this).removeClass("more_small");
				$(this).removeClass("extra_small");
				$(this).addClass("big");
			}
			// フレーム内のボタン更新
			LayoutCtrl.updateVideoIcon(NEGOTIATION.videoArray.show);
		}
	});
	// ビデオ移動アイコンを押下した際の処理
	$(document).on('click', '.mi_video_move_icon', function () {
		// ビデオ領域を移動できるようにする
		$(this).closest(".video_wrap").draggable("enable");
	});
	$(document).on('mouseup', '.mi_video_move_icon', function () {
		// ビデオ領域を移動できるようにする
		$(this).closest(".video_wrap").draggable("disable");
	});


	$("#mi_video_area").droppable({
		accept: ".video_list",
		tolerance: "pointer",
		drop: function (ev, ui) {// ヘッダーからビデオを取り出す　evはビデオ領域なのでどうでもいい
			// （2）ヘッダーからビデオを出そうとすると、「画面共有中は表示できません」と出てくる。戻せないようにする。
			if (NEGOTIATION.mIsScreenOn) {
				createModalOkDialog("お知らせ", "画面共有中は表示できません");
			} else {
				LayoutCtrl.moveVideoArray(NEGOTIATION.videoArray, $('.video_wrap[data-id="' + ui.draggable.data("id") + '"]'), false);
				//終わったら再描画
				LayoutCtrl.apiSetVideo(NEGOTIATION.showVideoMode, NEGOTIATION.videoArray.show, NEGOTIATION.videoArray.hide);

				// 表示の場合はヘッダーユーザーアイコンに線を付ける
				$("li#video_list_" + ui.draggable.data("id")).addClass("video_list_border");
			}
		}
	});
	$('header').droppable({
		accept: ".video_wrap",
		tolerance: "pointer",
		hoverClass: "drag-hover",
		over: function (ev, ui) {
			// 要素が上に乗った時の処理
			var userId = ui.draggable.data("id");
			// サイドメニューの表示位置を変更し、サイズを変更する
			$("div.mi_left_sidebar").addClass("mi_left_sidebar_hover");
			// 自分のヘッダーアイコンを拡大し、点線枠を付与する
			$("li#video_list_" + userId).addClass("video_list_hover");
			// ヘッダーアイコンを縦中央に寄せる
			$("#mi_header_title").addClass("margin_top_10");
			$("div.mi_flt-r").addClass("margin_top_10");
		},
		out: function (ev, ui) {
			// 要素が外れた時の処理
			var userId = ui.draggable.data("id");
			// サイドメニューの表示位置を変更し、サイズを変更する
			$("div.mi_left_sidebar").removeClass("mi_left_sidebar_hover");
			// 自分のヘッダーアイコンを拡大し、点線枠を付与する
			$("li#video_list_" + userId).removeClass("video_list_hover");
			// ヘッダーアイコンを縦中央から元の位置に戻す
			$("#mi_header_title").removeClass("margin_top_10");
			$("div.mi_flt-r").removeClass("margin_top_10");
		},
		drop: function (ev, ui) {// ヘッダーにビデオを格納する　evはヘッダーなのでどうでもいい
			LayoutCtrl.moveVideoArray(NEGOTIATION.videoArray, ui.draggable, true);
			// 終わったら再描画
			LayoutCtrl.apiSetVideo(NEGOTIATION.showVideoMode, NEGOTIATION.videoArray.show, NEGOTIATION.videoArray.hide);

			// 要素をドロップした時の処理
			var userId = ui.draggable.data("id");
			// サイドメニューの表示位置を変更し、サイズを変更する
			$("div.mi_left_sidebar").removeClass("mi_left_sidebar_hover");
			// 自分のヘッダーアイコンを拡大し、点線枠を付与する
			$("li#video_list_" + userId).removeClass("video_list_hover");
			// ビデオ表示の場合はヘッダーアイコンの点線を削除
			$("li#video_list_" + userId).removeClass("video_list_border");
			// ヘッダーアイコンを縦中央から元の位置に戻す
			$("#mi_header_title").removeClass("margin_top_10");
			$("div.mi_flt-r").removeClass("margin_top_10");
		}
	});

	// 表示されている資料に重なったとき
	// $('#mi_docment_area').droppable({
	// 	accept: ".video_wrap",
	// 	tolerance: "pointer",
	// 	hoverClass: "drag-hover-document",
	// 	drop: function (ev, ui) {
	// 		var firstShowVideo = [];
	// 		var tmpShowVideoArray = [];
	// 		// 資料を閉じる
	// 		saveDocument();
	// 		hideDocument();

	// 		//ui.draggable を先頭にする
	// 		$.each(NEGOTIATION.videoArray.show, function () {
	// 			if (ui.draggable.get(0) === this.get(0)) {
	// 				firstShowVideo.push(this);
	// 			} else {
	// 				tmpShowVideoArray.push(this);
	// 			}
	// 		});

	// 		NEGOTIATION.videoArray.show = firstShowVideo.concat(tmpShowVideoArray);
	// 		LayoutCtrl.videoShow2(NEGOTIATION.showVideoMode, NEGOTIATION.videoArray.show);
	// 		//			NEGOTIATION.showVideoMode = MODE_ONE_BIG;
	// 		//
	// 		//			// 終わったら再描画
	// 		//			LayoutCtrl.apiSetVideo(NEGOTIATION.showVideoMode,NEGOTIATION.videoArray.show,NEGOTIATION.videoArray.hide);
	// 	}
	// });

	// 画面共有で使用するグローバル変数
	var orgScreenWidth = MATERIAL_WIDTH;		// キャンバスのデフォルトサイズ幅
	var orgScreenHeight = MATERIAL_HEIGHT;		// キャンバスのデフォルトサイズ丈
	var shareScreenWidth = MATERIAL_WIDTH;			// キャンバスの実サイズ幅
	var shareScreenHeight = MATERIAL_HEIGHT;		// キャンバスの実サイズ丈
	/**
	 * 画面共有のリサイズイベント
	 */
	$("div#negotiation_share_screen").resizable({
		minHeight: 260,
		minWidth: 260,
		containment: "#mi_video_area",
		handles: "ne, se, sw, nw",
		stop: function () {
			// 現在の画面共有の表示領域のサイズを取得
			orgScreenWidth = $("div#negotiation_share_screen").width();
			orgScreenHeight = $("div#negotiation_share_screen").height();
			if (!$(this).find("img#video_share_screen_image").is(':visible')) {
				// ビデオタグで表示している場合
				var shareScreen = document.getElementById('video_share_screen');
				// ビデオ表示領域に表示できる最大のサイズを計算
				getShareScreenSize({ "height": shareScreen.videoHeight, "width": shareScreen.videoWidth }, orgScreenHeight, orgScreenWidth, orgScreenHeight, orgScreenWidth);
			} else {
				// 画像で表示している場合
				var shareScreen = document.getElementById("video_share_screen_image");
				// ビデオ表示領域に表示できる最大のサイズを計算
				getShareScreenSize({ "height": shareScreen.naturalHeight, "width": shareScreen.naturalWidth }, orgScreenHeight, orgScreenWidth, orgScreenHeight, orgScreenWidth);
			}
			//			console.log("shareScreenWidth:"+shareScreenWidth+" | shareScreenHeight:"+shareScreenHeight);
			// 計算結果を元に画面共有のフレームサイズを再設定する
			$("div#negotiation_share_screen").width(shareScreenWidth).height(shareScreenHeight);
		}
	});

	/**
	 * 画面共有のフレームサイズをフィットさせるための計算を行う関数
	 */
	function getShareScreenSize(shareScreen, localShareScreenHeight, localShareScreenWidth, viewShareScreenHeight, viewShareScreenWidth) {
		if (shareScreen["height"] > shareScreen["width"]) {
			// 縦長画像の場合
			localShareScreenWidth = shareScreen["width"] * localShareScreenHeight / shareScreen["height"];
			if (localShareScreenWidth > viewShareScreenWidth) {
				// 縦に合わせ横を計算した結果、横が枠より大きい場合は縦サイズを縮めて再計算する
				localShareScreenHeight = localShareScreenHeight - 1;
				getShareScreenSize(shareScreen, localShareScreenHeight, localShareScreenWidth, viewShareScreenHeight, viewShareScreenWidth);
			} else {
				// グローバル変数に値を設定する
				shareScreenHeight = localShareScreenHeight;
				shareScreenWidth = localShareScreenWidth;
			}
		} else {
			// 横長画像の場合
			localShareScreenHeight = shareScreen["height"] * localShareScreenWidth / shareScreen["width"];
			if (localShareScreenHeight > viewShareScreenHeight) {
				// 横に合わせ縦を計算した結果、縦が枠より大きい場合は横サイズを縮めて再計算する
				localShareScreenWidth = localShareScreenWidth - 1;
				// 自身の関数で再帰する
				getShareScreenSize(shareScreen, localShareScreenHeight, localShareScreenWidth, viewShareScreenHeight, viewShareScreenWidth);
			} else {
				// グローバル変数に値を設定する
				shareScreenHeight = localShareScreenHeight;
				shareScreenWidth = localShareScreenWidth;
			}
		}
	}

	/**
	 * 画面共有の移動イベント
	 */
	$("div#negotiation_share_screen").draggable({
		containment: "#mi_video_area",
		scroll: false,
		snapMode: "inner"
	});

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
		functionReady: function(origin){
			tooltip = origin.elementTooltip;
			$(tooltip).find('.tooltipster-box').css('background-color', "#222222");
			$(tooltip).find('.tooltipster-arrow-background').css('border-right-color', "#222222");
		}
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
		functionInit: function (instance, helper) {
		},
		// チップが表示される前に実行される
		functionBefore: function (instance, helper) {
			instance.content('<span class="tooltip_header_status_users">現在<span class="room_members_count">' + $('#room_members').text() + '</span>人が接続中</span>');
		},
		functionPosition: function (instance, helper, position) {
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
	//いいねhover時のツールチップ（吹き出し）
	if (!USER_PARAM_IS_IPAD_PC) { // ipadPCでたまにホバー検知するため一応入れておく
		$('#button_reaction').tooltipster({
			functionInit: function (instance, helper) {
			},
			// チップが表示される前に実行される
			functionBefore: function (instance, helper) {
				instance.content('<span class="tooltip_button_reaction">いいねする</span>');
			},
			functionPosition: function (instance, helper, position) {
				position.coord.left += 35;
				position.coord.top += 0;
				return position;
			},
			contentAsHTML: true,
			interactive: true,
			theme: 'Default',
			animation: 'fade',
			trigger: 'hover',
			zIndex: 200000001,
			content: $('.tooltip_button_reaction'),
			contentCloning: false,
		});
	}
	// 挙手hover時のツールチップ（吹き出し）
	if (!USER_PARAM_IS_IPAD_PC) { // ipadPCでたまにホバー検知するため一応入れておく
		$('#button_raise_your_hand').tooltipster({
			functionInit: function (instance, helper) {
			},
			// チップが表示される前に実行される
			functionBefore: function (instance, helper) {
				instance.content('<span class="tooltip_button_raise_your_hand">挙手する</span>');
			},
			functionPosition: function (instance, helper, position) {
				position.coord.left += 35;
				position.coord.top += 0;
				return position;
			},
			contentAsHTML: true,
			interactive: true,
			theme: 'Default',
			animation: 'fade',
			trigger: 'hover',
			zIndex: 200000001,
			content: $('.tooltip_button_raise_your_hand'),
			contentCloning: false,
		});
	}

	$('.record_button_tooltip').tooltipster({
		contentAsHTML: true,
		interactive: true,
		animation: 'fade',
		trigger: 'custom',
		zIndex: 100000002,
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
	$('.zoom_button_tooltip').tooltipster({
		contentAsHTML: true,
		interactive: true,
		animation: 'fade',
		trigger: 'custom',
		triggerClose: {
			click: true,
			originClick: true,
			mouseleave: true
		},
		theme: 'tooltipster-light',
		contentCloning: true,
		content: 'URLは拡大できません'
	});

	/*
	// ビデオ表示をリセットボタンのツールチップ表示
	$('#header_video_reset').tooltipster({
		contentAsHTML: true,
		interactive: true,
		theme: 'Default',
		animation: 'fade',
		trigger: 'hover',
		zIndex: 200000001,
		content: 'ビデオ表示をリセット',
		contentCloning: false
	});
	*/


	$('.audio_text_button_tooltip').tooltipster({
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
		content: '別のユーザーが使用しています。<br>使用したい場合は、他のユーザーの文字起こしを終了してください。'
	});


	if($("#remind_record_flg").val() == "1" && USER_PARAM_BROWSER !== 'Safari') {
		$('.remind_record_tooltip').show();
		$(document).on('click touchend', function(event) {
			$('.remind_record_tooltip').hide();
		});
	}


	// スライダーのバインド
	// 全部のinput要素の変化を監視
	$('input[type=range]').on('input', function () {
		$(this).next("output").text($(this).val());
	}).change(function () {
		$(this).next("output").text($(this).val());
	});

	$('.video_mute_audio').click(function () {
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
		if (flash) {
			meetinFlashTargetVideo_muteAudio(video_id, muted);
		} else {
			mNegotiationMain.muteTargetAudio(video_id, muted);
		}
		if (muted == false) {
			$(this).find(".mi_video_icon").removeClass('icon-microphone-off');
			$(this).find(".mi_video_icon").addClass('icon-microphone');
		} else {
			$(this).find(".mi_video_icon").removeClass('icon-microphone');
			$(this).find(".mi_video_icon").addClass('icon-microphone-off');
		}
	});

	// 商談終了(ゲストの場合)
	// ログインユーザーだが、ライトプランの場合はこの処理を共有する
	$(document).on('click', '[name=btn_guest_end]', function () {
		// staff_typeとstaff_idを取得する
		var staffType = $("#staff_type").val();
		var staffId = $("staff_id").val();
		// ママワークス面談用の場合はゲストユーザーと同様に扱う
		if ((staffType != "" && staffType != "ZZ" && staffId != "") && (staffType != "CE" && staffId !="18208")) {
			// ログインユーザーでライトプランの場合はログイン後TOPへ遷移する
			window.location.href = "https://" + location.host + "/index/menu";
		} else {
			// 背景画像削除用にゲストIDを取得する
			var bodypixGuestId = sessionStorage.getItem('bodypixGuestId');
			if(!bodypixGuestId){
				// ゲストIDが存在しない場合は作成する
				sessionStorage.setItem('bodypixGuestId', localStorage.UUID);
				bodypixGuestId = sessionStorage.getItem('bodypixGuestId');
			}
			/**
			 * ログアウト(ゲスト用)
		 	 * (クッキーとセッションを削除する)
		 	 */
			$.ajax({
				type: "POST",
				url: "https://" + location.host + "/index/new-logout",
				dataType: "json",
				data: {
					user_id: $('#user_id').val(),
					connection_info_id: $('#connection_info_id').val(),
					bodypixGuestId : bodypixGuestId
				}
			})
				.done(function (res) {
					// 未ログインのゲストはTOPページへ戻る
					if (res.redirect_url != "") {
						window.location.href = res.redirect_url;
					} else {
						window.location.href = "https://" + location.host + "/";
					}
				})
				.fail(function (res) {
					// 未ログインのゲストはTOPページへ戻る
					if (res.redirect_url != "") {
						window.location.href = res.redirect_url;
					} else {
						window.location.href = "https://" + location.host + "/";
					}
				})
			// .always(() => {
			// 	// TOPページへ戻る
			// 	window.location.href =  "https://" + location.host + "/";
			// })
		}
	});

	// ロック状態
	if ($("#room_locked").val() == "0") {
		$(".icon-login").css('visibility', 'hidden');
		$(".icon-login").css('display', 'none');
	} else {
		$(".icon-login").css('visibility', 'visible');
		$(".icon-login").css('display', '');
	}
};

// モーダルのウィンドウ以外の部分をクリックしたときはモーダルを閉じる
let pushRecordBtnCount = 0;
let pushRecordstartBtnCount = 0;
$(document).on('click', function(event){
	if( $('.download_mention_tooltip').length && $('#button_record').length) {
		$('.download_mention_tooltip').on('click', function() {
			event.stopPropagation();
		});

		const targetModalElemLength = $(event.target).closest('.download_mention_tooltip').length;
		const recordBtnElemLength = $(event.target).closest('#button_record').length;
		if (recordBtnElemLength === 1) {
			pushRecordBtnCount++;
		}
		const isShowTooltipModal = $('.download_mention_tooltip').css('display') === 'block';
		// モーダル領域外押下でモーダルを消す処理
		if (targetModalElemLength === 0 && recordBtnElemLength === 0 && isShowTooltipModal){ // モーダルクリック1 それ以外0
			$('.download_mention_tooltip').hide();
			pushRecordBtnCount = 0;
		}
		// 録画ボタン押下でモーダルを消す処理
		if (recordBtnElemLength === 1 && pushRecordBtnCount >= 2 && isShowTooltipModal) {
			$('.download_mention_tooltip').hide();
			pushRecordBtnCount = 0;
		}
	}

	if( $('.recording_start_mention_tooltip').length && $('#button_record').length) {
		$('.recording_start_mention_tooltip').on('click', function() {
			event.stopPropagation();
		});

		const targetStartModalElemLength = $(event.target).closest('.recording_start_mention_tooltip').length;
		const recordBtnElemLength = $(event.target).closest('#button_record').length;
		if (recordBtnElemLength === 1) {
			pushRecordstartBtnCount++;
		}

		const isShowStartTooltipModal = $('.recording_start_mention_tooltip').css('display') === 'block';
		// モーダル領域外押下でモーダルを消す処理
		if (targetStartModalElemLength === 0 && recordBtnElemLength === 0 && isShowStartTooltipModal){ // モーダルクリック1 それ以外0
			$('.recording_start_mention_tooltip').hide();
			pushRecordstartBtnCount = 0;
		}
		// 録画ボタン押下でモーダルを消す処理
		if (recordBtnElemLength === 1 && pushRecordstartBtnCount >= 2 && isShowStartTooltipModal) {
			$('.recording_start_mention_tooltip').hide();
			pushRecordstartBtnCount = 0;
		}
	}
});

// 録画一時停止中の際に表示されるテキスト表示ツールチップ風モーダルを閉じる処理
if( $('.close_download_tooltip').length) {
	$('.close_download_tooltip').on('click', function() {
		$('.download_mention_tooltip').hide();
		pushRecordBtnCount = 0;
	});
}

// 録画開始時 or 30日後に表示されるテキスト表示ツールチップ風モーダルを閉じる処理
if( $('.recording_start_mention_tooltip .close_download_tooltip').length) {
	$('.recording_start_mention_tooltip .close_download_tooltip').on('click', function() {
		$('.recording_start_mention_tooltip').hide();
		pushRecordstartBtnCount = 0;
	});
}

// 録画開始85分経過した際に表示されるテキスト表示ツールチップ風モーダルを閉じる処理
if( $('.recording_time_elapse_mention_tooltip .close_download_tooltip').length) {
	$('.recording_time_elapse_mention_tooltip .close_download_tooltip').on('click', function() {
		$('.recording_time_elapse_mention_tooltip').hide();
	});
}

// カメラとマイクのON/OFFの切り替え
if( $('.close_camera_on_off_tooltip').length) {
	$('.close_camera_on_off_tooltip').on('click', function() {
		$('.remind_camera_on_off_tooltip').css('display', 'none');
		localStorage.setItem('camera_on_off_flag', 'on');
	});
}

	// カメラON/OFF リマインダーの位置調整
function adjustCameraOnOffTooltip()  {
	const recordBtnLeft = $('#button_camera').offset().left;
	$('.remind_camera_on_off_tooltip').css({
		'top': 68 + 'px',
		'left': (recordBtnLeft - 35) + 'px',
	});
} 

// 画面リサイズ時、位置ずれ防止フラグ
let onceFlg = false;
// 読み込み時
$(document).ready(function() {
	adjustDownloadMentionTooltipPosition();　// テキスト表示ツールチップ風モーダルの位置調整処理

	if($("#room_locked").val() == "1") {
		setRequestEnterLockedRoomInterval(); // ルームをロックしている場合の処理.
	}
})

// // 読み込み完了時
$(window).load(function() {
	onceFlg = true;
	adjustDownloadMentionTooltipPosition();

	// 拡張機能を使用しないで画面共有実装に際し、バックエンドの処理($isMobile)でiPad判定できなかった為、jsにて非表示
	if(isIPad(navigator.userAgent)) {
		$('#button_share_screen').css('display', 'none');
	}
})

// 画面リサイズ時
$(window).on('resize', function() {
	onceFlg = false;
	adjustDownloadMentionTooltipPosition();
})

// テキスト表示ツールチップ風モーダルの位置を調整する関数
function adjustDownloadMentionTooltipPosition() {
	if ($('#button_record').length) {
		let recordBtnLeft = $('#button_record').offset().left;

		// 同席モードの場合は右にズレるので、その分を調整
		if (($("#room_mode").val() == ROOM_MODE_2) && onceFlg) {
			recordBtnLeft -= 94;
		}
		$('.download_mention_tooltip').css({
			'top': 68 + 'px',
			'left': (recordBtnLeft - 181) + 'px',
		});
		// 録画開始 or 30日後表示tooltip
		$('.recording_start_mention_tooltip').css({
			'top': 68 + 'px',
			'left': (recordBtnLeft - 136) + 'px',
		});
		// 録画開始85分経過時表示tooltip
		$('.recording_time_elapse_mention_tooltip').css({
			'top': 68 + 'px',
			'left': (recordBtnLeft - 271) + 'px',
		});

		// 録画リマインダー.
		$('.remind_record_tooltip').css({
			'top': 68 + 'px',
			'left': (recordBtnLeft - 83) + 'px',
		});

	}

	adjustCameraOnOffTooltip() 

	// カメラON/OFFフラグがonでなくかつ、同席モードでない時にカメラツールチップを表示する
	if ((localStorage.getItem('camera_on_off_flag') != 'on') && ($("#room_mode").val() != ROOM_MODE_2)) {
		$('.remind_camera_on_off_tooltip').css('display', 'block');
	}
}

function showUserlistCamBtn(video_list, enabler) {
	if (enabler) {
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

	if (enabler == false) {
		// 表示
		if (NEGOTIATION.mIsScreenOn) {
			createModalOkDialog("お知らせ", "画面共有中は表示できません");
		}
		else {
			from_dom = $('.video_wrap[data-id="' + target_user_id + '"]');
			LayoutCtrl.moveVideoArray(NEGOTIATION.videoArray, from_dom, false);

			LayoutCtrl.videoShow2(NEGOTIATION.showVideoMode, NEGOTIATION.videoArray.show);

			// 表示するアイコンを変更
			var video_list = $('#video_list_' + target_user_id);
			showUserlistCamBtn(video_list, enabler);
		}
	} else {
		// 隠す
		from_dom = $('.video_wrap[data-id="' + target_user_id + '"]');
		LayoutCtrl.moveVideoArray(NEGOTIATION.videoArray, from_dom, true);

		var hideVideoArrayCopy = $.extend(true, [], NEGOTIATION.videoArray.hide);
		LayoutCtrl.videoHide(hideVideoArrayCopy);

		// 表示するアイコンを変更
		var video_list = $('#video_list_' + target_user_id);
		showUserlistCamBtn(video_list, enabler);
	}
}

// 名刺PDFクリック
$(function () {
	// $("[id=namecard_download]").click(function() {
	$(document).on('click', '.mi_pdf_dl_button', function () {
		// バイナリの送受信のためajaxではなくXMLHttpResquest
		var mime_types = {
			jpg: 'image/jpeg',
			jpeg: 'image/jpeg',
			pdf: 'application/pdf',
		};
		var namecard_url = $(this).data('namecardUrl');
		var namecard_file = $(this).data('namecardName');
		if (namecard_url != '' && namecard_file != '') {
			var namecard_ext = namecard_url.match(/(.*)(?:\.([^.]+$))/)[2];
			var xhr = new XMLHttpRequest();
			xhr.open('GET', namecard_url, true);
			xhr.responseType = 'arraybuffer';
			xhr.onload = function (e) {
				var blob = new Blob([xhr.response], { "type": mime_types[namecard_ext] });
				var fileName = namecard_file + '.' + namecard_ext;
				// IEの場合は、バイナリのダウンロード方法が変わるため、分岐
				if (getBrowserType() != "IE") {
					$("a[name=download_namcard_link]").attr("href", URL.createObjectURL(blob));
					$("a[name=download_namcard_link]").attr("download", fileName);
					$("a[name=download_namcard_link]")[0].click();
				} else {
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
	// マイクとビデオ状態の更新
	if (USER_PARAM_BROWSER === 'IE') {
		NEGOTIATION.updateStatusVideoFlash();
	} else {
		NEGOTIATION.updateStatusVideo();
	}

	if (NEGOTIATION.isMyCameraOn) {
		cameraOff();
		NEGOTIATION.isMyCameraOn = false;
	} else if (NEGOTIATION.isMyCameraError == false) { //接続エラー発生してたら押さないようにする
		cameraOn(getCameraConstraints());
	}
};

/**
 * マイクONOFFボタン押下イベント。自分カメラの映像のONOFFを切り替える。
 */
NEGOTIATION.buttonMic = function () {
	// マイクとビデオ状態の更新
	if (USER_PARAM_BROWSER === 'IE') {
		NEGOTIATION.updateStatusAudioFlash();
	} else {
		NEGOTIATION.updateStatusAudio();
	}

	secretVoice.setMyMike(!NEGOTIATION.isMyMicOn);
	// 親のdata-id（user_id）を取得
	const targetUserId = $('#user_id').val();
	// マイクアイコンのwidth判定で 小アイコン用の left設定する cssClass作ってもいいか
	const targetIconWrapElement = $('#negotiation_target_video_' + targetUserId).find('.mi_video_icon_wrap');
	const hasLessThanSmall = targetIconWrapElement.hasClass('small') || targetIconWrapElement.hasClass('more_small') || targetIconWrapElement.hasClass('extra_small');
	const videoFrameWidth = $("#negotiation_target_video_" + targetUserId).width();
	const userNameAreaWidth =  $("#negotiation_target_video_" + targetUserId).find(".on_video").width();

	if (NEGOTIATION.isMyMicOn) {
		// micOff();
		// 手動でマイクをoffにした際にアイコン切り替え
		$('.video_mic_off_icon').css('display', 'block');
		const defaultAdjustWidth = 60;
		// videoオン かつ マイクoffのときに、マイクoffアイコン分ユーザー名表示をずらす
			let leftAdjustValue = 35;
			$('#negotiation_target_video_' + targetUserId).find('.on_video').css("left", leftAdjustValue + "px");
			if (hasLessThanSmall) {
				leftAdjustValue = 28;
				$('#negotiation_target_video_' + targetUserId).find('.on_video').css("left", leftAdjustValue + "px");
			}

			// video幅を超えるような場合は、widthを left分縮める
			if (videoFrameWidth < userNameAreaWidth + defaultAdjustWidth) {
				$('#negotiation_target_video_' + targetUserId).find('.on_video').width(userNameAreaWidth - leftAdjustValue);
			}

		mNegotiationMain.micOff();
		NEGOTIATION.isMyMicOn = false;
	} else if (NEGOTIATION.isMyMicError == false){　//接続エラー発生してたら押さないようにする
		// 手動でマイクをonにした際にアイコン切り替え
		$('.video_mic_off_icon').css("display", "none");
		// マイクoff時、ずらしたユーザー名表示を元に戻す
		$('#negotiation_target_video_' + targetUserId).find('.on_video').css("left", "10px");
		micOn();
	}
};

/**
 * 右下メニューボタン押下イベント。メニューをトグルする
 */
NEGOTIATION.negotiationRightMenuButton = function () {
	$('#negotiation_right_menu').toggleClass('mi_active');
	$('#negotiation_right_menu_button_list').toggle();
	if ($("#negotiation_right_menu").hasClass("mi_active")) {
		$("#negotiation_right_menu_button #label").text("メニューを閉じる");
	} else {
		$("#negotiation_right_menu_button #label").text("メニューを開く");
	}
};

/**
 * 相手のビデオ表示ボタン押下イベント。
 */
NEGOTIATION.buttonTargetVideoOn = function () {
	$('#negotiation_target_video_relative_no_video_0').hide();
	$('#negotiation_target_video_relative_0').show();
	$('#negotiation_target_video_0').show();
	NEGOTIATION.mUserShowTargetVideo = true;
};

/**
 * 相手のビデオ非表示ボタン押下イベント。
 */
NEGOTIATION.buttonTargetVideoOff = function () {
	//	$('#negotiation_target_video_relative_0').hide();
	$('#negotiation_target_video_relative_no_video_0').show();
	NEGOTIATION.mUserShowTargetVideo = false;
};

/**
 * 相手のビデオを表示非表示切り替える関数
 */
NEGOTIATION.buttonTargetVideoOnOff = function () {
	var target = $("#button_target_video_on_off");
	// ボタンをトグルする
	target.toggleClass("toggle_on");

	// 自分以外のビデオフレーム全隠し
	var from_dom;
	var showFlg = target.hasClass("toggle_on");

	Object.keys(mUserIdAndUserInfoArray).forEach(function (index) {
		from_dom = $('.video_wrap[data-id="' + index + '"]');
		LayoutCtrl.moveVideoArray(NEGOTIATION.videoArray, from_dom, showFlg);
	});

	// 終わったら再描画
	LayoutCtrl.apiSetVideo(NEGOTIATION.showVideoMode, NEGOTIATION.videoArray.show, NEGOTIATION.videoArray.hide);
};

/**
 * 録画ボランが押されたときの処理
 */
NEGOTIATION.buttonRecord = function () {
	if ("recording" === NEGOTIATION.mRecordState) {
		pauseCaptureTabCapture(); // 中断
		//stopAndSaveCaptureTabCapture();// 中断して保存する
	} else if ("stop" === NEGOTIATION.mRecordState) {
		startCaptureTabCapture();// 録画開始
	} else if ("pause" === NEGOTIATION.mRecordState) {
		resumeCaptureTabCapture();// 録画再開
	}
};


/**
 * 録画開始及び30日後にtooltip表示処理
 */
function showRecordingTimeTooltips() {
	let firstRemindFlag = false;
	let cookies = document.cookie;
	let cookiesArray = cookies.split(';');

	for(var c of cookiesArray) {
		var cArray = c.split('=');
		// cookieに30日後リマインド用のフラグがあればフラグを立てる
		if( cArray[0] == 'recordingReminder') {
			firstRemindFlag = true;
		}
	}

	// 初回 or 30日後に表示するかどうか
	if (NEGOTIATION.mRecordingTime == 0 && !firstRemindFlag) {
		$('.recording_start_mention_tooltip').show();
		let expire = new Date();
		expire.setTime(expire.getTime() + (30 * 24 * 60 * 60 * 1000));
		document.cookie = 'recordingReminder=30;' + 'expires=' + expire.toUTCString() + ';';
	}
} 

/**
 * 録画時間のカウント
 */
let countUpRecordingTimeId;
function countUpRecordingTime() {
	countUpRecordingTimeId = setInterval(countUp, 1000);
}

/**
 * 実際の録画時間カウント処理
 */
let countUpRemindFlag = false;
function countUp() {
	++NEGOTIATION.mRecordingTime;
	// 録画開始85分(5100秒)経過したらtooltips表示
	if (NEGOTIATION.mRecordingTime >= 5100 && !countUpRemindFlag) {
		countUpRemindFlag = true;
		$('.recording_time_elapse_mention_tooltip').show();
	}
}

/**
 * 録画時間のカウント停止
 */
function pauseRecordingTime() {
	clearInterval(countUpRecordingTimeId);
}

/**
 * 画面共有ボタン押下イベント
 */
NEGOTIATION.buttonShareScreen = function () {
	if (NEGOTIATION.mIsScreenOn) {

		// 現在はコメントアウトして黒幕として使わない頃に戻す対応をしている
		// #nexotiation_share_screen_icon_frame　は、親の #negotiation_share_screen.hover() 判定で Hide Show イベントで管理されていたのに、
		// 直接的に 色を付けてしまったせいで　不具合が起きたように思えます。（親要素で 非表示・表示を操作しているのに　それに逆らい常時黒にしたことの帳尻併せは難しいという意見です）
		// 提案としては、黒幕が必要ならば「画面共有中」窓の既存の白枠の「#share_screen_white_modal」をcssを編集して黒幕にして、子domに白枠を新規作成したほうが良い.
		// (ただし、「このメッセージウィンドウを閉じる」を押すと　黒枠が消えてしまうのでこの点仕様と相談が必要ですが=ただ録画時に黒枠しか取れない弊害があるそうなので対策としてそれで良いかもしれません)

		//$('#nexotiation_share_screen_icon_frame').css('background-color','rgba(0,0,0,0)'); // 黒幕を一時的に撤去

		showBehindDocument(); // 画面共有解除時 資料展開していた場合は、再表示する

		screenOff();
		myScreenStreamStop();

		$("#header_video_reset").trigger('click');　// レイアウト元に戻す（初期化）
	} else {
		// 商談がまだ終わってなければ
		if (!NEGOTIATION.isNegotiationFinish) {
			//$('#nexotiation_share_screen_icon_frame').css('background-color','rgba(0,0,0,0.9)'); // 黒幕を一時的に撤去(元に戻す必要なし為)
			screenOn();
		}
	}
};

/**
 * シークレットメモ押下イベント
 */
NEGOTIATION.buttonSecretMemo = function () {
	// 商談がまだ終わってなければ
	if (!NEGOTIATION.isNegotiationFinish) {
		$('#secret_memo_area').toggle();
	}
};

/**
 * 名刺ボタン押下イベント
 */
NEGOTIATION.buttonNegotiationNamecard = function (showFlg) {
	if (showFlg) {
		// 名刺の表示
		//		$('.mi_namecard_area').show();
		//		$('#modal-content-preview-namecard').show();
		// オーバーレイの表示
		//		$(".namecard_overlay").show();
		//		$('.namecard_overlay').show();
	} else {
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
NEGOTIATION.buttonShowNameCard = function (staffType, staffId, clientId) {

	// 自分のデータを取得
	//	var staffType = $('#staff_type').val();
	//	var staffId = $('#staff_id').val();
	//	var clientId = $('#client_id').val();

	// 名刺表示イベントを送信する
	var data = {
		command: "NAME_CARD",
		type: "SHOW_NAME_CARD",
		staff_type: staffType,
		staff_id: staffId,
		client_id: clientId
	};
	// 接続している全員にメッセージを送信する
	sendCommand(SEND_TARGET_ALL, data);
};

/**
 * 接続者全員に名刺を非表示するイベント処理
 */
NEGOTIATION.buttonHideNameCard = function () {
	// 名刺表示イベントを送信する
	var data = {
		command: "NAME_CARD",
		type: "HIDE_NAME_CARD"
	};
	// 接続している全員にメッセージを送信する
	sendCommand(SEND_TARGET_ALL, data);
};

/**
 * 共有メモの押下イベント
 */
NEGOTIATION.buttonShareMemo = function () {
	// 商談がまだ終わってなければ
	if (!NEGOTIATION.isNegotiationFinish) {
		$('#share_memo_area').toggle();
		var data = {
			command: "SHARE_MEMO",
			type: "TOGGLE_SHARE_MEMO",
			display: $("#share_memo_area").css('display')
		};
		sendCommand(SEND_TARGET_ALL, data);
	}
};


NEGOTIATION.buttonWhiteBoard = function () {
	// 商談がまだ終わってなければ
	if (!NEGOTIATION.isNegotiationFinish) {
		$('#white_board_area').toggle();
		var data = {
			command: "WHITE_BOARD",
			type: "TOGGLE_WHITE_BOARD",
			display: $("#white_board_area").css('display')
		};
		sendCommand(SEND_TARGET_ALL, data);
	}
};

/** チャット画面 */
function completeFunc() {
	if ($(this).is(':visible')) {
		// 表示完了
		console.log("OffFunc");

		var data = {
			command: "CHAT_BOARD",
			type: "TOGGLE_CHAT_BOARD",
			display: $("#chat_board_area").css('display')
		};
		sendCommand(SEND_TARGET_ALL, data);

		// 初回表示するボード高さを計算する()
		if (mChatBoardDsp == false) {
			var getHeight = $('#fit_rate').height();
			var getTop = parseInt($('.chat_board_area').css('top'));
			getTop += 10;
			getHeight -= getTop;
			$('.chat_board_area').css('height', getHeight);

			//var h = Math.max.apply( null, [document.body.clientHeight , document.body.scrollHeight, document.documentElement.scrollHeight, document.documentElement.clientHeight] );
			//console.log('size=('+ h +')');// hed:50 botm:50
			//h = h-(52+50+20);	// ヘッダ(50px)/フッタ(50px)分減らす
			//		$('.chat_board_area').css('height',h);

			// サイズが変更されている場合
			var data = {
				command: "CHAT_BOARD",
				type: "CHANGE_CHAT_BOARD_SIZE",
				height: $(this).css('height'),
				width: $(this).css("width")
			};
			sendCommand(SEND_TARGET_ALL, data);
		}

		// 一番下までスクロールする
		var timeline = $(".chat_board_timeline").height();
		var message = $(".chat_board_messages").height();
		if (timeline < message) {
			if (!$('#chat_board_messages').hasClass('chat_board_messages_scroll')) {
				$('#chat_board_messages').addClass('chat_board_messages_scroll');
				$('#chat_board_messages').removeClass('chat_board_messages');
			}
		}
		$('.chat_board_timeline').animate({ scrollTop: $('.chat_board_timeline')[0].scrollHeight }, 'fast');

		// // メニューを閉じるために疑似クリックを発生させる
		// $("div#negotiation_right_menu_button").trigger('click');

		mChatBoardDsp = true;
	} else {
		// 非表示完了
		console.log("OnFunc");

		var data = {
			command: "CHAT_BOARD",
			type: "TOGGLE_CHAT_BOARD",
			display: $("#chat_board_area").css('display')
		};
		sendCommand(SEND_TARGET_ALL, data);

		// // メニューを閉じるために疑似クリックを発生させる
		// $("div#negotiation_right_menu_button").trigger('click');
	}
}
/**
 * チャットボードの押下イベント
 */
NEGOTIATION.chatBoard = function () {
	// 商談がまだ終わってなければ
	if (!NEGOTIATION.isNegotiationFinish) {
		$('#chat_board_area').toggle(completeFunc);
	}
};

/**
 * 再接続ボタン押下イベント
 */
NEGOTIATION.buttonReconnect = function () {
	if (!navigator.onLine) {
		return;
	}

	if (NEGOTIATION.mIsScreenOn) {
		createModalOkDialog("お知らせ", "画面共有中は表示できません");
	}

	else {

	// 再接続時のモーダル表示、非表示
	$(function () {
		// モーダル表示
		$('#reconnect_modal-content').fadeIn();

		// モーダル非表示 + 再接続キャンセル処理
		$('.reconnect_cancel').click(function(){
			$('#reconnect_modal-content').fadeOut();
			mNegotiationMainReconnectDialogId = null;
		});
	});

	// 再接続処理
	$('.reconnect_button').click(function(){
		var successCallback = function(data, textStatus, XMLHttpRequest) {
			if ("1" == data.result) {
				//
				// 再接続時入室時間は更新しない
				// $('#enter_negotiation_datetime').val(data.datetime);
			}
		};
		var completeCallback = function(XMLHttpRequest, textStatus) {
			// 画面更新せずに再接続
			sendReconnectStart();
			mNegotiationMain.reconnect();
			viewThumbnail();
			mNegotiationMainReconnectDialogId = null;
		};
		getServerDatetime(
			successCallback,
			null,
			completeCallback
		);
		$('#reconnect_modal-content').fadeOut();
	})
	if (NEGOTIATION.isOperator) {
			$('#negotiation_right_menu').attr('class', "mi_select_action");
			$('#negotiation_right_menu_button_list').hide();
		}
	}
};

/**
 *電子契約の押下イベント
 */
NEGOTIATION.buttonEContract = function () {
	// 商談がまだ終わってなければ
	if (!NEGOTIATION.isNegotiationFinish) {
		$('#e_contract_area').toggle();
		if ($('#e_contract_area').css('display')  == 'block') {
			$('#e_contract_area').addClass("owner");
		} else {
			$('#e_contract_area').removeClass("owner");
		}

		var partner = $("#partner-area").find('.partner_setting_input_area');

		var lastname = [];
		var firstname = [];
		var organization_name = [];
		var title = [];
		var email = [];
		$('.partner_setting_item').each(function(i, partner) {
			lastname[i] = $(partner).find('.partner_setting_input_name.lastname').val();
			firstname[i] = $(partner).find('.partner_setting_input_name.firstname').val();
			organization_name[i] = $(partner).find('.partner_setting_input.organization_name').val();
			title[i] = $(partner).find('.partner_setting_input.title').val();
			email[i] = $(partner).find('.partner_setting_input.email').val();
		});

		try {
			JSON.stringify(partner);
		} catch (e) {
			var context = {
				location:partner.context.location
			};
			var prevObject = {
				context: context,
				selector:partner.prevObject.selector
			};
			var newPartner = {
				prevObject:prevObject,
				context:context,
				selector:partner.selector
			};
			partner = newPartner;
		}

		var data = {
			command: "E_CONTRACT",
			type: "TOGGLE_E_CONTRACT",
			display: $("#e_contract_area").css('display'),

			id:                     $('#caseId').val(),
			client_id:              $('#client_id').val(),
			staff_type:             $('#staff_type').val(),
			staff_id:               $('#staff_id').val(),
			case_title:             $('#case_title').val(),
			e_contract_document_id: $('#e_contract_document_id option:selected').val(),
			have_amount:            $('#have_amount:checked').val(),
			amount:                 $('#amount').val(),
			agreement_date:         $('#agreement_date').val(),
			effective_date:         $('#effective_date').val(),
			expire_date:            $('#expire_date').val(),
			auto_renewal:           $('#auto_renewal:checked').val(),
			management_number:      $('#management_number').val(),
			comment:                $('#comment').val(),
			partner:				partner,
			lastname:               lastname,
			firstname:              firstname,
			organization_name:      organization_name,
			title:                  title,
			email:                  email,
		};
		sendCommand(SEND_TARGET_ALL, data);
	}

	// メニューを閉じるために疑似クリックを発生させる
	$("div#negotiation_right_menu_button").trigger('click');
};

/**
 * 渡された配列の通し番号だけ表示トグルして、後は全部HIDEする
 */
function swapToggleHide(domArray, targetNum) {
	var count = 0;
	var viewCount = 0;

	// 各ドム表示切り替え
	$.each(domArray, function () {
		if (count == targetNum) {
			this.toggle();
		}

		if (this.isShow()) {
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
	}).done(function (res) {
		negotiationResultTmpl = JSON.parse(res);
		$("#modal-content").show();
		// モーダル内のタグを削除する
		$("div.inner-wrap", "#modal-content").empty();
		// テンプレート生成
		var template = Handlebars.compile($('#noti-modal-template').html());
		$('div.inner-wrap', "#modal-content").append(template({
			"tmplList": negotiationResultTmpl,
		}));

		// 資料ダウンロードURLエリアを　新録画方式・iPadPC・Chromebookの場合に非表示にする
		if ((!$('#button_record').length || $('#button_record').css('display') == 'none') || USER_PARAM_IS_IPAD_PC) {
			$('.download_url_wrapper').css('display', 'none');
		} else {
			$('.download_url_wrapper').css('display', '');
		}

		// 共有メモを設定する
		$("[name=sharing_memo]").val($(".share_memo_text").val());

		// チャットを設定する
                var resultLines = "";
	        var messages = sessionStorage.getItem('chat_messages');
		if(messages === null){
		    messages = "";
		}
	        var chat_message = messages.split(/\n/);
                for(var iCnt = 0; iCnt < chat_message.length; iCnt++){
		    var messageTrim = chat_message[iCnt];
		    var messageResult = "";
		    var parser = new DOMParser();
		    var doc = parser.parseFromString(messageTrim, "text/html");
                    var parseData = doc.querySelectorAll("div");
                    for(pd of parseData){
                        messageResult = messageResult + " " + pd.textContent + "\n";
                    }
		    liSeparator = messageTrim.indexOf("]");
		    var chat_user_name = messageTrim.substring(1, liSeparator);
		    if(chat_user_name !== "" || messageResult !== ""){
	                resultLines = resultLines + "[" + chat_user_name + "]" + "\n" + messageResult;
	            }
	        }
	        $("[name=chat_contents]").val(resultLines);

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

		// MEMO.
		// 参加者名を記録する ゲストの名前(待合室での命名含む)を sessionで保持している頃に実装.
		// そのユーザに聞き名前を解決するしかない為、記録者が「全員を見送り最後に退室する」と 名前がわからなくなってしまう為、
		// 参加者全員の名前を記録するのは見送られた. DBの「ルーム名簿テーブル」に、各ユーザの名前を記録する拡張を行ってから 完全なものの実装依頼が発生するかもしれない.
		$("[id=nego_room_member]").val($("#operator_name").val()); // 自分の名前を参加者として記録する.

		//!消さないこと！！
		//negotiationFinishOperator();
	}).fail(function (res) {
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
	console.log('micOff_showNegotiationFinishDialogUser');
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

$('#button_debug').click(function () {

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
$(document).on('click', 'div.meetin_room_label', function () {
	if (getBrowserType() == 'IE') {
		var meetin_room_url = location.protocol + "//" + location.host + "/room/" + $("#meetin_room_name").text();
		window.clipboardData.setData('text', meetin_room_url);
		$('.copy_room_url_tooltip').tooltipster('open');
		setTimeout(function () {
			$(".copy_room_url_tooltip").tooltipster('close');
		}, 1500);
	} else {
		document.addEventListener('copy', function (event) {
			event.preventDefault();
			var meetin_room_url = location.protocol + "//" + location.host + "/room/" + $("#meetin_room_name").text();
			event.clipboardData.setData('text', meetin_room_url);
			$('.copy_room_url_tooltip').tooltipster('open');
			setTimeout(function () {
				$(".copy_room_url_tooltip").tooltipster('close');
			}, 1500);
		}, { once: true });
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
function getClientList(free_word) {
	//クライアント一覧取得＆画面表示
	var jqxhr = $.ajax({
		type: "POST",
		url: "https://" + location.host + "/client/get-list",
		data: {
			free_word: free_word
		}
	})
		.done(function (data, status, xhr) {
			//console.log(data);
			var parsed = JSON.parse(data);
			console.log(parsed);
			var stored_client_id = $.cookie()['client_id'];

			var tabledata = "";
			for (var i = 0; i < parsed.list.length; i++) {
				var client_id = parsed.list[i]["client_id"];

				tabledata += "<tr>";
				tabledata += "<td class=\"mi_table_item_1\">";// + String(i+1) +"\">";//連番じゃなくて常に１だった
				tabledata += "<label class=\"radio-client-container\">";

				tabledata += "<input type=\"radio\" name=\"client_id\" value=\"" + parsed.list[i]["client_id"] + "\"";//></td>";
				tabledata += " client_name=\"" + parsed.list[i]["client_name"] + "\"";// ></td>";

				if (stored_client_id == client_id) {
					tabledata += " checked=\"true\"";
				}
				tabledata += " >";
				tabledata += "<span class=\"checkmark\"></span>";
				tabledata += "</label>";
				tabledata += "</td>";
				tabledata += "<td>CA" + ('00000' + parsed.list[i]["client_id"]).slice(-5) + "</td>";
				tabledata += "<td>" + parsed.list[i]["client_name"] + "</td>";
				tabledata += "</tr>";
			}
			//		console.log(tabledata);
			//alert( data );
			$("#client_table_body").html(tabledata);
		})
		.fail(function (xhr, status, error) {
			//ajax error
			alert("error:" + error);
		})
		.always(function (arg1, status, arg2) {
			//なにもしない
		});

};

//クライアント選択クリック
$(".client_dialog_open").click(function () {
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
			open: function () {
				$(this).dialog('widget')
					.removeClass('ui-corner-all')
					.css('background', 'white')
					.css('border', '0')
					.css('border-radius','6px')

				$("#setting-client-dialog").height(420);
			}
		});

	$('.ui-widget-overlay').addClass('setting-client-dialog-overlay');
	$('.ui-dialog-titlebar').hide();
	getClientList("");
});

// クライアント設定ダイアログを閉じる
$(document).on('click', '[id=setting-client-dialog-cancel-button]', function () {
	if ($("[name='client_id']").filter(":checked").length <= 0 || $.cookie()['client_id'] == 0) {
		alert("クライアントを選択してください。");
		return;
	}

	$("#setting-client-dialog").dialog("close");
});

// クライアント選択ボタンクリック
$(document).on('click', '[id=setting-client-dialog-enter-button]', function () {
	var selelem = $("[name='client_id']").filter(":checked");
	var client_id = $("[name='client_id']").filter(":checked").attr("value");

	//クライアントが選択されていない場合は表示を続ける
	if (client_id == null) return;

	//すでに選択済みで同一選択の場合閉じて終了
	if ($.cookie()['client_id'] == client_id) {
		$("#setting-client-dialog").dialog("close");
		return;
	}

	var jqxhr = $.ajax({
		type: "POST",
		url: "https://" + location.host + "/client/change",
		data: {
			"client_id": client_id
		}
	})
		.done(function (data, status, xhr) {
			var parsedData = JSON.parse(data);
			// 共有タグ変更
			$("#header_clientname").text($("[name='client_id']").filter(":checked").attr("client_name"));
			$('#client_id').val(client_id);
			$('#plan_this_month').val(parsedData["plan_this_month"]);

			// クッキー設定
			$.cookie("client_id", client_id, { path: '/' });

			// ログイン情報を全ての接続先へ送信する
			// #user_id / #client_id / #staff_type / #staff_id
			sendLogin();

			// 名刺表示
			// ユーザタイプが存在したらログインとし名刺表示メニューを表示する
			var user_id = $("#user_id").val();;
			if ($("#target_video_staff_type_" + user_id).val()) {
				$("#video_target_icon_" + user_id).find('.video_card_icon').show();	// 名刺アイコン表示

				// 録画ボタン表示
				// $("#button_record").css('visibility', 'visible');
				if (parsedData["record_method_type"] == '0' && !USER_PARAM_IS_IPAD_PC) {
					// Google拡張機能型
					$("#button_record").css('display', '');
					//録画ボタン位置調整及び録画関連ツールチップ
					$("#button_record").addClass('mi_header_status');
					$(".not_login_gear_icon_wrap").addClass('login_gear_icon_wrap');
					$(".login_gear_icon_wrap").removeClass('not_login_gear_icon_wrap');
					adjustDownloadMentionTooltipPosition();
				} 
				else {
					// API利用型
					setRecordApiInRoomLogin();
				}
				// Lockボタン表示 // おそらくid="lock_button"はもうない
				$("#lock_button").css('visibility', 'visible');
			}

			$("#modal-content-client").hide();

			//////////////////////////////////////////
			//ログイン後の初期設定
			$('#is_operator').val(1);
			NEGOTIATION.isOperator = true;
			//クライアント名設定
			$('#client_name').val(parsedData["client_name"]);

			// 資料サムネイル再表示
			viewThumbnail();
			var staffRole = $('#staff_role').val();
			if (staffRole == "AA_1") {
				$("#show_material_modal").show();
			}

			$("#button_secret_memo").show();
			$("#direct_sms_send_in_room").show();
			// ========================================================
			// シークレットメモの同期処理を行うための処理
			// ========================================================
			var secretMemo = sessionStorage.getItem("secretMemo");
			if (secretMemo) {
				// ストレージにデータが存在すれば設定する
				$("textarea.secret_memo_text").val(secretMemo);
			}
			/****************************************/

			// 招待文・SMSテンプレートの設定
			sendMessage = getMessageTemplate();

			$("#setting-client-dialog").dialog("close");

			adjustCameraOnOffTooltip() 
		})
		.fail(function (xhr, status, error) {
			//ajax error
			console.log(error);
		})
		.always(function (arg1, status, arg2) {
			//なにもしない
		});

});

// クライアント一覧検索取得
$(document).on('click', '[id=client-dialog-search]', function () {
	var id = $.cookie()['client_id'];
	//alert("search click");
	getClientList($("#client_search_keyword").val());
});


/*
// 再接続
$(document).on('click', '[id=button_reconnect]', function(){
	NEGOTIATION.buttonReconnect();
});
*/

// cookie削除
function clearCookie() {
	$.cookie('staff_type', "", { path: "/", expires: -1 });
	$.cookie('staff_id', "", { path: "/", expires: -1 });
	$.cookie('client_id', "", { path: "/", expires: -1 });
}

// ルームを共有
$(document).on('click', '[id=button_room_share]', function () {
	//	console.log('click button_room_share');
	$("#modal-content").show();

	$(".mi_modal_shadow").css('background', 'rgba(0, 0, 0)');

	// モーダル内のタグを削除する
	$("div.inner-wrap", "#modal-content").empty();
	// テンプレート生成
	var template = Handlebars.compile($('#room-share-modal-template').html());
	$('div.inner-wrap', "#modal-content").append(template());
	
	if ($('#is_operator').val() === '1' && !$('.negotiation_modal_roomshare #sms_send_in_room').length) {
		// ルーム内ログイン用 SMS送信ボタンを追加して表示する
		$('.negotiation_modal_roomshare #copy_sentence_in_room').after(
				'<button type="button" id="sms_send_in_room" class="sms_send_btn_in_room">'
				+ '<span class="copy_btn_inner"><img src="/img/lp/ico-sms-in-room.svg">SMS送信</span>'
			+ '</button>'
		);
		$('#sms_send_in_room').css('margin-left', '4px'); // スタイル微調整
	}

	// モーダルを表示する為のクリックイベントを発生させる
	$('.modal-open').trigger("click");
	// メニューを閉じるために疑似クリックを発生させる
	$("div#negotiation_right_menu_button").trigger('click');

	 // ipad PC スタイル調整
	if (USER_PARAM_IS_IPAD_PC) {
		if (Math.abs(window.orientation) !== 90) {
			$('.room_copy_btn_in_room').css('width', '182px');
			$('.sms_send_btn_in_room').css('width', '182px');
		} else {
			$('.room_copy_btn_in_room').css('width', '170px');
			$('.sms_send_btn_in_room').css('width', '170px');
		}
	}
});

// 閉じるボタンクリック
$(document).on('click', '[id=room-share-close]', function () {
	$("#modal-content").hide();
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
				if(data.length == undefined) {
					data = [data];
				}
				data.filter(e=> e.status == WANT_ENTER_LOCKED_ROOM_STATUS.RESPONSE_WAIT)
				.map(e=>{

					let exist = document.querySelector('.tooltip-enter-locked-room[data-locked_token="'+e.locked_token+'"]');
					if(exist == null) {
						wa.loadFile("/webrtc/sounds/raise-hands-bell.wav", function(buffer) {
							wa.play(buffer);
						});
					} else {
						// 入室要請の取り下げがある場合 それを消す.
						if(exitRequestEnterLockedRoomCancelHtml(e.locked_token)) {
							clearRequestEnterLockedRoomHtml(e.locked_token);
						}
					}

					if(parseInt($('#room_members').text()) < parseInt($("#connectMaxCount").val())) {
						if(exitRequestEnterLockedRoomOverCapacityHtml(e.locked_token)) {
							clearRequestEnterLockedRoomHtml(e.locked_token);
						}
						if(!exitRequestEnterLockedRoomHtml(e.locked_token)) {
							$("#mi_right_tooltip").append(formatRequestEnterLockedRoomHtml(e.user_name, e.locked_token));
						}
					} else {
						if(exitRequestEnterLockedRoomHtml(e.locked_token)) {
							clearRequestEnterLockedRoomHtml(e.locked_token);
						}
						if(!exitRequestEnterLockedRoomOverCapacityHtml(e.locked_token)) {
							$("#mi_right_tooltip").append(formatRequestEnterLockedRoomOverCapacityHtml(e.user_name, e.locked_token));
						}
					}

				});
				data.filter(e=> e.status == WANT_ENTER_LOCKED_ROOM_STATUS.REQUEST_CANCEL)
				.map(e=>{
					// MEMO. 複数ツールチップが存在する可能性から要請の取り下げは一番最後に並べる為に随時作り直して最後に回す.
					let exist = document.querySelector('.tooltip-enter-locked-room[data-locked_token="'+e.locked_token+'"]');
					if(exist !== null) {
						clearRequestEnterLockedRoomHtml(e.locked_token);
					}
					$("#mi_right_tooltip").append(formatRequestEnterLockedRoomCancelHtml(e.user_name, e.locked_token));
				});

			}
		}
	});
}
function formatRequestEnterLockedRoomHtml(user_name, locked_token) {
	return `
					<div class="tooltip-enter-locked-room" data-locked_token="${locked_token}" data-type="1">
						<div class="message">${user_name}さんが入室しようとしています</div>
						<div class="btn-area">
							<button type="button" class="btn-permission" onclick="requestEnterLockedRoomRejection(this)">拒否</button>
							<button type="button" class="btn-rejection" onclick="requestEnterLockedRoomPermission(this)">許可</button>
						</div>
					</div>`;
}
function exitRequestEnterLockedRoomHtml(locked_token) {
	return document.querySelector('.tooltip-enter-locked-room[data-locked_token="'+locked_token+'"][data-type="1"]') !== null;
}
function formatRequestEnterLockedRoomOverCapacityHtml(user_name, locked_token) {
	return `
					<div class="tooltip-enter-locked-room double_size" data-locked_token="${locked_token}" data-type="2">
						<div class="message">${user_name}さんが入室しようとしています<br>※参加人数が上限に達しています</div>
						<div class="btn-area">
							<button type="button" class="btn-permission" onclick="requestEnterLockedRoomRejection(this)">拒否</button>
						</div>
					</div>`;
}
function exitRequestEnterLockedRoomOverCapacityHtml(locked_token) {
	return document.querySelector('.tooltip-enter-locked-room[data-locked_token="'+locked_token+'"][data-type="2"]') !== null;
}
function formatRequestEnterLockedRoomCancelHtml(user_name, locked_token) {
	return `
					<div class="tooltip-enter-locked-room double_size" data-locked_token="${locked_token}" data-type="5">
						<div class="message">${user_name}さんがキャンセルしました。</div>
						<div class="btn-area">
							<button type="button" class="btn-permission" onclick="setRemoveRequestEnterLockedRoom('${locked_token}')">閉じる</button>
						</div>
					</div>`;
}
function exitRequestEnterLockedRoomCancelHtml(locked_token) {
	return document.querySelector('.tooltip-enter-locked-room[data-locked_token="'+locked_token+'"][data-type="5"]') !== null;
}


function clearRequestEnterLockedRoomHtml(locked_token) {
	document.querySelector('.tooltip-enter-locked-room[data-locked_token="'+locked_token+'"]').remove();
}
function requestEnterLockedRoomPermission(e) {
	let locked_token = e.closest(".tooltip-enter-locked-room").dataset.locked_token;
	setRequestEnterLockedRoom(locked_token, WANT_ENTER_LOCKED_ROOM_STATUS.REQUEST_APPROVAL, ()=> {
		clearRequestEnterLockedRoomHtml(locked_token);
		sendEnterLockedRoomResult(locked_token);
	});
}
function requestEnterLockedRoomRejection(e) {
	let locked_token = e.closest(".tooltip-enter-locked-room").dataset.locked_token;
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

function setRemoveRequestEnterLockedRoom(locked_token) {
	$.ajax({
		url: '/negotiation/request-remove-locked-room',
		type: "POST",
		dataType: 'json',
		data: {
			connection_info_id: $("#connection_info_id").val(),
			locked_token: locked_token,
		},
		success: function (res) {
			clearRequestEnterLockedRoomHtml(locked_token);
		}
	});
}


// デスクトップ通知の許可処理
$(function () {
	if ("Notification" in window) {
		var permission = Notification.permission;

		if (permission === "denied" || permission === "granted") {
			return;
		}
		Notification.requestPermission(function (result) {
			if (result === 'denied') {
			} else if (result === 'default') {
			}
		});
	}
});

/* 画面キャプチャ用の処理 */
$(function () {

	if (getBrowserType() != 'Chrome') {
	} else {
		var imgWidth = 1920;
		var imgHeight = 0;
		var video = null;
		var canvas = null;
		var mScreenCaptureStream = null;
		var ScreenCaptureTimeout = null;
		var mNotification = null;
		var mScreenCapture = new MeetinExt.ScreenCapture({ debug: false });

		var paddingZero = function (n, digit) {
			var _zero = Array(digit + 1).join("0");
			return (_zero + n).slice(-digit);
		};
		var SaveScreenCaptureProc = function (stream, video, canvas) {
			var ctx = canvas.getContext('2d');
			ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
			var imgData = canvas.toDataURL('image/png');
			// 資料アップロードと同じプロセス
			$("div.upload_document_message").text("アップロード中です");
			$("div.upload_document_message_area").show();
			// 他のユーザーに資料アップロード開始を通知する
			var data = {
				command: "DOCUMENT",
				type: "UPLOAD_DOCUMENT_BEGIN"
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
			if (!uuId) {	// 空
				uuId = UUID.generate();
				localStorage.UUID = uuId;
			}
			// 資料としてアップロード
			$.ajax({
				url: "https://" + location.host + "/negotiation/upload-material",
				type: "POST",
				data: { filename: "captured_" + ymdhms + ".png", filedata: imgData, staff_type: staffType, staff_id: staffId, client_id: clientId },
				success: function (resultJson) {
					// jsonをオブジェクトに変換
					var result = $.parseJSON(resultJson);
					var resultMaterialId = 0;
					if (result["status"] == 1) {
						// 資料IDの設定
						resultMaterialId = result["material_basic"]["material_id"];
						// アップロードした資料を1件読み直す
						getMaterial(resultMaterialId, $('#user_id').val(), staffType, staffId, clientId, uuId);
						// ファイル読み込みメッセージを表示する
						$("div.upload_document_message").text("アップロード完了しました");
					} else {
						$("div.upload_document_message").text("アップロード失敗しました");
					}
					// 他のユーザーに資料アップロード終了を通知する
					// UPしたユーザのUUID追加
					var data = {
						command: "DOCUMENT",
						type: "UPLOAD_DOCUMENT_END",
						resultMaterialId: resultMaterialId,
						registUserId: $('#user_id').val(),
						staff_type: staffType,
						staff_id: staffId,
						client_id: clientId,
						uu_id: uuId
					};
					sendCommand(SEND_TARGET_ALL, data);
					// アップロードメッセージを消すためのタイマーを設定
					setTimeout(function () {
						$("div.upload_document_message_area").hide();
					}, 2000);
					// tooltip表示
					$('.material_button_tooltip').tooltipster('open');
					// アップロードメッセージを消すためのタイマーを設定
					setTimeout(function () {
						$('.material_button_tooltip').tooltipster('close');
					}, 2000);
				}
			});
		}

		var OnClickCallback = function (event) {
			if (ScreenCaptureTimeout) {
				clearTimeout(ScreenCaptureTimeout);
				ScreenCaptureTimeout = null;
			}
			if (mNotification) {
				mNotification.close();
				mNotification = null;;
			}

			// 非表示キャンバスに設定
			if (mScreenCaptureStream && canvas && video && !screenCaptureCancelFlg) {
				// 画面をキャプチャして資料としてアップロードする(screenCaptureCancelFlgがtrueのときは、アップロードしない)
				SaveScreenCaptureProc(mScreenCaptureStream, video, canvas)
			}

			// キャプチャを停止する
			mScreenCapture.stopScreenCapture();
			if (mScreenCaptureStream) {
				mScreenCaptureStream.getTracks().forEach(function (track) {
					track.stop();
				});
				mScreenCaptureStream = null;
			}
		}

		var OnCloseCallback = function (event) {
			if (ScreenCaptureTimeout) {
				clearTimeout(ScreenCaptureTimeout);
				ScreenCaptureTimeout = null;
			}

			if (mNotification) {
				mNotification.close();
				mNotification = null;;
			}

			if (canvas) {
				canvas = null;
			}
			if (video) {
				video = null;
			}
			// キャプチャを停止する
			mScreenCapture.stopScreenCapture();
			if (mScreenCaptureStream) {
				mScreenCaptureStream.getTracks().forEach(function (track) {
					track.stop();
				});
				mScreenCaptureStream = null;
			}
		}

		// 画面下部の「共有を停止する」押下時の値を格納する変数の初期値。
		let screenCaptureCancelFlg = false;

		var ScreenCaptureSuccessCallback = function (stream, _paramsCb) {
			mScreenCaptureStream = stream;

			// 画面下部の「共有を停止する」を押下した場合にキャンセルフラグをtrueにして、画像アップロードしないようにする。
			stream.getTracks()[0].addEventListener('ended', function() {
				screenCaptureCancelFlg = true;
				mScreenCaptureStream = null;
				// 通知を消す
				if (mNotification) {
					mNotification.close();
					mNotification = null;
				}
			});

			// 非表示キャンバスに設定
			video = document.getElementById("video_capture_screen");
			canvas = document.getElementById("canvas_capture_screen");
			var _delayTimer = 1000;	// 即時(0)だと真っ白の画面がキャプチャされるため、少し遅らせて実行している

			if (_paramsCb && _paramsCb.delayTimer >= 0) {
				_delayTimer = _paramsCb.delayTimer * 1000;
			}

			if (video && canvas) {
				video.addEventListener('canplay', function (ev) {
					imgHeight = video.videoHeight / (video.videoWidth / imgWidth);
					video.setAttribute('width', imgWidth);
					video.setAttribute('height', imgHeight);
					canvas.setAttribute('width', imgWidth);
					canvas.setAttribute('height', imgHeight);
				}, false);
				video = attachMediaStream(video, stream);
			
				// 待ち時間がある場合に、通知をだす（2021.11.18以前は通知を出す仕様だった）
				if (1000 < _delayTimer) {
					// 通知(Notification)メッセージ表示
					var body = "本通知メッセージをクリックするとキャプチャを実行します。\n尚" + delayTimerCountdown + "秒経過すると自動でキャプチャされます。\n\n";
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
				}

				// n秒後に画像データを取得
				ScreenCaptureTimeout = setTimeout(function () {
					if (mNotification) {
						mNotification.close();
						mNotification = null;
					}
					if (mScreenCaptureStream && canvas && video && !screenCaptureCancelFlg) {
						// 画面をキャプチャして資料としてアップロードする　(screenCaptureCancelFlgがtrueのときは、アップロードしない)
						SaveScreenCaptureProc(mScreenCaptureStream, video, canvas)
					}
					// キャプチャを停止する
					mScreenCapture.stopScreenCapture();
					if (mScreenCaptureStream) {
						mScreenCaptureStream.getTracks().forEach(function (track) {
							track.stop();
						});
						mScreenCaptureStream = null;
					}
				}, _delayTimer);
			}
		};

		var ScreenCaptureErrorCallback = function (error) {
			//		console.log('ScreenCaptureErrorCallback' + JSON.stringify(error));
			mScreenCapture.stopScreenCapture();
		};
		var ScreenCaptureOnEndedEventCallback = function () {
			mScreenCapture.stopScreenCapture();
			screenCaptureCancelFlg = false;
		};
		//	var mScreenCapture = new MeetinExt.ScreenCapture({debug: false}); // google extension使用時に動いていた箇所　ここから
		window.addEventListener('message', function (ev) {
			if (ev.data.type === "ScreenCaptureExtentionInjected") {
				//console.log('screen share extension is injected, get ready to use');
				//     startScreenShare();
			}
		}, false);
		// extension未インストール時にインストール推奨ツールチップを表示する
		var noInstalledScreenCaptureExtentionProc = function () {
			$('.screencapture_button_tooltip').tooltipster('open');
		};
		// ここまで

		$(document).on('click', '#button_capture_screen', function () {

			// 画面キャプチャを起動したものをトリガーにするためにajax通信
			$.ajax({
				url:'/setting-log/get-screen-capture-log',
				type:'post',
				dataType:'json',
			});
			// 画面共有中は表示しない
			if (NEGOTIATION.mIsScreenOn) {
				createModalOkDialog("お知らせ", "画面共有中は表示できません");
			}
			else {
				try {
					const mediaStream = navigator.mediaDevices.getDisplayMedia({
						width: 1920,
						height: 1080,
						frameRate: 10
					}).then(function(stream) {
						ScreenCaptureSuccessCallback(stream);
					}).catch(function(error) {
						console.log('Error in getDeviceMedia', error);
						let showModal = false;
						let alertMess = "";
						if (platform.os.family.toLowerCase().indexOf('os x') != -1) {
							let eMessage = error.toString();
							// 共有ボタンを押下した時のみ表示させる
							if (eMessage.indexOf('Permission denied by system') != -1) {
								alertMess = `システム環境設定で画面収録が<br>有効になっていない可能性があります。<br>有効にする方法は<a href="https://manual.meet-in.jp/?p=575" target="_blank" rel="noopener noreferrer" style="text-decoration:underline;">こちら</a>`;
								showModal = true;
							}
						}
						if(showModal) {
							makeDefaultAlertDialog("", alertMess, {z_index:100000020});
							$('#mi_alert_dialog_background').css({
								background: "rgba(0,0,0,0.6)"
							})
							$('#mi_alert_dialog_area').css({
								width: "484px",
								height: "218px",
								padding: "0"
							})
							$('#mi_alert_dialog_content').css({
								margin: "30px auto",
								textAlign: "center",
								fontSize: "18px"
							})
						}
						ScreenCaptureErrorCallback(error);
					}).finally(function() {
						ScreenCaptureOnEndedEventCallback();
					});

				} catch (e) {
					console.log('Unable to acquire screen capture:' + e);
				}

			}
		});

	}
});

//ウインドウがリサイズされた際に、ヘッダ内要素のcssを調整する
// window.addEventListener('resize', function() {
// 	const browserWidth = $(window).width();
// 	if(browserWidth < 1225){
// 		$('.negotiation_button_area').css("padding-right","40px");
// 		$('.view_only_control_contents').css("min-width","1155px");
// 	}else{
// 		$('.negotiation_button_area').css("padding-right","0px");
// 	}
// }, false);


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