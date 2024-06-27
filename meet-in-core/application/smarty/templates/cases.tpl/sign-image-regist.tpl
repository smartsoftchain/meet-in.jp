{include file="./common/header.tpl"}

<!-- メインコンテンツ[start] -->
<div id="mi_main_contents">
  <!-- コンテンツエリア start -->
	<div id="mi_content_area">
		<form action="/e-contract-api/sign-image-regist" method="post" >
      <table class="tblstyle1">
        <tr>
          <th>1行目（10文字以下）</th>
          <td><input type="text" class="f_name_" name="sign1" value="{$form.sign1|escape}" /></td>
        </tr>
        <tr>
          <th>2行目（10文字以下）</th>
          <td><input type="text" class="f_name_" name="sign2" value="{$form.sign2|escape}" /></td>
        </tr>
        <tr>
          <th>3行目（10文字以下）</th>
          <td><input type="text" class="f_name_" name="sign3" value="{$form.sign3|escape}" /></td>
        </tr>
        <tr>
          <th>4行目（10文字以下）</th>
          <td><input type="text" class="f_name_" name="sign4" value="{$form.sign4|escape}" /></td>
        </tr>
      </table>
      <p class="btn_area w_mainr"><input type="submit" class="button orange" value="作成する"  /></p>
    </form>
    <div>
      <h3>現在設定中の印影</h3>
      {if $signImage != NULL}
        <img src="data:image/png;base64, {$signImage.data}">
      {else}
        設定中の印影はありません。
      {/if}
    </div>
  </div>
  <!-- コンテンツエリア end -->
</div>
<!-- メインコンテンツ[end] -->

{include file="./common/footer.tpl"}
