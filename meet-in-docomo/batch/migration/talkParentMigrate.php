<?php
/**
 * Created by PhpStorm.
 * User: matsuno.masahiro
 * Date: 2016/02/19
 * Time: 17:14
 */

// DB接続
include_once dirname(__FILE__)."/setting.php";

debugMeg("----TalkParent Migration START----");

/**
 * @var unknown_type
 */
try{
// データ移行に必要なDAOを宣言
    $migrationDao = Application_CommonUtil::getInstance('dao',"MigrationDao", $destinationDb);

// トランザクションスタート
    $destinationDb->beginTransaction();

    $sql = "SELECT * FROM talk_parent;";
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




    // 登録完了したらコミットする
    $destinationDb->commit();

}
catch (Exception $err){
    $destinationDb->rollBack();
    debugMeg("想定外の例外：".$err->getMessage());
}


debugMeg("----TalkParent Migration END----");

// 以下マイグレーション関数****************************************