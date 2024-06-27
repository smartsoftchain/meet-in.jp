<?php
/*	Smart-inからPOSTされる認証結果情報を取得し、DBに登録します。
*	以下に必要情報を記載してからご利用ください。
*	{Smart-inキー32桁}
*	{DB名}
*	{DBユーザ名}
*	{DBパスワード}
*/

// sin_crypt 暗号化キー（半角英数32桁）
define('KEY_CODE', '{Smart-inキー32桁}');
// sin_crypt 格納パス
define('SIN_CRYPT_PATH', './sin_crypt');

// DB設定
define('PDO_DSN', 'mysql:dbname={DB名}; host=localhost');
define('PDO_USER', '{DBユーザ名}');
define('PDO_PASS', '{DBパスワード}');

if (!isset($_POST['data'])) {
	exit;
}

// 暗号化解除
$encryptedJson = $_POST['data'];
$execShellCommand = SIN_CRYPT_PATH." -d ".KEY_CODE." '${encryptedJson}'";
exec($execShellCommand, $output, $decodeResult);

// JSONのデコード
if($decodeResult == 0){

	// デコードするとtokenとdetail(結果)が出てくる
	// detail 00:正常, 01:ビジー, 02:着信時拒否, 03:タイムアウト
	$joinvar = join('', $output);
	$responseArray = json_decode($joinvar, true);
	$token = $responseArray['token'];
	// 正常（規定時間内に接続）
	if($responseArray['detail'] === '00'){
		$status = 100;
	// ビジー(本人話中)
	}elseif($responseArray['detail'] === '01'){
		$status = 101;
	// 着信時拒否（スマホのみ）
	}elseif($responseArray['detail'] === '02'){
		$status = 102;
	// タイムアウト（応答無し、接続不可）
	}elseif($responseArray['detail'] === '03'){
		$status = 103;
	// 例外
	}else{
		$status = 109;
	}

	// 結果を保存（DB使用時）
	// ※注意：定期的に古いレコードを削除する必要があります
	$dbh = new PDO(PDO_DSN, PDO_USER, PDO_PASS);
	$stmt = $dbh->prepare("INSERT INTO tokens (token, status) VALUES (?, ?)");
	$stmt->execute(array($token, $status));
	$dbh = null;

	// 結果を保存（ファイル使用時）
	//$fp = fopen('textdb.db', 'a');
	//fwrite($fp, "${token} = \"${status}\"");
	//fclose($fp);

}