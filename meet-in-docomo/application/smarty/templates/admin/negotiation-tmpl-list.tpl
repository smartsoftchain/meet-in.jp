{include file="./common/header.tpl"}

{include file="./negotiation/negotiation-dialog.tpl"}

{literal}

<script>

var negotiationResultTmpl;
$(function (){
	// 並び順が選択された場合のイベント処理
	$("[id=srt]").on('change', function(){
		var $id = $(this).val();
		if($id != ""){
			var url = "/admin/negotiation-tmpl-list?srt=" + $id;
			$(location).attr("href", url);
		}
	});
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
		if(!confirm('チェックしたテンプレートを削除します。よろしいですか？')) {
			return;
		}
		$.ajax({
			url: "/admin/negotiation-tmpl-delete",
			type: "POST",
			dataType: "text",
			data: {
					"template_ids" : ids.join(','),
			},
		}).done(function(res) {
			var json = jQuery.parseJSON(res);
			location.reload();
		}).fail(function(res) {
			console.log('fail');
		});
	});

/* 商談結果のスタブ 本番リリース時は削除 */
	$("[id=button_negotiation_finish]").click(function(){
		// 商談結果テンプレートのデータ取得
		$.ajax({
			url: '/negotiation/get-negotiation-tmpl-list',
			dataType: 'text',
			data: {
				client_id: $("input[id=client_id]").val(),
			}
		}).done(function(res) {
			negotiationResultTmpl = JSON.parse(res);
			$("#modal-content").show();
			// モーダル内のタグを削除する
			$("div.inner-wrap").empty();
			// テンプレート生成
			var template = Handlebars.compile($('#noti-modal-template').html());
			$('div.inner-wrap').append(template({
				"tmplList": negotiationResultTmpl,
			}));
			
			// 共有メモを設定する
			$("[name=sharing_memo]").val($(".share_memo_text").val());

			// チャットを設定する
			$("[name=[chat_contents]").val($(".chat_board_messages").val());

			// シークレットメモを設定する
			$("[name=secret_comment]").val($(".secret_memo_text").val());
			
			// モーダルを表示する為のクリックイベントを発生させる
			$('.modal-open').trigger("click");
			
			var connection_info_id = $("#connection_info_id").val();
			
			$("[name=connectioninfoidtemp]").val(connection_info_id);
		}).fail(function(res) {
			console.log('get-negotiation-tmpl-list fail');
		});
	});
/* 商談結果のスタブ 本番リリース時は削除 */
});
</script>

<style type="text/css">
<!--

.reset table{
	border: 3px ridge;
	margin: 5px;
	width: 960px;
}

.reset table td {
	padding: 0px 10px;
}

span.font1 {
	font-size: 18px;
	font-weight: bold;
}


pre {
	width: 300px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	-o-text-overflow: ellipsis;
}

table.document_list td {
  padding: 0 10px;
  cursor: pointer;
}

table.negotiation_tmpl_list td:nth-child(1) {
  width: 40px;
}
table.negotiation_tmpl_list td:nth-child(2) {
  width: 160px;
  text-align: left;
}

table.negotiation_tmpl_list td:nth-child(2) pre {
	font-size: 16px;
	font-weight: bold;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	-o-text-overflow: ellipsis;
}
table.negotiation_tmpl_list td:nth-child(3) {
  vertical-align: middle;
  text-align: left;
  padding: 24px 10px;
}
table.negotiation_tmpl_list td:nth-child(3) h2 {
  font-size: 16px;
  color: #555;
}
table.negotiation_tmpl_list td:nth-child(3) span {
  margin-right: 60px;
}
table.negotiation_tmpl_list td:nth-child(3) span:before {
  color: #0081CC;
}
table.negotiation_tmpl_list td:nth-child(3) p {
  max-width: 575px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
table.negotiation_tmpl_list td:nth-child(4) {
  width: 100px;
}
table.negotiation_tmpl_list td:nth-child(4) span {
  font-size: 25px;
}
table.negotiation_tmpl_list td:nth-child(5) {
  padding: 0;
}
table.negotiation_tmpl_list td:nth-child(5) a {
  display: block;
  height: 100%;
  padding-right: 20px;
  width: 40px;
  position: relative;
  float:right;
}
table.negotiation_tmpl_list td:nth-child(5) span {
  width: 30px;
  display: inline-block;
  font-size: 50px;
  position: absolute;
  top: 50%;
  transform: translate(-50%,-50%);
}

table.negotiation_tmpl_list tr > td:nth-child(5):hover a {
  background: #A8DBFF;
}
table.negotiation_tmpl_list tr:hover > td:nth-child(5) span {
  color: #222;
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
			<a href="/admin/negotiation-tmpl-list">商談結果テンプレート一覧</a>
		</div>
		<!-- パンくずリスト end -->
	</div>
	<!-- トップナビ end -->
	
	<!-- コンテンツエリア start -->
	<div id="mi_content_area">
		<!-- コンテンツタイトル start -->
		<div class="mi_content_title">
			<span class="icon-comment mi_content_title_icon"></span>
			<h1>商談結果テンプレート一覧</h1>
			<div class="mi_flt-r">
				<form id="search_form" action="/admin/negotiation-tmpl-list" method="post">
					<div class="search_box">
						<input type="text" name="free_word" value="{$freeWord}" placeholder="検索内容を入力してください...">
						<button class="mi_default_button hvr-fade click-fade">
							<span class="icon-search"></span>
						</button>
						<span class="icon-close search_close_button"></span>
						<input type="hidden" name="staff_type" id="search_staff_type" value="{$user.staff_type}" />
						<input type="hidden" name="staff_id" id="search_staff_id" value="{$user.staff_id}" />
						<input type="hidden" name="client_id" id="search_client_id" value="{$user.client_id}" />
						<input type="hidden" name="srt" id="search_srt" value="{$srt}" />
					</div>
				</form>
			</div>
			<div class="mi_flt-r">
				<div class="mi_content_title_option">
					<a href="/admin/negotiation-tmpl-edit" class="mi_title_action_btn click-fade">
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

		<!-- ページネーション start -->
		<div class="mi_pagenation">
			<div class="mi_pagenation_result mi_flt-r">
				該当件数 <span>{$list->getCount()}</span>件
			</div>
			{$list->getLink()}
			{$list->getPerPage()}
			<div class="mi_flt-r">
				<select name="srt" id="srt" style="width: 100px;" >
					<option value=""  {if $srt=="" }selected{/if} disabled style='display:none;'>並べ替え</option>
					<option value="1" {if $srt=="1"}selected{/if}>タイトル(昇順)</option>
					<option value="2" {if $srt=="2"}selected{/if}>タイトル(降順)</option>
					<option value="3" {if $srt=="3"}selected{/if}>更新日(昇順)</option>
					<option value="4" {if $srt=="4"}selected{/if}>更新日(降順)</option>
				</select>
				&nbsp;&nbsp;
			</div>
		</div>
		<!-- ページネーション end -->
		<!-- テーブル start -->
		<div class="mi_table_main_wrap">
			<table class="mi_table_main negotiation_tmpl_list">
				<tbody>
				{foreach from=$list->getList() item=row}
					<tr>
						<td class="mi_table_item_1">
							<input type="checkbox" name="chk_{$row.template_id}" value="{$row.template_id}" id="chk_{$row.template_id}">
						</td>
						<td>
							<pre>{$row.template_name}</pre>
						</td>
						<td>&nbsp;
						</td>
						<td>
							<span style="font-size: 12px;"> {$row.update_date}</span>
						</td>
						<td>
							<a href="/admin/negotiation-tmpl-edit?id={$row.template_id}"><span class="icon-menu-06"></span></a>
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
