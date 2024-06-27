{include file="./common/header.tpl"}

{literal}
<style type="text/css">
  /* 必須のスタイル */
  .required {
    margin-left: 8px;
    padding: 0px 5px;
    font-size: 12px;
    line-height: 1.0;
    color: #fff;
    background: #df6b6e;
  }

  /* エラーメッセージ */
  .errmsg {
  	font-size: 0.95em;
  	line-height: 1.6;
  	color: #df6b6d;
  	padding-bottom: 15px;
  }

  .mi_contract_agre_wrap {
    margin-top: 30px;
    background: #fff;
    padding: 20px;
  }

  .f_name_{
    display: inline-block !important;
    width: 155.2px !important;
    height: 100%;
    padding: 0 10px;
  }

  .mi_content_atention {
    color: #df6b6e;
    font-size: 10px;
    width: 70%;
    float: right;
    padding-bottom: 20px;
    font-weight: bold;
  }
</style>
{/literal}

<!-- メインコンテンツ[start] -->
<div id="mi_main_contents">

  <div id="mi_top_nav">
    <!-- パンくずリスト start -->
    <div class="mi_breadcrumb_list">
      <a href="/index/menu">TOP</a>&nbsp;&gt;&nbsp;
      {if $certificateFlg == true}
        <a href="/e-contract-api/e-contract-api/certificate-regist">電子証明書再申請</a></div>
      {else}
        <a href="/e-contract-api/e-contract-api/certificate-regist">電子証明書申請</a></div>
      {/if}
    <!-- パンくずリスト end -->
  </div>

  <!-- コンテンツエリア start -->
  <div id="mi_content_area">

    <!-- コンテンツタイトル start -->
    <div class="mi_content_title">
      {if $certificateFlg == true}
        <h1><span class="icon-memo mi_content_title_icon"></span>&nbsp;電子証明書再申請</h1>
      {else}
        <h1><span class="icon-memo mi_content_title_icon"></span>&nbsp;電子証明書申請</h1>
      {/if}
        <!-- <p class="mi_content_atention">
          ※只今、電子証明書の発行ができない状況となっており誠に恐縮ですが、<br>
          電子契約機能をこれからご利用頂く企業様に詳細含めて共有させて頂ければと存じますので、<br>
          お手数ですが、当社迄ご連絡の程頂けますと幸いでございます。※0120-979-542/サポートデスク
        </p> -->
    </div>
    <!-- コンテンツタイトル end -->

    <!-- エラーメッセージ表示エリア begin -->
    {if $errorList|@count gt 0}
    <p class="errmsg mb10">
    下記にエラーがあります。<br />
      <strong>
        {foreach from=$errorList item=error}
          {foreach from=$error item=row}
            {$row}<br>
          {/foreach}
        {/foreach}
      </strong>
    </p>
    {/if}
    <!-- エラーメッセージ表示エリア end -->

    {if $credentialFlg == false}
      <div class="mi_pagenation">
        <div class="mi_pagenation_result mi_flt-r">
          クレデンシャルが発行されていません。
        </div>
      </div>
    {else}
      <form action="/e-contract-api/certificate-regist" method="post" >
        <div class="mi_table_main_wrap mi_table_input_right_wrap_all">
          <table class="mi_table_input_right mi_table_main">
            <tbody>
              <tr>
                <th class="mi_check_td"></th>
                <th class="mi_tabel_title">名前<span class="required">必須</span></th>
                <td colspan="3" class="mi_tabel_content">
                  <input type="text" class="f_name_ mi_default_input input_hidden" name="lastname" value="{$form.lastname|escape}" autocomplete="off" placeholder="氏"/>
                  <input type="text" class="f_name_ mi_default_input input_hidden" name="firstname" value="{$form.firstname|escape}" autocomplete="off" placeholder="名"/>
                </td>
              </tr>
              <tr>
                <tr>
                  <th class="mi_check_td"></th>
                  <th class="mi_tabel_title">フリガナ<span class="required">必須</span></th>
                  <td colspan="3" class="mi_tabel_content">
                    <input type="text" class="f_name_ mi_default_input input_hidden" name="lastnameReading" value="{$form.lastnameReading|escape}" autocomplete="off" placeholder="氏(カナ)"/>
                    <input type="text" class="f_name_ mi_default_input input_hidden" name="firstnameReading" value="{$form.firstnameReading|escape}" autocomplete="off" placeholder="名(カナ)"/>
                  </td>
                </tr>
              </tr>
              <tr>
                <th class="mi_check_td"></th>
                <th class="mi_tabel_title">所属部署<span class="required">必須</span></th>
                <td colspan="3" class="mi_tabel_content">
                  <input type="text" class="f_mail mi_default_input input_hidden" name="department" value="{$form.department|escape}"/>
                </td>
              </tr>
              <tr>
                <th class="mi_check_td"></th>
                <th class="mi_tabel_title">役職<span class="required">必須</span></th>
                <td colspan="3" class="mi_tabel_content">
                  <input type="text" class="f_mail mi_default_input input_hidden" name="title" value="{$form.title|escape}"/>
                </td>
              </tr>
              <tr>
                <th class="mi_check_td"></th>
                <th class="mi_tabel_title">メールアドレス<span class="required">必須</span></th>
                <td colspan="3" class="mi_tabel_content">
                  <input type="email" class="mi_default_input input_hidden" name="email" value="{$form.email|escape}" style="width: 420px;"/>
                </td>
              </tr>
              <tr>
                <th class="mi_check_td"></th>
                <th class="mi_tabel_title">電話番号<span class="required">必須</span></th>
                <td colspan="3" class="mi_tabel_content">
                  <input type="text" class="f_mail mi_default_input input_hidden" name="phone" value="{$form.phone|escape}"/>
                </td>
              </tr>
              <tr>
                <th class="mi_check_td"></th>
                <th class="mi_tabel_title">郵便番号<span class="required">必須</span></th>
                <td colspan="3" class="mi_tabel_content">
                  〒<input type="text" class="f_mail mi_default_input input_hidden" name="postalCode" value="{$form.postalCode|escape}"/>
                </td>
              </tr>
              <tr>
                <th class="mi_check_td"></th>
                <th class="mi_tabel_title">所在地住所<span class="required">必須</span></th>
                <td colspan="3" class="mi_tabel_content">
                  <input type="text" class="f_mail mi_default_input input_hidden" name="address" value="{$form.address|escape}"/>
                </td>
              </tr>
              <tr>
                <th class="mi_check_td"></th>
                <th class="mi_tabel_title">法人名<span class="required">必須</span></th>
                <td colspan="3" class="mi_tabel_content">
                  <input type="text" class="f_mail mi_default_input input_hidden" name="organizationName" value="{$form.organizationName|escape}"/>
                </td>
              </tr>
              <tr>
                <th class="mi_check_td"></th>
                <th class="mi_tabel_title">法人番号<span class="required">必須</span></th>
                <td colspan="3" class="mi_tabel_content">
                  <input type="text" class="f_mail mi_default_input input_hidden" name="corporationNumber" value="{$form.corporationNumber|escape}"/>
                </td>
              </tr>
              <tr>
                <th class="mi_check_td"></th>
                <th class="mi_tabel_title">屋号<span class="required">必須</span></th>
                <td colspan="3" class="mi_tabel_content">
                  <input type="text" class="f_mail mi_default_input input_hidden" name="businessName" value="{$form.businessName|escape}"/>
                </td>
              </tr>
              <tr>
                <th class="mi_check_td"></th>
                <th class="mi_tabel_title">確認コード<span class="required">必須</span></th>
                <td colspan="3" class="mi_tabel_content">
                <input pattern="^[0-9]+$" minlength="8" maxlength="8" type="text" class="f_mail mi_default_input input_hidden" placeholder="半角数字8文字でご入力ください。" name="onetimepass" value="{$form.onetimepass|escape}"/> <br> ※後程、送付される書類にご記載頂きます。
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="mi_contract_agre_wrap">
          ◆同意事項<br>
            JCAN証明書利用者の義務に同意し遵守すること。<br><br>

            【JCAN証明書利用者の義務】<br>
            ・JIPDEC(一般財団法人日本情報経済社会推進協会)によりLRA(Local Registration Authority)認定を受けた株式会社にしがき<br>
              (以下、LRAは株式会社にしがきを指す)が発行するJCAN証明書を利用し、以下に述べる義務を守ることに同意する。<br>
            ・LRAの社員と誤解されないようにJCAN証明書を使用する。<br>
            ・LRAによる個人情報の利用/開示（業務、監査/認定/訴訟対応）及び検証者によるJCAN証明書に記載された個人情報の利用/開示（業務、検証、監査/認定対応）に同意する。<br>
            ・LRAがJCAN証明書のパスワードを生成した場合、JCAN証明書及び<br>
              パスワードをバックアップすることに同意する。<br>
            ・JCAN証明書ポリシ(注)の諸条件を承諾し許可された用途にのみJCAN証明書を使用する。<br>
              (注)詳細は「30-5300 JCAN証明書ポリシ」<a target="_blank" href="https://www.jipdec.or.jp/repository/">https://www.jipdec.or.jp/repository/</a>を参照。<br>
            ・JCAN証明書を安全な環境下で使用する。<br>
            ・JCAN証明書が有効でなくなった場合は、使用をやめる。<br>
            ・JCAN証明書の記載事項の変更は、速やかにLRAに知らせる。<br>
            ・JCAN証明書がインストールされたPC又は媒体の紛失、盗難は、速やかにLRAに知らせる。<br>
            ・JCAN証明書の信頼性が損なわれる可能性がある場合は、速やかにLRAに知らせる。<br>
            ・LRAまたはJCAN認証局によるJCAN証明書の失効を認める。 <br>
          </div>
        <div class="btn_client_submit_area">
          {if $certificateFlg == true}
            <button type="submit" class="mi_default_button">同意して再申請する</button>
          {else}
            <button type="submit" class="mi_default_button">同意して申請する</button>
          {/if}
        </div>
      </form>
    {/if}
  </div>
  <!-- コンテンツエリア end -->
</div>
<!-- メインコンテンツ[end] -->

{include file="./common/footer.tpl"}
