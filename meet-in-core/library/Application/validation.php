<?php

/**
 * 各種バリデーションを行う機能
 * カラム名をキーに、エラーで表示する名称、登録するデータの長さ、バリデーションの種類をDICTで記述する
 * バリデーションの種類は以下とする（増減有り）
 * 1:必須入力
 * 2:数値のみ
 * 3:英字のみ
 * 4:英数字のみ
 * 5:整数
 * 6:日付
 * 7:メールアドレス
 * 8:URL
 * 9:WebPhoneIPチェック(数字とドット、コロン)
 * 10:カナチェック(全角・半角)
 * 11:電話番号とFAX番号(数値、ハイフン、カッコ)
 * 12:郵便番号
 * 13:カンマ区切りの数値
 * 14:英数記号
 * 15:色（１６進数RGB形式）
 * 16:色（１６進数RGB形式）#付きで判定
 * 17:数値のみ（必須且つ数値のみの場合（1,2の組み合わせだと0が必須でエラーになってしまう場合に使用する）
 * ※必ず必須チェックは最初に記述すること
 * ※機種依存文字と文字数チェックは指定無しで自動で行う
 * ※範囲指定の場合はexecutionValidationの第二引数としてデータを渡す(6/11時点で未実装)
 * ※その他機能に依存するバリデーションは個別に記述し、汎用性があれば追加する
 */

/**
 * AAスタッフ用のバリデーション
 * @param unknown $form
 */
function aaStaffValidation($form){
	$validationDict = array(
						"staff_password" 	=>array("name" =>"パスワード", 			"length" => 8, 		"validate" => array(4)),
						"staff_firstname" 	=>array("name" =>"姓", 				"length" => 32, 	"validate" => array(1)),
						"staff_lastname" 	=>array("name" =>"名", 				"length" => 32, 	"validate" => array(1)),
						"staff_firstnamepy" =>array("name" =>"姓（フリガナ）", 		"length" => 32, 	"validate" => array(1,10)),
						"staff_lastnamepy" 	=>array("name" =>"名（フリガナ）", 		"length" => 32, 	"validate" => array(1,10)),
						"staff_email" 		=>array("name" =>"メールアドレス", 		"length" => 64, 	"validate" => array(1,7)),
						"webphone_id" 		=>array("name" =>"WebPhoneID", 		"length" => 20, 	"validate" => array(2)),
						"webphone_pass" 	=>array("name" =>"WebPhonePasswd", 	"length" => 20, 	"validate" => array(4)),
						"webphone_ip" 		=>array("name" =>"WebPhoneIP", 		"length" => 20, 	"validate" => array(9)),
						"staff_comment" 	=>array("name" =>"備考", 			"length" => 200, 	"validate" => array())
				);
	$errorList = executionValidation($form, $validationDict);
	return $errorList;
}

/**
 * TAスタッフ用のバリデーション
 * @param unknown $form
 */
function taStaffValidation($form){
	$validationDict = array(
			"staff_password" 	=>array("name" =>"パスワード", 			"length" => 8, 		"validate" => array(4)),
			"staff_firstname" 	=>array("name" =>"姓", 				"length" => 32, 	"validate" => array(1)),
			"staff_lastname" 	=>array("name" =>"名", 				"length" => 32, 	"validate" => array(1)),
			"staff_firstnamepy" =>array("name" =>"姓（フリガナ）", 		"length" => 32, 	"validate" => array(1,10)),
			"staff_lastnamepy" 	=>array("name" =>"名（フリガナ）", 		"length" => 32, 	"validate" => array(1,10)),
			"staff_email" 		=>array("name" =>"メールアドレス", 		"length" => 64, 	"validate" => array(1,7)),
			"telework_start_date" 	=>array("name" =>"契約開始日", 				"length" => 32, 	"validate" => array(6)),
			"telework_end_date" 	=>array("name" =>"契約終了日", 				"length" => 32, 	"validate" => array(6)),
			"webphone_id" 		=>array("name" =>"WebPhoneID", 		"length" => 20, 	"validate" => array(2)),
			"webphone_pass" 	=>array("name" =>"WebPhonePasswd", 	"length" => 20, 	"validate" => array(4)),
			"webphone_ip" 		=>array("name" =>"WebPhoneIP", 		"length" => 20, 	"validate" => array(9)),
			"staff_comment" 	=>array("name" =>"備考", 			"length" => 200, 	"validate" => array())
	);
	$errorList = executionValidation($form, $validationDict);
	return $errorList;
}

/**
 * CAスタッフ用のバリデーション
 * @param unknown $form
 */
function caStaffValidation($form){
	$validationDict = array(
			"staff_password" 	=>array("name" =>"パスワード", 			"length" => 8, 		"validate" => array(4)),
			"staff_firstname" 	=>array("name" =>"姓", 				"length" => 32, 	"validate" => array(1)),
			"staff_lastname" 	=>array("name" =>"名", 				"length" => 32, 	"validate" => array(1)),
			"staff_firstnamepy" =>array("name" =>"姓（フリガナ）", 		"length" => 32, 	"validate" => array(1,10)),
			"staff_lastnamepy" 	=>array("name" =>"名（フリガナ）", 		"length" => 32, 	"validate" => array(1,10)),
			"staff_email" 		=>array("name" =>"メールアドレス", 		"length" => 64, 	"validate" => array(1,7)),
			"webphone_id" 		=>array("name" =>"WebPhoneID", 		"length" => 20, 	"validate" => array(2)),
			"webphone_pass" 	=>array("name" =>"WebPhonePasswd", 	"length" => 20, 	"validate" => array(4)),
			"webphone_ip" 		=>array("name" =>"WebPhoneIP", 		"length" => 20, 	"validate" => array(9)),
			"staff_comment" 	=>array("name" =>"備考", 			"length" => 200, 	"validate" => array())
	);
	$errorList = executionValidation($form, $validationDict);
	return $errorList;
}

/**
 * クライアント用のバリデーション
 * @param unknown $form
 */
function masterClientValidation($form){
	$validationDict = array(
	);
	$errorList = executionValidation($form, $validationDict);
	return $errorList;
}

// /**
//  * マスターデータベース用のバリデーション
//  * @param unknown $form
//  */
// function masterDbValidation($form){
// 	$validationDict = array(
// 			"company_genre"						=> array("name"=>"ジャンル",			"length" =>64,	"validate" => array()),
// 			"company_categoy1"					=> array("name"=>"業種(分類1)",		"length" =>64,	"validate" => array()),
// 			"company_categoy2"					=> array("name"=>"業種(分類2)",		"length" =>64,	"validate" => array()),
// 			"company_categoy3"					=> array("name"=>"業種(分類3)",		"length" =>64,	"validate" => array()),
// 			"company_name"						=> array("name"=>"企業名",			"length" =>100,	"validate" => array()),
// 			"company_kana"						=> array("name"=>"企業名カナ",			"length" =>256,	"validate" => array()),
// 			"company_company_url"				=> array("name"=>"企業ホームページURL",	"length" =>128,	"validate" => array(8)),
// 			"company_detail_url"				=> array("name"=>"詳細ページURL",		"length" =>128,	"validate" => array(8)),
// 			"company_company_info"				=> array("name"=>"会社情報",			"length" =>512,	"validate" => array()),
// 			"company_representative_name"		=> array("name"=>"代表者名",			"length" =>64,	"validate" => array()),
// 			"company_tanto_dept"				=> array("name"=>"担当部署",			"length" =>64,	"validate" => array()),
// 			"company_expertise_field"			=> array("name"=>"得意分野",			"length" =>512,	"validate" => array()),
// 			"company_establishment_date"		=> array("name"=>"設立年月日",		"length" =>64,	"validate" => array()),
// 			"company_listing_a_stock_section"	=> array("name"=>"上場区分",			"length" =>128,	"validate" => array()),
// 			"company_employee_count"			=> array("name"=>"従業員数",			"length" =>128,	"validate" => array()),
// 			"company_relation_company"			=> array("name"=>"子会社関連会社",	"length" =>512,	"validate" => array()),
// 			"company_main_shareholder"			=> array("name"=>"主要株主",			"length" =>512,	"validate" => array()),
// 			"company_closing_period"			=> array("name"=>"決算期",			"length" =>32,	"validate" => array()),
// 			"company_capital_stock"				=> array("name"=>"資本金",			"length" =>32,	"validate" => array()),
// 			"company_sales_volume"				=> array("name"=>"売上高",			"length" =>32,	"validate" => array()),
// 			"company_ordinary_income"			=> array("name"=>"経常利益",			"length" =>32,	"validate" => array()),
// 			"base_name"							=> array("name"=>"部署・拠点名",		"length" =>64,	"validate" => array()),
// 			"person_name"						=> array("name"=>"個人・担当者名",		"length" =>64,	"validate" => array()),
// 			"tel"								=> array("name"=>"電話番号",			"length" =>20,	"validate" => array(11)),
// 			"fax"								=> array("name"=>"FAX番号",			"length" =>32,	"validate" => array(11)),
// 			"mail"								=> array("name"=>"メールアドレス",		"length" =>100,	"validate" => array(7)),
// 			"postcode"							=> array("name"=>"郵便番号",			"length" =>25,	"validate" => array(12)),
// 			"address1"							=> array("name"=>"住所1",			"length" =>100,	"validate" => array()),
// 			"address2"							=> array("name"=>"住所2",			"length" =>100,	"validate" => array()),
// 			"address3"							=> array("name"=>"住所3",			"length" =>100,	"validate" => array()),
// 			"address4"							=> array("name"=>"住所4",			"length" =>100,	"validate" => array()),
// 			"parking"							=> array("name"=>"駐車場の有無",		"length" =>32,	"validate" => array()),
// 			"credit_card"						=> array("name"=>"クレジットカード利用",	"length" =>32,	"validate" => array()),
// 			"business_hours"					=> array("name"=>"営業時間",			"length" =>32,	"validate" => array(6)),
// 			"business_holiday"					=> array("name"=>"休業日休診日定休日",	"length" =>64,	"validate" => array()),
// 			"free1"								=> array("name"=>"カスタム1",			"length" =>512,	"validate" => array()),
// 			"free2"								=> array("name"=>"カスタム2",			"length" =>512,	"validate" => array()),
// 			"free3"								=> array("name"=>"カスタム3",			"length" =>512,	"validate" => array()),
// 			"free4"								=> array("name"=>"カスタム4",			"length" =>512,	"validate" => array()),
// 			"free5"								=> array("name"=>"カスタム5",			"length" =>512,	"validate" => array()),
// 			"free6"								=> array("name"=>"カスタム6",			"length" =>512,	"validate" => array()),
// 			"free7"								=> array("name"=>"カスタム7",			"length" =>512,	"validate" => array()),
// 			"free8"								=> array("name"=>"カスタム8",			"length" =>512,	"validate" => array()),
// 			"free9"								=> array("name"=>"カスタム9",			"length" =>512,	"validate" => array()),
// 			"free10"							=> array("name"=>"カスタム10",			"length" =>512,	"validate" => array())
// 	);
// 	$errorList = executionValidation($form, $validationDict);
// 	return $errorList;
// }

// /**
//  * アポイント用のバリデーション
//  * @param unknown $form
//  */
// function appointValidation($form){
// 	$validationDict = array(
// 						"appoint_id" 				=>array("name" =>"アポイントID", 				"length" => 32, 	"validate" => array(1,2)),
// 						"appoint_clientid"			=>array("name" =>"クライアントID", 				"length" => 11, 	"validate" => array(1,2)),
// 						"appoint_listid" 			=>array("name" =>"プロジェクトID", 				"length" => 11, 	"validate" => array(1,2)),
// 						"appoint_consumertel" 		=>array("name" =>"アポ取得個人の電話番号", 		"length" => 20, 	"validate" => array(1,)),
// 						"appoint_consumerid" 		=>array("name" =>"アポ取得個人ID", 			"length" => 32, 	"validate" => array(1,2)),
// 						"appoint_consumername" 		=>array("name" =>"アポ取得個人名", 								"validate" => array()),
// 						"appoint_time" 				=>array("name" =>"アポ日時", 					"length" => 19, 	"validate" => array(1,6)),
// 						"appoint_clerkdepartment"	=>array("name" =>"アポ取得部署名", 								"validate" => array()),
// 						"appoint_listheader" 		=>array("name" =>"アポ取得担当者名", 							 	"validate" => array()),
// 						"appoint_clientstaffseq" 	=>array("name" =>"担当者SEQ", 				"length" => 11, 	"validate" => array(1,2)),
// 						"appoint_description" 		=>array("name" =>"所感", 										"validate" => array()),
// 						"appoint_updated" 			=>array("name" =>"アポイント更新日", 			"length" => 19, 	"validate" => array(1,6)),
// 						"appoint_updated_name" 		=>array("name" =>"最終更新者", 				"length" => 1000, 	"validate" => array(1)),
// 						"appoint_checked" 			=>array("name" =>"アポ内容確認済みフラグ", 		"length" => 1, 		"validate" => array(4)),
// 						"appoint_canceled" 			=>array("name" =>"アポキャンセルフラグ", 			"length" => 1, 		"validate" => array(4)),
// 						"appoint_gc_id" 			=>array("name" =>"GoogleカレンダーのイベントID ",	"length" => 50, 	"validate" => array(4)),
// 						"appoint_kana" 				=>array("name" =>"アポ取得担当者名カナ", 		"length" => 64, 	"validate" => array()),
// 						"appoint_gender" 			=>array("name" =>"アポ取得担当者性別", 			"length" => 3, 		"validate" => array(1,2)),
// 						"appoint_mail_status" 		=>array("name" =>"アポステータス", 				"length" => 3, 		"validate" => array(1,2)),
// 						"appoint_createuser_type" 	=>array("name" =>"AA:1 CE:2", 				"length" => 3, 		"validate" => array(1,2)),
// 						"appoint_jokyo" 			=>array("name" =>"状況・レベル", 				"length" => 11, 	"validate" => array(1,2)),
// 						"appoint_created" 			=>array("name" =>"アポイント作成日時", 			"length" => 19, 	"validate" => array(1,6)),
// 						"del_flg" 					=>array("name" =>"削除区分", 					"length" => 1, 		"validate" => array(1,2))
// 				);
// 	$errorList = executionValidation($form, $validationDict);
// 	return $errorList;
// }


// /**
//  * アポイントテンプレート用のバリデーション
//  * @param unknown $form
//  */
// function appoint_templateValidation($form){
// 	$validationDict = array(
// 						"id" 			=>array("name" =>"通番", 			"length" => 11, 	"validate" => array(1,2)),
// 						"client_id" 	=>array("name" =>"クライアントID", 		"length" => 11, 	"validate" => array(1)),
// 						"name" 			=>array("name" =>"テンプレート名", 		"length" => 32, 	"validate" => array(1)),
// 						"view_flg" 		=>array("name" =>"表示非表示フラグ",	"length" => 11, 	"validate" => array(1,2)),
// 						"create_time" 	=>array("name" =>"作成日時", 			"length" => 23, 	"validate" => array(1,6)),
// 						"update_time" 	=>array("name" =>"更新日時", 			"length" => 23, 	"validate" => array(1,6)),
// 						"del_flg" 		=>array("name" =>"削除フラグ", 		"length" => 11, 	"validate" => array(1,2))
// 				);
// 	$errorList = executionValidation($form, $validationDict);
// 	return $errorList;
// }


// /**
//  * カテゴリー1用のバリデーション
//  * @param unknown $form
//  */
// function master_category1Validation($form){
// 	$validationDict = array(
// 						"seq" 		=>array("name" =>"シーケンス番号", 		"length" => 11, 	"validate" => array(1,2)),
// 						"name" 		=>array("name" =>"カテゴリー名", 		"length" => 256, 	"validate" => array(1)),
// 						"updated" 	=>array("name" =>"更新日時", 			"length" => 23, 	"validate" => array(1,6))
// 				);
// 	$errorList = executionValidation($form, $validationDict);
// 	return $errorList;
// }

// /**
//  * カテゴリー2用のバリデーション
//  * @param unknown $form
//  */
// function master_category2Validation($form){
// 	$validationDict = array(
// 						"seq" 				=>array("name" =>"シーケンス番号", 		"length" => 11, 	"validate" => array(1,2)),
// 						"category1_seq" 	=>array("name" =>"カテゴリー1のseq", 	"length" => 11, 	"validate" => array(1,2)),
// 						"name" 				=>array("name" =>"カテゴリー名", 		"length" => 256, 	"validate" => array(1)),
// 						"updated" 			=>array("name" =>"更新日時", 			"length" => 23, 	"validate" => array(1,6))
// 				);
// 	$errorList = executionValidation($form, $validationDict);
// 	return $errorList;
// }


// /**
//  * クライアント用のバリデーション
//  * @param unknown $form
//  */
// function master_clientValidation($form){
// 	$validationDict = array(
// 						"client_id" 							=>array("name" =>"クライアントID", 				"length" => 11, 	"validate" => array(1,2)),
// 						"client_name" 							=>array("name" =>"クライアント名", 				"length" => 64, 	"validate" => array(1)),
// 						"client_del_flg" 						=>array("name" =>"削除フラグ", 				"length" => 1, 		"validate" => array(1,2)),
// 						"client_namepy" 						=>array("name" =>"クライアント名カナ", 			"length" => 64, 	"validate" => array(1)),
// 						"client_postcode1" 						=>array("name" =>"郵便番号1", 				"length" => 3, 		"validate" => array(1,2)),
// 						"client_postcode2" 						=>array("name" =>"郵便番号2", 				"length" => 4, 		"validate" => array(1,2)),
// 						"client_address" 						=>array("name" =>"住所", 					"length" => 50, 	"validate" => array(1)),
// 						"client_tel1" 							=>array("name" =>"電話番号（市外局番）", 		"length" => 5, 		"validate" => array(1,2)),
// 						"client_tel2" 							=>array("name" =>"電話番号（市内局番）", 		"length" => 5, 		"validate" => array(1,2)),
// 						"client_tel3" 							=>array("name" =>"電話番号（加入者番号）", 		"length" => 5, 		"validate" => array(1,2)),
// 						"client_fax1" 							=>array("name" =>"FAX番号（市外局番）",			"length" => 5, 		"validate" => array(1,2)),
// 						"client_fax2" 							=>array("name" =>"FAX番号（市内局番）", 		"length" => 5, 		"validate" => array(1,2)),
// 						"client_fax3" 							=>array("name" =>"FAX番号（加入者番号）", 		"length" => 5, 		"validate" => array(1,2)),
// 						"client_homepage" 						=>array("name" =>"ホームページURL", 			"length" => 100, 	"validate" => array(1,8)),
// 						"client_staffleaderfirstname" 			=>array("name" =>"代表者氏", 										"validate" => array()),
// 						"client_staffleaderlastname" 			=>array("name" =>"代表者名", 									 	"validate" => array()),
// 						"client_staffleaderfirstnamepy" 		=>array("name" =>"代表者氏カナ", 								 	"validate" => array()),
// 						"client_staffleaderlastnamepy" 			=>array("name" =>"代表者名カナ", 								 	"validate" => array()),
// 						"client_staffleaderemail" 				=>array("name" =>"代表者メールアドレス", 			"length" => 50, 	"validate" => array(1,7)),
// 						"client_comment" 						=>array("name" =>"備考", 										"validate" => array(1)),
// 						"client_idchar" 						=>array("name" =>"CA + client_id", 			"length" => 7, 		"validate" => array(1,4)),
// 						"client_staffleadername" 				=>array("name" =>"AA担当者ID", 				"length" => 100, 	"validate" => array(2)),
// 						"aa_staff_id_list" 						=>array("name" =>"オプションパスワード", 			"length" => 32, 	"validate" => array(4)),
// 						"option_passwd" 						=>array("name" =>"通話録の再生を公開する", 		"length" => 1, 		"validate" => array(1,2)),
// 						"publish_recording_talk_flg" 			=>array("name" =>"TMO電話データベースを公開する", 	"length" => 1, 		"validate" => array(1,2)),
// 						"publish_telephone_db_flg" 				=>array("name" =>"有効電話リストダウンロード数", 	"length" => 11, 	"validate" => array(1,2)),
// 						"valid_telephonelist_downloading_num" 	=>array("name" =>"分析メニューを公開する", 		"length" => 1, 		"validate" => array(1,2)),
// 						"publish_analysis_menu_flg" 			=>array("name" =>"TOPの累計期間", 			"length" => 1, 		"validate" => array(1,2)),
// 						"clerk" 								=>array("name" =>"メールDM送信者名", 			"length" => 200, 	"validate" => array()),
// 						"regist_date" 							=>array("name" =>"クライアント登録日", 			"length" => 23, 	"validate" => array(1,6)),
// 						"update_date" 							=>array("name" =>"クライアント更新日", 			"length" => 23, 	"validate" => array(1,6)),
// 						"client_add_staff_flg" 					=>array("name" =>"CEの担当者追加権限", 		"length" => 4, 		"validate" => array(1,2))
// 				);
// 	$errorList = executionValidation($form, $validationDict);
// 	return $errorList;
// }


// /**
//  * クライアントカテゴリー用のバリデーション
//  * @param unknown $form
//  */
// function master_client_and_categoryValidation($form){
// 	$validationDict = array(
// 						"id" 				=>array("name" =>"主キー", 			"length" => 11, 	"validate" => array(1,2)),
// 						"client_id" 		=>array("name" =>"クライアントへの主キー", 	"length" => 11, 	"validate" => array(1,2)),
// 						"category1_seq" 	=>array("name" =>"業界への主キー", 		"length" => 11, 	"validate" => array(1,2)),
// 						"category2_seq" 	=>array("name" =>"業種への主キー", 		"length" => 11, 	"validate" => array(1,2)),
// 						"regist_date" 		=>array("name" =>"登録日", 			"length" => 19, 	"validate" => array(1,6)),
// 						"update_date" 		=>array("name" =>"更新日", 			"length" => 19, 	"validate" => array(1,6)),
// 						"update_id" 		=>array("name" =>"更新者ID", 		"length" => 11, 	"validate" => array(2)),
// 						"regist_id" 		=>array("name" =>"登録者ID", 		"length" => 11, 	"validate" => array(2)),
// 						"del_flg" 			=>array("name" =>"削除フラグ", 		"length" => 1,	 	"validate" => array(2))
// 				);
// 	$errorList = executionValidation($form, $validationDict);
// 	return $errorList;
// }




// /**
//  * クライアントcc用のバリデーション
//  * @param unknown $form
//  */
// function master_client_and_ccValidation($form){
// 	$validationDict = array(
// 						"cc_id" 		=>array("name" =>"主キー", 		"length" => 11, 	"validate" => array(1,2)),
// 						"client_id" 	=>array("name" =>"クライアントID", 	"length" => 11, 	"validate" => array(1,2)),
// 						"address" 		=>array("name" =>"アドレス", 		"length" => 100, 	"validate" => array(1,7)),
// 						"del_flg" 		=>array("name" =>"削除フラグ", 	"length" => 1, 		"validate" => array(1,2)),
// 						"name" 			=>array("name" =>"名前", 						 	"validate" => array())
// 				);
// 	$errorList = executionValidation($form, $validationDict);
// 	return $errorList;
// }

/**
 * クライアントダウンロードオプション用のバリデーション
 * @param unknown $form
 */
function master_client_download_optionValidation($form){
	$validationDict = array(
						"id" 						=>array("name" =>"COMMENTID", 			"length" => 11, 	"validate" => array(1,2)),
						"client_id" 				=>array("name" =>"クライアントID", 			"length" => 11, 	"validate" => array(1,2)),
						"publish_telephone_db_flg" 	=>array("name" =>"DB公開フラグ", 			"length" => 1, 		"validate" => array(1,2)),
						"plan_name" 				=>array("name" =>"表示するプラン名", 		"length" => 100, 	"validate" => array()),
						"ca_is_enable_over" 		=>array("name" =>"CA超過リミット設定有無", 	"length" => 1, 		"validate" => array(1,2)),
						"ca_download_num" 			=>array("name" =>"CAダウンロード件数", 		"length" => 11, 	"validate" => array(1,2)),
						"ca_download_limit" 		=>array("name" =>"CAダウンロード上限", 		"length" => 11, 	"validate" => array(1,2)),
						"aa_is_enable_download" 	=>array("name" =>"AAのダウンロード有無", 		"length" => 1, 		"validate" => array(1,2)),
						"aa_download_limit" 		=>array("name" =>"AAダウンロード件数", 		"length" => 11, 	"validate" => array(1,2)),
						"current_flg" 				=>array("name" =>"最新フラグ", 			"length" => 1, 		"validate" => array(1,2)),
						"regist_date" 				=>array("name" =>"登録日", 				"length" => 19, 	"validate" => array(1,6))
				);
	$errorList = executionValidation($form, $validationDict);
	return $errorList;
}

// /**
//  * クライアントサービス（商品名）用のバリデーション
//  * @param unknown $form
//  */
// function master_client_serviceValidation($form){
// 	$validationDict = array(
// 						"client_id" 			=>array("name" =>"クライアントID", 		"length" => 11, 	"validate" => array(1,2)),
// 						"id" 					=>array("name" =>"通番", 			"length" => 11, 	"validate" => array(1,2)),
// 						"service_name" 			=>array("name" =>"サービス/商品名", 	"length" => 256, 	"validate" => array()),
// 						"create_time" 			=>array("name" =>"作成日時", 			"length" => 19, 	"validate" => array(1,6)),
// 						"update_time" 			=>array("name" =>"更新日時", 			"length" => 19, 	"validate" => array(1,6))
// 				);
// 	$errorList = executionValidation($form, $validationDict);
// 	return $errorList;
// }


// /**
//  * コンシューマーマスターに紐付く業界・業種用のバリデーション
//  * @param unknown $form
//  */
// function master_consumer_master_categoryValidation($form){
// 	$validationDict = array(
// 						"consumer_relation_master_id" 	=>array("name" =>"論理結合用のID", 	"length" => 11, 	"validate" => array(1,2)),
// 						"id" 							=>array("name" =>"通番", 			"length" => 11, 	"validate" => array(1,2)),
// 						"category1" 					=>array("name" =>"大カテゴリー", 		"length" => 11, 	"validate" => array(2)),
// 						"category2"						=>array("name" =>"小カテゴリー", 		"length" => 11, 	"validate" => array(2)),
// 						"create_time" 					=>array("name" =>"作成日時", 			"length" => 19, 	"validate" => array(1,6)),
// 						"update_time" 					=>array("name" =>"更新日時", 			"length" => 19, 	"validate" => array(1,6))
// 				);
// 	$errorList = executionValidation($form, $validationDict);
// 	return $errorList;
// }


// /**
//  * コンシューマーマスターに紐付くサービス・商品名用のバリデーション
//  * @param unknown $form
//  */
// function master_consumer_master_serviceValidation($form){
// 	$validationDict = array(
// 						"consumer_relation_master_id" 	=>array("name" =>"論理結合用のID", 	"length" => 11, 	"validate" => array(1,2)),
// 						"id" 							=>array("name" =>"通番", 			"length" => 11, 	"validate" => array(1,2)),
// 						"service_name" 					=>array("name" =>"サービス/商品名", 	"length" => 256, 	"validate" => array()),
// 						"create_time" 					=>array("name" =>"作成日時", 			"length" => 19, 	"validate" => array(1,6)),
// 						"update_time" 					=>array("name" =>"更新日時", 			"length" => 19, 	"validate" => array(1,6))
// 				);
// 	$errorList = executionValidation($form, $validationDict);
// 	return $errorList;
// }


// /**
//  * コンシューマーマスター連携用のバリデーション
//  * @param unknown $form
//  */
// function master_consumer_relationValidation($form){
// 	$validationDict = array(
// 						"id" 						=>array("name" =>"id", 						"length" => 11, 	"validate" => array(1,2)),
// 						"file_name" 				=>array("name" =>"投入ファイル名", 				"length" => 64, 	"validate" => array()),
// 						"category1" 				=>array("name" =>"大カテゴリー", 				"length" => 11, 	"validate" => array(2)),
// 						"category2" 				=>array("name" =>"小カテゴリー", 				"length" => 11, 	"validate" => array(2)),
// 						"acquisition_source" 		=>array("name" =>"リスト取得先", 				"length" => 128, 	"validate" => array()),
// 						"acquisition_type" 			=>array("name" =>"1:アイドマ,2:クライアント",	 	"length" => 2, 		"validate" => array(1,4)),
// 						"create_time" 				=>array("name" =>"作成日時", 					"length" => 19, 	"validate" => array(1,6)),
// 						"update_time" 				=>array("name" =>"更新日時", 					"length" => 19, 	"validate" => array(1,6)),
// 						"del_flg" 					=>array("name" =>"削除フラグ", 				"length" => 1, 		"validate" => array(1,2)),
// 						"acquisition_date" 			=>array("name" =>"リスト取得日時", 				"length" => 19, 	"validate" => array(6))
// 				);
// 	$errorList = executionValidation($form, $validationDict);
// 	return $errorList;
// }


// /**
//  * コンシューマーマスター連携用のバリデーション
//  * @param unknown $form
//  */
// function master_consumer_relationValidation($form){
// 	$validationDict = array(
// 						"id" 						=>array("name" =>"id", 					"length" => 11, 	"validate" => array(1,2)),
// 						"file_name" 				=>array("name" =>"投入ファイル名", 			"length" => 64, 	"validate" => array()),
// 						"category1" 				=>array("name" =>"大カテゴリー", 			"length" => 11, 	"validate" => array(2)),
// 						"category2" 				=>array("name" =>"小カテゴリー", 			"length" => 11, 	"validate" => array(2)),
// 						"acquisition_source" 		=>array("name" =>"リスト取得先", 			"length" => 128, 	"validate" => array()),
// 						"acquisition_type" 			=>array("name" =>"1:アイドマ,2:クライアント", 	"length" => 2, 		"validate" => array(1,4)),
// 						"create_time" 				=>array("name" =>"作成日時", 				"length" => 19, 	"validate" => array(1,6)),
// 						"update_time" 				=>array("name" =>"更新日時", 				"length" => 19, 	"validate" => array(1,6)),
// 						"del_flg" 					=>array("name" =>"削除フラグ", 			"length" => 1, 		"validate" => array(1,2)),
// 						"acquisition_date" 			=>array("name" =>"リスト取得日時", 			"length" => 19, 	"validate" => array(6))
// 				);
// 	$errorList = executionValidation($form, $validationDict);
// 	return $errorList;
// }


// /**
//  * カスタムラベル用のバリデーション
//  * @param unknown $form
//  */
// function master_free_labelValidation($form){
// 	$validationDict = array(
// 						"no" 				=>array("name" =>"ラベル番号", 	"length" => 11, 	"validate" => array(1,2)),
// 						"name" 				=>array("name" =>"ラベル名", 		"length" => 100, 	"validate" => array(1))
// 				);
// 	$errorList = executionValidation($form, $validationDict);
// 	return $errorList;
// }


// /**
//  * 架電禁止用のバリデーション
//  * @param unknown $form
//  */
// function invalid_telephoneValidation($form){
// 	$validationDict = array(
// 						"id" 					=>array("name" =>"主キー", 						"length" => 25, 	"validate" => array(1,2)),
// 						"client_id" 			=>array("name" =>"クライアントID", 					"length" => 11, 	"validate" => array(1,2)),
// 						"name" 					=>array("name" =>"個人名", 						"length" => 32, 	"validate" => array()),
// 						"tel" 					=>array("name" =>"電話番号", 						"length" => 20, 	"validate" => array(2)),
// 						"number_format_tel" 	=>array("name" =>"数値のみに変換した電話番号", 		"length" => 20, 	"validate" => array(1,2)),
// 						"mail" 					=>array("name" =>"メールアドレス", 					"length" => 100, 	"validate" => array(7)),
// 						"reason" 				=>array("name" =>"禁止", 						"length" => 200, 	"validate" => array()),
// 						"remarks" 				=>array("name" =>"備考", 						"length" => 200, 	"validate" => array()),
// 						"keyword" 				=>array("name" =>"法人格を抜いた個人名", 			"length" => 32, 	"validate" => array(1)),
// 						"appoint_flg" 			=>array("name" =>"アポイントによる禁止", 				"length" => 4, 		"validate" => array(1,2)),
// 						"invalid_flg" 			=>array("name" =>"無効フラグ", 					"length" => 1, 		"validate" => array(1,2)),
// 						"regist_list_id" 		=>array("name" =>"登録プロジェクト", 					"length" => 11, 	"validate" => array(2)),
// 						"regist_consumer_id" 	=>array("name" =>"架電禁止登録をしたコンシューマーID", 	"length" => 32, 	"validate" => array(2)),
// 						"regist_staff_id" 		=>array("name" =>"登録担当者ID", 					"length" => 11, 	"validate" => array(2)),
// 						"regist_staff_type" 	=>array("name" =>"登録担当者種別", 				"length" => 11, 	"validate" => array(2)),
// 						"update_staff_id" 		=>array("name" =>"更新担当者ID", 					"length" => 11, 	"validate" => array(2)),
// 						"update_staff_type" 	=>array("name" =>"更新担当者種別", 				"length" => 11, 	"validate" => array(2)),
// 						"create_time" 			=>array("name" =>"作成日時", 						"length" => 19, 	"validate" => array(1,6)),
// 						"update_time" 			=>array("name" =>"更新日時", 						"length" => 19, 	"validate" => array(1,6)),
// 						"del_flg" 				=>array("name" =>"削除フラグ", 					"length" => 11, 	"validate" => array(1,2))
// 				);
// 	$errorList = executionValidation($form, $validationDict);
// 	return $errorList;
// }



// /**
//  * 全国市村町マスタ用のバリデーション
//  * @param unknown $form
//  */
// function master_localcodeValidation($form){
// 	$validationDict = array(
// 						"local" 			=>array("name" =>"地域", 		"length" => 3, 	"validate" => array(1)),
// 						"state" 			=>array("name" =>"都道府県名", 	"length" => 6, 	"validate" => array(1)),
// 						"state_code" 		=>array("name" =>"都道府県コード", 	"length" => 2, 	"validate" => array(1,2)),
// 						"city" 				=>array("name" =>"市名", 		"length" => 8, 	"validate" => array(1)),
// 						"local_code" 		=>array("name" =>"市村町コード", 	"length" => 6, 	"validate" => array(1,2))

// 				);
// 	$errorList = executionValidation($form, $validationDict);
// 	return $errorList;
// }


// /**
//  * メールCC用のバリデーション
//  * @param unknown $form
//  */
// function master_mail_notify_settingValidation($form){
// 	$validationDict = array(
// 						"client_id" 		=>array("name" =>"クライアントID", 					"length" => 11, 	"validate" => array(1,2)),
// 						"list_id" 			=>array("name" =>"プロジェクトID", 					"length" => 11, 	"validate" => array(1,2)),
// 						"type" 				=>array("name" =>"アカウントタイプAA/CE/TA/CC", 		"length" => 2, 		"validate" => array(1,3)),
// 						"id" 				=>array("name" =>"アカウントID cc", 				"length" => 11, 	"validate" => array(1,2)),
// 						"notify_send" 		=>array("name" =>"資料送付更新時メール送信フラグ", 	"length" => 1, 		"validate" => array(1,2)),
// 						"notify_appoint" 	=>array("name" =>"アポイント更新時メール送信フラグ", 		"length" => 1, 		"validate" => array(1,2))

// 				);
// 	$errorList = executionValidation($form, $validationDict);
// 	return $errorList;
// }



// /**
//  * 共通定義用のバリデーション
//  * @param unknown $form
//  */
// function master_paramValidation($form){
// 	$validationDict = array(
// 						"param_type" 		=>array("name" =>"共通項目種別", 				"length" => 200, 	"validate" => array(1)),
// 						"param_id" 			=>array("name" =>"共通項目種別内のID", 		"length" => 11, 	"validate" => array(1,2)),
// 						"param_detail" 		=>array("name" =>"共通項目の定義", 			"length" => 300, 	"validate" => array()),
// 						"param_oeder" 		=>array("name" =>"共通項目のデータ取得順", 		"length" => 4, 		"validate" => array(1,2))

// 				);
// 	$errorList = executionValidation($form, $validationDict);
// 	return $errorList;
// }


// /**
//  * Q&A用のバリデーション
//  * @param unknown $form
//  */
// function qaValidation($form){
// 	$validationDict = array(
// 						"id" 		=>array("name" =>"通番", 			"length" => 11, 	"validate" => array(1,2)),
// 						"list_id" 	=>array("name" =>"プロジェクトID", 		"length" => 11, 	"validate" => array(1,2)),
// 						"name" 		=>array("name" =>"Q&A名称", 			"length" => 20, 	"validate" => array(1)),
// 						"url" 		=>array("name" =>"ファイルパス", 		"length" => 50, 	"validate" => array(1)),
// 						"del_flg" 	=>array("name" =>"削除フラグ", 		"length" => 4, 		"validate" => array(1,2))

// 				);
// 	$errorList = executionValidation($form, $validationDict);
// 	return $errorList;
// }






// /**
//  * レポート設定用のバリデーション
//  * @param unknown $form
//  */
// function master_report_settingValidation($form){
// 	$validationDict = array(
// 						"client_id" 					=>array("name" =>"クライアントID", 					"length" => 11, 	"validate" => array(1,2)),
// 						"id" 							=>array("name" =>"通番", 						"length" => 11, 	"validate" => array(1,2)),
// 						"report_title" 					=>array("name" =>"レポートのタイトル", 				"length" => 128, 	"validate" => array(1)),
// 						"sheet_name" 					=>array("name" =>"シート名", 						"length" => 32, 	"validate" => array(1)),
// 						"status_0_flg" 					=>array("name" =>"その他を出力するフラグ", 			"length" => 4, 		"validate" => array(1,2)),
// 						"status_1_flg" 					=>array("name" =>"受付拒否を出力するフラグ", 			"length" => 4, 		"validate" => array(1,2)),
// 						"status_2_flg" 					=>array("name" =>"受付資料請求を出力するフラグ", 		"length" => 4, 		"validate" => array(1,2)),
// 						"status_3_flg" 					=>array("name" =>"本人拒否を出力するフラグ", 			"length" => 4, 		"validate" => array(1,2)),
// 						"status_4_flg" 					=>array("name" =>"本人資料請求を出力するフラグ", 		"length" => 4, 		"validate" => array(1,2)),
// 						"status_5_flg" 					=>array("name" =>"アポイントを出力するフラグ", 			"length" => 4, 		"validate" => array(1,2)),
// 						"status_6_flg" 					=>array("name" =>"本人不在を出力するフラグ", 			"length" => 4, 		"validate" => array(1,2)),
// 						"status_7_flg" 					=>array("name" =>"時期改めを出力するフラグ", 			"length" => 4, 		"validate" => array(1,2)),
// 						"name_flg" 						=>array("name" =>"個人名を出力するフラグ", 			"length" => 4, 		"validate" => array(1,2)),
// 						"tel_flg" 						=>array("name" =>"電話番号を出力するフラグ", 			"length" => 4, 		"validate" => array(1,2)),
// 						"address_flg" 					=>array("name" =>"住所を出力するフラグ", 				"length" => 4, 		"validate" => array(1,2)),
// 						"postcode_flg" 					=>array("name" =>"郵便番号を出力するフラグ", 			"length" => 4, 		"validate" => array(1,2)),
// 						"fax_flg" 						=>array("name" =>"FAXを出力するフラグ", 				"length" => 4, 		"validate" => array(1,2)),
// 						"hp_flg" 						=>array("name" =>"URLを出力するフラグ", 				"length" => 4, 		"validate" => array(1,2)),
// 						"counter_mail_address_flg" 		=>array("name" =>"メールアドレスを出力するフラグ", 		"length" => 4, 		"validate" => array(1,2)),
// 						"content_flg" 					=>array("name" =>"備考・メモを出力するフラグ", 			"length" => 4, 		"validate" => array(1,2)),
// 						"company_info_flg" 				=>array("name" =>"会社情報を出力するフラグ", 			"length" => 4, 		"validate" => array(1,2)),
// 						"representative_name_flg" 		=>array("name" =>"代表者名を出力するフラグ", 			"length" => 4, 		"validate" => array(1,2)),
// 						"tanto_dept_flg" 				=>array("name" =>"担当部署を出力するフラグ", 			"length" => 4, 		"validate" => array(1,2)),
// 						"tanto_name_flg" 				=>array("name" =>"担当者名を出力するフラグ", 			"length" => 4, 		"validate" => array(1,2)),
// 						"expertise_field_flg" 			=>array("name" =>"得意分野を出力するフラグ", 			"length" => 4, 		"validate" => array(1,2)),
// 						"establishment_date_flg" 		=>array("name" =>"設立年月日を出力するフラグ", 		"length" => 4, 		"validate" => array(1,2)),
// 						"listing_a_stock_section_flg" 	=>array("name" =>"上場区分を出力するフラグ", 			"length" => 4, 		"validate" => array(1,2)),
// 						"employee_count_flg" 			=>array("name" =>"従業員数を出力するフラグ", 			"length" => 4, 		"validate" => array(1,2)),
// 						"relation_company_flg" 			=>array("name" =>"子会社・関連会社を出力するフラグ", 	"length" => 4, 		"validate" => array(1,2)),
// 						"main_shareholder_flg" 			=>array("name" =>"主要株主を出力するフラグ", 			"length" => 4, 		"validate" => array(1,2)),
// 						"closing_period_flg" 			=>array("name" =>"決算期を出力するフラグ", 			"length" => 4, 		"validate" => array(1,2)),
// 						"capital_stock_flg" 			=>array("name" =>"資本金を出力するフラグ", 			"length" => 4, 		"validate" => array(1,2)),
// 						"sales_volume_flg" 				=>array("name" =>"売上高を出力するフラグ", 			"length" => 4, 		"validate" => array(1,2)),
// 						"ordinary_income_flg" 			=>array("name" =>"経常利益を出力するフラグ", 			"length" => 4, 		"validate" => array(1,2)),
// 						"free1_flg" 					=>array("name" =>"カスタム1を出力するフラグ", 			"length" => 4, 		"validate" => array(1,2)),
// 						"free2_flg" 					=>array("name" =>"カスタム2を出力するフラグ", 			"length" => 4, 		"validate" => array(1,2)),
// 						"free3_flg" 					=>array("name" =>"カスタム3を出力するフラグ", 			"length" => 4, 		"validate" => array(1,2)),
// 						"free4_flg" 					=>array("name" =>"カスタム4を出力するフラグ", 			"length" => 4, 		"validate" => array(1,2)),
// 						"free5_flg" 					=>array("name" =>"カスタム5を出力するフラグ", 			"length" => 4, 		"validate" => array(1,2)),
// 						"free6_flg" 					=>array("name" =>"カスタム6を出力するフラグ", 			"length" => 4, 		"validate" => array(1,2)),
// 						"free7_flg" 					=>array("name" =>"カスタム7を出力するフラグ", 			"length" => 4, 		"validate" => array(1,2)),
// 						"free8_flg" 					=>array("name" =>"カスタム8を出力するフラグ", 			"length" => 4, 		"validate" => array(1,2)),
// 						"free9_flg" 					=>array("name" =>"カスタム9を出力するフラグ", 			"length" => 4, 		"validate" => array(1,2)),
// 						"free10_flg" 					=>array("name" =>"カスタム10を出力するフラグ", 			"length" => 4, 		"validate" => array(1,2)),
// 						"create_time" 					=>array("name" =>"作成日時", 						"length" => 19, 	"validate" => array(1,6)),
// 						"update_time" 					=>array("name" =>"更新日時", 						"length" => 19, 	"validate" => array(1,6))

// 				);
// 	$errorList = executionValidation($form, $validationDict);
// 	return $errorList;
// }




// /**
//  * 架電禁止とコンシューマーの紐付け用のバリデーション
//  * @param unknown $form
//  */
// function restriction_consumerValidation($form){
// 	$validationDict = array(
// 						"consumer_id" 					=>array("name" =>"コンシューマーID", 		"length" => 32, 	"validate" => array(1,2)),
// 						"invalid_telephone_id" 			=>array("name" =>"架電禁止ID", 			"length" => 25, 	"validate" => array(1,2)),
// 						"id" 							=>array("name" =>"通番", 				"length" => 11, 	"validate" => array(1,2)),
// 						"regist_staff_id" 				=>array("name" =>"登録担当者ID", 			"length" => 11, 	"validate" => array(2)),
// 						"regist_staff_type" 			=>array("name" =>"登録担当者種別", 		"length" => 11, 	"validate" => array(2)),
// 						"update_staff_id" 				=>array("name" =>"更新担当者ID", 			"length" => 11, 	"validate" => array(2)),
// 						"update_staff_type" 			=>array("name" =>"更新担当者種別", 		"length" => 11, 	"validate" => array(2)),
// 						"create_time" 					=>array("name" =>"作成日時", 				"length" => 19, 	"validate" => array(1,6)),
// 						"update_time" 					=>array("name" =>"更新日時", 				"length" => 19, 	"validate" => array(1,6)),
// 						"del_flg" 						=>array("name" =>"削除フラグ", 			"length" => 11, 	"validate" => array(1,2))

// 				);
// 	$errorList = executionValidation($form, $validationDict);
// 	return $errorList;
// }


// /**
//  * 架電結果テンプレート用のバリデーション
//  * @param unknown $form
//  */
// function result_templateValidation($form){
// 	$validationDict = array(
// 						"id" 				=>array("name" =>"通番", 			"length" => 11, 	"validate" => array(1,2)),
// 						"client_id" 		=>array("name" =>"クライアントID", 		"length" => 11, 	"validate" => array(1,2)),
// 						"result_type" 		=>array("name" =>"架電結果", 			"length" => 4, 		"validate" => array(1,2)),
// 						"name" 				=>array("name" =>"テンプレート名", 		"length" => 32, 	"validate" => array(1)),
// 						"view_flg" 			=>array("name" =>"表示非表示フラグ", 	"length" => 11, 	"validate" => array(1,2)),
// 						"create_time" 		=>array("name" =>"作成日時", 			"length" => 19, 	"validate" => array(1,6)),
// 						"update_time" 		=>array("name" =>"更新日時", 			"length" => 19, 	"validate" => array(1,6)),
// 						"del_flg" 			=>array("name" =>"削除フラグ", 		"length" => 11, 	"validate" => array(1,2))

// 				);
// 	$errorList = executionValidation($form, $validationDict);
// 	return $errorList;
// }

// /**
//  * 台本とプロジェクトの紐付け用のバリデーション
//  * @param unknown $form
//  */
// function script_relationValidation($form){
// 	$validationDict = array(
// 						"client_id" 		=>array("name" =>"クライアントID", 				"length" => 11, 	"validate" => array(1,2)),
// 						"list_id" 			=>array("name" =>"プロジェクトID", 				"length" => 11, 	"validate" => array(1,2)),
// 						"talk_bind_id" 		=>array("name" =>"トークスクリプトのbindテーブルID", 	"length" => 11, 	"validate" => array(1,2)),
// 						"create_time" 		=>array("name" =>"作成日時", 					"length" => 19, 	"validate" => array(1,6)),
// 						"update_time" 		=>array("name" =>"更新日時", 					"length" => 19, 	"validate" => array(1,6)),
// 						"del_flg" 			=>array("name" =>"削除論理フラグ", 				"length" => 11, 	"validate" => array(1,2))

// 				);
// 	$errorList = executionValidation($form, $validationDict);
// 	return $errorList;
// }


// /**
//  * 資料送付情報用のバリデーション
//  * @param unknown $form
//  */
// function sendValidation($form){
// 	$validationDict = array(
// 						"send_id" 				=>array("name" =>"連番", 				"length" => 11, 	"validate" => array(1,2)),
// 						"send_clientid" 		=>array("name" =>"クライアントID", 			"length" => 11, 	"validate" => array(1,2)),
// 						"send_listid" 			=>array("name" =>"プロジェクトID", 			"length" => 11, 	"validate" => array(1,2)),
// 						"send_consumerid" 		=>array("name" =>"コンシューマーID", 		"length" => 32, 	"validate" => array(1,2)),
// 						"send_status" 			=>array("name" =>"資料送付ステータス", 		"length" => 3, 		"validate" => array(1)),
// 						"send_reception_date" 	=>array("name" =>"資料送付受付日", 		"length" => 10, 	"validate" => array(6)),
// 						"send_completion_date" 	=>array("name" =>"資料送付完了日", 		"length" => 10, 	"validate" => array(6)),
// 						"send_situation" 		=>array("name" =>"状況・レベルテンプレートID", 	"length" => 11, 	"validate" => array(2)),
// 						"send_method" 			=>array("name" =>"資料送付方法テンプレートID","length" => 11, 	"validate" => array(2)),
// 						"send_address" 			=>array("name" =>"宛先", 				"length" => 256, 	"validate" => array()),
// 						"send_division_name"	=>array("name" =>"担当部署名", 			"length" => 64, 	"validate" => array()),
// 						"send_name" 			=>array("name" =>"担当者名", 									"validate" => array()),
// 						"send_kana" 			=>array("name" =>"担当者フリガナ", 								"validate" => array()),
// 						"send_gender" 			=>array("name" =>"担当者性別", 			"length" => 3, 		"validate" => array(1,2)),
// 						"send_remarks" 			=>array("name" =>"備考", 									"validate" => array(1,2)),
// 						"create_time" 			=>array("name" =>"作成日時", 				"length" => 19, 	"validate" => array(1,6)),
// 						"update_time" 			=>array("name" =>"更新日時", 				"length" => 19, 	"validate" => array(1,6)),
// 						"del_flg" 				=>array("name" =>"削除フラグ", 			"length" => 11, 	"validate" => array(1,2))

// 				);
// 	$errorList = executionValidation($form, $validationDict);
// 	return $errorList;
// }


// /**
//  * 資料送付方法テンプレート用のバリデーション
//  * @param unknown $form
//  */
// function send_method_templateValidation($form){
// 	$validationDict = array(
// 						"id" 			=>array("name" =>"連番", 			"length" => 11, 	"validate" => array(1,2)),
// 						"client_id" 	=>array("name" =>"クライアントID", 		"length" => 11, 	"validate" => array(1,2)),
// 						"name" 			=>array("name" =>"テンプレート名", 		"length" => 32, 	"validate" => array(1)),
// 						"view_flg" 		=>array("name" =>"表示非表示フラグ", 	"length" => 11, 	"validate" => array(1,2)),
// 						"create_time" 	=>array("name" =>"作成日時", 			"length" => 19, 	"validate" => array(1,6)),
// 						"update_time" 	=>array("name" =>"更新日時", 			"length" => 19, 	"validate" => array(1,6)),
// 						"del_flg" 		=>array("name" =>"削除フラグ", 		"length" => 11, 	"validate" => array(1,2))

// 				);
// 	$errorList = executionValidation($form, $validationDict);
// 	return $errorList;
// }


// /**
//  * 資料送付テンプレート用のバリデーション
//  * @param unknown $form
//  */
// function send_templateValidation($form){
// 	$validationDict = array(
// 						"id" 			=>array("name" =>"連番", 			"length" => 11, 	"validate" => array(1,2)),
// 						"client_id" 	=>array("name" =>"クライアントID", 		"length" => 11, 	"validate" => array(1,2)),
// 						"name" 			=>array("name" =>"テンプレート名", 		"length" => 32, 	"validate" => array(1)),
// 						"view_flg" 		=>array("name" =>"表示非表示フラグ", 	"length" => 11, 	"validate" => array(1,2)),
// 						"create_time" 	=>array("name" =>"作成日時", 			"length" => 19, 	"validate" => array(1,6)),
// 						"update_time" 	=>array("name" =>"更新日時", 			"length" => 19, 	"validate" => array(1,6)),
// 						"del_flg" 		=>array("name" =>"削除フラグ", 		"length" => 11, 	"validate" => array(1,2))

// 				);
// 	$errorList = executionValidation($form, $validationDict);
// 	return $errorList;
// }


// /**
//  * 区切りの文字列定義用のバリデーション
//  * @param unknown $form
//  */
// function master_split_nameValidation($form){
// 	$validationDict = array(
// 						"split_name_id" 	=>array("name" =>"連番", 			"length" => 11, 	"validate" => array(1,2)),
// 						"split_name_value" 	=>array("name" =>"分割する文字列", 	"length" => 16, 	"validate" => array(1)),
// 						"create_time" 		=>array("name" =>"作成日時", 			"length" => 19, 	"validate" => array(1,6))

// 				);
// 	$errorList = executionValidation($form, $validationDict);
// 	return $errorList;
// }


// /**
//  * マイリスト用のバリデーション
//  * @param unknown $form
//  */
// function staffandconsumerValidation($form){
// 	$validationDict = array(
// 						"staffandconsumer_staffid" 		=>array("name" =>"担当者ID", 		"length" => 11, 	"validate" => array(1,2)),
// 						"staffandconsumer_consumerid" 	=>array("name" =>"コンシューマーID", 	"length" => 32, 	"validate" => array(1,2)),
// 						"staffandconsumer_staff_type" 	=>array("name" =>"担当者種別", 		"length" => 1, 		"validate" => array(1,2)),
// 						"staffandconsumer_comment" 		=>array("name" =>"マイリストメモ", 		"length" => 100, 	"validate" => array()),
// 						"staffandconsumer_del_flg" 		=>array("name" =>"削除フラグ", 		"length" => 1, 		"validate" => array(1,2)),
// 						"staffandconsumer_regist_dt" 	=>array("name" =>"マイリスト登録日時", 	"length" => 19, 	"validate" => array(1,6)),
// 						"staffandconsumer_id" 			=>array("name" =>"通番", 			"length" => 11, 	"validate" => array(1,2))
// 				);
// 	$errorList = executionValidation($form, $validationDict);
// 	return $errorList;
// }


// /**
//  * マイリスト用のバリデーション
//  * @param unknown $form
//  */
// function staffandconsumerValidation($form){
// 	$validationDict = array(
// 						"staffandconsumer_staffid" 		=>array("name" =>"担当者ID", 		"length" => 11, 	"validate" => array(1,2)),
// 						"staffandconsumer_consumerid" 	=>array("name" =>"コンシューマーID", 	"length" => 32, 	"validate" => array(1,2)),
// 						"staffandconsumer_staff_type" 	=>array("name" =>"担当者種別", 		"length" => 1, 		"validate" => array(1,2)),
// 						"staffandconsumer_comment" 		=>array("name" =>"マイリストメモ", 		"length" => 100, 	"validate" => array()),
// 						"staffandconsumer_del_flg" 		=>array("name" =>"削除フラグ", 		"length" => 1, 		"validate" => array(1,2)),
// 						"staffandconsumer_regist_dt" 	=>array("name" =>"マイリスト登録日時", 	"length" => 19, 	"validate" => array(1,6)),
// 						"staffandconsumer_id" 			=>array("name" =>"通番", 			"length" => 11, 	"validate" => array(1,2))
// 				);
// 	$errorList = executionValidation($form, $validationDict);
// 	return $errorList;
// }


// /**
//  * 都道府県コード用のバリデーション
//  * @param unknown $form
//  */
// function statecode_masterValidation($form){
// 	$validationDict = array(
// 						"state_code" 	=>array("name" =>"都道府県コード", 	"length" => 2, 	"validate" => array(1,2)),
// 						"state" 		=>array("name" =>"県名", 		"length" => 4, 	"validate" => array(1))
// 				);
// 	$errorList = executionValidation($form, $validationDict);
// 	return $errorList;
// }


// /**
//  * 台本の解答用のバリデーション
//  * @param unknown $form
//  */
// function talk_answerValidation($form){
// 	$validationDict = array(
// 						"talk_bind_id" 	=>array("name" =>"スクリプトID", 	"length" => 11, 	"validate" => array(1,2)),
// 						"talk_script_id" 		=>array("name" =>"トークスクリプトID", 		"length" => 11, 	"validate" => array(1,2)),
// 						"id" 		=>array("name" =>"通番", 		"length" => 11, 	"validate" => array(1,2)),
// 						"answer_name" 		=>array("name" =>"答え名称", 		"length" => 64, 	"validate" => array(1)),
// 						"answer_type" 		=>array("name" =>"[1:台本,2:QA]", 		"length" => 4, 	"validate" => array(1,2)),
// 						"create_time" 		=>array("name" =>"作成日時", 		"length" => 19, 	"validate" => array(1,6)),
// 						"update_time" 		=>array("name" =>"更新日時", 		"length" => 19, 	"validate" => array(1,6))
// 				);
// 	$errorList = executionValidation($form, $validationDict);
// 	return $errorList;
// }


// /**
//  * 台本を束ねる大元用のバリデーション
//  * @param unknown $form
//  */
// function talk_bindValidation($form){
// 	$validationDict = array(
// 						"id" 				=>array("name" =>"通番", 						"length" => 11, 	"validate" => array(1,2)),
// 						"client_id" 		=>array("name" =>"クライアントID", 					"length" => 11, 	"validate" => array(1,2)),
// 						"talk_script_name" 	=>array("name" =>"トークスクリプト名", 				"length" => 128, 	"validate" => array(1)),
// 						"description" 		=>array("name" =>"トークスクリプトの備考", 				"length" => 256, 	"validate" => array(1)),
// 						"talk_script_url" 	=>array("name" =>"台本アップロードURL", 				"length" => 128, 	"validate" => array(6)),
// 						"talk_script_type" 	=>array("name" =>"[1:自作台本,2:アップロード台本]", 	"length" => 4, 		"validate" => array(1,2)),
// 						"staff_type" 		=>array("name" =>" [AA, TA, CE]", 				"length" => 4, 		"validate" => array(1)),
// 						"staff_id" 			=>array("name" =>"担当者ID", 					"length" => 4, 		"validate" => array(1,2)),
// 						"create_time" 		=>array("name" =>"作成日時", 						"length" => 19, 	"validate" => array(1,6)),
// 						"update_time" 		=>array("name" =>"更新日時", 						"length" => 19, 	"validate" => array(1,6)),
// 						"del_flg" 			=>array("name" =>"削除フラグ", 					"length" => 1, 		"validate" => array(1,2))

// 				);
// 	$errorList = executionValidation($form, $validationDict);
// 	return $errorList;
// }



// /**
//  * トークの親用のバリデーション
//  * @param unknown $form
//  */
// function talk_parentValidation($form){
// 	$validationDict = array(
// 						"talk_bind_id" 			=>array("name" =>"スクリプトID", 		"length" => 11, 	"validate" => array(1,2)),
// 						"talk_script_id" 		=>array("name" =>"トークスクリプトID", 	"length" => 11, 	"validate" => array(1,2)),
// 						"id" 					=>array("name" =>"通番", 			"length" => 11, 	"validate" => array(1,2)),
// 						"parent_key" 			=>array("name" =>"親のkey", 			"length" => 64, 	"validate" => array(1)),
// 						"parent_answer" 		=>array("name" =>"親の答え", 			"length" => 64, 	"validate" => array(1)),
// 						"create_time" 			=>array("name" =>"作成日時", 			"length" => 19, 	"validate" => array(1,6)),
// 						"update_time" 			=>array("name" =>"更新日時", 			"length" => 19, 	"validate" => array(1,6))

// 				);
// 	$errorList = executionValidation($form, $validationDict);
// 	return $errorList;
// }


// /**
//  * トーク内容用のバリデーション
//  * @param unknown $form
//  */
// function talk_scriptValidation($form){
// 	$validationDict = array(
// 						"talk_bind_id" 		=>array("name" =>"論理結合用のID", 	"length" => 11, 	"validate" => array(1,2)),
// 						"id" 				=>array("name" =>"通番", 			"length" => 11, 	"validate" => array(1,2)),
// 						"talk_key" 			=>array("name" =>"トークキー", 			"length" => 64, 	"validate" => array()),
// 						"title" 			=>array("name" =>"トークスクリプトタイトル", 	"length" => 64, 	"validate" => array(1)),
// 						"talk" 				=>array("name" =>"トークスクリプト", 							"validate" => array()),
// 						"talk_hierarchy" 	=>array("name" =>"スクリプトの階層", 		"length" => 11, 	"validate" => array(1,2)),
// 						"create_time" 		=>array("name" =>"作成日時", 			"length" => 19, 	"validate" => array(1,6)),
// 						"update_time" 		=>array("name" =>"更新日時", 			"length" => 19, 	"validate" => array(1,6))

// 				);
// 	$errorList = executionValidation($form, $validationDict);
// 	return $errorList;
// }


// /**
//  * 単価計算用の仮単価テーブル用のバリデーション
//  * @param unknown $form
//  */
// function talk_scriptValidation($form){
// 	$validationDict = array(
// 						"user_key" 		=>array("name" =>"ユーザー固有のキー", 	"length" => 16, 	"validate" => array(1,4)),
// 						"client_id" 	=>array("name" =>"クライアントID", 		"length" => 11, 	"validate" => array(1,2)),
// 						"staff_type" 	=>array("name" =>"[AA,TA,CE]", 		"length" => 4, 		"validate" => array(1,4)),
// 						"staff_id" 		=>array("name" =>"担当者ID", 		"length" => 11, 	"validate" => array(1,2)),
// 						"staff_price" 	=>array("name" =>"担当者の単価", 		"length" => 11,		"validate" => array(1,2))
// 				);
// 	$errorList = executionValidation($form, $validationDict);
// 	return $errorList;
// }




// /**
//  * 単価計算用の仮単価テーブル用のバリデーション
//  * @param unknown $form
//  */
// function talk_scriptValidation($form){
// 	$validationDict = array(
// 						"user_key" 		=>array("name" =>"ユーザー固有のキー", 	"length" => 16, 	"validate" => array(1,4)),
// 						"client_id" 	=>array("name" =>"クライアントID", 		"length" => 11, 	"validate" => array(1,2)),
// 						"staff_type" 	=>array("name" =>"[AA,TA,CE]", 		"length" => 4, 		"validate" => array(1,4)),
// 						"staff_id" 		=>array("name" =>"担当者ID", 		"length" => 11, 	"validate" => array(1,2)),
// 						"staff_price" 	=>array("name" =>"担当者の単価", 		"length" => 11,		"validate" => array(1,2))
// 				);
// 	$errorList = executionValidation($form, $validationDict);
// 	return $errorList;
// }


// /**
//  * 顧客インデックスでクライアント毎存在するテーブル用のバリデーション
//  * @param unknown $form
//  */
// function master_consumer_index_clientIDValidation($form){
// 	$validationDict = array(
// 						"global_id" 					=>array("name" =>"アイドママスタに発行するID", 	"length" => 11, 	"validate" => array(1,2)),
// 						"type" 							=>array("name" =>"種別", 				"length" => 4, 		"validate" => array(1,2)),
// 						"consumer_relation_master_id" 	=>array("name" =>"連携用マスターテーブルのID", "length" => 11, 	"validate" => array(2)),
// 						"status" 						=>array("name" =>"ステータス", 				"length" => 4, 		"validate" => array(2)),
// 						"commit_flg" 					=>array("name" =>"アイドママスターとの同期状況", "length" => 4, 		"validate" => array(2)),
// 						"commit_time" 					=>array("name" =>"同期日時", 				"length" => 19, 	"validate" => array(6)),
// 						"create_time" 					=>array("name" =>"作成日時", 				"length" => 19, 	"validate" => array(1,6)),
// 						"update_time" 					=>array("name" =>"更新日時", 				"length" => 19, 	"validate" => array(1,6)),
// 						"del_flg" 						=>array("name" =>"削除フラグ", 			"length" => 4,		"validate" => array(1,2))
// 				);
// 	$errorList = executionValidation($form, $validationDict);
// 	return $errorList;
// }




// /**
//  * 企業情報のマスターテーブル用のバリデーション
//  * @param unknown $form
//  */
// function master_company_clientIDValidation($form){
// 	$validationDict = array(
// 						"id" 						=>array("name" =>"主キー", 			"length" => 11, 		"validate" => array(1,2)),
// 						"name" 						=>array("name" =>"企業名", 			"length" => 100, 		"validate" => array(1)),
// 						"tel" 						=>array("name" =>"企業電話番号", 		"length" => 20, 		"validate" => array(1)),
// 						"fax" 						=>array("name" =>"企業FAX番号", 		"length" => 100, 		"validate" => array()),
// 						"address" 					=>array("name" =>"企業住所", 			"length" => 100, 		"validate" => array(1)),
// 						"postcode" 					=>array("name" =>"郵便番号", 			"length" => 25, 		"validate" => array(1)),
// 						"mail" 						=>array("name" =>"企業メールアドレス", 	"length" => 100, 		"validate" => array(1,7)),
// 						"url" 						=>array("name" =>"企業ホームページURL", "length" => 128, 		"validate" => array(1,8)),
// 						"company_info" 				=>array("name" =>"会社情報", 			"length" => 512,		"validate" => array()),
// 						"representative_name" 		=>array("name" =>"代表者名", 			"length" => 64,			"validate" => array()),
// 						"tanto_dept" 				=>array("name" =>"担当部署", 			"length" => 64,			"validate" => array()),
// 						"person_id" 				=>array("name" =>"担当者ID", 		"length" => 11,			"validate" => array(2)),
// 						"tanto_name" 				=>array("name" =>"担当者名", 			"length" => 64,			"validate" => array()),
// 						"person_id1" 				=>array("name" =>"その他担当者ID1", 	"length" => 11,			"validate" => array(2)),
// 						"tanto_name1" 				=>array("name" =>"その他担当者名1", 	"length" => 64,			"validate" => array()),
// 						"person_id2" 				=>array("name" =>"その他担当者ID2", 	"length" => 11,			"validate" => array(2)),
// 						"tanto_name2" 				=>array("name" =>"その他担当者名2", 	"length" => 64,			"validate" => array()),
// 						"person_id3" 				=>array("name" =>"その他担当者ID3", 	"length" => 11,			"validate" => array(2)),
// 						"tanto_name3" 				=>array("name" =>"その他担当者名3", 	"length" => 64,			"validate" => array()),
// 						"person_id4" 				=>array("name" =>"その他担当者ID4", 	"length" => 11,			"validate" => array(2)),
// 						"tanto_name4" 				=>array("name" =>"その他担当者名4", 	"length" => 64,			"validate" => array()),
// 						"expertise_field" 			=>array("name" =>"得意分野", 			"length" => 512,		"validate" => array()),
// 						"establishment_date" 		=>array("name" =>"設立年月日", 		"length" => 64,			"validate" => array(6)),
// 						"listing_a_stock_section" 	=>array("name" =>"上場区分", 			"length" => 128,		"validate" => array()),
// 						"employee_count" 			=>array("name" =>"従業員数", 			"length" => 128,		"validate" => array()),
// 						"relation_company" 			=>array("name" =>"子会社・関連会社", 	"length" => 512,		"validate" => array(1,2)),
// 						"main_shareholder" 			=>array("name" =>"主要株主", 			"length" => 512,		"validate" => array()),
// 						"closing_period" 			=>array("name" =>"決算期", 			"length" => 32,			"validate" => array()),
// 						"capital_stock" 			=>array("name" =>"資本金", 			"length" => 32,			"validate" => array()),
// 						"sales_volume" 				=>array("name" =>"売上高", 			"length" => 32,			"validate" => array()),
// 						"ordinary_income"		 	=>array("name" =>"経常利益", 			"length" => 32,			"validate" => array()),
// 						"free1_name" 				=>array("name" =>"自由入力名1", 		"length" => 128,		"validate" => array()),
// 						"free1_value" 				=>array("name" =>"自由入力値1", 		"length" => 512,		"validate" => array()),
// 						"free2_name" 				=>array("name" =>"自由入力名2", 		"length" => 128,		"validate" => array()),
// 						"free2_value" 				=>array("name" =>"自由入力値2", 		"length" => 512,		"validate" => array()),
// 						"free3_name" 				=>array("name" =>"自由入力名3", 		"length" => 128,		"validate" => array()),
// 						"free3_value" 				=>array("name" =>"自由入力値3", 		"length" => 512,		"validate" => array()),
// 						"free4_name" 				=>array("name" =>"自由入力名4", 		"length" => 128,		"validate" => array()),
// 						"free4_value" 				=>array("name" =>"自由入力値4", 		"length" => 512,		"validate" => array()),
// 						"free5_name" 				=>array("name" =>"自由入力名5", 		"length" => 128,		"validate" => array()),
// 						"free5_value" 				=>array("name" =>"自由入力値5", 		"length" => 512,		"validate" => array()),
// 						"free6_name" 				=>array("name" =>"自由入力名6", 		"length" => 128,		"validate" => array()),
// 						"free6_value" 				=>array("name" =>"自由入力値6", 		"length" => 512,		"validate" => array()),
// 						"free7_name" 				=>array("name" =>"自由入力名7", 		"length" => 128,		"validate" => array()),
// 						"free7_value" 				=>array("name" =>"自由入力値7", 		"length" => 512,		"validate" => array()),
// 						"free8_name" 				=>array("name" =>"自由入力名8", 		"length" => 128,		"validate" => array()),
// 						"free8_value" 				=>array("name" =>"自由入力値8", 		"length" => 512,		"validate" => array()),
// 						"free9_name" 				=>array("name" =>"自由入力名9", 		"length" => 128,		"validate" => array()),
// 						"free9_value" 				=>array("name" =>"自由入力値9", 		"length" => 512,		"validate" => array()),
// 						"free10_name" 				=>array("name" =>"自由入力名10", 		"length" => 128,		"validate" => array()),
// 						"free10_value" 				=>array("name" =>"自由入力値10", 		"length" => 512,		"validate" => array()),
// 						"employee_count_correct" 	=>array("name" =>"数値のみに変換した従業員数", 	"length" => 32,		"validate" => array(2)),
// 						"ordinary_income_correct" 	=>array("name" =>"数値のみに変換した経常利益", 	"length" => 32,		"validate" => array(2)),
// 						"sales_volume_correct" 		=>array("name" =>"数値のみに変換した売上高", 		"length" => 32,		"validate" => array(2)),
// 						"capital_stock_correct" 	=>array("name" =>"数値のみに変換した資本金", 		"length" => 32,		"validate" => array(2)),
// 						"inquiry_form" 				=>array("name" =>"問い合わせフォームを埋めフラグ", 	"length" => 1,		"validate" => array(1,2))

// 				);
// 	$errorList = executionValidation($form, $validationDict);
// 	return $errorList;
// }




// /**
//  * 個人情報のマスターテーブル用のバリデーション
//  * @param unknown $form
//  */
// function maste_person_clientIDValidation($form){
// 	$validationDict = array(
// 						"id" 						=>array("name" =>"主キー", 			"length" => 32, 	"validate" => array(1,2)),
// 						"name" 						=>array("name" =>"個人名", 			"length" => 100, 	"validate" => array(1)),
// 						"tel" 						=>array("name" =>"個人電話番号", 		"length" => 20, 	"validate" => array(1)),
// 						"tel1" 						=>array("name" =>"個人電話番号1", 	"length" => 20, 	"validate" => array(1)),
// 						"tel2" 						=>array("name" =>"個人電話番号2", 	"length" => 20, 	"validate" => array(1)),
// 						"fax" 						=>array("name" =>"個人FAX番号", 		"length" => 100, 	"validate" => array()),
// 						"postcode" 					=>array("name" =>"郵便番号", 			"length" => 25, 	"validate" => array(1)),
// 						"address" 					=>array("name" =>"個人住所", 			"length" => 100, 	"validate" => array(1)),
// 						"mail" 						=>array("name" =>"メールアドレス", 		"length" => 100,	"validate" => array(1,7)),
// 						"company_id" 				=>array("name" =>"所属企業ID", 		"length" => 11,		"validate" => array(2)),
// 						"company_name" 				=>array("name" =>"所属企業名", 		"length" => 64,		"validate" => array()),
// 						"company_id1" 				=>array("name" =>"所属企業ID1", 		"length" => 11,		"validate" => array(2)),
// 						"company_name1" 			=>array("name" =>"所属企業名1", 		"length" => 64,		"validate" => array()),
// 						"company_id2" 				=>array("name" =>"所属企業ID2", 		"length" => 11,		"validate" => array(2)),
// 						"company_name2" 			=>array("name" =>"所属企業名2", 		"length" => 64,		"validate" => array()),
// 						"company_id3" 				=>array("name" =>"所属企業ID3", 		"length" => 11,		"validate" => array(2)),
// 						"company_name3" 			=>array("name" =>"所属企業名3", 		"length" => 64,		"validate" => array()),
// 						"free1_name" 				=>array("name" =>"自由入力名1", 		"length" => 128,	"validate" => array()),
// 						"free1_value" 				=>array("name" =>"自由入力値1", 		"length" => 512,	"validate" => array()),
// 						"free2_name" 				=>array("name" =>"自由入力名2", 		"length" => 128,	"validate" => array()),
// 						"free2_value" 				=>array("name" =>"自由入力値2", 		"length" => 512,	"validate" => array()),
// 						"free3_name" 				=>array("name" =>"自由入力名3", 		"length" => 128,	"validate" => array()),
// 						"free3_value" 				=>array("name" =>"自由入力値3", 		"length" => 512,	"validate" => array()),
// 						"free4_name" 				=>array("name" =>"自由入力名4", 		"length" => 128,	"validate" => array()),
// 						"free4_value" 				=>array("name" =>"自由入力値4", 		"length" => 512,	"validate" => array()),
// 						"free5_name" 				=>array("name" =>"自由入力名5", 		"length" => 128,	"validate" => array()),
// 						"free5_value" 				=>array("name" =>"自由入力値5", 		"length" => 512,	"validate" => array()),
// 						"free6_name" 				=>array("name" =>"自由入力名6", 		"length" => 128,	"validate" => array()),
// 						"free6_value" 				=>array("name" =>"自由入力値6", 		"length" => 512,	"validate" => array()),
// 						"free7_name" 				=>array("name" =>"自由入力名7", 		"length" => 128,	"validate" => array()),
// 						"free7_value" 				=>array("name" =>"自由入力値7", 		"length" => 512,	"validate" => array()),
// 						"free8_name" 				=>array("name" =>"自由入力名8", 		"length" => 128,	"validate" => array()),
// 						"free8_value" 				=>array("name" =>"自由入力値8", 		"length" => 512,	"validate" => array()),
// 						"free9_name" 				=>array("name" =>"自由入力名9", 		"length" => 128,	"validate" => array()),
// 						"free9_value" 				=>array("name" =>"自由入力値9", 		"length" => 512,	"validate" => array()),
// 						"free10_name" 				=>array("name" =>"自由入力名10", 		"length" => 128,	"validate" => array()),
// 						"free10_value" 				=>array("name" =>"自由入力値10", 		"length" => 512,	"validate" => array())

// 				);
// 	$errorList = executionValidation($form, $validationDict);
// 	return $errorList;
// }


// /**
//  * コンシュマー編集ログ用のバリデーション
//  * @param unknown $form
//  */
// function log_consumer_clientIDValidation($form){
// 	$validationDict = array(
// 						"consumer_id" 				=>array("name" =>"コンシュマーID", 			"length" => 11, 	"validate" => array(1,2)),
// 						"consumer_id_1" 			=>array("name" =>"コンシュマーIDヒストリー1", 	"length" => 11, 	"validate" => array(2)),
// 						"consumer_id_2" 			=>array("name" =>"コンシュマーIDヒストリー2", 	"length" => 11, 	"validate" => array(2)),
// 						"consumer_id_3" 			=>array("name" =>"コンシュマーIDヒストリー3", 	"length" => 11, 	"validate" => array(2)),
// 						"consumer_id_4" 			=>array("name" =>"コンシュマーIDヒストリー4", 	"length" => 11, 	"validate" => array(2)),
// 						"consumer_id_5" 			=>array("name" =>"コンシュマーIDヒストリー5", 	"length" => 11, 	"validate" => array(2)),
// 						"action" 					=>array("name" =>"アクション名", 			"length" => 64, 	"validate" => array()),
// 						"detail" 					=>array("name" =>"編集詳細", 				"length" => 128, 	"validate" => array()),
// 						"staff_id" 					=>array("name" =>"編集者ID", 							 	"validate" => array(4)),
// 						"create_time" 				=>array("name" =>"作成日時", 				"length" => 19,	"validate" => array(6))

// 				);
// 	$errorList = executionValidation($form, $validationDict);
// 	return $errorList;
// }



// /**
//  * アクション結果のTreeで記録する用のバリデーション
//  * @param unknown $form
//  */
// function tree_action_keyValidation($form){
// 	$validationDict = array(
// 						"id" 			=>array("name" =>"主キー", 		"length" => 32, 	"validate" => array(1,4)),
// 						"type" 			=>array("name" =>"タイプ", 		"length" => 4, 		"validate" => array(1,2)),
// 						"name" 			=>array("name" =>"名前", 		"length" => 200, 	"validate" => array(1)),
// 						"actiontime" 	=>array("name" =>"アクション時間", 	"length" => 19, 	"validate" => array(1,6)),
// 						"comment" 		=>array("name" =>"説明", 		"length" => 200, 	"validate" => array()),
// 						"path" 			=>array("name" =>"IDの編集", 		"length" => 200, 	"validate" => array())
// 				);
// 	$errorList = executionValidation($form, $validationDict);
// 	return $errorList;
// }


// /**
//  * リスト用のバリデーション
//  * @param unknown $form
//  */
// function listValidation($form){
// 	$validationDict = array(
// 						"list_id" 						=>array("name" =>"プロジェクトID", 				"length" => 11, 	"validate" => array(1,2)),
// 						"list_name" 					=>array("name" =>"プロジェクト名", 				"length" => 200, 	"validate" => array(1)),
// 						"list_stime" 					=>array("name" =>"プロジェクト開始日時", 			"length" => 19, 	"validate" => array(1,6)),
// 						"list_etime" 					=>array("name" =>"プロジェクト終了日時", 			"length" => 19, 	"validate" => array(1,6)),
// 						"list_clientname" 				=>array("name" =>"プロジェクト作成時のクライアント名", 	"length" => 100, 	"validate" => array(1)),
// 						"list_del_flg" 					=>array("name" =>"削除フラグ", 				"length" => 11, 	"validate" => array(1,2)),
// 						"list_comment" 					=>array("name" =>"備考", 										"validate" => array(1)),
// 						"list_clientid" 				=>array("name" =>"プロジェクト作成時のクライアントID", "length" => 11, 	"validate" => array(1,4)),
// 						"list_staffseq" 				=>array("name" =>"アイドマ担当者ID", 			"length" => 100, 	"validate" => array(1,4)),
// 						"list_staffname" 				=>array("name" =>"アイドマ担当者名", 								"validate" => array()),
// 						"list_clientstaffseq" 			=>array("name" =>"担当者ID", 				"length" => 100, 	"validate" => array(1,4)),
// 						"list_clientstaffname" 			=>array("name" =>"担当者名", 									 	"validate" => array()),
// 						"list_call_division_name1" 		=>array("name" =>"呼出部署1", 				"length" => 16, 	"validate" => array()),
// 						"list_call_division_name2" 		=>array("name" =>"呼出部署2", 				"length" => 16, 	"validate" => array()),
// 						"list_call_division_name3" 		=>array("name" =>"呼出部署3", 				"length" => 16, 	"validate" => array()),
// 						"list_visitstaffseq" 			=>array("name" =>"訪問担当者ID", 				"length" => 100, 	"validate" => array(4)),
// 						"list_workerstaffseq" 			=>array("name" =>"在宅担当者ID", 				"length" => 100, 	"validate" => array(4)),
// 						"list_monitor" 					=>array("name" =>"モニターフラグ", 				"length" => 4, 	"validate" => array(2)),
// 						"list_sv" 						=>array("name" =>"sv", 						"length" => 100, 	"validate" => array()),
// 						"list_appointflg" 				=>array("name" =>"アポ管理フラグ", 				"length" => 4, 	"validate" => array(2)),
// 						"list_client_and_category_id" 	=>array("name" =>"業界・業種の紐付けID", 		"length" => 11, 	"validate" => array(1,2)),
// 						"list_client_service_id" 		=>array("name" =>"サービス・商品名紐付けID", 		"length" => 11, 	"validate" => array(1,2))
// 				);
// 	$errorList = executionValidation($form, $validationDict);
// 	return $errorList;
// }

// /**
//  * アクション結果用のバリデーション
//  * @param unknown $form
//  */
// function result_telphoneValidation($form){
// 	$validationDict = array(
// 						"result_clientid" 				=>array("name" =>"クライアントID", 				"length" => 11, 	"validate" => array(1,2)),
// 						"result_listid" 				=>array("name" =>"プロジェクトID", 				"length" => 11, 	"validate" => array(1,2)),
// 						"result_id" 					=>array("name" =>"主キー", 					"length" => 32, 	"validate" => array(1,2)),
// 						"action_type" 					=>array("name" =>"アクションタイプ", 				"length" => 4, 		"validate" => array(1,2)),
// 						"user_type" 					=>array("name" =>"登録者種別", 				"length" => 2, 		"validate" => array(1,3)),
// 						"result_consumerid" 			=>array("name" =>"コンシューマーID", 			"length" => 11, 	"validate" => array(1,2)),
// 						"result_consumername" 			=>array("name" =>"コンシューマー名", 				"length" => 100,	"validate" => array(1)),
// 						"result_consumertel" 			=>array("name" =>"コンシューマー電話番号", 		"length" => 20, 	"validate" => array(1,4)),
// 						"result_inquiry_id" 			=>array("name" =>"お問い合わせテーブルキー", 		"length" => 32, 	"validate" => array(1,2)),
// 						"result_tel_clerk" 				=>array("name" =>"架電者氏名", 									"validate" => array()),
// 						"result_tel_status" 			=>array("name" =>"架電結果", 					"length" => 11, 	"validate" => array(1,2)),
// 						"result_tel_time" 				=>array("name" =>"架電日時", 					"length" => 19,		"validate" => array()),
// 						"result_teltimes" 				=>array("name" =>"架電回数", 					"length" => 11, 	"validate" => array(1,2)),
// 						"result_reservation" 			=>array("name" =>"掛け直しフラグ", 				"length" => 11, 	"validate" => array(1,2)),
// 						"result_consumerscript" 		=>array("name" =>"使用台本名", 				"length" => 50, 	"validate" => array(1)),
// 						"result_staffid" 				=>array("name" =>"登録者ID", 				"length" => 11, 	"validate" => array(1,2)),
// 						"result_again" 					=>array("name" =>"掛け直しフラグ", 				"length" => 11, 	"validate" => array(1,2)),
// 						"result_again_time" 			=>array("name" =>"掛け直し日時", 				"length" => 19, 	"validate" => array(1,6)),
// 						"result_forbid" 				=>array("name" =>"電話禁止フラグ", 				"length" => 11, 	"validate" => array(1,2)),
// 						"result_note" 					=>array("name" =>"架電メモ", 					"length" => 500, 	"validate" => array(1)),
// 						"result_clientid1" 				=>array("name" =>"クライアントID1", 				"length" => 11, 	"validate" => array(1,2)),
// 						"result_call_division_name" 	=>array("name" =>"呼出部署名", 				"length" => 16, 	"validate" => array()),
// 						"result_mp3_url" 				=>array("name" =>"MP3ファイルパス", 				"length" => 255, 	"validate" => array()),
// 						"result_mp3_del" 				=>array("name" =>"MP3ファイルパスの削除フラグ", 	"length" => 4, 		"validate" => array(1,2)),
// 						"result_webphone_id" 			=>array("name" =>"架電者webphoneID", 		"length" => 10, 	"validate" => array(1,2)),
// 						"result_sv" 					=>array("name" =>"架電者支援氏名", 			"length" => 100, 	"validate" => array(1)),
// 						"result_sv_help" 				=>array("name" =>"HELP時のレベル", 			"length" => 4, 		"validate" => array(1,2)),
// 						"result_sv_status" 				=>array("name" =>"SVの対応状況", 				"length" => 4, 		"validate" => array(1,2)),
// 						"result_sv_mp3_url" 			=>array("name" =>"SV MP3ファイルパス", 			"length" => 255, 	"validate" => array()),
// 						"result_sv_mp3_del" 			=>array("name" =>"SV MP3ファイルパスの削除フラグ", 	"length" => 4, 		"validate" => array(2)),
// 						"result_templateid" 			=>array("name" =>"テンプレートIDを保持", 			"length" => 11, 	"validate" => array(2)),
// 						"result_talk_time" 				=>array("name" =>"通話時間", 					"length" => 11, 	"validate" => array(2))
// 				);
// 	$errorList = executionValidation($form, $validationDict);
// 	return $errorList;
// }


// /**
//  * メールDM結果用のバリデーション
//  * @param unknown $form
//  */
// function result_mailValidation($form){
// 	$validationDict = array(
// 						"client_id" 			=>array("name" =>"クライアントID", 			"length" => 11, 	"validate" => array(1,2)),
// 						"result_mail_id" 		=>array("name" =>"主キー", 				"length" => 32, 	"validate" => array(1,2)),
// 						"list_id" 				=>array("name" =>"プロジェクトID", 			"length" => 11, 	"validate" => array(1,2)),
// 						"consumer_id" 			=>array("name" =>"コンシューマーID", 		"length" => 32, 	"validate" => array(1,2)),
// 						"consumer_name" 		=>array("name" =>"コンシューマー名", 			"length" => 100, 	"validate" => array(1)),
// 						"recipients" 			=>array("name" =>"送信先", 				"length" => 100, 	"validate" => array(1,2)),
// 						"mail_template_id" 		=>array("name" =>"使用メールテンプレートID", 	"length" => 50, 	"validate" => array(1,4)),
// 						"result_send_id" 		=>array("name" =>"資料送付一覧テーブルキー", 	"length" => 32, 	"validate" => array(1,2)),
// 						"result_inquiry_id" 	=>array("name" =>"お問い合わせテーブルキー", 	"length" => 32,	 	"validate" => array(1,2)),
// 						"status" 				=>array("name" =>"メールDM送信結果", 		"length" => 11,	 	"validate" => array(1,2)),
// 						"time" 					=>array("name" =>"メールDM送信日時", 		"length" => 19, 	"validate" => array(1,6)),
// 						"user_type" 			=>array("name" =>"登録者種別", 			"length" => 2, 		"validate" => array(1,3)),
// 						"staff_id" 				=>array("name" =>"登録者ID", 			"length" => 11,		"validate" => array(1,2)),
// 						"clerk" 				=>array("name" =>"メールDM送信者名", 							"validate" => array())

// 				);
// 	$errorList = executionValidation($form, $validationDict);
// 	return $errorList;
// }


// /**
//  * お問い合わせ用のバリデーション
//  * @param unknown $form
//  */
// function inquiryValidation($form){
// 	$validationDict = array(
// 						"client_id" 			=>array("name" =>"クライアントID", 			"length" => 11, 	"validate" => array(2)),
// 						"result_mail_id" 		=>array("name" =>"主キー", 				"length" => 32, 	"validate" => array(1,2)),
// 						"list_id" 				=>array("name" =>"プロジェクトID", 			"length" => 11, 	"validate" => array(1,2)),
// 						"consumer_id" 			=>array("name" =>"コンシューマーID", 		"length" => 32, 	"validate" => array(1,2)),
// 						"consumer_name" 		=>array("name" =>"コンシューマー名", 			"length" => 100, 	"validate" => array(1)),
// 						"consumer_url" 			=>array("name" =>"問い合わせホームページ", 	"length" => 200, 	"validate" => array(1,8)),
// 						"function" 				=>array("name" =>"集客方法",			 	"length" => 1, 	"validate" => array(1,2)),
// 						"inquiry" 				=>array("name" =>"お問い合わせ内容", 		"length" => 2000, 	"validate" => array(1)),
// 						"inquiry_result" 		=>array("name" =>"お問い合わせ回答", 		"length" => 2000,	 	"validate" => array(1)),
// 						"status" 				=>array("name" =>"お問い合わせ結果", 		"length" => 11,	 	"validate" => array(1,2)),
// 						"qustion_time" 			=>array("name" =>"お問い合わせ日時", 		"length" => 19, 	"validate" => array(1,6)),
// 						"answer_time" 			=>array("name" =>"お問い合わせ回答日時", 	"length" => 19, 		"validate" => array(1,6)),
// 						"user_type" 			=>array("name" =>"登録者種別", 			"length" => 2,		"validate" => array(1,3)),
// 						"staff_id" 				=>array("name" =>"登録者ID", 			"length" => 11,		"validate" => array(1,2)),
// 						"clerk" 				=>array("name" =>"お問い合わせ回答者", 							"validate" => array())

// 				);
// 	$errorList = executionValidation($form, $validationDict);
// 	return $errorList;
// }


// /**
//  * fax結果用のバリデーション
//  * @param unknown $form
//  */
// function result_faxValidation($form){
// 	$validationDict = array(
// 						"client_id" 			=>array("name" =>"クライアントID", 		"length" => 11, 	"validate" => array(2)),
// 						"result_fax_id" 		=>array("name" =>"主キー", 			"length" => 32, 	"validate" => array(1,2)),
// 						"list_id" 				=>array("name" =>"プロジェクトID", 		"length" => 11, 	"validate" => array(1,2)),
// 						"send" 					=>array("name" =>"送信数", 			"length" => 11, 	"validate" => array(1,5)),
// 						"err" 					=>array("name" =>"エラー数", 			"length" => 11, 	"validate" => array(1,2)),
// 						"user_type" 			=>array("name" =>"登録者種別",	 	"length" => 2, 	"validate" => array(1,3)),
// 						"staff_id"				=>array("name" =>"登録者ID",			"length" => 11, 	"validate" => array(1,2))
// 				);
// 	$errorList = executionValidation($form, $validationDict);
// 	return $errorList;
// }


// /**
//  * IPアドレスと企業情報マッチするテーブル用のバリデーション
//  * @param unknown $form
//  */
// function consumer_ipValidation($form){
// 	$validationDict = array(
// 						"ip" 			=>array("name" =>"IPアドレス", 		"length" => 16, 	"validate" => array(1)),
// 						"domain" 		=>array("name" =>"ドメイン", 			"length" => 100, 	"validate" => array(1,4)),
// 						"name_en" 		=>array("name" =>"企業名英字", 		"length" => 200, 	"validate" => array(1,4)),
// 						"name_jp" 		=>array("name" =>"企業名日本語", 		"length" => 100, 	"validate" => array(1)),
// 						"Organization" 	=>array("name" =>"企業", 			"length" => 100, 	"validate" => array(1)),
// 						"Street" 		=>array("name" =>"住所１",	 		"length" => 100, 	"validate" => array(1)),
// 						"City" 			=>array("name" =>"住所2",	 		"length" => 100, 	"validate" => array(1)),
// 						"Postal" 		=>array("name" =>"郵便番号",	 		"length" => 100, 	"validate" => array(1)),
// 						"State" 		=>array("name" =>"住所3",	 		"length" => 100, 	"validate" => array(1)),
// 						"Country" 		=>array("name" =>"住所4",	 		"length" => 100, 	"validate" => array()),
// 						"Phone" 		=>array("name" =>"企業電話番号",	 	"length" => 30, 	"validate" => array(1)),
// 						"Fax" 			=>array("name" =>"企業FAX番号",	 	"length" => 30, 	"validate" => array(1)),
// 						"Email" 		=>array("name" =>"企業mail番号",	 	"length" => 100, 	"validate" => array(1,7)),
// 						"consumer_id1" 	=>array("name" =>"コンシューマーID1", 	"length" => 11, 	"validate" => array(2)),
// 						"consumer_id2" 	=>array("name" =>"コンシューマーID2",	"length" => 11, 	"validate" => array(2)),
// 						"consumer_id3" 	=>array("name" =>"コンシューマーID3", 	"length" => 11, 	"validate" => array(2)),
// 						"consumer_id4" 	=>array("name" =>"コンシューマーID4",	"length" => 11, 	"validate" => array(2)),
// 						"consumer_id5"	=>array("name" =>"コンシューマーID5",	"length" => 11, 	"validate" => array(2))
// 				);
// 	$errorList = executionValidation($form, $validationDict);
// 	return $errorList;
// }



// /**
//  * メールテンプレート用のバリデーション
//  * @param unknown $form
//  */
// function consumer_ipValidation($form){
// 	$validationDict = array(
// 						"ip" 				=>array("name" =>"主キー", 				"length" => 11, 	"validate" => array(1,2)),
// 						"client_id" 		=>array("name" =>"クライアントID", 			"length" => 11, 	"validate" => array(5)),
// 						"name" 				=>array("name" =>"名", 					"length" => 100, 	"validate" => array(1)),
// 						"text" 				=>array("name" =>"備考", 				"length" => 200, 	"validate" => array()),
// 						"Recipients" 		=>array("name" =>"送信先", 				"length" => 200, 	"validate" => array(1)),
// 						"From" 				=>array("name" =>"From",	 			"length" => 200, 	"validate" => array(1)),
// 						"Subject" 			=>array("name" =>"件名",	 				"length" => 200, 	"validate" => array(1)),
// 						"bodytext" 			=>array("name" =>"内容",	 									"validate" => array(1)),
// 						"mail_type" 		=>array("name" =>"メール属性",	 			"length" => 1,	 	"validate" => array(2)),
// 						"SentDate" 			=>array("name" =>"送付日時",	 			"length" => 200, 	"validate" => array(6)),
// 						"service_url" 		=>array("name" =>"サービス/商品説明URL",	"length" => 1024, 	"validate" => array(8)),
// 						"opeflg" 			=>array("name" =>"opeflg",	 			"length" => 200, 	"validate" => array(1)),
// 						"header" 			=>array("name" =>"header",	 			"length" => 200, 	"validate" => array(1)),
// 						"sender" 			=>array("name" =>"差出人", 				"length" => 200, 	"validate" => array()),
// 						"Content-ID1" 		=>array("name" =>"Content-ID1",			"length" => 200, 	"validate" => array()),
// 						"Content-ID2" 		=>array("name" =>"Content-ID2", 		"length" => 200, 	"validate" => array()),
// 						"Replyto" 			=>array("name" =>"応答",					"length" => 200, 	"validate" => array()),
// 						"result_staffid" 	=>array("name" =>"登録者ID",				"length" => 11, 	"validate" => array(1,2)),
// 						"create_time" 		=>array("name" =>"作成日時",				"length" => 19, 	"validate" => array(1,6)),
// 						"update_time" 		=>array("name" =>"更新日時",				"length" => 19, 	"validate" => array(1,6)),
// 						"del_flg"			=>array("name" =>"削除フラグ",				"length" => 11, 	"validate" => array(1,2))
// 				);
// 	$errorList = executionValidation($form, $validationDict);
// 	return $errorList;
// }



// /**
//  * メールDM結果用のバリデーション
//  * @param unknown $form
//  */
// function send_mail_taskValidation($form){
// 	$validationDict = array(
// 						"client_id" 		=>array("name" =>"クライアントID", 			"length" => 11, 	"validate" => array(1,2)),
// 						"result_key" 		=>array("name" =>"result_key", 			"length" => 32, 	"validate" => array(1,2)),
// 						"list_id" 			=>array("name" =>"プロジェクトID", 			"length" => 11, 	"validate" => array(1,2)),
// 						"consumer_id" 		=>array("name" =>"コンシューマーID", 		"length" => 32, 	"validate" => array(1,2)),
// 						"consumer_name" 	=>array("name" =>"コンシューマー名",		 	"length" => 100, 	"validate" => array(1)),
// 						"recipients" 		=>array("name" =>"送信先",	 			"length" => 256, 	"validate" => array(1)),
// 						"mail_template_id" 	=>array("name" =>"使用メールテンプレートID",	"length" => 50,		"validate" => array(1,4)),
// 						"status" 			=>array("name" =>"処理済みか",	 		"length" => 11,	 	"validate" => array(1,2)),
// 						"first_send_time" 	=>array("name" =>"初回予定送信時間",	 	"length" => 19, 	"validate" => array(1,6)),
// 						"cycle_flg" 		=>array("name" =>"繰り返しフラグ",	 		"length" => 11, 	"validate" => array(1,2)),
// 						"cycle_type" 		=>array("name" =>"繰り返し方式",	 		"length" => 11, 	"validate" => array(1,2)),
// 						"user_type" 		=>array("name" =>"登録者種別", 			"length" => 2, 		"validate" => array(1,3)),
// 						"staff_id" 			=>array("name" =>"登録者ID",				"length" => 11, 	"validate" => array(1,2))
// 				);
// 	$errorList = executionValidation($form, $validationDict);
// 	return $errorList;
// }

// /**
//  * メール添付ファイル用のバリデーション
//  * @param unknown $form
//  */
// function mail_fileValidation($form){
// 	$validationDict = array(
// 						"id" 				=>array("name" =>"主キー", 				"length" => 11, 	"validate" => array(1,2)),
// 						"mail_template_id" 	=>array("name" =>"使用メールテンプレートID", 	"length" => 11, 	"validate" => array(1,2)),
// 						"file_name" 		=>array("name" =>"添付ファイル名", 			"length" => 256, 	"validate" => array(1)),
// 						"alias_name" 		=>array("name" =>"添付ファイル別名", 		"length" => 256, 	"validate" => array(1))
// 				);
// 	$errorList = executionValidation($form, $validationDict);
// 	return $errorList;
// }


// /**
//  * メール返信先アドレス用のバリデーション
//  * @param unknown $form
//  */
// function mail_replyValidation($form){
// 	$validationDict = array(
// 						"mail_reply_id" 	=>array("name" =>"主キー", 				"length" => 11, 	"validate" => array(1,2)),
// 						"mail_reply_adrs" 	=>array("name" =>"返信先アドレス", 			"length" => 256, 	"validate" => array(1,7)),
// 						"mail_template_id" 	=>array("name" =>"使用メールテンプレートID", 	"length" => 11, 	"validate" => array(1,2))
// 				);
// 	$errorList = executionValidation($form, $validationDict);
// 	return $errorList;
// }




// /**
//  * 担当者（在宅込み）、 クライアント担当者）用のバリデーション
//  * @param unknown $form
//  */
// function master_staffValidation($form){
// 	$validationDict = array(
// 						"client_id" 			=>array("name" =>"個人", 					"length" => 11, 	"validate" => array(1,2)),
// 						"staff_id" 				=>array("name" =>"スタッフID", 					"length" => 11, 	"validate" => array(1,2)),
// 						"idchar" 				=>array("name" =>"ログイン用ID", 				"length" => 7, 		"validate" => array(1,4)),
// 						"staff_password" 		=>array("name" =>"パスワード", 					"length" => 32, 	"validate" => array(1,4)),
// 						"staff_del_flg" 		=>array("name" =>"削除ﾌﾗｸﾞ", 					"length" => 1, 		"validate" => array(1,2)),
// 						"staff_firstname" 		=>array("name" =>"氏", 											"validate" => array()),
// 						"staff_firstnamepy" 	=>array("name" =>"氏（カナ）", 										"validate" => array()),
// 						"staff_comment" 		=>array("name" =>"備考", 										"validate" => array(1)),
// 						"staff_lastname" 		=>array("name" =>"名", 											"validate" => array()),
// 						"staff_lastnamepy" 		=>array("name" =>"名（カナ）", 										"validate" => array()),
// 						"staff_name" 			=>array("name" =>"氏名", 										"validate" => array()),
// 						"staff_email" 			=>array("name" =>"メールアドレス", 				"length" => 50,		"validate" => array(1,7)),
// 						"webphone_id" 			=>array("name" =>"内線番号", 					"length" => 10, 	"validate" => array(4)),
// 						"webphone_pass" 		=>array("name" =>"webphoneパスワード", 			"length" => 20, 	"validate" => array(4)),
// 						"webphone_ip" 			=>array("name" =>"asteriskサーバーIP", 		"length" => 20, 	"validate" => array()),
// 						"gaccount" 				=>array("name" =>"googleアカウント", 			"length" => 50, 	"validate" => array()),
// 						"gaccount_pass" 		=>array("name" =>"googleアカウントパス", 							"validate" => array()),
// 						"staff_role" 			=>array("name" =>"担当者権限", 				"length" => 1, 		"validate" => array(1,2)),
// 						"teleworker_flg" 		=>array("name" =>"在宅アカウントフラグﾞ", 			"length" => 1, 		"validate" => array(1,2)),
// 						"telework_start_date" 	=>array("name" =>"在宅アカウント：契約開始日", 	"length" => 10, 	"validate" => array(6)),
// 						"telework_end_date" 	=>array("name" =>"在宅アカウント：契約終了日", 	"length" => 10, 	"validate" => array(6)),
// 						"call_type" 			=>array("name" =>"通話方式", 					"length" => 4, 		"validate" => array(2)),
// 						"sum_span_type" 		=>array("name" =>"TOPの累計期間", 			"length" => 1, 		"validate" => array(1,2)),
// 						"staff_price"		 	=>array("name" =>"担当者の単価", 				"length" => 11, 	"validate" => array(1,2)),
// 						"staff_payment_type" 	=>array("name" =>"支払種別", 					"length" => 4, 		"validate" => array(1,2)),
// 						"auto_call" 			=>array("name" =>"自動発信", 					"length" => 4, 		"validate" => array(1,2))
// 				);
// 	$errorList = executionValidation($form, $validationDict);
// 	return $errorList;
// }


// /**
//  * 架電結果テンプレート用のバリデーション
//  * @param unknown $form
//  */
// function result_tel_templateValidation($form){
// 	$validationDict = array(
// 						"id" 				=>array("name" =>"主キー", 			"length" => 32, 	"validate" => array(1,2)),
// 						"client_id" 		=>array("name" =>"クライアントID", 		"length" => 11, 	"validate" => array(1,2)),
// 						"name" 				=>array("name" =>"架電結果の表示名", 	"length" => 32, 	"validate" => array(1)),
// 						"view_flg" 			=>array("name" =>"表示非表示フラグ", 	"length" => 11, 	"validate" => array(1,2)),
// 						"create_time" 		=>array("name" =>"作成日時", 			"length" => 19, 	"validate" => array(1,6)),
// 						"update_time" 		=>array("name" =>"更新日時", 			"length" => 19, 	"validate" => array(1,6)),
// 						"del_flg" 			=>array("name" =>"削除フラグ", 		"length" => 3, 		"validate" => array(1.2))
// 				);
// 	$errorList = executionValidation($form, $validationDict);
// 	return $errorList;
// }


// /**
//  * 架電一覧タブのテンプレート用のバリデーション
//  * @param unknown $form
//  */
// function result_tab_templateValidation($form){
// 	$validationDict = array(
// 						"id" 				=>array("name" =>"主キー", 				"length" => 32, 	"validate" => array(1,2)),
// 						"client_id" 		=>array("name" =>"クライアントID", 			"length" => 11, 	"validate" => array(1,2)),
// 						"name" 				=>array("name" =>"架電一覧で表示されるタブ名", "length" => 32, 	"validate" => array(1)),
// 						"view_flg" 			=>array("name" =>"表示非表示フラグ", 		"length" => 11, 	"validate" => array(1,2)),
// 						"create_time" 		=>array("name" =>"作成日時", 				"length" => 19, 	"validate" => array(1,6)),
// 						"update_time" 		=>array("name" =>"更新日時", 				"length" => 19, 	"validate" => array(1,6)),
// 						"del_flg" 			=>array("name" =>"削除フラグ", 			"length" => 3, 		"validate" => array(1.2))
// 				);
// 	$errorList = executionValidation($form, $validationDict);
// 	return $errorList;
// }



// /**
//  * タブに表示する架電結果用のバリデーション
//  * @param unknown $form
//  */
// function tab_settingValidation($form){
// 	$validationDict = array(
// 						"result_tab_id" 		=>array("name" =>"主キー", 				"length" => 32, 	"validate" => array(1,2)),
// 						"result_tel_id" 		=>array("name" =>"家電結果ID", 			"length" => 11, 	"validate" => array(1,2))

// 				);
// 	$errorList = executionValidation($form, $validationDict);
// 	return $errorList;
// }


// /**
//  * 架電一覧タブのテンプレート用のバリデーション
//  * @param unknown $form
//  */
// function analysis_templateValidation($form){
// 	$validationDict = array(
// 						"id" 				=>array("name" =>"主キー", 				"length" => 32, 	"validate" => array(1,2)),
// 						"client_id" 		=>array("name" =>"クライアントID", 			"length" => 11, 	"validate" => array(1,5)),
// 						"name" 				=>array("name" =>"集計で表示される項目名", "length" => 32, 	"validate" => array(1)),
// 						"molecule" 			=>array("name" =>"分子（result_telのid)", 		"length" => 32, 	"validate" => array(1,2)),
// 						"denominator" 		=>array("name" =>"分母（result_telのid)", 		"length" => 32, 	"validate" => array(1,2)),
// 						"order" 			=>array("name" =>"集計で表示される並び順", 		"length" => 3, 	"validate" => array(1,5)),
// 						"create_time" 		=>array("name" =>"作成日時", 				"length" => 19, 	"validate" => array(1,6)),
// 						"update_time" 		=>array("name" =>"更新日時", 				"length" => 19, 	"validate" => array(1,6)),
// 						"del_flg" 			=>array("name" =>"削除フラグ", 			"length" => 3, 		"validate" => array(1.5))
// 				);
// 	$errorList = executionValidation($form, $validationDict);
// 	return $errorList;
// }


// /**
//  * 操作ログ用のバリデーション
//  * @param unknown $form
//  */
// function logsValidation($form){
// 	$validationDict = array(
// 						"staff_id" 			=>array("name" =>"スタッフID", 				"length" => 11, 	"validate" => array(1,2)),
// 						"staff_type" 		=>array("name" =>"スタッフ種別", 			"length" => 4, 	"validate" => array(1,3)),
// 						"client_id" 		=>array("name" =>"クライアントID", 			"length" => 11, 	"validate" => array(2)),
// 						"create_time" 		=>array("name" =>"作成日時", 				"length" => 19, 	"validate" => array(1,6)),
// 						"action_name" 		=>array("name" =>"アクション名", 			"length" => 64, 	"validate" => array(1)),
// 						"send_data" 		=>array("name" =>"サーバーへ送信したデータ", 						"validate" => array(1))
// 				);
// 	$errorList = executionValidation($form, $validationDict);
// 	return $errorList;
// }


// /**
//  * 通話ログ用のバリデーション
//  * @param unknown $form
//  */
// function call_logValidation($form){
// 	$validationDict = array(
// 						"call_id" 			=>array("name" =>"astariskから付与されるユニークなID", 			"length" => 32, 	"validate" => array(1,4)),
// 						"webphone_id" 		=>array("name" =>"内線番号", 								"length" => 10, 	"validate" => array(1,4)),
// 						"origin_key" 		=>array("name" =>"架電結果MP3URLキーと掛け先電話番号の元データ", "length" => 32, 	"validate" => array(1)),
// 						"result_key" 		=>array("name" =>"架電結果MP3URLを特定するためのキー", 		"length" => 16, 	"validate" => array(4)),
// 						"consumer_tel" 		=>array("name" =>"掛け先電話番号", 						"length" => 16, 	"validate" => array(1)),
// 						"call_date" 		=>array("name" =>"発信日時", 								"length" => 19, 	"validate" => array(1,6)),
// 						"call_time" 		=>array("name" =>"発信秒", 								"length" => 4, 		"validate" => array(1)),
// 						"create_time" 		=>array("name" =>"作成日時", 								"length" => 19, 	"validate" => array(1,6))

// 				);
// 	$errorList = executionValidation($form, $validationDict);
// 	return $errorList;
// }




/**
 * 実際にバリデーションを実行する処理
 * @param unknown $validData	何を検証するかのシード
 */
function executionValidation($form, $validationDict, $environmentCharCheckFlg = true){
	$prohibitedCharacters = preg_split("//u", '①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ㍉㌔㌢㍍㌘㌧㌃㌶㍑㍗㌍㌦㌣㌫㍊㌻㎜㎝㎞㎎㎏㏄㎡㍻〝〟№㏍℡㊤㊥㊦㊧㊨㈱㈲㈹㍾㍽㍼∮∑∟⊿纊褜鍈銈蓜俉炻昱棈鋹曻彅丨仡仼伀伃伹佖侒侊侚侔俍偀倢俿倞偆偰偂傔僴僘兊兤冝冾凬刕劜劦勀勛匀匇匤卲厓厲叝﨎咜咊咩哿喆坙坥垬埈埇﨏塚增墲夋奓奛奝奣妤妺孖寀甯寘寬尞岦岺峵崧嵓﨑嵂嵭嶸嶹巐弡弴彧德忞恝悅悊惞惕愠惲愑愷愰憘戓抦揵摠撝擎敎昀昕昻昉昮昞昤晥晗晙晴晳暙暠暲暿曺朎朗杦枻桒柀栁桄棏﨓楨﨔榘槢樰橫橆橳橾櫢櫤毖氿汜沆汯泚洄涇浯涖涬淏淸淲淼渹湜渧渼溿澈澵濵瀅瀇瀨炅炫焏焄煜煆煇凞燁燾犱犾猤猪獷玽珉珖珣珒琇珵琦琪琩琮瑢璉璟甁畯皂皜皞皛皦益睆劯砡硎硤硺礰礼神祥禔福禛竑竧靖竫箞精絈絜綷綠緖繒罇羡羽茁荢荿菇菶葈蒴蕓蕙蕫﨟薰蘒﨡蠇裵訒訷詹誧誾諟諸諶譓譿賰賴贒赶﨣軏﨤逸遧郞都鄕鄧釚釗釞釭釮釤釥鈆鈐鈊鈺鉀鈼鉎鉙鉑鈹鉧銧鉷鉸鋧鋗鋙鋐﨧鋕鋠鋓錥錡鋻﨨錞鋿錝錂鍰鍗鎤鏆鏞鏸鐱鑅鑈閒隆﨩隝隯霳霻靃靍靏靑靕顗顥飯飼餧館馞驎髙髜魵魲鮏鮱鮻鰀鵰鵫鶴鸙黑ⅰⅱⅲⅳⅴⅵⅶⅷⅸⅹ￤＇＂',  -1, PREG_SPLIT_NO_EMPTY);
	$errorList = array();
	foreach($validationDict as $key=>$val){
		// 必須フラグ（必須でない場合は空文字を許容する為のフラグ）
		$requiredFlg = 0;
		// formにvalidationDictのkeyが存在する場合のみバリデーションを行う
		if(array_key_exists($key, $form)){
			// 機種依存文字チェック
			$strList = preg_split("//u", $form[$key], -1, PREG_SPLIT_NO_EMPTY);
			if(is_array($prohibitedCharacters) && count(array_intersect($prohibitedCharacters, $strList)) > 0 && $environmentCharCheckFlg){
				$errorList[] = array($key=>"{$val["name"]}に利用できない文字が含まれます");
			}else if(array_key_exists("length", $val) && mb_strlen($form[$key], "UTF-8") > $val["length"]){
				// 文字数チェック
				$errorList[] = array($key=>"{$val["name"]}は{$val["length"]}文字以内で入力してください");
			}else{
				// 機種依存文字がなければ、その他の検証を実行する
				foreach($val["validate"] as $row){
					if($row == 1){
						// 必須チェック
						$requiredFlg = 1;
						if(empty($form[$key]) || $form[$key] == ""){
							$errorList[] = array($key=>"{$val["name"]}は必須です。");
						}
					}elseif($row == 2){
						// 数値チェック
						if($requiredFlg == 1 || $form[$key] != ""){
							if(!is_numeric($form[$key])){
								$errorList[] = array($key=>"{$val["name"]}は数値を入力してください。");
							}
						}
					}elseif($row == 3){
						// 英字チェック
						if($requiredFlg == 1 || $form[$key] != ""){
							if (!preg_match("/^[a-zA-Z]+$/", $form[$key])) {
								$errorList[] = array($key=>"{$val["name"]}は英字を入力してください。");
							}
						}
					}elseif($row == 4){
						// 英数字チェック
						if($requiredFlg == 1 || $form[$key] != ""){
							if (!preg_match("/^[a-zA-Z0-9]+$/", $form[$key])) {
								$errorList[] = array($key=>"{$val["name"]}は英数字を入力してください。");
							}
						}
					}elseif($row == 5){
						// 整数チェック
						if($requiredFlg == 1 || $form[$key] != ""){
							if(!ctype_digit($form[$key])){
								$errorList[] = array($key=>"{$val["name"]}は整数を入力してください。");
							}
						}
					}elseif($row == 6){
						// 日付チェック
						if($requiredFlg == 1 || ($form[$key] != "" && $form[$key] != "0000-00-00 00:00:00")){
							$dateList = array();
							if(strpos($form[$key], "-")){
								$dateList = explode("-", $form[$key]);
							}elseif(strpos($form[$key], "/")){
								$dateList = explode("/", $form[$key]);
							}
							if(count($dateList) >= 3){
								if(!checkdate($dateList[1], $dateList[2], $dateList[0])){
									$errorList[] = array($key=>"{$val["name"]}は存在しない日付です。");
								}
							}else{
								$errorList[] = array($key=>"{$val["name"]}は不正な日付です。");
							}
						}
					}elseif($row == 7){
						// メールアドレスチェック
						if($requiredFlg == 1 || $form[$key] != ""){
							//if(!filter_var($form[$key], FILTER_VALIDATE_EMAIL)){
							if(!preg_match("/^([a-zA-Z0-9])+([a-zA-Z0-9\._-])*@([a-zA-Z0-9_-])+([a-zA-Z0-9\._-]+)+$/", $form[$key])){
								$errorList[] = array($key=>"{$val["name"]}は不正です。");
							}
						}
					}elseif($row == 8){
						// URLチェック
						if($requiredFlg == 1 || $form[$key] != ""){
							if(!filter_var($form[$key], FILTER_VALIDATE_URL) && !preg_match('@^https?+://@i', $form[$key])){
								$errorList[] = array($key=>"{$val["name"]}は不正です。");
							}
						}
					}elseif($row == 9){
						// WebPhoneIPチェック(数字とドット、コロン)
						if($requiredFlg == 1 || $form[$key] != ""){
							if (!preg_match("/^[0-9:\.]+$/", $form[$key])) {
								$errorList[] = array($key=>"{$val["name"]}は数字、ドット、コロンを入力してください。");
							}
						}
					}elseif($row == 10){
						// カナチェック(全角・半角)
						if($requiredFlg == 1 || $form[$key] != ""){
							if (!preg_match("/^[ァ-ヶーｦ-ﾟｰー 　]+$/u", $form[$key])) {
								$errorList[] = array($key=>"{$val["name"]}はカナを入力してください。");
							}
						}
					}elseif($row == 11){
						// 電話番号・FAX番号
						if($requiredFlg == 1 || $form[$key] != ""){
							if (!preg_match("/^[0-9\(\)-]+$/", $form[$key])) {
								$errorList[] = array($key=>"{$val["name"]}が不正な値です。");
							}
						}
					}elseif($row == 12){
						// 郵便番号
						if($requiredFlg == 1 || $form[$key] != ""){
							if (!preg_match("/^\d{3}-\d{4}$|\d{7}/", $form[$key])) {
								$errorList[] = array($key=>"{$val["name"]}が不正な値です。");
							}
						}
					}elseif($row == 13){
						// カンマ区切りの数値
						if($requiredFlg == 1 || $form[$key] != ""){
							if (!preg_match("/^[0-9,]+$/", $form[$key])) {
								$errorList[] = array($key=>"{$val["name"]}は数字、カンマを入力してください。");
							}
						}
					}elseif($row == 14){
						// 英数記号（記号「.@-_#&$」）
						if($requiredFlg == 1 || $form[$key] != ""){
								if (!preg_match("/^[a-zA-Z0-9\.@\-_#&\$]+$/", $form[$key])) {
								$errorList[] = array($key=>"{$val["name"]}は英数字記号を入力してください。");
							}
						}
					}elseif($row == 15){
						// 色指定
						if($requiredFlg == 1 || $form[$key] != ""){
							if (!preg_match("/^[0-9A-Fa-f]+$/", $form[$key])) {
								$errorList[] = array($key=>"{$val["name"]}は000000からffffffで指定してください。");
							}
						}
					}elseif($row == 16){
						// 色指定(#付き)
						if($requiredFlg == 1 || $form[$key] != ""){
							if (!preg_match("/^[0-9A-Fa-f#]+$/", $form[$key])) {
								$errorList[] = array($key=>"{$val["name"]}は000000からffffffで指定してください。");
							}
						}
					}elseif($row == 17){
						// 数値チェック(入力値が必ず数値であること)
						if(!is_numeric($form[$key])){
							$errorList[] = array($key=>"{$val["name"]}は数値を入力してください。");
						}
					}
				}
			}
		}
	}
	return $errorList;
}
