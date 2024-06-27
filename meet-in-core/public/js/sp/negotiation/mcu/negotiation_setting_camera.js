/**** 下記は未使用
const DEAFULT_RESOLUTION_TABLE = {
	"QQVGA"			:	{video: {width: {exact:  160}, height: {exact:  120}}},
	"QCIF"			:	{video: {width: {exact:  176}, height: {exact:  144}}},
	"QVGA"			:	{video: {width: {exact:  320}, height: {exact:  240}}},
	"CIF"			:	{video: {width: {exact:  352}, height: {exact:  288}}},
	"360p(nHD)"		:	{video: {width: {exact:  640}, height: {exact:  360}}},
	"VGA"			:	{video: {width: {exact:  640}, height: {exact:  480}}},
	"SVGA"			:	{video: {width: {exact:  800}, height: {exact:  600}}},
	"720p(HD)"		:	{video: {width: {exact: 1280}, height: {exact:  720}}},
	"UXGA"			:	{video: {width: {exact: 1600}, height: {exact: 1200}}},
	"1080p(FHD)"	:	{video: {width: {exact: 1920}, height: {exact: 1080}}},
	"4K(UHD)"		:	{video: {width: {exact: 3840}, height: {exact: 2160}}},
	"AUTO"			:	{video: {width: {exact: 3840}, height: {exact: 2160}}}
};
 */

var mOldReceiveBandwidthLevel = -1;
var mFlashCameraArray = new Array();

// カメラ情報のみをプルダウンに設定
function setCameraDevicesToPullDown(devices) {
	if (devices) {
		var videoSelect = $('#setting-camera-dialog-camera-list');
		if (videoSelect) {
			videoSelect.empty();
			var device,text,select;

			mFlashCameraArray = new Array();

			for (var i = 0; i !== devices.length; ++i) {
				device = devices[i];

				// カメラであるか？
				if (device.kind === 'videoinput') {
					text = device.label || 'camera ' + videoSelect.length + 1;
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
		}
	}

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

	$("#setting-camera-dialog").dialog(
		{
			modal: true,
			draggable: false,
			resizable: false,
			closeOnEscape: false,
			position: { my: "center", at: "center", of: window },
			show: 'blind',
			hide: 'blind',
			title: '設定',
			width: 700,
			open: function() {                         // open event handler
				$(this)                                // the element being dialogged
				.parent()                          // get the dialog widget element
				.find(".ui-dialog-titlebar-close") // find the close button for this dialog
				.hide();                           // hide it

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
		// 利用可能なカメラをプルダウンに入れる
		$videoSelect.children().remove();
		navigator.mediaDevices.enumerateDevices()
			.then(setCameraDevicesToPullDown)
			.catch(function(err) {
				setCameraDevicesToPullDown(null);
			});
	}
});

// カメラ設定ダイアログを閉じる
$('#setting-camera-dialog-cancel-button').click(function(){
	$("#setting-camera-dialog").dialog("close");
});

// カメラを設定する
$('#setting-camera-dialog-save-button').click(function(){
	// 帯域の変更で画面をリロードしているが、帯域が変わることはないので不要だと思われる
	// if(settingApply()){
	// 	location.reload();
	// }
	settingApply();
	$("#setting-camera-dialog").dialog("close");
});

function settingApply(){
	var config = MY_CAMERA_RESOLUTION;

// モバイル対応
	// 取得(モバイルのカメラ状態を取得)
	// 念のため、use_camera_idも取得しているが、Safariの場合、画面のリロードで
	// IDが変わってしまうために、Safari以外のブラウザで使用すること。
	if(NEGOTIATION.localStorageFlg){
		NEGOTIATION.use_camera_id = localStorage.getItem('use_camera_id');
		NEGOTIATION.use_camera_facingMode = localStorage.getItem('use_camera_facingMode');
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
	NEGOTIATION.use_fps = $('#setting-camera-dialog-camera-framerate').val();
	NEGOTIATION.use_bright = $('#setting-camera-dialog-camera-brightness').val();
	if (mFlashCameraArray.length > 0) {
		for (var i = 0; i < mFlashCameraArray.length; ++i) {
			if (mFlashCameraArray[i] === NEGOTIATION.use_camera_id) {
				NEGOTIATION.use_camera_id_flash = i;
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
	sendCommand(SEND_TARGET_ALL, data);

	if (NEGOTIATION.isMyCameraOn) {
		republishMediaStream();
//		$('#button_camera').trigger("click");
//		$('#button_camera').trigger("click");
	}

	return (mOldReceiveBandwidthLevel != newReceiveBandwidthLevel);
}

function getCameraConstraints() {
	NEGOTIATION.use_camera_id = localStorage.getItem('use_camera_id');
	NEGOTIATION.use_fps = localStorage.getItem('use_fps');
	NEGOTIATION.use_bright = localStorage.getItem('use_bright');
	// モバイル対応
	NEGOTIATION.use_camera_facingMode = localStorage.getItem('use_camera_facingMode');
console.log("getCameraConstraints0：use_camera_id["+ NEGOTIATION.use_camera_id +"]");
console.log("getCameraConstraints0：use_camera_facingMode["+ NEGOTIATION.use_camera_facingMode +"]");

	var config = MY_CAMERA_RESOLUTION;
	var $targetVideo = $('video');
	var brightVal = 100;
	if (NEGOTIATION.use_bright) {
		brightVal += parseInt(NEGOTIATION.use_bright);
	}

	// モバイル対応
	if ( !NEGOTIATION.use_camera_facingMode || NEGOTIATION.use_camera_facingMode === 'null') {
		NEGOTIATION.use_camera_facingMode = "user";
		localStorage.setItem('use_camera_facingMode', NEGOTIATION.use_camera_facingMode);
	}

	/**
	 * カメラ指定
	 * ・モバイルの場合はID指定ではなく、フロントorバック
	 */
	if( USER_PARAM_IS_MOBILE ) {
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

	// 輝度設定
	if ('Chrome' === USER_PARAM_BROWSER
	 || 'Safari' === USER_PARAM_BROWSER ) {
		const userId = $('#user_id').val();
		$('#video_target_video_' + userId).css('filter','brightness('+brightVal+'%)');
	}

	return config;
}

function getMediaConstraints() {
	config = getCameraConstraints();
	config.audio = true;
	return config;
}

function getMediaConstraintsVideo() {
	config = getCameraConstraints();
	config.audio = false;
	return config;
}
function getMediaConstraintsAudio() {
	config = { audio: true, video: false };
	return config;
}
