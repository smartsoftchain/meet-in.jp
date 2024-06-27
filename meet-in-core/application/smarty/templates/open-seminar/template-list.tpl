{include file="./common/header.tpl"}

<script src="/js/webinar.js?{$application_version}"></script>
<link rel="stylesheet" href="/css/webinar.css?{$application_version}">

<!-- メインコンテンツ start -->
<div id="mi_main_contents">

	<!-- コンテンツエリア start -->
	<div id="mi_content_area">
		<!-- コンテンツタイトル start -->
		<div class="mi_content_title">
			<span class="icon-folder mi_content_title_icon"></span>
			<h1>ウェビナーテンプレート一覧</h1>
		</div>
		<div class="mi_content_title">
			<div class="webinar_list_search_area">
				<form id="search_form" action="/open-seminar/template-list" method="get">
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
					<a href="/open-seminar/template-regist" class="float_left">
						<button type="button" class="mi_default_button webinarAddBtn">新規登録</button>
					</a>
					<a href="javascript:void(0);" name="lnk_delete_os_template" class="mi_title_action_btn del_chk click-fade" id="del_chk">
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
		<div class="mi_table_main_wrap webinar_list_area">
			<table class="mi_table_main document_list">
				<tbody>
				{foreach from=$list->getList() item=row}
					<tr>
						<td class="mi_table_item_1">
							<input type="checkbox" name="chk_os_template_id" id="chk_os_template_{$row.id}" data-cancel-flg={$row.cancel_flg} date-current-participant-count="{$row.current_participant_count}" value="{$row.id}">
						</td>
						<td>
							{if ($row.logo_webinar_path != "")}
								<img src="{$row.logo_webinar_path}" alt="画像" class="mi_document_list_document_icon"/>
							{else}
								<div class="webinar_no-img-block">
								<img src="/img/webinar_no_img.svg" alt="no img" class="mi_no-img_icon"/>
								</div>
							{/if}
						</td>
						<td>
							<h2 class="list_webinar_name">{$row.name}</h2>
							<div class="webinar_list_dateText">更新日 : <span> {$row.update_date|date_format:'%Y.%m.%d'}</span></div>
						</td>
						<td></td>
						<td>
							<a href="/open-seminar/template-regist?id={$row.id}"><span class="icon-menu-06"></span></a>
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
