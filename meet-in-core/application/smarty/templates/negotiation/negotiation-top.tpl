<!-- ====================================== モーダルコンテンツ[start] ====================================== -->
<div class="modal-content exit_modal_content_wrap" id="exit_modal-content">
  <div class="exit_mi_modal_shadow"></div>
	<div class="exit_modal_message_wrap">
    <div class="exit_message">ルームを退出しますか？
    {if $record_method_type == '1' && $osName !== "Chromebook"}
      <div class="exit_record_caution_message">
        ※アプリダウンロード型の録画機能をご利用頂いている場合、<br>退出ないしは終了ボタンでルームを退出しても録画は停止されません。<br>必ずルーム内で録画を停止の上、ご退出ください。
      </div>
       {* ルーム内ログイン用 *}
    {elseif $osName !== "Chromebook"}
      <div class="exit_record_caution_message" style="display: none;">
        ※アプリダウンロード型の録画機能をご利用頂いている場合、<br>退出ないしは終了ボタンでルームを退出しても録画は停止されません。<br>必ずルーム内で録画を停止の上、ご退出ください。
      </div>
    {/if}
    </div>
      <button class="exit_cancel">キャンセル</button>
      <button id="button_negotiation_finish" class="exit_button">退出</button>
	</div>
</div>
<!-- ====================================== モーダルコンテンツ[end] ======================================== -->

<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
<!-- <script type="text/javascript" src="/js/negotiation/negotiation_get_audio.js"></script> -->
<!-- ヘッダー start -->
<header style="{if $room_mode == 2}z-index:100000002;{else}z-index:99999999;{/if}">

  <!-- ヘッダー左 start -->
  <div class="mi_flt-l">

    <!-- タイトル start -->
    <div id="mi_header_title">
        <img src="/img/meet-in-logo.png" alt="meet in" id="mi_header_logo" style="padding-right:0"/>
    </div>
    <!-- タイトル end -->

    <!-- ユーザー一覧 start -->
    <div class="mi_header_users">
      <div class="mi_header_status_users" id="header_status_users">
        <div class="mi_user_badge">
          <span class="icon-parsonal mi_userlist_icon"></span><span class="badge badge-notify room_members_count" id="room_members">{if $room_mode == 1}1{else}0{/if}</span>
          <span class="icon-login video_lock"></span>
        </div>
      </div>
    </div>
    <!-- ユーザー一覧 end -->
    <div style="display: none;">
      <span class="tooltip_header_status_users">現在<span class="room_members_count">{if $room_mode == 1}1{else}0{/if}</span>人が接続中</span>
    </div>
    <!-- ユーザーリアクションツールチップエリア start -->
    <div id="reaction_tooltips_area">
    </div>
    <!-- ユーザーリアクションツールチップエリア end -->
    <div class="mi_header_users">
      <div class="mi_header_status_reset" id="header_video_reset">
          <img class="reset_btn" src="/img/header/icon_video_reset.svg"> {if $room_mode != 2}配置を初期に戻す{/if}
      </div>
    </div>
    <!-- 同席モードの通知 begin -->
    {if $room_mode == 2}
        <div class="mi_header_users">
            同席モード
        </div>
    {/if}
    <!-- 同席モードの通知 end -->
  </div>
  <!-- ヘッダー左 end -->

  <!-- ヘッダー右 start -->
  <div class="mi_flt-r negotiation_button_area">
    <div class="room_exit_wrap">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 15" class="room_exit_icon"><defs></defs><g id="レイヤー_2" data-name="レイヤー 2"><g id="レイヤー_1-2" data-name="レイヤー 1"><path id="パス_384" data-name="パス 384" class="cls-1" d="M8,7.5,14.89.64a.39.39,0,0,0,0-.53.37.37,0,0,0-.53,0L7.5,7,.64.11a.37.37,0,0,0-.53,0,.37.37,0,0,0,0,.53L7,7.5.11,14.36a.37.37,0,0,0,0,.53A.39.39,0,0,0,.38,15a.36.36,0,0,0,.26-.11L7.5,8l6.86,6.86a.39.39,0,0,0,.27.11.36.36,0,0,0,.26-.11.37.37,0,0,0,0-.53Z"/></g></g></svg>
      <div class="room_exit">退出</div>
    </div>
    <!-- ユーザーメニュー start -->
    {if !empty($user.client_id)}
      <div class="mi_header_select mi_client_detail" >
        <div class="user_setting">
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
      <div class="mi_header_status mi_login_header" id="button_login" style="margin-left: 10px;">
        <button class="mi_default_button hvr-fade login_dialog_open" >ログイン</button>
      </div>
    {/if}
    <!-- ユーザーメニュー end -->

    <!-- お問い合わせ　start -->
    <div class="header_contact-wrap" id="button_contact">
        <span class="icon-contact">
        </span>
    </div>
    <!-- お問い合わせ　end -->

    <!-- サポート start -->
    <div class="header_help-wrap">
      <a href="https://manual.meet-in.jp/" target="_blank">
      <!-- 　<span class="help-icon" id="header_help" {if empty($user.client_id)}style="left: -22px;"{/if}> -->
      　<span class="help-icon" id="header_help">
        　<i class="material-icons">help_outline</i>
      　</span>
      </a>
  　</div>
    <!-- サポート end -->

    <!--挙手＋いいねリアクション start-->
    <div class="mi_header_status user_action_button_area {if $room_mode == 2}view_only_control_footer{/if}" id="button_raise_your_hand" style="margin-left: 0px;">
        <span class="icon-hand"></span>
    </div>
    <div class="mi_header_status user_action_button_area {if $room_mode == 2}view_only_control_footer{/if}" id="button_reaction" style="margin-left: 0px;">
        <span class="icon-good-reaction"></span>
    </div>
    <!--挙手＋いいねリアクション end-->

    <!-- ヘッダーステータス start -->
    <div class="mi_elapsed_time mi_login_header" style="width:90px; padding: 0 6px;"><span id="time" class="icon-clock">00:01:21</span></div>

    <div class="alert-window2 remind_camera_on_off_tooltip" id="remind_record2" style="display: none;">
        <div class="header">
          <div class="content">
          カメラとマイクのON/<br>OFFの切り替えは<br>こちらで変更できます。
          </div>
          <div class="close_camera_on_off_tooltip icon-close"></div>
        </div>
    </div>

    <!--新録画API-->
    {if $record_method_type == '1' && $osName !== "Chromebook"}
      <div class="mi_header_status start-screen-recording" style="margin-left: 0px;">
        <div><div class="rec-dot"></div></div>
      </div>
    {elseif $record_method_type == '1' && $osName == "Chromebook"}
    {* Chromebookの場合は新録画APIを使用できないため非表示 *}
    {else}
    {* 旧録画方式（拡張機能） *}
      {if $is_operator == 1 && $browser == 'Chrome'}
        <div class="mi_header_status record_button_tooltip mi_login_header" id="button_record" style="margin-left: 0px;">
            <span class="icon-rec mi_default_label_icon_2"></span>録画
        </div>
      {elseif $browser == 'Chrome'} 
      {* 録画方式 ルーム内ログイン用 ルーム内ログイン時のrecord_method_typeをみてJSにて表示切替*}
        {* 拡張機能方式  Safariは使えない*}
        <div class="record_button_tooltip mi_login_header" id="button_record" style="display: none; margin-left: 0px;"><span class="icon-rec mi_default_label_icon_2"></span>録画</div>
        {* API方式 iPadPC Chromebookは使えない*}
        <div class="start-screen-recording" id="record_method_api" style="display: none; margin-left: 0px; padding: 0 10px;">
          <div><div class="rec-dot"></div></div>
        </div>
      {elseif $osName !== 'Chromebook'}
      {* 録画API Safari ルーム内ログイン用 *}
        <div class="start-screen-recording" id="record_method_api" style="display: none; margin-left: 0px; padding: 0 10px;">
          <div><div class="rec-dot"></div></div>
        </div>
      {/if}
    
      <div class="download_mention_tooltip">
        <div class="modal_content">録画を一時停止しております。右上の退出ボタンまたは<br>メニューを開くの終了ボタンからルーム退出した場合のみ、<br>録画データが残ります。</div>
          <span class="close_download_tooltip icon-close"></span>
        </div>

      <!-- 開始時,30日後表示ツールチップ -->
      <div class="recording_start_mention_tooltip">
        <div class="modal_content">
          録画時間が90分を超えた場合、<br>録画が正常に保存できないケースがございます。
          <span class="close_download_tooltip icon-close"></span>
        </div>
      </div>

      <!-- 85分経過後表示ツールチップ -->
      <div class="recording_time_elapse_mention_tooltip">
        <div class="modal_content">
          ※録画時間が90分を超えようとしています。<br>
          これ以上の録画時間ですと録画が正常に保存できないケースがございますので<br>
          続けて録画する場合、一度ルームを退出して再入室のうえ、再度録画を開始してください。
          <span class="close_download_tooltip icon-close"></span>
        </div>
      </div>

        <div class="alert-window remind_record_tooltip" id="remind_record" style="display: none;">
          <div class="header">
            <div class="icon-problem">録画がOFFになっています。</div>
            <div class="close_download_tooltip icon-close"></div>
          </div>
        <div class="content">
            開始するには拡張機能を起動してください。<br>
            拡張機能の使い方は<a href="https://manual.meet-in.jp/?p=1297" target="_blank" rel="noopener" class="non_reccomend_link">こちら</a>
        </div>
      </div>
    {* 拡張機能使えないSafari等は旧録画なし *}
    {/if}

    <div class="mi_space" style="width:0;"></div>
{if $browser != 'IE'}
    <div class="dropdown">
      <div {if empty($user.client_id)}class="not_login_gear_icon_wrap"{else}class="login_gear_icon_wrap"{/if}>
        <span class="icon-setting mi_default_label_icon_4 dropbtn" onclick="settingDropdownMenu()"></span>
        <div id="settingDropdown" class="dropdown-content">
          <a href="javascript:void(0)" id="button_setting_camera_dialog">{if $browser !== 'Chrome'}マイク・カメラ設定{else}マイク・カメラ・スピーカー設定{/if}</a>
          {if $browser != 'Safari'}
            <a href="#" id="button_setting_bodypix">背景画像設定</a>
          {/if}
        </div>
      </div>
    </div>
{else}
    <div class="mi_header_status" id="button_setting_camera_dialog" style="margin-left:16px; margin-right:15px; margin-top:2px;">
      <span class="icon-setting mi_default_label_icon_4"></span>
    </div>
{/if}
    {* <div class="mi_header_status" id="button_mic" style="margin-left:12px;"><span class="icon-microphone mi_default_label_sicon_2"></span>マイクOFF</div>
    <div class="mi_header_status" id="button_camera"><span class="icon-video mi_default_label_icon_2"></span>カメラOFF</div> *}
    <!-- マイク、カメラを表示　-->

    <div class="mi_header_status" id="button_mic" style="margin-left:13px;"><img src="/img/orange_mic_on.svg" class="mic_icon">マイクON</div>
    <div class="mi_header_status" id="button_camera"><img src="/img/orange_camera_on.svg" class="camera_icon">カメラON</div>
    <!-- IEの場合は文字起こしボタンを表示しない -->
    {if $browser !== 'IE'}
      <!-- <div class="mi_header_status mi_login_header" id="button_record_text_right" style="margin-left: 0px;"></div> -->
      {if $user.staff_type == 'AA'}
        <!-- <button class="mi_header_getAudioStart" id="button_audioStart">
            <img class="audio_text_top_icon" src="/img/sp/svg/get-text.svg">
            文字起こし
        </button> -->
      {else}
      {/if}

      <!-- <div class="mi_header_status mi_login_header" id="button_record_text_left" style="margin-left: 0px;"></div> -->
    {else}
    {/if}
    <!-- ヘッダーステータス end -->

  </div>
  <!-- ヘッダー右 end -->


</header>
<!-- ヘッダー end -->

<!-- カメラ設定 start -->
{include file="./negotiation/negotiation-setting-camera.tpl"}
<!-- カメラ設定 end -->
<!-- Bodypix設定 start -->
{include file="./negotiation/negotiation-setting-bodypix.tpl"}
<!-- Bodypix設定 end -->
<!-- Apowersoft画面録画ソフトAPI呼び出しscript ゲスト用　srcなし ルーム内ログイン時に挿入 -->
<script id="apower_screen_recorder" defer></script>
{if $record_method_type == '1' && $osName !== "Chromebook"} 
<!-- Apowersoft画面録画ソフトAPI呼び出しscript -->
<script src="//api.aoscdn.com/screen-recorder?lang=ja" defer></script>
{/if}