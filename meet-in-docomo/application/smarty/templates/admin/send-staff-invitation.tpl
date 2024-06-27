{include file="./common/header.tpl"}

{literal}

<script>

</script>

<style type="text/css">
<!--


.mi_main_wrap {
	padding: 39px 24px 49px 24px;
	background: #FFFFFF 0% 0% no-repeat padding-box;
}

.description {
	font: normal normal normal 14px/8px Hiragino Sans;
	letter-spacing: 0px;
	color: #333333;
	font-weight: 300;
}

.attention.top{
	font: normal normal 300 14px/8px Hiragino Sans;
	letter-spacing: 0px;
	color: #FF0F12;
	line-height: 1.3;
	margin-top: 8px;
	display: flex;
}

.attention.top:before {
	content: "※";
}

.mi_main_wrap form {
	margin-top: 40px;
}

form .input {
	width: 400px;
	height: 40px;
	border: 1px solid #ABABAB;
	border-radius: 2px;
	box-sizing: border-box;
	padding: 14px;
}

form .button {
	width: 160px;
	height: 40px;
	color: #ffff;
	background-color: #0081CC;
	border: unset;
	border-radius: 3px;
	font-size: 16px;
	margin-left: 12px;
}

.flex {
	display: flex;
	margin-top: 12px;
}

.attention.bottom {
	margin-top:  12px;
	font: normal normal 300 12px/8px Hiragino Sans;
	letter-spacing: 0px;
	color: #FF0F12;
}





-->
</style>

{/literal}


<!-- メインコンテンツ start -->
<div id="mi_main_contents">
	<!-- トップナビ start -->
	<div id="mi_top_nav" class="acount_manage_on">
		<ul>
			{if ($user.staff_type == 'AA')}
			<li class="mi_select">
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
			{* <li class="">
				<a href="/admin/distributor-list" class="hvr-underline-from-center">
					<span class="icon-company mi_default_label_icon"></span>
					<div class="">販売店管理</div>
				</a>
			</li> *}
			{/if}
		</ul>

		<!-- パンくずリスト start -->
		<div class="mi_breadcrumb_list">
			<a href="/index/menu">TOP</a>&nbsp;&gt;&nbsp;
			ユーザー招待
		</div>
		<!-- パンくずリスト end -->

	</div>
	<!-- トップナビ end -->

	<!-- コンテンツエリア start -->
	<div id="mi_content_area">

		<!-- コンテンツタイトル start -->
		<div class="mi_content_title">
			<h1>ユーザー招待</h1>
		</div>
		<!-- コンテンツタイトル end -->

		<!-- エラーメッセージ表示エリア begin -->
		{if $errorList|@count gt 0}
		<p class="errmsg mb10" style="color: red; margin-bottom: 10px;">
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
		{if $processedList|@count gt 0}
		<p class="errmsg mb10" style="color: red; margin-bottom: 10px;">
		招待メールを送信しました。<br />
			<strong>
				{foreach from=$processedList item=mess}
					{foreach from=$mess item=row}
						{$row}<br>
					{/foreach}
				{/foreach}
			</strong>
		</p>
		{/if}
		<!-- エラーメッセージ表示エリア end -->
		<div class="mi_main_wrap">
			<div class="description">利用する方のビジネスdアカウントを設定してください </div>
			<div class="attention top">ビジネスdアカウントが、メールアドレス形式でない場合は<br>ビジネスdアカウントに登録している連絡先メールアドレスを指定してください。</div>

			<form action="/admin/send-staff-invitation?{$staffDict.addURL}" method="post">
				<span class="name">ビジネスdアカウント</span>
				<div class="flex">
					<input type="text"  class="input"  name="emails" placeholder="aaa@example.com;bbb@example.com" value="{$emails}">
					<input type="submit" class="button" value="送信">
				</div>
				<div class="attention bottom">※ 複数入力時はセミコロン(;)で区切ってください。</div>
			</form>
		</div>


	</div>
	<!-- コンテンツエリア end -->

</div>
<!-- メインコンテンツ end -->

{include file="./common/footer.tpl"}