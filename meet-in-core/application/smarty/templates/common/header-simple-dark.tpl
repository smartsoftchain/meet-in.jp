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

		gtag('set', 'dimension1' , SURFPOINT.getOrgName()); //組織名
		gtag('set', 'dimension2' , SURFPOINT.getOrgUrl()); //組織 URL
		gtag('set', 'dimension3' , getIndL(SURFPOINT.getOrgIndustrialCategoryL())); //業種大分類
		gtag('set', 'dimension4' , getEmp(SURFPOINT.getOrgEmployeesCode())); //従業員数
		gtag('set', 'dimension5' , getTime()); //アクセス時刻
		gtag('set', 'dimension6' , getIpo(SURFPOINT.getOrgIpoType()));
		gtag('set', 'dimension7' , getCap(SURFPOINT.getOrgCapitalCode()));
		gtag('set', 'dimension8' , getGross(SURFPOINT.getOrgGrossCode()));
		gtag('set', 'dimension9' , SURFPOINT.getCountryJName());
		gtag('set', 'dimension10' , SURFPOINT.getPrefJName());
		gtag('set', 'dimension11' , SURFPOINT.getLineJName());
		gtag('send', 'pageview');
	</script>
	<!-- User Heat Tag -->
	<script type="text/javascript">
	(function(add, cla){window['UserHeatTag']=cla;window[cla]=window[cla]||function(){(window[cla].q=window[cla].q||[]).push(arguments)},window[cla].l=1*new Date();var ul=document.createElement('script');var tag = document.getElementsByTagName('script')[0];ul.async=1;ul.src=add;tag.parentNode.insertBefore(ul,tag);})('//uh.nakanohito.jp/uhj2/uh.js', '_uhtracker');_uhtracker({id:'uhu7hYUpVC'});
	</script>
	<!-- End User Heat Tag -->
	{/literal}
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<title>meet-in</title>
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
	{literal}
	<!-- Facebook Pixel Code -->
	<script>
		!function(f,b,e,v,n,t,s)
		{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
		n.callMethod.apply(n,arguments):n.queue.push(arguments)};
		if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
		n.queue=[];t=b.createElement(e);t.async=!0;
		t.src=v;s=b.getElementsByTagName(e)[0];
		s.parentNode.insertBefore(t,s)}(window, document,'script',
		'https://connect.facebook.net/en_US/fbevents.js');
		fbq('init', '251868542198394');
		fbq('track', 'PageView');
	</script>
	<noscript><img height="1" width="1" style="display:none"
		src="https://www.facebook.com/tr?id=251868542198394&ev=PageView&noscript=1"
	/></noscript>
	<!-- End Facebook Pixel Code -->

{/literal}
</head>
<body>

<!-- wrap start -->
<div id="mi_wrap">
	<!-- ヘッダー start -->
	<header>
		<!-- ワンポイントヘッダー start -->
		<div class="mi_flt-l">
			<div id="mi_header_title">
				<a {if !empty($user.client_id)}href="/index/menu"{/if} style="color:#ffffff">
					<img src="/img/meet-in_logo-2.png" alt="meet in" id="mi_header_logo"/>
				</a>
			</div>
		</div>
		<!--  ワンポイントヘッダー end -->

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

	</header>
	<!-- ヘッダー end -->

{literal}
<style type="text/css">

header{
	background: #373128;
	border: none;
	z-index: 0;
}
body {
	background: #373128;
}

#mi_header_logo {
	border-right: none;
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
	color:#ffaa00;
}

</style>


{/literal}


<!-- 汎用ダイアログ start -->
<div id="common_dialog_area">
</div>
<!-- 汎用ダイアログ end -->
