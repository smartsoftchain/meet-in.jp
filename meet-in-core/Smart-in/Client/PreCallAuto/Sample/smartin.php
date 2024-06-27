<?php
/*	Smart-inへの接続要求、およびステータスチェックを行います。
*	以下に必要情報を記載してからご利用ください。
*	{Smart-inキー32桁}
*	{Smart-in企業コード4桁}
*	{DB名}
*	{DBユーザ名}
*	{DBパスワード}
*	{設置DIR}
*/

// 企業コード
define('COMPANY_CODE', '9999');
// 依頼区分(要求された電話番号に発信を行い、コールバック認証を行う。)
define('REQUEST_CODE', 'C60');
// Smart-in 依頼用サーバ
define('SMARTIN_SVR', '111.111.111.111');	// こちらは試験用です。提供環境に応じ、適宜変更ください。
// sin_crypt 格納パス
define('AUTHCODE_SRYPT_PATH', '/var/www/cgi-bin/authcode_crypt');
// 確認結果POST用URL
define('RESPONSE_URL', 'https://' . $_SERVER['HTTP_HOST'] . '/smartin.php');	// URLはご利用の環境に応じ、ディレクトリを追記ください。

// DB設定
define('PDO_DSN', 'mysql:dbname=smartin_sample; host=localhost');
define('PDO_USER', 'root');
define('PDO_PASS', '******');

//if ($_SERVER['REQUEST_METHOD'] == 'POST') {

	$mode = $_REQUEST['mode'];
	$timeout = $_REQUEST['timeout'];

	/*	
		Smart-inへコールバックリクエストを行う
	*/
	if ($mode == 'request') {

		// 接続先電話番号
		$tel_no = $_POST['tel_no'];
		// 電話番号だけハッシュ化
		$execShellCommand = AUTHCODE_SRYPT_PATH . " " . $tel_no;
		exec($execShellCommand, $output, $encodeResult);
					
		// Smart-inへの送信データ
		$url = 'http://'.SMARTIN_SVR.'/request_pr.cgi';
		$postarray = array(  
					'company' => COMPANY_CODE,
					'code' => REQUEST_CODE,
					'telno' => $output[0],
					'response_url' => RESPONSE_URL,
			);
		if(!empty($timeout)){
			$postarray['timer' ] = $timeout;
		}
			
		$postdata = http_build_query($postarray);	 
			
			// http設定
			$opts = array('http' =>	 
				array(  
					'method'  => 'POST',
					'header'  => 'Content-type: application/x-www-form-urlencoded',
					'content' => $postdata
				)   
			);	  
			$context  = stream_context_create($opts);	   
					
			// Smart-inにリクエスト
			$response_json = file_get_contents($url, false, $context);	   
					
			$response = json_decode($response_json, true);
			if($response['result'] == '0'){
				echo $response['token'];

				// 結果を取得（DB使用時）
				$dbh = new PDO(PDO_DSN, PDO_USER, PDO_PASS);
				$sql = "INSERT INTO tokens(token,status) VALUES('{$response['token']}',0);";
				$stmt = $dbh->query($sql);
	        }
	        else{
				// 異常時
				echo $response['detail'];
			}
		exit;
	}


	/*	
		Smart-inのコールバックから登録した情報を参照する
	*/
	if ($mode == 'check'){
		$token = $_POST['token'];
		if (strlen($token) != 32)
			exit;

		// 結果を取得（DB使用時）
		$dbh = new PDO(PDO_DSN, PDO_USER, PDO_PASS);
		$sql = "SELECT * FROM tokens WHERE token = '${token}'";
		$stmt = $dbh->query($sql);
		$array = $stmt->fetchAll(PDO::FETCH_ASSOC);
		if(count($array) > 0)
			$smartin_res = $array[0]['status'];
		$dbh = null;

		// 結果を取得（ファイル使用時）
		//$db = parse_ini_file('textdb.db');
		//$smartin_res = $db[$token];


		switch ($smartin_res) {
			case 100:
				$result = 'true';
				break;
			case 101: 
				$result = '本人話中';
				break;
			case 102: 
				$result = '着信時拒否';
				break;
			case 103: 
				$result = 'タイムアウト';
				break;
			case 109: 
				$result = '例外';
				break;
			default:
				$result = 'waiting';
				break;
		}

		echo $result;
		exit;
	}

	// Smartin からの結果取得
	if(!empty($_REQUEST['token'])){
		$token = $_REQUEST['token'];
		$detail = $_REQUEST['detail'];
		$dbh = new PDO(PDO_DSN, PDO_USER, PDO_PASS);

		error_log("-->".$token.":".$detail."\n", 3, '/var/tmp/app.log');

		if($detail == '00'){
                        // 認証OK
                        $sql = "UPDATE tokens set status=100,updated=now() where token='{$token}'";
                        $stmt = $dbh->query($sql);
                }
		else if($detail == '03'){
                        // 認証NG
                        $sql = "UPDATE tokens set status=103,updated=now() where token='{$token}'";
                        $stmt = $dbh->query($sql);
		}
                else{
                        // 認証NG
                        $sql = "UPDATE tokens set status=109,updated=now() where token='{$token}'";
                        $stmt = $dbh->query($sql);
                }
	}

//}
