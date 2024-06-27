<?php

/**
 * QuestionnaireDao クラス
 *
 * アンケートのDaoクラス
 *
 * @version 2015/08/11 16:16 ochi
 * @package Dao
*/
class QuestionnaireDao extends AbstractDao
{
    private $db;
    public function __construct($db)
    {
        parent::init();
        $this->db = $db;
    }

    /**
     * アンケート結果一覧情婦取得
     *
     *
     */
    public function getQuestionResult($staff_id, $webinar_id)
    {
        $sql = "SELECT
                question.id as questionnaire_id,
                question.title,
                question.answer_type,
                question.question,
                webi.holding_date,
                webi.name,
                webi.current_participant_count as participant,
                question_history.id as history_id,
                CASE
                  WHEN question.answer_type = 1 THEN (TRUNCATE(((select count(*) from select_answer where question_history.id = select_answer.history_id ) / webi.current_participant_count ) *100, 0))
                  WHEN question.answer_type = 2 THEN (TRUNCATE(((select count(*) from text_answer where question_history.id = text_answer.history_id ) / webi.current_participant_count) *100, 0))
                  WHEN question.answer_type = 3 THEN (TRUNCATE(((select count(*) from two_choices_answer where question_history.id = two_choices_answer.history_id ) / webi.current_participant_count) *100, 0))
                END AS answer_percentage        
              FROM
                questionnaire as question
              INNER JOIN
                webinar_questionnaire_history as question_history
              ON
                question.id = question_history.questionnaire_id
              LEFT OUTER JOIN
                webinar as webi
              ON
                webi.id = question_history.webinar_id
              LEFT OUTER JOIN
                select_answer as selectAnswer
              ON
                question_history.id = selectAnswer.history_id
              AND
                question.answer_type = 3
              LEFT OUTER JOIN
                text_answer as textAnswer
              ON
                question_history.id = textAnswer.history_id
              AND
                question.answer_type = 1
              LEFT OUTER JOIN
                two_choices_answer as twoAnswer
              ON
                question_history.id = twoAnswer.history_id
              AND
                question.answer_type = 2
              WHERE
                question.staff_id = {$staff_id}
              AND
                question_history.webinar_id = {$webinar_id}
              AND
                webi.id = {$webinar_id}
              GROUP BY
                question.id
      ";
        $rtn = $this->db->fetchAll($sql, array());
        return $rtn;
    }
    
    /**
     * 複数選択式アンケート結果詳細情婦取得
     *
     *
     */
    public function getAnySelectQuestionDetailByhistoryId($history_id, $questionnaire_id)
    {
        $sql = "SELECT
                answerOption.content as answer,
                count(selectAnswer.id) as answer_count              
              FROM
                questionnaire as question
              LEFT OUTER JOIN
                select_answer_option as answerOption
              ON
                answerOption.questionnaire_id = question.id
              LEFT OUTER JOIN
                select_answer as selectAnswer
              ON
                selectAnswer.option_id = answerOption.id
              WHERE
                answerOption.questionnaire_id = {$questionnaire_id}
              GROUP BY
                selectAnswer.option_id
            ";
        $rtn = $this->db->fetchAll($sql, array());
        return $rtn;
    }

    /**
     * 二択式アンケート結果の詳細情報を取得
     *
     *
     */
    public function getTwoChoiceQuestionDetailByhistoryId($history_id)
    {
        $sql = "SELECT
                answer,
                COUNT(id) as answer_count
              FROM
                two_choices_answer
              WHERE
                history_id = {$history_id}
              GROUP BY
                answer
             ";
        $rtn = $this->db->fetchAll($sql, array());
        return $rtn;
    }

    /**
     * 記述式アンケート結果の詳細情報を取得
     *
     *
     */
    public function getTextQuestionDetailByhistoryId($history_id)
    {
        $sql = "SELECT
                answer
              FROM
                text_answer
              WHERE
                history_id = {$history_id}
             ";
        $rtn = $this->db->fetchAll($sql, array());
        return $rtn;
    }

    /**
     * アンケート集一覧を取得
     *
     *
     */
    public function getTextQuestionAllList($clientId, $freeWord, $type, $order, $ordertype, $page, $limit)
    {
        // 何ページ目を表示するかの値を設定
        $offset = 0;
        $page = $page - 1;
        if ($page > 0) {
            $offset = $page * $limit;
        }
        // フリーワードから検索条件を作成する
        $condition = $this->questionnaireListDisplayCondition($freeWord);
    
        $sql = "SELECT
              id,
              title,
              update_date
            FROM
              questionnaire_group
            WHERE
              del_flg = 0 AND 
              client_id = {$clientId}
              {$condition} 
            GROUP BY 
              id  
            ORDER BY
              {$order} {$ordertype}
            LIMIT
              {$limit}
            OFFSET
              {$offset};
          ";

        $rtn = $this->db->fetchAll($sql, array());
        return $rtn;
    }

    public function getAllQuestionCount($clientId, $freeWord)
    {
        // フリーワードから検索条件を作成する
        $condition = $this->questionnaireListDisplayCondition($freeWord);
        // クエリ作成
        $sql = "SELECT
					count(id) as count
				FROM
        questionnaire_group as a
				WHERE 
        del_flg = 0 AND 
        client_id = {$clientId}
        {$condition} 
				";
        $rtn = $this->db->fetchRow($sql, array());
        return $rtn["count"];
    }

    /**
     * アンケート集一覧でフリーワード検索が存在した場合に検索条件を作成
   *
     * @param string	$freeWord	フリーワード
     * @return string
     */
    private function questionnaireListDisplayCondition($freeWord)
    {
        // 戻り値の検索条件
        $condition = "";
        if ($freeWord != "") {
            // フリーワードが入力されている場合
            $condition = "AND(
								`title` like '%{$freeWord}%' OR 
								DATE_FORMAT(`update_date`, '%Y-%m-%d %H:%i:%s' ) like '%{$freeWord}%'
							)";
        }
        // 戻り値を返す
        return $condition;
    }
  
    // /**
    //  * アンケート集一覧の取得条件とカウントを取得する
    //  * [plan→予定][end→終了][all→全件数]
    //  * @param int		$clientId	クライアントID
    //  * @param string	$freeWord	フリーワード検索条件
    //  * @param string	$type		種別
    //  * @return int
    //  */
    // public function getQuestionnaireListCount($staff_id, $freeWord) {
    //   // フリーワードから検索条件を作成する
    //   if($condition != ''){
    //     $condition = $this->questionnaireListDisplayCondition($freeWord);
    //   }else {
    //     $condition = '';
    //   }

    // 	// クエリ作成
    // 	$sql = "SELECT
    // 				count(id) as count
    // 			FROM
    //         questionnaire_group
    // 			WHERE
    //         staff_id = {$staff_id}
    // 				{$condition}
    // 			";
    // 	$rtn = $this->db->fetchRow($sql, array());
    // 	return $rtn["count"];
    // }

    /**
       * ファイルごとの詳細情報を取得する
       */
    public function getQuestionnaireDetail($questionnaire_group_id)
    {
        $sql = "SELECT
          question_group.title as group_name,
          question_group.del_flg,
          question_group.update_date,
          question.id,
          question.title,
          question.question,
          question.answer_type,
          question.description_type,
          GROUP_CONCAT(q_choices.content) AS choices
        FROM
          questionnaire_group as question_group
        LEFT OUTER JOIN
          questionnaire as question
        ON
          question.group_id = question_group.id
        LEFT OUTER JOIN
          questionnaire_choices as q_choices
        ON
          question.id = q_choices.questionnaire_id
        WHERE
          question_group.id = $questionnaire_group_id
          AND 
          question_group.del_flg = 0
          AND 
          question.del_flg = 0
        GROUP BY 
          question.id
      ";
        $rtn = $this->db->fetchAll($sql, array());
        return $rtn;
    }

    /**
       * アンケート集を指定して更新する
       */
    public function updateQuestionnaireGroup($record, $condition)
    {
        $record["update_date"] = new Zend_Db_Expr('now()');
        $result = $this->db->update('questionnaire_group', $record, $condition);
        return $result;
    }

    /**
       * アンケート集を指定して削除する
       */
    public function deleteQuestionnaireGroup($condition)
    {
        $record = array(
        'del_flg' => 1,
        );
        $result = $this->db->update('questionnaire_group', $record, $condition);
        return $result;
    }

    /**
       * アンケート集の条件を指定して関連するアンケート削除
       */
    public function deleteQuestionnaire($condition)
    {
        $record = array(
          'del_flg' => 1,
        );
        $result = $this->db->update('questionnaire', $record, $condition);
        
        return $result;
    }
}
