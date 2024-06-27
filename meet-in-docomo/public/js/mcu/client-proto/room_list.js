'use strict';
const RoomList = class {
  /**
   * コンストラクタ
   */
  constructor(client) {
    console.log('[RoomList] init');

    /**
     * sampleRoomのID（MCUサーバーを再起動したら書き換える）
     */
    this.sampleRoomId = '5f56f0f46ae112738f02ce19';

    /**
     * sampleRoom2のID（MCUサーバーを再起動したら書き換える）
     */
    this.sampleRoom2Id = '5f285a58554bc8080d3de43b';
    
    /**
     * testRoomのID（ルームを再作成したら書き換える）
     */
    this.testRoomId = '5f582babc31d7c043e969b13';

    /**
     * testRoom2のID（ルームを再作成したら書き換える）
     */
    this.testRoom2Id = '5f582bb115adec0438095abf';

    // 変数初期化
    this.lastRoomIdForCameraAndMic = null;
    this.lastRoomIdForSharescreen = null;
    this.rooms = null;
    
    // 使用するクライアントオブジェクトを保存
    this.client = client;
  }

  /**
   * 更新
   * @param {Function} callback       -コールバック
   */
  refresh(callback) {
    // 初期化
    this.clear();

    // 一覧取得
    this.client.getRoomList((rooms) => {
      this.rooms = rooms;

      // テーブルに追加
      rooms.forEach((room) => {
        let contents;
        contents += `<tr id=${room.id}>`;
        contents += `<td class="room_id">${room.id}</td>`;
        contents += `<td class="room_name">${room.name}</td>`;
        contents += `<td><input type="radio" name="radio_room_for_camera_and_mic" value="${room.id}"></td>`;
        contents += `<td><input type="radio" name="radio_room_for_sharescreen" value="${room.id}"></td>`;
        contents += `<td>`;
        contents += `<button class="button_delete">ルーム削除</button>`;
        contents += `<button class="button_setting">設定</button>`;
        contents += `</td>`;
        contents += `</tr>`;

        // 追加
        $('#table_room tbody').append(contents);

        // ルーム選択のイベント登録
        $('input[name="radio_room_for_camera_and_mic"]:radio').change(this._onChangeRadioRoomForCameraAndMic.bind(this));
        $('input[name="radio_room_for_sharescreen"]:radio').change(this._onChangeRadioRoomForSharescreen.bind(this));
        // 削除ボタンのイベント登録
        $(`#${room.id} .button_delete`).on('click', this._onClickDelete.bind(this, room.id, room.name));
        // 設定ボタンのイベント登録
        $(`#${room.id} .button_setting`).on('click', this._onClickSetting.bind(this, room.id));
      });

      // sampleRoomは削除と入室ができないようにする
      if(this._isExistRoomById(this.sampleRoomId)) {
        $(`#${this.sampleRoomId} .button_delete`).prop('disabled', true);
        $(`#${this.sampleRoomId} input`)[ROOM_TYPE.CAMERA_AND_MIC].disabled = true;
        $(`#${this.sampleRoomId} input`)[ROOM_TYPE.SHARESCREEN].disabled = true;
      }
      if(this._isExistRoomById(this.sampleRoom2d)) {
        $(`#${this.sampleRoom2Id} .button_delete`).prop('disabled', true);
        $(`#${this.sampleRoom2Id} input`)[ROOM_TYPE.CAMERA_AND_MIC].disabled = true;
        $(`#${this.sampleRoom2Id} input`)[ROOM_TYPE.SHARESCREEN].disabled = true;
      }

      // testRoomは削除できないようにする、また使用するルームのデフォルトに設定する
      if(this._isExistRoomById(this.testRoomId)) {
        $(`#${this.testRoomId} .button_delete`).prop('disabled', true);
        $(`#${this.testRoomId} input`)[ROOM_TYPE.CAMERA_AND_MIC].checked = true;
        this.lastRoomIdForCameraAndMic = this.testRoomId;
      }
      if(this._isExistRoomById(this.testRoom2Id)) {
        $(`#${this.testRoom2Id} .button_delete`).prop('disabled', true);
        $(`#${this.testRoom2Id} input`)[ROOM_TYPE.SHARESCREEN].checked = true;
        this.lastRoomIdForSharescreen = this.testRoom2Id;
      }

      // 通知
      if (callback != null) {
        callback();
      }
    },
    (e) => {
      alert(`ルームの一覧取得に失敗にしました : ${e}`);
    });
  }

  /**
   * 初期化
   */
  clear() {
    // テーブルをリセット
    $('#table_room tbody').children().remove();
  }

  /**
   * カメラ＆マイク用のルームIDを取得
   */
  getRoomIdForCameraAndMic() {
    return $('input[name=radio_room_for_camera_and_mic]:checked').val();
  }
  getRoomNameForCameraAndMic() {
    let roomId = this.getRoomIdForCameraAndMic();
    return $(`#${roomId} .room_name`).text();
  }

  /**
   * 画面共有用のルームIDを取得
   */
  getRoomIdForSharescreen() {
    return $('input[name=radio_room_for_sharescreen]:checked').val();
  }
  getRoomNameForSharescreen() {
    let roomId = this.getRoomIdForSharescreen();
    return $(`#${roomId} .room_name`).text();
  }

  /**
   * 「カメラ＆マイク用」ラヂオボタンの処理
   */
  _onChangeRadioRoomForCameraAndMic() {
    // 画面共有用と同じルームは選択できない
    let roomIdForCameraAndMic = this.getRoomIdForCameraAndMic();
    if (roomIdForCameraAndMic == this.getRoomIdForSharescreen()) {
      alert('画面共有用と同じルームは選択できません');
      $(`input[name="radio_room_for_camera_and_mic"][value="${this.lastRoomIdForCameraAndMic}"]`).prop('checked', true);
      return false;
    }

    // 最後に選択されたルームを保存
    this.lastRoomIdForCameraAndMic = roomIdForCameraAndMic;
  }

  /**
   * 「画面共有用」ラヂオボタンの処理
   */
  _onChangeRadioRoomForSharescreen() {
    // カメラ＆マイク用と同じルームは選択できない
    let roomIdForSharescreen = this.getRoomIdForSharescreen();
    if (roomIdForSharescreen == this.getRoomIdForCameraAndMic()) {
      alert('カメラ＆マイク用と同じルームは選択できません');
      $(`input[name="radio_room_for_sharescreen"][value="${this.lastRoomIdForSharescreen}"]`).prop('checked', true);
      return false;
    }

    // 最後に選択されたルームを保存
    this.lastRoomIdForSharescreen = roomIdForSharescreen;
  }

  /**
   * 「ルーム削除」ボタンの処理
   * @param {String} roomId     -ルーム名
   * @param {String} roomName   -ルームID
   */
  _onClickDelete(roomId, roomName) {
    if (!window.confirm( `ルーム「${roomName}」を削除しますか？`)) {
      return;
    }

    // 削除
    this.client.deleteRoom(roomId, () => {
      // 一覧更新
      this.refresh();

      alert('ルームを削除しました');
    });
  }

  /**
   * 「設定」ボタンの処理
   * @param {String} roomId     -ルーム名
   * @param {String} roomName   -ルームID
   */
  _onClickSetting(roomId) {
    // ルーム設定ダイアログ表示
    dialogRoomSettings.show(roomId);
  }

  /**
   * ルームが存在しているか
   * @param {String} roomId     -ルーム名
   * @return {boolean} true = 存在している / false = 存在していない
   */
  _isExistRoomById(roomId) {
    let rooms = this.rooms.filter(room => room.id == roomId);
    if (rooms.length == 0) {
      return false;
    }

    return true;
  }
}