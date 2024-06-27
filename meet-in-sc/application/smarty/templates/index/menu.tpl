{include file="./common/header.tpl"}


{literal}
<script>
$(function (){
	//コピーイベント発生時に実行するイベント発生
	document.addEventListener('copy', function(event) {
		// 通常のコピーイベントをキャンセル
		event.preventDefault();
		// IE11 判別
		var ua = window.navigator.userAgent.toLowerCase();
		// clipboard APIで任意のデータをクリップボードにコピーする
		if(ua.indexOf('trident/7') != -1){
			window.clipboardData.setData('Text', copyMessage);
		} else {
			event.clipboardData.setData('Text', copyMessage);
		}
		// コピーメッセージの表示
		$("div.copy_message_area").text("コピーしました（3秒後に消えます）");
		$("div.copy_message_area").show();
		setTimeout(function(){
			$("div.copy_message_area").fadeOut("slow");
		}, 3000);
		copyMessage = "";
	});
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
	var copyMessage = "";

	// 招待文・URLのコピーボタン押下時のイベント処理
	$("#icon_copy_sentence, #icon_copy_url").click(function(){
		// ルーム名を取得する
		var roomName = $("#room_name").val();
		// エラーメッセージの表示
		$("p.connect_alert").hide();
		// 32文字 半角英数字か判別する
		if(!roomName.match(/^([a-zA-Z0-9\-_]{1,32})$/)){
			// ルーム名が存在しない場合はコピーエラーメッセージを出す
			$("p.connect_alert").text("ルーム名は半角英数字、アンダーバー(_)、ハイフン(-)で32文字以内で入力して下さい");
			// エラーメッセージの表示
			$("p.connect_alert").show();
			return false;
		}
		if(roomName != "" ){
			// コピーするメッセージを保存する
			var roomUrl = "https://"+document.domain+"/room/"+$("#room_name").val();
			if($(this).attr("id") == "icon_copy_sentence"){
				// 招待文コピーの場合
				copyMessage = [
					"いつも大変お世話になっております。\n",
					"下記の日程でオンラインビデオチャットをお願いいたします。\n",
					"\n",
					"■00/00　00:00～00:00\n",
					"\n",
					"当日は下記URLよりビデオチャットルームにアクセスし、\n",
					"お待ちいただけますと幸いです。\n",
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
			document.execCommand("copy");
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
	/**
	 * 接続ボタンクリック(ルーム指定用)
	 */
	$("#connect_room").on('click', function() {
		// 空欄or半角英数32文字以外はエラー
		var room_name = $("#room_name").val();
		if(room_name.length === 0) {
			$(".connect_alert").text("ルーム名は未入力です");
			$(".connect_alert").show();
			setTimeout(function(){
				$(".connect_alert").fadeOut("slow");
				},1500);
			return;
		}
		if(!room_name.match(/^[0-9a-zA-Z\-_]{1,32}$/)) {
			$(".connect_alert").text("ルーム名は半角英数字、アンダーバー(_)、ハイフン(-)で32文字以内で入力して下さい");
			$(".connect_alert").show();
			setTimeout(function(){
				$(".connect_alert").fadeOut("slow");
			},1500);
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
			if(json['result'] == 0) {
				// ルーム入室
				window.location.href = location.protocol + "//" + location.host + "/room/" + room_name;
			} else {
				var message = '';
				if(json['result'] == 1) {
					// 人数制限
					message = 'ルーム名(' + room_name + ')は人数制限です';
				} else if(json['result'] == 2) {
					// ロック状態
					message = 'ルーム名(' + room_name + ')はロック状態です';
				}
				$(".connect_alert").text(message);
				$(".connect_alert").show();
			}
		}).fail(function() {
			// ロック状態
			$(".connect_alert").text("通信エラー");
			$(".connect_alert").show();
		});
	});
});

</script>

<style type="text/css">

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
}

.create_room_content {
    background: #fff;
    text-align: left;
    position: relative;
}

.room_content > * {
    display: block;
    margin: 0 auto;
}
.create_room_content .room_content {
    padding: 26px 30px; 
}

.title_message {
    text-align: left;
}

.create_room_content .create_room_form {
    padding-bottom: 20px;
}

.create_room_content .http_text {
    font-size: 13px;
    width: 180px;
    margin-right: 17px;
}

.create_room_content input.mi_default_input {
  box-sizing: border-box;
  text-align: left;
  height: 45px;
  margin-bottom: 0px;
  margin-right: 15px;
  padding: 12px 15px;
}

.create_room_content .mi_connect_button {
    font-size: 18px;
    font-weight: bold;
    height: 45px;
    line-height: 45px;
    margin-top: 0px;
    width: 180px;
    word-spacing: 6px;
}

.hvr-fade {
    -webkit-transform: perspective(1px) translateZ(0);
    transform: perspective(1px) translateZ(0);
    box-shadow: 0 0 1px transparent;
    overflow: hidden;
}

.create_room_content .room_copy_btn {
    color: #fff;
    display: inline-block;
    height: 30px;
    line-height: 30px;
    border: 1px solid #b2b2b2;
    background-color: #b2b2b2;
    border-radius: 5px;
    text-align: center;
    position: relative;
    padding: 0 20px;
    font-size: 15px;
    margin-right: 10px;
    -webkit-transition: all 0.3s ease-in-out 0s;
    -moz-transition: all 0.3s ease-in-out 0s;
    -o-transition: all 0.3s ease-in-out 0s;
    transition: all 0.3s ease-in-out 0s;
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
    margin: 1px 10px 0 0;
}

p.connect_alert {
	color: #ff2200;
}
</style>

{/literal}

<!-- メインコンテンツ start -->
<div id="mi_main_contents">
	
	<!-- トップナビ start -->
	<div id="mi_top_nav">

	</div>
	<!-- トップナビ end -->

	<!-- コンテンツエリア start -->
	<div id="mi_content_area">
		<div class="notice" id="tab_capture_plugin" style="display: none;">
			SalesCrowd録画がインストールされていません。
			インストールは<a href="https://chrome.google.com/webstore/detail/salescrowd%E9%8C%B2%E7%94%BB/hmcpgbjldjigdjkapedccgnhdhkjicei?hl=ja" target="_blank">こちら</a>
		</div>
		<div class="notice" id="screen_share_plugin" style="display: none;">
			SalesCrowd画面共有がインストールされていません。
			インストールは<a href="https://chrome.google.com/webstore/detail/salescrowd%E7%94%BB%E9%9D%A2%E5%85%B1%E6%9C%89/ehdchpikfmofocoiglfkgfjhgncbbdap?hl=ja" target="_blank">こちら</a>
		</div>
		<!-- コンテンツタイトル start -->
		<div class="mi_content_title">
			<span class="icon-meet-in mi_content_title_icon"></span>
			<h1>ルーム作成</h1>
		</div>
		<!-- ルーム作成エリア start -->
		<div class="create_room_content">
			<div class="room_content">
				<div class="title_message">好きな文字列を入力してルームを作成してください。</div>
				<p class="connect_alert" style="display: none;"></a>
				<div class="create_room_form">
					<span class="http_text">https://online.sales-crowd.jp/room/</span>
					<input type="text" id="room_name" value="" placeholder="ルーム名" class="mi_default_input">
					<button type="button" name="button" class="mi_default_button mi_connect_button hvr-fade" id="connect_room">接 続</button>
				</div>
				<div class="create_room_btn">
					<a href="javascript:void(0)" class="room_copy_btn" id="icon_copy_url"><img src="/img/lp/ico-copy_FFFFFF.png" class="" alt="">URLコピー</a>
					<a href="javascript:void(0)" class="room_copy_btn" id="icon_copy_sentence"><img src="/img/lp/ico-mail.png" class="" alt="">招待文をコピー</a>
				</div>
				<div class="copy_message_area" style="display: none;">コピーしました（3秒後に消えます）</div>
			</div>
		</div>
		<!-- ルーム作成エリア end -->
		<!-- コンテンツタイトル end -->

		<!-- お知らせ表示エリア begin -->
		<div class="notification_area">
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
		</div>
		<!-- お知らせ表示エリア end -->
		
	</div>
	<!-- コンテンツエリア start -->
</div>
<!-- メインコンテンツ end -->

<script type="text/javascript" src="/js/index/menu.js?{$application_version}"></script>

{include file="./common/footer.tpl"}