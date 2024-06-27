
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>meet in（ミートイン） | いつでも、どこでも1秒でweb会議</title>
<meta charset="utf-8">
<meta name="description" content="">
<meta name="author" content="">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="shortcut icon" href="">
<link rel="stylesheet" href="/css/reset.css">
<link rel="stylesheet" href="/css/sp/top.css?{$application_version}">
<link rel="stylesheet" href="/css/sp/button.css">
<!-- web移植 -->
<script src="/js/jquery-1.11.2.min.js?{$application_version}"></script>
<script src="/js/jquery-ui.min.js?{$application_version}"></script>
<script src="/js/common.js?{$application_version}"></script>
<script src="/js/platform.js?{$application_version}"></script>

<script type="text/javascript" src="/js/sp/index/top.js"></script>

{literal}
<script>
$(function(){
	// ログイン情報入力画面へ遷移する
	$('#transition_login').click(function() {
		window.location.href = "/index/login";
	});

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
			$("p.connect_alert").html("<p style='" + cssStyle +"'>ルーム名は半角英数字、アンダーバー(_)、ハイフン(-)の32文字迄です。</p>");
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

//ナビ
$(function(){
	var glovalNav = $('.global_nav');
	var navHeight = glovalNav.outerHeight(true);
	var navOffset = glovalNav.offset().top;

	$(window).scroll(function () {
		if ($(this).scrollTop() > navOffset) {
			glovalNav.css({
				'position':'fixed',
				'top':0,
				'width':'100%',
			});
			$('.main__wrapper').css('margin-top',navHeight);
		} else {
			glovalNav.css('position','relative');
			$('.main__wrapper').css('margin-top','auto');
		}
	});
});

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
//プラポリモーダルを表示させる
$(function(){
	$('.spLp_overlay_privacy_open').click(function() {
		$(".privacy_modal_contents").fadeIn(300);
	});
});
//プラポリモーダルを非表示にさせる
$(function(){
	$('.modal_close_button').click(function() {
		$(".privacy_modal_contents").fadeOut(300);
	});
});

//オーバーレイ
$(function(){

	$( 'form.spLp_contactForm').submit(function(event){
		event.preventDefault();
		var nameVal = $(".spLp_contactForm [name=name]").val();
		var companyVal = $(".spLp_contactForm [name=company]").val();
		var telNumberVal = $(".spLp_contactForm [name=tel_number]").val();
		var mailVal = $(".spLp_contactForm [name=mail]").val();
		var domeinVal = $(".spLp_contactForm [name=domein]").val();
		var subject = $(".spLp_contactForm [name=subject]").val();
		var contactVal = $(".spLp_contactForm [name=contact]").val();
		var privacyVal = $(".spLp_contactForm [name=privacy]").val();
		var useVal = $(".spLp_contactForm [name=use]").val();
		var knewVal = $(".spLp_contactForm [name=knew]").val();

		$(".mi_confirm_name").text(nameVal);
		$(".mi_confirm_company").text(companyVal);
		$(".mi_confirm_tel_number").text(telNumberVal);
		$(".mi_confirm_mail").text(mailVal + "@" + domeinVal);
		$(".mi_confirm_subject").text(subject);
		$(".mi_confirm_contact").text(contactVal);
		$(".mi_confirm_use").text(useVal);
		$(".mi_confirm_knew").text(knewVal);

		$(".mi_confirm_name_input").val(nameVal);
		$(".mi_confirm_company_input").val(companyVal);
		$(".mi_confirm_tel_number_input").val(telNumberVal);
		$(".mi_confirm_mail_input").val(mailVal + "@" + domeinVal);
		$(".mi_confirm_subject_input").val(subject);
		$(".mi_confirm_contact_input").val(contactVal);
		$(".mi_confirm_use_input").val(useVal);
		$(".mi_confirm_knew_input").val(knewVal);

		$("#mi_overlay_confirm").fadeIn("first");
		return false;
	});

	$('.mi_overlay_colose_btn').on('click',function(){
		$(this).parents(".mi_overlay").fadeOut("first");
	});
});

//よくあるお悩みのアコーディオン
$(function(){
	$('.spLp_sales_solution_block').hide();
	$('.spLp_sales_arrow_img').click(function(){
		$('.spLp_commonProblemsList_block_sales').toggleClass('sales_addMarginBottom20');
		$('.spLp_sales_solution_block').slideToggle();
	});
});

$(function(){
	$('.spLp_recruit_solution_block').hide();
	$('.spLp_recruit_arrow_img').click(function(){
		$('.spLp_commonProblemsList_block_recruit').toggleClass('recruit_addMarginBottom20');
		$('.spLp_recruit_solution_block').slideToggle();
	});
});

$(function(){
	$('.spLp_meeting_solution_block').hide();
	$('.spLp_meeting_arrow_img').click(function(){
		$('.spLp_commonProblemsList_block_meeting').toggleClass('meeting_addMarginBottom20');
		$('.spLp_meeting_solution_block').slideToggle();
	});
});

// ルーム接続
function fetchPost(url, formData)
{
  return fetch(url, {
    method: "POST",
    body: formData,
    credentials: "same-origin",
  })
  .catch(error => console.log('Error:', error))
  .then((response) => {
    if (!response.ok) {
      return Promise.reject(new Error(`${response.status}: ${response.statusText}`));
    } else {
      return response.json();
    }
  });
}

$(function(){
	$('.mi_connect_input_button').on('click',function(){
		var room_name = $('.mi_connect_input').val();
		// MCU振り分け
		let fd = new FormData();
		fd.append('room_name', room_name);
		fetchPost('/negotiation/get-negotiation-room-type', fd)
		.then((response) => {
			//console.log(response);
			let negotiation_room_type = response.data.negotiation_room_type || "0";
			if (negotiation_room_type == "0") {
				// /room/
				window.location.assign(location.protocol + "//" + location.host + "/room/" + room_name);
			} else {
				/ rooms/
				fetchPost('/negotiation/update-mcu-server', fd)
				.then((response) => {
					window.location.assign(location.protocol + "//" + location.host + "/rooms/" + room_name);
				})
				.catch((err) => {
					window.location.assign(location.protocol + "//" + location.host + "/rooms/" + room_name);
				});
			}
		})
		.catch((error) => {
			console.log(error);
		});
//		window.location.href = 'https://' + document.domain +'/room/'+roomname
	});
});
</script>

<!-- Facebook Pixel Code -->
<script>
	!function(f,b,e,v,n,t,s)
	{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
	n.callMethod.apply(n,arguments):n.queue.push(arguments)};
	if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
	n.queue=[];t=b.createElement(e);t.async=!0;
	t.src=v;s=b.getElementsByTagName(e)[0];
	s.parentNode.insertBefore(t,s)}(window, document,'script',
	'https://connect.facebook.net/en_US/fbevents.js');
	fbq('init', '251868542198394');
	fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
	src="https://www.facebook.com/tr?id=251868542198394&ev=PageView&noscript=1"
/></noscript>
<!-- End Facebook Pixel Code -->
{/literal}

<script src='https://sales-crowd.jp/js/UrlAccessApi.js' id='sc_api' data-token='95286427608779788828'></script>

</head>
<div class="wrap">
<body>
		<div class="privacy_modal_contents" id="privacy_modal_contents">
				<div class="privacy_modal_message_area">
					<div class="modal_line_area">
						<button class="modal_close_button"style="-webkit-appearance:none; border-radius:0"><img src="/img/sp/svg/modalClose.svg" class="modal_close_icon"></button>
						<h2 class="privacy_title">プライバシーポリシー</h2>
						<div class="privacy_modal_message_main_content">
							<p>株式会社meet in（以下「当社」といいます。）は、個人情報の適切な取り扱いを期しています。当社が提供する「meet in」によるサービス（以下「当サービス」といいます。）へのお申し込みなどの業務において取得する個人情報の取り扱いについて、次のとおり定めます。そのため、お客様におかれましては、以下の事項をご理解いただき、同意の上で個人情報をご提供ください。</p>
							<h3><span class="title_mark">●</span>個人情報の取り扱いについて</h3>
							<p>当社は、お客様の個人情報を適法かつ適正な手段により取得します。</p>
							<h3><span class="title_mark">●</span>個人情報の管理</h3>
							<p>当社は、お客様の個人情報を正確かつ最新の状態に保ち、個人情報への不正アクセス・紛失・破損・改ざん・漏洩などを防止するため、セキュリティシステムの維持・管理体制の整備・ 社員教育の徹底等の必要な措置を講じ、安全対策を実施し個人情報の厳重な管理を行ないます。また、当社が、お客様の個人データの取り扱いを委託する場合には、適切な安全管理措置を講じている協力会社を選定し、委託先に対し必要かつ適切な監督を行います。</p>
							<h3><span class="title_mark">●</span>個人情報の利用目的</h3>
							<p>当社は、お客様の個人情報について、以下の利用目的の範囲内又は、その取得状況から明らかである利用目的の範囲内で利用し、ご本人の同意がある場合又は法令で認められている場合を除き、他の目的で利用しません。</p>
							<ul　class="privacy_list">
								<li class="privacy_list_contents">（1）当サービス利用に関する登録及び個人認証</li>
								<li class="privacy_list_contents">（2）当サービス利用に関する料金請求その他の代金請求及び商品等の引渡し業務等</li>
								<li class="privacy_list_contents">（3）当サービス利用に関する問合せ内容の確認、回答、その他ご要望等への対応</li>
								<li class="privacy_list_contents">（4）当サービスの利用に伴う連絡及び電子メール、資料のご送付</li>
								<li class="privacy_list_contents">（5）当サービスに関連する新サービス、新メニューのご案内並びに調査及び障害連絡</li>
								<li class="privacy_list_contents">（6）当サービスの利用に関する保守及びメンテナンス等の運営</li>
								<li class="privacy_list_contents">（7）当社によるサービスの開発およびマーケティング</li>
								<li class="privacy_list_contents">（8）当社の新サービス、新メニューのご案内等</li>
							</ul>
							<h3><span class="title_mark">●</span>個人情報の第三者への開示・提供の禁止</h3>
							<p>当社は、お客様よりお預かりした個人情報を適切に管理し、次のいずれかに該当する場合を除き、個人情報を第三者（第５項に定める委託先及び第６項の共同利用者を除きます。）に開示いたしません。</p>
							<li class="privacy_list_contents">①　お客様の事前同意がある場合</li>
							<li class="privacy_list_contents">②　法令で認められている場合</li>
							<h3><span class="title_mark">●</span>個人データの委託</h3>
							<p>当社は、業務を円滑に進め、お客様により良いサービスを提供するため、お客様の個人データの取り扱いを協力会社に委託する場合があります。ただし、委託する個人データは、委託する業務を遂行するのに必要最小限の情報に限定します。</p>
							<h3><span class="title_mark">●</span>共同利用</h3>
							<p>当社は、本サービスに関連して、お客様によりよい業務を提供するために、当社のグループ会社である株式会社アイドマ・ホールディングス（以下「共同利用者」といいます。）との間で個人情報を共同利用します。</p>
							<ul　class="privacy_list">
								<li class="privacy_list_contents">（1）共同利用者の利用目的<br>
								①　共同利用者が取り扱う商品・サービス等のお届けおよび回収<br>
								②　共同利用者が展開するサービス等の提供<br>
								③　お客様にとって有用な情報や商品・サービス等の開発、提供及びご案内
								</li>
								<li class="privacy_list_contents">（2）共同利用者の範囲<br>
								株式会社アイドマ・ホールディングス
								</li>
								<li class="privacy_list_contents">（3）共同して利用される個人データの項目<br>
								お客様、又は代表者の名前、住所、電話番号、契約商品、契約サービス、契約金額、契約条件、取引条件
								</li>
								<li class="privacy_list_contents">（4）共同利用に関する責任者
								株式会社アイドマ・ホールディングス
								</li>
							</ul>
							<h3><span class="title_mark">●</span>保有個人データに関する受付</h3>
							<ul　class="privacy_list">
								<li class="privacy_list_contents">（1）お客様又は代理人から保有個人データの利用目的の通知の要請があったときは、次の場合を除き、遅滞なく通知いたします。<br>
								①　お客様ご本人が識別される保有個人データの利用目的が明らかな場合<br>
								②　お客様ご本人又は第三者の生命、身体、財産その他の権利利益を害するおそれがある場合<br>
								③　当社の権利又は正当な利益を害するおそれがある場合<br>
								④　国の機関又は地方公共団体が法令の定める事務を遂行することに対して協力する必要がある場合であって、当該事務の遂行に支障を及ぼすおそれのある場合
								</li>
								<li class="privacy_list_contents">（2）お客様ご本人又は代理人から保有個人データの開示の要請があった場合には、次の場合を除き、遅滞なく通知いたします。<br>
								①　お客様ご本人又は第三者の生命、身体、財産その他の権利利益を害するおそれがある場合<br>
								②　当社の業務の適正な実施に著しい支障を及ぼすおそれがある場合<br>
								③　法令に違反することとなる場合
								</li>
								<li class="privacy_list_contents">（3）お客様ご本人又は代理人から保有個人データの訂正、追加、削除の要請があった場合には、遅滞なく調査を行い、結果に基づき適正な対応を行います。</li>
								<li class="privacy_list_contents">（4）お客様ご本人又は代理人から保有個人データの利用の停止又は消去の要請があった場合に、要請に理由があることが判明したときは、適正な対応を行います。</li>
								<li class="privacy_list_contents">（5）前4項の要請については、必要事項を記載した書面に本人確認書類を添付して第8項のお問い合わせ先まで郵送してください。お客様からご提供いただいた個人情報は、お客様からの要請に対応する目的でのみ使用し厳重に保管いたします。なお、上記郵送いただいた書面及び本人確認書類については、返送はいたしませんので、ご了承ください。</li>
							</ul>
							
							<h3><span class="title_mark">●</span>個人情報の取り扱いに関するお問い合わせ先</h3>
							<p>株式会社meet in　個人情報対応窓口</p>
							<p>住所：〒171-0022 東京都豊島区南池袋2-25-5 藤久ビル東5号館 4F</p>
							<p>電話番号：03-5985-8290</p>
							<p>メール：privacy@meet-in.jp</p>
							<p>担当責任者：個人情報保護管理者</p>

							<h3><span class="title_mark">●</span>プライバシーポリシーの改定について</h3>
							<p>当社は、本プライバシーポリシーの内容を適宜見直し、必要に応じて変更することがあります。その場合、改訂版の公表の日から変更後のプライバシーポリシーが適用されることになります。</p>
						</div>
					</div>
				</div>
			</div>
	<!-- SPLPナビ spLpNav start -->
	<nav class="spLpNav_wrap global_nav">
		<a href="#top">
			<img alt="meet in" src="/img/logo_header.png" class="spLpNav_logo">
		</a>
		<p class="spLpNav_logo_message">Web会議・商談システム</P>
			<!-- <a href="#" class="spLpNav_contactBtn">
				<img src="/img/sp/png/sp_lp_nav_contact_icon.png" class="spLpNav_contactBtn_icon">
				<span class="spLpNav_contactBtnText">お問い合わせ</span>
			</a> -->

			<a href="/index/login" class="spLpNav_loginBtn">
				<img src="/img/sp/png/sp_lp_nav_login_icon.png" class="spLpNav_loginBtn_icon">
				<span class="spLpNav_loginBtnText" id="">ログイン</span>
			</a>
		<!-- <div id="spLpNav_menu">
			<img src="/img/sp/png/sp_lp_nav_menu_icon.png" class="spLpNav_menu_icon">
			<p class="spLpNav_menuText">メニュー</p>
		</div> -->

		{* <div id="spLpNav_menu">
			<input id="spLpNav_menu-input" type="checkbox" class="spLpNav_menu-unshown">
			<label id="spLpNav_menu-open" for="spLpNav_menu-input"><span></span></label>
			<label class="spLpNav_menu-unshown" id="spLpNav_menu-close" for="spLpNav_menu-input"></label>
			<div id="spLpNav_menu-content">ここに中身を入れる</div>
		</div> *}
	</nav>
	<!-- SPLPナビ spLpNav end -->

	<!-- SPLPTOP spLpTop メイン start-->
	<div class="spLpTop_background" id="top">
		<img src="/img/sp/png/earth.png" class="earth_background">
		<img src="/img/sp/png/star.png" class="star_background">
	</div>
	<div class="spLpTopTitle__wrap">
		{* <img src="/img/sp/png/meet-in logo.png" alt="meet in" class="topLogo"> *}
		<p class="spLpTopTitle__wrap">
			面倒なログイン、アプリのダウンロードは一切不要。<br>
			国産オンラインツールでセキュリティ対策も万全。
		</p>
		<p class="spLpTopTitle">PCでもスマホでも、<br>
			1秒でオンラインミーティング</p>
			<div class="spLptop_introduction_wrap">
				<div class="spLptop_pc_introduction_companies_Count">{$introductionCompaniesCount}</div>
				<img alt="1秒で、オンラインミーティング" class="spLptop_pc_woman_img" src="/img/sp/png/sp_lp_top_pc_woman.png">
			</div>
		<a href="#spLp_contact_section">
			<button class="spLpTop_contactBtn" type="button">お問い合わせ</button>
		</a>
	</div>

	<!--
	<div class="sp_top_error_area">
		<p class="connect_alert" style="display: none;"></p>
	</div>
	-->

	{* <div class="topBtn__wrap">
		<div id="transition_login" class="defaultBtn decisionBtn advanceBtn">
			ログイン
		</div>
		<div class="topOptions" id="open">
			<button class="topOptions__btn">●●●</button>
			<span>More options</span>
		</div>
	</div> *}

	<!-- SPLPTOP spLpTop メイン end -->
	<div class="spLpTopConnect__wrap">
		<div class="mi_connect_input_wrap">
			<p class="mi_connect_input_title">接続はこちらから</p>
			<p class="mi_connect_input_text">共有されたルーム名を入力してください。</p>
			<input type="text" placeholder="ルーム名" class="mi_connect_input" />
			<p class="connect_alert" style="display: none;"></p>
			<button class="mi_connect_input_button">接続</button>
		</div>
	</div>

	<!-- SPLP 5分でわかるミートインセクション start -->
	<section class="spLp_twoStep_section" id="spLp_twoStep_section1">
		<div class="spLp_twoStep_section_title_block">
			<h1 class="spLp_twoStep_section_title">5分でわかるミートイン</h1>
			<div class="spLp_twoStep_section_titleLine"></div>
		</div>
		<!--<div class="spLp_twoStep_section_inner_5minute">
			<h2 class="spLp_twoStep_section_inner_title02">ミートインとは</h2>
			<div class="spLp_twoStep_section_inner_movie">
				<a href="https://www.youtube.com/watch?v=nGTzFxnokzE" target="_blank">
					<img alt="ミートインとは動画サムネイル" src="/img/lp/mov_5minute_01.png">
				</a>
			</div>
		</div>-->
		<div class="spLp_twoStep_section_inner_5minute02">
			<h2 class="spLp_twoStep_section_inner_title02">理念・ビジョン</h2>
			<div class="spLp_twoStep_section_inner_movie">
				<a href="https://www.youtube.com/watch?v=dAj0Zq3e9TI" target="_blank">
					<img alt="理念・ビジョン動画サムネイル" src="/img/lp/mov_5minute_02.png">
				</a>
			</div>
		</div>
	</section>
	<!-- SPLP 5分でわかるミートインセクション end -->

	<div class="mi_content_banner_list">
		<p class="mi_content_banner_img_box">
			<a href = "https://pc-rental.meet-in.jp/" target=”_blank” class="mi_top_banner_link">
				<img alt="レンタルPCバナー" class="mi_top_banner_img" src="/img/SP.png">
			</a>
		</p>
		<p class="mi_content_banner_img_box">
			<a href="https://shindan.jmatch.jp/writeup/?meet-in" target=”_blank” class="mi_top_banner_link">
				<img alt="助成金バナー" class="mi_top_banner_img" src="/img/shindan_banr_sp.png">
			</a>
		</p>
		<p class="mi_content_banner_img_box">
			<a href="https://kantuko.com/#index_content_builder" target=”_blank” class="advertisement_banner_link">
				<img alt="ネット回線広告バナー" class="advertisement_banner_img" src="/img/internet_advertisement_banner_sp.png">
			</a>
		</p>
	</div>
	<!-- LPメインバナーリスト end -->

	<!-- SPLP 2ステップで簡単接続！セクション start -->
	<section class="spLp_twoStep_section" id="spLp_twoStep_section2">
		<div class="spLp_twoStep_section_title_block">
			<h1 class="spLp_twoStep_section_title">2ステップで簡単接続！</h1>
			<div class="spLp_twoStep_section_titleLine"></div>
		</div>
		<div class="spLp_twoStep_section_inner">
			<span class="spLp_twoStep_section_bach_count">1</span>
			<h2 class="spLp_twoStep_section_inner_title">URLを作成</h2>
			<div class="aaa"></div>
			<img src="/img/sp/png/sp_lp_create_u.png" class="spLp_createUrl_img">
		</div>
		<div class="spLp_twoStep_section_inner">
			<span class="spLp_twoStep_section_bach_count">2</span>
			<h2 class="spLp_twoStep_section_inner_title">クリックで接続</h2>
			<div class="aaa"></div>
			<img src="/img/sp/png/sp_lp_connection.png" class="spLp_createUrl_img">
		</div>
	</section>
	<!-- SPLP 2ステップで簡単接続！セクション end -->

	<!-- SPLP 下記までお問い合わせください！セクション start -->
	<section class="spLp_contactUs_section">
		<div class="spLp_contactUs_section_inner">
			<p class="spLp_contactUs_section_text">
			機能・料金などmeet inの詳細は<br>下記までお問い合わせください！
			</p>
			<a href="#spLp_contact_section">
				<button class="spLp_contactBtn" type="button">お問い合わせ</button>
			</a>
		</div>
	</section>
	<!-- SPLP 下記までお問い合わせください！セクション end -->

	<!-- SPlP meet inの3つの特徴セクション start -->
	<section class="spLp_threeFeatures_section" id="spLp_threeFeatures_section">
		<h2 class="spLp_threeFeatures_section_title">meet inの3つの特徴</h2>
		<div class="spLp_threeFeatures_section_titleLine"></div>
		<!--簡単・らくらくstart-->
		<img src="/img/sp/png/sp_lp_simple_easy.png" id="spLp_simple_easy_img1">
		<p class="spLp_threeFeatures_section_Num">1</p>
		<h3 class="spLp_threeFeatures_1_title">簡単・らくらく</h3>
		<div class="spLp_threeFeatures_1_titleLine"></div>
		<h4 class="spLp_threeFeatures_1_subTitle">
			いつでも、どこでも<br>URLを作成するだけ
		</h4>
		<p class="spLp_threeFeatures_1_text">
			meet in用のURLを共有するだけで接続スタート。<br>
			アプリのダウンロードやログイン・固定回線は<br>一切不要です。
		</p>
		<!--簡単・らくらくend-->

		<!--便利・使いやすいstart-->
		<img alt="便利・使いやすい" src="/img/sp/png/sp_lp_convenient.png" id="spLp_simple_easy_img2">
		<p class="spLp_threeFeatures_section_Num">2</p>
		<h3 class="spLp_threeFeatures_1_title">便利・使いやすい</h3>
		<div class="spLp_threeFeatures_1_titleLine"></div>
		<h4 class="spLp_threeFeatures_1_subTitle">
			ビジネスシーンで<br>活躍する機能が満載
		</h4>
		<p class="spLp_threeFeatures_1_text">
			資料共有機能や会議の議事録機能など、<br>
			ビジネスシーンで活躍する機能が満載。<br>
			新機能も随時アップデートしています。
		</p>
		<!-- <a href="#">
			<button class="spLp_check_detailsBtn">
				<span class="spLp_check_detailsBtn_text">詳細を見る</span>
			</button>
		</a> -->
		<!--便利・使いやすいend-->

		<!--安心・サポートstart-->
		<img alt="安心・サポート" src="/img/sp/png/sp_lp_support.png" id="spLp_simple_easy_img3">
		<p class="spLp_threeFeatures_section_Num">3</p>
		<h3 class="spLp_threeFeatures_1_title">安心・サポート</h3>
		<div class="spLp_threeFeatures_1_titleLine"></div>
		<h4 class="spLp_threeFeatures_1_subTitle">
			オンラインの活用が<br>初めてでも安心
		</h4>
		<p class="spLp_threeFeatures_1_text">
			使い方がわからないなど、活用に不安なことは<br>
			お問い合わせください。丁寧にサポートいたします。
		</p>
		<!--安心・サポートend-->
	</section>
	<!-- SPlP meet inの3つの特徴セクション end -->

	<!-- SPLP 下記までお問い合わせください！セクション start -->
	<section class="spLp_contactUs_section">
		<div class="spLp_contactUs_section_inner">
			<p class="spLp_contactUs_section_text">
			機能・料金などmeet inの詳細は<br>下記までお問い合わせください！
			</p>
			<a href="#spLp_contact_section">
				<button class="spLp_contactBtn" type="button">お問い合わせ</button>
			</a>
		</div>
	</section>
	<!-- SPLP 下記までお問い合わせください！セクション end -->

	<!-- SPLP よくあるお悩み start-->
	<section class="spLp_commonProblemsList_section_wrap">
		<h3 class="spLp_commonProblemsList_section_subTitle">meet inで商談・ミーティングをオンライン化</h3>
		<h2 class="spLp_commonProblemsList_section_title">移動時間＆コストを削減！</h2>
		<div class="spLp_commonProblemsList_section_titleLine"></div>
		<h4 class="spLp_commonProblemsList_section_mainTitle">よくあるお悩み</h4>

		<!--SPLP 営業時の悩み start-->
		<div class="spLp_commonProblemsList_block_sales sales_addMarginBottom20">
			<p class="spLp_commonProblemsList_block_title">営業時の悩み</p>
			<div class="spLp_commonProblemsList_inner_sales">
				<img alt="営業時の悩み" class="spLp_commonProblem_img" src="/img/sp/png/sp_lp_sales_problem.png">
				<div class="spLp_commonProblemsList_innerTextWrap">
					<p class="spLp_commonProblemsList_inner_subTitle">移動時間が長い</p>
					<p class="spLp_commonProblemsList_inner_description">商談の度に移動する時間が<br>もったいない…。</p>
				</div>
				<img class="spLp_sales_arrow_img" src="/img/sp/png/sp_lp_arrow.png">
			</div>
			<!--arrowをクリックすると営業時の悩みの解決策が開く start-->
			<div class="spLp_sales_solution_block" id="spLp_sales_solution_block">
				<p class="spLp_solution_mainTitle">解決策</p>
				<p class="spLp_solution_title">
				meet inで商談をオンライン化し、<br>移動時間を削減！<br>商談件数も2倍以上にアップ</p>
				<img alt="営業の解決策" class="spLp_solution_img" src="/img/sp/png/sp_lp_sales_solution.png">
			</div>
			<!--arrowをクリックすると営業時の悩みの解決策が開く end-->
		</div>
		<!--SPLP 営業時のなやみ end-->

		<!--SPLP 採用時の悩み start-->
		<div class="spLp_commonProblemsList_block_recruit recruit_addMarginBottom20">
			<p class="spLp_commonProblemsList_block_title">採用時の悩み</p>
			<div class="spLp_commonProblemsList_inner_recruit">
				<img alt="採用時の悩み" class="spLp_commonProblem_img" src="/img/sp/png/sp_lp_recruit_problem.png">
				<div class="spLp_commonProblemsList_innerTextWrap">
					<p class="spLp_commonProblemsList_inner_subTitle">採用の効率が悪い</p>
					<p class="spLp_commonProblemsList_inner_description">採用に関する手間を少なくし、<br>効率良く行いたい…。</p>
				</div>
				<img class="spLp_recruit_arrow_img" src="/img/sp/png/sp_lp_arrow.png">
			</div>
			<!--arrowをクリックすると採用時の悩みの解決策が開く start-->
			<div class="spLp_recruit_solution_block" id="spLp_recruit_solution_block">
				<p class="spLp_solution_mainTitle">解決策</p>
				<p class="spLp_solution_title">
				meet inで面接をオンライン化し、<br>無駄な手順を削減！<br>採用の効率が上がった！</p>
				<img alt="採用の解決策" class="spLp_solution_img" src="/img/sp/png/sp_lp_recruit_solution.png">
			</div>
			<!--arrowをクリックすると採用時の悩みの解決策が開く end-->
		</div>
		<!--SPLP 採用時の悩み end-->

		<!--SPLP 会議での悩み start-->
		<div class="spLp_commonProblemsList_block_meeting meeting_addMarginBottom20 no_margin_bottom">
			<p class="spLp_commonProblemsList_block_title">会議時の悩み</p>
			<div class="spLp_commonProblemsList_inner_meeting">
				<img alt="会議での悩み" class="spLp_commonProblem_img" src="/img/sp/png/sp_lp_meeting_problem.png">
				<div class="spLp_commonProblemsList_innerTextWrap">
					<p class="spLp_commonProblemsList_inner_subTitle">コストがかかる</p>
					<p class="spLp_commonProblemsList_inner_description">会議の度にかかる交通費と時間が<br>もったいない…。</p>
				</div>
				<img class="spLp_meeting_arrow_img meeting_solution" src="/img/sp/png/sp_lp_arrow.png">
			</div>
			<!--arrowをクリックすると会議での悩みの解決策が開く start-->
			<div class="spLp_meeting_solution_block" id="spLp_meeting_solution_block">
				<p class="spLp_solution_mainTitle">解決策</p>
				<p class="spLp_solution_title">
				meet inで会議をオンライン化し、<br>交通費と移動時間を削減！<br>会議に時間をかけることが出来るように</p>
				<img alt="会議の解決策" class="spLp_solution_img" src="/img/sp/png/sp_lp_meeting_solution.png">
			</div>
			<!--arrowをクリックすると会議での悩みの解決策が開く end-->
		</div>
		<!--SPLP 会議での悩み end-->
	</section>
	<!-- SPLP よくあるお悩み end-->

	<!-- SPLP 下記までお問い合わせください！セクション start -->
	<section class="spLp_contactUs_section background_star">
		<div class="spLp_contactUs_section_inner">
			<p class="spLp_contactUs_section_text">
			機能・料金などmeet inの詳細は<br>下記までお問い合わせください！
			</p>
			<a href="#spLp_contact_section">
				<button class="spLp_contactBtn" type="button">お問い合わせ</button>
			</a>
		</div>
	</section>
	<!-- SPLP 下記までお問い合わせください！セクション end -->

	<!-- SPLP meet in導入事例 セクション start-->
	<section class="spLp_case_study_section" id="spLp_case_study_section">
		<div class="spLp_case_study_section_title_block">
			<h1 class="spLp_case_study_section_title">2019年から、{$introductionCompaniesCount}社がmeet inで<br>業務を効率化しています。</h1>
			<div class="spLp_case_study_section_titleLine"></div>
		</div>

		<!-- SPLP meet in 株式会社ニテンイチ様 セクション start-->
		<!-- <section class="spLp_case_1_section">
			<div class="spLp_case_1_block">
				<img src="/img/sp/case/01/1.png" class="spLp_case_1_img">
				<div class="spLp_case_1_textWrap">
					<h2 class="spLp_case_1_companyName">株式会社ニテンイチ様</h2>
					<p class="spLp_case_1_companyComment">meet inを導入することで<br>1回の打ち合わせ時間が1/3になりました!</p>
				</div>
				<a href="#">
					<button class="spLp_check_detailsBtn">
						<span class="spLp_check_detailsBtn_text">詳細を見る</span>
					</button>
				</a>
			</div>
		</section> -->
		<!-- SPLP meet in 株式会社ニテンイチ様 セクション end-->
	</section>
	<!-- SPLP meet in導入事例 セクション end-->

	<!-- SPLP 料金・機能に関して、その他お問い合わせ start-->
	<section class="spLp_contact_section" id="spLp_contact_section">
		<div id="spLp_contact_section_block">
			<h2 class="spLp_contact_section_title">
			料金・機能に関して、その他<br>お問い合わせ
			</h2>
			<p class="spLp_contact_section_subTitle">
			meet inに関するお問い合わせ、お申し込みは下記<br>
			に必要事項をご入力の上お問い合わせください。<br>
			担当者より追って詳細のご案内をさせていただきます。
			</p>
			<form action="/lp/complete.php" class="spLp_contactForm" method="post">
				<div class="spLp_contactForm_block">
					<p class="spLp_contactForm_title"><span class="spLp_contactForm_required">必須</span>氏名</p>
					<input class="spLp_contactForm_input_text spLp_contactForm_input_text_m" name="name" placeholder="田中 太郎" required="" type="text">
				</div>
				<div class="spLp_contactForm_block">
					<p class="spLp_contactForm_title"><span class="spLp_contactForm_required">必須</span>会社名<br>
					<span class="spLp_contactForm_confilm_text">（個人事業主の場合は氏名を再度入力してください。）</span>
					</p>
					<input class="spLp_contactForm_input_text spLp_contactForm_input_text_l" name="company" placeholder="株式会社meet in" required="" type="text">
				</div>
				<div class="spLp_contactForm_block">
					<p class="spLp_contactForm_title"><span class="spLp_contactForm_required">必須</span>電話番号</p>
					<input class="spLp_contactForm_input_text spLp_contactForm_input_text_m" name="tel_number" placeholder="000-0000-0000" required="" type="text">
				</div>
				<div class="spLp_contactForm_block">
					<p class="spLp_contactForm_title"><span class="spLp_contactForm_required">必須</span>メールアドレス</p>
					<input class="spLp_contactForm_input_text spLp_contactForm_input_text_ml" name="mail" placeholder="aaaaaaaaaaaaaaa" required="" type="text">
					<span class="spLp_contactForm_text_atmark">@</span>
					<input class="spLp_contactForm_input_text spLp_contactForm_input_text_s" name="domein" placeholder="aaaa.jp" required="" type="text">
				</div>

				<div class="spLp_contactform_block">
					<p class="spLp_contactForm_title"><span class="spLp_contactForm_required">必須</span>件名</p>
					<select class="spLp_form_selectbox spLp_contactForm_input_text spLp_contactForm_input_text_m" name="subject">
						<option value="お申し込みについて">お申し込みについて</option>
						<option value="ご契約について">ご契約について</option>
						<option value="トラブルについて">トラブルについて</option>
						<option value="その他">その他</option>
					</select>
				</div>

				<div class="spLp_contactForm_block">
					<p class="spLp_contactForm_title">お問い合わせ内容</p>
					<textarea class="spLp_contactForm_input_text spLp_contactForm_textArea" name="contact" placeholder="お問い合わせ内容を記載して下さい。"></textarea>
				</div>
				<div class="spLp_contactForm_block">
					<p class="spLp_contactForm_title">使用用途</p>
					<input class="spLp_contactForm_input_text spLp_contactForm_input_text_l" name="use" placeholder="例：ミーティング、営業など" type="text">
				</div>
				<div class="spLp_contactForm_block" >
					<p class="spLp_contactForm_title" id="spLp_contactForm_last_title">どちらで知りましたか？</p>
					<label for="mi_knew_check_1"><input class="mi_contactform_checkbox" id="mi_knew_check_1" name="knew" required="" type="radio" value="meet inからのご提案" checked>meet inからのご提案</label><br />
					<label for="mi_knew_check_2"><input class="mi_contactform_checkbox" id="mi_knew_check_2" name="knew" required="" type="radio" value="代理店からのご提案">代理店からのご提案</label>
				</div>
				<p class="spLp_contactForm_text">
					<input class="spLp_contactForm_checkbox" id="spLp_contactForm_checkbox" name="privacy" required="" type="checkbox">
					<label for="spLp_privacy_check">
					<a href="javascript:void" class="spLp_overlay_privacy_open" id="spLp_overlay_privacy_open">
					個人情報の取り扱いについて</a><br>
					<span class="spLp_privacy_check_text">承諾しました。</span>
					</label>
				</p>
				<div class="spLp_contactForm_send_wrap">
					<a href="javascript:void"><button class="spLp_contactForm_send mi_overlay_confirm_open">確認画面へ</button></a>
				</div>
			</form>
		</div>
	</section>
	<!-- SPLP 料金・機能に関して、その他お問い合わせ end-->

	<!-- SPLP フッターセクション start -->
	<footer class="spLp_footer">
		<!-- <div class="spLp_footer_wrap">
			<a href="" class="spLp_footer_list">
			TOP</a>
			<a href="" class="spLp_footer_list">
			会社概要</a>
			<a href="" class="spLp_footer_list">
			FAQ</a>
			<a href="" class="spLp_footer_list">
			お問い合わせ</a>
		</div> -->
		<img alt="meet in" class="mi_footer_img" src="/img/lp/rogo-meetin-footer.png">
	</footer>
	<!-- SPLP フッターセクション end -->



	<!-- お問合せ内容確認ポップアップコンテンツコンテンツ begin -->
	<div class="mi_overlay mi_overlay_confirm" id="mi_overlay_confirm">
		<div class="mi_modal_shadow"></div>
		<div class="mi_overlay_wrap mi_overlay_confirm_wrap">
			<div class="mi_overlay_contents mi_confirm_block">
				<div class="mi_overlay_colose">
					<a class="mi_overlay_colose_btn" href="javascript:void(0)"><img alt="閉じる" class="mi_privacy_close_img" src="/img/lp/ico-close.png"><br>
					閉じる</a>
				</div>
				<div class="mi_overlay_contents_title mi_confirm_title_wrap">
					<img alt="meet in" class="mi_confirm_title_img" src="/img/lp/rogo.png">
					<h2 class="mi_confirm_title">お問い合わせ<br>
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
						<th>件名</th>
						<td class="mi_confirm_subject"></td>
					</tr>
					<tr>
						<th>お問い合わせ内容</th>
						<td class="mi_confirm_contact"></td>
					</tr>
					<tr>
						<th>使用用途</th>
						<td class="mi_confirm_use"></td>
					</tr>
					<tr>
						<th>どちらで知りましたか？</th>
						<td class="mi_confirm_knew"></td>
					</tr>
				</table>
				<form action="/lp/complete.php" class="mi_confirm_form" id="mi_confirm_send_form" method="post" name="mi_confirm_send_form">
					<input class="mi_confirm_name_input mi_confirm_input_req" name="confirm_name" type="hidden">
					<input class="mi_confirm_company_input mi_confirm_input_req" name="confirm_company" type="hidden">
					<input class="mi_confirm_tel_number_input mi_confirm_input_req" name="confirm_tel" type="hidden">
					<input class="mi_confirm_mail_input mi_confirm_input_req" name="confirm_mail" type="hidden">
					<input class="mi_confirm_subject_input mi_confirm_input_req" name="confirm_subject" type="hidden">
					<input class="mi_confirm_contact_input mi_confirm_input_req" name="confirm_contact" type="hidden">
					<input class="mi_confirm_use_input" name="confirm_use" type="hidden">
					<input class="mi_confirm_knew_input" name="confirm_knew" type="hidden">
					<input type="hidden" name="confirm_type" class="mi_confirm_type_input" value="お問い合わせ">
					<button class="mi_default_button mi_confirm_send">送信</button>
				</form>
			</div>
		</div>
	</div>
	<!-- お問い合わせ内容確認 end -->


</body>
</div> <!-- wrap end --->
</html>
