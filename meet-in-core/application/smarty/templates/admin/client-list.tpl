{include file="./common/header.tpl"}

{literal}

<style>
.ascending {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-top: 3px solid #fff;
  border-left: 3px solid #fff;
  transform: rotate(45deg);
}

.ascending-class {
  width: 25px;
  height:22px;
  position:absolute;
  right:0px;
  top:2px;
}
.ascending-class:hover {
  background-color: #d86b00;
}

.descending {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-bottom: 3px solid #fff;
  border-right: 3px solid #fff;
  transform: rotate(45deg);
}

.descending-class {
  width: 25px;
  height:22px;
  position:absolute;
  right:0px;
  top:16px;
}

.descending-class:hover {
  background-color: #d86b00
}
{/literal}
{if $select_css != ""}
.{$select_css} {literal}{
  background-color: #d86b00
}
{/literal}
{/if}
{literal}
</style>
<script>
	$(function (){
		// 編集画面へ遷移
		$("*[name^=edit_]").click(function(){
			var ids = $(this).attr("name").split("_");
			var url = "/admin/client-edit?client_id=" + ids[1];
			$(location).attr("href", url);
		});

		// 削除処理
		$("#del_chk").click(function(){
			if(!confirm('チェックされたクライアントを削除します。よろしいですか？')) {
				return;
			}
			var cnt = 0
			for (var i=0 ; i==i ; i++ ) {
				var doc = "del_" + i;
				if ( document.getElementById( doc ) == null ) {
					break;
				}
				if ( document.getElementById( doc ).checked ) {
					var client_ids = document.getElementById( doc ).value;
					cnt++;
					// クライアント削除処理
					$.ajax({
						url: "/admin/client-delete",
						type: "POST",
						data: {client_id : client_ids},
						//dataType: 'json',
						success: function(result) {
							console.log(result)
							if(result == 1){
//								alert("削除に成功しました");
//								location.reload();
							}else{
								alert("削除に失敗しました");
								location.reload();
							}
						}
					});
				}
			}
			if (cnt>0) {
				alert("削除に成功しました");
				location.reload();
			} else {
				alert("削除対象がありません");
			}
		});

	});
</script>

{/literal}


<!-- メインコンテンツ start -->
<div id="mi_main_contents">
	<!-- トップナビ start -->
	<div id="mi_top_nav" class="acount_manage_on">
		<ul>
			<li class="">
				<a href="/admin/staff-list?staff_type=AA" class="hvr-underline-from-center">
					<span class="icon-parsonal mi_default_label_icon"></span>
					<div class="">AAアカウント管理</div>
				</a>

			</li>
			<li class="mi_select">
				<a href="/admin/client-list" class="hvr-underline-from-center">
					<span class="icon-company mi_default_label_icon"></span>
					<div class="">クライアント管理</div>
				</a>
			</li>
			<li class="">
				<a href="/admin/distributor-list" class="hvr-underline-from-center">
					<span class="icon-company mi_default_label_icon"></span>
					<div class="">販売店管理</div>
				</a>
			</li>
		</ul>

		<!-- パンくずリスト start -->
		<div class="mi_breadcrumb_list">
		<a href="/index/menu">TOP</a>&nbsp;&gt;&nbsp;
		<a href="/admin/staff-list?staff_type=AA">AAアカウント管理</a>&nbsp;&gt;&nbsp;
		<a href="/admin/client-list">クライアント／企業アカウント一覧</a></div>
		<!-- パンくずリスト end -->

	</div>
	<!-- トップナビ end -->

	<!-- コンテンツエリア start -->
	<div id="mi_content_area">

		<!-- コンテンツタイトル start -->
		<div class="mi_content_title">
			<span class="icon-company mi_content_title_icon"></span>
			<h1>クライアント／企業アカウント一覧</h1>

			<div class="mi_flt-r">
				<form id="search_form" action="/admin/client-list" method="get">
					<div class="search_box">
						<input type="text" name="free_word" value="{$freeWord}" placeholder="検索内容を入力してください...">

						<button class="mi_default_button hvr-fade click-fade">
							<span class="icon-search"></span>
						</button>
						<span class="icon-close search_close_button"></span>
					</div>
				</form>
			</div>
			<div class="mi_flt-r">
		    <div class="mi_content_title_option">
	        <a href="/admin/client-regist" class="mi_title_action_btn click-fade">
		        <span class="icon-company-puls"></span>
		        <span>追加</span>
	        </a>
	        <a href="javascript:void(0);" name="del_chk" class="del_chk mi_title_action_btn click-fade" id="del_chk">
		        <span class="icon-delete"></span>
		        <span>削除</span>
	        </a>
				</div>
			</div>
		</div>
		<!-- コンテンツタイトル end -->

		<!-- エラーメッセージ表示エリア begin -->
		{if $err == 1}
			不正なIDです。
		{/if}
		<!-- エラーメッセージ表示エリア end -->

		<!-- ページネーション start -->
		<div class="mi_pagenation">
			<div class="mi_pagenation_result">該当件数 <span>{$list->getCount()}</span>件</div>
			{$list->getLink()}
			{$list->getPerPage()}
		</div>
		<!-- ページネーション end -->

		<!-- テーブル start -->
		<div class="mi_table_main_wrap">
			<table class="mi_table_main" {if $list->getCount() > 0} style="width:auto;" {/if}>
				<thead>
					<tr>
						<th class="mi_table_item_1">選択</th>
						<th class="mi_table_item_1">編集</th>
						<th>{$list->getOrderArrowClient('ID', 'client_id')}</th>
						<th>会社名</th>
						<th>電話番号</th>
						<th>メールアドレス</th>
						{*<th>{$list->getOrderArrow('会社名', 'client_name')}</th>
						<th>{$list->getOrderArrow('電話番号', 'client_tel1')}</th>
						<th>{$list->getOrderArrow('メールアドレス', 'client_staffleaderemail')}</th>*}
						<th {if $list->getCount() > 0} style="min-width:155px;" 
								{elseif $list->getCount() == 0} style="width:145px;" 
							{/if}
						>
							{$list->getOrderArrowClient('契約期間開始日', 'contract_period_start_date')}
						</th>
						<th {if $list->getCount() > 0} style="min-width:168px;" 
								{elseif $list->getCount() == 0} style="width:160px;"
							{/if}
						>
							{$list->getOrderArrowClient('最終ルーム接続日', 'last_enter_room_date')}
						</th>
					</tr>
				</thead>
				<tbody>
					{assign var=i value="0" scope="global"}
					{foreach from=$list->getList() item=row}
						<tr>
							<td class="mi_table_item_1"><input type="checkbox" id="del_{$i++}" value="{$row.client_id}"></td>
							<td class="mi_edit_icon"><a href="javascript:void(0)" name="edit_{$row.client_id}"><span class="icon-edit"></span></a></td>
							<td>CA{$row.client_id|string_format:"%05d"|escape}</td>
							<td style="max-width: 185px;">{$row.client_name|escape}</td>
							<td style="max-width: 185px;">{$row.client_tel1|escape}-{$row.client_tel2|escape}-{$row.client_tel3|escape}</td>
							<td>{$row.client_staffleaderemail|escape}</td>
							{if $row.contract_period_start_date != '0000-00-00 00:00:00'}
							<td>{$row.contract_period_start_date|date_format:"%Y.%m.%d"|escape}</td>
							{else}
							<td></td>
							{/if}
							<td>{$row.last_enter_room_date|date_format:"%Y.%m.%d"|escape}</td>
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
