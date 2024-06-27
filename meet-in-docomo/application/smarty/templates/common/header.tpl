<!DOCTYPE html>
<html lang="ja">
<head>
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<title></title>
	<meta charset="utf-8">
	<meta name="description" content="">
	<meta name="author" content="">
	<link rel="shortcut icon" href="/img/favicon.ico">
	<link rel="stylesheet" href="/css/fonts.css?{$application_version}">
	<!--[if lt IE 8]>
	<link rel="stylesheet" href="/css/ie7.css?{$application_version}">
	<!--<![endif]-->
	<link rel="stylesheet" href="/css/reset.css?{$application_version}">
	<link rel="stylesheet" href="/css/base.css?{$application_version}">
	<link rel="stylesheet" href="/css/document_list.css?{$application_version}">
	<link rel="stylesheet" href="/css/page.css?{$application_version}">
	<link rel="stylesheet" href="/css/design.css?{$application_version}">
	<link rel="stylesheet" href="/css/namecard.css?{$application_version}">
	<link rel="stylesheet" href="/css/e_contract.css?{$application_version}">
	<link rel="stylesheet" href="/css/room_share.css?{$application_version}">
	<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
	<script src="/js/jquery-1.11.2.min.js?{$application_version}"></script>
	<script src="/js/jquery-migrate-1.2.1.min.js?{$application_version}"></script>
	<link rel="stylesheet" href="/css/tooltipster.bundle.min.css?{$application_version}">
	<link rel="stylesheet" href="/css/lib/tooltipster/sideTip/themes/tooltipster-sideTip-borderless.min.css?{$application_version}">
	<link rel="stylesheet" href="/css/lib/tooltipster/sideTip/themes/tooltipster-sideTip-light.min.css?{$application_version}">
	<script src="/js/tooltipster.bundle.min.js?{$application_version}"></script>
	<!-- SC use js begin -->
		<!--datepicker-->
		<script src="/js/jquery-ui.min.js?{$application_version}"></script>
		<script src="/js/datepicker-ui/jquery.ui.datepicker-ja.js?{$application_version}"></script>
		<link rel="stylesheet" type="text/css" href="/js/datepicker-ui/jquery-ui.css?{$application_version}">

		<script src="/js/jquery.cookie.js?{$application_version}"></script>
		<script src="/src/jquery.blockUI.js?{$application_version}"></script>
		<script src="/src/handlebars-v3.0.3.js?{$application_version}"></script>
	<!-- SC use js end -->
	<link rel="stylesheet" href="/css/jquery-ui.css?{$application_version}">
	<script src="/js/common.js?{$application_version}"></script>
	<script src="/js/design.js?{$application_version}"></script>

	<script type="text/javascript" src="/js/detectSpeed.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/Utility.js?{$application_version}"></script>

	<script type="text/javascript" src="/js/WebRTC/MeetinDefault.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/WebRTC/MeetinUtility.js?{$application_version}"></script>

	<script type="text/javascript" src="/js/MeetinAPI.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/WebSocket/MeetinWebSocketManager.js?{$application_version}"></script>
</head>
<body>

<!-- wrap start -->
<div id="mi_wrap">
	<audio id="call_audio" src="/webrtc/sounds/ringbacktone.wav" loop></audio>
	<!-- ヘッダー start -->
	<header>

		<!-- ヘッダー左 start -->
		<div class="mi_flt-l">

			<!-- タイトル start -->
			<div id="mi_header_title">
				<a {if !empty($user.client_id)}href="/index/menu"{/if} style="color:#ffffff">
					<img src="/img/logo_header.png" alt="meet in" id="mi_header_logo"/>
				</a>
			</div>
			<!-- タイトル end -->

		</div>
		<!-- ヘッダー左 end -->

		<!-- ヘッダー右 start -->
		<div class="mi_flt-r">
			<!-- ユーザーメニュー start -->
			{if !empty($user)}
				<div>
					<div class="mi_header_select mi_user_detail">
						<div class="user_setting">
							<div class="user_settingInner">
								<span class="user_icon" style="background: url({$user.profile_image}?{$smarty.now}) center center no-repeat;background-size: 20px 20px;"></span>
								<span class="user_setting_staff-name">{$user.header_username}</span>
								<span class="icon-menu-down mi_header_select_arrow_icon"></span>
							</div>
						</div>
						<ul class="mi_select_option">
                            {if !empty($user)}
                                {if $user.staff_type == "AA" || $user.staff_type == "TA"}
                                    {if !empty($user.client_id) && $user.client_id != 0}
                                    <li>
                                        <div class="client_setting">
                                            <a href="/client/list">
                                                <span class="icon-company mi_default_label_icon"></span>
                                                <div>{$user.header_clientname}</div>
                                                <span class="icon-menu-down mi_default_label_icon mi_header_arrow_icon"></span>
                                            </a>
                                        </div>
                                    </li>
                                    {/if}
                                {else}
                                <li>
                                    <div class="client_setting" style="cursor: default">
                                        <span class="icon-company mi_default_label_icon"></span>
                                        <div>{$user.header_clientname}</div>
                                    </div>
                                </li>
                                {/if}
                            {/if}
							<li>
								<a href="/admin/staff-regist?staff_type={$user.staff_type}&staff_id={$user.staff_id}&client_id={$user.client_id}">
									<span class="icon-configuration-personal mi_default_label_icon"></span><div>個人設定</div>
								</a>
							</li>
							{if $browser != 'IE' && $browser != 'Safari'}
							<li>
								<a href="/admin/document-settings-background">
									<span class="icon-report mi_default_label_icon"></span><div>背景設定</div>
								</a>
							</li>
							{/if}
							{if !empty($user.client_id) && ($user.staff_role == "AA_1" || $user.staff_role == "CE_1")}
								<!-- 2020/11/27 オープンセミナー部分コメントアウト  start      -->

								<!-- <li>
									<a href="javascript:void(0)" id="toggle_webinar_setting">
										<span class="icon-report mi_default_label_icon"></span>
										<div>ウェビナー設定</div>
										<span class="icon-menu-06 icon_arrow_webinar_setting"></span>
									</a>
								</li>
								<li id="menu_webinar_setting_default" class="hide_style"><a href="/open-seminar/default"><span class="mi_default_label_icon"></span><div>デフォルト設定</div></a></li>
								<li id="menu_webinar_setting_template" class="hide_style"><a href="/open-seminar/template-list"><span class="mi_default_label_icon"></span><div>テンプレート一覧</div></a></li> -->

								<!-- 2020/11/27 オープンセミナー部分コメントアウト  end      -->
							{/if}
							{if !empty($user.client_id) && ($user.staff_role == "AA_1" || $user.staff_role == "CE_1")}
								<li><a href="/setting-log/operation-log-list"><span class="icon-report mi_default_label_icon"></span><div>操作ログ</div></a></li>
							{/if}
							{if !empty($user.client_type) && $user.client_type == "2" && ($user.staff_role == "AA_1" || $user.staff_role == "CE_1" || $user.staff_role == "CE_2")}
								<li><a href="/setting-log/operation-distributor-client-log-list"><span class="icon-report mi_default_label_icon"></span><div>顧客操作ログ</div></a></li>
							{/if}

							{if !empty($user.client_id) && ($user.staff_role == "AA_1" || $user.staff_role == "CE_1")}
								<li><a href="/admin/client-edit?staff_type={$user.staff_type}&client_id={$user.client_id}&ret=top"><span class="icon-company mi_default_label_icon"></span><div>企業情報設定</div></a></li>
							{/if}
							{if $user.staff_type == "AA" && $user.staff_role == "AA_1"}
								<li><a href="/admin/staff-list?staff_type=AA"><span class="icon-account-parsonal mi_default_label_icon"></span><div>アカウント発行・管理</div></a></li>
							{/if}
							{if !empty($user.client_id) && ($user.staff_role == "AA_1" || $user.staff_role == "CE_1")}
								<li><a href="/admin/negotiation-tmpl-list"><span class="icon-comment mi_default_label_icon"></span><div>商談結果設定</div></a></li>
							{/if}
							{if !empty($user.client_id) && ($user.staff_role == "AA_1" || $user.staff_role == "CE_1")}
								<li><a href="/admin/embed-link-publish"><span class="icon-comment mi_default_label_icon"></span><div>埋込タグ発行</div></a></li>
							{/if}
							{if !empty($user.client_id) && ($user.staff_role == "AA_1" || $user.staff_role == "AA_2" || $user.staff_role == "CE_1")}
								<li><a href="/setting-log/client-log-detail"><span class="icon-report mi_default_label_icon"></span><div>利用状況集計</div></a></li>
							{/if}
							{if $user.special_staff == 1}
								<li><a href="/admin/aggregate-list"><span class="icon-report mi_default_label_icon"></span><div>集計</div></a></li>
							{/if}
							{if $user.staff_type == "AA" && $user.staff_role == "AA_1"}
								<li><a href="/admin/notification-list"><span class="icon-notification mi_default_label_icon"></span><div>お知らせ管理</div></a></li>
							{/if}
							{if $webinar_available_time}
								{* <li><a href="/mail-template"><span class="icon-mail mi_default_label_icon"></span><div>メールテンプレート</div></a></li> *}
							{/if}
							{* <li><a href="https://crowd-calendar.com/lp" target="_blank" rel="noopener noreferrer"><span class="icon-calendar-o16 mi_default_label_icon"></span><div>カレンダー</div></a></li> *}
							<li><a href="/index/logout"><span class="icon-logout mi_default_label_icon"></span><div>ログアウト</div></a></li>
						</ul>
					</div>
				</div>
			{/if}
			<!-- ユーザーメニュー end -->

			{if !empty($user.client_id)}
			<!-- サポート start-->
			<div class="mi_utility_headerBtn icon-help-wrap">
				<a href="https://manual.meet-in.jp/" target="_blank" class="mi_utility_headerBtnLink help-tooltip">
					<div class="mi_utility_headerBtnInner">
						<i class="material-icons mi_utility_headerBtnIcon">help_outline</i>
					</div>
				</a>
			</div>
			<!-- サポート end-->

			<!-- お知らせ start -->
			<div class="mi_utility_headerBtn icon-notification-wrap">
				<a href="/notification/list" class="mi_utility_headerBtnLink notification-tooltip">
					<div class="mi_utility_headerBtnInner">
						<span class="icon-notification mi_utility_headerBtnIcon"></span>
						{if $unreadNotificationCount != 0}
							<span class="notification-budge">
								<span id="notification-unread-count">{$unreadNotificationCount}</span>
							</span>
						{/if}
					</div>
				</a>
			</div>
			<!-- お知らせ end -->

			{if $user.webphone_id != ""}
			<!-- 電話ダイアログボタン start -->
			{* <div class="mi_utility_headerBtn icon-call-wrap">
				<a href="javascript:void(0)" class="mi_utility_headerBtnLink show_telephone tel-tooltip">
					<div class="mi_utility_headerBtnInner">	
						<span class="icon-call mi_utility_headerBtnIcon"></span>
					</div>
					</a>
			</div> *}
			<!-- 電話ダイアログボタン end -->
			{/if}
			{/if}

			<!-- ヘッダーナビ start -->
			<div>
				<ul class="mi_header_link_list">
					{if $webinar_available_time}
						{* <li class="hvr-underline-from-center mi_header_select mi_user_detail hvr-underline-from-center--headerMenu {if $controllerName|mb_strpos:'webinar-' !== FALSE} active{/if}">
							<div class="user_setting">
								<span class="icon-folder mi_default_label_icon mi_default_label_icon--b"></span>
								<div class="">ウェビナー</div>
								<span class="icon-menu-down mi_default_label_icon mi_header_arrow_icon"></span>
							</div>
							<ul class="mi_select_option e_contract">
								<li><a href="/webinar/list" class="fontsize_12"><div>ウェビナー一覧</div></a></li>
								<li><a href="/questionnaire/quiestionnaire-list" class="fontsize_12"><div>アンケート一覧</div></a></li>
								<li><a href="/webinar-lead/list" class="fontsize_12"><div>リード一覧</div></a></li>
							</ul>
						</li> *}
					{/if}
					{if !empty($user.client_id) && ($user.staff_role == "AA_1" || $user.staff_role == "CE_1" || (($user.staff_role == "AA_2" || $user.staff_role == "CE_2") && $user.e_contract_authority_flg == 1))}
                        {* <li class="hvr-underline-from-center mi_header_select mi_user_detail hvr-underline-from-center--headerMenu {if $controllerName == 'e-contract-api'} active{/if}">
							<div class="user_setting">
                                <span class="icon-folder mi_default_label_icon mi_default_label_icon--b"></span>
								<div class="">電子契約設定</div>
								<span class="icon-menu-down mi_default_label_icon mi_header_arrow_icon"></span>
							</div>
							<ul class="mi_select_option e_contract">
								<li><a href="/e-contract-api/credential" class="fontsize_12"><span class="icon-configuration mi_default_label_icon"></span><div>クレデンシャル発行</div></a></li>
								{if ($user.staff_role == "AA_1" || $user.staff_role == "CE_1")}
								<li><a href="/e-contract-api/certificate-regist" class="fontsize_12"><span class="icon-memo mi_default_label_icon"></span><div>電子証明書申請</div></a></li>
								<li><a href="/e-contract-api/certificate" class="fontsize_12"><span class="icon-businesscard mi_default_label_icon"></span><div>電子証明書付与状況</div></a></li>
								<li><a href="/e-contract-api/sign-image-regist" class="fontsize_12"><span class="icon-highlight-draw mi_default_label_icon"></span><div>印影画像作成・設定</div></a></li>
								{/if}
								<li><a href="/e-contract-api/templates" class="fontsize_12"><span class="icon-report mi_default_label_icon"></span><div>契約書テンプレート</div></a></li>
								<li><a href="/e-contract-api/confirming" class="fontsize_12"><span class="icon-folder mi_content_title_icon"></span><div>電子契約書一覧</div></a></li>
							</ul>
						</li> *}
					{/if}
					{if (!empty($user.client_id) && ($user.staff_role == "AA_1" || $user.staff_role == "CE_1" || $user.staff_role == "CE_2" ) && $user.plan_this_month > 1) || $user.trialUserFlg == 1}
                        <li class="hvr-underline-from-center{if $controllerName == 'admin' && $actionName == 'material-list'} active{/if}">
							<a href="/admin/material-list">
								<span class="icon-folder mi_default_label_icon mi_default_label_icon--b"></span>
								資料ファイル
							</a>
						</li>
					{/if}
					{if !empty($user.client_id) && $user.plan_this_month > 1}
                        <li class="hvr-underline-from-center mi_header_select mi_user_detail hvr-underline-from-center--headerMenu {if $controllerName == 'negotiation'} active{/if}">
							<div class="user_setting">
								<span class="icon-history mi_default_label_icon mi_default_label_icon--b" style="margin-left:20px;"></span>
								<div class="">履歴</div>
								<span class="icon-menu-down mi_default_label_icon mi_header_arrow_icon"></span>
							</div>
							<ul class="mi_select_option history">
								<li><a href="/negotiation/negotiation-list" class="fontsize_12"><span class="icon-history mi_default_label_icon" id="icon-history" style="color:#0081CC; margin-top: 0px;"></span><div>接続履歴一覧</div></a></li>
								<li><a href="/negotiation/negotiation-text-list" class="fontsize_12"><img src="/img/sp/svg/get-text-main.svg" style="width: 20px; margin: 16px 7px 0 0;"><div>文字起こしファイル一覧</div></a></li>
								{* <li class="audio_analysis_display_menu"><a href="/analysis-audio/show-audio-data-list" class="fontsize_12"><img class="form_arrow_icon search_modal_form" src="/img/audio-analysis.svg" style="margin-top: 16px;margin-right: 10px;"></span><div>音声分析一覧</div></a></li>
								<li class="audio_analysis_display_menu"><a href="/analysis-audio/analysis" class="fontsize_12"><img class="form_arrow_icon search_modal_form" src="/img/audio-analysis.svg" style="margin-top: 16px;margin-right: 10px;"><div>音声データ集計</div></a></li> *}


								{if $user.client_id == "1" && ($user.staff_type == "AA" || $user.staff_type == "CE")}
								{* <li class="audio_analysis_display_menu"><a href="/negotiation/negotiation-video-list" class="fontsize_12"><img class="form_arrow_icon search_modal_form" src="/img/icon_video_orange.png" style="margin-top: 16px;margin-right: 10px;"><div>録画履歴一覧</div></a></li> *}
								{/if}

							</ul>
						</li>
					{/if}
				</ul>
			</div>
			<!-- ヘッダーナビ end -->

		</div>
		<!-- ヘッダー右 end -->

		<input type="hidden" id="client_id" value="{$user.client_id}"/>
		<input type="hidden" id="staff_type" value="{$user.staff_type}"/>
		<input type="hidden" id="staff_id" value="{$user.staff_id}"/>
		<input type="hidden" id="staff_role" value="{$user.staff_role}"/>
		<input type="hidden" id="desktop_notify_flg" value="{$user.desktop_notify_flg}"/>
		<input type="hidden" id="connect_no" value="{$user.meetin_number}"/>
		<input type="hidden" id="connection_info_id"/>
		<input type="hidden" id="negotiation_room_type" value="{$user.negotiation_room_type}">
		<input type="hidden" id="peer_id" value="{$peer_id}"/>
		<input type="hidden" id="target_peer_id"/>
		<input type="hidden" id="target_connect_no"/>
		<input type="hidden" id="target_connection_info_id"/>
		<input type="hidden" id="operator_name" value="{$user.staff_name}"/>
		<input type="hidden" id="client_name" value="{$user.client_name}"/>
		<input type="hidden" id="screen_type" value="1"/>
		<input type="hidden" id="wait_connect_table_string" value="{$wait_connect_table_string}"/>

		<script type="text/javascript" src="/js/common/header.js?{$application_version}"></script>

	</header>
	<!-- ヘッダー end -->

{literal}
<script>
	// 音声分析表示判定に用いる件数取得用
	$(document).ready(function() {
		$.ajax({
			url: "/analysis-audio/show-audio-data-list-count",
			type: "GET",
			data: {},
			success: function(resultCount) {
				if (resultCount > 0) {
					$('.audio_analysis_display_menu').show();
				} else {
					$('.audio_analysis_display_menu').hide();
				}
			}
			
		})
	});

	// お知らせ未読件数 100件以上の場合に表示を99+に変える
	$(document).ready(function() {
		const unreadNotificationCount = parseInt($('#notification-unread-count').text(), 10);
		if (unreadNotificationCount > 99) {
			// .notification-budge のスタイルを変更
			$('.notification-budge').css({
				"left": "15px",
				"width": "27px",
				"border-radius": "50%"
			});
			// テキスト書き換え
			$('#notification-unread-count').text('99+');
		}
	});
</script>
<style type="text/css">
/*-------------------------------------
	履歴メニュー用 CSS
--------------------------------------*/
.audio_analysis_display_menu {
	display: none;
}
/*-------------------------------------
	（モーダル）基本型
--------------------------------------*/

#call_proc_dialog {
  display: none;
  position: fixed;
  height: 100%;
  width: 100%;
  top: 0%;
  left: 0%;
	z-index: 10051;
	border: none;
	box-shadow: -10px 10px 11px 1px rgba(128, 128, 128, 0.51);
}

#call_proc_dialog_inner-wrap {
	position: fixed;
	height: 400px;
	width: 300px;
	min-width: 300px;
	min-height: 400px;
	line-height: 1.2;
	background: #fff;
	padding: 20px 30px;
}


/* モーダル */
#call_proc_dialog_inner-wrap h5 {
		padding: 5px 0 10px 0;
		font-size: 1.3em;
		font-weight: bold;
		color: #215b82;
}

/*-----------------------
	モーダル領域
------------------------*/
#deny_connection_request:active,
#deny_connection_request:hover {
	color: #6e6e6e;
}


/*-----------------------
	オペレーター着信モーダル領域
------------------------*/

#call_proc_dialog_title {
	color:#0081CC;
}


</style>


{/literal}

<!-- ====================================== モーダルコンテンツ[start] ====================================== -->
<div class="call_proc_dialog" id="call_proc_dialog"> <!-- id="db-log2"	-->
	<div class="mi_modal_shadow"></div>
	<div class="mi_modal_default" id="call_proc_dialog_inner-wrap">
		<div id="connection_request_comming_dialog" class="model_call_operator">
			<div class="sub_title model_call_operator_title" id="call_proc_dialog_title">着信中</div>
			<div class="sub_title" id="user_info" style="text-overflow: ellipsis;overflow: hidden;white-space: nowrap;"></div>
			<div class="call_operator_icon"><span class="icon-parsonal"></span></div>
			<div class="sub_message" id="call_proc_dialog_message">ゲストがコンタクトを求めています。</div>
			<div class="btn_connection_area mi_modal_btn_wap">
				<button type="button" class="btn_connection" id="accept_connection_request" onClick="acceptConnectionRequest(1);">接続</button>
				<!--<a href="javascript:" class="btn_connection_link" id="accept_connection_request">接続</a>-->
			</div>
			<div class="btn_rejection_area">
				<a href="javascript:denyConnectionRequest2('オペレータが取り込み中です。');" class="" id="deny_connection_request_operator" >接続を拒否する</a>
				<a href="javascript:denyConnectionRequest2();" class="" id="deny_connection_request_guest" >発信キャンセル</a>
			</div>
		</div>
	</div>
</div>
<!-- ====================================== モーダルコンテンツ[end] ======================================== -->

<!-- 汎用ダイアログ start -->
<div id="common_dialog_area">
</div>
<!-- 汎用ダイアログ end -->
