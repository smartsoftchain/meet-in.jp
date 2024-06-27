<?php

class GetAudioController extends AbstractController {

    public function init(){
		parent::init();
		/* Initialize action controller here */
    }
    
    /**
     * 録音した音声をデータ化
     */
    public function getAudioDataAction(){
         //ajaxで音声データを取得
        $audioData = file_get_contents('php://input');
        //ランダムな文字列からファイル名を生成
        $fileName = substr(str_shuffle('1234567890abcdefghijklmnopqrstuvwxyz'), 0, 8);
        var_dump($fileName);
        //音声ファイルの保存先を指定
        $filePath = "./wav/$fileName.wav";
        //ファイルを指定した場所に生成する
        file_put_contents($filePath, $audioData);
        
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL         => 'https://ik1-406-35452.vs.sakura.ne.jp/',
            CURLOPT_POST        => true,
            CURLOPT_SAFE_UPLOAD => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POSTFIELDS  => [
                'data' => new CURLFile("./wav/$fileName.wav"),
            ],
        ]);
        $response = curl_exec($ch);
        $result = json_decode($response, true);
        $_SESSION[‘fileName’] = $result['name'];
    
        exit;
    }

    /**
     * 文字起こし処理
     */
    public function speechToTextAction(){
        // 行を挿入するテーブル名
        $table = 'negotiation_audio_text';
        $date = date('Y-m-d H:i:s');

        //ルーム名をurlから取得
        $url = $_SERVER['HTTP_REFERER'];
        $keys = parse_url($url); 
        $path = explode("/", $keys['path']); 
        $room_name = end($path); 

        //ユーザーの認証情報を取得
        $auth = Zend_Auth::getInstance();
        $user = $auth->getIdentity();
        $user_client = $user['client_id'];

        // 追加するデータ
        $params = array (
            'text' => "",
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

        // DBに行を挿入
        $this->db->beginTransaction();
        $this->db->insert($table, $params);
        $last_id = $this->db->lastInsertId('negotiation_audio_text','id');
        $this->db->commit();

        $fileName =  $_SESSION[‘fileName’];
        var_dump($fileName);
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL         => 'https://ik1-406-35452.vs.sakura.ne.jp/api/speechToText/'. $fileName . '/' . $last_id,
            CURLOPT_SAFE_UPLOAD => true,
            CURLOPT_RETURNTRANSFER => true,
        ]);
        $response = curl_exec($ch);

        exit;
    }

    /**
     * 文字起こし後のテキストをレコードに追加
     */
    public function recordUpdateAction(){
        $json =  json_decode(file_get_contents('php://input'), true); 
        var_dump($json);
        $text = $json['text'];
        $id = $json['id'];

        $getAudioModel = Application_CommonUtil::getInstance("model", "GetAudioModel", $this->db);
        $resultJson = $getAudioModel->recordUpdate($text,$id);

        exit;
    }

    /**
     * リアルタイム文字起こし後の利用時間を取得する(残時間はクライアントのスタッフが並行して会議中の可能性もあるので 逐次取得して確認が必要).
     */
    public function audioTextInfoAction(){

        if(is_null($this->user)){
            echo json_encode(['code' => -1]);
            exit;
        }
        //ユーザーの認証情報を取得
        $clientModel = Application_CommonUtil::getInstance("model", "ClientModel", $this->db);
        $user = $this->user;
        $negotiationAudioTextLimitInfo = $clientModel->getNegotiationAudioTextLimitInformation($user['client_id'], $user['staff_type']);
        //$negotiationAudioTextLimitInfo = ['lock' => true, 'time_limit_second' => 0 ];
        echo json_encode($negotiationAudioTextLimitInfo);
        exit;
    }

    /**
     * リアルタイム文字起こし後の利用時間を更新する.
     */
    public function audioTextStopAction(){

        if(is_null($this->user)){
            echo json_encode(['code' => -1]);
            exit;
        }
        $form = $this->_getAllParams();
        $this->setLog('文字起こしの時間', json_encode($form));
        $adminClientModel = Application_CommonUtil::getInstance("model", "AdminClientModel", $this->db);
        $user = $this->user;
        $adminClientModel->updatenegotiationAudioTextTimeLimitSecond($user['client_id'], $form);
        $this->audioTextInfoAction();
        exit;
    }

    /**
     * リアルタイム文字起こし後のテキストをレコードに保存
     */
    public function audioTextSaveAction(){

        if(is_null($this->user)){
            echo json_encode(['code' => -1]);
            exit;
        }
        $form = $this->_getAllParams();
        $form['text_type'] = "";

        // 操作ログ
        $this->setLog('リアルタイム文字起こし後のテキストをレコードに保存', json_encode($form));

        $adminClientModel = Application_CommonUtil::getInstance("model", "AdminClientModel", $this->db);
        $user = $this->user;
        $adminClientModel->updatenegotiationAudioTextTimeLimitSecond($user['client_id'], $form);

        $getAudioModel = Application_CommonUtil::getInstance("model", "GetAudioModel", $this->db);
        $getAudioModel->recordInsert($user, $form);
        exit;
    }

    /**
     * 音声分析後の利用時間を取得する(残時間はクライアントのスタッフが並行して会議中の可能性もあるので 逐次取得して確認が必要).
     */
    public function audioAnalysisInfoAction(){

        if(is_null($this->user)){
            echo json_encode(['code' => -1]);
            exit;
        }
        //ユーザーの認証情報を取得
        $clientModel = Application_CommonUtil::getInstance("model", "ClientModel", $this->db);
        $user = $this->user;
        $negotiationAudioAnalysisLimitInfo = $clientModel->getNegotiationAudioAnalysisLimitInformation($user['client_id'], $user['staff_type']);
        echo json_encode($negotiationAudioAnalysisLimitInfo);
        exit;
    }

    /**
     * 音声分析使用後の利用時間を更新する.
     */
    public function audioAnalysisStopAction(){

        if(is_null($this->user)){
            echo json_encode(['code' => -1]);
            exit;
        }
        $form = $this->_getAllParams();
        $this->setLog('音声分析の時間', json_encode($form));
        $adminClientModel = Application_CommonUtil::getInstance("model", "AdminClientModel", $this->db);
        $user = $this->user;
        $adminClientModel->updatenegotiationAudioAnalysisTimeLimitSecond($user['client_id'], $form);
        $this->audioAnalysisInfoAction();
        exit;
    }


    /**
     * ウェビナー用：リアルタイム文字起こし後の利用時間を取得する
     * (残時間はクライアントのスタッフが並行して会議中の可能性もあるので 逐次取得して確認が必要).
     */
    public function webinarAudioTextInfoAction(){

        $form = $this->_getAllParams();

        // モデル宣言
        $webinarModel = Application_CommonUtil::getInstance("model", "WebinarModel", $this->db);
        $webinarRow = $webinarModel->getWebinarRowByAdminKey($form['token']);
        if($webinarRow==false){
            echo json_encode(['code' => -1]);
            exit;
        }

        //ユーザーの認証情報を取得
        $clientModel = Application_CommonUtil::getInstance("model", "ClientModel", $this->db);
        $negotiationAudioTextLimitInfo = $clientModel->getNegotiationAudioTextLimitInformation($webinarRow['client_id'], $webinarRow['staff_type']);
        //$negotiationAudioTextLimitInfo = ['lock' => true, 'time_limit_second' => 0 ];
        echo json_encode($negotiationAudioTextLimitInfo);
        exit;
    }


    /**
     * ウェビナー用：リアルタイム文字起こし後の利用時間を更新する.
     */
    public function webinarAudioTextStopAction(){

        $form = $this->_getAllParams();

        // モデル宣言
        $webinarModel = Application_CommonUtil::getInstance("model", "WebinarModel", $this->db);
        $webinarRow = $webinarModel->getWebinarRowByAdminKey($form['token']);
        if($webinarRow==false){
            echo json_encode(['code' => -1]);
            exit;
        }
        $adminClientModel = Application_CommonUtil::getInstance("model", "AdminClientModel", $this->db);
        $adminClientModel->updatenegotiationAudioTextTimeLimitSecond($webinarRow['client_id'], $form);
        $this->webinarAudioTextInfoAction();
        exit;
    }

    /**
     * ウェビナー用：リアルタイム文字起こし後のテキストをレコードに保存
     */
    public function webinarAudioTextSaveAction(){

        $form = $this->_getAllParams();

        // モデル宣言
        $webinarModel = Application_CommonUtil::getInstance("model", "WebinarModel", $this->db);
        $webinarRow = $webinarModel->getWebinarRowByAdminKey($form['token']);
        if($webinarRow==false){
            echo json_encode(['code' => -1]);
            exit;
        }

        // 操作ログ
        $this->setLog('リアルタイム文字起こし後のテキストをレコードに保存', json_encode($form));

        $adminClientModel = Application_CommonUtil::getInstance("model", "AdminClientModel", $this->db);
        $adminClientModel->updatenegotiationAudioTextTimeLimitSecond($webinarRow['client_id'], $form);

        // 追加するデータ
        $user = [
            'staff_id'   => $webinarRow['staff_id'],
            'staff_type' => $webinarRow['staff_type'],
            'client_id'  => $webinarRow['client_id'],
        ];
        $form['room_name'] = $webinarRow['name'];
        $form['text_type'] = "2";

        $getAudioModel = Application_CommonUtil::getInstance("model", "GetAudioModel", $this->db);
        $getAudioModel->recordInsert($user, $form);
        exit;
    }


}