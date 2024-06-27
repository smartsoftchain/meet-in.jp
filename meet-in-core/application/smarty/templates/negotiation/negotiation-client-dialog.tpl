{literal}
<style type="text/css">

	/* デフォルトのRadiobuttonを隠す */
	.radio-client-container {
	    display: block;
	    position: relative;
	    /* padding-left: 35px; */
	    /* margin-bottom: 12px; */
			margin-bottom : 22px;
			margin-left : 12px;
	    cursor: pointer;
	    font-size: 22px;
	    -webkit-user-select: none;
	    -moz-user-select: none;
	    -ms-user-select: none;
	    user-select: none;
	    /* padding: 10px; */
	}
	/* 新たに描画 */
	.radio-client-container input {
	    position: absolute;
	    opacity: 0;
	    cursor: pointer;
	}
	/* 外枠 */
	.checkmark {
	    position: absolute;
	    top: 0;
	    left: 0;
	    height: 24px;
	    width: 24px;
	    background-color: #fff;
	    border-radius: 50%;
	    border: 1px solid #999;
	}
	/* マウスオーバー時の色 */
	.radio-client-container:hover input ~ .checkmark {
	    background-color: #fff;
	}
	/* 選択時のRadioBox全体色 */
	.radio-client-container input:checked ~ .checkmark {
	    background-color: #FFF;
	    border: 1px solid #999;
	}
	/* 選択を示す丸部分の作成 */
	.checkmark:after {
	    content: "";
	    position: absolute;
	    display: none;
	}
	/* 選択表示 */
	.radio-client-container input:checked ~ .checkmark:after {
	    display: block;
	}
	/* 選択を示す丸 */
	.radio-client-container .checkmark:after {
	  top: 3px;
	  left: 3px;
	  width: 18px;
	  height: 18px;
	  border-radius: 50%;
	  background: #ffa000;
	}


/*-------------------------------------
	（モーダル）基本型
--------------------------------------*/
.ui-dialog {
	z-index: 100000003;
	padding:0;
}

#setting-client-dialog{
	margin:0;
	padding: 0 39px 0 51px;
}

#setting-client-dialog h1 {
	color: #ffa000 !important;
  font-size: 18px;
  margin-top: 35px;
  font-family: Meiryo;
  margin-bottom: 10px;
}

.mi_client_table{
/*	border-collapse: separate; */
/*	border-spacing : 0 8px; */
/*	background: #fff; */
/*	margin: 0 auto; */
/*	height: auto; */
/*	table-layout: fixed; */
/*	width: 100%; */
/*	border: 1px solid #d8d8d8; */
	width:100%;
}
.mi_client_table th {
/*    height: 40px; */
/*    color: #fff; */
/*    background-color: #ffaa00; */
/*    font-weight: normal; */
/*    text-align: center; */
/*    vertical-align: middle; */
/*    white-space: nowrap; */
		border: 1px solid #d8d8d8;
		height:39px;
		font-size:12px;
		font-weight:bold;
		background-color: #fff4e1;
		color: #333333;
}
.mi_client_table td{
	border: 1px solid #d8d8d8;
	height: 44px;
	font-size:13px;
	padding:0;
}
.modal-content-client {
  display: none;
  position: fixed;
  height: 100%;
  width: 100%;
  top: 0%;
  left: 0%;
	z-index: 100000002;
}

#modal-content-client .inner-wrap .list-area.hgt3.mi_modal_default{
	max-height: calc(100% - 150px);
	height: calc(100% - 150px);
	max-width: 550px;
	min-height: 290px;
}

.btn_area{
/*	margin-top: 20px; */
	text-align: center;
}

.title_header{
	font-size: 20px;
	font-weight: bold;
}

.errmsg {
	font-size: 0.95em;
	line-height: 1.6;
	color: #df6b6d;
}

.negotiation_flt-l {
  font-size: 0.8em;
  float: left;
  margin-top: 30px;
  margin-bottom: 30px;
}

.client_search_box{
	width: 297px;
	margin-left: 0;
	margin-bottom: 10px;
}

.client_search_box input{
	height: 37px;

	-webkit-user-select: auto;  /* Chrome or Safari */
	-moz-user-select: text;     /* FireFox */
	-ms-user-select: text;      /* IE */
	-o-user-select: text;       /* Opera */
	user-select: text;
}

#client_search_keyword{
	height: 37px;
	width : 237px;
	font-size:12px;
}

.mi_table_main_wrap_client{
	max-height: 176px;
	min-height: 176px;
}

.ui-button-client{
	width:123px;
	height:37px;
}

.ui-dialog-buttonpane-client{
	margin-top: 33px;
	text-align: center;
}

.setting-client-dialog-overlay{
/*	background:#000; */
/*	opacity:0.6; */
	background:rgba(0, 0, 0);
	z-index: 100000002 !important;
}

.mi_client_table tr:hover td {
/*	background: #f9e8ca; */
	background: #f6f6f6;
}

</style>

{/literal}

<!-- ====================================== クライアント設定ダイアログ[start] ====================================== -->
<div id="setting-client-dialog"
class="ui-dialog ui-widget ui-widget-content ui-front ui-dialog-osx ui-dialog-buttons negotiation-dialog"
tabindex="-1" role="dialog" aria-describedby="common_dialog_rubr1mm89blbalxo" aria-labelledby="ui-id-1" style="display:none;">
	<div class="negotiation_modal_close" id="setting-client-dialog-cancel-button"></div>
	<h1>クライアント選択</h1>
	<div class="search_box client_search_box">
		<input type="text" name="free_word" value="" id="client_search_keyword" placeholder="IDまたは名前を検索">
		<!--no hvr-fade click-fade-->
		<button class="mi_default_button" id="client-dialog-search" style="height: 37px;width: 60px;line-height:0;">
			<span class="ui-button-text" style="font-size:12px;font-weight: bold;">検索</span>
		</button>
	</div>
	<div class="mi_table_main_wrap mi_table_input_right_wrap mi_table_main_wrap_client" >
			<table class="mi_table_main mi_client_table"><!--mi_table_main-->
				<thead>
					<tr>
						<th class="mi_table_item_1"></th><!--mi_table_item_1-->
						<th><div><p>クライアントID</p><p><a href="/client/list?order=client_id&amp;ordertype=asc"><span class="ascending"></span></a><a href="/client/list?order=client_id&amp;ordertype=desc"><span class="descending"></span></a></p></div></th>
						<th><div><p>クライアント名</p><p><a href="/client/list?order=client_name&amp;ordertype=asc"><span class="ascending"></span></a><a href="/client/list?order=client_name&amp;ordertype=desc"><span class="descending"></span></a></p></div></th>
					</tr>
				</thead>
				<tbody id="client_table_body">
				</tbody>
			</table>
	</div>
	<div class="ui-dialog-buttonpane-client">
		<button type="button" id="setting-client-dialog-enter-button"
				class="mi_default_button ui-button-text-only ui-button-client" role="button" >
			<span class="ui-button-text">選択する</span>
		</button>
	</div>
	<!--
	<div class="ui-dialog-buttonpane ui-helper-clearfix ui-dialog-buttonpane-client" style="padding:0;">
		<div class="ui-dialog-buttonset">
			<button type="button" id="setting-client-dialog-cancel-button"  class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only" role="button">
				<span class="ui-button-text">キャンセル</span>
			</button>
			<button type="button" id="setting-client-dialog-enter-button"
			class="ui-button ui-button-text-only ui-button-client" role="button" >
				<span class="ui-button-text">選択する</span>
			</button>
		</div>
	</div>
	-->

</div>
<!-- ====================================== クライアント設定ダイアログ[end] ====================================== -->
