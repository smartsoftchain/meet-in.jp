<?php
/**
 * Created by PhpStorm.
 * User: matsuno.masahiro
 * Date: 2016/02/19
 * Time: 17:14
 */

// DB接続
include_once dirname(__FILE__)."/setting.php";

debugMeg("----tmp Migration START----");

// TODO ここでなんやかんやしてデータを移行する
/**
 * @var unknown_type
 */
try{
// データ移行に必要なDAOを宣言
    $tmpDao = Application_CommonUtil::getInstance('dao',"tmpDao", $destinationDb);

// トランザクションスタート
    $destinationDb->beginTransaction();

    $sql = "SELECT * FROM client_download;";
    $stm = $currentDb->query($sql);
    $tmpList = $stm->fetchAll();

    foreach ($tmpList as $tmp) {

        $tmpData = array(

        );
        $tmpDao->regist($tmpData);
    }

    // 登録完了したらコミットする
    $destinationDb->commit();

}
catch (Exception $err){
    $destinationDb->rollBack();
    debugMeg("想定外の例外：".$err->getMessage());
}


debugMeg("----tmp Migration END----");

// 以下マイグレーション関数****************************************