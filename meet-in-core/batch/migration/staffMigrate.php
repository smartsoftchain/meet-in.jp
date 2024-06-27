<?php
/**
 * Created by PhpStorm.
 * User: matsuno.masahiro
 * Date: 2016/02/19
 * Time: 17:14
 */

// DB接続
include_once dirname(__FILE__)."/setting.php";

debugMeg("----Staff Migration START----");

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
    $sql = "SELECT * FROM staff;";
    $stm = $currentDb->query($sql);
    $staffList = $stm->fetchAll();

    foreach ($staffList as $staff) {
        $staffData = array(
            "staff_id" =>$staff["new_id"],
            "staff_type" => ($staff["teleworker_flg"] == 0) ? "AA" : "TA",// 未確定
            "staff_password" => $staff["new_md5_password"],
            "staff_name" => $staff["staff_name"],
            "staff_firstname" => $staff["staff_firstname"],
            "staff_lastname" => $staff["staff_lastname"],
            "staff_firstnamepy" => $staff["staff_firstnamepy"],
            "staff_lastnamepy" => $staff["staff_lastnamepy"],
            "staff_email" => $staff["staff_email"],
            "webphone_id" => $staff["webphone_id"],
            "webphone_pass" => $staff["webphone_pass"],
            "webphone_ip" => $staff["webphone_ip"],
            "call_type" => $staff["call_type"],
            "staff_del_flg" => $staff["staff_del_flg"],
            "staff_role" => $staff["staff_role"],
            "sum_span_type" => $staff["sum_span_type"],
            "telephone_hour_price" => $staff["staff_price"],
            "staff_payment_type" => $staff["staff_payment_type"],
        	
        	"telephone_one_price" => "150",
        	"maildm_hour_price" => "1500",
        	"maildm_one_price" => "150",
        	"inquiry_hour_price" => "1500",
        	"inquiry_one_price" => "150",

        		"auto_call" => $staff["auto_call"],
            "staff_comment" => $staff["staff_comment"],
            "telework_start_date" => $staff["telework_start_date"],
            "telework_end_date" => $staff["telework_end_date"],

            "login_flg" => 1,// 未確定
            "gaccount" => null,// 未確定
            "gaccount_pass" => null,// 未確定
            "client_id" => null// 未確定
        );
        $migrationDao->staffRegist($staffData);
    }

    // 登録完了したらコミットする
    $destinationDb->commit();

}
catch (Exception $err){
    $destinationDb->rollBack();
    debugMeg("想定外の例外：".$err->getMessage());
}


debugMeg("----Staff Migration END----");

// 以下マイグレーション関数****************************************