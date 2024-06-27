<?php
require_once ROOT.'library/Application/validation.php';

class ApiScMtaModel extends AbstractModel{

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
				$this->rootUrl = "https://sales-crowd.jp/api/mta-setting";
			break;
			default:
				$this->rootUrl = "https://stage.sales-crowd.jp/api/mta-setting";
		};

		$staffDao = Application_CommonUtil::getInstance("dao", "MasterStaffDao", $this->db);
		$clientDao = Application_CommonUtil::getInstance("dao", "MasterClientDao", $this->db);
		$user = $staffDao->fetchStaffRow($this->user["staff_type"], $this->user["staff_id"]);
		$client = $clientDao->getMasterClientRow($this->user["client_id"]);
		$this->header = array(
			"sc-client-id: {$client["salescrowd_client_id"]}",
			"mi-client-id: {$this->user["client_id"]}",
			"sc-staff-type: {$user["salescrowd_staff_type"]}",
			"sc-staff-id: {$user["salescrowd_staff_id"]}",
			"token: {$user["salescrowd_token"]}"
		);

		$this->curlOptArray = array(
			CURLOPT_RETURNTRANSFER => true,  // 結果を文字列で返す
			CURLOPT_SSL_VERIFYPEER => false, // 証明書をチェックしない
			CURLOPT_SSL_VERIFYHOST => false, // 証明書をチェックしない
			CURLOPT_HTTPHEADER     => $this->header // ヘッダー情報
		);
	}

	/**
	 * MTA設定を返す
	 *
	 * @return array $response{status=>boolean, result=>array(array)}
	 */
	public function fetchAll() {
		$ch = curl_init();
		// オプションを設定
		curl_setopt_array($ch, $this->curlOptArray);
		curl_setopt($ch, CURLOPT_URL, $this->rootUrl); // 取得するURLを指定
		// curl実行
		$response = json_decode(curl_exec($ch), true);
		curl_close($ch);
		return $response;
	}

	/**
	 * MTA設定を実行
	 *
	 * @param array $settings[{sender_address,note,sender_smtp_server, sender_smtp_port, ehlo_user, ehlo_password, dsn_server, dsn_port, dsn_user, dsn_password}]
	 * @return array $response{status=>boolean, result=>array(str)}
	 */
	public function create($settings) {
		$mtaSettings = array();
		$sendData = array();
		// データ整形
		foreach($settings as $setting) {
				$mtaSettings[] = array(
				"sender_address" => $setting["sender_address"],
				"note" => $setting["note"],
				"sender_smtp_server" => $setting["sender_smtp_server"],
				"sender_smtp_port" =>  $setting["sender_smtp_port"],
				"ehlo_user" =>  $setting["ehlo_user"],
				"ehlo_password" =>  $setting["ehlo_password"],
				"dsn_server" =>  $setting["dsn_server"],
				"dsn_port" =>  $setting["dsn_port"],
				"dsn_user" =>  $setting["dsn_user"],
				"dsn_password" =>  $setting["dsn_password"],
				"note" =>  $setting["note"]
			);
		}
		$sendData["mta_settings"] = json_encode($mtaSettings);
		$ch = curl_init();
		// オプションを設定
		curl_setopt_array($ch, $this->curlOptArray);
		curl_setopt($ch, CURLOPT_POST, true);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $sendData);
		curl_setopt($ch, CURLOPT_URL, $this->rootUrl."/register"); // 取得するURLを指定
		// curl実行
		$response = json_decode(curl_exec($ch), true);
		curl_close($ch);

		return $response;
	}
}