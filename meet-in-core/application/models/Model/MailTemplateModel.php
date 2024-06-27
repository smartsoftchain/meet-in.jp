<?php
require_once ROOT.'library/Application/validation.php';

class MailTemplateModel extends AbstractModel{
	const ATTACHED_FILE_PATH = "/mnt/dmdata/";

	function __construct($db){
		parent::init();
		$this->db = $db;
	}

	/**
	 * メールテンプレートリスト画面用に取得
	 *
	 * @param array $form {page=>int, pagesize=>int, ordertype=>str, order=>str, keyword=>str}
	 * @param object $screenSession {isnew}
	 * @return array $list {}
	 */
	public function fetchAllScreen($form, $screenSession){
		$dao = Application_CommonUtil::getInstance("dao", "MailTemplateDao", $this->db);
		// セッションの初期化
		if($screenSession->isnew == true){
			$screenSession->order = 'create_time';
			$screenSession->page = 1;
			$screenSession->pagesize = 100;
			$screenSession->ordertype = 'desc';	// 任意
			$screenSession->keyword = '';	// 任意
		}
		if(!empty($form["keyword"])) {
			$form["page"] = 1;
		}
		// パラメータをセッションに格納
		foreach($form as $key=>$val){
			$screenSession->$key = $val;
		}
		$templates = $dao->fetchAll($this->user["client_id"], $screenSession->keyword, $screenSession->order, $screenSession->ordertype, $screenSession->page, $screenSession->pagesize);
		$count = $dao->fetchAllCount($this->user["client_id"], $screenSession->keyword);

		$list = new Application_Pager(array(
			"itemData"  => $templates,						// リスト（未スライス）
			"itemCount" => $count,						// リスト（未スライス）
			"perPage"   => $screenSession->pagesize,	// ページごと表示件数
			"curPage"   => $screenSession->page,		// 表示するページ
			"order"     => $screenSession->order,		// ソートカラム名
			"orderType" => $screenSession->ordertype,	// asc or desc
		));

		return $list;
	}

	/**
	 * 全件取得する
	 *
	 * @return array $templates {}
	 */
	public function fetchAll() {
		$dao = Application_CommonUtil::getInstance("dao", "MailTemplateDao", $this->db);
		$templates = $dao->fetchAll($this->user["client_id"]);
		// ファイルを整形
		foreach($templates as $key => $template) {
			$fnameActual = explode(":", $template["fname_actual"]);
			$fnameInAttached = explode(":", $template["fname_in_attached"]);
			$templates[$key]["files"] = array();
			foreach($fnameActual as $i => $fname) {
				if(empty($fname)) {
					continue;
				}
				$templates[$key]["files"][$i]["fname_actual"] = $fname;
				$templates[$key]["files"][$i]["fname_in_attached"] = $fnameInAttached[$i];
			}
		}

		return $templates;
	}

	/**
	 * 詳細取得
	 *
	 * @param int $id
	 * @return array $template {}
	 */
	public function fetchRow($id) {
		$dao = Application_CommonUtil::getInstance("dao", "MailTemplateDao", $this->db);
		$template = $dao->fetchRow($id);
		// ファイルを整形
		$fnameActual = explode(":", $template["fname_actual"]);
		$fnameInAttached = explode(":", $template["fname_in_attached"]);
		$template["files"] = array();
		foreach($fnameActual as $i => $fname) {
			if(empty($fname)) {
				continue;
			}
			$template["files"][$i]["fname_actual"] = $fname;
			$template["files"][$i]["fname_in_attached"] = $fnameInAttached[$i];
		}

		return $template;
	}

	/**
	 * 送信元取得
	 *
	 * @return array $response {status=>boolean, result=>array(str)}
	 */
	public function fetchFromList() {
		$ch = curl_init();
		// オプションを設定
		curl_setopt_array($ch, $this->curlOptArray);
		curl_setopt($ch, CURLOPT_URL, $this->rootUrl."/from-list"); // 取得するURLを指定
		// curl実行
		$response = json_decode(curl_exec($ch), true);
		curl_close($ch);

		return $response;
	}

	/**
	 * 新規作成・編集
	 *
	 * @param array $form {name=>str, from_name=>str, from=>str, subject=>str, bodytext=>str, mail_type=>int}
	 * @param int $id default NULL(NULL以外の時は編集)
	 * @return array $response {status=>boolean, result=>array(str)}
	 */
	public function create($form, $id=NULL) {
		$dao = Application_CommonUtil::getInstance("dao", "MailTemplateDao", $this->db);
		$result = array(
			"status" => true,
			"result" => array()
		);

		// バリデーション実行
		$errorList = $this->validation($form);
		if(count($errorList) > 0) {
			$result = array(
				"status" => false,
				"result" => $errorList
			);

			return $result;
		}
		// 添付ファイルがあれば作成(:TODO現状ファイルのアップロード機能はないが追加要件のため実装)
		$files = $this->upload();
		if(!empty($files)){
			foreach($files as $file){
				$form['fname_actual'][] = $file['mail_file_alias'];
				$form['fname_in_attached'][] = $file['mail_file_name'];
			}
		}
		if(!empty($form['fname_actual'])){
			$form['fname_actual'] = implode(':', $form['fname_actual']);
			$form['fname_in_attached'] = implode(':', $form['fname_in_attached']);
		}
		else{
			$form['fname_actual'] = "";
			$form['fname_in_attached'] = "";
		}
		// mail-templateデータ整形
		$mailTemplate = array(
			"client_id" => $this->user["client_id"],
			"name" => isset($form["name"]) ? $form["name"] : NULL,
			"from_name" => isset($form["from_name"]) ? $form["from_name"] : NULL,
			"from" => isset($form["from"]) ? $form["from"] : NULL,
			"subject" => isset($form["subject"]) ? $form["subject"] : NULL,
			"bodytext" => isset($form["bodytext"]) ? $form["bodytext"] : NULL,
			"mail_type" => isset($form["mail_type"]) ? $form["mail_type"] : NULL,
			"fname_actual" => $form["fname_actual"],
			"fname_in_attached" => $form["fname_in_attached"],
			"staff_type" => $this->user["staff_type"],
			"staff_id" => $this->user["staff_id"]
		);

		// IDの有無で、新規作成か編集かを識別
		$this->db->beginTransaction();
		try{
			if(!empty($id)) {
				$dao->update($id, $mailTemplate);
			} else {
				$dao->insert($mailTemplate);
			}
			$this->db->commit();
		} catch(Exception $e) {
			$result = array(
				"status" => false,
				"result" => array("サーバーエラーです。管理者にお問い合わせください。")
			);
			$this->db->rollBack();
			error_log($e->getMessage());
			throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
		}

		return $result;
	}


	/**
	 * 削除
	 *
	 * @param int $id
	 * @return array $response{status=>boolean, result=>array(str)}
	 */
	public function delete($id) {
		$dao = Application_CommonUtil::getInstance("dao", "MailTemplateDao", $this->db);
		$result = array(
			"status" => true,
			"result" => array()
		);
		$this->db->beginTransaction();
		try {
			$dao->delete($id);
			$this->db->commit();
		} catch(Exception $e) {
			$result = array(
				"status" => false,
				"result" => array()
			);
			$this->db->rollBack();
			error_log($e->getMessage());
			throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
		}

		return $result;
	}

	/**
	 * 一括削除
	 *
	 * @param array $ids[int]
	 * @return array $result{status=>boolean, result=>array()}
	 */
	public function deleteAll($ids) {
		$result = array(
			"status" => true,
			"result" => array()
		);
		foreach($ids as $id) {
			$response = $this->delete($id);
			if(!$response["status"]) {
				$result["status"] = false;
				$result["result"][] = "ID = {$id}の削除に失敗しました";
			}
		}

		return $result;
	}

	/**
	* メールを送信する
	* @param string $sendto
	* @param int $id
	* @return boolean
	*
	*/
	public function sendMail($sendto, $id){
		$template = $this->fetchRow($id);
		$mail_from      = $template["from"];
		$mail_from_name = $template["from_name"];
		$subject = $template["subject"];
		$body_html = $template["bodytext"];
		if($template["mail_type"] == 2) {
			$textType = "html";
		} else {
			$textType = "plain";
		}

		mb_language("ja");
		mb_internal_encoding("UTF-8");
		$parameter = "-f ".$mail_from;
		// 件名との半角カナを全角カナに変換する
		$subject = mb_convert_kana($subject, "KV", "UTF-8");
		// 本文の半角カナを全角カナに変換する
		$body_html = mb_convert_kana($body_html, "KV", "UTF-8");

		// 各種文字列をUTF-8からISOに変換する
		$subject = mb_convert_encoding($subject, "ISO-2022-JP");
		$mail_from_name = mb_encode_mimeheader($mail_from_name, 'ISO-2022-JP-MS');

		// メール本文と添付の境界文字列作成
		$boundary = "--".uniqid(rand(),1);
		// ヘッダー情報
		$headers = '';
		$headers .= 'Content-Type: multipart/alternative; boundary="' . $boundary . '"' . "\n";
		$headers .= 'Content-Transfer-Encoding: binary' . "\n";
		$headers .= 'MIME-Version: 1.0' . "\n";
		$headers .= "From: " . $mail_from_name . "<" . $mail_from . ">" . "\n";

		// メッセージ部分
		$message = '';
		$message .= '--' . $boundary . "\n";
		$message .= "Content-Type: text/{$textType}; charset=\"ISO-2022-JP\"" . "\n";
		$message .= 'Content-Disposition: inline' . "\n";
		$message .= 'Content-Transfer-Encoding: quoted-printable' . "\n";
		$message .= "\n";
		$message .= quoted_printable_decode($body_html). "\r\n";
		$message .= '--' . $boundary . "\r\n";

		// ファイルを添付
		foreach($template["files"] as $file) {
			$message .= "Content-Type: application/octet-stream; name=\"{$file["fname_in_attached"]}\"\n";
			$message .= "Content-Disposition: attachment; filename=\"{$file["fname_in_attached"]}\"\n";
			$message .= "Content-Transfer-Encoding: base64\n";
			$message .= "\n";
			$message .= chunk_split(base64_encode(file_get_contents($file["fname_actual"])));
			$message .= '--' . $boundary . "\r\n";
		}
		$message = mb_convert_encoding($message, 'ISO-2022-JP-MS');
		// 送信する
		if(!mb_send_mail($sendto, $subject, $message, $headers, $parameter)){
			return false;
		}else{
			return true;
		}
	}

	/**
	 * 添付ファイルのアップロード処理
	 */
	private function upload(){
		// 添付のフォルダパスを生成
		$webServerfilePath =  self::ATTACHED_FILE_PATH."CA{$this->user["client_id"]}";
		// マウント先のディレクトリ生成
		if(!file_exists($webServerfilePath)){
			if(!file_exists(self::ATTACHED_FILE_PATH)) {
				chmod("/mnt", 0777);
				mkdir(self::ATTACHED_FILE_PATH);
			}
			// フォルダがなければ作成する(マウントしているのでバッチサーバーにもフォルダが作成される)
			mkdir($webServerfilePath);
		}

		$user = $this->user;
		$mail_file = array();

		if (sizeof($_FILES)) {
			if (isset($_FILES["attached"]["size"][0])) {
				for($i=0; $i < count($_FILES["attached"]["size"]); $i++) {
					if ($_FILES["attached"]["size"][$i] > 0) {

						$fileNameList = explode(".", $_FILES['attached']['name'][$i]);
						$upfile = $_FILES["attached"]["tmp_name"][$i];
						$fname  = $user['staff_id']."_".strtotime("now")."_".$i.".".end($fileNameList);
						$thfile = $webServerfilePath . "/" . $fname;
						$mail_file[$i]["mail_file_id"]    = "";
						$mail_file[$i]["mail_file_name"]  = $_FILES['attached']['name'][$i];
						$mail_file[$i]["mail_file_alias"] = $thfile;
						move_uploaded_file($upfile, $thfile);
					}
				}
			} else {
				if ($_FILES["attached"]["size"] > 0) {
					$fileNameList = explode(".", $_FILES['attached']['name']);
					$upfile = $_FILES["attached"]["tmp_name"];
					$fname  = $user['staff_id'] . "_" . strtotime("now") . "." . end($fileNameList);
					$thfile = $webServerfilePath . "/" . $fname;
					$mail_file[0]["mail_file_id"]    = "";
					$mail_file[0]["mail_file_name"]  = $_FILES['attached']['name'];
					$mail_file[0]["mail_file_alias"] = $thfile;
					move_uploaded_file($upfile, $thfile);
				}
			}
		}

		return $mail_file;
	}

	/**
	 * バリデーション
	 *
	 * @param array $form
	 * @return array $errorMsg
	 */
	private function validation($form) {
		$errorMsg = array();
		$validationDict = array(
				"name"      => array("name" =>"テンプレート名",       "length" => 100, "validate" => array(1)),
				"subject"   => array("name" =>"件名",                "length" => 200, "validate" => array(1)),
				"from_name" => array("name" =>"送信者名（差出人名）", "length" => 256, "validate" => array(1)),
				"from"      => array("name" =>"送信元",              "length" => 80,  "validate" => array(1,7)),
				"mail_type" => array("name" =>"形式",                "length" => 1,   "validate" => array(1)),
				"bodytext"  => array("name" =>"本文",                                 "validate" => array(1)),
		);
		$errorList = executionValidation($form, $validationDict);
		foreach($errorList as $key=>$value) {
			$keys = array_keys($value);
			$errorMsg[] = $value[$keys[0]];
		}
		return $errorMsg;
	}
}
