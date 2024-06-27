{include file="./common/header.tpl"}

{literal}
<script>
$(function (){
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
			url: "delete-audio-text",
			type: "POST",
			dataType: "text",
			data: {
					"ids" : ids.join(','),
			},
		}).done(function(res) {
			location.reload();
		}).fail(function(res) {
			console.log('fail');
		});
	});
});
</script>
<style>

	.mi_text_content_title {
		width: 100%;
		height: 50px;
		margin-bottom: 20px;
	}

	.mi_text_content_title h1 {
		color: #555;
		float: left;
		font-size: 20px;
		line-height: 50px;
		font-weight: bold;
		padding-left: 30px;
	}

	.text_audio_icon {
		position: absolute;
		top:145px;
		width: 25px;
		margin-right: 10px;
	}

	.icon-menu-06 {
		font-size: 50px;
	}

	.text_detail_button {
		width: 15px!important;
		padding-top: 53px!important;
	}

	.audio_text_data_area {
		width: 300px!important;
	}

	.audio_file_title {
		width: 100px;
    	font-size: 16px;
	}

	.room_name_area {
		width: 100px;
	}

	.create_date_area {
		width: 100px;
	}

	.mi_content_material_search_area {
	margin-bottom: 20px;
	}

</style>
{/literal}
<!-- メインコンテンツ start -->
<div id="mi_main_contents">
    <!-- トップナビ start -->
    <div id="mi_top_nav">
        <!-- パンくずリスト start -->
        <div class="mi_breadcrumb_list">
            <a href="/index/menu">TOP</a>&nbsp;&gt;&nbsp;
            <a href="/negotiation/negotiation-text-list">文字起こしファイル一覧</a>
        </div>
        <!-- パンくずリスト end -->
    </div>
	<!-- トップナビ end -->

	<!-- コンテンツエリア start -->
    <div id="mi_content_area">
        <!-- コンテンツタイトル start -->
        <div class="mi_text_content_title">
            <!-- <span class="icon-folder mi_content_title_icon"></span> -->
            <img src="/img/sp/svg/get-text-main.svg" class="text_audio_icon">
            <h1>文字起こしファイル一覧</h1>
            <div class="mi_flt-r">
				<div class="mi_content_title_option">
					{if ($user.staff_role == "AA_1" || $user.staff_role == "AA_2" || $user.staff_role == "CE_1")}
					<a href="javascript:void(0);" name="del_chk" class="mi_title_action_btn del_chk click-fade" id="del_chk">
						<span class="icon-delete"></span>
						<span>削除</span>
					</a>
					{/if}
				</div>
			</div>
        </div>
		<div class="mi_content_material_search_area">
			<div class="mi_content_text_search_area">
				<!-- 検索フォームエリア start -->
					<form id="search_form" action="/negotiation/negotiation-text-list" method="get">
						<div class="search_box search_box--on">
							<input type="text" class="text_search" name="free_word" value="{$freeWord}" placeholder="検索内容を入力してください..." class="mi_active">
							<button class="text_search_button">
								<span class="icon-search"></span>
							</button>
							<span class="icon-close search_close_button"></span>
						</div>
					</form>
					<!-- 検索フォームエリア end -->
			</div>
		</div>

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
        <div class="mi_pagenation">
			<div class="mi_pagenation_result mi_flt-r">該当件数 <span>{$list->getCount()}</span>件</div>
			{$list->getLink()}
			{$list->getPerPage()}
		</div>
		<div class="mi_table_main_wrap">
			<table class="mi_table_main document_list">
				<tbody>
					{foreach from=$list->getList() item=row}
					<tr>
						<td class="mi_table_item_1">
							<input type="checkbox" name="chk_{$row.id}" value="{$row.id}" id="chk_{$row.id}">
						</td>
						<td class="audio_text_data_area">
							<h2 class="audio_file_title" id="text_title_area">{$row.title}</h2>
							<div class="data_option_detail">
								<div class="room_name_area">{if $row.text_type == "2"}ウェビナー名{else}ルーム名{/if}　/ <span>{$row.room_name}</span></div>
								<div class="create_date_area_box">
									<div class="create_date_area">作成日時 / <span> {$row.create_date}</span></div>
								</div>
								{if $row.update_date}
								<div class="update_date_area">更新日時 / <span> {$row.update_date}</span></div>
								{/if}
							</div>
						</td>
						<td class="text_detail_button">
							<a href="/negotiation/negotiation-text-detail?id={$row.id}" id="text_search"><span class="icon-menu-06"></span></a>
						</td>
					</tr>
					{/foreach}
				</tbody> 
			</table>
		</div>
    </div>
</div>
{include file="./common/footer.tpl"}