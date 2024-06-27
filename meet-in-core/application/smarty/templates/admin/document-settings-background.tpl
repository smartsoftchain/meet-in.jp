{include file="./common/header.tpl"}

{literal}

{if $browser === 'IE'}
{else}
<script src="/js/negotiation/negotiation_bodypix_dialog.js?{$application_version}" defer></script>
{/if}

<script>

/*
* 背景選択ダイアログが開く時の処理
*/
const onOpenBodypixDialog = () => {
	let backgroundPath = $("#bodypix_background_path").attr("value");
	let internalResolution = $("#bodypix_internal_resolution").attr("value") / 100;
	let segmentationThreshold = $("#bodypix_segmentation_threshold").attr("value") / 100;
	let maskBlurAmount = $("#bodypix_mask_blur_amount").attr("value");

	// カレント選択
	let selDiv = document.getElementById(`${backgroundPath}`);
	if (selDiv != null) {
		selDiv.classList.toggle('gallery-selected', true);
	}
	// 詳細設定の状態更新
	$('#internalResolutionInput').val(internalResolution*100);
	$('#segmentationThresholdInput').val(segmentationThreshold*100);
	$('#maskBlurAmountInput').val(maskBlurAmount);
	// 「開始ボタン」のテキストを変更
	$("#setting-bodypix-dialog-start-button").text("決定");
	// 「詳細設定ボタン」を非表示
	$("#setting-bodypix-detail-title").hide();
}

/*
* 背景選択ダイアログ内の「決定」ボタンを押した時の処理
*/
const onOkBodypixDialog = () => {
	const galleries = document.querySelector('.gallery-selected');
	if (galleries == null) {
		alert("背景画像が選択されていません")
		return;
	}

	// img差し替え
	updateImage(galleries.id);
	// 保存
	$("#bodypix_background_path").attr("value", galleries.id);
	$("#bodypix_internal_resolution").attr("value", $('#internalResolutionInput').val());
	$("#bodypix_segmentation_threshold").attr("value", $('#segmentationThresholdInput').val());
	$("#bodypix_mask_blur_amount").attr("value", $('#maskBlurAmountInput').val());

	// ダイアログを閉じる
	$("#setting-bodypix-dialog").fadeOut(500);
}

/*
* 背景選択ダイアログ内の「キャンセル」ボタンを押した時の処理
*/
const onCancelBodypixDialog = () => {
}

/*
* 画像設定
*/
function updateImage(id) {
	if(id == null || id == "") {
		$("#file_img")[0].src = "/img/nobackground.png";
		return;
	}

	if (id === 'bodypix_no_effect') {
		$("#file_img")[0].src = "/img/nobackground.png";
	}
	else if (id === 'bodypix_blur_effect') {
		$("#file_img")[0].src = "/img/white-blurred-background.png";
	}
	else
	{
		$("#file_img")[0].src = id;
	}
}

$(function () {

	// DBに保存されてる画像を表示
	let backgroundPath = $("#bodypix_background_path").attr("value");

	// nullの場合は、bodypix_no_effectと同じ扱いにする
	if(backgroundPath == null || backgroundPath == "") {
		$("#bodypix_background_path").attr("value", "bodypix_no_effect");
		backgroundPath = $("#bodypix_background_path").attr("value");
	}

	updateImage(backgroundPath);

	/*
	 * 「背景を選択」ボタンを押した時の処理
	 */
	$('#file_select').click(function(e) {
		// 背景選択ダイアログを開く
		onClickSettingBodypixDialog();
	});

	/*
	 * 「登録」ボタンを押した時の処理
	 */
	 $('#btn_submit').click(function(e) {
		let backgroundPath = $("#bodypix_background_path").attr("value");

		// 何も選択されていない場合は何もしない
		if(backgroundPath == null) {
			return;
		}
		// 画像の最後に付与している番号を削除する
		backgroundPath = backgroundPath.split("?")[0];

		// DBに保存
		$.ajax({
			url: "save-background",
			type: "POST",
			dataType: "text",
			data: {
				"bodypix_background_path" : backgroundPath,
				"bodypix_internal_resolution" : $("#bodypix_internal_resolution").attr("value"),
				"bodypix_segmentation_threshold" : $("#bodypix_segmentation_threshold").attr("value"),
				"bodypix_mask_blur_amount" : $("#bodypix_mask_blur_amount").attr("value"),
				"staff_type" : $('input[id=staff_type]').val(),
				"staff_id"   : $('input[id=staff_id]').val(),
			},
		}).done(function(res) {
			console.log(res)
			alert("登録が完了しました");
		}).fail(function(res) {
			console.log('fail');
		});
	});
});

</script>

<link rel="stylesheet" href="/css/bodypix_dialog.css?{$application_version}">
<style type="text/css">

#file_img {
	max-width: 155px;
    height: 100px;
    margin: 10px 10px;
    border: solid 1px #c8c8c8;
    min-width: 155px;
    min-height: 120px;
}

#button_area {
	float: right;
    margin-right: 236px;
	margin-top: 50px;
}

#file_select {
    color: #555;
    background-color: white;
    font-size: 15px;
	border: solid 1px #e8e8e8;
	margin-left: 15px;
	cursor: pointer;
}

.mi_content_title .title_link_btn {
	float: right;
	background-color: #fa0;
	color: #fff;
	padding: 10px 22px 10px 12px;
	cursor: pointer;
}

#btn_cancel {
	background: #e1e1e1;
    color: #555;
}

#table_title {
	line-height: 152px;	
	margin-right: 53px;
}

#btn_cancel {
	background: #e1e1e1;
    color: #555;
}

#table_row_blank {
    width: 50px;
    min-width: 50px;
    padding: 0;
    background: #fff;
    border-right: 1px solid #e8e8e8;
    color: #6e6e6e;	
}

#table_row_title {
	width: 166px;
    color: #333;
    text-align: left;
    vertical-align: middle;
    font-weight: normal;
    background: #fff;
    border-right: 1px solid #e8e8e8;
	padding-left: 20px;	
}

#table_row_content {
	background: white;
}

#file_select_icon {
	color: #FFAA0E;
}

</style>

{/literal}

<div id="mi_main_contents">
	<!-- トップナビ  start -->
	<div id="mi_top_nav">
		<!-- パンくずリスト start -->
		<div class="mi_breadcrumb_list">
			<a href="/index/menu">TOP</a>&nbsp;&gt;&nbsp;
			<a href="/admin/document-settings-background">背景設定</a>
		</div>
		<!-- パンくずリスト end -->
	</div>
	<!-- トップナビ end -->

	<!-- コンテンツエリア start -->
	<div id="mi_content_area">
		<!-- コンテンツタイトル start -->
		<div class="mi_content_title">
			<span class="icon-parsonal mi_content_title_icon"></span>
			<h1>背景設定</h1>
			<a class="title_link_btn" href="/admin/document-settings-background-tmp">+ 背景テンプレートダウンロード</a>
		</div>
		<!-- コンテンツタイトル end -->

		<form action="/system-admin/regist-background" method="post" id="background_form" enctype="multipart/form-data">
			<!-- テーブル start -->
			<div class="mi_table_main_wrap">
				<table id="file_tbody">
					<tbody>
						<tr>
							<th id="table_row_blank"></th>
							<th id="table_row_title">背景設定</th>
							<td id="table_row_content">
								<div>
									<img id="file_img" src=""/>
                                    <div id="button_area">
										<button type="button" id="file_select">
											<span id="file_select_icon" class="icon-connect"></span>
											<span>背景を選択</span>
										</button>
									</div>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
			<!-- テーブル end -->
			<div class="mi_tabel_btn_area">
				<a href="/index/menu">
					<button type="button" id="btn_cancel" class="mi_default_button mi_btn_m mi_btn_m hvr-fade click-fade">
						キャンセル
					</button>
				</a>
				<button type="button" id="btn_submit" class="mi_default_button mi_btn_m mi_btn_m hvr-fade click-fade">
					登録
				</button>
			</div>
		</form>

	</div>
	<!-- コンテンツエリア end -->

	<input type="hidden" id="bodypix_background_path" name="bodypix_background_path" value="{$bodypix_background_path}">
	<input type="hidden" id="bodypix_internal_resolution" name="bodypix_internal_resolution" value="{$bodypix_internal_resolution}">
	<input type="hidden" id="bodypix_segmentation_threshold" name="bodypix_segmentation_threshold" value="{$bodypix_segmentation_threshold}">
	<input type="hidden" id="bodypix_mask_blur_amount" name="bodypix_mask_blur_amount" value="{$bodypix_mask_blur_amount}">

</div>
<!-- メインコンテンツ end -->

{include file="./negotiation/negotiation-setting-bodypix.tpl"}

{include file="./common/footer.tpl"}
