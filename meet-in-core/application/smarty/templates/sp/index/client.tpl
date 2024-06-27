<!DOCTYPE html>
<html>
<head>
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>クライアント選択</title>
<meta charset="utf-8">
<meta name="description" content="">
<meta name="author" content="">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="shortcut icon" href="">
<link rel="stylesheet" href="/css/sp/login.css">
<link rel="stylesheet" href="/css/reset.css">
<link rel="stylesheet" href="/css/sp/button.css">
<link rel="stylesheet" href="/css/sp/client_select.css">
<script src="/js/jquery-1.11.2.min.js?{$application_version}"></script>
<script src="/js/jquery-ui.min.js?{$application_version}"></script>
{literal}
<script>
$(function(){
	// ログイン情報入力画面へ遷移する
	$('#change_client').click(function() {
		$('[name=client]').submit();
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
		<div class="login__form--area client_select_content">
			<img src="/img/sp/png/meet-in logo-b.png" class="login__form--logo" />
			<div style="margin-top:10px; margin-bottom: 10px; color: red;">
				{$errorMsg}
			</div>
			<div class="select_wrap">
				<span class="select_title">クライアント選択</span>
				<div class="select_block">
					<form action="/index/client" method="post" name="client">
						<select class="select_body" name="client_id">
							<option value='' disabled selected style='display:none;'>選択してください</option>
							{foreach from=$clientList item=row}
								<option value="{$row.client_id}" {if $row.client_id == $clientId}selected{/if}>{$row.client_name}</option>
							{/foreach}
						</select>
					</form>
				</div>
				<div class="arrow"></div>
			</div>
			<div id="change_client" class="defaultBtn loginBtn client_select_btn">選択する</div>
		</div>
		<img src="/img/sp/png/buildings__Png.png" class="buildings_image" />
	</div>
</body>
</html>
