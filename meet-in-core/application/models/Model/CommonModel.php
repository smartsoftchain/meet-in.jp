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

	/**
	 * 背景画像関連の定数
	 */
	const BODYPIX_PATH_STAFF  = "/img/bodypix/staff/";
	const BODYPIX_PATH_GUEST  = "/img/bodypix/guest/";
	/**
	 * 背景画像を物理ファイル化し、パスをDBに登録する
	 */
	public function saveBodypixImage($form){
		// 戻り値
		$result = array("status"=>0, "filePath"=>"", "error"=>"");
		// トランザクションスタート
		$this->db->beginTransaction();
		try{
			// サーバーから送信されたデータを変数に設定する
			$bodypixImg = $form["bodypixImg"];
			// ファイル名
			$fileName = "";
			// フォルダパス
			$filePath = "";
			if($this->user){
				// ログインユーザーのファイルパス
				$filePath = self::BODYPIX_PATH_STAFF;
				// ログインユーザーのファイル名
				$fileName = "bodypix_".md5($this->user["staff_type"].$this->user["staff_id"].date("Ymdhis")).".png";
			}else{
				// 未ログインユーザーの場合（商談画面のゲスト）
				$filePath = self::BODYPIX_PATH_GUEST;
				// 未ログインユーザーのファイル名
				$fileName = "bodypix_{$form["bodypixGuestId"]}.png";
			}
			// ファイルのフルパス作成
			$fileFullPath = "{$_SERVER['DOCUMENT_ROOT']}{$filePath}{$fileName}";
			// 画像を保存するために資料のモデルを宣言（同じ処理を使用するため）
			$materialModel = Application_CommonUtil::getInstance("model", "MaterialModel", $this->db);
			// 画像データを物理ファイル化する
			$materialModel->createImageFile($bodypixImg, $fileFullPath, "png");
			
			// ログインユーザーの場合のみDBにデータを保存する
			if($this->user){
				$bodypixImageDao = Application_CommonUtil::getInstance("dao", "BodypixImageDao", $this->db);
				// 登録用の画像パス
				$registFullPath = "{$filePath}{$fileName}";
				// DBに画像パスを登録する
				$bodypixImageDao->setBodypixImage($registFullPath, $this->user);
				// コミットする（メールの送信結果に関わらず、DBはコミットする）
				$this->db->commit();
			}
			// 戻り値のステータスを変更する
			$result["status"] = 1;
			// 戻り値にファイルパスを設定する
			$result["filePath"] = $registFullPath;
		}catch(Exception $e){
			$this->db->rollBack();
			$result["error"] = "想定外のエラーが発生しました。再度お申し込みください。";
			$result["error"] = $e->getMessage();
		}
		// 戻り値を返す
		return $result;
	}

	/**
	 * 背景画像を削除する
	 */
	public function delBodypixImage($form){
		// 戻り値
		$result = array("status"=>0, "error"=>"");
		// トランザクションスタート
		$this->db->beginTransaction();
		try{
			// 削除画像パスを作成する
			$delFilePath = "{$_SERVER['DOCUMENT_ROOT']}{$form["delImgPath"]}";
			if(file_exists($delFilePath)){
				// DAOの宣言
				$bodypixImageDao = Application_CommonUtil::getInstance("dao", "BodypixImageDao", $this->db);
				// データを削除する
				$bodypixImageDao->delBodypixImage($form["delImgPath"], $this->user["staff_type"], $this->user["staff_id"]);
				// コミットする（メールの送信結果に関わらず、DBはコミットする）
				$this->db->commit();
				// 画像を削除する
				unlink($delFilePath);
				// 戻り値のステータスを変更する
				$result["status"] = 1;
			}else{
				$result["error"] = "不正なデータが送信されました。";
			}
		}catch(Exception $e){
			$this->db->rollBack();
			$result["error"] = "想定外のエラーが発生しました。再度お申し込みください。";
			//$result["error"] = $e->getMessage();
		}
		// 戻り値を返す
		return $result;
	}

	/**
	 * ゲスト商談終了時に背景画像を削除する
	 */
	public function guestEndMeetinDelBodypixImage($bodypixGuestId){
		// 削除画像パスを作成する
		$delFilePath = "{$_SERVER['DOCUMENT_ROOT']}" . self::BODYPIX_PATH_GUEST . "bodypix_{$bodypixGuestId}.png";
		if(file_exists($delFilePath)){
			// 画像を削除する
			unlink($delFilePath);
		}
	}
	/**
	 * ユーザーが登録した背景画像を取得し、管理者の登録した画像とマージする
	 * @param array $form	ゲストを特定するためのデータ
	 */
	public function mergeBodypixImage($form){
		// DAOの宣言
		$bodypixImageDao = Application_CommonUtil::getInstance("dao", "BodypixImageDao", $this->db);
		// 戻り値の宣言
		$files = array();
		// ログインユーザーのみ画像取得処理を行う
		if($this->user){
			// 担当者情報を元に画像パスを取得する
			$bodypixImages = $bodypixImageDao->getBodypixImages($this->user["staff_type"], $this->user["staff_id"]);
			// 取得した画像データをマージする
			foreach($bodypixImages as $row){
				$files[] = "{$row["img_path"]}?".rand(1, 100);
			}
		}else{
			// システム管理者登録の画像パスを取得する
			$bodypixImages = $bodypixImageDao->getBodypixImagesByAdmin();
			// 取得した画像データをマージする
			foreach($bodypixImages as $row){
				$files[] = "{$row["img_path"]}?".rand(1, 100);
			}
			// ゲストの場合はpeerIdから画像を取得する
			$filePath = "{$_SERVER['DOCUMENT_ROOT']}".self::BODYPIX_PATH_GUEST."bodypix_{$form["bodypixGuestId"]}.png";
			if(file_exists($filePath)){
				// ファイルが存在する場合のみ設定する
				$files[] = self::BODYPIX_PATH_GUEST . "bodypix_{$form["bodypixGuestId"]}.png?".rand(1, 100);
			}
		}
		// 戻り値を返す
		return $files;
	}
}