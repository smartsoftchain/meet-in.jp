<?php

/**
 * クライアントコントローラーで使用するモデル
 * @author admin
 *
 */
class AnalysisAudioModel extends AbstractModel{

	private $db;                            // DBコネクション
	function __construct($db){
		parent::init();
		$this->db = $db;
	}
	// 感情論理名
	const SENTIMENT_LOGICAL_NAME = array(
		"エネルギー", 
		"ストレス", 
		"論理/感情バランス", 
		"集中", 
		"期待", 
		"興奮", 
		"躊躇", 
		"不確実", 
		"思考", 
		"想像力", 
		"困惑", 
		"情熱", 
		"脳活動", 
		"自信", 
		"攻撃性、憤り", 
		"コールプライオリティ", 
		"雰囲気、会話傾向", 
		"動揺", 
		"喜び", 
		"不満", 
		"極端な起伏", 
	);
	// 感情物理名（nosqlでの物理名）
	const SENTIMENT_PHYSICAL_NAME = array(
		"energy", 
		"stress", 
		"emo_cog", 
		"concentration", 
		"anticipation", 
		"excitement", 
		"hesitation", 
		"uncertainty", 
		"intensive_thinking", 
		"imagination_activity", 
		"embarrassment", 
		"passionate", 
		"brain_power", 
		"confidence", 
		"aggression", 
		"call_priority", 
		"atmosphere", 
		"upset", 
		"content", 
		"dissatisfaction", 
		"extreme_emotion"
	);


	public function init() {
		// __constructでparent::init()を実行しなければ親の初期化が実行されない
		//parent::init();
	}

	/*
	 * 音源パスを取得する.
	 *
	 */
	public function getAudioFilePath($id) {

		// MEMO. パスに %sを仕込んでいるので置換している.
		return sprintf($this->config->skyway->recorder->gcs->filePath."/%s.mp3", $id);
	}


	/*
	 * １句ごとのデータを持つNosqlデータを管理するサーバのエンドポイントパスを取得する.
	 *
	 */
	public function getSentimentDBEndPoint() {

		return $this->config->sentiment_db->endPoint;
	}


	/**
	 * 音声分析情報 マスター情報の登録.
	 * @param unknown $form
	 */
	public function createNegotiationConversations($form){
		$negotiationConversationDao = Application_CommonUtil::getInstance("dao", "NegotiationConversationDao", $this->db);
		return $negotiationConversationDao->insert($form);
	}


	/**
	 * 音声分析情報 分析結果の登録.
	 * @param unknown $form
	 */
	public function createConversationAggregate($form){
		// 戻り値を生成
		$result = array("status"=>0, "message"=>"");

		// DAOの宣言
		$conversationAggregateDao = Application_CommonUtil::getInstance("dao", "ConversationAggregateDao", $this->db);

		// 感情データとユーザー情報とSpeakerNoの紐付けデータをローカル変数へ保存
		$conversationDict = json_decode($form["conversationJson"], true);
		$userAndSpeakerNoRelations = $form["userAndSpeakerNoRelations"];

		// 年月日と時間データを作成する
		$explodeTelTime = explode(" ", date("Y-m-d H:i:s"));
		$ymd = $explodeTelTime[0];
		$hms = $explodeTelTime[1];
		// 曜日を取得
		$dayOfTheWeek = date('w', strtotime(preg_replace('/[^0-9]/', '', $ymd)));

		// 感情データのカラム
		$sentimentColumns = array(
			"energy_avg",
			"stress_avg",
			"emo_cog_avg",
			"concentration_avg",
			"anticipation_avg",
			"excitement_avg",
			"hesitation_avg",
			"uncertainty_avg",
			"intensive_thinking_avg",
			"imagination_activity_avg",
			"embarrassment_avg",
			"passionate_avg",
			"brain_power_avg",
			"confidence_avg",
			"aggression_avg",
			"call_priority_avg",
			"atmosphere_avg",
			"upset_avg",
			"content_avg",
			"dissatisfaction_avg",
			"extreame_emotion_avg"
		);

		// 共通の登録データ設定
		$commonConversation = array(
			"conversation_id" => $conversationDict["conversationId"],
			"staff_type" => "",
			"staff_id" => 0,
			"conversation_date" => $ymd,
			"client_id" => 0
		);
		// 感情カラムを追加し初期化する
		foreach($sentimentColumns as $sentiment){
			$commonConversation[$sentiment] = 0;
		}
		// 感情解析登録用データ保持変数を人数分登録する
		for ($i=0; $i < count($userAndSpeakerNoRelations); $i++) {
			// ユーザー固有データ登録のために、一旦tmpへ設定
			$tmp = $commonConversation;
			// ユーザー固有データを設定
			$tmp["speaker_label"] = $i;
			$tmp["staff_type"] = $userAndSpeakerNoRelations[$i]["staff_type"];
			$tmp["staff_id"] = $userAndSpeakerNoRelations[$i]["staff_id"];
			$tmp["client_id"] = $userAndSpeakerNoRelations[$i]["client_id"];
			// データを設定する
			$registData[] = $tmp;
		}

		// データ登録用に音声解析結果を変換する
		foreach($conversationDict["conversationEvaluation"]["results"] as $evaluation){
			// 音声対象
			$speakerLabel = $evaluation["speakerLabel"];
			// 会話の間の数を保存
			$registData[$speakerLabel]["pause_count"] = count($evaluation["pause"]);
			// 会話の被りの数を保存
			$registData[$speakerLabel]["bargein_count"] = count($evaluation["bargein"]);
			// 声の音量の平均を保存
			$registData[$speakerLabel]["volume_avg"] = $evaluation["volume"];
			// 平均話速の平均を保存
			$registData[$speakerLabel]["speech_rate_avg"] = floor($evaluation["speed"]);
		}
		foreach($conversationDict["sentimentAnalysis"] as $sentimentAnalysis){
			// 音声対象
			$speakerLabel = $sentimentAnalysis["speakerLabel"];
			// 感情解析結果が存在しない場合があるので判定する
			if(array_key_exists("results", $sentimentAnalysis)){
				foreach($sentimentAnalysis["results"] as $sentiment){
					// 平均を取得するために全てのデータを加算する
					$registData[$speakerLabel]["energy_avg"] += $sentiment["Energy"];
					$registData[$speakerLabel]["stress_avg"] += $sentiment["Stress"];
					$registData[$speakerLabel]["emo_cog_avg"] += $sentiment["EMO/COG"];
					$registData[$speakerLabel]["concentration_avg"] += $sentiment["Concentration"];
					$registData[$speakerLabel]["anticipation_avg"] += $sentiment["Anticipation"];
					$registData[$speakerLabel]["excitement_avg"] += $sentiment["Excitement"];
					$registData[$speakerLabel]["hesitation_avg"] += $sentiment["Hesitation"];
					$registData[$speakerLabel]["uncertainty_avg"] += $sentiment["Uncertainty"];
					$registData[$speakerLabel]["intensive_thinking_avg"] += $sentiment["IntensiveThinking"];
					$registData[$speakerLabel]["imagination_activity_avg"] += $sentiment["ImaginationActivity"];
					$registData[$speakerLabel]["embarrassment_avg"] += $sentiment["Embarrassment"];
					$registData[$speakerLabel]["passionate_avg"] += $sentiment["Passionate"];
					$registData[$speakerLabel]["brain_power_avg"] += $sentiment["BrainPower"];
					$registData[$speakerLabel]["confidence_avg"] += $sentiment["Confidence"];
					$registData[$speakerLabel]["aggression_avg"] += $sentiment["Aggression"];
					$registData[$speakerLabel]["call_priority_avg"] += $sentiment["CallPriority"];
					$registData[$speakerLabel]["atmosphere_avg"] += $sentiment["Atmosphere"];
					$registData[$speakerLabel]["upset_avg"] += $sentiment["Upset"];
					$registData[$speakerLabel]["content_avg"] += $sentiment["Content"];
					$registData[$speakerLabel]["dissatisfaction_avg"] += $sentiment["Dissatisfaction"];
					$registData[$speakerLabel]["extreame_emotion_avg"] += $sentiment["ExtremeEmotion"];
				}
				// 割る値が値が0以上の場合のみ平均を算出する(感情カラムを元にループする)
				if($sentimentAnalysis["results"] > 0){
					foreach($sentimentColumns as $sentiment){
						$registData[$speakerLabel][$sentiment] = floor($registData[$speakerLabel][$sentiment] / count($sentimentAnalysis["results"]));
					}
				}
				// 会話回数を設定する
				$registData[$speakerLabel]["conversation_count"] = count($sentimentAnalysis["results"]);
			}else{
				// 会話回数を設定する（感情解析データが存在しない場合なので、0で初期化する）
				$registData[$speakerLabel]["conversation_count"] = 0;
			}
		}
		// ラリーカウントの設定(会話回数の小さい方の値をラリーカウントとする)
		$conversationCounts = array();
		foreach($registData as $row){
			$conversationCounts[] = $row["conversation_count"];
		}
		// 小さい順に並び替える
		asort($conversationCounts);
		// 一番会話数の少ない値を取得する
		$minConversationCount = array_shift($conversationCounts);
		// ラリーカウントを設定する
		for ($i=0; $i < count($registData); $i++) {
			// &（アドレス参照）で設定した際に、想定外の動きだったのでforで冗長に記述
			$tmp = $registData[$i];
			$tmp["rally_count"] = $minConversationCount;
			$registData[$i] = $tmp;
		}
		// 会話比率の設定（最初に会話数を足し、全体の会話数を計算する）
		$totalConversationCount = 0;
		foreach($registData as $row){
			$totalConversationCount += $row["conversation_count"];
		}
		for ($i=0; $i < count($registData); $i++) {
			// &（アドレス参照）で設定した際に、想定外の動きだったのでforで冗長に記述
			$tmp = $registData[$i];
			if($totalConversationCount == 0){
				// 全体の会話数が0の場合は、0で初期化する
				$tmp["conversation_ratio"] = 0;
			}else{
				// 比率を計算する(会話回数 / 全体会話の回数 * 100)
				$tmp["conversation_ratio"] = floor($registData[$i]["conversation_count"] / $totalConversationCount * 100); 
			}
			$registData[$i] = $tmp;
		}
		// トランザクションスタート
		$this->db->beginTransaction();
		try {
			foreach($registData as $row) {
				// 必須値が不足しているデータは処理しない.
				$validation   = [];
				$validation[] = isset($row['conversation_id']);
				if(!in_array(false, $validation)) {
					$conversationAggregateDao->insert($row);
				}
			}
			// 登録完了したらコミットする
			$this->db->commit();
			// ステータスを変更する
			$result["status"] = 1;
		} catch (Exception $e) {
			$this->db->rollBack();
			//$result["message"] = "登録に失敗しました";
			$result["message"] =  $e->getMessage();
			$result["registData"] = $registData;
		}
		// 戻り値を返す
		return $result;
	}


	/**
	 * 音源の数だけリストを作成する.
	 * @param unknown $form
	 * @param unknown $screenSession
	 */
	function getAnalysisAudioList($form, &$screenSession) {


		// DAOの宣言
		$negotiationConversationDao = Application_CommonUtil::getInstance("dao", "NegotiationConversationDao", $this->db);


		// セッションの初期化
		if($screenSession->isnew == true){
			$screenSession->order = 'conversation_date';
			$screenSession->page = 1;
			$screenSession->pagesize = 100;
			$screenSession->ordertype = 'DESC';  // 任意
		}
		// パラメータをセッションに格納
		foreach($form as $key=>$val){
			$screenSession->$key = $val;
		}

		//条件の設定
		$condition = "client_id = '{$this->user["client_id"]}' AND del_flg = '0'";
		// 検索ボタンが押下された場合、ページを初期化する
		if(array_key_exists("free_word", $form)){
			$screenSession->page = 1;
		}
		// 検索条件が存在する場合検索条件を作成する
		if(!is_null($screenSession->free_word)){
			$escapeText = $this->escape($screenSession->free_word);
			$condition = "room_name like '%%{$escapeText}%%' AND ".$condition;
		}


		//ページネーション用呼び出し
		$dataCount = $negotiationConversationDao->count($condition);
		$dataList = $negotiationConversationDao->find($condition, $screenSession->order, $screenSession->ordertype , $screenSession->page, $screenSession->pagesize);


		// ページャ設定
		$list = new Application_Pager(array(
			"itemData" => $dataList,        // リスト
			"itemCount" => $dataCount,      // カウント
			"perPage" => $screenSession->pagesize,    // ページごと表示件数
			"curPage" => $screenSession->page,      // 表示するページ
			"order" => $screenSession->order,      // ソートカラム名
			"orderType" => $screenSession->ordertype,  // asc or desc
		));


		return [
			"list" => $list,
		];
	}

	/**
	 * 集計ページ　構成データの取得.
	 * @param unknown $form
	 * @param unknown $screenSession
	 */
	function getAnalysisData($form, &$screenSession) {

		$masterStaffDao = Application_CommonUtil::getInstance('dao', "MasterStaffDao", $this->db);
		$negotiationConversationDao = Application_CommonUtil::getInstance("dao", "NegotiationConversationDao", $this->db);

		$staffList = $masterStaffDao->getMasterStaffAllList("client_id = {$this->user["client_id"]}", "staff_id", "DESC");
		$weeks = $negotiationConversationDao->getDayOfTheWeekDict();

		return compact("weeks", "staffList");
	}



	/**
	 * 集計結果をグラフ表示用のデータを抽出する.
	 * @param unknown $form
	 * @param unknown $screenSession
	 */
	function getAudioAnalysisGraph($form, &$screenSession) {

		// DAOの宣言
		$masterStaffDao = Application_CommonUtil::getInstance('dao', "MasterStaffDao", $this->db);
		$negotiationConversationDao = Application_CommonUtil::getInstance("dao", "NegotiationConversationDao", $this->db);
		$conversationAggregateDao   = Application_CommonUtil::getInstance("dao", "ConversationAggregateDao", $this->db);

		// パラメータの回収.
		$analysis_day_start = null;
		$analysis_day_end   = null;
		$day_of_the_week    = [];
		$select_charts      = [];
		$staff_keys = [];
		$time = null;
		$per_page = 10;
		foreach (["analysis-day-start", 'analysis-day-end', 'day-of-the-week', 'users', 'time', 'per_page'] as $key) {

			if (!array_key_exists($key, $form)) {
				continue;
			}

			$value = $form[$key];
			switch ($key) {
				case 'analysis-day-start':
					$analysis_day_start = $value;
					break;
				case 'analysis-day-end':
					$analysis_day_end   = $value;
					break;
				case 'day-of-the-week':
					$day_of_the_week    = $value;
					break;
				case 'users':
					// MEMO. 例）$value = "staff_id:86, staff_type:CE" から、86CE(ユニークキー)を作っている.
					foreach ($value as $v) {
						$pk = [];
						foreach (explode(",", $v) as $d) {
							$pk[] = explode(":", $d)[1];
						}
						$staff_keys[] = "'".implode("", $pk)."'";
					}
					break;
				case 'time':
					$time = $value;
					break;
				case 'per_page':
					$per_page = $value;
					break;
				default:
					break;
			}
		}

		//マスターテーブルの絞り込み条件.
		$master_condition = "client_id = '{$this->user["client_id"]}'";
		if(0 < count($day_of_the_week)) {
			$master_condition = $master_condition." AND day_of_the_week in (".implode(",", $day_of_the_week).")";
		}

		// サブテーブルの絞り込み条件.
		$sub_condition = null; // マスターテーブルの条件の後に続くので ANDで初めて良い.
		if($analysis_day_start) {
			$sub_condition = $sub_condition." AND '".$analysis_day_start."' <= a.conversation_date";
		}
		if($analysis_day_end){
			$sub_condition = $sub_condition." AND '".$analysis_day_end."' >= a.conversation_date";
		}

		// 抽出後の絞り込み条件.
		$having_condition = "";
		if(0 < count($staff_keys)) {
			$having_condition = "staff_key in (".implode(",", $staff_keys).")";
		}


		// 集計ボタンを押した グラフを生成するデータを抽出集計.
		$apiResData = [];
		$dataList = $conversationAggregateDao->aggregateGraf($master_condition, $sub_condition, $time, $having_condition);

		foreach ($dataList as $data) {
			$key = $data["staff_id"].$data["staff_type"];
			$apiResData[$key]["name"]    = $data['staff_name'];
			$apiResData[$key]["param"][] = $data;
		}
		if(0 == count($apiResData)) {
			$apiResData[] = [
				"name"  => "",
				"param" => []
			];
		} else {
			$_apiResData = $apiResData;
			$apiResData = [];
			foreach ($_apiResData as $value) {
				$apiResData[] = $value;
			}
		}
		return compact("apiResData");
	}

	/**
	 * 集計結果を表 表示用のデータを抽出する.
	 * @param unknown $form
	 * @param unknown $screenSession
	 */
	function getAudioDataList($form, &$screenSession) {

		if($screenSession->isnew == true) {
			$screenSession->order = 'staff_id';
			$screenSession->page  = 1;
			$screenSession->pagesize = 100;
			$screenSession->ordertype = 'DESC';
		}

		// DAOの宣言
		$masterStaffDao = Application_CommonUtil::getInstance('dao', "MasterStaffDao", $this->db);
		$negotiationConversationDao = Application_CommonUtil::getInstance("dao", "NegotiationConversationDao", $this->db);
		$conversationAggregateDao   = Application_CommonUtil::getInstance("dao", "ConversationAggregateDao", $this->db);

		// パラメータの回収.
		$analysis_day_start = null;
		$analysis_day_end   = null;
		$day_of_the_week    = [];
		$select_charts      = [];
		$staff_keys = [];
		$time = null;
		$per_page = 10;
		foreach (["analysis-day-start", 'analysis-day-end', 'day-of-the-week', 'users', 'time', 'per_page'] as $key) {
			if (!array_key_exists($key, $form)) {
				continue;
			}
			$value = $form[$key];
			switch ($key) {
				case 'analysis-day-start':
					$analysis_day_start = $value;
					break;
				case 'analysis-day-end':
					$analysis_day_end   = $value;
					break;
				case 'day-of-the-week':
					$day_of_the_week    = $value;
					break;
				case 'users':
					// MEMO.
					// $value = "staff_id:86, staff_type:CE".
					foreach ($value as $v) {
						$pk = [];
						foreach (explode(",", $v) as $d) {
							$pk[] = explode(":", $d)[1]; // 値を回収.
						}
						$staff_keys[] = "'".implode("", $pk)."'";
					}
					break;
				case 'time':
					$time = $value;
					break;
				case 'per_page':
					$per_page = $value;
					break;
				default:
					break;
			}
		}

		//マスターテーブルの絞り込み条件.
		$master_condition = "client_id = '{$this->user["client_id"]}'";
		if(0 < count($day_of_the_week)) {
			$master_condition = $master_condition." AND day_of_the_week in (".implode(",", $day_of_the_week).")";
		}

		// サブテーブルの絞り込み条件.
		$sub_condition = null; // マスターテーブルの条件の後に続くので ANDで初めて良い.
		if($analysis_day_start) {
			$sub_condition = $sub_condition." AND '".$analysis_day_start."' <= a.conversation_date";
		}
		if($analysis_day_end){
			$sub_condition = $sub_condition." AND '".$analysis_day_end."' >= a.conversation_date";
		}

		// 抽出後の絞り込み条件.
		$having_condition = "";
		if(0 < count($staff_keys)) {
			$having_condition = "staff_key in (".implode(",", $staff_keys).")";
		}


		// 集計ボタンを押した 表を生成するデータを抽出集計.
		$apiResData = [];
		$dataList = $conversationAggregateDao->aggregateList($master_condition, $sub_condition, $having_condition, 'a.conversation_date', 'DESC');
        $pagination = [
            'total_pages' => ceil(count($dataList["items"]) / $per_page),
            'per_page'    => $per_page
        ];

		return compact("dataList", "pagination");
	}


	/**
	 * 音声解析ファイルの論理削除
	 * @param unknown $form
	 * @param unknown $screenSessionupdate
	 */
	public function softDeleteAnalysisAudio($ids) {
		$negotiationConversationDao = Application_CommonUtil::getInstance("dao", "NegotiationConversationDao", $this->db);
		foreach($ids as $id){
			$condition = "conversation_id = '{$id}'";
			$negotiationConversationDao->softDelete($condition);
		}
	}

	/**
	 * 音声解析詳細画面 １件の会議の詳細データ.
	 * analysis-audio/show-audio-data-detail
	 *
	 * @return void
	 */
	public function getAudioDataDetailData($form, &$screenSession) {

		// モデル宣言
		$negotiationConversationDao = Application_CommonUtil::getInstance("dao", "NegotiationConversationDao", $this->db);
		$conversationAggregateDao   = Application_CommonUtil::getInstance("dao", "ConversationAggregateDao", $this->db);

		$REGIST_SERVER_URL = $this->getSentimentDBEndPoint();

		// １件分の会議データ.
		$roomData = $negotiationConversationDao->find("conversation_id = '{$form["id"]}'");
		if($roomData != null) {
			$roomData = $roomData[0];
			$staff_ids[] = $roomData['staff_id']; // ホストユーザ.
		}
		// 差感者の最終的な 平均データの取得 注意点：１句ごとの結果や文字起こし結果ではない.
		$aggregates = $conversationAggregateDao->find("conversation_id = '{$form["id"]}'");

		// ファイル名を生成する（Amivoiceで必要なprefixを削除する）
		$fileName = preg_replace("/(^.*?)(_)/", "", $roomData['conversation_id']);

		// 会議の音源ファイル = oggファイルを管理するストレージサーバのフルパス.
		$audioFilePath = $this->getAudioFilePath($fileName);

		// 会議中の１句ずつのデータの取得 = NOSQLに補完していあるので取得する.
		$analysisData = []; // データ構造: [speaker_label=>int, name=>string, sentiment=>["１句１データ"], transcription=>["１句１データ""]] .
		// グラフ表示用に整形したデータリスト
		$sentimentUsers = array();
		foreach ($aggregates as $aggregate)
		{
			$conversationId = $aggregate['conversation_id'];
			$speakerLabel   = $aggregate['speaker_label'];
			$SENTIMENT_END_POINT = $REGIST_SERVER_URL . "/sentiment/".$conversationId."/".$speakerLabel;
			$TRANSCRIPTION_END_POINT = $REGIST_SERVER_URL . "/transcription/".$conversationId."/".$speakerLabel;

			$speaker = [
				'speaker_label' => $speakerLabel,
				'name'          => $aggregate['staff_name']
			];
			foreach (['sentiment' => $SENTIMENT_END_POINT, 'transcription' => $TRANSCRIPTION_END_POINT] as $key => $end_point) {
				$client = new Zend_Http_Client($end_point, array(
					'maxredirects'  => 0,
					'timeout'    => 30)
				);
				$response = $client->request();
				$speaker[$key] = json_decode($response->getBody(), true); // 1会議中の指定スピーカーの1句毎の発言「全て」が配列で変える.

				if($key == "sentiment"){
					// これは暫定処理になるかも（dynamoがsegment昇順でデータを返せば不要となる）
					$dynamoSentimentList = $speaker[$key];
					$sort = array();
					foreach ($dynamoSentimentList as $key => $value) {
						$sort[$key] = $value['segment'];
					}
					array_multisort($sort, SORT_ASC, $dynamoSentimentList);
					// グラフ表示用のユーザー感情初期化
					$sentimentList = array();
					foreach($dynamoSentimentList as $sentimentData){
						// 何秒目の感情か秒数を計算する（この計算式は暫定ですぐ変更になる）
						$talkTime = floor(($sentimentData["start_pos_sec"] + ($sentimentData["end_pos_sec"] / 2)) / 1000);
						$sentimentRow = ["second" => $talkTime];
						foreach(self::SENTIMENT_PHYSICAL_NAME as $sentimentPhysicalName){
							$sentimentRow[$sentimentPhysicalName] = $sentimentData[$sentimentPhysicalName];
						}
						// 感情解析結果を追加
						$sentimentList[] = $sentimentRow;
					}
					// 表で使用するユーザーの感情解析データを設定
					$sentimentUsers[] = $sentimentList;
				}else if($key == "transcription"){
					// 画面で扱い易いように会話データの整形を行う
					foreach($speaker[$key] as &$transcription){
						// ミリ秒を秒数に変換する MEMO. 0.999を丸めて0にした場合 誤差が大きすぎることが想像できるので 小数点以下第2位で丸める.
						$transcription["conv_start_time"] = (ceil(sprintf("%.3f", $transcription["start_time"]/1000 + 0.001)*100)/100)-0.01;
						$transcription["conv_end_time"] = (ceil(sprintf("%.3f", $transcription["end_time"]/1000 + 0.001)*100)/100)-0.01;
						// 会話秒数を計算する
						$transcription["talk_time"] = $transcription["conv_end_time"] - $transcription["conv_start_time"];
					}
				}
			}
			$analysisData[$speakerLabel] = $speaker; // 1スピーカー分保持.
		}

		// 音源データを取得する
		$storageAudioPath = $_SERVER['DOCUMENT_ROOT']."/tmp_audio/";
		$audioName = $fileName.".mp3"; // MEMO. ブラウザで ２タブ・３タブと開かれたときに操作者が同じ為 音源名が同じ同士で上書きし合うのではないかと懸念があったことからid名に変更.
		$tmpAudioFullPath = "{$storageAudioPath}{$audioName}";
		$isDownloadAudioData = $this->downloadAudioData($tmpAudioFullPath, $audioFilePath);
		// 新しい音声ファイルパスを生成（キャッシュが効いて、前回の音声ファイルを使用する可能性があるので、パラメータの最後にランダム値を設定する）
		$audioUrl = 'https://' . $_SERVER['HTTP_HOST'] . "/tmp_audio/{$audioName}?".rand();

		return compact('roomData', 'analysisData', 'aggregates', 'audioFilePath', 'audioUrl', 'sentimentUsers', 'isDownloadAudioData');
	}


	public function downloadAudioData($tmpAudioFullPath, $audioFilePath) {
		// MEMO. 毎回ダウンロードしないことにした。 ただし大容量の音源の場合、音源をoggからmp3に変換するのに時間がかかり、0バイトのファイルを入手するケースを確認したので 再度ダウンロードを行うケースもある.
		if(!file_exists($tmpAudioFullPath) || 0 == filesize($tmpAudioFullPath)){
			if(file_exists($tmpAudioFullPath)) {
				// wget -O ならば 場所にファイルがあっても上書きするはずだが ファイルが0バイトの場合 上書きしない事実があったので消している.
				unlink($tmpAudioFullPath);
			}
			// 別サーバに音源があると「ダウンロード」せずに「別タブを開いて再生」する挙動になる為、自サーバに持ってくる.
			exec("wget -O {$tmpAudioFullPath} {$audioFilePath}", $out, $ret);
		}
		// 結果を確認 = ファイルがあって、0バイト以上中身があるか？.
		return file_exists($tmpAudioFullPath) && 0 < filesize($tmpAudioFullPath);
	}



}
