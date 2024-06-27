{include file="./common/header.tpl"}

{literal}
<script>
$(function (){
	// 商談結果テンプレートのデータ取得
	var negotiationResultTmpl;
	function changeNegotiationTmplList(template_id, next_action, possibility) {
		$("#next_action").find('option').remove();
		$("#possibility").find('option').remove();
		$.each(negotiationResultTmpl, function(i,template) {
			if(template_id == template.template_id) {
				var next_action_list = JSON.parse(template.next_action_list);
				$.each(next_action_list, function(i,e) {
					var opt = $('<option></option>').val(i).text(e);
					if(next_action == i) {
						opt.attr('selected', true);
					}
					$("#next_action").append(opt);
				});
				var result_list = JSON.parse(template.result_list);
				$.each(result_list, function(i,e) {
					var opt = $('<option></option>').val(i).text(e);
					if(possibility == i) {
						opt.attr('selected', true);
					}
					$("#possibility").append(opt);
				});
			}
		});
	}
	function setNegotiationTmplList() {
		$("#submit_button").on('click', function() {
	// ボタン不可に
	$("#submit_button").prop("disabled", true);
	$("#submit_button").text("登録中です...");
	$("#material_form").submit();
});

		var tmpl_option = $('<option></option>').val("").text("選択してください");
		$("#negotiation_tmpl_list").append(tmpl_option);
		$.each(negotiationResultTmpl, function(i,e) {
			var tmpl_option = $('<option></option>').val(e.template_id).text(e.template_name);
			$("#negotiation_tmpl_list").append(tmpl_option);
		});
	}
	function showNegotiationTmplList(template_id, next_action, possibility) {
		$("#negotiation_tmpl_list").find("option").each(function(i,e) {
			if(template_id == "") {
				$("#next_action").find('option').remove();
				$("#possibility").find('option').remove();
			} else if(template_id !== "" && template_id == e.value) {
				e.selected = true;
				changeNegotiationTmplList(template_id, next_action, possibility);
			}
		});
	}

	$.ajax({
		url: '/negotiation/get-negotiation-tmpl-list',
		dataType: 'text',
		data: {
			client_id: $("input[id=client_id]").val(),
		}
	}).done(function(res) {
		negotiationResultTmpl = JSON.parse(res);
		// 初期値設定
		setNegotiationTmplList();
		var template_id = $("[name=template_id]").val();
		var next_action = $("[name=next_action] option:selected").val();
		var possibility = $("[name=possibility] option:selected").val();
		console.log(template_id + ' ' + next_action + ' ' + possibility);
		showNegotiationTmplList(template_id, next_action, possibility);
	}).fail(function(res) {
	});
	// テンプレート変更時
	$("#negotiation_tmpl_list").on("change", function() {
		// 次回アクションと商談結果を変更
		showNegotiationTmplList($(this).val(), 0, 0);
	});
});
</script>
<style type="text/css">
<!--

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

.mi_table_main2 {
  margin: 0 auto;
  height: auto;
  width: 960px;
  border: 2px ridge;
}

.mi_table_main2 tr {
  border: 2px ridge;
}

.mi_table_main_wrap2 {
  width: 960px;
  max-width: 960px;
}

.mi_table_main2 th {
  height: 40px;
  color: #fff;
  background-color: #0081CC;
  font-weight: normal;
  text-align: center;
  vertical-align: middle;
  white-space: nowrap;
  border-right: 2px ridge;
}

.mi_table_main2 td {
  width: auto;
  height: 40px;
  margin: 0px;
  padding: 0px;
  color: #6e6e6e;
  text-align: left;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  border-bottom: 1px solid #c8c8c8;
  vertical-align: middle;
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
	padding: 0 10px;
	display: inline-block !important;
}
.text_long{
	width:443px !important;
	height: 100%;
	padding: 0 10px;
	display: inline-block !important;
}

.mi_content_title_option span {
  width: 50px;
  height: 1em;
  position: absolute;
  top: 25px;
  left: 0px;
  text-align: center;
}

/* エラーメッセージ */
.errmsg {
	font-size: 0.95em;
	line-height: 1.6;
	color: #df6b6d;
	padding-bottom: 15px;
}

/* 画面録画ダウンロードURL */

.mi_table_input_right .download_url {
	padding: 8px 21px;
}

.mi_table_input_right .download_url .download_url_body {
	white-space: pre-wrap;
	color: #1a73e8;
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
			<a href="/negotiation/negotiation-list">接続履歴</a>&nbsp;&gt;&nbsp;
			<a href="/negotiation/negotiation-edit?id={$BDRDict.id}">接続履歴詳細</a></div>
		<!-- パンくずリスト end -->

	</div>
	<!-- トップナビ end -->

	<!-- コンテンツエリア start -->
	<div id="mi_content_area">

		<!-- コンテンツタイトル start -->
		<div class="mi_content_title">
			<h1><span class="icon-connect mi_content_title_icon"></span>&nbsp;接続履歴</h1>
			<div class="mi_flt-r">
				<div class="mi_content_title_option">
					<a href="/negotiation/download-csv?id={$BDRDict.id}" class="mi_title_action_btn">
						<span class="icon-download"></span>
						<span>CSV</span>
					</a>
					<a href="/negotiation/negotiation-delete?id={$BDRDict.id}" class="mi_title_action_btn del_chk" id="del_chk" onclick="return confirm('削除しますがよろしいですか')">
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

		<form action="/negotiation/negotiation-edit" method="post" id="material_form">
			<!-- テーブル start -->
			<div class="mi_table_main_wrap mi_table_input_right_wrap">
        <table class="mi_table_input_right mi_table_main">
					<tbody>
						<tr>
							<td class="mi_tabel_title">ルーム名</td>
							<td class="txtinp mi_tabel_content">　{$BDRDict.room_name}</td>
						</tr>
						<tr>
							<td class="mi_tabel_title">接続開始時間</td>
							<td class="txtinp mi_tabel_content">　{$BDRDict.stime}</td>
						</tr>
						<tr>
							<td class="mi_tabel_title">接続終了時間</td>
							<td class="txtinp mi_tabel_content">　{$BDRDict.etime}</td>
						</tr>
						<tr>
							<td class="mi_tabel_title">接続時間</td>
							<td class="txtinp mi_tabel_content">　{$BDRDict.video_time}</td>
						</tr>
						{* <tr>
							<td class="mi_tabel_title">録画ダウンロードURL</td>
							<td class="txtinp mi_tabel_content download_url">
								<a href="{$BDRDict.download_url}" class="download_url_body" target="_blank" rel="noopener noreferrer">{$BDRDict.download_url}</a>
							</td>
						</tr> *}
						<tr>
							<td class="mi_tabel_title">商談結果テンプレート</td>
							<td class="txtinp mi_tabel_content">
								<select id="negotiation_tmpl_list" name="negotiation_tmpl_list" class="mi_default_input">
								</select>
							</td>
						</tr>
						<tr>
							<td class="mi_tabel_title">次回アクション</td>
							<td class="txtinp mi_tabel_content">
								<select name="next_action" id="next_action" class="mi_default_input">
									<option value="{$BDRDict.next_action}" {if $BDRDict.next_action == 1}selected="selected"{/if}></option>
								</select>
							</td>
						</tr>
						<tr>
							<td class="mi_tabel_title">商談見込み</td>
							<td class="txtinp mi_tabel_content">
								<select name="possibility" id="possibility" class="mi_default_input">
									<option value="{$BDRDict.possibility}" {if $BDRDict.possibility == 0}selected="selected"{/if}></option>
								</select>
							</td>
						</tr>
						<tr>
							<td class="mi_tabel_title">共有メモ</td>
							<td class="txtinp mi_tabel_content">
								<textarea name="sharing_memo" class="mi_default_input" rows="3" cols="100" style="height: 180px;width: 97%;padding: 0 10px;">{$BDRDict.sharing_memo}</textarea>
							</td>
						</tr>
                                                <tr>
							<td class="mi_tabel_title">チャット</td>
							<td class="txtinp mi_tabel_content">
								<textarea name="chat_contents" class="mi_default_input" rows="3" cols="100" style="height: 180px;width: 97%;padding: 0 10px;">{$BDRDict.chat_contents}</textarea>
							</td>
						</tr>

						<tr>
							<td class="mi_tabel_title">シークレットコメント</td>
							<td class="txtinp mi_tabel_content">
								<textarea name="secret_comment" class="mi_default_input" rows="3" cols="100" style="height: 180px;width: 97%;padding: 0 10px;">{$BDRDict.secret_comment}</textarea>
							</td>
						</tr>
						<tr>
							<td class="mi_tabel_title">会社名</td>
							<td class="txtinp mi_tabel_content">
								<input type="text" class="text_long mi_default_input" name="company_name" value="{$BDRDict.company_name}"/>
							</td>
						</tr>
						<tr>
							<td class="mi_tabel_title">先方担当者名</td>
							<td class="txtinp mi_tabel_content">
								<input type="text" class="text_long mi_default_input" name="staff_name" value="{$BDRDict.staff_name}"/>
							</td>
						</tr>
						<tr>
							<td class="mi_tabel_title">部署名</td>
							<td class="txtinp mi_tabel_content">
								<input type="text" class="text_long mi_default_input" name="client_service_id" value="{$BDRDict.client_service_id}"/>
							</td>
						</tr>
						<tr>
							<td class="mi_tabel_title">担当者・役職</td>
							<td class="txtinp mi_tabel_content">
								<input type="text" class="text_long mi_default_input" name="executive" value="{$BDRDict.executive}"/>
							</td>
						</tr>
							<tr>
								<td class="mi_tabel_title">電話番号</td>
								<td class="txtinp mi_tabel_content">
									<input type="text" class="text_short mi_default_input" name="tel1" value="{$BDRDict.tel1|escape}"/>-
									<input type="text" class="text_short mi_default_input" name="tel2" value="{$BDRDict.tel2|escape}"/>-
									<input type="text" class="text_short mi_default_input" name="tel3" value="{$BDRDict.tel3|escape}"/>
								</td>
							</tr>
							<tr>
								<td class="mi_tabel_title">FAX番号</td>
								<td class="txtinp mi_tabel_content">
									<input type="text" class="text_short mi_default_input" name="fax1" value="{$BDRDict.fax1|escape}"  />-
									<input type="text" class="text_short mi_default_input" name="fax2" value="{$BDRDict.fax2|escape}"  />-
									<input type="text" class="text_short mi_default_input" name="fax3" value="{$BDRDict.fax3|escape}"  />
								</td>
							</tr>
						<tr>
							<td class="mi_tabel_title">メールアドレス</td>
							<td class="txtinp mi_tabel_content">
								<input type="text" class="text_long mi_default_input" name="email" value="{$BDRDict.email}"/>
							</td>
						</tr>
						<tr>
							<td class="mi_tabel_title">メモ</td>
							<td class="txtinp mi_tabel_content">
								<textarea name="memo" class="mi_default_input" rows="3" cols="100" style="height: 180px;width: 97%;padding: 0 10px;">{$BDRDict.memo}</textarea>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
			<!-- テーブル end -->
			<div class="btn_client_submit_area">
				<button type="submit" name="submit_button" class="mi_default_button" id="submit_button">登録する</button>
			</div>
			<input type="hidden" name="staff_type" value="{$BDRDict.staff_type|escape}" />
			<input type="hidden" name="staff_id"   value="{$BDRDict.staff_id|escape}" />
			<input type="hidden" name="stime"      value="{$BDRDict.stime|escape}" />
			<input type="hidden" name="id"         value="{$BDRDict.id}" />
			<input type="hidden" name="template_id"    value="{$BDRDict.template_id}" />

		</form>
	</div>
	<!-- コンテンツエリア end -->

</div>
<!-- メインコンテンツ end -->

{include file="./common/footer.tpl"}
