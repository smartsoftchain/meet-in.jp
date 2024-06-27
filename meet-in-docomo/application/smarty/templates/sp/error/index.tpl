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
			{foreach from=$errors item=error}
				<p class="red-txt">
					<span>{$error|escape}</span>
				</p>
			{/foreach}
		</div>
		<!-- エラーメッセージ[end] -->
		
		<p class="mgn-t10">
			<a href="/" class="txtlink arw-l"><span>戻る</span></a>
		</p>
				
	</div>
	<!-- メインコンテンツ[end] -->

</div>
<!-- コンテンツ領域[end] -->

{include file="./common/footer.tpl"}