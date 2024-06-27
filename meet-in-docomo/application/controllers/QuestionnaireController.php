<?php


class QuestionnaireController extends AbstractController
{
    // public function init()
    // {
    //     parent::init();
    // }
    
    // /**
    //    * アンケート結果の一覧情報を取得する
    //    *
    //    *
    //    */
    // public function listAction()
    // {
    //     $form = $this->_getAllParams();
    //     $webinar_id = $form['id'];
    //     // ログインチェック
    //     $auth = Zend_Auth::getInstance();
    //     if ($auth->hasIdentity() == true) {
    //         // 認証情報取出し
    //         $user = $auth->getIdentity();
    //         $staff_id = $user['staff_id'];
    //     }
    //     // モデル宣言
    //     $QuestionnaireModel = Application_CommonUtil::getInstance("model", "QuestionnaireModel", $this->db);
            
    //     // $lists = $QuestionnaireModel->getQuestionList($staff_id, $webinar_id);
    //     // $this->view->list = $lists;
    //     // $this->view->list_name = $lists[0]['name'];
    // }

    // /**
    //  * アンケート結果の詳細情報を取得する
    //  *
    //  *
    //  */
    // public function getAnswerAction()
    // {
    //     $listDetail = [];
    //     //ビューを使わない
    //     $this->_helper->viewRenderer->setNoRender();

    //     $req = $this->getRequest();
    //     $history_id = $req->getParam("history_id");
    //     $question = $req->getParam("question");
    //     $answer_type = $req->getParam("answer_type");
    //     $answer_percentage = $req->getParam("answer_percentage");
    //     $participant = $req->getParam("participant");
    //     $questionnaire_id = $req->getParam("questionnaire_id");
        
    //     // モデル宣言
    //     $QuestionnaireModel = Application_CommonUtil::getInstance("model", "QuestionnaireModel", $this->db);
    //     if ($answer_type === '1') {
    //         // 複数選択式アンケート結果の詳細情報を取得
    //         $listDetail['detail'] = $QuestionnaireModel->getAnySelectQuestionDetail($history_id, $questionnaire_id);
    //         $counts = array();
    //     } elseif ($answer_type ==='2') {
    //         // 二択式アンケート結果の詳細情報を取得
    //         $listDetail['detail'] = $QuestionnaireModel->getTwoChoiceQuestionDetail($history_id);
    //     } elseif ($answer_type ==='3') {
    //         // 記述式アンケート結果の詳細情報を取得
    //         $listDetail['detail'] = $QuestionnaireModel->getTextQuestionDetail($history_id);
    //     }
    //     $listDetail['question'] = $question;
    //     $listDetail['answer_percentage'] = $answer_percentage;
    //     $listDetail['participant'] = $participant;
    //     $listDetail['answer_type'] = $answer_type;
    //     echo json_encode($listDetail) ;
    //     exit;
    // }

    // /**
    //  * アンケート集を新規登録する処理
    //  */
    // public function newQuestionnaireAction()
    // {
    //     $request = $this->getRequest();
    //     // POSTでなければ初期表示
    //     if (!$request->isPost()) {
    //         // 操作ログ
    //         $this->setLog("アンケート新規登録画面表示", json_encode($quiestionnaires));
    //         // 初期値設定
    //         $this->view->data = array(array(
    //             'title' => '',
    //             'answer_type'=> '1',
    //             'choices'=> ',,'
    //         ));
    //         return;
    //     }
    //     //formからデータを取得
    //     $quiestionnaires = $this->_getAllParams();
        
    //     // 操作ログ
    //     $this->setLog("アンケート新規登録処理", json_encode($quiestionnaires));
    //     //時間を取得
    //     $date = date('Y-m-d H:i:s');
    //     //ユーザーの認証情報を取得
    //     $auth = Zend_Auth::getInstance();
    //     $user = $auth->getIdentity();
    //     $user_client = $user['client_id'];
    //     // 戻り値の宣言
    //     $result = array();
    //     $result["errorList"] = array();
                
    //     // モデル宣言
    //     $questionnaireModel = Application_CommonUtil::getInstance("model", "QuestionnaireModel", $this->db);
                                
    //     // エラーチェック
    //     $errorList = $questionnaireModel->questionnaireFormValidation($quiestionnaires);
                
    //     if (count($errorList) > 0) {
    //         // エラーがあれば編集画面のまま
    //         $this->view->errorList = $errorList;

    //         // View用に整形する
    //         $group_name = $quiestionnaires['quiestionnaire_group_name'];
    //         foreach ($quiestionnaires as $k => $v) {
    //             $qNo = mb_substr($k, -1);
    //             if (is_numeric($qNo)) {
    //                 switch (true) {
    //                     case strpos($k, 'quiestionnaire_name') !==false:
    //                         $backData[$qNo]['title'] = $v;
    //                         break;
    //                     case strpos($k, 'quiestionnaire_input_type') !==false:
    //                         $backData[$qNo]['answer_type'] = $v;
    //                         break;
    //                     case strpos($k, 'quiestionnaire_content') !==false:
    //                         $backData[$qNo]['question'] = $v;
    //                         break;
    //                     case strpos($k, 'quiestionnaire_answer') !==false:
    //                         var_dump($v);
    //                         $backData[$qNo]['choices'] = implode(',', $v);
    //                         break;
    //                     case strpos($k, 'quiestionnaire_form_select') !==false:
    //                         $backData[$qNo]['description_type'] = $v;
    //                         break;
    //                 }
    //             }
    //         }
            
    //         $this->view->group_name = $group_name;
    //         $this->view->data = $backData;
    //         return;
    //     }
        
                
    //     $this->db->beginTransaction();
    //     try {
    //         // quiestionnaire_groupテーブルに対する処理
    //         // 行を挿入するテーブル名
    //         $questionnaire_group = 'questionnaire_group';
    //         // 追加するデータ
    //         $group_data = array(
    //             'client_id' => $user_client,
    //             'staff_type' => $user['staff_type'],
    //             'staff_id' => $user['staff_id'],
    //             'title' => $quiestionnaires["quiestionnaire_group_name"],
    //             'del_flg' => 0,
    //             'create_date' => $date,
    //             'update_date' => $date
    //         );
    //         // DBに行を挿入
    //         $this->db->insert($questionnaire_group, $group_data);
    //         $group_last_id = $this->db->lastInsertId($questionnaire_group, 'id');

    //         $questionnaireModel->addQuestionnaire($group_last_id, $quiestionnaires);
    //         $this->db->commit();
    //         // エラーがなければ一覧に戻る
    //         $this->_redirect('/questionnaire/quiestionnaire-list');
    //     } catch (Exception $e) {
    //         $this->db->rollBack();
    //         throw new Exception(sprintf('database error. (%s)', $e->getMessage()));
    //     }
    // }
    
    // /**
    //  * アンケート集一覧を表示する処理
    //  */
    // public function quiestionnaireListAction()
    // {
    //     $form = $this->_getAllParams();
    //     // 操作ログ
    //     $this->setLog("アンケート集一覧表示", json_encode($form));

    //     // モデル宣言
    //     $QuestionnaireModel = Application_CommonUtil::getInstance("model", "QuestionnaireModel", $this->db);
    //     // 画面表示に必要なデータを取得
    //     $result = $QuestionnaireModel->getQuestionAllList($form, $this->namespace);

    //     // smartyにデータを設定する
    //     $this->view->list = $result["listObject"];
    //     $this->view->listCount = $result['itemCount'];
    //     $this->view->freeWord = $this->namespace->free_word;
    //     $this->view->viewType = $this->namespace->viewType;
    // }
    // /**
    //  * アンケート集詳細を表示する処理
    //  */
    // public function questionnaireDetailAction()
    // {
    //     $req = $this->getRequest();
    //     $questionnaire_group_id = $req->getParam("id");
    //     // モデル宣言
    //     $questionnaireModel = Application_CommonUtil::getInstance("model", "QuestionnaireModel", $this->db);
    //     $result = $questionnaireModel->getQuestionnaireDetail($questionnaire_group_id);

    //     $this->view->data = $result;
    //     $this->view->questionnaire_group_id = $questionnaire_group_id;
    // }

    // /**
    //  * アンケート集を編集する
    //  */
    // public function editQuestionnaireAction()
    // {
    //     $form = $this->_getAllParams();
    //     $request = $this->getRequest();
    //     $result = array();
    //     $questionnaireModel = Application_CommonUtil::getInstance("model", "QuestionnaireModel", $this->db);
    //     $result = $questionnaireModel->editQuestionnaire($form, $request);
    //     if ($result["status"]) {
    //         // エラーがなければ一覧に戻る
    //         $this->_redirect('/questionnaire/quiestionnaire-list');
    //     } else {
    //         $this->view->errorList = $result["error_m"];
    //         $this->view->data = $form;
    //         return;
    //     }
    // }

    // /**
    //  * アンケート集を削除する
    //  */
    // public function deleteQuestionnaireAction()
    // {
    //     $form = $this->_getAllParams();
    //     $request = $this->getRequest();
    //     $result = array();
    //     $questionnaireModel = Application_CommonUtil::getInstance("model", "QuestionnaireModel", $this->db);
    //     $result = $questionnaireModel->deleteQuestionnaire($form, $request);
    //     echo json_encode($result);
    //     exit;
    // }
}
