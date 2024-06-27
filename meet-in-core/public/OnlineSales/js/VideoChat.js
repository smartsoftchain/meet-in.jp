var localVideo = document.getElementById('local-video');
var remoteVideo = document.getElementById('remote-video');
var localStream = null;
var remoteStream = null;
var screenStream = null;
var peerConnection = null;
var peerStarted = false;
//var mediaConstraints = {'mandatory': {'OfferToReceiveAudio':false, 'OfferToReceiveVideo':true }}; // old : Upper case
var mediaConstraints = {'mandatory': {'OfferToReceiveAudio':true, 'OfferToReceiveVideo':true }}; // old : Upper case

var mediaResolution = document.getElementById('media-resolution');

var qvgaConstraints = {
  video: {width: {exact: 320}, height: {exact: 240}}
};

var vgaConstraints = {
  video: {width: {exact: 640}, height: {exact: 480}}
};

var hdConstraints = {
  video: {width: {exact: 1280}, height: {exact: 720}}
};

var fullHdConstraints = {
  video: {width: {exact: 1920}, height: {exact: 1080}}
};

// --- prefix -----
navigator.getUserMedia  = navigator.getUserMedia    || navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia || navigator.msGetUserMedia;
RTCPeerConnection = window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
RTCSessionDescription = window.RTCSessionDescription || window.webkitRTCSessionDescription || window.mozRTCSessionDescription;

// for firefox
if (window.mozRTCPeerConnection) {
  mediaConstraints = {'mandatory': {'offerToReceiveAudio':true, 'offerToReceiveVideo':true }}; // new: lower case, for firefox
}


// ----------------- handshake --------------
var textForSendSDP = document.getElementById('text-for-send-sdp');
var textToReceiveSDP = document.getElementById('text-for-receive-sdp');

function onSDPText(callback = null) {
  var text = textToReceiveSDP.value;
  if (peerConnection) {
    onAnswerText(text);
  }
  else {
    onOfferText(text, callback);
  }
}

function onOfferText(text, callback = null) {
  console.log("Received offer text...")
  console.log(text);
  setOfferText(text, callback);
  //makeAnswer();
}

function onAnswerText(text) {
  console.log("Received answer text...")
  console.log(text);
  setAnswerText(text);
}

function sendSDPText(text, callback = null) {
  console.log("---sending sdp text ---");
  console.log(text);

  textForSendSDP.value = text;
  textForSendSDP.focus();
  textForSendSDP.select();
  
  if (callback) {
    callback({});
  }
}

// ---------------------- video handling -----------------------
function withAudioChecked() {
 var inputElement = document.getElementById('with_audio');
 var checked = inputElement.checked;
 return checked;
}

function logStream(msg, stream) {
 console.log(msg + ': id=' + stream.id);

 var videoTracks = stream.getVideoTracks();
 if (videoTracks) {
  console.log('videoTracks.length=' + videoTracks.length);
  for (var i = 0; i < videoTracks.length; i++) {
   var track = videoTracks[i];
   console.log('track.id=' + track.id);
  }
 }

 var audioTracks = stream.getAudioTracks();
 if (audioTracks) {
  console.log('audioTracks.length=' + audioTracks.length);
  for (var i = 0; i < audioTracks.length; i++) {
   var track = audioTracks[i];
   console.log('track.id=' + track.id);
  }
 }
}

function displayLocalVideoDimensions() {
  if (!localVideo.videoWidth) {
    setTimeout(displayLocalVideoDimensions, 500);
  }
  dimensions.innerHTML = 'Actual video dimensions: ' + localVideo.videoWidth +
    'x' + localVideo.videoHeight + 'px.';
}

localVideo.onloadedmetadata = displayLocalVideoDimensions;

function displayRemoteVideoDimensions() {
  if (!remoteVideo.videoWidth) {
    setTimeout(displayRemoteVideoDimensions, 500);
  }
  dimensions.innerHTML = 'Actual video dimensions: ' + remoteVideo.videoWidth +
    'x' + remoteVideo.videoHeight + 'px.';
}

remoteVideo.onloadedmetadata = displayRemoteVideoDimensions;

// start local video
function startVideo() {
  //navigator.webkitGetUserMedia({video: true, audio: false},
  //navigator.getUserMedia({video: true, audio: false},
  var withAudio = withAudioChecked();
  
  var config = null;
  if ("qvga" == mediaResolution.value) {
  	config = qvgaConstraints;
  } else if ("vga" == mediaResolution.value) {
  	config = vgaConstraints;
  } else if ("hd" == mediaResolution.value) {
  	config = hdConstraints;
  } else if ("full-hd" == mediaResolution.value) {
  	config = fullHdConstraints;
  } else {
	  config.video = true;
  }
  config.audio = withAudio;
  
  navigator.getUserMedia(config,
   function (stream) { // success
    logStream('localStream', stream);
    localStream = stream;
    //localVideo.src = window.webkitURL.createObjectURL(stream);
    localVideo.src = window.URL.createObjectURL(stream);
    localVideo.play();
    localVideo.volume = 0;
   },
   function (error) { // error
    console.error('An error occurred: [CODE ' + error.code + ']');
    return;
   }
  );
}

// stop local video
function stopVideo() {
  localVideo.src = "";
  localStream.stop();
}

// ---------------------- connection handling -----------------------
function prepareNewConnection(callback = null) {
  var pc_config = {"iceServers":[]};
  var peer = null;
  try {
    //peer = new webkitRTCPeerConnection(pc_config);
    peer = new RTCPeerConnection(pc_config);
  } catch (e) {
    console.log("Failed to create peerConnection, exception: " + e.message);
  }

  // send any ice candidates to the other peer
  peer.onicecandidate = function (evt) {
    if (evt.candidate) {
      console.log(evt.candidate);
      /*
      sendCandidate({type: "candidate", 
         sdpMLineIndex: evt.candidate.sdpMLineIndex,
         sdpMid: evt.candidate.sdpMid,
         candidate: evt.candidate.candidate}
);
      */
    } else {
      console.log("ice event phase =" + evt.eventPhase);
      sendSDPText(peer.localDescription.sdp, callback);
    }

    //sendSDPText(peer.localDescription.sdp);
  };

  peer.oniceconnectionstatechange = function() {
    console.log('ice connection status=' + peer.iceConnectionState + ' gahter=' + peer.iceGatheringState);
    if ('completed' === peer.iceConnectionState) {
      console.log("candidate complete");
    }
  };

  peer.onsignalingstatechange = function() {
    console.log('signaling status=' + peer.signalingState);
  };

  peer.onnegotiationneeded = function(evt) {
    console.log('onnegotiationneeded() evt:', evt);
  }

  if (localStream) {
    console.log('Adding local stream...');
    peer.addStream(localStream);
  }
  else {
    console.warn('no local stream, but continue.');
  }

  peer.addEventListener("addstream", onRemoteStreamAdded, false);
  peer.addEventListener("removestream", onRemoteStreamRemoved, false)

  // when remote adds a stream, hand it on to the local video element
  function onRemoteStreamAdded(event) {
    console.log("Added remote stream");
    logStream("remoteStream", event.stream);
    if (event.stream.id === 'default') {
      console.warn('remotestream.id=default, so skip');
      return;
    }
    remoteStream = event.stream;
    remoteVideo.src = window.URL.createObjectURL(event.stream);
    remoteVideo.play();
  }

  // when remote removes a stream, remove it from the local video element
  function onRemoteStreamRemoved(event) {
    console.log("Remove remote stream");
    logStream("remoteStream", event.stream);
    remoteVideo.pause();
    remoteVideo.src = "";
  }

  return peer;
}

function makeOffer(callback = null) {
  peerConnection = prepareNewConnection(callback);
  peerConnection.createOffer(function (sessionDescription) { // in case of success
    peerConnection.setLocalDescription(sessionDescription);
    console.log("Sending: SDP");
    console.log(sessionDescription);
    //sendSDP(sessionDescription);
  }, function () { // in case of error
    console.log("Create Offer failed");
  }, mediaConstraints);
}

function setOfferText(text, callback = null) {
  if (peerConnection) {
    console.error('peerConnection alreay exist!');
  }
  peerConnection = prepareNewConnection(callback);
  var offer = new RTCSessionDescription({
    type : 'offer',
    sdp : text,
  });
  peerConnection.setRemoteDescription(offer,
   makeAnswer,
   function (err) {
    console.error('setRemoteDescriptio(offer) error:', err);
   }
  );
}

function makeAnswer() {
  console.log('sending Answer. Creating remote session description...' );
  if (! peerConnection) {
    console.error('peerConnection NOT exist!');
    return;
  }

  peerConnection.createAnswer(function (sessionDescription) { // in case of success
    peerConnection.setLocalDescription(sessionDescription);
    console.log("Sending: SDP");
    console.log(sessionDescription);
    //sendSDP(sessionDescription);
  }, function () { // in case of error
    console.log("Create Answer failed");
  }, mediaConstraints);
}

function setAnswerText(text) {
  if (! peerConnection) {
    console.error('peerConnection NOT exist!');
    return;
  }
  var answer = new RTCSessionDescription({
    type : 'answer',
    sdp : text,
  });
  peerConnection.setRemoteDescription(answer);
}

// -------- handling user UI event -----
// start the connection upon user request
function connect(callback = null) {
  //if (!peerStarted && localStream && channelReady) {
  if (!peerStarted && localStream) {
    makeOffer(callback);
    peerStarted = true;
  } else {
    alert("Local stream not running yet - try again.");
  }
}

// stop the connection upon user request
function hangUp() {
  console.log("Hang up.");
  stop();
}

function stop() {
  peerConnection.close();
  peerConnection = null;
  peerStarted = false;    
}
