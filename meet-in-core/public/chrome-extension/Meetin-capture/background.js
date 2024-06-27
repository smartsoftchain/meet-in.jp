var mHostName = [
	"delphinus.sense.co.jp", 
	"delphinus2.sense.co.jp",
	"dev1.meet-in.jp",
	"stage.meet-in.jp",
	"meet-in.jp"
];
var mStreamId = null;

chrome.runtime.onConnect.addListener(function(port){
	// attach event listener from content.js
	port.onMessage.addListener(function(message){
		// If message equal getStreamId, execute picker. After selected window, callback function executes and transfer streamid to content.js
		if(message == 'getScreenCaptureStreamId'){
			chrome.desktopCapture.chooseDesktopMedia(['screen', 'window'],port.sender.tab, function(streamId){
//				console.log(streamId);
				mStreamId = streamId;

				var _captureDelayTimer = 5;
				chrome.storage.sync.get(null, function(items) {
					_captureDelayTimer = items['captureDelayTimer'];
					port.postMessage({
						streamid:streamId,
						captureRect: {
							width: screen.width > 1920 ? screen.width : 1920,
							height: screen.height > 1080 ? screen.height : 1080
						},
						screenRect: {
							width: screen.width,
							height: screen.height
						},
						captureDelayTimer: _captureDelayTimer
					});
				});
			});
		} else if (message == 'stopScreenCaptureStream'){
			if (mStreamId) {
				mStreamId = null;
			}
		}
	});
});

var injectContentScriptToExistingTabs = function() {
console.log('injectContentScriptToExistingTabs');
	// obtain target tabs to inject content script
	for (var i = 0; i < mHostName.length; ++i) {
		chrome.tabs.query({
			"status": "complete",
			"url": "*://" + mHostName[i] + "/*",
		}, function(tabs) {
//console.dir(tabs);
			tabs.forEach(function(tab){
//console.log(tab);
				// inject script
				chrome.tabs.executeScript(tab.id, {
					"file": "content.js",
					"runAt": "document_start"
				});
//console.log("content.js executed");
			});
		});
	}
}

injectContentScriptToExistingTabs();
