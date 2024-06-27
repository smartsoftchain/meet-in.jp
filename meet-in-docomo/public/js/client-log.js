$(function(){
    // window読み込み時に、roomを取得しURLの方にを生成しfor文で表示する
    $.ajax({
        url: "/setting-log/get-active-room",
        type: "POST",
        dataType: 'json',
        data: {
            "select_page": 1
        },
        beforeSend: function() {
            // tableを隠してローディングを表示する
            $('.page_area_wrapper-top').css("visibility","hidden");
            $('.loading_1').removeClass('hide');
            $('.room_table').addClass('hide');
        }
    }).done(function(res) {
        const logDataLength = res["logLength"];
        const limit = 5;
        const elemLength = Math.ceil(logDataLength / limit);
        
        const pageArea = document.getElementById('page_area-top');
        if(logDataLength >= 5){
            $(".page_area_wrapper").css("visibility","visible");
            for (let i = 1; i <= elemLength; i++) {
                if (i > 5){
                    break;
                }
                const pageElem = document.createElement('div');
                $(pageElem).appendTo(pageArea);
                if(i == 1){
                    pageElem.setAttribute('class','page_number-top select');
                }else{
                    pageElem.setAttribute('class','page_number-top');
                }
                pageElem.setAttribute('id','page' + i);
                pageElem.innerHTML = '<a href="#" id="select_page_num-top">'+i+'</a>';
            }
        }else{
            $(".page_area_wrapper").css("visibility","hidden");
            $("#page_area").empty();
        }
        const pagerAreaWidth = -10*elemLength;
        $('#icon-menu-left-top').css('margin-left', pagerAreaWidth+'px');
        let url = "https://"+ location.hostname +"/room/"
        // ローディングを隠してtableを表示する
        if(logDataLength>5){
            $('.page_area_wrapper-top').css("visibility","visible");
        }
        $('.room_table').removeClass('hide');
        $('.loading_1').addClass('hide');
        $.each(res["data"], function(i){
            let room_name = res["data"][i]
            $(".room_body").append("<tr><td class='room_td'>" + room_name + "</td><td class='room_td'><a class='room_name' id='" + room_name + "'>" + url + room_name + "</a></td><</tr>");
        });

         // モーダルキャンセルボタン
        const link = document.getElementsByClassName('room_name');
        $(link).click(function(){
            var room = this.getAttribute("id"); // input要素のid属性の値を取得

            $("#modal-content").show();

            $(".modal-content").on('click','.modal-close',function(){
                $("#modal-content").hide();
            });

            $(".connect-button").on('click',function(){
                var radio_select = $('input:radio[id="connect_mode"]:checked').val();
                $("#modal-content").hide();
                if(radio_select === '1') {
                    window.open('https://'+ location.hostname +'/room/' + room + '/','_blank'); // 新しいタブを開き、ページを表示
                } else {
                    window.open('https://'+ location.hostname +'/room/' + room + '?room_mode=2' , '_blank'); // 新しいタブを開き、ページを表示
                }
                $(".connect-button").off()
            });
        });
    }).fail(function(res) {
        console.log(res);
    });

    // モーダルキャンセルボタン
    $(".modal-content").on('click','.modal-close',function(){
			$("#modal-content").hide();
    });
    
    const startDate = $('#start_period_date').val();
    const endDate = $('#end_period_date').val();
    const listType = $('#list_type').val();
    const changeElems = document.getElementsByClassName("usage_total_table");
    // 開始日、終了日が入力されていたらデータを入れ替える
    $(changeElems).empty();

    // ユーザー検索欄の初回表示用
    $.ajax({
        type: "GET",
        url: "/setting-log/account-name-search",
        data: {keyword : ''},
    }).done(function(res) {
        const obj = JSON.parse(res);
        // 帰ってきた値の数だけ要素を生成
        const nameLength = Object.keys(obj).length;
        // 検索フォーム内のvalueを操作
        if(nameLength === 0){
            $('#search_form').val('');
        }else{
            var slectValue = obj[0]["staff_name"] +" / "+ obj[0]["staff_type"]+obj[0]["staff_id"];
            if(slectValue.length >= 11){
                slectValue = slectValue.substr(0,9)+"...";
            }
            $('#search_form').val(slectValue+"  他"+nameLength+"件");
        }
    }).fail(function() {
        console.log('fail');
    });

    // 初回読み込み時、利用状況集計データ表示
    $.ajax({
        url: "/setting-log/client-log-detail",
        type: "POST",
        dataType: 'json',
        data: {
            "start_period_date": startDate,
            "end_period_date": endDate,
            "list_type": listType,
        },
        beforeSend: function() {
            $('.loading_2').removeClass('hide')
            $('.first_time_aggregate').addClass('hide')
            $('.use_count_wrap').addClass('hide')
            document.getElementById("data_send").setAttribute("disabled", true);
        }
    }).done(function(res) {
        $('.loading_2').addClass('hide')
        $('.first_time_aggregate').removeClass('hide')
        $('.use_count_wrap').removeClass('hide')
        // 使用回数、使用時間を書き換える
        $(".room_use_count_number").text(res["roomUseCount"]);
        $(".room_use_time_number").text(res["roomUseAmountTime"]);

        const logDataLength = res["roomUseCount"];
        const limit = 20;
        const elemLength = Math.ceil(logDataLength / limit);
        const pageArea = document.getElementById('page_area');
        if(logDataLength > 20) {
            $(".page_area_wrapper").css("visibility","visible");
            for (let i = 1; i <= elemLength; i++) {
                if (i > 5){
                    break;
                }
                const pageElem = document.createElement('div');
                $(pageElem).appendTo(pageArea);
                if(i == 1){
                    pageElem.setAttribute('class','page_number select');
                }else{
                    pageElem.setAttribute('class','page_number');
                }
                pageElem.setAttribute('id','page' + i);
                pageElem.innerHTML = '<a href="#" id="select_page_num">'+i+'</a>';
            }
        }else{
            $(".page_area_wrapper").css("visibility","hidden");
            $("#page_area").empty();
        }
        // 利用状況集計を書き換える
        for(let i =0; i<res["lists"].length; i++){
            $(".usage_total_table").append("<tr class='usage_total_tr_"+i+"'></tr>");
            for(let num=0; num<res["lists"][i].length; num++){
                if (i == 0){
                    $(".usage_total_tr_" + i + "").append("<th class='usage_total_th'>" + res["lists"][i][num]+ "</th>");
                } else {
                    $(".usage_total_tr_" + i + "").append("<td class='usage_total_td'>" + res["lists"][i][num]+ "</td>");
                }
            }
        }
        document.getElementById("data_send").removeAttribute("disabled");
    }).fail(function(res) {
        console.log("fail");
    });

    // 上部ページネーションのナンバーを選択した場合
    $(document).on("click", "#select_page_num-top", function (event) {
        // 画面の遷移を停止
        event.preventDefault();
        const selectNum = this.innerText;
        $.ajax({
        url: "/setting-log/get-active-room",
        type: "POST",
        dataType: 'json',
        data: {
            "select_page": selectNum
        },
        beforeSend: function() {
            // tableを隠してローディングを表示する
            $('.loading_1').removeClass('hide');
            $('.room_table').addClass('hide');
            $('.page_area_wrapper-top').css("visibility","hidden");
        }
        }).done(function(res) {
            $(".room_td").remove();
            const logDataLength = res["logLength"];
            const limit = 5;
            const elemLength = Math.ceil(logDataLength / limit);
            var remainlogDataNum = logDataLength - (5*selectNum);

            // ページャの開始位置
            if(selectNum >= 4){
                var startPager = selectNum - 2;
                // 選択された番号以降ないパターン
                if(remainlogDataNum < 0){
                    var startPager = selectNum - 4;
                }else if(remainlogDataNum <= 5){
                // 選択された番号+1しかないパターン
                    var startPager = selectNum - 3;
                }
            }else{
                var startPager = 1;
            }

            const pageArea = document.getElementById('page_area-top');
            if(logDataLength >= 5){
                $("#page_area-top").empty();
                $(".page_area_wrapper").css("visibility","visible");
                if(elemLength >= 6){
                    for (let i = startPager; i < startPager+5; i++) {
                        const pageElem = document.createElement('div');
                        $(pageElem).appendTo(pageArea);
                        pageElem.setAttribute('class','page_number-top');
                        pageElem.setAttribute('id','page' + i);
                        pageElem.innerHTML = '<a href="#" id="select_page_num-top">'+i+'</a>';
                    }
                    var targetSetSelect = document.getElementById('page'+selectNum);
                    targetSetSelect.setAttribute('class', 'page_number-top select');  

                }else{
                    for (let i = 1; i <= elemLength; i++) {
                        const pageElem = document.createElement('div');
                        $(pageElem).appendTo(pageArea);
                        pageElem.setAttribute('class','page_number-top');
                        pageElem.setAttribute('id','page' + i);
                        pageElem.innerHTML = '<a href="#" id="select_page_num-top">'+i+'</a>';
                    }
                    var targetSetSelect = document.getElementById('page'+selectNum);
                    targetSetSelect.setAttribute('class', 'page_number-top select');
                }
            }else{
                $(".page_area_wrapper").css("visibility","hidden");
                $("#page_area-top").empty();
            }

            let url = "https://"+ location.hostname +"/room/"
            // ローディングを隠してtableを表示する
            if(logDataLength>5){
                $('.page_area_wrapper-top').css("visibility","visible");
            }
            $('.room_table').removeClass('hide');
            $('.loading_1').addClass('hide');
            $.each(res["data"], function(i){
                $(".room_body").append("<tr><td class='room_td'>" + res["data"][i] + "</td><td class='room_td'><a href='javascript:OnLinkClick();'' style='color: #0076FF'>" + url + res["data"][i] + "</a></td><</tr>");
            });
        }).fail(function(res) {
            console.log("fail");
        });
    })

    // ＜を選択
    $(document).on("click", "#icon-menu-left-top", function (event) {
        // 画面の遷移を停止
        event.preventDefault();
        var currentNum = document.getElementsByClassName('page_number-top select')[0].innerText;
        if(currentNum == 1){
            currentNum = 2;
        }
        const beforeNum = parseInt(currentNum)-1;
        $.ajax({
            url: "/setting-log/get-active-room",
            type: "POST",
            dataType: 'json',
            data: {
                "select_page": beforeNum
            },
            beforeSend: function() {
                // tableを隠してローディングを表示する
                $('.page_area_wrapper-top').css("visibility","hidden");
                $('.loading_1').removeClass('hide')
                $('.room_table').addClass('hide')
            }
        }).done(function(res) {
            const deleteClassElem = document.getElementsByClassName('page_number-top select');
            $(".room_td").remove()
            deleteClassElem[0].setAttribute('class', 'page_number-top');
            const elem = $('a:contains('+beforeNum+')').parent();

            if(elem[0]){
                elem[0].setAttribute('class', 'page_number-top select');
            }else{
                $("#page_area-top").empty();
                const pageArea = document.getElementById('page_area-top');
                if(currentNum <= 2){
                    for (let i = 1 ; i <= parseInt(currentNum)+3; i++) {
                        const pageElem = document.createElement('div');
                        $(pageElem).appendTo(pageArea);
                        pageElem.setAttribute('class','page_number-top');
                        pageElem.setAttribute('id','page' + i);
                        pageElem.innerHTML = '<a href="#" id="select_page_num-top">'+i+'</a>';
                    }
                    var targetSetSelect = document.getElementById('page'+currentNum);
                    targetSetSelect.setAttribute('class', 'page_number-top select');

                }else{
                    for (let i = parseInt(currentNum) -2 ; i <= parseInt(currentNum)+2; i++) {
                        const pageElem = document.createElement('div');
                        $(pageElem).appendTo(pageArea);
                        pageElem.setAttribute('class','page_number-top');
                        pageElem.setAttribute('id','page' + i);
                        pageElem.innerHTML = '<a href="#" id="select_page_num-top">'+i+'</a>';
                    }
                    var targetSetSelect = document.getElementById('page'+currentNum);
                    targetSetSelect.setAttribute('class', 'page_number-top select');
                }
            }
            let url = "https://"+ location.hostname +"/room/"
            // ローディングを隠してtableを表示する
            const logDataLength = document.getElementsByClassName('page_number-top');
            if(logDataLength.length>1){
                $('.page_area_wrapper-top').css("visibility","visible");
            }
            $('.room_table').removeClass('hide')
            $('.loading_1').addClass('hide');
            $.each(res["data"], function(i){
                $(".room_body").append("<tr><td class='room_td'>" + res["data"][i] + "</td><td class='room_td'><a href='javascript:OnLinkClick();'' style='color: #0076FF'>" + url + res["data"][i] + "</a></td><</tr>");
            });
        }).fail(function(res) {
            console.log("fail")
        });
    })

     // ＞を選択
    $(document).on("click", "#icon-menu-right-top", function (event) {
        // 画面の遷移を停止
        event.preventDefault();
        var selectNum = document.getElementsByClassName('page_number-top select')[0].innerText;
        $.ajax({
            url: "/setting-log/get-active-room",
            type: "POST",
            dataType: 'json',
            data: {
                "select_page": selectNum
            },
            beforeSend: function() {
                // tableを隠してローディングを表示する
                $('.page_area_wrapper-top').css("visibility","hidden");
                $('.loading_1').removeClass('hide');
                $('.room_table').addClass('hide');
            }
        }).done(function(res) {
            const logDataLength = res["logLength"];
            var remainlogDataNum = logDataLength - (5*selectNum);
            var nextNum = parseInt(selectNum)+1;

            // 一番最後のページャならcurrentNumの書き換え
            if(remainlogDataNum <= 0){
                nextNum = selectNum;
            }

            $.ajax({
                url: "/setting-log/get-active-room",
                type: "POST",
                dataType: 'json',
                data: {
                    "select_page": nextNum
                },
            }).done(function(response) {
                $(".room_td").remove();
                var deleteClassElem = document.getElementsByClassName('page_number-top select');
                deleteClassElem[0].setAttribute('class', 'page_number-top');
                const elem = $('a:contains('+nextNum+')').parent();
                var targetSetSelect = document.getElementById('page'+nextNum);

                if(targetSetSelect){
                    if(elem[0].setAttribute('class', 'page_number-top select')){
                        elem[0].setAttribute('class', 'page_number-top select');
                    }else{
                        var deleteClassElem = document.getElementsByClassName('page_number-top select');
                        if(deleteClassElem[1]){
                            deleteClassElem[0].setAttribute('class', 'page_number-top');
                        }else{
                            deleteClassElem[0].removeAttribute('class', 'page_number-top');
                        }
                        targetSetSelect.setAttribute('class', 'page_number-top select');
                    }
                }else{
                    $("#page_area-top").empty();
                    const pageArea = document.getElementById('page_area-top');
                    if(nextNum > 4){
                        for (let i = nextNum-4 ; i <= nextNum; i++) {
                            const pageElem = document.createElement('div');
                            $(pageElem).appendTo(pageArea);
                            if(i == nextNum){
                                pageElem.setAttribute('class','page_number-top select');
                            }else{
                                pageElem.setAttribute('class','page_number-top');
                            }
                            pageElem.setAttribute('id','page' + i);
                            pageElem.innerHTML = '<a href="#" id="select_page_num-top">'+i+'</a>';
                        }
                    }else{
                        for (let i = 1 ; i < selectNum; i++) {
                            const pageElem = document.createElement('div');
                            $(pageElem).appendTo(pageArea);
                            if(i == nextNum){
                                pageElem.setAttribute('class','page_number-top select');
                            }else{
                                pageElem.setAttribute('class','page_number-top');
                            }
                            pageElem.setAttribute('id','page' + i);
                            pageElem.innerHTML = '<a href="#" id="select_page_num-top">'+i+'</a>';
                        }
                    }
                }
                // ローディングを隠してtableを表示する
                $('.room_table').removeClass('hide')
                $('.loading_1').addClass('hide');
                if(logDataLength>5){
                    $('.page_area_wrapper-top').css("visibility","visible");
                }
                let url = "https://"+ location.hostname +"/room/"
                $.each(response["data"], function(i){
                    $(".room_body").append("<tr><td class='room_td'>" + response["data"][i] + "</td><td class='room_td'><a href='javascript:OnLinkClick();'' style='color: #0076FF'>" + url +response["data"][i] + "</a></td><</tr>");
                });

            }).fail(function(res) {
                console.log('fail');
            });

        }).fail(function(res) {
            console.log("fail")
        });
    })

    // モーダルキャンセルボタン
    $(".modal-content").on('click','.modal-close',function(){
			$("#modal-content").hide();
    });

    // 何かしらを選択した際の処理
    $('.data_send').click(function(){
        $('#select_account_modal').css("visibility","hidden");
        // 選択されたユーザーデータを取得
        const select_user_data = document.getElementsByName("account_name");
        const select_user_data_arr = [];
        for (let i = 0; i < select_user_data.length; i++){
            if(select_user_data[i].checked){
                if(select_user_data[i].value != "on"){
                    select_user_data_arr.push(select_user_data[i].value);
                }
            }
        }
        const startDate = $('#start_period_date').val();
        const endDate = $('#end_period_date').val();
        const listType = $('#list_type').val();
        const changeElems = document.getElementsByClassName("usage_total_table");
        // 開始日、終了日が入力されていたらデータを入れ替える
        $(changeElems).empty();
        $.ajax({
            url: "/setting-log/client-log-detail",
            type: "POST",
            dataType: 'json',
            data: {
                "start_period_date": startDate,
                "end_period_date": endDate,
                "list_type": listType,
                "select_user_data": select_user_data_arr,
            },
            beforeSend: function() {
                $('.loading_2').removeClass('hide')
                $('.first_time_aggregate').addClass('hide')
                $('.use_count_wrap').addClass('hide')
                document.getElementById("data_send").setAttribute("disabled", true);
            }
        }).done(function(res) {
            $('.loading_2').addClass('hide')
            $('.first_time_aggregate').removeClass('hide')
            $('.use_count_wrap').removeClass('hide')
            // 使用回数、使用時間を書き換える
            $(".room_use_count_number").text(res["roomUseCount"]);
            $(".room_use_time_number").text(res["roomUseAmountTime"]);
            let logDataLength = res["pagerLists"].length;
            $("#page_area").empty();
            if(logDataLength > 20){
                $(".page_area_wrapper").css("visibility","visible");
                const limit = 20;
                const elemLength = Math.ceil(logDataLength / limit);
                const pageArea = document.getElementById('page_area');
                for (let i = 1; i <= elemLength; i++) {
                    if (i > 5){
                        break;
                    }
                    const pageElem = document.createElement('div');
                    $(pageElem).appendTo(pageArea);
                    if(i == 1){
                        pageElem.setAttribute('class','page_number select');
                    }else{
                        pageElem.setAttribute('class','page_number');
                    }
                    pageElem.setAttribute('id','page' + i);
                    pageElem.innerHTML = '<a href="#" id="select_page_num">'+i+'</a>';
                }
            }else{
                $(".page_area_wrapper").css("visibility","hidden");
                $("#page_area").empty();
            }

            // 利用状況集計を書き換える
            for(let i =0; i<res["lists"].length; i++){
                $(".usage_total_table").append("<tr class='usage_total_tr_"+i+"'></tr>");
                for(let num=0; num<res["lists"][i].length; num++){
                    if (i == 0){
                        $(".usage_total_tr_" + i + "").append("<th class='usage_total_th'>" + res["lists"][i][num]+ "</th>");
                    } else {
                        $(".usage_total_tr_" + i + "").append("<td class='usage_total_td'>" + res["lists"][i][num]+ "</td>");
                    }
                }
            }
            document.getElementById("data_send").removeAttribute("disabled");
        }).fail(function(res) {
            console.log("fail");
        });
    })

    // セレクトボックスを選択時にデータを送る
    $('.list_type').on('change',function(){
        $('#select_account_modal').css("visibility","hidden");
        // 選択されたユーザーデータを取得
        const select_user_data = document.getElementsByName("account_name");
        const select_user_data_arr = [];
        for (let i = 0; i < select_user_data.length; i++){
            if(select_user_data[i].checked){
                if(select_user_data[i].value != "on"){
                    select_user_data_arr.push(select_user_data[i].value);
                }
            }
        }
        const startDate = $('#start_period_date').val();
        const endDate = $('#end_period_date').val();
        const listType = $('#list_type').val();
        const changeElems = document.getElementsByClassName("usage_total_table");
        // 開始日、終了日が入力されていたらデータを入れ替える
        $(changeElems).empty();
        $.ajax({
            url: "/setting-log/client-log-detail",
            type: "POST",
            dataType: 'json',
            data: {
                "start_period_date": startDate,
                "end_period_date": endDate,
                "list_type": listType,
                "select_user_data": select_user_data_arr,
            },
            beforeSend: function() {
                $('.loading_2').removeClass('hide')
                $('.first_time_aggregate').addClass('hide')
                $('.use_count_wrap').addClass('hide')
            }
        }).done(function(res) {
            $('.loading_2').addClass('hide')
            $('.first_time_aggregate').removeClass('hide')
            $('.use_count_wrap').removeClass('hide')
            // 使用回数、使用時間を書き換える
            $(".room_use_count_number").text(res["roomUseCount"]);
            $(".room_use_time_number").text(res["roomUseAmountTime"]);
            let logDataLength = res["pagerLists"].length;
            $("#page_area").empty();
            if(logDataLength > 20){
                $(".page_area_wrapper").css("visibility","visible");
                const limit = 20;
                const elemLength = Math.ceil(logDataLength / limit);
                const pageArea = document.getElementById('page_area');
                for (let i = 1; i <= elemLength; i++) {
                    if (i > 5){
                        break;
                    }
                    const pageElem = document.createElement('div');
                    $(pageElem).appendTo(pageArea);
                    if(i == 1){
                        pageElem.setAttribute('class','page_number select');
                    }else{
                        pageElem.setAttribute('class','page_number');
                    }
                    pageElem.setAttribute('id','page' + i);
                    pageElem.innerHTML = '<a href="#" id="select_page_num">'+i+'</a>';
                }
            }else{
                $(".page_area_wrapper").css("visibility","hidden");
                $("#page_area").empty();
            }

            // 利用状況集計を書き換える
            for(let i =0; i<res["lists"].length; i++){
                $(".usage_total_table").append("<tr class='usage_total_tr_"+i+"'></tr>");
                for(let num=0; num<res["lists"][i].length; num++){
                    if (i == 0){
                        $(".usage_total_tr_" + i + "").append("<th class='usage_total_th'>" + res["lists"][i][num]+ "</th>");
                    } else {
                        $(".usage_total_tr_" + i + "").append("<td class='usage_total_td'>" + res["lists"][i][num]+ "</td>");
                    }
                }
            }
        }).fail(function(res) {
            console.log("fail");
        });
    })

    // 下部ページネーションのナンバーを選択した場合
    $(document).on("click", "#select_page_num", function (event) {
        // 画面の遷移を停止
        event.preventDefault();
        // 選択されたユーザーデータを取得
        const select_user_data = document.getElementsByName("account_name");
        const select_user_data_arr = [];
        for (let i = 0; i < select_user_data.length; i++){
            if(select_user_data[i].checked){
                if(select_user_data[i].value != "on"){
                    select_user_data_arr.push(select_user_data[i].value);
                }
            }
        }
        const selectNum = this.innerText;
        const startDate = $('#start_period_date').val();
        const endDate = $('#end_period_date').val();
        const listType = $('#list_type').val();
        const changeElems = document.getElementsByClassName("usage_total_table");
        // 開始日、終了日が入力されていたらデータを入れ替える
        $(changeElems).empty();
        $.ajax({
            url: "/setting-log/client-log-detail",
            type: "POST",
            dataType: 'json',
            data: {
                "start_period_date": startDate,
                "end_period_date": endDate,
                "list_type": listType,
                "select_page": selectNum,
                "select_user_data": select_user_data_arr,
            },
            beforeSend: function() {
                $('.loading_2').removeClass('hide')
                $('.first_time_aggregate').addClass('hide')
                $('.use_count_wrap').addClass('hide')
            }
        }).done(function(res) {
            $('.loading_2').addClass('hide');
            $('.first_time_aggregate').removeClass('hide');
            $('.use_count_wrap').removeClass('hide');
            // 使用回数、使用時間を書き換える
            $(".room_use_count_number").text(res["roomUseCount"]);
            $(".room_use_time_number").text(res["roomUseAmountTime"]);

            $("#page_area").empty();
            const logDataLength = res["pagerLists"].length;
            const limit = 20;
            const elemLength = Math.ceil(logDataLength / limit);
            var remainlogDataNum = logDataLength - (20*selectNum);

            // ページャの開始位置
            if(selectNum >= 4){
                var startPager = selectNum - 2;
                // 選択された番号以降ないパターン
                if(remainlogDataNum < 0){
                    var startPager = selectNum - 4;
                }else if(remainlogDataNum <= 20){
                    // 選択された番号+1しかないパターン
                    var startPager = selectNum - 3;
                }
            }else{
                var startPager = 1;
            }

            const pageArea = document.getElementById('page_area');
            if(logDataLength > 20) {
                $(".page_area_wrapper").css("visibility","visible");
                if(elemLength >= 6){
                    $("#page_area").empty();
                    for (let i = startPager; i < startPager+5; i++) {
                        const pageElem = document.createElement('div');
                        $(pageElem).appendTo(pageArea);
                        pageElem.setAttribute('class','page_number');
                        pageElem.setAttribute('id','page' + i);
                        pageElem.innerHTML = '<a href="#" id="select_page_num">'+i+'</a>';
                    }
                    var elem = document.getElementById('page'+selectNum);
                    elem.setAttribute('class', 'page_number select');  

                }else{
                    for (let i = 1; i <= elemLength; i++) {
                        const pageElem = document.createElement('div');
                        $(pageElem).appendTo(pageArea);
                        if(i == 1){
                            pageElem.setAttribute('class','page_number select');
                        }else{
                            pageElem.setAttribute('class','page_number');
                        }
                        pageElem.setAttribute('id','page' + i);
                        pageElem.innerHTML = '<a href="#" id="select_page_num">'+i+'</a>';
                    }
                    const deleteClassElem = document.getElementsByClassName('page_number select');
                    deleteClassElem[0].setAttribute('class', 'page_number');
                    var elem = $('a:contains('+selectNum+')').parent('.page_number');
                    elem[0].setAttribute('class', 'page_number select');
                }
            }else{
                $(".page_area_wrapper").css("visibility","hidden");
                $("#page_area").empty();
            }

            // 利用状況集計を書き換える
            for(let i =0; i<res["lists"].length; i++){
                $(".usage_total_table").append("<tr class='usage_total_tr_"+i+"'></tr>");
                for(let num=0; num<res["lists"][i].length; num++){
                    if (i == 0){
                        $(".usage_total_tr_" + i + "").append("<th class='usage_total_th'>" + res["lists"][i][num]+ "</th>");
                    } else {
                        $(".usage_total_tr_" + i + "").append("<td class='usage_total_td'>" + res["lists"][i][num]+ "</td>");
                    }
                }
            }
        }).fail(function(res) {
            console.log("fail");
        });
    })

    // ＜を選択
    $(document).on("click", "#icon-menu-left", function (event) {
        // 画面の遷移を停止
        event.preventDefault();
        var currentNum = document.getElementsByClassName('page_number select')[0].innerText;
        if(currentNum == 1){
            currentNum = 2;
        }
        const beforeNum = parseInt(currentNum)-1;
        const startDate = $('#start_period_date').val();
        const endDate = $('#end_period_date').val();
        const listType = $('#list_type').val();
        const changeElems = document.getElementsByClassName("usage_total_table");
        // 開始日、終了日が入力されていたらデータを入れ替える
        $(changeElems).empty();
        $.ajax({
            url: "/setting-log/client-log-detail",
            type: "POST",
            dataType: 'json',
            data: {
                "start_period_date": startDate,
                "end_period_date": endDate,
                "list_type": listType,
                "select_page": beforeNum,
            },
            beforeSend: function() {
                $('.loading_2').removeClass('hide')
                $('.first_time_aggregate').addClass('hide')
                $('.use_count_wrap').addClass('hide')
            }
        }).done(function(res) {
            const deleteClassElem = document.getElementsByClassName('page_number select');
            deleteClassElem[0].setAttribute('class', 'page_number');
            const elem = $('a:contains('+beforeNum+')').parent('.page_number');

            if(elem[0]){
                elem[0].setAttribute('class', 'page_number select');
            }else{
                $("#page_area").empty();
                const pageArea = document.getElementById('page_area');
                if(currentNum <= 2){
                    for (let i = 1 ; i <= parseInt(currentNum)+3; i++) {
                        const pageElem = document.createElement('div');
                        $(pageElem).appendTo(pageArea);
                    
                        if(i == currentNum){
                            pageElem.setAttribute('class','page_number select');
                        }else{
                            pageElem.setAttribute('class','page_number');
                        }
                        pageElem.setAttribute('id','page' + i);
                        pageElem.innerHTML = '<a href="#" id="select_page_num">'+i+'</a>';
                    }
                }else{
                    for (let i = parseInt(currentNum) -2 ; i <= parseInt(currentNum)+2; i++) {
                        const pageElem = document.createElement('div');
                        $(pageElem).appendTo(pageArea);
                    
                        if(i == currentNum){
                            pageElem.setAttribute('class','page_number select');
                        }else{
                            pageElem.setAttribute('class','page_number');
                        }
                        pageElem.setAttribute('id','page' + i);
                        pageElem.innerHTML = '<a href="#" id="select_page_num">'+i+'</a>';
                    }    
                }
            }

            $('.loading_2').addClass('hide');
            $('.first_time_aggregate').removeClass('hide');
            $('.use_count_wrap').removeClass('hide');
            // 使用回数、使用時間を書き換える
            $(".room_use_count_number").text(res["roomUseCount"]);
            $(".room_use_time_number").text(res["roomUseAmountTime"]);

            // 利用状況集計を書き換える
            for(let i =0; i<res["lists"].length; i++){
                $(".usage_total_table").append("<tr class='usage_total_tr_"+i+"'></tr>");
                for(let num=0; num<res["lists"][i].length; num++){
                    if (i == 0){
                        $(".usage_total_tr_" + i + "").append("<th class='usage_total_th'>" + res["lists"][i][num]+ "</th>");
                    } else {
                        $(".usage_total_tr_" + i + "").append("<td class='usage_total_td'>" + res["lists"][i][num]+ "</td>");
                    }
                }
            }
        }).fail(function(res) {
            console.log("fail")
        });
    })

    // ＞を選択
    $(document).on("click", "#icon-menu-right", function (event) {
        // 画面の遷移を停止
        event.preventDefault();
        var currentNum = document.getElementsByClassName('page_number select')[0].innerText;
        const startDate = $('#start_period_date').val();
        const endDate = $('#end_period_date').val();
        const listType = $('#list_type').val();
        $.ajax({
            url: "/setting-log/client-log-detail",
            type: "POST",
            dataType: 'json',
            data: {
                "start_period_date": startDate,
                "end_period_date": endDate,
                "list_type": listType,
            },
            beforeSend: function() {
                $('.loading_2').removeClass('hide')
                $('.first_time_aggregate').addClass('hide')
                $('.use_count_wrap').addClass('hide')
            }
        }).done(function(res) {
            const logDataLength = res["pagerLists"].length;
            const remainlogDataNum = logDataLength - (20*currentNum);
            var nextNum = parseInt(currentNum)+1;

            // 一番最後のページャならcurrentNumの書き換え
            if(remainlogDataNum <= 0){
                nextNum = currentNum;
            }
            $.ajax({
                url: "/setting-log/client-log-detail",
                type: "POST",
                dataType: 'json',
                data: {
                    "start_period_date": startDate,
                    "end_period_date": endDate,
                    "list_type": listType,
                    "select_page": nextNum,
                },
            }).done(function(response) {
                const deleteClassElem = document.getElementsByClassName('page_number select');
                deleteClassElem[0].setAttribute('class', 'page_number');
                const elem = $('a:contains('+nextNum+')').parent('.page_number');

                if(elem[0]){
                    elem[0].setAttribute('class', 'page_number select');
                }else{
                    $("#page_area").empty();
                    const pageArea = document.getElementById('page_area');
                    if(nextNum > 4){
                        for (let i = nextNum-4; i <= nextNum; i++) {
                            const pageElem = document.createElement('div');
                            $(pageElem).appendTo(pageArea);

                            if(i == nextNum){
                                pageElem.setAttribute('class','page_number select');
                            }else{
                                pageElem.setAttribute('class','page_number');
                            }
                            pageElem.setAttribute('id','page' + i);
                            pageElem.innerHTML = '<a href="#" id="select_page_num">'+i+'</a>';
                        }
                    }else{
                        for (let i = 1; i <= currentNum; i++) {
                            const pageElem = document.createElement('div');
                            $(pageElem).appendTo(pageArea);

                            if(i == currentNum){
                                pageElem.setAttribute('class','page_number select');
                            }else{
                                pageElem.setAttribute('class','page_number');
                            }
                            pageElem.setAttribute('id','page' + i);
                            pageElem.innerHTML = '<a href="#" id="select_page_num">'+i+'</a>';
                        }
                    }
                }

                // loading処理
                $('.loading_2').addClass('hide')
                $('.first_time_aggregate').removeClass('hide')
                $('.use_count_wrap').removeClass('hide')
                // 使用回数、使用時間を書き換える
                $(".room_use_count_number").text(response["roomUseCount"]);
                $(".room_use_time_number").text(response["roomUseAmountTime"]);

                const changeElems = document.getElementsByClassName("usage_total_table");
                $(changeElems).empty();
    
                // 利用状況集計を書き換える
                for(let i =0; i<response["lists"].length; i++){
                    $(".usage_total_table").append("<tr class='usage_total_tr_"+i+"'></tr>");
                    for(let num=0; num<response["lists"][i].length; num++){
                        if (i == 0){
                            $(".usage_total_tr_" + i + "").append("<th class='usage_total_th'>" + response["lists"][i][num]+ "</th>");
                        } else {
                            $(".usage_total_tr_" + i + "").append("<td class='usage_total_td'>" + response["lists"][i][num]+ "</td>");
                        }
                    }
                }
            }).fail(function(response) {
                console.log("fail");
            });

        }).fail(function(res) {
        })
    })

    // 検索条件のリセット
    $('.condition_crear').click(function() {
        $.ajax({
            type: "GET",
            url: "/setting-log/account-name-search",
            data: {keyword : ''},
        }).done(function(res) {
            const obj = JSON.parse(res);
            // 帰ってきた値の数だけ要素を生成
            const nameLength = Object.keys(obj).length;

            $('.select_account_name').remove();
            $('.account_name').remove();

            // 全てをチェック
            $('.account_name_input_all').prop('checked',true);

            // 期間を空にする
            $('#start_period_date').val("");
            $('#end_period_date').val("");

            // 検索フォーム内のvalueを操作
            if(nameLength === 0){
                $('#search_form').val('');
            }else{
                var slectValue = obj[0]["staff_name"] +" / "+ obj[0]["staff_type"]+obj[0]["staff_id"]
                if(slectValue.length >= 11){
                    slectValue = slectValue.substr(0,9)+"...";
                }
                $('#search_form').val(slectValue+"  他"+nameLength+"件");
                for(let i = 0; i < nameLength; i++){
                    $("#select-account-names").append(
                        "<li class='select_account_name search_modal_form'><input type='checkbox' name='account_name' class='account_name_input' value="+"'"+obj[i]["staff_name"]+" / "+ obj[i]["staff_type"]+obj[i]["staff_id"]+"'"+ "checked>" + obj[i]["staff_name"] +' / '+obj[i]["staff_type"]+obj[i]["staff_id"] + "</li>"
                    );
                }
            }
        }).fail(function() {
            console.log('fail');
        });
    })

    var userSearchCondition = true;
    // 検索条件フォーム部分 アローアイコンがクリックされたらモーダル表示
    $('.form_arrow_icon').click(function() {
        $('.select_account_modal_top').off();
        $('.select_account_name').off();

        if($('#select_account_modal').css('visibility') == 'hidden'){
            const modalElem = document.getElementById('account-name-list');
            $('#select_account_modal').css("visibility","visible");
            // モーダルを開いた時、一旦全検索を実行
            $.ajax({
                type: "GET",
                url: "/setting-log/account-name-search",
                data: {},
            }).done(function(res) {
                const obj = JSON.parse(res);
                // 帰ってきた値の数だけ要素を生成
                const nameLength = Object.keys(obj).length;
                // 該当なしの場合を分岐
                if(nameLength === 0){
                    $("#account-name-list").append("<li class='account_name search_modal_form'>" + "該当なし" + "</li>");
                }else{
                    if(userSearchCondition){
                        for(let i = 0; i < nameLength; i++){
                            $("#select-account-names").append(
                                "<li class='select_account_name search_modal_form'><input type='checkbox' name='account_name' class='account_name_input' value=" +"'"+ obj[i]["staff_name"] + ' / ' + obj[i]["staff_type"] + obj[i]["staff_id"] + "'" + "checked>" + obj[i]["staff_name"] +' / '+obj[i]["staff_type"]+obj[i]["staff_id"] + "</li>"
                            );
                        }
                    }
                }
                // 条件クリアされるまではユーザーを更新しない
                userSearchCondition = false;

                // 全ての行クリック時処理
                $('.select_account_modal_top').on('click',function(){
                    moveAllUserRow($(this).children('.account_name_input_all'))
                })

                // 選択中から候補に移動
                $('.select_account_name').on('click',function(){
                    moveUserCandidateRow($(this).children('.account_name_input'));
                })
            }).fail(function() {
                console.log('fail');
            });
        }else{
            $('#select_account_modal').css("visibility","hidden");
        }
    })

    // 全てのユーザーが選択されているかをチェックする
    function checkAllUserSelect(selectElemsLength, accountNameInputLength){
        if(selectElemsLength === accountNameInputLength){
            $('.account_name_input_all').prop('checked', true);
        }else{
            $('.account_name_input_all').prop('checked', false);
        }
    }

    // 行をクリックしてユーザーを選択中から候補に移動
    function moveUserCandidateRow(elem){
        $('.account_name').off();

        // 選択中の中から要素を選択した場合、選択中内から選択した要素を消去し、候補内に戻す
        $("#account-name-list").append("<li class='account_name search_modal_form'><input type='checkbox' name='account_name' class='account_name_input search_modal_form' value="+"'"+elem.val()+"'"+">"+elem.val()+"</li>");
        $('#select-account-names').find($('input[value="' + elem.val() + '"]')).parent().remove()
        const selectElems = document.getElementById('select-account-names');
        const selectElemsLength = $(selectElems).find('.select_account_name').length;
        const remainSelectElems = document.getElementsByClassName('select_account_name')[0];
        var remainSelectValue = $(remainSelectElems).find('.account_name_input').val();
        // 全て選択されているかチェックする
        checkAllUserSelect(selectElemsLength, $('.account_name_input').length);

        // 検索フォーム内のvalueを操作
        if(selectElemsLength === 0){
            $('#search_form').val('');
        }else{
            if(remainSelectValue.length >= 11){
                remainSelectValue = remainSelectValue.substr(0,9)+"...";
            }
            $('#search_form').val(remainSelectValue+"  他"+selectElemsLength+"件");
        }

        // 候補から選択中に移動
        $('.account_name').on('click',function(){
            moveUserSelectRow($(this).children('.account_name_input'));
        })
    }

    // 行をクリックしてユーザーを候補から選択中に移動
    function moveUserSelectRow(elem){
        $('.select_account_name').off();

        // 候補の中から要素を選択した場合、候補内から選択した要素を消去し、選択中へ移動させる
        $("#select-account-names").append("<li class='select_account_name search_modal_form'><input type='checkbox' name='account_name' checked='checked' class='account_name_input search_modal_form' value="+"'"+elem.val()+"'"+">"+elem.val()+"</li>");
        $('#account-name-list').find($('input[value="' + elem.val() + '"]')).parent().remove()
        const selectElems = document.getElementById('select-account-names');
        const selectElemsLength = $(selectElems).find('.select_account_name').length;
        // 全て選択されているかチェックする
        checkAllUserSelect(selectElemsLength, $('.account_name_input').length);

        // 検索フォーム内のvalueを操作
        if(selectElemsLength === 0){
            $('#search_form').val(elem.val());
        }else{
            var slectValue = elem.val();
            if(slectValue.length >= 11){
                slectValue = slectValue.substr(0,9)+"...";
            }
            $('#search_form').val(slectValue+"  他"+selectElemsLength+"件");
        }

        // 選択中から候補に移動
        $('.select_account_name').on('click',function(){
            moveUserCandidateRow($(this).children('.account_name_input'));
        })
    }

    // 検索条件フォーム部分 アローアイコン以外がクリックされたらモーダル非表示
    $(document).on('click touchend', function(event) {
        if (!$(event.target).closest('.search_modal_form').length) {
            $('#select_account_modal').css("visibility","hidden");
        }
    });

    // モーダル内チェック入れ替え処理
    $(document).on("change", ".account_name_input", function () {
        $('.account_name').off();
        $('.select_account_name').off();

        if (this.checked) {
            // 候補の中から要素を選択した場合、候補内から選択した要素を消去し、選択中へ移動させる
            $("#select-account-names").append("<li class='select_account_name search_modal_form'><input type='checkbox' name='account_name' checked='checked' class='account_name_input search_modal_form' value="+"'"+$(this).val()+"'"+">"+$(this).val()+"</li>");
            $('#account-name-list').find($('input[value="' + $(this).val() + '"]')).parent().remove()
            const selectElems = document.getElementById('select-account-names');
            const selectElemsLength = $(selectElems).find('.select_account_name').length;
            // 検索フォーム内のvalueを操作
            if(selectElemsLength === 0){
                $('#search_form').val($(this).val());
            }else{
                var slectValue = $(this).val();
                if(slectValue.length >= 11){
                    slectValue = slectValue.substr(0,9)+"...";
                }
                $('#search_form').val(slectValue+"  他"+selectElemsLength+"件");
            }

             // 選択中から候補に移動
             $('.select_account_name').on('click',function(){
                moveUserCandidateRow($(this).children('.account_name_input'));
            })
        }else{
            // 選択中の中から要素を選択した場合、選択中内から選択した要素を消去し、候補内に戻す
            $("#account-name-list").append("<li class='account_name search_modal_form'><input type='checkbox' name='account_name' class='account_name_input search_modal_form' value="+"'"+$(this).val()+ "'" +">"+$(this).val()+"</li>");
            $('#select-account-names').find($('input[value="' + $(this).val() + '"]')).parent().remove()
            const selectElems = document.getElementById('select-account-names');
            const selectElemsLength = $(selectElems).find('.select_account_name').length;
            const remainSelectElems = document.getElementsByClassName('select_account_name')[0];
            var remainSelectValue = $(remainSelectElems).find('.account_name_input').val();
    
            // 検索フォーム内のvalueを操作
            if(selectElemsLength === 0){
                $('#search_form').val('');
            }else{
                if(remainSelectValue.length >= 11){
                    remainSelectValue = remainSelectValue.substr(0,9)+"...";
                }
                $('#search_form').val(remainSelectValue+"  他"+selectElemsLength+"件");
            }

             // 候補から選択中に移動
            $('.account_name').on('click',function(){
                moveUserSelectRow($(this).children('.account_name_input'));
            })
        }
    });

     // 全ユーザーをチェック
    function allUserChecked(){
        const selectElems = document.getElementById('account-name-list');
        const selectInputTarget = $(selectElems).find('input');
        $(selectInputTarget).click();
        $('.account_name_input_all').prop('checked',true);
    }

    // 全ユーザーのチェックを外す
    function allUserNotChecked(){
        const selectElems = document.getElementById('select-account-names');
        const selectInputTarget = $(selectElems).find('input');
        $(selectInputTarget).click();
        $('#search_form').val('');
        $('.account_name_input_all').prop('checked',false);
    }

    //行をクリック時にモーダル内 全選択チェック
    function moveAllUserRow(elem){
        if(!elem.prop("checked")){
            allUserChecked();
        }else{
            allUserNotChecked();
        }
    }

    // モーダル内 全選択チェック
    $(document).on("change", ".account_name_input_all", function () {
        if(!this.checked){
            allUserChecked();
        }else{
            allUserNotChecked();
        }
    })

    // インクリメンタルサーチ
    const searchElem = document.getElementById('select_name');
    // 入力文字を入れるための配列
    let keyupStack = [];
    searchElem.addEventListener("keyup", function() {
        // 一覧の中身を空にする
        $('#account-name-list').empty()
        // 配列の後ろに追加
        keyupStack.push(1);
        // 連続で検索されても良いように、検索実行後は0.5秒遅らせて実行する
        setTimeout(function () {
            // 配列の中身排出
            keyupStack.pop();
            // 最後にkeyupされてから次の入力がなかった場合
            if (keyupStack.length === 0) {
                $.ajax({
                    type: "GET",
                    url: "/setting-log/account-name-search",
                    data: {keyword : $(this).val()},
                }).done(function(res) {
                    const obj = JSON.parse(res);
                    // 帰ってきた値の数だけ要素を生成
                    const nameLength = Object.keys(obj).length;
                    // 該当なしの場合を分岐
                    if(nameLength === 0){
                        $("#account-name-list").append("<li class='account_name search_modal_form'>" + "該当なし" + "</li>");
                    }else{
                        for(let i = 0; i < nameLength; i++){
                            $("#account-name-list").append(
                                "<li class='account_name search_modal_form'><input type='checkbox' name='account_name' class='account_name_input search_modal_form' value="+ "'" +obj[i]["staff_name"] + ' / ' + obj[i]["staff_type"] + obj[i]["staff_id"] +"'" +">" + obj[i]["staff_name"] + ' / ' + obj[i]["staff_type"] + obj[i]["staff_id"] + "</li>"
                            );
                        }
                    }
                }).fail(function(data) {
                    console.log('fail');
                });
            }
        }.bind(this), 500);
    }) ;
});