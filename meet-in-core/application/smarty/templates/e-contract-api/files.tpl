{include file="./common/header.tpl"}

{literal}
<script>
	$(function() {
		var dragdrop = $('#document_drop_area');
		var fileInput = $('#materialfile_drop');

		fileInput.on('change', function() {
			$('#document_drop_help').text('');
			var files = this.files;

			// ファイルバリデーション
			var fileCheck = false;
			Array.prototype.forEach.call(files, function(file, index) {

				if(fileCheck == true) {
					return;
				}

				// 添付ファイル件数.
				if(0 < index) {
					$('#document_drop_help').text('添付ファイルは最大1件です');
					fileInput.val('');
					fileCheck = true;
					return;
				}

				// ファイルサイズチェック
				if(file.size == 0) {
					$('#document_drop_help').text('ファイルサイズは0バイトです');
					fileInput.val('');
					fileCheck = true;
					return;
				}
				if(10000000 < file.size) {
					$('#document_drop_help').text('添付ファイルは最大容量は10Mです');
					fileInput.val('');
					fileCheck = true;
					return;
				}

				// ファイル拡張子チェック
				if(!file.name.toLowerCase().match(/.+\.pdf$/)) {
					$('#document_drop_help').text('アップロード可能ファイルはPDF形式ファイルのみです');
					fileInput.val('');
					fileCheck = true;
					return;
				}
			})
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

			$('#document_drop_help').text('');
			var files = e.dataTransfer.files;

			fileInput[0].files = files;
			$("#document_drop_area").removeClass("droppable");

			// ファイルバリデーション
			var fileCheck = false;
			Array.prototype.forEach.call(files, function(file, index) {

				if(fileCheck == true) {
					return;
				}

				// 添付ファイル件数.
				if(0 < index) {
					$('#document_drop_help').text('添付ファイルは最大1件です');
					fileInput.val('');
					fileCheck = true;
					return;
				}

				// ファイルサイズチェック
				if(file.size == 0) {
					$('#document_drop_help').text('ファイルサイズは0バイトです');
					fileInput.val('');
					fileCheck = true;
					return;
				}
				if(10000000 < file.size) {
					$('#document_drop_help').text('添付ファイルは最大容量は10Mです');
					fileInput.val('');
					fileCheck = true;
					return;
				}

				// ファイル拡張子チェック
				if(!file.name.toLowerCase().match(/.+\.pdf$/)) {
					$('#document_drop_help').text('アップロード可能ファイルはPDF形式ファイルのみです');
					fileInput.val('');
					fileCheck = true;
					return;
				}
			})
			return false;
		});

		$('#submit_button').on('click', function() {
			$('.form_setting_error').remove();
				var materialName = $('#material_name').val();
				var materialFile = $('#materialfile_drop').val();
				var id = $('#id').val();
				var errorCount = 0;
				if(materialName ==  '') {
				$('.e_contract_title_area').append('<div class="form_setting_error">テンプレート名を入力してください</div>');
				errorCount++;
			}
			if(materialFile == '' && id == '') {
				$('.e_contract_title_area').append('<div class="form_setting_error">契約書ファイルを選択してください</div>');
				errorCount++;
			}
			if(errorCount != 0) {
				$("html,body").animate({scrollTop:0}, 700);
				return false;
			} else {
				$('.upload_message').css('visibility', 'visible');
			}
		});

	// ボタン１回押下でdisabledにする処理
	$('#file_upload_form').submit(function() {
		$('.only_once_button').attr('disabled', true);
	});

	// 追加ボタンをクリックしてパートナーフォームを追加する
	$('#partner-add').on('click', function() {
	  var i = $('.partner_setting_item').length + 1;
	  $('#partner-area').append('<div class="partner_setting_item"><div class="partner_setting_item_header"><p><span class="icon-parsonal"></span><span class="partner_setting_item_count">' + i + '人目</span>：' + i + '番目に契約書にサインを行う人</p><div id="partner-remove" class="partner_setting_item_remove">×</div></div><div class="partner_setting_input_area"><input type="hidden" name="e_contract_address_id[]" value="0" /><div class="partner_setting_input_row"><label>氏名</label><input type="text" name="lastname[]" class="partner_setting_input_name lastname" placeholder="田中"><input type="text" name="firstname[]" class="partner_setting_input_name firstname" placeholder="太郎"></div><div class="partner_setting_input_row"><label>企業名</label><input type="text" name="organization_name[]" placeholder="入力してください" class="partner_setting_input"></div><div class="partner_setting_input_row"><label>役職</label><input type="text" name="title[]" placeholder="入力してください" class="partner_setting_input"></div><div class="partner_setting_input_row"><label>メールアドレス</label><input type="email" name="email[]" placeholder="aaaaa@aaaaa.jp" class="partner_setting_input email"></div><div class="partner_setting_item_lifting"><p class="partner_setting_item_lifting_label">承認順の変更</p><div class="partner_setting_item_lifting_btnarea"><div id="approval_down" class="partner_setting_item_lifting_btn">▼</div><div id="approval_up" class="partner_setting_item_lifting_btn">▲</div></div></div></div></div>');
	});

	// 承認順を上げる
	$(document).on('click', '#approval_up', function() {
	  var inputArea = $(this).parents('.partner_setting_input_area');
	  var lastName = inputArea.find('input[name="lastname[]"]').val();
	  var firstName = inputArea.find('input[name="firstname[]"]').val();
	  var organizationName = inputArea.find('input[name="organization_name[]"]').val();
	  var title = inputArea.find('input[name="title[]"]').val();
	  var email = inputArea.find('input[name="email[]"]').val();

	  var preArea = $(this).parents('.partner_setting_item').prev();
	  var preLastName = preArea.find('input[name="lastname[]"]').val();
	  var preFirstName = preArea.find('input[name="firstname[]"]').val();
	  var preOrganizationName = preArea.find('input[name="organization_name[]"]').val();
	  var preTitle = preArea.find('input[name="title[]"]').val();
	  var preEmail = preArea.find('input[name="email[]"]').val();

	  inputArea.find('input[name="lastname[]"]').val(preLastName);
	  inputArea.find('input[name="firstname[]"]').val(preFirstName);
	  inputArea.find('input[name="organization_name[]"]').val(preOrganizationName);
	  inputArea.find('input[name="title[]"]').val(preTitle);
	  inputArea.find('input[name="email[]"]').val(preEmail);

	  preArea.find('input[name="lastname[]"]').val(lastName);
	  preArea.find('input[name="firstname[]"]').val(firstName);
	  preArea.find('input[name="organization_name[]"]').val(organizationName);
	  preArea.find('input[name="title[]"]').val(title);
	  preArea.find('input[name="email[]"]').val(email);
	});

	// 承認順を下げる
	$(document).on('click', '#approval_down', function() {
	  var areaCount = $('.partner_setting_item').length;
	  var areaIndex = $(this).parents('.partner_setting_item').index();
	  if(areaCount == areaIndex + 1) {
		return false;
	  }

	  var inputArea = $(this).parents('.partner_setting_input_area');
	  var lastName = inputArea.find('input[name="lastname[]"]').val();
	  var firstName = inputArea.find('input[name="firstname[]"]').val();
	  var organizationName = inputArea.find('input[name="organization_name[]"]').val();
	  var title = inputArea.find('input[name="title[]"]').val();
	  var email = inputArea.find('input[name="email[]"]').val();

	  var nextArea = $(this).parents('.partner_setting_item').next();
	  var nextLastName = nextArea.find('input[name="lastname[]"]').val();
	  var nextFirstName = nextArea.find('input[name="firstname[]"]').val();
	  var nextOrganizationName = nextArea.find('input[name="organization_name[]"]').val();
	  var nextTitle = nextArea.find('input[name="title[]"]').val();
	  var nextEmail = nextArea.find('input[name="email[]"]').val();

	  inputArea.find('input[name="lastname[]"]').val(nextLastName);
	  inputArea.find('input[name="firstname[]"]').val(nextFirstName);
	  inputArea.find('input[name="organization_name[]"]').val(nextOrganizationName);
	  inputArea.find('input[name="title[]"]').val(nextTitle);
	  inputArea.find('input[name="email[]"]').val(nextEmail);

	  nextArea.find('input[name="lastname[]"]').val(lastName);
	  nextArea.find('input[name="firstname[]"]').val(firstName);
	  nextArea.find('input[name="organization_name[]"]').val(organizationName);
	  nextArea.find('input[name="title[]"]').val(title);
	  nextArea.find('input[name="email[]"]').val(email);
	});

	// バツボタンをクリックしてパートナーフォームを削除する
	$(document).on('click', '#partner-remove', function() {
	  $(this).parents('.partner_setting_item').remove();
	});


	});
</script>

<style>
	#document_drop_area{
		padding: 40px;
		border: 1px dashed #666;
		border-radius: 6px;
	}

	#document_drop_area.droppable {
		background-color: #ffe1a0;
		opacity: 0.7;
	}

	#document_drop_help {
		color: #F44;
		margin-left: 10px;
	}

	/* エラーのスタイル */
	.errmsg strong {
		color: #E16A6C;
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

	.partner_setting_table_label_partner {
		padding-left: 0px;
		font-weight: bold;
	}

	th {
	    text-align: left;
	}


</style>

{/literal}

<!-- メインコンテンツ[start] -->
<div id="mi_main_contents">
	<!-- トップナビ start -->
	<div id="mi_top_nav" class="acount_manage_on">
		<div class="mi_content_title">
			<span class="icon-folder mi_content_title_icon mi_pdn-left40"></span>
			<h1 class="mi_content_title_text">電子契約書テンプレート新規作成</h1>
		</div>
	</div>
	<!-- トップナビ end -->

	<!-- コンテンツエリア start -->
	<div id="mi_content_area">

		<!-- コンテンツ start -->
		<div class="e_contract_setting_area">

			<!-- ステップエリア begin -->
			<div class="e_contract_step_area">
				<img src="/img/create_template_1.png">
			</div>
			<!-- ステップエリア end -->

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

			<!-- タイトル表示エリア begin -->
			<div class="e_contract_title_area">
				{if $material.e_contract_document_id == ""}
				<h2>1.ファイルアップロード</h2>
				<p>電子契約書のテンプレートにしたい契約書ファイルをアップデートしてください。</p>
				{else}
				<h2>1.宛先の設定</h2>
				<p>電子契約書のテンプレートにしたい宛名を設定してください。</p>
				{/if}
			</div>
			<!-- タイトル表示エリア end -->
			<!-- フォーム start -->
			<form id="file_upload_form" class="/e-contract-api/files" method="post" enctype="multipart/form-data">
				<table class="e_contract_table">
					<tbody>
						<tr>
							<th>テンプレート名<span class="required">必須</span></th>
							<td class="mi_tabel_content">
								{if $material.e_contract_document_id == ""}
								<input type="text" class="text_medium" name="material_name" id="material_name" value="{$material.template_name|escape}" placeholder="入力してください">
								{else}
								<input type="text" class="text_medium" name="material_name" id="material_name" value="{$material.template_name|escape}" disabled>
								{/if}
							</td>
						</tr>
						{if $material.e_contract_document_id == ""}
						<tr id="material_type_file">
							<th class="mi_tabel_title">契約書ファイル<span class="required">必須</span></th>
							<td class="mi_tabel_content">
								<div id="document_drop_area" {if $browser == "Edge"}style="border: none;"{/if}>
									<p id="document_drop_label">{if $browser != "Edge"}契約書をドラッグ&ドロップしてください{/if}</p>
									<input type="file" value="ファイルを選択" name="material_file[]" id="materialfile_drop">
								</div>
								<p id="document_drop_help"></p>
							</td>
						</tr>
						{/if}
					  <tr class="partner_setting_partner_row" style="border-bottom: none">
						<th class="partner_setting_table_label_partner" style="border-right:none">宛先</th> <td id="partner-area">
						  {if $addressList}
							{foreach from=$addressList key=i item=row name=partner}
							  <div class="partner_setting_item">
								<div class="partner_setting_item_header">
								  <p><span class="icon-parsonal"></span><span class="partner_setting_item_count">{$smarty.foreach.partner.iteration}人目</span>：{$smarty.foreach.partner.iteration}番目に契約書にサインを行う人</p>
								  {if $i != 0}
									<div id="partner-remove" class="partner_setting_item_remove">×</div>
								  {/if}
								</div>
								<div class="partner_setting_input_area">
								  <input type="hidden" name="e_contract_address_id[]" value="{$row.e_contract_address_id|escape}" />
								  <div class="partner_setting_input_row">
									<label>氏名</label>
									<input type="text" name="lastname[]" class="partner_setting_input_name lastname" placeholder="田中" value="{$row.lastname|escape}"><input type="text" name="firstname[]" class="partner_setting_input_name firstname" placeholder="太郎" value="{$row.firstname|escape}">
								  </div>
								  <div class="partner_setting_input_row">
									<label>企業名</label>
									<input type="text" name="organization_name[]" placeholder="入力してください" class="partner_setting_input" value="{$row.organization_name|escape}">
								  </div>
								  <div class="partner_setting_input_row">
									<label>役職</label>
									<input type="text" name="title[]" placeholder="入力してください" class="partner_setting_input" value="{$row.title|escape}">
								  </div>
								  <div class="partner_setting_input_row">
									<label>メールアドレス</label>
									<input type="email" name="email[]" placeholder="aaaaa@aaaaa.jp" class="partner_setting_input email" value="{$row.email|escape}">
								  </div>
								  {if $i != 0}
									<div class="partner_setting_item_lifting">
									  <p class="partner_setting_item_lifting_label">承認順の変更</p>
									  <div class="partner_setting_item_lifting_btnarea">
										<div id="approval_down" class="partner_setting_item_lifting_btn">▼</div>
										<div id="approval_up" class="partner_setting_item_lifting_btn">▲</div>
									  </div>
									</div>
								  {/if}
								</div>
							  </div>
							{/foreach}
						  {else}
							<div class="partner_setting_item">
							  <div class="partner_setting_item_header">
								<p><span class="icon-parsonal"></span><span class="partner_setting_item_count">1人目</span>：1番目に契約書にサインを行う人</p>
							  </div>
							  <div class="partner_setting_input_area">
								<input type="hidden" name="e_contract_address_id[]" value="0" />
								<div class="partner_setting_input_row">
								  <label>氏名</label>
								  <input type="text" name="lastname[]" class="partner_setting_input_name lastname" placeholder="田中"><input type="text" name="firstname[]" class="partner_setting_input_name firstname" placeholder="太郎">
								</div>
								<div class="partner_setting_input_row">
								  <label>企業名</label>
								  <input type="text" name="organization_name[]" placeholder="入力してください" class="partner_setting_input">
								</div>
								<div class="partner_setting_input_row">
								  <label>役職</label>
								  <input type="text" name="title[]" placeholder="入力してください" class="partner_setting_input">
								</div>
								<div class="partner_setting_input_row">
								  <label>メールアドレス</label>
								  <input type="email" name="email[]" placeholder="aaaaa@aaaaa.jp" class="partner_setting_input email">
								</div>
							  </div>
							</div>
						  {/if}
						</td>
					  </tr>
					  <tr class="partner_setting_partner_row" style="border-bottom: none">
						<th style="border-right:none"></th>
						<td id="partner-area">
							<div id="partner-add" class="partner_setting_partner_add">追加</div>
						</td>
					  </tr>
					</tbody>
				</table>
				<div class="btn_client_submit_area">
					<button type="submit" name="submit_button" id="submit_button" class="mi_default_button only_once_button">パーツ配置へ</button>
				</div>
				<p class="upload_message">※アップロード中です。しばらくお待ちください。</p>
				<input type="hidden" id="id" name="id" value="{$material.e_contract_document_id|escape}" />
				<input type="hidden" name="next_page" value="" />
				<input type="hidden" name="next_page" value="2" />
				<input type="hidden" name="material_type" value="0" />
				<input type="hidden" name="material_url" value="{$material.material_url|escape}" />
				<input type="hidden" name="e_contract_document_material_id" value="{$material.e_contract_document_material_id|escape}" />
				<input type="hidden" name="download_flg" value="0" />
				<input type="hidden" name="shareable_flg" value="0" />
				<input type="hidden" name="note" value="{$material.note|escape}" />
				<input type="hidden" name="client_id" value="{$user.client_id|escape}" />
				<input type="hidden" name="staff_type" value="{$user.staff_type|escape}" />
				<input type="hidden" name="staff_id" id="material_staff_id" value="{$user.staff_id|escape}" />
			</form>
			<!-- フォーム end -->

		</div>
		<!-- コンテンツ end -->

	</div>
	<!-- コンテンツエリア end -->

</div>
<!-- メインコンテンツ[end] -->

{include file="./common/footer.tpl"}
