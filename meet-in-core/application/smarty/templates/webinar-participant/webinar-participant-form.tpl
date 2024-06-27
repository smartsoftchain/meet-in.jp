<!-- [ウェビナー予約画面_詳細入力](https://xd.adobe.com/view/ab500cf4-6bae-4168-5402-8e74b0fc99e4-dd61/screen/7ac6b652-d5a8-4477-b264-594ec6c65120/-/) -->

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
		<h2 class="setting_theme_color_character">ウェビナー予約</h2>
		<small>下記にお客様の情報を入力の上、「予約確定」ボタンをクリックしてください。</small>
	</div>
	<!-- メインコンテンツ -->
	<main>
		<div class="d-flex flex-column align-items-center mb-4">
			<div class="container mb-4">
				<div class="container-sm mb-4 error_msg_area">
					<!-- エラーメッセージ表示領域 -->
					{foreach from=$webinar.errors item=row}
						<strong style='color: red;'>{$row}</strong><br>
					{/foreach}
				</div>
				<input type="hidden" name="url_param" value="{$webinar.url_param}" />
				<table class="table table-bordered bg-white text-nowrap wp-reservation_form">
					<tbody>
					<tr>
						<th scope="row">名前 <span class="badge badge-danger">必須</span></th>
						<td>
							<div class="form-row">
								<div class="col-md-8">
									<input type="text" class="form-control" name="name"/>
								</div>
							</div>
						</td>
					</tr>
					<tr>
						<th scope="row">フリガナ <span class="badge badge-danger">必須</span></th>
						<td>
							<div class="form-row">
								<div class="col-md-8">
									<input type="text" class="form-control" name="kana"/>
								</div>
							</div>
						</td>
					</tr>
					<tr>
						<th scope="row">企業名 <span class="badge badge-danger">必須</span></th>
						<td>
							<div class="form-row">
								<div class="col-md-8">
									<input type="text" class="form-control" name="company_name"/>
								</div>
							</div>
						</td>
					</tr>
					<tr>
						<th scope="row">部署</th>
						<td>
							<div class="form-row">
								<div class="col-md-8">
									<input type="text" class="form-control" name="company_department"/>
								</div>
							</div>
						</td>
					</tr>
					<tr>
						<th scope="row">役職</th>
						<td>
							<div class="form-row">
								<div class="col-md-8">
									<input type="text" class="form-control" name="company_position"/>
								</div>
							</div>
						</td>
					</tr>
					<tr>
						<th scope="row">電話番号 <span class="badge badge-danger">必須</span></th>
						<td>
							<div class="form-row">
								<div class="col-md-4">
									<input type="tel" class="form-control" name="tel_number"/>
								</div>
							</div>
						</td>
					</tr>
					<tr>
						<th scope="row">メールアドレス <span class="badge badge-danger">必須</span></th>
						<td>
							<div class="form-row">
								<div class="col-md-8">
									<input type="email" class="form-control" name="mail_address"/>
								</div>
							</div>
						</td>
					</tr>
					<tr>
						<th scope="row">住所 <span class="badge badge-danger">必須</span></th>
						<td>
							<div class="form-row align-items-center">
								〒
								<div class="col">
									<input type="text" class="form-control" name="postcode1"/>
								</div>
								-
								<div class="col">
									<input type="text" class="form-control" name="postcode2"/>
								</div>
								<div class="col-md-7">
									<input type="text" class="form-control" name="street_address"/>
								</div>
							</div>
						</td>
					</tr>
					</tbody>
				</table>
			</div>
			{if $webinar.error == ""}
				<button class="btn wp-theme_button w-25 setting_theme_color setting_character_color" id="btn_webinar_reservation">予約確定</button>
			{else}
				<button class="btn wp-theme_button w-25 setting_theme_color setting_character_color">現在予約できません。</button>
			{/if}
		</div>
	</main>

</body>
<!-- For Bootstrap -->
<!--<script src="https://code.jquery.com/jquery-3.4.1.slim.min.js" integrity="sha384-J6qa4849blE2+poT4WnyKhv5vZF5SrPo0iEjwBvKU7imGFAV0wwj1yYfoRSJoZ+n" crossorigin="anonymous"></script>-->
<script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js" integrity="sha384-Q6E9RHvbIyZFJoft+2mJbHaEWldlvI9IOYy5n3zV9zzTtmI3UksdQRVvoxMfooAo" crossorigin="anonymous"></script>
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js" integrity="sha384-wfSDF2E50Y2D1uUdj0O3uMBJnjuUD4Ih7YwaYd1iqfktj0Uod8GCExl3Og8ifwB6" crossorigin="anonymous"></script>

