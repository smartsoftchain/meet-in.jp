<?php
require_once 'CommonMigration.php';		// DBの接続や共通関数をまとめたファイル
/**
 * クライアントIDを指定し最低限のデータ移行を行う
 * @var unknown_type
 */
try{
	debugMeg("DataMigration_begin");
	
	ini_set('mysql.connect_timeout', 7200);
	ini_set('default_socket_timeout', 7200);
	
	// DAO読み込み時のエラー回避のため、空のarrayをセットする
	Zend_Registry::set('user', array());
	
	// 現行TMOのDBオブジェクトを宣言
	// DBのインスタンス作成
	$currentDb = getCurrentDbObject();
	
	// 新TMOのDBオブジェクトを宣言
	$newDb = getNewDbObject();
	
	// データ移行に必要なDAOを宣言
	$masterSplitNameDao = Application_CommonUtil::getInstance('dao',"MasterSplitNameDao", $newDb);
	// 企業名から削除する文字列を取得する
	$splitPatterns = array();
	foreach($masterSplitNameDao->getSplitNameList() as $splitName){
		$splitPatterns[] = "/".preg_quote($splitName['name'])."/";
	}
	
	// トランザクションスタート
	$newDb->beginTransaction();
	try{
		// データ移行を行うクライアントIDを設定
		$currentClientId = $argv[1];
		$newClientId = $argv[2];
		$clientName = $argv[3];
		
// 		$currentClientId = "3";
// 		$newClientId = "3";
// 		$clientName = "システムセンス株式会社";
		
		// データ移行用のテンポラリーテーブルを作成する
		dropConsumerMigrationTables($newDb, $newClientId);
		dropResultMigrationTables($newDb, $newClientId);
		createResultMigrationTables($newDb, $newClientId);
		
		// 移行に必要な情報をセッションに追加
		Zend_Registry::set('user', array("staff_type"=>"AA", "staff_id"=>"1", "client_id"=>$newClientId));
		
		// デフォルトのアプローチリストとフォルダを作成し、紐付けも行う
		//$approachListId = createApproachList($newClientId, $clientName, $newDb);
		
		// アプローチ先を移行する(consumer_list) TODO projectMigrationでコンシューマーの移行を行うので、こちらの処理は削除
		//consumerRelationMasterMigration($currentClientId, $newClientId, $approachListId, $splitPatterns, $currentDb, $newDb);
		
		// プロジェクトとプロジェクトに紐づくデータを移行する
		$newDb->commit();
		$newDb->beginTransaction();
		try{
			projectMigration($currentClientId, $newClientId, $splitPatterns, $approachListId, $currentDb, $newDb);
			
			// テンポラリーテーブルの削除
			dropResultMigrationTables($newDb, $newClientId);
			// 登録完了したらコミットする
			$newDb->commit();
		}catch(Exception $e){
			$newDb->rollBack();
			//throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
			// ここでthrowするとrollBackが２度発生し、エラーになってしまうので処理を止める
			debugMeg("projectMigration若しくはdropResultMigrationTables：".$e->getMessage());
			exit;
		}
	}catch(Exception $e){
		$newDb->rollBack();
		throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
	}
		
	debugMeg("DataMigration_end");
}
catch (Exception $err){
	debugMeg("想定外の例外：".$err->getMessage());
}


function createConsumerMigrationTables($db, $newClientId){
	$sql = "
			CREATE TABLE IF NOT EXISTS `migration_consumer_company_id_{$newClientId}` (
				`id` int(11) NOT NULL COMMENT '重複チェック用ID',
				PRIMARY KEY (`id`)
			) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;
			CREATE TABLE IF NOT EXISTS `migration_consumer_approach_target_id_{$newClientId}` (
				`id` int(11) NOT NULL COMMENT '重複チェック用ID',
				PRIMARY KEY (`id`)
			) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;
			CREATE TABLE IF NOT EXISTS `migration_consumer_tree_approach_target_id_{$newClientId}` (
				`id` int(11) NOT NULL COMMENT '重複チェック用ID',
				PRIMARY KEY (`id`)
			) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;
			";
	$db->query($sql);
}

function dropConsumerMigrationTables($db, $newClientId){
	$sql = "
			DROP TABLE IF EXISTS `migration_consumer_company_id_{$newClientId}`;
			DROP TABLE IF EXISTS `migration_consumer_approach_target_id_{$newClientId}`;
			DROP TABLE IF EXISTS `migration_consumer_tree_approach_target_id_{$newClientId}`;
			";
	$db->query($sql);
}

/**
 * 架電結果移行用のテンポラリーテーブル
 */
function createResultMigrationTables($db, $newClientId){
	$sql = "
			CREATE TABLE IF NOT EXISTS `migration_result_company_id_{$newClientId}` (
				`id` int(11) NOT NULL COMMENT '重複チェック用ID',
				PRIMARY KEY (`id`)
			) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;
			
			CREATE TABLE IF NOT EXISTS `migration_result_approach_target_id_{$newClientId}` (
				`id` int(11) NOT NULL COMMENT '重複チェック用ID',
				PRIMARY KEY (`id`)
			) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;
			
			CREATE TABLE IF NOT EXISTS `migration_result_tree_approach_target_id_{$newClientId}` (
				`id` int(11) NOT NULL COMMENT '重複チェック用ID',
				PRIMARY KEY (`id`)
			) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;
			
			CREATE TABLE IF NOT EXISTS `migration_result_consumer_id_{$newClientId}` (
				`id` decimal(32,0) NOT NULL COMMENT '重複チェック用ID',
				PRIMARY KEY (`id`)
			) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;
			
			CREATE TABLE IF NOT EXISTS `migration_result_send_id_{$newClientId}` (
				`id` decimal(32,0) NOT NULL COMMENT '重複チェック用ID',
				PRIMARY KEY (`id`)
			) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;
			
			CREATE TABLE IF NOT EXISTS `migration_result_appoint_id_{$newClientId}` (
				`id` decimal(32,0) NOT NULL COMMENT '重複チェック用ID',
				PRIMARY KEY (`id`)
			) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;
			
			CREATE TABLE IF NOT EXISTS `migration_convert_id_{$newClientId}` (
				`consumer_id` decimal(32,0) NOT NULL COMMENT 'コンシューマーID',
				`approach_target_id` int(11) NOT NULL COMMENT 'アプローチターゲットID',
				PRIMARY KEY (`consumer_id`, `approach_target_id`)
			) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;
			
			";
	$db->query($sql);
}

/**
 * 架電結果移行用のテンポラリーテーブル
 */
function dropResultMigrationTables($db, $newClientId){
	$sql = "
			DROP TABLE IF EXISTS `migration_result_company_id_{$newClientId}`;
			DROP TABLE IF EXISTS `migration_result_approach_target_id_{$newClientId}`;
			DROP TABLE IF EXISTS `migration_result_tree_approach_target_id_{$newClientId}`;
			DROP TABLE IF EXISTS `migration_result_consumer_id_{$newClientId}`;
			DROP TABLE IF EXISTS `migration_result_send_id_{$newClientId}`;
			DROP TABLE IF EXISTS `migration_result_appoint_id_{$newClientId}`;
			DROP TABLE IF EXISTS `migration_convert_id_{$newClientId}`;
			";
	$db->query($sql);
}

/**
 * 全ての企業を紐付ける為に、アプローチリストを１件作成する
 * @param unknown $clientId
 * @param unknown $newDb
 */
function createApproachList($newClientId, $clientName, $newDb){
	// DAO宣言
	$approachListDao = Application_CommonUtil::getInstance("dao", "ApproachListDao", $newDb);
	$folderAndApproachlistRelationDao = Application_CommonUtil::getInstance("dao", "FolderAndApproachlistRelationDao", $newDb);

	// アプローチリストの登録
	$approachListDict = array(
			"client_id"					=> $newClientId,
			"name"						=> "デフォルトアプローチリスト",
			"stime"						=> date("Y-m-d H:i:s"),
			"etime"						=> new Zend_Db_Expr('null'),
			"clientname"				=> $clientName,
			"del_flg"					=> "0",
			"comment"					=> "",
			"call_division_name1"		=> "",
			"call_division_name2"		=> "",
			"call_division_name3"		=> "",
			"appoint_flg"				=> "1",
			"client_service_id"			=> "0",
			'staff_type' 				=> "AA",
			'staff_id' 					=> "1",
			'update_date' 				=> new Zend_Db_Expr('now()'),
	);
	$approachListId = $approachListDao->regist($approachListDict);

	// アプローチリストを未分類フォルダに紐付ける
	$folderAndApproachlistRelation = array();
	$folderAndApproachlistRelation["client_id"] = $newClientId;
	$folderAndApproachlistRelation["folder_id"] = "0";
	$folderAndApproachlistRelation["approach_list_id"] = $approachListId;
	$folderAndApproachlistRelation["staff_type"] = "AA";
	$folderAndApproachlistRelation["staff_id"] = "1";
	$folderAndApproachlistRelationDao->regist($folderAndApproachlistRelation);

	return $approachListId;
}

/**
 * コンシューマーリレーションを移行する
 * @param unknown $currentDb
 * @param unknown $newDb
 */
function consumerRelationMasterMigration($currentClientId, $newClientId, $approachListId, $splitPatterns, $currentDb, $newDb){
	// 基本情報登録用のDAOを宣言
	$clientDbRelationDao = Application_CommonUtil::getInstance('dao', "ClientDbRelationDao", $newDb);
	createConsumerMigrationTables($newDb, $newClientId);
	// 現行の連携用のID(consumer_relation_master_id)を一意に取得する（まず自社登録データの移行）
	$sql = "
				SELECT 
					a.consumer_relation_master_id as id, 
					a.regist_id, 
					a.regist_type 
				FROM 
					consumer_list as a 
				INNER JOIN 
					consumer_relation_master as b 
				ON 
					a.consumer_relation_master_id = b.id
				WHERE 
					a.client_id = {$currentClientId} AND 
					a.invalid_flg = 0 AND 
					(a.consumer_master_id IS NULL OR a.consumer_master_id = 0) AND 
					a.del_flg = 0 AND 
					b.del_flg = 0 
				GROUP BY 
					a.consumer_relation_master_id;
				;";
	$stm = $currentDb->query($sql);
	$consumerRelationMasterIds = $stm->fetchAll();
	$consumerRelationMasterCount = 1;
	foreach($consumerRelationMasterIds as $consumerRelationMasterId){
		error_log("自社データ:".$consumerRelationMasterId["id"]);
		// 基本情報を取得する
		$sql = "SELECT * FROM consumer_relation_master WHERE id = {$consumerRelationMasterId["id"]}";
		$stm = $currentDb->query($sql);
		if(!$stm){
			error_log("msg:stm none object new CurrentDbObject ");
			$currentDb = getCurrentDbObject();
			$stm = $currentDb->query($sql);
		}
		$consumerRelationMaster = $stm->fetch();
		// 基本情報（client_db_relation）を登録する（自社投入の場合はリスト取得先等は必ず一つ）
		$clientDbRelationDict = array();
		$clientDbRelationDict["client_id"] = $newClientId;
		$clientDbRelationDict["file_name"] = $consumerRelationMaster["file_name"];
		$clientDbRelationDict["acquisition_source"] = $consumerRelationMaster["acquisition_source"];
		$clientDbRelationDict["acquisition_date"] = $consumerRelationMaster["acquisition_date"];
		if($consumerRelationMasterId["regist_type"] == "1"){
			$clientDbRelationDict["create_staff_type"] = "AA";
		}else{
			$clientDbRelationDict["create_staff_type"] = "CE";
		}
		$clientDbRelationDict["create_staff_id"] = $consumerRelationMasterId["regist_id"];
		$clientDbRelationDict["del_flg"] = "0";
		$clientDbRelationId = $clientDbRelationDao->regist($clientDbRelationDict);
		// consumer_relation_master_idに紐付くconsumer_listを移行する
		consumerListMigration($currentClientId, $newClientId, $approachListId, $consumerRelationMasterId["id"], $clientDbRelationId, $splitPatterns, $currentDb, $newDb);
		error_log("consumerRelationMasterCount:{$consumerRelationMasterCount}");
		$consumerRelationMasterCount++;
	}
	dropConsumerMigrationTables($newDb, $newClientId);
	createConsumerMigrationTables($newDb, $newClientId);
	// 現行の連携用のID(consumer_relation_master_id)を一意に取得する（TMOマスターダウンロード登録データの移行）
	$sql = "
				SELECT 
					a.consumer_relation_master_id as id, 
					a.regist_id, 
					a.regist_type 
				FROM 
					consumer_list as a 
				INNER JOIN 
					consumer_relation_master as b 
				ON 
					a.consumer_relation_master_id = b.id
				WHERE 
					a.client_id = {$currentClientId} AND 
					a.invalid_flg = 0 AND 
					(consumer_master_id IS NOT NULL AND consumer_master_id <> 0) AND 
					a.del_flg = 0 AND 
					b.del_flg = 0 
				GROUP BY 
					a.consumer_relation_master_id;";
	$stm = $currentDb->query($sql);
	$consumerRelationMasterIds = $stm->fetchAll();
	foreach($consumerRelationMasterIds as $consumerRelationMasterId){
		error_log("ダウンロードデータ:".$consumerRelationMasterId["id"]);
		// 基本情報を取得する
		$sql = "SELECT * FROM consumer_relation_master WHERE id = {$consumerRelationMasterId["id"]}";
		$stm = $currentDb->query($sql);
		if(!$stm){
			error_log("msg:stm none object new CurrentDbObject ");
			$currentDb = getCurrentDbObject();
			$stm = $currentDb->query($sql);
		}
		$consumerRelationMaster = $stm->fetch($sql);
		// 基本情報（client_db_relation）を登録する（TMOダウンロードの場合は固定）
		$clientDbRelationDict = array();
		$clientDbRelationDict["client_id"] = $newClientId;
		$clientDbRelationDict["file_name"] = "Sales Cloudから取得データ";
		$clientDbRelationDict["acquisition_source"] = "Sales Cloud";
		$clientDbRelationDict["acquisition_date"] = $consumerRelationMaster["acquisition_date"];
		if($consumerRelationMasterId["regist_type"] == "1"){
			$clientDbRelationDict["create_staff_type"] = "AA";
		}else{
			$clientDbRelationDict["create_staff_type"] = "CE";
		}
		$clientDbRelationDict["create_staff_id"] = $consumerRelationMasterId["regist_id"];
		$clientDbRelationDict["del_flg"] = "0";
		$clientDbRelationId = $clientDbRelationDao->regist($clientDbRelationDict);
		// consumer_relation_master_idに紐付くconsumer_listを移行する
		consumerListMigration($currentClientId, $newClientId, $approachListId, $consumerRelationMasterId["id"], $clientDbRelationId, $splitPatterns, $currentDb, $newDb);
	}
	dropConsumerMigrationTables($newDb, $newClientId);
}

/**
 * コンシューマーリストを移行する
 * @param unknown $consumerRelationMasterId
 */
function consumerListMigration($currentClientId, $newClientId, $approachListId, $consumerRelationMasterId, $clientDbRelationId, $splitPatterns, $currentDb, $newDb){
	// ファイルを作成する
	initFileObject($newClientId);
	
	// データ件数が多い事を考慮し、データ取得・移行を分割しながら行う
	$getCount = 0;
	$page = 1;
	$limit = 4000;
	
	// consumer_listの総件数を取得する
	$sql = "SELECT count(id) as count FROM consumer_list WHERE client_id = {$currentClientId} AND consumer_relation_master_id = {$consumerRelationMasterId} AND invalid_flg = 0 AND del_flg = 0;";
	$stm = $currentDb->query($sql);
	$consumerListCount = $stm->fetch();
	// 全データ取得し終わるまでループしながらconsumer_listを移行する
	debugMeg("consumer_list:begin[{$consumerListCount['count']}]");
	$count = 0;
	while($getCount < $consumerListCount["count"]){
		// データのオフセット計算
		$offset = getOffset($page, $limit);
		
		// 別ファイル（プロセス）にすることで、メモリー消費を抑える
		$resultJson = exec("php function/ConsumerListMigration.php {$currentClientId} {$newClientId} {$consumerRelationMasterId} {$clientDbRelationId} {$approachListId} {$limit} {$offset}", $out, $ret);
		$result = json_decode($resultJson, true);	// 元々戻り値を貰っていたが、現在は未使用
		
		// 次回の現在のデータ移行件数計算
		$getCount = $page * $limit;
		$page++;
		//  MySQL server has gone away対策として負荷の少ないクエリを５ループに１回発行させる
		$count++;
		if($count == 5){
			$sql = "SELECT id FROM dummy_table;";
			$newDb->fetchRow($sql);
			$count = 0;
		}
	}
	
	// 行の最後にコミットを追加する。
	$fp = createFileObject($newClientId);
	fwrite($fp, "commit;");
	// ファイルを閉じる
	fclose($fp);
	// コマンド実行でファイル登録
	$rtn = execFileInsertQuery($newClientId);
	if($rtn["return"] == 1){
		error_log("NG");
		exit;
	}else{
		// ファイルを削除する
		removeQueryFile($newClientId);
	}
	
	debugMeg("consumer_list:end[{$consumerListCount['count']}]");
}

/**
 * プロジェクト毎に架電結果を移行する
 * @param unknown $currentClientId
 * @param unknown $newClientId
 * @param unknown $splitPatterns
 * @param unknown $approachListId
 * @param unknown $currentDb
 * @param unknown $newDb
 */
function projectMigration($currentClientId, $newClientId, $splitPatterns, $approachListId, $currentDb, $newDb){
	// クライアントIDを指定しプロジェクトを全件取得する
	//$sql = "SELECT project_id, project_name FROM project WHERE project_clientid = {$currentClientId} AND project_del_flg = 0;";
	// 差分移行の起点となる日付
	$migrationDate = "2016-04-05";
	$sql = "
			SELECT 
				b.project_id as project_id, 
				b.project_name as project_name 
			FROM 
				`result` as a 
			INNER JOIN 
				project as b 
			ON 
				a.result_projectid = b.project_id 
			WHERE 
				a.result_clientid = {$currentClientId} AND 
				b.project_clientid = {$currentClientId} AND 
				DATE_FORMAT(a.result_time, '%Y-%m-%d') >= '{$migrationDate}' AND 
				a.result_del_flg = 0 AND 
				b.project_del_flg = 0 
			GROUP BY 
				b.project_id;
			";
	$stm = $currentDb->query($sql);
	if(!$stm){
		error_log("msg:stm none object new CurrentDbObject ");
		$currentDb = getCurrentDbObject();
		$stm = $currentDb->query($sql);
	}
	$projects = $stm->fetchAll();
	foreach($projects as $project){
		// プロジェクトとプロジェクト設定に関連する情報を移行し、approachListIdを取得する
		$approachListId = exec("php function/ProjectMigration.php {$currentClientId} {$newClientId} {$project["project_id"]}", $out, $ret);
		// プロジェクトに紐付くコンシューマーを元に架電結果を移行する
		consumerAndResultMigration($currentClientId, $newClientId, $splitPatterns, $approachListId, $project, $currentDb, $newDb);
		debugMeg("Migration Complete[project_id:{$project["project_id"]}][approachList_id:{$approachListId}]");
	}
	// 全てのプロジェクトに紐付くコンシューマーと架電結果移行後に、コンシューマーと架電禁止の紐づきを移行する
	foreach($projects as $project){
		restrictionConsumerMigration($currentClientId, $newClientId, $project, $currentDb);
	}
}

/**
 * プロジェクトに紐付くコンシューマーと架電結果を移行する
 * 架電結果移行時に、架電結果を元に作成された架電禁止を移行する
 * @param unknown $currentClientId
 * @param unknown $newClientId
 * @param unknown $splitPatterns
 * @param unknown $approachListId
 * @param unknown $project
 * @param unknown $currentDb
 * @param unknown $newDb
 */
function consumerAndResultMigration($currentClientId, $newClientId, $splitPatterns, $approachListId, $project, $currentDb, $newDb){
	// ファイルを作成する
	initFileObject($newClientId);
	
	// アプローチ画面でデータを取得する為にデフォルトのclientDbRelationを作成し、紐付ける
	$clientDbRelationDao = Application_CommonUtil::getInstance('dao', "ClientDbRelationDao", $newDb);
	$clientDbRelationDict = array();
	$clientDbRelationDict["client_id"] = $newClientId;
	$clientDbRelationDict["file_name"] = "{$project["project_name"]}プロジェクトからデータ移行";
	$clientDbRelationDict["acquisition_source"] = "TMOからデータ移行";
	$clientDbRelationDict["acquisition_date"] = date("Y-m-d");
	$clientDbRelationDict["create_staff_type"] = new Zend_Db_Expr('NULL');
	$clientDbRelationDict["create_staff_id"] = new Zend_Db_Expr('NULL');
	$clientDbRelationDict["del_flg"] = "0";
	try{
		$clientDbRelationId = $clientDbRelationDao->regist($clientDbRelationDict);
	}catch (Exception $e){
		error_log(json_encode($clientDbRelationDict));
		exit;
	}
	
	// データ件数が多い事を考慮し、データ取得・移行を分割しながら行う
	$getCount = 0;
	$page = 1;
	$limit = 2000;
	
	// project_idに紐付く架電結果の総件数を取得する
	$sql = getConsumerCountSql($project["project_id"]);
	$stm = $currentDb->query($sql);
	$consumerCount = $stm->fetch();
	// 全データ取得し終わるまでループしながらconsumer_listを移行する
	debugMeg("consumer:bigin[{$consumerCount["count"]}]");
	while($getCount < $consumerCount["count"]){
		$offset = getOffset($page, $limit);
		debugMeg("result:offset[{$offset}]");
		exec("php function/ResultMigration.php {$currentClientId} {$newClientId} {$approachListId} {$clientDbRelationId} {$project["project_id"]} {$limit} {$offset}", $out, $ret);
		if($ret == "127"){
			$outputJson = json_encode($out);
			debugMeg("out:[{$outputJson}]");
			debugMeg("ret:[{$ret}]");
		}
		$getCount = $page * $limit;
		$page++;
	}
	
	// 行の最後にコミットを追加する。
	$fp = createFileObject($newClientId);
	fwrite($fp, "commit;");
	// ファイルを閉じる
	fclose($fp);
	// コマンド実行でファイル登録
	$rtn = execFileInsertQuery($newClientId);
	if($rtn["return"] == 1){
		error_log("NG");
		moveFileInsertQuery($newClientId);
	}else{
		// ファイルを削除する
		removeQueryFile($newClientId);
	}
	
	debugMeg("consumer:end[{$consumerCount["count"]}]");
}

/**
 * コンシューマーと架電禁止の紐づきを移行する
 * @param unknown $newClientId
 * @param unknown $project
 * @param unknown $currentDb
 */
function restrictionConsumerMigration($currentClientId, $newClientId, $project, $currentDb){
	$getCount = 0;
	$page = 1;
	$limit = 2000;
	
	// project_idに紐付く架電結果の総件数を取得する
	$sql = getConsumerCountSql($project["project_id"]);
	$stm = $currentDb->query($sql);
	$consumerCount = $stm->fetch();
	debugMeg("restriction_consumer:bigin");
	while($getCount < $consumerCount["count"]){
		$offset = getOffset($page, $limit);
		debugMeg("restriction_consumer:offset[{$offset}]");
		exec("php function/RestrictionConsumerMigration.php {$currentClientId} {$newClientId} {$project["project_id"]} {$limit} {$offset}", $out, $ret);
		if($ret == "127"){
			$outputJson = json_encode($out);
			debugMeg("out:[{$outputJson}]");
			debugMeg("ret:[{$ret}]");
		}
		$getCount = $page * $limit;
		$page++;
	}
	debugMeg("restriction_consumer:end");
}

/**
 * プロジェクトIDを指定してコンシューマー数を取得する
 * @param unknown $consumerId
 */
function getConsumerCountSql($projectId){
	$sql = "SELECT
				COUNT(a.consumer_id) as count
			FROM
				consumer_status  a
			INNER JOIN
				consumer as b
			ON
				a.consumer_id = b.consumer_id 
			WHERE
			a.consumer_projectid = {$projectId} AND
			b.consumer_del_flg = 0
	";
	return $sql;
}