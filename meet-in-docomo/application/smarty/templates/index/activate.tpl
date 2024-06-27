<!DOCTYPE html>
<html lang="ja">
<head>
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>パスワード再設定</title>
<meta charset="utf-8">
<meta name="description" content="">
<meta name="author" content="">
<link rel="shortcut icon" href="/img/favicon.ico">
<link rel="stylesheet" href="/css/fonts.css?{$application_version}">
<!--[if lt IE 8]>
<link rel="stylesheet" href="/css/ie7.css?{$application_version}">
<![endif]-->
<link rel="stylesheet" href="/css/reset.css?{$application_version}">
<link rel="stylesheet" href="/css/base.css?{$application_version}">
<link rel="stylesheet" href="/css/page.css?{$application_version}">

<script src="/js/jquery-1.11.2.min.js?{$application_version}"></script>
<script src="/js/common.js?{$application_version}"></script>

{literal}
<style type="text/css">

#mi_admin_reminder_form_innner {
    position: absolute;
    right: 0;
    left: 0%;
    height: 400px;
    top: 0;
    bottom: 0;
    min-height: 400px;
    width: 350px;
    margin: auto;
    text-align: left;
    color: #333;
}

</style>
{/literal}
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
				<a href="/">
					<img src="/img/logo_header.png" alt="meet in" id="mi_header_logo"/>
				</a>
			</div>
			<!-- タイトル end -->

		</div>
		<!-- ヘッダー左 end -->

	</header>
	<!-- ヘッダー end -->

	<!-- メインコンテンツ start -->

	<div id="mi_admin_login_form">

		<!-- パスワード再設定画面 start -->
		<div class="mi_admin_login_form_wrap">
			<div id="mi_admin_reminder_form_innner">
				<div class="mi_subtitle">パスワード再設定</div>
					<p>仮パスワードと変更するパスワードを入力してください。<br>登録したメールアドレスにパスワードを送信します。</p>
					{if $errorList|@count gt 0}
					<p class="errmsg mb10">
						<strong>
							{foreach from=$errorList item=error}
								{foreach from=$error item=row}
									{$row}<br>
								{/foreach}
							{/foreach}
						</strong>
					</p>
					{/if}
					<form action="/index/activate" method="post" name="login_form">
						<input type="hidden" name="id" value="{$staffDict.staff_type}{$staffDict.staff_id}" />
						<label for="id"><span>ID</span><input type="text" name="id" value="{$staffDict.staff_type}{$staffDict.staff_id}" placeholder="AA000000" class="mi_default_input" disabled/><br></label>
						<label for="id"><span>仮パスワード</span><input type="password" name="temp_pw" value="" class="mi_default_input" autocomplete="new-password"/><br></label>
						<label for="id"><span>変更パスワード</span><input type="password" name="password" value="" class="mi_default_input" autocomplete="new-password"/><br></label>
						<label for="id"><span>確認用パスワード</span><input type="password" name="confirm_password" value="" class="mi_default_input" autocomplete="new-password"/><br></label>
						<button type="submit" name="button" class="mi_default_button hvr-fade">変更する</button>
					</form>
			</div>
		</div>
		<!-- パスワード再設定画面 end -->

	</div>
	<!-- メインコンテンツ end -->

	<!-- フッター start -->
	<footer>
		<span class="mi_copyright">Copyright © NTT DOCOMO, INC. All rights reserved.</span>
	</footer>
	<!-- フッター end -->

</div>
<!-- wrap end -->

<!-- wrap end -->
<!--[if lt IE 8]>
<script src="/js/ie7.js?{$application_version}"></script>
<![endif]-->
</body>
</html>