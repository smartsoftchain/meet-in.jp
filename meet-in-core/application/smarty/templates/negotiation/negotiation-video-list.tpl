{include file="./common/header.tpl"}

{literal}

<script>
	$(function (){
		// 並び順が選択された場合のイベント処理
		$(document).on('change', '[id=srt]', function(){
			var $id = $(this).val();
			if($id != ""){
				var url = "/negotiation/negotiation-list?srt=" + $id;
				$(location).attr("href", url);
			}
		});

	});
</script>

<style type="text/css">
<!--

.reset table{
	border: 3px ridge;
	margin: 5px;
	width: 960px;
}

.reset table td {
	padding: 0px 10px;
}

span.font1 {
	font-size: 18px;
	font-weight: bold;
}

table.conect_list td:nth-child(1) {
	padding: 30px 0 30px 39px;
	width: 300px;
}


table.conect_list td:nth-child(1) h2 {
	font-size: 18px;
}

table.conect_list td:nth-child(1) span {
	margin-right: 15px;
}

table.conect_list td {
    cursor: unset;
}

table.conect_list .data {
	line-height: 1.75;
}


-->
</style>

{/literal}


<!-- メインコンテンツ start -->
<div id="mi_main_contents">
	<!-- トップナビ start -->
	<div id="mi_top_nav">
		<!-- パンくずリスト start -->
		<div class="mi_breadcrumb_list"><a href="/index/menu">TOP</a>&nbsp;&gt;&nbsp;<a href="/negotiation/negotiation-video-list">録画履歴一覧</a></div>
		<!-- パンくずリスト end -->
	</div>
	<!-- トップナビ end -->

	<!-- コンテンツエリア start -->
	<div id="mi_content_area">
		<!-- コンテンツタイトル start -->
		<div class="mi_content_title">
			<h1 style="display: flex; align-items: center;">
				<img src="/img/icon_video_orange.png" style="margin-right: 6px; width: 23px; height: auto;">
				<span>録画履歴一覧</span>
			</h1>
		</div>
		<!-- コンテンツタイトル end -->

		<!-- ページネーション start -->
		<div class="mi_pagenation">
			<div>該当件数 <span>{$count}</span>件</div>
		</div>
		<!-- ページネーション end -->

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


		<!-- テーブル start -->
		<div class="mi_table_main_wrap">
			<table class="mi_table_main conect_list">
				<tbody>
				{foreach from=$list item=row}
				<tr>
					<td>
						<h2>{$row.move_title}</h2>

						<div class="data">
							ルーム名  / <span> {$row.room_name}</span><br>

							接続日 / <span>{$row.stime|date_format:"%G.%m.%d"}</span>接続時間 / <span>{$row.stime|date_format:"%T"} 〜 {$row.etime|date_format:"%T"}</span><br>

							ルーム参加者 / <span>{$row.room_member}</span><br>

							会社名 / <span>{if $row.company_name|count_characters > 0}{$row.company_name}{else}未入力{/if}</span>

						</div>
					</td>
					<td>
						<a href="{$row.download_url}">
							<span class="icon-download"></span>
							<div style="font-size: 10px;">動画ダウンロード</div>
						</a>
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
