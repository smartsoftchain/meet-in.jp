document.getElementById("microphone_button").addEventListener("click", startMyAudio);

var port = chrome.runtime.connect();

window.addEventListener("message",function(event){
    if (event.data.type == 'initCaptureTabCapture') {
        port.postMessage('initCaptureTabCapture', function(response){
            console.log(response);
        });
	}

},false);

port.onMessage.addListener(function(request, sender, sendResponse){
	if (request.type == 'initCaptureTabCaptureReady') {
		window.close();
	}
});

function startMyAudio() {
	var config = {audio: true, video: false};
	
	// Get audio/video stream
	navigator.getUserMedia(config, function(stream){
//		window.postMessage({ type: 'initCaptureTabCapture' }, '*');
		window.close();
	}, function(error){
		alert("マイクがブロックされている可能性があります。Chromeの[設定]→[詳細設定を表示]→[コンテンツの設定]→[マイク]を開き、マイクの使用がブロックされているかご確認ください。");
		chrome.tabs.create({url: "chrome://settings/"});
	});
}
