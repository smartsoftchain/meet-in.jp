<?php
class WebinarLeadModel extends AbstractModel{

	const IDENTIFIER = "webinar_lead";		// セッション変数のnamespace
	const CSV_LEAD_ROW_COUNT = 10;			// csvでファイル登録する場合の１行の項目数
	const REGIST_CSV_TYPE_DUPLICATION = 1;	// メールアドレスを重複したまま登録する
	const REGIST_CSV_TYPE_UNIQUE = 2;		// メールアドレスを一意にして登録する
	private $db;							// DBコネクション
	function __construct($db){
		parent::init();
		$this->db = $db;
	}
	
	public function init() {
	}

	/**
	 * ウェビナー一覧の表示に必要なデータを取得する
	 * @param array $form
	 * @param array $screenSession
	 * @return object
	 */
	function getWebinarLeadList($form, &$screenSession){
		// セッションの初期化
		if($screenSession->isnew == true){
			$screenSession->order = 'id';
			$screenSession->page = 1;
			$screenSession->pagesize = 100;
			$screenSession->ordertype = 'desc';	// 任意
		}
		// パラメータをセッションに格納
		foreach($form as $key=>$val){
			$screenSession->$key = $val;
		}
		// daoの宣言
		$webinarLeadDao = Application_CommonUtil::getInstance("dao", "WebinarLeadDao", $this->db);
		// フリーワード変数の初期化
		$freeWord = "";
		// 検索ボタンが押下された場合、ページを初期化する
		if(array_key_exists("free_word", $form)){
			$screenSession->page = 1;
		}
		// 検索条件が存在する場合検索条件をエスケープする
		if(!is_null($screenSession->free_word)){
			$freeWord = $this->escape($screenSession->free_word);
		}
		// ウェビナー全件を取得する
		$count = $webinarLeadDao->getWebinarLeadCount($this->user["client_id"], $freeWord);
		// ウェビナーのリストを取得する
		$list = $webinarLeadDao->getWebinarLeadList($this->user["client_id"], $freeWord, $screenSession->order, $screenSession->ordertype, $screenSession->page, $screenSession->pagesize);
		$listObject = new Application_Pager(array(
				"itemData"	=> $list,						// リスト
				"itemCount"	=> $count,						// リスト
				"perPage"	=> $screenSession->pagesize,	// ページごと表示件数
				"curPage"	=> $screenSession->page,		// 表示するページ
				"order"		=> $screenSession->order,		// ソートカラム名
				"orderType"	=> $screenSession->ordertype,	// asc or desc
		));
		// 登録経路
		$registRoute = array(
			self::REGIST_ROUTE_FROM_ADMIN => "管理画面から登録",
			self::REGIST_ROUTE_FROM_PARTICIPANT => "参加予約から登録", 
		);
		// 戻り値を作成し返す
		return array("listObject"=>$listObject, "registRoute" => $registRoute);
	}

	/**
	 * ウェビナーリードの削除処理
	 * @param array $form
	 * @return array
	 */
	public function deleteWebinarLead($form){
		// daoの宣言
		$webinarLeadDao = Application_CommonUtil::getInstance("dao", "WebinarLeadDao", $this->db);
		// 戻り値宣言
		$result = array("status"=>0, "errors"=>array());
		// トランザクションスタート
		$this->db->beginTransaction();
		try{
			foreach($form["webinarLeadIds"] as $webinarLeadId){
				// ウェビナーリードを削除する
				$webinarLeadDao->deleteWebinarLead($this->escape(intval($webinarLeadId)), $this->user["client_id"]);
				// TODO ウェビナーリードに紐づく行動履歴を削除する
			}
			// コミットする（メールの送信結果に関わらず、DBはコミットする）
			$this->db->commit();
			// 登録完了ステータスを変更する
			$result["status"] = 1;
		}catch(Exception $e){
			$this->db->rollBack();
			$result["errors"][] = "想定外のエラーが発生しました。再度お申し込みください。";
			//$result["errors"][] = array("system_error"=> $e->getMessage());
		}
		// 戻り値を返す
		return $result;
	}

	/**
	 * ウェビナー参加者の登録処理
	 * @param array $form
	 * @param array $request
	 * @return object
	 */
	public function regist($form, $request, &$screenSession){
		// 戻り値の宣言
		$result = array(
			"webinarLeadDict"		=> array(),
			"errorList"				=> array(),
			"registCompleteFlg"		=> 0
		);
		// セッション取得
		$session = Application_CommonUtil::getSession(self::IDENTIFIER);
		// daoの宣言
		$webinarLeadDao = Application_CommonUtil::getInstance("dao", "WebinarLeadDao", $this->db);
		// POSTデータが存在する場合は、登録・更新処理を行う
		if ($request->isPost()){
			// 新規登録処理
			$result = $this->commonRegits($result, $form, $session, $webinarLeadDao);
		}else{
			// セッション情報を初期化し、再取得する
			$session = Application_CommonUtil::resetSession(self::IDENTIFIER);
			if(array_key_exists("id", $form)){
				// 編集の場合GETパラメータをセッションに保持し、ウェビナーリード情報を１件取得する
				$session->webinarLeadId = $this->escape(intval($form["id"]));
				$result["webinarLeadDict"] = $webinarLeadDao->getWebinarLeadRow($session->webinarLeadId, $this->user["client_id"]);
				// 郵便番号を分割する
				$result["webinarLeadDict"]["postcode1"] = current(explode("-", $result["webinarLeadDict"]["postcode"]));
				$result["webinarLeadDict"]["postcode2"] = end(explode("-", $result["webinarLeadDict"]["postcode"]));
				// 登録データではない項目の設定
				$result["webinarLeadDict"]["regist_type"] = 1;
			}else{
				// 新規作成の場合
				$result["webinarLeadDict"] = array(
					"name" => "",					// 名前
					"kana" => "",					// フリガナ
					"tel_number" => "",				// 電話番号
					"mail_address" => "",			// メールアドレス
					"postcode1" => "",				// 郵便番号1
					"postcode2" => "",				// 郵便番号2
					"street_address" => "",			// 住所
					"company_name" => "",			// 企業名
					"company_department" => "",		// 部署
					"company_position" =>"",		// 役職
					"remarks" => "",				// 備考
					"regist_type"=>1				// 登録種別
				);
			}
		}
		// 戻り値を返す
		return $result;
	}

	/**
	 * ウェビナーリードの登録処理
	 * 新規登録と更新（詳細）処理で共通となる処理
	 * @param array $result					戻り値
	 * @param array $form					画面から送信された値
	 * @param array $session				更新の場合に保持されているデータのセッション
	 * @param object $webinarLeadDao		WebinarLeadDaoのインスタンス
	 * @return array
	 */
	private function commonRegits($result, $form, $session, $webinarLeadDao){
		// 郵便番号を1つのデータとする
		$form["postcode"] = "{$form["postcode1"]}-{$form["postcode2"]}";
		// バリデーションの実行
		$errorList = $this->webinarLeadValidation($form); 
		if(count($errorList) == 0){
			// トランザクションスタート
			$this->db->beginTransaction();
			try{
				// 新規、更新、重複、一意の共通項目の設定
				$form["client_id"] = $this->user["client_id"];
				$form["staff_type"] = $this->user["staff_type"];
				$form["staff_id"] = $this->user["staff_id"];
				// 重複登録か、一意登録かで分岐する
				if($form["regist_type"] == self::REGIST_CSV_TYPE_DUPLICATION){
					// 重複を許容した登録
					if($session->webinarLeadId){
						// 更新時はIDを設定する
						$form["id"] = $session->webinarLeadId;
					}else{
						// 新規時の項目設定
						$form["unique_key"] = $this->getUniqueKey($webinarLeadDao);
						$form["regist_route"] = self::REGIST_ROUTE_FROM_ADMIN;
					}
					// 登録処理
					$webinarLeadDao->setWebinarLead($form);
				}else if($form["regist_type"] == self::REGIST_CSV_TYPE_UNIQUE){
					// 一意に登録の場合は新規登録なる
					$form["unique_key"] = $this->getUniqueKey($webinarLeadDao);
					$form["regist_route"] = self::REGIST_ROUTE_FROM_ADMIN;
					// メールアドレスで一意にして登録
					$wlBehaviorHistoryDao = Application_CommonUtil::getInstance("dao", "WebinarLeadBehaviorHistoryDao", $this->db);
					$this->registLeadUnique($form, $webinarLeadDao, $wlBehaviorHistoryDao);
				}
				// コミットする
				$this->db->commit();
				// セッション情報を初期化する
				Application_CommonUtil::unsetSession(self::IDENTIFIER);
				// 登録完了の場合は一覧へ遷移するためフラグを立てる
				$result["registCompleteFlg"] = 1;
			}catch(Exception $e){
				$this->db->rollBack();
				$result["errorList"][] = array("system_error"=>"想定外のエラーが発生しました。再度お申し込みください。");
				$result["errorList"][] = array("system_error"=>$e->getMessage());
				// エラーが存在する場合の戻り値作成
				$result["webinarLeadDict"] = $form;
			}
		}else{
			// エラーが存在する場合の戻り値作成
			$result["webinarLeadDict"] = $form;
			$result["errorList"] = $errorList;
		}
		// 戻り値を返す
		return $result;
	}

	/**
	 * ウェビナーリード登録のバリデーション処理
	 */
	private function webinarLeadValidation($data){
		// 戻り値宣言
		$errorList = array();
		// 実行するバリデーションの設定
		$validationDict = array(
			"name"					=>array("name" =>"氏名",			"length" => 63, "validate" => array(1)),
			"kana"					=>array("name" =>"フリガナ",		"length" => 63, "validate" => array(1,10)),
			"tel_number"			=>array("name" =>"電話番号", 		"length" => 13,"validate" => array(1,11)),
			"mail_address"			=>array("name" =>"メールアドレス",	"length" => 255, "validate" => array(1,7)),
			"postcode"				=>array("name" =>"郵便番号",		"length" => 15, "validate" => array(1,12)),
			"street_address"		=>array("name" =>"住所",			"length" => 255, "validate" => array(1)),
			"company_name"			=>array("name" =>"企業名",			"length" => 63, "validate" => array()),
			"company_department"	=>array("name" =>"部署",			"length" => 63, "validate" => array()),
			"company_position"		=>array("name" =>"役職",			"length" => 31, "validate" => array()),
		);
		// バリデーションの実行
		$errorList = executionValidation($data, $validationDict);	
		return $errorList;
	}

	/**
	 * アップロードされたCSVファイルを実ファイル化する。
	 * ファイル化した後に内容を取得し返す。
	 * @param array $form	アップロードされたCSVのファイル名とデータ
	 * @return array
	 */
	public function uploadCsvFile($form){
		// セッションを初期化する
		$session = Application_CommonUtil::resetSession(self::IDENTIFIER);
		// CSVファイルの改行コードをCRを判別できるように変更
		ini_set('auto_detect_line_endings', 1);
		// ファイルパスを生成する
		$dirPath = "{$_SERVER['DOCUMENT_ROOT']}/csv";
		$fileName = md5("{$this->user['staff_type']}_{$this->user['staff_id']}_{$form["fileName"]}").".csv";
		$fullPath = "{$dirPath}/{$fileName}";
		// ファイルを生成する
		touch($fullPath);
		// ファイルの権限を変更する
		chmod($fullPath, 0777);
		// ファイルを開く
		$fp = fopen($fullPath, "w");
		// ファイルに書き込む
		fwrite($fp, $form["csvData"]);
		// ファイルを閉じる
		fclose($fp);
		// PHPの関数を使用し先頭５行のファイルを読み込む
		$readCsvData = array();
		$handle = fopen($fullPath, "r");
		while ($row = fgetcsv( $handle )) {
			// 改行コードを削除し、カンマをエスケープする
			foreach($row as &$data){
				$data = str_replace(array("\r\n", "\r", "\n"), '', $data);
			}
			// エスケープ後のデータをCSV形式に整形し保存する
			$readCsvData[] = $row;
			if(count($readCsvData) == 5){
				break;
			}
		}
		// ファイルパスをセッションに保存する
		$session->csvFilePath = $fullPath;
		return json_encode($readCsvData);
	}
	
	/**
	 * CSVファイルからリード登録を行う
	 */
	public function registLeadCsv($form){
		// セッション取得
		$session = Application_CommonUtil::getSession(self::IDENTIFIER);
		// 戻り値
		$result = array("status"=>0, "errors"=>array());
		// POSTされた値のチェックを行う
		if($form["registType"] != self::REGIST_CSV_TYPE_DUPLICATION && $form["registType"] != self::REGIST_CSV_TYPE_UNIQUE){
			$result["errors"][] = "登録種別が不正な値です。";
		}
		if(!is_numeric($form["readLine"])){
			$result["errors"][] = "読み込み行が不正な値です。";
		}
		
		// POSTデータに問題がなければ登録処理を行う
		if(count($result["errors"]) == 0){
			// ファイルパスはセッションから取得する
			$handle = fopen($session->csvFilePath, "r");
			// 読み飛ばしがあるので、ループカウントを数える
			$roopCount = 0;
			// 登録対象のデータを貯める変数
			$registLeadDataList = array();
			while ($row = fgetcsv( $handle )) {
				if($roopCount < $form["readLine"]){
					// ループカウントを進める
					$roopCount++;
					// 読み込み位置でない場合はコンテニュー
					continue;
				}
				// 改行コードを削除し、カンマをエスケープする
				foreach($row as &$data){
					$data = str_replace(array("\r\n", "\r", "\n"), '', $data);
				}
				// １行の長さをチェックし、そもそも足りない場合は、エラーとする
				if(count($row) < self::CSV_LEAD_ROW_COUNT){
					// 人間にわかりやすい様に+1する。（カウントは0から始まるため）
					$errorRow = $roopCount + 1;
					$result["errors"][] = "{$errorRow}行目：項目数が足りません。";
				}
				// エスケープ後のデータをバリデーションできる様に詰め直す
				$leadDict = array(
					"client_id" => $this->user["client_id"], 
					"name" => $row[0], 
					"kana" => $row[1], 
					"tel_number" => $row[2], 
					"mail_address" => $row[3], 
					"postcode" => $row[4], 
					"street_address" => $row[5], 
					"company_name" => $row[6], 
					"company_department" => $row[7], 
					"company_position" => $row[8], 
					"remarks" => $row[9], 
					"regist_route" => self::REGIST_ROUTE_FROM_ADMIN,
					"staff_type" => $this->user["staff_type"], 
					"staff_id" => $this->user["staff_id"], 
				);
				// バリデーションを実行する
				$errorList = $this->webinarLeadValidation($leadDict); 
				if(count($errorList) == 0){
					// 登録する
					$registLeadDataList[] = $leadDict;
				}else{
					// エラーを設定する
					foreach($errorList as $row){
						foreach($row as $key=>$val){
							$result["errors"][] = "{$errorRow}行目：{$val}";
						}
					}
				}
				// ループカウントを進める(CSVバリデーションでエラー位置を伝えるためにカウントアップする)
				$roopCount++;
			}
			// エラーが１件もなければ登録処理を行う
			if(count($result["errors"]) == 0){
				// 登録結果
				$registResult = "";
				// 重複をそのまま登録か、メールアドレスで重複を一意にするかで登録処理が分岐する
				if($form["registType"] == self::REGIST_CSV_TYPE_DUPLICATION){
					// メールアドレスを重複したまま登録する
					$registResult = $this->registCsvLeadDuplication($registLeadDataList);
				}else if($form["registType"] == self::REGIST_CSV_TYPE_UNIQUE){
					// メールアドレスを一意にして登録する
					$registResult = $this->registCsvLeadUnique($registLeadDataList);
				}
				// 登録時にエラーが発生した場合は設定する
				if($registResult != ""){
					$result["errors"][] = $registResult;
				}else{
					// 登録で使用したファイルを削除する
					if(file_exists($session->csvFilePath)){
						// ファイルが存在すれば削除する
						unlink($session->csvFilePath);
					}
					// セッション情報を初期化する
					Application_CommonUtil::unsetSession(self::IDENTIFIER);
					// 登録エラーが存在しなければステータスを変更する
					$result["status"] = 1;
				}
			}
		}
		// 戻り値を返す
		return $result;
	}
	
	/**
	 * メールアドレスを重複したまま登録する。
	 * @param array $registLeadDataList	登録するLeadのDICT
	 * @return string エラーメッセージ
	 */
	private function registCsvLeadDuplication($registLeadDataList){
		// daoの宣言
		$webinarLeadDao = Application_CommonUtil::getInstance("dao", "WebinarLeadDao", $this->db);
		// 戻り値
		$result = "";
		// トランザクションスタート
		$this->db->beginTransaction();
		try{
			foreach($registLeadDataList as &$registLeadData){
				// 担当者キーを作成する
				$registLeadData["unique_key"] = $this->getUniqueKey($webinarLeadDao);
				// 登録処理
				$webinarLeadDao->setWebinarLead($registLeadData);
			}
			// コミットする
			$this->db->commit();
		}catch(Exception $e){
			$this->db->rollBack();
			$result = "想定外のエラーが発生しました。再度お申し込みください。";
			$result = $e->getMessage();
		}
		// 戻り値を返す
		return $result;
	}

	/**
	 * メールアドレスを一意にして登録する
	 * @param array $registLeadDataList	登録するLeadのDICT
	 * @return string エラーメッセージ
	 */
	private function registCsvLeadUnique($registLeadDataList){
		// daoの宣言
		$webinarLeadDao = Application_CommonUtil::getInstance("dao", "WebinarLeadDao", $this->db);
		$wlBehaviorHistoryDao = Application_CommonUtil::getInstance("dao", "WebinarLeadBehaviorHistoryDao", $this->db);
		// 戻り値
		$result = "";
		// トランザクションスタート
		$this->db->beginTransaction();
		try{
			foreach($registLeadDataList as &$registLeadData){
				// 担当者キーを作成する
				$registLeadData["unique_key"] = $this->getUniqueKey($webinarLeadDao);
				// リードを一意にして登録する
				$this->registLeadUnique($registLeadData, $webinarLeadDao, $wlBehaviorHistoryDao);
			}
			// コミットする
			$this->db->commit();
		}catch(Exception $e){
			$this->db->rollBack();
			$result = "想定外のエラーが発生しました。再度お申し込みください。";
			$result = $e->getMessage();
		}
		// 戻り値を返す
		return $result;
	}

	/**
	 * メールアドレスを一意にして登録する
	 * @param array $registLeadDataList		登録するLeadのDICT
	 * @param array $webinarLeadDao			DAOのインスタンス
	 * @param array $wlBehaviorHistoryDao	DAOのインスタンス
	 * @return string エラーメッセージ
	 */
	private function registLeadUnique($registLeadData, $webinarLeadDao, $wlBehaviorHistoryDao){
		// 登録処理
		$webinarLeadId = $webinarLeadDao->setWebinarLead($registLeadData);
		// 同じメールアドレスの行動履歴一まとめにする
		$wlBehaviorHistoryDao->collectBehaviorHistory($webinarLeadId, $this->user["client_id"], $registLeadData["mail_address"]);
		// 同じメールアドレスのリードに紐ずく行動履歴の削除フラグを立てる（こちらを先に処理しないと、対象のリードが解らなくなる）
		$wlBehaviorHistoryDao->deleteDuplicationMailAddress($webinarLeadId, $this->user["client_id"], $registLeadData["mail_address"]);
		// 同じメールアドレスの削除フラグを立てる
		$webinarLeadDao->deleteDuplicationMailAddress($webinarLeadId, $registLeadData);
	}

	/**
	 * 参加者予約からリード登録する処理
	 * @param array $registLeadDataList	登録するLeadのDICT
	 * @param string $destinationAddres		メール送信先アドレス
	 * @param string $mailSubject			メール送信タイトル
	 * @param string $body					メール本文
	 * @return string エラーメッセージ
	 */
	public function registLeadFromParticipant($participant, $destinationAddress, $mailSubject, $body){
		// daoの宣言
		$webinarLeadDao = Application_CommonUtil::getInstance("dao", "WebinarLeadDao", $this->db);
		$webinarLeadBehaviorHistoryDao = Application_CommonUtil::getInstance("dao", "WebinarLeadBehaviorHistoryDao", $this->db);
		// 参加者情報からリード情報を作成する
		$registLeadData = array(
			"client_id" => $participant["client_id"], 
			"name" => $participant["name"], 
			"kana" => $participant["kana"], 
			"tel_number" => $participant["tel_number"], 
			"mail_address" => $participant["mail_address"], 
			"postcode" => $participant["postcode"], 
			"street_address" => $participant["street_address"], 
			"company_name" => $participant["company_name"], 
			"company_department" => $participant["company_department"], 
			"company_position" => $participant["company_position"], 
			"remarks" => $participant["remarks"], 
			"latest_mail_subject" => $participant["latest_mail_subject"],
			"regist_route" => self::REGIST_ROUTE_FROM_PARTICIPANT,
			"wp_webinar_id" => $participant["webinar_id"],
			"wp_id" => $participant["id"]
		);
		// 担当者キーを作成する
		$registLeadData["unique_key"] = $this->getUniqueKey($webinarLeadDao);
		// リードを登録する
		$registLeadData["id"] = $webinarLeadDao->setWebinarLead($registLeadData);
		// 参加者の行動履歴IDをリードにコピーする際に、どこから流入したかわかる様に設定する
		$registLeadData["wpbh_id"] = $webinarParticipant["wpbh_id"];
		// 行動履歴を登録する
		$webinarLeadBehaviorHistoryDao->setWebinarLeadBehaviorHistoryFromParticipant($registLeadData, self::BEHAVIOR_STATUS_RESERVATION, $destinationAddress, $mailSubject, $body);
	}

	/**
	 * ウェビナーリード行動履歴一覧の表示に必要なデータを取得する
	 * @param array $form
	 * @param array $screenSession
	 * @return object
	 */
	function getWebinarLeadBehaviorHistoryList($form, &$screenSession){
		// セッションの初期化
		if($screenSession->isnew == true){
			$screenSession->order = 'create_date';
			$screenSession->page = 1;
			$screenSession->pagesize = 100;
			$screenSession->ordertype = 'desc';	// 任意
		}
		// パラメータをセッションに格納
		foreach($form as $key=>$val){
			$screenSession->$key = $val;
		}
		// daoの宣言
		$webinarLeadDao = Application_CommonUtil::getInstance("dao", "WebinarLeadDao", $this->db);
		$wlBehaviorHistoryDao = Application_CommonUtil::getInstance("dao", "WebinarLeadBehaviorHistoryDao", $this->db);
		// フリーワード変数の初期化
		$freeWord = "";
		// 検索ボタンが押下された場合、ページを初期化する
		if(array_key_exists("free_word", $form)){
			$screenSession->page = 1;
		}
		// 検索条件が存在する場合検索条件をエスケープする
		if(!is_null($screenSession->free_word)){
			$freeWord = $this->escape($screenSession->free_word);
		}
		//
		// リード行動履歴全件を取得する
		$count = $wlBehaviorHistoryDao->getBehaviorHistoryCount($this->escape(intval($form["id"])), $this->user["client_id"], $freeWord);
		// リード行動履歴のリストを取得する
		$list = $wlBehaviorHistoryDao->getBehaviorHistoryList($this->escape(intval($form["id"])), $this->user["client_id"], $freeWord, $screenSession->order, $screenSession->ordertype, $screenSession->page, $screenSession->pagesize);
		$listObject = new Application_Pager(array(
				"itemData"	=> $list,						// リスト
				"itemCount"	=> $count,						// リスト
				"perPage"	=> $screenSession->pagesize,	// ページごと表示件数
				"curPage"	=> $screenSession->page,		// 表示するページ
				"order"		=> $screenSession->order,		// ソートカラム名
				"orderType"	=> $screenSession->ordertype,	// asc or desc
		));
		// リードを取得
		$webinarLead = $webinarLeadDao->getWebinarLeadRow($this->escape(intval($form["id"])), $this->user["client_id"]);
		// 戻り値を作成し返す
		return array("listObject"=>$listObject, "webinarLead"=>$webinarLead, "behaviorHistorys"=>$this->behaviorHistorys);
	}

	/**
	 * ウェビナーリード行動履歴を１件取得する
	 */
	public function behaviorHistoryRow($form){
		// 戻り値宣言
		$result = array("status"=>0, "behaviorHistory"=>array(), "message"=>"");
		// daoの宣言
		$wlBehaviorHistoryDao = Application_CommonUtil::getInstance("dao", "WebinarLeadBehaviorHistoryDao", $this->db);
		// 送信された値のチェック
		$ids = explode("_", $form["ids"]);
		if(count($ids) == 2){
			// 各ID変数へ設定
			$webinarLeadId = $ids[0];
			$id = $ids[1];
			if(is_numeric($webinarLeadId) && is_numeric($id)){
				// 全てが数値の場合のみ、履歴情報を取得する
				$behaviorHistory = $wlBehaviorHistoryDao->getBehaviorHistoryRow($webinarLeadId, $id, $this->user["client_id"]);
				if($behaviorHistory){
					// データが取得できた場合はステータスを変更し、取得したデータを設定する
					$result["status"] = 1;
					$result["behaviorHistory"] = $behaviorHistory;
				}else{
					$result["message"] = "不正なパラメータが送信されました。";
				}
			}else{
				$result["message"] = "不正なパラメータが送信されました。";
			}
		}else{
			$result["message"] = "不正なパラメータが送信されました。";
		}
		// 戻り値を返す
		return $result;
	}

	/**
	 * ランダム文字列を作成し、DBに同じデータが存在しない
	 * 一意なデータが作成できるまで再帰する。
	 * @param object $webinarLeadDao
	 * @return string
	 */
	private function getUniqueKey($webinarLeadDao){
		// 参加者キーを作成する（英数字8文字）
		$randomString = parent::createRandomStirng(self::RANDOM_TYPE_UNIQUE_KEY);
		// 既に使用されていないかチェックする
		$result = $webinarLeadDao->searchSameUniqueKey($randomString);
		if($result){
			// 同じ「admin_key」がウェビナーに存在する場合は、再帰しデータを取得する
			$randomString = $this->getUniqueKey($webinarLeadDao);
		}
		// ランダム文字列を返す
		return $randomString;
	}
}
