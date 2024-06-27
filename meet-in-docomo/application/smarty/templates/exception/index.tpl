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
<div id="mi_main_contents">
	<!-- トップナビ start -->
	<div id="mi_top_nav">
	</div>
	<!-- トップナビ end -->
	<!-- メインコンテンツ[start] -->
	<div id="mi_content_area">
		<!-- エラーメッセージ表示エリア begin -->
		<p>システムエラーが発生しました。({$title})</p>
		{if $errorList|@count gt 0}
		<p class="errmsg mb10">
			<table class="mi_table_input_right mi_table_main">
				{foreach from=$errorList item=error}
					{foreach from=$error item=row}
						{$row}
					{/foreach}
				{/foreach}
			</table>
		</p>
		{/if}
		<!-- エラーメッセージ表示エリア end -->
	</div>
	<!-- メインコンテンツ[end] -->
</div>
<!-- コンテンツ領域[end] -->

{include file="./common/footer.tpl"}
