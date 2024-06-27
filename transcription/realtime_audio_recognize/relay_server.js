// 必要なパッケージを取得
const WebSocket = require('ws');
const cluster = require('cluster');
const cpuNum = 2;

// アプリケーションの設定
const node_env = process.env.NODE_ENV || 'development';
const config = require('./config.json')[node_env];
const PORT = config['port'];
const AUDIO_FORMAT = config['audio_format'];
const ENGINE = config['engine'];
const API_KEY = config['api_key'];
const API_ENDPOINT = config['api_endpoint'];

if(cluster.isMaster) {
    for(let i = 0; i < cpuNum; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker) => {
      console.log('worker ' + worker.process.pid + ' died');
      cluster.fork();
    });
} else {
    // WebSocketの中継サーバーを起動
    const wss = new WebSocket.Server({port: PORT});

    wss.on('connection', (connection, _req) => {
        console.log('connection');

        /**
         * 中継サーバー <-> 音声認識サーバー
         */
        const wsc = new WebSocket(API_ENDPOINT);
        wsc.onopen = (event) => {
            // console.log('open server <-> ami voice');
            // 音声認識開始
            wsc.send(`s ${AUDIO_FORMAT} ${ENGINE} authorization=${API_KEY}`);
        }

        wsc.onmessage = (event) => {
            // console.log('message server <-> ami voice');
            // 音声認識結果をクライアントへ送信
            const data = event.data;
            const code = data.slice(0, 1);
            const errorMessage = data.slice(1);

            switch (code) {
                case 's':
                    // error_messageがあれば出力する
                    if(data.length > 1){
                        const errorMessage = data.slice(1);
                        console.log(errorMessage);
                    }
                    //　音声認識準備完了応答を返す
                    const startJson = {code: 'S', established_time: new Date().getTime()};
                    connection.send(JSON.stringify(startJson));
                    break;

                case 'A':
                    // 音声認識結果を返す
                    const result = JSON.parse(data.slice(1));
                    console.log(result);
                    const recognized = result['text'];
                    const startTime = result['results'][0]['starttime'];
                    const resultJson = {
                        code: 'A',
                        text: recognized,
                        starttime: startTime
                    };
                    connection.send(JSON.stringify(resultJson));
                    break;
                case 'p':
                    // pはエラーの時しか返さないのでifのチェックは無し
                    const errorMessage = data.slice(1);
                    console.log(errorMessage);
                case 'e':
                    // error_messageがあれば出力する
                    if(data.length > 1){
                        const errorMessage = data.slice(1);
                        console.log(errorMessage);
                    }
            }
        }

        wsc.onclose = (event) => {
            // console.log('close server <-> ami voice');
            // 音声認識サーバーとの接続が切れた時は接続を切る
            connection.close();
        }

        wsc.onerror = (event) => {
            // console.log('error server <-> ami voice');
            // 音声認識サーバーとの接続が切れた時は接続を切る
            connection.close();
        }

        /**
         * クライアント <-> 中継サーバー
         */
        connection.on('message', (data) => {
            // console.log('message client <-> server');
            // クライアントからのデータを音声認識サーバーへ送信
            const dataType = typeof data;
            const cmd = (dataType === 'string') ? data : Buffer.concat([Buffer.from('p'), data]);
            wsc.send(cmd);
        });

        connection.on('close', (event) => {
            // console.log('close client <-> server');
            console.log(event);
            wsc.close();
        });

        connection.on('error', (event) => {
            // console.log('error client <-> server');
            console.log(event);
            wsc.close();
        });
    });
}
