$(function (){

	// 台本のレイアウト初期化
	$('#script_section_wrap').masonry({
		gutter: 21
	});

	// QAのレイアウト初期化
	$('#qa_section_wrap').masonry({
		gutter: 21
	});

	// ドラッグ設定
	var settingDraggable = function() {

		// 台本をドラッグ
		$('.script').draggable({
			revert: true,
			revertDuration: 200,
			helper: function(e) {
				
				var parentScriptOrder = $(this).closest(".script_section").data("scriptOrder");
				var helper = $(this).clone();

				$(this).css("opacity", "0");

				// 親のスクリプトの並び順を取得
				helper.data("parentScriptOrder", parentScriptOrder);

				return helper;
			},
			stop : function(e, ui) {
				$(this).css("opacity", "1");
			},
			zIndex: 1
		});
	};

	// ドロップ設定
	var settingDroppable = function() {
		
		// アプローチ実行
		$('.script_section').droppable({
			accept: ".script",
			hoverClass: "script-hover",
			drop: function(e, ui) {

				var fromOrder = ui.helper.data("parentScriptOrder"); 
				var toOrder   = $(e.target).data("scriptOrder");

				// 移動先要素
				var $toMoveSection = $(".script_section[data-script-order='" + toOrder + "']");
				var $moveScript = $(".script", ".script_section[data-script-order='" + fromOrder + "']");

				if (fromOrder < toOrder) {

					// toOrder以下からfromToのひとつ前までの台本を一つずつfromToまで移動させる。
					moveSiblingScriptToForward(fromOrder, toOrder);

					// 最後に自分自身を移動させる。
					$toMoveSection.append($moveScript);

					// 並び順をサーバに保存
					var scriptOrderRelation = getScriptOrderRelation();
					saveScriotOrderRelation(scriptOrderRelation);

					$('#script_section_wrap').masonry({
						gutter: 21
					});
					
				} else if (toOrder < fromOrder) {

					// toOrder以上の台本をfromToまで移動させる。
					moveSiblingScriptToBackward(fromOrder, toOrder);

					// 最後に自分自身を移動させる。
					$toMoveSection.append($moveScript);

					// 並び順をサーバに保存
					var scriptOrderRelation = getScriptOrderRelation();
					saveScriotOrderRelation(scriptOrderRelation);

					$('#script_section_wrap').masonry({
						gutter: 21
					});
				}
			}
		});
	};

	// 台本の並び順情報をサーバに送る。
	function getScriptOrderRelation() {

		var scriptOrderRelation = [];

		$(".script_section").each(function() {

			// 台本の並び順
			var currentScriptOrder = $(this).data("scriptOrder");

			// 台本のID
			var currentScriptId = $(".script", this).data("scriptId");

			scriptOrderRelation.push({
				"order" : currentScriptOrder,
				"id"    : currentScriptId 
			});
		});

		return scriptOrderRelation;
	}

	// 並び順を保存する
	function saveScriotOrderRelation(scriptOrderRelation) {

		$.ajax({
			url: "save-script-order-relation",
			type: "POST",
			data: {
				"scriptOrderRelation" : scriptOrderRelation
			},
			dataType: 'json',
			success: function(result) {

				if (result !== "" && result["resultCode"] === TMO.CONST.AJAX.SUCCESS) {
					_U.log("SUCCESSED TO SAVE ORDER");
				}
			}
		});
	}

	// 台本を前詰めにする。
	function moveSiblingScriptToForward(from, to) {

		for(var i = (from + 1) ; i <= to ; i++) {

			// 移動先要素
			var $toMoveSection = $(".script_section[data-script-order='" + (i - 1) + "']");

			// 移動前に存在している台本
			var $moveScript   = $(".script", ".script_section[data-script-order='" + (i) + "']");
			$toMoveSection.append($moveScript);
		}
	}

	// 台本を後ろ詰めにする。
	function moveSiblingScriptToBackward(from, to) {

		for(var i = (from - 1) ; to <= i  ; i--) {

			// 移動先要素
			var $toMoveSection = $(".script_section[data-script-order='" + (i + 1) + "']");

			// 移動前に存在している台本
			var $moveScript   = $(".script", ".script_section[data-script-order='" + (i) + "']");
			$toMoveSection.append($moveScript);
		}
	}

	settingDraggable();
	settingDroppable();

	// アンカーリンク先へジャンプ
	$("a.anchor").on("click", function(e) {

		e.preventDefault();

        var speed = 400; // ミリ秒									// スクロールの速度
        var href= $(this).attr("href");								// アンカーの値取得
        var target = $(href == "#" || href == "" ? 'html' : href);	// 移動先を取得
        var position = target.offset().top;							// 移動先を数値で取得
        
        // スクロール
        $('body,html').animate({scrollTop:position}, speed, 'swing');

        return false;
	});

	// 回答先へジャンプ
	$("a.answer").on("click", function(e) {

		e.preventDefault();

        var speed = 400; // ミリ秒									// スクロールの速度
        var href= $(this).attr("href");								// アンカーの値取得
        var target = $(href == "#" || href == "" ? 'html' : href);	// 移動先を取得
        var position = target.offset().top;							// 移動先を数値で取得

		// 対象のスクリプト枠の色を変更
		$("section", ".script").removeClass("selectedScript");
		
		if (href !== "#") {
			$("section", target).addClass("selectedScript");
		}
        
        // スクロール
        $('body,html').animate({scrollTop:position}, speed, 'swing');

        return false;
	});

	// 入力欄でENTERを押すと検索がスタートする
	$("input[type='text'][name='free_word']").keypress(function(ev) {
		
		if ((ev.which && ev.which === 13) || (ev.keyCode && ev.keyCode === 13)) {
			$("#on_retrieval").trigger("click");
		}
	})

	// 検索ボタンの押下
	$("#on_retrieval").on("click", function() {
	
		// 最初に初期化を行う
		$("div.script-content").each(function (i) {
			$(this).html($(this).html().replace(/<b.*attention.>/, '').replace(/<\/b>/g, ''));
		});
		$(".qa-content").each(function (i) {
			$(this).html($(this).html().replace(/<b.*attention.>/, '').replace(/<\/b>/g, ''));
		});
	
		// 文字列を検索し、ヒットすれば赤文字に変更する
		var $value = $("[name=free_word]").val();
		if($value != ""){
			var reg = new RegExp($value);
			var reg = new RegExp(reg);
			var repStr = '<b class="attention">'+$value+'</b>';

			// 
			var minTop = false;

			// 台本の文字入替
			$("div.script-content").each(function () {
				if($(this).text().match(reg)){
					$(this).html($(this).html().replace(reg, repStr));

					// 現在の最少Y座標と比べてより値が小さいを方を返す。
					minTop = ((minTop === false) ? $(this).offset().top : Math.min(minTop, $(this).offset().top)); 
				}
			});

			// QAの文字入替
			$(".qa-content").each(function (i) {
				if($(this).text().match(reg)){
					$(this).html($(this).html().replace(reg, repStr));

					// 現在の最少Y座標と比べてより値が小さいを方を返す。
					minTop = ((minTop === false) ? $(this).offset().top : Math.min(minTop, $(this).offset().top));
				}
			});

			// 一番最初に見つかったところまでジャンプする
			if (minTop !== false) {
		        $('body,html').animate({scrollTop:(minTop - 20)}, 400, 'swing');
			}
		}
	});

	// プレビューを閉じる
	$("#close-preview-window").on("click", function() {
		window.close();
	});
});