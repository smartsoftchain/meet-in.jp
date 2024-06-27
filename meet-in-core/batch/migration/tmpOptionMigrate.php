<?php
/**
 * Created by PhpStorm.
 * User: matsuno.masahiro
 * Date: 2016/02/19
 * Time: 17:14
 */

// DB接続
include_once dirname(__FILE__)."/setting.php";

debugMeg("----TmpOption Migration START----");

// TODO ここでなんやかんやしてデータを移行する
/**
 * @var unknown_type
 */
try{
// データ移行に必要なDAOを宣言
    $migrationDao = Application_CommonUtil::getInstance('dao',"MigrationDao", $destinationDb);

    // 移行先にテーブルがないので作成
    $migrationDao->createTmpOptionTable();

// トランザクションスタート
    $destinationDb->beginTransaction();

    $sql = "SELECT tm.*,new_id FROM tmp_option AS tm INNER JOIN client AS cl ON tm.client_id=cl.client_id ";
    if(0<count($targetClient)){
        $sql .= " WHERE tm.client_id IN (" .implode(',', $targetClient). ")";
    }
    $stm = $currentDb->query($sql.";");
    $tmpOptionList = $stm->fetchAll();

    foreach ($tmpOptionList as $tmpOption) {

        $tmpOptionData = array(
            "user_key" => $tmpOption["user_key"],
            "client_id" => $tmpOption["new_id"],
            "staff_type" => $tmpOption["staff_type"],
            "staff_id" => $tmpOption["staff_id"],
            "staff_price" => $tmpOption["staff_price"],
        );
        $migrationDao->simpleRegist('tmp_option',$tmpOptionData);
    }

    // 登録完了したらコミットする
    $destinationDb->commit();

}
catch (Exception $err){
    $destinationDb->rollBack();
    debugMeg("想定外の例外：".$err->getMessage());
}


debugMeg("----TmpOption Migration END----");

// 以下マイグレーション関数****************************************