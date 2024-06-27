{include file="./common/header.tpl"}

{literal}

<script>
	$(function (){
        $('td').on("click",function(){
            $(location).attr("href", "/admin/distributor-client-list?client_id=" + $(this).parent('tr').data().client_id);
        });

        document.getElementById('checkboxArea').addEventListener('change', (event) => {
            $("#search_form").off("submit");
            $('#search_form').submit();
        });
	});
</script>


<style>

.mi_flt-r {
	float: none;
}

.mi_content_title h1 {
    color: #555;
    float: none;
    font-size: 20px;
    line-height: 50px;
    font-weight: bold;
	margin-bottom: 25px;
}

.mi_pagenation {
    width: 100%;
    height: 30px;
    line-height: 30px;
    font-size: 14px;
    margin: 135px 0 12px 0;
}

.checkbox-input{
  display: none;
}
.checkbox-parts{
  padding-left: 20px;
  position:relative;
  margin-right: 20px;
}
.checkbox-parts::before{
  content: "";
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  width: 15px;
  height: 15px;
  border: 1px solid #dedede;
  background-color: #fff;
}

.checkbox-parts img{
  width: 15px;
  margin: 0 4px 5px 0;
}

.checkbox-input:checked + .checkbox-parts::after{
  content: "";
  display: block;
  position: absolute;
  top: 0;
  left: 4px;
  width: 6px;
  height: 10px;
  transform: rotate(40deg);
  border-bottom: 2px solid #0081CC;
  border-right: 2px solid #0081CC;
  /* background-color: #fff; */
}

.checkbox{
	padding: 16px 0 20px 10px;
}

.arrow-next::after {
    content: "";
    display: inline-block;
    left: 3px;
    width: 8px;
    height: 8px;
    border-top: 2px solid #ddd;
    border-right: 2px solid #ddd;
    -webkit-transform: rotate(45deg);
    transform: rotate(45deg);
}

.mi_table_main th:nth-of-type(-n+1){
	width: 64px;
}

.mi_table_main td img{
	width: 17px;
}


</style>

{/literal}


<!-- メインコンテンツ start -->
<div id="mi_main_contents">
	<!-- トップナビ start -->
	<div id="mi_top_nav" class="acount_manage_on">
		<ul>
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
		</ul>

		<!-- パンくずリスト start -->
		<div class="mi_breadcrumb_list">
		<a href="/index/menu">TOP</a>&nbsp;&gt;&nbsp;
		<a href="/admin/staff-list?staff_type=AA">AAアカウント管理</a>&nbsp;&gt;&nbsp;
		<a href="/admin/client-list">クライアント／企業アカウント一覧</a>
	</div>
		<!-- パンくずリスト end -->

	</div>
	<!-- トップナビ end -->

	<!-- コンテンツエリア start -->
	<div id="mi_content_area">

		<!-- コンテンツタイトル start -->
		<div class="mi_content_title">
			<span class="icon-company mi_content_title_icon"></span>
			<h1>販売店一覧</h1>

			<div class="">
				<form id="search_form" action="/admin/distributor-list" method="get">
					<div class="search_box search_box--on">
						<input type="text" name="free_word" value="{$free_word}" placeholder="検索内容を入力してください...">

						<button class="mi_default_button hvr-fade click-fade">
							<span class="icon-search"></span>
						</button>
						<span class="icon-close search_close_button"></span>
					</div>
					<div id="checkboxArea" class="checkbox">

					  <span>契約:</span>
					  <label>
					    <input type="checkbox" name="active" class="checkbox-input" {if $filters.active }checked="checked"{/if}>
					    <span class="checkbox-parts">有効</span>
					  </label>
					  <label>
					    <input type="checkbox" name="near_expiration" class="checkbox-input" {if $filters.near_expiration }checked="checked"{/if}>
					    <span class="checkbox-parts"><img src="/img/icon_warning.png">期限切れ間近</span>
					  </label>
					  <label>
					    <input type="checkbox" name="expiration" class="checkbox-input" {if $filters.expiration }checked="checked"{/if}>
					    <span class="checkbox-parts"><img src="/img/icon_accident.png">期限切れ</span>
					  </label>
				  	</div>
				</form>
			</div>

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
			{$list->getLink()}
			{$list->getPerPage()}
		</div>
		<!-- ページネーション end -->

		<!-- テーブル start -->
		<div class="mi_table_main_wrap">
			<table class="mi_table_main">
				<thead>
					<tr>
						<th>契約</th>
						<th>{$list->getOrderArrow('ID', 'client_id')}</th>
						<th>{$list->getOrderArrow('会社名', 'client_name')}</th>
						<th>{$list->getOrderArrow('クライアント件数', 'client_count')}</th>
						<th>{$list->getOrderArrow('電話番号', 'client_tel1')}</th>
						<th style="width: 65px"></th>
					</tr>
				</thead>
				<tbody>
					{assign var=i value="0" scope="global"}
					{foreach from=$list->getList() item=row}
						<tr data-client_id="{$row.client_id}">
							<td>
								{if $row.is_near_expiration == "1" && $row.is_expiration == "0"} <img src="/img/icon_warning.png"> {/if}
								{if $row.is_expiration == "1"} <img src="/img/icon_accident.png"> {/if}
							</td>
							<td>CA{$row.client_id|string_format:"%05d"|escape}</td>
							<td>{$row.client_name|escape}</td>
							<td>{$row.client_count|escape}社 / {$row.staff_count|escape}人</td>
							<td>
								{if $row.client_tel1 + $row.client_tel2 + $row.client_tel3 != null}
									{$row.client_tel1|escape}-{$row.client_tel2|escape}-{$row.client_tel3|escape}
								{/if}
							</td>
							<td class="arrow-next"></td>
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


{include file="./common/footer.tpl"}
