{include file="./common/header.tpl"}

<!-- メインコンテンツ[start] -->
<div id="mi_main_contents">
  <div id="mi_top_nav">
    <!-- パンくずリスト start -->
    <div class="mi_breadcrumb_list">
      <a href="/index/menu">TOP</a>&nbsp;&gt;&nbsp;
      <a href="/notification/list">お知らせ</a></div>
    <!-- パンくずリスト end -->
  </div>

  <!-- コンテンツエリア start -->
  <div id="mi_content_area">
    <!-- コンテンツタイトル start -->
    <div class="mi_content_title">
      <span class="icon-notification mi_content_title_icon"></span>
      <h1>お知らせ</h1>
      <!-- 一括既読ボタン start -->
      <div class="all_read_button_area">
        <button id="all_read_button">
          <img src="/img/icon_all_read.png"/>
          <p>一括既読</p>
        </button>
      </div>
      <!-- 一括既読ボタン end -->
    </div>
    <!-- コンテンツタイトル end -->

    <!-- ページネーション start -->
    <div class="mi_pagenation">
      <div class="mi_pagenation_result mi_flt-r">該当件数 <span>{$list->getCount()}</span>件</div>
      {$list->getLink()}
    </div>
    <!-- ページネーション end -->

    <!-- テーブル start -->
    <div class="mi_table_main_wrap">
      <table class="mi_table_main notification_list">
        <tbody>
        {foreach from=$list->getList() item=row}
          {if $row.display_flg == 1}
          <tr>
            <td>
              <p>{$row.post_date|date_format:"%Y.%m.%d"}</p>
              <h2>
                <span class="unread_circle {if in_array($row.id, $alreadyReadNotificationsArray)}already_read{/if}"></span>
                <span class="notification_title">{$row.title}</span>
              </h2>
              <p>
                {$row.content}
              </p>
            </td>
            <td>
              <a href="/notification/detail?id={$row.id}"><span class="icon-menu-06"></span></a>
            </td>
          </tr>
          {/if}
        {/foreach}
        </tbody>
      </table>
    </div>
    <!-- テーブル end -->
  </div>
  <!-- コンテンツエリア end -->
</div>
<!-- メインコンテンツ[end] -->


{include file="./common/footer.tpl"}

{literal}
<script>
  // 一括既読ボタン押下処理
  $('#all_read_button').on('click', function() {
    $('#all_read_button').css({
      "background": "#FFAA00"
    });

    // ボタン連打阻止のためdisabled化
    $('#all_read_button').attr('disabled', true);

    // 一括既読処理
    $.ajax({
      url: "/notification/notification-all-read",
			type: "POST",
    }).then(
      function (res) {
        console.log('一括既読登録成功');
        location.reload();
      },
      function (error) {
        alert('一括既読の登録に失敗しました。');
        location.reload();
      });

  });

</script>
{/literal}
