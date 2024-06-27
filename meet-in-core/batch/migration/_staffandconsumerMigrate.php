<?php
/**
 * Created by PhpStorm.
 * User: matsuno.masahiro
 * Date: 2016/02/19
 * Time: 17:14
 */

// DB接続
include_once "./setting.php";

debugMeg("----staffandconsumer Migration START----");

// TODO ここでなんやかんやしてデータを移行する
/**
 * @var unknown_type
 */
try{
// データ移行に必要なDAOを宣言
    $mylistDao = Application_CommonUtil::getInstance('dao',"MylistDao", $destinationDb);

// トランザクションスタート
    $destinationDb->beginTransaction();

    $sql = "SELECT * FROM staffandconsumer;";
    $stm = $currentDb->query($sql);
    $staffandconsumerList = $stm->fetchAll();

    // TODO approach_list_id ってどっから引っぱって来る？
    foreach ($staffandconsumerList as $staffandconsumer) {
        if($staffandconsumer["staffandconsumer_del_flg"] != 1){
            $staffandconsumerData = array(
                "client_id" => $staffandconsumer["staffandconsumer_id"],
                "staff_id" => $staffandconsumer["staffandconsumer_staffid"],
                "approach_target_id" => $staffandconsumer["staffandconsumer_consumerid"],
                "staff_type" => $staffandconsumer["staffandconsumer_staff_type"],
                "comment" => $staffandconsumer["staffandconsumer_comment"],
                "create_date" => $staffandconsumer["staffandconsumer_regist_dt"]
            );
            $mylistDao->migrateInsert($staffandconsumerData);
        }
    }

    // 登録完了したらコミットする
    $destinationDb->commit();

}
catch (Exception $err){
    $destinationDb->rollBack();
    debugMeg("想定外の例外：".$err->getMessage());
}


debugMeg("----staffandconsumer Migration END----");

// 以下マイグレーション関数****************************************