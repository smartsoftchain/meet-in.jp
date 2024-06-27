<?php

require_once ROOT.'library/Application/validation.php';

/**
 * 操作ログで使用するモデル
 * @author admin
 *
 */
class OperationLogModel extends AbstractModel{

	const IDENTIFIER = "operation_log";						// セッション変数のnamespace

	private $db;	// DBコネクション
	/**
	 * コンストラクタ
	 *
	 * @param unknown $db
	 */
	function __construct($db){
		$this->db = $db;

		parent::init();
	}

	/**
	 * 操作ログ一覧を取得
	 * @param unknown $form
	 * @param unknown $screenSession
	 * @return Application_Pager
	 */
	public function getLogList($form, &$screenSession) {
		
		// daoの宣言
		$logDao = Application_CommonUtil::getInstance('dao', "LogDao", $this->db);
		
		// セッション取得
		$session = Application_CommonUtil::getSession(self::IDENTIFIER);
		
		$user = $this->user;
		$condition = "";
		
		// セッションの初期化
		if($screenSession->isnew == true){
			$screenSession->order     = 'a.create_time';	// FIXME ここが後で、create_dateになったら変更する
			$screenSession->page      = 1;
			$screenSession->pagesize  = 100;
			$screenSession->ordertype = 'desc';	// 任意
		}
		
		// パラメータをセッションに格納
		foreach($form as $key=>$val){
			$screenSession->$key = $val;
		}
		
		$freeWord = "";	// 検索条件を画面へ戻すためのに一時保存
		$where = array(" a.client_id = '{$user["client_id"]}' ");
		
		// 検索ボタンが押下された場合、ページを初期化する
		if(array_key_exists("free_word", $form)){
			$screenSession->page = 1;
		}
		
		// 検索ボタンが押下された場合、検索条件を作成し、ページを初期化する
		if(!empty($screenSession->free_word)){
			$freeWord   = $screenSession->free_word;
			$escapeText = $this->escape($screenSession->free_word);
			
			$where[] = " AND (a.action_name LIKE '%".$escapeText."%' OR AES_DECRYPT(b.staff_name,@key) LIKE '%".$escapeText."%') ";
		}
		
		// 条件が設定されている場合のみ使用
		if (0 < count($where)) {
			$condition = implode($where);
		}
		
		$count   = $logDao->getLogCount($condition);
		$logList = $logDao->getLogList(
			$condition,
			$screenSession->order,
			$screenSession->ordertype,
			$screenSession->page,
			$screenSession->pagesize
		);
		
		$list = new Application_Pager(array(
			"itemData"  => $logList,						// リスト（未スライス）
			"itemCount" => $count,						// リスト（未スライス）
			"perPage"   => $screenSession->pagesize,	// ページごと表示件数
			"curPage"   => $screenSession->page,		// 表示するページ
			"order"     => $screenSession->order,		// ソートカラム名
			"orderType" => $screenSession->ordertype,	// asc or desc
		));
		
		// CSV出力で使用する為に検索条件をセッションに保存
		$session->condition = $condition;
		
		$result["list"] = $list;
		
		return $result;
	}
	
	/**
	 * CSVデータを取得
	 * @return string
	 */
	public function getCsvResult() {
		
		$csvHeaderDict = array(
			'create_date' => '日付',
			'staff_name'  => '担当者名',
			'action_name' => '操作内容'
			//'send_data'   => '送信データ'	// 必要な場合は入れる。しかしAAの場合と、CEの場合で分ける必要がある？
		);
		
		$csvBodyKeys = array_keys($csvHeaderDict);
		$csvHeader   = array_values($csvHeaderDict);
		
		// ヘッダー項目を作成
		$csvData = "";
		$csvData .= join(",", $csvHeader) . "\n";
		
		// 架電のアプローチ画面に表示するデータを取得する
		$csvBodyList = $this->getRawCsvResult();
		
		foreach ($csvBodyList as $csvBodyRow) {
		
			$rowList   = array();
			$rowString = "";
		
			foreach ($csvBodyKeys as $key) {
				$rowList[] = $csvBodyRow[$key];
			}
		
			$rowString = join(",", $rowList);
			$csvData .= $rowString . "\n";
		}
		
		return $csvData;
	}
	
	/**
	 * CSV整形前のCSVデータを取得
	 * @param unknown $screenSession
	 * @return multitype:
	 */
	public function getRawCsvResult() {
		
		// daoの宣言
		$logDao = Application_CommonUtil::getInstance('dao', "LogDao", $this->db);
		
		// セッション取得
		$session = Application_CommonUtil::getSession(self::IDENTIFIER);
		
		// 通常の検索と同じロジックを使用するため、パラメータを設定
		$order     = 'a.create_time';  // FIXME 個々のカラムがcreate_dateになったら変更する
		$page      = 1;
		$pagesize  = 10000;
		$ordertype = 'asc';
		
		// 一覧表の検索条件を設定
		$condition = $session->condition;
		
		
		$count = $logDao->getLogCount($condition);
		
		$result = array();
		
		// カウントを超すまでリクエストを投げる。
		while ((($page - 1) * $pagesize) < $count) {
		
			$logList = $logDao->getLogList(
				$condition,
				$order,
				$ordertype,
				$page,
				$pagesize
			);
		
			$result = array_merge($result, $logList);
			$page++;
		}
		
		return $result;
	}
}