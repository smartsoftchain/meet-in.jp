var secretVoice = {

	peer:{},
	room: null,
	localStream: null,
	membersStreams:{},
	audioSource: null,

	isConnection: function() {
		return document.getElementById("staff_type").value == "AA";
	},

	isMute: function() {
		return document.getElementById("room_mode").value != 2;
	},

	getRoomName: function() {
		return document.getElementById("Room_name").value+"_SecretVoice";
	},

	getNegotiationPeerId: function() {
		return document.getElementById("peer_id").value.slice(1);
	},


	getVoiceParentElement: function() {
		return 'mi_secret_voice_area';
	},

	onConnection: function(localStream)
	{
		if(!this.isConnection()) {
			return;
		}
		if(this.isMute()) {
			localStream.getAudioTracks()[0].muted  = false;
			localStream.getAudioTracks()[0].enabled = false;
		}

		let peer = new Peer({
			key: window.__SKYWAY_KEY__,
			debug: 0
		});
		peer.on('open', function()
		{
			//  MeshRoom のオプション[音声を受信のみ] で 音声通話のみを実現.
			// [https://webrtc.ecl.ntt.com/api-reference/javascript.html#room-options-object].
			secretVoice.room = secretVoice.onSetup(secretVoice.peer.joinRoom(secretVoice.getRoomName(), {
				mode: 'mesh',
				stream: secretVoice.localStream,
				audioReceiveEnabled: true  // 音声を受信のみで使う場合のフラグです。この値がtrueかつstreamに音声トラックが含まれない場合、受信のみで音声の通信を行います。
			}));
		});

		this.peer        = peer;
		this.localStream = localStream;
	},

	onSetup: function(room)
	{

		room.on('open', function(){

		});

		// ルームに新しいPeerが参加したときに発生します。
		room.on('peerJoin', function(peerId) {
		});

		// ルームにJoinしている他のユーザのストリームを受信した時に発生します。
		room.on('stream', function(stream) {
			secretVoice.makeMike(stream);
		});

		// 他のユーザーから送信されたデータを受信した時に発生します。
		room.on('data', function(src, data) {
			secretVoice.onReceiveData(src, data);
		});

		// 新規にPeerがルームを退出したときに発生します。
		room.on('peerLeave', function(peerId) {
			delete secretVoice.membersStreams[peerId];
			document.querySelector('#'+secretVoice.getVoiceParentElement()+ ' [data-peer-id="'+peerId+'"]').remove();
		});

		// ルームをcloseしたときに発生します。
		room.on('close', function() {
		});

		return room;

	},

	makeMike: function(stream) {

		let video = document.createElement('video');
		video.setAttribute('data-peer-id', stream.peerId);
		video.autoplay = true;
		video.playsInline = true;
		video.srcObject = stream;
		video.play();
		video.onloadedmetadata = function(e) {
			console.log(e);
			video.play();
		};

		document.getElementById(secretVoice.getVoiceParentElement()).append(video);
		secretVoice.membersStreams[stream.peerId] = stream;
	},

	setVolume: function(peerId, volume) {

		// volume = 0 ~ 1 小数点１位.
		let audio = document.querySelector('#'+secretVoice.getVoiceParentElement()+ ' [data-peer-id="'+peerId+'"]');
		audio.volume = volume;

		let stream = this.membersStreams[peerId]
		if(volume == 0) {
			audio.muted = true;
			stream.getAudioTracks()[0].enabled = false;
		} else {
			audio.muted = false;
			stream.getAudioTracks()[0].enabled = true;
		}
	},

	setVolumeAll: function(volume) {
		// volume = 0 ~ 1 小数点１位.
		[].slice.call(document.querySelectorAll('#'+secretVoice.getVoiceParentElement()+ ' video'))
		.map(function(e) {
			e.volume = volume;
		});
	},

	setMyMike: function(isMuted) {

		if(this.localStream == null) {
			return;
		}
		if(this.isMute()) {
			this.localStream.getAudioTracks()[0].muted  = false;
			this.localStream.getAudioTracks()[0].enabled = false;   // ミュートは消音固定.
		} else {
			this.localStream.getAudioTracks()[0].muted  = isMuted;
			this.localStream.getAudioTracks()[0].enabled = isMuted; // false = 消音.
		}
	},

	syncSecretVoiceAudioOff: function(negotiationPeerId) {

		if(this.localStream == null) {
			return;
		}

		this.onSendData({
			action : "SEND_BACK_PEER_ID_AUDIO_OFF",
			negotiationPeerId: negotiationPeerId
		});
	},

	syncSecretVoiceAudioOn: function(negotiationPeerId) {

		if(secretVoice.localStream == null) {
			return;
		}

		secretVoice.onSendData({
			action : "SEND_BACK_PEER_ID_AUDIO_ON",
			negotiationPeerId: negotiationPeerId
		});
	},

	onSendData: function(send) {
		let sendData = {
			from_peerId: secretVoice.peer.id,
			staff_type: document.getElementById("staff_type").value,
			staff_id:   document.getElementById("staff_id").value,
			data: send
		}
		if(secretVoice.room.send !== undefined) {
			secretVoice.room.send(sendData);
		}
	},

	onReceiveData: function(peerId, receive) {
		switch(receive.data.action) {
			case "SEND_BACK_PEER_ID_AUDIO_ON":
				if(secretVoice.getNegotiationPeerId() != receive.data.negotiationPeerId) {
					return;
				}
				secretVoice.onSendData({
					action : "AUDIO_ON",
					to_peerId: receive.from_peerId,
					peerId: secretVoice.room._peerId
				});
				break;

			case "SEND_BACK_PEER_ID_AUDIO_OFF":
				if(secretVoice.getNegotiationPeerId() != receive.data.negotiationPeerId) {
					return;
				}
				secretVoice.onSendData({
					action : "AUDIO_OFF",
					to_peerId: receive.from_peerId,
					peerId: secretVoice.room._peerId
				});
				break;

			case "AUDIO_ON":
				if(receive.data.to_peerId != secretVoice.peer.id) {
					return;
				}
				secretVoice.setVolume(receive.data.peerId, 1);
				break;

			case "AUDIO_OFF":
				if(receive.data.to_peerId != secretVoice.peer.id) {
					return;
				}
				secretVoice.setVolume(receive.data.peerId, 0);
				break;
		}

	},

	onClose: function() {
		if (this.room != null) {
			this.room.close();
		}
	}

};

if(getBrowserType() != "IE"){
// Mozilla からサンプルで実装 [https://developer.mozilla.org/ja/docs/Web/API/MediaDevices/getUserMedia#Using_the_new_API_in_older_browsers].
let secretVoiceConfig = {"video": false, "audio":{"channelCount":{"ideal":2,"min":1},"sampleRate":{"ideal":48000},"echoCancellation":true,"autoGainControl":true,"noiseSuppression":true,"googAudioMirroring":false}};
if (navigator.mediaDevices === undefined) {
  navigator.mediaDevices = {};
}
if (navigator.mediaDevices.getUserMedia === undefined) {
	navigator.mediaDevices.getUserMedia = function(constraints) {
	var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    if (!getUserMedia) {
      return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
    }
    return new Promise(function(resolve, reject) {
      getUserMedia.call(navigator, constraints, resolve, reject);
    });
  }
}
navigator.mediaDevices.getUserMedia(secretVoiceConfig)
.then(function(stream) {
	secretVoice.onConnection(stream);
})
.catch(function(err) {
  console.log(err.name + ": " + err.message);
});
}

// 2020/12/17 モニタリングから話しかける機能を仕様変更するため一時無効化
secretVoice = {
	onConnection: function() {},
	onClose: function() {},
	setMyMike: function(bool) {},
	syncSecretVoiceAudioOff: function(id) {},
	syncSecretVoiceAudioOn: function(id) {}
}
