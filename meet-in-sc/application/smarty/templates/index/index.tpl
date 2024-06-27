<!DOCTYPE html>
<html lang="ja">
<head>
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>Sales Crowd | いつでも、どこでも1秒でweb会議</title>
<meta charset="utf-8">
<meta name="description" content="Sales Crowd は、いつでも、どこでも簡単にweb会議ができる、オンラインコミュニケーションプラットフォームです。アプリのインストールは不要、すぐに始められます。">
<meta name="keywords" content="web 会議　webミーティング　オンラインコミュニケーション　インストール不要　簡単">
<meta name="author" content="">
<link rel="shortcut icon" href="/img/favicon.ico">
<link rel="stylesheet" href="/css/fonts.css?{$application_version}">
<!--[if lt IE 8]>
<link rel="stylesheet" href="/css/ie7.css?{$application_version}">
<!--<![endif]-->
<link href="https://fonts.googleapis.com/css?family=Roboto+Slab" rel="stylesheet">
<link rel="stylesheet" href="/css/reset.css?{$application_version}">
<link rel="stylesheet" href="/css/base.css?{$application_version}">
<link rel="stylesheet" href="/css/page.css?{$application_version}">
<link rel="stylesheet" href="/css/design.css?{$application_version}">
<link rel="stylesheet" href="/css/top.css?{$application_version}">
<link rel="stylesheet" href="/css/jquery-ui.css?{$application_version}">
<script src="/js/jquery-1.11.2.min.js?{$application_version}"></script>
<script src="/js/jquery-ui.min.js?{$application_version}"></script>
<script src="/js/common.js?{$application_version}"></script>
<script src="/js/platform.js?{$application_version}"></script>
<script src="https://maps.google.com/maps/api/js?key=AIzaSyCLGauYoFE65XpHa8SIQIE1lDIkwR3Znxk"></script>


{literal}
<script>
//スムーズスクロール部分の記述
$(function(){
   $('a[href^=#]').click(function() {
      var speed = 400; // ミリ秒
      var href= $(this).attr("href");
      var target = $(href == "#" || href == "" ? 'html' : href);
      var position = target.offset().top - 63;
      $('body,html').animate({scrollTop:position}, speed, 'swing');
      return false;
   });
});


//ナビゲーション固定
$(function(){
	var nav_list = $(".mi_js_scroll");
	var nav_t_pos = $('.mi_lpmain_nav_wrap').offset().top;
	var scr_count = $(window).scrollTop();
	if(scr_count > nav_t_pos){
		 $('#mi_lp_top_nav').addClass('mi_lp_top_nav_fixed');
		 $('.mi_nav_active').removeClass('mi_nav_active');
	}else{
		 $('#mi_lp_top_nav').removeClass("mi_lp_top_nav_fixed");
		 $('.mi_js_scroll li:first-child a').addClass('mi_nav_active');
	}
   $(window).scroll(function(){
		 var nav_t_pos = $('.mi_lpmain_nav_wrap').offset().top;
		 var scr_count = $(window).scrollTop();
		 if(scr_count > nav_t_pos){
				$('#mi_lp_top_nav').addClass('mi_lp_top_nav_fixed');
		 }else{
				$('#mi_lp_top_nav').removeClass("mi_lp_top_nav_fixed");
		 }
		  $('.mi_nav_active').removeClass('mi_nav_active');

      var how_to_use_t_pos = $('#mi_how_to_use_section').offset().top - 64;
      var to_use_t_pos = $('#mi_to_use_section').offset().top - 64;
			var chara_t_pos = $('#mi_chara_section').offset().top - 64;
			var vido_t_pos = $('#mi_vido_section').offset().top - 64;
			var case_t_pos = $('#mi_case_section').offset().top - 64;
			var plan_t_pos = $('#mi_plan_section').offset().top - 64;
      var vision_t_pos = $('#mi_vision_section').offset().top - 64;
      var member_t_pos = $('#mi_member_section').offset().top - 64;
			var company_t_pos = $('#mi_company_section').offset().top - 64;
			var topic_t_pos = $('.mi_topic_section').offset().top - 64;

      if(scr_count > member_t_pos && scr_count < topic_t_pos ) {
				$('.mi_js_scroll li:nth-child(8) a').addClass('mi_nav_active');
			}
			if (scr_count > vision_t_pos && scr_count < member_t_pos ) {
				$('.mi_js_scroll li:nth-child(7) a').addClass('mi_nav_active');
			}
			if (scr_count > plan_t_pos && scr_count < vision_t_pos ) {
				$('.mi_js_scroll li:nth-child(6) a').addClass('mi_nav_active');
			}
			if (scr_count > case_t_pos && scr_count < plan_t_pos ) {
				$('.mi_js_scroll li:nth-child(5) a').addClass('mi_nav_active');
			}
			if (scr_count > chara_t_pos && scr_count < case_t_pos ) {
				$('.mi_js_scroll li:nth-child(4) a').addClass('mi_nav_active');
			}
			if (scr_count > to_use_t_pos && scr_count < chara_t_pos ) {
				$('.mi_js_scroll li:nth-child(3) a').addClass('mi_nav_active');
			}
			if (scr_count > how_to_use_t_pos && scr_count < to_use_t_pos ) {
				$('.mi_js_scroll li:nth-child(2) a').addClass('mi_nav_active');
			}
			if (scr_count > 0 && scr_count < how_to_use_t_pos ) {
				$('.mi_js_scroll li:first-child a').addClass('mi_nav_active');
			}
   })
})

//googleマップデザイン変更
function initialize() {
  var latlng = new google.maps.LatLng(35.732205, 139.708327);
  var myOptions = {
    zoom: 17,
    center: latlng,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
		disableDefaultUI: true,
		scrollwheel: false
  };
  var map = new google.maps.Map(document.getElementById('map_canvas'), myOptions);

	var styleOptions = [
	 {
	   "stylers": [
	     { "saturation": -100 }
	   ]
	 }
	];
	var marker = new google.maps.Marker({
            position: latlng,
            map: map
        });
	var styledMapOptions = { name: '株式会社meet in' }
	var meetinType = new google.maps.StyledMapType(styleOptions);
  map.mapTypes.set('meetin', meetinType);
  map.setMapTypeId('meetin');
}

//モーダル
$(function(){
	$('.modal_open').on('click',function(){
		var modaltraget = "." + $(this).attr("id");
    $(modaltraget).fadeIn("first");
	});

  $('.mi_modal_shadow').on('click',function(){
    $(this).parent("div").fadeOut("first");
  });
});

//オーバーレイ
$(function(){
	$('.mi_overlay_memo_open').on('click',function(){
    $("#mi_overlay_memo").fadeIn("first");
	});

	$('.mi_overlay_privacy_open').on('click',function(){
		$("#mi_overlay_privacy").fadeIn("first");
	});

  $( 'form.contactform').submit(function(event){
    event.preventDefault();
    var nameVal = $(".contactform [name=name]").val();
    var companyVal = $(".contactform [name=company]").val();
    var telNumberVal = $(".contactform [name=tel_number]").val();
    var mailVal = $(".contactform [name=mail]").val();
    var domeinVal = $(".contactform [name=domein]").val();
    var contactVal = $(".contactform [name=contact]").val();
    var privacyVal = $(".contactform [name=privacy]").val();
    var useVal = $(".contactform [name=use]").val();

    $(".mi_confirm_name").text(nameVal);
    $(".mi_confirm_company").text(companyVal);
    $(".mi_confirm_tel_number").text(telNumberVal);
    $(".mi_confirm_mail").text(mailVal + "@" + domeinVal);
    $(".mi_confirm_contact").text(contactVal);
    $(".mi_confirm_use").text(useVal);

    $(".mi_confirm_name_input").val(nameVal);
    $(".mi_confirm_company_input").val(companyVal);
    $(".mi_confirm_tel_number_input").val(telNumberVal);
    $(".mi_confirm_mail_input").val(mailVal + "@" + domeinVal);
    $(".mi_confirm_contact_input").val(contactVal);
    $(".mi_confirm_use_input").val(useVal);

		$("#mi_overlay_confirm").fadeIn("first");
    return false;
	});

  $('.mi_overlay_colose_btn').on('click',function(){
    $(this).parents(".mi_overlay").fadeOut("first");
  });
});

//read more
$(function(){

  $('.js_more_toggle').on('click',function(){
    if($(this).hasClass("mi_member_text_close")){
      var textHeight = $(this).parents(".mi_member_detail").find(".mi_member_text").height();
      $(this).parents(".mi_member_detail").find(".mi_member_text_wrap").height(textHeight);
      $(this).removeClass("mi_member_text_close");
      $(this).addClass("mi_member_text_open");
      $(this).text("close");
    } else {
      $(this).parents(".mi_member_detail").find(".mi_member_text_wrap").attr("style","");
      $(this).addClass("mi_member_text_close");
      $(this).removeClass("mi_member_text_open");
      $(this).text("Read more");
    }
  });
});

//番号入力補助
function insertStr(str, index, insert) {
    return str.slice(0, index) + insert + str.slice(index, str.length);
}
$(function(){
  $("#connect_no").keyup(function(e){
    var input, newPosition, newVal, orgLength, orgVal, position, val;

    if ((e.keyCode >= 65 && e.keyCode <= 90) ||( e.keyCode >= 48 && e.keyCode <= 57)) {
      input = $(this).get(0);
      position = input.selectionStart;

      orgVal = $(this).val();
      orgLength = orgVal.length;

      val = orgVal.replace(/-/g, "");
      if(orgLength == 3){
        newVal = insertStr(val, 3, '-');
      }else if(orgLength == 8){
        Val_3 = insertStr(val, 3, '-');
        newVal = insertStr(Val_3, 8, '-');
      }else{
        newVal = orgVal;
      }
      $(this).val(newVal);

      newPosition = position + newVal.length - orgLength;
      input.selectionStart = newPosition;
      input.selectionEnd = newPosition;
    }
  });
});

// 確認モーダル入力チェック
$(function(){
  $("#mi_confirm_send_form").submit(function(){
    // 必須チェック
    var confirmInput = $(".mi_confirm_input_req");
    for (var i=0; i<confirmInput.length; i++) {
			if (confirmInput.eq(i).val()=="") {
        alert('不正な遷移です。お手数ですが、最初から入力をし直してください。');
        return false;
			}
		}

    // 入力されて入れば送信する
    $("#mi_confirm_send_form").submit();
  });
});
</script>

<script>
  //=============================================================
	// エラーメッセージを表示するイベント処理
	//=============================================================
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

		// パラメータ[error]が1かどうかを判断する
		if (paramArray.error == '1') {
			$("p.connect_alert").text("ルームへ入室可能な人数を超えています。");
			// エラーメッセージの表示
			$("p.connect_alert").show();
		}
		else if (paramArray.error == '2') {
			$("p.connect_alert").text("ルームへの入室が制限されているため、入室することが出来ません。");
			// エラーメッセージの表示
			$("p.connect_alert").show();
		}
		else if (paramArray.error == '3') {
			$("p.connect_alert").text("ルーム名は半角英数字、アンダーバー(_)、ハイフン(-)の32文字迄です。");
			// エラーメッセージの表示
			$("p.connect_alert").show();
		}

		if( paramArray.room ) {
			$("#room_name").val( decodeURI(paramArray.room) );
		}
	}
});
</script>


<script>
$(function () {
  //=============================================================
	// 招待文とURLをクリップボードにコピーするイベント処理
	//=============================================================
	var copyBtnHoverFlg = false;
	var copyMessage = "";
	// コピーボタンへホバーしている場合のみコピーできるようにする
	$("#icon_copy_sentence, #icon_copy_url")
	.mouseover(function(e) {
		copyBtnHoverFlg = true;
	})
	.mouseout(function(e) {
		copyBtnHoverFlg = false;
	});
	// 招待文・URLのコピーボタン押下時のイベント処理
	$("#icon_copy_sentence, #icon_copy_url").click(function(){
		// ルーム名を取得する
		var roomName = $("#room_name").val();
    // エラーメッセージの表示
    $("p.connect_alert").hide();
    // 32文字 半角英数字か判別する
    if(!roomName.match(/^([a-zA-Z0-9\-_]{1,32})$/)){
      // ルーム名が存在しない場合はコピーエラーメッセージを出す
			$("p.connect_alert").text("ルーム名は半角英数字、アンダーバー(_)、ハイフン(-)で32文字以内で入力して下さい");
			// エラーメッセージの表示
			$("p.connect_alert").show();
      return false;
    }

		if(roomName != "" ){
			// コピーするメッセージを保存する
			var roomUrl = "https://"+document.domain+"/room/"+$("#room_name").val();
			if($(this).attr("id") == "icon_copy_sentence"){
				// 招待文コピーの場合
				copyMessage = [
					"いつも大変お世話になっております。\n",
					"下記の日程でオンラインビデオチャットをお願いいたします。\n",
					"\n",
					"■00/00　00:00～00:00\n",
					"\n",
					"当日は下記URLよりビデオチャットルームにアクセスし、\n",
					"お待ちいただけますと幸いです。\n",
					"",
					roomUrl+"\n",
					"\n",
					"以上、ご不明点がございましたら下記までお問い合わせくださいませ。\n",
					"\n",
					"担当者：\n",
					"連絡先：\n",
					"メールアドレス：\n"].join("");
			}else{
				// URLコピーの場合
				copyMessage = roomUrl;
			}
			// ブラウザのコピー処理を実行する
			document.execCommand("copy");

		}else{
			// ルーム名が存在しない場合はコピーエラーメッセージを出す
			$("div.copy_message_area").text("ルーム名を入力してください（3秒後に消えます）");
			// コピーメッセージの表示
			$("div.copy_message_area").show();
			setTimeout(function(){
				$("div.copy_message_area").fadeOut("slow");
			}, 3000);
		}
	});

	//コピーイベント発生時に実行するイベント発生
	document.body.oncopy = function(event){
    // IE11 判別
    var ua = window.navigator.userAgent.toLowerCase();
		if(copyBtnHoverFlg){
      // 通常のコピーイベントをキャンセル
			event.preventDefault();
			// clipboard APIで任意のデータをクリップボードにコピーする
      if(ua.indexOf('trident/7') != -1){
        window.clipboardData.setData('Text', copyMessage);
      }else{
        event.clipboardData.setData('text', copyMessage);
      }
      // コピーメッセージの表示
			$("div.copy_message_area").text("コピーしました（3秒後に消えます）");
			$("div.copy_message_area").show();
			setTimeout(function(){
				$("div.copy_message_area").fadeOut("slow");
			}, 3000);
		}else if(ua.indexOf('trident/7') != -1){
      // IEの場合最初にコピーがダイヤログが出てきてcopyBtnHoverFlg判別ができずにコピーできないので
      window.clipboardData.setData('Text', copyMessage);
    }
		copyMessage = "";
	};
});
</script>
{/literal}

{literal}
<style type="text/css">
/*-------------------------------------
	（モーダル）基本型
--------------------------------------*/
.modal-content {
	display: none;
	position: fixed;
	height: 40%;
	width: 60%;
	min-height: 350px;
	min-width: 800px;
	top: 20%;
	left: 20%;
}

.modal-content .inner-wrap {
	width: 100%;
	height: 100%;
	line-height: 1.2;
}

.modal-content .list-area,
.modal-content .edit-area {
	width: 100%;
	max-width: 1180px;
	overflow: auto;
}

/* モーダル */
.modal-content .inner-wrap h5 {
		padding: 5px 0 10px 0;
		font-size: 1.3em;
		font-weight: bold;
		color: #215b82;
}

.f_name_{
	display: inline-block !important;
	width: 150px !important;
}
.text_short{
	width:60px !important;
	display: inline-block !important;
}
.text_medium{
	width:200px !important;
	display: inline-block !important;
}
.text_long{
	width:443px !important;
	display: inline-block !important;
}

.f_mail{width:295px !important;}

/*-----------------------
	モーダル領域
------------------------*/
.modal-content {
	position: fixed;
	display: none;
	margin: 0;
	padding: 20px;
	border: 12px solid #b6c3cc;
	background: #ffffff;
	z-index: 501;
}

.modal-overlay {
	display: none;
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
		background-color: rgba(0,0,0,0.4);
	z-index: 500;
}

.modal-open {
	color: #1b75b1;
	text-decoration: underline;
}

.modal-open:hover {
	color: #df6b6e;
	text-decoration: underline;
}

.modal-close {
	position: absolute;
	top: -12px;
	right: -12px;
	display: block;
	width: 40px;
	height: 40px;
}

.modal-close span {
	display: inline-block;
	width: 100%;
	height: 100%;
	text-indent: -9999px;
	background: #b6c3cc url("/img/btn_close.png") no-repeat center center;
}

.modal-close:hover {
	cursor:pointer;
}

.modal-close:hover span {
	background: #0f507a url("/img/btn_close.png") no-repeat center center;
}

/* エラーメッセージ */
.errmsg {
	font-size: 0.95em;
	line-height: 1.6;
	color: #df6b6d;
	padding-bottom: 15px;
}

.modal-content .list-area.hgt3,
.modal-content .edit-area.hgt3 {
	margin-top: 2px;
	height: 80%;
	height: calc(100% - 100px);
}

</style>
{/literal}


</head>
<body onload="initialize();">
{literal}
<!-- Global site tag (gtag.js) - Google Analytics -->
<script type="text/javascript" src="//api.docodoco.jp/v5/docodoco?key=V2wS05VZSdDj9oJJcnagCPOhXqRjWkSXxUSkvjBNq9Jozaga3HbGnr8MWC9kJB2G" charset="utf-8"></script>
<script type="text/javascript" src="//api.docodoco.jp/docodoco_ua_plugin_2.js" charset="utf-8"></script>
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-48144639-6"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'UA-48144639-6');

  ga('set', 'dimension1' , SURFPOINT.getOrgName()); //組織名
  ga('set', 'dimension2' , SURFPOINT.getOrgUrl()); //組織 URL
  ga('set', 'dimension3' , getIndL(SURFPOINT.getOrgIndustrialCategoryL())); //業種大分類
  ga('set', 'dimension4' , getEmp(SURFPOINT.getOrgEmployeesCode())); //従業員数
  ga('set', 'dimension5' , getTime()); //アクセス時刻
  ga('set', 'dimension6' , getIpo(SURFPOINT.getOrgIpoType()));
  ga('set', 'dimension7' , getCap(SURFPOINT.getOrgCapitalCode()));
  ga('set', 'dimension8' , getGross(SURFPOINT.getOrgGrossCode()));
  ga('set', 'dimension9' , SURFPOINT.getCountryJName());
  ga('set', 'dimension10' , SURFPOINT.getPrefJName());
  ga('set', 'dimension11' , SURFPOINT.getLineJName());
  ga('send', 'pageview');
</script>
{/literal}
<!-- wrap start -->
<div id="mi_wrap" class="lp_wrap">

	<!-- メインコンテンツ start -->
	<div id="mi_top_visual" class="mi_clearfix mi_top_visual">
    <!-- ヘッダー start -->
  	<header id="lp_header" class="lp_header mi_clearfix">

  		<!-- ヘッダー左 start -->
  		<div class="mi_flt-l">

  			<!-- タイトル start -->
  			<div class="lp_header_logo">
  				<img src="/img/lp/ico-top.png" alt="meet in">
  			</div>
  			<!-- タイトル end -->

  		</div>
  		<!-- ヘッダー左 end -->

  		<!-- ヘッダー右 start -->
  		<div class="mi_flt-r lp_header_button_wrap">
        <!-- ログイン start -->
  			<a href="/index/login" class="lp_header_button lp_header_login_button"><span class="lp_head_button" id="lp-rogin-button">ログイン</span></a>
  			<a href="#mi_contact_section" class="lp_header_button"><span class="lp_head_button">新規登録</span></a>
  		    <!-- ログイン end -->
          <p class="mi_tokkyo_text">特許出願中</p>
  		</div>
  		<!-- ヘッダー右 end -->

  	</header>
  	<!-- ヘッダー end -->

		<!-- LPメインビジュアル start -->
		<div class="mi_top_visual_inner">
			<div class="mi_top_visual_img_wrap">
				<img src="/img/lp/main-grobe.png" alt="" class="mi_top_visual_img">
			</div>
			<div class="mi_connect_from">
        <div class="lp_title_wrap">
          <p class="mi_cach_text"><img src="/img/lp/title_992px.png" class="mi_js_resize_img992" alt="いつでも、どこでも、すぐにミーティングを。"><img src="/img/lp/title_1200px.png" class="mi_js_resize_img1200" alt="いつでも、どこでも、すぐにミーティングを。"></p>
          <p class="mi_cach_subtext">面倒なログイン、アプリのダウンロードなどは一切不要。1秒でオンラインミーティング。</p>
        </div>
				<div class="mi_connect_from_inner">
					<p class="mi_input_text">好きな文字列を入力してルームを作成してください。</p>
					<p class="connect_alert error_msg" style="display: none;"></p>
          <div class="creat_room_from_block">
            <span class="http_text">https://online.sales-crowd.jp/room/</span>
  					<input type="text" id="room_name" value="" placeholder="ルーム名" class="mi_default_input">
  					<button type="button" name="button" class="mi_default_button mi_conect_button hvr-fade" id="connect_room">接 続</button>
          </div>
          <input type="hidden" id="connection_info_id"/>
					<input type="hidden" id="peer_id" value="{$peer_id}"/>
					<input type="hidden" id="target_peer_id"/>
					<input type="hidden" id="auto_dial" value="{$auto_dial}"/>
					<input type="hidden" id="page_from" value="{$page_from}"/>

          <div class="creat_room_btn_block">
            <a href="javascript:void(0)" class="coppy_btn" id="icon_copy_url"><span class="coppy_btn_inner"><img src="/img/lp/ico-copy_FFFFFF.png" class="" alt="" />URLコピー</span></a>
            <a href="javascript:void(0)" class="coppy_btn" id="icon_copy_sentence"><span class="coppy_btn_inner"><img src="/img/lp/ico-mail.png" class="" alt="" />招待文をコピー</span></a>
          </div>
          <div class="copy_message_area"></div>
				</div>
			</div>

		</div>
		<!-- LPメインビジュアル end -->


		<!-- LPナビゲーション start -->
		<nav class="mi_lpmain_nav_wrap">
			<div id="mi_lp_top_nav" class="mi_lpmain_nav">
				<ul class="mi_lpmain_nav_inner mi_js_scroll mi_clearfix">
					<li><a href="#lp_header"><img src="/img/lp/rogo-header.png" class="" alt=""></a></li>
          <li><a href="#mi_how_to_use_section">使い方</a></li>
          <li><a href="#mi_to_use_section">利用する</a></li>
					<li><a href="#mi_chara_section">特徴</a></li>
					<li><a href="#mi_case_section">活用事例</a></li>
					<li><a href="#mi_plan_section">料金プラン</a></li>
          <li><a href="#mi_vision_section">ビジョン</a></li>
					<li><a href="#mi_member_section" class="two_lines"><span>メンバー・<br />会社概要</span></a></li>
					<!-- <li><a href="#mi_company_section">会社概要</a></li> -->
					<li><a href="javascript:void(0)" class="mi_nav_comingSoon">F&nbsp;&amp;&nbsp;Q<span class="mi_nav_comingSoon_text">Coming Soon</span></a></li>
				</ul>
			</div>
		</nav>
		<!-- LPナビゲーション end -->


    <!-- LP使い方セクション start -->
		<section id="mi_how_to_use_section" class="mi_top_section mi_how_to_use_section mi_clearfix">
			<div class="mi_top_section_title_block">
				<h2 class="mi_top_section_title mi_title_line_orange">使い方</h2>
			</div>

      <ul class="mi_how_to_use_block mi_clearfix">
        <li class="mi_how_to_use_step">
          <img src="/img/lp/img-howto_step1.png" class="" alt="">
  			</li>
  			<li class="mi_how_to_use_step">
          <img src="/img/lp/img-howto_step2.png" class="" alt="">
  			</li>
        <li class="mi_how_to_use_step">
          <img src="/img/lp/img-howto_step3.png" class="" alt="">
  			</li>
      </ul>

		</section>
		<!-- LP使い方セクション end -->


    <!-- LP利用するセクション start -->
		<section id="mi_to_use_section" class="mi_top_section mi_to_use_section mi_clearfix">
			<div class="mi_top_section_title_block">
				<h2 class="mi_top_section_title mi_to_use_section_title">meet inをどのように使いたいですか？</h2>
			</div>

      <ul class="mi_to_use_block mi_clearfix">
        <li class="mi_to_use_list mi_to_use_list_boder_orange">
          <div class="mi_to_use_list_img_wrap">
            <img src="/img/lp/ico-free.png" class="" alt="">
          </div>
          <p class="mi_to_use_list_text">試しに<br />
使ってみたい</p>
          <a href="#mi_how_to_use_section" class="mi_to_use_list_link"></a>
        </li>
  			<li class="mi_to_use_list mi_to_use_list_boder_purple">
          <div class="mi_to_use_list_img_wrap">
            <img src="/img/lp/ico-sales.png" class="" alt="">
          </div>
          <p class="mi_to_use_list_text">営業で<br />
使ってみたい</p>
          <span class="view_detail_text">事例をみる</span>
          <a href="/lp/sales_case.php" class="mi_to_use_list_link"></a>
        </li>
        <li class="mi_to_use_list mi_to_use_list_boder_purple">
          <div class="mi_to_use_list_img_wrap">
            <img src="/img/lp/ico-meeting.png" class="" alt="">
          </div>
          <p class="mi_to_use_list_text">打ち合わせで<br />
使ってみたい</p>
          <span class="view_detail_text">事例をみる</span>
          <a href="/lp/meeting_case.php" class="mi_to_use_list_link"></a>
        </li>
      </ul>
      <ul class="mi_to_use_block mi_clearfix">
        <li class="mi_to_use_list mi_to_use_list_boder_purple">
          <div class="mi_to_use_list_img_wrap">
            <img src="/img/lp/ico-pro.png" class="" alt="">
          </div>
          <p class="mi_to_use_list_text">本格的に<br />
使ってみたい</p>
          <span class="view_detail_text">機能詳細をみる</span>
          <a href="#mi_how_to_use_section" class="mi_to_use_list_link"></a>
        </li>
        <li class="mi_to_use_list mi_to_use_list_boder_purple">
          <div class="mi_to_use_list_img_wrap">
            <img src="/img/lp/ico-book.png" class="" alt="">
          </div>
          <p class="mi_to_use_list_text">その他の事例を<br />
確認したい</p>
          <span class="view_detail_text">事例をみる</span>
          <a href="#mi_case_section" class="mi_to_use_list_link"></a>
        </li>
      </ul>

		</section>
		<!-- LP利用するセクション end -->


		<!-- LP特徴クション start -->
		<section id="mi_chara_section" class="mi_top_section mi_chara_section">
			<div class="mi_top_section_inner mi_chara_inner">
				<h3 class="mi_chara_section_subtitle"><span>世界中のどこにいても、パソコンが一台あれば、</span><img src="/img/lp/img-title-char.png" class="" alt=""></h3>
				<div class="mi_chara_section_img"></div>
				<div class="mi_chara_list_wrap">
					<ul class="mi_chara_list mi_clearfix">
						<li>
							<img src="/img/lp/ico-check.png" class="mi_chara_list_img" alt="">
							ログイン不要
						</li>
						<li>
							<img src="/img/lp/ico-check.png" class="mi_chara_list_img" alt="">
							一秒でつながる
						</li>
					</ul>
				</div>
				<div class="mi_chara_section_nav">
					<ul class="mi_cahra_link_list mi_clearfix">
						<li><a href="javascript:void(0)" id="mi_chara_block01" class="modal_open mi_cahra_link_purple">
							<div class="mi_cahra_link_list_wrap">
								<span class="mi_chara_link_number mi_title_textpurple">1</span>超ラクチン<img src="/img/lp/ico-rakuchin.png" class="mi_chara_link_img" alt="">
							</div>
						</a></li>
						<li><a href="javascript:void(0)" id="mi_chara_block02" class="modal_open mi_cahra_link_orange">
							<div class="mi_cahra_link_list_wrap">
								<span class="mi_chara_link_number mi_title_textorange">2</span>超簡単<img src="/img/lp/ico-kantan.png" class="mi_chara_link_img" alt="">
							</div>
						</a></li>
						<li><a href="javascript:void(0)" id="mi_chara_block03" class="modal_open mi_cahra_link_purple">
							<div class="mi_cahra_link_list_wrap">
								<span class="mi_chara_link_number mi_title_textpurple">3</span>超便利<img src="/img/lp/ico-benri.png" class="mi_chara_link_img" alt="">
							</div>
						</a></li>
					</ul>
				</div>
			</div>
		</section>
		<!-- LP特徴セクション end -->

		<!-- LP利用方法セクション start -->
		<section id="mi_vido_section" class="mi_top_section mi_vido_section mi_clearfix">
			<div class="mi_top_section_title_block">
				<h2 class="mi_top_section_title mi_title_line_orange">利用方法</h2>
			</div>
			<div class="mi_vido_block mi_flt-l">
				<div class="mi_vido_shadow_overlay"></div>
				<div class="mi_vido_stratButton_wrap">
					<img src="/img/lp/video-purple.png" class="mi_vido_start_img" alt="">
					<p class="mi_vido_start_text mi_text_purple">使い方<br>
					ゲストサイド</p>
				</div>
				<div class="mi_vido_ComingSoonText">Coming Soon</div>
			</div>
			<div class="mi_vido_block mi_flt-r">
				<div class="mi_vido_shadow_overlay"></div>
				<div class="mi_vido_stratButton_wrap">
					<img src="/img/lp/video-orange.png" class="mi_vido_start_img" alt="">
					<p class="mi_vido_start_text mi_text_orange">使い方<br>
					オペレーターサイド</p>
				</div>
				<div class="mi_vido_ComingSoonText">Coming Soon</div>
			</div>
		</section>
		<!-- LP利用方法セクション end -->


		<!-- LP活用方法セクション start -->
		<section id="mi_case_section" class="mi_top_section mi_case_section">
				<div class="mi_top_section_title_block mi_case_title_block">
					<h2 class="mi_top_section_title mi_title_line_orange"><img src="/img/lp/img-title-howto.png" class="" alt="meet inはあらゆる業務で活用できます。"></h2>
				</div>
				<ul class="mi_case_list mi_clearfix">
					<li class="mi_case_sales"><a href="/lp/sales_case.php" class="mi_case_detail_link">
						<div class="mi_case_text_wrap">
							<h3 class="mi_case_list_title">事例1</h3>
							<p class="mi_case_list_text">営業・商談</p>
              <div class="mi_case_list_text_bb"></div>
							<div class="mi_case_hiddenText">営業パーソンの営業効率は<span class="mi_case_pointColor">2倍</span>に</div>
						</div>
					</a></li>
					<li class="mi_case_hr"><a href="/lp/hr_case.php" class="mi_case_detail_link">
						<div class="mi_case_text_wrap">
							<h3 class="mi_case_list_title">事例2</h3>
							<p class="mi_case_list_text">面接・人事</p>
              <div class="mi_case_list_text_bb"></div>
							<div class="mi_case_hiddenText">求人方法の幅が増え<span class="mi_case_pointColor">応募率もアップ</span></div>
						</div>
					</a></li>
					<li class="mi_case_zaitaku"><a href="/lp/work_case.php" class="mi_case_detail_link">
						<div class="mi_case_text_wrap">
							<h3 class="mi_case_list_title">事例3</h3>
							<p class="mi_case_list_text">在宅勤務での活用</p>
              <div class="mi_case_list_text_bb"></div>
							<div class="mi_case_hiddenText"><span class="mi_case_pointColor">新しい働き方</span>新しい働き方の可能性が広がった</div>
						</div>
					</a></li>
					<li class="mi_case_meeting"><a href="/lp/meeting_case.php" class="mi_case_detail_link">
						<div class="mi_case_text_wrap">
							<h3 class="mi_case_list_title">事例4</h3>
							<p class="mi_case_list_text">支社間の会議</p>
              <div class="mi_case_list_text_bb"></div>
							<div class="mi_case_hiddenText">コストをかけず企業全体の<span class="mi_case_pointColor">一体感</span>が増した</div>
						</div>
					</a></li>
					<!-- <li class=""><a href="">
						<img src="" class="" alt="">
						<h3 class="">事例5</h3>
						<p class="">カスタマーサポート</p>
					</a></li>
					<li class=""><a href="">
						<img src="" class="" alt="">
						<h3 class="">事例6</h3>
						<p class="">オンラインセミナー</p>
					</a></li> -->
				</ul>
		</section>
		<!-- LP活用方法セクション end -->


		<!-- LP活用方法セクション start -->
		<section id="mi_plan_section" class="mi_top_section mi_plan_section">
			<div class="mi_top_section_inner mi_plan_inner">
				<div class="mi_top_section_title_block">
					<h2 class="mi_top_section_title mi_title_line_purple">料金プラン</h2>
				</div>
				<ul class="mi_plan_list mi_clearfix">
					<li class="mi_plan_type_warp">
						<div class="mi_plan_type">
							<p class="mi_plan_type_title mi_text_orange">個人向け</p>
							<p class="mi_plan_type_text"><span class="mi_plan_type_text_s"></span>Free</p>
						</div>
						<div class="mi_function_area">
							<ul>
								<li><img src="/img/lp/img-checklist_FFAA00.png" class="" alt="" />基本機能</li>
							</ul>
						</div>
            <a href="/lp/plan_detail.php" class="mi_plan_detail_btn">詳細はこちら</a>
						<a href="#mi_contact_section" class="mi_plan_subscription_btn mi_btn_bg_orange">お申し込み</a>
					</li>

					<li class="mi_plan_type_warp">
						<div class="mi_plan_type">
							<p class="mi_plan_type_title mi_text_purple">法人向け</p>
              <p class="mi_plan_type_text"><span class="mi_plan_type_text_s">1ユーザー</span>5,000円</p>
						</div>
						<div class="mi_function_area">
							<ul>
								<li><img src="/img/lp/img-checklist_CAA7D8.png" class="" alt="" />基本機能</li>
                <li><img src="/img/lp/img-checklist_CAA7D8.png" class="" alt="" />ロック機能</li>
                <li><img src="/img/lp/img-checklist_CAA7D8.png" class="" alt="" />資料保存機能</li>
                <li><img src="/img/lp/img-checklist_CAA7D8.png" class="" alt="" />録画機能</li>
                <li><img src="/img/lp/img-checklist_CAA7D8.png" class="" alt="" />シークレットメモ機能</li>
							</ul>
						</div>
            <a href="/lp/plan_detail.php" class="mi_plan_detail_btn">詳細はこちら</a>
						<a href="#mi_contact_section" class="mi_plan_subscription_btn mi_btn_bg_purple">お申し込み</a>
					</li>

					<li class="mi_plan_type_warp">
						<div class="mi_plan_type">
							<p class="mi_plan_type_text mi_plan_type_contact">OEM提供</p>
						</div>
						<div class="mi_function_area">
							<p class="mi_plan_text_contact">詳細は<br>
								お問い合わせください。</p>
						</div>
					</li>
				</ul>
			</div>
		</section>
		<!-- LP活用方法セクション end -->


    <!-- LPビジョンセクション start -->
		<section id="mi_vision_section" class="mi_top_section mi_vision_section">
			<div class="mi_top_section_inner">

				<h3 class="mi_vision_section_subtitle"><img src="/img/lp/img-title-vision.png" class="" alt=""></h3>
				<p class="mi_vision_section_text">少子高齢化の日本が直面する大きな課題の一つに労働力の減少があります。<br>
					その影響を少しでも減らすために、在宅勤務や時短勤務などの多様な働き方が推奨されてきます。</p>
				<p class="mi_vision_section_text">また、時間当たりの生産性を高めるために、<br>
					必要ではない仕事や、意味のない長時間労働は是正されるようになってきており、<br>
					様々な企業が、2017年の取り組みの上位に生産性を高めるという事を上げています。</p>
				<p class="mi_vision_section_text">私たちはそのような中で、仕事において、<br>
					「直接会う」という事が、オンライン上で行う事が当たり前になれば、<br>
					「移動がなくなり」、「場所の制約もなくなり」、業務の生産性が、<br>
					<span class="mi_overlay_memo_open">3倍とまでいかなくても2倍程度にはなるのではないか、という仮説を立てています。</span></p>
				<p class="mi_vision_section_text">その仮説を現実にするために、テクノロジーの力を活用し、<br>
					オンラインコミュニケーションプラットフォームを提供する会社を立ち上げました。</p>
				<p class="mi_vision_section_text">株式会社meet  inに期待してください。</p>
				<div class="mi_vision_section_wrap mi_clearfix">
					<h4 class="mi_dictionary_title mi_mintyofont">ミートイン【meet in】</h4>
					<p class="mi_dictionary_meaning"><span class="mi_imi">意味</span>集まる、直接会う、出会う</p>
				</div>
			</div>
		</section>
		<!-- LPビジョンセクション end -->


		<!-- LP開発チーム紹介セクション start -->
		<section id="mi_member_section" class="mi_top_section mi_member_section">
			<div class="mi_top_section_inner mi_member_inner">
				<div class="mi_top_section_title_block">
					<h2 class="mi_top_section_title mi_title_line_purple mi_top_section_title_s">開発チーム紹介</h2>
				</div>
				<div class="mi_job_category_wrap">
					<h3 class="mi_job_category mi_text_purple mi_Robotofont">ENGINEER</h3>
					<div class="mi_member_block mi_clearfix">
						<div class="mi_flt-l mi_member_detail">
							<p class="mi_job_type">チーフエンジニア</p>
							<p class="mi_member_name mi_text_purple">大嶋 優太<span class="mi_member_name_en mi_Robotofont">Yuta Ooshima</span></p>
							<div class="mi_member_text_wrap">
								<p class="mi_member_text">神奈川県出身。地元の一流大学、工学部に在学中、大学4年次のインターン実施企業より、ベトナムでの開発拠点立ち上げを任させられ、単身渡越。半年間で約20名規模まで拡大し、開発拠点立ち上げに成功。その後、大手新聞社、大手メディア運営企業、大手人材企業のWeb開発などを、一手に引き受け成功に導く。
									Web開発のみならず、インフラ面の構築などの知見を積み、今回のmeet inの基幹機能の開発に大きく貢献。オンラインコミュニケーションを世界中でスタンダードにするために、プロジェクトマネジメント、バックエンド、インフラ、セキュリティなどの開発にコミット。</p>
							</div>
							<p class="mi_readmore_link"><a href="javascript:void(0)" class="js_more_toggle mi_member_text_close mi_text_purple mi_Robotofont">Read more</a></p>
						</div>
						<div  class="mi_flt-l"><img src="/img/lp/img-ooshima.png" class="" alt=""></div>
					</div>

					<div class="mi_member_block mi_clearfix">
						<div class="mi_flt-l mi_member_detail">
						<p class="mi_job_type">エンジニア</p>
						<p class="mi_member_name mi_text_purple">山崎 裕基<span class="mi_member_name_en mi_Robotofont">Yuki Yamazaki</span></p>
						<div class="mi_member_text_wrap">
							<p class="mi_member_text">東京理科大学出身、大学2年生より、インターン先企業、数社のシステム開発に従事。エンタープライズ向けグループウェアやiPhoneアプリをはじめとしたスマートフォンアプリのプロジェクトに参画。プロジェクトの経験値、プログラミングスキルの高さから、大学3年生の段階で3社のインターン先からの内定を得る。その後、大学4年生のタイミングでシリコンバレーに行き、Googleなどと比肩しうる可能性のあるサービス開発に従事したいという志で、今後、社会的に最もスケールすると想定される、「働き方」をテーマにしたサービス開発に従事。得意な分野はフロントエンドの開発全般。Go言語、Angularなどの最先端技術の知見を活かして、オンラインプラットフォーム開発にコミット。</p>
						</div>
						<p class="mi_readmore_link"><a href="javascript:void(0)" class="js_more_toggle mi_member_text_close mi_text_purple mi_Robotofont">Read more</a></p>
						</div>
						<div class="mi_flt-l"><img src="/img/lp/img-yamazaki.png" class="" alt=""></div>
					</div>
				</div>
				<div class="mi_job_category_wrap">
					<h3 class="mi_job_category mi_text_purple mi_Robotofont">DESIGNER</h3>
					<div class="mi_member_block mi_clearfix">
						<div class="mi_flt-l mi_member_detail">
						<p class="mi_job_type">UI&amp;UXデザイナー</p>
						<p class="mi_member_name mi_text_purple">坂井 真実<span class="mi_member_name_en mi_Robotofont">Mami Sakai</span></p>
						<div class="mi_member_text_wrap">
							<p class="mi_member_text">武蔵野美術大学出身、在学中よりアナログ表現に限らず、デジタルでの表現手法を活用し、デザインに従事。その後、日本最大級のデザインプロダクションに入社し、グラフィックデザイン、紙面広告、ブランディング広告などの、企画、ディレクション、制作に係る総合的な業務を経験。グラフィックデザインの知見をベースに、Webデザインの力を乗せる事によって、グローバルにインパクトを与える事の出来るサービスの立ち上げに関わりたい、という意向からUI/UXデザイナーに転向。様々なWebサービスのデザイン制作、WebアプリケーションのUX/UIの設計、改修に携わる。meet inではオンラインコミュニケーションプラットフォームをグローバルに展開していく為のUI/UXの設計、デザインの総合プロデュースに従事。</p>
						</div>
						<p class="mi_readmore_link"><a href="javascript:void(0)" class="js_more_toggle mi_member_text_close mi_text_purple mi_Robotofont">Read more</a></p>
						</div>
						<div class="mi_flt-l"><img src="/img/lp/img-sakai.png" class="" alt=""></div>
					</div>
				</div>
				<div class="mi_job_category_wrap">
					<h3 class="mi_job_category mi_text_purple mi_Robotofont">ADVISOR</h3>
					<div class="mi_member_block mi_clearfix">
						<div class="mi_flt-l mi_member_detail">
						<p class="mi_job_type">特別アドバイザー</p>
						<p class="mi_member_name mi_text_purple">清水 拓未<span class="mi_member_name_en mi_Robotofont">Takumi Shimizu</span></p>
						<div class="mi_member_text_wrap mi_m_height">
							<p class="mi_member_text">在宅ワーカーを活用した国内最大の営業支援会社に入社、入社2年目でMVPを受賞し、3年目から営業支援会社の営業部門を束ねる責任者へと昇格。多くの営業支援ツールの開発や、約300社を超える営業を改革するコンサルティングに携わり、株式会社meet inが営業市場における大きな改革の可能性を秘めていることを確信し、特別アドバイザーに就任。</p>
						</div>
						<p class="mi_readmore_link"><a href="javascript:void(0)" class="js_more_toggle mi_member_text_close mi_text_purple mi_Robotofont">Read more</a></p>
						</div>
						<div class="mi_flt-l"><img src="/img/lp/img-shimizu.png" class="" alt=""></div>
					</div>

					<div class="mi_member_block mi_clearfix">
						<div class="mi_flt-l mi_member_detail">
							<p class="mi_job_type">特別アドバイザー</p>
							<p class="mi_member_name mi_text_purple">三浦 和広<span class="mi_member_name_en mi_Robotofont">Kazuhiro Miura</span></p>
							<div class="mi_member_text_wrap mi_m_height">
								<p class="mi_member_text">経営者をテーマにしたオンライン動画のメディアの経営を行い、月間100万PVを超えるメディアへと育成。その過程の中でフリーで働くクリエイターやデザイナーとのコミュニケーションツールを開発。現職ではその知見を活かして、在宅やフリーランスで働く人達と企業を結ぶ、メディアの運営や法人向けのアウトソーシング業務に携わる。オンラインコミュニケーションプラットフォームが、日本の働き方を変える可能性を感じ、特別アドバイザーに就任。</p>
							</div>
							<p class="mi_readmore_link"><a href="javascript:void(0)" class="js_more_toggle mi_member_text_close mi_text_purple mi_Robotofont">Read more</a></p>
						</div>
						<div class="mi_flt-l"><img src="/img/lp/img-miura.png" class="" alt=""></div>
					</div>
				</div>
			</div>
		</section>
		<!-- LP活用方法セクション end -->

		<!-- LP会社概要セクション start -->
		<section  id="mi_company_section" class="mi_top_section mi_company_section">
			<div class="mi_top_section_inner">
				<div class="mi_top_section_title_block">
					<h2 class="mi_top_section_title mi_title_line_orange mi_top_section_title_s">会社概要</h2>
				</div>
				<div class="mi_company_block">
					<dl class="mi_company_info_list">
						<dt>会社名</dt>
						<dd>株式会社meet in</dd>
						<dt>設立</dt>
						<dd>2017年1月27日</dd>
						<dt class="mi_company_business">事業内容</dt>
						<dd>オンラインコミュニケーションツールの開発<br><br>
              オンラインコミュニケーションツールのOEM提供<br><br>
              オンラインコミュニケーションの教育研修
						<dt>資本金</dt>
						<dd>1,000万(資本準備金 500万)</dd>
						<dt class="mi_lp_company_zyusyo">所在地</dt>
						<dd>〒171-0014<br><br>東京都豊島区池袋2-6-1 KDX池袋ビル 9F</dd>
					</dl>
					<div id="map_canvas" class="mi_company_map">

					</div>
				</div>
			</div>
		</section>
		<!-- LP会社概要セクション end -->

		<!-- LPトピックセクション start -->
		<section class="mi_top_section mi_topic_section">
			<div class="mi_top_section_inner mi_topic_inner">
				<div class="mi_top_section_title_block">
					<h2 class="mi_top_section_title mi_title_line_purple mi_top_section_title_s">トピック</h2>
				</div>
				<div class="mi_topic_block">
					<dl class="mi_topic_list">
            <dt>2017年3月29日</dt>
						<dd><a href="http://nest.jane.or.jp/sponsors/" target="_blank">株式会社meet inが新経済連盟のプロモーショナルスポンサーに就任致しました。</a></dd>
						<dt>2017年2月20日</dt>
						<dd>meet inをリリースいたしました。<br><br>
              meet in公式サイトを公開いたしました。</dd>
					</dl>
				</div>
			</div>
		</section>
		<!-- LPトピックセクション end -->


		<!-- LPお問い合わせセクション start -->
		<section id="mi_contact_section" class="mi_top_section mi_contact_section mi_bg_orange">
			<div class="mi_top_section_inner">
				<div class="mi_top_section_title_block">
					<h2 class="mi_top_section_title mi_contact_title">お問い合わせ・お申し込みフォーム</h2>
				</div>
				<p class="mi_contact_subtitle">meet inに関するお問い合わせ、お申し込みは下記まで必要事項をご記入の上お問い合わせください。<br>
担当者より追って詳細のご案内をさせていただきます。</p>
				<div class="mi_contact_block">
					<form action="/lp/complete.php" method="post" class="contactform">
						<div class="mi_contactform_block">
							<p class="mi_contactform_title"><span class="mi_contactform_required">必須</span>氏名</p>
							<input type="text" name="name" class="mi_contactform_input_text_m" placeholder="田中 太郎" required>
						</div>
						<div class="mi_contactform_block">
							<p class="mi_contactform_title"><span class="mi_contactform_required">必須</span>会社名<span class="mi_contactform_confilm_text">（個人事業主の場合は氏名を再度入力してください。）</span></p>
							<input type="text" name="company" class="mi_contactform_input_text_l" placeholder="株式会社meet in" required>
						</div>
						<div class="mi_contactform_block">
							<p class="mi_contactform_title"><span class="mi_contactform_required">必須</span>電話番号</p>
							<input type="text" name="tel_number" class="mi_contactform_input_text_m" placeholder="000-0000-0000" required>
						</div>
						<div class="mi_contactform_block">
							<p class="mi_contactform_title"><span class="mi_contactform_required">必須</span>メールアドレス</p>
							<input type="text" name="mail" class="mi_contactform_input_text_ml" placeholder="aaaaaaaaaaaaaaa" required><span class="mi_text_atmark">@</span><input type="text" name="domein" class="mi_contactform_input_text_s" placeholder="aaaa.jp" required>
						</div>
            <div class="mi_contactform_block">
							<p class="mi_contactform_title"><span class="mi_contactform_required">必須</span>お問い合わせ内容</p>
							<textarea name="contact" class="mi_contactform_textarea" placeholder="お問い合わせ内容を記載して下さい。" required></textarea>
						</div>
            <div class="mi_contactform_block">
							<p class="mi_contactform_title">使用用途</p>
							<input type="text" name="use" class="mi_contactform_input_text_l" placeholder="例：ミーティング、営業など">
						</div>
						<p class="mi_contactform_text"><input type="checkbox" name="privacy" id="mi_privacy_check" class="mi_contactform_checkbox" required><label for="mi_privacy_check"><a href="javascript:void(0)" class="mi_overlay_privacy_open">個人情報の取り扱いについて</a>承諾しました。</label></p>
						<div class="mi_contactform_send_wrap">
							<button class="mi_contactform_send mi_overlay_confirm_open">確認画面へ</button>
						</div>
					</form>
				</div>
			</div>
		</section>
		<!-- LPお問い合わせセクション end -->

		<!-- LPフッターセクション start -->
		<footer class="mi_lp_footer">
			<p class="mi_footer_logo"><img src="/img/lp/rogo-meetin-footer.png" class="" alt="meet in"></p>
		</footer>
		<!-- LPフッターセクション end -->


		<!-- LPプライバシーポップアップコンテンツコンテンツ begin -->
		<div id="mi_overlay_privacy" class="mi_overlay mi_overlay_privacy">
			<div class="mi_modal_shadow"></div>
			<div class="mi_overlay_wrap mi_overlay_privacy_wrap">
				<div class="mi_overlay_contents mi_privacy_block">
					<div class="mi_overlay_colose">
						<a href="javascript:void(0)" class="mi_overlay_colose_btn"><img src="/img/lp/ico-close.png" class="mi_privacy_close_img" alt="閉じる"><br>閉じる</a>
					</div>
					<div class="mi_overlay_contents_title mi_privacy_title_wrap">
						<h2 class="mi_privacy_title">プライバシーポリシー</h2>
					</div>

					<dl class="mi_privacy_list">
						<dt><span class="mi_text_orange">●</span>個人情報の取り扱いについて</dt>
						<dd>株式会社meet in（以下「当社」）は、個人情報の適切な取り扱いを期しています。当社が提供する「meet in」によるサービス（以下、「当サービス」）へ のお申し込みについて、下記の事項をご理解いただき、同意の上で個人情報をご提供ください。<dd>
						<dt><span class="mi_text_orange">●</span>個人情報の管理</dt>
						<dd>当社は、お客さまの個人情報を正確かつ最新の状態に保ち、個人情報への不正アクセス・紛失・破損・改ざん・漏洩などを防止するため、セキュリティシステムの維持・管理体制の整備・ 社員教育の徹底等の必要な措置を講じ、安全対策を実施し個人情報の厳重な管理を行ないます。<dd>
						<dt><span class="mi_text_orange">●</span>個人情報の利用目的</dt>
						<dd>以下の利用目的のために、個人情報を取得致します。<br>
						その利用目的の範囲を超えて取得した個人情報を利用することはありません。<br>
						（1）当サービス利用に関する登録及び個人認証<br>
						（2）当サービス利用に関する料金請求その他の代金請求及び商品等の引渡し業務に関すること<br>
						（3）当サービス利用に関する問合せ内容の確認、回答、その他ご要望等への対応<br>
						（4）当サービスの利用に伴う電話連絡及び電子メール、資料のご送付<br>
						（5）当サービスの利用に関する新サービス、新メニューのご案内ならびに調査及び障害連絡<br>
						（6）当サービスの利用に関する保守及びメンテナンス等の運営<br>
						（7）当社によるサービスの開発およびマーケティング<dd>
						<dt><span class="mi_text_orange">●</span>個人情報の第三者への開示・提供の禁止</dt>
						<dd>当社は、お客さまよりお預かりした個人情報を適切に管理し、次のいずれかに該当する場合を除き、個人情報を第三者に開示いたしません。<br>
						・お客さまの同意がある場合<br>
						・お客さまが希望されるサービスを行なうために当社が業務を委託する業者に対して開示する場合<br>
						・法令に基づき開示することが必要である場合<dd>
						<dt><span class="mi_text_orange">●</span>個人情報の安全対策</dt>
						<dd>当社は、個人情報の正確性及び安全性確保のために、セキュリティに万全の対策を講じています。<dd>
						<dt><span class="mi_text_orange">●</span>ご本人の照会</dt>
						<dd>お客さまがご本人の個人情報の照会・修正・削除などをご希望される場合には、ご本人であることを確認の上、対応させていただきます。<dd>
						<dt><span class="mi_text_orange">●</span>法令、規範の遵守と見直し</dt>
						<dd>当社は、保有する個人情報に関して適用される日本の法令、その他規範を遵守するとともに、本ポリシーの内容を適宜見直し、その改善に努めます。<dd>
						<dt><span class="mi_text_orange">●</span>個人情報の開示等の請求について</dt>
						<dd>提出して頂いた個人情報について、利用目的の通知、個人情報の開示、訂正、項目の追加または削除、消去や利用停止、提供停止を求める権利があります。自己の個人情報の開示等の請求を行う場合は、下記までご連絡ください。<dd>
						<dt><span class="mi_text_orange">●</span>個人情報の取り扱いに関するお問い合わせ先</dt>
						<dd>株式会社meet in　個人情報対応窓口<br>
						住所：〒171-0014 東京都豊島区池袋2-6-1 KDX池袋ビル 9F<br>
						メール：<a href="mailto:privacy@meet-in.jp">privacy@meet-in.jp</a><br>
						担当責任：個人情報保護管理者</dd>
					</dl>
				</div>
			</div>
		</div>
		<!-- LPプライバシーコンテンツ end -->

		<!-- LPプライバシーポップアップコンテンツコンテンツ begin -->
		<div id="mi_overlay_confirm" class="mi_overlay mi_overlay_confirm">
			<div class="mi_modal_shadow"></div>
			<div class="mi_overlay_wrap mi_overlay_confirm_wrap">
				<div class="mi_overlay_contents mi_confirm_block">
					<div class="mi_overlay_colose">
						<a href="javascript:void(0)" class="mi_overlay_colose_btn"><img src="/img/lp/ico-close.png" class="mi_privacy_close_img" alt="閉じる"><br>閉じる</a>
					</div>
					<div class="mi_overlay_contents_title mi_confirm_title_wrap">
						<img src="/img/lp/rogo.png" class="mi_confirm_title_img" alt="meet in">
						<h2 class="mi_confirm_title">お問い合わせ・お申し込み内容<br>
							確認画面</h2>
					</div>

					<table class="mi_confirm_content">
						<tr>
							<th>氏名</th>
							<td class="mi_confirm_name"></td>
						</tr>
						<tr>
							<th>会社名</th>
							<td class="mi_confirm_company"></td>
						</tr>
						<tr>
							<th>電話番号</th>
							<td class="mi_confirm_tel_number"></td>
						</tr>
						<tr>
							<th>メールアドレス</th>
							<td class="mi_confirm_mail"></td>
						</tr>
            <tr>
							<th>お問い合わせ内容</th>
							<td class="mi_confirm_contact"></td>
						</tr>
            <tr>
							<th>使用用途</th>
							<td class="mi_confirm_use"></td>
						</tr>
					</table>
          <form id="mi_confirm_send_form" action="/lp/complete.php" method="post" class="mi_confirm_form">
            <input type="hidden" name="confirm_name" class="mi_confirm_name_input mi_confirm_input_req">
            <input type="hidden" name="confirm_company" class="mi_confirm_company_input mi_confirm_input_req">
            <input type="hidden" name="confirm_tel" class="mi_confirm_tel_number_input mi_confirm_input_req">
            <input type="hidden" name="confirm_mail" class="mi_confirm_mail_input mi_confirm_input_req">
            <input type="hidden" name="confirm_contact" class="mi_confirm_contact_input mi_confirm_input_req">
            <input type="hidden" name="confirm_use" class="mi_confirm_use_input">
				     <button class="mi_default_button mi_confirm_send">送信</button>
          </form>
				</div>
			</div>
		</div>
		<!-- LPプライバシーコンテンツ end -->


		<!-- LPプライバシーポップアップコンテンツコンテンツ begin -->
		<div id="mi_overlay_memo" class="mi_overlay mi_overlay_memo">
			<div class="mi_modal_shadow"></div>
			<div class="mi_overlay_wrap mi_overlay_memo_wrap">
				<div class="mi_overlay_contents mi_memo_block">
					<div class="mi_overlay_colose">
						<a href="javascript:void(0)" class="mi_overlay_colose_btn"><img src="/img/lp/ico-close.png" class="mi_privacy_close_img" alt="閉じる"><br>閉じる</a>
					</div>

					<h2 class="mi_memo_title mi_Robotofont mi_text_orange">Memo</h2>
					<p class="mi_memo_text">オンライン上で「直接会う」ことで<br>ムダな移動時間を短縮し、生産性の高い仕事に集中出来る</p>
					<img src="/img/lp/img-memo-graf.png" class="mi_memo_img" alt="">
				</div>
			</div>
		</div>
		<!-- LPプライバシーコンテンツ end -->


    <!-- LPプライバシーポップアップコンテンツコンテンツ begin -->
    <div id="mi_modal_01" class="mi_chara_block01 mi_modal_wrap">
      <div class="mi_modal_shadow"></div>
			<div class="mi_modal_contents mi_chara_block mi_clearfix">
        <div class="mi_detail_wrap mi_flt-l">
          <h4 class="mi_detail_title"><span class="mi_title_number mi_title_textpurple">1</span><span class="mi_title_text mi_title_borderpurple">超ラクチン</span></h4>
          <p class="mi_text_bold">アプリのダウンロードや<br>
            ログイン・固定回線は一切不要。</p>
          <p class="mi_detail_text">meet inのTOPページ上で作成したURLを共有するだけでスタート可能。世界中どこにいてもパソコンやタブレットが1台あればいつでもmeet in。</p>
          <p class="mi_text_caution">※URL作成フォームはmeet inを活用している会社のホームページにもついています。</p>
          <ul class="mi_checkList mi_clearfix">
            <li class="mi_checkList_borderpurple">
              <p class="mi_checkList_title"><img src="/img/lp/tool-login.png" alt="ログイン不要"></p>
            </li>
            <li class="mi_checkList_borderpurple">
              <p class="mi_checkList_title"><img src="/img/lp/tool-namber.png" alt="固定meet in番号"></p>
            </li>
            <li class="mi_checkList_borderpurple">
              <p class="mi_checkList_title"><img src="/img/lp/tool-talk.png" alt="ブラウザだけで会話可能"></p>
            </li>
          </ul>
        </div>
        <div class="mi_img_wrap mi_flt-r"><img src="/img/lp/main-ill-click.png" class="" alt=""></div>
      </div>
    </div>
		<!-- LPプライバシーコンテンツ end -->


		<!-- LPプライバシーポップアップコンテンツコンテンツ begin -->
		<div id="mi_modal_02" class="mi_modal_wrap mi_chara_block02">
			<div class="mi_modal_shadow"></div>
      <div class="mi_modal_contents mi_chara_block mi_clearfix">
        <div class="mi_detail_wrap mi_flt-r">
          <h4 class="mi_detail_title"><span class="mi_title_number mi_title_textorange">2</span><span class="mi_title_text mi_title_borderorange">超簡単</span></h4>
          <p class="mi_text_bold">ワンアクションで<br>
            資料やメモを一発共有。</p>
          <p class="mi_detail_text">資料を共有したければ、画面にドラッグ＆ドロップで一発で共有。録画もメモの共有も画面の共有もクリック一つで簡単に。会わなくてもいつでも、だれでも簡単にミーティングが出来るミートイン。</p>
          <ul class="mi_checkList mi_clearfix">
            <li class="mi_checkList_borderorange">
              <p class="mi_checkList_title"><img src="/img/lp/tool-video.png" alt="ワンクリック録画"></p>
            </li>
            <li class="mi_checkList_borderorange">
              <p class="mi_checkList_title"><img src="/img/lp/tool-memo.png" alt="リアルタイム共有メモ"></p>
            </li>
            <li class="mi_checkList_borderorange">
              <p class="mi_checkList_title"><img src="/img/lp/tool-shear.png" alt="瞬間資料共有"></p>
            </li>
          </ul>
        </div>
        <div class="mi_img_wrap mi_flt-l"><img src="/img/lp/main-ill-one-action.png" class="" alt=""></div>
      </div>
		</div>
		<!-- LPプライバシーコンテンツ end -->

		<!-- LPプライバシーポップアップコンテンツコンテンツ begin -->
		<div id="mi_modal_03" class="mi_modal_wrap mi_chara_block03">
			<div class="mi_modal_shadow"></div>
      <div class="mi_modal_contents mi_chara_block mi_clearfix">
        <div class="mi_detail_wrap mi_flt-l">
          <h4 class="mi_detail_title"><span class="mi_title_number mi_title_textpurple">3</span><span class="mi_title_text mi_title_borderpurple">超便利</span><span class="mi_chara_tokkyo">特許出願中</span></h4>
          <p class="mi_text_bold">名刺交換や複数人接続など<br>
            コミュニケーションツールが満載。</p>
          <p class="mi_detail_text">1対1でのミーティングに限らず、複数人でのミーティングも可能。(特許出願中）名刺交換機能や万が一ネットが途切れた場合に備えた固定電話機能など、コミュニケーションに欠かせない便利な機能が付属されています。</p>
          <ul class="mi_checkList mi_clearfix">
            <li class="mi_checkList_borderpurple">
              <p class="mi_checkList_title"><img src="/img/lp/tool-maishi.png" alt="名刺交換機能"></p>
            </li>
            <li class="mi_checkList_borderpurple">
              <p class="mi_checkList_title"><img src="/img/lp/tool-pc-tab-sp.png" alt="PC・タブレットスマホ対応"></p>
            </li>
            <li class="mi_checkList_borderpurple">
              <p class="mi_checkList_title"><img src="/img/lp/tool-cloud.png" alt="新機能随時追加"></p>
            </li>
          </ul>
        </div>
        <div class="mi_img_wrap mi_flt-r"><img src="/img/lp/main-ill-tool.png" class="" alt=""></div>
      </div>
		</div>
		<!-- LPプライバシーコンテンツ end -->



		<!-- コネクト begin -->
		<div class="in_connect_area" style="z-index:50;">
			<div class="conecting_wrap">
				<div class="conecting_inner">
					<div class="lodingimg_efect_wrap">
						<div class="lodingimg_efect">

						</div>
						<p class="loding_text">Connecting<span class="point">・・・</span></p>
					</div>

					<p class="conect_text">ご入力ありがとうございます。<br>担当者を呼び出しております・・・</p>
					<br>
					<br>
					<a href="javascript:void(0);" class="btn_link_long hvr-fade click-fade" id="cancel_connection" style="width:660px"><span class="icon-meet-in call_option_icon"></span><span class="button_text">中止</span></a>
				</div>
			</div>
		</div>
		<!-- コネクト end -->

	</div>
	<!-- メインコンテンツ end -->

<!-- ====================================== モーダルコンテンツ[start] ====================================== -->
<div class="modal-content" id="modal-content"> <!-- id="db-log2"	-->
	<div class="inner-wrap">
	</div>
</div>
<!-- ====================================== モーダルコンテンツ[end] ======================================== -->

<!-- 汎用ダイアログ start -->
<div id="common_dialog_area">
</div>
<!-- 汎用ダイアログ end -->

</div>
<!-- wrap end -->

<script src="/js/jquery-1.11.2.min.js?{$application_version}"></script>
<script type="text/javascript" src="/js/detectSpeed.js?{$application_version}"></script>
<script type="text/javascript" src="/js/Utility.js?{$application_version}"></script>

{if $browser === 'IE'}
{else}
{/if}

<script type="text/javascript" src="/js/WebRTC/MeetinDefault.js?{$application_version}"></script>
<script type="text/javascript" src="/js/WebRTC/MeetinUtility.js?{$application_version}"></script>

{if $browser === 'IE'}
{else}
{/if}

<script type="text/javascript" src="/js/MeetinAPI.js?{$application_version}"></script>
<script type="text/javascript" src="/js/WebSocket/MeetinWebSocketManager.js?{$application_version}"></script>
<script type="text/javascript" src="/js/connection/prepare-connection.js?{$application_version}"></script>
<link rel="stylesheet" href="/css/jquery-ui.css?{$application_version}">
<script src="/js/jquery-1.11.2.min.js?{$application_version}"></script>
<script src="/js/jquery-ui.min.js?{$application_version}"></script>


</body>
</html>
