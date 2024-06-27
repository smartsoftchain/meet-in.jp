{include file="./common/header.tpl"}

{literal}
<script>
$(function (){

});
</script>
<style type="text/css">
<!--

.text_short{
	width:60px !important;
	display: inline-block !important;
}
.text_medium{
	width:200px !important;
	display: inline-block !important;
}
.text_long{
	width:443px !important;
	display: inline-block !important;
}

-->
</style>
{/literal}
<!-- コンテンツ領域[start] -->
<div id="content-area">

	<!-- メインコンテンツ[start] -->
	<div id="main_contents">
<!--
	<input type="button" class="detail_open" value="選択"/>
	<a data-target="db-log2" class="modal-open" style="display:none;"></a>
-->
		<!-- 見出し[start] -->
		<div class="heading">
			<div class="pgtitle clearfix">
				<h3>
				本日はお忙しいところ<BR>
				誠にありがとうございました。<BR>
				閉じるボタンをクリックして終了してください。
				</h3>
			</div>
		</div>
		<form>
			<div class="area1btn mgn-t20">
				<input type="submit" class="btn large2" value="閉じる" onClick="javascript:window.close();">
			</div>
		</form>

	</div>
	<!-- メインコンテンツ[end] -->

</div>
<!-- コンテンツ領域[end] -->

{include file="./common/footer.tpl"}

