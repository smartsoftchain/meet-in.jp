{include file="./common/header.tpl"}

<script src="/js/webinar.js?{$application_version}"></script>
<script src="/js/webinar_lead.js?{$application_version}"></script>
<script src="/js/webinar_mail.js?{$application_version}"></script>
<script type="text/javascript" src="/lib/trumbowyg/trumbowyg.js"></script>
<script type="text/javascript" src="/lib/trumbowyg/jquery.selection.js"></script>
<script type="text/javascript" src="/lib/trumbowyg/langs/ja.min.js"></script>
<script type="text/javascript" src="/lib/trumbowyg/jquery.filedrop.js"></script>

<link rel="stylesheet" href="/css/webinar.css?{$application_version} /lib/trumbowyg/ui/trumbowyg.min.css">
<!-- メインコンテンツ start -->
<div id="mi_main_contents">
	<!-- トップナビ start -->
	<div id="mi_top_nav">
		<!-- パンくずリスト start -->
		<div class="mi_breadcrumb_list">
			<a href="/index/menu">TOP</a>&nbsp;&gt;&nbsp;
			ウェビナーリード一覧
		</div>
		<!-- パンくずリスト end -->
	</div>
	<!-- トップナビ end -->

	<!-- コンテンツエリア start -->
	<div id="mi_content_area">
		<!-- コンテンツタイトル start -->
		<div class="mi_content_title">
			<span class="icon-folder mi_content_title_icon"></span>
			<h1>ウェビナーリード一覧</h1>
			
		</div>
		<div class="mi_content_title">
			<div class="webinar_list_search_area">
				<form id="search_form" action="/webinar-lead/list" method="get">
					<div class="search_box search_box--on">
						<input type="text" name="free_word" value="{$freeWord}" placeholder="検索内容を入力してください..." class="mi_active">
			
						<button class="mi_default_button hvr-fade click-fade">
							<span class="icon-search"></span>
						</button>
						<span class="icon-close search_close_button"></span>
					</div>
				</form>
			</div>
			<div class="mi_flt-r">
				<div class="mi_content_title_option">
					<a href="/webinar-lead/regist" name="lnk_add_webinar_lead" class="mi_title_action_btn del_chk click-fade">
						<span class="icon-parsonal-puls"></span>
						<span>追加</span>
					</a>
					<a href="/webinar-lead/regist-csv" name="lnk_csv_webinar_lead" class="mi_title_action_btn del_chk click-fade">
						<span class="icon-post-it"></span>
						<span>CSV</span>
					</a>
					<a href="javascript:void(0);" name="lnk_mail_webinar_lead" class="mi_title_action_btn del_chk click-fade show-modal-content-mail" data-mail-type="multiple-lead" >
						<span class="icon-mail"></span>
						<span>メール</span>
					</a>
					<a href="javascript:void(0);" name="lnk_delete_webinar_lead" class="mi_title_action_btn del_chk click-fade">
						<span class="icon-delete"></span>
						<span>削除</span>
					</a>
				</div>
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
			{$list->getLink()}
			{$list->getPerPage()}
		</div>
		<!-- ページネーション end -->
		
		<!-- テーブル start -->
		{if $list->getCount() > 0}
			<div class="mi_table_main_wrap">
				<table class="mi_table_main width_unset">
					<thead>
						<tr>
							<th>選択</th>
							<th>メール</th>
							<th>編集</th>
							<th>{$list->getOrderArrow('氏名', 'name')}</th>
							<th>{$list->getOrderArrow('フリガナ', 'kana')}</th>
							<th>{$list->getOrderArrow('会社名', 'company_name')}</th>
							<th>{$list->getOrderArrow('部署', 'company_department')}</th>
							<th>{$list->getOrderArrow('役職', 'company_position')}</th>
							<th>{$list->getOrderArrow('メール送信履歴', 'latest_mail_subject')}</th>
							<th>{$list->getOrderArrow('作成日', 'create_date')}</th>
							<th>{$list->getOrderArrow('入室日', 'entry_room_date')}</th>
							<th>{$list->getOrderArrow('退室日', 'exit_room_date')}</th>
							<th>{$list->getOrderArrow('登録経路', 'regist_route')}</th>
						</tr>
					</thead>
					<tbody>
						{foreach from=$list->getList() item=row}
							<tr>
								<td class="mi_table_item_1"><input type="checkbox" name="chk_webinar_lead_id" value="{$row.id}">
								<td>
									<a href="javascript:void(0);" class="show-modal-content-mail" data-mail-type="single-lead" data-webinar-lead-id="{$row.id}"><span class="icon-mail"></span></a>
								</td>
								<td>
									<a href="/webinar-lead/detail?id={$row.id}" class=""><span class="icon-edit"></span></a>
								</td>
								<td class="text_align_left">{$row.name}</td>
								<td class="text_align_left">{$row.kana}</td>
								<td class="text_align_left">{$row.company_name}</td>
								<td class="text_align_left">{$row.company_department}</td>
								<td class="text_align_left">{$row.company_position}</td>
								<td class="text_align_left">{$row.latest_mail_subject}</td>
								<td>{$row.create_date|date_format:'%Y.%m.%d'}</td>
								<td>{$row.entry_room_date|date_format:'%Y.%m.%d %H:%M'}</td>
								<td>{$row.exit_room_date|date_format:'%Y.%m.%d %H:%M'}</td>
								<td>{$registRoute[$row.regist_route]}</td>
							</tr>
						{/foreach}
					</tbody>
				</table>
			</div>
		{/if}
		<!-- テーブル end -->
	</div>
	<!-- コンテンツエリア end -->

</div>
<!-- メインコンテンツ end -->

<!-- ====================================== モーダルコンテンツ[start] ====================================== -->
{include file="./common/webinar-mail.tpl"}
<!-- ====================================== モーダルコンテンツ[end] ======================================== -->
{include file="./common/footer.tpl"}
