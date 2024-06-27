<?php
/**
 * Created by PhpStorm.
 * User: matsuno.masahiro
 * Date: 2016/02/19
 * Time: 17:14
 */

// DB接続
include_once dirname(__FILE__)."/setting.php";

debugMeg("----staffConvert START----");

/**
 * @var unknown_type
 */
// データ移行に必要なDAOを宣言
$migrationDao = Application_CommonUtil::getInstance('dao',"MigrationDao", $destinationDb);


try {
    $currentDb->beginTransaction();

    // 新規移行用IDを作成する
    alterAddRelationId($currentDb, "client_staff");
    alterAddRelationId($currentDb, "staff");

    $staffCEIdNext = $migrationDao->getStaffIdMax("CE") + 1;
    // staff全体移行時のIDを固定値で用意。ここから始めることで何度やっても同じ変換を行うことができる
    $staffAAIdNext = 253;
    $staffTAIdNext = 140;

    // クライアントスタッフ一覧
    $sql = "SELECT * FROM client_staff";
    if (0 < count($targetClient)) {
        $sql .= " WHERE client_id IN (" . implode(',', $targetClient) . ")";
    }
    $stm = $currentDb->query($sql . ";");
    $clientStaffList = $stm->fetchAll();
    foreach ($clientStaffList as $clientStaff) {
        $unique = uniqueKey();

        $sql = "UPDATE client_staff SET new_id={$staffCEIdNext},new_password=\"{$unique['plane']}\",new_md5_password=\"{$unique['md5']}\"
WHERE
            seq = {$clientStaff["seq"]} AND
            client_id = {$clientStaff["client_id"]}";

        $stm = $currentDb->query($sql . ";commit;");

        $staffCEIdNext++;
    }

    //スタッフ一覧
    $sql = "SELECT * FROM `staff` ";
    $stm = $currentDb->query($sql . ";");

    $staffList = $stm->fetchAll();
    foreach ($staffList as $staff) {
        $unique = uniqueKey();

        if ($staff["teleworker_flg"] == 0) {// AAの時
            $sql = "UPDATE staff SET new_id={$staffAAIdNext},new_password=\"{$unique['plane']}\",new_md5_password=\"{$unique['md5']}\"
WHERE
            staff_id = {$staff["staff_id"]} ";

            $stm = $currentDb->query($sql . ";commit;");

            $staffAAIdNext++;
        } else {// TAの時
            $sql = "UPDATE staff SET new_id={$staffTAIdNext},new_password=\"{$unique['plane']}\",new_md5_password=\"{$unique['md5']}\"
WHERE
            staff_id = {$staff["staff_id"]} ";

            $stm = $currentDb->query($sql . ";commit;");

            $staffTAIdNext++;
        }

    }

//*********** 関連するテーブルをアップデート

    $sql = "SELECT * FROM client_staff";
    if (0 < count($targetClient)) {
        $sql .= " WHERE client_id IN (" . implode(',', $targetClient) . ")";
    }
    $stm = $currentDb->query($sql . ";");
    $ceList = $stm->fetchAll();
    $sql = "SELECT * FROM `staff` WHERE teleworker_flg = 0";
    $stm = $currentDb->query($sql . ";");
    $aaList = $stm->fetchAll();
    $sql = "SELECT * FROM `staff` WHERE teleworker_flg = 1";
    $stm = $currentDb->query($sql . ";");
    $taList = $stm->fetchAll();

    $ceAl = staffCase($ceList, "seq");
    $aaAl = staffCase($aaList, "staff_id");
    $taAl = staffCase($taList, "staff_id");


    appointUpdate($currentDb, $targetClient, $ceAl);
    consumerListUpdate($currentDb, $targetClient, $ceAl, $aaAl, $taAl);
    invalidTelephoneUpdate($currentDb, $targetClient, $ceAl, $aaAl, $taAl);
    mailNotifySettingUpdate($currentDb, $targetClient, $ceAl, $aaAl, $taAl);
    projectUpdate($currentDb, $targetClient, $ceList, $aaList, $taList);
    restrictionConsumer($currentDb, $ceAl, $aaAl, $taAl);
    resultUpdate($currentDb, $targetClient, $ceAl, $aaAl, $taAl);
    staffAndConsumerUpdate($currentDb, $targetClient, $ceAl, $aaAl, $taAl);
    talkBindUpdate($currentDb, $targetClient, $ceAl, $aaAl, $taAl);

    $currentDb->commit();

}
catch (Exception $err){
    $currentDb->rollBack();
    debugMeg("想定外の例外：".$err->getMessage());
}


debugMeg("----staffConvert END----");

// 以下マイグレーション関数****************************************
function staffCase($staffList,$name){

    if(!empty($staffList)){

        $result = array(
            "when" => "",
            "where" => ""
        );
        $in = array();

        foreach ($staffList as $staff) {
            $result["when"] .= "WHEN " . $staff[$name] . " THEN " .  $staff["new_id"] . " ";
            array_push($in,$staff[$name]);
        }
        if(empty($result["where"])){
            $result["where"] = implode(",", $in);
        }

    }else{
        $result = array(
            "when" => "WHEN 0 THEN 0 ",
            "where" => "0"
        );
    }

    return $result;
}

/**
 * カラム追加処理
 * @return unknown
 */
function alterAddRelationId($cdb, $tableName){

    $sql = "DESCRIBE {$tableName} `new_id`;";
    $stm = $cdb->query($sql);
    $result = $stm->fetchAll();

    if(empty($result)){
        // カラムを追加
        $sql = "ALTER TABLE {$tableName} ADD `new_id` int (11) COMMENT '移行後のID';";
        $cdb->query($sql);
    }

    $sql = "DESCRIBE {$tableName} `new_password`;";
    $stm = $cdb->query($sql);
    $result = $stm->fetchAll();
    if(empty($result)){
        // カラムを追加
        $sql = "ALTER TABLE {$tableName} ADD `new_password` varchar (32) NOT NULL COMMENT '新パスワード';";
        $cdb->query($sql);
    }
    $sql = "DESCRIBE {$tableName} `new_md5_password`;";
    $stm = $cdb->query($sql);
    $result = $stm->fetchAll();
    if(empty($result)){
        // カラムを追加
        $sql = "ALTER TABLE {$tableName} ADD `new_md5_password` varchar (32) NOT NULL COMMENT '暗号化新パスワード';";
        $cdb->query($sql);
    }

    return;
}

//*****************

function appointUpdate($cdb,$targetClient,$ceAl){

    $sql = "UPDATE appoint SET appoint_clientstaffseq = CASE appoint_clientstaffseq " .$ceAl["when"]. " END WHERE appoint_clientstaffseq IN (" . $ceAl["where"] . ")";
    if(0<count($targetClient)){
        $sql .= " AND appoint_clientid IN (" .implode(',', $targetClient). ")";
    }
    $cdb->query($sql.";");

    //$cdb->query("commit;");
}

function consumerListUpdate($cdb,$targetClient,$ceAl,$aaAl,$taAl){

    $sql = "UPDATE consumer_list SET regist_id = CASE regist_id " .$ceAl["when"]. " END WHERE regist_id IN (" . $ceAl["where"] . ") AND regist_type = '2'";
    if(0<count($targetClient)){
        $sql .= " AND client_id IN (" .implode(',', $targetClient). ")";
    }
    $cdb->query($sql.";");
    $sql = "UPDATE consumer_list SET update_id = CASE update_id " .$ceAl["when"]. " END WHERE update_id IN (" . $ceAl["where"] . ") AND update_type = '2'";
    if(0<count($targetClient)){
        $sql .= " AND client_id IN (" .implode(',', $targetClient). ")";
    }
    $cdb->query($sql.";");

    $sql = "UPDATE consumer_list SET regist_id = CASE regist_id " .$aaAl["when"]. " END WHERE regist_id IN (" . $aaAl["where"] . ") AND regist_type = '1'";
    if(0<count($targetClient)){
        $sql .= " AND client_id IN (" .implode(',', $targetClient). ")";
    }
    $cdb->query($sql.";");
    $sql = "UPDATE consumer_list SET update_id = CASE update_id " .$aaAl["when"]. " END WHERE update_id IN (" . $aaAl["where"] . ") AND update_type = '1'";
    if(0<count($targetClient)){
        $sql .= " AND client_id IN (" .implode(',', $targetClient). ")";
    }
    $cdb->query($sql.";");

    //$cdb->query("commit;");
}


function invalidTelephoneUpdate($cdb,$targetClient,$ceAl,$aaAl,$taAl){

    $sql = "UPDATE invalid_telephone SET regist_staff_id = CASE regist_staff_id " .$ceAl["when"]. " END WHERE regist_staff_id IN (" . $ceAl["where"] . ") AND regist_staff_type = '2'";
    if(0<count($targetClient)){
        $sql .= " AND client_id IN (" .implode(',', $targetClient). ")";
    }
    $cdb->query($sql.";");
    $sql = "UPDATE invalid_telephone SET update_staff_id = CASE update_staff_id " .$ceAl["when"]. " END WHERE update_staff_id IN (" . $ceAl["where"] . ") AND update_staff_type = '2'";
    if(0<count($targetClient)){
        $sql .= " AND client_id IN (" .implode(',', $targetClient). ")";
    }
    $cdb->query($sql.";");

    $sql = "UPDATE invalid_telephone SET regist_staff_id = CASE regist_staff_id " .$aaAl["when"]. " END WHERE regist_staff_id IN (" . $aaAl["where"] . ") AND regist_staff_type = '1'";
    if(0<count($targetClient)){
        $sql .= " AND client_id IN (" .implode(',', $targetClient). ")";
    }
    $cdb->query($sql.";");
    $sql = "UPDATE invalid_telephone SET update_staff_id = CASE update_staff_id " .$aaAl["when"]. " END WHERE update_staff_id IN (" . $aaAl["where"] . ") AND update_staff_type = '1'";
    if(0<count($targetClient)){
        $sql .= " AND client_id IN (" .implode(',', $targetClient). ")";
    }

    $cdb->query($sql.";");
    $sql = "UPDATE invalid_telephone SET regist_staff_id = CASE regist_staff_id " .$taAl["when"]. " END WHERE regist_staff_id IN (" . $taAl["where"] . ") AND regist_staff_type = '3'";
    if(0<count($targetClient)){
        $sql .= " AND client_id IN (" .implode(',', $targetClient). ")";
    }
    $cdb->query($sql.";");
    $sql = "UPDATE invalid_telephone SET update_staff_id = CASE update_staff_id " .$taAl["when"]. " END WHERE update_staff_id IN (" . $taAl["where"] . ") AND update_staff_type = '3'";
    if(0<count($targetClient)){
        $sql .= " AND client_id IN (" .implode(',', $targetClient). ")";
    }
    $cdb->query($sql.";");

    ////$cdb->query("commit;");
}

function logsUpdate($cdb,$targetClient,$ceAl,$aaAl,$taAl){

    $sql = "UPDATE logs SET staff_id = CASE staff_id " .$ceAl["when"]. " END WHERE staff_id IN (" . $ceAl["where"] . ") AND staff_type = 'CE'";
    if(0<count($targetClient)){
        $sql .= " AND client_id IN (" .implode(',', $targetClient). ")";
    }
    $cdb->query($sql.";");

    $sql = "UPDATE logs SET staff_id = CASE staff_id " .$aaAl["when"]. " END WHERE staff_id IN (" . $aaAl["where"] . ") AND staff_type = 'AA'";
    if(0<count($targetClient)){
        $sql .= " AND client_id IN (" .implode(',', $targetClient). ")";
    }
    $cdb->query($sql.";");

    $sql = "UPDATE logs SET staff_id = CASE staff_id " .$taAl["when"]. " END WHERE staff_id IN (" . $taAl["where"] . ") AND staff_type = 'TA'";
    if(0<count($targetClient)){
        $sql .= " AND client_id IN (" .implode(',', $targetClient). ")";
    }
    $cdb->query($sql.";");

    //$cdb->query("commit;");
}


function mailNotifySettingUpdate($cdb,$targetClient,$ceAl,$aaAl,$taAl){

    $sql = "UPDATE mail_notify_setting SET id = CASE id " .$ceAl["when"]. " END WHERE id IN (" . $ceAl["where"] . ") AND type = 'CE'";
    if(0<count($targetClient)){
        $sql .= " AND client_id IN (" .implode(',', $targetClient). ")";
    }
    $cdb->query($sql.";");

    $sql = "UPDATE mail_notify_setting SET id = CASE id " .$aaAl["when"]. " END WHERE id IN (" . $aaAl["where"] . ") AND type = 'AA'";
    if(0<count($targetClient)){
        $sql .= " AND client_id IN (" .implode(',', $targetClient). ")";
    }
    $cdb->query($sql.";");

    $sql = "UPDATE mail_notify_setting SET id = CASE id " .$taAl["when"]. " END WHERE id IN (" . $taAl["where"] . ") AND type = 'TA'";
    if(0<count($targetClient)){
        $sql .= " AND client_id IN (" .implode(',', $targetClient). ")";
    }
    $cdb->query($sql.";");

    //$cdb->query("commit;");
}

function projectUpdate($cdb,$targetClient,$ceList,$aaList,$taList){

    $sql = "SELECT project_id,project_staffseq,project_clientstaffseq,project_visitstaffseq,project_workerstaffseq FROM project ";
    if(0<count($targetClient)){
        $sql .= " WHERE project_clientid IN (" .implode(',', $targetClient). ")";
    }
    $stm = $cdb->query($sql.";");
    $projectList = $stm->fetchAll();

    foreach ($ceList as $ceStaff) {
        $ceStaffList[$ceStaff["seq"]] = $ceStaff["new_id"];
    }
    foreach ($aaList as $aaStaff) {
        $aaStaffList[$aaStaff["staff_id"]] = $aaStaff["new_id"];
    }
    foreach ($taList as $taStaff) {
        $taStaffList[$taStaff["staff_id"]] = $taStaff["new_id"];
    }

    foreach ($projectList as &$project) {
        $project["project_staffseq"] = arrayReplace(explode(",",$project["project_staffseq"]),$aaStaffList);
        $project["project_clientstaffseq"] = arrayReplace(explode(",",$project["project_clientstaffseq"]),$ceStaffList);
        $project["project_visitstaffseq"] = arrayReplace(explode(",",$project["project_visitstaffseq"]),$ceStaffList);
        $project["project_workerstaffseq"] = arrayReplace(explode(",",$project["project_workerstaffseq"]),$taStaffList);

        $sql = "UPDATE project SET project_staffseq='{$project["project_staffseq"]}',
project_clientstaffseq='{$project["project_clientstaffseq"]}',project_visitstaffseq='{$project["project_visitstaffseq"]}',project_workerstaffseq='{$project["project_workerstaffseq"]}'
  WHERE project_id =  '{$project["project_id"]}'";
        $cdb->query($sql.";");
    }
    unset($project);

    //$cdb->query("commit;");
}

function arrayReplace($array,$swapArray){
    $result=array();
    foreach($array as $value){
        if(!empty($swapArray[$value])){
            array_push($result,$swapArray[$value]);
        }else{
            array_push($result,$value);
        }
    }

    return implode(",",$result);
}

function restrictionConsumer($cdb,$ceAl,$aaAl,$taAl){

    $sql = "UPDATE restriction_consumer SET regist_staff_id = CASE regist_staff_id " .$ceAl["when"]. " END WHERE regist_staff_id IN (" . $ceAl["where"] . ")";
    $sql .= " AND regist_staff_type = '2'";
    $cdb->query($sql.";");
    $sql = "UPDATE restriction_consumer SET update_staff_id = CASE update_staff_id " .$ceAl["when"]. " END WHERE update_staff_id IN (" . $ceAl["where"] . ")";
    $sql .= " AND update_staff_type = '2'";
    $cdb->query($sql.";");

    $sql = "UPDATE restriction_consumer SET regist_staff_id = CASE regist_staff_id " .$aaAl["when"]. " END WHERE regist_staff_id IN (" . $aaAl["where"] . ")";
    $sql .= " AND regist_staff_type = '1'";
    $cdb->query($sql.";");
    $sql = "UPDATE restriction_consumer SET update_staff_id = CASE update_staff_id " .$aaAl["when"]. " END WHERE update_staff_id IN (" . $aaAl["where"] . ")";
    $sql .= " AND update_staff_type = '1'";
    $cdb->query($sql.";");

    $sql = "UPDATE restriction_consumer SET regist_staff_id = CASE regist_staff_id " .$taAl["when"]. " END WHERE regist_staff_id IN (" . $taAl["where"] . ")";
    $sql .= " AND regist_staff_type = '3'";
    $cdb->query($sql.";");
    $sql = "UPDATE restriction_consumer SET update_staff_id = CASE update_staff_id " .$taAl["when"]. " END WHERE update_staff_id IN (" . $taAl["where"] . ")";
    $sql .= " AND update_staff_type = '3'";
    $cdb->query($sql.";");

    //$cdb->query("commit;");
}

function resultUpdate($cdb,$targetClient,$ceAl,$aaAl,$taAl){

    $sql = "UPDATE result SET result_staffid = CASE result_staffid " .$ceAl["when"]. " END WHERE result_staffid IN (" . $ceAl["where"] . ") AND user_type = 'CE'";
    if(0<count($targetClient)){
        $sql .= " AND result_clientid IN (" .implode(',', $targetClient). ")";
    }
    $cdb->query($sql.";");

    $sql = "UPDATE result SET result_staffid = CASE result_staffid " .$aaAl["when"]. " END WHERE result_staffid IN (" . $aaAl["where"] . ") AND user_type = 'AA'";
    if(0<count($targetClient)){
        $sql .= " AND result_clientid IN (" .implode(',', $targetClient). ")";
    }
    $cdb->query($sql.";");

    $sql = "UPDATE result SET result_staffid = CASE result_staffid " .$taAl["when"]. " END WHERE result_staffid IN (" . $taAl["where"] . ") AND user_type = 'TA'";
    if(0<count($targetClient)){
        $sql .= " AND result_clientid IN (" .implode(',', $targetClient). ")";
    }
    $cdb->query($sql.";");

    //$cdb->query("commit;");
}


function staffAndConsumerUpdate($cdb,$targetClient,$ceAl,$aaAl,$taAl){

    // 事前にtypeを分割 AA1CE2TA3へ変換
    $sql = "SELECT * FROM staffandconsumer WHERE staffandconsumer_staff_type = 1";
    $stm = $cdb->query($sql.";");
    $staffAndConsumerList = $stm->fetchAll();

    foreach ($staffAndConsumerList as $staffAnConsumer) {
        if($staffAnConsumer["staffandconsumer_staffid"] >= 10000){
            $sql = "UPDATE staffandconsumer SET staffandconsumer_staff_type = 3 WHERE staffandconsumer_id = {$staffAnConsumer["staffandconsumer_id"]}";
            $cdb->query($sql.";");
        }
    }

    $sql = "UPDATE staffandconsumer SET staffandconsumer_staffid = CASE staffandconsumer_staffid " .$ceAl["when"]. " END WHERE staffandconsumer_staffid IN (" . $ceAl["where"] . ")  AND staffandconsumer_staff_type = '2'";
    $cdb->query($sql.";");

    $sql = "UPDATE staffandconsumer SET staffandconsumer_staffid = CASE staffandconsumer_staffid " .$aaAl["when"]. " END WHERE staffandconsumer_staffid IN (" . $aaAl["where"] . ") AND staffandconsumer_staff_type = '1'";
    $cdb->query($sql.";");

    $sql = "UPDATE staffandconsumer SET staffandconsumer_staffid = CASE staffandconsumer_staffid " .$taAl["when"]. " END WHERE staffandconsumer_staffid IN (" . $taAl["where"] . ") AND staffandconsumer_staff_type = '3'";
    $cdb->query($sql.";");

    //$cdb->query("commit;");
}


function talkBindUpdate($cdb,$targetClient,$ceAl,$aaAl,$taAl){

    $sql = "UPDATE talk_bind SET staff_id = CASE staff_id " .$ceAl["when"]. " END WHERE staff_id IN (" . $ceAl["where"] . ") AND staff_type = 'CE'";
    if(0<count($targetClient)){
        $sql .= " AND client_id IN (" .implode(',', $targetClient). ")";
    }
    $cdb->query($sql.";");

    $sql = "UPDATE talk_bind SET staff_id = CASE staff_id " .$aaAl["when"]. " END WHERE staff_id IN (" . $aaAl["where"] . ") AND staff_type = 'AA'";
    if(0<count($targetClient)){
        $sql .= " AND client_id IN (" .implode(',', $targetClient). ")";
    }
    $cdb->query($sql.";");

    $sql = "UPDATE talk_bind SET staff_id = CASE staff_id " .$taAl["when"]. " END WHERE staff_id IN (" . $taAl["where"] . ") AND staff_type = 'TA'";
    if(0<count($targetClient)){
        $sql .= " AND client_id IN (" .implode(',', $targetClient). ")";
    }
    $cdb->query($sql.";");

    //$cdb->query("commit;");
}

function uniqueKey(){
    list($micro, $Unixtime) = explode(" ", microtime());
    $sec = $micro + date("s", $Unixtime);
    $date = preg_replace("/\./", "", date("Ymdhi", $Unixtime).$sec);
    $uniqueId["plane"] = substr(md5($date.(string)uniqid(rand())),0,8);
    $uniqueId["md5"] = md5($uniqueId["plane"]);

    return $uniqueId;
}