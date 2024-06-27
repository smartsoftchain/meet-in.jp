{include file="./common/adminheader.tpl"}

{literal}

<style>
.f_name_{
	display: inline-block !important;
	width: 150px !important;
}

.txtinp img.ui-datepicker-trigger {
    vertical-align: middle;
    margin-left: 10px;
}
</style>

<script>
$(function (){
	// カレンダーを使用する為の初期化
	_U.setCalendar();

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
				<h3>在宅アカウント登録</h3>
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
		<form action="/admin/home-staff-regist" method="post" >
			<div class="article-box mgn-t15">
				<table class="layout input-tbl">
					<tr>
						<th>アカウントID</th>
						<td>{if $homeStaffDict.staff_id != ''}TA{$homeStaffDict.staff_id|string_format:"%05d"|escape}{else}新規{/if}</td>
					</tr>
					<tr>
						<th>パスワード</th>
						<td class="txtinp">
							<input type="password" class="f_password" name="staff_password" {if $homeStaffDict.staff_id == ''}value="{$homeStaffDict.staff_password|escape}"{/if}/>
							<p style="padding:8px;"><span class="note">※パスワードを変更する場合は入力してください<br />※８文字半角英数字</span></p>
						</td>
					</tr>
					<tr>
						<th>氏名<span class="required">必須</span></th>
						<td class="txtinp">
							<input type="text" class="f_name_" name="staff_firstname" value="{$homeStaffDict.staff_firstname|escape}" placeholder="氏" />
							<input type="text" class="f_name_" name="staff_lastname" value="{$homeStaffDict.staff_lastname|escape}" placeholder="名" />
						</td>
					</tr>
					<tr>
						<th>フリガナ<span class="required">必須</span></th>
						<td class="txtinp">
							<input type="text" class="f_name_" name="staff_firstnamepy" value="{$homeStaffDict.staff_firstnamepy|escape}" placeholder="シ"/>
							<input type="text" class="f_name_" name="staff_lastnamepy" value="{$homeStaffDict.staff_lastnamepy|escape}" placeholder="メイ"/>
						</td>
					</tr>
					<tr>
						<th>メールアドレス<span class="required">必須</span></th>
						<td class="txtinp"><input type="text" class="f_mail" name="staff_email" value="{$homeStaffDict.staff_email|escape}" /></td>
					</tr>
					<tr>
						<th>契約開始日</th>
						<td class="txtinp"><input type="text" class="datepicker f_name_" name="telework_start_date" value="{$homeStaffDict.telework_start_date|escape}" /></td>
					</tr>
					<tr>
						<th>契約終了日</th>
						<td class="txtinp"><input type="text" class="datepicker f_name_" name="telework_end_date" value="{$homeStaffDict.telework_end_date|escape}" /></td>
					</tr>
					<tr>
						<th>WebPhoneID</th>
						<td class="txtinp"><input type="text" class="f_WebPhoneID" name="webphone_id" value="{$homeStaffDict.webphone_id|escape}"/></td>
					</tr>
					<tr>
						<th>WebPhonePassword</th>
						<td class="txtinp"><input type="text" class="f_WebPhonePassword" name="webphone_pass" value="{$homeStaffDict.webphone_pass|escape}"/></td>
					</tr>
					<tr>
						<th>WebPhoneIp</th>
						<td class="txtinp"><input type="text" class="f_WebPhoneIp" name="webphone_ip" value="{$homeStaffDict.webphone_ip|escape}" /></td>
					</tr>
					<tr>
						<th>支払種別<span class="must"><span>必須</span></span></th>
						<td class="slctinp">
							<div>
								{html_options name="staff_payment_type" options=$payment_type_select selected=$homeStaffDict.staff_payment_type}
							</div>
						</td>
					</tr>
					<tr>
						<th>電話単価<span class="must"><span>必須</span></span></th>
						<td class="txtinp">
							<input type="text" class="f_name_" name="telephone_hour_price" value="{$homeStaffDict.telephone_hour_price}" />
						</td>
					</tr>
					<tr>
						<th>電話1件あたり<span class="must"><span>必須</span></span></th>
						<td class="txtinp">
							<input type="text" class="f_name_" name="telephone_one_price" value="{$homeStaffDict.telephone_one_price}" />
						</td>
					</tr>
					<tr>
						<th>メールDM単価<span class="must"><span>必須</span></span></th>
						<td class="txtinp">
							<input type="text" class="f_name_" name="maildm_hour_price" value="{$homeStaffDict.maildm_hour_price}" />
						</td>
					</tr>
					<tr>
						<th>メールDM1件あたり<span class="must"><span>必須</span></span></th>
						<td class="txtinp">
							<input type="text" class="f_name_" name="maildm_one_price" value="{$homeStaffDict.maildm_one_price}" />
						</td>
					</tr>
					<tr>
						<th>お問い合わせ単価<span class="must"><span>必須</span></span></th>
						<td class="txtinp">
							<input type="text" class="f_name_" name="inquiry_hour_price" value="{$homeStaffDict.inquiry_hour_price}" />
						</td>
					</tr>
					<tr>
						<th>お問い合わせ1件あたり<span class="must"><span>必須</span></span></th>
						<td class="txtinp">
							<input type="text" class="f_name_" name="inquiry_one_price" value="{$homeStaffDict.inquiry_one_price}" />
						</td>
					</tr>
					<tr>
						<th>ログイン</th>
						<td>
							<input type="radio" name="login_flg" value="1" {if $homeStaffDict.login_flg == 1}checked{/if}><span id="span_login_flg">可能</span>
							<input type="radio" name="login_flg" value="0" {if $homeStaffDict.login_flg == 0}checked{/if}><span id="span_login_flg">不可</span>
						</td>
					</tr>
					<tr>
						<th>備考</th>
						<td class="txtinp"><textarea class="f_bikoarea" name="staff_comment">{$homeStaffDict.staff_comment|escape}</textarea></td>
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
