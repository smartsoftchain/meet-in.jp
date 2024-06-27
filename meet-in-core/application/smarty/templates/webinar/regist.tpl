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
			ウェビナー新規登録
		</div>
		<!-- パンくずリスト end -->
	</div>
	<!-- トップナビ end -->

	<!-- コンテンツエリア start -->
	<div id="mi_content_area">

		<!-- コンテンツタイトル start -->
		<div class="mi_content_title">
			<h1><span class="icon-folder mi_content_title_icon"></span>ウェビナー新規登録</h1>
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

		<form action="/webinar/regist" method="post" id="webinar_form" enctype="multipart/form-data">
			<!-- テーブル start -->
			<div class="mi_table_main_wrap mi_table_input_right_wrap webinarmi_content_title">
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
								<textarea name="outline" class="mi_content_textarea">{$webinar.outline}</textarea>
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
								<input type="text" class="text_short" name="holding_time" value="{$webinar.holding_time|escape}" />
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">最大参加人数<span class="required">必須</span></th>
							<td class="mi_tabel_content">
								<input type="text" class="text_short" name="max_participant_count" value="{$webinar.max_participant_count|escape}" />
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title line_height30">ウェビナーお問い合わせ<br>受信メールアドレス<span class="required">必須</span></th>
							<td class="mi_tabel_content">
								<input type="text" class="text_long" name="mail_address" value="{$webinar.mail_address|escape}" />
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title line_height30">イメージ画像<div class="webinar_img_comment_area">予約ページなどの<br>イメージに表示されます。</div></th>
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
							<th class="mi_tabel_title line_height30">ロゴ画像<div class="webinar_img_comment_area">予約ページなどの<br>ヘッダーに表示されます。</div></th>
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
							<th class="mi_tabel_title line_height30">ロゴ画像<br>ウェビナー画面<div class="webinar_img_comment_area">ウェビナー画面の<br>ヘッダーに表示されます。</div></th>
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
								<input type="text" class="text_short colorSelector " name="theme_color" value="{$webinar.theme_color|escape}" {if $webinar.theme_color != ""}style="background-color: {$webinar.theme_color}"{/if} autocomplete="off"/>
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
								<textarea name="explanation_text" class="mi_content_textarea">{$webinar.explanation_text}</textarea>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
			<!-- テーブル end -->
			<div class="btn_client_submit_area">
				<button type="button" name="submit_button" id="submit_button" class="mi_default_button">登録する</button>
			</div>
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
