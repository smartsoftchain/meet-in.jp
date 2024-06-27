<!DOCTYPE html>
<html>
<head>
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>待合室</title>
<meta charset="utf-8">
<meta name="description" content="">
<meta name="author" content="">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="shortcut icon" href="/img/favicon.ico">
<link rel="stylesheet" href="/css/reset.css">
<link rel="stylesheet" href="/css/sp/button.css">
<script src="/js/jquery-1.11.2.min.js?{$application_version}"></script>
<script src="/js/jquery-ui.min.js?{$application_version}"></script>
<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0">
</head>

<body>

<!-- wrap start -->
<div id="mi_wrap">
	<!-- ヘッダー start -->
	<header>
		<!-- ワンポイントヘッダー start -->
		<div class="mi_flt-l">
			<div id="mi_header_title">
				<a {if !empty($user.client_id)}href="/index/menu"{/if} style="color:#ffffff">
					<img src="/img/meet-in_logo-2.png" alt="meet in" id="mi_header_logo"/>
				</a>
			</div>
		</div>
		<!--  ワンポイントヘッダー end -->
	</header>

	<!-- メインコンテンツ[start] -->
	<div id="mi_main_contents" style="display: none;">

		<!-- コンテンツエリア start -->
		<div id="mi_content_area">

			<div style="display: none;" id="case-lock-enter-request">
				<h3>ホストに参加申請を送信します</h3>
				<div class="text">
					現在、こちらのルームはホストによってロックされています。<br> 「参加する」をクリックするとホストに通知され、許可された場合はルームに入室することができます。
				</div>
				<div id="input-name-area">
					<input type="text" id="input-user-name" value="{$user_name}" placeholder="名前を入力して下さい（任意）" maxlength="20" />
				</div>
				<div id="case-connection-btn-area">
					<button type="button" class="btn-join-room" onclick="knockRoom()">参加する</button>
					<button type="button" class="btn-leave-room" onclick="leaveRoom()">退室する</button>
				</div>
			</div>
			<div style="display: none;" id="case-lock-response-wait">
				<div class="text">
					ホストからの返答を確認しています。<br>少々お待ちください……
				</div>
				<div class="case-lock-response-wait-btn-area">
					<button type="button" class="btn-leave-room" onclick="cancelKnockRoom()">キャンセル</button>
				</div>
			</div>
			<div style="display: block;" id="case-lock-enter-request-rejected">
				<h3>入室を拒否されました</h3>
				<div class="text">
					入室を拒否されました。<br>しばらくしてから再度入室をお試しください。
				</div>
				<div id="case-connection-btn-area">
					<button type="button" class="btn-leave-room" onclick="leaveRoom()">退室する</button>
				</div>
			</div>


		</div>
		<input type="hidden" id="user_id" value="{$user_id}"/>
		<input type="hidden" id="user_name" value="{$user_name}"/>
		<input type="hidden" id="room_name" value="{$room_name}"/>
		<input type="hidden" id="room_mode" value="{$room_mode}"/>

	</div>
	<!-- コンテンツエリア end -->

</div>

<!-- メインコンテンツ[end] -->
<link rel="stylesheet" href="/css/sp/waiting-room.css?{$application_version}">
<script type="text/javascript" src="/js/sp/negotiation/waiting_room.js?{$application_version}" charset="utf-8"></script>

</body>
</html>