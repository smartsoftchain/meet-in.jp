<?php
/**
 * ドコモログ連携用バッチファイル(メール送信)
 * @var unknown_type
 */

$path  = "/tmp/";
define('MAIL_FROM', 'info@docomodx.aidma-hd.jp');

function sendMail($to=null, $subject=null, $text=null, $file=null){

        //初期化
        $res = false;

        //日本語の使用宣言
        mb_language("ja");
        mb_internal_encoding("UTF-8");

        if( $to === null || $subject === null || $text === null ) {
                return false;
        }

        // 送信元の設定
        $sender_email = MAIL_FROM;

        // ヘッダー設定
        $header = '';
        $header .= "From: ".$sender_email."\n";
        $header .= "Content-Type: multipart/mixed;boundary=\"__BOUNDARY__\"\n";

        // テキストメッセージを記述
        $body = "--__BOUNDARY__\n";
        $body .= "Content-Type: text/plain; charset=\"utf-8\"\n\n";
        $body .= $text . "\n";
        $body .= "--__BOUNDARY__\n";

        $file_name = basename($file);

        // ファイルを添付
        $body .= "Content-Type: application/octet-stream; name=\"{$file_name}\"\n";
        $body .= "Content-Disposition: attachment; filename=\"{$file_name}\"\n";
        $body .= "Content-Transfer-Encoding: base64\n";
        $body .= "\n";
        $body .= chunk_split(base64_encode(file_get_contents($file)));
        $body .= "--__BOUNDARY__--";

        //メール送信
        $res = mb_send_mail($to, $subject, $body, $header);

        return $res;
}

// 本来の処理
$date = $argv[2];
if ($date) {
    $targetMonth = strtotime($date);
} else {
    $targetMonth = time();
}

$fileName = sprintf("%s%s_docomo_notification.zip", $path, date('Ym', $targetMonth));
$result = sendMail("bds-saasuser-rep-ml@nttdocomo.com", "【dXオンライン営業】定期利用者確認", "", $fileName);

// ローカル確認用
//$nextMonth = strtotime('+1 month');
//$fileName = sprintf("%s%s_docomo_notification.csv", $path, date('Ymd', $nextMonth));
//$result = sendMail("t.masato@gmail.com", "【meet in】 定期利用者確認", "", $fileName);
