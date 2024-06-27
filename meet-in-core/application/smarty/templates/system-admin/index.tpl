{include file="./common/systemadminheader.tpl"}

{literal}

<script>

	window.onload = function() {

		document.querySelectorAll(".mi_connect_input")
				.forEach(elem => {
					check_number_format(elem);
				});

		document.querySelectorAll(".mi_connect_input")
				.forEach(elem => {
					elem.addEventListener("focus", () => {
						check_number_format(elem, false);
					});
				});

		document.querySelectorAll(".mi_connect_input")
				.forEach(elem => {
					elem.addEventListener("blur", () => {
						check_number_format(elem);
					});
				});

	}

	function check_number_format(elem, is_format = true) {
		if (is_format == true) {
			if ($(elem).is('input')) {
				let num = $(elem).val().replace(/^[0]+/, '');
				$(elem).val(number_format(num ? num : 0));
			} else {
				let num = $(elem).text().replace(/^[0]+/, '');
				$(elem).html(number_format(num ? num : 0));
			}
		} else {
			if ($(elem).is('input')) {
				let num = $(elem).val().replace(/,/, '');
				$(elem).val(num);
			} else {
				let num = $(elem).text().replace(/,/, '');
				$(elem).html(num);
			}
		}
	}

	function number_format(num) {
		let result = "";
		if (num) {
			num = String(num).replace(/(\d)(?=(\d\d\d)+$)/g, "$1,");
			result = num;
			// ３．カンマ入りの文字列を表示
		}

		return num;
	}
</script>

{/literal}

{literal}
<style type="text/css">

	p.connect_alert {
		color: #ff2200;
	}

	#background_form {
		background-color: white;
		margin:auto;
	}

	.mi_table_main_wrap {
		position:relative;;
	}

	.mi_connect_input {
		border: 1px solid #7373b5;
		padding: 13px 16px;
		font-size: 12px;
		width: 184px;
	}

	.mi_connect_input_wrap {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		padding-top: 13px;
		padding-left: 16px;
	}

	.mi_connect_input_button {
		width: 110px;
		height: 46px;
	}

</style>

{/literal}

<!-- メインコンテンツ start -->
<div id="mi_main_contents">

	<div id="mi_content_area">

		<!-- コンテンツタイトル start -->
		<div class="mi_content_title">
			<span class="icon-company mi_content_title_icon"></span>
			<h1>導入企業数管理</h1>
		</div>
		<!-- コンテンツタイトル end -->

		<form action="/system-admin/regist-company" method="post" id="background_form" enctype="multipart/form-data">
			<!-- テーブル start -->
			<div class="mi_table_main_wrap">
				<div class="mi_connect_input_wrap">
					{if $msg}
					<p class="connect_alert">{$msg}</p>
					{/if}
					<input type="text" name="number" placeholder="企業数" class="mi_connect_input" value="{$number}">
					<button class="mi_connect_input_button">変更する</button>
					<br>
					<small>※半角数字5桁まで入力可能です。</small>
				</div>
			</div>
			<!-- テーブル end -->

		</form>

	</div>
		<!-- コンテンツエリア end -->

</div>
<!-- メインコンテンツ end -->


{include file="./common/footer.tpl"}
