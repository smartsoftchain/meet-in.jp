<!DOCTYPE html>
<html lang="ja">
<head>
	{literal}
	<!-- Global site tag (gtag.js) - Google Analytics -->
	<script type="text/javascript" src="//api.docodoco.jp/v5/docodoco?key=V2wS05VZSdDj9oJJcnagCPOhXqRjWkSXxUSkvjBNq9Jozaga3HbGnr8MWC9kJB2G" charset="utf-8"></script>
	<script type="text/javascript" src="//api.docodoco.jp/docodoco_ua_plugin_2.js" charset="utf-8"></script>
	<script async src="https://www.googletagmanager.com/gtag/js?id=UA-48144639-6"></script>
	<script>
	  window.dataLayer = window.dataLayer || [];
	  function gtag(){dataLayer.push(arguments);}
	  gtag('js', new Date());

	  gtag('config', 'UA-48144639-6');

		ga('set', 'dimension1' , SURFPOINT.getOrgName()); //組織名
		ga('set', 'dimension2' , SURFPOINT.getOrgUrl()); //組織 URL
		ga('set', 'dimension3' , getIndL(SURFPOINT.getOrgIndustrialCategoryL())); //業種大分類
		ga('set', 'dimension4' , getEmp(SURFPOINT.getOrgEmployeesCode())); //従業員数
		ga('set', 'dimension5' , getTime()); //アクセス時刻
		ga('set', 'dimension6' , getIpo(SURFPOINT.getOrgIpoType()));
		ga('set', 'dimension7' , getCap(SURFPOINT.getOrgCapitalCode()));
		ga('set', 'dimension8' , getGross(SURFPOINT.getOrgGrossCode()));
		ga('set', 'dimension9' , SURFPOINT.getCountryJName());
		ga('set', 'dimension10' , SURFPOINT.getPrefJName());
		ga('set', 'dimension11' , SURFPOINT.getLineJName());
		ga('send', 'pageview');
	</script>
	{/literal}
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
	<script src="/js/jquery-1.11.2.min.js?{$application_version}"></script>

	<script src="/js/jquery-migrate-1.2.1.min.js?{$application_version}"></script>
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
<!--
					<img src="/img/logo_header.png" alt="meet in" id="mi_header_logo"/>
-->
					<img src="/img/projectavatar-1.png" alt="meet in" id="mi_header_logo"/>
				</a>
			</div>
			<!-- タイトル end -->

			<!-- セレクトメニュー start -->

			<div class="mi_header_select" id="mi_header_select_wrap">
				{if $user.staff_type == "AA" || $user.staff_type == "TA"}
					{if !empty($user.client_id) && $user.client_id != 0}
						<div class="client_setting">
							<span class="icon-company mi_default_label_icon"></span>
							<div>{$user.header_clientname}</div>
							<span class="icon-menu-down mi_default_label_icon mi_header_arrow_icon"></span>
						</div>
						<ul class="mi_select_option">
							<li><a href="/client/list">クライアント再選択</a></li>
						</ul>
					{else}
						<div id="select_client">
							<span class="icon-company mi_default_label_icon"></span>
							<div>クライアント選択	</div>
							<span class="icon-menu-down mi_default_label_icon mi_header_arrow_icon"></span>
						</div>
					{/if}
				{else}
					<div class="client_setting" style="color:#ffffff;cursor: default">
						<span class="icon-company mi_default_label_icon"></span>
						<div>{$user.header_clientname}</div>
					</div>
				{/if}
			</div>
			<!-- セレクトメニュー end -->

		</div>
		<!-- ヘッダー左 end -->

		<!-- ヘッダー右 start -->
		<div class="mi_flt-r">

			<!-- ユーザーメニュー start -->
			<div>
				<div class="mi_header_select mi_user_detail">
					<div class="user_setting">
						<div class="user_icon" style="background: url({$user.profile_image}?{$smarty.now}) center center no-repeat;background-size: 20px 20px;"></div>
						<div>{$user.header_username}</div>
						<span class="icon-menu-down mi_default_label_icon mi_header_arrow_icon"></span>
					</div>
					<ul class="mi_select_option">
						<li>
							<a href="/admin/staff-regist?staff_type={$user.staff_type}&staff_id={$user.staff_id}&client_id={$user.client_id}">
								<span class="icon-configuration-personal mi_default_label_icon"></span><div>個人設定</div>
							</a>
						</li>
						{if !empty($user.client_id) && ($user.staff_role == "AA_1" || $user.staff_role == "CE_1")}
							<li><a href="/setting-log/operation-log-list"><span class="icon-report mi_default_label_icon"></span><div>操作ログ</div></a></li>
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
						{if $user.special_staff == 1}
							<li><a href="/admin/aggregate-list"><span class="icon-report mi_default_label_icon"></span><div>集計</div></a></li>
						{/if}
						<li><a href="/index/logout"><span class="icon-logout mi_default_label_icon"></span><div>ログアウト</div></a></li>
					</ul>
				</div>
			</div>
			<!-- ユーザーメニュー end -->

			{if !empty($user.client_id)}
				{if $user.webphone_id != ""}
				<span class="icon-call mi_default_label_icon show_telephone tel_btn"></span>
				{/if}
			{/if}

			<!-- ヘッダーナビ start -->
			<div>
				<ul class="mi_header_link_list">
					{if !empty($user.client_id) && ($user.staff_role == "AA_1" || $user.staff_role == "CE_1")}
						<li class="hvr-underline-from-center{if $controllerName == 'admin' && $actionName == 'material-list'} active{/if}">
							<a href="/admin/material-list">
								<span class="icon-folder mi_default_label_icon"></span>
								<div class="">資料ファイル</div>
							</a>
						</li>
					{/if}
					{if !empty($user.client_id)}
						<li class="hvr-underline-from-center{if $controllerName == 'negotiation' && $actionName == 'negotiation-list'} active{/if}">
							<a href="/negotiation/negotiation-list">
								<span class="icon-history mi_default_label_icon"></span>
								<div class="">接続履歴</div>
							</a>
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

{literal}
<style type="text/css">
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
	color:#35a0d4;
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
