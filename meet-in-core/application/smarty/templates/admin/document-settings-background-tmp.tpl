{include file="./common/header.tpl"}

{literal}

<script>
$(function() {
	$('.tab_btn').click(function() {
		var index = $('.tab_btn').index(this);
		$('.tab_btn').removeClass('active');
		$(this).addClass('active');
		$('.tab_content').removeClass('show').eq(index).addClass('show');
	});
});
</script>

<link rel="stylesheet" href="/css/bodypix_dialog.css?{$application_version}">
<style type="text/css">

#file_img {
	max-width: 155px;
    height: 100px;
    margin: 10px 10px;
    border: solid 1px #c8c8c8;
    min-width: 155px;
    min-height: 120px;
}

#button_area {
	float: right;
    margin-right: 236px;
	margin-top: 50px;
}

#file_select {
    color: #555;
    background-color: white;
    font-size: 15px;
	border: solid 1px #e8e8e8;
	margin-left: 15px;
	cursor: pointer;
}

.mi_content_title .title_link_btn {
	float: right;
	background-color: #fa0;
	color: #fff;
	padding: 10px 22px 10px 12px;
	cursor: pointer;
}

#btn_cancel {
	background: #e1e1e1;
    color: #555;
}

#table_title {
	line-height: 152px;	
	margin-right: 53px;
}

#btn_cancel {
	background: #e1e1e1;
    color: #555;
}

#table_row_blank {
    width: 50px;
    min-width: 50px;
    padding: 0;
    background: #fff;
    border-right: 1px solid #e8e8e8;
    color: #6e6e6e;	
}

#table_row_title {
	width: 166px;
    color: #333;
    text-align: left;
    vertical-align: middle;
    font-weight: normal;
    background: #fff;
    border-right: 1px solid #e8e8e8;
	padding-left: 20px;	
}

#table_row_content {
	background: white;
}

#file_select_icon {
	color: #FFAA0E;
}

.sub_title {
	margin-bottom: 60px;
	width: 500px;
}
.sub_title_detail {
	font-size: 13px;
}

.tab_btn_wrap {
	border-left: 1px solid #DDD;
}
.tab_btn {
	padding: 15px;
	line-height: 1;
	box-sizing: border-box;
	border: 1px solid #DDD;
	border-bottom: none;
	border-left: none;
	background: #fff;
	text-align: center;
	width: 200px;
	float: left;
}
.tab_btn.active {
	background: #FFE1A0;
}

.tab_content {
	display: none;
}
.tab_content.show {
  display: block;
}

.tab_content_block {
	box-sizing: border-box;
	float: left;
	border: 1px solid #DDD;
	background: #fff;
	text-align: center;
	width: 200px;
}

.tab_content_title {
	font-size: 14px;
	font-weight: bold;
}

.tab_content_title_wrap {
	padding-top: 15px;
	margin-bottom: 25px;
}
.tab_content_title_disc {
	font-size: 11px;
}

.tab_content_img_wrap {
	margin-bottom: 25px;
	height: 115px;
}
.tab_content_img {
	height: 115px;
	border: 1px solid #707070;
}

.tab_content_dlbtn_wrap .tab_content_dlbtn {
	border-top: 1px solid #FF9E12;
	display: block;
	color: #FF9E12;
	padding: 9px;
	width: 145px;
	margin: 0 auto;
}

.mi_tabel_btn_area .mi_default_button {
	display: block;
	background-color: #fa0;
	color: #fff;
	padding: 10px 22px 10px 12px;
	cursor: pointer;
	height: auto;
	margin: 0 auto;
}


</style>

{/literal}

<div id="mi_main_contents">
	<!-- トップナビ  start -->
	<div id="mi_top_nav">
		<!-- パンくずリスト start -->
		<div class="mi_breadcrumb_list">
			<a href="/index/menu">TOP</a>&nbsp;&gt;&nbsp;
			<a href="/admin/document-settings-background">背景テンプレートダウンロード</a>
		</div>
		<!-- パンくずリスト end -->
	</div>
	<!-- トップナビ end -->

	<!-- コンテンツエリア start -->
	<div id="mi_content_area">
		<!-- コンテンツタイトル start -->
		<div class="mi_content_title">
			<span class="icon-parsonal mi_content_title_icon"></span>
			<h1>背景テンプレートダウンロード</h1>
			<a class="title_link_btn" href="/img/background_pptx/background_all.zip" target="_blank">一括ダウンロード</a>
		</div>
		<p class="sub_title">ダウンロードしたテンプレートはPowerPointで会社名、役職、名前部分を お好きな名称に変更することができます。<br>
		変更したファイルはpng形式で保存し、アップロードしてください。 
		<span class="sub_title_detail">※PowerPointファイルに保存方法の手順を記載しておりますのでご参照ください。</span></p>
		<!-- コンテンツタイトル end -->

		<div class="tab_btn_wrap mi_clearfix">
			<div class="tab_btn active">全件表示</div>
			<!-- <div class="tab_btn">シンプル名刺</div>
			<div class="tab_btn">その他</div> -->
		</div>
		<div class="tab_content show mi_clearfix">
			<div class="tab_content_block">
				<div class="tab_content_title_wrap">
					<p class="tab_content_title">スタンダード(オレンジ)</p>
					<span class="tab_content_title_disc">ファイルサイズ / 825KB</span>
				</div>
				<div class="tab_content_img_wrap">
					<img src="/img/background_pptx/bk_img_03_07.png" class="tab_content_img">
				</div>
				<div class="tab_content_dlbtn_wrap">
					<a href="/img/background_pptx/pptx/名刺風背景_simple-orange.zip" target="_blank" class="tab_content_dlbtn">ダウンロード</a>
				</div>
			</div>
			<div class="tab_content_block">
				<div class="tab_content_title_wrap">
					<p class="tab_content_title">スタンダード(赤)</p>
					<span class="tab_content_title_disc">ファイルサイズ / 825KB</span>
				</div>
				<div class="tab_content_img_wrap">
					<img src="/img/background_pptx/bk_img_03_04.png" class="tab_content_img">
				</div>
				<div class="tab_content_dlbtn_wrap">
					<a href="/img/background_pptx/pptx/名刺風背景_simple-red.zip" target="_blank" class="tab_content_dlbtn">ダウンロード</a>
				</div>
			</div>
			<div class="tab_content_block">
				<div class="tab_content_title_wrap">
					<p class="tab_content_title">スタンダード(青)</p>
					<span class="tab_content_title_disc">ファイルサイズ / 825KB</span>
				</div>
				<div class="tab_content_img_wrap">
					<img src="/img/background_pptx/bk_img_03_05.png" class="tab_content_img">
				</div>
				<div class="tab_content_dlbtn_wrap">
					<a href="/img/background_pptx/pptx/名刺風背景_simple-blue.zip" target="_blank" class="tab_content_dlbtn">ダウンロード</a>
				</div>
			</div>
			<div class="tab_content_block">
				<div class="tab_content_title_wrap">
					<p class="tab_content_title">スタンダード(グレー)</p>
					<span class="tab_content_title_disc">ファイルサイズ / 825KB</span>
				</div>
				<div class="tab_content_img_wrap">
					<img src="/img/background_pptx/bk_img_03_06.png" class="tab_content_img">
				</div>
				<div class="tab_content_dlbtn_wrap">
					<a href="/img/background_pptx/pptx/名刺風背景_simple-gray.zip" target="_blank" class="tab_content_dlbtn">ダウンロード</a>
				</div>
			</div>
			<div class="tab_content_block">
				<div class="tab_content_title_wrap">
					<p class="tab_content_title">波型背景</p>
					<span class="tab_content_title_disc">ファイルサイズ / 825KB</span>
				</div>
				<div class="tab_content_img_wrap">
					<img src="/img/background_pptx/bk_img_03_01.png" class="tab_content_img">
				</div>
				<div class="tab_content_dlbtn_wrap">
					<a href="/img/background_pptx/pptx/名刺風背景_波.zip" target="_blank" class="tab_content_dlbtn">ダウンロード</a>
				</div>
			</div>
			<div class="tab_content_block">
				<div class="tab_content_title_wrap">
					<p class="tab_content_title">シック背景</p>
					<span class="tab_content_title_disc">ファイルサイズ / 825KB</span>
				</div>
				<div class="tab_content_img_wrap">
					<img src="/img/background_pptx/bk_img_03_09.png" class="tab_content_img">
				</div>
				<div class="tab_content_dlbtn_wrap">
					<a href="/img/background_pptx/pptx/名刺風背景_シック系黒.zip" target="_blank" class="tab_content_dlbtn">ダウンロード</a>
				</div>
			</div>
			<div class="tab_content_block">
				<div class="tab_content_title_wrap">
					<p class="tab_content_title">水玉背景</p>
					<span class="tab_content_title_disc">ファイルサイズ / 825KB</span>
				</div>
				<div class="tab_content_img_wrap">
					<img src="/img/background_pptx/bk_img_03_02.png" class="tab_content_img">
				</div>
				<div class="tab_content_dlbtn_wrap">
					<a href="/img/background_pptx/pptx/名刺風背景_水玉.zip" target="_blank" class="tab_content_dlbtn">ダウンロード</a>
				</div>
			</div>
			<div class="tab_content_block">
				<div class="tab_content_title_wrap">
					<p class="tab_content_title">シック(青)背景</p>
					<span class="tab_content_title_disc">ファイルサイズ / 825KB</span>
				</div>
				<div class="tab_content_img_wrap">
					<img src="/img/background_pptx/bk_img_03_08.png" class="tab_content_img">
				</div>
				<div class="tab_content_dlbtn_wrap">
					<a href="/img/background_pptx/pptx/名刺風背景_シック系青.zip" target="_blank" class="tab_content_dlbtn">ダウンロード</a>
				</div>
			</div>
		</div>
		
		<div class="mi_tabel_btn_area">
			<a href="/admin/document-settings-background" id="btn_submit" class="mi_default_button mi_btn_m mi_btn_m hvr-fade click-fade">
			背景設定画面に戻る
			</a>
		</div>

	</div>
	<!-- コンテンツエリア end -->
	
	<input type="hidden" id="bodypix_background_path" name="bodypix_background_path" value="{$bodypix_background_path}">	
	<input type="hidden" id="bodypix_internal_resolution" name="bodypix_internal_resolution" value="{$bodypix_internal_resolution}">
	<input type="hidden" id="bodypix_segmentation_threshold" name="bodypix_segmentation_threshold" value="{$bodypix_segmentation_threshold}">
	<input type="hidden" id="bodypix_mask_blur_amount" name="bodypix_mask_blur_amount" value="{$bodypix_mask_blur_amount}">

</div>
<!-- メインコンテンツ end -->

{include file="./common/footer.tpl"}
