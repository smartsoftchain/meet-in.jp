window.AudioContext = window.AudioContext || window.webkitAudioContext;

// change hostname of your own.
var mHostName = ["docomodx.aidma-hd.jp"];

var mTabCaptureStream = null;
var mTabCaptureRecorder = null;
var mTabCaptureRecordedChunks = null;
var mTabCaptureBlob = null;
var mAudioStream = null;

var mResolutions = {};
var mChromeMediaSource = 'tab';
var mMinFrameRate = 30;
var mMaxFrameRate = 64;
var mMinAspectRatio = 1.77;

var mTabCaptureExtentionReady = false;
// var chunkEndedFlg = false; //chunkUploadの終了確認フラグ

chrome.runtime.onInstalled.addListener(function(details){
	if (details.reason == "install"){
		chrome.tabs.create({url: "setting.html"});
	}
});

// background script
//
// Execute screen share feature when requested from content.js (content script)
chrome.runtime.onConnect.addListener(function(port){
	// attach event listener from content.js
	port.onMessage.addListener(function(message){
	// If message equal getStreamId, execute picker. After selected window, callback function executes and transfer streamid to content.js
		if (message == 'initCaptureTabCapture'){
			chrome.tabs.getSelected(null, function(tab) {
				if (!mTabCaptureExtentionReady) {
					startTabCaptureExtention(port);
				}
			});
		} else if (message == 'startCaptureTabCapture'){
			if (mTabCaptureExtentionReady) {
				startCaptureTabCapture(port);
			} else {
				port.postMessage({type: 'TabCaptureExtentionNotReady'},'*');
			}
		} else if (message == 'startCaptureTabCaptureExtension'){
			chrome.tabs.create({url: "setting.html"});
		} else if (message == 'pauseCaptureTabCapture'){
			pauseCaptureTabCapture(port);
		} else if (message == 'resumeCaptureTabCapture'){
			resumeCaptureTabCapture(port);
		} else if (message == 'stopCaptureTabCapture'){
			stopCaptureTabCapture(port);
		} else if (message == 'saveCaptureTabCapture'){
			saveCaptureTabCapture();
		} else if (message == 'stopAndSaveCaptureTabCapture'){
			// 動画ファイルアップロード中モーダル表示
			// port.postMessage({ type: 'FileUploadStart' }, '*');
			saveCaptureTabCapture();
			stopCaptureTabCapture(port);
		} else if (message == 'resetTabCaptureExtention'){
			chrome.runtime.reload();
		} else if (message == 'resetTabCaptureExtentionReady'){
			mTabCaptureExtentionReady = false;
			chrome.browserAction.setIcon({
				path: 'images/tabCapture48.png'
			});
			stopCaptureTabCapture(port);
		} else if (message == 'requestTabCaptureRecorderState'){
			if (mTabCaptureRecorder) {
				port.postMessage({type: 'tabCaptureRecorderState', state: mTabCaptureRecorder.state},'*');
			} else {
				port.postMessage({type: 'tabCaptureRecorderState', state: 'none'},'*');
			}
		}
	});
});


chrome.browserAction.onClicked.addListener(function() {
	chrome.tabs.getSelected(null, function(tab) {
		startTabCaptureExtention(null);
	});
});

function startTabCaptureExtention(port) {

	chrome.storage.sync.get(null, function(items) {
		var _resolutions = items['resolutions'];
		var _frameRate = items['frameRate'];
		if (!_resolutions) {
			mResolutions = {
				maxWidth: screen.width > 1920 ? screen.width : 1920,
				maxHeight: screen.height > 1080 ? screen.height : 1080
			}

			chrome.storage.sync.set({
				resolutions: '1080p'
			}, function() {});
		}

		if (_resolutions === 'fit-screen') {
			mResolutions.maxWidth = screen.width;
			mResolutions.maxHeight = screen.height;
		}

		if (_resolutions === '1080p') {
			mResolutions.maxWidth = 1920;
			mResolutions.maxHeight = 1080;
		}

		if (_resolutions === '720p') {
			mResolutions.maxWidth = 1280;
			mResolutions.maxHeight = 720;
		}

		if (_resolutions === '360p') {
			mResolutions.maxWidth = 640;
			mResolutions.maxHeight = 360;
		}

		mResolutions.minWidth = mResolutions.maxWidth;
		mResolutions.minHeight = mResolutions.maxHeight;

		if (_frameRate) {
			mMinFrameRate = _frameRate;
			mMaxFrameRate = _frameRate;
		}

		var constraints = {
			audio: true,
			video: true,
			videoConstraints: {
				mandatory: {
					chromeMediaSource: mChromeMediaSource,
					maxWidth: mResolutions.maxWidth,
					maxHeight: mResolutions.maxHeight,
					minWidth: mResolutions.minWidth,
					minHeight: mResolutions.minHeight,
					minFrameRate: mMinFrameRate,
					maxFrameRate: mMaxFrameRate,
					minAspectRatio: mMinAspectRatio
				}
			}
		};

		chrome.tabCapture.capture(
			constraints,
			function(stream){
				if (stream) {
					var videoTrack = stream.getVideoTracks();
					if (videoTrack.length > 0) {
						for (var i = 0; i < videoTrack.length; i++) {
							videoTrack[i].stop();
						}
					}
					var audioTrack = stream.getAudioTracks();
					if (audioTrack.length > 0) {
						for (var i = 0; i < audioTrack.length; i++) {
							audioTrack[i].stop();
						}
					}

					chrome.browserAction.setIcon({
						path: 'images/tabCaptureActive48.png'
					});

					mTabCaptureExtentionReady = true;
// 2018/12/5 Ohta
// 非同期通信(initCaptureTabCaptureReady)は送信しても実施されていないと思われるのでコメント
// 通信相手が起動していない際に通信しようとしている為！！
//
//					if (port) {
// 						// 有効にした際に非同期通信例外が発生(初回のみ)する為、例外をキャッチし拡張機能として例外にならないようにする
// 						// try-catch 文を外すと拡張機能としてエラーが表示されてしまうため。
// 						try {
// 							port.postMessage({type: 'initCaptureTabCaptureReady'},'*');
// 						} catch(e) {
// 							 /* ignore */
// 							 console.log(e);
// 						}
// //						port.postMessage({type: 'initCaptureTabCaptureReady'},'*');
// 					}
				} else {
					mTabCaptureExtentionReady = false;
					mTabCaptureRecorder = null;
					mTabCaptureBlob = null;
					mTabCaptureRecordedChunks = [];
					stopTabCaptureStream();
					stopAudioStream();
				}
			}
		);
	});
}

function stopTabCaptureStream() {
	if (mTabCaptureStream) {
		var videoTrack = mTabCaptureStream.getVideoTracks();
		if (videoTrack.length > 0) {
			for (var i = 0; i < videoTrack.length; i++) {
				videoTrack[i].stop();
			}
		}
		var audioTrack = mTabCaptureStream.getAudioTracks();
		if (audioTrack.length > 0) {
			for (var i = 0; i < audioTrack.length; i++) {
				audioTrack[i].stop();
			}
		}

		mTabCaptureStream = null;

		chrome.browserAction.setIcon({
			path: 'images/tabCapture48.png'
		});
	}

	mTabCaptureBlob = null;
}

function stopAudioStream() {
	if (mAudioStream) {
		var videoTrack = mAudioStream.getVideoTracks();
		if (videoTrack.length > 0) {
			for (var i = 0; i < videoTrack.length; i++) {
				videoTrack[i].stop();
			}
		}
		var audioTrack = mAudioStream.getAudioTracks();
		if (audioTrack.length > 0) {
			for (var i = 0; i < audioTrack.length; i++) {
				audioTrack[i].stop();
			}
		}

		mAudioStream = null;
	}
}

function startCaptureTabCapture(port) {
	if (mTabCaptureRecorder) {
		if ('recording' === mTabCaptureRecorder.state) {
			port.postMessage({type: 'StartCaptureTabCapture_recording'},'*');

			return;
		}
		if ('paused' === mTabCaptureRecorder.state) {
			port.postMessage({type: 'StartCaptureTabCapture_paused'},'*');

			return;
		}
	}

	chrome.storage.sync.get(null, function(items) {
		var _resolutions = items['resolutions'];
		var _frameRate = items['frameRate'];
		if (!_resolutions) {
			mResolutions = {
				maxWidth: screen.width > 1920 ? screen.width : 1920,
				maxHeight: screen.height > 1080 ? screen.height : 1080
			}

			chrome.storage.sync.set({
				resolutions: '1080p'
			}, function() {});
		}

		if (_resolutions === 'fit-screen') {
			mResolutions.maxWidth = screen.width;
			mResolutions.maxHeight = screen.height;
		}

		if (_resolutions === '1080p') {
			mResolutions.maxWidth = 1920;
			mResolutions.maxHeight = 1080;
		}

		if (_resolutions === '720p') {
			mResolutions.maxWidth = 1280;
			mResolutions.maxHeight = 720;
		}

		if (_resolutions === '360p') {
			mResolutions.maxWidth = 640;
			mResolutions.maxHeight = 360;
		}

		if (_frameRate) {
			mMinFrameRate = _frameRate;
			mMaxFrameRate = _frameRate;
		}

		var constraints = {
			audio: true,
			video: true,
			videoConstraints: {
				mandatory: {
					chromeMediaSource: mChromeMediaSource,
					maxWidth: mResolutions.maxWidth,
					maxHeight: mResolutions.maxHeight,
					minFrameRate: mMinFrameRate,
					maxFrameRate: mMaxFrameRate,
					minAspectRatio: mMinAspectRatio
				}
			}
		};

		chrome.tabCapture.capture(
			constraints,
			function(stream) {
				if (!stream) {
					mTabCaptureExtentionReady = false;

					stopTabCaptureStream();
					stopAudioStream();
					console.log("Cannot create stream from chrome.tabCapture.capture");

					port.postMessage({type: 'StartCaptureTabCapture_error'},'*');
					return;
				}

				stream.onended = function() {
					stopTabCaptureStream();
					stopAudioStream();
					chrome.runtime.reload();
				};

				startCaptureTabCaptureSub(stream);
				port.postMessage({type: 'StartCaptureTabCapture_success'},'*');
			}
		);
	});
}

function startCaptureTabCaptureSub(videoStream) {
	var audio = new Audio();
	audio.srcObject = videoStream;
	audio.play();
//	var audio = new Audio(videoStream);
//	audio.play();

	var successCallback = function(audioStream){

		var audioContext = new AudioContext();
		var mediaStreamSource = audioContext.createMediaStreamSource(videoStream);
		var audioStreamSource = audioContext.createMediaStreamSource(audioStream);

		//Create the splitter and the merger
		splitter = audioContext.createChannelSplitter();
		merger = audioContext.createChannelMerger();

		//route the source audio to the splitter. This is a stereo connection.
		mediaStreamSource.connect(splitter);

		//route output 0 (left) from the splitter to input 0 (left) on the merger. This is a mono connection, carrying the left output signal to the left input of the Merger.
		splitter.connect(merger, 0, 0);
		//route output 0 (left) from the splitter to input 1 (right) on the merger. This is a mono connection as well, carrying the left output signal to the right input of the Merger.
		splitter.connect(merger, 0, 1);

		audioStreamSource.connect(merger, 0, 0); // add all participants to the mix
		mediaStreamSource.connect(merger, 0, 0); // Send local stream to the mixer

		audioStreamSource.connect(merger, 0, 1); // add all participants to the mix
		mediaStreamSource.connect(merger, 0, 1); // Send local stream to the mixer

		var mergeAudioStream = audioContext.createMediaStreamDestination();
		merger.connect( mergeAudioStream );


		var outputTracks = [];
		outputTracks = outputTracks.concat(videoStream.getVideoTracks());
//		outputTracks = outputTracks.concat(videoStream.getAudioTracks());
//		outputTracks = outputTracks.concat(audioStream.getAudioTracks());
		outputTracks = outputTracks.concat(mergeAudioStream.stream.getAudioTracks());
		mTabCaptureStream = new MediaStream(outputTracks);

		mTabCaptureRecordedChunks = [];
		var options = {mimeType: 'video/webm; codecs=vp9'};
		mTabCaptureRecorder = new MediaRecorder(mTabCaptureStream);

		// // 10分単位でチャンクにメディアを記録する。
		// mTabCaptureRecorder.start(600000);
		mTabCaptureRecorder.start();
		mTabCaptureRecorder.ondataavailable = function(event) {
			if (event.data.size > 0) {
				mTabCaptureRecordedChunks.push(event.data);
				// console.log(event.data)
				// mTabCaptureRecordedChunks = event.data;
				// uploadChunkedMedia(mTabCaptureRecordedChunks, port);
			}
		};

		mTabCaptureRecorder.onstop = function(event) {
			if (mSaveBlob) {
				mTabCaptureBlob = new Blob(mTabCaptureRecordedChunks, {
					type: 'video/webm'
				});
				invokeSaveAsDialog(mTabCaptureBlob, null);

				mSaveBlob = false;
				stopTabCaptureStream();
				stopAudioStream();
			}

			// onEndCompose(port);
		};

		chrome.browserAction.setIcon({
			path: 'images/tabCaptureActive48.png'
		});

	};

	var errorCallback = function() {
		stopTabCaptureStream();
		stopAudioStream();
	}

	startMyAudio(successCallback, errorCallback);
}

/**
 * 一時バケットにチャンク化したメディアをアップロードする。
  * @param {Blob} chunk
 */
// function uploadChunkedMedia(chunk) {
// 	chunkEndedFlg = false;
// 	try {
// 		const xhr = new XMLHttpRequest;
// 		// 拡張機能側はホストが別なのでハードコーディングしている。
// 		xhr.open('POST', `https://docomodx.aidma-hd.jp/negotiation/upload-chunk-to-temporary-bucket`, false);
// 		xhr.onload = (e) => {
// 			console.log('upended');
// 			chunkEndedFlg = true;
// 		};
// 		xhr.setRequestHeader('Content-Type', 'video/webm');
// 		xhr.send(chunk);
// 	} catch (error) {
// 		const result = {
// 			status: error.statusCode ?? 413,
// 			message: 'アップロードに失敗しました。',
// 			result: null
// 		};
// 		port.postMessage({
// 			type: 'FileUploadEnd',
// 			result: JSON.stringify(result)
// 		}, '*');
// 	}
// }

/**
 * 一時バケットにある該当のチャンク化したメディアを結合し、ダウンロード用のURLを返却する。
 * @param {any} port
 */
// function onEndCompose(port) {
// 	const throwError = error => {
// 		port.postMessage({
// 			type: 'FileUploadEnd',
// 			result: JSON.stringify({
// 				status: error.statusCode ?? 413,
// 				message: 'アップロードに失敗しました。',
// 				result: null
// 			})
// 		}, '*');
// 	}
// 	try {
// 		const xhr = new XMLHttpRequest;
// 		// 処理が終わるまで何分でも待つ(webemファイルのアップロードの完了を待たないと大事な会議の録画データがこの世から消え、クレームが来ても復元出来ない).
// 		const _sleep = ms => new Promise((resolve) => setTimeout(resolve, ms));
// 		while (!chunkEndedFlg) { // もしもchuckUploadが終わってない場合は、30秒待つ処理を続ける
// 			(async () => {
// 				await _sleep(500 * 60);
// 			})();
// 		}
// 			// 拡張機能側はホストが別なのでハードコーディングしている。
// 			xhr.open('POST', `https://docomodx.aidma-hd.jp/negotiation/compose`, true);

// 			xhr.timeout = 1000 * 60; // 1分待ったら終了
// 			xhr.onload = (e) => {
// 				if (xhr.status === 200) {
// 					// onload内でも 200と200以外（throwError）で分岐する
// 					if (xhr.readyState === 4) {
// 						// 200のうち　readyState 4（操作完了）　か それ以外エラーとする
// 							port.postMessage({
// 							type: 'FileUploadEnd',
// 							result: e.currentTarget.response
// 						}, '*');
// 					} else {
// 						throwError(e);
// 					}
// 				} else {
// 					throwError(e);
// 				}
// 			}	

// 			xhr.onerror = throwError;
// 			xhr.onabort = throwError;
// 			xhr.ontimeout = (error) => {
// 				port.postMessage({
// 					type: 'FileUploadEnd',
// 					result: JSON.stringify({
// 						status: error.statusCode ?? 413,
// 						message: 'タイムアウトしました。',
// 						result: null
// 					})
// 				}, '*');
// 			}

// 			xhr.setRequestHeader('Content-Type', 'application/json');
// 			xhr.send();

// 	} catch (error) {
// 		throwError(error);
// 	}
// }

function startMyAudio(successCallback, errorCallback) {
	var config = {audio: true, video: false};

	// Get audio/video stream
	navigator.mediaDevices.getUserMedia(config)
	.then(function(stream) {
		if (successCallback) {
			successCallback(stream);
		}
	})
	.catch(function(error) {
		if (errorCallback) {
			errorCallback();
		}
	});

	// navigator.getUserMedia(config, function(stream){
	// 	if (successCallback) {
	// 		successCallback(stream);
	// 	}
	// }, function(error){
	// 	if (errorCallback) {
	// 		errorCallback();
	// 	}
	// });
}

function pauseCaptureTabCapture(port) {
	if (mTabCaptureRecorder) {
		mTabCaptureRecorder.pause();
		port.postMessage({type: 'PauseCaptureTabCapture_success'},'*');
	}
}

function resumeCaptureTabCapture(port) {
	if (mTabCaptureRecorder) {
		mTabCaptureRecorder.resume();
		port.postMessage({type: 'ResumeCaptureTabCapture_success'},'*');
	}
}

function stopCaptureTabCapture(port) {
	if (mTabCaptureRecorder) {
		mTabCaptureRecorder.stop();
		mTabCaptureRecorder = null;
		stopTabCaptureStream();
		stopAudioStream();
		port.postMessage({type: 'StopCaptureTabCapture_success'},'*');
	}
}

function saveCaptureTabCapture() {
	mSaveBlob = true;
}

function tabCapture(port) {
	if (mTabCaptureStream) {
		saveCaptureTabCapture();
		stopCaptureTabCapture();
		stopTabCaptureStream();
		stopAudioStream();
		return;
	}

	startCaptureTabCapture(port);
}

function invokeSaveAsDialog(file, fileName) {
	if (!file) {
		throw 'Blob object is required.';
	}

	if (!file.type) {
		try {
			file.type = 'video/webm';
		} catch (e) {}
	}
	var fileExtension = (file.type || 'video/webm').split('/')[1];

	if (fileName && fileName.indexOf('.') !== -1) {
		var splitted = fileName.split('.');
		fileName = splitted[0];
		fileExtension = splitted[1];
	}

	var fileFullName = (fileName || (Math.round(Math.random() * 9999999999) + 888888888)) + '.' + fileExtension;

	if (typeof navigator.msSaveOrOpenBlob !== 'undefined') {
		return navigator.msSaveOrOpenBlob(file, fileFullName);
	} else if (typeof navigator.msSaveBlob !== 'undefined') {
		return navigator.msSaveBlob(file, fileFullName);
	}

	var hyperlink = document.createElement('a');
	hyperlink.href = URL.createObjectURL(file);
	hyperlink.target = '_blank';
	hyperlink.download = fileFullName;

	if (!!navigator.mozGetUserMedia) {
		hyperlink.onclick = function() {
			(document.body || document.documentElement).removeChild(hyperlink);
		};
		(document.body || document.documentElement).appendChild(hyperlink);
	}

	var evt = new MouseEvent('click', {
		view: window,
		bubbles: true,
		cancelable: true
	});

	hyperlink.dispatchEvent(evt);

	if (!navigator.mozGetUserMedia) {
		URL.revokeObjectURL(hyperlink.href);
	}
}


// inject content script to existing tabs, for inline install extensions
// this type of code is required to execute it when installed.
// Otherwise, after inline install, user has to reload web pages (this is quite annoying)
var injectContentScriptToExistingTabs = function() {
  // obtain target tabs to inject content script
	for (var i = 0; i < mHostName.length; ++i) {
		chrome.tabs.query({
		  "status": "complete",
		  "url": "*://" + mHostName[i] + "/*",
		}, function(tabs) {
		//    console.dir(tabs);
		  tabs.forEach(function(tab){
			// inject script
			chrome.tabs.executeScript(tab.id, {
			  "file": "content.js",
			  "runAt": "document_start"
			});
		  });
		});
	}
}

injectContentScriptToExistingTabs();
