<!DOCTYPE html>
<html>
<head>
{literal}
	<!-- Global site tag (gtag.js) - Google Analytics -->
	<script async src="https://www.googletagmanager.com/gtag/js?id=UA-48144639-6"></script>
	<script>
	  window.dataLayer = window.dataLayer || [];
	  function gtag(){dataLayer.push(arguments);}
	  gtag('js', new Date());
	  gtag('config', 'UA-48144639-6');
	</script>
{/literal}
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>ミーティング</title>
<meta charset="utf-8">
<meta name="description" content="">
<meta name="author" content="">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<link rel="shortcut icon" href="">
<link rel="stylesheet" href="/css/reset.css?{$application_version}">
<link rel="stylesheet" href="/css/sp/meeting.css?{$application_version}">
<link rel="stylesheet" href="/css/sp/button.css?{$application_version}">
<link rel="stylesheet" href="/css/chat_board.css?{$application_version}">
<link rel="stylesheet" href="/css/fonts.css?{$application_version}">
<script type="text/javascript" src="/js/jquery-1.11.2.min.js"></script>
<script type="text/javascript" src="https://code.jquery.com/ui/1.11.4/jquery-ui.min.js"></script>
<script type="text/javascript" src="/js/sp/negotiation/meeting.js?{$application_version}"></script>

<!-- web移植 -->
<script src="/js/jquery-1.11.2.min.js?{$application_version}"></script>
<script src="/js/jquery-ui.min.js?{$application_version}"></script>
<script src="/js/jquery.ui.touch-punch.min.js?{$application_version}"></script>
<script src="/js/jquery.cookie.js?{$application_version}"></script>
<script src="/js/tooltipster.bundle.min.js?{$application_version}"></script>
<script src="/js/common.js?{$application_version}"></script>
<script src="/js/design.js?{$application_version}"></script>
<script src="/js/uuid.js?{$application_version}"></script>
<script src="/src/handlebars-v3.0.3.js?{$application_version}"></script>

<script src="/js/sp/negotiation/share_memo.js?{$application_version}"></script>
<script src="/js/sp/negotiation/write_line.js?{$application_version}"></script>
<script src="/js/sp/negotiation/white_board.js?{$application_version}"></script>
<script src="/js/sp/negotiation/chat_board.js?{$application_version}"></script>
<script src="/js/sp/negotiation/meetin_db.js?{$application_version}"></script>
<script src="/js/sp/negotiation/material_upload.js?{$application_version}"></script>
<script src="/js/sp/negotiation/negotiation_sync.js?{$application_version}"></script>
<script src="/js/less.min.js?{$application_version}" type="text/javascript"></script>
<script src="/js/sp/negotiation/negotiation_namecard.js?{$application_version}"></script>

</head>
<body>
	<div class="content__wrap iphonex_safe_area" id="content__wrap">
		<div class="full_screen__wrap">
			<!-- 現在のレイアウト種別を判定するための値 -->
			<input type="hidden" name="layout_type" value="icon"/>
			<div class="video_area_wrap">
				{include file="./negotiation/negotiation-target-video.tpl" video_id='0' this_id=$user_id}
				{include file="./negotiation/negotiation-target-video.tpl" video_id='1' this_id=$user_id}
				{include file="./negotiation/negotiation-target-video.tpl" video_id='2' this_id=$user_id}
				{include file="./negotiation/negotiation-target-video.tpl" video_id='3' this_id=$user_id}
				{include file="./negotiation/negotiation-target-video.tpl" video_id='4' this_id=$user_id}
				{include file="./negotiation/negotiation-target-video.tpl" video_id='5' this_id=$user_id}
				{include file="./negotiation/negotiation-share-screen.tpl"}
			</div>
		</div>
		<!-- ミーティング画面 -->
		<div id="meeting__wrap">
			<div class="meeting__header">
				<div class="meeting__header--timeWrap">
					<span class="meeting__header--timeMark"></span><span id="time"></span>
				</div>
			</div>
			<div class="meeting__menuBtn" id="meeting__menuBtn">
				<img src="/img/sp/png/transmission_logo.png" class="meeting__sidebar--btn">
			</div>
			<div class="meeting__sidebar" id="meeting__sidebar">
				<img src="/img/sp/png/front_camera.png" class="meeting__sidebar--btn" id="change_camera">
				<img src="/img/sp/png/imageupload.png" class="meeting__sidebar--btn" id="trigger_access_photos">
				<input type="file" name="access_photos" accept="image/*" id="access_photos" class="access_photos" />
				<img src="/img/sp/png/add_user.png" class="meeting__sidebar--btn" id="button_room_share">
			</div>
			<div class="meeting__footer">
				<img src="/img/sp/png/unmovie.png" class="meeting__footer--btn-v" id="button_camera">
				<img src="/img/sp/png/unmike.png" class="meeting__footer--btn-v" id="button_mic">
				<img src="/img/sp/png/newchaticon.png" class="meeting__footer--btn-v" id="button_chat_board">
				<img src="/img/sp/svg/Group4.svg" class="meeting__footer--btn-v" id="change_paint">
				<img src="/img/sp/png/done.png" class="meeting__footer--btn-v" id="sp_negotiation_finish">
			</div>
		</div>
		<!-- ミーティング画面 -->

		<!-- チャット画面 -->
		<div class="chat__wrap" id="chat__wrap">
			<div class="chat__return" id="chat__return">
				<img src="/img/sp/svg/chat_return.svg">
			</div>
			<div id="chat_board_messages" class="chat__content">
				<!-- チャットメッセージが表示される領域 -->
			</div>
			<div class="chat__footer" id="chat__footer">
				<div class="chat__addComment" id="chat__addComment">
					<img src="/img/sp/svg/add_comment.svg">
				</div>
				<div class="chat__textArea">
					<textarea id="chat_board_send_message" name="chat_board_send_message" rows="8" cols="80"></textarea>
				</div>
				<div id="send_chat_message" class="chat__addEmoji icon-menu-02 icon_send_chat_message"></div>
			</div>
		</div>
		<!-- チャット画面 END-->

		<!-- ペイント画面 -->
		<div id="white_board_area" class="chat__paint">
			<div class="paint__content">
				<div class="paint__header">
					<div class="btn_reset paint__header--undo">削除</div>
					<div class="paint__header--done" id="paint_done">完了</div>
				</div>
				<div class="paint__sideBtn">
					<div class="left_icon_highlight paint__sideBtn--img"><img src="/img/sp/svg/pen2__Icon.svg"></div>
					<div class="left_icon_pen paint__sideBtn--img"><img src="/img/sp/svg/pen1__Icon.svg"></div>
					<div class="left_icon_touch"><img src="/img/sp/svg/Shape Copy 6.svg"></div>
				</div>
				<!-- キャンバス領域 begin -->
				<div class="canvas_area not-touch-move-area">
					<canvas id="white_board" class="white_board"></canvas>
				</div>
				<!-- キャンバス領域 end -->
				<div class="paint__footer">
					<div class="color__palet">
						<div class="mi_white color__white"></div>
						<div class="mi_black color__black selected_color_frame"></div>
						<div class="mi_green color__green"></div>
						<div class="mi_yellow color__yellow"></div>
						<div class="mi_red color__red"></div>
						<div class="mi_blue color__blue"></div>
					</div>
				</div>
			</div>
		</div>
		<!-- ペイント画面 END -->

		<!-- 共有メモ画面 begin -->
		<div class="share_memo_area" id="share_memo_area">
			<div class="share_memo_close" id="share_memo_close">
				<img src="/img/sp/svg/chat_return.svg">
			</div>
			<div id="share_memo_messages" class="share_memo_messages">
				<!-- 共有メモメッセージが表示される領域 -->
				<textarea class="share_memo_text"></textarea>
			</div>
		</div>
		<!-- 共有メモ画面 end-->

		<!-- 画像表示領域全体 begin -->
		<div id="sp_document_area" class="sp_document_area">
			<div class="sp_document_content">
				<div class="sp_document_header">
					<div class="sp_document_close" id="sp_document_close">Done</div>
				</div>
				<!-- 画像表示領域 begin -->
				<div class="sp_img_document_area not-touch-move-area">
					<img src="" id="sp_img_document" name="" class="sp_img_document"/>
					<img src="" id="sp_img_canvas" name="" class="sp_img_canvas"></canvas>
				</div>
				<!-- 画像表示領域 end -->
			</div>
		</div>
		<!-- 画像表示領域全体 end -->

		<!-- コネクト begin -->
		{include file="./negotiation/loading.tpl"}
		<!-- コネクト end -->

		{include file="./negotiation/negotiation-dialog.tpl"}
		<!-- ルーム共有モーダル begin -->
		{include file="./negotiation/negotiation-room-share.tpl"}
		<!-- ルーム共有モーダル end -->

		<!-- 入室要求 start -->
		{if $is_operator == 1}
		<div id="enter_room_dialog_field">
			<div id="enter_room_dialog_background_area" class="mi_modal_shadow" style="z-index:101000000; display:none;">
			</div>
			<div id="enter_room_dialog_area">
			</div>
		</div>
		{/if}
		<!-- 入室要求 end -->

		<!-- 汎用ダイアログ start -->
		<div id="common_dialog_area">
		</div>
		<!-- 汎用ダイアログ end -->
		{include file="./negotiation/negotiation-namecard.tpl"}
	</div>


	<!-- web移植 begin -->
	<input type="hidden" id="is_operator" value="{$is_operator}"/>
	<input type="hidden" id="client_id" value="{$client_id}"/>
	<input type="hidden" id="staff_type" value="{$staff_type}"/>
	<input type="hidden" id="staff_id" value="{$staff_id}"/>
	<input type="hidden" id="connection_info_id" value="{$connection_info_id}"/>
	<input type="hidden" id="connect_no" value="{$connect_no}"/>
	<input type="hidden" id="peer_id" value="{$peer_id}"/>
	<input type="hidden" id="peer_video_id" value="{$peer_video_id}"/>
	<input type="hidden" id="peer_audio_id" value="{$peer_audio_id}"/>
	<input type="hidden" id="peer_screen_id" value="{$peer_screen_id}"/>
	<input type="hidden" id="user_id" value="{$user_id}"/>
	<input type="hidden" id="my_user_info" value="{$my_user_info}"/>
	<input type="hidden" id="operator_name" value="{$user.staff_name}"/>
	<input type="hidden" id="screen_type" value="{$screen_type}"/>
	<input type="hidden" id="wait_connect_table_string" value="{$wait_connect_table_string}"/>
	<input type="hidden" id="enter_negotiation_datetime" value="{$smarty.now|date_format:'%Y/%m/%d %H:%M:%S'}"/>
	<input type="hidden" id="video_background_image" value="{$video_background_image}"/>
	<input type="hidden" id="send_bandwidth" value="{$send_bandwidth}"/>
	<input type="hidden" id="receive_bandwidth" value="{$receive_bandwidth}"/>
	<input type="hidden" id="browser" value="{$browser}"/>
	<input type="hidden" id="isMobile" value="{$isMobile}"/>
	<input type="hidden" id="application_version" value="{$application_version}"/>
	<!-- ルーム対応 -->
	<input type="hidden" id="room_locked" value="{$room_locked}"/>
	<input type="hidden" id="document_material_id" value="{$document_material_id}"/>
	<input type="hidden" id="document_uuid" value="{$document_uuid}"/>
	<input type="hidden" id="document_user_id" value="{$document_user_id}"/>
	<input type="hidden" id="desktop_notify_flg" value="{if ($user.desktop_notify_flg == '')}1{else}{$user.desktop_notify_flg}{/if}"/>
	<!-- 名刺表示(現在表示している名刺情報) -->
	<input type="hidden" id="ShowNameCard_client_id" value="{$client_id}"/>
	<input type="hidden" id="ShowNameCard_staff_type" value="{$staff_type}"/>
	<input type="hidden" id="ShowNameCard_staff_id" value="{$staff_id}"/>
	<input type="hidden" id="Room_name" value="{$room_name}"/>
	<input type="hidden" id="Collabo_site" value="{$collabo_site}"/>
	{if $is_operator == 1}
		<input type="hidden" id="target_peer_id" value="{$target_peer_id}"/>
	{/if}
	<script type="text/javascript" src="/js/WebRTC/key.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/WebRTC/skyway.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/WebRTC/screenshare.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/WebRTC/screencapture.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/MeetinAPI.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/Utility.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/WebRTC/MeetinDefault.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/WebRTC/MeetinUtility.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/WebSocket/MeetinWebSocketManager.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/WebSocket/MeetinWebSocketProcManager.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/WebRTC/MeetinConnectionManager.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/WebRTC/MeetinMediaManager.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/WebRTC/MeetinCoreManager.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/WebRTC/MeetinRTC_tab_capture.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/flash/swfobject.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/flash/flashUtility.js?{$application_version}"></script>

	<script type="text/javascript" src="/js/sp/negotiation/negotiation_manager.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/sp/negotiation/negotiation_interface_common.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/sp/negotiation/negotiation_interface_init.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/sp/negotiation/negotiation_interface_reconnect.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/sp/negotiation/negotiation_interface_camera.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/sp/negotiation/negotiation_interface_mic.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/sp/negotiation/negotiation_interface_screen.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/sp/negotiation/negotiation_interface_command_receive.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/sp/negotiation/negotiation_interface_command_send.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/sp/negotiation/negotiation_video.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/sp/negotiation/negotiation_main.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/sp/negotiation/negotiation_event_func.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/sp/negotiation/negotiation_enter_room.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/sp/negotiation/negotiation_exit_room.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/sp/negotiation/negotiation_setting_camera.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/sp/negotiation/negotiation_extra_function.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/sp/negotiation/get_oldest_user_id.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/sp/negotiation/material.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/sp/negotiation/negotiation_login.js?{$application_version}"></script>
	<!-- web移植 end -->

	<script id="guest-end-modal-template" type="text/x-handlebars-template">
		<div class="mi_modal_default">
			<div class="mi_gest_close_mesg mi_modal_type_m">
				<p>
				本日はお忙しいところ<br>
				誠にありがとうございました。<br>
				閉じるをクリックして終了してください。
				</p>
				<div class="btn_a" align="center">
					<button type="button" name="btn_guest_end" class="mi_default_button mi_gest_close_buton hvr-fade">閉じる</button>
				</div>
			</div>
		</div>
	</script>

</body>
</html>

