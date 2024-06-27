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
//    $currentDb = getCurrentDbObject();
    // 移行先DBのインスタンス作成
    $destinationDb = getNewDbObject();

}
catch (Exception $err){
    debugMeg("error:".$err->getMessage());
}



debugMeg("----forbidden_approach Repair START----");

// 対象となるクライアント
$targetClientStr = " 310, 314, 349, 467, 501, 621, 655, 672 ";
// 変換係数
$typeMap = array(1=>"AA",2=>"CE",3=>"TA");

// データ移行に必要なDAOを宣言
$migrationRepairDao = Application_CommonUtil::getInstance('dao',"MigrationRepairDao", $destinationDb);

// 対象となるデータの取得
$forbiddenApproachList = $migrationRepairDao->getForbiddenApproach($targetClientStr);


debugMeg("変換対象レコード数".count($forbiddenApproachList));
/**
 * @var unknown_type
 */
try{
    // トランザクションスタート
    $destinationDb->beginTransaction();

    foreach($forbiddenApproachList as $forbiddenApproach){

        $invalidTelephoneData = array(
            "id" => $forbiddenApproach["id"],
            "regist_staff_type" => $typeMap[$forbiddenApproach["regist_staff_type"]],
            "update_staff_type" => $typeMap[$forbiddenApproach["update_staff_type"]],
        );

        $migrationRepairDao->updateForbiddenApproach($invalidTelephoneData);

    }
    // 登録完了したらコミットする
    $destinationDb->commit();
}
catch (Exception $err){
    $destinationDb->rollBack();
    debugMeg("想定外の例外：".$err->getMessage());
}


debugMeg("----forbidden_approach Repair END----");
