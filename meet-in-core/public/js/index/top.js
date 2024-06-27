/**
 * TOP画面で使用するJS
 * @returns
 */
$(function(){
	// URLのパラメータを取得(？で始まるパラメータ部分)
	var urlParam = location.search.substring(1);
	if(urlParam){
		// 「&」が含まれている場合は「&」で分割
		var param = urlParam.split('&');

		// パラメータを格納する用の配列を用意
		var paramArray = [];
		// 用意した配列にパラメータを格納
		for (i = 0; i < param.length; i++) {
			var paramItem = param[i].split('=');
			paramArray[paramItem[0]] = paramItem[1];
		}

		// パラメータ[error]が1かどうかを判断する
		if (paramArray.error == '1') {
			$("p.connect_alert").text("ルームへ入室可能な人数を超えています。");
			// エラーメッセージの表示
			$("p.connect_alert").show();
		}
		else if (paramArray.error == '2') {
			$("p.connect_alert").text("ルームがロックされています。入室できません。");
			// エラーメッセージの表示
			$("p.connect_alert").show();
		}
		else if (paramArray.error == '3') {
			$("p.connect_alert").text("ルーム名は半角英数字、アンダーバー(_)、ハイフン(-)の32文字迄です。");
			// エラーメッセージの表示
			$("p.connect_alert").show();
		}
		else if (paramArray.error == '4') {
			$("p.connect_alert").text("ご契約の期限が終了した為ログインできません。");
			// エラーメッセージの表示
			$("p.connect_alert").show();
		}
		else if (paramArray.error == '5') {
			$("p.connect_alert").text("ご契約の期限が開始前の為ログインできません。");
			// エラーメッセージの表示
			$("p.connect_alert").show();
		}
		else if(paramArray.error == '10') {
			// ゲストのみでルーム入室しようとすると、専用ページに遷移させる
			window.location.href = "/index/service-end";
			/*
			$("p.connect_alert").text("オペレーターが入室していません。");
			// エラーメッセージの表示
			$("p.connect_alert").show();
			*/
		}
	}
});
