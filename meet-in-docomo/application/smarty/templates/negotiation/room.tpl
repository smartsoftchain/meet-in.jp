<!DOCTYPE html>
<html lang="ja">
	<head>
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
		<link rel="stylesheet" href="/css/reset.css?{$application_version}">
		<link rel="stylesheet" href="/css/base.css?{$application_version}">
		<link rel="stylesheet" href="/css/page.css?{$application_version}">
		<link rel="stylesheet" href="/css/negotiation.css?{$application_version}">
		<link rel="stylesheet" href="/css/negotiation_enter_room.css?{$application_version}">
		<link rel="stylesheet" href="/css/negotiation_setting.css?{$application_version}">
		<link rel="stylesheet" href="/css/jquery-ui.css?{$application_version}">
		<link rel="stylesheet" href="/css/tooltipster.bundle.min.css?{$application_version}">
		<link rel="stylesheet" href="/css/lib/tooltipster/sideTip/themes/tooltipster-sideTip-borderless.min.css?{$application_version}">
		<link rel="stylesheet" href="/css/lib/tooltipster/sideTip/themes/tooltipster-sideTip-light.min.css?{$application_version}">

		<link rel="stylesheet" href="/css/audio-text-modal.css?{$application_version}">
		<link rel="stylesheet" href="/css/sentiment_analysis.css?{$application_version}">
		<link rel="stylesheet" href="/css/share_memo.css?{$application_version}">
		<link rel="stylesheet" href="/css/secret_memo.css?{$application_version}">
		<link rel="stylesheet" href="/css/white_board.css?{$application_version}">
		<link rel="stylesheet" href="/css/chat_board.css?{$application_version}">
		<link rel="stylesheet" href="/css/namecard.css?{$application_version}">
		<link rel="stylesheet" href="/css/material.css?{$application_version}">
		<link rel="stylesheet" href="/css/room_share.css?{$application_version}">
		<link rel="stylesheet" href="/css/e_contract.css?{$application_version}">
		<link rel="stylesheet" type="text/css" href="/css/lib/balloon/balloon.min.css?{$application_version}">
		<link rel="stylesheet" href="/css/design.css?{$application_version}">
		<link rel="stylesheet" href="/css/bodypix_dialog.css?{$application_version}">
		<link rel="stylesheet/less" type="text/css" href="/css/video_rayout.less?{$application_version}">

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
		<script src="/js/html2canvas.min.js?{$application_version}"></script>

		<script src="/js/negotiation/share_memo.js?{$application_version}"></script>
		<script src="/js/negotiation/secret_memo.js?{$application_version}"></script>
		<script src="/js/negotiation/write_line.js?{$application_version}"></script>
		<script src="/js/negotiation/white_board.js?{$application_version}"></script>
		<script src="/js/negotiation/chat_board.js?{$application_version}"></script>
		<script src="/js/negotiation/e_contract.js?{$application_version}"></script>
		<script src="/js/negotiation/audio_text.js?{$application_version}"></script>
		<script src="/js/negotiation/sentiment_analysis.js?{$application_version}"></script>
		<script src="/js/negotiation/meetin_db.js?{$application_version}"></script>
		<script src="/js/negotiation/material_upload.js?{$application_version}"></script>
		<script src="/js/negotiation/negotiation_sync.js?{$application_version}"></script>
		<script src="/js/less.min.js?{$application_version}" type="text/javascript"></script>
		<script src="/js/negotiation/negotiation_namecard.js?{$application_version}"></script>
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
			{include file="./negotiation/negotiation-top.tpl"}
			<!-- ヘッダー end -->

			<!-- メインコンテンツ start -->
			<div id="mi_wrap">

				<!-- 左側サイドバー start -->
				{include file="./negotiation/negotiation-left.tpl"}
				<!-- 左側サイドバー end -->

				<!-- コンテンツエリア start -->
				<div id="mi_main_contents">

					<div id="mi_content_area_negotiation" ondragover="materialDragOver(event)" ondrop="materialDrop(event)" >
						<div id="mi_video_area">

							<div id="fit_rate">
								<!-- 手動ですべてヘッダーにいれて何も表示されていないときは、背景に「非表示にしたビデオは、ヘッダーの表示メニューから表示できます。」とテキストで入れる。 -->
								<div class="mi_contents_background_info_content" style="display: none;">
									<div class="mi_contents_background_info_content_1_area">
										<div class="mi_contents_background_info_content_1_area_text">
											<p>非表示にしたビデオは、ヘッダーの表示メニューから表示できます。</p>
										</div>
									</div>
								</div>

								{include file="./negotiation/negotiation-share-screen.tpl"}
								{include file="./negotiation/negotiation-document.tpl"}
								{*ビデオ*}
								{include file="./negotiation/negotiation-target-video.tpl" video_id='0'}
								{include file="./negotiation/negotiation-target-video.tpl" video_id='1'}
								{include file="./negotiation/negotiation-target-video.tpl" video_id='2'}
								{include file="./negotiation/negotiation-target-video.tpl" video_id='3'}
								{include file="./negotiation/negotiation-target-video.tpl" video_id='4'}
								{include file="./negotiation/negotiation-target-video.tpl" video_id='5'}
								{include file="./negotiation/negotiation-target-video.tpl" video_id='6'}
								<div id="mi_full_screen_bk">
								</div>
							</div>
						</div>

						{include file="./negotiation/secret-memo.tpl"}
						{include file="./negotiation/share-memo.tpl"}
						{include file="./negotiation/white-board.tpl"}
						{include file="./negotiation/chat-board.tpl"}
						{include file="./negotiation/e-contract.tpl"}
						{include file="./negotiation/negotiation-sync-message.tpl"}
						{include file="./negotiation/audio-text-modal.tpl"}
						{include file="./negotiation/sentiment-analysis-modal.tpl"}



					</div>
				</div>
				<!-- コンテンツエリア end -->

				<!-- 右側 ツールチップエリア start -->
				<div id="mi_right_tooltip" style="z-index:100000002;"></div>
				<!-- 右側 ツールチップエリア end -->


			</div>
			<!-- メインコンテンツ end -->

			<!-- フッター start -->
			{include file="./negotiation/negotiation-bottom.tpl"}
			<!-- フッター end -->

		    <!-- ルーム共有モーダル begin -->
			{include file="./negotiation/negotiation-dialog.tpl"}
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

			<!-- ログインダイアログ -->
			{include file="./negotiation/negotiation-login-dialog.tpl"}

			<!-- クライアント選択ダイアログ -->
			{include file="./negotiation/negotiation-client-dialog.tpl"}

			<!-- ユーザー一覧ダイアログ -->
			{include file="./negotiation/negotiation-userlist-dialog.tpl"}

			<!-- お問い合わせダイアログ -->
			{include file="./negotiation/negotiation-contact-dialog.tpl"}

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

				<!-- ====================================== 推奨環境モーダル[start] ====================================== -->
				<div class="non_reccomend_modal_default non_reccomend_wrap">
					<div class="non_reccomend_main">
						meet inにおける推奨環境を満たしていない可能性がある為、<br>動作が不安定となる可能性がございます。<br>
						推奨環境をご確認の上、再接続するようお願いいたします。
						<div class="non_reccomend_link_wrap">
							{* 推奨環境のご確認は<a href="https://manual.meet-in.jp/?p=540" target="_blank" rel="noopener" class="non_reccomend_link">こちら</a> *}
						</div>
						<button class="non_reccomend_cancel">閉じる</button>
					</div>
				</div>
				<!-- ====================================== 推奨環境モーダル[end] ======================================== -->


			</div>
			<!-- コネクト end -->

			<!-- ====================================== モーダルコンテンツ[start] ====================================== -->
			{if $room_mode == 2}
				<div class="non_reccomend_modal_default non_reccomend_wrap monitoring_mode">
			{else}
				<div class="non_reccomend_modal_default non_reccomend_wrap">
			{/if}
					<div class="non_reccomend_main">
						meet inにおける推奨環境を満たしていない可能性がある為、<br>動作が不安定となる可能性がございます。<br>
						推奨環境をご確認の上、再接続するようお願いいたします。
						<div class="non_reccomend_link_wrap">
							{* 推奨環境のご確認は<a href="https://manual.meet-in.jp/?p=540" target="_blank" rel="noopener" class="non_reccomend_link">こちら</a> *}
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

			<input type="hidden" id="user_name" value="{$smarty.session.user_name}"/>

			<input type="hidden" id="my_user_info" value="{$my_user_info}"/>
			<input type="hidden" id="operator_name" value="{$user.staff_name}"/>
			<input type="hidden" id="client_name" value="{$user.client_name}"/>
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
			<input type="hidden" id="connectMaxCount" value="{$connectMaxCount}"/>

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
			<script type="text/javascript" src="/js/WebRTC/skyway-recorder-1.0.1.js?{$application_version}"></script>
			<script type="text/javascript" src="/js/WebRTC/screenshare.js?{$application_version}"></script>
			<script type="text/javascript" src="/js/WebRTC/screencapture.js?{$application_version}"></script>
			<!-- BodyPix -->
			<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.2" defer></script>
			<script src="https://cdn.jsdelivr.net/npm/@tensorflow-models/body-pix@2.0" defer></script>
			<script src="/js/negotiation/negotiation_bodypix_dialog.js?{$application_version}" defer></script>
			<script src="/js/negotiation/negotiation_bodypix.js?{$application_version}" defer></script>
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

			<script type="text/javascript" src="/js/WebRTC/MeetinDefault.js?{$application_version}"></script>
			<script type="text/javascript" src="/js/WebRTC/MeetinUtility.js?{$application_version}"></script>

			<script type="text/javascript" src="/js/WebSocket/MeetinWebSocketManager.js?{$application_version}"></script>
			<script type="text/javascript" src="/js/WebSocket/MeetinWebSocketProcManager.js?{$application_version}"></script>

			{if $browser === 'IE'}
			{else}
			<script type="text/javascript" src="/js/WebRTC/MeetinConnectionManager.js?{$application_version}"></script>
			<script type="text/javascript" src="/js/WebRTC/MeetinMediaManager.js?{$application_version}"></script>
			<script type="text/javascript" src="/js/WebRTC/MeetinCoreManager.js?{$application_version}"></script>
			<script type="text/javascript" src="/js/WebRTC/MeetinRTC_tab_capture.js?{$application_version}"></script>
			{/if}

			<script type="text/javascript" src="/js/flash/swfobject.js?{$application_version}"></script>
			<script type="text/javascript" src="/js/flash/flashUtility.js?{$application_version}"></script>

			<script type="text/javascript" src="/js/negotiation/negotiation_manager.js?{$application_version}"></script>
			<script type="text/javascript" src="/js/negotiation/negotiation_secret_voice.js?{$application_version}"></script>
			<script type="text/javascript" src="/js/negotiation/negotiation_interface_common.js?{$application_version}"></script>
			<script type="text/javascript" src="/js/negotiation/negotiation_interface_init.js?{$application_version}"></script>
			<script type="text/javascript" src="/js/negotiation/negotiation_interface_reconnect.js?{$application_version}"></script>
			<script type="text/javascript" src="/js/negotiation/negotiation_interface_camera.js?{$application_version}"></script>
			<script type="text/javascript" src="/js/negotiation/negotiation_interface_mic.js?{$application_version}"></script>
			<script type="text/javascript" src="/js/negotiation/negotiation_interface_screen.js?{$application_version}"></script>
			<script type="text/javascript" src="/js/negotiation/negotiation_interface_command_receive.js?{$application_version}"></script>
			<script type="text/javascript" src="/js/negotiation/negotiation_interface_command_send.js?{$application_version}"></script>

			<script type="text/javascript" src="/js/negotiation/negotiation_video.js?{$application_version}"></script>
			<script type="text/javascript" src="/js/negotiation/negotiation_main.js?{$application_version}"></script>
			<script type="text/javascript" src="/js/negotiation/negotiation_event_func.js?{$application_version}"></script>
			<script type="text/javascript" src="/js/negotiation/negotiation_reaction_func.js?{$application_version}"></script>
			{if $browser !== 'IE'}
				<script type="text/javascript" src="/js/negotiation/negotiation_audio_func.js?{$application_version}"></script>
				<script type="text/javascript" src="/js/WebSocket/RealTimeAudioRecognize.js?{$application_version}"></script>
				<script type="text/javascript" src="/js/negotiation/negotiation_conversation.js?{$application_version}"></script>
				<script type="text/javascript" src="/js/WebSocket/MediaStreamRecorder.js?{$application_version}"></script>
			{/if}

			<script type="text/javascript" src="/js/negotiation/negotiation_enter_room.js?{$application_version}"></script>
			<script type="text/javascript" src="/js/negotiation/negotiation_exit_room.js?{$application_version}"></script>
			<script type="text/javascript" src="/js/negotiation/negotiation_setting_camera.js?{$application_version}"></script>
			<script type="text/javascript" src="/js/negotiation/negotiation_extra_function.js?{$application_version}"></script>
			<script type="text/javascript" src="/js/negotiation/negotiation_system_requirements_browser.js?{$application_version}"></script>
			<script type="text/javascript" src="/js/negotiation/get_oldest_user_id.js?{$application_version}"></script>
			<script type="text/javascript" src="/js/negotiation/material.js?{$application_version}"></script>
			<script type="text/javascript" src="/js/negotiation/negotiation_login.js?{$application_version}"></script>
			<script type="text/javascript" src="/js/share_room_url.js?{$application_version}"></script>

		</div>
		<!-- wrap end -->

		<!--[if lt IE 8]>
		<script src="/js/ie7.js?{$application_version}"></script>
		<!--<![endif]-->
	</body>
</html>
