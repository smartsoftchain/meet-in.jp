

//デフォルトチェック.
$(document).ready(function(){
    ['volume_avg', 'speech_rate_avg', 'rally_count'].map( key => {
        let e = document.querySelector('.account_name_input.search_modal_form[data-key="'+key+'"]');
        $("#select-account-names").append("<li class='select_account_name search_modal_form'><input type='checkbox' name='account_name' checked='checked' class='account_name_input search_modal_form' value="+"'"+$(e).val()+"' data-key='"+ $(e).attr('data-key') +"'>"+$(e).val()+"</li>");
        $('#account-name-list').find($('input[value="' + $(e).val() + '"]')).parent().remove()
    });
    $('#search_form').val("声の音量  他 2件");
})


/**
 * 集計ボタン押下
 */
$('#start-analysis-button').click(function(event){
    // 画面の遷移を停止
    event.preventDefault();
    // フォームデータを元にチャートを生成する
    createChartFromFormData();
})


// 表示項目変更時
$(document).on('click', ".term_type", function(e) {
    const termType = $(e.target).data('value');
    createChartFromFormData(termType);
});

function getListActivePage() {
   return $(".page-item.active").data("page");
}

function getDispalyNum() {
   return document.getElementById('dispaly-num').value;
}

function getAccountNameInput() {
    // チェックが付いた評価項目のdataごとに配列に格納する.
    return $('.account_name_input:checked').map(function(){return $(this).attr('data-key');}).get();
}



// 昇順ソート
$('.ascending').click(function(e){
    const sortKey = $(e.target).attr('data-column');
    tableData.sort(function(a,b)
    {
        if(sortKey == 'conversation_date'){
            if(new Date(a.conversation_date + ' ' + a.conversation_time) < new Date(b.conversation_date + ' ' + b.conversation_time)) return -1;
            if(new Date(a.conversation_date + ' ' + a.conversation_time) > new Date(b.conversation_date + ' ' + b.conversation_time)) return 1;
        }
        // ソート対象が文字列の場合
        if(Number.isNaN(a[sortKey] - 0)){
            if(a[sortKey] < b[sortKey]) return -1;
            if(a[sortKey] > b[sortKey]) return 1;
        }
        // ソート対象が数値の場合
        else {
            // 数の文字列を数値に変換するために-0をする
            if(a[sortKey] - 0 < b[sortKey] - 0) return -1;
            if(a[sortKey] - 0 > b[sortKey] - 0) return 1;
        }
        return 0;
    });

    $(".analysis-content-area-bottom-list-area-record").remove();

    let page = getListActivePage();
    let per_page = getDispalyNum();
    let firstIndex = (page - 1) * per_page ;
    let lastIndex  = page * per_page;
    $('#item-area').html(template(tableData.filter(function(e,index, array){ return firstIndex <= index && index < lastIndex; })));
});

// 降順ソート
$('.descending').click(function(e){
    const sortKey = $(e.target).attr('data-column');
    tableData.sort(function(a,b)
    {
        if(sortKey == 'conversation_date'){
            if(new Date(a.conversation_date + ' ' + a.conversation_time) > new Date(b.conversation_date + ' ' + b.conversation_time)) return -1;
            if(new Date(a.conversation_date + ' ' + a.conversation_time) < new Date(b.conversation_date + ' ' + b.conversation_time)) return 1;
        }
        // ソート対象が文字列の場合
        if(Number.isNaN(a[sortKey] - 0)){
            if(a[sortKey] > b[sortKey]) return -1;
            if(a[sortKey] < b[sortKey]) return 1;
        }
        // ソート対象が数値の場合
        else {
            // 数の文字列を数値に変換するために-0をする
            if(a[sortKey] - 0 > b[sortKey] - 0) return -1;
            if(a[sortKey] - 0 < b[sortKey] - 0) return 1;
        }
    });

    $(".analysis-content-area-bottom-list-area-record").remove();

    let page = getListActivePage();
    let per_page = getDispalyNum();
    let firstIndex = (page - 1) * per_page ;
    let lastIndex  = page * per_page;
    $('#item-area').html(template(tableData.filter(function(e,index, array){ return firstIndex <= index && index < lastIndex; })));
})

function diffYear(d1, d2) {
    from = new Date(d1);
    to = new Date(d2);
    return to.getFullYear() - from.getFullYear();
}


/**
 * 解析データ取得
 * @param object params
 */
function fetchAnalyses(params){
    return $.ajax({
        url: "/analysis-audio/get-audio-data-list",
        type: 'POST',
        data: params,
    })
}

/**
 * グラフ生成に利用できる配列の状態に整形
 */
function analysisDataArrange(analysisData, termType) {
    let analysisTargets = [];   //グラフの線の名前
    let analysisDataArray = []; //グラフを表示するためのデータ


    let graphScaleKey = {}; // 参照するcolumnと、グラフ上の単位.
    if(termType == 'hour'){
        graphScaleKey = 'span_of_time';
    } else if(termType == 'day') {
        graphScaleKey = 'date';
    } else if(termType == 'week') {
        graphScaleKey = 'week';
    } else if(termType == 'month') {
        graphScaleKey = 'month';
    } else if(termType == 'year') {
        graphScaleKey = 'year';
    } else {
        graphScaleKey = 'span_of_time';
    }
console.log(graphScaleKey);

    // 表示する線の対象者を設定
    Object.keys(analysisData).forEach((staffKey) => {
        analysisTargets.push(analysisData[staffKey].name);
    })

    // チェックが付いた評価項目のdataごとに配列に格納する.
    const selectKey = getAccountNameInput();

    // 一番記録が多いユーザに合わせて ゼロ詰めを行い帳尻を揃える.
    const userIndexMaxValue = analysisData.map(e=> e.param.length).reduce((max, value, index, arry) => value > arry[max] ? index : max, 0);
    getAccountNameInput().forEach(key => {
        //各評価項目(key)ごとに配列に格納する
        analysisDataArray[key] = [];
        for(let i=0; analysisData[userIndexMaxValue].param.length > i; i++){

            // 同じ時間帯のデータを各ユーザから探す なければ 0.
            let record = analysisData[userIndexMaxValue].param[i];

            // グラフ目盛りとなるデータを0列目に代入する
            analysisDataArray[key][i] = [];
            analysisDataArray[key][i][0] = record[graphScaleKey];

            // 各ユーザの値を取得　なければ 0.
            for(let j=0; j < analysisData.length; j++) {

                let match = analysisData[j].param.find(r => r[graphScaleKey] != undefined && r[graphScaleKey] == record[graphScaleKey]);
                if(match != undefined) {
                    analysisDataArray[key][i][j+1] = match[key] - 0;
                } else {
                    analysisDataArray[key][i][j+1] = 0;
                }
            }
        }
    });


    let analysisObj = new Object();
    analysisObj.analysisTargets = analysisTargets;
    analysisObj.analysisDataArray = analysisDataArray;

    return analysisObj;
}



/**
 * チャートを生成する
 */
function createAnalysisChart(chartId,analysisTargets, analysisData) {
    google.load( "visualization", "1", { packages : [ 'corechart' ]}) ;
    google.setOnLoadCallback( drawChart );
    function drawChart()
    {
        // あらかじめ集計条件「リスト・期間・開始日・終了日・曜日」から架電データをソート
        var dataTable= new google.visualization.DataTable();
        // 日付カラムは必ず追加
        dataTable.addColumn('string','日付');
        // 「平均取得対象」で選択された個数だけ追加する(現在決め打ち)
        analysisTargets.forEach(function(value){
            dataTable.addColumn('number',value);
        });
        // 取得してきたデータ群をrowにセット
        analysisData.forEach(function(value){
            dataTable.addRows([value]);
        });

        // グラフの設定
        var option = {
            hAxis: {
                gridlines:{color:'transparent'}
            },
        };

        var chart = new google.visualization.ComboChart( document.getElementById( `analysis_chart_area_${chartId}` )) ;
        chart.draw( dataTable, option ) ;
    }
}

$('#graph-display-tab').click(function(){
    // ボタンのトグル
    $(this).css('background','#ECECEC 0% 0% no-repeat padding-box')
    $('#chart-display-tab').css('background','none')
    // チャート部分を表示
    $('.analysis-content-area-bottom-chart-area').css("display","block");
    $('.analysis-content-area-bottom-list-area').css('display','none');
    $('.audio-data-content-area-bottom-chart-paging-area').css('display', 'none');
    $('.analysis-content-area-bottom-tab-area').css('justify-content','flex-end');
    $('.analysis-content-area-bottom-chart-area-wrapper').css('overflow','');

    $('#search_form').show(); // 図 感情の項目1.
    $('#search_form_icon').show();  // 図 感情の項目1.

    // 表表示状態から「集計」を押下し、グラフ表示に切り替えた場合にグラフの大きさがおかしくなってしまうため再生成
    createChartFromFormData();
})

$('#chart-display-tab').click(function(){
    // ボタンのトグル
    $(this).css('background','#ECECEC 0% 0% no-repeat padding-box')
    $('#graph-display-tab').css('background','none')
    // グラフ表示の要素を削除
    $('.analysis-content-area-bottom-chart-area').css("display","none")
    $('.audio-data-content-area-bottom-chart-paging-area').css('display', 'block');
    // 表部分を表示し、親要素等を調整
    $('.analysis-content-area-bottom-list-area').css('display','block');
    $('.analysis-content-area-bottom-chart-area-wrapper').css('overflow','auto');
    $('.analysis-content-area-bottom-list-area').css({
        'border':'none'
    });

    $('#search_form').hide(); // 図 感情の項目1.
    $('#search_form_icon').hide();  // 図 感情の項目1.
})


// グラフ絞り込みモーダル制御
$('.form_arrow_icon').click(function() {
    if($('#select_account_modal').css('visibility') == 'hidden'){
        $('#select_account_modal').css("visibility","visible");
    }else{
        $('#select_account_modal').css("visibility","hidden");
    }
})


// モーダル内チェック入れ替え処理
$(document).on("change", ".account_name_input", function () {
    $('.account_name').off();
    $('.select_account_name').off();
    if (this.checked) {
        // 候補の中から要素を選択した場合、候補内から選択した要素を消去し、選択中へ移動させる
        $("#select-account-names").append("<li class='select_account_name search_modal_form'><input type='checkbox' name='account_name' checked='checked' class='account_name_input search_modal_form' value="+"'"+$(this).val()+"' data-key='"+ $(this).attr('data-key') +"'>"+$(this).val()+"</li>");
        $('#account-name-list').find($('input[value="' + $(this).val() + '"]')).parent().remove()
        const selectElems = document.getElementById('select-account-names');
        const selectElemsLength = $(selectElems).find('.select_account_name').length;
        const selectElemsLengthView = selectElemsLength - 1;
        const remainSelectElems = document.getElementsByClassName('select_account_name')[0];
        var remainSelectValue = $(remainSelectElems).find('.account_name_input').val();
         // 検索フォーム内のvalueを操作
        if(selectElemsLength === 0){
            $('#search_form').val('');
        }else if(selectElemsLength === 1){
            $('#search_form').val(remainSelectValue);
        }else{
            if(remainSelectValue.length >= 11){
                remainSelectValue = remainSelectValue.substr(0,9)+"...";
            }
            $('#search_form').val(remainSelectValue+"  他"+selectElemsLengthView+"件");
        }
        if($('.select_account_name').length === 3){
            $('#account-name-list').css('opacity','0.3');
            $('#account-name-list').css('pointer-events','none');
        }
    }else{
        // 選択中の中から要素を選択した場合、選択中内から選択した要素を消去し、候補内に戻す
        $("#account-name-list").append("<li class='account_name search_modal_form'><input type='checkbox' name='account_name' class='account_name_input search_modal_form' value="+"'"+$(this).val()+ "'" +">"+$(this).val()+"</li>");
        $('#select-account-names').find($('input[value="' + $(this).val() + '"]')).parent().remove()
        const selectElems = document.getElementById('select-account-names');
        const selectElemsLength = $(selectElems).find('.select_account_name').length;
        const selectElemsLengthView = selectElemsLength -1
        const remainSelectElems = document.getElementsByClassName('select_account_name')[0];
        var remainSelectValue = $(remainSelectElems).find('.account_name_input').val();
         // 検索フォーム内のvalueを操作
        if(selectElemsLength === 0){
            $('#search_form').val('');
        }else if(selectElemsLength === 1){
            $('#search_form').val(remainSelectValue);
        }else{
            if(remainSelectValue.length >= 11){
                remainSelectValue = remainSelectValue.substr(0,9)+"...";
            }
            $('#search_form').val(remainSelectValue+"  他"+selectElemsLengthView+"件");
        }
        if($('.select_account_name').length < 3){
            $('#account-name-list').css('opacity','1');
            $('#account-name-list').css('pointer-events','auto');
        }
    }
});

// 検索条件フォーム部分 アローアイコン以外がクリックされたらモーダル非表示
$(document).on('click touchend', function(event) {
    if (!$(event.target).closest('.search_modal_form').length) {
        $('#select_account_modal').css("visibility","hidden");
    }
});
var tableData = [];

function createPostData(termType) {
    let postData = {};
    postData["analysis-day-start"] = $('#input-start-data').val();
    postData["analysis-day-end"] = $('#input-end-data').val();
    postData["day-of-the-week"] = $('[name=day-of-the-week]:checked').map(function(){return $(this).val();}).get();
    postData["users"] = $('.users').map(function(){return $(this).val();}).get();

    postData["time"] = termType;
    postData["per_page"] = $('.per_page').val();

    return postData;
}

function validatePostData(postData) {

    if(postData["analysis-day-start"] > postData["analysis-day-end"]) {
        alert("【対象期間】の指定エラー\n開始日が終了日より未来になっています");
        return false;
    }

    if(0 == postData["users"].length) {
        alert("【取得対象（ユーザー）】の指定エラー\n最低1人設定してください");
        return false;
    }


     // 問題なければエラーメッセージ消去
    $('.error').remove();
    return true;
}


// フォームデータを元にチャートを生成する
function createChartFromFormData(termType='hour') {

    let postData = createPostData(termType);
    if(!validatePostData(postData)) {
        return;
    }

    const selectElems = $('#select-account-names').find('.account_name_input');
    const selectChartTitles = []
    for(let i=0; selectElems.length>i; i++){
        selectChartTitles.push(selectElems[i].value)
    }

    let data = {};
    data["select_chart"] = selectChartTitles;

    // _U.showLoading();

    // formの値を元にDBからデータを取得
    $.ajax({
        url: "/analysis-audio/create-audio-analysis-graph",
        type: "POST",
        dataType: "text",
        data: postData,
    }).done(function(res) {
        const obj = JSON.parse(res);
        if(obj.length == 0){
            _U.hideLoading();
            return false;
        }
        // 返ってきたオブジェクトを整形
        const analysisData = analysisDataArrange(obj, termType);
        $('.analysis-content-area-bottom-chart-area').empty();
        $('.analysis-content-area-bottom-chart-area').css('border','1px solid #707070');
        // グラフを項目分生成
        for(let i=0; i < data["select_chart"].length; i++) {
            let key = $(`input[value="${data['select_chart'][i]}"]`).attr('data-key');
            if(postData["time"] != 'year') {
                $('.analysis-content-area-bottom-chart-area').append(`
                    <div class="analysis-content-area-bottom-chart-area-header">
                        <div class="chart_title_text">
                            ${data["select_chart"][i]}
                        </div>

                        <img src="/img/help_mark.svg" class="question_icon">
                        <div class="question_modal" style="visibility:hidden"></div>

                        <div class="analysis-content-area-bottom-chart-area-header-tab">
                            <span class="term_type ${termType == 'hour' ? 'active': ''}" data-value="hour">時間</span>
                            <span class="term_type ${termType == 'day' ? 'active': ''}"" data-value="day">日</span>
                            <span class="term_type ${termType == 'week' ? 'active': ''}"" data-value="week">週</span>
                            <span class="term_type ${termType == 'month' ? 'active': ''}"" data-value="month">月</span>
                        </div>
                    </div>
                    <div class="analysis-content-area-bottom-chart-area-content" id="analysis_chart_area_chart_${i}"></div>
                `);
                 // 要素が生成された際に、ホバーイベントを付与
                const question_icon = document.getElementsByClassName('question_icon');
                const question_modal = document.getElementsByClassName('question_modal');
                // クエスチョンマークをホバーした際にモーダルを表示する
                $(question_icon).hover(function() {
                    $(this).parent().find(".question_modal").css('visibility','visible');
                    const parentElemText = $(this).parent().find(".chart_title_text").text().trim();
                    // 各項目のタイトルによって、モーダル内のテキストを変更
                    if(parentElemText === "会話速度"){
                        $(question_modal).html("ユーザーの会話速度を表しています。<br>単位は、文字/秒です。");
                    }else if(parentElemText === "声の音量"){
                        $(question_modal).html("ユーザーの声の大きさを表しています。<br>声の大きさに応じて値が大きくなります。");
                    }else if(parentElemText === "沈黙回数"){
                        $(question_modal).html("全ユーザーが発話しない状態が3秒以上存在した場合に<br>その回数を示します。");
                    }else if(parentElemText === "会話比率"){
                        $(question_modal).html("会話全体でユーザーが発話していた時間の<br>割合を示します。");
                    }else if(parentElemText === "会話の被り回数"){
                        $(question_modal).html("ユーザーと通話相手の発言が重なった時間が<br>1秒以上存在するごとにカウントされます。");
                    }else if(parentElemText === "会話のラリー回数"){
                        $(question_modal).html("話者が切り替わった回数を示します。");
                    }else{
                        $(question_modal).html("声の抑揚や大きさ、速さなどを分析し、<br>ユーザーの感情をグラフに反映します。");
                    }
                }, function() {
                    $(question_modal).css('visibility','hidden');
                });
            } else {
                $('.analysis-content-area-bottom-chart-area').append(`
                <div class="analysis-content-area-bottom-chart-area-header">
                    <div>
                        ${data["select_chart"][i]}
                    </div>
                </div>
                <div class="analysis-content-area-bottom-chart-area-content" id="analysis_chart_area_chart_${i}"></div>
            `);
            }

            createAnalysisChart(`chart_${i}`,analysisData.analysisTargets, analysisData.analysisDataArray[key]);
        }
    }).fail(function() {
        console.log("error")
    });

    // 表データを取得
    fetchAnalyses(postData).done(function(responseJson) {
        const response = JSON.parse(responseJson);

        // 表示している表データを削除
        $(".analysis-content-area-bottom-list-area-record").remove();

        // 検索条件を変えた場合ページネーションを更新するために一度削除する
        $('#paging').remove();
        $('.display-page').append("<div id='paging' class='paging'></div>");

        // 取得レコード数
        $('#count').html(`<span>該当件数：${response.result.count}件</span>`)

        if(response.result.count == 0){
            _U.hideLoading();
            return false;
        }

        tableData = response.result.items;

        // 集計ボタンクリック時、1件以上ある場合の処理
        $('#item-area').html(template(tableData.filter(function(e,index, array){ return 0 <= index && index < response.pagination.per_page; })));

        _U.hideLoading();

        // ページネーション作成
        $('#paging').twbsPagination({
            totalPages: response.pagination.total_pages,
            visiblePages: response.pagination.per_page,
            first: null,
            prev: '&lt;',
            next: '&gt;',
            last: null,
            initiateStartPageClick: false,  //ページネーション作成時、onPageClick内処理を実行しない
            onPageClick: function(e, page) {

                let postData = createPostData();
                if(!validatePostData(postData)) {
                    return;
                }
                fetchAnalyses(postData).done(function(responseJson){

                    let response = JSON.parse(responseJson);
                    $(".analysis-content-area-bottom-list-area-record").remove();

                    tableData = response.result.items;

                    let firstIndex = (page - 1) * response.pagination.per_page;
                    let lastIndex  = page * response.pagination.per_page;
                    $('#item-area').html(template(tableData.filter(function(e,index, array){ return firstIndex <= index && index < lastIndex; })));

                    _U.hideLoading();

                }).fail(function(response){
                    alert("サーバーエラーです。管理者にお問い合わせください。");
                    _U.hideLoading();
                })

            }
        });

    }).fail(function(response){
        alert("サーバーエラーです。管理者にお問い合わせください。");
        _U.hideLoading();
    })

}

function template(items) {
    const records = items.map((item) => {
        return `
            <tr class="analysis-content-area-bottom-list-area-record">
                <td class="analysis-content-area-bottom-list-area-content detail-content">
                    <a class="link" href="/analysis-audio/show-audio-data-detail?id=${item.conversation_id}">詳細</a>
                </td>
                <td class="analysis-content-area-bottom-list-area-content room_name">
                    ${item.room_name == null ? '-' : item.room_name}
                </td>
                <td class="analysis-content-area-bottom-list-area-content staff_name">
                    ${item.staff_name == null ? '-' : item.staff_name}
                </td>
                <td class="analysis-content-area-bottom-list-area-content conversation_ratio">
                    ${item.speech_rate_avg == null ? '-' : item.speech_rate_avg}
                </td>
                <td class="analysis-content-area-bottom-list-area-content volume_avg">
                    ${item.volume_avg == null ? '-' : item.volume_avg}
                </td>
                <td class="analysis-content-area-bottom-list-area-content pause_count">
                    ${item.pause_count == null ? '-' : item.pause_count}
                </td>
                <td class="analysis-content-area-bottom-list-area-content speech_rate_avg">
                    ${item.conversation_ratio == null ? '-' : item.conversation_ratio}
                </td>
                <td class="analysis-content-area-bottom-list-area-content bargein_count">
                    ${item.bargein_count == null ? '-' : item.bargein_count}
                </td>
                <td class="analysis-content-area-bottom-list-area-content rally_count">
                    ${item.rally_count == null ? '-' : item.rally_count}
                </td>
                <td class="analysis-content-area-bottom-list-area-content energy_avg">
                    ${item.energy_avg == null ? '-' : item.energy_avg}
                </td>
                <td class="analysis-content-area-bottom-list-area-content stress_avg">
                    ${item.stress_avg == null ? '-' : item.stress_avg}
                </td>
                <td class="analysis-content-area-bottom-list-area-content emo_cog_avg">
                    ${item.emo_cog_avg == null ? '-' : item.emo_cog_avg}
                </td>
                <td class="analysis-content-area-bottom-list-area-content concentration_avg">
                    ${item.concentration_avg == null ? '-' : item.concentration_avg}
                </td>
                <td class="analysis-content-area-bottom-list-area-content anticipation_avg">
                    ${item.anticipation_avg == null ? '-' : item.anticipation_avg}
                </td>
                <td class="analysis-content-area-bottom-list-area-content excitement_avg">
                    ${item.excitement_avg == null ? '-' : item.excitement_avg}
                </td>
                <td class="analysis-content-area-bottom-list-area-content hesitation_avg">
                    ${item.hesitation_avg == null ? '-' : item.hesitation_avg}
                </td>
                <td class="analysis-content-area-bottom-list-area-content uncertainty_avg">
                    ${item.uncertainty_avg == null ? '-' : item.uncertainty_avg}
                </td>
                <td class="analysis-content-area-bottom-list-area-content intensive_thinking_avg">
                    ${item.intensive_thinking_avg == null ? '-' : item.intensive_thinking_avg}
                </td>
                <td class="analysis-content-area-bottom-list-area-content imagination_activity_avg">
                    ${item.imagination_activity_avg == null ? '-' : item.imagination_activity_avg}
                </td>
                <td class="analysis-content-area-bottom-list-area-content embarrassment_avg">
                    ${item.embarrassment_avg == null ? '-' : item.embarrassment_avg}
                </td>
                <td class="analysis-content-area-bottom-list-area-content passionate_avg">
                    ${item.passionate_avg == null ? '-' : item.passionate_avg}
                </td>
                <td class="analysis-content-area-bottom-list-area-content brain_power_avg">
                    ${item.brain_power_avg == null ? '-' : item.brain_power_avg}
                </td>
                <td class="analysis-content-area-bottom-list-area-content confidence_avg">
                    ${item.confidence_avg == null ? '-' : item.confidence_avg}
                </td>
                <td class="analysis-content-area-bottom-list-area-content aggression_avg">
                    ${item.aggression_avg == null ? '-' : item.aggression_avg}
                </td>
                <td class="analysis-content-area-bottom-list-area-content call_priority_avg">
                    ${item.call_priority_avg == null ? '-' : item.call_priority_avg}
                </td>
                <td class="analysis-content-area-bottom-list-area-content atmosphere_avg">
                    ${item.atmosphere_avg == null ? '-' : item.atmosphere_avg}
                </td>
                <td class="analysis-content-area-bottom-list-area-content upset_avg">
                    ${item.upset_avg == null ? '-' : item.upset_avg}
                </td>
                <td class="analysis-content-area-bottom-list-area-content content_avg">
                    ${item.content_avg == null ? '-' : item.content_avg}
                </td>
                <td class="analysis-content-area-bottom-list-area-content dissatisfaction_avg">
                    ${item.dissatisfaction_avg == null ? '-' : item.dissatisfaction_avg}
                </td>
                <td class="analysis-content-area-bottom-list-area-content extreame_emotion_avg">
                    ${item.extreame_emotion_avg == null ? '-' : item.extreame_emotion_avg}
                </td>
            </tr>`;
    });
    return records.join('')
}
