{include file="./common/header.tpl"}

<!-- メインコンテンツ[start] -->
<div id="mi_main_contents">

  <div id="mi_top_nav">
    <!-- パンくずリスト start -->
    <div class="mi_breadcrumb_list">
      <a href="/index/menu">TOP</a>&nbsp;&gt;&nbsp;
      <a href="/e-contract-api/e-contract-api/certificate">電子証明書付与状況</a></div>
    <!-- パンくずリスト end -->
  </div>

  <!-- コンテンツエリア start -->
  <div id="mi_content_area">

    <!-- コンテンツタイトル start -->
    <div class="mi_content_title">
      <h1><span class="icon-businesscard mi_content_title_icon"></span>&nbsp;電子証明書付与状況</h1>
      {if $certificateFlg == 1}
        <div class="mi_flt-r">
          <div class="mi_content_title_option">
            <a href="/e-contract-api/certificate-regist" class="mi_title_action_btn">
              <span class="icon-edit"></span>
              <span>再申請</span>
            </a>
          </div>
        </div>
      {/if}
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

    {if $credential}
      <div class="mi_table_main_wrap mi_table_input_right_wrap">
        <table class="mi_table_input_right mi_table_main">
          <tbody>
            <tr>
              <td class="mi_tabel_title">電子証明書付与状況</td>
              <td class="txtinp mi_tabel_content">
                {if $certificateFlg == 1}
                  付与済み
                {elseif $certificateFlg == 0 && $certificate != NULL}
                  申請中
                {else}
                  未申請
                {/if}
              </td>
            </tr>
            <tr>
              <td class="mi_tabel_title">有効開始時刻</td>
              <td class="txtinp mi_tabel_content">{$certificate.validFrom}</td>
            </tr>
            <tr>
              <td class="mi_tabel_title">有効終了時刻</td>
              <td class="txtinp mi_tabel_content">{$certificate.validTo}</td>
            </tr>
            <tr>
              <td class="mi_tabel_title">申請日時</td>
              <td class="txtinp mi_tabel_content">{$certificate.create_date}</td>
            </tr>
            <tr>
              <td class="mi_tabel_title">名前</td>
              <td class="txtinp mi_tabel_content">{$certificate.lastname} {$certificate.firstname}</td>
            </tr>
            <tr>
              <td class="mi_tabel_title">フリガナ</td>
              <td class="txtinp mi_tabel_content">{$certificate.lastnameReading} {$certificate.firstnameReading}</td>
            </tr>
            <tr>
              <td class="mi_tabel_title">役職</td>
              <td class="txtinp mi_tabel_content">{$certificate.title}</td>
            </tr>
            <tr>
              <td class="mi_tabel_title">所属部署</td>
              <td class="txtinp mi_tabel_content">{$certificate.department}</td>
            </tr>
            <tr>
              <td class="mi_tabel_title">メールアドレス</td>
              <td class="txtinp mi_tabel_content">{$certificate.email}</td>
            </tr>
            <tr>
              <td class="mi_tabel_title">電話番号</td>
              <td class="txtinp mi_tabel_content">{$certificate.phone}</td>
            </tr>
            <tr>
              <td class="mi_tabel_title">郵便番号</td>
              <td class="txtinp mi_tabel_content">{$certificate.postalCode}</td>
            </tr>
            <tr>
              <td class="mi_tabel_title">所在地住所</td>
              <td class="txtinp mi_tabel_content">{$certificate.address}</td>
            </tr>
            <tr>
              <td class="mi_tabel_title">法人名</td>
              <td class="txtinp mi_tabel_content">{$certificate.organizationName}</td>
            </tr>
            <tr>
              <td class="mi_tabel_title">法人番号</td>
              <td class="txtinp mi_tabel_content">{$certificate.corporationNumber}</td>
            </tr>
            <tr>
              <td class="mi_tabel_title">屋号</td>
              <td class="txtinp mi_tabel_content">{$certificate.businessName}</td>
            </tr>
          </tbody>
        </table>
      </div>
    {else}
      <div class="mi_pagenation">
        <div class="mi_pagenation_result mi_flt-r">
          クレデンシャルが発行されていません。
        </div>
      </div>
    {/if}

  </div>
  <!-- コンテンツエリア end -->
</div>
<!-- メインコンテンツ[end] -->

{include file="./common/footer.tpl"}
