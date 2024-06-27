<!DOCTYPE html>
<html lang="ja">
<head>
	<meta content="IE=edge" http-equiv="X-UA-Compatible">
	<title>meet in（ミートイン） | いつでも、どこでも1秒でweb会議</title>
	<meta charset="utf-8">
	<meta content="meet in（ミートイン）は、いつでも、どこでも簡単にweb会議ができる、オンラインコミュニケーションプラットフォームです。アプリのインストールは不要、すぐに始められます。" name="description">
	<meta content="web 会議　webミーティング　オンラインコミュニケーション　インストール不要　簡単" name="keywords">
	<meta content="" name="author">
	<link href="/img/favicon.ico" rel="shortcut icon">
	<link href="/css/fonts.css" rel="stylesheet">
	<link href="/css/ie7.css" rel="stylesheet">
	<link href="https://fonts.googleapis.com/css?family=Roboto+Slab" rel="stylesheet">
	<link href="/css/troubleShooting.css" rel="stylesheet">
	<link href="/css/faq.css" rel="stylesheet">
	<link href="/css/contract.css" rel="stylesheet">
	<link href="/css/reset.css" rel="stylesheet">
	<link href="/css/base.css" rel="stylesheet">
	<link href="/css/page.css" rel="stylesheet">
	<link href="/css/design.css" rel="stylesheet">
	<link href="/css/top.css" rel="stylesheet">
	<link href="/css/jquery-ui.css" rel="stylesheet">
	<link rel="stylesheet" href="/css/webinar.css?{$application_version}">
	<script src="/js/jquery-1.11.2.min.js">
	</script>
	<script src="/js/jquery-ui.min.js">
	</script>
	<script src="/js/common.js">
	</script>
	<script src="/js/top.js">
	</script>
	<script src="/js/webinar.js?{$application_version}"></script>
	{literal}
	<script>
	//オーバーレイ
	$(function(){
	});
	</script>
	<style>
		.mi_overlay {
			position: fixed;
		}
	</style>
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

</head>
<body class="webinar_participant_form_background">
	<div class="faq_wrap" id="mi_wrap">
		<!-- メインコンテンツ start -->
		<!-- LPウェビナー参加申し込みセクション start -->
		<section class=" mi_contact_section mi_bg_orange webinar_participant_form_background" id="mi_contact_section">
			<div class="mi_top_section_inner">
				<div class="mi_top_section_title_block">
					<h2 class="mi_top_section_title mi_contact_title" style="color: #333;">ウェビナー参加申し込みフォーム</h2>
				</div>
				<p class="mi_contact_subtitle compulsion_mgb_20" style="color: #333;">{$webinar.name}</p>
				<p class="error_msg_area mi_contact_block text_align_center compulsion_mgb_20">
					<!-- エラーメッセージ表示領域 -->
					{foreach from=$webinar.errors item=row}
						<strong style='color: red;'>{$row}</strong><br>
					{/foreach}
				</p>
				{assign var=end_holding_date value=$webinar.holding_date|strtotime}
				<p class="mi_contact_subtitle compulsion_mgb_20" style="color: #333;">開催日時{$webinar.holding_date|date_format:'%Y-%m-%d %H:%M'}〜{$end_holding_date+60*$webinar.holding_time|date_format:'%H:%M'}</p>
				<!--<p class="mi_contact_subtitle compulsion_mgb_20" style="color: #333;">開催時間{$webinar.holding_time}分</p>-->
				<p class="mi_contact_subtitle compulsion_mgb_20" style="color: #333;">定員数{$webinar.max_participant_count}</p>
				<p class="mi_contact_subtitle compulsion_mgb_20">
					<img alt="" class="width450" src="{$webinar.img_path}">
				</p>
				<div class="mi_contact_block">
					<div class="div_webinar_outline_area">
						<pre class="pre_webinar_outline_area">{$webinar.outline}</pre>
					</div>
					<form name="from_webinar_participant">
						<input type="hidden" name="announce_key" class="mi_confirm_type_input" value="{$webinar.announce_key}">
						<div class="mi_contactform_block">
							<p class="mi_contactform_title"><span class="mi_contactform_required">必須</span>氏名</p><input class="mi_contactform_input_text_m" name="name" placeholder="田中 太郎" required="" type="text">
						</div>
						<div class="mi_contactform_block">
							<p class="mi_contactform_title"><span class="mi_contactform_required">必須</span>電話番号</p><input class="mi_contactform_input_text_m" name="tel_number" placeholder="000-0000-0000" required="" type="text">
						</div>
						<div class="mi_contactform_block">
							<p class="mi_contactform_title"><span class="mi_contactform_required">必須</span>メールアドレス</p><input class="mi_contactform_input_text_ml" name="mail" placeholder="aaaaaaaaaaaaaaa" required="" type="text"><span class="mi_text_atmark">@</span><input class="mi_contactform_input_text_s" name="domein" placeholder="aaaa.jp" required="" type="text">
						</div>
						<div class="mi_contactform_block">
							<p class="mi_contactform_title">会社名<span class="mi_contactform_confilm_text">（個人事業主の場合は氏名を再度入力してください。）</span></p><input class="mi_contactform_input_text_l" name="company" placeholder="株式会社webinar" type="text">
						</div>
						<p class="mi_contactform_text"><input class="mi_contactform_checkbox" id="mi_privacy_check" name="privacy" required="" type="checkbox"><label for="mi_privacy_check"><a class="mi_overlay_privacy_open" href="#mi_overlay_privacy">個人情報の取り扱いについて</a>承諾しました。</label></p>
						<div class="mi_contactform_send_wrap compulsion_mgb_20">
							{if count($webinar.errors) == 0}
								<a href="javascript:void(0)" id="display_confirm"><button class="mi_contactform_send mi_overlay_confirm_open btn_webinar_participant_form">確認画面へ</button></a>
							{else}
								<button class="mi_contactform_send mi_overlay_confirm_open btn_webinar_participant_form" disabled>現在予約できません。</button>
							{/if}
						</div>
					</form>
				</div>
			</div>
		</section>
		<!-- LPウェビナー参加申し込みセクション end -->
		<!-- LPフッターセクション start -->
		<footer class="mi_lp_footer">
			
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
						<h2 class="mi_privacy_title">プライバシーポリシー</h2>
					</div>
					<dl class="mi_privacy_list">
						<dt><span class="mi_text_orange">●</span>個人情報の取り扱いについて</dt>
						<dd>株式会社meet in（以下「当社」）は、個人情報の適切な取り扱いを期しています。当社が提供する「meet in」によるサービス（以下、「当サービス」）へ のお申し込みについて、下記の事項をご理解いただき、同意の上で個人情報をご提供ください。</dd>
						<dd></dd>
						<dt><span class="mi_text_orange">●</span>個人情報の管理</dt>
						<dd>当社は、お客さまの個人情報を正確かつ最新の状態に保ち、個人情報への不正アクセス・紛失・破損・改ざん・漏洩などを防止するため、セキュリティシステムの維持・管理体制の整備・ 社員教育の徹底等の必要な措置を講じ、安全対策を実施し個人情報の厳重な管理を行ないます。</dd>
						<dd></dd>
						<dt><span class="mi_text_orange">●</span>個人情報の利用目的</dt>
						<dd>以下の利用目的のために、個人情報を取得致します。<br>
						その利用目的の範囲を超えて取得した個人情報を利用することはありません。<br>
						（1）当サービス利用に関する登録及び個人認証<br>
						（2）当サービス利用に関する料金請求その他の代金請求及び商品等の引渡し業務に関すること<br>
						（3）当サービス利用に関する問合せ内容の確認、回答、その他ご要望等への対応<br>
						（4）当サービスの利用に伴う電話連絡及び電子メール、資料のご送付<br>
						（5）当サービスの利用に関する新サービス、新メニューのご案内ならびに調査及び障害連絡<br>
						（6）当サービスの利用に関する保守及びメンテナンス等の運営<br>
						（7）当社によるサービスの開発およびマーケティング</dd>
						<dd></dd>
						<dt><span class="mi_text_orange">●</span>個人情報の第三者への開示・提供の禁止</dt>
						<dd>当社は、お客さまよりお預かりした個人情報を適切に管理し、次のいずれかに該当する場合を除き、個人情報を第三者に開示いたしません。<br>
						・お客さまの同意がある場合<br>
						・お客さまが希望されるサービスを行なうために当社が業務を委託する業者に対して開示する場合<br>
						・法令に基づき開示することが必要である場合</dd>
						<dd></dd>
						<dt><span class="mi_text_orange">●</span>個人情報の安全対策</dt>
						<dd>当社は、個人情報の正確性及び安全性確保のために、セキュリティに万全の対策を講じています。</dd>
						<dd></dd>
						<dt><span class="mi_text_orange">●</span>ご本人の照会</dt>
						<dd>お客さまがご本人の個人情報の照会・修正・削除などをご希望される場合には、ご本人であることを確認の上、対応させていただきます。</dd>
						<dd></dd>
						<dt><span class="mi_text_orange">●</span>法令、規範の遵守と見直し</dt>
						<dd>当社は、保有する個人情報に関して適用される日本の法令、その他規範を遵守するとともに、本ポリシーの内容を適宜見直し、その改善に努めます。</dd>
						<dd></dd>
						<dt><span class="mi_text_orange">●</span>個人情報の開示等の請求について</dt>
						<dd>提出して頂いた個人情報について、利用目的の通知、個人情報の開示、訂正、項目の追加または削除、消去や利用停止、提供停止を求める権利があります。自己の個人情報の開示等の請求を行う場合は、下記までご連絡ください。</dd>
						<dd></dd>
						<dt><span class="mi_text_orange">●</span>個人情報の取り扱いに関するお問い合わせ先</dt>
						<dd>
							株式会社meet in　個人情報対応窓口<br>
							住所：〒171-0022 東京都豊島区南池袋2-25-5 藤久ビル東5号館 4F<br>
							メール：<a href="mailto:privacy@meet-in.jp">privacy@meet-in.jp</a><br>
							担当責任：個人情報保護管理者
						</dd>
					</dl>
				</div>
			</div>
		</div>
		<!-- LPプライバシーコンテンツ end -->
		<!-- LPプライバシーポップアップコンテンツコンテンツ begin -->
		<div class="mi_overlay mi_overlay_confirm" id="mi_overlay_confirm">
			<div class="mi_modal_shadow"></div>
			<div class="mi_overlay_wrap mi_overlay_confirm_wrap">
				<div class="mi_overlay_contents mi_confirm_block">
					<div class="mi_overlay_colose">
						<a class="mi_overlay_colose_btn" href="javascript:void(0)"><img alt="閉じる" class="mi_privacy_close_img" src="/img/lp/ico-close.png"><br>
						閉じる</a>
					</div>
					<div class="mi_overlay_contents_title mi_confirm_title_wrap">
						<h2 class="mi_confirm_title">ウェビナー申し込み<br>確認画面</h2>
					</div>
					<table class="mi_confirm_content">
						<tr>
							<th>氏名</th>
							<td class="mi_confirm_name"></td>
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
							<th>会社名</th>
							<td class="mi_confirm_company"></td>
						</tr>
					</table>
					<button id="btn_webinar_participation" class="mi_default_button mi_confirm_send btn_webinar_participant_form">参加申請</button>
				</div>
			</div>
		</div>
		<!-- LPプライバシーコンテンツ end -->
	</div>
</body>
</html>
