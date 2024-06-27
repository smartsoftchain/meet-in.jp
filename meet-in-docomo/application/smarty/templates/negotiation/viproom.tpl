<!DOCTYPE html>
<html lang="ja">
	<head>
		{if $smarty.server.SERVER_NAME === 'meet-in.jp'}

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

		{/if}
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=800,height=550,maximum-scale=1.0">
		<title></title>
		<meta charset="utf-8">
		<meta name="description" content="">
		<meta name="author" content="">
		<link rel="shortcut icon" href="/img/favicon.ico">
		<link rel="stylesheet" href="/css/fonts.css?{$application_version}">
		<link rel="stylesheet" href="/css/ie7.css?{$application_version}">
		<!--<![endif]-->
		<link rel="stylesheet" href="/css/mcu/reset.css?{$application_version}">
		<link rel="stylesheet" href="/css/mcu/base.css?{$application_version}">
		<link rel="stylesheet" href="/css/mcu/page.css?{$application_version}">
		<link rel="stylesheet" href="/css/mcu/negotiation.css?{$application_version}">
		<link rel="stylesheet" href="/css/mcu/negotiation_enter_room.css?{$application_version}">
		<link rel="stylesheet" href="/css/mcu/negotiation_setting.css?{$application_version}">
		<link rel="stylesheet" href="/css/jquery-ui.css?{$application_version}">
		<link rel="stylesheet" href="/css/tooltipster.bundle.min.css?{$application_version}">
		<link rel="stylesheet" href="/css/lib/tooltipster/sideTip/themes/tooltipster-sideTip-borderless.min.css?{$application_version}">
		<link rel="stylesheet" href="/css/lib/tooltipster/sideTip/themes/tooltipster-sideTip-light.min.css?{$application_version}">

		<link rel="stylesheet" href="/css/mcu/audio-text-modal.css?{$application_version}">
		<link rel="stylesheet" href="/css/sentiment_analysis.css?{$application_version}">
		<link rel="stylesheet" href="/css/mcu/share_memo.css?{$application_version}">
		<link rel="stylesheet" href="/css/mcu/secret_memo.css?{$application_version}">
		<link rel="stylesheet" href="/css/mcu/white_board.css?{$application_version}">
		<link rel="stylesheet" href="/css/mcu/chat_board.css?{$application_version}">
		<link rel="stylesheet" href="/css/mcu/namecard.css?{$application_version}">
		<link rel="stylesheet" href="/css/mcu/material.css?{$application_version}">
		<link rel="stylesheet" href="/css/mcu/e_contract.css?{$application_version}">
		<link rel="stylesheet" type="text/css" href="/css/lib/balloon/balloon.min.css?{$application_version}">
		<link rel="stylesheet" href="/css/mcu/design.css?{$application_version}">
		<link rel="stylesheet" href="/css/mcu/bodypix_dialog.css?{$application_version}">
		<link rel="stylesheet/less" type="text/css" href="/css/mcu/video_rayout.less?{$application_version}">

		<script>window.Promise || document.write('<script src="//www.promisejs.org/polyfills/promise-7.0.4.min.js"><\/script>');</script>
		<script>window.Promise || document.write('<script src="/js/promise-7.0.4.min.js"><\/script>');</script>

		<script src="/js/jquery-1.11.2.min.js?{$application_version}"></script>
		<script src="/js/jquery-ui.min.js?{$application_version}"></script>
		<script src="/js/jquery.ui.touch-punch.min.js?{$application_version}"></script>
		<script src="/js/jquery.cookie.js?{$application_version}"></script>
		<script src="/js/jquery.inview.min.js?{$application_version}"></script>
		<script src="/js/tooltipster.bundle.min.js?{$application_version}"></script>
		<script src="/js/common.js?{$application_version}"></script>
		<script src="/js/design.js?{$application_version}"></script>
		<script src="/js/uuid.js?{$application_version}"></script>
		<script src="/src/handlebars-v3.0.3.js?{$application_version}"></script>

		<script src="/js/negotiation/mcu/share_memo.js?{$application_version}"></script>
		<script src="/js/negotiation/mcu/secret_memo.js?{$application_version}"></script>
		<script src="/js/negotiation/mcu/write_line.js?{$application_version}"></script>
		<script src="/js/negotiation/mcu/white_board.js?{$application_version}"></script>
		<script src="/js/negotiation/mcu/chat_board.js?{$application_version}"></script>
		<script src="/js/negotiation/mcu/e_contract.js?{$application_version}"></script>
		<script src="/js/negotiation/mcu/audio_text.js?{$application_version}"></script>
		<script src="/js/negotiation/sentiment_analysis.js?{$application_version}"></script>
		<script src="/js/negotiation/mcu/meetin_db.js?{$application_version}"></script>
		<script src="/js/negotiation/mcu/material_upload.js?{$application_version}"></script>
		<script src="/js/negotiation/mcu/negotiation_sync.js?{$application_version}"></script>
		<script src="/js/less.min.js?{$application_version}" type="text/javascript"></script>
		<script src="/js/negotiation/mcu/negotiation_namecard.js?{$application_version}"></script>
		<script src="/js/platform.js?{$application_version}"></script>


</head>

	{if $room_mode == 2}
		<body class="room_body monitoring_mode">
	{else}
		<body class="room_body">
	{/if}

		<!-- wrap start -->
		<div id="mi_wrap">

			<!-- ヘッダー start -->
			{include file="./negotiation/mcu/negotiation-top.tpl"}
			<!-- ヘッダー end -->

			<!-- メインコンテンツ start -->
			<div id="mi_wrap">

				<!-- 左側サイドバー start -->
				{include file="./negotiation/mcu/negotiation-left.tpl"}
				<!-- 左側サイドバー end -->

				<!-- コンテンツエリア start -->
				<div id="mi_main_contents">
					<div class="pip_check_modal" id="pipExitCheckModal">
						<div class="pip_modal_title">サブフレームを閉じます</div>
						<div class="pip_modal_message">サブフレームを再度表示したい場合は、<br>ヘッダーの「サブフレーム」ボタンをクリックしてください。</div>
						<div class="pip_modal_button_area">
							<button id="continuePipMode">キャンセル</button>
							<button id="exitPipMode">OK</button>
						</div>
					</div>

					<div id="mi_content_area_negotiation" ondragover="materialDragOver(event)" ondrop="materialDrop(event)" >
						<div id="mi_video_area">
							{include file="./negotiation/mcu/negotiation-horizontal-video.tpl"}
							<div id="fit_rate">
								{include file="./negotiation/mcu/negotiation-spotlight-video.tpl"}
								{*include file="./negotiation/negotiation-video.tpl"*}
								{include file="./negotiation/mcu/negotiation-share-screen.tpl"}
								{include file="./negotiation/mcu/negotiation-document.tpl"}
								{*ビデオ*}
								<canvas id="video_off_canvas" style="object-fit: cover; position: absolute; display: none;"></canvas>
								{include file="./negotiation/mcu/negotiation-mcu-video.tpl"}
								{include file="./negotiation/mcu/negotiation-target-video.tpl" video_id='0'}
								{include file="./negotiation/mcu/negotiation-target-video.tpl" video_id='1'}
								{include file="./negotiation/mcu/negotiation-target-video.tpl" video_id='2'}
								{include file="./negotiation/mcu/negotiation-target-video.tpl" video_id='3'}
								{include file="./negotiation/mcu/negotiation-target-video.tpl" video_id='4'}
								{include file="./negotiation/mcu/negotiation-target-video.tpl" video_id='5'}
								{include file="./negotiation/mcu/negotiation-target-video.tpl" video_id='6'}
								<div id="mi_full_screen_bk">
								</div>
							</div>
						</div>

						{include file="./negotiation/mcu/negotiation-secret-memo.tpl"}
						{include file="./negotiation/mcu/share-memo.tpl"}
						{include file="./negotiation/mcu/white-board.tpl"}
						{include file="./negotiation/mcu/chat-board.tpl"}
						{include file="./negotiation/mcu/e-contract.tpl"}
						{include file="./negotiation/mcu/negotiation-sync-message.tpl"}
						{include file="./negotiation/mcu/audio-text-modal.tpl"}
						{include file="./negotiation/sentiment-analysis-modal.tpl"}


					</div>
				</div>
				<!-- コンテンツエリア end -->

			</div>
			<!-- メインコンテンツ end -->

			<!-- フッター start -->
			{include file="./negotiation/mcu/negotiation-bottom.tpl"}
			<!-- フッター end -->

		    <!-- ルーム共有モーダル begin -->
			{include file="./negotiation/mcu/negotiation-dialog.tpl"}
			{include file="./negotiation/mcu/negotiation-room-share.tpl"}
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
			{include file="./negotiation/mcu/negotiation-namecard.tpl"}

			<!-- ログインダイアログ -->
			{include file="./negotiation/mcu/negotiation-login-dialog.tpl"}

			<!-- クライアント選択ダイアログ -->
			{include file="./negotiation/mcu/negotiation-client-dialog.tpl"}

			<!-- ユーザー一覧ダイアログ -->
			{include file="./negotiation/mcu/negotiation-userlist-dialog.tpl"}

			<!-- お問い合わせダイアログ -->
			{include file="./negotiation/mcu/negotiation-contact-dialog.tpl"}

			<!-- コネクト begin -->
			<div class="in_connect_area" style="position:fixed;top:0px;left:0px;width:100%;z-index:100000002;display:block;">
				<div class="conecting_wrap">
					<div class="conecting_inner">
						<div class="lodingimg_efect_wrap">
							<div class="lodingimg_efect">
							</div>
							<p id="loding_text_id" class="loding_text">connecting<span class="point">・・・</span></p>
						</div>
						<p id="conect_text_id" class="conect_text">準備中です。<br>少々お待ちください。</p>
					</div>
				</div>
				<!-- ====================================== モーダルコンテンツ[start] ====================================== -->
				<div class="non_reccomend_modal_default non_reccomend_wrap">
					<div class="non_reccomend_main">
						meet inにおける推奨環境を満たしていない可能性がある為、<br>動作が不安定となる可能性がございます。<br>
						推奨環境をご確認の上、再接続するようお願いいたします。
						<div class="non_reccomend_link_wrap">
							推奨環境のご確認は<a href="https://manual.meet-in.jp/?p=540" target="_blank" rel="noopener" class="non_reccomend_link">こちら</a>
						</div>
						<button class="non_reccomend_cancel">閉じる</button>
					</div>
				</div>
				<!-- ====================================== モーダルコンテンツ[end] ======================================== -->
			</div>
			<!-- コネクト end -->

			<!-- ====================================== モーダルコンテンツ[start] ====================================== -->				
			<div class="non_reccomend_modal_default non_reccomend_wrap">
				<div class="non_reccomend_main">
					meet inにおける推奨環境を満たしていない可能性がある為、<br>動作が不安定となる可能性がございます。<br>
					推奨環境をご確認の上、再接続するようお願いいたします。
					<div class="non_reccomend_link_wrap">
						推奨環境のご確認は<a href="https://manual.meet-in.jp/?p=540" target="_blank" rel="noopener" class="non_reccomend_link">こちら</a>
					</div>
					<button class="non_reccomend_cancel">閉じる</button>
				</div>
			</div>
			<!-- ====================================== モーダルコンテンツ[end] ======================================== -->

			</div>
			<!-- コネクト end -->

			<!-- 社内通話 begin -->
			<div id="mi_secret_voice_area"></div>
			<!-- 社内通話 begin -->

			<input type="hidden" id="is_operator" value="{$is_operator}"/>
			<input type="hidden" id="client_id" value="{$client_id}"/>
			<input type="hidden" id="staff_type" value="{$staff_type}"/>
			<input type="hidden" id="staff_id" value="{$staff_id}"/>
			<input type="hidden" id="plan_this_month" value="{$plan_this_month}"/>
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
			<input type="hidden" id="e_contract_credential" value="{$e_contract_credential}"/>
			<input type="hidden" id="room_member_names" value=""/>
			<!-- ルーム対応 -->
			<input type="hidden" id="room_locked" value="{$room_locked}"/>
			<input type="hidden" id="document_material_id" value="{$document_material_id}"/>

			<input type="hidden" id="document_uuid" value="{$document_uuid}"/>
			<input type="hidden" id="document_user_id" value="{$document_user_id}"/>
			<input type="hidden" id="desktop_notify_flg" value="{if ($user.desktop_notify_flg == '')}1{else}{$user.desktop_notify_flg}{/if}"/>

			<input type="hidden" id="remind_record_flg" value="{$remind_record_flg}"/>

			<!-- 名刺表示(現在表示している名刺情報) -->
			<input type="hidden" id="ShowNameCard_client_id" value="{$client_id}"/>
			<input type="hidden" id="ShowNameCard_staff_type" value="{$staff_type}"/>
			<input type="hidden" id="ShowNameCard_staff_id" value="{$staff_id}"/>

			<input type="hidden" id="Room_name" value="{$room_name}"/>
			<input type="hidden" id="Collabo_site" value="{$collabo_site}"/>

			{if $is_operator == 1}
			<input type="hidden" id="target_peer_id" value="{$target_peer_id}"/>
			{if !empty($user.bodypix_background_path) }
			<input type="hidden" id="bodypix_background_path" value="{$user.bodypix_background_path}">
			{else}
			<input type="hidden" id="bodypix_background_path" value="bodypix_no_effect">
			{/if}
			<input type="hidden" id="bodypix_internal_resolution" value="{$user.bodypix_internal_resolution}"/>
			<input type="hidden" id="bodypix_segmentation_threshold" value="{$user.bodypix_segmentation_threshold}"/>
			<input type="hidden" id="bodypix_mask_blur_amount" value="{$user.bodypix_mask_blur_amount}"/>
			{else}
			<input type="hidden" id="bodypix_background_path" value="bodypix_no_effect"/>
			<input type="hidden" id="bodypix_internal_resolution" value="27"/>
			<input type="hidden" id="bodypix_segmentation_threshold" value="70"/>
			<input type="hidden" id="bodypix_mask_blur_amount" value="0"/>
			{/if}

			{if $browser === 'IE'}
			{else}
			<script type="text/javascript" src="/js/WebRTC/key.js?{$application_version}"></script>
			<script type="text/javascript" src="/js/WebRTC/skyway.js?{$application_version}"></script>
			<script type="text/javascript" src="/js/WebRTC/screenshare.js?{$application_version}"></script>
			<script type="text/javascript" src="/js/WebRTC/screencapture.js?{$application_version}"></script>
			<!-- BodyPix -->
			<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.2" defer></script>
			<script src="https://cdn.jsdelivr.net/npm/@tensorflow-models/body-pix@2.0" defer></script>
			<script src="/js/negotiation/mcu/negotiation_bodypix_dialog.js?{$application_version}" defer></script>
			<script src="/js/negotiation/mcu/negotiation_bodypix.js?{$application_version}" defer></script>

			<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.4.0/socket.io.js" type="text/javascript"></script>
			<script src="/js/mcu/librarys/owt/owt.js?{$application_version}" defer></script>
			<script src="/js/mcu/librarys/wrapper/mcu_client.js?{$application_version}" defer></script>
			<script src="/js/mcu/librarys/wrapper/mcu_rest.js?{$application_version}" defer></script>
			<script src="/js/mcu/room_configuration.js?{$application_version}" defer></script>

			<script src="/js/negotiation.js?{$application_version}" defer></script>
			{/if}

			<!-- 同席モード begin -->
			<input type="hidden" id="room_mode" value="{$room_mode}"/>
			{if $room_mode == 2}
				<div class="view_only_control_contents"></div>
			{/if}
			<!-- 同席モード end -->

			<script type="text/javascript" src="/js/MeetinAPI.js?{$application_version}"></script>
			<script type="text/javascript" src="/js/Utility.js?{$application_version}"></script>

			{if $browser !== 'IE'}
			<script src="/js/WebRTC/RTCStatsSync.js?{$application_version}"></script>
			{/if}

			<script type="text/javascript" src="/js/WebRTC/MeetinDefaultMcu.js?{$application_version}"></script>
			<script type="text/javascript" src="/js/WebRTC/MeetinUtility.js?{$application_version}"></script>

			<script type="text/javascript" src="/js/WebSocket/MeetinWebSocketManager.js?{$application_version}"></script>
			<script type="text/javascript" src="/js/WebSocket/MeetinWebSocketProcManager.js?{$application_version}"></script>

			{if $browser === 'IE'}
			{else}
			<script type="text/javascript" src="/js/WebRTC/MeetinConnectionManager.js?{$application_version}"></script>
			<script type="text/javascript" src="/js/WebRTC/MeetinMediaManager.js?{$application_version}"></script>
			/* MCU */
			<script type="text/javascript" src="/js/WebRTC/MeetinCoreManagerMcu.js?{$application_version}"></script>
			<script type="text/javascript" src="/js/WebRTC/MeetinRTC_tab_capture.js?{$application_version}"></script>
			{/if}

			<script type="text/javascript" src="/js/flash/swfobject.js?{$application_version}"></script>
			<script type="text/javascript" src="/js/flash/flashUtility.js?{$application_version}"></script>

			<script type="text/javascript" src="/js/negotiation/mcu/negotiation_manager.js?{$application_version}"></script>
			<script type="text/javascript" src="/js/negotiation/mcu/negotiation_secret_voice.js?{$application_version}"></script>
			<script type="text/javascript" src="/js/negotiation/mcu/negotiation_interface_common.js?{$application_version}"></script>
			<script type="text/javascript" src="/js/negotiation/mcu/negotiation_interface_init.js?{$application_version}"></script>
			<script type="text/javascript" src="/js/negotiation/mcu/negotiation_interface_reconnect.js?{$application_version}"></script>
			<script type="text/javascript" src="/js/negotiation/mcu/negotiation_interface_camera.js?{$application_version}"></script>
			<script type="text/javascript" src="/js/negotiation/mcu/negotiation_interface_mic.js?{$application_version}"></script>
			<script type="text/javascript" src="/js/negotiation/mcu/negotiation_interface_screen.js?{$application_version}"></script>
			<script type="text/javascript" src="/js/negotiation/mcu/negotiation_interface_command_receive.js?{$application_version}"></script>
			<script type="text/javascript" src="/js/negotiation/mcu/negotiation_interface_command_send.js?{$application_version}"></script>

			<script type="text/javascript" src="/js/negotiation/mcu/negotiation_video.js?{$application_version}"></script>
			<script type="text/javascript" src="/js/negotiation/mcu/negotiation_main.js?{$application_version}"></script>
			<script type="text/javascript" src="/js/negotiation/mcu/negotiation_event_func.js?{$application_version}"></script>
			{if $browser !== 'IE'}
				<script type="text/javascript" src="/js/negotiation/mcu/negotiation_audio_func.js?{$application_version}"></script>
				<script type="text/javascript" src="/js/WebSocket/RealTimeAudioRecognize.js?{$application_version}"></script>
				<script type="text/javascript" src="/js/WebSocket/VoiceAnalysis.js?{$application_version}"></script>
				<script type="text/javascript" src="/js/WebSocket/voice_analysis_commands.js?{$application_version}"></script>
				<script type="text/javascript" src="/js/WebSocket/MediaStreamRecorder.js?{$application_version}"></script>
			{/if}

			<script type="text/javascript" src="/js/negotiation/mcu/negotiation_enter_room.js?{$application_version}"></script>
			<script type="text/javascript" src="/js/negotiation/mcu/negotiation_exit_room.js?{$application_version}"></script>
			<script type="text/javascript" src="/js/negotiation/mcu/negotiation_setting_camera.js?{$application_version}"></script>
			<script type="text/javascript" src="/js/negotiation/mcu/negotiation_extra_function.js?{$application_version}"></script>
			<script type="text/javascript" src="/js/negotiation/mcu/negotiation_system_requirements_browser.js?{$application_version}"></script>
			<script type="text/javascript" src="/js/negotiation/mcu/get_oldest_user_id.js?{$application_version}"></script>
			<script type="text/javascript" src="/js/negotiation/mcu/material.js?{$application_version}"></script>
			<script type="text/javascript" src="/js/negotiation/mcu/negotiation_login.js?{$application_version}"></script>
			<script type="text/javascript" src="/js/negotiation/mcu/negotiation_room_share.js?{$application_version}"></script>

		</div>
		<!-- wrap end -->

		<!--[if lt IE 8]>
		<script src="/js/ie7.js?{$application_version}"></script>
		<!--<![endif]-->
	</body>
</html>
