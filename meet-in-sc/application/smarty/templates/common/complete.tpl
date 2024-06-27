{include file="./common/header.tpl"}

<div id="contentsarea">

	<h1><span>{$param.screenTitle}</span></h1>
	<div class="contents">

		<div class="main_c">
			<h2>{$param.contentTitle}</h2>

			{if $param.selectItemName != ""}
				<p class="aln_l">「{$param.selectItemName}」</p>
			{/if}
			
			<p class="aln_l">{$param.completeMsg}</p>

			<p class="btn_area">
				<a href="/index/menu"><input type="button" class="button orange" value="ホームへ" /></a>
				{if $param.transitionUrl != "" && $param.transitionName != ""}
					<a href="{$param.transitionUrl}"><input type="button" class="button orange" value="{$param.transitionName}" /></a>
				{/if}
			</p>
		</div>

	</div><!--contents -->
</div><!--contentsarea -->

{include file="./common/footer.tpl"}