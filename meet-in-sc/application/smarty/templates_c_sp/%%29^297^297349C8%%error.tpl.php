<?php /* Smarty version 2.6.26, created on 2020-09-09 12:59:38
         compiled from exception/error.tpl */ ?>
<!DOCTYPE html>
<html lang="ja">
<head>
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>接続エラー</title>
<meta charset="utf-8">
<meta name="author" content="">
<!--[if lt IE 8]>
<link rel="stylesheet" href="/css/ie7.css?<?php echo $this->_tpl_vars['application_version']; ?>
">
<!--<![endif]-->
<script src="/js/jquery-1.11.2.min.js?<?php echo $this->_tpl_vars['application_version']; ?>
"></script>
<script src="/js/jquery-ui.min.js?<?php echo $this->_tpl_vars['application_version']; ?>
"></script>

<?php echo '
<style>
.red-txt span,
.red-txt a {
	display: inline-block;
	vertical-align: middle;
}
.error_msg{
	color: red;
}
</style>

<script>
  //=============================================================
	// エラーメッセージを表示するイベント処理
	//=============================================================
$(function(){
	// URLのパラメータを取得(？で始まるパラメータ部分)
	var urlParam = location.search.substring(1);

	// URLにパラメータが存在する場合
	if(urlParam) {
		// 「&」が含まれている場合は「&」で分割
		var param = urlParam.split(\'&\');

		// パラメータを格納する用の配列を用意
		var paramArray = [];
		// 用意した配列にパラメータを格納
		for (i = 0; i < param.length; i++) {
			var paramItem = param[i].split(\'=\');
			paramArray[paramItem[0]] = paramItem[1];
		}

		// パラメータ[error]が1かどうかを判断する
		if (paramArray.error == \'1\') {
			$("h3").text("ルームへ入室可能な人数を超えています。");
		}
		else if (paramArray.error == \'2\') {
			$("h3").text("ルームへの入室が制限されているため、入室することが出来ません。");
		}
		else if (paramArray.error == \'3\') {
			$("h3").text("ルーム名は半角英数字、アンダーバー(_)、ハイフン(-)の32文字迄です。");
		}
	}
});
</script>

'; ?>


<!-- コンテンツ領域[start] -->
<div id="content-area">

	<!-- メインコンテンツ[start] -->
	<div id="main_contents">

		<!-- 見出し[start] -->
		<div class="heading">
			<div class="pgtitle clearfix">
				<h3 class="red-txt error_msg"></h3>
			</div>
		</div>
		<!-- 見出し[end] -->
		
		<!-- エラーメッセージ[start] -->
		<div class="article-box mgn-t15">
			<p class="red-txt">
				<span>タブを閉じて終了してください。</span>
			</p>
		</div>
		<!-- エラーメッセージ[end] -->
	
	</div>
	<!-- メインコンテンツ[end] -->

</div>
<!-- コンテンツ領域[end] -->

</body>
</html>