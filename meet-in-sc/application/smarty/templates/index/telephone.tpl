<!DOCTYPE html>
<html lang="ja">
<head>
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
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<title></title>
	<meta charset="utf-8">
	<meta name="description" content="">
	<meta name="author" content="">
	<link rel="shortcut icon" href="/img/favicon.ico">
	<link rel="stylesheet" href="/css/fonts.css?{$application_version}">
	<!--[if lt IE 8]>
	<link rel="stylesheet" href="/css/ie7.css?{$application_version}">
	<!--<![endif]-->
	<link rel="stylesheet" href="/css/reset.css?{$application_version}">
	<link rel="stylesheet" href="/css/base.css?{$application_version}">
	<link rel="stylesheet" href="/css/page.css?{$application_version}">
	<link rel="stylesheet" href="/css/design.css?{$application_version}">
	<script src="/js/jquery-1.11.2.min.js?{$application_version}"></script>

	<script src="/js/jquery-migrate-1.2.1.min.js?{$application_version}"></script>
	<!-- SC use js begin -->
		<!--datepicker-->
		<script src="/js/jquery-ui.min.js?{$application_version}"></script>
		<script src="/js/datepicker-ui/jquery.ui.datepicker-ja.js?{$application_version}"></script>
		<link rel="stylesheet" type="text/css" href="/js/datepicker-ui/jquery-ui.css?{$application_version}">

		<script src="/js/jquery.cookie.js?{$application_version}"></script>
		<script src="/src/jquery.blockUI.js?{$application_version}"></script>
		<script src="/src/handlebars-v3.0.3.js?{$application_version}"></script>
	<!-- SC use js end -->
	<script src="/js/common.js?{$application_version}"></script>
	<script src="/webrtc/call.js?{$application_version}" type="text/javascript"></script>
	<script src="/js/design.js?{$application_version}"></script>
	<!-- 電話の処理 -->
	{literal}
		<script type="text/javascript">
			$(function (){
				// keyの入力で架電が行えるようにする処理
				$(window).keyup(function(e){
					// 電話で使用する文字とkeyCodeの対応表
					var keyCodeDict = {};
					keyCodeDict["shiftKey"] = {};
					keyCodeDict["shiftKey"]["51"] = "#";
					keyCodeDict["shiftKey"]["186"] = "*";
					keyCodeDict["shiftKey"]["189"] = "-";
					keyCodeDict["singleKey"] = {};
					keyCodeDict["singleKey"]["48"] = "0";
					keyCodeDict["singleKey"]["49"] = "1";
					keyCodeDict["singleKey"]["50"] = "2";
					keyCodeDict["singleKey"]["51"] = "3";
					keyCodeDict["singleKey"]["52"] = "4";
					keyCodeDict["singleKey"]["53"] = "5";
					keyCodeDict["singleKey"]["54"] = "6";
					keyCodeDict["singleKey"]["55"] = "7";
					keyCodeDict["singleKey"]["56"] = "8";
					keyCodeDict["singleKey"]["57"] = "9";
					keyCodeDict["singleKey"]["8"] = "backSpace";

					keyCodeDict["singleKey"]["96"] = "0";
					keyCodeDict["singleKey"]["97"] = "1";
					keyCodeDict["singleKey"]["98"] = "2";
					keyCodeDict["singleKey"]["99"] = "3";
					keyCodeDict["singleKey"]["100"] = "4";
					keyCodeDict["singleKey"]["101"] = "5";
					keyCodeDict["singleKey"]["102"] = "6";
					keyCodeDict["singleKey"]["103"] = "7";
					keyCodeDict["singleKey"]["104"] = "8";
					keyCodeDict["singleKey"]["105"] = "9";
					keyCodeDict["singleKey"]["106"] = "*";
					keyCodeDict["singleKey"]["109"] = "-";
					// 押下したキー
					var key = "";
					if(e.shiftKey){
						key = keyCodeDict["shiftKey"][e.keyCode];
					}else{
						key = keyCodeDict["singleKey"][e.keyCode];
					}
					if(key === "backSpace"){
						// バックスペースの場合は最後の１文字削除する
						var number = $("div.mi_call_number").text();
						newNumber = number.substr(0, number.length-1);
						$("#txtPhoneNumber").val(newNumber);
						// 表示用のdivにデータを設定する
						$("div.mi_call_number").text(newNumber);
					}else if(key != undefined){
						// 入力されたキーを設定する
						var nowNumber = $("#txtPhoneNumber").val();
						var newNumber = nowNumber + key;
						$("#txtPhoneNumber").val(newNumber);
						// 表示用のdivにデータを設定する
						$("div.mi_call_number").append(key);
					}
				});
				// ダイアルがクリックされた場合
				$("td.digits").click(function(){
					var nowNumber = $("#txtPhoneNumber").val();
					var newNumber = nowNumber + $(this).text();
					$("#txtPhoneNumber").val(newNumber);
					// 表示用のdivにデータを設定する
					$("div.mi_call_number").append($(this).text());
				});
				// 発信ボタン押下時
				$(".mi_call_button").click(function(){
					if ($('#mi_tel_modal').hasClass('meetin_call')) {
						var connect_no = $('#txtPhoneNumber').val();
						window.opener.parent.postMessage({type: 'CALL_BY_DIAL', connect_no: connect_no },'*');
						window.close();
					} else {
						if(isCall()){
							// 通話中
							sipHangUp();
							// 通話終了時は発信ボタンに変更する
							$("label.tel_label").text("発信");
							// meetin発信のボタンを押下出来るようにする
							$("button.change_meetin_dial").css('visibility', 'visible');
							// 発信番号を元に戻す
							$("#txtPhoneNumber").val($("div.mi_call_number").text());
						}else{
							// 未通話
							setWavid($("#txtPhoneNumber").val());
							sipCall('call-audio');
							// 通話開始時は切断ボタンに変更する
							$("label.tel_label").text("切断");
							// meetin発信のボタンを押下出来なくする
							$("button.change_meetin_dial").css('visibility', 'hidden');
						}
					}
				});
			});
			var inCallIntervalTimer;
			var inCallDate;
			// 相手へ発信開始したときに実行される関数
			function webRtcStartInCall() {
				clearInterval(inCallIntervalTimer);
				inCallDate = new Date();
				inCallIntervalTimer = setInterval(function() {
					var elapsed_txt = '接続時間:';
					var nowDate = new Date();
					var elapsed_seconds = parseInt((nowDate - inCallDate)/1000);
					var elapsed_minutes = parseInt(elapsed_seconds/60);
					if(elapsed_minutes > 0) {
						txtCallElapsedStatus.innerHTML = elapsed_txt + elapsed_minutes + '分' + parseInt(elapsed_seconds%60) + '秒';
					} else {
						txtCallElapsedStatus.innerHTML = elapsed_txt + elapsed_seconds + '秒';
					}
				}, 1000);
			}
			// 相手からの通話終了時に実行される関数
			function webRtcHangUp(){
				clearInterval(inCallIntervalTimer);
				// 通話終了時は発信ボタンに変更する
				$("label.tel_label").text("発信");
				// meetin発信のボタンを押下出来るようにする
				$("button.change_meetin_dial").css('visibility', 'visible');
				// 発信番号を元に戻す
				$("#txtPhoneNumber").val($("div.mi_call_number").text());
			}

			// アスタリスクに送信するランダムな文字を生成し、電話番号とセットにし設定する
			function setWavid(phoneNumber){
				// アスタリスクに送信するユニークなIDを取得する
				var baseStr = "1234567890qwertyuiopasdfghjklzxcvbnm";
				var result = "";
				for(var i=0; i<7; i++) {
					result += baseStr[Math.floor(Math.random() * baseStr.length)];
				}
				var wavid = "9" + result;
				var staffKey = "{/literal}{$staffKey}{literal}";
				var telNo = phoneNumber.replace(/-/gi,'');
				var uniqueKey = "6" + staffKey+wavid + telNo;
				// 電話番号へ設定する
				$("#txtPhoneNumber").val(uniqueKey);
			}
			$(function (){
				$(".mi_close_icon").on('click',function(){
					window.close();
    			return false;
				});
			});
			// 入力された番号のクリア
			$(function (){
				$(".mi_number_clear_btn").on('click',function(){
					$("#txtPhoneNumber").val("");
					$(".mi_call_number").text("");
    			return false;
				});
			});
		</script>
		<style>
		html,body {
			min-width: 285px;
			min-height: 463px;
		}
		.CallElapsedStatus {
			text-align: right;
			margin: 5px;"
		}
		</style>
	{/literal}

	</head>
<body>

	<!-- WEB PHONE共通処理 begin -->
	<input type="hidden" id="webphone_type" name="webphone_type" value="2" />
	<!-- webrtc設定 -->
	<input type="hidden" style="width: 100%; height: 100%" id="txtDisplayName" value="{$user.webphone_id+5000}"/>
	<input type="hidden" style="width: 100%; height: 100%" id="txtPrivateIdentity" value="{$user.webphone_id+5000}" />
	<input type="hidden" style="width: 100%; height: 100%" id="txtPublicIdentity" value="sip:{$user.webphone_id+5000}@{$domain}" />
	<input type="hidden" style="width: 100%; height: 100%" id="txtPassword" value="{$user.webphone_pass}" />
	<input type="hidden" style="width: 100%; height: 100%" id="txtRealm" value="{$domain}" />
	<input type="hidden" style="width: 100%; height: 100%" id="txtWebsocketServerUrl" value="wss://{$domain}:8089/ws" />
	<label style="display:none" id="txtRegStatus"></label>
	<br>
	<label style="display:none" id="txtCallStatus"></label>
	<div class="dialpad">
		<div class="dials num-display">
			<div class="number"></div>
		</div>
	</div>
	<!-- webRtcの通話用電話番号設定タグ -->
	<input type="hidden" id="txtPhoneNumber"/>
	<!-- WEB PHONE共通処理 end -->

	<!-- WEB PHONE共通処理 begin -->
	<ul id="ulCallOptions" class="dropdown-menu" style="display:none">
		<li><a href="#" onclick='sipCall("call-audio");'>Audio</a></li>
		<li><a href="#" onclick='sipCall("call-audiovideo");'>Video</a></li>
		<li id='liScreenShare'><a href="#" onclick='sipShareScreen();'>Screen Share</a></li>
		<li class="divider"></li>
		<li><a href="#" onclick='uiDisableCallOptions();'><b>Disable these options</b></a></li>
	</ul>
	<!-- Le javascript
	================================================== -->
	<!-- Placed at the end of the document so the pages load faster -->
	<script type="text/javascript" src="/webrtc/assets/js/jquery.js?{$application_version}"></script>
	<!-- Audios -->
	<audio id="audio_remote" autoplay="autoplay"> </audio>
	<audio id="ringtone" loop src="/webrtc/sounds/ringtone.wav"> </audio>
	<audio id="ringbacktone" loop src="/webrtc/sounds/ringbacktone.wav"> </audio>
	<audio id="dtmfTone" src="/webrtc/sounds/dtmf.wav"> </audio>
	<!-- WEB PHONE共通処理 end -->

	<!-- 電話モーダル start -->
	{$user.webphone_id}
	<div id="mi_tel_modal" {if $user.webphone_id ==""}class="meetin_call"{/if}>
		<div class="mi_tel_modal_inner">
	    <div class="mi_display_title mi_call_m"><span class="icon-call mi_title_icon"></span>電話発信</div>
<!--
	    <div class="mi_display_title mi_meetin_c"><img src="/img/meet-in-logo.png" class="call_option_img mi_meetin_c"><span>meet in 発信</span></div>
-->
	    <div class="mi_display_title mi_meetin_c"><img src="/img/projectavatar-1.png" class="call_option_img mi_meetin_c"><span>meet in 発信</span></div>

	    <div class="mi_number_display">
	      <div class="mi_call_number"></div>
				<div class="mi_clear_btn">
					<span class="mi_number_clear_btn icon-close"></span>
				</div>
	    </div>
			<div class="CallElapsedStatus">
				<label id="txtCallElapsedStatus"></label>
			</div>
			<table class="mi_number_button">
				<tr>
					<td class="digits"><span>1</span></td>
					<td class="digits"><span>2</span></td>
					<td class="digits"><span>3</span></td>
				</tr>
				<tr>
					<td class="digits"><span>4</span></td>
					<td class="digits"><span>5</span></td>
					<td class="digits"><span>6</span></td>
				</tr>
				<tr>
					<td class="digits"><span>7</span></td>
					<td class="digits"><span>8</span></td>
					<td class="digits"><span>9</span></td>
				</tr>
				<tr>
					<td class="digits"><span>*</span></td>
					<td class="digits"><span>0</span></td>
					<td class="digits"><span>#</span></td>
				</tr>
			</table>

			<div class="mi_call_option">
				<button onclick="sipToggleHoldResume()"><span class="icon-hold call_option_icon"></span><span class="call_option_text1">保留</span></button>
			{if $meetin_btn === true}
			{if $user.webphone_id != ""}
				<button onclick="changeMeetinCall()" id="mi_changeMeetinCallButton" class="change_meetin_dial">
					<span class="icon-call call_option_icon mi_meetin_c"></span>
<!--	
					<img src="/img/meet-in-logo.png" class="call_option_img mi_call_m">
-->
					<img src="/img/projectavatar-1.png" class="call_option_img mi_call_m">

					<span class="mi_call_m call_option_text2">meet in 接続</span>
					<span class="mi_meetin_c call_option_text3">電話発信</span>
				</button>
			{/if}
			{/if}
			</div>

			<button class="mi_call_button btn_call" id="call_button">
				<div class="mi_call_m"><span class="icon-call"></span><label class="tel_label">発信</label></div>
<!--
				<div class="mi_meetin_c"><img src="/img/meet-in-logo.png" class="icon-call"></span>接続</div>
-->
				<div class="mi_meetin_c"><img src="/img/projectavatar-1.png" class="icon-call"></span>接続</div>
			</button>

			<div class="mi_close_icon">
				<span class="icon-close"></span>
			</div>
		</div>
	</div>
	<!-- 電話モーダル end -->

	<!--[if lt IE 8]>
	<script src="/js/ie7.js?{$application_version}"></script>
<!--<![endif]-->
</body>
</html>
