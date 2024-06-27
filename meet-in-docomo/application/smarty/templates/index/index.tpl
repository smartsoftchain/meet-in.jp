<!DOCTYPE html>
<html lang="ja" prefix="og: http://ogp.me/ns# fb: http://ogp.me/ns/fb# article: http://ogp.me/ns/article#">

<head>
	<title>
		dXオンライン営業 | いつでも、どこでも簡単にweb会議
	</title>
	<meta charset="utf-8">
	<meta content="dXオンライン営業は、いつでも、どこでも簡単にweb会議ができるビデオチャットツールです。" name="description">
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
	<script src="/js/index/top.js">
	</script>
</head>


{literal}

<script>
	//プライバシーモーダル
	$(function() {
		$('.mi_overlay_privacy_open').click(function(){
			$('#mi_overlay_privacy').fadeIn();
		});
		$('.mi_overlay_colose_btn').on('click',function(){
			$(this).parents(".mi_overlay").fadeOut("first");
		});
	});
</script>

<style>

#mi_admin_login_form_innner {
	left: unset;
	right: unset;
	bottom: unset;
	width: unset;
	min-height: unset;
	text-align: unset;
	margin-top: unset;
	top: 35%;
	height: 25%;
}

.login__form--area p {
	color: #FFFFFF;
	font-size: 12px;
}

.login_bar {
	display: block;
    text-align: center;
	margin-top: 15px;
    /*width: 300px;*/
}

.daccount_login {
	width: 200px;
}

#mi_admin_login_form p {
	margin-top: 25px;
}

.mi_connect_input_wrap {
    position: absolute;
    /*bottom: 59px;*/
    left: 4px;
    padding: 25px 30px;
	top:172px!important;
    /*background: rgba(254,170,0,0.4);*/
	background: #E5F4FF;
	width: 420px!important;
    left: -35px;
}
.mi_connect_input_title {
    font-weight: bold;
    /*font-size: 19px;*/
    /*margin-bottom: 9px;*/
	color: #737373;
    font-size: 22px!important;
    text-align: left;
    padding: 5px!important;
    margin: 0px!important;
}
.mi_connect_input_text {
    /*margin-bottom: 19px;*/
 /*   font-size: 11px;*/
	color: #737373;
	text-align: left;
    font-size: 13px!important;
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
  	height: 44px;
  	font-size: 13px;
    /*margin-right: 19px;*/
    vertical-align: top;
	width: 262px!important;
    text-align: left!important;
    margin: 17px 20px 0px 0px;
}

#mi_connect_input_button {
    /*width: 153px;*/
    height: 44px;
    border-radius: 99px;
    /*background-color: #FFAA03;*/
    font-size: 19px;
    font-weight: bold;
	width: 120px!important;
    margin: 17px 0px 0px 0px!important;
    border-radius: 30px!important;
}
.connect_alert_top {
    /*background: #8A3400 0% 0% no-repeat padding-box;
    border-radius: 12px;*/
    /*opacity: 0;*/
    line-height: 14px;
    margin: 0!important;
    padding: 5px;
    text-align: left;
    letter-spacing: -1;
    color: red;
	font-weight:bold;
}
/*.connect_alert:before {
    content: url(../img/round-warning-25px.png);
    padding: 4px 10px 5px 10px;
}*/

.mi_logo_image {
	width: 200px!important;
}

.mi_privacy_link {
	margin-top: 10px;
    display: inline-block;
}

#mi_admin_login_form p {
	width: 410px;
}

}

</style>

{/literal}

<body>

	<!-- wrap start -->
	<div id="mi_wrap">

		<!-- ヘッダー start -->
	  <header id="login_header">

			<!-- ヘッダー左 start -->
			<div class="mi_flt-l">

				<!-- タイトル start -->
				<div id="mi_header_title">
				</div>
				<!-- タイトル end -->

			</div>
			<!-- ヘッダー左 end -->

		</header>
		<!-- ヘッダー end -->

		<!-- メインコンテンツ start -->

		<!-- ロゴの表示-->
		<div style="position:absolute;right:20px;top:20px">
			<img src="/img/logo_h50-2.png" alt="meet in" class="mi_logo_image"/>
		</div>

		<div id="mi_admin_login_form">

			<!-- 背景 start -->
			<div class="mi_half_background mi_img_slide_wrap">
				<div class="mi_img_slide_wrap_inner">
					<div class="mi_img_slide_list mi_login_let_img_1"></div>
				</div>
			</div>
			<!-- 背景 end -->

			<!-- 商談接続画面 start -->
			<div class="mi_half_background mi_admin_login_form_wrap">
				<div id="mi_admin_login_form_innner">
					<img src="/img/logo_dx_docomo.png">
	          		<a href="/index/d-account-login" class="login_bar"><img src="/img/daccount_login.png" alt="login" class="daccount_login"/></a>
					<!-- 利用規約モーダル -->
					{* <a href="#mi_overlay_privacy" class="mi_overlay_privacy_open">利用規約</a> *}
					<a href="https://biz-dxstore.docomo.ne.jp/products/detail/ca1607f8-250a-11ec-a1a5-0964db1e03b4"  target="_blank" rel="noopener" class="mi_privacy_link">利用規約</a>

					<!--　新しい入力フォーム -->
					<div class="mi_connect_input_wrap">
						<p class="mi_connect_input_title">接続はこちらから</p>
						<p class="mi_connect_input_text">共有されたルーム名を入力してください</p>
						<p class="connect_alert_top" style="display: none;"></p>
						<input type="text" id="room_name" placeholder="ルーム名" class="mi_connect_input">
						<button id="mi_connect_input_button">接続</button>
					</div>
				</div>
			</div>
			<!-- 商談接続画面 end -->
		</div>
		<!-- メインコンテンツ end -->
		<!-- 利用規約コンテンツコンテンツ begin -->
		<div class="mi_overlay mi_overlay_privacy" id="mi_overlay_privacy">
			<div class="mi_modal_shadow"></div>
			<div class="mi_overlay_wrap mi_overlay_privacy_wrap">
				<div class="mi_overlay_contents mi_privacy_block">
					<div class="mi_overlay_colose">
						<a class="mi_overlay_colose_btn" href="javascript:void(0)"><img alt="閉じる"
								class="mi_privacy_close_img" src="/img/lp/ico-close.png"><br>
							閉じる</a>
					</div>
					<div class="mi_overlay_contents_title mi_privacy_title_wrap">
						<h2 class="mi_privacy_title">プライバシーポリシー</h2>
					</div>
					<dl class="mi_privacy_list">
						<dt><span class="mi_text_orange">●</span>個人情報の取り扱いについて</dt>
						<dd>株式会社meet in（以下「当社」）は、個人情報の適切な取り扱いを期しています。当社が提供する「meet in」によるサービス（以下、「当サービス」）へ
							のお申し込みについて、下記の事項をご理解いただき、同意の上で個人情報をご提供ください。</dd>
						<dd></dd>
						<dt><span class="mi_text_orange">●</span>個人情報の管理</dt>
						<dd>当社は、お客さまの個人情報を正確かつ最新の状態に保ち、個人情報への不正アクセス・紛失・破損・改ざん・漏洩などを防止するため、セキュリティシステムの維持・管理体制の整備・
							社員教育の徹底等の必要な措置を講じ、安全対策を実施し個人情報の厳重な管理を行ないます。</dd>
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
						<dd>提出して頂いた個人情報について、利用目的の通知、個人情報の開示、訂正、項目の追加または削除、消去や利用停止、提供停止を求める権利があります。自己の個人情報の開示等の請求を行う場合は、下記までご連絡ください。
						</dd>
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
		<!-- 利用規約コンテンツ end -->
	</div>
	<!-- wrap end -->
</body>

{literal}
<script>
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
            $(".connect_alert_top").show();
            setTimeout(function(){
                $(".connect_alert_top").fadeOut("slow");
                },5000);
            return;
        }
        if(!room_name.match(/^[0-9a-zA-Z\-_]{8,32}$/) || !room_name.match(/[-|_]/g)) {
            $(".connect_alert_top").text("ルーム名は半角英数字、「 アンダーバー(_) 」「ハイフン(-)」を合わせた8文字以上、32文字以内で入力して下さい");
            //$(".connect_alert_top").text("ルーム名は半角英数字、「 アンダーバー(_) 」「ハイフン(-)」の32文字迄です");
            $(".connect_alert_top").show();
            setTimeout(function(){
                $(".connect_alert_top").fadeOut("slow");
            },5000);
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
</html>
