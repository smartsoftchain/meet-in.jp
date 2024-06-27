{if $successMsgList|@count > 0}
	<p class="mb10">
		{foreach from=$successMsgList item=msg}
			<strong class="attention">{$msg}</strong><br>
		{/foreach}
	</p>
{/if}