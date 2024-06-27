{include file="./common/header.tpl"}

{literal}

<script>
	$(function (){
	});
</script>

{/literal}
<!-- メインコンテンツ start -->
<div id="mi_main_contents">
	<!-- トップナビ start -->
	<div id="mi_top_nav">
		<!-- パンくずリスト start -->
		<div class="mi_breadcrumb_list"><a href="/index/menu">TOP</a>&nbsp;&gt;&nbsp;<a href="javascript:void(0);">操作ログ</a></div>
		<!-- パンくずリスト end -->
	</div>
	<!-- トップナビ end -->
	
	<!-- コンテンツエリア start -->
	<div id="mi_content_area">

		<!-- コンテンツタイトル start -->
		<div class="mi_content_title">
			<span class="icon-company mi_content_title_icon"></span>
			<h1>操作ログ一覧</h1>
			<div class="mi_flt-r">
				<form id="search_form" action="/setting-log/operation-log-list" method="get">
					<div class="search_box">
						<input type="text" name="free_word" value="{$free_word}" placeholder="検索内容を入力してください...">
			
						<button class="mi_default_button hvr-fade click-fade">
							<span class="icon-search"></span>
						</button>
						<span class="icon-close search_close_button"></span>
					</div>
				</form>
			</div>
			<div class="mi_flt-r">
				<div class="mi_content_title_option">
					<a href="/setting-log/download-csv" class="mi_title_action_btn">
						<span class="icon-download"></span>
						<span>CSV</span>
					</a>
				</div>
			</div>
		</div>
		<!-- コンテンツタイトル end -->
		
		<!-- エラーメッセージ表示エリア begin -->
		{if $err == 1}
			不正なクライアントIDです。
		{/if}
		<!-- エラーメッセージ表示エリア end -->

		<!-- ページネーション start -->
		<div class="mi_pagenation">
			<div class="mi_pagenation_result">該当件数 <span>{$list->getCount()}</span>件</div>
			{$list->getLink()}
			{$list->getPerPage()}
		</div>
		<!-- ページネーション end -->

		<!-- テーブル start -->
		<div class="mi_table_main_wrap">
			<table class="mi_table_main">
				<thead>
					<tr>
						<th>{$list->getOrderArrow('日時', 'create_time')}</th>
						<th>{$list->getOrderArrow('担当者', 'staff_name')}</th>
						<th>{$list->getOrderArrow('操作内容', 'action_name')}</th>
					</tr>
				</thead>
				<tbody>
					{foreach from=$list->getList() item=row}
						<tr>
							<td>{$row.create_date}</td>
							<td>{$row.staff_name}</td>
							<td>{$row.action_name}</td>
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
