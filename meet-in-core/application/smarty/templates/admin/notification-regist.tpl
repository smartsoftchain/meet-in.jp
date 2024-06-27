{include file="./common/header.tpl"}

<!-- メインコンテンツ start -->
<div id="mi_main_contents">
	<!-- トップナビ start -->
	<div id="mi_top_nav">
		<!-- パンくずリスト start -->
		<div class="mi_breadcrumb_list">
			<a href="/index/menu">TOP</a>&nbsp;&gt;&nbsp;
			<a href="/admin/notification-list">お知らせ一覧</a>&nbsp;&gt;&nbsp;
			{if ($notification.id == null)}
				<a href="/admin/notification-regist">
			{else}
				<a href="/admin/notification-regist?id={$notification.id}">
			{/if}
				{if ($notification.id == null)}お知らせ設定(新規){else}お知らせ設定(編集){/if}
			</a>
		</div>
		<!-- パンくずリスト end -->
	</div>
	<!-- トップナビ end -->

  <!-- コンテンツエリア start -->
	<div id="mi_content_area">

		<!-- コンテンツタイトル start -->
		<div class="mi_content_title">
			<h1><span class="icon-notification mi_content_title_icon"></span>
				{if ($notification.id == null)}お知らせ設定(新規){else}お知らせ設定(編集){/if}
			</h1>
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

		<form action="/admin/notification-regist" method="post" id="material_form" enctype="multipart/form-data">
			{if ($notification.id != null)}
        <input type="hidden" name="id" value="{$notification.id}" />
      {/if}
			<!-- テーブル start -->
			<div class="mi_table_main_wrap mi_table_input_right_wrap_all">
				<table class="mi_table_input_right mi_table_main">
					<tbody>
						<tr>
							<th class="mi_tabel_title">表示状況</th>
							<td class="mi_tabel_content">
								<input type="radio" id="materialtype0" name="display_flg" value="0" {if $notification.display_flg == 0}checked{/if} />非表示
								<input type="radio" id="materialtype1" name="display_flg" value="1" {if $notification.display_flg == 1}checked{/if} />表示
							</td>
						</tr>
            <tr>
							<th class="mi_tabel_title">投稿日</th>
							<td class="mi_tabel_content">
								<input type="date" name="post_date" value="{$notification.post_date|escape}" />
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">タイトル<span class="required">必須</span></th>
							<td class="mi_tabel_content">
								<input type="text" class="mi_default_input input_hidden" name="title" value="{$notification.title|escape}" />
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">本文</th>
							<td class="mi_tabel_content">
								<textarea name="content" class="mi_content_textarea">{$notification.content}</textarea>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
			<!-- テーブル end -->
			<div class="btn_client_submit_area">
				<button type="submit" name="submit_button" id="submit_button" class="mi_default_button">登録する</button>
			</div>
		</form>

	</div>
	<!-- コンテンツエリア end -->

</div>
<!-- メインコンテンツ end -->

{include file="./common/footer.tpl"}
