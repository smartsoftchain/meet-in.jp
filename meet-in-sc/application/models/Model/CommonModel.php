<?php

class CommonModel extends AbstractModel{
	
	const MAX_ERROR_COUNT = 100;
	
	function __construct($db){
		parent::init();
		$this->db = $db;
	}
	
	public function init() {
		// __constructでparent::init()を実行しなければ親の初期化が実行されない
		//parent::init();
	}

	/**
	 * カテゴリー1のIDを元にカテゴリー2を取得する
	 * @param unknown $data
	 * @return unknown
	 */
	function getBusinessCategory2($data){
		// マネージャーの宣言
		$businessCategorylDao = Application_CommonUtil::getInstance('dao','BusinessCategoryDao', $this->db);
		
		// 送信されたIDチェック
		$businessCategory1 = $businessCategorylDao->getBusinessCategory1ById($data["id"]);
		// データが存在すればカテゴリー2を取得する
		$businessCategory2 = array();
		if($businessCategory1){
			$businessCategory2 = $businessCategorylDao->getBusinessCategory2ByCategory1($data["id"]);
		}
		$businessCategory2Json = json_encode($businessCategory2);
		return $businessCategory2Json;
	}
	
	/**
	 * カテゴリー1とカテゴリー2のIDを元にカテゴリー3を取得する
	 * @param unknown $data
	 */
	function getBusinessCategory3($data){
		// マネージャーの宣言
		$businessCategorylDao = Application_CommonUtil::getInstance('dao','BusinessCategoryDao', $this->db);
		
		// 送信されたIDチェック
		$businessCategory2 = $businessCategorylDao->getBusinessCategory2ByCategory1IdAndCategoryId2($data["category1Id"], $data["category2Id"]);
		// データが存在すればカテゴリー2を取得する
		$businessCategory3 = array();
		if($businessCategory2){
			$businessCategory3 = $businessCategorylDao->getBusinessCategory3ByCategory1AndCategory2($data["category1Id"], $data["category2Id"]);
		}
		$businessCategory3Json = json_encode($businessCategory3);
		return $businessCategory3Json;
	}

	/**
	 * 画面から送信されたCSVの生データをファイルに保存後、再取得し返す
	 * @param unknown $form
	 */
	public function saveImgData($form){
		// ファイルパスを生成する
//		$dirPath = $this->config->file->uploadimg->path;
		$dirPath = "{$_SERVER['DOCUMENT_ROOT']}/img/profile";
//		$fileName = "{$this->user['staff_type']}_{$this->user['staff_id']}.jpg";
		if ($form['staffType']) {
			$fileName = "{$form['staffType']}_{$form['staffId']}.jpg";
		} else {
			$fileName = "work.tmp";//課題
		}
		$fullPath = "{$dirPath}/{$fileName}";
		unlink($fullPath);
		// ファイルを生成する
		touch($fullPath);
		// ファイルの権限を変更する
		chmod($fullPath, 0777);

		// ファイルを開く
		$fp = fopen($fullPath, "wb");
//		$fp = fopen($fullPath, "w");
		// ファイルに書き込む
//		fwrite($fp, $form["imgData"]);
		// BASE64バイナリ文字列をファイルに変換して書き出す
		$base64 = base64_decode($form["imgData"]);
		$base64 = preg_replace("/data:[^,]+,/i","",$base64);
		$base64 = base64_decode($base64);
		fwrite($fp, $base64);

		// ファイルを閉じる
		fclose($fp);

		return "";
	}
	
	/**
	 * 画面から送信されたCSVの生データをファイルに保存後、再取得し返す
	 * @param unknown $form
	 */
	public function saveNamecardImgData($form){
		// ファイルパスを生成する
		$dirPath = "{$_SERVER['DOCUMENT_ROOT']}/img/namecard";
		if ($form['staffType']) {
			$fileName = "{$form['staffType']}_{$form['staffId']}.pdf";
		} else {
			$fileName = "namecard.tmp"; // 新規
		}
		$fullPath = "{$dirPath}/{$fileName}";
		unlink($fullPath);
		// ファイルを生成する
		touch($fullPath);
		// ファイルの権限を変更する
		chmod($fullPath, 0777);

		// ファイルを開く
		$fp = fopen($fullPath, "wb");
		// ファイルに書き込む
		// BASE64バイナリ文字列をファイルに変換して書き出す
		$base64 = base64_decode($form["imgData"]);
		$base64 = preg_replace("/data:[^,]+,/i","",$base64);
		$base64 = base64_decode($base64);
		fwrite($fp, $base64);

		// ファイルを閉じる
		fclose($fp);

		return "";
	}
	
	/**
	 * 商談ルームに入室しているメンバーのカウントを取得
     * ※peerIdが’X’は含めない
	 * 
     *  0     : なし
     *  1以上 : メンバ数
	 */
	public function getRoomMemberCount($form){
		// マネージャーの宣言
		$connectionInfoDao = Application_CommonUtil::getInstance('dao','ConnectionInfoDao', $this->db);
		// 戻り値の変数
		$count = 0;
		$match_flg = 0;

		// idの数値チェック
		if(is_numeric($form["connectionInfoId"])){
			// 検索条件を作成
			$condition = "id = {$form["connectionInfoId"]}";
			$connectionInfo = $connectionInfoDao->getConnectionInfo($condition);

			// peerIdを参照しnullでなければ、商談ルームのユーザーとする
			foreach($connectionInfo as $key=>$val){
				// peeaIdのカラムのみ対象とする
				if ( preg_match("/^user_peer_id_\d+$/", $key) ) {
					// 値のチェック
					if( !is_null($val) && $val != 'X' ) {
						if( $form["peerId"] != $val ){
							// NULlでない且つ、自分のデータでなければカウントアップする
							$count++;
						}
					}
				}
			}
		}
		return $count;
	}

	/**
	 * ルーム名商談ルームに入室しているメンバーのカウントを取得
	 * peerIdが設定されている数を取得(入っている人数)
	 * ※peerIdが’X’も含める
     *
     *  0     : なし
     *  1以上 : メンバ数
	 */
	public function getRoomMemberCountByconnectionInfoId($connectionInfoId){

		// マネージャーの宣言
		$connectionInfoDao = Application_CommonUtil::getInstance('dao','ConnectionInfoDao', $this->db);
		// 戻り値の変数
		$count = 0;
		$match_flg = 0;

		// idの数値チェック
		if( is_numeric($connectionInfoId) ){
			// 検索条件を作成
			$condition = "id = {$connectionInfoId}";
			$connectionInfo = $connectionInfoDao->getConnectionInfo($condition);

			// peerIdを参照しnullでなければ、商談ルームのユーザーとする
			foreach($connectionInfo as $key=>$val){
				// peeaIdのカラムのみ対象とする
				if ( preg_match("/^user_peer_id_\d+$/", $key) ) {
					// 値のチェック
					if( !is_null($val) ) {
						// NULlでなければカウントアップする
						$count++;
					}
				}
			}
		}
		return $count;
	}

	/**
	 * コネクション情報取得
	 * ※未使用
	 */
	// public function getRoomMemberCountByRoomname($room_name){
	// 	// マネージャーの宣言
	// 	$connectionInfoDao = Application_CommonUtil::getInstance('dao','ConnectionInfoDao', $this->db);
	// 	if(isset($room_name)){
	// 		// 検索条件を作成
	// 		$condition = "room_name = '{$room_name}'";
	// 		$connectionInfo = $connectionInfoDao->getConnectionInfo($condition);
	// 	}
	// 	return $connectionInfo;
	// }
}