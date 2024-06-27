<?php /* Smarty version 2.6.26, created on 2019-08-07 10:25:17
         compiled from index/menu.tpl */ ?>
<?php $_smarty_tpl_vars = $this->_tpl_vars;
$this->_smarty_include(array('smarty_include_tpl_file' => "./common/header.tpl", 'smarty_include_vars' => array()));
$this->_tpl_vars = $_smarty_tpl_vars;
unset($_smarty_tpl_vars);
 ?>

<?php echo '
<script>
$(function (){
	//コピーイベント発生時に実行するイベント発生
	document.addEventListener(\'copy\', function(event) {
		// 通常のコピーイベントをキャンセル
		event.preventDefault();
		// IE11 判別
		var ua = window.navigator.userAgent.toLowerCase();
		// clipboard APIで任意のデータをクリップボードにコピーする
		if(ua.indexOf(\'trident/7\') != -1){
			window.clipboardData.setData(\'Text\', copyMessage);
		} else {
			event.clipboardData.setData(\'Text\', copyMessage);
		}
		// コピーメッセージの表示
		$("div.copy_message_area").text("コピーしました（3秒後に消えます）");
		$("div.copy_message_area").show();
		setTimeout(function(){
			$("div.copy_message_area").fadeOut("slow");
		}, 3000);
		copyMessage = "";
	});
	$(\'[id=tab_capture_plugin]\').hide();
	$(\'[id=screen_share_plugin]\').hide();
	$(window).load(function() {
		if (getBrowserType() == \'Chrome\') {
			if(isInstalledTabCapture()) {
				$(\'[id=tab_capture_plugin]\').hide();
			} else {
				$(\'[id=tab_capture_plugin]\').show();
			}
			if(isInstalledScreenShare()) {
				$(\'[id=screen_share_plugin]\').hide();
			} else {
				$(\'[id=screen_share_plugin]\').show();
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
		if(!roomName.match(/^([a-zA-Z0-9\\-_]{1,32})$/)){
			// ルーム名が存在しない場合はコピーエラーメッセージを出す
			$("p.connect_alert").text("ルーム名は半角英数字、アンダーバー(_)、ハイフン(-)で32文字以内で入力して下さい");
			// エラーメッセージの表示
			$("p.connect_alert").show();
			return false;
		}
		if(roomName != "" ){
			// コピーするメッセージを保存する
			var roomUrl = "https://"+document.domain+"/room/"+$("#room_name").val();
			// 同席モードの設定
			if($("#room_mode").prop(\'checked\')){
				// モニタリングするにチェックが入っている場合
				roomUrl += "?room_mode=2"
			}
			if($(this).attr("id") == "icon_copy_sentence"){
				// 招待文コピーの場合
				copyMessage = [
					"いつも大変お世話になっております。\\n",
					"下記の日程でオンラインビデオチャットをお願いいたします。\\n",
					"\\n",
					"■00/00　00:00～00:00\\n",
					"\\n",
					"時間になりましたら、下記URLよりルームにアクセスください。\\n",
					"招待者がログインするまで入室はできません。\\n",
					"",
					roomUrl+"\\n",
					"\\n",
					"以上、ご不明点がございましたら下記までお問い合わせくださいませ。\\n",
					"\\n",
					"担当者：\\n",
					"連絡先：\\n",
					"メールアドレス：\\n"].join("");
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
	$("#connect_room").on(\'click\', function() {
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
		if(!room_name.match(/^[0-9a-zA-Z\\-_]{1,32}$/)) {
			$(".connect_alert").text("ルーム名は半角英数字、アンダーバー(_)、ハイフン(-)で32文字以内で入力して下さい");
			$(".connect_alert").show();
			setTimeout(function(){
				$(".connect_alert").fadeOut("slow");
			},1500);
			return;
		}
		// 上限チェック
		$.ajax({
			url: \'/negotiation/allowed-enter-room\',
			type: \'POST\',
			dataType: \'json\',
			data: {
				\'room_name\': room_name
			}
		}).done(function(res) {
			var json = $.parseJSON(res);
			if(json[\'result\'] == 0) {
				// 同席モードの設定
				var roomMode = "";
				if($("#room_mode").prop(\'checked\')){
					// モニタリングするにチェックが入っている場合
					roomMode = "?room_mode=2"
				}
				// ルーム入室
				window.location.assign(location.protocol + "//" + location.host + "/room/" + room_name + roomMode);
			} else {
				var message = \'\';
				if(json[\'result\'] == 1) {
					// 人数制限
					message = \'ルーム名(\' + room_name + \')は人数制限です\';
				} else if(json[\'result\'] == 2) {
					// ロック状態
					message = \'ルーム名(\' + room_name + \')はロック状態です\';
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
	// お知らせを非表示にする
	$(\'#hide-notification\').on(\'click\', function() {
		$(\'#notification\').fadeOut(200);
	});
});

</script>

<style type="text/css">
	.mi_main_contents{
		overflow: hidden;
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

	#mi_main_contents {
		background: url(../img/lp/img-top.png) no-repeat center;
		background-size: cover;
		text-align: center;
		position: relative;
		padding-bottom: 0;
    height: calc(100vh - 50px);
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
		transform: translate(-50%, -50%);
	}

	.room_content {
		height: 350px;
		background: rgba(0, 0, 0, 0.5);
		display: grid;
		margin-top:80px;
		padding: 30px;
		position: relative;
	}

	.title_message {
		text-align: center;
	}

	.text_style {
		font-size: 16px;
		color: #ffffff;
		padding-top: 50px;
	}

	.room_mode .text_style {
		padding-top: 0;
	}

	.mi_default_input {
		width: 236px;
		height: 42px;
		border-radius: 2px;
		border: solid 1px #979797;
		background-color: #ffffff;
	}

	.room_copy_btn {
		width: 180px;
		height: 32px;
		border-radius: 3px;
		border: solid 1px #ffffff;
		color: #ffffff;
		text-align: center;
		padding: 10px 40px;
		margin: 0 15px;
	}

	.copy_message_area {
		color: #ffffff;
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
		background: #0081CC
	}

	.connect_room_btn:active {
		background: #c98601
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
		width : 14px;
	}

	.mi-infotext {
		font-size: 13px;
		padding-top: 10px;
	}
	.mi-infotext__tel{
		font-size: 22px;
    display: inline-block;
	}

</style>

'; ?>


<!-- メインコンテンツ start -->
<div id="mi_main_contents" class="mi_main_contents">
	<div class="mi_index_menu_img_wrap">
		<img alt="" class="mi_index_menu_img" src="/img/lp/main-grobe.png">
	</div>
	<!-- トップナビ start -->
	<div id="mi_top_nav">
		<?php if ($this->_tpl_vars['notification']): ?>
			<div class="notification" id="notification">
				<span class="icon-notification"></span>
				<a href="/notification/detail?id=<?php echo $this->_tpl_vars['notification']['id']; ?>
"><?php echo $this->_tpl_vars['notification']['title']; ?>
：<?php echo $this->_tpl_vars['notification']['content']; ?>
</a>
				<button type="button" id="hide-notification">閉じる</button>
			</div>
		<?php endif; ?>
	</div>
	<!-- トップナビ end -->

	<!-- コンテンツエリア start -->
	<div id="mi_content_area">
		<div class="notice" id="tab_capture_plugin" style="display: none;">
			Meetin録画がインストールされていません。
			インストールは<a href="https://chrome.google.com/webstore/detail/meetin%E9%8C%B2%E7%94%BB/feadpakpdafikklbhmngppnagacgeene?hl=ja" target="_blank">こちら</a>
		</div>
		<div class="notice" id="screen_share_plugin" style="display: none;">
			Meetin画面共有がインストールされていません。
			インストールは<a href="https://chrome.google.com/webstore/detail/meetin%E7%94%BB%E9%9D%A2%E5%85%B1%E6%9C%89/emhpppcglflffjojamppcdmbjkhnbdpo?hl=ja" target="_blank">こちら</a>
		</div>
		<!-- コンテンツタイトル start -->
		<!-- <div class="mi_content_title">
			<span class="icon-meet-in mi_content_title_icon"></span>
			<h1>ルーム作成</h1>
		</div> -->
		<!-- ルーム作成エリア start -->
		<div class="create_room_content">
			<div class="room_content">
				<div class="title_message text_style">好きな文字列を入力してルームを作成してください。</div>
				<p class="connect_alert" style="display: none;"></a>
				<div class="create_room_form">
					<span class="http_text text_style">https://meet-in.jp/room/</span>
					<input type="text" id="room_name" value="" placeholder="ルーム名" class="mi_default_input">
					<button type="button" name="button" class="mi_connect_button connect_room_btn" id="connect_room">接 続</button>
				</div>
				<?php if ($this->_tpl_vars['browser'] != 'IE'): ?>
					<div class="room_mode">
						<span class="text_style"><label for="room_mode">モニタリングする</label></span>
						<input type="checkbox" name="room_mode" id="room_mode" class="chk_room_mode" />
					</div>
				<?php else: ?>
					<div style="margin-top:20px;margin-bottom:30px;"></div>
				<?php endif; ?>
				<div class="create_room_btn">
					<a href="javascript:void(0)" class="room_copy_btn" id="icon_copy_url"><img src="/img/lp/ico-copy_FFFFFF.png" class="" alt="">URLコピー</a>
					<a href="javascript:void(0)" class="room_copy_btn" id="icon_copy_sentence"><img src="/img/lp/ico-mail.png" class="" alt="">招待文をコピー</a>
				</div>
				<div class="copy_message_area" style="display: none;">コピーしました（3秒後に消えます）</div>
				<div class="text_style mi-infotext">サポートデスク ： <span class="mi-infotext__tel">0120-979-542</span><br />
土日祝日を除く平日10:00～18:00</div>
			</div>
		</div>
		<!-- ルーム作成エリア end -->

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
</div>
<!-- メインコンテンツ end -->

<script type="text/javascript" src="/js/index/menu.js?<?php echo $this->_tpl_vars['application_version']; ?>
"></script>
