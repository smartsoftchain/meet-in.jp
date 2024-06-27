<?php
require_once APP_DIR.'/models/Adapter/AuthAdapter.php';

class NegotiationController extends AbstractController
{
	const AUTH_AA     = "AA";		// アイドマアカウント
	const AUTH_CE     = "CE";		// アイドマアカウント
	const ROOM_MODE_1 = 1;		// 通常ユーザー（未使用だが、後々の分岐の存在を考慮し定義のみ行う）
	const ROOM_MODE_2 = 2;		// 同席ユーザー
	const IDENTIFIER  = "notification";

	public function init()
	{
		parent::init();
		/* Initialize action controller here */
	}

	public function negotiationAction()
	{
		$form = $this->_getAllParams();
		// 操作ログ
		$this->setLog("商談中画面表示", json_encode($form));

		$this->config = Zend_Registry::get('config');
		$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);
		$params = $apiModel->getWebRtcParam();

		$this->_logger->info("商談開始：".json_encode($form));

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
		# 電子契約クレデンシャル
		// セッションを取得
		$session = Application_CommonUtil::getSession('e_contract_api');
		$this->view->e_contract_credential = $session->credential;

		//		$this->view->room_locked = "0";	// 初期値(ロームロックはOFF)
		$this->view->room_locked = $params["room_state"];	// 初期値(DB)
		$this->_logger->debug("negotiationAction room_state=[".$params["room_state"]."]");

		// スタッフタイプが存在している場合は、ログイン済みのオペレータのためオペレータ権限とする
		if (empty($this->user["staff_type"]) == false) {
			$params["is_operator"] = "1";
			$this->view->is_operator = $params["is_operator"];
		} else {
			$params["is_operator"] = "0";
		}

		// ゲストの場合はオペレーターの情報を画面に設定する
		if ($params["is_operator"] == 0) {
			// モデル宣言
			$connectionInfoDao = Application_CommonUtil::getInstance("Dao", "ConnectionInfoDao", $this->db);
			// 接続ナンバーを元にオペレータ情報を取得
			$this->_logger->info("connection_info_id:".$params["connection_info_id"]);
			$operatorInfo = $connectionInfoDao->getOperatorInfo($params["connection_info_id"]);

			// ゲスト側のID設定
			$this->view->client_id = "0";
			$this->view->staff_type = "ZZ";
			$this->view->staff_id = "0";

			// 写真
			$profPath = "{$_SERVER['DOCUMENT_ROOT']}/img/profile/{$operatorInfo["staff_type"]}_{$operatorInfo["staff_id"]}.*";
			$profile_image = '';
			foreach (glob($profPath) as $file) {
				if (file_exists($file)) {
					$profile_image = str_replace($_SERVER['DOCUMENT_ROOT'], "", $file);
				}
			}
			if (empty($profile_image)) {
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
		foreach (glob($namecardImgPath) as $file) {
			if (is_file($file)) {
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
		foreach (glob($profPath) as $file) {
			if (file_exists($file)) {
				$profile_image = str_replace($_SERVER['DOCUMENT_ROOT'], "", $file);
			}
		}
		if (empty($profile_image)) {
			$profile_image = '/img/icon_face.png';
		}
		$this->view->video_background_image = $profile_image;

		$this->view->namecard = $namecardDict;

		// WebRTCが使えないときの画面共有
		// 画面を共有する人が自分の画面共有表示領域をキャプチャし、画像ファイルをサーバーにアップロードする
		// phpではまずフォルダを作る
		$screenCaptureDir = $this->config->screen_capture->path . "screen_capture_".$params["connection_info_id"];
		if (!file_exists($screenCaptureDir)) {
			// フォルダが存在しなければ作成する
			mkdir($screenCaptureDir, 0777);
		}
	}

	public function negotiationEditAction()
	{
		$this->_loginCheck();
		$form = $this->_getAllParams();
		$request = $this->getRequest();
		//		$this->setLog("接続履歴詳細", json_encode($form));
		$this->setLog("接続履歴詳細", "");

		// モデル宣言
		$BDResultModel = Application_CommonUtil::getInstance("model", "BusinessDiscussionResultModel", $this->db);
		$result = $BDResultModel->BDResultEdit($form, $request);
		if ($result["registCompleteFlg"] == 1 || empty($result["BDRDict"])) {
			// 登録完了の場合
			$this->_redirect('/negotiation/negotiation-list');
		}
		$this->view->BDRDict = $result["BDRDict"];
		$this->view->errorList = $result["errorList"];
	}

	/**
	 * 退室時に 対話を記録する.
	 */
	public function negotiationRegistAction()
	{
		$this->_loginCheck();
		$form = $this->_getAllParams();
		$request = $this->getRequest();

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
		if (!empty($connection_info_id) && !empty($user_id)) {
			$this->_logger->debug("ログインフラグOFF connection_info_id=(".$connection_info_id.") user_id=(".$user_id.")");
			$count = $apiModel->updateConnectionInfoLogin($connection_info_id, $user_id, "0");
		}
		// ルームロックOFF
		if (!empty($connection_info_id)) {
			$this->_logger->debug("ルームロックOFF connection_info_id=(".$connection_info_id.")");
			$count = $apiModel->updateConnectionInfoRoomStateOff($connection_info_id);
		}

		if (isset($_SESSION['room_in'])) {
			unset($_SESSION['room_in']);
		}
		$this->_logger->debug("negotiationRegistAction result=(".$result["registCompleteFlg"].")");
		if ($result["registCompleteFlg"] == 1) {
			// 登録完了の場合
			$this->_redirect('/index/menu');
		}
	}

	public function negotiationFinishAction()
	{
	}

	/**
	 * 接続履歴一覧
	 */
	public function negotiationListAction()
	{
		$this->_loginCheck();
		$form = $this->_getAllParams();
		// 操作ログ
		$this->setLog("接続履歴一覧", json_encode($form));

		if (!empty($this->user["client_id"])) {
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
		} else {
			// クライアントが選択されていなければ不正な遷移
			$this->_redirect('/client/list');
		}
	}

    /**
     * 録画データの一覧.
     */
    public function negotiationVideoListAction()
    {
        $this->_loginCheck();

		if ($this->user["client_id"] != "1" && (!in_array($staffLogin['staff_type'], [self::AUTH_AA, self::AUTH_CE]))) {
			$this->_redirect('/index/menu');
		}

        $form = $this->_getAllParams();

        // 操作ログ
        $this->setLog("録画履歴一覧", json_encode($form));

        if (!empty($this->user["client_id"])) {
            // モデル宣言
            $BDResultModel = Application_CommonUtil::getInstance("model", "BusinessDiscussionResultModel", $this->db);
            // 画面表示に必要なデータを取得
            $result = $BDResultModel->getBDResultVideoList($form, $this->namespace);
            // smartyにデータを設定する
            $this->view->list = $result["list"];
            $this->view->count = $result["count"];
            $this->view->BDResultListIds = $result["BDResultListIds"];
            $this->view->searchType = $this->namespace->searchType;
            if (array_key_exists("srt", $form)) {
                $this->view->srt = $form["srt"];
            } else {
                $this->view->srt = "";
            }
        } else {
            // クライアントが選択されていなければ不正な遷移
            $this->_redirect('/client/list');
        }
    }


	/**
	 * 接続履歴CSVダウンロード
	 */
	public function downloadCsvAction()
	{
		$this->_loginCheck();

		// 操作ログ
		$this->setLog("接続履歴ダウンロード", json_encode($this->_getAllParams()));
		$form = $this->_getAllParams();

		$BDResultModel = Application_CommonUtil::getInstance("model", "BusinessDiscussionResultModel", $this->db);
		$companyName = $BDResultModel->getCsvCompanyName($form);

		// CSVデータを取得する
		$csvData = $BDResultModel->getCsvResult($form);

		// ファイル名を設定
		if (empty($companyName)) {
			$fileName = date('Y-m-d').'【接続履歴】'.".csv";
		} else {
			$fileName = date('Y-m-d').'_'.$companyName.'【接続履歴】'.".csv";
		}

		// 文字コードをSJISに変換
		$userAgent = $_SERVER['HTTP_USER_AGENT'];
		if(strpos($userAgent,'iPad') && strpos($userAgent,'iPhone')){
		} else if (strpos($userAgent,'Mac') && strpos($userAgent,'Safari')) {
			// iPad　iOS13以上のデスクトップ表示対策
		} else {
			// iPad以外はsjisに変換する
			$csvData = mb_convert_encoding($csvData, 'sjis-win', 'UTF-8');
		}

		header('Pragma: public');
		$this->getResponse()
			->setHeader('Content-disposition', 'attachment; filename*=UTF-8\'\'' . rawurlencode($fileName))
			->setHeader('Content-type', 'test/x-csv')
			->sendHeaders();

		$this->getResponse()->appendBody($csvData);
		$this->getResponse()->outputBody();

		exit;
	}

	/**
	 * 削除の共通処理
	 */
	public function negotiationDeleteAction()
	{
		$this->_loginCheck();
		$form = $this->_getAllParams();
		$request = $this->getRequest();
		// モデル宣言
		$BDResultModel = Application_CommonUtil::getInstance("model", "BusinessDiscussionResultModel", $this->db);
		$result = $BDResultModel->BDResultDelete($form, $request);
		//		echo $result;
		if ($result == 1) {
			// 登録完了の場合
			$this->_redirect('/negotiation/negotiation-list');
		}
	}

	/**
	 * PDF出力する機能
	 */
	public function downloadShareMemoPdfAction()
	{
		// POSTデータの読み込み
		$form = $this->_getAllParams();
		// pdfモジュールの読み込み
		require_once ROOT.'library/Pdf/japanese.php';
		// A4サイズのPDF文書を準備
		$pdf = new PDF_Japanese('P', 'pt', 'A4');
		$pdf->AddSJISFont();
		// ページ、フォント、描画位置を設定
		$pdf->addPage();
		$pdf->setFont('SJIS', '', 10);
		$pdf->setXY(28, 20);

		// ■修正 2017/10/02
		//   POSTパラメータは取得時にすでにデコードされているため、urldecodeは不要
		//   自動改行のため、半角英数を全角英数に変換する。
		//   自動改行を行うためMultiCell()へ変更
		//
		//		// 文字列をSJISに変換するsjis関数
		//		$str = mb_convert_encoding(urldecode($form["shareMemo"]), 'SJIS', 'auto');
		//		// 半角英数を全角整数に変換する
		//		$str = mb_convert_kana($str, "AS", "SJIS");

		/**
		 * 共有メモ整形処理
		 */
		$this->_logger->debug("downloadShareMemoPdfAction From=[".$form["shareMemo"]. "]");
		// 行(改行)別にデータを分割
		$array  = explode("\n", $form["shareMemo"]);
		foreach ($array as $rec) {
			$str="";
			// 文字列をSJISに変換するsjis関数
			$str = mb_convert_encoding($rec, 'SJIS', 'auto');
			$str = mb_convert_kana($str, "AS", "SJIS");
			// 文字列を描画
			$pdf->MultiCell(550, 20, $str, 0, 'L', 0);
		}

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
	public function downloadWhiteBoardAction()
	{
		// 操作ログ
		$this->_logger->info("ホワイトボードダウンロード::". json_encode($this->_getAllParams()));
		//		$this->setLog("ホワイトボードダウンロード", json_encode($this->_getAllParams()));
		$this->setLog("ホワイトボードダウンロード", '');

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
	public function getModalMaterialListAction()
	{
		// 操作ログ
		$this->_logger->info("モーダル用資料一覧取得::". json_encode($this->_getAllParams()));
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
	 * 音声文字起こしファイル一覧画面を表示する
	 */
	public function negotiationTextListAction()
	{
		if (is_null($this->user)) {
			$this->_redirect('/client/list');
		}

		$form = $this->_getAllParams();
		// モデル宣言
		$getAudioModel = Application_CommonUtil::getInstance("model", "GetAudioModel", $this->db);
		$result = $getAudioModel->getTextList($form, $this->namespace);



		$this->view->list = $result["list"];
		// $this->view->data = $result["data"];
		$this->view->freeWord = $this->namespace->free_word;
	}

	/**
	 * 音声文字起こしファイルの詳細表示
	 */
	public function negotiationTextDetailAction()
	{
		if (is_null($this->user)) {
			$this->_redirect('/client/list');
		}

		$form = $this->_getAllParams();
		// モデル宣言
		$getAudioModel = Application_CommonUtil::getInstance("model", "GetAudioModel", $this->db);
		$result = $getAudioModel->getTextDetail($form);
		$this->view->data = $result;
	}

	/**
	 * 音声文字起こしファイルの編集
	 */
	public function negotiationTextEditAction()
	{
		$form = $this->_getAllParams();
		// モデル宣言
		$getAudioModel = Application_CommonUtil::getInstance("model", "GetAudioModel", $this->db);
		$result = $getAudioModel->getTextEdit($form);
		$this->_redirect('negotiation/negotiation-text-detail?id='.$form["id"]);
	}

	/**
	 * 音声文字起こしファイルダウンロード
	 */
	public function downloadAction()
	{
		$id = $_GET['id'];
		// モデル宣言
		$getAudioModel = Application_CommonUtil::getInstance("model", "GetAudioModel", $this->db);
		$result = $getAudioModel->downloadTextFile($id, $this->namespace);
		echo json_encode($result);
		exit;
	}

	/**
	 * 文字起こししたファイルを削除する
	 */
	public function deleteAudioTextAction()
	{
		$form = $this->_getAllParams();
		$request = $this->getRequest();
		$result = array();
		$getAudioModel = Application_CommonUtil::getInstance("model", "GetAudioModel", $this->db);
		$result = $getAudioModel->deleteAudioText($form, $request);
		echo json_encode($result);
		exit;
	}

	/**
	 * 資料共有のモーダルで選択した資料を取得する
	 */
	public function getMaterialAction()
	{
		// 操作ログ
		$this->_logger->info("資料共有用のデータ取得::". json_encode($this->_getAllParams()));
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
	public function getMaterialListAction()
	{
		// 操作ログ
		$this->_logger->info("資料共有用のデータ取得::". json_encode($this->_getAllParams()));
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
	public function deleteCanvasMaterialAction()
	{
		// 操作ログ
		$this->_logger->info("資料共有のキャンバスデータの削除::". json_encode($this->_getAllParams()));
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
	public function saveMaterialAction()
	{
		// 操作ログ
		$this->_logger->info("資料の一時保存::". json_encode($this->_getAllParams()));
		//		$this->setLog("資料の一時保存", json_encode($this->_getAllParams()));
		$this->setLog("資料の一時保存", '');

		$form = $this->_getAllParams();
		// モデル宣言
		$materialModel = Application_CommonUtil::getInstance("model", "MaterialModel", $this->db);
		$materialModel->saveMaterial($form);
		echo "1";
		exit;
	}

	/**
	 * 資料のテキスト入力を取得する.
	 * negotiation/load-document-text-data
	 */
	public function loadDocumentTextDataAction()
	{

		$form = $this->_getAllParams();

		// モデル宣言
		$materialModel = Application_CommonUtil::getInstance("model", "MaterialModel", $this->db);
		$result = $materialModel->loadMaterialTextInput($form);
		echo json_encode($result);
		exit;
	}



	/**
	 * 資料のテキスト入力を保存する.
	 * negotiation/save-document-text-data
	 */
	public function saveDocumentTextDataAction()
	{

		$form = $this->_getAllParams();

		// モデル宣言
		$materialModel = Application_CommonUtil::getInstance("model", "MaterialModel", $this->db);
		$result = $materialModel->saveMaterialTextInput($form);
		echo json_encode($result);
		exit;
	}


	/**
	 * 資料のテキスト入力を保存する.
	 * negotiation/remove-document-text-data
	 */
	public function removeDocumentTextDataAction()
	{

		$form = $this->_getAllParams();

		// モデル宣言
		$materialModel = Application_CommonUtil::getInstance("model", "MaterialModel", $this->db);
		$result = $materialModel->removeMaterialTextInput($form);
		echo json_encode(['result' => $result]);
		exit;
	}

	/**
	 * 資料のテキスト入力を保存する.
	 * negotiation/remove-document-text-page-data
	 */
	public function removeDocumentTextPageDataAction()
	{

		$form = $this->_getAllParams();

		// モデル宣言
		$materialModel = Application_CommonUtil::getInstance("model", "MaterialModel", $this->db);
		$result = $materialModel->removeMaterialTextInputPageData($form);
		echo json_encode(['result' => $result]);
		exit;
	}


	/**
    * 資料のダウンロード設定を保存する
    * 資料情報設定ダイアログでのダウンロード設定保存処理
    */
    public function setMaterialDownloadOptionAction()
    {
        $downloadFlags = $_POST['download_flg'];
        $clientIds = $_POST['client_id'];
        $materialTypes = $_POST['material_type'];

        foreach($downloadFlags as $materialId => $downloadFlg) {
            $clientId = $clientIds[$materialId];
            $materialType = $materialTypes[$materialId];
            $targetMaterial = array('material_id' => $materialId, 'material_type' => $materialType, 'download_flg' => $downloadFlg, 'client_id' => $clientId);

			// 操作ログ
            $this->_logger->info("資料のダウンロード表示の設定変更::". json_encode($targetMaterial));
            //		$this->setLog("資料のダウンロード表示の設定変更", json_encode($targetMaterial);
            $this->setLog("資料のダウンロード表示の設定変更", '');
            // モデル宣言
            $materialDao = Application_CommonUtil::getInstance('dao', "MaterialDao", $this->db);
            $this->db->beginTransaction();
            try {
                $materialDao->setMaterial($targetMaterial);
                $this->db->commit();
            } catch(Exception $e) {
                $this->db->rollBack();
                error_log($e->getMessage());
                throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
            }
        }
        echo "1";
        exit;
    }

	/**
	 * 資料をダウンロードする
	 */
	public function downloadDocumentAction()
	{
		// 操作ログ
		$this->_logger->info("ダウンロード用の資料を作成::". json_encode($this->_getAllParams()));
		$this->setLog("ダウンロード用の資料を作成", json_encode($this->_getAllParams()));

		$form = $this->_getAllParams();
		// モデル宣言
		$materialModel = Application_CommonUtil::getInstance("model", "MaterialModel", $this->db);

		try {
			$pdfFilePath = $materialModel->createDocumentPdf($form);
		} catch (Exception $e) {
			$this->_logger->error("ダウンロード用の資料の作成に失敗::". json_encode($e));
			$pdfFilePath = null;
		}
		if ($pdfFilePath) {
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
	public function uploadMaterialAction()
	{
		// 操作ログ
		$this->_logger->info("資料データのアップロード ");
		//		$this->setLog("資料データのアップロード", json_encode($this->_getAllParams()));
		$this->setLog("資料データのアップロード", '');

		$form = $this->_getAllParams();
		// モデル宣言
		$materialModel = Application_CommonUtil::getInstance("model", "MaterialModel", $this->db);
		$result = $materialModel->uploadMaterial($form);

		$this->_logger->info("資料データのアップロード result=(". json_encode($result) .")");
		echo json_encode($result);
		exit;
	}
	/**
	 * 商談結果テンプレリストを取得
	 */
	public function getNegotiationTmplListAction()
	{
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
	public function getStaffNamecardAction()
	{
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
	public function getRoomMemberCountAction()
	{
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
	public function syncWhiteBoardAction()
	{
		// 操作ログ
		//	$this->setLog("ホワイトボードの同期用保存処理", json_encode($this->_getAllParams()));
		$this->setLog("ホワイトボードの同期用保存処理", '');

		$form = $this->_getAllParams();
		// モデル宣言
		$materialModel = Application_CommonUtil::getInstance("model", "MaterialModel", $this->db);
		$pdfFilePath = $materialModel->syncWhiteBoard($form);
		echo "1";
		exit;
	}

	public function chackCanvasImgAction()
	{
		// 操作ログ
		$this->setLog("キャンバス画像の存在チェック理", json_encode($this->_getAllParams()));
		$form = $this->_getAllParams();
		// モデル宣言
		$materialModel = Application_CommonUtil::getInstance("model", "MaterialModel", $this->db);
		$result = $materialModel->chackCanvasImg($form);
		echo $result;
		exit;
	}
	public function getEmptyUserId($connectionInfo)
	{
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

		foreach ($empty_fields as $key => $val) {
			if (empty($connectionInfo[$key])) {
				return $val;
			}
		}
		return 0;
	}

	/**
	 * 商談ルームURL内の状況を取得する.
	 * /negotiation/get-room-current-situation
	 * JSON
	 */
	public function getRoomCurrentSituationAction()
	{
		$form = $this->_getAllParams();

		// モデル宣言
		$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);
		$collabo_site = $this->getCollaborationSiteId($_SERVER["SERVER_NAME"]);
		$result = $apiModel->situationRoom($form, $collabo_site);
		echo json_encode($result);
		exit;
	}

	/**
	 * 商談ルームURL内の状況を取得する.(MCU)
	 * /negotiation/get-room-current-situation-mcu
	 * JSON
	 */
	public function getRoomCurrentSituationMcuAction()
	{
		$form = $this->_getAllParams();
//$this->_logger->info(json_encode($form));
		$result = array(
			'status' => 0,
			'host_exist' => false,
			'room_members' => 0
		);

		// モデル宣言
		$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);
		$collabo_site   = $this->getCollaborationSiteId($_SERVER["SERVER_NAME"]);
		$result = $apiModel->situationRoom($form, $collabo_site);
		$room_members =$this->getMcuRoomsMemberCount($form['room_name']);
		$result['room_members'] = $room_members;
		echo json_encode($result);
		exit;
	}

	/**
	 * 商談ルームとクライアントIDからルームタイプを取得する
	 * と同時に、入力したユーザー名をセッションに入れる
	 * /negotiation/get-negotiation-room-type
	 * JSON
	 */
	public function getNegotiationRoomTypeAction()
	{
		$form = $this->_getAllParams();

		// 入力したユーザー名をセッションに保持する
		$post_data = $_POST["user_name"];
		$_SESSION['user_name'] = $post_data;

		// モデル宣言
		$result = array('status' => 0);
		$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);

		$collabo_site   = $this->getCollaborationSiteId($_SERVER["SERVER_NAME"]);
		$result = $apiModel->getNegotiationRoomTypeByClient($form, $this->user["client_id"], $collabo_site);

		// $this->_logger->info("getNegotiationRoomTypeAction result=(". print_r($result,true) .")");
		if( $result['data']['negotiation_room_type'] == '1' ) {
			// MCUの場合のみMCUサーバ上のルーム情報を初期化
			$this->deleteMcuRooms();
			$result = $apiModel->getNegotiationRoomTypeByClient($form, $this->user["client_id"], $collabo_site);
		}

		$this->_logger->info("getNegotiationRoomTypeAction negotiation_room_type=(". $result['data']['negotiation_room_type'] .")");
		echo json_encode($result);
		exit;
	}

	/**
	 * ロックされた部屋に入室したい場合 room内に入室許可依頼を出す
	 * /negotiation/request-enter-locked-room
	 */
	public function requestEnterLockedRoomAction() {

		$request = $this->getRequest();
		if(!$request->isPost()) {
			echo json_encode(['result' => -1]);
			exit;
		}
		$form = $this->_getAllParams();

		$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);
		$collabo_site   = $this->getCollaborationSiteId($_SERVER["SERVER_NAME"]);
		$result = $apiModel->requestEnterLockedRoom($form, $collabo_site);
		echo json_encode(['result' => $result]);
		exit;
	}

	/**
	 * ロックされた部屋に入室許可依頼を依頼したが削除する.
	 * /negotiation/request-remove-locked-room
	 */
	public function requestRemoveLockedRoomAction() {

		$request = $this->getRequest();
		if(!$request->isPost()) {
			echo json_encode(['result' => -1]);
			exit;
		}
		$form = $this->_getAllParams();

		$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);
		$collabo_site   = $this->getCollaborationSiteId($_SERVER["SERVER_NAME"]);
		$result = $apiModel->removeEnterLockedRoom($form, $collabo_site);
		echo json_encode(['result' => $result]);
		exit;
	}


	/**
	 * ロックされた部屋に入室したいユーザがいるかをルームのユーザに渡す.
	 * /negotiation/check-enter-locked-room
	 */
	public function checkEnterLockedRoomAction() {

		$request = $this->getRequest();
		if(!$request->isPost()) {
			echo json_encode(['result' => -1]);
			exit;
		}

		$form = $this->_getAllParams();
		$connectionInfoDao = Application_CommonUtil::getInstance("dao", "ConnectionInfoDao", $this->db);
		$result = $connectionInfoDao->getConnectionInfoUsersWantEnterLockedRoom($form['connection_info_id']);

		echo json_encode(['result' => $result]);
		exit;
	}

	/**
	 * ロックされた部屋に入室したいユーザの審査結果を保存する.
	 * /negotiation/set-enter-locked-room-result
	 */
	public function setEnterLockedRoomResultAction() {

		$request = $this->getRequest();
		if(!$request->isPost()) {
			echo json_encode(['result' => -1]);
			exit;
		}

		$form = $this->_getAllParams();
		$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);
		$result = $apiModel->updateEnterLockedRoom($form);

		echo json_encode(['result' => $result]);
		exit;
	}



	/**
	 * 商談ルームURLから遷移してくるアクション
	 * ※URL直入力時
	 */
	public function roomAction()
	{

		$form = $this->_getAllParams();
		// MEMO.
		// ユーザが 直接入場してきた場合は、待合室を経由させる.
		// ただし、SPの場合は、現行仕様では ロックされている部屋だった場合のみの導線.
		// ※そのうちデバイスの差はなくなると考えていることと、DB操作を1回増やしたくないので 既存処理の途中に割り込みで待合室にリダイレクトするよう突貫工事.
		$is_waiting_redirect = false;
		$waiting_room = "/waiting-room/";
		if($this->getBrowserTypeNew() == 'Firefox') {
			// FireFox以外の場合 (HTTP_REFERER 挙動が良くない).
			// ※ セッション値を確認して 待合室で付けたフラグを確認して判断
			$session = Application_CommonUtil::getSession(self::IDENTIFIER);
			if ($session->isPassWaitingRoom == "1") {
				$session->isPassWaitingRoom  = null;
			} else {
				$is_waiting_redirect = true;
			}
		} else if(!preg_match($waiting_room, $_SERVER['HTTP_REFERER'])) {
			// FireFox以外は HTTP_REFERER で 前ページを確認して 待合室経由かを確認する.
			$is_waiting_redirect = true;
		}
		// MEMO.無条件に待合室に飛ばせるのは 現在はPC版のみ.
		if(!boolval($this->isMobile())) {
			header('Cache-Control: no-cache');
			if($is_waiting_redirect) {
				$this->_redirect(str_replace('/room/', $waiting_room, $_SERVER['REQUEST_URI']));
			}
		}


		// 操作ログ
		$this->setLog("ルーム入室・作成", json_encode($this->_getAllParams()));

		$this->_logger->info("=======  商談開始：======== session_id=(". session_id() .")");

		// 電子契約APIが発行されている場合はフラグを立てる
		$session = Application_CommonUtil::getSession('e_contract_api');
		if ($session->credential) {
			$is_e_conteact_credential = 1;
		}
		if ($session->signImage) {
			$is_e_conteact_sign_image = 1;
		}
		if ($session->certificate) {
			$is_e_conteact_certificate = 1;
		}
		// 電子契約テンプレート取得
		if ($is_e_conteact_credential == 1 && $is_e_conteact_sign_image == 1 && $is_e_conteact_certificate == 1) {
			$eContractApiModel = Application_CommonUtil::getInstance("model", "EContractApiModel", $this->db);

			$documentList = $eContractApiModel->getDocumentAllList();
			$this->view->documentList = $documentList;
		}

		// ルーム名の指定がないことはありえないので、NULL,""(空),'null'は処理しない
		if (empty($form["room_name"]) || $form["room_name"]=='null') {
			$this->_logger->err("roomAction 処理なし room_name=[". $form["room_name"] ."]");
			exit;
		}

		// ルーム名チェック
		// ルーム名は半角英数字、アンダーバー(_)、ハイフン(-)の32文字
		if (!preg_match('/^[0-9a-zA-Z\-_]{8,32}$/', $form["room_name"], $room_name) || !preg_match('/[-|_]/', $form["room_name"], $room_name)) {
			$this->_logger->err("roomAction ルーム名エラー room_name=[". $form["room_name"] ."]");
			// 処理結果を返す(エラー画面表示)
			$this->_redirect('?error=3&room='.$form["room_name"]);
			exit;
		}

		// 同席モードの値チェック
		if (array_key_exists("room_mode", $form) && $form["room_mode"] != self::ROOM_MODE_2) {
			// 処理結果を返す(エラー画面表示) TODO 4は暫定なので後で必ず確認
			$this->_redirect('?error=4&room='.$form["room_name"]);
			exit;
		} else {
			// バリデーションに問題がなければ、ビューに値をセットする
			if (array_key_exists("room_mode", $form)) {
				// 現在の仕様でroom_modeのパラメータが存在する場合は同席モード
				$this->view->room_mode = self::ROOM_MODE_2;
			} else {
				$this->view->room_mode = self::ROOM_MODE_1;
			}
		}

		// ユーザーエージェントで端末、ブラウザ判定し、iOSとAndroidの場合は推奨環境以外はリダイレクト
		$ua = strtolower($_SERVER['HTTP_USER_AGENT']);
		$this->_logger->info("roomAction：UA[". $ua ."]");
		$this->_logger->debug("roomAction：BROWSER[". $this->getBrowserTypeNew() ."]");
		if (strpos($ua, 'iphone') !== false || strpos($ua, 'ipod') !== false || strpos($ua, 'ipad') !== false) {
			// iOSの場合、Safari11以降以外はリダイレクト（SafariにはSafariの他にVersionがあり、ChromeやLINEには無い）
			if (strpos($ua, 'safari') === false || strpos($ua, 'version') === false || strpos($ua, 'edge') !== false || strpos($ua, 'edg')) {
				// line のブラウザの場合は?openExternalBrowser=1 をつけてリダイレクトする。
				if (strpos($_SERVER['HTTP_USER_AGENT'], 'Line') !== false && !isset($form['openExternalBrowser'])) {
					$this->_redirect('/room/'.$form["room_name"].'?openExternalBrowser=1');
					exit;
				}
				// iOSだけどSafariじゃない
				$this->_redirect('/index/deprecated/?room='.$form["room_name"]);
				exit;
			} else {
				// iOSでSafariだけど、バージョンが10以下
				preg_match('/version\/\d+/', $ua, $version);
				$versionNumber = str_replace('version/', '', $version[0]);
				if ($versionNumber < 11) {
					$this->_redirect('/index/deprecated/?room='.$form["room_name"]);
					exit;
				}
			}
		} elseif ((strpos($ua, 'android') !== false)) {
			// Androidの場合、Chrome以外はリダイレクト（ChromeはChromeがあるが、EdgeとOperaにもあるChromeがあるため除外）
			if (strpos($ua, 'chrome') === false || strpos($ua, 'edge') !== false || strpos($ua, 'edg') !== false || strpos($ua, 'opr') !== false || strpos($ua, 'line') !== false || strpos($ua, 'fbav') !== false) {
				// line のブラウザの場合は?openExternalBrowser=1 をつけてリダイレクトする。
				if (strpos($_SERVER['HTTP_USER_AGENT'], 'Line') !== false && !isset($form['openExternalBrowser'])) {
					$this->_redirect('/room/'.$form["room_name"].'?openExternalBrowser=1');
					exit;
				}
				$this->_redirect('/index/deprecated/?room='.$form["room_name"]);
				exit;
			}
		} elseif ($this->getBrowserTypeNew() !== 'Edge'
			  && $this->getBrowserTypeNew() !== 'Firefox'
			  && $this->getBrowserTypeNew() !== 'Chrome'
			  && $this->getBrowserTypeNew() !== 'Safari'
			  && $this->getBrowserTypeNew() !== 'IE') {
			// PC 対象ブラウザ以外は全てリダイレクト
			// SNSへルームURLを張り付けると、クローラからルームURLがリクエストされ、入室処理が行われてしまうため
			// 対象ブラウザ以外は全てリダイレクト(トップ画面へ)する
			$this->_redirect('?room='.$form["room_name"].'&error=10');
			$this->_logger->error("roomAction：BROWSER[". $this->getBrowserTypeNew() ."]");
			exit;
		}

		$this->config = Zend_Registry::get('config');
		// モデル宣言
		$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);

		$this->_logger->info("商談開始：".json_encode($form). "session_id=(". session_id() .")");

		// オートログイン処理(自動ログイン用クッキー情報)
		if (!empty($_COOKIE['auto_login'])) {	// 有り
			$auth = Zend_Auth::getInstance();
			$this->_logger->info("roomAction オートログイン[有り]");

			// 自動ログインKEY取得
			$auto_login_key = $_COOKIE['auto_login'];
			// 自動ログインKEYが正しいかを判定(DBにKEYが存在しない場合は再度ログイン)
			$staffLogin = $this->autoLoginFetch($auto_login_key);
			if (!empty($staffLogin)) {		// DB上にキー有り
				$this->_logger->info("roomAction オートログインDB[有り]");


				// ログイン処理用にidと自動ログインキー追加
				$form['id'] = $staffLogin['staff_type'].$staffLogin['staff_id'];
				$form['auto_login_key'] = $auto_login_key;
				$adapter = new Adapter_AuthAdapter($form);
				$result = $auth->authenticate($adapter);
				// 認証情報へ反映
				$this->user = $auth->getIdentity();
				Zend_Registry::set('user', $this->user);

				/**
				 * クッキー再セット
				 * 一度削除し、再度自動ログイン用のキーを作成する
				 */
				$this->update_auto_login($auto_login_key);

				$header_username = $this->get_header_username($this->user);
				$this->user["header_username"] = $header_username;

				// クライアント選択したクライアントに成り変わる(AAのみ)
				// 注意：上記 auth 情報に値を設定している為、認証情報作成後に本処理を行う事！！
				if ($staffLogin['staff_type'] == self::AUTH_AA) {
					$clientModel = Application_CommonUtil::getInstance("model", "ClientModel", $this->db);
					$result = $clientModel->changeClient($staffLogin['client_id']);
					$this->user["client_id"] = $staffLogin['client_id'];
					$this->user["client_name"] = $result["client_name"];
					$this->user["plan_this_month"] = $result["plan_this_month"];
				}

				if (array_key_exists("client_name", $this->user) && $this->user["client_name"] != "") {
					$clientName = $this->user["client_name"];
					if (mb_strlen($this->user["client_name"], "UTF-8") > 11) {
						$clientName = mb_substr($this->user["client_name"], 0, 10, 'UTF-8')."...";
					}
					$this->user["header_clientname"] = $clientName;
				}

				$this->view->user = $this->user;

				// ログインOKの場合はクッキー(Cookie)へユーザ情報を設定する
				setcookie('client_id', $this->user["client_id"], 0, '/');
				setcookie('staff_type', $this->user["staff_type"], 0, '/');
				setcookie('staff_id', $this->user["staff_id"], 0, '/');
			}
		} else {
			$this->_logger->info("roomAction オートログイン[なし]");
		}

		$collabo_site = $this->getCollaborationSiteId($_SERVER["SERVER_NAME"]);
		$params = $apiModel->getWebRtcParam();

		// 初期化
		$connectionInfo = $apiModel->getRoomInfo($form["room_name"], $collabo_site);

		// ユーザがゲスト(DBにuser情報ナシ)の場合、ルーム内に現在オペレーターがいない場合はトップ画面へ遷移させる.
		if ($this->user == null) {
			// ただし、フリールームに設定されていない場合のみ
			$chkFlg = 1;
			$arrayFreeroom = $this->config->meet->freeroom->toArray();
			if (!empty($arrayFreeroom)) {
				$this->_logger->info("roomAction FreeRoomName=[". print_r($arrayFreeroom, true) ."]");
				foreach ($arrayFreeroom as $key => $value) {
					if ($params["room_name"] == $value) {
						$chkFlg = 0;
						break;
					}
				}
			}
			$this->_logger->info("roomAction chkFlg=[". $chkFlg ."]");
			if ($chkFlg == 1) {
				$connectionInfoDao = Application_CommonUtil::getInstance("dao", "ConnectionInfoDao", $this->db);
				// ログインユーザを調査する(人数が返ってきそうな関数名だが レコードを取得したかnullか).
				$operatorCount = $connectionInfoDao->getOperatorCount($connectionInfo["id"]);
				if (!$operatorCount) {
					$this->_redirect('index/service-end'); // ホスト側のユーザーがルームへアクセスしていない可能性がございます.
				}
			}
		}


		if($is_waiting_redirect && $connectionInfo['room_state'] == "1" && boolval($this->isMobile())) {
			// MEMO. SP版に限り ロックされている場合 待合室へ飛ばす (PC版は無条件で待合室へ送られている為ここまで来ない).
			header('Cache-Control: no-cache');
			$this->_redirect(str_replace('/room/', $waiting_room, $_SERVER['REQUEST_URI']));
		}

		$this->_logger->debug("roomAction connectionInfo=[".print_r($connectionInfo, true)."]");
		// セッションへルームロック(room_state)情報を保存する(2020/04/11)
		$apiModel->saveWebRtcParam(array(
			'connect_no' => $connectionInfo['connect_no'],
			'connection_info_id' => $connectionInfo['id'],
			'room_name' => $connectionInfo['room_name'],
			'room_state' => $connectionInfo['room_state'],
			'collabo_site' => $collabo_site
		));
		$params = $apiModel->getWebRtcParam();

		// ログインしていた場合、最終入室日時を更新
		$auth = Zend_Auth::getInstance();
		$staff = $auth->getIdentity();
		if (isset($staff)) {
			// 最終入室日時を更新する
			$adminModel = Application_CommonUtil::getInstance("model", "AdminModel", $this->db);
			$adminModel->updateEnterRoomDate($staff['staff_type'], $staff['staff_id']);

			$is_mobile = preg_match('/Android|iPhone|iPad|iPod|BlackBerry|IEMobile/i', $_SERVER['HTTP_USER_AGENT']);

			// 契約期限の確認 (空値の場合は 無期限のクライアントと判断し無視する)
			if ($staff['is_expiration']) {
				if ($is_mobile) {
					// mobile
					$this->_redirect('/index/room?room='.$form["room_name"].'&error=4');
				} else {
					// PC
					$this->_redirect('?room='.$form["room_name"].'&error=4');
				}
			}
			// 契約期限の確認 (空値の場合は 無期限のクライアントと判断し無視する)
			if ($staff['is_before_contract']) {
				if ($is_mobile) {
					// mobile
					$this->_redirect('/index/room?room='.$form["room_name"].'&error=5');
				} else {
					// PC
					$this->_redirect('?room='.$form["room_name"].'&error=5');
				}
			}


		}

		/**
		 * 再ログイン判定
		 * ・セッションにユーザID＆ピアIDが存在している場合、DB接続情報のピアIDが
		 * 同じかを確認する。
		 */
		$peer_id = null;
		if (!empty($params["user_id"])) {
			$this->_logger->info("roomAction セッションの user_id=[".$params["user_id"]."]");
			// USER_ID あり
			switch ($params["user_id"]) {
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

			// ピアIDがnull の場合は空き
			// ピアIDが異なっている場合、他の人に使用されているため、user_idをクリア(空->user_id再取得)する
			// ただし、[user_id]がありpeer_idが'X'の場合も予約済みのため、セッションと同じ場合は予約状態のまま、user_idもクリアしない(再接続)
			$this->_logger->info("roomAction peer_id DB=[". $peer_id ."] peer_id(前回:セッション)=[". $params["peer_id"] ."]");
			if ($peer_id != null) {
				if ($peer_id != $params["peer_id"]) {
					$apiModel->saveWebRtcParam(array('user_id' => '')); // user_id 初期化
					$params = $apiModel->getWebRtcParam();
				}
			}
		}
		$this->_logger->info("★roomAction 再ログイン判定 結果 USER_ID=[".$params["user_id"]."]");

		/**
		 * ルーム入室
		 */
		$this->_logger->info("roomAction ルーム入室チェック params=[". $params["peer_id"] ."]");
		// モニタリングモードの状態
		$room_mode_flg = $form["room_mode"] ? 1 : 0;

		if (empty($params["user_id"])) {	// USER_ID なし
			// ルーム入室
			$clearCnt = $apiModel->clearConnectionInfoPeerId($connectionInfo['id']);
			$connectionInfo = $apiModel->getRoomInfo($form["room_name"], $collabo_site);
			$this->_logger->debug("roomAction ルーム入室 (".$clearCnt.")!!");
			$locked_token = isset($form['locked_token']) ? $form['locked_token'] : "";
			$result = $apiModel->enterRoomDefaultRoomRock($connectionInfo, $collabo_site, $room_mode_flg, $locked_token);

			if (empty($clientModel)) {
				$clientModel = Application_CommonUtil::getInstance("model", "ClientModel", $this->db);
			}
			$negotiationAudioTextLimitInfo = $clientModel->getNegotiationAudioTextLimitInformation($this->user["client_id"], $this->user["staff_type"]);
			$negotiationAudioAnalysisLimitInfo = $clientModel->getNegotiationAudioAnalysisLimitInformation($this->user["client_id"], $this->user["staff_type"]);

			switch ($result) {
				case	-1:	// ルームロック
					// 処理結果を返す(エラー画面表示)
					$this->_redirect('?room='.$form["room_name"].'&error=2');
					$this->_logger->notice("roomAction ERROR=2");
					exit;
				case	-2:	// 人数オーバー
					// 処理結果を返す(エラー画面表示)
					if (preg_match('/Android|iPhone|iPad|iPod|BlackBerry|IEMobile/i', $_SERVER['HTTP_USER_AGENT'])) {
						// mobile
						$this->_redirect('/index/room?room='.$form["room_name"].'&error=1');
					} else {
						// PC
						$this->_redirect('?room='.$form["room_name"].'&error=1');
					}
					$this->_logger->notice("roomAction ERROR=1".'room_name=['.$form["room_name"].']');
					exit;
				default:	// 入室OK(USER_ID)
					// セッションへ保存し再取得
					$apiModel->saveWebRtcParam(array(
						'is_operator' => 0,
						'user_id' => $result
					));
					$params = $apiModel->getWebRtcParam();
					$this->_logger->info("roomAction 入室OK USER_ID=[". $params["user_id"] ."]");
					break;
			} // switch_End
		} else {
			// リロード時等
			$this->_logger->info("roomAction USER_ID=[".$params["user_id"]."] staff_id=[". $this->user["staff_id"] ."]");

			if (empty($clientModel)) {
				$clientModel = Application_CommonUtil::getInstance("model", "ClientModel", $this->db);
			}

			$negotiationAudioTextLimitInfo = $clientModel->getNegotiationAudioTextLimitInformation($this->user["client_id"], $this->user["staff_type"]); // ["client_id"]と["staff_type"]ではないか?
			$negotiationAudioAnalysisLimitInfo = $clientModel->getNegotiationAudioAnalysisLimitInformation($this->user["client_id"], $this->user["staff_type"]);

			// 再接続時にログインユーザの場合、ログインフラグをONにする(2020/04/11)
			$login_flg = 0;
			if (!empty($this->user["staff_id"])) {    // ログインユーザか？
				$login_flg = 1;
			}

			if ($peer_id == 'X') {
				// peer_id再設定
				$this->_logger->info("roomAction peer_id 再設定=[". $peer_id ."]");
				$connectionInfo = $apiModel->updateConnectionInfoPeerIdDefaultRoomRock($params["connection_info_id"], $params["user_id"], $params["peer_id"], $login_flg);
			} else {
				// PeerId予約 (空で埋める)
				$this->_logger->info("roomAction PeerId 予約=[X]");
				$connectionInfo = $apiModel->updateConnectionInfoPeerIdDefaultRoomRock($params["connection_info_id"], $params["user_id"], 'X', $login_flg);
				$apiModel->saveWebRtcParam(array('peer_id' => 'X')); // user_id 初期化
				$params = $apiModel->getWebRtcParam();
			}
		}

		$this->_logger->info("roomAction connectionInfo=[".print_r($connectionInfo, true)."]");
		$this->_logger->debug("roomAction3 client_id=(". $this->user['client_id'] .")");
		$this->_logger->debug("roomAction3 staff_type=(". $this->user['staff_type'] .")");
		$this->_logger->debug("roomAction3 staff_id=(". $this->user['staff_id'] .")");
		$this->_logger->debug("roomAction3 plan=(". $this->user['plan'] .")");

		$this->_logger->info("roomAction USER_ID=[". $params["user_id"] ."]");

		$this->view->client_id = $this->user["client_id"];
		$this->view->staff_type = $this->user["staff_type"];
		$this->view->staff_id = $this->user["staff_id"];
		$this->view->plan_this_month = $this->user["plan_this_month"];

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
		$this->view->is_e_conteact_credential = $is_e_conteact_credential;
		$this->view->is_e_conteact_sign_image = $is_e_conteact_sign_image;
		$this->view->is_e_conteact_certificate = $is_e_conteact_certificate;
		$this->view->negotiation_audio_text_lock = $negotiationAudioTextLimitInfo['lock'];
		$this->view->negotiation_audio_text_time_limit_second = $negotiationAudioTextLimitInfo['time_limit_second'];
		$this->view->negotiation_audio_analysis_lock = $negotiationAudioAnalysisLimitInfo['lock'];
		$this->view->negotiation_audio_analysis_time_limit_second = $negotiationAudioAnalysisLimitInfo['time_limit_second'];
		$this->view->connectMaxCount = $this->config->meet->room->connectMaxCount;

		// SPEC. DOCOMOはロックをしている状態が標準.
		if($connectionInfo['room_members'] == 0) {
			// MEMO.
			// この処理周期中にロックをかける為、DBはロック状態だが、変更前に取得した$connectionInfoは未ロック状態になっているし、このユーザの入籍状態.
			// ロック分岐に入らない事が都合がいいのでそのまま表示の帳尻だけ合わせている ().
			$this->view->room_locked = '1';
		} else {
			$this->view->room_locked = $params["room_state"];	// 初期値(DB) 2020/04/11
		}

		$this->_logger->info("roomAction room_state=[". $this->view->room_locked ."]");

		$this->view->remind_record_flg = $staff["remind_record_flg"];

		# 電子契約クレデンシャル
		// セッションを取得
		$session = Application_CommonUtil::getSession('e_contract_api');
		$this->view->e_contract_credential = $session->credential;

		// スタッフタイプが存在している場合は、ログイン済みのオペレータのためオペレータ権限とする
		if (!empty($this->user["staff_type"])) {
			$params["is_operator"] = "1";
			$this->view->is_operator = $params["is_operator"];
			// my_user_info設定
			if (empty($params["user_info"]) && !empty($this->user["staff_name"])) {
				$this->view->my_user_info = $this->user["staff_name"];
			}
		} else {
			$params["is_operator"] = "0";
		}
		$apiModel->saveWebRtcParam(array(
			'is_operator' => $params["is_operator"]
		));

		// ゲストの場合はオペレーターの情報を画面に設定する
		if ($params["is_operator"] == 0) {
			// モデル宣言
			$connectionInfoDao = Application_CommonUtil::getInstance("Dao", "ConnectionInfoDao", $this->db);

			// 接続ナンバーを元にオペレータ情報を取得
			$this->_logger->debug("connection_info_id:".$params["connection_info_id"]);
			$operatorInfo = $connectionInfoDao->getOperatorInfo($params["connection_info_id"]);

			// ゲスト側でクライアントID取得
			$this->view->client_id = "0";
			$this->view->staff_type = "ZZ";
			$this->view->staff_id = "0";


			// 写真
			$profPath = "{$_SERVER['DOCUMENT_ROOT']}/img/profile/{$operatorInfo["staff_type"]}_{$operatorInfo["staff_id"]}.*";
			$profile_image = '';
			foreach (glob($profPath) as $file) {
				if (file_exists($file)) {
					$profile_image = str_replace($_SERVER['DOCUMENT_ROOT'], "", $file);
				}
			}
			if (empty($profile_image)) {
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
		foreach (glob($namecardImgPath) as $file) {
			if (is_file($file)) {
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
		foreach (glob($profPath) as $file) {
			if (file_exists($file)) {
				$profile_image = str_replace($_SERVER['DOCUMENT_ROOT'], "", $file);
			}
		}
		if (empty($profile_image)) {
			$profile_image = '/img/icon_face.png';
		}
		$this->view->video_background_image = $profile_image;

		$this->view->namecard = $namecardDict;

		// WebRTCが使えないときの画面共有
		// 画面を共有する人が自分の画面共有表示領域をキャプチャし、画像ファイルをサーバーにアップロードする
		// phpではまずフォルダを作る
		$this->config = Zend_Registry::get('config');
		$screenCaptureDir = $this->config->screen_capture->path . "screen_capture_".$params["connection_info_id"];
		if (!file_exists($screenCaptureDir)) {
			// フォルダが存在しなければ作成する
			mkdir($screenCaptureDir, 0777);
		}

		// フリールームに入室の場合はメール通知する
		if (in_array($form["room_name"], $this->config->meet->freeroom->toArray())) {
			// フリールームと入室するルームが同じなので、メールで通知を行う
			$mailModel = Application_CommonUtil::getInstance('model', "MailModel", $this->db);
			$mailModel->sendEnterFreeRoomMail($this->config->free_room->notification_mail);
		}
	}

	/**
	 * 商談ルームURLから遷移してくるアクション
	 * ※URL直入力時
	 */
	public function viproomAction()
	{

		// SPでは無い場合
		if(1 !== $this->isMobile()) {
			$waiting_room = "/waiting-room/";
			// ユーザが 直接入場してきた場合は、待合室を経由させる.
			if(!preg_match($waiting_room, $_SERVER['HTTP_REFERER'])) {
				$this->_redirect(str_replace('/rooms/', $waiting_room, $_SERVER['REQUEST_URI']));
			}
		}

		// 操作ログ
		$this->setLog("ルーム入室・作成", json_encode($this->_getAllParams()));
		$form = $this->_getAllParams();

		$this->_logger->info("=======  商談開始：======== session_id=(". session_id() .")");

		// 電子契約APIが発行されている場合はフラグを立てる
		$session = Application_CommonUtil::getSession('e_contract_api');
		if ($session->credential) {
			$is_e_conteact_credential = 1;
		}
		if ($session->signImage) {
			$is_e_conteact_sign_image = 1;
		}
		if ($session->certificate) {
			$is_e_conteact_certificate = 1;
		}
		// 電子契約テンプレート取得
		if ($is_e_conteact_credential == 1 && $is_e_conteact_sign_image == 1 && $is_e_conteact_certificate == 1) {
			$eContractApiModel = Application_CommonUtil::getInstance("model", "EContractApiModel", $this->db);

			$documentList = $eContractApiModel->getDocumentAllList();
			$this->view->documentList = $documentList;
		}

		// ルーム名の指定がないことはありえないので、NULL,""(空),'null'は処理しない
		if (empty($form["room_name"]) || $form["room_name"]=='null') {
			$this->_logger->err("roomAction 処理なし room_name=[". $form["room_name"] ."]");
			exit;
		}

		// ルーム名チェック
		// ルーム名は半角英数字、アンダーバー(_)、ハイフン(-)の32文字
		if (!preg_match('/^[0-9a-zA-Z\-_]{1,32}$/', $form["room_name"], $room_name)) {
			$this->_logger->err("roomAction ルーム名エラー room_name=[". $form["room_name"] ."]");
			// 処理結果を返す(エラー画面表示)
			$this->_redirect('?error=3&room='.$form["room_name"]);
			exit;
		}

		// 同席モードの値チェック
		if (array_key_exists("room_mode", $form) && $form["room_mode"] != self::ROOM_MODE_2) {
			// 処理結果を返す(エラー画面表示) TODO 4は暫定なので後で必ず確認
			$this->_redirect('?error=4&room='.$form["room_name"]);
			exit;
		} else {
			// バリデーションに問題がなければ、ビューに値をセットする
			if (array_key_exists("room_mode", $form)) {
				// 現在の仕様でroom_modeのパラメータが存在する場合は同席モード
				$this->view->room_mode = self::ROOM_MODE_2;
			} else {
				$this->view->room_mode = self::ROOM_MODE_1;
			}
		}

		// ユーザーエージェントで端末、ブラウザ判定し、iOSとAndroidの場合は推奨環境以外はリダイレクト
		$ua = strtolower($_SERVER['HTTP_USER_AGENT']);
		$this->_logger->info("roomAction：UA[". $ua ."]");
		$this->_logger->debug("roomAction：BROWSER[". $this->getBrowserTypeNew() ."]");
		if (strpos($ua, 'iphone') !== false || strpos($ua, 'ipod') !== false || strpos($ua, 'ipad') !== false) {
			// iOSの場合、Safari11以降以外はリダイレクト（SafariにはSafariの他にVersionがあり、ChromeやLINEには無い）
			if (strpos($ua, 'safari') === false || strpos($ua, 'version') === false || strpos($ua, 'edge') !== false || strpos($ua, 'edg')) {
				// iOSだけどSafariじゃない
				$this->_redirect('/index/deprecated/?room='.$form["room_name"]);
				exit;
			} else {
				// iOSでSafariだけど、バージョンが10以下
				preg_match('/version\/\d+/', $ua, $version);
				$versionNumber = str_replace('version/', '', $version[0]);
				if ($versionNumber < 11) {
					$this->_redirect('/index/deprecated/?room='.$form["room_name"]);
					exit;
				}
			}
		} elseif ((strpos($ua, 'android') !== false)) {
			// Androidの場合、Chrome以外はリダイレクト（ChromeはChromeがあるが、EdgeとOperaにもあるChromeがあるため除外）
			if (strpos($ua, 'chrome') === false || strpos($ua, 'edge') !== false || strpos($ua, 'edg') !== false || strpos($ua, 'opr') !== false || strpos($ua, 'line') !== false || strpos($ua, 'fbav') !== false) {
				$this->_redirect('/index/deprecated/?room='.$form["room_name"]);
				exit;
			}
		} elseif ($this->getBrowserTypeNew() !== 'Edge'
			  && $this->getBrowserTypeNew() !== 'Firefox'
			  && $this->getBrowserTypeNew() !== 'Chrome'
			  && $this->getBrowserTypeNew() !== 'Safari'
			  && $this->getBrowserTypeNew() !== 'IE') {
			// PC 対象ブラウザ以外は全てリダイレクト
			// SNSへルームURLを張り付けると、クローラからルームURLがリクエストされ、入室処理が行われてしまうため
			// 対象ブラウザ以外は全てリダイレクト(トップ画面へ)する
			$this->_redirect('?room='.$form["room_name"].'&error=10');
			$this->_logger->error("roomAction：BROWSER[". $this->getBrowserTypeNew() ."]");
			exit;
		}

		$this->config = Zend_Registry::get('config');
		// モデル宣言
		$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);

		$this->_logger->info("商談開始：".json_encode($form). "session_id=(". session_id() .")");

		// オートログイン処理(自動ログイン用クッキー情報)
		if (!empty($_COOKIE['auto_login'])) {	// 有り
			$auth = Zend_Auth::getInstance();
			$this->_logger->info("roomAction オートログイン[有り]");

			// 自動ログインKEY取得
			$auto_login_key = $_COOKIE['auto_login'];
			// 自動ログインKEYが正しいかを判定(DBにKEYが存在しない場合は再度ログイン)
			$staffLogin = $this->autoLoginFetch($auto_login_key);
			if (!empty($staffLogin)) {		// DB上にキー有り
				$this->_logger->info("roomAction オートログインDB[有り]");
				/**
				 * クッキー再セット
				 * 一度削除し、再度自動ログイン用のキーを作成する
				 */
				$this->update_auto_login($auto_login_key);

				// ログイン処理用にidと自動ログインキー追加
				$form['id'] = $staffLogin['staff_type'].$staffLogin['staff_id'];
				$form['auto_login_key'] = $auto_login_key;
				$adapter = new Adapter_AuthAdapter($form);
				$result = $auth->authenticate($adapter);

				// 認証情報へ反映
				$this->user = $auth->getIdentity();
				Zend_Registry::set('user', $this->user);

				$header_username = $this->get_header_username($this->user);
				$this->user["header_username"] = $header_username;

				// クライアント選択したクライアントに成り変わる(AAのみ)
				// 注意：上記 auth 情報に値を設定している為、認証情報作成後に本処理を行う事！！
				if ($staffLogin['staff_type'] == self::AUTH_AA) {
					$clientModel = Application_CommonUtil::getInstance("model", "ClientModel", $this->db);
					$result = $clientModel->changeClient($staffLogin['client_id']);
					$this->user["client_id"] = $staffLogin['client_id'];
					$this->user["client_name"] = $result["client_name"];
					$this->user["plan_this_month"] = $result["plan_this_month"];
				}

				if (array_key_exists("client_name", $this->user) && $this->user["client_name"] != "") {
					$clientName = $this->user["client_name"];
					if (mb_strlen($this->user["client_name"], "UTF-8") > 11) {
						$clientName = mb_substr($this->user["client_name"], 0, 10, 'UTF-8')."...";
					}
					$this->user["header_clientname"] = $clientName;
				}

				$this->view->user = $this->user;

				// ログインOKの場合はクッキー(Cookie)へユーザ情報を設定する
				setcookie('client_id', $this->user["client_id"], 0, '/');
				setcookie('staff_type', $this->user["staff_type"], 0, '/');
				setcookie('staff_id', $this->user["staff_id"], 0, '/');
			}
		} else {
			$this->_logger->info("roomAction オートログイン[なし]");
		}

		$collabo_site = $this->getCollaborationSiteId($_SERVER["SERVER_NAME"]);
		$params = $apiModel->getWebRtcParam();

		// 初期化
		$connectionInfo = $apiModel->getRoomInfo($form["room_name"], $collabo_site);
		$this->_logger->debug("roomAction connectionInfo=[".print_r($connectionInfo, true)."]");
		// セッションへルームロック(room_state)情報を保存する(2020/04/11)
		$apiModel->saveWebRtcParam(array(
			'connect_no' => $connectionInfo['connect_no'],
			'connection_info_id' => $connectionInfo['id'],
			'room_name' => $connectionInfo['room_name'],
			'room_state' => $connectionInfo['room_state'],
			'collabo_site' => $collabo_site
		));
		$params = $apiModel->getWebRtcParam();

		// ログインしていた場合、最終入室日時を更新
		$auth = Zend_Auth::getInstance();
		$staff = $auth->getIdentity();
		if (isset($staff)) {
			// 最終入室日時を更新する
			$adminModel = Application_CommonUtil::getInstance("model", "AdminModel", $this->db);
			$adminModel->updateEnterRoomDate($staff['staff_type'], $staff['staff_id']);

			$is_mobile = preg_match('/Android|iPhone|iPad|iPod|BlackBerry|IEMobile/i', $_SERVER['HTTP_USER_AGENT']);

			// 契約期限の確認 (空値の場合は 無期限のクライアントと判断し無視する)
			if ($staff['is_expiration']) {
				if ($is_mobile) {
					// mobile
					$this->_redirect('/index/room?room='.$form["room_name"].'&error=4');
				} else {
					// PC
					$this->_redirect('?room='.$form["room_name"].'&error=4');
				}
			}
			// 契約期限の確認 (空値の場合は 無期限のクライアントと判断し無視する)
			if ($staff['is_before_contract']) {
				if ($is_mobile) {
					// mobile
					$this->_redirect('/index/room?room='.$form["room_name"].'&error=5');
				} else {
					// PC
					$this->_redirect('?room='.$form["room_name"].'&error=5');
				}
			}


		}

		/**
		 * 再ログイン判定
		 * ・セッションにユーザID＆ピアIDが存在している場合、DB接続情報のピアIDが
		 * 同じかを確認する。
		 */
		$peer_id = null;
		if (!empty($params["user_id"])) {
			$this->_logger->info("roomAction セッションの user_id=[".$params["user_id"]."]");
			// USER_ID あり
			switch ($params["user_id"]) {
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

			// ピアIDがnull の場合は空き
			// ピアIDが異なっている場合、他の人に使用されているため、user_idをクリア(空->user_id再取得)する
			// ただし、[user_id]がありpeer_idが'X'の場合も予約済みのため、セッションと同じ場合は予約状態のまま、user_idもクリアしない(再接続)
			$this->_logger->info("roomAction peer_id DB=[". $peer_id ."] peer_id(前回:セッション)=[". $params["peer_id"] ."]");
			if ($peer_id != null) {
				if ($peer_id != $params["peer_id"]) {
					$apiModel->saveWebRtcParam(array('user_id' => '')); // user_id 初期化
					$params = $apiModel->getWebRtcParam();
				}
			}
		}
		$this->_logger->info("★roomAction 再ログイン判定 結果 USER_ID=[".$params["user_id"]."]");

		/**
		 * ルーム入室
		 */
		$this->_logger->info("roomAction ルーム入室チェック params=[". $params["peer_id"] ."]");
		if (empty($params["user_id"])) {	// USER_ID なし
			// ルーム入室
			$clearCnt = $apiModel->clearConnectionInfoPeerId($connectionInfo['id']);
			$connectionInfo = $apiModel->getRoomInfo($form["room_name"], $collabo_site);
			$this->_logger->debug("roomAction ルーム入室 (".$clearCnt.")!!");
			$result = $apiModel->enterRoom($connectionInfo, $collabo_site);

			if (empty($clientModel)) {
				$clientModel = Application_CommonUtil::getInstance("model", "ClientModel", $this->db);
			}
			$negotiationAudioTextLimitInfo = $clientModel->getNegotiationAudioTextLimitInformation($this->user["client_id"], $this->user["staff_id"]);
			$negotiationAudioAnalysisLimitInfo = $clientModel->getNegotiationAudioAnalysisLimitInformation($this->user["client_id"], $this->user["staff_id"]);
			
			switch ($result) {
				case	-1:	// ルームロック
					// 処理結果を返す(エラー画面表示)
					$this->_redirect('?room='.$form["room_name"].'&error=2');
					$this->_logger->notice("roomAction ERROR=2");
					exit;
				case	-2:	// 人数オーバー
					// 処理結果を返す(エラー画面表示)
					if (preg_match('/Android|iPhone|iPad|iPod|BlackBerry|IEMobile/i', $_SERVER['HTTP_USER_AGENT'])) {
						// mobile
						$this->_redirect('/index/room?room='.$form["room_name"].'&error=1');
					} else {
						// PC
						$this->_redirect('?room='.$form["room_name"].'&error=1');
					}
					$this->_logger->notice("roomAction ERROR=1".'room_name=['.$form["room_name"].']');
					exit;
				default:	// 入室OK(USER_ID)
					// セッションへ保存し再取得
					$apiModel->saveWebRtcParam(array(
						'is_operator' => 0,
						'user_id' => $result
					));
					$params = $apiModel->getWebRtcParam();
					$this->_logger->info("roomAction 入室OK USER_ID=[". $params["user_id"] ."]");
					break;
			} // switch_End
		} else {
			$this->_logger->info("roomAction USER_ID=[".$params["user_id"]."] staff_id=[". $this->user["staff_id"] ."]");

			if (empty($clientModel)) {
				$clientModel = Application_CommonUtil::getInstance("model", "ClientModel", $this->db);
			}
			$negotiationAudioTextLimitInfo = $clientModel->getNegotiationAudioTextLimitInformation($this->user["client_id"], $this->user["staff_id"]);
			$negotiationAudioAnalysisLimitInfo = $clientModel->getNegotiationAudioAnalysisLimitInformation($this->user["client_id"], $this->user["staff_id"]);

			// 再接続時にログインユーザの場合、ログインフラグをONにする(2020/04/11)
			$login_flg = 0;
			if (!empty($this->user["staff_id"])) {    // ログインユーザか？
				$login_flg = 1;
			}
			if ($peer_id == 'X') {
				// peer_id再設定
				$this->_logger->info("roomAction peer_id 再設定=[". $peer_id ."]");
				$connectionInfo = $apiModel->updateConnectionInfoPeerId($params["connection_info_id"], $params["user_id"], $params["peer_id"], $login_flg);
			} else {
				// PeerId予約 (空で埋める)
				$this->_logger->info("roomAction PeerId 予約=[X]");
				$connectionInfo = $apiModel->updateConnectionInfoPeerId($params["connection_info_id"], $params["user_id"], 'X', $login_flg);
				$apiModel->saveWebRtcParam(array('peer_id' => 'X')); // user_id 初期化
				$params = $apiModel->getWebRtcParam();
			}
		}

		$this->_logger->info("roomAction connectionInfo=[".print_r($connectionInfo, true)."]");
		$this->_logger->debug("roomAction3 client_id=(". $this->user['client_id'] .")");
		$this->_logger->debug("roomAction3 staff_type=(". $this->user['staff_type'] .")");
		$this->_logger->debug("roomAction3 staff_id=(". $this->user['staff_id'] .")");
		$this->_logger->debug("roomAction3 plan=(". $this->user['plan'] .")");

		$this->_logger->info("roomAction USER_ID=[". $params["user_id"] ."]");

		$this->view->client_id = $this->user["client_id"];
		$this->view->staff_type = $this->user["staff_type"];
		$this->view->staff_id = $this->user["staff_id"];
		$this->view->plan_this_month = $this->user["plan_this_month"];

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
		$this->view->is_e_conteact_credential = $is_e_conteact_credential;
		$this->view->is_e_conteact_sign_image = $is_e_conteact_sign_image;
		$this->view->is_e_conteact_certificate = $is_e_conteact_certificate;

		$this->view->negotiation_audio_text_lock = $negotiationAudioTextLimitInfo['lock'];
		$this->view->negotiation_audio_text_time_limit_second = $negotiationAudioTextLimitInfo['time_limit_second'];
		$this->view->negotiation_audio_analysis_lock = $negotiationAudioAnalysisLimitInfo['lock'];
		$this->view->negotiation_audio_analysis_time_limit_second = $negotiationAudioAnalysisLimitInfo['time_limit_second'];

		$this->view->room_locked = $params["room_state"];	// 初期値(DB) 2020/04/11

		$this->_logger->info("roomAction room_state=[". $this->view->room_locked ."]");

		$this->view->remind_record_flg = $staff["remind_record_flg"];

		# 電子契約クレデンシャル
		// セッションを取得
		$session = Application_CommonUtil::getSession('e_contract_api');
		$this->view->e_contract_credential = $session->credential;

		// スタッフタイプが存在している場合は、ログイン済みのオペレータのためオペレータ権限とする
		if (empty($this->user["staff_type"]) == false) {
			$params["is_operator"] = "1";
			$this->view->is_operator = $params["is_operator"];
			// my_user_info設定
			if (empty($params["user_info"]) && !empty($this->user["staff_name"])) {
				$this->view->my_user_info = $this->user["staff_name"];
			}
		} else {
			$params["is_operator"] = "0";
		}
		$apiModel->saveWebRtcParam(array(
			'is_operator' => $params["is_operator"]
		));

		// ゲストの場合はオペレーターの情報を画面に設定する
		if ($params["is_operator"] == 0) {
			// モデル宣言
			$connectionInfoDao = Application_CommonUtil::getInstance("Dao", "ConnectionInfoDao", $this->db);
			// 接続ナンバーを元にオペレータ情報を取得
			$this->_logger->debug("connection_info_id:".$params["connection_info_id"]);
			$operatorInfo = $connectionInfoDao->getOperatorInfo($params["connection_info_id"]);

			// ゲストの場合はオペレーターが存在するかチェックする（オペレータがいない場合は入室できない）
			// ただし、フリールームに設定されていない場合のみ
			$chkFlg = 1;
			$arrayFreeroom = $this->config->meet->freeroom->toArray();
			if (!empty($arrayFreeroom)) {
				$this->_logger->info("roomAction FreeRoomName=[". print_r($arrayFreeroom, true) ."]");
				foreach ($arrayFreeroom as $key => $value) {
					if ($params["room_name"] == $value) {
						$chkFlg = 0;
						break;
					}
				}
			}
			$this->_logger->info("roomAction chkFlg=[". $chkFlg ."]");
			if ($chkFlg == 1) {
				$roomMembers = $this->getMcuRoomsMemberCount($params["room_name"]);
				if (!$roomMembers) {
//                $operatorCount = $connectionInfoDao->getOperatorCount($params["connection_info_id"]);
//                if (!$operatorCount) {
					// オペレーターがいないのでトップ画面へ遷移させる
					$this->_redirect('?room='.$form["room_name"].'&error=10');
				}
			}

			// ゲスト側でクライアントID取得
			$this->view->client_id = "0";
			$this->view->staff_type = "ZZ";
			$this->view->staff_id = "0";

			// 写真
			$profPath = "{$_SERVER['DOCUMENT_ROOT']}/img/profile/{$operatorInfo["staff_type"]}_{$operatorInfo["staff_id"]}.*";
			$profile_image = '';
			foreach (glob($profPath) as $file) {
				if (file_exists($file)) {
					$profile_image = str_replace($_SERVER['DOCUMENT_ROOT'], "", $file);
				}
			}
			if (empty($profile_image)) {
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
		foreach (glob($namecardImgPath) as $file) {
			if (is_file($file)) {
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
		foreach (glob($profPath) as $file) {
			if (file_exists($file)) {
				$profile_image = str_replace($_SERVER['DOCUMENT_ROOT'], "", $file);
			}
		}
		if (empty($profile_image)) {
			$profile_image = '/img/icon_face.png';
		}
		$this->view->video_background_image = $profile_image;

		$this->view->namecard = $namecardDict;

		// WebRTCが使えないときの画面共有
		// 画面を共有する人が自分の画面共有表示領域をキャプチャし、画像ファイルをサーバーにアップロードする
		// phpではまずフォルダを作る
		$this->config = Zend_Registry::get('config');
		$screenCaptureDir = $this->config->screen_capture->path . "screen_capture_".$params["connection_info_id"];
		if (!file_exists($screenCaptureDir)) {
			// フォルダが存在しなければ作成する
			mkdir($screenCaptureDir, 0777);
		}

		// フリールームに入室の場合はメール通知する
		if (in_array($form["room_name"], $this->config->meet->freeroom->toArray())) {
			// フリールームと入室するルームが同じなので、メールで通知を行う
			$mailModel = Application_CommonUtil::getInstance('model', "MailModel", $this->db);
			$mailModel->sendEnterFreeRoomMail($this->config->free_room->notification_mail);
		}
	}

	private function get_header_username($user)
	{
		// ヘッダー用の名前とクライアント名をセッションにセットする
		$userName = $user["staff_firstname"].$user["staff_lastname"];
		if (mb_strlen($userName, "UTF-8") > 8) {
			$userName = mb_substr($userName, 0, 7, 'UTF-8')."...";
		}
		return $userName;
	}

	private function get_header_clientname($user)
	{
		$clientName = '';
		if (array_key_exists("client_name", $user) && $user["client_name"] != "") {
			$clientName = $user["client_name"];
			if (mb_strlen($user["client_name"], "UTF-8") > 11) {
				$clientName = mb_substr($user["client_name"], 0, 10, 'UTF-8')."...";
			}
		}
		return $clientName;
	}

	/**
	 * 商談ルームURLから遷移してくるアクション
	 * ※URL直入力時
	 */
	public function getUserIdAction()
	{
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
	 * ロック情報設定
	 * set-negotiation-room-state
	 */
	public function setNegotiationRoomStateAction()
	{
		// 操作ログ
		$this->setLog("ロック情報設定", json_encode($this->_getAllParams()));
		$this->_logger->debug("setNegotiationRoomStateAction[".json_encode($this->_getAllParams())."]");

		$form = $this->_getAllParams();
		$connection_info_id = $form["connection_info_id"];
		$room_state = $form["room_state"];

		$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);
		$count = $apiModel->updateConnectionInfoRoomState($connection_info_id, $room_state);

		// ロック情報をセッションへ保存
		$apiModel->saveWebRtcParam(array('room_state' => $room_state));
		$this->_logger->info("setNegotiationRoomStateAction room_state=[". $room_state ."]");

		// 処理結果を返す
		echo json_encode($count);
		$this->_logger->debug("setNegotiationRoomStateAction result[".json_encode($count)."]");
		exit;
	}

	/**
	 * 入室可能判定
	 * allowed-enter-room
	 * 0: 入室OK
	 * 1: 人数オーバー
	 * 2: ロック状態
	 */
	public function allowedEnterRoomAction()
	{
		$result = array('result' => 0);
		// 操作ログ
		$this->setLog("入室可能判定", json_encode($this->_getAllParams()));
		$form = $this->_getAllParams();

		// モデル宣言
		$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);
		$commonModel = Application_CommonUtil::getInstance("model", "CommonModel", $this->db);

		// 初期化
		$collabo_site = $this->getCollaborationSiteId($_SERVER["SERVER_NAME"]);
		$connectionInfo = $apiModel->getRoomInfo($form["room_name"], $collabo_site);
		$apiModel->clearConnectionInfoPeerId($connectionInfo['id']);
		$config = new Zend_Config_Ini(APP_DIR . 'configs/system.ini', "production");

		// 初期化後の状態取得
		$connectionInfo = $apiModel->getRoomInfo($form["room_name"], $collabo_site);
		if ($connectionInfo["room_state"] == "1") {
			// AA1 AA3 AA9 ははルームロック判別除外
			if ($this->user["staff_type"]=="AA"&&($this->user["staff_id"]==1 || $this->user["staff_id"]==3 || $this->user["staff_id"]==9)) {
			} else {
				$result['result'] = 2;
			}
		}
		if ($result['result'] != 2) {
			$count = 0;
			foreach ($connectionInfo as $key=>$val) {
				if (preg_match("/^user_peer_id_\d+$/", $key)) {
					if (!is_null($val)) {
						$count++;
					}
				}
			}
			if ($count >= $config->meet->room->connectMaxCount) {
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
	public function registChatMessageAction()
	{
		$result = array('result' => 0);

		// 操作ログ
		//		$this->setLog("チャットメッセージ登録", json_encode($this->_getAllParams()));
		$this->setLog("チャットメッセージ登録", '');
		$form = $this->_getAllParams();

		$this->_logger->debug("addChatMessageAction room_name=[".$form["connection_info_id"]."]");
		$this->_logger->debug("addChatMessageAction user_id=[".$form["user_id"]."]");
		$this->_logger->debug("addChatMessageAction UUID=[".$form["uu_id"]."]");
		$this->_logger->debug("addChatMessageAction messages=[".$form["messages"]."]");

		// モデル宣言
		$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);
		$chatDetailModel = Application_CommonUtil::getInstance("model", "ChatDetailModel", $this->db);

		$connectionInfo = $apiModel->getConnectionInfo($form["connection_info_id"]);
		$this->_logger->debug("addChatMessageAction connectionInfo=[".print_r($connectionInfo, true)."]");
		if ($connectionInfo != null) {
			$chatDetail = $chatDetailModel->createChatDetail($connectionInfo, $form["user_id"], $form["uu_id"], $form["messages"]);
			if ($chatDetail != null) {
				$result['result'] = 1;
			}
			$this->_logger->debug("addChatMessageAction $result=[".$result['result']."]");
		}

		// 処理結果を返す
		echo json_encode($result);
		exit;
	}
	/**
	 * チャットメッセージを取得する
	 * connection_info_id
	 */
	public function getChatMessageListAction()
	{
		// 操作ログ
		$this->setLog("チャットメッセージ一覧取得", json_encode($this->_getAllParams()));
		$form = $this->_getAllParams();

		// モデル宣言
		$chatDetailModel = Application_CommonUtil::getInstance("model", "ChatDetailModel", $this->db);
		$this->_logger->debug("getChatMessageListAction START connection_info_id=[".$form["connection_info_id"]."]");
		$resultJson = $chatDetailModel->getChatDetail($form["connection_info_id"]);
		$this->_logger->debug("getChatMessageListAction END resultJson=[".json_encode($resultJson)."]");

		// jsonデータを画面に返す
		echo $resultJson;
		exit;
	}

	/*--------------------------------------------------
	動画ファイル変換（webm => mp4）
	--------------------------------------------------*/

	/**
	 * あとで結合するために一時的にバケットにチャンクをアップロードする。
	 * ファイルサイズが大きくなり過ぎるため分割する。
	 * /negotiation/upload-chunk-to-temporary-bucket
	 */
	public function uploadChunkToTemporaryBucketAction()
	{
		// バイナリデータを取得
		$raw_data = file_get_contents('php://input');
		// モデル宣言
		$video_model = Application_CommonUtil::getInstance('model', 'VideoModel');

		echo json_encode($video_model->uploadChunkToTemporaryBucket($raw_data));
		exit;
	}

	/**
	 * 一時的にバケットにアップロードしていたチャンクを結合して変換用バケットにアップロードする。
	 * また、変換完了後のダウンロード用URLを返却する。
	 * /negotiation/compose
	 */
	public function composeAction()
	{
		try {
			// モデル宣言
			$video_model = Application_CommonUtil::getInstance('model', 'VideoModel');
			// 操作ログ
			$this->_logger->info("録画動画アップロード及び変換完了後のURL取得", json_encode($this->_getAllParams()));

			echo json_encode($video_model->compose());
		}catch (\Exception $e) {
			error_log($e->getMessage());
		}
		exit;
	}

	/*--------------------------------------------------
	オートログイン取得
	--------------------------------------------------*/
	private function autoLoginFetch($auto_login_key)
	{
		$this->_logger->debug("autoLoginFetch START auto_login_key=(". $auto_login_key .")");
		$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);
		$staffLogin = $apiModel->autoLoginFetch($auto_login_key);
		return $staffLogin;
	}

	/*--------------------------------------------------
	オートログイン　更新
	注意：前回の自動ログイン情報が存在した場合は必ず更新する
	※セキュリティを考慮して、自動ログイン用のKeyを随時変更する
	--------------------------------------------------*/
	private function update_auto_login($old_auto_login_key = '')
	{
		/**
		 * 自動ログイン情報削除(cookie)
		 */
		// cookieの有効期限を過去(現在日時 -)にし無効にする。
		$cookieName = 'auto_login';
		$cookieExpire = time() - 1800;
		$cookiePath = '/';
		$cookieDomain = $_SERVER['SERVER_NAME'];
		setcookie($cookieName, $old_auto_login_key, $cookieExpire, $cookiePath, $cookieDomain);

		// 新自動ログイン情報作成
		$cookieName = 'auto_login';
		$new_auto_login_key = sha1(uniqid() . mt_rand(1, 999999999) . '_auto_login');
		$cookieExpire = time() + 3600 * 24 * 365; // 365日間
		$cookiePath = '/';
		$cookieDomain = $_SERVER['SERVER_NAME'];

		// 自動ログウイン情報更新(Keyのみ)
		$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);
		$apiModel->updateAutoLoginKey($old_auto_login_key, $new_auto_login_key);
		// 自動ログウイン情報更新(cookie)
		setcookie($cookieName, $new_auto_login_key, $cookieExpire, $cookiePath, $cookieDomain);
	}
	public function getBodypixBkgndImageListAction()
	{
		// 操作ログ
		$this->setLog("背景画像一覧取得", json_encode($this->_getAllParams()));
		$form = $this->_getAllParams();
		$resultJson = array('result' => 'OK');

		$files = array();
		// モデル宣言
		// ユーザー登録画像を取得する
		$commonModel = Application_CommonUtil::getInstance("model", "CommonModel", $this->db);
		$files = $commonModel->mergeBodypixImage($form);
		$img_path = "{$_SERVER['DOCUMENT_ROOT']}" . "/img/background/*.*";
		foreach (glob($img_path) as $file) {
			if (preg_match("/(\w+)\.(jpe?g|gif|png)$/", $file)) {
				$file = str_replace($_SERVER['DOCUMENT_ROOT'], '', $file);
				$files[] = $file;
			}
		}
		$resultJson['files'] = $files;
		// 資料のjsonデータを画面に返す
		echo json_encode($resultJson);
		exit;
	}

	//受け取ったURLを元にそのページのタイトルを取得
	public function getPageTitleAction()
	{
			$url = $this->_getAllParams();
			$html = file_get_contents($url['url']);
			// 内部エンコーディングに指定している文字コードに変換
			$html = mb_convert_encoding($html, mb_internal_encoding(), "auto" );
			$titleText = "タイトルが存在しません";
			// titleタグの抜き出し
			if (preg_match( "/<title>(.*?)<\/title>/i", $html, $matches) || preg_match('@<meta property="og:title" content="(.*)"@', $html, $matches)) {
					$titleText = $matches[1];
			};
			echo json_encode($titleText);
			exit;
	}

	const DELETE_NON_ROOM = "sampleRoom";		// 削除対処外ルーム
	const BASE_ROOM_NAME = "-subscribervideo";	// 入室者数カウントルーム名
	// const ROOM_NAME = array(
	// 		"online.sales-crowd.jp",
	// 		"demo.sales-crowd.jp",
	// 		"sc2.sense.co.jp",
	// 		"sc.sense.co.jp",
	// );

	/**
	 * MCUルームサーバー情報削除
	 */
	private function deleteMcuRooms()
	{
		$this->_logger->info("deleteMcuRooms START");
		// MCUサーバ情報取得(サーバー数分行うため)
		$mcuInfoModel = Application_CommonUtil::getInstance("model", "McuInfoModel", $this->db);
		$apiModel = Application_CommonUtil::getInstance("model", "ApiModel", $this->db);

		$server_list = $mcuInfoModel->getMcuServerInfoList();
		// $this->_logger->debug("deleteMcuRooms server_list=". print_r($server_list, true) );

		$name_list = array();	// 対象ルーム名情報
		foreach($server_list as $server) {
			$this->_logger->info("deleteMcuRooms getMcuServerInfoList URL=[". $server["url"] ."]");

			// 1.MCUサーバよりルーム一覧を取得する
			$server_name = $server["url"];	// MCUサーバ(例.https://xxxxxxx:3004)

			$rooms = $this->getMcuRoomsByServer($server_name);
			// $this->_logger->debug("deleteMcuRooms getMcuRoomsByServer ■■■ room=[". print_r($rooms, true)."]");

			foreach($rooms as $room) {
				// $this->_logger->debug("deleteMcuRooms getMcuRoomsByServer room_name=[". $room->name ."]");
				if( $room->name !== self::DELETE_NON_ROOM ) {
					// $this->_logger->debug("deleteMcuRooms getMcuRoomsByServer ■■■ room_name=[". $room->name ."]");

					if( strpos($room->name, self::BASE_ROOM_NAME) !== false ){
						$this->_logger->debug("deleteMcuRooms getMcuRoomsByServer name=[". $room->name ."] name=[". $room->id ."]");

						// 2.ルーム内のメンバーをカウントする
						$participants = array();
						$participants = $this->getMcuParticipantListByServer($server_name, $room->id);
						// $this->_logger->debug("deleteMcuRooms getMcuRoomsByServer ■■■ participants=[". print_r($participants, true)."]");
						$participant_count = count($participants);
						$this->_logger->info("deleteMcuRooms participant_count cnt=(". $participant_count .") name=[". $room->name ."]");

						// ルーム内の入室人数が0人
						if( $participant_count == 0 ) {
							$room_name = str_replace(self::BASE_ROOM_NAME, '', $room->name);
							// ルーム更新時間が指定時間以前
							$cnt = $mcuInfoModel->isAvaliableToMcuConnectionInfo( $room_name );
							if( $cnt ) {
								$this->_logger->debug("deleteMcuRooms name=[". $room_name ."]");
								$name_list = array_merge( $name_list, array(str_replace(self::BASE_ROOM_NAME, '', $room->name)) );
							}
						}
					}
				}
			}

			if( count($name_list) != 0 ) {
				$this->_logger->debug("deleteMcuRooms list=[". print_r($name_list, true) ."]");
			}

			// 2-1.メンバーが0人の場合は、ルーム情報削除
			// ルーム情報より対象データをの削除
			foreach($rooms as $room) {
				// $this->_logger->debug("deleteMcuRooms room=[". $room->name ."]");
				foreach ($name_list as $name) {
					// $this->_logger->debug("deleteMcuRooms room=[". $room->name ."] Key=[". $name ."]");
					if( preg_match('/^'.$name.'/', $room->name) ) {
						$this->_logger->info("DELETEKEY=[". $room->name ."]");
						$this->deleteMcuRoomByServer($server_name, $room->id);
					}
				}
			}
			// 接続情報初期化
			foreach ($name_list as $room_name) {
				$apiModel->updateConnectionInfoRoomStateOffByName($room_name);
				$mcuInfoModel->deleteMcuRoom($room_name);
			}

		}
		$this->_logger->info("deleteMcuRooms END");
	}

	/**
	 * MCUルーム情報取得(全ルーム)
	 */
	private function getMcuRoomsByServer($server_name)
	{
		$url = $server_name . "/rooms";
		$curl = curl_init();

		curl_setopt($curl, CURLOPT_URL, $url);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		$response = curl_exec($curl);
		curl_close($curl);
		return json_decode($response);
	}

	/**
	 * 個別ルーム情報取得(ルーム入室数カウント用)
	 */
	private function getMcuParticipantListByServer($server_name, $roomId = '')
	{
		$participants = array();
		if (empty($roomId)) {
			return $participants;
		}
		$url = $server_name . "/rooms/" . $roomId . "/participants";
		$curl = curl_init();
		curl_setopt($curl, CURLOPT_URL, $url);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		$response = curl_exec($curl);
		curl_close($curl);
		$participants = json_decode($response);
		return $participants;
	}

	/**
	 * ルーム削除
	 */
	private function deleteMcuRoomByServer($server_name, $roomId = '')
	{
		$participants = array();
		if (empty($roomId)) {
			return $participants;
		}
		$url = $server_name . "/rooms/" . $roomId;
		$curl = curl_init();
		curl_setopt($curl, CURLOPT_URL, $url);
		curl_setopt($curl, CURLOPT_CUSTOMREQUEST, 'DELETE');
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		$response = curl_exec($curl);
		curl_close($curl);
		$participants = json_decode($response);
		return $participants;
	}

	private function getMcuRoomsMemberCount($room_name = '')
	{
		if (empty($room_name)) {
			return 0;
		}
		$room_name .= "-subscribervideo";
		$rooms = $this->getMcuRooms($room_name);
		$foundRoom = null;
		foreach($rooms as $room) {
			if ($room->name == $room_name) {
				$foundRoom = $room;
				break;
			}
		}
		$participants = array();
		if ($foundRoom != null) {
			$participants = $this->getMcuParticipantList($room_name, $foundRoom->id);
		}
		$participant_count = count($participants);
		return $participant_count;
	}
	private function getMcuRooms($room_name)
	{
		$url = $this->getMCUServer($room_name) . "/rooms";
		$curl = curl_init();

		curl_setopt($curl, CURLOPT_URL, $url);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		$response = curl_exec($curl);
		curl_close($curl);
		return json_decode($response);
	}
	private function getMcuParticipantList($room_name, $roomId = '')
	{
		$participants = array();
		if (empty($roomId)) {
			return $participants;
		}
		$url = $this->getMCUServer($room_name) . "/rooms/" . $roomId . "/participants";
		$curl = curl_init();
		curl_setopt($curl, CURLOPT_URL, $url);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		$response = curl_exec($curl);
		curl_close($curl);
		$participants = json_decode($response);
		return $participants;
	}
////////

	/**
	 * MCUServer名を取得する
	 * パラメータ：
	 * room_name：ルーム名(例.[sense123] <--- [https://stage.meet-in.jp/rooms/sense123])
	 */
	public function getMcuServerAction()
	{
		$form = $this->_getAllParams();
		$result["server"] = $this->getMcuServer($form["room_name"]);
		$result["status"] = 1;

		// 処理結果を返す
		echo json_encode($result);
		exit;
	}

	/**
	 * MCUServer名を取得する
	 * ※Mcuサーバをroom名で振り分ける(同一のルーム名は同じサーバへ振り分ける振り分ける)
	 */
	private function getMcuServer($room_name='')
	{
		$this->_logger->info("getMcuServer START room_name=[".$room_name."]");
		if (empty($room_name)) {
			return 0;
		}

		$room_name = str_replace('-subscribervideo', '', $room_name);
		$mcuInfoModel = Application_CommonUtil::getInstance("model", "McuInfoModel", $this->db);

		// MCUサーバ情報を取得する
		$mcuServerInfo = $mcuInfoModel->getMcuServerInfoByRoom($room_name);

		$this->_logger->info("getMcuServer getMcuServerInfoByRoom URL=[". $mcuServerInfo["url"] ."]");
		$server_name = $mcuServerInfo["url"];
		return $server_name;
	}

	/**
	 * MCUServer名を取得する
	 * パラメータ：
	 * room_name：ルーム名(例.[sense123] <--- [https://stage.meet-in.jp/rooms/sense123])
	 */
	public function updateMcuServerAction()
	{
		$form = $this->_getAllParams();
		$this->updateMcuServer($form["room_name"]);
		exit;
	}

	/**
	 * MCUServer情報更新（入室時用）
	 */
	private function updateMcuServer($room_name='')
	{
		$this->_logger->info("updateMcuServer START room_name=[".$room_name."] join_room=(". $join_room .")");

		if (empty($room_name)) {
			return 0;
		}
		$room_name = str_replace('-subscribervideo', '', $room_name);

		// MCUサーバ情報更新
		$mcuInfoModel = Application_CommonUtil::getInstance("model", "McuInfoModel", $this->db);
		$mcuInfoModel->updateMcuServerInfo($room_name);

		$this->_logger->info("updateMcuServer END");
	}

	/**
	 * mp4変換完了通知対象者情報取得API
	 *
	 * クエリパラメータのmp4ファイル名（拡張子無し）に紐づく商談結果情報等からmp4変換完了通知を送信する際に必要な情報を生成して返却する。
	 * negotiation/get-conversation-completion-notification-target?fileName={mp4ファイル名(拡張子無し)}
	 */
	public function getConversationCompletionNotificationTargetAction() {
		$mp4FileName = $this->getRequest()->getQuery('fileName');

		$targetInfo = array();
		if ($mp4FileName) {
			$targetInfo = $this->createConversationCompletionNotificationTargetInfo($mp4FileName);
		}

		echo json_encode($targetInfo, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
		exit;
	}

	/**
	 * mp4変換完了通知対象者情報生成
	 *
	 * 商談結果IDを元にmp4変換完了通知を送信する際に必要な情報を生成して返却する。
	 *
	 * @param String $mp4FileName mp4ファイル名
	 * @return array mp4変換完了通知対象者情報
	 */
	private function createConversationCompletionNotificationTargetInfo($mp4FileName) {
		$BDResultDao = Application_CommonUtil::getInstance('dao', "BusinessDiscussionResultDao", $this->db);
		$masterStaffDao = Application_CommonUtil::getInstance('dao', "MasterStaffDao", $this->db);

		$BDResultRecord = $BDResultDao->getBDResultRowByMp4FileName($mp4FileName);

		$targetInfo = array();
		if ($BDResultRecord) {
			$MSCondition = " staff_type = '{$BDResultRecord['staff_type']}' AND staff_id = {$BDResultRecord['staff_id']} ";
			$MSRecord = $masterStaffDao->getMasterStaffRow($MSCondition);

			$targetInfo['staff_name'] = $MSRecord['staff_name'];
			$targetInfo['email_address'] = $MSRecord['staff_email'];
			$targetInfo['room_name'] = $BDResultRecord['room_name'];
			$targetInfo['start_time'] = $BDResultRecord['stime'];
			$targetInfo['end_time'] = $BDResultRecord['etime'];
			$targetInfo['download_url'] = $BDResultRecord['download_url'];
		}

		return $targetInfo;
	}


	/**
	 * 指定した番号にSMSを送信する
	 */
	public function sendSmsAction()
	{
		$form = $this->_getAllParams();

		// 操作ログ
		$this->_logger->info("SMS送信処理::". json_encode($this->_getAllParams()));

		$smsSendApiModel = Application_CommonUtil::getInstance("model", "SmsSendApiModel", $this->db);
		$result = $smsSendApiModel->sendSms($form);

		echo json_encode($result);
		exit;
	}

}
