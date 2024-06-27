{include file="./common/header.tpl"}
	<!-- コンテンツ領域[start] -->
	<div id="content-area">
{literal}
<script>

	function clientStaffDelete( value ,staff_type) {

		if (window.confirm('対象のデータを削除します。')) {

		    var form = document.createElement( 'form' );
		    document.body.appendChild( form );
		    var input = document.createElement( 'input' );

		    input.setAttribute( 'type' , 'hidden' );
		    input.setAttribute( 'name' , 'deleteClientStaffId' );
		    input.setAttribute( 'value' , value +','+staff_type);
		    form.appendChild( input );
		    form.setAttribute( 'action' , '/setting-client-staff/client-staff' );
		    form.setAttribute( 'method' , 'post');
		    form.submit();
		}
	}

</script>
{/literal}
		<!-- メインコンテンツ[start] -->
		<div id="main_contents">
			<!-- 見出し[start] -->
			<div class="heading">
				<div class="pgtitle clearfix">
					<h3>担当者一覧</h3>
					<div style="clear:both;"></div>

					<!-- 登録完了メッセージ出力箇所 -->
					{if isset($registMsg)}
						<div class="attention">
							{$registMsg}
						</div>
					{/if}
					{if $client.client_add_staff_flg == 1}
						<h4>
							<a href="/setting-client-staff/regist" class="btn-wht large mgn-t20">
								<span class="istar">担当者新規登録</span>
							</a>
						</h4>
					{/if}
				</div>
			</div>
			<!-- 見出し[end] -->

			<!-- ページング[start] -->
			<div class="article-2clm clearfix mgn-t40">
				<div class="lft">
					<div class="target-num">
						<p>該当件数<span>{ $list->getCount() }</span>件</p>
					</div>
				</div>

				<div class="rgt clearfix">
					<div class="paging-area">
						<div class="display-num">
							<span>表示件数</span>
							{ $list->getPerPage() }

						</div>
						<!-- ページング[start] -->
						<div class="paging">
							{ $list->getLink() }
						<!-- ページング[end] -->
						</div>
					</div>
				</div>
			</div>
			<!-- ページング[end] -->
			<!-- ====================================== 一覧表領域[start] ====================================================== -->
			<div class="list-table-area mgn-t10">

				<!-- モニタリングリスト[start] -->
				<div class="list-body wfix1">
					<table class="listtable th-c td-l">
						<thead>
							<tr>
								<th class="btncel">編集</th>
								<th class="btncel">削除</th>
								<th class="sort">
									<div>
										<p>{$list->getOrderArrow('アカウントID', 'staff_id')}</p>
									</div>
								</th>
								<th class="sort">
									<div>
										<p>{$list->getOrderArrow('名前', 'staff_firstname')}</p>
									</div>
								</th>
								<th class="sort">
									<div>
										<p>{$list->getOrderArrow('フリガナ', 'staff_firstnamepy')}</p>
									</div>
								</th>
								<th class="sort">
									<div>
										<p>{$list->getOrderArrow('メールアドレス', 'staff_email')}</p>
									</div>
								</th>
								<th class="sort">
									<div>
										<p>{$list->getOrderArrow('権限', 'staff_role')}</p>
									</div>
								</th>
								<th class="sort">
									<div>
										<p>{$list->getOrderArrow('電話設定', 'call_type')}</p>
									</div>
								</th>
								<th class="sort">
									<div>
										<p>{$list->getOrderArrow('ログイン', 'login_flg')}</p>
									</div>
								</th>
							</tr>
						</thead>
						<tbody>
							{foreach from=$list->getList() item=row }
							<tr>
								<td class="btncel"><a href="/setting-client-staff/regist?client_id={ $row.client_id }&staff_type={ $row.staff_type }&staff_id={ $row.staff_id }"><img src="/img/btn_edt.png"></a></td>
								<td class="btncel">
									{if $row.auto_call_title eq '無し'}
										<a href="javascript:clientStaffDelete({ $row.staff_id },'{ $row.staff_type }')"><img src="/img/btn_del.png"></a>
									{/if}
								</td>
								<td>{ $row.account_id }</td>
								<td>{ $row.staff_name }</td>
								<td>{ $row.staff_namepy }</td>
								<td>{ $row.staff_email }</td>
								<td>{ $row.staff_role_title }</td>
								<td>{ $row.auto_call_title }</td>
								<td>{ $row.login_flg_title }</td>
							</tr>
							{/foreach}							
						</tbody>
					</table>

				</div>
				<!-- モニタリングリスト[end] -->

			</div>
			<!-- ====================================== 一覧表領域[end] ====================================================== -->

			<!-- ページング[start] -->
			<div class="article-2clm clearfix mgn-t40">
				<div class="lft">
					<div class="target-num">
						<p>該当件数<span>{ $list->getCount() }</span>件</p>
					</div>
				</div>

				<div class="rgt clearfix">
					<div class="paging-area">
						<div class="display-num">
							<span>表示件数</span>
							{ $list->getPerPage() }

						</div>
						<!-- ページング[start] -->
						<div class="paging">
							{ $list->getLink() }
						</div>
						<!-- ページング[end] -->
					</div>
				</div>
			</div>
			<!-- ページング[end] -->

		</div>
		<!-- メインコンテンツ[end] -->

	</div>
	<!-- コンテンツ領域[end] -->

<!-- ブックマークモーダル -->
{include file="./common/bookmark.tpl"}

{include file="./common/footer.tpl"}
