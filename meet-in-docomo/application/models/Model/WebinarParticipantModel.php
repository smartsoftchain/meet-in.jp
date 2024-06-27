<?php
class WebinarParticipantModel extends AbstractModel{

	const IDENTIFIER = "webinarParticipant";					// セッション変数のnamespace
	private $db;												// DBコネクション
	const PARTICIPANT_COUNT_INCREASE = 1;						// 参加者人数増加
	const PARTICIPANT_COUNT_DECREASE = 2;						// 参加人数減少
	// URLキーからユーザーを特定する場合、参加者かリードの２種類を判定用
	const BEHAVIOR_HISTORY_TYPE_PARTICIPANT = "participant";	// 参加者へメールを送信からの操作
	const BEHAVIOR_HISTORY_TYPE_LEAD = "lead";					// リードへメールを送信からの操作

	function __construct($db){
		parent::init();
		$this->db = $db;
	}

	public function init() {
	}
	
	/**
	 * ウェビナー参加者一覧の表示に必要なデータを取得する
	 * @param array $form
	 * @param array $screenSession
	 * @return object
	 */
	function getWebinarParticipantList($form, &$screenSession){
		// セッションの初期化
		if($screenSession->isnew == true){
			$screenSession->order = 'id';
			$screenSession->page = 1;
			$screenSession->pagesize = 100;
			$screenSession->ordertype = 'asc';	// 任意
			$screenSession->webinarId = $this->escape(intval($form["id"]));
		}
		// パラメータをセッションに格納
		foreach($form as $key=>$val){
			$screenSession->$key = $this->escape($val);
		}
		// daoの宣言
		$webinarDao = Application_CommonUtil::getInstance("dao", "WebinarDao", $this->db);
		$webinarParticipantDao = Application_CommonUtil::getInstance("dao", "WebinarParticipantDao", $this->db);
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
		// ウェビナー情報を取得する
		$count = $webinarParticipantDao->getWebinarParticipantCount($screenSession->webinarId, $this->user["client_id"], $freeWord);
		$list = $webinarParticipantDao->getWebinarParticipantList($screenSession->webinarId, $this->user["client_id"], $freeWord, $screenSession->order, $screenSession->ordertype, $screenSession->page, $screenSession->pagesize);
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
		// 実際の参加者数を取得する
		$webinarDict["webinarEnterRoomCount"] = $webinarParticipantDao->getWebinarEnterRoomCount($screenSession->webinarId, $this->user["client_id"]);
		// 実際の参加者数を取得する
		$webinarDict["webinarCancelCount"] = $webinarParticipantDao->getWebinarCancelCount($screenSession->webinarId, $this->user["client_id"]);;
		// キャンセル数を取得する
		// 戻り値を作成する
		return array("listObject"=>$listObject, "webinarDict"=>$webinarDict);
	}

	/**
	 * ウェビナー参加者の削除処理
	 * @param array $form
	 * @return array
	 */
	public function deleteParticipant($form){
		// daoの宣言
		$webinarDao = Application_CommonUtil::getInstance("dao", "WebinarDao", $this->db);
		$webinarParticipantDao = Application_CommonUtil::getInstance("dao", "WebinarParticipantDao", $this->db);
		$wpBehaviorHistoryDao = Application_CommonUtil::getInstance("dao", "WebinarParticipantBehaviorHistoryDao", $this->db);
		// MODELの宣言
		$mailModel = Application_CommonUtil::getInstance('model', "MailModel", $this->db);
		// 戻り値宣言
		$result = array("status"=>0, "errors"=>array());
		// トランザクションスタート
		$this->db->beginTransaction();
		try{
			// 記述が長いのでウェビナーIDを変数へ代入
			$webinarId = $this->escape(intval($form["webinarId"]));
			// 削除対象のウェビナーを取得する
			$webinar = $webinarDao->getWebinarRowByIdAndClientId($webinarId, $this->user["client_id"]);
			if($webinar){
				// 参加者人数のカウントをローカル変数へ代入
				$currentParticipantCount = $webinar["current_participant_count"];
				// 削除はウェビナー開始10分前まで行えるので時間をチェックする
				if(date("Y-m-d H:i:s") < date('Y-m-d H:i:s', strtotime($webinar["holding_date"]."-10 minute"))){
					foreach($form["participantIds"] as $participantId){
						// 参加者情報を取得する(削除前に情報を取得する)
						$webinarParticipant = $webinarParticipantDao->getWebinarParticipantRow($webinarId, $participantId, $this->user["client_id"]);
						// ウェビナー参加者を削除する
						$webinarParticipantDao->deleteParticipant($webinarId, $participantId, $this->user["client_id"]);
						// 参加人数を減らす
						$currentParticipantCount--;
						$webinarDao->updateWebinarParticipantCount($webinarId, $currentParticipantCount);
						if($webinarParticipant){
							// メールの最新タイトルを設定する
							$subject = $webinarParticipantDao->setLatestMailSubject($webinarId, $participantId, $this->user["client_id"], $mailModel->getSendCancelParticipantMailSubject($webinar["name"]));
							// メール本文を取得する
							$body = $mailModel->getSendCancelParticipantMailBody($webinar, $webinarParticipant);
							// 行動履歴を登録する
							$wpBehaviorHistoryDao->setWebinarParticipantBehaviorHistorySendSystemMail($webinarParticipant, self::BEHAVIOR_STATUS_RESERVATION_CANCEL, $webinarParticipant["mail_address"], $subject, $body);
							// 参加者へ削除（キャンセル）メールを送信する
							$rtn = $mailModel->sendCancelParticipantMail($webinar, $webinarParticipant);
							if(!$rtn){
								// メール送信エラー履歴を登録する
								$wpBehaviorHistoryDao->setWebinarParticipantBehaviorHistorySendSystemMail($webinarParticipant, self::BEHAVIOR_STATUS_ERROR_MAIL, $webinarParticipant["mail_address"], $subject, $body);
							}
						}
					}
				}else{
					$result["errors"][] = "{$webinar["name"]}は削除できる時間を過ぎたため、削除できませんでした。";
				}
			}else{
				$result["errors"][] = "不正なIDが送信されました。";
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
	 * ウェビナー参加者の登録処理
	 * @param array $form
	 * @param array $request
	 * @return object
	 */
	public function regist($form, $request, &$screenSession){
		// 戻り値の宣言
		$result = array(
			"webinarParticipantDict"		=> array(),
			"webinarDict"					=> array(),
			"errorList"						=> array(),
			"registCompleteFlg"				=> 0
		);
		// セッション取得
		$session = Application_CommonUtil::getSession(self::IDENTIFIER);
		// daoの宣言
		$webinarDao = Application_CommonUtil::getInstance("dao", "WebinarDao", $this->db);
		$webinarParticipantDao = Application_CommonUtil::getInstance("dao", "WebinarParticipantDao", $this->db);
		// POSTデータが存在する場合は、登録・更新処理を行う
		if ($request->isPost()){
			// webinaoを取得する
			$webinar = $webinarDao->getWebinarRowByIdAndClientId($session->webinarId, $this->user["client_id"]);
			// 新規登録処理
			$result = $this->commonRegits($result, $form, $webinar, $session, $webinarParticipantDao, $webinarDao);
			// 成功失敗関係なくwebinarDictを設定する
			$result["webinarDict"] = $webinar;
		}else{
			// セッション情報を初期化する
			Application_CommonUtil::unsetSession(self::IDENTIFIER);
			if(array_key_exists("webinarId", $form) && array_key_exists("id", $form)){
				// 編集の場合GETパラメータをセッションに保持し、参加者情報を１件取得する
				$session->webinarId = $this->escape(intval($form["webinarId"]));
				$session->webinarParticipantId = $this->escape(intval($form["id"]));
				$result["webinarParticipantDict"] = $webinarParticipantDao->getWebinarParticipantRow($session->webinarId, $session->webinarParticipantId, $this->user["client_id"]);
				// 郵便番号を分割する
				$result["webinarParticipantDict"]["postcode1"] = current(explode("-", $result["webinarParticipantDict"]["postcode"]));
				$result["webinarParticipantDict"]["postcode2"] = end(explode("-", $result["webinarParticipantDict"]["postcode"]));
				// ステータス表示があるので、webinar情報も取得する
				$result["webinarDict"] = $webinarDao->getWebinarRowByIdAndClientId($session->webinarId, $this->user["client_id"]);
				// キャンセルフラグをセッションに保持する
				$session->cancelFlg = $result["webinarParticipantDict"]["cancel_flg"];
			}else{
				// webinarIdをセッションに設定
				$session->webinarId = $this->escape(intval($form["webinarId"]));
				// 新規作成の場合
				$result["webinarParticipantDict"] = array(
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
					"webinarId" => $this->escape(intval($form["webinarId"]))
				);
			}
		}
		// 戻り値を返す
		return $result;
	}

	/**
	 * ウェビナー参加者の登録処理
	 * 新規登録と更新（詳細）処理で共通となる処理
	 * @param array $result					戻り値
	 * @param array $form					画面から送信された値
	 * @param array $webinar				参加者を登録するウェビナー情報
	 * @param array $session				更新の場合に保持されているデータのセッション
	 * @param object $webinarParticipantDao	WebinarParticipantDaoのインスタンス
	 * @param object $webinarDao			WebinarDaoのインスタンス
	 * @return array
	 */
	private function commonRegits($result, $form, $webinar, $session, $webinarParticipantDao, $webinarDao){
		// DAOの宣言
		$wpBehaviorHistoryDao = Application_CommonUtil::getInstance("dao", "WebinarParticipantBehaviorHistoryDao", $this->db);
		// MODELの宣言
		$mailModel = Application_CommonUtil::getInstance('model', "MailModel", $this->db);
		$webinarLeadModel = Application_CommonUtil::getInstance("model", "WebinarLeadModel", $this->db);
		// 郵便番号を1つのデータとする
		$form["postcode"] = "{$form["postcode1"]}-{$form["postcode2"]}";
		// バリデーションの実行
		$errorList = $this->webinarParticipantValidation($form, $webinar, $session->webinarParticipantId); 
		if(count($errorList) == 0){
			// トランザクションスタート
			$this->db->beginTransaction();
			try{
				// ステータス変更の場合、参加人数が変わるので増減フラグを設定
				$participantCountState = 0;
				if($session->webinarParticipantId){
					// 更新時はIDを設定する
					$form["id"] = $session->webinarParticipantId;
					// ウェビナー開催前で編集の場合はステータス変更があり得る
					if(array_key_exists("status", $form)){
						if($form["status"] == 1 && $session->cancelFlg == 1){
							// 元々キャンセル状態から、予約中ステータスになった場合キャンセルフラグを落とす
							$form["cancel_flg"] = 0;
							// 予約中に変更なので、予約人数を増やす
							$participantCountState = self::PARTICIPANT_COUNT_INCREASE;
						}else if($form["status"] == 2 && $session->cancelFlg == 0){
							// 元々予約中状態から、キャンセルステータスになった場合キャンセルフラグを立てる
							$form["cancel_flg"] = 1;
							// キャンセルに変更なので、予約人数を減らす
							$participantCountState = self::PARTICIPANT_COUNT_DECREASE;
						}
					}
				}else{
					// 参加者キーを作成する
					$form["unique_key"] = $this->getUniqueKey($webinarParticipantDao);
					// 新規作成の場合のみ予約番号を作成する
					$form["reservation_number"] = $this->createReservationNumber($webinarParticipantDao, $webinar["id"]);
					// 新規作成時の最新メール送信タイトルを設定する
					$form["latest_mail_subject"] = $mailModel->getSendWebinarParticipantSubject();
				}
				$webinarParticipantDao->setWebinarParticipant($form, $webinar);
				// 新規登録の場合のみ、セミナー参加人数更新とメール送信を行う
				if(!$session->webinarParticipantId){
					// 新規登録した参加者データを取得する
					$webinarParticipant = $webinarParticipantDao->getWebinarParticipantAfterCreation($webinar["id"], $form["mail_address"], $form["reservation_number"]);
					// 参加者へ送信するメール本文を取得する
					$body = $mailModel->getSendWebinarParticipantBody($form, $webinar);
					// 今登録した参加者の行動履歴の予約を登録する(この処理は間違えやすいので、要注意)
					$wpBehaviorHistoryDao->setWebinarParticipantBehaviorHistorySendSystemMail($webinarParticipant, self::BEHAVIOR_STATUS_RESERVATION, $form["mail_address"], $form["latest_mail_subject"], $body);
					// 登録した行動履歴のIDを取得する
					$wpBehaviorHistoryId = $wpBehaviorHistoryDao->getBehaviorHistoryMaxIdByAllCondition($webinarParticipant, self::BEHAVIOR_STATUS_RESERVATION);

					// リード若しくは、参加者へメール送信から登録になった場合は、元データにも行動履歴を登録する(この処理は間違えやすいので、要注意)
					$resultBehaviorHistory = array("errorMessage"=>"", "behaviorHistoryType"=>"", "behaviorHistoryData"=>array(), "webinarId"=>0);
					if(array_key_exists("url_param", $form) && mb_strlen($form["url_param"]) > self::DETAIL_URL_WEBINAR_ONLY){
						// 行動履歴の登録(戻り値は、メール送信エラーが発生した場合にのみ使用する)
						$resultBehaviorHistory = $this->registBehaviorHistory($form["url_param"], self::BEHAVIOR_STATUS_RESERVATION, $form["mail_address"], $form["latest_mail_subject"], $body);
					}
					
					// ウェビナーの参加人数を更新する
					$webinarDao->updateWebinarParticipantCount($webinar["id"], $webinar["current_participant_count"]+1);
					// リードに登録する
					$webinarParticipant["wpbh_id"] = $wpBehaviorHistoryId;
					$webinarLeadModel->registLeadFromParticipant($webinarParticipant, $form["mail_address"], $form["latest_mail_subject"], $body);
					// 主催者と参加者にメールを送信する。
					$rtn = $mailModel->sendWebinarParticipant($form, $webinar);
					if(!$rtn){
						// メール送信エラー履歴を登録する（この行動履歴は新規登録した参加者情報の行動履歴に登録される）
						$wpBehaviorHistoryDao->setWebinarParticipantBehaviorHistorySendSystemMail($webinarParticipant, self::BEHAVIOR_STATUS_ERROR_MAIL, $form["mail_address"], $form["latest_mail_subject"], $body);
						// 参加者かリードのメールで登録する際にメール送信エラーが発生した場合のエラー行動履歴登録
						if($resultBehaviorHistory["behaviorHistoryType"] == self::BEHAVIOR_HISTORY_TYPE_PARTICIPANT){
							// メール送信エラー履歴を登録する
							$wpBehaviorHistoryDao = Application_CommonUtil::getInstance("dao", "WebinarParticipantBehaviorHistoryDao", $this->db);
							$wpBehaviorHistoryDao->setWebinarParticipantBehaviorHistorySendSystemMail($resultBehaviorHistory["behaviorHistoryData"], self::BEHAVIOR_STATUS_ERROR_MAIL, $form["mail_address"], $form["latest_mail_subject"], $body);
						}else if($resultBehaviorHistory["behaviorHistoryType"] == self::BEHAVIOR_HISTORY_TYPE_LEAD){
							// メール送信エラー履歴を登録する
							$webinarLeadBehaviorHistoryDao = Application_CommonUtil::getInstance("dao", "WebinarLeadBehaviorHistoryDao", $this->db);
							$webinarLeadBehaviorHistoryDao->setWebinarLeadBehaviorHistorySystemMail($resultBehaviorHistory["behaviorHistoryData"], $resultBehaviorHistory["webinarId"], self::BEHAVIOR_STATUS_ERROR_MAIL, $form["mail_address"], $form["latest_mail_subject"], $body);
						}
					}
				}else{
					// 行動履歴登録用共通項目設定
					$webinarParticipant = array(
						"webinar_id" => $webinar["id"],
						"id" => $form["id"],
						"client_id" => $webinar["client_id"],
						"latest_mail_subject" => ""
					);
					// 編集の場合のみ行う処理
					if($participantCountState == self::PARTICIPANT_COUNT_INCREASE){
						// ステータス変更で参加人数を増やす
						$webinarDao->updateWebinarParticipantCount($webinar["id"], $webinar["current_participant_count"]+1);
						// 行動履歴を登録する（メール送信はないが、予約の行動履歴は登録する）
						$wpBehaviorHistoryDao->setWebinarParticipantBehaviorHistory($webinarParticipant, self::BEHAVIOR_STATUS_RESERVATION);
					}else if($participantCountState == self::PARTICIPANT_COUNT_DECREASE){
						// ステータス変更で参加人数を減らす
						$webinarDao->updateWebinarParticipantCount($webinar["id"], $webinar["current_participant_count"]-1);
						// 行動履歴を登録する（メール送信はないが、キャンセルの行動履歴は登録する）
						$wpBehaviorHistoryDao->setWebinarParticipantBehaviorHistory($webinarParticipant, self::BEHAVIOR_STATUS_RESERVATION_CANCEL);
					}
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
				//$result["errorList"][] = array("system_error"=>$e->getMessage());
				// エラーが存在する場合の戻り値作成
				$result["webinarParticipantDict"] = $form;
			}
		}else{
			// エラーが存在する場合の戻り値作成
			$result["webinarParticipantDict"] = $form;
			$result["errorList"] = $errorList;
		}
		// 戻り値を返す
		return $result;
	}


	/**
	 * ウェビナーの参加フォームURLが実行された場合の処理
	 * URLの最後に付与されているキーを使用し、ウェビナーを特定する。
	 */
	public function getParticipantFormInfo($form){
		// daoの宣言
		$webinarDao = Application_CommonUtil::getInstance("dao", "WebinarDao", $this->db);
		// URLからパラメータを取得する
		$urlParam = current(explode("?", end(explode("/", $_SERVER['REQUEST_URI']))));
		// 行動履歴のエラーを保持する
		$resultBehaviorHistory = array("errorMessage"=>"", "behaviorHistoryType"=>"", "behaviorHistoryData"=>array(), "webinarId"=>0);
		// 分離したキーを保存する変数宣言
		$webinarKey = parent::getWebinarKey($urlParam);
		// 送信相手を特定できるキーが存在する場合は行動履歴の登録を行う。
		if(mb_strlen($urlParam) > self::DETAIL_URL_WEBINAR_ONLY){
			// 予約詳細と予約画面は同じ関数を使用しているので、どちらの画面を表示か判定する
			$behaviorStatus = 0;
			$requestUrls = explode("/", $_SERVER["REQUEST_URI"]);
			if($requestUrls[2] == "webi-desc"){
				// 予約詳細画面を表示（/api/webi-desc/......）
				$behaviorStatus = self::BEHAVIOR_STATUS_CLICK_MAIL;
			}elseif($requestUrls[2] == "webinar-participant-form"){
				// 予約入力フォーム画面を表示（/api/webinar-participant-form/......）
				$behaviorStatus = self::BEHAVIOR_STATUS_RESERVATION_DISPLAY;
			}
			// 予約ページ表示の行動履歴を登録する
			$resultBehaviorHistory = $this->registBehaviorHistoryWrap($urlParam, "", $behaviorStatus);
		}
		// ウェビナー情報を取得する
		$webinar = $webinarDao->getWebinarByAnnounceKey($webinarKey);
		if($webinar){
			// エラーメッセージの初期化
			$webinar["error"] = "";
			if($resultBehaviorHistory["errorMessage"] != ""){
				// 行動履歴で不具合が存在した場合
				$webinar["error"] = $errorBehaviorHistory;
			}
			// 現在がウェビナーの開催日より前かチェックする
			if($webinar["error"] == "" && date("Y-m-d H:i:s") >= date('Y-m-d H:i:s', strtotime($webinar["holding_date"]."+{$webinar["holding_time"]} minute"))){
				$webinar["error"] = "開催は終了しました";
			}
			if($webinar["error"] == "" && $webinar["max_participant_count"] <= $webinar["current_participant_count"]){
				// 最大参加人数を超えていないかチェックする
				$webinar["error"] = "予約者数が定員に達しました";
			}
			if($webinar["error"] == "" && !is_null($webinar["from_reservation_date"]) && date("Y-m-d H:i:s") <= $webinar["from_reservation_date"]){
				// 予約期間FORMより前に予約詳細を表示した場合
				$fromReservationDate = date('Y-m-d H:i', strtotime($webinar["from_reservation_date"]));
				$webinar["error"] = "参加予約は<br>{$fromReservationDate}からです";
			}
			if($webinar["error"] == "" && !is_null($webinar["to_reservation_date"]) && date("Y-m-d H:i:s") >= $webinar["to_reservation_date"]){
				// 予約期間TOより後に予約詳細を表示した場合
				$toReservationDate = date('Y-m-d H:i', strtotime($webinar["to_reservation_date"]));
				$webinar["error"] = "参加予約は<br>{$toReservationDate}までです";
			}
			// ウェビナー情報にキーを追加する
			$webinar["url_param"] = $urlParam;
		}
		// ウェビナー情報を返す
		return $webinar;
	}

	/**
	 * ウェビナーお問い合わせを送信する
	 */
	public function sendWebinarInquiry($form){
		// 戻り値宣言
		$result = array();
		// daoの宣言
		$webinarDao = Application_CommonUtil::getInstance("dao", "WebinarDao", $this->db);
		// エラーが存在しない場合のみメールを送信する
		$mailModel = Application_CommonUtil::getInstance('model', "MailModel", $this->db);
		// 行動履歴のエラーを保持する
		$resultBehaviorHistory = array("errorMessage"=>"", "behaviorHistoryType"=>"", "behaviorHistoryData"=>array(), "webinarId"=>0);
		// URLからウェビナーキーだけを取得する
		$webinarKey = parent::getWebinarKey($form["urlParam"]);
		// ウェビナー情報を取得する
		$webinar = $webinarDao->getWebinarByAnnounceKey($webinarKey);
		// バリデーションの実行
		$errorList = $this->webinarInquiryValidation($form, $webinar);
		if(count($errorList) == 0){
			// トランザクションスタート
			$this->db->beginTransaction();
			try{
				// メールタイトルと本文の変数宣言
				$subject = "";
				$body = "";
				// 送信相手を特定できるキーが存在する場合は行動履歴の登録を行う。
				if(mb_strlen($form["urlParam"]) > self::DETAIL_URL_WEBINAR_ONLY){
					// メールタイトル取得
					$subject = $mailModel->getSendWebinarInquirySubject($webinar["name"]);
					// メール本文取得
					$body = $mailModel->getSendWebinarInquiryBody($form, $webinar);
					// お問い合わせの行動履歴を登録する
					$resultBehaviorHistory = $this->registBehaviorHistory($form["urlParam"], self::BEHAVIOR_STATUS_INQUIRY, $webinar["mail_address"], $subject, $body);
				}
				// お問い合わせをメール送信する
				$rtn = $mailModel->sendWebinarInquiry($form, $webinar);
				if(!$rtn){
					// 参加者かリードかで登録先が変わる
					if($resultBehaviorHistory["behaviorHistoryType"] == self::BEHAVIOR_HISTORY_TYPE_PARTICIPANT){
						// メール送信エラー履歴を登録する
						$wpBehaviorHistoryDao = Application_CommonUtil::getInstance("dao", "WebinarParticipantBehaviorHistoryDao", $this->db);
						// 送信相手を特定できるキーが存在するか、存在しないかで履歴の登録情報が変わる
						if(mb_strlen($form["urlParam"]) > self::DETAIL_URL_WEBINAR_ONLY){
							// 相手が特定できる場合
							$wpBehaviorHistoryDao->setWebinarParticipantBehaviorHistorySendSystemMail($resultBehaviorHistory["behaviorHistoryData"], self::BEHAVIOR_STATUS_ERROR_MAIL, $webinar["mail_address"], $subject, $body);
						}else{
							// 相手が特定できない場合
							$wpBehaviorHistoryDao->setWebinarParticipantBehaviorHistory($resultBehaviorHistory["behaviorHistoryData"], self::BEHAVIOR_STATUS_ERROR_MAIL);
						}
					}else if($resultBehaviorHistory["behaviorHistoryType"] == self::BEHAVIOR_HISTORY_TYPE_LEAD){
						// メール送信エラー履歴を登録する
						$webinarLeadBehaviorHistoryDao = Application_CommonUtil::getInstance("dao", "WebinarLeadBehaviorHistoryDao", $this->db);
						// 送信相手を特定できるキーが存在するか、存在しないかで履歴の登録情報が変わる
						if(mb_strlen($form["urlParam"]) > self::DETAIL_URL_WEBINAR_ONLY){
							// 相手が特定できる場合
							$webinarLeadBehaviorHistoryDao->setWebinarLeadBehaviorHistorySystemMail($resultBehaviorHistory["behaviorHistoryData"], $resultBehaviorHistory["webinarId"], self::BEHAVIOR_STATUS_ERROR_MAIL, $webinar["mail_address"], $subject, $body);
						}else{
							// 相手が特定できない場合
							$webinarLeadBehaviorHistoryDao->setWebinarLeadBehaviorHistory($resultBehaviorHistory["behaviorHistoryData"], $resultBehaviorHistory["webinarId"], self::BEHAVIOR_STATUS_ERROR_MAIL);
						}
					}
				}
				// コミットする
				$this->db->commit();
			}catch(Exception $e){
				$this->db->rollBack();
				$result[] = array("system_error"=>"想定外のエラーが発生しました。再度お申し込みください。");
				$result[] = array("system_error"=>$e->getMessage());
			}
		}else{
			// エラーが存在する場合は扱いやすいように整形する
			foreach($errorList as $row){
				foreach($row as $key=>$val){
					$result[] = $val;
				}
			}
			// 行動履歴でエラーが発生した場合は設定する
			if($resultBehaviorHistory["errorMessage"] != ""){
				$result[] = $resultBehaviorHistory["errorMessage"];
			}
		}
		// 戻り値を返す
		return $result;
	}

	/**
	 * ウェビナーの参加申請を行う
	 * 
	 */
	public function registParticipantForm($form){
		// daoの宣言
		$webinarDao = Application_CommonUtil::getInstance("dao", "WebinarDao", $this->db);
		$webinarParticipantDao = Application_CommonUtil::getInstance("dao", "WebinarParticipantDao", $this->db);
		// 戻り値
		$result = array();
		// 分離したキーを保存する変数宣言
		$webinarKey = parent::getWebinarKey($form["url_param"]);
		// URLの種別を取得する(webinaKeyの後の１文字取得)
		$urlType = parent::getUrlType($form["url_param"]);
		// 画面を表示したユーザーキーを取得する(webinaKeyの後のURL種別後の値を取得する)
		$targetKey = parent::getTargetKey($form["url_param"]);
		if($urlType == self::DETAIL_URL_TYPE_LEAD){
			// リードを取得する
			$webinarLeadDao = Application_CommonUtil::getInstance("dao", "WebinarLeadDao", $this->db);
			$webinarLead = $webinarLeadDao->getWebinarLeadByUniqueKey($targetKey);
			// リードIDを設定する
			$form["lead_id"] = $webinarLead["id"];
		}
		// ウェビナー情報を取得する
		$webinar = $webinarDao->getWebinarByAnnounceKey($webinarKey);
		// 新規登録処理
		$registResult = $this->commonRegits($result, $form, $webinar, null, $webinarParticipantDao, $webinarDao);
		// エラーが存在する場合は扱いやすいように整形する
		if($registResult["errorList"] > 0){
			foreach($registResult["errorList"] as $row){
				foreach($row as $key=>$val){
					$result[] = $val;
				}
			}
		}
		// 戻り値を変えす
		return $result;
	}

	/**
	 * 同じウェビナー内で一意になる予約番号を発行する
	 * オープンセミナーでも使用するのでpublicに変更
	 */
	public function createReservationNumber($webinarParticipantDao, $webinarId){
		// ランダム文字列生成
		$reservationNumber = substr(str_shuffle('1234567890abcdefghijklmnopqrstuvwxyz'), 0, 4);
		// 作成した予約番号が使用されていないかチェック
		$webinar = $webinarParticipantDao->searchSameReservationNumber($webinarId, $reservationNumber);
		if($webinar){
			// 同じデータが存在した場合は再帰する
			$reservationNumber = $this->createReservationNumber($webinarParticipantDao, $webinarId);
		}
		// 戻り値を返す
		return $reservationNumber;
	}

	/**
	 * ウェビナー参加者登録のバリデーション処理
	 */
	public function webinarParticipantValidation($data, $webinar, $webinarParticipantId){
		// 戻り値宣言
		$errorList = array();
		if($webinar){
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
			// 最大人数が設定されている場合は、最大人数を超えていないかチェックする
			if(!is_null($webinar["max_participant_count"]) && $webinar["max_participant_count"] <= $webinar["current_participant_count"]){
				$errorList["error"][] = "ウェビナーへの最大参加人数を超えました。";
			}
			// 同一人物がウェビナーに参加していないかチェックする（暫定でメールアドレスでチェック）
			$webinarParticipantDao = Application_CommonUtil::getInstance("dao", "WebinarParticipantDao", $this->db);
			$duplication = $webinarParticipantDao->duplicationWebinarParticipant($webinar["id"], $this->escape($data["mail_address"]));
			if($duplication && !$webinarParticipantId){
				// 同じメールアドレスは登録できない（新規登録のみメールアドレスチェックを行う）
				$errorList["error"][] = "同じメールアドレスが登録されています。";
			}
			// 編集の場合のみ、ステータスが存在した場合はフラグをチェックする
			if(array_key_exists("status", $data)){
				// ウェビナー開催前のみステータスは変更できる
				if(date("Y-m-d H:i:s") >= date('Y-m-d H:i:s', strtotime($webinar["holding_date"]."+{$webinar["holding_time"]} minute"))){
					$errorList["error"][] = "ステータスが不正です。";
				}
				// statusは1〜3まで存在する。（ただし変更できるのは1か2）
				if($data["status"] != 1 && $data["status"] != 2 && $data["status"] != 3){
					$errorList["error"][] = "ステータスが不正です。";
				}
			}
		}else{
			$errorList["error"][] = "不正なパラメータです。";
		}
		return $errorList;
	}

	/**
	 * ウェビナーお問い合わせバリデーション
	 */
	private function webinarInquiryValidation($data, $webinar){
		// 戻り値宣言
		$errorList = array();
		if($webinar){
			// 実行するバリデーションの設定
			$validationDict = array(
				"webinarInquiryName"	=>array("name" =>"お名前",			"validate" => array(1)),
				"webinarInquiryTel"		=>array("name" =>"電話番号",		"validate" => array(1,11)),
				"webinarInquiryEmail"	=>array("name" =>"メールアドレス",	 "validate" => array(1,7))
			);
			// バリデーションの実行
			$errorList = executionValidation($data, $validationDict);
		}else{
			$errorList["error"][] = "不正なパラメータです。";
		}
		return $errorList;
	}

	/**
	 * URLのキーを元にウェビナー情報を返す
	 */
	public function getWebinarInfo($form){
		// daoの宣言
		$webinarDao = Application_CommonUtil::getInstance("dao", "WebinarDao", $this->db);
		// 戻り値
		$result = array();
		// URLからパラメータを取得する
		$urlParam = current(explode("?", end(explode("/", $_SERVER['REQUEST_URI']))));
		// 分離したキーを保存する変数宣言
		$webinarKey = parent::getWebinarKey($urlParam);
		// ウェビナー情報を取得する
		$webinar = $webinarDao->getWebinarByAnnounceKey($webinarKey);
		// 戻り値を返す
		return $webinar;
	}

	/**
	 * ウェビナーのキャンセルURLが実行された場合の処理
	 * URLの最後に付与されているキーを使用し、ウェビナーを特定する。
	 */
	public function getParticipantCancel($form){
		// daoの宣言
		$webinarDao = Application_CommonUtil::getInstance("dao", "WebinarDao", $this->db);
		// ウェビナーのユニークキーを取得する
		$uniqueKey = current(explode("?", end(explode("/", $_SERVER['REQUEST_URI']))));
		// ウェビナー情報を取得する
		$webinar = $webinarDao->getWebinarByAnnounceKey($uniqueKey);
		if($webinar){
			// エラーメッセージの初期化
			$webinar["errorStatus"] = 0;
			// 現在がウェビナーの開催日より前かチェックする
			if(date("Y-m-d H:i:s") >= date('Y-m-d H:i:s', strtotime($webinar["holding_date"]."+{$webinar["holding_time"]} minute"))){
				$webinar["errorStatus"] = 1;
			}
		}
		// ウェビナー情報にキーを追加する
		$webinar["key"] = $uniqueKey;
		// ウェビナー情報を返す
		return $webinar;
	}
	/**
	 * ウェビナーをキャンセルする処理
	 */
	public function cancelParticipantForm($form){
		// daoの宣言
		$webinarDao = Application_CommonUtil::getInstance("dao", "WebinarDao", $this->db);
		$webinarParticipantDao = Application_CommonUtil::getInstance("dao", "WebinarParticipantDao", $this->db);
		$wpBehaviorHistoryDao = Application_CommonUtil::getInstance("dao", "WebinarParticipantBehaviorHistoryDao", $this->db);
		// MODELの宣言
		$mailModel = Application_CommonUtil::getInstance('model', "MailModel", $this->db);
		// 戻り値の宣言
		$result = array("status"=>0, "error"=>"");
		// POSTデータをエスケープしローカル変数へ保存
		$announceKey = $this->escape($form["announceKey"]);
		$mailAddress = $this->escape($form["mailAddress"]);
		$reservationNumber = $this->escape($form["reservationNumber"]);
		// POSTデータを元に予約キャンセルを行いたい参加者の情報を取得する
		$webinarParticipant = $webinarParticipantDao->getChancelReservationRow($announceKey, $mailAddress, $reservationNumber);
		if($webinarParticipant){
			// トランザクションスタート
			$this->db->beginTransaction();
			try{
				// ウェビナー情報を取得する
				$webinar = $webinarDao->getWebinarRowByIdAndClientId($webinarParticipant["webinar_id"], $webinarParticipant["client_id"]);
				// ウェビナー参加をキャンセルする
				$webinarParticipantDao->chancelWebinarParticipant($webinarParticipant["webinar_id"], $webinarParticipant["id"], $webinarParticipant["client_id"]);
				// メール件名を取得する
				$subject = $mailModel->getSendCancelParticipantMailSubject($webinar["name"]);
				// メール本文を取得する
				$body = $mailModel->getSendCancelParticipantMailBody($webinar, $webinarParticipant);
				// メールの最新タイトルを設定する
				$subject = $webinarParticipantDao->setLatestMailSubject($webinarParticipant["webinar_id"], $webinarParticipant["id"], $webinarParticipant["client_id"], $subject);
				$webinarParticipant["latest_mail_subject"] = $subject;
				// 行動履歴を登録する
				$wpBehaviorHistoryDao->setWebinarParticipantBehaviorHistorySendSystemMail($webinarParticipant, self::BEHAVIOR_STATUS_RESERVATION_CANCEL, $webinarParticipant["mail_address"], $subject, $body);
				// キャンセルメールを送信する
				$rtn = $mailModel->sendCancelParticipantMail($webinar, $webinarParticipant);
				if(!$rtn){
					// メール送信エラー履歴を登録する
					$wpBehaviorHistoryDao->setWebinarParticipantBehaviorHistorySendSystemMail($webinarParticipant, self::BEHAVIOR_STATUS_ERROR_MAIL, $webinarParticipant["mail_address"], $subject, $body);
				}
				// コミットする
				$this->db->commit();
				// ステータスを変更する
				$result["status"] = 1;
			}catch(Exception $e){
				$this->db->rollBack();
				$result["error"] = "想定外のエラーが発生しました。";
				$result["error"] = $e->getMessage();
			}
		}
		// 戻り値を返す
		return $result;
	}


	/**
	 * 参加者詳細から参加登録までの未ログイン時の行動履歴登録処理
	 * ラップの関数ではDBに登録するためにトランザクションを使用している。
	 * 別トランザクションで登録処理を行う場合は、ラップではなく本体を呼び出す。
	 * @param string $urlParam				URLに付与されているパラメータ
	 * @param string $mailSubject		メール送信タイトル
	 * @param int $behaviorStatus			行動履歴ステータス
	 * @return array
	 */
	private function registBehaviorHistoryWrap($urlParam, $mailSubject, $behaviorStatus){
		// 戻り値宣言
		$result = array("errorMessage"=>"", "behaviorHistoryType"=>"", "behaviorHistoryData"=>array(), "webinarId"=>0);
		// トランザクションスタート
		$this->db->beginTransaction();
		try{
			// 行動履歴の登録を行う（引数の詳細は関数定義に記述）
			$rtn = $this->registBehaviorHistory($urlParam, $behaviorStatus, "", $mailSubject, "");
			$result["behaviorHistoryType"] = $rtn["behaviorHistoryType"];
			$result["behaviorHistoryData"] = $rtn["behaviorHistoryData"];
			$result["webinarId"] = $rtn["webinarId"];
			// コミットする
			$this->db->commit();
		}catch(Exception $e){
			$this->db->rollBack();
			$result["errorMessage"] = "想定外のエラーが発生しました。再度お申し込みください。";
			//$result["errorMessage"] = $e->getMessage();
		}
		// 戻り値を返す
		return $result;
	}

	/**
	 * 参加者詳細から参加登録までの未ログイン時の行動履歴登録処理の本体
	 * 予約確定時にこの処理を行う際に、トランザクションが二重になってしまうので、
	 * 登録処理の本体のみ切り離す
	 * @param string $urlParam				URLに付与されているパラメータ
	 * @param int $behaviorStatus			行動履歴ステータス
	 * @param string $destinationAddres		メール送信先アドレス
	 * @param string $mailSubject			メール送信タイトル
	 * @param string $body					メール本文
	 */
	private function registBehaviorHistory($urlParam, $behaviorStatus, $destinationAddress, $mailSubject, $body){
		// 戻り値
		$result = array("behaviorHistoryType"=>"", "behaviorHistoryData"=>array(), "webinarId"=>0);
		// URLの種別を取得する(webinaKeyの後の１文字取得)
		$urlType = parent::getUrlType($urlParam);
		// 画面を表示したユーザーキーを取得する(webinaKeyの後のURL種別後の値を取得する)
		$targetKey = parent::getTargetKey($urlParam);
		// ターゲットが特定できた場合は、行動履歴を登録する
		if($urlType == self::DETAIL_URL_TYPE_PARTICIPANT){
			// 参加者を取得する
			$webinarParticipantDao = Application_CommonUtil::getInstance("dao", "WebinarParticipantDao", $this->db);
			$webinarParticipant = $webinarParticipantDao->getWebinarParticipantByUniqueKey($targetKey);
			if($webinarParticipant){
				// メールタイトルを設定する（詳細・予約画面表示の場合は、空文字が設定される）
				$webinarParticipant["latest_mail_subject"] = $mailSubject;
				// 参加者の行動履歴を登録する
				$wpBehaviorHistoryDao = Application_CommonUtil::getInstance("dao", "WebinarParticipantBehaviorHistoryDao", $this->db);
				// メールを送信する場合と、送信しない場合で履歴の登録方法が異なる
				if($destinationAddress == "" && $mailSubject == ""){
					// メール送信のない履歴登録
					$wpBehaviorHistoryDao->setWebinarParticipantBehaviorHistory($webinarParticipant, $behaviorStatus);
				}else{
					// メール送信の場合は、参加者の最終メール送信タイトルを変更する
					$webinarParticipantDao->setLatestMailSubject($webinarParticipant["webinar_id"], $webinarParticipant["id"], $webinarParticipant["client_id"], $mailSubject);
					// メール送信を行う履歴登録
					$wpBehaviorHistoryDao->setWebinarParticipantBehaviorHistorySendSystemMail($webinarParticipant, $behaviorStatus, $destinationAddress, $mailSubject, $body);
				}
				// 戻り値に値を設定する
				$result["behaviorHistoryType"] = self::BEHAVIOR_HISTORY_TYPE_PARTICIPANT;
				$result["behaviorHistoryData"] = $webinarParticipant;
			}
		}else if($urlType == self::DETAIL_URL_TYPE_LEAD){
			// リードを取得する
			$webinarLeadDao = Application_CommonUtil::getInstance("dao", "WebinarLeadDao", $this->db);
			$webinarLead = $webinarLeadDao->getWebinarLeadByUniqueKey($targetKey);
			if($webinarLead){
				// メールタイトルを設定する（詳細・予約画面表示の場合は、空文字が設定される）
				$webinarLead["latest_mail_subject"] = $mailSubject;
				// ウェビナーキーを取得する
				$webinarKey = parent::getWebinarKey($urlParam);
				// ウェビナーを取得する
				$webinarDao = Application_CommonUtil::getInstance("dao", "WebinarDao", $this->db);
				$webinar = $webinarDao->getWebinarByAnnounceKey($webinarKey);
				// リードの行動履歴を登録する
				$webinarLeadBehaviorHistoryDao = Application_CommonUtil::getInstance("dao", "WebinarLeadBehaviorHistoryDao", $this->db);
				// メールを送信する場合と、送信しない場合で履歴の登録方法が異なる
				if($destinationAddress == "" && $mailSubject == ""){
					// メール送信のない履歴登録
					$webinarLeadBehaviorHistoryDao->setWebinarLeadBehaviorHistory($webinarLead, $webinar["id"], $behaviorStatus);
				}else{
					// メール送信の場合は、リードの最終メール送信タイトルを変更する
					$webinarLeadDao->setLatestMailSubject($webinarLead["id"], $webinarLead["client_id"], $mailSubject);
					// メール送信を行う履歴登録
					$webinarLeadBehaviorHistoryDao->setWebinarLeadBehaviorHistorySystemMail($webinarLead, $webinar["id"], $behaviorStatus, $destinationAddress, $mailSubject, $body);
				}
				// 戻り値に値を設定する
				$result["behaviorHistoryType"] = self::BEHAVIOR_HISTORY_TYPE_LEAD;
				$result["behaviorHistoryData"] = $webinarLead;
				$result["webinarId"] = $webinar["id"];
			}
		}
		// 戻り値を返す
		return $result;
	}

	/**
	 * ウェビナー参加者行動履歴一覧の表示に必要なデータを取得する
	 * @param array $form
	 * @param array $screenSession
	 * @return object
	 */
	public function behaviorHistoryList($form, &$screenSession){
		// セッションの初期化
		if($screenSession->isnew == true){
			$screenSession->order = 'id';
			$screenSession->page = 1;
			$screenSession->pagesize = 100;
			$screenSession->ordertype = 'desc';	// 任意
		}
		// パラメータをセッションに格納
		foreach($form as $key=>$val){
			$screenSession->$key = $this->escape($val);
		}
		// セッション取得
		$session = Application_CommonUtil::getSession(self::IDENTIFIER);
		// daoの宣言
		$wpBehaviorHistoryDao = Application_CommonUtil::getInstance("dao", "WebinarParticipantBehaviorHistoryDao", $this->db);
		$webinarParticipantDao = Application_CommonUtil::getInstance("dao", "WebinarParticipantDao", $this->db);
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
		// ウェビナー情報を取得する
		$count = $wpBehaviorHistoryDao->getBehaviorHistoryCount($session->webinarId, $session->webinarParticipantId, $this->user["client_id"], $freeWord);
		$list = $wpBehaviorHistoryDao->getBehaviorHistoryList($session->webinarId, $session->webinarParticipantId, $this->user["client_id"], $freeWord, $screenSession->order, $screenSession->ordertype, $screenSession->page, $screenSession->pagesize);
		$listObject = new Application_Pager(array(
				"itemData"	=> $list,						// リスト
				"itemCount"	=> $count,						// リスト
				"perPage"	=> $screenSession->pagesize,	// ページごと表示件数
				"curPage"	=> $screenSession->page,		// 表示するページ
				"order"		=> $screenSession->order,		// ソートカラム名
				"orderType"	=> $screenSession->ordertype,	// asc or desc
		));
		// 参加者情報を取得する
		$webinarParticipantDict = $webinarParticipantDao->getWebinarParticipantRow($session->webinarId, $session->webinarParticipantId, $this->user["client_id"]);
		// 戻り値を作成する
		return array("listObject"=>$listObject, "webinarParticipantDict"=>$webinarParticipantDict, "behaviorHistorys"=>$this->behaviorHistorys);
	}

	/**
	 * ウェビナー参加者行動履歴を１件取得する
	 */
	public function behaviorHistoryRow($form){
		// 戻り値宣言
		$result = array("status"=>0, "behaviorHistory"=>array(), "message"=>"");
		// daoの宣言
		$wpBehaviorHistoryDao = Application_CommonUtil::getInstance("dao", "WebinarParticipantBehaviorHistoryDao", $this->db);
		// 送信された値のチェック
		$ids = explode("_", $form["ids"]);
		if(count($ids) == 3){
			// 各ID変数へ設定
			$webinarId = $ids[0];
			$participantId = $ids[1];
			$id = $ids[2];
			if(is_numeric($webinarId) && is_numeric($participantId) && is_numeric($id)){
				// 全てが数値の場合のみ、履歴情報を取得する
				$behaviorHistory = $wpBehaviorHistoryDao->getBehaviorHistoryRow($webinarId, $participantId, $id, $this->user["client_id"]);
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
	 * オープンセミナーでも使用するのでpublicに変更
	 * @param object $webinarParticipantDao
	 * @return string
	 */
	public function getUniqueKey($webinarParticipantDao){
		// 参加者キーを作成する（英数字8文字）
		$randomString = parent::createRandomStirng(self::RANDOM_TYPE_UNIQUE_KEY);
		// 既に使用されていないかチェックする
		$result = $webinarParticipantDao->searchSameUniqueKey($randomString);
		if($result){
			// 同じ「admin_key」がウェビナーに存在する場合は、再帰しデータを取得する
			$randomString = $this->getUniqueKey($webinarParticipantDao);
		}
		// ランダム文字列を返す
		return $randomString;
	}
}
