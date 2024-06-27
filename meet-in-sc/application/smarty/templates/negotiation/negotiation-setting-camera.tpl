<div id="setting-camera-dialog" class="ui-dialog ui-widget ui-widget-content ui-corner-all ui-front ui-dialog-osx ui-dialog-buttons" tabindex="-1" role="dialog" aria-describedby="common_dialog_rubr1mm89blbalxo" aria-labelledby="ui-id-1" style="display:none;">
	
	{*最大解像度：*}
	{*<button type="button" id="setting-camera-dialog-select-resolution-button" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only" role="button">*}
		{*<span class="ui-button-text">既定</span>*}
		{*<input type="hidden" id="setting-camera-dialog-select-resolution" value="default"/>*}
	{*</button>*}
	<div class="mi_table_main_wrap mi_table_input_right_wrap">
		<table class="mi_table_input_right mi_table_main mi_camera_setting_table">
			<tbody>
			{if $browser === 'IE'}
			<tr>
				<th class="mi_tabel_title">利用するカメラを選択してください</th>
				<td class="mi_tabel_content">
					<select id="setting-camera-dialog-camera-list-flash"></select>
				</td>
			</tr>
			{else}
			<tr>
				<th class="mi_tabel_title">利用するカメラを選択してください</th>
				<td class="mi_tabel_content">
					<select id="setting-camera-dialog-camera-list"></select>
				</td>
			</tr>
			{/if}

			{if $browser !== 'Safari'}
			<tr>
				<th class="mi_tabel_title">最大フレームレート(1～15)：</th>
				<td class="mi_tabel_content">
					<input type="range" name="fpsrate" min="1" max="15" id="setting-camera-dialog-camera-framerate"/>
					<output for="fpsrate" onforminput="value = fpsrate.valueAsNumber;"></output>
				</td>
			</tr>
			{/if}

			{if $browser === 'Chrome' || $browser === 'Safari'}
			<tr>
				<th class="mi_tabel_title">輝度(-100～150)</th>
				<td class="mi_tabel_content">
					<input type="range" name="brightness" min="-100" max="150" id="setting-camera-dialog-camera-brightness"/>
					<output for="brightness" onforminput="value = brightness.valueAsNumber;"></output>
				</td>
			</tr>
			{/if}
<!--
			<tr>
				<th class="mi_tabel_title">送信品質</th>
				<td class="mi_tabel_content">
					<input type="radio" name="send_bandwidth_level" value="0">低
					<input type="radio" name="send_bandwidth_level" value="1">中低
					<input type="radio" name="send_bandwidth_level" value="2">中
					<input type="radio" name="send_bandwidth_level" value="3">中高
					<input type="radio" name="send_bandwidth_level" value="4">高
				</td>
			</tr>
			<tr>
				<th class="mi_tabel_title">受信品質</th>
				<td class="mi_tabel_content">
					<input type="radio" name="receive_bandwidth_level" value="0">低
					<input type="radio" name="receive_bandwidth_level" value="1">中低
					<input type="radio" name="receive_bandwidth_level" value="2">中
					<input type="radio" name="receive_bandwidth_level" value="3">中高
					<input type="radio" name="receive_bandwidth_level" value="4">高
				</td>
			</tr>
-->
			<tr>
				<th class="mi_tabel_title">映像の品質</th>
				<td class="mi_tabel_content">
					<input type="radio" name="receive_bandwidth_level" value="0">低
					<input type="radio" name="receive_bandwidth_level" value="1">中低
					{if $isMobile === 0}
						<input type="radio" name="receive_bandwidth_level" value="2">中
						<input type="radio" name="receive_bandwidth_level" value="3">中高
						<input type="radio" name="receive_bandwidth_level" value="4">高
					{/if}
				</td>
			</tr>

			</tbody>
		</table>
	</div>
	<div class="ui-dialog-buttonpane ui-widget-content ui-helper-clearfix">
		<div class="ui-dialog-buttonset">
			<button type="button" id="setting-camera-dialog-cancel-button"  class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only" role="button">
				<span class="ui-button-text">キャンセル</span>
			</button>
			<button type="button" id="setting-camera-dialog-save-button" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only" role="button">
				<span class="ui-button-text">保存する</span>
			</button>
		</div>
	</div>
</div>