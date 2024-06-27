var recordRTC_Video = null;
var recordRTC_Audio = null;

var recordingMedia = document.getElementById('recording-media');

var recordType = "";
var recordVideoType = "";

$(document).ready(function(){
/*	
	if(webrtcDetectedBrowser === 'firefox') {
		// Firefox implemented both MediaRecorder API as well as WebAudio API
		// Their MediaRecorder implementation supports both audio/video recording in single container format
		// Remember, we can't currently pass bit-rates or frame-rates values over MediaRecorder API (their implementation lakes these featrues)
		
		recordingMedia.innerHTML = '<option value="record-audio-plus-video">Audio+Video</option>'
		              + recordingMedia.innerHTML;
	}
	
	// disabling this option because currently this demo
	// doesn't supports publishing two blobs.
	// todo: add support of uploading both WAV/WebM to server.
	if(false && webrtcDetectedBrowser === 'chrome') {
		recordingMedia.innerHTML = '<option value="record-audio-plus-video">Audio+Video</option>'
		              + recordingMedia.innerHTML;
	}
*/
	$("#startVideo").click(function(){
		startVideo();
	});
	$("#stopVideo").click(function(){
		stopVideo();
	});
	$("#connectRequest").click(function(){
		connect_request();
	});
	$("#hangUp").click(function(){
		hangUp();
	});
	$("#startRecord").click(function(){
		startRecord();
	});
	$("#stopRecord").click(function(){
		stopRecord();
	});
	$("#saveRecord").click(function(){
		saveRecord();
	});
	$("#openRecordInNewTab").click(function(){
		openRecordInNewTab();
	});
	
	
//	startVideo();
});

function connect_request() {
	connect(function(){
		var data = {
			userType : 1,
			sdp : document.getElementById('text-for-send-sdp').value
		};
	
		$.ajax({
			type:"get",                // method = "POST"
			url:"https://meet-in.jp/OnlineSales/SendConnectionRequestApi.php",        // POST送信先のURL
			data:data,  // JSONデータ本体
			contentType: 'application/json', // リクエストの Content-Type
			crossDomain: true,
			success: function(json_data) {   // 200 OK時
				json_data = $.parseJSON(json_data);
				
				$("#connect_no").val(json_data.connect_no);
				$("#connection_info_id").val(json_data.id);
				
				var interval = setInterval(function waitForConnection() {
					var data = {
						id : $("#connection_info_id").val()
					};
				
					$.ajax({
						type:"get",                // method = "POST"
						url:"https://meet-in.jp/OnlineSales/WaitForConnectionApi.php",        // POST送信先のURL
						data:data,  // JSONデータ本体
						contentType: 'application/json', // リクエストの Content-Type
						crossDomain: true,
						success: function(json_data) {   // 200 OK時
							json_data = $.parseJSON(json_data);
							
							if (null != json_data.user_sdp && json_data.user_sdp != "") {
								$("#text-for-receive-sdp").html(json_data.user_sdp);
								onSDPText();
								clearInterval(interval);
							}
						},
						error: function() {         // HTTPエラー時
				//				alert("Server Error. Pleasy try again later.");
						},
						complete: function() {      // 成功・失敗に関わらず通信が終了した際の処理
						}
					});
				}, 1000);
			},
			error: function() {         // HTTPエラー時
//				alert("Server Error. Pleasy try again later.");
			},
			complete: function() {      // 成功・失敗に関わらず通信が終了した際の処理
			}
		});
	});
}

function accept_connection_request(id, operator_sdp, user_sdp) {
	connect(function(){
		var data = {
			id : id,
			operator_sdp : operator_sdp,
			user_sdp : user_sdp
		};
	
		$.ajax({
			type:"get",                // method = "POST"
			url:"https://meet-in.jp/OnlineSales/AcceptConnectionRequestApi.php",        // POST送信先のURL
			data:data,  // JSONデータ本体
			contentType: 'application/json', // リクエストの Content-Type
			crossDomain: true,
			success: function(json_data) {   // 200 OK時
				document.getElementById('text-for-send-sdp').value = operator_sdp;
			},
			error: function() {         // HTTPエラー時
//				alert("Server Error. Pleasy try again later.");
			},
			complete: function() {      // 成功・失敗に関わらず通信が終了した際の処理
			}
		});
	});
}

function connect_by_connect_no() {
	var data = {
		connect_no : document.getElementById('connect_no').value
	};

	$.ajax({
		type:"get",                // method = "POST"
		url:"https://meet-in.jp/OnlineSales/GetConnectionInfoApi.php",        // POST送信先のURL
		data:data,  // JSONデータ本体
		contentType: 'application/json', // リクエストの Content-Type
		crossDomain: true,
		success: function(json_data) {   // 200 OK時
			json_data = $.parseJSON(json_data);
			
			$("#text-for-receive-sdp").html(json_data.user_sdp);
			$("#connection_info_id").val(json_data.id);
			onSDPText(function() {
				accept_connection_request(json_data.id, document.getElementById('text-for-send-sdp').value, null);
			});
		},
		error: function() {         // HTTPエラー時
//				alert("Server Error. Pleasy try again later.");
		},
		complete: function() {      // 成功・失敗に関わらず通信が終了した際の処理
		}
	});
}

function captrueVideo(stream) {
	recordRTC_Video = RecordRTC(stream, 
		{
			type: $("#media-container-format").val(),
			disableLogs: true,
			canvas: {
				width: remoteVideo.videoWidth,
				height: remoteVideo.videoHeight
			},
			frameInterval: 20 // minimum time between pushing frames to Whammy (in milliseconds)
		}
	);
	recordRTC_Video.startRecording();
	recordType = recordingMedia.value;
	recordVideoType = $("#media-container-format").val();
}

function captrueAudio(stream) {
	recordRTC_Audio = RecordRTC(stream, 
		{
			type: 'audio',
			bufferSize: 16384,
			sampleRate: 44100,
			leftChannel: false,
			disableLogs: false,
			recorderType: webrtcDetectedBrowser === 'edge' ? StereoAudioRecorder : null
		}
	);
	recordRTC_Audio.startRecording();
	recordType = recordingMedia.value;
	recordVideoType = "";
}

function captrueAudioPlusVideo(stream) {
	if (webrtcDetectedBrowser !== 'firefox') { // opera or chrome etc.
		recordRTC_Audio = RecordRTC(stream, {
			type: 'audio',
			bufferSize: 16384,
			sampleRate: 44100,
			leftChannel: false,
			disableLogs: false,
			recorderType: webrtcDetectedBrowser === 'edge' ? StereoAudioRecorder : null
		});
		
		recordRTC_Video = RecordRTC(stream, {
			type: 'video',
			disableLogs: false,
			canvas: {
				width: remoteVideo.videoWidth,
				height: remoteVideo.videoHeight
			},
			frameInterval: 20 // minimum time between pushing frames to Whammy (in milliseconds)
		});
		
		// to sync audio/video playbacks in browser!
		recordRTC_Video.initRecorder(function() {
			recordRTC_Audio.initRecorder(function() {
				recordRTC_Audio.startRecording();
				recordRTC_Video.startRecording();
				
				recordType = recordingMedia.value;
				recordVideoType = 'video';
			});
		});
		
		return;
	}
	
	recordRTC_Video = RecordRTC(stream, {
		type: 'video',
		disableLogs: false,
		// we can't pass bitrates or framerates here
		// Firefox MediaRecorder API lakes these featrues
	});
	
	recordRTC_Video.startRecording();
	recordType = recordingMedia.value;
	recordVideoType = 'video';
}

function captrueScreen() {
	getScreenId(function(error, sourceId, screenConstraints) {
		if (error === 'not-installed') {
			document.write('<h1><a target="_blank" href="https://chrome.google.com/webstore/detail/screen-capturing/ajhifddimkapgcifgcodmmfdlknahffk">Please install this chrome extension then reload the page.</a></h1>');
		}
		
		if (error === 'permission-denied') {
			alert('Screen capturing permission is denied.');
		}
		
		if (error === 'installed-disabled') {
			alert('Please enable chrome screen capturing extension.');
		}
		
		if (error) {
			return;
		}
		
		captrueUserMedia(screenConstraints, function(screenStreamWork) {
			screenStream = screenStreamWork;
			
			recordRTC_Video = RecordRTC(screenStreamWork, 
				{
					type: $("#media-container-format").val(),
					disableLogs: true,
					canvas: {
						width: remoteVideo.videoWidth,
						height: remoteVideo.videoHeight
					}
				}
			);
		
			recordRTC_Video.startRecording();
			recordType = recordingMedia.value;
			recordVideoType = $("#media-container-format").val();
			
		}, function(error) {
			alert(error.name);
		});
	});
}

function captrueAudioPlusScreen(stream) {
	getScreenId(function(error, sourceId, screenConstraints) {
		if (error === 'not-installed') {
			document.write('<h1><a target="_blank" href="https://chrome.google.com/webstore/detail/screen-capturing/ajhifddimkapgcifgcodmmfdlknahffk">Please install this chrome extension then reload the page.</a></h1>');
		}
		
		if (error === 'permission-denied') {
			alert('Screen capturing permission is denied.');
		}
		
		if (error === 'installed-disabled') {
			alert('Please enable chrome screen capturing extension.');
		}
		
		if (error) {
			return;
		}

		if (webrtcDetectedBrowser !== 'firefox') { // opera or chrome etc.
			/*
			recordRTC_Audio = RecordRTC(stream, {
				type: 'audio',
				bufferSize: 16384,
				sampleRate: 44100,
				leftChannel: false,
				disableLogs: false,
				recorderType: webrtcDetectedBrowser === 'edge' ? StereoAudioRecorder : null
			});
			*/
			captrueUserMedia(screenConstraints, function(screenStreamWork) {
				screenStreamWork.addTrack(stream.getAudioTracks()[0]);
				
				screenStream = screenStreamWork;
				
				recordRTC_Video = RecordRTC(screenStreamWork, 
					{
						type: 'video',
						disableLogs: true
					}
				);
			
				recordRTC_Video.startRecording();
				
				recordType = recordingMedia.value;
				recordVideoType = 'video';
			
/*
				// to sync audio/video playbacks in browser!
				recordRTC_Video.initRecorder(function() {
					recordRTC_Audio.initRecorder(function() {
						recordRTC_Audio.startRecording();
						recordRTC_Video.startRecording();
						
						recordType = recordingMedia.value;
						recordVideoType = 'video';
					});
				});
*/			
			}, function(error) {
				alert(error.name);
			});
		} else {
			screenConstraints.audio = true;
			
			captrueUserMedia(screenConstraints, function(screenStreamWork) {
				screenStream = screenStreamWork;
				
				recordRTC_Video = RecordRTC(screenStreamWork, 
					{
						type: 'video',
						disableLogs: true
					}
				);
			
				recordRTC_Video.startRecording();
				recordType = recordingMedia.value;
				recordVideoType = $("#media-container-format").val();
				
			}, function(error) {
				alert(error.name);
			});
		}
	});
}

function captrueUserMedia(mediaConstraints, successCallback, errorCallback) {
    navigator.mediaDevices.getUserMedia(mediaConstraints).then(successCallback).catch(errorCallback);
}

function stopCaptrueVideo() {
	if (recordRTC_Video) {
		recordRTC_Video.stopRecording(function(url) {
		});
	}
}

function stopCaptrueAudio() {
	if (recordRTC_Audio) {
		recordRTC_Audio.stopRecording(function(url){
		});
	}
}

function stopCaptrueAudioPlusVideo() {
	if(webrtcDetectedBrowser !== 'firefox') { // opera or chrome etc.
		if (recordRTC_Audio) {
			recordRTC_Audio.stopRecording(function(url){
				if (recordRTC_Video) {
					recordRTC_Video.stopRecording(function(url) {
					});
				}
			});
		}
	} else {
		if (recordRTC_Video) {
			recordRTC_Video.stopRecording(function(url) {
			});
		}
	}
}

function stopCaptrueScreen() {
	if (recordRTC_Video) {
		recordRTC_Video.stopRecording(function(url) {
		});
	}
}

function stopCaptrueAudioPlusScreen() {
	if (recordRTC_Video) {
		recordRTC_Video.stopRecording(function(url) {
		});
	}
}

function startRecord() {
	if (!peerStarted || null == remoteStream) {
		alert("録画が開始できません");
		return;
	}
	
	var recordingMediaValue = recordingMedia.value;
	
	if (recordingMediaValue === 'record-video') {
		captrueVideo(remoteStream);
	} else if (recordingMediaValue === 'record-audio') {
		captrueAudio(remoteStream);
	} else if (recordingMediaValue === 'record-audio-plus-video') {
		captrueAudioPlusVideo(remoteStream);
	} else if (recordingMediaValue === 'record-screen') {
		captrueScreen();
	} else if (recordingMediaValue === 'record-audio-plus-screen') {
		captrueAudioPlusScreen(remoteStream);
	}
}

function stopRecord() {
	if (recordType === 'record-video') {
		stopCaptrueVideo();
	} else if (recordType === 'record-audio') {
		stopCaptrueAudio();
	} else if (recordType === 'record-audio-plus-video') {
		stopCaptrueAudioPlusVideo();
	} else if (recordType === 'record-screen') {
		stopCaptrueScreen();
	} else if (recordType === 'record-audio-plus-screen') {
		stopCaptrueAudioPlusScreen();
	}
}

function saveRecord() {
	if (recordType === 'record-video') {
		if (recordRTC_Video) {
			recordRTC_Video.save();
		}
	} else if (recordType === 'record-audio') {
		if (recordRTC_Audio) {
			recordRTC_Audio.save();
		}
	} else if (recordType === 'record-audio-plus-video') {
		if (recordRTC_Video) {
			recordRTC_Video.save();
		}
	} else if (recordType === 'record-screen') {
		if (recordRTC_Video) {
			recordRTC_Video.save();
		}
	} else if (recordType === 'record-audio-plus-screen') {
		if (recordRTC_Video) {
			recordRTC_Video.save();
		}
	}
}

function openRecordInNewTab() {
	if (recordType === 'record-video') {
		if (recordRTC_Video) {
			window.open(recordRTC_Video.toURL());
		}
	} else if (recordType === 'record-audio') {
		if (recordRTC_Audio) {
			window.open(recordRTC_Audio.toURL());
		}
	} else if (recordType === 'record-audio-plus-video') {
		if (recordRTC_Video) {
			window.open(recordRTC_Video.toURL());
		}
	} else if (recordType === 'record-screen') {
		if (recordRTC_Video) {
			window.open(recordRTC_Video.toURL());
		}
	} else if (recordType === 'record-audio-plus-screen') {
		if (recordRTC_Video) {
			window.open(recordRTC_Video.toURL());
		}
	}
}
