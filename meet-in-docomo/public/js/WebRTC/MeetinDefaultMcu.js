////////////////////////////////////////////////////////////////
// Meetinのシステムの既定値
////////////////////////////////////////////////////////////////

// 最大人数
const MEETIN_MAIN_MAX_PEOPLE = 50;
// 送信帯域の既定値
const DEFAULT_SEND_BANDWIDTH_LEVEL = 0;
// 受信帯域の既定値
const DEFAULT_RECEIVE_BANDWIDTH_LEVEL = 0;
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

//const DEFAULT_PING_TIMEOUT = 5000;
//const DEFAULT_SEND_PING_WAIT = 5000;
const DEFAULT_PING_TIMEOUT = 30000;
const DEFAULT_SEND_PING_WAIT = 30000;

// 画面キャプチャの保存先
const DEFAULT_MEETIN_SCREEN_CAPTURE_PATH = "/screen_capture/screen_capture_"+ $("#connection_info_id").val() + "/";

const DEFAULT_AUTO_DETECT_BANDWIDTH = false;

////////////////////////////////////////////////////////////////
// ユーザー環境の既定値
////////////////////////////////////////////////////////////////

const USER_PARAM_BROWSER = getBrowserType();
const USER_PARAM_IS_MOBILE = isMobile(navigator.userAgent);
const USER_PARAM_IS_IPAD_PC = isIPad(navigator.userAgent);


////////////////////////////////////////////////////////////////
// メソッド
////////////////////////////////////////////////////////////////

// 3人目（2人目のゲスト）以降のFlash制限
// true = 3人目（2人目のゲスト）以降、WebRTCが使えるブラウザのみを入室を許可する
// false = 3人目（2人目のゲスト）以降でも、IEとSafariの入室を許可する
const NOT_ALLOW_FLASH_FOR_EQUAL_OR_MORE_THEN_3_PEOPLE = false;

// frameRate: {max: 10}
var qvgaConstraints = {
  video: {width: {min: 0, max: 320}, height: {min: 0, max: 240}, frameRate: { min: 10, max: 15 }, aspectRatio: {exact: 4/3}}
};
var vgaConstraints = {
  video: {width: {exact: 640}, height: {exact: 480}, frameRate: { min: 10, max: 15 }, aspectRatio: {exact: 4/3}}
};
var svgaConstraints = {
  video: {width: {exact: 800}, height: {exact: 600}, frameRate: { min: 10, max: 15 }, aspectRatio: {exact: 4/3}}
};
var hdConstraints = {
  video: {width: {exact: 1280}, height: {exact: 720}, frameRate: { min: 10, max: 15 }, aspectRatio: {exact: 4/3}}
};
var fullHdConstraints = {
  video: {width: {exact: 1920}, height: {exact: 1080}, frameRate: { min: 10, max: 15 }, aspectRatio: {exact: 4/3}}
};

// frameRate: {ideal: 10, max: 10}
var idealQvgaConstraints = {
video: {width: {ideal: 320, min: 0, max: 320}, height: {ideal: 240, min: 0, max: 240}, frameRate: {ideal: 10, max: 15}, aspectRatio: {exact: 4/3}}
//video: {width: {ideal: 288, max: 1280}, height: {ideal: 216, max: 720}, frameRate: {ideal:  9, max: 15}}
};
var idealVgaConstraints = {
video: {width: {ideal: 640, min: 0, max: 640}, height: {ideal: 480, min: 0, max: 480}, frameRate: {ideal: 10, max: 15}, aspectRatio: {exact: 4/3}}
//video: {width: {ideal: 576, max: 1280}, height: {ideal: 432, max: 720}, frameRate: {ideal:  9, max: 15}}
};
var idealSvgaConstraints = {
video: {width: {ideal: 800, min: 0, max: 800}, height: {ideal: 600, min: 0, max: 600}, frameRate: {ideal: 10, max: 15}, aspectRatio: {exact: 4/3}}
//video: {width: {ideal: 720, max: 1280}, height: {ideal: 540, max: 720}, frameRate: {ideal:  9, max: 15}}
};
var idealHdConstraints = {
video: {width: {ideal: 1280, min: 0, max: 1280}, height: {ideal: 720, min: 0, max: 720}, frameRate: {ideal: 10, max: 15}, aspectRatio: {exact: 4/3}}
//video: {width: {ideal: 1152, max: 1280}, height: {ideal: 648, max: 720}, frameRate: {ideal:  9, max: 15}}
};
var idealFullHdConstraints = {
video: {width: {ideal: 1920, min: 0, max: 1920}, height: {ideal: 1080, min: 0, max: 1080}, frameRate: {ideal: 10, max: 15}, aspectRatio: {exact: 4/3}}
//video: {width: {ideal: 1728, max: 1920}, height: {ideal:  972, max: 1080}, frameRate: {ideal:  9, max: 15}}
};

/***
 * FF
 * 2018/11/20現在、frameRate指定はできるが指定された値にはならない！！
 */
var idealQvgaConstraintsFF = {
video: {width: {min: 640}, height: {min: 480}, advanced:[{ width: {min: 320}, height: {min: 240} }], frameRate: 10}
//video: {width: {min: 640}, height: {min: 480}, advanced:[{ width: {min: 288}, height: {min: 216} }], frameRate:  9}
};
var idealVgaConstraintsFF = {
video: {width: {min: 640}, height: {min: 480}, frameRate: 10}
//video: {width: {min: 576}, height: {min: 432}, frameRate:  9}
};
var idealSvgaConstraintsFF = {
video: {width: {min: 640}, height: {min: 480}, advanced:[{ width: {min: 800}, height: {min: 600} }], frameRate: 10}
//video: {width: {min: 640}, height: {min: 480}, advanced:[{ width: {min: 720}, height: {min: 540} }], frameRate:  9}
};
var idealHdConstraintsFF = {
video: {width: {min: 640}, height: {min: 480}, advanced:[{ width: {min: 1280}, height: {min: 720} }], frameRate: 10}
//video: {width: {min: 640}, height: {min: 480}, advanced:[{ width: {min: 1152}, height: {min: 648} }], frameRate:  9}
};
var idealFullHdConstraintsFF = {
video: {width: {min: 640}, height: {min: 480}, advanced:[{ width: {min: 1920}, height: {min: 1080} }], frameRate: 10}
//video: {width: {min: 640}, height: {min: 480}, advanced:[{ width: {min: 1728}, height: {min:  972} }], frameRate:  9}
};

/***
 * Edge
 * 2018/11/20現在、EdgeはVideoパラメータの指定はできない！！
 */
var idealVgaConstraintsEdge = {
  video: {width: {min: 640}, height: {min: 480}}
};

 var idealNone = {video: true};

function getVideoConstraints(resolution) {
	var config = null;

	if ('Firefox' === USER_PARAM_BROWSER) {
		if ("idealQvga" === resolution) {						// QVGA(320×240)：低
			config = idealQvgaConstraintsFF;
		} else if ("idealVga" === resolution) {			// SVGA(640×480)：中低：初期
			config = idealVgaConstraintsFF;
		} else if ("idealSvga" === resolution) {		// SVGA(800×600)：中
			config = idealSvgaConstraintsFF;
		} else if ("idealHd" === resolution) {			// HD(1280×720)：中高
			config = idealHdConstraintsFF;
		} else if ("idealFull-hd" === resolution) {	// FULL-HD(1280×720)：高
			config = idealFullHdConstraintsFF;
		} else {
			config = idealNone;
		}
	}
	else if ('Edge' === USER_PARAM_BROWSER) {
			config = idealVgaConstraintsEdge;
	}
	else {
		if ("qvga" === resolution) {				// 未使用
			config = qvgaConstraints;
		} else if ("vga" === resolution) {	// 未使用
			config = vgaConstraints;
		} else if ("svga" === resolution) {	// 未使用
			config = svgaConstraints;
		} else if ("hd" === resolution) {		// 未使用
			config = hdConstraints;
		} else if ("full-hd" === resolution) {	// 未使用
			config = fullHdConstraints;
		} else if ("idealQvga" === resolution) {		// QVGA(320×240)：低
			config = idealQvgaConstraints;
		} else if ("idealVga" === resolution) {			// SVGA(640×480)：中低：初期
			config = idealVgaConstraints;
		} else if ("idealSvga" === resolution) {		// SVGA(800×600)：中
			config = idealSvgaConstraints;
		} else if ("idealHd" === resolution) {			// HD(1280×720)：中高
			config = idealHdConstraints;
		} else if ("idealFull-hd" === resolution) {	// FULL-HD(1280×720)：高
			config = idealFullHdConstraints;
		} else {
			config = idealNone;
		}
	}

	// レート修正
	// Firefox と Safari はレート(frameRate)指定が効かないので削除する。
	if ('Firefox' === USER_PARAM_BROWSER || 'Safari' === USER_PARAM_BROWSER) {
		delete config.video["frameRate"]
	}
	return config;
}

function getVideoConstraintsSP(resolution) {
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

var qvgaConstraintsFlash = {
  video: {width: {exact: 320}, height: {exact: 240}, frameRate: {max: 10}}
};
var vgaConstraintsFlash = {
  video: {width: {exact: 640}, height: {exact: 480}, frameRate: {max: 10}}
};
var svgaConstraintsFlash = {
  video: {width: {exact: 800}, height: {exact: 600}, frameRate: {max: 10}}
};
var hdConstraintsFlash = {
  video: {width: {exact: 1280}, height: {exact: 720}, frameRate: {max: 10}}
};
var fullHdConstraintsFlash = {
  video: {width: {exact: 1920}, height: {exact: 1080}, frameRate: {max: 10}}
};
var idealQvgaConstraintsFlash = {
  video: {width: {ideal: 320, max: 320}, height: {ideal: 240, max: 240}, frameRate: {ideal: 10, max: 10}}
};
var idealVgaConstraintsFlash = {
  video: {width: {ideal: 640, max: 640}, height: {ideal: 480, max: 480}, frameRate: {ideal: 10, max: 10}}
};
var idealSvgaConstraintsFlash = {
  video: {width: {ideal: 800, max: 800}, height: {ideal: 600, max: 600}, frameRate: {ideal: 10, max: 10}}
};
var idealHdConstraintsFlash = {
  video: {width: {ideal: 1280, max: 1280}, height: {ideal: 720, max: 720}, frameRate: {ideal: 10, max: 10}}
};
var idealFullHdConstraintsFlash = {
  video: {width: {ideal: 1920, max: 1920}, height: {ideal: 1080, max: 1080}, frameRate: {ideal: 10, max: 10}}
};

function getVideoConstraintsFlash(resolution) {
	var config = null;
	if ("qvga" === resolution) {
		config = qvgaConstraintsFlash;
	} else if ("vga" === resolution) {
		config = vgaConstraintsFlash;
	} else if ("svga" === resolution) {
		config = svgaConstraintsFlash;
	} else if ("hd" === resolution) {
		config = hdConstraintsFlash;
	} else if ("full-hd" === resolution) {
		config = fullHdConstraintsFlash;
	} else if ("idealQvga" === resolution) {
		config = idealQvgaConstraintsFlash;
	} else if ("idealVga" === resolution) {
		config = idealVgaConstraintsFlash;
	} else if ("idealSvga" === resolution) {
		config = idealSvgaConstraintsFlash;
	} else if ("idealHd" === resolution) {
		config = idealHdConstraintsFlash;
	} else if ("idealFull-hd" === resolution) {
		config = idealFullHdConstraintsFlash;
	} else {
		config = idealNone;
	}

	if ('Firefox' === USER_PARAM_BROWSER) {
		config.video.frameRate = config.video.frameRate.max;
	}

	return config;
}
