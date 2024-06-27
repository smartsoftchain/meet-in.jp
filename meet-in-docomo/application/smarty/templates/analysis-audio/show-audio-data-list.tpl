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
		if(!confirm('チェックした音声分析データを削除します。よろしいですか？')) {
			return;
		}
		$.ajax({
			url: "/analysis-audio/delete-audio-data-list",
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

	.mi_analysis_content_title h1{
		white-space: nowrap;
	}

	.mi_analysis_content_title {
		width: 100%;
        height: 50px;
        margin-bottom: 20px;
        display: flex;
        font-size: 20px;
        line-height: 50px;
        color: #333333;
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
	}

	.icon-menu-06 {
		font-size: 47px;
		margin-top: 20px;
	}

	.icon-menu-06::before {
		height: 0%;
		color: #B4B4B4!important;
	}

	.text_detail_button {
		vertical-align: middle!important;
		width: 17px!important;
		padding: 0px!important;
		padding-right: 10px!important;
	}

	.audio_text_data_area {
		width: 300px!important;
		padding: 10px!important;
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
	
	#right_arrow_icon {
		margin-top: 10px;
	}
    
    #title_icon {
        color: #0081CC;
        font-size: 24px;
        padding-left: 0px;
    }

    #del_button {
		margin-left: 25%;
    }

    #search_area {
        margin-left: 10px;
    }

    #icon-close-button {
        font-size: 14px;
    }

    .icon-delete-text {
        top: 25%;
	}

	.mi_pagenation_result {
		margin-left: 0px!important;
	}

	.mi_pagenation {
		line-height: 63px!important;
		margin-bottom: 0px!important;
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
            <a href="/analysis-audio/show-audio-data-list">音声分析一覧</a>
        </div>
        <!-- パンくずリスト end -->
    </div>
	<!-- トップナビ end -->

	<!-- コンテンツエリア start -->
    <div id="mi_content_area">
        <!-- コンテンツタイトル start -->
        <div class="mi_analysis_content_title">
            <img class="form_arrow_icon search_modal_form" src="/img/audio-analysis.svg" style="margin-right: 9px; width: 23px;">
            <h1>音声分析一覧</h1>
            <div class="mi_flt-r" id="del_button">
				<div class="mi_content_title_option">
					{if ($user.staff_role == "AA_1" || $user.staff_role == "AA_2" || $user.staff_role == "CE_1")}
					<a href="javascript:void(0);" name="del_chk" class="mi_title_action_btn del_chk click-fade" id="del_chk">
						<span class="icon-delete"></span>
						<span class="icon-delete-text">削除</span>
					</a>
					{/if}
				</div>
            </div>
            <div class="mi_content_material_search_area">
                <div class="mi_content_text_search_area">
                    <!-- 検索フォームエリア start -->
                        <form id="search_form" action="/analysis-audio/show-audio-data-list" method="get">
                            <div class="search_box search_box--on" id="search_area">
                                <input type="text" class="text_search" name="free_word" value="{$freeWord}" placeholder="検索内容を入力してください..." class="mi_active">
                                <button class="text_search_button">
                                    <span class="icon-search"></span>
                                </button>
                                <span class="icon-close search_close_button" id="icon-close-button"></span>
                            </div>
                        </form>
                    <!-- 検索フォームエリア end -->
                </div>
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
							<input type="checkbox" name="chk_{$row.conversation_id}" value="{$row.conversation_id}" id="chk_{$row.conversation_id}">
						</td>
						<td class="audio_text_data_area">
							<h2 class="audio_file_title" id="text_title_area">{$row.room_name}</h2>
							<div class="data_option_detail">
								<div class="create_date_area_box">
									<div class="create_date_area">作成日時 / <span> {$row.conversation_date}</span></div>
								</div>
							</div>
						</td>
						<td class="text_detail_button">
							<a href="/analysis-audio/show-audio-data-detail?id={$row.conversation_id}" id="text_search"><span class="icon-menu-06" id="right_arrow_icon"></span></a>
						</td>
					</tr>
					{/foreach}
				</tbody> 
			</table>
		</div>
    </div>
</div>
{include file="./common/footer.tpl"}