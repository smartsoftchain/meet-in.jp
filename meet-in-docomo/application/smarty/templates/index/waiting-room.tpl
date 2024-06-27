{include file="./common/header-simple-dark.tpl"}
<!-- メインコンテンツ[start] -->

<div id="mi_main_contents">

	<!-- コンテンツエリア start -->
	<div id="mi_content_area">

		<!-- コンテンツ左 -->
		<div class="content-left">

			<div class="content-media">
				<div id="video-area"> </div>
				<div class="upper-right-menu">
					<a class="icon cycle" href="javascript:void(0)" id="button_setting_camera_dialog">
						<img class="upper-right-menu-img" src="/img/icon-setting.png" style="display: none;">
					</a>
				</div>
				<div class="bottom-menu">
					<a class="icon cycle" href="javascript:void(0)" id="button_setting_mic">
						<img class="bottom-menu-img-mic" src="/img/icon-mic-on-white.png" style="display: none;">
					</a>
					<a class="icon cycle" href="javascript:void(0)" id="button_setting_video">
						<img class="bottom-menu-img-video" src="/img/icon-video-on-white.png"  style="display: none;">
					</a>

				</div>

			</div>

		</div>

		<!-- コンテンツ右 -->
		<div class="content-right">

			<div style="display: none" id="case-loading">
				<div class="lodingimg_efect_wrap">
					<div class="lodingimg_efect"></div>
					<p id="loding_text_id" class="loding_text">connecting<span class="point">・・・</span></p>
				</div>
				<span>準備中です。 少々お待ちください。</span>
			</div>

			<div style="display: none" id="case-waiting">
				<span>入室できない状態</span>
				<div>
					<button type="button" class="btn-leave-room" onclick="leaveRoom()">退室する</button>
				</div>
			</div>

			<div style="display: none" id="case-connection">
				<span>入室できる状態</span>
				<div style="display: none" id="input-name-area">
					<input type="text" id="input-user-name" value="{$user_name}" placeholder="名前を入力して下さい（任意）" maxlength="20" />
				</div>
				<div id="case-connection-btn-area">
					<button type="button" class="btn-leave-room" onclick="leaveRoom()">退室する</button>
					<button type="button" class="btn-join-room" onclick="joinRoom()">参加する</button>
				</div>
			</div>


			<div style="display: none" id="case-lock-enter-request">
				<h3>ホストに参加申請を送信します</h3>
				<div class="text">
					現在、こちらのルームはホストによってロックされています。<br> 「参加する」をクリックするとホストに通知され、許可され<br>た場合はルームに入室することができます。
				</div>
				<div id="input-name-area">
					<input type="text" id="input-user-name" value="{$user_name}" placeholder="名前を入力して下さい（任意）" maxlength="20" />
				</div>
				<div id="case-connection-btn-area">
					<button type="button" class="btn-leave-room" onclick="leaveRoom()">退室する</button>
					<button type="button" class="btn-join-room" onclick="knockRoom()">参加する</button>
				</div>
			</div>
			<div style="display: none" id="case-lock-response-wait">
				<div class="text">
					ホストからの返答を確認しています。<br>少々お待ちください……
				</div>
				<div class="case-lock-response-wait-btn-area">
					<button type="button" class="btn-leave-room" onclick="cancelKnockRoom()">キャンセル</button>
				</div>
			</div>
			<div style="display: none" id="case-lock-enter-request-rejected">
				<h3>入室を拒否されました</h3>
				<div class="text">
					入室を拒否されました。<br>しばらくしてから再度入室をお試しください。
				</div>
				<div>
					<button type="button" class="btn-leave-room" onclick="removeKnockRoom()">退室する</button>
				</div>
			</div>


		</div>

		{include file="./negotiation/negotiation-setting-camera.tpl"}

	</div>
	<input type="hidden" id="user_id" value="{$user_id}"/>
	<input type="hidden" id="room_name" value="{$room_name}"/>
	<input type="hidden" id="room_mode" value="{$room_mode}"/>

	<div style="display: none" id="error_messeg" class="error__small">エラーメッセージ</div>
	<!-- コンテンツエリア end -->
</div>

<div  style="display: none" class="non_reccomend_modal">
	<div class="content">

		<ul class="cause">
		</ul>

		<div class="link">
			{* 詳細は<a href="https://manual.meet-in.jp/?p=540" target="_blank" rel="noopener" class="non_reccomend_link">こちら</a> *}
		</div>
		<button class="button" onclick="closenonReccomendModal()">このまま続ける</button>
	</div>
</div>



<!-- メインコンテンツ[end] -->
<script type="text/javascript" src="/js/platform.js?{$application_version}" charset="utf-8"></script>
<script type="text/javascript" src="/js/detectSpeed.js?{$application_version}"></script>
<script type="text/javascript" src="/js/Utility.js?{$application_version}"></script>
<script type="text/javascript" src="/js/flash/flashUtility.js?{$application_version}" charset="utf-8"></script>
<script type="text/javascript" src="/js/common/check_system_requirements.js?{$application_version}" charset="utf-8"></script>
<link rel="stylesheet" href="/css/negotiation_setting.css?{$application_version}">
<script type="text/javascript" src="/js/negotiation/negotiation_setting_camera.js?{$application_version}" charset="utf-8"></script>

<link rel="stylesheet" href="/css/waiting-room.css?{$application_version}">
<script type="text/javascript" src="/js/negotiation/waiting_room.js?{$application_version}" charset="utf-8"></script>


</body>
</html>


