// ユーザーIDと名称の配列
var mUserIdAndUserInfoArray = {};
// 上記関数はinfoだが、ユーザーIDをキーにして、名前を値として持っているだけなので、新たにユーザーの情報を持つ変数を定義(ただし、現在使用箇所は限定的とする)
var mUsersInfoDict = {};
// 入室時刻の保存.
var mUsersIdAndUserEnterDateTime = {};

// ユーザーIDとブラウザ種類の配列
var mUserIdAndBrowserTable = {};

var DEFAULT_MEETIN_MAIN_SEND_BANDWIDTH_LEVEL_ARRAY = [DEFAULT_MEETIN_MAIN_SEND_BANDWIDTH_LEVEL_0, DEFAULT_MEETIN_MAIN_SEND_BANDWIDTH_LEVEL_1, DEFAULT_MEETIN_MAIN_SEND_BANDWIDTH_LEVEL_2, DEFAULT_MEETIN_MAIN_SEND_BANDWIDTH_LEVEL_3, DEFAULT_MEETIN_MAIN_SEND_BANDWIDTH_LEVEL_4];
var DEFAULT_MEETIN_MAIN_RECEIVE_BANDWIDTH_LEVEL_ARRAY = [DEFAULT_MEETIN_MAIN_RECEIVE_BANDWIDTH_LEVEL_0, DEFAULT_MEETIN_MAIN_RECEIVE_BANDWIDTH_LEVEL_1, DEFAULT_MEETIN_MAIN_RECEIVE_BANDWIDTH_LEVEL_2, DEFAULT_MEETIN_MAIN_RECEIVE_BANDWIDTH_LEVEL_3, DEFAULT_MEETIN_MAIN_RECEIVE_BANDWIDTH_LEVEL_4];

// 商談管理クラス
var mNegotiationMain = new NegotiationManager.NegotiationMain(
	$('#connection_info_id').val(),
	$('#user_id').val(),
	$('#connect_no').val(),
	$('#client_id').val(),
	$('#my_user_info').val(),
	$('#send_bandwidth').val(),
	$('#receive_bandwidth').val(),
	DEFAULT_MEETIN_MAIN_SEND_BANDWIDTH_LEVEL_ARRAY[getSendBandwidthLevel()],
	DEFAULT_MEETIN_MAIN_RECEIVE_BANDWIDTH_LEVEL_ARRAY[getReceiveBandwidthLevel()],
	USER_PARAM_BROWSER
);

// セッションに保存されているtarget_peer_idを削除する
function clearTargetPeerId() {
	var data = {
		target_peer_id : null,
		};
	
	saveWebRtcParam(
		data,
		null,
		null, 
		null
		);
}

// 接続中のuserIdのリストを取得する
// {
//   [１人目のuserId] : [１人目のピアID],
//   [２人目のuserId] : [２人目のピアID],
//   …
//   [Ｎ人目のuserId] : [Ｎ人目のピアID]
// }
function getConnectedUserIdList() {
	return mNegotiationMain.getConnectedUserIdList();
}

