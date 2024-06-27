{include file="./common/header.tpl"}

{literal}

<style>

/* -------------------------------------------*/
/* form  */
/* -------------------------------------------*/

#approachResultTable td {
	margin: 0;
	padding: 10px 10px 10px 10px;
}

	#approachResultTable td input[type="text"] {
		box-sizing: border-box;
		width: 100%;
	}
/* -------------------------------------------*/
/* 登録メッセージ */
/* -------------------------------------------*/
.registMessage {
    font-size: 1em;
    font-weight: bold;
    color: #ec6d71;
}
</style>

<script>

$(function (){

	// アプローチ結果一覧リスト変更時
	$("#select-approach-result").on("change", function() {
		var selectedApproachResult = $(this).val();
		location.href = "/setting-approach/approach-result?approach_type=" + selectedApproachResult;
	});

	// 「追加」ボタン押下時
	$("#add_row").click(function(){
		var template = Handlebars.compile($('#new-row-template').html());
		$('#approachResultTable tbody').append(template());
	});

 	// 「登録済み」タブ情報を削除
	$(document).on('click', '.delete-alive-approach-result', function(evt) {
		evt.preventDefault();
		if (confirm("登録済みの情報を削除すると、\n集計に影響が出る可能性があります。")) {
			$(this).closest("tr").remove();
		}
	});

	// 「新規登録」タブ情報を削除
	$(document).on('click', '.delete-new-approach-result', function(evt) {
		evt.preventDefault();
		$(this).closest("tr").remove();
	});

// 	// 登録
	$("#regist").click(function(evt){

		evt.preventDefault();
		if (confirm("登録しますが、よろしいですか。")) {
			$("#send_form").submit();
		}
	});
});
</script>
{/literal}


<div id="content-area" class="font-m">

	<!-- メインコンテンツ[start] -->
	<div id="main_contents">

		<!-- 見出し[start] -->
		<div class="heading">
			<div class="pgtitle clearfix">
				<h3>アプローチ結果一覧</h3>
			</div>
		</div>
		<!-- 見出し[end] -->

		<!-- エラー出力箇所 -->
		{include file="./common/error.tpl"}
		<!-- 登録メッセージ出力箇所 -->
		<h3 class="registMessage">
			{foreach from=$errorList item=error}
				{foreach from=$error item=row}
					{$row}<br>
				{/foreach}
			{/foreach}
		</h3>
		<p>アプローチ後使用するアプローチ結果を登録して下さい</p>
		<br>

		<!-- =============== コンテンツ領域（2カラム）[start] ===============  -->
		<div class="article-2clm mgn-t25 clearfix">

			<form action="/setting-approach/approach-result" id="send_form" method="post">

				{html_options name="select_approach_result"
					id="select-approach-result"
					class="form-element-control"
					options=$approachResultDict
					selected=$selected_applorach_result}

				<div id="approachResultTable" class="list-body wfix1 wfix2 mgn-t15">

					<table class="listtable th-c td-c">
						<thead>
							<tr>
								<th>アプローチ結果名<span class="required">必須</span></th>
								<th>使用しているアプローチタブ</th>
								<th>削除</th>
							</tr>							
						</thead>
						<tbody>
							{foreach from=$templateApproachResultList item=row}
							<tr>
								<td>
									<input type="text" name="name[{$selected_applorach_result}_{$row.id}]" class="form-element-control" value="{$row.name}">
								</td>
								<td>
									<input type="hidden" name="tab_name[{$selected_applorach_result}_{$row.id}]" value="{$row.tab_name}">
									{$row.tab_name}
								</td>
								<td>
									{if $row.tab_name == ""}
										<a href="#" class="delete-alive-approach-result"><img src="/img/btn_del.png"></a>
									{/if}
								</td>
							</tr>
							{ /foreach }
						</tbody>
					</table>
				</div>
				{if $selected_applorach_result != 2}
					<p class="add-row mgn-t10"><a id="add_row">追加</a></p>
				{/if}

				<div class="button-list mgn-t10">
					<ul>
						<li class="area1btn">
							<input type="submit" id="regist" class="btn large2" value="登録する" />
						</li>
					</ul>
				</div>

			</form>
		</div>
	</div>
	<!-- メインコンテンツ[end] -->

</div>



{literal}

<!-- 新規行テンプレート -->
<script id="new-row-template" type="text/x-handlebars-template">
<tr>
	<td>
		<input type="text" name="name[]" class="form-element-control" value="" />
	</td>
	<td></td>
	<td>
		<a href="#" class="delete-new-approach-result"><img src="/img/btn_del.png"></a>
	</td>
</tr>
</script>

{/literal}


{include file="./common/footer.tpl"}
