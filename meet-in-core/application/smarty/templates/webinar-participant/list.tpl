{include file="./common/header.tpl"}

<script src="/js/webinar.js?{$application_version}"></script>
<script src="/js/webinar_participant.js?{$application_version}"></script>
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
			<a href="/webinar/list">ウェビナー一覧</a>&nbsp;&gt;&nbsp;
			<a href="/webinar/detail?id={$webinarId}">ウェビナー詳細</a>&nbsp;&gt;&nbsp;
			参加者一覧
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
			<div class="webinar_detail_tab current_webinar_detail_tab">参加者一覧（{$webinar.current_participant_count}）</div>
			<a href="/webinar/questionnaire-list?id={$webinarId}"><div class="webinar_detail_tab">アンケート結果</div></a>
			<a href="/webinar/detail?id={$webinarId}"><div class="webinar_detail_tab ">概要</div></a>
		</div>
		<div class="clear_both"></div>
		<!-- タブ領域 end -->

		<!-- 検索とボタン領域 start -->
		<div class="mi_content_title">
			<div class="webinar_list_search_area">
				<form id="search_form" action="/webinar-participant/list" method="get">
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
					<a href="/webinar-participant/regist?webinarId={$webinarId}" class="mi_title_action_btn click-fade">
						<span class="icon-parsonal-puls"></span>
						<span>追加</span>
					</a>
					<a href="javascript:void(0);" class="mi_title_action_btn click-fade show-modal-content-mail" data-mail-type="multiple-participant">
						<span class="icon-mail"></span>
						<span>メール</span>
					</a>
					<a href="javascript:void(0);" name="lnk_delete_participant" class="mi_title_action_btn del_chk click-fade" id="del_chk">
						<span class="icon-delete"></span>
						<span>削除</span>
					</a>
				</div>
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
			<div class="pagenation_counts_area">
				<div class="pagenation_count_title">参加者数／予約数／定員数</div>
				<div class="pagenation_count_number">{$webinar.webinarEnterRoomCount}／{$webinar.current_participant_count}／{$webinar.max_participant_count}</div>
			</div>
			<div class="pagenation_counts_area mgl_50">
				<div class="pagenation_count_title">キャンセル数</div>
				<div class="pagenation_count_number">{$webinar.webinarCancelCount}</div>
			</div>
			{$list->getLink()}
			{$list->getPerPage()}
		</div>
		<!-- ページネーション end -->

		{if $webinar.current_participant_count > 0}
			<!-- テーブル start -->
			<div class="mi_table_main_wrap">
				<input type="hidden" name="webinarId" value="{$webinarId}">
				<table class="mi_table_main width_unset">
					<thead>
						<tr>
							<th>選択</th>
							<th>メール</th>
							<th>詳細</th>
							<th>ステータス</th>
							<th>{$list->getOrderArrow('氏名', 'name')}</th>
							<th>{$list->getOrderArrow('フリガナ', 'kana')}</th>
							<th>{$list->getOrderArrow('会社名', 'company_name')}</th>
							<th>{$list->getOrderArrow('部署', 'company_department')}</th>
							<th>{$list->getOrderArrow('役職', 'company_position')}</th>
							<th>{$list->getOrderArrow('メール送信履歴', 'latest_mail_subject')}</th>
							<th>{$list->getOrderArrow('予約日', 'create_date')}</th>
							<th>{$list->getOrderArrow('入室日', 'entry_room_date')}</th>
							<th>{$list->getOrderArrow('退室日', 'exit_room_date')}</th>
						</tr>
					</thead>
					<tbody>
						{foreach from=$list->getList() item=row}
							<tr>
								<td class="mi_table_item_1"><input type="checkbox" name="chk_participant_id" value="{$row.id}">
								<td>
									<a href="javascript:void(0);" class="show-modal-content-mail" data-mail-type="single-participant" data-participant-id="{$row.id}"><span class="icon-mail"></span></a>
								</td>
								<td>
									<a href="/webinar-participant/detail?webinarId={$webinarId}&id={$row.id}" class=""><span class="icon-edit"></span></a>
								</td>
								<td>
									{assign var=end_holding_date value=$webinar.holding_date|strtotime}
									{if ($end_holding_date+60*$webinar.holding_time|date_format:'%Y-%m-%d %H:%M' < $smarty.now|date_format:'%Y-%m-%d %H:%M') && is_null($row.entry_room_date)}
										<!-- 参加申請をしたが、ウェビナーに参加しなかったユーザーはキャンセルとする -->
										キャンセル
									{elseif $row.cancel_flg == 1}
										キャンセル
									{elseif !is_null($row.entry_room_date)}
										参加済み
									{else}
										予約中
									{/if}
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
{include file="./common/webinar-mail.tpl"}
<!-- ====================================== モーダルコンテンツ[end] ======================================== -->

{include file="./common/footer.tpl"}
