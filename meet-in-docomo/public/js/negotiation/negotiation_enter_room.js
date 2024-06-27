var mConnectionRequestComingDialogZIndex = 111000000;
var mConnectionRequestComingDialogTargetPeerIdAndDialogIdTable = {};

// 入室許可ダイアログを表示
function showConnectionRequestComingDialog(target_peer_id, user_info, req_staff_type, req_staff_id, req_client_id){
	// <div id="enter_room_dialog_area">に入れる
	var enter_room_dialog_area = document.getElementById('enter_room_dialog_area');
	if (!enter_room_dialog_area) {
		return;
	}
	
	var id = 'enter_room_dialog_' + target_peer_id;
	var id_drag = 'enter_room_dialog_drag_' + target_peer_id;

//console.log('showConnectionRequestComingDialog::cookie保存:staff_type=(' + req_staff_type +') staff_id=('+req_staff_id+') client_id=('+req_client_id+')');
	// 暫定でstaff情報をcookieへ格納
	$.cookie("connection_staff_type",req_staff_type,{path: '/negotiation'});
	$.cookie("connection_staff_id"  ,req_staff_id  ,{path: '/negotiation'});
	$.cookie("connection_client_id" ,req_client_id ,{path: '/negotiation'});
	
	// <div id="enter_room_dialog_area">に新たな<div>を作成
	var div = document.createElement("div");
	div.innerHTML = getConnectionRequestComingDialogTpl(target_peer_id, user_info, mConnectionRequestComingDialogZIndex);
	enter_room_dialog_area.appendChild(div);
	$('#' + id).show();
	--mConnectionRequestComingDialogZIndex;

	mConnectionRequestComingDialogTargetPeerIdAndDialogIdTable[target_peer_id] = id;

	$('#enter_room_dialog_background_area').show();

	return id;
}

// 入室通知ダイアログ
function showEnterRoomDialog(target_peer_id, user_info) {
	var title = '接続通知';

	var name = "ゲスト";
	if (user_info && user_info.length > 0) {
		name = user_info;
	}
	var message = name + "が接続しました。";
	
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

function acceptConnectionRequest(target_peer_id) {
	// 接続画面に空きがあるかもう一回確認

	var connection_info_id = $('#connection_info_id').val();
	var userIdList = mNegotiationMain.getConnectedUserIdList();

	var getConnectionInfo_successCallback = function(data, textStatus, XMLHttpRequest) {
		if ("1" == data.result) {
			var userId = -1;
			
			var remain = MEETIN_MAIN_MAX_PEOPLE - Object.keys(userIdList).length - 1;

			var closeOtherDialog = function(target_peer_id) {
				
				// すべての入室要求ダイアログを終了させる。
				for (var key in mConnectionRequestComingDialogTargetPeerIdAndDialogIdTable) {
					sendRefuseChangeToNegotiation(key, 3, "満員になりましたので、<br>接続できませんでした。");
					$('#' + mConnectionRequestComingDialogTargetPeerIdAndDialogIdTable[key]).hide();
				}
				mConnectionRequestComingDialogTargetPeerIdAndDialogIdTable = {};
			}
			
			// レコードに保存されたpeer_idを確認し、暫定的なuserIdを決める
			if ((!data.connection_info.user_peer_id_1 || data.connection_info.user_peer_id_1.length <= 0)
				&& !(1 in userIdList)
				&& (MEETIN_MAIN_MAX_PEOPLE >= 2)
				) {
				userId = 1;
			}
			else if ((!data.connection_info.user_peer_id_2 || data.connection_info.user_peer_id_2.length <= 0)
				&& !(2 in userIdList)
				&& (MEETIN_MAIN_MAX_PEOPLE >= 3)
				) {
				userId = 2;
			}
			else if ((!data.connection_info.user_peer_id_3 || data.connection_info.user_peer_id_3.length <= 0)
				&& !(3 in userIdList)
				&& (MEETIN_MAIN_MAX_PEOPLE >= 4)
				) {
				userId = 3;
			}
			else if ((!data.connection_info.user_peer_id_4 || data.connection_info.user_peer_id_4.length <= 0)
				&& !(4 in userIdList)
				&& (MEETIN_MAIN_MAX_PEOPLE >= 5)
				) {
				userId = 4;
			}
			else if ((!data.connection_info.user_peer_id_5 || data.connection_info.user_peer_id_5.length <= 0)
				&& !(5 in userIdList)
				&& (MEETIN_MAIN_MAX_PEOPLE >= 6)
				) {
				userId = 5;
			}
			else if ((!data.connection_info.user_peer_id_6 || data.connection_info.user_peer_id_6.length <= 0)
				&& !(6 in userIdList)
				&& (MEETIN_MAIN_MAX_PEOPLE >= 7)
				) {
				userId = 6;
			}
			else if ((!data.connection_info.user_peer_id_7 || data.connection_info.user_peer_id_7.length <= 0)
				&& !(7 in userIdList)
				&& (MEETIN_MAIN_MAX_PEOPLE >= 8)
				) {
				userId = 7;
			}
			else if ((!data.connection_info.user_peer_id_8 || data.connection_info.user_peer_id_8.length <= 0)
				&& !(8 in userIdList)
				&& (MEETIN_MAIN_MAX_PEOPLE >= 9)
				) {
				userId = 8;
			} else {
				closeOtherDialog(target_peer_id);
			}
			
			var updateConnectionInfoPeerId_successCallback = function(data, textStatus, XMLHttpRequest) {
				if ("1" == data.result) {
					// 席を確保したので、商談中画面への遷移を許可する
					sendRequestChangeToNegotiation(target_peer_id, userId);
					
					if (remain <= 1) {
						closeOtherDialog(target_peer_id);
					}
				} else {
					// 席を確保できなかったので、商談中画面への遷移を拒否する
					sendRefuseChangeToNegotiation(target_peer_id, 3, "満員になりましたので、<br>接続できませんでした。");
				}
			};
			
			var updateConnectionInfoPeerId_errorCallback = function(XMLHttpRequest, textStatus, errorThrown, errorMessage) {
				// 席を確保できなかったので、商談中画面への遷移を拒否する
				sendRefuseChangeToNegotiation(target_peer_id, 4, "接続画面に接続できませんでした。");
			};
		
			var updateConnectionInfoPeerId_completeCallback = function(XMLHttpRequest, textStatus) {
			};
			
			
			// userIdを確保するために、connection_infoテーブルの該当カラムに暫定的な値を設定し、NULLである状態をなくす
			updateConnectionInfoPeerId(
				connection_info_id,
				userId,
				target_peer_id,
				updateConnectionInfoPeerId_successCallback, 
				updateConnectionInfoPeerId_errorCallback, 
				updateConnectionInfoPeerId_completeCallback
			);
		} else {
			// 接続画面の情報が取得できなかったので、商談中画面への遷移を拒否する
			sendRefuseChangeToNegotiation(target_peer_id, 5, "接続画面に繋がりませんでした。");
		}
	};

	var getConnectionInfo_errorCallback = function(XMLHttpRequest, textStatus, errorThrown, errorMessage) {
		// 接続画面の情報が取得できなかったので、商談中画面への遷移を拒否する
		sendRefuseChangeToNegotiation(target_peer_id, 6, "接続画面に接続できませんでした。");
	};

	var getConnectionInfo_completeCallback = function(XMLHttpRequest, textStatus) {
	};
	
	// これから入室するゲストもいるかもしれないので、データベースのconnection_infoテーブルを調べる
	// connection_infoに入室済みとこれから入室するゲストのpeer_idが保存されている
	getConnectionInfo(
		connection_info_id,
		getConnectionInfo_successCallback, 
		getConnectionInfo_errorCallback, 
		getConnectionInfo_completeCallback
	);

	if (target_peer_id in mConnectionRequestComingDialogTargetPeerIdAndDialogIdTable) {
		delete mConnectionRequestComingDialogTargetPeerIdAndDialogIdTable[target_peer_id];
	}
	
	var id = 'enter_room_dialog_' + target_peer_id;
	$('#' + id).hide();
	hideEnterRoomDialogBackgroundArea();
}

function refuseConnectionRequest(target_peer_id) {
	sendRefuseChangeToNegotiation(target_peer_id, 3, "オペレータが取り込み中のため、<br>接続できませんでした。");

	if (target_peer_id in mConnectionRequestComingDialogTargetPeerIdAndDialogIdTable) {
		delete mConnectionRequestComingDialogTargetPeerIdAndDialogIdTable[target_peer_id];
	}

	var id = 'enter_room_dialog_' + target_peer_id;
	$('#' + id).hide();
	hideEnterRoomDialogBackgroundArea();
}

// 着信ダイアログの半透明背景を非表示にする
function hideEnterRoomDialogBackgroundArea() {
	var hideArea = true;
	
	$(".enter_room_dialog").each(function(i, element) {
		if ($(element).css('display') == 'block') {
			hideArea = false;
			return;
		}
	});
	
	if (hideArea) {
		$('#enter_room_dialog_background_area').hide();
	}
}

function getConnectionRequestComingDialogTpl(target_peer_id, user_info, z_index) {
	var target_peer_id_work = "'" + target_peer_id + "'";

	if (user_info) {
		user_info = user_info.trim();
	}
	if (!user_info || user_info.length < 1) {
		user_info = "匿名ユーザー";
	}
	
	var tpl = ''
	+ '<div class="enter_room_dialog" id="enter_room_dialog_' + target_peer_id + '" style="z-index:' + z_index + ';">'
	+ '<div class="enter_room_dialog_mi_modal_default" id="enter_room_dialog_drag_' + target_peer_id + '">'
	+ '<div class="model_call_operator">'
	+ '<div class="sub_title enter_room_dialog_title">着信中</div>'
	+ '<div class="sub_title" style="text-overflow: ellipsis;overflow: hidden;white-space: nowrap;">' + user_info + '</div>'
	+ '<div class="call_operator_icon"><span class="icon-parsonal"></span></div>'
	+ '<div class="sub_message">ゲストがコンタクトを求めています。</div>'
	+ '<div class="btn_connection_area mi_modal_btn_wap">'
	+ '<button type="button" class="btn_connection" onClick="acceptConnectionRequest(' + target_peer_id_work + ');">接続</button>'
	+ '</div>'
	+ '<div class="btn_rejection_area">'
	+ '<a href="javascript:refuseConnectionRequest(' + target_peer_id_work + ');" >接続を拒否する</a>'
	+ '</div>'
	+ '</div>'
	+ '</div>'
	+ '</div>';

	return tpl;
}