<link rel="stylesheet" href="/css/sp/loading.css?{$application_version}">
<div class="content_wrap {if $room_mode == 2}zindex1002{/if}" id="content_wrap">
	<div class="loading_wrap">
		<img src="/img/sp/gif/loading.gif" class="loading_animation">
		<p class="loading_text">準備中です。<br>少々お待ちください。</p>
	</div>

	<!-- 接続失敗モーダル -->
	<div id="overlay" class="overlay"></div>
	<div class="connectionFailedModal">
		<img src="/img/sp/png/connection_failed.png" class="connectionFailedModal__img">
		<div class="connectionFailedModal__textArea">
			<p class="connectionFailedModal__title">接続失敗</p>
			<p class="connectionFailedModal__subTitle">
				接続できませんでした。<br />
				しばらく経ってから掛け直してください。
			</p>
		</div>
		<button id="return" class="connectionFailedModal__return returnBtn">もどる</button>
	</div>
	<!-- 接続失敗モーダル END -->
</div>