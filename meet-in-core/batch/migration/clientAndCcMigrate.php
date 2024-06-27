<?php
/**
 * Created by PhpStorm.
 * User: matsuno.masahiro
 * Date: 2016/02/19
 * Time: 17:14
 */

// DB接続
include_once dirname(__FILE__)."/setting.php";

debugMeg("----clientAndCc Migration START----");

/**
 * @var unknown_type
 */
try{
// データ移行に必要なDAOを宣言
    $migrationDao = Application_CommonUtil::getInstance('dao',"MigrationDao", $destinationDb);

// トランザクションスタート
    $destinationDb->beginTransaction();

    $sql = "SELECT cac.*,new_id FROM client_and_cc AS cac INNER JOIN client AS cl ON cac.client_id=cl.client_id ";
    if(0<count($targetClient)){
        $sql .= " WHERE cac.client_id IN (" .implode(',', $targetClient). ")";
    }
    $stm = $currentDb->query($sql.";");
    $clientAndCcList = $stm->fetchAll();

    foreach ($clientAndCcList as $clientAndCc) {

        $clientAndCcData = array(
            "id" => $clientAndCc["cc_id"],
            "client_id" => $clientAndCc["new_id"],
            "mail_address" => $clientAndCc["address"],
            "del_flg" => $clientAndCc["del_flg"],
            "receiver_name" => $clientAndCc["name"],
            "staff_type" => "AA",
            "staff_id" => 27
        );
        $migrationDao->masterClientCCRegist($clientAndCcData);
    }

    // 登録完了したらコミットする
    $destinationDb->commit();

}
catch (Exception $err){
    $destinationDb->rollBack();
    debugMeg("想定外の例外：".$err->getMessage());
}


debugMeg("----clientAndCc Migration END----");

// 以下マイグレーション関数****************************************