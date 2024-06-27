<?php
require_once APP_DIR.'/models/Adapter/AuthAdapter.php';

class IndexController extends AbstractController
{
	const DEFAULT_BOOKMARK_LIST_COUNT = 10;			// デフォルトのブックマークリスト表示件数
	const MP3_AA_STAFF_KEY = 			1;			// 音声ファイルに設定するAAのキー
	const MP3_TA_STAFF_KEY = 			2;			// 音声ファイルに設定するTAのキー
	const MP3_CE_STAFF_KEY = 			0;			// 音声ファイルに設定するCEのキー
	const AUTH_AA = 					"AA";		// アイドマアカウント 
	
	public function init(){
		parent::init();
		/* Initialize action controller here */
	}

	/**
	 * ゲストログイン画面画面表示
	 */
	public function indexAction(){
		$form = $this->_getAllParams();
		// 操作ログ
		$this->setLog("ログイン画面表示", json_encode($form));
	
		$auth = Zend_Auth::getInstance();
	
		if($auth->hasIdentity() == true && 1 != $form['auto_dial']){
			$user = $auth->getIdentity();

			$this->_redirect('/index/menu');
		} else {
			$this->view->auto_dial = $form['auto_dial'];
			$this->view->connect_no = $form['connect_no'];
			$this->view->user_info = $form['user_info'];
			$this->view->page_from = $form['page_from'];
		}
	}

	/**
	 * ログイン処理(商談画面以外)
	 */
	public function loginAction(){
		$form = $this->_getAllParams();

		if(array_key_exists("id", $form) && array_key_exists("password", $form)){
			// 入力チェック
			$filters = array(
					'id' => 'StringTrim',
					'password' => 'StringTrim',
			);
			$validators = array(
					'id' => array(
							'Alnum',
							array('StringLength', 1, 13),
							'messages' => array(
								0 => '英数字で入力してください',
								1 => '13文字以内で入力してください',
							)
					),
					'password' => array(
							array('NotEmpty'),
							'messages' => array(
									'パスワードを入力してください',
							)
					),
			);
		
			$result = new Zend_Filter_Input($filters, $validators, $form);
		
			if(false == $result->isValid()){
				$this->view->errors = $result->getMessages();
			}else{
				// 操作ログ
				$this->setLog("ログイン", json_encode($form));

				$auth = Zend_Auth::getInstance();
				$adapter = new Adapter_AuthAdapter($form);
				$result = $auth->authenticate($adapter);
				if($result->isValid() == false){
					$this->view->errors = $result->getMessages();
				}else{
					// ログイン出来た場合は権限により遷移先を変更する
					$idChar = substr($form["id"], 0, 2);
					if($idChar == self::AUTH_AA){
						$this->_redirect('/client/list');
					}else{
						$this->_redirect('/index/menu');
					}
				}
			}
		}
	}

	/**
	 * ログイン処理(商談画面用)
	 */
	public function doLoginAction(){
		$form = $this->_getAllParams();
		$data = array();

		// 入力チェック
		$filters = array(
				'id' => 'StringTrim',
				'password' => 'StringTrim',
		);

		$validators = array(
				'id' => array(
						'Alnum',
						array('StringLength', 1, 13),
						'messages' => array(
							0 => '英数字で入力してください',
							1 => '13文字以内で入力してください',
						)
				),
				'password' => array(
						array('NotEmpty'),
						'messages' => array(
								'パスワードを入力してください',
						)
				),
				'id' => array(
						array('NotEmpty'),
						'messages' => array(
								'ユーザーIDを入力してください',
						)
				),
		);

		$resultInput = new Zend_Filter_Input($filters, $validators, $form);
		$data["result"] = 0;

		//////////////////////////////////////////////////////
		// 認証処理
		//
		if(false == $resultInput->isValid()){
			//認証失敗
			$data["result"] = 0;
			$data["error"] = $resultInput->getMessages();
		}else{
			// 操作ログ
			$this->setLog("ログイン", json_encode($form));

			$auth = Zend_Auth::getInstance();
			$adapter = new Adapter_AuthAdapter($form);
			$resultInput = $auth->authenticate($adapter);
			if($resultInput->isValid() == false){
				$data["result"] = 0;
				$data["error"] = $resultInput->getMessages();
			}else{
				//認証成功
				$this->user["login_flg"] = 1;
				$this->user["id"] = $form["id"];
				$this->user["password"] = $form["password"];

				$data["result"] = 1;
				// ログイン出来た場合は権限により遷移先を変更する
				$idChar = substr($form["id"], 0, 2);
				$data["idChar"] = $idChar;
				$ident = $auth->getIdentity();
//				$data["ident"] = $ident;
				$data["desktop_notify_flg"] = $ident["desktop_notify_flg"];
				$data["staff_name"] = $ident["staff_name"];
				$data["client_name"] = $ident["client_name"];

				// クッキー(Cookie)へユーザ情報を設定する用
				$data["staff_type"] = $ident["staff_type"];
				$data["staff_id"] = $ident["staff_id"];
				$data["client_id"] = $ident["client_id"];

				$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);
				$connectionInfo = $apiModel->updateConnectionInfoLogin($form["connection_info_id"], $form["user_id"], "1");
				if (empty($connectionInfo)) {
					$data["result"] = 0;
					$data["error"] = "ログイン情報を更新できませんでした";
				} else {
					$data["result"] = 1;
					$data["connection_info"] = $connectionInfo;
				}
			}
		}

		// 処理結果を返す
		$result = json_encode($data);
		header("Access-Control-Allow-Origin: *");
		echo($result);
		exit;
	}

	/**
	 * TOPメニュー表示
	 */
	public function menuAction(){
		$this->_loginCheck();
		$form = $this->_getAllParams();

		$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);
		$params = $apiModel->getWebRtcParam();

		$this->view->client_id = $this->user["client_id"];
		$this->view->staff_type = $this->user["staff_type"];
		$this->view->staff_id = $this->user["staff_id"];

		// ログインOKの場合はクッキー(Cookie)へユーザ情報を設定する
		// staff_type/staff_id/client_id
		setcookie('client_id' , $this->user["client_id"] , 0, '/');
		setcookie('staff_type', $this->user["staff_type"], 0, '/');
		setcookie('staff_id'  , $this->user["staff_id"]  , 0, '/');

		// 削除実行
		// ログイン時はセッションを削除しないため、ルームへの入室判定に使用しているユーザID (user_id) を削除する
		$apiModel->saveWebRtcParam(array(
			'user_id' => null,
			'room_name' => null,
			'collabo_site' => null
		));

		// 操作ログ
		$this->setLog("TOPメニュー表示", json_encode($form));
	}

	/**
	 * ログアウト
	 */
	public function logoutAction(){
		// 操作ログ
		$this->setLog("ログアウト", json_encode($this->_getAllParams()));

		// ログアウトの場合はクッキー(Cookie)のユーザ情報を削除する
		// staff_type/staff_id/client_id
		setcookie('client_id' , '' , 0, '/');
		setcookie('staff_type', '' , 0, '/');
		setcookie('staff_id'  , '' , 0, '/');

		// セッションクリア
		$auth = Zend_Auth::getInstance();
		$auth->clearIdentity();
		Zend_Session::destroy();

// SC用は終了後にTOP画面へ遷移しないため
// 2018/04/20 太田
//		$this->_redirect('/index/index');
	}
	
	/**
	 * ログアウト(ゲスト終了用)
	 * (cookie & セッションクリアクリア)
	 */
	public function newLogoutAction(){
		// 操作ログ
		$this->setLog("ログアウト", json_encode($this->_getAllParams()));
//error_log("newLogoutAction room_in=[".$_SESSION['room_in']."]\n", 3, "/var/tmp/negotiation.log");

		// ログアウトの場合はクッキー(Cookie)のユーザ情報を削除する
		// staff_type/staff_id/client_id
		setcookie('client_id' , '' , 0, '/');
		setcookie('staff_type', '' , 0, '/');
		setcookie('staff_id'  , '' , 0, '/');

		// セッションクリア
		$auth = Zend_Auth::getInstance();
		$auth->clearIdentity();
		Zend_Session::destroy();
	}

	/**
	 * 電話を掛けるのモーダル表示
	 */
	public function telephoneAction(){
		// 操作ログ
		$this->setLog("電話を掛ける表示", json_encode($this->_getAllParams()));
		$form = $this->_getAllParams();
		// ダイアラーからmeetin発信ボタンを削除
		$this->view->meetin_btn = false;
		// 商談画面からのダイアラー起動の場合、meetin発信ボタンを非表示
//		if(isset($form["from"]) && $form["from"] == "negotiation") {
//			$this->view->meetin_btn = false;
//		} else {
//			$this->view->meetin_btn = true;
//		}
		// 電話を掛けるために必要なキーを生成
		$staffKey = "";
		if($this->user["staff_type"] == "AA"){
			$staffKey = self::MP3_AA_STAFF_KEY.sprintf("%05d", $this->user["staff_id"]);
		}elseif($this->user["staff_type"] == "TA"){
			$staffKey = self::MP3_TA_STAFF_KEY.sprintf("%05d", $this->user["staff_id"]);
		}elseif($this->user["staff_type"] == "CE"){
			$staffKey = self::MP3_CE_STAFF_KEY.sprintf("%05d", $this->user["staff_id"]);
		}
		$this->view->staffKey = $staffKey;
		
		$config = new Zend_Config_Ini(APP_DIR . 'configs/system.ini', "production");
		$asterisk_info = explode("|", $config->asterisk->info);
		$asterisk = array();
		for ($i = 0; $i < count($asterisk_info); $i++) {
			$info = explode("/", $asterisk_info[$i]);
			$asterisk[$info[0]] = $info[1];
		}
		$this->view->domain = $asterisk[$this->user["webphone_ip"]];
	}
	/**
	 * お問い合わせのメール送信
	 */
	public function inquiryAction(){
		$form = $this->_getAllParams();
	
		// 操作ログ
		$this->setLog($user, "TMOへのお問い合わせ", json_encode($form));
	
		$prohibitedCharacters = preg_split("//u", '①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ㍉㌔㌢㍍㌘㌧㌃㌶㍑㍗㌍㌦㌣㌫㍊㌻㎜㎝㎞㎎㎏㏄㎡㍻〝〟№㏍℡㊤㊥㊦㊧㊨㈱㈲㈹㍾㍽㍼∮∑∟⊿纊褜鍈銈蓜俉炻昱棈鋹曻彅丨仡仼伀伃伹佖侒侊侚侔俍偀倢俿倞偆偰偂傔僴僘兊兤冝冾凬刕劜劦勀勛匀匇匤卲厓厲叝﨎咜咊咩哿喆坙坥垬埈埇﨏塚增墲夋奓奛奝奣妤妺孖寀甯寘寬尞岦岺峵崧嵓﨑嵂嵭嶸嶹巐弡弴彧德忞恝悅悊惞惕愠惲愑愷愰憘戓抦揵摠撝擎敎昀昕昻昉昮昞昤晥晗晙晴晳暙暠暲暿曺朎朗杦枻桒柀栁桄棏﨓楨﨔榘槢樰橫橆橳橾櫢櫤毖氿汜沆汯泚洄涇浯涖涬淏淸淲淼渹湜渧渼溿澈澵濵瀅瀇瀨炅炫焏焄煜煆煇凞燁燾犱犾猤猪獷玽珉珖珣珒琇珵琦琪琩琮瑢璉璟甁畯皂皜皞皛皦益睆劯砡硎硤硺礰礼神祥禔福禛竑竧靖竫箞精絈絜綷綠緖繒罇羡羽茁荢荿菇菶葈蒴蕓蕙蕫﨟薰蘒﨡蠇裵訒訷詹誧誾諟諸諶譓譿賰賴贒赶﨣軏﨤逸遧郞都鄕鄧釚釗釞釭釮釤釥鈆鈐鈊鈺鉀鈼鉎鉙鉑鈹鉧銧鉷鉸鋧鋗鋙鋐﨧鋕鋠鋓錥錡鋻﨨錞鋿錝錂鍰鍗鎤鏆鏞鏸鐱鑅鑈閒隆﨩隝隯霳霻靃靍靏靑靕顗顥飯飼餧館馞驎髙髜魵魲鮏鮱鮻鰀鵰鵫鶴鸙黑ⅰⅱⅲⅳⅴⅵⅶⅷⅸⅹ¦＇＂',  -1, PREG_SPLIT_NO_EMPTY);
		$resultMsg = "";
		if($form["inquiry_text"] != ""){
			if(mb_strlen($form["inquiry_text"], "UTF-8") > 200){
				$resultMsg .= "TMOへのご意見・ご要望が文字数オーバー（200）です。\n";
			}
			$strList = preg_split("//u", $form["inquiry_text"], -1, PREG_SPLIT_NO_EMPTY);
			if(count(array_intersect($prohibitedCharacters, $strList)) > 0){
				$resultMsg .= "TMOへのご意見・ご要望に表示できない文字が含まれます。\n";
			}
		}else{
			$resultMsg .= "TMOへのご意見・ご要望が空欄です。\n";
		}
	
		if($resultMsg == ""){
			$manager = $this->_getInstance('manager','Client');
			$client = $manager->getClient("client_id", $user["client_id"]);
			$this->view->client_id = $user["client_id"];
			$this->view->client_name = $client["client_name"];
			$this->view->client_staffname = $user["firstname"].$user["lastname"];
			$this->view->now = date('Y-m-d H:i:s');
			$this->view->text = $form["inquiry_text"];
			$body = $this->view->render('mailtemplates/mail_inquiry.tpl');
	
			$config = new Zend_Config_Ini(APP_DIR . 'configs/application.ini', SERVICE_MODE);
			$mailQueManager = $this->_getInstance('manager','MailQue');
			$mailQue = array();
	
			$mailQue['from'] = array($config->mail->support_mail, "【TMOサポート窓口】");
			$mailQue['to'] = $config->mail->support_mail;
			$mailQue['cc'] = "";
			$mailQue['subject'] = '【TMOサポート窓口】TMOご意見・ご要望';
			$mailQue['body'] = $body;
			$mailQueManager->sendMail($mailQue);
	
			echo "送信完了しました";
		}else{
			echo $resultMsg;
		}
		exit;
	}
	/**
	 * パスワードリマインダー処理
	 */
	public function reminderAction() {
		$this->setLog("リマインダー画面表示", json_encode($this->_getAllParams()));
		$form = $this->_getAllParams();
		$request = $this->getRequest();
		if($request->isPost()) {
			// モデル宣言
			$adminModel = Application_CommonUtil::getInstance('model', "AdminModel", $this->db);
			$result = $adminModel->sendMailReminderAccount($form, $request);
			if(empty($result["errorList"])) {
				return $this->_redirect('/index/login');
			}
			$this->view->errors = $result["errorList"];
		} else {
		}
	}
	/**
	 * パスワード再設定
	 */
	public function activateAction() {
		$this->setLog("アクティベーション画面表示", json_encode($this->_getAllParams()));
		$form = $this->_getAllParams();
		$request = $this->getRequest();
		if($request->isPost()) {
			// パスワード変更
			// モデル宣言
			$adminModel = Application_CommonUtil::getInstance('model', "AdminModel", $this->db);
			$result = $adminModel->activateStaff($form, $request);
			$this->view->errorList = $result["errorList"];
			$this->view->staffDict = $result["staffDict"];
		} else {
			// アクティベーション画面表示の条件
			if(!isset($form["id"]) || empty($form["id"]) || !preg_match('/[0-9a-zA-Z]{32}/', $form["id"])) {
				$this->_redirect('/index/login');
			}
			// モデル宣言
			$adminModel = Application_CommonUtil::getInstance('model', "AdminModel", $this->db);
			$result = $adminModel->getActivationStaff($form, $request);
			if(empty($result["staffDict"])) {
				$this->_redirect('/index/login');
			}
			$this->view->staffDict = $result["staffDict"];
		}
	}
}

