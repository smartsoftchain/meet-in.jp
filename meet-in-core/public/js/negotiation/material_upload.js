/**
*
*	商談画面でファイルをアップロードする機能のみを記述
*
**/

var uploadDocumentFlg = false;

function disableUploadDocument() {
	uploadDocumentFlg = true;
}

function enableUploadDocument() {
	uploadDocumentFlg = false;
}

$(function (){

	// ファイルアップロード領域のID
	var droppable = $("#mi_content_area_negotiation");
	// File API が使用できるか判定する
	if(!window.FileReader) {
		alert("File API がサポートされていません。");
		return false;
	}
	// イベントをキャンセルするハンドラです.
	var cancelEvent = function(event) {
		event.preventDefault();
		event.stopPropagation();
		return false;
	};
	// dragenter, dragover イベントのデフォルト処理をキャンセルする
	droppable.bind("dragenter", cancelEvent);
	droppable.bind("dragover", cancelEvent);

	// ドロップ時のイベントハンドラを設定
	droppable.bind("drop", function(event) {
		if(typeof event.originalEvent.dataTransfer != "undefined"){
			var files = event.originalEvent.dataTransfer.files;
			var staffRole = $('#staff_role').val();
			// アルバイト権限ユーザーはファイルアップロード不可
			if (staffRole == "CE_3" || staffRole == "AA_3") {
				disableUploadDocument();
				alert("アルバイト権限では資料のアップロードはできません。");
			}
			if(!uploadDocumentFlg){
				if(files.length == 1){
					var file = files[0];
					// ファイル拡張子を小文字へ変換する
					uploadFileName = file.name.toLowerCase();

					if (uploadFileName.match(/.+\.(gif|jpg|png|pdf|docx?|xlsx?|pptx?)$/)) {
						// アップロードフラグを建てる
						disableUploadDocument();
						// ファイル読み込み中のメッセージを表示する
						$("div.upload_document_message").text("アップロード中です");
						$("div.upload_document_message_area").show();
						// 他のユーザーに資料アップロード開始を通知する
						var data = {
								command : "DOCUMENT",
								type : "UPLOAD_DOCUMENT_BEGIN"
						};
						sendCommand(SEND_TARGET_ALL, data);

						// ファイルの内容は FileReader で読み込みます.
						var fileReader = new FileReader();
						fileReader.onload = function(event) {

							//console.log(event.target.result);
							var staffType = $("#staff_type").val();
							var staffId = $("#staff_id").val();
							var clientId = $("#client_id").val();
							var uuId = localStorage.UUID;
							if( !uuId ) {	// 空
								uuId = UUID.generate();
								localStorage.UUID = uuId;
							}
							$.ajax({
								url: "https://" + location.host + "/negotiation/upload-material",
								type: "POST",
								data: {filename : uploadFileName, filedata : event.target.result, staff_type : staffType, staff_id : staffId, client_id : clientId},
								success: function(resultJson) {
									console.log(resultJson)
									// jsonをオブジェクトに変換
									var result = $.parseJSON(resultJson);
									var resultMaterialId = 0;
									if(result["status"] == 1){
										// 資料IDの設定
										resultMaterialId = result["material_basic"]["material_id"];

										// アップロードした資料を1件読み直す
										getMaterial(resultMaterialId, $('#user_id').val(), staffType, staffId, clientId, uuId);
//										getMaterial(resultMaterialId, $('#user_id').val());

										// ファイル読み込みメッセージを表示する
										$("div.upload_document_message").text("アップロード完了しました");
									}else if(result["status"] == 2){
										// 容量オーバー
										$("div.upload_document_message").text("保存容量を超えています。");
									}else{
										$("div.upload_document_message").text("アップロード失敗しました");
									}

									// 他のユーザーに資料アップロード終了を通知する
									// UPしたユーザのUUID追加
									var data = {
											command : "DOCUMENT",
											type : "UPLOAD_DOCUMENT_END",
											resultMaterialId : resultMaterialId,
											registUserId : $('#user_id').val(),
											staff_type : staffType,
											staff_id : staffId,
											client_id : clientId,
											uu_id : uuId
									};
									sendCommand(SEND_TARGET_ALL, data);

									// アップロードメッセージを消すためのタイマーを設定
									setTimeout(function(){
										$("div.upload_document_message_area").hide();
									},2000);

									// 資料アップロード完了時のみ、表示するメッセージ
									if(result["status"] == 1){
										// tooltip表示
										$('.material_button_tooltip').tooltipster('open');
										// アップロードメッセージを消すためのタイマーを設定
										setTimeout(function(){
											$('.material_button_tooltip').tooltipster('close');
										},2000);
									}

									// アップロードフラグを下ろす
									enableUploadDocument();
								}
							});

						};
						fileReader.readAsDataURL(file);
					} else {
						alert("アップロード出来るのは拡張子（gif/jpg/png/pdf/doc/docx/xls/xlsx/ppt/pptx）です。");
					}
				}else{
					// サムネイルドラッグの場合はlengthが0でこの処理を通過する
					if(files.length > 1){
						alert("同時に複数のファイルをアップロードできません。");
					}
				}
			}else{
				if(files.length > 0){
					// alert("既に資料アップロード中です。");
				}
			}
		}
		// デフォルトの処理をキャンセルします.
		cancelEvent(event);

		return false;
	});
});
