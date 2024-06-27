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

	$(function (){


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
	width:200px !important;
	height: 100%;
	display: inline-block !important;
	padding: 0 10px;
}
.text_long{
	width:443px !important;
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


.mi_table_input_right .mi_tabel_title {
    line-height: 1.5;
}

.mi_table_main th {
	height: 0;
    padding: 17px 0;
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

.client_header{
	display: flex;
	justify-content: space-between;
	margin-bottom: 10px;
}

.client_header ul{
	display: flex;
}

.client_header ul li{
	background-color: #fff;
	list-style: none;
	margin-right: 15px;
	font-size: 11px;
	text-align: center;
	line-height: 26px;
}

.client_header ul li:last-of-type{
	margin-right: 0;
}

.client_sleep{
	border: 1px solid #A7A7A7;
	width: 162px;
	height: 26px;
}

.client_sleep::before {
	content: "";
	display: inline-block;
	background-image: url(/img/icon_sleep.png);
	width: 13px;
	height: 13px;
	background-size: contain;
	background-repeat: no-repeat;
	margin: 0 10px 0 0;
	line-height: 26px;
	vertical-align: middle;
}

.client_accident{
	border: 1px solid #B55151;
	width: 114px;
	height: 26px;
}

.client_accident::before {
	content: "";
	display: inline-block;
	background-image: url(/img/icon_accident.png);
	width: 13px;
	height: 13px;
	background-size: contain;
	background-repeat: no-repeat;
	margin: 0 10px 0 0;
	line-height: 26px;
	vertical-align: middle;
}

.client_header ul li.client_warning{
	border: 1px solid #B55151;
	width: 114px;
	height: 26px;
	margin-right: 0;
}

.client_warning::before {
	content: "";
	display: inline-block;
	background-image: url(/img/icon_warning.png);
	width: 13px;
	height: 13px;
	background-size: contain;
	background-repeat: no-repeat;
	margin: 0 10px 0 0;
	line-height: 26px;
	vertical-align: middle;
}

.distributor{
	margin-bottom: 50px;
}

.distributor div:first-of-type{
	font-size: 12px;
	font-weight: 300;
}

.distributor div:nth-of-type(2){
	font-size: 20px;
	font-weight: 700;
}

.mi_tabel_content a{
	color: blue;
	border-bottom: 1px solid blue;
}

.mi_tabel_content a:visited{
	color: blue;
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
			<li class="">
				<a href="/admin/client-list" class="hvr-underline-from-center">
					<span class="icon-company mi_default_label_icon"></span>
					<div class="">クライアント管理</div>
				</a>
			</li>
			<li class="mi_select">
				<a href="/admin/distributor-list" class="hvr-underline-from-center">
					<span class="icon-company mi_default_label_icon"></span>
					<div class="">販売店管理</div>
				</a>
			</li>
			{else if $user.staff_type=="CE"}
			<li class="">
				<a href="/admin/client-edit?staff_type={$user.staff_type}&client_id={$user.client_id}&ret=top" class="hvr-underline-from-center">
					<span class="icon-company mi_default_label_icon"></span>
					<div class="">クライアント管理</div>
				</a>
			</li>
			<li class="mi_select">
				<a href="/admin/distributor-client-list?client_id={$user.client_id}" class="hvr-underline-from-center">
					<span class="icon-company mi_default_label_icon"></span>
					<div class="">販売店管理</div>
				</a>
			</li>
			{/if}
		</ul>

		<!-- パンくずリスト start -->
		<div class="mi_breadcrumb_list">
		{if $user.staff_type=="AA"}
		<a href="/index/menu">TOP</a>&nbsp;&gt;&nbsp;
		<a href="/admin/staff-list?staff_type=AA">AAアカウント管理</a>&nbsp;&gt;&nbsp;
		<a href="/admin/client-list">クライアント／企業アカウント一覧</a>&nbsp;&gt;&nbsp;
		<a href="/admin/distributor-list">販売店一覧</a>
		{else if $user.staff_type=="CE"}
		<a href="/index/menu">TOP</a>&nbsp;&gt;&nbsp;
		<a href="/admin/client-edit?staff_type={$user.staff_type}&client_id={$user.client_id}&ret=top">クライアント管理</a>&nbsp;&gt;&nbsp;
		<a href="/admin/distributor-client-list?client_id={$user.client_id}">販売店管理</a>
		{/if}
		</div>
		<!-- パンくずリスト end -->

	</div>
	<!-- トップナビ end -->

	<!-- コンテンツエリア start -->
	<div id="mi_content_area">

		<!-- コンテンツタイトル start -->
		<div class="mi_content_title">
			<span class="icon-company mi_content_title_icon"></span>
			<h1>
				クライアント／企業アカウント
			</h1>
		</div>
		<!-- コンテンツタイトル end -->


		<form action="/admin/client-edit" method="post" id="client_form" enctype="multipart/form-data">

			<!-- テーブル start -->

			<div class="distributor">
				<div>企業名</div>
				<div>{$distributorDict.client_name|escape}</div>
			</div>
			<div class="client_header">
				<h3>クライアント情報</h3>
				<ul>
					{if 0 == $clientDict.active_staff_count} <li class="client_sleep">最終ログイン１週間前</li> {/if}
					{if 1 == $clientDict.is_expiration}<li class="client_accident">期限切れ</li>{/if}
					{if 0 == $clientDict.is_expiration && 1 == $clientDict.is_near_expiration}<li class="client_warning">契約切れ間近</li>{/if}
				</ul>
			</div>

			<div class="mi_table_main_wrap mi_table_input_right_wrap">
				<table class="mi_table_input_right mi_table_main">
					<tbody>
						<tr>
							<th class="mi_tabel_title">ID</th>
							<td class="mi_tabel_content">&nbsp;&nbsp;{if $clientDict.client_id !=''}CA{$clientDict.client_id|string_format:"%05d"}{else}新規{/if}</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">会社名</th>
							<td class="mi_tabel_content">
								{$clientDict.client_name|escape}
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">フリガナ</th>
							<td class="mi_tabel_content">
								{$clientDict.client_namepy|escape}
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">住所</th>
							<td class="mi_tabel_content">
								&nbsp;〒{$clientDict.client_postcode1|escape} - {$clientDict.client_postcode2|escape} &nbsp; {$clientDict.client_address|escape}
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">電話番号</th>
							<td class="mi_tabel_content">
								{if $clientDict.client_tel1 + $clientDict.client_tel2 + $clientDict.client_tel3 != null }
								{$clientDict.client_tel1|escape} &nbsp;-&nbsp; {$clientDict.client_tel2|escape} &nbsp;-&nbsp; {$clientDict.client_tel3|escape}
								{/if}
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">FAX番号</th>
							<td class="mi_tabel_content">
								{if $clientDict.client_fax1 + $clientDict.client_fax2 + $clientDict.client_fax3 != null}
								{$clientDict.client_fax1|escape} &nbsp;-&nbsp; {$clientDict.client_fax2|escape}&nbsp;-&nbsp; {$clientDict.client_fax3|escape}
								{/if}
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">代表者名</th>
							<td class="mi_tabel_content">
								{$clientDict.client_staffleaderfirstname|escape} {$clientDict.client_staffleaderlastname|escape}
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">代表者メールアドレス</th>
							<td class="mi_tabel_content">
								{$clientDict.client_staffleaderemail|escape}
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">HP</th>
							<td>
								{$clientDict.client_homepage|escape}
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">リダイレクト先</th>
							<td>
								{$clientDict.client_redirect_url|escape}
							</td>
						</tr>
						{if $user.staff_type=="AA"}
							<tr>
								<th class="mi_tabel_title">担当メンバー</th>
								<td class="mi_tabel_content">
									<span id="aa_staff_name" class="select_person">{$clientDict.aa_staff_list[0].staff_name|escape}</span> 他
								</td>
							</tr>
						{/if}


						<tr>
							<th class="mi_tabel_title">クライアントタイプ</th>
							<td class="mi_tabel_content">
								{foreach from=$clientTypes item=row}
									{if $clientDict.client_type == $row.id}{$row.typeName}{/if}
								{/foreach}
							</td>
						</tr>

						<tr>
							<th class="mi_tabel_title">購入企業アカウント数<br>(ID数)</th>
							<td class="mi_tabel_content">
								{$clientDict.purchasing_client_account_cnt|escape}
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">代理店営業担当者</th>
							<td class="mi_tabel_content">
								{$clientDict.distributor_salesstaff_name|escape}
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">代理店営業担当<br>メールアドレス</th>
							<td class="mi_tabel_content">
								{$clientDict.distributor_salesstaff_email|escape}
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">代理店営業担当<br>CCメールアドレス</th>
							<td class="mi_tabel_content">
								{$clientDict.distributor_salesstaff_ccemail|escape}
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
							<th class="mi_tabel_title">
								今月のプラン
							</th>
							<td class="mi_tabel_content">
								{foreach from=$plan item=row}
									{if $clientDict.plan_this_month == $row.id}
										{$row.planName}
									{/if}
								{/foreach}
							</td>
						</tr>

						<tr>
							<th class="mi_tabel_title">金額</th>
							<td class="mi_tabel_content">
								{$clientDict.contract_money|escape} 円
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">初回発行アカウント数</th>
							<td class="mi_tabel_content">
								{$clientDict.first_payout_staff_cnt|escape}
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">MAXアカウント数</th>
							<td class="mi_tabel_content">
								{$clientDict.max_payout_staff_cnt|escape}
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">契約書添付</th>
							<td class="mi_tabel_content">
								{if $clientDict.contract_file != null && $clientDict.contract_file != "0"}
								<a href="/cmn-contract/{$clientDict.contract_file|escape}" target="_blank">契約書</a>
								{/if}
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">請求書送付先住所</th>
							<td class="mi_tabel_content">
								{$clientDict.billing_address|escape}
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">受注日</th>
							<td class="mi_tabel_content">
								{if $clientDict.order_date!="0000-00-00 00:00:00"}
									{$clientDict.order_date|date_format:'%Y/%m/%d'}
								{/if}
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">契約期間</th>
							<td class="mi_tabel_content">
								{if $clientDict.contract_period_start_date != '0000-00-00 00:00:00'}
									{$clientDict.contract_period_start_date|date_format:'%Y/%m/%d'}
								{/if}
								{if $clientDict.contract_period_end_date != '0000-00-00 00:00:00'}
									〜
									{$clientDict.contract_period_end_date|date_format:'%Y/%m/%d'}
								{/if}
							</td>
						</tr>

						<tr>
							<th class="mi_tabel_title">使用開始日</th>
							<td class="mi_tabel_content">
								{if $clientDict.start_use_date != '0000-00-00 00:00:00'}
									{$clientDict.start_use_date|date_format:'%Y/%m/%d'}
								{/if}
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">請求先担当者名</th>
							<td class="mi_tabel_content">
								{$clientDict.billing_staff_name|escape}
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">請求先担当者メールアドレス</th>
							<td class="mi_tabel_content">
								{$clientDict.billing_staff_email|escape}
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">フォローコール開始希望日</th>
							<td class="mi_tabel_content">
								{if $clientDict.follow_call_date != '0000-00-00 00:00:00'}
									{$clientDict.follow_call_date|date_format:'%Y/%m/%d'}
								{/if}
							</td>
						</tr>

						{if $user.staff_type=="AA"}
							<tr>
								<th class="mi_tabel_title">備考</th>
								<td class="mi_tabel_content">
									<textarea readonly="true" class="mi_default_input" style="width: 97%;padding: 0 10px;outline:0;resize:none;border:none;" name="client_comment" id="client_comment" rows="4" cols="120" >{$clientDict.client_comment}</textarea>
								</td>
							</tr>
						{/if}
					</tbody>
				</table>
			</div>
			<!-- テーブル end -->
		</form>
	</div>
	<!-- コンテンツエリア end -->

</div>
<!-- メインコンテンツ end -->


{include file="./common/footer.tpl"}
