<?php

/**
 * ConversationTranscribeDao クラス
 *
 * 感情分析Daoクラス
 *
 * @version 2020/12/11 17:00 nishimura
 * @package Dao
*/
class ConversationTranscribeDao {

	public function find($condition, $order, $ordertype, $page, $limit) {

		$host = 'https://sentimentdb.aidma-hd.jp';
		$url = $host ."/api/sc/transcription/create";
		$post_params = ['conversation_id' => 'speaker_label'];

		$ch = curl_init();
		curl_setopt_array($ch, [
		    CURLOPT_URL => $url,
		    CURLOPT_RETURNTRANSFER => true,
		    CURLOPT_POST => false,
		    CURLOPT_TIMEOUT => 0,
		    CURLOPT_POSTFIELDS => http_build_query($post_params),
		]);

		$response = curl_exec($ch);
		curl_close($ch);

		var_dump($response);

/*
		const REGIST_SERVER_URL = "";

	    // 送信データ作成
	    let reqJson = JSON.stringify({
	        conversation_id : conversationId, 
	        speaker_label : speakerLabel, 
	        start_time : startTime,
	        end_time : endTime,
	        text : text
	    });
	    $.ajax({
	        type: "POST",
	        url: REGIST_SERVER_URL + "/api/sc/transcription/create",
	        dataType: "json",
	        data: reqJson,
	    }).done(function (response) {
	        //console.log("res registTranscription:" + response);
	    }).fail(function (data) {
	        //console.log("fail registTranscription:" + data);
	    });
*/

	}

}
