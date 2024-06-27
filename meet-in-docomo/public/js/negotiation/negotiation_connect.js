/**
 * Created by matsuno.masahiro on 2017/02/14.
 */

////////////////// 以下接続系　Lさん作成分　連携部以外MはNOタッチ

//////////////////コネクション関数

/**
 * 再接続ボタン押下イベント
 */
NEGOTIATION.buttonReconnect = function() {	
	if (!navigator.onLine) {
		return;
	}

	// 商談管理の再接続
//	negotiationMainReconnect();
	window.location.reload();
	
	if (NEGOTIATION.isOperator) {
		$('#negotiation_right_menu').attr('class', "mi_select_action");
		$('#negotiation_right_menu_button_list').hide();
	}
};
