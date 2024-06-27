{include file="./common/header.tpl"}

<!-- メインコンテンツ start -->
<div id="mi_main_contents">
	<!-- コンテンツエリア start -->
	<div id="mi_content_area">
		<!-- コンテンツタイトル start -->
		<div class="mi_content_title">
			<h1><span class="icon-report mi_content_title_icon"></span>{$staffDict.staff_type}集計</h1>
		</div>
		<!-- コンテンツタイトル end -->
		
		<!-- エラーメッセージ表示エリア begin -->
		<!-- エラーメッセージ表示エリア end -->

		<!-- ページネーション start -->
		<div class="mi_pagenation">
			<div class="mi_pagenation_result">該当件数 <span>{$list->getCount()}</span>件</div>
			{$list->getLinkParam($pram)}
			{$list->getPerPagePram($pram)}
		</div>
		<!-- ページネーション end -->

		<!-- テーブル start -->
		<div class="mi_table_main_wrap">
			<table class="mi_table_main">
				<thead>
					<tr>
						<th>{$list->getOrderArrow('作成されたURL', 'staff_id')}</th>
						<th style="width: 140px;">{$list->getOrderArrow('アクセス回数', 'room_access_cnt')}</th>
						<th style="width: 140px;">{$list->getOrderArrow('利用回数', 'room_enter_cnt')}</th>
					</tr>
				</thead>
				<tbody>
					{assign var=i value="0" scope="global"}
					{foreach from=$list->getList() item=row}
						<tr>
							<td style="text-align: left;">
								{if ($row.collabo_id==0)}https://meet-in.jp/room/{else}https://online.sales-crowd.jp/room/{/if}{$row.room_name|escape}
							</td>
							<td style="text-align: right;">{$row.room_access_cnt}</td>
							<td style="text-align: right;">{$row.room_enter_cnt}</td>
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
