<?php
class WebinarModel extends AbstractModel{

	const IDENTIFIER = "webinar";			// セッション変数のnamespace
	private $db;							// DBコネクション
	function __construct($db){
		parent::init();
		$this->db = $db;
	}
	// 時間のリスト
	const HOURS = array("00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23");
	// 分のリスト
	const MINUTES = array("00", "10", "20", "30", "40", "50");
	// メール送信の日時指定
	const SEND_MAIL_TYPE_NOW = 1;
	const SEND_MAIL_TYPE_DESIGNATION = 2;
	// 文字カラーの定義
	const CHARACTER_BLACK_NUM = "1";
	const CHARACTER_WHITE_NUM = "2";
	const CHARACTER_COLOR_BLACK = "#000000";
	const CHARACTER_COLOR_WHITE = "#ffffff";
	// アンケート形式[1:複数選択、2:2択、3:記述]
	private $answerTypeNames = array(
		"1" => "複数選択", 
		"2" => "2択", 
		"3" => "記述", 
	);
	// 記述形式[1:単数行、2:複数行]
	private $descriptionTypeNames = array(
		"1" => "単数行", 
		"2" => "複数行", 
	);
	// アンケート形式の２択
	const ANSWER_TYPE_TWO_SELECT = 2;

	public function init() {
	}

	/**
	 * ウェビナー一覧の表示に必要なデータを取得する
	 * @param array $form
	 * @param array $screenSession
	 * @return object
	 */
	function getWebinarList($form, &$screenSession){
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
		$webinarDao = Application_CommonUtil::getInstance("dao", "WebinarDao", $this->db);
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
		// ウェビナー予定件数を取得する
		$planCount = $webinarDao->getWebinarCount($this->user["client_id"], $freeWord, "plan");
		// ウェビナー終了件数を取得する
		$endCount = $webinarDao->getWebinarCount($this->user["client_id"], $freeWord, "end");
		// ウェビナーキャンセル件数を取得する
		$cancelCount = $webinarDao->getWebinarCount($this->user["client_id"], $freeWord, "cancel");
		// ウェビナー全件を取得する
		$allCount = $webinarDao->getWebinarCount($this->user["client_id"], $freeWord, "all");
		// 現在の表示カウントを設定
		$count = 0;
		if($screenSession->viewType == "plan"){
			$count = $planCount;
		} else if($screenSession->viewType == "end"){
			$count = $endCount;
		} else if($screenSession->viewType == "all"){
			$count = $allCount;
		}
		// ウェビナーのリストを取得する
		$list = $webinarDao->getWebinarList($this->user["client_id"], $freeWord, $screenSession->viewType, $screenSession->order, $screenSession->ordertype, $screenSession->page, $screenSession->pagesize);
		$listObject = new Application_Pager(array(
				"itemData"	=> $list,						// リスト
				"itemCount"	=> $count,						// リスト
				"perPage"	=> $screenSession->pagesize,	// ページごと表示件数
				"curPage"	=> $screenSession->page,		// 表示するページ
				"order"		=> $screenSession->order,		// ソートカラム名
				"orderType"	=> $screenSession->ordertype,	// asc or desc
		));
		// ウェビナー利用時間を取得する
		$webinarUseTimeDict = $this->getWebinarUseTime($this->user["client_id"]);
		// 戻り値を作成し返す
		return array("listObject"=>$listObject,
					 "planCount"=>$planCount,
					 "endCount"=>$endCount,
					 "cancelCount"=>$cancelCount,
					 "allCount"=>$allCount,
					 "displayWebinarUseTime"=>$webinarUseTimeDict["displayWebinarUseTime"],
					 "displayAddWebinarUseTime"=>$webinarUseTimeDict["displayAddWebinarUseTime"],
					 "displayTotalWebinarUseTime"=>$webinarUseTimeDict["displayTotalWebinarUseTime"],
					 "checkWebinarAvailable"=>$webinarUseTimeDict["checkWebinarAvailable"]
					);
	}

	/**
	 * ウェビナーの削除処理
	 * 元々は、キャンセルと削除は別の処理を行っていたが
	 * 仕様変更になり現在は、cancel_flgかdel_flgのどちらかを立てるだけとなり、違いはなくなった。
	 * ただし、今後再度分岐することを考え、２つの関数は残すこととする。
	 * @param array $form
	 * @return array
	 */
	public function deleteWebinar($form){
		// daoの宣言
		$webinarDao = Application_CommonUtil::getInstance("dao", "WebinarDao", $this->db);
		$webinarParticipantDao = Application_CommonUtil::getInstance("dao", "WebinarParticipantDao", $this->db);
		// MODELの宣言
		$mailModel = Application_CommonUtil::getInstance('model', "MailModel", $this->db);
		// 戻り値宣言
		$result = array("status"=>0, "errors"=>array());
		// トランザクションスタート
		$this->db->beginTransaction();
		try{
			foreach($form["webinarIds"] as $webinarId){
				// 削除対象のウェビナーを取得する
				$webinar = $webinarDao->getWebinarRowByIdAndClientId($this->escape(intval($webinarId)), $this->user["client_id"]);
				if($webinar){
					// ウェビナーを削除する
					$webinarDao->deleteWebinar($this->escape(intval($webinarId)), $this->user["client_id"]);
					
					// 削除はウェビナー開始10分前まで行えるので時間をチェックする
					/* TODO 一時的に条件を外して欲しいと依頼あり
					if(date("Y-m-d H:i:s") < date('Y-m-d H:i:s', strtotime($webinar["holding_date"]."-10 minute"))){
						// ウェビナーを削除する
						$webinarDao->deleteWebinar($this->escape(intval($webinarId)), $this->user["client_id"]);
					}else{
						$result["errors"][] = "{$webinar["name"]}はキャンセルできる時間を過ぎたため、キャンセルできませんでした。";
					}
					*/
				}else{
					$result["errors"][] = "不正なIDが送信されました。";
				}
			}
			// コミットする（メールの送信結果に関わらず、DBはコミットする）
			$this->db->commit();
			// 登録完了ステータスを変更する
			if(count($result["errors"]) == 0){
				$result["status"] = 1;
			}
		}catch(Exception $e){
			$this->db->rollBack();
			$result["errors"][] = "想定外のエラーが発生しました。再度お申し込みください。";
			$result["errors"][] = $e->getMessage();
		}
		// 戻り値を返す
		return $result;
	}

	/**
	 * ウェビナーのキャンセル処理
	 * 元々は、キャンセルと削除は別の処理を行っていたが
	 * 仕様変更になり現在は、cancel_flgかdel_flgのどちらかを立てるだけとなり、違いはなくなった。
	 * ただし、今後再度分岐することを考え、２つの関数は残すこととする。
	 * @param array $form
	 * @return array
	 */
	public function cancelWebinar($form){
		// daoの宣言
		$webinarDao = Application_CommonUtil::getInstance("dao", "WebinarDao", $this->db);
		$webinarParticipantDao = Application_CommonUtil::getInstance("dao", "WebinarParticipantDao", $this->db);
		// MODELの宣言
		$mailModel = Application_CommonUtil::getInstance('model', "MailModel", $this->db);
		// 戻り値宣言
		$result = array("status"=>0, "errors"=>array());
		// トランザクションスタート
		$this->db->beginTransaction();
		try{
			foreach($form["webinarIds"] as $webinarId){
				// キャンセル対象のウェビナーを取得する
				$webinar = $webinarDao->getWebinarRowByIdAndClientId($this->escape(intval($webinarId)), $this->user["client_id"]);
				if($webinar){
					// ウェビナーをキャンセルする
					$webinarDao->cancelWebinar($this->escape(intval($webinarId)), $this->user["client_id"]);
					/* TODO 一時的に条件を外して欲しいと依頼あり
					// キャンセルはウェビナー開始10分前まで行えるので時間をチェックする
					if(date("Y-m-d H:i:s") < date('Y-m-d H:i:s', strtotime($webinar["holding_date"]."-10 minute"))){
						// ウェビナーをキャンセルする
						$webinarDao->cancelWebinar($this->escape(intval($webinarId)), $this->user["client_id"]);
					}else{
						$result["errors"][] = "{$webinar["name"]}はキャンセルできる時間を過ぎたため、キャンセルできませんでした。";
					}
					*/
				}else{
					$result["errors"][] = "不正なIDが送信されました。";
				}
			}
			// コミットする（メールの送信結果に関わらず、DBはコミットする）
			$this->db->commit();
			// 登録完了ステータスを変更する
			if(count($result["errors"]) == 0){
				$result["status"] = 1;
			}
		}catch(Exception $e){
			$this->db->rollBack();
			$result["errors"][] = "想定外のエラーが発生しました。再度お申し込みください。";
			$result["errors"][] = $e->getMessage();
		}
		// 戻り値を返す
		return $result;
	}


	/**
	 * ウェビナーの登録処理
	 * 新規登録のみを実装する。
	 * @param array $form
	 * @param array $request
	 * @return object
	 */
	public function regist($form, $request, &$screenSession){
		// 画面の初回表示処理
		if($screenSession->isnew == true){
			// セッション情報を初期化する
			Application_CommonUtil::unsetSession(self::IDENTIFIER);
		}
		// 戻り値の宣言
		$result = array(
			"webinarDict"					=> array(),
			"errorList"						=> array(),
			"registCompleteFlg"				=> 0,
			"hours"							=> self::HOURS,
			"minutes"						=> self::MINUTES,
			"displayWebinarUseTime"			=> "",
		);
		// セッション取得
		$session = Application_CommonUtil::getSession(self::IDENTIFIER);
		// daoの宣言
		$webinarDao = Application_CommonUtil::getInstance("dao", "WebinarDao", $this->db);
		// POSTデータが存在する場合は、登録・更新処理を行う
		if ($request->isPost()){
			// 新規登録処理
			$result = $this->commonRegits($result, $form, $session, $webinarDao);
		}else{
			// 新規作成の場合
			$result["webinarDict"] = array(
				"name" => "",					// ウェビナー名
				"outline" => "",				// ウェビナー概要
				"holding_date" => "",			// 開催日時
				"holding_mm" => "",				// 開催日時（時）
				"holding_mi" => "",				// 開催日時（分）
				"holding_time" => "",			// 所要時間（分入力）
				"max_participant_count" => "",	// 最大参加人数
				"from_reservation_date" => "",	// 予約開始日時
				"from_reservation_mm" => "",	// 予約開始日時（時）
				"from_reservation_mi" => "",	// 予約開始日時（分）
				"to_reservation_date" => "",	// 予約終了日時
				"to_reservation_mm" => "",		// 予約終了日時（時）
				"to_reservation_mi" => "",		// 予約終了日時（分）
				"img_path" => "",				// ウェビナー画像パス
				"logo_reservation_path" => "",	// 予約ページなどに表示されるロゴ画像
				"logo_webinar_path" => "",		// ウェビナー画面で表示されるロゴ画像
				"theme_color" => "",			// テーマカラー
				"character_color"=>self::CHARACTER_WHITE_NUM,	// 文字カラー
				"explanation_text" => "",		// 説明文
				"mail_address" => "",			// 予約受信メールアドレス
				"img_path_data" => json_encode(array("fileName"=>"", "filePath"=>"", "tmpFileName"=>"", "tmpFilePath"=>"")),
				"logo_reservation_path_data" => json_encode(array("fileName"=>"", "filePath"=>"", "tmpFileName"=>"", "tmpFilePath"=>"")),
				"logo_webinar_path_data" => json_encode(array("fileName"=>"", "filePath"=>"", "tmpFileName"=>"", "tmpFilePath"=>"")),
			);
		}
		// ウェビナー利用時間を取得する
		$webinarUseTimeDict = $this->getWebinarUseTime($this->user["client_id"]);
		$result["displayWebinarUseTime"] = $webinarUseTimeDict["displayWebinarUseTime"];
		$result["displayAddWebinarUseTime"] = $webinarUseTimeDict["displayAddWebinarUseTime"];
		$result["displayTotalWebinarUseTime"] = $webinarUseTimeDict["displayTotalWebinarUseTime"];
		$result["checkWebinarAvailable"] = $webinarUseTimeDict["checkWebinarAvailable"];

		// 戻り値を返す
		return $result;
	}

	/**
	 * ウェビナーの詳細処理
	 * POSTデータが存在するかにより、表示か更新かを判定する。
	 * 更新処理や多機能への遷移の元となる画面
	 * 
	 * @param array $form
	 * @param array $request
	 * @return object
	 */
	public function detail($form, $request, &$screenSession){
		// 画面の初回表示処理
		if($screenSession->isnew == true){
			// セッション情報を初期化する
			Application_CommonUtil::unsetSession(self::IDENTIFIER);
		}
		// 戻り値の宣言
		$result = array(
			"webinarDict"		=> array(),
			"errorList"			=> array(),
			"registCompleteFlg"	=> 0,
			"hours"				=> self::HOURS,
			"minutes"			=> self::MINUTES
		);
		// セッション取得
		$session = Application_CommonUtil::getSession(self::IDENTIFIER);
		// daoの宣言
		$webinarDao = Application_CommonUtil::getInstance("dao", "WebinarDao", $this->db);
		$masterClientDao = Application_CommonUtil::getInstance("dao", "MasterClientDao", $this->db);
		// ウェビナーを使用可能かをチェックする
		$webinarUseTimeCheckFlg = $masterClientDao->webinarUseTimeCheck($this->user["client_id"]);
		if($webinarUseTimeCheckFlg[0]["webinar_available_flg"]){
			$result["webinarAvailableFlg"] = false;
		}else{
			$result["webinarAvailableFlg"] = true;
		}
		$webinarParticipantDao = Application_CommonUtil::getInstance("dao", "WebinarParticipantDao", $this->db);
		// POSTデータが存在する場合は、登録・更新処理を行う
		if ($request->isPost()){
			// 更新処理
			$result = $this->commonRegits($result, $form, $session, $webinarDao);
		}else{
			// 更新の場合はDBからデータを取得する
			$webinarDict = $webinarDao->getWebinarRowByIdAndClientId($this->escape(intval($form["id"])), $this->user["client_id"]);
			// 日付を分割する（参照を渡し、関数内で$webinarDictのデータを書き換える）
			$this->explodeDateAndTime($webinarDict, "holding");
			$this->explodeDateAndTime($webinarDict, "from_reservation");
			$this->explodeDateAndTime($webinarDict, "to_reservation");
			// 画像アップロード用のデータ
			$webinarDict["img_path_data"] = json_encode(array("fileName"=>"", "filePath"=>$webinarDict["img_path"], "tmpFileName"=>"", "tmpFilePath"=>""));
			$webinarDict["logo_reservation_path_data"] = json_encode(array("fileName"=>"", "filePath"=>$webinarDict["logo_reservation_path"], "tmpFileName"=>"", "tmpFilePath"=>""));
			$webinarDict["logo_webinar_path_data"] = json_encode(array("fileName"=>"", "filePath"=>$webinarDict["logo_webinar_path"], "tmpFileName"=>"", "tmpFilePath"=>""));
			// 文字カラーを文字列から数値へ変換する
			if($webinarDict["character_color"] == self::CHARACTER_COLOR_BLACK){
				// 黒のカラーコードから数値を設定
				$webinarDict["character_color"] = self::CHARACTER_BLACK_NUM;
			}else{
				// 白のカラーコードから数値を設定
				$webinarDict["character_color"] = self::CHARACTER_WHITE_NUM;
			}
			
			// 戻り値に設定する
			$result["webinarDict"] = $webinarDict;
			// セッションに更新IDを設定する
			$session->editWebinarId = intval($form["id"]);
			// 画像の変更・削除時に、過去の画像を削除するためにパスを保存しておく
			$session->currentImgPath = $webinarDict["img_path"];
			$session->currentLogoReservationPath = $webinarDict["logo_reservation_path"];
			$session->currentLogoWebinarPath = $webinarDict["logo_webinar_path"];
		}
		// 戻り値を返す
		return $result;
	}

	/**
	 * ウェビナーの登録処理
	 * 新規登録と更新（詳細）処理で共通となる処理
	 * @param array $result			戻り値
	 * @param array $form			画面から送信された値
	 * @param array $session		更新の場合に保持されているデータのセッション
	 * @param object $webinarDao	WebinarDaoのインスタンス
	 * @return array
	 */
	private function commonRegits($result, $form, $session, $webinarDao){
		// ファイルがアップロードされている場合は一旦保存する
		$form["img_path_data"] = $this->saveTmpUploadFile(json_decode($form["img_path_data"], true), "img_path", $form["delete_img_flg"]);
		$form["logo_reservation_path_data"] = $this->saveTmpUploadFile(json_decode($form["logo_reservation_path_data"], true), "logo_reservation_path", $form["delete_img_logo_reservation_flg"]);
		$form["logo_webinar_path_data"] = $this->saveTmpUploadFile(json_decode($form["logo_webinar_path_data"], true), "logo_webinar_path", $form["delete_img_logo_webinar_flg"]);
		// バリデーションを実行する
		$errorList = $this->webinarValidation($form);
		if(count($errorList) == 0){
			// トランザクションスタート
			$this->db->beginTransaction();
			try{
				// ファイルパスを取得する処理(DB登録でエラーになった場合を考慮し、ここではパスを取得するだけとする）
				$form["img_path"] = $this->getWebinarImgPath($form["img_path_data"], $session->currentImgPath);
				$form["logo_reservation_path"] = $this->getWebinarImgPath($form["logo_reservation_path_data"], $session->currentLogoReservationPath);
				$form["logo_webinar_path"] = $this->getWebinarImgPath($form["logo_webinar_path_data"], $session->currentLogoWebinarPath);
				// 日付と時間を結合する（参照を渡し、関数内で$formのデータを書き換える）
				$this->joinDateAndTime($form, "holding", "regist");
				$this->joinDateAndTime($form, "from_reservation", "regist");
				$this->joinDateAndTime($form, "to_reservation", "regist");
				// 更新の場合はidがセッションに保持されているので設定する
				if($session->editWebinarId){
					$form["id"] = $session->editWebinarId;
				}else{
					// ウェビナールーム名称を付与する
					$form["room_name"] = $this->getUniqueKey($webinarDao, self::RANDOM_TYPE_ROOM_NAME);
					// 主催者がルームへ入場するためのキーを作成する
					$form["admin_key"] = $this->getUniqueKey($webinarDao, self::RANDOM_TYPE_ADMIN_KEY);
					// 参加者の予約ページへ招待するためのキーを作成する
					$form["announce_key"] = $this->getUniqueKey($webinarDao, self::RANDOM_TYPE_ANNOUNCE_KEY);
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
				$result["webinarId"] = $webinarDao->setWebinar($form, $this->user);
				// ファイルをテンポラリーから移動する、且つ不要な画像を削除する
				$this->uploadOrDeleteWebinarImage($form["img_path_data"], $session->currentImgPath);
				$this->uploadOrDeleteWebinarImage($form["logo_reservation_path_data"], $session->currentLogoReservationPath);
				$this->uploadOrDeleteWebinarImage($form["logo_webinar_path_data"], $session->currentLogoWebinarPath);
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
			if($form["img_path_data"]["tmpFilePath"] != ""){
				// 新規画像の場合
				$form["img_path"] = $form["img_path_data"]["tmpFilePath"];
			}elseif($form["img_path_data"]["filePath"] != ""){
				// 更新時に変更がなかった場合
				$form["img_path"] = $form["img_path_data"]["filePath"];
			}
			if($form["logo_reservation_path_data"]["tmpFilePath"] != ""){
				// 新規画像の場合
				$form["logo_reservation_path"] = $form["logo_reservation_path_data"]["tmpFilePath"];
			}elseif($form["logo_reservation_path_data"]["filePath"] != ""){
				// 更新時に変更がなかった場合
				$form["logo_reservation_path"] = $form["logo_reservation_path_data"]["filePath"];
			}
			if($form["logo_webinar_path_data"]["tmpFilePath"] != ""){
				// 新規画像の場合
				$form["logo_webinar_path"] = $form["logo_webinar_path_data"]["tmpFilePath"];
			}elseif($form["logo_webinar_path_data"]["filePath"] != ""){
				// 更新時に変更がなかった場合
				$form["logo_webinar_path"] = $form["logo_webinar_path_data"]["filePath"];
			}
			// ファイルアップロード情報をjson化し設定する
			$form["img_path_data"] = json_encode($form["img_path_data"]);
			$form["logo_reservation_path_data"] = json_encode($form["logo_reservation_path_data"]);
			$form["logo_webinar_path_data"] = json_encode($form["logo_webinar_path_data"]);
			// エラーが存在する場合の戻り値作成
			$result["webinarDict"] = $form;
			$result["errorList"] = $errorList;
		}
		// 戻り値を返す
		return $result;
	}

	/**
	 * ウェビナーデータを返す。
	 * @param array $form		
	 */
	public function getWebinarRowByIdAndClientId($webinarId){
		// daoの宣言
		$webinarDao = Application_CommonUtil::getInstance("dao", "WebinarDao", $this->db);
		// getパラメータのIDを元にwebinarデータを取得する
		$webinarDict = $webinarDao->getWebinarRowByIdAndClientId($this->escape(intval($webinarId)), $this->user["client_id"]);
		// 戻り値を返す
		return $webinarDict;
	}

	/**
	 * ウェビナーデータを返す。
	 * @param int	$adminKey	主催者がルームにログインする為に使用する一意なキー
	 * @param array $form
	 */
	public function getWebinarRowByAdminKey($adminKey){
		// daoの宣言
		$webinarDao = Application_CommonUtil::getInstance("dao", "WebinarDao", $this->db);
		return $webinarDao->getWebinarRowByAdminKey($adminKey);
	}


	/**
	 * ウェビナーの日付と時間を結合して返す。
	 * ただし秒は登録されないので00とする。
	 * 登録処理とバリデーションで使用し、２つの使い方により結合する条件が変わる。
	 * @param array &$webinarDict	表示データ（参照を渡されるので、この関数で書き換える）
	 * @param array $columnName		日付カラムの共通文字列部分（例：holding_dateの場合holdingが送られる）
	 * @param string $joinType		regist→日時が全て存在する場合のみ結合する、valid→必ず結合する
	 */
	private function joinDateAndTime(&$webinarDict, $columnName, $joinType){
		// htmlのタグ名を作成
		$date = "{$columnName}_date";
		$mm = "{$columnName}_mm";
		$mi = "{$columnName}_mi";
		if($joinType == "regist"){
			// 日付、時間、分の全てが設定されている場合は結合する
			if($webinarDict[$date] != "" && $webinarDict[$mm] != "" && $webinarDict[$mi] != ""){
				$webinarDict[$date] = "{$webinarDict[$date]} {$webinarDict[$mm]}:{$webinarDict[$mi]}:00";
			}
		}else if($joinType == "valid"){
			$webinarDict[$date] = "{$webinarDict[$date]} {$webinarDict[$mm]}:{$webinarDict[$mi]}:00";
		}
	}

	/**
	 * ウェビナーの日時を日付と時間に分割して返す。
	 * ただし秒は使用しないので戻り値に含まない。
	 * @param array &$webinarDict	表示データ（参照を渡されるので、この関数で書き換える）
	 * @param array $columnName		日付カラムの共通文字列部分（例：holding_dateの場合holdingが送られる）
	 */
	private function explodeDateAndTime(&$webinarDict, $columnName){
		// 日付と時間に分割
		$dateAndTime = explode(" ", $webinarDict["{$columnName}_date"]);
		// 時間を分割
		$times = explode(":", $dateAndTime[1]);
		// 表示データに設定
		$webinarDict["{$columnName}_date"] = $dateAndTime[0];
		$webinarDict["{$columnName}_mm"] = $times[0];
		$webinarDict["{$columnName}_mi"] = $times[1];
	}

	/**
	 * ウェビナー登録のバリデーション処理
	 */
	public function webinarValidation($data){
		// 実行するバリデーションの設定
		$validationDict = array(
			"name"					=>array("name" =>"ウェビナー名", 			"length" => 63, "validate" => array(1)),
			"holding_date"			=>array("name" =>"開催日時", 			"length" => 10,"validate" => array(1,6)),
			"holding_mm"			=>array("name" =>"開催日時(時)", 		"length" => 2, "validate" => array(1,2)),
			"holding_mi"			=>array("name" =>"開催日時(分)", 		"length" => 2, "validate" => array(1,2)),
			"holding_time"			=>array("name" =>"所要時間（分）",						"validate" => array(1,2)),
			"max_participant_count"	=>array("name" =>"最大参加人数", 						"validate" => array(1,2)),
			"from_reservation_date"	=>array("name" =>"予約開始日時",		"length" => 10, "validate" => array(6)),
			"from_reservation_mm"	=>array("name" =>"予約開始日時(時)",	"length" => 2, 	"validate" => array(2)),
			"from_reservation_mi"	=>array("name" =>"予約開始日時(分)", 	"length" => 2, 	"validate" => array(2)),
			"to_reservation_date"	=>array("name" =>"予約終了日",			"length" => 10, "validate" => array(6)),
			"to_reservation_mm"		=>array("name" =>"予約終了日(時)",		"length" => 2, 	"validate" => array(2)),
			"to_reservation_mi"		=>array("name" =>"予約終了日(分)", 		"length" => 2, 	"validate" => array(2)),
			"theme_color"			=>array("name" =>"テーマカラー", 		"length" => 7, 	"validate" => array(16)),
			"character_color"		=>array("name" =>"文字カラー", 						 	"validate" => array(1)),
			"mail_address"			=>array("name" =>"予約受信メールアドレス","length" => 255, "validate" => array(1,7)),
		);
		// バリデーションの実行
		$environmentCharCheckFlg = true; //環境依存文字チェック
		$errorList = executionValidation($data, $validationDict, $environmentCharCheckFlg);
		// 日付のチェック
		$tmp = $data;
		// 開催日時の日時どれかが設定されている場合は日付チェックする
		if($tmp["holding_date"] != "" || $tmp["holding_mm"] != "" || $tmp["holding_mi"] != ""){
			$this->joinDateAndTime($tmp, "holding", "valid");
			if($tmp["holding_date"] != date('Y/m/d H:i:s', strtotime($tmp["holding_date"]))){
				$errorList["error"][] = "開催日時が不正な日時です。";
			}
		}
		// 予約開始日時の日時どれかが設定されている場合は日付チェックする
		if($tmp["from_reservation_date"] != "" || $tmp["from_reservation_mm"] != "" || $tmp["from_reservation_mi"] != ""){
			$this->joinDateAndTime($tmp, "from_reservation", "valid");
			if($tmp["from_reservation_date"] != date('Y/m/d H:i:s', strtotime($tmp["from_reservation_date"]))){
				$errorList["error"][] = "予約開始日時が不正な日時です。";
			}
		}
		// 予約終了日の日時どれかが設定されている場合は日付チェックする
		if($tmp["to_reservation_date"] != "" || $tmp["to_reservation_mm"] != "" || $tmp["to_reservation_mi"] != ""){
			$this->joinDateAndTime($tmp, "to_reservation", "valid");
			if($tmp["to_reservation_date"] != date('Y/m/d H:i:s', strtotime($tmp["to_reservation_date"]))){
				$errorList["error"][] = "予約終了日が不正な日時です。";
			}
		}
		// 文字カラーのバリデーション
		if($data["character_color"] != "1" && $data["character_color"] != "2"){
			$errorList["error"][] = "文字カラーが不正な値です。";
		}
		return $errorList;
	}

	/**
	 * ランダム文字列を作成し、DBに同じデータが存在しない
	 * 一意なデータが作成できるまで再帰する。
	 * オープンセミナー登録でも使用するのでpublicに変更
	 * @param object $webinarDao
	 * @param string $randomType	[room_name, admin_key, announce_key]
	 * @return string
	 */
	public function getUniqueKey($webinarDao, $randomType){
		// 戻り値のランダム文字列
		$randomString = "";
		if($randomType == self::RANDOM_TYPE_ROOM_NAME){
			// ルーム名を作成する（数字8文字）
			$randomString = parent::createRandomStirng(self::RANDOM_TYPE_ROOM_NAME);
			// 既に使用されていないかチェックする（既に存在していても３ヶ月前であれば問題ないものとする）
			$result = $webinarDao->searchSameRoomName($randomString);
			if($result){
				// ３ヶ月以内に同じルーム名でウェビナーが存在する場合は、再帰しデータを取得する
				$randomString = $this->getUniqueKey($webinarDao, self::RANDOM_TYPE_ROOM_NAME);
			}
		}else if($randomType == self::RANDOM_TYPE_ADMIN_KEY){
			// 主催者キーを作成する（数字8文字）
			$randomString = parent::createRandomStirng(self::RANDOM_TYPE_ADMIN_KEY);
			// 既に使用されていないかチェックする
			$result = $webinarDao->searchSameKeyValue($randomString, "admin_key");
			if($result){
				// 同じ「admin_key」がウェビナーに存在する場合は、再帰しデータを取得する
				$randomString = $this->getUniqueKey($webinarDao, self::RANDOM_TYPE_ADMIN_KEY);
			}
		}else if($randomType == self::RANDOM_TYPE_ANNOUNCE_KEY){
			// 参加者予約画面キーを作成する（英数字8文字）
			$randomString = parent::createRandomStirng(self::RANDOM_TYPE_ANNOUNCE_KEY);
			// 既に使用されていないかチェックする
			$result = $webinarDao->searchSameKeyValue($randomString, "announce_key");
			if($result){
				// 同じ「admin_key」がウェビナーに存在する場合は、再帰しデータを取得する
				$randomString = $this->getUniqueKey($webinarDao, self::RANDOM_TYPE_ANNOUNCE_KEY);
			}
		}
		// ランダム文字列を返す
		return $randomString;
	}

	/**
	 * アップロードされた画像を一時フォルダへ移動する。
	 * バリデーションエラーやDBエラーが発生した場合を考慮し、
	 * アップロードされたファイルは一旦保存する。
	 * オープンセミナー登録でも使用するのでpublicに変更
	 * @param string $imgData		画像アップロード時に登録される画像データ
	 * @param string $imgName		ファイルタグのname
	 * @param string $deleteImgFlg	画面でセットされる画像削除フラグ
	 * @return array
	 */
	public function saveTmpUploadFile($imgData, $imgName, $deleteImgFlg){
		if($_FILES[$imgName]["tmp_name"]){
			// 拡張子を取得する
			$extension = end(explode(".", $_FILES[$imgName]["name"]));
			// 登録ファイル名を作成する
			$imgData["fileName"] = md5("{$this->user["user_type"]}{$this->user["user_id"]}".date("Y-m-d H:i:s").$_FILES[$imgName]["name"]).".{$extension}";
			// 登録ファイルパスを作成する
			$imgData["filePath"] = "/img/webinar/{$imgData["fileName"]}";
			// 一時ファイル名を作成する
			$imgData["tmpFileName"] = md5("{$imgName}{$this->user["user_type"]}{$this->user["user_id"]}").".{$extension}";
			// 一時ファイルパスを作成する
			$imgData["tmpFilePath"] = "/img/webinar_tmp/{$imgData["fileName"]}";
			// ファイルのアップロードが存在する場合はファイルをテンポラリーから移動する
			$fileFullPath = "{$_SERVER['DOCUMENT_ROOT']}{$imgData["tmpFilePath"]}";
			move_uploaded_file($_FILES[$imgName]['tmp_name'], $fileFullPath);
		}else if(!$_FILES[$imgName]["tmp_name"] && $deleteImgFlg){
			// アップロードファイルがなく、画像が削除されている場合
			$imgData = array("fileName"=>"", "filePath"=>"", "tmpFileName"=>"", "tmpFilePath"=>"");
		}
		// 戻り値を返す
		return $imgData;
	}


	/**
	 * ファイルパスを取得する関数
	 * ファイルアップロードされた場合は、imgDataに新たな画像パスが設定される。
	 * セッション上の画像パスと、imgDataの画像パスが違う場合は、新規にアップロードされたと判断し新規画像パスとする。
	 * ※削除された場合も、空文字になっているので不一致となり空文字が設定される。
	 * 画像が３種類に増えたので、共通で使用できる様に修正
	 * オープンセミナー登録でも使用するのでpublicに変更
	 * @param object $imgData			画像アップロード時に登録される画像データ
	 * @param string $currentImgPath	セッションに保存されている画像パス（更新時には設定されている）
	 */
	public function getWebinarImgPath($imgData, $currentImgPath){
		if($imgData["filePath"] != $currentImgPath){
			// 新規画像のファイルパスとする。若しくは削除により空文字とする。
			$currentImgPath = $imgData["filePath"];
		}
		// ファイルパスを返す
		return $currentImgPath;
	}


	/**
	 * ウェビナー画像のアップロード処理処理
	 * currentFilePathは編集時のみDBの画像パスが設定されており、
	 * imgDataのfilePathの差異がある場合は、削除を含め新規画像をアップロードされた場合となる。
	 * 
	 * 画像が３種類に増えたので、共通で使用できる様に修正
	 * オープンセミナー登録でも使用するのでpublicに変更
	 * @param array 	$form				登録処理で使用するform
	 * @param array 	$imgName			３種類ある画像のnameが送信される
	 * @param string 	$deleteImgFlgName	３種類ある画面で画像削除ボタンを押下した場合に真となる（デフォルトは偽）
	 * @param string 	$currentFilePath	DBに登録する前のファイルパス
	 * @return string	画像パス
	 */
	public function uploadOrDeleteWebinarImage($imgData, $currentFilePath){
		if($imgData["filePath"] != $currentFilePath){
			// 新規画像のパスをチェック
			$tmpFileFullPath = "{$_SERVER["DOCUMENT_ROOT"]}{$imgData["tmpFilePath"]}";
			if(file_exists($tmpFileFullPath)){
				// 新規画像アップロードされている場合
				rename($tmpFileFullPath, "{$_SERVER["DOCUMENT_ROOT"]}{$imgData["filePath"]}");
			}
			// DBに登録された画像のパスをチェック
			$currentFileFullPath = "{$_SERVER["DOCUMENT_ROOT"]}{$currentFilePath}";
			if(file_exists($currentFileFullPath)){
				// 変更前の画像が存在する場合は削除する（新規登録時は存在しない）
				unlink($currentFileFullPath);
			}
		}
	}

	/**
	 * アンケート結果一覧の表示に必要なデータを取得する
	 * @param array $form
	 * @param array $screenSession
	 * @return object
	 */
	public function getQuestionnaireResultList($form, &$screenSession){
		// セッションの初期化
		if($screenSession->isnew == true){
			$screenSession->order = 'a.id';
			$screenSession->page = 1;
			$screenSession->pagesize = 100;
			$screenSession->ordertype = 'desc';	// 任意
			$screenSession->webinarId = $this->escape(intval($form["id"]));
		}
		// パラメータをセッションに格納
		foreach($form as $key=>$val){
			$screenSession->$key = $val;
		}
		// daoの宣言
		$webinarDao = Application_CommonUtil::getInstance("dao", "WebinarDao", $this->db);
		$questionnaireDao = Application_CommonUtil::getInstance("dao", "QuestionnaireDao", $this->db);
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
		// アンケート結果カウントを取得する
		$count = $webinarDao->getQuestionnaireResultCount($this->user["client_id"], $screenSession->webinarId, $freeWord);
		// アンケート結果のリストを取得する
		$list = $webinarDao->getQuestionnaireResultList($this->user["client_id"], $screenSession->webinarId, $freeWord, $screenSession->viewType, $screenSession->order, $screenSession->ordertype, $screenSession->page, $screenSession->pagesize);
		$listObject = new Application_Pager(array(
				"itemData"	=> $list,						// リスト
				"itemCount"	=> $count,						// リスト
				"perPage"	=> $screenSession->pagesize,	// ページごと表示件数
				"curPage"	=> $screenSession->page,		// 表示するページ
				"order"		=> $screenSession->order,		// ソートカラム名
				"orderType"	=> $screenSession->ordertype,	// asc or desc
		));
		// 参加者の検索条件無しカウントを取得する
		$webinarDict = $webinarDao->getWebinarRowByIdAndClientId($screenSession->webinarId, $this->user["client_id"]);
		// 戻り値を作成し返す
		return array("listObject"=>$listObject, "webinarDict"=>$webinarDict, "answerTypeNames"=>$this->answerTypeNames);
	}

	/**
	 * アンケート集計結果を取得する
	 */
	public function getQuestionnaireAggregate($form){
		// daoの宣言
		$webinarDao = Application_CommonUtil::getInstance("dao", "WebinarDao", $this->db);
		// 戻り値
		$result = array("status"=>0, "questionnaire"=>array(), "questionnaireAggregateList"=>array(), "message"=>"");
		if(is_numeric($form["webinarId"]) && is_numeric($form["historyId"])){
			// 表示が２択か、それ以外か判定したいので先にアンケート情報を取得する
			$questionnaire = $webinarDao->getQuestionnaireRow($this->user["client_id"], $form["webinarId"], $form["historyId"]);
			if($questionnaire){
				// ２択の場合、「はい」「いいえ」の順番を保証したいので、ORDER BYの指定を増やす
				$orderBy = "a.id asc";
				if($questionnaire["answer_type"] == self::ANSWER_TYPE_TWO_SELECT){
					$orderBy = "a.id asc, a.answer desc";
				}
				// アンケートの集計に必要な情報を取得する
				$result["questionnaireAggregateList"] = $webinarDao->getQuestionnaireAggregate($this->user["client_id"], $form["webinarId"], $form["historyId"], $orderBy);
				// アンケート情報を設定する
				$result["questionnaire"] = $questionnaire;
				// 成功ステータスへ変更する
				$result["status"] = 1;
			}else{
				// 送信パラメータエラー
				$result["message"] = "不正な値が送信されました";
			}
		}else{
			// 送信パラメータエラー
			$result["message"] = "不正な値が送信されました";
		}
		// 戻り値を返す
		return $result;
	}

	/**
	 * ウェビナー利用時間を取得する
	 * @param int $clientId 現在のクライアントID
	 */
	private function getWebinarUseTime($clientId){
		// daoの宣言
		$webinarDao = Application_CommonUtil::getInstance("dao", "WebinarDao", $this->db);
		$masterClientDao = Application_CommonUtil::getInstance("dao", "MasterClientDao", $this->db);
		// 今月使用したウェビナー時間の合計を取得する
		$webinarUseTimeCount = $webinarDao->getSumWebinarUseTime($clientId);
		// 分から時間に変換
		$webinarUseTime = "00";
		$webinarUseMinute = "00";
		if($webinarUseTimeCount["webinar_use_time"] > 0){
			$webinarUseTime = sprintf('%02d', floor($webinarUseTimeCount["webinar_use_time"] / 60));
			$webinarUseMinute = sprintf('%02d', $webinarUseTimeCount["webinar_use_time"] % 60);
		}
		// ウェビナーの利用可能時間を取得する
		$masterClient = $masterClientDao->getMasterClientRow($clientId);
		$masterClientDao->webinarUseTimeCheckFlg($clientId, 0);

		// 基本契約時間から使用時間を差し引く(残った時間)
		$remainDefaultWebinarTime = ($masterClient["webinar_available_time"] * 60 - $webinarUseTimeCount["webinar_use_time"]);

		// 今月のウェビナーの残り使用時間を設定
		$webinarUseHours = sprintf('%02d', floor($remainDefaultWebinarTime / 60));
		$webinarUseMinutes = sprintf('%02d', $remainDefaultWebinarTime % 60);
		$displayWebinarUseTime = "{$webinarUseHours}：{$webinarUseMinutes}";
		$displayTotalWebinarUseTime = "{$webinarUseHours}：{$webinarUseMinutes}";
		
		// 基本契約時間が0以下か以上か
		if($remainDefaultWebinarTime <= 0){
			// 0以下の時点でwebinar_time_limit_secondは限界を超えているのでNULLになる
			$masterClientDao->updateWebinarUseTime($clientId, "webinar_time_limit_second", NULL);
			$displayWebinarUseTime = "00：00";

			// 基本契約時間0以下で、追加時間がある場合
			if($masterClient["webinar_add_time"] > 0){
				$remainAddWebinarTime = $masterClient["webinar_add_time"] * 60 + $remainDefaultWebinarTime;
				$webinarUseTimeCheckFlg = $masterClientDao->webinarUseTimeCheck($clientId);

				// 追加時間が0以下の場合
				if($remainAddWebinarTime < 0){
					$masterClientDao->webinarUseTimeCheckFlg($clientId, 1);
					$checkWebinarAvailable = false;
					$unpaidWebinarTime = $webinarUseTimeCheckFlg[0]["webinar_add_time_limit_second"] + $remainAddWebinarTime;

					// ここでNULLを入れるのではなく超えた時間を入れる
					$masterClientDao->updateWebinarUseTime($clientId, "webinar_add_time_limit_second", $remainAddWebinarTime);
					$webinarUseTimeCheckFlg = $masterClientDao->webinarUseTimeCheck($clientId);
				
					$displayAddWebinarUseTime = "00：00";
					$displayTotalWebinarUseTime = "00：00";
				}else{
					// 追加時間が0以上の場合
					$masterClientDao->webinarUseTimeCheckFlg($clientId, 0);
					$checkWebinarAvailable = true;

					// 残りの契約時間を登録
					$masterClientDao->updateWebinarUseTime($clientId, "webinar_add_time_limit_second", $remainAddWebinarTime);

					// 追加時間の残りを設定
					$webinarAddUseHour = sprintf('%02d', floor($remainAddWebinarTime / 60));
					$webinarAddUseMinute = sprintf('%02d', $remainAddWebinarTime % 60);
					$displayAddWebinarUseTime = "{$webinarAddUseHour}：{$webinarAddUseMinute}";

					// トータルの残り時間を設定
					$displayTotalWebinarUseTime = "{$webinarAddUseHour}：{$webinarAddUseMinute}";
					if($remainAddWebinarTime == 0){
						// 追加時間が0以上の場合
						$masterClientDao->webinarUseTimeCheckFlg($clientId, 1);
						$checkWebinarAvailable = false;
					}
				}

			}else{
				// 基本契約時間0以下で、追加契約時間も0以下の場合
				$masterClientDao->webinarUseTimeCheckFlg($clientId, 1);
				$checkWebinarAvailable = false;

				// 使いすぎた分は追加時間分にマイナスの値を入れる
				$masterClientDao->updateWebinarUseTime($clientId, "webinar_time_limit_second", $remainDefaultWebinarTime);
				$displayAddWebinarUseTime = "00：00";
				$displayTotalWebinarUseTime = "00：00";
			}

		}else{
			$checkWebinarAvailable = true;
			// 基本契約時間を超えていない場合
			$masterClientDao->webinarUseTimeCheckFlg($clientId, 0);
			$masterClientDao->updateWebinarUseTime($clientId, "webinar_time_limit_second", $webinarUseTimeCount["webinar_use_time"]);

			// 追加購入分があるかをチェック(true:トータル時間に合計値、falas:トータル時間に基本契約時間)
			$checkWebinarAddUseTime = $masterClientDao->geteWebinarAddUseTime($clientId);

			// 追加時間があって、使用していない
			if($checkWebinarAddUseTime[0]["webinar_add_time"]){
				$exsitRemainAddWebinarTime = $masterClient["webinar_add_time"] * 60;

				// 追加時間の残りを設定
				$exsitRemainAddWebinarHour = sprintf('%02d', floor($exsitRemainAddWebinarTime / 60));
				$exsitRemainAddWebinarMinute = sprintf('%02d', $exsitRemainAddWebinarTime % 60);
				$displayAddWebinarUseTime = "{$exsitRemainAddWebinarHour}：{$exsitRemainAddWebinarMinute}";

				// トータルの残り時間を設定
				$exsitRemainTotalWebinarHour = sprintf('%02d', $exsitRemainAddWebinarHour + $webinarUseHours);
				$exsitRemainTotalWebinarMinute = sprintf('%02d', $exsitRemainAddWebinarMinute + $webinarUseMinutes);
				$displayTotalWebinarUseTime = "{$exsitRemainTotalWebinarHour}：{$exsitRemainTotalWebinarMinute}";

				// 追加時間があって、使用しているが残っている
				if($checkWebinarAddUseTime[0]["webinar_add_time_limit_second"]){
					$remainAddUseWebinarTime = $checkWebinarAddUseTime[0]["webinar_add_time_limit_second"];

					// 追加時間の残りを設定
					$exsitRemainAddUseWebinarHour = sprintf('%02d', floor($remainAddUseWebinarTime / 60));
					$exsitRemainAddUseWebinarMinute = sprintf('%02d', $remainAddUseWebinarTime % 60);
					$displayAddWebinarUseTime = "{$exsitRemainAddUseWebinarHour}：{$exsitRemainAddUseWebinarMinute}";

					// トータルの残り時間を設定
					$exsitRemainUseTotalWebinarHour = sprintf('%02d', floor(($remainAddUseWebinarTime + $remainDefaultWebinarTime) / 60));
					$exsitRemainUseTotalWebinarMinute = sprintf('%02d', ($remainAddUseWebinarTime + $remainDefaultWebinarTime) % 60);
					$displayTotalWebinarUseTime = "{$exsitRemainUseTotalWebinarHour}：{$exsitRemainUseTotalWebinarMinute}";
				}
			}else{
				// 追加時間がない
				$displayAddWebinarUseTime = "00：00";
			}
		}

		// 戻り値を返す
		return array("displayWebinarUseTime"=>$displayWebinarUseTime,
					 "displayAddWebinarUseTime"=>$displayAddWebinarUseTime,
					 "displayTotalWebinarUseTime"=>$displayTotalWebinarUseTime,
					 "checkWebinarAvailable"=>$checkWebinarAvailable
					);
	}

	/**
	 * room_nameを使用し、ウェビナー特定後にadmin_key名を返す
	 * @param string $roomName テーブル内でユニークなキー情報
	 */
	public function getWebinarAdminKey($roomName){
		// 戻り値を宣言
		$adminKey = "";
		// daoの宣言
		$webinarDao = Application_CommonUtil::getInstance("dao", "WebinarDao", $this->db);
		// admin_keyからroom_nameを取得する
		$webinar = $webinarDao->getWebinarByRoomName($roomName);
		if($webinar){
			// データが取得できた場合のみ、admin_keyを設定する
			$adminKey = $webinar["admin_key"];
		}
		// 戻り値を返す
		return $adminKey;
	}

	/**
	 * ログインしているアカウントが、ウェビナーを利用可能なアカウントか判別
	 */
	public function clientIdentification($user)
	{	
		$allowAccount = $user['staff_role'] != "AA_1" && $user['staff_role'] != "AA_2";
		$webinarDao = Application_CommonUtil::getInstance("dao", "WebinarDao", $this->db);
		$webinar = $webinarDao->boolWebinarAvailableTime($user['client_id']);
		// ウェビナー可能時間が0以外の場合$allowClientはtrue
		$allowClient = $webinar["webinar_available_time"];
		//AAアカウントの場合
		if ($allowAccount == false){
			return true;
		//AAアカウントではないが、ウェビナー可能時間がある場合
		}else if($allowAccount == true && $allowClient == true){
			return true;
		//AAアカウントでなく、ウェビナー可能時間がない場合
		}else if($allowAccount == false && $allowClient == false){
			return false;
		//上記に当てはまらない
		}else{
			return false;
		}
	}
}
