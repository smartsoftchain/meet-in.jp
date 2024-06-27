/**
 * MediaStreamのmixを行う
 */
const MEDIA_STREAM_MIXER = {
	/** 会議全員の音声stream */
	/** @type {MediaStream} roomVoicesStream */
	roomVoicesStream: null,

	/** AudioContext */
	/** @type AudioContext */
	audioContext: null,

	/** MediaStream合成用Node */
	/** @type MediaStreamAudioDestinationNode */
	mediaStreamDestination: null,

	/**
	 * MediaStreamを合成して返す
	 * @param streams
	 * @return MediaStream
	 */
	mixStream: function(streams) {
		const AudioContext = window.AudioContext || window.webkitAudioContext;
		this.audioContext = new AudioContext();

		/** ストリームを合成するためのNode */
		this.mediaStreamDestination = this.audioContext.createMediaStreamDestination();

		/** ストリームを合成 */
		streams.forEach(stream => {
			try {
				this.audioContext.createMediaStreamSource(stream).connect(this.mediaStreamDestination);
			}catch (e){
				console.log(e);
			}
		});

		/** 合成後のストリームを返却 */
		this.roomVoicesStream =  this.mediaStreamDestination.stream;
		return this.roomVoicesStream;
	},
	/** 既存のstreamに音声合成を行う */
	addStream: function(stream){
		try {
			this.audioContext.createMediaStreamSource(stream).connect(this.mediaStreamDestination);
		} catch (e) {
			console.log(e);
		}
	},
	close: function(){
		this.audioContext = null;
		this.mediaStreamDestination = null;
		this.roomVoicesStream = null;
	}
}

/**
 * 会議の録音を開始する.
 */
var NEGOTIATION_RECORDER = {

	conversation: null,

	// SkyWay録音機能(ogg音源作成).
	_createRecorder: async function(event) {

		let config = {"video": false, "audio":{"channelCount":{"ideal":2,"min":1},"sampleRate":{"ideal":48000},"echoCancellation":true,"autoGainControl":true,"noiseSuppression":true,"googAudioMirroring":false}};

		let track = await navigator.mediaDevices
		.getUserMedia(config)
		.then(function(s) {
			const mixedStream = MEDIA_STREAM_MIXER.mixStream([s].concat(remoteAudioStream));
			return mixedStream.getAudioTracks()[0];
		});

		let recorder = SkyWayRecorder.createRecorder(window.__SKYWAY_RECORDER_KEY__)
		recorder.on("abort", function(err){
			console.log("Aborted!:", err)
		});

		let res = await recorder.start(track);
		event(recorder, res);
	},

	isConversationValidation: function () {

		// TODO. 仮仕様を反映した 尚、IEは2020年12月末で公式のサポートも着れることもあり これの為の工数は割かず 対象外にする認識.
		//if (window.__SKYWAY_RECORDER_KEY__.length == 0 || $('#user_id').val() !== "1" || getBrowserType() === 'IE') {
		if (window.__SKYWAY_RECORDER_KEY__.length == 0 || getBrowserType() === 'IE') {
			return false;
		}
		return true;
	},

	/*
	 * 録音を開始する.
	 * 一緒に マスターデータを作成
	 */
	startConversation: async function () {
		if (!this.isConversationValidation() || this.conversation) {
			return;
		}
		await this._createRecorder(function(recorder, res) {
			NEGOTIATION_RECORDER.conversation                 = recorder;
			NEGOTIATION_RECORDER.conversation.file_id          = res.id;
		})
	},

	/*
	 * 録音を停止する.
	 */
	stopConversation: async function () {
		if (!this.isConversationValidation() || !this.conversation) {
			return;
		}
		await this.conversation.stop();
		this.conversation = null;
		MEDIA_STREAM_MIXER.close();
	},

	/*
	 * file_id を取得する.
	 * 開始してから終了する間のみ取得出来る点に注意.
	 * 録音を止める直前に手元変数に対比するなど対策して下さい.
	 * getConversationID
	 */
	getFileID: function () {
		if(this.conversation == null || this.conversation.file_id == undefined) {
			return null;
		}
		return this.conversation.file_id; // ハイフンつなぎの文字列.
	}

};

// ホストが終了した際、終了しわすれがあれば録音を終える.
$('#button_negotiation_finish, #footer_button_negotiation_finish').click(function(){
	NEGOTIATION_RECORDER.stopConversation();
});
