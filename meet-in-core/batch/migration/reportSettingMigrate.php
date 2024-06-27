<?php
/**
 * Created by PhpStorm.
 * User: matsuno.masahiro
 * Date: 2016/02/19
 * Time: 17:14
 */

// DB接続
include_once dirname(__FILE__)."/setting.php";

debugMeg("----reportSetting Migration START----");

/**
 * @var unknown_type
 */
try{
// データ移行に必要なDAOを宣言
    $migrationDao = Application_CommonUtil::getInstance('dao',"MigrationDao", $destinationDb);

// トランザクションスタート
    $destinationDb->beginTransaction();

    $sql = "SELECT rs.*,new_id FROM report_setting AS rs INNER JOIN client AS cl ON rs.client_id=cl.client_id ";
    if(0<count($targetClient)){
        $sql .= " WHERE rs.client_id IN (" .implode(',', $targetClient). ") AND DATE_FORMAT(rs.create_time, '%Y-%m-%d') >= '2016-04-05' ";
    }
    $stm = $currentDb->query($sql.";");
    $reportSettingList = $stm->fetchAll();

    foreach ($reportSettingList as $reportSetting) {

        // report_setting_relationを登録
        reportSettingRelationRegist($migrationDao,$reportSetting);

        // reportSettingを登録
        $reportSettingData = array(
            "client_id" => $reportSetting["new_id"],
            "id" => $reportSetting["id"],
            "report_title" => $reportSetting["report_title"],
            "sheet_name" => $reportSetting["sheet_name"],
            "company_name_flg" => $reportSetting["name_flg"],
            "tel_flg" => $reportSetting["tel_flg"],
            "address_flg" => $reportSetting["address_flg"],
            "postcode_flg" => $reportSetting["postcode_flg"],
            "fax_flg" => $reportSetting["fax_flg"],
            "company_url_flg" => $reportSetting["hp_flg"],
            "mail_flg" => $reportSetting["counter_mail_address_flg"],
            "company_info_flg" => $reportSetting["company_info_flg"],
            "company_representative_name_flg" => $reportSetting["representative_name_flg"],
            "base_name_flg" => $reportSetting["tanto_dept_flg"],
            "person_name_flg" => $reportSetting["tanto_name_flg"],
            "company_expertise_field_flg" => $reportSetting["expertise_field_flg"],
            "company_establishment_date_flg" => $reportSetting["establishment_date_flg"],
            "company_listing_a_stock_section_flg" => $reportSetting["listing_a_stock_section_flg"],
            "company_employee_count_flg" => $reportSetting["employee_count_flg"],
            "company_relation_company_flg" => $reportSetting["relation_company_flg"],
            "company_main_shareholder_flg" => $reportSetting["main_shareholder_flg"],
            "company_closing_period_flg" => $reportSetting["closing_period_flg"],
            "company_capital_stock_flg" => $reportSetting["capital_stock_flg"],
            "company_sales_volume_flg" => $reportSetting["sales_volume_flg"],
            "company_ordinary_income_flg" => $reportSetting["ordinary_income_flg"],
            "free1_flg" => $reportSetting["free1_flg"],
            "free2_flg" => $reportSetting["free2_flg"],
            "free3_flg" => $reportSetting["free3_flg"],
            "free4_flg" => $reportSetting["free4_flg"],
            "free5_flg" => $reportSetting["free5_flg"],
            "free6_flg" => $reportSetting["free6_flg"],
            "free7_flg" => $reportSetting["free7_flg"],
            "free8_flg" => $reportSetting["free8_flg"],
            "free9_flg" => $reportSetting["free9_flg"],
            "free10_flg" => $reportSetting["free10_flg"],
            "create_date" => $reportSetting["create_time"],
            "update_date" => $reportSetting["update_time"],
            "company_genre_flg" => 0,
            "company_category1_flg" => 0,
            "company_category2_flg" => 0,
            "company_category3_flg" => 0,
            "company_my_number_flg" => 0,
            "company_detail_url_flg" => 0,
            "company_inquiry_form_flg" => 0,
            "position_flg" => 0,
            "person_kana_flg" => 0,

        );

        $migrationDao->simpleRegist('report_setting',$reportSettingData);
    }

    // 登録完了したらコミットする
    $destinationDb->commit();

}
catch (Exception $err){
    $destinationDb->rollBack();
    debugMeg("想定外の例外：".$err->getMessage());
}


debugMeg("----reportSetting Migration END----");

// 以下マイグレーション関数****************************************
/**
 * @param $migrationDao
 * @param $reportSetting
 */
function reportSettingRelationRegist($migrationDao,$reportSetting){
    $reportSettingRelationData = array(
        "client_id" => $reportSetting["new_id"],
        "report_setting_id" => $reportSetting["id"],
        "template_approach_type" => "1",
        "staff_type" => "AA",
        "staff_id" => "27"
    );

    if($reportSetting["status_0_flg"] == 1){
        $reportSettingRelationData["template_approach_result_id"] = 7;
        $migrationDao->reportSettingRelationRegist($reportSettingRelationData);
    }
    if($reportSetting["status_1_flg"] == 1){
        $reportSettingRelationData["template_approach_result_id"] = 1;
        $migrationDao->reportSettingRelationRegist($reportSettingRelationData);
    }
    if($reportSetting["status_2_flg"] == 1){
        $reportSettingRelationData["template_approach_result_id"] = 2;
        $migrationDao->reportSettingRelationRegist($reportSettingRelationData);
    }
    if($reportSetting["status_3_flg"] == 1){
        $reportSettingRelationData["template_approach_result_id"] = 4;
        $migrationDao->reportSettingRelationRegist($reportSettingRelationData);
    }
    if($reportSetting["status_4_flg"] == 1){
        $reportSettingRelationData["template_approach_result_id"] = 5;
        $migrationDao->reportSettingRelationRegist($reportSettingRelationData);
    }
    if($reportSetting["status_5_flg"] == 1){
        $reportSettingRelationData["template_approach_result_id"] = 6;
        $migrationDao->reportSettingRelationRegist($reportSettingRelationData);
    }
    if($reportSetting["status_6_flg"] == 1){
        $reportSettingRelationData["template_approach_result_id"] = 3;
        $migrationDao->reportSettingRelationRegist($reportSettingRelationData);
    }
    if($reportSetting["status_7_flg"] == 1){
        $reportSettingRelationData["template_approach_result_id"] = 8;
        $migrationDao->reportSettingRelationRegist($reportSettingRelationData);
    }
}