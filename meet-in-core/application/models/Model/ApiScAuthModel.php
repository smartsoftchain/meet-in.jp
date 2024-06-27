<?php
require_once ROOT.'library/Application/validation.php';

class ApiScAuthModel extends AbstractModel{

	const PRODUCT_DOMAIN = "meet-in.jp";
	const DEVELOP_DOMAIN = "192.168.33.12";
	private $db; // DBコネクション
	private $rootUrl; //API基本パス
	private $header; //共通ヘッダー要素
	private $curlOptArray; //共通curl設定

	function __construct($db){
		parent::init();
		$this->db = $db;


		$refer = parse_url($_SERVER["HTTP_REFERER"]);
		switch($refer["host"]) {
			case self::PRODUCT_DOMAIN:
				$this->rootUrl = "https://sales-crowd/api/auth/meet-in";
			break;
			default:
				$this->rootUrl = "https://stage.sales-crowd.jp/api/auth/meet-in";
		};

		$this->curlOptArray = array(
			CURLOPT_RETURNTRANSFER => true,  // 結果を文字列で返す
			CURLOPT_SSL_VERIFYPEER => false, // 証明書をチェックしない
			CURLOPT_SSL_VERIFYHOST => false, // 証明書をチェックしない
		);
	}

	/**
	 * master_staff_newとSalesCrowdのアカウント連携のためのtoken発行
	 *
	 * @param string $id
	 * @param string $password
	 * @return array $response{status=>boolean, result=>array(str)}
	 */
	public function createToken($id, $password) {
		$sendData["id"] = $id;
		$sendData["password"] = $password;
		$ch = curl_init();
		// オプションを設定
		curl_setopt_array($ch, $this->curlOptArray);
		curl_setopt($ch, CURLOPT_POST, true);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $sendData);
		curl_setopt($ch, CURLOPT_URL, $this->rootUrl); // 取得するURLを指定
		// curl実行
		$response = json_decode(curl_exec($ch), true);
		curl_close($ch);

		return $response;

	}

	/**
	 * SalesCrowdアカウントと連携されていなければ、リダイレクト処理
	 *
	 * @return void
	 */
	public function checkAuthenticated() {
		$authResult = $this->isAuthenticated();
		if($authResult["status"] === false) {
			$msg = implode(",", $authResult["result"]);
			$referer = parse_url($_SERVER["HTTP_REFERER"]);
			$url = "https://{$referer["host"]}/error?msg=$msg";
			header("Location: $url");
			exit;
		}
	}

	/**
	 * SalesCrowdアカウント連携チェック
	 *
	 * @return array $result{status=>boolean, result=>array(str)}
	 */
	public function isAuthenticated() {
		$result = array(
			"status" => true,
			"result" => array()
		);
		$staffDao = Application_CommonUtil::getInstance("dao", "MasterStaffDao", $this->db);
		$clientDao = Application_CommonUtil::getInstance("dao", "MasterClientDao", $this->db);
		$user = $staffDao->fetchStaffRow($this->user["staff_type"], $this->user["staff_id"]);
		$client = $clientDao->getMasterClientRow($this->user["client_id"]);
		if(empty($user["salescrowd_staff_id"]) || empty($user["salescrowd_staff_type"]) || empty($user["salescrowd_token"])) {
			$result["status"] = false;
			$result["result"][] = "アカウントの連携が未完了です";
		}
		if(empty($client["salescrowd_client_id"])) {
			$result["status"] = false;
			$result["result"][] = "クライアント設定されていません";
		}

		return $result;
	}

}
