<?php
/**
 * ステータス確認バッチ
 * @var unknown_type
 */
try{

	$config = new Zend_Config_Ini(APP_DIR . 'configs/application.ini', 'asterisk');
	$dirname = $config->incoming->directory;

	while(true){

		// ファイル一覧を取得
		$res_dir = opendir($dirname);
		$files = array();
		while( $file_name = readdir( $res_dir ) ){
			if($file_name == '.' || $file_name == '..'){
				continue;
			}

			$files[] = $file_name;
			unlink($dirname . "/" .  $file_name);
		}
		closedir($res_dir);

		$manager = getInstance('Manager','Auth');
		foreach($files as $file){
			$params = array(
					'target_tel' => $file,
					'status' => '1',
			);
			$manager->regist($params);
		}


		////////////////////////
		// 古いデータを削除
		$manager = getInstance('Manager','Auth');
		$manager->deleteOld(array("timeout" => 1));		// タイムアウト値を設定（分）

		////////////////////////
		// スリープ
		sleep(2);
	}

}
catch (Exception $err){
	echo $err;
}