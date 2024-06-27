
{include file="./common/header.tpl"}
<script src="/js/webinar.js?{$application_version}"></script>
<link rel="stylesheet" href="/css/webinar.css?{$application_version}">
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
		if(!confirm('チェックしたアンケートを削除します。よろしいですか？')) {
			return;
		}
		$.ajax({
			url: "delete-questionnaire",
			type: "POST",
			dataType: "text",
			data: {
					"ids" : ids.join(','),
			},
		}).done(function(res) {
            console.log(res)
			location.reload();
		}).fail(function(res) {
			console.log('fail');
		});
	});
    // 共有クリック
    
    $(function() {
		$("#connection_log_menu").mouseover(function(){
			$(".log_wrapper").css('display','block');
		}).mouseout(function(){
			$(".log_wrapper").css('display','none');
		});
	});

	$(function() {
		$("#log_wrapper_top").mouseover(function(){
			$(".log_wrapper").css('display','block');
		});
	});

	$(function() {
		$(".log_wrapper").mouseout(function(){
			$(this).css('display','none');
		});
	});

	$(function() {
		$(".log_wrapper").mouseover(function(){
			$(this).css('display','block');
		});
	});
});
</script>
<style>
.connection_log {
	width: 220px;
	height: 40px;
	background: #FFFFFF;
	display: flex;
	line-height: 40px;
	}

	.connection_log:hover {
		background: #EFEFEF;
	}

	.audio_text_list {
		width: 202px;
		height: 40px;
		display: flex;
		line-height: 40px;
		padding-left: 18px;
		background: #FFFFFF;
	}

	.audio_text_list:hover {
		background: #EFEFEF;
	}

	.log_wrapper {
		width: 220px;
		height: 80px;
		position: absolute;
		z-index: 99999;
		top: 55px;
		right: 320px;
		font-size: 14px;
		box-shadow: 0px 3px 6px #00000029;
		display: none;
	}

	#icon-history {
		margin-top: -5px;
	}

	.audio_text_title {
		margin-left: 8px;
	}

	.log_wrapper_top {
		width: 150px;
		height: 30px;
		opacity: 100%;
		top: 55px;
		right: 320px;
		position: absolute;
    }
    
    .mi_table_questionnaire_data {
        width: 100%;
        height: 40px;
        background: #FFFFFF;
        line-height: 40px;
        display: flex;
    }

    .mi_table_questionnaire_data_header{
        width: 100%;
        height: 40px;
        background: #FFAA00;
        color: #FFFFFF;
        font-size: 14px;
        font-family: ヒラギノ角ゴシック;
        line-height: 40px;
        display: flex;
    }

    .questionnaire_data_checkbox {
        margin-left: 17px;
    }

    .questionnaire_data_edit {
        margin-left: 41px;
    }

    .questionnaire_data_question-name {
        margin-left: 98px;
    }

    .questionnaire_data_update-date {
        margin-left: 330px;
    }

    .questionnaire_data_checkbox_box {
        margin-left: 17px;
    }

    .questionnaire_data_edit_box {
        margin-left: 37px;
        margin-top: 6px;
        width: 50px;
        height: 27px;
        border-radius: 4px;
        border: 1px solid #DBDBDB;
    }

    .questionnaire_data_question-name_box {
        margin-left: 185px;
        position: absolute;
    }

    .questionnaire_data_update-date_box {
        margin-left: 488px;
    }

    .quiestionnaire-edit-img {
        position: absolute;
        position: absolute;
        margin-top: 5px;
        margin-left: 19px;
    }

    .quiestionnaire_input {
        margin-left: 7px;
        margin-bottom: 6px;
    }

    #quiestionnaire-top-img {
        margin-top: 7px;
    }

    .new-quiestionnaire-button {
        width: 180px;
        height: 50px;
        background: #FFAA00;
        position: absolute;
        text-align: center;
        top: 206px;
        right: 27%;
    }

    .mi_delete_quiestionnaire_button_area {
        width: 100px;
        height: 100%;
        float: right;
        margin-right: -45px;
        font-size: 20px;
        margin-top: -20px;
    }

    .mi_text_content_title {
        font-size: 20px;
        margin-bottom: 40px;
    }

    .webinar_quiestionnaire_delete_area {
        float: right;
        margin-top: -50px;
        width: 50px;
        height: 50px;
        background: #FFFFFF;
        text-align: center;
        line-height: 40px;
        border-radius: 4px;
    }

    .webinar_quiestionnaire_list_search_area {
        float: left;
        height: 50px;
    }

    .webinar_quiestionnaire_delete_text {
        font-size: 10px;
        color: #333333;
        font-family: ヒラギノ角ゴシック;
        margin-top: -26px;
    }

    .mi_table_main th {
        text-align: left;
        padding: 0 20px;
    }

    .mi_table_main td {
        text-align: left;
        cursor: pointer;
    }
    .mi_table_main td:nth-child(1),
    .mi_table_main th:nth-child(1) {
        width: 30px;
    }
    .mi_table_main th:nth-child(1) {
        text-align: center;
    }
    .mi_table_main td:nth-child(2),
    .mi_table_main th:nth-child(2) {
        width: 80px;
    }
    .mi_table_main th:nth-child(2) {
        padding: 0 18px;
    }
    .mi_table_main td:nth-child(2) {
        vertical-align: inherit;
    }

    .mi_table_main td:nth-child(3),
    .mi_table_main th:nth-child(3) {
        width: 350px;
    }

    .mi_table_main td input[type="checkbox"],
    .quiestionnaire_allCheck_input {
        vertical-align: 0;
        margin: 0;
        line-height: 42px;
        width: 15px;
        height: 15px;
        border: 1px solid #979797;
    }

    .mi_table_main td a {
        width: 100%;
        height: 100%;
        display: block;
        line-height: 42px;
    }
    .mi_table_main td a:hover {
        color: #222;
    }
    
    .img, a img {
        vertical-align: unset;
    }


    </style>
{/literal}
<!-- メインコンテンツ start -->
<div id="mi_main_contents">
    <!-- トップナビ start -->
    <div id="mi_top_nav">
        <!-- パンくずリスト start -->
        <!-- <div class="mi_breadcrumb_list">
            <a href="/index/menu">TOP</a>&nbsp;&gt;&nbsp;
            <a href="/admin/material-list">資料一覧</a>
        </div> -->
        <!-- パンくずリスト end -->
    </div>
    <!-- トップナビ end -->
    <div class="log_wrapper_top" id="log_wrapper_top"></div>
	<div class="log_wrapper"　id="log_wrapper_list">
		<div class="connection_log">
			<span class="icon-history mi_default_label_icon" id="icon-history" style="color:#e09500"></span>
			<a href="/negotiation/negotiation-list">
				<div class="">接続履歴一覧</div>
			</a>
		</div>
		{if $user.staff_type=="AA" 
		|| ($user.client_id == 614 
				|| $user.client_id == 2 
				|| $user.client_id == 1355 
				|| $user.client_id == 1311 
				|| $user.client_id == 742 
				|| $user.client_id == 1338
				|| $user.client_id == 1292
				|| $user.client_id == 1488
				|| $user.client_id == 651
				|| $user.client_id == 1401
				|| $user.client_id == 1273
				|| $user.client_id == 751
				|| $user.client_id == 1628 
				)
		}
		<div class="audio_text_list">
			<span class="icon-folder mi_content_title_icon"></span>
			<a href="/negotiation/negotiation-text-list">
				<div class="audio_text_title">アンケート集一覧</div>
			</a>
		</div>
		{/if}
	</div>
    <div id="mi_content_area">
        <!-- コンテンツタイトル start -->
        <span class="icon-folder mi_content_title_icon" id="quiestionnaire-top-img"></span>
        <div class="mi_text_content_title">
            <h1>アンケート集一覧</h1>
            <div class="mi_flt-r"></div>
        </div>
        <div class="mi_clearfix">
            <!-- 検索フォームエリア start -->
            <div class="webinar_quiestionnaire_list_search_area">
				<form id="search_form" action="/questionnaire/quiestionnaire-list" method="get">
					<div class="search_box search_box--on">
						<input type="text" name="free_word" value="{$freeWord}" placeholder="検索内容を入力してください..." class="mi_active">
			
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
					<a href="/questionnaire/new-questionnaire" class="float_left">
						<button type="button" class="mi_default_button webinarAddBtn">新規登録</button>
					</a>
					<a href="javascript:void(0);" name="lnk_delete_webinar" class="mi_title_action_btn del_chk click-fade" id="del_chk">
						<span class="icon-delete"></span>
						<span>削除</span>
					</a>
				</div>
            </div>
        </div>
        <div class="mi_pagenation">
            <div class="mi_text_pagenation_result">該当件数 <span>{$list->getCount()}</span>件</div>
            {$list->getLink()}
			{$list->getPerPage()}
        </div>
            <div class="mi_table_main_wrap">
                <table class="mi_table_main">
                    <thead>
                        <tr>
                            <th></th>
                            <th>編集</th>
                            <th>アンケート名</th>
                            <th>更新日時</th>
                        </tr>
                    </thead>
                    <tbody>
                    {foreach from=$list->getList() item=row}
                    <tr class="">
                        <td><input type="checkbox" class="quiestionnaire_input" name="chk_{$row.id}" value="{$row.id}" id="chk_{$row.id}"></td>
                        <td class=""><a href="/questionnaire/questionnaire-detail?id={$row.id}"><img src="/img/quiestionnaire-list-edit.svg" class=""></a></td>
                        <td class=""><a href="/questionnaire/questionnaire-detail?id={$row.id}">{$row.title}</a></td>
                        <td><a href="/questionnaire/questionnaire-detail?id={$row.id}">{$row.update_date}</a></td>
                    </tr>
                    {/foreach}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
{include file="./common/footer.tpl"}