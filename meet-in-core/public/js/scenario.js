$(function (){

	// 指定された遷移先INPUTから同じグループのINPUT全てのIDを抜き出す。
	function _ignoreTransitionIds($selectParent) {

		var $inputs = $selectParent.closest("table").find("td.input_answer_area input.new_transition");

		var ignoreIds = [];
		$.each($inputs, function() {
			ignoreIds.push($(this).attr("id"));
		});

		return ignoreIds;
	}

	// ページ内全ての「遷移先」INPUT情報を連想配列で返す。
	function _getTransitionScriptDict(_ignoreIds) {

		//var ignoreIds = _ignoreIds || [];
		var ignoreIds = [];		// TMO4では使用しない。
		var transitionSelect = [{"value" : "", "text"  : "選択してください"}];		// デフォルト値

		// ページ内の電話先の返答スクリプト情報を集約
		$("[id^=answer_script_div_]").each(function(){

			// 自分のシナリオの返答は自分の遷移元リストには含めない
			if ($(this).val() !== "" && ($.inArray($(this).attr("id"), ignoreIds) === -1 )) {
				transitionSelect.push({
					"value" : $(this).attr("id") + "_" + $(this).val(),
					"text"  : $(this).val()
				});
			}
		});

		return transitionSelect;
	}


	// 追加するボタンを押下した際の処理
	$("#add_script").click(function(evt) {

		evt.preventDefault();
		$("#script_submit").show();		// 登録ボタンを押下できるようにする
		// 次に生成する台本シナリオの連番を生成。SCRIPT_DIV_ID例：「script_div_0」
		var lastScriptDivId = $(".script_div").last().attr("id");
		var nextScriptDivCount = (+(lastScriptDivId.split("_"))[2]) + 1; 
		
		var scriptDivIdName = 'script_div_' + nextScriptDivCount;

		var script_template = Handlebars.compile($('#script-template').html());		// スクリプトのテンプレート

		// シナリオ名リストを作成するための遷移先リスト情報を取得する。
		var transitionScriptDict = _getTransitionScriptDict();

		$("#view_script_form").append(script_template({
			"scriptDivIdName"      : scriptDivIdName,
			"transitionScriptDict" : transitionScriptDict
		}));
	});

	// 台本の削除を行う
	$(document).on('click', '.remove_script', function(evt){
		evt.preventDefault();
		$(this).closest(".script_div").remove();

		_replaceScriptListBox();	// 台本リストボックスを再生成
	});

	// 親を選択した際に、既に他の親として紐付けられていないか判定する。 
	$(document).on('change', 'select.select_parent', function(){

		var self = this;
		var selectedReplyScript = $(this).val();
		var count = 0;

		if(selectedReplyScript !== ""){

			// 親として設定できるか判定する
			$("select.select_parent").each(function(){

				var otherSelect = $(this).val();

				if (selectedReplyScript === otherSelect) {
					count++;
					if(count === 2){

						// 自分自身を含め2件存在すれば、選択できない
						$(self).val("");
						alert("既に紐付けられた回答は設定できません。");

						return false;
					}
				}
			});
		}
	});
	
	// 台本に遷移する解答を押下した際の解答追加処理
	$(document).on('click', '.add_parent', function(e){
		
		e.preventDefault();
		
		var parent_select_row_template = Handlebars.compile($('#parent-select-row-template').html());		// 遷移元の回答のテンプレート
		
		// ページ内全て電話先返答スクリプト情報からSelect情報を取得。その際自分のスクリプト内の返答を遷移元には含めないようにする。
		var ignoreIds = _ignoreTransitionIds($(this));
		var transitionScriptDict = _getTransitionScriptDict(ignoreIds);

		var $parentPTag = $(this).closest("ul.parent_list_add_btn").next("div.parent_list");	// 親のタグを保存

		// 要素を追加する
		$parentPTag.append(parent_select_row_template({
			"transitionScriptDict" : transitionScriptDict
		}));
	});

 	// 「返答追加」ボタンイベント
	$(document).on('click', '.add_answer', function(evt) {
		evt.preventDefault();

		var answerScriptId      = "answer_" + $(this).closest(".script_div").attr("id");		// 画面上で一意になるIDを生成
		var answer_row_template = Handlebars.compile($('#answer-row-template').html());			// 返答行の回答のテンプレート

		$(this).closest("td.input_answer_area").append(answer_row_template({
			"answerScriptId" : answerScriptId
		}));
	});

	// 返答を削除する処理
	$(document).on('click', '.new_del_answer', function(evt) {
		evt.preventDefault();
		$(this).closest("ul").remove();

		_replaceScriptListBox();	// 台本リストボックスを再生成
	});
	
	// 回答元を削除する処理
	$(document).on('click', '.new_del_parent', function(evt) {
		evt.preventDefault();
		$(this).closest("ul").remove();
	});

 	// 遷移先を入力された場合に、変更されている場合は「シナリオ名」へ自動反映する
	var $newTransition = "";
	$(document).on('focusin', 'input.new_transition', function() {
		$newTransition = $(this).val();
	});

	// 画面の遷移先入力情報を集めて、シナリオリストボックスを再生成する。
	function _replaceScriptListBox() {

		var parentOnlySelectRowTemplate = Handlebars.compile($('#parent-only-select-row-template').html());		// 遷移元の回答のテンプレート

		// タグを入れ替える
		$("select.select_parent").each(function(){

			// ページ内全て電話先返答スクリプト情報からSelect情報を取得。その際自分のスクリプト内の返答を遷移元には含めないようにする。
			var ignoreIds = _ignoreTransitionIds($(this));
			var transitionScriptDict = _getTransitionScriptDict(ignoreIds);

			var current_val = $(this).val() || "";		// 現在のvalueを取得する
			var $parentPTag = $(this).closest("li");	// 親のタグを保存

			// 自分自身を空にし、要素を追加する
			$parentPTag.empty().append(parentOnlySelectRowTemplate({
				"transitionScriptDict" : transitionScriptDict
			}));
			
			// シナリオを消すことで回答がない場合があるためその対応。回答がない場合は空文字を選択させる。
			if (hasOptionValue(transitionScriptDict, current_val)) {
				$parentPTag.find("select").val(current_val);	// タグ入替前に選択されていた値を再設定する
			} else {
				$parentPTag.find("select").val("");
			}
		});
	}
	
	/**
	 * 選択肢の中にkeyが存在するかチェック
	 */
	function hasOptionValue(dict, targetKey) {
		
		var hasFlg = false;
		$.each(dict, function() {
			
			if (this.value === targetKey) {
				hasFlg = true;
				return false;
			}
		});
		
		return hasFlg;
	}

	// 遷移先が変更された場合の処理
	$(document).on('blur', 'input.new_transition', function() {
		
		if($newTransition != $(this).val()) {
			_replaceScriptListBox();	// 台本リストボックスを再生成
		}

		// $newTransitionの初期化
		$newTransition = "";
	});

	// エラー表示をクリアする
	function _clearErrorDisplay() {

		// エラーメッセージ領域が存在した場合、エラーデータを削除し非表示にする
		if($("#error_msg").css('display') == 'block') {
			$("#error_msg_area").empty();
			$("#error_msg").hide();
		}

		// エラー遷移でdiv背景が赤くなっている可能性があるので、全て白に変更
		$("[id^=script_div_]").each(function(){
			$(this).css("background-color", "#f1f7fa");
		});
	}

	// 入力台本データをJSON形式にまとめる
	function _getTalkScriptJson() {

		var talkScriptList = {};

		$("[id^=script_div_]").each(function() {

			var divIdName = $(this).attr("id");

			talkScriptList[divIdName] = {};

			// 電話先の返答を取得
			var answerList = [];
			$(this).find("input.new_transition").each(function(){
				var answerDict = {};
				answerDict["answer"]        = $(this).val();
				//answerDict["to_transition"] = $(this).closest("ul").find(".new_transition").val();
				answerDict["type"]          = $(this).closest("ul").find("select").val();
				answerList.push(answerDict);
			});

			// 台本へ遷移する解答を取得
			var parentList = [];
			$(this).find("select.select_parent").each(function(){
				parentList.push($(this).val());
			});

			talkScriptList[divIdName] = {
				"hierarchy"  : "1",									// 「階層」を設定
				"parentList" : parentList,
				"title"      : $(this).find("[name=title]").val(),	// 「タイトル」を設定
				"script"     : $(this).find("[name=script]").val(), // 「台本の内容」を設定
				"answerList" : answerList                           // 「電話先の返答」を設定
			};
		});

		return JSON.stringify(talkScriptList);
	}

	function _scriptRequest(request_url, _successCallback, _errorCallback) {

		_U.showLoading();
		
		var successCallback = _successCallback || function(){};
		var errorCallback   = _errorCallback || function(){};

		// エラーメッセージ領域が存在した場合、エラーデータを削除し非表示にする
		_clearErrorDisplay();

		var scriptName     = $("#script_name").val();	// 台本名を取得
		var description    = $("#description").val();	// 備考を取得
		var talkScriptJson = _getTalkScriptJson();		// 入力された台本データ情報をJSONにまとめる

		//console.table(JSON.parse(talkScriptJson));

		if(scriptName != ""){

			// 台本登録処理または台本プレビュー表示
 			$.ajax({
 				url: request_url,
 				type: "POST",
 				data: {
 					"scriptName"     : scriptName,
 					"description"    : description,
 					"talkScriptJson" : talkScriptJson
 				},
 				dataType: 'json',        // サーバーなどの環境によってこのオプションが必要なときがある
 				//async: false,			 // ポップアップブロック回避のため。
 				success: function(result) {

 					if (result !== "" && result["resultCode"] === TMO.CONST.AJAX.SUCCESS) {
 						
 						// 登録時（save）の場合はtalkBindIdを取得する
 						var talkBindId = result["talkBindId"] || "";
 						successCallback(talkBindId);
 					} else {
 						
 						var error = result.error;
 						var scriptErrorTemplate = Handlebars.compile($('#script-error-template').html());		// エラー用のテンプレート
 						
 						//console.log("error : ", error);
 						
 						$("#error_msg").empty().append(scriptErrorTemplate({
 							"errorInfo" : error
 						})).show();
 						
 						$('html,body').animate({ scrollTop: 0 }, 'fast');
 						
 						errorCallback();
 					}

 					_U.hideLoading();	// プログレスを非表示
 				},
 				error : function() {
 					errorCallback();
 					_U.hideLoading();	// プログレスを非表示
 				}
 			});

		} else {

			alert("台本名は必須です");
			errorCallback();
			_U.hideLoading();			// プログレスを非表示
		}
	}

	// 登録処理
	$("#script_submit").click(function(evt) {

		evt.preventDefault();
		var request_url = "save";
		var view_script_flg  = +($("#view-script-flg").val() || "0");
		
		

		// 台本登録処理
		_scriptRequest(request_url, function(talkBindId){
			
			alert("登録完了しました");
			
			if (view_script_flg === 1) {
			
				// 台本表示中の「登録/編集」画面の場合
				location.href = "/setting-script/view-script?is_complate=true&talk_bind_id=" + talkBindId;
				
			} else {
				
				// 通常の「登録/編集」画面の場合
				// 台本一覧に遷移する
				location.href = "/setting-script/list?is_complate=true";
			}
		});
	});

	// プレビュー処理
	$("#preview").click(function(evt) {

		evt.preventDefault();
		var request_url = "preview-save";
		
		// 別ウインドウ表示
		var preview = window.open('about:blank', '', 'width=1250,height=600,scrollbars=yes,resizable=yes');

		// 台本プレビュー表示処理
		_scriptRequest(request_url, function() {
			
			// Ajax処理後にwindow.openをするとブロッカーに引っかかるので処理後はURLを変える処理で対応
			preview.location.href = '/setting-script/preview';
			return false;
		}, function() {
			preview.close();
		});
	});

	// エラーの遷移を押下した場合に、エラー項目のバックグラウンドを赤くする
	$(document).on('click', '.error_link', function(){

		// 全ての[script_div_]の背景を白に変更
		$("[id^=script_div_]").each(function(){
			$(this).css("background-color", "#f1f7fa");
		});

		$idName = $(this).attr("href");

		// 次回使用する台本の背景を設定
		$($idName).css("background-color", "#df6b6e");
		$($idName).children("table").css("background-color", "#ffffff");
	});
});