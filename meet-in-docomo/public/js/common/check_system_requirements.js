// 推奨値確認.
const RECOMMENDED_CHECK = {

	//---------------.
	// 推奨環境.
	//---------------.

	// OS.
	RECOMMENDED_WINDOWS_VERSION          : "10",    // ドット区切りの値を想定していない=1.9より1.12のほうが新しいと判断出来ない.
	RECOMMENDED_MAC_VERSION              : "10.10", // ドットの無い値の設定を想定していない = 10などを設定すると ドット以下の比較でエラー.
	RECOMMENDED_IOS_VERSION              : "12",    // ドット区切りの値を想定していない=1.9より1.12のほうが新しいと判断出来ない.
	RECOMMENDED_ANDOROID_VERSION         : "8.0",   // ドットの無い値の設定を想定していない = 8などを設定すると ドット以下の比較でエラー.

	// ブラウザ.
	RECOMMENDED_CHROME_VERSION           : "88.0",  // ドットの無い値の設定を想定していない = 88などを設定すると ドット以下の比較でエラー.
	RECOMMENDED_SAFARI_VERSION           : "12.0",  // ドットの無い値の設定を想定していない = 12などを設定すると ドット以下の比較でエラー.

	// 通信速度.
	NETWORK_SPEED_MBPS_THRESHOLD         : 15,	// 推奨通信速度.
	NETWORK_SPEED_MBPS_THRESHOLD_LOW     : 10, // 低い式地を設定する=一部タブレットで 同じWifiに接続しているPCと比べても規格のせいか速度が出ない端末があった.
	NETWORK_SPEED_MBPS_THRESHOLD_ON_ROOM : 5,  // ルーム内で速度測定をした場合、平行してストリーミング通信を行っていることから、テストの結果が悪くて当然なことから閾値を下げる.

	// パソコンのメモリー.
	DEVICE_MEMORY_THRESHOLD           : 4,


	//-----------------------------------------------------------------------------------------------------------


	// ネットワーク速度の結果のMbps値でアラートを出す.
	alertMeasureNetworkSpeedMbps : function(alert) {
		this._getUserMbps(function(mbps) {
			let device = "undefined";
			if(RECOMMENDED_CHECK.isWindows()) {
				device = "windows";
			} else if(RECOMMENDED_CHECK.isMac()) {
				device = "mac";
			} else if(RECOMMENDED_CHECK.isIPhone()){
				device = "iphone";
			} else if(RECOMMENDED_CHECK.isIPad()){
				device = "ipad";
			} else if(RECOMMENDED_CHECK.isAndroid()) {
				device = "android";
			} else if(RECOMMENDED_CHECK.isAndroidTablet()) {
				device = "android_tablet";
			}

			if (alert && typeof alert === 'function') {
				alert(device, mbps);
			}
		});
		// この処理は内部で 測定が終了するまで待つ非同期になる = 返り値を待つ設計にしていない.
	},



	// Windowsのバージョンが低いか 64bitOSではない場合.
	alertWindowsOSLowVersion: function(alert) {
		let version_windows_1 = Number(this.RECOMMENDED_WINDOWS_VERSION) <= Number(this._getDeviceOSVersion());
		let is64Bit           = 64 <= Number(this._getDeviceOSBit());

		if(this.isWindows() && (!version_windows_1 || !is64Bit)) {
			this._callAlert(alert);
			return true;
		}
		return false;
	},

	// Macのバージョンが推奨値より低い場合.
	alertMacOSLowVersion: function(alert) {
		let version_mac_1 = Number(this.RECOMMENDED_MAC_VERSION.split(".").slice(0,1)[0]) <= Number(this._getDeviceOSVersion().split(".").slice(0,1)[0]);
		let version_mac_1_equal = Number(this.RECOMMENDED_MAC_VERSION.split(".").slice(0,1)[0]) == Number(this._getDeviceOSVersion().split(".").slice(0,1)[0]);
		let version_mac_2 = true;
		if(this._getDeviceOSVersion().split(".").slice(1,2)[0] !== undefined) {
			version_mac_2 = Number(this.RECOMMENDED_MAC_VERSION.split(".").slice(1,2)[0]) <= Number(this._getDeviceOSVersion().split(".").slice(1,2)[0]);
		}

		if(this.isMac() && (!version_mac_1 || (version_mac_1_equal && !version_mac_2))) {
			this._callAlert(alert);
			return true;
		}
		return false;
	},

	// iPadのバージョンが推奨値より低い場合.
	alertiPadLowVersion: function(alert) {
		// MEMO. Appleの iPadをMacに見せかける捏造が酷い 実装当初iPadOSは 14.4を搭載していたのだが、
		// UAで確認するOSのバージョンは、MacのOSに誤判断させる為に "10.15.6" になっていたので MAC推奨値で判断する（Appleはいつかこういう捏造のせいでversion値が尽きたりダブって痛い目を見れば良い).
		let version_mac_1 = Number(this.RECOMMENDED_MAC_VERSION.split(".").slice(0,1)[0]) <= Number(this._getDeviceOSVersion().split(".").slice(0,1)[0]);
		let version_mac_1_equal = Number(this.RECOMMENDED_MAC_VERSION.split(".").slice(0,1)[0]) == Number(this._getDeviceOSVersion().split(".").slice(0,1)[0]);
		let version_mac_2 = true;
		if(this._getDeviceOSVersion().split(".").slice(1,2)[0] !== undefined) {
			version_mac_2 = Number(this.RECOMMENDED_MAC_VERSION.split(".").slice(1,2)[0]) <= Number(this._getDeviceOSVersion().split(".").slice(1,2)[0]);
		}

		if(this.isIPad() && (!version_mac_1 || (version_mac_1_equal && !version_mac_2))) {
			this._callAlert(alert);
			return true;
		}
		return false;
	},

	// iPhoneのバージョンが推奨値より低い場合.
	alertiPhoneLowVersion: function(alert) {
		let version_ios = Number(this.RECOMMENDED_IOS_VERSION.split(".").slice(0,1)[0]) <= Number(this._getDeviceOSVersion().split(".").slice(0,1)[0]);

		if(this.isIPhone() && !version_ios) {
			this._callAlert(alert);
			return true;
		}
		return false;
	},

	// Androidスマートフォンのバージョンが推奨値より低い場合.
	alertAndroidMobileLowVersion: function(alert) {
		let version_1 = Number(this.RECOMMENDED_ANDOROID_VERSION.split(".").slice(0,1)[0]) <= Number(this._getDeviceOSVersion().split(".").slice(0,1)[0]);
		let version_1_equal = Number(this.RECOMMENDED_ANDOROID_VERSION.split(".").slice(0,1)[0]) == Number(this._getDeviceOSVersion().split(".").slice(0,1)[0]);
		let version_2 = true;
		if(this._getDeviceOSVersion().split(".").slice(1,2)[0] !== undefined) {
			version_2 = Number(this.RECOMMENDED_ANDOROID_VERSION.split(".").slice(1,2)[0]) <= Number(this._getDeviceOSVersion().split(".").slice(1,2)[0]);
		}

		if(this.isAndroid() && (!version_1 || (version_1_equal && !version_2))) {
			this._callAlert(alert);
			return true;
		}
		return false;
	},

	// Androidタブレットのバージョンが推奨値より低い場合.
	alertAndroidTabletLowVersion: function(alert) {
		let version_1 = Number(this.RECOMMENDED_ANDOROID_VERSION.split(".").slice(0,1)[0]) <= Number(this._getDeviceOSVersion().split(".").slice(0,1)[0]);
		let version_1_equal = Number(this.RECOMMENDED_ANDOROID_VERSION.split(".").slice(0,1)[0]) == Number(this._getDeviceOSVersion().split(".").slice(0,1)[0]);
		let version_2 = true;
		if(this._getDeviceOSVersion().split(".").slice(1,2)[0] !== undefined) {
			version_2 = Number(this.RECOMMENDED_ANDOROID_VERSION.split(".").slice(1,2)[0]) <= Number(this._getDeviceOSVersion().split(".").slice(1,2)[0]);
		}

		if(this.isAndroidTablet() && (!version_1 || (version_1_equal && !version_2))) {
			this._callAlert(alert);
			return true;
		}
		return false;
	},


	// Chromeのバージョンが 推奨値より低い場合.
	alertChromeLowVersion: function(alert) {
		let version_1 = Number(this.RECOMMENDED_CHROME_VERSION.split(".").slice(0,1)[0]) <= Number(this._getDeviceBrowserVersion().split(".").slice(0,1)[0]);
		let version_1_equal = Number(this.RECOMMENDED_CHROME_VERSION.split(".").slice(0,1)[0]) == Number(this._getDeviceBrowserVersion().split(".").slice(0,1)[0]);
		let version_2 = true;
		if(this._getDeviceBrowserVersion().split(".").slice(1,2)[0] !== undefined) {
			version_2 = Number(this.RECOMMENDED_CHROME_VERSION.split(".").slice(1,2)[0]) <= Number(this._getDeviceBrowserVersion().split(".").slice(1,2)[0]);
		}

		if(this._getDeviceBrowserLayout() === "Blink" && (!version_1 || (version_1_equal && !version_2))) {
			this._callAlert(alert);
			return true;
		}
		return false;
	},

	// Chromeのバージョンが 推奨値より低い場合 [SP版].
	// 未使用 (ChromeのPC版とSP版というが 裏では違う言語で書いているのだろうが Googleは同じバージョン値で管理してくれている様子 = 現状PC版とSP版で別のバージョン値定数と比較する必要はない様子).
	alertChromeMobileLowVersion: function(alert) {
		let version_1 = Number(this.RECOMMENDED_CHROME_VERSION.split(".").slice(0,1)[0]) <= Number(this._getDeviceBrowserVersion().split(".").slice(0,1)[0]);
		let version_1_equal = Number(this.RECOMMENDED_CHROME_VERSION.split(".").slice(0,1)[0]) == Number(this._getDeviceBrowserVersion().split(".").slice(0,1)[0]);
		let version_2 = true;
		if(this._getDeviceBrowserVersion().split(".").slice(1,2)[0] !== undefined) {
			version_2 = Number(this.RECOMMENDED_CHROME_VERSION.split(".").slice(1,2)[0]) <= Number(this._getDeviceBrowserVersion().split(".").slice(1,2)[0]);
		}

		if(this._getDeviceBrowserName() == "Chrome Mobile" && (!version_1 || (version_1_equal && !version_2))) {
			this._callAlert(alert);
			return true;
		}
		return false;
	},

	// Safariのバージョンが 推奨値より低い場合.
	alertSafariLowVersion: function(alert) {
		let version_1 = Number(this.RECOMMENDED_SAFARI_VERSION.split(".").slice(0,1)[0]) <= Number(this._getDeviceBrowserVersion().split(".").slice(0,1)[0]);
		let version_1_equal = Number(this.RECOMMENDED_SAFARI_VERSION.split(".").slice(0,1)[0]) == Number(this._getDeviceBrowserVersion().split(".").slice(0,1)[0]);
		let version_2 = true;
		if(this._getDeviceBrowserVersion().split(".").slice(1,2)[0] !== undefined) {
			version_2 = Number(this.RECOMMENDED_SAFARI_VERSION.split(".").slice(1,2)[0]) <= Number(this._getDeviceBrowserVersion().split(".").slice(1,2)[0]);
		}

		if(this._getDeviceBrowserName() == "Safari" && (!version_1 || (version_1_equal && !version_2))) {
			this._callAlert(alert);
			return true;
		}
		return false;
	},


	// ブラウザーが クロム or クロニウム系統 エンジンを搭載していない場合 アラートを出す.
	alertBrowserNotChromOrChromium: function(alert) {

		// Safari標準をアナウンスしている端末以外の場合 ブラウザーが搭載しているスタイルシートエンジンが Chrome系で無い場合.
		if((!this.isIPhone() && !this.isIPad()) && this._getDeviceBrowserLayout() !== "Blink") {
			this._callAlert(alert);
			return true;
		}
		return false;
	},

	// PC版用.
	// 搭載メモリーが 推奨値より低い場合.
	alertDeviceLowMemory: function(alert) {
		if(this.isPC() && this._getDeviceMemory() < this.DEVICE_MEMORY_THRESHOLD) {
			this._callAlert(alert);
			return true;
		}
		return false;
	},


	isPC: function() {
		return this.isWindows() || this.isMac();
	},
	isWindows: function(){
		return this._getDeviceOSName().toLowerCase().indexOf("windows") > -1;
	},
	isMac: function() {
		return this._getDeviceOSName().toLowerCase() == "os x" && window.ontouchend === undefined; // UA的に複雑 古いOS搭載モデルはiPad 新しいOS搭載モデルはMacを名乗る.
	},
	isIPhone: function() {
		return platform.ua.toLowerCase().indexOf("iphone") != -1;
	},
	isIPad: function(){
		return platform.ua.toLowerCase().indexOf("ipad") != -1 || (this._getDeviceOSName().toLowerCase() == "os x" && window.ontouchend !== undefined);
	},
	isAndroid: function(){
		return this._getDeviceOSName() == "Android" && platform.ua.indexOf("Mobile") > 0;
	},
	isAndroidTablet: function(alert) {
		return this._getDeviceOSName() == "Android" && platform.ua.indexOf("Mobile") == -1;
	},


	//-----------------------------

	_callAlert: function(alert) {
		if (alert && typeof alert === 'function') {
			alert(); // error時の処理を実行.
		}
	},

	// 通信速度(Mbps) を測定する(非同期処理).
	// alert = function(mbps) {}
	_getUserMbps: function(alert) {

		const mbpsDatas  = []; // 数回試して通信速度の平均を測定.

		// 画像を読み込む時間を取得する.
		const loadSpeedImag = function() {
			return new Promise(function(resolve,reject) {
				let startTime = new Date().getTime();
				let loadImag = speedTestImags[mbpsDatas.length];
				fetch(loadImag).then(function(response) {
					return response.blob();
				}).then(function(blob) {
					let exeTime = (new Date().getTime() - startTime) / 1000;	// 秒数化.
					mbpsDatas.push(((8 * blob.size) / exeTime) / 1024 / 1024);	// Mbps化.
					resolve(true);
				}).catch(function(error) {
					console.log(error);
					reject(error);
				});
			});
		};

		// 平均値が出せたら計算結果を返す.
		const calculate = function() {
			if(0 < mbpsDatas.length) {

				//let mbps = mbpsDatas.reduce(function (accumulator, currentValue) {
				//	return accumulator + currentValue;
				//}, 0) / mbpsDatas.length;
				//console.log({sepeed_test:mbpsDatas, mbps_average:mbps});

				// 揺れ幅が大きく平均だと光回線でも低速扱いになるので最大速度で判断する.
				let mbps = mbpsDatas.reduce(function(a, b) {
				    return Math.max(a, b);
				});

				alert(Math.round(mbps*10)/10);
			}
		}

		let timestamp = new Date().getTime().toString();
		const speedTestImags = [
			'/speed_test/speed_imag2.jpg?'+timestamp+"1",
			'/speed_test/speed_imag2.jpg?'+timestamp+"2",
			'/speed_test/speed_imag2.jpg?'+timestamp+"3",
		];
		loadSpeedImag()
		.then(loadSpeedImag)
		.then(loadSpeedImag)
		.then(function(response) {
			calculate();
		}).catch(function(error) {
			console.log('SpeedTestError:', error);
			calculate();
		});

	},


	// OS判定.
	_getDeviceOSName: function() {

		// 値の想定.
		// Windows = "windows", "Windows server 2008 r2 / 7" 等 実機で確認.
		// Mac     = "OS X".
		// iOS     = "iOS".
		// Android = "Android".

		return platform.os.family;
	},

	// OSのバージョン判定.
	_getDeviceOSVersion: function() {
		if (navigator.userAgent.indexOf('CrOS') != -1) {
			return "0"; // ChromeBookのOSのバージョンは、ブラウザーのバージョンと同じ値らしくブラウザのバージョン判定にて、判定する
		}

		// 値の想定.
		// Windows = "10".
		// Mac     = "10.15.7".
		// iOS     = "14.3".
		// Android = "7.1.1".

		// 共通で気をつける点として、数字的な大小関係ではないということ.
		// つまり、10.9 の次が、11.0 ではなく 10.11かもしれないこと (数字的な大小ではない).

		return platform.os.version;
	},

	// OS 64Bit Or 32Bit 判定.
	_getDeviceOSBit: function() {

		// 値の想定.
		// Windows = 64.
		// Mac     = 64.
		// iOS     = 32.
		// Android = 32.

		return platform.os.architecture;
	},

	// OSのメモリー判定.
	_getDeviceMemory: function() {

		// 値の想定(メモリーを何G搭載していても 8以上にならない).
		// Windows = 8.
		// Mac     = 8.
		// iOS     = undefined (公式が秘匿している情報).
		// Android = 1.

		if(navigator.deviceMemory != undefined) {
			return navigator.deviceMemory;
		}

		return 4;
	},


	// ブラウザー判定.
	_getDeviceBrowserName: function() {

		// 値の想定.
		// Chrome         = "Chrome".
		// Chromium       = "Chrome".
		// Android        = "Chrome Mobile".
		// Firefox        = "Firefox".
		// iOS            = "Safari".
		// Edge(Chromium) = "Microsoft Edge".
		// Edge(旧)       = "Microsoft Edge".

		return platform.name;
	},

	// ブラウザー スタイルシステムやレイアウトエンジンと呼ばれるもの.
	_getDeviceBrowserLayout: function() {

		// 値の想定.
		// Chrom    = "Blink".
		// Chromium = "Blink"(新Edge含む).
		// Safari   = "WebKit".
		// Firefox  = "Gecko".
		// 旧Edge	= "EdgeHTML"(Microsoftが独自開発を続けていたが 限界を感じて開発終了したエンジン).

		return platform.layout;
	},


	// ブラウザーバージョン判定.
	_getDeviceBrowserVersion: function() {

		// 値の想定.
		// iOS            = "14.0.1" (ドットが2つ付いており数字的な大小での判断は出来ない).
		// Android        = "88.0.4324.152" (ドットが3つ付いており数字的な大小での判断は出来ない).
		// Edge(Chromium) = "87.0.664.57" (ドットが3つ付いており数字的な大小での判断は出来ない).
		// Edge(old)      = "18.17763.

		// 共通で気をつける点として、数字的な大小関係ではないということ.
		// つまり、10.9 の次が、11.0 ではなく 10.11かもしれないこと (数字的な大小ではない).

		return platform.version;
	},


};
