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

debugMeg("----template_result_memo Repair START----");

// 対象となるクライアント
//$targetClientStr = " 310, 314, 349, 467, 501, 621, 655, 672 ";
$targetClientStr = " 310, 314, 349, 501, 621, 655 ";

// データ移行に必要なDAOを宣言
$migrationRepairDao = Application_CommonUtil::getInstance('dao',"MigrationRepairDao", $destinationDb);

/**
 * @var unknown_type
 */
try{

// 対象となるデータの取得
    $templateResultMemoList = $migrationRepairDao->getTemplateResultMemo($targetClientStr);

    debugMeg("変換対象レコード数".count($templateResultMemoList));

    // トランザクションスタート
    $destinationDb->beginTransaction();

    // 変換後の挿入時に、返還前のIDが被らないようにデータ削除
    $migrationRepairDao->deleteTemplateResultMemo($targetClientStr);

    foreach($templateResultMemoList as $templateResultMemo){

        $templateResultData = array(
            "id" => $templateResultMemo["id"],
            "client_id" => $templateResultMemo["client_id"],
            "template_approach_result_id" => convTelStatus($templateResultMemo["template_approach_result_id"]),
            "name" => $templateResultMemo["name"],
            "view_flg" => $templateResultMemo["view_flg"],
            "create_date" => $templateResultMemo["create_date"],
            "update_date" => $templateResultMemo["update_date"],
            "del_flg" => $templateResultMemo["del_flg"]
        );
        
        $migrationRepairDao->simpleRegist("template_result_memo",$templateResultData);

    }

    // 登録完了したらコミットする
    $destinationDb->commit();
}
catch (Exception $err){
    $destinationDb->rollBack();
    debugMeg("想定外の例外：".$err->getMessage());
}


debugMeg("----template_result_memo Repair END----");
