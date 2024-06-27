<!-- 右側サイドバー start -->
<div class="mi_select_action" id="negotiation_right_menu" style="z-index:99999999;">
  <div class="mi_action_button" id="negotiation_right_menu_button">
    <span class="icon-puls mi_add_icon"></span>
    <span id="label">メニューを開く</span>
  </div>

  <ul id="negotiation_right_menu_button_list" style="display:none">

    <li id="button_chat_board" class="menu_chat_board">
      <div class="menu_chat_board_box">
      <p><img src="/img/chat_board.png" width="32px" height="20px" class="icon_image"></p>
      <p>チャット</p>
      </div>
    </li>

    {if $is_operator == 1}
    <li class="show_material_modal" id="show_material_modal" >
      <span class="icon-memo"></span>
      <span>資料追加</span>
    </li>
    <li id="button_secret_memo">
      <span class="icon-comment"></span>
      <span>シークレットメモ</span>
    </li>
    {else}
    <li class="show_material_modal" id="show_material_modal" style="display:none;">
      <span class="icon-memo"></span>
      <span>資料追加</span>
    </li>
    <li id="button_secret_memo"  style="display:none;">
      <span class="icon-comment"></span>
      <span>シークレットメモ</span>
    </li>
    {/if}

    <li id="button_room_share">
      <span class="icon-parsonal-puls"></span>
      <span>ルームを共有</span>
    </li>
    <li id="button_reconnect" class="button_reconnect_disable_operator">
      <span class="icon-connect"></span>
      <span>再接続</span>
    </li>
    <li id="button_negotiation_finish">
      <span class="icon-completion"></span>
      <span>終了</span>
    </li>
<!--
    {if $is_operator == 1}
    <li class="show_material_modal">
      <span class="icon-memo"></span>
      <span>資料追加</span>
    </li>
    <li id="button_secret_memo">
      <span class="icon-comment"></span>
      <span>シークレットメモ</span>
    </li>
    {/if}
    <li id="button_room_share">
      <span class="icon-parsonal-puls"></span>
      <span>ルームを共有</span>
    </li>
    <li id="button_reconnect" class="button_reconnect_disable_operator">
      <span class="icon-connect"></span>
      <span>再接続</span>
    </li>
    <li id="button_negotiation_finish">
      <span class="icon-completion"></span>
      <span>終了</span>
    </li>
-->
  </ul>
</div>
<!-- 右側サイドバー end -->
