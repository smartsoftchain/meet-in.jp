<!-- ヘッダー start -->
<header style="z-index:99999999;">

  <!-- ヘッダー左 start -->
  <div class="mi_flt-l">

    <!-- タイトル start -->
    <div id="mi_header_title">
        <img src="/img/projectavatar-1.png" alt="sc" id="mi_header_logo" style="padding-right:0"/>
    </div>
    <!-- タイトル end -->

    <!-- ユーザー一覧 start -->
    <div class="mi_header_users">
      <div class="mi_header_status_users" id="header_status_users">
        <div class="mi_user_badge">
          <span class="icon-parsonal mi_userlist_icon"></span><span class="badge badge-notify room_members_count" id="room_members">1</span>
          <span class="icon-login video_lock"></span>
        </div>
      </div>
    </div>
    <!-- ユーザー一覧 end -->
    <div style="display: none;">
      <span class="tooltip_header_status_users">現在<span class="room_members_count">1</span>人が接続中</span>
    </div>
    <div class="mi_header_users">
      <div class="mi_header_status_reset" id="header_video_reset">
        <div class="video_reset_icon">
          <span class="icon-reset"></span>
        </div>
      </div>
    </div>
  </div>
  <!-- ヘッダー左 end -->

  <!-- ヘッダー右 start -->
  <div class="mi_flt-r negotiation_button_area">

    <!-- ユーザーメニュー start -->
    {if !empty($user.client_id)}
      <div class="mi_header_select mi_client_detail" >
        <div class="user_setting">
          <span class="mi_login_header"></span>
          <div id="header_clientname" >{$user.header_clientname}</div>
          {if $user.staff_type == 'AA'}
          <span class="icon-menu-down mi_default_label_icon mi_header_arrow_icon" ></span>
          {/if}
        </div>
        {if $user.staff_type == 'AA'}
        <ul class="mi_select_option">
          <li>
              <span class="icon-configuration-personal mi_default_label_icon"></span><div class="client_dialog_open" style="font-size: 70%;">クライアント選択</div>
          </li>
        </ul>
        {/if}
      </div>
    {else}
      <div class="mi_header_select mi_client_detail" id="button_username" hidden>
        <div class="user_setting">
          <span class="mi_login_header"></span>
          <div id="header_clientname" ></div>
          <span class="icon-menu-down mi_default_label_icon mi_header_arrow_icon" ></span>
        </div>
        <ul class="mi_select_option">
          <li>
            <div class="client_dialog_open" style="font-size: 12px;margin-left: 32px;">クライアント選択</div>
            <span class="icon-menu-06 mi_default_label_icon" style="font-size: 24px;color: #717171;margin-left: 4px;"></span>
            <!--
              <span class="icon-configuration-personal mi_default_label_icon" >
              </span><div class="client_dialog_open" style="font-size: 70%;">クライアント選択</div>
            -->
          </li>
        </ul>
      </div>
      <div class="mi_header_status mi_login_header" id="button_login" >
        <button class="mi_default_button hvr-fade login_dialog_open" >ログイン</button>
      </div>
    {/if}
    <!-- ユーザーメニュー end -->

    <!-- ヘッダーステータス start -->
    {if $browser === 'IE' || $browser !== 'Chrome'}
    <div class="mi_elapsed_time mi_login_header" style="width:160px;">経過時間 <span id="time">00:01:21</span></div>
    {else}
    <div class="mi_elapsed_time mi_login_header" style="width:130px;">経過時間 <span id="time">00:01:21</span></div>

    {if $is_operator == 1}
    <div class="mi_header_status record_button_tooltip mi_login_header" id="button_record" style="margin-left: 0px;"><span class="icon-rec mi_default_label_icon_2" ></span>録画</div>
    {else}
    <div class="mi_header_status record_button_tooltip mi_login_header" id="button_record" style="display: none; margin-left: 0px;"><span class="icon-rec mi_default_label_icon_2" ></span>録画</div>
    {/if}

    {/if}

    <div class="mi_space" style="width:0;"></div>
    <div class="mi_header_status" id="button_mic" style="margin-right:32px;"><span class="icon-microphone mi_default_label_icon_2"></span>マイクOFF</div>
    <div class="mi_header_status" id="button_setting_camera_dialog">
      <span class="icon-setting mi_default_label_icon_4"></span></div>
    <div class="mi_header_status" id="button_camera"><span class="icon-video mi_default_label_icon_2"></span>カメラOFF</div>
    <!-- ヘッダーステータス end -->

  </div>
  <!-- ヘッダー右 end -->


</header>
<!-- ヘッダー end -->

<!-- カメラ設定 start -->
{include file="./negotiation/negotiation-setting-camera.tpl"}
<!-- カメラ設定 end -->
