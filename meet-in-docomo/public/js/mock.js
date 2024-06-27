/**
 * モックが画面でだけ使用するJS
 * TODO 本番リリースでは不要
 */
$(function(){
	
	// 初期表示時にINFORM
	(function() {
		
		_U.showLoading("現在、開発中の画面です。");
		
		setTimeout(function(){
			_U.hideLoading();
		}, 2400);
		
	})();
	
	$(document).on("click", "#content-area a:not(.mock_available), #content-area input:not(.mock_available)", function(e) {
		
		e.preventDefault();
		
		_U.showLoading("現在、開発中の機能です。");
		
		setTimeout(function(){
			_U.hideLoading();
		}, 1200);
	});
	
});