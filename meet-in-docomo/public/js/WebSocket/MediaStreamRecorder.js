/**
 * streamを入力として音声の録音を行う
 */
class MediaStreamRecorder {

    constructor(stream, ...otherStreams) {
        // websocletのステータス
        this.WEBSOCKET_STATUS_OPEN = 1;

        this.streams = [stream].concat(otherStreams);

        /** 録音サーバーと接続するWebSocket */
        this.recServer = null;
        this.recServerUrl = '';
        if(true){//document.domain == "meet-in.jp"){
            // 本番環境で接続する録音サーバー
            this.recServerUrl = 'wss://rec.meet-in.jp';
        }else{
            // 開発環境で接続する録音サーバー
            this.recServerUrl = '';
        }
        //this.recServerUrl = 'ws://localhost:9090';

        /** WebAudioAPI関係 */
        /** @var AudioContext */
        this.audioContext = null;
        /** @var  MediaStreamAudioDestinationNode */
        this.mediaStreamDestination = null;
        /** @var MediaStreamAudioSourceNode */
        this.audioSource = null;
        /** @var ScriptProcessorNode */
        this.audioProcessor = null;
        /** AudioContextのsampleRateが実際に取得したいSAMPLE_RATEの何倍かを表す */
        /** @var number */
        this.rate = null;

        /** 固定値 */
        // 音声解析APIの関係で16kHzでサンプリングする
        this.SAMPLE_RATE = 16000;
    }

    /**
     * 録音を開始する
     */
    start(wavFileName = '') {
        this.recServer = new WebSocket(this.recServerUrl);
        this.recServer.onopen = (res) => {
            this.recServer.send(`f ${wavFileName}`);

            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext({sampleRate: 16000});

            /** ストリームを合成するためのNode */
            this.mediaStreamDestination = this.audioContext.createMediaStreamDestination();

            /** ストリームを合成 */
            this.streams.forEach(stream => {
                try {
                    this.audioContext.createMediaStreamSource(stream).connect(this.mediaStreamDestination);
                }catch (e){
                    console.log(e);
                }
            });

            /** 合成後のストリームを取得 */
            const stream = this.mediaStreamDestination.stream;

            /** サンプリングの準備 */
            this.audioSource = this.audioContext.createMediaStreamSource(stream);
            this.audioProcessor = this.audioContext.createScriptProcessor(0, 1, 1);
            this.audioSource.connect(this.audioProcessor);

            /** 音声サンプリング設定 */
            this.audioProcessor.addEventListener('audioprocess', (event) => {
                if (this.rate === null) {
                    this.rate = Math.round(this.audioContext.sampleRate / this.SAMPLE_RATE);
                    this.rate = this.rate === 0 ? 1 : this.rate;
                }
                const data = event.inputBuffer.getChannelData(0).filter((_, index) => {
                    return (index % this.rate) === 0;
                }).slice();

                const buffer = new ArrayBuffer(data.length * 2);
                const view = new DataView(buffer);
                floatTo16BitPCM(view, 0, data);

                if(this.recServer.readyState == this.WEBSOCKET_STATUS_OPEN){
                    // WEBSOCKETがOPENの場合のみ、音声情報を送信する
                    this.recServer.send(buffer);
                }
            });
            /** 音声サンプリング開始 */
            this.audioProcessor.connect(this.audioContext.destination);
        }

        /** float -> 16bitPCMへ変換する関数(little endian) */
        function floatTo16BitPCM(view, offset, audioWaveData){
            for (let i = 0; i < audioWaveData.length; i++ , offset += 2) {
                let s = Math.max(-1, Math.min(1, audioWaveData[i]));
                view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
            }
        }
    }

    /**
     * 録音を停止する
     */
    stop() {
        return this.audioContext.close().then(_ => {
            this.audioProcessor.disconnect();
            this.audioSource.disconnect();
            this.mediaStreamDestination.disconnect();
            this.recServer.close();
        });
    }
}

/**
 * ルーム全員の音声を録音するMediaStreamRecorderインスタンスを生成する
 * @return MediaStreamRecorder
 */
function createMediaStreamRecorder(){
    return new MediaStreamRecorder(publisher.localStream, publisher.subscribeStream);
};