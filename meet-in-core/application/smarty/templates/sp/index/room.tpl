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
<link rel="stylesheet" href="/css/reset.css?{$application_version}">
<link rel="stylesheet" href="/css/sp/room.css?{$application_version}">
<link rel="stylesheet" href="/css/sp/button.css?{$application_version}">
<!-- web移植 -->
<script src="/js/jquery-1.11.2.min.js?{$application_version}"></script>
<script src="/js/jquery-ui.min.js?{$application_version}"></script>
<script src="/js/common.js?{$application_version}"></script>
<script src="/js/platform.js?{$application_version}"></script>
<script src="/js/datadog-tag.js?{$application_version}"></script>

<script type="text/javascript" src="/js/sp/index/top.js"></script>

{literal}
<script>
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
		else if (paramArray.error == '4') {
			$("p.connect_alert").text("ご契約の期限が終了した為ログインできません。");
			// エラーメッセージの表示
			$("p.connect_alert").show();
		}
		else if (paramArray.error == '5') {
			$("p.connect_alert").text("ご契約の期限が開始前の為ログインできません。");
			// エラーメッセージの表示
			$("p.connect_alert").show();


		}else if(paramArray.error == '10') {
			$("p.connect_alert").text("オペレーターが入室していません。");
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
	const msgDisplayElement = $("div.copy_message_area"); // コピー後に表示するメッセージ表示要素
	const showMsgText = "コピーしました"; //　コピー後に表示するメッセージ本文
	let showMsgDuration = 3000; // コピー後等に表示するメッセージが消える秒数
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
		if (roomName == null || roomName == '') {
			$("p.connect_alert").text("ルーム名は未入力です");
			$("p.connect_alert").show();
			setTimeout(function(){
				$("p.connect_alert").fadeOut("slow");
			}, showMsgDuration);
			// 32文字 半角英数字か判別する
		} else if (!roomName.match(/^([a-zA-Z0-9\-_]{1,32})$/)) {
			// ルーム名が存在しない場合はコピーエラーメッセージを出す
			$("p.connect_alert").text("ルーム名は半角英数字、アンダーバー(_)、ハイフン(-)の32文字迄です");
			// エラーメッセージの表示
			$("p.connect_alert").show();
			setTimeout(function(){
				$("p.connect_alert").fadeOut("slow");
			}, showMsgDuration);
			return false;
		}

		if(roomName != "" ){
			// コピーするメッセージを保存する
			var roomUrl = "https://"+document.domain+"/room/"+$("#room_name").val();
			// 同席モードの設定
			if($("#room_mode").prop('checked')){
				// モニタリングするにチェックが入っている場合
				roomUrl += "?room_mode=2"
			}
			if($(this).attr("id") == "icon_copy_sentence"){
				// 招待文コピーの場合
				copyMessage = [
					"いつも大変お世話になっております。\n",
					"下記の日程でオンラインビデオチャットをお願いいたします。\n",
					"\n",
					"■00/00　00:00～00:00\n",
					"\n",
          "時間になりましたら、下記URLよりルームにアクセスください。\n",
					"招待者がログインするまで入室はできません。\n",
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
			executeCopyTarget(roomUrl, msgDisplayElement, showMsgText, showMsgDuration);
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
			$(msgDisplayElement).text(showMsgText);
			$(msgDisplayElement).show();
			setTimeout(function(){
				$(msgDisplayElement).fadeOut("slow");
			}, showMsgDuration);
		}else if(ua.indexOf('trident/7') != -1){
      // IEの場合最初にコピーがダイヤログが出てきてcopyBtnHoverFlg判別ができずにコピーできないので
      window.clipboardData.setData('Text', copyMessage);
    }
		copyMessage = "";
	};
});
/**
 * ルームURL又は招待文 をコピーする
 * @param {copyTarget} copyTarget ルーム名 や　招待文 
 * @param {displayElement} displayElement コピー完了メッセージ表示する箇所の要素 
 * @param {showMsgText} showMsgText コピー完了メッセージ本文 
 * @param {showMsgDuration} showMsgDuration コピー完了メッセージを表示する時間 
 */
function executeCopyTarget(copyTarget, displayElement, showMsgText, showMsgDuration) { 

	// ブラウザのコピー処理を実行する
	navigator.clipboard.writeText(copyTarget)
	.then(function () {
		// コピーメッセージの表示
		displayElement.text(showMsgText);
		displayElement.show();
		setTimeout(function(){
				displayElement.fadeOut("slow");
		}, showMsgDuration);
	}, function() {
			console.log(error);
	});
}
</script>
{/literal}

{literal}
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
<body>
	<div class="top_background">
		<img src="/img/sp/png/earth.png" class="earth_background">
		<img src="/img/sp/png/star.png" class="star_background">
	</div>
	<div class="topTitle__wrap">
		<img src="/img/sp/png/meet-in logo.png" alt="meet in" class="topLogo">
		<p class="subTitle__wrap">
			面倒なログイン、アプリのダウンロードなどは<br>
			一切不要。1秒でオンラインミーティング。
		</p>
	</div>
	<div class="sp_top_error_area">
		<p class="connect_alert" style="display: none;"></p>
	</div>
	<div class="createRoom__wrap">
		<input class="defaultForm" id="room_name" type="text" placeholder="ルーム名">
		<p>好きな文字列を入力してルームを作成してください。</p>
	</div>
	<div class="create_room_btn">
		<a href="javascript:void(0)" class="room_copy_btn" id="icon_copy_url"><img src="/img/lp/ico-copy_FFFFFF.png" class="" alt="">URLコピー</a>
		<div class="copy_message_area" style="display: none;"></div>
	</div>
	<div class="createRoom__wrap">
	<label for="room_mode"><input type="checkbox" name="room_mode" id="room_mode" class="chk_room_mode" /><span>モニタリングする</span></label>
	</div>
	<div class="topBtn__wrap">
		<div class="defaultBtn decisionBtn" id="connect_room">
			接続
		</div>
		<!--
		<div class="defaultBtn decisionBtn advanceBtn">
			ログイン
		</div>
		<div class="topOptions" id="open">
			<button class="topOptions__btn">●●●</button>
			<span>More options</span>
		</div>
		-->
	</div>
  <div class="topInfotext">サポートデスク ： <a class="topInfotext__tel" href="tel:0120-979-542">0120-979-542</a><br />
土日祝日を除く平日10:00～18:00</div>
	<input type="hidden" id="connection_info_id"/>
	<input type="hidden" id="peer_id" value="{$peer_id}"/>
	<input type="hidden" id="target_peer_id"/>
	<input type="hidden" id="auto_dial" value="{$auto_dial}"/>
	<input type="hidden" id="page_from" value="{$page_from}"/>

	<!-- ゲストの共有モーダル -->
	<div id="overlay"></div>
	<div id="optionsModal">
		<p class="optionsModal__title">ゲストに共有する</p>
		<p class="optionsModal__subTitle">ゲストにmeet in番号を共有しましょう。</p>
		<img src="/img/sp/png/gest_meetin.png" class="optionsModal__image">
<!--
		<img src="/img/sp/png/ゲストを招待するゲストにmeet in番号を共有しましょ__Png.png" class="optionsModal__image">
-->
		<div class="optionsModal__shareBtn--wrap">
			<div class="optionsModal__shareBtn-row">
				<button class="optionsModal__shareBtn--item"><img src="/img/sp/png/mail_btn.png"></button>
				<button class="optionsModal__shareBtn--item"><img src="/img/sp/png/sms_btn.png"></button>
				<button class="optionsModal__shareBtn--item"><img src="/img/sp/png/linkedin_btn.png"></button>
			</div>
			<div class="optionsModal__shareBtn-row">
				<button class="optionsModal__shareBtn--item"><img src="/img/sp/png/facebook_btn.png"></button>
				<button class="optionsModal__shareBtn--item"><img src="/img/sp/png/googleplus_btn.png"></button>
				<button class="optionsModal__shareBtn--item"><img src="/img/sp/png/more_btn.png"></button>
			</div>
		</div>
		<button id="close" class="optionsModal__cancel">キャンセル</button>
	</div>
	<!-- ゲストの共有モーダル END -->
	<!-- web移植 begin -->
	<script src="/js/jquery-1.11.2.min.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/detectSpeed.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/Utility.js?{$application_version}"></script>
<!--
	<script type="text/javascript" src="/js/WebRTC/adapter.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/WebRTC/peer.js?{$application_version}"></script>
-->
	<script type="text/javascript" src="/js/WebRTC/MeetinDefault.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/WebRTC/MeetinUtility.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/WebRTC/MeetinConnectionManager.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/MeetinAPI.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/WebSocket/MeetinWebSocketManager.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/sp/connection/prepare-connection.js?{$application_version}"></script>
	<link rel="stylesheet" href="/css/jquery-ui.css?{$application_version}">
	<script src="/js/jquery-1.11.2.min.js?{$application_version}"></script>
	<script src="/js/jquery-ui.min.js?{$application_version}"></script>
	<!-- web移植 end -->
</body>
</html>
