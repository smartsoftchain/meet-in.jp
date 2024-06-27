{include file="./common/header.tpl"}

{literal}
<link rel="stylesheet" href="/css/customize.css">

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

.f_name_{
	display: inline-block !important;
	width: 150px !important;
}

.td_inner_wrap {
	padding: 10px !important;
}

table.input-tbl th {
	width: 300px;
}

table.input-tbl .txtinp input[type="text"] {
	width: 802px;
	display: inline-block;
}

table.input-tbl .txtinp input[type="checkbox"] {
	width: 24px;
	display: inline-block;
}

.f_zip1			{width: 30px !important;}
.f_zip2			{width: 50px !important;}
.f_address		{width:500px !important;}
.f_tel1			{width: 50px !important;}
.f_mail			{width:295px !important;}

.txtinp-area {
	width: 500px;
	height: 120px;
	margin: 0;
	padding: 10px 12px;
	font-size: 1.05em;
	line-height: 1.5;
	border: 1px solid #d5d8dc;
	white-space: normal;
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

  	// ファイルを読む
	function readFile(fileName, file) {
		// ファイルの内容は FileReader で読み込みます.
		var fileReader = new FileReader();
		fileReader.onload = function(event) {
			var fileNames = fileName.split(".")[0];
		}
		
		fileReader.onloadend = function(event) {
			// データURIを取得
			var dataUri = this.result ;

			// HTMLに書き出し (src属性にデータURIを指定)
			document.getElementById( "preview" ).src = event.target.result;//dataUri;

			_U.showLoading("ファイルアップロード中です");
			$.ajax({
				url: "/common/send-img-data",
				type: "POST",
				data: {fileName : fileName, imgData : event.target.result},  // 検索など引数を渡す必要があるときこれを使う
				//dataType: 'json',        // サーバーなどの環境によってこのオプションが必要なときがある
				success: function(result) {
					_U.hideLoading();
				}
			});
    	}
		
		// ファイルをデータURIとして読み込む
		fileReader.readAsDataURL( file ) ;
	};


	// ファイルアップロード候補の情報を画面に表示する
	function showUploadFile(files) {
		for (var i=0,len=files.length; i<len; i++) {
			
			var file = files[i];
			uploadFileNames = file.name.split(".");
//			
			if (uploadFileNames.pop() == "jpg") {
//				
//				totalFileSize += file.size;
//				var viewTotalFileSize = totalFileSize / 1048576;
//				
//				if (viewTotalFileSize <= 15) {
//					
//					$("#total_file_size").text(viewTotalFileSize.toFixed(3));
//					
					// ファイルの内容は FileReader で読み込みます.
					readFile(file.name, file);
					
//				} else {
//					alert("一度にアップロードできるのは15Mまでです。");
//				}
//				
			} else {
				alert("アップロード出来るのはJPEGファイルのみです。");
			}
		}
	}

	/*================================================
	    ダミーボタンを押した時の処理
	  =================================================*/
	$("#file-select-btn").on("click", function() {
		// ダミーボタンとinput[type="file"]を連動
	    $('input[type="file"]').click();
	});
	
	$('input[type="file"]').change(function(){
	    // ファイル情報を取得
	    var files = this.files;
		
	    showUploadFile(files);
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

		<form action="/setting-account/user-info" method="post" enctype="multipart/form-data" >
			<div class="article-box mgn-t25">

				<table class="layout folder-create">
					<tbody>
						<tr>
							<th>
								{if ($staff.name_public_flg == 0)}
									<input type="checkbox" name="name_public_flg" value="1">
								{else}
									<input type="checkbox" name="name_public_flg" value="1" checked="checked">
								{/if}
							</th>
							<th>名前<span class="required">必須</span></th>
							<td class="txtinp">
								<input type="text" class="f_name_" name="staff_firstname" value="{$staff.staff_firstname}" />
								<input type="text" class="f_name_" name="staff_lastname" value="{$staff.staff_lastname}" />
							</td>
						</tr>
						<tr>
							<th></th>
							<th style="width: 210px;"><span>担当者ID</span></th>
							<td class="txtinp">
								<div class="no_bb"><input type="text" value="{$userId|escape}" disabled="disabled" /></div>
								<input type="hidden" class="f_hp" name="staff_type" value="{$staff.staff_type}" />
								<input type="hidden" class="f_hp" name="staff_id" value="{$staff.staff_id}" />
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
							<th>
								{if ($staff.picture_public_flg == 0)}
									<input type="checkbox" name="picture_public_flg" value="1">
								{else}
									<input type="checkbox" name="picture_public_flg" value="1" checked="checked">
								{/if}
							</th>
							<th>写真</th>
							<td>
								<div>
									<img src="/img/profile/{$staff.staff_type}_{$staff.staff_id}.jpg" alt="No Image" id="preview" width="100" height="100">
									<a id="file-select-btn" class="btn-drk mid">
										<span>画像を選択</span>
									</a>
									<input type="file">
								</div>
							</td>
						</tr>
						<tr>
							<th>
								{if ($staff.email_public_flg == 0)}
									<input type="checkbox" name="email_public_flg" value="1">
								{else}
									<input type="checkbox" name="email_public_flg" value="1" checked="checked">
								{/if}
							</th>
							<th>メールアドレス<span class="required">必須</span></th>
							<td class="txtinp">
								<input type="text" class="f_mail" name="staff_email" value="{$staff.staff_email}" />
							</td>
						</tr>
						<tr>
							<th>
								{if ($staff.client_name_public_flg == 0)}
									<input type="checkbox" name="client_name_public_flg" value="1">
								{else}
									<input type="checkbox" name="client_name_public_flg" value="1" checked="checked">
								{/if}
							</th>
							<th>会社名</th>
							<td class="txtinp">
								<input type="text" class="f_mail" name="client_name" value="{$staff.client_name}" />
							</td>
						</tr>
						<tr>
							<th>
								{if ($staff.department_name_public_flg == 0)}
									<input type="checkbox" name="department_name_public_flg" value="1">
								{else}
									<input type="checkbox" name="department_name_public_flg" value="1" checked="checked">
								{/if}
							</th>
							<th>部署名</th>
							<td class="txtinp">
								<input type="text" class="f_mail" name="department" value="{$staff.department}" />
							</td>
						</tr>
						<tr>
							<th>
								{if ($staff.executive_public_flg == 0)}
									<input type="checkbox" name="executive_public_flg" value="1">
								{else}
									<input type="checkbox" name="executive_public_flg" value="1" checked="checked">
								{/if}
							</th>
							<th>役職</th>
							<td class="txtinp">
								<input type="text" class="f_mail" name="executive" value="{$staff.executive}" />
							</td>
						</tr>
						<tr>
							<th>
								{if ($staff.address_public_flg == 0)}
									<input type="checkbox" name="address_public_flg" value="1">
								{else}
									<input type="checkbox" name="address_public_flg" value="1" checked="checked">
								{/if}
							</th>
							<th>住所<span class="required">必須</span></th>
							<td class="txtinp td_inner_wrap">
								<div>
									<input type="text" class="f_zip1" name="client_postcode1" value="{$staff.client_postcode1|escape}" /> -
									<input type="text" class="f_zip2" name="client_postcode2" value="{$staff.client_postcode2|escape}" />
								</div>
								<div class="mgn-t5">
									<input type="text" class="f_address" name="address" value="{$staff.address|escape}" />
								</div>
							</td>
						</tr>
						<tr>
							<th>
								{if ($staff.tel_public_flg == 0)}
									<input type="checkbox" name="tel_public_flg" value="1">
								{else}
									<input type="checkbox" name="tel_public_flg" value="1" checked="checked">
								{/if}
							</th>
							<th>電話番号</th>
							<td class="txtinp">
								<input type="text" class="f_tel1" name="tel1" value="{$staff.tel1|escape}"/> -
								<input type="text" class="f_tel1" name="tel2" value="{$staff.tel2|escape}"/> -
								<input type="text" class="f_tel1" name="tel3" value="{$staff.tel3|escape}"/>
							</td>
						</tr>
						<tr>
							<th>
								{if ($staff.cell_public_flg == 0)}
									<input type="checkbox" name="cell_public_flg" value="1">
								{else}
									<input type="checkbox" name="cell_public_flg" value="1" checked="checked">
								{/if}
							</th>
							<th>携帯番号</th>
							<td class="txtinp">
								<input type="text" class="f_tel1" name="cell1" value="{$staff.cell1|escape}"/> -
								<input type="text" class="f_tel1" name="cell2" value="{$staff.cell2|escape}"/> -
								<input type="text" class="f_tel1" name="cell3" value="{$staff.cell3|escape}"/>
							</td>
						</tr>
						<tr>
							<th>
								{if ($staff.fax_public_flg == 0)}
									<input type="checkbox" name="fax_public_flg" value="1">
								{else}
									<input type="checkbox" name="fax_public_flg" value="1" checked="checked">
								{/if}
							</th>
							<th>FAX番号</th>
							<td class="txtinp">
								<input type="text" class="f_tel1" name="fax1" value="{$staff.fax1|escape}"/> -
								<input type="text" class="f_tel1" name="fax2" value="{$staff.fax2|escape}"/> -
								<input type="text" class="f_tel1" name="fax3" value="{$staff.fax3|escape}"/>
							</td>
						</tr>
						<tr>
							<th>
								{if ($staff.facebook_public_flg == 0)}
									<input type="checkbox" name="facebook_public_flg" value="1">
								{else}
									<input type="checkbox" name="facebook_public_flg" value="1" checked="checked">
								{/if}
							</th>
							<th>Facebook</th>
							<td class="txtinp">
								<input type="text" class="f_mail" name="facebook" value="{$staff.facebook}" />
							</td>
						</tr>
						<tr>
							<th>
								{if ($staff.sns_public_flg == 0)}
									<input type="checkbox" name="sns_public_flg" value="1">
								{else}
									<input type="checkbox" name="sns_public_flg" value="1" checked="checked">
								{/if}
							</th>
							<th>SNS</th>
							<td class="txtinp">
								<input type="text" class="f_mail" name="sns" value="{$staff.sns}" />
							</td>
						</tr>
						<tr>
							<th>
								{if ($staff.free1_public_flg == 0)}
									<input type="checkbox" name="free1_public_flg" value="1">
								{else}
									<input type="checkbox" name="free1_public_flg" value="1" checked="checked">
								{/if}
							</th>
							<th>
								<input type="text" class="f_mail" name="free_item_name1" value="{$staff.free_item_name1}" />
							</th>
							<td class="txtinp">
								<input type="text" class="f_mail" name="free_item_val1" value="{$staff.free_item_val1}" />
							</td>
						</tr>
						<tr>
							<th>
								{if ($staff.free2_public_flg == 0)}
									<input type="checkbox" name="free2_public_flg" value="1">
								{else}
									<input type="checkbox" name="free2_public_flg" value="1" checked="checked">
								{/if}
							</th>
							<th>
								<input type="text" class="f_mail" name="free_item_name2" value="{$staff.free_item_name2}" />
							</th>
							<td class="txtinp">
								<input type="text" class="f_mail" name="free_item_val2" value="{$staff.free_item_val2}" />
							</td>
						</tr>
						<tr>
							<th colspan="3">共有メモフォーマット</th>
						</tr>
						<tr>
							<td colspan="3" rowspan="5">
								<input type="textarea" name="memo_template" value="{$staff.memo_template}" rows="5" cols="500" />
							</td>
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
