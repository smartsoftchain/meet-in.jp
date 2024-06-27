<?php
require_once ROOT.'library/Application/validation.php';
/**
* 電子契約API用モデル
*/
class EContractApiModel extends AbstractModel {

  const API_URI = "https://api.prd.digital-signature.work/";
  const IDENTIFIER = "e-contract-api";                  // セッション変数のnamespace
  const STAFF_TYPE_AA_1 = "AA_1";
  const STAFF_TYPE_AA_2 = "AA_2";
  const STAFF_TYPE_CE_1 = "CE_1";
  const STAFF_TYPE_CE_2 = "CE_2";

  const ECONTRACT_FILE_DIR = "/cmn-e-contract/";

  const IMAGICK_FILTER = Imagick::FILTER_BLACKMAN;

  const IMAGICK_BLUR_VERTICAL = 0.7;
  const IMAGICK_BLUR_HORIZONTAL = 0.7;
  const IMAGICK_BLUR = 1.0;

  function __construct($db){
    parent::init();
    $this->db = $db;
  }

  /**
   * @param unknown $code
   * @return string
   */
  private function codeToMessage($code) {
    $message = "";
    switch($code) {
      case UPLOAD_ERR_OK:
        $message = 'アップロード成功';
        break;
      case UPLOAD_ERR_INI_SIZE:
      case UPLOAD_ERR_FORM_SIZE:
        $message = 'ファイルサイズオーバーです';
        break;
      case UPLOAD_ERR_PARTIAL:
        $message = 'ファイルの一部しかアップロードされていません';
        break;
      case UPLOAD_ERR_NO_FILE:
        $message = 'アップロードファイルがありません';
        break;
      case UPLOAD_ERR_NO_TMP_DIR:
        $message = 'テンポラリフォルダがありません';
        break;
      case UPLOAD_ERR_CANT_WRITE:
        $message = 'ディスクへの書き込みに失敗しました';
        break;
      case UPLOAD_ERR_EXTENSION:
        $message = '拡張によってアップロードが失敗しました';
        break;
      default:
        $message = '原因不明の失敗';
        break;
    }
    return $message;
  }

  /**
   * 電子契約書テンプレート一覧を取得
   * @params unknow $form
   * @param unknown $screenSession
   * @return Application_Pager
   */
  public function getDocumentList($form, &$screenSession) {
    // セッションの初期化
    if($screenSession->isnew == true){
      $screenSession->order = 'id';
      $screenSession->page = 1;
      $screenSession->pagesize = 100;
      $screenSession->ordertype = 'asc';  // 任意
    }
    // パラメータをセッションに格納
    foreach($form as $key=>$val){
      $screenSession->$key = $val;
    }
    // Daoの宣言
    $eContractDocumentDao = Application_CommonUtil::getInstance('dao', "EContractDocumentDao", $this->db);

    // 変数宣言
    $condition = "";
    if($this->user["staff_role"] == self::STAFF_TYPE_AA_1 || $this->user["staff_role"] == self::STAFF_TYPE_CE_1 || $this->user["staff_role"] == self::STAFF_TYPE_AA_2 || $this->user["staff_role"] == self::STAFF_TYPE_CE_2){
      $condition = "client_id = {$this->user["client_id"]}";
      $countCondition = "a.client_id = {$this->user["client_id"]}";
    }else{
      // 管理者とCE一般以外は、TOP画面へ遷移させる
      header("location:/index/menu");
      exit;
    }
    if($condition == "") {
      $condition = "a.is_temporary_creation = 0";
    } else {
      $condition = $condition. " and a.is_temporary_creation = 0";
    }
    if($countCondition == ""){
      $countCondition = "a.is_temporary_creation = 0";
    } else {
      $countCondition = $countCondition." and a.is_temporary_creation = 0";
    }

    // 検索実施
    $dataCount = $eContractDocumentDao->getDocumentCount($countCondition);
    $dataList = $eContractDocumentDao->getDocumentList($condition, $screenSession->order, $screenSession->ordertype , $screenSession->page, $screenSession->pagesize);
    // ファイルサイズを見やすいように変換する
    foreach($dataList as &$row){
      $sizeArray = explode(',', $row["total_size"]);
      $totalSize = 0;
      foreach($sizeArray as $size) {
        $totalSize += intval($size);
      }
      $row["convTotalSize"] = $this->convertByte2Str($totalSize);
    }
    // ページャ設定
    $list = new Application_Pager(array(
      "itemData" => $dataList,        // リスト
      "itemCount" => $dataCount,      // カウント
      "perPage" => $screenSession->pagesize,    // ページごと表示件数
      "curPage" => $screenSession->page,      // 表示するページ
      "order" => $screenSession->order,      // ソートカラム名
      "orderType" => $screenSession->ordertype,  // asc or desc
    ));
    // クライアントの最大ファイル登録サイズと現在登録中のファイルサイズ合計を取得する


    // 戻り値を作成する
    $result["list"] = $list;
    $result["registMsg"] = "";

    // セッション取得
    $session = Application_CommonUtil::getSession(self::IDENTIFIER);
    if(!is_null($session->registComplete)){
      // セッション情報を初期化する
      Application_CommonUtil::unsetSession(self::IDENTIFIER);
      // メッセージを設定する
      $result["registMsg"] = $this->message->success->regist->aa_staff;
    }
    return $result;
  }

  /**
   * GET 契約取得処理
   * POST 契約登録、更新処理
   * @param unknown $form
   */
  public function setTemplateAddress($e_contract_document_id, $form)
  {
    // Daoの宣言
    $eContractAddressDao = Application_CommonUtil::getInstance('dao', "EContractAddressDao", $this->db);

    // 取得.
    $addressList = array();
    if(0 < $e_contract_document_id) {
      $addressList = array_column($eContractAddressDao->find("e_contract_document_id={$e_contract_document_id}"), NULL, "e_contract_address_id");
    }

    // 保存.
    foreach($form['firstname'] as $key => $value)
    {
      // MEMO. 空欄の宛先を許容することで 例えば、３人中二人目がいつも可変するが、順番をテンプレート化し、「電子契約書作成時」に宛先を入力する運用が出来る.
      /*if($value=="") {
        continue;
      }*/
      $address =[
        'e_contract_document_id' => $e_contract_document_id,
        'email'                  => $form['email'][$key],
        'lastname'               => $form['lastname'][$key],
        'firstname'              => $form['firstname'][$key],
        'title'                  => $form['title'][$key],
        'organization_name'      => $form['organization_name'][$key],
        'approval_order'         => $key+1,
        'create_date'            => new Zend_Db_Expr('now()'),
        'update_date'            => new Zend_Db_Expr('now()')
      ];

      $current_e_contract_address_id = $form['e_contract_address_id'][$key];
      if($current_e_contract_address_id == 0 || !isset($addressList[$current_e_contract_address_id])){
        $result = $eContractAddressDao->insert($address);
      } else {
        $result = $eContractAddressDao->update($address, 'e_contract_address_id='.$current_e_contract_address_id);
      }
      if(isset($addressList[$current_e_contract_address_id])) {
        unset($addressList[$current_e_contract_address_id]);
      }

    }

    // 削除.
    foreach ($addressList as $key => $value) {
      $eContractAddressDao->delete('e_contract_address_id='.$key);
    }

  }

  /**
   * 指定IDの 電子契約書のテンプレートから PDFデータを削除する.
   * 付け外し用の処理.
   */
  public function clearMaterial($e_contract_document_id) {

    // Daoの宣言
    $eContractFileDao = Application_CommonUtil::getInstance('dao', "EContractFileDao", $this->db);
    $eContractDocumentMaterialDao      = Application_CommonUtil::getInstance('dao', "EContractDocumentMaterialDao", $this->db);

    // 取得.
    $fileCondition = "e_contract_document_id = {$e_contract_document_id}";
    $materialIds = $eContractFileDao->getMaterialIds($fileCondition);
    foreach ($materialIds as $materialId) {
      $materialCondList[] = "e_contract_document_material_id = {$materialId["e_contract_document_material_id"]}";
    }
    $materialCondition = " " . implode(" OR ", $materialCondList);

    // 削除.
    try {

      // Data対象.
      $eContractFileDao->deleteFile($fileCondition);
      $eContractDocumentMaterialDao->deleteMaterialRow($materialCondition);

      // ファイル対象(PDF/jpeg).
      foreach ($materialIds as $materialId) {
        $this->deleteMaterialFile($materialId["e_contract_document_material_id"]);
      }

    } catch(Exception $e) {
      error_log($e->getMessage());
      throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
    }

  }

  /**
   * 物理的な契約書データの削除
   * @param unknown $form
   */
  public function deleteMaterialFile($e_contract_document_material_id)
  {
    try {
      // ファイル.
      $uploaddir = "{$_SERVER['DOCUMENT_ROOT']}".self::ECONTRACT_FILE_DIR;
      // PDF内 の ページファイル.
      $deletefiles = $uploaddir.md5($e_contract_document_material_id)."-*.*";
      foreach(glob($deletefiles) as $file) {
        unlink($file);
      }
      // PDF.
      $pdfPath = $uploaddir.md5($e_contract_document_material_id).".pdf";
      unlink($pdfPath);
    } catch(Exception $e) {
      error_log($e->getMessage());
      throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
    }
  }


  /**
   * GET 契約取得処理
   * POST 契約登録、更新処理
   * @param unknown $form
   */
  public function editMaterial($form, $request) {
    // 戻り値の宣言
    $result = array();
    $result["errorList"] = array();
    $result["document"] = array();
    // アップロードディレクトリ
    $uploaddir = "{$_SERVER['DOCUMENT_ROOT']}".self::ECONTRACT_FILE_DIR;

    // Daoの宣言
    $eContractDocumentMaterialDao = Application_CommonUtil::getInstance('dao', "EContractDocumentMaterialDao", $this->db);
    $eContractDocumentDao = Application_CommonUtil::getInstance('dao', "EContractDocumentDao", $this->db);
    $eContractFileDao = Application_CommonUtil::getInstance('dao', "EContractFileDao", $this->db);

    $condition = "";
    $newFlg = true;
    $EXT_NAME = '';

    if($request->isPost()) {
      $this->db->beginTransaction();
      try{

        // 新規・更新アクション
        $errorList = $this->materialFormValidation($form);
        if(count($errorList) > 0) {
          $result["errorList"] = $errorList;
          return $result;
        }

        $form["material_type"] = "0";

        // 契約書データ
        $tmp = $_FILES['material_file']['tmp_name'];

        // 契約書数
        $materialCount = count($tmp);

        // 契約情報
        if(isset($form['id']) && 0 < $form['id']) {
          // 取得.
          $document["document"] = $eContractDocumentDao->getDocument('id = '.$form['id']);
          $document["document"]["document_id"] = $document["document"]['id'];
          $result["document"] = $document["document"];

          // 各契約書 更新の場合.
          if(0 < $materialCount && $tmp[0]!="") {
            $this->clearMaterial($document["document"]["document_id"]);
          }

        } else {
          // 作成.
          $document = $eContractDocumentDao->setDocument($form);
          $result["document"] = $document["document"];
        }

        // 宛先の保存.
        $this->setTemplateAddress($document["document"]["document_id"], $form);

        // 各契約書を登録する
        for($i=0; $i<$materialCount; $i++)
        {
          if($tmp[$i]=="") {
            continue;
          }

          // material_idがファイル名になる為、先に登録を行う
          $material = $eContractDocumentMaterialDao->setMaterial($form);

          // e_contract_file に登録する
          $file = $eContractFileDao->setFile($_FILES['material_file'], $document["document"]["document_id"], $material["material"]["e_contract_document_material_id"], $i, 0);

          // PDFからページ単位のJPGデータを作成する.
          $resut = $this->convertFileFromPdfToJpg($i, 'material_file', $uploaddir, $material["material"]["e_contract_document_material_id"]);

          // 作成したJPGデータをデータに登録.
          if(count($resut['errorList']) == 0 && 0 < count($resut['params'])) {
            $material = $eContractDocumentMaterialDao->setMaterial($resut['params']);
            // 分割ファイル数分をdetailに追加
            $eContractDocumentMaterialDao->setMaterialDetail($material["material"]);
          } else {
              error_log(json_encode($resut['errorList']));
          }

        }
        $this->db->commit();
      } catch(Exception $e) {
        $this->db->rollBack();
        error_log($e->getMessage());
        throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
      }
    } else {
      // 編集画面表示
      if(isset($form['id']) && !empty($form['id'])){
        $condition = " e_contract_document_material_id = {$form['id']}";
        $result["material"] = $eContractDocumentMaterialDao->getMaterialRow($condition);
      }
    }
    return $result;
  }

  public function convertFileFromPdfToJpg($files_index, $upload_name, $uploaddir, $e_contract_document_material_id)
  {
    $data = [
      'params'    => [],
      'errorList' => []
    ];

    $tmp = $_FILES[$upload_name]['tmp_name'];
    if($tmp[$files_index]=="") {
      return $data;
    }

    $params    = array();
    $errorList = array();

    // 新規登録時
    if(is_uploaded_file($tmp[$files_index]) && $_FILES[$upload_name]['error'][$files_index] == 0)
    {
      error_log(json_encode($_FILES[$upload_name]));

      $ext = preg_replace('/(.+)\.(.+)/', '$2', $_FILES[$upload_name]['name'][$files_index]);
      $uploadfile = $uploaddir . md5($e_contract_document_material_id)."." . strtolower($ext);
      $pdffile    = $uploaddir . md5($e_contract_document_material_id).".pdf";

      if(move_uploaded_file($tmp[$files_index], $uploadfile))
      {
        // MEMO. 元PDFファイルは削除しない(リンク取得で使用)
        $EXT_NAME = 'pdf';

        // PDF→PPM変換
        $cmd = '/usr/bin/pdftoppm -r 200 '.$pdffile.' '.$uploaddir.md5($e_contract_document_material_id);
        error_log("change ppm begin");
        $res = exec($cmd, $output, $status);
        if($status !== 0) {
          error_log(json_encode($status));
          error_log(json_encode($output));
        }
        $ppmfiles = $uploaddir.md5($e_contract_document_material_id).'-*.ppm';
        foreach(glob($ppmfiles) as $ppm) {
          if(preg_match('/(.+)-([\d]+)(\.ppm)$/', $ppm, $matches)) {
            if(preg_match('/^0+/', $matches[2], $submatches)) {
              $matches[2] = preg_replace('/^0+/', '', $matches[2]);
              $outfile = $matches[1].'-'.$matches[2].$matches[3];
              rename($ppm, $outfile);
            }
          }
        }
        // PPM→JPG変換
        $cmd = '/usr/bin/mogrify -format jpg '.$uploaddir.md5($e_contract_document_material_id).'-*.ppm';
        error_log("change jpg begin");
        $res = exec($cmd, $output, $status);
        if($status !== 0) {
          $errorList = array("status" => $status, 'output' => $output);
          return $data;
        }
        // 元PPMファイル削除
        $unlinkfiles = $uploaddir.md5($e_contract_document_material_id).'-*.ppm';
        foreach(glob($unlinkfiles) as $val) {
          unlink($val);
        }
      }

      // 画像を返還後に容量チェックを行う
      $filePath = $uploaddir.md5($e_contract_document_material_id).'*';
      $resultCheckSize = $this->validMaterialSize($this->user["client_id"], $filePath);
      if($resultCheckSize["errorMsg"] == "") {

        $params = array(
          'e_contract_document_material_id' => $e_contract_document_material_id,
          'material_type' => "0",
          'total_size' => $resultCheckSize
        );
        if($EXT_NAME != '') {
          $params['material_ext'] = $EXT_NAME;
        }
      } else {
        // エラーメッセージを設定する
        $errorList = array("size_over" => $resultCheckSize["errorMsg"]);
      }

    }

    // MEMO. 変換後の画像データを取得する為の パラメータ
    // 具体的なパスを返さない点に戸惑うかと思うが、各保存系処理が、保存メソッド内で  glob($uploaddir.md5($e_contract_document_material_id).'-*.*')のような方法で、
    // ファイルを取得しているようで どうも material_idさえ わかれば良い様子なので、そのようにこの処理も実装している.
    return [
      'params'    => $params,
      'errorList' => $errorList,
    ];
  }

  /**
   * フォーム情報を登録する
   * @param unknown $form
   */
  public function creareForm($form) {
    // Daoの宣言
    $eContractFormDao = Application_CommonUtil::getInstance('dao', "EContractFormDao", $this->db);

    $result = $eContractFormDao->creareForm($form);

    return $result;
  }

  /**
   * フォーム情報を削除する
   * @param unknown $form
   */
  public function deleteForm($form) {
    // Daoの宣言
    $eContractFormDao = Application_CommonUtil::getInstance('dao', "EContractFormDao", $this->db);

    $result = $eContractFormDao->deleteForm($form);

    return $result;
  }

  /**
   * フォーム情報を更新する
   * @param unknown $form
   */
  public function updateForm($form) {
    // Daoの宣言
    $eContractFormDao = Application_CommonUtil::getInstance('dao', "EContractFormDao", $this->db);

    $result = $eContractFormDao->updateForm($form);

    return $result;
  }

  /**
   * 契約テンプレートとそれに付随する資料を物理削除する
   * @param unknown $form
   */
  public function deleteDocument($form, $request) {
    // Daoの宣言
    $eContractDocumentMaterialDao = Application_CommonUtil::getInstance('dao', "EContractDocumentMaterialDao", $this->db);
    $eContractDocumentDao = Application_CommonUtil::getInstance('dao', "EContractDocumentDao", $this->db);
    $eContractFileDao = Application_CommonUtil::getInstance('dao', "EContractFileDao", $this->db);

    $data = array();
    $documentCondList = array();
    $fileCondList = array();
    $materialIds = array();
    $materialCondList = array();
    $documentCondition = "";
    $fileCondition = "";
    $materialCondition = "";

    // 要素がない場合は無処理
    foreach(explode(',', $form['document_ids']) as $val) {
      $documentCondList[] = "id = {$val}";
      $fileCondList[] = "e_contract_document_id = {$val}";
    }
    if(count($documentCondList) == 0) {
      return $data;
    }
    $documentCondition = " " . implode(" OR ", $documentCondList);
    $fileCondition = " " . implode(" OR ", $fileCondList);
    # 契約書ファイルに紐付くmaterial_idを取得する
    $materialIds = $eContractFileDao->getMaterialIds($fileCondition);
    foreach ($materialIds as $materialId) {
      $materialCondList[] = "e_contract_document_material_id = {$materialId["e_contract_document_material_id"]}";
    }
    $materialCondition = " " . implode(" OR ", $materialCondList);


    $this->db->beginTransaction();
    try {

      // MEMO.
      // テンプレートを雛形にして作成した 契約書で、書類画像が消えてしまうので行わないようにコメントアウトした.
      // 完成した電子契約書は永久保存で、ユーザの任意で削除出来ない類のもの。その電子契約書が参照するデータ群を物理削除しては不味いという判断で論理削除にした.
      // 仕様として「永久保存」とある為の解釈なので 仕様が変われば物理削除に戻ることもあるだろう.

      $data = $eContractDocumentDao->softdeleteDocument($documentCondition); // リストにい表示しないようフラグを立てるだけ.

/*
      $data = $eContractFileDao->deleteFile($fileCondition);
      $data = $eContractDocumentMaterialDao->deleteMaterialRow($materialCondition);
*/
      $this->db->commit();
/*
      // ファイル削除
      $uploaddir = "{$_SERVER['DOCUMENT_ROOT']}.self::ECONTRACT_FILE_DIR;
      foreach ($materialIds as $materialId) {
        $deletefiles = $uploaddir.md5($materialId["e_contract_document_material_id"])."-*.*";
        foreach(glob($deletefiles) as $file) {
          unlink($file);
        }
        // PDFファイルを削除する
        $pdfPath = $uploaddir.md5($materialId["e_contract_document_material_id"]).".pdf";
        unlink($pdfPath);
      }
*/

    } catch(Exception $e) {
      $this->db->rollBack();
      error_log($e->getMessage());
      throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
    }
    // 戻り値を作成する
		return $data;
  }

  /**
  * 電子契約書テンプレートに付与した宛名一覧を取得
  * @params unknow $form
  */
  public function getEContractAddressList($e_contract_document_id) {
    $eContractAddressDao = Application_CommonUtil::getInstance('dao', "EContractAddressDao", $this->db);
    return $eContractAddressDao->find("e_contract_document_id = {$e_contract_document_id}");
  }

  /**
   * 電子契約書の電子タグの一覧を取得
   */
  public function getEContractTagList($param) {
    //  自社の電子契約のみを取得する
    $eContractTagDao = Application_CommonUtil::getInstance('dao', "EContractTagDao", $this->db);
    if ($param) {
      $condition = sprintf(" AND name LIKE '%%%s%%' ", $param);
    }
    $tags = $eContractTagDao->find("e_contract_case_id IN ( SELECT id FROM e_contract_case WHERE client_id = " . $this->user['client_id'] . ")" . $condition );
    $tmpTags = [];
    foreach($tags as $tag)
    {
      $tmpTags[] = $tag['name'];
    }
    return $tmpTags;
  }

  /**
   * 電子契約書の電子タグの一覧を取得
   */
  public function getEContractTags($param) {
    //  自社の電子契約のみを取得する
    $eContractTagDao = Application_CommonUtil::getInstance('dao', "EContractTagDao", $this->db);
    $tags = $eContractTagDao->find("e_constract_case_id = {$param}");
    $tmpTags = [];
    foreach($tags as $tag)
    {
      $tmpTags[] = $tag['name'];
    }
    return $tmpTags;
  }

  /**
  * 電子契約書テンプレートと各資料詳細を取得
  * @params unknow $form
  */
  public function getFileDetailList($form) {

    // Daoの宣言
    $eContractDocumentMaterialDao = Application_CommonUtil::getInstance('dao', "EContractDocumentMaterialDao", $this->db);
    $eContractDocumentDao = Application_CommonUtil::getInstance('dao', "EContractDocumentDao", $this->db);
    $eContractFileDao = Application_CommonUtil::getInstance('dao', "EContractFileDao", $this->db);
    $eContractFormDao = Application_CommonUtil::getInstance('dao', "EContractFormDao", $this->db);

    // テンプレートデータを取得
    $documentCondition = " id = {$form['id']}";
    $document =  $eContractDocumentDao->getDocument($documentCondition);

    // 契約書ファイル一覧を取得
    $fileCondition = " e_contract_document_id = {$form['id']}";
    $fileList = $eContractFileDao->getFileList($fileCondition);

    // 資料詳細一覧を取得
    $materialList = array();
    foreach ($fileList as $file) {
      $materialCondition = " e_contract_document_material_id = {$file["e_contract_document_material_id"]}";
      $tmpList = $eContractDocumentMaterialDao->getMaterialDetailList($materialCondition);
      $materialList[] = $tmpList;
    }

    // フォーム一覧を取得
    $formList = array();
    foreach ($fileList as $file) {
      $formCondition = " e_contract_file_id = {$file['id']}";
      $tmpList = $eContractFormDao->getFormList($formCondition);
      $formList[] = $tmpList;
    }

    $result["document"] = $document;
    $result["fileList"] = $fileList;
    $result["materialList"] = $materialList;
    $result["formList"] = $formList;
    $result['addressList']  = $this->getEContractAddressList($form['id']);
    return $result;
  }

  /**
  * クライアントの持つテンプレートを全て取得
  **/
  public function getDocumentAllList() {
    // Daoの宣言
    $eContractDocumentDao = Application_CommonUtil::getInstance('dao', "EContractDocumentDao", $this->db);

    // 変数宣言
    $condition = "";
    if($this->user["staff_role"] == self::STAFF_TYPE_AA_1 || $this->user["staff_role"] == self::STAFF_TYPE_CE_1 || $this->user["staff_role"] == self::STAFF_TYPE_AA_2 || $this->user["staff_role"] == self::STAFF_TYPE_CE_2){
      $condition = "client_id = {$this->user["client_id"]}";
    }else{
      // 管理者とCE一般以外は、TOP画面へ遷移させる
      header("location:/index/menu");
      exit;
    }
    if($condition == "") {
      $condition = "a.is_temporary_creation = 0";
    } else {
      $condition = $condition. " and a.is_temporary_creation = 0";
    }

    // 検索実施
    $dataList = $eContractDocumentDao->getDocumentAllList($condition);

    // 戻り値を作成する
    $result = $dataList;
    return $result;
  }

  /**
   * GET パートナー取得処理
   * POST パートナー登録、更新処理
   * @param unknown $form
   */
  public function editPartner($form, $request) {
    // 戻り値の宣言
    $result = array();
    $result["errorList"] = array();
    $result["partner"] = array();
    // アップロードディレクトリ
    $uploaddir = "{$_SERVER['DOCUMENT_ROOT']}".self::ECONTRACT_FILE_DIR;

    // Daoの宣言
    $eContractCaseDao = Application_CommonUtil::getInstance('dao', "EContractCaseDao", $this->db);
    $eContractDocumentDao = Application_CommonUtil::getInstance('dao', "EContractDocumentDao", $this->db);
    $eContractFileDao = Application_CommonUtil::getInstance('dao', "EContractFileDao", $this->db);
    $eContractDocumentMaterialDao = Application_CommonUtil::getInstance('dao', "EContractDocumentMaterialDao", $this->db);
    $eContractMaterialBasicDao = Application_CommonUtil::getInstance('dao', "EContractMaterialBasicDao", $this->db);
    $eContractMaterialDetailDao = Application_CommonUtil::getInstance('dao', "EContractMaterialDetailDao", $this->db);
    $eContractPartnerDao = Application_CommonUtil::getInstance('dao', "EContractPartnerDao", $this->db);
    $eContractFormDao = Application_CommonUtil::getInstance('dao', "EContractFormDao", $this->db);
    $eContractInputDao = Application_CommonUtil::getInstance('dao', "EContractInputDao", $this->db);
    $eContractTagDao = Application_CommonUtil::getInstance('dao', "EContractTagDao", $this->db);

    $condition = "";
    $newFlg = true;


    // 新規・更新アクション
    if($request->isPost()) {

      $this->db->beginTransaction();
      try{

        // 契約書 「新しく書類（PDF)をアップロードして設定する 場合」
        if($form["callup_contract_type"] == '2')
        {

          // 契約書データ
          $tmp = $_FILES['material_file']['tmp_name'];

          $form["material_name"] = $form['case_title']; // 仮名.

          // 作成.
          // 複数の契約PDFを管理する為の e_contract_document_idが必要になるので 結局テンプレートを作成する.
          $_document = $form;
          $_document["is_temporary_creation"] = 1;
          $document = $eContractDocumentDao->setDocument($_document);
          // 各契約書を登録する
          for($i=0; $i<count($tmp); $i++)
          {
            if($tmp[$i]=="") {
              continue;
            }

            // material_idがファイル名になる為、先に登録を行う
            $material = $eContractDocumentMaterialDao->setMaterial($form);

            // e_contract_file に登録する
            $file = $eContractFileDao->setFile($_FILES['material_file'], $document["document"]["document_id"], $material["material"]["e_contract_document_material_id"], $i, 1);

            // PDFからページ単位のJPGデータを作成する.
            $result = $this->convertFileFromPdfToJpg($i, 'material_file', $uploaddir, $material["material"]["e_contract_document_material_id"]);

            // 作成したJPGデータをデータに登録.
            if(count($result['errorList']) == 0 && 0 < count($result['params'])) {

              $material = $eContractDocumentMaterialDao->setMaterial($result['params']);
              // 分割ファイル数分をdetailに追加
              $eContractDocumentMaterialDao->setMaterialDetail($material["material"]);
            } else {
                error_log(json_encode($result['errorList']));
                throw new Exception(json_encode($result['errorList']));
            }

          }

          // PDFから作成した e_contract_document_id を渡す.
          $form['e_contract_document_id'] = $document["document"]["document_id"];

        }

        if($form["id"]) {
          // 案件情報を更新
          $caseCondition = "id = {$form["id"]}";

          $eContractCaseDao->updateCase($form, $caseCondition);
          // 案件情報を取得
          $case = $eContractCaseDao->getCase($caseCondition);
          $case["case"] = $case;
          $case["case"]["case_id"] = $case["id"];
          $result["case"] = $case;
          $result["case"]["case_id"] = $case["id"];

          // 資料情報の削除
          $eContractMaterialBasicCondition = "case_id = {$case["case"]["id"]}";
          $eContractMaterialBasic = $eContractMaterialBasicDao->getMaterialBasic($eContractMaterialBasicCondition);
          $eContractMaterialBasicDao->deleteMaterialBasic($eContractMaterialBasicCondition);

          if($eContractMaterialBasic["id"]) {
            $eContractMaterialDetailCondition = "e_contract_material_basic_id = {$eContractMaterialBasic["id"]}";
            $eContractMaterialDetailDao->deleteMaterialDetail($eContractMaterialDetailCondition);
          }

          // formから複写した inputテーブルのデータを削除.
          $inputCondition = "e_contract_case_id = {$case["id"]}";
          $eContractInputDao->deleteInput($inputCondition);

          // パートナー情報の削除
          $eContractPartnerCondition = "e_contract_case_id = {$case["case"]["id"]}";
          $eContractPartnerDao->deletePartner($eContractPartnerCondition);

          // タグ情報の削除
          $eContractTagCondition = "e_contract_case_id = {$case["case"]["id"]}";
          $eContractTagDao->delete($eContractTagCondition);
        } else {
          $case = $eContractCaseDao->setCase($form);
          $result["case"] = $case["case"];
          $result["case"]["case_id"] = $case["case"]['case_id'];
        }


        // テンプレート取得
        $documentCondition = "id = {$case["case"]["e_contract_document_id"]}";
        $document = $eContractDocumentDao->getDocument($documentCondition);

        // ファイルを取得
        $fileCondition = "e_contract_document_id = {$document["id"]}";
        $fileList = $eContractFileDao->getFileList($fileCondition);

        // 資料情報を登録
        foreach($fileList as $file) {
          $materialCondition = "e_contract_document_material_id = {$file["e_contract_document_material_id"]}";
          $material = $eContractDocumentMaterialDao->getMaterialRow($materialCondition);
          $materialDetailCondition = "e_contract_document_material_id = {$material["e_contract_document_material_id"]}";
          $materialDetailList = $eContractDocumentMaterialDao->getMaterialDetailList($materialDetailCondition);

          $fileName = preg_replace('/-\d*.jpg?/', '.pdf', $materialDetailList[0]['material_filename']);

          $eContractMaterialBasic = $eContractMaterialBasicDao->registMaterialBasic($case["case"]['case_id'], $file, $fileName);
          foreach($materialDetailList as $materialDetail) {
            $eContractMaterialDetailList[] = $eContractMaterialDetailDao->registMaterialDetail($eContractMaterialBasic['id'], $materialDetail);
          }
          $formCondition = "e_contract_file_id = {$file['id']}";
          $formList = $eContractFormDao->getFormList($formCondition);
          foreach($formList as $formRow) {
            $inputForm = [
              'case_id'    => $result["case"]["case_id"],
              'form_id'    => $formRow['id'],
              'partner_id' => 0,
              'target'     => null,
              'img_data'   => null,
              'img_type'   => null,
              'img_size'   => null,
              'required'   => null,
              'img_data'   => null,
              'img_type'   => null,
            ];
            $eContractInputDao->createInput($inputForm, $formRow, $eContractMaterialBasic["id"]);
          }
        }

        // パートナー数
        $partnerCount = count($form["email"]);
        // パートナー情報を登録する
        for($i=0; $i<$partnerCount; $i++) {
          // アクセストークン作成
          $token = $this->createToken();

          $eContractPartnerDao->setPartner($case["case"]['case_id'], $form, $token, $i);
        }

        // タグを登録する
        $tagCount = count($form['tags']);
        // パートナー情報を登録する
        for($i=0; $i<$tagCount; $i++) {
          // アクセストークン作成
          $params['e_contract_case_id'] = $case["case"]["case_id"];
          $params['name'] = $form['tags'][$i];
          $params['create_date'] = new Zend_Db_Expr('now()');
          $params['update_date'] = new Zend_Db_Expr('now()');
          $eContractTagDao->insert($params);
        }
      } catch(Exception $e) {
        $this->db->rollBack();
        error_log($e->getMessage());
        throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
      }
      $this->db->commit();
    } else {
      // 編集画面表示

    }
    return $result;
  }


  /**
   * ファイルを差し替える.
   * @param unknown $form
   */
  public function replacementMaterial($form, $request) {

    // 戻り値の宣言
    $result = array();
    $result["errorList"] = array();
    $result["partner"] = array();
    // アップロードディレクトリ
    $uploaddir = "{$_SERVER['DOCUMENT_ROOT']}".self::ECONTRACT_FILE_DIR;

    // Daoの宣言
    $eContractCaseDao = Application_CommonUtil::getInstance('dao', "EContractCaseDao", $this->db);
    $eContractDocumentDao = Application_CommonUtil::getInstance('dao', "EContractDocumentDao", $this->db);
    $eContractDocumentMaterialDao      = Application_CommonUtil::getInstance('dao', "EContractDocumentMaterialDao", $this->db);
    $eContractMaterialBasicDao = Application_CommonUtil::getInstance('dao', "EContractMaterialBasicDao", $this->db);
    $eContractMaterialDetailDao = Application_CommonUtil::getInstance('dao', "EContractMaterialDetailDao", $this->db);
    $eContractFileDao = Application_CommonUtil::getInstance('dao', "EContractFileDao", $this->db);
    $eContractInputDao = Application_CommonUtil::getInstance('dao', "EContractInputDao", $this->db);
    $eContractFormDao = Application_CommonUtil::getInstance('dao', "EContractFormDao", $this->db);

    $replace_material_basic_id = $form["material_basic_id"];
    $case = $eContractCaseDao->getCase("id = {$form["id"]}");

    $copyDocument = $eContractDocumentDao->getDocument("id = {$case["e_contract_document_id"]}");
    $copyFileList  = $eContractFileDao->getFileList("e_contract_document_id = {$copyDocument['id']}");
    $replaceEContractMaterialBasic = $eContractMaterialBasicDao->getMaterialBasic("id = {$replace_material_basic_id}");
    $replaceFile = $eContractFileDao->getFile("e_contract_document_id = {$copyDocument["id"]} and title='{$replaceEContractMaterialBasic["title"]}'");
    $replaceMaterial = $eContractDocumentMaterialDao->getMaterial("e_contract_document_material_id = {$replaceFile["e_contract_document_material_id"]}");
    $replaceInputList = $eContractInputDao->getInputList("e_contract_case_id = {$form["id"]} and e_contract_material_basic_id = {$replace_material_basic_id}");

    try {

      $this->db->beginTransaction();

      $newMaterial = $replaceMaterial;

      $document = $eContractDocumentDao->getDocument("id = {$case["e_contract_document_id"]}");
      $document["document_id"] = $document['id'];

      // ファイルを差し替え1 = 差し替え前の処分.
      // 「テンプレートから書類を設定する」選択の場合 = 「電子契約書テンプレート」に継ぎ足すとテンプレートを書き換えてしまうので複製を作る.
      if($case["callup_contract_type"] == '1')
      {
        $newDocument = [
          "material_name" => $document['name'],
          "client_id"     => $document['client_id'],
          "is_temporary_creation" => 1,
        ];
        $newDocument = $eContractDocumentDao->setDocument($newDocument);
        $case["e_contract_document_id"] = $newDocument["document"]["document_id"];
        $case["callup_contract_type"] = 2; // 複製したことから 次回からは裏では「新しく書類（PDF)をアップロードして設定する」選択扱いで処理することになる.
        $eContractCaseDao->updateCase($case, "id = {$case["id"]}");
        foreach ($copyFileList as $_file)
        {
          if($_file["id"] == $replaceFile["id"]) {
            continue;
          }
          $newFile = $_file;
          $newFile['e_contract_document_id'] = $newDocument["document"]["document_id"];
          $newFile = $eContractFileDao->copyFile($newFile);

          $copyFormList = $eContractFormDao->getFormList("e_contract_file_id = {$_file['id']}");
          foreach ($copyFormList as $_form)
          {
            $newForm = $_form;
            $newForm["e_contract_file_id"] = $newFile['id'];
            $newForm = $eContractFormDao->copyForm($newForm);
            $copyInputList = $eContractInputDao->getInputList("e_contract_form_id = {$newForm["id"]}");
            foreach ($copyInputList as $_input)
            {
              $newInput = $_input;
              unset($newInput['id']);
              $newInput["e_contract_form_id"] = $newForm["id"];
              $eContractInputDao->insertInput($newInput);
            }
          }
        }
        $document = $newDocument["document"];
      } else {
        // 差し替え対象PDFをハードデリート(editPartner()か、上記分岐で作った複製物の方を消すからテンプレート電子契約データを壊していない).
        $eContractFileDao->deleteFile("id = {$replaceFile["id"]}");
      }


      // ファイルを差し替え2 = 差し替え後PDFを継ぎ足す.
      $tmp = $_FILES['change_material_file']['tmp_name'];
      for($i=0; $i<count($tmp); $i++)
      {
        if($tmp[$i]=="") {
          continue;
        }
        unset($newMaterial["e_contract_document_material_id"]);
        $material = $eContractDocumentMaterialDao->setMaterial($newMaterial);
        $is_temporary = 1; // 「ファイル差し替え」で作成したデータならば 不要になったら使い捨てて良い一時ファイル状態固定になる.
        $file = $eContractFileDao->setFile2($_FILES['change_material_file'], $document["document_id"], $material["material"]["e_contract_document_material_id"], $i, $replaceFile["idx"], $is_temporary);
        $resut = $this->convertFileFromPdfToJpg($i, 'change_material_file', $uploaddir, $material["material"]["e_contract_document_material_id"]);
        if(count($resut['errorList']) == 0 && 0 < count($resut['params']))
        {
          $material = $eContractDocumentMaterialDao->setMaterial($resut['params']);
          $eContractDocumentMaterialDao->setMaterialDetail($material["material"]);
          $materialDetailList = $eContractDocumentMaterialDao->getMaterialDetailList("e_contract_document_material_id = {$material["material"]["e_contract_document_material_id"]}");
          $fileName = preg_replace('/-\d*.jpg?/', '.pdf', $materialDetailList[0]['material_filename']);
          $eContractMaterialBasic = $eContractMaterialBasicDao->registMaterialBasic($case["id"], $file['file'], $fileName);
          foreach($materialDetailList as $materialDetail) {
            $eContractMaterialDetailList[] = $eContractMaterialDetailDao->registMaterialDetail($eContractMaterialBasic['id'], $materialDetail);
          }
          // パーツを処分する.
          foreach($replaceInputList as $row)
          {
            $eContractInputDao->deleteInput("id = {$row["id"]}");
            foreach ($eContractMaterialDetailList as $materialDetail) {
              //「フォームパーツを残しますか？」 Yes=[leave_parts]=1.
              // MEMO. 差し替え前よりページ数が減る場合、無いページは移植しない=「バリデーション:全パーツが設定済みか」にハマり完了画面へ遷移できなくなるのを回避する為.
              if($form["leave_parts"] == 1 && $materialDetail["page"] == $row["page"]) {
                unset($row['id']);
                $row['e_contract_material_basic_id'] = $eContractMaterialBasic["id"];
                $eContractInputDao->insertInput($row);
                break;
              }
            }
          }

        } else {
          error_log(json_encode($resut['errorList']));
          return false;
        }
      }

      // 差し替え前の「電子契約書」マテリアルデータの削除削除.
      $eContractMaterialBasicDao->deleteMaterialBasic("id = {$replaceEContractMaterialBasic["id"]}");
      $eContractMaterialDetailDao->deleteMaterialDetail("e_contract_material_basic_id = {$replaceEContractMaterialBasic["id"]}");
      // 差し替え前の「電子契約書テンプレート」マテリアルデータが一時ファイルの場合
      if($replaceFile["is_temporary"] == 1) {
        // テンプレートとして使い回されるわけではない為 物理ファイル（PDF/JPG）も含めて削除する.
        $eContractDocumentMaterialDao->deleteMaterialRow("e_contract_document_material_id = {$replaceFile["e_contract_document_material_id"]}");
        $this->deleteMaterialFile($replaceFile["e_contract_document_material_id"]);
      }

      $this->db->commit();

    } catch (Exception $e) {
      $this->db->rollBack();
      error_log($e->getMessage());
      throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
      return false;
    }

    return true;
  }



  /**
   * インプット情報を登録する
   * @param unknown $form
   */
  public function creareInput($form) {
    // Daoの宣言
    $eContractInputDao = Application_CommonUtil::getInstance('dao', "EContractInputDao", $this->db);

    $inputForm = [
      'case_id'    => $form["case_id"],
      'form_id'    => isset($form['form_id'])    ? $form['form_id']    : 0,
      'partner_id' => isset($form['partner_id']) ? $form['partner_id'] : 0,
      'target'     => isset($form['target'])     ? $form['target']     : null,
      'img_data'   => isset($form['img_data'])   ? $form['img_data']   : null,
      'img_size'   => isset($form['img_size'])   ? $form['img_size']   : null,
      'required'   => isset($form['required'])   ? $form['required']   : null,
      'img_type'   => isset($form['img_type'])   ? $form['img_type']   : null,
    ];
    $formRow = [
      "type"       => isset($form['type'])       ? $form['type']       : null,
      "x"          => isset($form['x'])          ? $form['x']          : null,
      "y"          => isset($form['y'])          ? $form['y']          : null,
      "height"     => isset($form['height'])     ? $form['height']     : null,
      "width"      => isset($form['width'])      ? $form['width']      : null,
      "font_size"  => isset($form['font_size'])  ? $form['font_size']  : null,
      "page"       => isset($form['page'])       ? $form['page']       : null,
      "doc_idx"    => isset($form['doc_idx'])    ? $form['doc_idx']    : null,
    ];

    $material_basic_id = $form['e_contract_material_basic_id'];
    if($form['id']) {
      $result = $eContractInputDao->updateRecord($form, $formRow);
    } else {
      $result = $eContractInputDao->createInput($inputForm, $formRow, $material_basic_id);
    }
    return $result; // 生成したレコードのidを受け取る.
  }

  public function arrayFilterCallback( $a ) {
    return !is_string( $a ) || strlen( $a ) ;
  }


  /**
   * 承認をしたのが最後の承認者かを確認する
   * @param unknown $case_id
   */
  private function isLastApprovalRequest($case_id) {
    $eContractPartnerDao = Application_CommonUtil::getInstance('dao', "EContractPartnerDao", $this->db);
    // 未承認のパートナー一覧を取得
    $condition = " e_contract_case_id = {$case_id}";
    $partners = $eContractPartnerDao->getUnapprovedPartnerList($condition);

    if(count($partners) != 0) {
      $result = false;
    }else {
      $result = true;
    }
    return $result;
  }

  /**
   * case_idから承認依頼メールを送信する
   * @param unknown $form
   */
  public function sendApprovalRequest($form) {
    // 戻り値を宣言
    $result = array();

    // Daoの宣言
    $eContractPartnerDao = Application_CommonUtil::getInstance('dao', "EContractPartnerDao", $this->db);
    $mailModel = Application_CommonUtil::getInstance('model', "MailModel", $this->db);
    $eContractCaseDao = Application_CommonUtil::getInstance('dao', "EContractCaseDao", $this->db);

    $condition = "id = {$form["case_id"]}";
    $case = $eContractCaseDao->getCase($condition);
    // updatedateを入れて使える状態にする
    if(empty($case['update_date'])){
      try {
        $this->db->beginTransaction();
        $eContractCaseDao->updateDate($form["case_id"]);
        $this->db->commit();

      } catch (Exception $e) {
        $this->db->rollBack();
        error_log($e->getMessage());
        throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
        return false;
      }
    }
    // 未承認のパートナー一覧を取得
    $condition = " e_contract_case_id = {$form["case_id"]}";
    $partners = $eContractPartnerDao->getUnapprovedPartnerList($condition);

    // 契約書の承認方法を取得する
    $condition = "id = {$form["case_id"]}";
    $case = $eContractCaseDao->getCase($condition);
   

    if(count($partners) != 0) {
      // 未承認者がいれば次の承認者にメールを送信する
      $break = "\n";
      $lines = explode($break, $form["message"]);

      $message = '';
      foreach ($lines as $line) {
        $message .= $this->mb_wordwrap($line, 100, $break) . $break;
      }

      $mailModel->sendApprovalRequestMail2($partners[0]["email"], $partners[0]["token"], $message, $case['approval_method']);
      $result['status'] = 'sent';

      // 1人目にメール送信した日時を保存
      if ($partners[0]["approval_order"] == 1) {
        $condition = "id = {$partners[0]["id"]}";
        $eContractPartnerDao->setMailSentDate($condition);
      }
    } else {
      $result['status'] = 'unsent';
    }

    return $result;
  }

  /**
   * パートナーに承認依頼メールを再送信する
   * @param unknown $form
   */
  public function resendApprovalRequest($form) {
    // 戻り値を宣言
    $result = array();

    // Daoの宣言
    $eContractPartnerDao = Application_CommonUtil::getInstance('dao', "EContractPartnerDao", $this->db);
    $mailModel = Application_CommonUtil::getInstance('model', "MailModel", $this->db);

    //パートナーを取得
    $condition = "id = {$form["partner_id"]}";
    $partner = $eContractPartnerDao->getPartner2($condition);

    // メールを送信する
    $mailModel->resendApprovalRequestMail2($partner['email'], $partner['token'], $form['approval_method']);
    $result['status'] = 'sent';

    return $result;
  }


  /**
   * 電子契約書を契約書一覧から契約を論理削除する.
   * @param unknown $form
   */
  public function deleteContractList($form) {
    // 戻り値を宣言
    $result = array();

    // Daoの宣言
    $eContractCaseDao = Application_CommonUtil::getInstance('dao', "EContractCaseDao", $this->db);
    $eContractPartnerDao = Application_CommonUtil::getInstance('dao', "EContractPartnerDao", $this->db);
    $mailModel = Application_CommonUtil::getInstance('model', "MailModel", $this->db);

    // データを取得する.
    $caseCondition = "id = {$form["document_id"]}";
    $case = $eContractCaseDao->getCase($caseCondition);

    // バリデーション.
    if(is_null($case) || $case['delete_date'] != NULL || $case["client_id"] != $this->user["client_id"]) {
      return false;
    }

    try {

      // メールを送信する.
      $partnerCondition = "e_contract_case_id = {$case['id']}";
      $partnerList = $eContractPartnerDao->getPartnerList($partnerCondition);
      foreach($partnerList as $partner) {
        // 関係パートナーに 削除したことを メールで告知する.
        $mailModel->sendDeleteContract($partner['email'], $case['case_title']);
      }

      // 論理削除を行う.
      $this->db->beginTransaction();
      $result = $eContractCaseDao->softDeleteCase($case['id']);
      $this->db->commit();

    } catch (Exception $e) {
      $this->db->rollBack();
      error_log($e->getMessage());
      throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
      return false;
    }

    return $result;
  }




  /**
   * パーツ処理：パートナーの承認状態で契約書を集計した結果を取得 case_idのリスト.
   * @param unknown $form
   */
  public function getAggregateCaseIdListPartnerApprovalStatusByClientId($clientId) {

    // Daoの宣言
    $eContractCaseDao = Application_CommonUtil::getInstance('dao', "EContractCaseDao", $this->db);

    // 検索実施
    $countList = $eContractCaseDao->getPartnerCountApprovalStatusList($clientId);
    $confirmingIds = [];
    $completedIds = [];
    $canceledIds = [];
    $confirmingCondition = "";
    $completedCondition = "";
    $canceledCondition = "";
    if(0 < count($countList)) {
      foreach($countList as $count){
        // MEMO. uid　は らくらくAPIが 署名付きpdfを払い出したときに一緒にもらう値 = pdfはDBで管理していないのでDB値で判断できないのでuid判断.
        if(isset($count['uid'])) {
          $completedIds[] = $count['case_id']; // 「完了」 = 署名PDF持ちのものだけを指す.
        } else if(0 < $count['canceled_count']) {
          $canceledIds[] = $count['case_id'];  // 「却下」
        } else if($count['partner_count'] == $count['approval_count']){
          $confirmingIds[] = $count['case_id']; //「確認中」= 不具合の表示 非表示対象だが、バグで署名付きPDFの払い出しに失敗したケースがあった1年間のデータの出力.
        } else if($count['mail_sent_count'] > 0 ){
          $confirmingIds[] = $count['case_id'];// 「確認中」= メール送信済のデータがある場合、確認中として判断する.
        }
        // MEMO. なぜ SQLで null_target_countした結果を取得しないのか？ = バグってた1年感の間 targetがnullなのに 署名付きPDF依頼のAPIを叩いていた機関が1年もあるためそれを「確認中として」表示する為・・・.
      }
      if(0 < count($completedIds)) {
        $completedCondition  = "id IN(".implode(",", $completedIds).")";
      }
      if(0 < count($canceledIds)) {
        $canceledCondition   = "id IN(".implode(",", $canceledIds).")";
      }
      if(0 < count($confirmingIds)) {
        $confirmingCondition = "id IN(".implode(",", $confirmingIds).")";
      }
    }
    return compact('completedIds', 'canceledIds', 'confirmingIds', 'completedCondition', 'canceledCondition', 'confirmingCondition');
  }


  /**
   * GET 確認中電子契約一覧を取得
   * @param unknown $form
   */
  public function getConfirmingList($form, &$screenSession) {
    // セッションの初期化
    if($screenSession->isnew == true){
      $screenSession->order = 'id';
      $screenSession->page = 1;
      $screenSession->pagesize = 100;
      $screenSession->ordertype = 'desc';  // 任意
    }
    // パラメータをセッションに格納
    foreach($form as $key=>$val){
      $screenSession->$key = $val;
    }
    // Daoの宣言
    $eContractCaseDao = Application_CommonUtil::getInstance('dao', "EContractCaseDao", $this->db);

    // 変数宣言
    if($this->user["staff_role"] == self::STAFF_TYPE_AA_1 || $this->user["staff_role"] == self::STAFF_TYPE_CE_1 || $this->user["staff_role"] == self::STAFF_TYPE_AA_2 || $this->user["staff_role"] == self::STAFF_TYPE_CE_2){
      $clientId = $this->user["client_id"];
    }else{
      // 管理者とCE一般以外は、TOP画面へ遷移させる
      header("location:/index/menu");
      exit;
    }

    // 検索実施
    $countList = $this->getAggregateCaseIdListPartnerApprovalStatusByClientId($clientId);
    $completedCondition  = $countList['completedCondition'];
    $canceledCondition   = $countList['canceledCondition'];
    $confirmingCondition = $countList['confirmingCondition'];

    // 検索ボタンが押下された場合、ページを初期化する
    if(array_key_exists("free_word", $form)){
      $screenSession->page = 1;
    }
    // 検索条件が存在する場合は検索条件を作成する
    $dummyCondition = '';
    $condition = '';
    if($form["free_word"] != ""){
      $escapeText = $this->escape($screenSession->free_word);
      $condition .= "case_title like '%{$escapeText}%' ";
    } else {
      $condition = '';
    }

    if($form["tag"] != ""){
      $escapeText = $this->escape($screenSession->tag);
      $text = " id IN ( SELECT e_contract_case_id  FROM e_contract_tag WHERE name like '%{$escapeText}%' ) ";
      $condition .= ( $condition ? " AND " : "" ) . $text;
    }

    // 一般権限の場合はstaffの絞り込みをする
    if($this->user["staff_role"] == self::STAFF_TYPE_AA_2 || $this->user["staff_role"] == self::STAFF_TYPE_CE_2){
      $condition .= ( $condition ? " AND " : "" ) . " staff_id = " . $this->user['staff_id'] ." ";
    }

    $dataList = empty($confirmingCondition)?[]:$eContractCaseDao->getEContractCaseList($clientId, $screenSession->order, $screenSession->ordertype , $screenSession->page, $screenSession->pagesize, $confirmingCondition, $condition);
    $confirmingCount = empty($confirmingCondition)?0:$eContractCaseDao->getEContractCaseCount($confirmingCondition, $condition);
    $completedCount = empty($completedCondition)?0:$eContractCaseDao->getEContractCaseCount($completedCondition, $condition);
    $canceledCount = empty($canceledCondition)?0:$eContractCaseDao->getEContractCaseCount($canceledCondition, $condition);

    // ページャ設定
    $list = new Application_Pager(array(
      "itemData" => $dataList,        // リスト
      "itemCount" => $confirmingCount,      // カウント
      "perPage" => $screenSession->pagesize,    // ページごと表示件数
      "curPage" => $screenSession->page,      // 表示するページ
      "order" => $screenSession->order,      // ソートカラム名
      "orderType" => $screenSession->ordertype,  // asc or desc
    ));

    // 戻り値を作成する
    $result["list"] = $list;
    $result["completedCount"] = $completedCount;
    $result["canceledCount"] = $canceledCount;
    $result["registMsg"] = "";

    // セッション取得
    $session = Application_CommonUtil::getSession(self::IDENTIFIER);
    if(!is_null($session->registComplete)){
      // セッション情報を初期化する
      Application_CommonUtil::unsetSession(self::IDENTIFIER);
      // メッセージを設定する
      $result["registMsg"] = $this->message->success->regist->aa_staff;
    }
    return $result;
  }

  /**
   * GET 確認中電子契約一覧を取得
   * @param unknown $form
   */
  public function getPartnerConfirmingList($form, &$screenSession) {

    // Daoの宣言
    $eContractCaseDao = Application_CommonUtil::getInstance('dao', "EContractCaseDao", $this->db);
    $eContractPartnerDao = Application_CommonUtil::getInstance('dao', "EContractPartnerDao", $this->db);

    // セッションの初期化
    if($screenSession->isnew == true){
      $screenSession->order = 'id';
      $screenSession->page = 1;
      $screenSession->pagesize = 100;
      $screenSession->ordertype = 'asc';  // 任意
    }
    // パラメータをセッションに格納
    foreach($form as $key=>$val){
      $screenSession->$key = $val;
    }
    // セッション取得
    $session = Application_CommonUtil::getSession('e_contract_api');

    // ゲスト承認者のメールアドレスとパスワードが正しいかチェック
    $condition = "email = '" . $session->partnerEmail . "' AND password = '" . md5($session->partnerPassword) . "'";
    $count = $eContractPartnerDao->getPartnerCount2($condition);
    if($count == 0) {
      header("location:/index/menu");
      exit;
    }

    // 検索実施
    $countList = $eContractCaseDao->getCountListWithEmail($session->partnerEmail);
    $excludeCondition = '';
    if(count($countList) != 0) {
      $caseIds = '';
      foreach($countList as $count){
        if($count['form_count'] != $count['input_count']) {
          $caseIds = $caseIds . strval($count['id']) . ', ';
        }
      }
      if (!empty($caseIds)) {
        $caseIds = substr($caseIds, 0, strlen($caseIds) - 2);
        $excludeCondition = "AND id NOT IN($caseIds)";
      }
    }

    // 検索ボタンが押下された場合、ページを初期化する
    if(array_key_exists("free_word", $form)){
      $screenSession->page = 1;
    }
    // 検索条件が存在する場合は検索条件を作成する
    $dummyCondition = '';
    $condition = '';
    if($form["free_word"] != ""){
      $escapeText = $this->escape($screenSession->free_word);
      $condition .= " AND case_title like '%{$escapeText}%' ";
    }

    $confirmingCount = $eContractCaseDao->getConfirmingCountWithEmail($session->partnerEmail, $excludeCondition, $condition);
    $completedCount = $eContractCaseDao->getCompletedCountWithEmail($session->partnerEmail, $dummyCondition);
    $canceledCount = $eContractCaseDao->getCanceledCountWithEmail($session->partnerEmail, $dummyCondition);
    $dataList = $eContractCaseDao->getConfirmingListWithEmail($session->partnerEmail, $screenSession->order, $screenSession->ordertype , $screenSession->page, $screenSession->pagesize, $excludeCondition, $condition);

    // ページャ設定
    $list = new Application_Pager(array(
      "itemData" => $dataList,        // リスト
      "itemCount" => $confirmingCount,      // カウント
      "perPage" => $screenSession->pagesize,    // ページごと表示件数
      "curPage" => $screenSession->page,      // 表示するページ
      "order" => $screenSession->order,      // ソートカラム名
      "orderType" => $screenSession->ordertype,  // asc or desc
    ));

    // 戻り値を作成する
    $result["list"] = $list;
    $result["completedCount"] = $completedCount;
    $result["canceledCount"] = $canceledCount;
    $result["registMsg"] = "";

    return $result;
  }

  /**
   * GET 契約済み電子契約一覧を取得
   * @param unknown $form
   */
  public function getCompletedList($form, &$screenSession) {
    // セッションの初期化
    if($screenSession->isnew == true){
      $screenSession->order = 'id';
      $screenSession->page = 1;
      $screenSession->pagesize = 100;
      $screenSession->ordertype = 'desc';  // 任意
    }
    // パラメータをセッションに格納
    foreach($form as $key=>$val){
      $screenSession->$key = $val;
    }
    // Daoの宣言
    $eContractCaseDao = Application_CommonUtil::getInstance('dao', "EContractCaseDao", $this->db);

    // 変数宣言
    if($this->user["staff_role"] == self::STAFF_TYPE_AA_1 || $this->user["staff_role"] == self::STAFF_TYPE_CE_1 || $this->user["staff_role"] == self::STAFF_TYPE_AA_2 || $this->user["staff_role"] == self::STAFF_TYPE_CE_2){
      $clientId = $this->user["client_id"];
    }else{
      // 管理者とCE一般以外は、TOP画面へ遷移させる
      header("location:/index/menu");
      exit;
    }

    // 検索実施
    $countList = $this->getAggregateCaseIdListPartnerApprovalStatusByClientId($clientId);
    $completedCondition  = $countList['completedCondition'];
    $canceledCondition   = $countList['canceledCondition'];
    $confirmingCondition = $countList['confirmingCondition'];

    // 検索ボタンが押下された場合、ページを初期化する
    if(array_key_exists("free_word", $form)){
      $screenSession->page = 1;
    }

    // 検索条件が存在する場合は検索条件を作成する
    $dummyCondition = '';
    $condition = '';
    if($form["free_word"] != ""){
      $escapeText = $this->escape($screenSession->free_word);
      $condition .= "case_title like '%{$escapeText}%' ";
    } else {
      $condition = '';
    }

    if($form["tag"] != ""){
      $escapeText = $this->escape($screenSession->tag);
      $text = " id IN ( SELECT e_contract_case_id  FROM e_contract_tag WHERE name like '%{$escapeText}%' ) ";
      $condition .= ( $condition ? " AND " : "" ) . $text;
    }

    // 一般権限の場合はstaffの絞り込みをする
    if($this->user["staff_role"] == self::STAFF_TYPE_AA_2 || $this->user["staff_role"] == self::STAFF_TYPE_CE_2){
      $condition .= ( $condition ? " AND " : "" ) . " staff_id = " . $this->user['staff_id'] ." ";
    }

    $dataList = empty($completedCondition)?[]:$eContractCaseDao->getEContractCaseList($clientId, $screenSession->order, $screenSession->ordertype , $screenSession->page, $screenSession->pagesize, $completedCondition, $condition);
    $confirmingCount = count(empty($confirmingCondition)?[]:$eContractCaseDao->getEContractCaseList($clientId, $screenSession->order, $screenSession->ordertype , 0, 0, $confirmingCondition, $condition));
    $completedCount = count(empty($completedCondition)?[]:$eContractCaseDao->getEContractCaseList($clientId, $screenSession->order, $screenSession->ordertype , 0, 0, $completedCondition, $condition));
    $canceledCount = count(empty($canceledCondition)?[]:$eContractCaseDao->getEContractCaseList($clientId, $screenSession->order, $screenSession->ordertype , 0, 0, $canceledCondition, $condition));

    // ページャ設定
    $list = new Application_Pager(array(
      "itemData" => $dataList,        // リスト
      "itemCount" => $completedCount,      // カウント
      "perPage" => $screenSession->pagesize,    // ページごと表示件数
      "curPage" => $screenSession->page,      // 表示するページ
      "order" => $screenSession->order,      // ソートカラム名
      "orderType" => $screenSession->ordertype,  // asc or desc
    ));

    // 戻り値を作成する
    $result["list"] = $list;
    $result["confirmingCount"] = $confirmingCount;
    $result["canceledCount"] = $canceledCount;
    $result["registMsg"] = "";

    // セッション取得
    $session = Application_CommonUtil::getSession(self::IDENTIFIER);
    if(!is_null($session->registComplete)){
      // セッション情報を初期化する
      Application_CommonUtil::unsetSession(self::IDENTIFIER);
      // メッセージを設定する
      $result["registMsg"] = $this->message->success->regist->aa_staff;
    }
    return $result;
  }

  /**
   * GET ゲスト契約済み電子契約一覧を取得
   * @param unknown $form
   */
  public function getPartnerCompletedList($form, &$screenSession) {

    // Daoの宣言
    $eContractCaseDao = Application_CommonUtil::getInstance('dao', "EContractCaseDao", $this->db);
    $eContractPartnerDao = Application_CommonUtil::getInstance('dao', "EContractPartnerDao", $this->db);

    // セッションの初期化
    if($screenSession->isnew == true){
      $screenSession->order = 'id';
      $screenSession->page = 1;
      $screenSession->pagesize = 100;
      $screenSession->ordertype = 'asc';  // 任意
    }
    // パラメータをセッションに格納
    foreach($form as $key=>$val){
      $screenSession->$key = $val;
    }
    // セッション取得
    $session = Application_CommonUtil::getSession('e_contract_api');

    // ゲスト承認者のメールアドレスとパスワードが正しいかチェック
    $condition = "email = '" . $session->partnerEmail . "' AND password = '" . md5($session->partnerPassword) . "'";
    $count = $eContractPartnerDao->getPartnerCount2($condition);
    if($count == 0) {
      header("location:/index/menu");
      exit;
    }

    // 検索実施
    $countList = $eContractCaseDao->getCountListWithEmail($session->partnerEmail);
    $excludeCondition = '';
    if(count($countList) != 0) {
      $caseIds = '';
      foreach($countList as $count){
        if($count['form_count'] != $count['input_count']) {
          $caseIds = $caseIds . strval($count['id']) . ', ';
        }
      }
      if (!empty($caseIds)) {
        $caseIds = substr($caseIds, 0, strlen($caseIds) - 2);
        $excludeCondition = "AND id NOT IN($caseIds)";
      }
    }

    // 検索ボタンが押下された場合、ページを初期化する
    if(array_key_exists("free_word", $form)){
      $screenSession->page = 1;
    }
    // 検索条件が存在する場合は検索条件を作成する
    $dummyCondition = '';
    $condition = '';
    if($form["free_word"] != ""){
      $escapeText = $this->escape($screenSession->free_word);
      $condition .= " AND case_title like '%{$escapeText}%' ";
    }

    // 一般権限の場合はstaffの絞り込みをする
    if($this->user["staff_role"] == self::STAFF_TYPE_AA_2 || $this->user["staff_role"] == self::STAFF_TYPE_CE_2){
      $condition .= "staff_id = " . $this->user['staff_id'] ." ";
    }

    $confirmingCount = $eContractCaseDao->getConfirmingCountWithEmail($session->partnerEmail, $excludeCondition, $dummyCondition);
    $completedCount = $eContractCaseDao->getCompletedCountWithEmail($session->partnerEmail, $condition);
    $canceledCount = $eContractCaseDao->getCanceledCountWithEmail($session->partnerEmail, $dummyCondition);
    $dataList = $eContractCaseDao->getCompletedListWithEmail($session->partnerEmail, $screenSession->order, $screenSession->ordertype , $screenSession->page, $screenSession->pagesize, $condition);

    // ページャ設定
    $list = new Application_Pager(array(
      "itemData" => $dataList,        // リスト
      "itemCount" => $completedCount,      // カウント
      "perPage" => $screenSession->pagesize,    // ページごと表示件数
      "curPage" => $screenSession->page,      // 表示するページ
      "order" => $screenSession->order,      // ソートカラム名
      "orderType" => $screenSession->ordertype,  // asc or desc
    ));

    // 戻り値を作成する
    $result["list"] = $list;
    $result["confirmingCount"] = $confirmingCount;
    $result["canceledCount"] = $canceledCount;
    $result["registMsg"] = "";

    return $result;
  }

  /**
   * GET 却下された電子契約一覧を取得
   * @param unknown $form
   */
  public function getCanceledList($form, &$screenSession) {
    // セッションの初期化
    if($screenSession->isnew == true){
      $screenSession->order = 'id';
      $screenSession->page = 1;
      $screenSession->pagesize = 100;
      $screenSession->ordertype = 'desc';  // 任意
    }
    // パラメータをセッションに格納
    foreach($form as $key=>$val){
      $screenSession->$key = $val;
    }
    // Daoの宣言
    $eContractCaseDao = Application_CommonUtil::getInstance('dao', "EContractCaseDao", $this->db);

    // 変数宣言
    if($this->user["staff_role"] == self::STAFF_TYPE_AA_1 || $this->user["staff_role"] == self::STAFF_TYPE_CE_1 || $this->user["staff_role"] == self::STAFF_TYPE_AA_2 || $this->user["staff_role"] == self::STAFF_TYPE_CE_2){
      $clientId = $this->user["client_id"];
    }else{
      // 管理者とCE一般以外は、TOP画面へ遷移させる
      header("location:/index/menu");
      exit;
    }


    // 検索実施
    $countList = $this->getAggregateCaseIdListPartnerApprovalStatusByClientId($clientId);
    $completedCondition  = $countList['completedCondition'];
    $canceledCondition   = $countList['canceledCondition'];
    $confirmingCondition = $countList['confirmingCondition'];


    // 検索ボタンが押下された場合、ページを初期化する
    if(array_key_exists("free_word", $form)){
      $screenSession->page = 1;
    }

    // 検索条件が存在する場合は検索条件を作成する
    $dummyCondition = '';
    $condition = '';
    if($form["free_word"] != ""){
      $escapeText = $this->escape($screenSession->free_word);
      $condition .= "case_title like '%{$escapeText}%' ";
    } else {
      $condition = '';
    }

    if($form["tag"] != ""){
      $escapeText = $this->escape($screenSession->tag);
      $text = " id IN ( SELECT e_contract_case_id  FROM e_contract_tag WHERE name like '%{$escapeText}%' ) ";
      $condition .= ( $condition ? " AND " : "" ) . $text;
    }

    // 一般権限の場合はstaffの絞り込みをする
    if($this->user["staff_role"] == self::STAFF_TYPE_AA_2 || $this->user["staff_role"] == self::STAFF_TYPE_CE_2){
      $condition .= ( $condition ? " AND " : "" ) . " staff_id = " . $this->user['staff_id'] ." ";
    }

    $dataList = empty($canceledCondition)?[]:$eContractCaseDao->getEContractCaseList($clientId, $screenSession->order, $screenSession->ordertype , $screenSession->page, $screenSession->pagesize, $canceledCondition, $condition);
    $confirmingCount = count(empty($confirmingCondition)?[]:$eContractCaseDao->getEContractCaseList($clientId, $screenSession->order, $screenSession->ordertype , 0, 0, $confirmingCondition, $condition));
    $completedCount = count(empty($completedCondition)?[]:$eContractCaseDao->getEContractCaseList($clientId, $screenSession->order, $screenSession->ordertype , 0, 0, $completedCondition, $condition));
    $canceledCount = count(empty($canceledCondition)?[]:$eContractCaseDao->getEContractCaseList($clientId, $screenSession->order, $screenSession->ordertype , 0, 0, $canceledCondition, $condition));

    // ページャ設定
    $list = new Application_Pager(array(
      "itemData" => $dataList,        // リスト
      "itemCount" => $canceledCount,      // カウント
      "perPage" => $screenSession->pagesize,    // ページごと表示件数
      "curPage" => $screenSession->page,      // 表示するページ
      "order" => $screenSession->order,      // ソートカラム名
      "orderType" => $screenSession->ordertype,  // asc or desc
    ));

    // 戻り値を作成する
    $result["list"] = $list;
    $result["confirmingCount"] = $confirmingCount;
    $result["completedCount"] = $completedCount;
    $result["registMsg"] = "";

    // セッション取得
    $session = Application_CommonUtil::getSession(self::IDENTIFIER);
    if(!is_null($session->registComplete)){
      // セッション情報を初期化する
      Application_CommonUtil::unsetSession(self::IDENTIFIER);
      // メッセージを設定する
      $result["registMsg"] = $this->message->success->regist->aa_staff;
    }
    return $result;
  }

  /**
   * GET ゲスト却下された電子契約一覧を取得
   * @param unknown $form
   */
  public function getPartnerCanceledList($form, &$screenSession) {

    // Daoの宣言
    $eContractCaseDao = Application_CommonUtil::getInstance('dao', "EContractCaseDao", $this->db);
    $eContractPartnerDao = Application_CommonUtil::getInstance('dao', "EContractPartnerDao", $this->db);

    // セッションの初期化
    if($screenSession->isnew == true){
      $screenSession->order = 'id';
      $screenSession->page = 1;
      $screenSession->pagesize = 100;
      $screenSession->ordertype = 'asc';  // 任意
    }
    // パラメータをセッションに格納
    foreach($form as $key=>$val){
      $screenSession->$key = $val;
    }
    // セッション取得
    $session = Application_CommonUtil::getSession('e_contract_api');

    // ゲスト承認者のメールアドレスとパスワードが正しいかチェック
    $condition = "email = '" . $session->partnerEmail . "' AND password = '" . md5($session->partnerPassword) . "'";
    $count = $eContractPartnerDao->getPartnerCount2($condition);
    if($count == 0) {
      header("location:/index/menu");
      exit;
    }

    // 検索実施
    $countList = $eContractCaseDao->getCountListWithEmail($session->partnerEmail);
    $excludeCondition = '';
    if(count($countList) != 0) {
      $caseIds = '';
      foreach($countList as $count){
        if($count['form_count'] != $count['input_count']) {
          $caseIds = $caseIds . strval($count['id']) . ', ';
        }
      }
      if (!empty($caseIds)) {
        $caseIds = substr($caseIds, 0, strlen($caseIds) - 2);
        $excludeCondition = "AND id NOT IN($caseIds)";
      }
    }

    // 検索ボタンが押下された場合、ページを初期化する
    if(array_key_exists("free_word", $form)){
      $screenSession->page = 1;
    }
    // 検索条件が存在する場合は検索条件を作成する
    $dummyCondition = '';
    $condition = '';
    if($form["free_word"] != ""){
      $escapeText = $this->escape($screenSession->free_word);
      $condition .= " AND case_title like '%{$escapeText}%' ";
    }

    // 一般権限の場合はstaffの絞り込みをする
    if($this->user["staff_role"] == self::STAFF_TYPE_AA_2 || $this->user["staff_role"] == self::STAFF_TYPE_CE_2){
      $condition .= "staff_id = " . $this->user['staff_id'] ." ";
    }

    $confirmingCount = $eContractCaseDao->getConfirmingCountWithEmail($session->partnerEmail, $excludeCondition, $dummyCondition);
    $completedCount = $eContractCaseDao->getCompletedCountWithEmail($session->partnerEmail, $dummyCondition);
    $canceledCount = $eContractCaseDao->getCanceledCountWithEmail($session->partnerEmail, $condition);
    $dataList = $eContractCaseDao->getCanceledListWithEmail($session->partnerEmail, $screenSession->order, $screenSession->ordertype , $screenSession->page, $screenSession->pagesize, $condition);

    // ページャ設定
    $list = new Application_Pager(array(
      "itemData" => $dataList,        // リスト
      "itemCount" => $canceledCount,      // カウント
      "perPage" => $screenSession->pagesize,    // ページごと表示件数
      "curPage" => $screenSession->page,      // 表示するページ
      "order" => $screenSession->order,      // ソートカラム名
      "orderType" => $screenSession->ordertype,  // asc or desc
    ));

    // 戻り値を作成する
    $result["list"] = $list;
    $result["confirmingCount"] = $confirmingCount;
    $result["completedCount"] = $completedCount;
    $result["registMsg"] = "";

    return $result;
  }

  /**
  * 電子契約書案件と承認者一覧を取得
  * @params unknow $form
  */
  public function getPartnerList($form, $is_room) {
    // Daoの宣言
    $eContractCaseDao = Application_CommonUtil::getInstance('dao', "EContractCaseDao", $this->db);
    $eContractDocumentDao = Application_CommonUtil::getInstance('dao', "EContractDocumentDao", $this->db);
    $eContractPartnerDao = Application_CommonUtil::getInstance('dao', "EContractPartnerDao", $this->db);
    $eContractFileDao = Application_CommonUtil::getInstance('dao', "EContractFileDao", $this->db);
    $eContractFormDao = Application_CommonUtil::getInstance('dao', "EContractFormDao", $this->db);
    $eContractInputDao = Application_CommonUtil::getInstance('dao', "EContractInputDao", $this->db);
    $eContractDocumentMaterialDao = Application_CommonUtil::getInstance('dao', "EContractDocumentMaterialDao", $this->db);
    $eContractMaterialBasicDao = Application_CommonUtil::getInstance('dao', "EContractMaterialBasicDao", $this->db);
    $eContractMaterialDetailDao = Application_CommonUtil::getInstance('dao', "EContractMaterialDetailDao", $this->db);

    // 電子契約書案件を取得
    $caseCondition = "id = {$form['id']}";
    $case = $eContractCaseDao->getCase($caseCondition);
    $case['is_done'] = $this->validContractDone($case);

    // 電子契約書テンプレートを取得
    $documentCondition = "id = {$case["e_contract_document_id"]}";
    $document = $eContractDocumentDao->getDocument($documentCondition);

    // 承認者一覧書取得
    $partnerCondition = "e_contract_case_id = {$form['id']}";
    $partnerList = $eContractPartnerDao->getPartnerList($partnerCondition);

    // 契約書ファイル一覧を取得
    $fileCondition = " e_contract_document_id = {$case["e_contract_document_id"]}";
    $fileList = $eContractFileDao->getFileList($fileCondition);


    // 資料詳細一覧を取得
    $materialList = array();
    // room内とで構造の違いあり.
    if($is_room) {
      foreach ($fileList as $file) {
        $materialCondition = " e_contract_document_material_id = {$file["e_contract_document_material_id"]}";
        $tmpList = $eContractDocumentMaterialDao->getMaterialDetailList($materialCondition);
        $materialList[] = $tmpList;
      }
    } else {
      $eContractMaterialBasicList = $eContractMaterialBasicDao->getMaterialBasicList("case_id = {$case["id"]}");
      foreach ($eContractMaterialBasicList as $eContractMaterialBasic) {
        $materialList[] = $eContractMaterialDetailDao->getMaterialDetailList("e_contract_material_basic_id = {$eContractMaterialBasic["id"]}");
      }
    }


    // フォーム一覧を取得
    $formList = array();
    foreach ($fileList as $file) {
      $formCondition = "e_contract_file_id = {$file['id']}";
      $tmpList = $eContractFormDao->getFormList($formCondition);
      $formList[] = $tmpList;
    }

    // 入力済みフォーム一覧を取得
    $inputCondition = "e_contract_case_id = {$form['id']}";
    $inputList = $eContractInputDao->getInputList($inputCondition);

    $result["case"] = $case;
    $result["document"] = $document;
    $result["partnerList"] = $partnerList;
    $result["fileList"] = $fileList;
    $result["materialList"] = $materialList;
    $result["formList"] = $formList;
    $result["inputList"] = $inputList;
    return $result;
  }

  /**
  * 電子契約書案件と承認者一覧を取得
  * @params unknow $form
  */
  public function getContractList($form) {
    // Daoの宣言
    $eContractCaseDao = Application_CommonUtil::getInstance('dao', "EContractCaseDao", $this->db);
    $eContractDocumentDao = Application_CommonUtil::getInstance('dao', "EContractDocumentDao", $this->db);
    $eContractPartnerDao = Application_CommonUtil::getInstance('dao', "EContractPartnerDao", $this->db);
    $eContractMaterialBasicDao = Application_CommonUtil::getInstance('dao', "EContractMaterialBasicDao", $this->db);
    $eContractMaterialDetailDao = Application_CommonUtil::getInstance('dao', "EContractMaterialDetailDao", $this->db);
    $eContractInputDao = Application_CommonUtil::getInstance('dao', "EContractInputDao", $this->db);
    // 電子契約書案件を取得
    $caseCondition = "id = {$form['id']}";
    $case = $eContractCaseDao->getCase($caseCondition);
    $case['is_done'] = $this->validContractDone($case);

    // 電子契約書テンプレートを取得
    $documentCondition = "id = {$case["e_contract_document_id"]}";
    $document = $eContractDocumentDao->getDocument($documentCondition);

    // 承認者一覧書取得
    $partnerCondition = "e_contract_case_id = {$form["id"]}";
    $partnerList = $eContractPartnerDao->getPartnerList($partnerCondition);

    //資料一覧を取得
    $materialBasicCondition = "case_id = {$case["id"]}";
    $materialBasicList = $eContractMaterialBasicDao->getMaterialBasicList($materialBasicCondition);

    // 資料詳細一覧を取得
    $materialDetailList = array();
    foreach ($materialBasicList as $materialBasic) {
      $materialDetailCondition = "e_contract_material_basic_id = {$materialBasic["id"]}";
      $tmpList = $eContractMaterialDetailDao->getMaterialDetailList($materialDetailCondition);
      $materialDetailList[] = $tmpList;
    }

    // フォーム一覧を取得
    $inputList = array();
    foreach ($materialBasicList as $materialBasic) {
      $inputCondition = "e_contract_material_basic_id = {$materialBasic["id"]}";
      $tmpList = $eContractInputDao->getInputWithPartnerList($inputCondition);
      $inputList[] = $tmpList;
    }

    $result["case"] = $case;
    $result["document"] = $document;
    $result["partnerList"] = $partnerList;
    $result["fileList"] = $materialBasicList;
    $result["materialList"] = $materialDetailList;
    $result["formList"] = $inputList;
    return $result;
  }

  /**
   * フォーム情報を取得する
   * @param unknown $form
   */
   public function getFormRow($form) {
     // Daoの宣言
     $eContractFormDao = Application_CommonUtil::getInstance('dao', "EContractFormDao", $this->db);

     $condition = " id = {$form['form_id']}";
     $result = $eContractFormDao->getFormRow($condition);

     return $result;
   }

   /**
    * 同じ案件のパートナー一覧を取得する
    * @param unknown $form
    */
  public function getSameCasePartnerList($form) {
    // Daoの宣言
    $eContractPartnerDao = Application_CommonUtil::getInstance('dao', "EContractPartnerDao", $this->db);

    // 同じ案件のパートナー一覧を取得
    $condition = " e_contract_case_id = {$form['case_id']}";
    $result = $eContractPartnerDao->getPartnerList($condition);

    return $result;
  }

  /**
   * インプット情報を登録する
   * @param unknown $form
   */
  public function setInput($form, $formRow) {
    // Daoの宣言
    $eContractMaterialBasicDao = Application_CommonUtil::getInstance('dao', "EContractMaterialBasicDao", $this->db);
    $eContractInputDao = Application_CommonUtil::getInstance('dao', "EContractInputDao", $this->db);

    $inputCondition = "e_contract_form_id = {$form['form_id']} AND e_contract_case_id = {$form['case_id']}";
    $inputList = $eContractInputDao->getInputList($inputCondition);
    if(count($inputList) == 0) {
      // 資料データを取得
      $idx = intval($form["filePage"]);
      $materialBasicCondition = "case_id = {$form['case_id']} AND idx = {$idx}";
      $materialBasic = $eContractMaterialBasicDao->getMaterialBasic($materialBasicCondition);
      // 新規登録
      $result = $eContractInputDao->createInput($form, $formRow, $materialBasic['id']);
    } else {
      // 更新
      $result = $eContractInputDao->updateInput($form, $formRow);
    }
    return $result;
  }

  /**
   * インプット情報を削除する
   * @param unknown $form
   */
  public function deleteInput($form) {
    // Daoの宣言
    $eContractInputDao = Application_CommonUtil::getInstance('dao', "EContractInputDao", $this->db);

    $inputCondition = null;
    if($form["case_id"]){
          $inputCondition = "e_contract_case_id = {$form["case_id"]}";
    } else if($form["id"]) {
      $inputCondition = "id = {$form["id"]}";
    }

    $result = false;
    if($inputCondition != null) {
      $result = $eContractInputDao->deleteInput($inputCondition);
    }
    return $result;
  }

  /**
   * インプット情報を削除する
   * @param unknown $form
   */
  public function deleteInputRecord($form) {
    // Daoの宣言
    $eContractInputDao = Application_CommonUtil::getInstance('dao', "EContractInputDao", $this->db);

    $inputCondition = "e_contract_case_id = {$form["case_id"]}";
    $result = $eContractInputDao->deleteInput($inputCondition);

    return $result;
  }


  /**
   *パートナーの持つ契約書データ、フォームデータを取得する
   * @param unknown $form
   */
  public function getPartnerHasInputList($partner) {
   // Daoの宣言
    $eContractCaseDao = Application_CommonUtil::getInstance('dao', "EContractCaseDao", $this->db);
    $eContractMaterialBasicDao = Application_CommonUtil::getInstance('dao', "EContractMaterialBasicDao", $this->db);
    $eContractMaterialDetailDao = Application_CommonUtil::getInstance('dao', "EContractMaterialDetailDao", $this->db);
    $eContractInputDao = Application_CommonUtil::getInstance('dao', "EContractInputDao", $this->db);

    // 電子契約書案件を取得
    $caseCondition = "id = {$partner['e_contract_case_id']}";
    $case = $eContractCaseDao->getCase($caseCondition);

    //資料一覧を取得
    $materialBasicCondition = "case_id = {$partner['e_contract_case_id']}";
    $materialBasicList = $eContractMaterialBasicDao->getMaterialBasicList($materialBasicCondition);

    // 資料詳細一覧を取得
    $materialDetailList = array();
    foreach ($materialBasicList as $materialBasic) {
      $materialDetailCondition = "e_contract_material_basic_id = {$materialBasic["id"]}";
      $tmpList = $eContractMaterialDetailDao->getMaterialDetailList($materialDetailCondition);
      $materialDetailList[] = $tmpList;
    }

    // フォーム一覧を取得 資料のページ数ループを回す.
    $inputList = array();
    $inputCount = 0;
    foreach ($materialBasicList as $materialBasic) {
      // MEMO. 全ユーザの入力を表示したいという要望ありクエリーを変更.
      //$inputCondition = "e_contract_material_basic_id = {$materialBasic["id"]} AND e_contract_partner_id = {$partner["id"]}";
      $inputCondition = "e_contract_material_basic_id = {$materialBasic["id"]}";
      $tmpList = $eContractInputDao->getInputList($inputCondition);
      $inputList[] = $tmpList;

      // 全件のうち、署名者が対象になる件数を取得.
      foreach ($tmpList as $tmp) {
        if($tmp["e_contract_partner_id"] == $partner["id"]) {
          $inputCount++;
        }
      }

    }

    $result["case"] = $case;
    $result["fileList"] = $materialBasicList;
    $result["materialList"] = $materialDetailList;
    $result["formList"] = $inputList;
    $result["formCount"] = $inputCount;
    return $result;
  }

  /**
  * インプット情報を取得する
  * @param unknown $form
  */
  public function getInputRow($form) {
    // Daoの宣言
    $eContractInputDao = Application_CommonUtil::getInstance('dao', "EContractInputDao", $this->db);

    $condition = "id = {$form['form_id']}";
    $result = $eContractInputDao->getInputRow($condition);

    return $result;
  }

  /**
   * パートナーの入力情報を取得する
   * @param unknown $form
   */
  public function setValueAndGetValueInput($form, $input) {

    // セッションを取得
    $session = Application_CommonUtil::getSession(self::IDENTIFIER);
    // セッションに登録した情報を一時的に保持しておく
    $session->partnerValueInputs[] = $form;
    // Daoの宣言
    $eContractInputDao = Application_CommonUtil::getInstance('dao', "EContractInputDao", $this->db);

    $condition = "id = {$form['form_id']} AND e_contract_partner_id = {$form['partner_id']}";
    $result = $eContractInputDao->getValueInput($form['data'], $input);

    return $result;
  }

  /**
   * パートナーの入力情報を登録する
   * @param unknown $form
   */
  public function valueInput($form, $input) {
    // Daoの宣言
    $eContractInputDao = Application_CommonUtil::getInstance('dao', "EContractInputDao", $this->db);

    $condition = "id = {$form['form_id']} AND e_contract_partner_id = {$form['partner_id']}";
    $result = $eContractInputDao->valueInput($condition, $form['data'], $input);

    return $result;
  }
  /**
   * パートナーの入力情報を書き直す
   * @param unknown $form
   */
  public function valueInputRollBack($case_id, $partner_id) {
    // Daoの宣言
    $eContractInputDao = Application_CommonUtil::getInstance('dao', "EContractInputDao", $this->db);

    $condition = "e_contract_case_id = {$case_id} AND e_contract_partner_id = {$partner_id}";
    $result = $eContractInputDao->valueInputRollBack($condition);

    return $result;
  }

  /**
   * パートナーの入力情報を登録する
   * @param unknown $form
   */
  public function approval($form){
    // 戻り値を宣言
    $result = array();

    // Daoの宣言
    $eContractPartnerDao = Application_CommonUtil::getInstance('dao', "EContractPartnerDao", $this->db);

    // 承認する
    $condition = "id = {$form["partner_id"]}";
    // MEMO. 通常時の認証コードを設定する（二要素認証時はすでに設定済みとする）
    if(empty($form['password'])) {
      $password = md5($form["authentication_code"]);
    } else {
      $password = $form["password"];
    }
    // セッションを取得
    $session = Application_CommonUtil::getSession(self::IDENTIFIER);

    // トランザクションスタート
    $this->db->beginTransaction();
    try{

      // セッションに保存した入力情報をDBに保存
      foreach ($session->partnerValueInputs as $key => $artnerValueInput) {
        // フォーム情報を取得
        $input = $this->getInputRow($artnerValueInput);
        $this->valueInput($artnerValueInput, $input);
      }

      // 承認情報meet inDBに保持する
      $eContractPartnerDao->setApprovalStatus($condition, $password);
      
      // 最終承認者かを確認する
      if(!$this->isLastApprovalRequest($form["case_id"])){
        // 最終でなければ次の承認者へのメールを通知
        $result = $this->sendApprovalRequest($form);
        $result['statusCode'] = 200;
      }else {
        // 最終承認処理でAPI先で契約書を作成する
        $onestopResult = $this->onestopSigning($form);
        $result['status'] = 'unsent';
        $result['statusCode'] = $onestopResult['status'];
        $result['filePath'] = $onestopResult['filePath'];

        //  TODO. 最後の人物しからくらく電子APIを送信出来ない現状の処理がおかしい 設計を見直す必要あり = e_contract_caseで完了を管理する設計へ.
        // [応急処置] approvalAndNext() で承認済みにした 処理を元に戻す = 承認順のうち 最後の人物は何度でも承認画面に出入り出来る.
        if($onestopResult['status'] != 200) {

          $form["api_result"] = $onestopResult;
          if (array_key_exists('documents', $form["api_result"]['body'])) {
            $form["api_result"]['body']['documents'] = []; // PDFデータをDBに保存してしまわないように潰す.
          }
          throw new Exception(json_encode($onestopResult));
        }
      }

      $this->db->commit();
    }catch(Exception $e) {
      $this->db->rollBack();
      throw new Exception(sprintf('error. (%s)', $e->getMessage()));
    }

    return $result;
  }

  /**
   * 最終承認処理API処理
   * @param unknown $form
   */
  public function onestopSigning($form){
    // 契約、承認者、フォームデータを取得
    $data = $this->getContractData($form["case_id"]);
    // client_idからクレデンシャルを取得
    $credential = $form["credential"];

    $onestopResult["status"] = -1; // 初期値.

    // PDFの作成、及び APIに電子署名させる為の 印影の位置と大きさ等の情報の整形.
    $postDict = $this->makeEContractPDF($form);

    // API用にJSONに変換
    $postJson = json_encode($postDict, JSON_UNESCAPED_SLASHES);

    // 案件ワンストップ登録押印
    // 戻り値
    $onestopResult = $this->getApiRequest(self::API_URI.'v1/cases/onestop_sign',$postJson, $credential,NULL,'POST');

    // uidが戻ってこない場合締結ができていないのでエラーにする
    if($onestopResult['status'] == 200 && isset($onestopResult['body']['id'])) {
      // uidを保存
      $this->updateCaseUid($data['case']['id'], $onestopResult['body']['id']);

      // 登録済み契約書PDFを保存
      $document = base64_decode($onestopResult['body']['documents'][0]['data']);
      // ディレクトリがなければ作成して保存
      $directoryPath = 'e_contract_documents/'.$data['case']['client_id'];
      $filePath = $directoryPath.'/'.$onestopResult['body']['id'].'.pdf';
      if(file_exists($directoryPath)) {
        file_put_contents($filePath, $document);
      } else {
        mkdir($directoryPath);
        file_put_contents($filePath, $document);
      }
      $onestopResult['filePath'] = '/e_contract_documents/'.$data['case']['client_id'].'/'.$onestopResult['body']['id'].'.pdf';
      // ホストスタッフに契約完了通知メールを送信する
      $this->sendEContractAgreementMail($data['case']['staff_type'], $data['case']['staff_id']);
      // 承認者全員に契約完了通知メールを送信する
      $this->sendEContractAgreementPartnersMail($data['case']['id'], $onestopResult['filePath']);
    }

    return $onestopResult;
  }


  /*
   *  電子契約書PDFと、電子署名付き印影を押したPDFを取得するためのパラメータを作成する.
   */
  private function makeEContractPDF($form, $isDebug = false) {

    // 契約、承認者、フォームデータを取得
    $data = $this->getContractData($form["case_id"]);

    // 契約情報
    $postDict['params']['name']                                       = $data['case']['case_title'];
    if($data['case']['have_amount'] == '0') {
      $postDict['params']['haveAmount']                               = false;
    } else {
      $postDict['params']['haveAmount']                               = true;
    }
    $postDict['params']['amount']                                     = intval(($data['case']['amount'] === NULL) ? "" : $data['case']['amount']);
    $postDict['params']['agreementDate']                              = ($data['case']['agreement_date'] === NULL) ? "" : $data['case']['agreement_date'];
    $postDict['params']['effectiveDate']                              = ($data['case']['effective_date'] === NULL) ? "" : $data['case']['effective_date'];
    $postDict['params']['expireDate']                                 = ($data['case']['expire_date'] === NULL) ? "" : $data['case']['expire_date'];
    if($data['case']['auto_renewal'] == '0') {
      $postDict['params']['autoRenewal']                              = false;
    } else {
      $postDict['params']['autoRenewal']                              = true;
    }
    $postDict['params']['managementNumber']                           = $data['case']['management_number'];
    $postDict['params']['comment']                                    = $data['case']['comment'];


    // 契約書ドキュメント
    $postDict['documents'][0]['idx']   = 0;
    $postDict['documents'][0]['title'] = $data['fileList'][0]['title'];
    $postDict['documents'][0]['name']  = $data['fileList'][0]['name'];
    $postDict['documents'][0]['type']  = $data['fileList'][0]['type'];

    // MEMO.
    // らくらく電子APIは、２つしか印影をつけることができない. 仕様で連立で何人も署名出来る為、２つ以上の印影が必要になる場合もあるがそれは出来ない、
    // ３つ目以降の印影は、APIがエンドユーザに署名させるまでの流れで、サンプルで作成した「電子署名効果なし印影」を流用してPDFに埋め込み「それっぽくみせる」.
    $set_self_sign    = $isDebug ? true : false; // APIに処理させる２つの印影のうち オーナの印影.
    $set_partner_sign = $isDebug ? true : false; // APIに処理させる２つの印影のうち パートナーの印影.

    // フォームを組み合わせたPDFを作成
    // $originalDocumentDir = $this->config->file->original_document->path;
    // 開発用path
    $originalDocumentDir = 'cmn-e-contract';
    $jpgFiles = '';
    foreach($data['fileDetailList'] as $i => $fileDetail) {
      // jpgデータ
      $documentDetail = new Imagick("{$originalDocumentDir}/{$fileDetail['filename']}");

      $fileSize = getimagesize("{$originalDocumentDir}/{$fileDetail['filename']}");

      // MEMO.
      // 契約書の用紙の長い辺が 2000px程度のA4だろうが、3000pxを越えるB4用紙だろうが.
      // 以下のサイズのサムネイル画面でエンドユーザに入力させるので、用紙のサイズの解像度に合わせて計算してPDFにする必要がある.
      // 計算式は サムネイルサイズと契約書原寸サイズの連立方程式で計算.
      // サムネイル横用紙 718 1016.
      // サムネイル縦用紙 718 508.
      // 尚、 上記のサイズは フロントの電子契約書作成2ページ目の入力HTMLのCSSのサムネイル表示.
      // そちらのIMG表示サイズのCSSをいじったらこの計算式の値も変えること!(CSSデザインが処理の計算を狂わせる) ※ ルーム内電子契約書機能にも同じく入力HTMLがある点 留意. 

      $sheet_width  = 0;
      $sheet_height = 0;
      if($fileSize[0] <= $fileSize[1]) {
        $sheet_width  = 718;
        $sheet_height = 1016;
      } else {
        $sheet_width  = 718;
        $sheet_height = 508;
      }

      // フォーム合成
      foreach($data['formList'] as $fi => $_form) {
        if($_form['page'] == $i + 1) {
          if($_form['type'] == 'text' || $_form['type'] == 'textarea') {
            // テキスト合成
            $draw = new ImagickDraw();
            $string = $_form['value'];

            $tmp_font_size = ($fileSize[1] * intval($_form['font_size'])) / $sheet_height;


            $draw->setFontSize($tmp_font_size);
            $draw->setFillColor('#222222');
            $draw->setFont('./fonts/ipaexm.ttf');

            // MEMO. 計算式のうちの微調整値は、インターフェースの帯からのCSS 的な margin や padding で生じたズレの補正.
            $tmp_x = ($fileSize[0] * (intval($_form['x'])+20)) / $sheet_width;
            $tmp_y = ($fileSize[1] * (intval($_form['y'])+16+intval($_form['font_size']))) / $sheet_height; // ffont_sizeで勝手に付く行間のズレを計算に含めた.

            $draw->annotation($tmp_x, $tmp_y, $string);
            $documentDetail->drawImage($draw);
          } elseif($_form['type'] == 'checkbox') {

            // MEMO.
            // チェックボックスには 「入力を必須にする」で 必須か否かを設定出来る為 img_dataが 空のケースは未入力としスルーする.
            if(strlen($_form['img_data']) == 0) {
              continue;
            }

            // チェックボックス合成
            $checkboxBlob = base64_decode($_form['img_data']);
            $checkbox = new Imagick();
            $checkbox->readImageBlob($checkboxBlob);

            // MEMO. 計算式のうちの微調整値は、インターフェースの帯からのCSS 的な margin や padding で生じたズレの補正.
            $tmp_x = ($fileSize[0] * (intval($_form['x'])+14)) / $sheet_width;
            $tmp_y = ($fileSize[1] * (intval($_form['y'])+12)) / $sheet_height;
            $tmp_width  = ($fileSize[0] * (intval($_form['width'])+0)) / $sheet_width;
            $tmp_height = ($fileSize[1] * (intval($_form['height'])+0)) / $sheet_height;

            $checkbox->resizeImage($tmp_width, $tmp_height, self::IMAGICK_FILTER, self::IMAGICK_BLUR);
            $documentDetail->compositeImage($checkbox, imagick::COMPOSITE_DEFAULT, $tmp_x, $tmp_y);
          }
        }
      }

      // ホスト印影の合成
      foreach($data['selfSignList'] as  $si => $selfSign) {
        if($selfSign['page'] == $i + 1) {
          // MEMO.
          // 計算式のうちの微調整値は、インターフェースの帯からのCSS 的な margin や padding で生じたズレの補正.
          $tmp_x = ($fileSize[0] * (intval($selfSign['x'])+14)) / $sheet_width;
          $tmp_y = ($fileSize[1] * (intval($selfSign['y'])+8)) / $sheet_height;
          $tmp_width  = ($fileSize[0] * (intval($selfSign['width'])+0)) / $sheet_width;
          $tmp_height = ($fileSize[1] * (intval($selfSign['height'])+0)) / $sheet_height;

          // APIに電子署名(少し色が暗く,年月日入の電子署名入りの印影) させるか、PDFにサンプルの印影を帳尻合わせで差し込むかの分岐.
          if(!$set_self_sign) {
            $postDict['signInfos']['self']['isDigitalSign']           = false;
            $postDict['signInfos']['self']['signTurn']                = 2;
            $postDict['signInfos']['self']['signAreas'][0]['x']       = floatval($tmp_x);
            $postDict['signInfos']['self']['signAreas'][0]['y']       = floatval($tmp_y);
            $postDict['signInfos']['self']['signAreas'][0]['width']   = intval($tmp_width);
            $postDict['signInfos']['self']['signAreas'][0]['height']  = intval($tmp_height);
            $postDict['signInfos']['self']['signAreas'][0]['page']    = intval($selfSign['page']);
            $postDict['signInfos']['self']['signAreas'][0]['docIdx']  = intval($selfSign['doc_idx']);
            
            // 押印時の理由のために名前とメールアドレスをpost用のデータの含める
            $postDict['signInfos']['self']['info']['email'] = $selfSign["info"]['email'];
            $postDict['signInfos']['self']['info']['lastname'] = $selfSign["info"]['lastname'];
            $postDict['signInfos']['self']['info']['firstname'] = $selfSign["info"]['firstname'];

            $set_self_sign = true; // １件だけ電子署名印影が作成出来る (２つ以上のデータをAPIに含めるとAPIがコケる).

          } else {

            $signBlob = base64_decode($selfSign['img_data']);
            $sign = new Imagick();
            $sign->readImageBlob($signBlob);
            $sign->resizeImage($tmp_width, $tmp_height, self::IMAGICK_FILTER, 1);
            $documentDetail->compositeImage($sign, imagick::COMPOSITE_DEFAULT, $tmp_x, $tmp_y);
          }
        }
      }

      // ゲスト印影の合成
      foreach($data['partnerSignList'] as $pi => $partnerSignList) {
        foreach($partnerSignList['sign'] as $psi => $signData) {
          if($signData['page'] == $i + 1) {

            // MEMO. 計算式のうちの微調整値は、インターフェースの帯からのCSS 的な margin や padding で生じたズレの補正.
            $tmp_x = ($fileSize[0] * (intval($signData['x'])+14)) / $sheet_width;
            $tmp_y = ($fileSize[1] * (intval($signData['y'])+8)) / $sheet_height;
            $tmp_width  = ($fileSize[0] * (intval($signData['width'])+0)) / $sheet_width;
            $tmp_height = ($fileSize[0] * (intval($signData['height'])+0)) / $sheet_width;

            // 証明書用に承認者の情報を全て渡す
            // パートナー情報
            $postDict['partnersList'][$pi]['info']['email']            = $data['partnerList'][$pi]['email'];
            $postDict['partnersList'][$pi]['info']['lastname']         = $data['partnerList'][$pi]['lastname'];
            $postDict['partnersList'][$pi]['info']['firstname']        = $data['partnerList'][$pi]['firstname'];
            $postDict['partnersList'][$pi]['info']['title']            = $data['partnerList'][$pi]['title'];
            $postDict['partnersList'][$pi]['info']['organizationName'] = $data['partnerList'][$pi]['organization_name'];

            // APIに電子署名(少し色が暗く,年月日入の電子署名入りの印影) させるか、PDFにサンプルの印影を帳尻合わせで差し込むかの分岐.
            if(!$set_partner_sign) {

              // パートナー情報
              $postDict['signInfos']['partners'][0]['info']['email']            = $data['partnerList'][$pi]['email'];
              $postDict['signInfos']['partners'][0]['info']['lastname']         = $data['partnerList'][$pi]['lastname'];
              $postDict['signInfos']['partners'][0]['info']['firstname']        = $data['partnerList'][$pi]['firstname'];
              $postDict['signInfos']['partners'][0]['info']['title']            = $data['partnerList'][$pi]['title'];
              $postDict['signInfos']['partners'][0]['info']['organizationName'] = $data['partnerList'][$pi]['organization_name'];

              // パートナー印影エリア
              $postDict['signInfos']['partners'][0]['signAreas'][0]['x']        = floatval($tmp_x);
              $postDict['signInfos']['partners'][0]['signAreas'][0]['y']        = floatval($tmp_y);
              $postDict['signInfos']['partners'][0]['signAreas'][0]['width']    = intval($tmp_width);
              $postDict['signInfos']['partners'][0]['signAreas'][0]['height']   = intval($tmp_height);
              $postDict['signInfos']['partners'][0]['signAreas'][0]['page']     = intval($signData['page']);
              $postDict['signInfos']['partners'][0]['signAreas'][0]['docIdx']   = intval($signData['doc_idx']);

              // パートナー印影イメージ
              $postDict['signInfos']['partners'][0]['signImage']['data']        = $signData['img_data'];
              $postDict['signInfos']['partners'][0]['signImage']['type']        = $signData['img_type'];
              $postDict['signInfos']['partners'][0]['signImage']['size']        = intval($signData['img_size']);
              $postDict['signInfos']['partners'][0]['signImage']['width']       = intval($signData['img_width']);
              $postDict['signInfos']['partners'][0]['signImage']['height']      = intval($signData['img_height']);

              $set_partner_sign = true; // １件だけ電子署名印影が作成出来る (２つ以上のデータをAPIに含めるとAPIがコケる).

            } else {

              $signBlob = base64_decode($signData['img_data']);
              $sign = new Imagick();
              $sign->readImageBlob($signBlob);
              $sign->resizeImage($tmp_width, $tmp_height, self::IMAGICK_FILTER, 1);
              $documentDetail->compositeImage($sign, imagick::COMPOSITE_DEFAULT, $tmp_x, $tmp_y);
            }

          }
        }
      }

      // PDFファイル書き出し
      $jpgPath = $originalDocumentDir . '/e_contract_document_sample' . $i . '.jpg';
      $documentDetail->setImageCompressionQuality(10);
      $documentDetail->writeImage($jpgPath);

      $jpgFiles = $jpgFiles . ' ' . $jpgPath; // コマンド用 契約書の１ページjpgごとのパスを スペース区切りで繋ぐ.
    }

    $pdfPath = $originalDocumentDir . '/e_contract_document_sample.pdf';

    // JPGを結合して 署名済みのPDFにする.
    exec(sprintf("convert -strip -quality 50 {$jpgFiles} {$pdfPath}"));

    // PDFファイルサイズ取得
    $postDict['documents'][0]['size'] = filesize($pdfPath);

    // PDFファイルデータ取得
    $postDict['documents'][0]['data'] = base64_encode(file_get_contents($pdfPath));

    if($isDebug) {
      $postDict['documents'][0]['path'] = $pdfPath;
    }

    // 一時ファイルの削除
    foreach(glob($originalDocumentDir . "/e_contract_document_sample*") as $val) {
      if(!$isDebug) {
        unlink($val);
      }
    }

    return $postDict;
  }


  /***
  * curlでデータを取得するための関数
  * typeがarrayの場合は例外が発生しcatchでハンドリングした結果
  ***/
  private function getApiRequest($url,$postJson=NULL, $credential=NULL, $texts=NULL, $type=NULL) {

    $requestHeaderArray = array(
      'Accept: application/json; charset=utf-8',
      'X-Requested-With: XMLHttpRequest'                                                             
    );
    if(!is_null($credential)){
      $requestHeaderArray[] = 'Authorization: Bearer '.$credential;
    }
    if(!is_null($postJson)){
      $requestHeaderArray[] = 'Content-Type: application/json; charset=utf-8';
    }

    $client = new Zend_Http_Client($url, array(
      'maxredirects'  => 0,
      'timeout'    => 30)
    );
    $client->setHeaders($requestHeaderArray);
    $streamOpts = array(
              'ssl' => array(
                  'verify_peer' => false,
                  'allow_self_signed' => true
              )
    );
    
    $adapter = new Zend_Http_Client_Adapter_Socket();
    
    $adapter->setStreamContext($streamOpts);
    $client->setAdapter($adapter);

    if(!is_null($texts)){
      $client->setParameterGet('texts', $texts);
    }

    if($type=='PUT'){
      $response = $client->setRawData($postJson, "text/json")->request('PUT');
    }elseif($type=='POST'){
      $response = $client->setRawData($postJson, "text/json")->request('POST');
    }else{
      $response = $client->request();
    }

    return  $this->getResponce($response);
  }

  /**
   * 却下して全員へ却下メールを送信する
   * @param unknown $form
   */
  public function reject($form) {
    // 戻り値を宣言
    $result = array();

    // Daoの宣言
    $eContractCaseDao = Application_CommonUtil::getInstance('dao', "EContractCaseDao", $this->db);
    $eContractPartnerDao = Application_CommonUtil::getInstance('dao', "EContractPartnerDao", $this->db);
    $masterStaffDao = Application_CommonUtil::getInstance('dao', "MasterStaffDao", $this->db);
    $mailModel = Application_CommonUtil::getInstance('model', "MailModel", $this->db);

    // 却下する
    $condition = "id = {$form["partner_id"]}";
    // トランザクションスタート
    $this->db->beginTransaction();
    try{
      $eContractPartnerDao->setCancelStatus($condition);
      $this->db->commit();
    }catch(Exception $e) {
      $this->db->rollBack();
      throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
    }

    // ホストユーザーを取得
    $caseCondition = "id = {$form["case_id"]}";
    $case = $eContractCaseDao->getCase($caseCondition);
    $staffCondition =  "staff_type = '{$case["staff_type"]}' AND staff_id = {$case["staff_id"]}";
    $staff = $masterStaffDao->getMasterStaffRow($staffCondition);

    // 承認済みパートナー一覧取得
    $partnerCondition = "e_contract_case_id = {$case["id"]} AND approval_status = 1";
    $partnerList = $eContractPartnerDao->getPartnerList($partnerCondition);

    // ホストユーザーに却下通知メールを送信する
    $mailModel->sendEContractCancelStaffMail($staff['staff_email']);

    // 承認済みパートナーに却下通知メールを送信する
    foreach ($partnerList as $partner) {
      $mailModel->sendEContractCancelPartnerMail($partner['email']);
    }

    return $result;
  }

  /**
   * 契約、承認者、フォームデータを取得
   * @param unknown $caseId
   */
  public function getContractData($caseId) {
    // Daoの宣言
    $eContractCaseDao = Application_CommonUtil::getInstance('dao', "EContractCaseDao", $this->db);
    $eContractMaterialBasicDao = Application_CommonUtil::getInstance('dao', "EContractMaterialBasicDao", $this->db);
    $eContractMaterialDetailDao = Application_CommonUtil::getInstance('dao', "EContractMaterialDetailDao", $this->db);
    $eContractPartnerDao = Application_CommonUtil::getInstance('dao', "EContractPartnerDao", $this->db);
    $eContractInputDao = Application_CommonUtil::getInstance('dao', "EContractInputDao", $this->db);
    $eContractDocumentMaterialDao = Application_CommonUtil::getInstance('dao', "EContractDocumentMaterialDao", $this->db);
    $masterStaffDao = Application_CommonUtil::getInstance('dao', "MasterStaffDao", $this->db);
    // 電子契約書案件を取得
    $caseCondition = "id = {$caseId}";
    $case = $eContractCaseDao->getCase($caseCondition);
    $result["case"] = $case;

    // 契約書ファイル一覧を取得
    $fileCondition = "case_id = {$case["id"]}";
    $fileList = $eContractMaterialBasicDao->getMaterialBasicList($fileCondition);
    $fileDetailCondition = "e_contract_material_basic_id = {$fileList[0]['id']}";
    $fileDetailList = $eContractMaterialDetailDao->getMaterialDetailList($fileDetailCondition);

    // 印影を持つ承認者一覧書取得
    $partnerCondition = "e_contract_case_id = {$caseId}";
    $partnerList = $eContractPartnerDao->getPartnerList($partnerCondition);

    // フォーム一覧を取得
    $inputCondition = "e_contract_case_id = {$caseId}";
    $tmpList = $eContractInputDao->getInputList($inputCondition);
    foreach($tmpList as $tmp) {
      if($tmp['type'] == 'text' || $tmp['type'] == 'textarea' || $tmp['type'] == 'checkbox') {
        $result["formList"][] = $tmp;
      } elseif($tmp['type'] == 'sign' && $tmp['target'] == 'self') {
        $result["selfSignList"][] = $tmp;
      } elseif($tmp['type'] == 'sign' && $tmp['target'] == 'partner') {
        $i = 0;
        foreach($partnerList as $partner) {
          if($tmp['e_contract_partner_id'] == $partner['id']) {
            $result["partnerSignList"][$i]['sign'][] = $tmp;
            $i++;
          }
        }
      }
    }

    // selfは必ずアカウント保持者なので、署名の理由に記載のためにアカウント情報を取得
    $selfUserInfo = $masterStaffDao->getMasterStaffRow("staff_type = '{$case['staff_type']}' AND staff_id = '{$case['staff_id']}'");
    $result["selfSignList"][0]["info"]['email'] = $selfUserInfo['staff_email'];
    $result["selfSignList"][0]["info"]['lastname']  = $selfUserInfo['staff_lastname'];
    $result["selfSignList"][0]["info"]['firstname']  = $selfUserInfo['staff_firstname'];

    $result["case"]           = $case;
    $result["fileList"]       = $fileList;
    $result["fileDetailList"] = $fileDetailList;
    $result["partnerList"]    = $partnerList;

    return $result;
  }

  /**
   * APIから戻ってきたuidを保存する
   * @param unknown $caseId
   */
  public function updateCaseUid($caseId, $uid) {
    // Daoの宣言
    $eContractCaseDao = Application_CommonUtil::getInstance('dao', "EContractCaseDao", $this->db);
    try{
      // uidを保存する
      $condition = "id = {$caseId}";
      $eContractCaseDao->updateUid($uid, $condition);
    }catch(Exception $e) {
      throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
    }
  }

  /**
  * 認証コードを登録する
  * @param unknown $form
  **/
  // public function setAuthorizationCode($form) {
  //   // Daoの宣言
  //   $eContractAuthorizationDao = Application_CommonUtil::getInstance('dao', "EContractAuthorizationDao", $this->db);

  //   // 認証コード登録
  //   $result = $eContractAuthorizationDao->createAuthorization($form);
  //   return $result;
  // }

  /**
  * 現在のクライアントの電子契約APIアカウントをデータベースから1件取得
  **/
  public function getEContractAccount() {
    // 戻り値を宣言
    $result = array();
    $result['errorList'] = array();
    // daoの宣言
    $eContractAccountDao = Application_CommonUtil::getInstance('dao', "EContractAccountDao", $this->db);

    // 現在のクライアントの検索条件
    $condition = " client_id = {$this->user["client_id"]} ";
    // ラクラク電子契約APIアカウントを1件取得
    $result = $eContractAccountDao->getEContractAccount($condition);

    return $result;
  }

  /**
  * 電子契約APIアカウント情報をデータベースに登録
  **/
  public function accountRegist($company) {
    // 戻り値を宣言
    $result = array();
    $result['errorList'] = array();
    // daoの宣言
    $eContractAccountDao = Application_CommonUtil::getInstance('dao', "EContractAccountDao", $this->db);

    // トランザクションスタート
    $this->db->beginTransaction();
    try{
      // 登録処理
      $eContractAccountDao->accountRegist($company);
      $this->db->commit();
    }catch(Exception $e) {
      $this->db->rollBack();
      throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
    }

    return $result;
  }

  /**
  * 現在のユーザーのラクラク電子契約API電子証明書を1件取得
  **/
  public function getEContractCertificate() {
    // 戻り値を宣言
    $result = array();
    $result['errorList'] = array();
    // daoの宣言
    $eContractCertificateDao = Application_CommonUtil::getInstance('dao', "EContractCertificateDao", $this->db);

    // 現在のユーザーの検索条件
    $condition = " client_id = {$this->user["client_id"]} ";
    // ラクラク電子契約API電子証明書を1件取得
    $result = $eContractCertificateDao->getEContractCertificate($condition);

    return $result;
  }

  /***
  * API認証済みのパートナー数を取得
  ***/
  public function getAuthCount($tokens) {
    // daoの宣言
    $eContractAuthorizationDao = Application_CommonUtil::getInstance('dao', "EContractAuthorizationDao", $this->db);

    $tokenCondition = '';
    foreach($tokens as $token) {
      if($token != "") {
        $token = '"' . $token . '"';
        $tokenCondition = $tokenCondition . $token . ', ';
      }
    }
    if (!empty($tokenCondition)) {
      $tokenCondition = substr($tokenCondition, 0, strlen($tokenCondition) - 2);
    }
    $condition = "auth_flg = 1 AND token IN($tokenCondition)";

    $result = $eContractAuthorizationDao->getAuthCount($condition);
    return $result;
  }

  /***
  * e_contract_authorizationを登録する
  ***/
  public function createAuthorization($form) {
    // daoの宣言
    $eContractAuthorizationDao = Application_CommonUtil::getInstance('dao', "EContractAuthorizationDao", $this->db);

    // e_contract_authorizationの登録
    $result = $eContractAuthorizationDao->createAuthorization($form);
    return $result;
  }

  /***
  * Smart-in PreCallAuto API 認証結果通知
  ***/
  public function returnPreCallAuto($form) {
    // daoの宣言
    $eContractAuthorizationDao = Application_CommonUtil::getInstance('dao', "EContractAuthorizationDao", $this->db);

    // 認証完了の場合、
    if($form['detail'] == '00') {
      // トランザクションスタート
      $this->db->beginTransaction();
      try{
        $condition = "token = '{$form['token']}'";
        $result = $eContractAuthorizationDao->updateAuth($condition);
        $this->db->commit();
        return $result;
      }catch(Exception $e) {
        $this->db->rollBack();
        throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
      }
    }
  }

  /**
  * 電子証明書情報 登録処理
  **/
  public function certificateRegist($form) {
    // 戻り値を宣言
    $result = array();
    $result['registCompleteFlg'] = 0;
    $result['errorList'] = array();
    // daoの宣言
    $eContractCertificateDao = Application_CommonUtil::getInstance('dao', "EContractCertificateDao", $this->db);

    // クライアントを取得
    $form['client_id']  = $this->user['client_id'];

    // トランザクションスタート
    $this->db->beginTransaction();
    try{
     // 登録処理
     $eContractCertificateDao->certificateRegist($form);
     $this->db->commit();

    }catch(Exception $e) {
     $this->db->rollBack();
     throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
    }
    // 登録完了の場合は電子証明書付与状態確認画面へ遷移するためフラグを立てる
    $result['registCompleteFlg'] = 1;

    return $result;
  }

  /**
  * 電子証明書情報 更新処理
  **/
  public function certificateUpdate($certificate) {
    // 戻り値を宣言
    $result = array();
    $result['errorList'] = array();
    // daoの宣言
    $eContractCertificateDao = Application_CommonUtil::getInstance('dao', "EContractCertificateDao", $this->db);
    // トランザクションスタート
    $this->db->beginTransaction();
    try{
     // 登録処理
     $eContractCertificateDao->certificateUpdate($certificate);
     $this->db->commit();

    }catch(Exception $e) {
     $this->db->rollBack();
     throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
    }
    return $result;
  }

  /**
  * 電子契約APIアカウントをAPIへ登録
  **/
  public function apiAccountRegist($company) {
    // URLを生成する
    $url = self::API_URI.'v1/accounts';
    // POSTデータを生成する
    $postDict['email']             = $company['client_id']."-".$company['client_staffleaderemail'];
    $postDict['password']          = md5($this->config->datasource->key.$company['client_id']);
    $postDict['apiKey']            = $this->config->eContractApi->apiKey;
    $postDict['apiSecret']         = $this->config->eContractApi->apiSecret;
    $postDict['organization_name'] = $company['client_name'];

    // POST送信
    $postJson = json_encode($postDict);
    // 戻り値
    $result = $this->getCurlResponce($url,$postJson);
    return $result;
  }

  /***
  * 電子契約APIクレデンシャルを発行
  ***/
  public function getApiCredential($account) {

    $postDict['username']  = $account['email'];
    $postDict['password']  = md5($this->config->datasource->key.$account['client_id']);;
    $postDict['apiKey']    = $this->config->eContractApi->apiKey;
    $postDict['apiSecret'] = $this->config->eContractApi->apiSecret;

    // POST送信
    $postJson = json_encode($postDict);

    // 戻り値
    $result = $this->getCurlResponce(self::API_URI.'v1/credentials',$postJson);
    return $result;
  }

  /***
  * 電子契約一時データとパートナー情報をDBに登録
  ***/
  public function tmpDataRegist($form) {
    // 戻り値を宣言
    $result = array();
    $result['errorList'] = array();
    // daoの宣言
    $eContractTmpInfoDao = Application_CommonUtil::getInstance('dao', "EContractTmpInfoDao", $this->db);
    $eContractPartnerDao = Application_CommonUtil::getInstance('dao', "EContractPartnerDao", $this->db);
    $mailModel = Application_CommonUtil::getInstance('model', "MailModel", $this->db);

    // 契約書PDFデータ
    $fileName = $form['documents'][0]['fileName'];
    $fileSize = intval(filesize('./cmn-e-contract/' . $fileName));
    $pdf = file_get_contents('.'.ECONTRACT_FILE_DIR . $fileName);
    $pdfData = base64_encode($pdf);
    $jpgName = str_replace('.pdf', '-1.jpg', $fileName);
    $imgPath = self::ECONTRACT_FILE_DIR. $jpgName;

    // アクセストークン作成
    $token = $this->createToken();

    // トランザクションスタート
    $this->db->beginTransaction();
    try{
      // 登録処理
      $eContractTmpInfoId = $eContractTmpInfoDao->tmpInfoRegist($form, $this->user['client_id'], $this->user['staff_type'], $this->user['staff_id'], $fileSize, $pdfData, $imgPath);

      $eContractPartnerDao->partnerInfoRegist($form, $eContractTmpInfoId, $token);
      $this->db->commit();
      // 承認依頼メール送信
      $mailModel->sendApprovalRequestMail($form['signInfos']['partners'][0]['info']['email'], $token, $form['signInfos']['partners'][0]['info']['message']);
      $result['status'] = 200;
    }catch(Exception $e) {
      $this->db->rollBack();
      throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
    }

    return $result;
  }

  /*
  * ゲスト承認者のメールアドレスが正しいかチェックする
  */
  public function checkPartnerEmail($form, $request) {
    // 戻り値を宣言
    $return['authFlg'] = 0;
    $return['error'] = "";
    // daoの宣言
    $eContractPartnerDao = Application_CommonUtil::getInstance('dao', "EContractPartnerDao", $this->db);

    if($request->isPost()) {
      // ゲスト承認者のメールアドレスが正しいかチェック
      $condition = "email = '" . $form['email'] . "' AND token = '" . $form['token'] . "'";
      $result = $eContractPartnerDao->getPartnerCount($condition);
      if($result['count'] != "0") {
        $return['authFlg'] = 1;
      } else {
        $return['error'] = 'メールアドレスが不正です。';
      }

      return $return;
    }
  }

  /*
  * ゲスト承認者のメールアドレスが正しいかチェックする
  */
  public function checkPartnerEmail2($form, $request, $check = false) {

    // 戻り値を宣言
    $return['authFlg'] = 0;
    $return['error'] = "";
    // daoの宣言
    $eContractPartnerDao = Application_CommonUtil::getInstance('dao', "EContractPartnerDao", $this->db);
    $eContractCaseDao = Application_CommonUtil::getInstance('dao', "EContractCaseDao", $this->db);


    if($request->isPost() || $check) {
      // ゲスト承認者のメールアドレスが正しいかチェック
      $condition = "email = '" . $form['email'] . "' AND token = '" . $form['token'] . "'";
      $result = $eContractPartnerDao->getPartnerCount2($condition);

      if($result == false) {
        $return['error'] = 'メールアドレスが不正です。';
      } else if("1" == $result['approval_status']) {
        $return['error'] = '承認確認済みの契約書です。';
      } else {

        // 契約書の状態を確認.
        $caseCondition = "id = {$result['e_contract_case_id']}";
        $case = $eContractCaseDao->getCase($caseCondition);
        if($case['delete_date'] !== NULL) {
          $return['error'] = '取り消された契約書です';
        } else {
          $return['authFlg'] = 1;
        }
        // 二要素認証の契約書の場合
        if ($case['approval_method'] == 1) {
          // ゲスト承認者が二要素認証を行っているかチェック
          $return["authenticatedPartner"] = $this->getAuthenticatedPartner($result['email']);
        }
        $return['partnerId'] = $result['id'];
        $return['approvalMethod'] = $case['approval_method'];
      }

      return $return;
    }
  }

  /**
   * ゲスト承認者のメールアドレスが二要素認証で登録があるかをチェック
  */
  public function getAuthenticatedPartner($email) {
    // 戻り値を宣言
    $result = array();
    $result['errorList'] = array();
    // daoの宣言
    $eContractPartnerDao = Application_CommonUtil::getInstance('dao', "EContractPartnerDao", $this->db);

    $condition = "email = '" . $email . "' AND partner_authenticate_flg = 1";
    $result = $eContractPartnerDao->getAuthenticatedPartner($condition);

    return $result;
  }

  /*
  * ゲスト承認者のメールアドレスと認証コードが正しいかチェックする
  */
  public function checkPartnerPassword($form, $request) {
    // 戻り値を宣言
    $return['authFlg'] = 0;
    $return['error'] = "";
    // daoの宣言
    $eContractPartnerDao = Application_CommonUtil::getInstance('dao', "EContractPartnerDao", $this->db);

    if($request->isPost()) {
      if ($form['password'] == '') {
        $return['error'] = '認証コード(パスワード)が不正です。';
      }
      // メールアドレスと認証コードが正しいかチェック
      $condition = "email = '" . $form['email'] . "' AND password = '" . md5($form['password']) . "'";
      $result = $eContractPartnerDao->getPartnerCount2($condition);

      if($result) {
        $return['authFlg'] = 1;
        $return['partner'] = $result;
      } else {
        $return['error'] = 'メールアドレスもしくは認証コード(パスワード)が不正です。';
      }

      return $return;
    }
  }

  /**
   * ゲスト承認者の認証用パスワードを登録する
  */
  public function setPassword($partner, $password) {
    // 戻り値を宣言
    $return['error'] = "";
    // daoの宣言
    $eContractPartnerDao = Application_CommonUtil::getInstance('dao', "EContractPartnerDao", $this->db);

    // 承認する
    $condition = "id = '" . $partner['id'] . "'";
    $password = md5($password);
    // トランザクションスタート
    $this->db->beginTransaction();
    try{
      $result = $eContractPartnerDao->setPassword($condition, $password);
      $this->db->commit();
    }catch(Exception $e) {
      $this->db->rollBack();
      throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
    }

    return $result;
  }

  /**
   * パスワードリマインダー
  */
  public function sendMailReminderAccount($form, $request) {
    $errorList = array();
    // daoの宣言
    $adminModel = Application_CommonUtil::getInstance('model', "AdminModel", $this->db);
    $masterStaffDao = Application_CommonUtil::getInstance('dao', "MasterStaffDao", $this->db);
    $eContractPartnerDao = Application_CommonUtil::getInstance('dao', "EContractPartnerDao", $this->db);

    if($request->isPost()) {
      $condition = "id = {$form['staff_id']} ";
      $partnerDict = $eContractPartnerDao->getPartnerCount2($condition);
      if(empty($partnerDict)) {
        return array();
      }
      // トランザクションスタート
      $this->db->beginTransaction();
      try {
        $partnerDict["activation_code"] = $adminModel->makeRandom(32);
        $partnerDict["temp_pw"] = md5($form["temp_pw"]);
        $partnerDict['staff_id'] = $form['staff_id'];
        $partnerDict['staff_type'] = $form['staff_type'];
        $cond = "staff_type = '{$form['staff_type']}' AND staff_id = {$form['staff_id']} ";
        // DB更新
        if(true == $masterStaffDao->setActivationStaff($partnerDict, $cond)) {
          // メールを送信する
          $econtractFlg = true;
          $mailModel = Application_CommonUtil::getInstance('model', "MailModel", $this->db);
          $mailModel->sendActivationMail($partnerDict, $econtractFlg);
          $errorList[] = "登録アドレスに再設定用のメールを送信しました";
        } else {
          $errorList[] = "既に登録アドレスに再設定用のメールを送信しています";
        }
        $this->db->commit();
      }catch(Exception $e){
        $this->db->rollBack();
        throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
      }
    }
    return array(
      "errorList" => $errorList,
    );
  }

  /**
   * パスワード再設定
  */
  public function activateStaff($form, $request) {
    $errorList = array();
    $staffDict = array(
      'staff_id' => $form["id"],
      'temp_pw' => $form["temp_pw"],
      'password' => $form["password"],
      'confirm_password' => $form["confirm_password"],
    );

    // daoの宣言
    $masterStaffDao = Application_CommonUtil::getInstance('dao', "MasterStaffDao", $this->db);
    $eContractPartnerDao = Application_CommonUtil::getInstance('dao', "EContractPartnerDao", $this->db);

    if($request->isPost()) {
      // バリデーションチェック
      $errorList = $masterStaffDao->validateActivationStaff($form);
      if(count($errorList) == 0) {
        // トランザクションスタート
        $this->db->beginTransaction();
        try{
          $staffDict = $eContractPartnerDao->activateStaff($form);
          $staffDict['actFlg'] = 1;
          $this->db->commit();
        }catch(Exception $e){
          $this->db->rollBack();
          throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
        }
      }
    }
    return array(
      'staffDict' => $staffDict,
      'errorList' => $errorList,
    );
	}

  /**
   * 承認者の二要素認証ステータスを更新
   * @param unknown $form
  */
  public function setAuthenticateState($partnerId) {
    // daoの宣言
    $eContractPartnerDao = Application_CommonUtil::getInstance('dao', "EContractPartnerDao", $this->db);

    // 承認する
    $condition = "id = '" . $partnerId . "'";
    // トランザクションスタート
    $this->db->beginTransaction();
    try{
      $result = $eContractPartnerDao->setAuthenticateState($condition);
      $this->db->commit();
    }catch(Exception $e) {
      $this->db->rollBack();
      throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
    }

    return $result;
  }

  /*
  * emailとtokenからパートナーデータを1件取得する
  */
  public function getPartner($email, $token) {
    // 戻り値を宣言
    $result = array();
    $result['errorList'] = array();
    // daoの宣言
    $eContractPartnerDao = Application_CommonUtil::getInstance('dao', "EContractPartnerDao", $this->db);

    $condition = "email = '" . $email . "' AND token = '" . $token . "'";
    $result = $eContractPartnerDao->getPartner($condition);

    return $result;
  }

  /*
  * emailとtokenからパートナーデータを1件取得する
  */
  public function getPartner2($email, $token) {
    // 戻り値を宣言
    $result = array();
    $result['errorList'] = array();
    // daoの宣言
    $eContractPartnerDao = Application_CommonUtil::getInstance('dao', "EContractPartnerDao", $this->db);

    $condition = "email = '" . $email . "' AND token = '" . $token . "'";
    $result = $eContractPartnerDao->getPartner2($condition);

    return $result;
  }

  /*
  * idからパートナーデータを1件取得する
  */
  public function getPartnerWithId($partnerId) {
    // 戻り値を宣言
    $result = array();
    $result['errorList'] = array();
    // daoの宣言
    $eContractPartnerDao = Application_CommonUtil::getInstance('dao', "EContractPartnerDao", $this->db);

    $condition = "id = '" . $partnerId . "'";
    $result = $eContractPartnerDao->getPartner2($condition);

    return $result;
  }

  /*
  * e_contract_tmp_info_idから一時保管契約情報を1件取得する
  */
  public function getTmpInfo($eContractTmpInfoId) {
    // 戻り値を宣言
    $result = array();
    $result['errorList'] = array();
    // daoの宣言
    $eContractTmpInfoDao = Application_CommonUtil::getInstance('dao', "EContractTmpInfoDao", $this->db);

    $condition = "id = '" . $eContractTmpInfoId . "'";
    $result = $eContractTmpInfoDao->getTmpInfo($condition);

    return $result;
  }

  /*
  * パートナー承認用にclient_idからクレデンシャルを発行
  */
  public function getCredentialToPartner($clientId) {
    // 戻り値を宣言
    $result = array();
    $result['errorList'] = array();
    // daoの宣言
    $eContractAccountDao = Application_CommonUtil::getInstance('dao', "EContractAccountDao", $this->db);

    // 条件から電子契約アカウント情報を1件取得
    $condition = " client_id = {$clientId} ";
    $eContractAccount = $eContractAccountDao->getEContractAccount($condition);

    $postDict['username']  = $eContractAccount['email'];
    $postDict['password']  = md5($this->config->datasource->key.$clientId);;
    $postDict['apiKey']    = $this->config->eContractApi->apiKey;
    $postDict['apiSecret'] = $this->config->eContractApi->apiSecret;

    // POST送信
    $postJson = json_encode($postDict);

    // 戻り値
    $result = $this->getCurlResponce(self::API_URI.'v1/credentials',$postJson);

    return $result;
  }

  /*
  * ホストスタッフに契約完了通知メールを送信する
  */
  public function sendEContractAgreementMail($staffType, $staffId) {
    // daoの宣言
    $masterStaffDao = Application_CommonUtil::getInstance('dao', "MasterStaffDao", $this->db);
    // modelの宣言
    $mailModel = Application_CommonUtil::getInstance('model', "MailModel", $this->db);

    // クライアントスタッフメールアドレスを取得
    $condition = "staff_type = '" . $staffType . "' AND staff_id = '" . $staffId . "'";
    $staff = $masterStaffDao->getMasterStaffRow($condition);

    // クライアントスタッフにメールを送信
    $mailModel->sendEContractAgreementMail($staff['staff_email']);
  }

  /*
  * 承認者全員に契約完了通知メールを送信する
  */
  public function sendEContractAgreementPartnersMail($caseId, $filePath) {
    // daoの宣言
    $eContractPartnerDao = Application_CommonUtil::getInstance('dao', "EContractPartnerDao", $this->db);
    // modelの宣言
    $mailModel = Application_CommonUtil::getInstance('model', "MailModel", $this->db);

    //承認者一覧を取得
    $condition = "e_contract_case_id = {$caseId}";
    $partnerList = $eContractPartnerDao->getPartnerList($condition);

    // 承認者にメールを送信
    foreach ($partnerList as $partner) {
      $mailModel->sendEContractAgreementPartnerMail($partner['email'], $filePath);
    }
  }

  /*
  * パートナー印影情報をDBに保管する
  */
  public function registPartnerSign($form, $token) {
    // 戻り値を宣言
    $result = array();
    $result['errorList'] = array();
    // daoの宣言
    $eContractPartnerDao = Application_CommonUtil::getInstance('dao', "EContractPartnerDao", $this->db);
    // パートナー印影情報を登録
    $eContractPartnerDao->registPartnerSign($form, $token);

    return $result;
  }

  /***
  * curlでデータを取得するための関数
  * typeがarrayの場合は例外が発生しcatchでハンドリングした結果
  ***/
  private function getCurlResponce($url,$postJson) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
      'Content-Type: application/json; charset=utf-8',
      'Accept: application/json; charset=utf-8',
      'X-Requested-With: XMLHttpRequest'                                                             
    ));
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postJson);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $result['body'] = json_decode(curl_exec($ch), true);
    $result['message'] = curl_getinfo($ch);
    $result["status"]= curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $errno = curl_errno($ch);
    $result['isError'] = curl_error($ch);

    curl_close($ch);
    $result["isSuccess"] = true;
    
    if (CURLE_OK !== $errno) {
      $result["isSuccess"] = false;
    }

    return $result;
  }

  /***
  * Zend_Http_Clientからデータを取得するための関数
  * typeがarrayの場合は例外が発生しcatchでハンドリングした結果
  ***/
  private function getResponce($response) {
    $result = array();
    if(is_array($response)){
      $result = $response;
    }else{
      $result["status"] = $response->getStatus();
      $result["isSuccess"] = $response->isSuccessful();
      $result["isError"] = $response->isError();
      $result["message"] = $response->getMessage();
      $result["body"] = json_decode($response->getBody(), true);
    }
    return $result;
  }

  /**
  * 電子契約 ゲスト承認アクセストークンを作成する
  */
  private function createToken() {
    // daoの宣言
    $eContractPartnerDao = Application_CommonUtil::getInstance('dao', "EContractPartnerDao", $this->db);

    $valid = false;
    // 重複が無い状態になるまでトークンを生成する
    while($valid == false) {
      // 10桁のランダムな英数字を作成
      $str = array_merge(range('a', 'z'), range('0', '9'), range('A', 'Z'));
      $token = null;
      for ($i = 0; $i < 10; $i++) {
        $token .= $str[rand(0, count($str) - 1)];
      }
      // 作成されたトークンがユニークかチェックする
      $condition = "token = '" . $token . "'";
      $return = $eContractPartnerDao->checkUniqueToken($condition);
      if ($return["count"] == "0") {
        $valid = true;
      }
    };

    return $token;
  }

  /**
   * クライアントIDを元に、クライアントに紐づくファイルの最大登録サイズと、現在登録している合計サイズを取得する
   * @param unknown $clientId
   */
  private function getClientMaterialSizeDict($clientId){
    // クライアントの最大登録可能サイズを取得する
    $masterClientDao = Application_CommonUtil::getInstance('dao', "MasterClientDao", $this->db);
    $client = $masterClientDao->getMasterClientRow($clientId);
    $adminClientModel = Application_CommonUtil::getInstance("model", "AdminClientModel", $this->db);
    $maxMaterialSize = $adminClientModel->getMaxDocumentSize($client["plan_this_month"]);
    // クライアントに現在登録しているファイルサイズの合計を取得する
    $eContractDocumentMaterialDao = Application_CommonUtil::getInstance('dao', "EContractDocumentMaterialDao", $this->db);
    $allMaterialSize = $eContractDocumentMaterialDao->allMaterialSize($clientId);
    // 見やすいように変換し戻り値を返す
    return array("maxMaterialSize"=>$maxMaterialSize, "allMaterialSize"=>$allMaterialSize);
  }

  /**
   * バイトを渡すと、いい感じに変換して文字を返す
   * @param unknown $bytes
   * @return string
   */
  public function convertByte2Str($bytes){
    if ($bytes >= 1073741824) {
      $bytes = number_format($bytes / 1073741824, 2) . ' GB';
    } elseif ($bytes >= 1048576) {
      $bytes = number_format($bytes / 1048576, 2) . ' MB';
    } elseif ($bytes >= 1024) {
      $bytes = number_format($bytes / 1024, 2) . ' KB';
    } elseif ($bytes >= 1) {
      $bytes = $bytes . ' byte';
    } else {
      $bytes = '0 byte';
    }
    return $bytes;
  }

  /**
   * 資料共有のバリデーション
   * @param unknown $form
   */
  function materialFormValidation($data){
    $validationDict["material_name"] = array(
      "name" => "テンプレート名",
      "length" => "64",
      "validate" => array(1)
    );
    $errorList = executionValidation($data, $validationDict);

    if(!isset($data['id']) && mb_strlen($_FILES['material_file']['name'][0]) == 0) {
      $errorList["material_file"] = "契約書ファイルは必須です。";
    }

    return $errorList;
  }


  /**
   * 今回登録するファイルが登録可能がどうかチェックする
   * もし登録できない場合は、登録できないファイルを削除する。
   * @param unknown $clientId
   * @param unknown $filePath    ファイルパス「例：/xxx/xxxx/xxx/xxxxxx*」
   * @return string|number[]|string[]
   */
  public function validMaterialSize($clientId, $filePath){
    // 戻り値
    $result = array("size"=>0, "errorMsg"=>"");
    // 最大登録サイズと現在の登録サイズを取得する
    $clientMaterialSizeDict = $this->getClientMaterialSizeDict($clientId);
    // 今回登録したファイルのサイズを取得する
    // コマンド作成
    $cmd = "ls -al {$filePath} | awk '{ total += $5 }; END { print total }'";
    // コマンドを実行する
    exec($cmd, $out, $ret);
    if($out[0] != ""){
      $result["size"] = (int)$out[0];
      // サイズ取得できた場合は、登録可能かサイズ比較する
      $sumFileSize = $clientMaterialSizeDict["allMaterialSize"] + $result["size"];
      // 最大登録サイズと、登録予定サイズを比較する
      if($clientMaterialSizeDict["maxMaterialSize"] <= $sumFileSize){
        // オーバーした容量を計算
        $overSize = $this->convertByte2Str($sumFileSize - $clientMaterialSizeDict["maxMaterialSize"]);
        // 登録予定サイズの方が大きい場合エラーとする
        $result["errorMsg"] = "最大ファイル登録サイズを超えています。[超えた容量：{$overSize}] ※アップロードファイルのサイズとは異なります。";
        // ファイルの削除も行う
        $cmd = "rm {$filePath}";
        exec($cmd);
      }
    }else{
      $result["errorMsg"] = "登録ファイルが存在しません。";
    }
    return $result;
  }

  /**
   *  契約書が完了しているかを判定する 電子署名付きPDFを　受け取ったときに 同じくAPI側からuidを受け取るのでその有無で判定.
   */
  public function validContractDone($case) {
      return isset($case["uid"]) && $case["uid"] != null;
  }

  /**
   * 指定した文字数で文字列を分割する
   * @param $string 入力文字列
   * @param $width 字列を分割するときの文字数。
   * @param $break オプションのパラメータ break を用いて行を分割します。
   * @param $cut 指定した幅よりも長い単語がある場合には、分割されますかどうか(true:分割される false:分割されない)
   */
  public static function mb_wordwrap($string, $width = 75, $break = "\n", $cut = true) {
    if (!$cut) {
      $regexp = '#^(?:[\x00-\x7F]|[\xC0-\xFF][\x80-\xBF]+){'.$width.',}\b#U';
    } else {
      $regexp = '#^(?:[\x00-\x7F]|[\xC0-\xFF][\x80-\xBF]+){'.$width.'}#';
    }
    $string_length = mb_strlen($string,'UTF-8');
    $cut_length = ceil($string_length / $width);
    $i = 1;
    $return = '';
    while ($i < $cut_length) {
      preg_match($regexp, $string,$matches);
      $new_string = $matches[0];
      $return .= $new_string.$break;
      $string = substr($string, strlen($new_string));
      $i++;
    }
    return $return.$string;
  }
}
