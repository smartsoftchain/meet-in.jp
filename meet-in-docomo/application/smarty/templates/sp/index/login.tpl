<!DOCTYPE html>
<html>
<head>
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>ログイン</title>
<meta charset="utf-8">
<meta name="description" content="">
<meta name="author" content="">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="shortcut icon" href="/img/favicon.ico">
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
</script>


<style>

.landscape {

}

.landscape .login__form--area {
    padding: 20px 0 30px;
    height: unset;
}

.landscape .login__form--logo {
	width: 252px;
	margin: 0 auto 20px;
}

.landscape .content__wrap {
  height: 100%;
}


</style>


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
						<input name="id" class="loginForm" type="text" placeholder="ID">
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
</body>
</html>

{literal}
<script>
window.addEventListener("orientationchange", function() {
    setOrientation();
});
function setOrientation() {
    if (Math.abs(window.orientation) === 90) {
        document.getElementsByTagName('body')[0].classList.add('landscape');
    } else {
        document.getElementsByTagName('body')[0].classList.remove('landscape');
    }
}
setOrientation();

</script>
{/literal}
