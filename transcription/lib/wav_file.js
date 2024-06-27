const fs = require("fs");

module.exports = class WavFile {
  wavFilePath; // wavファイルのPATH
  wavFileName; // PATHからファイルの名前だけ取り出したもの

  constructor(wavFilePath) {
    this.wavFilePath = wavFilePath;
    this.wavFileName = this.getFileNameFromPath(wavFilePath);
  }

  /**
   * PATHからファイル名を抜き出す
   * @param {String} path
   * @return {String} ファイル名
   */
  getFileNameFromPath(path) {
    return path.split("/").pop();
  }

  /**
   * wavファイルをfileSizeずつに分割する
   * @param {String} destinataion 分割後のファイルの保存先ディレクトリ
   * @param {Number} bufferSize 一度に読み込むサイズ(byte)
   * @param {Number} fileSize 分割後のファイルサイズ(byte)
   * @return {Promise}
   */
  divideWavFile(destination, bufferSize, fileSize) {
    // destinationの最後に/が無い場合は追加する
    if (destination.slice(-1) !== "/") {
      destination += "/";
    }

    return new Promise((resolve, reject) => {
      const readStream = fs.createReadStream(this.wavFilePath, {
        highWaterMark: bufferSize // 一度に取得するbyte数
      });

      // 本処理内で可変となる状態を定義
      let count = 0;
      let fileHeader;
      let writeStream;
      let index = 0;
      const generatedFilePaths = [];

      const sourceFileName = this.wavFileName.replace(".wav", "");

      readStream.on("data", chunk => {
        // ファイルヘッダーを取得
        if (count == 0) {
          fileHeader = Buffer.from(chunk.slice(0, 44)); // ファイルヘッダの部分だけ取り出す
          fileHeader.writeInt32LE(fileSize - 8, 4); // チャンクサイズ(これ以降のファイルサイズ)
          fileHeader.write("data", 36, 4); // サブチャンク識別子
          fileHeader.writeInt32LE(fileSize - 44, 40); // 波形データのバイト数(波形データ1点につき16bitなのでデータの数 * 2となっている)
        }

        // 最初とファイルの分割の区切りに達した時に実行
        const nextIndex = Math.floor(count / fileSize);
        if (nextIndex > index || count == 0) {
          // ファイルサイズの上限毎にストリームを新規作成
          index = nextIndex;
          const writeFilePath =
            destination +
            sourceFileName +
            "_" +
            index +
            ".wav";
          writeStream = fs.createWriteStream(writeFilePath);
          generatedFilePaths.push(writeFilePath);

          // ファイルヘッダを先頭に入れてからchunkを挿入
          if (count == 0) {
            // ファイルヘッダの書き換え
            chunk.writeInt32LE(fileSize - 8, 4); // チャンクサイズ(これ以降のファイルサイズ)
            chunk.write("data", 36, 4); // サブチャンク識別子
            chunk.writeInt32LE(fileSize - 44, 40); // 波形データのバイト数(波形データ1点につき16bitなのでデータの数 * 2となっている)
            writeStream.write(chunk);
          } else {
            writeStream.write(fileHeader);
            writeStream.write(chunk);
          }
        } else {
          writeStream.write(chunk);
        }
        // 読み込んだbyte数を計算する用途
        count += chunk.length;
      });

      // ストリームを読み込み終わったら
      readStream.on("end", () => {
        // ファイルが完全に書き込まれてから終了したいのでwriteStreamにfinishイベントリスナーを設定
        // 最後に作成したファイルだけ検知したいのでreadStreamが終了した時に設定
        writeStream.on("finish", () => {
          resolve(generatedFilePaths);
        });
        // todo:余った分は0で埋める(Watsonの用途では不要なのでコメントアウト)
        writeStream.end();
      });
    });
  }
};