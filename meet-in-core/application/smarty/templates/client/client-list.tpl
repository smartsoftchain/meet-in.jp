{include file="./common/header.tpl"}

{literal}

<script>
	$(function (){
		// クライアントを選択するボタンのイベント
		$("*[name=submit_link]").click(function(){
			$('#client_form').submit();
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
				<h3>企業アカウント一覧</h3>
			</div>
		</div>
		<!-- 見出し[end] -->

		<!-- 記事（2カラム）[start] -->
		<div class="article-2clm clearfix">
<!--
			<div class="lft">
				<p class="mgn-t5">作業対象となるクライアントを選択してください。</p>
				{if $user.staff_role == "AA_1" || $user.staff_role == "AA_2"}
					<p class="mgn-t15">
						{if $retrievalType == "1"}
							<a href="/client/client-list?retrievalType=2" class="txtlink"><span>すべてのクライアントを表示する&nbsp;&gt;</span></a>
						{elseif $retrievalType == "2"}
							<a href="/client/client-list?retrievalType=1" class="txtlink"><span>担当クライアントのみ表示する&nbsp;&gt;</span></a>
						{/if}
					</p>
				{/if}
			</div>
-->
			<div class="rgt">
				<!-- 検索窓[start] -->
				<div class="searching">
					<div class="input-area clearfix">
						<form action="/client/client-list" method="get">
							<input id="keyword" type="text" name="free_word" placeholder="検索したい項目を入力してください" value="{$freeWord}">
							<input type="submit" class="btn srch" value="検索">
						</form>
					</div>
					<p class="cmnt-s">クライアントID、クライアント名、電話番号、メールアドレスなどから検索してください。</p>
				</div>
				<!-- 検索窓[end] -->
			</div>
		</div>
		<!-- 記事（2カラム）[end] -->

		<!-- クライアント選択ボタン・ページング[start] -->
		<div class="article-2clm clearfix mgn-t40">
<!--
			<div class="lft">
				<div class="target-num">
					<p>該当件数<span>{$list->getCount()}</span>件</p>
					<p><a href="javascript:void(0);" class="btn mid" name="submit_link"><span>クライアントを選択する</span></a></p>
				</div>
			</div>
-->
			<div class="rgt clearfix">
				<div class="paging-area">
					<div class="display-num">
						<span>表示件数</span>
						{$list->getPerPage()}
					</div>
					<!-- ページング[start] -->
					<div class="paging">
						{$list->getLink()}
					</div>
					<!-- ページング[end] -->
				</div>
			</div>
		</div>
		<!-- クライアント選択ボタン・ページング[end] -->

		<!-- ====================================== 一覧表領域[start] ====================================================== -->
		<div class="list-table-area mgn-t10">
			<!-- モニタリングリスト[start] -->
			<div class="list-body wfix1">
				<form action="/client/client-list" method="post" id="client_form">
					<table class="listtable th-c td-l">
						<thead>
							<tr>
								<th class="btncel">編集</th>
								<th class="sort">{$list->getOrderArrow('ID', 'client_id')}</th>
								<th class="sort">{$list->getOrderArrow('会社名', 'client_name')}</th>
								<th class="sort">{$list->getOrderArrow('電話番号', 'client_tel1')}</th>
								<th class="sort">{$list->getOrderArrow('メールアドレス', 'client_staffleaderemail')}</th>
							</tr>
						</thead>
						<tbody>
							{foreach from=$list->getList() item=row}
								<tr>
									<td class="btncel"><a href="/setting-account/profile?pclient_id={ $row.client_id }"><img src="/img/btn_edt.png"></a></td>
									<td>CA{$row.client_id|string_format:"%05d"}</td>
									<td>{$row.client_name}</td>
									<td>{$row.client_tel1}-{$row.client_tel2}-{$row.client_tel3}</td>
									<td>{$row.client_staffleaderemail}</td>
								</tr>
							{/foreach}
						</tbody>
					</table>
				</form>
			</div>
			<!-- クライアント一覧[end] -->

		</div>
		<!-- 一覧表領域（インラインフレーム）[end] -->

		<!-- クライアント選択ボタン・ページング[start] -->
		<div class="article-2clm clearfix mgn-t0" style="margin-top: 10px;">
			<div class="lft">
				<div class="target-num">
					<p>該当件数<span>{$list->getCount()}</span>件</p>
					<p><a href="javascript:void(0);" class="btn mid" name="submit_link"><span>クライアントを選択する</span></a></p>
				</div>
			</div>

			<div class="rgt clearfix">
				<div class="paging-area">
					<div class="display-num">
						<span>表示件数</span>
						{$list->getPerPage()}
					</div>
					<!-- ページング[start] -->
					<div class="paging">
						{$list->getLink()}
					</div>
					<!-- ページング[end] -->
				</div>
			</div>
		</div>
		<!-- クライアント選択ボタン・ページング[end] -->

	</div>
	<!-- メインコンテンツ[end] -->

</div>
<!-- コンテンツ領域[end] -->


<!-- ブックマークモーダル -->
{include file="./common/bookmark.tpl"}

{include file="./common/footer.tpl"}
