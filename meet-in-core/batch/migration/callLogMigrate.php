<?php
/**
 * Created by PhpStorm.
 * User: matsuno.masahiro
 * Date: 2016/02/19
 * Time: 17:14
 */

// DB接続
include_once dirname(__FILE__)."/setting.php";

$options = getopt("i:");

debugMeg("----CallLog Migration START----");

/**
 * @var unknown_type
 */
try{
// データ移行に必要なDAOを宣言
    $CallLogDao = Application_CommonUtil::getInstance('dao',"CallLogDao", $destinationDb);

    // webPhoneIdが渡されていればそれを使う
    if(isset($options["i"])){
        $webPhoneIdList = array( array("webphone_id" => $options["i"]));
    }else{
        $sql = "SELECT DISTINCT webphone_id FROM call_log;";
        $stm = $currentDb->query($sql);
        $webPhoneIdList = $stm->fetchAll();
    }

    foreach($webPhoneIdList as $webPhoneId){

        // トランザクションスタート
        $destinationDb->beginTransaction();

        $sql = "SELECT *, DATE_FORMAT(`call_date`, '%Y-%m-%d') AS `convert_call_time` FROM call_log WHERE webphone_id = {$webPhoneId[webphone_id]} ORDER BY call_date;";
        $stm = $currentDb->query($sql);
        $callLogList = $stm->fetchAll();

        $callDate = 0;
        $convertCallDate = 0;
        foreach ($callLogList as $callLog) {

            $callLogData = array(
                "call_id" => $callLog["call_id"],
                "webphone_id" => $callLog["webphone_id"],
                "origin_key" => $callLog["origin_key"],
                "result_key" => $callLog["result_key"],
                "consumer_tel" => $callLog["consumer_tel"],
                "call_date" => $callLog["call_date"],
                "call_time" => $callLog["call_time"],
                "interval_time" => 0,
                "create_time" => $callLog["create_time"]
            );

            // call_time 計算 : webphone_idのcall_date前回から今回までの経過秒数。各日時の一番最初のcall_logはこのカラムが0。
            if($convertCallDate == $callLog["convert_call_time"]){
                $callLogData["interval_time"] = strtotime( $callLog["call_date"]) - strtotime($callDate);
            }
            $convertCallDate = $callLog["convert_call_time"];
            $callDate = $callLog["call_date"];

            $CallLogDao->regist($callLogData);
        }

        // 登録完了したらコミットする
        $destinationDb->commit();
    }
}
catch (Exception $err){
    $destinationDb->rollBack();
    debugMeg("想定外の例外：".$err->getMessage());
}


debugMeg("----CallLog Migration END----");

// 以下マイグレーション関数****************************************