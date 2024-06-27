var recordRTC = null;

$(document).ready(function(){
	$("#startVideo").click(function(){
		startVideo();
	});
	$("#stopVideo").click(function(){
		stopVideo();
	});
	$("#connectRequest").click(function(){
		connect_request();
	});
	$("#hangUp").click(function(){
		hangUp();
	});
//	startVideo();
});

function connect_request() {
	connect(function(){
		var data = {
			userType : 2,
			sdp : document.getElementById('text-for-send-sdp').value
		};
	
		$.ajax({
			type:"get",                // method = "POST"
			url:"https://meet-in.jp/OnlineSales/SendConnectionRequestApi.php",        // POST送信先のURL
			data:data,  // JSONデータ本体
			contentType: 'application/json', // リクエストの Content-Type
			crossDomain: true,
			success: function(json_data) {   // 200 OK時
				json_data = $.parseJSON(json_data);
				
				$("#connect_no").val(json_data.connect_no);
				$("#connection_info_id").val(json_data.id);
				
				var interval = setInterval(function waitForConnection() {
					var data = {
						id : $("#connection_info_id").val()
					};
				
					$.ajax({
						type:"get",                // method = "POST"
						url:"https://meet-in.jp/OnlineSales/WaitForConnectionApi.php",        // POST送信先のURL
						data:data,  // JSONデータ本体
						contentType: 'application/json', // リクエストの Content-Type
						crossDomain: true,
						success: function(json_data) {   // 200 OK時
							json_data = $.parseJSON(json_data);
							
							if (null != json_data.operator_sdp && json_data.operator_sdp != "") {
								$("#text-for-receive-sdp").html(json_data.operator_sdp);
								onSDPText();
								clearInterval(interval);
							}
						},
						error: function() {         // HTTPエラー時
				//				alert("Server Error. Pleasy try again later.");
						},
						complete: function() {      // 成功・失敗に関わらず通信が終了した際の処理
						}
					});
				}, 1000);
			},
			error: function() {         // HTTPエラー時
//				alert("Server Error. Pleasy try again later.");
			},
			complete: function() {      // 成功・失敗に関わらず通信が終了した際の処理
			}
		});
	});
}

function accept_connection_request(id, operator_sdp, user_sdp) {
	connect(function(){
		var data = {
			id : id,
			operator_sdp : operator_sdp,
			user_sdp : user_sdp
		};
	
		$.ajax({
			type:"get",                // method = "POST"
			url:"https://meet-in.jp/OnlineSales/AcceptConnectionRequestApi.php",        // POST送信先のURL
			data:data,  // JSONデータ本体
			contentType: 'application/json', // リクエストの Content-Type
			crossDomain: true,
			success: function(json_data) {   // 200 OK時
				document.getElementById('text-for-send-sdp').value = user_sdp;
			},
			error: function() {         // HTTPエラー時
//				alert("Server Error. Pleasy try again later.");
			},
			complete: function() {      // 成功・失敗に関わらず通信が終了した際の処理
			}
		});
	});
}

function connect_by_connect_no() {
	var data = {
		connect_no : document.getElementById('connect_no').value
	};

	$.ajax({
		type:"get",                // method = "POST"
		url:"https://meet-in.jp/OnlineSales/GetConnectionInfoApi.php",        // POST送信先のURL
		data:data,  // JSONデータ本体
		contentType: 'application/json', // リクエストの Content-Type
		crossDomain: true,
		success: function(json_data) {   // 200 OK時
			json_data = $.parseJSON(json_data);
			
			$("#text-for-receive-sdp").html(json_data.operator_sdp);
			$("#connection_info_id").val(json_data.id);
			onSDPText(function() {
				accept_connection_request(json_data.id, null, document.getElementById('text-for-send-sdp').value);
			});
		},
		error: function() {         // HTTPエラー時
//				alert("Server Error. Pleasy try again later.");
		},
		complete: function() {      // 成功・失敗に関わらず通信が終了した際の処理
		}
	});
}