{include file="./common/header.tpl"}

{literal}
<link rel="stylesheet" href="/css/customize.css">
<style>
.registMessage {
    font-size: 1em;
    font-weight: bold;
    color: #ec6d71;
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

</style>
<script>
$(function (){

	// 「CC」追加
	$("#add_cc").click(function(){
		$idCount = $("#cc_area").children('div').length;
		$("#cc_area").append('<div><input type="text" class="f_mail" name="append_cc[]" id="cc"/> <input type="button" value="削除" id="del_cc" ></div>');
	});

	// 「CC」削除
	$(document).on('click', '#del_cc', function(){
		if(window.confirm('削除しますがよろしいですか')){
			$(this).parent("div").remove();
		}
	});

	// 「サービス/商品名」追加
	$("#add_service").click(function(){
		var service_tag = '<div class="mgn-t2"><input type="text" id="service_name" class="f_mail" name="new_service_name[]" value="" /><input type="button" class="button white medium" value="削除" id="del_service"></div>';
		$('#service_area').append( service_tag );
	});

	// 「サービス/商品名」削除
	$(document).on('click', '#del_service', function(){
		$(this).parent("div").remove();
	});
	
	// 登録処理実行前に権限のdisabledを削除し、submitする
	$(document).on('click', '#on_submit', function(){
		$(".staff_role_admin").removeAttr("disabled");
		$('#form_setting_client_staff').submit();
	});
	
	// 「password」ブラウザが記憶している値を削除
	var newText = '';
	$(':text[name="staff_password"]').val(newText);
	$('#staff_password').val(newText);
});
</script>
{/literal}

<!-- コンテンツ領域[start] -->
<div id="content-area">

	<!-- メインコンテンツ[start] -->
	<div id="main_contents">

		<form action="/setting-client-staff/regist" method="post" id="form_setting_client_staff" autocomplete="off">
			<div class="heading">
				<div class="pgtitle clearfix">
					<h3>AAアカウント発行・編集</h3>
				</div>
			</div>
			<p class="head-descript">担当者情報を入力してください。</p>
			<div  class="pgtitle clearfix mgn-b15">
				<!-- エラー出力箇所 -->
				{include file="./common/error.tpl"}
				
				<!-- 登録メッセージ出力箇所 -->
				{if $registMessage} 
					<p class="attention">{$registMessage}</p>
				{/if}
			</div>
			<!-- 見出し[end] -->
			
			<div class="article-box mgn-t15">
				<table class="layout input-tbl">
					<tr>
						<th>クライアントID</th>
						<td class="txtinp-text">{$result.client_display_id}
							<input type="hidden" class="f_hp" name="client_display_id" value="{$result.client_display_id}" />
							<input type="hidden" class="f_hp" name="staff_type" value="{$result.staff_type}" />
							<input type="hidden" class="f_hp" name="staff_id" value="{$result.staff_id}" />
						</td>
					</tr>
					<tr>
						<th>クライアント担当ID</th>
						<td class="txtinp-text">
							{$result.account_id}
							<input type="hidden" class="f_hp" name="account_id" value="{$result.account_id}" />
						</td>
					</tr>
					<tr>
						<th>パスワード</th>
						<td class="txtinp">
							<div>
								<input type="password" class="f_hp" name="staff_password" id="staff_password" value="{$result.staff_password}" autocomplete="off" />
							</div>
							<div>
								※パスワードを変更する場合は入力してください。
							</div>
						</td>
					</tr>
					<tr>
						<th>名前<span class="must"><span>必須</span></span></th>
						<td class="txtinp">
							<input type="text" class="f_name_" name="staff_firstname" value="{$result.staff_firstname}" />
							<input type="text" class="f_name_" name="staff_lastname" value="{$result.staff_lastname}" />
						</td>
					</tr>
					<tr>
						<th>住所<span class="must"><span>必須</span></span></th>
						<td class="txtinp td_inner_wrap">
							<div>
								<input type="text" class="f_zip1" name="client_postcode1" value="{$result.client_postcode1|escape}" /> -
								<input type="text" class="f_zip2" name="client_postcode2" value="{$result.client_postcode2|escape}" />
							</div>
							<div class="mgn-t5">
								<input type="text" class="f_address" name="address" value="{$result.address|escape}" />
							</div>
						</td>
					</tr>
					<tr>
						<th>電話番号</th>
						<td class="txtinp">
							<input type="text" class="f_tel1" name="tel1" value="{$result.tel1|escape}"/> -
							<input type="text" class="f_tel1" name="tel2" value="{$result.tel2|escape}"/> -
							<input type="text" class="f_tel1" name="tel3" value="{$result.tel3|escape}"/>
						</td>
					</tr>
					<tr>
						<th>FAX番号</th>
						<td class="txtinp">
							<input type="text" class="f_tel1" name="fax1" value="{$result.fax1|escape}"/> -
							<input type="text" class="f_tel1" name="fax2" value="{$result.fax2|escape}"/> -
							<input type="text" class="f_tel1" name="fax3" value="{$result.fax3|escape}"/>
						</td>
					</tr>
					<tr>
						<th>メールアドレス<span class="must"><span>必須</span></span></th>
						<td class="txtinp">
							<input type="text" class="f_mail" name="staff_email" value="{$result.staff_email}" />
						</td>
					</tr>
<!--
					<tr>
						<th>権限<span class="must"><span>必須</span></span></th>
						<td class="txtinp-radio">
							<label><input type="radio" class="staff_role_admin" name="staff_role" value="1" disabled
							{if $result.staff_role eq '1'}checked="checked" {/if}/> 管理者</label> 
							<label><input type="radio" name="staff_role" value="2"
							{if $result.staff_role eq '2'}checked="checked" {/if}/> 社員</label> 
							<label><input type="radio" name="staff_role" value="3"
							{if $result.staff_role eq '3'}checked="checked" {/if}/> バイト</label>
						</td>
					</tr>
					<tr>
						<th>ログイン</th>
						<td class="txtinp-radio">
							{html_radios name="login_flg" options=$login_flg selected=$result.login_flg }
						</td>
					</tr>
-->
				</table>
			</div>

			<div class="area1btn mgn-t20">
				<input type="button" id="on_submit" value="登録" class="btn large2"></a>
			</div>
			
			<!-- --------- 入力エリア[end] --------- -->
		</form>
	</div>
	<!-- メインコンテンツ[end] -->
</div>
<!-- コンテンツ領域[end] -->

{include file="./common/footer.tpl"}