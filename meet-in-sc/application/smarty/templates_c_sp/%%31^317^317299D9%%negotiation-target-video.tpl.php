<?php /* Smarty version 2.6.26, created on 2020-09-04 12:59:56
         compiled from ./negotiation/negotiation-target-video.tpl */ ?>
<div id="negotiation_target_video_<?php echo $this->_tpl_vars['video_id']; ?>
" data-id="<?php echo $this->_tpl_vars['video_id']; ?>
" class="video_target_area <?php if ($this->_tpl_vars['video_id'] == $this->_tpl_vars['this_id']): ?>big_video_area<?php else: ?>small_video_area<?php endif; ?>" style="<?php if ($this->_tpl_vars['video_id'] == $this->_tpl_vars['this_id']): ?>display: block;<?php endif; ?>">
	<!-- マイクのミュート begin -->
	<?php if ($this->_tpl_vars['video_id'] != $this->_tpl_vars['this_id']): ?>
		<img src="/img/sp/png/mute.png" class="img_mute" id="negotiation_target_mute_<?php echo $this->_tpl_vars['video_id']; ?>
" data-id="<?php echo $this->_tpl_vars['video_id']; ?>
" data-muted="false">
	<?php endif; ?>
	<!-- マイクのミュート end -->

	<!-- カメラOFF時に表示する画像 begin -->
	<img src="/img/sp/png/video_off.png" class="img_video_off" id="img_video_off_<?php echo $this->_tpl_vars['video_id']; ?>
" data-id="<?php echo $this->_tpl_vars['video_id']; ?>
">
<!--
	<img src="/img/sp/svg/mute videos__icon.svg" class="img_video_off" id="img_video_off_<?php echo $this->_tpl_vars['video_id']; ?>
" data-id="<?php echo $this->_tpl_vars['video_id']; ?>
">
-->

	<!-- カメラOFF時に表示する画像 end -->
	<video id="video_target_video_<?php echo $this->_tpl_vars['video_id']; ?>
" class="video_style" autoplay playsinline data-id="<?php echo $this->_tpl_vars['video_id']; ?>
"></video>
	<audio id="video_target_audio_<?php echo $this->_tpl_vars['video_id']; ?>
" autoplay playsinline></audio>

	<input type="hidden" id="video_target_video_connection_id_<?php echo $this->_tpl_vars['video_id']; ?>
" value=""/>
	<input type="hidden" id="video_target_video_stream_id_<?php echo $this->_tpl_vars['video_id']; ?>
" value=""/>
	<input type="hidden" id="video_target_video_stream_check_timer_<?php echo $this->_tpl_vars['video_id']; ?>
" value=""/>
	<input type="hidden" id="video_target_audio_connection_id_<?php echo $this->_tpl_vars['video_id']; ?>
" value=""/>
	<input type="hidden" id="video_target_audio_stream_id_<?php echo $this->_tpl_vars['video_id']; ?>
" value=""/>
	<input type="hidden" id="negotiation_target_video_old_left_<?php echo $this->_tpl_vars['video_id']; ?>
" value="none"/>
	<input type="hidden" id="target_video_staff_type_<?php echo $this->_tpl_vars['video_id']; ?>
" value=""/>
	<input type="hidden" id="target_video_staff_id_<?php echo $this->_tpl_vars['video_id']; ?>
" value=""/>
	<input type="hidden" id="target_video_client_id_<?php echo $this->_tpl_vars['video_id']; ?>
" value=""/>


</div>