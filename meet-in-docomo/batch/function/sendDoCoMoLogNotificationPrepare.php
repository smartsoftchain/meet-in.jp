<?php
/**
 * ドコモログ連携用バッチファイル(対象ファイル生成)
 * @var unknown_type
 */

// ファイル保存先パス
$path = "/tmp/";

// DoCoMo ZIPパスワード
define('DOCOMO_PASSWORD', 'bdxstoredocomo211201!');

// DAO読み込み時のエラー回避のため、空のarrayをセットする
Zend_Registry::set('user', array());

$config  = new Zend_Config_Ini(APP_DIR . 'configs/system.ini', SERVICE_MODE);
$database = Zend_Db::factory($config->datasource);
$database->setFetchMode(Zend_Db::FETCH_ASSOC);
Zend_Db_Table_Abstract::setDefaultAdapter($database);

// プロファイラ有効
$database->query("set @key:='{$config->datasource->key}'");
$db = Zend_Db_Table_Abstract::getDefaultAdapter();

// データ生成は月末/メール送信は翌月頭なので、1ヶ月先のファイル名で生成する
$date = $argv[2];
if ($date) {
    $targetMonth = strtotime($date);
} else {
    $targetMonth = time();
}

// DAO読み込み
$lastMonth = strtotime(date('Y-m-d', $targetMonth) . ' - 1month');
$collaborativeServicesProvidedDataDao = Application_CommonUtil::getInstance("dao", "CollaborativeServicesProvidedDataDao", $db);
$list = $collaborativeServicesProvidedDataDao->getDoCoMoLogNotification(date('Y-m-t', $lastMonth));

$output = "";
foreach ($list as $row) {
  $output .= sprintf("%s,%s\r\n", $row['accountid'], $row['docomoid']);
}

$fileName = sprintf("%s%s_docomo_notification.csv", $path, date('Ym', $targetMonth));
$fileNameZip = sprintf("%s%s_docomo_notification.zip", $path, date('Ym', $targetMonth));

$fp = fopen($fileName, "w+");
fputs($fp, trim($output));
fclose($fp);

// ZipArchiveのパスワード設定はphp7.2以降なのでコマンドラインのzipを利用する
$cmd = sprintf('/usr/bin/zip -b %s --junk-paths --encrypt --password %s %s %s', $path, DOCOMO_PASSWORD, $fileNameZip, $fileName);

exec($cmd);
