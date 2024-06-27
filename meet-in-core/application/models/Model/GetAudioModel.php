<?php

class GetAudioModel extends AbstractModel {

	function __construct($db){
		parent::init();
		$this->db = $db;
	}

	/**
	 * DBから文字起こしファイル一覧を取得する
	 */
    public function recordInsert($user, $form) {

        $text = $form["text"];
        $text_type = $form["text_type"];
        $date = date('Y-m-d H:i:s');

        //ルーム名をurlから取得
        if(isset($form['room_name'])){
            $room_name = $form['room_name'];
        } else {
            $url = $_SERVER['HTTP_REFERER'];
            $keys = parse_url($url);
            $path = explode("/", $keys['path']);
            $room_name = end($path);
        }

        // 追加するデータ
        $params = array (
            'text' => $text,
            'text_type' => $text_type,
            'create_date' => $date,
            'room_name' => $room_name,
            'staff_id' => $user['staff_id'],
            'staff_type' => $user['staff_type'],
            'client_id' => $user['client_id'],
            'title' => $room_name ."/". $date,
            'del_flg' => 0,
            'status' => 0,
            'status_code' => ""
        );

        // DAOの宣言
        $negotiationAudioTextDao = Application_CommonUtil::getInstance('dao','NegotiationAudioTextDao', $this->db);
        $negotiationAudioTextDao->insert($params);

    }


	/**
	 * DBから文字起こしファイル一覧を取得する
	 */
    public function getTextList($form, &$screenSession){
        // セッションの初期化
        if($screenSession->isnew == true){
            $screenSession->order = 'id';
            $screenSession->page = 1;
            $screenSession->pagesize = 100;
            $screenSession->ordertype = 'DESC';  // 任意
        }
        // パラメータをセッションに格納
        foreach($form as $key=>$val){
			$screenSession->$key = $val;
		}
        // DAOの宣言
        $negotiationAudioTextDao = Application_CommonUtil::getInstance('dao','NegotiationAudioTextDao', $this->db);
        //条件の設定
		$condition = "";
		// 検索ボタンが押下された場合、ページを初期化する
		if(array_key_exists("free_word", $form)){
			$screenSession->page = 1;
		}
		// 検索条件が存在する場合検索条件を作成する
		if(!is_null($screenSession->free_word)){
			$escapeText = $this->escape($screenSession->free_word);
			$condition = "(title like '%{$escapeText}%' OR text like '%{$escapeText}%') AND (staff_id = '{$this->user["staff_id"]}' AND del_flg = '0')";
		}else{
			$condition = "(staff_id = '{$this->user["staff_id"]}' AND del_flg = '0')";
		}
		//ページネーション用呼び出し
		$dataCount = $negotiationAudioTextDao->getDocumentCount($condition);
		$dataList = $negotiationAudioTextDao->getDocumentList($condition, $screenSession->order, $screenSession->ordertype , $screenSession->page, $screenSession->pagesize);
        $data = $negotiationAudioTextDao->getTextList($condition);
        // ページャ設定
        $list = new Application_Pager(array(
            "itemData" => $dataList,        // リスト
            "itemCount" => $dataCount,      // カウント
            "perPage" => $screenSession->pagesize,    // ページごと表示件数
            "curPage" => $screenSession->page,      // 表示するページ
            "order" => $screenSession->order,      // ソートカラム名
            "orderType" => $screenSession->ordertype,  // asc or desc
		));
        // データを取得する
        $result["list"] = $list;
        // 戻り値を返す
		return $result;
	}

	/**
	 * 文字起こしファイル個別ページ表示
	 */
	public function getTextDetail($form) {
		$negotiationAudioTextDao = Application_CommonUtil::getInstance('dao','NegotiationAudioTextDao', $this->db);
		$condition = "(id = '{$form["id"]}')";
		$data = $negotiationAudioTextDao->getTextDetail($condition);
		$result = $data;
		return $result;
	}

	/**
	 * 文字起こしファイル編集
	 */
	public function getTextEdit($form) {
		//Daoの宣言
		$negotiationAudioTextDao = Application_CommonUtil::getInstance('dao','NegotiationAudioTextDao', $this->db);
		$condition = "(id = '{$form["id"]}')";
		$this->db->beginTransaction();
		$result = $negotiationAudioTextDao->audioTextEdit($form,$condition);
		$this->db->commit();
		return $result;
	}

	/**
	 * 選択された文字起こしファイルデータをDBから削除する
	 */
    public function deleteAudioText($form, $request) {
		// daoの宣言
		$negotiationAudioTextDao = Application_CommonUtil::getInstance('dao', "NegotiationAudioTextDao", $this->db);
		$data = array();
		$condition = "";
		$cond_list = array();
		// 要素がない場合は無処理
		foreach(explode(',', $form['ids']) as $val) {
			$cond_list[] = "id = {$val}";
		}
		if(count($cond_list) == 0) {
			return $data;
		}
		$condition = " " . implode(" OR ", $cond_list);
		$this->db->beginTransaction();
		$data = $negotiationAudioTextDao->deleteAudioText($condition);
		$this->db->commit();
		// 戻り値を作成する
		return $data;
	}

	/**
	 * 文字起こしファイルダウンロード
	 */
	public function downloadTextFile($id) {
		//Daoの宣言
		$negotiationAudioTextDao = Application_CommonUtil::getInstance('dao','NegotiationAudioTextDao', $this->db);
		$condition = "(id = '{$id}')";
		$result = $negotiationAudioTextDao->downloadTextFile($condition);
		return $result;
	}

	/**
	 * テキスト追加のためのレコード更新
	 */
	public function recordUpdate($text,$id) {
		//Daoの宣言
		$negotiationAudioTextDao = Application_CommonUtil::getInstance('dao','NegotiationAudioTextDao', $this->db);
		$condition = "(id = {$id})";
		$this->db->beginTransaction();
		$result = $negotiationAudioTextDao->columnUpdate($text,$condition);
		$this->db->commit();
		return $result;
	}

}

?>
