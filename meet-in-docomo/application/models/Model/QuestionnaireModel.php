<?php

/**
 * クエチョンエリアコントローラーで使用するモデル
 * @author admin
 *
 */
class QuestionnaireModel extends AbstractModel
{
    private $db;							// DBコネクション
    public function __construct($db)
    {
        parent::init();
        $this->db = $db;
    }

    public function init()
    {
        // __constructでparent::init()を実行しなければ親の初期化が実行されない
        //parent::init();
    }

    /**
     * アンケート結果一覧の表示に必要なデータを取得する
     *
     *
     */
    public function getQuestionList($staff_id, $webinar_id)
    {
        // daoの宣言
        $QuestionnaireDao = Application_CommonUtil::getInstance("dao", "QuestionnaireDao", $this->db);
        // アンケート結果を取得する
        $questionResult = $QuestionnaireDao->getQuestionResult($staff_id, $webinar_id);
        $result = $questionResult;
        
        return $result;
    }
    
    /**
     * 複数選択式アンケート結果の詳細情報を取得する
     *
     *
     */
    public function getAnySelectQuestionDetail($history_id, $questionnaire_id)
    {
        // daoの宣言
        $QuestionnaireDao = Application_CommonUtil::getInstance("dao", "QuestionnaireDao", $this->db);
        // アンケート結果を取得する
        $questionDetail = $QuestionnaireDao->getAnySelectQuestionDetailByhistoryId($history_id, $questionnaire_id);
        $result = $questionDetail;
        
        return $result;
    }

    /**
     * 二択式アンケート結果の詳細情報を取得する
     *
     *
     */
    public function getTwoChoiceQuestionDetail($history_id)
    {
        // daoの宣言
        $QuestionnaireDao = Application_CommonUtil::getInstance("dao", "QuestionnaireDao", $this->db);
        // アンケート結果を取得する
        $questionDetail = $QuestionnaireDao->getTwoChoiceQuestionDetailByhistoryId($history_id);
        $result = $questionDetail;
        
        return $result;
    }

    /**
     * 記述式アンケート結果の詳細情報を取得する
     *
     *
     */
    public function getTextQuestionDetail($history_id)
    {
        // daoの宣言
        $QuestionnaireDao = Application_CommonUtil::getInstance("dao", "QuestionnaireDao", $this->db);
        // アンケート結果を取得する
        $questionDetail = $QuestionnaireDao->getTextQuestionDetailByhistoryId($history_id);
        $result = $questionDetail;
        
        return $result;
    }

    /**
     * アンケート集の一覧情報を取得する
     *
     *
     */
    public function getQuestionAllList($form, &$screenSession)
    {
        // セッションの初期化
        if ($screenSession->isnew == true) {
            $screenSession->order = 'id';
            $screenSession->page = 1;
            $screenSession->pagesize = 100;
            $screenSession->ordertype = 'desc';	// 任意
            $screenSession->viewType = 'plan';	// 任意
        }
        // パラメータをセッションに格納
        foreach ($form as $key=>$val) {
            $screenSession->$key = $val;
        }
        // daoの宣言
        $QuestionnaireDao = Application_CommonUtil::getInstance("dao", "QuestionnaireDao", $this->db);
        // フリーワード変数の初期化
        $freeWord = "";
        // 検索ボタンが押下された場合、ページを初期化する
        if (array_key_exists("free_word", $form)) {
            $screenSession->page = 1;
        }
        // 検索条件が存在する場合検索条件をエスケープする
        if (!is_null($screenSession->free_word)) {
            $freeWord = $this->escape($screenSession->free_word);
        }

        // アンケート集のリストを取得する
        $list = $QuestionnaireDao->getTextQuestionAllList($this->user["client_id"], $freeWord, $screenSession->viewType, $screenSession->order, $screenSession->ordertype, $screenSession->page, $screenSession->pagesize);
        // ウェビナー全件を取得する
        $allCount = $QuestionnaireDao->getAllQuestionCount($this->user["client_id"], $freeWord);
        $list_count = count($list);
        $listObject = new Application_Pager(array(
            "itemData"	=> $list,
            "itemCount"	=> $allCount,						// リスト					// リスト
            "perPage"	=> $screenSession->pagesize,	// ページごと表示件数
            "curPage"	=> $screenSession->page,		// 表示するページ
            "order"		=> $screenSession->order,		// ソートカラム名
            "orderType"	=> $screenSession->ordertype,	// asc or desc
    ));
        
        return array("listObject"=>$listObject, "itemCount"	=> $list_count);
    }
    /**
     * アンケート集名クリック時 個別ページ表示
     */
    public function getQuestionnaireDetail($questionnaire_group_id)
    {
        $questionnaireDao = Application_CommonUtil::getInstance('dao', 'QuestionnaireDao', $this->db);
        $data = $questionnaireDao->getQuestionnaireDetail($questionnaire_group_id);
        $result = $data;
        return $result;
    }

    public function addQuestionnaire($group_id, $quiestionnaires)
    {
        // 入力されたアンケートブロックの数だけループをする
        $i = 1;
        while (array_key_exists("quiestionnaire_name" . $i, $quiestionnaires)) {
            // quiestionnaireテーブルに対する処理
            // 行を挿入するテーブル名
            $table = 'questionnaire';
            // 初期化
            $quiestionnaires_params = array();
            // 追加するデータ
            $quiestionnaires_params = array(
                'group_id' => $group_id,
                'staff_type' => $this->user['staff_type'],
                'staff_id' => $this->user['client_id'],
                'title' => $quiestionnaires["quiestionnaire_name" . $i],
                'question' => $quiestionnaires["quiestionnaire_content" . $i],
                'answer_type' => $quiestionnaires["quiestionnaire_input_type" . $i],
                'del_flg' => 0,
                'create_date' => new Zend_Db_Expr('now()')
                            );
            //質問形式の「記述式」を選んだ場合、配列に単数行or複数行のタイプを追加する
            if ($quiestionnaires["quiestionnaire_input_type" . $i] == 3) {
                $quiestionnaires_params += array('description_type'=>$quiestionnaires["quiestionnaire_form_select" . $i]);
            }
            // DBに行を挿入
            $this->db->insert($table, $quiestionnaires_params);
            $last_questionnaire_id = $this->db->lastInsertId($table, 'id');
                                                            
                            
            //質問形式の「3択以上」を選んだ場合、複数フォームに別れた値をquestionnaire_choicesテーブルに追加する
            if ($quiestionnaires["quiestionnaire_input_type" . $i] == "1") {
                // 入力された回答の選択肢の数だけループをする
                foreach ($quiestionnaires["quiestionnaire_answer" . $i] as $data) {
                    // questionnaire_choicesテーブルに対する処理
                    // 初期化
                    $select_answer_data = array();
                    // 追加するデータ
                    $select_answer_data = array(
                        'questionnaire_id' => $last_questionnaire_id,
                        'staff_type' => $this->user['staff_type'],
                        'staff_id' => $this->user['staff_id'],
                        'content' => $data,
                        'del_flg' => 0,
                        'create_date' => new Zend_Db_Expr('now()')
                                            );
                    // DBに行を挿入
                    $this->db->insert('questionnaire_choices', $select_answer_data);
                }
            }
            $i++;
        };
    }

    /**
     * 選択されたアンケート集を編集する
     */
    public function editQuestionnaire($form, $request)
    {
        // daoの宣言
        $questionnaireDao = Application_CommonUtil::getInstance('dao', "QuestionnaireDao", $this->db);
        $data = array();
        $condition = "";
        $result["status"]= true;
        $result["error_c"]= 0;
        $result["error_m"]= "";

        // エラーチェック
        $errorList = $this->questionnaireFormValidation($form);
                
        if (count($errorList) > 0) {
            // エラーがあれば編集画面のまま
            $result["status"]= false;
            $result["error_c"]= 1;
            $result["error_m"]= $errorList;
            return $result;
        }

        $this->db->beginTransaction();
        try {
            // アンケート集の情報を更新する
            $record = array(
                'title' => $form["quiestionnaire_group_name"],
                );
            $condition = "id = {$form["quiestionnaire_group_id"]}";
            $data = $questionnaireDao->updateQuestionnaireGroup($record, $condition);
            
            // 編集前のアンケートを削除フラグを立てる
            $condition = "group_id = {$form["quiestionnaire_group_id"]}";
            $data = $questionnaireDao->deleteQuestionnaire($condition);

            // 編集後のアンケート内容を新規で追加する
            $data = $this->addQuestionnaire($form["quiestionnaire_group_id"], $form);
            $this->db->commit();
        } catch (Exception $e) {
            $this->db->rollBack();
            $result["status"]= false;
            $result["error_c"]= 2;
            $result["error_m"]= "DB登録エラー";
            throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
        }
        // 戻り値を作成する
        return $result;
    }

    /**
     * 選択されたアンケートをDBから削除する
     */
    public function deleteQuestionnaire($form, $request)
    {
        // daoの宣言
        $questionnaireDao = Application_CommonUtil::getInstance('dao', "QuestionnaireDao", $this->db);
        $data = array();
        $condition = "";
        $cond_list = array();
        // 要素がない場合は無処理
        foreach (explode(',', $form['ids']) as $val) {
            $cond_list[] = "id = {$val}";
        }
        if (count($cond_list) == 0) {
            return $data;
        }
        $condition = " " . implode(" OR ", $cond_list);
        $this->db->beginTransaction();
        $data = $questionnaireDao->deleteQuestionnaireGroup($condition);
        $this->db->commit();
        // 戻り値を作成する
        return $data;
    }
        
    /**
     * アンケートのバリデーション
     * @param unknown $form
     */
    public function questionnaireFormValidation($q_data)
    {
        $validationDict = array(
            "quiestionnaire_group_name" => array(
                "name" => "アンケート集名",
                "length" => "255",
                "validate" =>  array(1)
            ),
                );
        // 入力されたアンケートブロックの数だけループをする
        $i = 1;
        while (array_key_exists("quiestionnaire_name{$i}", $q_data)) {
            $validationDict += array("quiestionnaire_name{$i}" => array( "name" => "アンケート{$i} アンケート名", "length" => "255", "validate" =>  array(1)));
            $validationDict += array("quiestionnaire_content{$i}" => array( "name" => "アンケート{$i} 質問内容", "length" => "255", "validate" =>  array(1)));
            //質問形式の「3択以上」を選んだ場合、複数フォームに別れた値をquestionnaire_choicesテーブルに追加する
            if ($q_data["quiestionnaire_input_type{$i}"] == "1") {
                // 入力された回答の選択肢の数だけループをする
                // foreach ($q_data["quiestionnaire_answer{$i}"] as $key => $data) {
                //     $q_data += array("quiestionnaire_answer{$i}_{$key}" => $data);
                //     $validationDict += array("quiestionnaire_answer{$i}_{$key}" => array( "name" => "アンケート".$i." 回答", "length" => "255", "validate" => array(1)));
                // }
                unset($q_data["quiestionnaire_answer{$i}"]);
            }
            $i++;
        }

        $errorList = executionValidation($q_data, $validationDict);

        return $errorList;
    }
}
