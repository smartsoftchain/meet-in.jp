{include file="./common/header.tpl"}

{literal}

<script>

var doc_url = '';
document.oncopy = function(event){
	// 通常のコピーイベントをキャンセル
	event.preventDefault();
	// clipboard APIで任意のデータをクリップボードにコピーする
	if(doc_url != "") {
		event.clipboardData.setData('text', doc_url);
		alert('資料のリンクをクリップボードにコピーしました');
		doc_url = '';
	}
};
$(function (){
	// リンク取得クリック
	$("[id^=get_document_link]").click(function() {
		// クリップボードにコピー
		doc_url = $(this).data('url');
		document.execCommand('copy');
	});
	// 削除クリック
	$("[id=del_chk]").click(function() {
		// チェック数分idリスト生成
		var ids = [];
		$("input:checked").each(function() {
			ids.push(this.value);
		});
		if(ids.length == 0) {
			alert('削除対象がありません');
			return;
		}
		if(!confirm('チェックした資料を削除します。よろしいですか？')) {
			return;
		}
		$.ajax({
			url: "delete-material",
			type: "POST",
			dataType: "text",
			data: {
					"material_ids" : ids.join(','),
			},
		}).done(function(res) {
//			var json = jQuery.parseJSON(res);
			location.reload();
		}).fail(function(res) {
			console.log('fail');
		});
	});
	// 共有クリック
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


pre {
	width: 300px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	-o-text-overflow: ellipsis;
}


-->
</style>

{/literal}

<!-- メインコンテンツ start -->
<div id="mi_main_contents">
	<!-- トップナビ start -->
	<div id="mi_top_nav">
		<!-- パンくずリスト start -->
		<div class="mi_breadcrumb_list">
			<a href="/index/menu">TOP</a>&nbsp;&gt;&nbsp;
			<a href="/admin/material-list">資料一覧</a>
		</div>
		<!-- パンくずリスト end -->
	</div>
	<!-- トップナビ end -->
	
	<!-- コンテンツエリア start -->
	<div id="mi_content_area">
		<!-- コンテンツタイトル start -->
		<div class="mi_content_title">
			<span class="icon-folder mi_content_title_icon"></span>
			<h1>資料ファイル一覧</h1>
			<div class="mi_flt-r">
				<div class="mi_content_title_option">
					<a href="/admin/material-edit" class="mi_title_action_btn click-fade">
						<span class="icon-upload"></span>
						<span>追加</span>
					</a>
					<a href="javascript:void(0);" name="del_chk" class="mi_title_action_btn del_chk click-fade" id="del_chk">
						<span class="icon-delete"></span>
						<span>削除</span>
					</a>
<!--
					<a href="javascript:void(0);" name="share_chk" class="mi_title_action_btn share_chk" id="share_chk">
						<span class="icon-share"></span>
						<span>共有</span>
					</a>
-->
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
			<div class="mi_pagenation_result mi_flt-r">該当件数 <span>{$list->getCount()}</span>件</div>
			{$list->getLink()}
			{$list->getPerPage()}
		</div>
		<!-- ページネーション end -->
		<!-- テーブル start -->
		<div class="mi_table_main_wrap">
			<table class="mi_table_main document_list">
				<tbody>
				{foreach from=$list->getList() item=row}
					<tr>
						<td class="mi_table_item_1">
						{if (($row.create_staff_type == $user.staff_type) && ($row.create_staff_id == $user.staff_id)) }
							<input type="checkbox" name="chk_{$row.material_id}" value="{$row.material_id}" id="chk_{$row.material_id}">
						{/if}
						</td>
						<td>
							{if ($row.material_type == 0 || $row.material_type == 1 || $row.material_type == 2)}
								<img src="/cmn-data/{$row.material_id|md5}-1.{$row.material_ext}" alt="画像" class="mi_document_list_document_icon"/>
							{else}
								<img src="/img/test.jpg" alt="画像" class="mi_document_list_document_icon"/>
							{/if}
						</td>
						<td>
							<h2>{$row.material_name}</h2>
							{if ($row.material_type == 0 || $row.material_type == 2)}
								<span class="icon-memo">&nbsp;資料</span>
							{else}
								<span class="icon-memo">&nbsp;URL</span>
							{/if}
							{if $row.shareable_flg == 0}

							{else}
								<span class="icon-share">&nbsp;共有中</span><br>
							{/if}
							<div>更新日 / <span> {$row.update_date}</span></div>
							<div><pre>{if $row.note != ""}{$row.note}{else}備考未入力{/if}</pre></div>
						</td>
						<td>
							{if ($row.material_type == 0)}
							<div id="get_document_link{$row.material_id}" data-url="https://{$serverAddress}/cmn-data/{$row.material_id|md5}.pdf">
								<span class="icon-link"></span><br>リンクを取得
							</div>
							{elseif ($row.material_type == 2)}
							<div id="get_document_link{$row.material_id}" data-url="https://{$serverAddress}/cmn-data/{$row.material_id|md5}-1.{$row.material_ext}">
								<span class="icon-link"></span><br>リンクを取得
							</div>
							{/if}
						</td>
						<td>
							<a href="/admin/material-detail-edit?id={$row.material_id}"><span class="icon-menu-06"></span></a>
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
