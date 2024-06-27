var mOldReceiveBandwidthLevel = -1;
var mFlashCameraArray = new Array();
var mFlashMicArray = new Array();

const BEAUTY_MODE_BRIGHT_VALUE = 150;		// ビューティーモードON時の輝度の値
const FRAMERATE_DEFAULT_VALUE = 10;         // フレームレートのデフォルト値

/* 映像品質選択 */
// (320×240)：低
// (640×480)：中低：初期
// (960×540)：中
// (1280×720)：高
const lowestVideoContraints  = { width: 320, height: 240 };
const lowVideoContraints     = { width: 640, height: 480 };
const middleVideoContraints  = { width: 640, height: 360 };
const highVideoContraints    = { width: 960, height: 540 };
const highestVideoContraints = { width: 1280, height: 720 };

// オーディオコンテンツ
window.AudioContext = window.AudioContext || window.webkitAudioContext;
var setingvideoInput;   // ビデオエレメント
var settinglocalStream; // ストリームオブジェクト
// var animationId;        // アニメーションフレームID
// var analyser;           // オーディオソース情報

/**
 * navigator.mediaDevices.getUserMedia チェック
 *
 */
const checkDevice = function(){

		// カメラデバイス変更イベント登録
		if (USER_PARAM_BROWSER != 'IE') {
			new Promise (function(resolve, reject){
				var camera = $('#setting-camera-dialog-camera-list').val();
				var audio = $('#setting-camera-dialog-mic-list').val();

				// マイクブロック時にnullとなるため
				if(!audio){audio = "default";}

				if (camera) {
					resolve (camera);
				}else {
					reject();
				}
			}).then(function(camera){
				initVideoDevice(camera);
			}).catch();

			$('#setting-camera-dialog-camera-list').off();
			$('#setting-camera-dialog-camera-list').on("change",function() {
				new Promise (function(resolve, reject){
					var camera = $('#setting-camera-dialog-camera-list').val();
					var audio = $('#setting-camera-dialog-mic-list').val();

					// マイクブロック時にnullとなるため
					if(!audio){audio = "default1";}

					if (camera , audio) {
						resolve (camera, audio);
					}else {
						reject();
					}
				}).then(function(camera, audio){
					initDevice(camera, audio);
				})
			});
		}


		// マイクデバイス変更イベント登録
		if (USER_PARAM_BROWSER != 'IE') {
			new Promise (function(resolve, reject){
				var camera = $('#setting-camera-dialog-camera-list').val();
				var audio = $('#setting-camera-dialog-mic-list').val();

				// マイクブロック時にnullとなるため
				if(!audio){audio = "default";}

				if (camera, audio) {
					resolve (camera, audio);
				}else {
					reject();
				}
			}).then(function(camera, audio){
				if(audio == undefined) {audio = "default";}
				initAudioDevice(camera, audio);
			}).catch();
		}

		// フレームレート変更イベント登録
		if (USER_PARAM_BROWSER != 'Edge' || USER_PARAM_BROWSER != 'Firefox' || USER_PARAM_BROWSER != 'Safari') {
			$('#video-setting-framerate').off();
			$('#video-setting-framerate').on("change",function() {
				new Promise (function(resolve, reject){
					var camera = $('#setting-camera-dialog-camera-list').val();
					var audio = $('#setting-camera-dialog-mic-list').val();

					// マイクブロック時にnullとなるため
					if(!audio){audio = "default1";}

					if (camera , audio) {
						resolve (camera, audio);
					}else {
						reject();
					}
				}).then(function(camera, audio){
					initDevice(camera, audio);
				})
			});
		}

		// 輝度変更イベント登録
		if (USER_PARAM_BROWSER === 'Chrome' || USER_PARAM_BROWSER === 'Firefox' || USER_PARAM_BROWSER === 'Safari') {
			$('#video-setting-brightness').off();
			$('#video-setting-brightness').on("change", function(){
				new Promise (function(resolve, reject){
					var camera = $('#setting-camera-dialog-camera-list').val();
					var audio = $('#setting-camera-dialog-mic-list').val();

					// マイクブロック時にnullとなるため
					if(!audio){audio = "default";}

					if (camera , audio ) {
						resolve (camera, audio);
					}else {
						reject();
					}
				}).then(function(camera, audio){
					initDevice(camera, audio);
				}).then(function(){
					setBrightnessVal(document.querySelector('#video-setting-brightness').value);
				}).catch();
			});
		}

		// 映像の品質変更イベント登録
		if (USER_PARAM_BROWSER != 'Edge') {

			$('input[name="receive_bandwidth_level"]').off();
			$('input[name="receive_bandwidth_level"]').on("change", function(){
				new Promise (function(resolve, reject){
					var camera = $('#setting-camera-dialog-camera-list').val();
					var audio = $('#setting-camera-dialog-mic-list').val();

					// マイクブロック時にnullとなるため
					if(!audio){audio = "default";}

					if (camera , audio) {
						resolve (camera, audio);
					}else {
						reject();
					}
				}).then(function(camera, audio){
					initDevice(camera, audio);
				}).catch();
			});
		}


		// ビューティーモード変更イベント登録
		if (USER_PARAM_BROWSER === 'Chrome' || USER_PARAM_BROWSER === 'Firefox' || USER_PARAM_BROWSER === 'Safari') {

			$('input[name="beauty_mode"]').off();
			$('input[name="beauty_mode"]').on("change", function(){
				let beauty_mode2 = $("input[name=beauty_mode]:checked").val();
				if (beauty_mode2) {
					settingBeautyMode2(beauty_mode2);
				}
			});
		}

		// ボリューム変更イベント登録
		if (USER_PARAM_BROWSER != 'IE') {
			$('#audio_vol').off();
			$('#audio_vol').on("change",function(){

				let audioVol = document.querySelector('#audio_vol');
				if (audioVol) {
					bgm1.volume = audioVol.value;
				}
			});
		}

		$('#btnAudioTest').off('click');
		// Tooltipの設定
		$('#btnAudioTest').tooltipster({
			contentAsHTML: true,
			interactive: true,
			maxWidth: 200,
			theme: 'Default',
			animation: 'fade',
			trigger: 'hover',
			zIndex: 200000001,
			content: '<span class=".tooltip_ster">再生ボタンを押すとテスト音声が流れます。<br/><br/>再生ボタンの右横にある白いボタンを左右に動かし、音量を調節することができます。<br/><br/>テスト音声が聞こえないなどの問題が発生しましたらこのヘルプマークをクリックしてヘルプをご参照ください。</span>',
			contentCloning: false
		})
		// // クリック時の動作を設定
		.on('click', function() {
				// リンク左記へ
		});

};

var setingconstraints = {
    audio: false,
    // video: lowVideoContraints
};

/**
 * デバイスの初期化
 * @param {*} camera_id
 * @param {*} audio_id
 */
const initDevice = function (camera_id, audio_id){
	new Promise(function(resolve, reject) {

		// 音声デバイス
		if (NEGOTIATION.isMyMicCanUse) {
			setingconstraints.audio = true;
		}else {
			setingconstraints.audio = false;
		}

		// 映像の品質
		if (USER_PARAM_BROWSER != 'Edge') {
			var localVideoResolution = $('input[name="receive_bandwidth_level"]:checked').val() || 'low';
			setingconstraints.video = getVideoConstraints(localVideoResolution);
		}

		// frameRate
		// 上のgetVideoConstraints()の中で設定されるデフォルト値をここで上書きしている
		if (USER_PARAM_BROWSER != 'Edge' || USER_PARAM_BROWSER != 'Firefox' || USER_PARAM_BROWSER != 'Safari') {
			let frameRate = document.querySelector('#video-setting-framerate');
			let framerateVal = FRAMERATE_DEFAULT_VALUE; //デフォルト
			if(setingconstraints.video){
				setingconstraints.video.frameRate = framerateVal;
				if (frameRate) {
					setingconstraints.video.frameRate = frameRate.value;
					framerateVal = frameRate.value;
				}
				setFramerateValue(frameRate.value);
			}
		}

		// brightness(輝度)
		if (USER_PARAM_BROWSER === 'Chrome' || USER_PARAM_BROWSER === 'Firefox' || USER_PARAM_BROWSER === 'Safari') {
			let brightness = document.querySelector('#video-setting-brightness');
			if (brightness) {
				setBrightnessVal(brightness.value);
			}
		}

		// Close
		if(USER_PARAM_BROWSER != 'IE'){
			if(settinglocalStream) {
				settinglocalStream.getTracks().forEach(function(track){
					track.stop();
				});
				settinglocalStream = null;
			}
		}

		if(setingconstraints.video && camera_id != 'null') {
			setingconstraints.video.deviceId = {exact: camera_id};
		}

		// メディア取得
		if (setingconstraints) {
			var stream = navigator.mediaDevices.getUserMedia(setingconstraints);
			resolve (stream);
		}else {
			reject();
		}
	})
	.then(function(stream){
		successMedia(stream);
	})
	.catch (function(stream){
		errorMedia(stream);
	})
};

// カメラのみ初期化
const initVideoDevice = function (camera_id){
	new Promise(function(resolve, reject) {
		// ビデオデバイス
		if (NEGOTIATION.isMyCameraCanUse) {
			setingconstraints.video = lowVideoContraints;
			setingconstraints.video.deviceId = camera_id;
		}
		else {
			setingconstraints.video = true;
		}
		// 音声デバイス
		if (NEGOTIATION.isMyMicCanUse) {
			setingconstraints.audio = true;
		}else {
			// マイクブロック下でも取得できるようにする
			setingconstraints.audio = false;
		}

		// メディア取得
		if (setingconstraints) {
			var stream = navigator.mediaDevices.getUserMedia(setingconstraints);
			resolve (stream);
		}else {
			reject();
		}
	})
	.then(function(stream){
		successVideoMedia(stream);
	})
	.catch (function(stream){
		errorMedia(stream);
	})
};

// マイクのみ初期化
const initAudioDevice = function(camera_id, audio_id) {
	new Promise(function(resolve, reject) {

		// ビデオデバイス
		if (NEGOTIATION.isMyCameraCanUse) {
			setingconstraints.video = lowVideoContraints;
		} else {
			// カメラブロック下でも取得できるようにする
			setingconstraints.video = false;
		}
		// 音声デバイス
		if (NEGOTIATION.isMyMicCanUse) {
			setingconstraints.audio = true;
		}else {
			setingconstraints.audio = false;
		}

		// メディア取得
		if (setingconstraints) {
			var stream = navigator.mediaDevices.getUserMedia(setingconstraints);
			resolve (stream);
		}else {
			reject();
		}
	}).then(function(stream){
		successAudioMedia(stream);
	})
	.catch (function(stream){
		errorMedia(stream);
	})
};

//マイクデバイスが存在していると確認できたら終了する
const stopDevices = function() {
	var videoTrack = document.getElementById('video-input');
	if(videoTrack){
		if(videoTrack.srcObject){
			videoTrack.pause();
		}
	}
}

/**
 * デバイスの初期化で失敗したときに呼ばれる
 * @param {*} stream
 */
var errorMedia = function(stream) {
	console.log("errorMedia", stream);
	console.error('カメラの起動に失敗しました', "カメラが起動しない", "javascript: moveTrouble(3);");
};

/**
 * デバイスの初期化で成功したときに呼ばれる
 * @param {*} stream
 */
var successMedia = function(stream){
	settinglocalStream = stream;
	if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
		console.error('カメラの起動に失敗しました');
		return;
	}
	const videoTrack = document.getElementById('video-input');
	// streamから取得したvideoとaudioを再生
	if('srcObject' in videoTrack) {
		videoTrack.muted = true; // ハウリングしてしまうのでミュートにする
		videoTrack.srcObject = settinglocalStream;
	} else {
		videoTrack.src = window.URL.createObjectURL(stream);
	}
	videoTrack.play().catch(console.error);

	// マイクの音声ビジュアライザ作成
	visualizer(settinglocalStream);

	return videoTrack;
}

var successVideoMedia = function(stream){
	settinglocalStream = stream;
	if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
		console.error('カメラの起動に失敗しました');
		return;
	}
	const videoTrack = document.getElementById('video-input');
	// streamから取得したvideoとaudioを再生
	if('srcObject' in videoTrack) {
		videoTrack.muted = true; // ハウリングしてしまうのでミュートにする
		videoTrack.srcObject = settinglocalStream;
	} else {
		videoTrack.src = window.URL.createObjectURL(stream);
	}
	videoTrack.play().catch(console.error);

	return videoTrack;
}

var successAudioMedia = function(stream){
	settinglocalStream = stream;
	if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
		console.error('カメラの起動に失敗しました');
		return;
	}
	const videoTrack = document.getElementById('video-input');
	// streamから取得したvideoとaudioを再生
	if('srcObject' in videoTrack) {
		videoTrack.muted = true; // ハウリングしてしまうのでミュートにする
		videoTrack.srcObject = settinglocalStream;
	} else {
		videoTrack.src = window.URL.createObjectURL(stream);
	}
	videoTrack.play().catch(console.error);
	// マイクの音声ビジュアライザ作成
	visualizer(settinglocalStream);

	return videoTrack;
}

// デバイス情報をプルダウンに設定
function setCameraDevicesToPullDown(devices) {
	// カメラ＆マイクのデバイス情報設定
	if (devices) {

		var videoSelect = $('#setting-camera-dialog-camera-list');
		if (videoSelect) {
			videoSelect.empty();
			var device,text,select;

			for (var i = 0; i !== devices.length; ++i) {
				device = devices[i];

				// カメラであるか？
				if (device.kind === 'videoinput') {
					text = device.label;
					var select = (device.deviceId == NEGOTIATION.use_camera_id) ? "selected" : "";
					videoSelect.append('<option value="' + device.deviceId + '" '+ select +'>' + text + '</option>');
					mFlashCameraArray.push(device.deviceId);
				// 音声入力であるか
				} else if (device.kind === 'audioinput') {
				// 音声出力であるか
				} else if (device.kind === 'audiooutput') {
				// その他のデバイス
				} else {
				}
			}

			mFlashCameraArray = new Array();

			// カメラのON／OFFを表示
			if (NEGOTIATION.isMyCameraOn) {
				// ビデオON
				$('#video-input').show();
				$('#video-off').hide();
				$('#video-off-area').hide();

				$('#video_stat').text("ＯN");
				$('#video_stat').removeClass('text-meetin-color-off');
				$('#video_stat').addClass('text-meetin-color');
			} else {
				// ビデオOFF
				$('#video-input').hide();
				$('#video-off').show();
				$('#video-off-area').show();

				$('#video_stat').text("ＯＦＦ");
				$('#video_stat').removeClass('text-meetin-color');
				$('#video_stat').addClass('text-meetin-color-off');
			}
		}

		var micSelect = $('#setting-camera-dialog-mic-list');
		if (micSelect) {
			micSelect.empty();
			var device,text,select;

			mFlashMicArray = new Array();
			appendedGroupId = new Array();

			for (var i = 0; i !== devices.length; ++i) {
				device = devices[i];

				// カメラであるか？
				if (device.kind === 'videoinput') {
				// 音声入力であるか
				} else if (device.kind === 'audioinput') {
					// 同じグループIDは除外する
					if(device.groupId != "") {
						if(appendedGroupId.includes(device.groupId)) {
							continue;
						}
						appendedGroupId.push(device.groupId);
					}

					// リストに追加
					text = device.label;
					var select = (device.deviceId == NEGOTIATION.use_mic_id) ? "selected" : ""; 
					micSelect.append('<option value="' + device.deviceId + '" '+ select +'>' + text + '</option>');
					mFlashMicArray.push(device.deviceId);
				// 音声出力であるか
				} else if (device.kind === 'audiooutput') {
				// その他のデバイス
				} else {
				}
			}

			// マイクのON／OFFを表示
			if (NEGOTIATION.isMyMicOn) {
				// マイクON
				$('#audio-off').hide();
				$('#audio_stat').text("ＯN");
				$('#audio_stat').removeClass('text-meetin-color-off');
				$('#audio_stat').addClass('text-meetin-color');
			} else {
				// マイクOFF
				$('#audio-off').show();
				$('#audio_stat').text("ＯＦＦ");
				$('#audio_stat').removeClass('text-meetin-color');
				$('#audio_stat').addClass('text-meetin-color-off');
			}
		}

		// スピーカーのリスト作成.
		var speakerSelect = $('#setting-camera-dialog-speaker-list');
		if (speakerSelect) {
			speakerSelect.empty();
			var device,text,select;

			mFlashSpeakerArray = new Array();
			appendedGroupId = new Array();

			let speaker_status = false; // スピーカーがあるか.
			for (var i = 0; i !== devices.length; ++i) {
				device = devices[i];
				// 音声出力デバイス＝スピーカー系(イヤホン等かもしれない).
				if (device.kind === 'audiooutput') {
					// 同じグループIDは除外する
					if(device.groupId != "") {
						if(appendedGroupId.includes(device.groupId)) {
							continue;
						}
						appendedGroupId.push(device.groupId);
					}

					// リストに追加
					text = device.label;
					var select = (device.deviceId == NEGOTIATION.use_speaker_id) ? "selected" : ""; 
					speakerSelect.append('<option value="' + device.deviceId + '" '+ select +'>' + text + '</option>');
					mFlashSpeakerArray.push(device.deviceId);

					if(device.deviceId != "") {
						speaker_status = true; // ユーザがデバイスを許可していない場合 deviceId や label だけ空になる.
					}
				}
				// その他のデバイス
			}

			// スピーカーのON／OFFを表示
			if (speaker_status) {
				$('#speaker_stat').text("ＯN");
				$('#speaker_stat').removeClass('text-meetin-color-off');
				$('#speaker_stat').addClass('text-meetin-color');
				$('#setting-camera-dialog-speaker-select-area').addClass('active');
			} else {
				$('#speaker_stat').text("ＯＦＦ");
				$('#speaker_stat').removeClass('text-meetin-color');
				$('#speaker_stat').addClass('text-meetin-color-off');
				$('#setting-camera-dialog-speaker-select-area').removeClass('active');
			}

		}




		//カメラの各項目の情報をlocalStrageから取得し各項目に反映する
		getCameraConstraints();
	}

	/**
	 *  IE メディア情報取得＆更新
	 */
	if(USER_PARAM_BROWSER === 'IE'){
		var videoSelectFlash = $('#setting-camera-dialog-camera-list-flash');
		if (videoSelectFlash) {
			videoSelectFlash.empty();
			if (mMeetinFlashCameraNameArray.length > 0) {
				for (var i = 0; i !== mMeetinFlashCameraNameArray.source.length; ++i) {
					text = mMeetinFlashCameraNameArray.source[i];
					var select = (i == NEGOTIATION.use_camera_id_flash) ? "selected" : ""; 
					videoSelectFlash.append('<option value="' + i + '" '+ select +'>' + text + '</option>');
				}
			}
		}

		var micSelectFlash = $('#setting-camera-dialog-mic-list-flash');
		if (micSelectFlash) {
			micSelectFlash.empty();
			if (mMeetinFlashMicNameArray.length > 0) {
				for (var i = 0; i !== mMeetinFlashMicNameArray.source.length; ++i) {
					text = mMeetinFlashMicNameArray.source[i];
					var select = (i == NEGOTIATION.use_mic_id_flash) ? "selected" : "";
					micSelectFlash.append('<option value="' + i + '" '+ select +'>' + text + '</option>');
				}
			}
		}
	}

	/**
	 * 他ブラウザ　メディア情報を取得＆更新する
	 */
	if(USER_PARAM_BROWSER != 'IE'){
		checkDevice();
	}else {
		// フレームレート変更イベント登録
		var videoFramerateFlash = $('#video-setting-framerate');
		let frameRate = document.querySelector('#video-setting-framerate');
		videoFramerateFlash.off();
		videoFramerateFlash.on("change",function(){
			// デフォルト
			var framerateVal = FRAMERATE_DEFAULT_VALUE;
			if (frameRate) {
				framerateVal = frameRate.value;
			}
			$('#video-setting-framerate').val(framerateVal);
			setFramerateValue(framerateVal);
			$('#video-setting-framerate').css("padding-bottom", "17px");
		});

		// 映像の品質変更イベント登録
		$('input[name="receive_bandwidth_level"]').off();
		$('input[name="receive_bandwidth_level"]').on("change",function(){
			var localVideoResolution = $('input[name="receive_bandwidth_level"]:checked').val() || 'low';
			setingconstraints.video = getVideoConstraints(localVideoResolution);
		});
	}


	let cameraDialogTitle = "マイク・カメラ・スピーカー設定";
	if(USER_PARAM_BROWSER !== 'Chrome'){
		cameraDialogTitle = "マイク・カメラ設定";
	}
	$("#setting-camera-dialog").dialog(

		{
			modal: true,
			draggable: false,
			resizable: false,
			closeOnEscape: false,
			position: { my: "center", at: "center", of: window },
			show: 'blind',
			hide: 'blind',
			title: cameraDialogTitle,
			width: 680,
			dialogClass: 'modal_content',
			open: function() {						// open event handler
				$(this)								// the element being dialogged
				.parent()							// get the dialog widget element
				.find(".ui-dialog-titlebar-close")	// find the close button for this dialog
				.hide();							// hide it

				mOldReceiveBandwidthLevel = getReceiveBandwidthLevel();

				$('input[name=receive_bandwidth_level]').val([mOldReceiveBandwidthLevel]);
			}
		}
	);
}

// カメラ設定ダイアログを出す
$('#button_setting_camera_dialog').click(function(){
	// Safariを除外
	if (USER_PARAM_BROWSER === 'IE') {
		setCameraDevicesToPullDown(null);
	} else {
		var $videoSelect = $('#setting-camera-dialog-camera-list');
		var $micSelect = $('#setting-camera-dialog-mic-list');
		// 利用可能なカメラとマイクをプルダウンに入れる
		$videoSelect.children().remove();
		$micSelect.children().remove();
		// デバイス情報一覧を取得
		navigator.mediaDevices.enumerateDevices()
		.then(function(device){
			setCameraDevicesToPullDown(device);
		})
		.catch(function(err) {
			setCameraDevicesToPullDown(null);
		});
	}
});

// カメラ設定ダイアログを閉じる
$('#setting-camera-dialog-cancel-button').click(function(){

	if (USER_PARAM_IS_IPAD_PC) {
		if (NEGOTIATION.isMyCameraOn) {
			$('#button_camera').trigger("click");
			$('#button_camera').trigger("click");
		}
		if (NEGOTIATION.isMyMicOn) {
			$('#button_mic').trigger("click");
			$('#button_mic').trigger("click");
		}
	}

	// スピーカーのテスト音声 鳴りっぱなしを止める.
	let bgm1 = document.querySelector("#bgm1");
	if(bgm1 && !bgm1.paused){
		let btnPlay  = document.querySelector("#btn-play");
		bgm1.pause();
		btnPlay.innerHTML = '<img src="/img/audio-play.svg"  width="50">';
	}
	// スピーカーの設定 キャンセルを押したのだから元に戻す.
	setSpeakerDevice(NEGOTIATION.use_speaker_id);

	//モーダル内のvideo停止
	stopDevices();
	$("#setting-camera-dialog").dialog("close");
});

// カメラを設定する
$('#setting-camera-dialog-save-button').click(function(){

	// スピーカーのテスト音声 鳴りっぱなしを止める.
	let bgm1 = document.querySelector("#bgm1");
	if(bgm1 && !bgm1.paused){
		let btnPlay  = document.querySelector("#btn-play");
		btnPlay.innerHTML = '<img src="/img/audio-play.svg"  width="50">';  // 「再生ボタン」に切り替え
		bgm1.pause();
	}

	if (NEGOTIATION.mIsScreenOn) {
		createModalOkDialog("お知らせ", "画面共有中は変更できません");
	}
	else {
		// ビューティーモードの変更処理（現行処理に影響を与えないように、別途処理を記述かつ、再接続前にメッセージを送信したいので、先に記述）
		if(localStorage.getItem('beauty_mode') != $("input[name=beauty_mode]:checked").val()){
			// 変更時はストレージの値を変更する（入室時に初期化済み）
			localStorage.setItem('beauty_mode', $("input[name=beauty_mode]:checked").val());
			// 入室中の全ユーザーにビューティーモード変更の通知を行う
			var data = {
					command : "BEAUTY_MODE",
					requestUserId : $('#user_id').val(),
					beautyMode : localStorage.getItem('beauty_mode')
			};
			if(typeof sendCommand !== "undefined") {
				sendCommand(SEND_TARGET_ALL, data);
			}
		}

		// カメラとマイクの設定(解像度またはフレームレート)を変更した場合、画面をリロードし再接続を行わないと反映されないため
		if(settingApply()){
			// 商談画面再接続(確認ダイアログなし)
			// ※location.reload() だと再ログインになってしまうため、商談再接続と同様な処理にする(ただし確認ダイアログは不要！)
			negotiationMainReconnectNotDialog();
//			location.reload();
		}
	}

	//モーダル内のvideo停止
	stopDevices();

	$("#setting-camera-dialog").dialog("close");
});

/**
 * カメラとマイク設定(保存)イベント処理
 */
function settingApply(){
//	var config = MY_CAMERA_RESOLUTION;
	var config = getVideoConstraints("idealVga");	// カメラの解像度;

// モバイル対応
	// 取得(モバイルのカメラ状態を取得)
	// 念のため、use_camera_idも取得しているが、Safariの場合、画面のリロードで
	// IDが変わってしまうために、Safari以外のブラウザで使用すること。
	if(NEGOTIATION.localStorageFlg){
		NEGOTIATION.use_camera_id = localStorage.getItem('use_camera_id');
		NEGOTIATION.use_camera_facingMode = localStorage.getItem('use_camera_facingMode');
		NEGOTIATION.use_mic_id = localStorage.getItem('use_mic_id');
		NEGOTIATION.use_speaker_id = localStorage.getItem('use_speaker_id');
		}

// モバイル対応
console.log("OLD_facing:[" + NEGOTIATION.use_camera_facingMode + "]");
	if( NEGOTIATION.use_camera_facingMode ) {
		// カメラIDが切り替わった
		NEGOTIATION.use_camera_facingMode = NEGOTIATION.use_camera_facingMode === "user" ? "environment":"user";
console.log("カメラIDが切り替:("+ NEGOTIATION.use_camera_facingMode +")");
	}

	NEGOTIATION.use_camera_id_flash = $('#setting-camera-dialog-camera-list-flash option:selected').val();
	NEGOTIATION.use_camera_id = $('#setting-camera-dialog-camera-list option:selected').val() || NEGOTIATION.use_camera_id;
	NEGOTIATION.use_mic_id_flash = $('#setting-camera-dialog-mic-list-flash option:selected').val();
	NEGOTIATION.use_mic_id = $('#setting-camera-dialog-mic-list option:selected').val() || NEGOTIATION.use_mic_id;
	NEGOTIATION.use_speaker_id = $('#setting-camera-dialog-speaker-list option:selected').val() || NEGOTIATION.use_speaker_id;
	NEGOTIATION.use_fps = $('#video-setting-framerate').val();
	NEGOTIATION.use_bright = $('#video-setting-brightness').val();

	if (mFlashCameraArray.length > 0) {
		for (var i = 0; i < mFlashCameraArray.length; ++i) {
			if (mFlashCameraArray[i] === NEGOTIATION.use_camera_id) {
				NEGOTIATION.use_camera_id_flash = i;
				break;
			}
		}
	}
	if (mFlashMicArray.length > 0) {
		for (var i = 0; i < mFlashMicArray.length; ++i) {
			if (mFlashMicArray[i] === NEGOTIATION.use_mic_id) {
				NEGOTIATION.use_mic_id_flash = i;
				break;
			}
		}
	}

	var brightVal = 100 + parseInt(NEGOTIATION.use_bright);

	var newReceiveBandwidthLevel = $('input[name="receive_bandwidth_level"]').filter(':checked').val();

	var flashvars = getFlashVideoFlashvars(config);
	flashvars.cameraWidth = DEFAULT_FLASH_CAMERA_WIDTH;
	flashvars.cameraHeight = DEFAULT_FLASH_CAMERA_HEIGHT;

	// 選択された品質の値によって、Qualityを変更
	switch (newReceiveBandwidthLevel) {
		case '0':		// 低
			flashvars.cameraQuality = '20';
			break;
		case '1':		// 中低
			flashvars.cameraQuality = '40';
			break;
		case '2':		// 中
			flashvars.cameraQuality = '60';
			break;
		case '3':		// 中高
			flashvars.cameraQuality = '80';
			break;
		case '4':		// 高
			flashvars.cameraQuality = '100';
			break;
		default:
			break;
	}

	// セッションに保存する
	if(NEGOTIATION.localStorageFlg){
		localStorage.setItem('use_camera_id', NEGOTIATION.use_camera_id);
		localStorage.setItem('use_camera_id_flash', NEGOTIATION.use_camera_id_flash);
		localStorage.setItem('use_mic_id', NEGOTIATION.use_mic_id);
		localStorage.setItem('use_speaker_id', NEGOTIATION.use_speaker_id);
		localStorage.setItem('use_mic_id_flash', NEGOTIATION.use_mic_id_flash);
		localStorage.setItem('use_fps', NEGOTIATION.use_fps);
		localStorage.setItem('use_bright', NEGOTIATION.use_bright);
		localStorage.setItem('send_bandwidth_level', newReceiveBandwidthLevel);
		localStorage.setItem('receive_bandwidth_level', newReceiveBandwidthLevel);
		localStorage.setItem('use_quality',  flashvars.cameraQuality);
		// モバイル対応
		localStorage.setItem('use_camera_facingMode', NEGOTIATION.use_camera_facingMode);

	}

	meetinFlashMyVideo_changeCamera(NEGOTIATION.use_camera_id_flash, flashvars.cameraWidth, flashvars.cameraHeight, NEGOTIATION.use_fps, flashvars.cameraBandwidth, flashvars.cameraQuality);
	var userId = $('#user_id').val();
	for (var i = 0; i < MEETIN_MAIN_MAX_PEOPLE; ++i) {
		if (i != userId) {
			meetinFlashTargetVideo_changeCamera(i, NEGOTIATION.use_camera_id_flash, flashvars.cameraWidth, flashvars.cameraHeight, NEGOTIATION.use_fps, flashvars.cameraBandwidth, flashvars.cameraQuality);
		}
	}

	meetinFlashMyVideo_changeMic(NEGOTIATION.use_mic_id_flash);
	var userId = $('#user_id').val();
	for (var i = 0; i < MEETIN_MAIN_MAX_PEOPLE; ++i) {
		if (i != userId) {
			meetinFlashTargetVideo_changeMic(i, NEGOTIATION.use_mic_id_flash);
		}
	}

	// 輝度設定
	if ('Chrome' === USER_PARAM_BROWSER) {
		const userId = $('#user_id').val();
		$('#video_target_video_' + userId).css('filter','brightness('+brightVal+'%)');
	}

	// ビューティーモードとは別で、輝度はcssで調節するため、コマンドとして送信
	var data = {
		command : "CAMERA_BRIGHT",
		requestUserId : $('#user_id').val(),
		cameraBright : localStorage.getItem('use_bright')
	};
	if(typeof sendCommand !== "undefined") {
		sendCommand(SEND_TARGET_ALL, data);
	}

	if (NEGOTIATION.isMyCameraOn) {
		$('#button_camera').trigger("click");
		$('#button_camera').trigger("click");
	}

	if (NEGOTIATION.isMyMicOn) {
		$('#button_mic').trigger("click");
		$('#button_mic').trigger("click");
	}

	return (mOldReceiveBandwidthLevel != newReceiveBandwidthLevel);
};

/**
 * カメラ(コンフィグ)設定処理
 * ・画面解像度
 * ・フレームレート
 */
function getCameraConstraints() {
	NEGOTIATION.use_camera_id = localStorage.getItem('use_camera_id');
	NEGOTIATION.use_fps = localStorage.getItem('use_fps');
	NEGOTIATION.use_bright = localStorage.getItem('use_bright');

	// モバイル対応
	NEGOTIATION.use_camera_facingMode = localStorage.getItem('use_camera_facingMode');

	// 画面解像度
	var cameraQuality = localStorage.getItem('use_quality');
	if( !cameraQuality ) {
		cameraQuality = '20';
	}
	var videoConstraints = "idealQvga";
	switch (cameraQuality) {
		case '20':		// 低
			videoConstraints = "idealQvga";
			break;
		case '40':		// 中低
			videoConstraints = "idealVga";
			break;
		case '60':		// 中
			videoConstraints = "idealSvga";
			break;
		case '80':		// 中高
			videoConstraints = "idealHd";
			break;
		case '100':		// 高
			videoConstraints = "idealFull-hd";
			break;
		default:
			break;
	}
	var config = getVideoConstraints(videoConstraints);	// カメラの解像度

	// モバイル対応
	if ( !NEGOTIATION.use_camera_facingMode || NEGOTIATION.use_camera_facingMode === 'null') {
		NEGOTIATION.use_camera_facingMode = "user";
		localStorage.setItem('use_camera_facingMode', NEGOTIATION.use_camera_facingMode);
	}

	/**
	 * カメラ指定
	 * ・モバイルの場合はID指定ではなく、フロントorバック
	 */
	if( USER_PARAM_IS_MOBILE || USER_PARAM_IS_IPAD_PC) {
		// モバイル対応
		//config.video.facingMode = {exact: NEGOTIATION.use_camera_facingMode};
		config.video.facingMode = NEGOTIATION.use_camera_facingMode;
	}
	else {
		if (NEGOTIATION.use_camera_id && NEGOTIATION.use_camera_id != 'null') {
			// カメラID指定
			config.video.deviceId = {exact: NEGOTIATION.use_camera_id};
		}
		else {
			// カメラIDなし
			if( config.video.deviceId ) {
				// オプションに存在した場合、念のため削除
				delete config.video["deviceId"];
			}
		}
	}

	// フレームレート
	// ※2020/10/20現在　フレームレートの設定対応ブラウザはChrome,IE
	if (NEGOTIATION.use_fps) {
		$('#video-setting-framerate').val(NEGOTIATION.use_fps);
		setFramerateValue(NEGOTIATION.use_fps);

		// if ('Firefox' === USER_PARAM_BROWSER) {
		// 	config.video.frameRate = NEGOTIATION.use_fps;
		// }
		// Safariの場合「frameRate」を指定するとエラーになるので削除(2018/07/02)
		if (USER_PARAM_BROWSER === 'Safari') {
//			delete config.video["frameRate"];
		}
		if (USER_PARAM_BROWSER === 'Chrome') {
			config.video.frameRate = {max: NEGOTIATION.use_fps};
			$('#video-setting-framerate').val(NEGOTIATION.use_fps);
			setFramerateValue(NEGOTIATION.use_fps);
		}
	}

	// 画面のビューティーモードラジオの値を変更する（ただし、SPでは機能が存在しないので、PCの場合のみ設定する）
	if($("[name=beauty_mode]").length > 0){
		if(localStorage.getItem('beauty_mode') == BEAUTY_MODE_OFF){
			$("#beauty_mode_off").prop('checked', true);
		}else if(localStorage.getItem('beauty_mode') == BEAUTY_MODE_ON){
			$("#beauty_mode_on").prop('checked', true);
		}
	}


	// 輝度設定(明るさ)
	if ('Chrome' === USER_PARAM_BROWSER
	 || 'Safari' === USER_PARAM_BROWSER
	 || 'Firefox' === USER_PARAM_BROWSER ) {
		config.video.bright = {max: NEGOTIATION.use_bright};
		setBrightnessVal(NEGOTIATION.use_bright);
		$('#video-setting-brightness').val(NEGOTIATION.use_bright);
	}

	// ビューティーモードの反映
	settingBeautyMode($('#user_id').val(), localStorage.getItem('beauty_mode'));

	return config;
}

/**
 * マイク(コンフィグ)設定処理
 */
function getMicConstraints() {
	NEGOTIATION.use_mic_id = localStorage.getItem('use_mic_id');
	var constraints = {
	audio: {
		deviceId: NEGOTIATION.use_mic_id
		},
	};

	return constraints;
}

/**
 * マイクの音声ビジュアライザ
 *
 * ビジュアライズするための準備
 * successMedia()の処理の中でvisualizer(settinglocalStream)をコール
 *
 * @param {*} audioData
 */
var visualizer = function(audioData){
	var audioContext = new AudioContext();

	// AudioContextからAnalyserNodeを取得(分析情報を提供するAPI)
	// https://developer.mozilla.org/ja/docs/Web/API/AnalyserNode
	analyser = audioContext.createAnalyser();
	// 周波数領域を決定するために使われているサイズ
	analyser.fftSize = 128;

	// AudioContextを利用してMediaStreamAudioSourceNodeを取得
	var source = audioContext.createMediaStreamSource(audioData);
	// AudioSourceNodeを基にAnalyserNodeを利用して音量を取得
	source.connect(analyser);

	animationId = requestAnimationFrame(visualizeRender);
};

/**
 * マイクの音声ビジュアライザのレンダリング
 *
 * 音量の描画処理する関数
 * この関数はrequestAnimationFrame()を利用してアニメーション表示
 * 20段階で音量を表現していて、音量メータが動くことを目的としているため100を上限に切り捨てています
 */
var visualizeRender = function(){
	var volume = getVolume();

	if (100 < volume) {
		volume = 100;
	}

	var meters = $("#audio-meter > div");
	for (var i = 0; i < meters.length; i++) {
		if ((i * 5) < volume) {
            // $(meters[i]).removeClass("invisible");
			$(meters[i]).removeClass("bg-ber-off");
            $(meters[i]).addClass("bg-ber-on");
		}
		else {
			// $(meters[i]).addClass("invisible");
            $(meters[i]).removeClass("bg-ber-on");
			$(meters[i]).addClass("bg-ber-off");
		}
	}

	animationId = requestAnimationFrame(visualizeRender);

};

/**
 * audio要素の切り替え
 *
 */
$('#setting-camera-dialog-speaker-list').on("change",function(e) {
	setSpeakerDevice(e.target.value);
});
var setSpeakerDevice = function(use_speaker_id) {

	// MEMO. 各ブラウザーで足並みが揃っていない 現在 実装されているのはChromeのみ.
	if ('Chrome' !== USER_PARAM_BROWSER) {
		return;
	}

	[].slice.call(document.querySelectorAll('audio')).map(function(audio) {
		audio.setSinkId(use_speaker_id)
		.then(function() {
			console.log('Speaker is being played on ' + use_speaker_id);
		})
		.catch(function(err) {
			console.error('setSinkId Err:', err);
		});
	});
};

/**
 * ボリュームの取得
 *
 * 音量を取得するための処理
 * AnalyserNodeを利用した音量の取得処理はこの中にまとめています
 */
var getVolume = function() {
	var bit8 = new Uint8Array(analyser.frequencyBinCount);
	analyser.getByteFrequencyData(bit8);

	return bit8.reduce(function(previous, current) {
		return previous + current;
	}) / analyser.frequencyBinCount;
};


// <button>
//document.addEventListener("DOMContentLoaded", function(){
//	var window_q = null;
//	const btnVdoq  = document.querySelector('#btnVdoQ');
//	btnVdoq.addEventListener("click", function() {
//		openVdoQ();
//	});
//}, false);

function openVdoQ() {
	// サブウインドウの設定
	var subw = 720;   // サブウインドウの横幅
	var subh = 480;   // サブウインドウの高さ
	var subp = "https://meet-in.jp/lp/faq/video/camera_help.mp4";   // 表示するページ(URL)
	var subn = "WebinarQA";   // サブウインドウの名称

	// 表示座標の計算
	wTop = window.screenTop + (window.innerHeight / 2) - (subh / 2);
	wLeft = window.screenLeft + (window.innerWidth / 2) - (subw / 2);

	// サブウインドウのオプション文字列を作る
	var opsion = ",titlebar=0,menubar=0,toolbar=0,status=0";
	var SubWinOpt = "width=" + subw + ",height=" + subh + ",top=" + wTop + ",left=" + wLeft + opsion;

	// サブウインドウを表示
	window_q = window.open(subp, subn, SubWinOpt);
}


// <button>
//document.addEventListener("DOMContentLoaded", function(){
//	const btnMicq  = document.querySelector("#btnMicQ");
//	btnMicq.addEventListener("click", function() {
//		openMicQ();
//	});
//}, false);

function openMicQ() {
	// サブウインドウの設定
	var subw = 720;   // サブウインドウの横幅
	var subh = 480;   // サブウインドウの高さ
	var subp = "https://meet-in.jp/lp/faq/video/mic_help.mp4";   // 表示するページ(URL)
	var subn = "WebinarQA";   // サブウインドウの名称

	// 表示座標の計算
	wTop = window.screenTop + (window.innerHeight / 2) - (subh / 2);
	wLeft = window.screenLeft + (window.innerWidth / 2) - (subw / 2);

	// サブウインドウのオプション文字列を作る
	var opsion = ",titlebar=0,menubar=0,toolbar=0,status=0";
	var SubWinOpt = "width=" + subw + ",height=" + subh + ",top=" + wTop + ",left=" + wLeft + opsion;

	// サブウインドウを表示
	window_q = window.open(subp, subn, SubWinOpt);
	// window_micq = window.open("https://meet-in.jp/lp/faq/video/mic_help.mp4", "WebinarQA","width=720,height=480,titlebar=0,menubar=0,toolbar=0,status=0");
}



/**
 * 再生ボタン
 */
document.addEventListener("DOMContentLoaded", function(){
	const bgm1 = document.querySelector("#bgm1");       // <audio>
	const btnPlay  = document.querySelector("#btn-play");
	if(btnPlay){
		btnPlay.addEventListener('click', function() {
			// pausedがtrue=>停止, false=>再生中
			if(!bgm1.paused ){
				btnPlay.innerHTML = '<img src="/img/audio-play.svg"  width="50">';  // 「再生ボタン」に切り替え
				bgm1.pause();
			}
			else{
				btnPlay.innerHTML = '<img src="/img/audio-pause.svg" width="50">';  // 「一時停止ボタン」に切り替え
				bgm1.play();
			}
		});
	}
}, false);

/**
 * ビューティーモードの設定または、解除を行う
 * @param targetUserId	ビューティーモードのON/OFFを行うユーザーID
 * @param beautyMode	ビューティーモードのON/OFF
 * @returns
 */
function settingBeautyMode(targetUserId, beautyMode){
	// 操作するビデオのIDを作成
	var videoId = "#video_target_video_" + targetUserId;
	// ビューティーモード判定
	if(beautyMode == BEAUTY_MODE_ON){
		// ========================
		// ビューティーモードON
		// ========================
		// 輝度を設定
		$(videoId).css('filter','brightness('+BEAUTY_MODE_BRIGHT_VALUE+'%)');
		$(videoId).css('object-fit','fill');
	}else{
		// ========================
		// ビューティーモード OFF
		// ========================
		// 輝度を設定
		var brightVal = 100 + parseInt(NEGOTIATION.use_bright);
		const userId = $('#user_id').val();
		$('#video_target_video_' + userId).css('filter','brightness('+brightVal+'%)');
		$(videoId).css('object-fit','cover');
	}

}
function settingBeautyMode2(beautyMode){
	// 操作するビデオのIDを作成
	var videoId = "#video-input";
	// ビューティーモード判定
	if(beautyMode == BEAUTY_MODE_ON){
		// ========================
		// ビューティーモードON
		// ========================
		// 輝度を設定
		$(videoId).css('filter','brightness('+BEAUTY_MODE_BRIGHT_VALUE+'%)');
		$(videoId).css('object-fit','fill');
	}else{
        // ========================
		// ビューティーモード OFF
		// ========================
		// 輝度を設定
		var brightVal = 100 + parseInt(NEGOTIATION.use_bright);
		const userId = $('#user_id').val();
		$('#video_target_video_' + userId).css('filter','brightness('+brightVal+'%)');
		$(videoId).css('object-fit','cover');
	}
}

// 埋め込む先の要素
const framerateValueElem = document.getElementById('framerate-value');

// 現在の値を埋め込む関数
const setFramerateValue = function(val){
	if(framerateValueElem){
		framerateValueElem.innerText = val;
	}
}
/**
 * 輝度の設定を行う
 * @param {*} brightness
 */
function setBrightnessVal(brightness) {
	let brightnessValueElem = document.getElementById('brightness-value');
	if (brightness) {
		brightnessVal = parseInt(brightness);
		let val = brightnessVal + 100;
		const userId = $('#user_id').val();
		$('#video_target_video_' + userId).css('filter','brightness('+val+'%)');
		// 設定モーダル内のビデオにも適応する
		$('#video-input').css('filter','brightness('+val+'%)');
	}
	if(brightnessValueElem){
		brightnessValueElem.innerText = parseInt(brightness);
	}
}
