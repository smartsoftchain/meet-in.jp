/*
 * チャットに使用するJS群
 *
 */
// チャットの文字サイズ（デフォルト）
var chatBoardfontType = 1;
var chatCnt = 1;
// チャットの入力中状態
var chatInputState = false;

$(function () {

	/**
	 * 文字入力中イベント
	 */
	$('#chat_board_send_message').on('input', function(){
		// ユーザ識別用のUUIDを取得する(UUID については、同一者の連続メッセージなのかを判定するために使用する)
		var uuId = sessionStorage.UUID;	// sessionStorge.UUID;
		if( !uuId ) {	// 空
			uuId = UUID.generate();
			sessionStorage.UUID = uuId;
		}
		var user_id = $('#user_id').val();
		var value = $('#chat_board_send_message').val();
		if (value.length > 0) {
			chatInputState = true;
		} else {
			chatInputState = false;
		}

		// メッセージの最後を表示するように、一番下へスクロールする
		showLatestChatMessage();

		var data = {
			command : "CHAT_BOARD",
			type : "SEND_MESSAGE",
			userid : user_id,
			uuid : uuId,
			message : value,
			inputState : chatInputState
		};
		sendCommand(SEND_TARGET_ALL, data);
	});

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
      var user_name = "匿名ユーザー"; //TODO: 今後SP側でもユーザー名入力機能を実装した際は要変更

			var template = createMyTemplate(chatCnt, user_id, uuId);
			$('#chat_board_messages').append(template);

			var value = $('#chat_board_send_message').val();
			console.log("チャットメッセージ DATA["+value+"]");

			// 入力文字をサニタイジングし出力
			var targetId = '.chat_board_right #chat_board_message_text'+chatCnt;
			escape(targetId, value);

			// メッセージの最後を表示するように、一番下へスクロールする
			$('#chat_board_messages').animate({scrollTop: $('#chat_board_messages')[0].scrollHeight}, 'fast');
			// 入力クリア
			$("#chat_board_send_message").val("");

			var message_text = $(targetId).html();
			var chat_message = message_text.split("<br>");
			message_text = "";
			for(var iCnt = 0; iCnt < chat_message.length; iCnt++){
				if(0 > chat_message[iCnt].indexOf("</div>")){
					// リロード時等にnegotiation_syncで名前表示するため、ユーザー名をカスタム属性で埋め込んでおく
					message_text = message_text + '<div class="chat_board_message_text_value"'+ 'data-user-name='+user_name+'">' + chat_message[iCnt] + '</div>';
				}
			}
			chatInputState = false;

			var data = {
				command : "CHAT_BOARD",
				type : "SEND_MESSAGE",
				userid : user_id,
				uuid : uuId,
				username : user_name,
				message : message_text,
				inputState : chatInputState
			};
			sendCommand(SEND_TARGET_ALL, data);

			var messages = sessionStorage.getItem('chat_messages');

			if(messages === null){
				messages = "";
			}
			messages = messages + "[" + user_name + "]" + message_text + "\n";
		
			if(messages !== "[]\n"){
				sessionStorage.setItem('chat_messages', messages);
			}

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

	// httpから始まる文字列は、URLリンク化したいので サニタイジングされるまえによそっておく.
	const MARKING = '@mArKiNg!:'+Math.random().toString()+"@";
	let urlMatch;
	let urlMatches = [];
	const regexp = /https?:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#\u3000-\u30FE\u4E00-\u9FA0\uFF01-\uFFE3]+/g;
	while ((urlMatch = regexp.exec(targetValue))!== null) {
		urlMatches.push(urlMatch[0]);
	}
	urlMatches.map(function(elem, index){
		targetValue = targetValue.replace(elem, MARKING+index);
	})

	// HTMLサニタイジング（HTML文字列を無害化し、改行コードをbrタグに置き換え）
	var esc_str = $('<dummy>').text(targetValue).html().replace(/\r\n|\r|\n/g, '<br>');

	// httpから始まる文字列をリンク化(Html要素化).
	urlMatches.map(function(elem, index){
		esc_str = esc_str.replace(MARKING+index, '<a href="'+elem+'" class="chat_bord_link_in_text" target=”_blank”>'+elem+'</a>');
	})

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

			//入力中の文字がない場合に、入力中表示を削除する
			if (!json.inputState && json.message.length === 0) {
				//入力中の要素行を削除する
				$('.input_state').parents('.chat_board_message').remove();
			}

			if (!json.inputState && json.message.length > 0) {
				var messages = sessionStorage.getItem('chat_messages');
				if(messages === null){
					messages = "";
				}
				messages = messages + "[" + json.username + "]" + json.message + "\n";
				if(messages !== "[]\n"){
					sessionStorage.setItem('chat_messages', messages);
				}
				//通常入力の場合、入力中表示を削除する
				//入力中の要素行を削除する
				$('.input_state').parents('.chat_board_message').remove();
				addTemplate(json.message, chatCnt, json);
				// 文字数に応じて縦幅が変わるため、名前表示位置を調整する
				const text = $('#chat_board_message_text'+chatCnt).find('.chat_board_message_text_value').text();
				if (text.length >= 90) {
					let bottomValue = 90;
					bottomValue = bottomValue + (text.length / 40); // 文字数に応じて増やしていく
					const targetElement = $('#chat_board_message_text'+chatCnt).parents('.chat_board_left_img').find('.other_user_name_in_message_box');
					targetElement.css("bottom", bottomValue+"%");
				}
				chatCnt++;
			} else if (json.inputState && json.message.length > 0) {
				//入力中かつ入力中の文字がある場合、入力中表示を追加する（既に表示されている場合は、追加しない）
				const existInputStateElement = $('.input_state').length;
				if (!existInputStateElement) {
					const inputtingImgElement = '<img id="inputState'+'" src="/img/now_inputting.png">';
					// addTemplate(inputtingImgElement, chatCnt, json);
					addInputtingTemplate(inputtingImgElement, chatCnt, json);
					$('#chat_board_message_text'+chatCnt).addClass('input_state');
				}
			}
		
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

function addInputtingTemplate(message, chatCnt, json) {
	var template = "";
	template += '<div class="chat_board_message">';
	template += '<div class="chat_board_left_img">';
	template += '<div class="chat_board_userimg_left">';
	template += '<div class="chat_board_userimg_wrap_left">';
	template += '<div class="chat_board_userimg_wrap_left_inner">';
	template += '<img id="image'+ chatCnt +'" src="/img/icon_face.png" style="position:absolute; width:100%; height:66%; object-fit:scale-down;">';
	template += '</div></div></div>';
	// 初回(１件のみのメッセージ)
	template += '<div class="chat_board_message_box">';

	template += '<div class="chat_board_message_content">';
	template += '<div id="chat_board_message_text'+ chatCnt + '" class="chat_board_message_text">';
	template += '</div></div></div>';

	template += '</div>';
	template += '</div>';
	template += '<div class="chat_board_clear"></div><!-- 回り込みを解除（スタイルはcssで充てる） -->';

	$('#chat_board_messages').append(template);

	// 入力文字を出力((サニタイジング済み))
//		$('#chat_board_message_text'+chatCnt).text(json.message)
	$('#chat_board_message_text'+chatCnt).html(message);

	// メッセージの最後を表示するように、一番下へスクロールする
	showLatestChatMessage();

	createOthersImage(chatCnt, json.userid, json.uuid);
	$("#chat_board_send_message").focus();
}

var chat_userid = null;
var chat_uuid = null;
var chat_next_cnt = 0;

/**
 * チャットボード タイムライン最下段にテンプレートを追加する関数
 * @argument string message 追加するメッセージ
 * @argument number chatCnt チャットカウント（追加要素のID末尾に付与するもの）
 * @argument json json 送信されたjsonデータ
 */
function addTemplate(message, chatCnt, json) {
	// ユーザー名を取得する
	let user_name = '';
	if (valueCheck(json.from_user_info)) {
		user_name = json.from_user_info;
	} else if (valueCheck(json.from_user_name)) {
		user_name = json.from_user_name;
	} else if (valueCheck(json.username)){
		user_name = json.username;
	} else {
		user_name = DEFAULT_USER_NAME;
	}
	// チャットのメッセージ(相手のメッセージ)
	var template = createOthersTemplate(chatCnt, json.userid, json.uuid, user_name);
	$('#chat_board_messages').append(template);

	// 入力文字を出力((サニタイジング済み))
//		$('#chat_board_message_text'+chatCnt).text(json.message)
	$('#chat_board_message_text'+chatCnt).html(message.trim());

	// メッセージの最後を表示するように、一番下へスクロールする
	showLatestChatMessage();

	createOthersImage(chatCnt, json.userid, json.uuid);
	$("#chat_board_send_message").focus();
}


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
function createOthersTemplate(chatCnt, userid, uuid, userName) {

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
		message += '<div class="other_user_name_in_message_box">' + userName + '</div>';
		message += '<div class="chat_board_message_box">';
	}
	else {
		// 連続２件目以降
		message += '<div class="chat_board_left sp">';
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

