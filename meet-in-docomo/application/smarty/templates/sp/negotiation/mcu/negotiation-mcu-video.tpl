<canvas id="local_video_canvas" style="display: none;"></canvas>
<video id="local_video" autoplay playsinline style="display: none;"></video>
<video id="video_target_video_horizontalbox" autoplay playsinline style="display: none;"></video>
<div id="negotiation_video_area_squarebox" data-id="{$video_id}" data-room-mode="{$room_mode}" class="video_target_area {if $room_mode == 1} big_video_area {/if}" style="display: block; height: 100%;">
	<!-- カメラOFF時に表示する画像 begin -->
	<img src="/img/sp/png/video_off.png" class="img_video_off" id="img_video_off_{$video_id}" data-id="{$video_id}">
	<!-- カメラOFF時に表示する画像 end -->
	<video id="video_target_video_squarebox" class="video_style beauty_mode_off" autoplay playsinline data-id="{$video_id}"></video>
	<audio id="video_target_audio_{$video_id}" autoplay playsinline></audio>

	<!-- マイクのON/OFFのアイコンを表示する end -->
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