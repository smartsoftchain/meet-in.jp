/* Title:       Approach Edit Management
   ─────────────────────────
   Version:     1.0
━━━━━━━━━━━━━━━━━━━━━━━━━━ */

$(function() {
	
	// 質問最小数
	var MIN_QUESTION = 1;
	// 質問最大数
	var MAX_QUESTION = 10;
	
	// 呼出部署追加
	$(document).on('click', '#addDepartment', function(e) {
		var tbl = $('#baseInput > table:eq(0)');
		var item = $('tbody > tr:last', tbl).clone();
		var v = $('#departmentName').val();
		var num = $('tr.department', tbl).length + 1;
		$('th', item).text("呼出部署" + num);
		$('td input', item).val(v);
		tbl.append(item);
	});
	
	// 質問追加
	$(document).on('click', '#addQuestion', function(e) {
		e.preventDefault();
		
		var num = $('#questionInput > table').length + 1;
		if (MAX_QUESTION < num ) {
			alert("質問は10個まで登録可能です。")
			return false;
		}
		
		var item = $('#question-template > table:eq(0)').clone();
		item.addClass('mgn-t8');
		$('tr:first > th', item).text("質問" + num);
		$('#questionInput > table:last').after(item);
		
		return false;
	});
	
	// 質問削除
	$(document).on('click', '#questionInput a.deleteQuestion', function(e) {
		var num = $('#questionInput > table').length
		if (MIN_QUESTION == num) {
			alert("質問は1件以上登録して下さい。");
			return false;
		}
		// 質問削除
		$(this).closest('table').fadeOut('fast', function() {
			$(this).remove();
			// 削除後に質問Noを採番
			$('#questionInput > table').each(function(index) {
				var num = index + 1;
				$('tr:first > th', this).text("質問" + num);
			});
		});
	});
	
	// 答え追加
	$(document).on('click', '#questionInput input.addAnswer', function(e) {
		var tbl = $(this).closest('tbody');
		var item = $(this).closest('tr').clone();
		var num = $('tr input.addAnswer', tbl).length + 1;
		$('th', item).html('<a href="javascript:void(0);" class="deleteAnswer"><span class="delbtn"></span></a>答え' + num);
		tbl.append(item);
	});
	
	// 答え削除
	$(document).on('click', '#questionInput a.deleteAnswer', function(e) {
		var tbl = $(this).closest('table');
		var tr = $(this).closest('tr');
		$(tr).fadeOut('fast', function() {
			$(this).remove();
			// 削除後に答えNoを採番
			$('tbody > tr', tbl).each(function(index) {
				if (0 == index) {
					return true;
				}
				var item = (1 == index) ? '<span class="space"></span>答え' + index
										: '<a href="javascript:void(0);" class="deleteAnswer"><span class="delbtn"></span></a>答え' + index;
				$('th', this).html(item);
			});
		});
	});
	
	// 台本追加
	$(document).on('click', '#addSenario', function(e) {
		var $ul = $(this).closest('ul');
		$ul.find('li:eq(1) select').removeClass('size-s');
		$ul.find('li:eq(1) select').addClass('size-l');
		$ul.find('li:last-child').remove();
		var $tmpl = $('#senario-template > ul').clone();
		$ul.after($tmpl);
	});
	
	// 台本削除
	$(document).on('click', '#tbl-second a.deleteRow', function(e) {
		e.preventDefault();
		
		// 最終行は削除不可
		if ($('#tbl-second tbody > tr:last-child > td').children().length == 1) {
			alert('削除出来ません。');
			return false;
		}
		
		var $ul = $(this).closest('ul');
		// 追加ボタンがある行を削除したケースを考慮
		if ($ul.find('#addSenario').length != 0) {
			$ul.fadeOut('fast', function() {
				var $prevul = $(this).prev();
				$prevul.find('li:last-child select').removeClass('size-l');
				$prevul.find('li:last-child select').addClass('size-s');
				$prevul.find('li:last-child').after('<li><input type="button" class="btn-gry ansadd" id="addSenario" value="台本を追加"></li>');
				$(this).remove();
			});
		} else {
			$ul.fadeOut('fast', function() { $(this).remove(); });
		}
		
		return false;
	});
});
