{include file="./common/header.tpl"}

<script src="/js/webinar.js?{$application_version}"></script>
<script src="/src/colorpicker/colorpicker.js"></script>
<link rel="stylesheet" href="/css/webinar.css?{$application_version}">
<link rel="stylesheet" href="/src/colorpicker/css/colorpicker.css">
{literal}
<script>
$(function (){
});

</script>
{/literal}

<!-- メインコンテンツ start -->
<div id="mi_main_contents">

	<!-- コンテンツエリア start -->
	<div id="mi_content_area">

		<!-- コンテンツタイトル start -->
		<div class="mi_content_title">
			<img src="/img/webinar_complete_check.png" class="wrc_title_img" alt="">
			<h1>
				<span class="wrc_title_message">
					<div>ウェビナーが作成されました</div>
					<div class="wrc_title_sub_message">詳細の編集および各画面のURLコピーは、ウェビナー一覧の各詳細ページからも可能です。</div>
				</span>
			</h1>
		</div>
		<!-- コンテンツタイトル end -->

		<div class="mi_table_main_wrap wrc_main_area">
			<div class="msg_copy_url display_none">
				<div class="msg_copy_url_message_complete">URLをコピーしました。</div>
			</div>
			<div class="wrcca_copy_area mgb_40">
				<div class="wrcca_title"><span class="wrcca_title_square">■</span>参加予約ページURL</div>
				<div class="wrcca_message">作成されたウェビナーは下記のURLから参加者の予約が可能です。URLを共有して、参加者を募集しましょう。</div>
				<div class="wrcca_url_area">
					<input type="text" class="text_long_url target_copy_url mgr_10" value="{$meetinUrl}" readonly/>
					<img src="/img/img_copy_link.png" class="wrcca_copy_image icon_copy_url" alt="" data-url="{$meetinUrl}">
				</div>
			</div>

			<div class="wrcca_copy_area">
				<div class="wrcca_title"><span class="wrcca_title_square">■</span>ウェビナー会場URL</div>
				<div class="wrcca_message">ウェビナー会場のURLです。開催日時の10分前から入場できます。</div>
				<div class="wrcca_url_area">
					<input type="text" class="text_long_url target_copy_url mgr_10" value="{$webinarUrl}" readonly/>
					<img src="/img/img_copy_link.png" class="wrcca_copy_image icon_copy_url" alt="" data-url="{$webinarUrl}">
				</div>
			</div>
		</div>
		<div class="btn_client_submit_area">
			<a href="/webinar/list"><button type="button" class="mi_default_button">一覧へ</button></a>
		</div>
	</div>
	<!-- コンテンツエリア end -->

</div>
<!-- メインコンテンツ end -->

{include file="./common/footer.tpl"}
