<?php
/**
 * 認証クラス
 *
 * @version $Id: Escape.php,v 1.3 2010/11/30 09:53:30 takeda Exp $
 * @package Manager
 */
class Adapter_AuthAdapter implements Zend_Auth_Adapter_Interface{

	private $id, $passwd;

	public function __construct($form) {
		$this->id = $form['id'];
		$this->password = $form['password'];
	}

	public function authenticate(){
		if(!empty($this->id) && !empty($this->password)){
			// DBコネクション取得
			$db = Zend_Db_Table_Abstract::getDefaultAdapter();
			// DAOのインスタンス作成
			$daoMasterStaff = Application_CommonUtil::getInstance("dao", "MasterStaffDao", $db);
			$daoMasterClient = Application_CommonUtil::getInstance("dao", "MasterClientDao", $db);
			$id_char = substr($this->id,0,2);
			$id_digital = (int)substr($this->id,2,strlen($this->id)-2);

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
				$client = $daoMasterClient->getMasterClientRow($user["client_id"]);
				$clientName = $client["client_name"];
				if(mb_strlen($client["client_name"], "UTF-8") > 11){
					$clientName = mb_substr($client["client_name"], 0, 10, 'UTF-8')."...";
				}
				$user["client_name"] = $client["client_name"];
				$user["header_clientname"] = $clientName;
				$user["analysis_flg"] = $client["publish_analysis_menu_flg"];
			}

			if($user != null && $password == md5($this->password)){
				$user["id"] = $this->id;
				$user["password"] = $this->password;
				$user["staff_type"] = $id_char;
				$user["name"] = $name;
				$user["staff_role"] = "{$user["staff_type"]}_{$user["staff_role"]}";
				return new Zend_Auth_Result(Zend_Auth_Result::SUCCESS, $user, array());
			}else{
				return new Zend_Auth_Result(Zend_Auth_Result::FAILURE, null, array("ログインできませんでした"));
			}
		}else{
			return new Zend_Auth_Result(Zend_Auth_Result::FAILURE, null, array("未入力な情報があります"));
		}
	}
}
