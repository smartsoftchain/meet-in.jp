{include file="./common/header.tpl"}

<script src="/js/webinar.js?{$application_version}"></script>
<link rel="stylesheet" href="/css/webinar.css?{$application_version}">

<!-- メインコンテンツ start -->
<div id="mi_main_contents">
	<!-- トップナビ start -->
	<div id="mi_top_nav">
		<!-- パンくずリスト start -->
		<div class="mi_breadcrumb_list">
			<a href="/index/menu">TOP</a>&nbsp;&gt;&nbsp;
			ウェビナー一覧
		</div>
		<!-- パンくずリスト end -->
	</div>
	<!-- トップナビ end -->

	<!-- コンテンツエリア start -->
	<div id="mi_content_area">
		<!-- コンテンツタイトル start -->
		<div class="mi_content_title">
			<span class="icon-folder mi_content_title_icon"></span>
			<h1>ウェビナー一覧</h1>
			<div class="webinar_use_time_area">
				<div>
					<span class="webinar_use_time_title">今月のウェビナー基本契約時間</span>
					<span class="webinar_use_time_value">{$displayWebinarUseTime}</span>	
				</div>
				<div>
					<span class="webinar_use_time_title">ウェビナー追加時間</span>
					<span class="webinar_use_time_value">{$displayAddWebinarUseTime}</span>	
				</div>
				<div>
					<span class="webinar_use_time_title">今月のウェビナー利用可能時間</span>
					<span class="webinar_use_time_value">{$displayTotalWebinarUseTime}</span>	
				</div>
			</div>
		</div>
		<div class="mi_content_title webinarmi_content_title">
			<div class="webinar_list_search_area">
				<form id="search_form" action="/webinar/list" method="get">
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
					{if $checkWebinarAvailable}
						<a href="/webinar/regist" class="float_left">
							<button type="button" class="mi_default_button webinarAddBtn">新規登録</button>
						</a>
						<a href="javascript:void(0);" name="lnk_cancel_webinar" class="mi_title_action_btn del_chk click-fade">
						<span><img src="/img/webinar_cancell.svg" class="webinar_cancell_ico"></span>
							<span>中止</span>
						</a>
						<a href="javascript:void(0);" name="lnk_delete_webinar" class="mi_title_action_btn del_chk click-fade" id="del_chk">
							<span class="icon-delete"></span>
							<span>削除</span>
						</a>
					{/if}
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
		<div class="webinar_count_tab_area">
			<a href="/webinar/list?viewType=plan"><div class="webinar_count_tab {if $viewType == 'plan'}current_webinar_count_tab{/if}">予定（{$planCount}件）</div></a>
			<a href="/webinar/list?viewType=end"><div class="webinar_count_tab {if $viewType == 'end'}current_webinar_count_tab{/if}">終了（{$endCount}件）</div></a>
			<a href="/webinar/list?viewType=cancel"><div class="webinar_count_tab {if $viewType == 'cancel'}current_webinar_count_tab{/if}">キャンセル（{$cancelCount}件）</div></a>
			<a href="/webinar/list?viewType=all"><div class="webinar_count_tab {if $viewType == 'all'}current_webinar_count_tab{/if}">全件（{$allCount}件）</div></a>
		</div>
		<!-- テーブル start -->
		<div class="mi_table_main_wrap webinar_list_area">
			<table class="mi_table_main document_list">
				<tbody>
				{foreach from=$list->getList() item=row}
					<!-- 日付計算のためにsmarty変数に開催日を代入する -->
					{assign var=end_holding_date value=$row.holding_date|strtotime}
					<tr>
						<td class="mi_table_item_1">
							<input type="checkbox" name="chk_webinar_id" id="chk_webinar_{$row.id}" data-cancel-flg={$row.cancel_flg} date-current-participant-count="{$row.current_participant_count}" value="{$row.id}">
						</td>
						<td>
							{if ($row.img_path != "")}
								<img src="{$row.img_path}" alt="画像" class="mi_document_list_document_icon"/>
							{else}
								<div class="webinar_no-img-block">
								<img src="/img/webinar_no_img.svg" alt="no img" class="mi_no-img_icon"/>
								</div>
							{/if}
						</td>
						<td>
							<h2 class="list_webinar_name">{$row.name}</h2>
							<div class="webinar_list_dateText">開催日時 : <span> {$row.holding_date|date_format:'%Y-%m-%d %H:%M'}〜{$end_holding_date+60*$row.holding_time|date_format:'%H:%M'}</span></div>
							<div class="webinar_list_inner_count_title_area">
								<span class="webinar_list_inner_count_title">参加者数／予約数／定員数</span>
							</div>
							<div class="webinar_list_inner_count_area">
								<span class="webinar_list_inner_count">{$row.participant_count}／{$row.current_participant_count}／{if is_null($row.max_participant_count)}0{else}{$row.max_participant_count}{/if}名</span>
							</div>
							<div>
								<div class="reaction_area">
									<img src="/img/heart.svg" alt="いいね" class="reaction_icon"/><div class="reaction_count">{if $row.nice_count==""}-{else}{$row.nice_count}{/if}</div>
								</div>
								<div class="reaction_border"></div>
								<div class="reaction_area">
									<img src="/img/smile.svg" alt="なるほど" class="reaction_icon"/><div class="reaction_count">{if $row.smile_count==""}-{else}{$row.smile_count}{/if}</div>
								</div>
								<div class="reaction_border"></div>
								<div class="reaction_area">
									<img src="/img/nice.svg" alt="拍手" class="reaction_icon"/><div class="reaction_count">{if $row.applause_count==""}-{else}{$row.applause_count}{/if}</div>
								</div>
								<div class="clear_both"></div>
							</div>
						</td>
						<td></td>
						<td>
							<a href="/webinar/detail?id={$row.id}"><span class="icon-menu-06"></span></a>
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
