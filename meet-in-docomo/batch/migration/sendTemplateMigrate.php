<?php
/**
 * Created by PhpStorm.
 * User: matsuno.masahiro
 * Date: 2016/02/19
 * Time: 17:14
 */

// DB接続
include_once dirname(__FILE__)."/setting.php";

debugMeg("----SendTemplate Migration START----");

/**
 * @var unknown_type
 */
try{
// データ移行に必要なDAOを宣言
    $migrationDao = Application_CommonUtil::getInstance('dao',"MigrationDao", $destinationDb);

// 移行用にold_idカラムがなければ作成する
    $migrationDao->makeOldSendTemplateId();

// トランザクションスタート
    $destinationDb->beginTransaction();

    $sql = "SELECT st.*,cl.new_id FROM send_template AS st INNER JOIN client AS cl ON st.client_id=cl.client_id";
    if(0<count($targetClient)){
        $sql .= " WHERE st.client_id IN (" .implode(',', $targetClient). ") AND DATE_FORMAT(st.create_time, '%Y-%m-%d') >= '2016-04-05'";
    }
    $stm = $currentDb->query($sql.";");
    $sendTemplateList = $stm->fetchAll();

    foreach ($sendTemplateList as $sendTemplate) {

        $sendTemplateData = array(
            // ID は client_idごとに採番なのでモデル側で関数を使用する
            "old_id" => $sendTemplate["id"],
            "client_id" => $sendTemplate["new_id"],
            "name" => $sendTemplate["name"],
            "view_flg" => $sendTemplate["view_flg"],
            "create_date" => $sendTemplate["create_time"],
            "update_date" => $sendTemplate["update_time"],
            "del_flg" => $sendTemplate["del_flg"]
        );
        $migrationDao->templateSendRegist($sendTemplateData);
    }

    // 登録完了したらコミットする
    $destinationDb->commit();

}
catch (Exception $err){
    $destinationDb->rollBack();
    debugMeg("想定外の例外：".$err->getMessage());
}


debugMeg("----sendTemplate Migration END----");

// 以下マイグレーション関数****************************************