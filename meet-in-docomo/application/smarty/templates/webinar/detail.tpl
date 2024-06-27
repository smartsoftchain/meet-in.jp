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
			ウェビナー詳細
		</div>
		<!-- パンくずリスト end -->
	</div>
	<!-- トップナビ end -->

	<!-- コンテンツエリア start -->
	<div id="mi_content_area">

		<!-- コンテンツタイトル start -->
		<div class="mi_content_title mgb_unset">
			<h1><span class="icon-folder mi_content_title_icon"></span>ウェビナー詳細</h1>
		</div>
		<!-- コンテンツタイトル end -->

		<!-- タブ領域 begin -->
		<div class="webinar_detail_tab_area">
			{if $user.staff_role == "AA_1" || $user.staff_role == "AA_2"}
			<!-- MEMO: CEアカウントでも使用できる仕様にするまで非表示にしておく 2021.1.19 -->
			<a href="/webinar-participant/list?id={$webinar.id}"><div class="webinar_detail_tab">参加者一覧（{$webinar.current_participant_count}）</div></a>
			{/if}
			<a href="/webinar/questionnaire-list?id={$webinar.id}"><div class="webinar_detail_tab">アンケート結果</div></a>
			<div class="webinar_detail_tab current_webinar_detail_tab">概要</div>
		</div>
		<div class="clear_both"></div>
		<!-- タブ領域 end -->

		<!-- 詳細画面ウェビナー名表示領域 begin -->
		<div class="wd_webinar_name_area">
			<div class="wbwna_sub">セミナータイトル</div>
			<div class="wbwna_main">{$webinar.name}</div>
		</div>
		<!-- 詳細画面ウェビナー名表示領域 end -->
		<div class="webinar_reaction_area">
			<div class="reaction_area">
				<img src="/img/heart.svg" alt="いいね" class="reaction_icon"/><div class="reaction_count">{if $webinar.nice_count==""}-{else}{$webinar.nice_count}{/if}</div>
			</div>
			<div class="reaction_border"></div>
			<div class="reaction_area">
				<img src="/img/smile.svg" alt="なるほど" class="reaction_icon"/><div class="reaction_count">{if $webinar.smile_count==""}-{else}{$webinar.smile_count}{/if}</div>
			</div>
			<div class="reaction_border"></div>
			<div class="reaction_area">
				<img src="/img/nice.svg" alt="拍手" class="reaction_icon"/><div class="reaction_count">{if $webinar.applause_count==""}-{else}{$webinar.applause_count}{/if}</div>
			</div>
			<div class="clear_both"></div>
		</div>
		<!-- 詳細画面反応表示領域 begin -->

		<!-- 詳細画面反応表示領域 end -->

		<!-- 入場ボタン表示領域 begin -->
		{if $webinarAvailableFlg}
			<div class="webinar_detail_btn_admission_area">
				<a href="{$webinarUrl}"><button type="button" name="" id="" class="width250">入場する</button></a>
			</div>
		{/if}
		<!-- 入場ボタン表示領域 end -->
		
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
		<form action="/webinar/detail" method="post" id="webinar_form" enctype="multipart/form-data">
			<!-- テーブル start -->
			<div class="mi_table_main_wrap mi_table_input_right_wrap">
				<table class="mi_table_input_right mi_table_main">
					<tbody>
						<tr>
							<th class="mi_tabel_title">ウェビナー名<span class="required">必須</span></th>
							<td class="mi_tabel_content">
								<input type="text" class="text_long" name="name" value="{$webinar.name|escape}" />
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">ウェビナー概要</th>
							<td class="mi_tabel_content">
								<textarea name="outline" style="height: 180px; width: 80%;" class="mi_content_textarea">{$webinar.outline}</textarea>
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">開催日時<span class="required">必須</span></th>
							<td class="mi_tabel_content">
								<input type="text" class="text_short" name="holding_date" value="{$webinar.holding_date|escape|date_format:"%Y/%m/%d"}" autocomplete="off" />
								<select name="holding_mm" class="time_select">
									{foreach from=$hours item=hour}
										<option value="{$hour}">{$hour}</option>
									{/foreach}
									
								</select>
								<select name="holding_mi" class="time_select">
									{foreach from=$minutes item=minute}
										<option value="{$minute}">{$minute}</option>
									{/foreach}
								</select>
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">所要時間（分入力）<span class="required">必須</span></th>
							<td class="mi_tabel_content">
								<input type="text" class="text_short" name="holding_time" value="{$webinar.holding_time|escape}" /> 分
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">最大参加人数<span class="required">必須</span></th>
							<td class="mi_tabel_content">
								<input type="text" class="text_short" name="max_participant_count" value="{$webinar.max_participant_count|escape}" /> 人
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title line_height30">ウェビナーお問い合わせ<br>受信メールアドレス<span class="required">必須</span></th>
							<td class="mi_tabel_content">
								<input type="text" class="text_long" name="mail_address" value="{$webinar.mail_address|escape}" />
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title line_height30">イメージ画像<div class="webinar_img_comment_area">※予約ページなどの<br>イメージに表示されます。</div></th>
							<td class="mi_tabel_content">
								<div>
									<img src="
											{if $webinar.img_path != ""}
												{$webinar.img_path}?{$smarty.now}
											{else}
												/img/no-image.png
											{/if}
										" id="img_display_webinar" alt="Image" class="namecard-profile-contain">
									<div class="file-button-area">
										<label for="webinarImg" class="select_file">
											ファイルを選択
											<input type="file" id="webinarImg" name="img_path" class="display_none">
										</label>
										<div>
											<span class="delete_file" id="deleteWebinarImg">
												ファイルを削除
											</span>
										</div>
									</div>
									<input type="hidden" name="img_path_data" value='{$webinar.img_path_data}'/>
									<input type="hidden" name="delete_img_flg" value="0"/>
								</div>
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title line_height30">ロゴ画像<div class="webinar_img_comment_area">※予約ページなどの<br>ヘッダーに表示されます。</div></th>
							<td class="mi_tabel_content">
								<div>
									<img src="
											{if $webinar.logo_reservation_path != ""}
												{$webinar.logo_reservation_path}?{$smarty.now}
											{else}
												/img/no-image.png
											{/if}
										" id="img_display_logo_reservation" alt="Image" class="namecard-profile-contain">
									<div class="file-button-area">
										<label for="logoReservationImg" class="select_file">
											ファイルを選択
											<input type="file" id="logoReservationImg" name="logo_reservation_path" class="display_none">
										</label>
										<div>
											<span class="delete_file" id="deleteRogoReservationImg">
												ファイルを削除
											</span>
										</div>
									</div>
									<input type="hidden" name="logo_reservation_path_data" value='{$webinar.logo_reservation_path_data}'/>
									<input type="hidden" name="delete_img_logo_reservation_flg" value="0"/>
								</div>
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title line_height30">ロゴ画像<br>ウェビナー画面<div class="webinar_img_comment_area">※ウェビナー画面の<br>ヘッダーに表示されます。</div></th>
							<td class="mi_tabel_content">
								<div>
									<!-- 初期表示または、アップロードされていない場合 -->
									<img src="
											{if $webinar.logo_webinar_path != ""}
												{$webinar.logo_webinar_path}?{$smarty.now}
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
									<input type="hidden" name="logo_webinar_path_data" value='{$webinar.logo_webinar_path_data}'/>
									<input type="hidden" name="delete_img_logo_webinar_flg" value="0"/>
								</div>
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">予約開始日時</th>
							<td class="mi_tabel_content">
								<input type="text" class="text_short" name="from_reservation_date" value="{$webinar.from_reservation_date|escape|date_format:"%Y/%m/%d"}" autocomplete="off" />
								<select name="from_reservation_mm" class="time_select">
									<option value=""></option>
									{foreach from=$hours item=hour}
										<option value="{$hour}">{$hour}</option>
									{/foreach}
								</select>
								<select name="from_reservation_mi" class="time_select">
									<option value=""></option>
									{foreach from=$minutes item=minute}
										<option value="{$minute}">{$minute}</option>
									{/foreach}
								</select>
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">予約終了日時</th>
							<td class="mi_tabel_content">
								<input type="text" class="text_short" name="to_reservation_date" value="{$webinar.to_reservation_date|escape|date_format:"%Y/%m/%d"}" autocomplete="off" />
								<select name="to_reservation_mm" class="time_select">
									<option value=""></option>
									{foreach from=$hours item=hour}
										<option value="{$hour}">{$hour}</option>
									{/foreach}
								</select>
								<select name="to_reservation_mi" class="time_select">
									<option value=""></option>
									{foreach from=$minutes item=minute}
										<option value="{$minute}">{$minute}</option>
									{/foreach}
								</select>
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">テーマカラー</th>
							<td class="mi_tabel_content">
								<input type="text" class="text_short colorSelector form-element-control" name="theme_color" value="{$webinar.theme_color|escape}" {if $webinar.theme_color != ""}style="background-color: {$webinar.theme_color}"{/if} autocomplete="off"/>
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">文字カラー</th>
							<td class="mi_tabel_content">
								<label><input type="radio" class="" name="character_color" value="1" {if $webinar.character_color == 1}checked="checked"{/if}/>黒</label>
								<label><input type="radio" class="" name="character_color" value="2" {if $webinar.character_color == 2}checked="checked"{/if}/>白</label>
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">説明文</th>
							<td class="mi_tabel_content">
								<textarea name="explanation_text" style="height: 180px; width: 80%;" class="mi_content_textarea">{$webinar.explanation_text}</textarea>
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">予約ページURL</th>
							<td class="mi_tabel_content">
								{if $webinarAvailableFlg}
									<a href="{$meetinUrl}" target="_blank" class="webinar_detail_lnk_url">{$meetinUrl}</a>
									<img src="/img/img_copy_link.png" class="wrcca_copy_image icon_copy_url" alt="" data-url="{$meetinUrl}">
								{/if}
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">ウェビナー会場URL</th>
							<td class="mi_tabel_content">
								{if $webinarAvailableFlg}
									<a href="{$webinarUrl}" target="_blank" class="webinar_detail_lnk_url">{$webinarUrl}</a>
									<img src="/img/img_copy_link.png" class="wrcca_copy_image icon_copy_url" alt="" data-url="{$webinarUrl}">
								{/if}
							</td>
						</tr>
					</tbody>
				</table>
			</div>
			<!-- テーブル end -->
			<div class="btn_client_submit_area">
				<button type="button" name="submit_button" id="submit_button" class="mi_default_button">登録する</button>
			</div>
			<!-- コピー完了メッセージ begin -->
			<div class="msg_copy_url display_none">
				<div class="msg_copy_url_message">URLをコピーしました。</div>
			</div>
			<!-- コピー完了メッセージ end -->
			<input type="hidden" name="current_holding_mm" value="{$webinar.holding_mm|escape}" />
			<input type="hidden" name="current_holding_mi" value="{$webinar.holding_mi|escape}" />
			<input type="hidden" name="current_from_reservation_mm" value="{$webinar.from_reservation_mm|escape}" />
			<input type="hidden" name="current_from_reservation_mi" value="{$webinar.from_reservation_mi|escape}" />
			<input type="hidden" name="current_to_reservation_mm" value="{$webinar.to_reservation_mm|escape}" />
			<input type="hidden" name="current_to_reservation_mi" value="{$webinar.to_reservation_mi|escape}" />
		</form>

	</div>
	<!-- コンテンツエリア end -->

</div>
<!-- メインコンテンツ end -->

{include file="./common/footer.tpl"}
