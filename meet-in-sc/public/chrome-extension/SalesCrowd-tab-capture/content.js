// contents script

var port = chrome.runtime.connect();

window.addEventListener("message",function(event){
    if (event.source != window) {
    	return;
	}

	try {
	    if (event.data.type == 'startCaptureTabCapture') {
	        port.postMessage('startCaptureTabCapture', function(response){
	            console.log(response);
	        });
	    } else if (event.data.type == 'startCaptureTabCaptureExtension') {
	        port.postMessage('startCaptureTabCaptureExtension', function(response){
	            console.log(response);
	        });
	    } else if (event.data.type == 'pauseCaptureTabCapture') {
	        port.postMessage('pauseCaptureTabCapture', function(response){
	            console.log(response);
	        });
	    } else if (event.data.type == 'resumeCaptureTabCapture') {
	        port.postMessage('resumeCaptureTabCapture', function(response){
	            console.log(response);
	        });
	    } else if (event.data.type == 'stopCaptureTabCapture') {
	        port.postMessage('stopCaptureTabCapture', function(response){
	            console.log(response);
	        });
	    } else if (event.data.type == 'saveCaptureTabCapture') {
	        port.postMessage('saveCaptureTabCapture', function(response){
	            console.log(response);
	        });
	    } else if (event.data.type == 'stopAndSaveCaptureTabCapture') {
	        port.postMessage('stopAndSaveCaptureTabCapture', function(response){
	            console.log(response);
	        });
	    } else if (event.data.type == 'resetTabCaptureExtention') {
	        port.postMessage('resetTabCaptureExtention', function(response){
	            console.log(response);
	        });
	    } else if (event.data.type == 'resetTabCaptureExtentionReady') {
	        port.postMessage('resetTabCaptureExtentionReady', function(response){
	            console.log(response);
	        });
	    } else if (event.data.type == 'requestTabCaptureRecorderState') {
	        port.postMessage('requestTabCaptureRecorderState', function(response){
	            console.log(response);
	        });
	    }
	} catch (exception) {
		console.log('addEventListener Exception:['+exception+']');
	}

},false);

port.onMessage.addListener(function(request, sender, sendResponse){
//    window.postMessage({type: 'gotTabCaptureStreamId', streamid: request.streamid},'*');
	if (request.type == 'TabCaptureExtentionReady') {
		window.postMessage({type: 'TabCaptureExtentionReady'},'*');
	} else if (request.type == 'TabCaptureExtentionNotReady') {
		window.postMessage({type: 'TabCaptureExtentionNotReady'},'*');
	} else if (request.type == 'StartCaptureTabCapture_recording') {
		window.postMessage({type: 'StartCaptureTabCapture_recording'},'*');
	} else if (request.type == 'StartCaptureTabCapture_paused') {
		window.postMessage({type: 'StartCaptureTabCapture_paused'},'*');
	} else if (request.type == 'StartCaptureTabCapture_error') {
		window.postMessage({type: 'StartCaptureTabCapture_error'},'*');
	} else if (request.type == 'StartCaptureTabCapture_success') {
		window.postMessage({type: 'StartCaptureTabCapture_success'},'*');
	} else if (request.type == 'PauseCaptureTabCapture_success') {
		window.postMessage({type: 'PauseCaptureTabCapture_success'},'*');
	} else if (request.type == 'ResumeCaptureTabCapture_success') {
		window.postMessage({type: 'ResumeCaptureTabCapture_success'},'*');
	} else if (request.type == 'StopCaptureTabCapture_success') {
		window.postMessage({type: 'StopCaptureTabCapture_success'},'*');
	}
});

// To notice ScreenShareExtention is installed, set global variable of
// window.ScreenShareExtentionExists in front side.
var elt = document.createElement("script");
elt.innerHTML = "window.TabCaptureExtentionExists = true;";
document.body.appendChild(elt);

// To notice ScreenShareExtention is get ready, we send message to
// front side with type = ScreenShareInjected. For inline install pattern,
// by handling this event, you can do automatic start of ScreenShare feature.
//
// front side code snipet:
// window.addEventListner('message', function(ev) {
//   if(ev.data.type === "ScreenShareInjected") {
//     console.log('screen share extension is injected, get ready to use');
//     startScreenShare();
//   }
// }, false);
//
//console.log("script injected.");
window.postMessage({ type: 'TabCaptureInjected' }, '*');

//window.postMessage({ type: 'checkTabCaptureExtentionReady' }, '*');

window.postMessage({ type: 'resetTabCaptureExtentionReady' }, '*');
