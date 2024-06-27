{include file="./common/header.tpl"}

<script src="/js/webinar.js?{$application_version}"></script>
<script src="/src/colorpicker/colorpicker.js"></script>
<link rel="stylesheet" href="/css/webinar.css?{$application_version}">
<link rel="stylesheet" href="/src/colorpicker/css/colorpicker.css">
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
		<div class="mi_breadcrumb_list">
			<a href="/index/menu">TOP</a>&nbsp;&gt;&nbsp;
			<a href="/webinar/list">ウェビナー一覧</a>&nbsp;&gt;&nbsp;
			<a href="/webinar/detail?id={$webinarId}">ウェビナー詳細</a>&nbsp;&gt;&nbsp;
			<a href="/webinar-participant/list?id={$webinarId}">参加者一覧</a>&nbsp;&gt;&nbsp;
			ウェビナー参加者詳細
		</div>
		<!-- パンくずリスト end -->
	</div>
	<!-- トップナビ end -->

	<!-- コンテンツエリア start -->
	<div id="mi_content_area">

		<!-- コンテンツタイトル start -->
		<div class="mi_content_title mgb_unset">
			<h1><span class="icon-folder mi_content_title_icon"></span>ウェビナー参加者詳細</h1>
		</div>
		<!-- コンテンツタイトル end -->

		<!-- タブ領域 begin -->
		<div class="webinar_detail_tab_area">
			<a href="/webinar-participant/behavior-history-list"><div class="webinar_detail_tab width120">行動履歴</div></a>
			<div class="webinar_detail_tab current_webinar_detail_tab width120">概要</div>
		</div>
		<div class="clear_both"></div>
		<!-- タブ領域 end -->

		<!-- 詳細画面ウェビナー名表示領域 begin -->
		<div class="wd_webinar_name_area">
			<div class="wbwna_sub">{$webinarParticipant.company_name}</div>
			<div class="wbwna_main">{$webinarParticipant.name}</div>
		</div>
		<!-- 詳細画面ウェビナー名表示領域 end -->

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

		<form action="/webinar-participant/detail" method="post" id="webinar_participant_form">
			<!-- テーブル start -->
			<div class="mi_table_main_wrap mi_table_input_right_wrap">
				<table class="mi_table_input_right mi_table_main">
					<tbody>
						<tr>
							<th class="mi_tabel_title">名前<span class="required">必須</span></th>
							<td class="mi_tabel_content">
								<input type="text" class="text_long" name="name" value="{$webinarParticipant.name|escape}" />
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">フリガナ<span class="required">必須</span></th>
							<td class="mi_tabel_content">
								<input type="text" class="text_long" name="kana" value="{$webinarParticipant.kana|escape}" />
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">企業名</th>
							<td class="mi_tabel_content">
								<input type="text" class="text_long" name="company_name" value="{$webinarParticipant.company_name|escape}" />
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">部署</th>
							<td class="mi_tabel_content">
								<input type="text" class="text_long" name="company_department" value="{$webinarParticipant.company_department|escape}" />
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">役職</th>
							<td class="mi_tabel_content">
								<input type="text" class="text_long" name="company_position" value="{$webinarParticipant.company_position|escape}" />
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">電話番号<span class="required">必須</span></th>
							<td class="mi_tabel_content">
								<input type="text" class="text_long" name="tel_number" value="{$webinarParticipant.tel_number|escape}" />
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">メールアドレス<span class="required">必須</span></th>
							<td class="mi_tabel_content">
								<input type="text" class="text_long" name="mail_address" value="{$webinarParticipant.mail_address|escape}" />
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">住所<span class="required">必須</span></th>
							<td class="mi_tabel_content">
								〒<input type="text" class="text_postcode1" name="postcode1" value="{$webinarParticipant.postcode1|escape}" />-
								<input type="text" class="text_postcode2" name="postcode2" value="{$webinarParticipant.postcode2|escape}" />
								<input type="text" class="text_street_address" name="street_address" value="{$webinarParticipant.street_address|escape}" />
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">ステータス<span class="required">必須</span></th>
							<td class="mi_tabel_content">
								{assign var=end_holding_date value=$webinar.holding_date|strtotime}
								{if ($end_holding_date+60*$webinar.holding_time|date_format:'%Y-%m-%d %H:%M' < $smarty.now|date_format:'%Y-%m-%d %H:%M')}
									<!-- 開催日後の場合 -->
									{if is_null($webinarParticipant.entry_room_date)}
										<!-- 参加申請をしたが、ウェビナーに参加しなかったユーザー又は、キャンセルフラグが立っている場合はキャンセルとする -->
										<label><input type="radio" class="" disabled=""/>予約中</label>
										<label><input type="radio" class="" disabled="" checked="checked"/>キャンセル</label>
										<label><input type="radio" class="" disabled=""/>参加済み</label>
									{else if !is_null($webinarParticipant.entry_room_date)}
										<!-- 入室日時が存在する場合は参加済み -->
										<label><input type="radio" class="" disabled=""/>予約中</label>
										<label><input type="radio" class="" disabled="" />キャンセル</label>
										<label><input type="radio" class="" disabled="" checked="checked"/>参加済み</label>
									{/if}
								{else}
									<!-- 開催日前の場合 -->
									{if $webinarParticipant.cancel_flg == 1}
										<!-- [開催前]でキャンセルフラグが立っている場合 -->
										<label><input type="radio" class="" name="status" value="1" />予約中</label>
										<label><input type="radio" class="" name="status" value="2" checked="checked"/>キャンセル</label>
										<label><input type="radio" class="" name="status" value="3" disabled=""/>参加済み</label>
									{else}
										<!-- [開催前]でキャンセルフラグが立っていない場合 -->
										<label><input type="radio" class="" name="status" value="1" checked="checked"/>予約中</label>
										<label><input type="radio" class="" name="status" value="2" />キャンセル</label>
										<label><input type="radio" class="" name="status" value="3" disabled=""/>参加済み</label>
									{/if}
								{/if}
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">備考</th>
							<td class="mi_tabel_content">
								<textarea name="remarks" class="mi_content_textarea">{$webinarParticipant.remarks}</textarea>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
			<!-- テーブル end -->
			<div class="btn_client_submit_area">
				<button type="button" name="submit_button" id="submit_button" class="mi_default_button">登録する</button>
			</div>
		</form>

	</div>
	<!-- コンテンツエリア end -->

</div>
<!-- メインコンテンツ end -->

{include file="./common/footer.tpl"}
