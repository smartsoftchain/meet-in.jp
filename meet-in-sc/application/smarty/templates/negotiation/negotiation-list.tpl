{include file="./common/header.tpl"}

{literal}

<script>
	$(function (){
		// 並び順が選択された場合のイベント処理
		$(document).on('change', '[id=srt]', function(){
			var $id = $(this).val();
			if($id != ""){
				var url = "/negotiation/negotiation-list?srt=" + $id;
				$(location).attr("href", url);
			}
		});

	});
</script>

<style type="text/css">
<!--

.reset table{
	border: 3px ridge;
	margin: 5px;
	width: 960px;
}

.reset table td {
	padding: 0px 10px;
}

span.font1 {
	font-size: 18px;
	font-weight: bold;
}

table.conect_list td:nth-child(1) p {
	max-width: 530px;
}

-->
</style>

{/literal}


<!-- メインコンテンツ start -->
<div id="mi_main_contents">
	<!-- トップナビ start -->
	<div id="mi_top_nav">
		<!-- パンくずリスト start -->
		<div class="mi_breadcrumb_list"><a href="/index/menu">TOP</a>&nbsp;&gt;&nbsp;<a href="/negotiation/negotiation-list">接続履歴一覧</a></div>
		<!-- パンくずリスト end -->
	</div>
	<!-- トップナビ end -->
	
	<!-- コンテンツエリア start -->
	<div id="mi_content_area">
		<!-- コンテンツタイトル start -->
		<div class="mi_content_title">
			<span class="icon-connect mi_content_title_icon"></span>
			<h1>接続履歴一覧</h1>
			<div class="mi_flt-r">
				<form id="search_form" action="/negotiation/negotiation-list" method="get">
					<div class="search_box">
						<input type="text" name="free_word" value="{$freeWord}" placeholder="検索内容を入力してください...">
			
						<button class="mi_default_button hvr-fade click-fade">
							<span class="icon-search"></span>
						</button>
						<span class="icon-close search_close_button"></span>
					</div>
				</form>
			</div>
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

		<!-- ページネーション start -->
		<div class="mi_pagenation">
			<div class="mi_pagenation_result mi_flt-r">該当件数 <span>{$list->getCount()}</span>件</div>
			{$list->getLink()}
			{$list->getPerPage()}
			<div class="mi_flt-r">
				<select name='srt' id='srt' style="width: 100px;" >
					<option value=""  {if $srt=="" }selected{/if} disabled style='display:none;'>並べ替え</option>
					<option value="1" {if $srt=="1"}selected{/if}>会社名(昇順)</option>
					<option value="3" {if $srt=="3"}selected{/if}>会社名(降順)</option>
					<option value="2" {if $srt=="2"}selected{/if}>更新日(昇順)</option>
					<option value="4" {if $srt=="4"}selected{/if}>更新日(降順)</option>
				</select>
				&nbsp;&nbsp;
			</div>
		</div>
		<!-- ページネーション end -->

		<!-- テーブル start -->
		<div class="mi_table_main_wrap">
			<table class="mi_table_main conect_list">
				<tbody>
				{foreach from=$list->getList() item=row}
				<tr>
					<td>
						<h2>{if $row.company_name!=""}{$row.company_name}{else}未入力{/if}</h2>
						<div>
							商談日 / <span> {$row.stime}</span>
							接続時間 / <span> {$row.video_time}</span><br>
							更新日 / <span> {$row.update_date}</span>
						</div>
						<p>{if $row.sharing_memo!=""}{$row.sharing_memo}{else}未入力{/if}</p>
					</td>
					<td>
						<a href="/negotiation/download-csv?id={$row.id}">
							<span class="icon-download"></span><br>
							CSVダウンロード
						</a>
					</td>
					<td>
						<a href="/negotiation/negotiation-edit?id={$row.id}"><span class="icon-menu-06"></span></a>
					</td>
				</tr>
				{/foreach}
				</tbody>
			</table>
		</div>
		<!-- テーブル end -->
	</div>
	<!-- コンテンツエリア end -->

</div>
<!-- メインコンテンツ end -->


{include file="./common/footer.tpl"}
