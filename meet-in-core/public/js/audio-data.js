// 設定.
const FIRST_VIEW_LIMIT_USER_COUNT = 6;

const IMG_URL = "../img/sentiment/";
const AUDIO_ANALYSIS_PARAMS_DICTS = [
    ["#CFA900",    "laugh-squint-regular.png",    "energy",                  "エネルギー"],
    ["#333333",    "dizzy-regular.png",           "stress",                  "ストレス"],
    ["#5CB23A",    "laugh-regular.png",           "emo_cog",                 "論理/感情バランス"],
    ["#F98600",    "laugh-squint-regular.png",    "anticipation",            "期待"],
    ["#F3776F",    "laugh-squint-regular.png",    "excitement",              "興奮"],
    ["#006EAF",    "frown-regular.png",           "hesitation",              "躊躇"],
    ["#C4A1CF",    "frown-regular.png",           "uncertainty",             "不確実"],
    ["#91C97A",    "laugh-regular.png",           "intensive_thinking",      "思考"],
    ["#87419E",    "meh-regular.png",             "imagination_activity",    "想像力"],
    ["#7091CB",    "meh-regular.png",             "embarrassment",           "困惑"],
    ["#EB352C",    "laugh-regular.png",           "passionate",              "情熱"],
    ["#57216C",    "meh-regular.png",             "brain_power",             "脳活動"],
    ["#FBAA67",    "laugh-regular.png",           "confidence",              "自信"],
    ["#C62D25",    "angry-regular.png",           "aggression",              "攻撃性、憤り"],
    ["#B2B2B2",    "meh-regular.png",             "call_priority",           "コールプライオリティ"],
    ["#006F3E",    "laugh-regular.png",           "atmosphere",              "雰囲気、会話傾向"],
    ["#68D1F0",    "surprise-regular.png",        "upset",                   "動揺"],
    ["#F4C800",    "laugh-squint-regular.png",    "content",                 "喜び"],
    ["#E286D4",    "meh-regular.png",             "extreme_emotion",         "極端な起伏"],
    ["#242886",    "meh-regular.png",             "concentration",           "集中"],
    ["#00878D",    "angry-regular.png",           "dissatisfaction",         "不満"],
];
const SENTIMENT_TITLE  = 3;
const SENTIMENT_KEY    = 2;
const LINE_CHART_COLOR = 0;
const LINE_CHART_ICON  = 1;
const SENTIMENT_TITLES  = AUDIO_ANALYSIS_PARAMS_DICTS.map(e => e[SENTIMENT_TITLE]);    // リスト要素を生成.

var displayUserNo = []; // 現在画面に表示されているユーザーのNoを保持する
const chartTypes  = [
    "waveform_",            // 会話の図形
    "chart_div_speaker_"    // 感情の図形
];
var transcriptionAllDisplayFlg =false;

/**
 * Html組み立ての全てをフロント(JS)でやっていることから読み込み完了を待ち、
 * 更にサードパーティ要素の生成の完了後にCSSの調整なども行う.
 */
makeChartFormat();
makeSelectBoxFormat();
window.onload = function() {
    $('#waveform').children().find('wave').remove();
    $('#waveform').find('wave').css('scrollbar-width','none');
    $('#waveform').find('canvas').css('position','');
    $('#waveform').find('canvas').css('width','100%');
    $('#waveform').find('wave').css('height','100%');
};

/**
 * 波形を生成.
 */
const wavesurfer = WaveSurfer.create({
    container: '#waveform',
    waveColor: '#1A75B1',
    progressColor: 'orange',
    scrollParent: true,
    xhr: {
        cache: "default",
        mode: "no-cors",
        method: "GET",
        credentials: "include",
        referrer: 'client',
        headers: [
            { key: "Access-Control-Allow-Origin", value: "*"}
        ]
    }
});

/**
 * 音源クラス
 * 音声を再生し、シークバーと連動して飛ばし、再生速度を早くしたり遅くする
 */
const audio = new Audio();
audio.autoplay = false;
// audio.currentTimeが更新されるたびに実行(timeupdate) = 再生中秒数が変わる度に発火.
audio.addEventListener('timeupdate', function(e) {

    // クリックでシークバーを移動させた際にこのイベントも同時に動いてしまうため、再生中のみ動くようにする
    if(!audio.paused) {

        // シークバー要素の状態を更新
        seekBox.updateVideoSeekBar(audio.currentTime);
        // 各発話者ごとに、発話要素のoffsetを取得
        for (let i = 0; i < analysisData.length; i++) {
            getDistanceBetweenElements(i);
        }
        // 再生時間が指定幅を超えた場合、0に戻す
        if(Math.floor(audio.currentTime) === seekBox.selectedEndSec){
            audio.pause();
            $(seekBox.seekbarElem).css("width","0%")
            audio.currentTime = 0;
        }
    }
    // 現在の経過時間をセットする
    setCurrentTime();
});

/**
 * チャート全体クラス
 */
class SeekBox {
    constructor(seekboxElem, width, selectedStartSec, selectedEndSec, audioDurition, seekbarElem, soundSignOffsets) {
        this.seekboxElem = seekboxElem
        this.width = width,
        this.selectedStartSec = selectedStartSec,
        this.selectedEndSec = selectedEndSec,
        this.audioDurition = audioDurition,
        this.seekbarElem = seekbarElem,
        this.soundSignOffsets = soundSignOffsets
    }

    // 取得した時間等から、シークバーの位置を取得
    updateVideoSeekBar(playingTime) {
        this.showSeekBar(this.width / this.audioDurition * (playingTime - seekBox.selectedStartSec));
    };

    // シークバーを表示する
    showSeekBar(seekPos) {
        this.seekbarElem.css({'width': seekPos + 'px'});
    };

    // 発話部分を示す各要素のoffsetを取得する
    getSignElemOffsets(speakerId, signElem) {
        // 再生中のモーダル表示のため、発話部分要素全てのoffsetを取得
        this.soundSignOffsets[speakerId] = [];
        for (let i = 0; i < signElem.length; i++){
            this.soundSignOffsets[speakerId].push($(signElem[i]).offset().left)
        }
    }
}
/**
 * シークバーをクリックした地点へ移動させる
 */
const seekBox = new SeekBox($('.audio-main-chart-area-right'), $('.audio-main-chart-area-right').width(), null, null, null, $('.chart_seek_line'), []);
seekBox.seekboxElem.on('click', function (e) {
    let playingTime = audio.currentTime;
    let clickX = e.offsetX;
    let SeekBoxW = seekBox.width;
    let coordinate = clickX / SeekBoxW;
    audio.currentTime = seekBox.audioDurition * coordinate + seekBox.selectedStartSec;
    seekBox.showSeekBar(clickX, playingTime);
    setCurrentTime();

    if(!transcriptionAllDisplayFlg) {
        let arrowBoxElem = document.getElementsByClassName('sound_sign');
        for(var i = 0; i < arrowBoxElem.length; i++) {
            $(arrowBoxElem[i]).children('p').css("visibility","hidden");
        }
    }

});


// ========================================================================
// グラフ操作関係
// ========================================================================

/**
 * チャート領域のフォーマットの作成.
 */
function makeChartFormat() {

    // 会話コンテンツ生成.
    // 見出し部分.
    let talkDetailArea = document.getElementById('talk_detail_area');
    for(let i=0; analysisData.length>i; i++){
        // ユーザーの表示・非表示を行うためのマーク
        let userMark = 'user_mark_'+i;
        let divBlock = document.createElement('div');
        $(talkDetailArea).append(divBlock);
        divBlock.setAttribute('class','audio-main-chart-area-left-volume-area-right-block tmp_volume_height1 ' + userMark);
        divBlock.innerText = analysisData[i]["name"];
    }
    // データ部分.
    let talkChartBlock = document.getElementById('talk-chart_block');
    for(let i=0; i<analysisData.length; i++){
        let divBlock = document.createElement('div');
        $(talkChartBlock).append(divBlock);
        let chartBlock = document.createElement('div');
        chartBlock.setAttribute('class',`audio_text_chart speaker${i}`);
        $(divBlock).append(chartBlock);
        divBlock.setAttribute('class','audio-main-chart-area-right-volume-chart-area tmp_chart-height1');
        divBlock.setAttribute('id',`waveform_${i}`);
    }

    // 感情コンテンツ生成.
    // 見出し部分.
    let emotionDetailArea = document.getElementById('emotion_detail_area');
    for(let i=0; analysisData.length>i; i++){
        // ユーザーの表示・非表示を行うためのマーク
        let userMark = 'user_mark_'+i;
        let divBlock = document.createElement('div');
        $(emotionDetailArea).append(divBlock);
        divBlock.setAttribute('class','audio-main-chart-area-left-volume-area-right-block tmp_volume_height2 ' + userMark);
        divBlock.innerText = analysisData[i]["name"];
    }
    // データ部分.
    let emotionChartBlock = document.getElementById('emotion-chart_block');
    for(let i=0; i<analysisData.length; i++){
        let divBlock = document.createElement('div');
        $(emotionChartBlock).append(divBlock);
        divBlock.setAttribute('class','audio-main-chart-area-right-volume-chart-area tmp_chart-height2');
        divBlock.setAttribute('id',`chart_div_speaker_${i}`);
    }

    // 見出し共通.
    // シークバーのheightを、親要素と同じ長さに変更する
    // 即時でシークバーの高さを設定すると、まだ高さが確定していないので間を持たせる（綺麗な書き方ではないがリリース優先の暫定処理）
    setTimeout(function (){
        let contentHeight = $('.audio-main-chart-area-left').height();
        $('.chart_seek_line').css('height',contentHeight);
    } , 500);

    // Html要素の組み立てが完成したら GoogleChartを差し込む.
    google.load("visualization", "1", {packages: ["corechart", "controls"]});
    google.charts.setOnLoadCallback(drawChart);
}

function drawChart() {
    // google.chartsの読み込みが完了してから、各種グラフ表示を始める
    drawingVolumeGraph(audioUrl);
}

/**
 * 音量波形の描画.
 */
function drawingVolumeGraph(url) {
    audio.src = url;
    audio.addEventListener("loadeddata", function() {
        // 現在の再生時間をセット(データのロードが完了してからでないと、audio関係の値がNaNになってしまうため)
        seekBox.selectedStartSec = 0;
        seekBox.selectedEndSec = audio.duration;
        seekBox.audioDurition = seekBox.selectedEndSec - seekBox.selectedStartSec;
        setCurrentTime();
        showDuration();
        // チャートを生成
        for (let i = 0; i < analysisData.length; i++) {
            createAudioGraph(`speaker_${i}`);
            createAudioTextChart(i);
        }
    });
    audio.load();

    // wavesurferチャートの生成後にライブラリ側で生成されるcanvas・wave要素を調整.
    wavesurfer.on('ready', function () {
        $('#waveform').children().find('wave').remove();
        $('#waveform').find('wave').css('scrollbar-width','none');
        $('#waveform').find('wave').css('height','100%');
        $('#waveform').find('canvas').css('position','');
        $('#waveform').find('canvas').css('width','100%');
    });
    wavesurfer.load(url);
}

/**
 * 文字起こしのチャートを生成
 * 話者の人数は可変の為、一括生成ではない話者回数呼び出し.
 */
function createAudioTextChart(speakerId) {
    createAudioTextChartSection(0, seekBox.audioDurition, speakerId);
}
function createAudioTextChartSection(minTalkTime, maxTalkTime, speakerId) {
    // インスタンスの生成と、再描画を想定した初期化.
    let parentNode = $(`#waveform_${speakerId}`); // チャートを設定する要素
    parentNode.find(".sound_sign").remove();

    // １ユーザーの会話データから チャートに必要なデータを設定.
    let transcriptions = analysisData[speakerId]["transcription"];
    for(let i = 0; i < transcriptions.length; i++) {

        // 会議中 交わした会話分の１句分の文字起こしデータ.
        let transcription  = transcriptions[i];
        let isShortageHead = minTalkTime <= transcription["conv_start_time"] && transcription["conv_start_time"] <= maxTalkTime; // 頭が範囲内か.
        let isShortageTail = minTalkTime <= transcription["conv_end_time"]   && transcription["conv_end_time"]   <= maxTalkTime; // 尻が範囲内か.
        if(isShortageHead || isShortageTail) {
            // 会話の吹き出しの表示位置、吹き出しの出現位置の計算.
            let utteranceStartPoints = parentNode.width() * (transcription["conv_start_time"] - minTalkTime) / (maxTalkTime - minTalkTime);
            let utteranceLength      = parentNode.width() * transcription["talk_time"] / (maxTalkTime - minTalkTime);

            // 会話1句分の発言区間をマーキングする.
            let elem = document.createElement("span");
            elem.className = `sound_sign ${speakerId}`;
            elem.setAttribute('id',`sound_sign ${speakerId}`);
            let parentOffset = $(parentNode).offset().left; // 調整値=親の表示位置.

            if(!isShortageHead) {
                let talk_time = transcription["talk_time"] - (minTalkTime - transcription["conv_start_time"]);
                utteranceLength      = (parentNode.width() * talk_time) / maxTalkTime;
                utteranceStartPoints = 0;
            }

            if(!isShortageTail) {
                let overTailWidth = (utteranceStartPoints + utteranceLength) - parentNode.width();
                utteranceLength = 0 < (utteranceLength - overTailWidth) ? utteranceLength - overTailWidth: 1;
            }

            parentNode[0].appendChild(elem);
            $(elem).css({
                'left':  parentOffset + utteranceStartPoints,
                'width': utteranceLength
            }); // 話者が喋っている間隔に線を引いた.

            // 会話１句分の[文字起こしテキスト]と[その発話時刻]から 吹き出し要素を作成する.
            let textModal = document.createElement("p");
            textModal.className = 'arrow_box';
            elem.appendChild(textModal);
            textModal.innerText = transcription["text"];                                // 文字起こしテキスト.
            let utteranceStartPointForModal = reTime(transcription["conv_start_time"]); // その発話時刻.
            let talkStartTimeText = utteranceStartPointForModal.hour + ':' + utteranceStartPointForModal.min + ':' + utteranceStartPointForModal.sec + '<br>';
            textModal.insertAdjacentHTML('afterbegin', "<p style='text-align:left; margin-top:4px; color:#0A639C'>"+talkStartTimeText+"</p>");
            $(textModal).css('visibility','hidden');
        }

    }

    // 発話部分にホバーイベントを付与
    let signElem = document.getElementsByClassName('sound_sign ' + speakerId);
    $('.sound_sign').on({
        'mouseenter' : function() {
            $(this).children('p').css("visibility","visible");
        },
        'mouseleave' : function(){
            $(this).children('p').css("visibility","hidden")}
    });
    $('.arrow_box').css('pointer-events','none');
    // 各発話要素のオフセットを取得
    seekBox.getSignElemOffsets(speakerId, signElem);
}

/**
 * シークバーと各発話要素の距離を取得(speakerIdを付与し、発話者ごとに実行)
 */
function getDistanceBetweenElements(speakerId) {

    // 発話部分要素全てを取得
    let arrowBoxElem = document.getElementsByClassName(`sound_sign ${speakerId}`);
    // シークバーの親要素自体がウインドウの左端から離れた場所に存在するため、その差分を足してoffsetを取得し、シークバー要素のwidthとする
    const seekbarElemStartWidth = seekBox.seekbarElem.width() + $(seekBox.seekbarElem).offset().left;
    // 会話バーの発話回数分ループして、シークバーが発話のタイミングにあるかを確認する
    if(!transcriptionAllDisplayFlg) {
        for(let i=0; i<seekBox.soundSignOffsets[speakerId].length; i++){
            const index = seekBox.soundSignOffsets[speakerId].indexOf(seekBox.soundSignOffsets[speakerId][i]);
            // 発話開始とシークバーの距離を計算し、一定距離になったら文字起こしテキストを表示する
            var showCheck = seekBox.soundSignOffsets[speakerId][i] - seekbarElemStartWidth;
            if(showCheck < 5){
                $(arrowBoxElem[index]).children('p').css("visibility","visible");
            }
            // 発話終了とシークバーの距離を計算し、一定距離になったら文字起こしテキストを非表示にする
            var hideCheck = seekBox.soundSignOffsets[speakerId][i] + arrowBoxElem[i].clientWidth - seekbarElemStartWidth;
            if(hideCheck < 0){
                $(arrowBoxElem[index]).children('p').css("visibility","hidden");
            }
        }
    }
}

/**
 * 現在の時間をセット
 */
function setCurrentTime() {
    let playingTime = audio.currentTime;
    let current_of_time = reTime(playingTime);
    $('#nowtime').html(current_of_time.hour + ':' + current_of_time.min + ':' + current_of_time.sec);
}

/**
 * 再生速度の変更
 */
const settingPlaybackElem = document.getElementById('setting_playback');
$(settingPlaybackElem).change(function() {
    audio.playbackRate = this.value;
})

/**
 * 音声解析
 */
function createAudioGraph(speakerId) {
    // 範囲スライダーの表示
    viewTalkRange();
    // 音声解析を行い図形を表示x
    displayTailChart(0, audio.duration, speakerId);
};

/**
 * 実際の音声解析関数
 * ボタンで表示と、音声範囲絞り込みでの２種類存在するので関数化
 */
function displayTailChart(minTalkTime, maxTalkTime, speakerId) {

    let speakerNo = speakerId.split("_").pop(); // speakerIdには文字が含まれているので、speakerNoを取得する

    // 選択中
    let sentimentUserData = sentimentUsers[speakerNo].filter((sentiment, index, array) => {
        return minTalkTime <= sentiment.second && sentiment.second <= maxTalkTime;
    });

    // 感情の選択を取得  エンドユーザが指定した感情のみ線グラフを描画する.
    let displaySentimentIndexs = []; // 表示対象の先情報を取得する
    $("#select-title-names").find("[name=account_name]").each(function(index, element){
        if($(this).prop("checked")){
            displaySentimentIndexs.push(Number($(this).val()));
        }
    });
    const DISPLAY_SENTIMENTS =  AUDIO_ANALYSIS_PARAMS_DICTS.filter((element, index, array) => {
        return displaySentimentIndexs.indexOf(index) > -1;
    });
    if(DISPLAY_SENTIMENTS.length < 1 || sentimentUserData.length < 1) {
        // １件も線が無い場合、プラグインがエラーメッセージを出すので、それを見せないように中断する.
        $("#chart_div_speaker_"+speakerNo).empty()
        return null;
    }

    // MEMO.
    // 感情分析結果を線グラフにするわけだが、例えば0秒から10秒間のグラフを描画する場合、5秒目と7秒目に感情データがあった場合、やはり真ん中あたりと7割目に点を打つように描画してほしい.
    // そのことから 開始時刻と 終了時刻を0データで良いので入力することで、minTalkTime から maxTalkTimeまでの線グラフの間に データが描画され 各ユーザ 時間軸通りに線グラフが描画される.
    let setInitializeParam = function(param, second) {
        let plot = [];
        let speakerUserDataLast = sentimentUserData[sentimentUserData.length-1];
        if(param == "first" && sentimentUserData[0]['second'] - 1 <= second) {
            return plot;
        }
        if(param == "first") {
            second = sentimentUserData[0]['second'] - 1;
        }

        if(param == "last" && second <= (speakerUserDataLast['second'] + 1)) {
            return plot;
        }
        if(param == "last") {
            second = speakerUserDataLast['second'] + 1;
        }

        plot.push(second);
        DISPLAY_SENTIMENTS.map(analys=> {
            let value = 0;
            plot.push(value);
            plot.push(createLineChartTooltipHtml(analys[LINE_CHART_ICON], analys[SENTIMENT_TITLE], value));
        });
        return plot;
    };


    // チャートの準備待ち.
    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(function() {

        let displayBaseColor = [];

        let dataTable = new google.visualization.DataTable();

        // データのヘッダー情報.
        dataTable.addColumn('number', '時間'); // 線グラフのX軸値が数字型で時間と名前を付けたことを定義.
        DISPLAY_SENTIMENTS.map(analys=> {
            displayBaseColor.push(analys[LINE_CHART_COLOR]); // 線グラフの色は、引数オプションに渡す.
            dataTable.addColumn('number', analys[SENTIMENT_TITLE]); // グラフに標示する各感情値のタイトル (addColumn()した順と、 addRows()した配列の順が重要).
            dataTable.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}}); // tooltipはhtmlカスタム.
        });

        // データを線グラフのX軸単位で入力.
        let plots = [setInitializeParam("init", minTalkTime)];

        let initData;
        initData = setInitializeParam("first", minTalkTime);
        if(0 < initData.length) {
            plots.push(initData);
        }
        sentimentUserData.map(function(speakerUserData, index, array) {
            let plot = [];
            // データを線グラフのX軸を入力.
            plot.push(speakerUserData['second']);
            DISPLAY_SENTIMENTS.map(analys=> {
                plot.push(speakerUserData[analys[SENTIMENT_KEY]]); // 線グラフにY値(感情の数だけ渡す).
                plot.push(createLineChartTooltipHtml(analys[LINE_CHART_ICON], analys[SENTIMENT_TITLE], speakerUserData[analys[SENTIMENT_KEY]])); // tooltipにhtml要素(感情の数だけ渡す).
            });
            plots.push(plot);
        });
        initData = setInitializeParam("last", maxTalkTime);
        if(0 < initData.length) {
            plots.push(initData);
        }
        initData = setInitializeParam("init", maxTalkTime);
        if(0 < initData.length) {
            plots.push(initData);
        }
        dataTable.addRows(plots);

        // 設定.
        var options = {
            chartArea: {
                height:"90%",
                width:"100%"
            },
            vAxis: {
                viewWindowMode: 'maximized',
                gridlines: {
                    minSpacing: 0
                },
            },
            hAxis: {
                textPosition: 'none',
                gridlines:{
                    minSpacing: 0
                },
                baselineColor: 'none'
            },
            tooltip:{
                isHtml: true
            },
            allowHtml: true,
            colors: displayBaseColor
        };

        var chart = new google.visualization.LineChart(document.getElementById(`chart_div_${speakerId}`));
        chart.draw(dataTable, options);

    });

}

/**
 *  Htmlコンテンツをカスタム 線グラフ上のツールチップの作成.
 */
function createLineChartTooltipHtml(emoImage, emoString, value) {
    return `
<ul class="emotion-tooltip">
    <li><img class="emotion-img" src="${IMG_URL+emoImage}"></li>
    <li class="emotion-title">${emoString}</li>
    <li class="emotion-value">${value}</td>
</ul>`;
}

/**
 * 範囲スライダーの表示
 */
function viewTalkRange(speakerId) {
    let maxRange = seekBox.audioDurition;
    $("#talk_range").slider({
        range: true,
        values: [0, maxRange],
        min: 0,
        max: maxRange,
        slide: function(event, ui) {
            // 範囲に設定した値からグラフを再生成する
            for (let i = 0; i < analysisData.length; i++) {
                displayTailChart(ui.values[0], ui.values[1], `speaker_${i}`);
            }

            // 選択した範囲のend-startで、スケーリング後の全体秒数を取得
            const scaleRange = ui.values[1] - ui.values[0];
            // 取得したスケーリング後の全体秒数をセットし、クラスのプロパティを更新
            seekBox.audioDurition = scaleRange;

            // 音声ファイルの全体秒数/スケーリング後の全体秒数で、比率を取得
            const ratio = audio.duration / scaleRange;
            const zoomRatio  = Math.floor(ratio * 100) / 100;
            const chartWidth = $('#waveform').find('wave').width() * zoomRatio;
            seekBox.selectedStartSec = ui.values[0];
            seekBox.selectedEndSec   = ui.values[1];

            // スケール変更後のシークバー位置を取得
            const changeScaleNowSec = ((scaleRange * seekBox.seekbarElem.width()) / seekBox.seekboxElem.width()) + seekBox.selectedStartSec;

            // 現在の秒数を、スケール変更後の秒数に変更
            audio.currentTime = changeScaleNowSec;

            let scrollRatio =null;
            $('#waveform').find('canvas').css('width',chartWidth);
            // 範囲の設定値によって比率の計算方法を変更
            if(ui.values[0] === 0){
                scrollRatio = ui.values[0] / ratio * seekBox.seekboxElem.width();
            }else if(ui.values[0] != 0 && ui.values[1] != audio.duration){
                scrollRatio = ui.values[0] / scaleRange * seekBox.seekboxElem.width() + seekBox.audioDurition;
            }else{
                scrollRatio = ui.values[0] / ratio * seekBox.seekboxElem.width();
            }

            // wave要素にスクロールを適用する(ユーザーにスクロールはさせない)
            $('wave').scrollLeft(scrollRatio);
            $('wave').css('overflow-x','hidden')
            // 指定した音声の秒数幅で文字起こしチャートを再生成
            for (let i = 0; i < analysisData.length; i++) {
                createAudioTextChartSection(ui.values[0], ui.values[1], i);
            }

            seekBox.seekbarElem.css("width",0);

            showDuration();
            manageSoundSignElement();
        }
    } );
}

function makeSelectBoxFormat() {

    // ユーザー選択セレクトボックスの作成と 初期選択状態.
    for(let i = 0; i < analysisData.length; i++) {
        if(i < FIRST_VIEW_LIMIT_USER_COUNT){
            // 上限人数までは表示中に表示する
            $("#select-account-names").append(
                `<label><li class='account_name search_modal_form'><input type='checkbox' name='account_name' class='account_name_input' value='${i}' checked>` + analysisData[i]["name"] + "</li></label>"
            );
            // 現在の表示ユーザーNoを設定する
            displayUserNo.push(i);
        }else{
            // 上限人数以上は候補に表示する
            $("#account-name-list").append(
                `<label><li class='account_name search_modal_form'><input type='checkbox' name='account_name' class='account_name_input' value='${i}'>` + analysisData[i]["name"] + "</li></label>"
            );
            // 初期表示以外のユーザーの図形を隠す.
            for (let y = 0; y < chartTypes.length; y++) {
                $("#" + chartTypes[y] + i).hide();
            }
            // ユーザーの名前の要素を非表示にする
            let userMarkClass = ".user_mark_" + i;
            $(userMarkClass).each(function(index, element){
                $(this).hide();
            });
        }
        let selectElems = analysisData[$("#select-account-names").find("[name=account_name]:checked").eq(0).val()]["name"];
        let selectElemsLength = $("#select-account-names").find("[name=account_name]:checked").length;
        // 検索フォーム内のvalueを操作
        if(selectElemsLength === 0){
            $('#search_form').val($(this).val());
        }else if(1 == selectElemsLength) {
            $('#search_form').val(selectElems);
        }else{
            $('#search_form').val(selectElems+"  他"+(selectElemsLength-1)+"件");
        }
    }

    // 感情選択リストの作成.
    for(let i = 0; i < SENTIMENT_TITLES.length ; i++){
        $("#select-title-names").append(
            `<label><li class='account_name search_modal_form'><input type='checkbox' name='account_name' class='title_name_input' value='${i}' checked>` + `${SENTIMENT_TITLES[i]}` + "</li></label>"
        );
        let selectElems = SENTIMENT_TITLES[$("#select-title-names").find("[name=account_name]:checked").eq(0).val()];
        let selectElemsLength = $("#select-title-names").find("[name=account_name]:checked").length;
        // 検索フォーム内のvalueを操作
        if(selectElemsLength === 0){
            $('#title_search_form').val($(this).val());
        }else if(1 == selectElemsLength) {
            $('#title_search_form').val(selectElems);
        }else{
            $('#title_search_form').val(selectElems+"  他"+(selectElemsLength-1)+"件");
        }
    }

}

/**
 * 読み込んだ音声ファイルの時間を整形して表示する
 */
function showDuration() {
    // 全体の時間表示
    const durationOfTime = reTime(seekBox.selectedEndSec);
    $('#fulltime').html(durationOfTime.hour + ':' + durationOfTime.min + ':' + durationOfTime.sec);
}

/**
 * 数字から時間の形に整形
 */
function reTime(time) {
    const calTime = { //連想配列を先に作っておく
        hour : Math.floor(time / 3600),
        min : Math.floor(time / 60),
        sec : Math.floor(time % 60)
    }
    for( var item in calTime ) {
        calTime[item] = ('0' + calTime[item]).slice(-2);
    }
    return calTime;
}

/**
 * ウインドウリサイズ時、毎回文字起こしチャートを再生成する
 */
window.addEventListener("resize", function() {
    seekBox.width = $('.audio-main-chart-area-right').width();
     // 指定した音声の秒数幅で文字起こしチャートを再生成
    for (let i = 0; i < analysisData.length; i++) {
        createAudioTextChart(i);
        displayTailChart(seekBox.selectedStartSec, seekBox.selectedEndSec, `speaker_${i}`);
    }
})

/**
 * ボタンによる開始・停止
 */
$('#audio_start').on('click', function () {
    if(audio.paused) {
        audio.playsinline = true;
        audio.play();
        // 音声再生中はスライダーを動かせない
        const sliderElem = document.getElementsByClassName('ui-slider-handle');
        $(sliderElem).css('pointer-events','none');
    }
});

$('#audio_stop').on('click', function () {
    if(!audio.paused) {
        audio.pause();
        // 音声再生中はスライダーを動かせない
        const sliderElem = document.getElementsByClassName('ui-slider-handle');
        $(sliderElem).css('pointer-events','all');
    }
});

/**
 * 文字起こしテキスト全表示のチェックボックス処理
 */
$('#select-audio-data-transcription').on('change', function () {
    transcriptionAllDisplayFlg = this.checked;
    manageSoundSignElement();
});
function manageSoundSignElement() {
    let select = $("#select-audio-data-transcription");
    let signElem = document.getElementsByClassName('sound_sign');
    if(select.prop("checked")) {
        // テキスト全表示と表示していない時で必要なイベントが異なるため、発話部分要素のイベントを一旦削除
        $(signElem).off();
        $(signElem).css('pointer-events','none');
        $('.arrow_box').css({
            'pointer-events' :'auto',
            'visibility' :'visible'
        });
        // 文字起こしモーダルにイベント付与
        $('.arrow_box').hover(function() {
            $(this).css("z-index","9999999999");
        }, function(){
            $(this).css("z-index","");
        });
    }else{
        // 文字起こしモーダルにイベント付与
        $('.sound_sign').on({
            'mouseenter' : function() {
                $(this).children('p').css("visibility","visible");
            },
            'mouseleave' : function(){
                $(this).children('p').css("visibility","hidden")}
        });
        // cssを再適用
        $('.arrow_box').css({
            'visibility':'hidden',
            'pointer-events':'none'
        });
        $('.sound_sign').css('pointer-events','');
        // チェック解除
        select.prop("disabled", false);
    }
}


// 検索条件フォーム部分 アローアイコン以外がクリックされたらモーダル非表示
$(document).on('click touchend', function(event) {

    // ユーザー 検索条件フォーム部分 アローアイコンがクリックされたらモーダル表示
    if ($(event.target).closest('.user_form_arrow_icon').length || $(event.target).closest('#search_form').length) {
        if($('#user_select_account_modal').css('visibility') == 'hidden') {
            $('#user_select_account_modal').css("visibility","visible");
        }else{
            $('#user_select_account_modal').css("visibility","hidden");
        }
    } else if (event.target.closest(".search_modal_form") == null && $('#user_select_account_modal').css("visibility") != "hidden") {
        $('#user_select_account_modal').css("visibility","hidden");
    }

    // 表示項目 条件フォーム部分 アローアイコンがクリックされたらモーダル表示
    if ($(event.target).closest('.title_form_arrow_icon').length || $(event.target).closest('#title_search_form').length) {

        if($('#title_select_account_modal').css('visibility') == 'hidden'){
            $('#title_select_account_modal').css("visibility","visible");
        }else{
            $('#title_select_account_modal').css("visibility","hidden");
            // モーダルが表示された際に表を再描画する
            for (let i = 0; i < displayUserNo.length; i++) {
                displayTailChart(seekBox.selectedStartSec, seekBox.selectedEndSec, `speaker_${displayUserNo[i]}`);
            }
        }
    } else if(event.target.closest(".search_modal_form") == null && $('#title_select_account_modal').css("visibility") != "hidden") {
        $('#title_select_account_modal').css("visibility","hidden");
    }


});


// ユーザー検索 モーダル内チェック入れ替え処理
$(document).on("change", ".account_name_input", function() {

    if (this.checked) {
        // 候補の中から要素を選択した場合、候補内から選択した要素を消去し、選択中へ移動させる
        $("#select-account-names").append(`<label><li class='select_account_name search_modal_form'><input type='checkbox' name='account_name' checked='checked' class='account_name_input search_modal_form' value='${$(this).val()}'>${analysisData[$(this).val()]["name"]}</li></label>`);
        $('#account-name-list').find($('input[value="' + $(this).val() + '"]')).parent().remove()
        let selectElems = analysisData[$("#select-account-names").find("[name=account_name]:checked").eq(0).val()]["name"];
        let selectElemsLength = $("#select-account-names").find("[name=account_name]:checked").length;
        // 検索フォーム内のvalueを操作
        if(selectElemsLength === 0){
            $('#search_form').val($(this).val());
        }else if(1 == selectElemsLength) {
            $('#search_form').val(selectElems);
        }else{
            $('#search_form').val(selectElems+"  他"+(selectElemsLength-1)+"件");
        }
        // 表の表示を行う
        for (let i = 0; i < chartTypes.length; i++) {
            var chartId = "#" + chartTypes[i]  + $(this).val();
            $(chartId).show();
        }
        // 名前表示領域の表示を行う
        let userMarkClass = ".user_mark_" + $(this).val();
        $(userMarkClass).each(function(index, element){
            $(this).show();
        });
        // 現在表示中のユーザーとする
        displayUserNo.push(Number($(this).val()));
    }else{
        // 選択中の中から要素を選択した場合、選択中内から選択した要素を消去し、候補内に戻す
        $("#account-name-list").append(`<label><li class='account_name search_modal_form'><input type='checkbox' name='account_name' class='account_name_input search_modal_form' value='${$(this).val()}'>${analysisData[$(this).val()]["name"]}</li></label>`);
        $('#select-account-names').find($('input[value="' + $(this).val() + '"]')).parent().remove()
        let selectElems = "";
        let selectElemsLength = $("#select-account-names").find("[name=account_name]:checked").length;
        if(selectElemsLength > 0){
            selectElems = analysisData[$("#select-account-names").find("[name=account_name]:checked").eq(0).val()]["name"];
        }
        // 検索フォーム内のvalueを操作
        if(selectElemsLength === 0){
            $('#search_form').val('');
        }else if(1 == selectElemsLength) {
            $('#search_form').val(selectElems);
        }else{
            $('#search_form').val(selectElems+"  他"+(selectElemsLength-1)+"件");
        }
        // 表の非表示.
        for (let i = 0; i < chartTypes.length; i++) {
            var chartId = "#" + chartTypes[i] + $(this).val();
            $(chartId).hide();
        }
        // 名前表示領域の非表示.
        let userMarkClass = ".user_mark_" + $(this).val();
        $(userMarkClass).each(function(index, element){
            $(this).hide();
        });
        // 現在表示中のユーザーから削除する
        let tmpDisplayUserNo = [];
        for (let i = 0; i < displayUserNo.length; i++) {
            if(displayUserNo[i] != Number($(this).val())){
                // 削除対象ユーザーでない場合は追加する
                tmpDisplayUserNo.push(displayUserNo[i]);
            }
        }
        // 現在の表示ユーザー情報を詰め直す
        displayUserNo = tmpDisplayUserNo;
    }
    // シークバーの高さ調整
    let contentHeight = $('.audio-main-chart-area-left').height();
    $('.chart_seek_line').css('height',contentHeight);
});

// 表示項目 モーダル内チェック入れ替え処理
$(document).on("change", ".title_name_input", function() {
    if (this.checked) {
        // 候補の中から要素を選択した場合、候補内から選択した要素を消去し、選択中へ移動させる
        $("#select-title-names").append(`<label><li class='select_account_name search_modal_form'><input type='checkbox' name='account_name' checked='checked' class='title_name_input search_modal_form' value='${$(this).val()}'>${SENTIMENT_TITLES[$(this).val()]}</li></label>`);
        $('#title-name-list').find($('input[value="' + $(this).val() + '"]')).parent().remove()
        let selectElems = SENTIMENT_TITLES[$("#select-title-names").find("[name=account_name]:checked").eq(0).val()];
        let selectElemsLength = $("#select-title-names").find("[name=account_name]:checked").length;
        // 検索フォーム内のvalueを操作
        if(selectElemsLength === 0){
            $('#title_search_form').val($(this).val());
        }else if(1 == selectElemsLength) {
            $('#title_search_form').val(selectElems);
        }else{
            $('#title_search_form').val(selectElems+"  他"+(selectElemsLength-1)+"件");
        }
    }else{
        // 選択中の中から要素を選択した場合、選択中内から選択した要素を消去し、候補内に戻す
        $("#title-name-list").append(`<label><li class='account_name search_modal_form'><input type='checkbox' name='account_name' class='title_name_input search_modal_form' value='${$(this).val()}'>${SENTIMENT_TITLES[$(this).val()]}</li></label>`);
        $('#select-title-names').find($('input[value="' + $(this).val() + '"]')).parent().remove()
        let selectElems = "";
        let selectElemsLength = $("#select-title-names").find("[name=account_name]:checked").length;
        if(selectElemsLength > 0){
            selectElems = SENTIMENT_TITLES[$("#select-title-names").find("[name=account_name]:checked").eq(0).val()];
        }
        // 検索フォーム内のvalueを操作
        if(selectElemsLength === 0){
            $('#title_search_form').val('');
        }else if(1 == selectElemsLength) {
            $('#title_search_form').val(selectElems);
        }else{
            $('#title_search_form').val(selectElems+"  他"+(selectElemsLength-1)+"件");
        }
    }
    // 表示する感情を変更した際に表を再描画する
    for (let i = 0; i < displayUserNo.length; i++) {
        displayTailChart(seekBox.selectedStartSec, seekBox.selectedEndSec, `speaker_${displayUserNo[i]}`);
    }
});

// ユーザー検索 モーダル内 全選択チェック
$(document).on("change", ".account_name_input_all", function() {
    if(this.checked){
        let selectElems = document.getElementById('account-name-list');
        let selectInputTarget = $(selectElems).find('input');
        $(selectInputTarget).click();
    }else{
        let selectElems = document.getElementById('select-account-names');
        let selectInputTarget = $(selectElems).find('input');
        $(selectInputTarget).click();
        $('#search_form').val('');
    }
});

// 表示項目 モーダル内 全選択チェック
$(document).on("change", ".title_name_input_all", function() {
    if(this.checked){
        let selectElems = document.getElementById('title-name-list');
        let selectInputTarget = $(selectElems).find('input');
        $(selectInputTarget).click();
    }else{
        let selectElems = document.getElementById('select-title-names');
        let selectInputTarget = $(selectElems).find('input');
        $(selectInputTarget).click();
        $('#title_search_form').val('');
    }
});
$('.content-menu-area-top-header-audio-download').on('click', function () {
    let url = document.querySelector("#audio").src;
    let fileName = "audio.mp3";
    if (typeof window.navigator.msSaveBlob !== "undefined") {
        window.navigator.msSaveBlob(response.blob(), fileName);
        window.navigator.msSaveOrOpenBlob(response.blob(), fileName);
    } else {
        var hyperlink = document.createElement('a');
        hyperlink.href = url;
        hyperlink.download = fileName;
        hyperlink.target = '_blank';
        hyperlink.click();
    }
});


var intervalID = null;
var isCheckFetch = false;
if(document.getElementById('isDownloadAudioData').getAttribute("value") == "0") {
    intervalID = setInterval(isDownloadAudioData, 60000);
}
function isDownloadAudioData() {
    if(isCheckFetch) {
        return;
    }
    isCheckFetch = true;
    let fd  = new FormData();
    fd.append('conversation_id', new URL(window.location.href).searchParams.get('id'));
    fetch('is-exist-audio-data', {
        method: "POST",
        body: fd,
    })
    .then(response => response.json())
    .then(data => {
        if (data.code === false && intervalID != null) {
            clearInterval(intervalID);
            alert('音声データが存在しません。');
        } else if (data.code && intervalID != null) {
            clearInterval(intervalID);
            location.reload();
        }
        isCheckFetch = false;
    })
    .catch((error) => {
        isCheckFetch = false;
        location.reload();
    });
}
