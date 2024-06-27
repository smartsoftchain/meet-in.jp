
{include file="./common/header.tpl"}
<head>
    <meta charset="utf-8">
    <script type='text/javascript' src='https://www.google.com/jsapi'></script>
    <script src="/js/jquery-ui.min.js"></script>
    <script src="/js/datepicker-ui/jquery.ui.datepicker-ja.js"></script>
    <script src="/js/customize.js?20201027"></script>
    <script src="/js/customize.js?20201027"></script>
    <script src="/js/jquery.twbsPagination.js"></script>
    <link rel="stylesheet" type="text/css" href="/js/datepicker-ui/jquery-ui.css">
</head>
<script>

    // ログインしているユーザーと同一クライアントのユーザー情報を取得
    const users = JSON.parse('{$users}');
    {literal}

    function zeroPadding(date){
        if(date.length === 1){
            return "0" + date
        } else {
            return date
        }
    }

    function getMonday(date) {
        date = new Date(date);
        const day = date.getDay(),
        diff = date.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
        const d = new Date(date.setDate(diff));
        return d.getFullYear() + "-" + zeroPadding(d.getMonth()+1) + "-" + zeroPadding(d.getDate())
    }

    function getFirstDate (date) {
        const firstDate = date.setDate(1);
        d = new Date(firstDate);
        return d.getFullYear() + "-" + zeroPadding(d.getMonth()+1) + "-" + zeroPadding(d.getDate())
    }

    $(function() {
        // 開始日・終了日はデフォルト今日日付を設定する
        $('#input-start-data').datepicker({dateFormat: 'yy-mm-dd'}).datepicker("setDate", new Date());
        $('#input-end-data').datepicker({dateFormat: 'yy-mm-dd'}).datepicker("setDate", new Date());
    })

    $(function() {
        $('.select-period').change(function(){
            // 共通でdisableを外す
            $('#input-start-data').prop("disabled", false);
            $('#input-end-data').prop("disabled", false);
            // 今日
            if($(this).val() == 0) {
                $('#input-start-data').datepicker({dateFormat: 'yy-mm-dd'}).datepicker("setDate", new Date());
                $('#input-end-data').datepicker({dateFormat: 'yy-mm-dd'}).datepicker("setDate", new Date());
            }
            // 今週
            if($(this).val() == 1) {
                const monday = getMonday(new Date);
                $('#input-start-data').datepicker({dateFormat: 'yy-mm-dd'}).datepicker("setDate", monday);
                $('#input-end-data').datepicker({dateFormat: 'yy-mm-dd'}).datepicker("setDate", new Date());
            }
            // 今月
            if($(this).val() == 2) {
                const firstDate = getFirstDate(new Date);
                $('#input-start-data').datepicker({dateFormat: 'yy-mm-dd'}).datepicker("setDate", firstDate);
                $('#input-end-data').datepicker({dateFormat: 'yy-mm-dd'}).datepicker("setDate", new Date());
            }
            // 全て
            if($(this).val() == 3) {
                $('#input-start-data').val(null);
                $('#input-end-data').val(null);
                // 全ての場合は日付を押下できないようにdisableにする
                $('#input-start-data').prop("disabled", true);
                $('#input-end-data').prop("disabled", true);
            }

        });

    })

    /**
     * @param {json} list
     */
    function getNameInList(list) {
        return list.map((l) => {
            return l.staff_name;
        });
    }

    /**
     * @param {json} list
     */
    function dictOfNameKey(list){
        let dict = {};
        list.forEach((l) => {
            if('staff_id' in l){
                dict[l.staff_name] = {
                    id: l.staff_id,
                    type: l.staff_type
                }
            } else {
                dict[l.staff_name] = l.id
            }
        })
        return dict;
    }
    // タグ名からstaff_idなどを取得するための連想配列
    const usersOfNameKey = dictOfNameKey(users);
    $(function() {
        $("#user_tags").tagit({
            singleField: true,
            // //自動補完するワードを設定
            availableTags: getNameInList(users),
            fieldName: "user-list",
            showAutocompleteOnFocus:true,
            removeConfirmation:true,
            afterTagAdded: function (event, ui) {
                // 選択人数制御
                if($(this).find('.tagit-choice').length > 5){
                    $(this).find("a")[5].click();
                    alert('選択できるユーザーは5人までです');
                }else{
                    $(`input[value="${ui.tagLabel}"]`).remove();
                    $(this).append(`<input type="hidden" value="staff_id:${usersOfNameKey[ui.tagLabel].id}, staff_type:${usersOfNameKey[ui.tagLabel].type}" name="users[]" class="users">`);
                }
            },
            afterTagRemoved: function (event, ui) {
                $(`input[value="staff_id:${usersOfNameKey[ui.tagLabel].id}, staff_type:${usersOfNameKey[ui.tagLabel].type}"]`).remove();
            }
        });
    })

    {/literal}
</script>

<link href="/css/jquery.tagit.css" rel="stylesheet">
<link href="/css/audio-data.css" rel="stylesheet">
<link href="/css/audio-analysis-data.css"rel="stylesheet">


<div class="audio-data-content-area">
    <div class="page-back-content">
        <span class="page-back">
        </span>
    </div>
    <div class="content-title-area">
        <span class="content-title">
            <img class="form_arrow_icon search_modal_form" src="/img/audio-analysis.svg">
            音声データ集計
        </span>
    </div>
    <div class="content-menu-area">
        <div class="content-menu-area-top-analysis-content-header">
            <span class="content-menu-area-top-analysis-content-header-text">
                集計条件
            </span>
        </div>
        <div class="analysis-content-menu-area-innerwrap-top">
            <div class="content-menu-area-top">
                <div class="content-menu-area-top-analysis-content-main">
                    <div class="content-menu-area-top-analysis-content-main-period-title">
                        対象期間
                    </div>
                    <form id="analysis-form">
                        <div class="content-menu-area-top-analysis-content-main-period-area">
                            <div class="content-menu-area-top-analysis-content-main-period-area-select-period">
                                <div class="content-menu-area-top-analysis-content-main-period-area-select-period-form-area flex">
                                    <div class="period-form">
                                        <div class="search-title">
                                            期間
                                        </div>
                                        <select id="select-period-data" class="select-period" name="select-period">
                                            <option value="">選択してください</option>
                                            <option value="3">全て</option>
                                            <option value="0">日</option>
                                            <option value="1">週</option>
                                            <option value="2">月</option>
                                        </select>
                                    </div>
                                    <div class="flex">
                                        <div class="start-form">
                                            <div class="search-title">
                                                開始日
                                            </div>
                                            <input type="text" id="input-start-data" name="analysis-day-start" class="calendar">
                                        </div>
                                        <div class="wavy">〜</div>
                                        <div class="end-form">
                                            <div class="search-title">
                                                終了日
                                            </div>
                                            <input type="text" id="input-end-data" name="analysis-day-end">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="content-menu-area-top-analysis-content-main-average-area mgn-t30">
                            <div class="day-form">
                                <h3 class="day-title">
                                    曜日別
                                </h3>
                                <div>
                                    {foreach from=$weeks item=week}
                                    <input type="checkbox"class="input-day-data" name="day-of-the-week" value="{$week.data}" checked="checked">{$week.jp}
                                    {/foreach}
                                </div>
                            </div>
                            <div class="content-menu-area-top-analysis-content-main-average-area-title">
                                取得対象（ユーザー）
                                <span class='required'>必須</span>
                                <span class="warnning">※取得対象は5人以上選択できません。</span>
                            </div>
                            <ul id="user_tags" value="get-average-target" name="get-average-target">
                                {foreach from=$staffList item=row}

                                {/foreach}
                            </ul>
                        </div>
                        <div class="content-menu-area-top-analysis-content-main-button-area">
                            <button id="start-analysis-button">集計</button>
                        </div>
                    </div>
                <!-- </form> -->
                </div>
        </div>
        <div class="audio-data-content-margin-area"></div>
        <div class="audio-data-content-area-innerwrap-bottom">
        <div class="content-area-bottom-header">
            <div class="content-area-bottom-header-text">
                各項目評価
            </div>
        </div>
        <div class="audio-data-content-area-bottom">
            <div class="analysis-content-area-innerwrap-bottom">
                <div class="analysis-content-area-bottom">
                    <div class="analysis-content-area-bottom-tab-area">
                        <div class="log_view_period_selection-name-area-wrapper">
                            <div class="log_view_period_selection-name-area">
                                <input type="text" class="select_name" name="holding_name" id="search_form" value="項目を選択してください" readonly/>
                                <img id="search_form_icon" class="form_arrow_icon search_modal_form" src="/img/row-arrow.svg">
                                <div id="select_account_modal">
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
                                        <li class='account_name search_modal_form'><input type='checkbox' name='account_name' class='account_name_input search_modal_form' value="エネルギー" data-key="energy_avg">エネルギー</li>
                                        <li class='account_name search_modal_form'><input type='checkbox' name='account_name' class='account_name_input search_modal_form' value="ストレス" data-key="stress_avg">ストレス</li>
                                        <li class='account_name search_modal_form'><input type='checkbox' name='account_name' class='account_name_input search_modal_form' value="論理/感情バランス" data-key="emo_cog_avg">論理/感情バランス</li>
                                        <li class='account_name search_modal_form'><input type='checkbox' name='account_name' class='account_name_input search_modal_form' value="集中" data-key="concentration_avg">集中</li>
                                        <li class='account_name search_modal_form'><input type='checkbox' name='account_name' class='account_name_input search_modal_form' value="期待" data-key="anticipation_avg">期待</li>
                                        <li class='account_name search_modal_form'><input type='checkbox' name='account_name' class='account_name_input search_modal_form' value="興奮" data-key="excitement_avg">興奮</li>
                                        <li class='account_name search_modal_form'><input type='checkbox' name='account_name' class='account_name_input search_modal_form' value="躊躇" data-key="hesitation_avg">躊躇</li>
                                        <li class='account_name search_modal_form'><input type='checkbox' name='account_name' class='account_name_input search_modal_form' value="不確実" data-key="uncertainty_avg">不確実</li>
                                        <li class='account_name search_modal_form'><input type='checkbox' name='account_name' class='account_name_input search_modal_form' value="思考" data-key="intensive_thinking_avg">思考</li>
                                        <li class='account_name search_modal_form'><input type='checkbox' name='account_name' class='account_name_input search_modal_form' value="想像力" data-key="imagination_activity_avg">想像力</li>
                                        <li class='account_name search_modal_form'><input type='checkbox' name='account_name' class='account_name_input search_modal_form' value="困惑" data-key="embarrassment_avg">困惑</li>
                                        <li class='account_name search_modal_form'><input type='checkbox' name='account_name' class='account_name_input search_modal_form' value="情熱" data-key="passionate_avg">情熱</li>
                                        <li class='account_name search_modal_form'><input type='checkbox' name='account_name' class='account_name_input search_modal_form' value="脳活動" data-key="brain_power_avg">脳活動</li>
                                        <li class='account_name search_modal_form'><input type='checkbox' name='account_name' class='account_name_input search_modal_form' value="自信" data-key="confidence_avg">自信</li>
                                        <li class='account_name search_modal_form'><input type='checkbox' name='account_name' class='account_name_input search_modal_form' value="攻撃性、憤り" data-key="aggression_avg">攻撃性、憤り</li>
                                        <li class='account_name search_modal_form'><input type='checkbox' name='account_name' class='account_name_input search_modal_form' value="コールプライオリティ" data-key="call_priority_avg">コールプライオリティ</li>
                                        <li class='account_name search_modal_form'><input type='checkbox' name='account_name' class='account_name_input search_modal_form' value="雰囲気、会話傾向" data-key="atmosphere_avg">雰囲気、会話傾向</li>
                                        <li class='account_name search_modal_form'><input type='checkbox' name='account_name' class='account_name_input search_modal_form' value="動揺" data-key="upset_avg">動揺</li>
                                        <li class='account_name search_modal_form'><input type='checkbox' name='account_name' class='account_name_input search_modal_form' value="喜び" data-key="content_avg">喜び</li>
                                        <li class='account_name search_modal_form'><input type='checkbox' name='account_name' class='account_name_input search_modal_form' value="不満" data-key="dissatisfaction_avg">不満</li>
                                        <li class='account_name search_modal_form'><input type='checkbox' name='account_name' class='account_name_input search_modal_form' value="極端な起伏" data-key="extreame_emotion_avg">極端な起伏</li>
                                        <li class='account_name search_modal_form'><input type='checkbox' name='account_name' class='account_name_input search_modal_form' value="会話速度" data-key="speech_rate_avg">会話速度</li>
                                        <li class='account_name search_modal_form'><input type='checkbox' name='account_name' class='account_name_input search_modal_form' value="声の音量" data-key="volume_avg">声の音量</li>
                                        <li class='account_name search_modal_form'><input type='checkbox' name='account_name' class='account_name_input search_modal_form' value="沈黙回数" data-key="pause_count">沈黙回数</li>
                                        <li class='account_name search_modal_form'><input type='checkbox' name='account_name' class='account_name_input search_modal_form' value="会話の被り回数" data-key="bargein_count">会話の被り回数</li>
                                        <li class='account_name search_modal_form'><input type='checkbox' name='account_name' class='account_name_input search_modal_form' value="会話のラリー回数" data-key="rally_count">会話のラリー回数</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div id="graph-display-tab">
                            <a href="#!">グラフ表示</a>
                        </div>
                        <div id="chart-display-tab">
                            <a href="#!">一覧表示</a>
                        </div>
                    </div>
                </div>
            </div>
            <div class="audio-data-content-area-bottom-chart-paging-area" style="display: none;">
                <div class="paging-info-area">
                    <div class="display-num">
                        <span id="count"></span>
                    </div>
                    <!-- ページング[start] -->
                    <div class="display-page">
                        <select id="dispaly-num" name="dispaly-num" class="per_page" onchange="createChartFromFormData()">
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                            <option valule="200">200</option>
                        </select>
                        <div id="paging" class="paging"></div>
                    </div>
                    <!-- ページング[end] -->
                </div>
            </div>

            <div class="analysis-content-area-bottom-chart-area-wrapper">
                <div class="analysis-content-area-bottom-chart-area">
                    <!-- グラフ表示エリア -->
                </div>

                <table class="analysis-content-area-bottom-list-area">
                    <thead class="analysis-content-area-bottom-list-area-header">
                        <tr class="">
                            <td class="analysis-content-area-bottom-list-area-header-content">
                                <p class="detail-content">詳細</p>
                            </td>
                            <td  class="analysis-content-area-bottom-list-area-header-content">
                                <div class="header-cell-inner room_name">
                                    <p>ルーム名</p>
                                    <p class="sort-area">
                                        <span class="ascending" data-column="room_name"></span>
                                        <span class="descending" data-column="room_name"></span>
                                    </p>
                                </div>
                            </td >
                            <td class="analysis-content-area-bottom-list-area-header-content">
                                <div class="header-cell-inner staff_name">
                                    <p>担当者</p>
                                    <p class="sort-area">
                                        <span class="ascending" data-column="staff_name"></span>
                                        <span class="descending" data-column="staff_name"></span>
                                    </p>
                                </div>
                            </td>
                            <td class="analysis-content-area-bottom-list-area-header-content">
                                <div class="header-cell-inner speech_rate_avg">
                                    <p>会話速度</p>
                                    <p class="sort-area">
                                        <span class="ascending" data-column="speech_rate_avg"></span>
                                        <span class="descending" data-column="speech_rate_avg"></span>
                                    </p>
                                </div>
                            </td>
                            <td class="analysis-content-area-bottom-list-area-header-content">
                                <div class="header-cell-inner volume_avg">
                                    <p>声の声量</p>
                                    <p class="sort-area">
                                        <span class="ascending" data-column="volume_avg"></span>
                                        <span class="descending" data-column="volume_avg"></span>
                                    </p>
                                </div>
                            </td>
                            <td class="analysis-content-area-bottom-list-area-header-content">
                                <div class="header-cell-inner pause_count">
                                    <p>沈黙回数</p>
                                    <p class="sort-area">
                                        <span class="ascending" data-column="pause_count"></span>
                                        <span class="descending" data-column="pause_count"></span>
                                    </p>
                                </div>
                            </td>
                            <td class="analysis-content-area-bottom-list-area-header-content">
                                <div class="header-cell-inner conversation_ratio">
                                    <p>会話比率</p>
                                    <p class="sort-area">
                                        <span class="ascending" data-column="conversation_ratio"></span>
                                        <span class="descending" data-column="conversation_ratio"></span>
                                    </p>
                                </div>
                            </td>
                            <td class="analysis-content-area-bottom-list-area-header-content">
                                <div class="header-cell-inner bargein_count">
                                    <p>会話の被り</p>
                                    <p class="sort-area">
                                        <span class="ascending" data-column="bargein_count"></span>
                                        <span class="descending" data-column="bargein_count"></span>
                                    </p>
                                </div>
                            </td>
                            <td class="analysis-content-area-bottom-list-area-header-content">
                                <div class="header-cell-inner rally_count">
                                    <p>会話のラリー回数</p>
                                    <p class="sort-area">
                                        <span class="ascending" data-column="rally_count"></span>
                                        <span class="descending" data-column="rally_count"></span>
                                    </p>
                                </div>
                            </td>
                            <td class="analysis-content-area-bottom-list-area-header-content">
                                <div class="header-cell-inner energy_avg">
                                    <p>エネルギー</p>
                                    <p class="sort-area">
                                        <span class="ascending" data-column="energy_avg"></span>
                                        <span class="descending" data-column="energy_avg"></span>
                                    </p>
                                </div>
                            </td>
                            <td class="analysis-content-area-bottom-list-area-header-content">
                                <div class="header-cell-inner stress_avg">
                                    <p>ストレス</p>
                                    <p class="sort-area">
                                        <span class="ascending" data-column="stress_avg"></span>
                                        <span class="descending" data-column="stress_avg"></span>
                                    </p>
                                </div>
                            </td>
                            <td class="analysis-content-area-bottom-list-area-header-content">
                                <div class="header-cell-inner emo_cog_avg">
                                    <p>論理/感情</p>
                                    <p class="sort-area">
                                        <span class="ascending" data-column="emo_cog_avg"></span>
                                        <span class="descending" data-column="emo_cog_avg"></span>
                                    </p>
                                </div>
                            </td>
                            <td class="analysis-content-area-bottom-list-area-header-content">
                                <div class="header-cell-inner concentration_avg">
                                    <p>集中</p>
                                    <p class="sort-area">
                                        <span class="ascending" data-column="concentration_avg"></span>
                                        <span class="descending" data-column="concentration_avg"></span>
                                    </p>
                                </div>
                            </td>
                            <td class="analysis-content-area-bottom-list-area-header-content">
                                <div class="header-cell-inner anticipation_avg">
                                    <p>期待</p>
                                    <p class="sort-area">
                                        <span class="ascending" data-column="anticipation_avg"></span>
                                        <span class="descending" data-column="anticipation_avg"></span>
                                    </p>
                                </div>
                            </td>
                            <td class="analysis-content-area-bottom-list-area-header-content">
                                <div class="header-cell-inner excitement_avg">
                                    <p>興奮</p>
                                    <p class="sort-area">
                                        <span class="ascending" data-column="excitement_avg"></span>
                                        <span class="descending" data-column="excitement_avg"></span>
                                    </p>
                                </div>
                            </td>
                            <td class="analysis-content-area-bottom-list-area-header-content">
                                <div class="header-cell-inner hesitation_avg">
                                    <p>躊躇</p>
                                    <p class="sort-area">
                                        <span class="ascending" data-column="hesitation_avg"></span>
                                        <span class="descending" data-column="hesitation_avg"></span>
                                    </p>
                                </div>
                            </td>
                            <td class="analysis-content-area-bottom-list-area-header-content">
                                <div class="header-cell-inner uncertainty_avg">
                                    <p>不確実</p>
                                    <p class="sort-area">
                                        <span class="ascending" data-column="uncertainty_avg"></span>
                                        <span class="descending" data-column="uncertainty_avg"></span>
                                    </p>
                                </div>
                            </td>
                            <td class="analysis-content-area-bottom-list-area-header-content">
                                <div class="header-cell-inner intensive_thinking_avg">
                                    <p>思考</p>
                                    <p class="sort-area">
                                        <span class="ascending" data-column="intensive_thinking_avg"></span>
                                        <span class="descending" data-column="intensive_thinking_avg"></span>
                                    </p>
                                </div>
                            </td>
                            <td class="analysis-content-area-bottom-list-area-header-content">
                                <div class="header-cell-inner imagination_activity_avg">
                                    <p>想像力</p>
                                    <p class="sort-area">
                                        <span class="ascending" data-column="imagination_activity_avg"></span>
                                        <span class="descending" data-column="imagination_activity_avg"></span>
                                    </p>
                                </div>
                            </td>
                            <td class="analysis-content-area-bottom-list-area-header-content">
                                <div class="header-cell-inner embarrassment_avg">
                                    <p>困惑</p>
                                    <p class="sort-area">
                                        <span class="ascending" data-column="embarrassment_avg"></span>
                                        <span class="descending" data-column="embarrassment_avg"></span>
                                    </p>
                                </div>
                            </td>
                            <td class="analysis-content-area-bottom-list-area-header-content">
                                <div class="header-cell-inner passionate_avg">
                                    <p>情熱</p>
                                    <p class="sort-area">
                                        <span class="ascending" data-column="passionate_avg"></span>
                                        <span class="descending" data-column="passionate_avg"></span>
                                    </p>
                                </div>
                            </td>
                            <td class="analysis-content-area-bottom-list-area-header-content">
                                <div class="header-cell-inner brain_power_avg">
                                    <p>脳活動</p>
                                    <p class="sort-area">
                                        <span class="ascending" data-column="brain_power_avg"></span>
                                        <span class="descending" data-column="brain_power_avg"></span>
                                    </p>
                                </div>
                            </td>
                            <td class="analysis-content-area-bottom-list-area-header-content">
                                <div class="header-cell-inner confidence_avg">
                                    <p>自信</p>
                                    <p class="sort-area">
                                        <span class="ascending" data-column="confidence_avg"></span>
                                        <span class="descending" data-column="confidence_avg"></span>
                                    </p>
                                </div>
                            </td>
                            <td class="analysis-content-area-bottom-list-area-header-content">
                                <div class="header-cell-inner aggression_avg">
                                    <p>攻撃性</p>
                                    <p class="sort-area">
                                        <span class="ascending" data-column="aggression_avg"></span>
                                        <span class="descending" data-column="aggression_avg"></span>
                                    </p>
                                </div>
                            </td>
                            <td class="analysis-content-area-bottom-list-area-header-content">
                                <div class="header-cell-inner call_priority_avg">
                                    <p>コールプライオリティ</p>
                                    <p class="sort-area">
                                        <span class="ascending" data-column="call_priority_avg"></span>
                                        <span class="descending" data-column="call_priority_avg"></span>
                                    </p>
                                </div>
                            </td>
                            <td class="analysis-content-area-bottom-list-area-header-content">
                                <div class="header-cell-inner atmosphere_avg">
                                    <p>雰囲気</p>
                                    <p class="sort-area">
                                        <span class="ascending" data-column="atmosphere_avg"></span>
                                        <span class="descending" data-column="atmosphere_avg"></span>
                                    </p>
                                </div>
                            </td>
                            <td class="analysis-content-area-bottom-list-area-header-content">
                                <div class="header-cell-inner upset_avg">
                                    <p>動揺</p>
                                    <p class="sort-area">
                                        <span class="ascending" data-column="upset_avg"></span>
                                        <span class="descending" data-column="upset_avg"></span>
                                    </p>
                                </div>
                            </td>
                            <td class="analysis-content-area-bottom-list-area-header-content">
                                <div class="header-cell-inner content_avg">
                                    <p>喜び</p>
                                    <p class="sort-area">
                                        <span class="ascending" data-column="content_avg"></span>
                                        <span class="descending" data-column="content_avg"></span>
                                    </p>
                                </div>
                            </td>
                            <td class="analysis-content-area-bottom-list-area-header-content">
                                <div class="header-cell-inner dissatisfaction_avg">
                                    <p>不満</p>
                                    <p class="sort-area">
                                        <span class="ascending" data-column="dissatisfaction_avg"></span>
                                        <span class="descending" data-column="dissatisfaction_avg"></span>
                                    </p>
                                </div>
                            </td>
                            <td class="analysis-content-area-bottom-list-area-header-content">
                                <div class="header-cell-inner extreame_emotion_avg">
                                    <p>極端な起伏</p>
                                    <p class="sort-area">
                                        <span class="ascending" data-column="extreame_emotion_avg"></span>
                                        <span class="descending" data-column="extreame_emotion_avg"></span>
                                    </p>
                                </div>
                            </td>
                        </tr>
                    </thead>
                    <tbody id="item-area"></tbody>
                </table>
            </div>
        </div>
    </div>
    </div>
</div>
<script src="/js/analysis-audio-data.js"></script>
<script type="text/javascript" src="/js/tag-it.js" charset="utf-8"></script>