<?php
class OpenSeminarModel extends AbstractModel{

	const IDENTIFIER = "openSeminar";			// セッション変数のnamespace
	private $db;							// DBコネクション
	function __construct($db){
		parent::init();
		$this->db = $db;
	}
	
	public function init() {
	}

	// 文字カラーの定義
	const CHARACTER_BLACK_NUM = "1";
	const CHARACTER_WHITE_NUM = "2";
	const CHARACTER_COLOR_BLACK = "#000000";
	const CHARACTER_COLOR_WHITE = "#ffffff";

	/**
	 * オープンセミナーのデフォルト設定
	 * @param array $form
	 * @param array $request
	 * @param array $screenSession
	 * @return object
	 */
	public function registOpenSeminarDefault($form, $request, &$screenSession){
		// 画面の初回表示処理
		if($screenSession->isnew == true){
			// セッション情報を初期化する
			Application_CommonUtil::unsetSession(self::IDENTIFIER);
		}
		// 戻り値の宣言
		$result = array(
			"openSeminarDict"		=> array(),
			"errorList"				=> array(),
			"registCompleteFlg"		=> 0
		);
		// セッション取得
		$session = Application_CommonUtil::getSession(self::IDENTIFIER);
		// daoの宣言
		$openSeminarDao = Application_CommonUtil::getInstance("dao", "OpenSeminarDao", $this->db);
		// POSTデータが存在する場合は、登録・更新処理を行う
		if ($request->isPost()){
			// 登録処理の場合
			// ファイル操作などは流用するので、WebinarModelを宣言
			$webinarModel = Application_CommonUtil::getInstance("model", "WebinarModel", $this->db);
			// ファイルがアップロードされている場合は一旦保存する
			$form["logo_webinar_path_data"] = $webinarModel->saveTmpUploadFile(json_decode($form["logo_webinar_path_data"], true), "logo_webinar_path", $form["delete_img_logo_webinar_flg"]);
			// バリデーションを実行する
			$errorList = $this->openSeminarDefaultValidation($form);
			if(count($errorList) == 0){
				// トランザクションスタート
				$this->db->beginTransaction();
				try{
					// ファイルパスを取得する処理(DB登録でエラーになった場合を考慮し、ここではパスを取得するだけとする）
					$form["logo_webinar_path"] = $webinarModel->getWebinarImgPath($form["logo_webinar_path_data"], $session->currentLogoWebinarPath);
					// 文字カラーを数値から文字列へ変換する
					if($form["character_color"] == self::CHARACTER_BLACK_NUM){
						// 黒のカラーコードを設定
						$form["character_color"] = self::CHARACTER_COLOR_BLACK;
					}else{
						// 白のカラーコードを設定
						$form["character_color"] = self::CHARACTER_COLOR_WHITE;
					}
					// 登録処理
					$openSeminarDao->setOpenSeminarDefault($form, $this->user);
					// ファイルをテンポラリーから移動する、且つ不要な画像を削除する
					$webinarModel->uploadOrDeleteWebinarImage($form["logo_webinar_path_data"], $session->currentLogoWebinarPath);
					// コミットする
					$this->db->commit();
					// セッション情報を初期化する
					Application_CommonUtil::unsetSession(self::IDENTIFIER);
					// 登録完了の場合は一覧へ遷移するためフラグを立てる
					$result["registCompleteFlg"] = 1;
					// 画面表示に必要な情報を設定する
					$result = $this->setDisplayOpenSeminarDefault($result, $form, $session);
				}catch(Exception $e){
					$this->db->rollBack();
					throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
				}
			}else{
				// エラー時の画像表示処理
				if($form["logo_webinar_path_data"]["tmpFilePath"] != ""){
					// 新規画像の場合
					$form["logo_webinar_path"] = $form["logo_webinar_path_data"]["tmpFilePath"];
				}elseif($form["logo_webinar_path_data"]["filePath"] != ""){
					// 更新時に変更がなかった場合
					$form["logo_webinar_path"] = $form["logo_webinar_path_data"]["filePath"];
				}
				// ファイルアップロード情報をjson化し設定する
				$form["logo_webinar_path_data"] = json_encode($form["logo_webinar_path_data"]);
				// エラーが存在する場合の戻り値作成
				$result["openSeminarDict"] = $form;
				$result["errorList"] = $errorList;
			}
		}else{
			// 表示処理の場合
			$result["openSeminarDict"] = array(
				"holding_time" => "",							// 所要時間（分入力）
				"max_participant_count" => "",					// 最大参加人数
				"mail_address" => "",							// 予約受信メールアドレス
				"logo_webinar_path" => "",						// ウェビナー画面で表示されるロゴ画像
				"theme_color" => "",							// テーマカラー
				"character_color"=>self::CHARACTER_WHITE_NUM,	// 文字カラー
				"logo_webinar_path_data" => json_encode(array("fileName"=>"", "filePath"=>"", "tmpFileName"=>"", "tmpFilePath"=>"")),
			);
			// 登録値を取得する
			$openSeminarDefault = $openSeminarDao->getOpenSeminarDefault($this->user["client_id"]);
			if($openSeminarDefault){
				// 画面表示に必要な情報を設定する
				$result = $this->setDisplayOpenSeminarDefault($result, $openSeminarDefault, $session);
			}
		}
		// 戻り値を返す
		return $result;
	}

	/**
	 * 画面新規表示時と、更新成功時の２カ所で使用する画面表示を行うための共通処理
	 */
	private function setDisplayOpenSeminarDefault($result, $openSeminarDefault, $session){
		// データが存在した場合は設定する
		$result["openSeminarDict"]["holding_time"] = $openSeminarDefault["holding_time"];
		$result["openSeminarDict"]["max_participant_count"] = $openSeminarDefault["max_participant_count"];
		$result["openSeminarDict"]["mail_address"] = $openSeminarDefault["mail_address"];
		$result["openSeminarDict"]["logo_webinar_path"] = $openSeminarDefault["logo_webinar_path"];
		$result["openSeminarDict"]["theme_color"] = $openSeminarDefault["theme_color"];
		$result["openSeminarDict"]["logo_webinar_path_data"] = json_encode(array("fileName"=>"", "filePath"=>$openSeminarDefault["logo_webinar_path"], "tmpFileName"=>"", "tmpFilePath"=>""));
		// 文字カラーを文字列から数値へ変換する
		if($openSeminarDefault["character_color"] == self::CHARACTER_COLOR_BLACK){
			// 黒のカラーコードから数値を設定
			$result["openSeminarDict"]["character_color"] = self::CHARACTER_BLACK_NUM;
		}else{
			// 白のカラーコードから数値を設定
			$result["openSeminarDict"]["character_color"] = self::CHARACTER_WHITE_NUM;
		}
		// 画像の変更・削除時に、過去の画像を削除するためにパスを保存しておく
		$session->currentLogoWebinarPath = $openSeminarDefault["logo_webinar_path"];
		// 戻り値を返す
		return $result;
	}

	/**
	 * オープンセミナーデフォルトのバリデーション
	 */
	private function openSeminarDefaultValidation($data){
		// 実行するバリデーションの設定
		$validationDict = array(
			"holding_time"			=>array("name" =>"所要時間（分）",						"validate" => array(1,2)),
			"max_participant_count"	=>array("name" =>"最大参加人数", 						"validate" => array(1,2)),
			"theme_color"			=>array("name" =>"テーマカラー", 		"length" => 7, 	"validate" => array(16)),
			"character_color"		=>array("name" =>"文字カラー", 						 	"validate" => array(1)),
			"mail_address"			=>array("name" =>"予約受信メールアドレス","length" => 255, "validate" => array(7)),
		);
		// バリデーションの実行
		$errorList = executionValidation($data, $validationDict);
		// 文字カラーのバリデーション
		if($data["character_color"] != "1" && $data["character_color"] != "2"){
			$errorList["error"][] = "文字カラーが不正な値です。";
		}
		return $errorList;
	}

	/**
	 * オープンセミナーテンプレート一覧の表示に必要なデータを取得する
	 * @param array $form
	 * @param array $screenSession
	 * @return object
	 */
	public function getOpenSeminarTemplateList($form, &$screenSession){
		// セッションの初期化
		if($screenSession->isnew == true){
			$screenSession->order = 'id';
			$screenSession->page = 1;
			$screenSession->pagesize = 100;
			$screenSession->ordertype = 'desc';	// 任意
			$screenSession->viewType = 'plan';	// 任意
		}
		// パラメータをセッションに格納
		foreach($form as $key=>$val){
			$screenSession->$key = $val;
		}
		// daoの宣言
		$openSeminarDao = Application_CommonUtil::getInstance("dao", "OpenSeminarDao", $this->db);
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
		// ウェビナーのリストを取得する
		$list = $openSeminarDao->getOpenSeminarTemplateList($this->user["client_id"], $freeWord, $screenSession->order, $screenSession->ordertype, $screenSession->page, $screenSession->pagesize);
		$listObject = new Application_Pager(array(
				"itemData"	=> $list,						// リスト
				"itemCount"	=> $count,						// リスト
				"perPage"	=> $screenSession->pagesize,	// ページごと表示件数
				"curPage"	=> $screenSession->page,		// 表示するページ
				"order"		=> $screenSession->order,		// ソートカラム名
				"orderType"	=> $screenSession->ordertype,	// asc or desc
		));
		// 戻り値を作成し返す
		return array("listObject"=>$listObject);
	}

	/**
	 * オープンセミナーのテンプレート設定
	 * @param array $form
	 * @param array $request
	 * @param array $screenSession
	 * @return object
	 */
	public function registOpenSeminarTemplate($form, $request, &$screenSession){
		// 画面の初回表示処理
		if($screenSession->isnew == true){
			// セッション情報を初期化する
			Application_CommonUtil::unsetSession(self::IDENTIFIER);
		}
		// 戻り値の宣言
		$result = array(
			"openSeminarDict"		=> array(),
			"errorList"				=> array(),
			"registCompleteFlg"		=> 0
		);
		// セッション取得
		$session = Application_CommonUtil::getSession(self::IDENTIFIER);
		// daoの宣言
		$openSeminarDao = Application_CommonUtil::getInstance("dao", "OpenSeminarDao", $this->db);
		// POSTデータが存在する場合は、登録・更新処理を行う
		if ($request->isPost()){
			// 登録処理の場合
			// ファイル操作などは流用するので、WebinarModelを宣言
			$webinarModel = Application_CommonUtil::getInstance("model", "WebinarModel", $this->db);
			// ファイルがアップロードされている場合は一旦保存する
			$form["logo_webinar_path_data"] = $webinarModel->saveTmpUploadFile(json_decode($form["logo_webinar_path_data"], true), "logo_webinar_path", $form["delete_img_logo_webinar_flg"]);
			// バリデーションを実行する
			$errorList = $this->openSeminarTemplateValidation($form);
			if(count($errorList) == 0){
				// トランザクションスタート
				$this->db->beginTransaction();
				try{
					// ファイルパスを取得する処理(DB登録でエラーになった場合を考慮し、ここではパスを取得するだけとする）
					$form["logo_webinar_path"] = $webinarModel->getWebinarImgPath($form["logo_webinar_path_data"], $session->currentLogoWebinarPath);
					// 更新の場合はidがセッションに保持されているので設定する
					if($session->editOpenSeminarTemplateId){
						$form["id"] = $session->editOpenSeminarTemplateId;
					}
					// 文字カラーを数値から文字列へ変換する
					if($form["character_color"] == self::CHARACTER_BLACK_NUM){
						// 黒のカラーコードを設定
						$form["character_color"] = self::CHARACTER_COLOR_BLACK;
					}else{
						// 白のカラーコードを設定
						$form["character_color"] = self::CHARACTER_COLOR_WHITE;
					}
					// 登録処理
					$openSeminarDao->setOpenSeminarTemplate($form, $this->user);
					// ファイルをテンポラリーから移動する、且つ不要な画像を削除する
					$webinarModel->uploadOrDeleteWebinarImage($form["logo_webinar_path_data"], $session->currentLogoWebinarPath);
					// コミットする
					$this->db->commit();
					// セッション情報を初期化する
					Application_CommonUtil::unsetSession(self::IDENTIFIER);
					// 登録完了の場合は一覧へ遷移するためフラグを立てる
					$result["registCompleteFlg"] = 1;
				}catch(Exception $e){
					$this->db->rollBack();
					throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
				}
			}else{
				// エラー時の画像表示処理
				if($form["logo_webinar_path_data"]["tmpFilePath"] != ""){
					// 新規画像の場合
					$form["logo_webinar_path"] = $form["logo_webinar_path_data"]["tmpFilePath"];
				}elseif($form["logo_webinar_path_data"]["filePath"] != ""){
					// 更新時に変更がなかった場合
					$form["logo_webinar_path"] = $form["logo_webinar_path_data"]["filePath"];
				}
				// ファイルアップロード情報をjson化し設定する
				$form["logo_webinar_path_data"] = json_encode($form["logo_webinar_path_data"]);
				// エラーが存在する場合の戻り値作成
				$result["openSeminarDict"] = $form;
				$result["errorList"] = $errorList;
			}
		}else{
			// 表示処理の場合
			$result["openSeminarDict"] = array(
				"name" => "",									// テンプレート名称
				"holding_time" => "",							// 所要時間（分入力）
				"max_participant_count" => "",					// 最大参加人数
				"mail_address" => "",							// 予約受信メールアドレス
				"logo_webinar_path" => "",						// ウェビナー画面で表示されるロゴ画像
				"theme_color" => "",							// テーマカラー
				"character_color"=>self::CHARACTER_WHITE_NUM,	// 文字カラー
				"logo_webinar_path_data" => json_encode(array("fileName"=>"", "filePath"=>"", "tmpFileName"=>"", "tmpFilePath"=>"")),
			);
			if(array_key_exists("id", $form) && is_numeric($form["id"])){
				// 更新の場合は登録値を取得する
				$openSeminarTemplate = $openSeminarDao->getOpenSeminarTemplateRow($this->user["client_id"], $this->escape(intval($form["id"])));
				if($openSeminarTemplate){
					// データが存在した場合は設定する
					$result["openSeminarDict"]["name"] = $openSeminarTemplate["name"];
					$result["openSeminarDict"]["holding_time"] = $openSeminarTemplate["holding_time"];
					$result["openSeminarDict"]["max_participant_count"] = $openSeminarTemplate["max_participant_count"];
					$result["openSeminarDict"]["mail_address"] = $openSeminarTemplate["mail_address"];
					$result["openSeminarDict"]["logo_webinar_path"] = $openSeminarTemplate["logo_webinar_path"];
					$result["openSeminarDict"]["theme_color"] = $openSeminarTemplate["theme_color"];
					$result["openSeminarDict"]["logo_webinar_path_data"] = json_encode(array("fileName"=>"", "filePath"=>$openSeminarTemplate["logo_webinar_path"], "tmpFileName"=>"", "tmpFilePath"=>""));
					// 文字カラーを文字列から数値へ変換する
					if($openSeminarTemplate["character_color"] == self::CHARACTER_COLOR_BLACK){
						// 黒のカラーコードから数値を設定
						$result["openSeminarDict"]["character_color"] = self::CHARACTER_BLACK_NUM;
					}else{
						// 白のカラーコードから数値を設定
						$result["openSeminarDict"]["character_color"] = self::CHARACTER_WHITE_NUM;
					}
					// セッションに更新IDを設定する
					$session->editOpenSeminarTemplateId = $openSeminarTemplate["id"];
					// 画像の変更・削除時に、過去の画像を削除するためにパスを保存しておく
					$session->currentLogoWebinarPath = $openSeminarTemplate["logo_webinar_path"];
				}
			}
		}
		// 戻り値を返す
		return $result;
	}

	/**
	 * オープンセミナーテンプレートのバリデーション
	 */
	private function openSeminarTemplateValidation($data){
		// 実行するバリデーションの設定
		$validationDict = array(
			"name"					=>array("name" =>"テンプレート名", 		"length" => 63, "validate" => array(1)),
			"holding_time"			=>array("name" =>"所要時間（分）",						"validate" => array(1,2)),
			"max_participant_count"	=>array("name" =>"最大参加人数", 						"validate" => array(1,2)),
			"theme_color"			=>array("name" =>"テーマカラー", 		"length" => 7, 	"validate" => array(16)),
			"character_color"		=>array("name" =>"文字カラー", 						 	"validate" => array(1)),
			"mail_address"			=>array("name" =>"予約受信メールアドレス","length" => 255, "validate" => array(7)),
		);
		// バリデーションの実行
		$errorList = executionValidation($data, $validationDict);
		// 文字カラーのバリデーション
		if($data["character_color"] != "1" && $data["character_color"] != "2"){
			$errorList["error"][] = "文字カラーが不正な値です。";
		}
		return $errorList;
	}

	/**
	 * オープンセミナーテンプレートの削除処理
	 * @param array $form
	 * @return array
	 */
	public function deleteOpenSeminarTemplate($form){
		// daoの宣言
		$openSeminarDao = Application_CommonUtil::getInstance("dao", "OpenSeminarDao", $this->db);
		// 戻り値宣言
		$result = array("status"=>0, "errors"=>array());
		// 送信値のバリデーションと同時にIDを再設定
		$deleteIds = array();
		foreach($form["osTemplateIds"] as $osTemplateIds){
			if(is_numeric($osTemplateIds)){
				$deleteIds[] = $osTemplateIds;
			}else{
				$result["errors"][] = "不正なIDが送信されました。[{$osTemplateIds}]";
			}
		}
		if(count($result["errors"]) == 0){
			// トランザクションスタート
			$this->db->beginTransaction();
			try{
				// オープンセミナーテンプレートを削除する
				$deleteIdCondition = join(",", $deleteIds);
				$openSeminarDao->deleteOpenSeminarTemplate($this->user["client_id"], $deleteIdCondition);
				// コミットする（メールの送信結果に関わらず、DBはコミットする）
				$this->db->commit();
				// 登録完了ステータスを変更する
				$result["status"] = 1;
			}catch(Exception $e){
				$this->db->rollBack();
				$result["errors"][] = "想定外のエラーが発生しました。再度お申し込みください。";
				//$result["errors"][] = $e->getMessage();
			}
		}
		// 戻り値を返す
		return $result;
	}

	/**
	 * 主催者の場合はオープンセミナーの登録を行う
	 * 但し既に同じ名称でオープンセミナーが作成されている場合はデータを使い回す
	 */
	public function setOpenRoom($form){
		// モデル宣言
		$webinarModel = Application_CommonUtil::getInstance("model", "WebinarModel", $this->db);
		// daoの宣言
		$openSeminarDao = Application_CommonUtil::getInstance("dao", "OpenSeminarDao", $this->db);
		$webinarDao = Application_CommonUtil::getInstance("dao", "WebinarDao", $this->db);
		// 戻り値の宣言
		$result = array("status"=>0, "webinarAdminKey"=>"", "errorList"=>array());
		// バリデーションを実行する
		$errorList = $this->openSeminarValidation($form, $openSeminarDao, $webinarDao);
		if(count($errorList) == 0){
			// 入力データを元にオープンセミナーを検索
			$webinar = $webinarDao->getOpenSeminarByName($form["openSeminarName"]);
			if($webinar){
				// 既に存在する場合は、取得データのwebinarAdminKeyを設定する
				$result["webinarAdminKey"] = $webinar["admin_key"];
				// ステータスを真にする
				$result["status"] = 1;
			}else{
				// トランザクションスタート
				$this->db->beginTransaction();
				try{
					$openSeminar = null;
					if($form["templateId"]){
						// オープンセミナーテンプレートからデータを取得
						$openSeminar = $openSeminarDao->getOpenSeminarTemplateRow($this->user["client_id"], $form["templateId"]);
					}else{
						// オープンセミナーデフォルトからデータを取得
						$openSeminar = $openSeminarDao->getOpenSeminarDefault($this->user["client_id"]);
					}
					// オープンセミナーの名称を入力した文字にする
					$openSeminar["open_seminar_name"] = $form["openSeminarName"];
					// ウェビナールーム名称を付与する
					$openSeminar["room_name"] = $webinarModel->getUniqueKey($webinarDao, self::RANDOM_TYPE_ROOM_NAME);
					// 主催者がルームへ入場するためのキーを作成する
					$openSeminar["admin_key"] = $webinarModel->getUniqueKey($webinarDao, self::RANDOM_TYPE_ADMIN_KEY);
					// 参加者の予約ページへ招待するためのキーは、オープンセミナーに不要なので空とする
					$openSeminar["announce_key"] = $webinarModel->getUniqueKey($webinarDao, self::RANDOM_TYPE_ANNOUNCE_KEY);
					// 登録処理
					$webinarDao->setOpenSeminar($openSeminar, $this->user);
					// コミットする
					$this->db->commit();
					// webinarAdminKeyを設定する
					$result["webinarAdminKey"] = $openSeminar["admin_key"];
					// ステータスを真にする
					$result["status"] = 1;
				}catch(Exception $e){
					$this->db->rollBack();
					$result["errorList"][] = "メニューより「ウェビナーデフォルト設定」を行ってください。";
					// $result["errorList"][] = $e->getMessage();
				}
			}
		}else{
			$result["errorList"] = $errorList;
		}
		// 戻り値を返す
		return $result;
	}


	/**
	 * オープンセミナーのバリデーション
	 */
	private function openSeminarValidation($data, $openSeminarDao, $webinarDao){
		// 戻り値
		$result = array();
		// 実行するバリデーションの設定
		$validationDict = array(
			"openSeminarName"					=>array("name" =>"ルーム名", 		"length" => 63, "validate" => array(1))
		);
		// バリデーションの実行
		$errorList = executionValidation($data, $validationDict);
		if(count($errorList) > 0){
			foreach($errorList as $error){
				foreach($error as $row){
					$result[] = $row;
				}
			}
		}
		// テンプレートバリデーション
		if($data["templateId"]){
			if(is_numeric($data["templateId"])){
				// テンプレートIDが存在する場合は、テンプレートを検索する
				$openSeminarTemplate = $openSeminarDao->getOpenSeminarTemplateRow($this->user["client_id"], $data["templateId"]);
				if(!$openSeminarTemplate){
					// テンプレートIDが渡されたが存在しない場合はエラーとする
					$result[] = "不正なテンプレートです。";
				}
			}else{
				// IDが数値でない場合はエラーとする
				$result[] = "不正なテンプレートです。";
			}
		}
		return $result;
	}

	/**
	 * メニュー表示時のオープンセミナーテンプレート取得処理
	 */
	public function getOpenSeminarTemplates(){
		// daoの宣言
		$openSeminarDao = Application_CommonUtil::getInstance("dao", "OpenSeminarDao", $this->db);
		// テンプレート取得
		$openSeminarTemplates = $openSeminarDao->getOpenSeminarTemplateListByClientId($this->user["client_id"]);
		// 戻り値を返す
		return $openSeminarTemplates;
	}

	/**
	 * ウェビナー名称からルーム名を特定し、
	 * 参加者情報を登録する
	 */
	public function setOpenSeminarParticipant($webinarRoomName){
		// モデル宣言
		$webinarParticipantModel = Application_CommonUtil::getInstance("model", "WebinarParticipantModel", $this->db);
		// daoの宣言
		$openSeminarDao = Application_CommonUtil::getInstance("dao", "OpenSeminarDao", $this->db);
		$webinarDao = Application_CommonUtil::getInstance("dao", "WebinarDao", $this->db);
		$webinarParticipantDao = Application_CommonUtil::getInstance("dao", "WebinarParticipantDao", $this->db);
		// 戻り値の宣言
		$result = array("uniqueKey"=>"", "error"=>"");
		// webinarデータを取得する
		$webinar = $webinarDao->getOpenSeminarByRoomName($this->escape($webinarRoomName));
		if($webinar){
			// 参加者キーを作成する
			$participant["unique_key"] = $webinarParticipantModel->getUniqueKey($webinarParticipantDao);
			// 新規作成の場合のみ予約番号を作成する
			$participant["reservation_number"] = $webinarParticipantModel->createReservationNumber($webinarParticipantDao, $webinar["id"]);
			// トランザクションスタート
			$this->db->beginTransaction();
			try{
				// 参加者登録を行う
				$webinarParticipantDao->setOpenSeminar($participant, $webinar);
				// 登録完了の場合は、参加者を特定するためのキーを設定する
				$result["uniqueKey"] = $participant["unique_key"];
				// コミットする
				$this->db->commit();
			}catch(Exception $e){
				$this->db->rollBack();
				$result["error"] = "システムエラーが発生しました。時間を置いてから実行してください。";
			}
		}else{
			$result["error"] = "不正なURLです。";
		}
		// 戻り値を返す
		return $result;
	}
}
