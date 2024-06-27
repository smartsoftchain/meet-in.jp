<?php
/**
 * Created by PhpStorm.
 * User: matsuno.masahiro
 * Date: 2016/02/19
 * Time: 17:14
 */

// DB接続
include_once dirname(__FILE__)."/setting.php";


debugMeg("----TalkBind Migration START----");

/**
 * @var unknown_type
 */
try{
// データ移行に必要なDAOを宣言
    $migrationDao = Application_CommonUtil::getInstance('dao',"MigrationDao", $destinationDb);

// トランザクションスタート
    $destinationDb->beginTransaction();

    $sql = "SELECT * FROM talk_bind AS tb INNER JOIN client AS cl ON tb.client_id=cl.client_id";
    if(0<count($targetClient)){
        $sql .= " WHERE tb.client_id IN (" .implode(',', $targetClient). ") AND DATE_FORMAT(tb.create_time, '%Y-%m-%d') >= '2016-04-05'";
    }
    $stm = $currentDb->query($sql.";");
    $talkBindList = $stm->fetchAll();

    foreach ($talkBindList as $talkBind) {
        $talkBindData = array(
            "id" => $talkBind["id"],
            "client_id" => $talkBind["new_id"],
            "talk_script_name" => $talkBind["talk_script_name"],
            "description" => $talkBind["description"],
            "talk_script_url" => $talkBind["talk_script_url"],
            "talk_script_type" => $talkBind["talk_script_type"],
            "staff_type" => $talkBind["staff_type"],
            "staff_id" => $talkBind["staff_id"],
            "create_date" => $talkBind["create_time"],
            "update_date" => $talkBind["update_time"],
            "del_flg" => $talkBind["del_flg"]
        );
        $migrationDao->simpleRegist('talk_bind',$talkBindData);

        // bind にもとづいた移行
        $sql = "SELECT * FROM talk_answer WHERE talk_bind_id = {$talkBind["id"]};";
        $stm = $currentDb->query($sql);
        $talkAnswerList = $stm->fetchAll();

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
            $migrationDao->simpleRegist('talk_answer',$talkAnswerData);
        }

        // talkParent
        $sql = "SELECT * FROM talk_parent WHERE talk_bind_id = {$talkBind["id"]};";
        $stm = $currentDb->query($sql);
        $talkParentList = $stm->fetchAll();
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
            $migrationDao->simpleRegist('talk_parent',$talkParentData);
        }

        // talkScript
        $sql = "SELECT * FROM talk_script WHERE talk_bind_id = {$talkBind["id"]};";
        $stm = $currentDb->query($sql);
        $talkScriptList = $stm->fetchAll();
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

            $migrationDao->simpleRegist('talk_script',$talkScriptData);
        }

    }


    // 登録完了したらコミットする
    $destinationDb->commit();

}
catch (Exception $err){
    $destinationDb->rollBack();
    debugMeg("想定外の例外：".$err->getMessage());
}


debugMeg("----TalkBind Migration END----");

// 以下マイグレーション関数****************************************