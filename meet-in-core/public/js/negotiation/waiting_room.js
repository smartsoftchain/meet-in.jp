
//-----------------------
//　MEMO.
// ルーム直前の画面である 待合室の処理を実装している.

// 待合室の「ビデオ・カメラの設定」は新規に実行したものではない room内の「ビデオ・カメラの設定」である
// negotiation-setting-camera.tpl と negotiation_setting_camera.js を　呼び出して　待合室で無用な処理を上書きして実現した.

// 移植時の問題として、
// negotiation_setting_camera.js は、 ルーム内の開始点になる negotiation_main.js で定義してあるオブジェクトに依存しきっている点があった。
// negotiation_main.js は　ルーム画面専用にコーディングされている上に、読めば $(document).ready() が発火してしまうことから待合室では読み込めない。
// このことから negotiation_setting_camera.js で定義されてあるObjectのうち  最低限必要になった 以下の オブジェクトを補完する目的で 定義している.

// MEMO. negotiation_setting_camera.js 内で呼んでいる定義を 処理がこけない範囲で定義
// つまり negotiation_setting_camera.js が育って 待合室がこけるようになった場合には 打ち消す定義をしてほしい.
var NEGOTIATION = {};
NEGOTIATION.isMyCameraCanUse = true;
NEGOTIATION.isMyMicCanUse    = true;
NEGOTIATION.isMyCameraOn     = true;
NEGOTIATION.isMyMicOn        = true;
NEGOTIATION.localStorageFlg  = true;
NEGOTIATION.mIsScreenOn;
NEGOTIATION.use_bright;
NEGOTIATION.use_camera_facingMode;
NEGOTIATION.use_camera_id;
NEGOTIATION.use_camera_id_flash;
NEGOTIATION.use_fps;
NEGOTIATION.use_mic_id;
NEGOTIATION.use_mic_id_flash;

const BEAUTY_MODE_OFF = 0;
const BEAUTY_MODE_ON = 1;
const DEFAULT_CAMERA_ID_FLASH = 0;
const DEFAULT_FPS = 10;
const DEFAULT_BRIGHT= 14;

let reloadFlg = false;

// MEMO. room用で走る処理を殺す.
function negotiationMainReconnectNotDialog() {
}

// MEMO. room用のクリック処理を殺して待合室処理をフック.
$('#setting-camera-dialog-save-button').off("click");
$('#setting-camera-dialog-save-button').click(function(){

	// スピーカーのテスト音声 鳴りっぱなしを止める.
	let bgm1 = document.querySelector("#bgm1");
	if(bgm1 && !bgm1.paused){
		let btnPlay  = document.querySelector("#btn-play");
		btnPlay.innerHTML = '<img src="/img/audio-play.svg"  width="50">';  // 「再生ボタン」に切り替え
		bgm1.pause();
	}

	// ビューティーモードの変更処理（現行処理に影響を与えないように、別途処理を記述かつ、再接続前にメッセージを送信したいので、先に記述）
	if(localStorage.getItem('beauty_mode') != $("input[name=beauty_mode]:checked").val()){
		// 変更時はストレージの値を変更する（入室時に初期化済み）
		localStorage.setItem('beauty_mode', $("input[name=beauty_mode]:checked").val());
	}

	settingApply();
	is_use_camera_id_exist = true; // saveした分岐 フラフ更新.

	if(!$(ELEMENT_CAMERA).hasClass(NONE_ACTIVE)) {
		unsetCameraWork();
		setCameraWork();
	}
	$("#setting-camera-dialog").dialog("close");
});

// MEMO. room用のクリック処理を殺して待合室処理をフック.
$('#setting-camera-dialog-cancel-button').off("click");
$('#setting-camera-dialog-cancel-button').click(function(){

    // スピーカーのテスト音声 鳴りっぱなしを止める.
    let bgm1 = document.querySelector("#bgm1");
    if(bgm1 && !bgm1.paused){
        let btnPlay  = document.querySelector("#btn-play");
        bgm1.pause();
        btnPlay.innerHTML = '<img src="/img/audio-play.svg"  width="50">';
    }

    // スピーカーの設定 キャンセルを押したのだから元に戻す.
    setSpeakerDevice(NEGOTIATION.use_speaker_id);


    if(!$(ELEMENT_CAMERA).hasClass(NONE_ACTIVE)) {
        unsetCameraWork();
        setCameraWork();
    }

    //モーダル内のvideo停止
    stopDevices();
    $("#setting-camera-dialog").dialog("close");
});


function cameraChromakeyOn(stream) {
}
function cameraChromakeyOff() {
}
function cameraOff() {
}
function cameraOn(constraints) {
}


//-----------------------

// 処理の開始.
$(function () {

	$("#button_setting_camera_dialog img").show();
	$("#button_setting_mic img").show();
	$("#button_setting_video img").show();

	recommendEnvironmentAlert();

	// 「ビデオ・カメラ設定」の為の設定(ルーム内で行っているの処理の補完).
	$('#user_id').val(1);
	if(getUseCameraID() == null){
		localStorage.setItem(USE_CAMERA_ID, "default");
		localStorage.setItem('use_bright', DEFAULT_BRIGHT);
		localStorage.setItem('use_fps', DEFAULT_FPS);
		localStorage.setItem(BEAUTY_MODE, BEAUTY_MODE_OFF);
	}
	NEGOTIATION.use_mic_id =  getUseMicID();
	NEGOTIATION.use_speaker_id = getUseSpeakerID();
	setSpeakerDevice(NEGOTIATION.use_speaker_id);
	// ----------------------------


	// 待合室の処理.

	$(ELEMENT_CAMERA).on("click",function(){
		$(ELEMENT_CAMERA).toggleClass(NONE_ACTIVE);
		if(!$(ELEMENT_CAMERA).hasClass(NONE_ACTIVE)){
			$(ELEMENT_CAMERA).find("img").attr('src', VIDEO_ON_IMG);
			checkExistDevice(function() {
				setCameraWork();
			});
		} else {
			$(ELEMENT_CAMERA).find("img").attr('src', VIDEO_OFF_IMG);
			unsetCameraWork();
		}
	});
	$(ELEMENT_MIC).on("click",function(){
		$(ELEMENT_MIC).toggleClass(NONE_ACTIVE);
		if(!$(ELEMENT_MIC).hasClass(NONE_ACTIVE)){
			$(ELEMENT_MIC).find("img").attr('src', MIC_ON_IMG);
			NEGOTIATION.isMyMicOn = true;
		} else {
			$(ELEMENT_MIC).find("img").attr('src', MIC_OFF_IMG);
			NEGOTIATION.isMyMicOn = false;
		}
	});

	initializeDevice();


	// 背景効果向けの処理.
	if(getBackgroundEffect() == null) {
		 setBackgroundEffect('bodypix_no_effect') // 主にゲスト用の初期値.
	}
	onOkBodypixDialogPlugin = function(bodypix_background_path, internalResolution, segmentationThreshold, maskBlurAmount) {
		if(bodypix_background_path == null) {
			return;
		}

		// 画像の最後に付与している番号を削除する
		let backgroundPath = bodypix_background_path.split("?")[0];

		let data = {
			"bodypix_background_path" : backgroundPath,
			"bodypix_internal_resolution" : internalResolution,
			"bodypix_segmentation_threshold" : segmentationThreshold,
			"bodypix_mask_blur_amount": maskBlurAmount,
			"staff_type" : $('input[id=staff_type]').val(),
			"staff_id"   : $('input[id=staff_id]').val(),
		};

		setBackgroundEffect(backgroundPath); // ゲスト向きの保存.

		// DBに保存
		$.ajax({
			url: "../admin/save-background",
			type: "POST",
			dataType: "text",
			data: data,
		}).done(function(res) {
		}).fail(function(res) {
		});
	}



});

const USE_CAMERA_FLG = 'use_camera_flg';
const USE_MIC_FLG    = 'use_mic_flg';
const USE_CAMERA_ID  = 'use_camera_id';
const USE_MIC_ID     = 'use_mic_id';
const USE_SPEAKER_ID = 'use_speaker_id';
const BEAUTY_MODE    = 'beauty_mode';
const BACKGROUND_EFFECT = 'bodypix_background_path';
const BACKGROUND_ELE1 = 'myCanvasBodyPix';
const BACKGROUND_ELE2 = 'myCanvasBg';
const BACKGROUND_ELE3 = 'myCanvasHideBackground';

const ELEMENT_CAMERA = "#button_setting_video";
const ELEMENT_MIC    = "#button_setting_mic";
const NONE_ACTIVE    = "none-active";

const IMG_HELP 		 = '/img/icon-help-red.png';
const MIC_ON_IMG     = "/img/icon-mic-on-white.png";
const MIC_OFF_IMG    = "/img/icon-mic-off-white.png";
const VIDEO_ON_IMG   = "/img/icon-video-on-white.png";
const VIDEO_OFF_IMG  = "/img/icon-video-off-white.png";

function getUseCameraID() {
	return localStorage.getItem(USE_CAMERA_ID);
}
function getUseMicFlag() {
	return localStorage.getItem(USE_MIC_FLG);
}
function getUseCameraFlag() {
	return localStorage.getItem(USE_CAMERA_FLG);
}
function getUseMicID() {
	return localStorage.getItem(USE_MIC_ID);
}
function getUseSpeakerID() {
	return localStorage.getItem(USE_SPEAKER_ID);
}
function getBeautyMode() {
	return localStorage.getItem(BEAUTY_MODE);
}
function getBackgroundEffect() {
	return localStorage.getItem(BACKGROUND_EFFECT);
}
function setBackgroundEffect(value) {
	return localStorage.setItem(BACKGROUND_EFFECT, value);
}
function hideBackgroundElement() {
	document.getElementById(BACKGROUND_ELE1).style.display = 'none';
	document.getElementById(BACKGROUND_ELE2).style.display = 'none';
	document.getElementById(BACKGROUND_ELE3).style.display = 'none';
}

function setLocalStage() {
	let use_mic_flg    = !$(ELEMENT_MIC).hasClass(NONE_ACTIVE);
	let use_camera_flg = !$(ELEMENT_CAMERA).hasClass(NONE_ACTIVE);
	localStorage.setItem(USE_MIC_FLG,    use_mic_flg);
	localStorage.setItem(USE_CAMERA_FLG, use_camera_flg);
}


function getRoomName() {
	return $("#room_name").val();
}

function getRoomMode() {
	return $("#room_mode").val();
}

function getUserName() {
	let user_name = $("#case-connection #input-user-name").val();
	return user_name == "" ? "ゲスト" : user_name;
}

function setLoadingView(view) {
	let element = "#case-loading";
	if(view) {
		$(element).show();
	} else {
		$(element).hide();
	}
}
function setLoadingText(text) {
	$("#case-loading>span").html(text);
}
function setWaitingView(view) {
	let element = "#case-waiting";
	if(view) {
		$(element).show();
	} else {
		$(element).hide();
	}
}
function setWaitingText(text) {
	$("#case-waiting span").html(text);
}
function setWaitingHostView(view) {
	let element = "#case-host-waiting";
	if(view) {
		$(element).show();
	} else {
		$(element).hide();
	}
}
function setWaitingHostText(text) {
	$("#case-host-waiting span").html(text);
}
function setConnectionView(view) {
	let element = "#case-connection";
	if(view) {
		$(element).show();
	} else {
		$(element).hide();
	}
}
function setConnectionFailureView(view) {
	let element = "#case-connection-failure";
	if(view) {
		$(element).show();
	} else {
		$(element).hide();
	}
}
// ホスト待機画面で名前入力後の状態に表示等を切り替える処理
function setWaitingHostStatusAndView() {
	// 名前入力後のリロードの場合は、最初の名前入力画面を介さないため、ここで displayを切り替える。
	if ($('#case-host-waiting').css('display') === 'none') {
		$('#case-host-waiting').show();
	}
	// 待機中に入力した名前を ホストありの待機画面の入力欄に写す
	const inputName = $("#case-host-waiting #input-user-name-waiting").val();

	if (inputName !== '') {
		$("#case-connection #input-user-name").val(inputName);
		sessionStorage.setItem('session_input_name', inputName); // リロードした時用にセッションに入れておく
	} else {
		// リロード時は入力欄介さないため、セッションに入れていた値を写す
		const sessionInputName =  sessionStorage.getItem('session_input_name');
		if (sessionInputName !== '') {
			$("#case-connection #input-user-name").val(sessionInputName);
		}
	}

	// ボタンをホスト待機中のものにする
	$('#case-host-waiting #case-waiting-btn-area').hide();
	$('#case-host-waiting .host-waiting').show();
	// 名前入力欄を非表示にする
	$('#case-host-waiting #input-name-area-waiting').hide();
	// text挿入 
	const displayText = 'ホストがまだ参加していません<br>こちらの待機画面でしばらくお待ちください。';
	setWaitingHostText(displayText);
	// 名前入力後の待機中かどうか判定するフラグに値を入れる（0: 非待機中 1:待機中）
	sessionStorage.setItem('waiting_host_flg', 1);
}
function setConnectionText(text) {
	$("#case-connection span").html(text);
}



var media;
var video =document.createElement('video');
document.getElementById('video-area').appendChild(video);
function setCameraWork() {

	if (USER_PARAM_BROWSER == 'IE') {
		return;
	}

	setRightAreaView(false);
	setLoadingView(true);
	setLoadingText('カメラ接続中です。<br>少々お待ちください。');

	setTimeout(function(){
		let constraints = getCameraConstraints();
		constraints.video.width  = {ideal: 300, max: 300};
		constraints.video.height = {ideal: 150, max: 150};

		if(!is_use_camera_id_exist) {
			delete constraints.video.deviceId;
		} else if(constraints.video.deviceId.exact == "default") {
			// 標準を使えという指示の場合は 「カメラ・マイク設定」画面に合わせて1番最初に発見したデバイスを使っておく.
			constraints.video.deviceId = videoinputs[0].deviceId;
	}

		if (USER_PARAM_BROWSER === 'Chrome') {
			constraints.video.frameRate = {max: NEGOTIATION.use_fps};
		}
		// loadingの状態が20秒間続いた場合、推奨環境確認と接続機器の確認を促す内容を表示
		let reload = setTimeout(function() {
			if($('#case-loading').css("display") != "none") {
				setRightAreaView(false);
				setConnectionFailureView(true);
				reload = true;
				return;
			}
		}, 20000);
		media = navigator.mediaDevices.getUserMedia(constraints)
		.then(function(stream) {
			// video要素にWebカメラの映像を表示させる
			video.id       = 'video_target_video_1';
			video.width    = 300;
			video.height   = 150;
			video.autoplay = true;
			video.srcObject = stream;
			setLoadingView(false);
			loopMethod();

			NEGOTIATION.isMyCameraOn = true;

			settingBeautyMode($('#user_id').val(), localStorage.getItem('beauty_mode'));
			setBrightnessVal(NEGOTIATION.use_bright);

			let negotiation_room_type = document.getElementById('negotiation_room_type').value;
			if (USER_PARAM_BROWSER !== "Safari" && USER_PARAM_BROWSER !== 'IE') {
				if(USER_PARAM_BROWSER == "Chrome" && negotiation_room_type == 0) {
					isWaitingRoom = true;
					startHideBackground();
				} else { 
					// MCUの場合bodypixを使用する。
					startNegotiationBodypix();
				}
			}


		})
		.catch(function(err) {
			console.log(err);
		})
		.finally(function() {
			reloadFlg = false;
			if (reloadFlg == false) {
				clearTimeout(reload);
			}
		});
	}, 500);

}

function unsetCameraWork() {
	if(USER_PARAM_BROWSER == "Chrome" && video.srcObject) {
		video.srcObject.getTracks().forEach(track => {track.stop(); });
	}
	video.srcObject = null;
	NEGOTIATION.isMyCameraOn = false;
	hideBackgroundElement();
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

		setRightAreaView(false);
		let waiting_text = "";
		// sessionで持たせた名前入力後の待機中かどうか判定するフラグ（0: 非待機中 1:待機中）を取得する
		let waiting_host_flg = sessionStorage.getItem('waiting_host_flg');

		if(res.status == -1) {
			// MEMO. ルームが中からロックしている時だけ入る分岐.
			lockedRoomSequence(res);
			setLockedRoomView();
			return false;
		} else if(res.status == -2) {
			waiting_text = "現在、このルームは参加人数が制限人数を越えています<br>こちらの待機画面でしばらくお待ちください";
		} else if(res.user == null && res.host_exist == false && waiting_host_flg !== "1") {
			// ホスト待機画面（名前入力）
			setWaitingHostText("お名前を入力し「参加する」をクリックしてください。");
			setWaitingHostView(true);
			$('#case-host-waiting #input-name-area-waiting').show();
			return false;
		}

		if (waiting_host_flg == "1" && !res.host_exist && res.status !== -2) {
			// ホスト待機画面（名前入力後待機中）
			setWaitingHostStatusAndView();
			return false;
		} else if (waiting_host_flg == "1" && res.host_exist && res.room_members > 0 && res.status != -2) {
			// ホストがきたら、自動で入室する
			setWaitingHostView(true); // ホスト待機中の表示を残す
			joinRoom();
			return false;
		}

		// ロックされていない状態なのでリセットする.
		lockedRoomParams.locked_token == "";

		if(lockedRoomParams.status == WANT_ENTER_LOCKED_ROOM_STATUS.RESPONSE_WAIT) {
			lockedRoomParams.status = 0;
			joinRoom(); // レスポンス待ちの状態でroom内でロックが外されたのなら「ロックを外したのがホストの応答」と判断して自動で入室する.
			return false;
		}

		if(0 < waiting_text.length) {
			setWaitingView(true);
			setWaitingText(waiting_text);

		} else {

			let text = "";
			if(0 < res.room_members) {

				if(res.host_exist) {
					text = text + "ホスト";
					// ゲストの参加(res.user=null) 名前入力欄を表示する (モニタリングモード時 mode_type:2は表示しない)
					const roomMode = parseInt($('#room_mode').val());
					if (roomMode !== 2 && res.user === null) {
						$('#case-connection #input-name-area').show();
					}
				}

				let room_members = res.room_members;
				if(res.host_exist && res.room_members) {
					room_members--;
				}
				if(0 < room_members) {
					if(0 < text.length) {
						text = text + "、他";
					}
					text = text + ""+room_members+"名";
				}
			}
			setConnectionView(true);
			setConnectionText(0 < text.length ? text+"が参加中です" : "");
		}

	}).fail(function(res) {
		console.log(res);
	});
}

function getRoomCurrentSituationMcu(room_name) {
	let fd = new FormData();
	fd.append('room_name', room_name);
	fetchPost('/negotiation/get-room-current-situation-mcu', fd)
	.then((res) => {
		setRightAreaView(false);

		let waiting_text = "";
		if(res.status == -1) {
			waiting_text = "現在、このルームはホストによってロックされています<br>こちらの待機画面でしばらくお待ちください";
		} else if(res.status == -2) {
			waiting_text = "現在、このルームは参加人数が制限人数を越えています<br>こちらの待機画面でしばらくお待ちください";
//		} else if(res.user == null && res.host_exist == false) {
//			waiting_text = "ホストがまだ参加していません<br>こちらの待機画面でしばらくお待ちください";
		}

		// MEMO.ホストの待合室の画面の状態で、ゲストが入室可能となってしまっていたため、
		// ボタンをdisabledにしてボタンの色を薄くする対応をしました。(2021.10.18)
		if (res.user == null) { // ゲストの場合
			$('#case-connection').find('.btn-join-room').attr('disabled', true);
			$('#case-connection').find('.btn-join-room').css('background-color', 'rgba(255, 170, 0, 0.3)');
		}

		if(0 < waiting_text.length) {
			setWaitingView(true);
			setWaitingText(waiting_text);

		} else {

			let text = "";
			if(0 < res.room_members) {

				if(res.host_exist) {　// mcuだと現状 res.host_existが trueにならないため、ここに入らない様子
					text = text + "ホスト";
				}

				let room_members = res.room_members;
				if(res.host_exist && res.room_members) {
					room_members--;
				}
				if(0 < room_members) {
					if(0 < text.length) {
						text = text + "、他";
					}
					text = text + ""+room_members+"名";
					// 入室ボタンのdisableを外し、色を戻して押下できるようにする
					$('#case-connection').find('.btn-join-room').attr('disabled', false);
					$('#case-connection').find('.btn-join-room').css('background-color', '');
				}
			}
			setConnectionView(true);
			setConnectionText(0 < text.length ? text+"が参加中です" : "");
		}
	})
	.catch((error) => {
		console.log(error);
	});
}

function loopMethod() {
	// MCU 振り分け
	let fd = new FormData();
	fd.append('room_name', getRoomName());
	fetchPost('/negotiation/get-negotiation-room-type', fd)
	.then((response) => {
		let negotiation_room_type = response.data.negotiation_room_type || "0";
		if (negotiation_room_type == "0") {
			$("#beauty_mode_area").removeClass("setting_mode_area_none");
			getRoomCurrentSituation(getRoomName());
		} else {
			$("#beauty_mode_area").addClass("setting_mode_area_none");
			getRoomCurrentSituationMcu(getRoomName());
		}
	})
	.catch((err) => {
		console.log(err);
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


function joinRoom() {
	setLocalStage();
	let roomMode  = "";
	let roomModes = [];
	// ホスト待機中を判定するフラグをオフ(0)にする 0: 非待機中 1:待機中
	sessionStorage.setItem('waiting_host_flg', 0);
	// ホスト待機画面で使用するsessionに入れた名前を空にする
	sessionStorage.setItem('session_input_name', '');

	if (getRoomMode()!==""){
		roomModes.push("room_mode="+getRoomMode());
	}

	if (["","null",null].indexOf(lockedRoomParams.locked_token) == -1) {
		roomModes.push("locked_token="+lockedRoomParams.locked_token);
		saveRoomLockedToken("");
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

// iPad側でも文字数制限機能するようJSでも処理
$('#case-connection #input-user-name').on('input', function(e) {
  let value = $(this).val();
  if (value.length > 20) {
		$(this).val(value.slice(0, 20))
  }
  $('#case-lock-enter-request #input-user-name').val($(this).val());
});
$('#case-lock-enter-request #input-user-name').on('input', function(e) {
  let value = $(this).val();
  if (value.length > 20) {
    $(this).val(value.slice(0, 20))
  }
  $('#case-connection #input-user-name').val($(this).val());
});
$('#case-host-waiting #input-user-name-waiting').on('input', function(e) {
  let value = $(this).val();
  if (value.length > 20) {
		$(this).val(value.slice(0, 20))
  }
  $('#case-host-waiting #input-user-name-waiting').val($(this).val());
});

$('#case-connection #input-user-name').keypress(function(e) {
	if (e.which === 13 | e.keyCode === 13) {
		joinRoom();
		return false;
	}
});
$('#case-lock-enter-request #input-user-name').keypress(function(e) {
	if (e.which === 13 | e.keyCode === 13) {
		knockRoom();
		return false;
	}
});
$('#case-host-waiting #input-name-area-waiting').keypress(function(e) {
	if (e.which === 13 | e.keyCode === 13) {
		setWaitingHostStatusAndView();
		return false;
	}
});


function leaveRoom() {

	let param = "?room_name="+getRoomName();
	let room_mode = getRoomMode();
	if (room_mode!==""){
		param = param + "&room_mode="+room_mode
	}
	// ホスト待機中のフラグをオフにする （0: 非待機中 1:待機中）
	sessionStorage.setItem('waiting_host_flg', 0);
	// ホスト待機画面で使用するsessionに入れた名前を空にする
	sessionStorage.setItem('session_input_name', '');

	window.location.assign(location.protocol + "//" + location.host + "/index/menu" + param);
}


// ボタンの状態を保存値と一致させる.
function syncUseDeviceFlag() {
	if(getUseCameraFlag()=="false") {
		$(ELEMENT_CAMERA).addClass(NONE_ACTIVE);
		$(ELEMENT_CAMERA).find("img").attr('src', VIDEO_OFF_IMG);
		unsetCameraWork();
	} else {
		$(ELEMENT_CAMERA).removeClass(NONE_ACTIVE);
		$(ELEMENT_CAMERA).find("img").attr('src', VIDEO_ON_IMG);
		setCameraWork();
	}
	if(getUseMicFlag()=="false") {
		$(ELEMENT_MIC).addClass(NONE_ACTIVE);
		$(ELEMENT_MIC).find("img").attr('src', MIC_OFF_IMG);
	} else {
		$(ELEMENT_MIC).removeClass(NONE_ACTIVE);
		$(ELEMENT_MIC).find("img").attr('src', MIC_ON_IMG);
	}
}

function setRightAreaView(view) {
	setLoadingView(view);
	setConnectionFailureView(view);
	setWaitingView(view);
	setConnectionView(view);
	setLockRequestView(view);
	setLockResponseWaitView(view);
	setLockRequestRejectedWaitView(view);
	setWaitingHostView(view);
}

var videoinputs;
function initializeDevice() {

	setRightAreaView(false);
	setLoadingText('準備中です。<br>少々お待ちください。');
	setLoadingView(true);

	if (USER_PARAM_BROWSER == 'IE') {
		loopMethod();
		setInterval(loopMethod, 10000);
		return;
	}

	setTimeout(function(){
		// loadingの状態が20秒間続いた場合、推奨環境確認と接続機器の確認を促す内容を表示
		let reload = setTimeout(function() {
			if($('#case-loading').css("display") != "none") {
				setRightAreaView(false);
				setConnectionFailureView(true);
				reloadFlg = true;
				return;
			}
		}, 20000);

		navigator.mediaDevices.getUserMedia({audio: true, video: true })
		.then(function(devices) {
			navigator.mediaDevices.enumerateDevices()
			.then(function(devices) {
				videoinputs = devices.filter(function(d){ return d.kind == "videoinput"});
			})
		})
		.catch(function(err) {
			console.log(err);
		})
		.finally(function(info) {
			reloadFlg = false;
			if (reloadFlg == false) {
				clearTimeout(reload);
			}
			checkExistDevice(function() {
				syncUseDeviceFlag();
				loopMethod();
				setInterval(loopMethod, 10000);
			});
		});
	}, 500);
}

var is_use_camera_id_exist = false;
function checkExistDevice(success) {

	$("#error_messeg").hide();

	// IEは古すぎて自力で機能できず、2020/12/31で Flashのサポートが終了した今では 弊社責任にならない方法でカメラを取得する方法はない=非対応.
	if (USER_PARAM_BROWSER == 'IE') {
		// カメラは呼べない 状態を確認して 入場ボタンを出現させる.
		success();
		return;
	}

	setRightAreaView(false);
	setLoadingText('デバイスを確認します。<br>少々お待ちください。');
	setLoadingView(true);

	setTimeout(function(){
		var use_camera_id = getUseCameraID(); // カメラを設定済みの場合それを探す.

		var isHaveVideoinput  = false; // videoinput  カメラ装置.
		var isHaveAudioinput  = false; // audioinput  マイク装置.
		var isHaveAudiooutput = false; // audiooutput スピーカー装置.

		if(USER_PARAM_BROWSER == "Safari") {
			isHaveAudiooutput = true;
		}
		// loadingの状態が20秒間続いた場合、推奨環境確認と接続機器の確認を促す内容を表示
		let reload = setTimeout(function() {
			if($('#case-loading').css("display") != "none") {
				setRightAreaView(false);
				setConnectionFailureView(true);
				reloadFlg = true;
				return;
			}
		}, 20000);

		navigator.mediaDevices.enumerateDevices()
		.then(function(devices) {
			devices.forEach(function(device) {
				if(0 < device.deviceId.length) {
					if(device.kind == "videoinput") {
						isHaveVideoinput  = true;
					} else if(device.kind == "audioinput") {
						isHaveAudioinput  = true;
					} else if(device.kind == "audiooutput") {
						isHaveAudiooutput = true;
					}
					if(device.deviceId == use_camera_id || (USER_PARAM_BROWSER == "Safari" && device.deviceId && use_camera_id == "default")) {
						// iPadデスクトップ表示対応
						// use_camera_idの初期値”default”に対し、SafariのdeviceIdに”default”は存在しないためイコールにならない場合があるため
						is_use_camera_id_exist = true;
					}
				}
			});

			let err_list = [];
			let img_element = '<img class="icon_help" src=\"'+IMG_HELP+'\">';
			let a_element   = null;
			if(!isHaveVideoinput) {
				a_element = '<a href="#" onclick="openVdoQ()" class="tooltip">'+img_element+'</a>';
				err_list.push("※カメラがOFFになっているかお使いのブラウザでカメラが許可されていません"+a_element);
				NEGOTIATION.isMyCameraOn = false;
			}
			if(!isHaveAudioinput){
				a_element = '<a href="#" onclick="openMicQ()" class="tooltip">'+img_element+'</a>';
				err_list.push("※マイクがOFFになっているかお使いのブラウザでマイクが許可されていません"+a_element);
				NEGOTIATION.isMyMicOn = false;
			}
			if(0 < err_list.length) {

				$("#error_messeg").html(err_list.join('<br>'));
				$("#error_messeg").show();
				$('.tooltip').tooltipster({
					contentAsHTML: true,
					interactive: true,
					theme: 'Default',
					animation: 'fade',
					trigger: 'hover',
					zIndex: 200000001,
					content: 'マークをクリックしてヘルプを参照できます。<br><a href="#" class="link-dialog" style="color: #fff!important; text-decoration: underline;" onclick="openSettingDialog()">設定</a>&nbsp;からマイクとカメラの許可が行えます。',
					contentCloning: false
				});
			}

			success();

		})
		.catch(function(err) {
		  console.log(err);
		})
		.finally(function(info) {
			reloadFlg = false;
			if (reloadFlg == false) {
				clearTimeout(reload);
			};
		});	    // 処理
	}, 500);

}

function openSettingDialog() {
	document.getElementById("button_setting_camera_dialog").click();
}



// 非推奨環境を使用時、アラートを表示する
function recommendEnvironmentAlert() {

	RECOMMENDED_CHECK.alertMeasureNetworkSpeedMbps(function(device, mbps) {
		const normal_level = RECOMMENDED_CHECK.NETWORK_SPEED_MBPS_THRESHOLD_ON_PC;
		const low_level    = RECOMMENDED_CHECK.NETWORK_SPEED_MBPS_THRESHOLD_ON_PC;

		if(device == "windows" && mbps < normal_level){
			$(".cause").append('<li>ご利用のインターネット速度が低速です</li>');
		}
		if(device == "mac" && mbps < normal_level){
			$(".cause").append('<li>ご利用のインターネット速度が低速です</li>');
		}
		if(device == "ipad" && mbps < low_level){
			$(".cause").append('<li>ご利用のインターネット速度が低速です</li>');
		}
		if(device == "android_tablet" && mbps < low_level){
			$(".cause").append('<li>ご利用のインターネット速度が低速です</li>');
		}

		if(0 < $(".non_reccomend_modal li").length) {
			$(".non_reccomend_modal").show();
		}
	});
	RECOMMENDED_CHECK.alertWindowsOSLowVersion(function() {
		$(".cause").append('<li>ご利用のWindows機器は推奨OSではございません</li>');
	});
	RECOMMENDED_CHECK.alertMacOSLowVersion(function() {
		$(".cause").append('<li>ご利用のPCは推奨OSではございません</li>');
	});
	RECOMMENDED_CHECK.alertiPadLowVersion(function() {
		$(".cause").append('<li>ご利用のiOSタブレットは推奨OSではございません</li>');
	});
	RECOMMENDED_CHECK.alertChromeLowVersion(function() {
		$(".cause").append('<li>ご利用のブラウザが最新版ではないため、動作が不安定になる場合がございます</li>');
	});
	RECOMMENDED_CHECK.alertSafariLowVersion(function() {
		$(".cause").append('<li>ご利用のブラウザが最新版ではないため、動作が不安定になる場合がございます</li>');
	});
	RECOMMENDED_CHECK.alertBrowserNotChromOrChromium(function() {
		$(".cause").append('<li>拡張機能がご利用いただけないブラウザです</li>');
	});
	RECOMMENDED_CHECK.alertDeviceLowMemory(function() {
		$(".cause").append('<li>ご利用のパソコンのメモリが不足しております</li>');
	});
	if(0 < $(".non_reccomend_modal li").length) {
		$(".non_reccomend_modal").show();
	}

}
function closenonReccomendModal() {
	$(".non_reccomend_modal").hide();
	$(".cause").empty()
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
var lockedRoomParams = {locked_token: last_locked_token, status: 0, connection_info_id:0};

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
