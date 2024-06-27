/*
 * ウェビナー関連で使用するJS
 */
$(function () {
	// 共通エラーメッセージ
	const AJAX_ERROR = "エラーが発生しました。もう一度実行してください。";
	// カレンダー表示項目の設定
	$(
		"[name=holding_date], [name=from_reservation_date], [name=to_reservation_date]"
	).datepicker({
		dateFormat: "yy/mm/dd",
	});
	// 画面表示時に時間のセレクトボックスの位置を反映する
	$("[name=holding_mm]").val($("[name=current_holding_mm]").val());
	$("[name=holding_mi]").val($("[name=current_holding_mi]").val());
	$("[name=from_reservation_mm]").val(
		$("[name=current_from_reservation_mm]").val()
	);
	$("[name=from_reservation_mi]").val(
		$("[name=current_from_reservation_mi]").val()
	);
	$("[name=to_reservation_mm]").val(
		$("[name=current_to_reservation_mm]").val()
	);
	$("[name=to_reservation_mi]").val(
		$("[name=current_to_reservation_mi]").val()
	);

	/* 登録ボタン押下時のイベント */
	$("[name=submit_button]").click(function () {
		$(this).prop("disabled", true);
		$(this).text("登録中です...");
		$(this).closest("form").submit();
	});

	// ウェビナー画像が変更された場合のイベント
	$("#webinarImg").change(function () {
		// ファイル情報を取得
		displayWebinarImg("#img_display_webinar", this.files[0]);
		return false;
	});
	// ロゴ画像（予約）が変更された場合のイベント
	$("#logoReservationImg").change(function () {
		// ファイル情報を取得
		displayWebinarImg("#img_display_logo_reservation", this.files[0]);
		return false;
	});
	// ロゴ画像（webinar）が変更された場合のイベント
	$("#logoWebinarImg").change(function () {
		// ファイル情報を取得
		displayWebinarImg("#img_display_logo_webinar", this.files[0]);
		return false;
	});
	/**
	 * 選択された画像を画面に表示する処理
	 * @param {string} imgId 	// 画像を表示するイメージタグのID
	 * @param {object} file 	// 選択された画像オブジェクト
	 */
	function displayWebinarImg(imgId, file) {
		var uploadFileName = file.name;
		if (uploadFileName.toLowerCase().match(/.+\.(jpe?g|png)$/)) {
			if (file.size / 1048576 <= 1) {
				// ファイルの内容はFileReaderで読み込む
				var fileReader = new FileReader();
				fileReader.onloadend = function (event) {
					// HTMLに書き出し (src属性にデータURIを指定)
					$(imgId).attr("src", event.target.result);
				};
				// ファイルをデータURIとして読み込む
				fileReader.readAsDataURL(file);
			} else {
				alert("アップロードできるのは1Mまでです。");
			}
		} else {
			alert("アップロード出来るのはJPEGまたはPNGファイルのみです。");
		}
	}
	/* ウェビナー画像削除ボタン押下 */
	$(
		"#deleteWebinarImg, #deleteRogoReservationImg, #deleteLogoWebinarImg"
	).click(function () {
		// 削除ボタンを押下した要素のID取得
		var clickDelId = $(this).attr("id");
		// 削除ボタンを押下された要素に一致するIDのDictを作成
		var imgDict = [];
		imgDict["deleteWebinarImg"] = {
			imgTagId: "#img_display_webinar",
			fileTagId: "#webinarImg",
			delFlgName: "[name=delete_img_flg]",
		};
		imgDict["deleteRogoReservationImg"] = {
			imgTagId: "#img_display_logo_reservation",
			fileTagId: "#logoReservationImg",
			delFlgName: "[name=delete_img_logo_reservation_flg]",
		};
		imgDict["deleteLogoWebinarImg"] = {
			imgTagId: "#img_display_logo_webinar",
			fileTagId: "#logoWebinarImg",
			delFlgName: "[name=delete_img_logo_webinar_flg]",
		};
		if (confirm("画像を削除します。")) {
			// 表示画像を初期化
			$(imgDict[clickDelId]["imgTagId"]).attr("src", "/img/no-image.png");
			// fileタグの初期化
			$(imgDict[clickDelId]["fileTagId"]).val("");
			// 削除フラグを立てる
			$(imgDict[clickDelId]["delFlgName"]).val("1");
		}
	});
	/**
	 * ウェビナールーム入室リンク押下時のイベント
	 */
	$("[name=link_enter_room]").click(function () {
		if (confirm("ウェビナールームに入室します。")) {
			// ウェビナールームのURLを取得する
			var roomUrl = $(this).closest("span").find("[name=room_url]").val();
			// ウェビナールームへ遷移する
			window.location.href = roomUrl;
		}
	});

	/**
	 * ウェビナー一覧の削除ボタン押下時のイベント
	 */
	$("[name=lnk_delete_webinar]").click(function () {
		// 削除対象のIDを取得する
		var webinarIds = [];
		// 複数メール送信用ID取得
		$("[name=chk_webinar_id]:checked").each(function () {
			// キャンセル済み若しくは、参加者が０人のウェビナーのみ削除できる
			webinarIds.push($(this).val());
		});
		if (webinarIds.length > 0) {
			if (confirm("選択したウェビナーを削除します。")) {
				// メール作成に必要な情報を取得する
				$.ajax({
					type: "POST",
					url: "/webinar/delete-webinar",
					dataType: "json",
					data: {
						webinarIds: webinarIds,
					},
				})
					.done(function (result) {
						if (result.status == 1) {
							alert("削除が完了しました。");
							// 一覧で最新情報を表示するために再読み込みする
							location.reload();
						} else {
							// エラーメッセージを表示する
							var errorMessage = "";
							for (let i = 0; i < result.errors.length; i++) {
								errorMessage += result.errors[i] + "\n";
							}
							alert(errorMessage);
						}
					})
					.fail(function (data) {});
			}
		} else {
			alert("一覧表でウェビナーを選択してください。");
		}
	});

	/**
	 * ウェビナー一覧のキャンセルボタン押下時のイベント
	 */
	$("[name=lnk_cancel_webinar]").click(function () {
		// キャンセル対象のIDを取得する
		var webinarIds = [];
		// 複数メール送信用ID取得
		$("[name=chk_webinar_id]:checked").each(function () {
			webinarIds.push($(this).val());
		});
		if (webinarIds.length > 0) {
			if (confirm("選択したウェビナーをキャンセルします。")) {
				// メール作成に必要な情報を取得する
				$.ajax({
					type: "POST",
					url: "/webinar/cancel-webinar",
					dataType: "json",
					data: {
						webinarIds: webinarIds,
					},
				})
					.done(function (result) {
						if (result.status == 1) {
							alert("キャンセルが完了しました。");
							// 一覧で最新情報を表示するために再読み込みする
							location.reload();
						} else {
							// エラーメッセージを表示する
							var errorMessage = "";
							for (let i = 0; i < result.errors.length; i++) {
								errorMessage += result.errors[i] + "\n";
							}
							alert(errorMessage);
						}
					})
					.fail(function (data) {});
			}
		} else {
			alert("一覧表でウェビナーを選択してください。");
		}
	});

	/**
	 * URLをコピーのイベント
	 */
	var copyUrl = ""; // コピーするURL文字列
	$(".icon_copy_url").click(function (event) {
		// コピーするURL作成
		copyUrl = $(this).data("url");
		msgCopyUrl = "#msg_url_" + $(this).attr("name");
		// ブラウザのコピー処理を実行する
		navigator.clipboard.writeText(copyUrl)
		.then(function() {
			if (copyUrl != "") {
				// コピーメッセージの表示
				$(".msg_copy_url").show();
				setTimeout(function () {
					$(".msg_copy_url").fadeOut("slow");
				}, 2000);
				// コピーしたURLの初期化
				copyUrl = "";
			}
		}, function() {
			console.log(error);
		});
	});

	// カラーピッカーの色を反映する
	onColorSelector();
	function onColorSelector() {
		$(".colorSelector").each(function () {
			// クロージャを使用し、引数として$(this)を使用する。
			(function ($elem) {
				$elem.ColorPicker({
					color: "#ffffff",
					onShow: function (colorpicker) {
						$(colorpicker).fadeIn(500);
						return false;
					},
					onHide: function (colorpicker) {
						$(colorpicker).fadeOut(500);
						return false;
					},
					onChange: function (hsb, hex, rgb, el) {
						$elem.val("#" + hex).css("backgroundColor", "#" + hex);
					},
				});
			})($(this));
		});
	}

	// アンケート新規登録画面 回答欄を追加する処理
	var count = 3;
	$(document).on("click", "#add_answer_text_form", function () {
		var count = $(this)
			.parents(".new_quiestionnaire_middle_content")
			.data("quiestionnaire-block-no");
		var append_el = $("#answer_input_area_" + count);
		if (count < 10) {
			$(append_el).append(
				`<input type="text" name="quiestionnaire_answer${count}[]" placeholder=""class="new_quiestionnaire_title">`
			);
			$(append_el).animate({ scrollTop: append_el[0].scrollHeight }, "fast");
		} else {
			alert("追加できる回答数は10個までです");
		}
	});

	//アンケート新規登録画面 質問形式の変更処理

	//3択以上選択時
	$(document).on("click", "#first_checkbox", function () {
		var input_elem = $(this).parent().parent().parent().parent();
		var elem_num = $(this)
			.parents(".new_quiestionnaire_middle_content")
			.data("quiestionnaire-block-no");
		var check_box = input_elem.children().find(".input_check_box");
		check_box.prop("checked", false);
		$(this).prop("checked", true);
		var change_area = input_elem
			.children()
			.find(".new_quiestionnaire_answer_right_area");
		change_area[0].innerHTML =
			'<div class="answer_input_area" id="answer_input_area">' +
			`<input type="text" name="quiestionnaire_answer${elem_num}[]" value="" placeholder="" class="new_quiestionnaire_title">` +
			`<input type="text" name="quiestionnaire_answer${elem_num}[]" value="" placeholder="" class="new_quiestionnaire_title">` +
			`<input type="text" name="quiestionnaire_answer${elem_num}[]" value="" placeholder="" class="new_quiestionnaire_title">` +
			"</div>" +
			'<div class="add_answer_form_button_area">' +
			'<button type="button" class="add_answer_form_button" id="add_answer_text_form">追加</button>' +
			"</div>";
		$(change_area[0]).css({
			height: "100%",
			display: "block",
		});
	});

	//2択選択時
	$(document).on("click", "#second_checkbox", function () {
		var input_elem = $(this).parent().parent().parent().parent();
		var elem_num = $(this)
			.parents(".new_quiestionnaire_middle_content")
			.data("quiestionnaire-block-no");
		var check_box = input_elem.children().find(".input_check_box");
		check_box.prop("checked", false);
		$(this).prop("checked", true);
		var change_area = input_elem
			.children()
			.find(".new_quiestionnaire_answer_right_area");
		change_area[0].innerHTML =
			'<div class="input_box">' +
			`<input type="checkbox" name="two_choices_answer${elem_num}" class="yesno_check_box" value=0 id="yes_checkbox">` +
			"<span>はい</span>" +
			"</div>" +
			'<div class="input_box">' +
			`<input type="checkbox" name="two_choices_answer${elem_num}" class="yesno_check_box" value=1 id="no_checkbox">` +
			"<span>いいえ</span>" +
			"</div>";
		$(change_area[0]).css({
			height: "60px",
			display: "flex",
		});
		$(".new_quiestionnaire_answer_left_area").css("width", "223px");
	});

	//記述式選択時
	$(document).on("click", "#third_checkbox", function () {
		var input_elem = $(this).parent().parent().parent().parent();
		var elem_num = $(this)
			.parents(".new_quiestionnaire_middle_content")
			.data("quiestionnaire-block-no");
		var check_box = input_elem.children().find(".input_check_box");
		check_box.prop("checked", false);
		$(this).prop("checked", true);
		var change_area = input_elem
			.children()
			.find(".new_quiestionnaire_answer_right_area");
		change_area[0].innerHTML =
			'<div class="input_box">' +
			`<input type="checkbox"	name="quiestionnaire_form_select${elem_num}" value=1 class="selectform_check_box" id="singleform_checkbox" checked='checked'>` +
			"<span>単数行フォーム</span>" +
			"</div>" +
			'<div class="input_box">' +
			`<input type="checkbox" name="quiestionnaire_form_select${elem_num}" value=2	class="selectform_check_box" id="multiform_checkbox">` +
			"<span>複数行フォーム</span>" +
			"</div>";
		$(change_area[0]).css({
			height: "60px",
			display: "flex",
		});
		$(".new_quiestionnaire_answer_left_area").css("width", "223px");
	});

	//アンケート新規登録画面 質問形式 単数行or複数行 回答の変更処理

	//単数行選択時
	$(document).on("click", "#singleform_checkbox", function () {
		var input_elem = $(this).parent().parent().parent().parent();
		var check_box = input_elem.children().find(".selectform_check_box");
		check_box.prop("checked", false);
		$(this).prop("checked", true);
	});

	//複数行選択時
	$(document).on("click", "#multiform_checkbox", function () {
		var input_elem = $(this).parent().parent().parent().parent();
		var check_box = input_elem.children().find(".selectform_check_box");
		check_box.prop("checked", false);
		$(this).prop("checked", true);
	});

	//アンケート新規登録画面 質問形式 はいorいいね 回答の変更処理

	//はいを選択した場合の処理
	$(document).on("click", "#yes_checkbox", function () {
		var input_elem = $(this).parent().parent().parent().parent();
		var check_box = input_elem.children().find(".yesno_check_box");
		check_box.prop("checked", false);
		$(this).prop("checked", true);
	});

	//いいえを選択した梅の処理
	$(document).on("click", "#no_checkbox", function () {
		var input_elem = $(this).parent().parent().parent().parent();
		var check_box = input_elem.children().find(".yesno_check_box");
		check_box.prop("checked", false);
		$(this).prop("checked", true);
	});

	//新たなアンケートを追加する処理
	$("#add_quiestionnaire_button").click(function () {
		var count = $(this).data("quiest-block");
		if (count < 5) {
			var next_cont = count + 1;
			var q_b_el = $("#new_quiestionnaire_middle_content_" + count).clone();
			q_b_el
				.attr("id", "new_quiestionnaire_middle_content_" + next_cont)
				.attr("data-quiestionnaire-block-no", next_cont);
			q_b_el.val("");
			q_b_el
				.find(".new_quiestionnaire_middle_content_name_area")
				.text("アンケート" + next_cont);
			q_b_el
				.find(".new_quiestionnaire_middle_content")
				.attr("id", "new_quiestionnaire_middle_content_" + next_cont);
			q_b_el
				.find("#quiestionnaire_name")
				.attr("name", "quiestionnaire_name" + next_cont)
				.val("");
			q_b_el
				.find(".input_check_box")
				.attr("name", "quiestionnaire_input_type" + next_cont);
			q_b_el
				.find(".new_quiestionnaire_content_input")
				.attr("name", "quiestionnaire_content" + next_cont)
				.val("");
			q_b_el.find(".answer_input_area").empty();
			q_b_el
				.find(".answer_input_area")
				.append(
					`<input type="text" name="quiestionnaire_answer${next_cont}[]" value="" placeholder="" class="new_quiestionnaire_title">` +
						`<input type="text" name="quiestionnaire_answer${next_cont}[]" value="" placeholder="" class="new_quiestionnaire_title">` +
						`<input type="text" name="quiestionnaire_answer${next_cont}[]" value="" placeholder="" class="new_quiestionnaire_title">`
				);

			q_b_el
				.find(".answer_input_area")
				.attr("id", "answer_input_area_" + next_cont);
			q_b_el
				.find(".yesno_check_box")
				.attr("name", "two_choices_answer" + next_cont);
			q_b_el
				.find(".selectform_check_box")
				.attr("name", "quiestionnaire_form_select" + next_cont);
			$(".new_quiestionnaire_middle_content__wrap").append(q_b_el);
			$(this).data("quiest-block", next_cont);
		} else {
			alert("一度に登録できるアンケート数は5つまでです");
		}
	});

	// アンケートの回答種別[1:複数選択, 2:2択, 3:記述]
	const ANSWER_TYPE_MULTIPLE_SELECT = 1;
	const ANSWER_TYPE_TWO_SELECT = 2;
	const ANSWER_TYPE_INPUT = 3;
	/**
	 * アンケート結果モーダル表示
	 */
	$(".show-modal-content-questionnaire-aggregate").click(function (event) {
		// アンケート結果取得に必要な情報を取得
		var webinarId = $("[name=webinarId]").val();
		var historyId = $(this).data("historyId");
		$.ajax({
			type: "POST",
			url: "/webinar/questionnaire-aggregate",
			dataType: "json",
			data: {
				webinarId: webinarId,
				historyId: historyId,
			},
		})
			.done(function (result) {
				if (result.status == 1) {
					// モーダルの内容初期化
					$(".mcqac_questionnaire_title").empty();
					$(".mcqac_answer_rate").empty();
					$(".mcqac_answer_count").empty();
					$(".mcqac_answer_max_count").empty();
					$(".mcqac_answer_contents").empty();
					// モーダルの内容を設定
					$(".mcqac_questionnaire_title").text(result.questionnaire.title);
					// 回答率を設定
					var answerRate =
						(result.questionnaireAggregateList.length /
							parseInt(result.questionnaire.participant_count)) *
						100;
					$(".mcqac_answer_rate").text(answerRate);
					$(".mcqac_answer_count").text(
						result.questionnaireAggregateList.length
					);
					$(".mcqac_answer_max_count").text(
						result.questionnaire.participant_count
					);
					// 回答内容を表示
					var questionnaireAggregateList = result.questionnaireAggregateList;
					if (
						result.questionnaire["answer_type"] ==
							ANSWER_TYPE_MULTIPLE_SELECT ||
						result.questionnaire["answer_type"] == ANSWER_TYPE_TWO_SELECT
					) {
						// 複数選択若しくは、2択の場合の内容表示
						for (let i = 0; i < questionnaireAggregateList.length; i++) {
							// 回答要素をコピー
							var questionnaireTag = $(
								"#questionnaire_aggregate_radio_area"
							).clone();
							// 回答値を設定
							questionnaireTag
								.find(".questionnaire_aggregate_number")
								.text(questionnaireAggregateList[i]["count"] + "票");
							// 回答名を設定
							questionnaireTag
								.find(".questionnaire_aggregate_text")
								.text(questionnaireAggregateList[i]["answer"]);
							// 非表示クラスを削除
							questionnaireTag.removeClass("display_hide");
							// 回答要素を追加
							$("#modal-content-questionnaire-aggregate")
								.find(".mcqac_answer_contents")
								.append(questionnaireTag);
						}
					} else {
						// 記述方式の内容表示
						for (let i = 0; i < questionnaireAggregateList.length; i++) {
							// 回答要素をコピー
							var questionnaireTag = $(
								"#questionnaire_aggregate_text_area"
							).clone();
							// 回答を設定
							questionnaireTag
								.find(".questionnaire_aggregate_text")
								.text(questionnaireAggregateList[i]["answer"]);
							// 非表示クラスを削除
							questionnaireTag.removeClass("display_hide");
							// 回答要素を追加
							$("#modal-content-questionnaire-aggregate")
								.find(".mcqac_answer_contents")
								.append(questionnaireTag);
						}
					}
					// モーダルを表示する
					$("#modal-content-questionnaire-aggregate").show();
				} else {
					// エラーメッセージを表示する
					alert(result.message);
				}
			})
			.fail(function (data) {
				// エラーメッセージを表示する
				alert(AJAX_ERROR);
			});
	});	

	/**
	 * アンケート集計モーダルを閉じる
	 */
	$("[name=btn_close_questionnaire_aggregate]").click(function (event) {
		// モーダルを閉じる
		$("#modal-content-questionnaire-aggregate").hide();
		// モダール内のデータを初期化する
		$(".mcqac_questionnaire_title").empty();
		$(".mcqac_answer_rate").empty();
		$(".mcqac_answer_count").empty();
		$(".mcqac_answer_max_count").empty();
		$(".mcqac_answer_contents").empty();
	});


	/**
	 * オープンセミナーテンプレート一覧の削除ボタン押下時のイベント
	 */
	$("[name=lnk_delete_os_template]").click(function () {
		// 削除対象のIDを取得する
		var osTemplateIds = [];
		// 複数メール送信用ID取得
		$("[name=chk_os_template_id]:checked").each(function () {
			osTemplateIds.push($(this).val());
		});
		if (osTemplateIds.length > 0) {
			if (confirm("選択したテンプレートを削除します。")) {
				// メール作成に必要な情報を取得する
				$.ajax({
					type: "POST",
					url: "/open-seminar/template-delete",
					dataType: "json",
					data: {
						osTemplateIds: osTemplateIds,
					},
				}).done(function (result) {
					if (result.status == 1) {
						alert("削除が完了しました。");
						// 一覧で最新情報を表示するために再読み込みする
						location.reload();
					} else {
						// エラーメッセージを表示する
						var errorMessage = "";
						for (let i = 0; i < result.errors.length; i++) {
							errorMessage += result.errors[i] + "\n";
						}
						alert(errorMessage);
					}
				}).fail(function (data) {});
			}
		} else {
			alert("一覧表でテンプレートを選択してください。");
		}
	});
});
