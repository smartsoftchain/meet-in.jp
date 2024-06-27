<?php
/**
 * Created by PhpStorm.
 * User: matsuno.masahiro
 * Date: 2016/02/19
 * Time: 17:14
 */

// DB接続
include_once dirname(__FILE__)."/setting.php";

debugMeg("----AppointTemplate Migration START----");

/**
 * 現行DBのappointTemplateテーブルのデータ移行を行う
 * @var unknown_type
 */
try{

// データ移行に必要なDAOを宣言
    $migrationDao = Application_CommonUtil::getInstance('dao',"MigrationDao", $destinationDb);

// 移行用にold_idカラムがなければ作成する
    $migrationDao->makeOldAppointTemplateId();

// トランザクションスタート
    $destinationDb->beginTransaction();

    // アポイント情報取得
    $sql = "SELECT at.*,new_id FROM appoint_template AS at INNER JOIN client AS cl ON at.client_id=cl.client_id ";
    if(0<count($targetClient)){
        $sql .= " WHERE at.client_id IN (" .implode(',', $targetClient). ") AND DATE_FORMAT(at.create_time, '%Y-%m-%d') >= '2016-04-05'";
    }
    $stm = $currentDb->query($sql.";");
    $appointTemplateList = $stm->fetchAll();

    foreach($appointTemplateList as $appointTemplate){

        // データをセット
        $appointTemplate = array(
            // ID は client_idごとに採番なのでモデル側で関数を使用する
            "old_id" => $appointTemplate["id"],
            "client_id" => $appointTemplate["new_id"],
            "name" => $appointTemplate["name"],
            "view_flg" => $appointTemplate["view_flg"],
            "create_date" => $appointTemplate["create_time"],
            "update_date" => $appointTemplate["update_time"],
            "del_flg" => $appointTemplate["del_flg"]
        );

        $migrationDao->templateAppointSituationRegist($appointTemplate);

    }

    // 登録完了したらコミットする
    $destinationDb->commit();

}
catch (Exception $err){
    $destinationDb->rollBack();
    debugMeg("想定外の例外：".$err->getMessage());
}


debugMeg("----AppointTemplate Migration END----");

// 以下マイグレーション関数****************************************