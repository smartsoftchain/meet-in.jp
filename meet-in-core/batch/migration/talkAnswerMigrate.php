<?php
/**
 * Created by PhpStorm.
 * User: matsuno.masahiro
 * Date: 2016/02/19
 * Time: 17:14
 */

// DB接続
include_once dirname(__FILE__)."/setting.php";

debugMeg("----TalkAnswer Migration START----");

/**
 * @var unknown_type
 */
try{
// データ移行に必要なDAOを宣言
    $migrationDao = Application_CommonUtil::getInstance('dao',"MigrationDao", $destinationDb);

// トランザクションスタート
    $destinationDb->beginTransaction();

    $sql = "SELECT * FROM talk_answer;";
    $stm = $currentDb->query($sql);
    $talkAnswerList = $stm->fetchAll();

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

    // 登録完了したらコミットする
    $destinationDb->commit();

}
catch (Exception $err){
    $destinationDb->rollBack();
    debugMeg("想定外の例外：".$err->getMessage());
}


debugMeg("----TalkAnswer Migration END----");

// 以下マイグレーション関数****************************************