<?php

class MaterialModel extends AbstractModel{

	const PDF_P_PAGE_WIDTH = 595;
	const PDF_L_PAGE_WIDTH = 841;

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
		$condition = "";
		if($this->user["trialUserFlg"] == 1){
			// トライアルユーザーの場合は、自分がアップロードした資料のみ参照できるようにする
			$condition = "(create_staff_type='{$this->user["staff_type"]}' AND create_staff_id={$this->user["staff_id"]}) AND client_id = {$this->user["client_id"]}";
		}else{
			$condition = "((create_staff_type='{$this->user["staff_type"]}' AND create_staff_id={$this->user["staff_id"]}) OR ((create_staff_type!='{$this->user["staff_type"]}' OR create_staff_id!={$this->user["staff_id"]}) AND shareable_flg=1)) AND client_id = {$this->user["client_id"]}";
		}

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
		//開発用に変更
		// $originalDocumentDir = $this->config->file->original_document->path;
		$originalDocumentDir = 'cmn-data';

		// 資料を保存するためのフォルダパス
		$copyDocumentDir = $this->config->file->negotiation_document->path . "negotiation_{$connectionInfoId}";
		if(!file_exists($copyDocumentDir)){
			// フォルダが存在しなければ作成する
			mkdir($copyDocumentDir, 0777);
			// フォルダの権限を確実に変更する
			chmod($copyDocumentDir, 0777);
		}
		// 商談画面で使用する資料をコピーする
		foreach($materialDetail as $document){
			// 移動元のファイルパス
			$originalFilePath = "{$originalDocumentDir}/{$document["material_filename"]}";
			// 移動後のファイルパス
			$copyFilePath     = "{$copyDocumentDir}/{$document["material_filename"]}";
			// 既にファイルが存在するかチェック 処理がコケると json値にエラーログが出力されるので回避している.
			if(file_exists($originalFilePath) && !file_exists($copyFilePath)){
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

		if (isset($form['isReset']) && $form['isReset'] == 'on') {
			$filePath = str_replace('cvs', '*', $filePath);
			foreach(glob($filePath) as $val) {
				unlink($val);
			}
		} else {
			// ファイルを保存する
			$this->createImageFile($form["canvasData"], $filePath, "png");
		}
	}


	public function formatMaterialTextInput() {
		return [
			'document_text_input_id' => null,
			'text'                   => null,
			'textWidth'              => null,
			'textHeight'             => null,
			'fontSize'               => null,
			'fontColor'              => null,
			'modalTop'               => null,
			'modalLeft'              => null,
			'modalWidth'             => null,
			'modalHeight'            => null,
			'page'                   => null
		];
	}


	/**
	 * 資料へのテキスト入力の取得.
	 */
	public function loadMaterialTextInput($form){

		$filePath = "{$this->config->file->negotiation_document->path}negotiation_{$form["connectionInfoId"]}/{$form["fileName"]}.json";
		if(file_exists($filePath)) {
			return json_decode(file_get_contents($filePath), true);
		}
		return [$this->formatMaterialTextInput()];
	}


	/**
	 * 資料へのテキスト入力の一時保存
	 */
	public function saveMaterialTextInput($form){

		$filePath = "{$this->config->file->negotiation_document->path}negotiation_{$form["connectionInfoId"]}/{$form["fileName"]}.json";

		$input = [];
		foreach($this->formatMaterialTextInput() as $key => $vale) {
			$input[$key] = $form[$key]; // 引数を揃えているから出来る.
		}

		// 保存されたJSON値の習得.
		// MEMO. JSONファイルは 資料の数、さらに資料のページの数だけ存在する = pngと同じ数 jsonはある.
		$textInputs = [];
		if(file_exists($filePath)) {
			$textInputs = json_decode(file_get_contents($filePath), true);
		}

		// 新規登録 or 再編集.
		if(0 == intval($input['document_text_input_id'])) {

			// 新規登録用の IDの発行. ユニークなIDではない、 資料単位 page単位でIDは重複する.
			$input['document_text_input_id'] = 1;
			if(0 < count($textInputs)) {
				$input['document_text_input_id'] = max(array_column($textInputs, 'document_text_input_id'))+1;
			}
			$textInputs[] = $input;
		} else {

			// 上書き保存.
			foreach($textInputs as $key => $val) {
				if($val['document_text_input_id'] == $input['document_text_input_id']) {
					$textInputs[$key] = $input;
					break;
				}
			}
		}

		// 保存.
		file_put_contents($filePath, json_encode($textInputs));
		return $input;
	}


	/**
	 * 資料へのテキスト入力の1件削除
	 */
	public function removeMaterialTextInput($form){

		$jsonFilePath = "{$this->config->file->negotiation_document->path}negotiation_{$form["connectionInfoId"]}/{$form["fileName"]}.json";
		$imgFilePath  = "{$this->config->file->negotiation_document->path}negotiation_{$form["connectionInfoId"]}/{$form["fileName"]}-txt.png";

		$input = [
			'document_text_input_id' => $form['document_text_input_id'],
		];

		$textInputs = [];
		if(file_exists($jsonFilePath)) {
			$textInputs = json_decode(file_get_contents($jsonFilePath), true);
		}

		// 存在すれば削除する.
		foreach($textInputs as $key => $val) {
			if($val['document_text_input_id'] == $input['document_text_input_id']) {
				unset($textInputs[$key]);
				if(file_exists($imgFilePath)) {
					// MEMO. 資料をダウンロードする際に作られるHtmlをPNGに変換した画像素材 存在すると createDocumentPdf()で 原本PDFをダウンロードする分岐に入らないので消す.
					unlink($imgFilePath);
				}
				// 保存.
				return file_put_contents($jsonFilePath, json_encode($textInputs));
			}
		}
		return false;
	}

	/**
	 * 資料へのテキスト入力の指定ページの削除 (「リセット」機能で消す用).
	 */
	public function removeMaterialTextInputPageData($form){

		$jsonFilePath = "{$this->config->file->negotiation_document->path}negotiation_{$form["connectionInfoId"]}/{$form["fileName"]}.json";
		$imgFilePath  = "{$this->config->file->negotiation_document->path}negotiation_{$form["connectionInfoId"]}/{$form["fileName"]}-txt.png";

		$input = [
			'page' => $form['page'],
		];

		$textInputs = [];
		if(file_exists($jsonFilePath)) {
			$textInputs = json_decode(file_get_contents($jsonFilePath), true);
		}

		// 存在すれば削除する.
		$is_unset = false;
		foreach($textInputs as $key => $val) {
			if($val['page'] == $input['page']) {
				unset($textInputs[$key]);
				if(file_exists($imgFilePath)) {
					// MEMO. 資料をダウンロードする際に作られるHtmlをPNGに変換した画像素材 存在すると createDocumentPdf()で 原本PDFをダウンロードする分岐に入らないので消す.
					unlink($imgFilePath);
				}
				$is_unset = true;
			}
		}

		if($is_unset) {
			return file_put_contents($jsonFilePath, json_encode($textInputs));
		} else {
			return false;
		}
	}



	/**
	 * 資料の削除(キャンバスのみ)アップしたユーザーのみ実行すること
	 */
	public function deleteCanvasMaterial($form) {
		$material_ids = $form["materialIds"];
		foreach($material_ids as $id) {
			$filename = md5($id);
			$filePath = "{$this->config->file->negotiation_document->path}negotiation_{$form["connectionInfoId"]}/{$filename}-*-cvs.png";
			foreach(glob($filePath) as $val) {
				unlink($val);
			}

			$filePath = "{$this->config->file->negotiation_document->path}negotiation_{$form["connectionInfoId"]}/{$filename}-*.jpg";
			foreach(glob($filePath) as $val) {
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

		// ゲストが資料ダウンロードを行えない(SQL修正)
		// ダウン―ドフラグがONの場合はだれでも見れるので、material_id以外の条件は不要！
		// ダウンロードフラグがOFFの場合、ダウンロードは行えないためNG
		// 企業間でのみ共有するする事はないので(client_id)は不要。
		//
		$condition = " material_id={$materialId} AND ((create_staff_type='{$staffType}' AND create_staff_id={$staffId}) OR download_flg=1)";

		// 資料の親データを取得
		$material = $materialDao->getMaterialRow($condition);
		if($material){

			// 子を取得する条件を作成する
			$condition = " material_id = {$form["materialId"]} ";

			// データを取得する
			$materialDetail = $materialDetailDao->getMaterialDetailNoLimitList($condition); // ページ(material_page)順にソート済み.

			// ファイルパス
			$filePath = "{$this->config->file->negotiation_document->path}negotiation_{$form["connectionInfoId"]}/";

			// 1ページずつ調べて 書きこみがあるかを調べる.
			$isWroteData = false;
			foreach ($materialDetail as $document) {
				// ファイルへのフルパスを設定する為の変数
				$fileFullPath = "{$filePath}{$document["material_filename"]}";

				// ループの中でややこしいが、いつも同じ ファイル名のケツの「-¥ページ番号値」部分を取り除いた原本名が代入されつづけている.
				$materialDetailFileName = preg_replace("#-\d+\..*$#", '', $document['material_filename'], 2);

				// キャンバス画像が存在するかチェックし存在する場合はリサイズと重ね合わせを行う
				$fileFullPaths = explode(".", $fileFullPath);
				$orgCanvasFileFullPath = $fileFullPaths[0] . "-cvs.png";
				if (file_exists($orgCanvasFileFullPath)) {
					$isWroteData = true;
					break;
				}

				// テキスト入力画像が存在するかチェックし存在する場合はリサイズと重ね合わせを行う
				$fileFullPaths = explode(".", $fileFullPath);
				$orgCanvasFileFullPath = $fileFullPaths[0] . "-txt.png";
				if (file_exists($orgCanvasFileFullPath)) {
					$isWroteData = true;
					break;
				}
			}

			$uploadfile = "{$_SERVER['DOCUMENT_ROOT']}/cmn-data/" . $materialDetailFileName .'.pdf';


			// PDFの解像度(A4).
			$pdfSize = [
				'width'  => self::PDF_P_PAGE_WIDTH,
				'height' => self::PDF_L_PAGE_WIDTH
			];

			// MEMO. 拡張子をpdfに固定しているが、 原本が pmgや Microsoft資料の場合など pdfでないケースのほうが多い.
			if (file_exists($uploadfile)) {

				// ユーザから原本を求められたときや、描き込み済みのデータがない場合や、原本のPDFを返す (当然原本がMicrosoftデータやpng等などではない場合のみ).
				if ($form['isOriginal'] == 'true' || $isWroteData === false) {
					// MEMO. このファイルは原本データ FPDFの結合処理を受けると要領が10倍以上に膨らむので極力 原本を使うようにしている.
					return $uploadfile;
				}
			}


			// FPDFのライブラリ読み込み
			require_once ROOT.'library/Pdf/japanese.php';
			// PDFのファイルパス作成 TODO ファイル名が秒までだと被る可能性有り
			$pdfFileName = "document_".date("Ymdhis").".pdf";
			$pdfFilePath = "{$_SERVER['DOCUMENT_ROOT']}/pdf/{$pdfFileName}";


			// PDFの初期化
			$pdf = new PDF_Japanese('P', 'pt', 'A4');
			$pdf->AddSJISFont();


			// 画像の格納されたリストでループする（ページ順になっている）
			foreach($materialDetail as $document){

				// ファイルへのフルパスを設定する為の変数
				$fileFullPath = "{$filePath}{$document["material_filename"]}";

				// キャンバス画像が存在するかチェックし存在する場合はリサイズと重ね合わせを行う
				$fileFullPaths = explode(".", $fileFullPath); // 拡張子を消している [0]がフルパス、[1]が拡張子.
				$orgCanvasFileFullPath = $fileFullPaths[0] . "-cvs.png";
				// 書込みなし選択時（チェックなし）は、重ね合わせしない。
				if(file_exists($orgCanvasFileFullPath) && $form['isOriginal'] == 'false' && $isWroteData === true){
					// キャンバス画像を資料画像に拡大する
					$this->resizeCanvasImg($fileFullPath);
					// 資料画像とキャンバス画像を重ね合わせる（戻り値は重ね合わせたファイルパスとなる）
					$fileFullPath = $this->mergeCanvasImg($fileFullPath);
				}

				// テキスト入力画像が存在するかチェックし存在する場合はリサイズと重ね合わせを行う
				$orgCanvasFileFullPath = $fileFullPaths[0] . "-txt.png";
				// 書込みなし選択時（チェックなし）は、重ね合わせしない。
				if(file_exists($orgCanvasFileFullPath) && $form['isOriginal'] == 'false' && $isWroteData === true){
					// キャンバス画像を資料画像に拡大する
					$this->resizeTextImg($fileFullPath);
					// 資料画像とキャンバス画像を重ね合わせる（戻り値は重ね合わせたファイルパスとなる）
					$fileFullPath = $this->mergeTextImg($fileFullPath);
				}

				// MEMO. 画像(ペン書き、テキスト入力)は、ブラウザー幅でまちまちのサイズで届くが resizeCanvasImg() resizeTextImg()で 原本の大きさにリサイズされている.

				// どちら向きのページを作成するか判定する為に画像を読み込む
				list($width,$height) = getimagesize($fileFullPath);

				// 向きを判定し新しいページを作成する
				if($width > $height){ 
					$pdf->addPage("L");
					$pdfWidthSize = self::PDF_L_PAGE_WIDTH; // 横の時は規定値にすると、余白ができない A3, B4でも問題ない
				}else{
					$pdf->addPage("P");
					$pdfWidthSize = self::PDF_P_PAGE_WIDTH; // 縦の時の規定値を入れる。B5でも余白なくなった A4縦もOK
				}

				// ページ、フォント、描画位置を設定
				$x = 0; //$pdf->getX();
				$y = 0; //$pdf->getY();

				// PDFに画像を描画する
				$pdf->Image($fileFullPath, $x, $y, $pdfWidthSize);
			}
			// PDFファイル生成
			$pdf->output($pdfFilePath, 'F'); // MEMO. FPDFの結合処理を受けると容量が10倍以上に膨らむ点が不評.
		}
		// 出力したファイル名を返す
		return $pdfFilePath;
	}

	/**
	 * キャンバス画像を元の資料画像の大きさにリサイズする
	 * @param unknown $fileFullPath
	 */
	private function resizeCanvasImg($fileFullPath){
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
		$cmd = "convert -colorspace sRGB {$fileFullPath} {$rszCanvasFileFullPath} -gravity northwest  -compose over -composite {$mrgFileFullPath}";

		// コマンドを実行する
		$res = exec($cmd, $output, $status);

		return $mrgFileFullPath;
	}


	/**
	 * テキスト入力画像を元の資料画像の大きさにリサイズする
	 * @param unknown $fileFullPath
	 */
	private function resizeTextImg($fileFullPath){
		$fileFullPaths = explode(".", $fileFullPath);
		$orgCanvasFileFullPath = str_replace("-m-txt", "-txt", $fileFullPaths[0] . "-txt.png");
		$rszCanvasFileFullPath = str_replace("-m-txt", "-txt", $fileFullPaths[0] . "-txt-r.png");

		// 元画像のサイズを取得する
		list($orgWidth, $orgHeight, $orgType, $orgAttr) = getimagesize($fileFullPath);

		// キャンバス画像をリサイズする
		$cmd = "convert {$orgCanvasFileFullPath} -resize {$orgWidth}x{$orgHeight}! {$rszCanvasFileFullPath}";
		$res = exec($cmd, $output, $status);
	}

	/**
	 * 資料画像とテキスト入力画像をマージする
	 * @param unknown $fileFullPath
	 */
	private function mergeTextImg($fileFullPath){
		$fileFullPaths = explode(".", $fileFullPath);
		$rszCanvasFileFullPath = str_replace("-m-txt-r.png", "-txt-r.png", $fileFullPaths[0] . "-txt-r.png");
		$mrgFileFullPath = str_replace("-m-m.png", "-m.png", $fileFullPaths[0] . "-m.png");

		// 元画像のサイズを取得する
		list($orgWidth, $orgHeight, $orgType, $orgAttr) = getimagesize($fileFullPath);

		// キャンバス画像をマージする
		$cmd = "convert -colorspace sRGB {$fileFullPath} {$rszCanvasFileFullPath} -gravity northwest  -compose over -composite {$mrgFileFullPath}";
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
	public function createImageFile($imgData, $filePath, $extension){
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
error_log("uploadMaterial START\n", 3, "/var/tmp/negotiation.log");
		$uploaddir = "{$_SERVER['DOCUMENT_ROOT']}/cmn-data/";
		$resultData = array();
		$resultData['status'] = 0;
		if($this->uploadMaterialValidation($form)){
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
			} else if(preg_match('/(mp4)/i', $ext_matches[2])) {
				$form["material_type"] = 3;
				$form["material_ext"] = strtolower($ext_matches[2]);
			}
			// daoの宣言
			$materialDao = Application_CommonUtil::getInstance('dao', "MaterialDao", $this->db);
			$this->db->beginTransaction();
			try {
				$result = array();
				// material_idがファイル名になる為、先に登録を行う
				$result = $materialDao->setMaterial($form);

				$uploadfile = $uploaddir . md5($result["material"]["material_id"])."." . $ext_matches[2];
				$pdffile    = $uploaddir . md5($result["material"]["material_id"]).".pdf";
				// プレフィックス削除
				//$uploadData = preg_replace('/^data:.+;base64,/', '', $form['filedata']);
				$pos = strpos($form['filedata'], ',');
				if($pos !== false) {
					$uploadData = substr($form['filedata'], $pos+1);
				}
				// Base64デコードして出力
				file_put_contents($uploadfile, base64_decode($uploadData));
				if(preg_match('/(pdf|docx?|pptx?|xlsx?)/i', $ext_matches[2])) {
					if(preg_match('/(docx?|pptx?|xlsx?)/i', $ext_matches[2])) {
						// PDF変換開始ログ
						error_log("change pdf begin");
						// オフィスファイルをpdfファイル
						$res = exec('/usr/local/bin/mstopdf.sh ' . $uploadfile , $output, $status);
//error_log("uploadMaterial status=[".$status."]\n", 3, "/var/tmp/negotiation.log");
						if($status !== 0) {
							error_log(json_encode($status));
							error_log(json_encode($output));
							throw new Exception('Office ファイルの変換に失敗しました。');
						}
						// アップロードファイル削除
						unlink($uploadfile);
					}
					// JPG変換(連番変換時のために0埋め指定)
					$cmd = '/usr/bin/convert -density 200 -units PixelsPerInch -alpha remove -colorspace sRGB '.$pdffile.' '.$uploaddir.md5($result["material"]["material_id"]).'-%03d.jpg';
					// JPG変換開始ログ
					error_log("change jpg begin");
					$res = exec($cmd, $output, $status);
					if($status !== 0) {
						error_log(json_encode($status));
						error_log(json_encode($output));
						throw new Exception($cmd . ' error');
					}
					// 元PDFファイルは削除しない(リンク取得で使用)
					// 連番リネーム
					// ImageMagickは　連番0始まりなので1始まりに置換
					// hoge-000.jpg -> hoge-1.jpg
					$jpgfiles = $uploaddir.md5($result["material"]["material_id"]).'-*.jpg';

					foreach(glob($jpgfiles) as $jpg) {
						if(preg_match('/(.+)-([0-9]+)(\.jpg)$/', $jpg, $matches)) {
							$matches[2] = (int)$matches[2];
							$matches[2]++;
							$outfile = $matches[1].'-'.$matches[2].$matches[3];
							rename($jpg, $outfile);
						}
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
				// 容量チェック後のデータ保存変数宣言
				$resultCheckSize = array("errorMsg"=>"", "size"=>0);
				// ログインユーザーの場合のみサイズチェックを行い、ゲストの場合はチェックしない
				if(is_numeric($form["client_id"]) && $form["client_id"] != 0){
					// 画像を返還後に容量チェックを行う
					$adminModel = Application_CommonUtil::getInstance("model", "AdminModel", $this->db);
					$filePath = $uploaddir.md5($result["material"]["material_id"]).'*';
					$resultCheckSize = $adminModel->validMaterialSize($form["client_id"], $filePath);
				}
				if($resultCheckSize["errorMsg"] == ""){
					// サイズオーバーエラーがない場合はmaterial_basicに容量を登録する
					$materialDao->updateMaterialSize($result["material"]["material_id"], $resultCheckSize["size"]);
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
				}else{
					$resultData['status'] = 2;
					//$resultData['error'] = $resultCheckSizeMsg;
					$this->db->rollBack();
				}
			}catch(Exception $e){
//error_log("uploadMaterial Exception2 [". $e->getMessage() ."] \n", 3, "/var/tmp/negotiation.log");
				$this->db->rollBack();
				error_log($e->getMessage());
				$resultData['error'] = $e->getMessage();
//				throw new Exception(sprintf('error. (%s)', $e->getMessage()));
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

		if( !isset($form['client_id']) ) {
			// ZZ場合、emptyチェックしない('0'の場合エラーとなるため)
			if( $form['staff_type'] != 'ZZ' && empty($form['client_id']) ) {
				return false;
			}
		}

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
