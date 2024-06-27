/*
 * ウェビナーのメールモーダル関連で使用するJS
 */
$(function () {
	$('[name=send_date]').datepicker({
		dateFormat: 'yy/mm/dd', 
	});
	/**
	 * メールモーダル表示イベント
	 */
	$('.show-modal-content-mail').click(function(event){
		// 前回入力値の初期化処理
		initMailModalData();
		// メールテンプレート
		$("[name=select_mail_template]").empty();
		$("[name=select_mail_template]").append($('<option>').html("選択してください。").val(""));
		$.ajax({
			type: "GET",
			url: "/mail-template/list",
			dataType: "json"
		}).done(function(result) {
			$.each(result, function(index, template){
				$("[name=select_mail_template]").append($('<option>').html(template.name).val(template.id));
			})
		}).fail(function(data) {
		});
		// サーバー送信情報をローカル変数へ一時保存（ajax後はthisが変わる為）
		var mailType = $(this).data("mailType");
		var webinarId = "";
		var mailTargetIds = [];
		// メール送信種別によりid取得方法を変更する
		if(mailType == "single-participant"){
			// 個別メール送信用ID取得
			mailTargetIds.push($(this).data("participantId"));
			// 参加者一覧はウェビナーIDを取得
			webinarId = $("[name=webinarId]").val();
		}else if(mailType == "multiple-participant"){
			// 複数メール送信用ID取得
			$("[name=chk_participant_id]:checked").each(function() {
				mailTargetIds.push($(this).val());
			});
			// 参加者一覧はウェビナーIDを取得
			webinarId = $("[name=webinarId]").val();
		}else if(mailType == "single-lead"){
			// 個別メール送信用ID取得
			mailTargetIds.push($(this).data("webinarLeadId"));
		}else if(mailType == "multiple-lead"){
			// 複数メール送信用ID取得
			$("[name=chk_webinar_lead_id]:checked").each(function() {
				mailTargetIds.push($(this).val());
			});
			// 参加者一覧はウェビナーIDを取得
			webinarId = $("[name=webinarId]").val();
		}
		if(mailTargetIds.length > 0){
			// メール作成に必要な情報を取得する
			$.ajax({
				type: "POST",
				url: "/webinar/get-mail-create-info",
				dataType: "json",
				data: {
					"mailType" : mailType, "webinarId" : webinarId, "mailTargetIds" : mailTargetIds
				}
			}).done(function(result) {
				// 送信先を初期化し設定する
				$("[name=view_destination_text]").empty();
				$("[name=view_destination_text]").append(result["view_destination_text"]);
				// 埋め込みタグをselectboxへ設定する
				for (let i = 0; i < result["mailEmbeddedTag"].length; i++) {
					$("[name=select_mail_embedded]").append($('<option>').html(result["mailEmbeddedTag"][i]["text"]).val(result["mailEmbeddedTag"][i]["val"]));
				}
				// ウェビナー選択セレクトボックスを作成
				for (let i = 0; i < result["webinarList"].length; i++) {
					$("[name=select_webinar]").append($('<option>').html(result["webinarList"][i]["text"]).val(result["webinarList"][i]["val"]));
				}
				// スクロールを戻す、モーダルを上段へスクロールする
				$('#modal-content-mail').find(".modal_content_mail_area").animate({scrollTop:0});
				// メールモーダル表示
				$("#modal-content-mail").fadeIn(500);
			}).fail(function(data) {
				
			});
		}else{
			alert("一覧表で送信先を選択してください。");
		}
	});
	/**
	 * メールモーダルを表示した際に、
	 * 前回の入力値が設定されている可能性があるので初期化する処理
	 */
	function initMailModalData(){
		// メールモーダルの宛先入力欄初期化
		$('div.modal_content_mail_area').find("input").each(function(index) {
			if($(this).attr("type").toLowerCase() == "text"){
				// textの初期化
				$(this).val("");
			}else if($(this).attr("type").toLowerCase() == "radio"){
				// radioボタンの初期化
				$(this).prop('checked', false);
			}
		});
		// ウェビナー選択初期化
		$("[name=select_webinar]").empty();
		// 差込タグ初期化
		$("[name=select_mail_embedded]").empty();
		// ウェビナー差し込みタグ初期化
		$("[name=select_webinar_embedded]").empty();
		$("[name=select_webinar_embedded]").append($('<option>').html("選択してください。").val(""));
		// 本文初期化
		$("[name=mail_body]").val("");
		// 添付名称初期化
		$(".mcm_appended_names").empty();
	}

	/**
	 * メールテンプレートを選択した時の挙動
	 */
	$('[name=select_mail_template]').change(function(event) {
		initMailModalData();
		var id = $(this).val();
		if(id !== "") {
			console.log(id);
			$.ajax({
				type: "GET",
				url: "/mail-template/detail",
				dataType: "json",
				data: {
					"id" : id
				}
			}).done(function(result) {
				$("[name=sender_name]").val(result.from_name);
				$("[name=sender_address]").val(result.from);
				$("[name=mail_subject]").val(result.subject);
				$("[name=mail_body]").val(result.bodytext);
				$("[name=mail_type]").val(result.mail_type);
				if (result.mail_type == 2) {
					$('#mail_body').trumbowyg();
				} else {
					$('#mail_body').trumbowyg('destroy');
				}
			}).fail(function(data) {
			});
		}
	})

	/**
	 * 差込タグを選択した際にメール本文へ文字を挿入する処理
	 */
	$('[name=select_mail_embedded]').change(function(event){
		//テキストエリアと挿入する文字列を取得
		var area = document.getElementById('mail_body');
		var text = $(this).val();
		//カーソルの位置を基準に前後を分割して、その間に文字列を挿入
		area.value = area.value.substr(0, area.selectionStart)
				+ text
				+ area.value.substr(area.selectionStart);
	});
	/**
	 * メールモーダル非表示イベント（×アイコン押下時）
	 */
	$('.mcm_close_icon').click(function(event){
		if ($('#modal-content-mail').is(':visible')) {
			$("#modal-content-mail").fadeOut(500);
		}else if($('#modal-content-mail-confirme').is(':visible')){
			$("#modal-content-mail-confirme").fadeOut(500);
		}
	});
		/**
	 * メールモーダル非表示イベント（モーダル外押下時）
	 */
	$(document).click(function(event) {
		if($(event.target).hasClass('mi_modal_shadow')) {
			if ($('#modal-content-mail').is(':visible')) {
				$("#modal-content-mail").fadeOut(500);
			}else if($('#modal-content-mail-confirme').is(':visible')){
				$("#modal-content-mail-confirme").fadeOut(500);
			}
		}
	});
	/**
	 * メール送信確認ボタン押下時のイベント
	 */
	$('[name=button_mail_confirme]').click(function(event){
		// 確認画面の初期化
		$("[name=confirme_sender_name]").empty();
		$("[name=confirme_sender_address]").empty();
		$("[name=confirme_view_destination_text]").empty();
		$("[name=confirme_mail_subject]").empty();
		$("[name=confirme_mail_body]").empty();
		$("[name=confirme_send_date]").empty();
		$("[name=confirme_appended_names]").empty();

		// 確認画面で入力したデータを確認モーダルへ設定する
		$("[name=confirme_sender_name]").append($("[name=sender_name]").val());
		$("[name=confirme_sender_address]").append('<div class="mcm_confirme_view_frame">'+$("[name=sender_address]").val()+'</div>');
		$("[name=confirme_view_destination_text]").html($("[name=view_destination_text]").html());
		$("[name=confirme_mail_subject]").append($("[name=mail_subject]").val());
		if($("[name=mail_type]").val() == 2){
			$("[name=confirme_mail_body]").text($(".trumbowyg-editor").html());
			$('#confirme_mail_body').trumbowyg();
		} else {
			$("[name=confirme_mail_body]").text($("[name=mail_body]").val());
			$('#confirme_mail_body').trumbowyg('destroy');
		}
		// 日時を作成する
		var sendDate = "";
		if($("[name=send_date_status]:checked").val() == 1){
			sendDate = "今すぐ送信";
		}else{
			sendDate = $("[name=send_date]").val() + " " + $("[name=send_hour]").val() + ":" + $("[name=send_minute]").val();
		}
		$("[name=confirme_send_date]").append(sendDate);
		// 添付ファイル名を作成する
		// ファイル名を表示し直す
		for (let i = 0; i < appendedFileList.length; i++) {
			var tag = '<div class="mcm_confirme_view_frame">'+appendedFileList[i]["fileName"]+'</div>';
			$("[name=confirme_appended_names]").append(tag);
		}
		// エラー表示領域を初期化する
		$("div.error_mail_confirme_area").empty();
		// スクロールを戻す、モーダルを上段へスクロールする
		$('#modal-content-mail-confirme').find(".modal_content_mail_area").animate({scrollTop:0});
		// メール入力モーダル非表示
		$("#modal-content-mail").fadeOut(500);
		// メール確認モーダル表示
		$("#modal-content-mail-confirme").fadeIn(500);
	});

	/**
	 * メール送信処理
	 */
	$('[name=btn_send_mail]').click(function(event){
		// メール作成に必要な情報を取得する
		$.ajax({
			type: "POST",
			url: "/webinar/send-webinar-mail",
			dataType: "json",
			data: {
				"sender_name" : $("[name=sender_name]").val(), 
				"sender_address" : $("[name=sender_address]").val(), 
				"destination_address" : $("[name=destination_address]").val(), 
				"destination_cc" : $("[name=destination_cc]").val(), 
				"destination_bcc" : $("[name=destination_bcc]").val(), 
				"mail_subject" : $("[name=mail_subject]").val(), 
				"mail_type" : $("[name=mail_type]").val(), 
				"mail_body" : $("[name=mail_body]").val(), 
				"send_date_status" : $("[name=send_date_status]:checked").val(),
				"send_date" : $("[name=send_date]").val(), 
				"send_hour" : $("[name=send_hour]").val(), 
				"send_minute" : $("[name=send_minute]").val(), 
				"appendedFileList" : appendedFileList
			}
		}).done(function(result) {
			// ステータスを確認する
			if(result.status == 1){
				// メール確認モーダル非表示にし、完了モーダルを表示する
				$("#modal-content-mail-confirme").fadeOut(500);
				$("#modal-content-mail-complete").fadeIn(500);
			}else if(result.status == 2){
				// エラー表示領域を初期化する
				$("div.error_mail_confirme_area").empty();
				// エラーを表示する
				for (let i = 0; i < result["errors"].length; i++) {
					$("div.error_mail_confirme_area").append('<div class="error_mail_message">'+result["errors"][i]+'</div>');
				}
				// スクロールを画面先頭へ移動し、メッセージを見えるようにする
				$('#modal-content-mail-confirme').find(".modal_content_mail_area").animate({scrollTop:0});
			}else{
				// エラー表示領域を初期化する
				$("div.error_mail_confirme_area").empty();
				// エラーを表示する
				for (let i = 0; i < result["errors"].length; i++) {
					$("div.error_mail_confirme_area").append('<div class="error_mail_message">'+result["errors"][i]+'</div>');
				}
				// スクロールを画面先頭へ移動し、メッセージを見えるようにする
				$('#modal-content-mail-confirme').find(".modal_content_mail_area").animate({scrollTop:0});
			}
		}).fail(function(data) {
		});
	});

	/**
	 * メール送信確認画面でキャンセルした場合のイベント
	 */
	$('[name=btn_cancel_mail]').click(function(event){
		// スクロールを戻す、モーダルを上段へスクロールする
		$('#modal-content-mail').find(".modal_content_mail_area").animate({scrollTop:0});
		// メール入力モーダル非表示
		$("#modal-content-mail-confirme").fadeOut(500);
		// メール確認モーダル表示
		$("#modal-content-mail").fadeIn(500);
	});
	/**
	 * 送信日時のradio押下時の処理
	 */
	$('[name=send_date_status]').click(function(event){
		if($(this).val() == 1){
			// 今すぐ送信の場合は日時を初期化する
			$("[name=send_date]").val("");
			$("[name=send_hour]").val("");
			$("[name=send_minute]").val("");
			// 日時入力できないようにdisabledを設定
			$("[name=send_date]").prop('disabled', true);
			$("[name=send_hour]").prop('disabled', true);
			$("[name=send_minute]").prop('disabled', true);
		}else{
			// 日時を指定
			// 日時入力できるようにdisabledを解除する
			$("[name=send_date]").prop('disabled', false);
			$("[name=send_hour]").prop('disabled', false);
			$("[name=send_minute]").prop('disabled', false);
		}
	});

	/**
	 * メール送信完了モーダルの閉じるボタン押下
	 */
	$('[name=btn_mail_complete]').click(function(event){
		// 完了モーダルを閉じる
		$("#modal-content-mail-complete").fadeOut(500);
		// 一覧で最新情報を表示するために再読み込みする
		location.reload();
	});

	/**
	 * ウェビナーを選択した場合のイベント
	 */
	$("[name=select_webinar]").change(function(event){
		// ウェビナー差し込みタグ欄を初期化する
		$("[name=select_webinar_embedded]").empty();
		$.ajax({
			type: "POST",
			url: "/webinar/get-webinar-embedded-tag",
			dataType: "json",
			data: {"webinarId" : $(this).val()}
		}).done(function(result) {
			// 埋め込みタグをselectboxへ設定する
			for (let i = 0; i < result["mailEmbeddedTag"].length; i++) {
				$("[name=select_webinar_embedded]").append($('<option>').html(result["mailEmbeddedTag"][i]["text"]).val(result["mailEmbeddedTag"][i]["val"]));
			}
		}).fail(function(data) {
		});
	});
	/**
	 * ウェビナー差込タグを選択した際にメール本文へ文字を挿入する処理
	 */
	$('[name=select_webinar_embedded]').change(function(event){
		//テキストエリアと挿入する文字列を取得
		var area = document.getElementById('mail_body');
		var text = $(this).val();
		//カーソルの位置を基準に前後を分割して、その間に文字列を挿入
		area.value = area.value.substr(0, area.selectionStart)
				+ text
				+ area.value.substr(area.selectionStart);
	});

	/**
	 * メールの添付ファイルアップロードの処理
	 */
	var appendedFileList = [];
	var droppable = $("#mcm_appended_draggable_area");
	droppable.on("dragenter", function(e){
		e.stopPropagation();
		e.preventDefault();
		$("#mcm_appended_draggable_area").addClass("droppable_appended");
		return false;
	});
	droppable.on("dragover", function(e){
		e.stopPropagation();
		e.preventDefault();
		$("#mcm_appended_draggable_area").addClass("droppable_appended");
		return false;
	});
	droppable.on("dragleave", function(e){
		e.stopPropagation();
		e.preventDefault();
		$("#mcm_appended_draggable_area").removeClass("droppable_appended");
		return false;
	});
	// ドロップ時のイベントハンドラを設定します.
	droppable.on("drop", function(event){
		event.stopPropagation();
		event.preventDefault();
		var files = event.originalEvent.dataTransfer.files;
		uploadAppendedFile(files);
		$("#mcm_appended_draggable_area").removeClass("droppable_appended");
		return false;
	});
	/**
	 * アップロードされた添付ファイルを展開する
	 * @param {*} files 
	 */
	function uploadAppendedFile(files) {
		// 現在のファイル容量合計を計算する
		var totalUploadAppendedSize = 0;
		for (let i = 0; i < appendedFileList.length; i++) {
			totalUploadAppendedSize += Number(appendedFileList[i]["fileSize"]);
		}
		for (var i=0; i < files.length; i++) {
			if(appendedFileList.length < 3){
				var file = files[i];
				// ファイルサイズをメガに変換し取得する
				var convFileSize = (totalUploadAppendedSize + Number(file.size)) / 1048576;
				if (convFileSize <= 10) {
					// ファイルの内容は FileReader で読み込みます.
					var fileReader = new FileReader();
					fileReader.onload = function(event) {
						// アップロード可能であれば変数へ保存する
						appendedFileList.push({"fileName" : file.name, "fileData" : event.target.result, "fileSize" : file.size});
						// ファイルのindexを作成
						var fileIndex = appendedFileList.length + i;
						// ファイル名を画面に表示する
						var tag = '<div class="mcm_appended_name">'+file.name+'<span class="icon-close icon_close_appended" data-file-index="'+fileIndex+'"></span></div>';
						$("div.mcm_appended_names").append(tag);
					};
					fileReader.readAsDataURL(file);
				} else {
					alert("アップロードできるのは10Mまでです。");
				}
			}else{
				alert("添付ファイルは3つまでです。");
			}
		}
	}
	/**
	 * アップロード添付ファイルを削除する
	 */
	$(document).on('click', '.icon_close_appended', function(){
		// ファイルのindexを取得する
		var fileIndex = $(this).data("fileIndex");
		// ファイルを配列から削除する
		var tmpAppendedFileList = [];
		for (let i = 0; i < appendedFileList.length; i++) {
			if(fileIndex != i){
				// 削除対象以外のデータはtmpへ詰める
				tmpAppendedFileList.push(appendedFileList[i]);
			}
		}
		// 詰め直し物を再度設定する
		appendedFileList = tmpAppendedFileList;
		// 表示ファイル名を削除する
		$(this).closest("div.mcm_appended_names").empty();
		// ファイル名を表示し直す
		for (let i = 0; i < appendedFileList.length; i++) {
			var tag = '<div class="mcm_appended_name">'+appendedFileList[i]["fileName"]+'<span class="icon-close icon_close_appended" data-file-index="'+i+'"></span></div>';
			$("div.mcm_appended_names").append(tag);
		}
	});
	/**
	 * ファイル追加リンク押下
	 */
	$('[name=lnk_upload_appended]').click(function(event){
		// fileタグ押下イベント発火
		$("[name=file_upload_appended]").trigger('click');
	});
	// ファイル追加リンク押下からの画像追加イベント
	$('[name=file_upload_appended]').change(function(){
		// ファイル情報を取得
		uploadAppendedFile(this.files);
		// fileタグのデータは初期化する
		$('[name=file_upload_appended]').val("");
		return false;
	});


	/**
	 * 履歴メールの内容表示時の処理
	 */
	$('.show-modal-mail-detail').click(function(event){
		// モーダルの初期化
		$("[name=confirme_sender_name]").empty();
		$("[name=confirme_sender_address]").empty();
		$("[name=confirme_view_destination_text]").empty();
		$("[name=confirme_mail_subject]").empty();
		$("[name=confirme_mail_body]").empty();
		$("[name=confirme_send_date]").empty();
		$("[name=confirme_appended_names]").empty();
		// データを取得するためのIDを取得
		var ids = $(this).attr("id");
		// 参加者かリードかでデータ取得先を変更する
		var url = "";
		if($(this).data("displayType") == "participant"){
			 url = "/webinar-participant/behavior-history-row";
		}else if($(this).data("displayType") == "lead"){
			url = "/webinar-lead/behavior-history-row";
		}
		if(url != ""){
			$.ajax({
				type: "POST",
				url: url,
				dataType: "json",
				data: {"ids" : ids}
			}).done(function(result) {
				if(result.status){
					// 記述が長くなるので、表示データをローカル変数へ代入
					var behaviorHistory = result.behaviorHistory;
					// 取得したデータをモーダルへ設定する
					$("[name=confirme_sender_name]").append(behaviorHistory.sender_name);
					$("[name=confirme_sender_address]").append('<div class="mcm_confirme_view_frame">'+behaviorHistory.sender_address+'</div>');
					$("[name=confirme_view_destination_text]").html(behaviorHistory.destination_address);
					$("[name=confirme_mail_subject]").append(behaviorHistory.mail_subject);
					$("[name=confirme_mail_body]").text(behaviorHistory.mail_body);
					// 日時を作成する
					var sendDate = "";
					if(behaviorHistory.send_mail_date){
						// 「yyyy-mm-dd hh:mi:ss」の形式なので、秒を削る
						var sendMailDates = behaviorHistory.send_mail_date.split(":");
						sendDate = sendMailDates[0] + ":" + sendMailDates[1];
					}else{
						sendDate = "今すぐ送信";
					}
					$("[name=confirme_send_date]").append(sendDate);
					// 添付ファイル名を作成する(3つカラムに分かれているので、冗長に記述する)
					if(behaviorHistory.attachment_file_name1){
						var tag = '<div class="mcm_confirme_view_frame">'+behaviorHistory.attachment_file_name1+'</div>';
						$("[name=confirme_appended_names]").append(tag);
					}
					if(behaviorHistory.attachment_file_name2){
						var tag = '<div class="mcm_confirme_view_frame">'+behaviorHistory.attachment_file_name1+'</div>';
						$("[name=confirme_appended_names]").append(tag);
					}
					if(behaviorHistory.attachment_file_name3){
						var tag = '<div class="mcm_confirme_view_frame">'+behaviorHistory.attachment_file_name1+'</div>';
						$("[name=confirme_appended_names]").append(tag);
					}
					// スクロールを戻す、モーダルを上段へスクロールする
					$('#modal-content-display-mail').find(".modal_content_mail_area").animate({scrollTop:0});
					// メール確認モーダル表示
					$("#modal-content-display-mail").fadeIn(500);
				}else{
					// エラーが存在する場合はエラーを表示する
					alert(result.message);
				}
			}).fail(function(data) {
				
			});
		}else{
			alert("不正な操作です。");
		}
	});

	/**
	 * 履歴メールの内容表示を非表示にする
	 */
	$('.close_modal_display_mail').click(function(event){
		// モーダルの初期化
		$("[name=confirme_sender_name]").empty();
		$("[name=confirme_sender_address]").empty();
		$("[name=confirme_view_destination_text]").empty();
		$("[name=confirme_mail_subject]").empty();
		$("[name=confirme_mail_body]").empty();
		$("[name=confirme_send_date]").empty();
		$("[name=confirme_appended_names]").empty();
		// メール確認モーダル非表示
		$("#modal-content-display-mail").fadeOut(500);
	});
});
