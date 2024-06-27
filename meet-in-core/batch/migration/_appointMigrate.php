<?php
/**
 * Created by PhpStorm.
 * User: matsuno.masahiro
 * Date: 2016/02/19
 * Time: 17:14
 */

// DB接続
include_once  dirname(__FILE__)."/setting.php";

debugMeg("----Appoint Migration START----");

// test
//$sql = "set name utf8;";
//$stm = $currentDb->query($sql);
//
//$sql = "SELECT consumer_memo FROM consumer_status WHERE consumer_id = 10004200002070023726721102550682;";
////$sql = "SELECT * FROM result limit 1;";
//$stm = $currentDb->query($sql);
//$appointList = $stm->fetchAll();
//$aa = bin2hex($appointList[0]["consumer_memo"]);
//var_dump($aa);
//exit;


// TODO ここでなんやかんやしてデータを移行する
/**
 * 現行DBのappointテーブルのデータ移行を行う
 * @var unknown_type
 */
try{
// データ移行に必要なDAOを宣言
    $appointDao = Application_CommonUtil::getInstance('dao',"AppointDao", $destinationDb);

// トランザクションスタート
    $destinationDb->beginTransaction();

    // アポイント情報取得
    $sql = "SELECT * FROM appoint;";
    $stm = $currentDb->query($sql);
    $appointList = $stm->fetchAll();
    var_dump(count($appointList));
    exit;

    // メモ取得 レコードが多いので逐次取得
    $sql = "SELECT consumer_memo FROM consumer_status WHERE consumer_id = ?;";
    $stmConsumerStatus = $currentDb->prepare($sql);

    // 結果取得ストアドプロシージャ。　レコードが多いので逐次取得
    $sql = "SELECT result_id,result_staffid,user_type,result_staffid FROM result WHERE result_projectid = ? AND result_consumerid = ? AND result_status = 5 AND result_del_flg = 0;";
    $stmResult = $currentDb->prepare($sql);

    $hoge=0;
    foreach($appointList as $appoint){

        //memo取得
        $stmConsumerStatus->execute(array($appoint["appoint_consumerid"]));
        $consumerStatusMemo = $stmConsumerStatus->fetchAll(PDO::FETCH_COLUMN);

        //result取得
        $stmResult->execute(array($appoint["appoint_projectid"], $appoint["appoint_consumerid"]));
        $result = $stmResult->fetchAll();

        //一時しのぎ　TODO 一時的に1の固定値。後でどうにかする
        if(empty($result)){
            $hoge++;
            var_dump($appoint["appoint_projectid"] ."  ".$appoint["appoint_consumerid"]);
            continue;//リザルト取れない奴は中断
        }
        $appoint["appoint_consumerid"] = 1;
        //一時しのぎここまで

         //データをセット
        $appointData = array(
            "id" => $appoint["appoint_id"],
            "client_id" => $appoint["appoint_clientid"],
            "approach_list_id" => $appoint["appoint_projectid"],
            "approach_target_tel" => $appoint["appoint_consumertel"],
            "approach_target_id" => $appoint["appoint_consumerid"],
            "approach_target_name" => $appoint["appoint_consumername"],
            "time" => $appoint["appoint_time"],
            "clerk_department" => $appoint["appoint_clerkdepartment"],
            "responsible_staff_name" => $appoint["appoint_projectheader"],
            "client_staff_id" => $appoint["appoint_clientstaffseq"],
            "description" => $appoint["appoint_description"],
            "update_date" => $appoint["appoint_updated"],
            "gc_id" => $appoint["appoint_gc_id"],
            "responsible_staff_kana" => $appoint["appoint_kana"],
            "gender" => $appoint["appoint_gender"],
            "mail_status" => $appoint["appoint_mail_status"],
            "create_staff_type" => $appoint["appoint_createuser_type"],
            "situation" => $appoint["appoint_jokyo"],
            "create_date" => $appoint["appoint_created"],
            "del_flg" => $appoint["del_flg"],

            "memo" => $consumerStatusMemo[0],
            "result_telephone_id" => $result[0]["result_id"],
            "create_staff_id" => $result[0]["result_staffid"],
            "update_staff_type" => $result[0]["user_type"],
            "update_staff_id" => $result[0]["result_staffid"]
        );
        $appointDao->migrateRegist($appointData);
    }

    // 登録完了したらコミットする
    $destinationDb->commit();

    debugMeg("resultがない：".$hoge);
}
catch (Exception $err){
    $destinationDb->rollBack();

    debugMeg("想定外の例外：".$err->getMessage());
}


debugMeg("----Appoint Migration END----");

// 以下マイグレーション関数****************************************