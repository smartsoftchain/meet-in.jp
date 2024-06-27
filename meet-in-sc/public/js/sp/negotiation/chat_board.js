/*
 * チャットに使用するJS群
 *
 */
// チャットの文字サイズ（デフォルト）
var chatBoardfontType = 1;
var chatCnt = 1;

$(function () {

	// 文字送信イベント
	$('#send_chat_message' ).on('click', function( e ) {
		console.log("送信ボタン::("+$('#chat_board_send_message').length+")");
		if( $('#chat_board_send_message').val().length ) {	// 入力値あり
			// ユーザ識別用のUUIDを取得する(UUID については、同一者の連続メッセージなのかを判定するために使用する)
			var uuId = sessionStorage.UUID;	// sessionStorge.UUID;
			if( !uuId ) {	// 空
				uuId = UUID.generate();
				sessionStorage.UUID = uuId;
			}
			var user_id = $('#user_id').val();

			var template = createMyTemplate(chatCnt, user_id, uuId);
			$('#chat_board_messages').append(template);

			var value = $('#chat_board_send_message').val();
			console.log("チャットメッセージ DATA["+value+"]");
			// 入力文字をサニタイジングし出力
			escape("#chat_board_message_text"+chatCnt, value);

			// メッセージの最後を表示するように、一番下へスクロールする
			$('#chat_board_messages').animate({scrollTop: $('#chat_board_messages')[0].scrollHeight}, 'fast');
			// 入力クリア
			$("#chat_board_send_message").val("");

			var message_text = $('#chat_board_message_text'+chatCnt).html();
			var data = {
				command : "CHAT_BOARD",
				type : "SEND_MESSAGE",
				userid : user_id,
				uuid : uuId,
				message : message_text
			};
			sendCommand(SEND_TARGET_ALL, data);

			registChatMessage(user_id, uuId, message_text);

			chatCnt++;
		} // if_End

		return false;	// falseを返すことでイベントの引継ぎは中断される。

	});

	// 閉じるボタン押下時のイベント処理
	$(document).on('click', '#chat__return', function(){
		// チャットウインドの非表示
		hideChatBord();
		var data = {
				command : "CHAT_BOARD",
				type : "TOGGLE_CHAT_BOARD",
				display : "none"
		};
		sendCommand(SEND_TARGET_ALL, data);

		swapToggleHide(NEGOTIATION.rightAreaDom,RIGHT_AREA_CHAT_BOARD);

		// 資料が表示されている場合位置が変わるので資料を再描画する
		documentResizeEvent();
	});


	/**
	 * windowsタブレット用のタッチイベント
	 */
	$('textarea.chat_board_text').bind('touchstart', function() {
		// ページが動いたり等の反応を止める
		event.preventDefault();
		// 共有メモをタップしたが、フォーカスが当たっていない場合はフォーカスを当てる
		if(!$('textarea.chat_board_text').is(':focus')){
			$("textarea.chat_board_text").focus();
		}
	});

});

// サニタイジング済み
function escape(targetId, targetValue) {
	console.log("escape targetId["+targetId+"] targetValue=["+targetValue+"]");
	if (targetValue === null || targetValue === undefined) {
		targetValue = "";
	}
	// HTMLサニタイジング（HTML文字列を無害化し、改行コードをbrタグに置き換え）
	var esc_str = $('<dummy>').text(targetValue).html().replace(/\r\n|\r|\n/g, '<br>');

	// HTMLサニタイズしたものをHTMLとして出力
	$(targetId).html(esc_str);
}

function escapeHTML( text ) {
	var replacement = function( ch ) {
		var characterReference = {
			'"':'&quot;',
			'&':'&amp;',
			'\'':'&#39;',
			'<':'&lt;',
			'>':'&gt;',
			'?': '&#063'
		};
		return characterReference[ ch ];
	}
	return text.replace( /["&'<>?]/g, replacement );
}
/**
 * 相手から送信されたチャットの情報を受取る関数
 * @param json
 */
function receiveChatBoardJson(json){
	if(json.type == "SEND_MESSAGE"){
		// チャットのメッセージ(相手のメッセージ)
		var template = createOthersTemplate(chatCnt, json.userid, json.uuid);
		$('#chat_board_messages').append(template);

		// 入力文字を出力((サニタイジング済み))
		$('#chat_board_message_text'+chatCnt).html(json.message)

		// メッセージの最後を表示するように、一番下へスクロールする
		showLatestChatMessage();

		createOthersImage(chatCnt, json.userid, json.uuid);
		$("#chat_board_send_message").focus();
		chatCnt++;
	}
	else if(json.type == "TOGGLE_CHAT_BOARD"){
		// 共有メモの表示非表示切替
		if(json.display == "table" || json.display ==  "block"){
			// チャットウインドウの表示
			showChatBord();
		}else{
			// チャットウインドウの非表示
			hideChatBord();
		}
		// 新レイアウトで追加された関数の呼び出し
		swapToggleHide(NEGOTIATION.rightAreaDom,RIGHT_AREA_CHAT_BOARD);
	}

}

var chat_userid = null;
var chat_uuid = null;
var chat_next_cnt = 0;

function createMyTemplate(chatCnt, user_id, uuId) {
	if( chat_userid == user_id && chat_uuid == uuId ) {
		chat_next_cnt++;
	}
	else {
		chat_next_cnt = 0;
	}
	chat_userid = user_id;
	chat_uuid = uuId;

	var message = "";
	message += '<div class="chat_board_message chat_board_message_forced">';
	message += '<div class="chat_board_right">';

//	message += "<div class=\"chat_board_message_box\">";
	if( chat_next_cnt == 0 ) {
		// 初回(１件のみのメッセージ)
		message += '<div class="chat_board_message_box">';
	}
	else {
		// 連続２件目以降
		if( chat_next_cnt == 1 ) {
			// ２件目(初回メッセージを開始吹き出しへ)
			$("div.chat_board_message_box:last").removeClass("chat_board_message_box").addClass("chat_board_message_box_start");
		}
		else {
			// ３件目以降(メッセージ、終了吹き出しを継続吹き出しへ)
			$("div.chat_board_message_box_end:last").removeClass("chat_board_message_box_end").addClass("chat_board_message_box_next");
		}
		// 2件目以降(終了吹き出し出力)
		message += '<div class="chat_board_message_box_end">';
	}
	message += '<div class="chat_board_message_content chat_message_padding_forced chat_message_size_forced">';
	message += '<div id="chat_board_message_text'+ chatCnt +'" class="chat_board_message_text">';
	message += '</div></div></div>';

	message += '</div></div>';
	message += '<div class="chat_board_clear"></div><!-- 回り込みを解除（スタイルはcssで充てる） -->';
	return message;
}

/**
 * negotiation_event_func.jsにも同じ関数が存在し、
 * どうやらそちらが呼ばれている気がするが流用なので詳細はわからない
 * とりあえず両方同じメンテするよう注意すること
 * @param chatCnt
 * @param userid
 * @param uuid
 * @returns
 */
function createOthersTemplate(chatCnt, userid, uuid) {

	if( chat_userid == userid && chat_uuid == uuid ) {
		chat_next_cnt++;
	}
	else {
		chat_next_cnt = 0;
	}
	chat_userid = userid;
	chat_uuid = uuid;

	var message = "";
	message += '<div class="chat_board_message chat_board_message_forced">';

	if( chat_next_cnt == 0 ) {
		message += '<div class="chat_board_left_img">';
		message += '<div class="chat_board_userimg_left chat_board_userimg_left_forced">';
		message += '<div class="chat_board_userimg_wrap_left chat_board_userimg_wrap_left_forced">';
		message += '<div class="chat_board_userimg_wrap_left_inner">';
		message += '<img id="image'+ chatCnt +'" src="/img/icon_face.png" style="position:absolute; width:100%; height:66%; object-fit:scale-down;\">';
		message += '</div></div></div>';
		// 初回(１件のみのメッセージ)
		message += '<div class="chat_board_message_box">';
	}
	else {
		// 連続２件目以降
		message += '<div class="chat_board_left">';
		if( chat_next_cnt == 1 ) {
			// ２件目(初回メッセージを開始吹き出しへ)
			$("div.chat_board_message_box:last").removeClass("chat_board_message_box").addClass("chat_board_message_box_start");
		}
		else {
			// ３件目以降(メッセージ、終了吹き出しを継続吹き出しへ)
			$("div.chat_board_message_box_end:last").removeClass("chat_board_message_box_end").addClass("chat_board_message_box_next");
		}
		// 2件目以降(終了吹き出し出力)
		message += '<div class="chat_board_message_box_end">';
	}
	message += '<div class="chat_board_message_content chat_message_padding_forced chat_message_size_forced">';
	message += '<div id="chat_board_message_text'+ chatCnt + '" class="chat_board_message_text">';
	message += '</div></div></div>';

	message += '</div>';
	message += '</div>';
	message += '<div class="chat_board_clear"></div><!-- 回り込みを解除（スタイルはcssで充てる） -->';
	return message;
}

function createOthersImage(chatCnt, userid, uuid) {
	tmp = $('#image'+chatCnt);

	var canvas = document.createElement("canvas");
	var video = $("div#negotiation_target_video_"+userid).find('#video_target_video_'+userid).get(0);
	if (video && canvas) {
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;
		try {
			canvas.getContext('2d').drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
			var url = canvas.toDataURL('image/jpeg');
			if(url == "data:," || (!tmp) ){// イメージが取れないときにこうなるので、デフォアイコンをセット
				tmp.attr('src','/img/icon_face.png');
			}else{
				tmp.attr('src',canvas.toDataURL('image/jpeg'))
			}
		}
		catch (exception) {
			console.log("createOthersImage エラー内容："　+ error);
		}
	}
	else{
		// ieはキャプチャできないのでmeet-inアイコンを使用
		tmp.attr('src','/img/icon_face.png');
	}
}

/**
 * チャットメッセージを登録する
 * @param {*} uuid
 * @param {*} messages
 */
function registChatMessage(user_id, uu_id, messages) {
	var connection_info_id = $('#connection_info_id').val();

	$.ajax({
		type: "POST",
		url: "https://" + location.host + "/negotiation/regist-chat-message",
		dataType: "json",
		data: {
			"connection_info_id" : connection_info_id,
			"user_id" : user_id,
			"uu_id" : uu_id,
			"messages" : messages
		}
	}).done(function(data) {
		// jsonをオブジェクトに変換
		var result = $.parseJSON(data);
		if(result["status"] == 1){
console.log("result=("+result["status"]+")");
		}
		else {
console.log("ERROR result=("+result["status"]+")");
		}
	}).fail(function(data) {
	});
}

