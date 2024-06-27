<?php

class MaterialModel extends AbstractModel{
	
	const PDF_P_PAGE_WIDTH = 450;
	const PDF_L_PAGE_WIDTH = 785;
	
	function __construct($db){
		parent::init();
		$this->db = $db;
	}
	
	public function init() {
		
	}
	
	/**
	 * ホワイトボードのPDFを作成する
	 * @param unknown $form
	 */
	public function createWhiteBoardPdf($form){
		// FPDFのライブラリ読み込み
		require_once ROOT.'library/Pdf/japanese.php';
		// PDFのファイルパス作成 TODO ファイル名が秒までだと被る可能性有り
		$pdfFileName = "white_board_".date("Ymdhis").".pdf";
		$pdfFilePath = "{$_SERVER['DOCUMENT_ROOT']}/pdf/{$pdfFileName}";
		// PDFの初期化
		$pdf = new PDF_Japanese('P', 'pt', 'A4');
		$pdf->AddSJISFont();
	
		// 一次ファイルを配置する為のファイルパス
		$filePath = "{$_SERVER['DOCUMENT_ROOT']}/cmn-data/";
	
		// サーバーから送信されたデータを変数に設定する
		$whiteBoardImg = $form["whiteBoardImg"];
	
		// ファイルのフルパス作成
		$fileFullPath = "{$filePath}white_board_".date("Ymdhis").".png";
	
		error_log($fileFullPath);
	
		// 画像データを物理ファイル化する
		$this->createImageFile($whiteBoardImg, $fileFullPath, "png");
	
		// PDFを横向きにする
		$pdf->addPage("L");
		$pdfWidthSize = self::PDF_L_PAGE_WIDTH;
	
		// ページ、フォント、描画位置を設定
		$x = $pdf->getX();
		$y = $pdf->getY();
	
		// PDFに画像を描画する
		$pdf->Image($fileFullPath, $x, $y, $pdfWidthSize);
	
		// 物理ファイル化した画像を削除する
		unlink($fileFullPath);
	
		// PDFファイル生成
		$pdf->output($pdfFilePath, 'F');
		// 出力したファイル名を返す
		return $pdfFilePath;
	}
	
	/**
	 * 資料共有モーダル用のデータを取得する
	 * @param unknown $form
	 */
	public function getMaterialBasicList($form){
		
		// DAOの宣言
		$materialDao = Application_CommonUtil::getInstance('dao','MaterialDao', $this->db);
		
		// 条件を作成する
		//$condition = " client_id = {$this->user["client_id"]} ";
		$condition = "((create_staff_type='{$this->user["staff_type"]}' AND create_staff_id={$this->user["staff_id"]}) OR ((create_staff_type!='{$this->user["staff_type"]}' OR create_staff_id!={$this->user["staff_id"]}) AND shareable_flg=1)) AND client_id = {$this->user["client_id"]}";
		
		// データを取得する
		$result = $materialDao->getMaterialNoLimitList($condition, "material_id", "asc");
		
		// 戻り値を返す
		return json_encode($result);
	}
	
	/**
	 * 資料共有モーダルで選択した資料の情報を取得する
	 * @param unknown $form
	 */
	public function getMaterial($form){
		// DAOの宣言
		$materialDao = Application_CommonUtil::getInstance('dao','MaterialDao', $this->db);
		$materialDetailDao = Application_CommonUtil::getInstance('dao','MaterialDetailDao', $this->db);
		
		// 戻り値の宣言
		$result = array("status"=>0);
		
		// 値のチェック
		if(is_numeric($form["materialId"])){
			// 親を取得する条件を作成する
			$clientId = $this->escape($form["clientId"]);
			$staffType = $this->escape($form["staffType"]);
			$staffId = $this->escape($form["staffId"]);
			//$condition = " material_id = {$form["materialId"]} AND ((create_staff_type='{$this->user["staff_type"]}' AND create_staff_id={$this->user["staff_id"]}) OR ((create_staff_type!='{$this->user["staff_type"]}' OR create_staff_id!={$this->user["staff_id"]}) AND shareable_flg=1)) AND client_id = {$this->user["client_id"]}";
			$condition = " material_id = {$form["materialId"]} AND ((create_staff_type='{$staffType}' AND create_staff_id={$staffId}) OR ((create_staff_type!='{$staffType}' OR create_staff_id!={$staffId}) AND shareable_flg=1)) AND client_id = {$clientId}";
			// 親データ取得
			$material = $materialDao->getMaterialRow($condition);
			if($material){
				// ファイルを参照する為にmd5化する
				$material["md5_file_key"] = md5($material["material_id"]);
				
				// 子を取得する条件を作成する
				$condition = " material_id = {$form["materialId"]} ";
				// 子データ取得
				$materialDetail = $materialDetailDao->getMaterialDetailNoLimitList($condition);
				$result["material_basic"] = $material;
				$result["material_detail"] = $materialDetail;
				$result["status"] = 1;
				
				// 商談画面で使用する資料を別フォルダへ移動する
				$this->copyNegotiationMaterial($form["connectionInfoId"], $materialDetail);
			}
		}
		// 戻り値を返す
		return json_encode($result);
	}
	
	/**
	 * 商談画面で使用する資料を別フォルダに移動する
	 */
	private function copyNegotiationMaterial($connectionInfoId, $materialDetail){
		// 資料の元ファイルが保存されているフォルダパス
		$originalDocumentDir = $this->config->file->original_document->path;
		// 資料を保存するためのフォルダパス
		$copyDocumentDir = $this->config->file->negotiation_document->path . "negotiation_{$connectionInfoId}";
		if(!file_exists($copyDocumentDir)){
			// フォルダが存在しなければ作成する
			mkdir($copyDocumentDir, 0777);
			// フォルダの権限を確実に変更する
			//chmod($copyDocumentDir, 0777);
		}
		// 商談画面で使用する資料をコピーする
		foreach($materialDetail as $document){
			// 移動後のファイルパス
			$copyFilePath = "{$copyDocumentDir}/{$document["material_filename"]}";
			// 既にファイルが存在するかチェック
			if(!file_exists($copyFilePath)){
				// 移動元のファイルパス
				$originalFilePath = "{$originalDocumentDir}/{$document["material_filename"]}";
				// ファイルが存在しない場合のみコピーする
				copy($originalFilePath, $copyFilePath);
			}
		}
	}
	
	/**
	 * 資料の同期で共有した資料を取得する
	 * @param unknown $form
	 */
	public function getMaterialList($form){
		// DAOの宣言
		$materialDao = Application_CommonUtil::getInstance('dao','MaterialDao', $this->db);
		$materialDetailDao = Application_CommonUtil::getInstance('dao','MaterialDetailDao', $this->db);
	
		// 戻り値の宣言
		$result = array();
	
		// 値のチェック
		$materialIds = json_decode($form["materialIds"]);

		foreach($materialIds as $materialId){
			if(is_numeric($materialId)){
				// 親を取得する条件を作成する
// 同期時のみの資料情報取得なので不要(materialIdのみで検索OK)
//				$clientId = $this->escape($form["clientId"]);
//				$staffType = $this->escape($form["staffType"]);
//				$staffId = $this->escape($form["staffId"]);
//				$condition = " material_id = {$materialId} AND ((create_staff_type='{$staffType}' AND create_staff_id={$staffId}) OR ((create_staff_type!='{$staffType}' OR create_staff_id!={$staffId}) AND shareable_flg=1)) AND client_id = {$clientId}";
				$condition = " material_id = {$materialId}";
				// 親データ取得
				$material = $materialDao->getMaterialRow($condition);
				if($material){
					// ファイルを参照する為にmd5化する
					$material["md5_file_key"] = md5($material["material_id"]);
					// 子を取得する条件を作成する
					$condition = " material_id = {$materialId} ";
					// 子データ取得
					$materialDetail = $materialDetailDao->getMaterialDetailNoLimitList($condition);
					// 戻り値に設定
					$result[] = array("material_basic"=>$material, "material_detail"=>$materialDetail);
				}
			}
		}
		// 戻り値を返す
		return json_encode($result);
	}
	
	/**
	 * 資料の一時保存
	 */
	public function saveMaterial($form){
		// 保存先のパスを生成する
		$filePath = "{$this->config->file->negotiation_document->path}negotiation_{$form["connectionInfoId"]}/{$form["fileName"]}";
		// ファイルを保存する
		$this->createImageFile($form["canvasData"], $filePath, "png");
	}
	/**
	 * 資料の削除(キャンバスのみ)アップしたユーザーのみ実行すること
	 */
	public function deleteCanvasMaterial($form) {
		$material_ids = $form["materialIds"];
		foreach($material_ids as $id) {
			$filename = md5($id);
			$filePath = "{$this->config->file->negotiation_document->path}negotiation_{$form["connectionInfoId"]}/{$filename}-*-cvs.png";
//error_log($filePath);
			foreach(glob($filePath) as $val) {
//error_log($val);
				unlink($val);
			}
		}
		return json_encode(array('result' => 1));
	}
	/**
	 * 資料の画像をPDF化する
	 * @param unknown $form
	 */
	public function createDocumentPdf($form){
		// DAOの宣言
		$materialDao = Application_CommonUtil::getInstance('dao','MaterialDao', $this->db);
		$materialDetailDao = Application_CommonUtil::getInstance('dao','MaterialDetailDao', $this->db);
		// 戻り値の宣言
		$pdfFilePath = "";
		// 検索条件を作成
		$materialId = $this->escape($form["materialId"]);
		$clientId = $this->escape($form["clientId"]);
		$staffType = $this->escape($form["staffType"]);
		$staffId = $this->escape($form["staffId"]);
		
		$condition = " material_id = {$materialId} AND ((create_staff_type='{$staffType}' AND create_staff_id={$staffId}) OR ((create_staff_type!='{$staffType}' OR create_staff_id!={$staffId}) AND shareable_flg=1)) AND client_id = {$clientId}";
		// 資料の親データを取得
		$material = $materialDao->getMaterialRow($condition);
		if($material){
			// 子を取得する条件を作成する
			$condition = " material_id = {$form["materialId"]} ";
			// データを取得する
			$materialDetail = $materialDetailDao->getMaterialDetailNoLimitList($condition);
			
			// FPDFのライブラリ読み込み
			require_once ROOT.'library/Pdf/japanese.php';
			// PDFのファイルパス作成 TODO ファイル名が秒までだと被る可能性有り
			$pdfFileName = "document_".date("Ymdhis").".pdf";
			$pdfFilePath = "{$_SERVER['DOCUMENT_ROOT']}/pdf/{$pdfFileName}";
			// PDFの初期化
			$pdf = new PDF_Japanese('P', 'pt', 'A4');
			$pdf->AddSJISFont();
			
			// ファイルパス
			$filePath = "{$this->config->file->negotiation_document->path}negotiation_{$form["connectionInfoId"]}/";
			
			// 画像の格納されたリストでループする（ページ順になっている）
			foreach($materialDetail as $document){
				// ファイルへのフルパスを設定する為の変数
				$fileFullPath = "{$filePath}{$document["material_filename"]}";
				
				// キャンバス画像が存在するかチェックし存在する場合はリサイズと重ね合わせを行う
				$fileFullPaths = explode(".", $fileFullPath);
				$orgCanvasFileFullPath = $fileFullPaths[0] . "-cvs.png";
				if(file_exists($orgCanvasFileFullPath)){
					// キャンバス画像を資料画像に拡大する
					$this->risizeCanvasImg($fileFullPath);
					// 資料画像とキャンバス画像を重ね合わせる（戻り値は重ね合わせたファイルパスとなる）
					$fileFullPath = $this->mergeCanvasImg($fileFullPath);
				}
				
				// どちら向きのページを作成するか判定する為に画像を読み込む
				list($width,$height) = getimagesize($fileFullPath);
				// 横の最大値をページの向きによって変更する為の変数
				$pdfWidthSize = self::PDF_P_PAGE_WIDTH;
				// 向きを判定し新しいページを作成する
				if($width > $height){
					$pdf->addPage("L");
					$pdfWidthSize = self::PDF_L_PAGE_WIDTH;
				}else{
					$pdf->addPage("P");
				}
				// ページ、フォント、描画位置を設定
				$x = $pdf->getX();
				$y = $pdf->getY();
				
				// PDFに画像を描画する
				$pdf->Image($fileFullPath, $x, $y, $pdfWidthSize);
			}
			// PDFファイル生成
			$pdf->output($pdfFilePath, 'F');
		}
		// 出力したファイル名を返す
		return $pdfFilePath;
	}
	
	/**
	 * キャンバス画像を元の資料画像の大きさにリサイズする
	 * @param unknown $fileFullPath
	 */
	private function risizeCanvasImg($fileFullPath){
		$fileFullPaths = explode(".", $fileFullPath);
		$orgCanvasFileFullPath = $fileFullPaths[0] . "-cvs.png";
		$rszCanvasFileFullPath = $fileFullPaths[0] . "-cvs-r.png";
		
		// 元画像のサイズを取得する
		list($orgWidth, $orgHeight, $orgType, $orgAttr) = getimagesize($fileFullPath);
		
		// キャンバス画像をリサイズする
		$cmd = "convert {$orgCanvasFileFullPath} -resize {$orgWidth}x{$orgHeight}! {$rszCanvasFileFullPath}";
		
		// コマンドを実行する
		$res = exec($cmd, $output, $status);
	}
	
	/**
	 * 資料画像とキャンバス画像をマージする
	 * @param unknown $fileFullPath
	 */
	private function mergeCanvasImg($fileFullPath){
		$fileFullPaths = explode(".", $fileFullPath);
		$rszCanvasFileFullPath = $fileFullPaths[0] . "-cvs-r.png";
		$mrgFileFullPath = $fileFullPaths[0] . "-m.png";
		
		// 元画像のサイズを取得する
		list($orgWidth, $orgHeight, $orgType, $orgAttr) = getimagesize($fileFullPath);
		
		// キャンバス画像をリサイズする
		$cmd = "convert {$fileFullPath} {$rszCanvasFileFullPath} -gravity northwest  -compose over -composite {$mrgFileFullPath}";
		
		// コマンドを実行する
		$res = exec($cmd, $output, $status);
		
		return $mrgFileFullPath;
	}
	
	
	/**
	 * ホワイトボードの同期用保存処理
	 * @param unknown $form
	 */
	public function syncWhiteBoard($form){
		// 保存先のパスを生成する
		$saveDirPath = "{$this->config->file->negotiation_document->path}negotiation_{$form["connectionInfoId"]}";
		if(!file_exists($saveDirPath)){
			// フォルダが存在しなければ作成する
			mkdir($saveDirPath, 0777);
		}
		$filePath = "{$saveDirPath}/white_board.png";
		// ファイルを保存する
		$this->createImageFile($form["canvasData"], $filePath, "png");
	}
	
	/**
	 * キャンバス画像のファイルチェックを行う
	 * @param unknown $form
	 * @return number
	 */
	public function chackCanvasImg($form){
		$result = 0;
		$fileFullPath = $_SERVER['DOCUMENT_ROOT'].$form["imgPath"];
		if(file_exists($fileFullPath)){
			$result = 1;
		}
		return $result;
	}
	
	/**
	 * キャンバスで作成した画像を物理ファイルにする
	 * @param unknown $imgData
	 */
	private function createImageFile($imgData, $filePath, $extension){
		// ヘッダに「data:image/png;base64,」が付いているので削除する
		$imgData = str_replace("data:image/{$extension};base64,", '', $imgData);
		// その他の余分なデータを削除する
		$imgData = str_replace(' ', '+', $imgData);
		// base64エンコードされているのでデコードする
		$fileData = base64_decode($imgData);
		file_put_contents($filePath, $fileData);
	}
	/**
	 * アップロードされた資料をサーバに格納する
	 * @param unknown $form
	 */
	public function uploadMaterial($form) {
		$uploaddir = "{$_SERVER['DOCUMENT_ROOT']}/cmn-data/";
		$resultData = array();
		$resultData['status'] = 0;
		if($this->uploadMaterialValidation($form)){
//error_log(json_encode($form));
			// ファイル名解析
			if(!preg_match('/(.+)\.(.+)/', $form['filename'], $ext_matches)) {
				return $resultData;
			}
			$form["material_type"] = 0;
			$form["material_name"] = $ext_matches[1];
			if(preg_match('/(pdf|docx?|pptx?|xlsx?)/i', $ext_matches[2])) {
				$form["material_ext"] = 'jpg';
			} else if(preg_match('/(gif|jpg|png)/i', $ext_matches[2])) {
				$form["material_type"] = 2;
				$form["material_ext"] = strtolower($ext_matches[2]);
			}
			// daoの宣言
			$materialDao = Application_CommonUtil::getInstance('dao', "MaterialDao", $this->db);
			$this->db->beginTransaction();
			try {
				$result = array();
				$result = $materialDao->setMaterial($form);
				$this->db->commit();
			} catch(Exception $e){
				$this->db->rollBack();
				error_log($e->getMessage());
				throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
			}
			$uploadfile = $uploaddir . md5($result["material"]["material_id"])."." . $ext_matches[2];
			$pdffile    = $uploaddir . md5($result["material"]["material_id"]).".pdf";
			// プレフィックス削除
//		$uploadData = preg_replace('/^data:.+;base64,/', '', $form['filedata']);
			$pos = strpos($form['filedata'], ',');
			if($pos !== false) {
				$uploadData = substr($form['filedata'], $pos+1);
			}
			// Base64デコードして出力
			file_put_contents($uploadfile, base64_decode($uploadData));
			if(preg_match('/(pdf|docx?|pptx?|xlsx?)/i', $ext_matches[2])) {
				if(preg_match('/(docx?|pptx?|xlsx?)/i', $ext_matches[2])) {
					// オフィスファイルをpdfファイル
					$res = exec('/usr/local/bin/mstopdf.sh ' . $uploadfile , $output, $status);
					if($status !== 0) {
						error_log(json_encode($status));
						error_log(json_encode($output));
						throw new Exception('mstopdf.sh error');
					}
					// アップロードファイル削除
					unlink($uploadfile);
				}
				$cmd = '/usr/bin/pdftoppm -r 200 '.$pdffile.' '.$uploaddir.md5($result["material"]["material_id"]);
//error_log($cmd);
				$res = exec($cmd, $output, $status);
				if($status !== 0) {
					error_log(json_encode($status));
					error_log(json_encode($output));
					throw new Exception($cmd . ' error');
				}
				// 元PDFファイルは削除しない(リンク取得で使用)
				// 連番リネーム
				// PPMはゼロパディングされているのでゼロサプレス
				// hoge-01.ppm -> hoge-1.ppm
				// hoge-001.ppm -> hoge-1.ppm
				$ppmfiles = $uploaddir.md5($result["material"]["material_id"]).'-*.ppm';
				foreach(glob($ppmfiles) as $ppm) {
					if(preg_match('/(.+)-([\d]+)(\.ppm)$/', $ppm, $matches)) {
						if(preg_match('/^0+/', $matches[2], $submatches)) {
							$matches[2] = preg_replace('/^0+/', '', $matches[2]);
							$outfile = $matches[1].'-'.$matches[2].$matches[3];
							rename($ppm, $outfile);
						}
					}
				}
				// JPG変換
				$cmd = '/usr/bin/mogrify -format jpg '.$uploaddir.md5($result["material"]["material_id"]).'-*.ppm';
//			$cmd = '/usr/bin/mogrify -resize "1024x960>" -format jpg '.$uploaddir.md5($result["material"]["material_id"]).'-*.ppm';
//			error_log($cmd);
				$res = exec($cmd, $output, $status);
				if($status !== 0) {
					error_log(json_encode($status));
					error_log(json_encode($output));
					throw new Exception($cmd . ' error');
				}
				// 元PPMファイル削除
				$unlinkfiles = $uploaddir.md5($result["material"]["material_id"]).'-*.ppm';
				foreach(glob($unlinkfiles) as $val) {
					unlink($val);
				}
			} else if(preg_match('/(gif|jpg|png)/i', $ext_matches[2])) {
				if(preg_match('/(jpg)/i', $ext_matches[2])) {
					$cmd = '/usr/bin/mogrify -auto-orient -strip '.$uploadfile;
					$res = exec($cmd, $output, $status);
					if($status !== 0) {
						error_log(json_encode($status));
						error_log(json_encode($output));
						throw new Exception($cmd . ' error');
					}
				}

				$outfile    = $uploaddir . md5($result["material"]["material_id"])."-1." . strtolower($ext_matches[2]);
				rename($uploadfile, $outfile);
			}
			// 更新
//error_log(json_encode($result));
			$this->db->beginTransaction();
			try {
				// 分割ファイル数分をdetailに追加
				$materialDao->setMaterialDetail($result["material"]);
				$this->db->commit();
				// 登録した資料データを返す
				$result["material"]["md5_file_key"] = md5($result["material"]["material_id"]);
				$resultData['material_basic'] = $result["material"];
				// 詳細データ取得
				$condition = " material_id = {$result["material"]["material_id"]}";
				$resultData['material_detail'] = $materialDao->getMaterialDetailList($condition);
				$resultData['status'] = 1;
//error_log('END::'.json_encode($result));
			}
			catch(Exception $e){
				$this->db->rollBack();
				error_log($e->getMessage());
				$resultData['error'] = $e->getMessage();
				throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
			}
		}
		return $resultData;
	}
	private function uploadMaterialValidation($form){
		if(!isset($form['staff_type']) || empty($form['staff_type'])) {
			return false;
		}
		if( !isset($form['staff_id'] ) ) {
			// ZZ場合、emptyチェックしない('0'の場合エラーとなるため)
			if( $form['staff_type'] != 'ZZ' && empty($form['staff_id']) ) {
				return false;
			}
		}
//		if(!isset($form['staff_id']) || empty($form['staff_id'])) {
//			return false;
//		}
		if( !isset($form['client_id']) ) {
			// ZZ場合、emptyチェックしない('0'の場合エラーとなるため)
			if( $form['staff_type'] != 'ZZ' && empty($form['client_id']) ) {
				return false;
			}
		}
//		if(!isset($form['client_id']) || empty($form['client_id'])) {
//			return false;
//		}

		if(!isset($form['filename']) || empty($form['filename'])) {
			return false;
		}
		if(!isset($form['filedata']) || empty($form['filedata'])) {
			return false;
		}
		if(preg_match('/(.+)\.(.+)/', $form['filename'], $matches)) {
			if(!preg_match('/(gif|jpg|png|pdf|docx?|pptx?|xlsx?)/i', $matches[2])) {
				return false;
			}
		}
		return true;
	}
}