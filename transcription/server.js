// 必要なパッケージを取得
const express = require("express");
const fs = require("fs");
const multer = require("multer");
const uuid = require("node-uuid");
const request = require("request");
const SpeechToText = require('./lib/ami_voice.js');

// Express Applicationを生成
const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

// アプリケーションの設定
const config = require("./config.json")[app.get("env")];
const CALLBACK_URL = config["callback_url"];
const SPEECH_TO_TEXT_API_ENDPOINT = config["speech_to_text_api_endpoint"];
const SPEECH_TO_TEXT_API_KEY = config["speech_to_text_api_key"];

// アプリケーションに必要なディレクトリ
const UPLOADS_DIR = config["uploads_dir"];
const WAV_DIR = config["wav_dir"];

// アプリケーションに必要なディレクトリの生成
const needDir = [UPLOADS_DIR, WAV_DIR];
needDir.forEach((dirPath) => {
  if(!fs.existsSync(dirPath)){
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

//wavファイルをuploadsに保存、fileNameを生成
//curl "localhost:80" -X POST -F data=@wav/ファイル名.wav
app.post("/", multer({ dest: UPLOADS_DIR }).single("data"),(req,res) => {
  const fileName = req.file.filename;
  res.json({
    name: `${fileName}`
  });
});

//生成されたfileNameを元に文字起こし
//curl "localhost:80/api/speechToText/ファイル名"
app.get("/api/speechToText/:filename/:id", (req, res) => {

  // statusId(処理の状況を問い合わせるID)を発行してレスポンスを返す
  const statusId = uuid.v1();
  res.end(("status code=" + statusId));

  // 音声認識に関する処理
  const sourceWavFilePath = UPLOADS_DIR + req.params.filename;
  const speechToText = new SpeechToText(SPEECH_TO_TEXT_API_ENDPOINT, SPEECH_TO_TEXT_API_KEY);
  speechToText.recognize(sourceWavFilePath).then(transcriptString => {
    try {
      const options = {
        url: CALLBACK_URL,
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        json: {
          text: transcriptString,
          id: req.params.id
        }
      };
      request.post(options, (e, res, body) => {
        console.log(`In server.js POST for CALLBACK_URL error: ${e}`);
        console.log('posting request finish');
      });
    } catch (e) {
      console.log(e);
    }
  });
});

// サーバー起動
app.listen(5000, () => {
  console.log("Listening on port 5000");
});