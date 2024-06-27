'use strict';
const Publisher = class {
  /**
   * コンストラクタ
   */
  constructor() {
    console.log('[Publisher] init');

    this.CANVAS_SPEAKING_FRAME_COLOR = 'rgb(255, 255, 0)';   // 発言中のキャンバスの枠の色
    this.CANVAS_SPEAKING_FRAME_WIDTH = 6;                    // 発言中のキャンバスの枠の太さ

    this.video = document.getElementById('local_stream_camera');    // 映像ストリームの生成に使用するvideoタグ
    this.canvas = document.getElementById('local_stream_canvas');   // 映像ストリームの生成に使用するcanvasタグ
    this.context = this.canvas.getContext('2d');                    // 映像ストリームの生成に使用するcanvasタグのコンテキスト

    this.videoPublishClient = null;
    this.audioPublishClient = null;
    this.sharescreenPublishClient = null;

    this.videoMedia = null;
    this.audioMedia = null;
    this.sherescreenMedia = null;
    this.canvasStream = null;

    this.videoMainView = undefined;
    this.audioMainView = undefined;

    this.videoWidth = 0;      // 映像の幅
    this.videoHeight = 0;     // 映像の高さ
    this.canvasWidth = 0;     // キャンバスの幅
    this.canvasHeight = 0;    // キャンバスの高さ
    
    this.updateCanvasStreamFuncPtr = null;        // キャンバス更新処理のbind関数
    this.updateCanvasStreamRequestId = null;      // キャンバス更新処理のリクエストID
    this.observeChangeVolumeFuncPtr = null;       // 音声監視処理のbind関数
    this.observeChangeVolumeRequestId = null;     // 音声監視処理のリクエストID
    
    this.isSpeaking = false;                // 発言中フラグ
    this.scaleResolutionDown = false;       // 映像の解像度を下げるかフラグ（スポットライト機能が有効、かつ発音していない場合）
    this.oldScaleResolutionDown = false;    // １つ前の映像の解像度を下げるかフラグ
  }

  /**
   * 終了
   */
  finalize() {
    // キャンバスの更新停止
    if (this.updateCanvasStreamRequestId != null) {
      cancelAnimationFrame(this.updateCanvasStreamRequestId);
    }
    // ボリュームの監視停止
    if (this.observeChangeVolumeRequestId != null) {
      cancelAnimationFrame(this.observeChangeVolumeRequestId);
    }

    // 映像メディア停止
    if (this.videoMedia != null) {
      this._stopMedia(this.videoMedia);
      this.videoMedia = null;
    }

    // 音声メディアを停止
    if (this.audioMedia != null) {
      this._stopMedia(this.audioMedia);
      this.audioMedia = null;
    }

    // 画面共有メディアを停止
    if (this.sherescreenMedia != null) {
      this._stopMedia(this.sherescreenMedia);
      this.sherescreenMedia = null;
    }

    // フラグをリセット
    this.isSpeaking = false;
    this.scaleResolutionDown = false;
    this.oldScaleResolutionDown = false;
  }

  /**
   * 映像ストリームを公開
   * @param {Client} client   -配信先のルームに入室済みのクライアント
   */
  publishVideoStream(client) {
    console.log('[Publisher] publishVideoStream');

    // 映像のメタデータの読み込み時のリスナー登録
    // （メタデータ読み込みが終わってから公開処理を行う）
    this.video.addEventListener('loadedmetadata', (event) => {
      // キャンバスのストリーム生成
      this.canvasStream = this._createCanvasStream();

      // 公開
      // ホストの場合は、main（ホスト用映像）とsub（ゲスト用映像）に配信
      // ゲストの場合は、main（ホスト用映像）に映像のみ配信
      let publishOptions;
      // let publishOptions = {
      //   video:[
      //   {rid: 'q', active: true, scaleResolutionDownBy: 4.0},
      //   {rid: 'h', active: true, scaleResolutionDownBy: 2.0},
      //   {rid: 'f', active: true, scaleResolutionDownBy: 1.0},
      //   ]
      // };

      // メインのレイアウト
      this.videoMainView = getUseMainView();
      console.log(`--------->this.videoMainView = ${this.videoMainView}`)
      client.publish(this.canvasStream, 'video', this.videoMainView, publishOptions);
      if(isHost()) {
        client.publish(this.canvasStream, 'video', 'sub', publishOptions);
      }

      // 公開に使用したクライアントを保存
      this.videoPublishClient = client;
    }, {
      once: true
    });

    // ニュース映像を使用するかのチェックを確認して、使用するメディアを判断
    let useNewsMovie = $('input[name=check_use_news]:checked').val()
    if (!useNewsMovie) {
      // 映像メディア取得
      mediaAccesser.getUserMedia(true, false, (media) => {
        // 映像をvideo表示
        this.video.srcObject = media;
        // 取得したメディアを保存しておく
        this.videoMedia = media;
      });
    }
    else {
      // ニュース映像をvideo表示
      this.video.src='https://delphinus63.sense.co.jp/news2.mp4';
      this.video.controls = true;
      this.video.loop = true;
      this.video.play();
    }
  }

  /**
   * 映像ストリームの公開を停止
   */
  stopPublishVideoStream() {
    console.log('[Publisher] stopPublishVideoStream');

    // キャンバス更新処理を停止
    if (this.updateCanvasStreamRequestId != null) {
      cancelAnimationFrame(this.updateCanvasStreamRequestId);
    }

    // 公開を停止
    if (this.videoPublishClient != null) {
      this._stopPublish(this.videoPublishClient, 'video', this.videoMainView);
      this._stopPublish(this.videoPublishClient, 'video', 'sub');
      this.videoPublishClient = null;
    }

    // 映像メディアを停止
    if (this.videoMedia != null) {
      this._stopMedia(this.videoMedia);
      this.videoMedia = null;
    }

    this.canvasStream = null;

    // video停止
    $('#local_stream_camera')[0].srcObject = null;
  }

  /**
   * 音声ストリームを公開
   * @param {Client} client   -配信先のルームに入室済みのクライアント
   */
  publishAudioStream(client) {
    console.log('[Publisher] publishAudioStream');

    // 音声メディア取得
    mediaAccesser.getUserMedia(false, true, (media) => {
      // ボリューム変更のリスナー登録
      this._setChangeVolumeListener(media, (volume) => {
        // ボリュームが閾値を超えてたら発言中とみなす
        this.isSpeaking = volume > $('#input_spotlight_on_volume').val();
      });
      
      // 公開
      this.audioMainView = getUseMainView();
      let publishOptions;
      client.publish(media, 'audio', this.audioMainView, publishOptions);
      client.publish(media, 'audio', 'sub', publishOptions);

      // 取得したメディアを保存しておく
      this.audioMedia = media;

      // 公開に使用したクライアントを保存
      this.audioPublishClient = client;
    });
  }

  /**
   * 音声ストリームの公開を停止
   */
  stopPublishAudioStream() {
    console.log('[Publisher] stopPublishAudioStream');

    // ボリュームの監視を停止
    if (this.observeChangeVolumeRequestId != null) {
      cancelAnimationFrame(this.observeChangeVolumeRequestId);
    }

    // 公開を停止
    if (this.audioPublishClient != null) {
      this._stopPublish(this.audioPublishClient, 'audio', this.audioMainView);
      this._stopPublish(this.audioPublishClient, 'audio', 'sub');
      this.audioPublishClient = null;
    }

    // 音声メディアを停止
    if (this.audioMedia != null) {
      this._stopMedia(this.audioMedia);
      this.audioMedia = null;
    }

    // フラグリセット
    this.isSpeaking = false;
    this.scaleResolutionDown = false;
  }

  /**
   * 画面共有ストリームを公開
   * @param {Client} client   -配信先のルームに入室済みのクライアント
   */
  publishSharescreenStream(client) {
    console.log('[Publisher] publishSharescreenStream');

    // 映像メディア取得
    mediaAccesser.getDisplayMedia(true, false, (media) => {
      // 画面共有が停止された時の処理を登録
      media.getVideoTracks()[0].onended = () => {
        // ラヂオをoffに設定する
        $('input[name="radio_sharescreen_state"][value="off"]').prop('checked', true).trigger('change');
        // ゲストの場合は、挙手ダイアログを閉じる
        if (isGuest()) {
          dialogLiftuphand.hide();
        }
      };

      // 画面共有をvideo表示
      $('#local_stream_sharescreen')[0].srcObject = media;

      // 公開
      let publishOptions;
      client.publish(media, 'video', 'main', publishOptions);

      // 取得したメディアを保存しておく
      this.sherescreenMedia = media;

      // 公開に使用したクライアントを保存
      this.sharescreenPublishClient = client;
    }, () => {
      // 画面共有のメディア取得に失敗

      // 生成に失敗した場合も、ラヂオをoffに設定する（ただし、この場合はtriggerを発火しない）
      $('input[name="radio_sharescreen_state"][value="off"]').prop('checked', true);
      // ゲストの場合は、挙手ダイアログを閉じる
      if (isGuest()) {
        dialogLiftuphand.hide();
      }
    });
  }

  /**
   * 画面共有ストリームの公開を停止
   */
  stopPublishSharescreenStream() {
    console.log('[Publisher] stopPublishSharescreenStream');

    // 公開を停止
    if (this.sharescreenPublishClient != null) {
      this._stopPublish(this.sharescreenPublishClient, 'video', 'main');
      this.sharescreenPublishClient = null;
    }

    // 画面共有メディアを停止
    if (this.sherescreenMedia != null) {
      this._stopMedia(this.sherescreenMedia);
      this.sherescreenMedia = null;
    }

    // video停止
    $('#local_stream_sharescreen')[0].srcObject = null;
  }

  /**
   * メインビュー切り替え
 * @param {String} useMainView    -使用するビュー
   */
  switchMainView(useMainView) {
    // 映像
    if (this.videoPublishClient != null) {
      // 公開一時停止
      this._stopPublish(this.videoPublishClient, 'video', this.videoMainView);
      // 再公開
      this.videoMainView = useMainView;
      let publishOptions
      this.videoPublishClient.publish(this.canvasStream, 'video', this.videoMainView, publishOptions);
    }

    // 音声
    if (this.audioPublishClient != null) {
      // 公開一時停止
      this._stopPublish(this.audioPublishClient, 'audio', this.audioMainView);
      // 再公開
      this.audioMainView = useMainView;
      let publishOptions
      this.audioPublishClient.publish(this.audioMedia, 'audio', this.audioMainView, publishOptions);
    }
  }

  /**
   * ストリームの公開停止
   * @param {Object} roomInfo   -ルーム情報
   */
  stopPublish(roomInfo, label, view) {
    // ストリームを公開していない場合は何もしない
    if (!roomInfo.client.isPublishing(label, view)) {
      return;
    }

    // 公開停止
    roomInfo.client.stopPublish(label, view);
  };

  /**
   * スポットライトの状態変更
   * @param {Boolean} isSpotlightOn   -スポットライトがONになっているか
   */
  changeSpotlightState(isSpotlightOn) {
    this.scaleResolutionDown = isSpotlightOn;
  }

  /**
   * ストリームの公開停止
   * @param {Client} client   -クライアント
   */
  _stopPublish(client, label, view) {
    // ストリームを公開していない場合は何もしない
    if (!client.isPublishing(label, view)) {
      return;
    }

    // 公開停止
    client.stopPublish(label, view);
  };

  /**
   * メディア停止
   * @param {Object} media   -メディア
   */
  _stopMedia(media) {
    media.getTracks().forEach((track) => {
      track.stop();
    });
  }

  /**
   * キャンバスのストリーム生成処理
   */
  _createCanvasStream() {
    /**
     * キャンバスの更新処理
     */
    function updateCanvasStream() {
      // スポットライトが有効、且つ発言していない場合は、解像度を下げる
      this.oldScaleResolutionDown = this.scaleResolutionDown;
      this.scaleResolutionDown = isSpotlightOn() && (!this.isSpeaking);
      
      // 解像度切り替え
      if (this.oldScaleResolutionDown != this.scaleResolutionDown) {
        this.canvasWidth = this.videoWidth;
        this.canvasHeight = this.videoHeight;
        if (this.scaleResolutionDown) {
          this.canvasWidth /= 5;
          this.canvasHeight /= 5;
        }

        // キャンバスサイズ変更
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;
      }

      // video映像を描画
      this.context.drawImage(this.video, 0, 0, this.canvasWidth, this.canvasHeight);

      // 発言中の場合は枠線描画
      if (this.isSpeaking) {
        // 線の設定
        this.context.strokeStyle = this.CANVAS_SPEAKING_FRAME_COLOR;
        this.context.lineWidth = this.CANVAS_SPEAKING_FRAME_WIDTH;

        // 線描画
        this.context.strokeRect(
          0 + (this.CANVAS_SPEAKING_FRAME_WIDTH / 2),
          0 + (this.CANVAS_SPEAKING_FRAME_WIDTH / 2),
          this.canvasWidth - this.CANVAS_SPEAKING_FRAME_WIDTH,
          this.canvasHeight - this.CANVAS_SPEAKING_FRAME_WIDTH);
      }

      // windowに更新リクエスト
      this.updateCanvasStreamRequestId = requestAnimationFrame(this.updateCanvasStreamFuncPtr);
    }

    // キャンバスのサイズを映像サイズに合わせる
    this.videoWidth = this.video.videoWidth;
    this.videoHeight = this.video.videoHeight;
    this.canvasWidth = this.videoWidth;
    this.canvasHeight = this.videoHeight;

    // キャンバスのサイズ設定
    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;

    // windowのアニメーション更新のなかでキャンバスの更新処理を実行する
    this.updateCanvasStreamFuncPtr = updateCanvasStream.bind(this);
    this.updateCanvasStreamRequestId = requestAnimationFrame(this.updateCanvasStreamFuncPtr);
    
    let cameraFps = $('#input_camera_fps').val();
    return this.canvas.captureStream(cameraFps);
  }

  /**
   * ボリューム変更のリスナー登録
   * @param {Media} media         -メディア
   * @param {Function} listener   -リスナー
   */
  _setChangeVolumeListener(media, listener) {
    /**
     * ボリューム監視処理
     */
    function observeChangeVolume(listener) {
      // ボリューム取得処理
      function getVolume() {
        var bit8 = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(bit8);
      
        return bit8.reduce(function(previous, current) {
          return previous + current;
        }) / analyser.frequencyBinCount;
      };
      
      let volume = getVolume();

      // 通知
      if (listener != null) {
        listener(volume);
      }

      // windowに更新リクエスト
      this.observeChangeVolumeRequestId = requestAnimationFrame(this.observeChangeVolumeFuncPtr);
    }
  
    // AudioContextからAnalyserNodeを取得(分析情報を提供するAPI)
    // https://developer.mozilla.org/ja/docs/Web/API/AnalyserNode
    let AudioContext = window.AudioContext || window.webkitAudioContext;  // Safari and old versions of Chrome
    let audioContext = new AudioContext();
    let analyser = audioContext.createAnalyser();
    analyser.fftSize = 128;   // 周波数領域を決定するために使われているサイズ

    // AudioContextを利用してMediaStreamAudioSourceNodeを取得
    let source = audioContext.createMediaStreamSource(media);
    // AudioSourceNodeを基にAnalyserNodeを利用して音量を取得
    source.connect(analyser);

    // windowのアニメーション更新のなかでボリュームの監視処理を実行する
    this.observeChangeVolumeFuncPtr = observeChangeVolume.bind(this, listener);
    this.observeChangeVolumeRequestId = requestAnimationFrame(this.observeChangeVolumeFuncPtr);
  }
}
