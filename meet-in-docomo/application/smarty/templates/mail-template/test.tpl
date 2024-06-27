{include file="./common/header.tpl"}
<link rel="stylesheet" href="/css/mail_template_create.css?{$application_version}">

<div id="mi_main_contents" class="mail_template_create">
	<!-- トップナビ start -->
	<div id="mi_top_nav">
		<!-- パンくずリスト start -->
		<div class="mi_breadcrumb_list"><a href="/index/menu">TOP</a>&nbsp;&gt;&nbsp;<a href="/mail-template">メールテンプレート</a>&nbsp;&gt;&nbsp;<a href="javascript:void(0);">テスト送信</a></div>
		<!-- パンくずリスト end -->
	</div>
	<!-- トップナビ end -->

	<!-- メインコンテンツ[start] -->
	<div id="mi_content_area">
		<!-- コンテンツタイトル start -->
		<div class="mi_content_title">
			<span class="icon-mail mi_content_title_icon"></span>
			<h1>
				メールDMテンプレートテスト送信
			</h1>
		</div>
		<!-- 見出し[end] -->

		<!-- テーブル start -->
		<div class="mi_table_main_wrap mi_table_input_right_wrap">
			<form id="mail_template" action="/mail-template/send">
				<input type="hidden" name="id" value={$template.id}>
				<table class="mi_table_input_right mi_table_main">
					<tbody>
						<tr>
							<th class="mi_tabel_title">宛先<span class="required">必須</span></th>
							<td class="mi_tabel_content"><input type="text" class="text_medium input" name="recipient"></td>
						</tr>
						<tr>
							<th class="mi_tabel_title">テンプレート名</th>
							<td class="mi_tabel_content"><input type="text" class="text_medium input" name="name" value="{$template.name}" readonly></td>
						</tr>
						<tr>
							<th class="mi_tabel_title">件名</th>
							<td class="mi_tabel_content"><input type="text" class="text_medium input" name="subject" id="subject" value="{$template.subject}" readonly></td>
						</tr>
						<tr>
							<th class="mi_tabel_title">送信者名（差出人名）</th>
							<td class="mi_tabel_content"><input type="text" class="text_medium input" name="from_name" value="{$template.from_name}" readonly></td>
						</tr>
						<tr>
							<th class="mi_tabel_title">送信元</th>
							<td class="mi_tabel_content"><input type="text" class="text_medium input" name="from" value="{$template.from}" readonly></td>
						</tr>
						<tr>
							<th class="mi_tabel_title">
								本文
							</th>
							<td class="mi_tabel_content"><textarea name="bodytext" id="bodytext" class="input" readonly>{$template.bodytext}</textarea></td>
						</tr>
						{* <tr>　<!-- 現状では実装しない 0427確認済み -->
							<th class="mi_tabel_title">添付ファイル</th>
							<td class="mi_tabel_content">
								<div class="apfile_dt clearfix" id="uploadFiles">
									<ul class="file-list" id="file-list">
									{foreach from=$template.files item=file name=foo}
										<li class="up_file_tag fname" id="file_{$smarty.foreach.foo.index}"><span class="up_file_name">{$file.fname_in_attached}</span><a href="javascript:void(0)" onclick="filedel('{$smarty.foreach.foo.index}')"><span class="up_file_del">×</span></a>
										<input type="hidden" class="input" name="fname_actual" value="{$file.fname_actual}" />
										<input type="hidden" class="input" name="fname_in_attached" value="{$file.fname_in_attached}" />
										</li>
									{/foreach}
									</ul>
								</div>
							</td>
						</tr> *}
					</tbody>
				</table>
			</form>
		</div>
		<!-- テーブル end -->
		<div class="btn_client_submit_area">
			<button type="button" name="submit_button" class="mi_default_button hvr-fade click-fade" id="submit_button">送信する</button>
		</div>
		<input type="hidden" name="client_id" value="{$clientDict.client_id|escape}" />
		<input type="hidden" name="ret" value="{$pram.ret}" />
		<!-- ====================================== 一覧表領域[start] ====================================================== -->
	</div>
</div>
<script>
{literal}
$(function() {
	$(document).on("click", "#submit_button", function() {
		recipient = $("input[name=recipient]").val();
		if(recipient == ""){
			alert('メールアドレスは必須です');
			return;
　　} else if(!recipient.match(/^([a-zA-Z0-9])+([a-zA-Z0-9\._-])*@([a-zA-Z0-9_-])+([a-zA-Z0-9\._-]+)+$/)) {
			alert('メールアドレスが不正です');
			return;
　　}
		id = $("input[name=id]").val();

		$.ajax($("#mail_template").attr("action"), {
			type: 'post',
			data: {id: id, recipient:recipient},
			dataType: 'json',
			success: function(data){
				if(data) {
					alert("メールを送信しました");
					window.location.href = "/mail-template";
				} else {
					alert("サーバーエラーです。管理者にお問い合わせください。");
				}
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
				alert("サーバーエラーです。管理者にお問い合わせください。");
			}
		});
	})
})
{/literal}
</script>