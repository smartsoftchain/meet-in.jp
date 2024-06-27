{include file="./common/systemadminheader.tpl"}

{literal}

<script>

$(function () {
	// PtoPボタンクリック
	$("#ptop_button").click((e) => {
		let client_id = [];
		$("input[type=checkbox]:checked").each(function(index){
			client_id.push($(this).val());
		});

		$.ajax({
			type: "POST",
			data: {
				negotiation_room_type: 0,
				client_id: client_id,
			},
			url: "https://" + location.host + "/system-admin/update-client",
			success : function(data, dataType) {
				let resp = JSON.parse(data);
				if (resp.status == '1') {
					window.location.reload();
				}
			},
		});
	});
	
	// MCUボタンクリック
	$("#mcu_button").click((e) => {
		let client_id = [];
		$("input[type=checkbox]:checked").each(function(index){
			client_id.push($(this).val());
		});
		$.ajax({
			type: "POST",
			data: {
				negotiation_room_type: 1,
				client_id: client_id,
			},
			url: "https://" + location.host + "/system-admin/update-client",
			success : function(data, dataType) {
				let resp = JSON.parse(data);
				if (resp.status == '1') {
					window.location.reload();
				}
			},
		});
	});
});

</script>

{/literal}

{literal}

<style type="text/css">

.mi_table_main td {
	padding: 0 5px;
}

.file_img {
	max-width: 155px;
    height: 100px;
    margin: 10px 0;
    border: solid 1px #c8c8c8;
    min-width: 155px;
    min-height: 120px;
}

.button_area {
	float: right;
    margin-right: 400px;
	margin-top: 58px;
}

.file_select {
	cursor: pointer;
	color: #ffffff;
	background-color: #b2b2b2;
	font-size: 11px;
	padding: 0 13.5px;
	border: solid 1px #b2b2b2;
}

.file_input {
	display: none;
}

.file_delete {
	cursor: pointer;
	color: #979797;
	background-color: #ffffff;
	font-size: 11px;
	padding: 0 13.5px;
	border: solid 1px #979797;
}

</style>
		
{/literal}

<!-- メインコンテンツ start -->
<div id="mi_main_contents">

	<!-- コンテンツエリア start -->
	<div id="mi_content_area">

		<!-- コンテンツタイトル start -->
		<div class="mi_content_title">
			<span class="icon-folder mi_content_title_icon"></span>
			<h1>クライアント管理(MCU切替)</h1>

			<div class="mi_flt-r">
				<form id="search_form" action="/system-admin/client-list" method="get">
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
					<button type="button" class="mi_title_action_btn click-fade" id="ptop_button">
						<span class="icon-company"></span>
						<span>PtoP</span>
					</button>
					<button type="button" class="mi_title_action_btn click-fade" id="mcu_button">
						<span class="icon-company"></span>
						<span>MCU</span>
					</button>
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
			<table class="mi_table_main">
				<thead>
					<tr>
						<th class="mi_table_item_1">選択</th>
						<th class="mi_table_item_1">MCU</th>
						<th>{$list->getOrderArrow('ID', 'client_id')}</th>
						<th>{$list->getOrderArrow('会社名', 'client_name')}</th>
						<th>{$list->getOrderArrow('電話番号', 'client_tel1')}</th>
						<th>{$list->getOrderArrow('メールアドレス', 'client_staffleaderemail')}</th>
					</tr>
				</thead>
				<tbody>
					{assign var=i value="0" scope="global"}
					{foreach from=$list->getList() item=row}
						<tr>
							<td class="mi_table_item_1"><input type="checkbox" id="client_id_{$row.client_id}" value="{$row.client_id}"></td>
							<td class="mi_edit_icon">{if $row.negotiation_room_type == '1'}MCU{else}{/if}</td>
							<td>CA{$row.client_id|string_format:"%05d"|escape}</td>
							<td>{$row.client_name|escape}</td>
							<td>{$row.client_tel1|escape}-{$row.client_tel2|escape}-{$row.client_tel3|escape}</td>
							<td>{$row.client_staffleaderemail|escape}</td>
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
