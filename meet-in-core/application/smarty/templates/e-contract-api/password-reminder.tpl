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
{/literal}
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>パスワード再設定</title>
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
		<!-- パスワードリマインダー画面 start -->
		<div class="mi_admin_login_form_wrap">
			<div id="mi_admin_reminder_form_innner">
				<div class="mi_subtitle">パスワードリマインダ</div>
				<p>仮パスワードを入力してください。<br>登録したメールアドレスに再設定用のメールを送信します。</p>
				{if !empty($errors)}
					<p class="error_msg">{$errors[0]}</p>
				{/if}
				<form action="/e-contract-api/password-reminder" method="post" name="login_form">
					<input type="hidden" name="staff_id" value="{$partnerId}" >
					<input type="hidden" name="staff_type" value="DD" >
					{* <label for="id"><span>メールアドレス</span><input type="text" name="email" value="" placeholder="aaa@aa.jp" class="mi_default_input" /><br></label> *}
					<label for="id"><span>仮パスワード</span><input type="password" name="temp_pw" value="" class="mi_default_input" autocomplete="new-password"/><br></label>
					<button type="submit" name="button" class="mi_default_button hvr-fade">メール送信</button>
				</form>
			</div>
		</div>
		<!-- パスワードリマインダー画面 end -->

	</div>
	<!-- メインコンテンツ end -->

	<!-- フッター start -->
	<footer>
		<span class="mi_copyright">meet in Inc. All Rights Reserved</span>
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
