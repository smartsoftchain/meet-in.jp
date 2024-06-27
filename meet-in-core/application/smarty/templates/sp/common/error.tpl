{if $errors|@count > 0 || $errMsgList|@count > 0}
	<p class="error_msg mb10">
	下記にエラーがあります。<br />
	{foreach from=$errors item=error}
		{foreach from=$error item=msg}
			<strong class="attention">{$msg}</strong><br>
		{/foreach}
	{/foreach}
	{foreach from=$errMsgList item=msg}
		<strong class="attention">{$msg}</strong><br>
	{/foreach}
	</p>
{/if}