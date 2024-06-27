/**
 * ウェビナーリード関連で使用するJS
 */
$(function () {
	/* 登録ボタン押下時のイベント */
	$("[name=submit_button]").click(function(){
		$(this).prop("disabled", true);
		$(this).text("登録中です...");
		$(this).closest("form").submit();
	});
	/**
	 * ウェビナーリードの削除ボタン押下時のイベント
	 */
	$('[name=lnk_delete_webinar_lead]').click(function(){
		// 削除対象のIDを取得する
		var webinarLeadIds = [];
		$("[name=chk_webinar_lead_id]:checked").each(function() {
			webinarLeadIds.push($(this).val());
		});
		if(webinarLeadIds.length > 0){
			if(confirm("選択したウェビナーリードを削除します。")){
				// メール作成に必要な情報を取得する
				$.ajax({
					type: "POST",
					url: "/webinar-lead/delete-webinar-lead",
					dataType: "json",
					data: {
						"webinarLeadIds" : webinarLeadIds
					}
				}).done(function(result) {
					if(result.status == 1){
						alert("削除が完了しました。");
						// 一覧で最新情報を表示するために再読み込みする
						location.reload();
					}else{
						// エラーメッセージを表示する
						var errorMessage = "";
						for (let i = 0; i < result.errors.length; i++) {
							errorMessage += result.errors[i] + "\n";
						}
						alert(errorMessage);
					}
				}).fail(function(data) {
				});
			}
		}else{
			alert("一覧表で削除対象を選択してください。");
		}
	});




	/**
	 * メールの添付ファイルアップロードの処理
	 */
	var droppable = $(".drop_csv_area");
	droppable.on("dragenter", function(e){
		e.stopPropagation();
		e.preventDefault();
		$(".drop_csv_area").addClass("droppable_drop_csv_area");
		return false;
	});
	droppable.on("dragover", function(e){
		e.stopPropagation();
		e.preventDefault();
		$(".drop_csv_area").addClass("droppable_drop_csv_area");
		return false;
	});
	droppable.on("dragleave", function(e){
		e.stopPropagation();
		e.preventDefault();
		$(".drop_csv_area").removeClass("droppable_drop_csv_area");
		return false;
	});
	// ドロップ時のイベントハンドラを設定します.
	droppable.on("drop", function(event){
		event.stopPropagation();
		event.preventDefault();
		var files = event.originalEvent.dataTransfer.files;
		if(files.length == 1){
			uploadCsvFile(files[0]);
		}else{
			alert("アップロードは1ファイルのみです。");
		}
		$(".drop_csv_area").removeClass("droppable_drop_csv_area");
		return false;
	});
	/**
	 * アップロードされた添付ファイルを展開する
	 * @param {*} files 
	 */
	function uploadCsvFile(csvFile) {
		// CSVデータ表示領域を非表示にする
		$(".display_lead_upload_csv_area").hide();
		// CSVデータ表示領域の初期化
		$(".display_csv_tbody").empty();
		// ファイル名を取得する
		var fileName = csvFile.name;
		if(fileName.toUpperCase().match(/\.(CSV)$/i)){
			// ファイルの内容をFileReaderで読み込む
			var fileReader = new FileReader();
			fileReader.onload = function(event) {
				//console.log(fileName);
				//console.log(event.target.result);
				$.ajax({
					type: "POST",
					url: "/webinar-lead/upload-csv-file",
					dataType: "json",
					data: {
						"fileName" : fileName, "csvData" : event.target.result
					}
				}).done(function(result) {
					//console.log(result);
					// １行ずつのループ
					for (let i = 0; i < result.length; i++) {
						// １項目ずつのループ
						tdTag = '<tr class="tr_read_line">';
						tdTag += '<td><input type="radio" name="radio_read_line" value="'+i+'"></td>'
						for (let j = 0; j < result[i].length; j++) {
							// 項目を設定する
							tdTag += "<td>"+result[i][j]+"</td>";
						}
						tdTag += "</tr>"
						// CSVの１行全て読み込めたらtbodyに追加する
						$(".display_csv_tbody").append(tdTag);
					}
					// CSVデータ表示領域を表示する
					$(".display_lead_upload_csv_area").show();
				}).fail(function(data) {
				});
			};
			fileReader.readAsText(csvFile, "Shift_JIS");
		}else{
			alert("アップロードできるのはCSVファイルのみです。");
		}
	}
	// ファイル追加リンク押下からの画像追加イベント
	$('[name=upload_csv_file]').change(function(){
		// ファイル情報を取得
		uploadCsvFile(this.files[0]);
		// fileタグのデータは初期化する
		$('[name=upload_csv_file]').val("");
		return false;
	});

	/**
	 * 表示したCSVの行が選択された場合のイベント
	 * ラジオボタンにチェックをつける
	 */
	$(document).on('click', '.tr_read_line', function(){
		// 押下したtr要素配下のradioボタンにチェックをつける
		$(this).find("[name=radio_read_line]").prop('checked', true);
	});

	/**
	 * CSV登録ボタン押下時のイベント
	 */
	$("[name=btn_csv_upload]").click(function(){
		// 登録ボタンの連打を制御する
		//$("[name=btn_csv_upload]").prop("disabled", true);
		//$("[name=btn_csv_upload]").text("登録中です...");
		// エラーメッセージ領域初期化
		$(".upload_csv_error_area").hide();
		$(".upload_csv_error_area").find("strong").empty();
		
		// CSV登録種別を取得する
		var registType = $("[name=regist_type]:checked").val();
		// 読み込み位置を取得する
		var readLine = $("[name=radio_read_line]:checked").val();
		$.ajax({
			type: "POST",
			url: "/webinar-lead/regist-csv",
			dataType: "json",
			data: {
				"registType" : registType, "readLine" : readLine
			}
		}).done(function(result) {
			if(result.status == 1){
				alert("登録が完了しました。");
				// リード一覧へ遷移する
				window.location.href = "/webinar-lead/list";
			}else{
				// エラーを表示する
				for (let i = 0; i < result.errors.length; i++) {
					$(".upload_csv_error_area").find("strong").append(result.errors[i]+"<br>");
				}
				$(".upload_csv_error_area").show();
			}
			$("[name=btn_csv_upload]").prop("disabled", false);
			$("[name=btn_csv_upload]").text("登録する");
		}).fail(function(data) {
		});


	});
});
