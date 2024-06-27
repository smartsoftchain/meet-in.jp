{include file="./common/header.tpl"}

{literal}

<link rel="stylesheet" href="/css/mail_template.css?{$application_version}">
<script>

$(function (){
	// チェックされたテンプレートを削除するアクション
	$("[id=del_chk]").click(function() {
		var checked = [];
		// 削除対象を取得
		$("[name=template_id]:checked").each(function() {
			checked.push(this.value)
		});
		// チェック状態を確認
		if(checked.length === 0) {
			alert("対象が選択されていません。");
			return;
		}
		// 最終確認
		if(!confirm(checked.length + "件を削除します。よろしいですか？")) {
			return;
		}
		$.ajax({
			url: "/mail-template/delete",
			type: "POST",
			dataType: "json",
			data: {
					"ids" : JSON.stringify(checked),
			},
		}).done(function(res) {
			if(res["status"]) {
				alert(checked.length + "件を削除しました。");
				location.reload();
			} else {
				if(res["result"]) {
					msg = "";
					$.each(res["result"], function(i, value) {
						msg = msg + value + "\n";
					})
				} else {
					msg = "サーバーエラーです。管理者にお問い合わせください。"
				}
				alert(msg)
			}
		}).fail(function(res) {
			msg = "サーバーエラーです。管理者にお問い合わせください。"
			alert(msg)
		});
	});
});
</script>
{/literal}

<!-- メインコンテンツ start -->
<div id="mi_main_contents">
	<!-- トップナビ start -->
	<div id="mi_top_nav">
		<!-- パンくずリスト start -->
		<div class="mi_breadcrumb_list"><a href="/index/menu">TOP</a>&nbsp;&gt;&nbsp;<a href="javascript:void(0);">メールテンプレート</a></div>
		<!-- パンくずリスト end -->
	</div>
	<!-- トップナビ end -->

	<!-- コンテンツエリア start -->
	<div id="mi_content_area">

		<!-- コンテンツタイトル start -->
		<div class="mi_content_title">
			<span class="icon-company mi_content_title_icon"></span>
			<h1>メールテンプレート一覧</h1>
			<div class="mi_flt-r">
				<form id="search_form" action="/mail-template" method="get">
					<div class="search_box">
						<input type="text" name="keyword" value="{$keyword}" placeholder="検索内容を入力してください...">

						<button class="mi_default_button hvr-fade click-fade">
							<span class="icon-search"></span>
						</button>
						<span class="icon-close search_close_button"></span>
					</div>
				</form>
			</div>
			<div class="mi_flt-r">
				<div class="mi_content_title_option">
					<a href="/mail-template/create-screen" class="mi_title_action_btn click-fade">
						<span class="icon-upload"></span>
						<span>追加</span>
					</a>
					<a href="javascript:void(0);" name="del_chk" class="mi_title_action_btn del_chk click-fade" id="del_chk">
						<span class="icon-delete"></span>
						<span>削除</span>
					</a>
				</div>
			</div>
		</div>
		<!-- コンテンツタイトル end -->

		<!-- ページネーション start -->
		<div class="mi_pagenation">
			<div class="mi_pagenation_result">
				<span class="mi_pagenation_result_title">全件</span>
				<span>{$list->getCount()}件</span>
			</div>
			{$list->getLink()}
			{$list->getPerPage()}
		</div>
		<!-- ページネーション end -->

		<!-- テーブル start -->
		<div class="mi_table_main_wrap mail_tamlate_wrap">
			<table class="mi_table_main">
				<thead>
					<tr>
						<th class="mi_table_item_1"></th>
						<th class="mi_table_item_1">編集</th>
						<th class="sort">
							<div class="th_inner order">
								{$list->getOrderArrow('テンプレート名', 'name')}
							</div>
						</th>
						<th>
							<div class="th_inner order">
								{$list->getOrderArrow('件名', 'subject')}
							</div>
						</th>
						<!-- <th>{$list->getOrderArrow('更新日', 'update_time')}</th> -->
						<th>
							<div class="th_inner order">
								{$list->getOrderArrow('作成日', 'create_time')}
							</div>
						</th>
					</tr>
				</thead>
				<tbody>
					{foreach from=$list->getList() item=row}
						<tr>
							<td class="mi_table_item_1"><input type="checkbox" name="template_id" value="{$row.id}"></td>
							<td class="mi_table_item_1">
								<a class="edit_btn" href="/mail-template/create-screen?id={$row.id}"><img class="edit_icon" src="/img/edit.svg" /></a>
							</td>
							<td>{$row.name}</td>
							<td>{$row.subject}</td>
							<!-- <td>{$row.update_time}</td> -->
							<td>{$row.create_time}</td>
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
