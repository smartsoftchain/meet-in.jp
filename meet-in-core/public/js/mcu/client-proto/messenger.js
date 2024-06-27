'use strict';
const Messenger = class {
  /**
   * コンストラクタ
   */
  constructor(client) {
    console.log('[Messenger] init');

    /**
     * メッセージ種別
     */
    this.MESSAGE_TYPE = {
      'CHAT': 0,                    // チャット
      'SYNC': 1,                    // 同期
      'LIFTUPHAND': 2,              // 挙手
      'LIFTUPHAND_RESPONSE' : 3,    // 挙手への応答
      'CHANGE_MAIN_VIEWLAYOUT' : 4, // mainビューのレイアウト変更
    };

    // メッセージ受信時のリスナーの配列
    this.receiveMessageListeners = new Array();

    // 使用するクライアントを保存
    this.client = client;

    // メッセージ受信時のリスナー登録
    this.client.addEventListener('messagereceived', this._receiveMessage.bind(this));
  }

  /**
   * メッセージ受信時のリスナー追加
   * @param {Integer} messageType   -メッセージ種別
   * @param {Function} func         -関数
   */
  addReceiveMessageListener(messageType, func) {
    if (messageType < 0 || messageType >= this.MESSAGE_TYPE.length) {
      console.error('[Messenger] addReceiveMessageListener error: illegal message type');
      return;
    }
    if (func == null) {
      console.error('[Messenger] addReceiveMessageListener error: func is null');
      return;
    }

    // 追加
    this.receiveMessageListeners.push({
      'messageType': messageType,
      'function': func,
    });
  }

  /**
   * チャットメッセージ送信
   * @param {String} message  -メッセージ
   */
  sendChatMessage(message) {
    let json = JSON.stringify({
      'type': this.MESSAGE_TYPE.CHAT,
      'content': message,
    });

    // 送信
    this.client.sendMessage(json);
  }

  /**
   * 同期ステータス送信
   * @param {String} status   -同期ステータス
   */
  sendSyncStatus(status) {
    let json = JSON.stringify({
      'type': this.MESSAGE_TYPE.SYNC,
      'content': status,
    });

    // 送信
    this.client.sendMessage(json);
  }

  /**
   * 挙手ステータス送信
   * @param {Boolean} liftup    -挙手しているか
   */
  sendLiftuphand(liftup) {
    let json = JSON.stringify({
      'type': this.MESSAGE_TYPE.LIFTUPHAND,
      'content': liftup,
    });

    // 送信
    this.client.sendMessageWithParticipantType(json, 'HOST_ONLY');
  }

  /**
   * メインビューレイアウト変更送信
   * @param {String} useMainView    -使用するビュー
   */
  sendChangeMainViewLayout(useMainView) {
    let json = JSON.stringify({
      'type': this.MESSAGE_TYPE.CHANGE_MAIN_VIEWLAYOUT,
      'content': useMainView,
    });

    // 送信
    this.client.sendMessageWithParticipantType(json, 'HOST_ONLY');
  }

  /**
   * 許可送信
   * @param {Boolean} permission      -許可したか
   * @param {String} participantId    -送り先の参加者ID
   */
  sendLiftuphandResponse(permission, participantId) {
    let json = JSON.stringify({
      'type': this.MESSAGE_TYPE.LIFTUPHAND_RESPONSE,
      'content': permission,
    });

    // 送信
    this.client.sendMessageWithParticipantId(json, participantId);
  }

  /**
   * メッセージ受信
   * @param {*} message         -メッセージ
   * @param {*} participantId   -送り元の参加者ID
   */
  _receiveMessage(message, participantId) {
    let data = JSON.parse(message);

    if (data.type < 0 || data.type >= this.MESSAGE_TYPE.length) {
      console.error('[Messenger] _receiveMessage error: illegal message type');
      return;
    }
    
    // メッセージ種別が一致するリスナーを抽出
    let listeners = this.receiveMessageListeners.filter((listener) => {return listener.messageType == data.type});

    // リスナーに通知
    listeners.forEach((listener) => {
      listener.function(data.content, participantId);
    });
  }
}
