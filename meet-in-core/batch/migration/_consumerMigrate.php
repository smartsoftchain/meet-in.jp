<?php
/**
 * Created by PhpStorm.
 * User: matsuno.masahiro
 * Date: 2016/02/19
 * Time: 17:14
 */

// DB接続
include_once "./setting.php";

debugMeg("----Consumer Migration START----");

// データ移行に必要なDAOを宣言
$masterSplitNameDao = Application_CommonUtil::getInstance('dao',"MasterSplitNameDao", $destinationDb);
// 企業名から削除する文字列を取得する
$splitPatterns = array();
foreach($masterSplitNameDao->getSplitNameList() as $splitName){
    $splitPatterns[] = "/".preg_quote($splitName['name'])."/";
}

try{
    $clientIdList = getCurrentClientIdList($currentDb);


    foreach($clientIdList as $clientId){

        debugMeg("---- {$clientId} ----");

        // トランザクションスタート
        $destinationDb->beginTransaction();
        // データ移行を行うクライアントIDを設定
        $currentClientId = $clientId;
        // 現行のクライアントデータを取得する
        $currentClient = getCurrentClientRow($currentDb, $currentClientId);
        // DB名にクライアントIDが付くのでセッションに設定する
        Zend_Registry::set('user', array("staff_type"=>"AA", "staff_id"=>"1"));
        // クライアント情報を移行する
        $newClientId = clientMigration($currentClient, $destinationDb);
        // クライアントのサービス商品名を移行する
        $clientServiceId = clientServiceMigration($newClientId, $currentClientId, $destinationDb, $currentDb);
        // DB名にクライアントIDが付くのでセッションに設定する
        Zend_Registry::set('user', array("client_id"=>$newClientId));
        // デフォルトアプローチリストを作成する
        $approachListId = createApproachList($newClientId, $currentClient["client_name"], $clientServiceId, $destinationDb);
        // アプローチ先を移行する(consumer_list、consumer_status)// TODO ここだけ使う
        consumerRelationMasterMigration($currentClientId, $newClientId, $approachListId, $splitPatterns, $currentDb, $destinationDb);
        // 架電結果・資料送付・アポイント・consumer_statusを移行する //TODO これもつかっていいかもしれない
        resultMigration($currentClientId, $newClientId, $splitPatterns, $approachListId, $currentDb, $destinationDb);

        // 登録完了したらコミットする
        $destinationDb->commit();

    }
}catch(Exception $e){
    $destinationDb->rollBack();
    throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
}


debugMeg("----Consumer Migration END----");

// 以下マイグレーション関数****************************************

/**
 * 現行クライアントnoID一覧を取得してくる
 * @param unknown $db
 * @param unknown $clientId
 * @return unknown
 */
function getCurrentClientIdList($db){
    $sql = "SELECT
				client_id
			FROM
				client;";
    $stm = $db->query($sql);
    $row = $stm->fetchAll(PDO::FETCH_COLUMN);
    return $row;
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
				sum_span_type,
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
    // クライアントマスタDBを生成する todo すでにテーブルが有る場合エラーが出ている
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
        $consumerRelationMaster = $stm->fetch();
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
        $strCompanyIds = is_array($companyIds) ? join(",", $companyIds) : $companyIds;
        $strApproachTargetIds = is_array($approachTargetIds) ? join(",", $approachTargetIds) : $approachTargetIds;
        $strTreeApproachTargetIds = is_array($treeApproachTargetIds) ? join(",", $treeApproachTargetIds) : $treeApproachTargetIds;

        $resultJson = exec("php function/ConsumerListMigration.php {$currentClientId} {$newClientId} {$consumerRelationMasterId} {$approachListId} {$limit} {$offset} {$strCompanyIds} {$strApproachTargetIds} {$strTreeApproachTargetIds}", $out, $ret);
        $result = json_decode($resultJson, true);
        $companyIds = $result["companyIds"];
        $approachTargetIds = $result["approachTargetIds"];
        $treeApproachTargetIds = $result["treeApproachTargetIds"];

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
    $clientDbRelationDict["file_name"] = "";
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

// 		$resultJson = exec("php function/ResultMigration.php {$currentClientId} {$newClientId} {$approachListId} {$limit} {$offset} {$strCompanyIds} {$strApproachTargetIds} {$strTreeApproachTargetIds}", $out, $ret);
// 		$result = json_decode($resultJson, true);
// 		$companyIds = $result["companyIds"];
// 		$approachTargetIds = $result["approachTargetIds"];
// 		$treeApproachTargetIds = $result["treeApproachTargetIds"];

        $sql = "SELECT result_id, user_type, result_consumerid, result_projectid, result_consumertel, AES_DECRYPT(result_clerk,@key) AS result_clerk, result_status, result_time, result_teltimes, result_reservation, result_del_flg, result_consumername, result_consumerscript, result_clerkdepartment, result_projectheader, result_staffid, result_again, result_again_time, result_forbid, result_note, result_notedetail, result_clientid, result_caller, result_call_division_name, result_is_update, result_mp3_url, result_mp3_del, result_webphone_id FROM result WHERE result_clientid = {$currentClientId} AND result_del_flg = 0 ORDER BY result_time asc LIMIT {$limit} OFFSET {$offset};";
        $stm = $currentDb->query($sql);
        $resultList = $stm->fetchAll();
        foreach($resultList as $result){
            //error_log("result_consumerid:{$result["result_consumerid"]}");
            // 架電結果に紐付く企業・資料送付・アポイントを取得
            $sql = getConsumerSql($result["result_consumerid"], $currentClientId);
            $stm = $currentDb->query($sql);
            $consumer = $stm->fetch();
            // 企業情報と部署拠点情報に分割する
            $companyDict = getCompanyDict($consumer, $splitPatterns);
            $approachTargetDict = getApproachTargetDict($consumer, $companyDict);

            // 変更履歴を掛けるか判定するフラグを設定
            $historyFlg = false;
            if(!in_array($result["result_consumerid"], $consumerIds)){
                $historyFlg = true;
                $consumerIds[] = $result["result_consumerid"];
            }

            // 架電結果から登録の際は$clientDbRelationIdが取得できないので、空文字を設定しcheckOverlapCompanyAndRegistでは紐付け処理を行わない
            //$clientDbRelationId = "";
            try{
                // 架電結果に紐付くアプローチ先を重複チェックを行いつつデータ移行を行う
                $approachTargetId = checkOverlapCompanyAndRegist($newDb, $newClientId, $approachListId, $clientDbRelationId, $companyDict, $approachTargetDict, $companyIds, $approachTargetIds, $treeApproachTargetIds, $historyFlg);
            }catch (Exception $e){
                error_log(json_encode($companyDict));
                error_log("");
                error_log(json_encode($approachTargetDict));
                error_log("");
                error_log($e->getMessage());
                exit;
            }

            //error_log("[1]approachTargetId:{$approachTargetId}");


            // 架電結果の移行
            if(!empty($approachTargetId) AND !empty($approachListId)) {
                $resultTelephoneId = resultTelephoneMigration($newClientId, $currentClientId, $approachTargetId, $approachListId, $result, $companyDict, $approachTargetDict, $newDb, $currentDb);

                // 資料送付
                if (!is_null($consumer["send_id"]) && !empty($consumer["send_id"]) && !in_array($result["result_consumerid"], $sendConsumerIds)) {
                    sendMigration($newClientId, $approachListId, $approachTargetId, $resultTelephoneId, $consumer, $newDb);
                    $sendConsumerIds[] = $result["result_consumerid"];
                }
                // アポイントの移行
                if (!is_null($consumer["appoint_id"]) && !empty($consumer["appoint_id"]) && !in_array($result["result_consumerid"], $appointConsumerIds)) {
                    appointMigration($newClientId, $approachListId, $approachTargetId, $resultTelephoneId, $consumer, $newDb);
                    $appointConsumerIds[] = $result["result_consumerid"];
                }
            }
        }
        $getCount = $page * $limit;
        $page++;
    }
    debugMeg("result:end[{$resultCount["count"]}]");
}

/**
 * 現行の架電結果と新システムのデフォルト架電結果に差異があるので、一致させる
 * @param unknown $oldTelStatus
 */
function convTelStatus($oldTelStatus){
    $newTelStatus = "";
    if($oldTelStatus == "0"){
        $newTelStatus = "7";
    }elseif($oldTelStatus == "1"){
        $newTelStatus = "1";
    }elseif($oldTelStatus == "2"){
        $newTelStatus = "2";
    }elseif($oldTelStatus == "3"){
        $newTelStatus = "4";
    }elseif($oldTelStatus == "4"){
        $newTelStatus = "5";
    }elseif($oldTelStatus == "5"){
        $newTelStatus = "6";
    }elseif($oldTelStatus == "6"){
        $newTelStatus = "3";
    }elseif($oldTelStatus == "7"){
        $newTelStatus = "8";
    }
    return $newTelStatus;
}

/**
 * 架電結果を移行する
 * @param unknown $newClientId
 * @param unknown $approachTargetId
 * @param unknown $consumer
 * @param unknown $newDb
 */
function resultTelephoneMigration($newClientId, $currentClientId, $approachTargetId, $approachListId, $result, $companyDict, $approachTargetDict, $newDb, $currentDb){
    // DAOを宣言
    $resultTelephoneDao = Application_CommonUtil::getInstance("dao", "ResultTelephoneDao", $newDb);
    $treeActionDao = Application_CommonUtil::getInstance("dao", "TreeActionDao", $newDb);
    $forbiddenApproachDao = Application_CommonUtil::getInstance('dao', "ForbiddenApproachDao", $newDb);
    $forbiddenAndApproachTargetRelationDao = Application_CommonUtil::getInstance("dao", "ForbiddenAndApproachTargetRelationDao", $newDb);

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
        $againTime = date("Y-m-d H:m:s" , strtotime($result["result_again_time"]));
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
        $resultTime = date("Y-m-d H:m:s" , strtotime($result["result_time"]));
    }
    //error_log("resultTime:{$resultTime}");

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
    $resultTelephone["template_result_memo_id"] = $result["result_templateid"];
    $resultTelephone["note"] = $result["result_note"];
    $resultTelephone["call_division_name"] = $result["result_call_division_name"];
    $resultTelephone["tel_staff_name"] = $telStaffName;
    $resultTelephone["mp3_url"] = $result["result_mp3_url"];
    $resultTelephone["mp3_del"] = "0";
    $resultTelephone["webphone_id"] = $result["result_webphone_id"];
    $resultTelephone["talk_time"] = "0";
    $resultTelephone["create_staff_type"] = "AA";
    $resultTelephone["create_staff_id"] = "1";
    $resultTelephone["update_staff_type"] = "AA";
    $resultTelephone["update_staff_id"] = "1";

    // 架電結果の登録
    $resultTelphoneId = $resultTelephoneDao->registMigration($resultTelephone);

    // treeテーブルにデータ登録
    $approachType = 1;
    $treeActionDict = array();
    $treeActionDict["id"] = $approachTargetId;
    $treeActionDict["type"] = 4;
    $treeActionDict["name"] = "架電結果";
    $treeActionDict["comment"] = "クライアントID.アプローチリストID.コンシューマーID.架電種別.架電結果テンプレートID.架電ID";
    $treeActionDict["path"] = "{$newClientId}.{$approachListId}.{$approachTargetId}.{$approachType}.{$newTelStatus}.{$resultTelphoneId}";
    $treeActionDao->setTreeAction($treeActionDict);
    // アプローチリストのtreeに最終架電結果を追加する
    // [クライアントID.アプローチリストID.コンシューマーID]の形式を取得
    $wherePath = "{$newClientId}.{$approachListId}.{$approachTargetId}";
    $newPath = "{$newClientId}.{$approachListId}.{$approachTargetId}.{$approachType}.{$newTelStatus}.{$result["result_again"]}";
    $treeActionDao->setLastApproachResult($wherePath, $newPath);

    // アプローチ禁止にチェックが入っている若しくは、架電結果がアポイントの場合はアプローチ禁止とする
    if($result["result_forbid"] == "1" || $newTelStatus == "6"){
        // 紐づきの為のアプローチ禁止ID
        $forbiddenApproachId = "";
        // 既にアプローチ禁止に登録されていないかチェックする
        $condition = " client_id = {$newClientId} AND regist_approach_list_id = {$approachListId} AND regist_approach_target_id = {$approachTargetId} AND appoint_flg = 1 ";
        $forbiddenApproach = $forbiddenApproachDao->getForbiddenApproachRow($condition);
        if(!$forbiddenApproach){
            // アプ禁が存在しない若しくはアプローチ禁止にチェックがある場合は登録する
            $forbiddenApproachId = registForbiddenApproach($newClientId, $approachTargetId, $companyDict, $approachTargetDict, $resultTelephone, $newTelStatus, $session->approach_list_id, $forbiddenApproachDao);
        }else{
            $forbiddenApproachId = $forbiddenApproach["id"];
        }

        // アプローチターゲットとアプローチ禁止の紐付けを取得する
        $forbiddenAndApproachTargetRelation = $forbiddenAndApproachTargetRelationDao->getForbiddenAndApproachTargetRelationByPK($newClientId, $approachTargetId, $forbiddenApproachId);
        if(!$forbiddenAndApproachTargetRelation){
            // アプローチターゲットとアプローチ禁止の紐付けが存在しなければ登録する
            $registDict = array();
            $registDict["client_id"] = $newClientId;
            $registDict["approach_target_id"] = $approachTargetId;
            $registDict["forbidden_id"] = $forbiddenApproachId;
            $registDict["staff_type"] = "AA";
            $registDict["staff_id"] = "1";
            $forbiddenAndApproachTargetRelationDao->regist($registDict);
        }
    }
    return $resultTelphoneId;
}

/**
 * 企業履歴SQLを生成する
 * @param unknown $companyDict
 * @return NULL
 */
function getCompanyHistorySql($oldCompanyDict, $newCompanyDict, $clientDbHistoryDao){
    // 戻り値
    $result = "";
    // 履歴を作成する為に必要な情報を設定する
    $newCompanyDict["id"] = $oldCompanyDict["id"];
    $newCompanyDict["relation_id"] = $oldCompanyDict["relation_id"];
    if(!is_null($oldCompanyDict["master_db_company_id"])){
        $newCompanyDict["master_db_company_id"] = $oldCompanyDict["master_db_company_id"];
    }else{
        $oldCompanyDict["master_db_company_id"] = new Zend_Db_Expr('null');
    }
    // 更新企業の履歴が存在するか確認する
    $companyHistory = $clientDbHistoryDao->getHaveCompanyHistoryById($oldCompanyDict["id"]);
    if(!$companyHistory){
        // 履歴が１件も存在しない場合、１件目の履歴と次に変更する履歴を作成する
        $result = $clientDbHistoryDao->createClientDbCompanyHistoryInsertSql($oldCompanyDict);
        $result .= $clientDbHistoryDao->createClientDbCompanyHistoryInsertSql($newCompanyDict);
    }else{
        // 既に存在する場合、今回変更する履歴のみ作成する
        $result = $clientDbHistoryDao->createClientDbCompanyHistoryInsertSql($newCompanyDict);
    }
    return $result;
}

/**
 * 部署拠点又は個人情報の履歴SQLを生成する
 * @param unknown $oldCompanyDict
 * @param unknown $newCompanyDict
 * @param unknown $clientDbHistoryDao
 */
function getApproachTargetHistorySql($oldApproachTargetDict, $newApproachTargetDict, $clientDbHistoryDao){
    // 戻り値
    $result = "";
    // 履歴を作成する為に必要な情報を設定する
    $newApproachTargetDict["id"] = $oldApproachTargetDict["id"];
    $newApproachTargetDict["relation_id"] = $oldApproachTargetDict["relation_id"];
    if(!is_null($oldApproachTargetDict["master_db_approach_target_id"])){
        $newApproachTargetDict["master_db_approach_target_id"] = $oldApproachTargetDict["master_db_approach_target_id"];
    }else{
        $oldApproachTargetDict["master_db_approach_target_id"] = new Zend_Db_Expr('null');
    }
    // 更新企業の履歴が存在するか確認する
    $approachTargetHistory = $clientDbHistoryDao->getHaveApproachTargetHistoryById($oldApproachTargetDict["id"]);
    if(!$approachTargetHistory){
        // 履歴が１件も存在しない場合、１件目の履歴と次に変更する履歴を作成する
        $result = $clientDbHistoryDao->createClientDbApproachTargetHistoryInsertSql($oldApproachTargetDict);
        $result .= $clientDbHistoryDao->createClientDbApproachTargetHistoryInsertSql($newApproachTargetDict);
    }else{
        // 既に存在する場合、今回変更する履歴のみ作成する
        $result = $clientDbHistoryDao->createClientDbApproachTargetHistoryInsertSql($newApproachTargetDict);
    }
    return $result;
}

/**
 * 企業情報を直接登録するかSQL文を返す
 */
function registOrSqlStrByCompany($newCompanyDict, $oldCompanyDict, $companyIds, $clientDbCompanyDao){
    $clientDbCompanySql = "";
    $companyId = $oldCompanyDict["id"];
    $newCompanyDict = array_merge($oldCompanyDict, $newCompanyDict);
    if(in_array($companyId, $companyIds)){
        // 登録処理
        $clientDbCompanyDao->regist($newCompanyDict);
    }else{
        // 更新SQLを作成
        $clientDbCompanySql = $clientDbCompanyDao->createClientDbCompanyUpdateSql($newCompanyDict, $companyId);
    }
    return $clientDbCompanySql;
}

/**
 * 部署拠点・個人情報を直接登録するかSQL文を返す
 */
function registOrSqlStrByApproachTarget($newApproachTargetDict, $oldApproachTargetDict, $approachTargetIds, $clientDbApproachTargetDao){
    $clientDbApproachTargetSql = "";
    $approachTargetId = $oldApproachTargetDict["id"];
    $newApproachTargetDict = array_merge($oldApproachTargetDict, $newApproachTargetDict);
    if(in_array($approachTargetId, $approachTargetIds)){
        // 登録処理
        $clientDbApproachTargetDao->regist($newApproachTargetDict);
    }else{
        // 更新SQLを作成
        $clientDbApproachTargetSql = $clientDbApproachTargetDao->createClientDbApproachTargetUpdateSql($newApproachTargetDict, $approachTargetId);
    }
    return $clientDbApproachTargetSql;
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
function sendMigration($newClientId, $approachListId, $approachTargetId, $resultTelphoneId, $consumer, $newDb){
    // DAOの宣言
    $sendDao = Application_CommonUtil::getInstance("dao", "SendDao", $newDb);
    // 日付の値を設定
    if($sendResultTelephoneDict["send_completion_date"] == ""){
        $sendResultTelephoneDict["send_completion_date"] = new Zend_Db_Expr('NULL');
    }
    // 資料送付方法を設定
    $method = $sendResultTelephoneDict["send_method"];
    if($sendResultTelephoneDict["send_method"] == ""){
        $method = new Zend_Db_Expr('NULL');
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
    $sendDict["situation"]				= $consumer["send_situation"];
    $sendDict["method"]					= $method;
    $sendDict["address"]				= $consumer["send_address"];
    $sendDict["division_name"]			= $consumer["send_division_name"];
    $sendDict["responsible_staff_name"]	= $consumer["send_responsible_staff_name"];
    $sendDict["responsible_staff_kana"]	= $consumer["send_responsible_staff_kana"];
    $sendDict["gender"]					= $consumer["send_gender"];
    $sendDict["remarks"]				= $consumer["send_remarks"];
    $sendDict["create_staff_type"]		= "AA";
    $sendDict["create_staff_id"]		= "1";
    $sendDict["update_staff_type"]		= "AA";
    $sendDict["update_staff_id"]		= "1";
    $sendDict["del_flg"]				= "0";
    $sendDao->regist($sendDict);
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
function appointMigration($newClientId, $approachListId, $approachTargetId, $resultTelephoneId, $consumer, $newDb){
    // DAOの宣言
    $appointDao = Application_CommonUtil::getInstance("dao", "AppointDao", $newDb);

    // アプローチ先名の作成
    $approachTargetName = "";
    if($consumer["company_and_base_name"] != ""){
        $approachTargetName = $consumer["company_and_base_name"];
    }else{
        $approachTargetName = $consumer["person_name"];
    }
    // 訪問担当者IDの設定
    $clientStaffId = new Zend_Db_Expr('NULL');
    // TODO 移行対象なのでNULLを設定
// 	$clientStaffId = $appointResultTelephoneDict["visit_staff_id"];
// 	if($appointResultTelephoneDict["visit_staff_id"] == ""){
// 	}

    // アポイント登録データ生成
    $appointDict = array();
    $appointDict["client_id"]				= $newClientId;
    $appointDict["approach_list_id"]		= $approachListId;
    $appointDict["approach_target_id"]		= $approachTargetId;
    $appointDict["result_telephone_id"]		= $resultTelephoneId;
    $appointDict["approach_target_tel"]		= $consumer["tel"];
    $appointDict["approach_target_name"]	= $approachTargetName;
    $appointDict["time"]					= $consumer["appoint_time"];
    $appointDict["mail_status"]				= $consumer["appoint_mail_status"];
    $appointDict["situation"]				= $consumer["appoint_jokyo"];
    $appointDict["clerk_department"]		= $consumer["appoint_clerk_department"];
    $appointDict["responsible_staff_name"]	= $consumer["appoint_responsible_staff_name"];
    $appointDict["responsible_staff_kana"]	= $consumer["appoint_responsible_staff_kana"];
    $appointDict["client_staff_id"]			= $clientStaffId;
    $appointDict["gender"]					= $consumer["appoint_gender"];;
    $appointDict["memo"]					= $consumer["consumer_memo"];
    $appointDict["description"]				= $consumer["appoint_description"];
    $appointDict["create_staff_type"]		= "AA";
    $appointDict["create_staff_id"]			= "1";
    $appointDict["update_staff_type"]		= "AA";
    $appointDict["update_staff_id"]			= "1";
    $appointDict["del_flg"]					= "0";
    $appointDao->regist($appointDict);

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


/**
 * コンシューマーIDを指定してコンシューマーデータを取得する
 * @param unknown $consumerId
 */
function getConsumerSql($consumerId, $clientId){
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
				a.consumer_id = b.consumer_id AND
				a.consumer_id = {$consumerId} AND
				b.consumer_id = {$consumerId}
			INNER JOIN
				(
					SELECT
						*
					FROM
						project
					WHERE
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
						del_flg = 0
				) as f
			ON
				a.consumer_id = f.appoint_consumerid AND
				c.project_clientid = f.appoint_clientid AND
				c.project_id = f.appoint_projectid
			WHERE
				b.consumer_del_flg =0
	";
    return $sql;
}

/**
 * アプローチリストのtreeを生成する
 * @param unknown $approachListId
 * @param unknown $approachTargetId
 * @param unknown $treeApproachTargetIds
 * @param unknown $treeActionDao
 */
function getApproachListTreeSql($approachListId, $approachTargetId, &$treeApproachTargetIds, $treeActionDao){
    $sql = "";
    if(!in_array($approachTargetId, $treeApproachTargetIds)){
        // 登録していないapproachTargetIdの場合のみtreeを作成する
        $sql = $treeActionDao->getApproachListTreeSql($approachListId, $approachTargetId);
        // 登録したのでtreeApproachTargetIdsにidを設定し２回目以降の登録を行わない
        $treeApproachTargetIds[] = $approachTargetId;
    }
    return $sql;
}

/**
 * 企業情報のテーブルカラムに対応したDICTを返す
 * @param unknown $approachTarget
 * @param unknown $splitPatterns
 * @return multitype:string unknown NULL
 */
function getCompanyDict($row, $splitPatterns){
    // DBコネクション取得
    $db = Zend_Db_Table_Abstract::getDefaultAdapter();
    // マネージャーの宣言
    $commonDao = Application_CommonUtil::getInstance('dao','CommonDao', $db);
    // 企業情報登録用DICT
    $companyDict = array();
    $companyDict["genre"] 					= "";
    $companyDict["category1"] 				= "";
    $companyDict["category2"] 				= "";
    $companyDict["category3"] 				= "";
    if(!is_null($row["name"])){
        $companyDict["name"] 					= $commonDao->escape($row["name"]);
        $companyDict["converted_company_name"] 	= Application_CommonUtil::convertCommonString($commonDao->escape($row["name"]));
        $companyName = preg_replace($splitPatterns, "", $commonDao->escape($row["name"]));
        $companyDict["converted_name"] 			= Application_CommonUtil::convertCommonString($companyName);
    }else{
        $companyDict["name"] 					= "";
        $companyDict["converted_company_name"] 	= "";
        $companyDict["converted_name"] 			= "";
    }
    $companyDict["my_number"] 				= "";
    $companyDict["url"] 					= !is_null(@$row["hp"]) ? $commonDao->escape($row["hp"]) : "";
    $companyDict["detail_url"] 				= "";
    $companyDict["info"] 					= !is_null(@$row["company_info"]) ? $commonDao->escape($row["company_info"]) : "";
    $companyDict["representative_name"] 	= !is_null(@$row["representative_name"]) ? $commonDao->escape($row["representative_name"]) : "";
    $companyDict["expertise_field"] 		= !is_null(@$row["expertise_field"]) ? $commonDao->escape($row["expertise_field"]) : "";
    $companyDict["establishment_date"] 		= !is_null(@$row["establishment_date"]) ? $commonDao->escape($row["establishment_date"]) : "";
    $companyDict["listing_a_stock_section"] = !is_null(@$row["listing_a_stock_section"]) ? $commonDao->escape($row["listing_a_stock_section"]) : "";
    $companyDict["employee_count"] 			= !is_null(@$row["employee_count"]) ? $commonDao->escape($row["employee_count"]) : "";
    $companyDict["relation_company"] 		= !is_null(@$row["relation_company"]) ? $commonDao->escape($row["relation_company"]) : "";
    $companyDict["main_shareholder"] 		= !is_null(@$row["main_shareholder"]) ? $commonDao->escape($row["main_shareholder"]) : "";
    $companyDict["closing_period"] 			= !is_null(@$row["closing_period"]) ? $commonDao->escape($row["closing_period"]) : "";
    $companyDict["capital_stock"] 			= !is_null(@$row["capital_stock"]) ? $commonDao->escape($row["capital_stock"]) : "";
    $companyDict["sales_volume"] 			= !is_null(@$row["sales_volume"]) ? $commonDao->escape($row["sales_volume"]) : "";
    $companyDict["ordinary_income"] 		= !is_null(@$row["ordinary_income"]) ? $commonDao->escape($row["ordinary_income"]) : "";
    $companyDict["employee_count_correct"] 	= !is_null(@$row["employee_count_correct"]) ? $commonDao->escape($row["employee_count_correct"]) : "";
    $companyDict["ordinary_income_correct"] = !is_null(@$row["ordinary_income_correct"]) ? $commonDao->escape($row["ordinary_income_correct"]) : "";
    $companyDict["sales_volume_correct"] 	= !is_null(@$row["sales_volume_correct"]) ? $commonDao->escape($row["sales_volume_correct"]) : "";
    $companyDict["capital_stock_correct"] 	= !is_null(@$row["capital_stock_correct"]) ? $commonDao->escape($row["capital_stock_correct"]) : "";
    $companyDict["inquiry_form"] 			= "0";
    $companyDict["master_db_company_id"] 	= new Zend_Db_Expr('null');
    return $companyDict;
}

/**
 * 部署・拠点又は個人情報のテーブルカラムに対応したDICTを返す
 * @param unknown $row
 * @return Ambigous <string, unknown>
 */
function getApproachTargetDict($row, $companyDict){
    // DBコネクション取得
    $db = Zend_Db_Table_Abstract::getDefaultAdapter();
    // マネージャーの宣言
    $commonDao = Application_CommonUtil::getInstance('dao','CommonDao', $db);
    // 部署拠点・個人用DICT
    if(!is_null($row["tanto_dept"])){
        $approachTargetDict["base_name"] 				= $commonDao->escape($row["tanto_dept"]);
        $approachTargetDict["converted_base_name"] 		= Application_CommonUtil::convertCommonString($commonDao->escape($row["tanto_dept"]));
    }else{
        $approachTargetDict["base_name"] 				= "";
        $approachTargetDict["converted_base_name"] 		= "";
    }
    $approachTargetDict["company_and_base_name"] 		= $companyDict["converted_name"].$approachTargetDict["converted_base_name"];
    $approachTargetDict["position"] 					= "";
    if(!is_null($row["tanto_name"])){
        $approachTargetDict["person_name"] 				= $commonDao->escape($row["tanto_name"]);
        $approachTargetDict["converted_person_name"] 	= Application_CommonUtil::convertCommonString($commonDao->escape($row["tanto_name"]));
    }else{
        $approachTargetDict["person_name"] 				= "";
        $approachTargetDict["converted_person_name"] 	= "";
    }
    $approachTargetDict["person_kana"] 					= "";
    if(!is_null($row["tel"])){
        $approachTargetDict["tel"] 						= $commonDao->escape($row["tel"]);
        $approachTargetDict["tel_only_numbers"] 		= Application_CommonUtil::getOnlyNumbers($commonDao->escape($row["tel"]));
    }else{
        $approachTargetDict["tel"] 						= "";
        $approachTargetDict["tel_only_numbers"] 		= "";
    }
    if(!is_null($row["fax"])){
        $approachTargetDict["fax"] 						= $commonDao->escape($row["fax"]);
        $approachTargetDict["fax_only_numbers"] 		= Application_CommonUtil::getOnlyNumbers($commonDao->escape($row["fax"]));
    }else{
        $approachTargetDict["fax"] 						= "";
        $approachTargetDict["fax_only_numbers"] 		= "";
    }
    $approachTargetDict["mail"] 						= !is_null($row["counter_mail_address"]) ? $commonDao->escape($row["counter_mail_address"]) : "";
    $approachTargetDict["postcode"] 					= !is_null($row["postcode"]) ? Application_CommonUtil::getOnlyNumbers($commonDao->escape($row["postcode"])) : "";
    if(!is_null($row["address"])){
        $approachTargetDict["address"] 					= $commonDao->escape($row["address"]);
        $approachTargetDict["converted_address"] 		= Application_CommonUtil::convertCommonString($commonDao->escape($approachTargetDict["address"]));
    }else{
        $approachTargetDict["address"] 					= "";
        $approachTargetDict["converted_address"] 		= "";
    }
    $approachTargetDict["free1_name"] 					= !is_null($row["free1_name"]) ? $commonDao->escape($row["free1_name"]) : "";
    $approachTargetDict["free1_value"] 					= !is_null($row["free1_value"]) ? $commonDao->escape($row["free1_value"]) : "";
    $approachTargetDict["free2_name"] 					= !is_null($row["free2_name"]) ? $commonDao->escape($row["free2_name"]) : "";
    $approachTargetDict["free2_value"] 					= !is_null($row["free2_value"]) ? $commonDao->escape($row["free2_value"]) : "";
    $approachTargetDict["free3_name"] 					= !is_null($row["free3_name"]) ? $commonDao->escape($row["free3_name"]) : "";
    $approachTargetDict["free3_value"] 					= !is_null($row["free3_value"]) ? $commonDao->escape($row["free3_value"]) : "";
    $approachTargetDict["free4_name"] 					= !is_null($row["free4_name"]) ? $commonDao->escape($row["free4_name"]) : "";
    $approachTargetDict["free4_value"] 					= !is_null($row["free4_value"]) ? $commonDao->escape($row["free4_value"]) : "";
    $approachTargetDict["free5_name"] 					= !is_null($row["free5_name"]) ? $commonDao->escape($row["free5_name"]) : "";
    $approachTargetDict["free5_value"] 					= !is_null($row["free5_value"]) ? $commonDao->escape($row["free5_value"]) : "";
    $approachTargetDict["free6_name"] 					= !is_null($row["free6_name"]) ? $commonDao->escape($row["free6_name"]) : "";
    $approachTargetDict["free6_value"] 					= !is_null($row["free6_value"]) ? $commonDao->escape($row["free6_value"]) : "";
    $approachTargetDict["free7_name"] 					= !is_null($row["free7_name"]) ? $commonDao->escape($row["free7_name"]) : "";
    $approachTargetDict["free7_value"] 					= !is_null($row["free7_value"]) ? $commonDao->escape($row["free7_value"]) : "";
    $approachTargetDict["free8_name"] 					= !is_null($row["free8_name"]) ? $commonDao->escape($row["free8_name"]) : "";
    $approachTargetDict["free8_value"] 					= !is_null($row["free8_value"]) ? $commonDao->escape($row["free8_value"]) : "";
    $approachTargetDict["free9_name"] 					= !is_null($row["free9_name"]) ? $commonDao->escape($row["free9_name"]) : "";
    $approachTargetDict["free9_value"] 					= !is_null($row["free9_value"]) ? $commonDao->escape($row["free9_value"]) : "";
    $approachTargetDict["free10_name"] 					= !is_null($row["free10_name"]) ? $commonDao->escape($row["free10_name"]) : "";
    $approachTargetDict["free10_value"] 				= !is_null($row["free10_value"]) ? $commonDao->escape($row["free10_value"]) : "";
    $approachTargetDict["master_db_approach_target_id"] = new Zend_Db_Expr('null');
    return $approachTargetDict;
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
function checkOverlapCompanyAndRegist($destinationDb, $newClientId, $approachListId, $clientDbRelationId, $companyDict, $approachTargetDict, &$companyIds, &$approachTargetIds, &$treeApproachTargetIds){
    // DAOは関数内で宣言し、引数の数を減らす
    $clientDbCompanyDao = Application_CommonUtil::getInstance('dao', "ClientDbCompanyDao", $destinationDb);
    $clientDbApproachTargetDao = Application_CommonUtil::getInstance('dao', "ClientDbApproachTargetDao", $destinationDb);
    $clientDbHistoryDao = Application_CommonUtil::getInstance('dao', "ClientDbHistoryDao", $destinationDb);
    $clientDbTmpDao = Application_CommonUtil::getInstance('dao', "ClientDbTmpDao", $destinationDb);
    $treeActionDao = Application_CommonUtil::getInstance('dao',"TreeActionDao", $destinationDb);
    $treeActionClientDbDao = Application_CommonUtil::getInstance('dao',"TreeActionClientDbDao", $destinationDb);

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
        $destinationDb->query($sql);
        $sql = getApproachTargetHistorySql($approachTarget, $approachTargetDict, $clientDbHistoryDao);
        $destinationDb->query($sql);

        // 同じファイル内で直接INSERT後にファイルでUPDATEするとエラーになるので処理を分岐させる
        $clientDbCompanySql = registOrSqlStrByCompany($companyDict, $company, $companyIds, $clientDbCompanyDao);
        if($clientDbCompanySql != ""){
            $destinationDb->query($clientDbCompanySql);
        }
        $clientDbApproachTargetSql = registOrSqlStrByApproachTarget($approachTargetDict, $approachTarget, $approachTargetIds, $clientDbApproachTargetDao);
        if($clientDbApproachTargetSql != ""){
            $destinationDb->query($clientDbApproachTargetSql);
        }
        // ツリー登録SQLを取得する
        $sql = getApproachListTreeSql($approachListId, $approachTarget["id"], $treeApproachTargetIds, $treeActionDao);
        if($sql != ""){
            $destinationDb->query($sql);
        }
        // consumer_listの場合のみ登録
        if($clientDbRelationId != ""){
            $sql = $treeActionClientDbDao->getClientDbTreeSql($approachTarget["relation_id"], $clientDbRelationId);
            $destinationDb->query($sql);
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
                $destinationDb->query($sql);
                $sql = getApproachTargetHistorySql($approachTarget, $approachTargetDict, $clientDbHistoryDao);
                $destinationDb->query($sql);

                // 同じファイル内で直接INSERT後にファイルでUPDATEするとエラーになるので処理を分岐させる
                $clientDbCompanySql = registOrSqlStrByCompany($companyDict, $company, $companyIds, $clientDbCompanyDao);
                if($clientDbCompanySql != ""){
                    $destinationDb->query($clientDbCompanySql);
                }
                $clientDbApproachTargetSql = registOrSqlStrByApproachTarget($approachTargetDict, $approachTarget, $approachTargetIds, $clientDbApproachTargetDao);
                if($clientDbApproachTargetSql != ""){
                    $destinationDb->query($clientDbApproachTargetSql);
                }

                // ツリー登録SQLを取得する
                $sql = getApproachListTreeSql($approachListId, $approachTarget["id"], $treeApproachTargetIds, $treeActionDao);
                if($sql != ""){
                    $destinationDb->query($sql);
                }
                // consumer_listの場合のみ登録
                if($clientDbRelationId != ""){
                    $sql = $treeActionClientDbDao->getClientDbTreeSql($approachTarget["relation_id"], $clientDbRelationId);
                    $destinationDb->query($sql);
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
                $destinationDb->query($sql);
                $sql = getApproachTargetHistorySql($approachTarget, $approachTargetDict, $clientDbHistoryDao);
                $destinationDb->query($sql);

                // 同じファイル内で直接INSERT後にファイルでUPDATEするとエラーになるので処理を分岐させる
                $clientDbCompanySql = registOrSqlStrByCompany($companyDict, $company, $companyIds, $clientDbCompanyDao);
                if($clientDbCompanySql != ""){
                    $destinationDb->query($clientDbCompanySql);
                }
                // 登録SQLを作成
                $approachTargetDict["relation_id"] = $approachTarget["relation_id"];

                // アプローチリストとの紐付けにIDが必要なので新規作成時は部署拠点のみINSERTする
                $clientDbApproachTargetId = $clientDbApproachTargetDao->regist($approachTargetDict);

                // ツリー登録SQLを取得する
                $sql = getApproachListTreeSql($approachListId, $clientDbApproachTargetId, $treeApproachTargetIds, $treeActionDao);
                if($sql != ""){
                    $destinationDb->query($sql);
                }
                // consumer_listの場合のみ登録
                if($clientDbRelationId != ""){
                    $sql = $treeActionClientDbDao->getClientDbTreeSql($approachTarget["relation_id"], $clientDbRelationId);
                    $destinationDb->query($sql);
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
                    $destinationDb->query($sql);
                    $sql = $clientDbTmpDao->createClientDbTmpApproachTargetInsertSql($approachTargetDict);
                    $destinationDb->query($sql);
                    $sql = $treeActionClientDbDao->getClientDbTreeSql($uniqueId, $clientDbRelationId);
                    $destinationDb->query($sql);
                }else{
                    // $clientDbRelationIdが存在しない場合は架電結果からの登録なので、保留企業には出来ず、必ず新規作成になる
                    // 登録処理
                    $clientDbCompanyId = $clientDbCompanyDao->regist($companyDict);
                    // アプローチリストとの紐付けにIDが必要なので新規作成時は部署拠点のみINSERTする
                    $clientDbApproachTargetId = $clientDbApproachTargetDao->regist($approachTargetDict);

                    // ツリー登録SQLを取得する
                    $sql = getApproachListTreeSql($approachListId, $clientDbApproachTargetId, $treeApproachTargetIds, $treeActionDao);
                    if($sql != ""){
                        $destinationDb->query($sql);
                    }

                    // 直接insertしたIDを保存する
                    $companyIds[] = $clientDbCompanyId;
                    $approachTargetIds[] = $clientDbApproachTargetId;

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
                $sql = getApproachListTreeSql($approachListId, $clientDbApproachTargetId, $treeApproachTargetIds, $treeActionDao);
                if($sql != ""){
                    $destinationDb->query($sql);
                }
                // consumer_listの場合のみ登録
                if($clientDbRelationId != ""){
                    $sql = $treeActionClientDbDao->getClientDbTreeSql($uniqueId, $clientDbRelationId);
                    $destinationDb->query($sql);
                }
                // 直接insertしたIDを保存する
                $companyIds[] = $clientDbCompanyId;
                $approachTargetIds[] = $clientDbApproachTargetId;

                // 戻り値の設定
                $approachTargetId = $clientDbApproachTargetId;
            }
        }
    }
    return $approachTargetId;
}