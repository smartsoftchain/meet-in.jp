'use strict';
let roomInfos = new Array();
let publisher = null;
let subscriber = null;
let roomList = null;
let participantList = null;
let dialogLiftuphand = null;
let dialogRoomSettings = null;
let messenger = null;
let mediaAccesser = null;
let isHostFlag = false;

/**
 * ルーム種別
 */
const ROOM_TYPE = {
  'CAMERA_AND_MIC': 0,    // カメラ＆マイク用
  'SHARESCREEN': 1,       // 画面共有
};

/**
 * ウィンドウ読み込み時の処理
 */
$(window).on('load', () => {
  console.log('[index] onload');

  // ルーム管理クラス生成
  roomInfos = [
    {
      roomType: ROOM_TYPE.CAMERA_AND_MIC,
      client: new McuClient(),
    },
    {
      roomType: ROOM_TYPE.SHARESCREEN,
      client: new McuClient(),
    },
  ];

  // その他の管理クラス生成
  publisher = new Publisher();
  subscriber = new Subscriber();
  roomList = new RoomList(roomInfos[ROOM_TYPE.CAMERA_AND_MIC].client);
  participantList = new ParticipantList(roomInfos[ROOM_TYPE.CAMERA_AND_MIC].client);
  messenger = new Messenger(roomInfos[ROOM_TYPE.CAMERA_AND_MIC].client);
  dialogLiftuphand = new DialogLiftuphand();
  dialogRoomSettings = new DialogRoomSettings(roomInfos[ROOM_TYPE.CAMERA_AND_MIC].client);
  mediaAccesser = new MediaAccesser();

  // 参加者が入退室した時のリスナー登録
  roomInfos[ROOM_TYPE.CAMERA_AND_MIC].client.addEventListener('joinedParticipant', onJoinedParticipant);
  roomInfos[ROOM_TYPE.CAMERA_AND_MIC].client.addEventListener('leftParticipant', onLeftParticipant);

  // 各種メッセージを受信したときのリスナー登録
  messenger.addReceiveMessageListener(messenger.MESSAGE_TYPE.CHAT, onReceiveChatMessage);
  messenger.addReceiveMessageListener(messenger.MESSAGE_TYPE.SYNC, onReceiveSyncMessage);
  messenger.addReceiveMessageListener(messenger.MESSAGE_TYPE.LIFTUPHAND, onReceiveLisftuphand);
  messenger.addReceiveMessageListener(messenger.MESSAGE_TYPE.LIFTUPHAND_RESPONSE, onReceiveLiftuphandResepnse);
  messenger.addReceiveMessageListener(messenger.MESSAGE_TYPE.CHANGE_MAIN_VIEWLAYOUT, onReceiveChangeMainViewLayout);

  // ブラウザが対応してるオプションの確認
  // let supported = navigator.mediaDevices.getSupportedConstraints();
  // console.log(`supported width : ${supported['width']}`);
  // console.log(`supported height : ${supported['height']}`);
  // console.log(`supported frameRate : ${supported['frameRate']}`);
  // console.log(`supported facingMode : ${supported['facingMode']}`);

  // ルーム一覧更新
  roomList.refresh();

  // 入退室ボタンの初期設定
  $('#button_join_host').prop('disabled', false);
  $('#button_join_guest').prop('disabled', false);
  $('#button_leave').prop('disabled', true);

  // ローカルストリームの初期設定
  $('input[name=check_use_news]')[0].checked = false;
  $('input[name=check_auto_create_join_room]')[0].checked = false;
  $('input[name=radio_camera_state]').val(['on']);
  $('input[name=radio_mic_state]').val(['off']);
  $('input[name=radio_sharescreen_state]').val(['off']);
  $('input[name=radio_spotlight_state]').val(['off']);
  $('input[name=radio_use_mainview_state]').val(['common']);
  $('#input_camera_width').val(1280);
  $('#input_camera_height').val(720);
  $('#input_camera_fps').val(10);
  $('#input_spotlight_on_volume').val(30);

  // ローカルストリームの状態を切り替えられないようにする
  $('input[name=radio_camera_state]')[0].disabled = true
  $('input[name=radio_camera_state]')[1].disabled = true
  $('input[name=radio_mic_state]')[0].disabled = true
  $('input[name=radio_mic_state]')[1].disabled = true
  $('input[name=radio_sharescreen_state]')[0].disabled = true
  $('input[name=radio_sharescreen_state]')[1].disabled = true
  $('input[name=radio_spotlight_state]')[0].disabled = true
  $('input[name=radio_spotlight_state]')[1].disabled = true
  $('input[name=radio_use_mainview_state]')[0].disabled = true
  $('input[name=radio_use_mainview_state]')[1].disabled = true
  $('#input_camera_width').prop('disabled', true);
  $('#input_camera_height').prop('disabled', true);
  $('#input_camera_fps').prop('disabled', true);
});

/**
 * ウィンドウを閉じる前＆更新前の処理
 */
$(window).on('beforeunload', function(e){
  console.log('beforeunload');
  // 退室処理
  // todo
  // leaveRoom();
});

/**
 * 各種イベント処理
 */
$(function() {
  /**
   * 「ルーム作成」ボタンの処理
   */
  $('#button_add_room').on('click', () => {
    let roomName = $('#input_room_name').val();
    if (roomName == '' || roomName == null) {
      alert('ルーム名を入力してください');
      return;
    }

    if (!window.confirm(`ルーム「${roomName}」を作成しますか？`)) {
      return;
    }

    // 作成
    let config = createRoomConfigs;
    roomInfos[ROOM_TYPE.CAMERA_AND_MIC].client.createRoom(roomName, config, (room) => {
      // 一覧更新
      roomList.refresh();
      // 作成するルーム名をリセット
      $('#input_room_name').val('')

      alert('ルームを作成しました');
    },
    (e) => {
      alert(`ルームの失敗にしました : ${e}`);
    });
  });

  /**
   * 「カメラON/OFF」ラヂオボタンの処理
   */
  $('input[name="radio_camera_state"]:radio').change(() => {
    // カメラの状態変更
    changeCameraState(isCameraOn());
  });

  /**
   * 「マイクON/OFF」ラヂオボタンの処理
   */
  $('input[name="radio_mic_state"]:radio').change(() => {
    // マイクの状態変更
    changeMicState(isMicOn());
  });

  /**
   * 「画面共有ON/OFF」ラヂオボタンの処理
   */
  $('input[name="radio_sharescreen_state"]:radio').change(() => {
    // 画面共有の状態変更
    changeSharescreenState(isSharescreenOn());
  });

  /**
   * 「レイアウト」ラヂオボタンの処理
   */
  $('input[name="radio_use_mainview_state"]:radio').change(() => {
    // ルームに入室していない場合は何もしない
    if (!roomInfos[ROOM_TYPE.CAMERA_AND_MIC].client.isJoined()) {
      return;
    }

    // カメラがOFFの時は何もしない
    if (!isCameraOn()) {
      return;
    }

    let useMainView = getUseMainView();

    // メインビューを切り替えて動画配信し直し
    publisher.switchMainView(useMainView);
    // 自身もメインビューの受信し直し
    subscriber.subscribeCameraAndMic(roomInfos[ROOM_TYPE.CAMERA_AND_MIC].client, useMainView)
    // メインビュー切り替えを他メンバーに通知    
    messenger.sendChangeMainViewLayout(useMainView)
  });

  /**
   * カメラの「width」変更時の処理
   */
  let lastValueCameraWidth
  $('#input_camera_width').focus('click', function(e) {
    // 変更前の値を保存
    lastValueCameraWidth = $(this).val();
  }).change(function() {
    // 異常値の場合は値を戻して終了
    let value = $(this).val();
    if (value == '' || value == null || value <= 0) {
      alert('widthは1以上の値を入力してください');
      $(this).val(lastValueCameraWidth);
      return;
    }
    // カメラの状態変更
    changeCameraState(isCameraOn());
  });

  /**
   * カメラの「height」変更時の処理
   */
  let lastValueCameraHeight
  $('#input_camera_height').focus('click', function(e) {
    // 変更前の値を保存
    lastValueCameraHeight = $(this).val();
  }).change(function() {
    // 異常値の場合は値を戻して終了
    let value = $(this).val();
    if (value == '' || value == null || value <= 0) {
      alert('heightは1以上の値を入力してください');
      $(this).val(lastValueCameraHeight);
      return;
    }
    // カメラの状態変更
    changeCameraState(isCameraOn());
  });

  /**
   * カメラの「fps」変更時の処理
   */
  let lastValueCameraFps
  $('#input_camera_fps').focus('click', function(e) {
    // 変更前の値を保存
    lastValueCameraFps = $(this).val();
  }).change(function() {
    // 異常値の場合は値を戻して終了
    let value = $(this).val();
    if (value == '' || value == null || value <= 0) {
      alert('fpsは1以上の値を入力してください');
      $(this).val(lastValueCameraFps);
      return;
    }
    // カメラの状態変更
    changeCameraState(isCameraOn());
  });

  /**
   * 「ホストとして入室」ボタンの処理
   */
  $('#button_join_host').on('click', () => {
    if (!window.confirm( 'ホストとしてルーム入室しますか？')) {
      return;
    }

    joinRoom('ホストさん', 'host');
  });

  /**
   * 「ゲストとして入室」ボタンの処理
   */
  $('#button_join_guest').on('click', () => {
    if (!window.confirm( 'ルームにゲストとして入室しますか？')) {
      return;
    }

    joinRoom('ゲストさん', 'guest');  
  });

  /**
   * 「退室」ボタンの処理
   */
  $('#button_leave').on('click', () => {
    if (!roomInfos[ROOM_TYPE.CAMERA_AND_MIC].client.isJoined()) {
      alert('ルームに入室していません');
      return;
    }

    if (!window.confirm( 'ルームから退室しますか？')) {
      return;
    }

    // 退室
    leaveRoom();
  });

  /**
   * 「送信」ボタンの処理
   */
  $('#button_send_message').on('click', () => {
    let message = $('#input_send_message').val();
    if (message == '' || message == null) {
      alert('メッセージを入力してください');
      return;
    }

    if (!roomInfos[ROOM_TYPE.CAMERA_AND_MIC].client.isJoined()) {
      alert('ルームに入室していません');
      return;
    }
  
    // 自分のチャット欄に追加
    addTextToTextarea($('#textarea_chat'), `[Me]${message}`);

    // 入力を初期化
    $('#input_send_message').val('');

    // 送信
    messenger.sendChatMessage(message);
  });

  /**
   * 「挙手」ボタンの処理
   */
  $('#button_liftuphand').on('click', () => {
    // 挙手ダイアログ表示
    dialogLiftuphand.show();
  });
});

/**
 * 各ラヂオボタンの状態取得
 */
function isCameraOn() {
  return $('input[name=radio_camera_state]:checked').val() == 'on';
}

function isMicOn() {
  return $('input[name=radio_mic_state]:checked').val() == 'on';
}

function isSharescreenOn() {
  return $('input[name=radio_sharescreen_state]:checked').val() == 'on';
}

function isSpotlightOn() {
  return $('input[name=radio_spotlight_state]:checked').val() == 'on';
}

function getUseMainView() {
  return $('input[name=radio_use_mainview_state]:checked').val();
}

/**
 * ウィンドウサイズ変更時の処理
 */
$(window).resize(() => {
  let video = $('#subscribe_stream_camera')

  // videoの元サイズを取得
  let orgWidth  = video.width();
  let orgHeight = video.height();

  // videoの横幅をウィンドウサイズに合わせる
  video.width(window.innerWidth - 10);

  // videoの縦横比を合わせる
  video.height(orgHeight * (video.width() / orgWidth));
});

//------------------------------------------------------------------------------
// ルーム操作
//------------------------------------------------------------------------------
/**
 * ルーム入室
 * @param {String} userName   -ユーザー名
 * @param {String} userRole   -ロール
 */
function joinRoom(userName, userRole) {
  /**
   * 全てのルームへの入室が終了したときの処理
   */
  function joinedUseAllRoomFunction() {
    console.log('[index] join seccessed');

    // ホストかゲストか
    isHostFlag = userRole == 'host';

    // 参加者一覧を更新
    participantList.refresh();
    // ルーム一覧も更新（ルームを自動作成した可能性があるので）
    roomList.refresh(() => {
      // 入室済みテキスト表示
      let role = isHost() ? 'ホスト' : 'ゲスト';
      let roomIdCameraAndMic = roomInfos[ROOM_TYPE.CAMERA_AND_MIC].client.getRoomId();
      let roomIdSharescreen = roomInfos[ROOM_TYPE.SHARESCREEN].client.getRoomId();
      let roomNameCameraAndMic = $(`#${roomIdCameraAndMic} .room_name`).text();
      let roomNameSharescreen = $(`#${roomIdSharescreen} .room_name`).text();
      $('#room_status').text(`「${roomNameCameraAndMic}」と「${roomNameSharescreen}」に${role}で入室中`);
      $('#room_status').css('color', 'red');

      // ルームのチェックを今のルームで再設定（自動作成したルームに入室した可能性があるので）
      $(`#${roomIdCameraAndMic} input`)[ROOM_TYPE.CAMERA_AND_MIC].checked = true;
      $(`#${roomIdSharescreen} input`)[ROOM_TYPE.SHARESCREEN].checked = true;
    });

    // カメラ映像＆音声用のストリームの受信申し込み
    subscriber.subscribeCameraAndMic(roomInfos[ROOM_TYPE.CAMERA_AND_MIC].client, getUseMainView());

    // 画面共有用のストリームの受信申し込み
    subscriber.subscribeSharescreen(roomInfos[ROOM_TYPE.SHARESCREEN].client);

    // 映像＆音声ストリームを生成して公開＆表示
    changeCameraState(isCameraOn());
    changeMicState(isMicOn());

    // ホストがいる場合は挙手を可能にする
    $('#button_liftuphand').prop('disabled', !participantList.isExistHost());

    // 入室ボタンを押せないように、退室ボタンを押せるようにする
    $('#button_join_host').prop('disabled', true);
    $('#button_join_guest').prop('disabled', true);
    $('#button_leave').prop('disabled', false);

    // 画面共有はoffにする
    $('input[name=radio_sharescreen_state]').val(['off']);

    // ローカルストリームの状態を切り替えられるようにする
    // ホストの場合は自由に切り替え可能
    // ゲストの場合はカメラのみ切り替え可能（マイクと画面共有はホストの許可が必要）
    $('input[name=radio_camera_state]')[0].disabled = false
    $('input[name=radio_camera_state]')[1].disabled = false
    $('input[name=radio_mic_state]')[0].disabled = isGuest()
    $('input[name=radio_mic_state]')[1].disabled = isGuest()
    $('input[name=radio_sharescreen_state]')[0].disabled = isGuest()
    $('input[name=radio_sharescreen_state]')[1].disabled = isGuest()
    $('input[name=radio_spotlight_state]')[0].disabled = false
    $('input[name=radio_spotlight_state]')[1].disabled = false
    $('input[name=radio_use_mainview_state]')[0].disabled = false
    $('input[name=radio_use_mainview_state]')[1].disabled = false
    $('#input_camera_width').prop('disabled', false);
    $('#input_camera_height').prop('disabled', false);
    $('#input_camera_fps').prop('disabled', false);
    // ニュース映像を使用するを切り替えられないようにする
    $('input[name=check_use_news]')[0].disabled = true

    // ゲストの場合は挙手ボタンを表示する
    if (isGuest()) {
      $('#button_liftuphand').show();
    } else {
      $('#button_liftuphand').hide();
    }
  }

  let roomNameForCameraAndMic = undefined;
  let roomNameForSharescreen = undefined;
  let autoCreateJoinRoom = $('input[name=check_auto_create_join_room]:checked').val()
  if (!autoCreateJoinRoom) {
    // 入室するルームを自動生成しない場合は、チェックしてるルームの名前で入室する
    roomNameForCameraAndMic = roomList.getRoomNameForCameraAndMic();
    roomNameForSharescreen = roomList.getRoomNameForSharescreen();
  }
  else {
    function createRondomString() {
      const length = 24;
      const charSet = "abcdefghijklmnopqrstuvwxyz0123456789";
      let ret = "";
      for(let i=0; i<length; i++){
        ret += charSet[Math.floor(Math.random()*charSet.length)];
      }
      return ret;
    }
  
    // 入室するルームを自動生成する場合は、名前をランダム生成する
    roomNameForCameraAndMic = createRondomString();
    roomNameForSharescreen = createRondomString();
  }

  // 入室するclientとルームIDをセットする
  let joinRoomInfos = [
    {
      client: roomInfos[ROOM_TYPE.CAMERA_AND_MIC].client,
      roomName: roomNameForCameraAndMic,
    },
    {
      client: roomInfos[ROOM_TYPE.SHARESCREEN].client,
      roomName: roomNameForSharescreen,
    },
  ];

  // 全てのルームに入室
  joinRoomInfos.forEach((joinRoom) => {
    joinRoom.client.join(joinRoom.roomName, userName, userRole, () => {
      // 全てのルームの入室に成功したか
      let joindRoomInfo = joinRoomInfos.filter((joinRoom) => {return joinRoom.client.isJoined()});
      if (joindRoomInfo.length == joinRoomInfos.length) {
        // 入室完了したら入室完了後の処理を実行する
        joinedUseAllRoomFunction();
      }
    });  
  });
}

/**
 * ルーム退室
 */
function leaveRoom() {
  roomInfos.forEach((roomInfo) => {
    // 退室
    roomInfo.client.leave();
  });

  publisher.finalize();

  // video停止
  $('#local_stream_camera')[0].srcObject = null;
  $('#local_stream_sharescreen')[0].srcObject = null;  
  $('#subscribe_stream_camera')[0].srcObject = null;
  $('#subscribe_stream_sharescreen')[0].srcObject = null;  

  // 未入室テキスト表示
  $('#room_status').text('ルームに入室していません');
  $('#room_status').css('color', 'black');

  // 入室ボタンを押せるように、退室ボタンを押せないようにする
  $('#button_join_host').prop('disabled', false);
  $('#button_join_guest').prop('disabled', false);
  $('#button_leave').prop('disabled', true);

  // ローカルストリームの状態を切り替えられないようにする
  $('input[name=radio_camera_state]')[0].disabled = true
  $('input[name=radio_camera_state]')[1].disabled = true
  $('input[name=radio_mic_state]')[0].disabled = true
  $('input[name=radio_mic_state]')[1].disabled = true
  $('input[name=radio_sharescreen_state]')[0].disabled = true
  $('input[name=radio_sharescreen_state]')[1].disabled = true
  $('input[name=radio_spotlight_state]')[0].disabled = true
  $('input[name=radio_spotlight_state]')[1].disabled = true
  $('input[name=radio_use_mainview_state]')[0].disabled = true
  $('input[name=radio_use_mainview_state]')[1].disabled = true
  $('#input_camera_width').prop('disabled', true);
  $('#input_camera_height').prop('disabled', true);
  $('#input_camera_fps').prop('disabled', true);

  // ニュース映像を使用するを切り替えられるようにする
  $('input[name=check_use_news]')[0].disabled = false

  // 挙手ボタンを消す
  $('#button_liftuphand').hide();

  // チャット初期化
  $('#textarea_chat').val('');

  // 参加者一覧初期化
  participantList.clear();
}

/**
 * 参加者が入室した時の処理
 */
function onJoinedParticipant(participantId) {
  console.log(`[index] onJoin participant: ${participantId}`);

  // 参加者一覧を更新
  participantList.refresh();
  // ホストがいる場合は挙手を可能にする
  $('#button_liftuphand').prop('disabled', !participantList.isExistHost());
}

/**
 * 参加者が退室した時の処理
 */
function onLeftParticipant(participantId) {
  console.log(`[index] onLeft participant: ${participantId}`);
  
  // 参加者一覧を更新
  participantList.refresh();
}

/**
 * ホストか
 */
function isHost() {
  return isHostFlag;
}

/**
 * ゲストか
 */
function isGuest() {
  return !isHostFlag;
}

//------------------------------------------------------------------------------
// ストリーム操作
//------------------------------------------------------------------------------
/**
 * カメラの状態変更
 * @param {boolean} isCameraOn    -カメラがONになっているか
 */
function changeCameraState(isCameraOn) {
  // ルームに入室していない場合は何もしない
  if (!roomInfos[ROOM_TYPE.CAMERA_AND_MIC].client.isJoined()) {
    return;
  }

  // すでに映像公開中の場合があるので、一旦停止処理を行う
  publisher.stopPublishVideoStream();

  // カメラがonならストリームを再生成して公開
  if(isCameraOn) {
    publisher.publishVideoStream(roomInfos[ROOM_TYPE.CAMERA_AND_MIC].client);
  }
  
  // 同期メッセージ送信
  messenger.sendSyncStatus('change video state');
}

/**
 * マイクの状態変更
 * @param {boolean} isMicOn       -マイクがONになっているか
 */
function changeMicState(isMicOn) {
  // ルームに入室していない場合は何もしない
  if (!roomInfos[ROOM_TYPE.CAMERA_AND_MIC].client.isJoined()) {
    return;
  }

  // すでに音声公開中の場合があるので、一旦停止処理を行う
  publisher.stopPublishAudioStream();

  // マイクがonならストリームを再生成して公開
  if(isMicOn) {
    publisher.publishAudioStream(roomInfos[ROOM_TYPE.CAMERA_AND_MIC].client);
  }

  // 同期メッセージ送信
  messenger.sendSyncStatus('change mic state');
}

/**
 * 画面共有の状態変更
 * @param {boolean} isSharescreenOn   -画面共有がONになっているか
 */
function changeSharescreenState(isSharescreenOn) {
  // ルームに入室していない場合は何もしない
  if (!roomInfos[ROOM_TYPE.SHARESCREEN].client.isJoined()) {
    return;
  }

  // すでに画面共有公開中の場合があるので、一旦停止処理を行う
  publisher.stopPublishSharescreenStream();

  // 画面共有ストリームを再生して公開
  if (isSharescreenOn) {
    publisher.publishSharescreenStream(roomInfos[ROOM_TYPE.SHARESCREEN].client);
  }

  // 同期メッセージ送信
  messenger.sendSyncStatus('change share screen state');
}

/**
 * メインビューレイアウト変更を受信した時の処理
 * @param {String} useMainView    -使用するビュー
 */
function onReceiveChangeMainViewLayout(useMainView) {
  // チェックボックス変更
  $(`input[name="radio_use_mainview_state"][value="${useMainView}"]`).prop('checked', true);
  // メインビューを切り替えて動画配信し直し
  publisher.switchMainView(useMainView);
  // メインビューの受信し直し
  subscriber.subscribeCameraAndMic(roomInfos[ROOM_TYPE.CAMERA_AND_MIC].client, useMainView)
}

//------------------------------------------------------------------------------
// 挙手操作
//------------------------------------------------------------------------------
/**
 * ゲストから挙手を受信した時の処理
 * @param {Boolean} liftup        -挙手しているか
 * @param {String} participantID  -参加者ID
 */
function onReceiveLisftuphand(liftup, participantID) {
  // 許可を申請してきたときは許可ボタンを押せるようにする
  if (liftup) {
    $(`#${participantID} .button_permission`).prop('disabled', false);
  }
  else {
    $(`#${participantID} .button_permission`).prop('disabled', true);
  }
}

/**
 * ホストから挙手の許可を受信した時の処理
 * @param {Boolean} permission    -許可されたか
 */
function onReceiveLiftuphandResepnse(permission) {
  // ダイアログに通知
  dialogLiftuphand.onReceiveLiftuphandResponse(permission);
}

//------------------------------------------------------------------------------
// メッセージ操作
//------------------------------------------------------------------------------
/**
 * チャットメッセージ受信時の処理
 * @param {String} message        -メッセージ 
 * @param {String} participantID  -送信元の参加者ID 
 */
function onReceiveChatMessage(message, participantID) {
  addTextToTextarea($('#textarea_chat'), `[${participantID}]${message}`);
}

/**
 * 同期メッセージ受信時の処理
 * @param {String} message        -メッセージ 
 * @param {String} participantID  -送信元の参加者ID 
 */
function onReceiveSyncMessage(message, participantID) {
  addTextToTextarea($('#textarea_sync'), `[${participantID}]${message}`);
}

/**
 * テキストエリアにテキスト追加
 * @param {Element} textArea    -テキストエリア要素
 * @param {String} text         -テキスト
 */
function addTextToTextarea(textArea, text) {
  // テキスト追加
  let value = textArea.val();
  if (value != '') {
    value += '\n';
  }
  textArea.val(`${value}${text}`);

  // 一番下にスクロール
  textArea.scrollTop(textArea[0].scrollHeight - textArea.height());
}
