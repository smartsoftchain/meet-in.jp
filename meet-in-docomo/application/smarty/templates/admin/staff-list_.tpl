{include file="./common/header.tpl"}

{literal}

<script>
	$(function (){
		// 編集画面へ遷移
		$("*[name^=edit_]").click(function(){
			var ids = $(this).attr("name").split("_");
			var url = "/admin/staff-regist?staff_type=" + ids[1] + "&staff_id=" + ids[2] + "&client_id=" + ids[3];
			$(location).attr("href", url);
		});

		// 担当者の削除処理
		$("#del_chk").click(function(){
			var cnt = 0
			for (var i=0 ; i==i ; i++ ) {
				var doc = "del_" + i;
				if ( document.getElementById( doc ) == null ) {
					break;
				}
				if ( document.getElementById( doc ).checked ) {
					var ids = document.getElementById( doc ).value.split("_");
					cnt++;
					// 担当者削除処理を非同期にて行う
					$.ajax({
						url: "staff-delete",
						type: "POST",
						data: {staff_type : ids[0], staff_id : ids[1]},
						//dataType: 'json',
						success: function(result) {
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

<style type="text/css">
<!--

.icon-delete {
  *zoom: expression(this.runtimeStyle['zoom'] = '1', this.innerHTML = '&#xe915;');
}

-->
</style>

{/literal}


<!-- メインコンテンツ start -->
<div id="mi_main_contents">
	<!-- トップナビ start -->
	<div id="mi_top_nav" class="acount_manage_on">
		<ul>
			<li class="mi_select">
				<a href="/admin/staff-list?staff_type=AA" class="hvr-underline-from-center">
					<span class="icon-parsonal mi_default_label_icon"></span>
					<div class="">AAアカウント管理</div>
				</a>
				
			</li>
			<li class="">
				<a href="/admin/client-list" class="hvr-underline-from-center">
					<span class="icon-company mi_default_label_icon"></span>
					<div class="">クライアント管理</div>
				</a>
			</li>
		</ul>

		<!-- パンくずリスト start -->
		<div class="mi_breadcrumb_list"><a href="/index/menu">TOP</a>&nbsp;&gt;&nbsp;<a href="/admin/staff-list?staff_type=AA">{$staffDict.staff_type}アカウント管理</a></div>
		<!-- パンくずリスト end -->

	</div>
	<!-- トップナビ end -->
	
	<!-- コンテンツエリア start -->
	<div id="mi_content_area">

		<!-- コンテンツタイトル start -->
		<div class="mi_content_title">
			<h1><span class="icon-parsonal mi_content_title_icon"></span>{$staffDict.staff_type}アカウント一覧</h1>
      <div class="mi_flt-r">
        <div class="mi_content_title_option">
          <a href="/admin/staff-regist?{$staffDict.addURL}" class="mi_title_action_btn hvr-fade click-fade">
            <span class="icon-parsonal-puls"></span>
            <span>追加</span>
          </a>
          <a href="javascript:void(0);" name="del_chk" class="del_chk mi_title_action_btn hvr-fade click-fade" id="del_chk">
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
			{$list->getLinkParam($pram)}
			{$list->getPerPage()}
		</div>
		<!-- ページネーション end -->

		<!-- テーブル start -->
		<div class="mi_table_main_wrap">
			<table class="mi_table_main">
				<thead>
					<tr>
						{if $user.staff_type=="AA"}
							<th class="mi_table_item_1">選択</th>
							<th class="mi_table_item_1">編集</th>
						{/if}
						<th>{$list->getOrderArrow('アカウントID', 'staff_id')}</th>
						<th>{$list->getOrderArrow('名前', 'staff_name')}</th>
						<th>{$list->getOrderArrow('meet in 番号', 'meetin_number')}</th>
						<th>{$list->getOrderArrow('メールアドレス', 'staff_email')}</th>
						<th>{$list->getOrderArrow('権限', 'staff_role')}</th>
					</tr>
				</thead>
				<tbody>
					{assign var=i value="0" scope="global"}
					{foreach from=$list->getList() item=row}
						<tr>
							{if $user.staff_type=="AA"}
								<td class="mi_table_item_1"><input type="checkbox" id="del_{$i++}" value="{$row.staff_type}_{$row.staff_id}"></td>
								<td class="mi_edit_icon"><a href="javascript:void(0)" name="edit_{$row.staff_type}_{$row.staff_id}_{$row.client_id}"><span class="icon-edit"></span></a></td>
							{/if}
							<td>{$row.staff_type|escape}{$row.staff_id|string_format:"%05d"}</td>
							<td>{$row.staff_name}</td>
							<td>{$row.meetin_number|escape}</td>
							<td>{$row.staff_email|escape}</td>
							<td>
								{if $row.staff_role == $smarty.const.ROLE_ADM}
									管理者
								{elseif $row.staff_role == $smarty.const.ROLE_EMP}
									一般社員
								{elseif $row.staff_role == $smarty.const.ROLE_PRT}
									アルバイト
								{/if}
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
