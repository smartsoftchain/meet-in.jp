// 推奨ブラウザダイアログ
function showSystemRequirementsBrowserDialog(browser) {

	if (["IE", "Edge"].indexOf(browser) == -1){
		  return true; // 推奨ブラウザなのでダイアログを表示しない 終了,
	}

	// Chromeへの遷移ダイアログを可視化 .
	$("#modal-content-requirements_browser").show();

	document.getElementById("btn_requirements_browser_a").onclick = function() {
		$("#modal-content-requirements_browser").hide();
	};

	document.getElementById("btn_requirements_browser_b").onclick = function() {
		location.href = "https://www.google.com/intl/ja_jp/chrome/";
	};

	return false;
}
