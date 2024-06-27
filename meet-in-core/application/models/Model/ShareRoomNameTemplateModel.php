<?php
require_once ROOT.'library/Application/validation.php';

class ShareRoomNameTemplateModel extends AbstractModel{

  const DEFAULT_MESSAGE = 
  "いつも大変お世話になっております。"."\n"
  ."__{{企業名}}__の__{{名前}}__です。"."\n"
  ."\n"
  ."お時間になりましたら、下記URLよりルームにアクセスください。"."\n"
  ."※招待者がログインするまで入室はできません。"."\n"
  ."\n"
  ."■日時：00/00 00:00~00:00"."\n"
  ."■URL：__{{URL}}__"."\n"
  ."\n"
  ."何卒宜しくお願い致します。";

	function __construct($db){
		parent::init();
		$this->db = $db;
	}

	/**
	 * 詳細取得
	 *
	 * @param int $clientId
	 * @param int $staffId
	 * @param string $staffType
	 * @return array $template {}
	 */
	public function fetchRow($clientId, $staffId, $staffType) {
		$dao = Application_CommonUtil::getInstance("dao", "ShareRoomNameTemplateDao", $this->db);
      $template = $dao->fetchRow($clientId, $staffId, $staffType);
    // 問い合わせても、データがない場合もデフォルトメッセージを入れて返す。
    if (empty($template) || $template["text"] == null) {
      $template["text"] = self::DEFAULT_MESSAGE;
    }

		return $template;
	}

	/**
	 * 新規作成・編集
	 *
	 * @param array $staffInfo {スタッフ情報}
	 * @param array $text str
	 * @param int $id default NULL(NULL以外の時は編集)
	 * @return array $response {status=>boolean, result=>array(str)}
	 */
	public function create($staffInfo, $text, $id=NULL) {
	
		$dao = Application_CommonUtil::getInstance("dao", "ShareRoomNameTemplateDao", $this->db);
		$result = array(
			"status" => true,
			"result" => array()
		);

    
		// 招待文・SMSテンプレート データ整形
		$shareRoomNameTemplate = array(
			"client_id" => $staffInfo["client_id"],
      "staff_id" => $staffInfo["staff_id"],
      "staff_type" => $staffInfo["staff_type"],
			"text" => $text
		);


		// IDの有無で、新規作成か編集かを識別
		try{
			if(!empty($id)) {
				$dao->update($id, $shareRoomNameTemplate);
			} else {
				$dao->insert($shareRoomNameTemplate);
			}
		} catch(Exception $e) {
			$result = array(
				"status" => false,
				"result" => array("サーバーエラーです。管理者にお問い合わせください。")
			);
			error_log($e->getMessage());
			throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
		}

		return $result;
	}

}
