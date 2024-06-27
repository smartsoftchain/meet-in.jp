const MODE_ONE_BIG = 1;
const MODE_ALL_MINIMUM = 2;
//const MODE_MATERIAL = 3;
const ANIMATION_TIME = 200;
const SPECIAL_LAYOUT_BOUNDARY = 4;
const DEFAULT_USER_NAME = "匿名ユーザー";
const SHARE_SCREEN_RATE = 56.25;/*高さ比率÷幅比率×100*/ // CSSとセット640:480 のレート
const MINIMUM_HEIGHT = 600;
const MINIMUM_WIDTH = 1200;
const LEFT_TOOL = 60;
const HEAD_AND_FOOT = 100;

const CHANGE_SCREEN_DOUBLE_WIDTH = 2;
const CHANGE_SCREEN_RATE_WIDE = 1.52;
const CHANGE_SCREEN_RATE_STANDARD = 0.95;
const CHANGE_SCREEN_RATE_NARROW = 0.51;

const DOCUMENT_OFFSET = 5;

/**
 * Created by matsuno.masahiro on 2017/02/13.
 * meet in 用　LayoutCtrl クラス
 * 各種ビデオのJqueryDomを渡して個数とモードに合わせて配置するクラス
 */
function LayoutCtrl($videoArea) {
	this.$videoArea = $videoArea;
	this.videoMargin = 5; // 各ビデオの隙間
	this.rightSpace = 300; // 名刺とかのスペース
	this.bigRatio = 7; // でかい画面の比率
	this.allMinimumLandNum = 2;//オールミニマムモードで横に並ぶ個数
	this.maxVideoNum = 6;//最大人数
}

//////////////// ビデオ全体関数 個々のビデオに紐付かないので、外に出す
LayoutCtrl.prototype = {
	/** API
	 * ビデオを正しい位置へセットする関数
	 * @param mode
	 * @param showVideoArray
	 * @param hideVideoArray
	 */
	apiSetVideo: function(mode, showVideoArray, hideVideoArray){
		// ビデオレイアウトの設定（meeting.js内でレイアウト関連を全て記述）
		spChangeLayout($(".big_video_area").data("id"), "#7");

		//$(thisVideoDivId).appendTo("div#layout_full");
		// ビデオタグを移動すると、ビデオが止まるのでビデオの再接続処理を実行する
		//sendReconnectStart();
	},

	/**API
	 * 資料、共有画面が出現した際に呼ばれる
	 */
	apiSetMaterial: function(){
		// 表示をマテリアルモードに変更して再描画。
		// var $my_dom =	$('.video_wrap[data-id="'+$('#user_id').val()+'"]');
		for(var i=0; i<MEETIN_MAIN_MAX_PEOPLE; i++){
			var $my_dom =	$("#negotiation_target_video_" +i);
			if(NEGOTIATION.videoArray.show.length > 0){
				this.moveVideoArray(NEGOTIATION.videoArray,$my_dom,true);
			}
		}
		//終わったら再描画
		this.apiSetVideo(NEGOTIATION.showVideoMode,NEGOTIATION.videoArray.show,NEGOTIATION.videoArray.hide);
	},

	/**
	 * Vide画面を全て非表示にする
	 */
	apiSetMaterial2: function(){
		// 表示をマテリアルモードに変更して再描画。
		for(var i=0; i<MEETIN_MAIN_MAX_PEOPLE; i++){
			var $my_dom = $("#negotiation_target_video_" +i);
			if(NEGOTIATION.videoArray.show.length > 0){
				this.moveVideoArray(NEGOTIATION.videoArray ,$my_dom ,true);
			}
		}
		var hideVideoArrayCopy = $.extend(true, [],NEGOTIATION.videoArray.hide);
		LayoutCtrl.videoHide2(hideVideoArrayCopy);
//		//終わったら再描画
//		this.apiSetVideo(NEGOTIATION.showVideoMode,NEGOTIATION.videoArray.show,NEGOTIATION.videoArray.hide);
	},

	/**API
	 * 共有画面を表示した際に呼ばれる
	 */
	apiMoveAllVideoFrameToHeader: function(){
		// 表示をマテリアルモードに変更して再描画。
		for (var i = 0; i < MEETIN_MAIN_MAX_PEOPLE; ++i) {
			var $my_dom =	$('.video_wrap[data-id="'+i+'"]');
			this.moveVideoArray(NEGOTIATION.videoArray ,$my_dom ,true);
		}
		//終わったら再描画
		var hideVideoArrayCopy = $.extend(true, [],NEGOTIATION.videoArray.hide);
		LayoutCtrl.videoHide2(hideVideoArrayCopy);
//		this.apiSetVideo(NEGOTIATION.showVideoMode,NEGOTIATION.videoArray.show,NEGOTIATION.videoArray.hide);
	},

	/**API
	 * 共有画面が終了した際に呼ばれる
	 */
	apiMoveAllVideoFrameToCenter: function(){
		// 表示をマテリアルモードに変更して再描画。
		for (var i = 0; i < MEETIN_MAIN_MAX_PEOPLE; ++i) {
			var $video_list_dom =	$('#video_list_' + i);
			if ($video_list_dom.css('visibility') === 'visible') {
				var $my_dom =	$('.video_wrap[data-id="'+i+'"]');
				this.moveVideoArray(NEGOTIATION.videoArray,$my_dom,false);
			}
		}

		LayoutCtrl.videoShow2(NEGOTIATION.showVideoMode,NEGOTIATION.videoArray.show);
		// フレーム内のボタン更新
		LayoutCtrl.updateVideoIcon(NEGOTIATION.videoArray.show);

//		//終わったら再描画
//		NEGOTIATION.showVideoMode = MODE_ALL_MINIMUM;
//		this.apiSetVideo(NEGOTIATION.showVideoMode,NEGOTIATION.videoArray.show,NEGOTIATION.videoArray.hide);
	},

	/**
	 * 全Video表示
	 */
	apiMoveAllVideoFrameToShow: function(){
		// 表示をマテリアルモードに変更して再描画。
		for (var i = 0; i < MEETIN_MAIN_MAX_PEOPLE; ++i) {
			var $video_list_dom = $('#video_list_' + i);
			if ($video_list_dom.css('visibility') === 'visible') {
				var $my_dom = $('.video_wrap[data-id="'+i+'"]');
				this.moveVideoArray(NEGOTIATION.videoArray ,$my_dom ,false);
			}
		}
		//終わったら再描画
		NEGOTIATION.showVideoMode = MODE_ONE_BIG;
//		this.apiSetVideo();
		this.apiSetVideo(NEGOTIATION.showVideoMode,NEGOTIATION.videoArray.show,NEGOTIATION.videoArray.hide);
	},

	/**
	 * 二者のCSS設定を入れ替える関数
	 * @param $fromVideo
	 * @param $toVideo
	 */
	cssSwap: function($fromVideo, $toVideo){
		// CSS取得。読みにくくなるためTMP２個作成
		var tmpFromNum;
		var tmpToNum;

		for(var i =0; i < 6; i++){
			if($fromVideo.hasClass("layout-" + i)){
				tmpFromNum = i;
			}
			if($toVideo.hasClass("layout-" + i)){
				tmpToNum = i;
			}
		}

		// CSSをお互いにスワップする。(消しこんで相手のクラスを新たに付与)
		$fromVideo.removeClass(function(index, className) {
			return (className.match(/\blayout-\S+/g) || []).join(' ');
		}).addClass("layout-" + tmpToNum);
		$toVideo.removeClass(function(index, className) {
			return (className.match(/\blayout-\S+/g) || []).join(' ');
		}).addClass("layout-" + tmpFromNum);

		// アイコンを更新する
		if($fromVideo.hasClass('big') || $toVideo.hasClass('big')){// どっちかがBig属性を持っていたらそれも切り替える
			$fromVideo.toggleClass('big');
			$toVideo.toggleClass('big');
		}
		this.updateVideoIcon([$fromVideo,$toVideo]);

		// Flashの描画領域を変更する
		var data_id = $fromVideo.attr('data-id');
		meetinFlashTargetVideo_changeSize(data_id, $("#negotiation_target_video_" + data_id).width(), $("#negotiation_target_video_" + data_id).height());
		data_id = $toVideo.attr('data-id');
		meetinFlashTargetVideo_changeSize(data_id, $("#negotiation_target_video_" + data_id).width(), $("#negotiation_target_video_" + data_id).height());
	},

	/**
	 * 全画面が同じサイズで出現するレイアウト
	 * @param showVideoArray
	 */
	allMinimumShow : function(showVideoArray){
		// 基底の長さを取得 複雑な計算をしているように見えるが、やってることはレイアウトが今の解像度で幾つにすれば最大で入るか算出している
		var baseLength = 0;
		if(showVideoArray.length == 1){
			if((this.$videoArea.width() - this.rightSpace) < this.$videoArea.height()){
				baseLength = (this.$videoArea.width() - this.rightSpace);
			}else{
				baseLength =this.$videoArea.height();
			}
		}else if(showVideoArray.length > 1){
			if(((this.$videoArea.width() - this.rightSpace) / this.allMinimumLandNum) - (this.videoMargin * 2) <
				this.$videoArea.height() / (Math.floor((showVideoArray.length + 1) / this.allMinimumLandNum))){
				baseLength = ((this.$videoArea.width() - this.rightSpace) / this.allMinimumLandNum) - (this.videoMargin * 2);
			}else{
				baseLength = this.$videoArea.height() / (Math.floor((showVideoArray.length + 1) / this.allMinimumLandNum));
			}
		}

		// ビデオ表示
		var num = 0;
		var self =this;
		$.each(showVideoArray,function(){
			this.css({
				bottom : 'auto',
				right: 'auto',
				top: self.videoMargin + (baseLength + self.videoMargin * 2) * Math.floor(num/2),
				left: self.videoMargin + (baseLength + self.videoMargin * 2) * (num % 2),
				width: baseLength
			});
			num ++;
			this.show( 'fade', '', ANIMATION_TIME);
			this.removeClass("big");
		});
	},

	/**
	 * 資料、共有画面が存在しているときのレイアウト
	 * @param showVideoArray
	 */
	materialShow : function(showVideoArray){
		var baseLength = 0;
		// 開いてる領域で最大値計算
		if((this.apiGetSubLength()) > this.$videoArea.height() / showVideoArray.length ){
			baseLength = this.$videoArea.height() / showVideoArray.length;
		}else{
			baseLength = (this.apiGetSubLength());
		}

		// ビデオ表示
		if(showVideoArray.length > 0){
			var num = 0;
			//var space = (this.$videoArea.width() - this.rightSpace - this.apiGetSubLength() - this.videoMargin*3 - this.apiGetMainLength());
			//var left_pos = ((this.apiGetSubLength() + (space / 2)  - this.videoMargin*3) - baseLength  - this.videoMargin) / 2;// 小さいビデオもセンタリング用left
			var self =this;
			// 横が baseLengthを7:3ぐらいの割合で分ける右側の名刺やメモ分隙間を開ける。ビデオのマージンも引く
			$.each(showVideoArray,function(){
				this.css({
					top: 'auto',
					right: 'auto',
					bottom: self.videoMargin + (baseLength - self.videoMargin ) * num,
					left: self.videoMargin,
					width: baseLength - (self.videoMargin * 2)
				});
				num ++;
				this.show( 'fade', '', ANIMATION_TIME);
				this.removeClass("big");
			});
		}
	},


	/**
	 * ヘッダーの状態を更新する
	 * @param showVideoArray
	 * @param hideVideoArray
	 */
	resetHeaderVideo: function(showVideoArray,hideVideoArray){
		var tmp;
		var canvas = document.createElement("canvas");
		// ヘッダーを非アクティブに
		$.each(showVideoArray,function(){
			tmp = $('.video_list_vert[data-id="'+this.data('id')+'"]');
			tmp.addClass('out').draggable().draggable("disable");
		});

		// ヘッダーをアクティブに
		$.each(hideVideoArray,function(){
			tmp = $('.video_list_vert[data-id="'+this.data('id')+'"]');
			tmp.removeClass('out');
			tmp.draggable().draggable("enable");
			var canvas = document.createElement("canvas");
			var video = $("div#negotiation_target_video_"+this.data('id')).find('#video_target_video_'+this.data('id')).get(0);
			if (video && canvas) {
				canvas.width = video.videoWidth;
				canvas.height = video.videoHeight;
				try {
					canvas.getContext('2d').drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
					var url = canvas.toDataURL('image/jpeg');
					if(url == "data:," || (!tmp.find(".icon-video").hasClass("mi_active") && this.data('id') != $('#user_id').val()) ){// イメージが取れないときにこうなるので、デフォアイコンをセット
						tmp.find('img').attr('src','/img/meet-in-logo_gray.png');
					}else{
						tmp.find('img').attr('src',canvas.toDataURL('image/jpeg'))
					}
				} catch (exception) {
				}
			}else{
				// ieはキャプチャできないのでmeet-inアイコンを使用
				tmp.find('img').attr('src','/img/meet-in-logo_gray.png');
			}
		});
	},

	/**
	 * ビデオを非表示にする
	 */
	videoHide : function(hideVideoArray){
		// ヘッダーを非アクティブにして、ビデオ表示
		if(hideVideoArray.length > 0){
			var self =this;
			$.each(hideVideoArray,function(){
				// SWFオブジェクトをhideし、またshowすると、エラーが起きる。ChromeではSWFが再読み込みされ、
				// IEではJavascriptSWFのメソッドにアクセスできなくなる。そのため、hideの代わりに、
				// 表示位置をスクリーンの外に移すことで、非表示を実現する
				var data_id = this.attr('data-id');
				if ($('#negotiation_target_video_old_left_' + data_id).val() === 'none') {
					var left = this.css('left');
					$('#negotiation_target_video_old_left_' + data_id).val(left);
				}
				this.css('left', '-99999px');

				this.removeClass("big");
			});
		}
	},

	/**
	 * ビデオを表示する
	 * @param mode
	 * @param showVideoArray
	 */
	videoShow : function(mode,showVideoArray){
		var num = 0;
		var vnum = num + showVideoArray.length;
		// マテリアルが表示されていれば,0番目は必ずマテリアルなので１番から
		if(($("#negotiation_share_screen").isShow() || $("#mi_docment_area").isShow() ) && vnum <= this.maxVideoNum){
			num = 1;
			vnum += 1;
		}

		$.each(showVideoArray,function(){
			this.show( 'fade', '', ANIMATION_TIME);

			// SWFオブジェクトをhideし、またshowすると、エラーが起きる。ChromeではSWFが再読み込みされ、
			// IEではJavascriptSWFのメソッドにアクセスできなくなる。そのため、hideの代わりに、
			// 表示位置をスクリーンの外に移すことで、非表示を実現する
			// showするときに、スクリーン外に移された要素を元の位置に戻す
			var data_id = this.attr('data-id');
			var left = $('#negotiation_target_video_old_left_' + data_id).val();
			if (left !== 'none') {
				this.css('left', left);
				$('#negotiation_target_video_old_left_' + data_id).val("none");
			}

			// スタイル削除(layout-[1～4]) ※ようはステイル名の振り直しを行うために削除している
			this.removeClass(function(index, className) {
				return (className.match(/\blayout-\S+/g) || []).join(' ');
			});

			/**
			 * スタイル設定(大表示スタイル適用)
			 */
			// videoが一個のときは強制でbigに
			// videoが2個以上あって、ワンビッグモードで、最初の要素はビッグをつける
			if(vnum == 1 || (vnum >= 2 && mode == MODE_ONE_BIG && num == 0)){
				this.addClass("big");
			}else{
				this.removeClass("big");
			}
			// スタイル設定(layout-[1～4])
			this.addClass("layout-"+num);
			num++;

			var data_id = this.attr('data-id');
			meetinFlashTargetVideo_changeSize(data_id, this.width(), this.height());
		});
	},

	videoHide2 : function(hideVideoArray){
		// ヘッダーを非アクティブにして、ビデオ表示
		if(hideVideoArray.length > 0){
			var self =this;
			$.each(hideVideoArray,function(){
				// SWFオブジェクトをhideし、またshowすると、エラーが起きる。ChromeではSWFが再読み込みされ、
				// IEではJavascriptSWFのメソッドにアクセスできなくなる。そのため、hideの代わりに、
				// 表示位置をスクリーンの外に移すことで、非表示を実現する
				var data_id = this.attr('data-id');
				if ($('#negotiation_target_video_old_left_' + data_id).val() === 'none') {
					var left = this.css('left');
					$('#negotiation_target_video_old_left_' + data_id).val(left);
				}
				this.css('left', '-99999px');
			});
		}
	},

	/**
	 * ビデオを表示する
	 * @param mode
	 * @param showVideoArray
	 */
	videoShow2 : function(mode,showVideoArray){

		$.each(showVideoArray,function(){
			// ビデオタグを表示するためにstyleを付与する
//			this.css("display", "block");

			this.show( 'fade', '', ANIMATION_TIME);

			// SWFオブジェクトをhideし、またshowすると、エラーが起きる。ChromeではSWFが再読み込みされ、
			// IEではJavascriptSWFのメソッドにアクセスできなくなる。そのため、hideの代わりに、
			// 表示位置をスクリーンの外に移すことで、非表示を実現する
			// showするときに、スクリーン外に移された要素を元の位置に戻す
			var data_id = this.attr('data-id');
			var left = $('#negotiation_target_video_old_left_' + data_id).val();
			if (left !== 'none') {
				this.css('left', left);
				$('#negotiation_target_video_old_left_' + data_id).val("none");
			}
		});
	},

	/**
	 * １つの画面を中央に大きく表示する
	 * @param $showVideo
	 */
	centerOneShow : function($showVideo){
		$showVideo.show();
		$showVideo.addClass("big");
	},

	/**
	 * 1つを大きく表示して、残りを下段に小さく表示する
	 * @param showVideoArray
	 */
	upperBigShow : function(showVideoArray){
		// 横幅が長辺、短い方に合わせる。複雑な計算のためvminは使用できない
		$showVideo = showVideoArray.shift();
		var landscapeFlg = (this.$videoArea.width() - this.rightSpace) > this.$videoArea.height() * this.bigRatio / 10;
		var baseLength = 0;

		if(landscapeFlg){// 横が長いなら長辺のサイズに合わせる
			baseLength = this.$videoArea.height() * this.bigRatio / 10;
		}else{
			baseLength = (this.$videoArea.width() - this.rightSpace);
		}
		var space = (this.$videoArea.width() - this.rightSpace - this.videoMargin*2 - baseLength);

		// 横が baseLengthを7:3ぐらいの割合で分ける右側の名刺やメモ分隙間を開ける。ビデオのマージンも引く
		$showVideo.css({
			top: this.videoMargin,
			bottom: 'auto',
			right: 'auto',
			left: (space / 2)  + this.videoMargin,
			width: baseLength - (this.videoMargin * 2)
		});
		$showVideo.show( 'fade', '', ANIMATION_TIME);
		$showVideo.addClass("big");

		// ココから下に続くビデオ
		landscapeFlg = (this.$videoArea.width() - this.rightSpace) / showVideoArray.length > this.$videoArea.height() * (1 - (this.bigRatio / 10));
		if(landscapeFlg){// 横が長いなら長辺のサイズに合わせる
			baseLength = this.$videoArea.height() * (1 - (this.bigRatio / 10));
		}else{
			baseLength = (this.$videoArea.width() - this.rightSpace) / showVideoArray.length;
		}

		if(showVideoArray.length > 0){
			var num = 0;
			var self =this;
			// 横が baseLengthを7:3ぐらいの割合で分ける右側の名刺やメモ分隙間を開ける。ビデオのマージンも引く
			$.each(showVideoArray,function(){
				this.css({
					top: 'auto',
					right: 'auto',
					bottom: self.videoMargin,
					left: (self.$videoArea.width() - self.rightSpace - (baseLength * showVideoArray.length)) / 2 + ( (baseLength) * num ) + self.videoMargin,
					width: baseLength - (self.videoMargin * 2)
				});
				num ++;
				this.show( 'fade', '', ANIMATION_TIME);
				this.removeClass("big");
			});
		}
	},

	/**
	 *
	 * 現在の画面サイズから、でかく表示するものの領域を取得
	 * @param rate 縦横比　正方形時は1
	 * @returns {number}
	 */
	apiGetMainLength : function(rate){
		rate = rate || 1;
		// 横幅が長辺、短い方に合わせる。複雑な計算のためvminは使用できない
		var landscapeFlg = (this.$videoArea.width() - this.rightSpace)  * this.bigRatio / 10 < (this.$videoArea.height()) * rate;
		var result = 0;

		if(landscapeFlg){// 横が長いなら長辺のサイズに合わせる
			result = (this.$videoArea.width() - this.rightSpace)  * this.bigRatio / 10 - (this.videoMargin * 4);
		}else{
			result = (this.$videoArea.height()) * rate;
		}
		return result;
	},

	/**
	 * 現在の画面サイズから、小さく表示するものの領域を取得
	 */
	apiGetSubLength : function(){
		return (this.apiGetMainLength() * (10 - this.bigRatio) / 10);
	},

	/**
	 *
	 * 指定されたターゲットDOMオブジェクトをfromからtoに移す
	 * @param videoArray ビデオ配列
	 * @param $needleVideo 移動するDOM
	 * @param order true: show -> hide false: hide -> show
	 */
	moveVideoArray: function(videoArray, $needleVideo, order){
		var tmpFromVideoArray = [];
		if(order){
			$.each(videoArray.show,function(){// 隠す要素をshowからhide配列に移動する
				if($needleVideo.get(0) === this.get(0)){// 比較前にIDからDOMを取ってくる
					videoArray.hide.push(this);
				}else{
					tmpFromVideoArray.push(this);
				}
			});
			videoArray.show = tmpFromVideoArray;
		}else{
			$.each(videoArray.hide,function(){// 隠す要素をshowからhide配列に移動する
				if($needleVideo.get(0) === this.get(0)){// 比較前にIDからDOMを取ってくる
					videoArray.show.push(this);
				}else{
					tmpFromVideoArray.push(this);
				}
			});
			videoArray.hide = tmpFromVideoArray;
		}
	},

	/**
	 * ターゲットと親を渡した際、親要素の縦の大きさに応じて、子要素に「.small」を付与する関数
	 * showVideoArray DOMオブジェクト
	 */
	updateVideoIcon : function (showVideoArray){
		function delay() {
			var user_id = $('#user_id').val();
			$.each(showVideoArray, function () {
				var data_id = this.attr('data-id');
				if (this.hasClass('big')) {
					this.find(".video_big_icon").hide();				// 拡大
					this.find(".video_small_icon").show();				// 標準
					this.find(".video_remove_icon").show();				// ビデオ削除
					this.find(".mi_video_move_icon").show();
					/**
					 * ログイン表示制御
					 * 名刺表示アイコン:表示処理
					 */
					if( $("#target_video_staff_type_"+data_id)[0] ) {
						$("#video_target_icon_"+data_id).find('.video_card_icon').hide();	// デフォルト(非表示)
						// スタッフタイプが設定されていれば名刺アイコンを表示する
						if( $("#target_video_staff_type_"+data_id).val() ) {
							$("#video_target_icon_"+data_id).find('.video_card_icon').show();	// 名刺アイコン表示
						}
					}
					else {
						// 通常タグ(#target_video_staff_type_x)が存在しない事はないが念のため入れておく
						$("#video_target_icon_"+data_id).find('.video_card_icon').hide();		// 名刺アイコン非表示
					}
					/**
					 * その他ユーザ制御(自分以外)
					 * 更新アイコン
					 */
					if(data_id!=user_id) {
						this.find(".stream_reconnect_icon").show();
						this.find(".video_full-screen_icon").show();
						this.find(".video_mute_audio").show();
					} else {
						this.find(".stream_reconnect_icon").hide();
						this.find(".video_full-screen_icon").hide();
						this.find(".video_mute_audio").hide();
					}
					// 大きいアイコンへ
					this.find(".mi_video_icon_wrap").removeClass("small");
				} else {
					this.find(".video_big_icon").show();				// 拡大
					this.find(".video_small_icon").hide();				// 標準
					this.find(".video_remove_icon").show();				// ビデオ削除
					this.find(".mi_video_move_icon").show();
					/**
					 * ログイン表示制御
					 * 名刺表示アイコン:表示処理
					 */
					if( $("#target_video_staff_type_"+data_id)[0] ) {
						$("#video_target_icon_"+data_id).find('.video_card_icon').hide();	// デフォルト(非表示)
						// スタッフタイプが設定されていれば名刺アイコンを表示する
						if( $("#target_video_staff_type_"+data_id).val() ) {
							$("#video_target_icon_"+data_id).find('.video_card_icon').show();	// 名刺アイコン表示
						}
					}
					else {
						// 通常タグ(#target_video_staff_type_x)が存在しない事はないが念のため入れておく
						$("#video_target_icon_"+data_id).find('.video_card_icon').hide();		// 名刺アイコン表示
					}
					/**
					 * その他ユーザ制御(自分以外)
					 * 更新アイコン
					 */
					if(data_id!=user_id) {
						this.find(".stream_reconnect_icon").show();
						this.find(".video_full-screen_icon").show();
						this.find(".video_mute_audio").show();
					} else {
						this.find(".stream_reconnect_icon").hide();
						this.find(".video_full-screen_icon").hide();
						this.find(".video_mute_audio").hide();
					}
					// 小さいアイコンへ
					this.find(".mi_video_icon_wrap").addClass("small");
				}
			});
		}
		// アニメーションの関係で実行タイミングをずらす
		setTimeout(delay(),ANIMATION_TIME);

	},

	/**
	 * ビデオ専用CSSアニメーション関数
	 */
	cssAnimate : function($target,setCssArray){
		$target.animate(setCssArray, ANIMATION_TIME, 'swing');
	},

	/**
	 * 入室時の初期化処理
	 * @param id
	 * @param name
	 * @param videoArray
	 */
	enterRoom : function(id,name,videoArray){
		var video =	$('.video_wrap[data-id="'+ id +'"]');
		var video_list =	$('#video_list_' + id);
		var already = false;
		var num = 0;
		var myNum = null;


		// hideVideoArrayからあれば移動する
		LayoutCtrl.moveVideoArray(videoArray,video,false);
		// showVideoArrayに存在確認
		$.each(videoArray.show,function(){
			if(video.get(0) === this.get(0)){
				already = true;
			}
			if($('#user_id').val() == this.data('id')){
				myNum = num;
			}
			num++;
		});
		if(!already){// なければ挿入
			if(myNum == 0) {
				videoArray.show.unshift(video);
			}else{
				videoArray.show.push(video);
			}
		}
		video_list.css('visibility','visible');
		video_list.css('display','block');
		// ミュート設定
		var mute_audio = $("#video_target_icon_" + id).find(".video_mute_audio");
		if(mute_audio) {
			mute_audio.data("muted", false);
			var mute_icon = mute_audio.find(".mi_video_icon");
			if(mute_icon) {
				if(mute_icon.hasClass('icon-microphone-off')) {
					mute_icon.removeClass('icon-microphone-off');
				}
				if(!mute_icon.hasClass('icon-microphone')) {
					mute_icon.addClass('icon-microphone');
				}
			}
		}

		meetinFlashTargetVideo_changeSize(id, $("#negotiation_target_video_" + id).width(), $("#negotiation_target_video_" + id).height());
	},

	/**
	 * 退室時の初期化処理
	 * @param id
	 * @param videoArray
	 */
	exitRoom : function(id,videoArray){
		// 非表示にしてから配列から撤去
		var video =	$('.video_wrap[data-id="'+ id +'"]');
		var video_list =	$('#video_list_' + id);
		LayoutCtrl.moveVideoArray(videoArray,video,true);
		video_list.css('visibility','hidden');
		video_list.css('display','none');
		video_list.find('img').attr('src','/img/icon_face.png');
	},

	/**
	 * 配列から指定のものを取り除く
	 * @param id
	 * @param videoArray
	 * @param flg true: show配列から取り除く　false:hide配列から取り除く
	 */
	removeArray : function(id,videoArray,flg){
		var $video_dom =	$('.video_wrap[data-id="'+ id +'"]');
		var tmpDom = [];
		if(flg){
			$.each(videoArray.show,function(){
				if($video_dom.get(0) === this.get(0)){
				}else{
					tmpDom.push(this);
				}
			});
			videoArray.show = tmpDom;
		}else{
			$.each(videoArray.hide,function(){
				if($video_dom.get(0) === this.get(0)){
				}else{
					tmpDom.push(this);
				}
			});
			videoArray.hide = tmpDom;
		}
	}
};