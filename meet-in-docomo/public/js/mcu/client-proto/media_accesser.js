'use strict';
const MediaAccesser = class {
  /**
   * コンストラクタ
   */
  constructor() {
    console.log('[MediaAccesser] init');
  }

  /**
   * ユーザーメディア取得
   * @param {Boolean} enableVideo         -ビデオを有効にするか
   * @param {Boolean} enableAudio         -オーディオを有効にするか
   * @param {Function} succeededCallback  -成功コールバック
   * @param {Function} failedCallback     -失敗コールバック
   */
  async getUserMedia(enableVideo, enableAudio, succeededCallback, failedCallback) {
    // オプション生成
    let options = {
      video: enableVideo,
      audio: enableAudio,
    };

    // ビデオが有効な場合は、オプションに詳細（width、height、fps）を追記する
    if (options.video) {
      let width = $('#input_camera_width').val();
      let height = $('#input_camera_height').val();
      let fps = $('#input_camera_fps').val();

      options.video = { 
        width: { min: width, max: width },
        height: { min: height, max: height },
        frameRate: fps,
      }
    }

    // 取得
    let media = null;
    try {
      media = await navigator.mediaDevices.getUserMedia(options);
    } catch(err) {
      console.error(`[MediaAccesser] getUserMedia failed: ${err}`);

      // 失敗コールバック
      if (failedCallback != null) {
        failedCallback();
      }

      return;
    }

    // 成功コールバック
    if (succeededCallback != null) {
      succeededCallback(media);
    }
  };

  /**
   * ディスプレイメディア取得
   * @param {Boolean} enableVideo         -ビデオを有効にするか
   * @param {Boolean} enableAudio         -オーディオを有効にするか
   * @param {Function} succeededCallback  -成功コールバック
   * @param {Function} failedCallback     -失敗コールバック
   */
  async getDisplayMedia(enableVideo, enableAudio, succeededCallback, failedCallback) {
    // オプション生成
    let options = {
      video: enableVideo,
      audio: enableAudio,
    };

    // 取得
    let media = null;
    try {
      media = await navigator.mediaDevices.getDisplayMedia(options);
    } catch(err) {
      console.warn(`[MediaAccesser] getDisplayMedia failed: ${err}`);

      // 失敗コールバック
      if (failedCallback != null) {
        failedCallback();
      }

      return;
    }

    // 成功コールバック
    if (succeededCallback != null) {
      succeededCallback(media);
    }
  };
}
