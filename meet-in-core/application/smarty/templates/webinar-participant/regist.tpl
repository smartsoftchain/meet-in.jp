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
			ウェビナー参加者新規登録
		</div>
		<!-- パンくずリスト end -->
	</div>
	<!-- トップナビ end -->

	<!-- コンテンツエリア start -->
	<div id="mi_content_area">

		<!-- コンテンツタイトル start -->
		<div class="mi_content_title">
			<h1><span class="icon-folder mi_content_title_icon"></span>ウェビナー参加者新規登録</h1>
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

		<form action="/webinar-participant/regist" method="post" id="webinar_participant_form">
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
						<!--
						<tr>
							<th class="mi_tabel_title">ステータス<span class="required">必須</span></th>
							<td class="mi_tabel_content">
								<label><input type="radio" class="" name="status" value="{$webinarParticipant.status|escape}" />予約中</label>
								<label><input type="radio" class="" name="status" value="{$webinarParticipant.status|escape}" />キャンセル</label>
								<label><input type="radio" class="" name="status" value="{$webinarParticipant.status|escape}" />参加済み</label>
							</td>
						</tr>
						-->
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
