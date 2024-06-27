const fs = require("fs");
const Promise = require("promise");
const SpeechToTextV1 = require("ibm-watson/speech-to-text/v1");
const { IamAuthenticator } = require("ibm-watson/auth");

module.exports = class SpeechToText {
  apiEndPoint; 
  apiKey; 
  /**
   * @param {String} apiEndPoint 
   * @param {String} apiKey 
   */
  constructor(apiEndPoint, apiKey){
    this.apiEndPoint = apiEndPoint;
    this.apiKey = apiKey;
  }
  /**
   * wavFilePathsで指定されたwavファイルを全て音声認識する
   * @param {Array<String>} wavFilePaths
   * @param {Boolean} speakerLabel
   * @return {Promise<String>}
   */
  recognize(wavFilePaths, speakerLabel = false) {
    const apiKey = this.apiKey;
    const apiEndPoint = this.apiEndPoint;
    const speechToText = new SpeechToTextV1({
      authenticator: new IamAuthenticator({ apikey: apiKey }),
      url: apiEndPoint,
      maxContentLength: Infinity
    });
    return new Promise((resolve, reject) => {
      const transcriptPromiseList = wavFilePaths.map(wavFilePath => {
        return new Promise((resolve, reject) => {
          const params = {
            audio: fs.createReadStream(wavFilePath), //audioは、読み込みたいファイルがある場所を指定して変換する
            model: "ja-JP_NarrowbandModel", //日本語の認識モデルを使用
            contentType: "audio/wav", // 送信するファイルはwav
            transferEncoding: "chunked",
            inactivityTimeout: 60, // -1で無制限の無音を許可
            speakerLabels: true // 話者認識を行う
          };

          speechToText.recognize(params, (error, transcript) => {
            console.log(`In SpeechToText.recognize error: ${error}`);
            try {
              const timestamps = transcript["result"]["results"].reduce(
                (acc, result) => {
                  return acc.concat(result["alternatives"][0]["timestamps"]);
                },
                []
              );

              const speakerTalks = transcript["result"]["speaker_labels"].map(
                (speakerLabel, index) => {
                  return {
                    speaker: speakerLabel["speaker"],
                    talk: timestamps[index][0]
                  };
                }
              );

              const resultStrings = transcript["result"]["results"]
                .map(result => {
                  return result["alternatives"][0]["transcript"];
                })
                .join("\n");

              resolve({
                speaker_talk: speakerTalks,
                full_text: resultStrings
              });
            } catch (e) {
              console.log(error);
              resolve({
                speaker_talk: [
                  {
                    speaker: 99,
                    talk: "**********音声認識出来ませんでした**********"
                  }
                ],
                full_text: "**********音声認識出来ませんでした**********"
              });
            }
          });
        });
      });

      Promise.all(transcriptPromiseList).then(speakerTalks => {
        if (speakerLabel) {
          const flatSpeakerTalks = speakerTalks.reduce((acc, speakerTalk) => {
            return acc.concat(speakerTalk["speaker_talk"]);
          }, []);
          const transcriptString = this.formatSpeakerTalk(flatSpeakerTalks);
          resolve(transcriptString);
        } else {
          const fullText = speakerTalks
            .map(speakerTalk => {
              return speakerTalk["full_text"];
            })
            .join("");
          resolve(fullText);
        }
      });
    });
  }

  /**
   * 連続したspeakerのtalkを繋げて出力する
   * @param {[{speaker: Number, talk: String}]} speakerTalks
   */
  formatSpeakerTalk(speakerTalks) {
    if (speakerTalks.length == 0) return "";
    const concatSpeakerTalk = speakerTalks.reduce(
      (acc, speakerTalk, index) => {
        if (acc["nowSpeaker"]["speaker"] == speakerTalk["speaker"]) {
          if (index == speakerTalks.length - 1) {
            acc["result"].push({
              speaker: speakerTalk["speaker"],
              talk: acc["nowSpeaker"]["talk"] + speakerTalk["talk"]
            });
          }
          return {
            nowSpeaker: {
              speaker: speakerTalk["speaker"],
              talk: acc["nowSpeaker"]["talk"] + speakerTalk["talk"]
            },
            result: acc["result"]
          };
        } else {
          acc["result"].push(acc["nowSpeaker"]);
          if (index == speakerTalks.length - 1) {
            acc["result"].push(speakerTalk);
          }
          return { nowSpeaker: speakerTalk, result: acc["result"] };
        }
      },
      { nowSpeaker: { speaker: "", talk: "" }, result: [] }
    );

    // 最初の要素は不要なので捨てる
    concatSpeakerTalk["result"].shift();
    const resultList = concatSpeakerTalk["result"].map(result => {
      return `speaker${result["speaker"]} : ${result["talk"]}`;
    });
    return resultList.join("\n");
  }
};