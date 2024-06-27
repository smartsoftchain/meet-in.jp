{include file="./common/header.tpl"}

{literal}

<style>

.calendar img.ui-datepicker-trigger {
    vertical-align: middle;
    margin-left: 10px;
}

</style>

<script src="/js/mock.js?{$application_version}"></script>
<script>
$(function (){

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
				<h3>通話ログ一覧</h3>
				<h4>
					<a href="#" class="bookmark-modal-trigger btn-gry mid2">
						<span class="istar">このページをブックマーク</span>
					</a>
				</h4>
			</div>
		</div>
		<!-- 見出し[end] -->

		<!-- 検索窓[start] -->
		<div class="searching over mgn-t40">
			<div class="input-area clearfix">
				<input id="keyword" type="text" name="keyword" placeholder="検索したいワードを入力してください" value="">
				<a href="#" class="btn srch"><span>検索</span></a>
			</div>
		</div>
		<!-- 検索窓[end] -->

		<!-- 入力領域[start] -->
		<div class="searching-area pd-0 mgn-t30">

		</div>
		<!-- 入力領域[end] -->

		<!-- ログダウンロードボタン・ページング[start] -->
		<div class="article-2clm clearfix mgn-t10">
			<div class="lft">
				<div class="target-num">
					<p>該当件数<span>00000</span>件</p>
					<p><a href="#" class="btn-drk mid"><span>CSVダウンロード</span></a></p>
				</div>
			</div>
			<div class="rgt clearfix mgn-t10">
				<div class="paging-area">
					<div class="display-num">
						<span>表示件数</span>
						<select name="display-num">
							<option value="20">20</option>
							<option value="50">50</option>
							<option value="50">100</option>
						</select>
					</div>
					<!-- ページング[start] -->
					<div class="paging">
						<ul>
							<li class="prev disable"><a href="#"><span>&lt;</span></a></li>
							<li class="current"><a href="#"><span>1</span></a></li>
							<li><a href="#"><span>2</span></a></li>
							<li><a href="#"><span>3</span></a></li>
							<li><a href="#"><span>4</span></a></li>
							<li><a href="#"><span>5</span></a></li>
							<li class="next"><a href="#"><span>&gt;</span></a></li>
						</ul>
					</div>
					<!-- ページング[end] -->
				</div>
			</div>
		</div>
		<!-- ログダウンロードボタン・ページング[end] -->

		<!-- ====================================== 一覧表領域[start] ====================================================== -->
		<div class="list-table-area mgn-t10">

			<!-- 一覧表[start] -->
			<div class="list-body wfix1">

				<table class="listtable th-c td-l">
          <thead>
            <tr>
  						<th class="sort">
  							<div>
  								<p>ID</p>
  								<p><a href="#"><span class="ascending"></span></a><a href="#"><span class="descending"></span></a></p>
  							</div>
  						</th>
  						<th class="sort">
  							<div>
  								<p>企業情報</p>
  								<p><a href="#"><span class="ascending"></span></a><a href="#"><span class="descending"></span></a></p>
  							</div>
  						</th>
  						<th class="sort">
  							<div>
  								<p>発信者</p>
  								<p><a href="#"><span class="ascending"></span></a><a href="#"><span class="descending"></span></a></p>
  							</div>
  						</th>
  						<th class="sort">
  							<div>
  								<p>発信者ID</p>
  								<p><a href="#"><span class="ascending"></span></a><a href="#"><span class="descending"></span></a></p>
  							</div>
  						</th>
  						<th class="sort">
  							<div>
  								<p>発信開始時刻</p>
  								<p><a href="#"><span class="ascending"></span></a><a href="#"><span class="descending"></span></a></p>
  							</div>
  						</th>
  						<th class="sort">
  							<div>
  								<p>発信先番号</p>
  								<p><a href="#"><span class="ascending"></span></a><a href="#"><span class="descending"></span></a></p>
  							</div>
  						</th>
  						<th class="sort">
  							<div>
  								<p>架電結果</p>
  								<p><a href="#"><span class="ascending"></span></a><a href="#"><span class="descending"></span></a></p>
  							</div>
  						</th>
  						<th class="sort">
  							<div>
  								<p>通話時間</p>
  								<p><a href="#"><span class="ascending"></span></a><a href="#"><span class="descending"></span></a></p>
  							</div>
  						</th>
  					</tr>
          </thead>
          <tbody>
            <tr>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  					</tr>
  					<tr>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  					</tr>
  					<tr>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  					</tr>
  					<tr>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  					</tr>
  					<tr>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  					</tr>
  					<tr>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  					</tr>
  					<tr>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  					</tr>
  					<tr>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  					</tr>
  					<tr>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  					</tr>
  					<tr>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  					</tr>
  					<tr>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  					</tr>
  					<tr>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  						<td>　</td>
  					</tr>            
          </tbody>
				</table>

			</div>
			<!-- 一覧表[end] -->

		</div>
		<!-- ====================================== 一覧表領域[end] ====================================================== -->

		<!-- 該当件数・ページング[start] -->
		<div class="article-2clm clearfix mgn-t7">
			<div class="lft">
				<div class="target-num">
					<p>該当件数<span>00000</span>件</p>
				</div>
			</div>

			<div class="rgt clearfix">
				<div class="paging-area">
					<div class="display-num">
						<span>表示件数</span>
						<select name="display-num">
							<option value="20">20</option>
							<option value="50">50</option>
							<option value="50">100</option>
						</select>
					</div>
					<!-- ページング[start] -->
					<div class="paging">
						<ul>
							<li class="prev disable"><a href="#"><span>&lt;</span></a></li>
							<li class="current"><a href="#"><span>1</span></a></li>
							<li><a href="#"><span>2</span></a></li>
							<li><a href="#"><span>3</span></a></li>
							<li><a href="#"><span>4</span></a></li>
							<li><a href="#"><span>5</span></a></li>
							<li class="next"><a href="#"><span>&gt;</span></a></li>
						</ul>
					</div>
					<!-- ページング[end] -->
				</div>
			</div>
		</div>
		<!-- 作業選択・ページング[end] -->


	</div>
	<!-- メインコンテンツ[end] -->

</div>
<!-- コンテンツ領域[end] -->

<!-- ====================================== 担当者モーダルコンテンツ[start] ====================================== -->
<div id="staff-modal-content" class="modal-content">
	<div class="inner-wrap">

	</div>
</div>
<!-- ====================================== 担当者モーダルコンテンツ[start] ====================================== -->

{literal}

<!-- 担当者モーダルテンプレート -->
<script id="staff-modal-template" type="text/x-handlebars-template">
<h5>担当者選択</h5>
<div class="modal_search_area mgn-t10 mgn-b10 clearfix">
	<input type="text" id="free_word" class="keyword-s" placeholder="名前を検索" />
	<button class="btn srch-s" id="on_free_word">検索</button>
</div>
<div class="list-area hgt3" style="height: calc(100% - 155px);">
	<table class="listtable">
    <thead>
      <tr>
  			<th>選択</th>
  			<th>担当者</th>
  		</tr>
    </thead>
    <tbody>
      {{#each staffList}}
  			<tr class="idsselect">
  				<td>
  					<input type="checkbox" id="staff_id_{{staff_id}}" name="staff_id[]" value="{{staff_id}}"  />
  					<input type="hidden" id="staff_name_{{staff_id}}" name="user_name" value="{{staff_name}}" />
  				</td>
  				<td id="name">{{staff_name}}</td>
  			</tr>
  		{{/each}}
    </tbody>
	</table>
</div>
<div class="area2btn mgn-t15">
	<a class="modal-close"><span>閉じる</span></a>
	<a href="javascript:void(0)" class="btn large2" id="decision"><span>選択する</span></a>
</div>
</script>

{/literal}

<!-- ブックマークモーダル -->
{include file="./common/bookmark.tpl"}

{include file="./common/footer.tpl"}
