/*
 * 共有メモに使用するJS群
 *
 * */
// 共有メモの文字サイズ（デフォルト）
var shareMemofontType = 1;

$(function () {

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
			// ダウンロードファイル名を設定(share_memo_年月日時分秒.pdf)
			var now = new Date();
			var fileName = "share_memo_"+now.getFullYear()+(now.getMonth() + 1)+now.getDate()+now.getHours()+now.getMinutes()+now.getSeconds()+".txt";
			// ファイル名を指定する
			$("a[name=download_share_memo]").attr("download", fileName);
			// Aタグのhref属性にBlobオブジェクトを設定する。
			$("a[name=download_share_memo]").attr("href", URL.createObjectURL(blob));
			$("a[name=download_share_memo]")[0].click();
		};
		// サーバへリクエストを送信（POSTの場合は引数に設定する）
		xhr.send("shareMemo="+shareMemo);

	});

	// 閉じるボタン押下時のイベント処理
	$(document).on('touchstart', '.share_memo_close', function(){
		$("#share_memo_area").toggle();
		var data = {
				command : "SHARE_MEMO",
				type : "TOGGLE_SHARE_MEMO",
				display : $("#share_memo_area").css('display')
		};
		sendCommand(SEND_TARGET_ALL, data);
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
	}else if(json.type == "TOGGLE_SHARE_MEMO"){
		// 共有メモの表示非表示切替
		if(json.display == "table" || json.display ==  "block"){
			$("#share_memo_area").show();
		}else{
			$("#share_memo_area").hide();
		}
	}
}

/**
 * 文字のサイズを変更する
 * @param shareMemoText
 */
function changeFontSize(objShareMemoText, shareMemofontType){
	if(shareMemofontType == 1){
		objShareMemoText.css("fontSize", "14px");
		shareMemofontType = 2;
	}else if (shareMemofontType == 2) {
		objShareMemoText.css("fontSize", "20px");
		shareMemofontType = 3;
	}else if (shareMemofontType == 3) {
		objShareMemoText.css("fontSize", "11px");
		shareMemofontType = 1;
	}
	return shareMemofontType;
}