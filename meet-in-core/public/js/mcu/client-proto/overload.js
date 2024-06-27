'use strict';
let clients = Array();
let mediaAccesser = null;
let stream = null;
let image = null;
let video = null;
let canvas = null;

$(window).on('load', () => {
  console.log('[overload] onload');

  mediaAccesser = new MediaAccesser();
  
  // 入退室ボタンの初期設定
  $('#button_join').prop('disabled', false);
  $('#button_leave_all').prop('disabled', true);

  // 画像と動画を読み込み
  image = document.getElementById('local_stream_image');
  video = document.getElementById('local_stream_video');
  canvas = document.getElementById('local_stream_canvas');
  image.src = 'image.png';
  video.src='video.mp4';
  video.play();

  // メディアタイプの初期設定
  $('input[name="radio_media_type"][value="movie"]').prop('checked',true);
});

/**
 * 各種イベント処理
 */
$(function() {
  /**
   * 「入室」ボタンの処理
   */
  $('#button_join').on('click', () => {
    // 入室ボタンをおせないようにする
    $('#button_join').prop('disabled', true);
    // メディアを切り替えられないようにする
    $('input[name=radio_media_type]')[0].disabled = true
    $('input[name=radio_media_type]')[1].disabled = true
  
    // 入室
    joinRoom(() => {
      // 入室処理が完了したら入室ボタンと退室ボタンが押せるようにする
      $('#button_join').prop('disabled', false);
      $('#button_leave_all').prop('disabled', false);
    });
  });

  /**
   * 「全て退室」ボタンの処理
   */
  $('#button_leave_all').on('click', () => {
    // 退室
    leaveRoom();

    // video停止
    $('#subscribe_stream_camera')[0].srcObject = null;

    // 退室ボタンを押せないようにする
    $('#button_leave_all').prop('disabled', true);

    // 変数初期化
    clients = Array();
  });
});

/**
 * ストリーム生成
 */
function createStream(callback) {
  // キャンバス初期化
  canvas.getContext('2d').clearRect(0, 0, 320, 240);

  let mediaType = $('input[name=radio_media_type]:checked').val();
  // キャンバスに描画登録
  switch (mediaType) {
    case 'picture':
      // 画像を使う場合は、一旦キャンバスに描画してキャンバスのストリームを取得する
      video.removeEventListener('timeupdate', onVideoUpdate, true);
      canvas.getContext('2d').drawImage(image, 0, 0);
      callback(canvas.captureStream(60));
      break;

    case 'movie':
      // 動画を使う場合は、ビデオ更新時にキャンバスを更新するようにリスナー登録し、そのキャンバスのストリームを取得する
      video.addEventListener('timeupdate', onVideoUpdate, true);
      callback(canvas.captureStream(60));
      break;
      
    case 'camera':
      // カメラを使う場合は、メディアからストリームを取得する
      mediaAccesser.getUserMedia(true, false, (media) => {
        callback(media);
      });
      break;
      
  }
}

/**
 * ビデオ更新処理
 */
function onVideoUpdate() {
  // キャンバスを書き換え
  canvas.getContext('2d').drawImage(video, 0, 0, 320, 240); 
};

/**
 * 入室
 */
function joinRoom(callback) {
  // クライアント生成
  let client = new McuClient();
  clients.push(client);

  // 入室
  let roomId = '';
  client.join(roomId, '名無しさん', 'presenter', () => {
    // 入室１回目は、ストリームの生成と受信の申し込みを行う
    if (clients.length == 1) {
      // ストリーム生成
      createStream((s) => {
        stream = s;
        // 生成に成功したら公開
        let publishOptions;
        client.publish(stream, 'common', publishOptions, () => {
          if (callback != null) {
            callback();
          }
        });
      });
      // 受信の申し込み
      let subscribeOptions = {audio: true, video: {}};
      client.subscribe('common', subscribeOptions, (media) => {
        // 受信に成功したらしたらvideo表示
        $('#subscribe_stream_camera')[0].srcObject = media;
      });
    }
    else {
      // 入室２回目以降は、すぐに公開
      let publishOptions;
      client.publish(stream, 'common', publishOptions, () => {
        if (callback != null) {
          callback();
        }
      });
    }
  });
}

/**
 * 退室
 */
function leaveRoom() {
  // 全て退室
  clients.forEach((client) => {
    client.leave();
  });
}