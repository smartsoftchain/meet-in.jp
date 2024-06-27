<!-- 資料表示領域 start -->

<div id="mi_docment_area" class="layout-0 docment_area">
	<div id="document_canvas_area" class="document_canvas_area">
		<div id="mi_scroll_arrow_left" class="mi_scroll_arrow_left mi_arrow"><span class="icon-menu-01"></span></div>
		<div id="mi_scroll_arrow_right" class="mi_scroll_arrow_right mi_arrow"><span class="icon-menu-02"></span></div>

		<div id="document_header_icon" class="document_header_icon">
			<div class="page_content" style="display: inline-block; line-height: 82px; vertical-align: top;">
				<span class="current_page"></span>/P<span class="max_page"></span>
			</div>
			<div class="document_button_wrapper">
				<div id="document_pen_reset">
					<div class="icon-reset"></div>
					<div class="mi_icon_text">リセット</div>
				</div>
				<div id="document_close">
					<div class="icon-close"></div>
					<div class="mi_icon_text">閉じる</div>
				</div>
			</div>

			<img src="/img/1px_comment.svg" class="img_document_comment" alt="コメント"/>
			<span class="icon-download"></span>
		</div>
		<div class="document_canvas_contents">
			<img src="" id="document_img" class="document_img"/>
			<canvas id="document_canvas" class="document_canvas"></canvas>
		</div>
	</div>
	<a href="" name="download_document" download=""></a>
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
