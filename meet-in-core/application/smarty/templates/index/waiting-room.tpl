{include file="./common/header-simple-dark.tpl"}
<!-- メインコンテンツ[start] -->

{include file="./negotiation/negotiation-setting-bodypix.tpl"}

<div id="mi_main_contents">

	<!-- コンテンツエリア start -->
	<div id="mi_content_area">

		<!-- コンテンツ左 -->
		<div class="content-left">

			<div class="content-media">
				<div id="video-area">
					<canvas id="myCanvasTmp" width="300" height="150" style="object-fit: cover; position: absolute; width: 100%; height: 100%; display: none;"></canvas>
					<canvas id="myCanvasBg" width="300" height="150"  style="object-fit: cover; position: absolute; width: 100%; height: 100%; display: none;"></canvas>
					<canvas id="myCanvasBodyPix" width="300" height="150" style="object-fit: cover; position: absolute; width: 100%; height: 100%; display: none;"></canvas>
					<canvas id="myCanvasHideBackground" width="300" height="150" style="object-fit: cover; position: absolute; width: 100%; height: 100%; display: none;"></canvas>
				</div>
				<div class="video-gradient"></div>
				<div class="upper-top-menu">
					{if $browser != 'IE' && $browser != 'Safari'}
					<a class="icon cycle" href="javascript:void(0)" id="button_setting_bodypix">
						<img class="upper-top-menu-img" src="/img/icon-photo-white.svg" style="width: 20px; height: 18px;">
					</a>
					{/if}
					<a class="icon cycle" href="javascript:void(0)" id="button_setting_camera_dialog">
						<img class="upper-top-menu-img" src="/img/icon-setting.png" style="display: none;">
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

			{* 準備中表示から処理が正常に進まない場合表示 *}
			<div style="display: none" id="case-connection-failure">
				<span>ルームへの接続に失敗しました。</span>
				<div class="text">
					ネットワーク環境またはマイク・イヤホン・カメラの<br>接続機器をご確認のうえ、再接続をお願いいたします。
				</div>
				<span>推奨環境の確認は<a href="javascript:void(0);" onclick="window.open('https://manual.meet-in.jp/?p=540', '_blank');" style="text-decoration:underline;">こちら</a></span>
				<div>
					<button type="button" class="btn-join-room" onclick="window.location.reload()">再接続</button>
				</div>
			</div>

			{* 入室待機画面（ホストいない状態）*}
			<div style="display: none" id="case-waiting">
				<span>入室できない状態</span>
				<div>
					<button style="display: none" type="button" class="btn-leave-room" onclick="leaveRoom()">退室する</button>
				</div>
			</div>

			{* ホスト待機画面 *}
			<div style="display: none" id="case-host-waiting">
				<span>入室できない状態（ホスト待機用）</span>
				<div style="display: none" id="input-name-area-waiting">
					<input type="text" id="input-user-name-waiting" value="{$user_name}" placeholder="名前を入力して下さい（任意）" maxlength="20" />
				</div>
				<div id="case-waiting-btn-area">
					<button type="button" class="btn-leave-room" onclick="leaveRoom()">退室する</button>
					<button type="button" class="btn-waiting-host-room" onclick="setWaitingHostStatusAndView()">参加する</button>
				</div>
				<div>
					<button style="display: none" type="button" class="btn-leave-room host-waiting" onclick="leaveRoom()">退室する</button>
				</div>
			</div>

			{* 入室待機画面（ホストいる状態） *}
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

			{* ロックルーム入室リクエスト画面 *}
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
				<h3>入室できませんでした</h3>
				<div class="text">
					ホスト側が別の方とオンライン接続中のため、<br>しばらくしてから再度入室をお試しください。
				</div>
				<div>
					<button type="button" class="btn-leave-room" onclick="removeKnockRoom()">退室する</button>
				</div>
			</div>


		</div>

		{include file="./negotiation/negotiation-setting-camera.tpl"}

	</div>

	<input type="hidden" id="user_id" value="{$user_id}"/>
	<input type="hidden" id="staff_type" value="{$staff_type}"/>
	<input type="hidden" id="staff_id" value="{$staff_id}"/>

	<input type="hidden" id="room_name" value="{$room_name}"/>
	<input type="hidden" id="room_mode" value="{$room_mode}"/>
	<input type="hidden" id="browser" value="{$browser}"/>
	<input type="hidden" id="is_operator" value="{$is_operator}"/>
	<input type="hidden" id="negotiation_room_type" value="{$negotiation_room_type}"/>

	<!-- Bodypix設定 start -->
	<input type="hidden" id="bodypix_background_path" value="{$bodypix_background_path}">
	<script>
		{if $is_operator != '1'}
		{literal}
		const BACKGROUND_EFFECT_ID = 'bodypix_background_path';
		let strage_val = localStorage.getItem(BACKGROUND_EFFECT_ID);
		if(document.getElementById(BACKGROUND_EFFECT_ID).value != strage_val && strage_val != null) {
		   document.getElementById(BACKGROUND_EFFECT_ID).value =  strage_val;
		}
		{/literal}
		{/if}
	</script>
	<a href="#" style="display: none;" id="button_setting_bodypix">背景画像設定</a>
	<!-- Bodypix設定 end -->

	<div style="display: none" id="error_messeg" class="error__small">エラーメッセージ</div>
	<!-- コンテンツエリア end -->
</div>

<div  style="display: none" class="non_reccomend_modal">
	<div class="content">

		<ul class="cause">
		</ul>

		<div class="link">
			詳細は<a href="https://manual.meet-in.jp/?p=540" target="_blank" rel="noopener" class="non_reccomend_link">こちら</a>
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

<!-- BodyPix Start -->
{if $browser != 'IE' && $browser != "Safari"}
<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.2" defer></script>
<script src="https://cdn.jsdelivr.net/npm/@tensorflow-models/body-pix@2.0" defer></script>
<script src="/js/negotiation/negotiation_bodypix_dialog.js?{$application_version}" defer></script>
{if $browser == "Chrome" && $negotiation_room_type == 0}
<!-- hideBackground Start -->
<script src="/js/negotiation/negotiation_hide_background.js?{$application_version}" defer></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/selfie_segmentation.js" crossorigin="anonymous" defer></script>
{else if $negotiation_room_type === 1}
<!-- MCU -->
<script src="/js/negotiation/negotiation_bodypix.js?{$application_version}" defer></script>
{/if}
<!-- hideBackground End -->
<link rel="stylesheet" href="/css/bodypix_dialog.css?{$application_version}">
{/if}
<!-- BodyPix End -->

<link rel="stylesheet" href="/css/waiting-room.css?{$application_version}">
<script type="text/javascript" src="/js/negotiation/waiting_room.js?{$application_version}" charset="utf-8"></script>


</body>
</html>

