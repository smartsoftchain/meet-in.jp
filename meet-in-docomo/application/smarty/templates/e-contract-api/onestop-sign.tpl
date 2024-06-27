{include file="./common/header.tpl"}

<!-- メインコンテンツ[start] -->
<div id="mi_main_contents">
  <!-- コンテンツエリア start -->
	<div id="mi_content_area">
    {if $certificateFlg == 1 && $signImage != NULL}
      <form action="/e-contract-api/onestop-sign" method="post" enctype="multipart/form-data">
        <div>
          <h4>契約情報</h4>
          <table>
            <tr>
              <th>文書名称</th>
              <td><input type="text" name="name" value="{$form.name|escape}" /></td>
            </tr>
            <tr>
              <th>金額有無</th>
              <td>
                <input type="radio" name="haveAmount" value="0" checked="checked" /> 無し
                <input type="radio" name="haveAmount" value="1" /> 有り
              </td>
            </tr>
            <tr>
              <th>契約金額</th>
              <td><input type="number" name="amount" value="{$form.amount|escape}" /> 円</td>
            </tr>
            <tr>
              <th>合意日</th>
              <td><input type="date" name="agreementDate" value="{$form.agreementDate|escape}" /></td>
            </tr>
            <tr>
              <th>発効日</th>
              <td><input type="date" name="effectiveDate" value="{$form.effectiveDate|escape}" /></td>
            </tr>
            <tr>
              <th>終了日</th>
              <td><input type="date" name="expireDate" value="{$form.expireDate|escape}" /></td>
            </tr>
            <tr>
              <th>自動更新有無</th>
              <td>
                <input type="radio" name="autoRenewal" value="0" checked="checked" /> 無し
                <input type="radio" name="autoRenewal" value="1" /> 有り
              </td>
            </tr>
            <tr>
              <th>任意の管理番号</th>
              <td><input type="text" name="managementNumber" value="{$form.managementNumber|escape}" /></td>
            </tr>
            <tr>
              <th>任意のコメント</th>
              <td><input type="text" name="comment" value="{$form.comment|escape}" /></td>
            </tr>
          </table>
        </div>
        <div>
          <h4>書類情報（PDFのみ、複数添付可）</h4>
          <input type="file" name="documents[]" multiple="mulutiplu" accept="application/pdf">
        </div>
        <div>
          <h4>現在設定中の印影</h4>
          <img src="data:image/png;base64, {$signImage.data}">
        </div>
        <div>
          <h4>パートナー印影画像</h4>
          <table>
            <tr>
              <th>1行目（10文字以下）</th>
              <td><input type="text" name="sign1" value="{$form.sign1|escape}" /></td>
            </tr>
            <tr>
              <th>2行目（10文字以下）</th>
              <td><input type="text" name="sign2" value="{$form.sign2|escape}" /></td>
            </tr>
            <tr>
              <th>3行目（10文字以下）</th>
              <td><input type="text" name="sign3" value="{$form.sign3|escape}" /></td>
            </tr>
            <tr>
              <th>4行目（10文字以下）</th>
              <td><input type="text" name="sign4" value="{$form.sign4|escape}" /></td>
            </tr>
          </table>
        </div>
        <div>
          <h4>パートナー情報</h4>
          <table>
            <tr>
              <th>氏名</th>
              <td><input type="text" name="lastname" value="{$form.lastname|escape}" /><input type="text" class="f_name_" name="firstname" value="{$form.firstname|escape}"/></td>
            </tr>
            <tr>
              <th>役職</th>
              <td><input type="text" name="title" value="{$form.title|escape}" /></td>
            </tr>
            <tr>
              <th>法人名</th>
              <td><input type="text" name="organizationName" value="{$form.organizationName|escape}" /></td>
            </tr>
            <tr>
              <th>メールアドレス</th>
              <td><input type="email" name="email" value="{$form.email|escape}" /></td>
            </tr>
          </table>
        </div>
        <p><input type="submit" value="登録する"  /></p>
      </form>
    {elseif  $certificateFlg == 0}
      電子証明書が付与されていません。
    {else}
      印影が設定されていません。
    {/if}
  </div>
  <!-- コンテンツエリア end -->
</div>
<!-- メインコンテンツ[end] -->

{include file="./common/footer.tpl"}
