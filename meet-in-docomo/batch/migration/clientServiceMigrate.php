<?php
/**
 * Created by PhpStorm.
 * User: matsuno.masahiro
 * Date: 2016/02/19
 * Time: 17:14
 */

// DB接続
include_once dirname(__FILE__)."/setting.php";

debugMeg("----clientService Migration START----");

/**
 * @var unknown_type
 */
try{
// データ移行に必要なDAOを宣言
    $migrationDao = Application_CommonUtil::getInstance('dao',"MigrationDao", $destinationDb);

// トランザクションスタート
    $destinationDb->beginTransaction();

// 移行用にold_idカラムがなければ作成する
    $migrationDao->makeOldMasterStaffId($clientServiceData);


    $sql = "SELECT cs.*,new_id FROM client_service AS cs INNER JOIN client AS cl ON cs.client_id=cl.client_id ";
    if(0<count($targetClient)){
        $sql .= " WHERE cs.client_id IN (" .implode(',', $targetClient). ") AND DATE_FORMAT(cs.create_time, '%Y-%m-%d') >= '2016-04-05'";
    }
    $stm = $currentDb->query($sql.";");
    $clientServiceList = $stm->fetchAll();

    foreach ($clientServiceList as $clientService) {

        $clientServiceData = array(
            "client_id" => $clientService["new_id"],
            "update_staff_type" => "AA",
            "update_staff_id" => "27",
            "del_flg" => 0,
            "service_name" => $clientService["service_name"],
            "create_date" => $clientService["create_time"],
            "update_date" => $clientService["update_time"],
            "old_id" => $clientService["id"] // 旧IDを一時的に保存
        );
        $migrationDao->simpleRegist('master_client_service',$clientServiceData);
    }

    // 登録完了したらコミットする
    $destinationDb->commit();

}
catch (Exception $err){
    $destinationDb->rollBack();
    debugMeg("想定外の例外：".$err->getMessage());
}


debugMeg("----clientService Migration END----");

// 以下マイグレーション関数****************************************
