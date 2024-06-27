<?php
/**
 * Created by PhpStorm.
 * User: matsuno.masahiro
 * Date: 2016/02/19
 * Time: 17:14
 */

// DB接続
include_once dirname(__FILE__)."/setting.php";

debugMeg("----Client Migration START----");

/**
 * @var unknown_type
 */
try{
// データ移行に必要なDAOを宣言
    $masterClientDao = Application_CommonUtil::getInstance('dao',"MasterClientDao", $destinationDb);
    $migrationDao = Application_CommonUtil::getInstance('dao',"MigrationDao", $destinationDb);



// トランザクションスタート
    $destinationDb->beginTransaction();

    // client取得
    $sql = "SELECT * FROM client";
    if(0<count($targetClient)){
        $sql .= " WHERE client_id IN (" .implode(',', $targetClient). ")";
    }
    $stm = $currentDb->query($sql.";");
    $clientList = $stm->fetchAll();

    // client取得
    $sql = "SELECT * FROM free_label_master;";
    $stm = $currentDb->query($sql);
    $freeLabelMasterList = $stm->fetchAll();

    foreach ($clientList as $client) {

        // clientを登録
        $clientData = array(
            "client_id" => $client["new_id"],
            "client_name" => $client["client_name"],
            "client_del_flg" => $client["client_del_flg"],
            "client_namepy" => $client["client_namepy"],
            "client_postcode1" => $client["client_postcode1"],
            "client_postcode2" => $client["client_postcode2"],
            "client_address" => $client["client_address"],
            "client_tel1" => $client["client_tel1"],
            "client_tel2" => $client["client_tel2"],
            "client_tel3" => $client["client_tel3"],
            "client_fax1" => $client["client_fax1"],
            "client_fax2" => $client["client_fax2"],
            "client_fax3" => $client["client_fax3"],
            "client_homepage" => $client["client_homepage"],
            "client_staffleaderfirstname" => $client["client_staffleaderfirstname"],
            "client_staffleaderlastname" => $client["client_staffleaderlastname"],
            "client_staffleaderfirstnamepy" => $client["client_staffleaderfirstnamepy"],
            "client_staffleaderlastnamepy" => $client["client_staffleaderlastnamepy"],
            "client_staffleaderemail" => $client["client_staffleaderemail"],
            "client_comment" => $client["client_comment"],
            "client_idchar" => $client["client_idchar"],
            "client_staffleadername" => $client["client_staffleadername"],
            "aa_staff_id_list" => $client["aa_staff_id_list"],
            "option_passwd" => $client["option_passwd"],
            "publish_recording_talk_flg" => $client["publish_recording_talk_flg"],
            "publish_telephone_db_flg" => $client["publish_telephone_db_flg"],
            "valid_telephonelist_downloading_num" => $client["valid_telephonelist_downloading_num"],
            "publish_analysis_menu_flg" => $client["publish_analysis_menu_flg"],
            "sum_span_type" => $client["sum_span_type"],
            "create_date" => $client["regist_date"],
            "update_date" => $client["update_date"],
            "client_add_staff_flg" => $client["client_add_staff_flg"]
        );
        $migrationDao->simpleRegist('master_client',$clientData);

        // アプローチ結果とタブ
        $masterClientDao->registResultAndTabAndMemo(array("clientId"=>$client["new_id"], "staffType"=>"AA", "staffId"=>"1"));
        // 資料送付：状況レベル
        $masterClientDao->registTemplateSendSituation($client["new_id"]);
        // 資料送付：送付方法
        $masterClientDao->registTemplateSendMethod($client["new_id"]);

        // カスタムラベル
        $masterClientDao->registFreeLabel(array("clientId"=>$client["new_id"], "staffType"=>"AA", "staffId"=>"1"));
        // リード管理のデフォルトを登録する
        $masterClientDao->registLeadManagement(array("clientId"=>$client["new_id"], "staffType"=>"AA", "staffId"=>"1"));
        // クライアントマスタDBを生成する
        $masterClientDao->registClientCreateTable($client["new_id"]);
    }

    // 登録完了したらコミットする
    $destinationDb->commit();

    // 完了したらオートインクリメントの値を修正
    $migrationDao->updateIncrement("master_client","client_id");
}
catch (Exception $err){
    $destinationDb->rollBack();
    debugMeg("想定外の例外：".$err->getMessage());
}


debugMeg("----Client Migration END----");

// 以下マイグレーション関数****************************************