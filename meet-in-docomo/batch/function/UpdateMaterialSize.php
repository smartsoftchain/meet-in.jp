<?php
/**
 * 資料のサイズを設定するためのバッチ
 * @var unknown_type
 */
try{
	debugMeg("UpdateMaterialSize begin");

	// DAO読み込み時のエラー回避のため、空のarrayをセットする
	Zend_Registry::set('user', array());

	// 新TMOのDBオブジェクトを宣言
	$config  = new Zend_Config_Ini(APP_DIR . 'configs/system.ini', SERVICE_MODE);
	$database = Zend_Db::factory($config->datasource);
	$database->setFetchMode(Zend_Db::FETCH_ASSOC);
	Zend_Db_Table_Abstract::setDefaultAdapter($database);
	// プロファイラ有効
	$database->getProfiler()->setEnabled(true);
	// 暗号化カラムを復号化するためのキー設定
	$database->query("set @key:='{$config->datasource->key}'");
	$db = Zend_Db_Table_Abstract::getDefaultAdapter();

	// トランザクションスタート
	$db->beginTransaction();
	try {
		// TODO material_detailで削除フラグの立っているデータは、資料を物理削除する
		
		
		// 資料のデータを取得する
		$materialBasicList = getMaterialBasicList($db);
		foreach($materialBasicList as $materialBasic){
			// 共通ファイル名を作成
			$fileKey = md5($materialBasic["material_id"]);
			// コマンド作成
			$cmd = "ls -al /mnt/datastore/cmn-data/{$fileKey}* | awk '{ total += $5 }; END { print total }'";
			// コマンドを実行する
			$size = system($cmd, $ret);
			if($size != ""){
				// サイズ取得できた場合は、サイズを登録する
				updateMaterialSize($db, $materialBasic["material_id"], $size);
			}else{
				error_log("no file [id:{$materialBasic["material_id"]}][file:{$fileKey}][size:{$size}][ret:{$ret}]");
			}
			/*
			// 資料の１ページ目を取得する（PDFのデータのみをサイズとして計算するため１つ目を取得し、ファイル名が分かれば良い）
			$materialDetail = getMaterialDetailByPage1($db, $materialBasic["material_id"]);
			if($materialDetail){
				// ファイル名を取得し作成「変換前ファイル名：ファイル名称-ページ番号.拡張子」
				$fileName = $materialDetail["material_filename"];	// 画像の場合はそのまま使用する
				if($materialBasic["material_type"] == 0){
					// PDFの場合は変換する
					$fileNames = explode("-", $materialDetail["material_filename"]);
					$fileName = $fileNames[0] . ".pdf";
				}
				// ファイルパスを作成(このパスは要確認)
				$filePath = "/mnt/datastore/cmn-data/{$fileName}";
				// ファイル検索する
				if(!file_exists($filePath)){
					// PDFのはずが、PDFファイルが存在しない場合は画像を探す
					$filePath = "/mnt/datastore/cmn-data/{$materialDetail["material_filename"]}";

				}
				// ファイルのサイズを取得する
				$fileSize = filesize($filePath);
				if(!$fileSize){
					// 存在しないファイルパス
					error_log($filePath);
				}else{
					// サイズ取得できた場合は、サイズを登録する
					updateMaterialSize($db, $materialBasic["material_id"], $fileSize);
				}
				//error_log("[material_id:{$materialBasic["material_id"]}][material_filename:{$materialDetail["material_filename"]}][pdfFileSize:{$pdfFileSize}]");
			}else{
				error_log("no detail : {$materialBasic["material_id"]}");
			}
			*/
		}
		$db->commit();
	}catch(Exception $e){
		$db->rollback();
		debugMeg($e->getMessage());
		debugMeg("query error");
	}
	debugMeg("UpdateMaterialSize end");
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
 *  資料の元となるデータを取得する
 *  0:資料、1:URL、2:画像なので、URL以外を取得する
 */
function getMaterialBasicList($db){
	$sql = "
		SELECT
			*
		FROM
			material_basic
		WHERE
			material_type = 0 OR
			material_type = 2
		ORDER BY
			material_id;
	";
	$result = $db->fetchAll($sql);
	return $result;
}

/**
 * 資料の１ページ目を取得する
 * @param unknown $db
 */
function getMaterialDetailByPage1($db, $materialId){
	$sql = "
		SELECT
			*
		FROM
			material_detail
		WHERE
			material_id = {$materialId} AND
			material_page = 1;
	";
	$result = $db->fetchRow($sql);
	return $result;
}

/**
 * 資料にファイルサイズを登録する
 * @param unknown $db
 * @param unknown $materialId
 * @param unknown $fileSize
 */
function updateMaterialSize($db, $materialId, $fileSize){
	$sql = "
		UPDATE
			material_basic
		SET
			total_size = {$fileSize}
		WHERE
			material_id = {$materialId};
	";
	$db->query($sql);
}