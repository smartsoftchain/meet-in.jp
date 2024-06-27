<?php
require_once 'CommonMigration.php';		// DBの接続や共通関数をまとめたファイル

/**
 * プロジェクトからアプローチリストに変換し、関連のデータ移行を行う
 * このファイルで以下テーブルを移行する
 * [現]project				⇒	[新]approach_list
 * [現]project				⇒	[新]approach_list_and_staff_relation
 * [現]mail_notify_setting	⇒	[新]mail_notify_setting
 * [現]script_relation		⇒	[新]script_relation
 * @var unknown_type
 */
try{
	debugMeg("ProjectMigration_begin");
	
	// DAO読み込み時のエラー回避のため、空のarrayをセットする
	Zend_Registry::set('user', array());
	
	// 現行TMOのDBオブジェクトを作成
	$currentDb = getCurrentDbObject();
	// 移行先のDBオブジェクトを作成
	$newDb = getNewDbObject();
	
	// トランザクションスタート
	$newDb->beginTransaction();
	try{
		//error_log(json_encode($argv));
		// コマンドライン引数を取得
		$currentClientId = $argv[1];
		$newClientId = $argv[2];
		$projectId = $argv[3];
		
		// DB名にクライアントIDが付くのでセッションに設定する
		Zend_Registry::set('user', array("staff_type"=>"AA", "staff_id"=>"1", "client_id"=>$newClientId));
		// 範囲指定された架電結果を取得する
		$sql = "SELECT * FROM project WHERE project_id = {$projectId} AND project_clientid = {$currentClientId};";
		$stm = $currentDb->query($sql);
		$project = $stm->fetch();
		
		// プロジェクトをアプローチリストとして移行する
		$approachListId = approachlistFromProject($newClientId, $project, $newDb);
		
		// プロジェクトとフォルダの紐付けを行う
		registFolderAndApproachlistRelation($newClientId, $approachListId, $newDb);
		
		// 担当者情報を移行する
		projectStaffMigration($newClientId, $approachListId, $project, $newDb);
		
		// メールCCを移行する
		mailMigration($newClientId, $currentClientId, $approachListId, $project, $newDb, $currentDb);
		
		// アプローチリストと台本の紐付けを行う（台本情報は先行して移行済み）
		scriptMigration($newClientId, $currentClientId, $approachListId, $project, $newDb, $currentDb);
		
		$newDb->commit();

		debugMemory();
		
		// アプローチリストのIDを戻り値として返す
		echo $approachListId;
	}catch(Exception $e){
		error_log($e->getMessage());
		$newDb->rollBack();
		throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
	}
		
	debugMeg("ProjectMigration_end");
}
catch (Exception $err){
	debugMeg("想定外の例外：".$err->getMessage());
}

/**
 * 現行のプロジェクト情報をアプローチリストに移行する
 * @param unknown $project
 */
function approachlistFromProject($newClientId, $project, $newDb){
	
	// DAO宣言
	$migrationDao = Application_CommonUtil::getInstance('dao',"MigrationDao", $newDb);
	$folderAndApproachlistRelationDao = Application_CommonUtil::getInstance("dao", "FolderAndApproachlistRelationDao", $newDb);
	
	// クライアントサービスIDは移行でIDの再振りが行われるので取得する
	$masterClientServiceId = 0;
	if($project["project_client_service_id"] != 0){
		$sql = "SELECT id FROM master_client_service WHERE client_id = {$newClientId} AND old_id = {$project["project_client_service_id"]}";
		$masterClientService = $newDb->fetchRow($sql, array());
		if($masterClientService["id"]){
			$masterClientServiceId = $masterClientService["id"];
		}
	}

	// アプローチリストの登録
	$approachListDict = array(
			"client_id"					=> $newClientId,
			"name"						=> $project["project_name"],
			"stime"						=> $project["project_stime"],
			"etime"						=> ($project["project_etime"] == "0000-00-00 00:00:00") ? NULL : $project["project_etime"],
			"clientname"				=> $project["project_clientname"],
			"del_flg"					=> $project["project_del_flg"],
			"comment"					=> $project["project_comment"],
			"call_division_name1"		=> $project["project_call_division_name1"],
			"call_division_name2"		=> $project["project_call_division_name2"],
			"call_division_name3"		=> $project["project_call_division_name3"],
			"appoint_flg"				=> $project["project_appointflg"],
			"client_and_category_id"	=> $project["project_client_and_category_id"],
			"client_service_id"			=> $masterClientServiceId,
			'staff_type' 				=> "AA",
			'staff_id' 					=> "1",
			'update_date' 				=> new Zend_Db_Expr('now()'),
			'old_id' 					=> $project["project_id"],
	);
	$approachListId = $migrationDao->approachListRegist($approachListDict);
	
	return $approachListId;
}

/**
 * プロジェクトから移行したアプローチリストとフォルダを紐付ける
 * @param unknown $newClientId
 * @param unknown $approachListId
 * @param unknown $project
 * @param unknown $newDb
 */
function registFolderAndApproachlistRelation($newClientId, $approachListId, $newDb){
	// DAO宣言
	$folderAndApproachlistRelationDao = Application_CommonUtil::getInstance("dao", "FolderAndApproachlistRelationDao", $newDb);
	
	// アプローチリストを未分類フォルダに紐付ける(移行ではフォルダ作成が行われないので、全て未分類フォルダに紐付けを行う)
	$folderAndApproachlistRelation = array();
	$folderAndApproachlistRelation["client_id"] = $newClientId;
	$folderAndApproachlistRelation["folder_id"] = "0";
	$folderAndApproachlistRelation["approach_list_id"] = $approachListId;
	$folderAndApproachlistRelation["staff_type"] = "AA";
	$folderAndApproachlistRelation["staff_id"] = "1";
	$folderAndApproachlistRelationDao->regist($folderAndApproachlistRelation);
}

/**
 * 新テーブルでは担当者情報が別テーブル管理なので、projectテーブルから移行する
 * 担当者とは「アイドマ担当者」「担当者」「在宅担当者」「訪問担当者」の４種類が存在する
 * @param unknown $newClientId
 * @param unknown $project
 */
function projectStaffMigration($newClientId, $approachListId, $project, $newDb){
	// DAOの宣言
	$approachListAndStaffRelationDao = Application_CommonUtil::getInstance("dao", "ApproachListAndStaffRelationDao", $newDb);
	
	// 担当者の固定値を予め設定
	$approachListAndStaffRelationDict = array();
	$approachListAndStaffRelationDict["client_id"] = $newClientId;
	$approachListAndStaffRelationDict["approach_list_id"] = $approachListId;
	$approachListAndStaffRelationDict["staff_type"] = "AA";
	$approachListAndStaffRelationDict["staff_id"] = "1";
	
	// アイドマ担当者の移行
	if($project["project_staffseq"]){
		// アイドマ担当者の識別タイプを設定する
		$approachListAndStaffRelationDict["approach_list_staff_type"] = "AA";
		// 現行のカラムではカンマ区切りで登録されているので分割する
		$staffIdList = explode(",", $project["project_staffseq"]);
		foreach($staffIdList as $staffId){
			$approachListAndStaffRelationDict["approach_list_staff_id"] = $staffId;
			$approachListAndStaffRelationDao->regist($approachListAndStaffRelationDict);
		}
	}
	// 担当者の移行
	if($project["project_clientstaffseq"]){
		// 担当者の識別タイプを設定する
		$approachListAndStaffRelationDict["approach_list_staff_type"] = "CE";
		// 現行のカラムではカンマ区切りで登録されているので分割する
		$staffIdList = explode(",", $project["project_clientstaffseq"]);
		foreach($staffIdList as $staffId){
			$approachListAndStaffRelationDict["approach_list_staff_id"] = $staffId;
			$approachListAndStaffRelationDao->regist($approachListAndStaffRelationDict);
		}
	}
	// 在宅担当者の移行
	if($project["project_workerstaffseq"]){
		// 担当者の識別タイプを設定する
		$approachListAndStaffRelationDict["approach_list_staff_type"] = "TA";
		// 現行のカラムではカンマ区切りで登録されているので分割する
		$staffIdList = explode(",", $project["project_workerstaffseq"]);
		foreach($staffIdList as $staffId){
			$approachListAndStaffRelationDict["approach_list_staff_id"] = $staffId;
			$approachListAndStaffRelationDao->regist($approachListAndStaffRelationDict);
		}
	}
	// 訪問担当者の移行
	if($project["project_visitstaffseq"]){
		// 担当者の識別タイプを設定する
		$approachListAndStaffRelationDict["approach_list_staff_type"] = "VISIT";
		// 現行のカラムではカンマ区切りで登録されているので分割する
		$staffIdList = explode(",", $project["project_visitstaffseq"]);
		foreach($staffIdList as $staffId){
			$approachListAndStaffRelationDict["approach_list_staff_id"] = $staffId;
			$approachListAndStaffRelationDao->regist($approachListAndStaffRelationDict);
		}
	}
}

/**
 * アプローチリストのメール通知設定の移行
 * @param unknown $newClientId
 * @param unknown $currentClientId
 * @param unknown $approachListId
 * @param unknown $project
 * @param unknown $newDb
 * @param unknown $currentDb
 */
function mailMigration($newClientId, $currentClientId, $approachListId, $project, $newDb, $currentDb){
	// DAOの宣言
	$mailNotifySettingDao = Application_CommonUtil::getInstance("dao", "MailNotifySettingDao", $newDb);
	
	// 現行のDBからメール情報を取得する
	$sql = "SELECT * FROM mail_notify_setting WHERE client_id = {$currentClientId} AND project_id = {$project["project_id"]}";
	$stm = $currentDb->query($sql);
	$mailNotifySettings = $stm->fetchAll();
	foreach($mailNotifySettings as $mailNotifySetting){
		// メール設定を新テーブルに合わせたDICTに整形し登録する
		$mailNotifySettingDict = array();
		$mailNotifySettingDict["client_id"] = $newClientId;
		$mailNotifySettingDict["approach_list_id"] = $approachListId;
		$mailNotifySettingDict["type"] = $mailNotifySetting["type"];
		$mailNotifySettingDict["id"] = $mailNotifySetting["id"];
		$mailNotifySettingDict["notify_send"] = $mailNotifySetting["notify_send"];
		$mailNotifySettingDict["notify_appoint"] = $mailNotifySetting["notify_appoint"];
		$mailNotifySettingDao->regist($mailNotifySettingDict);
	}
}

/**
 * 台本とアプローチリストの紐づき設定を移行
 * @param unknown $newClientId
 * @param unknown $currentClientId
 * @param unknown $approachListId
 * @param unknown $project
 * @param unknown $newDb
 * @param unknown $currentDb
 */
function scriptMigration($newClientId, $currentClientId, $approachListId, $project, $newDb, $currentDb){
	// DAOの宣言
	$scriptRelationDao = Application_CommonUtil::getInstance("dao", "ScriptRelationDao", $newDb);
	
	// 現行DBからプロジェクトに紐付く台本情報を取得する
	$sql = "SELECT * FROM script_relation WHERE client_id = {$currentClientId} AND project_id = {$project["project_id"]} AND del_flg = 0";
	$stm = $currentDb->query($sql);
	$scriptRelations = $stm->fetchAll();
	foreach($scriptRelations as $scriptRelation){
		// 台本とアプローチリストの紐づきを新テーブルに合わせたDICTに整形し登録する
		$registScriptRelation = array();
		$registScriptRelation["client_id"] = $newClientId;
		$registScriptRelation["approach_list_id"] = $approachListId;
		$registScriptRelation["talk_bind_id"] = $scriptRelation["talk_bind_id"];
		$registScriptRelation["del_flg"] = "0";
		$scriptRelationDao->regist($registScriptRelation);
	}
}
