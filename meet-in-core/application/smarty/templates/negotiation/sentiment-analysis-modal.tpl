<!-- ====================================== 音声分析 開始モーダル[begin] ======================================== -->
<div id="modal-content-start_sentiment_analysis">
	<div class="mi_modal_default">
		<div class="mi_modal_type_m">
			<p class="sa_modal_message">音声分析を開始します。</p>
			<div>
				<button type="button" id="btn_start_cancel_sentiment_analysis" class="sa_btn_cancel">キャンセル</button>
				<button type="button" id="btn_start_sentiment_analysis" class="mi_default_button">開始</button>
			</div>
		</div>
	</div>
</div>
<!-- ====================================== 音声分析 開始モーダル[end] ======================================== -->
<!-- ====================================== 音声分析 終了モーダル[begin] ======================================== -->
<div id="modal-content-stop_sentiment_analysis">
	<div class="mi_modal_default">
		<div class="mi_modal_type_m">
			<p class="sa_modal_message">音声分析を停止します。</p>
			<div>
				<button type="button" id="btn_stop_cancel_sentiment_analysis" class="sa_btn_cancel">キャンセル</button>
				<button type="button" id="btn_stop_sentiment_analysis" class="mi_default_button">停止</button>
			</div>
		</div>
	</div>
</div>
<!-- ====================================== 音声分析 終了モーダル[end] ======================================== -->
<!-- ====================================== 音声分析 中モーダル[begin] ======================================== -->
<div id="modal-content-running_sentiment_analysis" class="mcrsa_area">
	<div class="mcrsa_contents">
		<div class="mcrsaa_close_area btn_stop_confirm_sentiment_analysis" >
			<img src="/img/svg/icon_sentiment_close.svg"/>
		</div>
		<div class="mcrsa_main">
			<div class="mcrsaa_mike"><img src="/img/svg/icon_sentiment_mike_orange.svg"/></div>
			<div class="mcrsaa_message">
				音声分析中…
				<span id="audio-analysis-time-countdown_area">
				残り時間 :
            <span id="audio-analysis-time-countdown-left">00</span>
            <span id="audio-analysis-time-countdown-colon">:</span>
            <span id="audio-analysis-time-countdown-right">00</span>
        </span>
			</div>
			<div class="mcrsaa_stop btn_stop_confirm_sentiment_analysis">
				<button><img src="/img/svg/icon_sentiment_stop.svg"/>停止</button>
			</div>
			<div class="clear_both">
		</div>
	</div>
</div>
<!-- ====================================== 音声分析 中モーダル[end] ======================================== -->