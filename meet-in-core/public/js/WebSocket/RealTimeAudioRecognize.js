/**
 * 音声認識サーバ接続用のclass
 * 制限事項:
 * - 音声:16kHz, -32768
 * - データ範囲: -32768〜32767(WAVE形式)
 */
class RealTimeAudioRecognize {
    constructor(serverUrl) {
        /**
         * 接続するサーバーのurl
         */
        this.serverUrl = serverUrl;

        /**
         * WebSocketのインスタンス
         */
        this.ws = null;

        /**
         * **********connect()前に設定すること**********
         * クライアント <-> 中継サーバー <-> 音声認識サーバーの接続が完了して
         * 音声認識の準備が整った時に実行する関数()
         */
        this.onopen = () => {};

        /**
         * **********connect()前に設定すること**********
         * 音声認識の結果が返って来た時に実行する関数
         * 設定する関数は設定する関数は音声認識結果のテキストと発話開始時間を要素とするObjectを一つ受け取る関数とすること
         */
        this.onmessage = () => {};

        /**
         * **********connect()前に設定すること**********
         * 中家サーバーとの接続が閉じた時に実行する関数
         */
        this.onclose = () => {};

        /**
         * **********connect()前に設定すること**********
         * 中継サーバーとの接続エラー時に実行する関数
         */
        this.onerror = () => {};
    }

    /**
     * 音声認識サーバーに接続
     */
    connect() {
        const ws = new WebSocket(this.serverUrl);
        this.ws = ws;

        ws.onopen = (event) => {
            //
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            const code = data['code'];
            const text = data['text'];
            const startTime = data['starttime'];
            const endTime = data['endtime'];

            switch (code) {
                case 'handshake':
                    // [client < - > relay < - > amivoice]のws接続成功時
                    this.onmessage({type : "handshake", uniqueSeed : data.uniqueSeed, outgoingDateTime : data.outgoingDateTime, conversationIdFirstChar : data.conversationIdFirstChar});
                    break;
                case 'S':
                    console.log('connection success');
                    // [relay < - > amivoice]の準備完了時に実行する関数
                    this.onmessage({type : "message_S", established_time: data['established_time']});
                    // 準備完了時に実行する関数
                    // this.onopen({established_time: data['established_time']});
                    break;
                case 'Q':
                    // sコマンド送信後に受け取るQイベント
                    this.onmessage({type : "message_Q", qId : data.qId});
                    break;
                case 'G1':
                    // 1回目のGレスポンス（最後にまとめて音声分析を行うためのsessionId取得）
                    this.onmessage({type : "message_G1", sessionId: data.sessionId});
                    break;
                case 'G2':
                    // 2回目以降のGレスポンス（会話中の音声分析データ）
                    this.onmessage({type : "message_G2", sentimentAnalysis: data.sentimentAnalysis});
                    break;
                case 'A':
                    this.onmessage({type : "message_A", text: text, starttime: startTime, endTime: endTime});
                    break;
                case 'e':
                    this.onmessage({type : "message_e"});
                    break;
                case 'endpoint_get':
                    // 通話終了時に全ての音声分析結果取得後のイベント
                    this.onmessage({type : "message_endpoint_get", egResult : data});
                    break;
            }
        };

        ws.onclose = (event) => {
            console.log('close');
            this.onclose();
        };

        ws.onerror = (event) => {
            console.log('error');
            console.log(event);
            this.onerror();
        };
    }

    /**
     * 音声データを送信
     */
    send(data) {
        // WebSocketのコネクションが切断済みでなければ中継サーバーへ送信
        if(this.ws.readyState !== 3) {
            this.ws.send(data);
        }
    }

    /**
     * 音声認識終了を音声認識サーバーへ通知
     */
    end() {
        // WebSocketのコネクションが切断済みでなければ終了を中継サーバーへ通知
        if(this.ws.readyState !== 3){
            this.ws.send('e');
        }
    }
}