{literal}

<style type="text/css">
<!--

/*-------------------------------------
	（モーダル）基本型
--------------------------------------*/
.modal-content {
  display: none;
  position: fixed;
  height: 100%;
  width: 100%;
  top: 0%;
  left: 0%;
  z-index: 100000002;
}

/*-----------------------
	ゲスト終了モーダル
-------------------------*/
button {
    outline: none;
    border: none;
    color: #fff;
    background-color: #0081CC;
    text-align: center;
    height: 40px;
    font-size: 16px;
    cursor: pointer;
}
.mi_default_button:hover { background-color: #A8DBFF;}
.mi_modal_default .mi_gest_close_buton {
  width: 250px;
}

/*-----------------------
	モーダル領域
------------------------*/
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

#modal-content .inner-wrap{
    position: fixed;
    width: 100%;
    bottom: 20%;
}

#modal-content .mi_default_button {
	margin: 35px 0 20px;
}

.mi_modal_default .mi_gest_close_mesg{
	margin-top: 8px;
	font-family: Meiryo;
	font-size: 12px;
	font-weight: normal;
	font-style: normal;
	font-stretch: normal;
	line-height: 1.17;
	letter-spacing: normal;
	text-align: center;
	color: #333333;
	background-color: #FFFFFF;
}

.mi_modal_default .mi_gest_close_mesg p{
	padding-top: 30px;
}

.mi_modal_default .mi_error_mesg{
	margin-top: 8px;
	font-family: Meiryo;
	font-size: 12px;
	font-weight: normal;
	font-style: normal;
	font-stretch: normal;
	line-height: 1.17;
	letter-spacing: normal;
	text-align: center;
	color: #333333;
	background-color: #FFFFFF;
}

.mi_modal_default .mi_error_mesg p{
	padding-top: 30px;
}

-->
</style>

{/literal}

<!-- ====================================== モーダルコンテンツ[start] ====================================== -->
<div class="modal-content" id="modal-content">
	<div class="mi_modal_shadow"></div>
	<div class="inner-wrap"></div>
</div>
<!-- ====================================== モーダルコンテンツ[end] ======================================== -->

<!-- ====================================== モーダルコンテンツ(ゲスト)[start] =============================== -->
<script id="guest-end-modal-template" type="text/x-handlebars-template">
<div class="mi_modal_default">
	<div class="mi_gest_close_mesg">
		<p>
		本日はお忙しいところ<br>
		誠にありがとうございました。<br>
		閉じるをクリックして終了してください。
		</p>
		<div class="btn_area" align="center">
			<button type="button" name="btn_guest_end" class="mi_default_button mi_gest_close_buton hvr-fade">閉じる</button>
		</div>
	</div>
</div>
</script>
<!-- ====================================== モーダルコンテンツ(ゲスト)[end] ======================================== -->
<!-- ====================================== モーダルコンテンツ(web-socket-error)[start] =============================== -->
<script id="web-socket-error-modal-template" type="text/x-handlebars-template">
<div class="mi_modal_default">
	<div class="mi_error_mesg">
		<p>
			サーバー接続エラー(web-socket-error)<br>
			<br>
			<br>ネットワークの接続エラーが発生してしまいます。
			<br>お手数ですが一度お使いの通信環境をご確認いただき、
			<br>ネットワーク(電波状況)が安定した場所でお試し下さい。
			<br>
			<br>一度ルームを退出いたします。
		</p>
		<div class="btn_area" align="center">
			<button type="button" name="btn_guest_end" class="mi_default_button mi_gest_close_buton hvr-fade">OK</button>
		</div>
	</div>
</div>
</script>
<!-- ====================================== モーダルコンテンツ(web-socket-error)[end] ======================================== -->


