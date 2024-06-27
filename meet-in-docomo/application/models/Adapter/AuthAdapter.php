<?php
/**
 * 認証クラス
 *
 * @version $Id: Escape.php,v 1.3 2010/11/30 09:53:30 takeda Exp $
 * @package Manager
 */
class Adapter_AuthAdapter implements Zend_Auth_Adapter_Interface{

	private $id, $passwd;

	const ENC_SERVER_DOMAIN = "docomodx.aidma-hd.jp";

	public function __construct($form) {
		$this->id = $form['id'];
		$this->password = $form['password'];
		$this->auto_login_key = $form['auto_login_key'];
	}

	public function authenticate(){

		$config = new Zend_Config_Ini(APP_DIR . 'configs/system.ini', "production");

		if(!empty($this->id) && !empty($this->password) || !empty($this->auto_login_key)){
			// DBコネクション取得
			$db = Zend_Db_Table_Abstract::getDefaultAdapter();
			// DAOのインスタンス作成
			$daoMasterStaff = Application_CommonUtil::getInstance("dao", "MasterStaffDao", $db);
			$daoMasterClient = Application_CommonUtil::getInstance("dao", "MasterClientDao", $db);
			$staffLoginDao = Application_CommonUtil::getInstance("dao", "TsStaffLoginDao", $db);
			$id_char = substr($this->id,0,2);
			$id_digital = (int)substr($this->id,2,strlen($this->id)-2);

			// 自動ログインkey取得
			if(!empty($this->auto_login_key)) {
				$condition = " auto_login_key = '{$this->auto_login_key}' ";
				$staffLogin = $staffLoginDao->autoLoginFetch($condition);
			}

			if($id_char == 'AA'){
				// 認証
				$user = $daoMasterStaff->getLoginStaffRow($id_char, $id_digital);
				$name = $user['staff_name'];
				$password = $user['staff_password'];

			}else if($id_char == 'TA'){
				// 認証
				$user = $daoMasterStaff->getLoginStaffRow($id_char, $id_digital);
				$name = $user['staff_name'];
				$password = $user['staff_password'];
			}else if($id_char == 'CE'){
				// 認証
				$user = $daoMasterStaff->getLoginStaffRow($id_char, $id_digital);
				$name = $user['staff_name'];
				$password = $user['staff_password'];

				// クライアント名を設定する
				$client = $daoMasterClient->getMasterClientRow($user["client_id"], $config->client->staff->daysActiveDeemedAfterLogin, $config->client->contract->daysToBeAlertedContractExpiration);

				// del_flg=1のもので $clientがfalseになるものの場合は、ログインさせない
				if(isset($client) && $client == false) {
					//return new Zend_Auth_Result(Zend_Auth_Result::FAILURE, null, array("ログインできませんでした"));
					$auth = Zend_Auth::getInstance();
					$auth->clearIdentity();
					Zend_Session::destroy();
					header(sprintf('Location: %s/index/error?%s', "https://".$_SERVER["HTTP_HOST"], 'mess=ログインできませんでした'));
					exit;
				}

				// 契約期限の確認 (空値の場合は 無期限のクライアントと判断し無視する)
				if(isset($client) && $client['is_before_contract']){
					//return new Zend_Auth_Result(Zend_Auth_Result::FAILURE, null, array("ご契約の期限が開始前の為ログインできません"));
					$auth = Zend_Auth::getInstance();
					$auth->clearIdentity();
					Zend_Session::destroy();
					header(sprintf('Location: %s/index/error?%s', "https://".$_SERVER["HTTP_HOST"], 'mess=ご契約の期限が開始前の為ログインできません'));
					exit;
				}
				// 契約期限の確認 (空値の場合は 無期限のクライアントと判断し無視する)
				if(isset($client) && $client['is_expiration']){
					//return new Zend_Auth_Result(Zend_Auth_Result::FAILURE, null, array("ご契約の期限が終了した為ログインできません"));
					$auth = Zend_Auth::getInstance();
					$auth->clearIdentity();
					Zend_Session::destroy();
					header(sprintf('Location: %s/index/error?%s', "https://".$_SERVER["HTTP_HOST"], 'mess=ご契約の期限が終了した為ログインできません'));
					exit;
				}

				$clientName = $client["client_name"];
				if(mb_strlen($client["client_name"], "UTF-8") > 11){
					$clientName = mb_substr($client["client_name"], 0, 10, 'UTF-8')."...";
				}
				$user["client_name"] = $client["client_name"];
				$user["header_clientname"] = $clientName;
				$user["analysis_flg"] = $client["publish_analysis_menu_flg"];
				$user["plan_this_month"] = $client["plan_this_month"];
				$user["negotiation_room_type"] = $client["negotiation_room_type"];

				$user["client_type"] = $client['client_type'];
				$user["distribution_channel_client_id"] = $client['distribution_channel_client_id'];
				$user["contract_period_start_date"] = $client['contract_period_start_date'];
				$user["contract_period_end_date"] = $client['contract_period_end_date'];
				$user["is_near_expiration"] = $client['is_near_expiration'];
				$user["is_expiration"] = $client['is_expiration'];
				$user["is_before_contract"] = $client['is_before_contract'];

				$user["active_staff_count"] = $client['active_staff_count'];
				$user["two_factor_authenticate_flg"] = $client['two_factor_authenticate_flg'];

				// MEMO. 電子契約機能のうち、特定の企業のみ ec2にec1と全く同じ権限を持つ契約になっている その判定式.
				$user["is_e_contract_api_exception_auth_ce1_on_ce2"] =
					in_array($user["client_id"],  explode(',', $config->eContractApi->exception->AuthCE1onCE2)) &&
					in_array($user["staff_role"], ["2"])
				? true : false;


			}
			else if ($this->id == $config->systemUser->id && $this->password == $config->systemUser->password) {
				error_log("[AuthAdapter.authenticate] 4");
				$user["staff_firstname"] = 'システム管理者';
				$user["staff_lastname"] = '';
				$id_char = 'system_admin';
				$name = 'システム管理者';
				$password = md5($this->password);
			}

			// MEMO. 現在 「録画アラート」は AAアカウント向け機能として実装された AA以外は例外なく使わせない.
			if($id_char !== 'AA'){
				$user['remind_record_flg'] = "0"; // AA以外はフラグを折る.
			}

			// 自動ログインkeyの確認
			$staffAutoLoginFlg = false;
			if ($staffLogin['auto_login_key'] != null && $this->auto_login_key != null && ($staffLogin['auto_login_key'] == $this->auto_login_key)) {
				$staffAutoLoginFlg = true;
			}

			if(($user != null && $password == md5($this->password)) || $staffAutoLoginFlg){

				$user["id"] = $this->id;
				$user["password"] = md5($this->password);
				$user["staff_type"] = $id_char;
				$user["name"] = $name;
				$user["staff_role"] = "{$user["staff_type"]}_{$user["staff_role"]}";

				// system.iniの読み込み(デフォルトは開発環境)
				$config = new Zend_Config_Ini(APP_DIR . 'configs/system.ini', "development");
				if($_SERVER["SERVER_NAME"] == self::ENC_SERVER_DOMAIN){
					// 本番環境
					$config = new Zend_Config_Ini(APP_DIR . 'configs/system.ini', "production");
				}
				// トライアルユーザー判定(デフォルトは非トライアル)
				$user["trialUserFlg"] = 0;
				if($user["client_id"] == $config->trial->clientId){
					$user["trialUserFlg"] = 1;
				}

				// 最終ログイン日時を更新する.
				$daoMasterStaff->updateLoginDate($user['staff_type'], $user['staff_id']);

				return new Zend_Auth_Result(Zend_Auth_Result::SUCCESS, $user, array());
			}else{
				return new Zend_Auth_Result(Zend_Auth_Result::FAILURE, null, array("ログインできませんでした"));
			}
		}else{
			return new Zend_Auth_Result(Zend_Auth_Result::FAILURE, null, array("未入力な情報があります"));
		}
	}
}
