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
    color: #333333;
}
.item__small {
    font-family: HiraginoSans-W4;
    font-size: 12px;
    font-weight: normal;
    font-style: normal;
    font-stretch: normal;
    line-height: normal;
    letter-spacing: normal;
    color: #333333;
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
    margin-bottom: 20px
}

.text-field {
    width: 440px;
    height: 40px;
    border-radius: 4px;
    border: solid 1px #E9E8E7;
    background-color: #ffffff;
    padding: 0 14px;
    margin-bottom: 20px;
}

::placeholder {
    color: #dbdee1;
    font-size: 12px
}

.btn_submit {
    width: 207px;
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
    letter-spacing: 0;
    text-align: center;
    color: #ffffff;
    opacity: 1;
    margin: 0 auto;
    display: block;
    cursor: pointer;
}

.required {
    margin-left: 8px;
    padding: 0px 5px;
    font-size: 12px;
    line-height: 1.0;
    color: #fff;
    background: #df6b6e;
}

.password-label {
    font-size: 12px;
}

</style>
{/literal}
<!-- メインコンテンツ[start] -->
<div id="mi_main_contents" class="Rectangle">

    <img src="/img/sign_contract_1.png" class="img__section"><br>
    <span class="item__medium">パスワード設定</span><br>
    <p class="item__small">パスワードを設定してください。（8文字以上の半角英数字）<br>
    作成した電子契約書を閲覧するときに使用します。</p>

    <form action="/e-contract-api/password-regist" method="post">
        <div class="password-field">
            <p class="password-label">パスワード<span class="required">必須</span><p>
            <input type="password" name="password" class="text-field"　required>
            <p class="error__small">
                {foreach from=$errorList item=error}
                    {foreach from=$error item=row}
                        {$row}<br>
                    {/foreach}
                {/foreach}
            </p>
            <input type="submit" class="btn_submit" value="パスワードを設定">
        </div>
    </form>


</div>

<!-- メインコンテンツ[end] -->

{include file="./common/footer.tpl"}
