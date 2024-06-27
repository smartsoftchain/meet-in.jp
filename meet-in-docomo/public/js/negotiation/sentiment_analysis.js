/**
 * 音声分析関連
 */

// 文字起こし機動者の_speakerNo
const STARTER_SPEAKER_NO = 0;
// 文字起こし開始・停止判定文字列
const TYPE_AUDIO_TEXT = "audioText";
// 音声分析開始・停止判定文字列
const TYPE_SENTIMENT_ANALYSIS = "sentimentAnalysis";

// 文字起こしの実行フラグ
let audioTextFlg = false;
// 音声分析の実行フラグ
let sentimentAnalysisFlg = false;
// 音声分析の登録フラグ
let sentimentAnalysisRegistFlg = false;
// streamIdとspeakerNoの紐付け
let streamAndSpeakerNoRelations = [];
// streamIdとユーザー情報の紐付け
var streamAndUserRelaions = {};
// streamIdとユーザー名の紐付け
let streamAndUserNameRelations = {};
// 通話開始時間
let startConversationDateTimes = [];
// 会話ごとのユニークなID
let conversationId = "";
// MCU用の音声保存クラス
let recorder = null;
// 音声分析開始から終了まで時間.
var recognizeStartAnalysisTimeMS = 0;
// 音声分析残り時間の描画用.
var audioAnalysisTimeLimitSecond = 0;
// 音声分析残時間 0 表示変更用フラグ
let noTimeFlg = false;

// 環境によって中間サーバーと感情データ登録サーバーを切り替える（急遽追加する機能なので、JS側で制御する）
let realtimeRecognizeApiServerUrl = "";
let registServerUrl = "";
if(true){//document.domain == "meet-in.jp"){
  // 本番環境で接続する中間サーバーURL
  realtimeRecognizeApiServerUrl = "wss://transcription.aidma-hd.jp/websocket/audio-recognize";
  // 本番環境で接続する感情データ登録サーバーURL
  registServerUrl = "https://sentimentdb.aidma-hd.jp";
}else{
  // 開発環境で接続する中間サーバーURL
  realtimeRecognizeApiServerUrl = "";
  // 開発環境で接続する感情データ登録サーバーURL
  registServerUrl = "";
}

$(function () {

	// 音声分析実行中モーダルを移動できるようにイベント処理を追加
	$("#modal-content-running_sentiment_analysis").draggable({containment: "#mi_video_area", scroll: false});

	/**
	 * 音声分析開始モーダルを表示する
	 */
	$("#button_sentiment_analysis").click(function () {
		//以下見た目確認用 TODO: 確認後に削除する
		// noTimeFlg = true; 
		// audioAnalysisLock();
		// $("#tmp_message_regist_sentiment_analysis").show();


		// 文字起こしの実行判定
		if(!audioTextFlg){
			// 音声分析が未実行の場合のみモーダルを表示する
			if(!sentimentAnalysisFlg){
				// 残時間等の情報を取得し、状況に応じてアラートを出す。
				audioAnalysisInfo(function(data) {
		
					if(data.code == -1){
						alert("ログインして下さい");
						return;
					} 
					else if(!data.unrestricted && (data.lock || data.time_limit_second < 1)) {
						// 残時間0の場合はアラート表示
						audioAnalysisTimeLimitSecond = data.time_limit_second;
						audioAnalysisLock();
						return;
					} else {
						// 文字起こしが未実行の場合のみ、音声分析を実行するためのモーダルを表示する
						$("#modal-content").show();
						// モーダル内のタグを削除する
						$("div.inner-wrap").empty();
						// テンプレート生成
						var template = Handlebars.compile($('#modal-content-start_sentiment_analysis').html());
						$('div.inner-wrap').append(template());
						// モーダルを表示する為のクリックイベントを発生させる
						$('.modal-open').trigger("click");
					}
				});
			
			}else{
				// 音声分析実行中のメッセージ表示
				$("#tmp_message_run_sentiment_analysis").show();
				setTimeout(function (){
					$("#tmp_message_run_sentiment_analysis").fadeOut();
				} , 3000);
			}
		}else{
			// 文字起こし起動中に、文字起こし停止するようメッセージ表示
			$("#tmp_message_sentiment_analysis").show();
			setTimeout(function (){
				$("#tmp_message_sentiment_analysis").fadeOut();
			} , 3000);
		}
	});

	/**
	 * 音声分析開始モーダルの開始ボタン押下時のイベント
	 */
	$(document).on('click', '#btn_start_sentiment_analysis', function(e){

		// 商談がまだ終わってなければ
	if (!NEGOTIATION.isNegotiationFinish)
	{
		audioAnalysisInfo(function(data) {
			if(data.code == -1){
				alert("ログインして下さい");
				return;
			}
			else if(!data.unrestricted && (data.lock || data.time_limit_second < 1)) {
				audioAnalysisTimeLimitSecond = data.time_limit_second;
				audioAnalysisLock();
				return;
			}

			if(!data.unrestricted){
				if (0 == audioAnalysisTimeLimitSecond) {
					audioAnalysisTimeLimitSecond = data.time_limit_second;
				}
			} else {
				$("#audio-analysis-time-countdown_area").hide();
				$('.mcrsa_area').css('width', 233);
			}

			// モーダルを閉じる
			$("#modal-content").hide();
			// モーダル内のタグを削除する
			$("div.inner-wrap").empty();
			// 音声分析実行中モーダルの位置を初期値に変更
			$("#modal-content-running_sentiment_analysis").css('inset', '');
			// 音声分析実行中モーダルを表示にする
			$("#modal-content-running_sentiment_analysis").show();

			audioAnalysisTimer(true);

			// 音声分析フラグを真にする
			sentimentAnalysisFlg = true;
			// 他の接続ユーザーに音声分析開始を通知する
			sendAudioAndSentimentStatus(TYPE_SENTIMENT_ANALYSIS, sentimentAnalysisFlg);

			// streamIdとspeakerNoの紐付けを初期化する
			streamAndSpeakerNoRelations = [];
			// 通話開始時間を初期化する
			startConversationDateTimes = [];

			// 音声分析実行のマーク表示
			$(".run_sentiment_analysis").show();

			// MCUとP2Pで処理を分岐する
			if(isMCU()){
				// 録音用クラスインスタンス生成（MCUはconversationIdを録音ファイル名とするので、録音実行処理はVoiceAnalysis.jsの中に記述する）
				recorder = createMediaStreamRecorder();
				// MCU用の音声分析機能実行開始
				startMcuSentimentAnalysis();
			}else{
				// 録音を開始する
				NEGOTIATION_RECORDER.startConversation();

				// P2P用の音声分析機能実行開始
				startP2PSentimentAnalysis();
			}

		// 音声分析開始したことを操作ログに残すためのajax通信
		$.ajax({
			url:'/setting-log/get-audio-analysis-start-log',
			type:'post',
			dataType:'json',
		});
	});
	}
});

	/**
	 * P2P用の音声分析機能実行処理
	 * conversationIdが取得できてから音声分析機能を開始する様にする関数
	 * conversationIdが取得できなければ、一秒待った後に再帰する
	 */
	function startP2PSentimentAnalysis(){
		setTimeout(function (){
			// conversationIdを判定し、nullだった場合は再帰する
			if(NEGOTIATION_RECORDER.getFileID()){

				audioAnalysisInfo(function(data) {
					if(data.code == -1){
						alert("ログインして下さい");
						return;
					} else if(!data.unrestricted && (data.lock || data.time_limit_second < 1)) {
						audioAnalysisTimeLimitSecond = data.time_limit_second;
						audioAnalysisLock();
						return;
					}
					// P2P用の関数を実行する
					recognizeStartAnalysisTimeMS = onRecognizeStartFunc((conversationId, result) => {
						// negotiation_conversationテーブルの登録を行う (音声解析の場合のみ).
						registNegotiationConversation(conversationId);
					});
					if(!data.unrestricted){
						if (0 == audioAnalysisTimeLimitSecond) {
							audioAnalysisTimeLimitSecond = data.time_limit_second;
						}
						audioAnalysisTimeCountStart();
					}
				});
			}else{
				// 再帰する
				startP2PSentimentAnalysis();
			}
		} , 1000);
	}

	/**
	 * MCU用の音声分析実行処理
	 * MCUの場合はskywayの録音実行を待つ必要がないので、今のところ再帰処理は必要がない
	 */
	function startMcuSentimentAnalysis(){
		audioAnalysisInfo(function(data) {
			if(data.code == -1){
				alert("ログインして下さい");
				return;
			} else if(!data.unrestricted && (data.lock || data.time_limit_second < 1)) {
				audioAnalysisTimeLimitSecond = data.time_limit_second;
				audioAnalysisLock();
				return;
			}
			// MCU用の関数を実行する

			recognizeStartAnalysisTimeMS = voiceAnalysisSequenceStart((conversationId, result) => {
				// negotiation_conversationテーブルの登録を行う (音声解析の場合のみ).
				registNegotiationConversation(conversationId);
			});
			if(!data.unrestricted){
				audioAnalysisTimeLimitSecond = data.time_limit_second;
				audioAnalysisTimeCountStart();
			}
		});
	}

	/**
	 * 音声分析開始モーダルのキャンセルボタン押下時のイベント
	 */
	$(document).on('click', '#btn_start_cancel_sentiment_analysis', function(e){
		// モーダルを閉じる
		$("#modal-content").hide();
		// モーダル内のタグを削除する
		$("div.inner-wrap").empty();
	});

	/**
	 * 音声分析実行中モーダルの、×ボタン若しくは停止ボタン押下時のイベント
	 */
	$(document).on('click', '.btn_stop_confirm_sentiment_analysis', function(e){
		// 音声分析実行中モーダルを非表示にする
		$("#modal-content-running_sentiment_analysis").hide();

		// 音声分析停止確認モーダルを表示する
		$("#modal-content").show();
		// モーダル内のタグを削除する
		$("div.inner-wrap").empty();
		// テンプレート生成
		var template = Handlebars.compile($('#modal-content-stop_sentiment_analysis').html());
		$('div.inner-wrap').append(template());
		// モーダルを表示する為のクリックイベントを発生させる
		$('.modal-open').trigger("click");
	});

	/**
	 * 音声分析停止モーダルの停止ボタン押下時のイベント
	 */
	$(document).on('click', '#btn_stop_sentiment_analysis', function(e){
		stopSentimentAnalysis();
	});

	/**
	 * 音声分析停止モーダルのキャンセルボタン押下時のイベント
	 */
	$(document).on('click', '#btn_stop_cancel_sentiment_analysis', function(e){
		// モーダルを閉じる
		$("#modal-content").hide();
		// モーダル内のタグを削除する
		$("div.inner-wrap").empty();
		// 音声分析実行中モーダルを表示にする
		$("#modal-content-running_sentiment_analysis").show();
	});
});

/**
	* 音声分析機能を停止する処理(処理中にskyway, mcuで分岐)
	*/
function stopSentimentAnalysis() {
		// モーダルを閉じる
		$("#modal-content").hide();
		// モーダル内のタグを削除する
		$("div.inner-wrap").empty();
		// 音声分析実行中モーダルを表示にする
		$("#modal-content-running_sentiment_analysis").hide();

		audioAnalysisStop(function(data){
			audioAnalysisTimeCountStop();
		});

		if (!noTimeFlg) {
			// 音声分析登録メッセージの表示
			$("#tmp_message_regist_sentiment_analysis").show();
			setTimeout(function (){
				// TODO : 確認終了後　削除する。時間確定したら、その秒数（=>3分とのこと）にする。
				console.log('after 180,000');
					$("#tmp_message_regist_sentiment_analysis").fadeOut();
				} , 180000);
		}
		// MCUとP2Pで処理を分岐する
		if(isMCU()){
			// 録音を終了する
			recorder.stop();
			// 他のユーザーへ停止リクエストを送信する
			sendRequestVoiceAnalysisStop();
		}else{
			// 録音を終了する
			NEGOTIATION_RECORDER.stopConversation();
		}

		// 音声分析停止したことを操作ログに残すためのajax通信
		$.ajax({
			url:'/setting-log/get-audio-analysis-stop-log',
			type:'post',
			dataType:'json',
		});
		
		// 音声分析フラグを偽にする
		sentimentAnalysisFlg = false;
		// 他の接続ユーザー音声分析終了を通知する
		sendAudioAndSentimentStatus(TYPE_SENTIMENT_ANALYSIS, sentimentAnalysisFlg);

		// 音声分析登録フラグを真にする
		sentimentAnalysisRegistFlg = true;

		// 音声分析実行のマーク非表示
		$(".run_sentiment_analysis").hide();
		
		// 終了処理を起動するもう一つのボタンのクリックイベントを発火する
		$("#dummy_stop_sentiment_analysis").trigger('click');
}

var audioAnalysisTimeLimitCounterId;
function audioAnalysisTimeCountStart()
{
	audioAnalysisTimeLimitCounterId = setInterval(function() {
		audioAnalysisTimeLimitSecond--;
		audioAnalysisTimer(audioAnalysisTimeLimitSecond % 2 == 0);
		if(audioAnalysisTimeLimitSecond < 1) {
			noTimeFlg = true; // 0時間アラート表示のためフラグを変更する
			stopSentimentAnalysis(); // 1秒未満のときは止める
			return;
		}
	}, 1000);
}
/**
 * フロントのカウンターを開始して、書き換える処理
 */
function audioAnalysisTimeCountStop() {
	clearInterval(audioAnalysisTimeLimitCounterId);
	audioAnalysisTimer(true);
}
/**
 * フロントの時間表示領域を更新する処理
 */
function audioAnalysisTimer(isCarve)
{
	let convertHour = 3600;
	let hour = ('000'+Math.floor(audioAnalysisTimeLimitSecond / convertHour)).slice(-3);
	let minute = ('00'+Math.floor((audioAnalysisTimeLimitSecond % convertHour) / 60)).slice(-2);
	let second = ('00'+Math.floor(audioAnalysisTimeLimitSecond % 60)).slice(-2);
	let left  = hour;
	let right = minute;
	if(hour < 1){
		left  = minute;
		right = second;
	}
	document.getElementById("audio-analysis-time-countdown-left").innerHTML = (Number(left) == NaN || Number(left) == -1) ? '00' : left;
	document.getElementById("audio-analysis-time-countdown-colon").style.opacity = isCarve ? 1 : 0;
	document.getElementById("audio-analysis-time-countdown-right").innerHTML = (Number(right) == NaN || Number(right) == -1) ? '00' : right;
}

/**
 * 残時間0の場合にモーダルを消して、アラート表示する処理
 */
function audioAnalysisLock() {

	// モーダルを閉じる
	$("#modal-content").hide();
	// モーダル内のタグを削除する
	$("div.inner-wrap").empty();
	
	// 残時間 0アラート表示
	if (noTimeFlg) {
		// 途中で0になった場合は登録中messageに文言を追加する
		$("#tmp_message_regist_sentiment_analysis").html(
			'<img src="/img/svg/icon_sentiment_mike_white.svg" class="add_text_icon_alert_mike"/>音声分析の残り時間が0:00です<span class="add_text">音声分析結果を登録中です<br>しばらくお待ちください</span>'
		);
		$("#tmp_message_regist_sentiment_analysis").addClass('add_text_alert')
		$("#tmp_message_regist_sentiment_analysis").show();
		setTimeout(function (){
				// TODO : 確認終了後　削除する。時間確定したら、その秒数にする。3分
				console.log('after 180000');
				$("#tmp_message_regist_sentiment_analysis").fadeOut();
			} , 180000);
		
	} else {
		$("#tmp_message_no_time_alert_sentiment_analysis").show();
	}

	// 下部メニューアイコン、文字透過classを付与する
	$(".icon_footer_mike").addClass('lock');
	$(".title_sentiment_analysis").addClass('lock');
	$("#button_sentiment_analysis").addClass('lock');

	// 下部メニュー　hoverでの残時間 0アラート表示出し入れ
	$('#button_sentiment_analysis').mouseenter(function() {
		const noTimeAlertElem = $('#tmp_message_no_time_alert_sentiment_analysis');
		if (noTimeAlertElem.css('display') === 'none' && $('#tmp_message_no_time_alert_sentiment_analysis').css('display') === 'none'
		&& $('.add_text_alert').css('display') !== 'block') {
			noTimeAlertElem.show();
		}
	});
	$('#button_sentiment_analysis').mouseleave(function() {
		const noTimeAlertElem = $('#tmp_message_no_time_alert_sentiment_analysis');
		if (noTimeAlertElem.css('display') === 'block' ) {
			noTimeAlertElem.fadeOut();
		}
	});
}

/**
 * サーバ側の音声分析制限時間等の情報を取得する
 */
const audioAnalysisInfo = function(event)
{
	$.ajax({
		url: "/get-audio/audio-analysis-info",
		type: "POST",
		data: {}
	}).done(function (res) {
		let data = $.parseJSON(res); 
		event(data);
	}).fail(function (res) {
		console.log('error')
	});
};
/**
	* サーバ側の音声分析停止処理を止める
	*/
const audioAnalysisStop = function(event)
{
	$.ajax({
		url: "/get-audio/audio-analysis-stop",
		type: "POST",
		data: {
			"time": (performance.now() - recognizeStartAnalysisTimeMS) * 0.001,
		}
	}).done(function (res) {
		recognizeStartAnalysisTimeMS = 0;
		let data = $.parseJSON(res);
		if(data.code == -1){
			alert("ログインして下さい");
			return;
		}
		audioAnalysisTimeLimitSecond = data.time_limit_second;
		event(data);
		if(!data.unrestricted && (data.lock || data.time_limit_second < 1)) {
			audioAnalysisLock();
		}
	}).fail(function (res) {
		console.log('error')
	});
};


/**
 * streamIdとspeakerNoを紐づける関数
 * 再接続など行うと、streamIdとユーザー情報がまだ紐づいていない状態で
 * この関数が実行される可能性があるので、あくまでstreamIdとspeakerNoを紐付けるのみとする
 * @param {*} speakerNo
 */
function streamAndSpeakerNoRelation(streamId, speakerNo){
	// streamIdとspeakerNoを紐付ける
	streamAndSpeakerNoRelations[speakerNo] = streamId;
}

/**
 * 音声分析結果をDynamoDBに登録する
 * @param {*} resultSentiment 音声分析結果
 * @param {*} transcribeResults 文字起こしデータ
 */
function registSentimentToDynamo(resultSentiment, transcribeResults){
	// 会話の間と会話被りが存在する場合は登録
	if(resultSentiment["conversationEvaluation"] && resultSentiment["conversationEvaluation"]["results"]){
		let results = resultSentiment["conversationEvaluation"]["results"];
		for (let i = 0; i < results.length; i++) {
			// speakerLabel（会話者）の取得
			let speakerLabel = results[i]["speakerLabel"];
			// 会話の間データ登録
			let pause = results[i]["pause"];
			if(pause.length > 0){
				registBulkPause(resultSentiment["conversationId"], speakerLabel, pause);
			}
			// 会話の被りデータ登録
			let bargein = results[i]["bargein"];
			if(bargein.length > 0){
				registBulkBargein(resultSentiment["conversationId"], speakerLabel, bargein);
			}
		}
	}
	// 音声分析データ登録
	let sentimentAnalysis = resultSentiment["sentimentAnalysis"];
	if(sentimentAnalysis){
		for (let i = 0; i < sentimentAnalysis.length; i++) {
			// speakerLabel(通話者)毎のループ
			let speakerLabel = sentimentAnalysis[i]["speakerLabel"];
			let sentiments = sentimentAnalysis[i]["results"];
			if(sentiments.length > 0){
				// speakerLabel(通話者)毎にまとめてデータ登録する
				registBulkSentiment(resultSentiment["conversationId"], speakerLabel, sentiments);
			}
		}
	}
	// 文字データの登録
	registBulkTranscription(transcribeResults);
}

/**
 * 会話の間をまとめてデータ登録
 * @param {int} localConversationId
 * @param {int} speakerLabel
 * @param {Array} pauses
 */
function registBulkPause(localConversationId, speakerLabel, pauses){
	// 送信データを保持する変数
	let request = [];
	for (let i = 0; i < pauses.length; i++) {
		request.push({
			conversation_id : localConversationId,
			speaker_label : speakerLabel,
			start_time : pauses[i]["startTime"],
			duration : pauses[i]["duration"]
		});
	}
	// 送信データ作成
	let reqJson = JSON.stringify(request);
	//console.log("registBulkPause");
	//console.log(reqJson);
	$.ajax({
		type: "POST",
		url: registServerUrl + "/api/meet/pause/bulk_create",
		dataType: "json",
		data: reqJson,
	}).done(function (response) {
		//console.log("res registBulkPause:" + response);
	}).fail(function (data) {
		console.log("fail registBulkPause:" + data);
	});
}

/**
 * 会話の被りをまとめてデータ登録
 * @param {int} localConversationId
 * @param {int} speakerLabel
 * @param {Array} bargeins
 */
function registBulkBargein(localConversationId, speakerLabel, bargeins){
	// 送信データを保持する変数
	let request = [];
	for (let i = 0; i < bargeins.length; i++) {
		request.push({
			conversation_id : localConversationId,
			speaker_label : speakerLabel,
			start_time : bargeins[i]["startTime"],
			duration : bargeins[i]["duration"]
		});
	}
	// 送信データ作成
	let reqJson = JSON.stringify(request);
	//console.log("registBulkBargein");
	//console.log(reqJson);
	$.ajax({
		type: "POST",
		url: registServerUrl + "/api/meet/barge-in/bulk_create",
		dataType: "json",
		data: reqJson,
	}).done(function (response) {
		//console.log("res registBulkBargein:" + response);
	}).fail(function (data) {
		//console.log("fail registBulkBargein:" + data);
	});
}

/**
 * 感情データ登録
 * @param {int} localConversationId
 * @param {int} speakerLabel
 * @param {Array} sentiments
 */
function registBulkSentiment(localConversationId, speakerLabel, sentiments){
	// 送信データを保持する変数
	let request = [];
	for (let i = 0; i < sentiments.length; i++) {
		// 送信データを作成する
		request.push({
			"conversation_id" :      localConversationId, 
			"speaker_label" :        speakerLabel, 
			"segment":               sentiments[i]["Segment"], 
			"start_time" :           sentiments[i]["StartPosSec"], 
			"start_date_time":       sentiments[i]["startTime"], 
			"start_pos_sec" :        sentiments[i]["StartPosSec"], 
			"end_pos_sec" :          sentiments[i]["EndPosSec"], 
			"energy" :               sentiments[i]["Energy"], 
			"stress" :               sentiments[i]["Stress"], 
			"emo_cog" :              sentiments[i]["EMO/COG"], 
			"concentration" :        sentiments[i]["Concentration"], 
			"anticipation" :         sentiments[i]["Anticipation"], 
			"excitement" :           sentiments[i]["Excitement"], 
			"hesitation" :           sentiments[i]["Hesitation"], 
			"uncertainty" :          sentiments[i]["Uncertainty"], 
			"intensive_thinking" :   sentiments[i]["IntensiveThinking"], 
			"imagination_activity" : sentiments[i]["ImaginationActivity"], 
			"embarrassment" :        sentiments[i]["Embarrassment"], 
			"passionate" :           sentiments[i]["Passionate"], 
			"brain_power" :          sentiments[i]["BrainPower"], 
			"confidence" :           sentiments[i]["Confidence"], 
			"aggression" :           sentiments[i]["Aggression"], 
			"call_priority" :        sentiments[i]["CallPriority"], 
			"atmosphere" :           sentiments[i]["Atmosphere"], 
			"upset" :                sentiments[i]["Upset"], 
			"content" :              sentiments[i]["Content"], 
			"dissatisfaction" :      sentiments[i]["Dissatisfaction"], 
			"extreme_emotion" :      sentiments[i]["ExtremeEmotion"], 
		});
	}
	// 送信データ作成
	let reqJson = JSON.stringify(request);
	$.ajax({
		type: "POST",
		url: registServerUrl + "/api/meet/sentiment/bulk_upsert",
		dataType: "json",
		data: reqJson,
	}).done(function (response) {
		//console.log("res registBulkSentiment:" + response);
	}).fail(function (data) {
		//console.log("fail registBulkSentiment:" + data);
	});
}

/**
 * 会話データのまとめて登録
 */
function registBulkTranscription(transcribeResults){
	// 送信データを保持する変数
	let request = [];
	// 既に保持しているtranscribeResultsに保持しているキー名では、dynamoのキー目と違うので再度詰め直す
	for (let i = 0; i < transcribeResults.length; i++) {
		request.push({
			"conversation_id" : conversationId,
			"speaker_label" : transcribeResults[i]["speakerNo"],
			"start_time" : transcribeResults[i]["starttime"],
			"end_time" : transcribeResults[i]["endtime"],
			"text" : transcribeResults[i]["text"]
		});
	}
	// 送信データ作成
	let reqJson = JSON.stringify(request);
	$.ajax({
		type: "POST",
		url: registServerUrl + "/api/meet/transcription/bulk_upsert",
		dataType: "json",
		data: reqJson,
	}).done(function (response) {
		//console.log("res registBulkTranscription:" + response);
	}).fail(function (data) {
		//console.log("fail registBulkTranscription:" + data);
	});
}

/**
 * 音声分析データの登録を行う
 * この登録はconversation_aggregateテーブルへの登録
 * userAndSpeakerNoRelationsはP2PとMCUで作成方法が変わるので、引数で受け取るように変更
 * @param {*} conversationDict 音声分析結果
 * @param {*} userAndSpeakerNoRelations ユーザーとSpeakerNoの紐付け情報
 */
function registConversationAggregate(conversationDict, userAndSpeakerNoRelations){
	// param量が多いとサーバーが受け付けないので、json化する
	let conversationJson = JSON.stringify(conversationDict);
	$.ajax({
		type: "POST",
		url: "/analysis-audio/set-conversation-aggregate",
		dataType: "json",
		data: {conversationJson : conversationJson, userAndSpeakerNoRelations : userAndSpeakerNoRelations},
	}).done(function (response) {
		if(response.code.message != ""){
			console.log(response.code.registData);
			alert(response.code.message);
		}
	}).fail(function (data) {
		console.log("fail registConversationAggregate:" + data);
	});
}

/**
 * ストリームの取得できた相手へ情報を返す様に要求を投げる
 * @param {*} streamId
 * @param {*} targetPeerId
 */
function streamAndUserRelaion(streamId, targetPeerId){
	var userName =setUserName();

	// ストリームとユーザーIDの紐付けを行う
	streamAndUserRelaions[streamId] = {peerId : targetPeerId, staffType : "", staffId : 0, clientId : 0};
	// ストリームとユーザー名の紐付けを行う
	streamAndUserNameRelations[streamId] = {userName : userName};

	// ストリームの相手へユーザー情報の要求を行う
	var data = {
		command : "SENTIMENT_ANALYSIS",
		type : "REQUEST_USER_INFO",
		streamId : streamId
	};
	sendCommand(targetPeerId, data);
}

/**
 * 音声分析で使用する、接続相手の情報取得と設定
 * REQUEST_USER_INFO 音声分析実行者から、接続ユーザーへの情報要求
 * RESPONCE_USER_INFO 接続ユーザーから、要求者への返答
 * @param {*} json
 */
function receiveSentimentAnalysis(json){
	if(json.type == "REQUEST_USER_INFO"){
		// ユーザー情報の要求に対し、レスポンスを返す
		var staffType = $("#staff_type").val();
		var staffId = $("#staff_id").val();
		var clientId = $("#client_id").val();
		var userName = setUserName();

		var data = {
			command : "SENTIMENT_ANALYSIS",
			type : "RESPONCE_USER_INFO",
			staffType : staffType,
			staffId : staffId,
			clientId : clientId,
			peerId : $('#peer_id').val(),
			streamId : json.streamId,
			userName : userName,
		};
		sendCommand(json.from_peer_id, data);
	}else if(json.type == "RESPONCE_USER_INFO"){
		// 返ってきたユーザー情報を変数へ保存する
		streamAndUserRelaions[json.streamId]["staffType"] = json.staffType;
		streamAndUserRelaions[json.streamId]["staffId"] = json.staffId;
		streamAndUserRelaions[json.streamId]["clientId"] = json.clientId;
		// ?? '匿名ユーザー' はsp用　ユーザー名入力がspで現時点でなく ゲストの場合漏れなく　匿名ユーザーとなる。
		// receiveSentimentAnalysisもspではないため、json.userNameが　undefined となるため、匿名ユーザーを入れるようにしている。
		streamAndUserNameRelations[json.streamId]["userName"] = json.userName != null ? json.userName : '匿名ユーザー';

	}
}

/**
 * ユーザー名を判定する処理
 * @return {string} userName ユーザー名（ユーザー一覧と同値） 
 */
function setUserName() {
	let userName = '匿名ユーザー';
	if($("#my_user_info").val() !== '') {
		userName = $("#my_user_info").val();
	}
	if($("#user_name").length && $("#user_name").val() !== '') {
		userName = $("#user_name").val();
	}
	return userName;
}

/**
 * P2P専用音声解析の開始・終了を他ユーザーへ通知する処理
 * @param {*} audioType [TYPE_AUDIO_TEXT:文字起こし, TYPE_SENTIMENT_ANALYSIS:音声分析]
 * @param {*} statusFlg [true:開始, false:終了]
 */
function sendAudioAndSentimentStatus(audioType, statusFlg){
	// ストリームの相手へ文字起こし又は、感情解析の開始・終了を送信する
	var data = {
		command : "AUDIO_OR_SENTIMENT_STATUS",
		type : "SEND_STATUS",
		audioType: audioType, 
		statusFlg : statusFlg
	};
	sendCommand(SEND_TARGET_ALL, data);
}
/**
 * P2P専用音声解析の開始・終了を受信し設定する処理
 * @param {*} json 
 */
function receiveAudioOrSentimentStatus(json){
//	console.log('json', JSON.stringify(json));
	if(json.type == "SEND_STATUS"){
		// 文字起こし又は、感情解析の開始・終了ステータスを受け取りグローバル変数へ設定する
		if(json.audioType == TYPE_AUDIO_TEXT){
			// 文字起こし
			audioTextFlg = json.statusFlg;
		}else if(json.audioType == TYPE_SENTIMENT_ANALYSIS){
			// 音声分析
			sentimentAnalysisFlg = json.statusFlg;
		}
	}else if(json.type == "SYNC_STATUS"){
		// このメッセージは同期処理で使用される
		audioTextFlg = json.audioTextFlg;
		sentimentAnalysisFlg = json.sentimentAnalysisFlg
	}
}

/**
 * MCUサーバを使用しているかを判別する
 */
function isMCU() {
	return location.pathname.startsWith('/rooms/');
}

/**
 * P2P専用のユーザー情報とSpeakerNoの紐付け処理
 */
function p2pUserAndSpeakerNoRelation(){
	// SpeakerNoとユーザー情報を紐づける
	let userAndSpeakerNoRelations = [];
	// 文字起こしを起動したユーザー情報を設定する
	userAndSpeakerNoRelations[STARTER_SPEAKER_NO] = {
		"staff_type" : $("#staff_type").val(), 
		"staff_id" : $("#staff_id").val(), 
		"client_id" : $("#client_id").val() 
	};
	for (let i = 1; i < streamAndSpeakerNoRelations.length; i++) {
		// 設定する値の初期化
		let userInfoDict = {
			"staff_type" : "",
			"staff_id" : "",
			"client_id" : ""
		};
		let streamId = streamAndSpeakerNoRelations[i];
		if(streamAndUserRelaions[streamId]){
			// streamIdに紐ずくユーザー情報がある場合は設定する
			userInfoDict = {
				"staff_type" : streamAndUserRelaions[streamId]["staffType"],
				"staff_id" : streamAndUserRelaions[streamId]["staffId"],
				"client_id" : streamAndUserRelaions[streamId]["clientId"]
			};
		}
		userAndSpeakerNoRelations[i] = userInfoDict;
	}
	// 戻り値を返す
	return userAndSpeakerNoRelations;
}

/**
 * MCU専用のユーザー情報とSpeakerNoの紐付け処理
 */
function mcuUserAndSpeakerNoRelation(){
	// SpeakerNoとユーザー情報を紐づける
	let userAndSpeakerNoRelations = [];
	// 文字起こしを起動したユーザー情報を設定する
	userAndSpeakerNoRelations[STARTER_SPEAKER_NO] = {
		"staff_type" : $("#staff_type").val(), 
		"staff_id" : $("#staff_id").val(), 
		"client_id" : $("#client_id").val() 
	};
	for (let key in voiceAnalysisStatus.peers) {
		// 記述が長くなるおので、一旦変数に保存
		let userInfo = voiceAnalysisStatus.peers[key];
		// 紐付け情報に登録
		userAndSpeakerNoRelations[userInfo.speakerNo] = {
			"staff_type" : userInfo.staffType,
			"staff_id" : userInfo.staffId,
			"client_id" : userInfo.clientId
		}
	}
	// 戻り値を返す
	return userAndSpeakerNoRelations;
}

/**
 * negotiation_conversationsテーブル登録処理
 * @param {*} conversation_id Amivoiceで使用するID
 */
function registNegotiationConversation(conversation_id){
	let data = {
		'conversation_id': conversation_id,
		'client_id':      $("#client_id").val(),
		'staff_id':       $("#staff_id").val(),
		'staff_type':     $("#staff_type").val(),
		'room_name':      $("#Room_name").val(),
	};

	$.ajax({
		url: "/analysis-audio/start-negotiation-conversation",
		type: "POST",
		data: data
	}).done(function (res) {
		let data = $.parseJSON(res);
		if(data.code < 1){
			let message = data.message;
			if(message.length == 0){
				message = '異常が発生しました';
			}
			alert(message);
			return;
		}
	}).fail(function (res) {
		console.log('error')
	});

}