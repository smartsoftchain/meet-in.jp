<!DOCTYPE html>
<html>
<head>
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>非推奨エラー</title>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="/css/sp/error.css">
<link rel="stylesheet" href="/css/reset.css">
<script src="/js/jquery-1.11.2.min.js?{$application_version}"></script>
<script src="/js/jquery-ui.min.js?{$application_version}"></script>
<script type="text/javascript" src="/js/platform.js?{$application_version}" charset="utf-8"></script>
<script type="text/javascript" src="/js/common/check_system_requirements.js"></script>
<script type="text/javascript" src="/js/sp/error/deprecated.js"></script>


</head>
<body class="error_body">
  <div class="error_content_area">


    <div class="error_text">
      <p class="error_text1">このブラウザは非対応です</p>
      <p class="error_text2">以下のブラウザーでご利用ください。</p>
    </div>
    {if $os == 'ios'}
      <div class="error_recommend_area">
        <p class="error_recommend_label">ご利用のブラウザの最新版をインストールしてください </p>
        <p class="error_recommend_text">推奨環境：Safari iOS <span id="ios_version">12.0</span>以上</p>
      </div>

      <div class="error_url_area">
        <div class="error_url_copy">
          <textarea id="room" style="position:fixed;right:100vw;font-size:16px;" readonly="readonly">https://{$host}/room/{$room}</textarea>
          <a class="error_url_copy_link" id="room_copy" href="javascript:void(0);">URLコピー</a>
        </div>
        <div class="error_url_open">
          <a class="error_url_open_link" href="x-web-search://">Safariを開く</a>
        </div>
      </div>

    {else}
      <div class="error_recommend_area">
        <p class="error_recommend_label">ご利用のブラウザの最新版をインストールしてください </p>
        <p class="error_recommend_text">推奨環境：最新版 Google Crome</p>
      </div>

      <div class="error_url_area">
        <div class="error_url_copy">
          <textarea id="room" style="position:fixed;right:100vw;font-size:16px;" readonly="readonly">https://{$host}/room/{$room}</textarea>
          <a class="error_url_copy_link" id="room_copy" href="javascript:void(0);">URLコピー</a>
        </div>
        <div class="error_url_open">
          <a class="error_url_open_link android" href="intent://{$host}/room/{$room}#Intent;scheme=http;package=com.android.chrome;end">Google Chromeを開く</a>
        </div>
      </div>

    {/if}

  </div>
</body>
