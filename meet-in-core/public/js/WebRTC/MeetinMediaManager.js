/**
 * メディア管理クラス
 */
var MeetinMediaManager;
(function (MeetinMediaManager) {
	// ログ表示
	const SHOW_LOG = false;

	// メディア管理のコンストラクタ
	var MeetinMedia = (function () {

		// 自分のカメラのメディアストリーム
		var mMyVideoStream = null;

		// 自分のマイクのメディアストリーム
		var mMyAudioStream = null;

		// 自分の画面共有のメディアストリーム
		var mMyScreenStream = null;

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

		/**
		 * 新規映像メディアストリーム作成
		 * 映像メディアストリームを新規に作成する
		 * @param {*} constraints
		 * @param {*} successCallback
		 * @param {*} errorCallback
		 * @param {*} completeCallback
		 */
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

			// メディアストリームの作成(new新規作成)
			createMediaStream(
				constraints,
				successCallbackWork,
				errorCallbackWork
			);
		};
		/**
		 * 新規映像メディアストリーム作成(prototype定義)
		 * @param {*} constraints
		 * @param {*} successCallback
		 * @param {*} errorCallback
		 * @param {*} completeCallback
		 */
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

		/**
		 * 映像メディアストリーム作成
		 * 映像メディアストリームを新規に作成する。
		 * ただし、作成済みの映像メディアストリームが存在しない場合のみ新規に作成する
		 * @param {*} constraints
		 * @param {*} successCallback
		 * @param {*} errorCallback
		 * @param {*} completeCallback
		 */
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
			}
			else {
				// 未作成の場合
				createVideoStream(
					constraints,
					successCallback,
					errorCallback,
					completeCallback
				)
			}
		};

		/**
		 * 映像メディアストリーム作成(prototype定義)
		 * @param {*} constraints
		 * @param {*} successCallback
		 * @param {*} errorCallback
		 * @param {*} completeCallback
		 */
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
			constraints.audio = {
				echoCancellation: true,
				deviceId: NEGOTIATION.use_mic_id
			};

			// Safariを除外
			if (USER_PARAM_BROWSER === "IE11" || USER_PARAM_BROWSER === "IE") {
			}
			else {
				constraints.audio = {
					channelCount: {ideal: 2, min: 1},
					// サンプルレート
					sampleRate: {ideal: 48000},
//					echoCancellationType: "system",
					// エコーキャンセル:ON/OFF
					echoCancellation: true,
					// googEchoCancellation: true,
					// googExperimentalEchoCancellation: true,
					// マイク入力音量調整:自動利得制御(AGC):ON/OFF
					autoGainControl: true,
					// googAutoGainControl: true,
					// googExperimentalAutoGainControl: true,
					// バックグラウンドノイズ除去:ON/OFF
					noiseSuppression: true,
					// googNoiseSuppression: true,
					// googExperimentalNoiseSuppression: true,
					// その他
					// googHighpassFilter: true,
					// googTypingNoiseDetection: true,
					googAudioMirroring: false,
					// マイクID
					deviceId: NEGOTIATION.use_mic_id
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

			// メディアストリームの作成(new新規作成)
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

			let constraints = {
				audio: false,
				video: {
					width: {ideal: defaultWidth, max: defaultWidth},
					height: {ideal: defaultHeight, max: defaultHeight},
					frameRate: {ideal: defaultFrameRate, max: defaultFrameRate}
				}
			}

			navigator.mediaDevices.getDisplayMedia(constraints)
			.then(function(stream) {
				var streamTrack = stream.getVideoTracks();
				streamTrack[0].onended = function (event) {
					if (stopCallback && typeof stopCallback === "function") {
						if (SHOW_LOG) {
							console.log('[MeetinMedia][createScreenStream][stop]');
						}

						stopCallback();
					}
				};

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
			})
			.catch(function(err) {
				if (SHOW_LOG) {
					if (err) {
						console.log('[MeetinMedia][createScreenStream][error]:error = ' + JSON.stringify(err));
					} else {
						console.log('[MeetinMedia][createScreenStream][error]');
					}
				}

				if (errorCallback && typeof errorCallback === "function") {
					errorCallback(err);
				}

				let showModal = false;
				let alertMess = "";
				// Macでchromeの画面収録を許可していない際のエラー文が含まれていればフラグを立てる
				// 現状、「共有」と「キャンセル」ボタンを押下した際エラー文が同じな為、「キャンセル」押下時に
				// 確認モーダルが表示されてしまいますが、画面共有APIを変更する別課題にて修正予定。
				if (platform.os.family.toLowerCase().indexOf('os x') != -1) {
					let eMessage = err.toString();
					// 共有ボタンを押下した時のみ表示させる
					if (eMessage.indexOf('Permission denied by system') != -1) {
						alertMess = `システム環境設定で画面収録が<br>有効になっていない可能性があります。<br>有効にする方法は<a href="https://manual.meet-in.jp/?p=575" target="_blank" rel="noopener noreferrer" style="text-decoration:underline;">こちら</a>`;
						showModal = true;
					}
				}
				if(showModal) {
					makeDefaultAlertDialog("", alertMess, {z_index:100000020});
					$('#mi_alert_dialog_background').css({
						background: "rgba(0,0,0,0.6)"
					})
					$('#mi_alert_dialog_area').css({
						width: "484px",
						height: "218px",
						padding: "0"
					})
					$('#mi_alert_dialog_content').css({
						margin: "30px auto",
						textAlign: "center",
						fontSize: "18px"
					})
				}

				if (completeCallback && typeof completeCallback === "function") {
					completeCallback(null, err);
				}
			});

			if (noExtensionErrorCallback && typeof noExtensionErrorCallback === "function") {
				noExtensionErrorCallback();
			}
		};

		// メディアストリーム（画面共有）の作成
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
			if (mMyScreenStream) {
				mMyScreenStream.getTracks().forEach(function(track) {
					track.stop();
				});
				mMyScreenStream = null;
			}
			return false;
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
			return false;
		};

		return MeetinMedia;
	})();
	MeetinMediaManager.MeetinMedia = MeetinMedia;

})(MeetinMediaManager || (MeetinMediaManager = {}));
