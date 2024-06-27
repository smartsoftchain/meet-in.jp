////////////////////////////////////////////////////////////////
// ログインダイアログ
////////////////////////////////////////////////////////////////
//	ユーザーメニューのログインボタンクリック
$(".login_dialog_open").click(function(){
	// エラーメッセージクリアして非表示にする
	$("#alert_login").text("");
	$("#alert_login").hide();

	$("#setting-login-dialog").dialog(
	{
		modal: true,
		draggable: false,
		resizable: false,
		closeOnEscape: true,
		position: { my: "center", at: "center", of: window },
		show: false,
		hide: false,
		width: 374,
		height:232,
		open: function() {
			$(this).dialog('widget')
			.removeClass('ui-corner-all')
			.css('background','white')
			.css('border-radius','6px')

			$("#setting-login-dialog").height(225);
		}
	});
	$('.ui-widget-overlay').addClass('setting-login-dialog-overlay');
	$('.ui-dialog-titlebar').hide();
});

// キャンセルボタンクリック
$(document).on('click', '[id=setting-login-dialog-cancel-button]', function(){
	$("#setting-login-dialog").dialog("close");
});
// モーダルダイアログのログインボタンクリック
$(document).on('click', '[id=setting-login-dialog-enter-button]', function(){
	var id = $("#login_user_id").val();
	var password = $("#login_user_password").val();

	var autologin = "0";
	if( $("#autologin").prop("checked") ) {
		autologin = $("#autologin").val();
	}

	var connection_info_id = $('#connection_info_id').val();
	var user_id = $('#user_id').val();
	//ログイン
	var jqxhr = $.ajax({
			type: "POST",
			url: "https://" + location.host + "/index/do-login",
			data: {
					"id": id,
					"password" : password,
					"connection_info_id" : connection_info_id,
					"user_id" : user_id,
					"autologin" : autologin
			}
	})
	.done(function(data, status, xhr) {
		var parsed = JSON.parse(data);
		var result = parsed["result"];
		if(result == 1){
			//認証OK

			// クッキー変更
			$.cookie("staff_type" ,parsed["staff_type"] ,{path: '/'});
			$.cookie("staff_id" ,parsed["staff_id"] ,{path: '/'});
			$.cookie("client_id" ,parsed["client_id"] ,{path: '/'});

			//　隠しタグへの設定
			$('#staff_type').val(parsed["staff_type"]);
			$('#staff_id').val(parsed["staff_id"]);
			$('#client_id').val(parsed["client_id"]);

			$('#operator_name').val(parsed["staff_name"]);
			$('#client_name').val(parsed["client_name"]);
			$('#my_user_info').val(parsed["staff_name"]);
			$('#desktop_notify_flg').val(parsed["desktop_notify_flg"]);

			// ユーザー一覧の自分の名前更新
			var user_id = $('#user_id').val();
			var video_list = $('#video_list_' + user_id);
			video_list.find('.user_name').text(parsed["staff_name"]);

			//＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊
			//　ログインのタイミングで自分の名前をマネージャーに設定しておく
			//＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊
			mNegotiationMain.setUserInfo($('#my_user_info').val());
			sendSystemInfoDetail(null);

			// session情報更新
			var params = {
				connection_info_id: $('#connection_info_id').val(),
				user_id: $('#user_id').val(),
				user_info: $('#my_user_info').val()
			};
			saveWebRtcParam(params, null, null, null);

			//＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊
			//　ログインのタイミングで接続開始を呼び出す（終了時例外対策）
			//＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊
			var connection_info_id = $("#connection_info_id").val();
			startConnectionInfo(
				connection_info_id,
				null,
				null,
				null
			);

			//ログインボタンを非表示にして、クライアント選択リストを表示する
			$("#button_username").show();
			$("#button_login").hide();
			$("#modal-content-login").hide();

			var idChar = parsed["idChar"];
			if(idChar === 'AA'){
				//続けてクライアント選択
				$('.client_dialog_open').trigger("click");
			}
			else {
				$("#header_clientname").text(parsed["client_name"]);
				// クライアント選択メニューを削除
				$("#button_username").find('.mi_select_option').remove();
				$("#button_username").find("span").remove();

				// ログイン情報を設定し全の接続先へ送信する
				// #target_video_staff_type_n / #target_video_staff_id_n / target_video_client_id_n (n=#user_id) を設定
				// #user_id / #client_id / #staff_type / #staff_id
				sendLogin();

				// 名刺表示
				// ユーザタイプが存在したらログインとし名刺表示メニューを表示する
				var user_id = $("#user_id").val();
				if( $("#target_video_staff_type_" + user_id).val() ) {
					$("#video_target_icon_" + user_id).find('.video_card_icon').show();	// 名刺アイコン表示
					// 録画ボタン表示
					// $("#button_record").css('visibility', 'visible');
					$("#button_record").css('display', '');
					// Lockボタン表示
					$("#lock_button").css('visibility', 'visible');
				}

				/**************
				 * サイドメニュー
				 **************/
				 $("#show_material_modal").show();
				 $("#button_secret_memo").show();

				//表示中の資料を消す
				var doc_count = $(".mi_document_icon").length;
				var documents = jQuery.extend(true, {}, $(".mi_document_icon"));
				for(var i=0; i < doc_count; i++){
					hideAndRremoveMaterial(documents[i].id);
				}

				$("#modal-content-client").hide();

				//////////////////////////////////////////
				//ログイン後の初期設定
				NEGOTIATION.isOperator = true;
				$('#is_operator').val(1);

				// ========================================================
				// シークレットメモの同期処理を行うための処理
				// ========================================================
				var secretMemo = sessionStorage.getItem("secretMemo");
				if(secretMemo){
					// ストレージにデータが存在すれば設定する
					$("textarea.secret_memo_text").val(secretMemo);
				}
				/****************************************/

				// SMSテンプレートの設定
				sendMessage = getMessageTemplate();
			}
			$("#setting-login-dialog").dialog("close");
		} else {
			//認証NG
			//エラーメッセージ表示
			var errmsg = geterr("error",parsed);
			$("#alert_login").text(errmsg);
			$("#alert_login").show();
		}

	})
	.fail(function(xhr, status, error) {
	//ajax error
	$("#alert_login").text(error);
	$("#alert_login").show();

	})
	.always(function(arg1, status, arg2) {
	//なにもしない
	});
});

// エラーメッセージ取得用
function geterr(inkey,indata){
	//json配列を最後まで辿って文字列を返す
	var val = indata[inkey];
	for(key in indata[inkey]){
		//alert(key);
		if(key == 0){
			break;
		}
		return geterr(key,indata[inkey]);
	}
	return val;
}
