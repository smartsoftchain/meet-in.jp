{include file="./common/header.tpl"}
<!-- ====================================== モーダルコンテンツ[start] ====================================== -->
<div class="modal-content model_call_operator_wrap" id="modal-content"> <!-- id="db-log2"	-->
	<div class="mi_modal_shadow"></div>
	<div class="inner-wrap mi_modal_default">
	</div>
</div>
<!-- ====================================== モーダルコンテンツ[end] ======================================== -->



{literal}

<script>
	var isJSON = function(arg) {
		arg = (typeof arg === "function") ? arg() : arg;
		if(typeof arg !== "string") {
			return false;
		}
		try {
			arg = (!JSON) ? eval("(" + arg + ")") : JSON.parse(arg);
			return true;
		} catch(e) {
			return false;
		}
	};
	$(function (){

		// ブラウザバック時
		if (window.performance.navigation.type == 2) {
			location.reload();
		}

		var checkAAStaffList = jQuery.parseJSON('{/literal}{$checkAAStaffListJson}{literal}');
		// アイドマ担当者ボタンのイベント
		$(".detail_open").click(function(){
			$("#modal-content").show();
			// モーダル内のタグを削除する
			$("div.inner-wrap").empty();
			// スタッフリスト取得
			$.ajax({
				url: "/admin/get-client-staff-list",
				type: "POST",
				dataType: "text",
				data: {
					"staff_type" : $('input[id=staff_type]').val(),
					"staff_id"   : $('input[id=staff_id]').val(),
				},
			}).done(function(res) {
				if(isJSON(res)) {
					staffList = jQuery.parseJSON(res);
					// テンプレート生成
					var template = Handlebars.compile($('#aa-staff-modal-template').html());
					$('div.inner-wrap').append(template({
						"aaStaffList": staffList
					}));
					// チェックを付ける
					for (var i = 0; i < checkAAStaffList.length; i++) {
						staffId = checkAAStaffList[i];
						$("#aa_staff_id_"+staffId).prop("checked",true);
					}
				} else {
					$("#modal-content").hide();
					return false;
				}
			}).fail(function(res) {
				$("#modal-content").hide();
				return false;
			});
			// モーダルを表示する為のクリックイベントを発生させる
			$('.modal-open').trigger("click");
		});

		// アイドマ担当者選択モーダル内の検索の実行
		$(document).on('click', '[id=on_free_word]', function(){
			var name = $("#free_word").val();

			if(name == ""){
				name = "";
				$("tr.idsselect").attr("style", "");
			}else{
			var reg = new RegExp(name);
			$("tr.idsselect").css("display", "none");
			$("td#name").each(function (i) {
				i = i+1;
				if($(this).text().match(reg)){
					$(this).parent("tr").toggle();
				}
			});
			}
		});
		// アイドマ担当者選択モーダル内の検索欄のクリア
		$(document).on('click', '.search_close_button', function(){
			$("#free_word").val("");
			$("tr.idsselect").attr("style", "");
		});

		// アイドマ担当者モーダルの選択するボタン押下時のイベント
		$(document).on('click', '[id=decision]', function(){
			$('#retrieval_value').focus();
			var checked = $("[name='aa_staff_id[]']:checked");
			var checkedStr = "";
			var userName = "";

			ids = [];
			$.each(checked, function(idx, row){
				if(idx == 0){
					userName = $("#aa_staff_name_"+row.value).val();
				}else if(idx == 1){
					userName = userName+" 他 ";
				}
				ids.push(row.value);
			});
			// 次回表示時に使用する為グローバル変数へ設定する
			checkAAStaffList = ids;
			// 画面に値を設定する
			$("*[name=aa_staff_id_list]").val(ids.join(","));
			// アイドマ担当者欄に名前を設定する
			$("span#aa_staff_name").empty();
			$("span#aa_staff_name").append(userName);
			// モーダルを閉じる
//			$('.modal-close').trigger("click");
			$("#modal-content").hide();
		});

		$(".modal-content").on('click','.modal-close',function(){
			$("#modal-content").hide();
		});

		$("[name=submit_button]").click(function(){
			$("#client_form").submit();
		});


	    $('input[name="client_type"]:radio').change(function()
	    {
			switch($(this).val())
			{
				case "1":
					if(!confirm('入力内容が削除されます。よろしいですか?')) {
						$('#client_type_2').prop('checked', true);
						return;
					}
					$("#purchasing_client_account_cnt").val("");
					$("#distributor_salesstaff_name").val("");
					$("#distributor_salesstaff_email").val("");
					$("#distributor_salesstaff_ccemail").val("");

					$("#client_type_user").show();
					$("#client_type_distributor").hide();
					break;

				case "2":
					if(!confirm('「購入経路」の入力内容が削除されます。よろしいですか?')) {
						$('#client_type_1').prop('checked', true);
						return;
					}
					$("#distribution_channel_client_name").val("");
					$("#distribution_channel_client_id").val("");

					$("#client_type_distributor").show();
					$("#client_type_user").hide();
					break;
			}
	    });

	    $('input[name="distribution_channel_client_name"]').on('change', function () {
			let client_id = $("#distributor_list option[value='" + $(this).val() + "']").data('hidden-value');
			$('#distribution_channel_client_id').val(client_id);
	    });

		// 二要素認証のON/OFF表示
		function checkAuthenticationState() {

			let isChecked = $('[name=check_auth]').prop('checked');
			let isOn = '#FFA000';
			let isOff = '#B1B1B1';
			let color = isChecked ? isOn : isOff;
			let value = isChecked ? 1 : 0;
			$(".switchArea label").css('background-color', color);
			$('[name=two_factor_authenticate_flg]').val(value);
		}

		// 初期読み込み時
		checkAuthenticationState();

		$('[name=check_auth]').change(function() {
			checkAuthenticationState();
		});

	});
</script>


<style type="text/css">

<!--

.icon-delete {
  *zoom: expression(this.runtimeStyle['zoom'] = '1', this.innerHTML = '&#xe915;');
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

.mi_table_main2 {
  margin: 0 auto;
  height: auto;
  width: 960px;
  border: 2px ridge;
}

.mi_table_main_wrap2 {
  width: 960px;
  max-width: 960px;
}

.mi_table_main2 tr {
  border: 2px ridge;
}

.mi_table_main2 th {
  height: 40px;
  color: #fff;
  background-color: #ffaa00;
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
.mgl_10{
	margin-left: 10px;
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
	z-index: 501;
}

.modal-content .inner-wrap {
	line-height: 1.2;
	position: absolute;
	z-index: 503;
	height: 70%;
  width: 30%;
	background: #fff;
	padding: 20px 30px;
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
	height: 100%;
	padding: 0 10px;
}
.text_short{
	width:60px !important;
	height: 100%;
	padding: 0 10px;
	display: inline-block !important;
}
.text_medium{
	width: 42% !important;
	height: 100%;
	display: inline-block !important;
	padding: 0 10px;
}
.text_long{
	width:95% !important;
	height: 100%;
	padding: 0 10px;
	display: inline-block !important;
}

.text_long2{
	width: calc(100% - 255px);
	height: 100%;
	padding: 0 10px;
	display: inline-block !important;
}

.f_mail{width:295px !important;}

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


/* エラーメッセージ */
.errmsg {
	font-size: 0.95em;
	line-height: 1.6;
	color: #df6b6d;
	padding-bottom: 15px;
}

.modal-content .list-area.hgt3,
.modal-content .edit-area.hgt3 {
	margin-top: 2px;
	height: 80%;
	height: calc(100% - 145px);
}

.mi_table_main td {
	text-align: left;
}
/*-----------------------
	table装飾
------------------------*/
.listtable {
	min-width: 100%;	/* ■ */
	border-spacing: 0;
	border-collapse: collapse;
	border-width: 1px 0 0 1px;
	border-style: solid;
	border-color: #e5e5e5;
	background: #fff;
}

.listtable tr:nth-child(odd) td {
	background-color: #f6f6f6;
}

.listtable tr:hover td {
	background: #f9e8ca;
}

.listtable tr.nobg td,
.listtable tr.nobg:hover td {
	background: none;
}

.listtable th,
.listtable td {
	border-width: 0 1px 1px 0;
	border-style: solid;
	border-color: #d5d8dc;
	color: #333333;
	line-height: 1.3;
	vertical-align: middle;
	white-space: nowrap;
}
.listtable th {
	padding: 16px 11px 13px 11px;
	background: #cfe8f3;
	font-weight: bold;
}
.listtable td {
	padding: 13px 11px 11px 11px;
	font-size: 0.9em;
	font-weight: normal;
	line-height: 1.6;
}

.listtable.narrow th {
	padding: 12px 11px 9px 11px;
}
.listtable.narrow td {
	padding: 10px 11px 8px 11px;
}

.modal-content .list-area .listtable th {
	padding: 6px 10px 3px 10px;
	font-size: 1em;
	line-height: 1.2;
	text-align: center;
}

.modal-content .list-area .listtable td {
	padding: 11px 10px 8px 10px;
	font-size: 0.9em;
	line-height: 1.2;
}

.modal_search_area{
	text-align:left;
	margin-top: 10px;
	margin-bottom: 20px;
}

.srch-s { width: 65px; line-height: 30px; }
.flt-r { float: right; }

.large2 {
	width: 240px;
	line-height: 47px;
	font-size: 17px;
	font-weight: bold;
}

.client_regist .mi_tabel_title{
    width: 225px;
}

input[type="date"] {
  color: #333;
  width: 374px;
  height: 40px;
  position: relative;
  border: 1px solid #B1B1B1;
  border-radius: 4px;
  padding: 0 10px;
}

input[type="date"]::-webkit-inner-spin-button{
  -webkit-appearance: none;
}

input[type="date"]::-webkit-clear-button{
  -webkit-appearance: none;
}

input[type=date]::-webkit-calendar-picker-indicator {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
}

.mi_table_main_wrap {
	max-height: none;
	min-height: auto;
	margin-bottom: 50px;
}

h3:before {
  content: "";
  width: 12px;
  height: 12px;
  background-color: #ffaa00;
  display: inline-block;
  margin-right: 3px;
}

.mi_table_main_wrap .client_type_area {
	padding: 20px 20px;
}

.client_type_area dt {
	padding: 15px 0px 0;
}

.client_type_area input {
	height: 35px;
}

td.mi_tabel_content.td_redirect {
	height: auto;
}

td.mi_tabel_content.td_redirect input {
	height: 42px;
}

td.mi_tabel_content.td_redirect span {
	display: block;
	font-size: 11px;
	margin: 5px 0 0;
}

-->
</style>

{/literal}


<!-- メインコンテンツ start -->
<div id="mi_main_contents">
	<!-- トップナビ start -->
	<div id="mi_top_nav" class="acount_manage_on">
		<ul>
			{if $user.staff_type=="AA"}
			<li class="">
				<a href="/admin/staff-list?staff_type=AA" class="hvr-underline-from-center">
					<span class="icon-parsonal mi_default_label_icon"></span>
					<div class="">AAアカウント管理</div>
				</a>

			</li>
			<li class="mi_select">
				<a href="/admin/client-list" class="hvr-underline-from-center">
					<span class="icon-company mi_default_label_icon"></span>
					<div class="">クライアント管理</div>
				</a>
			</li>
			<li class="">
				<a href="/admin/distributor-list" class="hvr-underline-from-center">
					<span class="icon-company mi_default_label_icon"></span>
					<div class="">販売店管理</div>
				</a>
			</li>
			{/if}
		</ul>

		<!-- パンくずリスト start -->
		<div class="mi_breadcrumb_list">
		<a href="/index/menu">TOP</a>&nbsp;&gt;&nbsp;
		{if $user.staff_type=="AA"}
		<a href="/admin/staff-list?staff_type=AA">AAアカウント管理</a>&nbsp;&gt;&nbsp;
		<a href="/admin/client-list">クライアント／企業アカウント一覧</a>&nbsp;&gt;&nbsp;
		<a href="/admin/client-regist?client_id={$clientDict.client_id}">クライアント／企業アカウント新規発行・登録</a></div>
		{/if}
		<!-- パンくずリスト end -->

	</div>
	<!-- トップナビ end -->

	<!-- コンテンツエリア start -->
	<div id="mi_content_area">

		<!-- コンテンツタイトル start -->
		<div class="mi_content_title">
			<span class="icon-company mi_content_title_icon"></span>
			<h1>
				クライアント／企業アカウント新規発行・登録
			</h1>
		</div>
		<!-- コンテンツタイトル end -->

		<!-- エラーメッセージ表示エリア begin -->
		{if $errorList|@count gt 0}
		<p class="errmsg mb10">
			下記にエラーがあります。<br />
			<strong>
				{foreach from=$errorList item=err}
					{foreach from=$err item=e}
						{$e}<br>
					{/foreach}
				{/foreach}
			</strong>
		</p>
		{/if}
		<!-- エラーメッセージ表示エリア end -->

		<form action="/admin/client-regist" method="post" id="client_form" enctype="multipart/form-data">
			<!-- テーブル start -->
			<h3>クライアント情報</h3>
			<div class="mi_table_main_wrap mi_table_input_right_wrap">
				<table class="mi_table_input_right mi_table_main client_regist">
					<tbody>
						<tr>
							<th class="mi_tabel_title">ID</th>
							<td class="mi_tabel_content">&nbsp;&nbsp;{if $clientDict.client_id !=''}CA{$clientDict.client_id|string_format:"%05d"}{else}新規{/if}</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">会社名<span class="required">必須</span></th>
							<td class="mi_tabel_content">
								<input type="text" class="text_medium" name="client_name" id="client_name" value="{$clientDict.client_name|escape}" />
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">フリガナ<span class="required">必須</span></th>
							<td class="mi_tabel_content">
								<input type="text" class="text_medium" name="client_namepy" id="client_namepy" value="{$clientDict.client_namepy|escape}" />
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">住所<span class="required">必須</span></th>
							<td class="mi_tabel_content">
								&nbsp;〒&nbsp;<input type="text" class="text_short" name="client_postcode1" id="client_postcode1" value="{$clientDict.client_postcode1|escape}" />&nbsp;-&nbsp;
								<input type="text" class="text_short" name="client_postcode2" id="client_postcode2" value="{$clientDict.client_postcode2|escape}" />&nbsp;&nbsp;
								<input type="text" class="text_long2" name="client_address" id="client_address" value="{$clientDict.client_address|escape}" />
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">電話番号</th>
							<td class="mi_tabel_content">
								<input type="text" class="text_short" name="client_tel1" id="client_tel1" value="{$clientDict.client_tel1|escape}" />&nbsp;-&nbsp;
								<input type="text" class="text_short" name="client_tel2" id="client_tel2" value="{$clientDict.client_tel2|escape}" />&nbsp;-&nbsp;
								<input type="text" class="text_short" name="client_tel3" id="client_tel3" value="{$clientDict.client_tel3|escape}" />
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">FAX番号</th>
							<td class="mi_tabel_content">
								<input type="text" class="text_short" name="client_fax1" id="client_fax1" value="{$clientDict.client_fax1|escape}" />&nbsp;-&nbsp;
								<input type="text" class="text_short" name="client_fax2" id="client_fax2" value="{$clientDict.client_fax2|escape}" />&nbsp;-&nbsp;
								<input type="text" class="text_short" name="client_fax3" id="client_fax3" value="{$clientDict.client_fax3|escape}" />
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">代表者名<span class="required">必須</span></th>
							<td class="mi_tabel_content">
								<input type="text" class="text_medium" name="client_staffleaderfirstname" id="client_staffleaderfirstname" value="{$clientDict.client_staffleaderfirstname|escape}" placeholder="氏" />
								<input type="text" class="text_medium" name="client_staffleaderlastname" id="client_staffleaderlastname" value="{$clientDict.client_staffleaderlastname|escape}" placeholder="名" />
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">代表者メールアドレス<span class="required">必須</span>&nbsp;</th>
							<td class="mi_tabel_content">
								<input type="text" class="text_long" name="client_staffleaderemail" id="client_staffleaderemail" value="{$clientDict.client_staffleaderemail|escape}" />
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">HP</th>
							<td class="mi_tabel_content"><input type="text" class="text_long" name="client_homepage" id="client_homepage" value="{$clientDict.client_homepage|escape}" />
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">リダイレクト先</th>
							<td class="mi_tabel_content td_redirect">
								<input type="text" class="text_long" name="client_redirect_url" value="{$clientDict.client_redirect_url|escape}" />
								<span>
									※ルーム退出後、ゲストには上記URLページが表示されます。
								</span>
							</td>
						</tr>
						{if $user.staff_type=="AA"}
							<tr>
								<th class="mi_tabel_title">担当メンバーＩＤ<span class="required">必須</span>&nbsp;</th>
								<td class="mi_tabel_content">
									<input type="hidden" name="aa_staff_id_list" id="aa_staff_id_list" value="{$clientDict.aa_staff_id_list}"/>
									<span id="aa_staff_name" class="select_person">{$clientDict.aa_staff_name}</span>
									<button type="button" class="mi_cancel_btn detail_open mi_btn_m">選択</button>
									<a data-target="modal-content" class="modal-open" style="display:none;"></a>
									<p class="client_staff_alert"></p>
								</td>
							</tr>
						{/if}

						<tr>
							<th class="mi_tabel_title">利用タイプ<span class="required">必須</span></th>
							<td>
								<label><input type="radio" name="usage_type" value="1" {if $clientDict.usage_type != 2 or $clientDict.usage_type != 3}checked{/if}><span>営業支援</span></label>
								<label><input type="radio" name="usage_type" value="2" {if $clientDict.usage_type == 2}checked{/if}><span>在宅構築</span></label>
								<label><input type="radio" name="usage_type" value="3" {if $clientDict.usage_type == 3}checked{/if}><span>単体利用</span></label>
								<label><input type="radio" name="usage_type" value="4" {if $clientDict.usage_type == 4}checked{/if}><span>トライアル</span></label>
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">
								音声文字起こし（ h / 月 ）
							</th>
							<td class="mi_tabel_content">
								基本契約時間 <input type="text" class="text_medium" name="negotiation_audio_text_remaining_hour" id="negotiation_audio_text_remaining_hour" value="{$clientDict.negotiation_audio_text_remaining_hour|escape}" /> h (空=無制限 0=使用不可)
							</td>
						</tr>
								<tr>
							<th class="mi_tabel_title">
								音声分析（ h / 月 ）
							</th>
							<td class="mi_tabel_content">
								基本契約時間 <input type="text" class="text_medium" name="negotiation_audio_analysis_remaining_hour" id="negotiation_audio_analysis_remaining_hour" value="{$clientDict.negotiation_audio_analysis_remaining_hour|escape}" /> h (空=無制限 0=使用不可)
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">クライアントタイプ</th>
							<td class="client_type_area">
								{foreach from=$clientTypes item=row}
									<label><input type="radio" name="client_type" id="client_type_{$row.id}" value="{$row.id}" {if $clientDict.client_type == $row.id || $clientDict.client_type == 0 && $row.default}checked{/if}>{$row.typeName}</label>
								{/foreach}
								<div id="client_type_user" {if $clientDict.client_type != 0 && $clientDict.client_type != 1} style="display: none;"{/if}>
									<dt>購入経路</dt>
									<dd>
								        <input type="text" autocomplete="on" list="distributor_list" class="text_medium" name="distribution_channel_client_name" id="distribution_channel_client_name" value="{$distributor.client_name}" id="distribution_channel_client_name" />
								        <datalist id="distributor_list">
								        {foreach from=$distributorList item=row}
											<option value="{$row.client_name}" data-hidden-value="{$row.client_id}">
								        {/foreach}
								        </datalist>
										<input type="hidden" id="distribution_channel_client_id" name="distribution_channel_client_id" value="{$clientDict.distribution_channel_client_id|escape}" />
							        </dd>
								</div>

								<div id="client_type_distributor" {if $clientDict.client_type != 2} style="display: none;"{/if}>
									<dl>
										<dt>購入企業アカウント数(ID数)</dt>
										<dd><input type="number" class="text_medium" name="purchasing_client_account_cnt" id="purchasing_client_account_cnt" value="{$clientDict.purchasing_client_account_cnt|escape}" /></dd>

										<dt>代理店営業担当者</dt>
										<dd><input type="text" class="text_long" name="distributor_salesstaff_name" id="distributor_salesstaff_name" value="{$clientDict.distributor_salesstaff_name|escape}" /></dd>

										<dt>代理店営業担当メールアドレス</dt>
										<dd><input type="email" class="text_long" name="distributor_salesstaff_email" id="distributor_salesstaff_email" value="{$clientDict.distributor_salesstaff_email|escape}" /></dd>

										<dt>代理店営業担当 CCメールアドレス</dt>
										<dd><input type="email" class="text_long" name="distributor_salesstaff_ccemail" id="distributor_salesstaff_ccemail" value="{$clientDict.distributor_salesstaff_ccemail|escape}" /></dd>
									</dl>
								</div>
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">二要素認証</th>
							<td>
								<div class="switchArea">
									<input type="checkbox" name="check_auth" id="check_auth" {if $clientDict.two_factor_authenticate_flg == 1}checked{/if}>
									<label for="check_auth"><span></span></label>
									<div id="swImg"></div>
									<input type="hidden" name="two_factor_authenticate_flg" value="">
								</div>
							</td>
						</tr>

					</tbody>
				</table>
			</div>
			<!-- テーブル end -->
			<!-- テーブル start -->
			<h3>契約情報</h3>
			<div class="mi_table_main_wrap mi_table_input_right_wrap">
				<table class="mi_table_input_right mi_table_main client_regist">
					<tbody>
							<tr>
								<th class="mi_tabel_title">プラン</th>
								<td class="mi_tabel_content">
									{foreach from=$plan item=row}
									  {if $row.id != 0}
										  <label><input type="radio" name="plan" id="plan_{$row.id}" value="{$row.id}" {if $row.id == 2}checked{/if}>{$row.planName}</label>
										  <br>
										{/if}
									{/foreach}
								</td>
							</tr>

							<tr>
								<th class="mi_tabel_title">金額</th>
								<td class="mi_tabel_content">
									<input type="number" class="text_medium" name="contract_money" id="contract_money" value="{$clientDict.contract_money|escape}" /> 円
								</td>
							</tr>
							<tr>
								<th class="mi_tabel_title">初回発行アカウント数</th>
								<td class="mi_tabel_content">
									<input type="number" class="text_medium" name="first_payout_staff_cnt" id="first_payout_staff_cnt" value="{$clientDict.first_payout_staff_cnt|escape}" />
								</td>
							</tr>
							<tr>
								<th class="mi_tabel_title">MAXアカウント数</th>
								<td class="mi_tabel_content">
									<input type="number" class="text_medium" name="max_payout_staff_cnt" id="max_payout_staff_cnt" value="{$clientDict.max_payout_staff_cnt|escape}" />
								</td>
							</tr>
							<tr>
								<th class="mi_tabel_title">契約書添付</th>
								<td class="mi_tabel_content">
									<input type="file" name="contract_file" id="contract_file" value="{$clientDict.contract_file|escape}" />
								</td>
							</tr>
							<tr>
								<th class="mi_tabel_title">請求書送付先住所</th>
								<td class="mi_tabel_content">
									<input type="text" class="text_long" name="billing_address" id="billing_address" value="{$clientDict.billing_address|escape}" />
								</td>
							</tr>
							<tr>
								<th class="mi_tabel_title">受注日</th>
								<td class="mi_tabel_content">
									<input type="date" class="text_medium" name="order_date" value="{$clientDict.order_date|date_format:'%Y-%m-%d'}" />
								</td>
							</tr>
							<tr>
								<th class="mi_tabel_title">契約期間</th>
								<td class="mi_tabel_content">
									<input type="date" class="text_medium" name="contract_period_start_date" id="contract_period_start_date" value="{$clientDict.contract_period_start_date|date_format:'%Y-%m-%d'}" />
									~
									<input type="date" class="text_medium" name="contract_period_end_date" id="contract_period_end_date" value="{$clientDict.contract_period_end_date|date_format:'%Y-%m-%d'}" />
								</td>
							</tr>


							<tr>
								<th class="mi_tabel_title">使用開始日</th>
								<td class="mi_tabel_content">
									<input type="date" class="text_medium" name="start_use_date" id="start_use_date" value="{$clientDict.start_use_date|date_format:'%Y-%m-%d'}" />
								</td>
							</tr>
							<tr>
								<th class="mi_tabel_title">請求先担当者名</th>
								<td class="mi_tabel_content">
									<input type="text" class="text_long" name="billing_staff_name" id="billing_staff_name" value="{$clientDict.billing_staff_name|escape}" />
								</td>
							</tr>
							<tr>
								<th class="mi_tabel_title">請求先担当者メールアドレス</th>
								<td class="mi_tabel_content">
									<input type="email" class="text_long" name="billing_staff_email" id="billing_staff_email" value="{$clientDict.billing_staff_email|escape}" />
								</td>
							</tr>
							<tr>
								<th class="mi_tabel_title">フォローコール開始希望日</th>
								<td class="mi_tabel_content">
									<input type="date" class="text_medium" name="follow_call_date" id="follow_call_date" value="{$clientDict.follow_call_date|date_format:'%Y-%m-%d'}" />
								</td>
							</tr>
							<tr>
								<th class="mi_tabel_title">ウェビナー可能時間<span class="required">必須</span></th>
								<td class="mi_tabel_content"><input type="text" placeholder="" class="text_medium" name="webinar_available_time" value="{$clientDict.webinar_available_time|escape}" /><span class="mgl_10">時間</span>
								</td>
							</tr>
							<tr>
								<th class="mi_tabel_title">SalesCrowdクライアントID</th>
								<td class="mi_tabel_content"><input type="text" placeholder="※例:CA00001ならば1を入力" class="text_long" name="salescrowd_client_id" id="salescrowd_client_id" value="{$clientDict.salescrowd_client_id|escape}" />
								</td>
							</tr>
							<tr>
								<th class="mi_tabel_title">備考</th>
								<td class="mi_tabel_content">
									<textarea class="mi_default_input" style="width: 97%;padding: 0 10px;" name="client_comment" id="client_comment" rows="4" cols="120" >{$clientDict.client_comment}</textarea>
								</td>
							</tr>
					</tbody>
				</table>
			</div>
			<!-- テーブル end -->
			<div class="btn_client_submit_area">
				<button type="button" name="submit_button" class="mi_default_button mi_btn_m hvr-fade click-fade">登録する</button>
			</div>

			<input type="hidden" name="client_id" value="{$clientDict.client_id|escape}" />
		</form>
	</div>
	<!-- コンテンツエリア end -->

</div>
<!-- メインコンテンツ end -->

{literal}

<!-- アイドマ担当者モーダルテンプレート -->
<script id="aa-staff-modal-template" type="text/x-handlebars-template">
<!-- モーダルタイトル start -->
<div class="mi_content_title">
	<h2>アイドマ担当者選択</h2>
	<div class="search_box modal_search">
		<input type="text" id="free_word" class="keyword-s" name="free_word" placeholder="検索内容を入力してください...">
		<button class="mi_default_button hvr-fade click-fade" id="on_free_word">
			<span class="icon-search"></span>
		</button>
		<span class="icon-close search_close_button"></span>
	</div>
</div>
<!-- モーダルタイトル end -->

<div class="mi_table_main_wrap">
	<table class="mi_table_main idsselect_table">
		<thead>
			<tr>
				<th>選択</th>
				<th>担当者</th>
			</tr>
		</thead>
		<tbody>
			{{#each aaStaffList}}
				<tr class="idsselect">
					<td class="inp mi_table_item_1" style="height: auto;">
						<input type="checkbox" id="aa_staff_id_{{staff_id}}" name="aa_staff_id[]" value="{{staff_id}}"  />
						<input type="hidden" id="aa_staff_name_{{staff_id}}" name="user_name" value="{{staff_name}}" />
					</td>
					<td id="name">{{staff_name}}</td>
				</tr>
			{{/each}}
		</tbody>
	</table>
</div>
<div class="mi_tabel_btn_area">
	<button type="button" name="submit_button" id="decision" class="mi_default_button mi_btn_m mi_btn_m hvr-fade click-fade">選択する</button>
</div>
<div class="mi_close_icon modal-close">
	<span class="icon-close"></span>
</div>

</script>

{/literal}

{include file="./common/footer.tpl"}
