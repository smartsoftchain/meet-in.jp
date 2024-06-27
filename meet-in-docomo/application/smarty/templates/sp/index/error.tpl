<!DOCTYPE html>
<html>
<head>
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>エラー</title>
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

.landscape .content__wrap {
	height: 100vh;
	display: flex;
    align-items: center;
    padding-top: 0;
}


.landscape .login__form--area {
	width:  70vw;
}

.landscape .login__form--area.error {
	padding: 20px 0 40px;
}

.landscape .login__form--logo {
    width: 252px;
    margin: 0 auto 0px;
}


</style>

{/literal}

</head>
<body>
	<div class="content__wrap">
		<div class="login__form--area error">
			<a href="/"><img src="/img/sp/png/meet-in logo plus text.png" class="login__form--logo" /></a>
			<div style="margin-top: 10px; font-size: 12px; color: #E16A6C; line-height:1.6666">
				{if !empty($errors)}
					{$errors}
				{/if}
			</div>
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
