<?php
// アプリケーション設定
define('CONSUMER_KEY', '934055626373-4j1r7e3r780rut5905aovao8efkjg3in.apps.googleusercontent.com');
define('CALLBACK_URL', 'http://wow.sense.pink/oauth2callback.php');

// URL
define('AUTH_URL', 'http://www.google.com/calendar/feeds/');


//--------------------------------------
// 認証ページにリダイレクト
//--------------------------------------
$params = array(
	'client_id' => CONSUMER_KEY,
	'redirect_uri' => CALLBACK_URL,
	'scope' => 'openid profile email',
	'response_type' => 'code',
);

// リダイレクト
header("Location: " . AUTH_URL . '?' . http_build_query($params));