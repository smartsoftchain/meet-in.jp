{include file="./common/header.tpl"}

<link rel="stylesheet" href="/css/webinar.css?{$application_version}">
<!-- メインコンテンツ start -->
<div id="mi_main_contents">
	<!-- トップナビ start -->
	<div id="mi_top_nav">
		<!-- パンくずリスト start -->
		<div class="mi_breadcrumb_list"><a href="/index/menu">TOP</a>&nbsp;&gt;&nbsp;<a href="/webinar/list">ウェビナー一覧</a>&nbsp;&gt;&nbsp;<a href="javascript:void(0);">ウェビナー参加者一覧</a></div>
		<!-- パンくずリスト end -->
	</div>
	<!-- トップナビ end -->
	
	<!-- コンテンツエリア start -->
	<div id="mi_content_area">

		<!-- コンテンツタイトル start -->
		<div class="mi_content_title">
			<span class="icon-company mi_content_title_icon"></span>
			<h1>ウェビナー参加者一覧</h1>
			<div class="mi_flt-r">
				<form id="search_form" action="/webinar/webinar-participant-list" method="get">
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

		<!-- ページネーション start -->
		<div class="mi_pagenation">
			<div class="mi_pagenation_result">該当件数 <span>{$list->getCount()}</span>件</div>
			{$list->getLink()}
			{$list->getPerPage()}
		</div>
		<!-- ページネーション end -->
		<!-- テーブル start -->
		<div class="mi_table_main_wrap">
			<table class="mi_table_main width_unset">
				<thead>
					<tr>
						<th>{$list->getOrderArrow('ID', 'id')}</th>
						<th>{$list->getOrderArrow('氏名', 'name')}</th>
						<th>{$list->getOrderArrow('予約番号', 'reservation_number')}</th>
						<th>{$list->getOrderArrow('電話番号', 'tel_number')}</th>
						<th>{$list->getOrderArrow('メールアドレス', 'mail_address')}</th>
						<th>{$list->getOrderArrow('会社名', 'company_name')}</th>
						<th>{$list->getOrderArrow('登録日', 'create_date')}</th>
					</tr>
				</thead>
				<tbody>
					{foreach from=$list->getList() item=row}
						<tr>
							<td>{$row.id}</td>
							<td class="text_align_left">{$row.name}</td>
							<td>{$row.reservation_number}</td>
							<td class="text_align_left">{$row.tel_number}</td>
							<td class="text_align_left">{$row.mail_address}</td>
							<td class="text_align_left">{$row.company_name}</td>
							<td>{$row.create_date}</td>
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
