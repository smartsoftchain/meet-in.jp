/**
 * TOP画面で使用するスクリプト
 * @returns
 */
$(function(){
	// セッションストレージが使用できるか判定する
	// meet-inはセッションストレージ使用前提なので。
	if(('sessionStorage' in window) && (window.sessionStorage !== null)) {
		// データが送信されている場合は、画面にデータを設定する
		setParams();
	} else {
		var tag = "<div>現在のブラウザではmeet-inを使用できません。</div>";
		$(".error_area").append(tag);
	}

	// トライアル申請バリデーション
	$("#send_trial_form").click(function(e){
		// submitが走らないようにイベントを止める
		e.preventDefault();
		// エラーの表示を初期化する
		$(".error_area").empty();
		// サーバーにデータを送信しバリデーションを実行する
		$.ajax({
			type: "post",
			url: "/index/validate-trial",
			data: $("#trial_form").serialize(),
			success: function(resultJson) {
				var result = $.parseJSON(resultJson);
				if(result["status"] == 1){
					// 確認画面に渡すデータを取得
					var trialUserDataDict = {};
					trialUserDataDict["last_name"] = $("[name=last_name]").val();
					trialUserDataDict["farst_name"] = $("[name=farst_name]").val();
					trialUserDataDict["company"] = $("[name=company]").val();
					trialUserDataDict["tel_number_1"] = $("[name=tel_number_1]").val();
					trialUserDataDict["tel_number_2"] = $("[name=tel_number_2]").val();
					trialUserDataDict["tel_number_3"] = $("[name=tel_number_3]").val();
					trialUserDataDict["mail"] = $("[name=mail]").val();
					trialUserDataDict["domein"] = $("[name=domein]").val();
					trialUserDataDict["use"] = $("[name=use]").val();
					// データをセッションストレージに初期化且つ、セットする
					sessionStorage.removeItem('trialUserData');
					sessionStorage.setItem('trialUserData', JSON.stringify(trialUserDataDict));
					// バリデーション成功の場合は確認画面へ遷移する
					window.location.href = "/lp/form_trial_confirm.html";
				}else{
					// エラーの場合はエラーメッセージを表示する
					for (var i=0; i<result["error"].length; i++) {
						var tag = "<div>" + result["error"][i] + "</div>";
						$(".error_area").append(tag);
					}
					// エラーを見せる為に、画面の先頭へ遷移させる
					$('body, html').animate({ scrollTop: 0 }, 100, 'linear');
				}
			}
		});
	});

	/**
	 * データが送信された場合は画面にデータを設定する
	 */
	function setParams(){
		// セッションストレージからデータを取得する
		var trialUserDataDict = $.parseJSON(sessionStorage.getItem('trialUserData'));
		if(trialUserDataDict){
			// DICTのデータをループしつつセットする
			Object.keys(trialUserDataDict).forEach(function (key) {
				// データを設定する為のnameを作成
				var name = "[name="+key+"]";
				// 登録画面と確認画面で設定方法を変更する
				if(location.href.indexOf("confirm") > -1){
					// 確認画面の場合はテキスト表示
					$(name).text(trialUserDataDict[key]);
				}else{
					// 登録画面の場合はvalue設定
					$(name).val(trialUserDataDict[key]);
				}
			});
		}else{
			if(location.href.indexOf("confirm") > -1){
				// セッションストレージのデータがなく、確認画面に遷移した場合はトライアル情報入力画面に遷移する
				window.location.href = "/lp/form_trial.html";
			}
		}
	}

	// トライアル申請登録
	$("#regist_trial_form").click(function(e){
		// submitが走らないようにイベントを止める
		e.preventDefault();
		// サーバーにデータを送信しバリデーションを実行する
		$.ajax({
			type: "post",
			url: "/index/regist-trial",
			success: function(resultJson) {
				var result = $.parseJSON(resultJson);
				if(result["status"] == 1){
					// ストレージデータを削除する
					sessionStorage.removeItem('trialUserData');
					// 登録完了画面へ遷移する
					window.location.href = "/lp/form_trial_complete.html";
				}else{
					// エラー発生なので画面に表示する
					var tag = "<div>登録に失敗しました。</div>";
					$(".error_area").append(tag);
				}
			}
		});
	});

	// トライアル申請画面へ戻る
	$("#return_trial_form").click(function(e){
		// submitが走らないようにイベントを止める
		e.preventDefault();
		// 登録画面に渡すデータを取得
		var trialUserDataDict = {};
		trialUserDataDict["last_name"] = $("[name=last_name]").text();
		trialUserDataDict["farst_name"] = $("[name=farst_name]").text();
		trialUserDataDict["company"] = $("[name=company]").text();
		trialUserDataDict["tel_number_1"] = $("[name=tel_number_1]").text();
		trialUserDataDict["tel_number_2"] = $("[name=tel_number_2]").text();
		trialUserDataDict["tel_number_3"] = $("[name=tel_number_3]").text();
		trialUserDataDict["mail"] = $("[name=mail]").text();
		trialUserDataDict["domein"] = $("[name=domein]").text();
		trialUserDataDict["use"] = $("[name=use]").text();
		// 確認画面へ送信するデータをjson化する
		var trialUserData = encodeURI(JSON.stringify(trialUserDataDict));
		// バリデーション成功の場合は確認画面へ遷移する
		window.location.href = "/lp/form_trial.html?trialUserData=" + trialUserData;
	});


	// パスワード再発行
	$("#send_reset_password_form").click(function(){
		// 入力したメールアドレス
		var mail = $("[name=mail]").val();
		$.ajax({
			type: "post",
			url: "/index/reset-password",
			data: {mail : mail},
			success: function() {
				// エラーをユーザーに見せないように、必ず同じメッセージを表示する
				alert("入力したメールアドレスへ、再設定したパスワードを送信しました。");
			}
		});
	});
});



//モーダル
$(function(){
	$('.modal_open').on('click',function(){
		var modaltraget = "." + $(this).attr("id");
		$(modaltraget).fadeIn("first");
	});

	$('.mi_modal_shadow').on('click',function(){
		$(this).parent("div").fadeOut("first");
	});
});

//オーバーレイ
$(function(){
	$('.mi_overlay_memo_open').on('click',function(){
		$("#mi_overlay_memo").fadeIn("first");
	});

	$('.mi_overlay_privacy_open').on('click',function(){
		$("#mi_overlay_privacy").fadeIn("first");
	});

	$( 'form.contactform').submit(function(event){
		event.preventDefault();
		var nameVal = $(".contactform [name=name]").val();
		var companyVal = $(".contactform [name=company]").val();
		var telNumberVal = $(".contactform [name=tel_number]").val();
		var mailVal = $(".contactform [name=mail]").val();
		var domeinVal = $(".contactform [name=domein]").val();
		var contactVal = $(".contactform [name=contact]").val();
		var privacyVal = $(".contactform [name=privacy]").val();
		var useVal = $(".contactform [name=use]").val();

		$(".mi_confirm_name").text(nameVal);
		$(".mi_confirm_company").text(companyVal);
		$(".mi_confirm_tel_number").text(telNumberVal);
		$(".mi_confirm_mail").text(mailVal + "@" + domeinVal);
		$(".mi_confirm_contact").text(contactVal);
		$(".mi_confirm_use").text(useVal);

		$(".mi_confirm_name_input").val(nameVal);
		$(".mi_confirm_company_input").val(companyVal);
		$(".mi_confirm_tel_number_input").val(telNumberVal);
		$(".mi_confirm_mail_input").val(mailVal + "@" + domeinVal);
		$(".mi_confirm_contact_input").val(contactVal);
		$(".mi_confirm_use_input").val(useVal);

		$("#mi_overlay_confirm").fadeIn("first");
		return false;
	});

	$('.mi_overlay_colose_btn').on('click',function(){
		$(this).parents(".mi_overlay").fadeOut("first");
	});
});
