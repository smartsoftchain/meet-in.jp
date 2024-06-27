'use strict';

const McuRest = class {
  /**
   * コンストラクタ
   */
  constructor() {
    /**
     * sendのbodyなし
     */
    this.UNUSED_BODY = undefined;

    /**
     * host
     */
    this.HOST = 'https://p002.mcu-rtc.net:3004';
    // this.HOST = 'https://aws-mcu.sense.co.jp:3004';
    // this.HOST = 'https://aws-mcu2.sense.co.jp:3004';
    // this.HOST = 'https://mcu-const.sense.co.jp:3004';
    console.log('[McuRest] init');
  }

  /**
   * @function setMcuServer
   * @desc REST API用のMCUサーバの設定
   * @param {String} url    -サーバのURL
   * @param {Function} func       -関数
   */
  setMcuServer(url) {
    this.HOST = url;
  }

  /**
   * @function createRoom
   * @desc ルーム作成
   * @param {String} roomName       -ルーム名
   * @param {Object(Room)} config   -コンフィグ
   * @param {Function} callback     -コールバック
   */
  createRoom(roomName, config, callback) {
    let body = {
      name: roomName,
      options: config,
    };

    this.send(
      'POST', 
      '/rooms', 
      body,
      callback
    );
  };

  /**
   * @function deleteRoom
   * @desc ルーム削除
   * @param {String} roomId       -ルームID
   * @param {Function} callback   -コールバック
   */
  deleteRoom(roomId, callback) {
    let body = this.UNUSED_BODY;

    this.send(
      'DELETE', 
      `/rooms/${roomId}`, 
      body, 
      callback
    );
  };
  
  /**
   * @function getRoomList
   * @desc ルーム一覧取得
   * @param {Function} callback   -コールバック
   */
  getRoomList(callback) {
    let body = this.UNUSED_BODY;

    this.send(
      'GET', 
      '/rooms', 
      body, 
      callback
    );
  };

  /**
   * @function updateRoomConfig
   * @desc ルーム設定の更新
   * @param {String} roomId           -ルームID
   * @param {[Object(Room)]} config   -コンフィグ
   * @param {Function} callback       -コールバック
   */
  updateRoom(roomId, config, callback) {
    let body = config;

    this.send(
      'PUT', 
      `/rooms/${roomId}`, 
      body,
      callback
    );
  };

  /**
   * @function getRoom
   * @desc ルーム設定の更新
   * @param {String} roomId       -ルームID
   * @param {Function} callback   -コールバック
   */
  getRoom(roomId, callback) {
    let body = this.UNUSED_BODY;

    this.send(
      'GET', 
      `/rooms/${roomId}`, 
      body,
      callback
    );
  };
  /**
   * @function createToken
   * @desc トークン生成
   * @param {String} roomId       -ルームID
   * @param {String} userName     -ユーザー名
   * @param {String} role         -ロール
   * @param {Function} callback   -コールバック
   */
  createToken(roomId, userName, role, callback) {
    let body = {
      room: roomId,
      user: userName,
      role: role
    };

    this.send(
      'POST', 
      '/tokens/', 
      body, 
      callback
    );
  };

  /**
   * @function getParticipantList
   * @desc 参加者一覧取得
   * @param {String} roomId       -ルームID
   * @param {Function} callback   -コールバック
   */
  getParticipantList(roomId, callback) {
    let body = this.UNUSED_BODY;

    this.send(
      'GET', 
      `/rooms/${roomId}/participants/`,
      body, 
      callback
    );
  };
  
  /**
   * @function addStream
   * @desc 指定したストリームをルームの公開ストリームに追加
   * @param {String} roomId       -ルームID
   * @param {String} streamId     -ストリームId
   * @param {String} view         -ビュー
   * @param {Function} callback   -コールバック
   */
  addStream(roomId, streamId, view, callback) {
    let body = [
      {
        op: 'add',
        path: '/info/inViews',
        value: view
      }
    ];

    this.send(
      'PATCH', 
      `/rooms/${roomId}/streams/${streamId}`,
      body, 
      callback
    );
  };
  
  /**
   * @function removeStream
   * @desc 指定したストリームをルームの公開ストリームから除外
   * @param {String} roomId       -ルームID
   * @param {String} streamId     -停止させるストリームのID
   * @param {String} view         -ビュー
   * @param {Function} callback   -コールバック
   */
  removeStream(roomId, streamId, view, callback) {
    let body = [
      {
        op: 'remove',
        path: '/info/inViews',
        value: view
      }
    ];

    this.send(
      'PATCH', 
      `/rooms/${roomId}/streams/${streamId}`,
      body, 
      callback
    );
  };
  
  /**
   * @function removeStream
   * @desc 指定したストリームを除外
   * @param {String} roomId       -ルームID
   * @param {String} streamId     -停止させるストリームのID
   * @param {String} view         -ビュー
   * @param {Function} callback   -コールバック
   */
  replaceStream(roomId, streamId, view, callback) {
    let body = [
      {
        op: 'remove',
        path: '/info/inViews',
        value: view
      }
    ];

    this.send(
      'PATCH', 
      `/rooms/${roomId}/streams/${streamId}`,
      body, 
      callback
    );
  };

  /**
   * @function send
   * @desc リクエスト送信
   * @param {String} method       -メソッドタイプ
   * @param {String} apiName      -API名
   * @param {Object} body         -送信データ
   * @param {Function} callback   -コールバック
   */
  send(method, apiName, body, callback) {
    let httpRequest = new XMLHttpRequest();

    // コールバック設定
    httpRequest.onreadystatechange = function () {
      if (httpRequest.readyState === 4) {
        console.log(`[McuRest] send respond : method = ${method}, url = ${url}`);
        // console.log(`[McuRest] send respond : response = ${httpRequest.responseText}`);
        
        callback(httpRequest.responseText);
      }
    };

    // URL生成
    let url = this.generateUrl(apiName);
    console.log(`[McuRest] send : method = ${method}, url = ${url}`);

    // リクエスト送信
    httpRequest.open(method, url, true);
    httpRequest.setRequestHeader('Content-Type', 'application/json');
    if (body !== this.UNUSED_BODY) {
      httpRequest.send(JSON.stringify(body));
    } else {
      httpRequest.send();
    }
  };

  /**
   * @function generateUrl
   * @desc URL生成
   * @param {String} apiName    -API名 
   */
  generateUrl(apiName) {
    // hostが定義されている場合は、hostからurl生成
    // hostが定義されていない場合は、documentからurl生成
    let url;
    if (this.HOST !== undefined) {
      url = this.HOST + apiName;
    }
    else {
      let u = new URL(document.URL);
      url = u.origin + apiName;
    }

    return url;
  }
}



