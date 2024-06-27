const SHOW_MEETIN_API_LOG = false;

// 接続情報の作成
function getWebRtcParam(
				successCallback, 
				errorCallback, 
				completeCallback
				) {
	var data = {
		};

	if (SHOW_MEETIN_API_LOG) {
		console.log('[MeetinAPI][getWebRtcParam][start]:data = ' + JSON.stringify(data));
	}
	
	$.ajax({
		type:"GET",                // method = "POST"
		url:"https://" + location.host + "/api/get-web-rtc-param",        // POST送信先のURL
		data:data,  // JSONデータ本体
		contentType: 'application/json', // リクエストの Content-Type
		crossDomain: true,
		
		dataType: 'json',
		success: function(data, status, xhr) {
			// 通信成功時の処理
			if (successCallback && typeof successCallback === "function") {
				successCallback(data, status, xhr);
			}
		},
		error: function(xhr, status, error) {
			// 通信失敗時の処理
			if (errorCallback && typeof errorCallback === "function") {
				errorCallback(xhr, status, error);
			}
		},
		complete: function(xhr, status) {
			// 通信完了時の処理
			if (completeCallback && typeof completeCallback === "function") {
				completeCallback(xhr, status);
			}
		},
	});
}

// 接続情報の作成
function saveWebRtcParam(
				data,
				successCallback, 
				errorCallback, 
				completeCallback
				) {
	if (SHOW_MEETIN_API_LOG) {
		if (data) {
			console.log('[MeetinAPI][saveWebRtcParam][start]:data = ' + JSON.stringify(data));
		} else {
			console.log('[MeetinAPI][saveWebRtcParam][start]');
		}
	}

	$.ajax({
		type:"GET",                // method = "POST"
		url:"https://" + location.host + "/api/save-web-rtc-param",        // POST送信先のURL
		data:data,  // JSONデータ本体
		contentType: 'application/json', // リクエストの Content-Type
		crossDomain: true,
		dataType: 'json',
		success: function(data, status, xhr) {
			if (SHOW_MEETIN_API_LOG) {
				if (data) {
					console.log('[MeetinAPI][saveWebRtcParam][success]:data = ' + JSON.stringify(data));
				} else {
					console.log('[MeetinAPI][saveWebRtcParam][success]');
				}
			}

			// 通信成功時の処理
			if (successCallback && typeof successCallback === "function") {
				successCallback(data, status, xhr);
			}
		},
		error: function(xhr, status, error) {
			if (SHOW_MEETIN_API_LOG) {
				if (error) {
					console.log('[MeetinAPI][saveWebRtcParam][error]:error = ' + JSON.stringify(error));
				} else {
					console.log('[MeetinAPI][saveWebRtcParam][error]');
				}
			}

			// 通信失敗時の処理
			if (errorCallback && typeof errorCallback === "function") {
				errorCallback(xhr, status, error);
			}
		},
		complete: function(xhr, status) {
			// 通信完了時の処理
			if (completeCallback && typeof completeCallback === "function") {
				completeCallback(xhr, status);
			}
		},
	});
}

// 接続情報の作成
function clearWebRtcParam(
				successCallback, 
				errorCallback, 
				completeCallback
				) {
	var data = {
		};

	if (SHOW_MEETIN_API_LOG) {
		console.log('[MeetinAPI][clearWebRtcParam][start]:data = ' + JSON.stringify(data));
	}
	
	$.ajax({
		type:"GET",                // method = "POST"
		url:"https://" + location.host + "/api/clear-web-rtc-param",        // POST送信先のURL
		data:data,  // JSONデータ本体
		contentType: 'application/json', // リクエストの Content-Type
		crossDomain: true,
		dataType: 'json',
		success: function(data, status, xhr) {
			if (SHOW_MEETIN_API_LOG) {
				if (data) {
					console.log('[MeetinAPI][clearWebRtcParam][success]:data = ' + JSON.stringify(data));
				} else {
					console.log('[MeetinAPI][clearWebRtcParam][success]');
				}
			}

			// 通信成功時の処理
			if (successCallback && typeof successCallback === "function") {
				successCallback(data, status, xhr);
			}
		},
		error: function(xhr, status, error) {
			if (SHOW_MEETIN_API_LOG) {
				if (error) {
					console.log('[MeetinAPI][clearWebRtcParam][error]:error = ' + JSON.stringify(error));
				} else {
					console.log('[MeetinAPI][clearWebRtcParam][error]');
				}
			}

			// 通信失敗時の処理
			if (errorCallback && typeof errorCallback === "function") {
				errorCallback(xhr, status, error);
			}
		},
		complete: function(xhr, status) {
			// 通信完了時の処理
			if (completeCallback && typeof completeCallback === "function") {
				completeCallback(xhr, status);
			}
		},
	});
}

// 接続情報の作成
function createNewConnectionInfo(
				operatorPeerId,
				userPeerId,
				clientId,
				staffType,
				staffId,
				connectNo,
				successCallback, 
				errorCallback, 
				completeCallback
				) {
	var data = {
		operatorPeerId : operatorPeerId,
		userPeerId : userPeerId,
		clientId : clientId,
		staffType : staffType,
		staffId : staffId,
		connectNo : connectNo
	};

	if (SHOW_MEETIN_API_LOG) {
		console.log('[MeetinAPI][createNewConnectionInfo][start]:data = ' + JSON.stringify(data));
	}

	$.ajax({
		type:"GET",                // method = "POST"
		url:"https://" + location.host + "/api/create-new-connection-info",        // POST送信先のURL
		data:data,  // JSONデータ本体
		contentType: 'application/json', // リクエストの Content-Type
		crossDomain: true,
		dataType: 'json',
		success: function(data, status, xhr) {
			if (SHOW_MEETIN_API_LOG) {
				if (data) {
					console.log('[MeetinAPI][createNewConnectionInfo][success]:data = ' + JSON.stringify(data));
				} else {
					console.log('[MeetinAPI][createNewConnectionInfo][success]');
				}
			}

			// 通信成功時の処理
			if (successCallback && typeof successCallback === "function") {
				successCallback(data, status, xhr);
			}
		},
		error: function(xhr, status, error) {
			if (SHOW_MEETIN_API_LOG) {
				if (error) {
					console.log('[MeetinAPI][createNewConnectionInfo][error]:error = ' + JSON.stringify(error));
				} else {
					console.log('[MeetinAPI][createNewConnectionInfo][error]');
				}
			}

			// 通信失敗時の処理
			if (errorCallback && typeof errorCallback === "function") {
				errorCallback(xhr, status, error);
			}
		},
		complete: function(xhr, status) {
			// 通信完了時の処理
			if (completeCallback && typeof completeCallback === "function") {
				completeCallback(xhr, status);
			}
		},
	});
}

// 接続情報の作成
function createEmptyConnectionInfo(
				connectNo,
				clientId,
				staffType,
				staffId,
				successCallback, 
				errorCallback, 
				completeCallback
				) {
	var data = {
		connectNo : connectNo,
		clientId : clientId,
		staffType : staffType,
		staffId : staffId
	};

	if (SHOW_MEETIN_API_LOG) {
		console.log('[MeetinAPI][createEmptyConnectionInfo][start]:data = ' + JSON.stringify(data));
	}

	$.ajax({
		type:"GET",                // method = "POST"
		url:"https://" + location.host + "/api/create-empty-connection-info",        // POST送信先のURL
		data:data,  // JSONデータ本体
		contentType: 'application/json', // リクエストの Content-Type
		crossDomain: true,
		dataType: 'json',
		success: function(data, status, xhr) {
			if (SHOW_MEETIN_API_LOG) {
				if (data) {
					console.log('[MeetinAPI][createEmptyConnectionInfo][success]:data = ' + JSON.stringify(data));
				} else {
					console.log('[MeetinAPI][createEmptyConnectionInfo][success]');
				}
			}

			// 通信成功時の処理
			if (successCallback && typeof successCallback === "function") {
				successCallback(data, status, xhr);
			}
		},
		error: function(xhr, status, error) {
			if (SHOW_MEETIN_API_LOG) {
				if (error) {
					console.log('[MeetinAPI][createEmptyConnectionInfo][error]:error = ' + JSON.stringify(error));
				} else {
					console.log('[MeetinAPI][createEmptyConnectionInfo][error]');
				}
			}

			// 通信失敗時の処理
			if (errorCallback && typeof errorCallback === "function") {
				errorCallback(xhr, status, error);
			}
		},
		complete: function(xhr, status) {
			// 通信完了時の処理
			if (completeCallback && typeof completeCallback === "function") {
				completeCallback(xhr, status);
			}
		},
	});
}

// 接続情報のコピー
function cloneConnectionInfo(
				id,
				successCallback, 
				errorCallback, 
				completeCallback
				) {
	var data = {
		id : id
	};

	if (SHOW_MEETIN_API_LOG) {
		console.log('[MeetinAPI][cloneConnectionInfo][start]:data = ' + JSON.stringify(data));
	}

	$.ajax({
		type:"GET",                // method = "POST"
		url:"https://" + location.host + "/api/clone-connection-info",        // POST送信先のURL
		data:data,  // JSONデータ本体
		contentType: 'application/json', // リクエストの Content-Type
		crossDomain: true,
		dataType: 'json',
		success: function(data, status, xhr) {
			if (SHOW_MEETIN_API_LOG) {
				if (data) {
					console.log('[MeetinAPI][cloneConnectionInfo][success]:data = ' + JSON.stringify(data));
				} else {
					console.log('[MeetinAPI][cloneConnectionInfo][success]');
				}
			}

			// 通信成功時の処理
			if (successCallback && typeof successCallback === "function") {
				successCallback(data, status, xhr);
			}
		},
		error: function(xhr, status, error) {
			if (SHOW_MEETIN_API_LOG) {
				if (error) {
					console.log('[MeetinAPI][cloneConnectionInfo][error]:error = ' + JSON.stringify(error));
				} else {
					console.log('[MeetinAPI][cloneConnectionInfo][error]');
				}
			}

			// 通信失敗時の処理
			if (errorCallback && typeof errorCallback === "function") {
				errorCallback(xhr, status, error);
			}
		},
		complete: function(xhr, status) {
			// 通信完了時の処理
			if (completeCallback && typeof completeCallback === "function") {
				completeCallback(xhr, status);
			}
		},
	});
}

// 接続番号による接続情報の取得
function callConnectionInfo(
				connectNo,
				operatorPeerId,
				userPeerId,
				successCallback, 
				errorCallback, 
				completeCallback
				) {
	var data = {
		connectNo : connectNo,
		operatorPeerId : operatorPeerId,
		userPeerId : userPeerId
	};

	if (SHOW_MEETIN_API_LOG) {
		console.log('[MeetinAPI][callConnectionInfo][start]:data = ' + JSON.stringify(data));
	}

	$.ajax({
		type:"GET",                // method = "POST"
		url:"https://" + location.host + "/api/call-connection-info",        // POST送信先のURL
		data:data,  // JSONデータ本体
		contentType: 'application/json', // リクエストの Content-Type
		crossDomain: true,
		dataType: 'json',
		success: function(data, status, xhr) {
			if (SHOW_MEETIN_API_LOG) {
				if (data) {
					console.log('[MeetinAPI][callConnectionInfo][success]:data = ' + JSON.stringify(data));
				} else {
					console.log('[MeetinAPI][callConnectionInfo][success]');
				}
			}

			// 通信成功時の処理
			if (successCallback && typeof successCallback === "function") {
				successCallback(data, status, xhr);
			}
		},
		error: function(xhr, status, error) {
			if (SHOW_MEETIN_API_LOG) {
				if (error) {
					console.log('[MeetinAPI][callConnectionInfo][error]:error = ' + JSON.stringify(error));
				} else {
					console.log('[MeetinAPI][callConnectionInfo][error]');
				}
			}

			// 通信失敗時の処理
			if (errorCallback && typeof errorCallback === "function") {
				errorCallback(xhr, status, error);
			}
		},
		complete: function(xhr, status) {
			// 通信完了時の処理
			if (completeCallback && typeof completeCallback === "function") {
				completeCallback(xhr, status);
			}
		},
	});
}

// 接続番号による接続情報の取得(修正)
function updateConnectionInfoPeerId(
				id,
				userId,
				peerId,
				successCallback, 
				errorCallback, 
				completeCallback
				) {
	var data = {
		id : id,
		userId : userId,
		peerId : peerId
	};

	if (SHOW_MEETIN_API_LOG) {
		console.log('[MeetinAPI][updateConnectionInfoPeerId][start]:data = ' + JSON.stringify(data));
	}

	$.ajax({
		type:"GET",                // method = "POST"
		url:"https://" + location.host + "/api/update-connection-info-peer-id",        // POST送信先のURL
		data:data,  // JSONデータ本体
		contentType: 'application/json', // リクエストの Content-Type
		crossDomain: true,
		dataType: 'json',
		success: function(data, status, xhr) {
			if (SHOW_MEETIN_API_LOG) {
				if (data) {
					console.log('[MeetinAPI][updateConnectionInfoPeerId][success]:data = ' + JSON.stringify(data));
				} else {
					console.log('[MeetinAPI][updateConnectionInfoPeerId][success]');
				}
			}

			// 通信成功時の処理
			if (successCallback && typeof successCallback === "function") {
				successCallback(data, status, xhr);
			}
		},
		error: function(xhr, status, error) {
			if (SHOW_MEETIN_API_LOG) {
				if (error) {
					console.log('[MeetinAPI][updateConnectionInfoPeerId][error]:error = ' + JSON.stringify(error));
				} else {
					console.log('[MeetinAPI][updateConnectionInfoPeerId][error]');
				}
			}

			// 通信失敗時の処理
			if (errorCallback && typeof errorCallback === "function") {
				errorCallback(xhr, status, error);
			}
		},
		complete: function(xhr, status) {
			// 通信完了時の処理
			if (completeCallback && typeof completeCallback === "function") {
				completeCallback(xhr, status);
			}
		},
	});
}

// 接続番号による接続情報の取得
function sync_updateConnectionInfoPeerId(
	id,
	userId,
	peerId,
	successCallback, 
	errorCallback, 
	completeCallback
	) {

	var data = {
		id : id,
		userId : userId,
		peerId : peerId
	};

	if (SHOW_MEETIN_API_LOG) {
		console.log('[MeetinAPI][sync_updateConnectionInfoPeerId][start]:data = ' + JSON.stringify(data));
	}

	$.ajax({
	type:"GET",
	url:"https://" + location.host + "/api/update-connection-info-peer-id",
	data:data,  // JSONデータ本体
	async : false,   // ← asyncをfalseに設定する
	contentType: 'application/json', // リクエストの Content-Type
	crossDomain: true,
	dataType: 'json',
	success: function(data, status, xhr) {
		if (SHOW_MEETIN_API_LOG) {
			if (data) {
				console.log('[MeetinAPI][sync_updateConnectionInfoPeerId][success]:data = ' + JSON.stringify(data));
			} else {
				console.log('[MeetinAPI][sync_updateConnectionInfoPeerId][success]');
			}
		}

		// 通信成功時の処理
		if (successCallback && typeof successCallback === "function") {
			successCallback(data, status, xhr);
		}
	},
	error: function(xhr, status, error) {
		if (SHOW_MEETIN_API_LOG) {
			if (error) {
				console.log('[MeetinAPI][sync_updateConnectionInfoPeerId][error]:error = ' + JSON.stringify(error));
			} else {
				console.log('[MeetinAPI][sync_updateConnectionInfoPeerId][error]');
			}
		}

		// 通信失敗時の処理
		if (errorCallback && typeof errorCallback === "function") {
			errorCallback(xhr, status, error);
		}
	},
	complete: function(xhr, status) {
	// 通信完了時の処理
		if (completeCallback && typeof completeCallback === "function") {
			completeCallback(xhr, status);
		}
	},
	});
}


// IDによる接続情報の取得
// 接続情報の作成
function getConnectionInfo(
				connection_info_id,
				successCallback, 
				errorCallback, 
				completeCallback
				) {
	var data = {
		id : connection_info_id
	};

	if (SHOW_MEETIN_API_LOG) {
		console.log('[MeetinAPI][getConnectionInfo][start]:data = ' + JSON.stringify(data));
	}

	$.ajax({
		type:"GET",                // method = "POST"
		url:"https://" + location.host + "/api/get-connection-info",        // POST送信先のURL
		data:data,  // JSONデータ本体
		contentType: 'application/json', // リクエストの Content-Type
		crossDomain: true,
		dataType: 'json',
		success: function(data, status, xhr) {
			if (SHOW_MEETIN_API_LOG) {
				if (data) {
					console.log('[MeetinAPI][getConnectionInfo][success]:data = ' + JSON.stringify(data));
				} else {
					console.log('[MeetinAPI][getConnectionInfo][success]');
				}
			}

			// 通信成功時の処理
			if (successCallback && typeof successCallback === "function") {
				successCallback(data, status, xhr);
			}
		},
		error: function(xhr, status, error) {
			if (SHOW_MEETIN_API_LOG) {
				if (error) {
					console.log('[MeetinAPI][getConnectionInfo][error]:error = ' + JSON.stringify(error));
				} else {
					console.log('[MeetinAPI][getConnectionInfo][error]');
				}
			}

			// 通信失敗時の処理
			if (errorCallback && typeof errorCallback === "function") {
				errorCallback(xhr, status, error);
			}
		},
		complete: function(xhr, status) {
			// 通信完了時の処理
			if (completeCallback && typeof completeCallback === "function") {
				completeCallback(xhr, status);
			}
		},
	});
}

// 接続番号による接続情報の取得
// 接続情報の作成
function getConnectionInfoByConnectNo(
				connect_no,
				successCallback, 
				errorCallback, 
				completeCallback
				) {
	var data = {
		connect_no : connect_no
	};

	if (SHOW_MEETIN_API_LOG) {
		console.log('[MeetinAPI][getConnectionInfoByConnectNo][start]:data = ' + JSON.stringify(data));
	}

	$.ajax({
		type:"GET",                // method = "POST"
		url:"https://" + location.host + "/api/get-connection-info-by-connect-no",        // POST送信先のURL
		data:data,  // JSONデータ本体
		contentType: 'application/json', // リクエストの Content-Type
		crossDomain: true,
		dataType: 'json',
		success: function(data, status, xhr) {
			if (SHOW_MEETIN_API_LOG) {
				if (data) {
					console.log('[MeetinAPI][getConnectionInfoByConnectNo][success]:data = ' + JSON.stringify(data));
				} else {
					console.log('[MeetinAPI][getConnectionInfoByConnectNo][success]');
				}
			}

			// 通信成功時の処理
			if (successCallback && typeof successCallback === "function") {
				successCallback(data, status, xhr);
			}
		},
		error: function(xhr, status, error) {
			if (SHOW_MEETIN_API_LOG) {
				if (error) {
					console.log('[MeetinAPI][getConnectionInfoByConnectNo][error]:error = ' + JSON.stringify(error));
				} else {
					console.log('[MeetinAPI][getConnectionInfoByConnectNo][error]');
				}
			}

			// 通信失敗時の処理
			if (errorCallback && typeof errorCallback === "function") {
				errorCallback(xhr, status, error);
			}
		},
		complete: function(xhr, status) {
			// 通信完了時の処理
			if (completeCallback && typeof completeCallback === "function") {
				completeCallback(xhr, status);
			}
		},
	});
}

// 接続開始
function startConnectionInfo(
				id,
				successCallback, 
				errorCallback, 
				completeCallback
				) {
	var data = {
		id : id
	};

	if (SHOW_MEETIN_API_LOG) {
		console.log('[MeetinAPI][startConnectionInfo][start]:data = ' + JSON.stringify(data));
	}

	$.ajax({
		type:"GET",                // method = "POST"
		url:"https://" + location.host + "/api/start-connection-info",        // POST送信先のURL
		data:data,  // JSONデータ本体
		contentType: 'application/json', // リクエストの Content-Type
		crossDomain: true,
		dataType: 'json',
		success: function(data, status, xhr) {
			if (SHOW_MEETIN_API_LOG) {
				if (data) {
					console.log('[MeetinAPI][startConnectionInfo][success]:data = ' + JSON.stringify(data));
				} else {
					console.log('[MeetinAPI][startConnectionInfo][success]');
				}
			}

			// 通信成功時の処理
			if (successCallback && typeof successCallback === "function") {
				successCallback(data, status, xhr);
			}
		},
		error: function(xhr, status, error) {
			if (SHOW_MEETIN_API_LOG) {
				if (error) {
					console.log('[MeetinAPI][startConnectionInfo][error]:error = ' + JSON.stringify(error));
				} else {
					console.log('[MeetinAPI][startConnectionInfo][error]');
				}
			}

			// 通信失敗時の処理
			if (errorCallback && typeof errorCallback === "function") {
				errorCallback(xhr, status, error);
			}
		},
		complete: function(xhr, status) {
			// 通信完了時の処理
			if (completeCallback && typeof completeCallback === "function") {
				completeCallback(xhr, status);
			}
		},
	});
}

// 接続停止
function stopConnectionInfo(
				id,
				successCallback, 
				errorCallback, 
				completeCallback
				) {
	var data = {
		id : id
	};

	if (SHOW_MEETIN_API_LOG) {
		console.log('[MeetinAPI][stopConnectionInfo][start]:data = ' + JSON.stringify(data));
	}

	$.ajax({
		type:"GET",                // method = "POST"
		url:"https://" + location.host + "/api/stop-connection-info",        // POST送信先のURL
		data:data,  // JSONデータ本体
		contentType: 'application/json', // リクエストの Content-Type
		crossDomain: true,
		dataType: 'json',
		async: false,
		success: function(data, status, xhr) {
			if (SHOW_MEETIN_API_LOG) {
				if (data) {
					console.log('[MeetinAPI][stopConnectionInfo][success]:data = ' + JSON.stringify(data));
				} else {
					console.log('[MeetinAPI][stopConnectionInfo][success]');
				}
			}

			// 通信成功時の処理
			if (successCallback && typeof successCallback === "function") {
				successCallback(data, status, xhr);
			}
		},
		error: function(xhr, status, error) {
			if (SHOW_MEETIN_API_LOG) {
				if (error) {
					console.log('[MeetinAPI][stopConnectionInfo][error]:error = ' + JSON.stringify(error));
				} else {
					console.log('[MeetinAPI][stopConnectionInfo][error]');
				}
			}

			// 通信失敗時の処理
			if (errorCallback && typeof errorCallback === "function") {
				errorCallback(xhr, status, error);
			}
		},
		complete: function(xhr, status) {
			// 通信完了時の処理
			if (completeCallback && typeof completeCallback === "function") {
				completeCallback(xhr, status);
			}
		},
	});
}

// 接続情報を閉じる
function closeConnectionInfo(
				id,
				successCallback, 
				errorCallback, 
				completeCallback
				) {
	var data = {
		id : id
	};

	if (SHOW_MEETIN_API_LOG) {
		console.log('[MeetinAPI][closeConnectionInfo][start]:data = ' + JSON.stringify(data));
	}

	$.ajax({
		type:"GET",                // method = "POST"
		url:"https://" + location.host + "/api/close-connection-info",        // POST送信先のURL
		data:data,  // JSONデータ本体
		contentType: 'application/json', // リクエストの Content-Type
		crossDomain: true,
		dataType: 'json',
		async: false,
		success: function(data, status, xhr) {
			if (SHOW_MEETIN_API_LOG) {
				if (data) {
					console.log('[MeetinAPI][closeConnectionInfo][success]:data = ' + JSON.stringify(data));
				} else {
					console.log('[MeetinAPI][closeConnectionInfo][success]');
				}
			}

			// 通信成功時の処理
			if (successCallback && typeof successCallback === "function") {
				successCallback(data, status, xhr);
			}
		},
		error: function(xhr, status, error) {
			if (SHOW_MEETIN_API_LOG) {
				if (error) {
					console.log('[MeetinAPI][closeConnectionInfo][error]:error = ' + JSON.stringify(error));
				} else {
					console.log('[MeetinAPI][closeConnectionInfo][error]');
				}
			}

			// 通信失敗時の処理
			if (errorCallback && typeof errorCallback === "function") {
				errorCallback(xhr, status, error);
			}
		},
		complete: function(xhr, status) {
			// 通信完了時の処理
			if (completeCallback && typeof completeCallback === "function") {
				completeCallback(xhr, status);
			}
		},
	});
}

// 接続情報削除
function deleteConnectionInfo(
	id,
	successCallback, 
	errorCallback, 
	completeCallback
	) {

	var data = {
		id : id
	};

	if (SHOW_MEETIN_API_LOG) {
		console.log('[MeetinAPI][deleteConnectionInfo][start]:data = ' + JSON.stringify(data));
	}

	$.ajax({
		type:"GET",
											// finishConnectionInfo
		url:"https://" + location.host + "/api/finish-connection-info",	// 送信先のURL
		data:data,							// JSONデータ本体
		contentType: 'application/json',	// リクエストの Content-Type
		crossDomain: true,
		dataType: 'json',
		async: false,
		success: function(data, status, xhr) {
			if (SHOW_MEETIN_API_LOG) {
				if (data) {
					console.log('[MeetinAPI][deleteConnectionInfo][success]:data = ' + JSON.stringify(data));
				} else {
					console.log('[MeetinAPI][deleteConnectionInfo][success]');
				}
			}

			// 通信成功時の処理
			if (successCallback && typeof successCallback === "function") {
				successCallback(data, status, xhr);
			}
		},
		error: function(xhr, status, error) {
			if (SHOW_MEETIN_API_LOG) {
				if (error) {
					console.log('[MeetinAPI][deleteConnectionInfo][error]:error = ' + JSON.stringify(error));
				} else {
					console.log('[MeetinAPI][deleteConnectionInfo][error]');
				}
			}

			// 通信失敗時の処理
			if (errorCallback && typeof errorCallback === "function") {
				errorCallback(xhr, status, error);
			}
		},
		complete: function(xhr, status) {
			// 通信完了時の処理
			if (completeCallback && typeof completeCallback === "function") {
				completeCallback(xhr, status);
			}
		},
	});
}

function updateUnexpireConnectionInfoPeerId(
				clientId,
				staffType,
				staffId,
				operatorPeerId,
				successCallback, 
				errorCallback, 
				completeCallback
				) {
	var data = {
		clientId : clientId,
		staffType : staffType,
		staffId : staffId,
		operatorPeerId : operatorPeerId,
	};

	if (SHOW_MEETIN_API_LOG) {
		console.log('[MeetinAPI][updateUnexpireConnectionInfoPeerId][start]:data = ' + JSON.stringify(data));
	}

	$.ajax({
		type:"GET",                // method = "POST"
		url:"https://" + location.host + "/api/update-unexpire-connection-info-peer-id",        // POST送信先のURL
		data:data,  // JSONデータ本体
		contentType: 'application/json', // リクエストの Content-Type
		crossDomain: true,
		dataType: 'json',
		success: function(data, status, xhr) {
			if (SHOW_MEETIN_API_LOG) {
				if (data) {
					console.log('[MeetinAPI][updateUnexpireConnectionInfoPeerId][success]:data = ' + JSON.stringify(data));
				} else {
					console.log('[MeetinAPI][updateUnexpireConnectionInfoPeerId][success]');
				}
			}

			// 通信成功時の処理
			if (successCallback && typeof successCallback === "function") {
				successCallback(data, status, xhr);
			}
		},
		error: function(xhr, status, error) {
			if (SHOW_MEETIN_API_LOG) {
				if (error) {
					console.log('[MeetinAPI][updateUnexpireConnectionInfoPeerId][error]:error = ' + JSON.stringify(error));
				} else {
					console.log('[MeetinAPI][updateUnexpireConnectionInfoPeerId][error]');
				}
			}

			// 通信失敗時の処理
			if (errorCallback && typeof errorCallback === "function") {
				errorCallback(xhr, status, error);
			}
		},
		complete: function(xhr, status) {
			// 通信完了時の処理
			if (completeCallback && typeof completeCallback === "function") {
				completeCallback(xhr, status);
			}
		},
	});
}

// 接続情報を閉じる
function closeExpireConnectionInfo(
				clientId,
				staffType,
				staffId,
				successCallback, 
				errorCallback, 
				completeCallback
				) {
	var data = {
		clientId : clientId,
		staffType : staffType,
		staffId : staffId
	};

	if (SHOW_MEETIN_API_LOG) {
		console.log('[MeetinAPI][closeExpireConnectionInfo][start]:data = ' + JSON.stringify(data));
	}

	$.ajax({
		type:"GET",                // method = "POST"
		url:"https://" + location.host + "/api/close-expire-connection-info",        // POST送信先のURL
		data:data,  // JSONデータ本体
		contentType: 'application/json', // リクエストの Content-Type
		crossDomain: true,
		dataType: 'json',
		async: false,
		success: function(data, status, xhr) {
			if (SHOW_MEETIN_API_LOG) {
				if (data) {
					console.log('[MeetinAPI][closeExpireConnectionInfo][success]:data = ' + JSON.stringify(data));
				} else {
					console.log('[MeetinAPI][closeExpireConnectionInfo][success]');
				}
			}

			// 通信成功時の処理
			if (successCallback && typeof successCallback === "function") {
				successCallback(data, status, xhr);
			}
		},
		error: function(xhr, status, error) {
			if (SHOW_MEETIN_API_LOG) {
				if (error) {
					console.log('[MeetinAPI][closeExpireConnectionInfo][error]:error = ' + JSON.stringify(error));
				} else {
					console.log('[MeetinAPI][closeExpireConnectionInfo][error]');
				}
			}

			// 通信失敗時の処理
			if (errorCallback && typeof errorCallback === "function") {
				errorCallback(xhr, status, error);
			}
		},
		complete: function(xhr, status) {
			// 通信完了時の処理
			if (completeCallback && typeof completeCallback === "function") {
				completeCallback(xhr, status);
			}
		},
	});
}

function getUnexpireConnectionInfoList(
				clientId,
				staffType,
				staffId,
				successCallback, 
				errorCallback, 
				completeCallback
				) {
	var data = {
		clientId : clientId,
		staffType : staffType,
		staffId : staffId
	};

	if (SHOW_MEETIN_API_LOG) {
		console.log('[MeetinAPI][getUnexpireConnectionInfoList][start]:data = ' + JSON.stringify(data));
	}

	$.ajax({
		type:"GET",                // method = "POST"
		url:"https://" + location.host + "/api/get-unexpire-connection-info-list",        // POST送信先のURL
		data:data,  // JSONデータ本体
		contentType: 'application/json', // リクエストの Content-Type
		crossDomain: true,
		dataType: 'json',
		async: false,
		success: function(data, status, xhr) {
			if (SHOW_MEETIN_API_LOG) {
				if (data) {
					console.log('[MeetinAPI][getUnexpireConnectionInfoList][success]:data = ' + JSON.stringify(data));
				} else {
					console.log('[MeetinAPI][getUnexpireConnectionInfoList][success]');
				}
			}

			// 通信成功時の処理
			if (successCallback && typeof successCallback === "function") {
				successCallback(data, status, xhr);
			}
		},
		error: function(xhr, status, error) {
			if (SHOW_MEETIN_API_LOG) {
				if (error) {
					console.log('[MeetinAPI][getUnexpireConnectionInfoList][error]:error = ' + JSON.stringify(error));
				} else {
					console.log('[MeetinAPI][getUnexpireConnectionInfoList][error]');
				}
			}

			// 通信失敗時の処理
			if (errorCallback && typeof errorCallback === "function") {
				errorCallback(xhr, status, error);
			}
		},
		complete: function(xhr, status) {
			// 通信完了時の処理
			if (completeCallback && typeof completeCallback === "function") {
				completeCallback(xhr, status);
			}
		},
	});
}

function getServerDatetime(
				successCallback, 
				errorCallback, 
				completeCallback
				) {
	var data = {
	};

	if (SHOW_MEETIN_API_LOG) {
		console.log('[MeetinAPI][getServerDatetime][start]:data = ' + JSON.stringify(data));
	}

	$.ajax({
		type:"GET",                // method = "POST"
		url:"https://" + location.host + "/api/get-server-datetime",        // POST送信先のURL
		data:data,  // JSONデータ本体
		contentType: 'application/json', // リクエストの Content-Type
		crossDomain: true,
		dataType: 'json',
		async: false,
		success: function(data, status, xhr) {
			if (SHOW_MEETIN_API_LOG) {
				if (data) {
					console.log('[MeetinAPI][getServerDatetime][success]:data = ' + JSON.stringify(data));
				} else {
					console.log('[MeetinAPI][getServerDatetime][success]');
				}
			}

			// 通信成功時の処理
			if (successCallback && typeof successCallback === "function") {
				successCallback(data, status, xhr);
			}
		},
		error: function(xhr, status, error) {
			if (SHOW_MEETIN_API_LOG) {
				if (error) {
					console.log('[MeetinAPI][getServerDatetime][error]:error = ' + JSON.stringify(error));
				} else {
					console.log('[MeetinAPI][getServerDatetime][error]');
				}
			}

			// 通信失敗時の処理
			if (errorCallback && typeof errorCallback === "function") {
				errorCallback(xhr, status, error);
			}
		},
		complete: function(xhr, status) {
			// 通信完了時の処理
			if (completeCallback && typeof completeCallback === "function") {
				completeCallback(xhr, status);
			}
		},
	});
}
function removePeerIdFromConnectionInfo(
				id,
				peerId,
				successCallback, 
				errorCallback, 
				completeCallback
				) {
	var data = {
		id : id,
		peerId : peerId
	};

	if (SHOW_MEETIN_API_LOG) {
		console.log('[MeetinAPI][removePeerIdFromConnectionInfo][start]:data = ' + JSON.stringify(data));
	}

	$.ajax({
		type:"GET",                // method = "POST"
		url:"https://" + location.host + "/api/remove-peer-id-from-connection-info",        // POST送信先のURL
		data:data,  // JSONデータ本体
		contentType: 'application/json', // リクエストの Content-Type
		crossDomain: true,
		dataType: 'json',
		success: function(data, status, xhr) {
			if (SHOW_MEETIN_API_LOG) {
				if (data) {
					console.log('[MeetinAPI][removePeerIdFromConnectionInfo][success]:data = ' + JSON.stringify(data));
				} else {
					console.log('[MeetinAPI][removePeerIdFromConnectionInfo][success]');
				}
			}


			// 通信成功時の処理
			if (successCallback && typeof successCallback === "function") {
				successCallback(data, status, xhr);
			}
		},
		error: function(xhr, status, error) {
			if (SHOW_MEETIN_API_LOG) {
				if (error) {
					console.log('[MeetinAPI][removePeerIdFromConnectionInfo][error]:error = ' + JSON.stringify(error));
				} else {
					console.log('[MeetinAPI][removePeerIdFromConnectionInfo][error]');
				}
			}


			// 通信失敗時の処理
			if (errorCallback && typeof errorCallback === "function") {
				errorCallback(xhr, status, error);
			}
		},
		complete: function(xhr, status) {
			// 通信完了時の処理
			if (completeCallback && typeof completeCallback === "function") {
				completeCallback(xhr, status);
			}
		},
	});
}

/********************************** 未使用
function dataConnectionConnectLog(
				connection_info_id,
				connect_no,
				connection_type,
				connection_id,
				from_peer_id,
				to_peer_id,
				from_user_id,
				to_user_id,
				successCallback, 
				errorCallback, 
				completeCallback
				) {
	var data = {
		connection_info_id : connection_info_id,
		connect_no : connect_no,
		connection_type : connection_type,
		connection_id : connection_id,
		from_peer_id : from_peer_id,
		to_peer_id : to_peer_id,
		from_user_id : from_user_id,
		to_user_id : to_user_id
	};

	if (SHOW_MEETIN_API_LOG) {
		console.log('[MeetinAPI][dataConnectionConnectLog][start]:data = ' + JSON.stringify(data));
	}

	$.ajax({
		type:"GET",                // method = "POST"
		url:"https://" + location.host + "/api/data-connection-connect-log",        // POST送信先のURL
		data:data,  // JSONデータ本体
		contentType: 'application/json', // リクエストの Content-Type
		crossDomain: true,
		dataType: 'json',
		success: function(data, status, xhr) {
			if (SHOW_MEETIN_API_LOG) {
				if (data) {
					console.log('[MeetinAPI][dataConnectionConnectLog][success]:data = ' + JSON.stringify(data));
				} else {
					console.log('[MeetinAPI][dataConnectionConnectLog][success]');
				}
			}

			// 通信成功時の処理
			if (successCallback && typeof successCallback === "function") {
				successCallback(data, status, xhr);
			}
		},
		error: function(xhr, status, error) {
			if (SHOW_MEETIN_API_LOG) {
				if (error) {
					console.log('[MeetinAPI][dataConnectionConnectLog][error]:error = ' + JSON.stringify(error));
				} else {
					console.log('[MeetinAPI][dataConnectionConnectLog][error]');
				}
			}

			// 通信失敗時の処理
			if (errorCallback && typeof errorCallback === "function") {
				errorCallback(xhr, status, error);
			}
		},
		complete: function(xhr, status) {
			// 通信完了時の処理
			if (completeCallback && typeof completeCallback === "function") {
				completeCallback(xhr, status);
			}
		},
	});
}

function dataConnectionOpen1Log(
				connection_info_id,
				connection_type,
				connection_id,
				from_peer_id,
				to_peer_id,
				successCallback, 
				errorCallback, 
				completeCallback
				) {
	var data = {
		connection_info_id : connection_info_id,
		connection_type : connection_type,
		connection_id : connection_id,
		from_peer_id : from_peer_id,
		to_peer_id : to_peer_id
	};

	if (SHOW_MEETIN_API_LOG) {
		console.log('[MeetinAPI][dataConnectionOpen1Log][start]:data = ' + JSON.stringify(data));
	}

	$.ajax({
		type:"GET",                // method = "POST"
		url:"https://" + location.host + "/api/data-connection-open-1-log",        // POST送信先のURL
		data:data,  // JSONデータ本体
		contentType: 'application/json', // リクエストの Content-Type
		crossDomain: true,
		dataType: 'json',
		success: function(data, status, xhr) {
			if (SHOW_MEETIN_API_LOG) {
				if (data) {
					console.log('[MeetinAPI][dataConnectionOpen1Log][success]:data = ' + JSON.stringify(data));
				} else {
					console.log('[MeetinAPI][dataConnectionOpen1Log][success]');
				}
			}

			// 通信成功時の処理
			if (successCallback && typeof successCallback === "function") {
				successCallback(data, status, xhr);
			}
		},
		error: function(xhr, status, error) {
			if (SHOW_MEETIN_API_LOG) {
				if (error) {
					console.log('[MeetinAPI][dataConnectionOpen1Log][error]:error = ' + JSON.stringify(error));
				} else {
					console.log('[MeetinAPI][dataConnectionOpen1Log][error]');
				}
			}

			// 通信失敗時の処理
			if (errorCallback && typeof errorCallback === "function") {
				errorCallback(xhr, status, error);
			}
		},
		complete: function(xhr, status) {
			// 通信完了時の処理
			if (completeCallback && typeof completeCallback === "function") {
				completeCallback(xhr, status);
			}
		},
	});
}

function dataConnectionOpen2Log(
				connection_info_id,
				connection_type,
				connection_id,
				from_peer_id,
				to_peer_id,
				successCallback, 
				errorCallback, 
				completeCallback
				) {
	var data = {
		connection_info_id : connection_info_id,
		connection_type : connection_type,
		connection_id : connection_id,
		from_peer_id : from_peer_id,
		to_peer_id : to_peer_id
	};

	if (SHOW_MEETIN_API_LOG) {
		console.log('[MeetinAPI][dataConnectionOpen2Log][start]:data = ' + JSON.stringify(data));
	}

	$.ajax({
		type:"GET",                // method = "POST"
		url:"https://" + location.host + "/api/data-connection-open-2-log",        // POST送信先のURL
		data:data,  // JSONデータ本体
		contentType: 'application/json', // リクエストの Content-Type
		crossDomain: true,
		dataType: 'json',
		success: function(data, status, xhr) {
			if (SHOW_MEETIN_API_LOG) {
				if (data) {
					console.log('[MeetinAPI][dataConnectionOpen2Log][success]:data = ' + JSON.stringify(data));
				} else {
					console.log('[MeetinAPI][dataConnectionOpen2Log][success]');
				}
			}

			// 通信成功時の処理
			if (successCallback && typeof successCallback === "function") {
				successCallback(data, status, xhr);
			}
		},
		error: function(xhr, status, error) {
			if (SHOW_MEETIN_API_LOG) {
				if (error) {
					console.log('[MeetinAPI][dataConnectionOpen2Log][error]:error = ' + JSON.stringify(error));
				} else {
					console.log('[MeetinAPI][dataConnectionOpen2Log][error]');
				}
			}

			// 通信失敗時の処理
			if (errorCallback && typeof errorCallback === "function") {
				errorCallback(xhr, status, error);
			}
		},
		complete: function(xhr, status) {
			// 通信完了時の処理
			if (completeCallback && typeof completeCallback === "function") {
				completeCallback(xhr, status);
			}
		},
	});
}

function dataConnectionClose1Log(
				connection_info_id,
				connection_type,
				connection_id,
				from_peer_id,
				to_peer_id,
				successCallback, 
				errorCallback, 
				completeCallback
				) {
	var data = {
		connection_info_id : connection_info_id,
		connection_type : connection_type,
		connection_id : connection_id,
		from_peer_id : from_peer_id,
		to_peer_id : to_peer_id
	};
	if (SHOW_MEETIN_API_LOG) {
		console.log('[MeetinAPI][dataConnectionClose1Log][start]:data = ' + JSON.stringify(data));
	}

	$.ajax({
		type:"GET",                // method = "POST"
		url:"https://" + location.host + "/api/data-connection-close-1-log",        // POST送信先のURL
		data:data,  // JSONデータ本体
		contentType: 'application/json', // リクエストの Content-Type
		crossDomain: true,
		dataType: 'json',
		success: function(data, status, xhr) {
			if (SHOW_MEETIN_API_LOG) {
				if (data) {
					console.log('[MeetinAPI][dataConnectionClose1Log][success]:data = ' + JSON.stringify(data));
				} else {
					console.log('[MeetinAPI][dataConnectionClose1Log][success]');
				}
			}

			// 通信成功時の処理
			if (successCallback && typeof successCallback === "function") {
				successCallback(data, status, xhr);
			}
		},
		error: function(xhr, status, error) {
			if (SHOW_MEETIN_API_LOG) {
				if (error) {
					console.log('[MeetinAPI][dataConnectionClose1Log][error]:error = ' + JSON.stringify(error));
				} else {
					console.log('[MeetinAPI][dataConnectionClose1Log][error]');
				}
			}

			// 通信失敗時の処理
			if (errorCallback && typeof errorCallback === "function") {
				errorCallback(xhr, status, error);
			}
		},
		complete: function(xhr, status) {
			// 通信完了時の処理
			if (completeCallback && typeof completeCallback === "function") {
				completeCallback(xhr, status);
			}
		},
	});
}

function dataConnectionClose2Log(
				connection_info_id,
				connection_type,
				connection_id,
				from_peer_id,
				to_peer_id,
				successCallback, 
				errorCallback, 
				completeCallback
				) {
	var data = {
		connection_info_id : connection_info_id,
		connection_type : connection_type,
		connection_id : connection_id,
		from_peer_id : from_peer_id,
		to_peer_id : to_peer_id
	};

	if (SHOW_MEETIN_API_LOG) {
		console.log('[MeetinAPI][dataConnectionClose2Log][start]:data = ' + JSON.stringify(data));
	}

	$.ajax({
		type:"GET",                // method = "POST"
		url:"https://" + location.host + "/api/data-connection-close-2-log",        // POST送信先のURL
		data:data,  // JSONデータ本体
		contentType: 'application/json', // リクエストの Content-Type
		crossDomain: true,
		dataType: 'json',
		success: function(data, status, xhr) {
			if (SHOW_MEETIN_API_LOG) {
				if (data) {
					console.log('[MeetinAPI][dataConnectionClose2Log][success]:data = ' + JSON.stringify(data));
				} else {
					console.log('[MeetinAPI][dataConnectionClose2Log][success]');
				}
			}

			// 通信成功時の処理
			if (successCallback && typeof successCallback === "function") {
				successCallback(data, status, xhr);
			}
		},
		error: function(xhr, status, error) {
			if (SHOW_MEETIN_API_LOG) {
				if (error) {
					console.log('[MeetinAPI][dataConnectionClose2Log][error]:error = ' + JSON.stringify(error));
				} else {
					console.log('[MeetinAPI][dataConnectionClose2Log][error]');
				}
			}

			// 通信失敗時の処理
			if (errorCallback && typeof errorCallback === "function") {
				errorCallback(xhr, status, error);
			}
		},
		complete: function(xhr, status) {
			// 通信完了時の処理
			if (completeCallback && typeof completeCallback === "function") {
				completeCallback(xhr, status);
			}
		},
	});
}
***************************************/

function mediaConnectionCallLog(
				connection_info_id,
				connect_no,
				connection_type,
				connection_id,
				from_peer_id,
				to_peer_id,
				from_user_id,
				successCallback, 
				errorCallback, 
				completeCallback
				) {
	var data = {
		connection_info_id : connection_info_id,
		connect_no : connect_no,
		connection_type : connection_type,
		connection_id : connection_id,
		from_peer_id : from_peer_id,
		to_peer_id : to_peer_id,
		from_user_id : from_user_id
	};

	var outstr = "connection_info_id=(" + connection_info_id + "),";
	outstr += "connect_no=(" + connect_no + "),";
	outstr += "connection_type=(" + connection_type + "),";
	outstr += "connection_id=(" + connection_id + "),";
	outstr += "from_peer_id=(" + from_peer_id + "),";
	outstr += "to_peer_id=(" + to_peer_id + "),";
	outstr += "from_user_id=(" + from_user_id + ")";
	if (SHOW_MEETIN_API_LOG) {
		clientLog('DEBUG', outstr);
	}

/*************************************** Log出力しない
	if (SHOW_MEETIN_API_LOG) {
		console.log('[MeetinAPI][mediaConnectionCallLog][start]:data = ' + JSON.stringify(data));
	}

	$.ajax({
		type:"GET",                // method = "POST"
		url:"https://" + location.host + "/api/media-connection-call-log",        // POST送信先のURL
		data:data,  // JSONデータ本体
		contentType: 'application/json', // リクエストの Content-Type
		crossDomain: true,
		dataType: 'json',
		success: function(data, status, xhr) {
			if (SHOW_MEETIN_API_LOG) {
				if (data) {
					console.log('[MeetinAPI][mediaConnectionCallLog][success]:data = ' + JSON.stringify(data));
				} else {
					console.log('[MeetinAPI][mediaConnectionCallLog][success]');
				}
			}

			// 通信成功時の処理
			if (successCallback && typeof successCallback === "function") {
				successCallback(data, status, xhr);
			}
		},
		error: function(xhr, status, error) {
			if (SHOW_MEETIN_API_LOG) {
				if (error) {
					console.log('[MeetinAPI][mediaConnectionCallLog][error]:error = ' + JSON.stringify(error));
				} else {
					console.log('[MeetinAPI][mediaConnectionCallLog][error]');
				}
			}

			// 通信失敗時の処理
			if (errorCallback && typeof errorCallback === "function") {
				errorCallback(xhr, status, error);
			}
		},
		complete: function(xhr, status) {
			// 通信完了時の処理
			if (completeCallback && typeof completeCallback === "function") {
				completeCallback(xhr, status);
			}
		},
	});
***************************************/
}

function mediaConnectionAnswerLog(
				connection_info_id,
				connection_type,
				connection_id,
				from_peer_id,
				to_peer_id,
				to_user_id,
				successCallback, 
				errorCallback, 
				completeCallback
				) {
	var data = {
		connection_info_id : connection_info_id,
		connection_type : connection_type,
		connection_id : connection_id,
		from_peer_id : from_peer_id,
		to_peer_id : to_peer_id,
		to_user_id : to_user_id
	};

	var outstr = "connection_info_id=(" + connection_info_id + "),";
	outstr += "connection_type=(" + connection_type + "),";
	outstr += "connection_id=(" + connection_id + "),";
	outstr += "from_peer_id=(" + from_peer_id + "),";
	outstr += "to_peer_id=(" + to_peer_id + "),";
	outstr += "to_user_id=(" + to_user_id + ")";
	if (SHOW_MEETIN_API_LOG) {
		clientLog('DEBUG', outstr);
	}

/*************************************** Log出力しない
	if (SHOW_MEETIN_API_LOG) {
		console.log('[MeetinAPI][mediaConnectionAnswerLog][start]:data = ' + JSON.stringify(data));
	}

	$.ajax({
		type:"GET",                // method = "POST"
		url:"https://" + location.host + "/api/media-connection-answer-log",        // POST送信先のURL
		data:data,  // JSONデータ本体
		contentType: 'application/json', // リクエストの Content-Type
		crossDomain: true,
		dataType: 'json',
		success: function(data, status, xhr) {
			if (SHOW_MEETIN_API_LOG) {
				if (data) {
					console.log('[MeetinAPI][mediaConnectionAnswerLog][success]:data = ' + JSON.stringify(data));
				} else {
					console.log('[MeetinAPI][mediaConnectionAnswerLog][success]');
				}
			}

			// 通信成功時の処理
			if (successCallback && typeof successCallback === "function") {
				successCallback(data, status, xhr);
			}
		},
		error: function(xhr, status, error) {
			if (SHOW_MEETIN_API_LOG) {
				if (error) {
					console.log('[MeetinAPI][mediaConnectionAnswerLog][error]:error = ' + JSON.stringify(error));
				} else {
					console.log('[MeetinAPI][mediaConnectionAnswerLog][error]');
				}
			}

			// 通信失敗時の処理
			if (errorCallback && typeof errorCallback === "function") {
				errorCallback(xhr, status, error);
			}
		},
		complete: function(xhr, status) {
			// 通信完了時の処理
			if (completeCallback && typeof completeCallback === "function") {
				completeCallback(xhr, status);
			}
		},
	});
*************************************************/
}

function mediaConnectionStreamSendConfirmLog(
				connection_info_id,
				connection_type,
				connection_id,
				from_peer_id,
				to_peer_id,
				successCallback, 
				errorCallback, 
				completeCallback
				) {
	var data = {
		connection_info_id : connection_info_id,
		connection_type : connection_type,
		connection_id : connection_id,
		from_peer_id : from_peer_id,
		to_peer_id : to_peer_id
	};

	var outstr = "connection_info_id=(" + connection_info_id + "),";
	outstr += "connection_type=(" + connection_type + "),";
	outstr += "connection_id=(" + connection_id + "),";
	outstr += "from_peer_id=(" + from_peer_id + "),";
	outstr += "to_peer_id=(" + to_peer_id + ")";
	if (SHOW_MEETIN_API_LOG) {
		clientLog('DEBUG', outstr);
	}

/*************************************** Log出力しない
	if (SHOW_MEETIN_API_LOG) {
		console.log('[MeetinAPI][mediaConnectionStreamSendConfirmLog][start]:data = ' + JSON.stringify(data));
	}

	$.ajax({
		type:"GET",                // method = "POST"
		url:"https://" + location.host + "/api/media-connection-stream-send-confirm-log",        // POST送信先のURL
		data:data,  // JSONデータ本体
		contentType: 'application/json', // リクエストの Content-Type
		crossDomain: true,
		dataType: 'json',
		success: function(data, status, xhr) {
			if (SHOW_MEETIN_API_LOG) {
				if (data) {
					console.log('[MeetinAPI][mediaConnectionStreamSendConfirmLog][success]:data = ' + JSON.stringify(data));
				} else {
					console.log('[MeetinAPI][mediaConnectionStreamSendConfirmLog][success]');
				}
			}

			// 通信成功時の処理
			if (successCallback && typeof successCallback === "function") {
				successCallback(data, status, xhr);
			}
		},
		error: function(xhr, status, error) {
			if (SHOW_MEETIN_API_LOG) {
				if (error) {
					console.log('[MeetinAPI][mediaConnectionStreamSendConfirmLog][error]:error = ' + JSON.stringify(error));
				} else {
					console.log('[MeetinAPI][mediaConnectionStreamSendConfirmLog][error]');
				}
			}

			// 通信失敗時の処理
			if (errorCallback && typeof errorCallback === "function") {
				errorCallback(xhr, status, error);
			}
		},
		complete: function(xhr, status) {
			// 通信完了時の処理
			if (completeCallback && typeof completeCallback === "function") {
				completeCallback(xhr, status);
			}
		},
	});
******************************************************/
}

function mediaConnectionStream1Log(
				connection_info_id,
				connection_type,
				connection_id,
				from_peer_id,
				to_peer_id,
				successCallback, 
				errorCallback, 
				completeCallback
				) {
	var data = {
		connection_info_id : connection_info_id,
		connection_type : connection_type,
		connection_id : connection_id,
		from_peer_id : from_peer_id,
		to_peer_id : to_peer_id
	};
/*************************************** Log出力しない
	if (SHOW_MEETIN_API_LOG) {
		console.log('[MeetinAPI][mediaConnectionStream1Log][start]:data = ' + JSON.stringify(data));
	}

	$.ajax({
		type:"GET",                // method = "POST"
		url:"https://" + location.host + "/api/media-connection-stream-1-log",        // POST送信先のURL
		data:data,  // JSONデータ本体
		contentType: 'application/json', // リクエストの Content-Type
		crossDomain: true,
		dataType: 'json',
		success: function(data, status, xhr) {
			if (SHOW_MEETIN_API_LOG) {
				if (data) {
					console.log('[MeetinAPI][mediaConnectionStream1Log][success]:data = ' + JSON.stringify(data));
				} else {
					console.log('[MeetinAPI][mediaConnectionStream1Log][success]');
				}
			}

			// 通信成功時の処理
			if (successCallback && typeof successCallback === "function") {
				successCallback(data, status, xhr);
			}
		},
		error: function(xhr, status, error) {
			if (SHOW_MEETIN_API_LOG) {
				if (error) {
					console.log('[MeetinAPI][mediaConnectionStream1Log][error]:error = ' + JSON.stringify(error));
				} else {
					console.log('[MeetinAPI][mediaConnectionStream1Log][error]');
				}
			}

			// 通信失敗時の処理
			if (errorCallback && typeof errorCallback === "function") {
				errorCallback(xhr, status, error);
			}
		},
		complete: function(xhr, status) {
			// 通信完了時の処理
			if (completeCallback && typeof completeCallback === "function") {
				completeCallback(xhr, status);
			}
		},
	});
*****************************************************/
}

function mediaConnectionStream2Log(
				connection_info_id,
				connection_type,
				connection_id,
				from_peer_id,
				to_peer_id,
				successCallback, 
				errorCallback, 
				completeCallback
				) {
	var data = {
		connection_info_id : connection_info_id,
		connection_type : connection_type,
		connection_id : connection_id,
		from_peer_id : from_peer_id,
		to_peer_id : to_peer_id
	};

	if (SHOW_MEETIN_API_LOG) {
		console.log('[MeetinAPI][mediaConnectionStream2Log][start]:data = ' + JSON.stringify(data));
	}
/*************************************** Log出力しない
	$.ajax({
		type:"GET",                // method = "POST"
		url:"https://" + location.host + "/api/media-connection-stream-2-log",        // POST送信先のURL
		data:data,  // JSONデータ本体
		contentType: 'application/json', // リクエストの Content-Type
		crossDomain: true,
		dataType: 'json',
		success: function(data, status, xhr) {
			if (SHOW_MEETIN_API_LOG) {
				if (data) {
					console.log('[MeetinAPI][mediaConnectionStream2Log][success]:data = ' + JSON.stringify(data));
				} else {
					console.log('[MeetinAPI][mediaConnectionStream2Log][success]');
				}
			}

			// 通信成功時の処理
			if (successCallback && typeof successCallback === "function") {
				successCallback(data, status, xhr);
			}
		},
		error: function(xhr, status, error) {
			if (SHOW_MEETIN_API_LOG) {
				if (error) {
					console.log('[MeetinAPI][mediaConnectionStream2Log][error]:error = ' + JSON.stringify(error));
				} else {
					console.log('[MeetinAPI][mediaConnectionStream2Log][error]');
				}
			}

			// 通信失敗時の処理
			if (errorCallback && typeof errorCallback === "function") {
				errorCallback(xhr, status, error);
			}
		},
		complete: function(xhr, status) {
			// 通信完了時の処理
			if (completeCallback && typeof completeCallback === "function") {
				completeCallback(xhr, status);
			}
		},
	});
*****************************************************/
}

function mediaConnectionClose1Log(
				connection_info_id,
				connection_type,
				connection_id,
				from_peer_id,
				to_peer_id,
				successCallback, 
				errorCallback, 
				completeCallback
				) {
	var data = {
		connection_info_id : connection_info_id,
		connection_type : connection_type,
		connection_id : connection_id,
		from_peer_id : from_peer_id,
		to_peer_id : to_peer_id
	};

	var outstr = "connection_info_id=(" + connection_info_id + "),";
	outstr += "connection_type=(" + connection_type + "),";
	outstr += "connection_id=(" + connection_id + "),";
	outstr += "from_peer_id=(" + from_peer_id + "),";
	outstr += "to_peer_id=(" + to_peer_id + ")";
	if (SHOW_MEETIN_API_LOG) {
		clientLog('DEBUG', outstr);
	}

/*************************************** Log出力しない
	if (SHOW_MEETIN_API_LOG) {
		console.log('[MeetinAPI][mediaConnectionClose1Log][start]:data = ' + JSON.stringify(data));
	}
	$.ajax({
		type:"GET",                // method = "POST"
		url:"https://" + location.host + "/api/media-connection-close-1-log",        // POST送信先のURL
		data:data,  // JSONデータ本体
		contentType: 'application/json', // リクエストの Content-Type
		crossDomain: true,
		dataType: 'json',
		success: function(data, status, xhr) {
			if (SHOW_MEETIN_API_LOG) {
				if (data) {
					console.log('[MeetinAPI][mediaConnectionClose1Log][success]:data = ' + JSON.stringify(data));
				} else {
					console.log('[MeetinAPI][mediaConnectionClose1Log][success]');
				}
			}

			// 通信成功時の処理
			if (successCallback && typeof successCallback === "function") {
				successCallback(data, status, xhr);
			}
		},
		error: function(xhr, status, error) {
			if (SHOW_MEETIN_API_LOG) {
				if (error) {
					console.log('[MeetinAPI][mediaConnectionClose1Log][error]:error = ' + JSON.stringify(error));
				} else {
					console.log('[MeetinAPI][mediaConnectionClose1Log][error]');
				}
			}

			// 通信失敗時の処理
			if (errorCallback && typeof errorCallback === "function") {
				errorCallback(xhr, status, error);
			}
		},
		complete: function(xhr, status) {
			// 通信完了時の処理
			if (completeCallback && typeof completeCallback === "function") {
				completeCallback(xhr, status);
			}
		},
	});
******************************************************/
}

function mediaConnectionClose2Log(
				connection_info_id,
				connection_type,
				connection_id,
				from_peer_id,
				to_peer_id,
				successCallback, 
				errorCallback, 
				completeCallback
				) {
	var data = {
		connection_info_id : connection_info_id,
		connection_type : connection_type,
		connection_id : connection_id,
		from_peer_id : from_peer_id,
		to_peer_id : to_peer_id
	};

	var outstr = "connection_info_id=(" + connection_info_id + "),";
	outstr += "connection_type=(" + connection_type + "),";
	outstr += "connection_id=(" + connection_id + "),";
	outstr += "from_peer_id=(" + from_peer_id + "),";
	outstr += "to_peer_id=(" + to_peer_id + ")";
	if (SHOW_MEETIN_API_LOG) {
		clientLog('DEBUG', outstr);
	}
/*************************************** Log出力しない
	if (SHOW_MEETIN_API_LOG) {
		console.log('[MeetinAPI][mediaConnectionClose2Log][start]:data = ' + JSON.stringify(data));
	}

	$.ajax({
		type:"GET",                // method = "POST"
		url:"https://" + location.host + "/api/media-connection-close-2-log",        // POST送信先のURL
		data:data,  // JSONデータ本体
		contentType: 'application/json', // リクエストの Content-Type
		crossDomain: true,
		dataType: 'json',
		success: function(data, status, xhr) {
			if (SHOW_MEETIN_API_LOG) {
				if (data) {
					console.log('[MeetinAPI][mediaConnectionClose2Log][success]:data = ' + JSON.stringify(data));
				} else {
					console.log('[MeetinAPI][mediaConnectionClose2Log][success]');
				}
			}

			// 通信成功時の処理
			if (successCallback && typeof successCallback === "function") {
				successCallback(data, status, xhr);
			}
		},
		error: function(xhr, status, error) {
			if (SHOW_MEETIN_API_LOG) {
				if (error) {
					console.log('[MeetinAPI][mediaConnectionClose2Log][error]:error = ' + JSON.stringify(error));
				} else {
					console.log('[MeetinAPI][mediaConnectionClose2Log][error]');
				}
			}

			// 通信失敗時の処理
			if (errorCallback && typeof errorCallback === "function") {
				errorCallback(xhr, status, error);
			}
		},
		complete: function(xhr, status) {
			// 通信完了時の処理
			if (completeCallback && typeof completeCallback === "function") {
				completeCallback(xhr, status);
			}
		},
	});
******************************************************/
}

function TraceLog(
				connection_info_id,
				connect_no,
				type,
				message,
				command,
				from_peer_id,
				to_peer_id
				) {

	var data = {
		connection_info_id : connection_info_id,			// connection_infoのID
		connect_no : (connect_no !== null ? connect_no:''),	// 接続番号 (meetin番号:'03056120791')
		type : (type !== null ? type : 0),					// 種類(0:, 1:, 2:, 3:, 4:)
		message : message,									// メッセージ 
		command : (command != null ? command:null),			// コマンド
		from_peer_id : (from_peer_id != null ? from_peer_id:null),	// 送信元ピアID
		to_peer_id : to_peer_id								// 送信先ピアID
	};

//console.log
//console.log('★[MeetinAPI][TraceLog][start]:data = ' + JSON.stringify(data));

	$.ajax({
		type:"GET",											// method = "POST"
		url:"https://" + location.host + "/api/trace-log",	// POST送信先のURL
		data:data,											// JSONデータ本体
		contentType: 'application/json',					// リクエストの Content-Type
		crossDomain: true,
		dataType: 'json',
		success: function(data, status, xhr) {
			// 正常レスポンス
//			console.log('[MeetinAPI][dataConnectionConnectLog][success]');
//			if (data) {
//				console.log('[MeetinAPI][dataConnectionConnectLog][success]:data = ' + JSON.stringify(data));
//			} else {
//				console.log('[MeetinAPI][dataConnectionConnectLog][success]');
//			}
		},
		error: function(xhr, status, error) {
			// エラーレスポンス
			if (error) {
				console.log('[MeetinAPI][dataConnectionConnectLog][error]:error = ' + JSON.stringify(error));
			} else {
				console.log('[MeetinAPI][dataConnectionConnectLog][error]');
			}
		},
		complete: function(xhr, status) {
			// 通信完了時の処理
		},
	});
}


function saveFile(
				connection_info_id,
				data,
				successCallback, 
				errorCallback, 
				completeCallback
				) {
	if (SHOW_MEETIN_API_LOG) {
		console.log('[MeetinAPI][saveFile][start]');
	}

	var data = {
		connection_info_id : connection_info_id,
		data : data
	};

	$.ajax({
		type:"POST",                // method = "POST"
		url:"https://" + location.host + "/api/save-file",        // POST送信先のURL
		data:data,  // JSONデータ本体
//		contentType: 'application/upload', // リクエストの Content-Type
		crossDomain: true,
		dataType: 'json',
		success: function(data, status, xhr) {
			if (SHOW_MEETIN_API_LOG) {
				if (data) {
					console.log('[MeetinAPI][saveFile][success]:data = ' + JSON.stringify(data));
				} else {
					console.log('[MeetinAPI][saveFile][success]');
				}
			}

			// 通信成功時の処理
			if (successCallback && typeof successCallback === "function") {
				successCallback(data, status, xhr);
			}
		},
		error: function(xhr, status, error) {
			if (SHOW_MEETIN_API_LOG) {
				if (error) {
					console.log('[MeetinAPI][saveFile][error]:error = ' + JSON.stringify(error));
				} else {
					console.log('[MeetinAPI][saveFile][error]');
				}
			}

			// 通信失敗時の処理
			if (errorCallback && typeof errorCallback === "function") {
				errorCallback(xhr, status, error);
			}
		},
		complete: function(xhr, status) {
			// 通信完了時の処理
			if (completeCallback && typeof completeCallback === "function") {
				completeCallback(xhr, status);
			}
		},
	});
}

function ErrorLog(connection_info_id ,room_name ,user_id ,type ,peer_id ,command ,message) {

	if ($('#Room_name').size()) {
		room_name = $('#Room_name').val();
	}
	if ($('#user_id').size()) {
		user_id = $('#user_id').val();
	}
	if ($('#peer_id').size()) {
		peer_id = $('#peer_id').val();
	}

	var data = {
		Connection_info_id : connection_info_id,			// connection_infoのID
		Room_name : (room_name !== null ? room_name:''),	// Room_name
		User_id : (user_id !== null ? user_id:'0'),			// 接続番号 (user_id)
		Type : (type !== null ? type : 0),					// 種類(0:, 1:, 2:, 3:, 4:)
		Peer_id : (peer_id != null ? peer_id:null),			// 送信元ピアID
		Command : (command != null ? command:null),			// コマンド
		Message : message,									// メッセージ 
	};

//console.log('★[MeetinAPI][ErrorLog][start]:data = ' + JSON.stringify(data));

	$.ajax({
		type:"GET",											// method = "POST"
		url:"https://" + location.host + "/api/error-log",	// POST送信先のURL
		data:data,											// JSONデータ本体
		contentType: 'application/json',					// リクエストの Content-Type
		crossDomain: true,
		dataType: 'json',

		success: function(data, status, xhr) {
		// 正常レスポンス
			console.log('[MeetinAPI][ErrorLog][success]');
		},
		error: function(xhr, status, error) {
			// エラーレスポンス
			if (error) {
				console.log('[MeetinAPI][ErrorLog][error]:error = ' + JSON.stringify(error));
			} else {
				console.log('[MeetinAPI][ErrorLog][error]');
			}
		},
		complete: function(xhr, status) {
			// 通信完了時の処理
		},
	});
}

// クライアントのログ出力データをサーバに要求しサーバのログファイルに出力する
function clientLog(level ,message) {

	var room_name = '';
	if ($('#Room_name').size()) {
		room_name = $('#Room_name').val();
	}
	var user_id = '';
	if ($('#user_id').size()) {
		user_id = $('#user_id').val();
	}
	var staff_id = '';
	if ($('#staff_id').size()) {
		staff_id = $('#staff_id').val();
	}
	var peer_id = '';
	if ($('#peer_id').size()) {
		peer_id = $('#peer_id').val();
	}

	var client_id = '';
	if ($('#client_id').size()) {
		client_id = $('#client_id').val();
	}

	var user_name = '';
	if ($('#user_name').size()) {
		user_name = $('#user_name').val();
	}

	message = '#client_id='+ client_id +',' + message;

	var data = {
		Level : (level !== null ? level:''),	// Loglevel(DEBUG,INFO,ERROR)
		Room_name : room_name,					// Room_name
		User_id : user_id,						// 接続番号 (user_id)
		Staff_id : staff_id,					// StaffID
		Peer_id : peer_id,						// 送信元ピアID
		User_name : user_name,				// ユーザー名（入力値） 
		Message : message							// メッセージ 
	};

	// if (SHOW_MEETIN_API_LOG) {
	// 	console.log('[MeetinAPI][clientLog][start]:data = ' + JSON.stringify(data));
	// 	console.log("[MeetinAPI][clientLog] URL=[https://"+ location.host + "/api/client-log" +"]");
	// }
	$.ajax({
		type:"GET",											// method = "GET"
		url:"https://" + location.host + "/api/client-log",	// POST送信先のURL
		data:data,											// JSONデータ本体
		contentType: 'application/json',					// リクエストの Content-Type
		crossDomain: true,
		dataType: 'json',

		success: function(data, status, xhr) {
			// 正常レスポンス
			// if (SHOW_MEETIN_API_LOG) {
			// 	console.log('[MeetinAPI][clientLog][success]');
			// }
		},
		error: function(xhr, status, error) {
			// エラーレスポンス
			if (error) {
				console.log('[MeetinAPI][clientLog][error]:error = ' + JSON.stringify(error));
			} else {
				console.log('[MeetinAPI][clientLog][error]');
			}
		},
		complete: function(xhr, status) {
			// 通信完了時の処理
		},
	});
}
