function initMenu() {
//	initUnexpireConnectionInfoTable();
}

function connectNoPublish(peer_id) {
	var successCallback = function(data, textStatus, XMLHttpRequest) {
		if ("1" == data.result) {
			var connect_no_original = data.connection_info.connect_no;
			connect_no = connect_no_original.substring(0, 3) + '-' + connect_no_original.substring(3, 7) + '-' + connect_no_original.substring(7, 11);
			
			$('#connection_info_not_published').hide();
			$('#connection_info_published').show();
			$('#connection_info_id_menu').val(data.connection_info.id);
			
			$('#connect_no_menu').html(connect_no);
			//番号通知用のメールリンクにメールリンクに設定
			var mailname = $(".mail_to_username").attr("data-mail-name");
			$(".mail_to_btn").attr("data-mailtext","mailto:?subject=Sc招待のお知らせ&body=こんにちは。%0d%0a%0d%0a"+mailname+"さんからSCへ招待のご連絡です。%0d%0a【SC番号】%0d%0a"+ connect_no +"%0d%0a%0d%0a【SC接続方法】%0d%0a1）下記のURLよりmeet in公式サイトに移動します。%0d%0ahttps://online.sales-crowd.jp%0d%0a2）SC番号入力フォームに、上記SC番号と自分の名前（任意）を入力します。%0d%0a3）入力後、「接続」ボタンをクリックしてください。%0d%0a%0d%0a以上、今後ともよろしくお願い申し上げます。%0d%0a%0d%0aSC運営事務局%0d%0ahttps://online.sales-crowd.jp%0d%0a");
			
//			initUnexpireConnectionInfoTable();
		} else if ("2" == data.result){
			alert(data.error);
		} else {
			alert(data.error);
		}
	};

	var errorCallback = function(XMLHttpRequest, textStatus, errorThrown, errorMessage) {
//		alert(errorMessage);
//		alert(XMLHttpRequest);
//		alert(textStatus);
//		alert(errorThrown);
	};

	var completeCallback = function(XMLHttpRequest, textStatus) {
	};

	var client_id = $('#client_id').val();
	var staff_type = $('#staff_type').val();
	var staff_id = $('#staff_id').val();
	
	createNewConnectionInfo(
		peer_id,
		null,
		client_id,
		staff_type,
		staff_id,
		null,
		successCallback,
		errorCallback, 
		completeCallback
		);
}

function createNewConnectionInfoMenu(peer_id) {
	connectNoPublish(peer_id);
}

// 接続ナンバーを発行する
$('#connect_no_publish').click(function(){
	mCanCreateConnectNo = true;
	var client_id = $('#client_id').val();

	// クライアントが選択されていないなら、エラー
	if (!client_id || client_id == "0") {
		alert("クライアントを選択して下さい。");
		return;
	}
	
	var connect_no_publish_btn = $(this).html();
	$(this).html("");
	$(this).html("<div class='lodingimg_efect_wrap connection_number_loding'><div class='lodingimg_efect'></div></div>");

//	closeConnection(true);
	
	var peerId = mMeetinWebSocket.getPeerId();
	if (mMeetinConnection) {
		peerId = mMeetinConnection.getPeerDataId();
	}
	
	if (peerId && peerId.length > 0) {
		createNewConnectionInfoMenu(peerId);
		$(this).html(connect_no_publish_btn);
	}
});

// 再発行
$('#connect_no_republish').click(function(){
//	closeConnection(true);

	createNewConnectionInfoMenu(mMeetinWebSocket.getPeerId());
});

$('#show_unexpire_connection_info').click(function(){
	initUnexpireConnectionInfoTable();
});

$('#show_unexpire_connection_info_2').click(function(){
	initUnexpireConnectionInfoTable();
});

function initUnexpireConnectionInfoTable() {
	var successCallback = function(data, textStatus, XMLHttpRequest) {
		if ("1" == data.result) {
			$('#unexpire_connection_info_table').empty();
			
			var text = "";
			for (var i = 0; i < data.connection_info_list.length; ++i) {
				var connection_info = data.connection_info_list[i];
				text += connection_info.connect_no + "\n";
			}
			
			if (text.length > 0) {
				alert(text);
			}
		} else {
//			alert(data.error);
		}
	};

	var errorCallback = function(XMLHttpRequest, textStatus, errorThrown, errorMessage) {
//		alert(errorMessage);
//		alert(XMLHttpRequest);
//		alert(textStatus);
//		alert(errorThrown);
	};

	var completeCallback = function(XMLHttpRequest, textStatus) {
	};

	var clientId = $('#client_id').val();
	var staffType = $('#staff_type').val();
	var staffId = $('#staff_id').val();

	getUnexpireConnectionInfoList(
				clientId,
				staffType,
				staffId,
				successCallback, 
				errorCallback, 
				completeCallback
				);
}
