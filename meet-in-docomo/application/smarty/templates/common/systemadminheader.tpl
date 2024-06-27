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
	<div>
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
						<li><a href="/system-admin/client-list"><span class="icon-company mi_default_label_icon"></span><div>クライアント管理</div></a></li>
						<li><a href="/index/logout"><span class="icon-logout mi_default_label_icon"></span><div>ログアウト</div></a></li>
					</ul>
				</div>
			</div>
			{/if}
			<!-- ユーザーメニュー end -->

			<!-- ヘッダーナビ start -->
			<div>
				<ul class="mi_header_link_list">
					<li class="mi_header_select mi_user_detail">
						<div class="user_setting">
							<span class="icon-folder mi_default_label_icon"></span>
							<div class="">背景一覧</div>
							<span class="icon-menu-down mi_default_label_icon mi_header_arrow_icon"></span>
						</div>
						<ul class="mi_select_option e_contract">
							<li><a href="/system-admin/background-list" class="fontsize_12"><div>背景画像一覧</div></a></li>
						</ul>
					</li>
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
		<input type="hidden" id="peer_id" value="{$peer_id}"/>
		<input type="hidden" id="target_peer_id"/>
		<input type="hidden" id="target_connect_no"/>
		<input type="hidden" id="target_connection_info_id"/>
		<input type="hidden" id="operator_name" value="{$user.staff_name}"/>
		<input type="hidden" id="screen_type" value="1"/>
		<input type="hidden" id="wait_connect_table_string" value="{$wait_connect_table_string}"/>

		<script type="text/javascript" src="/js/common/header.js?{$application_version}"></script>

	</header>
	<!-- ヘッダー end -->

</div>