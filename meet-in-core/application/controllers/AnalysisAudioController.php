<?php

class AnalysisAudioController extends AbstractController {


    /**
     * 音声分析一覧.
     * analysis-audio/show-audio-data-list
     *
     * @return void
     */
    public function showAudioDataListAction(){
        // ヘッダーメニューを非表示にしているアカウントが直接URLアクセス時にリダイレクト
		if (!$this->user["admin_header_enable"]) {
            $this->_redirect('/index/menu');
        }
        $form = $this->_getAllParams();

        // モデル宣言
        $analysisAudioModel = Application_CommonUtil::getInstance("model", "AnalysisAudioModel", $this->db);
        $result = $analysisAudioModel->getAnalysisAudioList($form, $this->namespace);

        $this->view->list = $result["list"];
        $this->view->freeWord = $this->namespace->free_word;
    }

    /**
     * 音声分析一覧件数取得　（フロントajaxで呼ぶ用）
     * analysis-audio/show-audio-data-list-count
     *
     * @return void
     */
    public function showAudioDataListCountAction(){
        $form = $this->_getAllParams();

        // モデル宣言
        $analysisAudioModel = Application_CommonUtil::getInstance("model", "AnalysisAudioModel", $this->db);
        $result = $analysisAudioModel->getAnalysisAudioList($form, $this->namespace);

        echo $result["list"]->listcount;
        exit();

    }

    /**
     * 音声分析詳細.
     * analysis-audio/show-audio-data-detail
     *
     * @return void
     */
    public function showAudioDataDetailAction(){

        $form = $this->_getAllParams();

       if(is_null($this->user)){
          $this->_redirect('/index/menu');
        }

        // モデル宣言
        $analysisAudioModel = Application_CommonUtil::getInstance("model", "AnalysisAudioModel", $this->db);

        $result = $analysisAudioModel->getAudioDataDetailData($form, $this->namespace);

        // バリデーション.
        if($result["roomData"]["client_id"] != $this->user["client_id"] && $this->user['staff_type'] != "AA") {
          $this->setLog("音声分析 不正操作", json_encode($form));
          $this->_redirect('/index/menu');
        }

        $this->view->roomData = $result['roomData'];
        $this->view->analysisData = json_encode($result['analysisData']);
        $this->view->aggregates    = $result['aggregates'];
        $this->view->audioFilePath = $result['audioFilePath'];
        $this->view->audioUrl = $result['audioUrl'];
        $this->view->sentimentUsers = json_encode($result['sentimentUsers']);
        $this->view->isDownloadAudioData = $result['isDownloadAudioData'];
    }


    /**
     * 音声分析.
     * analysis-audio/analysis
     *
     * @return void
     */
    public function analysisAction() {

        // ヘッダーメニューを非表示にしているアカウントが直接URLアクセス時にリダイレクト
		if (!$this->user["admin_header_enable"]) {
            $this->_redirect('/index/menu');
        }
        $form = $this->_getAllParams();

       if(is_null($this->user)){
          $this->_redirect('/index/menu');
        }

        // モデル宣言
        $analysisAudioModel = Application_CommonUtil::getInstance("model", "AnalysisAudioModel", $this->db);

        $result = $analysisAudioModel->getAnalysisData($form, $this->namespace);

        $this->view->users = json_encode($result["staffList"]);
        $this->view->weeks = $result["weeks"];
    }


    /**
     * 音声集計のグラフ表示用の結果を取得する .
     * [POST] analysis-audio/create-audio-analysis-graph
     *
     * @return void
     */
    public function createAudioAnalysisGraphAction()
    {

        $form = $this->_getAllParams();

       if(is_null($this->user)){
          $this->_redirect('/index/menu');
        }

        $analysisAudioModel = Application_CommonUtil::getInstance("model", "AnalysisAudioModel", $this->db);
        $result = $analysisAudioModel->getAudioAnalysisGraph($form, $this->namespace);

        echo json_encode($result["apiResData"]);
        exit;
    }

    /**
     * 音声集計の表表示用の結果を取得する.
     * [POST] analysis-audio/get-audio-data-list
     *
     * @return void
     */
    public function getAudioDataListAction()
    {

        $form = $this->_getAllParams();

       if(is_null($this->user)){
          $this->_redirect('/index/menu');
        }

        $analysisAudioModel = Application_CommonUtil::getInstance("model", "AnalysisAudioModel", $this->db);
        $result = $analysisAudioModel->getAudioDataList($form, $this->namespace);

        echo json_encode(['result' => $result['dataList'], 'pagination' => $result['pagination']]);
        exit;
    }


    /**
     * 会議を録音を開始する.
     * [POST] analysis-audio/start-negotiation-conversation
     *
     * @return void
     */
    public function startNegotiationConversationAction() {
        if($this->getRequest()->isPost()) {
            $form = $this->_getAllParams();
            if(is_null($this->user)){
                echo json_encode(['code' => -1, 'message' => "ログインして下さい"]);
                exit;
            }

            // モデル宣言
            $analysisAudioModel = Application_CommonUtil::getInstance("model", "AnalysisAudioModel", $this->db);

            // 操作ログ
            $this->setLog('音声分析 音声録音開始', json_encode($form));

            $result = $analysisAudioModel->createNegotiationConversations($form);
            echo json_encode(['code' => $result, 'message' => null]);
        } else {
            echo json_encode(['code' => -1, 'message' => "Bad Request"]);
        }
        exit;
    }

    /**
     * 会議の参加者の分析結果を登録する.
     * [POST] analysis-audio/set-conversation-aggregate
     *
     * @return void
     */
    public function setConversationAggregateAction() {
        if($this->getRequest()->isPost()) {
            $form = $this->_getAllParams();
            if(is_null($this->user)){
                echo json_encode(['code' => -1, 'message' => "ログインして下さい"]);
                exit;
            }

            // モデル宣言
            $analysisAudioModel = Application_CommonUtil::getInstance("model", "AnalysisAudioModel", $this->db);

            // 操作ログ
            $this->setLog('音声分析 解析結果保存', json_encode($form));

            $result = $analysisAudioModel->createConversationAggregate($form);
            echo json_encode(['code' => $result, 'message' => null]);
        } else {
            echo json_encode(['code' => -1, 'message' => "Bad Request"]);
        }
        exit;
    }

    /**
     * 音声分析削除.
     * analysis-audio/delete-audio-data-list
     *
     * @return void
     */
    public function deleteAudioDataListAction(){
        $form = $this->_getAllParams();

        // モデル宣言
        $analysisAudioModel = Application_CommonUtil::getInstance("model", "AnalysisAudioModel", $this->db);
        $ids = explode(",",$form["ids"]);
        $result = $analysisAudioModel->softDeleteAnalysisAudio($ids);
        exit;
    }

    /**
     * 音源データの存在確認を行う.
     * [POST] analysis-audio/is-exist-audio-data
     *
     * @return void
     */
    public function isExistAudioDataAction() {

        if($this->getRequest()->isPost()) {
            $form = $this->_getAllParams();
            if(is_null($this->user)){
                echo json_encode(['code' => -1, 'message' => "ログインして下さい"]);
                exit;
            }

            // モデル宣言
            $analysisAudioModel = Application_CommonUtil::getInstance("model", "AnalysisAudioModel", $this->db);

            // 音源の確認.
            $tmpAudioFullPath = $_SERVER['DOCUMENT_ROOT']."/tmp_audio/".$form['conversation_id'].".mp3";
            $audioFilePath    = $analysisAudioModel->getAudioFilePath($form['conversation_id']);
            $result = $analysisAudioModel->downloadAudioData($tmpAudioFullPath, $audioFilePath);

            echo json_encode(['code' => $result]);
        } else {
            echo json_encode(['code' => -1, 'message' => "Bad Request"]);
        }
        exit;
    }

}