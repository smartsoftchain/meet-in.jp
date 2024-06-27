<?php
// アプリケーション設定
define('CONSUMER_KEY', '934055626373-4j1r7e3r780rut5905aovao8efkjg3in.apps.googleusercontent.com');
define('CONSUMER_SECRET', 'J36XeDw4jeTNmA6N6-Lf7Vq7');
define('CALLBACK_URL', 'http://wow.sense.pink/oauth2callback.php');

// URL
define('TOKEN_URL', 'https://accounts.google.com/o/oauth2/token');
define('INFO_URL', 'https://www.googleapis.com/oauth2/v1/userinfo');


//--------------------------------------
// アクセストークンの取得
//--------------------------------------
var_dump($_GET);
echo "<br><br><br>";
$params = array(
	'code' => $_GET['code'],
	'grant_type' => 'authorization_code',
	'redirect_uri' => CALLBACK_URL,
	'client_id' => CONSUMER_KEY,
	'client_secret' => CONSUMER_SECRET,
);

// POST送信
$options = array('http' => array(
	'method' => 'POST',
	'content' => http_build_query($params)
));
$res = file_get_contents(TOKEN_URL, false, stream_context_create($options));
var_dump($res);
echo "<br><br><br>";

// レスポンス取得
$token = json_decode($res, true);
if(isset($token['error'])){
	echo 'エラー発生';
	exit;
}
$access_token = $token['access_token'];

var_dump($token);
echo "<br><br><br>";

//--------------------------------------
// ユーザー情報を取得してみる
//--------------------------------------
$params = array('access_token' => $access_token);
$res = file_get_contents(INFO_URL . '?' . http_build_query($params));
echo "<pre>" . print_r(json_decode($res, true), true) . "</pre>";