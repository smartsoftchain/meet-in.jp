<?php
require_once 'CommonMigration.php';		// DBの接続や共通関数をまとめたファイル

/**
 * コンシューマーと架電禁止の紐付くデータを移行する
 * @var unknown_type
 */
try{
	debugMeg("RestrictionConsumerMigration_begin");
	
	// DAO読み込み時のエラー回避のため、空のarrayをセットする
	Zend_Registry::set('user', array());
	
	// 現行TMOのDBオブジェクトを作成
	$currentDb = getCurrentDbObject();
	// 移行先のDBオブジェクトを作成
	$newDb = getNewDbObject();
	
	// DAOのインスタンスを作成
	$forbiddenApproachDao = Application_CommonUtil::getInstance('dao', "ForbiddenApproachDao", $newDb);
	$forbiddenAndApproachTargetRelationDao = Application_CommonUtil::getInstance("dao", "ForbiddenAndApproachTargetRelationDao", $newDb);
	
	// トランザクションスタート
	$newDb->beginTransaction();
	try{
		//error_log(json_encode($argv));
		// コマンドライン引数を取得
		$currentClientId = $argv[1];
		$newClientId = $argv[2];
		$projectId = $argv[3];
		$limit = $argv[4];
		$offset = $argv[5];
		
		debugMeg("limit:{$limit}");
		debugMeg("offset:{$offset}");
		
		// DB名にクライアントIDが付くのでセッションに設定する
		Zend_Registry::set('user', array("staff_type"=>"AA", "staff_id"=>"1", "client_id"=>$newClientId));
		
		// 範囲指定されたコンシューマーを取得する
		$sql = getConsumerListSql($currentClientId, $projectId, $limit, $offset);
		$stm = $currentDb->query($sql);
		$consumerList = $stm->fetchAll();
		// コンシューマー起点に架電結果を移行する
		foreach($consumerList as $consumer){
			// 移行後のアプローチターゲットIDを取得する
			$convertId = getMigrationConvertId($newDb, $newClientId, $consumer["consumer_id"]);
			
			// 紐づきデータを取得する
			$sql = "SELECT * FROM restriction_consumer WHERE consumer_id = {$consumer["consumer_id"]} AND del_flg = 0;";
			$stm = $currentDb->query($sql);
			$restrictionConsumers = $stm->fetchAll();
			foreach($restrictionConsumers as $restrictionConsumer){
				// 移行後のアプローチ禁止IDを取得する
				$forbiddenApproachId = $forbiddenApproachDao->getMigrationByForbiddenApproach($newClientId, $restrictionConsumer["invalid_telephone_id"]);
				if(!is_null($forbiddenApproachId["id"]) && $restrictionConsumer["consumer_id"] == $convertId["consumer_id"]){
					$forbiddenAndApproachTargetRelation = $forbiddenAndApproachTargetRelationDao->getForbiddenAndApproachTargetRelationByPK($newClientId, $convertId["approach_target_id"], $forbiddenApproachId["id"]);
					if(!$forbiddenAndApproachTargetRelation){
						// アプローチターゲットとアプローチ禁止の紐付けが存在しなければ登録する
						$registDict = array();
						$registDict["client_id"] = $newClientId;
						$registDict["approach_target_id"] = $convertId["approach_target_id"];
						$registDict["forbidden_id"] = $forbiddenApproachId["id"];
						$registDict["staff_type"] = $restrictionConsumer["regist_staff_type"];
						$registDict["staff_id"] = $restrictionConsumer["regist_staff_id"];
						$forbiddenAndApproachTargetRelationDao->regist($registDict);
					}
				}
			}
		}
		$newDb->commit();
	}catch(Exception $e){
		error_log($e->getMessage());
		$newDb->rollBack();
		throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
	}
	
	debugMeg("RestrictionConsumerMigration_end");
}
catch (Exception $err){
	debugMeg("想定外の例外：".$err->getMessage());
}


/**
 * コンシューマーIDを指定してコンシューマーデータを取得する
 * @param unknown $consumerId
 */
function getConsumerListSql($clientId, $projectId, $limit, $offset){
	$sql = "SELECT
				a.consumer_id,
				AES_DECRYPT(a.consumer_content,@key) AS consumer_content,
				a.consumer_name as name,
				a.consumer_tel as tel,
				a.consumer_fax as fax,
				a.consumer_address as address,
				a.consumer_mail as mail,
				a.consumer_email as email,
				a.consumer_URL as url,
				a.consumer_script as script,
				AES_DECRYPT(a.consumer_staffname,@key) AS consumer_staffname,
				a.consumer_projectid,
				a.consumer_again as again,
				a.consumer_forbid as forbid,
				a.consumer_reservation as reservation,
				a.consumer_note as note,
				a.consumer_teltimes as teltimes,
				a.consumer_time as time,
				a.consumer_kadentime as kadentime,
				a.consumer_status as status,
				a.consumer_clerkdepartment as clerkdepartment,
				a.consumer_memo as memo,
				a.consumer_send as send,
				a.consumer_sendurl as sendurl,
				a.consumer_latest_call_division_name as latest_call_division_name,
				AES_DECRYPT(a.consumer_latest_update_user_name,@key) AS consumer_latest_update_user_name,
				a.consumer_latest_kaden_update_date,
				b.*,
				c.*,
				d.*,
				e.send_id,
				e.send_clientid,
				e.send_projectid,
				e.send_consumerid,
				e.send_status,
				e.send_reception_date,
				e.send_completion_date,
				e.send_situation,
				e.send_method,
				e.send_address,
				e.send_division_name,
				AES_DECRYPT(e.send_name,@key) AS send_name,
				AES_DECRYPT(e.send_kana,@key) AS send_kana,
				e.send_gender,
				e.send_remarks,
				f.appoint_id,
				f.appoint_clientid,
				f.appoint_projectid,
				f.appoint_consumertel,
				f.appoint_consumerid,
				AES_DECRYPT(f.appoint_consumername,@key) AS appoint_consumername,
				f.appoint_time,
				AES_DECRYPT(f.appoint_clerkdepartment,@key) AS appoint_clerkdepartment,
				AES_DECRYPT(f.appoint_projectheader,@key) AS appoint_projectheader,
				AES_DECRYPT(f.appoint_clerk,@key) AS appoint_clerk,
				f.appoint_reservation,
				AES_DECRYPT(f.appoint_clientstaffname,@key) AS appoint_clientstaffname,
				f.appoint_clientstaffseq,
				f.appoint_description,
				f.appoint_updated,
				f.appoint_updated_name,
				f.appoint_checked,
				f.appoint_canceled,
				f.appoint_gc_id,
				f.appoint_kana,
				f.appoint_gender,
				f.appoint_mail_status,
				f.appoint_createuser_type,
				f.appoint_jokyo,
				f.appoint_created
			FROM
				consumer_status  a
			INNER JOIN
				consumer as b
			ON
				a.consumer_id = b.consumer_id 
			INNER JOIN
				(
					SELECT
						*
					FROM
						project
					WHERE 
						project_id = {$projectId} AND 
						project_clientid = {$clientId}
				) as c
			ON
				a.consumer_projectid = c.project_id
			INNER JOIN
				client as d
			ON
				c.project_clientid = d.client_id
			LEFT OUTER JOIN
				(
					SELECT
						*
					FROM
						send
					WHERE
						send_clientid = {$clientId} AND 
						send_projectid = {$projectId} AND 
						del_flg = 0
				) as e
			ON
				a.consumer_id = e.send_consumerid AND
				c.project_clientid = e.send_clientid AND
				c.project_id = e.send_projectid
			LEFT OUTER JOIN
				(
					SELECT
						*
					FROM
						appoint
					WHERE
						appoint_clientid = {$clientId} AND 
						appoint_projectid = {$projectId} AND 
						del_flg = 0
				) as f
			ON
				a.consumer_id = f.appoint_consumerid AND
				c.project_clientid = f.appoint_clientid AND
				c.project_id = f.appoint_projectid
			WHERE 
				a.consumer_projectid = {$projectId} AND 
				b.consumer_del_flg = 0 
			ORDER BY 
				a.consumer_id asc 
			LIMIT 
				{$limit} 
			OFFSET 
				{$offset};
	";
	return $sql;
}

/**
 * 変換前と後のIDを検索する
 * @param unknown $db
 * @param unknown $consumerId
 * @param unknown $approachTargetId
 * @return unknown
 */
function getMigrationConvertId($db, $newClientId, $consumerId){
	$sql = "SELECT consumer_id, approach_target_id FROM migration_convert_id_{$newClientId} WHERE consumer_id = {$consumerId} LIMIT 1;";
	$stm = $db->query($sql);
	$row = $stm->fetch();
	return $row;
}
