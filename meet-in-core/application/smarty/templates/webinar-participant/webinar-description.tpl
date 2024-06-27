<!-- [ウェビナー予約画面] -->
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
		<h2 class="setting_theme_color_character">ウェビナー予約</h2>
		<small>「予約する」をクリックするとウェビナーの予約ができます。</small>
	</div>
	<!-- メインコンテンツ -->
	<main>
		<div class="wp-grid_container container-md mb-4">
			<input type="hidden" name="url_param" value="{$webinar.url_param}" />
			<div class="row row-cols-sm-2 row-cols-1">
				<!-- 左列 サムネイル+予約ボタンエリア -->
				<div class="wp-theme_img_area col col-sm-4 order-1">
					<div class="wp-theme_img_wrapper">
						<img src="{$webinar.img_path}">
					</div>
					{if $webinar.error == ""}
						<button type="button" class="wp-theme_button_no_important btn btn-lg btn-block my-4 setting_theme_color setting_character_color" name="btn_move_participant_form">予約する</button>
					{else}
						<button type="button" class="wp-theme_button btn btn-lg btn-block my-4 setting_theme_color setting_character_color">{$webinar.error}</button>
					{/if}
				</div>
				<!-- 左列 運営会社情報エリア -->
				<div class="wp-client_info_area col col-sm-4 order-3">
					<div>
						<p>
							<b><span class="setting_theme_color_character wp-theme_text_color">■</span>運営会社情報</b>
							<p class="fontsize_12">主催：{$webinar.client_name}</p>
							<p class="fontsize_12">住所：{$webinar.client_address}</p>
							<p class="fontsize_12">電話番号：{$webinar.client_tel1}-{$webinar.client_tel2}-{$webinar.client_tel3}</p>
						</p>
					</div>
					<button class="wp-theme_button btn btn-sm my-4 setting_theme_color setting_character_color" data-toggle="modal" data-target="#contactFormModal"><i class="fas fa-envelope"></i> お問い合わせ</button>
				</div>
				<!-- 右列 キャプションエリア -->
				<div class="wp-caption_area col col-sm-8 order-2">
					<div>
						<span class="wp-caption_title">{$webinar.name}</span>
						<p class="wp-caption_contents">
							<b>開催日時：</b>
							<span class="wp-caption_holding_date">{$webinar.holding_date|date_format:'%Y年%m月%d日 %H:%M'} </span>
							<br>
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
		</div>
	</main>

	<!-- お問い合わせモーダル start -->
	<div class="modal fade" id="contactFormModal" tabindex="-1" role="dialog" aria-labelledby="contactFormModalTitle" aria-hidden="true">
		<div class="modal-dialog modal-dialog-centered modal-lg" role="document">
			<div class="modal-content">
				<div class="modal-header">
					<h2 class="modal-title col-12 text-center setting_theme_color_character" id="contactFormModalTitle">お問い合わせ</h2>
				</div>
				<div class="modal-body">
					<div class="error_webinar_inquiry_area">
						<!-- お問い合わせのエラー表示領域 -->
					</div>
					<!-- フォーム -->
					<form>
						<div class="row mb-3">
							<div class="col-sm-3">
								<label>お名前 <span class="badge badge-danger">必須</span></label>
							</div>
							<div class="col-sm-6">
								<input type="text" name="webinar_inquiry_name" class="form-control">
							</div>
						</div>
						<div class="row mb-3">
							<div class="col-sm-3">
								<label>会社名</label>
							</div>
							<div class="col-sm-6">
								<input type="text" name="webinar_inquiry_company_name" class="form-control">
							</div>
						</div>
						<div class="row mb-3">
							<div class="col-sm-3">
								<label>電話番号 <span class="badge badge-danger">必須</span></label>
							</div>
							<div class="col-sm-3">
								<input type="tel" name="webinar_inquiry_tel" class="form-control">
							</div>
						</div>
						<div class="row mb-3">
							<div class="col-sm-3">
								<label>メールアドレス <span class="badge badge-danger">必須</span></label>
							</div>
							<div class="col-sm-6">
								<input type="email" name="webinar_inquiry_email" class="form-control">
							</div>
						</div>
						<div class="row">
							<div class="col-sm-3">
								<label>お問い合わせ内容</label>
							</div>
							<div class="col-sm-9">
								<textarea name="webinar_inquiry_content" class="form-control"></textarea>
							</div>
						</div>
					</form>
				</div>
				<div class="modal-footer justify-content-center">
					<button type="submit" class="wp-theme_button btn w-25 setting_theme_color setting_character_color" id="btn_send_webinar_inquiry">送信</button>
				</div>
			</div>
		</div>
	</div>
	<!-- お問い合わせモーダル end -->
	<!-- お問い合わせ完了モーダル start -->
	<div class="modal fade" id="contactCompleteModal" tabindex="-1" role="dialog" aria-labelledby="contactCompleteModalLabel" aria-hidden="true">
		<div class="modal-dialog" role="document">
			<div class="modal-content">
				<div class="modal-body">
					<div class="d-flex flex-column justify-content-center text-center">
						<div class="wp-theme_svg wp-theme_svg_small my-3">
							<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" preserveAspectRatio="xMidYMid meet" viewBox="0 0 96 96" width="96" height="96"><defs><path d="M95 48C95 73.94 73.94 95 48 95C22.06 95 1 73.94 1 48C1 22.06 22.06 1 48 1C73.94 1 95 22.06 95 48Z" id="a5vUpC4jd"></path><path d="M74.26 31.73L38.98 62.55L21.33 45.81" id="bOnQl2aTR"></path></defs><g><g><g><use xlink:href="#a5vUpC4jd" opacity="1" fill="#00ff69" fill-opacity="0"></use><g><use xlink:href="#a5vUpC4jd" opacity="1" fill-opacity="0" stroke="#3c5aad" stroke-width="2" stroke-opacity="1"></use></g></g><g><g><use xlink:href="#bOnQl2aTR" opacity="1" fill-opacity="0" stroke="#3c5aad" stroke-width="2" stroke-opacity="1"></use></g></g></g></g></svg>
						</div>
						<h6 class="font-weight-bold">送信が完了しました。<h6>
						<button type="submit" class="wp-theme_button btn w-25 setting_theme_color setting_character_color" data-dismiss="modal">閉じる</button>
					</div>
				</div>
			</div>
		</div>
	</div>
	 <!-- お問い合わせ完了モーダル end -->

</body>
<!-- For Bootstrap -->
<!--<script src="https://code.jquery.com/jquery-3.4.1.slim.min.js" integrity="sha384-J6qa4849blE2+poT4WnyKhv5vZF5SrPo0iEjwBvKU7imGFAV0wwj1yYfoRSJoZ+n" crossorigin="anonymous"></script>-->
<script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js" integrity="sha384-Q6E9RHvbIyZFJoft+2mJbHaEWldlvI9IOYy5n3zV9zzTtmI3UksdQRVvoxMfooAo" crossorigin="anonymous"></script>
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js" integrity="sha384-wfSDF2E50Y2D1uUdj0O3uMBJnjuUD4Ih7YwaYd1iqfktj0Uod8GCExl3Og8ifwB6" crossorigin="anonymous"></script>