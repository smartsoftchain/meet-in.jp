<div id="negotiation-audio-text-area" class="audio-text-area">

    <div class="audio-text-header">
        <img class="audio_text_img" src="/img/sp/svg/audio_text.svg">
        <span class="audio-text-header-text">文字起こし</span>
        <span class="audio-text-download-span">
            <a href="#" onclick="downloadAudioTextFile();return false" class="audio-text-download-button-label">
                ダウンロード
            </a>
        </span>
        <div class="audio-text-header-close-button" id="audio-text-header-close"><span class="icon-close"></span></div>
    </div>

    <div class="audio-text-content">

        <div class="audio-text-button-area">
            <div>
                <button class="audio-text-start-button" id="audio-text-start">開始</button>
                <button class="audio-text-stop-button" id="audio-text-stop">停止</button>
            </div>
            <div id="audio-text-time" class="audio-text-time">残り時間
                <span id="audio-text-time-countdown">
                    <span id="audio-text-time-countdown-left">00</span>
                    <span id="audio-text-time-countdown-coron">:</span>
                    <span id="audio-text-time-countdown-right">00</span>
                </span>
            </div>

        </div>

        <div id="audio-text-setting-area">
            <input type="checkbox" id="sync_audio_text" name="sync_audio_text"> <label for="sync_audio_text">全員に表示</label>
        </div>

        <div class="audio-text-pagenation-area" id="audio-text-pagenation-area">
            <a class="icon-menu-05 mi_page_arrow_icon" id="icon-menu-left"></a>
            <div id="audio-text-pagenation" class="audio-text-pagenation"></div>
            <a class="icon-menu-06 mi_page_arrow_icon" id="icon-menu-right"></a>
        </div>

        <div class="audio-text-boxarea" id="audio-text-boxarea"></div>

    </div>
</div>