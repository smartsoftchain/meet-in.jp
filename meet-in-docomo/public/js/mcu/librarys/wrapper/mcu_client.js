'use strict';
const McuClient = class {
  /**
   * コンストラクタ
   */
  constructor() {
    console.log('[McuClient] init');

    /**
     * joinのリトライ回数
     */
    this.NUMBER_OF_RETRY_TO_JOIN = 3;

    /**
     * publishのリトライ回数
     */
    this.NUMBER_OF_RETRY_TO_PUBLISH = 3;

    /**
     * subscribeのリトライ回数
     */
    this.NUMBER_OF_RETRY_TO_SUBSCRIBE = 3;

    // イベントリスナーのテーブル初期化
    this.eventListenerFunctionTable = {
      'disconnected': null,
      'messagereceived': null,
      'joinedParticipant': null,
      'leftParticipant': null,
    };

    // 変数初期化
    this.myId = undefined;
    this.roomId = undefined;
    this.publicationInfos = new Array();
    this.participants = new Array();
    this.remoteStreams = new Array();
    this.rest = new McuRest();
    this.sio = new Owt.Conference.SioSignaling();
    this.conference = new Owt.Conference.ConferenceClient(null, this.sio);
    this.joinRetryCount = 0;
    this.publishRetryCount = 0;
    this.subscribeRetryCount = 0;
    this.leaveBySelf = false;

    // 通信切断時のリスナー登録
    this.sio.addEventListener("disconnect", this._onDisconnect.bind(this));
    // メッセージ受信時のリスナー登録
    this.conference.addEventListener('messagereceived', this._onReceiveMessage.bind(this));
    // 参加者入室時のリスナー登録
    this.conference.addEventListener('participantjoined', this._joinParticipant.bind(this));
  }

  /**
   * @function setMcuServer
   * @desc REST API用のMCUサーバの設定
   * @param {String} url    -サーバのURL
   * @param {Function} func       -関数
   */
  setMcuServer(url) {
    this.rest.setMcuServer(url);
  }

  /**
   * @function addEventListener
   * @desc イベントリスナー登録
   * @param {String} eventName    -イベント名
   * @param {Function} func       -関数
   */
  addEventListener(eventName, func) {
    if (!(eventName in this.eventListenerFunctionTable)) {
      console.error(`[McuClient] addEventListener error: illegal eventName: ${eventName}`);
      return;
    }

    this.eventListenerFunctionTable[eventName] = func;
  }

  /**
   * @function createRoom
   * @desc ルーム作成
   * @param {String} roomName             -ルーム名
   * @param {Object(Room)} config         -コンフィグ
   * @param {Function} succeededCallback  -成功コールバック
   * @param {Function} failedCallback     -失敗コールバック
   */
  createRoom(roomName, config, succeededCallback, failedCallback) {
    console.log('[McuClient] createRoom');

    // ルーム作成
    this.rest.createRoom(roomName, config, (response) => {
      console.log('[McuClient] createRoom succeeded');

      try {
        let room = JSON.parse(response);
        if (succeededCallback != null) {
          succeededCallback(room);
        }
      }
      catch(e) {
        if (failedCallback != null) {
          failedCallback(response);
        }
      }
    });
  }

  /**
   * @function deleteRoom
   * @desc ルーム削除
   * @param {String} roomId   -ルームID
   */
  deleteRoom(roomId, callback) {
    console.log('[McuClient] deleteRoom');

    // ルーム作成
    this.rest.deleteRoom(roomId, (response) => {
      console.log('[McuClient] deleteRoom succeeded');

      if (callback != null) {
        callback();
      }
    });
  }

  /**
   * @function updateRoom
   * @desc ルーム設定の更新
   * @param {String} roomId           -ルームID
   * @param {[Object(Room)]} config   -コンフィグ
   * @param {Function} callback       -コールバック
   */
  updateRoom(roomId, config, callback) {
    console.log('[McuClient] updateRoom');

    // ルーム作成
    this.rest.updateRoom(roomId, config, (response) => {
      console.log('[McuClient] updateRoom succeeded');

      let room = JSON.parse(response);
      if (callback != null) {
        callback(room);
      }
    });
  };

  /**
   * @function getRoom
   * @desc ルーム設定の更新
   * @param {String} roomId       -ルームID
   * @param {Function} callback   -コールバック
   */
  getRoom(roomId, callback) {
    console.log('[McuClient] updateRoom');

    // ルーム作成
    this.rest.getRoom(roomId, (response) => {
      console.log('[McuClient] getRoom succeeded');

      let room = JSON.parse(response);
      if (callback != null) {
        callback(room);
      }
    });
  };

  /**
   * @function getRoomList
   * @desc ルーム一覧取得
   * @param {Function} succeededCallback  -成功コールバック
   * @param {Function} failedCallback     -失敗コールバック
   */
  getRoomList(succeededCallback, failedCallback) {
    console.log('[McuClient] getRoomList');

    this.rest.getRoomList((response) => {
      console.log('[McuClient] getRoomList succeeded');

      try {
        let rooms = JSON.parse(response);
        if (succeededCallback != null) {
          succeededCallback(rooms);
        }
      }
      catch(e) {
        if (failedCallback != null) {
          failedCallback(response);
        }
      }
    });
  }

  /**
   * @function join
   * @desc ルーム入室
   * @param {String} roomName             -ルーム名
   * @param {String} userName             -参加者のユーザー名
   * @param {String} userRole             -参加者のロール
   * @param {Function} succeededCallback  -成功コールバック
   * @param {Function} failedCallback     -失敗コールバック
   */
  join(roomName, userName, userRole, succeededCallback, failedCallback) {
    console.log('[McuClient] join');

    // リトライ回数初期化
    this.joinRetryCount = 0;
    // 退室フラグ初期化
    this.leaveBySelf = false;

    // 入室するルームを取得する
    this._getJoinRoom(roomName, (room) => {
      // 取得に成功したら続けて入室処理を行う
      this._joinCore(room.id, userName, userRole, succeededCallback, failedCallback);
    }, (err) => {
      failedCallback(err);
      return;
    })
  };

  /**
   * @function _joinCore
   * @desc ルーム入室の内部処理
   * @param {String} roomId               -ルームID
   * @param {String} userName             -参加者のユーザー名
   * @param {String} userRole             -参加者のロール
   * @param {Function} succeededCallback  -成功コールバック
   * @param {Function} failedCallback     -失敗コールバック
   */
  _joinCore(roomId, userName, userRole, succeededCallback, failedCallback) {
    console.log('[McuClient] joinCore');

    // トークン生成
    this.rest.createToken(roomId, userName, userRole, (response) => {
      console.log('[McuClient] createToken succeeded');

      // トークン保存
      let token = response;

      // 入室処理
      this.conference.join(token).then((resp) => {
        console.log('[McuClient] join succeeded');
      
        // 自分のIDとルームの情報を保存
        this.myId = resp.self.id;
        this.roomId = resp.id;
        this.participants = resp.participants;
        this.remoteStreams = resp.remoteStreams;
  
        // 退室時のリスナー登録
        this.participants.forEach((participant) => {
          participant.addEventListener('left', this._onLeftParticipant.bind(this, participant.id));
        });
  
        // 成功コールバック
        if (succeededCallback != null) {
          succeededCallback();
        }
      }, (err) => {
        // リトライ
        if (this.joinRetryCount++ <= this.NUMBER_OF_RETRY_TO_JOIN) {
          console.warn(`[McuClient] retry join because failed: ${err}, roomId=${roomId}`);
  
          this._joinCore(roomId, userName, userRole, succeededCallback, failedCallback);
        }
        else {
          console.error(`[McuClient] join failed: ${err}, roomId=${roomId}`);
  
          // 失敗コールバック
          if (failedCallback != null) {
            failedCallback(err);
          }
        }
      });
    });
  }

  /**
   * @function _getJoinRoom
   * @desc 指定した名前のルームを取得
   * @param {String} roomName             -ルーム名
   * @param {Function} succeededCallback  -成功コールバック
   * @param {Function} failedCallback     -失敗コールバック
   */
  _getJoinRoom(roomName, succeededCallback, failedCallback) {
    let foundRoom = null;

    // ルームコンフィグ読み込み
    var config;
    if (roomName.indexOf('-subscribervideo') >= 0) {
      // 商談映像（全員）
      config = roomConfigsForSubscriberThumbnail;
    }
    else if (roomName.indexOf('-horizontalrow') >= 0) {
      // 商談映像（全員）横一列版
      config = roomConfigsForHorizontalRow;
    }
    else if (roomName.indexOf('-sharescreen') >= 0) {
      // 画面共有ルーム用
      config = roomConfigsSharescreen;
    }
    else {
      // カメラ映像＆音声ルーム、画面共有ルーム用
      config = roomConfigsForSubscriberThumbnail;
    }

    // ルーム一覧を取得して同名のルームがあるかを調べる
    this.getRoomList((rooms) => {
      for (let roomIndex=0; roomIndex<rooms.length; roomIndex++) {
        if (rooms[roomIndex].name == roomName) {
          if (foundRoom != null) {
            failedCallback(`同名のルームが複数存在します`);
            return;
          }

          foundRoom = rooms[roomIndex];
        }
      }

      // すでに同名のルームが存在する場合はそれを返して終了
      if (foundRoom != null) {
        if (succeededCallback != null) {
          this.updateRoom(foundRoom.id, config);
          succeededCallback(foundRoom);
          return;
        }
      }

      // ここに到達するのはルームがないということなので、ルームを作成する
      
      // ルーム作成
      this.createRoom(roomName, config, (room) => {
        if (succeededCallback != null) {
          // 作成したルームを返す
          succeededCallback(room);
        }
      },
      (e) => {
        if (failedCallback != null) {
          failedCallback(`ルームの失敗にしました : ${e}`);
          return;
        }
      });
    });
  }

  /**
   * @function leave
   * @desc ルーム退室
   */
  leave() {
    console.log('[McuClient] leave');

    if (this.roomId == null) {
      console.error('[McuClient] leave failed: this.roomId is null');
      return;
    }
    if (this.myId == null) {
      console.error('[McuClient] leave failed: this.myId is null');
      return;
    }

    // 退室
    this.conference.leave();

    // 自ら退室したのでフラグを立てる
    this.leaveBySelf = true;

    // 変数初期化
    this.roomId = undefined;
    this.myId = undefined;
    this.publicationInfos = new Array();
    this.participants = new Array();
    this.remoteStreams = new Array();
  };

  /**
   * @function isJoined
   * @desc 入室しているか
   * @return {Boolean}    -入室しているか
   */
  isJoined() {
    return this.getRoomId() != undefined;
  }

  /**
   * @function getRoomId
   * @desc ルームIDを取得
   * @return {String}   -ルームID
   */
  getRoomId() {
    return this.roomId;
  }

  /**
   * @function getMyId
   * @desc マイIDを取得
   * @return {String}   -マイID
   */
  getMyId() {
    return this.myId;
  }

  /**
   * @function getParticipantsList
   * @desc 参加者一覧を取得
   * @return {[Participant]}    -参加者一覧
   */
  getParticipantsList() {
    if (this.roomId == null) {
      console.error('[McuClient] getParticipantsList failed: this.roomId is null');
      return;
    }

    if (this.participants == null) {
      console.error('[McuClient] getParticipantsList failed: this.participants is null');
      return;
    }

    return this.participants;
  }

  /**
   * @function getRemoteStreams
   * @desc 配信ストリームを取得
   * @return {[Stream]}   -配信ストリーム一覧
   */
  getRemoteStreams() {
    if (this.roomId == null) {
      console.error('[McuClient] getParticipantsList failed: this.roomId is null');
      return;
    }

    if (this.remoteStreams == null) {
      console.error('[McuClient] getParticipantsList failed: this.remoteStreams is null');
      return;
    }

    return this.remoteStreams;
  }

  /**
   * @function publish
   * @desc ストリーム公開
   * @param {Stream} stream                 -ストリーム
   * @param {String} label                  -ストリームに付与する任意のラベル
   * @param {String} view                   -ビュー
   * @param {Object} options                -オプション
   * @param {Function} succeededCallback    -成功コールバック  
   * @param {Function} failedCallback       -失敗コールバック
   */
  publish(media, label, view, options, succeededCallback, failedCallback) {
    console.log('[McuClient] publish');

    if (media == null) {
      console.error('[McuClient] publish error: media is null');
      return;
    }
    if (label == null) {
      console.error('[McuClient] publish error: label is null');
      return;
    }
    if (view == null) {
      console.error('[McuClient] publish error: view is null');
      return;
    }
    if (this.roomId == null) {
      console.error('[McuClient] publish error: this.roomId is null');
      return;
    }

    // localStream生成
    let stream = new Owt.Base.LocalStream(media, new Owt.Base.StreamSourceInfo('mic', 'camera'));

    // リトライ回数初期化
    this.publishRetryCount = 0;

    // 公開
    this._publishCore(stream, label, view, options, succeededCallback, failedCallback);
  }

  /**
   * @function _publishCore
   * @desc ストリーム公開の内部処理
   * @param {Stream} stream                 -ストリーム
   * @param {String} label                  -ストリームに付与する任意のラベル
   * @param {String} view                   -ビュー
   * @param {Object} options                -オプション
   * @param {Function} succeededCallback    -成功コールバック  
   * @param {Function} failedCallback       -失敗コールバック
   */
  _publishCore(stream, label, view, options, succeededCallback, failedCallback) {
    console.log('[McuClient] publishCore');

    // 公開
    this.conference.publish(stream, options).then((publication) => {
      console.log('[McuClient] publish succeeded');

      // 自分の公開情報を保存
      this.publicationInfos.push({
        publication: publication,
        label: label,
        view: view,
      });

      // エラー時のコールバック設定
      // publication.addEventListener('error', (err) => {
      //   console.warn(`[McuClient] Publication error: ${err.error.message}`);
      // });

      // ルームの公開ストリームに自分のストリームを追加
      this.rest.addStream(this.roomId, publication.id, view, () => {
        console.log('[McuClient] add stream succeeded');

        // 通知
        if (succeededCallback != null) {
          succeededCallback();
        }
      });
    }, (err) => {
      // リトライ
      if (this.publishRetryCount++ <= this.NUMBER_OF_RETRY_TO_PUBLISH) {
        console.warn(`[McuClient] retry publish because failed: ${err}`);

        this._publishCore(stream, view, options, succeededCallback, failedCallback);
      }
      else {
        console.error(`[McuClient] publish failed: ${err}`);

        // 失敗コールバック
        if (failedCallback != null) {
          failedCallback(err);
        }
      }
    });
  }

  /**
   * @function stopPublish
   * @desc 公開を止める
   * @param {String} label  -ストリームのラベル
   * @param {String} view   -ビュー
   */
  stopPublish(label, view) {
    console.log('[McuClient] stopPublish');

    if (label == null) {
      console.error('[McuClient] publish error: label is null');
      return;
    }
    if (view == null) {
      console.error('[McuClient] publish error: view is null');
      return;
    }
    if (this.roomId == null) {
      console.error('[McuClient] stopPublish error: this.roomId is null');
      return;
    }

    // 停止する公開情報を探す
    let publicationInfo = this._findPublishing(label, view);
    if (publicationInfo == null) {
      console.error(`[McuClient] stopPublish error: not found publication label =${label}, view = ${view}`);
      return;
    }

    // ルームの映像からストリームを除外
    this.rest.removeStream(
      this.roomId, 
      publicationInfo.publication.id, 
      publicationInfo.view, 
      McuClient.outputRestResponse
    );

    // 一覧から削除
    this.publicationInfos = this.publicationInfos.filter(publicationInfo => publicationInfo.label != label || publicationInfo.view != view);
 }

  /**
   * @function republish
   * @desc ストリーム再公開
   * @param {Stream} stream                 -ストリーム
   * @param {String} label                  -ストリームに付与する任意のラベル
   * @param {String} view                   -ビュー
   * @param {Object} options                -オプション
   * @param {Function} succeededCallback    -成功コールバック  
   * @param {Function} failedCallback       -失敗コールバック
   */
  republish(stream, label, view, options, succeededCallback, failedCallback) {

    // すでに公開中の場合は、一旦停止
    if (this.isPublishing(label, view)) {
      this.stopPublish(label, view);
    }

    // 再公開
    this.publish(stream, label, view, options, succeededCallback, failedCallback);
  }

  /**
   * @function isPublishing
   * @desc ストリームを公開しているか
   * @param {String} label  -ストリームのラベル
   * @param {String} view   -ビュー
   * @return {Boolean}      -ストリームを公開しているか
   */
  isPublishing(label, view) {
    if (this._findPublishing(label, view) == null) {
      return false;
    }

    return true;
  }

  /**
   * @function _findPublishing
   * @desc 公開情報を検索する
   * @param {String} label  -ストリームのラベル
   * @param {String} view   -ビュー
   * @return {Object}       -発見した公開情報（見つからなかった場合はnull）
   */
  _findPublishing(label, view) {
    let publicationInfos = this.publicationInfos.filter(publicationInfo => publicationInfo.label == label && publicationInfo.view == view);
    if (publicationInfos.length == 0) {
      return null;
    }

    return publicationInfos[0];
  }

  /**
   * @function subscribe
   * @desc ストリーム受信の申し込み
   * @param {String} view                   -ビュー
   * @param {Object} options                -オプション
   * @param {Function} succeededCallback    -成功コールバック  
   * @param {Function} failedCallback       -失敗コールバック
   */
  subscribe(view, options, succeededCallback, failedCallback) {
    console.log('[McuClient] subscribe');

    // リトライ回数初期化
    this.subscribeRetryCount = 0;

    // ストリーム一覧からviewが一致するものを探す
    // ※forEachで処理しているが、一致するものは１つしかない想定
    let streams = this.getRemoteStreams();
    streams.forEach((stream) => {
      // streamのidにviewの文字列が含まれていれば対象のview
      if (stream.id.indexOf(view) > 0) {
        this._subscribeCore(stream, options, succeededCallback, failedCallback);
      }
    });
  }

  /**
   * @function _subscribeCore
   * @desc ストリーム受信の申し込みの内部処理
   * @param {Stream} stream                 -受信したいストリーム
   * @param {Object} options                -オプション
   * @param {Function} succeededCallback    -成功コールバック  
   * @param {Function} failedCallback       -失敗コールバック
   */
  _subscribeCore(stream, options, succeededCallback, failedCallback) {
    console.log('[McuClient] subscribeCore');

    this.conference.subscribe(stream, options).then((subscription) => {
      console.log('[McuClient] Subscription succeeded');

      // 通知
      if (succeededCallback != null) {
        succeededCallback(stream.mediaStream);
      }
    }, (err) => {
      // リトライ
      if (this.subscribeRetryCount++ <= this.NUMBER_OF_RETRY_TO_SUBSCRIBE) {
        console.warn(`[McuClient] retry subscribe because failed: ${err}`);

        this._subscribeCore(stream, options, succeededCallback, failedCallback);
      }
      else {
        console.error(`[McuClient] subscribe failed: ${err}`);

        // 失敗コールバック
        if (failedCallback != null) {
          failedCallback(err);
        }
      }
    });
  }
  
  /**
   * @function sendMessage
   * @desc メッセージ送信（全員）
   * @param {String} message    -メッセージ
   */
  sendMessage(message) {
    // console.log('[McuClient] sendMessage');

    this.sendMessageWithParticipantId(message, undefined);
  }

  /**
   * @function sendMessage
   * @desc メッセージ送信（送信先の参加者種別指定）
   * @param {String} message           -メッセージ
   * @param {String} participantType   -参加者種別
   */
  sendMessageWithParticipantType(message, participantType) {
    // console.log('[McuClient] sendMessageWithParticipantType');

    // 送信先の絞り込み
    let participants;
    switch (participantType) {
      case 'HOST_ONLY':// ホストのみ
        participants = this.participants.filter(participant => participant.role == 'host');
        break;

      default:
        console.error('[McuClient] sendMessageWithParticipantType error: illegal participantType');
        break;

    }

    // 送信先が複数人いる可能性があるのでforで処理
    participants.forEach((participant) => {
      this.sendMessageWithParticipantId(message, participant.id);
    });
  }

  /**
   * @function sendMessageWithParticipantId
   * @desc メッセージ送信（送信先の参加者ID指定）
   * @param {String} message        -メッセージ
   * @param {String} participantId  -参加者ID
   */
  sendMessageWithParticipantId(message, participantId) {
    // console.log('[McuClient] sendMessageWithParticipantId');

    if (this.roomId == null) {
      console.error('[McuClient] sendMessageWithParticipantId error: this.roomId is null');
      return;
    }

    if (message == null) {
      console.error('[McuClient] sendMessageWithParticipantId error: message is null');
      return;
    }

    if (participantId != undefined) {
      if (participantId === null) {
        console.error('[McuClient] sendMessageWithParticipantId error: participantId is null');
        return;
      }
  
      // 存在しない参加者IDの場合はエラー
      let participants = this.participants.filter(participant => participant.id == participantId);
      if (participants.length == 0) {
        console.error('[McuClient] sendMessageWithParticipantId error: not found participantId');
        return;
      }
    }
    
    this.conference.send(message, participantId);
  }

  /**
   * @function _onDisconnect
   * @desc 通信切断したときの処理
   * @param {Event} event   -イベント
   */
  _onDisconnect(event) {
    console.log(`[McuClient] disconnected: ${event.type}`);

    // 自ら退室した場合は何もしない
    if (this.leaveBySelf) {
      return;
    }

    // 通知
    if (this.eventListenerFunctionTable['disconnected'] != null) {
      this.eventListenerFunctionTable['disconnected'](event.type);
    }
  }

  /**
   * @function _onReceiveMessage
   * @desc メッセージを受信したときの処理
   * @param {Event} event   -イベント
   */
  _onReceiveMessage(event) {
    // 送信者が自分の場合は何もしない
    if (event.origin == this.myId) {
      return;
    }

    console.log(`[McuClient] message received: participantId = ${event.origin}, message = ${event.message}`);

    // 通知
    if (this.eventListenerFunctionTable['messagereceived'] != null) {
      this.eventListenerFunctionTable['messagereceived'](event.message, event.origin);
    }
  }

  /**
   * @function _joinParticipant
   * @desc 参加者が入室したときの処理
   * @param {Event} event   -イベント 
   */
  _joinParticipant(event) {
    console.log(`[McuClient] joined participant: ${event.participant.id}`);

    // 退室時のリスナー登録
    event.participant.addEventListener('left', this._onLeftParticipant.bind(this, event.participant.id));

    // 一覧に追加
    this.participants.push(event.participant);

    // 通知
    if (this.eventListenerFunctionTable['joinedParticipant'] != null) {
      this.eventListenerFunctionTable['joinedParticipant'](event.participant.id);
    }
  }

  /**
   * @function _onLeftParticipant
   * @desc 参加者が退室したときの処理
   * @param {String} participantId  -参加者ID
   */
  _onLeftParticipant(participantId) {
    console.log(`[McuClient] left participant: ${participantId}`);

    // 一覧から除外
    this.participants = this.participants.filter(participant => participant.id != participantId);

    // 通知
    if (this.eventListenerFunctionTable['leftParticipant'] != null) {
      this.eventListenerFunctionTable['leftParticipant'](participantId);
    }
  }

  /**
   * @function outputRestResponse
   * @desc リクエストのレスポンス内容をログに表示する（デバッグ用）
   * @param {String} response  -レスポンス
   */
  static outputRestResponse(response) {
    if (response) {
      try {
        console.info('[McuClient] response = ', JSON.parse(response));
      } catch (e) {
        console.info('[McuClient] response = ', response);
      }
    } else {
      console.info('[McuClient] response = null');
    }
  }




  //↓↓↓↓↓↓SkyWayAPI互換用ラッパー↓↓↓↓
  


  /**
   * @function on
   * @desc イベントリスナー登録
   * @param {String} eventName    -イベント名
   * @param {Function} func       -コールバック
   */
  on(eventName, func) {
    switch(eventName) {
      // メッセージ受信イベント
      case 'data':
        this.addEventListener('messagereceived', (message, origin) => {
          func({
            src: origin,
            data: message
          });
        });
        break;
      
      case 'peerJoin':
        this.addEventListener('joinedParticipant', func);
        break;

      case 'peerLeave':
        this.addEventListener('leftParticipant', func);
        break;

    }
  }

  /**
   * @function replaceStream
   * @desc ストリーム再公開
   * @param {Stream} stream                 -ストリーム
   * @param {String} label                  -ストリームに付与する任意のラベル
   * @param {String} view                   -ビュー
   * @param {Object} options                -オプション
   * @param {Function} succeededCallback    -成功コールバック  
   * @param {Function} failedCallback       -失敗コールバック
   */
  replaceStream(stream, label, view, options, succeededCallback, failedCallback) {
    this.republish(stream, label, view, options, succeededCallback, failedCallback);
  }

  /**
   * @function send
   * @desc メッセージ送信
   * @param {String} message    -メッセージ
   */
  send(message) {
    // console.log('[McuClient] send');

    this.sendMessage(message);
  }

  /**
   * @function close
   * @desc 退室
   */
  close() {
    this.leave();
  }

  /**
   * @function members
   * @desc 参加者一覧取得
   * @return {Array}    -参加者一覧
   */
  get members() {
    // 自分以外の参加者IDリストを生成
    let participantIds = [];
    this.participants.forEach((participant) => {
      if (participant.id != this.myId) {
        participantIds.push(participant.id);
      }
    });
    return participantIds;
  }
}
