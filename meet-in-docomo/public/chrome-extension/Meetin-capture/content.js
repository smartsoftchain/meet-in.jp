var port = chrome.runtime.connect();

window.addEventListener("message",function(event){
  if (event.source != window) return;
    if (event.data.type == 'getScreenCaptureStreamId') {
      port.postMessage('getScreenCaptureStreamId', function(response){
        console.log(response);
      });
    if (event.data.type == 'stopScreenCaptureStream') {
      port.postMessage('stopScreenCaptureStream', function(response){
        console.log(response);
      });
    }
  }
},false);

port.onMessage.addListener(function(request, sender, sendResponse){
  window.postMessage({
    type: 'gotScreenCaptureStreamId',
    streamid: request.streamid,
    captureRect: request.captureRect,
    screenRect: request.screenRect,
    captureDelayTimer: request.captureDelayTimer
  },'*');
});

// To notice ScreenShareExtention is installed, set global variable of
// window.ScreenShareExtentionExists in front side.
var elt = document.createElement("script");
elt.innerHTML = "window.ScreenCaptureExtentionExists = true;";
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
window.postMessage({ type: 'ScreenCaptureExtentionInjected' }, '*');