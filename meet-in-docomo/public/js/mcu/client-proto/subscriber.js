'use strict';
const Subscriber = class {
  /**
   * コンストラクタ
   */
  constructor() {
    console.log('[Subscriber] init');
  }

  /**
   * 映像ストリームの受信申し込み
   * @param {Client} client         -配信元のルームに入室済みのクライアント
   * @param {String} useMainView    -使用するビュー
   */
  subscribeCameraAndMic(client, useMainView) {
    console.log('[Subscriber] subscribeCameraAndMic');

    // カメラ映像＆音声用のストリームの受信申し込み
    // ビューは、ホストの場合は、main
    // ゲストの場合は、sub
    let view;
    if (isHost()) {
      view = useMainView;
    }
    else {
      view = 'sub';
    }
    
    // 映像ストリームの受信申し込み
    let subscribeOptions;
    // subscribeOptions = {
    //   video:{
    //   rid: 'q'
    //   }
    // };
    client.subscribe(view, subscribeOptions, (media) => {
      // 受信に成功したらしたらvideo表示
      $('#subscribe_stream_camera')[0].srcObject = media;
    });
    client.subscribe('common', subscribeOptions, (media) => {
      // 受信に成功したらしたらvideo表示
      $('#subscribe_stream_camera2')[0].srcObject = media;
    });
    client.subscribe('main', subscribeOptions, (media) => {
      // 受信に成功したらしたらvideo表示
      $('#subscribe_stream_camera3')[0].srcObject = media;
    });
    client.subscribe('sub', subscribeOptions, (media) => {
      // 受信に成功したらしたらvideo表示
      $('#subscribe_stream_camera4')[0].srcObject = media;
    });

    // subscribeOptions = {
    //   video:{
    //   rid: 'h'
    //   }
    // };
    // client.subscribe(view, subscribeOptions, (media) => {
    //   // 受信に成功したらしたらvideo表示
    //   $('#subscribe_stream_camera2')[0].srcObject = media;
    // });

    // subscribeOptions = {
    //   video:{
    //   rid: 'f'
    //   }
    // };
    // client.subscribe(view, subscribeOptions, (media) => {
    //   // 受信に成功したらしたらvideo表示
    //   $('#subscribe_stream_camera3')[0].srcObject = media;
    // });
  }

  /**
   * 画面共有ストリームの受信申し込み
   * @param {Client} client   -配信元のルームに入室済みのクライアント
   */
  subscribeSharescreen(client) {
    console.log('[Subscriber] subscribeSharescreen');

    let options = {audio: false, video: true};
    client.subscribe('main', options, (media) => {
      // 受信に成功したらしたらvideo表示
      $('#subscribe_stream_sharescreen')[0].srcObject = media;
    });
  }
}
