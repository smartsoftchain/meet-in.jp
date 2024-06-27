const fs = require('fs');
const WebSocketClient = require('websocket').client;
const Promise = require("promise");
const connectionEngine = '-a-general';
const audioFormat = '16K';
const BUFFER_SIZE = 1024;

module.exports = class SpeechToText {
  /**
   * @param {*} apiEndPoint
   * @param {*} apiKey
   */
  constructor(apiEndPoint, apiKey){
    this.apiEndPoint = apiEndPoint;
    this.apiKey = apiKey;
  }

    /**
   * wavFilePathで指定されたwavファイルを全て音声認識する
   * @param {String} wavFilePath
   * @return {Promise<String>}
   */
  recognize(wavFilePath) {
    const apiEndPoint = this.apiEndPoint;
    const apiKey = this.apiKey;

    return new Promise((resolve, reject) => {
      // 音声認識開始
      const client = new WebSocketClient();
      const textList = [];
      const errorList = [];
      let startCount = 0; // Sイベントパケットの数(発話区間の検出が行われた数)
      let answerCount = 0; // Aイベントパケットの数(認識結果が返ってきた数)

      /**
       * WebSocketの各種イベントに対する処理を定義
       */
      client.on('connect', (connection) => {
        // 音声認識開始コマンド(s audio_format grammer_file_name appkey /sコマンドパケット)
        connection.sendUTF(`s ${audioFormat} ${connectionEngine} authorization=${apiKey}`);
        
        // メッセージを受信時の動作
        connection.on('message', (message) => {
          const packetType = message['utf8Data'].substr(0,1);
          
          // WebSocket接続完了時
          if(packetType === "s"){
            // 音声をストリームで読み込み,音声認識サーバへ送信
            const audioStream = fs.createReadStream(wavFilePath, {
              highWaterMark: BUFFER_SIZE // 一度に取得するbyte数
            });

            // 音声を小分けで送信
            audioStream.on('data', (chunk) => {
                // console.log('audio data send!!');
                const sendData = Buffer.concat([Buffer.from('p'), chunk]);
                connection.send(sendData);
            });

            //　音声送信完了
            audioStream.on('end', () => {
                // console.log('audio send end!!');
                connection.sendUTF("e");
            });
          }

          // 発話区間が音声認識サーバー側に認識されたという応答
          if(packetType === 'S'){
            startCount++;
          }

          // 音声認識結果受信時
          if(packetType === 'A'){
            answerCount++;
            const msg = JSON.parse(message['utf8Data'].slice(1, -1).trim());
            const resCode = msg['code'];
            const errorMessage = msg['message'];
            const text = msg['text']
            if(resCode === '' && errorMessage === '' && text !== ''){
                // console.log(text);
            } else {
                // console.log(errorMessage);
            }
            textList.push(text);
            errorList.push(errorMessage);
          }

          // 認識された発話区間の数だけ認識結果が返ってきた時にコネクションを閉じる
          if(startCount === answerCount && startCount !== 0 && answerCount !== 0){
            connection.close();
          }
        });

        // 接続を閉じる時の動作
        connection.on('close', () => {
          // console.log('connection close!');
          // console.log(textList);
          // 音声認識が完了したテキストを返す
          resolve(textList.join("\n"));
        });

        // 接続エラー時の動作
        connection.on('error', (error) => {
          console.log('websocket error!');
          console.log(error);
          reject(error);
        });
      });
      // 音声認識サーバに接続
      client.connect(apiEndPoint);
    });
  }
}