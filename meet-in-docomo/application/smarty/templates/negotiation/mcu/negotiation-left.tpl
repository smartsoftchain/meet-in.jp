<!-- 左側サイドバー start -->
<div class="mi_left_sidebar" style="z-index:100000002; {if $room_mode == 2}pointer-events: none;{/if}">
  <ul class="mi_top_list">
    <li class="left_icon_arrow on_left_icon">
      <div class="left_icon_wrap">
        <span class="icon-arrow"></span>
        <div>選択<br>カーソル</div>
      </div>
    </li>
    <li class="left_icon_pointer">
      <div class="left_icon_wrap">
        <span class="icon-pointer"></span>
        <div>強調<br>ポインター</div>
      </div>
    </li>
    <li class="left_icon_pen">
      <div class="left_icon_wrap">
        <span class="icon-pen"></span>
        <div class="pen_msg">ペン<br>(太い)</div>
      </div>
    </li>
    <li class="left_icon_highlight">
      <div class="left_icon_wrap">
        <span class="icon-highlight"></span>
        <div class="highlight_msg">ハイライト（太い）</div>
      </div>
    </li>
    <li class="left_icon_color">
      <div class="mi_color_pad">
        <table>
          <tr>
            <td><div class="mi_blue"></div></td>
            <td><div class="mi_red"></div></td>
            <td><div class="mi_yellow"></div></td>
          </tr>
          <tr>
            <td><div class="mi_green"></div></td>
            <td><div class="mi_black"></div></td>
            <td><div class="mi_white"></div></td>
          </tr>
        </table>
      </div>
      <div class="left_icon_wrap">
        <span class="mi_select_color"></span>
        <div>カラー</div>
      </div>
    </li>
    <li class="left_icon_eraser">
      <div class="left_icon_wrap">
        <img src="/img/icon_eraser.png"/>
        <div class="pen_msg">消しゴム</div>
      </div>
    </li>
  </ul>
  <ul class="mi_bottom_list">
    <li class="left_icon_size">
      <div id="icon-expansion" class="left_icon_wrap">
        <span class="icon-expansion"></span>
        <div>拡大</div>
      </div>
      <div id="icon-reduction" class="left_icon_wrap" style="display:none">
        <span class="icon-reduction"></span>
        <div>縮小</div>
      </div>
    </li>
    <li class="left_icon_content display_none">
      <div class="left_icon_wrap">
        <span class="icon-content"></span>
        <div>目次</div>
      </div>
    </li>
  </ul>
</div>
<!-- 左側サイドバー end -->
