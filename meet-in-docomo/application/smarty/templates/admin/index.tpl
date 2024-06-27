<!DOCTYPE html>
<html lang="ja">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta charset="UTF-8">
<meta name="keywords" content="">
<meta name="description" content="">

<title>ログイン | Sales Crowd</title>

<link rel="stylesheet" href="/css/all.css?{$application_version}">
<script src="/js/jquery-1.11.2.min.js?{$application_version}"></script>
<script src="/js/jquery.cookie.js?{$application_version}"></script>
<script src="/js/common.js?{$application_version}"></script>

</head>


<body>
<a name="pagetop" id="pagetop"></a><!-- label -->

<!-- 全体領域[start] -->
<div id="container" class="login">

	<!-- ヘッダー領域[start] -->
	<div id="header-area">

		<!-- ヘッダー[start] -->
		<div id="header" class="login">
			<h1><img src="/img/tmo_logo.png" alt="TMO"></h1>
		</div>
		<!-- ヘッダー[end] -->
	</div>
	<!-- ヘッダー領域[end] -->



	<!-- コンテンツ領域[start] -->
	<div id="content-area">

		<!-- メインコンテンツ[start] -->
		<div id="main_contents">
			<!-- 見出し[start] -->
			<div class="heading login">
				<div class="pgtitle">
					<h3>管理者用ログイン</h3>
				</div>
			</div>
			<!-- 見出し[end] -->

			{foreach from=$errors item=error}
				{foreach from=$error item=msg}
					<span class="error">{$msg}</span><br />
				{/foreach}
			{/foreach}
			<!-- 入力領域[start] -->
			<div class="article-box mgn-t25">

				<form action="/admin/login" method="post" name="login_form">
					<table class="layout login">
						<tr>
							<th><span>アカウントID</span></th>
							<td class="txtinp"><div><input type="text" name="id"></div></td>
						</tr>
						<tr>
							<th><span>パスワード</span></th>
							<td class="txtinp"><div><input type="password" name="password"></div></td>
						</tr>
					</table>
	
					<div class="area1btn mgn-t20">
						<input type="submit" class="btn large2" value="ログイン" />
					</div>
				</form>

			</div>
			<!-- 入力領域[end] -->

		</div>
		<!-- メインコンテンツ[end] -->

	</div>
	<!-- コンテンツ領域[end] -->



	<!-- フッター領域[start] -->
	<p class="pgtop"><a href="#pagetop" class="btn_ptop" onclick="MoveToElement('pagetop',0,0); return false;"><img src="/img/arw_top.png" alt="Page top"></a></p>

	<div id="footer">
		<p class="copyright"><span>&copy;</span><span>Aidma Holdings Inc. All Rights Reserved.</span></p>
	</div>
	<!-- フッター領域[end] -->

</div>
<!-- 全体領域[end] -->

</body>
</html>
