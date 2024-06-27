<div id="sound_debug" style="position:absolute; top:50px; left:60px; z-index:99999999; display:none">

	<table>
		<tr>
			<td>Type : </td>
			<td>
				<select id="type" onchange="updateAudioFilter()">
					<option>LPF
					</option>
					<option>HPF
					</option>
					<option>BPF
					</option>
					<option>LowShelf
					</option>
					<option selected>HighShelf
					</option>
					<option>Peaking
					</option>
					<option>Notch
					</option>
					<option>AllPass
					</option>
				</select>
			</td>
		</tr>
		<tr>
			<td>Freq : </td>
			<td>
				<input type="range" min="100" max="2000" id="freq" size="10" onchange="updateAudioFilter()" value="700"/>
			</td>
			<td>
				<div id="freqlabel">5000</div>
			</td>
		</tr>
		<tr>
			<td>Q : </td>
			<td>
				<input type="range" min="-100" max="100" step="0.1" id="q" size="10" onchange="updateAudioFilter()" value="0"/>
			</td>
			<td>
				<div id="qlabel">5</div>
			</td>
		</tr>
		<tr>
			<td>Gain : </td>
			<td>
				<input type="range" min="-100" max="100" id="gain" size="10" onchange="updateAudioFilter()" value="-100"/>
			</td>
			<td>
				<div id="gainlabel">0</div>
			</td>
		</tr>
	</table>
	<br/>
	<p>
		<canvas id="cvs" width=512 height=256></canvas>
	</p>
</div>
