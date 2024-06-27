{include file="./common/header.tpl"}

{literal}
<style type="text/css">
  /* 背景の色 */
	body {
    background-color: #fff4e0
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

  .error__small {
    font-family: HiraginoSans-W4;
    font-size: 12px;
    font-weight: normal;
    font-style: normal;
    font-stretch: normal;
    line-height: normal;
    letter-spacing: normal;
    color: #df6a6e;
    margin-top: 20px
  }

  .auth-field {
    margin-bottom: 20px;
  }

  .auth-label {
    font-size: 14px;
    color: #4c4c4c;
  }

  .text-field {
    width: 283px;
    height: 40px;
    border-radius: 3px;
    border: solid 1px #afafaf;
    background-color: #ffffff;
    padding: 0 14px
  }

  ::placeholder {
    color: #dbdee1;
    font-size: 12px
  }

  .btn_auth {
    width: 152px;
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
    cursor: pointer;
  }

</style>
{/literal}
<!-- メインコンテンツ[start] -->
<div id="mi_main_contents" class="Rectangle">

  <span class="item__medium">認証</span><br>
  <p class="item__small">契約書の承認の際に登録したメールアドレスと認証コード（又はパスワード）を入力してください。</p>

  <form action="/e-contract-api/partner-auth" method="post">

    <div class="auth-field">
      <p class="auth-label">メールアドレス</p>
      <input type="email" name="email" class="text-field" placeholder="aaa@aaa.aaa">
    </div>

    <div class="auth-field">
      <p class="auth-label">認証コード（又はパスワード）</p>
      <input type="password" name="password" class="text-field">
    </div>

    <input type="submit" class="submit btn_auth" value="認証">
  </form>

  <p class="error__small">{$error}</p>

</div>

<!-- メインコンテンツ[end] -->

{include file="./common/footer.tpl"}
