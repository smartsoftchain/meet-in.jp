<!DOCTYPE html>
<html>
<head>
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>ログイン</title>
<meta charset="utf-8">
<meta name="description" content="">
<meta name="author" content="">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="shortcut icon" href="">
<link rel="stylesheet" href="/css/sp/login.css">
<link rel="stylesheet" href="/css/reset.css">
<link rel="stylesheet" href="/css/sp/button.css">
<script src="/js/jquery-1.11.2.min.js?{$application_version}"></script>
<script src="/js/jquery-ui.min.js?{$application_version}"></script>
{literal}
<script>
$(function(){
	// ログイン情報入力画面へ遷移する
	$('#login').click(function() {
		$('[name=login_form]').submit();
	});
});

$(function () {
	$('.input_text_upper').focusout(function (e) {
		$(this).val($(this).val().toUpperCase());
	});
});
</script>
{/literal}
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
	<div class="content__wrap">
		<div class="login__form--area">
			<img src="/img/sp/png/meet-in logo plus text.png" class="login__form--logo" />
			<p>IDとパスワードを入力してログインしてください。</p>
			<div style="margin-top: 10px; font-size: 12px;font-weight: bold; color: red">
				{if !empty($errors)}
					{$errors[0]}
				{/if}
			</div>
			<form action="/index/login" method="post" name="login_form">
				<div class="login__form--inputs">
					<div class="login__form--input">
						<img src="/img/sp/svg/login ID icon__Icon.svg" class="login__form--image">
						<input name="id" class="loginForm input_text_upper" type="text" placeholder="ID">
					</div>
					<div class="login__form--input">
						<img src="/img/sp/svg/login Password icon__Icon.svg" class="login__form--image">
						<input name="password" class="loginForm" type="password" placeholder="パスワード">
					</div>
				</div>
				<div id="login" class="defaultBtn loginBtn">ログイン</div>
				<!--
				<div class="login__form--options">
				<a href="#" class="login__form--option">パスワードを忘れたからはこちら</a>
				<a href="#" class="login__form--option">新規登録はこちら</a>
				</div>
				-->
			</form>
		</div>
	</div>
	<img src="/img/sp/png/buildings__Png.png" class="buildings_image" />
</body>
</html>
