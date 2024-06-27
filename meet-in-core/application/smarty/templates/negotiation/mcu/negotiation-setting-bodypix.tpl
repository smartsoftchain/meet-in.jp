<div id="setting-bodypix-dialog" class="modal-content" style="display: none;">
	<div class="mi_modal_shadow"></div>
	<div class="bodypix-inner-wrap mi_modal_default modal_content_setting_bodypix_area">
		<div class="dialog_title_area">
			<h2 id="dialog_title">背景画像を選択してください</h2>
			<div class="btn_add_background_image" id="btn_add_background_image" data-bodypix-image-path="">＋ 画像追加</div>
			<div class="btn_del_background_image" id="btn_del_background_image" data-bodypix-image-path="">ー 画像削除</div>
			<div class="clear_both"></div>
		</div>
		<div id="dialog_desc">
			<p>画像は入室後の設定からも切り替えることができます。</p>
			<p>画像追加する場合の推奨サイズはH:300px、W:400pxです。</p>
			<p>追加した画像を背景として使用している場合は削除できません。</p>
		</div>
		<div class="mi_table_main_wrap mi_table_input_right_wrap setting_bodypix_contents_area" style="min-height: 80px; border-top: 1px solid #e8e8e8;">
			<div class="gallery-flex" id="gallery-contents">
			</div>
		</div>
		<h2 id="setting-bodypix-detail-title">詳細設定<span class="icon-menu-down"></span></h2>
		<div class="bodypix-detail-flex" id="setting-bodypix-detail" style="display: none;">
			<div class="bodypix-detail-item">
				<div style="text-align: left; padding: 5px;">切抜きの粗さ</div>
				<div style="display: flex; justify-content: center">
					<input type="range" min="0" max="100" step="1" id="internalResolutionInput" class="slider">
				</div>
				<div style="display: flex; justify-content: space-between;">
					<div class="text-nowrap px-1">0</div>
					<div class="text-nowrap px-1">100</div>
				</div>
			</div>
			<div class="bodypix-detail-item">
				<div style="text-align: left; padding: 5px;">切抜きの間隔</div>
				<div style="display: flex; justify-content: center">
					<input type="range" min="1" max="99" step="1" id="segmentationThresholdInput" class="slider">
				</div>
				<div style="display: flex; justify-content: space-between;">
					<div class="text-nowrap px-1">1</div>
					<div class="text-nowrap px-1">99</div>
				</div>
			</div>
			<div class="bodypix-detail-item">
				<div style="text-align: left; padding: 5px;">境目のぼかし加減</div>
				<div style="display: flex; justify-content: center">
					<input type="range" min="0" max="20" step="1" id="maskBlurAmountInput" class="slider">
				</div>
				<div style="display: flex; justify-content: space-between;">
					<div class="text-nowrap px-1">0</div>
					<div class="text-nowrap px-1">20</div>
				</div>
			</div>
		</div>
		
		<div class="setting-bodypix-footer">
			<button type="button" id="setting-bodypix-dialog-cancel-button"  class="mi_default_button mi_cancel_btn" role="button">
				<span class="ui-button-text">キャンセル</span>
			</button>
			<button type="button" id="setting-bodypix-dialog-start-button" class="mi_default_button" role="button">
				<span class="ui-button-text">開始</span>
			</button>
		</div>
		
	</div>
</div>
<!-- ====================================== 背景画像登録モーダルコンテンツ[start] ====================================== -->
{include file="./common/add-bodypix.tpl"}
<!-- ====================================== 背景画像登録モーダルコンテンツ[end] ======================================== -->

<!-- ====================================== 背景画像の合成許可モーダルコンテンツ[start] ====================================== -->
{if $browser === "Safari"}
<div class="modal-content" id="load_bodypix-modal">
  <div class="exit_mi_modal_shadow"></div>
	<div class="load_bodypix_modal_message_wrap">
    <h2 class="load_bodypix_modal_title">背景画像の合成許可</h2>
    <div class="load_bodypix_message">選択した画像をビデオ映像に合成いたします。よろしいですか？</div>
      <button class="load_bodypix_cancel">キャンセル</button>
      <button id="load_bodypix_button" class="load_bodypix_button">許可</button>
	</div>
</div>
{/if}
<!-- ====================================== 背景設定モーダルコンテンツ[end] ======================================== -->
