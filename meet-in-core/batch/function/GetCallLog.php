<?php
/**
 * ログ情報をアスタリスクから取得しテーブルへ登録する
 * @var unknown_type
 */
try{
	debugMeg("GetCallLog_begin");
	
	// DAO読み込み時のエラー回避のため、空のarrayをセットする
	Zend_Registry::set('user', array());
	
	// DAOを宣言
	$db = Zend_Db_Table_Abstract::getDefaultAdapter();
	$callLogDao = Application_CommonUtil::getInstance("dao", "CallLogDao", $db);
	
	$fileName = "CDR.csv";
	$devDirPath = "/var/www/html/batch/function/call_log/";
	
	// トランザクションスタート
	$db->beginTransaction();
	try{
		// 一か月以上前のデータがあれば削除する
		$callLogDao->deleteCallLog();
		
		// 前回のクーロン処理が終わっていないか確認する
		if(!file_exists($devDirPath.$fileName)){
			// ログファイルのあるフォルダ名を取得する
			$cmd = "ls -F /home/mp3/ | grep /";
			exec($cmd, $dirFilePaths);
			foreach($dirFilePaths as $dirFilePath){
				// アスタリスクサーバーディレクトリを元にファイルパスを生成する
				$logFilePath = "/home/mp3/{$dirFilePath}cdr_csv/{$fileName}";
				// ファイルの存在チェック
				if(file_exists($logFilePath)){
					// アスタリスクのログファイルを取得する
					$cmd = "mv ".$logFilePath." ".$devDirPath;
					exec($cmd, $result);
					// アスタリスク上のファイルを取得する
					$filePath = $devDirPath.$fileName;
					
					// shift-jisのファイルを開く前にutf8で一時保存し、機種依存文字による想定外の動きを回避する
					$fp = tmpfile();
					fwrite($fp, mb_convert_encoding(file_get_contents($filePath), 'UTF-8', 'sjis-win'));
					rewind($fp);
					while ($row = fgetcsv($fp)) {
						// 電話が繋がっていないのに、通話ログに書き込まれる事があるので最初に判定する
						if($row[5] == "ANSWERED"){
							$webphoneIdCount = mb_strlen($row[0]);
							if($webphoneIdCount == 11){
								// 登録するデータがDBに存在するか確認する
								$callLogCount = $callLogDao->getUniqueCallLogCount($row[4]);
								if($callLogCount == 0){
									// 前回通話からの間隔秒を計算
									$intervalTime = intervalCalculation($row[0], $row[2], $callLogDao);
									
									// MP3のキーを取得する
									$mp3key = "";
									$consumerTel = "";
									$firstStr = substr($row[1], 0, 1);
									if($firstStr == "6"){
										// 先頭文字が6の場合のみデータ登録
										$tmpTel = substr($row[1], 7);
										$firstStr = substr($tmpTel, 0, 1);
										if($firstStr == "9"){
											// ワンクリックコール
											$mp3key = substr($tmpTel, 0, 8);
											$consumerTel = substr($tmpTel, 8);
										}else{
											// 先頭が9以外の場合は電話を掛けるの電話
											$consumerTel = $tmpTel;
										}
									}
									// 電話の桁数が大きい場合があるので24桁で切る
									if($consumerTel != ""){
										$consumerTel = substr($consumerTel, 0, 24);
									}
									// 登録用DICTを作成する
									$callLogDict = array();
									$callLogDict["webphone_id"] = $row[0];
									$callLogDict["origin_key"] = $row[1];
									$callLogDict["call_date"] = $row[2];
									$callLogDict["call_time"] = $row[3];
									$callLogDict["call_id"] = $row[4];
									$callLogDict["result_key"] = $mp3key;
									$callLogDict["consumer_tel"] = $consumerTel;
									$callLogDict["interval_time"] = $intervalTime;
									// call_logを登録する
									$callLogDao->regist($callLogDict);
								}
							}
						}
					}
					// 処理が終わればファイルを消す
					$cmd = "rm -f ".$filePath;
					exec($cmd, $result);
				}
			}
		}else{
			// ########################################################
			// この処理は手動バッチの場合のみ実行させたいので、通常時はコメント化する
			// ########################################################
/*
			// ファイルが存在すればもう一度処理を実行する
			$filePath = $devDirPath.$fileName;
			
			// shift-jisのファイルを開く前にutf8で一時保存し、機種依存文字による想定外の動きを回避する
			$fp = tmpfile();
			fwrite($fp, mb_convert_encoding(file_get_contents($filePath), 'UTF-8', 'sjis-win'));
			rewind($fp);
			$count = 0;
			while ($row = fgetcsv($fp)) {
				// 電話が繋がっていないのに、通話ログに書き込まれる事があるので最初に判定する
				if($row[5] == "ANSWERED"){
					$webphoneIdCount = mb_strlen($row[0]);
					if($webphoneIdCount == 11){
						// 登録するデータがDBに存在するか確認する
						$callLogCount = $callLogDao->getUniqueCallLogCount($row[4]);
						if(true){
							// 前回通話からの間隔秒を計算
							$intervalTime = intervalCalculation($row[0], $row[2], $callLogDao);
							
							// MP3のキーを取得する
							$mp3key = "";
							$consumerTel = "";
							$firstStr = substr($row[1], 0, 1);
							if($firstStr == "6"){
								// 先頭文字が6の場合のみデータ登録
								$tmpTel = substr($row[1], 7);
								$firstStr = substr($tmpTel, 0, 1);
								if($firstStr == "9"){
									// ワンクリックコール
									$mp3key = substr($tmpTel, 0, 8);
									$consumerTel = substr($tmpTel, 8);
								}else{
									// 先頭が9以外の場合は電話を掛けるの電話
									$consumerTel = $tmpTel;
								}
							}
							// 電話の桁数が大きい場合があるので24桁で切る
							if($consumerTel != ""){
								$consumerTel = substr($consumerTel, 0, 24);
							}
							// 登録用DICTを作成する
							$callLogDict = array();
							$callLogDict["webphone_id"] = $row[0];
							$callLogDict["origin_key"] = $row[1];
							$callLogDict["call_date"] = $row[2];
							$callLogDict["call_time"] = $row[3];
							$callLogDict["call_id"] = $row[4];
							$callLogDict["result_key"] = $mp3key;
							$callLogDict["consumer_tel"] = $consumerTel;
							$callLogDict["interval_time"] = $intervalTime;
							// call_logを登録する
							$callLogDao->regist($callLogDict);
						}
						$count++;
						error_log($count);
					}
				}
			}
			// 処理が終わればファイルを消す
			$cmd = "rm -f ".$filePath;
			exec($cmd, $result);
*/
		}
		// 登録完了したらコミットする
		$db->commit();
	}catch(Exception $e){
		$db->rollBack();
		throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
	}
	
	debugMeg("GetCallLog_end");
}
catch (Exception $err){
	debugMeg("想定外の例外：".$err->getMessage());
}

/**
 * 前回通話からの秒数を計算
 * @param unknown $dataDict
 */
function intervalCalculation($webphoneId, $callDate, $callLogDao){
	// 戻り値宣言
	$result = "";
	// 架電者の今日日付の最後のデータを取得する
	$lastTelCallLog = $callLogDao->getLastTelCallLog($webphoneId);
	if($lastTelCallLog){
		// 日付をUNIXタイムスタンプに変換
		$timestamp1 = strtotime($lastTelCallLog["call_date"]);
		$timestamp2 = strtotime($callDate);
		// 何秒離れているかを計算
		$result = abs($timestamp2 - $timestamp1);
	}
	return $result;
}
/**
 * デバッグメッセージ
 * @param unknown $actionName	処理名
 */
function debugMeg($actionName){
	error_log($actionName.":".date("Y-m-d H:i:s")."\n");
}