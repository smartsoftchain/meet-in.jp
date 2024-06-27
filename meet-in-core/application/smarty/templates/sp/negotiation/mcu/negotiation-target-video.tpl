<div id="negotiation_target_video_{$video_id}" data-id="{$video_id}" data-room-mode="{if $video_id == $this_id}{$room_mode}{/if}" class="video_target_area {if $room_mode == 1}{if $video_id == $this_id}big_video_area{else}small_video_area{/if}{/if}" style="{if $video_id == $this_id && $room_mode == 1}display: block;{/if}">
	<!-- マイクのミュート begin -->
	{if $video_id != $this_id}
		<img src="/img/sp/png/mute.png" class="img_mute" id="negotiation_target_mute_{$video_id}" data-id="{$video_id}" data-muted="false">
	{/if}
	<!-- マイクのミュート end -->

	<!-- カメラOFF時に表示する画像 begin -->
	<img src="/img/sp/png/video_off.png" class="img_video_off" id="img_video_off_{$video_id}" data-id="{$video_id}">

	<!-- カメラOFF時に表示する画像 end -->
	<video id="video_target_video_{$video_id}" class="video_style beauty_mode_off" autoplay playsinline data-id="{$video_id}"></video>
	<audio id="video_target_audio_{$video_id}" autoplay playsinline></audio>

	<!-- マイクのON/OFFのアイコンを表示する begin -->
	<div class="{if $video_id == $this_id}sp_vertial_video_mic_off_icon{else}sp_video_mic_off_icon{/if} {if $video_id == $this_id}sp_own_mic_off_icon{/if}" id="video_target_mic_{$video_id}">
		<img src="/img/video_mic_off.svg" alt="マイクOFF">
	</div>

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