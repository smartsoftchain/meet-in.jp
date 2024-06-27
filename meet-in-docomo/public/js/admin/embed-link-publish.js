$('#submit_button').click(function(){

	const join_str = "-";
	let prefix = $("#embed_link_url").val().replace(/\//g, join_str);
	if(0 < prefix.length && !prefix.match(/^[0-9a-zA-Z\-_]{1,32}$/)) {
		alert("接頭辞は空白以外の半角英数字で32文字以内で入力して下さい");
		$('#embed_link_form').val(null);
		return;
	}
	if(0 < prefix.length && prefix.slice(-1) != join_str) {
		prefix = prefix + join_str;
	}
	let make_tag ='<div class="mi_connect_input_wrap"><p class="mi_connect_input_title">接続はこちらから</p><input type="text" placeholder="ルーム名" id="mi_connect_input" /><button class="mi_connect_input_button" onclick=\'var set_url = document.getElementById("mi_connect_input").value; window.open("https://docomodx.aidma-hd.jp/room/'+ prefix +'" + set_url, "_blank");\'>接続</button></div>';
	$('#embed_link_form').val(make_tag);
});
