<div id="negotiation_target_video_{$video_id}" data-id="{$video_id}" class="mi_video_wrap video_wrap layout-{$video_id}">
	<div class="video_outer_block">
		<div id="negotiation_target_video_relative_{$video_id}" class="video_block" style="display:none">
			<div id="video_target_video_area_{$video_id}" class="video_basis" style="object-fit: cover;position:absolute; width: 100%; height: 100%; min-height:110px" data-id="{$video_id}">
			{if $browser === 'Edge'}
				<video id="video_target_video_{$video_id}" class="video_basis" autoplay playsinline style="object-fit: cover;position:absolute; height: 100%;" data-id="{$video_id}">
			{else}
				<video id="video_target_video_{$video_id}" class="video_basis" autoplay playsinline style="object-fit: cover;position:absolute; width: 100%; height: 100%;" data-id="{$video_id}">
			{/if}
				</video>
				{if $user_id == $video_id}
				<canvas id="myCanvasTmp" width="640px" height="480px" style="object-fit: cover; position: absolute; width: 100%; height: 100%; display: none;"></canvas>
				<canvas id="myCanvasBg" style="object-fit: cover; position: absolute; width: 100%; height: 100%; display: none;"></canvas>
				<canvas id="myCanvasBodyPix" style="object-fit: cover; position: absolute; width: 100%; height: 100%; display: none;"></canvas>
				{/if}
				<!-- マイクのON/OFFのアイコンを表示する -->
				<div class="video_mic_off_icon_wrap">
					{if $user_id == $video_id}
						<img src="/img/video_mic_off.svg" alt="マイクOFF" class="video_mic_off_icon" id="video_mic_off_icon">
					{else}
						<img src="/img/video_mic_off.svg" alt="マイクOFF" class="other_video_mic_off_icon_{$video_id} other_video_mic_off_icon" id="other_video_mic_off_icon_{$video_id}">
					{/if}
				</div>
				<!-- ユーザー名を表示する -->
				<div class="video_user_name_wrap on_video">
					<p class="user_name"></p>
				</div>
			</div>
			<audio id="video_target_audio_{$video_id}" autoplay playsinline></audio>
			{if $browser === 'IE'}
			{else}
				{if $user_id === $video_id}
				{else}
					<div id="video_target_connecting_{$video_id}" class="connecting_efect">
					</div>
				{/if}
			{/if}
		</div>
		<div id="negotiation_target_video_relative_no_video_area_{$video_id}">
			<div id="negotiation_target_video_relative_no_video_{$video_id}" class="mi_nomal_video_size video_block">
				<div style="width:100%; height:66%;">
					<div class="video_userimg_wrap">
						<div class="video_userimg_wrap_inner">
							<img id="video_target_video_background_image_{$video_id}" src="/img/icon_face.png" style="position:absolute; width:100%; height:66%; object-fit:scale-down;"/>
						</div>
					</div>
				</div>
				<div class="video_offimg_area">
					<div class="video_offimg_wrap">
						<img id="video_target_video_background_image_camera_{$video_id}" src="/img/icon_video_off.png"/>
						<!-- <span class="icon-video-off video_target_video_background_image_camera"></span> -->
					</div>
					<div class="video_offimg_wrap">
						<img id="video_target_video_background_image_mic_{$video_id}" src="/img/icon_mic_off.png" />
						<!-- <span class="icon-mic-off video_target_video_background_image_mic"></span> -->
					</div>
				</div>
				<!-- ユーザー名を表示する -->
				<div class="video_user_name_wrap no_video">
					<p class="user_name"></p>
				</div>
			</div>
		</div>
		<div id="video_target_icon_area_{$video_id}">
			<div id="video_target_icon_{$video_id}" class="icon_frame">
				{*<div class="mi_card_icon" id="button_negotiation_namecard"><span class="icon-businesscard"></span></div>*}
				<div class="mi_video_icon_wrap video_big_icon" data-id="{$video_id}">
					<span class="icon-cursor02 mi_video_icon"></span>
					<span class="mi_icon_text">拡大</span>
				</div>
				<div class="mi_video_icon_wrap video_small_icon" data-id="{$video_id}">
					<span class="icon-full-screen mi_video_icon"></span>
					<span class="mi_icon_text">標準</span>
				</div>
				<div class="mi_video_icon_wrap video_remove_icon" data-id="{$video_id}">
					<span class="icon-close mi_video_icon"></span>
					<span class="mi_icon_text">非表示</span>
				</div>
				<div class="mi_video_icon_wrap video_card_icon" data-id="{$video_id}">
					<span class="icon-businesscard mi_video_icon"></span>
					<span class="mi_icon_text">名刺</span>
				</div>

				{if $user_id === $video_id}
				{else}
				<div class="mi_video_icon_wrap stream_reconnect_icon" data-id="{$video_id}">
					<span class="icon-connect mi_video_icon"></span>
					<span class="mi_icon_text">更新</span>
				</div>
				<div class="mi_video_icon_wrap video_full-screen_icon" data-id="{$video_id}">
					<span class="mi_video_icon">
					<img src="/img/all-full-screen.png"/>
					</span>
					<span class="mi_icon_text">全画面</span>
				</div>
				<div class="mi_video_icon_wrap video_mute_audio" data-id="{$video_id}" data-muted="false">
					<span class="icon-microphone mi_video_icon"></span>
					<span class="mi_icon_text">消音</span>
				</div>
				{/if}

				<div class="mi_over-lay"></div>
			</div>
		</div>
	</div>
	<input type="hidden" id="video_target_video_connection_id_{$video_id}" value=""/>
	<input type="hidden" id="video_target_video_stream_id_{$video_id}" value=""/>
	<input type="hidden" id="video_target_video_stream_check_timer_{$video_id}" value=""/>
	<input type="hidden" id="video_target_audio_connection_id_{$video_id}" value=""/>
	<input type="hidden" id="video_target_audio_stream_id_{$video_id}" value=""/>
	<input type="hidden" id="negotiation_target_video_old_left_{$video_id}" value="none"/>
	<input type="hidden" id="target_video_staff_type_{$video_id}" value=""/>
	<input type="hidden" id="target_video_staff_id_{$video_id}" value=""/>
	<input type="hidden" id="target_video_client_id_{$video_id}" value=""/>
</div>

<div id="share_screen_modal" style="display:none;">
	<div class="share_screen_icon_wrapper">
		<img src="/img/icon_screen_share.png"/>
	</div>
	<div class="share_screen_modal_title_wrap">
		<span class="share_screen_modal_title">あなたの画面が全員に共有されています</span>
	</div>
	<div class="share_screen_modal_content_wrap">
		<span class="share_screen_modal_content">
			この表示がされていると録画機能を利用中に、<br>
			共有した画面が映像に反映されません。<br>
			反映させる場合は、以下のボタンを押してください。
		</span>
	</div>
	<div class="modal_button_wrap">
		<button id="modal_button">非表示にする</button>
	</div>
</div>