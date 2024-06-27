function onClickMeetinEmbedConnectionButton(domain) {
	var connect_no = document.getElementById("connect_no").value;
	var user_info = document.getElementById("user_info").value;
	var page_from = window.location.href;

	var url = "https://" + domain + "/index?auto_dial=1&connect_no=" + connect_no + "&user_info=" + user_info + "&page_from=" + encodeURIComponent(page_from);
	window.location.href = url;
//	window.open(url, '_blank');
}