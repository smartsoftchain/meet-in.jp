<!DOCTYPE html>
<html lang="en">
<head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta charset="utf-8">

<title>アイドマ担当者選択</title>

<link rel="stylesheet" href="/css/all.css">
<link rel="stylesheet" href="/css/popup.css">
<link rel="stylesheet" href="/css/private_add.css">
<link rel="stylesheet" href="/css/customize.css">
<link rel="stylesheet" type="text/css" href="/js/datepicker-ui/jquery-ui.css">


</head>


<body>

<!-- コンテンツ領域[start] -->
<div id="content-area">

	<!-- メインコンテンツ[start] -->
	<div id="main_contents">
		<!-- 見出し[start] -->
		<div class="heading">
			<div class="pgtitle clearfix">
				<h3>アイドマ担当者選択</h3>
			</div>
		</div>
		<!-- 見出し[end] -->

		<form action="member" method="post">
		
			<!-- 表組み[start] -->
			<div class="article-box mgn-t15">
				<table class="layout input-tbl">
					<tr>
						<th>選択</th>
						<th>担当者</th>
					</tr>
					<tr>
						<td>
							<input type="checkbox" name="id" value="">
						</td>
						<td>
							{$row.member_name}
						</td>
					</tr>
			</div>
			<!-- 表組み[end] -->
			
		</form>

	</div>
	<!-- メインコンテンツ[end] -->

</div>
<!-- コンテンツ領域[end] -->

</body>
</html>
