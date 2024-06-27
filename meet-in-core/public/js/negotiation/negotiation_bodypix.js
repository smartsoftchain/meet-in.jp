
const guiState = {
	input: {
		architecture: 'MobileNetV1',
		outputStride: 16,
		multiplier: 0.50,
		quantBytes: 2
	},
};

let bodyPixCanvas = document.getElementById("myCanvasBodyPix");
let bodyPixCtx = bodyPixCanvas.getContext("2d");
let canvasBg = document.getElementById("myCanvasBg");
let ctxBg = canvasBg.getContext("2d");
let bodyPixCanvasStream = null;

let canvasVideo = null;
let ctxVideo = null;

let bodyPixNet = null;
let bodyPixMask = null;
let contineuAnimation = false;
let segmentTimerId = null;
let animationId = null;
let internalResolution = 0.2; //'full';
let segmentationThreshold = 0.7;
let maskBlurAmount = 0;
let checkboxChromakey = true;
let chromaKeyColor = { r: 255, g: 255, b: 255, a: 255 };
let colorDistance = 10;
let checkboxBokehEffect = false;
let backgndImg = null;
let bodypix_dialog_after_load_event = true;

let bodypix_background_path = 'bodypix_no_effect';
let connectBodypixFlg = false;  //背景合成の許可申請を制御する

async function loadBodypixBkgndImage(imgPath) {
	let Img = new Image();
	Img.onload = () => {
		canvasBg.width = Img.width;
		canvasBg.height = Img.height;
		ctxBg.drawImage(Img, 0, 0, Img.width, Img.height);
	}
	Img.src = imgPath;
	return Img;
}

/**
 * 入室時に合成許可申請する
 * 　2020/11/27 safariのみ
 */
async function setBackgndImgDialog() {

	bodypix_background_path = document.getElementById('bodypix_background_path').value;
	if (bodypix_background_path == 'bodypix_no_effect') {
		return;
	}

	$(function () {
		$('#load_bodypix-modal').fadeIn();
		$('.load_bodypix_cancel').click(function(){
			$('#load_bodypix-modal').fadeOut();
			bodypix_background_path = 'bodypix_no_effect';
			connectBodypixFlg = false;
			stopBodyPixCanvasVideo();
		});

		$('#load_bodypix_button').click(async() => {
			$('#load_bodypix-modal').fadeOut();
			connectBodypixFlg = true;
			loadBodypixModel();
			// ここで映像を再生
			var videoConstranints = getVideoConstraints('idealVga');
			cameraOn(videoConstranints);
			await startBodyPixCanvasVideo();
		});
	});
}

async function loadBodypixModel() {

	const user_id = document.getElementById('user_id').value;
	const localVideo = document.getElementById(`video_target_video_${user_id}`);
	if(localVideo == null) {
		return;
	}

//	const net = await bodyPix.load(/** optional arguments, see below **/);
	const net = await bodyPix.load({
		architecture: guiState.input.architecture,
		outputStride: guiState.input.outputStride,
		multiplier: guiState.input.multiplier,
		quantBytes: guiState.input.quantBytes
	});
	bodyPixNet = net;
console.log('bodyPix ready');

	canvasVideo = document.createElement("canvas");
	ctxVideo = canvasVideo.getContext("2d");

//	let _internalResolution = parseInt(document.getElementById('bodypix_internal_resolution').value || 100);
//	internalResolution = _internalResolution / 100;
	internalResolution = 45 / 100;

//	let _segmentationThreshold = parseInt(document.getElementById('bodypix_segmentation_threshold').value || 100);
	segmentationThreshold = 75 / 100;

//	let _maskBlurAmount = parseInt(document.getElementById('bodypix_mask_blur_amount').value || 0);
	maskBlurAmount = 0;
//console.log(`${internalResolution} / ${segmentationThreshold} / ${maskBlurAmount}`);

	bodypix_background_path = document.getElementById('bodypix_background_path').value;
	if (bodypix_background_path == 'bodypix_no_effect') {
	} else if (bodypix_background_path == 'bodypix_blur_effect') {
		checkboxBokehEffect = true;
	} else {
		backgndImg = await loadBodypixBkgndImage(bodypix_background_path);
		// 一旦表示、合成開始後に非表示
		canvasBg.style.display = "";
	}



	const is_operator = document.getElementById('is_operator').value || '0';

	// safariの仕様で合成後映像の自動再生が出来ないため
	if (USER_PARAM_BROWSER === "Safari") {

		// 一旦ここで再度背景画像なし状態とする
		save_checkboxBokehEffect = checkboxBokehEffect;
		save_backgndImg = backgndImg;
		save_bodypix_dialog_after_load_event = bodypix_dialog_after_load_event;
		save_bodypix_background_path = bodypix_background_path;

		// 背景合成なしの状態に初期化
		checkboxBokehEffect = false;
		backgndImg = null;
		bodypix_dialog_after_load_event = true;
		bodypix_background_path = 'bodypix_no_effect';

		if (connectBodypixFlg) {
			// 変数戻し
			checkboxBokehEffect = save_checkboxBokehEffect;
			backgndImg = save_backgndImg;
			bodypix_dialog_after_load_event = save_bodypix_dialog_after_load_event;
			bodypix_background_path = save_bodypix_background_path;
		}
	}

	localVideo.addEventListener('loadedmetadata', async (e) => {
console.log(`${localVideo.videoWidth}x${localVideo.videoHeight}`);
		if(bodyPixCanvas == null) {
			bodyPixCanvas = document.getElementById("myCanvasBodyPix");
		}
		localVideo.width = localVideo.videoWidth;
		localVideo.height = localVideo.videoHeight;
		bodyPixCanvas.width = localVideo.videoWidth;
		bodyPixCanvas.height = localVideo.videoHeight;
		canvasBg.width = localVideo.videoWidth;
		canvasBg.height = localVideo.videoHeight;
		canvasVideo.width = localVideo.videoWidth;
		canvasVideo.height = localVideo.videoHeight;

/*
		if (is_operator != '1' && bodypix_dialog_after_load_event == true) {
			cameraStreamDisable();
		} else {
			cameraStreamEnable();
		}
*/
		if (backgndImg != null) {
			if (bodypix_background_path == 'bodypix_no_effect') {
			} else if (bodypix_background_path == 'bodypix_blur_effect') {
			} else {
				backgndImg = await loadBodypixBkgndImage(bodypix_background_path);
				ctxBg.drawImage(backgndImg, 0, 0, backgndImg.width, backgndImg.height, 0, 0, canvasBg.width, canvasBg.height);
			}
		} else {
			if (bodypix_background_path == 'bodypix_no_effect') {
			} else if (bodypix_background_path == 'bodypix_blur_effect') {
			} else {
				backgndImg = await loadBodypixBkgndImage(bodypix_background_path);
				ctxBg.drawImage(backgndImg, 0, 0, backgndImg.width, backgndImg.height, 0, 0, canvasBg.width, canvasBg.height);
			}
		}
		if (bodypix_background_path == 'bodypix_no_effect') {
			stopBodyPixCanvasVideo();
		} else {
			bodyPixCanvas.style.filter = 'brightness(125%)';
			startBodyPixCanvasVideo();
		}
	});
}

function startNegotiationBodypix() {
	if (USER_PARAM_BROWSER === "Safari") {
		loadBodypixModel();
		setBackgndImgDialog();
	} else {
		loadBodypixModel();
	}
}
startNegotiationBodypix();


const updateSegment = async () => {
const segmenteUpdateTime = 100;

if (!bodyPixNet) {
	return;
}

const option = {
	flipHorizontal: false,
	internalResolution: internalResolution,
	segmentationThreshold: segmentationThreshold,
	maxDetections: 4,
	scoreThreshold: 0.5,
	nmsRadius: 20,
	minKeypointScore: 0.3,
	refineSteps: 10
};

const user_id = document.getElementById('user_id').value;
const localVideo = document.getElementById(`video_target_video_${user_id}`);
ctxVideo.drawImage(localVideo, 0, 0, localVideo.videoWidth, localVideo.videoHeight);

await bodyPixNet.segmentPerson(canvasVideo, option)
.then(segmentation => {
	let _clr = {};
	_clr = chromaKeyColor;
	_clr.a = 255;
	const fgColor = { r: 0, g: 0, b: 0, a: 0 };
	const bgColor = _clr; // { r: 127, g: 127, b: 127, a: 255 };
	if (checkboxBokehEffect == true) {
	const flipHorizontal = false;
	const backgroundBlurAmount = 9;
	const edgeBlurAmount = 0;

	bodyPix.drawBokehEffect(
		bodyPixCanvas, canvasVideo, segmentation, backgroundBlurAmount,
		edgeBlurAmount, flipHorizontal
	);
	} else {
	const personPartImage = bodyPix.toMask(segmentation, fgColor, bgColor);
	bodyPixMask = personPartImage;
	drawCanvas();
	}
	if (contineuAnimation) {
		segmentTimerId = setTimeout(updateSegment, segmenteUpdateTime);
	}
})
.catch(err => {
console.error('segmentPerson ERROR:', err);
});
}

const drawCanvas = () => {
const user_id = document.getElementById('user_id').value;
const localVideo = document.getElementById(`video_target_video_${user_id}`);
let canvasBg = document.getElementById("myCanvasBg");
let ctxBg = canvasBg.getContext("2d");
let canvasTmp = document.getElementById("myCanvasTmp");
let ctxTmp = canvasTmp.getContext("2d");

const opacity = 1.0;
const flipHorizontal = false;
//  const maskBlurAmount = 0;
//  const maskBlurAmount = 3;

if (checkboxBokehEffect == true) {
} else {
	if (checkboxChromakey == true) {
	bodyPix.drawMask(
	canvasTmp, canvasVideo, bodyPixMask, opacity, maskBlurAmount,
	flipHorizontal
	);
	chromaKey(ctxTmp, canvasTmp, ctxBg, canvasBg, bodyPixCtx, bodyPixCanvas);
	} else {
	bodyPix.drawMask(
	bodyPixCanvas, canvasVideo, bodyPixMask, opacity, maskBlurAmount,
	flipHorizontal
	);
	}
}
}

const updateCanvas = () => {
drawCanvas();
if (contineuAnimation) {
	animationId = window.requestAnimationFrame(updateCanvas);
}
}

const chromaKey = (ctx0, canvas0, ctx1, canvas1, ctx2, canvas2) => {
var imageData = ctx0.getImageData(0, 0, canvas0.width, canvas0.height),
	data = imageData.data; //参照渡し

// dataはUint8ClampedArray
// 長さはcanvasの width * height * 4(r,g,b,a)
// 先頭から、一番左上のピクセルのr,g,b,aの値が順に入っており、
// 右隣のピクセルのr,g,b,aの値が続く
// n から n+4 までが1つのピクセルの情報となる

for (var i = 0, l = data.length; i < l; i += 4) {
	var target = {
	r: data[i],
	g: data[i + 1],
	b: data[i + 2]
	};

	// chromaKeyColorと現在のピクセルの三次元空間上の距離を閾値と比較する
	// 閾値より小さい（色が近い）場合、そのピクセルを消す
	if (getColorDistance(chromaKeyColor, target) < colorDistance) {
	// alpha値を0にすることで見えなくする
	data[i + 3] = 0;
	}
}

ctx0.putImageData(imageData, 0, 0);
ctx2.drawImage(canvas1,0,0,canvas0.width,canvas0.height);
ctx2.drawImage(canvas0,0,0,canvas0.width,canvas0.height);
}

// r,g,bというkeyを持ったobjectが第一引数と第二引数に渡される想定
const getColorDistance = (rgb1, rgb2) => {
// 三次元空間の距離が返る
return Math.sqrt(
	Math.pow((rgb1.r - rgb2.r), 2) +
	Math.pow((rgb1.g - rgb2.g), 2) +
	Math.pow((rgb1.b - rgb2.b), 2)
);
}

const startBodyPixCanvasVideo = () => {
	canvasBg.style.display = "none";
	const user_id = document.getElementById('user_id').value;
	const localVideo = document.getElementById(`video_target_video_${user_id}`);
	localVideo.style.display = "none";
	bodyPixCanvas.style.display = "";
	contineuAnimation = true;
/*
	animationId = window.requestAnimationFrame(updateCanvas);

updateCanvasIntervalId = setInterval(() => {
		drawCanvas();
		if (!contineuAnimation) {
			clearInterval(updateCanvasIntervalId);
			updateCanvasIntervalId = 0;
		}
	}, 100);
*/

	bodyPixCanvasStream = bodyPixCanvas.captureStream();

	updateSegment();

	cameraChromakeyOn(bodyPixCanvasStream);
}

const stopBodyPixCanvasVideo = () => {
	const user_id = document.getElementById('user_id').value;
	const localVideo = document.getElementById(`video_target_video_${user_id}`);
	localVideo.style.display = "";
	bodyPixCanvas.style.display = "none";

	contineuAnimation = false;
	if (segmentTimerId) {
		clearTimeout(segmentTimerId);
		segmentTimerId = null;
	}
/*
	window.cancelAnimationFrame(animationId);
*/

	if (bodyPixCanvasStream) {
		bodyPixCanvasStream.getTracks().forEach(track => {track.stop(); });
		bodyPixCanvasStream = null;
	}
	const stream = localVideo.srcObject;
//	console.log(`localVideo: ${stream.id}`);
	cameraChromakeyOff();
}

const settingBodypixTrigger = document.getElementById('button_setting_bodypix');
settingBodypixTrigger.addEventListener('click', onClickSettingBodypixDialog);

window.addEventListener('load', (event) => {
/*
	const is_operator = document.getElementById('is_operator').value || '0';
	const browser = document.getElementById('browser').value || '';

	if (browser == 'IE') {
	} else {
		if (is_operator != '1') {
			bodypix_dialog_after_load_event = true;
			onClickSettingBodypixDialog();
		}
	}
*/
});

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

const onOpenBodypixDialog = () => {
	$('#internalResolutionInput').val(internalResolution*100);
	$('#segmentationThresholdInput').val(segmentationThreshold*100);
	$('#maskBlurAmountInput').val(maskBlurAmount);

	let selDiv = document.getElementById(`${bodypix_background_path}`);
	if (selDiv != null) {
		selDiv.classList.toggle('gallery-selected', true);
	}
}

const onCancelBodypixDialog = () => {
	bodyPixCanvas.style.filter = 'brightness(125%)';
	var videoConstranints = getVideoConstraints('idealVga');
//	videoConstranints.video.frameRate = { ideal: 1, max: 15 };
console.log(videoConstranints);
	cameraOff();
	cameraOn(videoConstranints);
	const is_operator = document.getElementById('is_operator').value || '0';
	if (is_operator != '1') {
		bodypix_dialog_after_load_event = false;
	}
}

const onOkBodypixDialog = () => {
	bodyPixCanvas.style.filter = 'brightness(125%)';
	var videoConstranints = getVideoConstraints('idealVga');
	//	videoConstranints.video.frameRate = { ideal: 1, max: 15 };
	console.log(videoConstranints);
	cameraOff();
	cameraOn(videoConstranints);
	const is_operator = document.getElementById('is_operator').value || '0';
	if (is_operator != '1') {
		bodypix_dialog_after_load_event = false;
	}
	let internalResolutionVal = $('#internalResolutionInput').val();
//	internalResolution = parseInt(internalResolutionVal) / 100;
	internalResolution = 45 / 100;

	let segmentationThresholdVal = $('#segmentationThresholdInput').val();
	segmentationThreshold = 75 / 100;

	let maskBlurAmountVal = $('#maskBlurAmountInput').val();
	maskBlurAmount = 0;

//console.log(`${internalResolution} / ${segmentationThreshold} / ${maskBlurAmount}`);

	const galleries = document.querySelector('.gallery-selected');
	if(galleries == null) {
		bodypix_background_path = 'bodypix_no_effect';
		stopBodyPixCanvasVideo();
		// 画面に埋め込んでいる、背景画像パスを変更する
		$("#bodypix_background_path").val("bodypix_no_effect");
	} else {
		console.log(galleries.id);
		bodypix_background_path = galleries.id;
		if (galleries.id === 'bodypix_no_effect') {
			stopBodyPixCanvasVideo();
		} else if (galleries.id === 'bodypix_blur_effect') {
			checkboxBokehEffect = true;
			loadBodypixBkgndImage(galleries.id);
			startBodyPixCanvasVideo();
		} else {
			checkboxBokehEffect = false;
			loadBodypixBkgndImage(galleries.id);
			startBodyPixCanvasVideo();
		}
		// 画面に埋め込んでいる、背景画像パスを変更する
		$("#bodypix_background_path").val(galleries.id.split("?")[0]);
	}

	$("#setting-bodypix-dialog").fadeOut(500);

	onOkBodypixDialogPlugin(bodypix_background_path, internalResolution, segmentationThreshold, maskBlurAmount);
}

// 処理の拡張.
var onOkBodypixDialogPlugin = function(bodypix_background_path, internalResolution, segmentationThreshold, maskBlurAmount) {
	//console.log({bodypix_background_path, internalResolution, segmentationThreshold, maskBlurAmount});
}

