/**
 * ルーム設定ダイアログ
 */
const DialogRoomSettings = class {
  /**
   * コンストラクタ
   */
  constructor(client) {
    console.log('[DialogRoomSettings] init');

    // ボタンが押された時のハンドラ登録
    $('#dialog_room_settings_button_enter').on('click', this._onClickButtonEnter.bind(this));
    $('#dialog_room_settings_button_cancel').on('click', this._onClickButtonCancel.bind(this));
    $('#dialog_room_settings_button_details').on('click', this._onClickButtonDetails.bind(this));
    
    // 変数初期化
    this.roomId = undefined;
    this.details = false;

    // 使用するクライアントオブジェクトを保存
    this.client = client;
  }

  /**
   * 表示
   */
  show(roomId) {
    this.roomId = roomId;

    // ルーム情報取得
    this.client.getRoom(roomId, (room) => {
      // 現在値設定
      $('#dialog_room_settings_input_framerate').val(room.views[0].video.parameters.framerate);
      $('#dialog_room_settings_input_bitrate').val(room.views[0].video.parameters.bitrate);
      $('#dialog_room_settings_input_keyInterval').val(room.views[0].video.parameters.keyFrameInterval);
      $('#dialog_room_settings_details').val(JSON.stringify(room, null , "\t"));

      // 表示を初期状態にする
      this.details = false;
      $('#dialog_room_settings_framerate').show();
      $('#dialog_room_settings_bitrate').show();
      $('#dialog_room_settings_keyInterval').show();
      $('#dialog_room_settings_details').hide();
      $('#dialog_room_settings_button_details').text("詳細設定");
      
      // 表示
      $("#dialog_room_settings").dialog({
        modal:false,
        position: {my: "right top", at: "right top", of: window}
      });
    });
  }

  /**
   * 非表示
   */
  hide() {
    // 変数初期化
    this.roomId = undefined;

    // 閉じる
    $("#dialog_room_settings").dialog("close");
  }

  /**
   * 「詳細設定」ボタンの処理
   */
  _onClickButtonDetails() {
    console.log('[DialogRoomSettings] click details');

    this.details = !this.details;

    // 表示切り替え
    if (this.details) {
      $('#dialog_room_settings_framerate').hide();
      $('#dialog_room_settings_bitrate').hide();
      $('#dialog_room_settings_keyInterval').hide();
      $('#dialog_room_settings_details').show();
      $('#dialog_room_settings_button_details').text("詳細設定を閉じる");
    }
    else {
      $('#dialog_room_settings_framerate').show();
      $('#dialog_room_settings_bitrate').show();
      $('#dialog_room_settings_keyInterval').show();
      $('#dialog_room_settings_details').hide();
      $('#dialog_room_settings_button_details').text("詳細設定");
    }
}

  /**
   * 「決定」ボタンの処理
   */
  _onClickButtonEnter() {
    console.log('[DialogRoomSettings] click enter');

    let resolution = ["x3/4"];
    let framerate = $('#dialog_room_settings_input_framerate').val();
    let bitrate = $('#dialog_room_settings_input_bitrate').val();
    let keyFrameInterval = $('#dialog_room_settings_input_keyInterval').val();

    let config = null;
    
    if (!this.details) {
      config = {
        views: [
          {
            label: 'main',
            video: {
              // format: {codec: 'vp9',},
              parameters: {
                resolution: resolution,
                framerate: framerate,
                bitrate: bitrate,
                keyFrameInterval: keyFrameInterval,
              },
            },
          },
          {
            label: 'sub',
            video: {
              // format: {codec: 'vp9',},
              parameters: {
                resolution: resolution,
                framerate: framerate,
                bitrate: bitrate,
                keyFrameInterval: keyFrameInterval,
              },
            },
          },
        ]
      };
    }
    else {
      config = JSON.parse($('#dialog_room_settings_details').val());
    }


    // 送信
    this.client.updateRoom(this.roomId, config);
    
    // 変数初期化
    this.roomId = undefined
    
    // 閉じる
    $("#dialog_room_settings").dialog("close");
  }

  /**
   * 「キャンセル」ボタンの処理
   */
  _onClickButtonCancel() {
    console.log('[DialogRoomSettings] click cancel');

    // 変数初期化
    this.roomId = undefined
    
    // 閉じる
    $("#dialog_room_settings").dialog("close");
  }
}
