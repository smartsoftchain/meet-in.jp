{include file="./common/header.tpl"}

{literal}

<script>
$(function (){
	// 資料入替
	$('#doc_sortable').sortable({
		cursor: 'move',
		opacity: 0.8,
		placeholder: 'ui-state-highlight'
	});
	$('#doc_sortable').disableSelection();
	$('#doc_sortable').on('sortupdate', function(event, ui) {
		var itemIDs = [];
		$('#doc_sortable li').map(function() {
			var page = $(this).attr('id').split("_");
			itemIDs.push(page[2]);
		});
		$.ajax({
			url: "set-material-detail-page",
			type: "POST",
			dataType: "text",
			data: {
					"material_id"        : $('input[name="current_material_id"]').val(),
					"material_page_list" : itemIDs.join(','),
			},
		}).done(function(res) {
			var json = jQuery.parseJSON(res);
			updateMaterialDetailList(json);
		}).fail(function(res) {
			console.log('set-material-detail-page fail');
		});
	});
	// 資料一覧の属性更新
	function updateMaterialDetailList(json) {
		// <li>
		$("[id^=page_]").each(function(i) {
			var id = $(this).attr('id');
			$(this).attr('id', id.replace(/^(page_.+_)(\d+)/, "$1" + (i+1)));
		});
		// <div id=document>
		$("[id^=document_]").each(function(i) {
			var id = $(this).attr('id');
			$(this).attr('id', id.replace(/^(document_.+_)(\d+)/, "$1" + (i+1)));
		});
		// <button>
		$("[id^=delete_file_]").each(function(i) {
			var id = $(this).attr('id');
			$(this).attr('id', id.replace(/^(delete_file_.+_)(\d+)/, "$1" + (i+1)));
		});
	}
	// 応答のmaterial_detailのjsonから画面更新
	function updateMaterialDetail(json) {
		var doc_div = 'document_' + json['material_id'] + '_' + json['material_page'];
		// コメント更新
		if(json['material_memo'] != null && json['material_memo'] != '') {
			$("[id=current_material_memo]").text(json['material_memo']);
			$("[id=" + doc_div + "]").find("img.admin_document_comment").show();
		} else {
			$("[id=current_material_memo]").text("");
			$("[id=" + doc_div + "]").find("img.admin_document_comment").hide();
		}
		// ふせん更新
		if(json['material_tag_flg'] == null || json['material_tag_flg'] == 0) {
			// ふせん削除時
			$("[id=doc_husen_label]").text('ふせん追加');
			$('input[name="current_material_tag_flg"]').val('1');
			// 選択エリアのタグ非表示
			$("[id=" + doc_div + "]").removeClass('mi_select');
		} else {
			// ふせん追加時
			$("[id=doc_husen_label]").text('ふせん削除');
			$('input[name="current_material_tag_flg"]').val('0');
			$("[id=" + doc_div + "]").addClass('mi_select');
		}
	}
	// 資料リストから画像をクリック
	$("[id^=document_]").click(function() {
		// 資料表示エリアに選択画像を表示
		var imgsrc = $(this).find("img").attr("src");
		var page = $(this).attr("id").split("_");
		// page[0] : "document"
		// page[1] : "material_id"
		// page[2] : "material_page"
		$("[id=current_page]").attr({
			"src" : imgsrc,
		});
		// ページの情報更新
		$('input[name="current_material_page"]').val(page[2]);
		// ページ単位の情報取得
		$.ajax({
			url: "get-material-detail",
			type: "POST",
			dataType: "text",
			data: {
					"material_id"   : page[1],
					"material_page" : page[2],
			},
		}).done(function(res) {
			var json = jQuery.parseJSON(res);
			updateMaterialDetail(json);
		}).fail(function(res) {
			console.log('get-material-detail fail');
		});
	});
	// 保存クリック
	$("[id=doc_save]").click(function() {
	});
	// 削除チェックのクリック
	$(".delete_checkbox").click(function() {
		// 削除ボタンの表示・非表示
		var elem = $(this).parents('li');
		var confirm_del = !elem.data('confirm_del');
		var button_id = elem.attr('id').replace(/page/, 'delete_file');
		if(confirm_del) {
			$('[id=' + button_id + ']').show();
		} else {
			$('[id=' + button_id + ']').hide();
		}
		elem.data('confirm_del', confirm_del);
	});
	// 削除ボタンクリック
	$("[id^=delete_file_]").click(function() {
		if(!confirm('選択ページを削除します。よろしいですか')) {
			return;
		}
		var page = $(this).parents('li').attr('id').split('_');
		var filename = $(this).parents('li').data('filename');
		$.ajax({
			url: "delete-material-detail-page",
			type: "POST",
			dataType: "text",
			data: {
					material_id       : page[1],
					material_page     : page[2],
					material_filename : filename,
			}
		}).done(function(res) {
			var json = jQuery.parseJSON(res);
			window.location.reload();
		}).fail(function(res) {
			console.log('get-material-detail fail');
		});
	});
	
	// コメント追加クリック
	$("[id=doc_comment]").click(function() {
		$("#modal-content").show();
		// モーダル内のタグを削除する
		$("div.inner-wrap").empty();
		// テンプレート生成
		var template = Handlebars.compile($('#document-detail-edit-modal-template').html());
		$('div.inner-wrap').append(template({
			"current_material_memo": $('[id=current_material_memo]').text()
		}));
	});
	// 更新ボタン
	$(document).on('click', '[id=memo_submit]', function(){
		// サイズチェック
		var maxTextLength = 20000;
		var text = $('textarea[name="current_material_memo"]').val();
		if( text.length > maxTextLength ) {
			$('#alert_text_memo').text('コメントは20000文字以下にしてください');
			return false;
		}
		$("#modal-content").hide();
		$.ajax({
			url: "set-material-detail",
			type: "POST",
			dataType: "text",
			data: {
					"material_id"      : $('input[name="current_material_id"]').val(),
					"material_page"    : $('input[name="current_material_page"]').val(),
					"material_memo"    : $('textarea[name="current_material_memo"]').val(),
			},
		}).done(function(res) {
			var json = jQuery.parseJSON(res);
			// 画面更新
			updateMaterialDetail(json)
		}).fail(function(res) {
			console.log('get-material-detail fail');
		});
	});
	// ふせん追加クリック
	$("[id=doc_husen]").click(function() {
		// ふせんフラグ更新
		$.ajax({
			url: "set-material-detail",
			type: "POST",
			dataType: "text",
			data: {
					"material_id"      : $('input[name="current_material_id"]').val(),
					"material_page"    : $('input[name="current_material_page"]').val(),
					"material_tag_flg" : $('input[name="current_material_tag_flg"]').val(),
			},
		}).done(function(res) {
			var json = jQuery.parseJSON(res);
			// 画面更新
			updateMaterialDetail(json)
		}).fail(function(res) {
			console.log('set-material-detail fail');
		});
	});
	// モーダル閉じる
	$(".modal-content").on('click','.modal-close',function(){
		$("#modal-content").hide();
	});
});
</script>

<style type="text/css">
<!--

/*-------------------------------------
	（モーダル）基本型
--------------------------------------*/
.modal-content {
  display: none;
  position: fixed;
  height: 100%;
  width: 100%;
  top: 0%;
  left: 0%;
	z-index: 501;
}

.modal-content .inner-wrap {
	line-height: 1.2;
	position: absolute;
	z-index: 503;
	height: 70%;
  width: 30%;
	background: #fff;
	padding: 20px 30px;
}

.modal-content .list-area,
.modal-content .edit-area {
	width: 100%;
	max-width: 1180px;
	overflow: auto;
}

/* モーダル */
.modal-content .inner-wrap h5 {
    padding: 5px 0 10px 0;
    font-size: 1.3em;
    font-weight: bold;
    color: #215b82;
}

.f_name_{
	display: inline-block !important;
	width: 150px !important;
	height: 100%;
	padding: 0 10px;
}
.text_short{
	width:60px !important;
	height: 100%;
	padding: 0 10px;
	display: inline-block !important;
}
.text_medium{
	width:200px !important;
	height: 100%;
	display: inline-block !important;
	padding: 0 10px;
}
.text_long{
	width:443px !important;
	height: 100%;
	padding: 0 10px;
	display: inline-block !important;
}

.text_long2{
	width:433px !important;
	height: 100%;
	padding: 0 10px;
	display: inline-block !important;
}

.f_mail{width:295px !important;}

#doc_sortable {
	list-style-type: none;
	margin: 0;
	padding: 0;
}

#doc_sortable li {
	margin: 0 3px 3px 3px;
	padding: 0.3em;
	padding-left: 1em;
}

.ui-state-highlight {
	height: 50px;
	border: dashed 1px #ffb700;
}

.delete_btn {
	display: none;
	height: auto;
	width: auto;
}

/*-----------------------
	モーダル領域
------------------------*/


.modal-overlay {
	display: none;
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
    background-color: rgba(0,0,0,0.4);
	z-index: 500;
}

.modal-open {
	color: #1b75b1;
	text-decoration: underline;
}

.modal-open:hover {
	color: #df6b6e;
	text-decoration: underline;
}

.modal-close {
	position: absolute;
	top: 0px;
	right: 0px;
	display: block;
	width: 40px;
	height: 40px;
}

.modal-close:hover {
	cursor:pointer;
}

/* エラーメッセージ */
.errmsg {
	font-size: 0.95em;
	line-height: 1.6;
	color: #df6b6d;
	padding-bottom: 15px;
}

.modal-content .list-area.hgt3,
.modal-content .edit-area.hgt3 {
	margin-top: 2px;
	height: 80%;
	height: calc(100% - 145px);
}

.mi_select_document {
	overflow-y: auto;
	position: static;
}

/* コメントアイコン */
.admin_document_comment{
	position: absolute;
	width : 30px;
	height : 30px;
	top : 5px;
	left : 5px;
	display : none;
}

-->
</style>

{/literal}

<!-- メインコンテンツ start -->
<div id="mi_main_contents">
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
	<!-- 資料表示 start -->
	<div id="mi_document_display_area">
		<div class="left_tool_box">
		{if $user.staff_id == $material.create_staff_id && $user.staff_type == $material.create_staff_type }
			<ul>
				<li>
<!--
					<div class="doc_save">
						<img src="/img/doc-save.png" alt="仮置き用画像"/>
						<div>保存</div>
					</div>
-->
				</li>
				<li>
					<div class="doc_configuration">
						<a href="/admin/material-edit?id={$material.material_id}"><img src="/img/doc-configuration.png" alt="資料設定画像"/>
						<div style="white-space: nowrap;">資料設定</div>
						</a>
					</div>
				</li>
				<li>
<!--
					<div class="doc_delete">
						<img src="/img/doc-delete.png" alt="資料削除画像"/>
						<div>削除</div>
					</div>
-->
				</li>
			</ul>
		{/if}
		</div>
		<div class="mi_select_document">
			{if ($material.material_type == 0 || $material.material_type == 2)}
				<img src="/cmn-data/{if $materialDetailList|@count > 0}{$materialDetailList[0].material_filename}{/if}" alt="資料画像" style="max-width: 100%;" id="current_page" />
			{else}
				<img src="/cmn-data/{$material.material_id|md5}-1.jpg" alt="資料画像" style="max-width: 100%;" id="current_page" />
			{/if}
		</div>
		<input type="hidden" name="current_material_id" id="current_material_id" value="{$material.material_id}" />
		<input type="hidden" name="current_material_page" id="current_material_page" value="1" />
		<input type="hidden" name="current_material_tag_flg" id="current_material_tag_flg" value="{if $materialDetailList|@count > 0}{$materialDetailList[0].material_tag_flg}{/if}" />

		<p class="mi_document_note" id="current_material_memo">{if $materialDetailList|@count > 0}{$materialDetailList[0].material_memo|nl2br}{/if}</p>
		<div class="right_tool_box">
		{if $user.staff_id == $material.create_staff_id && $user.staff_type == $material.create_staff_type && ($material.material_type == 0 || $material.material_type == 2)}
			<ul>
				<li>
					<div class="doc_comment" id="doc_comment">
						<img src="/img/doc-comment.png" alt="コメント編集画像"/>
						<div id="doc_comment_label" style="white-space: nowrap;">コメント編集</div>
					</div>
				</li>
				<li>
					<div class="doc_husen" id="doc_husen">
						<img src="/img/doc-husen.png" alt="ふせん追加画像"/>
						<div id="doc_husen_label" style="white-space: nowrap;">ふせん追加</div>
					</div>
				</li>
			</ul>
		{/if}
		</div>
	</div>
	<!-- 資料表示 end -->
	<!-- 資料選択 start -->
	<div id="mi_document_select_area">
		<ul {if ($user.staff_id == $material.create_staff_id && $user.staff_type == $material.create_staff_type)}id="doc_sortable"{/if}>
			{foreach from=$materialDetailList item=row}
				<li id="page_{$row.material_id}_{$row.material_page}" data-filename="{$row.material_filename}" data-confirm_del="false">
					{if ($material.material_type==0 || $material.material_type == 2)}
					<span class="icon-close delete_checkbox"></span>
					<button type="button" class="delete_btn" id="delete_file_{$row.material_id}_{$row.material_page}">削除</button>
					{/if}
					<div id="document_{$row.material_id}_{$row.material_page}" class="{if $row.material_tag_flg == 1}mi_select{/if}">
						<img src="/cmn-data/{$row.material_filename}" alt="仮置き用画像" class="mi_document" />{$row.material_title}
						<img src="/img/1px_comment.svg" class="admin_document_comment" alt="コメント" {if $row.material_memo}style="display:block;"{/if}/>
					</div>
				</li>
			{/foreach}
		</ul>
	</div>
	<!-- 資料選択 end -->
	<!-- コンテンツエリア end -->

</div>
<!-- メインコンテンツ end -->


<!-- ====================================== モーダルコンテンツ[start] ====================================== -->
<div class="modal-content" id="modal-content"> <!-- id="db-log2"  -->
	<div class="mi_modal_shadow"></div>
	<div class="inner-wrap mi_modal_default">
	
	</div>
</div>
<!-- ====================================== モーダルコンテンツ[end] ======================================== -->

{literal}

<!-- コメント編集モーダルテンプレート -->
<script id="document-detail-edit-modal-template" type="text/x-handlebars-template">
<div class="mi_content_title">
	<h2>コメント編集</h2>
</div>
	<textarea id="textarea_material_memo" class="mi_default_input" name="current_material_memo" style="width: 100%; height: calc(100% - 150px);">{{current_material_memo}}</textarea>
	<span class="errmsg mb10" id="alert_text_memo"></span>
	<div class="mi_tabel_btn_area">
	<button type="button" id="memo_submit" name="memo_submit" class="mi_default_button mi_btn_m mi_btn_m hvr-fade click-fade">更新する</button>
</div>
<div class="mi_close_icon modal-close">
	<span class="icon-close"></span>
</div>
</script>

{/literal}
<!-- ====================================== モーダルコンテンツ[end] ======================================== -->

{include file="./common/footer.tpl"}
