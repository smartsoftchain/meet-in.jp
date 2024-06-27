<?php

/**
 * MasterClientDao クラス
 *
 * クライアントのDaoクラス
 *
 * @version 2015/08/11 16:16 ochi
 * @package Dao
*/
class MasterClientDao extends AbstractDao {

	const APPRPACH_TYPE_TELEPHONE = 	1;			// 電話のアプローチ
	const APPRPACH_TYPE_MAILDM = 		2;			// メールDMのアプローチ
	const APPRPACH_TYPE_INQUIRY = 		3;			// お問い合わせのアプローチ
	
	private $db;
	function __construct($db){
		parent::init();
		$this->db = $db;
	}

	/**
	 * 対象のクライアント情報を登録（更新・登録）
	 * @param unknown $form
	 * @return unknown
	 */
	public function setMasterClient($form) {
		$clientId = "";
		// 代表者氏名を作成
		$clientStaffleadername = $form["client_staffleaderfirstname"] . " " . $form["client_staffleaderlastname"];
		$record = array(
				'client_name' => $form["client_name"],
				'client_del_flg' => $form["client_del_flg"],
				'client_namepy' => $form["client_namepy"],
				'client_postcode1' => $form["client_postcode1"],
				'client_postcode2' => $form["client_postcode2"],
				'client_address' => $form["client_address"],
				'client_tel1' => $form["client_tel1"],
				'client_tel2' => $form["client_tel2"],
				'client_tel3' => $form["client_tel3"],
				'client_fax1' => $form["client_fax1"],
				'client_fax2' => $form["client_fax2"],
				'client_fax3' => $form["client_fax3"],
				'client_homepage' => $form["client_homepage"],
				'client_staffleaderfirstname' => new Zend_Db_Expr("AES_ENCRYPT({$this->db->quote($form['client_staffleaderfirstname'])}, @key)"),
				'client_staffleaderlastname' => new Zend_Db_Expr("AES_ENCRYPT({$this->db->quote($form['client_staffleaderlastname'])}, @key)"),
				'client_staffleaderfirstnamepy' => new Zend_Db_Expr("AES_ENCRYPT({$this->db->quote($form['client_staffleaderfirstnamepy'])}, @key)"),
				'client_staffleaderlastnamepy' => new Zend_Db_Expr("AES_ENCRYPT({$this->db->quote($form['client_staffleaderlastnamepy'])}, @key)"),
				'client_staffleaderemail' => $form["client_staffleaderemail"],
				'client_comment' => $form["client_comment"],
				'client_staffleadername' => new Zend_Db_Expr("AES_ENCRYPT({$this->db->quote($clientStaffleadername)}, @key)"),
				'aa_staff_id_list' => $form["aa_staff_id_list"],
				'option_passwd' => $form["option_passwd"],
				'publish_recording_talk_flg' => $form["publish_recording_talk_flg"],
				'publish_telephone_db_flg' => $form["publish_telephone_db_flg"],
				'valid_telephonelist_downloading_num' => $form["valid_telephonelist_downloading_num"],
				'publish_analysis_menu_flg' => $form["publish_analysis_menu_flg"],
				'client_add_staff_flg' => $form["client_add_staff_flg"],
				'sum_span_type' => $form["sum_span_type"],
				'update_date' =>  new Zend_Db_Expr('now()')
		);

		if(!array_key_exists("client_id", $form) || $form['client_id'] == ''){
			// staff_idの設定
			$record['create_date'] = new Zend_Db_Expr('now()');
			// client_idcharがNOT NULLなので仮登録する
			$record['client_idchar'] = "CA";
			// 自サーバーに登録
			$this->db->insert('master_client_new', $record);

			// client_idcharを設定する
			$clientId = $this->db->lastInsertId();
			$record = array("client_idchar"=>"CA".$clientId,
							"client_enterprise_code"=>sprintf("%'04d", $clientId));
			$this->db->update('master_client_new', $record, "client_id = {$clientId}" );
		}else{
			// 自サーバーに登録
			$this->db->update('master_client_new', $record, "client_id = {$form['client_id']}" );
			$clientId = $form['client_id'];
		}
		return $clientId;
	}

	/**
	 * 対象のクライアント情報を登録（更新・登録）
	 * @param unknown $form
	 * @return unknown
	 */
	public function setMasterClientOne($form) {
		$record = array();
		if (array_key_exists("name3", $form)) {
			$record = array($form["name"]=>$form["val"],
							$form["name2"]=>$form["val2"],
							$form["name3"]=>$form["val3"]);
		}
		else if (array_key_exists("name2", $form)) {
			if ($form["name"] == "client_staffleaderfirstname" || $form["name"] == "client_staffleaderlastname") {
				$record = array($form["name"]=> new Zend_Db_Expr("AES_ENCRYPT({$this->db->quote($form['val'])}, @key)"),
								$form["name2"]=> new Zend_Db_Expr("AES_ENCRYPT({$this->db->quote($form['val2'])}, @key)"));
			} else {
				$record = array($form["name"]=>$form["val"],
								$form["name2"]=>$form["val2"]);
			}
		}
		else {
			if ($form["name"] == "clientStaffleadername") {
				$record = array($form["name"]=> new Zend_Db_Expr("AES_ENCRYPT({$this->db->quote($form['val'])}, @key)"));
			} else {
				$record = array($form["name"]=>$form["val"]);
			}
		}
		if(array_key_exists("client_id", $form) && $form['client_id'] != ''){
			// 自サーバーに登録
			$this->db->update('master_client_new', $record, "client_id = {$form['client_id']}" );
		}
		return array('state'=> "1");
	}

	/**
	 * クライアントを論理削除する
	 * @param unknown $clientId	クライアントID
	 * @param unknown $staffId	担当者ID
	 * @throws Exception
	 */
	public function deletClient($clientId) {
		// 担当者を論理削除する
		$record["client_del_flg"] = "1";
		$this->db->update('master_client_new', $record, "client_id = {$clientId}" );
	}
	
	/**
	 * クライアント取得条件を指定しカウントを取得する
	 * @param unknown $condition
	 * @param unknown $order
	 * @param unknown $ordertype
	 */
	Public function getClientCount($condition) {
		$sql = "SELECT
					count(client_id) as count 
				FROM
					master_client_new
				WHERE
					client_del_flg = 0
					{$condition};
				";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn["count"];
	}
	
	
	/**
	 * クライアント取得条件を指定しリストを取得する
	 * @param unknown $condition
	 * @param unknown $order
	 * @param unknown $ordertype
	 */
	Public function getClientList($condition, $order, $ordertype, $page, $limit) {
		$offset = 0;
		$page = $page - 1;
		if($page > 0){
			$offset = $page * $limit;
		}
		$sql = "SELECT
					client_id,
					client_name,
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
					AES_DECRYPT(client_staffleaderfirstname,@key) as client_staffleaderfirstname,
					AES_DECRYPT(client_staffleaderlastname,@key) as client_staffleaderlastname,
					AES_DECRYPT(client_staffleaderfirstnamepy,@key) as client_staffleaderfirstnamepy,
					AES_DECRYPT(client_staffleaderlastnamepy,@key) as client_staffleaderlastnamepy,
					client_staffleaderemail,
					client_comment,
					client_idchar,
					AES_DECRYPT(client_staffleadername,@key) as client_staffleadername,
					aa_staff_id_list,
					option_passwd,
					publish_recording_talk_flg,
					publish_telephone_db_flg,
					valid_telephonelist_downloading_num,
					publish_analysis_menu_flg,
					sum_span_type,
					client_add_staff_flg, 
					create_date,
					update_date 
				FROM
					master_client_new
				WHERE
					client_del_flg = 0
					{$condition}
				ORDER BY
					{$order} {$ordertype} 
				LIMIT
					{$limit}
				OFFSET
					{$offset};
		";
		$rtn = $this->db->fetchAll($sql, array());
		return $rtn;
	}

	public function getStaffClientNamecardRow($clientId,$staffType,$staffId){
		$sql = "SELECT
					staff_type,
					staff_id,
					client_id,
					namecard_name_public_flg,
					namecard_meetin_public_flg,
					namecard_client_name,
					namecard_client_name_public_flg,
					namecard_email,
					namecard_email_public_flg,
					namecard_picture_public_flg,
					namecard_card_public_flg,
					namecard_department,
					namecard_department_public_flg,
					namecard_executive,
					namecard_executive_public_flg,
					namecard_postcode1,
					namecard_postcode2,
					namecard_address,
					namecard_address_public_flg,
					namecard_tel1,
					namecard_tel2,
					namecard_tel3,
					namecard_tel_public_flg,
					namecard_cell1,
					namecard_cell2,
					namecard_cell3,
					namecard_cell_public_flg,
					namecard_fax1,
					namecard_fax2,
					namecard_fax3,
					namecard_fax_public_flg,
					namecard_facebook,
					namecard_facebook_public_flg,
					namecard_sns,
					namecard_sns_public_flg,
					namecard_free1_name,
					namecard_free1_val,
					namecard_free1_public_flg,
					namecard_free2_name,
					namecard_free2_val,
					namecard_free2_public_flg
				FROM
					staff_client
				WHERE
					staff_type = '{$staffType}' AND staff_id = {$staffId} AND client_id = {$clientId}
		";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn;
	}

	/**
	 * client_idを指定しクライアントを１件取得する
	 */
	public function getMasterClientRow($clientId){
		$sql = "SELECT
					client_id,
					client_name,
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
					aa_staff_id_list,
					option_passwd,
					publish_recording_talk_flg,
					publish_telephone_db_flg,
					valid_telephonelist_downloading_num,
					publish_analysis_menu_flg,
					sum_span_type,
					client_add_staff_flg,
					create_date,
					update_date 
				FROM
					master_client_new
				WHERE
					client_id = :clientId AND
					client_del_flg = 0;";
		$rtn = $this->db->fetchRow($sql, array("clientId" => $clientId));
		return $rtn;
	}
	
	/**
	 * クライアント取得条件を指定しカウントを取得する
	 * @param unknown $condition
	 * @param unknown $order
	 * @param unknown $ordertype
	 */
	Public function getClientAndResultCount($condition, $retrievalType, $user) {
		$sql = "SELECT
					count(a.client_id) as count 
				FROM
					master_client_new as a 
				";
		if($retrievalType == "1"){
			// 担当クライアントのみを表示する場合の条件を追加
			$sql .= " 
					INNER JOIN 
						(
							SELECT 
								DISTINCT client_id 
							FROM 
								approach_list_and_staff_relation 
							WHERE 
								approach_list_staff_type = '{$user["staff_type"]}' AND 
								approach_list_staff_id = {$user["staff_id"]} 
						) as b 
						ON 
							a.client_id = b.client_id 
					";
		}
		$sql .= "
					WHERE
						a.client_del_flg = 0
						{$condition};";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn["count"];
	}
	
	/**
	 * クライアント取得条件を指定しクライアントリストとアプローチ結果を取得する
	 * @param unknown $condition
	 * @param unknown $order
	 * @param unknown $ordertype
	 */
	Public function getClientListAndResult($condition, $retrievalType, $user, $order, $ordertype, $page, $limit) {
		$offset = 0;
		$page = $page - 1;
		if($page > 0){
			$offset = $page * $limit;
		}
		$sql = "
				SELECT
					a.client_id,
					a.client_name,
					a.client_del_flg,
					a.client_namepy,
					a.client_postcode1,
					a.client_postcode2,
					a.client_address,
					a.client_tel1,
					a.client_tel2,
					a.client_tel3,
					a.client_fax1,
					a.client_fax2,
					a.client_fax3,
					a.client_homepage,
					AES_DECRYPT(a.client_staffleaderfirstname,@key) as client_staffleaderfirstname,
					AES_DECRYPT(a.client_staffleaderlastname,@key) as client_staffleaderlastname,
					AES_DECRYPT(a.client_staffleaderfirstnamepy,@key) as client_staffleaderfirstnamepy,
					AES_DECRYPT(a.client_staffleaderlastnamepy,@key) as client_staffleaderlastnamepy,
					a.client_staffleaderemail,
					a.client_comment,
					a.client_idchar,
					AES_DECRYPT(a.client_staffleadername,@key) as client_staffleadername,
					a.aa_staff_id_list,
					a.option_passwd,
					a.publish_recording_talk_flg,
					a.publish_telephone_db_flg,
					a.valid_telephonelist_downloading_num,
					a.publish_analysis_menu_flg,
					a.sum_span_type,
					a.client_add_staff_flg, 
					a.create_date,
					a.update_date, 
					MAX(b.last_result_date) as last_result_date 
				FROM 
					master_client_new as a 
				INNER JOIN 
					(
						SELECT
							a.client_id,
							MAX(b.tel_time) as last_result_date 
						FROM
							master_client_new as a 
						LEFT OUTER JOIN 
							result_telephone as b 
						ON 
							a.client_id = b.client_id AND 
							b.del_flg = 0  
						WHERE
							client_del_flg = 0
							{$condition} 
						GROUP BY 
							a.client_id 
						UNION 
						SELECT
							a.client_id,
							MAX(b.create_date) as last_result_date 
						FROM
							master_client_new as a 
						LEFT OUTER JOIN 
							result_mail as b 
						ON 
							a.client_id = b.client_id 
						WHERE
							client_del_flg = 0
							{$condition} 
						GROUP BY 
							a.client_id 
						UNION 
						SELECT
							a.client_id,
							MAX(b.update_date) as last_result_date 
						FROM
							master_client_new as a 
						LEFT OUTER JOIN 
							result_inquiry as b 
						ON 
							a.client_id = b.client_id AND 
							b.del_flg = 0 
						WHERE
							client_del_flg = 0
							{$condition} 
						GROUP BY 
							a.client_id
				) as b 
			ON 
				a.client_id = b.client_id 
		";
		if($retrievalType == "1"){
			// 担当クライアントのみを表示する場合の条件を追加
			$sql .= "INNER JOIN 
						(
							SELECT 
								DISTINCT client_id 
							FROM 
								approach_list_and_staff_relation 
							WHERE 
								approach_list_staff_type = '{$user["staff_type"]}' AND 
								approach_list_staff_id = {$user["staff_id"]} 
						) as c 
						ON 
							a.client_id = c.client_id  ";
		}
		$sql .= "GROUP BY 
					a.client_id 
				ORDER BY
					{$order} {$ordertype}
				LIMIT
					{$limit}
				OFFSET
					{$offset};";
		$rtn = $this->db->fetchAll($sql, array());
		return $rtn;
	}
	
	
	/**
	 * 架電結果とタブテンプレート登録
	 * Enter description here ...
	 * @param unknown_type $form
	 * @throws Exception
	 */
	public function registResultAndTabAndMemo($dict) {
		// DAOの宣言
		$templateApproachResultDao = Application_CommonUtil::getInstance("dao", "TemplateApproachResultDao", $this->db);
		
		$templateApproachTelephoneList = array(
				array("name"=>"受付拒否", "tab_bg_color"=>"A1BB94"),
				array("name"=>"受付資料請求", "tab_bg_color"=>"A1BB94"),
				array("name"=>"本人不在", "tab_bg_color"=>"A1BB94"),
				array("name"=>"本人拒否", "tab_bg_color"=>"85C8C5"),
				array("name"=>"本人資料請求", "tab_bg_color"=>"BC9EB2"),
				array("name"=>"アポイント", "tab_bg_color"=>"BC9EB2"),
				array("name"=>"その他", "tab_bg_color"=>"B3B4B3"),
				array("name"=>"時期改め", "tab_bg_color"=>"F0CB60"),
		);
		$templateApproachMailDmList = array(
				array("id"=>"0", "name"=>"未配信", "tab_bg_color"=>"fdeff2"),
				array("id"=>"1", "name"=>"送信エラー（宛先アドレスなし）", "tab_bg_color"=>"A1BB94"),
				array("id"=>"2", "name"=>"送信エラー（その他のエラー）", "tab_bg_color"=>"A1BB94"),
				array("id"=>"3", "name"=>"配信済み", "tab_bg_color"=>"eaedf7"),
				array("id"=>"4", "name"=>"開封", "tab_bg_color"=>"BC9EB2"),
				array("id"=>"5", "name"=>"リンク押下", "tab_bg_color"=>"BC9EB2"),
		);
		$templateApproachInquiryList = array(
				array("name"=>"お問い合わせ済み", "tab_bg_color"=>"eaedf7"),
				array("name"=>"お問い合わせの返信有り", "tab_bg_color"=>"BC9EB2")
		);
		// アプローチ結果とタブに必要な固定値を設定
		$templateApproachResultAndTabDict = array(
				'client_id'			=> $dict["clientId"],
				'tab_text_color'	=> "ffffff",
				'view_flg'			=> "1",
				'update_staff_type'	=> $dict["staffType"],
				'update_staff_id'	=> $dict["staffId"],
				'del_flg'			=> "0",
				'create_date'		=> new Zend_Db_Expr('now()'),
				'update_date'		=> new Zend_Db_Expr('now()')
		);
		// アプローチ結果とタブの紐付けに必要な固定値を設定
		$tabAndResultRelationDict = array(
				'client_id'		=> $dict["clientId"],
				'staff_type'	=> $dict["staffType"],
				'staff_id'		=> $dict["staffId"]
				);
		
		// 架電結果とタブの設定
		foreach($templateApproachTelephoneList as $templateApproachTelephone){
			// アプローチ結果とタブで動的に変更する値を設定
			$templateApproachResultAndTabDict["approach_type"] = self::APPRPACH_TYPE_TELEPHONE;
			$templateApproachResultAndTabDict["name"] = $templateApproachTelephone["name"];
			$templateApproachResultAndTabDict["tab_bg_color"] = $templateApproachTelephone["tab_bg_color"];
			// アプローチ結果の登録
			$templateApproachResultId = $templateApproachResultDao->regist($templateApproachResultAndTabDict);
		}
		
		// メールDM結果とタブの設定
		foreach($templateApproachMailDmList as $templateApproachMailDm){
			// アプローチ結果とタブで動的に変更する値を設定
			$templateApproachResultAndTabDict["id"] = $templateApproachMailDm["id"];
			$templateApproachResultAndTabDict["approach_type"] = self::APPRPACH_TYPE_MAILDM;
			$templateApproachResultAndTabDict["name"] = $templateApproachMailDm["name"];
			$templateApproachResultAndTabDict["tab_bg_color"] = $templateApproachMailDm["tab_bg_color"];
			// アプローチ結果の登録
			$templateApproachResultId = $templateApproachResultDao->insertMailResult($templateApproachResultAndTabDict);
		}
		// お問い合わせ結果とタブの設定
		foreach($templateApproachInquiryList as $templateApproachInquiry){
			// アプローチ結果とタブで動的に変更する値を設定
			$templateApproachResultAndTabDict["approach_type"] = self::APPRPACH_TYPE_INQUIRY;
			$templateApproachResultAndTabDict["name"] = $templateApproachInquiry["name"];
			$templateApproachResultAndTabDict["tab_bg_color"] = $templateApproachInquiry["tab_bg_color"];
			// アプローチ結果の登録
			$templateApproachResultId = $templateApproachResultDao->regist($templateApproachResultAndTabDict);
		}
		// ==============================================================================
		// 一斉発信はID指定で登録する（後から追加になったので、既に使用されているIDを飛ばして登録する
		// ==============================================================================
		$templateApproachResultDao->registMultipleTelephoneResult($dict["clientId"]);
	}
	
	/**
	 * 架電結果メモの初期テンプレート登録
	 * Enter description here ...
	 * @param unknown_type $form
	 * @throws Exception
	 */
	public function registResultMemoTemplate($clientId) {
		// DAOの宣言
		$templateResultMemoDao = Application_CommonUtil::getInstance("dao", "TemplateResultMemoDao", $this->db);
		// 架電ステータスの取得
		$sql = "select * from template_approach_result where client_id = {$clientId} AND approach_type = ".self::APPRPACH_TYPE_TELEPHONE." AND del_flg = 0; ";
		$templateApproachResultList = $this->db->fetchAll($sql);
	
		$state0TemplateList = array(
				"番号と電話先が違う",
				"留守番電話",
				"番号が使われていない",
				"コール音のみ"
		);
		$state1TemplateList = array(
				"受付担当者の断り(男性：年齢若)",
				"受付担当者の断り(男性：年齢高)",
				"受付担当者の断り(女性：年齢若)",
				"受付担当者の断り(女性：年齢高)",
				"受付担当者の厳しい断り(男性：年齢若)",
				"受付担当者の厳しい断り(男性：年齢高)",
				"受付担当者の厳しい断り(女性：年齢若)",
				"受付担当者の厳しい断り(女性：年齢高)",
				"担当者／責任者が別の事務所にいる",
				"担当部署が別の番号"
		);
		$state3TemplateList = array(
				"時期改め",
				"結構です(理由が分からない)",
				"すでに同様のサービス／製品を導入済",
				"予算を組んでいない／既に予算がない",
				"同じようなサービス／製品を導入したばかり",
				"外部に依頼はしない方針",
				"グループに一任しているので、判断できない"
		);
		$state7TemplateList = array(
				"興味がある様子。1か月以内に改め。",
				"興味がある様子。1か月後に改め。",
				"興味がある様子。2か月後に改め。",
				"興味がある様子。3か月後に改め。",
				"単純に時間がない様子。1か月以内に改め。",
				"単純に時間がない様子。1か月後に改め。",
				"単純に時間がない様子。2か月後に改め。",
				"単純に時間がない様子。3か月後に改め。"
		);
			
		$record = array(
				'client_id'		=> $clientId,
				'view_flg'		=> "1",
				'create_date'	=> new Zend_Db_Expr('now()'),
				'update_date'	=> new Zend_Db_Expr('now()'),
				'del_flg'		=> "0",
		);

		foreach($templateApproachResultList as $templateApproachResult){
			if($templateApproachResult["name"] == "その他"){
				// その他専用のデフォルト値を設定
				foreach($state0TemplateList as $state0Template){
					$record["template_approach_result_id"] = $templateApproachResult["id"];
					$record["name"] = $state0Template;
					$templateResultMemoDao->regist($record);
				}
			}else if($templateApproachResult["name"] == "受付拒否"){
				// 受付拒否専用のデフォルト値を設定
				foreach($state1TemplateList as $state1Template){
					$record["template_approach_result_id"] = $templateApproachResult["id"];
					$record["name"] = $state1Template;
					$templateResultMemoDao->regist($record);
				}
			}else if($templateApproachResult["name"] == "本人拒否"){
				// 本人拒否専用のデフォルト値を設定
				foreach($state3TemplateList as $state3Template){
					$record["template_approach_result_id"] = $templateApproachResult["id"];
					$record["name"] = $state3Template;
					$templateResultMemoDao->regist($record);
				}
			}else if($templateApproachResult["name"] == "時期改め"){
				// 時期改め専用のデフォルト値を設定
				foreach($state7TemplateList as $state7Template){
					$record["template_approach_result_id"] = $templateApproachResult["id"];
					$record["name"] = $state7Template;
					$templateResultMemoDao->regist($record);
				}
			}
		}
		return;
	}
	
	/**
	 * 有効なクライアントを取得する。
	 *
	 * 有効とは下記の状態を指す。
	 * ・削除されていないクライアントであること。
	 * ・キーワードが指定されている場合、キーワードに一致、もしくは中間一致するクライアント。
	 *
	 * @param unknown $yy_mm
	 * @param unknown $keyword
	 * @return multitype:
	 */
	public function getClientListByClientName($client_name) {
	
		$add_condi = '';
		if ($client_name != '') {
			$add_condi = " and (c1.client_id like '%{$client_name}%' or c1.client_name like '%{$client_name}%' )";
		}
	
		$sql = "
		SELECT
		c1.client_id,
		c1.client_name,
		c1.create_date
		FROM
		master_client_new as c1
		WHERE
		c1.client_del_flg = 0
		{$add_condi}
		";
	
		$result = $this->db->fetchAll($sql);
		return $result;
	}	
}