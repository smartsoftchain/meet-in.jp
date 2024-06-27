/*
 * チャットに使用するJS群
 *
 */
// チャットの文字サイズ（デフォルト）
var chatBoardfontType = 1;
var chatCnt = 1;

$(function () {

	// チャットの領域を移動できるようにイベント処理を追加
	// ※本設定は画面表示時に読み込まれjQuery UIの初期化で使用される(draggableはチャット領域を移動させるのに必要！)
	$("#chat_board_area").draggable({
		containment: "#mi_video_area",
		scroll: false,
		drag : function(event, ui) {
			var data = {
					command : "CHAT_BOARD",		// "CHAT_BOARD",
					type : "MOVE_CHAT_BOARD",	// "MOVE_CHAT_BOARD",
					top : $(this).css("top"),
					left : $(this).css("left")
			};
			sendCommand(SEND_TARGET_ALL, data);
		}
	});

	// チャットのリサイズ処理
	// ※本設定は画面表示時に読み込まれjQuery UIの初期化で使用される(resizableはチャット領域をリサイズさせるのに必要！)
	$("div#chat_board_area").resizable({
		minHeight: 180,
		minWidth: 180,
		containment : "#mi_video_area",
		handles: "se",
		resize: function() {
			// サイズが変更されている場合
			var data = {
				command : "CHAT_BOARD",
				type : "CHANGE_CHAT_BOARD_SIZE",
				height : $(this).css('height'),
				width : $(this).css("width")
			};
			sendCommand(SEND_TARGET_ALL, data);
		}
	});

	// 	// カードル位置を取得
	// 	var p = $(this).get(0).selectionStart;
	// 	var np = p + $(this).length;
	// 	//console.log(np);

	// 	// スクロール位置を取得
	// 	var scrollHeight = $("textarea.share_memo_text").scrollTop();
	// 	//console.log(scrollHeight);

	// 	var data = {
	// 			command : "SHARE_MEMO",
	// 			type : "SEND_MESSAGE",
	// 			message : $(this).val(),
	// 			focusPosition : np,
	// 			scrollHeight : scrollHeight
	// 	};
	// 	sendCommand(SEND_TARGET_ALL, data);
	// });

	// 文字送信イベント(エンター)
	$('#chat_board_send_message' ).keypress( function ( e ) {
		if ( e.which == 13 ) {	// エンターキー
			if (e.shiftKey) { // Shiftキーも押された
				$.noop();
				return;	// そのまま改行し続行
			}
			if($('#select_sendMode_checkbox').prop('checked')){
				// ここに処理を記述
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

					// 一番下までスクロールする
					var timeline = $(".chat_board_timeline").height();
					var message = $(".chat_board_messages").height();
					if( timeline < message ) {
						if( !$('#chat_board_messages').hasClass('chat_board_messages_scroll') ) {
							$('#chat_board_messages').addClass('chat_board_messages_scroll');
							$('#chat_board_messages').removeClass('chat_board_messages');
						}
					}
					$('.chat_board_timeline').animate({scrollTop: $('.chat_board_timeline')[0].scrollHeight}, 'fast');

					// 入力クリア
					$("#chat_board_send_message").val("");

					let icon_img = captureLocalStream();
					if (NEGOTIATION.isMyCameraOn == false) {
						icon_img = null;
					}

					var message_text = $('#chat_board_message_text'+chatCnt).html();
					var data = {
						command : "CHAT_BOARD",
						type : "SEND_MESSAGE",
						userid : user_id,
						uuid : uuId,
						message : message_text,
						icon_img: icon_img,
					};
					sendCommand(SEND_TARGET_ALL, data);

					registChatMessage(user_id, uuId, message_text);

					chatCnt++;
				} // if_End

				return false;	// falseを返すことでイベントの引継ぎは中断される。
			}else{
				alert('「Enterで送信」にチェックを入れてください');
			}
		}
	});

	// 文字送信イベント(ボタン)
	$('#chat_board_send').click( function ( e ) {
			// ここに処理を記述
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

				// 一番下までスクロールする
				var timeline = $(".chat_board_timeline").height();
				var message = $(".chat_board_messages").height();
				if( timeline < message ) {
					if( !$('#chat_board_messages').hasClass('chat_board_messages_scroll') ) {
						$('#chat_board_messages').addClass('chat_board_messages_scroll');
						$('#chat_board_messages').removeClass('chat_board_messages');
					}
				}
				$('.chat_board_timeline').animate({scrollTop: $('.chat_board_timeline')[0].scrollHeight}, 'fast');

				// 入力クリア
				$("#chat_board_send_message").val("");
				let icon_img = captureLocalStream();
				if (NEGOTIATION.isMyCameraOn == false) {
					icon_img = null;
				}
				var message_text = $('#chat_board_message_text'+chatCnt).html();
				var data = {
					command : "CHAT_BOARD",
					type : "SEND_MESSAGE",
					userid : user_id,
					uuid : uuId,
					message : message_text,
					icon_img: icon_img,
				};
				sendCommand(SEND_TARGET_ALL, data);

				registChatMessage(user_id, uuId, message_text);

				chatCnt++;

			return false;	// falseを返すことでイベントの引継ぎは中断される。
		}
	});

	// 閉じるボタン押下時のイベント処理
	$(document).on('click', '.chat_board_close', function(){
		$("#chat_board_area").toggle();
		var data = {
				command : "CHAT_BOARD",
				type : "TOGGLE_CHAT_BOARD",
				display : $("#chat_board_area").css('display')
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
		// チャットのメッセージ(相手のメッセージ)
		var template = createOthersTemplate(chatCnt, json.userid, json.uuid);
		$('#chat_board_messages').append(template);

		// 入力文字を出力((サニタイジング済み))
//		$('#chat_board_message_text'+chatCnt).text(json.message)
		$('#chat_board_message_text'+chatCnt).html(json.message)

		// 一番下までスクロールする
		var timeline = $(".chat_board_timeline").height();
		var message = $(".chat_board_messages").height();
		if( timeline < message ) {
			if( !$('#chat_board_messages').hasClass('chat_board_messages_scroll') ) {
				$('#chat_board_messages').addClass('chat_board_messages_scroll');
				$('#chat_board_messages').removeClass('chat_board_messages');
			}
		}
		$('.chat_board_timeline').animate({scrollTop: $('.chat_board_timeline')[0].scrollHeight}, 'fast');

		createOthersImage(chatCnt, json.userid, json.uuid, json.icon_img);
		$("#chat_board_send_message").focus();
		chatCnt++;
	}
	else if(json.type == "MOVE_CHAT_BOARD"){
		// 共有メモの移動
		$("#chat_board_area").css("top", json.top);
		$("#chat_board_area").css("left", json.left);
	}
	else if(json.type == "CHANGE_CHAT_BOARD_SIZE"){
		// 表示領域の縮尺（DIV）
		$('div#chat_board_area').css("height", json.height);
		$('div#chat_board_area').css("width", json.width);
	}
	else if(json.type == "CHANGE_TEXTAREA_SIZE"){
		// 表示領域の縮尺（TEXTAREA）
		$('#chat_board_area').css("height", json.height);
		$('#chat_board_area').css("width", json.width);
	}
	else if(json.type == "TOGGLE_CHAT_BOARD"){
		// 共有メモの表示非表示切替
		if(json.display == "table" || json.display ==  "block"){
			$("#chat_board_area").show();
		}
		else{
			$("#chat_board_area").hide();
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
	message += '<div class="chat_board_message">';
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
	message += '<div class="chat_board_message_content">';
	message += '<div id="chat_board_message_text'+ chatCnt +'" class="chat_board_message_text">';
	message += '</div></div></div>';

	message += '</div></div>';
	message += '<div class="chat_board_clear"></div><!-- 回り込みを解除（スタイルはcssで充てる） -->';
	return message;
}

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
	message += '<div class="chat_board_message">';

	if( chat_next_cnt == 0 ) {
		message += '<div class="chat_board_left_img">';
		message += '<div class="chat_board_userimg_left">';
		message += '<div class="chat_board_userimg_wrap_left">';
		message += '<div class="chat_board_userimg_wrap_left_inner">';
		message += '<img id="image'+ chatCnt +'" src="/img/icon_face.png" style="position:absolute; width:100%; height:66%; object-fit:scale-down;">';
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
	message += '<div class="chat_board_message_content">';
	message += '<div id="chat_board_message_text'+ chatCnt + '" class="chat_board_message_text">';
	message += '</div></div></div>';

	message += '</div>';
	message += '</div>';
	message += '<div class="chat_board_clear"></div><!-- 回り込みを解除（スタイルはcssで充てる） -->';
	return message;
}

function createOthersImage(chatCnt, userid, uuid, icon_img) {
	tmp = $('#image'+chatCnt);
//	MCU
//	var video = $("div#negotiation_target_video_"+userid).find('#video_target_video_'+userid).get(0);
//	var video = document.getElementById('local_video');
//		if (canvas) {
//			canvas.width = video.videoWidth;
//			canvas.height = video.videoHeight;
	try {
		if(icon_img == null || (!tmp) ){// イメージが取れないときにこうなるので、デフォアイコンをセット
			tmp.attr('src','/img/icon_face.png');
		}else{
			tmp.attr('src', icon_img);
		}
	}
	catch (exception) {
		console.log("createOthersImage エラー内容："　+ error);
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

