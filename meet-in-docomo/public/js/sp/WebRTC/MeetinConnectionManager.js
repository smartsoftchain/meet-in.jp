// 接続を管理するクラス
var MeetinConnectionManager;
(function (MeetinConnectionManager) {
	// ログ表示
	const SHOW_LOG = false;
	
	// 接続管理のコンストラクタ
	var MeetinConnection = (function () {
		// メッセージ交換用ピア
		var mPeerData = null;
		
		var mReady = true;

		function MeetinConnection() {
		}
		
		//////////////////////////////////////////////////////////
		// ・初期化
		// ・破棄
		//////////////////////////////////////////////////////////
		
		// 接続管理の初期化
		var init = function(
				existPeerId,
				peerOpenCallback,
				peerConnectionCallback,
				peerCallCallback,
				peerCloseCallback,
				peerDisconnectedCallback,
				peerErrorCallback,
				dataConnectionDataCallback,
				dataConnectionOpenCallback,
				dataConnectionCloseCallback,
				dataConnectionErrorCallback,
				mediaConnectionStreamCallback,
				mediaConnectionCloseCallback,
				mediaConnectionErrorCallback
			) {
			if (SHOW_LOG) {
				console.log('[MeetinConnection][init][start]');
			}
			
			// メッセージ交換用ピアを破棄する
			closePeerConnection(mPeerData);
			destroyPeer(mPeerData);
			mPeerData = null;

			// PeerServerへの接続が確立した時
			var peerOpenCallbackWork = function(id) {
				if (SHOW_LOG) {
					console.log('[MeetinConnection][init][Peer][open]:My Peer = '+ id);
				}
				
				if (peerOpenCallback && typeof peerOpenCallback === "function") {
					peerOpenCallback(mPeerData, id);
				}
			}
			
			// 接続先のピアと接続が確立した時
			var peerConnectionCallbackWork = function(dataConnection) {
				var myPeerId = null;
				var targetPeerId = null;
				var connectionId = null;
				if (mPeerData) {
					myPeerId = mPeerData.id;
				}
				if (dataConnection) {
					targetPeerId = dataConnection.peer;
					connectionId = dataConnection.id;
				}

				if (SHOW_LOG) {
					console.log('[MeetinConnection][init][Peer][connect]:Target Peer = ' + targetPeerId + ' -> Connection = ' + connectionId + ' -> My Peer = '+ myPeerId);
				}
/*
				// データの種類がcommandの場合
				if (dataConnection.label === 'command') {
					// データ受信時
					dataConnection.on(
						'data', 
						function(data){
							if (SHOW_LOG) {
								console.log('[MeetinConnection][init][DataConnection][data]:Target Peer = ' + targetPeerId + ' -> Connection = ' + connectionId + ' -> My Peer = ' + myPeerId + ', data = ' + data);
							}

							if (dataConnectionDataCallback && typeof dataConnectionDataCallback === "function") {
								dataConnectionDataCallback(dataConnection, data, myPeerId, targetPeerId, connectionId);
							}
						}
					);
			
					// コネクションが利用可能となった時
					dataConnection.on(
						'open', 
						function(){
							if (SHOW_LOG) {
								console.log('[MeetinConnection][init][DataConnection][open]:Target Peer = ' + targetPeerId + ' -> Connection = ' + connectionId + ' -> My Peer = '+ myPeerId);
							}
							
							if (dataConnectionOpenCallback && typeof dataConnectionOpenCallback === "function") {
								dataConnectionOpenCallback(dataConnection, myPeerId, targetPeerId, connectionId);
							}
						}
					);
			
					// 自分がクローズした、または接続先にクローズされた時
					dataConnection.on(
						'close', 
						function(){
							if (SHOW_LOG) {
								console.log('[MeetinConnection][init][DataConnection][close]:My Peer = '+ myPeerId + ' <-> Connection = ' + connectionId + ' <-> Target Peer = ' + targetPeerId);
							}
							
							if (dataConnectionCloseCallback && typeof dataConnectionCloseCallback === "function") {
								dataConnectionCloseCallback(dataConnection, myPeerId, targetPeerId, connectionId);
							}
						}
					);
				
					// エラーが起きた時
					dataConnection.on(
						'error', 
						function(err){
							if (SHOW_LOG) {
								var errType = null;
								var errMessage = null;
								if (err) {
									errType = err.type;
									errMessage = err.message;
								}
								console.log('[MeetinConnection][init][DataConnection][error]:Target Peer = ' + targetPeerId + ' -> Connection = ' + connectionId + ' -> My Peer = '+ myPeerId + ', err.type = ' + errType + ', err.message = ' + errMessage);
							}
							
							if (dataConnectionErrorCallback && typeof dataConnectionErrorCallback === "function") {
								dataConnectionErrorCallback(dataConnection, err, myPeerId, targetPeerId, connectionId);
							}
						}
					);
				}
*/
				// ピア接続時のコールバック
				if (peerConnectionCallback && typeof peerConnectionCallback === "function") {
					peerConnectionCallback(mPeerData, dataConnection);
				}
			}
			
			// 接続先が自分に発信してきた時
			var peerCallCallbackWork = function(mediaConnection) {
				var myPeerId = null;
				var targetPeerId = null;
				var connectionId = null;
				if (mPeerData) {
					myPeerId = mPeerData.id;
				}
				if (mediaConnection) {
					targetPeerId = mediaConnection.peer;
					connectionId = mediaConnection.id;
				}

				if (SHOW_LOG) {
					console.log('[MeetinConnection][init][Peer][call]:Target Peer = ' + targetPeerId + ' -> Connection = ' + connectionId + ' -> My Peer = '+ myPeerId);
				}

				// 相手から返されるストリームのコールバック
				mediaConnection.on('stream', function(stream){
					var streamId = null;
					if (stream) {
						streamId = stream.id;
					}
					
					if (SHOW_LOG) {
						console.log('[MeetinConnection][init][MediaConnection][stream]:Target Peer = ' + targetPeerId + ' -> Connection = ' + connectionId + ' -> My Peer = '+ myPeerId + ', stream.id = ' + streamId);
					}

					if (mediaConnectionStreamCallback && typeof mediaConnectionStreamCallback === "function") {
						mediaConnectionStreamCallback(mediaConnection, stream, myPeerId, targetPeerId, connectionId);
					}
				});
				
				// 自分か相手のpeerがmedia connectionをクローズした時に発生
				mediaConnection.on('close', function(){
					if (SHOW_LOG) {
						console.log('[MeetinConnection][init][MediaConnection][close]:My Peer = '+ myPeerId + ' <-> Connection = ' + connectionId + ' <-> Target Peer = ' + targetPeerId);
					}

					closeConnectionByPeerIdAndConnectionId(
						targetPeerId,
						connectionId
					);

					if (mediaConnectionCloseCallback && typeof mediaConnectionCloseCallback === "function") {
						mediaConnectionCloseCallback(mediaConnection, myPeerId, targetPeerId, connectionId);
					}
				});

				// エラーが発生した時
				mediaConnection.on('error', function(err){
					if (SHOW_LOG) {
						var errType = null;
						var errMessage = null;
						if (err) {
							errType = err.type;
							errMessage = err.message;
						}
						console.log('[MeetinConnection][init][MediaConnection][error]:Target Peer = ' + targetPeerId + ' -> Connection = ' + connectionId + ' -> My Peer = '+ myPeerId + ', err.type = ' + errType + ', err.message = ' + errMessage);
					}

					if (mediaConnectionErrorCallback && typeof mediaConnectionErrorCallback === "function") {
						mediaConnectionErrorCallback(mediaConnection, err, myPeerId, targetPeerId, connectionId);
					}
				});

				if (peerCallCallback && typeof peerCallCallback === "function") {
					peerCallCallback(mPeerData, mediaConnection);
				}
			}
			
			// ピアとの接続がdestroyedとなった時
			var peerCloseCallbackWork = function() {
				if (SHOW_LOG) {
					var myPeerId = null;
					if (mPeerData) {
						myPeerId = mPeerData.id;
					}
	
					console.log('[MeetinConnection][init][Peer][close]:My Peer = '+ myPeerId);
				}
				
				if (peerCloseCallback && typeof peerCloseCallback === "function") {
					peerCloseCallback(mPeerData);
				}
			}
			
			// disconnectedが起きたとき
			var peerDisconnectedCallbackWork = function() {
				if (peerDisconnectedCallback && typeof peerDisconnectedCallback === "function") {
					peerDisconnectedCallback(mPeerData);
				}
			}
			
			// エラーが起きた時
			var peerErrorCallbackWork = function(err) {
				if (SHOW_LOG) {
					var myPeerId = null;
					if (mPeerData) {
						myPeerId = mPeerData.id;
					}

					var errType = null;
					var errMessage = null;
					if (err) {
						errType = err.type;
						errMessage = err.message;
					}
					console.log('[MeetinConnection][init][Peer][error]:My Peer = '+ myPeerId + ', err.type = ' + errType + ', err.message = ' + errMessage);
				}
				
				if (peerErrorCallback && typeof peerErrorCallback === "function") {
					peerErrorCallback(mPeerData, err);
				}
			};

			mReady = true;
			
			// ピアを作る
			mPeerData = createPeer(
				existPeerId,
				peerOpenCallbackWork,
				peerConnectionCallbackWork,
				peerCallCallbackWork,
				peerCloseCallbackWork,
				peerDisconnectedCallbackWork,
				peerErrorCallbackWork
				);
			
			return mPeerData;
		};

		// 接続管理の初期化
		MeetinConnection.prototype.init = function(
				existPeerId,
				peerOpenCallback,
				peerConnectionCallback,
				peerCallCallback,
				peerCloseCallback,
				peerDisconnectedCallback,
				peerErrorCallback,
				dataConnectionDataCallback,
				dataConnectionOpenCallback,
				dataConnectionCloseCallback,
				dataConnectionErrorCallback,
				mediaConnectionStreamCallback,
				mediaConnectionCloseCallback,
				mediaConnectionErrorCallback
			) {
			return init(
				existPeerId,
				peerOpenCallback,
				peerConnectionCallback,
				peerCallCallback,
				peerCloseCallback,
				peerDisconnectedCallback,
				peerErrorCallback,
				dataConnectionDataCallback,
				dataConnectionOpenCallback,
				dataConnectionCloseCallback,
				dataConnectionErrorCallback,
				mediaConnectionStreamCallback,
				mediaConnectionCloseCallback,
				mediaConnectionErrorCallback
			);
		};
		
		// 接続管理の破棄
		// isCloseConnectionInfo：データベースに保存した接続情報を更新するか？
		//						true=更新する
		//						false=更新しない
		// connection_info_id：更新対象レコードのID
		var destroy = function(
				isCloseConnectionInfo, 
				connection_info_id
			) {
			if (SHOW_LOG) {
				console.log('[MeetinConnection][destroy][start]:connection_info_id = '+ connection_info_id);
			}

			mReady = false;
			
			// データベースに保存した接続情報を更新する
			if (isCloseConnectionInfo) {
				if (connection_info_id) {
					closeConnectionInfo(
						connection_info_id,
						null,
						null,
						null
						);
				}
			}
			
//			closeAllDataConnection();
			
			// メッセージ交換用ピアを破棄する
			closePeerConnection(mPeerData);
			destroyPeer(mPeerData);
			mPeerData = null;
		};

		// 接続管理の破棄
		// isCloseConnectionInfo：データベースに保存した接続情報を更新するか？
		//						true=更新する
		//						false=更新しない
		// connection_info_id：更新対象レコードのID
		MeetinConnection.prototype.destroy = function(
				isCloseConnectionInfo, 
				connection_info_id
			) {
			destroy(
				isCloseConnectionInfo, 
				connection_info_id
			);
		};

		// メッセージ交換用ピアが使用可能か？
		var isPeerDataValid = function(
			) {
			if (mPeerData && !mPeerData.disconnected && !mPeerData.destroyed) {
				return true;
			}
			
			return false;
		};

		// メッセージ交換用ピアが使用可能か？
		MeetinConnection.prototype.isPeerDataValid = function(
			) {
			return isPeerDataValid();
		};

		// メッセージ交換用ピアのIDを取得
		var getPeerDataId = function(
			) {
			if (mPeerData && !mPeerData.disconnected && !mPeerData.destroyed) {
				return mPeerData.id;
			}
			
			return null;
		};

		// メッセージ交換用ピアのIDを取得
		MeetinConnection.prototype.getPeerDataId = function(
			) {
			return getPeerDataId();
		};

		// メッセージ交換用ピアを取得
		var getPeerData = function(
			) {
			if (mPeerData && !mPeerData.disconnected && !mPeerData.destroyed) {
				return mPeerData;
			}
			
			return null;
		};

		// メッセージ交換用ピアを取得
		MeetinConnection.prototype.getPeerData = function(
			) {
			return getPeerData();
		};
/*
		//////////////////////////////////////////////////////////
		// ・DataConnection
		//////////////////////////////////////////////////////////
		
		// 特定なピアへの接続
		var connectDataConnection = function(
				target_peer_id, 
				errorCallback,
				dataConnectionDataCallback,
				dataConnectionOpenCallback,
				dataConnectionCloseCallback,
				dataConnectionErrorCallback
			) {
			if (SHOW_LOG) {
				console.log('[MeetinConnection][connectDataConnection][start]:target_peer_id = ' + target_peer_id);
			}

			// 接続条件：
			// ・自分のピアが存在する
			// ・PeerServerとのアクティブなコネクションがある
			// ・自分のピアが接続に利用されている
			if (isPeerDataValid()) {
				// 接続先のピアIDが正しい場合
				if (target_peer_id && target_peer_id.length > 0) {
					var myPeerId = mPeerData.id;
					
					// すでに接続か？
					var connection = getDataConnectionByTargetPeerId(target_peer_id);
					if (connection) {
						return connection;
					}
					
					var dataConnection = mPeerData.connect(target_peer_id, {
						label: 'command',
						serialization: 'none',
						reliable: true,
						metadata: {message: 'command'}
					});
				
					if (dataConnection) {
						var targetPeerId = dataConnection.peer;
						var connectionId = dataConnection.id;

						if (SHOW_LOG) {
							console.log('[MeetinConnection][connectDataConnection][DataConnection][connect]:My Peer = '+ myPeerId + ' -> Connection = ' + connectionId + ' -> Target Peer = ' + targetPeerId);
						}
					
						// データ受信時
						dataConnection.on(
							'data', 
							function(data){
								if (SHOW_LOG) {
									console.log('[MeetinConnection][connectDataConnection][DataConnection][data]:Target Peer = ' + targetPeerId + ' -> Connection = ' + connectionId + ' -> My Peer = '+ myPeerId + ', data = ' + data);
								}
								
								if (dataConnectionDataCallback && typeof dataConnectionDataCallback === "function") {
									dataConnectionDataCallback(dataConnection, data, myPeerId, targetPeerId, connectionId);
								}
							}
						);
				
						// コネクションが利用可能となった時
						dataConnection.on(
							'open', 
							function(){
								if (SHOW_LOG) {
									console.log('[MeetinConnection][connectDataConnection][DataConnection][open]:My Peer = '+ myPeerId + ' -> Connection = ' + connectionId + ' -> Target Peer = ' + targetPeerId);
								}
								
								if (dataConnectionOpenCallback && typeof dataConnectionOpenCallback === "function") {
									dataConnectionOpenCallback(dataConnection, myPeerId, targetPeerId, connectionId);
								}
							}
						);
				
						// 自分がクローズした、または接続先にクローズされた時
						dataConnection.on(
							'close', 
							function(){
								if (SHOW_LOG) {
									console.log('[MeetinConnection][connectDataConnection][DataConnection][close]:My Peer = '+ myPeerId + ' <-> Connection = ' + connectionId + ' <-> Target Peer = ' + targetPeerId);
								}

								closeConnectionByPeerIdAndConnectionId(
									targetPeerId,
									connectionId
								);
								
								if (dataConnectionCloseCallback && typeof dataConnectionCloseCallback === "function") {
									dataConnectionCloseCallback(dataConnection, myPeerId, targetPeerId, connectionId);
								}
							}
						);
					
						// エラーが起きた時
						dataConnection.on(
							'error', 
							function(err){
								if (SHOW_LOG) {
									var errType = null;
									var errMessage = null;
									if (err) {
										errType = err.type;
										errMessage = err.message;
									}
									console.log('[MeetinConnection][connectDataConnection][DataConnection][error]:Target Peer = ' + targetPeerId + ' -> Connection = ' + connectionId + ' -> My Peer = '+ myPeerId + ', err.type = ' + errType + ', err.message = ' + errMessage);
								}
								
								var peerId = dataConnection.peer;
								if (dataConnectionErrorCallback && typeof dataConnectionErrorCallback === "function") {
									dataConnectionErrorCallback(dataConnection, err, myPeerId, targetPeerId, connectionId);
								}
							}
						);
						
						return dataConnection;
					} else {
						if (errorCallback && typeof errorCallback === "function") {
							var err = new Error('DataConnectionが作れない');
							err.type = 'peer-connect-null';
							errorCallback(err);
						}
					}
				} else {
					if (errorCallback && typeof errorCallback === "function") {
						var err = new Error('対象ピアIDが正しくない');
						err.type = 'target-peer-id-error';
						errorCallback(err);
					}
				}
			} else {
				if (errorCallback && typeof errorCallback === "function") {
					if (!mPeerData) {
						var err = new Error('自分のピアがない');
						err.type = 'my-peer-not-exist';
						errorCallback(err);
					} else if (mPeerData.disconnected) {
						var err = new Error('PeerServerとのアクティブなコネクションがない');
						err.type = 'my-peer-disconnected';
						errorCallback(err);
 					} else if (!mPeerData.destroyed) {
						var err = new Error('自分のピアにおける、全接続が利用されていない');
						err.type = 'my-peer-destroyed';
						errorCallback(err);
					} else {
						var err = new Error('不明なエラー');
						err.type = 'unknown-error';
						errorCallback(err);
					}
				}
			}
			
			return null;
		};

		// 特定なピアへの接続
		MeetinConnection.prototype.connectDataConnection = function(
				target_peer_id, 
				errorCallback,
				dataConnectionDataCallback,
				dataConnectionOpenCallback,
				dataConnectionCloseCallback,
				dataConnectionErrorCallback
			) {
			return connectDataConnection(
				target_peer_id, 
				errorCallback,
				dataConnectionDataCallback,
				dataConnectionOpenCallback,
				dataConnectionCloseCallback,
				dataConnectionErrorCallback
			);
		};

		var getDataConnectionByTargetPeerId = function(
				target_peer_id
			) {
			if (mPeerData && target_peer_id && target_peer_id.length > 0) {
				var connections = mPeerData.connections[target_peer_id];
				if (connections) {
					for (var i = 0, ii = connections.length; i < ii; i += 1) {
						var connection = connections[i];
						if (connection && connection.open && connection.type === 'data') {
							if (connection.peer === target_peer_id) {
								return connection;
							}
						}
					}
				}
			}
			
			return null;
		};
		
		MeetinConnection.prototype.getDataConnectionByTargetPeerId = function(
				target_peer_id
			) {
			return getDataConnectionByTargetPeerId(
				target_peer_id
			);
		};
		
		// 特定なピアからの接続を切断する
		var closeDataConnection = function(
				target_peer_id
			) {
			if (SHOW_LOG) {
				console.log('[MeetinConnection][closeDataConnection][start]:target_peer_id = ' + target_peer_id);
			}

			var total = 0;

			if (mPeerData && target_peer_id && target_peer_id.length > 0) {
				var connections = mPeerData.connections[target_peer_id];
				if (connections) {
					for (var i = (connections.length - 1); i >= 0; i -= 1) {
						var connection = connections[i];
						if (connection && connection.open && connection.type === 'data') {
							if (SHOW_LOG) {
								console.log('[MeetinConnection][closeDataConnection]:Peer = ' + mPeerData.id + ', Connection = ' + connection.id + ', Connection peer = ' + connection.peer + ', Connection type = ' + connection.type);
							}

							connection.close();
							++total;
							if (mReady) {
								connections.splice(i, 1);
							}
						}
					}
//					if (connections.length < 1) {
//						delete mPeerData.connections[target_peer_id];
//					}
				}
			}
			
			return total;
		};

		// 特定なピアからの接続を切断する
		MeetinConnection.prototype.closeDataConnection = function(
				target_peer_id
			) {
			return closeDataConnection(
				target_peer_id
			);
		};

		// 全てのピアにコマンドを送る
		var sendCommandToAllTargetPeerData = function(
				command
			) {
			if (SHOW_LOG) {
				console.log('[MeetinConnection][sendCommandToAllTargetPeerData][start]:command = ' + command);
			}

			return sendCommandToAllPeer(mPeerData, command);
		};

		// 全てのピアにコマンドを送る
		MeetinConnection.prototype.sendCommandToAllTargetPeerData = function(
				command
			) {
			return sendCommandToAllTargetPeerData(
				command
			);
		};
		
		// 特定なピアにコマンドを送る
		var sendCommandToSpecificTargetPeerData = function(
				target_peer_id,
				command
			) {
			if (SHOW_LOG) {
				console.log('[MeetinConnection][sendCommandToSpecificTargetPeerData][start]:target_peer_id = ' + target_peer_id + ', command = ' + command);
			}

			return sendCommandToSpecificPeerId(mPeerData, command, target_peer_id);
		};

		// 特定なピアにコマンドを送る
		MeetinConnection.prototype.sendCommandToSpecificTargetPeerData = function(
				target_peer_id,
				command
			) {
			return sendCommandToSpecificTargetPeerData(
				target_peer_id,
				command
			);
		};
*/
		//////////////////////////////////////////////////////////
		// ・MediaConnection
		//////////////////////////////////////////////////////////
		
		// 特定なピアへのMediaConnection接続
		var connectMediaConnection = function(
				target_peer_id, 
				sendStream,
				options,
				errorCallback,
				mediaConnectionStreamCallback,
				mediaConnectionCloseCallback,
				mediaConnectionErrorCallback
			) {
			if (SHOW_LOG) {
				var sendStreamId = null;
				if (sendStream) {
					sendStreamId = sendStream.id;
				}
				console.log('[MeetinConnection][connectMediaConnection][start]:target_peer_id = ' + target_peer_id + ', stream.id = ' + sendStreamId + ', options = ' + JSON.stringify(options));
			}
			
			if (!mReady) {
				return null;
			}
			
			// 接続条件：
			// ・自分のピアが存在する
			// ・PeerServerとのアクティブなコネクションがある
			// ・自分のピアが接続に利用されている
			if (isPeerDataValid()) {
				// 接続先のピアIDが正しい場合
				if (target_peer_id && target_peer_id.length > 0) {
					var myPeerId = mPeerData.id;
					
					if (sendStream) {
						// すでに再生中か？
						var connection = getMediaConnectionByTargetPeerIdAndStreamId(target_peer_id, sendStream.id);
						if (connection) {
							return connection;
						}
					}
					
					var mediaConnection = mPeerData.call(target_peer_id, sendStream, options);
					
					if (mediaConnection) {
						var targetPeerId = mediaConnection.peer;
						var connectionId = mediaConnection.id;
						
						if (SHOW_LOG) {
							var sendStreamId = null;
							if (sendStream) {
								sendStreamId = sendStream.id;
							}
							console.log('[MeetinConnection][connectMediaConnection][Peer][call]:My Peer = ' + myPeerId + ' -> Connection = ' + connectionId + ' -> Target Peer = '+ targetPeerId + ', stream.id = ' + sendStreamId + ', options = ' + JSON.stringify(options));
						}
					
						// 相手から返されるストリームのコールバック
						mediaConnection.on('stream', function(stream){
							var streamId = null;
							if (stream) {
								streamId = stream.id;
							}
							
							if (SHOW_LOG) {
								console.log('[MeetinConnection][connectMediaConnection][MediaConnection][stream]:Target Peer = ' + targetPeerId + ' -> Connection = ' + connectionId + ' -> My Peer = '+ myPeerId + ', stream.id = ' + streamId);
							}
		
							if (mediaConnectionStreamCallback && typeof mediaConnectionStreamCallback === "function") {
								mediaConnectionStreamCallback(mediaConnection, stream, myPeerId, targetPeerId, connectionId);
							}
						});
						
						// 自分か相手のpeerがmedia connectionをクローズした時に発生
						mediaConnection.on('close', function(){
							if (SHOW_LOG) {
								console.log('[MeetinConnection][connectMediaConnection][MediaConnection][close]:My Peer = '+ myPeerId + ' <-> Connection = ' + connectionId + ' <-> Target Peer = ' + targetPeerId);
							}

							closeConnectionByPeerIdAndConnectionId(
								targetPeerId,
								connectionId
							);

							if (mediaConnectionCloseCallback && typeof mediaConnectionCloseCallback === "function") {
								mediaConnectionCloseCallback(mediaConnection, myPeerId, targetPeerId, connectionId);
							}
						});
		
						// エラーが発生した時
						mediaConnection.on('error', function(err){
							if (SHOW_LOG) {
								var errType = null;
								var errMessage = null;
								if (err) {
									errType = err.type;
									errMessage = err.message;
								}
								console.log('[MeetinConnection][connectMediaConnection][MediaConnection][error]:Target Peer = ' + targetPeerId + ' -> Connection = ' + connectionId + ' -> My Peer = '+ myPeerId + ', err.type = ' + errType + ', err.message = ' + errMessage);
							}
		
							if (mediaConnectionErrorCallback && typeof mediaConnectionErrorCallback === "function") {
								mediaConnectionErrorCallback(mediaConnection, err, myPeerId, targetPeerId, connectionId);
							}
						});
					
						return mediaConnection;
					} else {
						if (errorCallback && typeof errorCallback === "function") {
							var err = new Error('MediaConnectionが作れない');
							err.type = 'peer-call-null';
							errorCallback(err);
						}
					}
				} else {
					if (errorCallback && typeof errorCallback === "function") {
						var err = new Error('対象ピアIDが正しくない');
						err.type = 'target-peer-id-error';
						errorCallback(err);
					}
				}
			} else {
				if (errorCallback && typeof errorCallback === "function") {
					if (!mPeerData) {
						var err = new Error('自分のピアがない');
						err.type = 'my-peer-not-exist';
						errorCallback(err);
					} else if (mPeerData.disconnected) {
						var err = new Error('PeerServerとのアクティブなコネクションがない');
						err.type = 'my-peer-disconnected';
						errorCallback(err);
 					} else if (!mPeerData.destroyed) {
						var err = new Error('自分のピアにおける、全接続が利用されていない');
						err.type = 'my-peer-destroyed';
						errorCallback(err);
					} else {
						var err = new Error('不明なエラー');
						err.type = 'unknown-error';
						errorCallback(err);
					}
				}
			}
			
			return null;
		};

		// 特定なピアへの接続
		MeetinConnection.prototype.connectMediaConnection = function(
				target_peer_id, 
				sendStream,
				options,
				errorCallback,
				mediaConnectionStreamCallback,
				mediaConnectionCloseCallback,
				mediaConnectionErrorCallback
			) {
			return connectMediaConnection(
				target_peer_id, 
				sendStream,
				options,
				errorCallback,
				mediaConnectionStreamCallback,
				mediaConnectionCloseCallback,
				mediaConnectionErrorCallback
			);
		};
		
		var getConnectionIdListByStreamId = function(
				streamId
			) {
			var connectionIdList = new Array();
			
			if (mPeerData && streamId && streamId.length > 0) {
				for (var key in mPeerData.connections) {
					var connections = mPeerData.connections[key];
					if (connections) {
						for (var i = 0, ii = connections.length; i < ii; i += 1) {
							var connection = connections[i];
							if (connection && connection.type === 'media') {
								if (connection.localStream && connection.localStream.id === streamId) {
									connectionIdList.push(connection.id);
								}
							}
						}
					}
				}
			}
			
			return connectionIdList;
		};

		MeetinConnection.prototype.getConnectionIdListByStreamId = function(
				streamId
			) {
			return getConnectionIdListByStreamId(
				streamId
			);
		};
		
		var getMediaConnectionByTargetPeerIdAndStreamId = function(
				target_peer_id,
				streamId
			) {
			if (mPeerData && target_peer_id && target_peer_id.length > 0) {
				var connections = mPeerData.connections[target_peer_id];
				if (connections) {
					for (var i = 0, ii = connections.length; i < ii; i += 1) {
						var connection = connections[i];
						if (connection && connection.open && connection.type === 'media') {
							if (connection.localStream && connection.localStream.id === streamId) {
								return connection;
							}
						}
					}
				}
			}
			
			return null;
		};

		MeetinConnection.prototype.getMediaConnectionByTargetPeerIdAndStreamId = function(
				target_peer_id,
				streamId
			) {
			return getMediaConnectionByTargetPeerIdAndStreamId(
				target_peer_id,
				streamId
			);
		};
		
		// 特定なピアからの接続を切断する
		var closeMediaConnection = function(
				target_peer_id
			) {
			if (SHOW_LOG) {
				console.log('[MeetinConnection][closeMediaConnection][start]:target_peer_id = ' + target_peer_id);
			}
			
			var total = 0;

			if (mPeerData && target_peer_id && target_peer_id.length > 0) {
				var connections = mPeerData.connections[target_peer_id];
				if (connections) {
					for (var i = (connections.length - 1); i >= 0; i -= 1) {
						var connection = connections[i];
						if (connection && connection.open && connection.type === 'media') {
							if (SHOW_LOG) {
								console.log('[MeetinConnection][closeMediaConnection]:Peer = ' + mPeerData.id + ', Connection = ' + connection.id + ', Connection peer = ' + connection.peer + ', Connection type = ' + connection.type);
							}
							connection.close();
							++total;
							if (mReady) {
								connections.splice(i, 1);
							}
						}
					}
//					if (connections.length < 1) {
//						delete mPeerData.connections[target_peer_id];
//					}
				}
			}
			
			return total;
		};

		// 特定なピアからの接続を切断する
		MeetinConnection.prototype.closeMediaConnection = function(
				target_peer_id
			) {
			return closeMediaConnection(
				target_peer_id
			);
		};

		// 特定なピアからの接続を切断する
		var closeMediaConnectionByStreamId = function(
				streamId
			) {
			if (SHOW_LOG) {
				console.log('[MeetinConnection][closeMediaConnectionByStreamId][start]:streamId = ' + streamId);
			}
			
			var total = 0;

			if (mPeerData && streamId && streamId.length > 0) {
				for (var key in mPeerData.connections) {
					var connections = mPeerData.connections[key];
					if (connections) {
						for (var i = (connections.length - 1); i >= 0; i -= 1) {
							var connection = connections[i];
							if (connection && connection.open && connection.type === 'media') {
								if (connection.localStream && connection.localStream.id === streamId) {
									if (SHOW_LOG) {
										console.log('[MeetinConnection][closeMediaConnectionByStreamId]:Peer = ' + mPeerData.id + ', Connection = ' + connection.id + ', Connection peer = ' + connection.peer + ', Connection type = ' + connection.type + ', Stream = ' + streamId);
									}
									connection.close();
									++total;
									if (mReady) {
										connections.splice(i, 1);
									}
								}
							}
						}
	//					if (connections.length < 1) {
	//						delete mPeerData.connections[target_peer_id];
	//					}
					}
				}
			}
			
			return total;
		};

		// 特定なピアからの接続を切断する
		MeetinConnection.prototype.closeMediaConnectionByStreamId = function(
				streamId
			) {
			return closeMediaConnectionByStreamId(
				streamId
			);
		};
		
		// 特定なピアからの接続を切断する
		var closeConnectionByPeerIdAndConnectionId = function(
				target_peer_id,
				connection_id
			) {
			if (SHOW_LOG) {
				console.log('[MeetinConnection][closeConnectionByPeerIdAndConnectionId][start]:target_peer_id = ' + target_peer_id + ', connection_id = ' + connection_id);
			}
			
			var total = 0;

			if (mPeerData && target_peer_id && target_peer_id.length > 0) {
				var connections = mPeerData.connections[target_peer_id];
				if (connections) {
					for (var i = (connections.length - 1); i >= 0; i -= 1) {
						var connection = connections[i];
						if (connection && connection.open && connection.id === connection_id) {
							if (SHOW_LOG) {
								console.log('[MeetinConnection][closeConnectionByPeerIdAndConnectionId]:Peer = ' + mPeerData.id + ', Connection = ' + connection.id + ', Connection peer = ' + connection.peer + ', Connection type = ' + connection.type);
							}
							connection.close();
							++total;
							if (mReady) {
								connections.splice(i, 1);
							}
						}
					}
//					if (connections.length < 1) {
//						delete mPeerData.connections[target_peer_id];
//					}
				}
			}
			
			return total;
		};

		// 特定なピアからの接続を切断する
		MeetinConnection.prototype.closeConnectionByPeerIdAndConnectionId = function(
				target_peer_id,
				connection_id
			) {
			return closeConnectionByPeerIdAndConnectionId(
				target_peer_id,
				connection_id
			);
		};

		// 特定なピアからの接続を切断する
		var closeConnectionByPeerId = function(
				target_peer_id
			) {
			if (SHOW_LOG) {
				console.log('[MeetinConnection][closeConnectionByPeerId][start]:target_peer_id = ' + target_peer_id);
			}
			
			var total = 0;

			if (mPeerData && target_peer_id && target_peer_id.length > 0) {
				var connections = mPeerData.connections[target_peer_id];
				if (connections) {
					for (var i = (connections.length - 1); i >= 0; i -= 1) {
						var connection = connections[i];
						if (connection && connection.open) {
							if (SHOW_LOG) {
								console.log('[MeetinConnection][closeConnectionByPeerId]:Peer = ' + mPeerData.id + ', Connection = ' + connection.id + ', Connection peer = ' + connection.peer + ', Connection type = ' + connection.type);
							}
							connection.close();
							++total;
							if (mReady) {
								connections.splice(i, 1);
							}
						}
					}
//					delete mPeerData.connections[target_peer_id];
				}
			}
			
			return total;
		};

		// 特定なピアからの接続を切断する
		MeetinConnection.prototype.closeConnectionByPeerId = function(
				target_peer_id
			) {
			return closeConnectionByPeerId(
				target_peer_id
			);
		};
		
		// 特定なピアからの接続を切断する
		var closeConnectionByConnectionId = function(
				connection_id
			) {
			if (SHOW_LOG) {
				console.log('[MeetinConnection][closeConnectionByConnectionId][start]:connection_id = ' + connection_id);
			}
			
			var total = 0;

			if (mPeerData && connection_id && connection_id.length > 0) {
				for (var key in mPeerData.connections) {
					var connections = mPeerData.connections[key];
					if (connections) {
						for (var i = (connections.length - 1); i >= 0; i -= 1) {
							var connection = connections[i];
							if (connection && connection.open && connection.id === connection_id) {
								if (SHOW_LOG) {
									console.log('[MeetinConnection][closeConnectionByConnectionId]:Peer = ' + mPeerData.id + ', Connection = ' + connection.id + ', Connection peer = ' + connection.peer + ', Connection type = ' + connection.type);
								}
								connection.close();
								++total;
								if (mReady) {
									connections.splice(i, 1);
								}
							}
						}
	//					if (connections.length < 1) {
	//						delete mPeerData.connections[key];
	//					}
					}
				}
			}
			
			return total;
		};

		// 特定なピアからの接続を切断する
		MeetinConnection.prototype.closeConnectionByConnectionId = function(
				connection_id
			) {
			return closeConnectionByConnectionId(
				connection_id
			);
		};

		// メッセージ交換用ピアの再接続
		var peerDataReconnect = function(
			) {
			if (SHOW_LOG) {
				console.log('[MeetinConnection][peerDataReconnect][start]');
			}

			if (mReady && mPeerData && !mPeerData.destroyed) {
				if (SHOW_LOG) {
					console.log('[MeetinConnection][peerDataReconnect][reconnect]:My peer id = ' + mPeerData.id);
				}
				
				mPeerData.reconnect();
			}
		};

		// メッセージ交換用ピアの再接続
		MeetinConnection.prototype.peerDataReconnect = function(
			) {
			peerDataReconnect(
			);
		};

		//////////////////////////////////////////////////////////
		// 汎用関数
		//////////////////////////////////////////////////////////
/*
		// 接続中の接続先の数を取得する
		var getTotalTargetPeerData = function() {
			if (mPeerData && !mPeerData.disconnected && !mPeerData.destroyed) {
				var counter = 0;
				
				for (var key in mPeerData.connections) {
					var connections = mPeerData.connections[key];
					if (connections) {
						for (var i = 0, ii = connections.length; i < ii; i += 1) {
							var connection = connections[i];
							if (connection && connection.open && connection.label === 'command') {
								++counter;
								break;
							}
						}
					}
				}
				
				return counter;
			}
			
			return 0;
		};
		
		// 接続中の接続先の数を取得する
		MeetinConnection.prototype.getTotalTargetPeerData = function(
			) {
			return getTotalTargetPeerData(
			);
		};

		// 接続中のピアID一覧を取得する
		var getConnectedPeerDataIdList = function(
			) {
			var connectList = new Array();

			if (mPeerData && !mPeerData.disconnected && !mPeerData.destroyed) {
				for (var key in mPeerData.connections) {
					var connections = mPeerData.connections[key];
					if (connections) {
						var add = false;
						for (var i = 0, ii = connections.length; i < ii; i += 1) {
							var connection = connections[i];
							if (connection && connection.open && connection.type === 'data') {
								add = true;
								break;
							}
						}
						if (add) {
							connectList.push(key);
						}
					}
				}
			}

			return connectList;
		};
		
		// 接続中のピアID一覧を取得する
		MeetinConnection.prototype.getConnectedPeerDataIdList = function(
			) {
			return getConnectedPeerDataIdList(
			);
		};
		
		// 指定した接続先との接続状態を取得する
		var isConnectedToTargetPeerData = function(
				target_peer_id
			) {
			if (!target_peer_id) {
				return false;
			}
			if (target_peer_id.length < 1) {
				return false;
			}

			if (mPeerData && !mPeerData.disconnected && !mPeerData.destroyed) {
				var connections = mPeerData.connections[target_peer_id];
				if (connections) {
					for (var i = 0, ii = connections.length; i < ii; i += 1) {
						var connection = connections[i];
						if (connection && connection.open && connection.label === 'command') {
							return true;
						}
					}
				}
				
				return false;
			}
			
			return false;
		};
		
		// 指定した接続先との接続状態を取得する
		MeetinConnection.prototype.isConnectedToTargetPeerData = function(
				target_peer_id
			) {
			return isConnectedToTargetPeerData(
				target_peer_id
			);
		};

		var closeAllDataConnection = function(
			) {
			var total = 0;
			
			if (mPeerData) {
				for (var key in mPeerData.connections) {
					var connections = mPeerData.connections[key];
					if (connections) {
						for (var i = (connections.length - 1); i >= 0; i -= 1) {
							var connection = connections[i];
							if (connection && connection.open && connection.type === 'data') {
								connection.close();
								++total;
								if (mReady) {
									connections.splice(i, 1);
								}
							}
						}
					}
				}
			}
			
			return total;
		};

		MeetinConnection.prototype.closeAllDataConnection = function(
			) {
			return closeAllDataConnection();
		};
*/
		var closeAllMediaConnection = function(
			) {
			var total = 0;
			
			if (mPeerData) {
				for (var key in mPeerData.connections) {
					var connections = mPeerData.connections[key];
					if (connections) {
						for (var i = (connections.length - 1); i >= 0; i -= 1) {
							var connection = connections[i];
							if (connection && connection.open && connection.type === 'media') {
								connection.close();
								++total;
								if (mReady) {
									connections.splice(i, 1);
								}
							}
						}
					}
				}
			}
			
			return total;
		};

		MeetinConnection.prototype.closeAllMediaConnection = function(
			) {
			return closeAllMediaConnection();
		};

		MeetinConnection.prototype.closeAllMediaConnectionExcludeConnectionId = function(
				connection_id
			) {
			var total = 0;
			
			if (mPeerData) {
				for (var key in mPeerData.connections) {
					var connections = mPeerData.connections[key];
					if (connections) {
						for (var i = (connections.length - 1); i >= 0; i -= 1) {
							var connection = connections[i];
							if (connection && connection.open && connection.type === 'media' && connection.id !== connection_id) {
								connection.close();
								++total;
								if (mReady) {
									connections.splice(i, 1);
								}
							}
						}
					}
				}
			}
			
			return total;
		};

		return MeetinConnection;
	})();
	MeetinConnectionManager.MeetinConnection = MeetinConnection;

})(MeetinConnectionManager || (MeetinConnectionManager = {}));
