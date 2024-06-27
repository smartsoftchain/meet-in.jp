<?php
/**
 * Created by PhpStorm.
 * User: matsuno.masahiro
 * Date: 2016/02/19
 * Time: 17:14
 */

// DB接続
include_once dirname(__FILE__)."/setting.php";

debugMeg("----splitName Migration START----");

/**
 * @var unknown_type
 */
try{
// データ移行に必要なDAOを宣言
    $migrationDao = Application_CommonUtil::getInstance('dao',"MigrationDao", $destinationDb);

// トランザクションスタート
    $destinationDb->beginTransaction();

    $sql = "SELECT * FROM split_name;";
    $stm = $currentDb->query($sql);
    $splitNameList = $stm->fetchAll();

    foreach ($splitNameList as $splitName) {

        $splitNameData = array(
            "id" => $splitName["split_name_id"],
            "name" => $splitName["split_name_value"],
            "create_date" => $splitName["create_time"],
        );
        $migrationDao->simpleRegist('master_split_name',$splitNameData);
    }

    // 登録完了したらコミットする
    $destinationDb->commit();

}
catch (Exception $err){
    $destinationDb->rollBack();
    debugMeg("想定外の例外：".$err->getMessage());
}


debugMeg("----splitName Migration END----");

// 以下マイグレーション関数****************************************