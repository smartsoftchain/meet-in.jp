// 退室通知ダイアログ
function showExitRoomDialog(target_peer_id, user_info) {
	var title = '退室通知';

	var name = "ゲスト";
	if (user_info && user_info.length > 0) {
		name = user_info;
	}
	var message = name + "が退室しました。";
	
	return createCommonDialog(
		title, 
		message, 
		false, 
		true, 
		false, 
		null,
		null,
		null,
		true,
		true
	);
}
