<?php
/**
 * consumerテーブルに漢数字を数値にした値が存在しなかったので
 * カラム追加に伴う値の設定バッチ
 * @var unknown_type
 */
try{
	debugMeg("ConvertNumners_begin");
	
	error_log("[ConsumerMaster-begin][date:".date("Y-m-d H:i:s")."]");
	convertConsumerMaster();
	error_log("[ConsumerMaster-end][date:".date("Y-m-d H:i:s")."]");
	error_log("[ConsumerList-begin][date:".date("Y-m-d H:i:s")."]");
	convertConsumerList();
	error_log("[ConsumerList-end][date:".date("Y-m-d H:i:s")."]");
	error_log("[Consumer-begin][date:".date("Y-m-d H:i:s")."]");
	convertConsumer();
	error_log("[Consumer-end][date:".date("Y-m-d H:i:s")."]");
	
	debugMeg("ConvertNumners_end");
}
catch (Exception $err){
	debugMeg("想定外の例外：".$err->getMessage());
}

/**
 * デバッグメッセージ
 * @param unknown $actionName	処理名
 */
function debugMeg($actionName){
	error_log($actionName.":".date("Y-m-d H:i:s")."\n");
}

/**
 * コンシューマーマスターの漢数字を変換する
 */
function convertConsumerMaster(){
	$manager = getInstance('Manager','BatchCommon');
	
	// UPDATE文を全て実行するとメモリーが足りないので、ファイルに書き出す
	$filePath = '/var/www/html/batch/function/ConsumerMasterConvertNumners.sql';
	
	// consumer_relation_master_id毎にデータを取得するので、一意なconsumer_relation_master_idを取得する
	$relationIds = $manager->getConsumerMasterRelationId();
	foreach($relationIds as $relationId){
		$cmd = 'php ./function/ConvNumConsumerMaster.php "'.$relationId["consumer_relation_master_id"].'"';
		exec($cmd, $arr, $res);
	}
	error_log("[sqlupdate][date:".date("Y-m-d H:i:s")."]");
	$cmd = "mysql -u root -p tmo < {$filePath}";
	exec($cmd, $arr, $res);
	if ($res === 0) {
		error_log("consumer_master update OK");
	} else {
		error_log("consumer_master update NG");
	}
}

/**
 * コンシューマーリストの漢数字を変換する
 */
function convertConsumerList(){
	$manager = getInstance('Manager','BatchCommon');
	
	// UPDATE文を全て実行するとメモリーが足りないので、ファイルに書き出す
	$filePath = '/var/www/html/batch/function/ConsumerListConvertNumners.sql';
	
	// consumer_relation_master_id毎にデータを取得するので、一意なconsumer_relation_master_idを取得する
	$relationIds = $manager->getConsumerListRelationId();
	foreach($relationIds as $relationId){
		$cmd = 'php ./function/ConvNumConsumerList.php "'.$relationId["consumer_relation_master_id"].'"';
		exec($cmd, $arr, $res);
	}
	error_log("[sqlupdate][date:".date("Y-m-d H:i:s")."]");
	$cmd = "mysql -u root -p tmo < {$filePath}";
	exec($cmd, $arr, $res);
	if ($res === 0) {
		error_log("consumer_list update OK");
	} else {
		error_log("consumer_list update NG");
	}
}

/**
 * コンシューマーの漢数字を変換する
 */
function convertConsumer(){
	$manager = getInstance('Manager','BatchCommon');
	$getCount = 0;
	$offset = 1;
	$limit = 5000;		// 2000は暫定値
	$consumerCount = $manager->getAllConsumerCount();
	$consumerRowCount = 0;
	$where = "";		// 取得データを絞り込む為の条件（これによりOFFSETをなくせる）
	// UPDATE文を全て実行するとメモリーが足りないので、ファイルに書き出す
	$filePath = '/var/www/html/batch/function/ConsumerConvertNumners.sql';
	$fp = fopen($filePath, 'w');
	error_log("AllCount:".$consumerCount);
	while($getCount < $consumerCount){
		// 登録するコンシューマを取得
		$consumerList = $manager->getAllConsumerLimit(0, $limit, $where);
		$lastConsumer = end($consumerList);
		$where = " WHERE consumer_id > ".$lastConsumer["consumer_id"]." ";
		foreach($consumerList as $consumer){
			// 漢数字変換を行う
			$employeeCountCorrect = convKanjiToArabic($consumer['employee_count']);
			$ordinaryIncomeCorrect = convKanjiToArabic($consumer['ordinary_income']);
			$salesVolumeCorrect = convKanjiToArabic($consumer['sales_volume']);
			$capitalStockCorrect = convKanjiToArabic($consumer['capital_stock']);
			// データ更新を行う
			$sql = "UPDATE consumer SET employee_count_correct='{$employeeCountCorrect}', ordinary_income_correct='{$ordinaryIncomeCorrect}', sales_volume_correct='{$salesVolumeCorrect}', capital_stock_correct='{$capitalStockCorrect}' WHERE consumer_id={$consumer["consumer_id"]};";
			fwrite($fp, $sql);
			$consumerRowCount++;
		}
		unset($consumerList);
		$getCount = $offset * $limit;
		$offset++;
		usleep(100);
		error_log("[CompleteCount:".$getCount."][date:".date("Y-m-d H:i:s")."]");
	}
	fclose($fp);
	error_log("CompleteAllCount:".$consumerRowCount);
	
	error_log("[sqlupdate][date:".date("Y-m-d H:i:s")."]");
	$cmd = "mysql -u root -p tmo < {$filePath}";
	exec($cmd, $arr, $res);
	if ($res === 0) {
		error_log("consumer update OK");
	} else {
		error_log("consumer update NG");
	}
}



/**
 * 漢数字を数値に変換する
 * @param string $kanji 漢数字
 * @param int $mode 出力書式／1=3桁カンマ区切り，2=漢字混じり, それ以外=ベタ打ち
 * @return double 数値
 */
function convKanjiToArabic($data) {
	$result = 0;

	// 変換対象以外の文字が存在するかチェックする
	$convFlg = true;
	$ll = mb_strlen($data);
	for ($pos = $ll - 1; $pos >= 0; $pos--) {
		$c = mb_substr($data, $pos, 1);
		if(!preg_match('/[十百千万億兆京壱弐参人名円 　,一二三四五六七八九〇０-９0-9]/u', $c)){
			$convFlg = false;
			break;
		}
	}
	
	// 全て変換対象の場合のみ、変換処理を実施する
	if($convFlg){
		//全角＝半角対応表
		$kan_num = array(
				'０' => 0, '〇' => 0,
				'１' => 1, '一' => 1, '壱' => 1,
				'２' => 2, '二' => 2, '弐' => 2,
				'３' => 3, '三' => 3, '参' => 3,
				'４' => 4, '四' => 4,
				'５' => 5, '五' => 5,
				'６' => 6, '六' => 6,
				'７' => 7, '七' => 7,
				'８' => 8, '八' => 8,
				'９' => 9, '九' => 9
		);
		//位取り
		$kan_deci_sub = array('十' => 10, '百' => 100, '千' => 1000);
		$kan_deci = array('万' => 10000, '億' => 100000000, '兆' => 1000000000000, '京' => 10000000000000000);

		//右側から解釈していく
		$ll = mb_strlen($data);
		$a = '';
		$deci = 1;
		$deci_sub = 1;
		$m = 0;
		$n = 0;
		for ($pos = $ll - 1; $pos >= 0; $pos--) {
			$c = mb_substr($data, $pos, 1);
			if (isset($kan_num[$c])) {
				$a = $kan_num[$c] . $a;
			} else if (isset($kan_deci_sub[$c])) {
				if ($a != '')   $m = $m + $a * $deci_sub;
				else if ($deci_sub != 1) $m = $m + $deci_sub;
				$a = '';
				$deci_sub = $kan_deci_sub[$c];
			} else if (isset($kan_deci[$c])) {
				if ($a != '')   $m = $m + $a * $deci_sub;
				else if ($deci_sub != 1) $m = $m + $deci_sub;
				$n = $m * $deci + $n;
				$m = 0;
				$a = '';
				$deci_sub = 1;
				$deci = $kan_deci[$c];
			}elseif(is_numeric($c)){
				$a = $c . $a;
			}
		}

		$ss = '';
		if (preg_match("/^(0+)/", $a, $regs) != FALSE) $ss = $regs[1];
		if ($a != '')   $m = $m + $a * $deci_sub;
		else if ($deci_sub != 1) $m = $m + $deci_sub;
		$n = $m * $deci + $n;
		$result = $n;
	}
	if(!is_numeric($result)){
		$result = 0;
	}
	return $result;
}