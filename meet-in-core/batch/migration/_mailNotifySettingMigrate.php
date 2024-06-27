<?php
/**
 * Created by PhpStorm.
 * User: matsuno.masahiro
 * Date: 2016/02/19
 * Time: 17:14
 */

// DB接続
include_once "./setting.php";

debugMeg("----mailNotifySetting Migration START----");

// TODO ここでなんやかんやしてデータを移行する
/**
 * @var unknown_type
 */
try{
// データ移行に必要なDAOを宣言
    $mailNotifySettingDao = Application_CommonUtil::getInstance('dao',"mailNotifySettingDao", $destinationDb);

// トランザクションスタート
    $destinationDb->beginTransaction();

    $sql = "SELECT * FROM mail_notify_setting;";
    $stm = $currentDb->query($sql);
    $mailNotifySettingList = $stm->fetchAll();

    foreach ($mailNotifySettingList as $mailNotifySetting) {


        $sql = "SELECT * FROM approach_list WHERE ;";
        $stm = $currentDb->query($sql);
        $mailNotifySettingList = $stm->fetchAll();

        $mailNotifySettingData = array(
            "client_id" => $mailNotifySetting["client_id"],
            "type" => $mailNotifySetting["type"],
            "id" => $mailNotifySetting["id"],
            "notify_send" => $mailNotifySetting["notify_send"],
            "notify_appoint" => $mailNotifySetting["notify_appoint"],
        );
        $mailNotifySettingDao->regist($mailNotifySettingData);
    }




    // 登録完了したらコミットする
    $destinationDb->commit();

}
catch (Exception $err){
    $destinationDb->rollBack();
    debugMeg("想定外の例外：".$err->getMessage());
}


debugMeg("----mailNotifySetting Migration END----");

// 以下マイグレーション関数****************************************