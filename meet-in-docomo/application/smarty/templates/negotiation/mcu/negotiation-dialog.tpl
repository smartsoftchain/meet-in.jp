{literal}

<script>
	$(function (){
		$(document).on('click', '[id=basicBtn]', function(){
			var bFlg = document.getElementById( 'bFlg' ).value;
			if (bFlg=="1") {
				document.getElementById( 'bFlg' ).value = "0";
				$("#b1").hide();
				$("#b2").hide();
				$("#b3").hide();
				document.getElementById( 'btn1' ).className = "icon-menu-03";
			} else {
				document.getElementById( 'bFlg' ).value = "1";
				$("#b1").show();
				$("#b2").show();
				$("#b3").show();
				document.getElementById( 'btn1' ).className = "icon-menu-04";
			}
		});

		$(document).on('click', '[id=detailBtn]', function(){
			var dFlg = document.getElementById( 'dFlg' ).value;
			if (dFlg=="1") {
				document.getElementById( 'dFlg' ).value = "0";
				$("#d1").hide();
				$("#d2").hide();
				$("#d3").hide();
				$("#d4").hide();
				$("#d5").hide();
				$("#d6").hide();
				$("#d7").hide();
				$("#d8").hide();
				$("#d9").hide();
				document.getElementById( 'btn2' ).className = "icon-menu-03";
			} else {
				document.getElementById( 'dFlg' ).value = "1";
				$("#d1").show();
				$("#d2").show();
				$("#d3").show();
				$("#d4").show();
				$("#d5").show();
				$("#d6").show();
				$("#d7").show();
				$("#d8").show();
				$("#d9").show();
				document.getElementById( 'btn2' ).className = "icon-menu-04";
			}
		});

		$(document).on('click', '[id=close]', function(){
//			window.close();
			window.open('about:blank','_self').close();
		});

		// 基本情報入力エリア押下時の処理
		$(document).on('click', '#basic_info_title', function(){
			if($("#basic_info_data").css('display') == 'block') {
				// 表示時の処理
				$(this).find("span").removeClass("icon-menu-04");
				$(this).find("span").addClass("icon-menu-03");
			}else{
				// 非表示時の処理
				$(this).find("span").removeClass("icon-menu-03");
				$(this).find("span").addClass("icon-menu-04");
			}
			$("#basic_info_data").slideToggle();
		});
		// 詳細情報入力エリア押下時の処理
		$(document).on('click', '#detail_info_title', function(){
			if($("#detail_info_data").css('display') == 'block') {
				// 表示時の処理
				$(this).find("span").removeClass("icon-menu-04");
				$(this).find("span").addClass("icon-menu-03");
			}else{
				// 非表示時の処理
				$(this).find("span").removeClass("icon-menu-03");
				$(this).find("span").addClass("icon-menu-04");
			}
			$("#detail_info_data").slideToggle();
		});
		// テンプレート選択
		$(document).on('change', '#negotiation_tmpl_list', function() {
			// 選択したテンプレートの要素でリスト再構成
			var tmpl_id = $(this).val();
			$("#next_action").find('option').remove();
			$("#possibility").find('option').remove();
			if(tmpl_id != '') {
				$.each(negotiationResultTmpl, function(i,e) {
					if(e.template_id == tmpl_id) {
						var next_action_list = JSON.parse(e.next_action_list);
						$.each(next_action_list, function(i2,e2) {
							$("#next_action").append($('<option></option>').val(i2).text(e2));
						});
						var result_list = JSON.parse(e.result_list);
						$.each(result_list, function(i2,e2) {
							$("#possibility").append($('<option></option>').val(i2).text(e2));
						});
					}
				});
			}
		});
	});

</script>

<style type="text/css">
<!--

.icon-delete {
  *zoom: expression(this.runtimeStyle['zoom'] = '1', this.innerHTML = '&#xe915;');
}

/*-------------------------------------
	（モーダル）基本型
--------------------------------------*/
.modal-content {
  display: none;
  position: fixed;
  height: 100%;
  width: 100%;
  top: 0%;
  left: 0%;
	z-index: 100000003;
}


.modal-content .list-area,
.modal-content .edit-area {
	width: 100%;
	max-width: 1180px;
	overflow: auto;
}

/* モーダル */
.modal-content .inner-wrap h5 {
    padding: 5px 0 10px 0;
    font-size: 1.3em;
    font-weight: bold;
    color: #215b82;
}

.f_name_{
	display: inline-block !important;
	width: 150px !important;
	padding: 0 10px;
}
.text_short{
	width:60px !important;
	display: inline-block !important;
	padding: 0 10px;
}
.text_medium{
	width:200px !important;
	display: inline-block !important;
	padding: 0 10px;
}
.text_long{
	width:443px !important;
	display: inline-block !important;
	padding: 0 10px;
}

.text_long2{
	width:200px !important;
	padding: 0 10px;
}

.f_mail{
	width:295px !important;
	padding: 0 10px;
}

/*-----------------------
	モーダル領域
------------------------*/


.modal-overlay {
	display: none;
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
    background-color: rgba(0,0,0,0.4);
	z-index: 500;
}

.modal-open {
	color: #1b75b1;
	text-decoration: underline;
}

.modal-open:hover {
	color: #df6b6e;
	text-decoration: underline;
}

.modal-close {
	position: absolute;
	top: -12px;
	right: -12px;
	display: block;
	width: 40px;
	height: 40px;
}

.modal-close span {
	display: inline-block;
	width: 100%;
	height: 100%;
	text-indent: -9999px;
	background: #b6c3cc url("../img/btn_close.png") no-repeat center center;
}

.modal-close:hover {
	cursor:pointer;
}

.modal-close:hover span {
	background: #0f507a url("../img/btn_close.png") no-repeat center center;
}

.article-box {
	display: block;
	padding: 20px 20px 20px 20px;
	height: auto;
	background: #f1f7fa;
}

span.font1 {
	font-size: 32px;
	font-weight: bold;
}

span.font2 {
	font-size: 14px;
	font-weight: bold;
}

.listtable {
	width: 80%;
	table-layout: fixed;
}

.listtable tr {
	margin: 5px;
	padding: 5px;
	width: 100%;
}

.title_header{
	margin-top: 40px;
	text-align: center;
	position: relative;
}

.title_header_icon{
	float: left;
	margin-left : 70px;
	font-size: 48px;
	margin-top: -5px;
	color:#c8c9ca;
}
.title_header_message{
	float: left;
	text-align: left;
	font-size : 24px;
	margin-left : 20px;
	font-weight: bold;
	color:#929292;
}

.title_header .negotiation_regist_close_btn {
	font-size: 11px;
	color: #a7a7a7;
	background-color: rgba(0,0,0,0);
	width: 47px;
	height: 40px;
	border: none;
	position: absolute;
	top: -20px;
	right: 10px;
}

.clear_both{
	clear: both;
}

.info_area{
	margin-top: 30px;
}

.info_title{
	background-color: #0081CC;
	color: white;
	font-size : 20px;
	text-align: left;
	padding: 15px 40px;
	line-height: 1;
	font-weight: bold;
	cursor: pointer;
}

.info_title span{
	float: right;
}

.info_data{
	text-align: left;
	margin-top : 20px;
	font-size : 15px;
}

.info_data th{
	padding : 10px;
	width : 170px;
	vertical-align: middle;
}

.info_data td{
	padding : 5px;
}

.btn_regist_area{
	margin-top : 50px;
	margin-bottom : 20px;
}

.btn_link_middle{
	display: block;
	width: 240px;
	height: 45px;
	display: table-cell;
	text-align: center;
	vertical-align: middle;
	background-color: #0081CC;
	color: white;
	font-size: 18px;
	font-weight: bold;
}

.guest_end_message_area{
	font-size: 24px;
	font-weight: bold;
	text-align: center;
	margin-top : 180px;
}

.guest_end_message{
	padding : 7px;
}

.font_bold{
	font-weight: bold;
}


#modal-content .inner-wrap .list-area.hgt3.mi_modal_default{
	max-height: calc(100% - 150px);
	height: calc(100% - 150px);
	max-width: 720px;
	min-height: 500px;
}

#modal-content .mi_table_main,
#modal-content .mi_table_input_right_wrap {
	max-height: 100%;
	width: 100%;
}
#modal-content .mi_table_input_right textarea.mi_default_input.input_hidden:focus,
#modal-content .mi_table_input_right textarea.mi_default_input {
    padding: 11px 30px;
    height: 130px;
    width: calc(100% - 60px);
    border: 1px solid #e1e1e1;

    -webkit-user-select: auto;  /* Chrome or Safari */
    -moz-user-select: text;     /* FireFox */
    -ms-user-select: text;      /* IE */
    -o-user-select: text;       /* Opera */
    user-select: text;
}
#modal-content .mi_table_input_right input.mi_default_input {
    -webkit-user-select: auto;  /* Chrome or Safari */
    -moz-user-select: text;     /* FireFox */
    -ms-user-select: text;      /* IE */
    -o-user-select: text;       /* Opera */
    user-select: text;

}

#modal-content .mi_default_button {
	margin: 35px 0 20px;
}

#download_url {
	white-space: pre-wrap;
}


#download_url_body {
	width: calc(100% - 60px);
	color: #1a73e8;
}

.alert_message {
	display: none;
	font-size: 10px;
	color: red;
}

#negotiation_tmpl_list {
	max-width: 300px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	-o-text-overflow: ellipsis;
}

#possibility {
	max-width: 300px;
}

#next_action {
	max-width: 300px;
}

#IE_modal {
	width: 675px;
}

/* 動画アップロード中モーダル */
#loading-upload-modal-template {
	justify-content: center;
	align-items: center;
}

#loading-upload-modal-template .modal-body {
	width: 30%;
	height: 50%;
	display: grid;
	grid-template-rows: 1fr 1.5fr;
	background-color: #fff;
	padding: 0 60px;
	margin: 0 auto;
	z-index: 10;
	border-radius: 6px;
}

#loading-upload-modal-template .loadin-wrap {
	display: flex;
	justify-content: center;
	align-items: center;
}

#loading-upload-modal-template .text-wrap {
	line-height: 1.3;
	font-size: 14px;
}

#loading-upload-modal-template .title {
	font-size: 20px;
	padding-bottom: 25px;
}

#loading-upload-modal-template .text-wrap p {
	padding-bottom: 15px;
}

-->
</style>

{/literal}

<!-- ====================================== モーダルコンテンツ[start] ====================================== -->
<div class="modal-content" id="modal-content">
	<div class="mi_modal_shadow"></div>
	<div class="inner-wrap">
	</div>
</div>
<!-- ====================================== モーダルコンテンツ[end] ======================================== -->
{literal}

<!-- ====================================== 推奨ブラウザモーダルコンテンツ[start] ======================================== -->
<div class="modal-content" id="modal-content-requirements_browser">
	<div class="mi_modal_shadow"></div>
	<div class="inner-wrap">
	<div class="mi_modal_default" id="IE_modal">
	<div class="mi_gest_close_mesg mi_modal_type_m" style="background-color: white;padding: 35px; font-size:14px">
		<h2 style="text-align: center;  margin-bottom: 20px;">Internet Exploreは推奨ブラウザではございません。</h2>
		<p>
		【お知らせ】<br>
		meet inでは2020年12月31日をもって、Flash Playerのサポートが終了致します。<br>
		それに伴い、2021年1月1日以降はInternet Explorerを非対応ブラウザとさせて頂きますので、<br>
		以後、GoogleChromeのブラウザでmeet inをご利用の程頂ければと存じます。<br>
		恐れ入りますが、ご理解ご了承の程、何卒宜しくお願い申し上げます。
		</p>
		<div style="display: flex;  width: 465px;  justify-content: space-between; margin: 32px auto 0;">
		<div class="btn_a">
			<button type="button" id="btn_requirements_browser_a" class="hvr-fade" style="
		margin-top: 0; width: 200px;">そのまま続ける</button>
		</div>
		<div class="btn_a">
			<button type="button" id="btn_requirements_browser_b" class="hvr-fade" style="width: 200px;">chromeをインストール</button>
		</div>
	</div>
	</div>
	</div>
	</div>
</div>
<!-- ====================================== 推奨ブラウザモーダルコンテンツ[end] ======================================== -->

<!-- ====================================== 動画アップロード中モーダルコンテンツ[start] ======================================== -->
<div id="loading-upload-modal-template" class="modal-content"  type="text/x-handlebars-template">
	<div class="mi_modal_shadow"></div>
	<div class="modal-body">
		<div class="loadin-wrap">
			<img src="/img/e_contract_loading.gif">
		</div>
		<div>
			<h2 class="title">現在動画ファイルをアップロード中です</h2>
			<div class="text-wrap">
				<p>
					完了前にタブを閉じてしまうと、動画をダウンロードできなくなってしまいますのでご注意ください。
				</p>
				<p>
					また、アップロード完了後に「ゲストとの対話を記録するモーダル」の情報を保存することで、<br>
					後からダウンロード用URLをご参照いただけますので、保存していただきますようお願いいたします。
				</p>
			</div>
		</div>
	</div>
</div>
<!-- ====================================== 動画アップロード中モーダルコンテンツ[end] ======================================== -->


<script id="noti-modal-template" type="text/x-handlebars-template">
	<div class="list-area hgt3 mi_modal_default" style="height: calc(100% - 20px);">
		<form action="/negotiation/negotiation-regist" method="post" id="client_form" >
			<div align="center">
				<div class="title_header">
					<div class="title_header_icon">
						<span class="icon-coffe"></span>
					</div>
					<div class="title_header_message">
						<span>お疲れ様です。<br>ゲストとの対話を記録しましょう。</span>
					</div>
					<button type="submit" name="submit_button" class="negotiation_regist_close_btn">
						<span class="icon-close"></span>
						<div>閉じる</div>
					</button>
					<div class="clear_both"></div>
				</div>
				<div class="info_area_wrap">
					<div class="info_area">
						<div id="basic_info_title" class="info_title">基本情報入力<span class="icon-menu-04" id="btn1"></span></div>
						<div id="basic_info_data" class="info_data">
							<div class="mi_table_main_wrap mi_table_input_right_wrap">
				        <table class="mi_table_input_right mi_table_main">
									<tbody>
										<tr>
											<td class="mi_tabel_title">
												●録画ダウンロードURL<br>
											</td>
											<td id="download_url" class="mi_tabel_content">
												<span class="alert_message">※画面右上の「閉じる」アイコンまたは画面下部の「登録する」ボタンを押下しない場合は、ダウンロードできませんのでご注意ください。</span>
												<a href="" id="download_url_body" target="_blank" rel="noopener noreferrer"></a>
												<input id="download_url_input" name="download_url" type="hidden" value="">
											</td>
										</tr>
										<tr>
											<td class="mi_tabel_title">●商談結果テンプレート</td>
											<td class="mi_tabel_content">
												<select id="negotiation_tmpl_list" name="negotiation_tmpl_list" class="mi_default_input">
													<option value="">選択してください</option>
												{{#each tmplList}}
													<option value="{{template_id}}">{{template_name}}</option>
												{{/each}}
												</select>
											</td>
										</tr>
										<tr>
											<td class="mi_tabel_title">●次回アクション</td>
											<td class="mi_tabel_content">
												<select name="next_action" id="next_action" class="mi_default_input">
													<option value=""></option>
												</select>
											</td>
										</tr>
										<tr>
											<td class="mi_tabel_title">●商談見込み</td>
											<td class="mi_tabel_content">
												<select name="possibility" id="possibility" class="mi_default_input">
													<option value=""></option>
												</select>
											</td>
										</tr>
										<tr>
											<td class="mi_tabel_title">●共有メモ</td>
											<td class="mi_tabel_content">
												<textarea name="sharing_memo" rows="3" cols="35" class="mi_default_input" ></textarea>
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
					</div>
					<div class="info_area">
						<div id="detail_info_title" class="info_title">詳細情報入力<span class="icon-menu-04" id="btn1"></span></div>
						<div id="detail_info_data" class="info_data">
							<div class="mi_table_main_wrap mi_table_input_right_wrap">
				        <table class="mi_table_input_right mi_table_main">
									<tbody>
										<tr>
											<td class="mi_tabel_title">●メモ</td>
											<td class="mi_tabel_content">
												<textarea name="memo" rows="3" cols="35" class="mi_default_input" ></textarea>
											</td>
										</tr>
										<tr>
											<td class="mi_tabel_title">●シークレットコメント</td>
											<td class="mi_tabel_content">
												<textarea name="secret_comment" rows="3" cols="35" class="mi_default_input" ></textarea>
											</td>
										</tr>
										<tr>
											<td class="mi_tabel_title">●会社名</td>
											<td class="mi_tabel_content">
												<input type="text" class="text_long2 mi_default_input" name="company_name" />
											</td>
										</tr>
										<tr>
											<td class="mi_tabel_title">●先方担当者名</td>
											<td class="mi_tabel_content">
												<input type="text" class="text_long2 mi_default_input" name="staff_name" />
											</td>
										</tr>
										<tr>
											<td class="mi_tabel_title">●部署名</td>
											<td class="mi_tabel_content">
												<input type="text" class="text_long2 mi_default_input" name="client_service_id" />
											</td>
										</tr>
										<tr>
											<td class="mi_tabel_title">●担当者・役職</td>
											<td class="mi_tabel_content">
												<input type="text" class="text_long2 mi_default_input" name="executive" />
											</td>
										</tr>
										<tr>
											<td class="mi_tabel_title">●電話番号</td>
											<td class="mi_tabel_content">
												<input type="text" class="text_short mi_default_input" name="tel1" />&nbsp;-&nbsp;
												<input type="text" class="text_short mi_default_input" name="tel2" />&nbsp;-&nbsp;
												<input type="text" class="text_short mi_default_input" name="tel3" />
											</td>
										</tr>
										<tr>
											<td class="mi_tabel_title">●FAX番号</td>
											<td class="mi_tabel_content">
												<input type="text" class="text_short mi_default_input" name="fax1"  />&nbsp;-&nbsp;
												<input type="text" class="text_short mi_default_input" name="fax2"  />&nbsp;-&nbsp;
												<input type="text" class="text_short mi_default_input" name="fax3"  />
											</td>
										</tr>
										<tr>
											<td class="mi_tabel_title">●メールアドレス</td>
											<td class="mi_tabel_content">
												<input type="text" class="text_long2 mi_default_input" name="email" />
											</td>
										</tr>

									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			</div>
			<input type="hidden" name="debug" id="debug" value="debug_value" />
			<input type="hidden" name="connectioninfoidtemp" id="connectioninfoidtemp" value=""/>
			<input type="hidden" name="bFlg" id="bFlg" value="1" />
			<input type="hidden" name="dFlg" id="dFlg" value="0" />
			<input type="hidden" name="staff_type" id="nego_rslt_staff_type" value="" />
			<input type="hidden" name="staff_id"   id="nego_rslt_staff_id"   value="" />
			<input type="hidden" name="client_id"  id="nego_rslt_client_id"  value="" />
			<input type="hidden" name="del_flg"   value="0" />
			<input type="hidden" name="user_id" id="nego_rslt_user_id"  value="" />
			<input type="hidden" name="stime" id="nego_stime" value="" />
			<input type="hidden" name="room_member" id="nego_room_member" />

			<div class="btn_" align="center">
				<button type="submit" name="submit_button" class="mi_default_button mi_btn_m hvr-fade">登録する</button>
			</div>
		</form>
	</div>
</script>
{/literal}

<!-- ====================================== モーダルコンテンツ[end] ======================================== -->
<script id="guest-end-modal-template" type="text/x-handlebars-template">
	<div class="mi_modal_default">
    <div class="mi_gest_close_mesg mi_modal_type_m" style="background-color: white;">
      <p>
        本日はお忙しいところ<br>
        誠にありがとうございました。<br>
        閉じるをクリックして終了してください。
      </p>
			<div class="btn_a" align="center">
				<button type="button" name="btn_guest_end" class="mi_default_button mi_gest_close_buton hvr-fade">閉じる</button>
			</div>
		</div>
	</div>
</script>
{literal}
<!-- ====================================== 資料選択モーダルコンテンツ[start] ====================================== -->
<script id="material-select-modal-template" type="text/x-handlebars-template">
	<div class="list-area hgt3 mi_modal_default material_modal_area" style="height: calc(100% - 20px);">
		<div class="modal_material_header">
			<span class="icon-puls"></span>　使用する資料を選択して下さい
		</div>
		<div class="modal_material_list_area">
			{{#each materialBasicList}}
				<div class="modal_material" id="{{material_id}}">
					<div class="modal_material_icon">
						{{#if material_type}}
							{{#if type_1}}
								<span class="icon-url"></span>
							{{/if}}
							{{#if type_2}}
								<img src="/img/icon_capture-02.png">
							{{/if}}
							{{#if type_3}}
								<img src="/img/icon_capture-02.png">
							{{/if}}
						{{else}}
							{{#if download_flg}}
								<img src="/img/sp/svg/icon-documents-download.svg">
							{{else}}
								<span class="icon-document-01"></span>
							{{/if}}
						{{/if}}
					</div>
					<div class="modal_material_info">
						{{#if material_type}}
							{{#if type_1}}
								URL：{{material_name}}<br>
							{{/if}}
							{{#if type_2}}
								画像：{{material_name}}<br>
							{{/if}}
							{{#if type_3}}
								画像：{{material_name}}<br>
							{{/if}}
						{{else}}
							資料：{{material_name}}<br>
						{{/if}}
						更新日：{{update_date}}
					</div>
					<div class="clear_both"></div>
				</div>
			{{/each}}

		</div>
		<div class="btn_area" align="center">
			<button type="button" name="material_cancel" class="mi_default_button mi_cancel_btn mi_btn_m hvr-fade">キャンセル</button>
			<button type="button" name="material_select" class="mi_default_button mi_btn_m hvr-fade">ファイル選択</button>
		</div>
	</div>
</script>
<!-- ====================================== 資料選択モーダルコンテンツ[end] ======================================== -->
{/literal}
