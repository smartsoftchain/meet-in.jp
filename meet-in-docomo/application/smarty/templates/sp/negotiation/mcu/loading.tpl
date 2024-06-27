{literal}
	<script>
		$(function(){
			// ユーザーエージェント取得
			var userAgent = navigator.userAgent;
			var version = platform.os.version;
			// バージョンの数値を取得
			var os = platform.os.family;
			var numOs = parseInt(version);
			var platformVersion = platform.version;
			var platformName = platform.name;

			// ネットワーク速度を取得
			var start = (new Date()).getTime();
			$.ajax({
				url: "https://" + location.host + "/css/jquery-ui.css",
				type: "GET",
			}).done(function(data) {
				var end = (new Date()).getTime();
				var sec = (end - start) / 1000;
				var bytesPerSec = Math.round(data.length / sec);
				var bytesData = bytesPerSec * 8 / 1000;
				if(bytesData < 15){
					$(".nonReccomendModal").css("display","block");
				}
			}).fail(function(error) {
				console(error);
			});

			if(os == "iOS"){
				// macの場合、OSが10.10以前、サファリのバージョンが12以前は非推奨
				if(numOs<12 || platformName != "Safari" || platformVersion < 12){	
					$(".nonReccomendModal").css("display","block");
				}
			}else if(os == "Android"){
				// andoroidの場合、クロムのバージョンが8.4より下は非推奨
				var versionComparison = platformVersion.slice(0, 2);
				if(versionComparison < 84){
					$(".nonReccomendModal").css("display","block");
				}
			}else if(os == "Windows"){
				// Windowsの場合、OSが10以前、クロムのバージョンが8.4より下の場合は非推奨
				var versionComparison = platformVersion.slice(0, 2);
				if(numOs < 10 || platformName != "Crome" || versionComparison < 84){
					$(".nonReccomendModal").css("display","block");
				}
			}
		})
	</script>
{/literal}

<link rel="stylesheet" href="/css/sp/loading.css?{$application_version}">
<div class="content_wrap {if $room_mode == 2}zindex1002{/if}" id="content_wrap">
	<div class="loading_wrap">
		<img src="/img/sp/gif/loading.gif" class="loading_animation">
		<p class="loading_text">準備中です。<br>少々お待ちください。</p>
	</div>

	<!-- 非推奨環境モーダル -->
	<div class="nonReccomendModal">
		<div class="non_reccomend_main">
			meet inにおける推奨環境を満たしていない可能性がある為、動作が不安定となる可能性がございます。<br>
			推奨環境をご確認の上、再接続するようお願いいたします。
			<div class="non_reccomend_link_wrap">
				{* 推奨環境のご確認は<a href="https://manual.meet-in.jp/?p=540" target="_blank" rel="noopener" class="non_reccomend_link">こちら</a> *}
			</div>
			<button class="non_reccomend_cancel">閉じる</button>
		</div>
	</div>

	<!-- 接続失敗モーダル -->
	<div id="overlay" class="overlay"></div>
	<div class="connectionFailedModal">
		<img src="/img/sp/png/connection_failed.png" class="connectionFailedModal__img">
		<div class="connectionFailedModal__textArea">
			<p class="connectionFailedModal__title">接続失敗</p>
			<p class="connectionFailedModal__subTitle">
				接続できませんでした。<br />
				しばらく経ってから掛け直してください。
			</p>
		</div>
		<button id="return" class="connectionFailedModal__return returnBtn">もどる</button>
	</div>
	<!-- 接続失敗モーダル END -->
</div>