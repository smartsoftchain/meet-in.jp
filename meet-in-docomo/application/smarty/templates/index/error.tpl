<!DOCTYPE html>
<html lang="ja">
<head>
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>エラー</title>
<meta charset="utf-8">
<meta name="author" content="">
<link rel="shortcut icon" href="/img/favicon.ico">
<link rel="stylesheet" href="/css/fonts.css?{$application_version}">
<!--[if lt IE 8]>
<link rel="stylesheet" href="/css/ie7.css?{$application_version}">
<!--<![endif]-->
<link rel="stylesheet" href="/css/reset.css?{$application_version}">
<link rel="stylesheet" href="/css/base.css?{$application_version}">
<link rel="stylesheet" href="/css/page.css?{$application_version}">
<script src="/js/jquery-1.11.2.min.js?{$application_version}"></script>
</head>
<body>

<!-- wrap start -->
<div id="mi_wrap">

	<!-- ヘッダー start -->
  <header id="login_header">

		<!-- ヘッダー左 start -->
		<div class="mi_flt-l">

			<!-- タイトル start -->
			<div id="mi_header_title">
			</div>
			<!-- タイトル end -->

		</div>
		<!-- ヘッダー左 end -->

	</header>
	<!-- ヘッダー end -->

	<!-- メインコンテンツ start -->

	<div id="mi_admin_login_form">

		<!-- 背景 start -->
		<div class="mi_half_background mi_img_slide_wrap">
			<div class="mi_img_slide_wrap_inner">
				<div class="mi_img_slide_list mi_login_let_img_1"></div>
			</div>
		</div>

		<!-- 背景 end -->

		<!-- 商談接続画面 start -->
		<div class="mi_half_background mi_admin_login_form_wrap">
			<div id="mi_admin_login_form_innner">
				<a href ="/"><img src="/img/logo_h50-2.png" alt="meet in" class="mi_logo_image"/></a>
				{if !empty($errors)}
					<p class="error_msg" style="color: #E16A6C; font-size: 14px;">{$errors}</p>
				{/if}
			</div>
		</div>
		<!-- 商談接続画面 end -->

	</div>
	<!-- メインコンテンツ end -->

</div>
<!-- wrap end -->

<!-- wrap end -->
<!--[if lt IE 8]>
<script src="/js/ie7.js?{$application_version}"></script>
<!--<![endif]-->
</body>
</html>
