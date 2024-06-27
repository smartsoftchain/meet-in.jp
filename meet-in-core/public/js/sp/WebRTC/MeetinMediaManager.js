// メディア管理クラス
var MeetinMediaManager;
(function (MeetinMediaManager) {
	// ログ表示
	const SHOW_LOG = false;

	// メディア管理のコンストラクタ
	var MeetinMedia = (function () {

		// 画面共有オブジェクト
		var mScreen = new SkyWay.ScreenShare({debug: false});
	
		// 自分のカメラのメディアストリーム
		var mMyVideoStream = null;
		
		// 自分のマイクのメディアストリーム
		var mMyAudioStream = null;
		
		// 自分の画面共有のメディアストリーム
		var mMyScreenStream = null;

		// connection_info_id：connection_infoテーブルの[id]
		// userId：チャットルーム内のユーザーID。
		//         オペレータ = 0
		//         ゲスト = 1～8
		function MeetinMedia(
		) {
		}

		//////////////////////////////////////////////////////////
		// ・初期化
		// ・破棄
		//////////////////////////////////////////////////////////
		
		// メディア管理の初期化
		var init = function(
				successCallback
			) {
			if (SHOW_LOG) {
				console.log('[MeetinMedia][init][start]');
			}
			
			if (successCallback && typeof successCallback === "function") {
				successCallback();
			}
		};

		// メディア管理の初期化
		MeetinMedia.prototype.init = function(
				successCallback
			) {
			init(
				successCallback
			);
		};

		// メディア管理の破棄
		// isCloseConnectionInfo：データベースに保存した接続情報を更新するか？
		var destroy = function(
			) {
			if (SHOW_LOG) {
				console.log('[MeetinMedia][destroy][start]');
			}
			
			destroyVideoStream();
			destroyAudioStream();
			destroyScreenStream();
		};

		// メディア管理の破棄
		// isCloseConnectionInfo：データベースに保存した接続情報を更新するか？
		MeetinMedia.prototype.destroy = function(
			) {
			destroy();
		};

		//////////////////////////////////////////////////////////
		// メディアストリーム（映像）
		//////////////////////////////////////////////////////////

		// メディアストリーム（映像）の作成
		var createVideoStream = function(
				constraints,
				successCallback,
				errorCallback,
				completeCallback
			) {
			if (SHOW_LOG) {
				console.log('[MeetinMedia][createVideoStream][start]:constraints = ' + JSON.stringify(constraints));
			}

			var successCallbackWork = function(stream) {
				mMyVideoStream = stream;
				if (successCallback && typeof successCallback === "function") {
					successCallback(stream);
				}
				if (completeCallback && typeof completeCallback === "function") {
					completeCallback(stream, null);
				}
			};
			
			var errorCallbackWork = function(error) {
				if (errorCallback && typeof errorCallback === "function") {
					errorCallback(error);
				}
				if (completeCallback && typeof completeCallback === "function") {
					completeCallback(null, error);
				}
			};

			// メディアストリームの作成
			createMediaStream(
				constraints,
				successCallbackWork,
				errorCallbackWork
			);
		};

		// メディアストリーム（映像）の作成
		MeetinMedia.prototype.createVideoStream = function(
				constraints,
				successCallback,
				errorCallback,
				completeCallback
			) {
			createVideoStream(
				constraints,
				successCallback,
				errorCallback,
				completeCallback
			);
		};

		// メディアストリーム（映像）の作成（未作成時のみ）
		var createVideoStreamIfNotExist = function(
				constraints,
				successCallback,
				errorCallback,
				completeCallback
			) {
			if (SHOW_LOG) {
				console.log('[MeetinMedia][createVideoStreamIfNotExist][start]:constraints = ' + JSON.stringify(constraints));
			}

			// すでに作成された場合
			if (mMyVideoStream) {
				if (completeCallback && typeof completeCallback === "function") {
					completeCallback(mMyVideoStream, null);
				}
			} else 
			// 未作成の場合
			{
				createVideoStream(
					constraints,
					successCallback,
					errorCallback,
					completeCallback
				)
			}
		};

		// メディアストリーム（映像）の作成（未作成時のみ）
		MeetinMedia.prototype.createVideoStreamIfNotExist = function(
				constraints,
				successCallback,
				errorCallback,
				completeCallback
			) {
			createVideoStreamIfNotExist(
				constraints,
				successCallback,
				errorCallback,
				completeCallback
			);
		};

		// メディアストリーム（映像）の破棄
		var destroyVideoStream = function(
			) {
			if (SHOW_LOG) {
				console.log('[MeetinMedia][destroyVideoStream][start]');
			}

			if (mMyVideoStream) {
//				mMyVideoStream.stop();
				mMyVideoStream.getTracks().forEach(function(track) {
					track.stop();
				});
				mMyVideoStream = null;
			}
		};

		// メディアストリーム（映像）の破棄
		MeetinMedia.prototype.destroyVideoStream = function(
			) {
			destroyVideoStream();
		};
		
		// メディアストリーム（映像）を返す
		MeetinMedia.prototype.getVideoStream = function(
			) {
			return mMyVideoStream;
		};

		//////////////////////////////////////////////////////////
		// メディアストリーム（マイク）
		//////////////////////////////////////////////////////////

		// メディアストリーム（マイク）の作成
		var createAudioStream = function(
				successCallback,
				errorCallback,
				completeCallback
			) {
			var constraints = {};
			if (USER_PARAM_BROWSER === "IE11" || USER_PARAM_BROWSER === "IE" || USER_PARAM_BROWSER === "Safari") {
				constraints.audio = {
					echoCancellation: false
				};
			} else {
				constraints.audio = {
					echoCancellation: true,
					googEchoCancellation: true,
					googAutoGainControl: true,
					googNoiseSuppression: true,
					googHighpassFilter: false
				};
			}

			if (SHOW_LOG) {
				console.log('[MeetinMedia][createAudioStream][start]:constraints = ' + JSON.stringify(constraints));
			}
			
			var successCallbackWork = function(stream) {
				mMyAudioStream = stream;
				if (successCallback && typeof successCallback === "function") {
					successCallback(stream);
				}
				if (completeCallback && typeof completeCallback === "function") {
					completeCallback(stream, null);
				}
			}

			var errorCallbackWork = function(error) {
				if (errorCallback && typeof errorCallback === "function") {
					errorCallback(error);
				}
				if (completeCallback && typeof completeCallback === "function") {
					completeCallback(null, error);
				}
			};

			// メディアストリームの作成
			createMediaStream(
				constraints,
				successCallbackWork,
				errorCallbackWork
			);
		};

		// メディアストリーム（マイク）の作成
		MeetinMedia.prototype.createAudioStream = function(
				successCallback,
				errorCallback,
				completeCallback
			) {
			createAudioStream(
				successCallback,
				errorCallback,
				completeCallback
			)
		};

		// メディアストリーム（マイク）の作成（未作成時のみ）
		var createAudioStreamIfNotExist = function(
				successCallback,
				errorCallback,
				completeCallback
			) {
			if (SHOW_LOG) {
				console.log('[MeetinMedia][createAudioStreamIfNotExist][start]');
			}
			
			// すでに作成された場合
			if (mMyAudioStream) {
				if (completeCallback && typeof completeCallback === "function") {
					completeCallback(mMyAudioStream, null);
				}
			} else 
			// 未作成の場合
			{
				createAudioStream(
					successCallback,
					errorCallback,
					completeCallback
				)
			}
		};

		// メディアストリーム（マイク）の作成（未作成時のみ）
		MeetinMedia.prototype.createAudioStreamIfNotExist = function(
				successCallback,
				errorCallback,
				completeCallback
			) {
			createAudioStreamIfNotExist(
				successCallback,
				errorCallback,
				completeCallback
			);
		};

		// メディアストリーム（マイク）の破棄
		var destroyAudioStream = function(
			) {
			if (SHOW_LOG) {
				console.log('[MeetinMedia][destroyAudioStream][start]');
			}
			
			if (mMyAudioStream) {
//				mMyAudioStream.stop();
				mMyAudioStream.getTracks().forEach(function(track) {
					track.stop();
				});
				mMyAudioStream = null;
			}
		};

		// メディアストリーム（マイク）の破棄
		MeetinMedia.prototype.destroyAudioStream = function(
			) {
			destroyAudioStream();
		};

		// メディアストリーム（マイク）を返す
		MeetinMedia.prototype.getAudioStream = function(
			) {
			return mMyAudioStream;
		};

		//////////////////////////////////////////////////////////
		// メディアストリーム（画面共有）
		//////////////////////////////////////////////////////////

		// メディアストリーム（画面共有）の作成
		// defaultWidth、defaultHeight、defaultFrameRateについて：
		//   拡張機能に設定された幅、高さ、フレームレートが優先的に
		//   適用される。設定されていない場合のみdefaultWidth、
		//   defaultHeight、defaultFrameRateが使われる
		var createScreenStream = function(
				defaultWidth, 
				defaultHeight, 
				defaultFrameRate,
				successCallback,
				errorCallback,
				stopCallback,
				noExtensionErrorCallback,
				completeCallback
			) {
			if (mScreen.isEnabledExtension()) {
				// ビデオレイアウトのリセット
/**
 * 画面共有時に不用意(勝手に)にレイアウトのリセットが実施されるため、以下の処理は実施しない(コメント)
 * ※ビデオレイアウトのリセットはビデオレイアウト処理(negotiation_video.js)内で行わないと制御ができないくなるため
 * 2018/04/20 太田
 */
//				$.each(NEGOTIATION.videoArray.show,function(){
//					// ビデオタグのstyleを削除する（移動やリサイズすると付与される）
//					this.removeAttr('style');
//					// ビデオタグを表示するためにstyleを付与する
//					this.css("display", "block");
//				});
				if (SHOW_LOG) {
					console.log('[MeetinMedia][createScreenStream][startScreenShare]:Width = '+ defaultWidth + ', Height = ' + defaultHeight + ', Frame rate = ' + defaultFrameRate);
				}

				mScreen.startScreenShare({
					Width: defaultWidth,
					Height: defaultHeight,
					FrameRate: defaultFrameRate
				},function (stream){
					if (SHOW_LOG) {
						if (stream) {
							console.log('[MeetinMedia][createScreenStream][success]:stream = ' + stream.id);
						} else {
							console.log('[MeetinMedia][createScreenStream][success]:stream = null');
						}
					}

					
					mMyScreenStream = stream;
					if (successCallback && typeof successCallback === "function") {
						successCallback(stream);
					}
					if (completeCallback && typeof completeCallback === "function") {
						completeCallback(stream, null);
					}
					
					// 画面共有時は資料を表示しない
					saveDocument();
					hideDocument();
				},function(error){
					if (SHOW_LOG) {
						if (error) {
							console.log('[MeetinMedia][createScreenStream][error]:error = ' + JSON.stringify(error));
						} else {
							console.log('[MeetinMedia][createScreenStream][error]');
						}
					}


					if (errorCallback && typeof errorCallback === "function") {
						errorCallback(error);
					}
					if (completeCallback && typeof completeCallback === "function") {
						completeCallback(null, error);
					}
				},function(){
					if (SHOW_LOG) {
						console.log('[MeetinMedia][createScreenStream][stop]');
					}


					if (stopCallback && typeof stopCallback === "function") {
						stopCallback();
					}
				});
			} else {
				if (SHOW_LOG) {
					console.log('[MeetinMedia][createScreenStream]:No extension');
				}

				
				if (noExtensionErrorCallback && typeof noExtensionErrorCallback === "function") {
					noExtensionErrorCallback();
				}
			}
		};

		// メディアストリーム（画面共有）の作成
		// defaultWidth、defaultHeight、defaultFrameRateについて：
		//   拡張機能に設定された幅、高さ、フレームレートが優先的に
		//   適用される。設定されていない場合のみdefaultWidth、
		//   defaultHeight、defaultFrameRateが使われる
		MeetinMedia.prototype.createScreenStream = function(
				defaultWidth, 
				defaultHeight, 
				defaultFrameRate,
				successCallback,
				errorCallback,
				stopCallback,
				noExtensionErrorCallback,
				completeCallback
			) {
			createScreenStream(
				defaultWidth, 
				defaultHeight, 
				defaultFrameRate,
				successCallback,
				errorCallback,
				stopCallback,
				noExtensionErrorCallback,
				completeCallback
			);
		};

		// メディアストリーム（画面共有）の作成（未作成時のみ）
		// defaultWidth、defaultHeight、defaultFrameRateについて：
		//   拡張機能に設定された幅、高さ、フレームレートが優先的に
		//   適用される。設定されていない場合のみdefaultWidth、
		//   defaultHeight、defaultFrameRateが使われる
		var createScreenStreamIfNotExist = function(
				defaultWidth, 
				defaultHeight, 
				defaultFrameRate,
				successCallback,
				errorCallback,
				stopCallback,
				noExtensionErrorCallback,
				completeCallback
			) {
			if (SHOW_LOG) {
				console.log('[MeetinMedia][createScreenStreamIfNotExist][start]');
			}
			
			// すでに作成された場合
			if (mMyScreenStream) {
				if (completeCallback && typeof completeCallback === "function") {
					completeCallback(mMyScreenStream, null);
				}
			} else 
			// 未作成の場合
			{
				createScreenStream(
					defaultWidth, 
					defaultHeight, 
					defaultFrameRate,
					successCallback,
					errorCallback,
					stopCallback,
					noExtensionErrorCallback,
					completeCallback
				)
			}
		};

		// メディアストリーム（画面共有）の作成（未作成時のみ）
		// defaultWidth、defaultHeight、defaultFrameRateについて：
		//   拡張機能に設定された幅、高さ、フレームレートが優先的に
		//   適用される。設定されていない場合のみdefaultWidth、
		//   defaultHeight、defaultFrameRateが使われる
		MeetinMedia.prototype.createScreenStreamIfNotExist = function(
				defaultWidth, 
				defaultHeight, 
				defaultFrameRate,
				successCallback,
				errorCallback,
				stopCallback,
				noExtensionErrorCallback,
				completeCallback
			) {
			createScreenStreamIfNotExist(
				defaultWidth, 
				defaultHeight, 
				defaultFrameRate,
				successCallback,
				errorCallback,
				stopCallback,
				noExtensionErrorCallback,
				completeCallback
			);
		};

		// メディアストリーム（画面共有）の破棄
		var destroyScreenStream = function(
			) {
			mScreen.stopScreenShare();
			
			if (mMyScreenStream) {
//				mMyScreenStream.stop();
				mMyScreenStream.getTracks().forEach(function(track) {
					track.stop();
				});
				mMyScreenStream = null;
			}
		};

		// メディアストリーム（画面共有）の破棄
		MeetinMedia.prototype.destroyScreenStream = function(
			) {
			destroyScreenStream();
		};

		// メディアストリーム（画面共有）を返す
		MeetinMedia.prototype.getScreenStream = function(
			) {
			return mMyScreenStream;
		};
		
		MeetinMedia.prototype.cancelChooseDesktopMedia = function(
			) {
			return mScreen.cancelChooseDesktopMedia();
		};

		return MeetinMedia;
	})();
	MeetinMediaManager.MeetinMedia = MeetinMedia;

})(MeetinMediaManager || (MeetinMediaManager = {}));
