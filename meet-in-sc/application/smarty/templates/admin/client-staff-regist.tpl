{include file="./common/adminheader.tpl"}

{literal}

<style>
.f_name_{
	display: inline-block !important;
	width: 150px !important;
}
</style>

<script>
$(function (){
	$('[id=span_staff_role]').click(function(){
		$(this).prev("input").trigger("click");
	});
	
	$('[id=span_login_flg]').click(function(){
		$(this).prev("input").trigger("click");
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
				<h3>CEアカウント登録</h3>
			</div>
		</div>
		<!-- 見出し[end] -->
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

		<form action="/admin/client-staff-regist" method="post" >
			<div class="article-box mgn-t15">
				<table class="layout input-tbl">
					<tr>
						<th>クライアントID</th>
						<td>CA{$clientStaffDict.client_id|string_format:"%05d"}</td>
					</tr>
					<tr>
						<th>クライアント担当ID</th>
						<td>{if $clientStaffDict.staff_id != ''}CE{$clientStaffDict.staff_id|string_format:"%05d"}{else}新規{/if}</td>
					</tr>
					<tr>
						<th>パスワード</th>
						<td class="txtinp"><input type="password" class="f_password" name="staff_password" {if $clientStaffDict.staff_id == ''}value="{$clientStaffDict.staff_password}"{/if} /></td>
					</tr>
					<tr>
						<th>名前<span class="required">必須</span></th>
						<td class="txtinp">
							<input type="text" class="firstname f_name_" name="staff_firstname" value="{$clientStaffDict.staff_firstname}" placeholder="氏" />
							<input type="text" class="lastname f_name_" name="staff_lastname" value="{$clientStaffDict.staff_lastname}" placeholder="名" />
						</td>
					</tr>
					<tr>
						<th>フリガナ<span class="required">必須</span></th>
						<td class="txtinp">
							<input type="text" class="staff_firstnamepy f_name_" name="staff_firstnamepy" value="{$clientStaffDict.staff_firstnamepy}" />
							<input type="text" class="staff_lastnamepy f_name_" name="staff_lastnamepy" value="{$clientStaffDict.staff_lastnamepy}" />
						</td>
					</tr>
					<tr>
						<th>メールアドレス<span class="required">必須</span></th>
						<td class="txtinp"><input type="text" class="f_mail" name="staff_email" value="{$clientStaffDict.staff_email}" /></td>
					</tr>
					<tr>
						<th>権限<span class="required">必須</span></th>
						<td>
							<input type="radio" name="staff_role" value="{$smarty.const.ROLE_ADM}" {if $clientStaffDict.staff_role == $smarty.const.ROLE_ADM}checked{/if}><span id="span_staff_role">管理者</span>
							<input type="radio" name="staff_role" value="{$smarty.const.ROLE_EMP}" {if $clientStaffDict.staff_role == $smarty.const.ROLE_EMP}checked{/if}><span id="span_staff_role">一般社員</span>
							<input type="radio" name="staff_role" value="{$smarty.const.ROLE_PRT}" {if $clientStaffDict.staff_role == $smarty.const.ROLE_PRT}checked{/if}><span id="span_staff_role">アルバイト</span>
						</td>
					</tr>
					<tr>
						<th>WebPhoneID</th>
						<td class="txtinp"><input type="text" class="f_WebPhoneID" name="webphone_id" value="{$clientStaffDict.webphone_id|escape}" /></td>
					</tr>
					<tr>
						<th>WebPhonePassword</th>
						<td class="txtinp"><input type="text" class="f_WebPhonePassword" name="webphone_pass" value="{$clientStaffDict.webphone_pass|escape}" /></td>
					</tr>
					<tr>
						<th>WebPhoneIp</th>
						<td class="txtinp"><input type="text" class="f_WebPhoneIp" name="webphone_ip" value="{$clientStaffDict.webphone_ip|escape}" /></td>
					</tr>
					<tr>
						<th>支払種別<span class="must"><span>必須</span></span></th>
						<td class="slctinp">
							<div>
								{html_options name="staff_payment_type" options=$payment_type_select selected=$clientStaffDict.staff_payment_type}
							</div>
						</td>
					</tr>
					<tr>
						<th>電話単価<span class="must"><span>必須</span></span></th>
						<td class="txtinp">
							<input type="text" class="f_name_" name="telephone_hour_price" value="{$clientStaffDict.telephone_hour_price}" />
						</td>
					</tr>
					<tr>
						<th>電話1件あたり<span class="must"><span>必須</span></span></th>
						<td class="txtinp">
							<input type="text" class="f_name_" name="telephone_one_price" value="{$clientStaffDict.telephone_one_price}" />
						</td>
					</tr>
					<tr>
						<th>メールDM単価<span class="must"><span>必須</span></span></th>
						<td class="txtinp">
							<input type="text" class="f_name_" name="maildm_hour_price" value="{$clientStaffDict.maildm_hour_price}" />
						</td>
					</tr>
					<tr>
						<th>メールDM1件あたり<span class="must"><span>必須</span></span></th>
						<td class="txtinp">
							<input type="text" class="f_name_" name="maildm_one_price" value="{$clientStaffDict.maildm_one_price}" />
						</td>
					</tr>
					<tr>
						<th>お問い合わせ単価<span class="must"><span>必須</span></span></th>
						<td class="txtinp">
							<input type="text" class="f_name_" name="inquiry_hour_price" value="{$clientStaffDict.inquiry_hour_price}" />
						</td>
					</tr>
					<tr>
						<th>お問い合わせ1件あたり<span class="must"><span>必須</span></span></th>
						<td class="txtinp">
							<input type="text" class="f_name_" name="inquiry_one_price" value="{$clientStaffDict.inquiry_one_price}" />
						</td>
					</tr>
					<tr>
						<th>ログイン</th>
						<td>
							<input type="radio" name="login_flg" value="1" {if $clientStaffDict.login_flg == 1}checked{/if}><span id="span_login_flg">可能</span>
							<input type="radio" name="login_flg" value="0" {if $clientStaffDict.login_flg == 0}checked{/if}><span id="span_login_flg">不可</span>
						</td>
					</tr>
				</table>
			</div>
			
			<div class="area1btn mgn-t20">
				<input type="submit" class="btn large2" value="登録する">
			</div>
		</form>
	</div>
	<!-- メインコンテンツ[end] -->

</div>
<!-- コンテンツ領域[end] -->
{include file="./common/adminfooter.tpl"}
