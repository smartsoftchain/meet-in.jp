/**
 * valueの存在確認 文字列NULLもだめ
 * 1 : 何かしらの値を持っている　0 : 値を持っていない
 */
function valueCheck(value){
	if(value != "null" && value != null && value != "" && value != " "){
		return 1;
	}
	return 0;
}

/**
 * jqueryオブジェクトの拡張
 */
$.fn.extend({
	/**
	 * クラスを着脱する関数
	 * @param flg true: add false: remove
	 * @param cName クラス名
	 */
	changeClass: function(flg,cName) {		
		if (flg) {
			$(this).addClass(cName);
		} else {
			$(this).removeClass(cName);
		}
	},
	
	/**
	 * displayの状態を確認する関数
	 */
	isShow: function() {
		return $(this).css('display') != 'none' && $(this).is(':visible');
	}
});

// その他のメッセージを受信したときの処理
function receiveCommonCommandExtra(json) {
	if (checkGetOldestUserIdMessage && typeof checkGetOldestUserIdMessage === "function") {
		checkGetOldestUserIdMessage(json);
	}
}