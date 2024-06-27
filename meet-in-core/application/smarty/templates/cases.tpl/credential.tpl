{include file="./common/header.tpl"}

<!-- メインコンテンツ[start] -->
<div id="mi_main_contents">
  <!-- コンテンツエリア start -->
	<div id="mi_content_area">
    <div>
      クレデンシャル発行状況：
      {if $credentialFlg == true}
        有効
      {else}
        無効
        <form action="/e-contract-api/credential" method="post" >
          <p class="btn_area w_mainr"><input type="submit" class="button orange" value="クレデンシャルを発行する"  /></p>
        </form>
      {/if}
    </div>
  </div>
  <!-- コンテンツエリア end -->
</div>
<!-- メインコンテンツ[end] -->

{include file="./common/footer.tpl"}
