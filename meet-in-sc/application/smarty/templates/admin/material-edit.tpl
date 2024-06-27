{include file="./common/header.tpl"}

{literal}

<style>
<!--
-->
</style>

<script>
$(function (){
	var dragdrop = $("#document_drop_area");
	var fileInput = $("#materialfile_drop");

	fileInput.on("change", function() {
		$('#document_drop_help').text('');
		var files = this.files;
		// ドロップは1ファイルのみ
		if(files.length != 1) {
			$('#document_drop_help').text('１つのファイルを選択してください');
			fileInput.val("");
			return;
		}
		if(files[0].size == 0){
			$('#document_drop_help').text('ファイルサイズが0バイトです');
			fileInput.val("");
			return;
		}
		// ファイル拡張子チェック
		if (!files[0].name.toLowerCase().match(/.+\.(gif|jpg|png|pdf|docx?|xlsx?|pptx?)$/)) {
			$('#document_drop_help').text('アップロード可能ファイルはdocx/doc/ppt/pptx/xls/xlsx/pdf/gif/jpg/pngです');
			fileInput.val("");
			return;
		}
	});

	dragdrop.on("dragenter", function(e){
		e.stopPropagation();
		e.preventDefault();
		$("#document_drop_area").addClass("droppable");
		return false;
	});

	dragdrop.on("dragover", function(e){
		e.stopPropagation();
		e.preventDefault();
		$("#document_drop_area").addClass("droppable");
		return false;
	});

	dragdrop.on("dragleave", function(e){
		e.stopPropagation();
		e.preventDefault();
		$("#document_drop_area").removeClass("droppable");
		return false;
	});

	dragdrop.on("drop", function(_e){
		_e.stopPropagation();
		_e.preventDefault();
		var e = _e;
		if( _e.originalEvent ) {
			e = _e.originalEvent;
		}
		var files = e.dataTransfer.files;
		fileInput[0].files = files;
		$("#document_drop_area").removeClass("droppable");
		return false;
	});

	function updateScreen(form) {
		if(form != null && form["material_type"] != null) {
			if(form["material_type"] == 0 || form["material_type"] == 2) {
				// 資料データ表示・URL非表示
				$("[id^=material_type_file]").show();
				$("[id^=material_type_url]").hide();
			} else {
				// 資料データ非表示・URL表示
				$("[id^=material_type_file]").hide();
				$("[id^=material_type_url]").show();
			}
		}
	}
	// 初期レイアウト
	var material_type = $('input[id^=materialtype]:checked').val();
	var form_params = [];
	form_params["material_type"] = material_type;
	updateScreen(form_params);

	// 資料タイプ変更時
	$("[id^=materialtype]").change(function(){
		var form_params = [];
		form_params["material_type"] = $(this).val();
		updateScreen(form_params);
	});
	// 登録時の資料ファイルチェック
	$("#submit_button").on('click', function() {
		// ボタン不可に
		$("#submit_button").prop("disabled", true);
		$("#submit_button").text("アップロード中...");
		$("#material_form").submit();
		return false;
	});
});

</script>

<style type="text/css">
<!--

#document_drop_area{
  padding: 40px;
  border: 2px dashed #666;
  border-radius: 6px;
}

#document_drop_area.droppable {
  background-color: #ffe1a0;
  opacity: 0.7;
}

#document_drop_help {
  color: #F44;
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
			<a href="/admin/material-list">資料一覧</a>&nbsp;&gt;&nbsp;
			<a href="/admin/material-edit?id={$material.material_id}">資料設定</a>
		</div>
		<!-- パンくずリスト end -->
	</div>
	<!-- トップナビ end -->

	<!-- コンテンツエリア start -->
	<div id="mi_content_area">

		<!-- コンテンツタイトル start -->
		<div class="mi_content_title">
			<h1><span class="icon-configuration mi_content_title_icon"></span>
				{if ($material.material_id == null)}資料情報設定(新規){else}資料情報設定(編集){/if}
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

		<form action="/admin/material-edit" method="post" id="material_form" enctype="multipart/form-data">
			<!-- テーブル start -->
			<div class="mi_table_main_wrap mi_table_input_right_wrap">
				<table class="mi_table_input_right mi_table_main">
					<tbody>
						<tr>
							<th class="mi_tabel_title">ID</th>
							<td class="mi_tabel_content">&nbsp;&nbsp;{if $material.material_id !=''} {$material.material_id|string_format:"%05d"}{else}新規{/if}</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">資料タイプ</th>
							<td class="mi_tabel_content">
								{if $material.material_id == null}
								<input type="radio" id="materialtype0" name="material_type" value="0" {if ($material.material_type == 0 || $material.material_type == 2)}checked{/if} />資料データ
								<input type="radio" id="materialtype1" name="material_type" value="1" {if $material.material_type == 1}checked{/if} />URL
								{else}
									{if $material.material_type == 0 || $material.material_type == 2}
									資料データ
									{else if $material.material_type == 1}
									URL
									{/if}
									<input type="hidden" name="material_type" value="{$material.material_type|escape}" />
								{/if}
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">資料名<span class="required">必須</span></th>
							<td class="mi_tabel_content">
								<input type="text" class="text_medium" name="material_name" id="materialname" value="{$material.material_name|escape}" />
							</td>
						</tr>
						{if ($material.material_id == null) }
						<tr id="material_type_url">
							<th class="mi_tabel_title">URL<span class="required">必須</span></th>
							<td class="mi_tabel_content">
								<input type="text" class="text_medium" name="material_url" id="materialurl" value="{$material.material_url|escape}" />
							</td>
						</tr>
						<tr id="material_type_file">
							<th class="mi_tabel_title">資料データ<span class="required">必須</span></th>
							<td class="mi_tabel_content">
								<div id="document_drop_area">
									<p id="document_drop_label">資料データをここにドロップ</p>
									<input type="file" value="ファイルを選択" name="material_file" id="materialfile_drop" /><br>
								</div>
								<p id="document_drop_help"></p>
							</td>
						</tr>
						{elseif ($material.material_type == 1) }
						<tr id="material_type_url">
							<th class="mi_tabel_title">URL<span class="required">必須</span></th>
							<td class="mi_tabel_content">
								<input type="text" class="text_medium" name="material_url" id="materialurl" value="{$material.material_url|escape}" />
							</td>
						</tr>
						{/if}
						{if ($material.material_id == null || $material.material_type == 0) }
						<tr id="material_type_file_dl">
							<th class="mi_tabel_title">ダウンロード表示</th>
							<td class="mi_tabel_content">
								<input type="radio" id="downloadflg0" name="download_flg" value="0" {if $material.download_flg == 0}checked{/if} />無
								<input type="radio" id="downloadflg1" name="download_flg" value="1" {if $material.download_flg == 1}checked{/if} />有
							</td>
						</tr>
						{/if}
						<tr>
							<th class="mi_tabel_title">共有</th>
							<td class="mi_tabel_content">
								<input type="radio" id="shareableflg0" name="shareable_flg" value="0" {if $material.shareable_flg == 0}checked{/if} />無
								<input type="radio" id="shareableflg1" name="shareable_flg" value="1" {if $material.shareable_flg == 1}checked{/if} />有
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">備考</th>
							<td class="mi_tabel_content">
								<textarea name="note" id="note" style="height: 180px; width: 80%;">{$material.note}</textarea>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
			<!-- テーブル end -->
			<div class="btn_client_submit_area">
				<button type="button" name="submit_button" id="submit_button" class="mi_default_button">登録する</button>
			</div>
			<input type="hidden" name="material_id" value="{$material.material_id|escape}" />
			<input type="hidden" name="client_id" value="{$user.client_id|escape}" />
			<input type="hidden" name="staff_type" value="{$user.staff_type|escape}" />
			<input type="hidden" name="staff_id" id="material_staff_id" value="{$user.staff_id|escape}" />
		</form>

	</div>
	<!-- コンテンツエリア end -->

</div>
<!-- メインコンテンツ end -->

{include file="./common/footer.tpl"}
