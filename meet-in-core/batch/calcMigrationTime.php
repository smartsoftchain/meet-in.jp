
<?php


// 実行マイグレーションファイルの有るフォルダ階層;
$targetFolder = "./migration";
include_once $targetFolder . "/setting.php";

echo "-*-*-*-*-*-*- start time:" . date("Y-m-d H:i:s") . " -*-*-*-*-*-*-\n";
$result = array();
$time=0;

// 分数/2000件　2000件あたりの処理速度
$complement = 5/2000;

// コンシューマー数
$sql = "SELECT `client_id` ,COUNT(id) AS counter
FROM  `consumer_list`
WHERE   `del_flg` =0
GROUP BY `client_id`;";
$stm = $currentDb->query($sql);
$consumerCount = $stm->fetchAll();
foreach ($consumerCount as $count) {
	$result[$count["client_id"]] = $count["counter"];
}

// リザルト数
$sql = "SELECT  `result_clientid` , COUNT(  `result_id` ) AS counter
FROM  `result`
WHERE `result_del_flg` =0
GROUP BY  `result_clientid`;";
$stm = $currentDb->query($sql);
$resultCount = $stm->fetchAll();
foreach ($resultCount as $count) {
	if(empty($result[$count["result_clientid"]])){// リザルトしか無いのはありえないが一応対処
		$result[$count["result_clientid"]] = $count["counter"];
	}else{
		$result[$count["result_clientid"]] += $count["counter"];
	}
}

foreach ($result as $key => $counter) {
if(!in_array($key,$targetClient)){continue;}
	error_log($key . "\t" .  round($counter * $complement,2) . "minute");
	$time += $counter * $complement;
}

error_log("[[[[[ Estimation " . $time . " minute ]]]]]]");


echo "-*-*-*-*-*-*- end time  :" . date("Y-m-d H:i:s") . " -*-*-*-*-*-*-\n";
