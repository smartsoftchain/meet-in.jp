<script src="/js/common/add_bodypix.js?{$application_version}"></script>
<link rel="stylesheet" href="/css/bodypix.css?{$application_version}">
<div class="modal-content-add-bodypix" id="modal-content-add-bodypix">
	<div class="mi_modal_shadow"></div>
	<div class="inner-wrap-add-bodypix mi_modal_default modal_content_add_bodypix_area">
		<div class="add_bodypix_header">
			<div class="abh_title">背景画像追加</div>
		</div>
		<div class="add_bodypix_contents">
			<div id="upload_bodypix_image_area" class="upload_bodypix_image_area">
				<p id="bodypix_drop_label" class="document_drop_message">画像をここにドロップしてください。</p>
				<label for="file_upload_bodypix" class="file_bodypix_image_area">
					ファイル選択
					<input type="file" accept=".gif,.jpg,.png" value="ファイルを選択" name="file_upload_bodypix" id="file_upload_bodypix" class="display_none"><br>
				</label>
				<lavel class="upload_file_bodypix_name">選択されていません。</lavel>
				<div class="clear_both"></div>
				<div id="upload_file_bodypix_message" class="upload_file_bodypix_message"></div>
			</div>
			<div class="bodypix_cutting_area">
				<!-- 画像の大きさを変更するバー -->
				<input id="scal_bodypix_image" class="scal_bodypix_image" type="range" value="" min="10" max="600"><br>
				<!-- 選択（アップロードされた画像） -->
				<canvas id="canvas_before_bodypix_image" class="canvas_before_bodypix_image" width="700" height="600"></canvas><br>
				<!-- 「4 : 3」の画像切り出し処理 -->
				<button id="btn_crop" class="btn_crop">範囲を決定</button><br>
				<!-- 背景画像として使用する画像 -->
				<canvas id="canvas_after_bodypix_image" class="canvas_after_bodypix_image" width="400" height="300"></canvas>
			</div>
		</div>
		<div class="add_bodypix_footer">
			<button type="button" id="button_cancel_bodypix_image" class="mi_default_button mi_cancel_btn">キャンセル</button>
			<button type="button" id="button_add_bodypix_image" class="mi_default_button btm_add_bodypix_image">画像登録</button>
		</div>
	</div>
</div>