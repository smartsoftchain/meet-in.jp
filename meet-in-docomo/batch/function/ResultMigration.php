<?php
require_once 'CommonMigration.php';		// DBの接続や共通関数をまとめたファイル

/**
 * 架電結果に紐付くデータを移行する
 * @var unknown_type
 */
try{
	debugMeg("ResultMigration_begin");

	// DAO読み込み時のエラー回避のため、空のarrayをセットする
	Zend_Registry::set('user', array());
	
	// 現行TMOのDBオブジェクトを作成
	$currentDb = getCurrentDbObject();
	// 移行先のDBオブジェクトを作成
	$newDb = getNewDbObject();
	
	// 企業名から削除する文字列を取得する
	$splitPatterns = getSplitPatterns();
	
	// トランザクションスタート
	$newDb->beginTransaction();
	try{
		//error_log(json_encode($argv));
		// コマンドライン引数を取得
		$currentClientId = $argv[1];
		$newClientId = $argv[2];
		$approachListId = $argv[3];
		$clientDbRelationId = $argv[4];
		$projectId = $argv[5];
		$limit = $argv[6];
		$offset = $argv[7];

		// 同じプロジェクト内で同じツリーを作らないようにする
		$sql = "DELETE FROM `migration_result_tree_approach_target_id_{$newClientId}`;";
		$newDb->query($sql);
		
		// DB名にクライアントIDが付くのでセッションに設定する
		Zend_Registry::set('user', array("staff_type"=>"AA", "staff_id"=>"1", "client_id"=>$newClientId));
		
		// DAOを１度宣言し使いまわす
		$clientDbCompanyDao = Application_CommonUtil::getInstance('dao', "ClientDbCompanyDao", $newDb);
		$clientDbApproachTargetDao = Application_CommonUtil::getInstance('dao', "ClientDbApproachTargetDao", $newDb);
		$clientDbHistoryDao = Application_CommonUtil::getInstance('dao', "ClientDbHistoryDao", $newDb);
		$clientDbTmpDao = Application_CommonUtil::getInstance('dao', "ClientDbTmpDao", $newDb);
		$treeActionDao = Application_CommonUtil::getInstance('dao',"TreeActionDao", $newDb);
		$treeActionClientDbDao = Application_CommonUtil::getInstance('dao',"TreeActionClientDbDao", $newDb);
		$resultTelephoneDao = Application_CommonUtil::getInstance("dao", "ResultTelephoneDao", $newDb);
		$forbiddenApproachDao = Application_CommonUtil::getInstance('dao', "ForbiddenApproachDao", $newDb);
		$forbiddenAndApproachTargetRelationDao = Application_CommonUtil::getInstance("dao", "ForbiddenAndApproachTargetRelationDao", $newDb);
		$migrationDao = Application_CommonUtil::getInstance('dao',"MigrationDao", $newDb);
		
		// 大量のSQLを実行するためにファイルオブジェクトを生成する
		$fp = createFileObject($newClientId);
		
		// 範囲指定されたコンシューマーを取得する
		$sql = getConsumerListSql($currentClientId, $projectId, $limit, $offset);
		$stm = $currentDb->query($sql);
		if(!$stm){
			// 理由は解らないが$stmがnullの場合がある
			error_log($sql);
			exit;
		}
		$consumerList = $stm->fetchAll();
		// コンシューマー起点に架電結果を移行する
		foreach($consumerList as $consumer){
			// 企業情報と部署拠点情報に分割する
			$companyDict = getCompanyDict($consumer, $splitPatterns);
			$approachTargetDict = getApproachTargetDict($consumer, $companyDict);
// 			// 変更履歴を掛けるか判定するフラグを設定
// 			$historyFlg = false;
// 			$consumerId = getMigrationResultId($newDb, "migration_result_consumer_id", $consumer["consumer_id"]);
// 			if(!$consumerId){
// 				setMigrationResultId($newDb, "migration_result_consumer_id", $consumer["consumer_id"]);
// 				$historyFlg = true;
// 			}

			// 架電結果に紐付くアプローチ先を重複チェックを行いつつデータ移行を行う
			$approachTargetId = checkOverlapCompanyAndRegist($newDb, $newClientId, $approachListId, $clientDbRelationId, $companyDict, $approachTargetDict, $clientDbCompanyDao, $clientDbApproachTargetDao, $clientDbHistoryDao, $clientDbTmpDao, $treeActionDao, $treeActionClientDbDao, $migrationDao, $fp);

			// staffandconsumerを移行する
			migrateStaffAndConsumer($migrationDao, $currentDb, $consumer["consumer_id"], $approachTargetId, $approachListId, $newClientId);

			// 変換前と変換後のIDを未登録の場合はDBに保存する(コンシューマーと架電禁止の紐づきに使用する)
			$convertId = getMigrationConvertId($newDb, $newClientId, $consumer["consumer_id"], $approachTargetId);
			if(!$convertId){
				setMigrationConvertId($newDb, $newClientId, $consumer["consumer_id"], $approachTargetId);
			}
			
			// コンシューマーに紐付く架電結果を取得する
			$sql = getResultSql($currentClientId, $projectId, $consumer["consumer_id"]);
			$stm = $currentDb->query($sql);
			$resultList = $stm->fetchAll();
			foreach($resultList as $result){
				// 架電結果の移行
				$resultTelephoneId = resultTelephoneMigration($newClientId, $currentClientId, $approachTargetId, $approachListId, $result, $companyDict, $approachTargetDict, $newDb, $currentDb, $migrationDao, $treeActionDao, $forbiddenApproachDao, $forbiddenAndApproachTargetRelationDao);
				
				// 資料送付
				$sendConsumerId = getMigrationResultId($newDb, "migration_result_send_id_{$newClientId}", $consumer["consumer_id"]);
				if(!is_null($consumer["send_id"]) && !empty($consumer["send_id"]) && !$sendConsumerId && ($result["result_status"] == 2 || $result["result_status"] == 4)){
					sendMigration($newClientId, $approachListId, $approachTargetId, $resultTelephoneId, $consumer, $result, $newDb);
					setMigrationResultId($newDb, "migration_result_send_id_{$newClientId}", $consumer["consumer_id"]);
				}
				// アポイントの移行
				$appointConsumerId = getMigrationResultId($newDb, "migration_result_appoint_id_{$newClientId}", $consumer["consumer_id"]);
				if(!is_null($consumer["appoint_id"]) && !empty($consumer["appoint_id"]) && !$appointConsumerId && $result["result_status"] == 5){
					appointMigration($newClientId, $approachListId, $approachTargetId, $resultTelephoneId, $consumer, $result, $newDb);
					setMigrationResultId($newDb, "migration_result_appoint_id_{$newClientId}", $consumer["consumer_id"]);
				}
			}
			
			// 解放処理
			unset($resultList);
			
			// 架電結果から作成された架電禁止を登録する
			invalidTelephoneMigration($newClientId, $currentClientId, $approachTargetId, $approachListId, $consumer["consumer_id"], $newDb, $currentDb);
			
		}
		$newDb->commit();
		// ファイルを閉じる
		fclose($fp);
		
		// データを開放
		unset($consumerList);
		
		// メモリー状況を表示
		debugMemory();
		
	}catch(Exception $e){
		error_log($e->getMessage());
		$newDb->rollBack();
		throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
	}
		
	debugMeg("ResultMigration_end");
}
catch (Exception $err){
	debugMeg("想定外の例外：".$err->getMessage());
}

/**
 * 架電結果を取得する為のSQLを返す
 * @param unknown $currentClientId	現行のクライアントID
 * @param unknown $projectId		移行対象のプロジェクトID
 * @param unknown $limit			取得する件数
 * @param unknown $offset			どこから取得するかのオフセット
 * @return string
 */
function getResultSql($currentClientId, $projectId, $consumerId){
	// 差分移行の起点となる日付
	$migrationDate = "2016-04-05";
	$sql = "SELECT 
				result_id, 
				user_type, 
				result_consumerid, 
				result_projectid, 
				result_consumertel, 
				AES_DECRYPT(result_clerk,@key) AS result_clerk, 
				result_status, 
				result_time, 
				result_teltimes, 
				result_reservation, 
				result_del_flg, 
				result_consumername, 
				result_consumerscript, 
				result_clerkdepartment, 
				result_projectheader, 
				result_staffid, 
				result_again, 
				result_again_time, 
				result_forbid, 
				result_note, 
				result_notedetail, 
				result_clientid, 
				result_caller, 
				result_call_division_name, 
				result_is_update, 
				result_mp3_url, 
				result_mp3_del, 
				result_webphone_id,
				result_templateid  
			FROM 
				result 
			WHERE 
				result_clientid = {$currentClientId} AND 
				result_projectid = {$projectId} AND 
				result_consumerid = {$consumerId} AND 
				DATE_FORMAT(result_time, '%Y-%m-%d') >= '{$migrationDate}' AND 
				result_del_flg = 0 
			ORDER BY 
				result_time asc;";
	return $sql;
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
				e.create_time,
				e.update_time,
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
				project as c 
			ON
				a.consumer_projectid = c.project_id AND 
				c.project_id = {$projectId} AND 
				c.project_clientid = {$clientId}
			INNER JOIN
				client as d
			ON
				c.project_clientid = d.client_id
			LEFT OUTER JOIN 
				send as e 
			ON
				a.consumer_id = e.send_consumerid AND
				c.project_clientid = e.send_clientid AND
				c.project_id = e.send_projectid AND 
				e.send_clientid = {$clientId} AND 
				e.send_projectid = {$projectId} AND 
				e.del_flg = 0
			LEFT OUTER JOIN 
				appoint as f 
			ON 
				a.consumer_id = f.appoint_consumerid AND
				c.project_clientid = f.appoint_clientid AND
				c.project_id = f.appoint_projectid AND 
				f.appoint_clientid = {$clientId} AND 
				f.appoint_projectid = {$projectId} AND 
				f.del_flg = 0
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
 * 企業情報の重複チェックを行い、SQLを返す
 * ■重複チェックルール
 * ==========================================================
 * 1	（企業名＋部署拠点名）とユーザー登録住所が一致の場合
 * 1-1	企業テーブルと部署拠点又は個人テーブルを上書きする
 * 		⇒企業テーブルと部署個人テーブルの履歴作成
 *
 * 2	企業名とユーザー登録住所が一致の場合
 * 2-1	部署拠点名が一致した場合は企業テーブルを上書きし、部署拠点テーブルも上書きする
 * 		⇒企業テーブルと部署個人テーブルの履歴作成
 * 2-2	部署拠点名が一致ない場合は企業テーブルを上書きし、部署拠点テーブルは企業の部署拠点として新規登録する
 * 		⇒企業テーブルの履歴作成
 *
 * 3	企業名は一致するが、ユーザー登録住所が一致しないの場合
 * 3-1	テンポラリーテーブルにデータを登録する
 *
 * 4	企業名が一致しない場合
 * 4-1	企業テーブル、部署拠点テーブルを新規登録する
 *
 * ※20150923	アプローチリストとの紐付けはIDで行わないとrelation_idでは登録時に部署拠点を一意に特定出来ない事が解った
 * ==========================================================
 * @param unknown $companyDict
 * @param unknown $approachTargetDict
 * @param unknown $clientDbApproachTargetDao
 */
function checkOverlapCompanyAndRegist($newDb, $newClientId, $approachListId, $clientDbRelationId, $companyDict, $approachTargetDict, $clientDbCompanyDao, $clientDbApproachTargetDao, $clientDbHistoryDao, $clientDbTmpDao, $treeActionDao, $treeActionClientDbDao, $migrationDao, $fp){
	// 戻り値
	$approachTargetId = "";

	// その他情報、企業情報、部署・拠点又は個人情報を紐付けるユニークキーを作成する
	$uniqueId = Application_CommonUtil::getUniqueKey();
	// 判定に使用する企業名を設定する
	$convertedCompanyName = $companyDict["converted_company_name"];
	// 判定に使用する部署拠点を設定する
	$convertedBaseName = $approachTargetDict["converted_base_name"];
	// 判定に使用する企業名と部署拠点を設定する
	$companyAndBaseName = $approachTargetDict["company_and_base_name"];
	// 判定に使用する住所を設定する
	$convertedAddress = $approachTargetDict["converted_address"];

	// ================================
	// 重複情報取得
	// ================================
	// （企業名＋部署拠点名）とユーザー登録住所でデータ取得を行う
	$approachTarget = $clientDbApproachTargetDao->getClientDbApproachTargetByCompanyAndBaseNameAndConvertedAddress($companyAndBaseName, $convertedAddress);
	if($approachTarget){
		// =================================================================
		// ルール1-1
		// =================================================================
		// 企業情報を取得する
		$company = $clientDbCompanyDao->getClientDbCompanyByRelationId($approachTarget["relation_id"]);
		
		// 履歴登録SQLを作成
		$sql = getCompanyHistorySql($company, $companyDict, $clientDbHistoryDao);
		fwrite($fp, $sql);
		//$newDb->query($sql);
		$sql = getApproachTargetHistorySql($approachTarget, $approachTargetDict, $clientDbHistoryDao, $migrationDao);
		fwrite($fp, $sql);
		//$newDb->query($sql);
		
		// 同じファイル内で直接INSERT後にファイルでUPDATEするとエラーになるので処理を分岐させる
		$clientDbCompanySql = registOrSqlStrByCompany($newDb, $companyDict, $company, "migration_result_company_id_{$newClientId}", $clientDbCompanyDao);
		if($clientDbCompanySql != ""){
			//fwrite($fp, $clientDbCompanySql);
			$newDb->query($clientDbCompanySql);
		}
		$clientDbApproachTargetSql = registOrSqlStrByApproachTarget($newDb, $approachTargetDict, $approachTarget, "migration_result_approach_target_id_{$newClientId}", $migrationDao);
		if($clientDbApproachTargetSql != ""){
			//fwrite($fp, $clientDbApproachTargetSql);
			$newDb->query($clientDbApproachTargetSql);
		}
		// ツリー登録SQLを取得する
		$sql = getApproachListTreeSql($newDb, $approachListId, $approachTarget["id"], "migration_result_tree_approach_target_id_{$newClientId}", $treeActionDao);
		if($sql != ""){
			//fwrite($fp, $sql);
			$newDb->query($sql);
		}

		// 戻り値の設定
		$approachTargetId = $approachTarget["id"];
	}else{
		// 企業名とユーザー登録住所でデータ取得
		$approachTarget = $clientDbApproachTargetDao->getClientDbApproachTargetByConvertedCompanyNameAndConvertedAddress($convertedCompanyName, $convertedAddress);
		if($approachTarget){
			// データが取得できた場合部署拠点名で比較する
			if($approachTarget["converted_base_name"] == $convertedBaseName){
				// =================================================================
				// ルール2-1
				// =================================================================
				// 企業情報を取得する
				$company = $clientDbCompanyDao->getClientDbCompanyByRelationId($approachTarget["relation_id"]);
				
				// 履歴登録SQLを作成
				$sql = getCompanyHistorySql($company, $companyDict, $clientDbHistoryDao);
				fwrite($fp, $sql);
				//$newDb->query($sql);
				$sql = getApproachTargetHistorySql($approachTarget, $approachTargetDict, $clientDbHistoryDao, $migrationDao);
				fwrite($fp, $sql);
				//$newDb->query($sql);

				// 同じファイル内で直接INSERT後にファイルでUPDATEするとエラーになるので処理を分岐させる
				$clientDbCompanySql = registOrSqlStrByCompany($newDb, $companyDict, $company, "migration_result_company_id_{$newClientId}", $clientDbCompanyDao);
				if($clientDbCompanySql != ""){
					//fwrite($fp, $clientDbCompanySql);
					$newDb->query($clientDbCompanySql);
				}
				$clientDbApproachTargetSql = registOrSqlStrByApproachTarget($newDb, $approachTargetDict, $approachTarget, "migration_result_approach_target_id_{$newClientId}", $migrationDao);
				if($clientDbApproachTargetSql != ""){
					//fwrite($fp, $clientDbApproachTargetSql);
					$newDb->query($clientDbApproachTargetSql);
				}

				// ツリー登録SQLを取得する
				$sql = getApproachListTreeSql($newDb, $approachListId, $approachTarget["id"], "migration_result_tree_approach_target_id_{$newClientId}", $treeActionDao);
				if($sql != ""){
					//fwrite($fp, $sql);
					$newDb->query($sql);
				}
				// 戻り値の設定
				$approachTargetId = $approachTarget["id"];
			}else{
				// =================================================================
				// ルール2-2
				// =================================================================
				// 企業情報を取得する
				$company = $clientDbCompanyDao->getClientDbCompanyByRelationId($approachTarget["relation_id"]);
				
				// 履歴登録SQLを作成
				$sql = getCompanyHistorySql($company, $companyDict, $clientDbHistoryDao);
				fwrite($fp, $sql);
				//$newDb->query($sql);
				$sql = getApproachTargetHistorySql($approachTarget, $approachTargetDict, $clientDbHistoryDao, $migrationDao);
				fwrite($fp, $sql);
				//$newDb->query($sql);
				
				// 同じファイル内で直接INSERT後にファイルでUPDATEするとエラーになるので処理を分岐させる
				$clientDbCompanySql = registOrSqlStrByCompany($newDb, $companyDict, $company, "migration_result_company_id_{$newClientId}", $clientDbCompanyDao);
				if($clientDbCompanySql != ""){
					//fwrite($fp, $clientDbCompanySql);
					$newDb->query($clientDbCompanySql);
				}
				// 登録SQLを作成
				$approachTargetDict["relation_id"] = $approachTarget["relation_id"];
					
				// アプローチリストとの紐付けにIDが必要なので新規作成時は部署拠点のみINSERTする
				$clientDbApproachTargetId = $migrationDao->migrationClientDbApproachTargetRegist($approachTargetDict);
					
				// ツリー登録SQLを取得する
				$sql = getApproachListTreeSql($newDb, $approachListId, $clientDbApproachTargetId, "migration_result_tree_approach_target_id_{$newClientId}", $treeActionDao);
				if($sql != ""){
					//fwrite($fp, $sql);
					$newDb->query($sql);
				}
				// consumer_listの場合のみ登録
				if($clientDbRelationId != ""){
					$sql = $treeActionClientDbDao->getClientDbTreeSql($approachTarget["relation_id"], $clientDbRelationId);
					if($sql != ""){
						fwrite($fp, $sql);
						//$newDb->query($sql);
					}
				}
				// 戻り値の設定
				$approachTargetId = $clientDbApproachTargetId;
			}
		}else{
			// 企業名でデータ取得
			$company = $clientDbCompanyDao->getClientDbCompanyByConvertedCompany($convertedCompanyName);
			if($company){
				// =================================================================
				// ルール3-1
				// =================================================================
				// tmp同士を紐付ける為のID設定
				$companyDict["relation_id"] = $uniqueId;
				$approachTargetDict["relation_id"] = $uniqueId;
				// $clientDbRelationIdが存在しない場合は架電結果からの登録なので、保留企業には出来ず、必ず新規作成になる
				// 登録処理
				$clientDbCompanyId = $clientDbCompanyDao->regist($companyDict);
				// アプローチリストとの紐付けにIDが必要なので新規作成時は部署拠点のみINSERTする
				$clientDbApproachTargetId = $migrationDao->migrationClientDbApproachTargetRegist($approachTargetDict);
				// ツリー登録SQLを取得する
				$sql = getApproachListTreeSql($newDb, $approachListId, $clientDbApproachTargetId, "migration_result_tree_approach_target_id_{$newClientId}", $treeActionDao);
				if($sql != ""){
					//fwrite($fp, $sql);
					$newDb->query($sql);
				}
				$sql = $treeActionClientDbDao->getClientDbTreeSql($uniqueId, $clientDbRelationId);
				if($sql != ""){
					fwrite($fp, $sql);
					//$newDb->query($sql);
				}
				// 直接insertしたIDを保存する
				setMigrationResultId($newDb, "migration_result_company_id_{$newClientId}", $clientDbCompanyId);
				setMigrationResultId($newDb, "migration_result_approach_target_id_{$newClientId}", $clientDbApproachTargetId);
				// 戻り値の設定
				$approachTargetId = $clientDbApproachTargetId;
			}else{
				// =================================================================
				// ルール4-1
				// =================================================================
				// 企業と部署を紐付ける為のID設定
				$companyDict["relation_id"] = $uniqueId;
				$approachTargetDict["relation_id"] = $uniqueId;
				// 登録処理
				$clientDbCompanyId = $clientDbCompanyDao->regist($companyDict);
				// アプローチリストとの紐付けにIDが必要なので新規作成時は部署拠点のみINSERTする
				$clientDbApproachTargetId = $migrationDao->migrationClientDbApproachTargetRegist($approachTargetDict);
				// ツリー登録SQLを取得する
				$sql = getApproachListTreeSql($newDb, $approachListId, $clientDbApproachTargetId, "migration_result_tree_approach_target_id_{$newClientId}", $treeActionDao);
				if($sql != ""){
					//fwrite($fp, $sql);
					$newDb->query($sql);
				}
				// consumer_listの場合のみ登録
				$sql = $treeActionClientDbDao->getClientDbTreeSql($uniqueId, $clientDbRelationId);
				if($sql != ""){
					fwrite($fp, $sql);
					//$newDb->query($sql);
				}
				// 直接insertしたIDを保存する
				setMigrationResultId($newDb, "migration_result_company_id_{$newClientId}", $clientDbCompanyId);
				setMigrationResultId($newDb, "migration_result_approach_target_id_{$newClientId}", $clientDbApproachTargetId);
				// 戻り値の設定
				$approachTargetId = $clientDbApproachTargetId;
			}
		}
	}
	return $approachTargetId;
}

/**
 * 架電結果を移行する
 * @param unknown $newClientId
 * @param unknown $approachTargetId
 * @param unknown $consumer
 * @param unknown $newDb
 */
function resultTelephoneMigration($newClientId, $currentClientId, $approachTargetId, $approachListId, $result, $companyDict, $approachTargetDict, $newDb, $currentDb, $migrationDao, $treeActionDao, $forbiddenApproachDao, $forbiddenAndApproachTargetRelationDao){

	// 架電結果の台本名を取得し、存在すれば整形する
	$sql = "select id FROM talk_bind WHERE talk_script_name = '{$result["result_consumerscript"]}' AND client_id = {$currentClientId};";
	$stm = $currentDb->query($sql);
	$talkBind =$stm->fetch();
	$talkBindId = new Zend_Db_Expr('NULL');
	if($talkBind){
		$talkBindId = $talkBind["id"];
	}
	// 掛け直し日時が存在すればtimestampからdateに変換する
	$againTime = new Zend_Db_Expr('NULL');
	if($result["result_again_time"] && $result["result_again_time"] != "0000-00-00 00:00:00"){
		$againTime = date("Y-m-d H:i:s" , strtotime($result["result_again_time"]));
	}

	// 架電結果の変換を行う
	$newTelStatus = convTelStatus($result["result_status"]);

	// 架電者名の変換を行う
	$telStaffName = "移行用デフォルト設定";
	if($result["result_clerk"]){
		$telStaffName = $result["result_clerk"];
	}
	
	// 架電時間を変換する
	$resultTime = new Zend_Db_Expr('now()');
	if($result["result_time"] && $result["result_time"] != "0000-00-00 00:00:00"){
		$resultTime = date("Y-m-d H:i:s" , strtotime($result["result_time"]));
	}
	
	// メモテンプレートIDの変換
	$templateResultMemoId = new Zend_Db_Expr('NULL');
	if($result["result_templateid"] != ""){
		$templateResultMemoId = $migrationDao->getConvertResultTemplateId($result["result_templateid"]);
	}

	// 登録用変数の変数宣言
	$resultTelephone = array();
	$resultTelephone["client_id"] = $newClientId;
	$resultTelephone["approach_list_id"] = $approachListId;
	$resultTelephone["approach_target_id"] = $approachTargetId;
	$resultTelephone["company_name"] = $companyDict["name"];
	$resultTelephone["base_name"] = $approachTargetDict["base_name"];
	$resultTelephone["person_name"] = $approachTargetDict["person_name"];
	$resultTelephone["approach_target_tel"] = $approachTargetDict["tel"];
	$resultTelephone["tel_status"] = $newTelStatus;
	$resultTelephone["tel_time"] = $resultTime;
	$resultTelephone["talk_bind_id"] = $talkBindId;
	$resultTelephone["talk_script_name"] = $result["result_consumerscript"];
	$resultTelephone["again"] = $result["result_again"];
	$resultTelephone["again_time"] = $againTime;
	$resultTelephone["forbidden_flg"] = $result["result_forbid"];
	$resultTelephone["template_result_memo_id"] = $templateResultMemoId;
	$resultTelephone["note"] = $result["result_note"];
	$resultTelephone["call_division_name"] = $result["result_call_division_name"];
	$resultTelephone["tel_staff_name"] = $telStaffName;
	$resultTelephone["mp3_url"] = $result["result_mp3_url"];
	$resultTelephone["mp3_del"] = "0";
	$resultTelephone["webphone_id"] = $result["result_webphone_id"];
	$resultTelephone["talk_time"] = "0";
	$resultTelephone["create_staff_type"] = $result["user_type"];
	$resultTelephone["create_staff_id"] = $result["result_staffid"];
	$resultTelephone["update_staff_type"] = $result["user_type"];
	$resultTelephone["update_staff_id"] = $result["result_staffid"];
	$resultTelephone["old_id"] = $result["result_id"];

	// 架電結果の登録
	$resultTelphoneId = $migrationDao->registMigrationByResultTelephone($resultTelephone);

	// treeテーブルにデータ登録
	$approachType = 1;
	$treeActionDict = array();
	$treeActionDict["id"] = $approachTargetId;
	$treeActionDict["type"] = 4;
	$treeActionDict["name"] = "架電結果";
	$treeActionDict["actiontime"] = $resultTime;
	$treeActionDict["comment"] = "クライアントID.アプローチリストID.コンシューマーID.架電種別.架電結果テンプレートID.架電ID";
	$treeActionDict["path"] = "{$newClientId}.{$approachListId}.{$approachTargetId}.{$approachType}.{$newTelStatus}.{$resultTelphoneId}";
	$migrationDao->setResultTreeAction($treeActionDict);
	// アプローチリストのtreeに最終架電結果を追加する
	// [クライアントID.アプローチリストID.コンシューマーID]の形式を取得
	$wherePath = "{$newClientId}.{$approachListId}.{$approachTargetId}";
	$newPath = "{$newClientId}.{$approachListId}.{$approachTargetId}.{$approachType}.{$newTelStatus}.{$result["result_again"]}";
	$migrationDao->setLastApproachResult($wherePath, $newPath, $resultTime);
	return $resultTelphoneId;
}

/**
 * 
 * @param unknown $newClientId
 * @param unknown $currentClientId
 * @param unknown $approachTargetId
 * @param unknown $approachListId
 * @param unknown $consumerId
 * @param unknown $newDb
 * @param unknown $currentDb
 */
function invalidTelephoneMigration($newClientId, $currentClientId, $approachTargetId, $approachListId, $consumerId, $newDb, $currentDb){
	// DAOの宣言
	$forbiddenApproachDao = Application_CommonUtil::getInstance('dao', "ForbiddenApproachDao", $newDb);
	$forbiddenAndApproachTargetRelationDao = Application_CommonUtil::getInstance("dao", "ForbiddenAndApproachTargetRelationDao", $newDb);
	
	// 架電結果を元に作成された架電禁止データを取得する
	$sql = "SELECT * FROM invalid_telephone WHERE client_id = {$currentClientId} AND regist_consumer_id = {$consumerId} AND del_flg = 0;";
	$stm = $currentDb->query($sql);
	$invalidTelephones = $stm->fetchAll();
	foreach($invalidTelephones as $invalidTelephone){
		$convertedName = Application_CommonUtil::convertCommonString($invalidTelephone["name"]);
		
		// typeの変換
		if($invalidTelephone["regist_staff_type"] == "1"){
			$invalidTelephone["regist_staff_type"] = "AA";
		}else if($invalidTelephone["regist_staff_type"] == "2"){
			$invalidTelephone["regist_staff_type"] = "CE";
		}else{
			$invalidTelephone["regist_staff_type"] = "TA";
		}
		if($invalidTelephone["update_staff_type"] == "1"){
			$invalidTelephone["update_staff_type"] = "AA";
		}else if($invalidTelephone["update_staff_type"] == "2"){
			$invalidTelephone["update_staff_type"] = "CE";
		}else{
			$invalidTelephone["update_staff_type"] = "TA";
		}
		
		// 架電禁止を登録する
		$forbiddenApproachDict = array();
		$forbiddenApproachDict["client_id"]						= $newClientId;
		$forbiddenApproachDict["name"]							= $invalidTelephone["name"];
		$forbiddenApproachDict["converted_name"]				= $convertedName;
		$forbiddenApproachDict["tel"]							= $invalidTelephone["tel"];
		$forbiddenApproachDict["tel_only_numbers"]				= $invalidTelephone["number_format_tel"];
		$forbiddenApproachDict["mail"]							= $invalidTelephone["mail"];
		$forbiddenApproachDict["reason"]						= $invalidTelephone["reason"];
		$forbiddenApproachDict["remarks"]						= $invalidTelephone["remarks"];
		$forbiddenApproachDict["appoint_flg"]					= $invalidTelephone["appoint_flg"];
		$forbiddenApproachDict["invalid_flg"]					= $invalidTelephone["invalid_flg"];
		$forbiddenApproachDict["regist_approach_list_id"]		= $approachListId;
		$forbiddenApproachDict["regist_approach_target_id"]		= $approachTargetId;
		$forbiddenApproachDict["regist_staff_type"]				= $invalidTelephone["regist_staff_type"];
		$forbiddenApproachDict["regist_staff_id"]				= $invalidTelephone["regist_staff_id"];
		$forbiddenApproachDict["update_staff_type"]				= $invalidTelephone["update_staff_type"];
		$forbiddenApproachDict["update_staff_id"]				= $invalidTelephone["update_staff_id"];
		$forbiddenApproachDict["create_date"]					= $invalidTelephone["create_time"];
		$forbiddenApproachDict["update_date"]					= $invalidTelephone["update_time"];
		$forbiddenApproachDict["old_id"]						= $invalidTelephone["id"];
		$forbiddenApproachId = $forbiddenApproachDao->migrationRegist($forbiddenApproachDict);
	}
	// 解放処理
	unset($invalidTelephones);
}

/**
 * アプローチ禁止を登録する
 * @param unknown $approachTarget		アプローチターゲット
 * @param unknown $resultTelephoneDict	架電登録情報
 * @return unknown
 */
function registForbiddenApproach($newClientId, $approachTargetId, $companyDict, $approachTarget, $resultTelephone, $newTelStatus, $approachListId, $forbiddenApproachDao){
	$name = "";
	$convertedName = "";
	if($companyDict["name"] != ""){
		$name = $companyDict["name"];
		$convertedName = $companyDict["converted_name"];
	}else{
		$name = $approachTarget["person_name"];
		$convertedName = Application_CommonUtil::convertCommonString($approachTarget["person_name"]);
	}
	$reason = "";
	$appointFlg = "0";
	if($newTelStatus == "6"){
		$reason = "アポイント取得";
		$appointFlg = "1";
	}else{
		$reason = $resultTelephone["note"];
	}

	$forbiddenApproachDict = array();
	$forbiddenApproachDict["client_id"]						= $newClientId;
	$forbiddenApproachDict["name"]							= $name;
	$forbiddenApproachDict["converted_name"]				= $convertedName;
	$forbiddenApproachDict["tel"]							= $approachTarget["tel"];
	$forbiddenApproachDict["tel_only_numbers"]				= $approachTarget["tel_only_numbers"];
	$forbiddenApproachDict["mail"]							= $approachTarget["mail"];
	$forbiddenApproachDict["reason"]						= $reason;
	$forbiddenApproachDict["remarks"]						= "";
	$forbiddenApproachDict["appoint_flg"]					= $appointFlg;
	$forbiddenApproachDict["invalid_flg"]					= "0";
	$forbiddenApproachDict["regist_approach_list_id"]		= $approachListId;
	$forbiddenApproachDict["regist_approach_target_id"]		= $approachTargetId;
	$forbiddenApproachDict["staff_type"]					= "AA";
	$forbiddenApproachDict["staff_id"]						= "1";
	$forbiddenApproachId = $forbiddenApproachDao->regist($forbiddenApproachDict);
	return $forbiddenApproachId;
}

/**
 * 資料送付の移行を行う
 * @param unknown $newClientId
 * @param unknown $approachListId
 * @param unknown $approachTargetId
 * @param unknown $resultTelphoneId
 * @param unknown $consumer
 * @param unknown $newDb
 */
function sendMigration($newClientId, $approachListId, $approachTargetId, $resultTelphoneId, $consumer, $result, $newDb){
	// DAOの宣言
	$migrationDao = Application_CommonUtil::getInstance("dao", "MigrationDao", $newDb);
	// 日付の値を設定
	if($consumer["send_completion_date"] == ""){
		$consumer["send_completion_date"] = new Zend_Db_Expr('NULL');
	}
	// 資料送付状況レベルを設定
	$situation = new Zend_Db_Expr('NULL');
	if($consumer["send_situation"] != ""){
		// 資料送付方法のIDを新しいIDに変換する
		$situation = $migrationDao->getConvertSendSituation($consumer["send_situation"]);
	}
	// 資料送付方法を設定
	$method = new Zend_Db_Expr('NULL');
	if($consumer["send_method"] != ""){
		// 資料送付方法のIDを新しいIDに変換する
		$method = $migrationDao->getConvertSendMethod($consumer["send_method"]); 
	}
	// 資料送付登録データ生成
	$sendDict = array();
	$sendDict["client_id"]				= $newClientId;
	$sendDict["approach_list_id"]		= $approachListId;
	$sendDict["approach_target_id"]		= $approachTargetId;
	$sendDict["result_telephone_id"]	= $resultTelphoneId;
	$sendDict["status"]					= $consumer["send_status"];
	$sendDict["reception_date"]			= $consumer["send_reception_date"];
	$sendDict["completion_date"]		= $consumer["send_completion_date"];
	$sendDict["situation"]				= $situation;
	$sendDict["method"]					= $method;
	$sendDict["address"]				= $consumer["send_address"];
	$sendDict["division_name"]			= $consumer["send_division_name"];
	$sendDict["responsible_staff_name"]	= $consumer["send_name"];
	$sendDict["responsible_staff_kana"]	= $consumer["send_kana"];
	$sendDict["gender"]					= $consumer["send_gender"];
	$sendDict["remarks"]				= $consumer["send_remarks"];
	$sendDict["create_staff_type"]		= $result["user_type"];
	$sendDict["create_staff_id"]		= $result["result_staffid"];
	$sendDict["update_staff_type"]		= $result["user_type"];
	$sendDict["update_staff_id"]		= $result["result_staffid"];
	$sendDict["create_date"]			= date('Y-m-d H:i:s', strtotime($consumer["create_time"]));
	$sendDict["update_date"]			= date('Y-m-d H:i:s', strtotime($consumer["update_time"]));
	$sendDict["del_flg"]				= "0";
	$sendDict["old_id"]					= $consumer["send_id"];
	$migrationDao->sendRegist($sendDict);
}

/**
 * アポイントの移行を行う
 * @param unknown $newClientId
 * @param unknown $approachListId
 * @param unknown $approachTargetId
 * @param unknown $resultTelephoneId
 * @param unknown $consumer
 * @param unknown $newDb
 */
function appointMigration($newClientId, $approachListId, $approachTargetId, $resultTelephoneId, $consumer, $result, $newDb){
	// DAOの宣言
	$migrationDao = Application_CommonUtil::getInstance("dao", "MigrationDao", $newDb);

	// アポイント状況レベルを設定
	$situation = new Zend_Db_Expr('NULL');
	if($consumer["appoint_jokyo"] != ""){
		// アポイント状況レベルのIDを新しいIDに変換する
		$situation = $migrationDao->getConvertAppointSituation($consumer["appoint_jokyo"]);
	}
	
	// アポイント登録データ生成
	$appointDict = array();
	$appointDict["client_id"]				= $newClientId;
	$appointDict["approach_list_id"]		= $approachListId;
	$appointDict["approach_target_id"]		= $approachTargetId;
	$appointDict["result_telephone_id"]		= $resultTelephoneId;
	$appointDict["approach_target_tel"]		= $consumer["tel"];
	$appointDict["approach_target_name"]	= $consumer["appoint_consumername"];
	$appointDict["time"]					= $consumer["appoint_time"];
	$appointDict["mail_status"]				= $consumer["appoint_mail_status"];
	$appointDict["situation"]				= $situation;
	$appointDict["clerk_department"]		= $consumer["appoint_clerkdepartment"];
	$appointDict["responsible_staff_name"]	= $consumer["appoint_projectheader"];
	$appointDict["responsible_staff_kana"]	= $consumer["appoint_kana"];
	$appointDict["client_staff_id"]			= $consumer["appoint_clientstaffseq"];
	$appointDict["gender"]					= $consumer["appoint_gender"];;
	$appointDict["memo"]					= $consumer["memo"];
	$appointDict["description"]				= $consumer["appoint_description"];
	$appointDict["create_staff_type"]		= $result["user_type"];
	$appointDict["create_staff_id"]			= $result["result_staffid"];
	$appointDict["update_staff_type"]		= $result["user_type"];
	$appointDict["update_staff_id"]			= $result["result_staffid"];
	$appointDict["create_date"]				= $consumer["appoint_created"];
	$appointDict["update_date"]				= $consumer["appoint_updated"];
	$appointDict["del_flg"]					= "0";
	$appointDict["old_id"]					= $consumer["appoint_id"];
	$migrationDao->appointRegist($appointDict);

}

/**
 * 変換前と後のIDを検索する
 * @param unknown $db
 * @param unknown $consumerId
 * @param unknown $approachTargetId
 * @return unknown
 */
function getMigrationConvertId($db, $newClientId, $consumerId, $approachTargetId){
	$sql = "SELECT consumer_id, approach_target_id FROM migration_convert_id_{$newClientId} WHERE consumer_id = {$consumerId} AND approach_target_id = {$approachTargetId};";
	$stm = $db->query($sql);
	$row = $stm->fetch();
	return $row;
}

/**
 * 変換前と後のIDを登録する
 * @param unknown $db
 * @param unknown $tableName
 * @param unknown $id
 */
function setMigrationConvertId($db, $newClientId, $consumerId, $approachTargetId){
	$sql = "INSERT INTO migration_convert_id_{$newClientId} (consumer_id, approach_target_id) VALUES ({$consumerId}, {$approachTargetId});";
	$db->query($sql);
	return;
}

/*
 * StaffAndConsumerの移行
 *
 */
function migrateStaffAndConsumer($migrationDao, $currentDb, $consumer_id, $approachTargetId, $approachListId, $newClientId){

	$convertTypeArray=array( 1=>"AA", 2=>"CE", 3=>"TA");

	$sql = "SELECT * FROM staffandconsumer WHERE staffandconsumer_consumerid = {$consumer_id} AND staffandconsumer_del_flg = 0;";

	$stm = $currentDb->query($sql);
	$staffandconsumerList = $stm->fetchAll();

	foreach ($staffandconsumerList as $staffandconsumer) {

		$staffandconsumerData = array(
			"client_id" => $newClientId,
			"staff_id" => $staffandconsumer["staffandconsumer_staffid"],
			"approach_list_id" => $approachListId,
			"approach_target_id" => $approachTargetId,
			"staff_type" => $convertTypeArray[$staffandconsumer["staffandconsumer_staff_type"]],
			"comment" => $staffandconsumer["staffandconsumer_comment"],
			"create_date" => $staffandconsumer["staffandconsumer_regist_dt"]
		);

		$migrationDao->mylistRegist($staffandconsumerData);
	}


}