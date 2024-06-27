<?php
/**
 * Created by PhpStorm.
 * User: matsuno.masahiro
 * Date: 2016/02/19
 * Time: 17:14
 */

// DB接続
include_once dirname(__FILE__)."/setting.php";

$options = getopt("l:o:");

debugMeg("----logs Migration {$options[o]}START----");

/**
 * @var unknown_type
 */
try{
// データ移行に必要なDAOを宣言
    $logDao = Application_CommonUtil::getInstance('dao',"LogDao", $destinationDb);

//// トランザクションスタート
    $destinationDb->beginTransaction();

    $sql = "SELECT * FROM logs";
    if(isset($options["l"])){
        $sql .= " LIMIT {$options["l"]}";
    }
    if(isset($options["o"])){
        $sql .= " OFFSET {$options["o"]}";
    }
    $stm = $currentDb->query($sql . ";");
    $logsList = $stm->fetchAll();

    foreach ($logsList as $logs) {

            $logsData = array(
                "staff_id" => $logs["staff_id"],
                "staff_type" => $logs["staff_type"],
                "client_id" => $logs["client_id"],
                "create_time" => $logs["create_time"],
                "action_name" => $logs["action_name"],
                "send_data" => $logs["send_data"]
            );
            $logDao->migrateRegist($logsData);
    }

    // 登録完了したらコミットする
    $destinationDb->commit();

}
catch (Exception $err){
    $destinationDb->rollBack();
    debugMeg("想定外の例外：".$err->getMessage());
}


debugMeg("----logs Migration {$options[o]}END----");

// 以下マイグレーション関数****************************************