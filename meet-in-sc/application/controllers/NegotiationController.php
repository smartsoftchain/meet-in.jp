<?php
require_once APP_DIR.'/models/Adapter/AuthAdapter.php';

class NegotiationController extends AbstractController
{
	// 連携サイト定義
	const COLLABO_SITES = array(
		"salescrowd" => array(
			"online.sales-crowd.jp",
			"demo.sales-crowd.jp",
			"sc2.sense.co.jp",
			"sc.sense.co.jp",
		),
	);
	public function init(){
		parent::init();
		/* Initialize action controller here */
	}

	public function negotiationAction(){
		$form = $this->_getAllParams();
		// 操作ログ
		$this->setLog("商談中画面画面表示", json_encode($form));

		$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);
		$params = $apiModel->getWebRtcParam();

error_log(date("Y年m月d日 H時i分s秒")."商談開始：".json_encode($form)."\n", 3, "/var/tmp/negotiation.log");
		// 商談がすでに終了した場合は別のページにリダイレクトする
		$connectionInfo = $apiModel->getConnectionInfo($params["connection_info_id"]);
		if (5 == $connectionInfo["connection_state"]) {
			$this->_redirect('/');
		}
		// 接続情報IDがない場合は別のページにリダイレクトする
		if (empty($params["connection_info_id"])) {
			$this->_redirect('/');
		}

		$this->view->client_id = $this->user["client_id"];
		$this->view->staff_type = $this->user["staff_type"];
		$this->view->staff_id = $this->user["staff_id"];
		
		$this->view->connection_info_id = $params["connection_info_id"];
		$this->view->connect_no = $params["connect_no"];
		$this->view->peer_id = $params["peer_id"];
		$this->view->user_id = $params["user_id"];
		$this->view->my_user_info = $params["user_info"];
		$this->view->target_peer_id = $params["target_peer_id"];
		$this->view->is_operator = $params["is_operator"];
		$this->view->screen_type = $params["screen_type"];
		$this->view->wait_connect_table_string = $params["wait_connect_table_string"];
		$this->view->send_bandwidth = $params["send_bandwidth"];
		$this->view->receive_bandwidth = $params["receive_bandwidth"];
		$this->view->room_name = $params["room_name"];
		$this->view->collabo_site = $params["collabo_site"];

		$this->view->room_locked = "0";	// 初期値(ロームロックはOFF)
		
		// スタッフタイプが存在している場合は、ログイン済みのオペレータのためオペレータ権限とする
		if( empty($this->user["staff_type"]) == false ) {
			$params["is_operator"] = "1";
			$this->view->is_operator = $params["is_operator"];
		}
		else {
			$params["is_operator"] = "0";
		}
		
		// ゲストの場合はオペレーターの情報を画面に設定する
		if($params["is_operator"] == 0){
			// モデル宣言
			$connectionInfoDao = Application_CommonUtil::getInstance("Dao", "ConnectionInfoDao", $this->db);
			// 接続ナンバーを元にオペレータ情報を取得
			error_log("connection_info_id:".$params["connection_info_id"]);
			$operatorInfo = $connectionInfoDao->getOperatorInfo($params["connection_info_id"]);

			// ゲスト側のID設定
			$this->view->client_id = "0";
			$this->view->staff_type = "ZZ";
			$this->view->staff_id = "0";

			// 写真
			$profPath = "{$_SERVER['DOCUMENT_ROOT']}/img/profile/{$operatorInfo["staff_type"]}_{$operatorInfo["staff_id"]}.*";
			$profile_image = '';
			foreach(glob($profPath) as $file) {
				if(file_exists($file)) {
					$profile_image = str_replace($_SERVER['DOCUMENT_ROOT'], "", $file);
				}
			}
			if(empty($profile_image)) {
				$profile_image = '/img/no-image.png';
			}
			$operatorInfo["profile_image"] = $profile_image;
			$this->view->user = $operatorInfo;

			// 名刺
			$namecardDict = $operatorInfo;
			// 名刺データの画像パス取得
			$namecardImgPath = "{$_SERVER['DOCUMENT_ROOT']}/img/namecard/{$operatorInfo["staff_type"]}_{$operatorInfo["staff_id"]}_{$operatorInfo["operator_client_id"]}.*";

		} else {
			// 名刺
			$masterClientDao = Application_CommonUtil::getInstance("dao", "MasterClientDao", $this->db);
			$namecardDict = $masterClientDao->getStaffClientNamecardRow($this->user["client_id"], $this->user["staff_type"], $this->user["staff_id"]);
			// 名刺データの画像パス取得
			$namecardImgPath = "{$_SERVER['DOCUMENT_ROOT']}/img/namecard/{$this->user["staff_type"]}_{$this->user["staff_id"]}_{$this->user["client_id"]}.*";
		}
		foreach(glob($namecardImgPath) as $file){
			if(is_file($file)){
				$imgpath = str_replace($_SERVER['DOCUMENT_ROOT'], "", $file);
				$namecardDict['ImgPath'] = $imgpath;
			}
		}
		// 名刺表示フラグのチェック
		if (($namecardDict["namecard_name_public_flg"] == 0) &&
				($namecardDict["namecard_meetin_public_flg"] == 0) &&
				($namecardDict["namecard_client_name_public_flg"] == 0) &&
				($namecardDict["namecard_email_public_flg"] == 0) &&
				($namecardDict["namecard_picture_public_flg"] == 0) &&
				($namecardDict["namecard_card_public_flg"] == 0) &&
				($namecardDict["namecard_department_public_flg"] == 0) &&
				($namecardDict["namecard_executive_public_flg"] == 0) &&
				($namecardDict["namecard_address_public_flg"] == 0) &&
				($namecardDict["namecard_tel_public_flg"] == 0) &&
				($namecardDict["namecard_cell_public_flg"] == 0) &&
				($namecardDict["namecard_fax_public_flg"] == 0) &&
				($namecardDict["namecard_facebook_public_flg"] == 0) &&
				($namecardDict["namecard_sns_public_flg"] == 0) &&
				($namecardDict["namecard_free1_public_flg"] == 0) &&
				($namecardDict["namecard_free2_public_flg"] == 0)) {
			$namecardDict["namecard_private"] = 1;
		}

		// ビデオフレームのアイコン画像
		// 写真
		$profPath = "{$_SERVER['DOCUMENT_ROOT']}/img/profile/{$this->user["staff_type"]}_{$this->user["staff_id"]}.*";
		$profile_image = '';
		foreach(glob($profPath) as $file) {
			if(file_exists($file)) {
				$profile_image = str_replace($_SERVER['DOCUMENT_ROOT'], "", $file);
			}
		}
		if(empty($profile_image)) {
			$profile_image = '/img/icon_face.png';
		}		
		$this->view->video_background_image = $profile_image;
		
		$this->view->namecard = $namecardDict;
		
		// WebRTCが使えないときの画面共有
		// 画面を共有する人が自分の画面共有表示領域をキャプチャし、画像ファイルをサーバーにアップロードする
		// phpではまずフォルダを作る
		$this->config = Zend_Registry::get('config');
		$screenCaptureDir = $this->config->screen_capture->path . "screen_capture_".$params["connection_info_id"];
		if(!file_exists($screenCaptureDir)){
			// フォルダが存在しなければ作成する
			mkdir($screenCaptureDir, 0777);
		}
	}
	
	public function negotiationEditAction(){
		$this->_loginCheck();
		$form = $this->_getAllParams();
		$request = $this->getRequest();
		$this->setLog("接続履歴詳細", json_encode($form));

		// モデル宣言
		$BDResultModel = Application_CommonUtil::getInstance("model", "BusinessDiscussionResultModel", $this->db);
		$result = $BDResultModel->BDResultEdit($form, $request);
		if($result["registCompleteFlg"] == 1 || empty($result["BDRDict"])){
			// 登録完了の場合
			$this->_redirect('/negotiation/negotiation-list');
		}
		$this->view->BDRDict = $result["BDRDict"];
		$this->view->errorList = $result["errorList"];
	}

	public function negotiationRegistAction(){
		$this->_loginCheck();
		$form = $this->_getAllParams();
		$request = $this->getRequest();
//error_log("negotiationRegistAction\n", 3, "/var/tmp/negotiation.log");

		$user_id = $form["user_id"];
		$connection_info_id = $form["connectioninfoidtemp"];

		// モデル宣言
		$BDResultModel = Application_CommonUtil::getInstance("model", "BusinessDiscussionResultModel", $this->db);
		$result = $BDResultModel->BDResultRegist2($form, $request);
		$this->view->BDRDict = $result["BDRDict"];
		$this->view->errorList = $result["errorList"];

		// モデル宣言
		$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);
		$params = $apiModel->getWebRtcParam();

		// ログインフラグOFF
		if ( !empty($connection_info_id) && !empty($user_id) ) {
//error_log("ログインフラグOFF connection_info_id=(".$connection_info_id.") user_id=(".$user_id.")\n", 3, "/var/tmp/negotiation.log");
			$count = $apiModel->updateConnectionInfoLogin($connection_info_id, $user_id, "0");
		}
		// ルームロックOFF
		if ( !empty($connection_info_id) ) {
//error_log("ルームロックOFF connection_info_id=(".$connection_info_id.")\n", 3, "/var/tmp/negotiation.log");
			$count = $apiModel->updateConnectionInfoRoomStateOff($connection_info_id);
		}

		if( isset($_SESSION['room_in']) ) {
			unset($_SESSION['room_in']);
		}
		//error_log("negotiationRegistAction result=(".$result["registCompleteFlg"].")\n", 3, "/var/tmp/negotiation.log");
		if($result["registCompleteFlg"] == 1){
			// 登録完了の場合
			$this->_redirect('/index/menu');
		}
	}

	public function negotiationFinishAction(){
	}

	/**
	 * 接続履歴一覧
	 */
	public function negotiationListAction(){
		$this->_loginCheck();
		$form = $this->_getAllParams();
		// 操作ログ
		$this->setLog("接続履歴一覧", json_encode($form));
		
		if(!empty($this->user["client_id"])){
			// モデル宣言
			$BDResultModel = Application_CommonUtil::getInstance("model", "BusinessDiscussionResultModel", $this->db);
			// 画面表示に必要なデータを取得
			$result = $BDResultModel->getBDResultList($form, $this->namespace);
			// smartyにデータを設定する
			$this->view->list = $result["list"];
			$this->view->free_word = $this->namespace->free_word;
			$this->view->BDResultListIds = $result["BDResultListIds"];
			$this->view->allFlg = $result["allFlg"];
			$this->view->uploadMsg = $result["uploadMsg"];
			$this->view->publish_recording_talk_flg = $result["publish_recording_talk_flg"];
			$this->view->searchType = $this->namespace->searchType;
			if (array_key_exists("srt", $form)) {
				$this->view->srt = $form["srt"];
			} else {
				$this->view->srt = "";
			}
		}else{
			// クライアントが選択されていなければ不正な遷移
			$this->_redirect('/client/list');
		}
	}

	/**
	 * 接続履歴CSVダウンロード
	 */
	public function downloadCsvAction() {
		$this->_loginCheck();
		
		// 操作ログ
		$this->setLog("接続履歴ダウンロード", json_encode($this->_getAllParams()));
		$form = $this->_getAllParams();
		
		$BDResultModel = Application_CommonUtil::getInstance("model", "BusinessDiscussionResultModel", $this->db);
			
		// CSVデータを取得する
		$csvData = $BDResultModel->getCsvResult($form);
		
		// ファイル名を設定
		$fileName = date('Y-m-d H:i:s') . ".csv";
		
		// 文字コードをSJISに変換
		if(!strpos($_SERVER['HTTP_USER_AGENT'],'iPad') && !strpos($_SERVER['HTTP_USER_AGENT'],'iPhone')){
			// iPad以外はsjisに変換する
			$csvData = mb_convert_encoding($csvData, 'sjis-win', 'UTF-8');
		}
		
		header('Pragma: public');
		$this->getResponse()
			->setHeader('Content-disposition','attachment; filename*=UTF-8\'\'' . rawurlencode($fileName))
			->setHeader('Content-type', 'test/x-csv')
			->sendHeaders();
		
		$this->getResponse()->appendBody($csvData);
		$this->getResponse()->outputBody();
		
		exit;
	}

	/**
	 * 削除の共通処理
	 */
	public function negotiationDeleteAction(){
		$this->_loginCheck();
		$form = $this->_getAllParams();
		$request = $this->getRequest();
		// モデル宣言
		$BDResultModel = Application_CommonUtil::getInstance("model", "BusinessDiscussionResultModel", $this->db);
		$result = $BDResultModel->BDResultDelete($form, $request);
//		echo $result;
		if($result == 1){
			// 登録完了の場合
			$this->_redirect('/negotiation/negotiation-list');
		}
	}

	/**
	 * PDF出力する機能
	 */
	public function downloadShareMemoPdfAction(){
		// POSTデータの読み込み
		$form = $this->_getAllParams();
		// pdfモジュールの読み込み
		require_once ROOT.'library/Pdf/japanese.php';
		// A4サイズのPDF文書を準備
		$pdf = new PDF_Japanese('P', 'pt', 'A4');
		$pdf->AddSJISFont();
		// ページ、フォント、描画位置を設定
		$pdf->addPage();
		$pdf->setFont('SJIS', '', 16);
		$pdf->setXY(28, 20);

// ■修正 2017/10/02
//   POSTパラメータは取得時にすでにデコードされているため、urldecodeは不要
//   自動改行のため、半角英数を全角英数に変換しているが、URLリンクにならないため不要
//   ただし、本PDF(FPDF)ライブラリでは英数の場合自動改行が正しく行われないため、改行を処理を追加する。
//
//		// 文字列をSJISに変換するsjis関数
//		$str = mb_convert_encoding(urldecode($form["shareMemo"]), 'SJIS', 'auto');
//		// 半角英数を全角整数に変換する
//		$str = mb_convert_kana($str, "AS", "SJIS");

		/**
		 * 共有メモ整形処理
		 */
		$str="";
		// 行(改行)別にデータを分割
		$array  = explode("\n", $form["shareMemo"]);
		// 行毎に処理し、文字数がPDF1行分(約34文字)より長い場合は34文字毎に改行を挿入する。
		// 34文字以下はそのまま出力(ただし、explode時に改行は含まれないため付与する)
		foreach ($array as $rec) {
			if( mb_strlen($rec) > 33 ) {
				// 34文字以上の場合は34文字毎に分割し改行コードを追加する
				$array2=str_split($rec, 33);
				if( count($array2) < 2 ) {
					$str = $str . $rec . "\n";
				}
				else {
					foreach ($array2 as $rec2) {
						$str = $str.$rec2."\n";
					}
				}
			}
			else {
				$str = $str.$rec."\n";
			}
		}
		// 文字列をSJISに変換するsjis関数
		$str = mb_convert_encoding($str, 'SJIS', 'auto');

		// 文字列を描画
		$pdf->write(18, $str);
		// ファイル名作成
		$pdfFileName = "share_memo".date("Ymdhis").".pdf";
		// ファイルパス作成
		$pdfFilePath = "{$_SERVER['DOCUMENT_ROOT']}/pdf/{$pdfFileName}";
		
		// PDFファイル生成
		$pdf->output($pdfFilePath, 'F');
		
		// ダウンロードするダイアログを出力
		header("Content-Disposition: attachment; filename={$pdfFileName}");
		
		// ファイルを読み込んで出力
		readfile($pdfFilePath);
		
		exit;
	}
	
	/**
	 * ホワイトボードをダウンロードする
	 */
	public function downloadWhiteBoardAction(){
		// 操作ログ
		$this->setLog("ホワイトボードダウンロード", json_encode($this->_getAllParams()));
		$form = $this->_getAllParams();
		// モデル宣言
		$materialModel = Application_CommonUtil::getInstance("model", "MaterialModel", $this->db);
		$pdfFilePath = $materialModel->createWhiteBoardPdf($form);
	
		// 出力するファイル名
		$pdfFileName = "white_board_".date("Ymdhis").".pdf";
	
		// ダウンロードするダイアログを出力
		header("Content-Disposition: attachment; filename={$pdfFileName}");
	
		// ファイルを読み込んで出力
		readfile($pdfFilePath);
		exit;
	}
	
	/**
	 * 資料共有のモーダルを表示する為に、資料の一覧を取得する
	 */
	public function getModalMaterialListAction(){
		// 操作ログ
		$this->setLog("モーダル用資料一覧取得", json_encode($this->_getAllParams()));
		$form = $this->_getAllParams();
		// モデル宣言
		$materialModel = Application_CommonUtil::getInstance("model", "MaterialModel", $this->db);
		$resultJson = $materialModel->getMaterialBasicList($form);
		// 資料のjsonデータを画面に返す
		echo $resultJson;
		exit;
	}
	
	/**
	 * 資料共有のモーダルで選択した資料を取得する
	 */
	public function getMaterialAction(){
		// 操作ログ
		$this->setLog("資料共有用のデータ取得", json_encode($this->_getAllParams()));
		$form = $this->_getAllParams();
		// モデル宣言
		$materialModel = Application_CommonUtil::getInstance("model", "MaterialModel", $this->db);
		$resultJson = $materialModel->getMaterial($form);
		// 資料のjsonデータを画面に返す
		echo $resultJson;
		exit;
	}
	
	/**
	 * 資料の同期で共有した資料を取得する
	 */
	public function getMaterialListAction(){
		// 操作ログ
		$this->setLog("資料共有用のデータ取得", json_encode($this->_getAllParams()));
		$form = $this->_getAllParams();
		// モデル宣言
		$materialModel = Application_CommonUtil::getInstance("model", "MaterialModel", $this->db);
		$resultJson = $materialModel->getMaterialList($form);
		// 資料のjsonデータを画面に返す
		echo $resultJson;
		exit;
	}
	
	/**
	 * 資料共有のキャンバスを削除する
	 */
	public function deleteCanvasMaterialAction() {
		// 操作ログ
		$this->setLog("資料共有のキャンバスデータの削除", json_encode($this->_getAllParams()));
		$form = $this->_getAllParams();
		// モデル宣言
		$materialModel = Application_CommonUtil::getInstance("model", "MaterialModel", $this->db);
		$resultJson = $materialModel->deleteCanvasMaterial($form);
		// 資料のjsonデータを画面に返す
		echo $resultJson;
		exit;
	}
	
	/**
	 * 資料を保存する
	 * ページ変更やビデオ表示時の保存処理
	 */
	public function saveMaterialAction(){
		// 操作ログ
		$this->setLog("資料の一時保存", json_encode($this->_getAllParams()));
		$form = $this->_getAllParams();
		// モデル宣言
		$materialModel = Application_CommonUtil::getInstance("model", "MaterialModel", $this->db);
		$materialModel->saveMaterial($form);
		echo "1";
		exit;
	}
	
	/**
	 * 資料をダウンロードする
	 */
	public function downloadDocumentAction(){
		// 操作ログ
		$this->setLog("ダウンロード用の資料を作成", json_encode($this->_getAllParams()));
		$form = $this->_getAllParams();
		// モデル宣言
		$materialModel = Application_CommonUtil::getInstance("model", "MaterialModel", $this->db);
		$pdfFilePath = $materialModel->createDocumentPdf($form);
		if($pdfFilePath){
			// 出力するファイル名
			$pdfFileName = "document_".date("Ymdhis").".pdf";
			// ダウンロードするダイアログを出力
			header("Content-Disposition: attachment; filename={$pdfFileName}");
			// ファイルを読み込んで出力
			readfile($pdfFilePath);
		}
		exit;
	}
	/**
	 * 資料をアップロードする
	 */
	public function uploadMaterialAction(){
		// 操作ログ
		$this->setLog("資料データのアップロード", json_encode($this->_getAllParams()));
		$form = $this->_getAllParams();
		// モデル宣言
		$materialModel = Application_CommonUtil::getInstance("model", "MaterialModel", $this->db);
		$result = $materialModel->uploadMaterial($form);
		echo json_encode($result);
		exit;
	}
	/**
	 * 商談結果テンプレリストを取得
	 */
	public function getNegotiationTmplListAction(){
		$tmpl_init["template_id"] = 0;
		$tmpl_init["template_name"] = "初期値";
		$tmpl_init["result_list"] = json_encode(array("ヨミ","ナシ"));
		$tmpl_init["next_action_list"] = json_encode(array("オンライン商談","訪問"));
		// 操作ログ
		$this->setLog("商談結果テンプレリストを取得", json_encode($this->_getAllParams()));
		$form = $this->_getAllParams();
		// モデル宣言
		$adminModel = Application_CommonUtil::getInstance("model", "AdminModel", $this->db);
		$result = $adminModel->getNegotiationTmplListAll($form);
		$merged = array_merge(array($tmpl_init), $result);
		echo json_encode($merged);
		exit;
	}
	/**
	 * 名刺表示用情報取得
	 */
	public function getStaffNamecardAction(){
		// 操作ログ
		$this->setLog("スタッフ名刺情報を取得", json_encode($this->_getAllParams()));
		$form = $this->_getAllParams();
		// モデル宣言
		$adminModel = Application_CommonUtil::getInstance("model", "AdminModel", $this->db);
		$result = $adminModel->getStaffNamecard($form);
		echo json_encode($result);
		exit;
	}
	
	
	/**
	 * 商談ルームに入室しているメンバーを取得
	 */
	public function getRoomMemberCountAction(){
		// 操作ログ
		$this->setLog("商談ルームに入室しているメンバーを取得", json_encode($this->_getAllParams()));
		$form = $this->_getAllParams();
		// モデル宣言
		$commonModel = Application_CommonUtil::getInstance("model", "CommonModel", $this->db);
		// ルームに入室しているメンバー数を取得
		$roomMemberCount = $commonModel->getRoomMemberCount($form);
		// カウントを返す
		echo $roomMemberCount;
		exit;
	}
	
	/**
	 * ホワイトボードを同期するためにサーバーに保存する処理
	 */
	public function syncWhiteBoardAction(){
		// 操作ログ
		$this->setLog("ホワイトボードの同期用保存処理", json_encode($this->_getAllParams()));
		$form = $this->_getAllParams();
		// モデル宣言
		$materialModel = Application_CommonUtil::getInstance("model", "MaterialModel", $this->db);
		$pdfFilePath = $materialModel->syncWhiteBoard($form);
		echo "1";
		exit;
	}
	
	public function chackCanvasImgAction(){
		// 操作ログ
		$this->setLog("キャンバス画像の存在チェック理", json_encode($this->_getAllParams()));
		$form = $this->_getAllParams();
		// モデル宣言
		$materialModel = Application_CommonUtil::getInstance("model", "MaterialModel", $this->db);
		$result = $materialModel->chackCanvasImg($form);
		echo $result;
		exit;
	}
	public function getEmptyUserId($connectionInfo) {
		$empty_fields = array(
			'user_peer_id_1' => 1,
			'user_peer_id_2' => 2,
			'user_peer_id_3' => 3,
			'user_peer_id_4' => 4,
			'user_peer_id_5' => 5,
			'user_peer_id_6' => 6,
			'user_peer_id_7' => 7,
			'user_peer_id_8' => 8,
		);
		
		foreach($empty_fields as $key => $val) {
			if(empty($connectionInfo[$key])) {
				return $val;
			}
		}
		return 0;
	}
	/**
	 * 連携サイトドメイン:0以外
	 * meetinドメイン:0
	 */
	public function getCollaborationSiteId($servername) {
		$site_id = 1;
		foreach(self::COLLABO_SITES as $site=>$urls) {
			foreach($urls as $url) {
				if($url == $servername) {
					return $site_id;
				}
			}
			$site_id++;
		}
		return 0;
	}

	/**
	 * 商談ルームURLから遷移してくるアクション
	 * ※URL直入力時
	 */
	public function roomAction() {
		// 操作ログ
		$this->setLog("ルーム入室・作成", json_encode($this->_getAllParams()));
		$form = $this->_getAllParams();

		// ルーム名の指定がないことはありえないので、NULL,""(空),'null'は処理しない
		if( empty($form["room_name"]) || $form["room_name"]=='null' ) {
			error_log("roomAction 処理なし room_name=[".$form["room_name"]."]\n", 3, "/var/tmp/negotiation.log");
			exit;
		}

		// ルーム名チェック
		// ルーム名は半角英数字、アンダーバー(_)、ハイフン(-)の32文字
		if( !preg_match('/^[0-9a-zA-Z\-_]{1,32}$/', $form["room_name"], $room_name) ) {
			error_log("roomAction ルーム名エラー room_name=[".$form["room_name"]."]\n", 3, "/var/tmp/negotiation.log");
			// 処理結果を返す(エラー画面表示)
//			$this->_redirect('?error=3&room='.$form["room_name"]);
			$this->_redirect('/exception/error?error=3');
			exit;
		}

		// モデル宣言
		$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);
		$commonModel = Application_CommonUtil::getInstance("model", "CommonModel", $this->db);

		$collabo_site = $this->getCollaborationSiteId($_SERVER["SERVER_NAME"]);

		$params = $apiModel->getWebRtcParam();
error_log("★★★ roomAction Start session_id=(". session_id() .")\n", 3, "/var/tmp/negotiation.log");
error_log("roomAction room_name=[".$form["room_name"]."]\n", 3, "/var/tmp/negotiation.log");
error_log("<--- roomAction USER_ID=(". $params["user_id"] .")\n", 3, "/var/tmp/negotiation.log");
error_log("<--- roomAction peer_id=(". $params["peer_id"] .")\n", 3, "/var/tmp/negotiation.log");

		// 初期化
		$connectionInfo = $apiModel->getRoomInfo($form["room_name"], $collabo_site);
error_log("roomAction connectionInfo=[".print_r($connectionInfo, true)."]\n", 3, "/var/tmp/negotiation.log");
		$apiModel->saveWebRtcParam(array(
			'connect_no' => $connectionInfo['connect_no'],
			'connection_info_id' => $connectionInfo['id'],
			'room_name' => $connectionInfo['room_name'],
			'collabo_site' => $collabo_site
		));
		$params = $apiModel->getWebRtcParam();

		/**
		 * 再ログイン判定
		 * ・セッションにユーザID＆ピアIDが存在している場合、DB接続情報のピアIDが
		 * 同じかを確認する。
		 */
		if ( !empty($params["user_id"]) ) {
			// USER_ID あり
			$peer_id = NULL;
			switch($params["user_id"]) {
				case '1':
					$peer_id = $connectionInfo['user_peer_id_1'];
					break;
				case '2':
					$peer_id = $connectionInfo['user_peer_id_2'];
					break;
				case '3':
					$peer_id = $connectionInfo['user_peer_id_3'];
					break;
				case '4':
					$peer_id = $connectionInfo['user_peer_id_4'];
					break;
				case '5':
					$peer_id = $connectionInfo['user_peer_id_5'];
					break;
				case '6':
					$peer_id = $connectionInfo['user_peer_id_6'];
					break;
				case '7':
					$peer_id = $connectionInfo['user_peer_id_7'];
					break;
				case '8':
					$peer_id = $connectionInfo['user_peer_id_8'];
					break;
				default:
					$peer_id = "";
			}
			// ピアIDが異なっている場合、他の人に使用されているため
			// User_IDを再取得するする為、クリア
error_log("roomAction peer_id DB=[". $peer_id ."] params=[". $params["peer_id"] ."]\n", 3, "/var/tmp/negotiation.log");
			if( $peer_id != $params["peer_id"] ) {
error_log("roomAction user_id クリア \n", 3, "/var/tmp/negotiation.log");
				$apiModel->saveWebRtcParam(array('user_id' => ''));
				$params = $apiModel->getWebRtcParam();
			}
		}

		/**
		 * ルーム入室
		 */
		if ( empty($params["user_id"]) ) {	// USER_ID なし
			$clearCnt = $apiModel->clearConnectionInfoPeerId($connectionInfo['id']);
			$connectionInfo = $apiModel->getRoomInfo($form["room_name"], $collabo_site);

			// ルーム入室チェック
			// 入室可能な場合は、enterRoom内でPeerId予約 ('X')
			$result = $apiModel->enterRoom($connectionInfo, $collabo_site);
error_log("roomAction ルーム入室チェック結果 (".$result.")!!\n", 3, "/var/tmp/negotiation.log");
			switch( $result ) {
				case	-1:	// ルームロック
					// 処理結果を返す(エラー画面表示)
//				$this->_redirect('?room='.$form["room_name"].'&error=2');
error_log("roomAction ERROR=2 \n", 3, "/var/tmp/negotiation.log");
					$this->_redirect('/exception/error?error=2');
					exit;
				case	-2:	// 人数オーバー
					// 処理結果を返す(エラー画面表示)
//				$this->_redirect('?room='.$form["room_name"].'&error=1');
error_log("roomAction ERROR=1 \n", 3, "/var/tmp/negotiation.log");
					$this->_redirect('/exception/error?error=1');
					exit;
				default:	// 入室OK(USER_ID)
error_log("roomAction ルーム入室 !!\n", 3, "/var/tmp/negotiation.log");
				// セッションへ保存し再取得
					$apiModel->saveWebRtcParam(array(
						'is_operator' => 0,
						'user_id' => $result
					));
					$params = $apiModel->getWebRtcParam();
error_log("roomAction USER_ID=[".$params["user_id"]."]\n", 3, "/var/tmp/negotiation.log");
					break;
			} // switch_End 
		}
		else {
			// PeerId予約 (空で埋める)
//error_log("roomAction PeerId予約 USER_ID=[".$params["user_id"]."]\n", 3, "/var/tmp/negotiation.log");
			$connectionInfo = $apiModel->updateConnectionInfoPeerId($params["connection_info_id"], $params["user_id"], 'X', 0);
		}

		$this->view->client_id = $this->user["client_id"];
		$this->view->staff_type = $this->user["staff_type"];
		$this->view->staff_id = $this->user["staff_id"];
		$this->view->connection_info_id = $params["connection_info_id"];
		$this->view->connect_no = $params["connect_no"];
		$this->view->peer_id = $params["peer_id"];
		$this->view->user_id = $params["user_id"];
		$this->view->my_user_info = $params["user_info"];
		$this->view->target_peer_id = $params["target_peer_id"];
		$this->view->is_operator = $params["is_operator"];
		$this->view->screen_type = $params["screen_type"];
		$this->view->wait_connect_table_string = $params["wait_connect_table_string"];
		$this->view->send_bandwidth = $params["send_bandwidth"];
		$this->view->receive_bandwidth = $params["receive_bandwidth"];
		$this->view->room_name = $params["room_name"];
		$this->view->collabo_site = $params["collabo_site"];

		// リファラーホスト(ドメイン)取得
		$referer = $_SERVER['HTTP_REFERER'];
		$url = parse_url($referer);
error_log("roomAction HTTP_REFERER=[".$_SERVER['X-Forwarded-Host']."]\n", 3, "/var/tmp/negotiation.log");
		$this->view->referer_host = $url['host'];

		$this->view->room_locked = "0";	// 初期値(ロームロックはOFF)

		// スタッフタイプが存在している場合は、ログイン済みのオペレータのためオペレータ権限とする
		if( empty($this->user["staff_type"]) == false ) {
			$params["is_operator"] = "1";
			$this->view->is_operator = $params["is_operator"];
			// my_user_info設定
			if(empty($params["user_info"]) && !empty($this->user["staff_name"])) {
				$this->view->my_user_info = $this->user["staff_name"];
			}
		}
		else {
			$params["is_operator"] = "0";
		}
		$apiModel->saveWebRtcParam(array(
			'is_operator' => $params["is_operator"]
		));

		// ゲストの場合はオペレーターの情報を画面に設定する
		if($params["is_operator"] == 0){
			// モデル宣言
			$connectionInfoDao = Application_CommonUtil::getInstance("Dao", "ConnectionInfoDao", $this->db);
			// 接続ナンバーを元にオペレータ情報を取得
			error_log("connection_info_id:".$params["connection_info_id"]);
			$operatorInfo = $connectionInfoDao->getOperatorInfo($params["connection_info_id"]);

			// ゲスト側でクライアントID取得
			$this->view->client_id = "0";
			$this->view->staff_type = "ZZ";
			$this->view->staff_id = "0";

			// 写真
			$profPath = "{$_SERVER['DOCUMENT_ROOT']}/img/profile/{$operatorInfo["staff_type"]}_{$operatorInfo["staff_id"]}.*";
			$profile_image = '';
			foreach(glob($profPath) as $file) {
				if(file_exists($file)) {
					$profile_image = str_replace($_SERVER['DOCUMENT_ROOT'], "", $file);
				}
			}
			if(empty($profile_image)) {
				$profile_image = '/img/no-image.png';
			}
			$operatorInfo["profile_image"] = $profile_image;
			$this->view->user = $operatorInfo;

			// 名刺
			$namecardDict = $operatorInfo;
			// 名刺データの画像パス取得
			$namecardImgPath = "{$_SERVER['DOCUMENT_ROOT']}/img/namecard/{$operatorInfo["staff_type"]}_{$operatorInfo["staff_id"]}_{$operatorInfo["operator_client_id"]}.*";

		} else {
			// 名刺
			$masterClientDao = Application_CommonUtil::getInstance("dao", "MasterClientDao", $this->db);
			$namecardDict = $masterClientDao->getStaffClientNamecardRow($this->user["client_id"], $this->user["staff_type"], $this->user["staff_id"]);
			// 名刺データの画像パス取得
			$namecardImgPath = "{$_SERVER['DOCUMENT_ROOT']}/img/namecard/{$this->user["staff_type"]}_{$this->user["staff_id"]}_{$this->user["client_id"]}.*";
		}
		foreach(glob($namecardImgPath) as $file){
			if(is_file($file)){
				$imgpath = str_replace($_SERVER['DOCUMENT_ROOT'], "", $file);
				$namecardDict['ImgPath'] = $imgpath;
			}
		}
		// 名刺表示フラグのチェック
		if (($namecardDict["namecard_name_public_flg"] == 0) &&
				($namecardDict["namecard_meetin_public_flg"] == 0) &&
				($namecardDict["namecard_client_name_public_flg"] == 0) &&
				($namecardDict["namecard_email_public_flg"] == 0) &&
				($namecardDict["namecard_picture_public_flg"] == 0) &&
				($namecardDict["namecard_card_public_flg"] == 0) &&
				($namecardDict["namecard_department_public_flg"] == 0) &&
				($namecardDict["namecard_executive_public_flg"] == 0) &&
				($namecardDict["namecard_address_public_flg"] == 0) &&
				($namecardDict["namecard_tel_public_flg"] == 0) &&
				($namecardDict["namecard_cell_public_flg"] == 0) &&
				($namecardDict["namecard_fax_public_flg"] == 0) &&
				($namecardDict["namecard_facebook_public_flg"] == 0) &&
				($namecardDict["namecard_sns_public_flg"] == 0) &&
				($namecardDict["namecard_free1_public_flg"] == 0) &&
				($namecardDict["namecard_free2_public_flg"] == 0)) {
			$namecardDict["namecard_private"] = 1;
		}

		// ビデオフレームのアイコン画像
		// 写真
		$profPath = "{$_SERVER['DOCUMENT_ROOT']}/img/profile/{$this->user["staff_type"]}_{$this->user["staff_id"]}.*";
		$profile_image = '';
		foreach(glob($profPath) as $file) {
			if(file_exists($file)) {
				$profile_image = str_replace($_SERVER['DOCUMENT_ROOT'], "", $file);
			}
		}
		if(empty($profile_image)) {
			$profile_image = '/img/icon_face.png';
		}		
		$this->view->video_background_image = $profile_image;
		
		$this->view->namecard = $namecardDict;
		
		// WebRTCが使えないときの画面共有
		// 画面を共有する人が自分の画面共有表示領域をキャプチャし、画像ファイルをサーバーにアップロードする
		// phpではまずフォルダを作る
		$this->config = Zend_Registry::get('config');
		$screenCaptureDir = $this->config->screen_capture->path . "screen_capture_".$params["connection_info_id"];
		if(!file_exists($screenCaptureDir)){
			// フォルダが存在しなければ作成する
			mkdir($screenCaptureDir, 0777);
		}
	}

	/**
	 * 商談ルームURLから遷移してくるアクション
	 * ※URL直入力時
	 */
	public function getUserIdAction() {
		// 操作ログ
		$this->setLog("ユーザID・取得", json_encode($this->_getAllParams()));
		$form = $this->_getAllParams();

		// 戻り値の宣言
		$result = array("status"=>0);

		// モデル宣言
		$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);
		$params = $apiModel->getWebRtcParam();

		$result["user_id"] = $params["user_id"];
		$result["status"] = 1;

		// 処理結果を返す
		echo json_encode($result);
		exit;
	}

	/**
	 * 商談ロームロック情報設定
	 * set-negotiation-room-state
	 */
	public function setNegotiationRoomStateAction(){
		// 操作ログ
		$this->setLog("商談ロームロック情報設定", json_encode($this->_getAllParams()));
//error_log("setNegotiationRoomStateAction[".json_encode($this->_getAllParams())."]\n");

		$form = $this->_getAllParams();
		$connection_info_id = $form["connection_info_id"];
		$room_state = $form["room_state"];

		$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);
		$count = $apiModel->updateConnectionInfoRoomState($connection_info_id, $room_state);

		// 処理結果を返す
		echo json_encode($count);
//error_log("setNegotiationRoomStateAction result[".json_encode($count)."]\n");
		exit;
	}

	/**
	 * 商談ローム入室可能判定
	 * allowed-enter-room
	 * 0: 入室OK
	 * 1: 人数オーバー
	 * 2: ロック状態
	 */
	public function allowedEnterRoomAction(){
		$result = array('result' => 0);
		// 操作ログ
		$this->setLog("商談ローム入室可能判定", json_encode($this->_getAllParams()));
		$form = $this->_getAllParams();

		// モデル宣言
		$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);
		$commonModel = Application_CommonUtil::getInstance("model", "CommonModel", $this->db);

		$collabo_site = $this->getCollaborationSiteId($_SERVER["SERVER_NAME"]);
		$connectionInfo = $apiModel->getRoomInfo($form["room_name"], $collabo_site);
		if($connectionInfo["room_state"] == "1") {
			$result['result'] = 2;
		} else {
			$count = 0;
			foreach($connectionInfo as $key=>$val) {
				if(preg_match("/^user_peer_id_\d+$/", $key) ) {
					if(!is_null($val)) {
						$count++;
					}
				}
			}
			$config = new Zend_Config_Ini(APP_DIR . 'configs/system.ini', "production");
			if( $count >= $config->meet->room->connectMaxCount ) {
				$result['result'] = 1;
			}
		}
		echo json_encode(json_encode($result));
		exit;
	}

	/**
	 * チャットメッセージを登録
	 * connection_info_id
	 * user_id
	 * uuid
	 * messages
	 */
	public function registChatMessageAction(){
		$result = array('result' => 0);

		// 操作ログ
		$this->setLog("チャットメッセージ登録", json_encode($this->_getAllParams()));
		$form = $this->_getAllParams();

error_log("addChatMessageAction room_name=[".$form["connection_info_id"]."]\n", 3, "/var/tmp/negotiation.log");
error_log("addChatMessageAction user_id=[".$form["user_id"]."]\n", 3, "/var/tmp/negotiation.log");
error_log("addChatMessageAction UUID=[".$form["uu_id"]."]\n", 3, "/var/tmp/negotiation.log");
error_log("addChatMessageAction messages=[".$form["messages"]."]\n", 3, "/var/tmp/negotiation.log");

		// モデル宣言
		$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);
		$chatDetailModel = Application_CommonUtil::getInstance("model", "ChatDetailModel", $this->db);

		$connectionInfo = $apiModel->getConnectionInfo($form["connection_info_id"]);
error_log("addChatMessageAction connectionInfo=[".$connectionInfo."]\n", 3, "/var/tmp/negotiation.log");
		if( $connectionInfo != NULL ) {
			$chatDetail = $chatDetailModel->createChatDetail($connectionInfo, $form["user_id"], $form["uu_id"], $form["messages"]);
			if( $chatDetail != null ) {
				$result['result'] = 1;
			}
error_log("addChatMessageAction $result=[".$result['result']."]\n", 3, "/var/tmp/negotiation.log");
		}

		// 処理結果を返す
		echo json_encode($result);
		exit;
	}
	/**
	 * チャットメッセージを取得する
	 * connection_info_id
	 */
	public function getChatMessageListAction(){
		// 操作ログ
		$this->setLog("チャットメッセージ一覧取得", json_encode($this->_getAllParams()));
		$form = $this->_getAllParams();

		// モデル宣言
		$chatDetailModel = Application_CommonUtil::getInstance("model", "ChatDetailModel", $this->db);
		$resultJson = $chatDetailModel->getChatDetail($form["connection_info_id"]);

		// jsonデータを画面に返す
		echo $resultJson;
		exit;
	}

}
