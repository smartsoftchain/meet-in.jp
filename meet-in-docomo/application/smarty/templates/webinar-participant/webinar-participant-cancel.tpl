<!-- [ウェビナー入室画面_キャンセル](https://xd.adobe.com/view/ab500cf4-6bae-4168-5402-8e74b0fc99e4-dd61/screen/cf69edac-18dd-4ec8-b885-b79ccb64a70d/-/) -->

<!DOCTYPE html>
<html lang="ja">
<head>
	<!-- Bootstrap -->
	<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
	<!-- Fontawesome -->
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.9.0/css/all.min.css" integrity="sha256-UzFD2WYH2U1dQpKDjjZK72VtPeWP50NoJjd26rnAdUI=" crossorigin="anonymous" />
	
	<link rel="stylesheet" type="text/css" href="/css/webinar-participant.css">
	<script src="/js/jquery-1.11.2.min.js"></script>
	<script src="/js/webinar_participant.js"></script>

	<meta name="viewport" content="width=device-width, initial-scale=1">
	<style>
		{literal}
			.setting_theme_color{
				background-color: {/literal}{$webinar.theme_color}{literal} !important;
			}
			.setting_character_color{
				color: {/literal}{$webinar.character_color}{literal} !important;
			}
		{/literal}
	</style>


</head>
<body>
	<!-- {include file="./common/header.html"} -->
	
	<!-- 画面上部の帯と画像（帯の色はテーマカラー） begin -->
	<div class="wp_head_line_area setting_theme_color">
		<img src="{$webinar.logo_reservation_path}" class="img_wp_head_line">
	</div>
	<!-- 画面上部の帯と画像（帯の色はテーマカラー） end -->
	<!-- 見出し -->
	<div class="wp-heading_area">
		<h2>予約キャンセルページ</h2>
		<small>こちらの画面から下記のウェビナーの予約をキャンセルすることができます。</small>
		<!-- 終了後 -->
		<!-- <h5 class="font-weight-bold">この度は、ご参加していただき誠にありがとうございました。</h5> -->
	</div>
	<!-- メインコンテンツ -->
	<main>
		<div class="wp-grid_container container-md mb-4">
			<div class="row">
				<!-- テーマ画像エリア -->
				<div class="wp-theme_img_area col-sm-4">
					<div class="wp-theme_img_wrapper">
						<img src="{$webinar.logo_reservation_path}">
					</div>
				</div>
				<!-- キャプションエリア -->
				<div class="wp-caption_area col-sm-8">
					<div>
						<span class="wp-caption_title">{$webinar.name}</span>
						<p>
							<b>開催日時：</b>
							<span class="wp-caption_holding_date">{$webinar.holding_date|date_format:'%Y年%m月%d日 %H:%M'} </span>
							<b>開催時間：</b>
							<span class="wp-caption_holding_time">{$webinar.holding_time}分</span>
							<br>
							<b>定員数：</b>
							<span class="wp-caption_capacity">{$webinar.max_participant_count}人</span>
						</p>
						<p class="wp-caption_outline">{$webinar.explanation_text}</p>
					</div>
				</div>
			</div>
			<!-- 罫線 -->
			<hr>
			<!-- 画面下半分のフォームエリア -->
			<div class="wp-form_area">
				<div class="d-flex flex-column align-items-center text-center m-2">
					<input type="hidden" name="announce_key" value="{$webinar.key}" />
					<span class="small m-3">予約時に入力したメールアドレスと発行された予約番号を入力して「予約キャンセル」をクリックして下さい。</span>
					<label><span class="small">メールアドレス</span></label><input class="wp-form_email_input p-2 m-1" type="email" name="mail_address"/>
					<label><span class="small">予約番号</span></label><input class="wp-form_reservation_number_input p-2 m-1" type="text" name="reservation_number"/>
					<!-- キャンセルボタン start -->
					{if $webinar.errorStatus == 0}
						<button class="wp-theme_button btn w-75 py-2 my-4 setting_theme_color setting_character_color" name="btn_cancel_reservation">
							<span class="h6 font-weight-bold">予約キャンセル</span>
						</button>
					{else if $webinar.errorStatus == 1}
						<!-- 終了後 -->
						<button class="wp-theme_button btn w-75 py-2 my-4 setting_theme_color setting_character_color" disabled>
							<span class="h6 font-weight-bold">このウェビナーは終了いたしました</span>
						</button>
					{/if}
					<!-- 入場ボタン end -->
					<!-- error message -->
					<span class="text-danger error_cancel_reservation">入力データが不正です。</span>
				</div>
			</div>
		</div>
	</main>
</body>
<!--<script src="https://code.jquery.com/jquery-3.4.1.slim.min.js" integrity="sha384-J6qa4849blE2+poT4WnyKhv5vZF5SrPo0iEjwBvKU7imGFAV0wwj1yYfoRSJoZ+n" crossorigin="anonymous"></script>-->
<script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js" integrity="sha384-Q6E9RHvbIyZFJoft+2mJbHaEWldlvI9IOYy5n3zV9zzTtmI3UksdQRVvoxMfooAo" crossorigin="anonymous"></script>
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js" integrity="sha384-wfSDF2E50Y2D1uUdj0O3uMBJnjuUD4Ih7YwaYd1iqfktj0Uod8GCExl3Og8ifwB6" crossorigin="anonymous"></script>