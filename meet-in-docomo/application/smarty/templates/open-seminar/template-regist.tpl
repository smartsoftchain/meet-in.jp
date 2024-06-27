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
	<!-- コンテンツエリア start -->
	<div id="mi_content_area">

		<!-- コンテンツタイトル start -->
		<div class="mi_content_title mgb_unset">
			<h1><span class="icon-folder mi_content_title_icon"></span>ウェビナーテンプレート設定</h1>
		</div>
		<!-- コンテンツタイトル end -->

		<!-- 説明領域 begin -->
		<div class="os_description_area">
			ウェビナーのテンプレートを設定します。
		</div>
		<!-- 説明領域 end -->
		
		<!-- メッセージ表示エリア begin -->
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
		{if $registCompleteFlg == 1}
			<p class="errmsg mb10"><strong>ウェビナーデフォルト設定を登録しました。</strong></p>
		{/if}
		<!-- メッセージ表示エリア end -->
		<form action="/open-seminar/template-regist" method="post" id="openSeminarTemplate_form" enctype="multipart/form-data">
			<!-- テーブル start -->
			<div class="mi_table_main_wrap mi_table_input_right_wrap">
				<table class="mi_table_input_right mi_table_main">
					<tbody>
						<tr>
							<th class="mi_tabel_title">テンプレート名<span class="required">必須</span></th>
							<td class="mi_tabel_content">
								<input type="text" class="text_long" name="name" value="{$openSeminar.name|escape}" />
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">所要時間（分入力）<span class="required">必須</span></th>
							<td class="mi_tabel_content">
								<input type="text" class="text_short" name="holding_time" value="{$openSeminar.holding_time|escape}" /> 分
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">最大参加人数<span class="required">必須</span></th>
							<td class="mi_tabel_content">
								<input type="text" class="text_short" name="max_participant_count" value="{$openSeminar.max_participant_count|escape}" /> 人
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title line_height30">ウェビナーお問い合わせ<br>受信メールアドレス</th>
							<td class="mi_tabel_content">
								<input type="text" class="text_long" name="mail_address" value="{$openSeminar.mail_address|escape}" />
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title line_height30">ロゴ画像<br>ウェビナー画面<div class="webinar_img_comment_area">※ウェビナー画面の<br>ヘッダーに表示されます。</div></th>
							<td class="mi_tabel_content">
								<div>
									<!-- 初期表示または、アップロードされていない場合 -->
									<img src="
											{if $openSeminar.logo_webinar_path != ""}
												{$openSeminar.logo_webinar_path}?{$smarty.now}
											{else}
												/img/no-image.png
											{/if}
										" id="img_display_logo_webinar" alt="Image" class="namecard-profile-contain">
									<div class="file-button-area">
										<label for="logoWebinarImg" class="select_file">
											ファイルを選択
											<input type="file" id="logoWebinarImg" name="logo_webinar_path" class="display_none">
										</label>
										<div>
											<span class="delete_file" id="deleteLogoWebinarImg">
												ファイルを削除
											</span>
										</div>
									</div>
									<input type="hidden" name="logo_webinar_path_data" value='{$openSeminar.logo_webinar_path_data}'/>
									<input type="hidden" name="delete_img_logo_webinar_flg" value="0"/>
								</div>
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">テーマカラー</th>
							<td class="mi_tabel_content">
								<input type="text" class="text_short colorSelector form-element-control" name="theme_color" value="{$openSeminar.theme_color|escape}" {if $openSeminar.theme_color != ""}style="background-color: {$openSeminar.theme_color}"{/if} autocomplete="off"/>
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">文字カラー</th>
							<td class="mi_tabel_content">
								<label><input type="radio" class="" name="character_color" value="1" {if $openSeminar.character_color == 1}checked="checked"{/if}/>黒</label>
								<label><input type="radio" class="" name="character_color" value="2" {if $openSeminar.character_color == 2}checked="checked"{/if}/>白</label>
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
