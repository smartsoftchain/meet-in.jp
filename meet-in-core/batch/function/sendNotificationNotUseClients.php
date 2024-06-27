<?php
/**
 * 単体利用クライアントのユーザー全員が 連続して一定期間ログインしていない場合に通知メールを送る
 * @var unknown_type
 */

// 通知メールが送信される日 一定日数 利用がない (複数指定可能).
$sendMailDateDiff = [ // 14日間、28日間、56日間.
  14,
  28,
  56
];

// 通知メールの送信先メールアドレス(複数指定可能).
$SEND_MAILADDRESS = [
  'nagata@aidma-hd.jp',
  'support@meet-in.jp'
];

// 通知メールのタイトル.
$SUBJECT_TEMPLATE  =  "【meet-inサポート窓口】単体利用クライアントの利用状況のお知らせ";

// 通知メールの本文.
$MESSAGE_TEMPLATE  = '';
$MESSAGE_TEMPLATE .= "※下記の企業様は、@DAY_DIFF 日間、全員ログインしておりませんでしたので\r\n";
$MESSAGE_TEMPLATE .= "タイミングを見てお客様に電話ないしはメールでフォローをいれるようお願い致します！\r\n";
$MESSAGE_TEMPLATE .= "\r\n";
$MESSAGE_TEMPLATE .= "企業名：@CLIENT_NAME\r\n";
$MESSAGE_TEMPLATE .= "商材：「meet in」\r\n";
$MESSAGE_TEMPLATE .= "\r\n";
$MESSAGE_TEMPLATE .= "************************************************************\r\n";
$MESSAGE_TEMPLATE .= "株式会社meet in　サポート窓口\r\n";
$MESSAGE_TEMPLATE .= "(〒171-0022)東京都豊島区南池袋2-25-5 藤久ビル東5号館 4階\r\n";
$MESSAGE_TEMPLATE .= "HP： https://meet-in.jp \r\n";
$MESSAGE_TEMPLATE .= "メールアドレス：support@meet-in.jp \r\n";
$MESSAGE_TEMPLATE .= "TEL：0120-979-542（営業時間：平日10時～18時）\r\n";
$MESSAGE_TEMPLATE .= "************************************************************\r\n";
$MESSAGE_TEMPLATE .= "※本メールに記載・添付された個人情報の管理、安全な破棄の\r\n";
$MESSAGE_TEMPLATE .= "ご協力をお願い致します。\r\n";


// DAO読み込み時のエラー回避のため、空のarrayをセットする
Zend_Registry::set('user', array());

// 新TMOのDBオブジェクトを宣言
$config  = new Zend_Config_Ini(APP_DIR . 'configs/system.ini', SERVICE_MODE);
$database = Zend_Db::factory($config->datasource);
$database->setFetchMode(Zend_Db::FETCH_ASSOC);
Zend_Db_Table_Abstract::setDefaultAdapter($database);
// プロファイラ有効
$database->getProfiler()->setEnabled(true);
// 暗号化カラムを復号化するためのキー設定
$database->query("set @key:='{$config->datasource->key}'");
$db = Zend_Db_Table_Abstract::getDefaultAdapter();


// クライアントを取得する.
// MEMO. master_client_new.usage_type = 3(単体利用) のみ対象.
$sql = "
SELECT
    master_client_new.client_id,
    master_client_new.client_name,
    DATEDIFF(now(), max(master_staff_new.enter_room_date)) as last_enter_room_date_diff,
    count(*) as staff_cnt
FROM
    master_client_new INNER JOIN master_staff_new
     ON master_client_new.client_id = master_staff_new.client_id
WHERE
    master_client_new.usage_type = 3
GROUP BY
    master_staff_new.client_id ORDER BY last_enter_room_date_diff;
";
$clients = $db->fetchAll($sql);

// メールの送信.
foreach ($clients as $client) {
  foreach ($sendMailDateDiff as $day)
  {
    // 指定日に一致したら対象.
    // MEMO.体感的にはその翌日を対象にしなければフライングなので+1DAY.
    if($client['last_enter_room_date_diff'] == $day+1)
    {
      // ログイン状態が悪いクライアントなので 通知メールを送信する.
      $subject = $SUBJECT_TEMPLATE;

      $message = $MESSAGE_TEMPLATE;
      $message = str_replace("@DAY_DIFF", $day, $message);
      $message = str_replace("@CLIENT_NAME", $client['client_name'], $message);

      foreach($SEND_MAILADDRESS as $mail_address) {
        sendMail($fromname, $mail_address, $subject, $message);
      }
    }
  }
}

/**
 * メールを送信する
 * @param unknown $message
 */
function sendMail($fromname, $sendto, $subject, $message, $toLeader=null){

  mb_language("ja");
  mb_internal_encoding("ISO-2022-JP");

  $subject = mb_convert_encoding($subject, "ISO-2022-JP","UTF-8");
  $subject = mb_encode_mimeheader($subject,"ISO-2022-JP", "B", "\n");

  $fromname = mb_convert_encoding($fromname, "ISO-2022-JP","UTF-8");
  $fromname = mb_encode_mimeheader($fromname,"ISO-2022-JP");

  $message = mb_convert_encoding($message,"ISO-2022-JP","UTF-8");

  $from_name = '【meet-inサポート窓口】';
  $from_name = mb_convert_encoding($from_name, "ISO-2022-JP","UTF-8");
  $from_name = mb_encode_mimeheader($from_name,"ISO-2022-JP", "B", "\n");

  //ヘッダエンコード
  $header = '';
  $header .= "Content-Type: text/plain;charset=ISO-2022-JP\n";
  $header .= "Content-Transfer-Encoding: 7bit\n";
  $header .= "MIME-Version: 1.0\n";
  $header .= "X-Mailer:PHP/" . phpversion() . "\n";
  $header .= "From: ".$from_name."<support@meet-in.jp>\n";

  // 登録対象者へメールします
  if(false == is_null($sendto)){
    mail($sendto, $subject, $message, $header);
  }

  //管理者へメールします
  // if(false ==is_null($admin_mail)){
  //   mail($admin_mail,$subject,$message, $header);
  // }

  //代表者へメールします
  if(false ==is_null($toLeader)){
    mail($toLeader, $subject,$message, $header);
  }
}
