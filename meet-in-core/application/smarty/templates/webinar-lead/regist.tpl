{include file="./common/header.tpl"}

<script src="/js/webinar_lead.js?{$application_version}"></script>
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
			<a href="/webinar-lead/list">ウェビナーリード一覧</a>&nbsp;&gt;&nbsp;
			ウェビナーリード新規登録
		</div>
		<!-- パンくずリスト end -->
	</div>
	<!-- トップナビ end -->

	<!-- コンテンツエリア start -->
	<div id="mi_content_area">

		<!-- コンテンツタイトル start -->
		<div class="mi_content_title">
			<h1><span class="icon-folder mi_content_title_icon"></span>ウェビナーリード新規登録</h1>
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

		<form action="/webinar-lead/regist" method="post" id="webinar_lead_form">
			<!-- テーブル start -->
			<div class="mi_table_main_wrap mi_table_input_right_wrap">
				<table class="mi_table_input_right mi_table_main">
					<tbody>
						<tr>
							<th class="mi_tabel_title">名前<span class="required">必須</span></th>
							<td class="mi_tabel_content">
								<input type="text" class="text_long" name="name" value="{$webinarLead.name|escape}" />
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">フリガナ<span class="required">必須</span></th>
							<td class="mi_tabel_content">
								<input type="text" class="text_long" name="kana" value="{$webinarLead.kana|escape}" />
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">企業名</th>
							<td class="mi_tabel_content">
								<input type="text" class="text_long" name="company_name" value="{$webinarLead.company_name|escape}" />
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">部署</th>
							<td class="mi_tabel_content">
								<input type="text" class="text_long" name="company_department" value="{$webinarLead.company_department|escape}" />
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">役職</th>
							<td class="mi_tabel_content">
								<input type="text" class="text_long" name="company_position" value="{$webinarLead.company_position|escape}" />
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">電話番号<span class="required">必須</span></th>
							<td class="mi_tabel_content">
								<input type="text" class="text_long" name="tel_number" value="{$webinarLead.tel_number|escape}" />
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">メールアドレス<span class="required">必須</span></th>
							<td class="mi_tabel_content">
								<input type="text" class="text_long" name="mail_address" value="{$webinarLead.mail_address|escape}" />
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">住所<span class="required">必須</span></th>
							<td class="mi_tabel_content">
								〒<input type="text" class="text_postcode1" name="postcode1" value="{$webinarLead.postcode1|escape}" />-
								<input type="text" class="text_postcode2" name="postcode2" value="{$webinarLead.postcode2|escape}" />
								<input type="text" class="text_street_address" name="street_address" value="{$webinarLead.street_address|escape}" />
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">備考</th>
							<td class="mi_tabel_content">
								<textarea name="remarks" class="mi_content_textarea">{$webinarLead.remarks}</textarea>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
			<!-- テーブル end -->
			<div class="lead_upload_type_area">
				<label><input type="radio" class="" name="regist_type" value="1" {if $webinarLead.regist_type == 1}checked="checked"{/if}/>メールアドレスの重複をそのまま登録する</label>
				<br>
				<label><input type="radio" class="" name="regist_type" value="2" {if $webinarLead.regist_type == 2}checked="checked"{/if}/>メールアドレスで重複を一意にする</label>
				<br>
				<label>メールアドレスで重複を一意にする場合は、入力したメールアドレスを元にデータベースのデータを纏めます。</label>
			</div>
			<div class="btn_client_submit_area">
				<button type="button" name="submit_button" id="submit_button" class="mi_default_button">登録する</button>
			</div>
		</form>

	</div>
	<!-- コンテンツエリア end -->

</div>
<!-- メインコンテンツ end -->

{include file="./common/footer.tpl"}
