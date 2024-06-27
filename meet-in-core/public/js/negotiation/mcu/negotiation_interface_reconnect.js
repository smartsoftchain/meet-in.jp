var mReconnectBeginDialogId = null;

// 再接続開始時のコールバック
function onReconnectBegin() {
	closeReconnectBeginDialog();
	
	var title = '再接続';

	var message = '再接続中です';
	
	mReconnectBeginDialogId = createCommonDialog(
		title, 
		message, 
		true, 
		false, 
		false, 
		null,
		null,
		null,
		false,
		false
	);
}

// 再接続中ダイアログを閉じる
function closeReconnectBeginDialog() {
	if (mReconnectBeginDialogId && mReconnectBeginDialogId.length > 0) {
		$('#' + mReconnectBeginDialogId).dialog("close");
	}
	
	mReconnectBeginDialogId = null;
}

// 再入室ダイアログ
function showIsReEnterDialog() {
	var title = '再接続';
	var message = '再接続しますか？';
	var buttonNameAndFunctionArray = {};
	buttonNameAndFunctionArray["はい"] = function() {
		negotiationMainReconnect();
	};
	buttonNameAndFunctionArray["いいえ"] = function() {
	};
	createModalDialogWithButtonFunction(
		title, 
		message, 
		buttonNameAndFunctionArray
	);
}