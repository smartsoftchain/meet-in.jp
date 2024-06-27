<div id="setting-camera-dialog" class="modal_content ui-front ui-dialog-osx ui-dialog-buttons" tabindex="-1" role="dialog" aria-describedby="common_dialog_rubr1mm89blbalxo" aria-labelledby="ui-id-1" style="display:none; padding: 0; border-bottom-right-radius: 6px; ">

	{*最大解像度：*}
	{*<button type="button" id="setting-camera-dialog-select-resolution-button" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only" role="button">*}
		{*<span class="ui-button-text">既定</span>*}
		{*<input type="hidden" id="setting-camera-dialog-select-resolution" value="default"/>*}
	{*</button>*}

    <div class="modal_body" style="background-color: #eeeeee;">

	{if $browser != 'IE'}
		<div class="container setting-video-input-group" style="background-color: #eeeeee; overflow: hidden;">
			<div style="width: 330px; margin: 10px; display: inline-block;">
				<video id="video-input" width="330px" height="190px"></video>

				<table id="video-off-area" class="mi_tabel_content mi_table_input_right" style="background-color: #eeeeee; margin: auto;">
					<tbody>
						<tr>
							<td class="" style="">
								<img src="/img/image_camera_off.png" style="width: auto; max-height: 190px;">
							</td>
						</tr>
					</tbody>
				</table>

			</div>

			<div style="width: 180px; height: 190px; display: inline-block;">

				<table class=" mi_camera_setting_table"
						style="width: 100%;background-color: #eeeeee;">
					<tbody>
						<tr>
							<td class="mi_tabel_content" style="height: 12px;">
							</td>
						</tr>
						<tr>
							<td class="mi_tabel_content" style="text-align: center; line-height: 1.6; height: 40px; background-color: white; border:1px solid #e8e8e8; vertical-align: middle;">
								カメラ
							</td>
							<td class="text-meetin-color-off" id="video_stat"
								style="text-align: center;font-weight: bold;font-size: 20px; line-height: 1.6; height: 40px; background-color: white; border:1px solid #e8e8e8; vertical-align: middle;">
							</td>
						</tr>
						<tr>
							<td class="mi_tabel_content" style="text-align: center; line-height: 1.6; height: 40px; background-color: white; border:1px solid #e8e8e8; vertical-align: middle;">
								マイク
							</td>
							<td class="text-meetin-color-off" id="audio_stat"
								style="text-align: center;font-weight: bold;font-size: 20px; line-height: 1.6; height: 40px; background-color: white; border:1px solid #e8e8e8; vertical-align: middle;">
							</td>
						</tr>
						{if $browser === 'Chrome'}
						<tr>
							<td class="mi_tabel_content" style="text-align: center; line-height: 1.6; height: 40px; background-color: white; border:1px solid #e8e8e8; vertical-align: middle;">
								スピーカー
							</td>
							<td class="text-meetin-color-off" id="speaker_stat"
								style="text-align: center;font-weight: bold;font-size: 20px; line-height: 1.6; height: 40px; background-color: white; border:1px solid #e8e8e8; vertical-align: middle;">
							</td>
						</tr>
						{/if}
					</tbody>
				</table>

			</div>
		</div>
	{/if}

		<div class=" setting-video-input-group" style="height: 20px;"><p>&nbsp;</p></div>

		<div class="mi_tabel_title">
			<span class="icon-video mi_default_label_icon_2"></span>カメラ設定&nbsp;
			<span id="video-off" class="setting_navigation_area">※カメラがOFFになっているかお使いのブラウザでカメラが許可されていません。対処方法は
				<span id="btnVdoQ" style="color: red; text-decoration: underline; cursor: pointer;">こちら</span>。
			</span>
		</div>

		<div class="mi_table_main_wrap mi_table_input_right_wrap setting-video-input-group" style="min-height: auto;">
			<table class=" setting_table">
				<tbody>
				{if $browser === 'IE'}
				<tr>
					<th class="setting_th textalign_center ">利用するカメラを選択してください</th>
					<td class="setting_td ">
						<select id="setting-camera-dialog-camera-list-flash" class="setting_input_select"></select>
					</td>
				</tr>
				{else}
				<tr>
					<th class="setting_th textalign_center">利用するカメラを選択してください</th>
					<td class="setting_td" style="height: 42px;">
						<select id="setting-camera-dialog-camera-list" class="setting_input_select"></select>
					</td>
				</tr>
				{/if}

				{if $browser === 'IE'}
				<tr>
					<th class="setting_th textalign_center">最大フレームレート(1～15)</th>
					<td class="setting_td" style="height: 42px;">
						<input type="range" name="fpsrate" min="1" max="15" step="1" id="video-setting-framerate" style="width: 280px; border: none;" class="setting_range_flash">&nbsp;&nbsp;
						<span id="framerate-value"></span>
					</td>
				</tr>
				{/if}
				{if $browser === 'Chrome'}
				<tr>
					<th class="setting_th textalign_center">最大フレームレート(1～15)</th>
					<td class="setting_td" style="height: 42px;">
						<input type="range" name="fpsrate" min="1" max="15" step="1" id="video-setting-framerate" style="width: 280px; border: none;">&nbsp;&nbsp;
						<span id="framerate-value"></span>
					</td>
				</tr>
				{/if}

				{if $browser === 'Chrome' || $browser === 'Firefox' || $browser === 'Safari'}
				<tr>
					<th class="setting_th textalign_center ">輝度(-100～150)</th>
					<td class="setting_td " style="height: 42px;">
						<input type="range" name="brightness" min="-100" max="150" step="1" value="0" id="video-setting-brightness" style="width: 280px; border: none;">&nbsp;&nbsp;
						<span id="brightness-value"></span>
					</td>
				</tr>
				{/if}

				{if $browser !='Edge'}
				<tr>
					<th class="setting_th textalign_center">映像の品質</th>
					<td class="setting_td" style="height: 42px;">
						<label><input type="radio" name="receive_bandwidth_level" value="0">低</label>
						<label><input type="radio" name="receive_bandwidth_level" value="1">中低</label>
						<label><input type="radio" name="receive_bandwidth_level" value="2">中</label>
						<label><input type="radio" name="receive_bandwidth_level" value="3">中高</label>
						<label><input type="radio" name="receive_bandwidth_level" value="4">高</label>
					</td>
				</tr>
				{/if}

				{if $browser === 'Chrome' || $browser === 'Firefox' || $browser === 'Safari'}
				<tr style="display: none;">
					<th class="setting_th textalign_center">ビューティーモード</th>
					<td class="setting_td" style="height: 42px;">
						<input type="radio" id="beauty_mode_off" name="beauty_mode" value="0"><label for="beauty_mode_off">OFF</label>
						<input type="radio" id="beauty_mode_on" name="beauty_mode" value="1"><label for="beauty_mode_on">ON</label>
					</td>
				</tr>
				{/if}

				</tbody>
			</table>
		</div>

		<div class="setting-video-input-group" style="height: 20px;"><p>&nbsp;</p></div>

		<div class="mi_tabel_title">
			<span class="icon-microphone mi_default_label_icon_2"></span>マイク設定&nbsp;
			<span id="audio-off" class="setting_navigation_area">※マイクがOFFになっているかお使いのブラウザでマイクが許可されていません。対処方法は
				<span id="btnMicQ" style="color: red; text-decoration: underline; cursor: pointer;">こちら</span>。
			</span>
		</div>

		<div class="mi_table_main_wrap mi_table_input_right_wrap" style="min-height: auto;">
			<table class="setting_table">
				<tbody>
					{if $browser === 'IE'}
					<tr>
						<th class="setting_th textalign_center">利用するマイクを選択してください</th>
						<td class="setting_td">
							<select id="setting-camera-dialog-mic-list-flash" class="setting_input_select"></select>
						</td>
					</tr>
					{else}
					<tr>
						<th class="setting_th textalign_center">利用するマイクを選択してください</th>
						<td class="setting_td">
							<select id="setting-camera-dialog-mic-list" class="setting_input_select"></select>
						</td>
					</tr>
					{/if}

					{if $browser === 'Chrome' || $browser === 'Firefox' || $browser === 'Safari'}
					<tr>
						<th class="setting_th textalign_center">マイク音量</th>
						<td class="setting_td">
							<div id="audio-meter" class="row ml-1 base-visualize-render">
								<div class="h-100 cal-visualize-render bg-ber-off"></div>
								<div class="h-100 cal-visualize-render bg-ber-off"></div>
								<div class="h-100 cal-visualize-render bg-ber-off"></div>
								<div class="h-100 cal-visualize-render bg-ber-off"></div>
								<div class="h-100 cal-visualize-render bg-ber-off"></div>
								<div class="h-100 cal-visualize-render bg-ber-off"></div>
								<div class="h-100 cal-visualize-render bg-ber-off"></div>
								<div class="h-100 cal-visualize-render bg-ber-off"></div>
								<div class="h-100 cal-visualize-render bg-ber-off"></div>
								<div class="h-100 cal-visualize-render bg-ber-off"></div>
								<div class="h-100 cal-visualize-render bg-ber-off"></div>
								<div class="h-100 cal-visualize-render bg-ber-off"></div>
								<div class="h-100 cal-visualize-render bg-ber-off"></div>
								<div class="h-100 cal-visualize-render bg-ber-off"></div>
								<div class="h-100 cal-visualize-render bg-ber-off"></div>
								<div class="h-100 cal-visualize-render bg-ber-off"></div>
								<div class="h-100 cal-visualize-render bg-ber-off"></div>
								<div class="h-100 cal-visualize-render bg-ber-off"></div>
								<div class="h-100 cal-visualize-render bg-ber-off"></div>
								<div class="h-100 cal-visualize-render bg-ber-off"></div>
							</div>
						</td>
					</tr>
					{/if}
					{if  $browser != 'IE' && $browser !== 'Chrome'}
					<tr>
						<th class="setting_th textalign_center">テスト音声
							<button type="button" id="btnAudioTest" class="btn_icon btn-primary-outline " style="line-height: 2; vertical-align: middle;"
								data-toggle="tooltip" data-html="true" data-container="body">
								<i class="material-icons icon_line" style="font-size: 20px;">help_outline</i>
							</button>
						</th>
						<td class="setting_td">
							<!-- 再生ボタン -->
							<button id="btn-play" type="button" class="btn_icon bnt_audio_pley">
								<img src="/img/audio-play.svg" width="50">
							</button>
							<input type="range" name="boss" min="0" max="1" step="0.2" value="1" id="audio_vol"
								style="padding-left: 10px;width: 270px;  border: none;" />
						</td>
					</tr>
					{/if}
				</tbody>
			</table>
		</div>

		{if $browser === 'Chrome'}
		<div class="setting-video-input-group" style="height: 20px;"><p>&nbsp;</p></div>

		<div class="mi_tabel_title">
			<span class="icon-microphone mi_default_label_icon_2"></span>スピーカー設定&nbsp;
		</div>
		<div class="mi_table_main_wrap mi_table_input_right_wrap" style="min-height: auto;">
			<table class="setting_table">
				<tbody>
					<tr id="setting-camera-dialog-speaker-select-area" class="active">
						<th class="setting_th textalign_center" style="font-size: 14px;">利用するスピーカーを選択してください</th>
						<td class="setting_td">
							<select id="setting-camera-dialog-speaker-list" class="setting_input_select"></select>
						</td>
					</tr>
					<tr>
						<th class="setting_th textalign_center">テスト音声
							<button type="button" id="btnAudioTest" class="btn_icon btn-primary-outline " style="line-height: 2; vertical-align: middle;"
								data-toggle="tooltip" data-html="true" data-container="body">
								<i class="material-icons icon_line" style="font-size: 20px;">help_outline</i>
							</button>
						</th>
						<td class="setting_td">
							<!-- 再生ボタン -->
							<button id="btn-play" type="button" class="btn_icon bnt_audio_pley">
								<img src="/img/audio-play.svg" width="50">
							</button>
							<input type="range" name="boss" min="0" max="1" step="0.2" value="1" id="audio_vol" style="width: 280px; border: none;">

						</td>
					</tr>
				</tbody>
			</table>
		</div>
		{/if}
		{if $browser !== 'IE'}
		<!-- 音声ファイル -->
		<audio id="bgm1" preload loop>
			<source src="/img/p01.mp3" type="audio/mp3">
		</audio>
		{/if}

	</div>
	<!-- /.modal-body -->

	<div class="modal_footer justify-content-center" style="background-color: #eeeeee; font-size: 16px;">
		<button type="button" id="setting-camera-dialog-cancel-button" class="modal_footer_btn btn-secondary btn-seminar-setting-cancel" data-dismiss="modal">キャンセル</button>
		<button type="button" id="setting-camera-dialog-save-button" class="modal_footer_btn btn-meetin btn-seminar-setting-save" id="seminar-setting-save">保存する</button>
	</div>
	<!-- /.modal-footer -->
</div>