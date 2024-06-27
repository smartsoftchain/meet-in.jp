<?php

require_once ROOT.'library/Application/validation.php';

/**
 * アプローチ結果コントローラーで使用するモデル
 * @author admin
 *
 */
class SettingApproachResultModel extends AbstractModel{
	const IDENTIFIER			 	= "setting-approach";
	const REFERER_APPROACH_RESULT 	= "approach-result";	// アプローチ結果一覧のアクション名
	const REFERER_APPROACH_TAB    	= "approach-tab";		// アプローチタブ一覧のアクション名
	
	const APPROACH_TYPE_TELEPHONE = 		1;									// 電話のアプローチ
	const APPROACH_TYPE_MAILDM = 			2;									// メールDMのアプローチ
	const APPROACH_TYPE_INQUIRY = 			3;									// お問い合わせのアプローチ
	const APPROACH_TYPE_LEAD_MANAGEMENT =   4;									// リード管理のアプローチ
	
	private $db;	// DBコネクション

	function __construct($db){
		$this->db = $db;
		parent::init();
	}
	
	/**
	 * アプローチ結果を登録する
	 * @param unknown $form
	 * @param unknown $screenSession
	 */
	public function registApproachResult($form, $request, &$screenSession){
		// action共通セッションの初期化
		if($screenSession->isnew == true){
			$screenSession->approach_type = '1';
			$screenSession->order = 'id';
			$screenSession->ordertype = 'asc';	// 任意
			// 画面初期表示時はセッションを初期化する
			Application_CommonUtil::unsetSession(self::IDENTIFIER);
		}
		// パラメータをセッションに格納
		foreach($form as $key=>$val){
			$screenSession->$key = $val;
		}
		// daoの宣言
		$templateApproachResultDao = Application_CommonUtil::getInstance('dao', "TemplateApproachResultDao", $this->db);
		
		// セッション情報を取得する
		$session = Application_CommonUtil::getSession(self::IDENTIFIER);
		
		$result = array();
		$result["getDbDataFlg"] = 0;
		$result["registFlg"] = 0;
		$templateApproachResultList = array();
		$errorList = array();
		// POST且つリファラーが正しければ登録処理
		if ($request->isPost() && Application_CommonUtil::refererCheck(self::REFERER_APPROACH_RESULT)) {
			// 既存のデータが削除されていないか比較用の配列
			$forCheckApproachResultList = array();
			if(!is_null($session->templateApproachResultList)){
				foreach($session->templateApproachResultList as $approachResult){
					$key = "{$screenSession->approach_type}_{$approachResult["id"]}";
					$forCheckApproachResultList[$key] = $approachResult;
				}
			}
			// バリデーションを実行しつつ更新用データを作成する
			$approachResultList = array();
			$errApproachResultList = array();	// エラーがある場合はデータを画面に返す必要があるので登録データ以外も保存しておく
			foreach($form["name"] as $key=>$name){
				// バリデーションを実行
				$tmpErrorList = $this->ApproachResultValidation(array("name"=>$name));
				foreach($tmpErrorList as $tmpError){
					$errorList[] = $tmpError;
				}
				// 固定の値を先に設定する
				$approachResultDict = array();
				$approachResultDict["client_id"] = $this->user["client_id"];
				$approachResultDict["approach_type"] = $screenSession->approach_type;
				$approachResultDict["view_flg"] = "1";
				$approachResultDict["update_staff_type"] = $this->user["staff_type"];
				$approachResultDict["update_staff_id"] = $this->user["staff_id"];
				$approachResultDict["del_flg"] = "0";
				$approachResultDict["tab_name"] = $form["tab_name"][$key];
				// 既存のデータの場合はチェック更新するか削除するかチェックする
				if(array_key_exists($key, $forCheckApproachResultList)){
					$approachResultDict["id"] = $forCheckApproachResultList[$key]["id"];
					$approachResultDict["name"] = $name;
					// アプローチ名を比較し変更がある場合のみ登録対象とする
					if($forCheckApproachResultList[$key]["name"] != $name){
						$approachResultList[] = $approachResultDict;
					}
					// 既存のデータの場合は削除対象から弾く
					unset($forCheckApproachResultList[$key]);
				}else{
					// 新規データは登録データとしてリストに保存する
					$approachResultDict["name"] = $name;
					$approachResultList[] = $approachResultDict;
				}
				$errApproachResultList[] = $approachResultDict;
			}
			if(count($errorList) == 0){
				// トランザクションスタート
				$this->db->beginTransaction();
				try{
					// エラーがなければ登録処理を行う
					foreach($approachResultList as $approachResult){
						$templateApproachResultDao->regist($approachResult);
					}
					if(count($forCheckApproachResultList) > 0){
						// 既存のデータが無くなっている場合は削除フラグを立てる
						foreach($forCheckApproachResultList as &$forCheckApproachResult){
							$forCheckApproachResult["del_flg"] = 1;
							$templateApproachResultDao->regist($forCheckApproachResult);
						}
					}
					// 登録完了したらコミットする
					$this->db->commit();
					// 登録完了時は自画面へリダイレクトさせるためのフラグを立てる
					$result["registFlg"] = 1;
				}catch(Exception $e){
					$this->db->rollBack();
					throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
				}
				$errorList[] = $this->message->success->regist->common;
			}else{
				// エラーが存在するので画面へ返す
				$templateApproachResultList = $errApproachResultList;
			}
		}else{
			// データベースから値を取得するフラグを立てる
			$result["getDbDataFlg"] = 1;
		}
		// DBからデータ取得を行う為のフラグが立って入ればDBからデータを取得する
		if($result["getDbDataFlg"] == 1){
			// 検索条件の作成[a:template_approach_result, b:tab_and_result_relation, c:template_approach_tab]
			$condition = " a.client_id = {$this->user["client_id"]} AND a.approach_type = {$screenSession->approach_type} AND a.del_flg = 0 ";
			// アプローチ結果を取得する
			$templateApproachResultList = $templateApproachResultDao->getTemplateApproachResultAndTab($condition, $screenSession->order, $screenSession->ordertype);
			// 現在のアプローチ結果をセッションに設定する
			$session->templateApproachResultList = $templateApproachResultList;
		}
		// 現在のアプローチ結果を戻り値に設定する
		$result["templateApproachResultList"] = $templateApproachResultList;
		$result["errorList"] = $errorList;
		return $result;
	}
	
	/**
	 * アプローチタブを登録する
	 * @param unknown $form
	 * @param unknown $screenSession
	 */
	public function registApproachTab($form, $request, &$screenSession){
		// action共通セッションの初期化
		if($screenSession->isnew == true){
			$screenSession->approach_type = '1';
			$screenSession->order = 'id';
			$screenSession->ordertype = 'asc';	// 任意
			// 画面初期表示時はセッションを初期化する
			Application_CommonUtil::unsetSession(self::IDENTIFIER);
		}
		// パラメータをセッションに格納
		foreach($form as $key=>$val){
			$screenSession->$key = $val;
		}
		// daoの宣言
		$templateApproachResultDao = Application_CommonUtil::getInstance('dao', "TemplateApproachResultDao", $this->db);
		$templateApproachTabDao = Application_CommonUtil::getInstance('dao', "TemplateApproachTabDao", $this->db);
		$tabAndResultRelationDao = Application_CommonUtil::getInstance('dao', "TabAndResultRelationDao", $this->db);
	
		// セッション情報を取得する
		$session = Application_CommonUtil::getSession(self::IDENTIFIER);
	
		$result = array();
		$result["getDbDataFlg"] = 0;
		$templateApproachResultList = array();
		$templateApproachTabList = array();
		$errorList = array();
		// POST且つリファラーが正しければ登録処理
		if ($request->isPost() && Application_CommonUtil::refererCheck(self::REFERER_APPROACH_TAB)) {
			// 既存のデータが削除されていないか比較用の配列
			$forCheckApproachTabList = array();
			if(!is_null($session->templateApproachTabList)){
				foreach($session->templateApproachTabList as $approachTab){
					$key = "{$screenSession->approach_type}_{$approachTab["id"]}";
					$forCheckApproachTabList[$key] = $approachTab;
				}
			}
			// バリデーションを実行しつつ更新用データを作成する
			$approachTabList = array();
			$errApproachTabList = array();	// エラーがある場合はデータを画面に返す必要があるので登録データ以外も保存しておく
			foreach($form["name"] as $key=>$name){
				// データを整形する
				$approachTabDict = array();
				$approachTabDict["client_id"] = $this->user["client_id"];
				$approachTabDict["approach_type"] = $screenSession->approach_type;
				$approachTabDict["name"] = $form["name"][$key];
				$approachTabDict["tab_bg_color"] = $form["tab_bg_color"][$key];
				$approachTabDict["tab_text_color"] = $form["tab_text_color"][$key];
				$approachTabDict["view_flg"] = "1";
				$approachTabDict["update_staff_type"] = $this->user["staff_type"];
				$approachTabDict["update_staff_id"] = $this->user["staff_id"];
				$approachTabDict["del_flg"] = "0";
				$approachTabDict["approach_result_ids"] = $form["approach_result_ids"][$key];
				$approachTabDict["approach_result_name"] = $form["approach_result_name"][$key];
				// タブのバリデーションを実行
				$tmpErrorList = $this->ApproachTabValidation($approachTabDict);
				foreach($tmpErrorList as $tmpError){
					$errorList[] = $tmpError;
				}
				// タブに紐付くアプローチ結果バリデーションを実行
				$tmpError = $this->ApproachTabRelationValidation($form["approach_result_ids"][$key], $screenSession->approach_type, $templateApproachResultDao);
				if($tmpError != ""){
					$errorList[] = $tmpError;
				}
				// 既存のデータの場合はチェック更新するか削除するかチェックする
				if(array_key_exists($key, $forCheckApproachTabList)){
					$approachTabDict["id"] = $forCheckApproachTabList[$key]["id"];
					// アプローチ名を比較
					if($forCheckApproachTabList[$key]["name"] != $name || 
						$forCheckApproachTabList[$key]["tab_bg_color"] != $form["tab_bg_color"][$key] || 
						$forCheckApproachTabList[$key]["tab_text_color"] != $form["tab_text_color"][$key] || 
						$forCheckApproachTabList[$key]["approach_result_ids"] != $form["approach_result_ids"][$key]){
						// 表示データと登録データに差分がある場合のみ登録する
						$approachTabList[] = $approachTabDict;
					}
					// 既存のデータの場合は削除対象から弾く
					unset($forCheckApproachTabList[$key]);
				}else{
					// 新規データは登録データとしてリストに保存する
					$approachTabList[] = $approachTabDict;
				}
				
				// 新規追加は「表示するアプローチ結果」が存在しないので補填する
				if($approachTabDict["approach_result_name"] == "" && $approachTabDict["approach_result_ids"] != ""){
					$condition = " client_id = {$this->user["client_id"]} AND approach_type = {$screenSession->approach_type} AND id IN ({$approachTabDict["approach_result_ids"]}) AND del_flg = 0 ";
					$templateApproachResultList = $templateApproachResultDao->getTemplateApproachResultByCondition($condition, "id", "asc");
					$tmpNameList = array();
					foreach($templateApproachResultList as $templateApproachResult){
						$tmpNameList[] = $templateApproachResult["name"];
					}
					$approachTabDict["approach_result_name"] = join("<br>", $tmpNameList);
				}
				$errApproachTabList[] = $approachTabDict;
			}
			if(count($errorList) == 0){
				// トランザクションスタート
				$this->db->beginTransaction();
				try{
					// エラーがなければ登録処理を行う
					foreach($approachTabList as $approachTab){
						// アプローチタブの登録
						$approachTabId = $templateApproachTabDao->regist($approachTab);
						// アプローチタブと結果の紐づきをリセットする
						$condition = " client_id = {$this->user["client_id"]} AND approach_type = {$screenSession->approach_type} AND approach_tab_id = {$approachTabId} ";
						$tabAndResultRelationDao->delete($condition);
						if($approachTab["approach_result_ids"] != ""){
							// アプローチタブと結果の登録
							$approachResultIds = explode(",", $approachTab["approach_result_ids"]);
							foreach($approachResultIds as $approachResultId){
								$tabAndResultRelation = array();
								$tabAndResultRelation["client_id"] = $this->user["client_id"];
								$tabAndResultRelation["approach_type"] = $screenSession->approach_type;
								$tabAndResultRelation["approach_tab_id"] = $approachTabId;
								$tabAndResultRelation["approach_result_id"] = $approachResultId;
								$tabAndResultRelation["staff_type"] = $this->user["staff_type"];
								$tabAndResultRelation["staff_id"] = $this->user["staff_id"];
								$tabAndResultRelationDao->regist($tabAndResultRelation);
							}
						}
					}
					if(count($forCheckApproachTabList) > 0){
						// 既存のデータが無くなっている場合は削除フラグを立てる
						foreach($forCheckApproachTabList as &$forCheckApproachTab){
							$forCheckApproachTab["del_flg"] = 1;
							$templateApproachTabDao->regist($forCheckApproachTab);
						}
					}
					// 登録完了したらコミットする
					$this->db->commit();
					// データベースから値を取得するフラグを立てる
					$result["getDbDataFlg"] = 1;
				}catch(Exception $e){
					$this->db->rollBack();
					throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
				}
				$errorList[] = $this->message->success->regist->common;
			}else{
				// エラーが存在するので画面へ返す
				$templateApproachTabList = $errApproachTabList;
			}
		}else{
			// データベースから値を取得するフラグを立てる
			$result["getDbDataFlg"] = 1;
		}
		// DBからデータ取得を行う為のフラグが立って入ればDBからデータを取得する
		if($result["getDbDataFlg"] == 1){
			// ===================================================================================================================================================
			// アプローチタブ情報を取得する
			// 検索条件の作成[a:template_approach_tab, b:tab_and_result_relation, c:template_approach_result, d:approach_list_and_tab_relation, e:approach_list]
			// ===================================================================================================================================================
			$condition = " a.client_id = {$this->user["client_id"]} AND a.approach_type = {$screenSession->approach_type} AND a.del_flg = 0 ";
			// アプローチタブを取得する
			$templateApproachTabList = $templateApproachTabDao->getTemplateApproachTabAndResultAndList($this->user["client_id"], $condition, $screenSession->order, $screenSession->ordertype);
			
			// 現在のアプローチ結果をセッションに設定する
			$session->templateApproachTabList = $templateApproachTabList;
		}
		// アプローチ結果情報を取得する
		$condition = " client_id = {$this->user["client_id"]} AND approach_type = {$screenSession->approach_type} AND del_flg = 0 ";
		// アプローチ結果を取得する
		$templateApproachResultList = $templateApproachResultDao->getTemplateApproachResultByCondition($condition, "id", "asc");
		
		// 現在のアプローチ結果を戻り値に設定する
		$result["templateApproachTabList"] = $templateApproachTabList;
		$result["templateApproachResultListJson"] = json_encode($templateApproachResultList);
		$result["errorList"] = $errorList;
		return $result;
	}
	
	/**
	 * リード管理タブを登録する
	 * @param unknown $form
	 * @param unknown $screenSession
	 */
	public function registLeadManagementTab($form, $request, &$screenSession){
		
		// action共通セッションの初期化
		if ($screenSession->isnew == true) {
			$screenSession->approach_type = '1';
			$screenSession->order = 'id';
			$screenSession->ordertype = 'asc';	// 任意
			
			// 画面初期表示時はセッションを初期化する
			Application_CommonUtil::unsetSession(self::IDENTIFIER);
		}
		
		// パラメータをセッションに格納
		foreach($form as $key=>$val){
			$screenSession->$key = $val;
		}
		
		// daoの宣言
		$templateApproachResultDao   = Application_CommonUtil::getInstance('dao', "TemplateApproachResultDao", $this->db);
		$templateApproachTabDao      = Application_CommonUtil::getInstance('dao', "TemplateApproachTabDao", $this->db);
		$tabAndResultRelationDao     = Application_CommonUtil::getInstance('dao', "TabAndResultRelationDao", $this->db);
		$leadTabAndResultRelationDao = Application_CommonUtil::getInstance('dao', "LeadTabAndResultRelationDao", $this->db);
	
		// セッション情報を取得する
		$session = Application_CommonUtil::getSession(self::IDENTIFIER);
	
		$result = array();
		$result["getDbDataFlg"]     = 0;
		$templateApproachResultList = array();
		$templateApproachTabList    = array();
		
		$errorList = array();
		
		// POST且つリファラーが正しければ登録処理
		if ($request->isPost()) {
			
			// 既存のデータが削除されていないか比較用の配列
			$forCheckApproachTabList = array();
			if(!is_null($session->templateApproachTabList)){
				foreach($session->templateApproachTabList as $approachTab){
					$key = "{$screenSession->approach_type}_{$approachTab["id"]}";
					$forCheckApproachTabList[$key] = $approachTab;
				}
			}
			
			// データ挿入/更新を行うためのタブデータを取得
			$leadTabList = $this->getLeadTabList($form, $screenSession, $forCheckApproachTabList, $templateApproachResultDao);
			
			$approachTabList    = $leadTabList["approachTabList"];
			$errorList          = $leadTabList["errorList"];
			$errApproachTabList = $leadTabList["errApproachTabList"];
			
			if (count($errorList) == 0) {
				
				// トランザクションスタート
				$this->db->beginTransaction();
				
				try {
					
					// エラーがなければ登録処理を行う
					foreach ($approachTabList as $approachTab) {
						
						// アプローチタブの登録
						$approachTabId = $templateApproachTabDao->regist($approachTab);
						
						if ($approachTab["approach_result_ids"] != "") {
							
							// リクエスト情報が「カンマ(,)」区切りで送信されてくるので分割。例：[2_1,0_1,1_1]
							$approachResultIds = explode(",", $approachTab["approach_result_ids"]);
							
							// アプローチタブと結果の紐づきをリセットする
							$condition = " client_id = {$this->user["client_id"]} AND approach_tab_id = {$approachTabId} ";
							$leadTabAndResultRelationDao->delete($condition);
							
							// アプローチタブと結果の登録
							foreach ($approachResultIds as $approach) {
								
								//[approachType_approachResultId]の形式で値が入っているので分割
								list($approachType, $approachResultId) = explode("_", $approach);
								
								$tabAndResultRelation = array();
								$tabAndResultRelation["client_id"]          = $this->user["client_id"];
								$tabAndResultRelation["approach_type"]      = $approachType;
								$tabAndResultRelation["approach_tab_id"]    = $approachTabId;
								$tabAndResultRelation["approach_result_id"] = $approachResultId;
								$tabAndResultRelation["staff_type"]         = $this->user["staff_type"];
								$tabAndResultRelation["staff_id"]           = $this->user["staff_id"];
								
								$leadTabAndResultRelationDao->regist($tabAndResultRelation);
							}
						}
					}
					
					if (count($forCheckApproachTabList) > 0) {
						
						// 既存のデータが無くなっている場合は削除フラグを立てる
						foreach($forCheckApproachTabList as &$forCheckApproachTab){
							$forCheckApproachTab["del_flg"] = 1;
							$templateApproachTabDao->regist($forCheckApproachTab);
						}
					}
					// 登録完了したらコミットする
					$this->db->commit();
					// データベースから値を取得するフラグを立てる
					$result["getDbDataFlg"] = 1;
				} catch(Exception $e) {
					$this->db->rollBack();
					throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
				}
				
				$errorList[] = $this->message->success->regist->common;
				
			} else {
				// エラーが存在するので画面へ返す
				$templateApproachTabList = $errApproachTabList;
			}
			
		} else {
			// データベースから値を取得するフラグを立てる
			$result["getDbDataFlg"] = 1;
		}
		
		// DBからデータ取得を行う為のフラグが立って入ればDBからデータを取得する
		if ($result["getDbDataFlg"] == 1) {
			// ===================================================================================================================================================
			// アプローチタブ情報を取得する
			// 検索条件の作成[a:template_approach_tab, b:tab_and_result_relation, c:template_approach_result, d:approach_list_and_tab_relation, e:approach_list]
			// ===================================================================================================================================================
			$condition = " a.client_id = {$this->user["client_id"]} AND a.approach_type = {$screenSession->approach_type} AND a.del_flg = 0 ";
			// アプローチタブを取得する
			$templateApproachTabList = $templateApproachTabDao->getLeadTabAndResultAndList($this->user["client_id"], $condition, $screenSession->order, $screenSession->ordertype);
				
			// 現在のアプローチ結果をセッションに設定する
			$session->templateApproachTabList = $templateApproachTabList;
		}
	
		// アプローチタイプが「リード管理」の場合は、すべてのアプローチタイプに紐づくアプローチ結果を取得する
		$condition = " client_id = {$this->user["client_id"]} AND del_flg = 0 ";
	
		// アプローチ結果を取得する
		$templateApproachResultList = $templateApproachResultDao->getTemplateApproachResultByCondition($condition, "id", "asc");
	
		// 現在のアプローチ結果を戻り値に設定する
		$result["templateApproachTabList"]        = $templateApproachTabList;
		$result["templateApproachResultListJson"] = json_encode($templateApproachResultList);
		$result["errorList"] = $errorList;
		return $result;
	}
	
	/**
	 * 登録または更新するリード管理タブリスト情報を取得
	 * @param unknown $form
	 * @param unknown $screenSession
	 * @param unknown $forCheckApproachTabList
	 * @return multitype:multitype:multitype:NULL   multitype:multitype: multitype:NULL string   multitype:unknown unknown
	 */
	private function getLeadTabList($form, &$screenSession, &$forCheckApproachTabList, $templateApproachResultDao) {
			
		// バリデーションを実行しつつ更新用データを作成する
		$approachTabList    = array();
		$errApproachTabList = array();	// エラーがある場合はデータを画面に返す必要があるので登録データ以外も保存しておく
		$errorList          = array();
		
		if (!empty($form["name"])) {

			foreach ($form["name"] as $key => $name) {
			
				// データを整形する
				$approachTabDict = array();
				$approachTabDict["client_id"]            = $this->user["client_id"];
				$approachTabDict["approach_type"]        = $screenSession->approach_type;
				$approachTabDict["name"]                 = $form["name"][$key];
				$approachTabDict["tab_bg_color"]         = $form["tab_bg_color"][$key];
				$approachTabDict["tab_text_color"]       = $form["tab_text_color"][$key];
				$approachTabDict["view_flg"]             = "1";
				$approachTabDict["update_staff_type"]    = $this->user["staff_type"];
				$approachTabDict["update_staff_id"]      = $this->user["staff_id"];
				$approachTabDict["del_flg"]              = "0";
				$approachTabDict["approach_result_ids"]  = $form["approach_result_ids"][$key];
					
				// 新規の場合は存在しないため、存在する場合のみ設定
				if (!empty($form["approach_result_name"]) && !empty($form["approach_result_name"][$key])) {
					$approachTabDict["approach_result_name"] = $form["approach_result_name"][$key];
				}
			
				// タブのバリデーションを実行
				$tmpErrorList = $this->ApproachTabValidation($approachTabDict);
				foreach ($tmpErrorList as $tmpError) {
					$errorList[] = $tmpError;
				}
			
				// タブに紐付くアプローチ結果バリデーションを実行
				$tmpResult = $this->getLeadTabApproachResultName($form["approach_result_ids"][$key], $templateApproachResultDao);
			
				if (!empty($tmpResult["error"])) {
					$errorList[] = $tmpResult["error"];
				}
			
				// 既存のデータの場合はチェック更新するか削除するかチェックする
				if (array_key_exists($key, $forCheckApproachTabList)) {
						
					$approachTabDict["id"] = $forCheckApproachTabList[$key]["id"];
					// アプローチ名を比較
					if ($forCheckApproachTabList[$key]["name"] != $name ||
							$forCheckApproachTabList[$key]["tab_bg_color"] != $form["tab_bg_color"][$key] ||
							$forCheckApproachTabList[$key]["tab_text_color"] != $form["tab_text_color"][$key] ||
							$forCheckApproachTabList[$key]["approach_result_ids"] != $form["approach_result_ids"][$key]) {
								// 表示データと登録データに差分がある場合のみ登録する
								$approachTabList[] = $approachTabDict;
							}
								
							// 既存のデータの場合は削除対象から弾く
							unset($forCheckApproachTabList[$key]);
								
				} else {
					// 新規データは登録データとしてリストに保存する
					$approachTabList[] = $approachTabDict;
				}
			
				// 新規追加は「表示するアプローチ結果」が存在しないので補填する
				if (empty($approachTabDict["approach_result_name"]) && $approachTabDict["approach_result_ids"] != "") {
					$approachTabDict["approach_result_name"] = $tmpResult["approachResultName"];
				}
					
				$errApproachTabList[] = $approachTabDict;
			}
		}
		
		return array(
			"approachTabList"    => $approachTabList,
			"errorList"          => $errorList,
			"errApproachTabList" => $errApproachTabList	
		);
	}

	/**
	 * アプローチ結果用のバリデーション
	 * @param unknown $form
	 */
	function ApproachResultValidation($data){
		$validationDict = array(
				"name"					=> array("name"=>"アプローチ結果名",		"length" =>32,	"validate" => array(1))
		);
		$errorList = executionValidation($data, $validationDict);
		return $errorList;
	}
	
	/**
	 * アプローチタブ用のバリデーション
	 * @param unknown $form
	 */
	function ApproachTabValidation($data){
		$validationDict = array(
				"name"					=> array("name"=>"アプローチタブ名",		"length" =>32,	"validate" => array(1)),
				"tab_bg_color"			=> array("name"=>"タブの色",			"length" =>6,	"validate" => array(1, 4)),
				"tab_text_color"		=> array("name"=>"タブの文字色",		"length" =>6,	"validate" => array(1, 4)),
		);
		$errorList = executionValidation($data, $validationDict);
		return $errorList;
	}
	
	/**
	 * アプローチタブに紐付くアプローチ結果のバリデーション
	 * @param unknown $data
	 * @return unknown
	 */
	function ApproachTabRelationValidation($data, $approachType, $templateApproachResultDao){
		// 戻り値
		$result = "";
		if($data != ""){
			// 条件を設定しデータを取得する
			$condition = " client_id = {$this->user["client_id"]} AND approach_type = {$approachType} AND id IN ({$data}) AND del_flg = 0 ";
			$templateApproachResultList = $templateApproachResultDao->getTemplateApproachResultByCondition($condition, "id", "asc");
			// 取得したデータ件数と、画面で選択した数を比較する
			$approachResultIds = explode(",", $data);
			if(count($templateApproachResultList) != count($approachResultIds)){
				$result = "不正なアプローチ結果が選択されました。";
			}
		}else{
			$result = "アプローチ結果を選択して下さい。";
		}
		return $result;
	}
	
	/**
	 * リードタブに紐付くアプローチ結果名の取得
	 * ※内部でバリデートも行う。
	 * @param unknown $data
	 * @return unknown
	 */
	function getLeadTabApproachResultName($approachResultIdList, $templateApproachResultDao) {
		
		// 戻り値
		$result = "";
		$error  = "";
		$approachResultName = ""; 
		
		if ($approachResultIdList != "") {
			
			// 取得したデータ件数と、画面で選択した数を比較する
			$approachResultIds = explode(",", $approachResultIdList);
			
			$condition = " client_id = {$this->user["client_id"]} AND ( ";
			$lastIndex = count($approachResultIds) - 1;
			foreach ($approachResultIds as $index => $approach) {
				
				//[approachType_approachResultId]の形式で値が入っているので分割
				list($approachType, $approachResultId) = explode("_", $approach);
				
				if ($index == $lastIndex) {
					$condition .= " (approach_type = {$approachType} AND id = {$approachResultId}) ";
				} else {
					$condition .= " (approach_type = {$approachType} AND id = {$approachResultId}) OR ";
				}
			}
			$condition .= " ) AND del_flg = 0 ";
			
			// 条件を設定しデータを取得する
			$templateApproachResultList = $templateApproachResultDao->getTemplateApproachResultByCondition($condition, "id", "asc");
			
			if(count($templateApproachResultList) != count($approachResultIds)){
				$error = "不正なアプローチ結果が選択されました。";
			}
			
			// 名前を取得
			$tmpNameList = "";
			foreach ($templateApproachResultList as $templateApproachResult) {
				$tmpNameList[] = $templateApproachResult["name"];
			}
			$approachResultName = join("<br>", $tmpNameList);
			
		} else {
			$error = "アプローチ結果を選択して下さい。";
		}
		
		$result = array(
			"error"              => $error,
			"approachResultName" => $approachResultName	
		);
		
		return $result;
	}
}