{include file="./common/header.tpl"}

{literal}

<style>

.td_inner_wrap {
	padding: 10px !important;
}

table.input-tbl th {
	width: 300px;
}

table.input-tbl .txtinp input[type="text"] {
	width: 802px;
	display: inline-block;
}

table.input-tbl .txtinp input[type="checkbox"] {
	width: 24px;
	display: inline-block;
}

/* 追加ボタンCSS */
a.btn-gry.add-btn {
	display: block;
    width: 70px;
    height: 33px;
    font-size: 14px;
    padding: 3px 0 0 16px;
    border-bottom: 4px solid #d1dfe5;
    background: #d8e4e9 url(../img/icon_add.png) no-repeat 18px 58%;
}

	a.btn-gry.add-btn:hover {
		background: #d1dfe5 url(../img/icon_add.png) no-repeat 18px 58%;
	}

.f_tel1			{width: 50px !important;}
.f_zip1			{width: 30px !important;}
.f_zip2			{width: 50px !important;}
.f_address		{width:500px !important;}
.f_name_		{width: 150px !important;}
.f_mail			{width:295px !important;}

</style>

<script>
$(function (){

	// 「CC」追加
	$("#add_cc").click(function(){
		var template = Handlebars.compile($('#mailcc-row-template').html());
		$("#cc_area").append(template({}));
	});

	// 「CC」削除
	$(document).on('click', '.del_cc', function(){
		if(window.confirm('削除しますがよろしいですか')){
			$(this).parent("div").remove();
		}
	});

	// 「サービス/商品名」追加
	$("#add_service").click(function(){
		var template = Handlebars.compile($('#service-row-template').html());
		$('#service_area').append(template({}));
	});

	// 「サービス/商品名」削除
	$(document).on('click', '.del_service', function(){
		$(this).parent("div").remove();
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
				<h3>企業アカウント新規発行・登録</h3>
			</div>
		</div>
		<!-- 見出し[end] -->

		<!-- エラー出力箇所 -->
		{include file="./common/error.tpl"}
		
		<!-- 登録メッセージ出力箇所 -->
		{if $registMessage} 
			<p class="attention">{$registMessage}</p>
		{/if}
		
		<form action="profile" method="post">
		
			<!-- 表組み[start] -->
			<div class="article-box mgn-t15">
				<table class="layout input-tbl">
					<tr>
						<th>ID</th>
						<td>
							{$form.client_id}
							<input type="hidden" class="f_hp" name="pclient_id" value="{$form.client_id}" />
						</td>
					</tr>
					<tr>
						<th>企業名<span class="must"><span>必須</span></span></th>
						<td class="txtinp">
							<input type="text" class="f_name" name="client_name" value="{$form.client_name|escape}" />
						</td>
					</tr>
					<tr>
						<th>企業コード</th>
						<td class="txtinp">
							<input type="text" class="f_zip2" name="client_enterprise_code" value="{$form.client_enterprise_code|escape}" />
						</td>
					</tr>
<!--
					<tr>
						<th>フリガナ<span class="must"><span>必須</span></span></th>
						<td class="txtinp">
							<input type="text" class="f_name" name="client_namepy" value="{$form.client_namepy|escape}" />
						</td>
					</tr>
-->
					<tr>
						<th>住所<span class="must"><span>必須</span></span></th>
						<td class="txtinp td_inner_wrap">
							<div>
								<input type="text" class="f_zip1" name="client_postcode1" value="{$form.client_postcode1|escape}" /> -
								<input type="text" class="f_zip2" name="client_postcode2" value="{$form.client_postcode2|escape}" />
							</div>
							<div class="mgn-t5">
								<input type="text" class="f_address" name="client_address" value="{$form.client_address|escape}" />
							</div>
						</td>
					</tr>
					<tr>
						<th>電話番号</th>
						<td class="txtinp">
							<input type="text" class="f_tel1" name="client_tel1" value="{$form.client_tel1|escape}"/> -
							<input type="text" class="f_tel1" name="client_tel2" value="{$form.client_tel2|escape}"/> -
							<input type="text" class="f_tel1" name="client_tel3" value="{$form.client_tel3|escape}"/>
						</td>
					</tr>
					<tr>
						<th>FAX番号</th>
						<td class="txtinp">
							<input type="text" class="f_tel1" name="client_fax1" value="{$form.client_fax1|escape}"/> -
							<input type="text" class="f_tel1" name="client_fax2" value="{$form.client_fax2|escape}"/> -
							<input type="text" class="f_tel1" name="client_fax3" value="{$form.client_fax3|escape}"/>
						</td>
					</tr>
					<tr>
						<th>代表者名<span class="must"><span>必須</span></span></th>
						<td class="txtinp">
							<input type="text" class="f_name_" name="client_staffleaderfirstname" value="{$form.client_staffleaderfirstname|escape}" />
							<input type="text" class="f_name_" name="client_staffleaderlastname" value="{$form.client_staffleaderlastname|escape}" />
						</td>
					</tr>
<!--
					<tr>
						<th>フリガナ</th>
						<td class="txtinp">
							<input type="text" class="f_name_" name="client_staffleaderfirstnamepy" value="{$form.client_staffleaderfirstnamepy|escape}" />
							<input type="text" class="f_name_" name="client_staffleaderlastnamepy" value="{$form.client_staffleaderlastnamepy|escape}" />
						</td>
					</tr>
-->
					<tr>
						<th>代表者メールアドレス<span class="must"><span>必須</span></span></th>
						<td class="txtinp">
							<input type="text" class="f_mail" name="client_staffleaderemail" value="{$form.client_staffleaderemail|escape}" />
						</td>
					</tr>
<!--
					<tr>
						<th>HP</th>
						<td class="txtinp">
							<input type="text" class="f_hp" name="client_homepage" value="{$form.client_homepage|escape}" />
						</td>
					</tr>
					<tr>
						<th>業界・業種</th>
						<td>
							{foreach from=$categoryList item=category}
								{if $category.category1_name}
									{$category.category1_name}
								{/if}
								{if $category.category2_name}
									 &nbsp;>&nbsp;{$category.category2_name}
								{/if}
								{if $category.category3_name}
									 &nbsp;>&nbsp;{$category.category3_name}
								{/if}
								<br>
							{/foreach}
						</td>
					</tr>
					<tr>
						<th>サービス/商品名<span class="must"><span>必須</span></span></th>
						<td class="txtinp td_inner_wrap">
							<div id="service_area">
								{if $aliveServiceList|@count > 0 || $newServiceList|@count > 0}
									{foreach from=$aliveServiceList item=row name=service}
										<div class="mgn-t2">
											<input type="text" id="service_name" class="f_mail" name="alive_service_name[{$row.id}]" value="{$row.service_name}" />
											{if $row.project_relation == '0'}
												<label><input type="checkbox" name="del_service[{$row.id}]" value='1' {if array_key_exists($row.id, $delServiceList) }checked{/if} /> 削除</label>
											{/if}
										</div>
									{/foreach}
									{foreach from=$newServiceList item=row name=service}
										<div class="mgn-t2">
											<input type="text" id="service_name" class="f_mail" name="new_service_name[]" value="{$row}" />
											{if $newServiceList|@count > 0 || !$smarty.foreach.service.first}
												<a href="javascript:void(0);" class="del_service deleteRow">
													<img src="/img/btn_del.png" height="40" width="40">
												</a>
											{/if}
										</div>
									{/foreach}
								{else}
									<div>
										<input type="text" id="service_name" class="f_mail" name="new_service_name[]" value="" />
									</div>
								{/if}
							</div>
							<a href="javascript:void(0);" id="add_service" class="btn-gry add-btn mgn-t10">追加</a>
						</td>
					</tr>
					{if in_array($user.staff_role, array("AA_1", "AA_2", "CE_1", "CE_2")) }
						<tr>
							 <th>メールCC先</th>
							 <td class="txtinp td_inner_wrap">
								 <div id="cc_area">
									 {foreach from=$client.cc_list item=cc}
									    {if $editable_cc_list}

										    {if $cc.id == null}
										         {* 未登録 *}
										        <div class="mgn-t2">
										        	<input type="text" class="f_mail" name="append_cc[]" value="{$cc.address}" />
											    	<a href="javascript:void(0);" class="del_cc deleteRow">
														<img src="/img/btn_del.png" height="40" width="40">
													</a>
										        </div>
										    {else}
										        {* 登録済み *}
										        <div class="mgn-t2">
											    	<input type="text" class="f_mail" name="cc[{$cc.id}]" value="{$cc.address}" />
											    	<a href="javascript:void(0);" class="del_cc deleteRow">
														<img src="/img/btn_del.png" height="40" width="40">
													</a>
										    	</div>
										    {/if}

									    {else}
									    	{$cc.address}<br>
									    {/if}
		   							{/foreach}
	    					    </div>
							    {if $editable_cc_list}
    								<a href="javascript:void(0);" id="add_cc" class="btn-gry add-btn mgn-t10">追加</a>
    							{/if}
    					    </td>
						</tr>
					{/if}
-->
					<tr>
						<th>担当メンバーID</th>
						<td><a href="/setting-account/member-list" class="txtlink"><span>選択する&nbsp;&gt;</span></a></td>
					</tr>
				</table>
				
				<div class="area2btn mgn-t20">
					<input type="submit" class="btn large2" value="登録する"  />
				</div>
			</div>
			<!-- 表組み[end] -->
			
		</form>

	</div>
	<!-- メインコンテンツ[end] -->

</div>
<!-- コンテンツ領域[end] -->

{literal}

<!-- 新規のサービス/商品名行テンプレート -->
<script id="service-row-template" type="text/x-handlebars-template">
<div class="mgn-t2">
	<input type="text" id="service_name" class="f_mail" name="new_service_name[]" value="" />
	<a href="javascript:void(0);" class="del_service deleteRow">
		<img src="/img/btn_del.png" height="40" width="40">
	</a>
</div>
</script>

<!-- 新規のメールCC行テンプレート -->
<script id="mailcc-row-template" type="text/x-handlebars-template">
<div class="mgn-t2">
	<input type="text" class="f_mail" name="append_cc[]" id="cc"/>
	<a href="javascript:void(0);" class="del_cc deleteRow">
		<img src="/img/btn_del.png" height="40" width="40">
	</a>
</div>
</script>

{/literal}

{include file="./common/footer.tpl"}