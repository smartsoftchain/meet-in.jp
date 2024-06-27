{literal}
<style type="text/css">

/*-------------------------------------
	（モーダル）基本型
--------------------------------------*/

</style>
{/literal}

<!-- ====================================== ユーザー一覧ダイアログ[start] ====================================== -->
<div id="room-userlist-dialog" class="ui-dialog ui-widget ui-widget-content ui-corner-all ui-front ui-dialog-osx ui-dialog-buttons" tabindex="-1" role="dialog" aria-describedby="common_dialog_rubr1mm89blbalxo" aria-labelledby="ui-id-1" style="display:none;">
  {* [X]ボタン *}
  <div class="room_userlist_close"></div>
  <h2 class="connected_user_list">接続ユーザー一覧</h2>
  <!-- ボタンにデフォルトでかかっているcssを消すために擬似的にボタンを追加 -->
  <button class="user_list_pseudo_button"></button>
  <ul class="video_list_wrap" id="negotiation_userlist">

<!--
    {section name=li start=1 max=1 loop=10 step=1}
    <li id="video_list_{$smarty.section.li.index}" data-id="{$smarty.section.li.index}" class="video_list_vert">
      <div class="video_list_sel">
        <p><img class="video_list_img_vert" src="/img/meet-in-logo_gray.png"/></p>
        <p><span class="video_user_name user_name">匿名ユーザー</span></p>
        <div class="video_list_cam_btn"><span class="icon-video video_list_cam_icon"></span>隠す</div>
        <div class="mi_header_status_icon" style="display: none;">
          <div  class="video-tooltip"><div class="user_info_wrap"><span class="user_info"></span></div></div>
          <div  class="video-tooltip"><span class="icon-device mi_default_label_icon_3"></span><span class="browser_version"></span></div>
          <div  class="video-tooltip"><span class="icon-browse-focus mi_default_label_icon_3 icon-browse"></span></div>
          <div  class="video-tooltip"><span class="icon-video mi_default_label_icon_3"></span></div>
          <div  class="video-tooltip"><span class="icon-microphone mi_default_label_icon_3"></span></div>
        </div>
      </div>
    </li>
    {/section}
-->

  </ul>
</div>
<!-- ====================================== ユーザー一覧ダイアログ[end] ====================================== -->
