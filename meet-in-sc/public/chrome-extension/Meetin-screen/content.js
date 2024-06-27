// contents script

var port = chrome.runtime.connect();

window.addEventListener("message",function(event){
    if (event.source != window) return;
    if (event.data.type == 'getScreenShareStreamId') {
        port.postMessage('getScreenShareStreamId', function(response){
            console.log(response);
        });
    } else if (event.data.type == 'stopScreenShareStream') {
        port.postMessage('stopScreenShareStream', function(response){
            console.log(response);
        });
    } else if (event.data.type == 'cancelChooseDesktopMedia') {
        port.postMessage('cancelChooseDesktopMedia', function(response){
            console.log(response);
        });
    }
},false);

port.onMessage.addListener(function(request, sender, sendResponse){
    window.postMessage({type: 'gotScreenShareStreamId', streamid: request.streamid, maxWidth:request.maxWidth, maxHeight:request.maxHeight, minWidth:request.minWidth, minHeight:request.minHeight, minFrameRate:request.minFrameRate, maxFrameRate:request.maxFrameRate},'*');
});

// To notice ScreenShareExtention is installed, set global variable of
// window.ScreenShareExtentionExists in front side.
var elt = document.createElement("script");
elt.innerHTML = "window.ScreenShareExtentionExists = true;";
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
window.postMessage({ type: 'ScreenShareInjected' }, '*');
