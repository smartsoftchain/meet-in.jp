<div id="negotiation_target_video_{$video_id}" data-id="{$video_id}" class="video_target_area {if $video_id == $this_id}big_video_area{else}small_video_area{/if}" style="{if $video_id == $this_id}display: block;{/if}">
	<!-- マイクのミュート begin -->
	{if $video_id != $this_id}
		<img src="/img/sp/png/mute.png" class="img_mute" id="negotiation_target_mute_{$video_id}" data-id="{$video_id}" data-muted="false">
	{/if}
	<!-- マイクのミュート end -->

	<!-- カメラOFF時に表示する画像 begin -->
	<img src="/img/sp/png/video_off.png" class="img_video_off" id="img_video_off_{$video_id}" data-id="{$video_id}">
<!--
	<img src="/img/sp/svg/mute videos__icon.svg" class="img_video_off" id="img_video_off_{$video_id}" data-id="{$video_id}">
-->

	<!-- カメラOFF時に表示する画像 end -->
	<video id="video_target_video_{$video_id}" class="video_style" autoplay playsinline data-id="{$video_id}"></video>
	<audio id="video_target_audio_{$video_id}" autoplay playsinline></audio>

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