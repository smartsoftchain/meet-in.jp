<?php
/**
 * consumerテーブルに漢数字を数値にした値が存在しなかったので
 * カラム追加に伴う値の設定バッチ
 * @var unknown_type
 */
try{
	//debugMeg("ConvNumConsumerList_begin");
	
	// UPDATE文を全て実行するとメモリーが足りないので、ファイルに書き出す
	$filePath = '/var/www/html/batch/function/ConsumerListConvertNumners.sql';
	// ファイルの存在確認
	if( !file_exists($filePath) ){
		// ファイル作成
		touch( $filePath );
	}
	
	$fp = fopen($filePath, 'a');
	
	$relationId = $argv[1];
	//error_log("[consumer_relation_master_id:".$relationId."][date:".date("Y-m-d H:i:s")."]");
	$consumerList = getConsumerListByRelationId($relationId);
	//error_log("[ConsumerListCount:".count($consumerList)."][date:".date("Y-m-d H:i:s")."]");
	$consumerRowCount = 0;
	foreach($consumerList as $consumer){
// 		error_log($consumer['id']);
// 		error_log($consumer['employee_count']);
// 		error_log($consumer['employee_count_correct']);
// 		error_log($consumer['ordinary_income']);
// 		error_log($consumer['ordinary_income_correct']);
// 		error_log($consumer['sales_volume']);
// 		error_log($consumer['sales_volume_correct']);
// 		error_log($consumer['capital_stock']);
// 		error_log($consumer['capital_stock_correct']);
// 		error_log("=============================");
		// 漢数字変換を行う
		$employeeCountCorrect = convKanjiToArabic($consumer['employee_count']);
		$ordinaryIncomeCorrect = convKanjiToArabic($consumer['ordinary_income']);
		$salesVolumeCorrect = convKanjiToArabic($consumer['sales_volume']);
		$capitalStockCorrect = convKanjiToArabic($consumer['capital_stock']);
	
		// 数値変換出来たかつ、登録値と違う値の場合のみ更新する
		$sqlParts = array();
		if($employeeCountCorrect != "0" && $employeeCountCorrect != $consumer['employee_count_correct']){
			$sqlParts[] = " employee_count_correct='{$employeeCountCorrect}' ";
		}
		if($ordinaryIncomeCorrect != "0" && $ordinaryIncomeCorrect != $consumer['ordinary_income_correct']){
			$sqlParts[] = " ordinary_income_correct='{$ordinaryIncomeCorrect}' ";
		}
		if($salesVolumeCorrect != "0" && $salesVolumeCorrect != $consumer['sales_volume_correct']){
			$sqlParts[] = " sales_volume_correct='{$salesVolumeCorrect}' ";
		}
		if($capitalStockCorrect != "0" && $capitalStockCorrect != $consumer['capital_stock_correct']){
			$sqlParts[] = " capital_stock_correct='{$capitalStockCorrect}' ";
		}
		if(count($sqlParts) > 0){
			// データ更新を行う
			$strSqlParts = join(",", $sqlParts);
			$sql = "UPDATE consumer_list SET {$strSqlParts} WHERE id={$consumer["id"]};";
			fwrite($fp, $sql);
			// 更新対象のカウント
			$consumerRowCount++;
		}
		unset($consumerList);
	}
	fclose($fp);
	//error_log("[UpdateConsumerListCount:".$consumerRowCount."][date:".date("Y-m-d H:i:s")."]");
	debugMeg("ConvNumConsumerList_end");
}
catch (Exception $err){
	debugMeg("想定外の例外：".$err->getMessage());
}

/**
 * デバッグメッセージ
 * @param unknown $actionName	処理名
 */
function debugMeg($actionName){
	error_log($actionName.":".date("Y-m-d H:i:s"));
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

/**
 * 全コンシューマーマスターを取得する
 */
function getConsumerListByRelationId($relationId) {
	// DBのインスタンス作成
	$dsn  = 'mysql:dbname=tmo;host=localhost;';
	$user = "root";
	$password = "90kon6Fmysql";
	$db = new PDO($dsn, $user, $password);
	
	$sql = "
		SELECT
			id,
			employee_count,
			employee_count_correct,
			ordinary_income,
			ordinary_income_correct, 
			sales_volume,
			sales_volume_correct,
			capital_stock,
			capital_stock_correct 
		FROM
			consumer_list
		WHERE
			consumer_relation_master_id = {$relationId} AND
			(
				(employee_count IS NOT NULL AND employee_count <> '') OR
				(ordinary_income IS NOT NULL AND ordinary_income <> '') OR
				(sales_volume IS NOT NULL AND sales_volume <> '') OR
				(capital_stock IS NOT NULL AND capital_stock <> '')
			)
		ORDER BY id;
	";
	$stm = $db->query($sql);
	$list = $stm->fetchAll();
	return $list;
}