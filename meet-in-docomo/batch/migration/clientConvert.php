<?php
/**
 * Created by PhpStorm.
 * User: matsuno.masahiro
 * Date: 2016/02/19
 * Time: 17:14
 */

// DB接続
include_once dirname(__FILE__)."/setting.php";

debugMeg("----clientConvert START----");

/**
 * @var unknown_type
 */
// データ移行に必要なDAOを宣言
    $migrationDao = Application_CommonUtil::getInstance('dao',"MigrationDao", $destinationDb);


try {
    $currentDb->beginTransaction();

    // 新規移行用IDを作成する
    alterAddRelationId($currentDb, "client");

    $clientIdNext = $migrationDao->getClientIdMax() + 1;

    // クライアントスタッフ一覧
    $sql = "SELECT * FROM client";
    if (0 < count($targetClient)) {
        $sql .= " WHERE client_id IN (" . implode(',', $targetClient) . ")";
    }
    $stm = $currentDb->query($sql . ";");
    $clientList = $stm->fetchAll();
    foreach ($clientList as $client) {
        // 現在のクライアントIDが移行後に維持できるかチェック
//         if($migrationDao->checkId($client["client_id"])){
//             // 移行後に割り振られるIDを設定
//             $sql = "UPDATE client SET new_id={$client["client_id"]}
//                       WHERE
//                       client_id = {$client["client_id"]}";
//         }else{
//             // 移行後に割り振られるIDを設定
//             $sql = "UPDATE client SET new_id={$clientIdNext}
//                     WHERE
//                       client_id = {$client["client_id"]}";
//             $clientIdNext++;
//         }
    	$sql = "UPDATE client SET new_id=832
    	WHERE
    	client_id = {$client["client_id"]}";
        $stm = $currentDb->query($sql . ";commit;");

    }


//*********** 関連するテーブルをアップデート

    $sql = "SELECT * FROM client";
    if (0 < count($targetClient)) {
        $sql .= " WHERE client_id IN (" . implode(',', $targetClient) . ")";
    }
    $stm = $currentDb->query($sql . ";");
    $clientList = $stm->fetchAll();

    $currentDb->commit();

}
catch (Exception $err){
    $currentDb->rollBack();
    debugMeg("想定外の例外：".$err->getMessage());
}


debugMeg("----clientConvert END----");

// 以下マイグレーション関数****************************************
/**
 * カラム追加処理
 * @return unknown
 */
function alterAddRelationId($cdb, $tableName){

    $sql = "DESCRIBE {$tableName} `new_id`;";
    $stm = $cdb->query($sql);
    $result = $stm->fetchAll();

    if(empty($result)){
    // カラムを追加
        $sql = "ALTER TABLE {$tableName} ADD `new_id` int (11) COMMENT '移行後のID';";
        $cdb->query($sql);
    }

    return;
}

//*****************
