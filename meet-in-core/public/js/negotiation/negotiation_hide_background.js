let hideCanvas = document.getElementById("myCanvasHideBackground");
let hideCtx = hideCanvas.getContext("2d");
let selfieSegmentation = null;
let processor = null;
let writableStream = null;
let hideCanvasStream = null;

let internalResolution = 0.2; //'full';
let segmentationThreshold = 0.7;
let maskBlurAmount = 0;
let blurEffectFlag = false;
let backgndImg = new Image();

let bodypix_background_path = 'bodypix_no_effect';
let isWaitingRoom = false;

async function loadBkgndImage(imgPath) {
	backgndImg.src = imgPath;
	return backgndImg;
}

// negotiation_mainのローカルストレージの設定よりも早く呼び出されてしまう為、
// ログインユーザーとゲストユーザーで合成背景の画像パスを取得する
async function checkIsOperator() {
	let BACKGROUND_EFFECT_ID = 'bodypix_background_path';
	if($('#is_operator').val() !== "1") {
		bodypix_background_path = localStorage.getItem(BACKGROUND_EFFECT_ID);
	} else {
		bodypix_background_path = document.getElementById(BACKGROUND_EFFECT_ID).value;
		console.log(bodypix_background_path)
	}
}

async function loadModel() {

	const user_id = document.getElementById('user_id').value;
	const localVideo = document.getElementById(`video_target_video_${user_id}`);
	if(localVideo == null) {
		return;
	}

	await checkIsOperator();

	console.log('hideBackground ready');

	if (bodypix_background_path == 'bodypix_no_effect') {
	} else if (bodypix_background_path == 'bodypix_blur_effect') {
		blurEffectFlag = true;
	} else {
		backgndImg = await loadBkgndImage(bodypix_background_path);
		// 一旦表示、合成開始後に非表示
		hideCanvas.style.display = "";
	}

  // selfie_segmentationのエラー回避の為、待合室とroom内でイベント発火数を分ける
	if (isWaitingRoom) {
		localVideo.addEventListener('loadedmetadata', async (e) => {
			console.log(`${localVideo.videoWidth}x${localVideo.videoHeight}`);
			if(hideCanvas == null) {
				hideCanvas = document.getElementById("myCanvasHideBackground");
			}
			localVideo.width = localVideo.videoWidth;
			localVideo.height = localVideo.videoHeight;
			hideCanvas.width = localVideo.videoWidth;
			hideCanvas.height = localVideo.videoHeight;

			if (backgndImg != null) {
				if (bodypix_background_path == 'bodypix_no_effect') {
				} else if (bodypix_background_path == 'bodypix_blur_effect') {
				} else {
					backgndImg = await loadBkgndImage(bodypix_background_path);
					hideCtx.drawImage(
						backgndImg,
						0,
						0,
						backgndImg.width,
						backgndImg.height,
						0,
						0,
						hideCanvas.width,
						hideCanvas.height
					);
				}
			} else {
				if (bodypix_background_path == 'bodypix_no_effect') {
				} else if (bodypix_background_path == 'bodypix_blur_effect') {
				} else {
					backgndImg = await loadBkgndImage(bodypix_background_path);
					hideCtx.drawImage(
						backgndImg,
						0,
						0,
						backgndImg.width,
						backgndImg.height,
						0,
						0,
						hideCanvas.width,
						hideCanvas.height
					);
				}
			}
			if (bodypix_background_path == 'bodypix_no_effect') {
				stopHideCanvasVideo();
			} else {
				setHideCanvasBrightness();
				startHideCanvasVideo();
			}
		},{once: true});
	} else {
		localVideo.addEventListener('loadedmetadata', async (e) => {
			console.log(`${localVideo.videoWidth}x${localVideo.videoHeight}`);
			if(hideCanvas == null) {
				hideCanvas = document.getElementById("myCanvasHideBackground");
			}
			localVideo.width = localVideo.videoWidth;
			localVideo.height = localVideo.videoHeight;
			hideCanvas.width = localVideo.videoWidth;
			hideCanvas.height = localVideo.videoHeight;

			if (backgndImg != null) {
				if (bodypix_background_path == 'bodypix_no_effect') {
				} else if (bodypix_background_path == 'bodypix_blur_effect') {
				} else {
					backgndImg = await loadBkgndImage(bodypix_background_path);
					hideCtx.drawImage(
						backgndImg,
						0,
						0,
						backgndImg.width,
						backgndImg.height,
						0,
						0,
						hideCanvas.width,
						hideCanvas.height
					);
				}
			} else {
				if (bodypix_background_path == 'bodypix_no_effect') {
				} else if (bodypix_background_path == 'bodypix_blur_effect') {
				} else {
					backgndImg = await loadBkgndImage(bodypix_background_path);
					hideCtx.drawImage(
						backgndImg,
						0,
						0,
						backgndImg.width,
						backgndImg.height,
						0,
						0,
						hideCanvas.width,
						hideCanvas.height
					);
				}
			}
			if (bodypix_background_path == 'bodypix_no_effect') {
				stopHideCanvasVideo();
			} else {
				setHideCanvasBrightness();
				startHideCanvasVideo();
			}
		});
	}
}

function startHideBackground() {

	console.log('loading');
	loadModel();
}
startHideBackground();

const updateSegment = async () => {
	function onResults(results) {
		hideCtx.save();
		hideCtx.clearRect(
			0,
			0,
			hideCanvas.width,
			hideCanvas.height
		);
		// マスク
		hideCtx.drawImage(
			results.segmentationMask,
			0,
			0,
			hideCanvas.width,
			hideCanvas.height
		);
		// ユーザー
		hideCtx.globalCompositeOperation = "source-in";
		hideCtx.drawImage(
			results.image,
			0,
			0,
			hideCanvas.width,
			hideCanvas.height
		);
		// 合成背景か否か
		hideCtx.globalCompositeOperation = "destination-atop";
		if (bodypix_background_path === 'bodypix_no_effect') {
			// カメラのみ
			hideCtx.filter = `blur(0)`;
			hideCtx.drawImage(
				results.image,
				0,
				0,
				hideCanvas.width,
				hideCanvas.height
			);
		} else if (blurEffectFlag) {
			// ぼかし
			hideCtx.filter = `blur(${10}px)`;
			hideCtx.drawImage(
				results.image,
				0,
				0,
				hideCanvas.width,
				hideCanvas.height
			);
		} else {
			// 合成背景
			hideCtx.filter = `blur(0)`;
			hideCtx.drawImage(
				backgndImg,
				0,
				0,
				hideCanvas.width,
				hideCanvas.height
			);
		}

		hideCtx.restore();
		results.segmentationMask.close();
		results.image.close();
	}

	const selfieSegmentation = new SelfieSegmentation({
		locateFile: (file) => {
			return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
		},
	});

	selfieSegmentation.setOptions({
		modelSelection: 1,
	});

	selfieSegmentation.onResults(onResults);

	const user_id = document.getElementById('user_id').value;
	const localVideo = document.getElementById(`video_target_video_${user_id}`);

	if (localVideo.srcObject) {
		processor = new MediaStreamTrackProcessor(
			localVideo.srcObject.getVideoTracks()[0]
		);

		writableStream = new WritableStream({
			start() {
				console.log("WritableStream started");
			},
			async write(videoFrame) {
				const imageBitmap = await createImageBitmap(videoFrame);
				await selfieSegmentation.send({ image: imageBitmap });
				imageBitmap.close();
				videoFrame.close();
			},
			close() {
				console.log("WritableStream stopped");
				// 初期化
				processor = null;
				writableStream = null;
				hideCtx.clearRect(
					0,
					0,
					hideCanvas.width,
					hideCanvas.height
				);
			},
			abort(err) {
				console.warn(err);
			},
		});
		processor.readable.pipeTo(writableStream);
	} else {
		return;
	}
}

const startHideCanvasVideo = () => {
	console.log('startHideCanvasVideo');
	const user_id = document.getElementById('user_id').value;
	const localVideo = document.getElementById(`video_target_video_${user_id}`);
	localVideo.style.display = "none";
	hideCanvas.style.display = "";

	hideCanvasStream = hideCanvas.captureStream();

	updateSegment();

	cameraChromakeyOn(hideCanvasStream);
}

const stopHideCanvasVideo = () => {
	const user_id = document.getElementById('user_id').value;
	const localVideo = document.getElementById(`video_target_video_${user_id}`);
	localVideo.style.display = "";
	hideCanvas.style.display = "none";

	if (hideCanvasStream) {
		hideCanvasStream.getTracks().forEach(track => {track.stop(); });
		hideCanvasStream = null;
		console.log('hideCanvasStream stop');
	}

	cameraChromakeyOff();
}


const settingBodypixTrigger = document.getElementById('button_setting_bodypix');
settingBodypixTrigger.addEventListener('click', onClickSettingBodypixDialog);

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
	if (!event.target.matches('.dropbtn')) {
		var dropdowns = document.getElementsByClassName("dropdown-content");
		var i;
		for (i = 0; i < dropdowns.length; i++) {
			var openDropdown = dropdowns[i];
			if (openDropdown.classList.contains('show')) {
				openDropdown.classList.remove('show');
			}
		}
	}
}

// safariではbodyPixを使用する可能性を考慮し、処理名を同一名で利用
const onOpenBodypixDialog = () => {
	$('#internalResolutionInput').val(internalResolution*100);
	$('#segmentationThresholdInput').val(segmentationThreshold*100);
	$('#maskBlurAmountInput').val(maskBlurAmount);

	let selDiv = document.getElementById(`${bodypix_background_path}`);
	if (selDiv != null) {
		selDiv.classList.toggle('gallery-selected', true);
	}
}

// safariではbodyPixを使用する可能性を考慮し、処理名を同一名で利用
const onCancelBodypixDialog = () => {
	setHideCanvasBrightness();
	var videoConstranints = getVideoConstraints('idealVga');
	console.log(videoConstranints);
	cameraOff();
	cameraOn(videoConstranints);
}

// safariではbodyPixを使用する可能性を考慮し、処理名を同一名で利用
const onOkBodypixDialog = () => {
	setHideCanvasBrightness();
	var videoConstranints = getVideoConstraints('idealVga');
	console.log(videoConstranints);
	cameraOff();
	cameraOn(videoConstranints);
	const galleries = document.querySelector('.gallery-selected');
	if(galleries == null) {
		bodypix_background_path = 'bodypix_no_effect';
		stopHideCanvasVideo();
		// 画面に埋め込んでいる、背景画像パスを変更する
		$("#bodypix_background_path").val("bodypix_no_effect");
	} else {
		console.log(galleries.id);
		bodypix_background_path = galleries.id;
		if (galleries.id === 'bodypix_no_effect') {
			stopHideCanvasVideo();
		} else if (galleries.id === 'bodypix_blur_effect') {
			blurEffectFlag = true;
			loadBkgndImage(galleries.id);
			startHideCanvasVideo();
		} else {
			blurEffectFlag = false;
			loadBkgndImage(galleries.id);
			startHideCanvasVideo();
		}
		// 画面に埋め込んでいる、背景画像パスを変更する
		$("#bodypix_background_path").val(galleries.id.split("?")[0]);
	}
	$("#setting-bodypix-dialog").fadeOut(500);

	onOkBodypixDialogPlugin(bodypix_background_path, internalResolution, segmentationThreshold, maskBlurAmount);
}

// 輝度を設定
const setHideCanvasBrightness = () => {
	const user_id = document.getElementById('user_id').value;
	let beauty_mode = localStorage.getItem('beauty_mode');
	// ビューティモード(輝度150%) 値や 輝度の設定を反映
	if(beauty_mode == BEAUTY_MODE_ON) {
		settingBeautyMode(user_id, localStorage.getItem('beauty_mode')); // 輝度も設定すると同じ値だから打ち消される.
	} else {
		setBrightnessVal(NEGOTIATION.use_bright);
	}
}

// 処理の拡張.
var onOkBodypixDialogPlugin = function(bodypix_background_path, internalResolution, segmentationThreshold, maskBlurAmount) {
	//console.log({bodypix_background_path, internalResolution, segmentationThreshold, maskBlurAmount});
}