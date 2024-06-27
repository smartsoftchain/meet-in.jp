<?php
include_once dirname(__FILE__)."/../function/CommonMigration.php";

// easy migrate 用ユニークID作成
$uniqueId = date("123456789");

// 移行対象外のクライアントのID配列
$targetClient = array(
    42
);

/**
 * DBへの接続を試みる
 * @var unknown_type
 */
try{
    // DAO読み込み時のエラー回避のため、空のarrayをセットする
    Zend_Registry::set('user', array());

    // 現行TMOのDBのインスタンス作成
    $currentDb = getCurrentDbObject();
    // 移行先DBのインスタンス作成
    $destinationDb = getNewDbObject();

}
catch (Exception $err){
    debugMeg("error:".$err->getMessage());
}



/**
 * 開発用：テーブルを空にする
 * @param unknown $db
 * @param unknown $truncateArray
 */
function truncateTable($db , $truncateArray){

    foreach($truncateArray as $truncateTable){
        $sql = "TRUNCATE TABLE {$truncateTable}";
        $db->query($sql);
    }

    return;
}

/**
 * 開発用：連番テーブルを削除する
 * @param unknown $db
 * @param unknown $dropArray 連番部分を抜いたテーブル名配列
 * @param unknown $count 連番の数
 */
function dropTable($db , $dropArray ,$count){

    foreach ($dropArray as $dropTable) {
        for($i = 1; $i <= $count; $i++){
            $sql = "SHOW TABLES LIKE '{$dropTable}{$i}'";
            $row = $db->fetchRow($sql, array());
            if(!empty($row)){
                $sql = "DROP TABLE {$dropTable}{$i}";
                $db->query($sql);
            }
        }
    }


    return;
}