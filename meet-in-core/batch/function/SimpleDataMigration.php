<?php
/**
 * クライアントIDを指定し最低限のデータ移行を行う
 * @var unknown_type
 */
try{
	debugMeg("SimpleDataMigration_begin");
	
	ini_set('default_socket_timeout', 7200);
	
	// DAO読み込み時のエラー回避のため、空のarrayをセットする
	Zend_Registry::set('user', array());
	
	// 現行TMOのDBオブジェクトを宣言
	// DBのインスタンス作成
	$currentDb = getCurrentDbObject();
	
	// 新TMOのDBオブジェクトを宣言
	$config  = new Zend_Config_Ini(APP_DIR . 'configs/system.ini', "development");
	$database = Zend_Db::factory($config->datasource);
	$database->setFetchMode(Zend_Db::FETCH_ASSOC);
	Zend_Db_Table_Abstract::setDefaultAdapter($database);
	// プロファイラ有効
	$database->getProfiler()->setEnabled(true);
	// 暗号化カラムを復号化するためのキー設定
	$database->query("set @key:='{$config->datasource->key}'");
	$newDb = Zend_Db_Table_Abstract::getDefaultAdapter();
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
		//$currentClientId = "3";
		$currentClientId = "42";
		//$currentClientId = "567";
		//$currentClientId = "582";
		
		// データ移行用のテンポラリーテーブルを作成する
		dropConsumerMigrationTables($newDb);
		dropResultMigrationTables($newDb);
		createResultMigrationTables($newDb);
		
		// 現行のクライアントデータを取得する
		$currentClient = getCurrentClientRow($currentDb, $currentClientId);
		// DB名にクライアントIDが付くのでセッションに設定する
		Zend_Registry::set('user', array("staff_type"=>"AA", "staff_id"=>"1"));
		// クライアント情報を移行する
		$newClientId = clientMigration($currentClient, $newDb);
		// クライアントのサービス商品名を移行する
		$clientServiceId = clientServiceMigration($newClientId, $currentClientId, $newDb, $currentDb);
		// DB名にクライアントIDが付くのでセッションに設定する
		Zend_Registry::set('user', array("client_id"=>$newClientId));
		// デフォルトアプローチリストを作成する
		$approachListId = createApproachList($newClientId, $currentClient["client_name"], $clientServiceId, $newDb);
		// アプローチ先を移行する(consumer_list、consumer_status)
		consumerRelationMasterMigration($currentClientId, $newClientId, $approachListId, $splitPatterns, $currentDb, $newDb);
		// 架電結果・資料送付・アポイント・consumer_statusを移行する
		resultMigration($currentClientId, $newClientId, $splitPatterns, $approachListId, $currentDb, $newDb);
		
		// テンポラリーテーブルの削除
		dropResultMigrationTables($newDb);
		// 登録完了したらコミットする
		$newDb->commit();
	}catch(Exception $e){
		$newDb->rollBack();
		throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
	}
		
	debugMeg("SimpleDataMigration_end");
}
catch (Exception $err){
	debugMeg("想定外の例外：".$err->getMessage());
}


function getCurrentDbObject(){
	$dsn  = "mysql:dbname=tmo3_20160114;host=localhost;";
	$user = "root";
	$password = "90kon6Fmysql";
	$currentDb = new PDO($dsn, $user, $password, array(
			PDO::ATTR_PERSISTENT => true,
			PDO::MYSQL_ATTR_LOCAL_INFILE => true,
			PDO::MYSQL_ATTR_INIT_COMMAND => 'SET @key:="' . $config->datasource->key . '";',
	));
	return $currentDb;
}
/**
 * デバッグメッセージ
 * @param unknown $actionName	処理名
 */
function debugMeg($actionName){
	error_log($actionName.":".date("Y-m-d H:i:s"));
}

function createConsumerMigrationTables($db){
	$sql = "
			CREATE TABLE IF NOT EXISTS `migration_consumer_company_id` (
				`id` int(11) NOT NULL COMMENT '重複チェック用ID',
				PRIMARY KEY (`id`)
			) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;
			CREATE TABLE IF NOT EXISTS `migration_consumer_approach_target_id` (
				`id` int(11) NOT NULL COMMENT '重複チェック用ID',
				PRIMARY KEY (`id`)
			) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;
			CREATE TABLE IF NOT EXISTS `migration_consumer_tree_approach_target_id` (
				`id` int(11) NOT NULL COMMENT '重複チェック用ID',
				PRIMARY KEY (`id`)
			) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;
			";
	$db->query($sql);
}

function dropConsumerMigrationTables($db){
	$sql = "
			DROP TABLE IF EXISTS `migration_consumer_company_id`;
			DROP TABLE IF EXISTS `migration_consumer_approach_target_id`;
			DROP TABLE IF EXISTS `migration_consumer_tree_approach_target_id`;
			";
	$db->query($sql);
}

/**
 * 架電結果移行用のテンポラリーテーブル
 */
function createResultMigrationTables($db){
	$sql = "
			CREATE TABLE IF NOT EXISTS `migration_result_company_id` (
				`id` int(11) NOT NULL COMMENT '重複チェック用ID',
				PRIMARY KEY (`id`)
			) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;
			
			CREATE TABLE IF NOT EXISTS `migration_result_approach_target_id` (
				`id` int(11) NOT NULL COMMENT '重複チェック用ID',
				PRIMARY KEY (`id`)
			) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;
			
			CREATE TABLE IF NOT EXISTS `migration_result_tree_approach_target_id` (
				`id` int(11) NOT NULL COMMENT '重複チェック用ID',
				PRIMARY KEY (`id`)
			) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;
			
			CREATE TABLE IF NOT EXISTS `migration_result_consumer_id` (
				`id` decimal(32,0) NOT NULL COMMENT '重複チェック用ID',
				PRIMARY KEY (`id`)
			) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;
			
			CREATE TABLE IF NOT EXISTS `migration_result_send_id` (
				`id` decimal(32,0) NOT NULL COMMENT '重複チェック用ID',
				PRIMARY KEY (`id`)
			) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;
			
			CREATE TABLE IF NOT EXISTS `migration_result_appoint_id` (
				`id` decimal(32,0) NOT NULL COMMENT '重複チェック用ID',
				PRIMARY KEY (`id`)
			) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;
			";
	$db->query($sql);
}

/**
 * 架電結果移行用のテンポラリーテーブル
 */
function dropResultMigrationTables($db){
	$sql = "
			DROP TABLE IF EXISTS `migration_result_company_id`;
			DROP TABLE IF EXISTS `migration_result_approach_target_id`;
			DROP TABLE IF EXISTS `migration_result_tree_approach_target_id`;
			DROP TABLE IF EXISTS `migration_result_consumer_id`;
			DROP TABLE IF EXISTS `migration_result_send_id`;
			DROP TABLE IF EXISTS `migration_result_appoint_id`;
			";
	$db->query($sql);
}

/**
 * 移行対象の現行クライアント情報を取得する
 * @param unknown $db
 * @param unknown $clientId
 * @return unknown
 */
function getCurrentClientRow($db, $clientId){
	$sql = "SELECT
				client_id, 
				client_name, 
				client_password, 
				client_password_before, 
				client_del_flg, 
				client_namepy, 
				client_postcode1, 
				client_postcode2, 
				client_address, 
				client_tel1, 
				client_tel2, 
				client_tel3, 
				client_fax1, 
				client_fax2, 
				client_fax3, 
				client_homepage, 
				AES_DECRYPT(client_staffleaderfirstname,@key) AS client_staffleaderfirstname, 
				AES_DECRYPT(client_staffleaderlastname,@key) AS client_staffleaderlastname, 
				AES_DECRYPT(client_staffleaderfirstnamepy,@key) AS client_staffleaderfirstnamepy, 
				AES_DECRYPT(client_staffleaderlastnamepy,@key) AS client_staffleaderlastnamepy, 
				client_staffleaderemail, 
				client_comment, 
				client_idchar, 
				AES_DECRYPT(client_staffleadername,@key) AS client_staffleadername, 
				AES_DECRYPT(client_staffname,@key) AS client_staffname, 
				client_report_day_of_the_week, 
				aa_staff_id_list, 
				publish_recording_talk_flg, 
				publish_telephone_db_flg, 
				valid_telephonelist_downloading_num, 
				publish_analysis_menu_flg, option_passwd, 
				client_add_staff_flg 
			FROM
				client
			WHERE
				client_id = {$clientId};";
	$stm = $db->query($sql);
	$row = $stm->fetch();
	return $row;
}

/**
 * 
 * @param unknown $currentClient
 * @param unknown $newDb
 */
function clientMigration($currentClient, $newDb){
	$masterClientDict = array(
			"client_name"							=>$currentClient["client_name"],
			"client_del_flg"						=>"0",
			"client_namepy"							=>$currentClient["client_namepy"],
			"client_postcode1"						=>$currentClient["client_postcode1"],
			"client_postcode2"						=>$currentClient["client_postcode2"],
			"client_address"						=>$currentClient["client_address"],
			"client_tel1"							=>$currentClient["client_tel1"],
			"client_tel2"							=>$currentClient["client_tel2"],
			"client_tel3"							=>$currentClient["client_tel3"],
			"client_fax1"							=>$currentClient["client_fax1"],
			"client_fax2"							=>$currentClient["client_fax2"],
			"client_fax3"							=>$currentClient["client_fax3"],
			"client_homepage"						=>$currentClient["client_homepage"],
			"client_staffleaderfirstname"			=>$currentClient["client_staffleaderfirstname"],
			"client_staffleaderlastname"			=>$currentClient["client_staffleaderlastname"],
			"client_staffleaderfirstnamepy"			=>$currentClient["client_staffleaderfirstnamepy"],
			"client_staffleaderlastnamepy"			=>$currentClient["client_staffleaderlastnamepy"],
			"client_staffleaderemail"				=>$currentClient["client_staffleaderemail"],
			"client_comment"						=>$currentClient["client_comment"],
			"client_idchar"							=>$currentClient["client_idchar"],
			"client_staffleadername"				=>$currentClient["client_staffleadername"],
			"aa_staff_id_list"						=>$currentClient["aa_staff_id_list"],
			"option_passwd"							=>$currentClient["option_passwd"],
			"publish_recording_talk_flg"			=>$currentClient["publish_recording_talk_flg"],
			"publish_telephone_db_flg"				=>$currentClient["publish_telephone_db_flg"],
			"valid_telephonelist_downloading_num"	=>$currentClient["valid_telephonelist_downloading_num"],
			"publish_analysis_menu_flg"				=>$currentClient["publish_analysis_menu_flg"],
			"sum_span_type"							=>$currentClient["sum_span_type"],
			"client_add_staff_flg"					=>$currentClient["client_add_staff_flg"]
	);
	// DAO宣言
	$masterClientDao = Application_CommonUtil::getInstance('dao', "MasterClientDao", $newDb);
	// クライアントの登録処理
	$clientId = $masterClientDao->setMasterClient($masterClientDict);
	// クライアント作成時にデフォルト作成されるデータを登録
	// アプローチ結果とタブ
	$masterClientDao->registResultAndTabAndMemo(array("clientId"=>$clientId, "staffType"=>"AA", "staffId"=>"1"));
	// 架電メモ
	$masterClientDao->registResultMemoTemplate($clientId);
	// 資料送付：状況レベル
	$masterClientDao->registTemplateSendSituation($clientId);
	// 資料送付：送付方法
	$masterClientDao->registTemplateSendMethod($clientId);
	// アポイント：状況レベル
	$masterClientDao->registTemplateAppointSituation($clientId);
	// カスタムラベル
	$masterClientDao->registFreeLabel(array("clientId"=>$clientId, "staffType"=>"AA", "staffId"=>"1"));
	// リード管理のデフォルトを登録する
	$masterClientDao->registLeadManagement(array("clientId"=>$clientId, "staffType"=>"AA", "staffId"=>"1"));
	// クライアントマスタDBを生成する
	$masterClientDao->registClientCreateTable($clientId);
	// 台本のサンプルを登録する
	$masterClientDao->registScript($clientId);
	return $clientId;
}

/**
 * サービス商品名を移行する
 * @param unknown $newClientId
 * @param unknown $newDb
 * @param unknown $currentDb
 */
function clientServiceMigration($newClientId, $currentClientId, $newDb, $currentDb){
	// DAOの宣言
	$masterClientServiceDao = Application_CommonUtil::getInstance('dao', "MasterClientServiceDao", $newDb);
// 	// 既存のDBからデータを取得する
// 	$sql = "SELECT * FROM client_service WHERE client_id = {$currentClientId} ORDER BY id;";
// 	$stm = $currentDb->query($sql);
// 	$clientServiceList = $stm->fetchAll();
// 	foreach($clientServiceList as $clientService){
// 		$clientServiceDict = array();
// 		$clientServiceDict["client_id"] = $newClientId;
// 		$clientServiceDict["service_name"] = $clientService["service_name"];
// 		$clientServiceDict["update_staff_type"] = "AA";
// 		$clientServiceDict["update_staff_id"] = "1";
// 		$clientServiceDict["del_flg"] = "0";
// 		$masterClientServiceDao->regist($clientServiceDict);
// 	}
	$clientServiceDict = array();
	$clientServiceDict["client_id"] = $newClientId;
	$clientServiceDict["service_name"] = "移行用デフォルトサービス";
	$clientServiceDict["update_staff_type"] = "AA";
	$clientServiceDict["update_staff_id"] = "1";
	$clientServiceDict["del_flg"] = "0";
	$clientServiceId = $masterClientServiceDao->regist($clientServiceDict);
	return $clientServiceId;
}

/**
 * 全ての企業を紐付ける為に、アプローチリストを１件作成する
 * @param unknown $clientId
 * @param unknown $newDb
 */
function createApproachList($newClientId, $clientName, $clientServiceId, $newDb){
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
			"client_service_id"			=> $clientServiceId,
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
	createConsumerMigrationTables($newDb);
	// 現行の連携用のID(consumer_relation_master_id)を一意に取得する（まず自社登録データの移行）
	$sql = "
				SELECT 
					DISTINCT a.consumer_relation_master_id as id 
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
		$clientDbRelationDict["del_flg"] = "0";
		$clientDbRelationId = $clientDbRelationDao->regist($clientDbRelationDict);
		// consumer_relation_master_idに紐付くconsumer_listを移行する
		consumerListMigration($currentClientId, $newClientId, $approachListId, $consumerRelationMasterId["id"], $clientDbRelationId, $splitPatterns, $currentDb, $newDb);
		error_log("consumerRelationMasterCount:{$consumerRelationMasterCount}");
		$consumerRelationMasterCount++;
	}
	dropConsumerMigrationTables($newDb);
	createConsumerMigrationTables($newDb);
	// 現行の連携用のID(consumer_relation_master_id)を一意に取得する（TMOマスターダウンロード登録データの移行）
	$sql = "
				SELECT 
					DISTINCT a.consumer_relation_master_id as id 
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
					b.del_flg = 0;";
	$stm = $currentDb->query($sql);
	$consumerRelationMasterIds = $stm->fetchAll();
	foreach($consumerRelationMasterIds as $consumerRelationMasterId){
		error_log("ダウンロードデータ:".$consumerRelationMasterId["id"]);
		// 基本情報を取得する
		$sql = "SELECT * FROM consumer_relation_master WHERE id = {$consumerRelationMasterId["id"]}";
		$stm = $currentDb->query($sql);
		$consumerRelationMaster = $stm->fetch($sql);
		// 基本情報（client_db_relation）を登録する（TMOダウンロードの場合は固定）
		$clientDbRelationDict = array();
		$clientDbRelationDict["client_id"] = $newClientId;
		$clientDbRelationDict["file_name"] = "Sales Cloudから取得データ";
		$clientDbRelationDict["acquisition_source"] = "Sales Cloud";
		$clientDbRelationDict["acquisition_date"] = $consumerRelationMaster["acquisition_date"];
		$clientDbRelationDict["del_flg"] = "0";
		$clientDbRelationId = $clientDbRelationDao->regist($clientDbRelationDict);
		// consumer_relation_master_idに紐付くconsumer_listを移行する
		consumerListMigration($currentClientId, $newClientId, $approachListId, $consumerRelationMasterId["id"], $clientDbRelationId, $splitPatterns, $currentDb, $newDb);
	}
	dropConsumerMigrationTables($newDb);
}

/**
 * コンシューマーリストを移行する
 * @param unknown $consumerRelationMasterId
 */
function consumerListMigration($currentClientId, $newClientId, $approachListId, $consumerRelationMasterId, $clientDbRelationId, $splitPatterns, $currentDb, $newDb){
	// 1つのconsumer_relation_master内で重複チェックをする為の変数
	$companyIds = array();
	$approachTargetIds = array();
	$treeApproachTargetIds = array();
	
	// データ件数が多い事を考慮し、データ取得・移行を分割しながら行う
	$getCount = 0;
	$page = 1;
	$limit = 2000;
	
	// consumer_listの総件数を取得する
	$sql = "SELECT count(id) as count FROM consumer_list WHERE client_id = {$currentClientId} AND consumer_relation_master_id = {$consumerRelationMasterId} AND invalid_flg = 0 AND del_flg = 0;";
	$stm = $currentDb->query($sql);
	$consumerListCount = $stm->fetch();
	// 全データ取得し終わるまでループしながらconsumer_listを移行する
	debugMeg("consumer_list:begin[{$consumerListCount['count']}]");
	while($getCount < $consumerListCount["count"]){
		$offset = getOffset($page, $limit);
		//debugMeg("offset:[{$offset}]");
// 		$strCompanyIds = join(",", $companyIds);
// 		$strApproachTargetIds = join(",", $approachTargetIds);
// 		$strTreeApproachTargetIds = join(",", $treeApproachTargetIds);
		
		$resultJson = exec("php function/ConsumerListMigration.php {$currentClientId} {$newClientId} {$consumerRelationMasterId} {$clientDbRelationId} {$approachListId} {$limit} {$offset}", $out, $ret);
		$result = json_decode($resultJson, true);
// 		$companyIds = $result["companyIds"];
// 		$approachTargetIds = $result["approachTargetIds"];
// 		$treeApproachTargetIds = $result["treeApproachTargetIds"];
		
// 		$sql = "SELECT * FROM consumer_list WHERE client_id = {$currentClientId} AND consumer_relation_master_id = {$consumerRelationMasterId} AND invalid_flg = 0 AND del_flg = 0 ORDER BY id LIMIT {$limit} OFFSET {$offset};";
// 		$stm = $currentDb->query($sql);
// 		$consumerList = $stm->fetchAll();
// 		foreach($consumerList as $consumer){
// 			// 企業情報と部署拠点情報に分割する
// 			$companyDict = getCompanyDict($consumer, $splitPatterns);
// 			$approachTargetDict = getApproachTargetDict($consumer, $companyDict);
// 			try{
// 				// 重複チェックを行いつつデータ移行を行う
// 				checkOverlapCompanyAndRegist($newDb, $newClientId, $approachListId, $clientDbRelationId, $companyDict, $approachTargetDict, $companyIds, $approachTargetIds, $treeApproachTargetIds);
// 			}catch (Exception $e){
// 				error_log(json_encode($companyDict));
// 				error_log("");
// 				error_log(json_encode($approachTargetDict));
// 				error_log("");
// 				error_log($e->getMessage());
// 				exit;
// 			}
// 		}
		
		$getCount = $page * $limit;
		$page++;
	}
	debugMeg("consumer_list:end[{$consumerListCount['count']}]");
}



/**
 * 架電結果・資料送付・アポイント・consumer_statusのデータ移行を行う
 * @param unknown $currentClientId
 * @param unknown $newClientId
 * @param unknown $currentDb
 * @param unknown $newDb
 */
function resultMigration($currentClientId, $newClientId, $splitPatterns, $approachListId, $currentDb, $newDb){
	// 1つのconsumer_relation_master内で重複チェックをする為の変数
	$companyIds = array();
	$approachTargetIds = array();
	$treeApproachTargetIds = array();
	$consumerIds = array();
	
	$sendConsumerIds = array();
	$appointConsumerIds = array();
	
	// アプローチ画面でデータを取得する為にデフォルトのclientDbRelationを作成し、紐付ける
	$clientDbRelationDao = Application_CommonUtil::getInstance('dao', "ClientDbRelationDao", $newDb);
	$clientDbRelationDict = array();
	$clientDbRelationDict["client_id"] = $newClientId;
	$clientDbRelationDict["file_name"] = "データ移行用のデフォルトデータ";
	$clientDbRelationDict["acquisition_source"] = "Sales Cloud";
	$clientDbRelationDict["acquisition_date"] = date("Y-m-d");
	$clientDbRelationDict["del_flg"] = "0";
	$clientDbRelationId = $clientDbRelationDao->regist($clientDbRelationDict);
	
	// データ件数が多い事を考慮し、データ取得・移行を分割しながら行う
	$getCount = 0;
	$page = 1;
	$limit = 2000;
	
	// consumer_listの総件数を取得する
	$sql = "SELECT count(result_id) as count FROM result WHERE result_clientid = {$currentClientId} AND result_del_flg = 0;";
	$stm = $currentDb->query($sql);
	$resultCount = $stm->fetch();
	// 全データ取得し終わるまでループしながらconsumer_listを移行する
	debugMeg("result:bigin[{$resultCount["count"]}]");
	while($getCount < $resultCount["count"]){
		$offset = getOffset($page, $limit);
		debugMeg("result:offset[{$offset}]");
		
// 		$strCompanyIds = join(",", $companyIds);
// 		$strApproachTargetIds = join(",", $approachTargetIds);
// 		$strTreeApproachTargetIds = join(",", $treeApproachTargetIds);
// 		$strConsumerIds = join(",", $consumerIds);
// 		$strSendConsumerIds = join(",", $sendConsumerIds);
// 		$strAppointConsumerIds = join(",", $appointConsumerIds);
		
		$resultJson = exec("php function/ResultMigration.php {$currentClientId} {$newClientId} {$approachListId} {$clientDbRelationId} {$limit} {$offset}", $out, $ret);
		if($ret == "127"){
			$outputJson = json_encode($out);
			debugMeg("out:[{$outputJson}]");
			debugMeg("ret:[{$ret}]");
		}
// 		$result = json_decode($resultJson, true);
// 		$companyIds = $result["companyIds"];
// 		$approachTargetIds = $result["approachTargetIds"];
// 		$treeApproachTargetIds = $result["treeApproachTargetIds"];
// 		$consumerIds = $result["consumerIds"];
// 		$sendConsumerIds = $result["sendConsumerIds"];
// 		$appointConsumerIds = $result["appointConsumerIds"];
		
// 		$sql = "SELECT result_id, user_type, result_consumerid, result_projectid, result_consumertel, AES_DECRYPT(result_clerk,@key) AS result_clerk, result_status, result_time, result_teltimes, result_reservation, result_del_flg, result_consumername, result_consumerscript, result_clerkdepartment, result_projectheader, result_staffid, result_again, result_again_time, result_forbid, result_note, result_notedetail, result_clientid, result_caller, result_call_division_name, result_is_update, result_mp3_url, result_mp3_del, result_webphone_id FROM result WHERE result_clientid = {$currentClientId} AND result_del_flg = 0 ORDER BY result_time asc LIMIT {$limit} OFFSET {$offset};";
// 		$stm = $currentDb->query($sql);
// 		$resultList = $stm->fetchAll();
// 		foreach($resultList as $result){
// 			//error_log("result_consumerid:{$result["result_consumerid"]}");
// 			// 架電結果に紐付く企業・資料送付・アポイントを取得
// 			$sql = getConsumerSql($result["result_consumerid"], $currentClientId);
// 			$stm = $currentDb->query($sql);
// 			$consumer = $stm->fetch();
// 			// 企業情報と部署拠点情報に分割する
// 			$companyDict = getCompanyDict($consumer, $splitPatterns);
// 			$approachTargetDict = getApproachTargetDict($consumer, $companyDict);
			
// 			// 変更履歴を掛けるか判定するフラグを設定
// 			$historyFlg = false;
// 			if(!in_array($result["result_consumerid"], $consumerIds)){
// 				$historyFlg = true;
// 				$consumerIds[] = $result["result_consumerid"];
// 			}
			
// 			// 架電結果から登録の際は$clientDbRelationIdが取得できないので、空文字を設定しcheckOverlapCompanyAndRegistでは紐付け処理を行わない
// 			//$clientDbRelationId = "";
// 			try{
// 				// 架電結果に紐付くアプローチ先を重複チェックを行いつつデータ移行を行う
// 				$approachTargetId = checkOverlapCompanyAndRegist($newDb, $newClientId, $approachListId, $clientDbRelationId, $companyDict, $approachTargetDict, $companyIds, $approachTargetIds, $treeApproachTargetIds, $historyFlg);
// 			}catch (Exception $e){
// 				error_log(json_encode($companyDict));
// 				error_log("");
// 				error_log(json_encode($approachTargetDict));
// 				error_log("");
// 				error_log($e->getMessage());
// 				exit;
// 			}
			
// 			//error_log("[1]approachTargetId:{$approachTargetId}");
			
			
// 			// 架電結果の移行
// 			$resultTelephoneId = resultTelephoneMigration($newClientId, $currentClientId, $approachTargetId, $approachListId, $result, $companyDict, $approachTargetDict, $newDb, $currentDb);
// 			// 資料送付
// 			if(!is_null($consumer["send_id"]) && !empty($consumer["send_id"]) && !in_array($result["result_consumerid"], $sendConsumerIds)){
// 				sendMigration($newClientId, $approachListId, $approachTargetId, $resultTelephoneId, $consumer, $newDb);
// 				$sendConsumerIds[] = $result["result_consumerid"];
// 			}
// 			// アポイントの移行
// 			if(!is_null($consumer["appoint_id"]) && !empty($consumer["appoint_id"]) && !in_array($result["result_consumerid"], $appointConsumerIds)){
// 				appointMigration($newClientId, $approachListId, $approachTargetId, $resultTelephoneId, $consumer, $newDb);
// 				$appointConsumerIds[] = $result["result_consumerid"];
// 			}
// 		}
		$getCount = $page * $limit;
		$page++;
	}
	debugMeg("result:end[{$resultCount["count"]}]");
}

/**
 * 分割してデータを取得する為のオフセットを生成する
 * @param unknown $page
 * @param unknown $limit
 * @return multitype:number
 */
function getOffset($page, $limit){
	$offset = 0;
	$page = $page - 1;
	if($page > 0){
		$offset = $page * $limit;
	}
	return $offset;
}


