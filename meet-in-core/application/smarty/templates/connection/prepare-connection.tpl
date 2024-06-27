<!DOCTYPE html>
<html>
<head>
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title></title>
<meta charset="utf-8">
<meta name="description" content="">
<meta name="author" content="">
<link rel="shortcut icon" href="/img/favicon.ico">
<link rel="stylesheet" href="/css/fonts.css">
<!--[if lt IE 8]>
<link rel="stylesheet" href="/css/ie7.css">
<!--<![endif]-->
<link rel="stylesheet" href="/css/reset.css">
<link rel="stylesheet" href="/css/base.css">
<link rel="stylesheet" href="/css/page.css">
<link rel="stylesheet" href="/css/jquery-ui.css">
<script src="/js/jquery-1.11.2.min.js"></script>
<script src="/js/jquery-ui.min.js"></script>

{literal}
<style type="text/css">
/*-------------------------------------
	（モーダル）基本型
--------------------------------------*/
.modal-content {
  display: none;
  position: fixed;
  height: 70%;
  width: 30%;
  top: 10%;
  left: 35%;
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
	background: #e3eff4;
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
	background: #b6c3cc url("../img/btn_close.png") no-repeat center center;
}

.modal-close:hover {
	cursor:pointer;
}

.modal-close:hover span {
	background: #0f507a url("../img/btn_close.png") no-repeat center center;
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



</head>
<body>

<!-- wrap start -->
<div id="mi_wrap">

  <!-- ヘッダー start -->
  <header>

    <!-- ヘッダー左 start -->
    <div class="mi_flt-l">

      <!-- タイトル start -->
      <div id="mi_header_title">
        <img src="/img/logo_header.png" alt="meet in" id="mi_header_logo"/>
      </div>
      <!-- タイトル end -->

    </div>
    <!-- ヘッダー左 end -->

    <!-- ヘッダー右 start -->
    <div class="mi_flt-r mi_login_btn">
      <!-- ログイン start -->
      <a href="">
        <div id="mi_login_text">ログイン</div>
        <span class="icon-login" id="mi_login_icon"></span>
      </a>
    <!-- ログイン end -->
    </div>
    <!-- ヘッダー右 end -->

  </header>
  <!-- ヘッダー end -->

  <!-- メインコンテンツ start -->
  <div id="mi_guest_main_contents" class="mi_clearfix">

    <!-- 背景 start -->
    <div class="mi_guest_background left_img">
    </div>
    <div class="mi_guest_background right_img">
    </div>
    <!-- 背景 end -->

    <!-- 商談接続画面 start -->
    <div class="mi_circle_base">
      <div class="mi_connect_circle">
				<div class="mi_connect_circle_inner">
	        <img src="/img/logo_h50.png" alt="meet in" class="mi_logo_image"/>
	        <p>
	          担当者がお伝えした番号を11桁で入力し、<br>
	          meet inへ接続してください。
	        </p>
	        <input type="text" id="connect_no" value="{$connect_no}" placeholder="000-0000-0000" class="mi_default_input">
	        <input type="text" id="user_info" value="" placeholder="山田 太郎" class="mi_default_input mi_second_input">
	        <button type="button" name="button" class="mi_default_button" id="connect">接続</button>
					<input type="hidden" id="connection_info_id"/>
					<input type="hidden" id="peer_id" value="{$peer_id}"/>
					<input type="hidden" id="target_peer_id"/>
      	</div>
			</div>
      
    </div>
    <!-- 商談接続画面 end -->

  </div>
  <!-- メインコンテンツ end -->

  <!-- フッター start -->
  <footer>
    <span class="mi_copyright">meet in Inc. All Rights Reserved</span>
  </footer>
  <!-- フッター end -->

<!-- ====================================== モーダルコンテンツ[start] ====================================== -->
<div class="modal-content" id="modal-content"> <!-- id="db-log2"  -->
	<div class="inner-wrap">
	</div>
	<a class="modal-close"><span>閉じる</span></a>
</div>
<!-- ====================================== モーダルコンテンツ[end] ======================================== -->

</div>
<!-- wrap end -->

{literal}
<script src="/js/jquery-1.11.2.min.js"></script>
<script type="text/javascript" src="/js/WebRTC/adapter.js"></script>
<script type="text/javascript" src="/js/WebRTC/peer.js"></script>
<script type="text/javascript" src="/js/WebRTC/MeetinRTC.js"></script>
<script type="text/javascript" src="/js/MeetinAPI.js"></script>
<script type="text/javascript" src="/js/WebRTC/MeetinRTC_UI.js"></script>
<script type="text/javascript" src="/js/connection/prepare-connection.js"></script>

<link rel="stylesheet" href="/css/jquery-ui.css">
<script src="/js/jquery-1.11.2.min.js"></script>
<script src="/js/jquery-ui.min.js"></script>

{/literal}

</body>
</html>
