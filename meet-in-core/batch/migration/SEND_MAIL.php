<?php
/**
 * Created by PhpStorm.
 * User: matsuno.masahiro
 * Date: 2016/02/19
 * Time: 17:14
 */

// DB接続
include_once dirname(__FILE__)."/setting.php";

debugMeg("----sendMail START----");


## 最終確認
error_log("移行したTMOユーザーにメールを送信します。本当によろしいですか？ OK=>y");
$stdin = trim(fgets(STDIN));

if($stdin != "y"){
    error_log("中断しました");
    exit;
}

$mailData=array(
    subject => "【重要】SalesCrowd移行に行けるアカウントの発行お知らせ",
    body => "平素よりTMOをご利用いただき誠にありがとうございます。\n
この度TMOからSalesCrowdへシステムバージョンアップを行うに伴いまして、
ログイン用アカウント情報が変更になります。\n
以下に新アカウント情報を記載いたしますので、
大変お手数をお掛けしますが、ご確認をよろしくお願いします。\n

\n
TMOログイン用ID：?old_id\n
\n
新ログイン用ID：?new_id\n
\n
新ログイン用パスワード：?new_password\n
\n
ログインURL：\n
https://sales-crowd.jp/
\n
\n
ご不明点や、ログインできない場合などはお手数ですが、\n
下記のメールアドレス宛にご連絡をください。
\n
\n
連絡先メールアドレス：tmo_support@aidma-hd.jp\n
担当者：大嶋",
    preSta => array("?old_id","?new_id","?new_password"),
    from => "tmo_support@aidma-hd.jp"
);

try {
    $mailList = array();

    // クライアントスタッフ一覧
    $sql = "SELECT * FROM client_staff WHERE `new_id` IS NOT NULL AND `del_flg` = 0 ";
    if (0 < count($targetClient)) {
        $sql .= " AND client_id IN (" . implode(',', $targetClient) . ")";
    }
    $stm = $currentDb->query($sql . ";");
    $clientStaffList = $stm->fetchAll();
    foreach ($clientStaffList as $clientStaff) {
        $old_id = "CE".str_pad($clientStaff["seq"],5,"0",STR_PAD_LEFT);
        $new_id = "CE".str_pad($clientStaff["new_id"],5,"0",STR_PAD_LEFT);
        sendMailId($clientStaff["email"], $mailData, $old_id, $new_id, $clientStaff["new_password"]);
    }

}
catch (Exception $err){
    debugMeg("想定外の例外：".$err->getMessage());
}


debugMeg("----sendMail END----");

// 以下マイグレーション関数****************************************

function sendMailId($address,$data,$oldID,$newID,$new_password){

    mb_language("japanese");

    $body = str_replace($data["preSta"], array($oldID, $newID,$new_password), $data["body"]);

// 送った先がわかるように出力する
    error_log($oldID ." -> ".$newID ." -> ". $new_password . ":" .$address);
    mb_send_mail($address, $data["subject"], $body, "From:".$data["from"]);
}
