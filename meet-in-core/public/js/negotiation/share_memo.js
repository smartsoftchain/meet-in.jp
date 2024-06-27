/*
 * 共有メモに使用するJS群
 *
 * */
// 共有メモの文字サイズ（デフォルト）
var shareMemofontType = 1;

$(function () {

	// 共有メモの領域を移動できるようにイベント処理を追加
	$("#share_memo_area").draggable({
		containment: "#mi_video_area",
		scroll: false,
		drag : function(event, ui) {
			var data = {
					command : "SHARE_MEMO",
					type : "MOVE_SHARE_MEMO",
					top : $(this).css("top"),
					left : $(this).css("left")
			};
			sendCommand(SEND_TARGET_ALL, data);
		}
	});


	// 共有メモにメッセージを書き込んだ場合のイベント処理
	$(document).on('keyup', 'textarea.share_memo_text', function(){
		//console.log($(this).val());

		// カードル位置を取得
		var p = $(this).get(0).selectionStart;
		var np = p + $(this).length;
		//console.log(np);

		// スクロール位置を取得
		var scrollHeight = $("textarea.share_memo_text").scrollTop();
		//console.log(scrollHeight);

		var data = {
				command : "SHARE_MEMO",
				type : "SEND_MESSAGE",
				message : $(this).val(),
				focusPosition : np,
				scrollHeight : scrollHeight
		};
		sendCommand(SEND_TARGET_ALL, data);
	});

	// 共有メモのリサイズ処理
	$("div#share_memo_area").resizable({
		minHeight: 180,
		minWidth: 180,
		containment : "#mi_video_area",
		handles: "se",
		resize: function() {
			// サイズが変更されている場合
			var data = {
					command : "SHARE_MEMO",
					type : "CHANGE_SHARE_MEMO_SIZE",
					height : $(this).css('height'),
					width : $(this).css("width")
			};
			sendCommand(SEND_TARGET_ALL, data);
		}
	});

	// 文字サイズ変更イベント
	// 拡大ボタン
	$(document).on('click', 'span.share_memo_change_fontsize_large', function(){

		shareMemofontType == 1 ? shareMemofontType = 2 : shareMemofontType = 3;

		var data = {
				command : "SHARE_MEMO",
				type : "CHANGE_FONT_SIZE",
				shareMemofontType : shareMemofontType
		};
		sendCommand(SEND_TARGET_ALL, data);
		// データを渡した後にフォントを変える
		shareMemofontType = changeFontSize($("textarea.share_memo_text"), shareMemofontType);
	});
	// 縮小ボタン
	$(document).on('click', 'span.share_memo_change_fontsize_small', function(){

		shareMemofontType == 3 ? shareMemofontType = 2 : shareMemofontType = 1;

		var data = {
				command : "SHARE_MEMO",
				type : "CHANGE_FONT_SIZE",
				shareMemofontType : shareMemofontType
		};
		sendCommand(SEND_TARGET_ALL, data);
		// データを渡した後にフォントを変える
		shareMemofontType = changeFontSize($("textarea.share_memo_text"), shareMemofontType);
	});

	// 共有メモのダウンロード処理
	$(document).on('click', 'span.share_memo_download', function(){
		// サーバーに画像データを送信する為のデータ
		var shareMemo = encodeURIComponent($("textarea.share_memo_text").val());

		// $.ajaxだけではバイナリを扱うのが厳しいので代わりにXMLHttpRequestを使う（バイナリで取得しないとカメラの映像が消えてしまう為）
		var xhr = new XMLHttpRequest();
		xhr.open("POST", "/negotiation/download-share-memo", true);
		// POST 送信の場合は Content-Type は固定.
		xhr.setRequestHeader( 'Content-Type', 'application/x-www-form-urlencoded' );
		xhr.responseType = 'arraybuffer';
		xhr.onload = function(e) {
			// Blobオブジェクトにファイルを格納する（コンテンツタイプをtextとして指定）
			var blob = new Blob([xhr.response], {"type": "text/plain"});
			// ダウンロードファイル名を設定(share_memo_年月日時分秒.txt)
			var now = new Date();
			var fileName = "share_memo_"+now.getFullYear()+(now.getMonth() + 1)+now.getDate()+now.getHours()+now.getMinutes()+now.getSeconds()+".txt";

			// IEの場合はバイナリーのダウンロード方法が変わるので処理を分岐させる
			if(getBrowserType() != "IE"){
				// ファイル名を指定する
				$("a[name=download_share_memo]").attr("download", fileName);
				// Aタグのhref属性にBlobオブジェクトを設定する。
				$("a[name=download_share_memo]").attr("href", URL.createObjectURL(blob));
				$("a[name=download_share_memo]")[0].click();
			}else{
				// IE専用のダウンロード処理
				window.navigator.msSaveBlob(blob, fileName);
			}
		};
		// サーバへリクエストを送信（POSTの場合は引数に設定する）
		xhr.send("shareMemo="+shareMemo);

	});

	// 閉じるボタン押下時のイベント処理
	$(document).on('click', '.share_memo_close', function(){
		$("#share_memo_area").toggle();
		var data = {
				command : "SHARE_MEMO",
				type : "TOGGLE_SHARE_MEMO",
				display : $("#share_memo_area").css('display')
		};
		sendCommand(SEND_TARGET_ALL, data);

		swapToggleHide(NEGOTIATION.rightAreaDom,RIGHT_AREA_SHARE_MEMO);

		// 資料が表示されている場合位置が変わるので資料を再描画する
		documentResizeEvent();
	});


	/**
	 * windowsタブレット, iPadデスクトップ表示用のタッチイベント
	 */
	$('textarea.share_memo_text').bind('touchstart', function() {
		// 共有メモをタップしたが、フォーカスが当たっていない場合はフォーカスを当てる
		$(this).get(0).selectionStart = $(this).val().length;
		$("textarea.share_memo_text").focus();
	});

});

/**
 * 相手から送信された共有メモの情報を受取る関数
 * @param json
 */
function receiveShareMemoJson(json){
	if(json.type == "SEND_MESSAGE"){
		// 共有メモのメッセージ
		$("textarea.share_memo_text").val(json.message);
		//$("textarea.share_memo_text").get(0).setSelectionRange(json.focus_position, json.focus_position);
		$("textarea.share_memo_text").attr('selectionEnd', json.focusPosition);
		$("textarea.share_memo_text").attr('selectionStart', json.focusPosition);
		$("textarea.share_memo_text").focus();

		// スクロール位置を最下部に変更
		$("textarea.share_memo_text").scrollTop(json.scrollHeight);

	}else if(json.type == "MOVE_SHARE_MEMO"){
		// 共有メモの移動
		$("#share_memo_area").css("top", json.top);
		$("#share_memo_area").css("left", json.left);
	}else if(json.type == "CHANGE_SHARE_MEMO_SIZE"){
		// 表示領域の縮尺（DIV）
		$('div#share_memo_area').css("height", json.height);
		$('div#share_memo_area').css("width", json.width);
	}else if(json.type == "CHANGE_TEXTAREA_SIZE"){
		// 表示領域の縮尺（TEXTAREA）
		$('textarea.share_memo_text').css("height", json.height);
		$('textarea.share_memo_text').css("width", json.width);
	}else if(json.type == "CHANGE_FONT_SIZE"){
		// フォントサイズの変更
		shareMemofontType = changeFontSize($("textarea.share_memo_text"), json.shareMemofontType);
	}else if(json.type == "TOGGLE_SHARE_MEMO"){
		// 共有メモの表示非表示切替
		if(json.display == "table" || json.display ==  "block"){
			$("#share_memo_area").show();
		}else{
			$("#share_memo_area").hide();
		}
		// 新レイアウトで追加された関数の呼び出し
		swapToggleHide(NEGOTIATION.rightAreaDom,RIGHT_AREA_SHARE_MEMO);
	}
}

/**
 * 文字のサイズを変更する
 * @param shareMemoText
 */
function changeFontSize(objShareMemoText, shareMemofontType){
	if(shareMemofontType == 1){
		objShareMemoText.css("fontSize", "11px");
	}else if (shareMemofontType == 2) {
		objShareMemoText.css("fontSize", "14px");
	}else if (shareMemofontType == 3) {
		objShareMemoText.css("fontSize", "20px");
	}
	return shareMemofontType;
}
