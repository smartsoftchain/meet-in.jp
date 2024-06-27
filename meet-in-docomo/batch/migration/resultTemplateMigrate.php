<?php
/**
 * Created by PhpStorm.
 * User: matsuno.masahiro
 * Date: 2016/02/19
 * Time: 17:14
 */

// DB接続
include_once dirname(__FILE__)."/setting.php";

debugMeg("----resultTemplate Migration START----");

/**
 * @var unknown_type
 */
try{
// データ移行に必要なDAOを宣言
    $migrationDao = Application_CommonUtil::getInstance('dao',"MigrationDao", $destinationDb);

// 移行用にold_idカラムがなければ作成する
    $migrationDao->makeOldResultTemplateId();

// トランザクションスタート
    $destinationDb->beginTransaction();

    $sql = "SELECT rt.*,new_id FROM result_template AS rt INNER JOIN client AS cl ON rt.client_id=cl.client_id ";
    if(0<count($targetClient)){
        $sql .= " WHERE rt.client_id IN (" .implode(',', $targetClient). ") AND DATE_FORMAT(rt.create_time, '%Y-%m-%d') >= '2016-04-05'";
    }
    $stm = $currentDb->query($sql.";");
    $resultTemplateList = $stm->fetchAll();

    foreach ($resultTemplateList as $resultTemplate) {

        $resultTemplateData = array(
            "old_id" => $resultTemplate["id"],
            "client_id" => $resultTemplate["new_id"],
            "template_approach_result_id" => convTelStatus($resultTemplate["result_type"]),
            "name" => $resultTemplate["name"],
            "view_flg" => $resultTemplate["view_flg"],
            "create_date" => $resultTemplate["create_time"],
            "update_date" => $resultTemplate["update_time"],
            "del_flg" => $resultTemplate["del_flg"]
        );
        $migrationDao->templateResultMemoRegist($resultTemplateData);
    }

    // 登録完了したらコミットする
    $destinationDb->commit();

}
catch (Exception $err){
    $destinationDb->rollBack();
    debugMeg("想定外の例外：".$err->getMessage());
}


debugMeg("----resultTemplate Migration END----");

// 以下マイグレーション関数****************************************