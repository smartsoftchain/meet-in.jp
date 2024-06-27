/**
 */
var MeetinExt;
(function (MeetinExt) {
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    var ScreenCapture = (function () {
        function ScreenCapture(options) {
            if (typeof options === "undefined") { options = null; }
            this._debug = false;
            if (options !== null && 'debug' in options)
                this._debug = options.debug;
        }
        ScreenCapture.prototype.startScreenCapture = function (param, success, error, onEndedEvent) {
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

                this.logger("Parameter of getUserMedia : " + JSON.stringify(_paramFirefox));

                navigator.mozGetUserMedia(_paramFirefox, function (stream) {
                    success(stream);
                }, function (err) {
                    _this.logger("Error message of getUserMedia : " + JSON.stringify(err));
                    error(err);
                });
            } else if (!!navigator.webkitGetUserMedia) {
                // for Chrome
                var _paramsCb = {
                  delayTimer: 5
                };
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
                }
                ;
                if (isFinite(param.Height)) {
                    _paramChrome.mandatory.maxHeight = param.Height;
                    _paramChrome.mandatory.minHeight = param.Height;
                }
                ;
                if (isFinite(param.FrameRate)) {
                    _paramChrome.mandatory.maxFrameRate = param.FrameRate;
                    _paramChrome.mandatory.minFrameRate = param.FrameRate;
                }
                ;

                window.addEventListener('message', function (event) {
                    _this.logger("Received " + '"' + event.data.type + '"' + " message from Extension.");
                    if (event.data.type != 'gotScreenCaptureStreamId') {
                        return;
                    }
                    _this.logger("gotStreamId Params : " + JSON.stringify(event.data))
                    _paramChrome.mandatory.chromeMediaSourceId = event.data.streamid;
                    _paramsCb.delayTimer = event.data.captureDelayTimer;
                    _this.logger("Parameter of getUserMedia : " + JSON.stringify(_paramChrome));
                    
                    navigator.getUserMedia({
                        audio: false,
                        video: _paramChrome
                    }, function (stream) {
                        _this.logger("Got a stream for screen share");
                        var streamTrack = stream.getVideoTracks();
                        streamTrack[0].onended = function (event) {
                            _this.logger("Stream ended event fired : " + JSON.stringify(event));
                            if (typeof (onEndedEvent) !== "undefined" && onEndedEvent !== null)
                                onEndedEvent();
                        };
                        success(stream, _paramsCb);
                    }, function (err) {
                        _this.logger("Error message of getUserMedia : " + JSON.stringify(err));
                        error(err);
                    });
                });

                window.postMessage({ type: "getScreenCaptureStreamId" }, "*");
            } else if (window.AdapterJS && AdapterJS.WebRTCPlugin && AdapterJS.WebRTCPlugin.isPluginInstalled) {
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
                        navigator.getUserMedia(_paramIE, function (stream) {
                            _this.logger("Got a stream for screen share");
                            var streamTrack = stream.getVideoTracks();
                            streamTrack[0].onended = function (event) {
                                _this.logger("Stream ended event fired : " + JSON.stringify(event));
                                if (typeof (onEndedEvent) !== "undefined")
                                    onEndedEvent();
                            };
                            success(stream);
                        }, function (err) {
                            _this.logger("Error message of getUserMedia : " + JSON.stringify(err));
                            error(err);
                        });
                    } else {
                        throw new Error('Your WebRTC plugin does not support screensharing');
                    }
                });
            }
        };

        ScreenCapture.prototype.stopScreenCapture = function () {
            // todo : It plans to implement
            window.postMessage({ type: "stopScreenCaptureStream" }, "*");
            return false;
        };

        ScreenCapture.prototype.isEnabledExtension = function () {
            if (typeof (window.ScreenCaptureExtentionExists) === 'boolean' || (window.AdapterJS && AdapterJS.WebRTCPlugin && AdapterJS.WebRTCPlugin.isPluginInstalled)) {
                this.logger('ScreenCapture Extension available');
                return true;
            } else {
                this.logger('ScreenCapture Extension not available');
                return false;
            }
        };

        ScreenCapture.prototype.logger = function (message) {
            if (this._debug) {
                console.log("MeetinExt-ScreenCapture: " + message);
            }
        };
        return ScreenCapture;
    })();
    MeetinExt.ScreenCapture = ScreenCapture;
})(MeetinExt || (MeetinExt = {}));