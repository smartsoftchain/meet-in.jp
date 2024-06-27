{include file="./common/header.tpl"}

{literal}
<style type="text/css">
  /* エラーメッセージ */
  .errmsg {
  	font-size: 0.95em;
  	line-height: 1.6;
  	color: #df6b6d;
  	padding-bottom: 15px;
  }
</style>
{/literal}

<!-- メインコンテンツ[start] -->
<div id="mi_main_contents">
	<div id="mi_top_nav">
		<!-- パンくずリスト start -->
		<div class="mi_breadcrumb_list">
			<a href="/index/menu">TOP</a>&nbsp;&gt;&nbsp;
			<a href="/e-contract-api/credential">クレデンシャル発行</a></div>
		<!-- パンくずリスト end -->
	</div>
  <!-- コンテンツエリア start -->
	<div id="mi_content_area">
		<!-- コンテンツタイトル start -->
		<div class="mi_content_title">
			<h1><span class="icon-configuration mi_content_title_icon"></span>&nbsp;クレデンシャル発行</h1>
		</div>
		<!-- コンテンツタイトル end -->

		<!-- エラーメッセージ表示エリア begin -->
		{if $errorList|@count gt 0}
		<p class="errmsg mb10">
		下記にエラーがあります。<br />
			<strong>
				{foreach from=$errorList item=error}
					{foreach from=$error item=row}
						{$row}<br>
					{/foreach}
				{/foreach}
			</strong>
		</p>
		{/if}
		<!-- エラーメッセージ表示エリア end -->

			<!-- テーブル start -->
			<div class="mi_table_main_wrap mi_table_input_right_wrap">
				<table class="mi_table_input_right mi_table_main">
					<tbody>
						<tr>
							<td class="mi_tabel_title">クレデンシャル発行状況</td>
							<td class="txtinp mi_tabel_content">
								{if $credentialFlg == true}
									有効
								{else}
									無効
								{/if}
							</td>
						</tr>
					</tbody>
				</table>
			</div>
			<!-- テーブル end -->
			{if $credentialFlg == false}
				<div class="btn_client_submit_area">
					<form action="/e-contract-api/credential" method="post" >
						<button type="submit" class="mi_default_button">発行する</button>
					</form>
				</div>
			{/if}
  </div>
  <!-- コンテンツエリア end -->
</div>
<!-- メインコンテンツ[end] -->

{include file="./common/footer.tpl"}
