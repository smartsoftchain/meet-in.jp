{include file="./common/header.tpl"}

{literal}
<style>
.red-txt span,
.red-txt a {
	display: inline-block;
	vertical-align: middle;
}

</style>
{/literal}

<!-- コンテンツ領域[start] -->
<div id="content-area">

	<!-- メインコンテンツ[start] -->
	<div id="main_contents">

		<!-- 見出し[start] -->
		<div class="heading">
			<div class="pgtitle clearfix">
				<h3 class="red-txt">エラー</h3>
			</div>
		</div>
		<!-- 見出し[end] -->
		
		<!-- エラーメッセージ[start] -->
		<div class="article-box mgn-t15">
			<p class="red-txt">
				<span>先にクライアントを選択してください。</span>
				<a href="/client/list" class="minibtn-gry arw">選択</a>
			</p>
		</div>
		<!-- エラーメッセージ[end] -->
	
	</div>
	<!-- メインコンテンツ[end] -->

</div>
<!-- コンテンツ領域[end] -->

{include file="./common/footer.tpl"}