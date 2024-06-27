////////////////////////////////////////////////////////////////
// Meetinのシステムの既定値
////////////////////////////////////////////////////////////////

// 最大人数
const MEETIN_MAIN_MAX_PEOPLE = 5;
// 送信帯域の既定値
const DEFAULT_SEND_BANDWIDTH_LEVEL = 0;
// 受信帯域の既定値
const DEFAULT_RECEIVE_BANDWIDTH_LEVEL = 2;
// WebRTCのピアの文字列数
const MEETIN_WEBRTC_PEER_ID_LENGTH = 16;
const MEETIN_WEBSOCKET_PEER_ID_LENGTH = 17;

const DEFAULT_MEETIN_MAIN_SEND_BANDWIDTH_LEVEL_0 = 0;
const DEFAULT_MEETIN_MAIN_SEND_BANDWIDTH_LEVEL_1 = 1;
const DEFAULT_MEETIN_MAIN_SEND_BANDWIDTH_LEVEL_2 = 2;
const DEFAULT_MEETIN_MAIN_SEND_BANDWIDTH_LEVEL_3 = 3;
const DEFAULT_MEETIN_MAIN_SEND_BANDWIDTH_LEVEL_4 = 4;

const DEFAULT_MEETIN_MAIN_RECEIVE_BANDWIDTH_LEVEL_0 = 0;
const DEFAULT_MEETIN_MAIN_RECEIVE_BANDWIDTH_LEVEL_1 = 1;
const DEFAULT_MEETIN_MAIN_RECEIVE_BANDWIDTH_LEVEL_2 = 2;
const DEFAULT_MEETIN_MAIN_RECEIVE_BANDWIDTH_LEVEL_3 = 3;
const DEFAULT_MEETIN_MAIN_RECEIVE_BANDWIDTH_LEVEL_4 = 4;

const DEFAULT_PING_TIMEOUT = 5000;
const DEFAULT_SEND_PING_WAIT = 5000;

// 画面キャプチャの保存先
const DEFAULT_MEETIN_SCREEN_CAPTURE_PATH = "/screen_capture/screen_capture_"+ $("#connection_info_id").val() + "/";

const DEFAULT_AUTO_DETECT_BANDWIDTH = false;

////////////////////////////////////////////////////////////////
// ユーザー環境の既定値
////////////////////////////////////////////////////////////////

const USER_PARAM_BROWSER = getBrowserType();
const USER_PARAM_IS_MOBILE = isMobile(navigator.userAgent);
//var USER_SERECT_KEY = createRandomString(10);

////////////////////////////////////////////////////////////////
// メソッド
////////////////////////////////////////////////////////////////

// 3人目（2人目のゲスト）以降のFlash制限
// true = 3人目（2人目のゲスト）以降、WebRTCが使えるブラウザのみを入室を許可する
// false = 3人目（2人目のゲスト）以降でも、IEとSafariの入室を許可する
const NOT_ALLOW_FLASH_FOR_EQUAL_OR_MORE_THEN_3_PEOPLE = false;

var qvgaConstraints = {
  video: {width: {exact: 320}, height: {exact: 240}, frameRate: {max: 10}}
};

var vgaConstraints = {
  video: {width: {exact: 640}, height: {exact: 480}, frameRate: {max: 10}}
};

var svgaConstraints = {
  video: {width: {exact: 800}, height: {exact: 600}, frameRate: {max: 10}}
};

var hdConstraints = {
  video: {width: {exact: 1280}, height: {exact: 720}, frameRate: {max: 10}}
};

var fullHdConstraints = {
  video: {width: {exact: 1920}, height: {exact: 1080}, frameRate: {max: 10}}
};

var idealQvgaConstraints = {
  video: {width: {ideal: 320, max: 320}, height: {ideal: 240, max: 240}, frameRate: {ideal: 10, max: 10}}
};

var idealVgaConstraints = {
  video: {width: {ideal: 640, max: 640}, height: {ideal: 480, max: 480}, frameRate: {ideal: 10, max: 10}}
};

var idealSvgaConstraints = {
  video: {width: {ideal: 800, max: 800}, height: {ideal: 600, max: 600}, frameRate: {ideal: 10, max: 10}}
};

var idealHdConstraints = {
  video: {width: {ideal: 1280, max: 1280}, height: {ideal: 720, max: 720}, frameRate: {ideal: 10, max: 10}}
};

var idealFullHdConstraints = {
  video: {width: {ideal: 1920, max: 1920}, height: {ideal: 1080, max: 1080}, frameRate: {ideal: 10, max: 10}}
};

function getVideoConstraints(resolution) {
	var config = null;
	if ("qvga" === resolution) {
		config = qvgaConstraints;
	} else if ("vga" === resolution) {
		config = vgaConstraints;
	} else if ("svga" === resolution) {
		config = svgaConstraints;
	} else if ("hd" === resolution) {
		config = hdConstraints;
	} else if ("full-hd" === resolution) {
		config = fullHdConstraints;
	} else if ("idealQvga" === resolution) {
		config = idealQvgaConstraints;
	} else if ("idealVga" === resolution) {
		config = idealVgaConstraints;
	} else if ("idealSvga" === resolution) {
		config = idealSvgaConstraints;
	} else if ("idealHd" === resolution) {
		config = idealHdConstraints;
	} else if ("idealFull-hd" === resolution) {
		config = idealFullHdConstraints;
	} else {
		config = {video : true};
	}
	
	if ('Firefox' === USER_PARAM_BROWSER) {
		config.video.frameRate = config.video.frameRate.max;
	}
	
	return config;
}