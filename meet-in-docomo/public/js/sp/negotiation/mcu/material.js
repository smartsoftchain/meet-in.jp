/*
 * 資料共有に使用するJS群
 *
 * */
// 現在表示中の資料
var currentDocumentId = 0;
// 現在表示中のページ
var currentPage = 1;

const SCROLL_MARGIN = 20;					// スクロールバーの領域

var orgCanvasWidth = MATERIAL_WIDTH;		// キャンバスのデフォルトサイズ幅
var orgCanvasHeight = MATERIAL_HEIGHT;		// キャンバスのデフォルトサイズ丈

var canvasWidth = MATERIAL_WIDTH;			// キャンバスの実サイズ幅
var canvasHeight =  MATERIAL_HEIGHT;		// キャンバスの実サイズ丈

var codumentViewState = 1;					// [1:縮小, 1.7:拡大1, 2.4:拡大2, 3.1:拡大3]
var EXPANSION_VALUE = 0.7;					// 画像を拡大するための値
var MIN_EXPANSION_VALUE = 1;				// 画像を拡大するための最小値
var MAX_EXPANSION_VALUE = 3.1;				// 画像を拡大するための最大値

var viewDocumentWhenVideoTop = 250;			// 資料表示時のビデオTOP表示位置
var viewDocumentWhenVideoRight = 10;		// 資料表示時のビデオRight表示位置

var guestTop = 0;
var guestLeft = 0;

const HIDE_ICON_FLG = 1;					// 資料のアイコン非表示フラグ
const SHOW_ICON_FLG = 0;					// 資料のアイコン表示フラグ

const DEFAULT_THUMBNAIL_UL_WIDTH = 320;		// サムネイル表示領域のULデフォルト幅
const MAX_THUMBNAIL_VIEW_COUNT = 6;			// 資料サムネイルの最大表示件数（超えた場合はスクロール表示）
const THUMBNAIL_LI_WIDTH = 50;				// サムネイルのLI幅の目安

var syncUserDict = {};						// 資料で同期が必要なユーザーIDを保存する
const RESPONSE_FLG = 1;						// レスポンス有り
const NO_RESPONSE_FLG = 0;					// レスポンス無し
var syncDocumentTimeoutId = null;			// ドキュメントの同期時に設定するタイマーID
var syncDocumentLoadTimeoutId = null;		// 画像を複数読み込む場合に設定するタイマーID
const NO_NOTIFICATION = null;				// 資料表示時にレスポンス通知を行わない場合の値
const MAX_SYNC_TIMER = 10000;				// 同期の最大時間は10秒
const MIN_SYNC_TIMER = 1000;				// 同期の最少時間は1秒
var syncMaterialScrollFlg = 0;				// 資料のスクロール同期フラグ
const MESSAGE_TIMER = 5000;					// 資料を保存できない場合に表示するメッセージの秒数
const IMG_LOAD_WAIE_TIMER = 1000;			// 別資料読み込み中の場合の待ち時間1秒

var dragMaterialId = 0;						// IEの場合.setData()でエラーが発生するのでグローバル変数にデータを保持させる

// 資料のキー名だけを保存するセッションストレージ
var sessionStorageKeys = $.parseJSON(sessionStorage.getItem("mtSessionStorageKeys"));
if(!sessionStorageKeys){
	sessionStorageKeys = [];
}

$(function () {
	// =====================================================================================================
	// tooltipの初期化
	// =====================================================================================================
	$('.material_button_tooltip').tooltipster({
		contentAsHTML: true,
		interactive: true,
		animation: 'fade',
		trigger: 'none',
		arrow : false,
		theme: 'tooltipster-light',
		content: '資料が追加されました',
		functionPosition: function(instance, helper, position) {
			position.coord.top -= 10; /* ここでtopの位置をオフセット変更 */
			return position;
		}
	});

	// =====================================================================================================
	// 資料選択モーダル関連のイベント
	// =====================================================================================================
	// 資料選択モーダル表示
	$(document).on('click', '.show_material_modal', function(){

		// サーバーから資料共有のファイル情報を取得する
		$.ajax({
			url: "https://" + location.host + "/negotiation/get-modal-material-list",
			type: "GET",
			data: {},
			success: function(resultJson) {
				// jsonをオブジェクトに変換
				var result = $.parseJSON(resultJson);

				// material_typeが文字になっているので一度全てキャストする
				var materialBasicList = [];
				for(var i = 0; i < result.length; i++){
					result[i]["material_type"] = Number(result[i]["material_type"]);
					materialBasicList.push(result[i]);
				}

				// モーダル内のタグを削除する
				$("div.inner-wrap").empty();
				// テンプレート生成
				var template = Handlebars.compile($('#material-select-modal-template').html());
				// モーダルに内容をセットする
				$('div.inner-wrap').append(template({
					"materialBasicList" : materialBasicList,
				}));
				// モーダルの表示
				$("#modal-content").show();
				// モーダルを表示する為のクリックイベントを発生させる
				$('.modal-open').trigger("click");

			}
		});

		// メニューを閉じるために疑似クリックを発生させる
		$("div#negotiation_right_menu_button").trigger('click');

	});

	/**
	 * 資料がクリックされた場合のイベント
	 */
	var materialId = 0;
	$(document).on('click', '.modal_material', function(){
		// まず全ての資料の背景を白にする
		$('.modal_material').each(function(i, elem) {
			$(elem).css('background-color', "#ffffff");
		});
		// 押下された資料の背景をオレンジにする
		$(this).css("background-color", "#0081CC");

		// 選択した資料のIDを保持しておく
		materialId = $(this).attr("id");
	});

	/**
	 * ファイル選択ボタンが押下された場合のイベント
	 */
	$(document).on('click', '[name=material_select]', function(){
		// 資料が選択されているかを判定
		if(materialId != 0){
			// キーを作成
			var keyName = "materialId_" + materialId;
			// ブラウザのセッションストレージからデータ取得
			var mtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));
			// 既に選択されていないかを判定
			if(!mtSessionStorage){
				// サーバーから資料を１件取得する
				var staffType = $("#staff_type").val();
				var staffId = $("#staff_id").val();
				var clientId = $("#client_id").val();
				var uuId = localStorage.UUID;
				if( !uuId ) {	// 空
					uuId = UUID.generate();
					localStorage.UUID = uuId;
				}
				getMaterial(materialId, $('#user_id').val(), staffType, staffId, clientId, uuId);

				// 選択した資料IDの初期化
				materialId = 0;

				// tooltip表示
				$('.material_button_tooltip').tooltipster('open');
				// アップロードメッセージを消すためのタイマーを設定
				setTimeout(function(){
					$('.material_button_tooltip').tooltipster('close');
				}, MESSAGE_TIMER);
			}else{
				alert("既に選択された資料です。");
			}

		}else{
			alert("資料を選択して下さい。");
		}
	});

	/**
	 * 資料選択ダイアログでキャンセルが押下された場合のイベント
	 */
	$(document).on('click', '[name=material_cancel]', function(){
		// モーダルの内容を削除する
		$("div.inner-wrap").empty();
		// モーダルを閉じる
		$("#modal-content").hide();
	});

	// =====================================================================================================
	// サムネイル操作関連のイベント
	// =====================================================================================================
	/**
	 * サムネイル画像ホバー時の処理
	 */
	$(document).on({
		"mouseenter": function(){
			// 画像の要素を探す
			var imgTag = $(this).find("img");
			// アトリビュート取得
			var src = imgTag.attr("src");
			var alt = imgTag.attr("alt");

			// 拡大画像表示領域を作成する
			bigThumbnailImage = '<div class="big_thumbnail_area bottom_arrow"><img src="'+src+'" alt="'+alt+'" class="big_thumbnail_image"/></div>';
			$(this).closest("li").append(bigThumbnailImage);

			// サムネイルの位置を取得し、拡大画像の位置を調節する
			var liOffset =  $(this).closest("li").offset();
			$("div.big_thumbnail_area").css("left", liOffset.left);

		},
		"mouseleave": function(){
			// 拡大画像を削除する
			$("div.big_thumbnail_area").remove();
		}
	}, ".thumbnail_image");

	// サムネイルの移動ボタンを押下した場合のイベント処理
	$("[id^=move_thumbnail_]").click(function(){
		// 現在のスクロール位置を取得
		var scrollLeft = $("div#negotiation_bottom_document_select").scrollLeft();
		// どちらにスクロールするかの判定
		if($(this).attr("id") == "move_thumbnail_prev"){
			// 左にスクロール
			scrollLeft -= 30;
			$("div#negotiation_bottom_document_select").scrollLeft(scrollLeft);
		}else{
			// 右にスクロール
			scrollLeft += 30;
			$("div#negotiation_bottom_document_select").scrollLeft(scrollLeft);
		}
	});

	// =====================================================================================================
	// 資料に関するイベント
	// =====================================================================================================
	/**
	 * 資料のページ移動
	 */
	$(document).on('click', '[id^=mi_scroll_arrow]', function(){
		// 次の資料を表示前に現在の資料を保存する
		saveDocument();

		// 表示ページを設定
		if($(this).attr("id") == "mi_scroll_arrow_left"){
			currentPage--;
		}else{
			currentPage++;
		}
		// 資料を表示
		loadDocument(NO_NOTIFICATION, 0);

		// ページャーの表示切替
		viewPager(SHOW_ICON_FLG);

		// ページ変更の同期処理
		syncMoveDocument();
	});

	/**
	 * 資料がURLの場合は画像表示後、キャンバス領域をクリックでURL先を別ウインドウで表示する
	 */
	$(document).on('click', 'canvas#sp_img_canvas', function(){
		var url = getDocumentUrl();
		if(url){
			// URLの資料を展開中の場合は別ウインドウでURL先を表示する
			window.open(url, '_blank');
		}
	});

	/**
	 * コメントの表示
	 */
	$(document).on('click', 'div#document_header_icon img.img_document_comment', function(){
		if(!$("p.mi_document_note").is(':visible')){
			// コメントが非表示の場合は表示する
			// メモを取得
			var materialMemo = getMaterialMemo();
			if(materialMemo){
				// コメントが存在する場合はコメントを設定し表示する
				$("p.mi_document_note").text(materialMemo);
				$("p.mi_document_note").show();
			}else{
				alert("コメントが設定されていません");
			}
		}else{
			// コメントが表示されていれば非表示にする
			$("p.mi_document_note").hide();
		}
	});

	/**
	 * 資料のダウンロード
	 */
	$(document).on('click', 'div#document_header_icon span.icon-download', function(){
		// ダウンロードメッセージを表示
		$("div.upload_document_message").text("ダウンロード中です");
		$("div.upload_document_message_area").show();

		// 資料データを保存する
		saveDocument();

		// 送信データ
		var materialId  = currentDocumentId;
		var clientId = $("#client_id").val();
		var staffType = $("#staff_type").val();
		var staffId = $("#staff_id").val();
		var connectionInfoId = $("#connection_info_id").val();

		// $.ajaxだけではバイナリを扱うのが厳しいので代わりにXMLHttpRequestを使う（バイナリで取得しないとカメラの映像が消えてしまう為）
		var xhr = new XMLHttpRequest();
		xhr.open("POST", "/negotiation/download-document", true);
		// POST 送信の場合は Content-Type は固定.
		xhr.setRequestHeader( 'Content-Type', 'application/x-www-form-urlencoded' );
		xhr.responseType = 'arraybuffer';
		xhr.onload = function(e) {
			// Blobオブジェクトにファイルを格納する（コンテンツタイプをpdfとして指定）
			var blob = new Blob([xhr.response], {"type": "application/pdf"});
			// ダウンロードファイル名を設定(document_年月日時分秒.pdf)
			var now = new Date();
			var pdfFileName = "document_"+now.getFullYear()+(now.getMonth() + 1)+now.getDate()+now.getHours()+now.getMinutes()+now.getSeconds()+".pdf";

			if(getBrowserType() != "IE"){
				// Aタグのhref属性にBlobオブジェクトを設定する。
				$("a[name=download_document]").attr("href", URL.createObjectURL(blob));
				// ファイル名を設定
				$("a[name=download_document]").attr("download", pdfFileName);
				// aタグのクリックイベントを発生させる
				$("a[name=download_document]")[0].click();
			}else{
				// IE専用のダウンロード処理
				window.navigator.msSaveBlob(blob, pdfFileName);
			}
			// ダウンロードメッセージを削除
			$("div.upload_document_message_area").hide();
		};
		// サーバへリクエストを送信（POSTの場合は引数に設定する）
		xhr.send("materialId="+materialId+"&clientId="+clientId+"&staffType="+staffType+"&staffId="+staffId+"&connectionInfoId="+connectionInfoId);
	});

	/**
	 * キャンバスのスクロールイベント
	 */
	$("div#mi_docment_area").on("scroll", function() {
		// 他のユーザーのスクロール情報と同期時は、自身のスクロールイベントを発生させない
		if(syncMaterialScrollFlg == 0){
			// 資料の表示割合を計算する
			var proportionSize = getProportion();
			// スクロール位置を取得
			var scrollTop = $("div#mi_docment_area").scrollTop();
			var scrollLeft = $("div#mi_docment_area").scrollLeft();
			var data = {
					command : "DOCUMENT",
					type : "SCROLL_DOCUMENT",
					scrollTop : scrollTop / proportionSize,
					scrollLeft : scrollLeft / proportionSize
			};
			sendCommand(SEND_TARGET_ALL, data);

			// リサイズアイコンの位置を変更する
			changeResizeIconOffset(scrollTop, scrollLeft, 0);
		}else{
			// 同期された後にスクロールイベントが発生するので、その後フラグを落とす
			syncMaterialScrollFlg = 0;
		}
	});

	// 資料領域にホバー時のみ資料ヘッダーアイコンとページ変更アイコンを表示する
	$("div#mi_docment_area").hover(
			// マウスオーバーの処理
			function () {

				// データを取得する為のキーを作成する
				var keyName = "materialId_" + currentDocumentId;
				// ブラウザのセッションストレージからデータ取得
				var mtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));
				if(!mtSessionStorage[keyName]["material_basic"]["material_url"]){
					// ダウンロードアイコンを表示にする
					$("div#document_header_icon").show();
				}
				// ページ変更アイコンの表示
				viewPager(SHOW_ICON_FLG);

			},
			// マウスアウトの処理
			function () {
				// ダウンロードアイコンなどの非表示
				$("div#document_header_icon").hide();
				// ページ変更アイコンの非表示
				viewPager(HIDE_ICON_FLG);
			}
		);

	// =====================================================================================================
	// 左メニューに関するイベント
	// =====================================================================================================
	/**
	 * 目次の表示
	 */
	$(document).on('click', '.left_icon_content', function(){
		// 資料を表示している場合のみ目次を表示する
		if($("div#mi_docment_area").is(':visible') && currentDocumentId != 0){
			if(!$("#mi_contents_display").is(':visible')){
				// トグル非表示の場合は表示
				// 全資料を画像化する
				var keyName = "materialId_" + currentDocumentId;
				// ブラウザのセッションストレージからデータ取得
				var mtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));
				// 資料の最大数を取得
				var maxPageCount = mtSessionStorage[keyName]["material_detail"].length;
				// ドロップした資料のハッシュキーを取得
				var materialIdHash = mtSessionStorage[keyName]["material_basic"]["md5_file_key"];

				// 画像を追加する前にulのデータを全て削除しておく
				$("div.mi_tag_list ul").empty();

				// 目次用画像を追加する
				for(var i = 0; i < maxPageCount; i++){
					// ページ番号を取得
					var pageNumber = mtSessionStorage[keyName]["material_detail"][i]["material_page"];
					// ファイルパスを作成
					var pageKey = "page" + mtSessionStorage[keyName]["material_detail"][i]["material_page"];
					var filePath = "/cmn-data/" + mtSessionStorage[keyName]["canvas_document"]["document"][pageKey]["fileName"];
					// altを作成
					var alt = mtSessionStorage[keyName]["material_detail"][i]["material_title"];
					// タグを作成
					var liTag = '<li id="'+pageNumber+'">';
					if(mtSessionStorage[keyName]["material_detail"][i]["material_tag_flg"] == 1){
						// 付箋有り
						liTag += '<div class="document_tag"></div>';
					}
					if(mtSessionStorage[keyName]["material_detail"][i]["material_memo"]){
						// コメント有り
						liTag += '<div class="document_comment"><img src="/img/1px_comment.svg" class="img_document_comment" alt="コメント"/></div>';
					}
					liTag += '<img src="'+filePath+'" alt="'+alt+'"/><div>'+pageNumber+'P</div></li>';
					// liタグを追加する
					$("div.mi_tag_list ul").append(liTag);
				}
				// 目次を表示する
				$("#mi_contents_display").show();
				$(".mi_contents_display_overlay").show();
				setTimeout(function(){
					$("#mi_contents_display").addClass("mi_onview");
				}, 200);
			}else{
				// 目次を表示している場合は非表示にする
				$("#mi_contents_display").removeClass("mi_onview");
				$(".mi_contents_display_overlay").hide();
				setTimeout(function(){
					$("#mi_contents_display").hide();
				}, 300);
			}
		}
	});
	/**
	 * 目次の画像を選択
	 */
	$(document).on('click', 'div.mi_tag_list li', function(){
		// 次の資料を表示前に現在の資料を保存する
		saveDocument();
		// 表示する資料のページ番号を取得
		currentPage = $(this).attr("id");
		// 資料を表示
		loadDocument(NO_NOTIFICATION, 0);
		// ページ変更の同期処理
		syncMoveDocument();
	});

	/**
	 * 目次を非表示する
	 */
	$(document).on('click', '.mi_contents_display_overlay', function(){
		$("#mi_contents_display").removeClass("mi_onview");
		$(".mi_contents_display_overlay").hide();
		setTimeout(function(){
			$("#mi_contents_display").hide();
		}, 300);
	});

	/**
	 * 目次のページ移動
	 * 最左又は最右に移動した場合でもイベントを拾いスクロールを行う簡易な作りになっている
	 */
	$(document).on('click', '[id^=contents_scroll_arrow]', function(){

		// 現在のスクロール位置を取得
		var scrollLeft = $("div.mi_tag_list").scrollLeft();
		// スクロール量を取得
		var scrollVolume = $("div#mi_contents_display li").outerWidth();

		// どちらにスクロールするかの判定
		if($(this).attr("id") == "contents_scroll_arrow_left"){
			// 左にスクロール
			scrollLeft -= scrollVolume;
			$("div.mi_tag_list").stop().animate({
				scrollLeft: $("div.mi_tag_list").scrollLeft()-scrollVolume
			});
		}else{
			// 右にスクロール
			scrollLeft += scrollVolume;
			$("div.mi_tag_list").stop().animate({
				scrollLeft: $("div.mi_tag_list").scrollLeft()+scrollVolume
			});
		}
	});

	/**
	 * 拡大・縮小ボタンのイベント
	 * [1:縮小, 1.5:拡大, 2:拡大, 2.5:拡大]
	 */
	$(document).on('click', 'li.left_icon_size', function(){
		// 資料を表示している場合のみ目次を表示する
		if($("div#mi_docment_area").is(':visible') && currentDocumentId != 0){
			// 拡大縮小を行う前に画像を保存する
			saveDocument();

			// キャンバスのサイズとアイコンを変更
			codumentViewState = Math.round((codumentViewState + EXPANSION_VALUE) * Math.pow( 10, 1 ) ) / Math.pow( 10, 1 );
			// 3は存在しないので1に戻す
			if(codumentViewState >= (EXPANSION_VALUE + MAX_EXPANSION_VALUE)){
				codumentViewState = 1;
				// 縮小時はリサイズアイコンの位置を初期化
				changeResizeIconOffset(0, 0, 1);
			}
			if(codumentViewState == MAX_EXPANSION_VALUE){
				$("li.left_icon_size div#icon-expansion").hide();
				$("li.left_icon_size div#icon-reduction").show();
			}else{
				$("li.left_icon_size div#icon-expansion").show();
				$("li.left_icon_size div#icon-reduction").hide();
			}

			// 現在コメントを表示しているか判定(オペレーターのみ)
			var commentViewFlg = 0;
			if($('#is_operator').val() == "1" && $("p.mi_document_note").is(':visible')){
				commentViewFlg = 1;
			}

			// キャンバスの拡大・縮小処理
			resizeCanvas(NO_NOTIFICATION);

			// 資料を再描画するとコメントが消えるので、拡大・縮小前にコメントを表示していた場合は再度表示させる(オペレーターのみ)
			if($('#is_operator').val() == "1" && commentViewFlg == 1){
				$("p.mi_document_note").show();
			}

			// 拡大ボタンを非表示にする
			viewExpansion(HIDE_ICON_FLG);
			// 拡大・縮小処理を同期する
			syncChangeSizeDocument();
		}
	});

	// =====================================================================================================
	// マウスポインターと線を描くに関するイベント
	// =====================================================================================================
	// var docOnMouseFlg = false;		// マウスの押下フラグ
	/**
	 * マウスのポインターを相手の画面に表示する
	 */
	var mouseMovePointData = [];
	$(document).on('touchmove', 'canvas#sp_img_canvas', function(e){
		// 線を書いているのか、マウスの移動だけなのかを判定する
		var writeLineFlg = 0;
		if(docOnMouseFlg && (selectLeftTool == TOOL_PEN_NORMAL || selectLeftTool == TOOL_PEN_HIGHLIGHT || selectLeftTool == TOOL_PEN_ERASER)){
			var url = getDocumentUrl();
			if(url){
				docOnMouseFlg = false;
			}
			// 要素の位置を取得
			var element = document.getElementById("sp_img_canvas");
			var rect = element.getBoundingClientRect();
			// 要素の位置座標を計算
			var positionX = rect.left + window.pageXOffset ;	// 要素のX座標
			var positionY = rect.top + window.pageYOffset ;		// 要素のY座標
			// 要素の左上からの距離を計算
			var drowX = e.originalEvent.touches[0].pageX - positionX ;
			var drowY = e.originalEvent.touches[0].pageY - positionY ;
			// 線を書いているのでフラグを建てる
			writeLineFlg = 1;


			// 資料の表示割合を計算する
			var proportionSize = getProportion();


			mouseMovePointData.push({
				drowX : drowX / proportionSize,
				drowY : drowY / proportionSize,
				writeLineFlg : writeLineFlg,
				onMouseX : onMouseX / proportionSize,
				onMouseY : onMouseY / proportionSize,
				line : line,
				color : color,
				selectLeftTool : selectLeftTool,
			});

			console.log("proportionSize" + proportionSize);

			if(writeLineFlg){
				// フラグとは別に同じ条件で自分の資料に線を書く（先に書くとonMouseXとonMouseYが書き変わってしまう）
				writeLine("sp_img_canvas", drowX, drowY, onMouseX, onMouseY, line, color, selectLeftTool);
			}

			// 通信量が負荷が高すぎるので数回に一度の通信にする.
			if(mouseMovePointData.length % 3 != 0) {
				return;
			}

			// マウスの位置を相手に送信する
			var data = {
				command : "DOCUMENT",
				type : "MOUSE_POINTER",
				//drowX : drowX / proportionSize,
				//drowY : drowY / proportionSize,
				//writeLineFlg : writeLineFlg,
				//onMouseX : onMouseX / proportionSize,
				//onMouseY : onMouseY / proportionSize,
				//line : line,
				//color : color,
				//selectLeftTool : selectLeftTool,
				userId : $('#user_id').val(),
				position: mouseMovePointData
			};
			mouseMovePointData = [];
			sendCommand(SEND_TARGET_ALL, data);
		}
	});

	// キャンバス押下時の処理(オペレーターのみ操作可能)
	$(document).on('mousedown', 'canvas#sp_img_canvas', function(e){
		// 資料を表示している場合のみ実行
		if($("div.document_canvas_contents").is(':visible') && currentDocumentId != 0){
			// 資料がURLではない場合のみ線を描けるようにする
			var url = getDocumentUrl();
			if(!url){
				// マウス押下のフラグを立てる
				docOnMouseFlg = true;
				// 要素の位置を取得
				var element = document.getElementById("sp_img_canvas");
				var rect = element.getBoundingClientRect();
				// 要素の位置座標を計算
				var positionX = rect.left + window.pageXOffset ;	// 要素のX座標
				var positionY = rect.top + window.pageYOffset ;		// 要素のY座標
				// 要素の左上からの距離を計算し起点を設定
				onMouseX = e.originalEvent.touches[0].pageX - positionX ;
				onMouseY = e.originalEvent.touches[0].pageY - positionY ;
			}
		}
	});

	// キャンバス押下終了時の処理(オペレーターのみ操作可能)
	$(document).on('mouseup', 'canvas#sp_img_canvas', function(){
		// 資料を表示している場合のみ実行
		if($("div#mi_docment_area").is(':visible') && currentDocumentId != 0){
			if(onMouseFlg){
				// 線を書き終わったら資料を保存する
				saveDocument();
			}
			// 線を書く為の変数初期化
			onMouseFlg = false;
			onMouseX = 0;
			onMouseY = 0;
		}
	});
	// キャンバスからマウスが外れた場合の処理(オペレーターのみ操作可能)
	$(document).on('mouseout', 'canvas#sp_img_canvas', function(){
		if(onMouseFlg){
			// 線を書き終わったら資料を保存する
			saveDocument();
		}
		// 線を書く為の変数初期化
		onMouseFlg = false;
		onMouseX = 0;
		onMouseY = 0;
	});

	// =====================================================================================================
	// 資料の移動とリサイズイベント処理
	// =====================================================================================================
	addDocumentAreaOperation();

	// 資料領域のリサイズ時
	var materialLeft = 0;
	$("div#mi_docment_area").resizable({
		minHeight: 260,
		minWidth: 260,
		containment :  "#mi_video_area",
		handles: "ne, se, sw, nw",
		start: function() {
			// left座標がマイナスの場合のみ現在のleft設定する
			if($(this).position().left < 0){
				materialLeft = $(this).position().left;
			}
		},
		resize: function() {
			// なぜかleft値がマイナスの場合は0にされるので、設定しなおす
			if(materialLeft < 0){
				materialLeft = $(this).position().left + materialLeft;
				$(this).css("left", materialLeft);
				// 一度設定すればよいので初期値に戻す
				materialLeft = 0;
			}
		},
		stop: function() {
			// 資料領域のリサイズ時の処理
			documentResizeEvent();
		}
	});



		// ===================================================================
	// 資料に書き込むイベント
	// ===================================================================
	// 資料のマウス押下フラグ
	var docOnMouseFlg = false;

	// キャンバス押下時の処理
	$(document).on('touchstart', '#sp_img_canvas', function(e){
		// マウス押下のフラグを立てる
		docOnMouseFlg = true;
		// 要素の位置を取得
		var element = document.getElementById("sp_img_canvas");
		var rect = element.getBoundingClientRect();
		// 要素の位置座標を計算
		var positionX = rect.left + window.pageXOffset ;	// 要素のX座標
		var positionY = rect.top + window.pageYOffset ;		// 要素のY座標
		// 要素の左上からの距離を計算し起点を設定
		onMouseX = e.originalEvent.touches[0].pageX - positionX ;
		onMouseY = e.originalEvent.touches[0].pageY - positionY ;
	});

	// キャンバス押下終了時の処理
	$(document).on('touchend', '#sp_img_canvas', function(){
		docOnMouseFlg = false;
		onMouseX = 0;
		onMouseY = 0;
		saveWhiteBoardImage();
	});
	// タッチ中に電話がかかってきた場合など
	$(document).on('touchcancel', '#sp_img_canvas', function(){
		docOnMouseFlg = false;
		onMouseX = 0;
		onMouseY = 0;
		saveWhiteBoardImage();
	});
	// // キャンバス押下後移動時の処理
	// $(document).on('touchmove', '#document_canvas', function(e){
	// 	// マウスが押下され、移動している場合のみ処理を行う
	// 	if(docOnMouseFlg && (selectLeftTool == TOOL_PEN_NORMAL || selectLeftTool == TOOL_PEN_HIGHLIGHT || selectLeftTool == TOOL_PEN_ERASER)){
	// 		var url = getDocumentUrl();
	// 		if(url){
	// 			onMouseFlg = false;
	// 		}
	// 		// 要素の位置を取得
	// 		var element = document.getElementById("document_canvas");
	// 		var rect = element.getBoundingClientRect();
	// 		// 要素の位置座標を計算
	// 		var positionX = rect.left + window.pageXOffset ;	// 要素のX座標
	// 		var positionY = rect.top + window.pageYOffset ;		// 要素のY座標
	// 		// 要素の左上からの距離を計算
	// 		var drowX = e.originalEvent.touches[0].pageX - positionX ;
	// 		var drowY = e.originalEvent.touches[0].pageY - positionY ;
	// 		//console.log("[X:"+drowX+"][Y:"+drowY+"]");



	// 		// 資料の表示割合を計算する
	// 		var proportionSize = getProportion();

	// 		var data = {
	// 			command : "WHITE_BOARD",
	// 			type : "WRITE_WHITE_BOARD",
	// 			drowX : drowX,
	// 			drowY : drowY,
	// 			onMouseX : onMouseX,
	// 			onMouseY : onMouseY,
	// 			line : line,
	// 			selectLeftTool : selectLeftTool,
	// 			color : color
	// 		};
	// 		sendCommand(SEND_TARGET_ALL, data);

	// 		// 自分のホワイトボードへ書き込み
	// 		writeLine("document_canvas", drowX, drowY, onMouseX, onMouseY, line, color, selectLeftTool);
	// 	}

	// });


	// =====================================================================================================
	// その他のイベント処理
	// =====================================================================================================
	/**
	 * ブラウザのウインドウリサイズ後の処理
	 * キャンバスをリサイズする
	 */
	$(window).resize(function() {
		// 資料のアイコン位置を調整する処理
		redisplayDocumentIcon();
	});

	/**
	 * ブラウザのスクロール時に実行する処理
	 */
	$(window).bind("scroll", function() {
		// 資料のアイコン位置を調整する処理
		redisplayDocumentIcon();
	});
});

/**
 * サーバーから資料を１件取得する
 * @param materialId
 * 商談画面へUPしたユーザ情報(staffType, staffId, clientId)
 */
function getMaterial(localMaterialId, registUserId, staffType, staffId, clientId, uuId){

	var connectionInfoId = $("#connection_info_id").val();

	// サーバーから資料の情報を取得する
	$.ajax({
		url: "https://" + location.host + "/negotiation/get-material",
		type: "GET",
		data: { materialId : localMaterialId, clientId : clientId, staffType : staffType, staffId : staffId, connectionInfoId : connectionInfoId},
		success: function(resultJson) {
			// jsonをオブジェクトに変換
			var result = $.parseJSON(resultJson);
			if(result["status"] == 1){
				// 資料情報をサーバーから読み込む初期化処理
				loadDocumentInfo(result, registUserId, staffType, staffId, clientId, uuId);
				loadDocument(NO_NOTIFICATION, 0);

				// サムネイル数が増えた場合にスクロールのボタンを表示しulの領域を増やす
				// オペレータの場合はsessionStorageKeys.lengthの数がサムネイル数となるが処理の共通化で、権限の数を数える
				var thumbnailviewCount = getThumbnailCount();
				if(thumbnailviewCount > MAX_THUMBNAIL_VIEW_COUNT){
					// サムネイルの表示領域を変更する
					showMoveThumbnailIcon(thumbnailviewCount);
				}
			}else{
				alert("資料を取得できませんでした。");
			}
		}
	});
}

/**
 * 資料を読み込む初期化処理
 * ダイアログで資料を選択した場合と、商談画面で資料アップロードの共通処理
 * @param result
 */
function loadDocumentInfo(result, registUserId, staffType, staffId, clientId, uuid){
	try{

		var materialId = result["material_basic"]["material_id"];

		// モーダルの内容を削除する
		$("div.inner-wrap").empty();
		// モーダルを閉じる
		$("#modal-content").hide();

		// 資料IDを変数に保存する
		keyName = "materialId_" + materialId;
		mtSessionStorage = {};
		mtSessionStorage[keyName] = result;

		//　ユーザ情報追加(staffType/staffId/clientId)
		mtSessionStorage[keyName]["staff_type"] = staffType;
		mtSessionStorage[keyName]["staff_id"] = staffId;
		mtSessionStorage[keyName]["client_id"] = clientId;
		mtSessionStorage[keyName]["UUID"] = uuid;

		// キャンバスで変更データを保存用の領域作成
		mtSessionStorage[keyName]["userId"] = registUserId;
		mtSessionStorage[keyName]["canvas_document"] = {};
		mtSessionStorage[keyName]["canvas_document"]["hashKey"] = result["material_basic"]["md5_file_key"];
		mtSessionStorage[keyName]["canvas_document"]["maxCount"] = result["material_detail"].length;
		mtSessionStorage[keyName]["canvas_document"]["document"] = {};

		// 資料データを保存するための領域を作成する
		for (var i = 0; i < result["material_detail"].length; i++) {
			var pageKey = "page" + result["material_detail"][i]["material_page"];
			mtSessionStorage[keyName]["canvas_document"]["document"][pageKey] = {};
			mtSessionStorage[keyName]["canvas_document"]["document"][pageKey]["img"] = "";
			mtSessionStorage[keyName]["canvas_document"]["document"][pageKey]["fileName"] = result["material_detail"][i]["material_filename"];
			mtSessionStorage[keyName]["canvas_document"]["document"][pageKey]["orgHeight"] = 0;
			mtSessionStorage[keyName]["canvas_document"]["document"][pageKey]["orgWidth"] = 0;
		}

		// 資料のデータをセッションストレージに保存
		sessionStorage.setItem(keyName, JSON.stringify(mtSessionStorage));
		// 資料のキーをセッションストレージに保存
		if( sessionStorageKeys.indexOf(keyName) >= 0 ) {
		} else {
			// keyの配列に存在しない場合は追加する
			sessionStorageKeys.push(keyName);
			sessionStorage.setItem("mtSessionStorageKeys", JSON.stringify(sessionStorageKeys));
		}

		// サムネイル表示
		viewThumbnail();

		// ゲストも資料の初期化を行う
		var data = {
				command : "DOCUMENT",
				type : "INIT_DOCUMENT",
				keyName : keyName,
				mtSessionStorage : JSON.stringify(mtSessionStorage)
		};
		sendCommand(SEND_TARGET_ALL, data);

	}catch (e) {
		if ($('#is_operator').val() == "1") {
			// 同期メッセージの表示領域にメッセージを表示
			$("#no_save_document_message_area").show();
			setTimeout(function (){
				// 5秒後にメッセージを削除
				$("#no_save_document_message_area").hide();
			} , MESSAGE_TIMER);
		}
	}
}

/**
 * 資料のドラッグを開始
 * @param event
 */
function materialDragStart(event){
	try{
		event.dataTransfer.setData("material_id", event.target.id);
	}catch (e) {
		// IEの場合.setData()でエラーが発生するのでグローバル変数にデータを保持させる
		dragMaterialId = event.target.id;
	}
	// 目次が表示されている場合は資料をドラッグした時点で非表示にする
	if($("#mi_contents_display").is(':visible')){
		// 目次を非表示する
		$("#mi_contents_display").hide();
	}
}
/**
 * ブラウザ標準のドロップ動作をキャンセル
 */
function materialDragOver(event){
	event.preventDefault();
}
/**
 * 資料のドロップ
 * @param event
 */
function materialDrop(event) {
	var localMaterialId = 0;

	//var orgCanvasWidth = MATERIAL_WIDTH;		// キャンバスのデフォルトサイズ幅
	//var orgCanvasHeight = MATERIAL_HEIGHT;	// キャンバスのデフォルトサイズ丈
	//var canvasWidth = MATERIAL_WIDTH;			// キャンバスの実サイズ幅
	//var canvasHeight =  MATERIAL_HEIGHT;		// キャンバスの実サイズ丈

	// 拡大表示をリセット
	codumentViewState = 1;	// [1:縮小, 1.7:拡大1, 2.4:拡大2, 3.1:拡大3]
	$("li.left_icon_size div#icon-expansion").show();
	$("li.left_icon_size div#icon-reduction").hide();

	//var viewDocumentWhenVideoTop = 250;			// 資料表示時のビデオTOP表示位置
	//var viewDocumentWhenVideoRight = 10;		// 資料表示時のビデオRight表示位置

	try{
		localMaterialId = event.dataTransfer.getData("material_id");
	}catch (e) {
		// IEの場合.setData()でエラーが発生するのでグローバル変数にデータを保持させる
		localMaterialId = dragMaterialId;
	}
	if((typeof event.dataTransfer != "undefined") && localMaterialId && (typeof event.originalEvent === "undefined")){
		// 画面共有時は資料を表示させない
		if(!$("#negotiation_share_screen").isShow()){

			// ドロップした資料のID
			currentDocumentId = localMaterialId;
			// 現在の表示ページを設定（資料表示の最初は１ページ目を表示なので1を指定）
			currentPage = 1;

			// データを取得する為のキーを作成する
			var keyName = "materialId_" + currentDocumentId;
			// ブラウザのセッションストレージからデータ取得
			var mtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));
			// URLの場合はダウンロード等を削除する
			var documentUrlFlg = 0;
			if( mtSessionStorage != null ) {
				if(mtSessionStorage[keyName]["material_basic"]["material_url"]){
					documentUrlFlg = 1;
				}
			}

			// ビデオを表示するために先に資料表示領域を表示
			$("div#mi_docment_area").show();

			// 資料を表示し、ビデオを資料用のビデオに変更する
//			LayoutCtrl.apiSetMaterial();
// 2018/04/20 太田
			LayoutCtrl.apiSetMaterial2();	// レイアウト変更なし

			var documentCanvasLeft = LayoutCtrl.apiGetSubLength();

			// キャンバスに資料を表示する
			loadDocument(NO_NOTIFICATION, 1);

			// 最後にドロップイベントをキャンセルする（お作法かな）
			materialDragOver(event);

			// 資料を商談画面へアップしたユーザ情報(表示している資料が自分が表示した資料かを判定するために使用する)
			$("#document_material_id").val(keyName);
			$("#document_uuid").val(mtSessionStorage[keyName]["UUID"]);
			$("#document_user_id").val( $("#user_id").val() );

			var data = {
					command : "DOCUMENT",
					type : "SHOW_DOCUMENT",
					keyName : keyName,
					currentDocumentId : currentDocumentId,
					currentPage : currentPage,
					documentUrlFlg : documentUrlFlg,
					documentCanvasLeft : documentCanvasLeft,

					documentMaterialId : $('#document_material_id').val(),
					document_user_id : $("#document_user_id").val(),
					documentUuId : $('#document_uuid').val()
			};
			sendCommand(SEND_TARGET_ALL, data);
		}
		else{
			// 画面共有時は資料表示ができないメッセージを表示
			$('.material_button_tooltip').tooltipster('content', '画面共有時は資料の表示を行えません');
			// tooltip表示
			$('.material_button_tooltip').tooltipster('open');
			// アップロードメッセージを消すためのタイマーを設定
			setTimeout(function(){
				$('.material_button_tooltip').tooltipster('close');
				// 元のメッセー時に戻す
				$('.material_button_tooltip').tooltipster('content', '資料が追加されました');
			}, MESSAGE_TIMER);
		}
	}
}

/**
 * 資料とキャンバス画像読み込み(すべての読み込みが完了するまで描画しないため)
 */
function loadImages(imagePaths, loadedImgsInfo, callback) {
	if(!imagePaths) { return; }
	var count = imagePaths.length;
	$.each(imagePaths, function(key, data) {
		var onLoad = function(e) {
			count--;
			if(0 == count) {
				callback(loadedImgsInfo);
			}
		}
		var img = new Image();
		img.onload = function() {
			data['img'] = this;
			loadedImgsInfo.push(data);
			onLoad();
		}
		img.onerror = function() {
			data['img'] = this;
			loadedImgsInfo.push(data);
			onLoad();
		}
		img.src = data["src"];
	});
}

/**
 * キャンバスに資料を表示する為の画像読み込み
 */
var spCanvasUrl = null;			// SPでは線を引かれたらその画像を読み込む
function loadDocument(requestUserId, DropFirstFlg){
	// 資料のキーを作成
	var keyName = "materialId_" + currentDocumentId;
	var pageKey = "page" + currentPage;
	// ブラウザのセッションストレージからデータ取得する為の変数宣言
	var mtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));
	if(mtSessionStorage && keyName in mtSessionStorage && currentDocumentId != 0){
		// 資料の存在するフォルダパス
		var documentPath = "/negotiation_document/negotiation_"+ $("#connection_info_id").val() + "/";
		// 資料とキャンバス画像の名前を作成
		var documentName = mtSessionStorage[keyName]["canvas_document"]["document"][pageKey]["fileName"];
		var canvasNames = mtSessionStorage[keyName]["canvas_document"]["document"][pageKey]["fileName"].split(".");
		var canvasName = canvasNames[0] + "-cvs.png";
		// 乱数の文字を取得
		var uuid = UUID.generate();
		var uniqueStr = uuid.replace(/\-/g, '');
		var loadedImgsInfo = [],
				loadedImgs = [],
				imagePaths = [
			{"src": documentPath + documentName + "?" + uniqueStr, "type": "doc"},
			{"src": documentPath + canvasName + "?" + uniqueStr, "type": "cvs"},
		];
		cvsImgFlg = false;
		// SP専用の描いた線を読み込む為のキャンバス画像
		spCanvasUrl = imagePaths[1]["src"];
		// 資料とキャンバスの読み込み
		loadImages(imagePaths, loadedImgsInfo, function(loadedImgsInfo) {
			// 読み込み完了
			var cvsImg, docImg;
			$.each(loadedImgsInfo, function(i, e) {
				if(e["type"] == "doc") {
					// 資料画像
					docImg = e["img"];
					// サイズ設定を行うために再度セッションストレージデータを取得する
					var localMtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));
					// 画像のサイズを保存する
					if(localMtSessionStorage[keyName]["canvas_document"]["document"][pageKey]["orgHeight"] == 0){
						localMtSessionStorage[keyName]["canvas_document"]["document"][pageKey]["orgHeight"] = docImg.height;
						// 資料のデータをセッションストレージに保存
						sessionStorage.setItem(keyName, JSON.stringify(localMtSessionStorage));
					}
					if(localMtSessionStorage[keyName]["canvas_document"]["document"][pageKey]["orgWidth"] == 0){
						localMtSessionStorage[keyName]["canvas_document"]["document"][pageKey]["orgWidth"] = docImg.width;
						// 資料のデータをセッションストレージに保存
						sessionStorage.setItem(keyName, JSON.stringify(localMtSessionStorage));
					}
					// 資料を表示する
					viewDocumentImage(e["img"], imagePaths[0]["src"], "#sp_img_document");
					/*
					// imgタグに画像を設定する
					$("#document_img").attr("src", e["img"].src);
					*/
				} else if(e["type"] == "cvs") {
					// キャンパス画像
					// 資料を表示する
					viewDocumentImage(e["img"], imagePaths[1]["src"], "#sp_img_canvas");
					cvsImg = e["img"];
					cvsImgFlg = true;
				}
			});

			// 既存の描画処理
			viewDocument(requestUserId, docImg, cvsImg, cvsImgFlg, DropFirstFlg);
		});
	}
}

/**
 * キャンバスの画像が存在するかサーバーへ問い合わせる
 * @param imgPath
 * @returns
 */
function chackCanvasImg(imgPath){
	var result = $.ajax({
		url: "https://" + location.host + "/negotiation/chack-canvas-img",
		type: "GET",
		async: false,
		data: {imgPath : imgPath}
	}).responseText;
	return result;
}

/**
 * キャンバス画像が存在しない場合にデフォルトの透過画像を作成しサーバーに保存する
 * @param canvasDict
 * @returns
 */
function initCanvas(canvasDict){
	// キャンバスのサイズを指定する
	var element = document.getElementById("sp_img_canvas");
	// context取得
	var context = element.getContext('2d');
	// キャンバスの内容を初期化する
	context.clearRect(0, 0, canvasDict["width"], canvasDict["Height"]);
	// キャンバスのサイズを指定する
	element.setAttribute("width", canvasDict["width"]);
	element.setAttribute("height", canvasDict["Height"]);
	context.fillStyle = "rgba(255, 255, 255, 0)";

	// 現在の表示内容をpng化
	var canvasData = element.toDataURL();
	// ルームID
	var connectionInfoId = $("#connection_info_id").val();
	// ファイル名を取得
	var pageKey = "page" + currentPage;
	var keyName = "materialId_" + currentDocumentId;
	var mtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));
	var fileNames = mtSessionStorage[keyName]["canvas_document"]["document"][pageKey]["fileName"].split(".");
	// キャンバス画像保存用に名前を変更する
	var fileName = fileNames[0] + "-cvs.png";
	// サーバーに画像を転送する
	var result = $.ajax({
		url: "https://" + location.host + "/negotiation/save-material",
		type: "POST",
		async: false,
		data: {canvasData : canvasData, connectionInfoId : connectionInfoId, fileName : fileName}
	}).responseText;
}

function viewDocument(requestUserId, documentImg, canvasImg, canvasImgFlg, DropFirstFlg){
	// 資料のキーを作成
	var keyName = "materialId_" + currentDocumentId;
	var pageKey = "page" + currentPage;
	// ブラウザのセッションストレージからデータ取得する為の変数宣言
	var mtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));
	// ダウンロードフラグ
	var downloadFlg = mtSessionStorage[keyName]["material_basic"]["download_flg"];

	var material_user_id = mtSessionStorage[keyName]["userId"];
	// コメントの制御を行う
	// 自身のuseridと違う場合はメモアイコンは非表示
	var user_id = $('#user_id').val();
	$("div#document_header_icon img.img_document_comment").hide();
	if ($('#is_operator').val() == "1") {
		if(user_id == material_user_id) {
			// 新しい資料を表示する際はコメントを非表示にする
			$("p.mi_document_note").hide();
			// コメントの表示アイコンの制御
			if(getMaterialMemo()){
				// コメントが存在する場合
				$("div#document_header_icon img.img_document_comment").show();
			}
		}
	}

	// 資料ドロップ時は最大サイズとする　By 太田
	if( DropFirstFlg == 1 ) {
		$("div#mi_docment_area").height($("div#fit_rate").height()).width($("div#fit_rate").width());
	}

	// 資料表示領域を設定する
	setOrgCanvasSize();

	// 画像のサイズを計算する
	getCanvasSize(mtSessionStorage[keyName]["canvas_document"]["document"][pageKey], (orgCanvasHeight * codumentViewState), (orgCanvasWidth * codumentViewState), (orgCanvasHeight * codumentViewState), (orgCanvasWidth * codumentViewState));
	// キャンバスのサイズを指定する
	resizeDocument(DropFirstFlg);

	// キャンバスのオブジェクトを取得
	var element = document.getElementById("sp_img_canvas");

	// context取得
	var context = element.getContext('2d');
	context.fillStyle = "rgba(255, 255, 255, 0)";
	if(canvasImgFlg && canvasWidth != 0){
		// 画像を描画
		context.clearRect(0, 0, canvasWidth, canvasHeight);
		context.drawImage(canvasImg, 0, 0, canvasWidth, canvasHeight);
	}
	// 資料の表示領域を表示
	$("img#document_img").show();
	$("div#mi_docment_area").show();

	// ダウンロードアイコンの制御
	// viewDownloadIcon(downloadFlg);

	// 目次アイコンの制御
	if(mtSessionStorage[keyName]["viewFlg"] || mtSessionStorage[keyName]["userId"] == $('#user_id').val()){
		$("li.left_icon_content").removeClass("display_none");
	}else{
		$("li.left_icon_content").addClass("display_none");
	}

	// 初期化時の資料同期処理の場合、画像読み込み後にスクロール設定を行う
	if(syncDocumentScrollTop > 0){
		$("div#mi_docment_area").scrollTop(syncDocumentScrollTop);
		syncDocumentScrollTop = 0;
	}
	if(syncDocumentScrollLeft > 0){
		$("div#mi_docment_area").scrollLeft(syncDocumentScrollLeft);
		syncDocumentScrollLeft = 0;
	}
	// 通知を必要としている場合のみ通知を送る
	if(requestUserId != NO_NOTIFICATION){
		// 相手に自分の資料表示完了通知を行う
		var data = {
				command : "DOCUMENT",
				type : "SHOW_DOCUMENT_COMPLET",
				responseUserId : $('#user_id').val()

		};
		// ページ変更を行ったユーザーにメッセージ送信
		sendCommandByUserId(requestUserId, data);
	}
}

/**
 * 資料の表示領域を設定する
 * @returns
 */
function setOrgCanvasSize(){
	orgCanvasWidth = $("#mi_docment_area").width();
	orgCanvasHeight = $("#mi_docment_area").height();
}

/**
 * 表示画像の割合を求める
 * 縦、横の比率は保った前提なので縦のみで計算を行う
 * @returns
 */
function getProportion(){
	// 資料のキーを作成
	var keyName = "materialId_" + currentDocumentId;
	// ページキーを作成
	var pageKey = "page" + currentPage;
	// ブラウザのセッションストレージからデータ取得する為の変数宣言
	var mtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));
	// 比率の計算を行う
	if(!canvasHeight){
		canvasHeight = $("#sp_img_canvas").height();
	}
	if(mtSessionStorage[keyName]["canvas_document"]["document"][pageKey]["orgHeight"]==0){
		documentH = canvasHeight;
	}	else {
		documentH = mtSessionStorage[keyName]["canvas_document"]["document"][pageKey]["orgHeight"];
	}
	var proportion = canvasHeight / documentH * 100;
	return proportion;
}


/**
 * キャンバスのサイズを決める
 * サイズが合うまで再帰する
 * ※2017-04-26 仕様が変更になり元のサイズをそのまま出力するように変更
 */
function getCanvasSize(documentInfo, localCanvasHeight, localCanvasWidth, viewCanvasHeight, viewCanvasWidth){
	if(documentInfo["orgHeight"] > documentInfo["orgWidth"]){
		// 縦長画像の場合
		localCanvasWidth = documentInfo["orgWidth"] * localCanvasHeight / documentInfo["orgHeight"];
		if(localCanvasWidth > viewCanvasWidth){
			// 縦に合わせ横を計算した結果、横が枠より大きい場合は縦サイズを縮めて再計算する
			localCanvasHeight = localCanvasHeight - 1;
			getCanvasSize(documentInfo, localCanvasHeight, localCanvasWidth, viewCanvasHeight, viewCanvasWidth);
		}else{
			// グローバル変数に値を設定する
			canvasHeight = localCanvasHeight;
			canvasWidth = localCanvasWidth;
		}
	}else{
		// 横長画像の場合
		localCanvasHeight = documentInfo["orgHeight"] * localCanvasWidth / documentInfo["orgWidth"];
		if(localCanvasHeight > viewCanvasHeight){
			// 横に合わせ縦を計算した結果、縦が枠より大きい場合は横サイズを縮めて再計算する
			localCanvasWidth = localCanvasWidth - 1;
			// 自身の関数で再帰する
			getCanvasSize(documentInfo, localCanvasHeight, localCanvasWidth, viewCanvasHeight, viewCanvasWidth);
		}else{
			// グローバル変数に値を設定する
			canvasHeight = localCanvasHeight;
			canvasWidth = localCanvasWidth;
		}
	}
}

/**
 * キャンバスのサイズを動的に変更する
 */
function resizeDocument(DropFirstFlg){
// 	// キャンバスのサイズを指定する
// 	var element = document.getElementById("document_canvas");
// 	// context取得
// 	var context = element.getContext('2d');
// 	// キャンバスの内容を初期化する
// 	context.clearRect(0, 0, canvasWidth, canvasHeight);
// 	// キャンバスのサイズを指定する
// 	element.setAttribute("width", canvasWidth);
// 	element.setAttribute("height", canvasHeight);
//
// 	$("div.document_canvas_contents").height(canvasHeight).width(canvasWidth);
// 	// 資料画像のサイズを設定する
// 	$("img#document_img").height(canvasHeight).width(canvasWidth);
//
// 	// 拡大時はスクロールが表示される前提なので、資料のフレームサイズを大きくしない
// 	if($("div#fit_rate").height() >= canvasHeight && $("div#fit_rate").width() >= canvasWidth){
// 		// キャンバスが資料フレーム表示領域より小さい場合はサイズをフィットさせる
// 		$("div#mi_docment_area").height(canvasHeight).width(canvasWidth);
// 		// キャンバスが資料フレーム領域にフィットするのでスクロールを削除する
// 		$("div#mi_docment_area").css("overflow", "");
// 	}else{
// 		// キャンバスが資料フレーム表示領域より大きい場合はスクロールを追加し表示する
// 		$("div#mi_docment_area").css("overflow", "scroll");
// 	}
//
// 	/**
// 	 * 資料をセンター表示する(横軸/縦軸)
// 	 * ただし、資料初期表示のみ
// 	 */
// // 	console.log("left=("+ parseInt($("div#mi_docment_area").css('left')) +")")
// // 	console.log("top=("+ parseInt($("div#mi_docment_area").css('top')) +")")
// 	if (DropFirstFlg==1) {	// 資料初期表示のみ(サムネイルドロップ時)
// 		var area_left = parseInt($('div#mi_docment_area').css('left'));
// 		var area_top = parseInt($('div#mi_docment_area').css('top'));
// 		var fit_width = parseInt($("#fit_rate").width());
// 		var fit_height = parseInt($("#fit_rate").height());
// //console.log("area_left=("+area_left+")")
// //console.log("canvasWidth=("+canvasWidth+")")
// //console.log("canvasWidth=("+ (area_left+canvasWidth) +") fit_width=("+fit_width+")")
// 		if( (area_left+canvasWidth) > fit_width ) {
// //console.log("幅オーバー")
// 			var left = ($("#fit_rate").width() - canvasWidth) / 2;
// 			$("div#mi_docment_area").css('left', left + 'px');
// 		}
// //console.log("canvasHeight=("+ (area_top+canvasHeight) +") fit_width=("+ fit_height +")")
// 		if( (area_top+canvasHeight) > fit_height ) {
// //console.log("高オーバー")
// 			var top = ($("#fit_rate").height() - canvasHeight) / 2;
// 			$("div#mi_docment_area").css('top', top + 'px');
// 		}
// 	}
}

/**
 * ページャーの表示制御
 * @param hideScrollArrowFlg	フラグが立っている場合は資料の移動を非表示にする
 */
function viewPager(hideScrollArrowFlg){
	if(currentDocumentId > 0){
		// キーを作成
		var keyName = "materialId_" + currentDocumentId;
		// ブラウザのセッションストレージからデータ取得
		var mtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));
		// ページの最大数を取得
		var maxPageCount = getDocumentMaxPage();

		if(maxPageCount == 0 || hideScrollArrowFlg == HIDE_ICON_FLG){
			// 資料の中身が0件又は非表示フラグが立っている場合は両方非表示とする
			$("div#mi_scroll_arrow_left").hide();
			$("div#mi_scroll_arrow_right").hide();
		}else{
			// 1ページ目は前には戻れない
			if(currentPage == 1){
				$("div#mi_scroll_arrow_left").hide();
			}else{
				$("div#mi_scroll_arrow_left").css("left", getScrollArrowPosition("left"));
				$("div#mi_scroll_arrow_left").show();
			}
			// 最終ページは次に進めない
			if(currentPage == maxPageCount){
				$("div#mi_scroll_arrow_right").hide();
			}else{
				$("div#mi_scroll_arrow_right").css("left", getScrollArrowPosition("right"));
				$("div#mi_scroll_arrow_right").show();
			}
		}

		// ページの表示切替
		reloadPageNumber();
	}
}

/**
 * 拡大・縮小実行時にキャンバスのサイズを変更する処理
 * サーバーから画像を読み込まず、現在表示している画像を使用し拡大・縮小を行う
 * @returns
 */
function resizeCanvas(requestUserId){
	// 現在のキャンバスデータを取得する
	var canvasObj = document.getElementById("sp_img_canvas");
	var canvasData = canvasObj.toDataURL();
	var canvasImg = new Image();
	canvasImg.onload = function(){
		// 資料のキーを作成
		var keyName = "materialId_" + currentDocumentId;
		var pageKey = "page" + currentPage;
		// ブラウザのセッションストレージからデータ取得する為の変数宣言
		var mtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));
		// 画像のサイズを計算する
		getCanvasSize(mtSessionStorage[keyName]["canvas_document"]["document"][pageKey], (orgCanvasHeight * codumentViewState), (orgCanvasWidth * codumentViewState), (orgCanvasHeight * codumentViewState), (orgCanvasWidth * codumentViewState));
		// キャンバスのサイズを指定する
		resizeDocument(0);
		// context取得
		var context = canvasObj.getContext('2d');
		context.fillStyle = "rgba(255, 255, 255, 0)";
		// 画像を描画
		context.drawImage(canvasImg, 0, 0, canvasWidth, canvasHeight);

		// ダウンロードフラグ
		var downloadFlg = mtSessionStorage[keyName]["material_basic"]["download_flg"];
		// ダウンロードアイコンの制御
		// viewDownloadIcon(downloadFlg)

		// 通知を必要としている場合のみ通知を送る
		if(requestUserId != NO_NOTIFICATION){
			// 相手に自分の資料表示完了通知を行う
			var data = {
					command : "DOCUMENT",
					type : "SHOW_DOCUMENT_COMPLET",
					responseUserId : $('#user_id').val()

			};
			// ページ変更を行ったユーザーにメッセージ送信
			sendCommandByUserId(requestUserId, data);
		}

	};
	canvasImg.src = canvasData;

}

/**
 * 拡大・縮小ボタンの表示制御
 * @param hideExpansionFlg
 * @returns
 */
function viewExpansion(hideExpansionFlg){
	if(hideExpansionFlg){
		$(".left_icon_size").hide();
	}else{
		$(".left_icon_size").show();
	}
}

/**
 * 資料のページ移動ボタンの位置をウインドウ左端からの絶対座標で取得する
 */
function getScrollArrowPosition(type){
	// 資料の表示領域が表示されていないと座標が取れないので一時的に表示する
	var hideFlg = false;
	if(!$("div#mi_docment_area").is(':visible')){
		$("div#mi_docment_area").show();
		hideFlg = true;
	}
	// キャンバス表示領域の座標
	var dosumentCanvasAreaLeft = document.getElementById("document_canvas_area").getBoundingClientRect().left;
	var dosumentCanvasAreaTop = document.getElementById("document_canvas_area").getBoundingClientRect().top;

	// 資料の位置とサイズを取得する
	var windowScrollLeft = 0;
	var docmentAreaScrollLeft = $("div#mi_docment_area").scrollLeft() - windowScrollLeft;		// 画像がスクロールされている事を考慮し、スクロール値を取得(ウインドウ自体がスクロールしている場合があるのでスクロール値を引く)
	//var documentLeft = $("div.document_canvas_area").position().left + docmentAreaScrollLeft;	// 資料表示領域のleft(スクロールしているとLeft値にずれが生じるのでスクロール位置を足す)
	var documentLeft = dosumentCanvasAreaLeft + docmentAreaScrollLeft;							// 資料表示領域のleft(スクロールしているとLeft値にずれが生じるのでスクロール位置を足す)
	var documenWidth = $("div#mi_docment_area").width();										// 資料表示領域のサイズ
	var scrollArrowImageWidth = 60;																// ページ遷移ボタンのサイズ
	var offset = 10;																			// 領域ピッタリになると見栄えが悪いのでオフセット
	var leftIconOffset = 60;																	// ツールバーの領域
	var left = 0;																				// 戻り値

	if(type == "left"){
		left = documentLeft + scrollArrowImageWidth + offset - leftIconOffset;
	}else{
		left = documentLeft + documenWidth - offset - SCROLL_MARGIN - leftIconOffset;
	}
	// 元々非表示だった場合は再度非表示にする
	if(hideFlg){
		$("div#mi_docment_area").hide();
	}
	return left;
}

/**
 * ビデオの映像がドラック&ドロップされた場合は資料の領域を非表示にする
 */
function hideDocument(){
	// 資料の領域が表示時のみ実行
	if($("div#mi_docment_area").is(':visible')){
		$("#negotiation_video_area_squarebox").show();
		// 資料を非表示にする
		hideDocumentCommon();
		// 資料の領域を非表示にする
		$("div#mi_docment_area").hide();

		// 資料レイアウトをリセットする
		resetMaterialLayout();

		// 資料の非表示をゲストへ通知する
		var data = {
				command : "DOCUMENT",
				type : "HIDE_DOCUMENT"
		};
		sendCommand(SEND_TARGET_ALL, data);
	}
}

/**
 * 資料を非表示にする場合の共通処理
 * @returns
 */
function hideDocumentCommon(){
	// 現在表示中の資料IDを初期化する
	currentDocumentId = 0;
	// 現在表示中のページを初期化する
	currentPage = 0;
	// 目次が表示されている場合は初期化
	if($("#mi_contents_display").is(':visible')){
		$("#mi_contents_display").hide();
	}
	// コメントが表示されている場合は初期化
	if($("p.mi_document_note").is(':visible')){
		$("p.mi_document_note").text("");
		$("p.mi_document_note").hide();
	}

	// 目次アイコンを非表示にする
	$("li.left_icon_content").addClass("display_none");

	$("#document_material_id").val("");
	$("#document_uuid").val("");
	$("#document_user_id").val("");
	// 線情報の画像を初期化する
	$("#sp_img_canvas").attr("src", "");
}

/**
 * 最大何ページの何ページ目かを再描画する
 */
function reloadPageNumber(){
	var maxPageCount = getDocumentMaxPage();
	if(maxPageCount == 0){
		// 資料を表示出来る時点で１つは必ず存在するので1を設定する
		maxPageCount = 1;
	}
	// ページの表示を設定する
	$("span.current_page").text(currentPage);
	$("span.max_page").text(maxPageCount);
}

/**
 * 資料の最大ページ数を取得する
 * @returns
 */
function getDocumentMaxPage(){
	var keyName = "materialId_" + currentDocumentId;
	// ブラウザのセッションストレージからデータ取得
	var mtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));
	var maxPageCount = mtSessionStorage[keyName]["material_detail"].length;
	return maxPageCount;
}

/**
 * 現在表示しているページのコメントを取得する
 */
function getMaterialMemo(){
	// keyを作成
	var keyName = "materialId_" + currentDocumentId;
	// ブラウザのセッションストレージからデータ取得
	var mtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));
	// メモを取得
	var materialMemo = "";
	for(var i = 0; i < mtSessionStorage[keyName]["material_detail"].length; i++){
		if(mtSessionStorage[keyName]["material_detail"][i]["material_page"] == currentPage){
			materialMemo = mtSessionStorage[keyName]["material_detail"][i]["material_memo"];
			break;
		}
	}
	return materialMemo;
}

/**
 * 強調ポインターの画像を返す
 * @param drowX
 * @param drowY
 * @returns
 */
function getMousePointTag(drowX, drowY, userId){
	// 強調ポインター
	var mouserImg = '<span id="mouse_point_'+userId+'" class="icon-pointer" style="position:absolute;z-index:26;left:'+drowX+'px;top:'+drowY+'px;background-color:#F3C200;border-radius:50%;"></span>';
	return mouserImg;
}

/**
 * キャンバスに表示している画像を変数に保存する
 */
function saveDocument(){
	// キャンバスのオブジェクト取得
	var saveCanvas = document.getElementById("sp_img_canvas");
	// 現在の表示内容をpng化
	var canvasData = saveCanvas.toDataURL();
	if( !canvasData ) {
		return;
	}

	// ルームID
	var connectionInfoId = $("#connection_info_id").val();
	if( !connectionInfoId ) {
		return;
	}

	// ファイル名を取得
	var pageKey = "page" + currentPage;
	var keyName = "materialId_" + currentDocumentId;
	var mtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));
	if( !mtSessionStorage ) {
		return;
	}
	var fileNames = mtSessionStorage[keyName]["canvas_document"]["document"][pageKey]["fileName"].split(".");
	// キャンバス画像保存用に名前を変更する
	var fileName = fileNames[0] + "-cvs.png";
	// サーバーに画像を転送する
	$.ajax({
		url: "https://" + location.host + "/negotiation/save-material",
		type: "POST",
		data: {canvasData : canvasData, connectionInfoId : connectionInfoId, fileName : fileName},
		success: function(resultJson) {
		}
	});
}

/**
 * 資料のダウンロードボタンの制御
 * @param downloadFlg
 */
function viewDownloadIcon(downloadFlg){
	// キャンバス表示領域のleft値
	var dosumentCanvasAreaLeft = document.getElementById("document_canvas_area").getBoundingClientRect().left;
	// 資料の位置とサイズを取得する
	var windowScrollLeft = 0;
	var docmentAreaScrollLeft = $("div#mi_docment_area").scrollLeft() - windowScrollLeft;		// 画像がスクロールされている事を考慮し、スクロール値を取得(ウインドウ自体がスクロールしている場合があるのでスクロール値を引く)
	//var documentLeft = $("div.document_canvas_area").position().left + docmentAreaScrollLeft;	// 資料表示領域のleft(スクロールしているとLeft値にずれが生じるのでスクロール位置を足す)
	var documentLeft = dosumentCanvasAreaLeft + docmentAreaScrollLeft;							// 資料表示領域のleft(スクロールしているとLeft値にずれが生じるのでスクロール位置を足す)
	var documenWidth = $("div#mi_docment_area").width();										// 資料表示領域のサイズ
	var commentIconOffset = 40;																	// オペレータの場合はコメントが存在するので、コメントが表示する場合のオフセット
	var downloadtIconOffset = 40;																// ダウンロードアイコンを表示する場合のオフセット
	var offset = 40;																			// 領域ピッタリになると見栄えが悪いのでオフセット(アイコンのDIV領域込み)
	var leftIconOffset = 60;																	// ツールバーの領域
	// 資料の最大ページ数を取得する
	var maxPageCount = getDocumentMaxPage();
	if(maxPageCount > 9){
		// 10ページ（2ケタ）を超える場合はoffsetを増やす
		offset = 60;
	}
	// 表示作業
	var left = 0;

	// オペレータの基本位置
	left = documentLeft + documenWidth - offset - SCROLL_MARGIN - leftIconOffset;
	if($('#is_operator').val() == "1" && getMaterialMemo()){
		// コメントアイコン分のオフセットを追加する
		left = left - commentIconOffset;
	}

	// ダウンロードアイコンの制御
	if(downloadFlg == 1){
		// ダウンロードアイコン分のオフセットを追加する
		left = left - downloadtIconOffset;
		// ダウンロードが許可されている場合
		$("div#document_header_icon span.icon-download").show();
	}else{
		// ダウンロードが許可されていない場合
		$("div#document_header_icon span.icon-download").hide();
	}

	// 表示位置を設定する
	$("div#document_header_icon").css("left", left);
}

/**
 * 資料の情報をDICTから削除する
 * @param event
 */
function removeMaterial(event) {
	var localMaterialId = 0;
	try{
		localMaterialId = event.dataTransfer.getData("material_id");
	}catch (e) {
		// IEの場合.setData()でエラーが発生するのでグローバル変数にデータを保持させる
		localMaterialId = dragMaterialId;
	}

	if(localMaterialId){
		if(localMaterialId != currentDocumentId){
			if(window.confirm("資料をサムネイルから削除します。\n手書きの情報は失われます。（ゲスト側も削除されます）")){
				// 削除時IEのローカル変数を初期化
				dragMaterialId = 0;
				var del_keyName = [];
				del_keyName.push(localMaterialId);
				// キーを作成
				var keyName = "materialId_" + localMaterialId;
				// ストレージの資料削除実行
				removeMaterialCommon(keyName, localMaterialId);
				var connectionInfoId = $("#connection_info_id").val();
				$.ajax({
					url: "https://" + location.host + "/negotiation/delete-canvas-material",
					type: "POST",
					dataType: "json",
					data: {connectionInfoId: connectionInfoId, materialIds : del_keyName},
				}).done(function(res) {
				});

				// サムネイル削除をゲストへ通知する（メモリー上の資料を削除する）
				var data = {
						command : "DOCUMENT",
						type : "DELETE_DOCUMENT",
						keyName : keyName,
						localMaterialId : localMaterialId
				};
				sendCommand(SEND_TARGET_ALL, data);
			}
		}else{
			alert("表示中の資料は削除できません。");
		}
	}
	// ブラウザ標準ドロップイベントを削除
	event.preventDefault();
}

/**
 * キーを元に実際に資料の辞書を削除する
 * @returns
 */
function removeMaterialCommon(keyName, localMaterialId) {
// console.log("removeMaterialCommon keyName=("+keyName+") localMaterialId=("+localMaterialId+")");

	// 削除する資料が表示中の場合は非表示にする
	if( $("#document_material_id").val() == localMaterialId ) {
		// 資料を非表示にする
		hideDocumentCommon();
		// 資料の領域を非表示にする
		$("div#mi_docment_area").hide();

		// 資料レイアウトをリセットする
		resetMaterialLayout();
	}

	// ブラウザのセッションストレージからの削除
	sessionStorage.removeItem(keyName);
	// 資料のキーをセッションストレージから削除
	sessionStorageKeys.splice(sessionStorageKeys.indexOf(keyName), 1);
	sessionStorage.setItem("mtSessionStorageKeys", JSON.stringify(sessionStorageKeys));

	// サムネイルの削除
	$("li.thumbnail_image").find("img#"+localMaterialId).remove();
	// 吹き出しアイコンも削除
	$("div.big_thumbnail_area").remove();

	// 表示サムネイルのカウントを取得する
	var thumbnailviewCount = getThumbnailCount();
	// サムネイル数が減少した場合にスクロールのボタンを非表示しulの領域を初期化
	if(thumbnailviewCount <= MAX_THUMBNAIL_VIEW_COUNT){
		hideMoveThumbnailIcon();
	}
}

/**
 * サムネイルをスクロールする為のアイコン表示とULの幅設定
 */
function showMoveThumbnailIcon(thumbnailCount){
	var ulWidth = DEFAULT_THUMBNAIL_UL_WIDTH + ((thumbnailCount - MAX_THUMBNAIL_VIEW_COUNT) * THUMBNAIL_LI_WIDTH);
	$(".mi_document_select ul").width(ulWidth);
	$("div#move_thumbnail_prev").show();
	$("div#move_thumbnail_next").show();
}

/**
 * サムネイルをスクロールする為のアイコン非表示とULの幅初期化
 */
function hideMoveThumbnailIcon(){
	$(".mi_document_select ul").width(DEFAULT_THUMBNAIL_UL_WIDTH);
	$("div#move_thumbnail_prev").hide();
	$("div#move_thumbnail_next").hide();
	// スクロール位置を左にする
	$("div#negotiation_bottom_document_select").scrollLeft(0);
}

/**
 * 表示サムネイルのカウントを取得する
 * @returns
 * ※類いロジックが「negotiation_sysc.js[syncViewThumbnail()]」にも存在するので修正した場合は確認する事！！
 */
function getThumbnailCount(){
	var uuid = localStorage.UUID;
	if( !uuid ) {	// 空
		uuid = UUID.generate();
		localStorage.UUID = uuid;
	}

	// オペレータの場合はsessionStorageKeys.lengthの数がサムネイル数となるが処理の共通化で、権限の数を数える
	var thumbnailviewCount = 0;
	for ( var i = 0; i < sessionStorageKeys.length; i++) {
		// セッションストレージから資料データを取得する
		var mtSessionStorage = $.parseJSON(sessionStorage.getItem(sessionStorageKeys[i]));
		// keyとデータが一致しているかチェック
		if((mtSessionStorage != null) && (sessionStorageKeys[i] in mtSessionStorage)){
			if(uuid == mtSessionStorage[sessionStorageKeys[i]]["UUID"]) {
				thumbnailviewCount++;
			}
		}
	}
	return thumbnailviewCount;
}

/**
 * ウインドウのリサイズに時実行される資料用の関数
 */
function documentResizeEvent(){
	// 資料が表示されている場合のみリサイズ処理を実行する
	if($("div#mi_docment_area").is(':visible') && currentDocumentId != 0){
		// 資料表示領域を設定する
		setOrgCanvasSize();
		// キャンバスのリサイズ処理
		resizeCanvas(NO_NOTIFICATION);
	}
}

/**
 * 展開した資料がURLの場合はURLを返す
 * @returns
 */
function getDocumentUrl(){
	var url = "";
	if($("div#mi_docment_area").is(':visible') && currentDocumentId != 0){
		// キーを作成
		var keyName = "materialId_" + currentDocumentId;
		// ブラウザのセッションストレージからデータ取得
		var mtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));
		if(mtSessionStorage && keyName in mtSessionStorage){
			url = mtSessionStorage[keyName]["material_basic"]["material_url"];
		}
	}
	return url;
}

/**
 * 資料のページ変更時の同期処理
 * １、ページ変更者から表示ページを通知
 * ２、その他ユーザーがページを描画したらページ変更者へメッセージ送信
 * ３、ページ変更者が全員のページ描画メッセージを受け取るか５秒たったら、全員にアイコン表示メッセージ送信
 * ４、全員がページ変更アイコンを表示する
 */
function syncMoveDocument(){
	var syncTimer = MIN_SYNC_TIMER;
	if(Object.keys(mUserIdAndUserInfoArray).length > 0){
		// 現在接続している全ユーザーにページ遷移を通知する（ただし、自分自身は除く）
		for(key in mUserIdAndUserInfoArray){
			if($('#user_id').val() != key){
				// 同期するユーザー情報を保存する
				syncUserDict[key] = NO_RESPONSE_FLG;
				// ページ移動を相手に送信する
				var data = {
						command : "DOCUMENT",
						type : "MOVE_DOCUMENT",
						currentPage : currentPage,
						requestUserId : $('#user_id').val()
				};
				sendCommandByUserId(key, data);
			}
		}
		syncTimer = MAX_SYNC_TIMER;
	}

	// ページ遷移を押下してから10秒間待ち、全員からレスポンスが無ければ強制的に全員のページ変更アイコンを表示する(全員からレスポンスがあればキャンセルする)
	syncDocumentTimeoutId = setTimeout(function (){
		// 同期ユーザーの初期化
		syncUserDict = {};
		// タイマーIDの初期化
		syncDocumentTimeoutId = null;
		// 全員のページ変更アイコンと拡大アイコンを表示
		allShowDocumentMoveIcon();
	} , syncTimer);

	// データコネクションの状態を調べる
	dataConnectionRequestAck();
}

/**
 * 資料の拡大・縮小時の同期処理
 * １、ページ変更者から拡大・縮小を通知
 * ２、その他ユーザーがページを拡大・縮小したらページ変更者へメッセージ送信
 * ３、ページ変更者が全員のページ拡大・縮小メッセージを受け取るか５秒たったら、全員にアイコン表示メッセージ送信
 * ４、全員が拡大・縮小アイコンを表示する
 */
function syncChangeSizeDocument(){
	var syncTimer = MIN_SYNC_TIMER;
	if(Object.keys(mUserIdAndUserInfoArray).length > 0){
		// 現在接続している全ユーザーにページ遷移を通知する（ただし、自分自身は除く）
		for(key in mUserIdAndUserInfoArray){
			if($('#user_id').val() != key){
				// 同期するユーザー情報を保存する
				syncUserDict[key] = NO_RESPONSE_FLG;

				// ページ拡大縮小を相手に送信する
				var data = {
						command : "DOCUMENT",
						type : "CHANGE_DOCUMENT_SIZE",
						codumentViewState : codumentViewState,
						requestUserId : $('#user_id').val()
				};
				sendCommandByUserId(key, data);
			}
		}
		syncTimer = MAX_SYNC_TIMER;
	}
	// ページ遷移を押下してから10秒間待ち、全員からレスポンスが無ければ強制的に全員のページ変更アイコンを表示する(全員からレスポンスがあればキャンセルする)
	syncDocumentTimeoutId = setTimeout(function (){
		// 同期ユーザーの初期化
		syncUserDict = {};
		// タイマーIDの初期化
		syncDocumentTimeoutId = null;
		// 全員のページ変更アイコンと拡大アイコンを表示
		allShowDocumentMoveIcon();
	} , syncTimer);

	// データコネクションの状態を調べる
	dataConnectionRequestAck();
}


/**
 * 全員の資料ページ変更アイコンを表示する
 */
function allShowDocumentMoveIcon(){
	// 拡大アイコンを表示する
	viewExpansion(SHOW_ICON_FLG);
	// 他のユーザーのページ変更アイコン表示メッセージ
	// サムネイル削除をゲストへ通知する（メモリー上の資料を削除する）
	var data = {
			command : "DOCUMENT",
			type : "SHOW_DOCUMENT_ICON"
	};
	sendCommand(SEND_TARGET_ALL, data);
}

/**
 * ウインドウリサイズやウインドウスクロールを行った際に
 * 資料のアイコンの位置を調整する処理
 * @returns
 */
function redisplayDocumentIcon(){
	// 資料が表示されている場合は、ページ変更ボタンなどの位置を変更する
	if($("div#mi_docment_area").is(':visible') && !$("#negotiation_sync_message_area").isShow()){
		// 資料のキーを作成
		var keyName = "materialId_" + currentDocumentId;
		// ブラウザのセッションストレージからデータ取得
		mtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));
		if(mtSessionStorage && keyName in mtSessionStorage){
			// ダウンロードアイコンフラグ取得
			downloadFlg = mtSessionStorage[keyName]["material_basic"]["download_flg"];
			// ダウンロードアイコンの表示制御
			// viewDownloadIcon(downloadFlg);
		}
	}
}

/**
 * 資料のリサイズと移動イベントを付与する処理
 * @returns
 */
function addDocumentAreaOperation(){
	// 資料領域の移動時
	var viewLeftPager = false;
	var viewRightPager = false;
	$("div#mi_docment_area").draggable({
		containment: "#mi_video_area",
		scroll: false,
		snapMode: "inner",
		start: function(event, ui) {
			// ページ変更アイコンの状態を保持する
			if($("#mi_scroll_arrow_left").is(':visible')){
				viewLeftPager = true;
				$("#mi_scroll_arrow_left").hide();
			}
			if($("#mi_scroll_arrow_right").is(':visible')){
				viewRightPager = true;
				$("#mi_scroll_arrow_right").hide();
			}
			// ページ・コメント・ダウンロードアイコンを非表示化
			$("#document_header_icon").hide();
		},
		stop: function(event, ui) {
			// ページ変更アイコンの表示制御
			if(viewLeftPager){
				$("#mi_scroll_arrow_left").show();
				viewLeftPager = false;
			}
			if(viewRightPager){
				$("#mi_scroll_arrow_right").show();
				viewRightPager = false;
			}
			// ページャーの表示切替
			viewPager(SHOW_ICON_FLG);
			// ページ・コメント・ダウンロードアイコンの表示位置変更
			var keyName = "materialId_" + currentDocumentId;
			var mtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));
			var downloadFlg = mtSessionStorage[keyName]["material_basic"]["download_flg"];
			// viewDownloadIcon(downloadFlg);
			// ページ・コメント・ダウンロードアイコンを表示
			$("#document_header_icon").show();
		}
	});
}

/**
 * リサイズアイコンを変更する
 * @param bottom	スクロールのTOP位置
 * @param right		スクロールのLEFT位置
 * @param resetFlg	1:初期化, 0:位置変更
 * @returns
 */
function changeResizeIconOffset(bottom, right, resetFlg){
	if(resetFlg){
		// リサイズアイコンのstyleを初期化する
		$("div#mi_docment_area").find(".ui-resizable-se").removeAttr('style');
		$("div#mi_docment_area").find(".ui-resizable-se").css("z-index", 90);
		// スクロール位置をリセットする
		$("div#mi_docment_area").scrollTop(0);
		$("div#mi_docment_area").scrollLeft(0);
	}else{
		// リサイズアイコンの位置を変更する
		if(bottom > 0){
			bottom = (-bottom) + 1;	// 初期値が + 1なのでスクロールの値に足す(スクロールは0から始まるので)
		}else{
			bottom = 1;
		}
		if(right > 0){
			right = (-right) + 1;	// 初期値が + 1なのでスクロールの値に足す(スクロールは0から始まるので)
		}else{
			right = 1;
		}
		// スクロールTOPは+の値になっているので、-に変換して設定する
		$("div#mi_docment_area").find(".ui-resizable-se").css("bottom", bottom);
		// スクロールLEFTは+の値になっているので、-に変換して設定する
		$("div#mi_docment_area").find(".ui-resizable-se").css("right", right);
	}
}

/**
 * 相手から送信された資料情報を受取る関数
 * @param json
 */
// ゲストが現在表示している資料のハッシュキー
//var guestCurrentMaterialIdHash = "";		// 資料を特定する為のmaterial_idのmd5値
//var guestCurrentDocumentMaxCount = 0;		// 資料の最大ページ数
//var guestOperatorVideoTop = 0;			// オペレータのビデオが表示されていたTOP値（資料終了後に戻すため）
//var guestDocumentUrl = "";				// 資料がURLの場合はURLが設定される
//var guestCurrentMaterialDownloadFlg = 0;	// 資料をダウンロード出来るかどうかのフラグ
function receiveDocumentJson(json){
	if(json.type == "INIT_DOCUMENT"){
		// 送信されたデータを保存
		var keyName = json.keyName;
		var mtSessionStorageJson = json.mtSessionStorage;

		if( sessionStorageKeys.indexOf(keyName) >= 0 ) {
		} else {
			// keyの配列に存在しない場合は追加する
			sessionStorageKeys.push(keyName);
			sessionStorage.setItem("mtSessionStorageKeys", JSON.stringify(sessionStorageKeys));
		}

		// 資料が初めて表示の場合のみDICTにarrayを設定する（このarrayはペン等でいじったデータを保存用）
		sessionStorage.setItem(json.keyName, mtSessionStorageJson);

	}else if(json.type == "SHOW_DOCUMENT"){
		// ユーザー一覧ダイアログ表示中の場合は閉じる
		if($('#room-userlist-dialog').hasClass("ui-dialog-content") && $('#room-userlist-dialog').dialog('isOpen')) {
			$('#room-userlist-dialog').dialog('close');
		}
		// 資料を非表示にする
		hideDocumentCommon();
		// 表示する資料のIDとページを保存する
		currentDocumentId = json.currentDocumentId;
		currentPage = json.currentPage;
		// 資料を表示する
		showDocumentCommon(json.documentCanvasLeft, json.documentUrlFlg, json.document_user_id, json.documentUuId, json.documentMaterialId);

		// 資料レイアウトをリセットする
		resetMaterialLayout();
		// MCU　横一列レイアウトへ配信
//		publishHorizontalVideo();
	}else if(json.type == "MOVE_DOCUMENT"){
		// 表示するページを設定
		currentPage = json.currentPage;
		// 資料を表示
		loadDocument(json.requestUserId, 0);
		// ページャーの表示切替
		//viewPager(HIDE_ICON_FLG);
	}else if(json.type == "RESET_PEN"){
		// ペンの書き込みをリセット
		resetPen();
	}else if(json.type == "SCROLL_DOCUMENT"){
		// 資料の表示割合を計算する
		var proportionSize = getProportion();

		// 他ユーザーのスクロールを同期中のフラグを立てる
		syncMaterialScrollFlg = 1;
		// スクロール位置を変更
		$("div#mi_docment_area").scrollTop((json.scrollTop * proportionSize));
		$("div#mi_docment_area").scrollLeft((json.scrollLeft * proportionSize));

		// リサイズアイコンの位置を変更する
		changeResizeIconOffset(json.scrollTop * proportionSize, json.scrollLeft * proportionSize, 0);
	}else if(json.type == "HIDE_DOCUMENT"){
		// 資料を非表示にする
		hideDocumentCommon();
		// 資料の領域を非表示にする
		$("div#mi_docment_area").hide();

		// ビデオレイアウトのリセット
		$.each(NEGOTIATION.videoArray.show,function(){
			var tagName = "#negotiation_target_video_" + $(this).data("id");
			$(tagName).find(".video_big_icon").trigger('click');
			return false;
		});
		// 資料レイアウトをリセットする
		resetMaterialLayout();

	}else if(json.type == "MOUSE_POINTER"){
		if($("div#sp_document_area").is(':visible') && currentDocumentId != 0){

			for (var i = 0; i < json.position.length; i++)
			{

				// 資料の表示割合を計算する
				var proportionSize = getProportion();
				// 線を描いた人の比率と自分の比率を考慮し計算を行う
				var proportionDrowX = json.position[i].drowX * proportionSize;
				var proportionDrowY = json.position[i].drowY * proportionSize;
				var proportionOnMouseX = json.position[i].onMouseX * proportionSize;
				var proportionOnMouseY = json.position[i].onMouseY * proportionSize;

				// キャンバスの外に要素を配置しているので、キャンバスの場所を特定しその差を足す
				var element = document.getElementById("sp_img_canvas");
				var rect = element.getBoundingClientRect();
				// 要素の位置座標を計算
				var positionX = rect.left + window.pageXOffset ;	// 要素のX座標
				var positionY = rect.top + window.pageYOffset ;		// 要素のY座標
				// 要素の左上からの距離を計算
				var drowX = proportionDrowX + positionX;
				var drowY = proportionDrowY + positionY;
				// 強調ポインターが画像になったので、画像の大きさ分座標を調整する(constでやっていたが、ブラウザーごとに違うので、マジックナンバーで対応に変更)
				if(USER_PARAM_BROWSER == "Chrome"){
					drowX = drowX + 8;
					drowY = drowY - 10;
				}else if(USER_PARAM_BROWSER == "IE"){
					drowX = drowX + 10;
					drowY = drowY - 5;
				}else{
					drowX = drowX + 10;
					drowY = drowY - 10;
				}

				// 相手が強調ポインターの場合のみ画面にポインター表示を行う
				var mousePointName = "span#mouse_point_" + json.userId;
				if(json.position[i].selectLeftTool == TOOL_CURSORE_EMPHASIS){
					// カーソル要素が存在するか調べる
					if($(mousePointName).length){
						// 要素が存在する場合
						$(mousePointName).offset({ top: drowY, left: drowX });
					}else{
						// 要素が存在しない場合は要素を追加
						var mouserImg = getMousePointTag(drowX, drowY, json.userId);
						$(".sp_document_content").append(mouserImg);
					}
				}else{
					// 強調ポインター以外の場合はカーソルアイコンを削除する
					$(mousePointName).remove();
				}
				// オペレータが線を書いている場合はゲストの画面に線を引く
				if(json.position[i].writeLineFlg){
					// 線を描いた人の比率と自分の比率を考慮し計算を行う
					writeLine("sp_img_canvas", proportionDrowX, proportionDrowY, proportionOnMouseX, proportionOnMouseY, json.position[i].line, json.position[i].color, json.position[i].selectLeftTool);
				}
			}
		}
	}else if(json.type == "SAVE_DOCUMENT"){
		// 画像を保存する為のイベント
		saveDocument();
	}else if(json.type == "DELETE_DOCUMENT"){
		// ブラウザのセッションストレージからの削除とサムネイルの制御
		removeMaterialCommon(json.keyName, json.localMaterialId);
	}else if(json.type == "SHOW_DOCUMENT_COMPLET"){
		// 資料の描画完了ユーザーを保存する
		syncUserDict[json.responseUserId] = RESPONSE_FLG;
		// レスポンス状況を調べる
		var allSyncFlg = true;
		for(key in syncUserDict){
			if(syncUserDict[key] == NO_RESPONSE_FLG){
				// 同期が終わっていないユーザーがいる場合は待つ
				allSyncFlg = false;
				break;
			}
		}
		// 全員からレスポンスがあった場合は全員に資料のページ変更ボタンを出すメッセージを送信する
		if(allSyncFlg){
			// 同期ユーザーの初期化
			syncUserDict = {};

			// タイマーをキャンセルする
			if(syncDocumentTimeoutId != null){
				clearTimeout(syncDocumentTimeoutId);
				syncDocumentTimeoutId = null;
			}
			// 全員のページ変更アイコンを表示する
			allShowDocumentMoveIcon();
		}
	}else if(json.type == "SHOW_DOCUMENT_ICON"){
		// 拡大アイコンを表示する
		viewExpansion(SHOW_ICON_FLG);
	}else if(json.type == "UPLOAD_DOCUMENT_BEGIN"){
		// 他のユーザーがアップロードを開始(material_upload.js)
		disableUploadDocument();
		$("div.upload_document_message").text("アップロード中です");
		$("div.upload_document_message_area").show();
	}else if(json.type == "UPLOAD_DOCUMENT_END"){
		// 他のユーザーがアップロードを完了(material_upload.js)
		enableUploadDocument();
		$("div.upload_document_message").text("アップロード完了しました");
		setTimeout(function(){
			$("div.upload_document_message_area").hide();
		}, MESSAGE_TIMER);
		// オペレーターの場合は資料をサーバーから読み込む
		if ($('#is_operator').val() == "1") {
			if(json.resultMaterialId != 0){
				// サーバーから資料を１件取得する
				getMaterial(json.resultMaterialId, json.registUserId, json.staff_type, json.staff_id, json.client_id, json.uu_id);
				// tooltip表示
				$('.material_button_tooltip').tooltipster('open');
				// アップロードメッセージを消すためのタイマーを設定
				setTimeout(function(){
					$('.material_button_tooltip').tooltipster('close');
				}, MESSAGE_TIMER);
			}else{
				alert("ゲストの資料アップロードが失敗しました。");
			}
		}
	}else if(json.type == "CHANGE_DOCUMENT_SIZE"){
		// 拡大アイコンを非表示にする
		viewExpansion(HIDE_ICON_FLG);

		// 送信された現在の拡縮値を設定
		codumentViewState = json.codumentViewState;

		// 現在コメントを表示しているか判定(オペレーターのみ)
		var commentViewFlg = 0;
		if($('#is_operator').val() == "1" && $("p.mi_document_note").is(':visible')){
			commentViewFlg = 1;
		}

		// キャンバスの拡大・縮小処理
		resizeCanvas(json.requestUserId);

		// 資料を再描画するとコメントが消えるので、拡大・縮小前にコメントを表示していた場合は再度表示させる(オペレーターのみ)
		if($('#is_operator').val() == "1" && commentViewFlg == 1){
			$("p.mi_document_note").show();
		}

		if(codumentViewState == MAX_EXPANSION_VALUE){
			$("li.left_icon_size div#icon-expansion").hide();
			$("li.left_icon_size div#icon-reduction").show();
		}else{
			$("li.left_icon_size div#icon-expansion").show();
			$("li.left_icon_size div#icon-reduction").hide();
		}

		// 拡大値の初期値となる1の場合はリサイズアイコンを初期化する
		if(codumentViewState == 1){
			// 縮小時はリサイズアイコンの位置を初期化
			changeResizeIconOffset(0, 0, 1);
		}
	}else if(json.type == "REQUEST_ACK"){
		// 通知を受け取ったユーザーは発信者に返す
		var data = {
				command : "DOCUMENT",
				type : "RESPONCE_ACK",
				responseUserId : $('#user_id').val()
		};
		// ページ変更を行ったユーザーにメッセージ送信
		sendCommandByUserId(json.requestUserId, data);
	}else if(json.type == "RESPONCE_ACK"){
		// 通知の応答があったユーザーを保存する
		ackUserDict[json.responseUserId] = RESPONSE_FLG;
		// レスポンス状況を調べる
		var allAckFlg = true;
		for(key in ackUserDict){
			if(ackUserDict[key] == NO_RESPONSE_FLG){
				// 同期が終わっていないユーザーがいる場合は待つ
				allAckFlg = false;
				break;
			}
		}
		// 全員からレスポンスがあった場合は全員に資料のページ変更ボタンを出すメッセージを送信する
		if(allAckFlg){
			// 同期ユーザーの初期化
			ackUserDict = {};
			// タイマーをキャンセルする
			if(ackTimeoutId != null){
				clearTimeout(ackTimeoutId);
				ackTimeoutId = null;
			}
			console.log("responce all user");
		}
	}else if(json.type == "SP_UPLOAD_DOCUMENT_END"){
		// SP用のサーバーから資料を１件取得する処理
		spShowMaterial(json.resultMaterialId, json.registUserId, json.staff_type, json.staff_id, json.client_id, json.uu_id);
		loadDocument(NO_NOTIFICATION, 0);
	}else if(json.type == "SP_HIDE_DOCUMENT"){
		// 自分の画像を閉じる
		hidePhotoImg();
	}else if(json.type == "INIT_AND_SHOW_DOCUMENT"){
		// ==============================================================
		// 資料を初期化し表示まで行う（INIT_DOCUMENTとSHOW_DOCUMENTを実行する）
		// ==============================================================
		// 送信されたデータを保存
		var keyName = json.keyName;
		var mtSessionStorageJson = json.mtSessionStorage;

		if( sessionStorageKeys.indexOf(keyName) >= 0 ) {
		} else {
			// keyの配列に存在しない場合は追加する
			sessionStorageKeys.push(keyName);
			sessionStorage.setItem("mtSessionStorageKeys", JSON.stringify(sessionStorageKeys));
		}
		// 資料が初めて表示の場合のみDICTにarrayを設定する（このarrayはペン等でいじったデータを保存用）
		sessionStorage.setItem(json.keyName, mtSessionStorageJson);

		// 表示端末により資料の表示方法を変更する
		var mtSessionStorage  = $.parseJSON(mtSessionStorageJson);
		// 連想配列のままだと引数の記述で長くなるので、ローカル変数に代入
		var userId = mtSessionStorage[keyName]["userId"];
		var staffType = mtSessionStorage[keyName]["staff_type"];
		var staffId = mtSessionStorage[keyName]["staff_id"];
		var clientId = mtSessionStorage[keyName]["client_id"];
		var uuId = mtSessionStorage[keyName]["UUID"];
		// ==============================================================
		// SPの表示処理
		// ==============================================================
		spShowMaterial(json.documentId, userId, staffType, staffId, clientId, uuId);
		loadDocument(NO_NOTIFICATION, 0);
		// MCU
//		publishHorizontalVideo();

	} else if (json.type == "CLOSE_DOCUMENT"){
		if($("div#mi_docment_area").is(':visible')){
			// 資料を非表示にする
			hideDocumentCommon();
			// 資料の領域を非表示にする
			$("div#mi_docment_area").hide();

			// 資料レイアウトをリセットする
			resetMaterialLayout();

			$("#header_video_reset").trigger('click');　// レイアウトを元に戻す.
		}
	}
}

/**
 * 資料を表示する共通処理
 * 同期処理で呼び出されるため関数化
 * @returns
 */
function showDocumentCommon(documentCanvasLeft, documentUrlFlg, documentUserId, documentUuId, documentMaterialId){
	// // 拡大表示をリセット
	// codumentViewState = 1;	// [1:縮小, 1.7:拡大1, 2.4:拡大2, 3.1:拡大3]
	// $("li.left_icon_size div#icon-expansion").show();
	// $("li.left_icon_size div#icon-reduction").hide();
	//
	// // ビデオを表示するために先に資料表示領域を表示
	// $("div#mi_docment_area").show();

	// 資料を表示し、ビデオを資料用のビデオに変更する
	//	LayoutCtrl.apiSetMaterial();
	// 2018/04/25 太田
	LayoutCtrl.apiSetMaterial2();
	// MCU
	$("#negotiation_video_area_squarebox").hide();

	$("#document_user_id").val(documentUserId);
	$("#document_material_id").val(documentMaterialId);
	$("#document_uuid").val(documentUuId);

	// キャンバスに資料を表示する
	loadDocument(NO_NOTIFICATION, 1);

	// URLの場合はページャーを削除し、ダウンロード等を消す
	if(documentUrlFlg){
		// ダウンロードアイコンを非表示にする
		$("div#document_header_icon").hide();
	}else{
	}

	$("#header_video_reset").trigger('click');　// レイアウトを元に戻す.
}

/**
 * 現在データコネクションが接続されているメンバー全員に対し要求を投げる
 * その後、レスポンスを受け誰と接続しているかを確認する
 * @returns
 */
var ackUserDict = {};		// 自分がデータコネクションの接続を確立しているユーザー
function dataConnectionRequestAck(){
	if(Object.keys(ackUserDict).length == 0){
		var syncTimer = MIN_SYNC_TIMER;
		if(Object.keys(mUserIdAndUserInfoArray).length > 0){
			var keyStr = "";
			// 現在接続している全ユーザーにページ遷移を通知する（ただし、自分自身は除く）
			for(key in mUserIdAndUserInfoArray){
				if($('#user_id').val() != key){
					// 同期するユーザー情報を保存する
					ackUserDict[key] = NO_RESPONSE_FLG;
					// ページ移動を相手に送信する
					var data = {
							command : "DOCUMENT",
							type : "REQUEST_ACK",
							requestUserId : $('#user_id').val()
					};
					sendCommandByUserId(key, data);
					// キーを文字列にして保存する
					keyStr += "["+key+"]";
				}
			}
			syncTimer = MAX_SYNC_TIMER;
			console.log("request user "+keyStr);
		}

		// ページ遷移を押下してから10秒間待つ
		ackTimeoutId = setTimeout(function (){
			for(key in ackUserDict){
				if(ackUserDict[key] == NO_RESPONSE_FLG){
					console.log(key + " no responce");
				}
			}
			// 同期ユーザーできていないユーザーを出力する
			ackUserDict = {};
			// タイマーIDの初期化
			ackTimeoutId = null;
		} , syncTimer);
	}
}

/**
 * レイアウトをリセットする処理の実体
 */
function resetLayout(){
	// ビデオレイアウトのリセット
	$.each(NEGOTIATION.videoArray.show,function(){
		// ビデオタグのstyleを削除する（移動やリサイズすると付与される）
		this.removeAttr('style');
		// ビデオタグを表示するためにstyleを付与する
		this.css("display", "block");
	});
	// 資料のリセット
	if($("div#mi_docment_area").is(':visible') && currentDocumentId != 0){
		// 資料タグのstyleを削除する（移動やリサイズすると付与される）
		$("div#mi_docment_area").removeAttr('style');
		// 資料タグを表示するためにstyleを付与する
		$("div#mi_docment_area").css("display", "block");
		// アイコンなどの表示位置をリセットする
		documentResizeEvent();
	}
}
/**
 * 資料リセット
 */
function resetMaterialLayout(){
	// ビデオレイアウトのリセット
	$.each(NEGOTIATION.videoArray.show,function(){
// Video画面のレイアウトは変更しないため処理削除(コメント)
// 2018/04/20 太田
//		// ビデオタグのstyleを削除する（移動やリサイズすると付与される）
//		this.removeAttr('style');
		// ビデオタグを表示するためにstyleを付与する
		this.css("display", "block");
	});

	// 資料のリセット
	if($("div#mi_docment_area").is(':visible') && currentDocumentId != 0){
		// 資料タグのstyleを削除する（移動やリサイズすると付与される）
		$("div#mi_docment_area").removeAttr('style');
		// 資料タグを表示するためにstyleを付与する
		$("div#mi_docment_area").css("display", "block");
		// アイコンなどの表示位置をリセットする
		documentResizeEvent();
	}
}

/**
 * 資料の表示を閉じて情報をDICTから削除する
 */
function hideAndRremoveMaterial(material_id) {
	var localMaterialId = material_id;
  	hideDocument();

	if(localMaterialId){
		if(localMaterialId != currentDocumentId){
			// キーを作成
			var keyName = "materialId_" + localMaterialId;
			// ストレージの資料削除実行
			removeMaterialCommon(keyName, localMaterialId);

			// サムネイル削除をゲストへ通知する（メモリー上の資料を削除する）
			var data = {
					command : "DOCUMENT",
					type : "DELETE_DOCUMENT",
					keyName : keyName,
					localMaterialId : localMaterialId
			};
			sendCommand(SEND_TARGET_ALL, data);
		}else{
			//console.log("表示中の資料は削除できません。");
		}
	}
}

/**
 * 資料サムネイルを表示する
 * @returns
 * ※類いロジックが「material.js[getThumbnailCount()]」にも存在するので修正した場合は確認する事！！
 */
function viewThumbnail(){

	var uuid = localStorage.UUID;
	if( !uuid ) {	// 空
		uuid = UUID.generate();
		localStorage.UUID = uuid;
	}

	// サムネイル領域の初期化
	$("div.mi_document_select ul").empty();
	if( sessionStorageKeys.length > 0 ) {
		var thumbnailviewCount = 0;
		for ( var i = 0; i < sessionStorageKeys.length; i++) {
			var keyName = sessionStorageKeys[i];
			// セッションストレージから資料データを取得する
			var mtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));
			if( mtSessionStorage ){
				/***
				 * ゲストの場合(ローカルストレージのUUIDで判定)
				 */
				if( uuid == mtSessionStorage[keyName]["UUID"] ) {
					// サムネイル画像のパスを作成
					var ext = (mtSessionStorage[keyName]["material_basic"]["material_ext"] == '') ? 'jpg' : mtSessionStorage[keyName]["material_basic"]["material_ext"];
					var filePath = "/cmn-data/" + mtSessionStorage[keyName]["material_basic"]["md5_file_key"] + "-1." + ext;
					// サムネイルのタグを作成
					var thumbnailTag = '<li class="thumbnail_image"><img src="'+filePath+'" alt="'+ mtSessionStorage[keyName]["material_basic"]["material_name"] +'" class="mi_document_icon"  id="'+mtSessionStorage[keyName]["material_basic"]["material_id"]+'" draggable="true" ondragstart="materialDragStart(event)" /></li>';
					// サムネイル画像の追加
					$("div.mi_document_select ul").append(thumbnailTag);
					// サムネイルの表示数をカウントアップする
					thumbnailviewCount++;
				}
			}
		} // for_end

		// サムネイル数が増えた場合にスクロールのボタンを表示しulの領域を増やす
		if(thumbnailviewCount > MAX_THUMBNAIL_VIEW_COUNT){
			showMoveThumbnailIcon(thumbnailviewCount);
		}
	}
}

/**
 * SP用のサーバーから資料を１件取得し表示する処理
 * 商談画面へUPしたユーザ情報(staffType, staffId, clientId)
 * @param localMaterialId
 * @param registUserId
 * @param staffType
 * @param staffId
 * @param clientId
 * @param uuId
 * @returns
 */
function spShowMaterial(localMaterialId, registUserId, staffType, staffId, clientId, uuId){
	var connectionInfoId = $("#connection_info_id").val();
	// サーバーから資料の情報を取得する
	$.ajax({
		url: "https://" + location.host + "/negotiation/get-material",
		type: "GET",
		data: { materialId : localMaterialId, clientId : clientId, staffType : staffType, staffId : staffId, connectionInfoId : connectionInfoId},
		success: function(resultJson) {
			// jsonをオブジェクトに変換
			var result = $.parseJSON(resultJson);
			if(result["status"] == 1){
				//console.log(resultJson);
				// 資料の存在するフォルダパス
				var documentPath = "/negotiation_document/negotiation_"+ $("#connection_info_id").val() + "/";
				// ファイル名取得（SPからの表示は画像が一つのみなので先頭ページを参照する）
				var fileName =  result["material_detail"][0]["material_filename"];
				// 乱数の文字を取得
				var uuid = UUID.generate();
				var uniqueStr = uuid.replace(/\-/g, '');
				// 参照する画像のURLを生成する
				var fileUrl = documentPath + fileName + "?" + uniqueStr;
				// 画像を読み込み表示する
				var photoImg = new Image();
				photoImg.onload = function() {
					// 読み込んだ画像を表示する
					viewDocumentImage(photoImg, fileUrl, "#sp_img_document");
				}
				photoImg.src = fileUrl;

			}else{
				alert("資料を取得できませんでした。");
			}
		}
	});
}
/**
 * SP用サーバーから資料を読み込む
 * @param localMaterialId
 * @param registUserId
 * @param staffType
 * @param staffId
 * @param clientId
 * @param uuId
 * @returns
 */
function spLoadAndShowMaterial(localMaterialId, registUserId, staffType, staffId, clientId, uuId){

	var connectionInfoId = $("#connection_info_id").val();

	// サーバーから資料の情報を取得する
	$.ajax({
		url: "https://" + location.host + "/negotiation/get-material",
		type: "GET",
		data: { materialId : localMaterialId, clientId : clientId, staffType : staffType, staffId : staffId, connectionInfoId : connectionInfoId},
		success: function(resultJson) {
			// jsonをオブジェクトに変換
			var result = $.parseJSON(resultJson);
			if(result["status"] == 1){
				// 資料情報をサーバーから読み込む初期化処理
				spLoadDocumentInfo(result, registUserId, staffType, staffId, clientId, uuId);
				loadDocument(NO_NOTIFICATION, 0);
			}else{
				alert("資料を取得できませんでした。");
			}
		}
	});
}
/**
 * 自分の資料情報設定と他のユーザーに資料の初期化と表示を依頼する
 * @param result
 * @param registUserId
 * @param staffType
 * @param staffId
 * @param clientId
 * @param uuid
 * @returns
 */
function spLoadDocumentInfo(result, registUserId, staffType, staffId, clientId, uuid){
	try{

		var materialId = result["material_basic"]["material_id"];

		// モーダルの内容を削除する
		$("div.inner-wrap").empty();
		// モーダルを閉じる
		$("#modal-content").hide();

		// 資料IDを変数に保存する
		keyName = "materialId_" + materialId;
		mtSessionStorage = {};
		mtSessionStorage[keyName] = result;

		//　ユーザ情報追加(staffType/staffId/clientId)
		mtSessionStorage[keyName]["staff_type"] = staffType;
		mtSessionStorage[keyName]["staff_id"] = staffId;
		mtSessionStorage[keyName]["client_id"] = clientId;
		mtSessionStorage[keyName]["UUID"] = uuid;

		// キャンバスで変更データを保存用の領域作成
		mtSessionStorage[keyName]["userId"] = registUserId;
		mtSessionStorage[keyName]["canvas_document"] = {};
		mtSessionStorage[keyName]["canvas_document"]["hashKey"] = result["material_basic"]["md5_file_key"];
		mtSessionStorage[keyName]["canvas_document"]["maxCount"] = result["material_detail"].length;
		mtSessionStorage[keyName]["canvas_document"]["document"] = {};

		// 資料データを保存するための領域を作成する
		for (var i = 0; i < result["material_detail"].length; i++) {
			var pageKey = "page" + result["material_detail"][i]["material_page"];
			mtSessionStorage[keyName]["canvas_document"]["document"][pageKey] = {};
			mtSessionStorage[keyName]["canvas_document"]["document"][pageKey]["img"] = "";
			mtSessionStorage[keyName]["canvas_document"]["document"][pageKey]["fileName"] = result["material_detail"][i]["material_filename"];
			mtSessionStorage[keyName]["canvas_document"]["document"][pageKey]["orgHeight"] = 0;
			mtSessionStorage[keyName]["canvas_document"]["document"][pageKey]["orgWidth"] = 0;
		}

		// 資料のデータをセッションストレージに保存
		sessionStorage.setItem(keyName, JSON.stringify(mtSessionStorage));
		// 資料のキーをセッションストレージに保存
		if( sessionStorageKeys.indexOf(keyName) >= 0 ) {
		} else {
			// keyの配列に存在しない場合は追加する
			sessionStorageKeys.push(keyName);
			sessionStorage.setItem("mtSessionStorageKeys", JSON.stringify(sessionStorageKeys));
		}

		// 資料の初期化と表示を行う
		var data = {
				command : "DOCUMENT",
				type : "INIT_AND_SHOW_DOCUMENT",
				keyName : keyName,
				mtSessionStorage : JSON.stringify(mtSessionStorage),
				documentId : materialId,
				currentPage : 1,
				documentUrlFlg : 0,
				documentCanvasLeft : 150
		};
		sendCommand(SEND_TARGET_ALL, data);

		// ============================================================================================================================
		// 資料の存在するフォルダパス
		var documentPath = "/negotiation_document/negotiation_"+ $("#connection_info_id").val() + "/";
		var uniqueStr = UUID.generate().replace(/\-/g, '');
		// SPから写真をアップした場合はページは１つしかないので、添字の0を指定する
		var canvasName = result["material_detail"][0]["material_filename"].split(".")[0] + "-cvs.png";
		// 線情報を取得用にcvsファイル名を作成する(spCanvasUrl変数はmaterial.js内に宣言してある)
		spCanvasUrl = documentPath + canvasName + "?" + uniqueStr;
		// ============================================================================================================================

	}catch (e) {
		if ($('#is_operator').val() == "1") {
			// 同期メッセージの表示領域にメッセージを表示
			$("#no_save_document_message_area").show();
			setTimeout(function (){
				// 5秒後にメッセージを削除
				$("#no_save_document_message_area").hide();
			} , MESSAGE_TIMER);
		}
	}
}

/**
* 資料へのペンの書き込みをリセットする
*/
function resetPen() {
	// コンテキストを取得
	var canvas = document.getElementById("sp_img_canvas");
	var context = canvas.getContext('2d');
	// 資料の高さ、横幅の取得
	var documentHeight = canvas.scrollHeight;
	var documentWidth = canvas.scrollWidth;
	// 現在の透過を取得する
	var tmpGlobalAlpha = context.globalAlpha;
	// 透過情報を初期化する
	context.globalAlpha = 1.0;
	// 塗りつぶしの色を設定
	context.fillStyle  = "#ffffff";  // なんでもOK
	context.globalCompositeOperation = 'destination-out';
	// 初期化
	context.fillRect(0, 0, documentWidth, documentHeight);
	// 透過情報を戻す
	context.globalAlpha = tmpGlobalAlpha;
}
