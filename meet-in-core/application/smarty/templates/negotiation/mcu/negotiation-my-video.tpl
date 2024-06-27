<div id="negotiation_my_video" data-id="{$video_id}" class="mi_video_wrap video_wrap">
	<div class="video_outer_block">
		<div id="negotiation_my_video_relative" class="mi_nomal_video_size video_block" style="width: 100%; height: 100%; display:none;">
			<video id="video_my_video" class="video_basis" muted autoplay style="position: absolute;width: 100%; height: 100%;"></video>
		</div>
		<div id="negotiation_my_video_relative_no_video" class="mi_nomal_video_size video_block" style="width: 100%; height: 100%;">
			<div style="width:100%; height:66%;">
				<div class="video_userimg_wrap">
					<div class="video_userimg_wrap_inner">
						<img id="video_my_video_background_image" {if $is_operator == 0}class="no_face_img" src="/img/icon_face.png"{else}src="{$user.profile_image}"{/if} style="position:absolute; width:100%; height:66%; object-fit:scale-down;"/>
					</div>
				</div>
			</div>
			<div class="video_offimg_area">
				<div class="video_offimg_wrap">
					<img id="video_my_video_background_image_camera" src="/img/icon_video_off.png" />
				</div>
				<div class="video_offimg_wrap">
					<img id="video_my_video_background_image_mic" src="/img/icon_mic_off.png" />
				</div>
			</div>
		</div>
		<div class="icon_frame">
			<div class="mi_video_icon_wrap video_big_icon" data-id="{$video_id}">
				<span class="icon-full-screen mi_video_icon"></span>
				<span class="mi_icon_text">拡大表示</span>
			</div>
			<div class="mi_video_icon_wrap video_small_icon" data-id="{$video_id}">
				<span class="icon-reduced-screen mi_video_icon"></span>
				<span class="mi_icon_text">縮小表示</span>
			</div>
			<div class="mi_over-lay"></div>
		</div>
		<input type="hidden" id="video_my_video_background_image_hidden" {if $is_operator == 0}value="/img/icon_face.png"{else}value="{$user.profile_image}"{/if}/>
	</div>
</div>