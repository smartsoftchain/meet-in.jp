/**
 * TMO用クラス
 */
;(function() {

	"use strict";

	var root = this;
	root.TMO = root.TMO || {};

	/**
	 * 共通して使用する定数
	 */
	TMO.CONST = {
		AJAX : {
			SUCCESS : "1",		// 成功時の結果コード
			FAILED  : "99"		// 失敗時の結果コード
		}
	};

	/**
	 * グローバルヘッダークラス
	 */
	TMO.GlobalHeader = function() {
		this.initialize.apply(this, arguments);
	};

	TMO.GlobalHeader.prototype = {

		REQUEST_URL            : "/setting-bookmark/ajax-list",		// ブックマークAjax取得用URL
		BOOKMARK_LIST_URL      : "/setting-bookmark/list",			// 「もっとみる」リンク
		bookmarkHoverElem      : ".global-menu-bookmark-list",					// ホバーイベントを設定する要素
		bookmarkListEntryPoint : ".global-menu-bookmark-list ul",				// <li>タグを追加する<ul>要素
		ajax : null,


		initialize : function() {
			this.ajax = new TMO.Ajax();
		},

		/**
		 * ブックマークリスト表示用ホバーイベント
		 */
		setBookmarkHoverEvent : function() {

			var self = this;

			// ホバー時にリストを取得する
			$(this.bookmarkHoverElem).on("mouseenter", function() {
				self.getBookmarkList();
			});
		},

		/**
		 * ブックマーク一覧を取得しリストに追加
		 */
		getBookmarkList : function() {

			var self = this;

			this.ajax.send(this.REQUEST_URL, {
				successCallback : function(result) {

					// 要素を空にする
					$(self.bookmarkListEntryPoint).empty();

					// リストを追加
					$.each(result.list, function() {
						$(self.bookmarkListEntryPoint).append("<li><p><a href='/setting-bookmark/redirect/id/" + this.id + "'><span>" + this.name + "</span></a></p></li>");
					});

					// ブックマーク一覧ページへのリンクをつける
					$(self.bookmarkListEntryPoint).append("<li class='more'><a href='" + self.BOOKMARK_LIST_URL + "'><span>もっとみる</span></a></li>");
				}
			});
		}
	};

	/**
	 * ブックマーククラス
	 */
	TMO.Bookmark = function() {
		console.log("Bookmark Class Init");
		this.initialize.apply(this, arguments);
	};

	TMO.Bookmark.prototype = {

		ajax                  : null,
		modalBookmarkElemName : "#modal-bookmark-name",		// ブックマーク名が表示されるinput[type="text"]
		modalCloseElemName    : ".modal-close2",			// モーダルクローズのイベントが設定される要素

		initialize : function() {
			this.ajax = new TMO.Ajax();
		},

		/**
		 * ブックマーク登録（新規および編集）
		 * @param url 送信先URL
		 * @param params パラメータ
		 * @param _isReload 登録成功後に画面リロードが必要か
		 */
		registBookmark : function(url, params, _isReload) {

			var self = this;
			var isReload = _isReload || false;

			this.ajax.send(url, {
				params : params,
				successCallback : function(result) {

					var resultMsg = "";

					if (result.resultCode === TMO.CONST.AJAX.FAILED) {
						alert(self.ajax.getParsedMessage(result.message, "【登録失敗】\n\n"));
					} else {
						alert(self.ajax.getParsedMessage(result.message, "【登録成功】\n\n"));

						$(self.modalBookmarkElemName).val("");			// ブックマーク名を空にする
						$(self.modalCloseElemName).trigger("click");	// モーダルを閉じる

						if (isReload) {
							location.reload();	// 画面再読込
						}
					}
				}
			});
		},

		/**
		 * ブックマーク削除
		 * @param url 送信先URL
		 * @param params パラメータ
		 */
		deleteBookmark : function(url, params) {

			var self = this;

			this.ajax.send(url, {
				params : params,
				successCallback : function(result) {

					var resultMsg = "";

					if (result.resultCode === TMO.CONST.AJAX.FAILED) {
						alert(self.ajax.getParsedMessage(result.message, "【削除失敗】\n\n"));
					} else {
						alert(self.ajax.getParsedMessage(result.message, "【削除成功】\n\n"));
						location.reload();	// 画面再読込
					}
				}
			});
		}
	};

	/**
	 * Ajaxクラス
	 */
	TMO.Ajax = function() {
		this.initialize.apply(this, arguments);
	};

	TMO.Ajax.prototype = {

		DATA_TYPE : "json",		// Ajaxで使用するでデフォルトのフォーマットはJSON

		initialize : function() {

		},

		/**
		 * 複数の型で返されるメッセージ一度分解して文字列にする
		 * @param message Array | String 表示されるメッセージ
		 * @param defaultMsg String メッセージの先頭に付与するデフォルトメッセージ
		 */
		getParsedMessage : function(message, defaultMsg) {

			// デフォルトメッセージ
			var resultMsg = defaultMsg || "";

			if ($.isArray(message)) {

				$.each(message, function() {

					var errorPoint = Object.keys(this)[0];
					var errorMsg   = this[errorPoint];

					resultMsg = resultMsg + errorMsg + "\n";
				});

			} else {
				resultMsg = resultMsg + message;
			}

			return resultMsg;
		},

		/**
		 * Ajax送信を行う
		 */
		send : function(url, options) {

			var self = this;

			var params          = options.params || {};
			var successCallback = options.successCallback || function(){};
			var failedCallback  = options.failedCallback || function(){};

			// 後程beforeAjaxとかやりたいときはここで一括設定する

			$.ajax({
				url      : url,
				type     : "POST",
				data     : params,
				dataType : this.DATA_TYPE,
				success  : successCallback,
				error    : failedCallback
			});
		}
	};


	/**
	 * Utilクラス
	 */
	TMO.Util = {

		/**
		 * 連想配列からKey値だけの配列を抽出して返す
		 */
		keys : function(obj) {

			var keys = [];
			for (var key in obj) {
				if(obj.hasOwnProperty(key)) {
					keys.push(key);
			    }
			}

			return keys;
		},

		/**
		 * 連想配列からValue値だけの配列を抽出して返す
		 */
		values : function(obj) {

		    var keys = this.keys(obj);
		    var length = keys.length;
		    var values = Array(length);
		    for (var i = 0; i < length; i++) {
		      values[i] = obj[keys[i]];
		    }

		    return values;
		}
	};

}).call(this);


/**
 * TMO用Utilクラス
 */
;(function() {

	"use strict";

	var root = this;
	root._U = root._U || {};

	/**
	 * Utilクラス
	 */
	_U = {
			
		/**
		 * 開発者ツールにログ出力
		 */
		log : function() {
			
			// 開発者モード
			var isDevMode = false;
			var args      = Array.prototype.slice.call(arguments);
			
			// IE9以下対応
			if (!window.console) {
				window.console = {};
				window.console.log = function(){};
			}
			
			if (isDevMode) {
				$.each(args, function() {
					console.log(this);
				});
			}
		},

		/**
		 * 連想配列からKey値だけの配列を抽出して返す
		 */
		keys : function(obj) {

			var keys = [];
			for (var key in obj) {
				if(obj.hasOwnProperty(key)) {
					keys.push(key);
			    }
			}

			return keys;
		},

		/**
		 * 連想配列からValue値だけの配列を抽出して返す
		 */
		values : function(obj) {

		    var keys = this.keys(obj);
		    var length = keys.length;
		    var values = Array(length);
		    for (var i = 0; i < length; i++) {
		      values[i] = obj[keys[i]];
		    }

		    return values;
		},

		/**
		 * jQueryUIのカレンダー（datePicker）を設定
		 */
		setCalendar : function(_classname) {

			// クラス名設定
			var classname = _classname || '.datepicker' ;

			$(classname).datepicker({
				dateFormat      :"yy-mm-dd",
				showOn          :"both",
				buttonImage     :"/img/btn_calendar.png",
				buttonImageOnly : true,
				showOtherMonths : true,
			});
		},

		/**
		 * ローディング画面を表示
		 * @param _message ローディング画面に表示するメッセージ
		 * @param _wait_time ローディングを表示するまでの待機時間
		 * 
		 * _wait_timeは、すぐ処理が終わる場合は表示させず、
		 * ある程度時間がたった場合のみローディング画面を表示させたいときに使用するため設定
		 */
		showLoading : function(_message, _wait_time) {

			// メッセージ設定
			var message   = _message || "しばらくお待ちください...";
			var wait_time = _wait_time || 0;
			var timer = null;
			
			if(_wait_time == undefined){
				$.blockUI({
					message: '<h1><img src="/img/common/ajax-loader.gif" /> <span class="loading-message"> ' + message + ' </span></h1>',
					css: {
						padding : "30px",
						border  : "5px solid #cfe8f3",
						fontWeight : "bold",
						fontSize : "14px"
					}
				});
			}else{
				timer = setTimeout(function() {
					
					$.blockUI({
						message: '<h1><img src="/img/common/ajax-loader.gif" /> <span class="loading-message"> ' + message + ' </span></h1>',
						css: {
							padding : "30px",
							border  : "5px solid #cfe8f3",
							fontWeight : "bold",
							fontSize : "14px"
						}
					});
					
				}, wait_time);
			}
			return timer;
		},

		/**
		 * ローディング画面を非表示
		 */
		hideLoading : function() {
			$.unblockUI();
		},
		
		/**
		 * モーダル画面を開く
		 * @param data_target モーダル定義されている箇所のID要素名
		 */
		modal : function(data_target) {
			
	        $('body').append('<div class="modal-overlay"></div>');
	        $('.modal-overlay').fadeIn('fast');
	        var modal = '#' + data_target;
	        modalResize();
	        $(modal).fadeIn('fast');

	        $('.modal-overlay,.modal-close,.modal-close2').off().click(function(){
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
		 * 別窓を開くイベントを設定する
		 */
		winOpen : function() {
			
			$(document).on("click", ".win-open", function(e) {
				
				e.preventDefault();
				
				var url    = $(this).attr("href");
				var width  = $(this).data("windowWidth") || 500;
				var height = $(this).data("windowHeight") || 700;
				
				// 画面中央に表示させるために座標を取得
				var l_position = Number((window.screen.width-width)/2);
				var t_position = Number((window.screen.height-height)/2);
				
				var option_pairs = {
					"toolbar"     : "no",
					"location"    : "no",
					"directories" : "no",
					"status"      : "no",
					"menubar"     : "no",
					"scrollbars"  : "yes",
					"resizable"   : "no",
					"width"       : width,
					"height"      : height,
					"left"        : l_position,
					"top"         : t_position	
				};
				
				var options = [];
				var options_string = "";
				$.each(option_pairs, function(key, value) {
					options.push(key + "=" + value); 
				});
			
				options_string = options.join(",");
			    
				// 別窓で開く
				window.open(url, '_blank', options_string);
			});
		},
		
		/**
		 * 直近の「掛け直し時間」をアラートで表示する。
		 */
		informCallBackTime : function() {
			
			// 掛け直し時間を取得
			var callBackTime = (+ $("#callBackTime").val()) || "";
			
			// 直近の掛け直し時間が存在する場合
			// ※callBackTime = ミリ秒。 5秒 = 5000ミリ秒。
			if (callBackTime !== "") {
				setTimeout(function(){
					alert("直近の掛け直し時間になりました。");
				}, callBackTime)
			}
		},
		
		/**
		 * クエリ文字列でkeyに該当する値を取得
		 */
		queryParam : function(key) {
			
			var queries = (function(){
				var s = location.search.replace("?", ""),
				  query = {},
				  queries = s.split("&"),
				  i = 0;

				if(!s) return null;

				for(i; i < queries.length; i ++) {
					var t = (queries[i]).split("=");
					query[t[0]] = t[1];
				}
				
				return query;
			})();			
			
			return (queries == null ? null : queries[key] ? queries[key] : null);
		}
	};

}).call(this);

/**
 * TMO用セッションクラス
 */
;(function() {

	"use strict";

	var root = this;
	var storage   = sessionStorage;		// デフォルトは「sessionStorage」
	var namespace = "session_storage";
	
	root._Session = root._Session || {};

	_Session = {
			
		setWebStorage : function(_storage) {
			storage = _storage;
		},
			
		setNameSpace : function(_namespace) {
			namespace = _namespace;
		},
		
		set : function(_key, value) {
			
			if (typeof _key === "string") {
				var key = namespace + "_" + _key;
				storage.setItem(key, value);
			} else if (typeof _key === "object") {
				
				// 一括で設定したい場合
				var dict = _key;
				$.each(dict, function(i, item) {
					var key = namespace + "_" + i;
					storage.setItem(key, item);
				});
			}
		},
		
		get : function(_key) {
			var key = namespace + "_" + _key;
			var result = storage.getItem(key) || "";
			
			return result;
		},
		
		remove : function(_key) {
			var key = namespace + "_" + _key;
			storage.removeItem(key);
		},
		
		clear : function() {
			storage.clear();
		}
	};

}).call(this);