{include file="./common/header.tpl"}

{literal}

<script>

$(function (){
	var inputFormResult = '<li>\n<span class="input-group-addon">回答</span>\n<input type="text" class="mi_nego_tmpl_input" name="negotiation_result_list[]" value="" />\n<span class="mi_input_clear_btn icon-close"></span>\n</li>';
	var inputFormNextAction = '<li>\n<span class="input-group-addon">回答</span>\n<input type="text" class="mi_nego_tmpl_input" name="negotiation_next_action_list[]" value="" />\n<span class="mi_input_clear_btn icon-close"></span>\n</li>';
	// 登録時の資料ファイルチェック
	$("#submit_button").on('click', function() {
		// ボタン不可に
		$("#submit_button").prop("disabled", true);
		$("#submit_button").text("登録中です...");
		$("#negotiation_tmpl_form").submit();
	});
	// 商談結果の回答追加ボタンクリック
	$("[id=negotiation_result_add_button]").click(function() {
		$('[id=negotiation_tmpl_result_list]').append(inputFormResult);
	});
	// 次回アクションの回答追加ボタンクリック
	$("[id=negotiation_next_action_add_button]").click(function() {
		$('[id=negotiation_tmpl_next_action_list]').append(inputFormNextAction);
	});
	// 回答欄の×ボタン
	$(".negotiation_tmpl_list").on("click", ".mi_input_clear_btn", function() {
		console.log('mi_input_clear_btn');
		$(this).parent('li').remove();
	});
});

</script>

<style type="text/css">
<!--

.mi_nego_tmpl_input {
  width: 270px;
  background: #fff;
  border: 1px solid #e8e8e8;
  text-align: left;
  height: 40px;
  padding: 0px 20px 0px 20px;
  font-size: 14px;
}

/* 必須のスタイル */
.required {
	margin-left: 8px;
	padding: 2px 5px;
	font-size: 12px;
	font-weight: bold;
	line-height: 1.0;
	color: #fff;
	background: #df6b6e;
}

/* エラーメッセージ */
.errmsg {
	font-size: 0.95em;
	line-height: 1.6;
	color: #df6b6d;
	padding-bottom: 15px;
}

.input-group-addon:first-child {
  border-right: 0;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  margin-right: -5px;
}

.input-group-addon:last-child {
  border-right: 0;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  margin-left: 0px;
}

.mi_input_clear_btn {
  width: 20px;
  height: 20px;
  text-align: center;
  line-height: 20px;
  font-size: 10px;
  color: #fff;
  display: inline-block;
  background: #e1e1e1;
  border: 1px solid #e1e1e1;
  border-radius: 20px;
  cursor: pointer;
}

.input-group-addon {
  height:42px;
  padding: 9.5px 12px;
  font-size: 14px;
  font-weight: normal;
  line-height: 1;
  color: #555;
  text-align: center;
  background-color: #eee;
  border: 1px solid #eee;
}

ul.negotiation_tmpl_list > li {
	margin: 10px 0px;
	list-style: none;
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
			<a href="/admin/negotiation-tmpl-list">商談結果テンプレート一覧</a>&nbsp;&gt;&nbsp;
			<a href="/admin/negotiation-tmpl-edit?id={$tmpl.template_id}">商談結果テンプレート設定</a>
		</div>
		<!-- パンくずリスト end -->
	</div>
	<!-- トップナビ end -->

	<!-- コンテンツエリア start -->
	<div id="mi_content_area">

		<!-- コンテンツタイトル start -->
		<div class="mi_content_title">
			<h1><span class="icon-configuration mi_content_title_icon"></span>
				{if ($tmpl.template_id == null)}商談結果テンプレート登録{else}商談結果テンプレート設定{/if}
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

		<form action="/admin/negotiation-tmpl-edit" method="post" id="negotiation_tmpl_form" enctype="multipart/form-data">
			<!-- テーブル start -->
			<div class="mi_table_main_wrap mi_table_input_right_wrap">
				<table class="mi_table_input_right mi_table_main">
					<tbody>
						<tr>
							<th class="mi_tabel_title">タイトル<span class="required">必須</span></th>
							<td class="mi_tabel_content">
								<input type="text" class="mi_default_input" name="template_name" id="template_name" value="{$tmpl.template_name|escape}" />
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">商談結果</th>
							<td class="mi_tabel_content">
								<ul class="negotiation_tmpl_list" id="negotiation_tmpl_result_list">
								{foreach name=tmpl_result from=$tmpl_result_list item=row}
									<li>
										<span class="input-group-addon">回答</span>
										<input type="text" class="mi_nego_tmpl_input" name="negotiation_result_list[]" value="{$row}" />
										{if !$smarty.foreach.tmpl_result.first}<span class="mi_input_clear_btn icon-close"></span>{/if}
									</li>
								{/foreach}
								</ul>
								<button type="button" id="negotiation_result_add_button"><span class="icon-puls"> </span>回答を追加</button>
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">次回アクション</th>
							<td class="mi_tabel_content">
								<ul class="negotiation_tmpl_list" id="negotiation_tmpl_next_action_list">
								{foreach name=tmpl_result from=$tmpl_next_action_list item=row}
									<li>
										<span class="input-group-addon">回答</span>
										<input type="text" class="mi_default_input" name="negotiation_next_action_list[]" value="{$row}" />
										{if !$smarty.foreach.tmpl_result.first}<span class="mi_input_clear_btn icon-close"></span>{/if}
									</li>
								{/foreach}
								</ul>
								<button type="button" id="negotiation_next_action_add_button"><span class="icon-puls"> </span>回答を追加</button>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
			<!-- テーブル end -->
			<div class="btn_client_submit_area">
				<button type="button" name="submit_button" id="submit_button" class="mi_default_button">登録する</button>
			</div>
			<input type="hidden" name="template_id" value="{$tmpl.template_id|escape}" />
			<input type="hidden" name="client_id" value="{$user.client_id|escape}" />
			<input type="hidden" name="staff_type" value="{$user.staff_type|escape}" />
			<input type="hidden" name="staff_id" value="{$user.staff_id|escape}" />
		</form>

	</div>
	<!-- コンテンツエリア end -->

</div>
<!-- メインコンテンツ end -->

{include file="./common/footer.tpl"}
