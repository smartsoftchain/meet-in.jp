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
			// maetrial_delete_flg[0],"material_id"/ [1],"document_guard_key_flg"
			var maetrial_delete_flg = this.value.split(",");

			// 鍵がついていなければ削除
			if(maetrial_delete_flg[1]==0){
				ids.push(maetrial_delete_flg[0]);
			}
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
			let json = jQuery.parseJSON(res);
			location.reload();
		}).fail(function(res) {
			console.log('fail');
		});
	});
	$("[id=mi_document_list_video_icon]").on('timeupdate', function (event) {
		if ($(this)[0].currentTime >= 3) {
			$(this)[0].pause();
		}
	});
});
$(document).on({
    mouseenter:function(){
		$(this).find('.mi_document_list_video_icon')[0].currentTime = 1;
        $(this).find('.mi_document_list_video_icon')[0].play(); 
    },
    mouseleave:function(){
        $(this).find('.mi_document_list_video_icon')[0].pause();
    }
},'.video');

// 一括削除のボタンをクリック時に発火
function file_all_delete(){
	if(document.getElementById("file_all_delete").checked){
		// 全選択
		$('input.document_delete_check').prop('checked', true);
	}else{
		// 全解除
		$('input.document_delete_check').prop('checked', false);
	}
}

// 資料の絞り込み
$(function () {
	$('[name="document_narrow_flg"]').change(function(){
		document.document_narrow_form.action="/admin/material-list";
		document.document_narrow_form.method="POST";
		document.document_narrow_form.submit();
	})
})
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

.mi_content_material_search_area {
	margin-bottom: 20px;
}

.mi_document_list_video_icon {
  max-width: 155px;
  height: auto;
  margin: 10px 0;
}

-->
</style>

{/literal}

<div id="mi_main_contents">
	<!-- トップナビ  start -->
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
				<!-- 検索フォームエリア strat -->
				<div class="mi_flt-r">
					<form id="search_form" action="/admin/material-list" method="get">
						<div class="search_box">
							<input type="text" class="text_search" name="free_word" value="{$freeWord}" placeholder="検索内容を入力してください..." class="mi_active">

							<button class="mi_default_button hvr-fade click-fade">
								<span class="icon-search"></span>
							</button>
							<span class="icon-close search_close_button"></span>
						</div>
					</form>
				</div>
				<!-- 検索フォームエリア end -->
				<div class="mi_flt-r">
					<div class="mi_content_title_option">
						<a href="/admin/material-edit" class="mi_title_action_btn click-fade">
							<span class="icon-upload"></span>
							<span>追加</span>
						</a>
						{if ($user.staff_role == "AA_1" || $user.staff_role == "AA_2" || $user.staff_role == "CE_1" || $user.delete_general_authority_flg || ($user.staff_role == "CE_2" && $user.delete_general_authority_flg == 1))}
						<a href="javascript:void(0);" name="del_chk" class="mi_title_action_btn del_chk click-fade" id="del_chk">
							<span class="icon-delete"></span>
							<span>削除</span>
						</a>
						{/if}
	<!--
						<a href="javascript:void(0);" name="share_chk" class="mi_title_action_btn share_chk" id="share_chk">
							<span class="icon-share"></span>
							<span>共有</span>
						</a>
	-->
					</div>
				</div>
		</div>
		<div class="mi_content_material_search_area">
				{if ($user.staff_role == "AA_1" || $user.staff_role == "AA_2" || $user.staff_role == "CE_1" )}
					<form name="document_narrow_form">絞り込み
						<label><input type="radio" class="document_narrow_flg" name="document_narrow_flg" value="0"　data="{$smarty.session.user.staff_id}" {if $document_narrow_flg == 0}checked{/if}>{$user.staff_firstname}{$user.staff_lastname}</label>
						<label><input type="radio" class="document_narrow_flg" name="document_narrow_flg" value="1" data="{$smarty.session.user.staff_id}" {if $document_narrow_flg == 1}checked{/if}>全体</label>
					</form>
				{/if}
		</div>
		<!-- コンテンツタイトル end -->
		<!-- ファイルサイズ表示 begin -->
		{if $user.trialUserFlg != 1}
			<div>
				[現在登録サイズ合計：{$materialSizeDict.allMaterialSize}]&nbsp;/&nbsp;[最大登録サイズ：{$materialSizeDict.maxMaterialSize}]
			</div>
		{/if}
		<!-- ファイルサイズ表示 end -->

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
			<div class="file_count_wrap">
				{if ($user.staff_role == "AA_1" || $user.staff_role == "AA_2" || $user.staff_role == "CE_1" || $user.delete_general_authority_flg || ($user.staff_role == "CE_2" && $user.delete_general_authority_flg == 1))}
					<span class="file_all_delete"><input type="checkbox" onchange="file_all_delete();" id="file_all_delete">一括削除</span>
				{/if}
				<span class="mi_flt-r">該当件数 <span>{$list->getCount()}</span>件</span>
			</div>

			{$list->getLink()}
			{$list->getPerPage()}
		</div>
		<!-- ページネーション end -->
		<!-- テーブル start -->
		<div class="mi_table_main_wrap">
			<table class="mi_table_main document_list">
				<tbody name="document_list_table">
				{foreach from=$list->getList() item=row}
					<tr>
						<td class="mi_table_item_1">
								{if ($row.document_guard_key_flg == 0) && ($user.staff_role == "CE_2") || ($row.document_guard_key_flg == 0) && ($user.staff_role == "CE_1") || ($row.document_guard_key_flg == 0) && ($user.staff_role == "AA_1") || ($row.document_guard_key_flg == 0) && ($user.staff_role == "AA_2") }
									{if ($user.staff_id === $row.create_staff_id) && ($user.staff_role == "CE_2") || $user.staff_role == "CE_1" || $user.staff_role == "AA_1" || $user.staff_role == "AA_2" }
										<input type="checkbox" name="chk_{$row.material_id}" value="{$row.material_id},{$row.document_guard_key_flg}" id="chk_{$row.material_id}" class="document_delete_check">
									{/if}
								{/if}
						</td>
						<td>
							{if ($row.material_type == 0 || $row.material_type == 1 || $row.material_type == 2)}
								<img src="/cmn-data/{$row.material_id|md5}-1.{$row.material_ext}" alt="画像" class="mi_document_list_document_icon"/>
							{elseif ($row.material_type == 3)}
								<div class="video">
									<video src=/cmn-data/{$row.material_id|md5}.mp4 id="mi_document_list_video_icon" class="mi_document_list_video_icon" muted></video>
								</div>
							{else}
								<img src="/img/test.jpg" alt="画像" class="mi_document_list_video_icon"/>
							{/if}
						</td>
						<td>
							<h2>{$row.material_name}</h2>{if $row.document_guard_key_flg == 1}<span class="icon-login video_lock">&nbsp;鍵</span>{/if}
							{if ($row.material_type == 0 || $row.material_type == 2)}
								<span class="icon-memo">&nbsp;資料</span>
							{elseif ($row.material_type == 3)}
								<span class="icon-memo">&nbsp;映像</span>
							{else}
								<span class="icon-memo">&nbsp;URL</span>
							{/if}
							{if $row.shareable_flg == 0}

							{else}
								<span class="icon-share">&nbsp;共有中</span><br>
							{/if}
							<div>更新日 / <span> {$row.update_date}</span></div>
							{if ($row.material_type != 3)}
							<div>ファイルサイズ / <span>{$row.convTotalSize}</span></div>
							{/if}
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
