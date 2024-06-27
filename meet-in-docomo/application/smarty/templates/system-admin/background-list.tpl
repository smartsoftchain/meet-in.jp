{include file="./common/systemadminheader.tpl"}

{literal}

<script>

$(function () {
	const NO_IMAGE = "/img/no_image.png?";
	var requestActions = {};

	/*
	 *「追加」ボタンを押した時の処理
	 */
	$("#btn_add").click(function() {
		// 全ての項目を使い切っていない場合は何もしない
		if (!isAllItemUsed()) {
			return;
		}

		// 最初の項目はoriginを使用する
		// 二つめ以降の項目はoriginを複製する
		let crone
		if (getItemCount() == 0) {
			crone = $("tbody tr:first-child");
		}
		else {
			crone = $("tbody tr:first-child").clone(true);
		}

		// テーブルの最後に追加
		crone.appendTo("tbody");

		// 項目のインデックス取得
		let index = parseInt($("#last_index").attr("value")) + 1;
		$("#last_index").attr("value", index);

		// 複製した項目内のvalueとidを設定
		crone.find("td").attr("value", index);
		crone.find("img").attr("id", "file_img_" + index);
		crone.find("input").attr("id", "file_input_" + index);
		crone.find("input").attr("name", "file_" + index);
		crone.find("label").attr("for", "file_input_" + index);
		crone.find("span").attr("id", "file_delete_" + index);

		// 複製した項目の状態初期化
		setImage(index, NO_IMAGE);
		resetInput(index);
		crone.show();
	});

	/*
	 * 「登録」ボタンを押した時の処理
	 */
	 $("#btn_submit").click(function() {
		$("#request_actions").val(JSON.stringify(requestActions));

		$("#btn_submit").prop("disabled", true);
		$("#btn_submit").text("登録中です...");
		$("#background_form").submit();
	});
	
	/*
	 * 「ファイルを選択」ボタンを押した時の処理
	 */
	$("[id^=file_input]").change(function(event) {
		// ファイルが選択されなかった場合はなにもしない
		if (this.files.length == 0) {
			return;
		}

		// インデックス取得
		let index = getIndex($(this));

		// 複数選択はエラー
		if (this.files.length > 1) {
			alert("ファイルを1つ選択してください。");
			resetInput(index);
			return;
		}

		// png以外はエラー
		if (getExt(this.files[0].name) != 'png') {
			alert("pngファイルを選択してください。");
			resetInput(index);
			return;
		}

		// ファイル読み込み
		var fileReader = new FileReader();
		fileReader.onloadend = function(event) {
			// 画像差し替え
			setImage(index, event.target.result);

			// 追加されたことをサーバーに通知するために情報を保存
			requestActions[index] = "add";
		}
		fileReader.readAsDataURL(this.files[0]);
	});

	/*
	* 項目数を取得する
	*/
	function getItemCount() {
		let count = 0;

		$('tbody td').each(function() {
			if ($(this).attr("value") !== "") {
				count++;
			}
		});

		return count;
	}

	/*
	* 全ての頭目を使い切っているか
	*/
	function isAllItemUsed() {
		let ret = true;
		$('tbody td').each(function() {
			if ($(this).attr("value") !== "") {
				// 画像がNO_IMAGEの項目は未使用
				if ($(this).find("img")[0].src.indexOf(NO_IMAGE) > 0) {
					ret = false;
				}
			}
		});

		return ret;
	}
		
	/*
	* インデックス取得
	*/
	function getItemRoot(target) {
		return target.parent().parent().parent().parent();
	}

	/*
	* インデックス取得
	*/
	function getIndex(target) {
		return target.parent().parent().parent()[0].getAttribute("value");
	}

	/*
	* 画像変更
	*/
	function setImage(index, fileName) {
		let img = document.getElementById("file_img_" + index);
		img.src = fileName;
	}

	/*
	* inputリセット
	*/
	function resetInput(index) {
		let input = document.getElementById("file_input_" + index);
		input.value = "";
	}

	/*
	* 拡張子取得
	*/
	function getExt(filename) {
		let pos = filename.lastIndexOf('.');
		if (pos === -1) {
			return '';
		}
		
		let ext = filename.slice(pos + 1);
		return ext.toLowerCase();
	}
});

</script>

<style type="text/css">

.file_img {
	max-width: 155px;
    height: 100px;
    margin: 10px 0;
    border: solid 1px #c8c8c8;
    min-width: 155px;
    min-height: 120px;
}

.button_area {
	float: right;
    margin-right: 400px;
	margin-top: 58px;
}

.file_select {
	cursor: pointer;
	color: #ffffff;
	background-color: #b2b2b2;
	font-size: 11px;
	padding: 0 13.5px;
	border: solid 1px #b2b2b2;
}

.file_input {
	display: none;
}

.file_delete {
	cursor: pointer;
	color: #979797;
	background-color: #ffffff;
	font-size: 11px;
	padding: 0 13.5px;
	border: solid 1px #979797;
}

</style>
		
{/literal}

<!-- メインコンテンツ start -->
<div id="mi_main_contents">

	<!-- コンテンツエリア start -->
	<div id="mi_content_area">

		<!-- コンテンツタイトル start -->
		<div class="mi_content_title">
			<span class="icon-folder mi_content_title_icon"></span>
			<h1>背景画像登録</h1>

			<div class="mi_flt-r">
				<div class="mi_content_title_option">
					<div id="btn_add" class="mi_title_action_btn click-fade">
						<span class="icon-puls"></span>
						<span>追加</span>
					</div>
				</div>
			</div>
		</div>
		<!-- コンテンツタイトル end -->

		<form action="/system-admin/regist-background" method="post" id="background_form" enctype="multipart/form-data">
			<!-- テーブル start -->
			<div class="mi_table_main_wrap">
				<table id="file_tbody" class="mi_table_main document_list">
					<tbody>
						<tr style="display: none;">
							<td value="">
								<img id="file_img_" class="file_img" src=""/>
								<div class="button_area">
									<label for="file_input_" class="file_select">
										ファイルを選択
										<input id="file_input_" class="file_input" type="file" accept=".jpeg,.png" name="file_">
									</label>
								</div>
							</td>
						</tr>
						<label id="last_index" value="{$lastIndex}" style="display: none;">
						<input id="request_actions" type="text" name="request_actions" style="display: none;">
						{foreach from=$list item=row}
						<tr>
							<td value="{$row.index}">
								<img id="file_img_{$row.index}" class="file_img" src="/img/background/{$row.filename}.{$row.extension}"/>
								<div class="button_area">
									<label for="file_input_{$row.index}" class="file_select">
										ファイルを選択
										<input id="file_input_{$row.index}" class="file_input" type="file" name="file_{$row.index}">
									</label>
								</div>
							</td>
						</tr>
						{/foreach}
					</tbody>
				</table>
			</div>
			<!-- テーブル end -->
			
			<div class="mi_tabel_btn_area">
				<button type="button" id="btn_submit" class="mi_default_button mi_btn_m mi_btn_m hvr-fade click-fade">
					登録
				</button>
			</div>
		</form>
					
	</div>
	<!-- コンテンツエリア end -->

</div>
<!-- メインコンテンツ end -->
	
{include file="./common/footer.tpl"}
