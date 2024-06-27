<head>
    <meta charset="utf-8">
    <script type='text/javascript' src='https://www.google.com/jsapi'></script>
    <link rel="stylesheet" href="index.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/wavesurfer.js/3.0.0/wavesurfer.min.js"></script>
    <link type="text/css" rel="stylesheet" href="https://code.jquery.com/ui/1.10.3/themes/cupertino/jquery-ui.min.css" />
    <script type="text/javascript" src="https://code.jquery.com/jquery-1.9.1.min.js"></script>
    <script type="text/javascript" src="https://code.jquery.com/ui/1.10.3/jquery-ui.min.js"></script>
</head>

{include file="./common/header.tpl"}
<link href="/css/analysis-audio-data.css" rel="stylesheet">

{literal}
<style>

.conversation_aggregate_table {
    margin-top: 32.5px;
    height: 45px;
    width: 100%;
    text-align: center;
    line-height: 45px;

    border: 1px solid #E1E4E6;

    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing: antialiased;
}


.conversation_aggregate_table .header_area{
    width: 100%;
    height: 45px;
    line-height: 45px;
    font-size: 14px;
    text-align: center;
    color: #FFFFFF;
    background: #0081CC;
    border: 1px solid #0081CC;
}

.conversation_aggregate_table .row_line {
    border-right: 1px solid #E1E4E6
}

.conversation_aggregate_table .title_area {

}
.conversation_aggregate_table .second_title_area {

}
.conversation_aggregate_table .result_area {

}
.conversation_aggregate_table .average_area {

}

.conversation_aggregate_table td {
    border-bottom: 1px solid #E1E4E6;
    color: #505050;
}
{/literal}

</style>


<div class="audio-data-content-area">
    <div class="page-back-content">
        <span class="page-back">
            <span class="icon-menu-05 mi_page_arrow_icon" id="page_back_icon"></span>
            <a href="/analysis-audio/show-audio-data-list">戻る</a>
        </span>
    </div>
    <div class="content-title-area">
        <span class="icon-comment mi_default_label_icon" id="title_icon"></span>
        <span class="content-title">
            音声詳細
        </span>
    </div>
    <div class="content-menu-area">
        <input id="audio_file" type="file" accept="audio/*" style="display: none"/>
        <div class="content-menu-area-innerwrap">
            <div class="content-menu-area-top">
                <div class="content-menu-area-top-header">
                    <div>
                        <div class="content-menu-area-top-header-top">
                            <span class="content-menu-area-top-header-room-name">
                                {$roomData.room_name}
                            </span>
                        </div>
                        <div class="content-menu-area-top-header-bottom">
                            <div class="content-menu-area-top-header-bottom-name-area">
                                <span class="icon-parsonal mi_content_title_icon" id="user_icon"></span>
                                <span class="content-menu-area-top-header-user-data">
                                    {$roomData.staff_name}
                                </span>
                            </div>
                            <div class="content-menu-area-top-header-bottom-schedule-area">
                                <img src="/img/schedule.svg" id="schedule_icon">
                                <span class="content-menu-area-top-header-date">
                                    {$roomData.conversation_date}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <button id="download_button" class="content-menu-area-top-header-audio-download {if !$isDownloadAudioData}ready{/if}">音声ダウンロード</button>
                    </div>

                </div>
                <div id="audio-area" class="content-audio-area {if !$isDownloadAudioData}ready{/if}">
                    <div class="content-menu-area-top-select-area">
                        <div class="log_view_period_selection-name-area">
                            <div class="user_search_area">
                                <div class="seach_area_left">
                                    <span class="use_search_area_text">
                                        表示ユーザー
                                    </span>
                                    <span class="user_search_input_area">
                                        <!-- <input type="text" class="select_name" name="holding_name" id="search_form" readonly/> -->
                                        <div class="log_view_period_selection-name-area">
                                            <input type="text" class="select_name" name="holding_name" id="search_form" readonly/>
                                            <div id="user_select_account_modal" class="search_modal_form">
                                                <div class="select_account_modal_search">
                                                    <input type='text' name='account_search' class='account_search search_modal_form'id="select_name" placeholder="検索">
                                                </div>
                                                <label>
                                                <div class="select_account_modal_top search_modal_form">
                                                    <input type='checkbox' name='account_name' class='account_name_input_all search_modal_form'> 全て
                                                </div>
                                                </label>
                                                <form name="select-account-names-wrap" class="search_modal_form">
                                                    <ul id="select-account-names" class="search_modal_form">
                                                        <li class="already-select-name search_modal_form">
                                                            <span class="already-select-name-text search_modal_form">選択中</span>
                                                        </li>
                                                    </ul>
                                                </form>
                                                <div class="search_name search_modal_form">
                                                    <span class="search_name_text search_modal_form">
                                                        候補
                                                    </span>
                                                </div>
                                                <ul id="account-name-list" class="search_modal_form">
                                                </ul>
                                            </div>
                                        </div>
                                        <img class="user_form_arrow_icon search_modal_form" src="/img/row-arrow.svg" id="row-arrow-icon">
                                    </span>
                                </div>
                                <div class="seach_area_right">
                                    <span class="item_search_area_text">
                                        表示項目
                                    </span>
                                    <span class="user_search_input_area">
                                    <div class="log_view_period_selection-name-area">
                                        <input type="text" class="select_name" name="holding_name" id="title_search_form" readonly/>
                                        <div id="title_select_account_modal" class="search_modal_form">
                                            <label>
                                            <div class="select_account_modal_top search_modal_form">
                                                <input type='checkbox' name='account_name' class='title_name_input_all search_modal_form'>
                                                全て
                                            </div>
                                        </label>
                                            <form name="select-account-names-wrap" class="search_modal_form">
                                                <ul id="select-title-names" class="search_modal_form">
                                                    <li class="already-select-name search_modal_form">
                                                        <span class="already-select-name-text search_modal_form">選択中</span>
                                                    </li>
                                                </ul>
                                            </form>
                                            <div class="search_name search_modal_form">
                                                <span class="search_name_text search_modal_form">
                                                    候補
                                                </span>
                                            </div>
                                            <ul id="title-name-list" class="search_modal_form">
                                            </ul>
                                        </div>
                                    </div>
                                    <img class="title_form_arrow_icon search_modal_form" src="/img/row-arrow.svg" id="row-arrow-icon">
                                </span>
                                </div>
                            </div>
                            <div id="title_select_account_modal">
                                <div class="select_account_modal_search">
                                    <input type='text' name='account_search' class='account_search'id="select_name" placeholder="検索">
                                </div>
                                <div class="select_account_modal_top">
                                    <input type='checkbox' name='account_name' class='account_name_input_all'>
                                    全て
                                </div>
                                <form name="select-account-names-wrap">
                                    <ul id="select-account-names">
                                        <li class="already-select-name">
                                            <span class="already-select-name-text">選択中</span>
                                        </li>
                                    </ul>
                                </form>
                                <div class="search_name">
                                    <span class="search_name_text">
                                        候補
                                    </span>
                                </div>
                                <ul id="account-name-list">
                                </ul>
                            </div>
                        </div>
                        <div class="content-menu-area-top-select-area-select">
                                <label>
                                    <input type="checkbox" id="select-audio-data-transcription">
                                    文字起こしテキストを全て表示
                                </label>
                        </div>
                    </div>
                    <div class="content-menu-area-top-audio-main-chart-area">
                        <div class="content-menu-area-top-audio-main-chart">
                            <div class="audio-main-chart-area-left">
                                <div class="audio-main-chart-area-left-volume-area">
                                    <div class="audio-main-chart-area-left-volume-area-left">
                                        <div class="audio-main-chart-area-left-volume-area-left-text">
                                            音量
                                        </div>
                                    </div>
                                    <div class="audio-main-chart-area-left-volume-area-right" id="sound_volume_area">
                                        全て
                                    </div>
                                </div>
                                <div class="audio-main-chart-area-left-talk-area">
                                    <div class="audio-main-chart-area-left-talk-area-left">
                                        会話
                                    </div>
                                    <div class="audio-main-chart-area-left-talk-area-right" id="talk_detail_area">
                                    </div>
                                </div>
                                <div class="audio-main-chart-area-left-emotion-area">
                                    <div class="audio-main-chart-area-left-emotion-area-left">
                                        感情
                                    </div>
                                    <div class="audio-main-chart-area-left-emotion-area-right" id="emotion_detail_area">
                                    </div>
                                </div>
                            </div>
                            <div class="audio-main-chart-area-right">
                                <div class="chart_seek_line"></div>
                                <div class="audio-main-chart-area-right-volume-chart-block" id="volume-chart_block">
                                    <div class="audio-main-chart-area-right-volume-chart-me">
                                        <div id="waveform" style="width: 700px;"></div>
                                    </div>
                                </div>
                                <div class="audio-main-chart-area-right-talk-chart-block" id="talk-chart_block">
                                </div>
                                <div class="audio-main-chart-area-right-emotion-chart-block" id="emotion-chart_block">
                                </div>
                            </div>
                        </div>
                        <div class="audio-main-chart-area-timeline-area">
                            <div class="audio-main-chart-area-left-timeline-area">
                                タイムライン
                            </div>
                            <div class="audio-main-chart-area-right-timeline">
                                <div id="talk_range_area">
                                    <div id="talk_range"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="content-menu-area-top-audio-control-area">
                        <button class="audio_start" id="audio_start">
                            <img src="/img/play.svg" style="width: 15px;" id="play_icon">
                            再生
                        </button>
                        <button class="audio_stop"  id="audio_stop">
                            <img src="/img/stop.svg" style="width: 15px;" id="stop_icon">
                            一時停止
                        </button>
                        <select id="setting_playback">
                            <option value="1.0">通常速度</option>
                            <option value="1.5">1.5倍速</option>
                            <option value="2.0">2倍速</option>
                        </select>
                        <div class="time_content">
                            <p id="nowtime"></p>
                            <p class="time-slash">/</p>
                            <p id="fulltime"></p>
                        </div>
                    </div>
                </div>
            </div>

            <table class="conversation_aggregate_table">
                <tr class="header_area">
                    <th class="title_area">ユーザー名</th>
                    <th class="second_title_area">項目名</th>
                    <th class="result_area">項目名2</th>
                    <th class="average_area">結果</th>
                </tr>

                {foreach from=$aggregates item=row}
                <tr>
                    <td rowspan="25" class="row_line">{$row.staff_name}</td>

                    <td>
                        会話速度
                        <span class="question">
                            <span class="question_touch"></span>
                            <img src="/img/help_mark.svg" class="question_icon">
                            <span class="question_modal" >ユーザーの会話速度を表しています。<br>単位は、文字/秒です。</span>
                        </span>
                    </td>
                    <td></td>
                    <td>{$row.speech_rate_avg}</td>
                </tr>
                <tr>
                    <td>
                        声の音量
                        <span class="question">
                            <span class="question_touch"></span>
                            <img src="/img/help_mark.svg" class="question_icon">
                            <span class="question_modal" >ユーザーの声の大きさを表しています。<br>声の大きさに応じて値が大きくなります。</span>
                        </span>
                    </td>
                    <td></td>
                    <td>{$row.volume_avg} dB</td>
                </tr>
                <tr>
                    <td>
                        沈黙回数
                        <span class="question">
                            <span class="question_touch"></span>
                            <img src="/img/help_mark.svg" class="question_icon">
                            <span class="question_modal" >全ユーザーが発話しない状態が<br>3秒以上存在した場合にその回数を示します。</span>
                        </span>
                    </td>
                    <td></td>
                    <td>{$row.pause_count}モーラ/分</td>
                </tr>
                <tr>
                    <td>
                        会話の被り
                        <span class="question">
                            <span class="question_touch"></span>
                            <img src="/img/help_mark.svg" class="question_icon">
                            <span class="question_modal" >ユーザーと通話相手の発言が重なった時間が<br>1秒以上存在するごとにカウントされます。</span>
                        </span>
                    </td>
                    <td></td>
                    <td>{$row.bargein_count}モーラ/分</td>
                </tr>
                <tr>
                    <td>
                        感情表現
                        <span class="question">
                            <span class="question_touch"></span>
                            <img src="/img/help_mark.svg" class="question_icon">
                            <span class="question_modal" >声の抑揚や大きさ、速さなどを分析し、<br>ユーザーの感情をグラフに反映します。</span>
                        </span>
                    </td>
                    <td>
                        エネルギー
                    </td>
                    <td>{$row.energy_avg}</td>
                </tr>
                <tr>
                    <td>
                        感情表現
                        <span class="question">
                            <span class="question_touch"></span>
                            <img src="/img/help_mark.svg" class="question_icon">
                            <span class="question_modal" >声の抑揚や大きさ、速さなどを分析し、<br>ユーザーの感情をグラフに反映します。</span>
                        </span>
                    </td>
                    <td>ストレス</td>
                    <td>{$row.stress_avg}</td>
                </tr>
                <tr>
                    <td>
                        感情表現
                        <span class="question">
                            <span class="question_touch"></span>
                            <img src="/img/help_mark.svg" class="question_icon">
                            <span class="question_modal" >声の抑揚や大きさ、速さなどを分析し、<br>ユーザーの感情をグラフに反映します。</span>
                        </span>
                    </td>
                    <td>論理/感情バランス</td>
                    <td>{$row.emo_cog_avg}</td>
                </tr>
                <tr>
                    <td>
                        感情表現
                        <span class="question">
                            <span class="question_touch"></span>
                            <img src="/img/help_mark.svg" class="question_icon">
                            <span class="question_modal" >声の抑揚や大きさ、速さなどを分析し、<br>ユーザーの感情をグラフに反映します。</span>
                        </span>
                    </td>
                    <td>集中</td>
                    <td>{$row.concentration_avg}</td>
                </tr>
                <tr>
                    <td>
                        感情表現
                        <span class="question">
                            <span class="question_touch"></span>
                            <img src="/img/help_mark.svg" class="question_icon">
                            <span class="question_modal" >声の抑揚や大きさ、速さなどを分析し、<br>ユーザーの感情をグラフに反映します。</span>
                        </span>
                    </td>
                    <td>期待</td>
                    <td>{$row.anticipation_avg}</td>
                </tr>
                <tr>
                    <td>
                        感情表現
                        <span class="question">
                            <span class="question_touch"></span>
                            <img src="/img/help_mark.svg" class="question_icon">
                            <span class="question_modal" >声の抑揚や大きさ、速さなどを分析し、<br>ユーザーの感情をグラフに反映します。</span>
                        </span>
                    </td>
                    <td>興奮</td>
                    <td>{$row.excitement_avg}</td>
                </tr>
                <tr>
                    <td>
                        感情表現
                        <span class="question">
                            <span class="question_touch"></span>
                            <img src="/img/help_mark.svg" class="question_icon">
                            <span class="question_modal" >声の抑揚や大きさ、速さなどを分析し、<br>ユーザーの感情をグラフに反映します。</span>
                        </span>
                    </td>
                    <td>躊躇</td>
                    <td>{$row.hesitation_avg}</td>
                </tr>
                <tr>
                    <td>
                        感情表現
                        <span class="question">
                            <span class="question_touch"></span>
                            <img src="/img/help_mark.svg" class="question_icon">
                            <span class="question_modal" >声の抑揚や大きさ、速さなどを分析し、<br>ユーザーの感情をグラフに反映します。</span>
                        </span>
                    </td>
                    <td>不確実</td>
                    <td>{$row.uncertainty_avg}</td>
                </tr>
                <tr>
                    <td>
                        感情表現
                        <span class="question">
                            <span class="question_touch"></span>
                            <img src="/img/help_mark.svg" class="question_icon">
                            <span class="question_modal" >声の抑揚や大きさ、速さなどを分析し、<br>ユーザーの感情をグラフに反映します。</span>
                        </span>
                    </td>
                    <td>思考</td>
                    <td>{$row.intensive_thinking_avg}</td>
                </tr>
                <tr>
                    <td>
                        感情表現
                        <span class="question">
                            <span class="question_touch"></span>
                            <img src="/img/help_mark.svg" class="question_icon">
                            <span class="question_modal" >声の抑揚や大きさ、速さなどを分析し、<br>ユーザーの感情をグラフに反映します。</span>
                        </span>
                    </td>
                    <td>想像力</td>
                    <td>{$row.imagination_activity_avg}</td>
                </tr>
                <tr>
                    <td>
                        感情表現
                        <span class="question">
                            <span class="question_touch"></span>
                            <img src="/img/help_mark.svg" class="question_icon">
                            <span class="question_modal" >声の抑揚や大きさ、速さなどを分析し、<br>ユーザーの感情をグラフに反映します。</span>
                        </span>
                    </td>
                    <td>困惑</td>
                    <td>{$row.embarrassment_avg}</td>
                </tr>
                <tr>
                    <td>
                        感情表現
                        <span class="question">
                            <span class="question_touch"></span>
                            <img src="/img/help_mark.svg" class="question_icon">
                            <span class="question_modal" >声の抑揚や大きさ、速さなどを分析し、<br>ユーザーの感情をグラフに反映します。</span>
                        </span>
                    </td>
                    <td>情熱</td>
                    <td>{$row.passionate_avg}</td>
                </tr>
                <tr>
                    <td>
                        感情表現
                        <span class="question">
                            <span class="question_touch"></span>
                            <img src="/img/help_mark.svg" class="question_icon">
                            <span class="question_modal" >声の抑揚や大きさ、速さなどを分析し、<br>ユーザーの感情をグラフに反映します。</span>
                        </span>
                    </td>
                    <td>脳活動</td>
                    <td>{$row.brain_power_avg}</td>
                </tr>
                <tr>
                    <td>
                        感情表現
                        <span class="question">
                            <span class="question_touch"></span>
                            <img src="/img/help_mark.svg" class="question_icon">
                            <span class="question_modal" >声の抑揚や大きさ、速さなどを分析し、<br>ユーザーの感情をグラフに反映します。</span>
                        </span>
                    </td>
                    <td>自信</td>
                    <td>{$row.confidence_avg}</td>
                </tr>
                <tr>
                    <td>
                        感情表現
                        <span class="question">
                            <span class="question_touch"></span>
                            <img src="/img/help_mark.svg" class="question_icon">
                            <span class="question_modal" >声の抑揚や大きさ、速さなどを分析し、<br>ユーザーの感情をグラフに反映します。</span>
                        </span>
                    </td>
                    <td>攻撃性,憤り</td>
                    <td>{$row.aggression_avg}</td>
                </tr>
                <tr>
                    <td>
                        感情表現
                        <span class="question">
                            <span class="question_touch"></span>
                            <img src="/img/help_mark.svg" class="question_icon">
                            <span class="question_modal" >声の抑揚や大きさ、速さなどを分析し、<br>ユーザーの感情をグラフに反映します。</span>
                        </span>
                    </td>
                    <td>コールプライオリティ</td>
                    <td>{$row.call_priority_avg}</td>
                </tr>
                <tr>
                    <td>
                        感情表現
                        <span class="question">
                            <span class="question_touch"></span>
                            <img src="/img/help_mark.svg" class="question_icon">
                            <span class="question_modal" >声の抑揚や大きさ、速さなどを分析し、<br>ユーザーの感情をグラフに反映します。</span>
                        </span>
                    </td>
                    <td>雰囲気,会話傾向</td>
                    <td>{$row.atmosphere_avg}</td>
                </tr>
                <tr>
                    <td>
                        感情表現
                        <span class="question">
                            <span class="question_touch"></span>
                            <img src="/img/help_mark.svg" class="question_icon">
                            <span class="question_modal" >声の抑揚や大きさ、速さなどを分析し、<br>ユーザーの感情をグラフに反映します。</span>
                        </span>
                    </td>
                    <td>動揺</td>
                    <td>{$row.upset_avg}</td>
                </tr>
                <tr>
                    <td>
                        感情表現
                        <span class="question">
                            <span class="question_touch"></span>
                            <img src="/img/help_mark.svg" class="question_icon">
                            <span class="question_modal" >声の抑揚や大きさ、速さなどを分析し、<br>ユーザーの感情をグラフに反映します。</span>
                        </span>
                    </td>
                    <td>喜び</td>
                    <td>{$row.content_avg}</td>
                </tr>
                <tr>
                    <td>
                        感情表現
                        <span class="question">
                            <span class="question_touch"></span>
                            <img src="/img/help_mark.svg" class="question_icon">
                            <span class="question_modal" >声の抑揚や大きさ、速さなどを分析し、<br>ユーザーの感情をグラフに反映します。</span>
                        </span>
                    </td>
                    <td>不満</td>
                    <td>{$row.dissatisfaction_avg}</td>
                </tr>
                <tr>
                    <td>
                        感情表現
                        <span class="question">
                            <span class="question_touch"></span>
                            <img src="/img/help_mark.svg" class="question_icon">
                            <span class="question_modal" >声の抑揚や大きさ、速さなどを分析し、<br>ユーザーの感情をグラフに反映します。</span>
                        </span>
                    </td>
                    <td>極端な起伏</td>
                    <td>{$row.extreame_emotion_avg}</td>
                </tr>
                {/foreach}

            </table>
            <audio id="audio" src="{$audioUrl}"></audio>
            <input type="hidden" id="isDownloadAudioData" value="{if !$isDownloadAudioData}0{else}1{/if}">
        </div>
    </div>
</div>
<script>
const audioUrl = '{$audioUrl}';
const analysisData = JSON.parse('{$analysisData}'
.replace(/(\r\n)/g, '')
.replace(/(\r)/g,   '')
.replace(/(\n)/g,  ''));
const sentimentUsers = JSON.parse('{$sentimentUsers}');
</script>
<script src="/js/audio-data.js"></script>