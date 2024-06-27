{include file="./common/header.tpl"}

<!-- メインコンテンツ[start] -->
<div id="mi_main_contents">
  <!-- コンテンツエリア start -->
	<div id="mi_content_area">
    {if $certificateFlg == true}
      <h3>電子証明書再申請</h3>
    {else}
      <h3>電子証明書申請</h3>
    {/if}
    <form action="/e-contract-api/certificate-regist" method="post" >
      <table>
        <tr>
          <th>氏名</th>
          <td><input type="text" class="f_name_" name="lastname" value="{$form.lastname|escape}" /><input type="text" class="f_name_" name="firstname" value="{$form.firstname|escape}"/></td>
        </tr>
        <tr>
          <th>氏名（カナ）</th>
          <td><input type="text" class="f_name_" name="lastnameReading" value="{$form.lastnameReading|escape}"/><input type="text" class="f_name_" name="firstnameReading" value="{$form.firstnameReading|escape}"/></td>
        </tr>
        <tr>
          <th>役職</th>
          <td><input type="text" class="f_name" name="title" value="{$form.title|escape}" /></td>
        </tr>
        <tr>
          <th>所属部署</th>
          <td><input type="text" class="f_name" name="department" value="{$form.department|escape}" /></td>
        </tr>
        <tr>
          <th>メールアドレス</th>
          <td><input type="email" class="f_mail" name="email" value="{$form.email|escape}" /></td>
        </tr>
        <tr>
          <th>電話番号</th>
          <td><input type="text" class="f_name" name="phone" value="{$form.phone|escape}" /></td>
        </tr>
        <tr>
          <th>郵便番号</th>
          <td><input type="text" class="f_name" name="postalCode" value="{$form.postalCode|escape}" /></td>
        </tr>
        <tr>
          <th>所在地住所</th>
          <td><input type="text" class="f_name" name="address" value="{$form.address|escape}" /></td>
        </tr>
        <tr>
          <th>法人名</th>
          <td><input type="text" class="f_name" name="organizationName" value="{$form.organizationName|escape}" /></td>
        </tr>
        <tr>
          <th>法人番号</th>
          <td><input type="text" class="f_name" name="corporationNumber" value="{$form.corporationNumber|escape}" /></td>
        </tr>
        <tr>
          <th>屋号</th>
          <td><input type="text" class="f_name_" name="businessName" value="{$form.businessName|escape}"/></td>
        </tr>
      </table>
      {if $certificateFlg == true}
        <p class="btn_area w_mainr"><input type="submit" class="button orange" value="再申請する"  /></p>
      {else}
        <p class="btn_area w_mainr"><input type="submit" class="button orange" value="申請する"  /></p>
      {/if}
    </form>
  </div>
  <!-- コンテンツエリア end -->
</div>
<!-- メインコンテンツ[end] -->

{include file="./common/footer.tpl"}
