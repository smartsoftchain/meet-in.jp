<?php
/**
 * Created by PhpStorm.
 * User: matsuno.masahiro
 * Date: 2016/02/19
 * Time: 17:14
 */

// DB接続
include_once dirname(__FILE__)."/setting.php";

debugMeg("----TalkScript Migration START----");

/**
 * @var unknown_type
 */
try{
// データ移行に必要なDAOを宣言
    $migrationDao = Application_CommonUtil::getInstance('dao',"MigrationDao", $destinationDb);

// トランザクションスタート
    $destinationDb->beginTransaction();

    $sql = "SELECT * FROM talk_script;";
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

    // 登録完了したらコミットする
    $destinationDb->commit();

}
catch (Exception $err){
    $destinationDb->rollBack();
    debugMeg("想定外の例外：".$err->getMessage());
}


debugMeg("----TalkScript Migration END----");

// 以下マイグレーション関数****************************************