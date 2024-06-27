<!DOCTYPE html>
<html lang="ja">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta charset="UTF-8">
<meta name="keywords" content="">
<meta name="description" content="">

<title>TOP | Sales Crowd</title>

<link rel="stylesheet" href="/css/all.css?{$application_version}">
<link rel="stylesheet" href="/css/popup.css?{$application_version}">
<link rel="stylesheet" href="/css/customize.css?{$application_version}">
<!--追加用cssの読み込み-->
<link rel="stylesheet" href="/css/private_add.css?{$application_version}">
<link rel="stylesheet" href="/css/customize.css?{$application_version}">
<script src="/js/jquery-1.11.2.min.js?{$application_version}"></script>
<!--datepicker-->
<script src="/js/jquery-ui.min.js?{$application_version}"></script>
<script src="/js/datepicker-ui/jquery.ui.datepicker-ja.js?{$application_version}"></script>
<link rel="stylesheet" type="text/css" href="/js/datepicker-ui/jquery-ui.css?{$application_version}">
<script src="/js/jquery.cookie.js?{$application_version}"></script>
<script src="/src/handlebars-v3.0.3.js?{$application_version}"></script>
<script src="/js/common.js?{$application_version}"></script>
<script src="/js/customize.js?{$application_version}"></script>
</head>


<body>
<a name="pagetop" id="pagetop"></a><!-- label -->

<!-- 全体領域[start] -->
<div id="container">

	<!-- ヘッダー領域[start] -->
	<div id="header-area">

		<!-- ヘッダー[start] -->
		<div id="header" class="clearfix">
			<h1><a href="/admin/menu"><img src="/img/tmo_logo.png" alt="TMO"></a></h1>

			<ul class="dropmenu">
			  <li><p class="chrlimit1"> {$user.header_username} 様</p>
			    <ul>
			      <li class="center"><a href="/admin/logout">ログアウト</a></li>
			    </ul>
			  </li>
			</ul>

			<div id="font-change">
				<ul id="fontSizer" class="clearfix">
					<li id="font-s"><span>小</span></li>
					<li id="font-m"><span>中</span></li>
					<li id="font-l"><span>大</span></li>
				</ul>
			</div>
		</div>
		<!-- ヘッダー[end] -->

		<!-- グロナビ[start] -->
		<div id="navwrap" class="clearfix">
			<ul id="gnav">
				<li class="client hover-accordion"><h5 class="chrlimit2">AAアカウント管理</h5>
					<ul class="sub-menu">
						<li><a href="/admin/staff-list"><span>AAアカウント一覧</span></a></li>
						<li><a href="/admin/staff-regist"><span>AAアカウント登録</span></a></li>
					</ul>
				</li>
				<li class="client hover-accordion"><h5 class="chrlimit2">クライアント管理</h5>
					<ul class="sub-menu">
						<li><a href="/admin/client-list"><span>クライアント一覧</span></a></h6></li>
						<li><a href="/admin/client-regist"><span>クライアント登録</span></a></h6></li>
					</ul>
				</li>
				<li class="client hover-accordion"><h5 class="chrlimit2">在宅アカウント管理</h5>
					<ul class="sub-menu">
						<li><a href="/admin/home-staff-list"><span>在宅アカウント一覧</span></a></li>
						<li><a href="/admin/home-staff-regist"><span>在宅アカウント登録</span></a></li>
					</ul>
				</li>
			</ul>

		</div>
		<!-- グロナビ[end] -->

	</div>
	<!-- ヘッダー領域[end] -->
