<?php
$telno = $_GET['telno'];

// 暗号化pubkey取得
$authcode = exec("./authcode_crypt ".$telno);

echo $authcode;



