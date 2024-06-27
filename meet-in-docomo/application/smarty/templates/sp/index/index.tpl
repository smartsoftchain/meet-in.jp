<!DOCTYPE html>
<html>
<head>
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>dXオンライン営業 | いつでも、どこでも簡単にweb会議</title>
<meta charset="utf-8">
<meta content="dXオンライン営業は、いつでも、どこでも簡単にweb会議ができるビデオチャットツールです。" name="description">
<meta name="author" content="">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="shortcut icon" href="/img/favicon.ico">
<link rel="stylesheet" href="/css/reset.css?{$application_version}">
<link rel="stylesheet" href="/css/sp/login.css?{$application_version}">
<link rel="stylesheet" href="/css/sp/top.css?{$application_version}">
<link rel="stylesheet" href="/css/sp/button.css?{$application_version}">
<!-- web移植 -->
<script src="/js/jquery-1.11.2.min.js?{$application_version}"></script>
<script src="/js/jquery-ui.min.js?{$application_version}"></script>
<script src="/js/common.js?{$application_version}"></script>
<script src="/js/platform.js?{$application_version}"></script>

{literal}

<style>
.login__form--logo {
	width:  230px;
	margin: 0 auto 40px;
}

.login__form--logo-store {
	width:  102px;
	margin: 0 auto 20px;
}

.daccount_login {
	width: 200px;
}

.mi_privacy_link {
	margin-top: 10px;
    display: inline-block;
}

.mi_connect_input_wrap {
    /* bottom: 59px; */
    left: 4px;
    padding: 25px 10px;
    /* background: rgba(254,170,0,0.4); */
    background: #E5F4FF;
    width: 220px!important;
	margin: auto;
}

.mi_connect_input_title {
    font-weight: bold;
    /*font-size: 19px;*/
    /*margin-bottom: 9px;*/
	color: #737373;
    font-size: 18px!important;
    padding: 5px!important;
    margin: 0px!important;
}
.mi_connect_input_text {
    /*margin-bottom: 19px;*/
 /*   font-size: 11px;*/
	color: #737373;
    font-size: 11px!important;
    /* margin-top: 6px; */
    /* padding-top: 0px; */
    padding: 5px!important;
    margin: 0px!important;
    font-weight: bold;
}
.mi_connect_input {
    box-sizing: border-box;
    padding: -1 20px;
    /*width: 279px;*/
  	height: 36px;
  	font-size: 13px;
    /*margin-right: 19px;*/
    vertical-align: top;
	margin: auto;
	width: 90%;
}

#mi_connect_input_button {
    /*width: 153px;*/
    height: 44px;
    border-radius: 99px;
    /*background-color: #FFAA03;*/
    font-size: 19px;
    font-weight: bold;
	width: 90%;
    margin: 17px 0px 0px 0px!important;
    border-radius: 30px!important;

	cursor: pointer;
    outline: none;
    border: none;
    color: #fff;
    background-color: #0081CC;
    text-align: center;
    height: 40px;
    font-size: 16px;
    cursor: pointer;
}
.connect_alert_cover {
	margin: auto;
    padding: 5px!important;
	height: 35px;
    display: table;
}
.connect_alert_top {
    /*background: #8A3400 0% 0% no-repeat padding-box;
    border-radius: 12px;*/
    /*opacity: 0;*/
    /*line-height: 35px;*/
    text-align: center;
    letter-spacing: -1;
    color: red!important;
	font-weight:bold;
	font-size:11px!important;
	display: table-cell;
	vertical-align: middle;
	text-align: center;
}

</style>

<script>
$(function(){

	// URLのパラメータを取得(？で始まるパラメータ部分)
	var urlParam = location.search.substring(1);

	// URLにパラメータが存在する場合
	if(urlParam) {
		// 「&」が含まれている場合は「&」で分割
		var param = urlParam.split('&');

		// パラメータを格納する用の配列を用意
		var paramArray = [];
		// 用意した配列にパラメータを格納
		for (i = 0; i < param.length; i++) {
			var paramItem = param[i].split('=');
			paramArray[paramItem[0]] = paramItem[1];
		}

		// MEMO. 改行したときワーニングのマークの周りに文字が潜り込まないよう 文字とマークで要素を分ける為のpタグ.
		let cssStyle = "display:inline-block; margin-top: 0; width: 230px; position: absolute; top: 50%; left: 14%; transform: translateY(-50%);";

		// パラメータ[error]が1かどうかを判断する
		if (paramArray.error == '1') {
			$("p.connect_alert").html("<p style='" + cssStyle +"'>ルームへ入室可能な人数を超えています。</p>");
			// エラーメッセージの表示
			$("p.connect_alert").show();
		}
		else if (paramArray.error == '2') {
			$("p.connect_alert").html("<p style='" + cssStyle +"'>ルームがロックされています。<br>入室できません。</p>");
			// エラーメッセージの表示
			$("p.connect_alert").show();
		}
		else if (paramArray.error == '3') {
			$("p.connect_alert").html("<p style='" + cssStyle +"'>ルーム名は半角英数字、「 アンダーバー(_) 」「ハイフン(-)」を合わせた8文字以上、32文字以内で入力して下さい。</p>");
			// エラーメッセージの表示
			$("p.connect_alert").show();
		}else if(paramArray.error == '10') {
			// ゲストのみでルーム入室しようとすると、専用ページに遷移させる
			window.location.href = "/index/service-end";
			/*
			$("p.connect_alert").text("オペレーターが入室していません。");
			// エラーメッセージの表示
			$("p.connect_alert").show();
			*/
		}
	}
});


</script>
{/literal}

</head>
<body>

	<div class="content__wrap">
		<div class="login__form--area error">
			<img src="/img/sp/png/meet-in logo plus text.png" class="login__form--logo-store" />
			<img src="/img/logo_dx_docomo.png" class="login__form--logo" />
			<a href="/index/d-account-login" class="login_bar"><img src="/img/daccount_login.png" alt="login" class="daccount_login"/></a>
			<a href="https://biz-dxstore.docomo.ne.jp/products/detail/ca1607f8-250a-11ec-a1a5-0964db1e03b4"  target="_blank" rel="noopener" class="mi_privacy_link">利用規約</a>
			<div style="margin-top: 40px; font-size: 12px; color: #E16A6C; line-height:1.6666">
				<p class="connect_alert" style="display: none;"></p>
			</div>

			<!-- 商談接続画面 start -->
			<div class="mi_half_background mi_admin_login_form_wrap">
				<div id="mi_admin_login_form_innner">
					<!--　新しい入力フォーム -->
					<div class="mi_connect_input_wrap">
						<p class="mi_connect_input_title">接続はこちらから</p>
						<p class="mi_connect_input_text">共有されたルーム名を入力してください</p>
						<div class="connect_alert_cover">
							<p class="connect_alert_top"></p>
						</div>
						<input type="text" id="room_name" placeholder="ルーム名" class="mi_connect_input">
						<button id="mi_connect_input_button">接続</button>
					</div>
				</div>
			</div>
			<!-- 商談接続画面 end -->

		</div>
	</div>

</body>
</html>


{literal}
<script>
window.addEventListener("orientationchange", function() {
    setOrientation();
});
function setOrientation() {
    if (Math.abs(window.orientation) === 90) {
        document.getElementsByTagName('body')[0].classList.add('landscape');
    } else {
        document.getElementsByTagName('body')[0].classList.remove('landscape');
    }
}
setOrientation();

    /**
     * 接続ボタンクリック(ルーム指定用)
     */
    $('#mi_connect_input_button').on('click', function() {
        var room_name = $("#room_name").val();
        connectRoom(room_name);
    });
    $(function(){
        $('#room_name').keypress(function(event){
            if(event.keyCode === 13) {
                var room_name = $('#room_name').val();
                connectRoom(room_name);
            }
        })
    });
    /**
     * 入力されたルーム名でルームに接続
     */
    function connectRoom(room_name) {
        // 空欄or半角英数32文字以外はエラー
        if(room_name.length === 0) {
            $(".connect_alert_top").text("ルーム名は未入力です");
            /*$(".connect_alert_top").show();
            setTimeout(function(){
                $(".connect_alert_top").fadeOut("slow");
                },5000);*/
            return;
        }
        if(!room_name.match(/^[0-9a-zA-Z\-_]{8,32}$/) || !room_name.match(/[-|_]/g)) {
            $(".connect_alert_top").text("ルーム名は半角英数字、「 アンダーバー(_) 」「ハイフン(-)」を合わせた8文字以上、32文字以内で入力して下さい");
            //$(".connect_alert_top").text("ルーム名は半角英数字、「 アンダーバー(_) 」「ハイフン(-)」の32文字迄です");
            /*$(".connect_alert_top").show();
            setTimeout(function(){
                $(".connect_alert_top").fadeOut("slow");
            },5000);*/
            return;
        }
        // 上限チェック
        $.ajax({
            url: '/negotiation/allowed-enter-room',
            type: 'POST',
            dataType: 'json',
            data: {
                'room_name': room_name
            }
        }).done(function(res) {
            var json = $.parseJSON(res);
            var message = '';
            if(json['result'] == 0 || json['result'] == 2) {
                // 同席モードの設定
                var roomMode = "";
                if($("#room_mode").prop('checked')){
                    // モニタリングするにチェックが入っている場合
                    roomMode = "?room_mode=2"
                }
                // 待合室へ入室.
                window.location.assign(location.protocol + "//" + location.host + "/waiting-room/" + room_name + roomMode);
            } else if(json['result'] == 1) {
`               // 人数制限
                message = 'ルーム名(' + room_name + ')は人数制限です';`
            }
            if(message != '') {
                $(".connect_alert_top").text(message);
                $(".connect_alert_top").show();
            }
        }).fail(function() {
            // ロック状態
            $(".connect_alert_top").text("通信エラー");
            $(".connect_alert_top").show();
        });
    }
</script>
{/literal}

