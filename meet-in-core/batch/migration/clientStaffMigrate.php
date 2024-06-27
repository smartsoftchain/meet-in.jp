<?php
/**
 * Created by PhpStorm.
 * User: matsuno.masahiro
 * Date: 2016/02/19
 * Time: 17:14
 */

// DB接続
include_once dirname(__FILE__)."/setting.php";

debugMeg("----ClientStaff Migration START----");

// TODO ここでなんやかんやしてデータを移行する
/**
 * @var unknown_type
 */
try{
// データ移行に必要なDAOを宣言
    $migrationDao = Application_CommonUtil::getInstance('dao',"MigrationDao", $destinationDb);

// トランザクションスタート
    $destinationDb->beginTransaction();

    // クライアントスタッフ一覧
    $sql = "SELECT cs.*,cl.new_id AS new_client_id FROM client_staff AS cs INNER JOIN client AS cl ON cs.client_id=cl.client_id ";
    if(0<count($targetClient)){
        $sql .= " WHERE cs.client_id IN (" .implode(',', $targetClient). ")";
    }
    $stm = $currentDb->query($sql.";");
    $clientStaffList = $stm->fetchAll();

    foreach ($clientStaffList as $clientStaff) {

        $clientStaffData = array(
            "staff_id" =>$clientStaff["new_id"],
            "client_id" =>$clientStaff["new_client_id"],
            "staff_type" => "CE",// 未確定
            "staff_password" =>$clientStaff["new_md5_password"],
            "staff_name" =>$clientStaff["name"],
            "staff_firstname" =>$clientStaff["firstname"],
            "staff_lastname" =>$clientStaff["lastname"],
            "staff_firstnamepy" =>$clientStaff["firstnamepy"],
            "staff_lastnamepy" =>$clientStaff["lastnamepy"],
            "staff_email" =>$clientStaff["email"],
            "gaccount" =>$clientStaff["gaccount"],
            "gaccount_pass" =>$clientStaff["gaccount_pass"],
            "webphone_id" =>$clientStaff["webphone_id"],
            "webphone_pass" =>$clientStaff["webphone_pass"],
            "webphone_ip" =>$clientStaff["webphone_ip"],
            "call_type" =>$clientStaff["call_type"],
            "staff_del_flg" =>$clientStaff["del_flg"],
            "staff_role" =>$clientStaff["client_staff_role"],
            "sum_span_type" =>$clientStaff["sum_span_type"],
            "telephone_hour_price" =>$clientStaff["clientstaff_price"],
            "staff_payment_type" =>$clientStaff["clientstaff_payment_type"],

        	"telephone_one_price" => "150",
        	"maildm_hour_price" => "1500",
        	"maildm_one_price" => "150",
        	"inquiry_hour_price" => "1500",
        	"inquiry_one_price" => "150",
        	
            "auto_call" =>$clientStaff["auto_call"],
            "login_flg" =>$clientStaff["login_flg"],

            "staff_comment" => "",// 未確定
            "telework_start_date" => null,// 未確定
            "telework_end_date" => null// 未確定
        );
        $migrationDao->staffRegist($clientStaffData);
    }

    // 登録完了したらコミットする
    $destinationDb->commit();

}
catch (Exception $err){
    $destinationDb->rollBack();
    debugMeg("想定外の例外：".$err->getMessage());
}


debugMeg("----ClientStaff Migration END----");

// 以下マイグレーション関数****************************************