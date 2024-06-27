/**
 * SkyWay-Screenshare-Library - Screenshare Library for SkyWay
 * @version v1.1.0
 * @author NTT Communications(skyway@ntt.com)
 * @link https://github.com/nttcom/SkyWay-ScreenShare
 * @license MIT License
 */
/// <reference path="typings/tsd.d.ts" />
var SkyWay;
(function (SkyWay) {
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
	navigator.mediaDevices = navigator.mediaDevices || ((navigator.mozGetUserMedia || navigator.webkitGetUserMedia) ? {
		getUserMedia: function(c) {
			return new Promise(function(y, n) {
				(navigator.mozGetUserMedia || navigator.webkitGetUserMedia).call(navigator, c, y, n);
			});
		}
	} : null);

	var ScreenShare = (function () {
		function ScreenShare(options) {
			if (typeof options === "undefined") { options = null; }
			this._debug = false;
			if (options !== null && 'debug' in options)
				this._debug = options.debug;
		}
		ScreenShare.prototype.startScreenShare = function (param, success, error, onEndedEvent) {
			var _this = this;
			if (typeof onEndedEvent === "undefined") { onEndedEvent = null; }

			if (!!navigator.mozGetUserMedia) {
				// for FF
				var _paramFirefox = {
					video: {
						mozMediaSource: 'window',
						mediaSource: 'window'
					},
					audio: false
				};

				if (isFinite(param.Width))
					_paramFirefox.video.width = { min: param.Width, max: param.Width };
				if (isFinite(param.Height))
					_paramFirefox.video.height = { min: param.Height, max: param.Height };
				if (isFinite(param.FrameRate))
					_paramFirefox.video.frameRate = { min: param.FrameRate, max: param.FrameRate };

				_this.logger("Parameter of getUserMedia : " + JSON.stringify(_paramFirefox));
console.log("navigator.getUserMedia _paramFirefox");
console.log("Parameter of getUserMedia : " + JSON.stringify(_paramFirefox));

/**** */
				navigator.mediaDevices.getUserMedia(_paramFirefox)
				.then(function(stream) {
					success(stream);
				})
				.catch(function(err) {
					_this.logger("Error message of getUserMedia : " + JSON.stringify(err));
					error(err);
				});
/*** */
			}
			else if (!!navigator.webkitGetUserMedia) {
				if ('getDisplayMedia' in window.navigator) {
					// 拡張不要
console.log('navigator.mediaDevices.getDisplayMedia');
//					navigator.getDisplayMedia({audio: false, video: true})
					navigator.getDisplayMedia({video: true})
//					navigator.getDisplayMedia({video: {frameRate: {ideal: 10, max: 10}} })
					.then(stream => {
						// do something with the stream
//console.log(stream);
						// 共有停止イベントファンクション登録
						var streamTrack = stream.getVideoTracks();
						streamTrack[0].onended = function (event) {
							_this.logger("Stream ended event fired : " + JSON.stringify(event));
							if (typeof (onEndedEvent) !== "undefined" && onEndedEvent !== null)
								onEndedEvent();
						};
						streamTrack[0].applyConstraints({frameRate: 10});
						// stream.getTracks()[0].applyConstraints({frameRate: 5});
						success(stream);
					})
					.catch(e => {
						_this.logger("Error message of getUserMedia : " + JSON.stringify(err));
						error(err);
					});
				}
				else {
					// 拡張必要
console.log('for Chrome');
					// for Chrome
					var _paramChrome = {
						mandatory: {
							chromeMediaSource: 'desktop',
							chromeMediaSourceId: ''
						},
						optional: [{
								googTemporalLayeredScreencast: true
							}]
					};

					if (isFinite(param.Width)) {
						_paramChrome.mandatory.maxWidth = param.Width;
						_paramChrome.mandatory.minWidth = param.Width;
					};
					if (isFinite(param.Height)) {
						_paramChrome.mandatory.maxHeight = param.Height;
						_paramChrome.mandatory.minHeight = param.Height;
					};
					if (isFinite(param.FrameRate)) {
						_paramChrome.mandatory.maxFrameRate = param.FrameRate;
						_paramChrome.mandatory.minFrameRate = param.FrameRate;
					};

					// 複数回イベント発火し意図せず確認用モーダルが表示されてしまう為、messageEvent終了時に紐づけを解除
					function removeEvent () {
						window.removeEventListener('message', messageEvent);
					}

					window.addEventListener('message', messageEvent); 

					function messageEvent (event) {
						_this.logger("Received " + '"' + event.data.type + '"' + " message from Extension.");
						if (event.data.type != 'gotScreenShareStreamId') {
							return;
						}
						_paramChrome.mandatory.chromeMediaSourceId = event.data.streamid;
						_paramChrome.mandatory.maxWidth = event.data.maxWidth;
						_paramChrome.mandatory.maxHeight = event.data.maxHeight;
						_paramChrome.mandatory.maxFrameRate = event.data.maxFrameRate;
						_paramChrome.mandatory.minWidth = event.data.minWidth;
						_paramChrome.mandatory.minHeight = event.data.minHeight;
						_paramChrome.mandatory.minFrameRate = event.data.minFrameRate;
						_this.logger("Parameter of getUserMedia : " + JSON.stringify(_paramChrome));
console.log("navigator.getUserMedia _paramChrome");
console.log("Parameter of getUserMedia : " + JSON.stringify(_paramChrome));

/**** */
						navigator.mediaDevices.getUserMedia({audio: false,video: _paramChrome})
							.then(function(stream) {
								_this.logger("Got a stream for screen share");
								var streamTrack = stream.getVideoTracks();
								streamTrack[0].onended = function (event) {
									_this.logger("Stream ended event fired : " + JSON.stringify(event));
									if (typeof (onEndedEvent) !== "undefined" && onEndedEvent !== null)
										onEndedEvent();
								};
								success(stream);
							})
							.catch(function(err) {
								_this.logger("Error message of getUserMedia : " + JSON.stringify(err));
								error(err);
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
							});
						removeEvent();
					};
/*** */
					window.postMessage({ type: "getScreenShareStreamId" }, "*");
				}

			}
			else if (window.AdapterJS && AdapterJS.WebRTCPlugin && AdapterJS.WebRTCPlugin.isPluginInstalled) {
				// would be fine since no methods
				var _paramIE = {
					video: {
						optional: [{
								sourceId: AdapterJS.WebRTCPlugin.plugin.screensharingKey || 'Screensharing'
							}]
					},
					audio: false
				};

				// wait for plugin to be ready
				AdapterJS.WebRTCPlugin.callWhenPluginReady(function () {
					// check if screensharing feature is available
					if (!!AdapterJS.WebRTCPlugin.plugin.HasScreensharingFeature && !!AdapterJS.WebRTCPlugin.plugin.isScreensharingAvailable) {
console.log("navigator.getUserMedia _paramIE");
console.log("Parameter of getUserMedia : " + JSON.stringify(_paramIE));

/**** */
						navigator.mediaDevices.getUserMedia(_paramIE)
						.then(function(stream) {
							_this.logger("Got a stream for screen share");
							var streamTrack = stream.getVideoTracks();
							streamTrack[0].onended = function (event) {
								_this.logger("Stream ended event fired : " + JSON.stringify(event));
								if (typeof (onEndedEvent) !== "undefined")
									onEndedEvent();
							};
							success(stream);
						})
						.catch(function(err) {
							_this.logger("Error message of getUserMedia : " + JSON.stringify(err));
							error(err);
						});
/*** */
					} else {
						throw new Error('Your WebRTC plugin does not support screensharing');
					}
				});
			}
		};

		ScreenShare.prototype.stopScreenShare = function () {
			// todo : It plans to implement
			window.postMessage({ type: "stopScreenShareStream" }, "*");
			return false;
		};

		ScreenShare.prototype.cancelChooseDesktopMedia = function () {
			// todo : It plans to implement
			window.postMessage({ type: "cancelChooseDesktopMedia" }, "*");
			return false;
		};

		ScreenShare.prototype.isEnabledExtension = function () {
			if (typeof (window.ScreenShareExtentionExists) === 'boolean' || (window.AdapterJS && AdapterJS.WebRTCPlugin && AdapterJS.WebRTCPlugin.isPluginInstalled)) {
				this.logger('ScreenShare Extension available');
				return true;
			} else {
				this.logger('ScreenShare Extension not available');
				return false;
			}
		};

		ScreenShare.prototype.logger = function (message) {
			if (this._debug) {
				console.log("SkyWay-ScreenShare: " + message);
			}
		};
		return ScreenShare;
	})();
	SkyWay.ScreenShare = ScreenShare;
})(SkyWay || (SkyWay = {}));
