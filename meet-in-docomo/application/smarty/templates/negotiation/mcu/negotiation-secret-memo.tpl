<!-- シークレットメモ表示 start -->
{literal}

<script>
	$(function (){
		var secretMemoFontSize = 1;
		// 文字サイズ変更ボタンの押下イベント
		// 拡大ボタン
		$(document).on('click', '.secret_memo_fontsize_large', function(){
			if(secretMemoFontSize == 1){
				$(".secret_memo_text_area textarea").css("fontSize", "14px");
				secretMemoFontSize = 2;
			}else if(secretMemoFontSize == 2) {
				$(".secret_memo_text_area textarea").css("fontSize", "20px");
				secretMemoFontSize = 3;
			}
		});
		// 縮小ボタン
		$(document).on('click', '.secret_memo_fontsize_small', function(){
			if(secretMemoFontSize == 3){
				$(".secret_memo_text_area textarea").css("fontSize", "14px");
				secretMemoFontSize = 2;
			}else if(secretMemoFontSize == 2){
				$(".secret_memo_text_area textarea").css("fontSize", "11px");
				secretMemoFontSize = 1;
			}
		});
	});
</script>
{/literal}
<link rel="stylesheet" href="/css/secret_memo.css?{$application_version}">
<div class="mi_secret_memo_area" id="negotiation_secret_memo">
	<div class="secret_memo_area">
		<div class="secret_memo_head">
			<div class="secret_memo_head_left">
				<span class="icon-browse-out secret_memo_icon"></span>
				<span class="secret_memo_title">シークレットメモ</span>
			</div>
			<div class="secret_memo_head_right">
				<span class="icon-close secret_memo_close"></span>
			</div>
			<div class="clear_both"></div>
		</div>
		<div class="secret_memo_text_area">
			<textarea class="secret_memo_text"></textarea>
		</div>
		<div class="secret_memo_icon_area">
			<div class="left_icon_area">
				<span class="secret_memo_fontsize secret_memo_fontsize_small">小</span>
				<span class="secret_memo_fontsize secret_memo_fontsize_large">大</span>
			</div>
			<div class="clear_both"></div>
		</div>
	</div>
</div>
<!-- シークレットメモ表示 end -->
