/*
 * デザインの制御に使用するJS群
 * 
 * */

$(function () {
	
	/* クライアント選択画面へ遷移（aタグを付けると文字の色が変わるので、スタイルを変更しないようにJSで遷移させる） */
	$("#select_client").click(function(){
		window.location.href = "/client/list";
	});
	
	/* 電話アイコンを押下時にダイヤルパッド表示 */
	$('.show_telephone').click(function(){
		// 商談画面起動
		var url = "/index/telephone";
		if(window.location.pathname == "/negotiation/negotiation") {
			url += "?from=negotiation";
		}
		window.open(url, '_blank', 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=no, width=285, height=470');
		return false;
	});
	/* 電話の閉じるアイコンを押下時にダイヤルパット非表示 */
	$(".hide_tel_modal").click(function() {
		// 電話の掛け先を初期化する
		$("div.mi_call_number").text("");
		$("#mi_tel_modal").hide();
	});
	/* ダイヤルパッドをmiitin発信に切り替える */
	$(document).on('click', '.change_meetin_dial', function(){
		// meet in ボタンのclassを変更
		$(this).removeClass("change_meetin_dial");
		$(this).addClass("change_telephone_dial");
	});
	
	/* ダイヤルパッドを外線発信に切り替える */
	$(document).on('click', '.change_telephone_dial', function(){
		// meet in ボタンのclassを変更
		$(this).removeClass("change_telephone_dial");
		$(this).addClass("change_meetin_dial");
	});
	
	/* 発信ボタンを押下した際のデザイン変更処理 */
	$(document).on('click', '.btn_call', function(){
		$(this).find("div.call_button").text("切断");
		$(this).removeClass("btn_call");
		$(this).addClass("btn_hangup");
	});
	/* 切断ボタンを押下した際のデザイン変更処理 */
	$(document).on('click', '.btn_hangup', function(){
		$(this).find("div.call_button").text("発信");
		$(this).removeClass("btn_hangup");
		$(this).addClass("btn_call");
	});
});