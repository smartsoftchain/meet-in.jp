<?php
/**
 * Created by PhpStorm.
 * User: matsuno.masahiro
 * Date: 2016/02/19
 * Time: 17:14
 */

// DB接続
include_once dirname(__FILE__)."/../function/CommonMigration.php";

/**
 * DBへの接続を試みる
 * @var unknown_type
 */
try{
    // DAO読み込み時のエラー回避のため、空のarrayをセットする
    Zend_Registry::set('user', array());

//    // 現行TMOのDBのインスタンス作成
    $currentDb = getCurrentDbObject();
    // 移行先DBのインスタンス作成
    $destinationDb = getNewDbObject();

}
catch (Exception $err){
    debugMeg("error:".$err->getMessage());
}

// 対象となるクライアント
$targetClientStr = " 310, 314, 349, 467, 501, 621, 655, 672 ";
$count = array("TA"=>0,"TP"=>0,"TS"=>0);

/**
 * @var unknown_type
 */
try{
// データ移行に必要なDAOを宣言
    $migrationRepairDao = Application_CommonUtil::getInstance('dao',"MigrationRepairDao", $destinationDb);

// トランザクションスタート
    $destinationDb->beginTransaction();

    $sql = "SELECT * FROM talk_bind  WHERE client_id IN ( " .$targetClientStr. " ) ";
    $stm = $currentDb->query($sql.";");
    $talkBindList = $stm->fetchAll();

    foreach ($talkBindList as $talkBind) {

        //talk_bindは移行済みなので修復しない！

        // bind に紐付いたもの移行
        $sql = "SELECT * FROM talk_answer WHERE talk_bind_id = {$talkBind["id"]};";
        $stm = $currentDb->query($sql);
        $talkAnswerList = $stm->fetchAll();
        $count["TA"] += count($talkAnswerList);
        // talkAnswer
        foreach ($talkAnswerList as $talkAnswer) {
            $talkAnswerData = array(
                "talk_bind_id" => $talkAnswer["talk_bind_id"],
                "talk_script_id" => $talkAnswer["talk_script_id"],
                "id" => $talkAnswer["id"],
                "answer_name" => $talkAnswer["answer_name"],
                "answer_type" => $talkAnswer["answer_type"],
                "create_date" => $talkAnswer["create_time"],
                "update_date" => $talkAnswer["update_time"]
            );
            $migrationRepairDao->simpleRegist('talk_answer',$talkAnswerData);
        }

        // talkParent
        $sql = "SELECT * FROM talk_parent WHERE talk_bind_id = {$talkBind["id"]};";
        $stm = $currentDb->query($sql);
        $talkParentList = $stm->fetchAll();
        $count["TP"] += count($talkParentList);
        foreach ($talkParentList as $talkParent) {
            $talkParentData = array(
                "talk_bind_id" => $talkParent["talk_bind_id"],
                "talk_script_id" => $talkParent["talk_script_id"],
                "id" => $talkParent["id"],
                "parent_key" => $talkParent["parent_key"],
                "parent_answer" => $talkParent["parent_answer"],
                "create_date" => $talkParent["create_time"],
                "update_date" => $talkParent["update_time"]
            );
            $migrationRepairDao->simpleRegist('talk_parent',$talkParentData);
        }

        // talkScript
        $sql = "SELECT * FROM talk_script WHERE talk_bind_id = {$talkBind["id"]};";
        $stm = $currentDb->query($sql);
        $talkScriptList = $stm->fetchAll();
        $count["TS"] += count($talkScriptList);
        foreach ($talkScriptList as $talkScript) {

            $talkScriptData = array(
                "talk_bind_id" => $talkScript["talk_bind_id"],
                "id" => $talkScript["id"],
                "talk_key" => $talkScript["talk_key"],
                "title" => $talkScript["title"],
                "talk" => $talkScript["talk"],
                "talk_hierarchy" => $talkScript["talk_hierarchy"],
                "create_date" => $talkScript["create_time"],
                "update_date" => $talkScript["update_time"]
            );

            $migrationRepairDao->simpleRegist('talk_script',$talkScriptData);
        }

    }

    // 登録完了したらコミットする
    $destinationDb->commit();

    debugMeg("talk_answer 変換対象レコード数".$count["TA"]);
    debugMeg("talk_parent 変換対象レコード数".$count["TP"]);
    debugMeg("talk_script 変換対象レコード数".$count["TS"]);

}
catch (Exception $err){
    $destinationDb->rollBack();
    debugMeg("想定外の例外：".$err->getMessage());
}


debugMeg("----TalkBind Migration END----");

// 以下マイグレーション関数****************************************