class Stopwatch {
    constructor(display) {
        this.running = false;
        this.display = display;
        this.reset();
        this.print(this.times);
    }

    reset() {
        this.times = {
            hours: 0,
            minutes: 0,
            seconds: 0,
            miliseconds: 0
        };
    }
    print() {
        this.display.innerText = this.format(this.times);
    }
    format(times) {
        return `${pad0(times.hours)}:${pad0(times.minutes)}:${pad0(times.seconds)}`;
//        return `${pad0(times.minutes)}:${pad0(times.seconds)}:${pad0(Math.floor(times.miliseconds))}`;
    }
    start() {
        if (!this.running) {
            this.running = true;
            this.watch = setInterval(() => this.step(), 10);
        }
    }
    step() {
        if (!this.running) return;
        this.calculate();
        this.print();
    }
    calculate() {
    this.times.miliseconds += 1;
        if (this.times.miliseconds >= 100) {
            this.times.seconds += 1;
            this.times.miliseconds = 0;
        }
        if (this.times.seconds >= 60) {
            this.times.minutes += 1;
            this.times.seconds = 0;
        }
        if (this.times.minutes >= 60) {
            this.times.hours += 1;
            this.times.minutes = 0;
        }
    }
    stop() {
        this.running = false;
        clearInterval(this.watch);
    }
}
function pad0(value) {
    let result = value.toString();
    if (result.length < 2) {
        result = '0' + result;
    }
    return result;
}
const stopwatch = new Stopwatch(document.getElementById('time'));

const meetinVideo = document.getElementById("video_target_video_squarebox");
const meetinHorizontalRowVideo = document.getElementById("video_target_video_horizontalbox");
const videoOffCanvas = document.getElementById("video_off_canvas");

let publisher = {
  constraints: {},
  localStream: null,// 自分のカメラのストリーム
  sharescreenStream: null,// 自分の画面共有ストリーム
  subscribeStream: null,// 映像合成レイアウト受信ストリーム
  subscribeSharescreenStream: null,// 画面共有の受信ストリーム
  subscribeHorizontalRowStream: null, // 横一列レイアウト用受信ストリーム
  spotlightPublisherStream: null,     // 一人拡大配信用ストリーム

  room: new McuClient(),              // メインビデオ合成エリア用ルーム
  roomHorizontalRow: new McuClient(),
  roomShareScreen: new McuClient(),
  // 一人拡大用ルーム
  roomSpotlightPublisher: new McuClient(), // 自身の映像のみ配信するルーム room_name-spotlight-${peer_id}
  roomSpotlightSubscriber: new McuClient(), // 相手の一人拡大を受信するルーム管理

  peers: {}, /* 自分を含めた接続情報の管理オブジェクト */
};

const spotlightVideo = document.getElementById('video_target_video_spotlight');
let current_spotlight_peer_id = null;
let spotlight_publishing = false;

function onCloseSpotlightVideo()
{
	$("#negotiation_video_area_spotlight").hide();
	if (publisher.roomSpotlightSubscriber.isJoined()) {
		publisher.roomSpotlightSubscriber.leave();
	}
	Object.keys(publisher.peers).map((peer) => {
		$(`#video_list_spotlight_text_${peer}`).text("拡大表示");
		$(`#userlist_spotlight_${peer}`).show();
	});
	current_spotlight_peer_id = null;
	if ($("#mi_docment_area").is(':visible') || $("#negotiation_share_screen").is(':visible')) {
	} else {
		$("#video_target_video_area_horizontalbox").hide();
		$("#negotiation_video_area_squarebox").show();
	}
}
function isSpotlightingVideo()
{
	return (spotlight_publishing == true || current_spotlight_peer_id != null);
}

function resetSpotlightVideoPosition()
{
	// 標準ビデオ合成エリアは非表示
	let fitrate_width = $("#fit_rate").width();
	let fitrate_height = $("#fit_rate").height();
	let sidebar_width = $(".mi_left_sidebar").width();
	let horizontalbox_height = $("#video_target_video_horizontalbox").height();
	let header_height = $('header').height();

console.log(`fitrate: (${fitrate_width},${fitrate_height}) horizontalbox_height: ${horizontalbox_height} header_height: ${header_height}`);

	let height = fitrate_height - horizontalbox_height;
	let width = 0;
//	if (!$("#negotiation_video_area_spotlight").is(':visible')) {
		let $spotlight_area = $("#negotiation_video_area_spotlight");
		let orgWidth = $spotlight_area.width();
		let orgHeight = $spotlight_area.height();
		width = height * orgWidth / orgHeight;
console.log(`{${width} ${height}}`);
//		$spotlight_area.width(width);
//		$spotlight_area.height(width * orgHeight / orgWidth);
		$spotlight_area.height(height);
		$spotlight_area.width(width);

		$spotlight_area.show();
		$spotlight_area.position({
			of: $(window),
		});
		$spotlight_area.offset({ top: horizontalbox_height + header_height });
//	}
	$("#negotiation_video_area_squarebox").hide();
//	let $squarebox_area = $("#negotiation_video_area_squarebox");

//	let orgSquareWidth = $squarebox_area.width();
//	let orgSquareHeight = $squarebox_area.height();
	
//	$squarebox_area.width(width);
//	$squarebox_area.height(width * orgSquareHeight / orgSquareWidth);

//	$("#negotiation_video_area_squarebox").show();
//	$("#negotiation_video_area_squarebox").position({
//		of: $(window),
//	}).offset({ left: sidebar_width + width });
}

function relocateSpotlightVideoPosition()
{
	if ($("#negotiation_video_area_spotlight").is(':visible')) {
		let fitrate_width = $("#fit_rate").width();
		let fitrate_height = $("#fit_rate").height();
		let horizontalbox_height = $("#video_target_video_horizontalbox").height();
		let header_height = $('header').height();

		let $spotlight_area = $("#negotiation_video_area_spotlight");
		let orgWidth = $spotlight_area.width();
		let orgHeight = $spotlight_area.height();

		let height = fitrate_height - horizontalbox_height;
		width = height * orgWidth / orgHeight;

console.log(`fitrate: (${fitrate_width},${fitrate_height}) horizontalbox_height: ${horizontalbox_height} header_height: ${header_height}`);

		$spotlight_area.position({
			of: $(window),
		});
		$spotlight_area.offset({ top: horizontalbox_height + header_height });
	}
}

function onClickSpotlightVideo(peer_id)
{
	if (spotlight_publishing == true) {
		console.log('spotlight publishing now');
		return;
	}
	Object.keys(publisher.peers).map((peer) => {
		if (peer == peer_id) {
			$(`#video_list_spotlight_text_${peer}`).text("拡大中");
		} else {
			$(`#video_list_spotlight_text_${peer}`).text("拡大表示");
		}
		// 表示
		$(`#userlist_spotlight_${peer}`).show();
	});
	spotlight_publishing = true;
	// 表示するストリーム(ルーム)を変更
	// 
	if (publisher.roomSpotlightSubscriber.isJoined()) {
		publisher.roomSpotlightSubscriber.leave();
	}
	if (peer_id == publisher.room.myId) {
		playStream(spotlightVideo, publisher.spotlightPublisherStream, true);
		spotlight_publishing = false;
		current_spotlight_peer_id = peer_id;
		$(`#video_list_spotlight_text_${peer_id}`).text("拡大済");
		// 非表示
		$(`#userlist_spotlight_${peer_id}`).hide();
		$("#video_target_video_area_horizontalbox").show();
	} else {
		startSpotlightSubscriber(peer_id);
		current_spotlight_peer_id = peer_id;
	}
	resetSpotlightVideoPosition();
}


function startSpotlightSubscriber(peer_id)
{
	let userName = 'guest';
	let userRole = 'guest';
	let room_name = document.getElementById("Room_name").value || '';
	if (room_name == null || room_name.length == 0) {
		cosnole.error(`room_name is invalid`);
		spotlight_publishing = false;
		return;
	}
	if (!peer_id) {
		cosnole.error(`peer_id is null`);
		spotlight_publishing = false;
		return;
	}
	let spotlight_room_name = `${room_name}-spotlight-${peer_id}`;
	publisher.roomSpotlightSubscriber.join(spotlight_room_name, userName, userRole, () => {
		// ストリーム受信なし
		let subscribeOptions;// optionなし
		publisher.roomSpotlightSubscriber.subscribe('main', subscribeOptions, (media) => {
			playStream(spotlightVideo, media, true);
			spotlight_publishing = false;
			$(`#video_list_spotlight_text_${peer_id}`).text("拡大済");
			// 非表示
			$(`#userlist_spotlight_${peer_id}`).hide();
		});
		$("#video_target_video_area_horizontalbox").show();
//		$("#negotiation_video_area_squarebox").hide();
	});
}

function publishSpotlightStream()
{
	let publishOptions;// optionなし
	if (NEGOTIATION.isMyCameraCanUse == false || NEGOTIATION.isMyCameraOn == false) {
		let videoOffStream = videoOffCanvas.captureStream();
		publisher.spotlightPublisherStream = videoOffStream;
	} else {
		if (isStartBodypixVideo()) {
			let bodyPixCanvas = document.getElementById("myCanvasBodyPix");
			let bodyPixCanvasStream = bodyPixCanvas.captureStream();
			publisher.spotlightPublisherStream = bodyPixCanvasStream;
		} else {
			let canvasLocalStream = local_video_canvas.captureStream();
			publisher.spotlightPublisherStream = canvasLocalStream;
		}
	}
	publisher.roomSpotlightPublisher.stopPublish('guestscreen', 'main');
	publisher.roomSpotlightPublisher.publish(publisher.spotlightPublisherStream, 'guestscreen', 'main', publishOptions);
}

function startSpotlightPublisher()
{
	let userName = 'guest';
	let userRole = 'guest';
	let room_name = document.getElementById("Room_name").value || '';
	if (room_name == null || room_name.length == 0) {
		cosnole.error(`room_name is invalid`);
		return;
	}
	if (!publisher.room.myId) {
		cosnole.error(`publisher.room.myId is null`);
		return;
	}
	let spotlight_room_name = `${room_name}-spotlight-${publisher.room.myId}`;
	publisher.roomSpotlightPublisher.join(spotlight_room_name, userName, userRole, () => {
		// ストリーム受信なし
		let subscribeOptions;// optionなし
		publisher.roomSpotlightPublisher.subscribe('main', subscribeOptions, (media) => {
			publishSpotlightStream();
			playStream(spotlightVideo, media, true);
		});
	});
}

// ローカルビデオをキャンバス経由で送信
const local_video_canvas_height = 240;
const local_video_canvas_width = 320;
const local_video_canvas = document.getElementById("local_video_canvas");
let continue_local_video_canvas_animation = true;
let local_video_canvas_animation_id = null;
let updateLocalVideoIntervalTime = 100;

function udateLocalVideoCanvas()
{
	let ctx = local_video_canvas.getContext('2d');
	let local_video = document.getElementById('local_video');
	let localStream = publisher.localStream;
	if (ctx && localStream) {
		let videoTrack = localStream.getVideoTracks()[0];
		const contraints = videoTrack.getSettings();
		if (contraints.width < contraints.height) {
			// 縦長の場合、横幅を基準に4:3の比率とする
			let width = contraints.width;
			let height = contraints.width * local_video_canvas_height / local_video_canvas_width;
			ctx.drawImage(local_video, 0, 0, width, height, 0, 0, local_video_canvas_width, local_video_canvas_height);
		} else {
			// 
			ctx.drawImage(local_video, 0, 0, contraints.width, contraints.height, 0, 0, local_video_canvas_width, local_video_canvas_height);
		}
	}
	if (continue_local_video_canvas_animation) {
			local_video_canvas_animation_id = setTimeout(udateLocalVideoCanvas, updateLocalVideoIntervalTime);
//		local_video_canvas_animation_id = requestAnimationFrame(udateLocalVideoCanvas);
	}
}

function setVideoIntervalTime(use_fps)
{
	let frameRate = 10;
	if( use_fps ) {
		frameRate = use_fps;
	}
	updateLocalVideoIntervalTime = Math.floor(1000/frameRate);
	console.log("updateLocalVideoIntervalTime::" + updateLocalVideoIntervalTime);
}

function startLocalVideoCanvas()
{
	if (local_video_canvas_animation_id) {
		stopLocalVideoCanvas();
	}
	continue_local_video_canvas_animation = true;
	//	local_video_canvas_animation_id = requestAnimationFrame(udateLocalVideoCanvas);

	setVideoIntervalTime(DEFAULT_FPS);
	if( publisher.constraints ) {
		if( publisher.constraints.video.frameRate ) {
			setVideoIntervalTime(publisher.constraints.video.frameRate.max)
		}
	}
	udateLocalVideoCanvas();
}

function stopLocalVideoCanvas()
{
	if (local_video_canvas_animation_id) {
//		cancelAnimationFrame(local_video_canvas_animation_id);
		clearTimeout(local_video_canvas_animation_id);
		local_video_canvas_animation_id = null;
		continue_local_video_canvas_animation = false;
	}
}


let cameraOffcontinueAnimation = true;
let camereOffTimerId = null;
const updateCameraOffStreamTimer = 1000;

function syncLoadImages(imgPaths, imgs, callback)
{
	if(!imgPaths) { return; }
	var count = imgPaths.length;
	$.each(imgPaths, function(key, data) {
		var onLoad = function(e) {
			count--;
			if(0 == count) {
				callback(imgs);
			}
		}
		var img = new Image();
		img.onload = function() {
			data['img'] = this;
			imgs.push(data);
			onLoad();
		}
		img.onerror = function() {
			onLoad();
		}
		img.src = data["src"];
	});
}

function updateCameraOffStream()
{
	let video_background_image = $("#video_background_image").val();
	let loadedImgsInfo = [];
	let prof_img_url = 'https://' + location.host + video_background_image;
	let cam_url = 'https://' + location.host;
	if (NEGOTIATION.isMyCameraOn) {
		cam_url += '/img/icon_video.png';
	} else {
		cam_url += '/img/icon_video_off.png';
	}

	let mic_url = 'https://' + location.host;
	if (NEGOTIATION.isMyMicOn) {
		mic_url += '/img/icon_mic.png';
	} else {
		mic_url += '/img/icon_mic_off.png';
	}

	let imgPaths = [
		{"src": prof_img_url, type: 'prof' },
		{"src": cam_url, type: 'cam' },
		{"src": mic_url, type: 'mic' },
	];
	syncLoadImages(imgPaths, loadedImgsInfo, (imgs) => {
		let prof_img, cam_img, mic_img;
		$.each(loadedImgsInfo, (i, e) => {
			if (e["type"] == "prof") {
				prof_img = e["img"];
			} else if (e["type"] == "cam") {
				cam_img = e["img"];
			} else if (e["type"] == "mic") {
				mic_img = e["img"];
			}
		});
		videoOffCanvas.width = 320;
		videoOffCanvas.height = 240;
		let imgRatio = prof_img.width / prof_img.height;
		let ctx = videoOffCanvas.getContext('2d');

		ctx.save();

		ctx.fillStyle = "#DDDDDD";
		ctx.fillRect(0, 0, videoOffCanvas.width, videoOffCanvas.height);

		var centerX = videoOffCanvas.width / 2;
		var centerY = videoOffCanvas.height / 2;
		centerY -= 30;

		var radius = 70;
		ctx.fillStyle = "#FFFFFF";
		ctx.beginPath();
		ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
		ctx.fill();
		ctx.clip();

		let dw = prof_img.width;
		let dh = prof_img.height;
		let dx = (videoOffCanvas.width - prof_img.width) / 2;
		let dy = (videoOffCanvas.height - prof_img.height) / 2;

		if (videoOffCanvas.height < prof_img.height) {
			dw = 140;
			dh = imgRatio * 140;
			dx = (videoOffCanvas.width - dw) / 2;
			dy = (videoOffCanvas.height - dh) / 2;
		}
		dy -= 30;

		ctx.drawImage(prof_img, 0, 0, prof_img.width, prof_img.height, dx, dy, dw, dh);

		ctx.restore();

		let imgCamRatio = cam_img.width / cam_img.height;
		let imgMicRatio = mic_img.width / mic_img.height;
		let camSx = centerX - 30 - 40;
		let micSx = centerX + 30;
		ctx.drawImage(cam_img, 0, 0, cam_img.width, cam_img.height, camSx, 170, (imgCamRatio * 40), 40);
		ctx.drawImage(mic_img, 0, 0, mic_img.width, mic_img.height, micSx, 170, (imgMicRatio * 40), 40);

		videoOffCanvas.style.display = "none";
	});

	if (cameraOffcontinueAnimation) {
		camereOffTimerId = setTimeout(updateCameraOffStream, updateCameraOffStreamTimer);
	}
}

function startVideoOffStream()
{
	if (camereOffTimerId) {
//		clearInterval(camereOffTimerId);
		clearTimeout(camereOffTimerId);
		camereOffTimerId = null;
	}
	cameraOffcontinueAnimation = true;
	camereOffTimerId = setTimeout(updateCameraOffStream, updateCameraOffStreamTimer);
}

function stopVideoOffStream()
{
	cameraOffcontinueAnimation = false;
	clearTimeout(camereOffTimerId);
	camereOffTimerId = null;
}

function mcuCameraOffPublishCallback() {
	$("#button_camera").removeClass("camera_switching");
}

function mcuCameraOff()
{
	let videoOffStream = videoOffCanvas.captureStream();
	let localAudioTrack = publisher.localStream.getAudioTracks()[0];
	if (localAudioTrack) {
		videoOffStream.addTrack(localAudioTrack);
	}

	replaceRoomStream(videoOffStream, mcuCameraOffPublishCallback, mcuCameraOffPublishCallback);
	replaceRoomHorizontalRowStream(videoOffStream);
	replaceRoomSpotlightPublisherStream(videoOffStream);
	// カメラOFF時のプロフィール画像送信用canvas
//	videoOffCanvas.style.display = "none";
	startVideoOffStream();
}

let isCameraOnPublished = false;
function mcuCameraOnPublishCallback() {
	isCameraOnPublished = true;
	$("#button_camera").removeClass("camera_switching");
}

function mcuCameraOn()
{
	isCameraOnPublished = false;
	videoOffCanvas.style.display = "none";
	if (USER_PARAM_IS_MOBILE) {
		publishLocalStream(mcuCameraOnPublishCallback, mcuCameraOnPublishCallback);
	} else {
		// 標準合成ルームのストリーム
		if (isStartBodypixVideo()) {
			let bodyPixCanvas = document.getElementById("myCanvasBodyPix");
			let bodyPixCanvasStream = bodyPixCanvas.captureStream();
			let localAudioTrack = publisher.localStream.getAudioTracks()[0];
			if (localAudioTrack) {
				bodyPixCanvasStream.addTrack(localAudioTrack);
			}
			replaceRoomStream(bodyPixCanvasStream, mcuCameraOnPublishCallback, mcuCameraOnPublishCallback);
		} else {
			publishLocalStream(mcuCameraOnPublishCallback, mcuCameraOnPublishCallback);
		}
		// 横一列レイアウトルームと一人拡大用のストリーム
		if (isStartBodypixVideo()) {
			let bodyPixCanvas = document.getElementById("myCanvasBodyPix");
			let bodyPixCanvasStream = bodyPixCanvas.captureStream();
			replaceRoomHorizontalRowStream(bodyPixCanvasStream, mcuCameraOnPublishCallback, mcuCameraOnPublishCallback);
			replaceRoomSpotlightPublisherStream(bodyPixCanvasStream);
		} else {
			let canvasLocalStream = local_video_canvas.captureStream();
			replaceRoomHorizontalRowStream(canvasLocalStream);
			replaceRoomSpotlightPublisherStream(canvasLocalStream);
		}
	}
	stopVideoOffStream();
}

function getRoomPeerInfo(peer_id)
{
  let peerUser = publisher.peers[peer_id];
  if (peerUser) {
    return peerUser.peer_info;
  }
  return null;
}

function stopSharescreenStream()
{
	if (publisher.sharescreenStream) {
		let tracks = publisher.sharescreenStream.getTracks();
		tracks.forEach(track => track.stop());
		publisher.sharescreenStream = null;
	}
	publisher.roomShareScreen.stopPublish('sharescreen', 'main');
}

function getRoomMemberCount()
{
	let l = Object.keys(publisher.peers).filter((peer) => {
		let peer_info = publisher.peers[peer].peer_info;
		if (peer_info) {
			return (peer_info.room_mode != "2");
		}
	}).length;
console.log(`room count: ${l}`);
	return l;
}

function countRoomMembers()
{
	$("#room_members").html(getRoomMemberCount());
}

function appendUserList(peer_id)
{
	let user = 
`<li id="video_list_${peer_id}" data-id="${peer_id}" class="video_list_vert" style="display: none;">` +
	`<div class="video_list_sel">` +
		`<p><img class="video_list_img_vert" src="/img/meet-in-logo_gray.png"/></p>` +
		`<p><span class="video_user_name user_name">匿名ユーザー</span></p>` +
		`<div id="userlist_cam_${peer_id}"  data-id="${peer_id}" class="video_list_cam_btn"><span class="icon-video video_list_cam_icon"></span>隠す</div>` +
		`<div id="userlist_namecard_${peer_id}" class="video_list_namecard_btn" data-id="${peer_id}">` +
			`<span class="icon-businesscard video_list_namecard_icon"></span>名刺表示` +
		`</div>` +
		`<div id="userlist_spotlight_${peer_id}" data-id="${peer_id}" class="video_list_spotlight_btn video_list_btn">` +
			`<span class="icon-window video_list_cam_icon"></span><span id="video_list_spotlight_text_${peer_id}">拡大表示</span>` +
		`</div>` +
		`<div class="mi_header_status_icon" style="display: none;">` +
			`<div class="video-tooltip"><div class="user_info_wrap"><span class="user_info"></span></div></div>` +
			`<div class="video-tooltip"><span class="icon-device mi_default_label_icon_3"></span><span class="browser_version"></span></div>` +
			`<div class="video-tooltip"><span class="icon-browse-focus mi_default_label_icon_3 icon-browse"></span></div>` +
			`<div class="video-tooltip"><span class="icon-video mi_default_label_icon_3" id="icon_video_${peer_id}"></span></div>` +
			`<div class="video-tooltip"><span class="icon-microphone mi_default_label_icon_3" id="icon_microphone_${peer_id}"></span></div>` +
		`</div>` +
	`</div>` +
`</li>`;
	$("#negotiation_userlist").append(user);

	$(`[id^="video_list_${peer_id}"]`).tooltipster({
		contentAsHTML: true,
		interactive: true,
		animation: 'fade',
		trigger: 'hover',
		theme: 'Default',
		position: ['right', 'bottom'],
		content: null,
		zIndex: 200000002,
		functionReady: function(origin){
			tooltip = origin.elementTooltip;
			$(tooltip).find('.tooltipster-box').css('background-color', "#222222");
			$(tooltip).find('.tooltipster-arrow-background').css('border-right-color', "#222222");
		}
	});
}

function removeUserList(peer_id)
{
	$(`#video_list_${peer_id}`).remove();
}

/**
*  自身の情報の送信
*/
function sendPublishUser(peer_id)
{
	let videoEnabled = false;
	let audioEnabled = false;
	let stream = getLocalStream();
	if (stream) {
		videoEnabled = stream.getVideoTracks()[0].enabled;
		audioEnabled = stream.getAudioTracks()[0].enabled;
	}
	let is_show_share_memo = $("#share_memo_area").is(':visible');
	let is_show_share_screen = $("#negotiation_share_screen").is(':visible');
	let is_show_share_screen_modal = $("#share_screen_modal").is(':visible');
	let is_show_chat = $("#chat_board_area").is(':visible');

	// プロフィール画像用のキャプチャ
	let profile_image = captureLocalStream();
	if (NEGOTIATION.isMyCameraOn == false) {
		profile_image = null;
	}
	let peer_info = {
		my_user_info: $("#my_user_info").val(),
		room_mode: $("#room_mode").val(),
		client_id: $("#client_id").val(),
		staff_type: $("#staff_type").val(),
		staff_id: $("#staff_id").val(),
		profile_image: profile_image,
		share_memo: {
			shareMemo : $("textarea.share_memo_text").val(),
			showFlg : $("#share_memo_area").is(':visible'),
			top : $("#share_memo_area").css("top"),
			left : $("#share_memo_area").css("left"),
			height : $("#share_memo_area").css('height'),
			width : $("#share_memo_area").css("width"),
			scrollTop : $("#share_memo_area").scrollTop(),
			scrollLeft : $("#share_memo_area").scrollLeft(),
		},
		white_board: {
			showFlg : $("#white_board_area").is(':visible'),
			top : $("#white_board_area").css("top"),
			left : $("#white_board_area").css("left"),
			height : $("#white_board_area").css('height'),
			width : $("#white_board_area").css("width"),
			scrollTop : $(".canvas_area").scrollTop(),
			scrollLeft : $(".canvas_area").scrollLeft(),
		},
		share_screen: {
			is_show_modal: is_show_share_screen_modal,
			is_show: is_show_share_screen,
		},
		chat: {
			is_show: is_show_chat,
		},
		share_doc: {},
	};
	if (USER_PARAM_IS_MOBILE) {
		peer_info.share_doc.showFlg = $("#sp_document_area").is(':visible');
	} else {
		peer_info.share_doc.showFlg = $("#mi_docment_area").is(':visible');
	}
	var documentUrlFlg = 0;
	if($("div#mi_docment_area").is(':visible') && currentDocumentId != 0){
		// データを取得する為のキーを作成する
		var keyName = "materialId_" + currentDocumentId;
		// ブラウザのセッションストレージからデータ取得
		var mtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));
		// URLの場合はダウンロード等を削除する
		if(mtSessionStorage && mtSessionStorage[keyName]["material_basic"]["material_url"]){
			documentUrlFlg = 1;
		}
	}
	var result = {};
	for (var i = 0; i < sessionStorageKeys.length; i++) {
		var mtSessionStorage = $.parseJSON(sessionStorage.getItem(sessionStorageKeys[i]));
		if (mtSessionStorage) {
			mtSessionStorage[sessionStorageKeys[i]]["material_basic"] = {};
			mtSessionStorage[sessionStorageKeys[i]]["material_detail"] = {};
			mtSessionStorage[sessionStorageKeys[i]]["canvas_document"] = {};
			result[sessionStorageKeys[i]] = mtSessionStorage;
		}
	}
	peer_info.share_doc.materialDictJson = JSON.stringify(result);
	peer_info.share_doc.currentDocumentId = currentDocumentId;
	peer_info.share_doc.currentPage = currentPage;
	peer_info.share_doc.documentCanvasLeft = LayoutCtrl.apiGetSubLength();
	peer_info.share_doc.documentUrlFlg = documentUrlFlg,
	peer_info.share_doc.codumentViewState = codumentViewState,


	peer_info.joined_time = publisher.peers[peer_id].peer_info.joined_time;
	const data = {
		command: "PUBLISH_USER",
		peer_id: peer_id,
		user_agent: navigator.userAgent,
		has_focus: document.hasFocus(),
		has_video_stream: videoEnabled,
		has_audio_stream: audioEnabled,
		from_browser: USER_PARAM_BROWSER,
		from_browser_version: platform.version,
		from_os:        platform.os.family,
		from_os_version: platform.os.version,
		from_user_info: $("#my_user_info").val(),
		peer_info: peer_info,
	};
	sendCommand(null, data);
}

/**
*  ユーザー情報要求時の処理
*/
function onRequestUserRoom(json)
{
console.log(`onRequestUserRoom: ${json.peer_id}`);
	if (json.peer_id == publisher.room.myId) {
		sendPublishUser(publisher.room.myId);
	}
}

function setupPublishUser(peer_id, json)
{
	if(peer_id == null) {
		return;
	}
	const peer_info = publisher.peers[peer_id].peer_info;

	let video_list = $('#video_list_' + peer_id);

	video_list.find('.user_info').text(valueCheck(json.from_user_info) ? json.from_user_info : DEFAULT_USER_NAME);

	if (peer_info.profile_image == null) {
		video_list.find('.video_list_img_vert').attr('src','/img/meet-in-logo_gray.png');
	}else{
		video_list.find('.video_list_img_vert').attr('src', peer_info.profile_image);
	}

	// 名刺アイコン：匿名ユーザーは非表示、自分以外は非表示
	if (peer_info && peer_info.client_id && peer_info.client_id == "0") {
		$("#userlist_namecard_" + peer_id).hide();
	}
	if (peer_id != publisher.room.myId) {
		$("#userlist_namecard_" + peer_id).hide();
		$("#userlist_cam_" + peer_id).hide();
	}
	// 映像フレームアイコンは自分視診のみ

	// ツールチップ
	video_list.find('.user_name').text(valueCheck(json.from_user_info) ? json.from_user_info : DEFAULT_USER_NAME);
	// フォーカス状態の更新
	video_list.find('.icon-browse-focus').changeClass(json.has_focus,'mi_active');
	video_list.find('.icon-browse-focus').addClass("video-tooltip-color");
	// ビデオ状態の更新
	video_list.find('.icon-video').changeClass(json.has_video_stream,'mi_active');
	// マイクの状態を更新
	video_list.find('.icon-microphone').changeClass(json.has_audio_stream,'mi_active');

	// ユーザーのデバイスの更新
	video_list.find('.icon-device').changeClass(!NEGOTIATION.isDeviceMob(json.user_agent),'icon-pc');
	video_list.find('.icon-device').changeClass(NEGOTIATION.isDeviceMob(json.user_agent),'icon-tab');

	// OS, ブラウザ, ブラウザバージョンの表示文字列
	var platformInfo = json.from_os + "(" + json.from_os_version + ") on " + json.from_browser;
	var browserVersion = " (<span class='version_color'>"+json.from_browser_version+"</span>)";
	video_list.find('.browser_version').html(browserVersion);

	// ブラウザのメジャーバージョンのみ取得する
	var browserMajorVersion = Number(json.from_browser_version.split(".")[0]);

	// 使用可能なブラウザか判定結果用フラグ
	var permissionBrowserFlg = true;
	if(!NEGOTIATION.isDeviceMob(json.user_agent)){
		// PC用アイコンを表示する
		video_list.find('.icon-pc').attr('user-platform', platformInfo);
		// ブラウザ毎のバージョン判定を行う
		if (json.from_browser === 'Chrome' && browserMajorVersion < BORDER_CHROME_VERSION) {
			permissionBrowserFlg = false;
		} else if (json.from_browser === 'Firefox' && browserMajorVersion < BORDER_FIREFOX_VERSION) {
			permissionBrowserFlg = false;
		} else if (json.from_browser === 'IE' && browserMajorVersion < BORDER_IE_VERSION) {
			permissionBrowserFlg = false;
		} else if (json.from_browser === 'Safari' && browserMajorVersion < BORDER_SAFARI_VERSION) {
			permissionBrowserFlg = false;
		}else if (json.from_browser === 'Edge' && browserMajorVersion < BORDER_EDGE_VERSION) {
			permissionBrowserFlg = false;
		}
	}else{
		// タブレット用アイコンを表示する
		video_list.find('.icon-tab').attr('user-platform', platformInfo);
		// ブラウザ毎のバージョン判定を行う
		if (json.from_browser === 'Chrome' && browserMajorVersion < BORDER_ANDROID_CHROME_VERSION) {
			permissionBrowserFlg = false;
		} else if (json.from_browser === 'Firefox' && browserMajorVersion < BORDER_ANDROID_FIREFOX_VERSION) {
			permissionBrowserFlg = false;
		} else if (json.from_browser === 'Safari' && browserMajorVersion < BORDER_SAFARI_VERSION) {
			permissionBrowserFlg = false;
		}
	}
	// ブラウザのバージョン判定結果により、使用不可の場合はバージョンの色を変更する
	if(!permissionBrowserFlg){
		video_list.find('.version_color').css("color", "#E65D5D");
	}

	// DOMを元に吹き出し設定
	// 自分は除外
	if (publisher.room.myId != peer_id) {
		video_list.tooltipster(
			'content', video_list.find('.mi_header_status_icon').html()
		);
	}
	if (peer_info.room_mode != "2") {
		video_list.show();
	}

	// MCU
	// 同期は入室時間が遅い人
	let myJoinTime = publisher.peers[publisher.room.myId].peer_info.joined_time;
	let yourJoinTime = peer_info.joined_time;
	if ( myJoinTime > yourJoinTime ) {
		// 共有メモの同期
		if (peer_info.share_memo) {
			$("textarea.share_memo_text").val(peer_info.share_memo.shareMemo);
			if (peer_info.share_memo.showFlg) {
				$("#share_memo_area").show();
			} else {
				$("#share_memo_area").hide();
			}
		}
		//	ホワイトボードの同期
		if (peer_info.white_board) {
			syncWhiteBoard(peer_info.white_board);
			if (peer_info.white_board.showFlg) {
				$("#white_board_area").show();
			} else {
				$("#white_board_area").hide();
			}
		}
		// 画面共有
		
		if (peer_info.share_screen) {
			// 画面共有中ならSCREEN_IS_ON相当の処理を行う
			if (peer_info.share_screen.is_show || peer_info.share_screen.is_show_modal) {
				procScreenIsOn(json);
			}
		}
		// 資料共有
		if (peer_info.share_doc) {
			if (USER_PARAM_IS_MOBILE) {
				resuponceDocumentProc(peer_info.share_doc);
			}
		}
	}
	countRoomMembers();
}

function syncWhiteBoard(json)
{
	var img = new Image();
	img.onload = function(){
		// キャンバスのオブジェクトを取得
		var element = document.getElementById("white_board");
		// context取得
		var context = element.getContext('2d');
		// 画像を描画
		context.drawImage(img, 0, 0, whiteBoardWidth, whiteBoardHeight);
		if (USER_PARAM_IS_MOBILE) {
			if(json.showFlg){
				// SP用のホワイトボード表示処理
				showWhiteBord();
			}
		} else {
			// ホワイトボードのボタンを押せるようにする
			$("#button_white_board").prop("disabled", false);
			// ホワイトボードの位置を設定
			$("#white_board_area").css("top", json.top);
			$("#white_board_area").css("left", json.left);
			// ホワイトボードの大きさを設定
			$('div#white_board_area').css("height", json.height);
			$('div#white_board_area').css("width", json.width);
			// ホワイトボードが表示されている場合は表示する
			if(json.showFlg){
				$("#white_board_area").show();
				// ホワイトボードのスクロール位置を設定
				$(".canvas_area").scrollTop(json.scrollTop);
				$(".canvas_area").scrollLeft(json.scrollLeft);
			}
		}
	};
	// ホワイトボード画像の読み込み
	var uuid = UUID.generate();
	var uniqueStr = uuid.replace(/\-/g, '');
	img.src = "/negotiation_document/negotiation_"+ $("#connection_info_id").val() + "/white_board.png" + '?' + uniqueStr;
}

/**
*  公開ユーザーの情報取得処理
*/
function onPublishUserRoom(json)
{
console.log(`onPublishUserRoom: ${json.peer_id}`);
console.log(json.peer_info);
	publisher.peers[json.peer_id] = json;
	// procEnterRoom
	enterRoomPublisherProc(json);
	// 情報更新
	setupPublishUser(json.peer_id, json);
}

function enterRoomPublisherProc(json)
{
	if (json.from_room_mode == ROOM_MODE_1) {
		//入室時に通知音を鳴らす
		var notification_audio = document.createElement('audio');
		notification_audio.id = "notification_audio";
		notification_audio.src="/webrtc/sounds/notification-chime.wav";
		notification_audio.style.display="none";
		notification_audio.volume = 0.1;
		notification_audio.play();

		if($("#desktop_notify_flg").val() != 0) {
			if (USER_PARAM_IS_MOBILE) {
			} else {
				var name = (json.from_user_info == '') ? 'ゲスト' : json.from_user_info;
				displayNotification(name + 'が入室しました', null, 'dXオンライン営業');
			}
		}
	}
}

/**
*  退出時の処理
*/
function leaveRooms()
{
	if (publisher.room != null) {
		publisher.room.leave();
	}
	if (publisher.roomHorizontalRow != null) {
		publisher.roomHorizontalRow.leave();
	}
	if (publisher.roomShareScreen != null) {
		publisher.roomShareScreen.leave();
	}
}

/**
*  再接続時の処理
*/
function reconnectRoom(successCb, errorCb)
{
//	if (!publisher.room.isJoined()) {
	if (publisher.room) {
		publisher.room.stopPublish('guestscreen', 'main');

		if (isStartBodypixVideo()) {
			let bodyPixCanvas = document.getElementById("myCanvasBodyPix");
			let bodyPixCanvasStream = bodyPixCanvas.captureStream();
			let localAudioTrack = publisher.localStream.getAudioTracks()[0];
			if (localAudioTrack) {
				bodyPixCanvasStream.addTrack(localAudioTrack);
			}
			replaceRoomStream(bodyPixCanvasStream, successCb, errorCb);
		} else {
			publishLocalStream(successCb, errorCb);
		}
	}
}

/**
*  自カメラのストリーム取得
*/
function replaceRoomStream(stream, successCb, errorCb)
{
	if (publisher.room.myId != null) {
		let publishOptions;// optionなし
		publisher.room.stopPublish('guestscreen', 'main');
		publisher.room.publish(stream, 'guestscreen', 'main', publishOptions, successCb, errorCb);
	}
}

function replaceRoomHorizontalRowStream(stream, successCb, errorCb)
{
	if (publisher.roomHorizontalRow.myId != null) {
		let publishOptions;// optionなし
		publisher.roomHorizontalRow.stopPublish('guestscreen', 'main');
		publisher.roomHorizontalRow.publish(stream, 'guestscreen', 'main', publishOptions, successCb, errorCb);
	}
}

function replaceRoomSpotlightPublisherStream(stream, successCb, errorCb)
{
	if (publisher.roomSpotlightPublisher.myId != null) {
		let publishOptions;// optionなし
		publisher.roomSpotlightPublisher.stopPublish('guestscreen', 'main');
		publisher.roomSpotlightPublisher.publish(stream, 'guestscreen', 'main', publishOptions, successCb, errorCb);
		publisher.spotlightPublisherStream = stream;
		// 自身が一人拡大中でかつ自分自身を拡大の時
		if (isSpotlightingVideo() && current_spotlight_peer_id == publisher.room.myId) {
			playStream(spotlightVideo, publisher.spotlightPublisherStream, true);
		}
	}
}

function publishLocalStream(successCb, errorCb)
{
	if (publisher.room.myId != null) {
		let publishOptions;// optionなし
		publisher.room.stopPublish('guestscreen', 'main');
		if (NEGOTIATION.isMyCameraOn == true) {
			// captureStream
			let canvasLocalStream = local_video_canvas.captureStream();
			let localAudioTrack = publisher.localStream.getAudioTracks()[0];
			if (localAudioTrack) {
				canvasLocalStream.addTrack(localAudioTrack);
			}
			publisher.room.publish(canvasLocalStream, 'guestscreen', 'main', publishOptions, successCb, errorCb);
		} else {
			let videoOffStream = videoOffCanvas.captureStream();
			publisher.room.publish(videoOffStream, 'guestscreen', 'main', publishOptions, successCb, errorCb);
		}
	}
}

function publishHorizontalRowLocalStream(successCb, errorCb)
{
	if (publisher.room.myId != null) {
		let publishOptions;// optionなし
		publisher.roomHorizontalRow.stopPublish('guestscreen', 'main');
		if (NEGOTIATION.isMyCameraOn == true) {
			// captureStream
			let canvasLocalStream = local_video_canvas.captureStream();
			publisher.roomHorizontalRow.publish(canvasLocalStream, 'guestscreen', 'main', publishOptions, successCb, errorCb);
		} else {
			let videoOffStream = videoOffCanvas.captureStream();
			publisher.roomHorizontalRow.publish(videoOffStream, 'guestscreen', 'main', publishOptions, successCb, errorCb);
		}
	}
}

function captureLocalStream()
{
	let canvasVideo = document.createElement("canvas");
	let localVideo = document.getElementById('local_video');
	let profile_image = null;
	if (localVideo && canvasVideo) {
		canvasVideo.width = localVideo.videoWidth;
		canvasVideo.height = localVideo.videoHeight;
		canvasVideo.getContext('2d').drawImage(localVideo, 0, 0, localVideo.videoWidth, localVideo.videoHeight);
		profile_image = canvasVideo.toDataURL('image/jpeg');
	}
	return profile_image;
}

/**
*  自カメラのストリーム取得
*/
function getLocalStream()
{
	return publisher.localStream;
}

/**
* 自分が配信する画面共有用のストリーム取得
*/
function getSharescreenStream()
{
	return publisher.sharescreenStream;
}

function getOldestJoinedPeerId()
{
	let tmp_peers = Object.keys(publisher.peers).filter((peer) => {
		return (publisher.peers[peer].peer_info != null);
	}).map((peer) => {
		return { peer_id: peer, joined_time: publisher.peers[peer].peer_info.joined_time };
	});
	let tmp_joined_list = tmp_peers.map((e) => {
		return e.joined_time;
	});
	let min_id = tmp_joined_list.indexOf(Math.min.apply(null, tmp_joined_list));
	return tmp_peers[min_id].peer_id;
}

/**
*  メインルームオブジェクト取得
*/
function getPublisherRoom()
{
	if (!publisher.room.isJoined()) {
		return null;
	}
	return publisher.room;
}

/**
*  画面共有用のルームオブジェクト取得
*/
function getPublisherRoomSharscreen()
{
	if (!publisher.roomShareScreen.isJoined()) {
		return null;
	}
	return publisher.roomSharescreen;
}

// 画面共有用のルーム
const onEventShareScreen = () => {
	// ストリーム配信
	let publishOptions;// optionなし
	publisher.roomShareScreen.publish(publisher.sharescreenStream, 'sharescreen', 'main', publishOptions);
}

const playStream = async (video, stream, muted) => {
  video.muted = muted;
  video.srcObject = stream;
  video.playsInline = true;
  await video.play().catch(console.error);
}

const republishMediaStream = async () => {
//console.log('★republishMediaStream 1 START');
  await setupGetUserMedia(getMediaConstraints());
//console.log('★republishMediaStream 1 END');
  // local_videoの再生
  const localVideo = document.getElementById("local_video");
  playStream(localVideo, publisher.localStream, true);

//  publishLocalStream();
}

const setupGetUserMedia = async (constraints) => {
  let retry_GetUserMedia_flg = false;

  publisher.constraints = constraints;
// console.log(publisher.constraints);

  if(publisher.localStream) {
    publisher.localStream.getTracks().forEach(track => track.stop());
  }

  console.log('★★★ mediaDevices.getUserMedia constraints=' + JSON.stringify(publisher.constraints));
  await navigator.mediaDevices.getUserMedia(publisher.constraints)
  .then((stream) => {
    publisher.localStream = stream;
    publisher.localStream.label = "local-stream";
  })
  .catch(function (error) {
	console.log('★★★mediaDevices.getUserMedia() error:', error);
	retry_GetUserMedia_flg = true;
    // NEGOTIATION.isMyCameraCanUse = false;
    // NEGOTIATION.isMyCameraOn = false;
    // NEGOTIATION.isMyMicCanUse = false;
    // NEGOTIATION.isMyMicOn = false;
    // NEGOTIATION.isMyCameraError = true;
    // NEGOTIATION.isMyMicError = true;
    // return;
  });

  console.log('★★★ retry_GetUserMedia_flg=('+retry_GetUserMedia_flg+')');
  if( retry_GetUserMedia_flg == true ) {
    //--------------------------
    // コンフィグを変えて再取得
    //--------------------------
    var retry_config;
    retry_config = {audio: true, video: true};

    if( USER_PARAM_IS_MOBILE ) {      // モバイル
      if( constraints.video.facingMode ) { // カメラ指定あり
        retry_config = { audio: true, video: { facingMode: "user" } };
      }
    }
    publisher.constraints = retry_config;

	console.log('★★★ retryGetUserMedia::mediaDevices.getUserMedia constraints=' + JSON.stringify(publisher.constraints));
    await navigator.mediaDevices.getUserMedia(publisher.constraints)
    .then((stream) => {
      publisher.localStream = stream;
      publisher.localStream.label = "local-stream";
//console.log('★★★ retryGetUserMedia:: OK!!');
    })
    .catch(function (error) {
      console.log('★★★mediaDevices.getUserMedia() retry_error:', error);
      NEGOTIATION.isMyCameraCanUse = false;
      NEGOTIATION.isMyCameraOn = false;
      NEGOTIATION.isMyMicCanUse = false;
      NEGOTIATION.isMyMicOn = false;
      NEGOTIATION.isMyCameraError = true;
      NEGOTIATION.isMyMicError = true;
      return;
    });
//console.log('★★★ mediaDevices.getUserMedia setupGetUserMedia END');
  }
}

function onPeerErrorProc(error)
{
}

function onDataProc(json)
{
	if (json && json.command) {
		if (json.core_command) {
			receiveCoreCommand(json);
		} else {
			receiveCommonCommand(json);
		}
	}
}

let isPublishHorizontalVideo = false;
let publishingHorisontalVideo = false;

function publishHorizontalStreamCallback()
{
	publishingHorisontalVideo = false;
	isPublishHorizontalVideo = true;
}

function publishHorizontalVideo()
{
	// 配信処理中は無動作
	if (publishingHorisontalVideo == true) {
		return;
	}
	if (isPublishHorizontalVideo == true) {
		stopPublishHorizontalVideo();
	}
	// TODO 削除、資料共有開始でpublish
	if($("#room_mode").val() == ROOM_MODE_2) {
	} else {
		publishingHorisontalVideo = true;
		let publishOptions;// optionなし
		if (NEGOTIATION.isMyCameraOn) {
			// カメラON
			if (isStartBodypixVideo()) {
				let bodyPixCanvas = document.getElementById("myCanvasBodyPix");
				let bodyPixCanvasStream = bodyPixCanvas.captureStream();
				publisher.roomHorizontalRow.publish(bodyPixCanvasStream, 'guestscreen', 'main', publishOptions, publishHorizontalStreamCallback, publishHorizontalStreamCallback);
			} else {
				let canvasLocalStream = local_video_canvas.captureStream();
				publisher.roomHorizontalRow.publish(canvasLocalStream, 'guestscreen', 'main', publishOptions, publishHorizontalStreamCallback, publishHorizontalStreamCallback);
			}
		} else {
			let videoOffStream = videoOffCanvas.captureStream();
			publisher.roomHorizontalRow.publish(videoOffStream, 'guestscreen', 'main', publishOptions, publishHorizontalStreamCallback, publishHorizontalStreamCallback);
		}
	}
}

function stopPublishHorizontalVideo()
{
	if (isPublishHorizontalVideo = false) {
		return;
	}
	// TODO 削除、資料共有開始でpublish
	if($("#room_mode").val() == ROOM_MODE_2) {
	} else {
		let publishOptions;// optionなし
		publisher.roomHorizontalRow.stopPublish('guestscreen', 'main');
		isPublishHorizontalVideo = false;
	}
}

function joinMeetinRoom()
{
	let userName = 'guest';
	let userRole = 'guest';
	let room_name = document.getElementById("Room_name").value || '';
	if (room_name == null || room_name.length == 0) {
		return;
	}

	// 接続ユーザー一覧の隠す表示制御
	$(document).on('click', ".video_list_cam_btn", (e) => {
		// 一人拡大処理中または一人拡大表示中は無効
		if (isSpotlightingVideo()) {
			return;
		}
		let $camBtn = $(e.currentTarget);
		let peer_id = $camBtn.data('id');
		let is_visible = $("#negotiation_video_area_squarebox").is(':visible');
		if (is_visible) {
			$("#negotiation_video_area_squarebox").hide();
		} else {
			$("#negotiation_video_area_squarebox").show();
		}
		is_visible = !is_visible;
		if (is_visible) {
			$(e.currentTarget).html('<span class="icon-video video_list_cam_icon"></span>隠す');
		} else {
			$(e.currentTarget).html('<span class="icon-video-off video_list_cam_icon"></span>表示する');
		}
		showUserlistCamBtn($camBtn, is_visible);
	});
	// ビデフレーム内の非表示アイコンクリック
	$("#video_remove_icon_squarebox").click((e) => {
		$("#negotiation_video_area_squarebox").hide();
	});

	// メイン合成レイアウトルーム
	console.log(`join to room: ${room_name}`);

	// メインルームの入室は最後
	// 横一列レイアウトのルーム
	publisher.roomHorizontalRow.join(`${room_name}-horizontalrow`, userName, userRole, () => {
		console.log(`roomHorizontalRow.join ${publisher.roomHorizontalRow.myId}`);
		// ストリーム受信
		let subscribeOptions;// optionなし
		publisher.roomHorizontalRow.subscribe('main', subscribeOptions, (media) => {
			publisher.subscribeHorizontalRowStream = media;
			publisher.subscribeHorizontalRowStream.label = "subscribe-horizontalrow-stream";
			playStream(meetinHorizontalRowVideo, publisher.subscribeHorizontalRowStream, true);
			publishHorizontalVideo();
		});
	});
	publisher.roomHorizontalRow.on('peerJoin', peerId => {
//		console.log(`[roomHorizontalRow.peerJoin] ${peerId} 入室`);
	});
	publisher.roomHorizontalRow.on('data', ({ data, src }) => {
//		console.log(`[roomHorizontalRow.data] src : ${src}`);
	});
	publisher.roomHorizontalRow.on('peerLeave', peerId => {
//		console.log(`[roomHorizontalRow.peerLeave] ${peerId} 退室`);
	});
	publisher.roomHorizontalRow.addEventListener('disconnected', (error) => {
		console.log(`roomHorizontalRow ${error.type}: ${error.message}`);
//		onPeerErrorProc(error);
	});

	// 画面共有ルーム
	publisher.roomShareScreen.join(`${room_name}-sharescreen`, userName, userRole, () => {
		console.log(`[rooms.open] 画面共有開始 ${publisher.roomShareScreen.myId}`);
		// ストリーム受信
		let subscribeOptions;// optionなし
		publisher.roomShareScreen.subscribe('main', subscribeOptions, (media) => {
			console.log('publisher.roomShareScreen.subscribe');
			publisher.subscribeSharescreenStream = media;
			publisher.subscribeSharescreenStream.label = "subscribe-sharescreen-stream";
			receiveTargetScreenStreamMcu();
			// 入室後、最初の画面同期（全ての受信ストリームを取得したタイミングで行う
			if (publisher.subscribeStream && publisher.subscribeSharescreenStream) {
			}
		});
	});
	publisher.roomShareScreen.on('peerJoin', peerId => {
		console.log(`[roomss.peerJoin] ${peerId} 画面共有入室`);
	});
	publisher.roomShareScreen.on('peerLeave', peerId => {
		console.log(`[roomss.peerLeave] ${peerId} 画面共有退室`);
	});


	publisher.room.join(`${room_name}-subscribervideo`, userName, userRole, () => {
		stopwatch.reset();
		stopwatch.start();
		console.log(`room.join ${publisher.room.myId}`);
//		console.log(publisher.room.members);

		let profile_image = captureLocalStream();
		if (NEGOTIATION.isMyCameraOn == false) {
			profile_image = null;
		}
		/* 自分の情報設定 */
		let peer_info = {
			my_user_info: $("#my_user_info").val(),
			room_mode: $("#room_mode").val(),
			client_id: $("#client_id").val(),
			staff_type: $("#staff_type").val(),
			staff_id: $("#staff_id").val(),
			profile_image: profile_image,
		};
		peer_info.joined_time = new Date().getTime();

		publisher.peers[publisher.room.myId] = {
			command: "",
			peer_id: publisher.room.myId,
			peer_info: peer_info,
		}
		appendUserList(publisher.room.myId);
		setupPublishUser(publisher.room.myId, {
			user_agent: navigator.userAgent,
			has_focus: document.hasFocus(),
			from_browser: USER_PARAM_BROWSER,
			from_browser_version: platform.version,
			from_os:        platform.os.family,
			from_os_version: platform.os.version,
			from_user_info: $("#my_user_info").val(),
		});

		/* 自分以外既に入室済みのユーザー領域確保 */
		publisher.room.members.forEach(member => {
			publisher.peers[member] = {};
			appendUserList(member);
			const data = {
				command: "REQUEST_USER",
				peer_id: member,
			};
			sendCommand(null, data);
		});
		// ストリーム受信
		let subscribeOptions;// optionなし
		publisher.room.subscribe('main', subscribeOptions, (media) => {
			publisher.subscribeStream = media;
			publisher.subscribeStream.label = "subscribe-stream";
			playStream(meetinVideo, publisher.subscribeStream, false);
			if($("#room_mode").val() == ROOM_MODE_2) {
			} else {
				let publishOptions;// optionなし
				if (NEGOTIATION.isMyCameraCanUse == false || NEGOTIATION.isMyCameraOn == false) {
					startVideoOffStream();
					let videoOffStream = videoOffCanvas.captureStream();
					if (publisher.localStream) {
						let localAudioTrack = publisher.localStream.getAudioTracks()[0];
						if (localAudioTrack) {
							videoOffStream.addTrack(localAudioTrack);
						}
					}
					publisher.room.publish(videoOffStream, 'guestscreen', 'main', publishOptions);
				} else {
					if (isStartBodypixVideo()) {
					let bodyPixCanvas = document.getElementById("myCanvasBodyPix");
					let bodyPixCanvasStream = bodyPixCanvas.captureStream();
						if (publisher.localStream) {
							let localAudioTrack = publisher.localStream.getAudioTracks()[0];
							if (localAudioTrack) {
								bodyPixCanvasStream.addTrack(localAudioTrack);
							}
						}
						publisher.room.publish(bodyPixCanvasStream, 'guestscreen', 'main', publishOptions);
					} else {
						let canvasLocalStream = local_video_canvas.captureStream();
						if (publisher.localStream) {
							let localAudioTrack = publisher.localStream.getAudioTracks()[0];
							if (localAudioTrack) {
								canvasLocalStream.addTrack(localAudioTrack);
							}
						}
						publisher.room.publish(canvasLocalStream, 'guestscreen', 'main', publishOptions);
					}
				}
				sendPublishUser(publisher.room.myId);
			}
		});
		// 一人拡大ルーム:同席モードは拡大表示機能なし
		if($("#room_mode").val() == ROOM_MODE_1){
			startSpotlightPublisher();
		}
		countRoomMembers();
		// 同期処理
		initSyncDb();
	});
	publisher.room.on('peerJoin', peerId => {
		console.log(`[room.peerJoin] ${peerId} 入室`);
		publisher.peers[peerId] = {};
		appendUserList(peerId);
		// 新規入室ユーザー情報取得
		const data = {
			command: "REQUEST_USER",
			peer_id: peerId,
		};
		sendCommand(null, data);
		countRoomMembers();
	});
	publisher.room.on('data', ({ data, src }) => {
//console.log(`[room.data] src : ${src}`);
		const json = JSON.parse(data);
//		console.log(json);
		onDataProc(json);
	});
	publisher.room.on('peerLeave', peerId => {
		console.log(`[room.peerLeave] ${peerId} 退室`);
		// 一人拡大中のメンバーの場合は退出
		if (current_spotlight_peer_id == peerId) {
			onCloseSpotlightVideo();
		}
		removeUserList(peerId);
		delete publisher.peers[peerId];
		countRoomMembers();
	});

	publisher.room.addEventListener('disconnected', (error) => {
		console.log(`${error.type}: ${error.message}`);
		onPeerErrorProc(error);
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

(async function negotiation_main() {

//console.log('★negotiation_main 1 START');
	await setupGetUserMedia(getMediaConstraints());
//console.log('★negotiation_main 1 END');
	const localVideo = document.getElementById("local_video");
	playStream(localVideo, publisher.localStream, true);
	local_video_canvas.width = local_video_canvas_width;
	local_video_canvas.height = local_video_canvas_height;
	startLocalVideoCanvas();
	// PCロード画面
	$("div.in_connect_area").hide();
	// SPロード画面
	$("#content_wrap").hide();

	if(USER_PARAM_IS_MOBILE) {
		// スマホモード
		if($("#room_mode").val() == ROOM_MODE_1){
				NEGOTIATION.isMyCameraOn = true;
				NEGOTIATION.isMyMicOn = true;
			// 通常商談
		} else {
			// モニタリングモード
			// 明示的にマイクをOFFにする
			micOff();
			NEGOTIATION.isMyMicOn = false;
			// マイクとビデオ状態の更新
			NEGOTIATION.updateStatusVideoAudio();
		}
	} else {
		// PCモード
		// カメラ準備完了後の処理
		if($("#room_mode").val() == ROOM_MODE_1) {
			if (NEGOTIATION.isMyCameraCanUse == false || localStorage.getItem('use_camera_flg') == "false") {
				cameraOff();
				NEGOTIATION.isMyCameraOn = false;
				NEGOTIATION.updateStatusVideoStream(publisher.localStream);
			} else {
				NEGOTIATION.isMyCameraOn = true;
				NEGOTIATION.updateStatusVideoStream(publisher.localStream);
			}

			if (NEGOTIATION.isMyMicCanUse == false || localStorage.getItem('use_mic_flg') == "false") {
				// マイクをOFF
				micOff();
				NEGOTIATION.isMyMicOn = false;
				NEGOTIATION.updateStatusAudioStream(publisher.localStream);
			} else {
				NEGOTIATION.isMyMicOn = true;
				NEGOTIATION.updateStatusAudioStream(publisher.localStream);
			}
		}else{
			// 明示的にマイクをOFFにする
			micOff();
			NEGOTIATION.isMyMicOn = false;
			NEGOTIATION.isMyCameraOn = false;
			// マイクとビデオ状態の更新
			NEGOTIATION.updateStatusVideoStream(null);
			NEGOTIATION.updateStatusAudioStream(null);
		}
	}
	$(".mi_contents_background_info_content").hide();

	// MCUサーバ取得
	let fd = new FormData();
	fd.append("room_name", $("#Room_name").val());
	fetchPost('/negotiation/get-mcu-server', fd)
	.then((response) => {
		if (response.status == 1) {
			publisher.room.setMcuServer(response.server);
			publisher.roomHorizontalRow.setMcuServer(response.server);
			publisher.roomShareScreen.setMcuServer(response.server);
			publisher.roomSpotlightPublisher.setMcuServer(response.server);
			publisher.roomSpotlightSubscriber.setMcuServer(response.server);

			// 入室
			joinMeetinRoom();
		}
	}).catch((err) => {;
		console.log(err);
	});

})();
