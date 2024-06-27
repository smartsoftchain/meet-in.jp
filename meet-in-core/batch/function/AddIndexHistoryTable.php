<?php
/**
 * historyテーブルにインデックスを追加する
 * @var unknown_type
 */
try{
	debugMeg("AddIndexHistoryTable_begin");
	
	// DAO読み込み時のエラー回避のため、空のarrayをセットする
	Zend_Registry::set('user', array());
	
	// DAOを宣言
	$db = Zend_Db_Table_Abstract::getDefaultAdapter();
	
	// トランザクションスタート
	$db->beginTransaction();
	try{
		// クライアントのDB情報を書き換える処理
		// 全クライアントを取得し、テーブルにカラムを追加する
		$clientList = getClientList($db);
		foreach($clientList as $client){
			// テーブル名を生成
			$tableName = "client_db_company_history_{$client["client_id"]}";
			$result = searchTreeTable($db, $tableName);
			if($result){
				$sql = "CREATE INDEX idx_id ON {$tableName}(id);";
				$db->query($sql);
			}else{
				createClientDbCompanyHistory($db, $tableName);
			}
			
			$tableName = "client_db_approach_target_history_{$client["client_id"]}";
			$result = searchTreeTable($db, $tableName);
			if($result){
				$sql = "CREATE INDEX idx_id ON {$tableName}(id);";
				$db->query($sql);
			}else{
				createClientDbApproachTargetHistory($db, $tableName);
			}
		}
		// 登録完了したらコミットする
		$db->commit();
	}catch(Exception $e){
		$db->rollBack();
		throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
	}
	debugMeg("AddIndexHistoryTable_end");
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
 * 全クライアントデータを取得する
 */
function getClientList($db) {
	$sql = "
		SELECT
			client_id 
		FROM
			master_client 
		ORDER BY
			client_id asc;
	";
	$stm = $db->query($sql);
	$list = $stm->fetchAll();
	return $list;
}

/**
 * ALTERをかけるテーブルが存在するか調べる
 * @param unknown $db
 * @param unknown $tableName
 * @return unknown
 */
function searchTreeTable($db, $tableName){
	$sql = "SHOW TABLES LIKE  '{$tableName}'";
	$row = $db->fetchRow($sql, array());
	return $row;
}

/**
 * テーブルを作成する
 * @return unknown
 */
function createClientDbCompanyHistory($db, $tableName){
	$sql = "
	CREATE TABLE `{$tableName}`(
		`client_db_company_id` int (11) COMMENT 'client_db_companyのPK',
		`id` int (11) COMMENT '通番',
		`relation_id` varchar (32) NOT NULL COMMENT '企業と部署拠点とその他情報を紐付ける為のランダムなユニークID', 
		`genre` varchar (64) NOT NULL COMMENT '業種（分類１）', 
		`category1` varchar (64) NOT NULL COMMENT '業種（分類１）', 
		`category2` varchar (64) NOT NULL COMMENT '業種（分類２）', 
		`category3` varchar (512) NOT NULL COMMENT '業種（分類３）', 
		`name` varchar (100) NOT NULL COMMENT '企業名', 
		`converted_company_name` varchar (100) NOT NULL COMMENT '法人格有り且つカナ・英数・ローマ字を変換した名称(システムで変換して登録)', 
		`converted_name` varchar (100) NOT NULL COMMENT '社名のみ且つカナ・英数・ローマ字を変換した名称(システムで変換して登録)', 
		`my_number` char (13) NOT NULL COMMENT '企業マイナンバー', 
		`url` varchar (128) NOT NULL COMMENT '企業ホームページURL', 
		`detail_url` varchar (128) COMMENT '詳細ページURL', 
		`info` varchar (512) DEFAULT NULL COMMENT '会社情報', 
		`representative_name` varchar (64) DEFAULT NULL COMMENT '代表者名', 
		`expertise_field` varchar (512) DEFAULT NULL COMMENT '得意分野', 
		`establishment_date` varchar (64) DEFAULT NULL COMMENT '設立年月日', 
		`listing_a_stock_section` varchar (128) DEFAULT NULL COMMENT '上場区分', 
		`employee_count` varchar (128) DEFAULT NULL COMMENT '従業員数', 
		`relation_company` varchar (512) DEFAULT NULL COMMENT '子会社・関連会社', 
		`main_shareholder` varchar (512) DEFAULT NULL COMMENT '主要株主', 
		`closing_period` varchar (32) DEFAULT NULL COMMENT '決算期', 
		`capital_stock` varchar (32) DEFAULT NULL COMMENT '資本金', 
		`sales_volume` varchar (32) DEFAULT NULL COMMENT '売上高', 
		`ordinary_income` varchar (32) DEFAULT NULL COMMENT '経常利益', 
		`employee_count_correct` varchar (32) DEFAULT NULL COMMENT '数値のみに変換した従業員数(システムで変換して登録)', 
		`ordinary_income_correct` varchar (32) DEFAULT NULL COMMENT '数値のみに変換した経常利益(システムで変換して登録)', 
		`sales_volume_correct` varchar (32) DEFAULT NULL COMMENT '数値のみに変換した売上高(システムで変換して登録)', 
		`capital_stock_correct` varchar (32) DEFAULT NULL COMMENT '数値のみに変換した資本金(システムで変換して登録)', 
		`inquiry_form` tinyint (1) NOT NULL COMMENT '問い合わせフォームを埋めフラグ', 
		`master_db_company_id` int (11) DEFAULT NULL COMMENT 'ダウンロード時マスターDBのIDを設定',
		`del_flg` tinyint NOT NULL DEFAULT '0' COMMENT '削除フラグ',
		`create_date` datetime NOT NULL COMMENT '作成日', 
		`update_date` datetime NOT NULL COMMENT '更新日', 
	PRIMARY KEY (`client_db_company_id`, `id`) 
	) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='企業情報のマスターテーブル変更履歴' ;
	
	CREATE INDEX idx_id ON {$tableName}(id);
	";
	$db->query($sql);
	return;
}

/**
 * 追加したカラムにデータを登録する
 * @return unknown
 */
function createClientDbApproachTargetHistory($db, $tableName){
	
	$sql = "
	CREATE TABLE `{$tableName}`(
		`client_db_approach_target_id` int (11) COMMENT 'client_db_approach_targetのPK',
		`id` int (11) NOT NULL COMMENT '通番',
		`relation_id` varchar (32) NOT NULL COMMENT '企業と部署拠点とその他情報を紐付ける為のランダムなユニークID',
		`company_and_base_name` varchar (164) NOT NULL COMMENT '企業名と部署・拠点名を結合した名前（システムで登録）',
		`base_name` varchar (64) NOT NULL COMMENT '部署・拠点名',
		`converted_base_name` varchar (64) NOT NULL COMMENT '部署・拠点名のカナ・英数・ローマ字を変換した名称(システムで変換して登録)',
		`position` varchar (64) NOT NULL COMMENT '役職',
		`person_name` varchar (64) NOT NULL COMMENT '個人・担当者名',
		`person_kana` varchar (128) NOT NULL COMMENT '個人・担当者名カナ',
		`converted_person_name` varchar (128) NOT NULL COMMENT '個人・担当者名のカナ・英数・ローマ字を変換した名称(システムで変換して登録)',
		`tel` varchar (20) NOT NULL COMMENT '電話番号',
		`tel_only_numbers` varchar (20) NOT NULL COMMENT '数値のみに変換した電話番号(システムで変換して登録)',
		`fax` varchar (32) DEFAULT NULL COMMENT 'FAX番号',
		`fax_only_numbers` varchar (32) DEFAULT NULL COMMENT '数値のみに変換したFAX番号(システムで変換して登録)',
		`mail` varchar (100) NOT NULL COMMENT 'メールアドレス',
		`postcode` varchar (7) NOT NULL COMMENT '郵便番号',
		`address` varchar (128) NOT NULL COMMENT '住所',
		`converted_address` varchar (128) NOT NULL COMMENT '住所のカナ・英数・ローマ字を変換した名称(システムで変換して登録)',
		`free1_name` varchar (128) DEFAULT NULL COMMENT '自由入力名1',
		`free1_value` varchar (512) DEFAULT NULL COMMENT '自由入力値1',
		`free2_name` varchar (128) DEFAULT NULL COMMENT '自由入力名2',
		`free2_value` varchar (512) DEFAULT NULL COMMENT '自由入力値2',
		`free3_name` varchar (128) DEFAULT NULL COMMENT '自由入力名3',
		`free3_value` varchar (512) DEFAULT NULL COMMENT '自由入力値3',
		`free4_name` varchar (128) DEFAULT NULL COMMENT '自由入力名4',
		`free4_value` varchar (512) DEFAULT NULL COMMENT '自由入力値4',
		`free5_name` varchar (128) DEFAULT NULL COMMENT '自由入力名5',
		`free5_value` varchar (512) DEFAULT NULL COMMENT '自由入力値5',
		`free6_name` varchar (128) DEFAULT NULL COMMENT '自由入力名6',
		`free6_value` varchar (512) DEFAULT NULL COMMENT '自由入力値6',
		`free7_name` varchar (128) DEFAULT NULL COMMENT '自由入力名7',
		`free7_value` varchar (512) DEFAULT NULL COMMENT '自由入力値7',
		`free8_name` varchar (128) DEFAULT NULL COMMENT '自由入力名8',
		`free8_value` varchar (512) DEFAULT NULL COMMENT '自由入力値8',
		`free9_name` varchar (128) DEFAULT NULL COMMENT '自由入力名9',
		`free9_value` varchar (512) DEFAULT NULL COMMENT '自由入力値9',
		`free10_name` varchar (128) DEFAULT NULL COMMENT '自由入力名10',
		`free10_value` varchar (512) DEFAULT NULL COMMENT '自由入力値10',
		`master_db_approach_target_id` int (11) DEFAULT NULL COMMENT 'ダウンロード時マスターDBのIDを設定',
		`del_flg` tinyint NOT NULL DEFAULT '0' COMMENT '削除フラグ',
		`create_date` datetime NOT NULL COMMENT '作成日',
		`update_date` datetime NOT NULL COMMENT '更新日',
		PRIMARY KEY (`client_db_approach_target_id`, `id`)
	) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='アプローチ対象変更履歴' ;
	CREATE INDEX idx_id ON {$tableName}(id);";
	
	$db->query($sql);
	return;
}

