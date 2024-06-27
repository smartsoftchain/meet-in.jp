/**
 * リアルタイム音声解析クラス
 */
class VoiceAnalysis {
    /**
     * @param speakerNo 話者No
     * @param targetPeerId 音声解析を実行したPeerのId
     * @param receiveVoiceAnalysisEventHandler (peerId, result) => any
     * 音声解析結果取得時に実行する関数
     * PeerIdとdata(音声解析結果)を引数にとる
     * @param isMicOn () => boolean
     */
    constructor(speakerNo, targetPeerId, initializeEventHandler = (conversationId, result) => {}, receiveVoiceAnalysisEventHandler = (peerId, result) => {}, isMicOn = () => true) {
        /** 話者No */
        this.speakerNo = speakerNo;

        /** 音声解析を実行したPeerのID */
        this.targetPeerId = targetPeerId;

        /** 音声解析を開始したPeerか(開始した: true) */
        this.isHost = targetPeerId === null;

        /** 音声解析結果のハンドラ関数 */
        this.receiveVoiceAnalysisEventHandler = receiveVoiceAnalysisEventHandler;

        /** マイクのON/OFFを返す */
        this.isMicOn = isMicOn;

        /** 音声解析実行中 */
        this.isRunning = false;

        /** 音声解析開始時刻(音声解析処理開始時間を記録して時系列順に表示する基準時間とする) */
        this.recognizeStartTime = null;

        /** 音声解析サーバとの接続確立時刻 */
        this.connectionEstablishedTime = null;

        /** 音声解析サーバ再接続後の音声解析結果が音声解析を開始してから何ms後かを算出するために必要
         *  (音声解析サーバとの接続確立時刻 - 音声解析開始時刻)
         */
        this.offsetTime = null;

        /** WebAudioAPI関係 */
        /** @var AudioContext */
        this.audioContext = null;
        /** @var MediaStreamAudioSourceNode */
        this.audioSource = null;
        /** @var ScriptProcessorNode */
        this.audioProcessor = null;
        /** AudioContextのsampleRateが実際に取得したいSAMPLE_RATEの何倍かを表す */
        /** @var number */
        this.rate = null;

        /** APIサーバー接続関係 */
        /** @var RealTimeAudioRecognize */
        this.conn = null;

        /** 固定値 */
        // 音声解析APIの関係で16kHzでサンプリングする
        this.SAMPLE_RATE = 16000;
        this.API_SERVER_URL = 'wss://ik1-406-35452.vs.sakura.ne.jp/websocket/audio-recognize_old';
        // this.SAMPLING_BUFFER_SIZE = 16384;

        /** 実行者のみが行う コネクション後の初期化処理. **/
        this.initializeEventHandler = initializeEventHandler;

    }

    /**
     * 音声解析開始
     */
    async start() {
        console.log('realtime voice analysis start...');

        // 音声解析中かどうか
        this.isRunning = true;

        // 音声のMediaStreamを取得
        const stream = await this.getAudioStream();
        if (stream === null) throw false;

        // 音声のサンプリングを開始する
        this.startVoiceSampling(stream);

        // 音声解析サーバに接続する
        this.connectionVoiceAnalysisServer(stream);

        return performance.now();
    }

    /**
     * マイクの音声を取得
     * TODO: 新しいPromiseベースのAPIを使うため古いAPIのみ実装のブラウザ対応が必要
     */
    getAudioStream(){
        const mediaDevices = navigator.mediaDevices;
        return mediaDevices.getUserMedia({
            audio: true,
            video: false
        }).catch(err => {
            console.log('getUserMedia Error');
            console.log(err);
            return null;
        })
    }

    /**
     * 音声のサンプリングを開始する
     * @param stream
     */
    startVoiceSampling(stream){
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContext();
        this.audioSource = this.audioContext.createMediaStreamSource(stream);
        this.audioProcessor = this.audioContext.createScriptProcessor(0, 1, 1);
        this.audioSource.connect(this.audioProcessor);
    }

    /**
     * 音声のサンプリングを停止する
     */
    stopVoiceSampling(){
        return this.audioContext.close().then(_ => {
            this.audioProcessor.disconnect();
            this.audioSource.disconnect();
        });
    }

    /**
     * 音声解析サーバへの接続設定/接続を行う
     */
    connectionVoiceAnalysisServer(stream){
        // APIサーバーへの接続準備
        this.conn = new RealTimeAudioRecognize(realtimeRecognizeApiServerUrl);

        /**
         * 音声解析サーバへ接続完了
         */
        this.conn.onopen = (response) => {
        };

        // 文字起こし結果を格納するバッファ
        const transcribeResults = [];
    
        /**
         * 音声解析結果の受信時に実行
         * @param result
         */
        this.conn.onmessage = (result) => {
            // 種別を取り出す
            const type = result['type'];
            if(type == "handshake"){
                console.log("handshake:");
                console.log(result);
                // 文字起こし実行者の場合のみconversationIdを作成する
                if(this.speakerNo == STARTER_SPEAKER_NO){
                    // 音声解析実施ユーザー情報をconversationIdに含めるための処理
                    let userInfo = $("#staff_type").val() + String(('00000' + $("#staff_id").val()).slice( -5 )) + "CA"+ String(('00000' + $("#client_id").val()).slice( -5 )) + "_";
                    // 音声フィル名
                    let fileName = userInfo + result["uniqueSeed"];
                    // Amivoiceの新仕様で追加となったprefixを付与する
                    conversationId = result["conversationIdFirstChar"] + fileName;

                    this.initializeEventHandler(conversationId, result);

                    // 文字起こし開始前準備要求を実行する（同じconversationIdを使用するために、実行者がconversationIdを作成後に準備要求する）
                    sendRequestPrepareVoiceAnalysis(conversationId);
                    // サーバーで生成した通話開始時間を変数へ設定する
                    startConversationDateTimes[this.speakerNo] = result["outgoingDateTime"];
                    // 録音を開始する
                    recorder.start(fileName);
                }else{
                    // 音声解析実行者でない場合の処理
                    // 通話開始時間を音声実行解析者へ送信する
                    sendStartConversationDateTime(this.speakerNo, result["outgoingDateTime"]);
                }
                console.log("[speakerNo:"+this.speakerNo+"][conversationId:"+conversationId+"]");

                // 中間サーバーとamivoiceサーバーの接続を分けたので、中間サーバーとの接続完了後はamivoice接続を行う
                let req = {};
                req["type"] = "cmd_s";
                // 会話IDを設定する
                req["conversationId"] = conversationId;
                // チャネルごとに異なる数値を設定
                req["speakerLabel"] = this.speakerNo;
                // 電話システムがSIPの場合はCallIDを設定
                req["voiceid"] = conversationId + this.speakerNo;
                // 送信するデータをjson化する
                let reqJson = JSON.stringify(req);
                this.conn.send(reqJson);
            }else if(type == "message_S"){
                // sコマンド成功時
                console.log("successCommandS");
                // 初回接続時のコネクション確立時刻を記録
                if (this.recognizeStartTime === null) {
                    this.recognizeStartTime = result['established_time'];
                }
                // (コネクション確立時刻 - 音声認識開始時刻)を用いて再接続時の発話開始時間のオフセットとする
                this.connectionEstablishedTime = result['established_time'];
                this.offsetTime = (this.connectionEstablishedTime - this.recognizeStartTime);
                // 音声のサンプリング開始
                this.audioProcessor.addEventListener('audioprocess', (event) => {
                    if(!this.isMicOn()) return;

                    if (this.rate === null) {
                        this.rate = Math.round(this.audioContext.sampleRate / this.SAMPLE_RATE);
                        this.rate = this.rate === 0 ? 1 : this.rate;
                    }
                    const data = event.inputBuffer.getChannelData(0).filter((_, index) => {
                        return (index % this.rate) === 0;
                    }).slice();
                    const buffer = new ArrayBuffer(data.length * 2);
                    const view = new DataView(buffer);
                    this.floatTo16BitPCM(view, 0, data);
                    this.conn.send(buffer);
                });
                // 音声のサンプリング開始
                this.audioProcessor.connect(this.audioContext.destination);
            }else if(type == "message_Q"){
                // Qイベントを取得後、WebAPIのエンドポイントへデータをPOSTする
                // Qイベントを取得後の処理は、Amivoiceの仕様変更で不要となった
            } else if(type == "message_G1"){
                // sessionIdを変数へ保持する
                sessionId = result['sessionId'];
            } else if(type == "message_G2"){
                // 個別の感情解析のデータをDBに保持場合はここに記述する
            } else if(type == "message_A"){
                const text = result['text'];
                const displayText = `speaker${this.speakerNo}: ${text}`;
                const startTime = result['starttime'] + this.offsetTime;
                const endTime = result['endTime'] + this.offsetTime;
                if(text !== '') {
                    if(audioTextFlg){
                        // 文字起こし中の処理
                        const result = {
                            voice_analysis_start_time: this.recognizeStartTime,
                            established_time: this.connectionEstablishedTime,
                            start_time: startTime,
                            end_time: endTime,
                            speaker_no: this.speakerNo,
                            text: text,
                            display_text: displayText
                        }
                        this.receiveVoiceAnalysisEventHandler(this.targetPeerId, result);
                    }else{
                        // 文字起こし実行者の未実行
                        if(this.speakerNo == STARTER_SPEAKER_NO){
                            // 感情解析の場合は、文字データをバッファに貯める
                            transcribeResults.push({
                                text: displayText,
                                starttime: startTime,
                                endtime: endTime,
                                speakerNo: this.speakerNo
                            });
                        }
                    }
                }
            } else if(type == "message_e"){
                // 文字起こし実行者の未実行
                if(this.speakerNo == STARTER_SPEAKER_NO){
                    console.log("message_e:[sentimentAnalysisRegistFlg]"+sentimentAnalysisRegistFlg);
                    // 感情解析を終了した際にGET処理を行う
                    if(sentimentAnalysisRegistFlg){
                        // GET処理の完了で、感情解析登録フラグを落とす
                        sentimentAnalysisRegistFlg = false;
                        // eイベントを取得後、感情データをまとめて取得するためのメッセージ送信
                        let req = {};
                        req["type"] = "cmd_endpoint_get";
                        // 会話ごとのユニークなID
                        req["conversationId"] = conversationId;
                        // 会話評価を行う場合の必須項目（各話者の録音開始時間をカンマで繋ぐ）
                        req["startTime"] = startConversationDateTimes.join();
                        // 送信するデータをjson化する
                        let reqJson = JSON.stringify(req);
                        this.conn.send(reqJson);
                    }
                }
            }else if(type == "message_endpoint_get"){
                // 文字起こし実行者の未実行
                if(this.speakerNo == STARTER_SPEAKER_NO){
                    // 通話終了時に全ての感情解析結果取得後のDB登録処理
                    var egResult = JSON.parse(result["egResult"]["result"]);
                    // 感情解析に使用するデータをグローバル変数へ保持する
                    console.log("egResult");
                    console.log(egResult);
                    // 感情解析登録メッセージの非表示 // TODO: 確認完了後削除 setTimeOutで消える処理テストの際にコメントアウトする
                    $("#tmp_message_regist_sentiment_analysis").fadeOut();
                    // 感情解析データをDynamoに登録する
                    registSentimentToDynamo(egResult, transcribeResults);
                    // SpeakerNoとユーザーの紐づけ情報を作成する
                    let userAndSpeakerNoRelations = mcuUserAndSpeakerNoRelation();
                    // 感情解析データをmysqlに登録する
                    registConversationAggregate(egResult, userAndSpeakerNoRelations);
                }
            }
        };

        // 接続が閉じた時に実行
        this.conn.onclose = () => {
            //　音声認識中は再接続処理を行う
            if(this.isRunning){
                console.log("reconnecting...");
                // サンプリング停止
                this.stopVoiceSampling().then(_ => {
                    // ストリームが有効な場合は再接続
                    if(stream.active){
                        this.startVoiceSampling(stream);
                        this.connectionVoiceAnalysisServer(stream);
                    } else {
                        console.log("won't reconnecting because stream is not active");
                    }
                });
            }
        };

        // APIサーバーへ接続
        this.conn.connect();
    }

    /**
     * 音声解析停止
     */
    stop() {
        console.log('realtime recognize stop...');
        // 音声認識停止中
        this.isRunning = false;

        // サンプリング停止
        this.stopVoiceSampling().then(_ => {
            // サーバーへ停止要求を送信
            this.conn.end();
        });
    }

    /**
     * float -> 16bitPCMへ変換する関数(little endian)
     */
     floatTo16BitPCM(view, offset, audioWaveData){
        for (let i = 0; i < audioWaveData.length; i++ , offset += 2) {
            let s = Math.max(-1, Math.min(1, audioWaveData[i]));
            view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        }
    }
}
