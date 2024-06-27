{include file="./common/header.tpl"}

{literal}

<script>

$(function (){
});

</script>

<style type="text/css">
<!--

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

/* エラーメッセージ */
.errmsg {
	font-size: 0.95em;
	line-height: 1.6;
	color: #df6b6d;
	padding-bottom: 15px;
}

/*MEET-162*/

.mi_default_button {
  width: 125px;
}

.btn_client_submit_area {
  margin-top: 30px;
  text-align: center;
  display: inline-block;
  float: right;
  position: relative;
  top: -80px;
	left: -50px;
}

.mi_table_input_right .mi_default_input {
  background: #fff;
  border: 1px solid #000000;
  text-align: left;
  height: 40px;
  padding: 0 20px;
  font-size: 14px;
  width: 536px;
}
.mi_table_input_right tbody tr:first-child{
	border: none;
}

.mi_table_input_right .mi_tabel_content{
	border: none;
}



.tag_wrap{
	line-height: 44px;
	position: relative;
	margin-left: 29px;
}

#tag_explanatory_text{
	position: relative;
  top: 18px;
	margin-left: 14px;
}

.tag_textarea{
	background-color: #fff;
	height: 130px;
	line-height: 42px
}

#embed_link_form{
	height: 60px;
	margin-left: 37px;
	width: 701px;
}

#tag_text{
	margin-left: 42px;
	position: relative;
	margin-left: 44px;
	top: 7px;
}

#tag-menu-down{
	width: 75%;
  text-align: center;
  position: relative;
}
-->
</style>

{/literal}

<!-- メインコンテンツ start -->
<div id="mi_main_contents">
	<!-- トップナビ start -->
	<div id="mi_top_nav">
		<!-- パンくずリスト start -->
		<div class="mi_breadcrumb_list">
			<a href="/index/menu">TOP</a>&nbsp;&gt;&nbsp;
			<a href="/admin/embed-link-publish">埋込タグ発行</a>
		</div>
		<!-- パンくずリスト end -->
	</div>
	<!-- トップナビ end -->

	<!-- コンテンツエリア start -->
	<div id="mi_content_area">

		<!-- コンテンツタイトル start -->
		<div class="mi_content_title">
			<h1><span class="icon-configuration mi_content_title_icon"></span>
				埋込タグ発行
			</h1>
		</div>
		<!-- コンテンツタイトル end -->

		<!-- エラーメッセージ表示エリア begin -->
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
		<!-- エラーメッセージ表示エリア end -->

		<!-- テーブル start -->
		<div class="mi_table_main_wrap_top mi_table_input_right_wrap">
		  <div class="tag_wrap">
			<form action="/admin/embed-link-publish" method="post" id="embed_link_publish_form" enctype="multipart/form-data">
				<p id="tag_explanatory_text">(1)ルーム名の先頭に固定の文字をつける場合は入力し、「タグ発行」ボタンをクリックしてください。</p>
				<table class="mi_table_input_right mi_table_main">
					<tbody>
						<tr>
							<td class="mi_tabel_content">
								<input type="text" class="mi_default_input" name="embed_link_url" id="embed_link_url" value="" />
							</td>
						</tr>
					</tbody>
				</table>
			</div>
				<!-- テーブル end -->
				<div class="btn_client_submit_area">
					<button type="button" name="submit_button" id="submit_button" class="mi_default_button">タグ発行</button>
				</div>
				<script type="text/javascript" src="/js/admin/embed-link-publish.js?{$application_version}"></script>
				<input type="hidden" name="client_id" value="{$user.client_id|escape}" />
				<input type="hidden" name="staff_type" value="{$user.staff_type|escape}" />
				<input type="hidden" name="staff_id" value="{$user.staff_id|escape}" />
			</form>
		</div>
		<div class="icon-menu-down  mi_default_label_icon mi_header_arrow_icon" id="tag-menu-down"></div>
		<div class="tag_textarea">
		<p id="tag_text">(2)下記のタグをコピーして該当箇所を貼り付けてください</p>
		<textarea class="mi_default_input" name="embed_link_form" id="embed_link_form" rows="4" cols="120" ></textarea>
		</div>
	</div>
	<!-- コンテンツエリア end -->

</div>
<!-- メインコンテンツ end -->

{include file="./common/footer.tpl"}
