<?php
/**
 * Created by PhpStorm.
 * User: matsuno.masahiro
 * Date: 2016/02/19
 * Time: 17:14
 */

// DB接続
include_once dirname(__FILE__)."/setting.php";

debugMeg("----ScriptRelation Migration START----");

/**
 * @var unknown_type
 */
try{
// データ移行に必要なDAOを宣言
    $scriptRelationDao = Application_CommonUtil::getInstance('dao',"ScriptRelationDao", $destinationDb);

// トランザクションスタート
    $destinationDb->beginTransaction();

    $sql = "SELECT * FROM script_relation;";
    $stm = $currentDb->query($sql);
    $scriptRelationList = $stm->fetchAll();

    foreach ($scriptRelationList as $scriptRelation) {
        $scriptRelationData = array(
            "client_id" => $scriptRelation["client_id"],
            "approach_list_id" => $scriptRelation["project_id"],
            "talk_bind_id" => $scriptRelation["talk_bind_id"],
            "create_time" => $scriptRelation["create_time"],
            "update_time" => $scriptRelation["update_time"],
            "del_flg" => $scriptRelation["del_flg"]
        );
        $scriptRelationDao->regist($scriptRelationData);
    }

    // 登録完了したらコミットする
    $destinationDb->commit();

}
catch (Exception $err){
    $destinationDb->rollBack();
    debugMeg("想定外の例外：".$err->getMessage());
}


debugMeg("----ScriptRelation Migration END----");

// 以下マイグレーション関数****************************************