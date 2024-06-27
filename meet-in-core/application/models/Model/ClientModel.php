<?php

/**
 * クライアントコントローラーで使用するモデル
 * @author admin
 *
 */
class ClientModel extends AbstractModel{

	private $db;							// DBコネクション
	function __construct($db){
		parent::init();
		$this->db = $db;
	}

	public function init() {
		// __constructでparent::init()を実行しなければ親の初期化が実行されない
		//parent::init();
	}

	/**
	 * クライアント一覧の表示に必要なデータを取得する
	 * @param unknown $form
	 * @param unknown $screenSession
	 */
	function getClientList($form, &$screenSession){
		// セッションの初期化
		if($screenSession->isnew == true){
			$screenSession->order = 'client_id';
			$screenSession->page = 1;
			$screenSession->pagesize = 100;
			$screenSession->ordertype = 'asc';	// 任意
			$screenSession->err = 0;
		}
		// パラメータをセッションに格納
		foreach($form as $key=>$val){
			$screenSession->$key = $val;
		}

		// daoの宣言
		$masterClientDao = Application_CommonUtil::getInstance("dao", "MasterClientDao", $this->db);

		// 表示タイプを切り替えた場合は、ページャー等を初期化する
		if(array_key_exists("retrievalType", $form)){
			$screenSession->page = 1;
			$screenSession->pagesize = 100;
		}

		$condition = "";
		// 検索ボタンが押下された場合、ページを初期化する
		if(array_key_exists("free_word", $form)){
			$screenSession->page = 1;
		}
		// 検索条件が存在する場合検索条件を作成する
		if(!is_null($screenSession->free_word)){
			$escapeText = $this->escape($screenSession->free_word);
			$condition = " AND (client_id like '%{$escapeText}%' OR client_name like '%{$escapeText}%' OR client_tel1 like '%{$escapeText}%' OR client_tel2 like '%{$escapeText}%' OR client_tel3 like '%{$escapeText}%'  OR client_staffleaderemail like '%{$escapeText}%') ";
		}
error_log("getClientList $condition=(". $condition .") \n", 3, "/var/tmp/negotiation.log");

		// クライアント情報を取得する
		$count = $masterClientDao->getClientCount($condition);
		$list = $masterClientDao->getClientList($condition, $screenSession->order, $screenSession->ordertype, $screenSession->page, $screenSession->pagesize);
		$list_client = new Application_Pager(array(
				"itemData" => $list,						// リスト
				"itemCount" => $count,						// リスト
				"perPage" => $screenSession->pagesize,		// ページごと表示件数
				"curPage" => $screenSession->page,			// 表示するページ
				"order" => $screenSession->order,			// ソートカラム名
				"orderType" => $screenSession->ordertype,	// asc or desc
		));
		// 戻り値を作成する
		$result["list"] = $list_client;
		$result["err"] = $screenSession->err;
		return $result;
	}

	/**
	 * クライアント一覧でクライアントを選択し、成り変わる処理
	 * @param unknown $form
	 */
	public function changeClient($clientId){
		$result["errFlg"] = 1;
		if($clientId != ""){
			// daoの宣言
			$masterClientDao = Application_CommonUtil::getInstance("dao", "MasterClientDao", $this->db);
			$clientId = $this->escape($clientId);
			$row = $masterClientDao->getMasterClientRow($clientId);
			if($row){
				$this->user['client_id'] = $row['client_id'];
				$this->user['client_name'] = $row['client_name'];
				$this->user['plan_this_month'] = $row['plan_this_month'];
				$this->user['client_type'] = $row['client_type'];
				$this->user['two_factor_authenticate_flg'] = $row['two_factor_authenticate_flg'];
				$this->user['negotiation_room_type'] = $row['negotiation_room_type'];

				Zend_Auth::getInstance()->getStorage()->write($this->user);

				$result["client_name"] = $row['client_name'];
				$result["plan_this_month"] = $row['plan_this_month'];
				$result["record_method_type"] = $this->user["record_method_type"];
				$result["errFlg"] = 0;
// error_log("changeClient client_id=(". $this->user['client_id'] .") \n", 3, "/var/tmp/negotiation.log");
// error_log("changeClient client_name=(". $this->user['client_name'] .") \n", 3, "/var/tmp/negotiation.log");
// error_log("changeClient plan=(". $this->user['plan'] .") \n", 3, "/var/tmp/negotiation.log");
			}
		}
		return $result;
	}

	public function getNegotiationAudioTextLimitInformation($clientId, $staffType) {
		
		$masterClientDao = Application_CommonUtil::getInstance("dao", "MasterClientDao", $this->db);
		$result = $masterClientDao->getMasterClientRow($clientId);
		$unrestricted = false;
		$lock = false;
		$time_limit_second = 0;
		if($result['negotiation_audio_text_remaining_hour'] === null || $staffType == "AA") {
			$unrestricted = true;
		} else {
			// 追加で文字起こし時間を購入した場合はプラスする
			if(!is_null($result['negotiation_audio_text_add_time_limit_second'])){
				$time_limit_second = $result['negotiation_audio_text_time_limit_second'] + $result['negotiation_audio_text_add_time_limit_second'];
			}else{
				$time_limit_second = $result['negotiation_audio_text_time_limit_second'];
			}
			// デフォルトの文字起こしの時間が0の場合、追加で購入した文字起こしの時間を取得
			if(!$time_limit_second){
				$negotiation_audio_text_add_time = $result['negotiation_audio_text_add_time_limit_second'];
				$time_limit_second = $negotiation_audio_text_add_time;
				if($negotiation_audio_text_add_time < 1){
					$lock = true;
					$time_limit_second = 0;
				}
			}
		}

		return [
			'code' => 1,
			'lock' => $lock,
			'time_limit_second' => $time_limit_second,
			'unrestricted' => $unrestricted
		];

	}

	public function getNegotiationAudioAnalysisLimitInformation($clientId, $staffType) {
		$masterClientDao = Application_CommonUtil::getInstance("dao", "MasterClientDao", $this->db);
		$result = $masterClientDao->getMasterClientRow($clientId);
		$unrestricted = false;
		$lock = false;
		$time_limit_second = 0;
		if($result['negotiation_audio_analysis_remaining_hour'] === null || $staffType == "AA") {
			$unrestricted = true;
		} else {
			// 追加で音声分析時間を購入した場合はプラスする
			if(!is_null($result['negotiation_audio_analysis_add_time_limit_second'])){
				$time_limit_second = $result['negotiation_audio_analysis_time_limit_second'] + $result['negotiation_audio_analysis_add_time_limit_second'];
			}else{
				$time_limit_second = $result['negotiation_audio_analysis_time_limit_second'];
			}
			// デフォルトの音声分析の時間が0の場合、追加で購入した音声分析の時間を取得
			if(!$time_limit_second){
				$negotiation_audio_analysis_add_time = $result['negotiation_audio_analysis_add_time_limit_second'];
				$time_limit_second = $negotiation_audio_analysis_add_time;
				if($negotiation_audio_analysis_add_time < 1){
					$lock = true;
					$time_limit_second = 0;
				}
			}
		}

		return [
			'code' => 1,
			'lock' => $lock,
			'time_limit_second' => $time_limit_second,
			'unrestricted' => $unrestricted
		];

	}
}
