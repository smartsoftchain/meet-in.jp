<?php
/**
 * Created by PhpStorm.
 * User: matsuno.masahiro
 * Date: 2016/02/19
 * Time: 17:14
 */

// DB接続
include_once dirname(__FILE__)."/setting.php";

debugMeg("----ClientDownloadOption Migration START----");

/**
 * @var unknown_type
 */
try{
// データ移行に必要なDAOを宣言
    $migrationDao = Application_CommonUtil::getInstance('dao',"MigrationDao", $destinationDb);

// トランザクションスタート
    $destinationDb->beginTransaction();

    $sql = "SELECT cdo.*,new_id FROM client_download_option AS cdo INNER JOIN client AS cl ON cdo.client_id=cl.client_id ";
    if(0<count($targetClient)){
        $sql .= " WHERE cdo.client_id IN (" .implode(',', $targetClient). ") AND DATE_FORMAT(cdo.regist_date, '%Y-%m-%d') >= '2016-04-05'";
    }
    $stm = $currentDb->query($sql.";");
    $clientDownloadOptionList = $stm->fetchAll();

    foreach ($clientDownloadOptionList as $clientDownloadOption) {
        $clientDownloadOptionData = array(
            "client_id" => $clientDownloadOption["new_id"],
            "publish_telephone_db_flg" => $clientDownloadOption["publish_telephone_db_flg"],
            "plan_name" => $clientDownloadOption["plan_name"],
            "ca_is_enable_over" => $clientDownloadOption["ca_is_enable_over"],
            "ca_download_num" => $clientDownloadOption["ca_download_num"],
            "ca_download_limit" => $clientDownloadOption["ca_download_limit"],
            "aa_is_enable_download" => $clientDownloadOption["aa_is_enable_download"],
            "aa_download_limit" => $clientDownloadOption["aa_download_limit"],
            "current_flg" => $clientDownloadOption["current_flg"],
            "create_date" => $clientDownloadOption["regist_date"]
        );

        $migrationDao->masterClientDownloadRegist($clientDownloadOptionData);
    }

    // 登録完了したらコミットする
    $destinationDb->commit();

}
catch (Exception $err){
    $destinationDb->rollBack();
    debugMeg("想定外の例外：".$err->getMessage());
}


debugMeg("----ClientDownloadOption Migration END----");

// 以下マイグレーション関数****************************************