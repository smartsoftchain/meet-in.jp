{include file="./common/header.tpl"}

{literal}
<style type="text/css">
  /* 背景の色 */
  body {
    background-color: #fff4e0
  }
  p {
    font-size: 12px;
  }
  .Rectangle {
    width: 884px;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.5);
    background-color: #ffffff;
    margin: 80px auto 36px;
    padding: 33px 50px!important;
    box-sizing: border-box;
  }
  .img__section{
    width: auto;
    height: 30px;
    margin-bottom: 38px
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

  .item__medium span {
    font-size: 20px;
  }

  .item__small {
    font-family: HiraginoSans-W4;
    font-weight: normal;
    font-style: normal;
    font-stretch: normal;
    line-height: 2;
    letter-spacing: normal;
    color: #333333;
    margin: 5px 0 30px
  }

  .item__small a {
    text-decoration: underline;
  }

  .error__small {
    font-family: HiraginoSans-W4;
    font-weight: normal;
    font-style: normal;
    font-stretch: normal;
    line-height: normal;
    letter-spacing: normal;
    color: #df6a6e;
    margin-top: 20px
  }

  .text-field {
    width: 283px;
    height: 40px;
    border-radius: 4px;
    border: solid 1px #E9E8E7;
    background-color: #ffffff;
    padding: 0 14px;
  }

  ::placeholder {
    color: #dbdee1;
    font-size: 12px
  }

  .btn_verify {
    width: 160px;
    height: 40px;
    border-radius: 2px;
    outline: 0;
    border: 0;
    background-color: #ffa000;
    font-family: HiraginoSans-W4;
    font-size: 16px;
    font-weight: normal;
    font-style: normal;
    font-stretch: normal;
    line-height: normal;
    letter-spacing: normal;
    text-align: center;
    color: #ffffff;
    margin-left: 15px;
    cursor: pointer;
  }

  .qr_url {
    width: 140px;
    padding: 20px;
    margin-bottom: 30px;
    border: 1px solid #e8e8e8;
  }

  .verify-label {
    margin-bottom: 15px;
  }

</style>
{/literal}
<!-- メインコンテンツ[start] -->
<div id="mi_main_contents" class="Rectangle">

  <img src="/img/sign_contract_1.png" class="img__section"><br>
  <span class="item__medium">認証<span>(2/2)</span></span><br>
  <p class="item__small">お手持ちのスマートフォンで二要素認証に必要なアプリをインストールしてください。<br>
   ・iOS　<a rel="noopener" href="https://apps.apple.com/jp/app/google-authenticator/id388497605" target="_blank">Google Authenticator</a><br>
   ・Android　<a rel="noopener" href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&amp;hl=ja" target="_blank">Google Authenticator</a><br>
  アプリを起動し、以下のQRコードを読み取ってください。<br>
  二要素認証に必要な認証コード（6桁）が表示されます。 <br>
  ※スマートフォンの現在時刻が合っていない場合に正しく認証されませんのでご注意ください。</p>

  <img src="{$qrUrl}" class="qr_url">

  <form action="/e-contract-api/authenticate" method="post">
    <div class="verify-field">
      <p class="verify-label">画面に表示された認証コード（6桁）を入力してください。</p>
      <input type="text" name="verify_code" id="verify_code" pattern="^[0-9]+$" minlength="6" maxlength="6" placeholder="000000" class="text-field">
      <input type="submit" class="btn_verify" value="認証">
    </div>
  </form>
  <p class="error__small">{$error}</p>


</div>

<!-- メインコンテンツ[end] -->

{include file="./common/footer.tpl"}
