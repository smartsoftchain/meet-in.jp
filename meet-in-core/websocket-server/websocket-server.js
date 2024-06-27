#!/usr/bin/env node

var log4js = require('log4js');
var rimraf = require('rimraf');
var fs = require("fs");
var mysql = require('mysql2');

var config = require('./config');  //configの読み込み

// 設定ファイル（log-config.json）の読み込み
//Log4js.configure('/var/www/html_meet/websocket-server/log-config.json');
// 設定を行います
// Log4js v1.Xではappendersは配列だったけれど、Log4js v2.Xではappendersはオブジェクト
// という大きな仕様変更があったみたいです。
//log4js.configure({
//    appenders: [
//
//  /      // リクエストログ用設定
//        {
//            "type": "file",
//            "category": "request",
//            "filename": "./logs/request.log",
//            "pattern": "yyyy-MM-dd"
//        },
//
//    ]
//});
log4js.configure('/var/www/html_meet/websocket-server/log-config.json');

// ログ出力
var sysLogger = log4js.getLogger('system');
var recLogger = log4js.getLogger('request');
let logger = log4js.getLogger("access");

var WebSocketServer = require('websocket').server;
var mHttp = require('http');
var mPort = 4567;

var mConnectionTable = {};

// サーバー実装の前に、エラーハンドリングを記載します。
process.on('uncaughtException', function(err) {
	logger.error("err = " + err +"-------------------------------------------------");
//	sendMail('エラー内容：' + err);
});

var mServer = mHttp.createServer(function(request, response) {
	try {
		showLog('Received request for ' + request.url);
		response.writeHead(404);
		response.end();
	} catch (exception) {
		logger.error(exception); // [ERROR]
	}
});

mServer.listen(mPort, function() {
	showLog('Server is listening on port ' + mPort);
});

var mWebSocketServer = new WebSocketServer({
	httpServer: mServer,
	autoAcceptConnections: false
});

function originIsAllowed(origin) {
	return true;
}

//////////////////////////////////////////////////////////
// イベント
//////////////////////////////////////////////////////////

// 新しい接続を作る
mWebSocketServer.on('request', function(request) {
	try {
		logger.info("[request]:request.origin = " + request.origin);   // INFO

		if (!originIsAllowed(request.origin)) {
			// Make sure we only accept requests from an allowed origin
			request.reject();
			logger.info('[request]:Connection from origin ' + request.origin + ' rejected.');   // INFO
			return;
		}

		// (http://en.wikipedia.org/wiki/Same_origin_policy)
		// 接続を受け入れる
		var connection = request.accept('echo-protocol', request.origin);
		// 接続IDを新規作成する
		var peerId = createNewPeerId();
		// 接続IDを設定する
		connection.peerId = peerId;

		logger.info('★★★[request]:peerId = ' + connection.peerId);   // INFO
		logger.info('Cnt = ' + Object.keys(mConnectionTable).length);   // INFO

		// メッセージを受信したイベント
		connection.on('message', function(message) {
		showLog('[message]:peerId = ' + connection.peerId + ', message = ' + JSON.stringify(message));

			if (message.type === 'utf8') { // accept only text
				onMessageUtf8(message, connection);
			}
		});

		// 閉じるイベント
		connection.on('close', function(reasonCode, description) {
			var peerId = connection.peerId;
			logger.info('[close]: peerId='+peerId +',reasonCode='+reasonCode +',description='+description);

			// sendSql(peerId);
			// logger.info('sendSql()=['+peerId+']');

			delete mConnectionTable[peerId];
			logger.info('delete =['+peerId+']');
		});

		// 接続をテーブルに保存する
		mConnectionTable[peerId] = connection;
		logger.info('Cnt = ' + Object.keys(mConnectionTable).length);   // INFO

		// 接続を作ったら、接続完了のメッセージを送る
		sendConnectionReady(connection);
	} catch (exception) {
		logger.error(exception); // [ERROR]
	}
});

///////
//SQL
///////

var async = require('async');
function sendSql(PeerId) {
	logger.info('SQL:start peerId=['+PeerId+']');

	var dbConnection = null;
	try {
		// DB接続(毎回新規にMySQLへ接続する)
		dbConnection = mysql.createConnection(config.databaseAuth);
		dbConnection.connect(function(err) {
			//接続時のエラー
			if (err) {
				logger.error(err);
				throw err;
			}
			// logger.debug('connected dbConnection');
		});

// // START---------------------------------------------
		async.waterfall([
			function (callback) {
				var id=0;
				var Peer_Id = PeerId;
				var sql0 = `SELECT id, room_name
							FROM connection_info
							WHERE user_peer_id_1 =?
								or user_peer_id_2 =?
								or user_peer_id_3 =?
								or user_peer_id_4 =?
								or user_peer_id_5 =?
								or user_peer_id_6 =?`;
				// SQL0
				logger.info("function0 Peer_Id=("+ Peer_Id +")");
				logger.debug("SQL0=["+sql0+"]");
				dbConnection.query(sql0, [Peer_Id,Peer_Id,Peer_Id,Peer_Id,Peer_Id,Peer_Id], function (err, result) {
					if (err) {
						logger.error('sql0 error=' + err);
						throw err;
					}
					logger.info("DATA_CNT=("+ result.length +")");
					if (result.length != 0) {
						id = result[0].id;
						logger.info("connection_info id=("+ id +") room_name=["+ result[0].room_name +"]");
					}
					callback(null, id, Peer_Id);
				});	// query
			},

			// SQL1
			function (id, Peer_Id, callback) {
				// 再接続も考慮し、ここではuser_peer_id_xに'X'を設定する。
				// (NULLをセットすると別のユーザが接続で使用する可能性があるため)
				logger.info("function1 id=("+ id +") Peer_Id=("+ Peer_Id +")");

				dbConnection.beginTransaction(function(err) {
					if (err) {
						logger.error('SQL1 beginTransaction error=' + err);
						callback(new Error(err), id, Peer_Id);
					}

					var sql1  = `UPDATE connection_info
					SET user_peer_id_1 ='X'
					   ,login_flg1 =0
					   ,updated_datetime =Now()
					   ,connect_datetime1 =Now()
					   WHERE user_peer_id_1 =?`;
					// logger.debug("SQL1=["+sql1+"]");

					dbConnection.query(sql1, [Peer_Id], function (err, result) {
						if (err) {
							logger.error('SQL1 error=' + err);
							dbConnection.rollback(function(err) {
								if (err) {
									logger.warn('SQL1 rollback error=' + err);
								}
							});	// rollback_end
							callback(new Error(err), id, Peer_Id);
						}
						dbConnection.commit(function(err) {
							if (err) {
								logger.error('SQL1 commit error=' + err);
								dbConnection.rollback(function(err) {
									if (err) {
										logger.warn('SQL1 rollback error=' + err);
									}
								});
								callback(new Error(err), id, Peer_Id);
							}
							logger.info('SQL1 result (' + result.changedRows + ')');
							callback(null, id, Peer_Id);
						}); // commit_end
					});	// query_end
				});	// beginTransaction
			},

			// SQL2
			function (id, Peer_Id, callback) {
				logger.info("function2 id=("+ id +") Peer_Id=("+ Peer_Id +")");

				dbConnection.beginTransaction(function(err) {
					if (err) {
						logger.error('SQL2 beginTransaction error=' + err);
						callback(new Error(err), id, Peer_Id);
					}

					var sql2  = `UPDATE connection_info
						SET user_peer_id_2 ='X'
						   ,login_flg2 =0
						   ,updated_datetime =Now()
						   ,connect_datetime2 =Now()
					  WHERE user_peer_id_2 =?`;
					// logger.debug("SQL2=["+sql2+"]");

					dbConnection.query(sql2, [Peer_Id], function (err, result) {
						if (err) {
							logger.error('SQL2 error=' + err);
							dbConnection.rollback(function(err) {
								if (err) {
									logger.warn('SQL2 rollback error=' + err);
								}
							});	// rollback_end
							callback(new Error(err), id, Peer_Id);
						}
						dbConnection.commit(function(err) {
							if (err) {
								logger.error('SQL2 commit error=' + err);
								dbConnection.rollback(function(err) {
									if (err) {
										logger.warn('SQL1 rollback error=' + err);
									}
								});
								callback(new Error(err), id, Peer_Id);
							}
							logger.info('SQL2 result (' + result.changedRows + ')');
							callback(null, id, Peer_Id );
						}); // commit_end
					});	// query_end
				});	// beginTransaction
			},

			// SQL3
			function (id, Peer_Id, callback) {
				logger.info("function3 id=("+ id +") Peer_Id=("+ Peer_Id +")");

				dbConnection.beginTransaction(function(err) {
					if (err) {
						logger.error('SQL3 beginTransaction error=' + err);
						callback(new Error(err), id, Peer_Id);
					}

					var sql3  = `UPDATE connection_info
						SET user_peer_id_3 ='X'
						   ,login_flg3 =0
						   ,updated_datetime =Now()
						   ,connect_datetime3 =Now()
					  WHERE user_peer_id_3 =?`;
					// logger.debug("SQL3=["+sql3+"]");

					dbConnection.query(sql3, [Peer_Id], function (err, result) {
						if (err) {
							logger.error('SQL3 error=' + err);
							dbConnection.rollback(function(err) {
								if (err) {
									logger.warn('SQL3 rollback error=' + err);
								}
							});	// rollback_end
							callback(new Error(err), id, Peer_Id);
						}
						dbConnection.commit(function(err) {
							if (err) {
								logger.error('SQL3 commit error=' + err);
								dbConnection.rollback(function(err) {
									if (err) {
										logger.warn('SQL3 rollback error=' + err);
									}
								});
								callback(new Error(err), id, Peer_Id);
							}
							logger.info('SQL3 result (' + result.changedRows + ')');
							callback(null, id, Peer_Id);
						}); // commit_end
					});	// query_end
				});	// beginTransaction
			},

			// SQL4
			function (id, Peer_Id, callback) {
				logger.info("function4 id=("+ id +") Peer_Id=("+ Peer_Id +")");

				dbConnection.beginTransaction(function(err) {
					if (err) {
						logger.error('SQL4 beginTransaction error=' + err);
						callback(new Error(err), id, Peer_Id);
					}

					var sql4  = `UPDATE connection_info
						SET user_peer_id_4 ='X'
						   ,login_flg4 =0
						   ,updated_datetime =Now()
						   ,connect_datetime4 =Now()
					  WHERE user_peer_id_4 =?`;
					// logger.debug("SQL4=["+sql4+"]");

					dbConnection.query(sql4, [Peer_Id], function (err, result) {
						if (err) {
							logger.error('SQL4 error=' + err);
							dbConnection.rollback(function(err) {
								if (err) {
									logger.warn('SQL4 rollback error=' + err);
								}
								});	// rollback_end
								callback(new Error(err), id, Peer_Id);
						}
						dbConnection.commit(function(err) {
							if (err) {
								logger.error('SQL4 commit error=' + err);
								dbConnection.rollback(function(err) {
									if (err) {
										logger.warn('SQL4 rollback error=' + err);
									}
								});
								callback(new Error(err), id, Peer_Id);
							}
							logger.info('SQL4 result (' + result.changedRows + ')');
							callback(null, id, Peer_Id);
						}); // commit_end
					});	// query_end
				});	// beginTransaction
			},

			// SQL5
			function (id, Peer_Id, callback) {
				logger.info("function5 id=("+ id +") Peer_Id=("+ Peer_Id +")");

				dbConnection.beginTransaction(function(err) {
					if (err) {
						logger.error('SQL5 beginTransaction error=' + err);
						callback(new Error(err), id, Peer_Id);
					}

					var sql5  = `UPDATE connection_info
						SET user_peer_id_5 ='X'
						   ,login_flg5 =0
						   ,updated_datetime =Now()
						   ,connect_datetime5 =Now()
					  WHERE user_peer_id_5 =?`;
					// logger.debug("SQL5=["+sql5+"]");

					dbConnection.query(sql5, [Peer_Id], function (err, result) {
						if (err) {
							logger.error('SQL5 error=' + err);
							dbConnection.rollback(function(err) {
								if (err) {
									logger.warn('SQL5 rollback error=' + err);
								}
								});	// rollback_end
								callback(new Error(err), id, Peer_Id);
						}
						dbConnection.commit(function(err) {
							if (err) {
								logger.error('SQL5 commit error=' + err);
								dbConnection.rollback(function(err) {
									if (err) {
										logger.warn('SQL5 rollback error=' + err);
									}
								});
								callback(new Error(err), id, Peer_Id);
							}
							logger.info('SQL5 result (' + result.changedRows + ')');
							callback(null, id, Peer_Id);
						}); // commit_end
					});	// query_end
				});	// beginTransaction
			},

			// SQL6
			function (id, Peer_Id, callback) {
				logger.info("function6 id=("+ id +") Peer_Id=("+ Peer_Id +")");

				dbConnection.beginTransaction(function(err) {
					if (err) {
						logger.error('SQL6 beginTransaction error=' + err);
						callback(new Error(err), id, Peer_Id);
					}

					var sql6  = `UPDATE connection_info
						SET user_peer_id_6 ='X'
						   ,login_flg6 =0
						   ,updated_datetime =Now()
						   ,connect_datetime6 =Now()
					  WHERE user_peer_id_6 =?`;
					// logger.debug("SQL6=["+sql6+"]");

					dbConnection.query(sql6, [Peer_Id], function (err, result) {
						if (err) {
							logger.error('SQL6 error=' + err);
							dbConnection.rollback(function(err) {
								if (err) {
									logger.warn('SQL6 rollback error=' + err);
								}
								});	// rollback_end
								callback(new Error(err), id, Peer_Id);
						}
						dbConnection.commit(function(err) {
							if (err) {
								logger.error('SQL6 commit error=' + err);
								dbConnection.rollback(function(err) {
									if (err) {
										logger.warn('SQL6 rollback error=' + err);
									}
								});
								callback(new Error(err), id, Peer_Id);
							}
							logger.info('SQL6 result (' + result.changedRows + ')');
							callback(null, id, Peer_Id);
						}); // commit_end
					});	// query_end
				});	// beginTransaction
			},

			// // sql_init1
			// function (id, Peer_Id, callback) {
			// 	logger.info("function sql_init1 id=("+ id +") Peer_Id=("+ Peer_Id +")");

			// 	dbConnection.beginTransaction(function(err) {
			// 		if (err) {
			// 			logger.error('sql_init1 beginTransaction error=' + err);
			// 			callback(new Error(err), id, Peer_Id);
			// 		}

			// 		// connection_info のレコードでステイタスが異常なレコードを初期化するSQL
			// 		var sql_init1 = `UPDATE connection_info SET connection_state =3
			// 					  WHERE user_peer_id_1 IS NULL
			// 						AND user_peer_id_2 IS NULL
			// 						AND user_peer_id_3 IS NULL
			// 						AND user_peer_id_4 IS NULL
			// 						AND user_peer_id_5 IS NULL
			// 						AND user_peer_id_6 IS NULL
			// 						AND connection_state != 3`;
			// 		logger.debug("sql_init1=["+sql_init1+"]");

			// 		dbConnection.query(sql_init1, function (err, result) {
			// 			if (err) {
			// 				logger.error('sql_init1 error=' + err);
			// 				dbConnection.rollback(function(err) {
			// 					if (err) {
			// 						logger.warn('SQL1 rollback error=' + err);
			// 					}
			// 				});	// rollback_end
			// 				callback(new Error(err), id, Peer_Id);
			// 			}
			// 			dbConnection.commit(function(err) {
			// 				if (err) {
			// 					logger.error('sql_init1 commit error=' + err);
			// 					dbConnection.rollback(function(err) {
			// 						if (err) {
			// 							logger.warn('SQL1 rollback error=' + err);
			// 						}
			// 					});
			// 					callback(new Error(err), id, Peer_Id);
			// 				}
			// 				logger.info('sql_init1 result (' + result.changedRows + ')');
			// 				callback(null, id, Peer_Id);
			// 			}); // commit_end
			// 		});	// query_end
			// 	});	// beginTransaction
			// },

			// sql_cheku1
			/**
			 * 資料作業ディレクトリ削除
			 */
			function (id, Peer_Id, callback) {
				var sql_cheku1 = `SELECT *
									FROM connection_info
								   WHERE (user_peer_id_1 IS NULL OR user_peer_id_1 ='X')
									 AND (user_peer_id_2 IS NULL OR user_peer_id_2 ='X')
									 AND (user_peer_id_3 IS NULL OR user_peer_id_3 ='X')
									 AND (user_peer_id_4 IS NULL OR user_peer_id_4 ='X')
									 AND (user_peer_id_5 IS NULL OR user_peer_id_5 ='X')
									 AND (user_peer_id_6 IS NULL OR user_peer_id_6 ='X')
									 AND updated_datetime < (NOW() - INTERVAL 30 SECOND)`;

				var patch = "/mnt/datastore/negotiation_document";
				dbConnection.query(sql_cheku1, function (err, result, fields) {
					if (err) {
						logger.error('sql_cheku1 error=' + err);
						callback(new Error(err), id, Peer_Id);
					}

					async.each(result, function(rec, next){
						// 処理1
						// logger.debug("dir:["+ patch + "/negotiation_"+rec.id +"]");
						fs.access(patch + "/negotiation_"+rec.id, fs.constants.R_OK | fs.constants.W_OK, (error) => {
							if (error) {
								if (error.code === "ENOENT") {
									// 該当するファイルまたはフォルダがありません。
									// 正常(スキップ)
								}
								else {
									// EPERM(操作する権限がありません)
									// EBUSY(リソースが処理中またはロックされています)
									logger.error('access err:' + error.code);
								}
							}
							else {
								logger.info('DELETE rmdir['+ rec.id +']');
								rimraf( patch + "/negotiation_"+rec.id, function (err) {
									if (err) {
										logger.error('rmdir err:' + err);
									}
									else {
										logger.info('DELETE rmdir['+ rec.id +']');
									}
								});
							}
							next();
						});
					},
					function complete(err){
						if(err) throw err;
						logger.info("●●●完了");
						callback(null, id, Peer_Id);
					});
				});
			}
			],
			function (err, results) {
				if (err) {
					logger.error('series all error. (' + err + ')');
				}
				else {
					logger.info('series all done. (' + results + ')');
				}
				dbConnection.end(function() {
					logger.info('connection close');
				});
				logger.info("★★★connection release");
			}
		);
// // END  ---------------------------------------------
	}
	catch (exception) {
		if( dbConnection != null ) {
			dbConnection.end(function() {
				logger.info('connection close');
			});
			logger.info("★★★connection release★★★");
		}
		logger.error(exception); // [ERROR]
	}
	// 順次処理
}

//////////////////////////////////////////////////////////
// メールメッセージ送信
//////////////////////////////////////////////////////////
var mailer = require('nodemailer');
//SMTPの設定
var setting = {
	//SMTPサーバーを使う場合
	host: 'smtp.gmoserver.jp',
	port: '587',
	auth: {
		user: 'ooshima@aidma-hd.jp',
		pass: 'h3G4id&Xg'
	}
};
//メールの内容
var mail = {
	from: 'ooshima@aidma-hd.jp',
	to: 'ooshima@aidma-hd.jp',
	priority: 'high',
	subject: 'Meet-in 障害メール',
	text: '' //本文
};
function sendMail(msg) {
	try {
		var os = require('os');
		var hostname = os.hostname();

		//SMTPの接続
		var smtp_tmp = mailer.createTransport(setting);
		// プロミス化
		var smtp = require('bluebird').promisifyAll(smtp_tmp);

		mail.subject = 'Meet-in 障害メール['+hostname+']';
		mail.text = msg;
		smtp.sendMail(mail,function(err,res){
			logger.info(res);
			smtp.close();
		});
	} // try_end
	catch(exception){
		logger.error('sendMail MAILエラー内容：' + exception);
	} // catch_end
	finally {
		logger.info('sendMail finally');
	} // finally_end
}

//////////////////////////////////////////////////////////
// メッセージ送信
//////////////////////////////////////////////////////////

// メッセージ送信処理
function sendMessageUtf8(connection, data) {
	try {
		if (!data) {
			data = {};
		}
		data.connection_type = "socket";
		var message = JSON.stringify(data)
		connection.sendUTF(message);
		showLog('[sendUTF]:peerId = ' + connection.peerId + ', message = ' + message);
		if (data.command !== 'PING'
		 && data.command !== 'PING_RECEIVED') {
			//logger.info('[sendUTF]: toId=('+ connection.peerId +') command['+ data.command +']');   // INFO
			//logger.debug('[sendUTF]:peerId = ' + connection.peerId + ', message = ' + message);   // INFO
		}
		else {
			//logger.debug('[sendUTF]:peerId = ' + connection.peerId + ', message = ' + message);   // INFO
		}
	} catch (exception) {
		logger.error('[sendUTF]:peerId = ' + connection.peerId + ', data = ' + data);
		logger.error(exception); // [ERROR]
	}
}

// 接続完了のメッセージを送る
function sendConnectionReady(connection) {
	try {
		var data = {
			command : "SOCKET_CONNECT_READY",
			new_peer_id : connection.peerId
		};

		sendMessageUtf8(connection, data);
	} catch (exception) {
		logger.error(exception); // [ERROR]
	}
}

// PING受信完了
function sendPingReceived(connection) {
	try {
		var data = {
			command : "PING_RECEIVED",
			core_command : true
		};

		sendMessageUtf8(connection, data);
	} catch (exception) {
		logger.error(exception); // [ERROR]
	}
}

// 接続ID変更完了通知を送る
function sendChangePeerIdFinish(connection, oldPeerId) {
	try {
		var data = {
			command : "CHANGE_PEER_ID_FINISH",
			old_peer_id : oldPeerId,
			new_peer_id : connection.peerId
		};

		sendMessageUtf8(connection, data);
	} catch (exception) {
		logger.error(exception); // [ERROR]
	}
}

// 宛先が存在しない
function sendTargetNotFound(connection, target_peer_id, message) {
	try {
		var data = {
			command : "TARGET_NOT_FOUND",
			target_peer_id : target_peer_id,
			message : message
		};

		sendMessageUtf8(connection, data);
	} catch (exception) {
		logger.error(exception); // [ERROR]
	}
}

//////////////////////////////////////////////////////////
// メッセージ受信
//////////////////////////////////////////////////////////

function onMessageUtf8(message, from_connection) {
	if (!message || !message.utf8Data) {
		logger.warn('[message]:peerId = ' + from_connection.peerId + ', message=[' + message + ']');   // WARN
		return;
	}

	try {
		var json = JSON.parse(message.utf8Data);
		if (!json) {
			logger.warn('[message]:peerId = ' + from_connection.peerId + ', json=[' + json + ']');   // WARN
			return;
		}

		if (json.command !== 'PING'
		 && json.command !== 'PING_RECEIVED') {
			// logger.info('[Recive]:fromId(' + from_connection.peerId +') toId=('+ json.to_peer_id +') command['+ json.command +']');   // INFO
			// logger.debug('[Recive]:peerId = ' + from_connection.peerId + ', message = ' + JSON.stringify(message));   // INFO
		}
		else {
			// logger.debug('[Recive]:peerId = ' + from_connection.peerId + ', message = ' + JSON.stringify(message));   // debug
		}

		// 個別なメッセージを受信したときの処理
		if (json.command === 'PING') {
			runPing(json);
		} else if (json.command === 'REQUEST_CHANGE_PEER_ID') {
			runRequestChangePeerId(json);
		} else {
			// 受信したメッセージを宛先に転送する
			if (json.to_peer_id) {
				var connection = mConnectionTable[json.to_peer_id];
				// 宛先が存在する場合
				if (connection) {
					if (json.command !== 'PING'
					 && json.command !== 'PING_RECEIVED') {
						//logger.info('[Send]:fromId(' + from_connection.peerId +') toId=('+ json.to_peer_id +') command['+ json.command +']');   // INFO
						//logger.debug('[Send]:peerId = ' + connection.peerId + ', message = ' + message.utf8Data);   // INFO
					}
					else {
						//logger.debug('[Send]:peerId = ' + connection.peerId + ', message = ' + message.utf8Data);   // debug
					}
					connection.sendUTF(message.utf8Data);
					showLog('[sendUTF]:peerId = ' + connection.peerId + ', message = ' + message.utf8Data);
				}
				else {	// 宛先が存在しない場合
					// メッセージの送り主に宛先が存在しないことを知らせる
					sendTargetNotFound(from_connection, json.to_peer_id, message.utf8Data);
				}
			}
		}
	}
	catch (exception) {
		logger.error(exception); // [ERROR]
	}
}

//////////////////////////////////////////////////////////
// 個別なメッセージを受信したときの処理
//////////////////////////////////////////////////////////

// PING
function runPing(json) {
	try {
		if (json.from_peer_id && json.from_peer_id.length > 0) {
			var connection = mConnectionTable[json.from_peer_id];
			if (connection) {
				sendPingReceived(connection);
			}
		}
	} catch (exception) {
		logger.error(exception); // [ERROR]
	}
}

// 接続IDの変更
function runRequestChangePeerId(json) {
	try {
//		var result = false;
		if (json.from_peer_id && json.from_peer_id.length > 0) {
			var connection = mConnectionTable[json.from_peer_id];
			if (connection) {
				if (json.to_peer_id && json.to_peer_id.length > 0) {
					if (connection.peerId !== json.to_peer_id) {
						delete mConnectionTable[json.from_peer_id];
						connection.peerId = json.to_peer_id;
						mConnectionTable[json.to_peer_id] = connection;
					}
				}
				sendChangePeerIdFinish(connection, json.from_peer_id);
			}
		}
	} catch (exception) {
		logger.error(exception); // [ERROR]
		connection.release();
	}
}

//
// 接続情報(DB:connection_info)のピアID(peer_id)が
// Websoketコネクション情報(mConnectionTable)にするかをチェックし
// 存在しない場合は、接続情報(connection_info)の項目をクリア('X')に更新する
//
// 通常Meet-in切断を行った場合は問題なく本処理は不要だが、なぜかWebsoketコネクション
// 情報(mConnectionTable)のピアIDが存在しないのにDB上残る場合が存在する為
// 削除処理を行いようにする
// ※残る原因は現状不明(2019/12/27)
//
function runAllPeerId() {
	sysLogger.info("runAllPeerId START");

	var dbConnection = null;
	try {
		// var all_peer_id = Object.keys(mConnectionTable);
		// logger.debug("runAllPeerId::all_peer_id("+ all_peer_id +")");

		// DB接続(毎回新規にMySQLへ接続する)
		dbConnection = mysql.createConnection(config.databaseAuth);
		dbConnection.connect(function(err) {
			//接続時のエラー
			if (err) {
				sysLogger.error(err);
				throw err;
			}
			// logger.debug('connected dbConnection');
		});

// START---------------------------------------------
		async.waterfall([
		function (callback) {
			var all_peer_id = Object.keys(mConnectionTable);
			// logger.debug("runAllPeerId::all_peer_id("+ all_peer_id +")");
			// 正常
			callback(null, all_peer_id, dbConnection);
		},

		// user_peer_id_1
		function (all_peer_id, dbConnection, callback) {
			callback(null, all_peer_id, dbConnection);
		},

		// ルームロック解除処理
		function (all_peer_id, dbConnection, callback) {
			// sysLogger.info("function RoomLock Release");

			dbConnection.beginTransaction(function(err) {
				if (err) {
					sysLogger.error('RoomLock Release beginTransaction error=' + err);
					callback(new Error(err), all_peer_id, dbConnection);
				}

				/**
				 * connection_info のルームロックステータスを初期化するSQL
				 * ルーム内にログインユーザが一人もいない状態の場合、ルームロックを解除する
				 * ただし、再接続の時間を考慮し更新時間が30秒以上経過した場合のみ、ルームロックを解除する
				 * ※30秒は接続時の同期処理時間のタイムアウト値のため
				 * (2020/04/11 Ohta)
				 */
				var sql_init2 = `UPDATE connection_info SET room_state =0
								 WHERE room_state!=0
								  AND updated_datetime < (NOW() - INTERVAL 30 SECOND)
								  AND (user_peer_id_1 IS NULL OR user_peer_id_1 ='X')
								  AND (user_peer_id_2 IS NULL OR user_peer_id_2 ='X')
								  AND (user_peer_id_3 IS NULL OR user_peer_id_3 ='X')
								  AND (user_peer_id_4 IS NULL OR user_peer_id_4 ='X')
								  AND (user_peer_id_5 IS NULL OR user_peer_id_5 ='X')
								  AND (user_peer_id_6 IS NULL OR user_peer_id_6 ='X')
								`;
				// sysLogger.debug("RoomLock Release SQL=["+sql_init2+"]");

				dbConnection.query(sql_init2, function (err, result) {
					if (err) {
						sysLogger.error('RoomLock Release error=' + err);
						dbConnection.rollback(function(err) {
							if (err) {
								sysLogger.warn('RoomLock Release rollback error=' + err);
							}
						});	// rollback_end
						callback(new Error(err), all_peer_id, dbConnection);
					}
					// トランザクション確定
					dbConnection.commit(function(err) {
						if (err) {
							sysLogger.error('RoomLock Release commit error=' + err);
							dbConnection.rollback(function(err) {
								if (err) {
									sysLogger.warn('RoomLock Release rollback error=' + err);
								}
							});
							callback(new Error(err), all_peer_id, dbConnection);
						}
						sysLogger.debug('RoomLock Release result (' + result.changedRows + ')');
						// logger.info("●完了");
						callback(null, all_peer_id, dbConnection);	// 次へ
					}); // commit_end
				});	// query_end
			});	// beginTransaction
		},

		// user_peer_id_1
		function (all_peer_id, dbConnection, callback) {
			sysLogger.debug("function user_peer_id_1");
			var sql1 = `SELECT id, room_name, user_peer_id_1
						  FROM connection_info
						 WHERE user_peer_id_1 is not null
						   AND user_peer_id_1 <> 'X'
						   AND connect_datetime1 < (NOW() - INTERVAL 60 SECOND)`;
			// logger.debug("SQL1=["+ sql1 +"]");

			dbConnection.query(sql1, function (err, result) {
				if (err) {
					sysLogger.error('sql1 error=' + err);
					callback(new Error(exception), all_peer_id, dbConnection);
				}

				// lengthはレコード数ではない、0か非ゼロ(1)か帰らない。
				// sysLogger.debug("DATA_CNT=("+ result.length +")");
				async.each(result, function(rec, next){
					// logger.debug("id=("+ rec.id +") room_name=("+ rec.room_name +") peer_id=("+ rec.user_peer_id_1 +")");

					// 存在しないPeerIdをチェックする
					if( !mConnectionTable[rec.user_peer_id_1] ) {
						sysLogger.info("id=("+ rec.id +") room_name=("+ rec.room_name +") peer_id=("+ rec.user_peer_id_1 +")");
						// logger.info("runAllPeerId::all_peer_id("+ Object.keys(mConnectionTable) +")");

						var id = rec.id;
						var peerId = rec.user_peer_id_1;
						sysLogger.info("クリア room_name=["+ rec.room_name +"] user_id=1 peer_id=("+ peerId +")");

						// DB上のPeerIdをリリース(更新--->'X')
						dbConnection.beginTransaction(function(err) {
							if (err) {
								sysLogger.error('SQL11 beginTransaction error=' + err);
								callback(new Error(exception), all_peer_id, dbConnection);
							}

							var sql11  = `UPDATE connection_info
							SET user_peer_id_1=null ,login_flg1=0 ,updated_datetime=Now() ,connect_datetime1=Now()
							WHERE id =? AND user_peer_id_1 =?`;

							// logger.info("SQL11=["+ sql11 +"]");

							dbConnection.query(sql11, [id,peerId], function (err, result) {
								if (err) {
									sysLogger.error('SQL11 error=' + err);
									dbConnection.rollback(function(err) {
										if (err) {
											sysLogger.warn('SQL11 rollback error=' + err);
										}
									});	// rollback_end
									callback(new Error(exception), all_peer_id, dbConnection);
								}
								// トランザクション確定
								dbConnection.commit(function(err) {
									if (err) {
										sysLogger.error('SQL11 commit error=' + err);
										dbConnection.rollback(function(err) {
											if (err) {
												sysLogger.warn('SQL11 rollback error=' + err);
											}
										});
										callback(new Error(exception), all_peer_id, dbConnection);
									}
									sysLogger.info('SQL11 result (' + result.changedRows + ')');
									next();
								}); // commit_end
							});	// query_end
						});	// beginTransaction
					}
					else {
						// logger.debug("存在(処理なし) id=("+ rec.user_peer_id_1 +")");
						next();
					}
				},
				function complete(err){
					if(err) {
						sysLogger.error('SQL11 complete error=' + err);
						callback(new Error(exception), all_peer_id, dbConnection);
					}
					// sysLogger.debug("●●●1完了");
					callback(null, all_peer_id, dbConnection);
				});
			});	// query_end(SELECT)
		},

		// user_peer_id_2
		function (all_peer_id, dbConnection, callback) {
			sysLogger.debug("function user_peer_id_2");
			var sql2 = `SELECT id, room_name, user_peer_id_2
						  FROM connection_info
						 WHERE user_peer_id_2 is not null
						   AND user_peer_id_2 <> 'X'
						   AND connect_datetime2 < (NOW() - INTERVAL 60 SECOND)`;
			// logger.debug("SQL2=["+ sql2 +"]");

			dbConnection.query(sql2, function (err, result) {
				if (err) {
					sysLogger.error('sql2 error=' + err);
					callback(new Error(exception), all_peer_id, dbConnection);
				}

				async.each(result, function(rec, next){
					// logger.debug("id=("+ rec.id +") room_name=("+ rec.room_name +") peer_id=("+ rec.user_peer_id_2 +")");

					// 存在しないPeerIdをチェックする
					if( !mConnectionTable[rec.user_peer_id_2] ) {
						sysLogger.info("id=("+ rec.id +") room_name=("+ rec.room_name +") peer_id=("+ rec.user_peer_id_2 +")");
						// logger.info("runAllPeerId::all_peer_id("+ Object.keys(mConnectionTable) +")");

						var id = rec.id;
						var peerId = rec.user_peer_id_2;
						sysLogger.info("クリア room_name=["+ rec.room_name +"] user_id=2 peer_id=("+ peerId +")");

						// DB上のPeerIdをリリース(更新--->'X')
						dbConnection.beginTransaction(function(err) {
							if (err) {
								sysLogger.error('SQL2 beginTransaction error=' + err);
								callback(new Error(exception), all_peer_id, dbConnection);
							}

							var sql21  = `UPDATE connection_info
							SET user_peer_id_2 =null,login_flg2 =0,updated_datetime =Now(),connect_datetime2 =Now()
							WHERE id =? AND user_peer_id_2 =?`;

							// logger.info("SQL21=["+ sql21 +"]");

							dbConnection.query(sql21, [id,peerId], function (err, result) {
								if (err) {
									sysLogger.error('SQL21 error=' + err);
									dbConnection.rollback(function(err) {
										if (err) {
											sysLogger.warn('SQL21 rollback error=' + err);
										}
									});	// rollback_end
									callback(new Error(exception), all_peer_id, dbConnection);
								}
								// トランザクション確定
								dbConnection.commit(function(err) {
									if (err) {
										sysLogger.error('SQL21 commit error=' + err);
										dbConnection.rollback(function(err) {
											if (err) {
												sysLogger.warn('SQL21 rollback error=' + err);
											}
										});
										callback(new Error(exception), all_peer_id, dbConnection);
									}
									sysLogger.info('SQL21 result (' + result.changedRows + ')');
									next();
								}); // commit_end
							});	// query_end
						});	// beginTransaction
					}
					else {
						// logger.debug("存在(処理なし) id=("+ rec.user_peer_id_2 +")");
						next();
					}
				},
				function complete(err){
					if(err) {
						sysLogger.error('SQL21 complete error=' + err);
						callback(new Error(exception), all_peer_id, dbConnection);
					}
					// logger.debug("●●●2完了");
					callback(null, all_peer_id, dbConnection);
				});
			});	// query_end(SELECT)
		},

		// user_peer_id_3
		function (all_peer_id, dbConnection, callback) {
			sysLogger.debug("function user_peer_id_3");
			var sql3 = `SELECT id, room_name, user_peer_id_3
						  FROM connection_info
						 WHERE user_peer_id_3 is not null
						   AND user_peer_id_3 <> 'X'
						   AND connect_datetime3 < (NOW() - INTERVAL 60 SECOND)`;
			// logger.debug("SQL3=["+ sql3 +"]");

			dbConnection.query(sql3, function (err, result) {
				if (err) {
					sysLogger.error('sql3 error=' + err);
					callback(new Error(exception), all_peer_id, dbConnection);
				}

				async.each(result, function(rec, next){
					// logger.debug("id=("+ rec.id +") room_name=("+ rec.room_name +") peer_id=("+ rec.user_peer_id_3 +")");

					// 存在しないPeerIdをチェックする
					if( !mConnectionTable[rec.user_peer_id_3] ) {
						sysLogger.info("id=("+ rec.id +") room_name=("+ rec.room_name +") peer_id=("+ rec.user_peer_id_3 +")");
						// logger.info("runAllPeerId::all_peer_id("+ Object.keys(mConnectionTable) +")");

						var id = rec.id;
						var peerId = rec.user_peer_id_3;
						sysLogger.info("クリア room_name=["+ rec.room_name +"] user_id=3 peer_id=("+ peerId +")");

						// DB上のPeerIdをリリース(更新--->'X')
						dbConnection.beginTransaction(function(err) {
							if (err) {
								sysLogger.error('SQL3 beginTransaction error=' + err);
								callback(new Error(exception), all_peer_id, dbConnection);
							}

							var sql31  = `UPDATE connection_info
							SET user_peer_id_3 =null,login_flg3 =0,updated_datetime =Now(),connect_datetime3 =Now()
							WHERE id =? AND user_peer_id_3 =?`;

							// logger.info("SQL31=["+ sql31 +"]");

							dbConnection.query(sql31, [id,peerId], function (err, result) {
								if (err) {
									sysLogger.error('SQL31 error=' + err);
									dbConnection.rollback(function(err) {
										if (err) {
											sysLogger.warn('SQL31 rollback error=' + err);
										}
									});	// rollback_end
									callback(new Error(exception), all_peer_id, dbConnection);
								}
								// トランザクション確定
								dbConnection.commit(function(err) {
									if (err) {
										sysLogger.error('SQL31 commit error=' + err);
										dbConnection.rollback(function(err) {
											if (err) {
												sysLogger.warn('SQL31 rollback error=' + err);
											}
										});
										callback(new Error(exception), all_peer_id, dbConnection);
									}
									sysLogger.info('SQL31 result (' + result.changedRows + ')');
									next();
								}); // commit_end
							});	// query_end
						});	// beginTransaction
					}
					else {
						// logger.debug("存在(処理なし) id=("+ rec.user_peer_id_3 +")");
						next();
					}
				},
				function complete(err){
					if(err) {
						sysLogger.error('SQL31 complete error=' + err);
						callback(new Error(exception), all_peer_id, dbConnection);
					}
					// logger.debug("●●●3完了");
					callback(null, all_peer_id, dbConnection);
				});
			});	// query_end(SELECT)
		},

		// SQL4
		function (all_peer_id, dbConnection, callback) {
			sysLogger.debug("function user_peer_id_4");
			var sql4 = `SELECT id, room_name, user_peer_id_4
						  FROM connection_info
						 WHERE user_peer_id_4 is not null
						   AND user_peer_id_4 <> 'X'
						   AND connect_datetime4 < (NOW() - INTERVAL 60 SECOND)`;
			// logger.debug("SQL4=["+ sql4 +"]");

			dbConnection.query(sql4, function (err, result) {
				if (err) {
					sysLogger.error('sql4 error=' + err);
					callback(new Error(exception), all_peer_id, dbConnection);
				}

				async.each(result, function(rec, next){
					// logger.debug("id=("+ rec.id +") room_name=("+ rec.room_name +") peer_id=("+ rec.user_peer_id_4 +")");

					// 存在しないPeerIdをチェックする
					if( !mConnectionTable[rec.user_peer_id_4] ) {
						sysLogger.info("id=("+ rec.id +") room_name=("+ rec.room_name +") peer_id=("+ rec.user_peer_id_4 +")");
						// logger.info("runAllPeerId::all_peer_id("+ Object.keys(mConnectionTable) +")");

						var id = rec.id;
						var peerId = rec.user_peer_id_4;
						sysLogger.info("クリア room_name=["+ rec.room_name +"] user_id=4 peer_id=("+ peerId +")");

						// DB上のPeerIdをリリース(更新--->'X')
						dbConnection.beginTransaction(function(err) {
							if (err) {
								sysLogger.error('SQL4 beginTransaction error=' + err);
								callback(new Error(exception), all_peer_id, dbConnection);
							}

							var sql41  = `UPDATE connection_info
							SET user_peer_id_4 =null,login_flg4 =0,updated_datetime =Now(),connect_datetime4 =Now()
							WHERE id =? AND user_peer_id_4 =?`;

							// logger.info("SQL41=["+ sql41 +"]");

							dbConnection.query(sql41, [id,peerId], function (err, result) {
								if (err) {
									sysLogger.error('SQL41 error=' + err);
									dbConnection.rollback(function(err) {
										if (err) {
											sysLogger.warn('SQL41 rollback error=' + err);
										}
									});	// rollback_end
									callback(new Error(exception), all_peer_id, dbConnection);
								}
								// トランザクション確定
								dbConnection.commit(function(err) {
									if (err) {
										sysLogger.error('SQL41 commit error=' + err);
										dbConnection.rollback(function(err) {
											if (err) {
												sysLogger.warn('SQL41 rollback error=' + err);
											}
										});
										callback(new Error(exception), all_peer_id, dbConnection);
									}
									sysLogger.info('SQL41 result (' + result.changedRows + ')');
									next();
								}); // commit_end
							});	// query_end
						});	// beginTransaction
					}
					else {
						// logger.debug("存在(処理なし) id=("+ rec.user_peer_id_4 +")");
						next();
					}
				},
				function complete(err){
					if(err) {
						sysLogger.error('SQL41 complete error=' + err);
						callback(new Error(exception), all_peer_id, dbConnection);
					}
					// logger.debug("●●●4完了");
					callback(null, all_peer_id, dbConnection);
				});
			});	// query_end(SELECT)
		},


		// SQL5
		function (all_peer_id, dbConnection, callback) {
			sysLogger.debug("function user_peer_id_5");
			var sql5 = `SELECT id, room_name, user_peer_id_5
						  FROM connection_info
						 WHERE user_peer_id_5 is not null
						   AND user_peer_id_5 <> 'X'
						   AND connect_datetime5 < (NOW() - INTERVAL 60 SECOND)`;
			// logger.debug("SQL5=["+ sql5 +"]");

			dbConnection.query(sql5, function (err, result) {
				if (err) {
					sysLogger.error('sql5 error=' + err);
					callback(new Error(exception), all_peer_id, dbConnection);
				}

				async.each(result, function(rec, next){
					// logger.debug("id=("+ rec.id +") room_name=("+ rec.room_name +") peer_id=("+ rec.user_peer_id_5 +")");

					// 存在しないPeerIdをチェックする
					if( !mConnectionTable[rec.user_peer_id_5] ) {
						sysLogger.info("id=("+ rec.id +") room_name=("+ rec.room_name +") peer_id=("+ rec.user_peer_id_5 +")");
						// logger.info("runAllPeerId::all_peer_id("+ Object.keys(mConnectionTable) +")");

						var id = rec.id;
						var peerId = rec.user_peer_id_5;
						sysLogger.info("クリア room_name=["+ rec.room_name +"] user_id=5 peer_id=("+ peerId +")");

						// DB上のPeerIdをリリース(更新--->'X')
						dbConnection.beginTransaction(function(err) {
							if (err) {
								sysLogger.error('SQL5 beginTransaction error=' + err);
								callback(new Error(exception), all_peer_id, dbConnection);
							}

							var sql51  = `UPDATE connection_info
							SET user_peer_id_5 =null,login_flg5 =0,updated_datetime =Now(),connect_datetime5 =Now()
							WHERE id =? AND user_peer_id_5 =?`;

							// logger.info("SQL51=["+ sql51 +"]");

							dbConnection.query(sql51, [id,peerId], function (err, result) {
								if (err) {
									sysLogger.error('SQL51 error=' + err);
									dbConnection.rollback(function(err) {
										if (err) {
											sysLogger.warn('SQL51 rollback error=' + err);
										}
									});	// rollback_end
									callback(new Error(exception), all_peer_id, dbConnection);
								}
								// トランザクション確定
								dbConnection.commit(function(err) {
									if (err) {
										sysLogger.error('SQL51 commit error=' + err);
										dbConnection.rollback(function(err) {
											if (err) {
												sysLogger.warn('SQL51 rollback error=' + err);
											}
										});
										callback(new Error(exception), all_peer_id, dbConnection);
									}
									sysLogger.info('SQL51 result (' + result.changedRows + ')');
									next();
								}); // commit_end
							});	// query_end
						});	// beginTransaction
					}
					else {
						// logger.debug("存在(処理なし) id=("+ rec.user_peer_id_5 +")");
						next();
					}
				},
				function complete(err){
					if(err) {
						sysLogger.error('SQL51 complete error=' + err);
						callback(new Error(exception), all_peer_id, dbConnection);
					}
					// logger.debug("●●●5完了");
					callback(null, all_peer_id, dbConnection);
				});
			});	// query_end(SELECT)
		},


		// SQL6
		function (all_peer_id, dbConnection, callback) {
			sysLogger.debug("function user_peer_id_6");
			var sql6 = `SELECT id, room_name, user_peer_id_6
						  FROM connection_info
						 WHERE user_peer_id_6 is not null
						   AND user_peer_id_6 <> 'X'
						   AND connect_datetime6 < (NOW() - INTERVAL 60 SECOND)`;
			// logger.debug("SQL6=["+ sql6 +"]");

			dbConnection.query(sql6, function (err, result) {
				if (err) {
					sysLogger.error('sql6 error=' + err);
					callback(new Error(exception), all_peer_id, dbConnection);
				}

				async.each(result, function(rec, next){
					// logger.debug("id=("+ rec.id +") room_name=("+ rec.room_name +") peer_id=("+ rec.user_peer_id_6 +")");

					// 存在しないPeerIdをチェックする
					if( !mConnectionTable[rec.user_peer_id_6] ) {
						sysLogger.info("id=("+ rec.id +") room_name=("+ rec.room_name +") peer_id=("+ rec.user_peer_id_6 +")");
						// logger.info("runAllPeerId::all_peer_id("+ Object.keys(mConnectionTable) +")");

						var id = rec.id;
						var peerId = rec.user_peer_id_6;
						sysLogger.info("クリア room_name=["+ rec.room_name +"] user_id=6 peer_id=("+ peerId +")");

						// DB上のPeerIdをリリース(更新--->'X')
						dbConnection.beginTransaction(function(err) {
							if (err) {
								sysLogger.error('SQL6 beginTransaction error=' + err);
								callback(new Error(exception), all_peer_id, dbConnection);
							}

							var sql61  = `UPDATE connection_info
							SET user_peer_id_6 =null,login_flg6 =0,updated_datetime =Now(),connect_datetime6 =Now()
							WHERE id =? AND user_peer_id_6 =?`;

							// logger.info("SQL61=["+ sql61 +"]");

							dbConnection.query(sql61, [id,peerId], function (err, result) {
								if (err) {
									sysLogger.error('SQL61 error=' + err);
									dbConnection.rollback(function(err) {
										if (err) {
											sysLogger.warn('SQL61 rollback error=' + err);
										}
									});	// rollback_end
									callback(new Error(exception), all_peer_id, dbConnection);
								}
								// トランザクション確定
								dbConnection.commit(function(err) {
									if (err) {
										sysLogger.error('SQL61 commit error=' + err);
										dbConnection.rollback(function(err) {
											if (err) {
												sysLogger.warn('SQL61 rollback error=' + err);
											}
										});
										callback(new Error(exception), all_peer_id, dbConnection);
									}
									sysLogger.info('SQL61 result (' + result.changedRows + ')');
									next();
								}); // commit_end
							});	// query_end
						});	// beginTransaction
					}
					else {
						// logger.debug("存在(処理なし) id=("+ rec.user_peer_id_6 +")");
						next();
					}
				},
				function complete(err){
					if(err) {
						sysLogger.error('SQL61 complete error=' + err);
						callback(new Error(exception), all_peer_id, dbConnection);
					}
					// logger.debug("●●●6完了");
					callback(null, all_peer_id, dbConnection);
				});
			});	// query_end(SELECT)
		}
		],

		function (err, results) {
			if (err) {
				sysLogger.error('runAllPeerId error. (' + err + ')');
			}
			else {
				// logger.debug('series all done. (' + results + ')');
			}

			dbConnection.end(function() {
				// logger.debug('connection close');
			});
			// logger.debug("★★★connection release");
		}
		);
		// sysLogger.info("runAllPeerId End");
// END  ---------------------------------------------
	}
	catch (exception) {
		if( dbConnection != null ) {
			dbConnection.end(function() {
				sysLogger.info('connection close');
			});
			sysLogger.info("★★★connection release★★★");
		}
		sysLogger.error(exception); // [ERROR]
	}
}

//60000ミリ秒（60秒）毎に関数「runAllPeerId()」を呼び出す
//setInterval(runAllPeerId, 60000);
setInterval(runAllPeerId, 30000);

//////////////////////////////////////////////////////////
// 汎用関数
//////////////////////////////////////////////////////////

// ログをコンソールに出力する
function showLog(msg) {
	// recLogger.info(msg);
}

// 接続IDの作成
function createNewPeerId() {
	return "S" + createRandomString(16);
}

// ランダムな文字列を生成する
function createRandomString(len) {
	var l = len; // 生成する文字列の長さ
	var c = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; // 生成する文字列に含める文字セット
	var cl = c.length;
	var r = "";
	for (var i = 0; i < l; i++) {
		r += c[Math.floor(Math.random() * cl)];
	}
	return r;
}

// 不要
function nothingPeerId(pool) {
	/*********************
	 * 不明 Peer_id チェック
	 *********************/
	logger.info('不明 Peer_id チェック start');
	pool.getConnection(function(err, connection) {
		//接続時のエラー
		if (err) {
			logger.error('get Connection error=' + err);
			return;
		}

		async.waterfall([
			function (callback) {
				// 配列の初期化
				var listPeerId = {};
				/* peer_id_1 */
				var sql_peerId1 = `SELECT id, user_peer_id_1
									FROM connection_info
									WHERE user_peer_id_1 IS NOT NULL
									AND user_peer_id_1 != 'X'`;
				// logger.debug("sql_peerId1=["+sql_peerId1+"]");
				connection.query(sql_peerId1, function (err, result, fields) {
					if (err) {
						// SQLエラー
						logger.error('peer_id_1 error=' + err);
						callback(new Error(err), listPeerId);
					}
					// logger.debug('peer_id_1 length=('+ result.length +')');
					// 存在しないPeerIdを抽出する
					for (var i = 0, ii = result.length; i < ii; i += 1) {
						var id = result[i].id;
						var PeerId = result[i].user_peer_id_1;
						if( !mConnectionTable[PeerId] ) {
							logger.error('id=['+ id +'] user_peer_id_1=('+ PeerId +')');
							listPeerId[PeerId] = id;
						}
					}
					callback(null, listPeerId);
				});	// query_end
			},
			function (listPeerId,callback) {
				/* peer_id_2 */
				var sql_peerId2 = `SELECT id, user_peer_id_2
									FROM connection_info
									WHERE user_peer_id_2 IS NOT NULL
									AND user_peer_id_2 != 'X'`;

				// logger.debug("sql_peerId2=["+sql_peerId2+"]");
				connection.query(sql_peerId2, function (err, result, fields) {
					if (err) {
						// SQLエラー
						logger.error('peer_id_2 error=' + err);
						callback(new Error(err), listPeerId);
					}
					// logger.debug('peer_id_2 length=('+ result.length +')');
					// 存在しないPeerIdを抽出する
					for (var i = 0, ii = result.length; i < ii; i += 1) {
						var id = result[i].id;
						var PeerId = result[i].user_peer_id_2;
						if( !mConnectionTable[PeerId] ) {
							logger.error('id=['+ id +'] user_peer_id_2=('+ PeerId +')');
							listPeerId[PeerId] = id;
						}
					}
					callback(null, listPeerId);
				});	// query_end
			},
			function (listPeerId,callback) {
				/* peer_id_3 */
				var sql_peerId3 = `SELECT id, user_peer_id_3
									FROM connection_info
									WHERE user_peer_id_3 IS NOT NULL
									AND user_peer_id_3 != 'X'`;

				// logger.debug("sql_peerId3=["+sql_peerId3+"]");
				connection.query(sql_peerId3, function (err, result, fields) {
					if (err) {
						// SQLエラー
						logger.error('peer_id_3 error=' + err);
						callback(new Error(err), listPeerId);
					}
					// logger.debug('peer_id_3 length=('+ result.length +')');
					// 存在しないPeerIdを抽出する
					for (var i = 0, ii = result.length; i < ii; i += 1) {
						var id = result[i].id;
						var PeerId = result[i].user_peer_id_3;
						if( !mConnectionTable[PeerId] ) {
							logger.error('id=['+ id +'] user_peer_id_3=('+ PeerId +')');
							listPeerId[PeerId] = id;
						}
					}
					callback(null, listPeerId);
				});	// query_end
			},
			function (listPeerId,callback) {
				/* peer_id_4 */
				var sql_peerId4 = `SELECT id, user_peer_id_4
									FROM connection_info
									WHERE user_peer_id_4 IS NOT NULL
									AND user_peer_id_4 != 'X'`;
				// logger.debug("sql_peerId4=["+sql_peerId4+"]");
				connection.query(sql_peerId4, function (err, result, fields) {
					if (err) {
						// SQLエラー
						logger.error('peer_id_4 error=' + err);
						callback(new Error(err), listPeerId);
					}
					// logger.debug('peer_id_4 length=('+ result.length +')');
					// 存在しないPeerIdを抽出する
					for (var i = 0, ii = result.length; i < ii; i += 1) {
						var id = result[i].id;
						var PeerId = result[i].user_peer_id_4;
						if( !mConnectionTable[PeerId] ) {
							logger.error('id=['+ id +'] user_peer_id_4=('+ PeerId +')');
							listPeerId[PeerId] = id;
						}
					}
					callback(null, listPeerId);
				});	// query_end
			},
			function (listPeerId,callback) {
				/* peer_id_5 */
				var sql_peerId5 = `SELECT id, user_peer_id_5
									FROM connection_info
									WHERE user_peer_id_5 IS NOT NULL
									AND user_peer_id_5 != 'X'`;
				// logger.debug("sql_peerId5=["+sql_peerId5+"]");
				connection.query(sql_peerId5, function (err, result, fields) {
					if (err) {
						// SQLエラー
						logger.error('peer_id_5 error=' + err);
						callback(new Error(err), listPeerId);
					}
					// logger.debug('peer_id_5 length=('+ result.length +')');
					// 存在しないPeerIdを抽出する
					for (var i = 0, ii = result.length; i < ii; i += 1) {
						var id = result[i].id;
						var PeerId = result[i].user_peer_id_5;
						if( !mConnectionTable[PeerId] ) {
							logger.error('id=['+ id +'] user_peer_id_5=('+ PeerId +')');
							listPeerId[PeerId] = id;
						}
					}
					callback(null, listPeerId);
				});	// query_end
			},
			function (listPeerId, callback) {
				/* peer_id_6 */
				var sql_peerId6 = `SELECT id, user_peer_id_6
									FROM connection_info
									WHERE user_peer_id_6 IS NOT NULL
									AND user_peer_id_6 != 'X'`;
				// logger.debug("sql_peerId6=["+sql_peerId6+"]");
				connection.query(sql_peerId6, function (err, result, fields) {
					if (err) {
						// SQLエラー
						logger.error('peer_id_6 error=' + err);
						callback(new Error(err), listPeerId);
					}
					// logger.debug('peer_id_6 length=('+ result.length +')');
					// 存在しないPeerIdを抽出する
					for (var i = 0, ii = result.length; i < ii; i += 1) {
						var id = result[i].id;
						var PeerId = result[i].user_peer_id_6;
						if( !mConnectionTable[PeerId] ) {
							logger.error('id=['+ id +'] user_peer_id_6=('+ PeerId +')');
							listPeerId[PeerId] = id;
						}
					}
					callback(null, listPeerId);
				});	// query_end
			}
		],
		function (err, results) {
			if (err) {
				logger.error('不明 Peer_id チェック error. (' + err + ')');
			}
			else {
				logger.info('不明 Peer_id チェック 完了 length=('+ Object.keys(results).length +')');
				if( Object.keys(results).length != 0 ) {
					logger.info('不明 Peer_id='+ JSON.stringify(results));
//					sendMail('不要ID(Peer_id:connection_info_id)：' + JSON.stringify(results));
				}
			}
			logger.info("★★★2connection release");
			connection.release();
		}
		);
	});	// pool.getConnection_end

}
