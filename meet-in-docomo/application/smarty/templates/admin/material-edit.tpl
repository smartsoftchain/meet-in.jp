{include file="./common/header.tpl"}

{literal}

<style>
<!--
-->
</style>

<script>
$(function (){
	var dragdrop = $("#document_drop_area");
	var movDragdrop = $("#mov_drop_area");
	var fileInput = $("#materialfile_drop");
	var movInput = $("#materialmov_drop");

	fileInput.on("change", function(e) {
		validFileInput(this.files);
	});

	function validFileInput(files) {
		$('#document_drop_help').text('');
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
		// エラーがない場合はファイル名を画面に設定する
		$(".upload_file_material_name").empty();
		$(".upload_file_material_name").append(files[0].name);
	}

	movInput.on("change", function(e) {
		validMovInput(this.files);
	});

	function validMovInput(files) {
		$('#mov_drop_help').text('');
		// ドロップは1ファイルのみ
		if(files.length != 1) {
			$('#mov_drop_help').text('１つのファイルを選択してください');
			movInput.val("");
			return;
		}
		if(files[0].size == 0){
			$('#mov_drop_help').text('ファイルサイズが0バイトです');
			movInput.val("");
			return;
		}
		// ファイル拡張子チェック
		if (!files[0].name.toLowerCase().match(/.+\.(mp4)$/)) {
			$('#mov_drop_help').text('アップロード可能ファイルはmp4です');
			movInput.val("");
			return;
		}
		if (files[0].size > 100000000) {
			$('#mov_drop_help').text('アップロード可能なファイルサイズは100MBまでです');
			movInput.val("");
			return;
		}
		// エラーがない場合はファイル名を画面に設定する
		$(".upload_file_mov_name").empty();
		$(".upload_file_mov_name").append(files[0].name);
	}

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
		validFileInput(fileInput[0].files);
		$("#document_drop_area").removeClass("droppable");
		return false;
	});

	movDragdrop.on("dragenter", function(e){
		e.stopPropagation();
		e.preventDefault();
		$("#mov_drop_area").addClass("droppable");
		return false;
	});

	movDragdrop.on("dragover", function(e){
		e.stopPropagation();
		e.preventDefault();
		$("#mov_drop_area").addClass("droppable");
		return false;
	});

	movDragdrop.on("dragleave", function(e){
		e.stopPropagation();
		e.preventDefault();
		$("#mov_drop_area").removeClass("droppable");
		return false;
	});

	movDragdrop.on("drop", function(_e){
		_e.stopPropagation();
		_e.preventDefault();
		var e = _e;
		if( _e.originalEvent ) {
			e = _e.originalEvent;
		}
		var files = e.dataTransfer.files;
		movInput[0].files = files;
		validMovInput(movInput[0].files);
		$("#mov_drop_area").removeClass("droppable");
		return false;
	});

	function updateScreen(form) {
		if(form != null && form["material_type"] != null) {
			if(form["material_type"] == 0 || form["material_type"] == 2) {
				// 資料データ表示・URL非表示・資料データ（映像）非表示
				$("[id^=material_type_file]").show();
				$("[id^=material_type_url]").hide();
				$("[id^=material_type_mov]").hide();
				$("[id^=material_type_file_dl").show();
			} else if(form["material_type"] == 3) {
				// 資料データ非表示・URL非表示・資料データ（映像）表示
				$("[id^=material_type_file]").hide();
				$("[id^=material_type_url]").hide();
				$("[id^=material_type_mov]").show();
				$("[id^=material_type_file_dl").show();
			} else {
				// 資料データ非表示・URL表示・資料データ（映像）非表示
				$("[id^=material_type_file]").hide();
				$("[id^=material_type_url]").show();
				$("[id^=material_type_mov]").hide();
				$("[id^=material_type_file_dl").hide();
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
  border: 2px dashed #E9E8E7;
  border-radius: 6px;
}

#document_drop_area.droppable {
  background-color: #A8DBFF;
  opacity: 0.7;
}

#document_drop_help {
  color: #F44;
}

#mov_drop_area{
  padding: 40px;
  border: 2px dashed #E9E8E7;
  border-radius: 6px;
}

#mov_drop_area.droppable {
  background-color: #A8DBFF;
  opacity: 0.7;
}

#mov_drop_help {
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
/* ラジオボタンのデザイン調整 */
.radio_material_common{
	float: left;
	margin-right: 10px;
}
.radio_character{
	float: left;
	margin-top: 1px;
}
.clear_both{
	clear: both;
}
.mgr_30{
	margin-right: 30px;
}
.mgr_60{
	margin-right: 60px;
}
/* 資料ドロップ領域のデザイン調整 */
.document_drop_message{
	margin-bottom: 30px;
}
.design_input_file{
	padding: 0px 15px;
	background: #D8D8D8 0% 0% no-repeat padding-box;
	opacity: 1;
	color: #fff;
	cursor: pointer;
	float: left;
}
.display_none{
	display: none;
}
.upload_file_material_name,
.upload_file_mov_name{
	float: left;
	margin-left: 20px;
}
/* テキスト入力欄の共通スタイル */
.text_material_common{
	display: block;
	width: 70%;
	height: 26px;
	padding: .375rem .75rem;
	font-size: 14px;
	font-weight: 400;
	line-height: 1.5;
	color: #6e6e6e;
	background-color: #fff;
	background-clip: padding-box;
	border: 1px solid #E9E8E7;
	border-radius: .25rem;
	transition: border-color .15s ease-in-out,box-shadow .15s ease-in-out;
}

.notes {
	display: inline-block;
	font-size: 11px;
	margin-left: 10px;
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
		<div>
			お客様がアップロードされたファイルのサイズは「資料一覧」画面にてご確認ください。
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
									<input type="radio" id="materialtype0" name="material_type" value="0" class="radio_material_common" {if ($material.material_type == 0 || $material.material_type == 2)}checked{/if} />
									<label for="materialtype0" class="radio_character mgr_30">資料データ</label>

									<input type="radio" id="materialtype1" name="material_type" value="1" class="radio_material_common" {if $material.material_type == 1}checked{/if} />
									<label for="materialtype1" class="radio_character mgr_30">URL</label>

									<input type="radio" id="materialtype2" name="material_type" value="3" class="radio_material_common" {if $material.material_type == 3}checked{/if} />
									<label for="materialtype2" class="radio_character">映像</label><p class="notes">※映像は現在ウェビナーのみご利用可能です。</p>
									<div class="clear_both"></div>
								{else}
									{if $material.material_type == 0 || $material.material_type == 2 || $material.material_type == 3}
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
								<input type="text" class="text_medium text_material_common" name="material_name" id="materialname" value="{$material.material_name|escape}" />
							</td>
						</tr>
						{if ($material.material_id == null) }
						<tr id="material_type_url">
							<th class="mi_tabel_title">URL<span class="required">必須</span></th>
							<td class="mi_tabel_content">
								<input type="text" class="text_medium text_material_common" name="material_url" id="materialurl" value="{$material.material_url|escape}" />
							</td>
						</tr>
						<tr id="material_type_file">
							<th class="mi_tabel_title">資料データ<span class="required">必須</span></th>
							<td class="mi_tabel_content">
								<div id="document_drop_area" {if $browser == "Edge"}style="border: none;"{/if}>
									<p id="document_drop_label" class="document_drop_message">{if $browser != "Edge"}資料データをここにドロップしてください。{/if}</p>
									<label for="materialfile_drop" class="design_input_file">
										ファイル選択
										<input type="file" accept=".docx,.doc,.ppt,.pptx,.xls,.xlsx,.pdf,.gif,.jpg,.png" value="ファイルを選択" name="material_file" id="materialfile_drop" class="display_none" /><br>
									</label>
									<lavel class="upload_file_material_name">選択されていません。</lavel>
									<div class="clear_both"></div>
								</div>
								<p id="document_drop_help"></p>
							</td>
						</tr>
						<tr id="material_type_mov">
							<th class="mi_tabel_title">資料データ<span class="required">必須</span></th>
							<td class="mi_tabel_content">
								<div id="mov_drop_area" {if $browser == "Edge"}style="border: none;"{/if}>
									<p id="mov_drop_label" class="document_drop_message">{if $browser != "Edge"}資料データをここにドロップしてください。{/if}</p>
									<label for="materialmov_drop" class="design_input_file">
										ファイル選択
										<input id="materialmov_drop" type="file" accept=".mp4" value="ファイルを選択" name="material_mov" class="display_none" /><br>
									</label>
									<lavel class="upload_file_mov_name">選択されていません。</lavel>
									<div class="clear_both"></div>
								</div>
								<p id="mov_drop_help"></p>
							</td>
						</tr>
						{elseif ($material.material_type == 1) }
						<tr id="material_type_url">
							<th class="mi_tabel_title">URL<span class="required">必須</span></th>
							<td class="mi_tabel_content">
								<input type="text" class="text_medium text_material_common" name="material_url" id="materialurl" value="{$material.material_url|escape}" />
							</td>
						</tr>
						{/if}
						{if '2021-10-01' > $smarty.now|date_format:"%Y-%m-%d" && ($material.material_id == null || $material.material_type == 0 || $material.material_type == 3) }
						<tr id="material_type_file_dl">
							<th class="mi_tabel_title">ダウンロード表示</th>
							<td class="mi_tabel_content">※ルーム内にて資料を展開した方のみダウンロードの可否を選択できます。</td>
						</tr>
						{/if}
						<tr>
							<th class="mi_tabel_title">他のユーザーと資料共有</th>
							<td class="mi_tabel_content">
								<input type="radio" id="shareableflg0" name="shareable_flg" value="0" class="radio_material_common" {if $material.shareable_flg == 0}checked{/if} />
								<label for="shareableflg0" class="radio_character mgr_60">無</label>

								<input type="radio" id="shareableflg1" name="shareable_flg" value="1" class="radio_material_common" {if $material.shareable_flg == 1}checked{/if} />
								<label for="shareableflg1" class="radio_character">有</label>
								<div class="clear_both"></div>
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">鍵
							<td class="mi_tabel_content">
								<input type="radio" id="shareableflg0" name="document_guard_key_flg" value="0" class="radio_material_common" {if $material.document_guard_key_flg == 0}checked{/if} />
								<label for="shareableflg0" class="radio_character mgr_60">無</label>
								<input type="radio" id="shareableflg1" name="document_guard_key_flg" value="1" class="radio_material_common" {if $material.document_guard_key_flg == 1}checked{/if} />
								<label for="shareableflg1" class="radio_character">有</label>
								<div class="clear_both"></div>
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">備考</th>
							<td class="mi_tabel_content">
								<textarea name="note" id="note" style="height: 180px; width: 80%;" class="mi_content_textarea">{$material.note}</textarea>
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
