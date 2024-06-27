<!-- フッター start -->
<footer class="mi_video" style="z-index:100000002;">

	<!-- 右側サイドバー start -->
	{include file="./negotiation/negotiation-right.tpl"}
	<!-- 右側サイドバー end -->

	<div class="mi_footer_link_button" id="negotiation_bottom">
		<!-- 資料選択 start -->
		<div class="document_select_wrap document_addition_wrap">
			<div class="move_thumbnail_prev {if $room_mode == 2}view_only_control_footer{/if}" id="move_thumbnail_prev">
				<span class="icon-menu-05"></span>
			</div>
			<div class="mi_document_select material_button_tooltip {if $room_mode == 2}view_only_control_footer{/if}" id="negotiation_bottom_document_select">
				<ul>
				</ul>
				<!--<span class="icon-menu-06 mi_document_arrow_icon"></span>-->
			</div>
			<div class="move_thumbnail_next {if $room_mode == 2}view_only_control_footer{/if}" id="move_thumbnail_next">
				<span class="icon-menu-06"></span>
			</div>
		</div>
		<div class="footer_button_wrap">
			<!-- 資料選択 end -->
			{if $browser === 'Chrome' || $browser === 'Safari'}
				<button type="button" name="button" class="mi_screen_share screenshare_button_tooltip {if $room_mode == 2}view_only_control_footer{/if} footer_button_share_screen footer_small_button" id="button_share_screen"><span class="icon-window-share mi_footer_icon"></span><br>画面共有</button>
			{/if}
			{if $browser !== 'Chrome'}
				<button type="button" name="button" class="mi_notes_share {if $room_mode == 2}view_only_control_footer{/if} footer_small_button footer_button_share_memo" id="button_share_memo"><span class="icon-memo mi_footer_icon"></span><br>共有メモ</button>
			{else}
				<button type="button" name="button" class="mi_notes_share {if $room_mode == 2}view_only_control_footer{/if} footer_small_button" id="button_share_memo"><span class="icon-memo mi_footer_icon"></span><br>共有メモ</button>
			{/if}

			<button type="button" name="button" class="mi_notes_share {if $room_mode == 2}view_only_control_footer{/if} footer_large_button" id="button_white_board"><span class="icon-whiteboard mi_footer_icon"></span><br>ホワイトボード</button>

			{if $browser === 'Chrome'}
			<button type="button" name="button" class="mi_notes_share screencapture_button_tooltip {if $room_mode == 2}view_only_control_footer{/if} footer_large_button" id="button_capture_screen"><img src="/img/screen_capture.png" class="icon_footer_image"/><br>画面キャプチャ</button>
				{if !$negotiation_audio_text_lock && $staff_type!=="ZZ"}
				<button type="button" name="button" class="mi_notes_share audio_text_button_tooltip footer_large_button" id="button_audio_text">
					<img src="/img/sp/svg/audio_text2.svg" class="icon_footer_image"/><br>文字起こし
					<div id="tmp_message_audio_text" class="temporary_message_area">音声分析中は文字起こしを使用できません<br><span class="temporary_second_text_stop_analysis">音声分析を停止してください</span></div>
				</button>
				{/if}
				{if !$negotiation_audio_analysis_lock && $staff_type!=="ZZ"}
					<button type="button" name="button" class="mi_notes_share footer_large_button" id="button_sentiment_analysis">
						<img src="/img/svg/icon_sentiment_mike_white.svg" class="icon_footer_image icon_footer_mike"/>
						<div class="title_sentiment_analysis">音声分析<div class="run_sentiment_analysis"></div></div>
							<div id="tmp_message_sentiment_analysis" class="temporary_message_area">文字起こし中は音声分析を使用できません<br><span class="temporary_second_text_stop">文字起こしを停止してください</span></div>
							<div id="tmp_message_run_sentiment_analysis" class="temporary_message_area">音声分析を実行中です</div>
							<div id="tmp_message_regist_sentiment_analysis" class="temporary_message_area">音声分析結果を登録中です<br><span class="temporary_second_text_wait">しばらくお待ちください</span></div>
							<div id="tmp_message_no_time_alert_sentiment_analysis" class="temporary_message_area no_time_alert_area">
								<span class="alert_modal_contents">
									<img src="/img/svg/icon_sentiment_mike_white.svg" class="icon_alert_mike_image"/>
									音声分析の残り時間が0:00です
								</span>
							</div>
					</button>
					<button type="button" style="display:none;" id="dummy_stop_sentiment_analysis"></button>
				{/if}
			{/if}
			<button type="button" name="button" class="mi_notes_share {if $room_mode == 2}view_only_control_footer{/if} footer_small_button" id="button_chat_board"><span class="icon-comment-02 mi_footer_icon"></span><br>チャット</button>
		</div>
	</div>

	<div class="remove_material {if $room_mode == 2}view_only_control_footer{/if}" ondragover="materialDragOver(event)" ondrop="removeMaterial(event)" >
		<span class="icon-delete"></span>
		<div class="del_message">資料削除</div>
	</div>

</footer>
<!-- フッター end -->

<!--
<div id="negotiation_bottom">
	<button type="button" id="button_target_video_on">相手のビデオを表示</button>
	<button type="button" id="button_target_video_off">相手のビデオを非表示</button>
</div>
-->
