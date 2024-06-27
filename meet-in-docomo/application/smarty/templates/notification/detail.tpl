{include file="./common/header.tpl"}

<!-- メインコンテンツ[start] -->
<div id="mi_main_contents">
  <div id="mi_top_nav">
    <!-- パンくずリスト start -->
    <div class="mi_breadcrumb_list">
      <a href="/index/menu">TOP</a>&nbsp;&gt;&nbsp;
      <a href="/notification/list">お知らせ</a>&nbsp;&gt;&nbsp;
      <a href="/notification/detail?id={$notification.id}">{$notification.title}</a>
    </div>
    <!-- パンくずリスト end -->
  </div>
  <!-- コンテンツエリア start -->
  <div id="mi_content_area">
    <!-- コンテンツタイトル start -->
    <div class="mi_content_title">
      <span class="icon-notification mi_content_title_icon"></span>
      <h1>お知らせ</h1>
    </div>
    <!-- コンテンツタイトル end -->

    <!-- コンテンツお知らせ start -->
    <div class="mi_content_notification">
      <p>{$notification.post_date|date_format:"%Y.%m.%d"}</p>
      <h2>{$notification.title}</h2>
      <div class="mi_content_notification_text">
        {$notification.content|replace:"\n":"<br />"}
      </div>
    </div>
    <!-- コンテンツお知らせ end -->
  </div>
  <!-- コンテンツエリア end -->
</div>
<!-- メインコンテンツ[end] -->

{include file="./common/footer.tpl"}
