{include file="./common/header.tpl"}
{literal}
<script src="/js/negotiation/e_contract.js?{$application_version}"></script>
<style type="text/css">
  /* 背景の色 */
	body {
    background-color: #E5F4FF
    position: relative;
    }
  .Rectangle {
    width: 784px;
    height: 1103px;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.5);
    background-color: #ffffff;
    margin: 80px auto 36px;
    padding: 33px 50px!important
  }
  .img__section{
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
    margin: 5px 0 35px
  }

  /* .upload_document_message_area {
    position: absolute;
    top: 230px;
    right: 45px;
  } */

  .createPartnerSignMessage,
  .upload_document_message {
    color: #df6a6e;
  }

  .text-field {
    width: 150px;
    height: 32px;
    border-radius: 3px;
    border: solid 1px #dbdee1;
    background-color: #ffffff;
    margin-bottom: 10px;
  }

  ::placeholder {
    color: #dbdee1;
    font-size: 12px
  }

  .btn_wrap {
    width: 100%;
    text-align: center;
  }

  .btn_approve {
    width: 160px;
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
    margin-top:30px;
    margin-left:10px
    cursor: pointer;
  }

  .container {
    overflow: hidden;
    width: 784px;
    height: 840px;
  }
  .left__col {
    float: left;
    width: 568px;
    height: 810px;
    background-color: #f5f5f5;
    padding: 20px 74px 40px;
    box-sizing: border-box;
  }
  .right__col {
    float: right;
    width: 150px;
    background-color: #f5f5f5;
    padding: 20px 24px 40px
  }

  .doc_img {
    width: 420px;
    height: auto;
  }

  .client_stamp__area {
    width: 420px;
    position: relative;
  }

  .client_stamp {
    position: absolute;
  }

  .item__rectangle_medium {
    font-family: HiraginoSans-W4;
    font-size: 18px;
    font-weight: normal;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.44;
    letter-spacing: normal;
    color: #4c4c4c;
    white-space: nowrap;
    margin-bottom: 10px
  }

  .item__rectangle_small {
    font-family: HiraginoSans-W4;
    font-size: 11px;
    font-weight: normal;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.64;
    letter-spacing: normal;
    color: #4c4c4c;
    margin-top: 20px;
    margin-bottom: 10px
  }

  .item__rectangle_label {
    font-family: HiraginoSans-W4;
    font-size: 11px;
    font-weight: normal;
    font-style: normal;
    font-stretch: normal;
    line-height: normal;
    letter-spacing: normal;
    color: #4c4c4c;
  }

  .area__stamp {
    position:relative;
    width: 148px;
    height: 173px;
    border-radius: 4px;
    background-color: #ffffff;
    padding: 15px 20px;
    box-sizing: border-box;
  }
  .area__stamp::before{
    text-align: center;
    color: #afafaf;
    font-family: HiraginoSans-W4;
    font-size: 9px;
    position: absolute;
    left: 0;
    bottom: 0;
    content:"ドラック＆ドロップで\A捺印箇所に重ねて下さい";
    white-space: pre;
  }

  .btn__make {
    width: 150px;
    height: 35px;
    border-radius: 22.5px;
    background-color: #0081CC;
    font-family: HiraginoSans-W4;
    font-size: 14px;
    font-weight: normal;
    font-style: normal;
    font-stretch: normal;
    line-height: normal;
    letter-spacing: normal;
    color: #ffffff;
    outline: 0;
    border: 0;
    margin-top: 20px;
  }
  #area__stamp--img {
    height:100px;
    width:100px
  }

</style>
{/literal}

<!-- メインコンテンツ[start] -->

<div id="mi_main_contents" class="Rectangle">

  <input type="hidden" name="credential" value="{$credential}">
  <input type="hidden" name="sign_x" value="{$signX}">
  <input type="hidden" name="sign_y" value="{$signY}">
  <input type="hidden" name="sign_width" value="{$signWidth}">
  <input type="hidden" name="sign_height" value="{$signHeight}">

  <a href="" id="download_contract" download></a>

  <img src="/img/step_2.svg" class="img__section"><br>
  <span class="item__medium">契約書に捺印する</span><br>
  <p class="item__small">印影作成フォームで印影を作成し、契約書に捺印してください。</p>

  <div class="container">
    <!-- 左カラム -->
    <div class="left__col">
      <p class="item__rectangle_medium">{$name}</p>
      <div id="client_stamp__area" class="client_stamp__area"></div>
      <img id="doc_img" src="https://{$host}{$docPath}" class="doc_img">


      <div class="btn_wrap">
        <div class="upload_document_message_area">
          <div class="upload_document_message"></div>
        </div>
        <input id="e_contract_approval_regist" type="button" class="btn_approve" value="承認する">
      </div>
    </div>

    <!-- 右カラム -->
    <div class="right__col">
      <p class="item__rectangle_medium">印影を作成</p>
      <div class="area__stamp">
        <div id="area__stamp"></div>
      </div>
      <p class="item__rectangle_small">印影に表示したい文字を入力してください。</p>
      <label class="item__rectangle_label">1行目（10文字以内）</label>
      <input id="e_contract_text" class="text-field" type="text" name="sign1" value="{$form.sign1|escape}" placeholder="株式会社" />
      <label class="item__rectangle_label">2行目（10文字以内）</label>
      <input id="e_contract_text" class="text-field" type="text" name="sign2" value="{$form.sign2|escape}" placeholder="会社名" />
      <label class="item__rectangle_label">3行目（10文字以内）</label>
      <input id="e_contract_text" class="text-field" type="text" name="sign3" value="{$form.sign3|escape}" />
      <label class="item__rectangle_label">4行目（10文字以内）</label>
      <input id="e_contract_text" class="text-field" type="text" name="sign4" value="{$form.sign4|escape}" />
      <div class="createPartnerSignMessageArea">
        <p class="createPartnerSignMessage"></p>
      </div>
      <button id="createPartnerSign" class="btn__make">作成する</button>
    </div>
  </div>

</div>

<!-- メインコンテンツ[end] -->

{include file="./common/footer.tpl"}
