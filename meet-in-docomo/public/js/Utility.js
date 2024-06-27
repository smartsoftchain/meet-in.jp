function displayNotificationCountdown(body, icon, title, link, countdown) {
	if (typeof Notification !== 'undefined') {
		link = link || null;
		if(typeof countdown !== 'undefined') {
			// カウントダウン通知
			timer = countdown.timer || 5;
			var i = timer;

			var interval = setInterval(function(e) {
				--i;
				var _body = body + ' (' + i + '秒後)';
				var options = {
						body: _body,
						icon: icon,
						tag: 'renotify',
						renotify: true,
				};
				var n = new Notification(title, options);
				if(link) {
					n.onclick = function() {
						window.open(link);
					};
				}
				if(i <= 1) {
					clearInterval(interval);
					setTimeout(n.close.bind(n), 500);
				}
			}, 1000);
		}
	}
}

// デスクトップ通知の表示
function displayNotification(body, icon, title, link, duration) {
	if (typeof Notification !== 'undefined') {
		link = link || null;
		duration = duration || 5000;
		var options = {
				body: body,
				icon: icon
		};
		var n = new Notification(title, options);
		if(link) {
			n.onclick = function() {
				window.open(link);
			};
		}
		setTimeout(n.close.bind(n), duration);
	}
}

// デスクトップ通知が許可されたか調べる
function checkAndAskForNotificationPermission(deniedCallback) {
	if (typeof Notification !== 'undefined') {
		switch(Notification.permission){
			case 'denied':
				if (deniedCallback) {
					deniedCallback();
				}
				break;
			case 'default':
				Notification.requestPermission(function(result){
					if (result === 'denied') {
						checkAndAskForNotificationPermission(deniedCallback);
						return;
					} else if (result === 'default') {
						checkAndAskForNotificationPermission(deniedCallback);
						return;
					}
				});
				break;
			default:
				break;
		}
	}
}

// デスクトップ通知を出す
function sendNotification(title, body, icon, onclickCallback) {
	if (typeof Notification !== 'undefined') {
		var options = {
			body: body,
			icon: icon
		}
		
		var myNotification = new Notification(title, options);
		myNotification.onclick = onclickCallback;
		
		return myNotification;
	} else {
		return null;
	}
}

// 端末の種類を取得する
function getDeviceType() {
	return "PC";
}

// ブラウザの種類を取得する
function getBrowserType() {
	var ua = navigator.userAgent.toLowerCase();
//	var ver = navigator.appVersion.toLowerCase();

	// Google Chrome
	var isChrome = (ua.indexOf('chrome') > -1) && (ua.indexOf('edge') == -1);
	if(isChrome) {
		return 'Chrome';
	}

	// Firefox
	var isFirefox = (ua.indexOf('firefox') > -1);
	if(isFirefox) {
		return 'Firefox';
	}

	// Safari
	var isSafari = (ua.indexOf('safari') > -1) && (ua.indexOf('chrome') == -1);
	if(isSafari) {
		return 'Safari';
	}

	// Edge
	var isEdge = (ua.indexOf('edge') > -1);
	if(isEdge) {
		return 'Edge';
	}

	// Opera
	var isOpera = (ua.indexOf('opera') > -1);
	if(isOpera) {
		return 'Opera';
	}
	
	// IE11
	var isIE11 = (ua.indexOf('trident/7') > -1);
	if(isIE11) {
		return 'IE';
	}
	
	// IE(11以外)
	var isMSIE = (ua.indexOf('msie') > -1) && (ua.indexOf('opera') == -1);
	// IE
	var isIE = isMSIE || isIE11;
	if(isIE) {
		return 'IE';
	}

/*	
	// IE6
	var isIE6 = isMSIE && (ver.indexOf('msie 6.') > -1);
	// IE7
	var isIE7 = isMSIE && (ver.indexOf('msie 7.') > -1);
	// IE8
	var isIE8 = isMSIE && (ver.indexOf('msie 8.') > -1);
	// IE9
	var isIE9 = isMSIE && (ver.indexOf('msie 9.') > -1);
	// IE10
	var isIE10 = isMSIE && (ver.indexOf('msie 10.') > -1);
	

	if(isIE6) {
		return 'IE6';
	}
	if(isIE7) {
		return 'IE7';
	}
	if(isIE8) {
		return 'IE8';
	}
	if(isIE9) {
		return 'IE9';
	}
	if(isIE10) {
		return 'IE10';
	}
*/
	return 'Unknown';
}

function isMobile(ua_org) {
	var ua = ua_org.toLowerCase();
	var mobile = {
		0: (ua.indexOf("windows") != -1 && ua.indexOf("phone") != -1)
		|| ua.indexOf("iphone") != -1
		|| ua.indexOf("ipod") != -1
		|| (ua.indexOf("android") != -1 && ua.indexOf("mobile") != -1)
		|| (ua.indexOf("firefox") != -1 && ua.indexOf("mobile") != -1)
		|| ua.indexOf("blackberry") != -1,
		iPhone: (ua.indexOf("iphone") != -1),
		Android: (ua.indexOf("android") != -1 && ua.indexOf("mobile") != -1)
	};
	var tablet = (ua.indexOf("windows") != -1 && ua.indexOf("touach") != -1)
		|| ua.indexOf("ipad") != -1
		|| (ua.indexOf("android") != -1 && ua.indexOf("mobile") == -1)
		|| (ua.indexOf("firefox") != -1 && ua.indexOf("tablet") != -1)
		|| ua.indexOf("kindle") != -1
		|| ua.indexOf("silk") != -1
		|| ua.indexOf("playbook") != -1;

	return (mobile[0] || mobile['iPhone'] || mobile['Android'] || tablet);
};

function isIPad(ua_org) {
	let ua = ua_org.toLowerCase();
	if (getBrowserType() === 'IE') {
		return false;
	} else {
		// Apple商品であることと、 タッチ処理があることとで判定している.
		return ua.indexOf('macintosh') > -1　&& 'ontouchend' in document;
	}
}

// ランダムな文字列を生成する
function createRandomString(len) {
	var l = len; // 生成する文字列の長さ
	var c = "abcdefghijklmnopqrstuvwxyz0123456789"; // 生成する文字列に含める文字セット
	var cl = c.length;
	var r = "";
	for (var i = 0; i < l; i++) {
		r += c[Math.floor(Math.random() * cl)];
	}
	return r;
}

// 汎用ダイアログを作る
// htmlに下記のタグを追加する必要がある
// <div id="common_dialog_area"></div>
function createCommonDialog(
		title, 
		message, 
		modal, 
		draggable, 
		resizable, 
		height,
		width,
		buttonNameAndFunctionArray,
		autoOkButtonWhenNoButtonDefined,
		closeWhenButtonPressed
	) {
	var common_dialog_area = document.getElementById('common_dialog_area');
	if (!common_dialog_area) {
		return;
	}
	
	// 16文字のIDを生成する
	var id = 'common_dialog_' + createRandomString(16);
	
	// <div id="common_dialog_area">に新たな<div>を作成
	var div = document.createElement("div");
	common_dialog_area.appendChild(div);
	// <div>を識別するためにid属性を付ける。
	div.setAttribute('id', id);

	// 録画の拡張機能を有効にする場合classを付与する
	if (event.data) {
		if (event.data.type == 'TabCaptureExtentionNotReady') {
			div.setAttribute('class', 'record-dialog-content');
		}
	}

	div.innerHTML = message;
	
	var buttonObject = {};
	if (buttonNameAndFunctionArray) {
		for (var key in buttonNameAndFunctionArray) {
			if (closeWhenButtonPressed) {
				buttonObject[key] = function() {
					buttonNameAndFunctionArray[key]();
					$('#' + id).dialog("close");
				};
			} else {
				buttonObject[key] = function() {
					buttonNameAndFunctionArray[key]();
				};
			}
		}
	} else {
		if (autoOkButtonWhenNoButtonDefined) {
			buttonObject["OK"] = function() {
				$('#' + id).dialog("close");
			};
		}
	}
	
	var option = new Object();
	option.modal = modal;
	option.draggable = draggable;
	option.resizable = resizable;
	option.closeOnEscape = false;
	option.position = { my: "center", at: "center", of: window };
	option.show = 'blind';
	option.hide = 'blind';
	option.dialogClass = 'ui-dialog-osx';
	option.title = title;
	option.open = function() {                         // open event handler
						$(this).parent().find(".ui-dialog-titlebar-close").hide();                           // hide it
//						$(this).parent().parent().next().hide();                           // hide it
					};
	option.buttons = buttonObject;
	if (height) {
		option.height = height;
	}
	if (width) {
		option.width = width;
	}

	$('#' + id).dialog(option);

	return id;
}

// 汎用ダイアログを作る
// htmlに下記のタグを追加する必要がある
// <div id="common_dialog_area"></div>
function createCommonDialogWithButton(
		title, 
		message, 
		modal, 
		draggable, 
		resizable, 
		height,
		width,
		zIndex,
		autoOkButtonWhenNoButtonDefined,
		closeWhenButtonPressed,
		buttonName1,
		buttonFunction1,
		buttonName2,
		buttonFunction2,
		buttonName3,
		buttonFunction3,
		buttonName4,
		buttonFunction4,
		buttonName5,
		buttonFunction5
	) {
	var common_dialog_area = document.getElementById('common_dialog_area');
	if (!common_dialog_area) {
		return;
	}
	
	// 16文字のIDを生成する
	var id = 'common_dialog_' + createRandomString(16);
	
	// <div id="common_dialog_area">に新たな<div>を作成
	var div = document.createElement("div");
	common_dialog_area.appendChild(div);
	// <div>を識別するためにid属性を付ける。
	div.setAttribute('id', id);

	div.innerHTML = message;
	
	var buttonObject = new Array();
	if (buttonName1 && buttonFunction1 && typeof buttonFunction1 === "function") {
		var buttonFunction = function() {
			buttonFunction1();
			if (closeWhenButtonPressed) {
				$('#' + id).dialog("close");
			}
		}

		buttonObject.push(
			{
				text : buttonName1,
				click : buttonFunction
			}
		);
	}
	if (buttonName2 && buttonFunction2 && typeof buttonFunction2 === "function") {
		var buttonFunction = function() {
			buttonFunction2();
			if (closeWhenButtonPressed) {
				$('#' + id).dialog("close");
			}
		}

		buttonObject.push(
			{
				text : buttonName2,
				click : buttonFunction
			}
		);
	}
	if (buttonName3 && buttonFunction3 && typeof buttonFunction3 === "function") {
		var buttonFunction = function() {
			buttonFunction3();
			if (closeWhenButtonPressed) {
				$('#' + id).dialog("close");
			}
		}

		buttonObject.push(
			{
				text : buttonName3,
				click : buttonFunction
			}
		);
	}
	if (buttonName4 && buttonFunction4 && typeof buttonFunction4 === "function") {
		var buttonFunction = function() {
			buttonFunction4();
			if (closeWhenButtonPressed) {
				$('#' + id).dialog("close");
			}
		}

		buttonObject.push(
			{
				text : buttonName4,
				click : buttonFunction
			}
		);
	}
	if (buttonName5 && buttonFunction5 && typeof buttonFunction5 === "function") {
		var buttonFunction = function() {
			buttonFunction5();
			if (closeWhenButtonPressed) {
				$('#' + id).dialog("close");
			}
		}

		buttonObject.push(
			{
				text : buttonName5,
				click : buttonFunction
			}
		);
	}

	var option = new Object();
	option.modal = modal;
	option.draggable = draggable;
	option.resizable = resizable;
	option.closeOnEscape = false;
	option.position = { my: "center", at: "center", of: window };
	option.show = 'blind';
	option.hide = 'blind';
	option.dialogClass = 'ui-dialog-osx';
	option.title = title;
	option.open = function() {                         // open event handler
						$(this).parent().find(".ui-dialog-titlebar-close").hide();                           // hide it
						$(this).parent().parent().next().hide();                           // hide it
					};
	option.buttons = buttonObject;
	if (height) {
		option.height = height;
	}
	if (width) {
		option.width = width;
	}

	$('#' + id).dialog(option);

	if (zIndex) {
		$('#' + id).dialog().parent().css("z-index", zIndex);
	}

	return id;
}

// 簡易なモーダルダイアログを出す
function createModalOkDialog(
		title,
		message
	) {
	return createCommonDialog(
		title, 
		message, 
		true, 
		false, 
		false, 
		null,
		null,
		null,
		true,
		true
	);
}

// 簡易なモーダルダイアログを出す
function createModalDialogWithButtonFunction(
		title,
		message,
		buttonNameAndFunctionArray
	) {
	return createCommonDialog(
		title, 
		message, 
		true, 
		false, 
		false, 
		null,
		null,
		buttonNameAndFunctionArray,
		true,
		true
	);
}

// videoタグを追加
function addVideoTag(
		insertTargetElementId,
		id,
		id_connecting,
		classContent,
		styleContent
	) {
	var displayContainer = document.getElementById(insertTargetElementId);
	if (displayContainer) {
		var video = document.createElement("video");
		if (video) {
			video.setAttribute('id', id);
			video.setAttribute('class', classContent);
			video.setAttribute('style', styleContent);
			displayContainer.appendChild(video);
		}
/*		
		var div = document.createElement("div");
		if (div) {
			div.setAttribute('id', id_connecting);
			div.setAttribute('class', 'connecting_efect');
			displayContainer.appendChild(div);
		}
*/
	}
}

/**
 * 画面共有のフレームサイズをフィットさせるための計算を行う関数
 */
function getShareScreenSize(shareScreen, localShareScreenHeight, localShareScreenWidth, viewShareScreenHeight, viewShareScreenWidth){
	if(shareScreen["height"] > shareScreen["width"]){
		// 縦長画像の場合
		localShareScreenWidth = shareScreen["width"] * localShareScreenHeight / shareScreen["height"];
		if(localShareScreenWidth > viewShareScreenWidth){
			// 縦に合わせ横を計算した結果、横が枠より大きい場合は縦サイズを縮めて再計算する
			localShareScreenHeight = localShareScreenHeight - 1;
			getShareScreenSize(shareScreen, localShareScreenHeight, localShareScreenWidth, viewShareScreenHeight, viewShareScreenWidth);
		}else{
			// グローバル変数に値を設定する
			shareScreenHeight = localShareScreenHeight;
			shareScreenWidth = localShareScreenWidth;
		}
	}else{
		// 横長画像の場合
		localShareScreenHeight = shareScreen["height"] * localShareScreenWidth / shareScreen["width"];
		if(localShareScreenHeight > viewShareScreenHeight){
			// 横に合わせ縦を計算した結果、縦が枠より大きい場合は横サイズを縮めて再計算する
			localShareScreenWidth = localShareScreenWidth - 1;
			// 自身の関数で再帰する
			getShareScreenSize(shareScreen, localShareScreenHeight, localShareScreenWidth, viewShareScreenHeight, viewShareScreenWidth);
		}else{
			// グローバル変数に値を設定する
			shareScreenHeight = localShareScreenHeight;
			shareScreenWidth = localShareScreenWidth;
		}
	}
}

function attachMediaStream(element, stream) {
	element.srcObject = stream;
	return element;
}

/**
 * バージョン文字列を数値変換する
 * @param {string} version バージョン文字列
 * 
 * MacOS 10.13.4 ===> 101304
 */
function parseIntToVersion(version) {
	var retVer = 0;
	var verList = (version).match(/(\d+)[_.]?(\d)?[_.]?(\d+)?/);
	if( verList ) {
		console.log("OS version=["+ verList[1] +"]["+ verList[2] +"]["+verList[3]+"]");
		// MacOS 10.13.4 ===> 101304
		if( verList[1] ) {
			retVer = parseInt(verList[1])*10000;
			if( verList[2] ) {
				retVer += parseInt(verList[2])*100;
				if( verList[3] ) {
					retVer += parseInt(verList[3]);
				}
			}
		}
	}
	console.log("Ver=("+ retVer +")");
	return retVer;
	
}

/**
 * JSON形式かどうかチェックする
 * @param {object} json 
 */
function isJSON(json) {
	try {
		JSON.parse(json);
		return true;
	} catch(e) {
		return false;
	}
}