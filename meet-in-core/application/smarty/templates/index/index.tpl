<!DOCTYPE html>
<html lang="ja" prefix="og: http://ogp.me/ns# fb: http://ogp.me/ns/fb# article: http://ogp.me/ns/article#">
	<head>
		<!-- facebook OGP関連 start -->
			<meta property="og:title" content="meet in（ミートイン） | いつでも、どこでも1秒でweb会議"/>
			<meta property="og:type" content="website"/>
			<meta property="og:description" content="meet in（ミートイン）は、いつでも、どこでも簡単にweb会議ができる、オンラインコミュニケーションプラットフォームです。アプリのインストールは不要、すぐに始められます。" />
			<meta property="og:url" content="https://meet-in.jp/"/>
			<meta property="og:image" content="https://meet-in.jp/img/meet_in_ogp.png"/>
			<meta property="og:site_name" content="meet in（ミートイン）"/>
			<meta property="og:locale" content="ja_JP"/>
			<meta content="IE=edge" http-equiv="X-UA-Compatible">
			<meta property="fb:app_id" content="939268253193590"/>
		<!-- facebook OGP関連 end -->
		<title>
			meet in（ミートイン） | いつでも、どこでも1秒でweb会議
		</title>
		<meta charset="utf-8">
		<meta content="meet in（ミートイン）は、いつでも、どこでも簡単にweb会議ができる、オンラインコミュニケーションプラットフォームです。アプリのインストールは不要、すぐに始められます。" name="description">
		<meta content="web 会議　webミーティング　オンラインコミュニケーション　インストール不要　簡単" name="keywords">
		<meta content="" name="author">
		<link href="/img/favicon.ico" rel="shortcut icon">
		<link href="/css/fonts.css?{$application_version}" rel="stylesheet">
		<link href="/css/ie7.css?{$application_version}" rel="stylesheet">
		<link href="https://fonts.googleapis.com/css?family=Roboto+Slab" rel="stylesheet">
		<link href="/css/contract.css?{$application_version}" rel="stylesheet">
		<link href="/css/reset.css?{$application_version}" rel="stylesheet">
		<link href="/css/base.css?{$application_version}" rel="stylesheet">
		<link href="/css/page.css?{$application_version}" rel="stylesheet">
		<link href="/css/design.css?{$application_version}" rel="stylesheet">
		<link href="/css/top.css?{$application_version}" rel="stylesheet">
		<link href="/css/jquery-ui.css?{$application_version}" rel="stylesheet">
		<link rel="stylesheet" href="css/swiper.css">
		<script src="/js/jquery-1.11.2.min.js">
		</script>
		<script src="/js/jquery-ui.min.js">
		</script>
		<script src="/js/common.js">
		</script>
		<script src="https://maps.google.com/maps/api/js?key=AIzaSyCLGauYoFE65XpHa8SIQIE1lDIkwR3Znxk">
		</script>
		<script src="/js/index/top.js">
		</script>
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

				gtag('set', 'dimension1' , SURFPOINT.getOrgName()); //組織名
				gtag('set', 'dimension2' , SURFPOINT.getOrgUrl()); //組織 URL
				gtag('set', 'dimension3' , getIndL(SURFPOINT.getOrgIndustrialCategoryL())); //業種大分類
				gtag('set', 'dimension4' , getEmp(SURFPOINT.getOrgEmployeesCode())); //従業員数
				gtag('set', 'dimension5' , getTime()); //アクセス時刻
				gtag('set', 'dimension6' , getIpo(SURFPOINT.getOrgIpoType()));
				gtag('set', 'dimension7' , getCap(SURFPOINT.getOrgCapitalCode()));
				gtag('set', 'dimension8' , getGross(SURFPOINT.getOrgGrossCode()));
				gtag('set', 'dimension9' , SURFPOINT.getCountryJName());
				gtag('set', 'dimension10' , SURFPOINT.getPrefJName());
				gtag('set', 'dimension11' , SURFPOINT.getLineJName());
				gtag('send', 'pageview');
			</script>
		<script>
			//ヒートマップ用
			(function(add, cla){window['UserHeatTag']=cla;window[cla]=window[cla]||function(){(window[cla].q=window[cla].q||[]).push(arguments)},window[cla].l=1*new Date();var ul=document.createElement('script');var tag = document.getElementsByTagName('script')[0];ul.async=1;ul.src=add;tag.parentNode.insertBefore(ul,tag);})('//uh.nakanohito.jp/uhj2/uh.js', '_uhtracker');_uhtracker({id:'uhu7hYUpVC'});
			
			//スムーズスクロール部分の記述
			$(function(){
			   $('a[href^=#]').click(function() {
			      var speed = 400; // ミリ秒
			      var href= $(this).attr("href");
			      var target = $(href == "#" || href == "" ? 'html' : href);
			      var position = target.offset().top - 80;

						if(href!="#mi_overlay_confirm" && href!="#mi_overlay_privacy"){
			      	$('body,html').animate({scrollTop:position}, speed, 'swing');
							return false;
						}
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
				}

			});
			$(function(){
				$('.modal_open').on('click',function(){
					var modaltraget = "." + $(this).attr("id");
					$(modaltraget).fadeIn("first");
				});
			});

			//プライバシーモーダル
			$(function() {
				$('.mi_overlay_privacy_open').click(function(){
					$('#mi_overlay_privacy').fadeIn();
				});
			});

			locateCenter();
			$(window).resize(locateCenter);
			function locateCenter() {
				let w = $(window).width();
				let h = $(window).height();

				let cw = $('#trial_modal').outerWidth();
				let ch = $('#trial_modal').outerHeight();

				$('#trial_modal').css({
				'left': ((w - cw) / 2) + 'px',
				'top': ((h - ch) / 2) + 'px'
				});
			};
			//オーバーレイ
			$(function(){

			  $( 'form.contactform').submit(function(event){
			    event.preventDefault();
			    var nameVal = $(".contactform [name=name]").val();
			    var companyVal = $(".contactform [name=company]").val();
			    var telNumberVal = $(".contactform [name=tel_number]").val();
			    var mailVal = $(".contactform [name=mail]").val();
			    var domeinVal = $(".contactform [name=domein]").val();
			    var subject = $(".contactform [name=subject]").val();
					var contactVal = $(".contactform [name=contact]").val();
			    var privacyVal = $(".contactform [name=privacy]").val();
			    var useVal = $(".contactform [name=use]").val();
					var knewVal = $(".contactform [name=knew]:checked").val();

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

			// ルーム接続
			$(function(){
				$('.mi_connect_input_button').on('click',function(){
					var roomname = $('.mi_connect_input').val();
					window.location.href = 'https://' + document.domain +'/room/'+roomname
				});
				$('.mi_connect_input').keypress(function(event){
					if(event.keyCode === 13) {
						var roomname = $('.mi_connect_input').val();
						window.location.href = 'https://' + document.domain +'/room/'+roomname
					}
				})
			});

			window.addEventListener('DOMContentLoaded', function() {
				var mySwiper = new Swiper ('#mv', {
				loop: true,
				spaceBetween: 20,
				slidesPerView: 'auto',
				autoplay:true,
					pagination: {
						el: '.swiper-pagination',
						clickable: true
					},

					breakpoints: {
						767: {
						slidesPerView: 1,
						spaceBetween: 10
						}
					}
				})
			}, false);

			// ホスト待機中画面で使用するsession値を空にする（ブラウザバックや×閉じ対策）
			// ホスト待機中を判定するフラグをオフ(0)にする 0: 非待機中 1:待機中
			sessionStorage.setItem('waiting_host_flg', 0);
			// ホスト待機中画面で入力した名前を空にする
			sessionStorage.setItem('session_input_name', '');
			
		{/literal}
		</script>
		<style>
		{literal}
			.mi_overlay {
				position: fixed;
			}
		{/literal}
		</style>

		<!-- Facebook Pixel Code -->
		<script>
			{literal}
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
			{/literal}
		</script>
		<noscript><img height="1" width="1" style="display:none"
		  src="https://www.facebook.com/tr?id=251868542198394&ev=PageView&noscript=1"
		/></noscript>
		<!-- End Facebook Pixel Code -->
		<script src="https://www.google.com/recaptcha/api.js?render=6LcclqkaAAAAAK8QSmXxr1o5_uHK1bz2kbsc8QB-"></script>
		<script>
		{literal}
		grecaptcha.ready(function() {
				grecaptcha.execute('6LcclqkaAAAAAK8QSmXxr1o5_uHK1bz2kbsc8QB-', {action: 'homepage'}).then(function(token) {
		var recaptchaResponse = document.getElementById('recaptchaResponse');
					recaptchaResponse.value = token;
				});
		});
		{/literal}
		</script>
		<script src='https://sales-crowd.jp/js/UrlAccessApi.js' id='sc_api' data-token='95286427608779788828'></script>

</head>
	<body>
	<!-- LPナビゲーション start -->
	<nav class="mi_lpmain_nav_wrap">
		<div class="mi_lpmain_nav" id="mi_lp_top_nav">
			<div class="mi_lpmain_nav_block">
				<div class="mi_lp_nav_logo_wrap">
					<img alt="meet in" src="/img/logo_header.png" class="mi_lp_nav_logo" onclick="location.href='#'">
					<p class="mi_lp_nav_logo_side_message">Web会議・商談システム</P>
				</div>
				<ul class="mi_lpmain_nav_inner mi_js_scroll mi_clearfix">
					<li>
						<a href="#mi_two_step_section">使い方</a>
					</li>
					<li>
						<a href="#mi_three_features_section">特徴</a>
					</li>
					<li>
						<a href="/lp/lp_function.html">機能紹介</a>
					</li>
					<li>
						<a href="#mi_common_problems_list_section">活用方法</a>
					</li>
					<li>
						<a href="#mi_case_study_section">導入事例</a>
					</li>
				</ul>
				<div class="mi_lp_nav_button_wrap">
					<a href="#mi_contact_section" class="mi_lp_nav_button mi_lp_nav_contact_button">
						<span class="mi_lp_nav_contact_button_text">お問い合わせ</span>
					</a>
					<a href="/index/login" class="mi_lp_nav_button mi_lp_nav_rogin_button">
						<span class="mi_lp_nav_rogin_button_text" id="lp-rogin-button">ログイン</span>
					</a>
				</div>
			</div>
		</div>
	</nav>
	<!-- LPナビゲーション end -->

	<!-- wrap start -->
	<div class="lp_wrap" id="mi_wrap">
		<!-- メインコンテンツ start -->
		<div class="mi_clearfix mi_top_visual" id="mi_top_visual">
			<!-- ヘッダー start -->
			<header class="lp_header mi_clearfix" id="lp_header">
				<!-- ヘッダー左 start -->
				<div class="mi_flt-l">
				</div>
				<!-- ヘッダー左 end -->
			</header>
			<!-- ヘッダー end -->

			<!-- LPメインビジュアル start -->
			<div class="mi_top_visual_inner">
				<div class="mi_top_visual_img_wrap">
					<img alt="" class="mi_top_visual_img" src="/img/lp/main-grobe.png">
				</div>
				<div class="mi_connect_from">
					<div class="lp_title_wrap">
						<p class="mi_cach_subtext">面倒なログイン、アプリのダウンロード不要。</p>
						<p class="mi_cach_subtext">国産オンラインツールでセキュリティ対策も万全。</p>
						<p class="mi_cach_text">PCでもスマホでも<br>1秒でオンラインミーティング</p>
						<div class="mi_top_introduction_companies_Count">{$introductionCompaniesCount}</div>
						<img alt="1秒で、オンラインミーティング" class="mi_top_pc_woman_img" src="/img/lp/top_pc_woman.png">
				    	<div class="mi_connect_input_wrap">
					    	<p class="mi_connect_input_title">接続はこちらから</p>
					    	<p class="mi_connect_input_text">共有されたルーム名を入力してください。</p>
					    	<input type="text" placeholder="ルーム名" class="mi_connect_input" />
					    	<button class="mi_connect_input_button">接続</button>
					    	<p class="connect_alert" style="display: none;"></p>
				    	</div>
					</div>
					{* <button id="openTrialmodal" class="cta_btn_top mi_btn_bg_orange" name="button" type="button">
						今すぐ無料で試す
					</button> *}
				</div>
			</div>
			
			<!--swiper_area-->
			<div id="mv_area">
				<div class="mv-inner container">
					<div id="mv" class="swiper-container">
						<div class="swiper-wrapper">
							{foreach from=$list item=item}
							<div class="swiper-slide">			
								<a href ="{$item.link_url}">
									<figure>
										<img src ="{$item.image}"/>
									</figure>
								</a>
								<div class="cat_wrap">
									<div class="cat_circle"><span><a href="{$item.works_type[0].url}">{$item.works_type[0].name}</a></span></div>
									<div class="tit"><a href ="{$item.link_url}">{$item.title}</a></div>
								</div>
								<div class="box_area">
									<ol>
										{foreach from=$item.work_cat item=tag}
											<li><a href="{$tag.url}">#{$tag.name}</a></li>
										{/foreach}
									</ol>
									<div class="area"><a href="{$item.works_area[0].url}">{$item.works_area[0].name}</a></div>
								</div>
								<!--box_area-->
							</div>
							<!--swiper-slide-->
							{/foreach}
						</div>
						<!--swiper-wrapper-->
						<div class="swiper-pagination"></div>
					</div>
					<!--swiper-container-->
				</div>
				<!--container-->
			</div>
			<!--mv_area-->

			<!-- LP 5分でわかるミートインセクション start-->
			<section class="mi_top_section mi_two_step_section mi_clearfix" id="mi_two_step_section">
				<div class="mi_top_section_title_block">
					<h2 class="mi_top_section_title">5分でわかるミートイン</h2>
					<div class="mi_two_step_section_title_line"></div>
				</div>
				<div class="mi_two_step_section_inner mi_clearfix">
					<div class="mi_two_step_section_inner_5minute01">
						<h3 class="mi_two_step_section_inner_title02">ミートインとは</h3>

						<div id="modal-content">
							<div class="inner">
								<div id="player"></div>
							</div>
						</div>

						<ul class="list-link-01">
							<li>
								<a class="button-link" data-video-id="ax013rfDwxg"><img alt="ミートインとは動画サムネイル" src="/img/lp/mov_5minute_01.png" ></a>
							</li>
						</ul>

					</div>

					<div class="mi_two_step_section_inner_5minute02">
						<h3 class="mi_two_step_section_inner_title02">理念・ビジョン</h3>

						<div id="modal-content">
							<div class="inner">
								<div id="player"></div>
							</div>
						</div>

						<ul class="list-link-01">
							<li>
								<a class="button-link" data-video-id="dAj0Zq3e9TI"><img alt="meet in 紹介動画" src="/img/lp/mov_5minute_02.png"></a>
							</li>
						</ul>
						</div>

					</div>
					
			</section>
			<!-- LP 5分でわかるミートインセクション end-->

			<div class="mi_content_banner_list">
				<p class="mi_content_banner_img_box">
					<a href = "https://pc-rental.meet-in.jp/" target=”_blank” class="mi_top_banner_link">
						<img alt="レンタルPCバナー" class="mi_top_banner_img" src="/img/PC.png">
					</a>
				</p>
				<p class="mi_content_banner_img_box">
					<a href="https://shindan.jmatch.jp/writeup/?meet-in" target=”_blank” class="mi_top_banner_link">
						<img alt="助成金バナー" class="mi_top_banner_img" src="/img/shindan_banr_pc.png">
					</a>
				</p>
				<p class="mi_content_banner_img_box">
					<a href="https://kantuko.com/#index_content_builder" target=”_blank” class="mi_top_banner_link">
						<img alt="光回線広告バナー" class="mi_top_banner_img internet_advertisement_img" src="/img/internet_advertisement_banner_pc.png">
					</a>
				</p>
			</div>
			<!-- LPメインバナーリスト end -->

			<!-- LP 2ステップで簡単接続！セクション start-->
			<section class="mi_top_section mi_two_step_section mi_clearfix" id="mi_two_step_section">
				<div class="mi_top_section_title_block">
					<h2 class="mi_top_section_title">2ステップで簡単接続！</h2>
					<div class="mi_two_step_section_title_line"></div>
				</div>
				<div class="mi_two_step_section_inner mi_clearfix">
					<div class="mi_two_step_section_inner_step1">
						<span class="bach_count">1</span>
						<h3 class="mi_two_step_section_inner_title">URLを作成</h3>
					</div>
					<div class="mi_two_step_section_inner_step2">
						<span class="bach_count">2</span>
						<h3 class="mi_two_step_section_inner_title">クリックで接続</h3>
					</div>
					<img src="/img/lp/top_two_step.png" class="top_two_step_img">
				</div>
			</section>
			<!-- LP 2ステップで簡単接続！セクション end-->

			<!-- LP 下記までお問い合わせください！セクション start -->
			<section class="mi_top_section mi_contactUs_section mi_clearfix">
				<div class="mi_contactUs_section_block">
					<p class="mi_contactUs_section_text">機能・料金などmeet inの詳細は下記までお問い合わせください！</p>
					<a href="#mi_contact_section">
						<button class="mi_btn_bg_orange mi_contactUs_btn" type="button">お問い合わせ</button>
					</a>
				</div>
			</section>
			<!-- LP 下記までお問い合わせください！セクション end -->

			<!-- LP トライアル モーダル start -->
			{* <div class="trial_modal" id="trial_modal">
				<div class="trial_modal_content">
					<img alt="meet in" src="/img/lp/ico-top.png">
					<button type="button" id="trial_modal_close_btn" class="trial_modal_close_btn">
						<span class="trial_modal_close_btn_icon" for="trial_modal_close_btn"></span>
						<label for="trial_modal_close_btn" class="trial_modal_close_btn_text">閉じる</label>
					</button>
					<div class="trial_modal_complete_registration">
						<p class="trial_modal_complete_registration_text">1分で<br>登録完了</p>
					</div>
					<h1 class="trial_modal_title">meet inの<br>無料トライアルを<br>申し込む</h1>
					<p class="trial_modal_subTitle">メールアドレスを入力してください。
					<br>無料トライアルのご案内と接続URLをお送りいたします。</p>
					<input type="email" name="email" class="trial_input_email"
					placeholder="メールアドレスを入力してください。" required>
					<button type="submit" value="送信" class="trial_email_send_btn">送信</button>
				</div>
			</div> *}

			<!-- トライアルモーダルお問い合わせありがとうございます。start-->
			{* <div class="trial_thanks_modal" id="">
				<div>
				<img alt="meet in" src="/img/logo_header.png" class="">
				<h1>お問い合わせありがとうございます。</h1>
				<p>追って担当者より、詳細のご連絡をさせていただきます。
				<br>今しばらくお待ち下さい。</p>
				<button>閉じる</button>
			</div>
			</div> *}
			<!-- トライアルモーダルお問い合わせありがとうございます。end-->
			<!-- トライアルモーダル end -->

			<!-- LP meet inの3つの特徴セクション start -->
			<section class="mi_top_section mi_three_features_section mi_clearfix" id="mi_three_features_section">
				<div class="mi_top_section_title_block">
					<h2 class="mi_top_section_title">
						meet inの3つの特徴
					</h2>
					<div class="mi_three_features_section_title_line"></div>
				</div>

				<!-- LP 特徴1 start -->
				<div class="mi_three_features_section_f1_block">
					<div class="mi_three_features_section_f1_inner">
						<p class="mi_three_features_section_Num">1</p>
						<h3 class="mi_three_features_section_title">簡単・らくらく</h3>
						<div class="mi_three_features_section_f1_line"></div>
						<h4 class="mi_three_features_section_subTitle">
							いつでも、どこでも<br>URLを作成するだけ
						</h4>
						<p class="mi_three_features_section_text">
							meet in用のURLを共有するだけで接続スタート。<br>
							アプリのダウンロードやログイン・固定回線は<br>一切不要です。
						</p>
						{* <div class="">
							<button class="check_details_btn">
								<span class="check_details_btn_text">詳細を見る</span>
							</button>
						</div> *}
					</div>
					<img alt="簡単・らくらく" src="/img/lp/simple_easy.png" class="simple_easy_img">
				</div>
				<!-- LP 特徴1 end -->

				<!-- LP 特徴2 start -->
				<div class="mi_three_features_section_f2_block">
					<img alt="便利・使いやすい" src="/img/lp/convenient.png" class="convenient_img">
					<div class="mi_three_features_section_f2_inner">
						<p class="mi_three_features_section_Num">2</p>
						<h3 class="mi_three_features_section_title">便利・使いやすい</h3>
						<div class="mi_three_features_section_f2_line"></div>
						<h4 class="mi_three_features_section_subTitle">
							ビジネスシーンで<br>活躍する機能が満載
						</h4>
						<p class="mi_three_features_section_text">
							資料共有機能や会議の議事録機能など、<br>
							ビジネスシーンで活躍する機能が満載。<br>
							新機能も随時アップデートしています。
						</p>
						<a href="/lp/lp_function.html">
							<button class="check_details_btn">
								<span class="check_details_btn_text">詳細を見る</span>
							</button>
						</a>
					</div>
				</div>
				<!-- LP 特徴2 end -->

				<!-- LP 特徴3 start -->
				<div class="mi_three_features_section_f3_block">
					<div class="mi_three_features_section_f3_inner">
						<p class="mi_three_features_section_Num">3</p>
						<h3 class="mi_three_features_section_title">
							安心・サポート
						</h3>
						<div class="mi_three_features_section_f3_line"></div>
						<h4 class="mi_three_features_section_subTitle">
							オンラインの活用が<br>初めてでも安心
						</h4>
						<p class="mi_three_features_section_text">
							使い方がわからないなど、<br>活用に不安なことはお問い合わせください。
							<br>丁寧にサポートいたします。
						</p>
					</div>
					<img alt="安心・サポート" src="/img/lp/support.png" class="support_img">
				</div>
				<!-- LP 特徴3 end -->
			</section>
			<!-- LP meet inの3つの特徴セクション end -->

			<!-- LP 下記までお問い合わせください！ start -->
			<section class="mi_top_section mi_contactUs_section mi_clearfix">
				<div class="mi_contactUs_section_block">
					<p class="mi_contactUs_section_text">機能・料金などmeet inの詳細は下記までお問い合わせください！</p>
					<a href="#mi_contact_section">
						<button class="mi_btn_bg_orange mi_contactUs_btn" type="button">お問い合わせ</button>
					</a>
				</div>
			</section>
			<!-- 下記までお問い合わせください！ end -->

			<!-- LP よくあるお悩みブロック start-->
			<div class="mi_common_problems_block">

				<!-- LP 移動時間＆コストを削減！セクション start-->
				<section class="mi_top_section mi_common_problems_list_section mi_clearfix" id="mi_common_problems_list_section">
					<div class="mi_top_section_title_block">
						<h3 class="mi_common_problems_list_section_subTitle">meet inで商談・ミーティングをオンライン化</h3>
						<h2 class="mi_common_problems_list_section_title">移動時間＆コストを削減！</h2>
						<div class="mi_common_problems_list_section_title_line"></div>
						<h4 class="mi_common_problems_list_section_mainTitle">よくあるお悩み</h4>
					</div>

					<ul class="mi_common_problems_list mi_clearfix">
						<!--LP よくあるお悩みリスト1営業時の悩み start -->
						<li class="mi_problem_list">
							<img alt="営業時の悩み" class="mi_sales_problem_list_img" src="/img/lp/sales_problem.png">
							<p class="mi_problem_title">営業時の悩み</p>
							<div class="mi_problem_subTitle_wrap">
								<p class="mi_problem_subTitle">移動時間が長い</p>
								<a class="check_solution_btn" href="#mi_sales_problem_section">
									<span class="check_solution_btn_text">
									解決策を見る
									</span>
									<div class="check_solution_btn_arrow"></div>
								</a>
							</div>
						</li>
						<!--LP よくあるお悩みリスト1営業時の悩み end -->

						<!--LP よくあるお悩みリスト2採用時の悩み start -->
						<li class="mi_problem_list">
							<img alt="採用時の悩み" class="mi_recruit_problem_img" src="/img/lp/recruit_problem.png">
							<p class="mi_problem_title">採用時の悩み</p>
							<div class="mi_problem_subTitle_wrap">
								<p class="mi_problem_subTitle">採用の効率が悪い</p>
								<a class="check_solution_btn" href="#mi_recruit_problem_section">
									<span class="check_solution_btn_text">
									解決策を見る
									</span>
									<div class="check_solution_btn_arrow"></div>
								</a>
							</div>
						</li>
						<!--LP よくあるお悩みリスト2採用時の悩み end -->

						<!--LP よくあるお悩みリスト3会議での悩み start -->
						<li class="mi_problem_list">
							<img alt="会議での悩み" class="mi_meeting_problem_img" src="/img/lp/meeting_problem.png">
							<p class="mi_problem_title">会議での悩み</p>
							<div class="mi_problem_subTitle_wrap">
								<p class="mi_problem_subTitle">コストがかかる</p>
								<a class="check_solution_btn" href="#mi_meeting_problem_section">
									<span class="check_solution_btn_text">
									解決策を見る
									</span>
									<div class="check_solution_btn_arrow"></div>
								</a>
							</div>
						</li>
						<!--LP よくあるお悩みリスト3会議での悩み end -->
					</ul>
				</section>
				<!-- LP 移動時間＆コストを削減！セクション end-->

				<!-- LP 営業時の悩みセクション start -->
				<section class="mi_top_section mi_sales_problem_section mi_clearfix" id="mi_sales_problem_section">
					<p class="mi_problem_title">営業時の悩み</p>
					<div class="mi_problem_inner_title">
						<img alt="営業時の悩み" class="mi_proble_small_img" src="/img/lp/sales_problem_small.png">
						<div class="mi_problem_inner">
							<p class="mi_sales_problem_subTitle">移動時間が長い</p>
							<p class="mi_sales_problem_description">商談の度に移動する時間がもったいない…。</p>
						</div>
					</div>
					<div class="mi_problems_title_line"></div>
					<p class="mi_problems_solution">
						<span class="mi_problems_solution_text">解決策</span>
					</p>
					<p class="mi_problems_solution_title">
					meet inで商談をオンライン化し、移動時間を削減！<br>商談件数も2倍以上にアップ</p>
					<img alt="営業の解決策" class="mi_problem_solution" src="/img/lp/sales_solution.png">
				</section>
				<!-- LP 営業時の悩みセクション end -->

				<!-- LP 採用時の悩みセクション start -->
				<section class="mi_top_section mi_recruit_problem_section mi_clearfix" id="mi_recruit_problem_section">
					<p class="mi_problem_title">採用時の悩み</p>
					<div class="mi_problem_inner_title">
						<img alt="採用時の悩み" class="mi_proble_small_img" src="/img/lp/recruit_problem_small.png">
						<div class="mi_problem_inner">
							<p class="mi_recruit_problem_subTitle">採用の効率が悪い</p>
							<p class="mi_recruit_problem_description">採用に関する手間を少なくし、効率良く行いたい…。</p>
						</div>
					</div>
					<div class="mi_problems_title_line"></div>
					<p class="mi_problems_solution">
						<span class="mi_problems_solution_text">解決策</span>
					</p>
					<p class="mi_problems_solution_title">
					meet inで面接をオンライン化し、無駄な手順を削減！<br>採用の効率が上がった！</p>
					<img alt="採用の解決策" class="mi_problem_solution" src="/img/lp/recruit_solution.png">
				</section>
				<!-- LP 採用時の悩みセクション end -->

				<!-- LP 会議での悩みセクション start -->
				<section class="mi_top_section mi_meeting_problem_section mi_clearfix" id="mi_meeting_problem_section">
					<p class="mi_problem_title">会議時の悩み</p>
					<div class="mi_problem_inner_title">
						<img alt="会議時の悩み" class="mi_proble_small_img" src="/img/lp/meeting_problem_small.png">
						<div class="mi_problem_inner">
							<p class="mi_meeting_problem_subTitle">コストがかかる</p>
							<p class="mi_meeting_problem_description">会議の度にかかる交通費と時間がもったいない…。</p>
						</div>
					</div>
					<div class="mi_problems_title_line"></div>
					<p class="mi_problems_solution">
						<span class="mi_problems_solution_text">解決策</span>
					</p>
					<p class="mi_problems_solution_title">
					meet inで会議をオンライン化し、交通費と移動時間を削減！<br>会議に時間をかけることが出来るように</p>
					<img alt="会議の解決策" class="mi_problem_solution" src="/img/lp/meeting_solution.png">
				</section>
				<!-- LP 会議での悩みセクション end -->
			</div>
			<!-- LP よくあるお悩みブロック end-->

			<!-- LP 下記までお問い合わせください！ start -->
			<section class="mi_top_section mi_contactUs_section mi_background_space mi_clearfix">
				<div class="mi_contactUs_section_block">
					<p class="mi_contactUs_section_text">機能・料金などmeet inの詳細は下記までお問い合わせください！</p>
					<a href="#mi_contact_section">
						<button class="mi_btn_bg_orange mi_contactUs_btn" type="button">お問い合わせ</button>
					</a>
				</div>
			</section>
			<!-- 下記までお問い合わせください！ end -->

			<!-- LP meet in導入事例 start-->
			<section class="mi_top_section mi_case_study_section mi_clearfix" id="mi_case_study_section">
				<div class="mi_top_section_title_block">
					<h2 class="mi_case_study_section_title">2019年から、{$introductionCompaniesCount}社がmeet inで業務を効率化しています。</h2>
					<div class="mi_case_study_section_title_line"></div>
				</div>
				{* <div class="introduced_company_logo_wrap">
					<img alt="" src="/img/lp/dummy_company_logo.png" class="introduced_company_logo_img">
					<img alt="" src="/img/lp/dummy_company_logo.png" class="introduced_company_logo_img">
					<img alt="" src="/img/lp/dummy_company_logo.png" class="introduced_company_logo_img">
					<img alt="" src="/img/lp/dummy_company_logo.png" class="introduced_company_logo_img">
					<img alt="" src="/img/lp/dummy_company_logo.png" class="introduced_company_logo_img">
					<img alt="" src="/img/lp/dummy_company_logo.png" class="introduced_company_logo_img">
				</div> *}
				{* <div class="mi_case_study_section_line"></div> *}

				<div class="mi_introduced_company_thumbnail_wrap">
					<img alt="" src="/img/lp/case/01/meetin_lp4.jpg" class="introduced_company_thumbnail_img" width="430px">
					<div class="mi_introduced_company_thumbnail_textWrap">
						<h3 class="mi_introduced_companyName">株式会社ガルーダシップ 様</h3>
						<p class="mi_introduced_company_text">
						meet inを導入することで<br />
						簡単に遠方と接続ができ<br />
						出張費が削減！</p>
						<button class="check_details_btn">
							<a href="https://media.meet-in.jp/works/casestudy-garudaship/" class="check_details_btn_text">詳細を見る</a>
						</button>
					</div>
				</div>
				<div class="mi_introduced_company_thumbnail_wrap">
					<img alt="" src="/img/lp/case/01/meetin_lp2.jpg" class="introduced_company_thumbnail_img" width="430px">
					<div class="mi_introduced_company_thumbnail_textWrap">
						<h3 class="mi_introduced_companyName">株式会社WORK SMILE LABO 様</h3>
						<p class="mi_introduced_company_text">
						meet inを導入することで<br />
						営業件数と営業確度はおよそ2倍に！</p>
						<button class="check_details_btn">
							<a href="https://media.meet-in.jp/works/casestudy-worksmilelabo/" class="check_details_btn_text">詳細を見る</a>
						</button>
					</div>
				</div>
				<div class="mi_introduced_company_thumbnail_wrap">
					<img alt="" src="/img/lp/case/01/meetin_lp1.jpg" class="introduced_company_thumbnail_img" width="430px">
					<div class="mi_introduced_company_thumbnail_textWrap">
						<h3 class="mi_introduced_companyName">株式会社C-mind 様</h3>
						<p class="mi_introduced_company_text">
						meet inを導入することで<br />
						営業と採用の業務効率化だけでなく<br />
						企業ブランドにも貢献！</p>
						<button class="check_details_btn">
							<a href="https://media.meet-in.jp/works/casestudy-cmind/" class="check_details_btn_text">詳細を見る</a>
						</button>
					</div>
				</div>
				<a href="https://media.meet-in.jp/works/">
					<button class="mi_btn_bg_orange mi_contactUs_btn_moreView" type="button">もっと見る</button>
				</a>
			</section>
			<!-- LP meet in導入事例 end-->

			<!-- LP 下記までお問い合わせください！ start -->
			<section class="mi_top_section mi_contactUs_section mi_clearfix">
				<div class="mi_contactUs_section_block">
					<p class="mi_contactUs_section_text">機能・料金などmeet inの詳細は下記までお問い合わせください！</p>
					<a href="#mi_contact_section">
						<button class="mi_btn_bg_orange mi_contactUs_btn" type="button">お問い合わせ</button>
					</a>
				</div>
			</section>
			<!-- 下記までお問い合わせください！ end -->

			<!-- LP 料金・機能に関して、その他お問い合わせ start-->
			<section class="mi_form_section mi_contact_section mi_bg_orange" id="mi_contact_section">
				<div class="mi_top_section_inner">
					<div class="mi_top_section_title_block">
						<h2 class="mi_top_section_title mi_contact_title">
						料金・機能に関して、その他お問い合わせ
						</h2>
					</div>
					<p class="mi_contact_subtitle">meet inに関するお問い合わせ、お申し込みは下記に必要事項をご入力の上お問い合わせください。<br>
					担当者より追って詳細のご案内をさせていただきます。</p>
					<div class="mi_contact_block">
						<form action="/lp/complete.php" class="contactform" method="post">
							<div class="mi_contactform_block">
								<p class="mi_contactform_title"><span class="mi_contactform_required">必須</span>氏名</p><input class="mi_contactform_input_text_m" name="name" placeholder="田中 太郎" required="" type="text">
							</div>
							<div class="mi_contactform_block">
								<p class="mi_contactform_title"><span class="mi_contactform_required">必須</span>会社名<span class="mi_contactform_confilm_text">（個人事業主の場合は氏名を再度入力してください。）</span></p><input class="mi_contactform_input_text_l" name="company" placeholder="株式会社meet in" required="" type="text">
							</div>
							<div class="mi_contactform_block">
								<p class="mi_contactform_title"><span class="mi_contactform_required">必須</span>電話番号</p><input class="mi_contactform_input_text_m" name="tel_number" placeholder="000-0000-0000" required="" type="text">
							</div>
							<div class="mi_contactform_block">
								<p class="mi_contactform_title"><span class="mi_contactform_required">必須</span>メールアドレス</p><input class="mi_contactform_input_text_ml" name="mail" placeholder="aaaaaaaaaaaaaaa" required="" type="text"><span class="mi_text_atmark">@</span><input class="mi_contactform_input_text_s" name="domein" placeholder="aaaa.jp" required="" type="text">
							</div>
							<div class="mi_contactform_block">
								<p class="mi_contactform_title"><span class="mi_contactform_required">必須</span>件名</p>
								<select class="form_selectbox" name="subject">
									<option value="meet inのお申込みについて">meet inのお申込みについて</option>
									<option value="ご契約について">ご契約について</option>
									<option value="トラブルについて">トラブルについて</option>
									<option value="レンタルPCのお申込みについて">レンタルPCのお申込みについて</option>
									<option value="その他">その他</option>
								</select>
							</div>
							<div class="mi_contactform_block">
								<p class="mi_contactform_title">
								<!-- <span class="mi_contactform_required">必須</span> -->
								お問い合わせ内容</p>
								<textarea class="mi_contactform_textarea" name="contact" placeholder="お問い合わせ内容を記載して下さい。"></textarea>
							</div>
							<div class="mi_contactform_block">
								<p class="mi_contactform_title">使用用途</p><input class="mi_contactform_input_text_l" name="use" placeholder="例：ミーティング、営業など" type="text">
							</div>
							<div class="mi_contactform_block">
								<p class="mi_contactform_title">どちらで知りましたか？</p>
								<label for="mi_knew_check_1"><input class="mi_contactform_checkbox" id="mi_knew_check_1" name="knew" required="" type="radio" value="meet inからのご提案" checked>meet inからのご提案</label><br />
								<label for="mi_knew_check_2"><input class="mi_contactform_checkbox" id="mi_knew_check_2" name="knew" required="" type="radio" value="代理店からのご提案">代理店からのご提案</label><br />
								<label for="mi_knew_check_3"><input class="mi_contactform_checkbox" id="mi_knew_check_3" name="knew" required="" type="radio" value="商談相手が使用していて">商談相手が使用していて</label><br />
								<label for="mi_knew_check_4"><input class="mi_contactform_checkbox" id="mi_knew_check_4" name="knew" required="" type="radio" value="オンライン商談ツールを検索していて">オンライン商談ツールを検索していて</label><br />
								<label for="mi_knew_check_5"><input class="mi_contactform_checkbox" id="mi_knew_check_5" name="knew" required="" type="radio" value="その他">その他</label>
							</div>
							<p class="mi_contactform_text">
								<input class="mi_contactform_checkbox" id="mi_privacy_check" name="privacy" required="" type="checkbox">
								<label for="mi_privacy_check">
								<a class="mi_overlay_privacy_open" href="#mi_overlay_privacy">
								個人情報の取り扱いについて</a>
								承諾しました。
								</label>
							</p>
							<div class="mi_contactform_send_wrap">
								<a href="javascript:void"><button class="mi_contactform_send mi_overlay_confirm_open">確認画面へ</button></a>
							</div>
						</form>
					</div>
				</div>
			</section>
			<!-- LP 料金・機能に関して、その他お問い合わせ end-->

			<!-- LPフッターセクション start -->
			<footer class="mi_lp_footer footer-min-none">
				<div class="mi_footer_wrap">
					<a href="" class="mi_footer_list">
					TOP</a>
					<a href="/lp/lp_company_profile.html" class="mi_footer_list">
					会社概要</a>
					<a href="#mi_contact_section" class="mi_footer_list">
					お問い合わせ</a>
					<a href="#mi_overlay_privacy" class="mi_overlay_privacy_open mi_footer_list">
					個人情報の取り扱いについて</a>
					<a href="/lp/terms_of_service.html" class="mi_footer_list">
							利用規約</a>		
				</div>
				<img alt="meet in" class="mi_footer_img" src="/img/lp/rogo-meetin-footer.png">
			</footer>
			<!-- LPフッターセクション end -->

			<!-- LPプライバシーポップアップコンテンツコンテンツ begin -->
			<div class="mi_overlay mi_overlay_privacy" id="mi_overlay_privacy">
				<div class="mi_modal_shadow"></div>
				<div class="mi_overlay_wrap mi_overlay_privacy_wrap">
					<div class="mi_overlay_contents mi_privacy_block">
						<div class="mi_overlay_colose">
							<a class="mi_overlay_colose_btn" href="javascript:void(0)"><img alt="閉じる" class="mi_privacy_close_img" src="/img/lp/ico-close.png"><br>
							閉じる</a>
						</div>
						<div class="mi_overlay_contents_title mi_privacy_title_wrap">
							<h2 class="mi_privacy_title">
								プライバシーポリシー
							</h2>
						</div>
						<dl class="mi_privacy_list">
							<dd>
							株式会社meet in（以下「当社」といいます。）は、個人情報の適切な取り扱いを期しています。当社が提供する「meet in」によるサービス（以下「当サービス」といいます。）へのお申し込みなどの業務において取得する個人情報の取り扱いについて、次のとおり定めます。そのため、お客様におかれましては、以下の事項をご理解いただき、同意の上で個人情報をご提供ください。
							</dd>
							<dt>
							<span class="mi_text_orange">●</span>1、個人情報の取得
							</dt>
							<dd>
							当社は、お客様の個人情報を適法かつ適正な手段により取得します。
							</dd>
							<dd></dd>
							<dt>
								<span class="mi_text_orange">●</span>2、個人情報の管理
							</dt>
							<dd>
							当社は、お客様の個人情報を正確かつ最新の状態に保ち、個人情報への不正アクセス・紛失・破損・改ざん・漏洩などを防止するため、セキュリティシステムの維持・管理体制の整備・ 社員教育の徹底等の必要な措置を講じ、安全対策を実施し個人情報の厳重な管理を行ないます。また、当社が、お客様の個人データの取り扱いを委託する場合には、適切な安全管理措置を講じている協力会社を選定し、委託先に対し必要かつ適切な監督を行います。
							</dd>
							<dd></dd>
							<dt>
								<span class="mi_text_orange">●</span>3、個人情報の利用目的
							</dt>
							<dd>
							当社は、お客様の個人情報について、以下の利用目的の範囲内又は、その取得状況から明らかである利用目的の範囲内で利用し、ご本人の同意がある場合又は法令で認められている場合を除き、他の目的で利用しません。<br>
							（1）当サービス利用に関する登録及び個人認証	<br>
							（2）当サービス利用に関する料金請求その他の代金請求及び商品等の引渡し業務等<br>
							（3）当サービス利用に関する問合せ内容の確認、回答、その他ご要望等への対応<br>
							（4）当サービスの利用に伴う連絡及び電子メール、資料のご送付<br>
							（5）当サービスに関連する新サービス、新メニューのご案内並びに調査及び障害連絡<br>
							（6）当サービスの利用に関する保守及びメンテナンス等の運営<br>
							（7）当社によるサービスの開発およびマーケティング<br>
							（8）当社の新サービス、新メニューのご案内等
							</dd>
							<dd></dd>
							<dt>
								<span class="mi_text_orange">●</span>4、個人情報の第三者への開示・提供の禁止
							</dt>
							<dd>
							当社は、お客様よりお預かりした個人情報を適切に管理し、次のいずれかに該当する場合を除き、個人情報を第三者（第５項に定める委託先及び第６項の共同利用者を除きます。）に開示いたしません。<br>
							①　お客様の事前同意がある場合<br>
							②　法令で認められている場合<br>
								・法令に基づき開示することが必要である場合
							</dd>
							<dd></dd>
							<dt>
								<span class="mi_text_orange">●</span>5、個人データの委託
							</dt>
							<dd>
							当社は、業務を円滑に進め、お客様により良いサービスを提供するため、お客様の個人データの取り扱いを協力会社に委託する場合があります。ただし、委託する個人データは、委託する業務を遂行するのに必要最小限の情報に限定します。
							</dd>
							<dd></dd>
							<dt>
								<span class="mi_text_orange">●</span>6、共同利用
							</dt>
							<dd>
							当社は、本サービスに関連して、お客様によりよい業務を提供するために、当社のグループ会社である株式会社アイドマ・ホールディングス（以下「共同利用者」といいます。）との間で個人情報を共同利用します。<br>
							（1）共同利用者の利用目的<br>
							①　共同利用者が取り扱う商品・サービス等のお届けおよび回収<br>
							②　共同利用者が展開するサービス等の提供<br>
							③　お客様にとって有用な情報や商品・サービス等の開発、提供及びご案内<br>
							（2）共同利用者の範囲<br>
							株式会社アイドマ・ホールディングス<br>
							（3）共同して利用される個人データの項目<br>
							お客様、又は代表者の名前、住所、電話番号、契約商品、契約サービス、契約金額、契約条件、取引条件<br>
							（4）共同利用に関する責任者<br>
							　　株式会社アイドマ・ホールディングス
							</dd>
							<dd></dd>
							<dt>
								<span class="mi_text_orange">●</span>7、保有個人データに関する受付
							</dt>
							<dd>
							（1）お客様又は代理人から保有個人データの利用目的の通知の要請があったときは、次の場合を除き、遅滞なく通知いたします。<br>
							①　お客様ご本人が識別される保有個人データの利用目的が明らかな場合<br>
							②　お客様ご本人又は第三者の生命、身体、財産その他の権利利益を害するおそれがある場合<br>
							③　当社の権利又は正当な利益を害するおそれがある場合<br>
							④　国の機関又は地方公共団体が法令の定める事務を遂行することに対して協力する必要がある場合であって、当該事務の遂行に支障を及ぼすおそれのある場合<br>
							（2）お客様ご本人又は代理人から保有個人データの開示の要請があった場合には、次の場合を除き、遅滞なく通知いたします。<br>
							①　お客様ご本人又は第三者の生命、身体、財産その他の権利利益を害するおそれがある場合<br>
							②　当社の業務の適正な実施に著しい支障を及ぼすおそれがある場合<br>
							③　法令に違反することとなる場合<br>
							（3）お客様ご本人又は代理人から保有個人データの訂正、追加、削除の要請があった場合には、遅滞なく調査を行い、結果に基づき適正な対応を行います。<br>
							（4）お客様ご本人又は代理人から保有個人データの利用の停止又は消去の要請があった場合に、要請に理由があることが判明したときは、適正な対応を行います。<br>
							（5）前4項の要請については、必要事項を記載した書面に本人確認書類を添付して第8項のお問い合わせ先まで郵送してください。お客様からご提供いただいた個人情報は、お客様からの要請に対応する目的でのみ使用し厳重に保管いたします。なお、上記郵送いただいた書面及び本人確認書類については、返送はいたしませんので、ご了承ください。
							</dd>
							<dd></dd>
							<dt>
								<span class="mi_text_orange">●</span>8、個人情報の取り扱いに関するお問い合わせ先
							</dt>
							<dd>
								株式会社meet in　個人情報対応窓口<br>
								住所：〒171-0022 東京都豊島区南池袋2-25-5 藤久ビル東5号館 4F<br>
								電話番号：03-5985-8290<br>
								メール：<a href="mailto:privacy@meet-in.jp">privacy@meet-in.jp</a><br>
								担当責任者：個人情報保護管理者
							</dd>
							<dt>
								<span class="mi_text_orange">●</span>9、プライバシーポリシーの改定について
							</dt>
							<dd>
							当社は、本プライバシーポリシーの内容を適宜見直し、必要に応じて変更することがあります。その場合、改訂版の公表の日から変更後のプライバシーポリシーが適用されることになります。
							</dd>
						</dl>
					</div>
				</div>
			</div>
			<!-- LPプライバシーコンテンツ end -->

			<!-- LPプライバシーポップアップコンテンツコンテンツ begin -->
			<div class="mi_overlay mi_overlay_memo" id="mi_overlay_memo">
				<div class="mi_modal_shadow"></div>
				<div class="mi_overlay_wrap mi_overlay_memo_wrap">
					<div class="mi_overlay_contents mi_memo_block">
						<div class="mi_overlay_colose">
							<a class="mi_overlay_colose_btn" href="javascript:void(0)"><img alt="閉じる" class="mi_privacy_close_img" src="/img/lp/ico-close.png"><br>
							閉じる</a>
						</div>
						<h2 class="mi_memo_title mi_Robotofont mi_text_orange">
							Memo
						</h2>
						<p class="mi_memo_text">
							オンライン上で「直接会う」ことで<br>
							ムダな移動時間を短縮し、生産性の高い仕事に集中出来る
						</p><img alt="" class="mi_memo_img" src="/img/lp/img-memo-graf.png">
					</div>
				</div>
			</div>
			<!-- LPプライバシーコンテンツ end -->

			<!-- LPプライバシーポップアップコンテンツコンテンツ begin -->
			<div class="mi_chara_block01 mi_modal_wrap" id="mi_modal_01">
				<div class="mi_modal_shadow"></div>
				<div class="mi_modal_contents mi_chara_block mi_clearfix">
					<div class="mi_detail_wrap mi_flt-l">
						<h4 class="mi_detail_title">
							<span class="mi_title_number mi_title_textpurple">1</span><span class="mi_title_text mi_title_borderpurple">超ラクチン</span>
						</h4>
						<p class="mi_text_bold">
							アプリのダウンロードや<br>
							ログイン・固定回線は一切不要。
						</p>
						<p class="mi_detail_text">
							meet inのTOPページ上で作成したURLを共有するだけでスタート可能。世界中どこにいてもパソコンやタブレットが1台あればいつでもmeet in。
						</p>
						<p class="mi_text_caution">
							※URL作成フォームはmeet inを活用している会社のホームページにもついています。
						</p>
						<ul class="mi_checkList mi_clearfix">
							<li class="mi_checkList_borderpurple">
								<p class="mi_checkList_title">
									<img alt="ログイン不要" src="/img/lp/tool-login.png">
								</p>
							</li>
							<li class="mi_checkList_borderpurple">
								<p class="mi_checkList_title">
									<img alt="固定meet in番号" src="/img/lp/tool-namber.png">
								</p>
							</li>
							<li class="mi_checkList_borderpurple">
								<p class="mi_checkList_title">
									<img alt="ブラウザだけで会話可能" src="/img/lp/tool-talk.png">
								</p>
							</li>
						</ul>
					</div>
					<div class="mi_img_wrap mi_flt-r">
						<img alt="" class="" src="/img/lp/main-ill-click.png">
					</div>
				</div>
			</div>
			<!-- LPプライバシーコンテンツ end -->

			<!-- LPプライバシーポップアップコンテンツコンテンツ begin -->
			<div class="mi_modal_wrap mi_chara_block02" id="mi_modal_02">
				<div class="mi_modal_shadow"></div>
				<div class="mi_modal_contents mi_chara_block mi_clearfix">
					<div class="mi_detail_wrap mi_flt-r">
						<h4 class="mi_detail_title">
							<span class="mi_title_number mi_title_textorange">2</span><span class="mi_title_text mi_title_borderorange">超簡単</span>
						</h4>
						<p class="mi_text_bold">
							ワンアクションで<br>
							資料やメモを一発共有。
						</p>
						<p class="mi_detail_text">
							資料を共有したければ、画面にドラッグ＆ドロップで一発で共有。録画もメモの共有も画面の共有もクリック一つで簡単に。会わなくてもいつでも、だれでも簡単にミーティングが出来るミートイン。
						</p>
						<ul class="mi_checkList mi_clearfix">
							<li class="mi_checkList_borderorange">
								<p class="mi_checkList_title">
									<img alt="ワンクリック録画" src="/img/lp/tool-video.png">
								</p>
							</li>
							<li class="mi_checkList_borderorange">
								<p class="mi_checkList_title">
									<img alt="リアルタイム共有メモ" src="/img/lp/tool-memo.png">
								</p>
							</li>
							<li class="mi_checkList_borderorange">
								<p class="mi_checkList_title">
									<img alt="瞬間資料共有" src="/img/lp/tool-shear.png">
								</p>
							</li>
						</ul>
					</div>
					<div class="mi_img_wrap mi_flt-l">
						<img alt="" class="" src="/img/lp/main-ill-one-action.png">
					</div>
				</div>
			</div>
			<!-- LPプライバシーコンテンツ end -->

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
							<input class="mi_confirm_knew_input mi_confirm_input_req" name="confirm_knew" type="hidden">
							<input type="hidden" name="confirm_type" class="mi_confirm_type_input" value="お問い合わせ">
							<input type="hidden" name="recaptchaResponse" id="recaptchaResponse" />
							<button class="mi_default_button mi_confirm_send">送信</button>
						</form>
					</div>
				</div>
			</div>
			<!-- お問い合わせ内容確認 end -->

			<!-- コネクト begin -->
			<div class="in_connect_area" style="z-index:50;">
				<div class="conecting_wrap">
					<div class="conecting_inner">
						<div class="lodingimg_efect_wrap">
							<div class="lodingimg_efect"></div>
							<p class="loding_text">
								Connecting<span class="point">・・・</span>
							</p>
						</div>
						<p class="conect_text">
							ご入力ありがとうございます。<br>
							担当者を呼び出しております・・・
						</p><br>
						<br>
						<a class="btn_link_long hvr-fade click-fade" href="javascript:void(0);" id="cancel_connection" style="width:660px"><span class="icon-meet-in call_option_icon"></span><span class="button_text">中止</span></a>
					</div>
				</div>
			</div>
			<!-- コネクト end -->
		</div>
		<!-- メインコンテンツ end -->

		<!-- ====================================== モーダルコンテンツ[start] ====================================== -->
		<div class="modal-content" id="modal-content">
			<!-- id="db-log2"    -->
			<div class="inner-wrap"></div>
		</div>
		<!-- ====================================== モーダルコンテンツ[end] ======================================== -->

		<!-- 汎用ダイアログ start -->
		<div id="common_dialog_area"></div>
		<!-- 汎用ダイアログ end -->
	</div>
	<!-- wrap end -->

		<script src="/js/jquery-1.11.2.min.js">
		</script>
		<script src="/js/detectSpeed.js">
		</script>
		<link href="/css/jquery-ui.css" rel="stylesheet">
		<script src="/js/jquery-ui.min.js">
		</script>
		<script src="js/swiper.min.js"></script>
	</body>
</html>
