{include file="./common/header.tpl"}

{literal}

<script>
	$(function (){
		// クライアントを選択するボタンのイベント
		$("[name=submit_button]").click(function(){
			// 選択件数を調べる
			var checkCount = 0;
			var clientId = 0;
			var staffId = 0;
			$("[name=client_id]").each(function(i, elem) {
				if($(elem).is(':checked')){
					clientId = $(elem).val();
					staffId = $('#staff_id').val();
					checkCount++;
				}
			});
			if(checkCount == 1){
				//$("#client_form").submit();
				$.ajax({
					url: "/client/change",
					type: "POST",
					data: {client_id : clientId, staff_id: staffId},
					dataType: 'json',
					success: function(result) {
						if(result["errFlg"] == 0){
							window.location.href = "/index/menu";
						}else{
							alert("存在しないクライアントIDです。");
						}
					},
					error: function(error) {
						console.log(error);
						alert('クライアントの選択に失敗しました。');
					}
				});
			}else if(checkCount == 0){
				alert("クライアントを選択して下さい。");
			}else{
				alert("クライアントを１件だけ選択して下さい。");
			}
			
		});
	});
</script>

{/literal}


<!-- メインコンテンツ start -->
<div id="mi_main_contents">
	<!-- トップナビ start -->
	<div id="mi_top_nav">
		<!-- パンくずリスト start -->
		<div class="mi_breadcrumb_list"><a href="/index/menu">TOP</a>&nbsp;&gt;&nbsp;<a href="javascript:void(0);">クライアント選択</a></div>
		<!-- パンくずリスト end -->
	</div>
	<!-- トップナビ end -->
	
	<!-- コンテンツエリア start -->
	<div id="mi_content_area">

		<!-- コンテンツタイトル start -->
		<div class="mi_content_title">
			<span class="icon-company mi_content_title_icon"></span>
			<h1>クライアント選択</h1>
			<div class="mi_flt-r">
				<form id="search_form" action="/client/list" method="get">
					<div class="search_box">
						<input type="text" name="free_word" value="{$freeWord}" placeholder="検索内容を入力してください...">
			
						<button class="mi_default_button hvr-fade click-fade">
							<span class="icon-search"></span>
						</button>
						<span class="icon-close search_close_button"></span>
					</div>
				</form>
			</div>
		</div>
		<!-- コンテンツタイトル end -->
		
		<!-- エラーメッセージ表示エリア begin -->
		{if $err == 1}
			不正なクライアントIDです。
		{/if}
		<!-- エラーメッセージ表示エリア end -->

		<!-- ページネーション start -->
		<div class="mi_pagenation">
			<div class="mi_pagenation_result">該当件数 <span>{$list->getCount()}</span>件</div>
			{$list->getLink()}
			{$list->getPerPage()}
		</div>
		<!-- ページネーション end -->

		<form action="/client/change" method="post" id="client_form">
			<!-- テーブル start -->
			<div class="mi_table_main_wrap">
				<table class="mi_table_main">
					<thead>
						<tr>
							<th class="mi_table_item_1">選択</th>
							<th>{$list->getOrderArrow('ID', 'client_id')}</th>
							<th>{$list->getOrderArrow('会社名', 'client_name')}</th>
							<th>{$list->getOrderArrow('電話番号', 'client_tel1')}</th>
							<th>{$list->getOrderArrow('メールアドレス', 'client_staffleaderemail')}</th>
						</tr>
					</thead>
					<tbody>
						{foreach from=$list->getList() item=row}
							<tr>
								<td class="mi_table_item_1"><input type="radio" name="client_id" value="{$row.client_id}" {if $user.client_id == $row.client_id}checked{/if}></td>
								<td>CA{$row.client_id|string_format:"%05d"}</td>
								<td>{$row.client_name}</td>
								<td>{$row.client_tel1}-{$row.client_tel2}-{$row.client_tel3}</td>
								<td>{$row.client_staffleaderemail}</td>
							</tr>
						{/foreach}
					</tbody>
				</table>
			</div>
			<!-- テーブル end -->
			<div class="btn_client_submit_area">
				<button type="button" name="submit_button" class="mi_default_button hvr-fade click-fade">選択</button>
			</div>
		</form>
	</div>
	<!-- コンテンツエリア end -->

</div>
<!-- メインコンテンツ end -->


{include file="./common/footer.tpl"}
