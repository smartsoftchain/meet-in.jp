<!DOCTYPE html>
<html lang="ja">
<head>
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>dXオンライン営業 | ログインページ</title>
<meta charset="utf-8">
<meta name="description" content="dXオンライン営業に管理者用アカウントのログインページです。">
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
<script src="/js/common.js?{$application_version}"></script>

</head>
<body>

<!-- wrap start -->
<div id="mi_wrap">

	<!-- ヘッダー start -->
  <header id="login_header">

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
          <div class="mi_subtitle">いつでも、どこでも、すぐに商談</div>
          <img src="/img/logo_h50-2.png" alt="meet in" class="mi_logo_image"/>
					<p>IDとパスワードを入力してログインしてください。</p>
					{if !empty($errors)}
						<p class="error_msg" style="color: red; font-weight: bold;">{$errors[0]}</p>
					{/if}
					<form action="/index/login" method="post" name="login_form">
						<label for="id"><span>ID</span><input type="text" name="id" value="" placeholder="AA000000" class="mi_default_input" /><br></label>
						<label for="password"><span>パスワード</span><input type="password" name="password" value="" class="mi_default_input" /><br></label>

						<label style="margin-left: 0;"><input type="checkbox" id="1" name="autologin" value="1">ログイン情報を保持する</label>
						<button type="submit" name="button" class="mi_default_button hvr-fade">ログイン</button>
					</form>
					<p><a href="/index/reminder">パスワードを忘れた方はこちら</a></p>
			</div>
		</div>
		<!-- 商談接続画面 end -->

	</div>
	<!-- メインコンテンツ end -->

	<!-- フッター start -->
	<footer>
		<span class="mi_copyright">Copyright © NTT DOCOMO, INC. All rights reserved. {$application_version}</span>
	</footer>
	<!-- フッター end -->

</div>
<!-- wrap end -->

<!-- wrap end -->
<!--[if lt IE 8]>
<script src="/js/ie7.js?{$application_version}"></script>
<!--<![endif]-->
</body>
</html>
