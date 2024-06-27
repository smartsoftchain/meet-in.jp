{include file="./common/header.tpl"}

{literal}
<link rel="stylesheet" href="/css/client_log.css">
<script src="/src/colorpicker/colorpicker.js"></script>
<script src="/js/webinar.js?{$application_version}"></script>
<script src="/js/client-log.js"></script>
<link rel="stylesheet" href="/src/colorpicker/css/colorpicker.css">
<link rel="stylesheet" href="/css/webinar.css?{$application_version}">

<script>

</script>

{/literal}
<!-- メインコンテンツ start -->
<div id="mi_main_contents">
    <!-- トップナビ start -->
    <div id="mi_top_nav">
        <!-- パンくずリスト start -->
        <div class="mi_breadcrumb_list"><a href="/index/menu">TOP</a>&nbsp;&gt;&nbsp;<a href="javascript:void(0);">利用状況集計</a></div>
        <!-- パンくずリスト end -->
    </div>
    <!-- トップナビ end -->

    ​<!-- モーダル開始 -->
    <div class="modal-content model_call_operator_wrap" id="modal-content">
        <div class="mi_modal_shadow">
        </div>
        <div class="modal-wrap mi_modal_default">
            <!-- モーダルタイトル -->
            <div class="mi_content_title">
                <h3>接続方法を選択してください</h3>
            </div>
            <div class="mi_radio_area">
                <div class="radio_left">
                    <input type="radio" id="connect_mode" class="radio-input" name="select" value="1">
                    <span class="radio">通常モードで接続</span>
                </div>
                <div class="radio_right">
                    <input type="radio" id="connect_mode" class="radio-input" name="select" value="2">
                    <span class="radio">モニタリングモードで接続</span>
                </div>
            </div>
            <div class="mi_tabel_btn_area">
                <button class="modal-close">キャンセル</button>
                <button type="button" class="connect-button">接続</button>
            </div>
        </div>
    </div>
    ​<!-- モーダル終了 -->

    <!-- コンテンツエリア start -->
    <div id="mi_content_area">
        <div class="mi_content_area">
            <span class="icon-memo mi_content_title_icon"></span>
            <h1 class="room_log_title">利用状況集計</h1>
        </div>
        <!-- 現在使用されているroom名のみ表示(画面上部) -->
        <div class="active_room_wrap">
            <h1 class="h1_room">現在接続しているルーム</h1>
            <div class="active_room" style="text-align: center;">
                <div class="page_area_wrapper-top">
                    <a class="icon-menu-05 mi_page_arrow_icon" id="icon-menu-left-top"></a>
                    <div id="page_area-top"></div>
                    <a class="icon-menu-06 mi_page_arrow_icon" id="icon-menu-right-top"></a>
                </div>
                <table class="room_table">
                    <tbody class="room_body">
                        <tr>
                            <th class="room_header width_25">ルーム名</th>
                            <th class="room_header width_75">URL</th>
                        </tr>
                    </tbody>
                </table>
                <div class="loading_1 loader"></div>
            </div>
        </div>
        <!-- 利用状況集計表示(画面下部) -->
        <div class="usage_total_wrap">
            <h1 class="usage_total_title">利用状況集計</h1>
            <!-- カレンダーを作成 -->
            <div class="select_conditions_wrap">
                <div class="log_view_period_selection-name-area">
                    <input type="text" class="select_name form_arrow_icon search_modal_form" name="holding_name" id="search_form" readonly/>
                    <div id="select_account_modal" class="search_modal_form">
                        <div class="select_account_modal_search">
                            <input type='text' name='account_search' class='account_search search_modal_form'id="select_name" placeholder="検索">
                        </div>
                        <div class="select_account_modal_top search_modal_form">
                            <input type='checkbox' name='account_name' class='account_name_input_all search_modal_form' checked>
                            全て
                        </div>
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
                <img class="form_arrow_icon search_modal_form" src="/img/row-arrow.svg">
                <div class="log_view_period_selection-start-period-area">
                    <input type="text" class="start_period" name="holding_date" id="start_period_date"/>
                </div>
                <div class="log_view_period_selection-wave-area">
                    <span class="mi_tabel_title end_period_date">〜</span>
                </div>
                <div class="log_view_period_selection-end-period-area">
                    <input type="text" class="end_period end_period_date_wrap" name="holding_date" id="end_period_date"/>
                </div>
                <div class="log_view_period_selection-send-button-area">
                    <button class="data_send" id="data_send">集計</button>
                </div>
                <div class="log_view_period_selection-crear-area">
                    <a href="#" class="condition_crear">条件クリア</a>
                </div>
            </div>
            <div class="use_count_wrap">
                <div class="use_count_inner_wrap">
                    <span class="room_use_count">
                        <h1 style="font-weight: normal;">ルーム接続回数(合計)</h1>
                        <span class="room_use_count_number">{$roomUseCount}</span>回
                    </span>
                    <span class="room_use_time">
                        <h1 style="font-weight: normal;">ルーム接続時間(合計)</h1>
                        <span class="room_use_time_number">{$roomUseAmountTime}</span>時間
                    </span>
                </div>
                <div class="first_time_aggregate">
            </div>
                <!-- 項目選択 -->
                <div class="option_area">
                    <span>
                        <select name="list_type" class="list_type" id="list_type" style="margin-bottom: 15px;">
                            <option value="1">接続時間帯別</option>
                            <option value="2">時間帯別</option>
                            <option value="3">曜日別</option>
                            <option value="4">日付別</option>
                            <option value="5">週別</option>
                            <option value="6">月別</option>
                            <option value="7">ルーム別</option>
                            <option value="8">機能別</option>
                            <option value="9">資料別</option>
                        </select>
                    </span>
                    <div class="page_area_wrapper">
                        <a class="icon-menu-05 mi_page_arrow_icon" id="icon-menu-left"></a>
                        <div id="page_area"></div>
                        <a class="icon-menu-06 mi_page_arrow_icon" id="icon-menu-right"></a>
                    </div>
                </div>
                <table class="usage_total_table">
                </table>
            </div>
            <div style="text-align: center;">
                <div class="loading_2 hide loader"></div>
            </div>
        </div>
        <!-- ここ以下はデフォルトで表示される画面　end -->
        ​
    </div>
    <!-- コンテンツエリア end -->
</div>
<!-- メインコンテンツ end -->

{include file="./common/footer.tpl"}