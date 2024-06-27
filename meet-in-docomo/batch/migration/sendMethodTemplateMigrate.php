<?php
/**
 * Created by PhpStorm.
 * User: matsuno.masahiro
 * Date: 2016/02/19
 * Time: 17:14
 */

// DB接続
include_once dirname(__FILE__)."/setting.php";

debugMeg("----SendMethodTemplate Migration START----");

/**
 * @var unknown_type
 */
try{
// データ移行に必要なDAOを宣言
    $migrationDao = Application_CommonUtil::getInstance('dao',"MigrationDao", $destinationDb);

// 移行用にold_idカラムがなければ作成する
    $migrationDao->makeOldSendMethodTemplateId();

// トランザクションスタート
    $destinationDb->beginTransaction();

    $sql = "SELECT smt.*,cl.new_id FROM send_method_template  AS smt INNER JOIN client AS cl ON smt.client_id=cl.client_id";
    if(0<count($targetClient)){
        $sql .= " WHERE smt.client_id IN (" .implode(',', $targetClient). ") AND DATE_FORMAT(smt.create_time, '%Y-%m-%d') >= '2016-04-05'";
    }
    $stm = $currentDb->query($sql.";");
    $sendMethodTemplateList = $stm->fetchAll();

    foreach ($sendMethodTemplateList as $sendMethodTemplate) {

        $sendMethodTemplateData = array(
            // ID は client_idごとに採番なのでモデル側で関数を使用する
            "old_id" => $sendMethodTemplate["id"],
            "client_id" => $sendMethodTemplate["new_id"],
            "name" => $sendMethodTemplate["name"],
            "view_flg" => $sendMethodTemplate["view_flg"],
            "create_date" => $sendMethodTemplate["create_time"],
            "update_date" => $sendMethodTemplate["update_time"],
            "del_flg" => $sendMethodTemplate["del_flg"]
        );

        $migrationDao->templateSendMethodRegist($sendMethodTemplateData);
    }

    // 登録完了したらコミットする
    $destinationDb->commit();

}
catch (Exception $err){
    $destinationDb->rollBack();
    debugMeg("想定外の例外：".$err->getMessage());
}


debugMeg("----SendMethodTemplate Migration END----");

// 以下マイグレーション関数****************************************