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

		var clientId = "{/literal}{$clientDict.client_id}{literal}";
		// アイドマ担当者のIDを画面表示時１度設定する
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
						"aaStaffList": staffList,
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
			var userName;
			$('#retrieval_value').focus();
			var checked = $("[name='aa_staff_id[]']:checked");

			ids = [];
			$.each(checked, function(idx, row){
				if(idx == 0){
					userName = $("#aa_staff_name_"+row.value).val();
				}else if(idx == 1){
					userName = userName+"他";
				}
				ids.push(row.value);
			});
			// 次回表示時に使用する為グローバル変数へ設定する
			checkAAStaffList = ids;
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
			$("#submit_button").prop("disabled", true);
			$("#submit_button").text("登録中です...");
			$("#client_form").submit();
		});

		// 編集画面へ遷移
		$("*[name^=edit_]").click(function(){
			var ids = $(this).attr("name").split("_");
			var url = "/admin/staff-regist?staff_type=" + ids[1] + "&staff_id=" + ids[2] + "&client_id=" + ids[3];
			$(location).attr("href", url);
		});

		// 担当者の削除処理
		$("#del_chk").click(function(){
			if(!confirm('チェックされたアカウントを削除します。よろしいですか？')) {
				return;
			}
			var cnt = 0
			for (var i=0 ; i==i ; i++ ) {
				var doc = "del_" + i;
				if ( document.getElementById( doc ) == null ) {
					break;
				}
				if ( document.getElementById( doc ).checked ) {
					var ids = document.getElementById( doc ).value.split("_");
					cnt++;
					// 担当者削除処理を非同期にて行う
					$.ajax({
						url: "staff-delete",
						type: "POST",
						data: {staff_type : ids[0], staff_id : ids[1]},
						//dataType: 'json',
						success: function(result) {
							if(result == 1){
//								alert("削除に成功しました");
//								location.reload();
							}else{
								alert("削除に失敗しました");
								location.reload();
							}
						}
					});
				}
			}
			if (cnt>0) {
				alert("削除に成功しました");
				location.reload();
			} else {
				alert("削除対象がありません");
			}
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
  background-color: #35a0d4;
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
			{/if}
		</ul>

		<!-- パンくずリスト start -->
		<div class="mi_breadcrumb_list">
		<a href="/index/menu">TOP</a>&nbsp;&gt;&nbsp;
		{if $user.staff_type=="AA"}
		<a href="/admin/staff-list?staff_type=AA">AAアカウント管理</a>&nbsp;&gt;&nbsp;
		<a href="/admin/client-list">クライアント／企業アカウント一覧</a>&nbsp;&gt;&nbsp;
		{/if}
		<a href="/admin/client-edit?client_id={$clientDict.client_id}&staff_type={$user.staff_type}{if $pram.ret=="top"}&ret=top{/if}">クライアント／企業情報編集・アカウント一覧</a>
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
				クライアント／企業アカウント編集
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

		<form action="/admin/client-edit" method="post" id="client_form" autocomplete="off">
			<!-- テーブル start -->
			<div class="mi_table_main_wrap mi_table_input_right_wrap">
				<table class="mi_table_input_right mi_table_main">
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
						{if $user.staff_type=="AA"}
							<tr>
								<th class="mi_tabel_title">担当メンバーＩＤ</th>
								<td class="mi_tabel_content">
									<input type="hidden" name="aa_staff_id_list" id="aa_staff_id_list" value="{$clientDict.aa_staff_id_list}"/>
									<span id="aa_staff_name" class="select_person">{$clientDict.aa_staff_name}</span>
									<button type="button" class="mi_cancel_btn detail_open mi_btn_m">選択</button>
									<a data-target="modal-content" class="modal-open" style="display:none;"></a>
									<p class="client_staff_alert"></p>
								</td>
							</tr>
							<tr>
								<th class="mi_tabel_title">備考</th>
								<td class="mi_tabel_content">
									<textarea class="mi_default_input" style="width: 97%;padding: 0 10px;" name="client_comment" id="client_comment" rows="4" cols="120" >{$clientDict.client_comment}</textarea>
								</td>
							</tr>
						{/if}
					</tbody>
				</table>
			</div>
			<!-- テーブル end -->
			<div class="btn_client_submit_area">
				<button type="button" name="submit_button" class="mi_default_button hvr-fade click-fade" id="submit_button">登録する</button>
			</div>
			<input type="hidden" name="client_id" value="{$clientDict.client_id|escape}" />
			<input type="hidden" name="ret" value="{$pram.ret}" />
		</form>
	</div>
	<!-- コンテンツエリア end -->

	<!-- コンテンツエリア start -->
	<div id="mi_content_area">

		<!-- コンテンツタイトル start -->
		<div class="mi_content_title">
			<span class="icon-parsonal mi_content_title_icon"></span>
			<h1>{if $staffDict.staff_type == "AA"}
					{$staffDict.staff_type}／
				{/if}
				ユーザーアカウント一覧</h1>
			<div class="mi_flt-r">
				<form id="search_form" action="/admin/client-edit?staff_type={$staffDict.staff_type}{if $staffDict.client_id!=''}&client_id={$staffDict.client_id}{/if}" method="get">
					<div class="search_box">
						<input type="text" name="free_word" value="{$freeWord}" placeholder="検索内容を入力してください...">

						<button class="mi_default_button hvr-fade click-fade">
							<span class="icon-search"></span>
						</button>
						<span class="icon-close search_close_button"></span>
					</div>
					<input type="hidden" name="staff_type" value="{$staffDict.staff_type|escape}" />
					<input type="hidden" name="client_id" value="{$staffDict.client_id|escape}" />
				</form>
			</div>
			{if $user.staff_type=="AA"}
		      	<div class="mi_flt-r">
		        	<div class="mi_content_title_option">
		          		<a href="/admin/staff-regist?{$staffDict.addURL}" class="mi_title_action_btn click-fade">
		            	<span class="icon-parsonal-puls"></span>
		            	<span>追加</span>
			          	</a>
			          	<a href="javascript:void(0);" name="del_chk" class="del_chk mi_title_action_btn click-fade" id="del_chk">
			            	<span class="icon-delete"></span>
			            	<span>削除</span>
			          	</a>
		        	</div>
		      	</div>
		   	{/if}
		</div>
		<!-- コンテンツタイトル end -->

		<!-- エラーメッセージ表示エリア begin -->
		{if $err == 1}
			不正なIDです。
		{/if}
		<!-- エラーメッセージ表示エリア end -->

		<!-- ページネーション start -->
		<div class="mi_pagenation">
			<div class="mi_pagenation_result">該当件数 <span>{$list->getCount()}</span>件</div>
			{$list->getLinkParam($pram)}
			{$list->getPerPagePram($pram)}
		</div>
		<!-- ページネーション end -->

		<!-- テーブル start -->
		<div class="mi_table_main_wrap">
			<table class="mi_table_main">
				<thead>
					<tr>
						{if $user.staff_type=="AA"}
							<th class="mi_table_item_1">選択</th>
							<th class="mi_table_item_1">編集</th>
						{/if}
						<th>{$list->getOrderArrow('アカウントID', 'staff_id')}</th>
						<th>{$list->getOrderArrow('名前', 'staff_name')}</th>
						<th>{$list->getOrderArrow('meet in 番号', 'meetin_number')}</th>
						<th>{$list->getOrderArrow('メールアドレス', 'staff_email')}</th>
						<th>{$list->getOrderArrow('権限', 'staff_role')}</th>
					</tr>
				</thead>
				<tbody>
					{assign var=i value="0" scope="global"}
					{foreach from=$list->getList() item=row}
						<tr>
							{if $user.staff_type=="AA"}
								<td class="mi_table_item_1"><input type="checkbox" id="del_{$i++}" value="{$row.staff_type}_{$row.staff_id}"></td>
								<td class="mi_edit_icon"><a href="javascript:void(0)" name="edit_{$row.staff_type}_{$row.staff_id}_{$row.client_id}"><span class="icon-edit"></span></a></td>
							{/if}
							<td>{$row.staff_type|escape}{$row.staff_id|string_format:"%05d"}</td>
							<td>{$row.staff_name}</td>
							<td>{$row.meetin_number|escape|substr:0:3}-{$row.meetin_number|escape|substr:3:4}-{$row.meetin_number|escape|substr:7:4}</td>
							<td>{$row.staff_email|escape}</td>
							<td>
								{if $row.staff_role == $smarty.const.ROLE_ADM}
									管理者
								{elseif $row.staff_role == $smarty.const.ROLE_EMP}
									一般社員
								{elseif $row.staff_role == $smarty.const.ROLE_PRT}
									アルバイト
								{/if}
							</td>
						</tr>
					{/foreach}
				</tbody>
			</table>
		</div>
		<!-- テーブル end -->
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
