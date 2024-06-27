<div id="negotiation_share_screen" class="layout-0" style="width: 100%; height: 100%; display:none; filter: brightness(95%);">
		<div id="negotiation_share_screen_relative" class="video_block">
			<video id="video_share_screen" autoplay playsinline style="position:absolute; width: 100%; height: 100%;"></video>
			<div id="video_share_screen_image_area">
				<img id="video_share_screen_image" src="" style="width:100%; height:100%; object-fit:scale-down; display:none;"/>
			</div>
		</div>
		<div id="negotiation_share_screen_icon_frame" style="position:absolute; top:0px; left:0px; width: 100%; height: 100%; display:block;">
			<div id="video_share_screen_frame_type_icon" class="mi_video_icon_full mi_video_icon_wrap">
				<span class="icon-full-screen mi_video_icon"></span>
				<span class="mi_icon_text">全面表示</span>
			</div>
			<div id="video_share_screen_close_icon" class="mi_video_icon_reduced mi_video_icon_wrap">
				<span class="icon-reduced-screen mi_video_icon"></span>
				<span class="mi_icon_text">非表示</span>
			</div>
{if $browser === 'IE'}
{else}
			<div class="mi_video_icon_wrap video_full-screen_icon small" id="fullscreen_screenshare_btn">
				<span class="mi_video_icon">
				<img src="/img/all-full-screen.png"/>
				</span>
				<span class="mi_icon_text">全画面</span>
			</div>
{/if}
			<div class="mi_over-lay"></div>
		</div>
	<div id="button_reconnect_screen_stream" class="mi_video_icon_wrap screen_stream_reconnect_icon">
		<span class="icon-businesscard mi_video_icon"></span>
		<span class="mi_icon_text">更新</span>
	</div>

	<input type="hidden" id="video_share_screen_connection_id" value=""/>
	<input type="hidden" id="video_share_screen_stream_id" value=""/>
	<input type="hidden" id="video_share_screen_stream_check_timer" value=""/>
	<button class="close_share_screen_btn mi_video_icon_wrap" id="close_share_screen_btn" style="display:none"><span class="icon-close"></span></button>
</div>
{if $browser === 'IE'}
{else}
<video id="video_capture_screen" autoplay playsinline style="display: none;"></video>
<canvas id="canvas_capture_screen" style="display: none;"></canvas>
{/if}