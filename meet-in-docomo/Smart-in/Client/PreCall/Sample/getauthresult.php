<?php

// sin_crypt 暗号化キー（半角英数32桁）
define('PUB_KEY', '1234567890abcdef1234567890abcdef');
// smart-inのURL
define('SMARTIN_URL', 'https://{smart-inサーバ}/request.cgi');

$authcode = $_POST['authcode'];

$postdata = http_build_query(
    array(
        'pubkey' => PUB_KEY,
        'authcode' => $authcode
    )
);

// http設定
$opts = array('http' =>
    array(
        'method'  => 'POST',
        'header'  => 'Content-type: application/x-www-form-urlencoded',
        'content' => $postdata
    )
);
$context  = stream_context_create($opts);

// Smart-inにリクエスト
$response = file_get_contents(SMARTIN_URL, false, $context);

echo $response;



