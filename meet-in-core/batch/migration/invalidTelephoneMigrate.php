<?php
/**
 * Created by PhpStorm.
 * User: matsuno.masahiro
 * Date: 2016/02/19
 * Time: 17:14
 */

// DB接続
include_once dirname(__FILE__)."/setting.php";

$options = getopt("l:o:");

debugMeg("----InvalidTelephone Migration  {$options[o]}START----");

/**
 * @var unknown_type
 */
try{
// データ移行に必要なDAOを宣言
    $migrationDao = Application_CommonUtil::getInstance('dao',"MigrationDao", $destinationDb);

// トランザクションスタート
    $destinationDb->beginTransaction();

// 移行用にold_idカラムがなければ作成する
    $migrationDao->makeOldForbiddenId();

    $typeMap = array(1=>"AA",2=>"CE",3=>"TA");

    $sql = "SELECT it.*,new_id
FROM invalid_telephone AS it
INNER JOIN client AS cl ON it.client_id=cl.client_id
WHERE (
(
regist_consumer_id IS NULL
)
OR (
regist_consumer_id IS NOT NULL
AND it.del_flg =1
))
";
    if(0<count($targetClient)){
        $sql .= " AND it.client_id IN (" .implode(',', $targetClient). ") AND DATE_FORMAT(it.create_time, '%Y-%m-%d') >= '2016-04-05' ";
    }
    $sql .= "
UNION SELECT d . *,new_id
FROM project AS a
INNER JOIN consumer_status AS b ON a.project_id = b.consumer_projectid
INNER JOIN consumer AS c ON b.consumer_id = c.consumer_id
INNER JOIN invalid_telephone AS d ON b.consumer_id = d.regist_consumer_id
INNER JOIN client AS cl ON d.client_id=cl.client_id
WHERE (
a.project_del_flg =1
OR c.consumer_del_flg =1
)";
    if(0<count($targetClient)){
        $sql .= " AND d.client_id IN (" .implode(',', $targetClient). ") AND DATE_FORMAT(d.create_time, '%Y-%m-%d') >= '2016-04-05'";
    }

    $sql .= " GROUP BY d.id ";

    if(isset($options["l"])){
        $sql .= " LIMIT {$options["l"]}";
    }
    if(isset($options["o"])){
        $sql .= " OFFSET {$options["o"]}";
    }

    $stm = $currentDb->query($sql . ";");
    $invalidTelephoneList = $stm->fetchAll();

    foreach ($invalidTelephoneList as $invalidTelephone) {

        $invalidTelephoneData = array(
            "old_id" => $invalidTelephone["id"],
            "client_id" => $invalidTelephone["new_id"],
            "name" => $invalidTelephone["name"],
            "tel" => $invalidTelephone["tel"],
            "tel_only_numbers" => $invalidTelephone["number_format_tel"],
            "mail" => $invalidTelephone["mail"],
            "reason" => $invalidTelephone["reason"],
            "remarks" => $invalidTelephone["remarks"],
            "converted_name" => $invalidTelephone["keyword"],
            "appoint_flg" => $invalidTelephone["appoint_flg"],
            "invalid_flg" => $invalidTelephone["invalid_flg"],
            "regist_approach_list_id" => $invalidTelephone["regist_project_id"],
            "regist_approach_target_id" => null, // このバッチでの移行対象はnull しか入らない。
            "regist_staff_id" => $invalidTelephone["regist_staff_id"],
            "regist_staff_type" => $typeMap[$invalidTelephone["regist_staff_type"]],
            "update_staff_id" => $invalidTelephone["update_staff_id"],
            "update_staff_type" => $typeMap[$invalidTelephone["update_staff_type"]],
            "create_date" => $invalidTelephone["create_time"],
            "update_date" => $invalidTelephone["update_time"],
            "del_flg" => $invalidTelephone["del_flg"]
        );
        $migrationDao->forbiddenRegist($invalidTelephoneData);

    }
    // 登録完了したらコミットする
    $destinationDb->commit();
}
catch (Exception $err){
    $destinationDb->rollBack();
    debugMeg("想定外の例外：".$err->getMessage());
}


debugMeg("----InvalidTelephone Migration  {$options[o]}END----");

// 以下マイグレーション関数****************************************