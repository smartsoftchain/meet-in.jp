<?php /* Smarty version 2.6.26, created on 2020-09-04 12:59:56
         compiled from negotiation/room.tpl */ ?>
<?php require_once(SMARTY_CORE_DIR . 'core.load_plugins.php');
smarty_core_load_plugins(array('plugins' => array(array('modifier', 'date_format', 'negotiation/room.tpl', 216, false),)), $this); ?>
<!DOCTYPE html>
<html>
<head>
<?php echo '
	<!-- Global site tag (gtag.js) - Google Analytics -->
	<script async src="https://www.googletagmanager.com/gtag/js?id=UA-48144639-6"></script>
	<script>
	  window.dataLayer = window.dataLayer || [];
	  function gtag(){dataLayer.push(arguments);}
	  gtag(\'js\', new Date());
	  gtag(\'config\', \'UA-48144639-6\');
	</script>
'; ?>

<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>ミーティング</title>
<meta charset="utf-8">
<meta name="description" content="">
<meta name="author" content="">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<link rel="shortcut icon" href="">
<link rel="stylesheet" href="/css/reset.css?<?php echo $this->_tpl_vars['application_version']; ?>
">
<link rel="stylesheet" href="/css/sp/meeting.css?<?php echo $this->_tpl_vars['application_version']; ?>
">
<link rel="stylesheet" href="/css/sp/button.css?<?php echo $this->_tpl_vars['application_version']; ?>
">
<link rel="stylesheet" href="/css/chat_board.css?<?php echo $this->_tpl_vars['application_version']; ?>
">
<link rel="stylesheet" href="/css/fonts.css?<?php echo $this->_tpl_vars['application_version']; ?>
">
<script type="text/javascript" src="/js/jquery-1.11.2.min.js"></script>
<script type="text/javascript" src="https://code.jquery.com/ui/1.11.4/jquery-ui.min.js"></script>
<script type="text/javascript" src="/js/sp/negotiation/meeting.js?<?php echo $this->_tpl_vars['application_version']; ?>
"></script>

<!-- web移植 -->
<script src="/js/jquery-1.11.2.min.js?<?php echo $this->_tpl_vars['application_version']; ?>
"></script>
<script src="/js/jquery-ui.min.js?<?php echo $this->_tpl_vars['application_version']; ?>
"></script>
<script src="/js/jquery.ui.touch-punch.min.js?<?php echo $this->_tpl_vars['application_version']; ?>
"></script>
<script src="/js/jquery.cookie.js?<?php echo $this->_tpl_vars['application_version']; ?>
"></script>
<script src="/js/tooltipster.bundle.min.js?<?php echo $this->_tpl_vars['application_version']; ?>
"></script>
<script src="/js/common.js?<?php echo $this->_tpl_vars['application_version']; ?>
"></script>
<script src="/js/design.js?<?php echo $this->_tpl_vars['application_version']; ?>
"></script>
<script src="/js/uuid.js?<?php echo $this->_tpl_vars['application_version']; ?>
"></script>
<script src="/src/handlebars-v3.0.3.js?<?php echo $this->_tpl_vars['application_version']; ?>
"></script>

<script src="/js/sp/negotiation/share_memo.js?<?php echo $this->_tpl_vars['application_version']; ?>
"></script>
<script src="/js/sp/negotiation/write_line.js?<?php echo $this->_tpl_vars['application_version']; ?>
"></script>
<script src="/js/sp/negotiation/white_board.js?<?php echo $this->_tpl_vars['application_version']; ?>
"></script>
<script src="/js/sp/negotiation/chat_board.js?<?php echo $this->_tpl_vars['application_version']; ?>
"></script>
<script src="/js/sp/negotiation/meetin_db.js?<?php echo $this->_tpl_vars['application_version']; ?>
"></script>
<script src="/js/sp/negotiation/material_upload.js?<?php echo $this->_tpl_vars['application_version']; ?>
"></script>
<script src="/js/sp/negotiation/negotiation_sync.js?<?php echo $this->_tpl_vars['application_version']; ?>
"></script>
<script src="/js/less.min.js?<?php echo $this->_tpl_vars['application_version']; ?>
" type="text/javascript"></script>
<script src="/js/sp/negotiation/negotiation_namecard.js?<?php echo $this->_tpl_vars['application_version']; ?>
"></script>

</head>
<body>
	<div class="content__wrap iphonex_safe_area" id="content__wrap">
		<div class="full_screen__wrap">
			<!-- 現在のレイアウト種別を判定するための値 -->
			<input type="hidden" name="layout_type" value="icon"/>
			<div class="video_area_wrap">
				<?php $_smarty_tpl_vars = $this->_tpl_vars;
$this->_smarty_include(array('smarty_include_tpl_file' => "./negotiation/negotiation-target-video.tpl", 'smarty_include_vars' => array('video_id' => '0','this_id' => $this->_tpl_vars['user_id'])));
$this->_tpl_vars = $_smarty_tpl_vars;
unset($_smarty_tpl_vars);
 ?>
				<?php $_smarty_tpl_vars = $this->_tpl_vars;
$this->_smarty_include(array('smarty_include_tpl_file' => "./negotiation/negotiation-target-video.tpl", 'smarty_include_vars' => array('video_id' => '1','this_id' => $this->_tpl_vars['user_id'])));
$this->_tpl_vars = $_smarty_tpl_vars;
unset($_smarty_tpl_vars);
 ?>
				<?php $_smarty_tpl_vars = $this->_tpl_vars;
$this->_smarty_include(array('smarty_include_tpl_file' => "./negotiation/negotiation-target-video.tpl", 'smarty_include_vars' => array('video_id' => '2','this_id' => $this->_tpl_vars['user_id'])));
$this->_tpl_vars = $_smarty_tpl_vars;
unset($_smarty_tpl_vars);
 ?>
				<?php $_smarty_tpl_vars = $this->_tpl_vars;
$this->_smarty_include(array('smarty_include_tpl_file' => "./negotiation/negotiation-target-video.tpl", 'smarty_include_vars' => array('video_id' => '3','this_id' => $this->_tpl_vars['user_id'])));
$this->_tpl_vars = $_smarty_tpl_vars;
unset($_smarty_tpl_vars);
 ?>
				<?php $_smarty_tpl_vars = $this->_tpl_vars;
$this->_smarty_include(array('smarty_include_tpl_file' => "./negotiation/negotiation-target-video.tpl", 'smarty_include_vars' => array('video_id' => '4','this_id' => $this->_tpl_vars['user_id'])));
$this->_tpl_vars = $_smarty_tpl_vars;
unset($_smarty_tpl_vars);
 ?>
				<?php $_smarty_tpl_vars = $this->_tpl_vars;
$this->_smarty_include(array('smarty_include_tpl_file' => "./negotiation/negotiation-target-video.tpl", 'smarty_include_vars' => array('video_id' => '5','this_id' => $this->_tpl_vars['user_id'])));
$this->_tpl_vars = $_smarty_tpl_vars;
unset($_smarty_tpl_vars);
 ?>
				<?php $_smarty_tpl_vars = $this->_tpl_vars;
$this->_smarty_include(array('smarty_include_tpl_file' => "./negotiation/negotiation-share-screen.tpl", 'smarty_include_vars' => array()));
$this->_tpl_vars = $_smarty_tpl_vars;
unset($_smarty_tpl_vars);
 ?>
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
		<?php $_smarty_tpl_vars = $this->_tpl_vars;
$this->_smarty_include(array('smarty_include_tpl_file' => "./negotiation/loading.tpl", 'smarty_include_vars' => array()));
$this->_tpl_vars = $_smarty_tpl_vars;
unset($_smarty_tpl_vars);
 ?>
		<!-- コネクト end -->

		<?php $_smarty_tpl_vars = $this->_tpl_vars;
$this->_smarty_include(array('smarty_include_tpl_file' => "./negotiation/negotiation-dialog.tpl", 'smarty_include_vars' => array()));
$this->_tpl_vars = $_smarty_tpl_vars;
unset($_smarty_tpl_vars);
 ?>
		<!-- ルーム共有モーダル begin -->
		<?php $_smarty_tpl_vars = $this->_tpl_vars;
$this->_smarty_include(array('smarty_include_tpl_file' => "./negotiation/negotiation-room-share.tpl", 'smarty_include_vars' => array()));
$this->_tpl_vars = $_smarty_tpl_vars;
unset($_smarty_tpl_vars);
 ?>
		<!-- ルーム共有モーダル end -->

		<!-- 入室要求 start -->
		<?php if ($this->_tpl_vars['is_operator'] == 1): ?>
		<div id="enter_room_dialog_field">
			<div id="enter_room_dialog_background_area" class="mi_modal_shadow" style="z-index:101000000; display:none;">
			</div>
			<div id="enter_room_dialog_area">
			</div>
		</div>
		<?php endif; ?>
		<!-- 入室要求 end -->

		<!-- 汎用ダイアログ start -->
		<div id="common_dialog_area">
		</div>
		<!-- 汎用ダイアログ end -->
		<?php $_smarty_tpl_vars = $this->_tpl_vars;
$this->_smarty_include(array('smarty_include_tpl_file' => "./negotiation/negotiation-namecard.tpl", 'smarty_include_vars' => array()));
$this->_tpl_vars = $_smarty_tpl_vars;
unset($_smarty_tpl_vars);
 ?>
	</div>


	<!-- web移植 begin -->
	<input type="hidden" id="is_operator" value="<?php echo $this->_tpl_vars['is_operator']; ?>
"/>
	<input type="hidden" id="client_id" value="<?php echo $this->_tpl_vars['client_id']; ?>
"/>
	<input type="hidden" id="staff_type" value="<?php echo $this->_tpl_vars['staff_type']; ?>
"/>
	<input type="hidden" id="staff_id" value="<?php echo $this->_tpl_vars['staff_id']; ?>
"/>
	<input type="hidden" id="connection_info_id" value="<?php echo $this->_tpl_vars['connection_info_id']; ?>
"/>
	<input type="hidden" id="connect_no" value="<?php echo $this->_tpl_vars['connect_no']; ?>
"/>
	<input type="hidden" id="peer_id" value="<?php echo $this->_tpl_vars['peer_id']; ?>
"/>
	<input type="hidden" id="peer_video_id" value="<?php echo $this->_tpl_vars['peer_video_id']; ?>
"/>
	<input type="hidden" id="peer_audio_id" value="<?php echo $this->_tpl_vars['peer_audio_id']; ?>
"/>
	<input type="hidden" id="peer_screen_id" value="<?php echo $this->_tpl_vars['peer_screen_id']; ?>
"/>
	<input type="hidden" id="user_id" value="<?php echo $this->_tpl_vars['user_id']; ?>
"/>
	<input type="hidden" id="my_user_info" value="<?php echo $this->_tpl_vars['my_user_info']; ?>
"/>
	<input type="hidden" id="operator_name" value="<?php echo $this->_tpl_vars['user']['staff_name']; ?>
"/>
	<input type="hidden" id="screen_type" value="<?php echo $this->_tpl_vars['screen_type']; ?>
"/>
	<input type="hidden" id="wait_connect_table_string" value="<?php echo $this->_tpl_vars['wait_connect_table_string']; ?>
"/>
	<input type="hidden" id="enter_negotiation_datetime" value="<?php echo ((is_array($_tmp=time())) ? $this->_run_mod_handler('date_format', true, $_tmp, '%Y/%m/%d %H:%M:%S') : smarty_modifier_date_format($_tmp, '%Y/%m/%d %H:%M:%S')); ?>
"/>
	<input type="hidden" id="video_background_image" value="<?php echo $this->_tpl_vars['video_background_image']; ?>
"/>
	<input type="hidden" id="send_bandwidth" value="<?php echo $this->_tpl_vars['send_bandwidth']; ?>
"/>
	<input type="hidden" id="receive_bandwidth" value="<?php echo $this->_tpl_vars['receive_bandwidth']; ?>
"/>
	<input type="hidden" id="browser" value="<?php echo $this->_tpl_vars['browser']; ?>
"/>
	<input type="hidden" id="isMobile" value="<?php echo $this->_tpl_vars['isMobile']; ?>
"/>
	<input type="hidden" id="application_version" value="<?php echo $this->_tpl_vars['application_version']; ?>
"/>
	<!-- ルーム対応 -->
	<input type="hidden" id="room_locked" value="<?php echo $this->_tpl_vars['room_locked']; ?>
"/>
	<input type="hidden" id="document_material_id" value="<?php echo $this->_tpl_vars['document_material_id']; ?>
"/>
	<input type="hidden" id="document_uuid" value="<?php echo $this->_tpl_vars['document_uuid']; ?>
"/>
	<input type="hidden" id="document_user_id" value="<?php echo $this->_tpl_vars['document_user_id']; ?>
"/>
	<input type="hidden" id="desktop_notify_flg" value="<?php if (( $this->_tpl_vars['user']['desktop_notify_flg'] == '' )): ?>1<?php else: ?><?php echo $this->_tpl_vars['user']['desktop_notify_flg']; ?>
<?php endif; ?>"/>
	<!-- 名刺表示(現在表示している名刺情報) -->
	<input type="hidden" id="ShowNameCard_client_id" value="<?php echo $this->_tpl_vars['client_id']; ?>
"/>
	<input type="hidden" id="ShowNameCard_staff_type" value="<?php echo $this->_tpl_vars['staff_type']; ?>
"/>
	<input type="hidden" id="ShowNameCard_staff_id" value="<?php echo $this->_tpl_vars['staff_id']; ?>
"/>
	<input type="hidden" id="Room_name" value="<?php echo $this->_tpl_vars['room_name']; ?>
"/>
	<input type="hidden" id="Collabo_site" value="<?php echo $this->_tpl_vars['collabo_site']; ?>
"/>
	<?php if ($this->_tpl_vars['is_operator'] == 1): ?>
		<input type="hidden" id="target_peer_id" value="<?php echo $this->_tpl_vars['target_peer_id']; ?>
"/>
	<?php endif; ?>
	<script type="text/javascript" src="/js/WebRTC/key.js?<?php echo $this->_tpl_vars['application_version']; ?>
"></script>
	<script type="text/javascript" src="/js/WebRTC/skyway.js?<?php echo $this->_tpl_vars['application_version']; ?>
"></script>
	<script type="text/javascript" src="/js/WebRTC/screenshare.js?<?php echo $this->_tpl_vars['application_version']; ?>
"></script>
	<script type="text/javascript" src="/js/WebRTC/screencapture.js?<?php echo $this->_tpl_vars['application_version']; ?>
"></script>
	<script type="text/javascript" src="/js/MeetinAPI.js?<?php echo $this->_tpl_vars['application_version']; ?>
"></script>
	<script type="text/javascript" src="/js/Utility.js?<?php echo $this->_tpl_vars['application_version']; ?>
"></script>
	<script type="text/javascript" src="/js/WebRTC/MeetinDefault.js?<?php echo $this->_tpl_vars['application_version']; ?>
"></script>
	<script type="text/javascript" src="/js/WebRTC/MeetinUtility.js?<?php echo $this->_tpl_vars['application_version']; ?>
"></script>
	<script type="text/javascript" src="/js/WebSocket/MeetinWebSocketManager.js?<?php echo $this->_tpl_vars['application_version']; ?>
"></script>
	<script type="text/javascript" src="/js/WebSocket/MeetinWebSocketProcManager.js?<?php echo $this->_tpl_vars['application_version']; ?>
"></script>
	<script type="text/javascript" src="/js/WebRTC/MeetinConnectionManager.js?<?php echo $this->_tpl_vars['application_version']; ?>
"></script>
	<script type="text/javascript" src="/js/WebRTC/MeetinMediaManager.js?<?php echo $this->_tpl_vars['application_version']; ?>
"></script>
	<script type="text/javascript" src="/js/WebRTC/MeetinCoreManager.js?<?php echo $this->_tpl_vars['application_version']; ?>
"></script>
	<script type="text/javascript" src="/js/WebRTC/MeetinRTC_tab_capture.js?<?php echo $this->_tpl_vars['application_version']; ?>
"></script>
	<script type="text/javascript" src="/js/flash/swfobject.js?<?php echo $this->_tpl_vars['application_version']; ?>
"></script>
	<script type="text/javascript" src="/js/flash/flashUtility.js?<?php echo $this->_tpl_vars['application_version']; ?>
"></script>

	<script type="text/javascript" src="/js/sp/negotiation/negotiation_manager.js?<?php echo $this->_tpl_vars['application_version']; ?>
"></script>
	<script type="text/javascript" src="/js/sp/negotiation/negotiation_interface_common.js?<?php echo $this->_tpl_vars['application_version']; ?>
"></script>
	<script type="text/javascript" src="/js/sp/negotiation/negotiation_interface_init.js?<?php echo $this->_tpl_vars['application_version']; ?>
"></script>
	<script type="text/javascript" src="/js/sp/negotiation/negotiation_interface_reconnect.js?<?php echo $this->_tpl_vars['application_version']; ?>
"></script>
	<script type="text/javascript" src="/js/sp/negotiation/negotiation_interface_camera.js?<?php echo $this->_tpl_vars['application_version']; ?>
"></script>
	<script type="text/javascript" src="/js/sp/negotiation/negotiation_interface_mic.js?<?php echo $this->_tpl_vars['application_version']; ?>
"></script>
	<script type="text/javascript" src="/js/sp/negotiation/negotiation_interface_screen.js?<?php echo $this->_tpl_vars['application_version']; ?>
"></script>
	<script type="text/javascript" src="/js/sp/negotiation/negotiation_interface_command_receive.js?<?php echo $this->_tpl_vars['application_version']; ?>
"></script>
	<script type="text/javascript" src="/js/sp/negotiation/negotiation_interface_command_send.js?<?php echo $this->_tpl_vars['application_version']; ?>
"></script>
	<script type="text/javascript" src="/js/sp/negotiation/negotiation_video.js?<?php echo $this->_tpl_vars['application_version']; ?>
"></script>
	<script type="text/javascript" src="/js/sp/negotiation/negotiation_main.js?<?php echo $this->_tpl_vars['application_version']; ?>
"></script>
	<script type="text/javascript" src="/js/sp/negotiation/negotiation_event_func.js?<?php echo $this->_tpl_vars['application_version']; ?>
"></script>
	<script type="text/javascript" src="/js/sp/negotiation/negotiation_enter_room.js?<?php echo $this->_tpl_vars['application_version']; ?>
"></script>
	<script type="text/javascript" src="/js/sp/negotiation/negotiation_exit_room.js?<?php echo $this->_tpl_vars['application_version']; ?>
"></script>
	<script type="text/javascript" src="/js/sp/negotiation/negotiation_setting_camera.js?<?php echo $this->_tpl_vars['application_version']; ?>
"></script>
	<script type="text/javascript" src="/js/sp/negotiation/negotiation_extra_function.js?<?php echo $this->_tpl_vars['application_version']; ?>
"></script>
	<script type="text/javascript" src="/js/sp/negotiation/get_oldest_user_id.js?<?php echo $this->_tpl_vars['application_version']; ?>
"></script>
	<script type="text/javascript" src="/js/sp/negotiation/material.js?<?php echo $this->_tpl_vars['application_version']; ?>
"></script>
	<script type="text/javascript" src="/js/sp/negotiation/negotiation_login.js?<?php echo $this->_tpl_vars['application_version']; ?>
"></script>
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
