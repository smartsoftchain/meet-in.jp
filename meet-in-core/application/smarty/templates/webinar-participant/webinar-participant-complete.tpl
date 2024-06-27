<!-- [ウェビナー予約画面_予約完了](https://xd.adobe.com/view/ab500cf4-6bae-4168-5402-8e74b0fc99e4-dd61/screen/bcdebf30-0bbd-4c76-aa36-b040a4ab6190/-) -->

<!DOCTYPE html>
<html lang="ja">
<head>
	<!-- Bootstrap -->
	<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
	<!-- Fontawesome -->
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.9.0/css/all.min.css" integrity="sha256-UzFD2WYH2U1dQpKDjjZK72VtPeWP50NoJjd26rnAdUI=" crossorigin="anonymous" />

	<link rel="stylesheet" type="text/css" href="/css/webinar-participant.css">

	<meta name="viewport" content="width=device-width, initial-scale=1">
	<style>
		{literal}
			.setting_theme_color{
				background-color: {/literal}{$webinar.theme_color}{literal} !important;
			}
			.setting_theme_color_character{
				color: {/literal}{$webinar.theme_color}{literal} !important;
			}
			.setting_character_color{
				color: {/literal}{$webinar.character_color}{literal} !important;
			}
		{/literal}
		{if $webinar.theme_color != ""}
			{literal}
				:root{
					/* svgの色を変えるための苦肉の策（別のやり方があれば、そちらに書き換えたい） */
					--webinar-theme-color: {/literal}{$webinar.theme_color}{literal} !important;
				}
			{/literal}
		{/if}
	</style>


</head>
<body>
	<!-- 画面上部の帯と画像（帯の色はテーマカラー） begin -->
	<div class="wp_head_line_area setting_theme_color">
		<img src="{$webinar.logo_reservation_path}" class="img_wp_head_line">
	</div>
	<!-- 画面上部の帯と画像（帯の色はテーマカラー） end -->
	<!-- 見出し -->
	<div class="wp-heading_area">
		<div class="d-flex flex-column">
			<div class="wp-theme_svg mt-5 mb-4">
				<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" preserveAspectRatio="xMidYMid meet" viewBox="0 0 96 96" width="96" height="96"><defs><path d="M95 48C95 73.94 73.94 95 48 95C22.06 95 1 73.94 1 48C1 22.06 22.06 1 48 1C73.94 1 95 22.06 95 48Z" id="a5vUpC4jd"></path><path d="M74.26 31.73L38.98 62.55L21.33 45.81" id="bOnQl2aTR"></path></defs><g><g><g><use xlink:href="#a5vUpC4jd" opacity="1" fill="#00ff69" fill-opacity="0"></use><g><use xlink:href="#a5vUpC4jd" opacity="1" fill-opacity="0" stroke="#3c5aad" stroke-width="2" stroke-opacity="1"></use></g></g><g><g><use xlink:href="#bOnQl2aTR" opacity="1" fill-opacity="0" stroke="#3c5aad" stroke-width="2" stroke-opacity="1"></use></g></g></g></g></svg>
			</div>
			<h2 class="mb-4 setting_theme_color_character">ご予約ありがとうございます。<br>お申し込みが完了いたしました。</h2>
			<div class="wp-complete_message">ウェビナーに関する詳細をご登録いただきましたメールアドレス宛にお送りいたしましたので、</div>
			<div class="wp-complete_message">お手数ですがご確認ください。</div>
		</div>
	</div>

</body>
<!-- For Bootstrap -->
<script src="https://code.jquery.com/jquery-3.4.1.slim.min.js" integrity="sha384-J6qa4849blE2+poT4WnyKhv5vZF5SrPo0iEjwBvKU7imGFAV0wwj1yYfoRSJoZ+n" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js" integrity="sha384-Q6E9RHvbIyZFJoft+2mJbHaEWldlvI9IOYy5n3zV9zzTtmI3UksdQRVvoxMfooAo" crossorigin="anonymous"></script>
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js" integrity="sha384-wfSDF2E50Y2D1uUdj0O3uMBJnjuUD4Ih7YwaYd1iqfktj0Uod8GCExl3Og8ifwB6" crossorigin="anonymous"></script>

