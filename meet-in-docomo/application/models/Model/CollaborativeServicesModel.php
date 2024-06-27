<?php

/**
 * 連携システムを使用するモデル
 * @author admin
 *
 */
class CollaborativeServicesModel extends AbstractModel{

	private $db;							// DBコネクション

	function __construct($db){
		$this->db = $db;
		$this->config = Zend_Registry::get('config');
		parent::init();
	}


	// MEMO. ドコモに依頼し払い出して貰うことで入手.
	private function getClientID() {
		$clientId = $this->config->docomo->businessDAccount->clientId;
		return $clientId;
	}
	private function getClientSecret() {
		$clientSecret = $this->config->docomo->businessDAccount->clientSecret;
		return $clientSecret;
	}


	// MEMO.　ドコモにRedirectURI として 事前申請に申請しないといけない(複数可).
	public function getRedirectUriLogin() {
		$redirectUriLogin = $this->config->docomo->businessDAccount->redirectUriLogin;
		return $redirectUriLogin;
	}
	public function getRedirectUriStaffInvitation() {
		$redirectUriStaffInvitation = $this->config->docomo->businessDAccount->redirectUriStaffInvitation;
		return $redirectUriStaffInvitation;
	}

	// MEMO. docomoから入手するスコープ.
	private function getScope() {
		// openid＋(任意のスコープID)スペースで連結して指定.
		return 'openid accountid_n corp_profile_n corp_member_n corp_phone_number_n email_n phone_number_b_n account_info_n dprofile_email_n';
	}



	/*
	 * dアカウントログインページを開く.
	 */
	public function login() {
		$result = $this->AuthenticationRequest($this->getRedirectUriLogin());
		header("Location: {$result}");
		exit();
	}
	/*
	 * dアカウントログインページに ユーザが成功した場合の処理.
	 */
	public function loginCallback() {
		return $this->_loginCallback($this->getRedirectUriLogin());
	}


	/*
	 * 招待メールからのログイン.
	 */
	public function invitationStaffLogin() {
		$result = $this->AuthenticationRequest($this->getRedirectUriStaffInvitation());
		header("Location: {$result}");
		exit();
	}
	/*
	 * dアカウントログインページに ユーザが成功した場合の処理.
	 */
	public function invitationStaffLoginCallback() {
		return $this->_loginCallback($this->getRedirectUriStaffInvitation());
	}


	/*
	 * dアカウントログインページに ユーザが成功した場合の処理.
	 */
	private function _loginCallback($redirect_uri)
	{
		$callback = $this->AuthenticationResponse();
		if(isset($callback['error'])){
			//header("Content-type: text/html; charset=utf-8");
			//echo $callback['error']; exit();
			return;
		}

		// 認証コードをトークンに引き換えにいく.
		$access_tokens = $this->TokenRequest('authorization_code', ['code' => $callback['code'], 'redirect_uri' => $redirect_uri]);

		// ブラウザーに access_tokenを持たせた場合(access_tokenが一定期間で失効するのでセキュリティレベルが高いが１デバイスのみ).
		$this->setAccessTokens($access_tokens);
		$sns_user_data = $this->getSnsUserData($access_tokens);
		return $sns_user_data;
	}

	/*
	 * ユーザ情報を取得.
	 * エンドユーザのログイン後　代理人としてデータを取得出来るようになる.
	 */
	private function getSnsUserData($access_tokens) {
		$userInfo = $this->UserInfoRequest($access_tokens['access_token']);

		// MEMO. 使いやすいように フォーマットを整える.
		if(array_key_exists("corp_profile_name_kana", $userInfo)){
			$userInfo['corp_profile_name_kana'] = mb_convert_kana($userInfo['corp_profile_name_kana'], "KVa"); // 半角カタカナで届く全角カナに使いたい.
		}
		return $userInfo;
	}


	public function refreshSnsUser($refresh_token)
	{
		// アクセストークンの有効期限が切れた場合、クライアントアプリは保存しておいたリフレッシュトークンを用いてTokenエンドポイントへリクエストを送信します.
		// Tokenエンドポイントはクライアントアプリを認証し、新しいアクセストークン（access_token）を返却します.
		$token = $this->TokenRequest('refresh_token', null, $refresh_token);
		return $token;
	}



	// MEMO.
	// ドコモ提供資料 P304_マニュアル_ビジネスdアカウント・コネクト マニュアル_本紙_v1.2.docx の通りに作成
	// 資料のバージョンが変われば 改修が必要になることもあるので資料名を残す.

	/*
	 * API番号	  API-1-1.
	 * API名	  Authentication Request （認証要求） .
	 * 概要		  お客様の認証、およびスコープで指定した情報に対する認可の要求を行います。
	 */
	private function urlAuthentication() {
		return	'https://id.smt.docomo.ne.jp/cgi8/oidc/authorize';
	}

	/*
	 * API番号	  API-2-1.
	 * API名	  Token Request （トークン払出要求）.
	 * 概要		  認可コードに対応するトークンの払い出しを要求します。
	 */
	private function urlToken() {
		return 'https://conf.uw.docomo.ne.jp/token';
	 }

	/*
	 * API番号	  API-3-1.
	 * API名	  UserInfo Request （利用者情報取得要求）.
	 * 概要		  アクセストークンに紐付く利用者が認可したスコープの情報を要求します。
	 */
	private function urlUserInfo() {
		return 'https://conf.uw.docomo.ne.jp/userinfo';
	}




	private function AuthenticationRequest($redirect_uri)
	{
		$url = $this->urlAuthentication();

		// 要求パラメータ.
		$state = $this->makeState();
		$nonce = $this->makeNonce();

		$data = array (
			'response_type' => 'code',
			'scope'			=> $this->getScope(),
			'client_id'		=> $this->getClientID(),
			'state'			=> $state,
			'redirect_uri'	=> $redirect_uri,
			'nonce'			=> $nonce,
			'authif'		=> 1,
		);
		// スペース(%20)で連結して指定 とあったので、PHP_QUERY_RFC3986で生成.
		$content = http_build_query($data, null, '&', PHP_QUERY_RFC3986);

		// 一時データ保存. 前回キャンセルしているかもしれないので　初期化も兼ねて絶対に実行.
		$this->setState($state);
		$this->setNonce($nonce);

		return sprintf("%s?%s", $url, $content);
	}


	/*
	 * API-1-2 Authentication Response （認証応答）.
	 */
	private function AuthenticationResponse()
	{

		// エラーが発生した場合.
		if (isset($_REQUEST['error']))
		{
			$mess = null;
			switch ($_REQUEST['error']) {
				case 'invalid_request' :
					$mess = 'リクエストに必須パラメータが含まれていない／サポート外のパラメータが付与されている／同一のパラメータが複数含まれる場合、その他不正な形式です。';
					break;
				case 'access_denied':
					$mess = 'お客様が同意しませんでした。';
					break;
				case 'invalid_auth':
					$mess = '認証情報の不一致を検知しました。';
					break;
				case 'timestamp_refused':
					$mess = '認証セッションの有効期限切れを検知しました。';
					break;
				case 'unsupported_response_type':
					$mess = 'IdPは現在の方法による認可コード取得をサポートしていません。';
					break;
				case 'invalid_scope':
					$mess = 'リクエストスコープが不正／未知／もしくはその他の不当な形式です。';
					break;
				case 'server_error':
					$mess = 'IdPがリクエストの処理ができないような予期しない状況に遭遇しました。';
					break;
				case 'login_required':
					$mess = 'リクエストのパラメータに「prompt=none」を指定しているが、お客様に対して認証画面の表示が必要であるとIdPが判定しました。';
					break;
				case 'consent_required':
					$mess = 'リクエストのパラメータに「prompt=none」を指定しているが、お客様に対して認可画面の表示が必要であるとIdPが判定しました。';
					break;
				case 'request_not_supported':
					$mess = 'request パラメータをサポートしていません。';
					break;
				case 'request_uri_not_supported':
					$mess = 'request_uri パラメータをサポートしていません。';
					break;
				case 'registration_not_supported':
					$mess = 'registration パラメータをサポートしていません。';
					break;
				default :
					$mess = $_REQUEST ['error']; // 翻訳が無い そのまま出力.
			}
			return array('error' => mb_convert_encoding($mess, "utf8", "auto"));
		}

		if($_REQUEST ['state'] != $this->getState()) {
			$mess = 'リクエストに必須パラメーターが含まれていない／サポート外のパラメーターが付与されている／同一のパラメーターが複数含まれる場合、その他不正な形式です。';
			return array('error' => mb_convert_encoding($mess, "utf8", "auto"));
		}

		return array (
			'code' => $_REQUEST['code'], // 認可コード　ワントークンで使わなくても有効期限は数秒.
			'state' => $_REQUEST['state']
		);
	}

	/*
	 * API-2-1 Token Request （トークン払出要求）
	 */
	private function TokenRequest($grant_type, $param = ["code" => null, "redirect_uri" => null, "refresh_token" => NULL])
	{

		$url = $this->urlToken();

		$grant_type_authorization = 'authorization_code';
		$grant_type_refresh_token = 'refresh_token';

		// バリデーション.
		if(!in_array($grant_type, array($grant_type_authorization, $grant_type_refresh_token))) {
			// dアカウントAPIが　grant_type値は"authorization_code" または "refresh_token"と指定しているので中止する.
			return null;
		}
		if($grant_type == $grant_type_authorization && $param["code"] == null) {
			// dアカウントAPIが　アクセストークンの払出し の場合 code値は必須パラメータと決定しているので中止する.
			return null;
		} else if($grant_type == $grant_type_refresh_token && $param["refresh_token"] == null) {
			// dアカウントAPIが　アクセストークンの払出し の場合 code値は必須パラメータと決定しているので中止する.
			return null;
		}
		// パラメータ Requestと、Refreshでパラメータが異なる.
		$data = array (
			'grant_type' => $grant_type,
		);

		if($grant_type == $grant_type_authorization)
		{
			$data['code']		   = $param["code"];
			$data['redirect_uri']  = $param["redirect_uri"];
		}
		else if($grant_type == $grant_type_refresh_token)
		{
			$data['refresh_token'] = $param["refresh_token"];
			$data['scope']		   = $this->getScope(); // アカウント払い出しの際のエクセルシートで指定されたスコープ.
		}
		$content = http_build_query($data, null, '&', PHP_QUERY_RFC3986);
		// 指定されたヘッダーにする.
		// Basic クレデンシャル クライアント申請時に登録したクライアントIDとクライアントシークレットを":" でつなぎ、Base64 エンコードした値.
		$credential = base64_encode(sprintf('%s:%s',  $this->getClientID(), $this->getClientSecret()));
		$headers = array (
			'Content-Type: application/x-www-form-urlencoded;charset=UTF-8',
			'Content-Length: ' . strlen($content),
			'Authorization: Basic ' . $credential
		);

		// CURLを生成する
		$curl = curl_init();
		$option = [
			CURLOPT_URL			   => $url,
			CURLOPT_HTTP_VERSION   => CURL_HTTP_VERSION_1_1,
			CURLOPT_HTTPHEADER	   => $headers,
			CURLOPT_SSL_VERIFYPEER => true,
			CURLOPT_POSTFIELDS	   => $content,
			CURLINFO_HEADER_OUT    => true,
			CURLOPT_RETURNTRANSFER => true
		];
		curl_setopt_array($curl, $option);

		// CURLを実行する
		$response = curl_exec($curl);

		$response_code = curl_getinfo($curl, CURLINFO_HTTP_CODE); // レスポンスコード取得.

		$header = curl_getinfo($curl, CURLINFO_HEADER_OUT);
		curl_close($curl);
		if ($response == FALSE) {
			return null; // 通信失敗
		}

		// レスポンスを受け取る.
		return $this->TokenResponse($response);
	}
	/*
	 * API-2-2 Token Response （トークン払出応答）
	 */
	private function TokenResponse($response) {
		// JSONなのでコンバート.
		$token = json_decode($response, true);
		if (isset ( $token ['error'] )) {
			$mess = null;
			switch ($_REQUEST ['error']) {
				case 'invalid_request':
					$mess = 'リクエスト形式またはパラメータが解析 不可能な状態を示します。' . 'リクエストに必要なパラメーターが含まれていません。' . '(認証方式(grant type))以外のパラメータについて、サポートされないパラメーター値が含まれています。' . 'パラメーターが重複しています。' . 'その他、異常値が設定されています';
					break;
				case 'invalid_client':
					$mess = 'クライアント認証に失敗した状態を示します。' . '・許可されている IP アドレス以外のアドレスからアクセスされています。' . '・未知のクライアントです。 ' . '・クライアント認証情報が含まれていません。' . '・サポートされない認証方式が利用されています。' . '・HTTP Basic 認証(RFC2617)に失敗しました。' . '・その他、上記以外の要因により認証に失敗しました。';
					break;
				case 'invalid_grant':
					$mess = 'クライアントが正当な認可を受けていないことを示します。' . '・提供された認可を得ていることを示す値(認可コード、エンドユーザを示す値)が不正／有効期限切れ／失効しています。' . '・エンドユーザの契約が認可時から更新されています。' . '・リフレッシュトークンが不正／有効期限切れ／失効しています。' . '・認可リクエストで用いられたリダイレクトURIとマッチしていません。' . '・他のクライアントに対して発行されたものです。';
					break;
				case 'unsupported_grant_type':
					$mess = 'クライアントが指定した認証方式（granttype）がサポートされていないことを示します。';
					break;
				case 'invalid_scope':
					$mess = '要求されたスコープが不正であることを示します。';
					break;
				case 'server_error':
					$mess = 'サーバでエラーが発生しました。・内部矛盾、下位CP通信異常によるエラーが発生しました。';
					break;
				default :
					$mess = $_REQUEST ['error'];
					break;
			}
			return null;
		}
		$refresh_token = isset($token['refresh_token']) ? $token['refresh_token'] : '';
		return ['access_token' => $token['access_token'], 'refresh_token' => $refresh_token, 'expires_in' =>  time() + (int)$token['expires_in']];
	}


	/*
	 * API-3-2 UserInfo Response （利用者情報取得応答）
	 */
	private function UserInfoRequest($access_token)
	{
		// 指定されたヘッダーにする.
		$headers = array(
			'Content-Type application/x-www-form-urlencoded',
			"Authorization: Bearer {$access_token}"
		);

		// CURLを生成する
		$curl = curl_init();
		$option = [
			CURLOPT_URL			   => $this->urlUserInfo(),
			CURLOPT_HTTP_VERSION   => CURL_HTTP_VERSION_1_1,
			CURLOPT_HTTPHEADER	   => $headers,
			CURLOPT_SSL_VERIFYPEER => true,
			CURLINFO_HEADER_OUT    => true,
			CURLOPT_RETURNTRANSFER => true
		];
		curl_setopt_array($curl, $option);

		// CURLを実行する
		$response	   = curl_exec($curl);
		$response_code = curl_getinfo($curl, CURLINFO_HTTP_CODE);
		$header		   = curl_getinfo($curl, CURLINFO_HEADER_OUT);
		curl_close($curl);
		if ($response == FALSE || isset($response['error'])) {
			return null; // 通信失敗
		}
		$profile = json_decode($response, true); // レスポンスを受け取る.
		return $profile;
	}


	/*
	 * 符号ジェネレータ.
	 */
	private function makeAnyString($length = 16)
	{
		$bytes = openssl_random_pseudo_bytes($length);
		return bin2hex($bytes);
	}
	private function makeState($length = 16)
	{
		return $this->makeAnyString($length);
	}
	private function makeNonce($length = 16)
	{
		return $this->makeAnyString($length);
	}


	/*
	 * 一時データの保存.
	 */
	private function  get_cookie_expire() { return time() + 300; }
	private function  get_cookie_key_state() { return 'state'; }
	private function  get_cookie_key_nonce() { return 'nonce'; }
	private function  get_cookie_key_access_token() { return 'access_token'; }
	private function  get_cookie_key_access_token_secret() { return 'access_token_secret'; }
	private function  get_cookie_key_referer() { return 'referer'; }

	private function setState($state)
	{
		$key = $this->get_cookie_key_state();
		setcookie($key, $state, $this->get_cookie_expire(), '/');
	}
	private function getState()
	{
		$key = $this->get_cookie_key_state();
		return isset($_COOKIE[$key]) ? $_COOKIE[$key] : null;
	}
	private function setNonce($nonce)
	{
		$key = $this->get_cookie_key_nonce();
		setcookie($key, $nonce, $this->get_cookie_expire(), '/');
	}
	private function getNonce()
	{
		$key = $this->get_cookie_key_nonce();
		return isset($_COOKIE[$key]) ? $_COOKIE[$key] : null;
	}

	private function setAccessTokens($data)
	{
		$expire = $data['expires_in'];
		$key_access_token = $this->get_cookie_key_access_token();
		$key_access_token_secret =$this->get_cookie_key_access_token_secret();

		setcookie($key_access_token, $data['access_token'], $expire, '/');
		setcookie($key_access_token_secret, isset($data['access_token_secret']) ? $data['access_token_secret'] : null , $expire, '/');
	}
	private function getAccessTokens()
	{
		$key_access_token = $this->get_cookie_key_access_token();
		$key_access_token_secret =$this->get_cookie_key_access_token_secret();

		$access_token = isset($_COOKIE[$key_access_token]) ? $_COOKIE[$key_access_token] : null;
		$access_token_secret   = isset($_COOKIE[$key_access_token_secret])	 ? $_COOKIE[$key_access_token_secret]	: null;
		return ['service' => $service, 'access_token' => $access_token, 'access_token_secret' => $access_token_secret];
	}
	private function setReferer($referer)
	{
		$key = $this->get_cookie_key_referer();
		setcookie($key, $referer, $this->get_cookie_expire(), '/');
	}
	private function getReferer()
	{
		$key = $this->get_cookie_key_referer();
		return isset($_COOKIE[$key]) ? $_COOKIE[$key] : null;
	}


	// ｄログイン中のdocomoサーバをまたいで一時的に覚えて起きたいことを保持する.
	public function setLogingTempSave($id, $acttime) {
		$key1 = "mail_id";
		$key2 = "mail_acttime";
		setcookie($key1, $id, $this->get_cookie_expire(), '/');
		setcookie($key2, $acttime, $this->get_cookie_expire(), '/');
	}
	public function getLogingTempSave() {
		$key1 = "mail_id";
		$key2 = "mail_acttime";
		return [
			"id"      => isset($_COOKIE[$key1]) ? $_COOKIE[$key1] : null,
			"acttime" => isset($_COOKIE[$key2]) ? $_COOKIE[$key2] : null,
		];
	}

}
