var mGetOldestUserId_IsChecking = false;
var mGetOldestUserId_UserIdAndDatetimeArray = {};
var mGetOldestUserId_SuccessCallback = null;

var mGetOldestUserId_timestamp = null;
var mGetOldestUserId_user_id = null;

/**
 * 本メソッドは、mUserIdAndUserInfoArray を基に
 * 情報を収集するため、mUserIdAndUserInfoArrayの設定が終わってから実施すること
 * ※mUserIdAndUserInfoArray は各接続先の [SYSTEM_INFO_DETAIL]受信時に設定される
 * よって、本メソッドの呼び出し元のnegotiation_syncにて待ち合わせを行っている。
 * (initSync())
 */
function getOldestUserId(successCallback) {
	// 全ユーザへ送信済みの場合は以降の「REQUEST_OLDEST_USER_IDコマンドを送信」処理は行わない(念のため！！)
	if (mGetOldestUserId_IsChecking) {
		return false;
	}

	mGetOldestUserId_user_id = $('#user_id').val();

	// getTotalTargetPeerData()だと接続中に再接続を行った場合、カウントが合わなくなる為
	// mUserIdAndUserInfoArray 情報数により判定する
	var connectionUserCount = 0;
	connectionUserCount = Object.keys(mUserIdAndUserInfoArray).length;
	if (connectionUserCount < 1) {
		// 通常このルートはありえない!!
		return true;
	}
	else {
		// 全ユーザへREQUEST_OLDEST_USER_IDコマンドを送信
		// sendRequestOldestUserId()の戻り値は現状trueしかありえない。(おそらく修正漏れだと思われる)
		// 現状のままだと、REQUEST_OLDEST_USER_ID 要求が出されていない場合同期処理が行われない可能性がある。
		sendRequestOldestUserId();

		// 要求(REQUEST_OLDEST_USER_ID)を複数のユーザ(1人以上)へ要求した場合 
		// ユーザ入室時間情報を初期化
		mGetOldestUserId_UserIdAndDatetimeArray = {};
		mGetOldestUserId_IsChecking = true;
		mGetOldestUserId_SuccessCallback = successCallback;

		// mUserIdAndUserInfoArray 分 mGetOldestUserId_UserIdAndDatetimeArray情報を作成し設定する
		for (var key in mUserIdAndUserInfoArray) {
			mGetOldestUserId_UserIdAndDatetimeArray[key] = null;
		}
	}

	// 自分の入室時間算出
	// (20秒前:20秒以内は同時入室のため同期不要)
	//
	// 入室時間('#enter_negotiation_datetime')が取得できない場合は現在日時を入室時間とする
	// 自分の入室時間
	var dt = new Date();
	var enter_negotiation_datetime = $('#enter_negotiation_datetime').val();
//console.log("入室時間=("+ enter_negotiation_datetime +")");
	if( !enter_negotiation_datetime ) {
		dt = new Date(enter_negotiation_datetime);
	}
	else {
		// 入室時間が設定されていない事は存在しない！(念のためにない場合)
		// 現在日時だけだとローカルの時間により影響されてしまうため。未来日付(9999/01/01 00:00:00)
		dt.setFullYear(9999);
		dt.setMonth(0); // (注意: 0-11 で指定します)
		dt.setDate(1);
		dt.setHours(00);
		dt.setMinutes(00);
		dt.setSeconds(00);
	}
	dt.setSeconds(dt.getSeconds() - 20);	// 20秒前
	mGetOldestUserId_timestamp = dt.getTime();
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
 * ※ただし入室が20秒前の入室者がいない場合は同時入室として同期は不要な為、自分のIDを返す)
 * @param {*} json
 */
function procUserIdForGetOldestUserId(json) {
	var isFinish = true;

	// 入室状況が返ってきたので、入室時間応答情報を埋める
	mGetOldestUserId_UserIdAndDatetimeArray[json.from_user_id] = json.enter_negotiation_datetime;

	// 入室時間を要求が全て返ってきたかどうかをチェックする
	// isFinish = true  全ユーザから返ってきた
	//            false 応答がないユーザが存在する
	for (var key in mGetOldestUserId_UserIdAndDatetimeArray) {
		if ( mGetOldestUserId_UserIdAndDatetimeArray[key] == null ) {
			// まだ埋まっていないので受け取っていない相手がいる
			isFinish = false;
			break;
		}
	}

	// 一番古い入室時間を判定しユーザ(mGetOldestUserId_user_id)取得する
	if( json.enter_negotiation_datetime != null ) {
		// 受け取った相手の入室日時
		var timestampWork = new Date(json.enter_negotiation_datetime).getTime();
		if (timestampWork <= mGetOldestUserId_timestamp) {
			mGetOldestUserId_user_id = json.from_user_id;
			mGetOldestUserId_timestamp = timestampWork;
		}
	}

	if ( isFinish ) {	// 入室者全員から応答が返ってきた
console.log("OLD_USER_ID=("+ mGetOldestUserId_user_id +") My_User_ID=("+ $('#user_id').val() +")");
		// ユーザ入室時間情報クリア
		mGetOldestUserId_UserIdAndDatetimeArray = {};
		mGetOldestUserId_IsChecking = false;

		if (mGetOldestUserId_SuccessCallback && typeof mGetOldestUserId_SuccessCallback === "function") {
			mGetOldestUserId_SuccessCallback(user_id);
		}
		// コールバッククリア
		mGetOldestUserId_SuccessCallback = null;
	}
	return;
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
