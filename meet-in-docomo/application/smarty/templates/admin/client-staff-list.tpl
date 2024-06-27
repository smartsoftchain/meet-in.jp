{include file="./common/adminheader.tpl"}

{literal}
<script>
$(function (){

	// 編集画面へ遷移
	$("*[name^=edit_]").click(function(){
		var ids = $(this).attr("name").split("_");
		var url = "/admin/client-staff-regist?staff_id=" + ids[1];
		$(location).attr("href", url);
	});

	// 担当者の削除処理
	$("*[name^=delete_]").click(function(){
		if(window.confirm('削除しますがよろしいですか')){
			// CE担当者削除処理を非同期にて行う
			var $staffType = "CE";
			var $staffId = $(this).attr("name").split("_")[1];
			$.ajax({
				url: "staff-delete",
				type: "POST",
				data: {staff_type : $staffType, staff_id : $staffId},
				//dataType: 'json',
				success: function(result) {
					if(result == 1){
						alert("削除に成功しました");
						location.reload();
					}else{
						alert("削除に失敗しました");
					}
				}
			});
		}
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
					<h3>CEアカウント一覧</h3>
					<h4><a href="/admin/client-staff-regist" class="btn-wht large"><span class="istar">新規登録</span></a></h4>
				</div>
				{if isset($registMsg)}
					<div class="errmsg">
						{$registMsg}
					</div>
				{/if}
			</div>
			<!-- 見出し[end] -->

			<!-- 記事（2カラム）[start] -->
			<div class="article-2clm clearfix">
					<!-- 検索窓[start] -->
					<div class="searching over">
						<div class="input-area clearfix">
							<form action="/admin/client-staff-list" method="get" >
								<input id="keyword" type="text" name="free_word" placeholder="検索したい項目を入力してください" value="{$free_word}">
								<input type="submit" class="btn srch" value="検索">
							</form>
						</div>
					</div>
					<!-- 検索窓[end] -->
			</div>
			<!-- 記事（2カラム）[end] -->

			<!-- 作業選択・ページング[start] -->
			<div class="article-2clm clearfix mgn-t40">
				<div class="lft">
					<div class="target-num">
						<p>登録済み<span>{$list->getCount()}</span>件</p>
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
			<!-- 作業選択・ページング[end] -->

			<!-- ====================================== 一覧表領域[start] ====================================================== -->
			<div class="list-table-area mgn-t10">

				<!-- モニタリングリスト[start] -->
				<div class="list-body wfix1">
					<table class="listtable th-c td-l">
						<thead>
							<tr>
								<th class="btncel">編集</th>
								<th class="btncel">削除</th>
								<th class="sort">{$list->getOrderArrow('アカウントID', 'staff_id')}</th>
								<th class="sort">{$list->getOrderArrow('名前', 'staff_name')}</th>
								<th class="sort">{$list->getOrderArrow('フリガナ', 'staff_firstnamepy')}</th>
								<th class="sort">{$list->getOrderArrow('メールアドレス', 'staff_email')}</th>
								<th class="sort">{$list->getOrderArrow('権限', 'staff_role')}</th>
								<th class="sort">{$list->getOrderArrow('WebPhoneID', 'webphone_id')}</th>
								<th class="sort">{$list->getOrderArrow('ログイン', 'login_flg')}</th>
							</tr>
						</thead>
						<tbody>
							{foreach from=$list->getList() item=row}
								<tr>
									<td class="btncel">
										<a href="javascript:void(0)" name="edit_{$row.staff_id}"><img src="/img/btn_edt.png"></a>
									</td>
									<td class="btncel">
										<a href="javascript:void(0);" name="delete_{$row.staff_id}" class="delete"><img src="/img/btn_del.png"></a>
									</td>
									<td>CE{$row.staff_id|string_format:"%05d"|escape}</td>
									<td>{$row.staff_name|escape}</td>
									<td>{$row.staff_firstnamepy|escape} {$row.staff_lastnamepy|escape}</td>
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
									<td>{$row.webphone_id|escape}<br></td>
									<td>
										{if $row.login_flg == 1}可能{/if}
										{if $row.login_flg == 0}不可{/if}
									</td>
								</tr>
							{/foreach}
						</tbody>
					</table>
				</div>
				<!-- モニタリングリスト[end] -->

			</div>
			<!-- ====================================== 一覧表領域[end] ====================================================== -->

			<!-- 作業選択・ページング[start] -->
			<div class="article-2clm clearfix mgn-t40">
				<div class="lft">
					<div class="target-num">
						<p>登録済み<span>{$list->getCount()}</span>件</p>
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
			<!-- 作業選択・ページング[end] -->

		</div>
		<!-- メインコンテンツ[end] -->

	</div>
	<!-- コンテンツ領域[end] -->

{include file="./common/adminfooter.tpl"}
