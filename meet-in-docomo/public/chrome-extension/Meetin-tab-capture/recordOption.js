document.getElementById("microphone_button").addEventListener("click", startMyAudio);
document.getElementById("microphone_permission_button").addEventListener("click", showMicrophonePage);


var port = chrome.runtime.connect();

window.addEventListener("message",function(event){
	if (event.data.type == 'initCaptureTabCapture') {
		port.postMessage('initCaptureTabCapture', function(response){
			console.log(response);
		});
	}
	else if (event.data.type == 'requestTabCaptureRecorderState') {
		port.postMessage('requestTabCaptureRecorderState', function(response){
			console.log(response);
		});
	}
},false);

port.onMessage.addListener(function(request, sender, sendResponse){
	if (request.type == 'initCaptureTabCaptureReady') {
//		window.close();
	}
	else if (request.type == 'tabCaptureRecorderState') {
		if (request.state) {
			if ('none' === request.state || 'inactive' === request.state) {
				document.getElementById("resolutions").disabled = false;
				document.getElementById("frameRate").disabled = false;
			}
		}
	}
});

chrome.storage.sync.get(null, function(items) {
	if (items['resolutions']) {
		document.getElementById('resolutions').value = items['resolutions'];
	} else {
		chrome.storage.sync.set({
			resolutions: '720p'
		}, function() {
			document.getElementById('resolutions').value = '720p'
		});
	}
});

document.getElementById('resolutions').onchange = function() {
	this.disabled = true;

	chrome.storage.sync.set({
		resolutions: this.value
	}, function() {
		document.getElementById('resolutions').disabled = false;
	});
};

chrome.storage.sync.get(null, function(items) {
	if (items['frameRate']) {
		document.getElementById('frameRate').value = items['frameRate'];
	} else {
		chrome.storage.sync.set({
			frameRate: 10
		}, function() {
			document.getElementById('frameRate').value = 10
		});
	}
});

document.getElementById('frameRate').onchange = function() {
	this.disabled = true;

	chrome.storage.sync.set({
		frameRate: this.value
	}, function() {
		document.getElementById('frameRate').disabled = false;
	});
};

function checkMicroPermission() {
	var config = {audio: true, video: false};

	document.getElementById("microphone_state_area").style.display = "block";
	document.getElementById("microphone_button_area").style.display = "none";

	document.getElementById("microphone_button").disabled = true;
	document.getElementById("microphone_permission_button").disabled = false;
	document.getElementById("microphone_permission_button").style.display = "none";

	navigator.mediaDevices.getUserMedia(config)
	.then(function(stream) {
		document.getElementById("microphone_button").disabled = false;
		document.getElementById("microphone_permission_button").disabled = true;

		document.getElementById("microphone_state_area").style.display = "none";
		document.getElementById("microphone_button_area").style.display = "block";
	})
	.catch(function(error) {
		document.getElementById("microphone_state_area").style.display = "none";
		document.getElementById("microphone_button_area").style.display = "block";
		showMicrophonePage();
	});

	// navigator.getUserMedia(config, function(stream){
	// 	document.getElementById("microphone_button").disabled = false;
	// 	document.getElementById("microphone_permission_button").disabled = true;

	// 	document.getElementById("microphone_state_area").style.display = "none";
	// 	document.getElementById("microphone_button_area").style.display = "block";
	// }, function(error){
	// 	document.getElementById("microphone_state_area").style.display = "none";
	// 	document.getElementById("microphone_button_area").style.display = "block";

	// 	showMicrophonePage();
	// });
}

function checkRecorderState() {
	document.getElementById("resolutions").disabled = true;
	document.getElementById("frameRate").disabled = true;
	window.postMessage({ type: 'requestTabCaptureRecorderState' }, '*');
}

function startMyAudio() {
	var config = {audio: true, video: false};

	// Get audio/video stream
	navigator.mediaDevices.getUserMedia(config)
	.then(function(stream) {
		window.postMessage({ type: 'initCaptureTabCapture' }, '*');
		window.close();
	})
	.catch(function(error) {
		showMicrophonePage();
	});

// 	navigator.getUserMedia(config, function(stream){
// 		window.postMessage({ type: 'initCaptureTabCapture' }, '*');
// 		window.close();
// 	}, function(error){
// //		alert("マイクの使用を許可してください");
// 		showMicrophonePage();
// 	});
}

function showMicrophonePage() {
	chrome.tabs.create({url: "setting.html"});
	window.close();
}

checkMicroPermission();

checkRecorderState();