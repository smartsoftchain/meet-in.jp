<!-- フッター start -->
<footer class="mi_video" style="z-index:99999999;">

  <!-- 右側サイドバー start -->
	{include file="./negotiation/negotiation-right.tpl"}
  <!-- 右側サイドバー end -->

  <div class="mi_footer_link_button" id="negotiation_bottom">
	{if $browser === 'Chrome'}
		<button type="button" name="button" class="mi_screen_share screenshare_button_tooltip" id="button_share_screen"><span class="icon-window-share mi_memo_icon"></span>画面共有をする</button>
	{/if}
	
	<button type="button" name="button" class="mi_notes_share" id="button_share_memo"><span class="icon-memo mi_memo_icon"></span>共有メモ</button>
	<button type="button" name="button" class="mi_notes_share" id="button_white_board"><span class="icon-whiteboard mi_memo_icon"></span>ホワイトボード</button>
	{if $browser === 'Chrome'}
	<button type="button" name="button" class="mi_notes_share screencapture_button_tooltip" id="button_capture_screen"><img src="/img/screen_capture.png" width="29px" class="icon_image"/>画面キャプチャ</button>
	{/if}
  </div>

  
  <div class="remove_material" ondragover="materialDragOver(event)" ondrop="removeMaterial(event)" >
      <span class="icon-delete"></span>
      <div class="del_message">資料削除</div>
  </div>
  
  
  <!-- 資料選択 start -->
  <div class="move_thumbnail_prev" id="move_thumbnail_prev">
    <span class="icon-menu-05"></span>
  </div>
  <div class="mi_document_select material_button_tooltip" id="negotiation_bottom_document_select">
    <ul>
    </ul>
    <!--<span class="icon-menu-06 mi_document_arrow_icon"></span>-->
  </div>
  <div class="move_thumbnail_next" id="move_thumbnail_next">
    <span class="icon-menu-06"></span>
  </div>
  <!-- 資料選択 end -->

</footer>
<!-- フッター end -->

<!--
<div id="negotiation_bottom">
	<button type="button" id="button_target_video_on">相手のビデオを表示</button>
	<button type="button" id="button_target_video_off">相手のビデオを非表示</button>
</div>
-->