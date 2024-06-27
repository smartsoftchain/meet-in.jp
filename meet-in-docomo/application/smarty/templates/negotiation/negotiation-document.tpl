<!-- 資料表示領域 start -->
<div id="mi_docment_area" class="layout-0 docment_area">
	<div id="mi_docment_scroll" style="width:100%;height:100%">
		<div class='mi_docment_area_header' id='document_title_block'>
			<div class="mi_docment_area_header_left">
				<img src="/img/url-link.svg"/>
			</div>
			<div class="mi_docment_area_header_right">
				<a href='' id='document_title_area' target="_blank"></a>
			</div>
		</div>
		<div id="document_canvas_area" class="document_canvas_area" style="z-index:auto;">
			<div class="document_canvas_contents">
				<img src="" id="document_img" class="document_img"/>
				<div id="document_text_field"></div>
				<canvas id="document_canvas" class="document_canvas"></canvas>
			</div>
		</div>
		<a href="" name="download_document" download=""></a>
		<!-- zoom のスライダー表示 -->
		<div id="mi_docment_zoom">
			{literal}
			<script src="https://cdn.rangetouch.com/2.0.0/rangetouch.js"></script>
			<script>
				const inputRange = RangeTouch.setup('[type=range]')
			</script>
			{/literal}
			<div>
				<div id="document_close" class ="document_controller_btn">
					<div class="icon-close mi_btn_icon_" style="margin-top:9px"></div>
					<div class="mi_icon_text">閉じる</div>
				</div>
				<div id="document_pen_reset" class="document_controller_btn">
					<div class="icon-reset mi_btn_icon_" style="margin-top:9px"></div>
					<div class="mi_icon_text" style="font-size:8px;">リセット</div>
				</div>
				<div id="document_download" class="document_controller_btn">
					<div class="icon-download mi_btn_icon_" style="margin-top:3px"></div>
					<div class="mi_icon_text" style="font-size:9px; line-height:12px; margin-top:4px;text-align:center;">ダウン<br>ロード</div>
				</div>
				<div id="img_document_comment" class="document_controller_btn">
					<div class="icon-comment mi_btn_icon_" style="margin-top:9px"></div>
					<div class="mi_icon_text" style="font-size:9px;">コメント</div>
				</div>
				<div id="document_zoom_btn" class="document_controller_btn">
					<div class="icon-expansion mi_btn_icon_" style="margin-top:6px"></div>
					<div class="mi_icon_text" style="font-size:9px;line-height: 12px;">資料<br>拡大</div>
				</div>
			</div>
			<div id="doc_scale_zoomin" class="document_controller_btn">＋</div>
			<div id="doc_scale_range_wrapper">
				<input id="doc_scale_range" type="range" value="100" min="100" max="300" step="1">
			</div>
			<div id="doc_scale_zoomout" class="document_controller_btn">－</div>
			<div id="doc_scale_value" class="document_controller_btn">100%</div>
			<div>
				<div id="mi_scroll_arrow_left" class="document_controller_btn">
					<div style="margin-top: 8px;">＜<br>前</div>
				</div>
				<div id="mi_scroll_arrow_right" class="document_controller_btn">
					<div style="margin-top: 8px;">＞<br>後</div>
				</div>
				<div class="page_content document_controller_btn">
					<span class="current_page"></span>/<span class="max_page"></span>P
				</div>
			</div>
		</div>
	</div>
</div>
	<!-- 資料表示領域 end -->

	<!-- 資料アップロード時のメッセージ -->
	<div id="upload_document_message_area" class="upload_document_message_area">
		<div class="upload_document_message"></div>
	</div>

	<!-- 資料の保存ができないメッセージ -->
	<div id="no_save_document_message_area" class="no_save_document_message_area">
		<div class="no_save_document_message">これ以上ストレージに保存できません。<br>既に展開している資料を削除してください。<br>※資料に書き込んだ情報は保存されません。</div>
	</div>

	<!-- 目次 start -->
	<div id="mi_contents_display">
		<div id="contents_scroll_arrow_left" class="mi_scroll_arrow_left"><span class="icon-menu-01"></span></div>
			<div class="mi_tag_list">
				<ul>
				</ul>
			</div>
		<div id="contents_scroll_arrow_right" class="mi_scroll_arrow_right"><span class="icon-menu-02"></span></div>
	</div>
	<!-- 目次 end -->

	<!-- コメント start -->
	<p class="mi_document_note" style="display:none"></p>
	<!-- コメント end -->

{literal}
<script>
$(document).ready(function(){
	// iPadかつ縦表示かつ 12inch以下のもののときにリセットの文字が見切れるため、font-sizeを変更する
	const resetBtnText = $('#document_pen_reset').find('.mi_icon_text');
	if (USER_PARAM_IS_IPAD_PC && window.innerHeight > window.innerWidth && window.outerWidth < 1000) {
		resetBtnText.css('font-size', '7px');
	}
});

</script>
{/literal}

