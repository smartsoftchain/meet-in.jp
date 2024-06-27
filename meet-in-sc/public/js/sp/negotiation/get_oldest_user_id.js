var mGetOldestUserId_UserIdAndDatetimeArray = {};
var mGetOldestUserId_IsChecking = false;
var mGetOldestUserId_SuccessCallback = null;

/**
 * 本メソッドは、mUserIdAndUserInfoArray を基に
 * 情報を収集するため、mUserIdAndUserInfoArrayの設定が終わってから実施すること
 * ※mUserIdAndUserInfoArray は各接続先の [SYSTEM_INFO_DETAIL]受信時に設定される
 * よって、本メソッドの呼び出し元のnegotiation_syncにて待ち合わせを行っている。
 * (initSync())
*/
function getOldestUserId(successCallback) {
	if (mGetOldestUserId_IsChecking) {
		return false;
	}
	
	var user_id = $('#user_id').val();

	// getTotalTargetPeerData()だと接続中に再接続を行った場合、カウントが合わなくなる為
	// mUserIdAndUserInfoArray 情報数により判定する
	var connectionUserCount = 0;
	connectionUserCount = Object.keys(mUserIdAndUserInfoArray).length;
	if (connectionUserCount < 1) {
		// 通常このルートはありえない!!
		if (successCallback && typeof successCallback === "function") {
//console.log("getOldestUserId1 USER_ID("+ user_id +")");
			successCallback(user_id);
		}
	}
	else {
		// 全ユーザへREQUEST_OLDEST_USER_IDコマンドを送信
		// sendRequestOldestUserId()の戻り値は現状trueしかありえない。(おそらく修正漏れだと思われる)
		// 現状のままだと、REQUEST_OLDEST_USER_ID 要求が出されていない場合同期処理が行われない可能性がある。
		var send_target_array = sendRequestOldestUserId();

		// 要求(REQUEST_OLDEST_USER_ID)を複数のユーザ(1人以上)へ要求した場合 
		// ユーザ入室時間情報を初期化
		mGetOldestUserId_UserIdAndDatetimeArray = {};
		mGetOldestUserId_IsChecking = true;
		mGetOldestUserId_SuccessCallback = successCallback;

		// mUserIdAndUserInfoArray 分 mGetOldestUserId_UserIdAndDatetimeArray情報を作成し設定する
		for (var key in mUserIdAndUserInfoArray) {
//console.log("getOldestUserId2");
			mGetOldestUserId_UserIdAndDatetimeArray[key] = null;
		}
	}
	return true;
}

// メッセージがきたときに、入室が一番古いユーザーのIDが要求されたか調べる
function checkGetOldestUserIdMessage(json) {
	if (json.command === "REQUEST_OLDEST_USER_ID") {
		// 入室が一番古いユーザーのIDを要求に対して、自分の入室時間を要求元へ返す
		sendUserIdForGetOldestUserId(json);
	}
	else if (json.command === "USER_ID_FOR_GET_OLDEST_USER_ID") {
		// 入室時間要求に対する応答を登録
		procUserIdForGetOldestUserId(json);
	}
}

/**
 * 入室時刻要求
 * ※target_peer_id がnullの場合は全員へ送信(戻り値は、送信したpeer_idのリストが返ってくる)
 */
function sendRequestOldestUserId() {
	var data = {
		command : "REQUEST_OLDEST_USER_ID"
	};
	return sendCommand(null, data);
}

/**
 * 自分の入室時間を要求元へ返す
 * @param {*} json 
 */
function sendUserIdForGetOldestUserId(json) {
	var enter_negotiation_datetime = $('#enter_negotiation_datetime').val();
	
	var data = {
		command : "USER_ID_FOR_GET_OLDEST_USER_ID",
		enter_negotiation_datetime : enter_negotiation_datetime
	};
	return sendCommand(json.from_peer_id, data);
}

/**
 * ユーザID取得
 * USER_ID_FOR_GET_OLDEST_USER_ID応答が返ってきて入室時間が過去の場合、同期ユーザとしてユーザIDを設定し
 * コールバック関数を呼び出す
 * ※ただし入室が30秒前の入室者がいない場合は同時入室として同期は不要な為、自分のIDを返す)
 * @param {*} json 
 */
function procUserIdForGetOldestUserId(json) {
	mGetOldestUserId_UserIdAndDatetimeArray[json.from_user_id] = json;
//console.log("procUserIdForGetOldestUserId:from_user_id("+json.from_user_id+")");

	var getFinish = true;
	for (var key in mGetOldestUserId_UserIdAndDatetimeArray) {
		// まだ埋まっていないので受け取っていない相手がいる
//console.log("procUserIdForGetOldestUserId3");
		if (!mGetOldestUserId_UserIdAndDatetimeArray[key]) {
			getFinish = false;
			break;
		}
	}

	var user_id = $('#user_id').val();	// 初期値(自分のユーザID)

	// 自分の入室時間(30秒前:30秒以内は同時入室のため同期不要)
	var timestamp = new Date().getTime();
	var enter_negotiation_datetime = $('#enter_negotiation_datetime').val();
	if( !enter_negotiation_datetime ) {
		var dt = new Date(enter_negotiation_datetime);
		dt.setSeconds(dt.getSeconds() - 30);	// 30秒前
		timestamp = dt.getTime();
	}

	// 受け取った相手の入室日時
	var timestampWork = new Date(json.enter_negotiation_datetime).getTime();

//console.log("procUserIdForGetOldestUserId USER_ID("+ user_id +")/user_id("+json.from_user_id+")");
//console.log("procUserIdForGetOldestUserId timestampWork("+ timestampWork +")<=timestamp("+timestamp+")");
	if (timestampWork <= timestamp) {
		user_id = json.from_user_id;

//console.log("procUserIdForGetOldestUserId4 USER_ID("+ user_id +")");
		// ユーザ入室時間情報クリア
		mGetOldestUserId_UserIdAndDatetimeArray = {};
		mGetOldestUserId_IsChecking = false;
		if (mGetOldestUserId_SuccessCallback && typeof mGetOldestUserId_SuccessCallback === "function") {
			mGetOldestUserId_SuccessCallback(user_id);
		}
		// コールバッククリア
		mGetOldestUserId_SuccessCallback = null;
	}
	else {
		if (getFinish) {
//console.log("▲▼Finish")
			// ユーザ入室時間情報クリア
			mGetOldestUserId_UserIdAndDatetimeArray = {};
			mGetOldestUserId_IsChecking = false;

			if (mGetOldestUserId_SuccessCallback && typeof mGetOldestUserId_SuccessCallback === "function") {
				mGetOldestUserId_SuccessCallback(user_id);
			}
			// コールバッククリア
			mGetOldestUserId_SuccessCallback = null;
		}
	}
}

/**
 * コールバンク処理をクリアする
 */
function clearOldestUserId() {
	// ユーザ入室時間情報クリア
	mGetOldestUserId_UserIdAndDatetimeArray = {};
	mGetOldestUserId_IsChecking = false;
	// コールバック初期化
	mGetOldestUserId_SuccessCallback = null;
}
