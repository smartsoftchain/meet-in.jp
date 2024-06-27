//////////////////////////////////////////////////////////
// MonaServerのインストール手順
//
// 1. Install the devo repo:
// # wget http://people.centos.org/tru/devtools-2/devtools-2.repo -O /etc/yum.repos.d/devtools-2.repo
//
// 2. upgrade on yum
// # yum upgrade
//
// 3. install C++11
// # yum install devtoolset-2-gcc devtoolset-2-binutils devtoolset-2-gcc-c++
// 
// 4. use the software collections to enable it in the current shell
// # scl enable devtoolset-2 bash
// 
// 5. install OpenSSL. The package is usually named libssl-dev (or openssl-devel).
// # yum install openssl-devel
//
// 6. luaJITをダウンロード
// # cd /var/www/html/
// # mkdir MonaServer
// # cd /var/www/html/MonaServer/
// # git clone http://luajit.org/git/luajit-2.0.git
//
// 7. luaJITのMakefileを修正
// search DLUAJIT_ENABLE_LUA52COMPAT in src/Makefile and uncomment the line
//
// 8. luaJITをビルドし、インストール
// # cd /var/www/html/MonaServer/luajit-2.0/
// # make install
//
// 9. MonaServerをダウンロード
// # cd /var/www/html/MonaServer/
// # git clone https://github.com/MonaSolutions/MonaServer.git
//
// 10. MonaServerをビルド
// # cd /var/www/html/MonaServer/MonaServer/
// # scl enable devtoolset-2 bash
// # make
//
// 11. main.luaを作成
// ディレクトリ：/var/www/html/MonaServer/MonaServer/MonaServer/www/test/Meeting
// ファイル名：main.lua
// 中身：
/*

meeters = {}

function onConnection(client, userName, meeting)
	
	if client.protocol == "RTMFP" or client.protocol == "RTMP" then
		meeter = {}
		meeter.userName = userName
		meeter.meeting = meeting
		
		if client.protocol == "RTMFP" then
			INFO("[RTMFP]User connected: ", meeter.userName , " meeting: ", meeter.meeting)
		end
		if client.protocol == "RTMP" then
			INFO("[RTMP]User connected: ", meeter.userName , " meeting: ", meeter.meeting)
		end
		
		sendParticipantUpdate(meeter.meeting)
		meeters[client] = meeter -- Add participant to the list
	end
	
	function client:getParticipants(meeting)
		result = {}
		i = 0;
		for cur_client, cur_meeter in pairs(meeters) do
			if (cur_meeter.meeting == meeting) then
				i = i+1;
				if cur_client.id then
					cur_meeter.protocol = 'rtmp'
				end
				cur_meeter.farID = cur_client.id;		
				result[i] = cur_meeter
			end
		end	
		return result
	end
		
	function client:sendMessage(meeting, from, message)
  
		for cur_client, cur_meeter in pairs(meeters) do
			if (cur_meeter.meeting == meeting) then
				cur_client.writer:writeInvocation("onMessage", from, message)
			end
		end
	end
	
	return {index="VideoMeeting.html"}
end

function onDisconnection(client)
  meeter = meeters[client]

  if meeter then
    INFO("User disconnecting: "..meeter.userName)
    meeters[client] = nil
    sendParticipantUpdate(meeter.meeting)
  end
end

function sendParticipantUpdate(meeting)
	for cur_client, cur_meeter in pairs(meeters) do
		if (cur_meeter.meeting == meeting) then
			cur_client.writer:writeInvocation("participantChanged")
		end
	end
end
*/
//
// 12. MonaServer.iniを作成
// ディレクトリ：/var/www/html/MonaServer/MonaServer/MonaServer
// ファイル名：MonaServer.ini
// 中身：
/*
MonaServer.ini
;socketBufferSize = 114688
[RTMFP]
port = 1935
keepAliveServer = 15
keepAlivePeer = 10
[RTMP]
port = 1935
[HTTP]
port = 2000
timeout = 7
[RTSP]
port = 554
[WebSocket]
timeout = 120
[logs]
;name=log
;directory=C:/MonaServer/logs
*/
//
// 13. iptablesを変更
// # vi /etc/sysconfig/iptables
// 追加内容：
/*
-A RH-Firewall-1-INPUT -m state --state NEW -m tcp -p tcp --dport 2000 -j ACCEPT
-A RH-Firewall-1-INPUT -m state --state NEW -m tcp -p tcp --dport 1935 -j ACCEPT
-A RH-Firewall-1-INPUT -m state --state NEW -m udp -p udp --dport 1935 -j ACCEPT
-A RH-Firewall-1-INPUT -m state --state NEW -m tcp -p tcp --dport 554 -j ACCEPT
*/
// # /etc/init.d/iptables restart
//
// 14. MonaServerを起動
// cd /var/www/html/MonaServer/MonaServer/MonaServer/
// ./MonaServer --daemon
//
//////////////////////////////////////////////////////////

const SHOW_MEETIN_FLASH_UTILITY_LOG = false;

const DEFAULT_FLASH_CAMERA_WIDTH = 800;
const DEFAULT_FLASH_CAMERA_HEIGHT = 600;
const DEFAULT_FLASH_CAMERA_FRAMERATE = 10;
const DEFAULT_FLASH_CAMERA_BANDWIDTH = 0;
const DEFAULT_FLASH_CAMERA_QUALITY = 80;
const DEFAULT_FLASH_SPEEX_QUALITY = 10;
const DEFAULT_FLASH_NELLYMOSER_RATE = 22;
const DEFAULT_FLASH_MIC_GAIN = 60;

const DEFAULT_FLASH_MIN_WIDTH = 215;
const DEFAULT_FLASH_MIN_HEIGHT = 138;

// const DEFAULT_FLASH_CAMERA_BANDWIDTH_BYTE_ARRAY = {15360, 32000, 80896, 160640, 321280};


/*
const FLASH_WEB_SERVICE_URL = 'https://' + location.host + '/flash-api/flash-web-service';

var mMeetinFlashTargetVideoReady_0 = false;
var mMeetinFlashTargetVideoReady_1 = false;
var mMeetinFlashTargetVideoReady_2 = false;
var mMeetinFlashTargetVideoReady_3 = false;
var mMeetinFlashTargetVideoReady_4 = false;
var mMeetinFlashTargetVideoReady_5 = false;

var mMeetinFlashTargetVideoState_0 = "";
var mMeetinFlashTargetVideoState_1 = "";
var mMeetinFlashTargetVideoState_2 = "";
var mMeetinFlashTargetVideoState_3 = "";
var mMeetinFlashTargetVideoState_4 = "";
var mMeetinFlashTargetVideoState_5 = "";

*/
var mMeetinFlashCameraNameArray = new Array();
var mMeetinFlashSecurityPanelUserIdTable = {};

// var mUserIdAndSecretKey = {};

// SWFを動的に追加するメソッド
function showSWF(urlString, elementID, id, flashvarsObj){
	var result = 0;
	
	var displayContainer = document.getElementById(elementID);
	if (displayContainer) {
		var area = document.createElement("div");
		if (area) {
			area.setAttribute('id', id);
			area.setAttribute('style', 'height:100%');
			if (USER_PARAM_IS_MOBILE) {
//				area.innerHTML = '<a href="https://helpx.adobe.com/jp/flash-player/kb/installing-flash-player-android-devices.html" target="_blank"><div style="width: 100%; height: 100%; display: table;"><div style="height: 100%; text-align: center; vertical-align: middle; display: table-cell;"><p><img src="/img/GetAdobeFlashPlayer_icon.png" alt="Get Adobe Flash player" href="https://helpx.adobe.com/jp/flash-player/kb/installing-flash-player-android-devices.html" target="_blank"/></p></div></div></a>';
				area.innerHTML = '<div style="width: 100%; height: 100%; display: table;"><div style="height: 100%; text-align: center; vertical-align: middle; display: table-cell;"><p>この端末は対応しておりません</p></div></div>';
			} else {
				area.innerHTML = '<a href="https://www.adobe.com/go/getflashplayer" target="_blank"><div style="width: 100%; height: 100%; display: table;"><div style="height: 100%; text-align: center; vertical-align: middle; display: table-cell;"><p><img src="/img/GetAdobeFlashPlayer_icon.png" alt="Get Adobe Flash player" href="https://www.adobe.com/go/getflashplayer" target="_blank"/></p></div></div></a>';
			}
			displayContainer.appendChild(area);
		}
	}
	swfobject.embedSWF(urlString, id, "100%", "100%", "25.0.0", "/swf/expressInstall.swf", flashvarsObj, {'wmode': 'transparent'});

	if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
		console.log("[showSWF]:urlString = " + urlString + ", elementID = " + elementID + ", id = " + id + ", flashvarsObj = " + JSON.stringify(flashvarsObj));
	}
	
	return result;
}
/*
function createSWFObject(urlString, wmodeString, id){ 
	var SWFObject = document.createElement("object");
	SWFObject.setAttribute('data', urlString);
	SWFObject.setAttribute('id', id);
	SWFObject.setAttribute("type","application/x-shockwave-flash"); 
	SWFObject.setAttribute("width", "100%"); 
	SWFObject.setAttribute("height", "100%"); 
	var movieParam = document.createElement("param"); 
	movieParam.setAttribute("name","movie"); 
	movieParam.setAttribute("value",urlString); 
	SWFObject.appendChild(movieParam); 

//	var wmodeParam = document.createElement("param"); 
//	wmodeParam.setAttribute("name","wmode"); 
//	wmodeParam.setAttribute("value",wmodeString); 
//	SWFObject.appendChild(wmodeParam);

	return SWFObject; 
}
*/

//////////////////////////////////////////////////////////
// MeetinFlashMyVideoのメソッド
//////////////////////////////////////////////////////////

// 自分のカメラをON
function meetinFlashMyVideo_startCamera() {
	var user_id = $('#user_id').val();
	var flash = null;
	if (navigator.appName.indexOf("Microsoft") != -1) {
		flash = window['negotiation_target_flash_' + user_id];
	} else {
		flash = document['negotiation_target_flash_' + user_id];
	}
	
	if (flash) {
		try {
			flash.startCamera();
			if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
				console.log("[meetinFlashMyVideo_startCamera]");
			}

			NEGOTIATION.isMyCameraOn = true;
			NEGOTIATION.updateStatusVideoAudio();
		} catch (exception) {
			if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
				console.log("[meetinFlashMyVideo_startCamera][error]:exception = " + exception);
			}
		}
	}
}

// 自分のカメラをOFF
function meetinFlashMyVideo_stopCamera() {
	var user_id = $('#user_id').val();
	var flash = null;
	if (navigator.appName.indexOf("Microsoft") != -1) {
		flash = window['negotiation_target_flash_' + user_id];
	} else {
		flash = document['negotiation_target_flash_' + user_id];
	}
	
	if (flash) {
		try {
			flash.stopCamera();
			if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
				console.log("[meetinFlashMyVideo_stopCamera]");
			}

			NEGOTIATION.isMyCameraOn = false;
			NEGOTIATION.updateStatusVideoAudio();
		} catch (exception) {
			if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
				console.log("[meetinFlashMyVideo_stopCamera][error]:exception = " + exception);
			}
		}
	}
}

// 自分のカメラの描画領域を変更
function meetinFlashMyVideo_changeSize(width, height) {
	var user_id = $('#user_id').val();
	var flash = null;
	if (navigator.appName.indexOf("Microsoft") != -1) {
		flash = window['negotiation_target_flash_' + user_id];
	} else {
		flash = document['negotiation_target_flash_' + user_id];
	}
	
	if (flash) {
		try {
			// フルスクリーンの場合
			var full = getFSelment();
			if( full != null ) {
				width = full.clientWidth
				height = full.clientHeight
console.log('Fullscreen2');
console.log('width=('+ width +')');
console.log('height=('+ height +')');
			}

			flash.changeSize(width, height);
			if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
				console.log("[meetinFlashMyVideo_changeSize]:width = " + width + ", height = " + height);
			}
		} catch (exception) {
			if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
				console.log("[meetinFlashMyVideo_changeSize][error]:width = " + width + ", height = " + height + ", exception = " + exception);
			}
		}
	}
}

function meetinFlashMyVideo_getCameraNames() {
	var user_id = $('#user_id').val();
	var flash = null;
	if (navigator.appName.indexOf("Microsoft") != -1) {
		flash = window['negotiation_target_flash_' + user_id];
	} else {
		flash = document['negotiation_target_flash_' + user_id];
	}
	
	if (flash) {
		try {
			flash.getCameraNames();
			if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
				console.log("[meetinFlashMyVideo_getCameraNames]");
			}
		} catch (exception) {
			if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
				console.log("[meetinFlashMyVideo_getCameraNames][error]:exception = " + exception);
			}
		}
	}
}

function meetinFlashMyVideo_changeCamera(newCameraIndex, cameraWidth, cameraHeight, cameraFramerate, cameraBandwidth, cameraQuality) {
	var user_id = $('#user_id').val();
	var flash = null;
	if (navigator.appName.indexOf("Microsoft") != -1) {
		flash = window['negotiation_target_flash_' + user_id];
	} else {
		flash = document['negotiation_target_flash_' + user_id];
	}
	
	if (flash) {
		try {
			flash.changeCamera(newCameraIndex, cameraWidth, cameraHeight, cameraFramerate, cameraBandwidth, cameraQuality);
			if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
				console.log("[meetinFlashMyVideo_changeCamera]:newCameraIndex = " + newCameraIndex + ", cameraWidth = " + cameraWidth + ", cameraHeight = " + cameraHeight + ", cameraFramerate = " + cameraFramerate + ", cameraBandwidth = " + cameraBandwidth + ", cameraQuality = " + cameraQuality);
			}
		} catch (exception) {
			if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
				console.log("[meetinFlashMyVideo_changeCamera][error]:newCameraIndex = " + newCameraIndex + ", cameraWidth = " + cameraWidth + ", cameraHeight = " + cameraHeight + ", cameraFramerate = " + cameraFramerate + ", cameraBandwidth = " + cameraBandwidth + ", cameraQuality = " + cameraQuality + ", exception = " + exception);
			}
		}
	}
}

//////////////////////////////////////////////////////////
// MeetinFlashMyVideoのコールバック
//////////////////////////////////////////////////////////

// 自分カメラの初期化が完了したときに呼ばれるコールバック
function meetinFlashMyVideo_initSub_finish(cameraIsOn, micIsOn, cameraNames, cameraMuted, micMuted, cameraIsCanUse, micIsCanUse) {
	NEGOTIATION.isMyCameraOn = cameraIsOn;
	NEGOTIATION.isMyMicOn = micIsOn;
	NEGOTIATION.isMyCameraCanUse = cameraIsCanUse;
	NEGOTIATION.isMyMicCanUse  = micIsCanUse;
	mMeetinFlashCameraNameArray = cameraNames;
	NEGOTIATION.updateStatusVideoAudio();
	sendSystemInfoDetail(null);

	var staff_type = $.cookie()["staff_type"];
	var staff_id = $.cookie()["staff_id"];
	var client_id = $.cookie()["client_id"];
	var user_id = $('#user_id').val();
	
	if(staff_type != null && staff_id != 0 && client_id != 0) {
		$('#staff_type').val(staff_type);
		$('#staff_id').val(staff_id);
		$('#client_id').val(client_id);
		sendLogin();
		// 情報更新
		mNegotiationMain.setUserInfo($('#my_user_info').val());
		sendSystemInfoDetail(null);
		// ユーザー一覧の自分の名前更新
		var video_list = $('#video_list_' + user_id);
		video_list.find('.user_name').text($('#my_user_info').val());
	}

	// カメラが使えないならば、ビデオフレームをアイコンに切り替える
	if (!cameraIsCanUse) {
		cameraOff();
	}else{
	
		var user_id = $('#user_id').val();
		if (cameraMuted || micMuted) {
			$('#negotiation_target_video_' + user_id).draggable( "disable" );
			$('#video_target_icon_area_' + user_id).hide();
			$('#negotiation_target_video_relative_no_video_area_' + user_id).hide();
			
			$('#negotiation_target_video_' + user_id).addClass('video_wrap_flash_panel');
			if ($('#negotiation_target_video_' + user_id).width() < 240) {
				$('#negotiation_target_video_' + user_id).width(240);
			}
			if ($('#negotiation_target_video_' + user_id).height() < 180) {
				$('#negotiation_target_video_' + user_id).height(180);
			}
			
			mMeetinFlashSecurityPanelUserIdTable[user_id] = true;
			for (var key in mMeetinFlashSecurityPanelUserIdTable) {
				$('#negotiation_target_video_' + key).find('.video_big_icon').trigger("click");
				break;
			}
		} else if (!cameraMuted && !micMuted) {
			$('#negotiation_target_video_' + user_id).draggable( "enable" );
			$('#video_target_icon_area_' + user_id).show();
		}
	}
	
	// Flashロード後に表示領域を変更
	var run = function() {
		var user_id = $('#user_id').val();
		meetinFlashMyVideo_changeSize($("#negotiation_target_video_" + user_id).width(), $("#negotiation_target_video_" + user_id).height());
	};
	setTimeout(run, 100);
	
	if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
		console.log("[meetinFlashMyVideo_initSub_finish]:cameraIsOn = " + cameraIsOn + ", micIsOn = " + micIsOn + ", cameraNames = " + cameraNames.source.toString() + ", cameraMuted = " + cameraMuted + ", micMuted = " + micMuted);
	}
}

function meetinFlashMyVideo_cameraChanged_finish(cameraIsOn) {
	NEGOTIATION.isMyCameraOn = cameraIsOn;
	NEGOTIATION.updateStatusVideoAudio();
	sendSystemInfoDetail(null);
	
	if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
		console.log("[meetinFlashMyVideo_cameraChanged_finish]:cameraIsOn = " + cameraIsOn);
	}
}

function meetinFlashMyVideo_changeCamera_finish(cameraIsOn) {
	NEGOTIATION.isMyCameraOn = cameraIsOn;
	NEGOTIATION.updateStatusVideoAudio();
	sendSystemInfoDetail(null);
	
	if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
		console.log("[meetinFlashMyVideo_changeCamera_finish]:cameraIsOn = " + cameraIsOn);
	}
}

function meetinFlashMyVideo_getCameraNames(cameraNameArray) {
	if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
		console.log("[meetinFlashMyVideo_getCameraNames]:cameraNameArray = " + cameraNameArray.toString());
	}
}

// 自分のカメラの許可・拒否のコールバック
function meetinFlashMyVideo_cameraStatusHandler(value) {
	if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
		console.log("[meetinFlashMyVideo_cameraStatusHandler]:value = " + value);
	}
	
	// 許可
	if ("Camera.Unmuted" === value) {
		var user_id = $('#user_id').val();
		$('#negotiation_target_video_' + user_id).draggable( "enable" );
		$('#video_target_icon_area_' + user_id).show();
		$('#negotiation_target_video_relative_no_video_area_' + user_id).show();
		
		$('#negotiation_target_video_' + user_id).removeClass('video_wrap_flash_panel');
		
//		console.log("[meetinFlashMyVideo_cameraStatusHandler]:value = " + value);

		delete mMeetinFlashSecurityPanelUserIdTable[user_id];
		for (var key in mMeetinFlashSecurityPanelUserIdTable) {
			$('#negotiation_target_video_' + key).find('.video_big_icon').trigger("click");
			break;
		}
	}
	// 拒否
	else if ("Camera.Muted" === value) {

		var user_id = $('#user_id').val();
		$('#negotiation_target_video_' + user_id).draggable( "enable" );
		$('#video_target_icon_area_' + user_id).show();
		$('#negotiation_target_video_relative_no_video_area_' + user_id).show();
		
		$('#negotiation_target_video_' + user_id).removeClass('video_wrap_flash_panel');
//		console.log("[meetinFlashMyVideo_cameraStatusHandler]:value = " + value);

		// カメラ使用不可
		NEGOTIATION.isMyCameraCanUse = false;
		NEGOTIATION.updateStatusVideoAudio();

		// 自分画面をプロフィールアイコンに変更
		cameraOff();
	
		delete mMeetinFlashSecurityPanelUserIdTable[user_id];
		for (var key in mMeetinFlashSecurityPanelUserIdTable) {
			$('#negotiation_target_video_' + key).find('.video_big_icon').trigger("click");
			break;
		}
	}
}

//////////////////////////////////////////////////////////
// MeetinFlashTargetVideoのメソッド
//////////////////////////////////////////////////////////

function meetinFlashTargetVideo_startCamera(userId) {
	var flash = null;
	if (navigator.appName.indexOf("Microsoft") != -1) {
		flash = window['negotiation_target_flash_' + userId];
	} else {
		flash = document['negotiation_target_flash_' + userId];
	}
	
	if (flash) {
		try {
			flash.startCamera();
			if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
				console.log("[meetinFlashTargetVideo_startCamera]:userId = " + userId);
			}
		} catch (exception) {
			if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
				console.log("[meetinFlashTargetVideo_startCamera][error]:userId = " + userId + ", exception = " + exception);
			}
		}
	}
}

function meetinFlashTargetVideo_stopCamera(userId) {
	var flash = null;
	if (navigator.appName.indexOf("Microsoft") != -1) {
		flash = window['negotiation_target_flash_' + userId];
	} else {
		flash = document['negotiation_target_flash_' + userId];
	}
	
	if (flash) {
		try {
			flash.stopCamera();
			if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
				console.log("[meetinFlashTargetVideo_stopCamera]:userId = " + userId);
			}
		} catch (exception) {
			if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
				console.log("[meetinFlashTargetVideo_stopCamera][error]:userId = " + userId + ", exception = " + exception);
			}
		}
	}
}

function meetinFlashTargetVideo_startMic(userId) {
	var flash = null;
	if (navigator.appName.indexOf("Microsoft") != -1) {
		flash = window['negotiation_target_flash_' + userId];
	} else {
		flash = document['negotiation_target_flash_' + userId];
	}
	
	if (flash) {
		try {
			flash.startMic();
			if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
				console.log("[meetinFlashTargetVideo_startMic]:userId = " + userId);
			}
		} catch (exception) {
			if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
				console.log("[meetinFlashTargetVideo_startMic][error]:userId = " + userId + ", exception = " + exception);
			}
		}
	}
	
	NEGOTIATION.isMyMicOn = true;
}

function meetinFlashTargetVideo_stopMic(userId) {
	var flash = null;
	if (navigator.appName.indexOf("Microsoft") != -1) {
		flash = window['negotiation_target_flash_' + userId];
	} else {
		flash = document['negotiation_target_flash_' + userId];
	}
	
	if (flash) {
		try {
			flash.stopMic();
			if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
				console.log("[meetinFlashTargetVideo_stopMic]:userId = " + userId);
			}
		} catch (exception) {
			if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
				console.log("[meetinFlashTargetVideo_stopMic][error]:userId = " + userId + ", exception = " + exception);
			}
		}
	}
	
	NEGOTIATION.isMyMicOn = false;
}

// 自分のカメラの描画領域を変更
function meetinFlashTargetVideo_changeSize(targetUserId, width, height) {
	var flash = null;
	if (navigator.appName.indexOf("Microsoft") != -1) {
		flash = window['negotiation_target_flash_' + targetUserId];
	} else {
		flash = document['negotiation_target_flash_' + targetUserId];
	}
	
	if (flash) {
		try {
			// フルスクリーンの場合
			var full = getFSelment();
			if( full != null ) {
				width = full.clientWidth
				height = full.clientHeight
console.log('Fullscreen1');
console.log('width=('+ width +')');
console.log('height=('+ height +')');
			}

			flash.changeSize(width, height);
			if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
				console.log("[meetinFlashTargetVideo_changeSize]:width = " + width + ", height = " + height + ", userId = " + targetUserId);
			}
		} catch (exception) {
			if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
				console.log("[meetinFlashTargetVideo_changeSize][error]:width = " + width + ", height = " + height + ", userId = " + targetUserId + ", exception = " + exception);
			}
		}
	}
}
function getFSelment() {
	if (document.webkitFullscreenElement) {
		return document.webkitFullscreenElement;
	} else if (document.mozFullScreenElement) {
		return document.mozFullScreenElement;
	} else if (document.msFullscreenElement) {
		return document.msFullscreenElement;
	} else if (document.fullscreenElement) {
		return document.fullscreenElement;
	}
}

function meetinFlashTargetVideo_changeCamera(targetUserId, newCameraIndex, cameraWidth, cameraHeight, cameraFramerate, cameraBandwidth, cameraQuality) {
	var flash = null;
	if (navigator.appName.indexOf("Microsoft") != -1) {
		flash = window['negotiation_target_flash_' + targetUserId];
	} else {
		flash = document['negotiation_target_flash_' + targetUserId];
	}
	
	if (flash) {
		try {
			flash.changeCamera(newCameraIndex, cameraWidth, cameraHeight, cameraFramerate, cameraBandwidth, cameraQuality);
			if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
				console.log("[meetinFlashTargetVideo_changeCamera]:newCameraIndex = " + newCameraIndex + ", cameraWidth = " + cameraWidth + ", cameraHeight = " + cameraHeight + ", cameraFramerate = " + cameraFramerate + ", cameraBandwidth = " + cameraBandwidth + ", cameraQuality = " + cameraQuality + ", userId = " + targetUserId);
			}
		} catch (exception) {
			if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
				console.log("[meetinFlashTargetVideo_changeCamera][error]:newCameraIndex = " + newCameraIndex + ", cameraWidth = " + cameraWidth + ", cameraHeight = " + cameraHeight + ", cameraFramerate = " + cameraFramerate + ", cameraBandwidth = " + cameraBandwidth + ", cameraQuality = " + cameraQuality + ", userId = " + targetUserId + ", exception = " + exception);
			}
		}
	}
}

function meetinFlashTargetVideo_endSession(targetUserId) {
	var flash = null;
	if (navigator.appName.indexOf("Microsoft") != -1) {
		flash = window['negotiation_target_flash_' + targetUserId];
	} else {
		flash = document['negotiation_target_flash_' + targetUserId];
	}
	
	if (flash) {
		try {
			flash.endSession();
			if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
				console.log("[meetinFlashTargetVideo_endSession]:userId = " + targetUserId);
			}
		} catch (exception) {
			if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
				console.log("[meetinFlashTargetVideo_endSession][error]:userId = " + targetUserId + ", exception = " + exception);
			}
		}
	}
}

function meetinFlashTargetVideo_reRegister(targetUserId) {
	var flash = null;
	if (navigator.appName.indexOf("Microsoft") != -1) {
		flash = window['negotiation_target_flash_' + targetUserId];
	} else {
		flash = document['negotiation_target_flash_' + targetUserId];
	}
	
	if (flash) {
		try {
			var user_id = $('#user_id').val();
			var room = $('#connection_info_id').val();
//			if (user_id < targetUserId) {
//				room = $('#connection_info_id').val() + "_" + mUserIdAndSecretKey[user_id] + "_" + mUserIdAndSecretKey[targetUserId];
//			} else {
//				room = $('#connection_info_id').val() + "_" + mUserIdAndSecretKey[targetUserId] + "_" + mUserIdAndSecretKey[user_id];
//			}
			// IE2台以上でカメラが混信してしまう対応
			if (user_id < targetUserId) {
				room = $('#connection_info_id').val() + "_" + user_id + "_" + targetUserId;
			} else {
				room = $('#connection_info_id').val() + "_" + targetUserId + "_" + user_id;
			}
			
			flash.reRegister(room);
			if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
				console.log("[meetinFlashTargetVideo_reRegister]:userId = " + targetUserId);
			}
		} catch (exception) {
			if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
				console.log("[meetinFlashTargetVideo_reRegister][error]:userId = " + targetUserId + ", exception = " + exception);
			}
		}
	}
}

function meetinFlashTargetVideo_showNewestVideo(targetUserId) {
	var flash = null;
	if (navigator.appName.indexOf("Microsoft") != -1) {
		flash = window['negotiation_target_flash_' + targetUserId];
	} else {
		flash = document['negotiation_target_flash_' + targetUserId];
	}
	
	if (flash) {
		try {
			flash.showNewestVideo();
			if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
				console.log("[meetinFlashTargetVideo_showNewestVideo]:userId = " + targetUserId);
			}
		} catch (exception) {
			if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
				console.log("[meetinFlashTargetVideo_showNewestVideo][error]:userId = " + targetUserId + ", exception = " + exception);
			}
		}
	}
}

function meetinFlashTargetVideo_init_finish(room, username, userId, targetUserId, cameraNames, cameraMuted, micMuted) {
	if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
		console.log("[meetinFlashTargetVideo_init_finish]:room = " + room + ", username = " + username + ", userId = " + userId + ", targetUserId = " + targetUserId + ", cameraNames = " + cameraNames.source.toString() + ", cameraMuted = " + cameraMuted + ", micMuted = " + micMuted);
	}
	
	mMeetinFlashCameraNameArray = cameraNames;

	if (cameraMuted || micMuted) {
		$('#negotiation_target_video_' + targetUserId).draggable( "disable" );
		$('#video_target_icon_area_' + targetUserId).hide();
		$('#negotiation_target_video_relative_no_video_area_' + targetUserId).hide();

		$('#negotiation_target_video_' + targetUserId).addClass('video_wrap_flash_panel');
		if ($('#negotiation_target_video_' + targetUserId).width() < 240) {
			$('#negotiation_target_video_' + targetUserId).width(240);
		}
		if ($('#negotiation_target_video_' + targetUserId).height() < 180) {
			$('#negotiation_target_video_' + targetUserId).height(180);
		}
		
		mMeetinFlashSecurityPanelUserIdTable[targetUserId] = true;
		for (var key in mMeetinFlashSecurityPanelUserIdTable) {
			$('#negotiation_target_video_' + key).find('.video_big_icon').trigger("click");
			break;
		}
	} else if (!cameraMuted && !micMuted) {
		$('#negotiation_target_video_' + targetUserId).draggable( "enable" );
		$('#video_target_icon_area_' + targetUserId).show();
	}

	if (NEGOTIATION.isMyCameraOn) {
		meetinFlashTargetVideo_startCamera(targetUserId);
	}
	
	if (NEGOTIATION.isMyMicOn) {
		meetinFlashTargetVideo_startMic(targetUserId);
	}

	if (0 == targetUserId) {
		var run = function() {
			meetinFlashTargetVideo_changeSize(0, $("#negotiation_target_video_0").width(), $("#negotiation_target_video_0").height());
		};
		setTimeout(run, 100);
	} else if (1 == targetUserId) {
		var run = function() {
			meetinFlashTargetVideo_changeSize(1, $("#negotiation_target_video_1").width(), $("#negotiation_target_video_1").height());
		};
		setTimeout(run, 100);
	} else if (2 == targetUserId) {
		var run = function() {
			meetinFlashTargetVideo_changeSize(2, $("#negotiation_target_video_2").width(), $("#negotiation_target_video_2").height());
		};
		setTimeout(run, 100);
	} else if (3 == targetUserId) {
		var run = function() {
			meetinFlashTargetVideo_changeSize(3, $("#negotiation_target_video_3").width(), $("#negotiation_target_video_3").height());
		};
		setTimeout(run, 100);
	} else if (4 == targetUserId) {
		var run = function() {
			meetinFlashTargetVideo_changeSize(4, $("#negotiation_target_video_4").width(), $("#negotiation_target_video_4").height());
		};
		setTimeout(run, 100);
	} else if (5 == targetUserId) {
		var run = function() {
			meetinFlashTargetVideo_changeSize(5, $("#negotiation_target_video_5").width(), $("#negotiation_target_video_5").height());
		};
		setTimeout(run, 100);
	}
}

// 自分のカメラの許可・拒否のコールバック
function meetinFlashTargetVideo_cameraStatusHandler(room, username, userId, targetUserId, value) {
	if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
		console.log("[meetinFlashTargetVideo_cameraStatusHandler]:room = " + room + ", username = " + username + ", userId = " + userId + ", targetUserId = " + targetUserId + ", value = " + value);
	}
	
	// 許可
	if ("Camera.Unmuted" === value) {
		$('#negotiation_target_video_' + targetUserId).draggable( "enable" );
		$('#video_target_icon_area_' + targetUserId).show();
		$('#negotiation_target_video_relative_no_video_area_' + targetUserId).show();

		$('#negotiation_target_video_' + targetUserId).removeClass('video_wrap_flash_panel');

		delete mMeetinFlashSecurityPanelUserIdTable[targetUserId];
		for (var key in mMeetinFlashSecurityPanelUserIdTable) {
			$('#negotiation_target_video_' + key).find('.video_big_icon').trigger("click");
			break;
		}
	}
	// 拒否
	else if ("Camera.Muted" === value) {
		$('#negotiation_target_video_' + targetUserId).draggable( "enable" );
		$('#video_target_icon_area_' + targetUserId).show();
		$('#negotiation_target_video_relative_no_video_area_' + targetUserId).show();

		$('#negotiation_target_video_' + targetUserId).removeClass('video_wrap_flash_panel');

		delete mMeetinFlashSecurityPanelUserIdTable[targetUserId];
		for (var key in mMeetinFlashSecurityPanelUserIdTable) {
			$('#negotiation_target_video_' + key).find('.video_big_icon').trigger("click");
			break;
		}
	}
}

function meetinFlashTargetVideo_netStatusHandler(code, targetUserId) {
	if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
		console.log("[meetinFlashTargetVideo_netStatusHandler]:code = " + code + ", targetUserId = " + targetUserId);
	}
	
	if ("NetStream.Video.DimensionChange" === code) {
		meetinFlashTargetVideo_changeSize(targetUserId, $("#negotiation_target_video_" + targetUserId).width(), $("#negotiation_target_video_" + targetUserId).height());
	}
}

function meetinFlashTargetVideo_debug(value) {
	if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
		console.log("[meetinFlashTargetVideo_debug] - " + value);
	}
}

function meetinFlashTargetVideo_muteAudio(userId, muted) {
	var flash = null;
	if (navigator.appName.indexOf("Microsoft") != -1) {
		flash = window['negotiation_target_flash_' + userId];
	} else {
		flash = document['negotiation_target_flash_' + userId];
	}
	
	if (flash) {
		try {
			flash.muteAudio(muted);
		} catch (exception) {
			if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
				console.log("[meetinFlashTargetVideo_muteAudio][error]:userId = " + userId + " exception = " + exception);
			}
		}
	}
}

/*
function meetinFlashTargetVideo_setMyUsername(myWebSocketPeerId, userId) {
	var flash = null;
	if (navigator.appName.indexOf("Microsoft") != -1) {
		flash = window['negotiation_target_flash_' + userId];
	} else {
		flash = document['negotiation_target_flash_' + userId];
	}
	
	if (flash) {
		try {
			flash.setMyUsername(myWebSocketPeerId + "_" + userId, FLASH_WEB_SERVICE_URL);
			if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
				console.log("[meetinFlashTargetVideo_setMyUsername]:username = " + myWebSocketPeerId + "_" + userId + ", webservice = " + FLASH_WEB_SERVICE_URL + ", userId = " + userId);
			}
		} catch (exception) {
			if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
				console.log("[meetinFlashTargetVideo_setMyUsername][error]:username = " + myWebSocketPeerId + "_" + userId + ", webservice = " + FLASH_WEB_SERVICE_URL + ", userId = " + userId + ", exception = " + exception);
			}
		}
	}
}

function meetinFlashTargetVideo_callTarget(targetWebSocketPeerId, targetUserId, myUserId) {
	if (0 == targetUserId && mMeetinFlashTargetVideoReady_0) {
		meetinFlashTargetVideo_callTarget_sub_0(targetWebSocketPeerId, myUserId);
	} else if (1 == targetUserId && mMeetinFlashTargetVideoReady_1) {
		meetinFlashTargetVideo_callTarget_sub_1(targetWebSocketPeerId, myUserId);
	} else if (2 == targetUserId && mMeetinFlashTargetVideoReady_2) {
		meetinFlashTargetVideo_callTarget_sub_2(targetWebSocketPeerId, myUserId);
	} else if (3 == targetUserId && mMeetinFlashTargetVideoReady_3) {
		meetinFlashTargetVideo_callTarget_sub_3(targetWebSocketPeerId, myUserId);
	} else if (4 == targetUserId && mMeetinFlashTargetVideoReady_4) {
		meetinFlashTargetVideo_callTarget_sub_4(targetWebSocketPeerId, myUserId);
	} else if (5 == targetUserId && mMeetinFlashTargetVideoReady_5) {
		meetinFlashTargetVideo_callTarget_sub_5(targetWebSocketPeerId, myUserId);
	}
}

function meetinFlashTargetVideo_callTarget_sub_0(targetWebSocketPeerId, myUserId) {
	var flash = null;
	if (navigator.appName.indexOf("Microsoft") != -1) {
		flash = window['negotiation_target_flash_0'];
	} else {
		flash = document['negotiation_target_flash_0'];
	}
	
	if (flash) {
		var run = function() {
			try {
				if (mMeetinFlashTargetVideoState_0 === 'CallReady') {
					flash.callTarget(targetWebSocketPeerId + "_" + myUserId);
					if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
						console.log("[meetinFlashTargetVideo_callTarget_sub_0]:callTarget = " + targetWebSocketPeerId + "_" + myUserId);
					}
				}
			} catch (exception) {
				if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
					console.log("[meetinFlashTargetVideo_callTarget_sub_0][error]:callTarget = " + targetWebSocketPeerId + "_" + myUserId + ", exception = " + exception);
				}
			}
		};
		setTimeout(run, 1000);
	}
}

function meetinFlashTargetVideo_callTarget_sub_1(targetWebSocketPeerId, myUserId) {
	var flash = null;
	if (navigator.appName.indexOf("Microsoft") != -1) {
		flash = window['negotiation_target_flash_1'];
	} else {
		flash = document['negotiation_target_flash_1'];
	}
	
	if (flash) {
		var run = function() {
			try {
				if (mMeetinFlashTargetVideoState_1 === 'CallReady') {
					flash.callTarget(targetWebSocketPeerId + "_" + myUserId);
					if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
						console.log("[meetinFlashTargetVideo_callTarget_sub_1]:callTarget = " + targetWebSocketPeerId + "_" + myUserId);
					}
				}
			} catch (exception) {
				if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
					console.log("[meetinFlashTargetVideo_callTarget_sub_1][error]:callTarget = " + targetWebSocketPeerId + "_" + myUserId + ", exception = " + exception);
				}
			}
		};
		setTimeout(run, 1000);
	}
}

function meetinFlashTargetVideo_callTarget_sub_2(targetWebSocketPeerId, myUserId) {
	var flash = null;
	if (navigator.appName.indexOf("Microsoft") != -1) {
		flash = window['negotiation_target_flash_2'];
	} else {
		flash = document['negotiation_target_flash_2'];
	}
	
	if (flash) {
		var run = function() {
			try {
				if (mMeetinFlashTargetVideoState_2 === 'CallReady') {
					flash.callTarget(targetWebSocketPeerId + "_" + myUserId);
					if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
						console.log("[meetinFlashTargetVideo_callTarget_sub_2]:callTarget = " + targetWebSocketPeerId + "_" + myUserId);
					}
				}
			} catch (exception) {
				if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
					console.log("[meetinFlashTargetVideo_callTarget_sub_2][error]:callTarget = " + targetWebSocketPeerId + "_" + myUserId + ", exception = " + exception);
				}
			}
		};
		setTimeout(run, 1000);
	}
}

function meetinFlashTargetVideo_callTarget_sub_3(targetWebSocketPeerId, myUserId) {
	var flash = null;
	if (navigator.appName.indexOf("Microsoft") != -1) {
		flash = window['negotiation_target_flash_3'];
	} else {
		flash = document['negotiation_target_flash_3'];
	}
	
	if (flash) {
		var run = function() {
			try {
				if (mMeetinFlashTargetVideoState_3 === 'CallReady') {
					flash.callTarget(targetWebSocketPeerId + "_" + myUserId);
					if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
						console.log("[meetinFlashTargetVideo_callTarget_sub_3]:callTarget = " + targetWebSocketPeerId + "_" + myUserId);
					}
				}
			} catch (exception) {
				if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
					console.log("[meetinFlashTargetVideo_callTarget_sub_3][error]:callTarget = " + targetWebSocketPeerId + "_" + myUserId + ", exception = " + exception);
				}
			}
		};
		setTimeout(run, 1000);
	}
}

function meetinFlashTargetVideo_callTarget_sub_4(targetWebSocketPeerId, myUserId) {
	var flash = null;
	if (navigator.appName.indexOf("Microsoft") != -1) {
		flash = window['negotiation_target_flash_4'];
	} else {
		flash = document['negotiation_target_flash_4'];
	}
	
	if (flash) {
		var run = function() {
			try {
				if (mMeetinFlashTargetVideoState_4 === 'CallReady') {
					flash.callTarget(targetWebSocketPeerId + "_" + myUserId);
					if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
						console.log("[meetinFlashTargetVideo_callTarget_sub_4]:callTarget = " + targetWebSocketPeerId + "_" + myUserId);
					}
				}
			} catch (exception) {
				if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
					console.log("[meetinFlashTargetVideo_callTarget_sub_4][error]:callTarget = " + targetWebSocketPeerId + "_" + myUserId + ", exception = " + exception);
				}
			}
		};
		setTimeout(run, 1000);
	}
}

function meetinFlashTargetVideo_callTarget_sub_5(targetWebSocketPeerId, myUserId) {
	var flash = null;
	if (navigator.appName.indexOf("Microsoft") != -1) {
		flash = window['negotiation_target_flash_5'];
	} else {
		flash = document['negotiation_target_flash_5'];
	}
	
	if (flash) {
		var run = function() {
			try {
				if (mMeetinFlashTargetVideoState_5 === 'CallReady') {
					flash.callTarget(targetWebSocketPeerId + "_" + myUserId);
					if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
						console.log("[meetinFlashTargetVideo_callTarget_sub_5]:callTarget = " + targetWebSocketPeerId + "_" + myUserId);
					}
				}
			} catch (exception) {
				if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
					console.log("[meetinFlashTargetVideo_callTarget_sub_5][error]:callTarget = " + targetWebSocketPeerId + "_" + myUserId + ", exception = " + exception);
				}
			}
		};
		setTimeout(run, 1000);
	}
}

function meetinFlashTargetVideo_startCamera() {
	var user_id = $('#user_id').val();
	for (var i = 0; i < MEETIN_MAIN_MAX_PEOPLE; ++i) {
		if (i != user_id) {
			var flash = null;
			if (navigator.appName.indexOf("Microsoft") != -1) {
				flash = window['negotiation_target_flash_' + i];
			} else {
				flash = document['negotiation_target_flash_' + i];
			}
			
			if (flash) {
				try {
					flash.startCamera();
					if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
						console.log("[meetinFlashTargetVideo_startCamera]:userId = " + i);
					}
				} catch (exception) {
					if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
						console.log("[meetinFlashTargetVideo_startCamera][error]:userId = " + i + ", exception = " + exception);
					}
				}
			}
		}
	}
}

function meetinFlashTargetVideo_stopCamera() {
	var user_id = $('#user_id').val();
	for (var i = 0; i < MEETIN_MAIN_MAX_PEOPLE; ++i) {
		if (i != user_id) {
			var flash = null;
			if (navigator.appName.indexOf("Microsoft") != -1) {
				flash = window['negotiation_target_flash_' + i];
			} else {
				flash = document['negotiation_target_flash_' + i];
			}
			
			if (flash) {
				try {
					flash.stopCamera();
					if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
						console.log("[meetinFlashTargetVideo_stopCamera]:userId = " + i);
					}
				} catch (exception) {
					if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
						console.log("[meetinFlashTargetVideo_stopCamera][error]:userId = " + i + ", exception = " + exception);
					}
				}
			}
		}
	}
}

function meetinFlashTargetVideo_startMic() {
	var user_id = $('#user_id').val();
	for (var i = 0; i < MEETIN_MAIN_MAX_PEOPLE; ++i) {
		if (i != user_id) {
			var flash = null;
			if (navigator.appName.indexOf("Microsoft") != -1) {
				flash = window['negotiation_target_flash_' + i];
			} else {
				flash = document['negotiation_target_flash_' + i];
			}
			
			if (flash) {
				try {
					flash.startMic();
					if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
						console.log("[meetinFlashTargetVideo_startMic]:userId = " + i);
					}
				} catch (exception) {
					if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
						console.log("[meetinFlashTargetVideo_startMic][error]:userId = " + i + ", exception = " + exception);
					}
				}
			}
		}
	}
	
	NEGOTIATION.isMyMicOn = true;
}

function meetinFlashTargetVideo_stopMic() {
	var user_id = $('#user_id').val();
	for (var i = 0; i < MEETIN_MAIN_MAX_PEOPLE; ++i) {
		if (i != user_id) {
			var flash = null;
			if (navigator.appName.indexOf("Microsoft") != -1) {
				flash = window['negotiation_target_flash_' + i];
			} else {
				flash = document['negotiation_target_flash_' + i];
			}
			
			if (flash) {
				try {
					flash.stopMic();
					if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
						console.log("[meetinFlashTargetVideo_stopMic]:userId = " + i);
					}
				} catch (exception) {
					if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
						console.log("[meetinFlashTargetVideo_stopMic][error]:userId = " + i + ", exception = " + exception);
					}
				}
			}
		}
	}
	
	NEGOTIATION.isMyMicOn = false;
}

// 自分のカメラの描画領域を変更
function meetinFlashTargetVideo_changeSize(targetUserId, width, height) {
	var flash = null;
	if (navigator.appName.indexOf("Microsoft") != -1) {
		flash = window['negotiation_target_flash_' + targetUserId];
	} else {
		flash = document['negotiation_target_flash_' + targetUserId];
	}
	
	if (flash) {
		try {
			flash.changeSize(width, height);
			if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
				console.log("[meetinFlashTargetVideo_changeSize]:width = " + width + ", height = " + height + ", userId = " + targetUserId);
			}
		} catch (exception) {
			if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
				console.log("[meetinFlashTargetVideo_changeSize][error]:width = " + width + ", height = " + height + ", userId = " + targetUserId + ", exception = " + exception);
			}
		}
	}
}

function meetinFlashTargetVideo_changeCamera(targetUserId, newCameraIndex) {
	var flash = null;
	if (navigator.appName.indexOf("Microsoft") != -1) {
		flash = window['negotiation_target_flash_' + targetUserId];
	} else {
		flash = document['negotiation_target_flash_' + targetUserId];
	}
	
	if (flash) {
		try {
			flash.changeCamera(newCameraIndex);
			if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
				console.log("[meetinFlashTargetVideo_changeCamera]:newCameraIndex = " + newCameraIndex + ", userId = " + targetUserId);
			}
		} catch (exception) {
			if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
				console.log("[meetinFlashTargetVideo_changeCamera][error]:newCameraIndex = " + widnewCameraIndexth + ", userId = " + targetUserId + ", exception = " + exception);
			}
		}
	}
}

function meetinFlashTargetVideo_onHangup(targetUserId) {
	var flash = null;
	if (navigator.appName.indexOf("Microsoft") != -1) {
		flash = window['negotiation_target_flash_' + targetUserId];
	} else {
		flash = document['negotiation_target_flash_' + targetUserId];
	}
	
	if (flash) {
		try {
			flash.onHangup();
			if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
				console.log("[meetinFlashTargetVideo_onHangup]:userId = " + targetUserId);
			}
		} catch (exception) {
			if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
				console.log("[meetinFlashTargetVideo_onHangup]:userId = " + targetUserId + ", exception = " + exception);
			}
		}
	}
}

function meetinFlashTargetVideo_onDisconnect(targetUserId) {
	var flash = null;
	if (navigator.appName.indexOf("Microsoft") != -1) {
		flash = window['negotiation_target_flash_' + targetUserId];
	} else {
		flash = document['negotiation_target_flash_' + targetUserId];
	}
	
	if (flash) {
		try {
			flash.onDisconnect();
			if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
				console.log("[meetinFlashTargetVideo_onDisconnect]:userId = " + targetUserId);
			}
		} catch (exception) {
			if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
				console.log("[meetinFlashTargetVideo_onDisconnect]:userId = " + targetUserId + ", exception = " + exception);
			}
		}
	}
}

function meetinFlashTargetVideo_destroyFlash(targetUserId) {
	var flash = null;
	if (navigator.appName.indexOf("Microsoft") != -1) {
		flash = window['negotiation_target_flash_' + targetUserId];
	} else {
		flash = document['negotiation_target_flash_' + targetUserId];
	}
	
	if (flash) {
		try {
			flash.destroyFlash();
			if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
				console.log("[meetinFlashTargetVideo_destroyFlash]:userId = " + targetUserId);
			}
		} catch (exception) {
			if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
				console.log("[meetinFlashTargetVideo_destroyFlash]:userId = " + targetUserId + ", exception = " + exception);
			}
		}
	}
}

//////////////////////////////////////////////////////////
// MeetinFlashTargetVideoのコールバック
//////////////////////////////////////////////////////////

// meetinFlashTargetVideo_init_finish_x
// Flashの初期化が完了時に呼ばれるコールバック
// x：0～5のユーザーID

function meetinFlashTargetVideo_init_finish_0(cameraIsOn, micIsOn, cameraNames) {
	if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
		console.log("[meetinFlashTargetVideo_init_finish_0]:cameraIsOn = " + cameraIsOn + ", micIsOn = " + micIsOn + ", cameraNames = " + cameraNames.source.toString());
	}

	meetinFlashTargetVideo_setMyUsername(mNegotiationMain.getWebSocketPeerId(), 0);
}

function meetinFlashTargetVideo_init_finish_1(cameraIsOn, micIsOn, cameraNames) {
	if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
		console.log("[meetinFlashTargetVideo_init_finish_1]:cameraIsOn = " + cameraIsOn + ", micIsOn = " + micIsOn + ", cameraNames = " + cameraNames.source.toString());
	}

	meetinFlashTargetVideo_setMyUsername(mNegotiationMain.getWebSocketPeerId(), 1);
}

function meetinFlashTargetVideo_init_finish_2(cameraIsOn, micIsOn, cameraNames) {
	if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
		console.log("[meetinFlashTargetVideo_init_finish_2]:cameraIsOn = " + cameraIsOn + ", micIsOn = " + micIsOn + ", cameraNames = " + cameraNames.source.toString());
	}

	meetinFlashTargetVideo_setMyUsername(mNegotiationMain.getWebSocketPeerId(), 2);
}

function meetinFlashTargetVideo_init_finish_3(cameraIsOn, micIsOn, cameraNames) {
	if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
		console.log("[meetinFlashTargetVideo_init_finish_3]:cameraIsOn = " + cameraIsOn + ", micIsOn = " + micIsOn + ", cameraNames = " + cameraNames.source.toString());
	}

	meetinFlashTargetVideo_setMyUsername(mNegotiationMain.getWebSocketPeerId(), 3);
}

function meetinFlashTargetVideo_init_finish_4(cameraIsOn, micIsOn, cameraNames) {
	if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
		console.log("[meetinFlashTargetVideo_init_finish_4]:cameraIsOn = " + cameraIsOn + ", micIsOn = " + micIsOn + ", cameraNames = " + cameraNames.source.toString());
	}

	meetinFlashTargetVideo_setMyUsername(mNegotiationMain.getWebSocketPeerId(), 4);
}

function meetinFlashTargetVideo_init_finish_5(cameraIsOn, micIsOn, cameraNames) {
	if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
		console.log("[meetinFlashTargetVideo_init_finish_5]:cameraIsOn = " + cameraIsOn + ", micIsOn = " + micIsOn + ", cameraNames = " + cameraNames.source.toString());
	}

	meetinFlashTargetVideo_setMyUsername(mNegotiationMain.getWebSocketPeerId(), 5);
}

// meetinFlashTargetVideo_idManagerEvent_registerSuccess_x
// Flashのピア登録が完了時に呼ばれるコールバック
// x：0～5のユーザーID

function meetinFlashTargetVideo_idManagerEvent_registerSuccess_0(state) {
	if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
		console.log("[meetinFlashTargetVideo_idManagerEvent_registerSuccess_0]:state = " + state);
	}

	if (state === 'CallReady') {
		mMeetinFlashTargetVideoReady_0 = true;
		mNegotiationMain.sendRequestVideoStreamByUserId(0, null);
	}
}

function meetinFlashTargetVideo_idManagerEvent_registerSuccess_1(state) {
	if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
		console.log("[meetinFlashTargetVideo_idManagerEvent_registerSuccess_1]:state = " + state);
	}

	if (state === 'CallReady') {
		mMeetinFlashTargetVideoReady_1 = true;
		mNegotiationMain.sendRequestVideoStreamByUserId(1, null);
	}
}

function meetinFlashTargetVideo_idManagerEvent_registerSuccess_2(state) {
	if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
		console.log("[meetinFlashTargetVideo_idManagerEvent_registerSuccess_2]:state = " + state);
	}

	if (state === 'CallReady') {
		mMeetinFlashTargetVideoReady_2 = true;
		mNegotiationMain.sendRequestVideoStreamByUserId(2, null);
	}
}

function meetinFlashTargetVideo_idManagerEvent_registerSuccess_3(state) {
	if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
		console.log("[meetinFlashTargetVideo_idManagerEvent_registerSuccess_3]:state = " + state);
	}

	if (state === 'CallReady') {
		mMeetinFlashTargetVideoReady_3 = true;
		mNegotiationMain.sendRequestVideoStreamByUserId(3, null);
	}
}

function meetinFlashTargetVideo_idManagerEvent_registerSuccess_4(state) {
	if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
		console.log("[meetinFlashTargetVideo_idManagerEvent_registerSuccess_4]:state = " + state);
	}

	if (state === 'CallReady') {
		mMeetinFlashTargetVideoReady_4 = true;
		mNegotiationMain.sendRequestVideoStreamByUserId(4, null);
	}
}

function meetinFlashTargetVideo_idManagerEvent_registerSuccess_5(state) {
	if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
		console.log("[meetinFlashTargetVideo_idManagerEvent_registerSuccess_5]:state = " + state);
	}

	if (state === 'CallReady') {
		mMeetinFlashTargetVideoReady_5 = true;
		mNegotiationMain.sendRequestVideoStreamByUserId(5, null);
	}
}

// meetinFlashTargetVideo_acceptCall_x
// 着信を許可した時に呼ばれるコールバック
// x：0～5のユーザーID

function meetinFlashTargetVideo_acceptCall_0(state) {
	if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
		console.log("[meetinFlashTargetVideo_acceptCall_0]:state = " + state);
	}

	$('#negotiation_target_video_relative_0').show();
	$('#negotiation_target_video_relative_no_video_0').hide();
}

function meetinFlashTargetVideo_acceptCall_1(state) {
	if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
		console.log("[meetinFlashTargetVideo_acceptCall_1]:state = " + state);
	}

	$('#negotiation_target_video_relative_1').show();
	$('#negotiation_target_video_relative_no_video_1').hide();
}

function meetinFlashTargetVideo_acceptCall_2(state) {
	if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
		console.log("[meetinFlashTargetVideo_acceptCall_2]:state = " + state);
	}

	$('#negotiation_target_video_relative_2').show();
	$('#negotiation_target_video_relative_no_video_2').hide();
}

function meetinFlashTargetVideo_acceptCall_3(state) {
	if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
		console.log("[meetinFlashTargetVideo_acceptCall_3]:state = " + state);
	}

	$('#negotiation_target_video_relative_3').show();
	$('#negotiation_target_video_relative_no_video_3').hide();
}

function meetinFlashTargetVideo_acceptCall_4(state) {
	if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
		console.log("[meetinFlashTargetVideo_acceptCall_4]:state = " + state);
	}

	$('#negotiation_target_video_relative_4').show();
	$('#negotiation_target_video_relative_no_video_4').hide();
}

function meetinFlashTargetVideo_acceptCall_5(state) {
	if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
		console.log("[meetinFlashTargetVideo_acceptCall_5]:state = " + state);
	}

	$('#negotiation_target_video_relative_5').show();
	$('#negotiation_target_video_relative_no_video_5').hide();
}

// meetinFlashTargetVideo_onHangup_x
// 相手のとビデオチャットが切れた時に呼ばれるコールバック
// x：0～5のユーザーID

function meetinFlashTargetVideo_onHangup_0(state, action) {
	if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
		console.log("[meetinFlashTargetVideo_onHangup_0]:state = " + state + ", action = " + action);
	}
}

function meetinFlashTargetVideo_onHangup_1(state, action) {
	if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
		console.log("[meetinFlashTargetVideo_onHangup_1]:state = " + state + ", action = " + action);
	}
}

function meetinFlashTargetVideo_onHangup_2(state, action) {
	if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
		console.log("[meetinFlashTargetVideo_onHangup_2]:state = " + state + ", action = " + action);
	}
}

function meetinFlashTargetVideo_onHangup_3(state, action) {
	if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
		console.log("[meetinFlashTargetVideo_onHangup_3]:state = " + state + ", action = " + action);
	}
}

function meetinFlashTargetVideo_onHangup_4(state, action) {
	if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
		console.log("[meetinFlashTargetVideo_onHangup_4]:state = " + state + ", action = " + action);
	}
}

function meetinFlashTargetVideo_onHangup_5(state, action) {
	if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
		console.log("[meetinFlashTargetVideo_onHangup_5]:state = " + state + ", action = " + action);
	}
}

// meetinFlashTargetVideo_onDisconnect_x
// Flashのピア接続が切れた時に呼ばれるコールバック
// x：0～5のユーザーID

function meetinFlashTargetVideo_onDisconnect_0(state) {
	if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
		console.log("[meetinFlashTargetVideo_onDisconnect_0]:state = " + state);
	}

	mMeetinFlashTargetVideoReady_0 = false;
	meetinFlashTargetVideo_init_finish_0();
}

function meetinFlashTargetVideo_onDisconnect_1(state) {
	if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
		console.log("[meetinFlashTargetVideo_onDisconnect_1]:state = " + state);
	}

	mMeetinFlashTargetVideoReady_1 = false;
	meetinFlashTargetVideo_init_finish_1();
}

function meetinFlashTargetVideo_onDisconnect_2(state) {
	if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
		console.log("[meetinFlashTargetVideo_onDisconnect_2]:state = " + state);
	}

	mMeetinFlashTargetVideoReady_2 = false;
	meetinFlashTargetVideo_init_finish_2();
}

function meetinFlashTargetVideo_onDisconnect_3(state) {
	if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
		console.log("[meetinFlashTargetVideo_onDisconnect_3]:state = " + state);
	}

	mMeetinFlashTargetVideoReady_3 = false;
	meetinFlashTargetVideo_init_finish_3();
}

function meetinFlashTargetVideo_onDisconnect_4(state) {
	if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
		console.log("[meetinFlashTargetVideo_onDisconnect_4]:state = " + state);
	}

	mMeetinFlashTargetVideoReady_4 = false;
	meetinFlashTargetVideo_init_finish_4();
}

function meetinFlashTargetVideo_onDisconnect_5(state) {
	if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
		console.log("[meetinFlashTargetVideo_onDisconnect_5]:state = " + state);
	}

	mMeetinFlashTargetVideoReady_5 = false;
	meetinFlashTargetVideo_init_finish_5();
}

function meetinFlashTargetVideo_onDisconnect_unregister_0() {
	if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
		console.log("[meetinFlashTargetVideo_onDisconnect_unregister_0]");
	}

//	if (USER_PARAM_BROWSER === 'IE') {
		mMeetinFlashTargetVideoReady_0 = false;
		meetinFlashTargetVideo_init_finish_0();
//	}
}

function meetinFlashTargetVideo_onDisconnect_unregister_1() {
	if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
		console.log("[meetinFlashTargetVideo_onDisconnect_unregister_1]");
	}

//	if (USER_PARAM_BROWSER === 'IE') {
		mMeetinFlashTargetVideoReady_1 = false;
		meetinFlashTargetVideo_init_finish_1();
//	}
}

function meetinFlashTargetVideo_onDisconnect_unregister_2() {
	if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
		console.log("[meetinFlashTargetVideo_onDisconnect_unregister_2]");
	}

//	if (USER_PARAM_BROWSER === 'IE') {
		mMeetinFlashTargetVideoReady_2 = false;
		meetinFlashTargetVideo_init_finish_2();
//	}
}

function meetinFlashTargetVideo_onDisconnect_unregister_3() {
	if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
		console.log("[meetinFlashTargetVideo_onDisconnect_unregister_3]");
	}

//	if (USER_PARAM_BROWSER === 'IE') {
		mMeetinFlashTargetVideoReady_3 = false;
		meetinFlashTargetVideo_init_finish_3();
//	}
}

function meetinFlashTargetVideo_onDisconnect_unregister_4() {
	if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
		console.log("[meetinFlashTargetVideo_onDisconnect_unregister_4]");
	}

//	if (USER_PARAM_BROWSER === 'IE') {
		mMeetinFlashTargetVideoReady_4 = false;
		meetinFlashTargetVideo_init_finish_4();
//	}
}

function meetinFlashTargetVideo_onDisconnect_unregister_5() {
	if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
		console.log("[meetinFlashTargetVideo_onDisconnect_unregister_5]");
	}

//	if (USER_PARAM_BROWSER === 'IE') {
		mMeetinFlashTargetVideoReady_5 = false;
		meetinFlashTargetVideo_init_finish_5();
//	}
}

function meetinFlashTargetVideo_onStateChanged_0(state) {
	mMeetinFlashTargetVideoState_0 = state;
	if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
		console.log("[meetinFlashTargetVideo_onStateChanged_0]:state = " + state);
	}
}

function meetinFlashTargetVideo_onStateChanged_1(state) {
	mMeetinFlashTargetVideoState_1 = state;
	if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
		console.log("[meetinFlashTargetVideo_onStateChanged_1]:state = " + state);
	}
}

function meetinFlashTargetVideo_onStateChanged_2(state) {
	mMeetinFlashTargetVideoState_2 = state;
	if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
		console.log("[meetinFlashTargetVideo_onStateChanged_2]:state = " + state);
	}
}

function meetinFlashTargetVideo_onStateChanged_3(state) {
	mMeetinFlashTargetVideoState_3 = state;
	if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
		console.log("[meetinFlashTargetVideo_onStateChanged_3]:state = " + state);
	}
}

function meetinFlashTargetVideo_onStateChanged_4(state) {
	mMeetinFlashTargetVideoState_4 = state;
	if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
		console.log("[meetinFlashTargetVideo_onStateChanged_4]:state = " + state);
	}
}

function meetinFlashTargetVideo_onStateChanged_5(state) {
	mMeetinFlashTargetVideoState_5 = state;
	if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
		console.log("[meetinFlashTargetVideo_onStateChanged_5]:state = " + state);
	}
}

function meetinFlashTargetVideo_changeCamera_finish_0(cameraIsOn) {
	if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
		console.log("[meetinFlashTargetVideo_changeCamera_finish_0]:cameraIsOn = " + cameraIsOn);
	}
}

function meetinFlashTargetVideo_changeCamera_finish_1(cameraIsOn) {
	if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
		console.log("[meetinFlashTargetVideo_changeCamera_finish_1]:cameraIsOn = " + cameraIsOn);
	}
}

function meetinFlashTargetVideo_changeCamera_finish_2(cameraIsOn) {
	if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
		console.log("[meetinFlashTargetVideo_changeCamera_finish_2]:cameraIsOn = " + cameraIsOn);
	}
}

function meetinFlashTargetVideo_changeCamera_finish_3(cameraIsOn) {
	if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
		console.log("[meetinFlashTargetVideo_changeCamera_finish_3]:cameraIsOn = " + cameraIsOn);
	}
}

function meetinFlashTargetVideo_changeCamera_finish_4(cameraIsOn) {
	if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
		console.log("[meetinFlashTargetVideo_changeCamera_finish_4]:cameraIsOn = " + cameraIsOn);
	}
}

function meetinFlashTargetVideo_changeCamera_finish_5(cameraIsOn) {
	if (SHOW_MEETIN_FLASH_UTILITY_LOG) {
		console.log("[meetinFlashTargetVideo_changeCamera_finish_5]:cameraIsOn = " + cameraIsOn);
	}
}
*/
//////////////////////////////////////////////////////////
// その他のメソッド
//////////////////////////////////////////////////////////
/*
function refreshMeetinFlashTargetVideo() {
	var user_id = $('#user_id').val();
	for (var i = 0; i < MEETIN_MAIN_MAX_PEOPLE; ++i) {
		if (i != user_id) {
			refreshMeetinFlashTargetVideoSub(i);
		}
	}
}

function refreshMeetinFlashTargetVideoSub(targetUserId) {
	var flash = null;
	if (navigator.appName.indexOf("Microsoft") != -1) {
		flash = window['negotiation_target_flash_' + targetUserId];
	} else {
		flash = document['negotiation_target_flash_' + targetUserId];
	}
	
	if (flash) {
		$('#video_target_video_area_' + targetUserId).empty();
		
		var urlString = "/swf/MeetinFlashTargetVideo_" + targetUserId + ".swf?" + createRandomString(10);
		var elementID = 'video_target_video_area_' + targetUserId;
		var id = 'negotiation_target_flash_' + targetUserId;
		
		$('#negotiation_target_video_relative_' + targetUserId).show();
		$('#negotiation_target_video_relative_no_video_' + targetUserId).hide();
		$('#negotiation_target_video_' + targetUserId).draggable( "disable" );
		
		flash = showSWF(urlString, elementID, id);
	}
	
	return flash;
}
*/

function getFlashVideoFlashvars(constraints) {
	var flashvars = {};
	flashvars.cameraIndex = DEFAULT_CAMERA_ID_FLASH;
	flashvars.cameraWidth = DEFAULT_FLASH_CAMERA_WIDTH;
	flashvars.cameraHeight = DEFAULT_FLASH_CAMERA_HEIGHT;
	flashvars.cameraFramerate = DEFAULT_FLASH_CAMERA_FRAMERATE;
	flashvars.cameraBandwidth = DEFAULT_FLASH_CAMERA_BANDWIDTH;
	flashvars.cameraQuality = DEFAULT_FLASH_CAMERA_QUALITY;
	flashvars.speexQuality = DEFAULT_FLASH_SPEEX_QUALITY;
	flashvars.nellymoserRate = DEFAULT_FLASH_NELLYMOSER_RATE;
	
	if (constraints) {
		if (typeof constraints.video.width !== 'undefined') {
			if (typeof constraints.video.width.exact !== 'undefined') {
				flashvars.cameraWidth = constraints.video.width.exact;
			} else if (typeof constraints.video.width.ideal !== 'undefined') {
				flashvars.cameraWidth = constraints.video.width.ideal;
			} else if (typeof constraints.video.width.max !== 'undefined') {
				flashvars.cameraWidth = constraints.video.width.max;
			} else if (typeof constraints.video.width.min !== 'undefined') {
				flashvars.cameraWidth = constraints.video.width.min;
			} else {
				flashvars.cameraWidth = constraints.video.width;
			}
		}

		if (typeof constraints.video.height !== 'undefined') {
			if (typeof constraints.video.height.exact !== 'undefined') {
				flashvars.cameraHeight = constraints.video.height.exact;
			} else if (typeof constraints.video.height.ideal !== 'undefined') {
				flashvars.cameraHeight = constraints.video.height.ideal;
			} else if (typeof constraints.video.height.max !== 'undefined') {
				flashvars.cameraHeight = constraints.video.height.max;
			} else if (typeof constraints.video.height.min !== 'undefined') {
				flashvars.cameraHeight = constraints.video.height.min;
			} else {
				flashvars.cameraHeight = constraints.video.height;
			}
		}

		if (typeof constraints.video.frameRate !== 'undefined') {
			if (typeof constraints.video.frameRate.exact !== 'undefined') {
				flashvars.cameraFramerate = constraints.video.frameRate.exact;
			} else if (typeof constraints.video.frameRate.ideal !== 'undefined') {
				flashvars.cameraFramerate = constraints.video.frameRate.ideal;
			} else if (typeof constraints.video.frameRate.max !== 'undefined') {
				flashvars.cameraFramerate = constraints.video.frameRate.max;
			} else if (typeof constraints.video.frameRate.min !== 'undefined') {
				flashvars.cameraFramerate = constraints.video.frameRate.min;
			} else {
				flashvars.cameraFramerate = constraints.video.frameRate;
			}
		}
	}

	return flashvars;
}

//////////////////////////////////////////////////////////
// デバッグ用
//////////////////////////////////////////////////////////

function actionscriptDebug(value) {
	alert(value);
//	console.log(value);
}