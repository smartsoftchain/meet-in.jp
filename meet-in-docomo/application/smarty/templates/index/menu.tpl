{include file="./common/header.tpl"}

{literal}
<script>
$(function (){
	$('[id=tab_capture_plugin]').hide();
	$('[id=screen_share_plugin]').hide();
	$(window).load(function() {
		if (getBrowserType() == 'Chrome') {
			if(isInstalledTabCapture()) {
				$('[id=tab_capture_plugin]').hide();
			} else {
				$('[id=tab_capture_plugin]').show();
			}
			if(isInstalledScreenShare()) {
				$('[id=screen_share_plugin]').hide();
			} else {
				$('[id=screen_share_plugin]').show();
			}
		}

		// ストレージの初期化
		sessionStorage.clear();
	});
  //=============================================================
	// 招待文とURLをクリップボードにコピーするイベント処理
	//=============================================================
	const msgDisplayElement = $("div.copy_message_area"); // コピー後に表示するメッセージ表示要素
	const showMsgText = "コピーしました（3秒後に消えます）"; //　コピー後に表示するメッセージ本文
	let showMsgDuration = 3000; // コピー後等に表示するメッセージが消える秒数

	// 招待文・URLのコピー、SMS送信ボタン押下時のイベント処理
	$("#icon_copy_sentence, #icon_copy_url, #icon_sms_send").click(function(){
		// ルーム名を取得する
		var roomName = $("#room_name").val();
		// エラーメッセージの表示
		$("p.connect_alert").hide();


		// ルーム接続と同じバリデーション.
		if(!roomName.match(/^[0-9a-zA-Z\-_]{8,32}$/) || !roomName.match(/[-|_]/g)) {
			// ルーム名が存在しない場合はコピーエラーメッセージを出す
			$("p.connect_alert").text("ルーム名は半角英数字、「 アンダーバー(_) 」「ハイフン(-)」を合わせた8文字以上、32文字以内で入力して下さい");
			// エラーメッセージの表示
			$("p.connect_alert").show();
			return false;
		}

		if(roomName != "" ){
			// コピーするメッセージを保存する

			// ルーム名を作成する
			var roomType = "room";
			// ルームタイプを判別する（skyway: room_type:0 => room , mcu: room_type:1 => rooms）20210903現在
			if ($('#negotiation_room_type').val() === '1') {
				roomType = "rooms";
			}
			var roomUrl = "https://"+document.domain+"/"+roomType+"/"+roomName;
			// 同席モードの設定
			if($("#room_mode").prop('checked')){
				// モニタリングするにチェックが入っている場合
				roomUrl += "?room_mode=2"
			}

			// room URL コピー
			if($(this).attr("id") == "icon_copy_url"){
				// room URLコピー
				executeCopyTarget(roomUrl, msgDisplayElement, showMsgText, showMsgDuration);
			}
			// 招待文コピー
			else if($(this).attr("id") == "icon_copy_sentence"){
				const copyMessage =	replaceTagAtSendMessage(sendMessage, roomUrl);

				executeCopyTarget(copyMessage, msgDisplayElement, showMsgText, showMsgDuration);

			} else if ($(this).attr("id") == "icon_sms_send") {

				const msgDisplayElement = $('div.sms_send_message_area');
				const showMsgText = 'SMSを送信しました（3秒後に消えます）';

				// SMS送信モーダル表示、送信
				sendSMS(roomUrl, msgDisplayElement, showMsgText, showMsgDuration);

			}

		}else{
			// ルーム名が存在しない場合はコピーエラーメッセージを出す
			$("p.connect_alert").text("ルーム名を入力してください（3秒後に消えます）");
			// コピーメッセージの表示
			$("p.connect_alert").show();
			setTimeout(function(){
				$("p.connect_alert").fadeOut("slow");
			}, 3000);
		}
	});

	// ipad 縦横切り替え sms送信モーダルのスタイルを切り替える
	$(window).bind('orientationchange', function() {
		toIPadVerticalOrHorizontalStyle();
	});

	// ipad縦用と横用か見て、スタイルを一部書き換える処理
	function toIPadVerticalOrHorizontalStyle() {
		if ($('#mi_confirm_dialog_area').css('display') === 'block') {
			if (Math.abs(window.orientation) === 90) {
				// iPad横用のスタイルに部分的に書き換える。
				$('#send_text').css('width', '360px');
			} else {
				// iPad縦用のスタイルに部分的に書き換える。
				$('#mi_confirm_dialog_area').css('height', '525px');
				$('.sms_input_area').css({
					'width': '470px',
					'margin': '20px auto'
				});
				$('.input_textarea').css('margin', '10px 10px 10px 105px');
				$('.send_text_label').css('margin-right', '45px');
			}
		}
	}

	/**
	 * 接続ボタンクリック(ルーム指定用)
	 */
	$('#connect_room').on('click', function() {
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
			$(".connect_alert").text("ルーム名は未入力です");
			$(".connect_alert").show();
			setTimeout(function(){
				$(".connect_alert").fadeOut("slow");
				},5000);
			return;
		}

		if(!room_name.match(/^[0-9a-zA-Z\-_]{8,32}$/) || !room_name.match(/[-|_]/g)) {
			$(".connect_alert").text("ルーム名は半角英数字、「 アンダーバー(_) 」「ハイフン(-)」を合わせた8文字以上、32文字以内で入力して下さい");
			$(".connect_alert").show();
			setTimeout(function(){
				$(".connect_alert").fadeOut("slow");
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
`				// 人数制限
				message = 'ルーム名(' + room_name + ')は人数制限です';`
			}
			if(message != '') {
				$(".connect_alert").text(message);
				$(".connect_alert").show();
			}

		}).fail(function() {
			// ロック状態
			$(".connect_alert").text("通信エラー");
			$(".connect_alert").show();
		});
	}

	// お知らせ未読表示改修の際に、閉じるボタンが消えたが今後の復活可能性が0ではないため残しておく
	// お知らせを非表示にする
	$('#hide-notification').on('click', function() {
		$('#notification').fadeOut(200);
		// お知らせ閉じる状態をセッションに保持する
		$.get("/admin/keep-notification-close")
		.done(function() {
			console.log('お知らせ閉じる状態をセッションに保持');
		});
	});
	$('#webinar_help').tooltipster({
		functionInit: function (instance, helper) {
		},
		// チップが表示される前に実行される
		functionBefore: function (instance, helper) {
			instance.content('<span class="webianr_help_message">誰でも入室が可能なオープンウェビナーを開催できます。<br>ウェビナーテンプレートを設定しない場合は、<br>デフォルト設定が適応されます。</span>');
		},
		functionPosition: function (instance, helper, position) {
			position.coord.left -= 10;
			position.coord.top += 0;
			return position;
		},
		contentAsHTML: true,
		interactive: true,
		theme: 'Default',
		animation: 'fade',
		trigger: 'hover',
		zIndex: 200000001,
		content: $('.webianr_help_message'),
		contentCloning: false,
	});
});

</script>

<style type="text/css">
	.mi_main_contents{
		overflow: scroll;
	}

	.notice {
		z-index: 99;
		opacity: 1;
		margin: 0 auto;
		padding: 15px;
		margin-bottom: 20px;
		box-sizing: border-box;
		-webkit-border-radius: 4px;
		-moz-border-radius: 4px;
		border-radius: 4px;
		color: #a94442;
		background-color: #f2dede;
		border-color: #ebccd1;
		border: 1px solid;
		animation: fadeout 1s linear 3s 1;
		animation-fill-mode: forwards;
		-webkit-animation: fadeout 1s linear 3s 1;
		-webkit-animation-fill-mode: forwards;
		position:relative;
	}

	.room_content>* {
		display: block;
		margin: 0 auto;
		margin-bottom: 9px;
	}

	.create_room_content input.mi_default_input {
		box-sizing: border-box;
		text-align: left;
		height: 45px;
		margin-bottom: 0px;
		margin-right: 15px;
		padding: 12px 15px;
		width: 230px;
	}

	.create_room_content .mi_connect_button {
		font-size: 18px;
		font-weight: bold;
		height: 45px;
		line-height: 45px;
		margin-top: 0px;
		width: 145px;
		word-spacing: 6px;
	}

	.hvr-fade {
		-webkit-transform: perspective(1px) translateZ(0);
		transform: perspective(1px) translateZ(0);
		box-shadow: 0 0 1px transparent;
		overflow: hidden;
	}

	.clipboard_copy_button {
		color: #fff;
		height: 30px;
		width: 92px;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.create_room_content .room_copy_btn img {
		vertical-align: middle;
		margin: 0 10px 3px 0;
	}

	p.connect_alert {
		color: #ff2200;
	}
	.webinar_connect_alert{
		color: #ff2200;
	}

	#mi_main_contents {
		background: url(../img/lp/img-top.png) no-repeat center;
		background-size: cover;
		text-align: center;
		position: relative;
		padding-bottom: 0;
		height: calc(100vh - 50px);
		padding: 50px 0;
	}

	.mi_index_menu_img {
		width: 45%;
    	position: absolute;
    	top: calc(50% + 25px);
    	left: 59%;
		margin: 0 auto;
		object-fit: contain;
		/* opacity: 0.5; */
		max-width: 100vw;
		transform: translate(-70%, -50%);
	}

	.room_content {
		height: 360px;
		background: rgba(0, 0, 0, 0.5);
		display: grid;
		padding-bottom: 54px;
		position: relative;

		/* border: solid 2px #a7a7a7; */
		/* border-top-right-radius: 5px; */
		/* border-bottom-right-radius: 5px; */
		/* border-bottom-left-radius: 5px; */

		margin-top: 80px;　/* 2020/11/27 オープンセミナー部分一旦コメントアウトのため追加 */
	}

	.title_message {
		padding-top: 40px;
		text-align: center;
	}

	.text_style {
		font-size: 16px;
		color: #ffffff;
	}

	.mi_default_input {
		width: 236px;
		height: 42px;
		border-radius: 2px;
		border: solid 1px #979797;
		background-color: #ffffff;
	}

	.mi_content_area_index {
		position: absolute;
		top: 0px;
		right: 0px;
		bottom: 0px;
		left: 0px;
		width: 800px;
		height: 600px;
		margin: auto!important;
		overflow: auto;
	}

	.connect_room_btn {
		margin: 0 auto;
		width: 430px;
		height: 45px;
		border-radius: 100px;
		background: #0081CC;
		color: #fff;
		font-size: 20px;
		font-weight: bold;
		-webkit-transition: all 0.3s ease-in-out 0s;
		-moz-transition: all 0.3s ease-in-out 0s;
		-o-transition: all 0.3s ease-in-out 0s;
		transition: all 0.3s ease-in-out 0s;
	}

	.connect_room_btn:hover {
		color: #fff;
		background: #0B318F;
	}

	.connect_room_btn:active {
		background: #0B318F;
	}
	/*----------------------------------------------------------------
		headerのcss
	-----------------------------------------------------------------*/

	.header_wrap {
		height: 50px;
		background-color: #ffffff;
	}

	.mi_header_list {
		display: inline;
	}

	.mi_header_list li {
		padding: 5px;
		position: relative;
	}

	.mi_header_list li:hover .accordion_style{
		margin-top: 0px;
	  visibility: visible;
	  opacity: 1;
	  height: auto;
	}

	.mi_header_list > ul {
		width: 100%;
		display: flex;
	}

	.li_wrap {
		display: grid;
		height: 40px;
		width: 70px;
		font-size: 10px;
		text-align: center;
		line-height: 1.5;
	}


	.li_wrap img {
		width: 20px;
		margin: 0 auto;
	}

	.accordion_style{
		opacity: 0;
	  width: 140px;
	  background-color: #ffffff;
	  box-shadow: 0px 4px 6px 2px rgba(128, 128, 128, 0.24);
	  -webkit-transition: all .2s ease;
		transition: all .2s ease;
		position: absolute;
		padding: 0;
		margin-top: -10px;
	  width: 150px;
	  top: 50px;
	  left: -30px;
		height: 0;
	  overflow: hidden;
	}

	.accordion_style li{
		height: 50px;
	  line-height: 50px;
		font-size: 12px;
		color: #636363;
		text-align: center;
		position: relative;
		padding: 0;
	}

	.accordion_style li:hover {
		background: #f5f5f5;
	}

	.header_icon_style{
		width: 20px;
		height: 20px;
		font-size: 18px;
		margin: 0 auto;
		cursor: pointer;
	}

	/* ミッション表示エリア */
	.mission_content {
		border: solid 2px #0081CC;
		box-sizing: border-box;
	  background-color: rgba(0,0,0,0.8);
		padding: 20px 0;
		position: relative;
	  margin-top: 35px;
	}

	.mission_content_close_btnWrap {
		width: 35px;
		position: absolute;
		top: 0;
		right: 0;
		padding: 10px;
		cursor: pointer;
	}

	.mission_content_close_btn {
		display: inline-block;
		position: relative;
		left: 5px;
		margin: 0 20px 0 7px;
		padding: 0;
		width: 2px;
		height: 25px;
		background: #ffffff;
		transform: rotate(45deg);
	}

	.mission_content_close_btn::before {
		display: block;
		content: "";
		position: absolute;
		top: 50%;
		left: -11px;
		width: 26px;
		height: 2px;
		margin-top: -2px;
		background: #ffffff;
	}


	.mission_text {
		color: #ffffff;
		display: inline-block;
	  padding-bottom: 20px;
	}

	.introduct_btn {
		display: block;
	  border: solid 2px #0081CC;
	  color: #0081CC;
	  border-radius: 3px;
	  padding: 10px 0;
	  width: 300px;
	  margin: 0 auto;
	  line-height: 1;
		cursor: pointer;
		-webkit-transition: all 0.3s ease-in-out 0s;
		-moz-transition: all 0.3s ease-in-out 0s;
		-o-transition: all 0.3s ease-in-out 0s;
		transition: all 0.3s ease-in-out 0s;
	}
	.introduct_btn svg {
		fill: #0081CC;
		-webkit-transition: all 0.3s ease-in-out 0s;
		-moz-transition: all 0.3s ease-in-out 0s;
		-o-transition: all 0.3s ease-in-out 0s;
		transition: all 0.3s ease-in-out 0s;
	}
	.introduct_btn:hover {
		border: solid 2px #fff;
		color: #fff;
	}
	.introduct_btn:hover svg {
		fill: #fff;
	}
	.mission_content_close_btnText {
		display: block;
		line-height: 1;
		margin-top: -4px;
		color: #ffffff;
		font-size: 11px;
	}
	.chk_room_mode{
		width : 19px;
	}

	.mi-infotext {
		font-size: 13px;
		margin-bottom: -27px;
		margin-top: 10px;

	}
	.mi-infotext__tel{
		font-size: 16px;
		font-weight: bold;
    	display: inline-block;
	}

	.mi-infotext__tel > a{
		color: #ffffff;
	}

	#icon-history {
		margin-top: -5px;
	}

	.audio_text_title {
		margin-left: 8px;
	}

	.log_wrapper_top {
		width: 150px;
		height: 30px;
		opacity: 100%;
		top: 55px;
		right: 320px;
		position: absolute;
	}

	.camera_message_area {
		color: white;
		font-size: 14px;
		margin-bottom: -7px;
		margin-top: 5px;
	}

	.mic_message_area {
		color: white;
		font-size: 14px;
		margin-bottom: -7px;
		margin-top: 5px;
	}

	.connection_message_area {
		color: white;
		font-size: 14px;
		margin-bottom: -7px;
		margin-top: 5px;
	}

	.message_area_camera_icon {
		width: 15px;
		margin-right: 5px;
    	position: relative;
    	top: -7px;
	}

	.message_area_mic_icon {
		width: 13px;
		margin-right: 5px;
    	position: relative;
    	top: -7px;
	}

	.message_area_connection_icon {
		width: 15px;
		margin-right: 5px;
    	position: relative;
    	top: -7px;
	}

	.message_link {
		color: white!important;
		text-decoration: underline;
	}

	.message_link:hover {
		color: #0081CC!important;
		text-decoration: underline;
	}

	.room_name_info {
		color: white;
		font-size: 13px;
	}

	/* ルーム入室のタブ化に伴うスタイル */
	.room_content_tab{
		position: relative;
		color: #fff;
		margin-top: 80px;
		font-size: 16px;
	}
	.tab_meetin_room,
	.tab_webinar_room{
		float: left;
		border: solid 2px #a7a7a7;
		border-bottom: 0;
		padding: 5px 30px;
		border-top-left-radius: 5px;
		border-top-right-radius: 5px;
		cursor: pointer;
		background-color: #000000;
	}
	.tab_webinar_room{
		margin-left: 10px;
	}
	.room_content_tab_icon{
		margin-right: 10px;
		color: #0081CC;
	}
	.current_room_content_tab{
		background-color: #684915;
	}
	.current_room_content_tab_icon{
		color: #fff !important;
	}
	.select_webinar_template_area{
		color: #fff;
		text-align: left;
		padding-left: 115px;
	}
	.select_webinar_template{
		box-sizing: border-box;
		text-align: left;
		height: 45px;
		width: 270px;
		margin-bottom: 0px;
		margin-right: 15px;
		padding: 12px 15px;
		background-color: #000;
		color: #fff;
	}
	.webinar_help_icon{
		font-family: 'Material Icons';
		font-weight: normal;
		font-style: normal;
		font-size: 14px;
		line-height: 1;
		letter-spacing: normal;
		text-transform: none;
	}
	.clear_both{
		clear: both;
	}
	.display_none{
		display: none;
	}


	.offer_link {
		text-align: right;
		color: #fff;
		margin-right: 30px;
	}
	.offer_link a{
		color: #fff;
	}
	.offer_link a:hover {
		color: #0081CC;
	}


</style>

{/literal}

<!-- メインコンテンツ start -->
<div id="mi_main_contents" class="mi_main_contents">
	{* <div class="mi_index_menu_img_wrap">
		<img alt="" class="mi_index_menu_img" src="/img/lp/main-grobe.png">
	</div> *}
	<!-- トップナビ start -->
	<div id="mi_top_nav">
		{if $notification}
			<div class="notification {$close}" id="notification">
				<span class="icon-notification"></span>
				<a href="/notification/detail?id={$notification.id}">{$notification.title}</a>
				{* <button type="button" id="hide-notification">閉じる</button> お知らせ未読表示改修の際に、閉じるボタンが消えたが今後の復活可能性が0ではないため残しておく*}
			</div>
		{/if}
	</div>
	<!-- トップナビ end -->
	<div id="mi_content_area">
		<div class="notice" id="tab_capture_plugin" style="display: none;">
			オンライン録画がインストールされていません。
			インストールは<a href="https://chrome.google.com/webstore/detail/%E3%82%AA%E3%83%B3%E3%83%A9%E3%82%A4%E3%83%[…]2%E7%94%BB/hnfbpimaiihmdfkokfhlpmadkilhdhee?hl=ja&authuser=0" target="_blank">こちら</a>
		</div>
		<div class="notice" id="screen_share_plugin" style="display: none;">
			オンライン画面共有がインストールされていません。
			インストールは<a href="https://chrome.google.com/webstore/detail/%E3%82%AA%E3%83%B3%E3%83%A9%E3%82%A4%E3%83%B3%E7%94%BB%E9%9D%A2%E5%85%B1%E6%9C%89/akgccelpfdgfonjmcappebaiigoacebp?hl=ja&authuser=0" target="_blank">こちら</a>
		</div>

		<!-- コンテンツタイトル start -->
		<!-- <div class="mi_content_title">
			<span class="icon-meet-in mi_content_title_icon"></span>
			<h1>ルーム作成</h1>
		</div> -->

		<!-- ルーム作成エリア start -->
		<div class="create_room_content">
			<!-- 2020/11/27 オープンセミナー部分コメントアウト  start      -->

			<!-- <div class="room_content_tab">
				<div id="tab_meetin_room" class="tab_meetin_room current_room_content_tab"><span class="icon-account-parsonal room_content_tab_icon current_room_content_tab_icon"></span><span>商談・会議</span></div>
				<div id="tab_webinar_room" class="tab_webinar_room">
					<span class="icon-url room_content_tab_icon">
					</span><span>ウェビナー</span>
					<span id="webinar_help"><i class="webinar_help_icon">help_outline</i></span>
				</div>
				<div style="display: none;">
					<span class="webianr_help_message">QQ</span>
				</div>
				<div class="clear_both"></div>
			</div> -->

			<!-- 2020/11/27 オープンセミナー部分コメントアウト  end      -->
			<div id="meetin_room_content" class="room_content">
				<div class="title_message text_style">好きな文字列を入力してルームを作成してください。</div>
				<p class="room_name_info">簡素なルーム名の場合、ご利用者間での重複、不意のゲスト参入の確率が高まります。<br>ルーム名は半角英数字、アンダーバー(_)、ハイフン(-)で8文字以上、32文字以内で入力して下さい。</p>
				<p class="connect_alert" style="display: none;"></a>
				<div class="create_room_form">
					<span class="http_text text_style">https://docomodx.aidma-hd.jp/room/</span>
					<input type="text" id="room_name" value="{$room_name}" placeholder="ルーム名" class="mi_default_input">
					<button type="button" name="button" class="mi_connect_button connect_room_btn" id="connect_room">接続</button>
				</div>
				{if $browser != "IE"}
					<div class="room_mode">
					<input type="checkbox" name="room_mode" id="room_mode" class="chk_room_mode" {if $room_mode==2} checked="checked"{/if} />
					<span class="text_style"><label for="room_mode">モニタリングする</label></span>
					</div>
				{else}
					<div style="margin-top:20px;margin-bottom:30px;"></div>
				{/if}
				<div class="create_room_btn">
					<a href="javascript:void(0)" class="room_copy_btn" id="icon_copy_url"><img src="/img/lp/ico-copy_FFFFFF.png" class="" alt="">URLコピー</a>
					<a href="javascript:void(0)" class="room_copy_btn" id="icon_copy_sentence"><img src="/img/lp/ico-mail.png" class="" alt="">招待文をコピー</a>
					<a href="javascript:void(0)" class="room_copy_btn" id="icon_sms_send"><img src="/img/lp/ico-sms.svg" class="" alt="">SMS送信</a>
				</div>
				<div class="copy_message_area" style="display: none;"></div>
				<div class="sms_send_message_area" style="display: none;"></div>
				{* <div class="camera_message_area">
					<img alt class="message_area_camera_icon" src="/img/lp/create_room_btn_camera_icon.svg">
					カメラのトラブルは<a onclick="window.open('/lp/faq/video/camera_help.mp4', '_blank', 'location=yes,height=500,width=600,scrollbars=no,status=yes');" class="message_link">こちら</a>
				</div>
				<div class="mic_message_area">
					<img alt class="message_area_mic_icon" src="/img/lp/create_room_btn_mic_icon.svg">
					マイクのトラブルは<a onclick="window.open('/lp/faq/video/mic_help.mp4', '_blank', 'location=yes,height=500,width=600,scrollbars=no,status=yes');" class="message_link">こちら</a>
				</div>
				<div class="connection_message_area">
					<img alt class="message_area_connection_icon" src="/img/lp/create_room_btn_connection_icon.svg">
					接続のトラブルは<a onclick="window.open('/lp/faq/connection_help.pdf', '_blank', 'location=yes,height=500,width=600,scrollbars=no,status=yes');" class="message_link">こちら</a>
				</div> *}

				<div class="text_style mi-infotext">サポートデスク<br />
				<span class="mi-infotext__tel">0120-467-481</span><br />
				</div>
			</div>
			<!-- 2020/11/27 オープンセミナー部分コメントアウト  start      -->

			<!-- <div id="webinar_room_content" class="room_content display_none">
				<div class="title_message text_style">好きな文字列を入力してウェビナー会場を作成してください。</div>
				<p class="webinar_connect_alert" style="display: none;"></a>
				<div class="create_room_form">
					<span class="http_text text_style">https://meet-in.jp/webinar/</span>
					<input type="text" id="room_webinar_name" value="" placeholder="ルーム名" class="mi_default_input">
					<button type="button" name="button" class="mi_connect_button connect_room_btn" id="connect_webinar_room">入場</button>
				</div>
				<div class="select_webinar_template_area">
					ウェビナーテンプレート
					<select name="select_webinar_template" class="select_webinar_template">
						<option value="">デフォルトを使用する</option>
						{foreach from=$openSeminarTemplates item=row}
							<option value="{$row.id}">{$row.name}</option>
						{/foreach}
					</select>
				</div>

				<div class="mic_message_area">マイクのトラブルは<a onclick="window.open('/lp/faq/video/mic_help.mp4', '_blank', 'location=yes,height=500,width=600,scrollbars=no,status=yes');" class="message_link">こちら</a></div>
				<div class="camera_message_area">カメラのトラブルは<a onclick="window.open('/lp/faq/video/camera_help.mp4', '_blank', 'location=yes,height=500,width=600,scrollbars=no,status=yes');" class="message_link">こちら</a></div>
				<div class="connection_message_area">接続のトラブルは<a onclick="window.open('/lp/faq/connection_help.pdf', '_blank', 'location=yes,height=500,width=600,scrollbars=no,status=yes');" class="message_link">こちら</a></div>

				<div class="text_style mi-infotext">サポートデスク ： <span class="mi-infotext__tel">0120-979-542</span><br />
				土日祝日を除く平日10:00～18:00</div>
			</div> -->

			<!-- 2020/11/27 オープンセミナー部分コメントアウト  end      -->
		</div>
		<!-- ルーム作成エリア end -->

		<!-- <div class="notice" style="margin-top:15px;">
		【お詫び】<br>
		2019年7月10（水）15:30〜16:55の間、ファイルアップロード機能においてシステム障害が発生しておりました。<br />
		ご不便をお掛け致しまして、誠に申し訳ございません。<br />

		</div> -->


		<!-- ミッション表示エリア start -->
		<!-- <div class="mission_content">
			<div class="mission_content_close_btnWrap">
				<div class="mission_content_close_btn"></div>
				<span class="mission_content_close_btnText">閉じる</span>
			</div>
			<p class="mission_text">
				私達はオンライン商談を世界に広めるミッションを持っています。<br>
				オンライン商談にご興味のある方にぜひmeet inをご紹介ください。
			</p>

			<a href="./introduct_modal.htm" class="introduct_btn">
				<span>
					<svg width="15px" height="15px" viewBox="0 0 15 15" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
					    <g id="Symbols" stroke="none" stroke-width="1" fill-rule="evenodd">
					        <g id="parts/紹介ボタン_top" transform="translate(-227.000000, -77.000000)">
					            <g id="parts/紹介ボタン">
					                <g id="btn/招待文" transform="translate(180.000000, 68.000000)">
					                    <g id="Group" transform="translate(47.000000, 9.000000)">
					                        <g id="icon/copy">
					                            <path d="M7.5,7.17785714 C5.8455,7.17785714 4.5,5.89642857 4.5,4.32071429 C4.5,2.745 5.8455,1.46357143 7.5,1.46357143 C9.1545,1.46357143 10.5,2.745 10.5,4.32071429 C10.5,5.89642857 9.1545,7.17785714 7.5,7.17785714 M10.3185,7.65857143 C11.343,6.87357143 12,5.67071429 12,4.32071429 C12,1.95357143 9.9855,0.035 7.5,0.035 C5.0145,0.035 3,1.95357143 3,4.32071429 C3,5.67071429 3.657,6.87357143 4.6815,7.65857143 C1.93725,8.64071429 0,11.0671429 0,14.3207143 L1.5,14.3207143 C1.5,10.7492857 4.19175,8.60642857 7.5,8.60642857 C10.80825,8.60642857 13.5,10.7492857 13.5,14.3207143 L15,14.3207143 C15,11.0671429 13.06275,8.64071429 10.3185,7.65857143" id="profile-[#1335]"></path>
					                        </g>
					                    </g>
					                </g>
					            </g>
					        </g>
					    </g>
					</svg>
					meet inを紹介する
				</span>
			</a>
		</div> -->
		<!-- ミッション表示エリア end -->

		<!-- コンテンツタイトル end -->

		<!-- お知らせ表示エリア begin -->
		<!-- <div class="notification_area">
			<div class="title_message">News</div>
			<div class="notification">
				<div class="notification_row">

					<span class="date">2018.03.04</span>
					<span class="message">
●meet inの接続方法を「URL接続」に変更しました。<br><br>
好きなURLを作成しクリックすることで接続できるように変更しました。<br>
URLの作成は、LPサイトのTOPページまたは管理画面から行えます。<br><br>
詳細は<a href="/180230_meet-in.pdf" target="_blank">マニュアル</a>を参照してください。<br><br>
					</span>
//<a href=""サイトのURL/sample1.pdf"">詳しくはこちら<img src=""./PDFのアイコン.gif""></a>
					<span class="date">2017.11.30</span>
					<span class="message">
●meet-inアクセス障害の件について<br>
11月30日15時35分ほどから1時間程度障害が発生し、アクセス出来ない状況が続いておりました。<br>
16時45分、復旧し通常通りご利用できるようになりました。<br>
原因につきましては、サーバーの運用元で障害が発生したためだと判明いたしました。<br>
ご利用中の皆様にご迷惑、ご不便をおかけしてしまい申し訳ございませんでした。<br><br>
					</span>

					<span class="date">2017.09.26</span>
					<span class="message">
●meet in録画機能の不具合に関して<br>
google拡張機能の「meet in録画機能」が使用できなくなる不具合が発生しておりました。<br>
こちらの件は、Google Chromeのバージョンを最新にしていただくことで解決いたします。<br>
<br>
お手数ですが、バージョンを確認していただき最新の状態に更新をお願いいたします。<br>
※バージョン更新後、ブラウザを再起動をお願いします。<br>
<br>
正常動作するバージョン<br>
バージョン: 61.0.3163.100（Official Build）<br>
異常動作するバージョン<br>
バージョン: 60.0.3112.113（Official Build）<br>
<br>
バージョンの確認方法は<a href="/news/Google_crome_ver.pdf" target="_blank">こちら</a>を参照してください。<br>
<br>
					</span>

					<span class="date">2017.07.06</span>
					<span class="message">
●複数人接続に対応し、2名以上での接続が出来るようになりました。<br>
※接続人数の上限は4人までになります。<br>
<br>
<br>
●Internet Explorerでの接続に対応致しました。<br>
※IEブラウザを含む接続人数の上限は2人までになります。<br>
<br>
<br>
●ユーザインターフェース及び、不具合の改善を行いました。<br>
・ビデオ、資料、画面共有フレームが自由に移動、拡大&縮小出来るようになりました。<br>
・資料データの画質を向上致しました。<br>
・その他、デザインの微調整を行いました。<br>
・接続に関する不具合の改善を致しました。<br>
					</span>
				</div>
			</div>
		</div> -->
		<!-- お知らせ表示エリア end -->

	</div>
	<!-- コンテンツエリア start -->
	<div class="offer_link"><a href="https://pixta.jp/" target="_blank" rel="noopener">画像素材</a>：PIXTA</div>
</div>
<!-- メインコンテンツ end -->

<script type="text/javascript" src="/js/index/menu.js?{$application_version}"></script>
<script type="text/javascript" src="/js/share_room_url.js?{$application_version}"></script>
