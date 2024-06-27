//////////////////////////////////////////////////////////
// 送信メソッド
//////////////////////////////////////////////////////////

// コマンド送信（通常のコマンド）
// 引数1：target_peer_id
//        送信先のピアIDあり：指定してピアIDにのみ送る
//        null：すべての接続先に送る
// 引数2：data
//        json型のコマンド
function sendCommand(target_peer_id, data) {
	return mNegotiationMain.sendCommand(
		target_peer_id, 
		data
	);
}

// コマンド送信（通常のコマンド）
// 引数1：target_user_id
//        指定してユーザーIDにのみ送る。
//        見つからない場合は送らない。
// 引数2：data
//        json型のコマンド
function sendCommandByUserId(target_user_id, data) {
	return mNegotiationMain.sendCommandByUserId(
		target_user_id, 
		data
	);
}

//////////////////////////////////////////////////////////
// Meetinのシステムコマンド
//////////////////////////////////////////////////////////

// 相手の状態を要求する
function sendRequestSystemInfoDetail(target_peer_id) {
	return mNegotiationMain.sendRequestSystemInfoDetail(
		target_peer_id
	);
};

// 相手の状態を要求する
function sendRequestSystemInfoDetailByUserId(target_user_id) {
	return mNegotiationMain.sendRequestSystemInfoDetailByUserId(
		target_user_id
	);
};

// 自分の状態を相手に送る
function sendSystemInfoDetail(target_peer_id) {
	return mNegotiationMain.sendSystemInfoDetail(
		target_peer_id
	);
};

// 自分の状態を相手に送る
function sendSystemInfoDetailByUserId(target_user_id) {
	return mNegotiationMain.sendSystemInfoDetailByUserId(
		target_user_id
	);
};

// 相手のメディアストリーム（映像）を要求する
function sendRequestVideoStream(
	target_user_id,
	target_peer_id,
	peer_id
	) {
	return mNegotiationMain.sendRequestVideoStream(
		target_user_id,
		target_peer_id,
		peer_id
	);
};

// 相手のメディアストリーム（映像）を要求する
function sendRequestVideoStreamByUserId(
	target_user_id,
	peer_id
	) {
	return mNegotiationMain.sendRequestVideoStreamByUserId(
		target_user_id,
		peer_id
	);
};

// 相手のメディアストリーム（マイク）を要求する
function sendRequestAudioStream(
	target_user_id,
	target_peer_id,
	peer_id
	) {
	return mNegotiationMain.sendRequestAudioStream(
		target_user_id,
		target_peer_id,
		peer_id
	);
};

// 相手のメディアストリーム（マイク）を要求する
function sendRequestAudioStreamByUserId(
	target_user_id,
	peer_id
	) {
	return mNegotiationMain.sendRequestAudioStreamByUserId(
		target_user_id,
		peer_id
	);
};

// 相手のメディアストリーム（画面共有）を要求する
function sendRequestScreenStream(
	target_user_id,
	target_peer_id,
	peer_id
	) {
	return mNegotiationMain.sendRequestScreenStream(
		target_user_id,
		target_peer_id,
		peer_id
	);
};

// 相手のメディアストリーム（画面共有）を要求する
function sendRequestScreenStreamByUserId(
	target_user_id,
	peer_id
	) {
	return mNegotiationMain.sendRequestScreenStreamByUserId(
		target_user_id,
		peer_id
	);
};

// チャットルームを退室したことををすべての接続先に伝える
function sendExitRoom() {
	return mNegotiationMain.sendExitRoom();
}

//////////////////////////////////////////////////////////
// システム状態関連
//////////////////////////////////////////////////////////

// 自分のフォーカスがMeetinに戻ったことをすべての接続先に伝える
function sendTabIsFocus() {
	var data = {
		command : "TAB_IS_FOCUS"
	};
	return sendCommand(null, data);
}

// 自分のフォーカスがMeetinから離れたことをすべての接続先に伝える
function sendTabIsBlur() {
	var data = {
		command : "TAB_IS_BLUR"
	};
	return sendCommand(null, data);
}

// 全員のページ遷移日時を要求する
function sendRequestEnterNegotiationDatetime(
	) {
	var data = {
		command : "REQUEST_ENTER_NEGOTIATION_DATETIME",
	};
	return sendCommand(null, data);
}

// 自分のページ遷移日時を送る
function sendEnterNegotiationDatetime(
	target_peer_id
	) {
	var enter_negotiation_datetime = $('#enter_negotiation_datetime').val();
	
	var data = {
		command : "ENTER_NEGOTIATION_DATETIME",
		enter_negotiation_datetime : enter_negotiation_datetime
	};
	return sendCommand(target_peer_id, data);
}

//////////////////////////////////////////////////////////
// カメラ関連
//////////////////////////////////////////////////////////

function sendRequestFlashReEnterRoomByUserId(
	target_user_id
	) {
	var data = {
		command : "REQUEST_FLASH_RE_ENTER_ROOM"
	};
	return sendCommandByUserId(target_user_id, data);
};

//////////////////////////////////////////////////////////
// マイク関連
//////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////
// 画面共有関連
//////////////////////////////////////////////////////////

// すべての接続先に画面共有対象選択ダイアログを閉じるコマンドを送る
function sendRequestCloseScreenChooseDialog() {
	var data = {
		command : "REQUEST_CLOSE_SCREEN_CHOOSE_DIALOG"
	};
	return sendCommand(null, data);
}

// 接続先に画像書き込み完了のコマンドを送る
function sendRequestScreenWriteFinished() {
	var data = {
		command : "REQUEST_WRITE_FINISHED"
	};
	return sendCommand(null, data);
}

// 接続先に画像読み込み完了のコマンドを送る
function sendRequestScreenReadFinished(target_peer_id) {
	var data = {
		command : "REQUEST_READ_FINISHED"
	};
	return sendCommand(target_peer_id, data);
}

//////////////////////////////////////////////////////////
//function sendRequestTargetAll(list) {
//	var data = {
//		command : "SEND_TARGET_ALL"
//		,target_list : list
//	};
//	return sendCommand(null, data);
//}

function sendRequestTargetAll(target_peer_id) {
	var user_id = $('#user_id').val();

	var data = {
		command : "SEND_TARGET_ALL",
		req_staff_type : $("#target_video_staff_type_" + user_id).val(),
		req_staff_id : $("#target_video_staff_id_" + user_id).val(),
		req_client_id : $("#target_video_client_id_" + user_id).val()
	};
	return sendCommand(target_peer_id, data);
}

//////////////////////////////////////////////////////////
// 接続関連
//////////////////////////////////////////////////////////

// 接続先に商談中画面への遷移を許可するコマンドを送信
function sendRequestChangeToNegotiation(target_peer_id, user_id) {
	var connection_info_id = $('#connection_info_id').val();
	var connect_no = $('#connect_no').val();
	var client_id = $('#client_id').val();
	
	var data = {
		command : "REQUEST_CHANGE_TO_NEGOTIATION",
		connection_info_id : connection_info_id,
		connect_no : connect_no,
		client_id : client_id,
		without_dialog : true,
		is_operator : 0,
		screen_type : 0,
		user_id : user_id,
		page : "negotiation",
		browser : USER_PARAM_BROWSER
	};
	
	return sendCommand(target_peer_id, data);
};

// 接続先に商談中画面への遷移を拒否するコマンドを送信
function sendRefuseChangeToNegotiation(target_peer_id, error_code, error_message) {
	var connection_info_id = $('#connection_info_id').val();
	
	var data = {
		command : "REFUSE_CHANGE_TO_NEGOTIATION",
		connection_info_id : connection_info_id,
		error_code : error_code,
		error_message : error_message
	};
	
	return sendCommand(target_peer_id, data);
};

// すべての接続先に商談終了コマンドを送る
function sendNegotiationFinishProcess() {
	var user_info = $('#my_user_info').val();
	
	var data = {
		command : "NEGOTIATION_FINISH_PROCESS",
		user_info : user_info
	};
	return sendCommand(null, data);
}

function sendReconnectStart() {
	var data = {
		command : "RECONNECT_START",
// 接続要求元情報
		req_staff_type : $('#staff_type').val(),
		req_staff_id : $('#staff_id').val(),
		req_client_id : $('#client_id').val()
	};
	return sendCommand(null, data);
}

// すべての接続先に(商談画面中)ログイン通知コマンドを送る
function sendLogin() {

	var user_id = $('#user_id').val();
	$("#target_video_staff_type_" + user_id).val($('#staff_type').val());
	$("#target_video_staff_id_" + user_id).val($('#staff_id').val());
	$("#target_video_client_id_" + user_id).val($('#client_id').val());

	var data = {
		command : "SEND_LOGIN",
		req_staff_type : $('#staff_type').val(),
		req_staff_id : $('#staff_id').val(),
		req_client_id : $('#client_id').val()
	};
	return sendCommand(null, data);
}

// すべての接続先にルームロック通知コマンドを送る
// false:アンロック
// true:ロック
function sendLock(mRoomLocked) {
	var data = {
		command : "SEND_LOCK",
		room_locked : mRoomLocked
	};
	return sendCommand(null, data);
}
function sendEnterLockedRoomResult(locked_token) {
	var data = {
		command : "SEND_ENTER_LOCKED_ROOM_RESULT",
		locked_token : locked_token
	};
	return sendCommand(null, data);
}

//////////////////////////////////////////////////////////
// ビデオフレーム関連
//////////////////////////////////////////////////////////

// プロフィール画像を要求
function sendRequestProfileImage(target_peer_id) {
	var data = {
		command : "REQUEST_PROFILE_IMAGE"
	};
	return sendCommand(target_peer_id, data);
};

// プロフィール画像を送る
function sendProfileImage(target_peer_id) {
	var userId = $('#user_id').val();
	var profile_image = $('#video_background_image').val();
	
	var data = {
		command : "PROFILE_IMAGE",
		profile_image : profile_image
	};
	return sendCommand(target_peer_id, data);
};

//////////////////////////////////////////////////////////
// 共有メモ関連
//////////////////////////////////////////////////////////



//////////////////////////////////////////////////////////
// ホワイトボード関連
//////////////////////////////////////////////////////////



//////////////////////////////////////////////////////////
// 資料共有関連
//////////////////////////////////////////////////////////


