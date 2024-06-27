/* Title:       Individual Call Management
   ─────────────────────────
   Version:     1.0
━━━━━━━━━━━━━━━━━━━━━━━━━━ */

$(function() {
	
	// スライドアップ・ダウンスピード
	var SLIDE_SPEED = 120;
	
	// ヘルプ可否
	$("ul#sv-select").on("click", "li",function() {
		if($(this).attr("class")=="able"){
			$("ul#sv-select li.selected").removeClass("selected");
			$(this).addClass("selected");
		}
	});

	// トグルボタン
	$("a#cut-hold").click(function(){
		if($(this).attr("class")=="cut"){
			$(this).removeClass("cut").addClass("hold");
		} else {
			$(this).removeClass("hold").addClass("cut");
		}
	});

	// トグルボタン
	$("a#hlp-call").click(function(){
		if($(this).attr("class")=="on"){
			$(this).removeClass("on").addClass("off");
		} else {
			$(this).removeClass("off").addClass("on");
		}
	});
	
	// 結果登録
	$("#approachList a.registResult").on('click', function(e) {
		e.stopPropagation();
		var $p = $('p', this); 
		var $span = $('span', $p);
		var $tr = $(this).closest('tr');
		var $nextTr = $tr.next();
		var $registResultArea = $('div.registResultArea', $nextTr);
		
		if ($p.hasClass('current')) {
			// ボタン表示切り替え
			$p.removeClass('current');
			$span.removeClass('uparw');
			$span.addClass('dwnarw');
			// スライドアップ
			$registResultArea.slideUp(SLIDE_SPEED);
			setTimeout(function() { $nextTr.hide(); }, SLIDE_SPEED);
		} else {
			// ボタン表示切り替え
			$p.addClass('current');
			$span.removeClass('dwnarw');
			$span.addClass('uparw');
			// スライドダウン
			$registResultArea.slideDown(SLIDE_SPEED);
			$nextTr.slideDown(SLIDE_SPEED);
		}
	});
	
	// 履歴
	$(document).on('click', '#approachList a.history', function(e) {
		var $p = $('p', this); 
		var $span = $('span', $p);
		var $tr = $(this).closest('tr');
		var $nextTr = null;
		if($(this).data("approachtype") == "telephone"){
			$nextTr = $tr.next().next();
		}else if($(this).data("approachtype") == "maildm"){
			$nextTr = $tr.next();
		}
		
		var $historyArea = $('div.historyArea', $nextTr);
		
		if ($p.hasClass('current')) {
			// ボタン表示切り替え
			$p.removeClass('current');
			$span.removeClass('uparw');
			$span.addClass('dwnarw');
			// スライドアップ
			$historyArea.slideUp(SLIDE_SPEED);
			setTimeout(function() { $nextTr.hide(); }, SLIDE_SPEED);
		} else {
			// ボタン表示切り替え
			$p.addClass('current');
			$span.removeClass('dwnarw');
			$span.addClass('uparw');
			// スライドダウン
			$historyArea.slideDown(SLIDE_SPEED, _cb());
			$nextTr.slideDown(SLIDE_SPEED);
		}
	});
	
	function _cb() {
	    try {
	        $("#row").css("display", "table-row");
	    }
	    catch(e) {}
	}

});
