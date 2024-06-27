<?php
require_once 'CommonMigration.php';		// DBの接続や共通関数をまとめたファイル

/**
 * クライアントIDを指定し最低限のデータ移行を行う
 * @var unknown_type
 */
try{
	debugMeg("ConsumerListMigration_begin");
	
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
		$consumerRelationMasterId = $argv[3];
		$clientDbRelationId = $argv[4];
		$approachListId = $argv[5];
		$limit = $argv[6];
		$offset = $argv[7];
		// DB名にクライアントIDが付くのでセッションに設定する
		Zend_Registry::set('user', array("staff_type"=>"AA", "staff_id"=>"1", "client_id"=>$newClientId));
		
		// DAOは関数内で宣言し、引数の数を減らす
		$clientDbCompanyDao = Application_CommonUtil::getInstance('dao', "ClientDbCompanyDao", $newDb);
		$clientDbApproachTargetDao = Application_CommonUtil::getInstance('dao', "ClientDbApproachTargetDao", $newDb);
		$clientDbHistoryDao = Application_CommonUtil::getInstance('dao', "ClientDbHistoryDao", $newDb);
		$clientDbTmpDao = Application_CommonUtil::getInstance('dao', "ClientDbTmpDao", $newDb);
		$treeActionDao = Application_CommonUtil::getInstance('dao',"TreeActionDao", $newDb);
		$treeActionClientDbDao = Application_CommonUtil::getInstance('dao',"TreeActionClientDbDao", $newDb);
		
		// 大量のSQLを実行するためにファイルオブジェクトを生成する
		$fp = createFileObject($newClientId);
		
		$sql = "SELECT * FROM consumer_list WHERE client_id = {$currentClientId} AND consumer_relation_master_id = {$consumerRelationMasterId} AND invalid_flg = 0 AND del_flg = 0 ORDER BY id LIMIT {$limit} OFFSET {$offset};";
		$stm = $currentDb->query($sql);
		$consumerList = $stm->fetchAll();
		
		foreach($consumerList as $consumer){
			// 企業情報と部署拠点情報に分割する
			$companyDict = getCompanyDict($consumer, $splitPatterns);
			$approachTargetDict = getApproachTargetDict($consumer, $companyDict);
			try{
				// 重複チェックを行いつつデータ移行を行う
				checkOverlapCompanyAndRegist($newDb, $newClientId, $approachListId, $clientDbRelationId, $companyDict, $approachTargetDict, $fp, $clientDbCompanyDao, $clientDbApproachTargetDao, $clientDbHistoryDao, $clientDbTmpDao, $treeActionDao, $treeActionClientDbDao);
			}catch (Exception $e){
				error_log(json_encode($companyDict));
				error_log("");
				error_log(json_encode($approachTargetDict));
				error_log("");
				error_log($e->getMessage());
				exit;
			}
		}
		$newDb->commit();
		
		// ファイルを閉じる
		fclose($fp);
		
		// 解放処理
		unset($consumerList);
		unset($currentDb);
		unset($newDb);
		unset($splitPatterns);
		
		unset($clientDbCompanyDao);
		unset($clientDbApproachTargetDao);
		unset($clientDbHistoryDao);
		unset($clientDbTmpDao);
		unset($treeActionDao);
		unset($treeActionClientDbDao);
		
		// メモリー状況を表示
		debugMemory();
		
		$result = json_encode(array("companyIds"=>array(), "approachTargetIds"=>array(), "treeApproachTargetIds"=>array()));
		echo $result;
	}catch(Exception $e){
		$newDb->rollBack();
		throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
	}
		
	debugMeg("ConsumerListMigration_end");
}
catch (Exception $err){
	debugMeg("想定外の例外：".$err->getMessage());
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
function checkOverlapCompanyAndRegist($newDb, $newClientId, $approachListId, $clientDbRelationId, $companyDict, $approachTargetDict, $fp, $clientDbCompanyDao, $clientDbApproachTargetDao, $clientDbHistoryDao, $clientDbTmpDao, $treeActionDao, $treeActionClientDbDao){
	
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
		$sql = getApproachTargetHistorySql($approachTarget, $approachTargetDict, $clientDbHistoryDao);
		fwrite($fp, $sql);
		//$newDb->query($sql);
			
		// 同じファイル内で直接INSERT後にファイルでUPDATEするとエラーになるので処理を分岐させる
		$clientDbCompanySql = registOrSqlStrByCompany($newDb, $companyDict, $company, "migration_consumer_company_id", $clientDbCompanyDao);
		if($clientDbCompanySql != ""){
			fwrite($fp, $clientDbCompanySql);
			//$newDb->query($clientDbCompanySql);
		}
		$clientDbApproachTargetSql = registOrSqlStrByApproachTarget($newDb, $approachTargetDict, $approachTarget, "migration_consumer_approach_target_id", $clientDbApproachTargetDao);
		if($clientDbApproachTargetSql != ""){
			fwrite($fp, $clientDbApproachTargetSql);
			//$newDb->query($clientDbApproachTargetSql);
		}
		// ツリー登録SQLを取得する
		$sql = getApproachListTreeSql($newDb, $approachListId, $approachTarget["id"], "migration_consumer_tree_approach_target_id", $treeActionDao);
		if($sql != ""){
			fwrite($fp, $sql);
			//$newDb->query($sql);
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
				$sql = getApproachTargetHistorySql($approachTarget, $approachTargetDict, $clientDbHistoryDao);
				fwrite($fp, $sql);
				//$newDb->query($sql);

				// 同じファイル内で直接INSERT後にファイルでUPDATEするとエラーになるので処理を分岐させる
				$clientDbCompanySql = registOrSqlStrByCompany($newDb, $companyDict, $company, "migration_consumer_company_id", $clientDbCompanyDao);
				if($clientDbCompanySql != ""){
					fwrite($fp, $clientDbCompanySql);
					//$newDb->query($clientDbCompanySql);
				}
				$clientDbApproachTargetSql = registOrSqlStrByApproachTarget($newDb, $approachTargetDict, $approachTarget, "migration_consumer_approach_target_id", $clientDbApproachTargetDao);
				if($clientDbApproachTargetSql != ""){
					fwrite($fp, $clientDbApproachTargetSql);
					//$newDb->query($clientDbApproachTargetSql);
				}

				// ツリー登録SQLを取得する
				$sql = getApproachListTreeSql($newDb, $approachListId, $approachTarget["id"], "migration_consumer_tree_approach_target_id", $treeActionDao);
				if($sql != ""){
					fwrite($fp, $sql);
					//$newDb->query($sql);
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
				$sql = getApproachTargetHistorySql($approachTarget, $approachTargetDict, $clientDbHistoryDao);
				fwrite($fp, $sql);
				//$newDb->query($sql);
					
				// 同じファイル内で直接INSERT後にファイルでUPDATEするとエラーになるので処理を分岐させる
				$clientDbCompanySql = registOrSqlStrByCompany($newDb, $companyDict, $company, "migration_consumer_company_id", $clientDbCompanyDao);
				if($clientDbCompanySql != ""){
					fwrite($fp, $clientDbCompanySql);
					//$newDb->query($clientDbCompanySql);
				}
				// 登録SQLを作成
				$approachTargetDict["relation_id"] = $approachTarget["relation_id"];
					
				// アプローチリストとの紐付けにIDが必要なので新規作成時は部署拠点のみINSERTする
				$clientDbApproachTargetId = $clientDbApproachTargetDao->regist($approachTargetDict);
					
				// ツリー登録SQLを取得する
				$sql = getApproachListTreeSql($newDb, $approachListId, $clientDbApproachTargetId, "migration_consumer_tree_approach_target_id", $treeActionDao);
				if($sql != ""){
					fwrite($fp, $sql);
					//$newDb->query($sql);
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
				if($clientDbRelationId != ""){
					// consumer_listを登録する場合は保留として登録する
					$companyDict["client_id"] = $newClientId;
					$approachTargetDict["client_id"] = $newClientId;
					// 登録SQLを作成
					$sql = $clientDbTmpDao->createClientDbTmpCompanyInsertSql($companyDict);
					fwrite($fp, $sql);
					//$newDb->query($sql);
					$sql = $clientDbTmpDao->createClientDbTmpApproachTargetInsertSql($approachTargetDict);
					fwrite($fp, $sql);
					//$newDb->query($sql);
					$sql = $treeActionClientDbDao->getClientDbTreeSql($uniqueId, $clientDbRelationId);
					if($sql != ""){
						fwrite($fp, $sql);
						//$newDb->query($sql);
					}
				}else{
					// $clientDbRelationIdが存在しない場合は架電結果からの登録なので、保留企業には出来ず、必ず新規作成になる
					// 登録処理
					$clientDbCompanyId = $clientDbCompanyDao->regist($companyDict);
					// アプローチリストとの紐付けにIDが必要なので新規作成時は部署拠点のみINSERTする
					$clientDbApproachTargetId = $clientDbApproachTargetDao->regist($approachTargetDict);
						
					// ツリー登録SQLを取得する
					$sql = getApproachListTreeSql($newDb, $approachListId, $clientDbApproachTargetId, "migration_consumer_tree_approach_target_id", $treeActionDao);
					if($sql != ""){
						fwrite($fp, $sql);
						//$newDb->query($sql);
					}
						
					// 直接insertしたIDを保存する
					setMigrationResultId($newDb, "migration_consumer_company_id", $clientDbCompanyId);
					setMigrationResultId($newDb, "migration_consumer_approach_target_id", $clientDbApproachTargetId);
						
					// 戻り値の設定
					$approachTargetId = $clientDbApproachTargetId;
				}
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
				$clientDbApproachTargetId = $clientDbApproachTargetDao->regist($approachTargetDict);

				// ツリー登録SQLを取得する
				$sql = getApproachListTreeSql($newDb, $approachListId, $clientDbApproachTargetId, "migration_consumer_tree_approach_target_id", $treeActionDao);
				if($sql != ""){
					fwrite($fp, $sql);
					//$newDb->query($sql);
				}
				// consumer_listの場合のみ登録
				if($clientDbRelationId != ""){
					$sql = $treeActionClientDbDao->getClientDbTreeSql($uniqueId, $clientDbRelationId);
					if($sql != ""){
						fwrite($fp, $sql);
						//$newDb->query($sql);
					}
				}
				// 直接insertしたIDを保存する
				setMigrationResultId($newDb, "migration_consumer_company_id", $clientDbCompanyId);
				setMigrationResultId($newDb, "migration_consumer_approach_target_id", $clientDbApproachTargetId);

				// 戻り値の設定
				$approachTargetId = $clientDbApproachTargetId;
			}
		}
	}
	return $approachTargetId;
}

