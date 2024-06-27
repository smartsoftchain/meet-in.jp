// background script
//

// change hostname of your own.
var mHostName = ["delphinus.sense.co.jp", 
				"delphinus2.sense.co.jp",
				"delphinus3.sense.co.jp",
				"delphinus4.sense.co.jp",
				"delphinus5.sense.co.jp",
				"stage.meet-in.jp",
				"meet-in.jp"
				];
var mResolutions = {};
var mFrameRateMin = 15;
var mFrameRateMax = 15;
var mStreamId = null;
var mDesktopMediaRequestId = -1;

// Execute screen share feature when requested from content.js (content script)
chrome.runtime.onConnect.addListener(function(port){
    // attach event listener from content.js
    port.onMessage.addListener(function(message){
        // If message equal getStreamId, execute picker. After selected window, callback function executes and transfer streamid to content.js
        if(message == 'getScreenShareStreamId'){
            mDesktopMediaRequestId = chrome.desktopCapture.chooseDesktopMedia([
            	'screen',
            	'window'//,
//            	'tab'
            	],
            	port.sender.tab, 
            	function(streamId){
	                console.log(streamId);
	                mStreamId = streamId;
	                
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
				        	mFrameRateMin = _frameRate;
				        	mFrameRateMax = _frameRate;
				    	}
				        
		                port.postMessage({streamid:streamId, maxWidth:mResolutions.maxWidth, maxHeight:mResolutions.maxHeight, minWidth:mResolutions.minWidth, minHeight:mResolutions.minHeight, minFrameRate:mFrameRateMin, maxFrameRate:mFrameRateMax});
		                
		                if (mDesktopMediaRequestId >= 0) {
		                	chrome.desktopCapture.cancelChooseDesktopMedia(mDesktopMediaRequestId);
		                	mDesktopMediaRequestId = -1;
		                }
					});
            	}
            );
        } else if (message == 'stopScreenShareStream'){
        	if (mStreamId) {
				mStreamId = null;
        	}
        } else if (message == 'cancelChooseDesktopMedia'){
       		chrome.desktopCapture.cancelChooseDesktopMedia(mDesktopMediaRequestId);
        }
    });
});

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
		//      console.log(tab);
		    // inject script
		    chrome.tabs.executeScript(tab.id, {
		      "file": "content.js",
		      "runAt": "document_start"
		    });
		//      console.log("content.js executed");
		  });
		});
	}
}

injectContentScriptToExistingTabs();
