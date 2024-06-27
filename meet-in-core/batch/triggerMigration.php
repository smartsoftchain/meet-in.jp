<?php


// 実行マイグレーションファイルの有るフォルダ階層;
$targetFolder = "./migration";
include_once $targetFolder . "/setting.php";
$limit = 10000;

// 実行するマイグレーションファイル名の一覧　拡張子なし
$targetFiles = array(
	"clientServiceMigrate",
	"appointTemplateMigrate",
	//"clientMigrate",					// 確認
	//"clientAndCcMigrate",				// 日付取れない
	"clientDownloadOptionMigrate",
	"clientStaffMigrate",
	"reportSettingMigrate",
	"resultTemplateMigrate",
	"sendMethodTemplateMigrate",
	"sendTemplateMigrate",
	"talkBindMigrate",
	//"tmpOptionMigrate",				// 移行の必要が無い
	"invalidTelephoneMigrate",
);

// truncateするテーブル
$truncateTables = array(
	"forbidden_approach",
	"free_label",
	"call_log",
	"template_result_memo",
	"talk_parent",
	"talk_answer",
	"talk_script",
	"template_appoint_situation",
	"talk_bind",
	"tmp_option",
	"template_send_situation",
	"master_staff",
	"template_send_method",
	"master_client",
	"master_client_cc",
	"master_client_service",
	"master_client_download_option",
	"report_setting_relation",
	"master_split_name",
	"report_setting",
	"template_approach_result",
	"leadtab_and_result_relation",
	"template_send_method",
	"template_send_situation",
);
// dropする連番テーブル
$dropTables = array(
	"client_db_company_",
	"client_db_approach_target_",
	"client_db_company_history_",
	"client_db_approach_target_history_",
	"tree_action_",
	"tree_action_clientdb_",
);

echo "-*-*-*-*-*-*- start time:" . date("Y-m-d H:i:s") . " -*-*-*-*-*-*-\n";
//
//$newDb = getNewDbObject();// TODO 開発用　本番時は消す
//	truncateTable($newDb, $truncateTables);;// TODO 開発用　本番時は消す
//	dropTable($newDb, $dropTables, 699);;// TODO 開発用　本番時は消す

// 事前に既存TMOのスタッフデータをコンバートする。
// **********スクリプトの都合上決して複数回流してはいけない*************
	system("php ./migration/staffConvert.php");
	system("php ./migration/clientConvert.php");



echo "-*-*-*-*-*-*- lap time:" . date("Y-m-d H:i:s") . " -*-*-*-*-*-*-\n";

foreach($targetFiles as $targetFile){
	echo "-*-*-*-*-*-*- lap time:" . date("Y-m-d H:i:s") . " -*-*-*-*-*-*-\n";

	// メモリオーバーするものは分割実行
	if($targetFile == "callLogMigrate"){
		$sql = "SELECT DISTINCT webphone_id FROM call_log;";
		$stm = $currentDb->query($sql);
		$webPhoneIdList = $stm->fetchAll();
		$count = count($webPhoneIdList);
		$i =0;
		foreach($webPhoneIdList as $webPhoneId){
			++$i;
			debugMeg("{$webPhoneId[webphone_id]} {$i}/{$count}");
			system("php {$targetFolder}/{$targetFile}.php -i {$webPhoneId[webphone_id]}");
		}
	}
	else if($targetFile == "invalidTelephoneMigrate"){
		$sql = "SELECT
	COUNT(*)
FROM (
	SELECT id FROM invalid_telephone  WHERE ((regist_consumer_id IS NULL) OR (regist_consumer_id IS NOT NULL AND del_flg = 1 ))
";
		if(0<count($targetClient)){
			$sql .= " AND client_id IN (" .implode(',', $targetClient). ") ";
		}

		$sql .= "	UNION
	SELECT
		d.id as id
	FROM
		project as a
	INNER JOIN
		consumer_status as b
	ON
		a.project_id = b.consumer_projectid
	INNER JOIN
		consumer as c
	ON
		b.consumer_id = c.consumer_id
	INNER JOIN
		invalid_telephone as d
	ON
		b.consumer_id = d.regist_consumer_id
	WHERE
		(a.project_del_flg = 1 OR c.consumer_del_flg = 1)
	GROUP BY
		d.id
) as count ";

		$stm = $currentDb->query($sql . ";");
		$count = $stm->fetchAll(PDO::FETCH_COLUMN)[0];
		for($i=0; $i<$count; $i += $limit){
			debugMeg("{$i}/{$count}");
			system("php {$targetFolder}/{$targetFile}.php -l {$limit} -o {$i}");
		}
	}else{
		// 通常のものはそのまま実行
		system("php {$targetFolder}/{$targetFile}.php");
	}
}

echo "-*-*-*-*-*-*- easyMigrate time  :" . date("Y-m-d H:i:s") . " -*-*-*-*-*-*-\n";

//// 以下のバッチ呼び出し箇所 クライアントIDとって回しながら呼ぶ
$sql = "SELECT	client_id,client_name,new_id FROM	client;";
$stm = $currentDb->query($sql);
$clientList = $stm->fetchAll();
foreach($clientList as $client) {
	if(!in_array($client["client_id"], $targetClient)){
		continue;
	}
	gc_collect_cycles();
	debugMeg("-------{$client["client_id"]}----");

	error_log("nohup php ./function/DataMigration.php {$client["client_id"]} {$client["new_id"]} \"{$client["client_name"]}\" > /var/tmp/migrate_{$client["client_id"]} &");
}

system("php {$targetFolder}/SCP_SCRIPT.php");

debugMeg("-------". memory_get_peak_usage() ."----");

echo "-*-*-*-*-*-*- end time  :" . date("Y-m-d H:i:s") . " -*-*-*-*-*-*-\n";
