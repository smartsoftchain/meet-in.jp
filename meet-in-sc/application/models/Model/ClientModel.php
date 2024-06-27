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
				Zend_Auth::getInstance()->getStorage()->write($this->user);
				$result["errFlg"] = 0;
			}
			// connectioninfoのoperator_client_idを更新
			$this->db->beginTransaction();
			try {
				$connectionInfoDao = Application_CommonUtil::getInstance("dao", "ConnectionInfoDao", $this->db);
				$dict = array(
					"operator_client_id" => $clientId,
				);
				$meetin_number = $this->user["meetin_number"];
				// ログインしている利用者＆
				// connection_request_start_datetimeがNULL(一時発行番号は値あり)
				$condition = "(connect_no = '{$meetin_number}') AND (connection_request_start_datetime IS NULL) AND (connection_state <> 5)";
				$connectionInfoDao->update($dict, $condition);
				$this->db->commit();
			}catch(Exception $e){
				$this->db->rollBack();
				error_log($e->getMessage());
				throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
			}
		}
		return $result;
	}

}