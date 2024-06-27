{include file="./common/header.tpl"}

{literal}
<script>
$(function (){

});
</script>
<style type="text/css">
<!--

.text_short{
	width:60px !important;
	display: inline-block !important;
}
.text_medium{
	width:200px !important;
	display: inline-block !important;
}
.text_long{
	width:443px !important;
	display: inline-block !important;
}

-->
</style>
{/literal}
<!-- コンテンツ領域[start] -->
<div id="content-area">

	<!-- メインコンテンツ[start] -->
	<div id="main_contents">

		<!-- 見出し[start] -->
		<div class="heading">
			<div class="pgtitle clearfix">
				<h3>お疲れ様です。<BR>ゲストとの対話を記録しましょう。</h3>
			</div>
		</div>
		<form action="/negotiation/share-regist" method="post" >
			<div class="article-box mgn-t25">

				<table class="layout folder-create">
					<tbody>
						<tr>
							<th>次回アクション</th>
							<td class="txtinp">
								<span class="margin_r5">
									<select name="next_action" id="next_action">
										<option value="0">訪問</option>
										<option value="1">オンライン商談</option>
									</select>
								</span>
							</td>
						</tr>
						<tr>
							<th>商談見込み</th>
							<td class="txtinp">
								<span class="margin_r5">
									<select name="possibility" id="possibility">
										<option value="0">ヨミ</option>
										<option value="1">ナシ</option>
									</select>
								</span>
							</td>
						</tr>
						<tr>
							<th>共有メモ</th>
							<td class="txtinp">
								<textarea name="sharing_memo" rows="3" cols="100" ></textarea>
							</td>
						</tr>
						<tr>
							<th>
								<input type="button" class="detail_open" id="detail_open" value="↓"/>
								<a data-target="db-log2" class="modal-open" style="display:none;"></a>
							</th>
						</tr>
					</tbody>
				</table>
			</div>

			<div class="article-box mgn-t25" id="test" style="display:none;">

				<table class="layout folder-create">
					<tbody>
						<tr>
							<th>メモ</th>
							<td class="txtinp">
								<textarea name="memo" rows="3" cols="100" ></textarea>
							</td>
						</tr>
						<tr>
							<th>シークレットコメント</th>
							<td class="txtinp">
								<textarea name="secret_comment" rows="3" cols="100" ></textarea>
							</td>
						</tr>
						<tr>
							<th>会社名</th>
							<td class="txtinp"><input type="text" class="text_long" name="company_name" /></td>
						</tr>
						<tr>
							<th>先方担当者名</th>
							<td class="txtinp"><input type="text" class="text_long" name="staff_name" /></td>
						</tr>
						<tr>
							<th>部署名</th>
							<td class="txtinp"><input type="text" class="text_long" name="client_service_id" /></td>
						</tr>
						<tr>
							<th>担当者・役職</th>
							<td class="txtinp"><input type="text" class="text_long" name="executive" /></td>
						</tr>
						<tr>
							<th>電話番号</th>
							<td class="txtinp">
								<input type="text" class="text_short" name="tel1" />-
								<input type="text" class="text_short" name="tel2" />-
								<input type="text" class="text_short" name="tel3" />
							</td>
						</tr>
						<tr>
							<th>FAX番号</th>
							<td class="txtinp">
								<input type="text" class="text_short" name="fax1"  />-
								<input type="text" class="text_short" name="fax2"  />-
								<input type="text" class="text_short" name="fax3"  />
							</td>
						</tr>

						<tr>
							<th>メールアドレス</th>
							<td class="txtinp"><input type="text" class="text_long" name="email" /></td>
						</tr>
					</tbody>
				</table>
			</div>

			<div class="area1btn mgn-t20">
				<input type="submit" class="btn large2" value="保存">
			</div>
		</form>
	</div>
	<!-- メインコンテンツ[end] -->

</div>
<!-- コンテンツ領域[end] -->

<!-- ====================================== モーダルコンテンツ[start] ====================================== -->
<div id="db-log2" class="modal-content">
	<div class="inner-wrap">
	</div>
	<a class="modal-close"><span>閉じる</span></a>
</div>
<!-- ====================================== モーダルコンテンツ[end] ======================================== -->

{literal}

<!-- アイドマ担当者モーダルテンプレート -->
<script id="aa-staff-modal-template" type="text/x-handlebars-template">
<h5>アイドマ担当者選択</h5>
<div class="area2btn mgn-t15">
	<a href="javascript:void(0)" class="btn large2" id="decision"><span>選択する</span></a>
</div>
</script>

{/literal}

{include file="./common/footer.tpl"}

