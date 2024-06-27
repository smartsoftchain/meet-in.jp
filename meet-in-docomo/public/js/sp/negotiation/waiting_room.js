

function getRoomName() {
	return $("#room_name").val();
}

function getRoomMode() {
	return $("#room_mode").val();
}


function getUserName() {
	let user_name = $("#input-user-name").val();
	return user_name == "" ? "ゲスト" : user_name;
}

// 処理の開始.
$(function () {

	setOrientation(); // SPデザイン判定(縦・横).

	// MCU 振り分け
	let fd = new FormData();
	fd.append('room_name', getRoomName());
	fetchPost('/negotiation/get-negotiation-room-type', fd)
	.then((response) => {
		let negotiation_room_type = response.data.negotiation_room_type || "0";
		if (negotiation_room_type == "0") {

			loopMethod();
			setInterval(loopMethod, 10000);
		} else {
			// MCUは ロック機能を実装していない為 入室させて会議室内の処理に弾かせてエラー画面へ流れ着かせる.
			joinRoom();
		}
	})
	.catch((err) => {
		console.log(err);
	});

});


window.addEventListener("orientationchange", function() {
	setOrientation();
});
function setOrientation() {
	if (Math.abs(window.orientation) === 90) {
		document.getElementsByTagName('body')[0].classList.add('landscape');
	} else {
		document.getElementsByTagName('body')[0].classList.remove('landscape');
	}
}


function loopMethod() {
	getRoomCurrentSituation(getRoomName());
}


function getRoomCurrentSituation(room_name) {
	$.ajax({
		url: '/negotiation/get-room-current-situation',
		type: 'POST',
		dataType: 'json',
		data: {
			'room_name': room_name,
			'locked_token': lockedRoomParams.locked_token
		}
	}).done(function(res) {

		setDialogView(true);
		setRightAreaView(false);
		let waiting_text = "";

		if(res.status == -1) {
			lockedRoomSequence(res);
			setLockedRoomView();
			return false;
		} else {
			lockedRoomParams.status = 0;
			lockedRoomParams.locked_token == ""; // ロック状態解除.
			joinRoom();
		}

	}).fail(function(res) {
		console.log(res);
	});
}

function joinRoom() {

	setDialogView(false); // 入室が始まったときDialogを閉じる.


	let roomMode  = "";
	let roomModes = [];
	if (getRoomMode()!==""){
		roomModes.push("room_mode="+getRoomMode());
	}

	if (["","null",null].indexOf(lockedRoomParams.locked_token) == -1) {
		roomModes.push("locked_token="+lockedRoomParams.locked_token);
		saveRoomLockedToken("");
	} else {
	}

	if(0 < roomModes.length){
		roomMode = '?'+roomModes.join("&");
	}

	// MCU 振り分け
	let fd = new FormData();
	fd.append('room_name', getRoomName());
	fd.append('user_name', getUserName());
	fetchPost('/negotiation/get-negotiation-room-type', fd)
	.then((response) => {
		let negotiation_room_type = response.data.negotiation_room_type || "0";
		if (negotiation_room_type == "0") {
			// /room/
			window.location.assign(location.protocol + "//" + location.host + "/room/" + getRoomName() + roomMode);
		} else {
			// / rooms/
			fetchPost('/negotiation/update-mcu-server', fd)
			.then((response) => {
				window.location.assign(location.protocol + "//" + location.host + "/rooms/" + getRoomName() + roomMode);
			})
			.catch((err) => {
				window.location.assign(location.protocol + "//" + location.host + "/rooms/" + getRoomName() + roomMode);
			});
		}
	})
	.catch((error) => {
		console.log(error);
	});
}

function fetchPost(url, formData)
{
  return fetch(url, {
    method: "POST",
    body: formData,
    credentials: "same-origin",
  })
  .catch(error => console.log('Error:', error))
  .then((response) => {
    if (!response.ok) {
      return Promise.reject(new Error(`${response.status}: ${response.statusText}`));
    } else {
      return response.json();
    }
  });
}

function leaveRoom() {
	let param = "?room_name="+getRoomName();
	let room_mode = getRoomMode();
	if (room_mode!==""){
		param = param + "&room_mode="+room_mode
	}
	window.location.assign(location.protocol + "//" + location.host + "/index/room" + param);
}

// iPad側でも文字数制限機能するようJSでも処理
$('#case-lock-enter-request #input-user-name').on('input', function(e) {
  let value = $(this).val();
  if (value.length > 20) {
    $(this).val(value.slice(0, 20))
  }
});
$('#case-lock-enter-request #input-user-name').keypress(function(e) {
	if (e.which === 13 | e.keyCode === 13) {
		knockRoom();
		return false;
	}
});

function setRightAreaView(view) {
	setLockRequestView(view);
	setLockResponseWaitView(view);
	setLockRequestRejectedWaitView(view);
}

// 識別子を作成 ※重要なものではないroom内のロックを開始したり解除する度に綺麗に吹き飛ぶ類のもの.
function createOneTokenKey() {
	const strings = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	let max   = strings.length;
	let token_key = "";
	for (let i = 0; i < 16; i++) {
		token_key += strings[Math.floor(Math.random() * max)];
	}
	saveRoomLockedToken(token_key);
	return token_key;
}

function saveRoomLockedToken(token_key) {
	localStorage.setItem("locked_token", token_key);
}
function loadRoomLockedToken() {
	return localStorage.getItem("locked_token");
}

const WANT_ENTER_LOCKED_ROOM_STATUS = {
	INPUT_VIEW: 1,
	RESPONSE_WAIT: 2,
	REQUEST_APPROVAL: 3,
	REQUEST_REJECTED: 4,
	REQUEST_CANCEL: 5
}
let last_locked_token = loadRoomLockedToken();
var lockedRoomParams = {locked_token: last_locked_token, status: 0, connection_info_id:0}

function lockedRoomSequence(res) {

	if(typeof(res.room) === "undefined" || typeof(res.room.users_want_enter_locked_room) === "undefined") {
		return;
	}

	lockedRoomParams.connection_info_id = res.room.id;

	let param = JSON.parse(res.room.users_want_enter_locked_room).find(e=> e.locked_token == lockedRoomParams.locked_token);
	if(param == undefined) {
		// 初期化.
		lockedRoomParams.locked_token  = createOneTokenKey();
		lockedRoomParams.status = WANT_ENTER_LOCKED_ROOM_STATUS.INPUT_VIEW;
	} else {
		// 状態による次の処理への分岐管理.
		switch(Number.parseInt(param.status)) {
			case WANT_ENTER_LOCKED_ROOM_STATUS.RESPONSE_WAIT:
				lockedRoomParams.status = WANT_ENTER_LOCKED_ROOM_STATUS.RESPONSE_WAIT;
				break;
			case WANT_ENTER_LOCKED_ROOM_STATUS.REQUEST_REJECTED:
				lockedRoomParams.status = WANT_ENTER_LOCKED_ROOM_STATUS.REQUEST_REJECTED;
				break;
			case WANT_ENTER_LOCKED_ROOM_STATUS.REQUEST_APPROVAL:
				lockedRoomParams.status = WANT_ENTER_LOCKED_ROOM_STATUS.REQUEST_APPROVAL;
				joinRoom();
				return false;
			case WANT_ENTER_LOCKED_ROOM_STATUS.REQUEST_CANCEL:
				lockedRoomParams.status = WANT_ENTER_LOCKED_ROOM_STATUS.INPUT_VIEW;
				break;

		}

	}
}

function setLockedRoomView() {
	// MEMO.
	// 1. 割り込みがある:: オーナがroom内でロックを解除した場合 どの画面の状態でも通常画面に戻らなくてはならない.
	// 2. 割り込みからの再開は無い:: room内でロックを解除した場合に room内の「入室許可」のツールチップを消すので 依頼する側も「入室依頼」からやりなおす.
	switch(lockedRoomParams.status) {
		case WANT_ENTER_LOCKED_ROOM_STATUS.INPUT_VIEW: 				// 入力待ち.
			setLockRequestView(true);
			break;
		case WANT_ENTER_LOCKED_ROOM_STATUS.RESPONSE_WAIT: 		// ノック応答待ち.
			setLockRequestView(false);
			setLockResponseWaitView(true);
			break;
		case WANT_ENTER_LOCKED_ROOM_STATUS.REQUEST_REJECTED: 	// ノック拒否.
			setLockResponseWaitView(false);
			setLockRequestRejectedWaitView(true);
			break;
		default:
			break;
	}
}

function setDialogView(view) {
	const element = "#mi_main_contents";
	if(view && $(element).css("display") == "none") {
		$(element).show();
	} else if(!view && $(element).css("display") == "block") {
		$(element).hide();
	}
}


function setLockRequestView(view) {
	const element = "#case-lock-enter-request";
	if(view && $(element).css("display") == "none") {
		$(element).show();
	} else if(!view && $(element).css("display") == "block") {
		$(element).hide();
	}
}

function setLockResponseWaitView(view) {
	const element = "#case-lock-response-wait";
	if(view && $(element).css("display") == "none") {
		$(element).show();
	} else if(!view && $(element).css("display") == "block") {
		$(element).hide();
	}
}

function setLockRequestRejectedWaitView(view) {
	const element = "#case-lock-enter-request-rejected";
	if(view && $(element).css("display") == "none") {
		$(element).show();
	} else if(!view && $(element).css("display") == "block") {
		$(element).hide();
	}
}

function knockRoom() {
	$.ajax({
		url: '/negotiation/request-enter-locked-room',
		type: 'POST',
		dataType: 'json',
		data: {
			'room_name': getRoomName(),
			'user_name': getUserName(),
			'locked_token': lockedRoomParams.locked_token,
			'room_mode': 	new URL(window.location.href).searchParams.get('room_mode')
		}
	}).done(function(res) {
		if(res.result == 1) {
			lockedRoomParams.status = WANT_ENTER_LOCKED_ROOM_STATUS.RESPONSE_WAIT;
			setLockedRoomView();
		}
	}).fail(function(res) {
		console.log(res);
	});
}

function cancelKnockRoom(event = leaveRoom) {
	$.ajax({
		url: '/negotiation/set-enter-locked-room-result',
		type: "POST",
		dataType: 'json',
		data: {
			connection_info_id: lockedRoomParams.connection_info_id,
			locked_token: lockedRoomParams.locked_token,
			status: WANT_ENTER_LOCKED_ROOM_STATUS.REQUEST_CANCEL
		},
		success: function (res) {
			event();
		}
	});
}

function removeKnockRoom() {
	$.ajax({
		url: '/negotiation/request-remove-locked-room',
		type: "POST",
		dataType: 'json',
		data: {
			connection_info_id: lockedRoomParams.connection_info_id,
			locked_token: lockedRoomParams.locked_token,
		},
		success: function (res) {
			leaveRoom();
		}
	});
}

function setRequestKnockRoomStatus(status) {
	$.ajax({
		url: '/negotiation/set-enter-locked-room-result',
		type: "POST",
		dataType: 'json',
		data: {
			connection_info_id: lockedRoomParams.connection_info_id,
			locked_token: lockedRoomParams.locked_token,
			status: status
		},
		success: function (res) {
		}
	});
}


window.addEventListener('beforeunload', function (e) {
	if(lockedRoomParams.status == WANT_ENTER_LOCKED_ROOM_STATUS.RESPONSE_WAIT) {
		e.preventDefault();
		e.returnValue = '';
	}
});
window.addEventListener("unload", function () {
	if(WANT_ENTER_LOCKED_ROOM_STATUS.RESPONSE_WAIT == lockedRoomParams.status) {
		let formData = new FormData();
		formData.append('connection_info_id', lockedRoomParams.connection_info_id);
		formData.append('locked_token', lockedRoomParams.locked_token);
		formData.append('status', WANT_ENTER_LOCKED_ROOM_STATUS.REQUEST_CANCEL);
		navigator.sendBeacon("/negotiation/set-enter-locked-room-result", formData);
	}
	if(WANT_ENTER_LOCKED_ROOM_STATUS.REQUEST_REJECTED == lockedRoomParams.status) {
		let formData = new FormData();
		formData.append('connection_info_id', lockedRoomParams.connection_info_id);
		formData.append('locked_token', lockedRoomParams.locked_token);
		navigator.sendBeacon("/negotiation/request-remove-locked-room", formData);
	}
});

