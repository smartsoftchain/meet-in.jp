/*
window.addEventListener("message",function(event){
    if (event.source != window) {
    	return;
	}

    if (event.data.type == 'TabCaptureExtentionReady') {
		return;
    } else if (event.data.type == 'TabCaptureExtentionNotReady') {
		alert('Meetin録画を起動して下さい');
		return;
    } else if (event.data.type == 'StartCaptureTabCapture_recording') {
		return;
    } else if (event.data.type == 'StartCaptureTabCapture_paused') {
		return;
    } else if (event.data.type == 'StartCaptureTabCapture_error') {
		return;
    } else if (event.data.type == 'StartCaptureTabCapture_success') {
		return;
    } else if (event.data.type == 'PauseCaptureTabCapture_success') {
		return;
    } else if (event.data.type == 'ResumeCaptureTabCapture_success') {
		return;
    } else if (event.data.type == 'StopCaptureTabCapture_success') {
		return;
    }

},false);
*/

function startCaptureTabCapture() {
	if (!((typeof (window.TabCaptureExtentionExists) === 'boolean') && (window.TabCaptureExtentionExists))) {
//		alert('Meetin録画をインストールして下さい');
		$('.record_button_tooltip').tooltipster('open');
		return;
	}
	$('.record_button_tooltip').tooltipster('hide');
	window.postMessage({type: 'startCaptureTabCapture'},'*');
}

function pauseCaptureTabCapture() {
	window.postMessage({type: 'pauseCaptureTabCapture'},'*');
}

function resumeCaptureTabCapture() {
	window.postMessage({type: 'resumeCaptureTabCapture'},'*');
}

function stopCaptureTabCapture() {
	window.postMessage({type: 'stopCaptureTabCapture'},'*');
}

function saveCaptureTabCapture() {
	window.postMessage({type: 'saveCaptureTabCapture'},'*');
}

function stopAndSaveCaptureTabCapture() {
	// 録画をログに残すためのajax通信
	$.ajax({
		url:'/setting-log/get-recording-log',
		type:'post',
		dataType:'json',
	});
	window.postMessage({type: 'stopAndSaveCaptureTabCapture'},'*');
}

// 録画拡張機能のリロード
function resetTabCaptureExtention() {
	window.postMessage({type: 'resetTabCaptureExtention'},'*');
}
