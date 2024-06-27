/*
 * ホワイトボードに使用するJS群
 *
 * */
//var whiteBoardWidth = $(window).width();						// キャンバスのサイズ幅
//var whiteBoardHeight = Math.floor($(window).height() * 0.96);	// キャンバスのサイズ丈(丈の長さは親要素の96%とスタイルに定義しているので計算で出す)
var whiteBoardWidth = 1280;						// キャンバスのサイズ幅
var whiteBoardHeight = 676;	// キャンバスのサイズ丈(丈の長さは親要素の96%とスタイルに定義しているので計算で出す)
var syncWhiteBoardScrollFlg = 0;								// ホワイトボードのスクロール同期フラグ

$(function () {
	// ホワイトのードのキャンバスサイズを指定する
	var element = document.getElementById("white_board");

	element.addEventListener('touchmove', function(e) {
		if(TOOL_CURSORE_SELECT != selectLeftTool) {
			e.preventDefault();
		}
	});

	// キャンバスのサイズを指定する
	element.setAttribute("width", whiteBoardWidth);
	element.setAttribute("height", whiteBoardHeight);

	// 背景が透過になっているのでホワイトボードの初期化を行う
	initWhiteBoard();

	// ホワイトボード表示
	$('#change_paint').on('click', function() {
		showWhiteBord();
	});
	// ホワイトボード非表示
	$('#paint_done').on('click', function() {
		hideWhiteBord();
		var data = {
				command : "WHITE_BOARD",
				type : "HIDE_WHITE_BOARD",
				display : $("#white_board_area").css('display')
		};
		sendCommand(SEND_TARGET_ALL, data);
	});


	// ホワイトボードをスクロールした場合
	$(".canvas_area").on("scroll", function() {
		// 他のユーザーのスクロール情報と同期時は、自身のスクロールイベントを発生させない
		if(syncWhiteBoardScrollFlg == 0){
			// スクロール位置を取得
			var scrollTop = $(".canvas_area").scrollTop();
			var scrollLeft = $(".canvas_area").scrollLeft();
			var data = {
					command : "WHITE_BOARD",
					type : "SCROLL_WHITE_BOARD",
					scrollTop : scrollTop,
					scrollLeft : scrollLeft
			};
			sendCommand(SEND_TARGET_ALL, data);
		}else{
			// 同期された後にスクロールイベントが発生するので、その後フラグを落とす
			syncWhiteBoardScrollFlg = 0;
		}
	});


	// ===================================================================
	// ホワイトボードに書き込むイベント
	// ===================================================================
	// ホワイトボードのマウス押下フラグ
	var whiteBoardOnMouseFlg = false;

	// キャンバス押下時の処理
	$(document).on('touchstart', '#white_board', function(e){
		// マウス押下のフラグを立てる
		whiteBoardOnMouseFlg = true;
		// 要素の位置を取得
		var element = document.getElementById("white_board");
		var rect = element.getBoundingClientRect();
		// 要素の位置座標を計算
		var positionX = rect.left + window.pageXOffset ;	// 要素のX座標
		var positionY = rect.top + window.pageYOffset ;		// 要素のY座標
		// 要素の左上からの距離を計算し起点を設定
		onMouseX = e.originalEvent.touches[0].pageX - positionX ;
		onMouseY = e.originalEvent.touches[0].pageY - positionY ;
	});

	// キャンバス押下終了時の処理
	$(document).on('touchend', '#white_board', function(){
		whiteBoardOnMouseFlg = false;
		onMouseX = 0;
		onMouseY = 0;
		saveWhiteBoardImage();
	});
	// タッチ中に電話がかかってきた場合など
	$(document).on('touchcancel', '#white_board', function(){
		whiteBoardOnMouseFlg = false;
		onMouseX = 0;
		onMouseY = 0;
		saveWhiteBoardImage();
	});
	// キャンバス押下後移動時の処理
	$(document).on('touchmove', '#white_board', function(e){
		// マウスが押下され、移動している場合のみ処理を行う
		if(whiteBoardOnMouseFlg && (selectLeftTool == TOOL_PEN_NORMAL || selectLeftTool == TOOL_PEN_HIGHLIGHT || selectLeftTool == TOOL_PEN_ERASER)){
			// 要素の位置を取得
			var element = document.getElementById("white_board");
			var rect = element.getBoundingClientRect();
			// 要素の位置座標を計算
			var positionX = rect.left + window.pageXOffset ;	// 要素のX座標
			var positionY = rect.top + window.pageYOffset ;		// 要素のY座標
			// 要素の左上からの距離を計算
			var drowX = e.originalEvent.touches[0].pageX - positionX ;
			var drowY = e.originalEvent.touches[0].pageY - positionY ;
			//console.log("[X:"+drowX+"][Y:"+drowY+"]");

			// 文字の書き込み情報を相手に送信する（書き込み後だと、onMouseXとonMouseYが変わるため）
			var data = {
					command : "WHITE_BOARD",
					type : "WRITE_WHITE_BOARD",
					drowX : drowX,
					drowY : drowY,
					onMouseX : onMouseX,
					onMouseY : onMouseY,
					line : line,
					selectLeftTool : selectLeftTool,
					color : color
			};
			sendCommand(SEND_TARGET_ALL, data);

			// 自分のホワイトボードへ書き込み
			writeLine("white_board", drowX, drowY, onMouseX, onMouseY, line, color, selectLeftTool);
		}

	});

	// ===========================================================
	// 画像アイコン関連のイベント
	// ===========================================================
	// リセットボタン押下後の処理(オペレーターのみ操作可能)
	$(document).on('touchstart', '.btn_reset', function(e){
		if(window.confirm("ホワイトボードの内容を全て削除します")){
			// ホワイトボードの初期化
			initWhiteBoard();
			// 相手と同期する
			var data = {
					command : "WHITE_BOARD",
					type : "RESET_WHITE_BOARD"
			};
			sendCommand(SEND_TARGET_ALL, data);
		}
	});

	// ダウンロードボタン押下後の処理
	$(document).on('click', '.white_board_download', function(e){
		// ホワイトボードをBlob化
		var canvas = document.getElementById("white_board");
		var png = canvas.toDataURL("image/png");
		// $.ajaxだけではバイナリを扱うのが厳しいので代わりにXMLHttpRequestを使う（バイナリで取得しないとカメラの映像が消えてしまう為）
		var xhr = new XMLHttpRequest();
		xhr.open("POST", "/negotiation/download-white-board", true);
		// POST 送信の場合は Content-Type は固定.
		xhr.setRequestHeader( 'Content-Type', 'application/x-www-form-urlencoded' );
		xhr.responseType = 'arraybuffer';
		xhr.onload = function(e) {
			// Blobオブジェクトにファイルを格納する（コンテンツタイプをpdfとして指定）
			var blob = new Blob([xhr.response], {"type": "application/pdf"});
			// ダウンロードファイル名を設定(document_年月日時分秒.pdf)
			var now = new Date();
			var pdfFileName = "white_board_"+now.getFullYear()+(now.getMonth() + 1)+now.getDate()+now.getHours()+now.getMinutes()+now.getSeconds()+".pdf";
			// IEの場合はバイナリーのダウンロード方法が変わるので処理を分岐させる
			if(getBrowserType() != "IE"){
				// ファイル名を指定
				$("a[name=download_white_board]").attr("download", pdfFileName);
				// Aタグのhref属性にBlobオブジェクトを設定する。
				$("a[name=download_white_board]").attr("href", URL.createObjectURL(blob));
				// aタグのクリックイベントを発生させる
				$("a[name=download_white_board]")[0].click();
			}else{
				// IE専用のダウンロード処理
				window.navigator.msSaveBlob(blob, pdfFileName);
			}
		};
		// サーバへリクエストを送信（POSTの場合は引数に設定する）
		xhr.send("whiteBoardImg="+png);
	});

});

/**
 * ホワイトボードの領域を初期化する
 */
function initWhiteBoard(){
	// 初期化する為にコンテキスト取得
	var canvas = document.getElementById("white_board");
	var context = canvas.getContext('2d');
	// 現在の透過を取得する
	var tmpGlobalAlpha = context.globalAlpha;
	// 透過情報を初期化する
	context.globalAlpha = 1.0;
	// 塗りつぶしの色を設定
	context.fillStyle  = "#ffffff";
	// 初期化
	context.fillRect(0, 0, whiteBoardWidth, whiteBoardHeight);
	// 透過情報を戻す
	context.globalAlpha = tmpGlobalAlpha;
}

/**
 * 相手から送信された共有メモの情報を受取る関数
 * @param json
 */
function receiveWhiteBoardJson(json){
	if(json.type == "MOVE_WHITE_BOARD"){
		// 共有メモの移動
		$("#white_board_area").css("top", json.top);
		$("#white_board_area").css("left", json.left);
	}else if(json.type == "CHANGE_WHITE_BOARD_SIZE"){
		// 表示領域の縮尺（DIV）
		$('div#white_board_area').css("height", json.height);
		$('div#white_board_area').css("width", json.width);
	}else if(json.type == "WRITE_WHITE_BOARD"){
		//console.log("["+json.drowX+"]["+json.drowY+"]["+json.onMouseX+"]["+json.line+"]");
		writeLine("white_board", json.drowX, json.drowY, json.onMouseX, json.onMouseY, json.line, json.color, json.selectLeftTool);
	}else if(json.type == "SCROLL_WHITE_BOARD"){
		// 他ユーザーのスクロールを同期中のフラグを立てる
		syncWhiteBoardScrollFlg = 1;
		// スクロール位置を変更
		$(".canvas_area").scrollTop(json.scrollTop);
		$(".canvas_area").scrollLeft(json.scrollLeft);
	}else if(json.type == "RESET_WHITE_BOARD"){
		// ホワイトボードの初期化
		initWhiteBoard();
	}else if(json.type == "HIDE_WHITE_BOARD"){
		hideWhiteBord();
	}else if(json.type == "TOGGLE_WHITE_BOARD"){
		// ホワイトボードの表示非表示切替
		if(json.display == "table" || json.display ==  "block"){
			showWhiteBord();
		}else{
			hideWhiteBord();
		}
	}
}

function saveWhiteBoardImage()
{
	// ホワイトボードのキャンバス情報を取得
	var canvas = document.getElementById("white_board");
	var canvasData = canvas.toDataURL("image/png");
	var connectionInfoId = $("#connection_info_id").val();
	// サーバーに画像を転送する
	$.ajax({
		url: "https://" + location.host + "/negotiation/sync-white-board",
		type: "POST",
		data: {canvasData : canvasData, connectionInfoId : connectionInfoId},
		success: function(resultJson) {
		}
	});
}

/**
 * ホワイトボード表示処理
 * @returns
 */
function showWhiteBord(){
	$('#content__wrap').css('background-color', '#000000');
	$('.full_screen__wrap').css('opacity', '0.4');
	$('#white_board_area').show();	// 相手と連携部分で表示処理を行っている（negotiation_event_func.js）
	let colorWidth = $('.color__white').width();
	$('.color__white, .color__black, .color__green, .color__yellow, .color__red, .color__blue').css({'height': colorWidth + 'px'});
}
/**
 * ホワイトボード非表示処理
 * @returns
 */
function hideWhiteBord(){
	$('#content__wrap').css('background-color', '');
	$('.full_screen__wrap').css('opacity', '');
	$('#white_board_area').hide();
}