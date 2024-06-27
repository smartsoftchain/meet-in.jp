<!DOCTYPE html>
<html lang="ja">
<head>
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>問い合わせ完了ページ | meet in（ミートイン）</title>
<meta charset="utf-8">
<meta name="description" content="meet in（ミートイン）に関するお申し込み、お問い合わせ内容が完了をお知らせするページです。">
<meta name="author" content="">
<link rel="shortcut icon" href="/img/favicon.ico">
<link rel="stylesheet" href="/css/fonts.css">
<!--[if lt IE 8]>
<link rel="stylesheet" href="/css/ie7.css">
<!--<![endif]-->
<link href="https://fonts.googleapis.com/css?family=Roboto+Slab" rel="stylesheet">
<link rel="stylesheet" href="/css/reset.css">
<link rel="stylesheet" href="/css/base.css">
<link rel="stylesheet" href="/css/page.css">
<link rel="stylesheet" href="/css/design.css">
<link rel="stylesheet" href="/css/top.css">
<link rel="stylesheet" href="/css/jquery-ui.css">
<script src="/js/jquery-1.11.2.min.js"></script>
<script src="/js/jquery-ui.min.js"></script>
<script src="/js/common.js"></script>
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


</head>
<body>
	<script>
	  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
	  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
	  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
	  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

	  ga('create', 'UA-48144639-6', 'auto');
	  ga('send', 'pageview');

	</script>
	<?php
	mb_language('ja');
	mb_internal_encoding("UTF-8");
	$to = "";
	$to = $_POST['confirm_mail'];
	if($_POST['confirm_name']==""){
		echo "入力内容が不正です。";
		exit;
	}
	if (isset($_POST['recaptchaResponse']) && !empty($_POST['recaptchaResponse'])) {
    $secret = '6LcclqkaAAAAAFnWESKNfT0EWYZtbfwuGtZcIBeV';
    $verifyResponse = file_get_contents('https://www.google.com/recaptcha/api/siteverify?secret='.$secret.'&response='.$_POST['recaptchaResponse']);
    $reCAPTCHA = json_decode($verifyResponse);
    if ($reCAPTCHA->success) {
			if($to!=""){
				$headers = "From: ".mb_encode_mimeheader("株式会社meet in") ."<info@meet-in.jp>\r\n";
				$headers .= 'Bcc: ooshima@aidma-hd.jp' . "\r\n";
				$subject = "【{$_POST['confirm_type']}ありがとうございました。】 株式会社meet in";


				$message = $_POST['confirm_name']." 様\n\n";
				$message .= "この度は「株式会社meet in」に{$_POST['confirm_type']}頂き誠にありがとうございました。\n";
				$message .= "改めて担当者よりご連絡をさせていただきます。\n\n";
				$message .= "{$_POST['confirm_type']}内容の確認\n";
				$message .= "───────────────\n\n";
				$message .= "[ 氏名 ] ".$_POST['confirm_name']."\n";
				$message .= "[ 会社名 ] ".$_POST['confirm_company']."\n";
				if($_POST['confirm_type']=="お申込み"){
					$message .= "[ 郵便番号 ] ".$_POST['confirm_postcode']."\n";
					$message .= "[ 住所（都道府県・市区町村・番地） ] ".$_POST['confirm_address1']."\n";
					$message .= "[ 住所（それ以降の住所） ] ".$_POST['confirm_address2']."\n";
				}
				$message .= "[ 電話番号 ] ".$_POST['confirm_tel']."\n";
				$message .= "[ メールアドレス ] ".$_POST['confirm_mail']."\n";
				if($_POST['confirm_type']=="お問い合わせ"){
					$message .= "[ 件名 ] ".$_POST['confirm_subject']."\n";
					$message .= "[ お問い合わせ内容 ] ".$_POST['confirm_contact']."\n";
				}elseif($_POST['confirm_type']=="お申込み"){
					$message .= "[ お申し込みプラン ] ".$_POST['confirm_plan']."\n";
					$message .= "[ お支払い方法 ] ".$_POST['confirm_payment']."\n";
				}

				$message .= "[ 使用用途 ] ".$_POST['confirm_use']."\n";
				$message .= "[ どちらで知りましたか？ ] ".$_POST['confirm_knew']."\n";
				$message .= "\n───────────────\n\n";
				$message .= "このメールに心当たりの無い場合は、お手数ですが\n";
				$message .= "下記連絡先までお問い合わせください。\n\n";
				$message .= "───────────────\n";
				$message .= "■■\n";
				$message .= "TEL：03-5985-8290　受付時間：10:00～18:00（平日のみ）\n";
				$message .= "MAIL：info@meet-in.jp\n\n";
				$message .= "運営会社：株式会社meet in\n";
				$message = mb_convert_encoding($message, 'ISO-2022-JP-MS');
				mb_send_mail($to,$subject,$message,$headers);


				$re_subject = "【株式会社meet in LPからの{$_POST['confirm_type']}のお知らせ】";
				$re_to = 'info@meet-in.jp';
				// $re_to = 'ooshima@aidma-hd.jp';
				$re_headers = "From: ".mb_encode_mimeheader("株式会社meetin{$_POST['confirm_type']}") ."<info@meet-in.jp>\r\n";
				$re_headers .= 'Bcc: ooshima@aidma-hd.jp' . "\r\n";

				$re_message = "「株式会社meet in」に{$_POST['confirm_type']}がありました。\n";
				$re_message .= "{$_POST['confirm_type']}内容を確認し、ご連絡をお願い致します。\n\n";
				$re_message .= "{$_POST['confirm_type']}内容の確認\n";
				$re_message .= "───────────────\n\n";
				$re_message .= "[ 氏名 ] ".$_POST['confirm_name']."\n";
				$re_message .= "[ 会社名 ] ".$_POST['confirm_company']."\n";
				if($_POST['confirm_type']=="お申込み"){
					$re_message .= "[ 郵便番号 ] ".$_POST['confirm_postcode']."\n";
					$re_message .= "[ 住所（都道府県・市区町村・番地） ] ".$_POST['confirm_address1']."\n";
					$re_message .= "[ 住所（それ以降の住所） ] ".$_POST['confirm_address2']."\n";
				}
				$re_message .= "[ 電話番号 ] ".$_POST['confirm_tel']."\n";
				$re_message .= "[ メールアドレス ] ".$_POST['confirm_mail']."\n";
				if($_POST['confirm_type']=="お問い合わせ"){
					$re_message .= "[ 件名 ] ".$_POST['confirm_subject']."\n";
					$re_message .= "[ お問い合わせ内容 ] ".$_POST['confirm_contact']."\n";
				}elseif($_POST['confirm_type']=="お申込み"){
					$re_message .= "[ お申し込みプラン ] ".$_POST['confirm_plan']."\n";
					$re_message .= "[ お支払い方法 ] ".$_POST['confirm_payment']."\n";
				}

				$re_message .= "[ 使用用途 ] ".$_POST['confirm_use']."\n";
				$re_message .= "[ どちらで知りましたか？ ] ".$_POST['confirm_knew']."\n";
				$re_message .= "───────────────\n";
				$re_message = mb_convert_encoding($re_message, 'ISO-2022-JP-MS');
				mb_send_mail($re_to,$re_subject,$re_message,$re_headers);
			}
		} else {
			echo "ボット検知をいたしました。お手数ですが、再度問い合わせください";
			exit;
		}
	}
	?>
<!-- wrap start -->
<div id="mi_wrap" class="lp_wrap">

	<!-- LPプライバシーポップアップコンテンツコンテンツ begin -->
	<div id="mi_overlay_complete" class="mi_overlay_wrap mi_overlay_complete">
		<div class="mi_overlay_contents mi_confirm_block">
			<div class="mi_overlay_contents_title mi_complete_title_wrap">
				<img src="/img/lp/rogo.png" class="mi_complete_title_img" alt="meet in">
				<h2 class="mi_complete_title"><?php echo $_POST['confirm_type']; ?>ありがとうございます。</h2>
			</div>
			<p class="mi_complete_text">追って担当者より、詳細のご連絡をさせていただきます。<br>
今しばらくお待ち下さい。</p>

			<a href="/index" class="mi_default_button mi_complete_send">閉じる</a>
		</div>
	</div>
	<!-- LPプライバシーコンテンツ end -->

<!-- wrap end -->

<script src="/js/jquery-1.11.2.min.js"></script>
<script type="text/javascript" src="/js/WebRTC/adapter.js"></script>
<script type="text/javascript" src="/js/WebRTC/peer.js"></script>
<script type="text/javascript" src="/js/WebRTC/MeetinRTC.js"></script>
<script type="text/javascript" src="/js/MeetinAPI.js"></script>
<script type="text/javascript" src="/js/WebRTC/MeetinRTC_UI.js"></script>
<script type="text/javascript" src="/js/connection/prepare-connection.js"></script>

<link rel="stylesheet" href="/css/jquery-ui.css">
<script src="/js/jquery-1.11.2.min.js"></script>
<script src="/js/jquery-ui.min.js"></script>

</body>
</html>
