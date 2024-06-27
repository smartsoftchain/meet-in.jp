/**
 * TMO用クラス
 */
;(function() {

	"use strict";

	var root = this;
	root.TMO = root.TMO || {};

	/**
	 * チャットクライアント
	 */
	TMO.ChatClient = function() {
		
		// WebSocketをサポートしていないブラウザ対応
		if (!("WebSocket" in window)) {
		    alert("ご利用のブラウザではチャットをご利用いただけません。");
		    return false;
		}
		
		this.initialize.apply(this, arguments);
	};

	TMO.ChatClient.prototype = {
			
		// 送信するデータタイプ
		DATA_TYPE_SEND_MESSAGE     : "sendChatMessage",		// 送信チャットメッセージタイプ
		DATA_TYPE_READ_MESSAGE     : "readMessage",			// チャット既読データタイプ
		DATA_TYPE_LOGIN_CHAT       : "loginChat",			// チャットログインデータタイプ
		DATA_TYPE_SHOW_LOGIN_STATE : "showLoginState",		// ログイン状態表示データタイプ
		DATA_TYPE_HIDE_LOGIN_STATE : "hideLoginState",		// ログイン状態非表示データタイプ
		DATA_TYPE_ENTRY_ROOM       : "enterRoom",			// チャットルーム入室データタイプ
		DATA_TYPE_EXIT_ROOM        : "exitRoom",			// チャットルーム退出データタイプ
		
		// ユーザタイプ
		USER_TYPE_SV    : "SV",			// 管理者(SV)
		USER_TYPE_STAFF : "STAFF",		// 担当者
		
		// チャット設定
		setting : {
			serverIp         : "127.0.0.1",		// チャット用サーバIP
			serverPort       : "3001",			// チャット用サーバポート
			authType         : "1",				// 権限タイプ[管理者:SV, 担当者:STAFF]
			roomId           : "",				// チャットを行うルームID
			onSuccessAuth    : function(){},	// チャットサーバ認証が成功した時に実行
			onCloseConnect   : function(){},	// チャットサーバとのコネクションが切断されたとき実行
			onReceiveMessage : function(){}		// チャットサーバからメッセージを受信すると実行
		},
		
		wsAddress  : "",	// ソケットサーバのアドレス
		ws         : "",    // WebSocketオブジェクト
		
		chatId       : "", 	// このクライアントのチャットID
		targetChatId : "", 	// チャットを行う相手のチャットID
		staffName    : "",	// スタッフ名
		
		messageListCurrentPage : 1, // チャットメッセージリスト取得時のページ番号。初期値は0

		initialize : function(userSetting) {
			
			// チャット設定
			this.setting = $.extend(this.setting, userSetting);
			
			if (this.setting.serverIp !== "" && this.setting.serverPort !== "") {
				 this.wsAddress = "wss://" + this.setting.serverIp + ":" + this.setting.serverPort + "/websocket/chat/";
				
				// ハンドシェイクスタート
				this._handshake();
			} else {
				throw new Error("チャット初期設定に失敗しました。");
			}
		},
		
		/**
		 * チャットモーダル画面を開く
		 * @param data_target モーダル定義されている箇所のID要素名
		 */
		modal : function(data_target) {
			
	        $('body').append('<div class="modal-overlay"></div>');
	        $('.modal-overlay').fadeIn('fast');
	        var modal = '#' + data_target;
	        modalResize();
	        $(modal).fadeIn('fast');

	        // 外を消してもモーダルを閉じないようにするために、common.jsのイベントを消す。（モードレスにしたい）
	        $(".modal-overlay").off();
	        
	        $('#chat-modal-close').off().click(function(){
	            $(modal).fadeOut('fast');
	            $('.modal-overlay').fadeOut('fast',function(){
	                $('.modal-overlay').remove();
	            });
	        });

	        $(window).on('resize', function(){
	            modalResize();
	        });

	        function modalResize(){
	            var w = $(window).width();
	            var h = $(window).height();
	            var x = (w - $(modal).outerWidth(true)) / 2;
	            var y = (h - $(modal).outerHeight(true)) / 2;
	            $(modal).css({'left': x + 'px','top': y + 'px'});
	        }
		},

		/**
		 * チャットサーバに接続
		 */
		_handshake : function() {
			
			var self = this;
			
			this.ws = new WebSocket(this.wsAddress);

			// ハンドシェイク成功時に行う処理
			this.ws.onopen = function(e) {
				
				_U.log("(1) : SUCCESSED HANDSHAKE");

				// チャットサーバ認証。認証できるとチャット入室トークンを取得する
			 	$.ajax({
			 		url: "/help/auth-chat-server",
			 		type: "GET",
			 		data : {
			 			"authType" : self.setting.authType
			 		},
			 		dataType: 'json',
			 		success: function(result) {
			 			
			 			
			 			_U.log("received data" , result);
	
			 			if (result !== "" && result["resultCode"] === TMO.CONST.AJAX.SUCCESS) {
			 				
			 				_U.log("(2) : SUCCESSED AUTH CHAT SERVER");
			 				
			 				// チャットIDを保存
			 				self.chatId = result["chatId"];
			 				
			 				// スタッフ名を保存
			 				self.staffName = result["staffName"];
			 				
			 				// チャットログイン
							self._sendMessage({
								"authType"  : self.setting.authType,
								"dataType"  : self.DATA_TYPE_LOGIN_CHAT,
								"token"     : result["token"],
							});
							
							// チャットサーバ認証成功に実行
							self.setting.onSuccessAuth();
			 				
			 			} else {
			 				throw new Error("Chat Auth Error");
			 				_U.log(data["message"]);
			 			}
			 		}
			 	});
			};

			// メッセージを受信したときの処理
			this.ws.onmessage = function(e) {
			
				var receivedData = JSON.parse(e.data);
				
				_U.log("pure received data : ", receivedData);
				
				self.setting.onReceiveMessage(receivedData);
			};
			
			// チャットサーバから切断されたとき
			this.ws.onclose   = function(e) {
				
				_U.log("チャットが接続先から切断されました");
				//alert("チャットが接続先から切断されました");
				
				self.setting.onCloseConnect();
			};
			
			// エラーが発生した場合
			this.ws.onerror   = this._onError;
		},
		
		/**
		 * Websocketが現在接続済みかをチェック
		 */
		isOpenedWebSocket : function() {
			
//			_U.log("WebSocket.CONNECTING  : ", WebSocket.CONNECTING );
//			_U.log("WebSocket.OPEN        : ", WebSocket.OPEN);
//			_U.log("WebSocket.CLOSING     : ", WebSocket.CLOSING);
//			_U.log("WebSocket.CLOSED      : ", WebSocket.CLOSED);
			
			// 接続状況がOPENになっていないとチャット不可
			if (this.ws.readyState === WebSocket.OPEN) {
				return true;
			} else {
				alert("現在チャットサーバはメンテナンス中です。しばらくしてから再度接続してください")
			}
			
			return false;
		},
		
		/**
		 * エラーが発生した場合
		 */
		_onError : function(e) {
			_U.log("チャット接続にエラーが発生しました。再度接続を行ってください。");
			//alert("チャット接続にエラーが発生しました。再度接続を行ってください。")
		},
		
		/**
		 * チャットメッセージを送信する
		 * @param 送信メッセージ
		 * @param 送信先ルームID
		 */
		sendChatMessage : function(_message) {
			
			var roomId  = this.setting.roomId || "";	// STAFFの場合、入室時に既に設定済
			var message = _message || "";
			
			if (message === "") {
				alert("メッセージが未入力です");
				return false;
			}
			
			// 送信元権限が「担当者」の場合、ルームID設定は必須。「SV」の場合は入れるチャットルームは固定なので不要
			if (this.setting.authType === this.USER_TYPE_STAFF && roomId === "") {
				alert("チャットルーム設定が不正です");
				return false;
			}

			// チャットメッセージ送信
			this._sendMessage({
				"dataType"  : this.DATA_TYPE_SEND_MESSAGE,
				"roomId"    : roomId,
				"message"   : message
			});
		},
		
		/**
		 * サーバに送信する様々なメッセージをチャットサーバに送信
		 * @param data 送信するJSONデータ
		 */
		_sendMessage : function(data) {
			
			_U.log("sending data : ", data);
			
			// JSON文字列化
			var jsonString = JSON.stringify(data);
			
			this.ws.send(jsonString);
		},
		
		/**
		 * チャットを切断する
		 */
		close : function() {
			this.ws.close();
		},
		
		/**
		 * 現在設定されているルームIDを取得
		 */
		getCurrentRoomId : function() {
			return this.setting.roomId;
		},
		
		/**
		 * 現在のルームIDを設定
		 */
		setCurrentRoomId : function(roomId) {
			this.setting.roomId = roomId;
		},
		
		/**
		 * 現在設定されているチャット相手のチャットIDを取得
		 */
		getCurrentTargetChatId : function() {
			return this.targetChatId;
		},
		
		/**
		 * 現在のチャット相手のチャットIDを設定
		 */
		setCurrentTargetChatId : function(targetChatId) {
			this.targetChatId = targetChatId;
		},
		
		/**
		 * メッセーリストの現在のページを指定
		 */
		setMessageListCurrentPage : function(page) {
			this.messageListCurrentPage = page;
		},

		/**
		 * 自らのログイン状態を「公開」状態にする
		 */
		showLoginState : function() {
			
			var data = {
				"dataType"  : this.DATA_TYPE_SHOW_LOGIN_STATE
			};
			
			// ログイン状態を「公開」する
			this._sendMessage(data);
		},
		
		/**
		 * 自らのログイン状態を「非公開」状態にする
		 */
		hideLoginState : function() {
			
			var data = {
				"dataType"  : this.DATA_TYPE_HIDE_LOGIN_STATE
			};
			
			// ログイン状態を「公開」する
			this._sendMessage(data);
		},
		
		/**
		 * チャットルームに入室する。
		 */
		enterRoom : function() {
			
			var data = {
				"dataType"     : this.DATA_TYPE_ENTRY_ROOM,
				"authType"     : this.setting.authType,
				"chatId"       : this.chatId,
				"targetChatId" : this.targetChatId,
				"staffName"    : this.staffName
			};
			
			// チャットルーム入室メッセージ送信
			this._sendMessage(data);
		},
		
		/**
		 * チャットルームを退出
		 */
		exitRoom : function() {
			
			var data = {
				"dataType"  : this.DATA_TYPE_EXIT_ROOM,
				"authType"  : this.setting.authType,
				"chatId"    : this.chatId,
				"staffName" : this.staffName
			};
			
			// チャットルーム退室メッセージ送信
			this._sendMessage(data);
		},
		
		/**
		 * メッセージを既読処理
		 */
		readMessage : function(_targetChatId, _messageId) {
			
			var roomId       = this.setting.roomId || "";	// STAFFの場合、入室時に既に設定済
			var targetChatId = _targetChatId || "";			// メッセージ送信者のchatId
			var messageId    = _messageId || "";
			
			// まだ一度もチャットを介していない場合はここでエラーになる。
			if (messageId === "") {
				_U.log("DOESN'T EXIST CHAT HISTORY")
				return false;
			}
			
			if (roomId === "") {
				throw new Error("ルームIDが設定されていません");
				
				return false;
			}
			
			if (targetChatId === "") {
				throw new Error("メッセージ送信者のチャットIDが設定されていません");
				return false;
			}
			
			var data = {
				"dataType"     : this.DATA_TYPE_READ_MESSAGE,
				"targetChatId" : targetChatId,
				"roomId"       : roomId,
				"messageId"    : messageId
			};
			
			// 既読メッセージ送信
			this._sendMessage(data);
		},
		
		/**
		 * ルームに紐づくチャットメッセージ履歴を取得
		 */
		getRoomChatMessageList : function(_callback) {
			
			var self = this;
			
			var callback    = _callback || function(){};
			var currentPage = this.messageListCurrentPage;
			
			_U.log("CURRENT CHAT MESSAGE PAGE : ", currentPage);

			// ルームに紐づいたチャットメッセージリストを取得
		 	$.ajax({
		 		url: "/help/room-chat-message-list",
		 		type: "GET",
		 		data : {
		 			"authType" : self.setting.authType,
		 			"roomId"   : self.setting.roomId,
		 			//"targetChatId" : self.targetChatId, 
		 			"page"     : currentPage
		 		},
		 		dataType: 'json',
		 		success: function(result) {

		 			if (result !== "" && result["resultCode"] === TMO.CONST.AJAX.SUCCESS) {
		 				
		 				var messageList = result["chatMessageList"];
		 				
		 				_U.log("(6) : SUCCESSED GET ROOM MESSAGE LIST");
		 				_U.log("MESSAGE LIST : ", messageList);
		 				
		 				// 次に読みこむページ番号を設定
		 				if (0 < messageList.length) {
		 					self.messageListCurrentPage = currentPage + 1;
		 				}
		 				
		 				// コールバック呼出
		 				callback(messageList);
		 				
		 			} else {
		 				_U.log(result["message"]);
		 			}
		 		}
		 	});
		}
	};

}).call(this);