$('#submit_button').click(function(){
	$('#embed_link_form').val('<div><input type="text" id="connect_no" value="" placeholder="000-0000-0000" with data-grouplength="3,4,4"><input type="text" id="user_info" value="" placeholder="山田 太郎" ><button type="button" name="button" id="connect" onclick="onClickMeetinEmbedConnectionButton(' + "'" + window.location.hostname + "'" + ');">接 続</button><script type="text/javascript" src="https://' + window.location.hostname + '/js/connection/prepare-connection-embed.js"></script></div>');
});
