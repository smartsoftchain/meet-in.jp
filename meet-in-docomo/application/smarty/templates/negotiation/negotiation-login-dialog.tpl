{literal}
<style type="text/css">
/*-------------------------------------
	ui-dialog用
--------------------------------------*/
.ui-dialog {
	z-index: 100000002;
}
#setting-login-dialog{
	padding:0;//内挿されているPaddingをクリア
	margin:0;
	height:auto!important;
}
.room_login_wrap{
	margin: 30px;
}
.room_login_wrap h2 {
	color: #0081CC !important;
	margin-bottom: 9px;
}
/* ログインテーブル */
.mi_login_table{
	border-collapse: separate;
	border-spacing : 0 8px;
}
.mi_login_table_title{
	text-align: left;
}
.mi_login_table th{
	font-family: Meiryo;
	font-size: 13px;
	font-weight: normal;
	font-style: normal;
	font-stretch: normal;
	padding-right:16px;
}
.mi_login_table input{
	width:212px;
	height:32px;
	border: solid 1px #d8d8d8;
	padding : 0px 0 0px 13px;

	-webkit-user-select: auto;  /* Chrome or Safari */
	-moz-user-select: text;     /* FireFox */
	-ms-user-select: text;      /* IE */
	-o-user-select: text;       /* Opera */
	user-select: text;
}
.login-dialog-buttonset button{
	width:151px;
	height:32px;
	margin-top:9px;
}
.setting-login-dialog-overlay{
	background:rgba(0, 0, 0);
}

/* エラー表示エリア */
.errmsg {
	font-size: 0.95em;
	line-height: 1.6;
	color: #df6b6d;
}

</style>

{/literal}
<!-- 新レイアウト -->
<!-- memo  -->
<!-- negotiation-dialog のCSSで背景色を白にする -->
<div id="setting-login-dialog"
class="ui-dialog ui-widget ui-widget-content ui-front ui-dialog-osx ui-dialog-buttons negotiation-dialog"
tabindex="-1" role="dialog"
aria-describedby="common_dialog_rubr1mm89blbalxo" aria-labelledby="ui-id-1" style="display:none;">
	<div class="room_login_wrap">
		<h2>meet inのアカウントにログインします</h2>
		<table class="mi_login_table">
			<tbody>
				<tr>
					<th class="mi_login_table_title">ユーザーID</th>
					<td class="mi_login_tabel_content">
						<input type="text" class="negotiation_login_input " name="id" id="login_user_id" placeholder="AA000000" /><br>
					</td>
				</tr>
				<tr>
					<th class="mi_login_table_title">パスワード</th>
					<td class="mi_login_tabel_content">
						<input type="password" class="negotiation_login_input " name="password" id="login_user_password" /><br>
					</td>
				</tr>
			</tbody>
		</table>
		<div>
			<label style="margin-left: 0;"><input type="checkbox" id="autologin" name="autologin" value="1">ログイン情報を保持する</label>
		</div>
		<div class="errmsg" id="alert_login"></div>
		<div>
			<div class="login-dialog-buttonset">
				<button type="button" id="setting-login-dialog-cancel-button"  class="mi_cancel_btn ui-button-text-only" role="button">
					<span class="ui-button-text">キャンセル</span>
				</button>
				<button type="button" id="setting-login-dialog-enter-button" class="mi_default_button ui-button-text-only" role="button">
					<span class="ui-button-text">ログイン</span>
				</button>
			</div>
		</div>
	</div>
</div>
<!--
<div id="setting-login-dialog" class="ui-dialog ui-widget ui-widget-content ui-front ui-dialog-osx ui-dialog-buttons" tabindex="-1" role="dialog" aria-describedby="common_dialog_rubr1mm89blbalxo" aria-labelledby="ui-id-1" style="display:none;">
	<div class="mi_table_main_wrap mi_table_input_right_wrap" style="max-height: calc(100vh - 420px);min-height: 118px;">
		<table class="mi_table_input_right mi_table_main mi_camera_setting_table">
			<tbody>
				<tr>
					<th class="mi_tabel_title">ユーザーID</th>
					<td class="mi_tabel_content">
						<input type="text" class="negotiation_login_input " name="id" id="login_user_id" placeholder="AA000000" /><br>
					</td>
				</tr>
				<tr>
					<th class="mi_tabel_title">パスワード</th>
					<td class="mi_tabel_content">
						<input type="password" class="negotiation_login_input " name="password" id="login_user_password" /><br>
					</td>
				</tr>
			</tbody>
		</table>
		<div class="errmsg" id="alert_login"></div>
	</div>
	<div class="ui-dialog-buttonpane ui-widget-content ui-helper-clearfix">
		<div class="ui-dialog-buttonset">
			<button type="button" id="setting-login-dialog-cancel-button"  class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only" role="button">
				<span class="ui-button-text">キャンセル</span>
			</button>
			<button type="button" id="setting-login-dialog-enter-button" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only" role="button">
				<span class="ui-button-text">ログイン</span>
			</button>
		</div>
	</div>
</div>
-->
<!-- ====================================== モーダルコンテンツ[start] ====================================== -->
<div class="modal-content" id="modal-content-login">
	<div class="mi_modal_shadow"></div>
	<div class="inner-wrap">
	</div>
</div>
<!-- ====================================== モーダルコンテンツ[end] ======================================== -->
{literal}
<script id="login-modal-template" type="text/x-handlebars-template">
<div class="list-area hgt3 mi_modal_default" style="height: calc(40% - 20px);">
	<div class="title_header">
		<h2>meet inのアカウントにログインします</h2>
	</div>
	<!-- モーダルタイトル end -->
  <div class="list-area hgt3" style="width:65%;overflow:visible;">
  	<table class="listtable">
  		<tbody>
  			<tr>
  				<th style="text-align:right;">ユーザーID</th>
  				<td>
  					<input type="text" class="negotiation_login_input " name="id" id="login_staff_id" placeholder="AA000000" /><br>
  				</td>
  			</tr>
  			<tr>
  				<th style="text-align:right;">パスワード</th>
  				<td>
  					<input type="password" class="negotiation_login_input " name="password" id="login_staff_password" /><br>
  				</td>
  			</tr>
  		</tbody>
  	</table>
  </div>
  <div class="btn_area">
  	<div class="errmsg" id="alert_login"></div>
  	<button type="button" id="login-dialog-cancel" class="mi_cancel_btn negotiation_login_button hvr-fade">キャンセル</button>
  	<button type="button" id="login-dialog-login" class="mi_default_button negotiation_login_button hvr-fade">ログイン</button>
  </div>
  <div class="mi_close_icon modal-close" style="padding: 0;">
  	<span class="icon-close" id="login-dialog-cancel"></span>
  </div>
</div>
</script>
{/literal}
