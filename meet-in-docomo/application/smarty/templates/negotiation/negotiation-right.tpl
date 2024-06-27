<!-- ====================================== 録画モーダルコンテンツ[start] ====================================== -->
<div class="modal-content" id="record_modal-content">
  <div class="record_mi_modal_shadow"></div>
    <div class="record_modal_message_wrap">
      <div class="record_message">録画の拡張機能を有効にしてください。
        {* <div style="margin-top:10px"><a href="javascript:void(0);" onclick="window.open('/lp/faq/pdf/meet_in_record_how_to_enable.pdf', '_blank', 'location=yes,height=500,width=600,scrollbars=no,status=yes');" style="text-decoration:underline;">こちら</a></div> *}
      </div>
      <button class="record_ok_button">OK</button>
    </div>
</div>
<!-- ====================================== 録画モーダルコンテンツ[end] ======================================== -->

<!-- ====================================== 再接続モーダルコンテンツ[start] ====================================== -->
<div class="modal-content" id="reconnect_modal-content">
  <div class="reconnect_mi_modal_shadow"></div>
        <div class="reconnect_modal_message_wrap">
    <div class="reconnect_message">再接続しますか？</div>
      <button class="reconnect_cancel">キャンセル</button>
      <button id="button_negotiation_finish" class="reconnect_button">OK</button>
        </div>
</div>
<!-- ====================================== 再接続モーダルコンテンツ[end] ======================================== -->

<!-- 右側サイドバー start -->
<div class="mi_select_action" id="negotiation_right_menu" style="z-index:99999999;">
  <div class="mi_action_button" id="negotiation_right_menu_button">
    <span class="icon-puls mi_add_icon"></span>
    <span id="label">メニューを開く</span>
  </div>

  <ul id="negotiation_right_menu_button_list" style="display:none">

    <!-- <li id="button_chat_board" class="menu_chat_board {if $room_mode == 2}view_only_control_footer{/if}">
      <div class="menu_chat_board_box">
      <p><img src="/img/chat_board.png" width="32px" height="20px" class="icon_image"></p>
      <p>チャット</p>
      </div>
    </li> -->

    {if $is_operator == 1}
      {if (!empty($user.client_id) && ($user.staff_role == "AA_1" || $user.staff_role == "CE_1" || $user.staff_role == "CE_2" ) && $user.plan_this_month > 1) || $user.trialUserFlg == 1}
        <li class="show_material_modal {if $room_mode == 2}view_only_control_footer{/if}" id="show_material_modal" >
          <span class="icon-memo"></span>
          <span>資料追加</span>
        </li>
      {/if}

    <!-- <li id="button_secret_memo" {if $room_mode == 2}class="view_only_control_footer"{/if}>
      <span class="icon-comment"></span>
      <span>シークレットメモ</span>
    </li> -->
    {else}
    <li class="show_material_modal {if $room_mode == 2}view_only_control_footer{/if}" id="show_material_modal" style="display:none;">
      <span class="icon-memo"></span>
      <span>資料追加</span>
    </li>
    <!-- <li id="button_secret_memo"  style="display:none;">
      <span class="icon-comment"></span>
      <span>シークレットメモ</span>
    </li> -->
    {/if}
    {* {if $is_e_conteact_credential == 1 && $is_e_conteact_sign_image == 1 && $is_e_conteact_certificate == 1}
    <li id="button_e_contract">
      <span class="icon-document-01"></span>
      <span>電子契約</span>
    </li>
    {/if}
    <li id="button_calendar" {if $room_mode == 2}class="view_only_control_footer"{/if}>
      <span class="icon-calendar-w18"></span>
      <a href="https://crowd-calendar.com/lp" target="_blank" rel="noopener noreferrer">
      </a>
      <span>カレンダー</span>
    </li> *}
    <li id="button_room_share" {if $room_mode == 2}class="view_only_control_footer"{/if}>
      <span class="icon-parsonal-puls"></span>
      <span>ルームを共有</span>
    </li>
    {if $is_operator == 1}
    <li id="button_secret_memo">
      <span class="icon-comment"></span>
      <span>シークレットメモ</span>
    </li>
    {/if}
    <li id="button_reconnect" class="button_reconnect_disable_operator">
      <span class="icon-connect"></span>
      <span>再接続</span>
    </li>
    <li id="footer_button_negotiation_finish">
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
