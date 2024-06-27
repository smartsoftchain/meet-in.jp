{include file="./common/header.tpl"}

{literal}
<style type="text/css">
  /* 背景の色 */
	body {
    background-color: #E5F4FF
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
    background-color: #0081CC;
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

  <img src="/img/sign_contract_1.png" class="img__section"><br>
  <span class="item__medium">認証{if $approvalMethod}<span>(1/2)</span>{/if}</span><br>
  <p class="item__small">契約書の説明の際に登録したメールアドレスを入力してください。</p>

  <form action="/e-contract-api/auth?token={$token}" method="post">
    <input name="email" class="text-field" placeholder="aaa@aaa.aaa">
    <input type="submit" class="btn_auth" value="認証">
  </form>

  <p class="error__small">{$error}</p>

</div>

<!-- メインコンテンツ[end] -->

{include file="./common/footer.tpl"}
