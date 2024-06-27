<?php
class WebinarMailModel extends AbstractModel{

	const IDENTIFIER = "webinar_mail";			// セッション変数のnamespace
	// メール種別
	const MAIL_TYPE_SINGLE_PARTICIPAN = "single-participant";			// 参加者個別メール
	const MAIL_TYPE_MULTIPLE_PARTICIPAN = "multiple-participant";		// 参加者一括メール
	const MAIL_TYPE_SINGLE_LEAD = "single-lead";						// リード個別メール
	const MAIL_TYPE_MULTIPLE_LEAD = "multiple-lead";					// リード一括メール
	// メール送信の日時指定
	const SEND_MAIL_TYPE_NOW = 1;
	const SEND_MAIL_TYPE_DESIGNATION = 2;
	
	private $db;								// DBコネクション
	function __construct($db){
		parent::init();
		$this->db = $db;
	}
	public function init() {
	}
	// 埋め込みタグ
	private $embeddedTags = array(
		"__{{予約番号}}__" => "予約番号",
		"__{{名前}}__" => "名前",
		"__{{フリガナ}}__" => "フリガナ",
		"__{{電話番号}}__" => "電話番号",
		"__{{メールアドレス}}__" => "メールアドレス",
		"__{{郵便番号}}__" => "郵便番号",
		"__{{住所}}__" => "住所",
		"__{{企業名}}__" => "企業名",
		"__{{部署}}__" => "部署",
		"__{{役職}}__" => "役職",
	);
	// 埋め込みタグとDBのカラムの紐付け
	private $relationEmbeddedTagAndTableColumn = array(
		"__{{予約番号}}__" => "reservation_number",
		"__{{名前}}__" => "name",
		"__{{フリガナ}}__" => "kana",
		"__{{電話番号}}__" => "tel_number",
		"__{{メールアドレス}}__" => "mail_address",
		"__{{郵便番号}}__" => "postcode",
		"__{{住所}}__" => "street_address",
		"__{{企業名}}__" => "company_name",
		"__{{部署}}__" => "company_department",
		"__{{役職}}__" => "company_position",
	);
	/**
	 * メール作成に必要な情報を取得する
	 * メール埋め込みタグ、メールテンプレートなど
	 * @param array $form					戻り値
	 * @return array
	 */
	public function getMailCreateInfo($form, $screenSession){
		// セッション情報をリセットする
		$session = Application_CommonUtil::resetSession(self::IDENTIFIER);
		// 戻り値を宣言
		$result = array("mailEmbeddedTag"=>array(), "webinarList"=>array(), "mailTemplate"=>array(), "view_destination_text"=>"");
		// DAOの宣言
		$webinarParticipantDao = Application_CommonUtil::getInstance("dao", "WebinarParticipantDao", $this->db);
		$webinarLeadDao = Application_CommonUtil::getInstance("dao", "WebinarLeadDao", $this->db);
		$webinarDao = Application_CommonUtil::getInstance("dao", "WebinarDao", $this->db);
		if($form["mailType"] == self::MAIL_TYPE_SINGLE_PARTICIPAN || $form["mailType"] == self::MAIL_TYPE_SINGLE_LEAD){
			// 個別メールの場合
			$webinarMailTarget = array();
			if($form["mailType"] == self::MAIL_TYPE_SINGLE_PARTICIPAN){
				// 参加者一覧画面の場合は参加者を取得する
				$webinarMailTarget = $webinarParticipantDao->getWebinarParticipantRow($this->escape(intval($form["webinarId"])), $this->escape(intval($form["mailTargetIds"][0])), $this->user["client_id"]);
			}else if($form["mailType"] == self::MAIL_TYPE_SINGLE_LEAD){
				// リード一覧画面の場合はリードを取得する
				$webinarMailTarget = $webinarLeadDao->getWebinarLeadRow($this->escape(intval($form["mailTargetIds"][0])), $this->user["client_id"]);
			}
			if($webinarMailTarget){
				// 参加者情報が取得できた場合のみ埋め込みタグを作成する
				$result["mailEmbeddedTag"][] = array("val"=>"", "text"=>"選択してください。");
				if($form["mailType"] == self::MAIL_TYPE_SINGLE_PARTICIPAN){
					// 参加者一覧の場合のみ設定
					$result["mailEmbeddedTag"][] = array("val"=>$webinarMailTarget["reservation_number"], "text"=>"予約番号");
				}
				$result["mailEmbeddedTag"][] = array("val"=>$webinarMailTarget["name"], "text"=>"名前");
				$result["mailEmbeddedTag"][] = array("val"=>$webinarMailTarget["kana"], "text"=>"フリガナ");
				$result["mailEmbeddedTag"][] = array("val"=>$webinarMailTarget["tel_number"], "text"=>"電話番号");
				$result["mailEmbeddedTag"][] = array("val"=>$webinarMailTarget["mail_address"], "text"=>"メールアドレス");
				$result["mailEmbeddedTag"][] = array("val"=>$webinarMailTarget["postcode"], "text"=>"郵便番号");
				$result["mailEmbeddedTag"][] = array("val"=>$webinarMailTarget["street_address"], "text"=>"住所");
				$result["mailEmbeddedTag"][] = array("val"=>$webinarMailTarget["company_name"], "text"=>"企業名");
				$result["mailEmbeddedTag"][] = array("val"=>$webinarMailTarget["company_department"], "text"=>"部署");
				$result["mailEmbeddedTag"][] = array("val"=>$webinarMailTarget["company_position"], "text"=>"役職");
				// 送信相手の情報を設定する
				$result["view_destination_text"] = "{$webinarMailTarget["name"]} ＜{$webinarMailTarget["mail_address"]}＞";
				// 送信相手の情報をセッションに設定しておく
				$session->webinarMailTarget = $webinarMailTarget;
			}
		}else if($form["mailType"] == self::MAIL_TYPE_MULTIPLE_PARTICIPAN || $form["mailType"] == self::MAIL_TYPE_MULTIPLE_LEAD){
			// 複数メールの場合は、擬似埋め込みタグを作成する
			$result["mailEmbeddedTag"][] = array("val"=>"", "text"=>"選択してください。");
			foreach($this->embeddedTags as $embeddedTagKey=>$embeddedTagsName){
				// 予約番号のみ、表示・非表示があるので分岐する
				if($embeddedTagKey == "__{{予約番号}}__"){
					// 一斉参加者メール送信の場合のみ予約番号を表示する
					if($form["mailType"] == self::MAIL_TYPE_MULTIPLE_PARTICIPAN){
						$result["mailEmbeddedTag"][] = array("val"=>$embeddedTagKey, "text"=>$embeddedTagsName);
					}
				}else{
					$result["mailEmbeddedTag"][] = array("val"=>$embeddedTagKey, "text"=>$embeddedTagsName);
				}
			}
			// 宛先作成(複数人の場合は最大３名まで)
			$countViewDestination = 0;
			foreach($form["mailTargetIds"] as $mailTargetId){
				$webinarMailTarget = array();
				if($form["mailType"] == self::MAIL_TYPE_MULTIPLE_PARTICIPAN){
					// 参加者情報を取得する
					$webinarMailTarget = $webinarParticipantDao->getWebinarParticipantRow($this->escape(intval($form["webinarId"])), $mailTargetId, $this->user["client_id"]);
				}else if($form["mailType"] == self::MAIL_TYPE_MULTIPLE_LEAD){
					// リード情報を取得する
					$webinarMailTarget = $webinarLeadDao->getWebinarLeadRow($mailTargetId, $this->user["client_id"]);
				}
				$result["view_destination_text"] .= "{$webinarMailTarget["name"]} ＜{$webinarMailTarget["mail_address"]}＞";
				$countViewDestination++;
				if($countViewDestination == 3){
					if(count($form["mailTargetIds"]) > 3){
						$result["view_destination_text"] .="...他、".number_format(count($form["mailTargetIds"])-3)."名";
					}
					break;
				}else{
					$result["view_destination_text"] .= "<br>";
				}
			}
		}
		// ウェビナー情報を取得する
		if($form["mailType"] == self::MAIL_TYPE_SINGLE_PARTICIPAN || $form["mailType"] == self::MAIL_TYPE_MULTIPLE_PARTICIPAN){
			// 参加者一覧の場合はウェビナーが決まっているので１件取得する
			$webinar = $webinarDao->getWebinarRowByIdAndClientId($this->escape(intval($form["webinarId"])), $this->user["client_id"]);
			$result["webinarList"][] = array("val"=>"", "text"=>"選択してください。");
			$result["webinarList"][] = array("val"=>$webinar["id"], "text"=>$webinar["name"]);
		}else{
			// リードの場合はウェビナーが決まっていないので、全件取得する
			$result["webinarList"][] = array("val"=>"", "text"=>"選択してください。");
			$webinarList = $webinarDao->getWebinarByClientId($this->user["client_id"]);
			foreach($webinarList as $webinar){
				$result["webinarList"][] = array("val"=>$webinar["id"], "text"=>$webinar["name"]);
			}
		}
		// メール種別をセッションに保存
		$session->mailType = $form["mailType"];
		$session->mailTargetIds = $form["mailTargetIds"];
		$session->webinarId = $this->escape(intval($form["webinarId"]));
		// 戻り値を返す
		return $result;
	}

	/**
	 * メールモーダルでウェビナーが選択された際に
	 * ウェビナー情報の埋め込みタグを返す処理
	 * @param array 	$form	画面で設定したメール情報
	 * @return string	
	 */
	public function getWebinarEmbeddedTag($form){
		// 戻り値を宣言
		$result = array("mailEmbeddedTag"=>array());
		// DAOの宣言
		$webinarDao = Application_CommonUtil::getInstance("dao", "WebinarDao", $this->db);
		// セッション取得
		$session = Application_CommonUtil::getSession(self::IDENTIFIER);
		// ウェビナー情報を取得する
		$webinar = $webinarDao->getWebinarRowByIdAndClientId($this->escape(intval($form["webinarId"])), $this->user["client_id"]);
		// ウェビナータグ作成
		$result["mailEmbeddedTag"][] = array("val"=>"", "text"=>"選択してください。");
		$result["mailEmbeddedTag"][] = array("val"=>$webinar["name"], "text"=>"名前");
		$result["mailEmbeddedTag"][] = array("val"=>$webinar["outline"], "text"=>"概要");
		$result["mailEmbeddedTag"][] = array("val"=>date('Y/m/d H:i', strtotime($webinar["holding_date"])), "text"=>"開催日時");
		$result["mailEmbeddedTag"][] = array("val"=>$webinar["holding_time"], "text"=>"所要時間");
		if($webinar["from_reservation_date"] != ""){
			$result["mailEmbeddedTag"][] = array("val"=>date('Y/m/d H:i', strtotime($webinar["from_reservation_date"])), "text"=>"予約開始日時");
		}
		if($webinar["to_reservation_date"] != ""){
			$result["mailEmbeddedTag"][] = array("val"=>date('Y/m/d H:i', strtotime($webinar["to_reservation_date"])), "text"=>"予約終了日時");
		}
		$result["mailEmbeddedTag"][] = array("val"=>$webinar["max_participant_count"], "text"=>"最大参加人数");
		$result["mailEmbeddedTag"][] = array("val"=>$webinar["current_participant_count"], "text"=>"現在の参加人数(モーダル表示時の人数)");
		$result["mailEmbeddedTag"][] = array("val"=>$webinar["explanation_text"], "text"=>"説明文");
		// 予約画面のURLを作成する
		$webinarDescriptionUrl = (empty($_SERVER['HTTPS']) ? 'http://' : 'https://').$_SERVER['HTTP_HOST']."/api/webi-desc/{$webinar["announce_key"]}";
		if($session->mailType == self::MAIL_TYPE_SINGLE_PARTICIPAN){
			// 参加者個別メール
			$webinarDescriptionUrl .= self::DETAIL_URL_TYPE_PARTICIPANT . "{$session->webinarMailTarget["unique_key"]}";
		}else if($session->mailType == self::MAIL_TYPE_SINGLE_LEAD){
			// リード個別メール
			$webinarDescriptionUrl .= self::DETAIL_URL_TYPE_LEAD . "{$session->webinarMailTarget["unique_key"]}";
		}else if($session->mailType == self::MAIL_TYPE_MULTIPLE_PARTICIPAN){
			// 参加者一斉メール
			$webinarDescriptionUrl .= self::DETAIL_URL_TYPE_PARTICIPANT . "__{{target_key}}__";
		}else if($session->mailType == self::MAIL_TYPE_MULTIPLE_LEAD){
			// リード一斉メール
			$webinarDescriptionUrl .= self::DETAIL_URL_TYPE_LEAD . "__{{target_key}}__";
		}
		$result["mailEmbeddedTag"][] = array("val"=>$webinarDescriptionUrl, "text"=>"ウェビナー詳細画面URL");
		// メール開封通知タグを作成する
		$param = $webinar["announce_key"];
		if($session->mailType == self::MAIL_TYPE_SINGLE_PARTICIPAN){
			// 参加者個別メール
			$param .= self::DETAIL_URL_TYPE_PARTICIPANT . "{$session->webinarMailTarget["unique_key"]}?__{{mail_subject}}__";
		}else if($session->mailType == self::MAIL_TYPE_SINGLE_LEAD){
			// リード個別メール
			$param .= self::DETAIL_URL_TYPE_LEAD . "{$session->webinarMailTarget["unique_key"]}?__{{mail_subject}}__";
		}else if($session->mailType == self::MAIL_TYPE_MULTIPLE_PARTICIPAN){
			// 参加者一斉メール
			$param .= self::DETAIL_URL_TYPE_PARTICIPANT . "__{{target_key}}__?__{{mail_subject}}__";
		}else if($session->mailType == self::MAIL_TYPE_MULTIPLE_LEAD){
			// リード一斉メール
			$param .= self::DETAIL_URL_TYPE_LEAD . "__{{target_key}}__?__{{mail_subject}}__";
		}
		$eMailDisplayTag = $this->getDisplayEailTag($param);
		$result["mailEmbeddedTag"][] = array("val"=>$eMailDisplayTag, "text"=>"開封通知タグ");
		// 戻り値を返す
		return $result;
	}

	/**
	 * ウェビナーのメール送信処理
	 * @param array 	$form	画面で設定したメール情報
	 * @return string	
	 */
	public function sendWebinarMail($form){
		// セッション取得
		$session = Application_CommonUtil::getSession(self::IDENTIFIER);
		// 戻り値
		$result = array("status"=>0, "errors"=>array());
		// バリデーションを実行する
		$errorList = $this->sendWebinarMailValidation($form, $session->mailType);
		if(count($errorList) == 0){
			// MODELの宣言
			$mailModel = Application_CommonUtil::getInstance('model', "MailModel", $this->db);
			// DAOの宣言
			$webinarReservationEmailDao = Application_CommonUtil::getInstance("dao", "WebinarReservationEmailDao", $this->db);
			// トランザクションスタート
			$this->db->beginTransaction();
			try{
				// 添付ファイルが存在する場合は一時フォルダに保存する
				$appendedFileList = $this->saveTemporarilyMailAttachedFile($form["appendedFileList"]);
				// 今すぐ送信か、送信予約かで処理を分ける
				// if($form["send_date_status"] == self::SEND_MAIL_TYPE_NOW){
					// 今すぐ送信処理を行う
					$result = $this->sendMailNow($form, $result, $session, $appendedFileList);
				// }else{
				// 	// 送信予約処理を行う // TODO 2021.8末実装予定とのことで、一旦コメントアウトする
				// 	$this->sendMailDateDesignation($form, $session, $appendedFileList);
				// }
				// コミットする（メールの送信結果に関わらず、DBはコミットする）
				$this->db->commit();
				// 今すぐ送信の場合のみ添付ファイルを削除する
				// if($form["send_date_status"] == self::SEND_MAIL_TYPE_NOW){
				// 	// 添付ファイルが存在する場合は一時保存したファイルを削除する
				// 	//$this->removeTemporarilyMailAttachedFile($appendedFileList);←もともとコメントアウトしてあった 2021.8.2
				// }
				if($result["status"] == 0){
					// メール送信失敗が存在しなければ、登録完了ステータスを変更する
					$result["status"] = 1;
				}
			}catch(Exception $e){
				$this->db->rollBack();
				$result["errors"][] = "想定外のエラーが発生しました。再度お申し込みください。";
				$result["errors"][] = $e->getMessage();
			}
		}else{
			// エラーが存在する場合は扱いやすいように整形する
			foreach($errorList as $row){
				foreach($row as $key=>$val){
					$result["errors"][] = $val;
				}
			}
		}
		// 戻り値を返す
		return $result;
	}

	/**
	 * 今すぐメール送信
	 * @param array 	$form					画面から送信された値
	 * @param array 	$result					戻り値
	 * @param array 	$session				セッション情報
	 * @param array 	$appendedFileList		添付リスト（最大３件）
	 * @return array	
	 */
	private function sendMailNow($form, $result, $session, $appendedFileList){
		// MODELの宣言
		$mailModel = Application_CommonUtil::getInstance('model', "MailModel", $this->db);
		// DAOの宣言
		$webinarParticipantDao = Application_CommonUtil::getInstance("dao", "WebinarParticipantDao", $this->db);
		$webinarLeadDao = Application_CommonUtil::getInstance("dao", "WebinarLeadDao", $this->db);
		$wpBehaviorHistoryDao = Application_CommonUtil::getInstance("dao", "WebinarParticipantBehaviorHistoryDao", $this->db);
		$wlBehaviorHistoryDao = Application_CommonUtil::getInstance("dao", "WebinarLeadBehaviorHistoryDao", $this->db);
		// 選択した参加者でループする
		foreach($session->mailTargetIds as $mailTargetId){
			// メール送信対象情報を取得する
			$mailTarget = array();
			if($session->mailType == self::MAIL_TYPE_SINGLE_PARTICIPAN || $session->mailType == self::MAIL_TYPE_MULTIPLE_PARTICIPAN){
				// 参加者情報を取得する
				$mailTarget = $webinarParticipantDao->getWebinarParticipantRow($session->webinarId, $mailTargetId, $this->user["client_id"]);
			}else if($session->mailType == self::MAIL_TYPE_SINGLE_LEAD || $session->mailType == self::MAIL_TYPE_MULTIPLE_LEAD){
				// リード情報を取得する
				$mailTarget = $webinarLeadDao->getWebinarLeadRow($mailTargetId, $this->user["client_id"]);
			}
			if($mailTarget){
				// 本文の差し込み文字を変換する
				$form["send_mail_body"] = $this->convertEmbeddedTag($form["mail_subject"], $form["mail_body"], $mailTarget);
				// 宛先を設定する(画面では「名前 <メールアドレス>」の形式にしているため)
				$form["destination_address"] = $mailTarget["mail_address"];
				// メールの最新タイトルを設定と行動履歴の登録を行う
				if($session->mailType == self::MAIL_TYPE_SINGLE_PARTICIPAN || $session->mailType == self::MAIL_TYPE_MULTIPLE_PARTICIPAN){
					// 参加者のメール最新タイトルを設定
					$webinarParticipantDao->setLatestMailSubject($session->webinarId, $this->escape(intval($mailTargetId)), $this->user["client_id"], $this->escape($form["mail_subject"]));
					// 行動履歴に登録を行う
					$wpBehaviorHistoryDao->setWebinarParticipantBehaviorHistorySendFreeMail($mailTarget, self::BEHAVIOR_STATUS_SEND_MAIL, $form, $appendedFileList);
				}else if($session->mailType == self::MAIL_TYPE_SINGLE_LEAD || $session->mailType == self::MAIL_TYPE_MULTIPLE_LEAD){
					// リードのメール最新タイトルを設定
					$webinarLeadDao->setLatestMailSubject($this->escape(intval($mailTargetId)), $this->user["client_id"], $this->escape($form["mail_subject"]));
					// 行動履歴に登録を行う
					$wlBehaviorHistoryDao->setWebinarLeadBehaviorHistorySendFreeMail($mailTarget, self::BEHAVIOR_STATUS_SEND_MAIL, $form, $appendedFileList);
				}
				// メールを送信する
				$rtn = $mailModel->sendWebinarFreeMail($form, $appendedFileList);
				if(!$rtn){
					$result["status"] = 2;
					$result["errors"][] = "{$mailTarget["name"]}さんへのメール送信に失敗しました。";
					// メール送信失敗の行動履歴を登録する
					if($session->mailType == self::MAIL_TYPE_SINGLE_PARTICIPAN || $session->mailType == self::MAIL_TYPE_MULTIPLE_PARTICIPAN){
						// 行動履歴に登録を行う
						$wpBehaviorHistoryDao->setWebinarParticipantBehaviorHistorySendFreeMail($mailTarget, self::BEHAVIOR_STATUS_ERROR_MAIL, $form, $appendedFileList);
					}else if($session->mailType == self::MAIL_TYPE_SINGLE_LEAD || $session->mailType == self::MAIL_TYPE_MULTIPLE_LEAD){
						// 行動履歴に登録を行う
						$wlBehaviorHistoryDao->setWebinarLeadBehaviorHistorySendFreeMail($mailTarget, self::BEHAVIOR_STATUS_ERROR_MAIL, $form, $appendedFileList);
					}
				}
			}else{
				$result["status"] = 2;
				$result["errors"][] = "メール送信対象の取得に失敗しました。";
			}
		}
		// 戻り値を返す
		return $result;
	}

	/**
	 * 日時指定メール送信
	 * @param array 	$form					画面から送信された値
	 * @param array 	$session				セッション情報
	 * @param array 	$appendedFileList		添付リスト（最大３件）
	 * @return array	
	 */
	private function sendMailDateDesignation($form, $session, $appendedFileList){
		// DAOの宣言
		$webinarParticipantDao = Application_CommonUtil::getInstance("dao", "WebinarParticipantDao", $this->db);
		$webinarLeadDao = Application_CommonUtil::getInstance("dao", "WebinarLeadDao", $this->db);
		$webinarReservationEmailDao = Application_CommonUtil::getInstance("dao", "WebinarReservationEmailDao", $this->db);
		$wpBehaviorHistoryDao = Application_CommonUtil::getInstance("dao", "WebinarParticipantBehaviorHistoryDao", $this->db);
		$wlBehaviorHistoryDao = Application_CommonUtil::getInstance("dao", "WebinarLeadBehaviorHistoryDao", $this->db);
		// 今回の送信予約を１つのまとまりとするための、ユニークキーを作成する
		$form["reservationKey"] = md5("{$session->webinarId}{$this->user["staff_type"]}{$this->user["staff_id"]}".date("Y-m-d H:i:s"));
		// 送信日付を作成する
		$form["sendDateTime"] = "{$form["send_date"]} {$form["send_hour"]}:{$form["send_minute"]}:00";
		// 選択した参加者でループする
		foreach($session->mailTargetIds as $mailTargetId){
			// メール送信対象情報を取得する
			$mailTarget = array();
			if($session->mailType == self::MAIL_TYPE_SINGLE_PARTICIPAN || $session->mailType == self::MAIL_TYPE_MULTIPLE_PARTICIPAN){
				// 参加者情報を取得する
				$mailTarget = $webinarParticipantDao->getWebinarParticipantRow($session->webinarId, $mailTargetId, $this->user["client_id"]);
			}else if($session->mailType == self::MAIL_TYPE_SINGLE_LEAD || $session->mailType == self::MAIL_TYPE_MULTIPLE_LEAD){
				// リード情報を取得する
				$mailTarget = $webinarLeadDao->getWebinarLeadRow($mailTargetId, $this->user["client_id"]);
			}
			// 本文の差し込み文字を変換する
			$form["send_mail_body"] = $this->convertEmbeddedTag($mailTarget["mail_address"], $form["mail_body"], $mailTarget);
			// 宛先を設定する(画面では「名前 <メールアドレス>」の形式にしているため)
			$form["destination_address"] = $mailTarget["mail_address"];
			// メール送信予約テーブルにデータを登録する
			$webinarReservationEmailDao->setWebinarReservationEmail($form, $mailTarget, $appendedFileList, $this->user);
			// メールの最新タイトルを設定と行動履歴の登録を行う
			if($session->mailType == self::MAIL_TYPE_SINGLE_PARTICIPAN || $session->mailType == self::MAIL_TYPE_MULTIPLE_PARTICIPAN){
				// 参加者のメール最新タイトルを設定
				$webinarParticipantDao->setLatestMailSubject($session->webinarId, $this->escape(intval($mailTargetId)), $this->user["client_id"], $this->escape($form["mail_subject"]));
				// 行動履歴に登録を行う
				$wpBehaviorHistoryDao->setWebinarParticipantBehaviorHistorySendFreeMail($mailTarget, self::BEHAVIOR_STATUS_SEND_MAIL, $form, $appendedFileList);
			}else if($session->mailType == self::MAIL_TYPE_SINGLE_LEAD || $session->mailType == self::MAIL_TYPE_MULTIPLE_LEAD){
				// リードのメール最新タイトルを設定
				$webinarLeadDao->setLatestMailSubject($this->escape(intval($mailTargetId)), $this->user["client_id"], $this->escape($form["mail_subject"]));
				// 行動履歴に登録を行う
				$wlBehaviorHistoryDao->setWebinarLeadBehaviorHistorySendFreeMail($mailTarget, self::BEHAVIOR_STATUS_SEND_MAIL, $form, $appendedFileList);
			}
		}
	}
	/**
	 * メール送信のバリデーション処理
	 */
	private function sendWebinarMailValidation($data, $mailType){
		// 実行するバリデーションの設定
		$validationDict = array(
			"sender_name"			=>array("name" =>"送信者名", 					"validate" => array(1)),
			"sender_address"		=>array("name" =>"送信者アドレス", 				 "validate" => array(1)),
			"mail_subject"			=>array("name" =>"件名", 		"length" => 127,"validate" => array(1)),
			"mail_body"				=>array("name" =>"本文",						 "validate" => array(1)),
		);
		// バリデーションの実行
		$errorList = executionValidation($data, $validationDict);
		// 今すぐ送信と日時指定のチェック　// TODO: 日時指定予約が2021.8末実装予定のため、一旦コメントアウトする。
		// if($data["send_date_status"] != self::SEND_MAIL_TYPE_NOW && $data["send_date_status"] != self::SEND_MAIL_TYPE_DESIGNATION){
		// 	$errorList[] = array("date_status_err"=>"送信時間を選択が不正な値です。");
		// }else if($data["send_date_status"] == self::SEND_MAIL_TYPE_DESIGNATION){
		// 	// 日付指定の場合は日時をチェックする
		// 	$dateTime = "{$data["send_date"]} {$data["send_hour"]}:{$data["send_minute"]}:00";
		// 	if($dateTime != date("Y/m/d H:i:s", strtotime($dateTime))){
		// 		$errorList[] = array("date_err"=>"日時が不正な値です。");
		// 	}
		// }
		return $errorList;
	}

	/**
	 * 送信時にのみ存在する、埋め込みタグのデータを変換する
	 * @param string 	$mailSubject		メール件名
	 * @param string 	$mailBody			メール本文
	 * @param array 	$webinarParticipant 参加者情報
	 * @return string	メール本文
	 */
	function convertEmbeddedTag($mailSubject, $mailBody, $webinarParticipant){
		foreach($this->embeddedTags as $embeddedTagKey=>$embeddedTagsName){
			$mailBody = preg_replace('/__\{\{'.$embeddedTagsName.'\}\}__/u', $webinarParticipant[$this->relationEmbeddedTagAndTableColumn[$embeddedTagKey]], $mailBody);
		}
		// URLのuniqueキーを設定する（表には見えないデータなので、個別で置き換え）
		$mailBody = preg_replace('/__\{\{target_key\}\}__/u', $webinarParticipant["unique_key"], $mailBody);
		// メール件名を設定する
		$mailBody = preg_replace('/__\{\{mail_subject\}\}__/u', urlencode($mailSubject), $mailBody);
		return $mailBody;
	}

	/**
	 * メールに添付するファイルを一時保存フォルダへ保存する。
	 * @param array 	$attachedFiles 添付ファイルの名前とデータのDICTを保存した配列
	 * @return array	
	 */
	private function saveTemporarilyMailAttachedFile($attachedFiles){
		// 戻り値
		$result = array();
		// ファイル一時保存フォルダパス
		$uploaddir = "{$_SERVER['DOCUMENT_ROOT']}/tmp_mail_document/";
		foreach($attachedFiles as $attachedFile){
			// プレフィックス削除
			$uploadData = "";
			$pos = strpos($attachedFile['fileData'], ',');
			if($pos !== false) {
				$uploadData = substr($attachedFile['fileData'], $pos+1);
			}
			if($uploadData){
				// ファイル名を作成する(一時保存だが、ファイル名の重複を考慮し担当者種別とIDを付与する)
				$uploadFilePath = "{$uploaddir}{$this->user["staff_type"]}{$this->user["staff_id"]}_{$attachedFile['fileName']}";
				// Base64デコードして出力
				file_put_contents($uploadFilePath, base64_decode($uploadData));
				// 戻り値に設定する
				$result[] = array("fileName"=>$attachedFile['fileName'], "uploadFilePath"=>$uploadFilePath);
			}
		}
		// 戻り値を返す
		return $result;
	}

	/**
	 * 一時保存した添付ファイルが存在する場合は削除する
	 * @param array 	$attachedFiles saveTemporarilyMailAttachedFile()の戻り値
	 */
	private function removeTemporarilyMailAttachedFile($appendedFileList){
		foreach($appendedFileList as $appendedFile){
			if(file_exists($appendedFile["uploadFilePath"])){
				// ファイルが存在すれば削除する
				unlink($appendedFile["uploadFilePath"]);
			}
		}
	}

	/**
	 * 開封通知用の画像タグを生成する
	 * @param $resultMailId
	 * @return string
	 */
	function getDisplayEailTag($urlParam) {
		$url = (empty($_SERVER["HTTPS"]) ? "http://" : "https://").$_SERVER["HTTP_HOST"]."/api/get-email-image/{$urlParam}";
		$ret = "<img src='{$url}' width='1' height='1'>";
		return $ret;
	}

	/**
	 * メールの開封通知を受け取る
	 */
	public function registDisplayEmail(){
		// URLからパラメータを取得する
		$urlParam = current(explode("?", end(explode("/", $_SERVER['REQUEST_URI']))));
		// パラメータから特定したwebinarKeyを取得する
		$webinarKey = parent::getWebinarKey($urlParam);
		// URLの種別を取得する(webinaKeyの後の１文字取得)
		$urlType = parent::getUrlType($urlParam);
		// 画面を表示したユーザーキーを取得する(webinaKeyの後のURL種別後の値を取得する)
		$targetKey = parent::getTargetKey($urlParam);
		// メールタイトルを取得する
		$mailSubject = urldecode(end(explode("?", $_SERVER['REQUEST_URI'])));
		// トランザクションスタート
		$this->db->beginTransaction();
		try{
			// ターゲットが特定できた場合は、行動履歴を登録する
			if($urlType == self::DETAIL_URL_TYPE_PARTICIPANT){
				// 参加者を取得する
				$webinarParticipantDao = Application_CommonUtil::getInstance("dao", "WebinarParticipantDao", $this->db);
				$webinarParticipant = $webinarParticipantDao->getWebinarParticipantByUniqueKey($targetKey);
				if($webinarParticipant){
					// メールタイトルを設定する
					$webinarParticipant["latest_mail_subject"] = $mailSubject;
					// 参加者の行動履歴を登録する
					$wpBehaviorHistoryDao = Application_CommonUtil::getInstance("dao", "WebinarParticipantBehaviorHistoryDao", $this->db);
					$wpBehaviorHistoryDao->setWebinarParticipantBehaviorHistory($webinarParticipant, self::BEHAVIOR_STATUS_OPENED_MAIL);
				}
			}else if($urlType == self::DETAIL_URL_TYPE_LEAD){
				// リードを取得する
				$webinarLeadDao = Application_CommonUtil::getInstance("dao", "WebinarLeadDao", $this->db);
				$webinarLead = $webinarLeadDao->getWebinarLeadByUniqueKey($targetKey);
				if($webinarLead){
					// メールタイトルを設定する
					$webinarLead["latest_mail_subject"] = $mailSubject;
					// ウェビナーキーを取得する
					$webinarKey = parent::getWebinarKey($urlParam);
					// ウェビナーを取得する
					$webinarDao = Application_CommonUtil::getInstance("dao", "WebinarDao", $this->db);
					$webinar = $webinarDao->getWebinarByAnnounceKey($webinarKey);
					// リードの行動履歴を登録する
					$webinarLeadBehaviorHistoryDao = Application_CommonUtil::getInstance("dao", "WebinarLeadBehaviorHistoryDao", $this->db);
					$webinarLeadBehaviorHistoryDao->setWebinarLeadBehaviorHistory($webinarLead, $webinar["id"], self::BEHAVIOR_STATUS_OPENED_MAIL);
				}
			}
			// コミットする（メールの送信結果に関わらず、DBはコミットする）
			$this->db->commit();
		}catch(Exception $e){
			$this->db->rollBack();
		}
	}
}
