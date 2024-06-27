/*
 * ウェビナー参加申請関連で使用するJS
 */
$(function () {

	/**
	 * お問い合わせモーダル表示時のイベント
	 */
	$('#contactFormModal').on('show.bs.modal', function (e) {
		// 入力項目を初期化する
		$("[name=webinar_inquiry_name]").val("");
		$("[name=webinar_inquiry_company_name]").val("");
		$("[name=webinar_inquiry_tel]").val("");
		$("[name=webinar_inquiry_email]").val("");
		$("[name=webinar_inquiry_content]").val("");
	});
	/**
	 * お問い合わせモーダルの送信ボタンを押下した際のイベント
	 */
	$('#btn_send_webinar_inquiry').click(function(event){
		// ボタンを押せないようにする
		$('#btn_send_webinar_inquiry').prop("disabled", true);
		// エラー領域の初期化
		$(".error_webinar_inquiry_area").empty();
		// 入力データ取得
		var webinarInquiryName = $("[name=webinar_inquiry_name]").val();
		var webinarInquiryCompanyName = $("[name=webinar_inquiry_company_name]").val();
		var webinarInquiryTel = $("[name=webinar_inquiry_tel]").val();
		var webinarInquiryEmail = $("[name=webinar_inquiry_email]").val();
		var webinarInquiryContent = $("[name=webinar_inquiry_content]").val();
		var urlParam = $("[name=url_param]").val();
		$.ajax({
			type: "POST",
			url: "/api/send-webinar-inquiry",
			dataType: "json",
			data: {
				"webinarInquiryName" : webinarInquiryName, 
				"webinarInquiryCompanyName" : webinarInquiryCompanyName, 
				"webinarInquiryTel" : webinarInquiryTel, 
				"webinarInquiryEmail" : webinarInquiryEmail, 
				"webinarInquiryContent" : webinarInquiryContent, 
				"urlParam" : urlParam 
			}
		}).done(function(result) {
			// jsonをオブジェクトに変換
			if(result.length > 0){
				// エラーが存在する場合は、エラー内容を表示する。
				var errorTag = "";
				for(var i=0;i<result.length;i++){
					errorTag += result[i] + "<br>";
				}
				errorTag = "<strong style='color: red;'>" + errorTag + "</strong>";
				$(".error_webinar_inquiry_area").append(errorTag);
			}else{
				// 入力モーダルを閉じる
				$("#contactFormModal").modal('hide');
				// 完了モーダルを表示する
				$("#contactCompleteModal").modal('show');
			}
			// ボタンを押せるようにする
			$('#btn_send_webinar_inquiry').prop("disabled", false);
		}).fail(function(data) {
			// エラーを表示する
			var errorTag = "<strong style='color: red;'>想定外のエラーが発生しました。</strong>";
			$(".error_webinar_inquiry_area").append(errorTag);
			// ボタンを押せるようにする
			$('#btn_send_webinar_inquiry').prop("disabled", false);
		});
	});

	/**
	 * 予約するボタン押下時のイベント
	 * 予約入力フォーム画面へ遷移する
	 */
	$('[name=btn_move_participant_form]').click(function(event){
		// ウェビナーのキー情報を取得
		var urlParam = $("[name=url_param]").val();
		window.location.href = "/api/webinar-participant-form/"+urlParam;
	});

	// ウェビナー参加申請画面の予約確定ボタン押下後のイベント
	$('#btn_webinar_reservation').click(function(event){
		// ボタンを押せないようにする
		$('#btn_webinar_reservation').prop("disabled", true);
		// エラー領域を初期化する
		$(".error_msg_area").empty();
		// 入力データ取得
		var nameVal = $("[name=name]").val();
		var kanaVal = $("[name=kana]").val();
		var companyNameVal = $("[name=company_name]").val();
		var companyDepartmentVal = $("[name=company_department]").val();
		var companyPositionVal = $("[name=company_position]").val();
		var telNumberVal = $("[name=tel_number]").val();
		var mailAddressVal = $("[name=mail_address]").val();
		var postcode1Val = $("[name=postcode1]").val();
		var postcode2Val = $("[name=postcode2]").val();
		var streetAddressVal = $("[name=street_address]").val();
		var urlParamVal = $("[name=url_param]").val();
		$.ajax({
			type: "POST",
			url: "/api/webinar-participant-form",
			dataType: "json",
			data: {
				"name" : nameVal, 
				"kana" : kanaVal, 
				"company_name" : companyNameVal, 
				"company_department" : companyDepartmentVal, 
				"company_position" : companyPositionVal, 
				"tel_number" : telNumberVal, 
				"mail_address" : mailAddressVal, 
				"postcode1" : postcode1Val, 
				"postcode2" : postcode2Val, 
				"street_address" : streetAddressVal, 
				"url_param" : urlParamVal,
			}
		}).done(function(result) {
			// jsonをオブジェクトに変換
			if(result.length > 0){
				// エラーが存在する場合は、エラー内容を表示する。
				var errorTag = "";
				for(var i=0;i<result.length;i++){
					errorTag += result[i] + "<br>";
				}
				errorTag = "<strong style='color: red;'>" + errorTag + "</strong>";
				$(".error_msg_area").append(errorTag);
			}else{
				// 完了画面へ遷移する
				location.href = "/api/webinar-participant-complete/"+urlParamVal;
			}
			// ボタンを押せるようにする
			$('#btn_webinar_reservation').prop("disabled", false);
		}).fail(function(data) {
			// 想定外のエラー
			var errorTag = "<strong style='color: red;'>想定外のエラーが発生しました。再度ご登録ください。</strong>";
			$(".error_msg_area").append(errorTag);
			// ボタンを押せるようにする
			$('#btn_webinar_reservation').prop("disabled", false);
		});
	});

	/**
	 * ウェビナー参加者の削除ボタン押下時のイベント
	 */
	$('[name=lnk_delete_participant]').click(function(){
		// ウェビナーIDを取得する
		var webinarId = $("[name=webinarId]").val();
		// 削除対象のIDを取得する
		var participantIds = [];
		$("[name=chk_participant_id]:checked").each(function() {
			participantIds.push($(this).val());
		});
		if(participantIds.length > 0){
			if(confirm("選択した参加者を削除します。")){
				// メール作成に必要な情報を取得する
				$.ajax({
					type: "POST",
					url: "/webinar-participant/delete-participant",
					dataType: "json",
					data: {
						"webinarId" : webinarId, "participantIds" : participantIds
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
	 * 予約キャンセルボタン押下時のイベント
	 */
	$('[name=btn_cancel_reservation]').click(function(){
		// エラー領域を初期化する
		$(".error_cancel_reservation").hide();
		// 送信データを取得する
		var announceKey = $("[name=announce_key]").val();
		var mailAddress = $("[name=mail_address]").val();
		var reservationNumber = $("[name=reservation_number]").val();
		// メール作成に必要な情報を取得する
		$.ajax({
			type: "POST",
			url: "/api/webi-cxl",
			dataType: "json",
			data: {
				"announceKey" : announceKey, "mailAddress" : mailAddress, "reservationNumber" : reservationNumber
			}
		}).done(function(result) {
			if(result.status == 1){
				// キャンセル完了の場合は完了画面へ遷移させる
				window.location.href = "/api/webinar-participant-cancel-complete/"+announceKey;
			}else{
				// エラーメッセージを表示する
				$(".error_cancel_reservation").show();
			}
		}).fail(function(data) {
			// エラーメッセージを表示する
			alert("想定外のエラーが発生しました。");
		});
	});
	
});
