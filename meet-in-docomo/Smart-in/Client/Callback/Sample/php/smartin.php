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

// sin_crypt 暗号化キー（半角英数32桁）
define('KEY_CODE', '{Smart-inキー32桁}');
// 企業コード
define('COMPANY_CODE', '{Smart-in企業コード4桁}');
// 依頼区分(要求された電話番号に発信を行い、コールバック認証を行う。)
define('REQUEST_CODE', 'C51');
// Smart-in 依頼用サーバ
define('SMARTIN_SVR', 'api.smart-in.biz');	// こちらは試験用です。提供環境に応じ、適宜変更ください。
// sin_crypt 格納パス
define('SIN_CRYPT_PATH', './sin_crypt');
// 確認結果POST用URL
define('RESPONSE_URL', 'https://' . $_SERVER['HTTP_HOST'] . '{設置DIR}/smartin_response.php');	// URLはご利用の環境に応じ、ディレクトリを追記ください。

// DB設定
define('PDO_DSN', 'mysql:dbname={DB名}; host=localhost');
define('PDO_USER', '{DBユーザ名}');
define('PDO_PASS', '{DBパスワード}');

if ($_SERVER['REQUEST_METHOD'] == 'POST') {

	$mode = $_REQUEST['mode'];

	/*	
		Smart-inへコールバックリクエストを行う
	*/
	if ($mode == 'request') {

		// 接続先電話番号
		$tel_no = $_POST['tel_no'];
					
		// smart-inへのリクエストパラメータを生成 
		$request = array(
			'company' => COMPANY_CODE,
			'code' => REQUEST_CODE,
			'telno' => $tel_no,
			'response_url' => RESPONSE_URL
		);		 
		$requestJson = json_encode($request); 
					
		// jsonを専用APIで暗号化する 
		$execShellCommand = SIN_CRYPT_PATH." -e ".KEY_CODE." '${requestJson}'";
		exec($execShellCommand, $output, $encodeResult);

		// 暗号化成功
		if($encodeResult == 0){		 
			
			// Smart-inへの送信データに暗号化したjsonを代入
			$authJson = $output[0];
			$url = 'http://'.SMARTIN_SVR.'/request.cgi';
			$postdata = http_build_query(	   
				array(  
					'company' => COMPANY_CODE,
					'data' => $authJson
				)   
			);	  
			
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
			$response = file_get_contents($url, false, $context);	   
					
			// レスポンスをデコードし、画面に表示	 
			$execShellCommand = SIN_CRYPT_PATH." -d ".KEY_CODE." ${response}";
			$responseJson = exec($execShellCommand, $output, $decodeResult);  
			if($decodeResult == 0){
				$responseDecodeStr = "";
				for ($i = 1; $i < count($output)-1; $i++) {
					$responseDecodeStr .= $output[$i];
				}

				// デコードすると token と result が出てくる
				// result 0:認証中 1:認証完了 9:認証失敗
				$responseArray = json_decode($responseDecodeStr, true); 

				echo $responseArray['token'];

			// デコード失敗
			}else{	 
				echo 'デコード失敗';
			}

		// 暗号化失敗   
		}else{
			echo '暗号化失敗';
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

}