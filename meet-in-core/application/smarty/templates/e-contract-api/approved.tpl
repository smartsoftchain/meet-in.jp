{include file="./common/header.tpl"}
{literal}
<style type="text/css">
  /* 背景の色 */
	body {
    background-color: #fff4e0
    }
  .Rectangle {
    width: 884px;
    height: 884px;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.5);
    background-color: #ffffff;
    margin: 80px auto 36px;
    box-sizing: border-box;
  }
  .img__section{
    margin-bottom: 20px
  }
  .item__medium{
    font-family: HiraginoSans-W4;
    font-size: 32px;
    font-weight: normal;
    font-style: normal;
    font-stretch: normal;
    line-height: normal;
    letter-spacing: normal;
    color: #4c4c4c;
  }
  .item__small {
    font-family: HiraginoSans-W4;
    font-size: 12px;
    font-weight: normal;
    font-style: normal;
    font-stretch: normal;
    line-height: normal;
    letter-spacing: normal;
    color: #4c4c4c;
    margin: 5px 0 20px
  }

  .center{
    text-align: center;
    margin-top: 80px;
  }

</style>
{/literal}

<!-- メインコンテンツ[start] -->
<div id="mi_main_contents" class="Rectangle">
  <div class="center">
    <p class="item__medium">承認が完了しました</p>
    <p class="item__small">次の承認者へ電子契約書が送信されました。契約が成立しましたら契約完了メールが届きます。</p><br>
    <img src="/img/icon___.svg" class="img__section"><br>
  </div>

  <!-- ボタンエリア begin -->
  <div class="button-wrapper">
    <div class="signup-button-box">
      <p>閉じる</p>
      <a href="/"></a>
    </div>
  </div>
  <!-- ボタンエリア end -->
</div>
<!-- メインコンテンツ[end] -->

{include file="./common/footer.tpl"}
