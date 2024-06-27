{include file="./common/header.tpl"}

<script src="/js/webinar.js?{$application_version}"></script>
<script src="/js/webinar_participant.js?{$application_version}"></script>
<script src="/js/webinar_mail.js?{$application_version}"></script>
<link rel="stylesheet" href="/css/webinar.css?{$application_version}">
<!-- メインコンテンツ start -->
<div id="mi_main_contents">
	<!-- トップナビ start -->
	<div id="mi_top_nav">
		<!-- パンくずリスト start -->
		<div class="mi_breadcrumb_list">
			<a href="/index/menu">TOP</a>&nbsp;&gt;&nbsp;
			<a href="/webinar/list">ウェビナー一覧</a>&nbsp;&gt;&nbsp;
			<a href="/webinar/detail?id={$webinarId}">ウェビナー詳細</a>&nbsp;&gt;&nbsp;
			アンケート結果
		</div>
		<!-- パンくずリスト end -->
	</div>
	<!-- トップナビ end -->
	
	<!-- コンテンツエリア start -->
	<div id="mi_content_area">

		<!-- コンテンツタイトル start -->
		<div class="mi_content_title mgb_unset">
			<span class="icon-company mi_content_title_icon"></span>
			<h1>ウェビナー詳細</h1>
		</div>
		<!-- コンテンツタイトル end -->

		<!-- タブ領域 begin -->
		<div class="webinar_detail_tab_area">
			{if $user.staff_role == "AA_1" || $user.staff_role == "AA_2"}
			<!-- MEMO: CEアカウントでも使用できる仕様にするまで非表示にしておく 2021.1.19 -->
			<a href="/webinar-participant/list?id={$webinar.id}"><div class="webinar_detail_tab ">参加者一覧（{$webinar.current_participant_count}）</div></a>
			{/if}
			<div class="webinar_detail_tab current_webinar_detail_tab">アンケート結果</div>
			<a href="/webinar/detail?id={$webinar.id}"><div class="webinar_detail_tab ">概要</div></a>
		</div>
		<div class="clear_both"></div>
		<!-- タブ領域 end -->

		<!-- 検索とボタン領域 start -->
		<div class="mi_content_title">
			<div class="webinar_list_search_area">
				<form id="search_form" action="/webinar/questionnaire-list" method="get">
					<div class="search_box search_box--on">
						<input type="text" name="free_word" value="{$freeWord}" placeholder="検索内容を入力してください..." class="mi_active">
						<button class="mi_default_button hvr-fade click-fade">
							<span class="icon-search"></span>
						</button>
						<span class="icon-close search_close_button"></span>
					</div>
				</form>
			</div>
		</div>
		<!-- 検索とボタン領域 end -->

		<!-- 詳細画面ウェビナー名表示領域 begin -->
		<div class="wd_webinar_name_area">
			<div class="wbwna_sub">セミナータイトル</div>
			<div class="wbwna_main">{$webinar.name}</div>
		</div>
		<!-- 詳細画面ウェビナー名表示領域 end -->

		<!-- ページネーション start -->
		<div class="mi_pagenation mgt_50">
			{$list->getLink()}
			{$list->getPerPage()}
		</div>
		<!-- ページネーション end -->

		{if $list->getCount() > 0}
			<!-- テーブル start -->
			<div class="mi_table_main_wrap">
				<input type="hidden" name="webinarId" value="{$webinar.id}">
				<table class="mi_table_main">
					<thead>
						<tr>
							<th>{$list->getOrderArrow('形式', 'name')}</th>
							<th>{$list->getOrderArrow('アンケート名', 'kana')}</th>
							<th>{$list->getOrderArrow('回答率', 'company_name')}</th>
							<th class="th_date_area">{$list->getOrderArrow('実施日時', 'company_department')}</th>
							<th class="th_move_detail"></th>
						</tr>
					</thead>
					<tbody>
						{foreach from=$list->getList() item=row}
							<tr class="tr_questionnaire_aggregate show-modal-content-questionnaire-aggregate" data-history-id="{$row.history_id}">
								<td class="text_align_left">{$answerTypeNames[$row.answer_type]}</td>
								<td class="text_align_left">{$row.title}</td>
								<td>{$row.answer_rate}％</td>
								<td class="text_align_left">{$row.create_date}</td>
								<td class="td_move_detail"><span class="icon-menu-06 icon_hack_move_detail"></span></td>
							</tr>
						{/foreach}
					</tbody>
				</table>
			</div>
			<!-- テーブル end -->
		{/if}
	</div>
	<!-- コンテンツエリア end -->

</div>
<!-- メインコンテンツ end -->

<!-- ====================================== モーダルコンテンツ[start] ====================================== -->
<div class="modal-content" id="modal-content-questionnaire-aggregate">
	<div class="mi_modal_shadow"></div>
	<div class="inner-wrap mi_modal_default modal_content_questionnaire_aggregate">
		<div class="mcqa_header">
			<div class="mcqa_header_title">アンケート結果を表示しています</div>
		</div>
		<div class="mcqa_contents">
			<div class="mcqac_title_main">■質問内容</div>
			<div class="mcqac_questionnaire_title"></div>
			<div class="mcqac_title_main">■結果</div>
			<div class="mcqac_title_sub">回答率</div>
			<div class="mcqac_answer_rate_area">
				<span class="mcqac_answer_rate"></span>％（<span class="mcqac_answer_count"></span>／<span class="mcqac_answer_max_count"></span>人が回答）
			</div>
			<div class="mcqac_title_sub">内訳</div>
			<div class="mcqac_answer_contents">
				
			</div>
		</div>
		<div class="mcqa_close_area">
			<button type="button" name="btn_close_questionnaire_aggregate" class="mi_default_button">閉じる</button>
		</div>
	</div>
</div>
<!-- ====================================== モーダルコンテンツ[end] ======================================== -->

<!-- 複数選択・2拓のアンケート集計 begin -->
<div id="questionnaire_aggregate_radio_area" class="display_hide">
	<span class="questionnaire_aggregate_number"></span>
	<span class="questionnaire_aggregate_text"></span>
</div>
<!-- 複数選択・2拓のアンケート集計 end -->

<!-- 記述形式のアンケート集計 begin -->
<div id="questionnaire_aggregate_text_area" class="display_hide questionnaire_aggregate_text_area">
	<span class="questionnaire_aggregate_text"></span>
</div>
<!-- 記述形式のアンケート集計 end -->


{include file="./common/footer.tpl"}
