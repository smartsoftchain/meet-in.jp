<?php
/**
 * aidmaが上げた資料ファイルを定期的に削除するようにする
 * @var unknown_type
 * "production"
 * "staging"
 * "development"
 * php main.php DeleteUnnecessaryFiles staging
 */
try {
    debugMeg("DeleteUnnecessaryFiles begin");

    // DAO読み込み時のエラー回避のため、空のarrayをセットする
		Zend_Registry::set('user', array());

    // meet inのDBオブジェクトを宣言
    $config  = new Zend_Config_Ini(APP_DIR . 'configs/system.ini', $argv[2]);
    $database = Zend_Db::factory($config->datasource);
    $database->setFetchMode(Zend_Db::FETCH_ASSOC);
    Zend_Db_Table_Abstract::setDefaultAdapter($database);
    // プロファイラ有効
    $database->getProfiler()->setEnabled(true);
    // 暗号化カラムを復号化するためのキー設定
    $database->query("set @key:='{$config->datasource->key}'");
    $db = Zend_Db_Table_Abstract::getDefaultAdapter();
		
    // データ取得
		$materialBasicList = getMaterialBasicList($db);

		// 要素がない場合は無処理
		if(count($materialBasicList) == 0) {
			debugMeg("DeleteUnnecessaryFiles no data end");
			return;
		}
		// 削除処理実行
		deleteMaterial($materialBasicList, $db);

		debugMeg("DeleteUnnecessaryFiles end");
		
} catch (Exception $err) {
    debugMeg("想定外の例外：".$err->getMessage());
}


function deleteMaterial($form, $db) {
	// daoの宣言
	$materialDao = Application_CommonUtil::getInstance('dao', "MaterialDao", $db);
	$data = array();
	

	
	$uploaddir = "/var/www/html/public/cmn-data/";
	foreach($form as $row) {
		// 鍵なしの場合のみ削除
		if($row['document_guard_key_flg']==0){
			$db->beginTransaction();
			try {
				$id = $row["material_id"];
				$condition = "";
				// データ削除
				debugMeg(" -> material_id: ".$id );
				$condition = "material_id = {$id}";
				$data = $materialDao->deleteMaterialRow($condition);
				$deletefiles = $uploaddir.md5($id)."-*.*";
				debugMeg(" -> deletefiles: ".$deletefiles );
				// ファイル削除
				foreach(glob($deletefiles) as $file) {
					debugMeg(" -> file: ".$file );
					unlink($file);
				}
				// PDFファイルを削除する
				$pdfPath = $uploaddir.md5($id).".pdf";
				debugMeg(" -> pdfPath: ".$pdfPath );
				unlink($pdfPath);
				$db->commit();
			}catch(Exception $e){
				$db->rollBack();
				error_log($e->getMessage());
				throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
			}
		}
	}
	// 戻り値を作成する
	return $data;
}

/**
 * デバッグメッセージ
 * @param unknown $actionName	処理名
 */
function debugMeg($actionName)
{
    error_log($actionName.":".date("Y-m-d H:i:s"));
}

/**
 *  ゲストが上げたデータデータを取得する
 *  client_id=0
 *  deleteMaterialで利用するためカンマ区切りで取得する
 */
function getMaterialBasicList($db)
{
    $sql = "
		SELECT material_id, document_guard_key_flg
		FROM `material_basic`
		WHERE `client_id` =1
		AND `document_guard_key_flg` =0
		AND `create_date` < ( NOW( ) - INTERVAL 1 MONTH )
		";
    $result = $db->fetchAll($sql);
    return $result;
}
