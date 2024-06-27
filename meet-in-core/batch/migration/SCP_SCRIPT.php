<?php
/**
 * Created by PhpStorm.
 * User: matsuno.masahiro
 * Date: 2016/02/19
 * Time: 17:14
 */

// DB接続
include_once dirname(__FILE__)."/setting.php";

debugMeg("----scpScript Command----");


try {
    $FileNameList=array();

    // クライアントスタッフ一覧
    $sql = "SELECT talk_script_url FROM  `talk_bind`  WHERE `del_flg` = 0 AND talk_script_url != \"\"";
    if (0 < count($targetClient)) {
        $sql .= " AND client_id IN (" . implode(',', $targetClient) . ")";
    }
    $stm = $currentDb->query($sql . ";");
    $scriptList = $stm->fetchAll();
    if(!empty($scriptList)){
        foreach ($scriptList as $scrip) {
                array_push($FileNameList , $scrip["talk_script_url"]);
        }
        var_dump("scp -P 6022 {\"" . implode('","', $FileNameList) . "\"} mnguser@27.133.130.165:/var/www/script/.");
    }
}
catch (Exception $err){
    debugMeg("想定外の例外：".$err->getMessage());
}

debugMeg("----scpScript Command----");

// 以下マイグレーション関数****************************************