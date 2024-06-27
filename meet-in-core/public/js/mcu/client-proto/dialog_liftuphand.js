/**
 * 挙手ダイアログ
 */
const DialogLiftuphand = class {
  /**
   * コンストラクタ
   */
  constructor() {
    console.log('[DialogLiftuphand] init');

    /**
     * 状態
     */
    this.STATUS = {
      NONE: 0,              // なし
      UP: 1,                // 挙手中
      PERMISSION: 2,        // 許可された
      NOT_PERMISSION: 3,    // 拒否された
      AUDIO_ON: 4,          // 音声の配信中
      SHARESCREEN_ON: 5,    // 画面共有の配信中
    };

    this.status = this.STATUS.NONE;

    // ボタンが押された時のハンドラ登録
    $('#dialog_liftuphand_button_cancel').on('click', this._onClickButtonCancel.bind(this));
    $('#dialog_liftuphand_button_exit').on('click', this._onClickButtonExit.bind(this));
    $('#dialog_liftuphand_button_start_audio').on('click', this._onClickButtonStartAudio.bind(this));
    $('#dialog_liftuphand_button_start_sharescreen').on('click', this._onClickButtonStartShareScreen.bind(this));
  }

  /**
   * 表示
   */
  show() {
    // ボタンの初期状態設定
    this._setStatus(this.STATUS.UP);

    // 挙手したことをメッセージ送信
    messenger.sendLiftuphand(true);

    // 表示
    $("#dialog_liftuphand").dialog({
      modal:false,
      position: {my: "right top", at: "right top", of: window}
    });
  }

  /**
   * 非表示
   */
  hide() {
    // 閉じる
    $("#dialog_liftuphand").dialog("close");
  }

  /**
   * 挙手に対する応答受信
   * @param {Boolean} permission  -許可されたか
   */
  onReceiveLiftuphandResponse(permission) {
    if (permission) {
      this._setStatus(this.STATUS.PERMISSION);
    }
    else {
      this._setStatus(this.STATUS.NOT_PERMISSION);
    }
  }

  /**
   * 「キャンセル」ボタンの処理
   */
  _onClickButtonCancel() {
    console.log('[DialogLiftuphand] click cancel');

    // 挙手をやめたことをメッセージ送信
    messenger.sendLiftuphand(false);

    // 閉じる
    $("#dialog_liftuphand").dialog("close");
  }

  /**
   * 「終了」ボタンの処理
   */
  _onClickButtonExit() {
    console.log('[DialogLiftuphand] click exit');

    // 配信中の場合は止める
    switch (this.status) {
      case this.STATUS.AUDIO_ON:
        $('input[name="radio_mic_state"][value="off"]').prop('checked',true).trigger('change');
        break;

      case this.STATUS.SHARESCREEN_ON:
        $('input[name="radio_sharescreen_state"][value="off"]').prop('checked',true).trigger('change');
        break;

      }

    // 閉じる
    $("#dialog_liftuphand").dialog("close");
  }

  /**
   * 「音声の配信を開始する」ボタンの処理
   */
  _onClickButtonStartAudio() {
    console.log('[DialogLiftuphand] click start audio');

    // 音声の配信開始
    $('input[name="radio_mic_state"][value="on"]').prop('checked',true).trigger('change');

    this._setStatus(this.STATUS.AUDIO_ON);
  }

  /**
   * 「画面共有の配信を開始する」ボタンの処理
   */
  _onClickButtonStartShareScreen() {
    console.log('[DialogLiftuphand] click start share screen');

    // 画面共有の配信開始
    $('input[name="radio_sharescreen_state"][value="on"]').prop('checked',true).trigger('change');

    this._setStatus(this.STATUS.SHARESCREEN_ON);
  }

  /**
   * 挙手ボタンの状態設定
   * @param {Integer} status    -状態
   */
  _setStatus(status) {
    // ボタンの表示切り替え
    switch (status) {
      case this.STATUS.UP:
        $('#dialog_liftuphand_status').text('挙手中');

        $("#dialog_liftuphand_button_cancel").show();
        $("#dialog_liftuphand_button_exit").hide();
        $("#dialog_liftuphand_button_start_audio").hide();
        $("#dialog_liftuphand_button_start_sharescreen").hide();
        break;

      case this.STATUS.PERMISSION:
        $('#dialog_liftuphand_status').text('許可されました');

        // 許可された場合は、音声の配信か画面共有の配信かを選択できるようにする
        $("#dialog_liftuphand_button_cancel").hide();
        $("#dialog_liftuphand_button_exit").hide();
        $("#dialog_liftuphand_button_start_audio").show();
        $("#dialog_liftuphand_button_start_sharescreen").show();
        break;

      case this.STATUS.NOT_PERMISSION:
        $('#dialog_liftuphand_status').text('拒否されました');

        // 拒否された時は終了ボタンだけにする
        $("#dialog_liftuphand_button_cancel").hide();
        $("#dialog_liftuphand_button_exit").text('終了する');
        $("#dialog_liftuphand_button_exit").show();
        $("#dialog_liftuphand_button_start_audio").hide();
        $("#dialog_liftuphand_button_start_sharescreen").hide();
        break;

      case this.STATUS.AUDIO_ON:
        $('#dialog_liftuphand_status').text('音声の配信中');

        // 終了ボタンだけにする
        $("#dialog_liftuphand_button_cancel").hide();
        $("#dialog_liftuphand_button_exit").text('音声の配信を終了する');
        $("#dialog_liftuphand_button_exit").show();
        $("#dialog_liftuphand_button_start_audio").hide();
        $("#dialog_liftuphand_button_start_sharescreen").hide();
        break;

      case this.STATUS.SHARESCREEN_ON:
        $('#dialog_liftuphand_status').text('画面共有の配信中');

        // 終了ボタンだけにする
        $("#dialog_liftuphand_button_cancel").hide();
        $("#dialog_liftuphand_button_exit").text('画面共有の配信を終了する');
        $("#dialog_liftuphand_button_exit").show();
        $("#dialog_liftuphand_button_start_audio").hide();
        $("#dialog_liftuphand_button_start_sharescreen").hide();
        break;

      default:
        console.error('[DialogLiftuphand] setStatus failed: illegal status');
        break;

    }

    // 状態保存
    this.status = status;
  }  
}
