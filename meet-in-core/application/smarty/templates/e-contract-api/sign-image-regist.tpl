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
</style>
{/literal}

<!-- メインコンテンツ[start] -->
<div id="mi_main_contents">
  <div id="mi_top_nav">
    <!-- パンくずリスト start -->
    <div class="mi_breadcrumb_list">
      <a href="/index/menu">TOP</a>&nbsp;&gt;&nbsp;
      <a href="/e-contract-api/e-contract-api/sign-image-regist">印影画像作成・設定</a></div>
    <!-- パンくずリスト end -->
  </div>

  <!-- コンテンツエリア start -->
  <div id="mi_content_area">

    <!-- コンテンツタイトル start -->
    <div class="mi_content_title">
      <h1><span class="icon-highlight-draw mi_content_title_icon"></span>&nbsp;印影画像作成・設定</h1>
    </div>

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
      <div class="mi_pagenation">
        <div class="mi_pagenation_result mi_flt-r">
          <h3>現在設定中の印影</h3>
          {if $signImage != NULL}
            <img src="data:image/png;base64, {$signImage.data}">
          {else}
            設定中の印影はありません。
          {/if}
        </div>
      </div>

      <form action="/e-contract-api/sign-image-regist" method="post" >
        <table class="mi_table_input_right mi_table_main">
          <tbody>
            <tr>
              <th class="mi_check_td"></th>
              <th class="mi_tabel_title">1行目（10文字以下）<span class="required">必須</span></th>
              <td colspan="3" class="mi_tabel_content">
                <input type="text" class="f_mail mi_default_input input_hidden" name="sign1" value="{$form.sign1|escape}"/>
              </td>
            </tr>
            <tr>
              <th class="mi_check_td"></th>
              <th class="mi_tabel_title">2行目（10文字以下）</th>
              <td colspan="3" class="mi_tabel_content">
                <input type="text" class="f_mail mi_default_input input_hidden" name="sign2" value="{$form.sign2|escape}"/>
              </td>
            </tr>
            <tr>
              <th class="mi_check_td"></th>
              <th class="mi_tabel_title">3行目（10文字以下）</th>
              <td colspan="3" class="mi_tabel_content">
                <input type="text" class="f_mail mi_default_input input_hidden" name="sign3" value="{$form.sign3|escape}"/>
              </td>
            </tr>
            <tr>
              <th class="mi_check_td"></th>
              <th class="mi_tabel_title">4行目（10文字以下）</th>
              <td colspan="3" class="mi_tabel_content">
                <input type="text" class="f_mail mi_default_input input_hidden" name="sign4" value="{$form.sign4|escape}"/>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="btn_client_submit_area">
          <button type="submit" class="mi_default_button">作成する</button>
        </div>
      </form>
    {/if}
  </div>
  <!-- コンテンツエリア end -->
</div>
<!-- メインコンテンツ[end] -->

{include file="./common/footer.tpl"}
