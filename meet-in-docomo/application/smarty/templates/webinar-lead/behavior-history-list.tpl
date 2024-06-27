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
			<a href="/webinar-lead/list">ウェビナーリード一覧</a>&nbsp;&gt;&nbsp;
			ウェビナーリード行動履歴
		</div>
		<!-- パンくずリスト end -->
	</div>
	<!-- トップナビ end -->
	
	<!-- コンテンツエリア start -->
	<div id="mi_content_area">

		<!-- コンテンツタイトル start -->
		<div class="mi_content_title mgb_unset">
			<span class="icon-company mi_content_title_icon"></span>
			<h1>ウェビナーリード詳細</h1>
		</div>
		<!-- コンテンツタイトル end -->

		<!-- タブ領域 begin -->
		<div class="webinar_detail_tab_area">
			<div class="webinar_detail_tab current_webinar_detail_tab width120">行動履歴</div>
			<a href="/webinar-lead/detail?id={$webinarLead.id}"><div class="webinar_detail_tab width120">概要</div></a>
		</div>
		<div class="clear_both"></div>
		<!-- タブ領域 end -->

		<!-- 検索とボタン領域 start -->
		<div class="mi_content_title">
			<div class="webinar_list_search_area">
				<form id="search_form" action="/webinar-lead/behavior-history-list" method="get">
					<div class="search_box">
						<input type="text" name="free_word" value="{$freeWord}" placeholder="検索内容を入力してください...">
						<button class="mi_default_button hvr-fade click-fade">
							<span class="icon-search"></span>
						</button>
						<span class="icon-close search_close_button"></span>
					</div>
				</form>
			</div>
			<!--
			<div class="mi_flt-r">
				<div class="mi_content_title_option">
					<a href="javascript:void(0);" name="lnk_delete_behavior_history" class="mi_title_action_btn del_chk click-fade" id="del_chk">
						<span class="icon-delete"></span>
						<span>削除</span>
					</a>
				</div>
			</div>
			-->
		</div>
		<!-- 検索とボタン領域 end -->

		<!-- 詳細画面ウェビナー名表示領域 begin -->
		<div class="wd_webinar_name_area">
			<div class="wbwna_sub">{$webinarLead.company_name}</div>
			<div class="wbwna_main">{$webinarLead.name}</div>
		</div>
		<!-- 詳細画面ウェビナー名表示領域 end -->

		<!-- ページネーション start -->
		<div class="mi_pagenation mgt_50">
			{$list->getLink()}
			{$list->getPerPage()}
		</div>
		<!-- ページネーション end -->
		<!-- テーブル start -->
		<div class="mi_table_main_wrap">
			<table class="mi_table_main">
				<thead>
					<tr>
						<th>選択</th>
						<th>{$list->getOrderArrow('履歴', 'behavior_status')}</th>
						<th>{$list->getOrderArrow('件名', 'mail_subject')}</th>
						<th>{$list->getOrderArrow('更新日', 'create_date')}</th>
					</tr>
				</thead>
				<tbody>
					{foreach from=$list->getList() item=row}
						<tr>
							<td class="mi_table_item_1"><input type="checkbox" name="chk_participant_id" value="{$row.id}">
							<td class="text_align_left">
								{$behaviorHistorys[$row.behavior_status]}
							</td>
							<td class="text_align_left">
								{if $row.send_mail_flg}
									<a href="javascript:void(0);" class="lnk_history_mail show-modal-mail-detail" id="{$row.webinar_lead_id}_{$row.id}" data-display-type="lead">
										{$row.mail_subject}
									</a>
								{else}
									{$row.mail_subject}
								{/if}
							</td>
							<td class="text_align_left">{$row.create_date}</td>
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

<!-- ====================================== モーダルコンテンツ[start] ====================================== -->
{include file="./common/webinar-mail.tpl"}
<!-- ====================================== モーダルコンテンツ[end] ======================================== -->

{include file="./common/footer.tpl"}
