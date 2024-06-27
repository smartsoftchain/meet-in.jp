<!DOCTYPE html>
<html lang="ja">
<head>
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>営業・商談 | 活用事例01 | meet in（ミートイン）</title>
<meta charset="utf-8">
<meta name="description" content="営業活動にmeet in（ミートイン）を活用し、オンラインで商談を行うことで生産性を3倍以上に。
移動時間を減らすことで、無駄な時間を有効活用することが可能に。">
<meta name="author" content="">
<link rel="shortcut icon" href="/img/favicon.ico">
<link rel="stylesheet" href="/css/fonts.css">
<!--[if lt IE 8]>
<link rel="stylesheet" href="/css/ie7.css">
<!--<![endif]-->
<link href="https://fonts.googleapis.com/css?family=Roboto+Slab" rel="stylesheet">
<link rel="stylesheet" href="/css/reset.css">
<link rel="stylesheet" href="/css/base.css">
<link rel="stylesheet" href="/css/page.css">
<link rel="stylesheet" href="/css/design.css">
<link rel="stylesheet" href="/css/top.css">
<link rel="stylesheet" href="/css/jquery-ui.css">
<script src="/js/jquery-1.11.2.min.js"></script>
<script src="/js/jquery-ui.min.js"></script>
<script src="/js/common.js"></script>
<script>

// IEでスムーススクロールの影響で背景がカタカタするので機能を無効にする
if(navigator.userAgent.match(/MSIE 10/i) || navigator.userAgent.match(/Trident\/7\./) || navigator.userAgent.match(/Edge\/12\./)) {
	$(function(){
		$('body').on("mousewheel", function () {
			event.preventDefault();
			var wd = event.wheelDelta;
			var csp = window.pageYOffset;
			window.scrollTo(0, csp - wd);
		});
	});
}

$(function(){
	$("#calculation_form").submit(function(e){
		var week_outing_count = parseInt($("[name=outing_count]").val());
		var transportation_expenses = parseInt($("[name=transportation_expenses]").val());
		var salary = parseInt($("[name=salary]").val());

		// 時給を算出する（22営業日8時間計算）
		var hourly_pay = Math.floor(salary/22/8);
		console.log(hourly_pay);

		// 1 日あたりの商談件数(入力された 1 週間の商談件数、割る 5 営業日)
		var daily_outing_count = Math.floor(week_outing_count / 5);
		console.log(daily_outing_count);

		// 交通費の一ヶ月あたりのコストを算出する(入力された交通費 × 1 日あたりの商談件数 × 22営業日)
		var transportation_expenses_cost = Math.floor(transportation_expenses*daily_outing_count*22);
		console.log(transportation_expenses_cost);

		// ・「1 日あたりの商談件数(入力された 1 週間の商談件数、割る 5 営業日)」×「社員 1 人の時給」× 22 営業日 =「1 ヶ月で 1 人あたりの商談にかかるコスト」
		var sales_cost = Math.floor(daily_outing_count * hourly_pay * 22);
		console.log(sales_cost);

		var month_cost = Math.floor(sales_cost + transportation_expenses_cost);
		$(".calculation_result_cost_text").text("-"+month_cost);
		$(".calculation_result_wrap").show();

		var position = $(".calculation_result_wrap").offset().top - 63;
		$('body,html').animate({scrollTop:position}, 400, 'swing');
		return false;
	});
});
</script>
</head>
<body>
	<script>
	  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
	  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
	  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
	  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

	  ga('create', 'UA-48144639-6', 'auto');
	  ga('send', 'pageview');

	</script><?php //include_once("/lp/analyticstracking.php") ?>
<!-- wrap start -->
<div id="mi_wrap" class="lp_wrap">



	<!-- メインコンテンツ start -->
	<div id="mi_lp_content" class="mi_clearfix mi_lp_content">



		<!-- LPナビゲーション start -->
		<nav class="mi_lpmain_nav_wrap">
			<div id="mi_lp_top_nav" class="mi_lpmain_nav mi_lp_top_nav_fixed">
				<ul class="mi_lpmain_nav_inner mi_js_scroll mi_clearfix">
					<li><a href="/index/index#lp_header"><img src="/img/lp/rogo-header.png" class="" alt=""></a></li>
					<li><a href="/index/index#mi_how_to_use_section">使い方</a></li>
					<li><a href="/index/index#mi_to_use_section">利用する</a></li>
					<li><a href="/index/index#mi_chara_section">特徴</a></li>
					<li><a href="/index/index#mi_case_section">活用事例</a></li>
					<li><a href="/index/index#mi_plan_section">料金プラン</a></li>
					<li><a href="/index/index#mi_vision_section">ビジョン</a></li>
					<li><a href="/index/index#mi_member_section" class="two_lines"><span>メンバー・<br />会社概要</span></a></li>
					<li><a href="javascript:void(0)" class="mi_nav_comingSoon">F&nbsp;&amp;&nbsp;Q<span class="mi_nav_comingSoon_text">Coming Soon</span></a></li>
				</ul>
			</div>
		</nav>
		<!-- LPナビゲーション end -->


		<!-- LP活用方法セクション start -->
		<section class="mi_lp_second_section mi_lp_salesCase">
			<div class="mi_lp_second_section_inner">
				<img src="/img/lp/bt-cost_check.png" alt="" class="cost_check_img" />
				<div class="mi_top_section_title_block">
					<p class="mi_top_section_title mi_salesCase_title mi_title_line_orange">事例1</p>
				</div>

				<h1 class="mi_lp_second_subtitle">営業にmeet inを活用することで<br>
					<span class="mi_subtitle_point">営業パーソンの営業効率は<span class="mi_subtitle_point_orange">2倍</span>以上に。</span></h1>

				<div class="mi_top_section_title_block">
					<p class="mi_top_section_title mi_title_line_orange mi_top_section_title_s">営業での主な使い方</p>
				</div>

				<ul class="mi_howTo_list mi_clearfix">
					<li>
						<p class="mi_howTo_list_text">お問い合わせの対応に</p>
						<img src="/img/lp/img-sales-surpport.png" class="mi_howTo_list_img" alt="">
					</li>
					<li>
						<p class="mi_howTo_list_text">アポイントを頂いた企業へ</p>
						<img src="/img/lp/img-sales-apo.png" class="mi_howTo_list_img" alt="">
					</li>
					<li>
						<p class="mi_howTo_list_text">営業を受ける場合</p>
						<img src="/img/lp/img-sales-sales.png" class="mi_howTo_list_img" alt="">
					</li>
				</ul>
				<div class="mi_salesCase_img_wrap">
					<img src="/img/lp/img-sales-graf.png" class="mi_salesCase_img" alt="">
				</div>

				<div class="mi_top_section_title_block">
					<p class="mi_top_section_title mi_title_line_orange mi_top_section_title_s mi_online_sales_title">オンライン営業の流れ</p>
				</div>
				<div class="mi_salesCase_img_wrap">
					<img src="/img/lp/img-online-sales_step.png" class="mi_salesCase_img" alt="">
				</div>
			</div>

			<div class="mi_lp_calculation_section_wrap">
				<div class="mi_lp_calculation_section_inner">
					<img src="/img/lp/bt-cost_check.png" alt="" class="cost_check_img" />

					<div class="mi_top_section_title_block">
						<p class="mi_top_section_title mi_title_line_orange">削減できる1ヶ月の<br />
	コストを計算してみましょう！</p>
					</div>
					<p class="mi_top_section_sub_title">meet inを活用した場合、どのくらいコストが削減できるのか、<br />
						計算してみましょう！</p>
						<form id="calculation_form">
							<dl class="calculation_list_wrap">
								<dt><span class="list_style_orange">■</span>1週間あたりの外出数を入力してください。（必須）</dt>
								<dd><input type="number" class="calculation_input" name="outing_count" pattern="^[0-9]+$" min="0" required />件</dd>
								<dt><span class="list_style_orange">■</span> 商談1件あたりの交通費の平均を入力してください。（必須）</dt>
								<dd><input type="number" class="calculation_input" name="transportation_expenses" pattern="^[0-9]+$" min="0" required />円</dd>
								<dt><span class="list_style_orange">■</span> あなたの1ヶ月の給与を入力してください。（必須）</dt>
								<dd><input type="number" class="calculation_input" name="salary" pattern="^[0-9]+$" min="0" required />円</dd>
							</dl>
							<p class="calculation_btn_wrap">
								<button class="calculation_btn mi_btn_bg_orange">計算する</button>
							</p>
						</form>

						<div class="calculation_result_wrap">
							<div class="calculation_arrow"></div>
							<div class="calculation_result_block">
								<p class="calculation_result_text">1ヶ月で削減可能なコストは<br />
									<span class="calculation_result_orange_text"><span class="calculation_result_cost_text">-500,000</span>円</span>
								</p>
							</div>
						</div>
				</div>
			</div>
		</section>
		<!-- LP下層コンテンツ end -->


		<!-- LPフッターセクション start -->
		<footer class="mi_lp_footer">
			<p class="mi_footer_logo"><img src="/img/lp/rogo-meetin-footer.png" class="" alt="meet in"></p>
		</footer>
		<!-- LPフッターセクション end -->


	</div>
	<!-- メインコンテンツ end -->

<!-- ====================================== モーダルコンテンツ[start] ====================================== -->
<div class="modal-content" id="modal-content"> <!-- id="db-log2"	-->
	<div class="inner-wrap">
	</div>
</div>
<!-- ====================================== モーダルコンテンツ[end] ======================================== -->

</div>
<!-- wrap end -->

<script src="/js/jquery-1.11.2.min.js"></script>
<script type="text/javascript" src="/js/WebRTC/adapter.js"></script>
<script type="text/javascript" src="/js/WebRTC/MeetinRTC.js"></script>
<script type="text/javascript" src="/js/MeetinAPI.js"></script>
<script type="text/javascript" src="/js/WebRTC/MeetinRTC_UI.js"></script>
<script type="text/javascript" src="/js/connection/prepare-connection.js"></script>

<link rel="stylesheet" href="/css/jquery-ui.css">
<script src="/js/jquery-1.11.2.min.js"></script>
<script src="/js/jquery-ui.min.js"></script>

</body>
</html>
