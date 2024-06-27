{include file="./common/header.tpl"}

{literal}

<style>
.layout div.no_bb {
	border-bottom: 0 !important;
}

a.mail {
	width: 38px;
	height: 35px;
	padding: 0;
    line-height: 0;
    text-indent: 999%;
    border: 1px solid #d5d8dc;
    border-bottom: 4px solid #d1dfe5;
    background: #d8e4e9 url(../img/icon_mail_s.png) no-repeat center center;
}

.mail:hover,
a.mail:hover {
	background: #d1dfe5 url(../img/icon_mail_s.png) no-repeat center center;
}

tr.answer textarea {
	width: 802px !important;
	padding: 9px 18px !important;
	font-size: 1em !important;
}

#mta-setting table th {
	width: 250px;
}

table.input-tbl.lftbtn input {
	width: 802px;
}

</style>

<script>

$(function(){

	// MTA設定追加時に必要な次のインデックス番号を生成
	function _getNextIndex() {

		var max_index = 0;
		$("#mta-setting table").each(function() {

			var current_sender_address_name = $(this).find(".sender_address").attr("name");

			console.log("name : ", current_sender_address_name);

			if (current_sender_address_name.match(/^mta_setting\[([0-9]+)\]\[sender_address\]$/)) {
				max_index = Math.max(max_index, (+RegExp.$1));
			}
		});

		return (max_index + 1);
	}

	// MTA設定の追加
	$("#add-mta-setting").on("click", function() {

		var template = Handlebars.compile($('#sender-mail-info-template').html());

		// 現在の[name='mta_setting']の最大のインデックス値に+1した、値を取得する。
		var next_index = _getNextIndex();

		$("#mta-setting").append(template({
			"index" : next_index
		}));
	});

	// 新規のMTA設定の削除
	$(document).on("click", ".delete-new-mta-setting", function() {
		$(this).closest("table").remove();
	});

	// テストメール送信
	$(document).on("click", ".mail", function() {

		if (confirm("テストメールを送信しますか？")) {

			// TODO メール送信
			var $parent = $(this).closest("table");

			$.ajax({
				url: "test-mail",
				type: "POST",
				data: {
					"sender_address"   : $parent.find(".sender_address").val(),		// 送信者メールアドレス
					"stmp_server_path" : $parent.find(".stmp_server_path").val(),	// SMTPサーバ
					"stmp_port"        : $parent.find(".stmp_port").val(),			// SMTPポート
					"stmp_user"        : $parent.find(".stmp_user").val(),			// SMTPユーザ名
					"stmp_password"    : $parent.find(".stmp_password").val(),		// SMTPパスワード
					//"pop_server_path"  : $parent.find(".pop_server_path").val(),	// POPサーバ
					//"pop_port"         : $parent.find(".pop_port").val(),			// POPポート
					//"pop_user"         : $parent.find(".pop_user").val(),			// POPユーザ
					//"pop_password"     : $parent.find(".pop_password").val()		// POPパスワード
				},
				dataType: 'json',
				success: function(result) {

					if (result != "") {
						alert("テスト送信に成功しました。");
					} else {
						alert("テスト送信に失敗しました。");
					}
				}
			});
		}
	});


});

</script>

{/literal}

<!-- コンテンツ領域[start] -->
<div id="content-area">

	<!-- メインコンテンツ[start] -->
	<div id="main_contents">
		<!-- 見出し[start] -->
		<div class="heading">
			<div class="pgtitle clearfix">
				<h3>個人情報・接続設定</h3>
				<h3><input type="checkbox" name="exp" checked="checked" disabled="disabled">名刺に表示</h3>
			</div>
		</div>
		<!-- 見出し[end] -->

		<!-- エラーメッセージ出力箇所 -->
		{include file="./common/error.tpl"}

		<!-- 成功メッセージ出力箇所 -->
		{include file="./common/success.tpl"}

		<p class="error_msg mb10">
			<strong>{$success_msg}</strong><br>
		</p>

		<form action="/setting-account/user-info" method="post" >
			<div class="article-box mgn-t25">

				<table class="layout folder-create">
					<tbody>
						<tr>
							<th></th>
							<th style="width: 210px;"><span>担当者ID</span></th>
							<td class="txtinp">
								<div class="no_bb"><input type="text" value="{$userId|escape}" disabled="disabled" /></div>
							</td>
						</tr>
						<tr>
							<th></th>
							<th><span>パスワード</span></th>
							<td class="txtinp">
								<div class="no_bb"><input type="password" name="staff_password" value="" /></div>
							</td>
						</tr>
						<tr>
							<th><input type="checkbox" name=""></th>
							<th>担当者メールアドレス<span class="required">必須</span></th>
							<td class="txtinp"><div><input type="text" name="staff_email" value="{$staff.staff_email|escape}" /></div></td>
						</tr>
					</tbody>
				</table>
			</div>

			<div class="area1btn mgn-t20">
				<input type="submit" class="btn large2" value="登録" />
			</div>
		</form>
	</div>
	<!-- メインコンテンツ[end] -->

</div>

{literal}

<!-- 送信者メール情報テンプレート -->
<script id="sender-mail-info-template" type="text/x-handlebars-template">
<table class="layout input-tbl lftbtn mgn-b10">
	<tbody>
		<tr>
			<td class="btncel">
				<a href="javascript:void(0);" class="btn-gry del2 delete-new-mta-setting">削除</a>
			</td>
			<th>送信者メールアドレス<span class="required">必須</span></th>
			<td class="txtinp">
				<input type="text" class="sender_address" name="mta_setting[{{index}}][sender_address]" value="" />
			</td>
		</tr>
		<tr class="answer">
			<td class="btncel"></td>
			<th><span class="space"></span>SMTPサーバ</th>
			<td class="txtinp">
				<input type="text" class="stmp_server_path" name="mta_setting[{{index}}][sender_smtp_server]" value="" />
			</td>
		</tr>
		<tr class="answer">
			<td class="btncel"></td>
			<th><span class="space"></span>SMTPポート</th>
			<td class="txtinp">
				<input type="text" class="stmp_port" name="mta_setting[{{index}}][sender_smtp_port]" value="" />
			</td>
		</tr>
		<tr class="answer">
			<td class="btncel"></td>
			<th><span class="space"></span>SMTPユーザ名</th>
			<td class="txtinp">
				<input type="text" class="stmp_user" name="mta_setting[{{index}}][ehlo_user]" value="" />
			</td>
		</tr>
		<tr class="answer">
			<td class="btncel"></td>
			<th><span class="space"></span>SMTPパスワード</th>
			<td class="txtinp">
				<input type="password" class="stmp_password" name="mta_setting[{{index}}][ehlo_password]" value="" />
			</td>
		</tr>
		<tr class="answer">
			<td class="btncel"></td>
			<th><span class="space"></span>POPサーバ</th>
			<td class="txtinp">
				<input type="text" class="pop_server_path" name="mta_setting[{{index}}][dsn_server]" value="" />
			</td>
		</tr>
		<tr class="answer">
			<td class="btncel"></td>
			<th><span class="space"></span>POPポート</th>
			<td class="txtinp">
				<input type="text" class="pop_port" name="mta_setting[{{index}}][dsn_port]" value="" />
			</td>
		</tr>
		<tr class="answer">
			<td class="btncel"></td>
			<th><span class="space"></span>POPユーザ名</th>
			<td class="txtinp">
				<input type="text" class="pop_user" name="mta_setting[{{index}}][dsn_user]" value="" />
			</td>
		</tr>
		<tr class="answer">
			<td class="btncel"></td>
			<th><span class="space"></span>POPパスワード</th>
			<td class="txtinp">
				<input type="password" class="pop_password" name="mta_setting[{{index}}][dsn_password]" value="" />
			</td>
		</tr>
		<tr class="answer">
			<td class="btncel"></td>
			<th><span class="space"></span>備考</th>
			<td class="txtinp">
				<textarea rows="7" cols="40" name="mta_setting[{{index}}][note]"></textarea>
			</td>
		</tr>
	</tbody>
</table>
</script>

{/literal}

<!-- コンテンツ領域[end] -->
{include file="./common/footer.tpl"}
