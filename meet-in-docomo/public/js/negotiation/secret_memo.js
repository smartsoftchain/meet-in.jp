/*
 * シークレットメモに使用するJS群
 *
 * */
// シークレットメモの文字サイズ（デフォルト）
var secretMemofontType = 1;

$(function () {

	// シークレットメモの領域を移動できるようにイベント処理を追加
	$("#secret_memo_area").draggable({
		containment: "#mi_video_area",
		scroll: false,
	});


	// シークレットメモにメッセージを書き込んだ場合のイベント処理
	$(document).on('keyup', 'textarea.secret_memo_text', function(){
	});

	// シークレットメモのリサイズ処理
	$("div#secret_memo_area").resizable({
		minHeight: 180,
		minWidth: 180,
		containment : "#mi_video_area",
		handles: "se",
	});

	// 文字サイズ変更イベント
	// 拡大ボタン
	$(document).on('click', 'span.secret_memo_change_fontsize_large', function(){

		secretMemofontType == 1 ? secretMemofontType = 2 : secretMemofontType = 3;

		// データを渡した後にフォントを変える
		secretMemofontType = changeFontSize($("textarea.secret_memo_text"), secretMemofontType);
	});
	// 縮小ボタン
	$(document).on('click', 'span.secret_memo_change_fontsize_small', function(){

		secretMemofontType == 3 ? secretMemofontType = 2 : secretMemofontType = 1;

		// データを渡した後にフォントを変える
		secretMemofontType = changeFontSize($("textarea.secret_memo_text"), secretMemofontType);
	});


	// 閉じるボタン押下時のイベント処理
	$(document).on('click', '.secret_memo_close', function(){
		$("#secret_memo_area").toggle();

		swapToggleHide(NEGOTIATION.rightAreaDom,RIGHT_AREA_SECRET_MEMO);

		// 資料が表示されている場合位置が変わるので資料を再描画する
		documentResizeEvent();
	});


	/**
	 * windowsタブレット, iPadデスクトップ表示用のタッチイベント
	 */
	$('textarea.secret_memo_text').bind('touchstart', function() {
		// シークレットメモをタップしたが、フォーカスが当たっていない場合はフォーカスを当てる
		$(this).get(0).selectionStart = $(this).val().length;
		$("textarea.secret_memo_text").focus();
	});

});


/**
 * 文字のサイズを変更する
 * @param secretMemoText
 */
function changeFontSize(objSecretMemoText, secretMemofontType){
	if(secretMemofontType == 1){
		objSecretMemoText.css("fontSize", "11px");
	}else if (secretMemofontType == 2) {
		objSecretMemoText.css("fontSize", "14px");
	}else if (secretMemofontType == 3) {
		objSecretMemoText.css("fontSize", "20px");
	}
	return secretMemofontType;
}
