window.AudioContext = window.AudioContext || window.webkitAudioContext;

// change hostname of your own.
var mHostName = ["sc.sense.co.jp", 
				"sc2.sense.co.jp",
				"demo.sales-crowd.jp",
				"online.sales-crowd.jp"
				];

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
var mGoogLeakyBucket = true;
var mGoogTemporalLayeredScreencast = true;

var mTabCaptureExtentionReady = false;

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
	                minAspectRatio: mMinAspectRatio,
	                googLeakyBucket: mGoogLeakyBucket,
	                googTemporalLayeredScreencast: mGoogTemporalLayeredScreencast
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
					
					if (port) {
						port.postMessage({type: 'initCaptureTabCaptureReady'},'*');
					}
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
	                minAspectRatio: mMinAspectRatio,
	                googLeakyBucket: mGoogLeakyBucket,
	                googTemporalLayeredScreencast: mGoogTemporalLayeredScreencast
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
	var audio = new Audio(window.URL.createObjectURL(videoStream));
	audio.play();

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
		outputTracks = outputTracks.concat(mergeAudioStream.stream.getAudioTracks());
		mTabCaptureStream = new MediaStream(outputTracks);

		mTabCaptureRecordedChunks = [];
		var options = {mimeType: 'video/webm; codecs=vp9'};
		mTabCaptureRecorder = new MediaRecorder(mTabCaptureStream);
		mTabCaptureRecorder.start();

		// ondataavailableはデータが到着したら発火します
		// このイベント契機で配列mTabCaptureRecorderにデータを格納していきます
		mTabCaptureRecorder.ondataavailable = function(event) {
//console.log("data available: type=" + event.data.type + " size=" + event.data.size);
			if (event.data.size > 0) {
				mTabCaptureRecordedChunks.push(event.data);
			}
		};

		// onstopはstopメソッドが実行されてRecordingが停止したら発火します
		// このイベント契機で配列(mTabCaptureRecorder)からデータを取り出しダウンロード可能な形式に変換し、
		// ダウンロードリンクのURLとして設定します
		mTabCaptureRecorder.onstop = function(event) {
//console.log('onstop() mSaveBlob=('+mSaveBlob+')');
			if (mSaveBlob) {
				// 配列(mTabCaptureRecorder)からデータを取り出し,WebMメディアファイル(video/webm)
				mTabCaptureBlob = new Blob(mTabCaptureRecordedChunks, {
					type: 'video/webm'
				});
				invokeSaveAsDialog(mTabCaptureBlob, null);
				mSaveBlob = false;
				stopTabCaptureStream();
				stopAudioStream();
			}
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

function startMyAudio(successCallback, errorCallback) {
	var config = {audio: true, video: false};
	
	// Get audio/video stream
	navigator.getUserMedia(config, function(stream){
		if (successCallback) {
			successCallback(stream);
		}
	}, function(error){
		if (errorCallback) {
			errorCallback();
		}
	});
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

/**
下記ファンクションtabCapture(port)は呼ばれていない
**/
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

//    if (!navigator.mozGetUserMedia) {
//        URL.revokeObjectURL(hyperlink.href);
//    }
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
