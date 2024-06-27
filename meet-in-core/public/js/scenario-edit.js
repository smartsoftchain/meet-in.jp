/* Title:       Scenario Edit
   ─────────────────────────
   Version:     1.0
━━━━━━━━━━━━━━━━━━━━━━━━━━ */


$(function() {
	
	// 基本シナリオエリア内　追加ボタン
	$(document).on('click', '#scenarioBase a.addRow', function(e) {
		e.preventDefault();

		var lastLine = $('#scenarioBase tbody > tr:last-child > td');
		var lastList = lastLine.find('ul.ans_list:last-child');
		var addList = lastList.clone();
		// 追加ボタン削除
		lastList.find('li:last-child').remove();
		// セレクトボックス拡大
		lastList.find('li:last-child select').removeClass('size-s');
		lastList.find('li:last-child select').addClass('size-l');
		// 新規行追加
		lastLine.append(addList);
		
		return false;
	});
	
	// 基本シナリオ内　削除ボタン
	$(document).on('click', '#scenarioBase a.deleteRow', function(e) {
		e.preventDefault();
		
		// 最終行は削除不可
		if ($('#scenarioBase tbody > tr:last-child > td').children().length == 1) {
			alert('削除出来ません。');
			return false;
		}
		// 追加ボタンがある行を削除したケースを考慮
		if ($(this).closest('ul').find('a.addRow').length != 0) {
			// 行削除
			$(this).closest('ul').fadeOut('fast', function() {
				var lastList = $('#scenarioBase tbody > tr:last-child > td > ul.ans_list:last-child').prev();
				// セレクトボック縮小
				lastList.find('li:last-child select').removeClass('size-l');
				lastList.find('li:last-child select').addClass('size-s');
				// 削除ボタン追加
				lastList.append('<li class="mgn-l0"><p class="add-row"><a href="javascript:void(0);" class="addRow">追加</a></p></li>');
				$(this).remove();
			});
		} else {
			// 行削除
			$(this).closest('ul').fadeOut('fast', function() { $(this).remove(); });
		}
		
		return false;
	});
	
	// 紐付するシナリオを追加ボタン
	$(document).on('click', '#addScenarioBefore, #addScenarioAfter', function(e) {
		e.preventDefault();
		// シナリオ数取得
		var now = $('#main_contents').find('[id^=scenarioConnect]').length;
		var next = now + 1;
		var item = '<div class="article-box mgn-t20" id="scenarioConnect' + next + '">'
			+ '<div class="scenario_del">'
			+ '<a href="javascript:void(0);" class="btn-gry mid2 deleteScenario"><span class="del">紐付するシナリオを削除</span></a>'
			+ '<div style="clear:both;"></div>'
			+ '</div>'
			+ '<form action="OP_8-10-1_submit2" method="get" accept-charset="utf-8">'
			+ '<table class="model-temp">'
			+ '<tbody>'
			+ '<tr>'
			+ '<th><span>シナリオ名</span></th>'
			+ '<td><input type="text" class="size-l"></td>'
			+ '</tr>'
			+ '<tr>'
			+ '<th><span>このシナリオにリンク</span></th>'
			+ '<td>'
			+ '<select name="" class="size-l">'
			+ '<option value="">リンクシナリオ</option>'
			+ '</select>'
			+ '</td>'
			+ '</tr>'
			+ '<tr>'
			+ '<th class="subject"><span>送信元</span></th>'
			+ '<td><textarea name=""></textarea></td>'
			+ '</tr>'
			+ '<tr>'
			+ '<th class="subject"><span>電話の返答</span></th>'
			+ '<td>'
			+ '<ul class="ans_list">'
			+ '<li><a href="javascript:void(0);" class="deleteRow"><img src="common/img/btn_del.png" height="40" width="40"></a></li>'
			+ '<li><input type="text" class="size-s"></li>'
			+ '<li><span>遷移先</span></li>'
			+ '<li><input type="text" class="size-s"></li>'
			+ '<li>'
			+ '<select name="" class="size-l">'
			+ '<option value="">台本</option>'
			+ '</select>'
			+ '</li>'
			+ '</ul>'
			+ '<ul class="ans_list">'
			+ '<li><a href="javascript:void(0);" class="deleteRow"><img src="common/img/btn_del.png" height="40" width="40"></a></li>'
			+ '<li><input type="text" class="size-s"></li>'
			+ '<li><span>遷移先</span></li>'
			+ '<li><input type="text" class="size-s"></li>'
			+ '<li>'
			+ '<select name="" class="size-s">'
			+ '<option value="">台本</option>'
			+ '</select>'
			+ '</li>'
			+ '<li class="mgn-l0"><p class="add-row"><a href="javascript:void(0);" class="addRow">追加</a></p></li>'
			+ '</ul>'
			+ '</td>'
			+ '</tr>'
			+ '</tbody>'
			+ '</table>'
			+ '</form>'
			+ '</div>'
		if (0 == now) {
			$('#addScenarioBefore').after(item);
		} else {
			$('#scenarioConnect' + now).after(item);
		}
		
		return false;
	});
	
	// 紐付するシナリオを削除ボタン
	$(document).on('click', '[id^=scenarioConnect] a.deleteScenario', function(e) {
		e.preventDefault();
		$(this).closest('[id^=scenarioConnect]').fadeOut('fast', function() { $(this).remove(); });
		return false;
	});
	
	// 追加シナリオ内　追加ボタン
	$(document).on('click', '[id^=scenarioConnect] a.addRow', function(e) {
		e.preventDefault();

		var lastLine = $(this).closest('[id^=scenarioConnect] tbody > tr:last-child > td');
		var lastList = lastLine.find('ul.ans_list:last-child');
		var addList = lastList.clone();
		// 追加ボタン削除
		lastList.find('li:last-child').remove();
		// セレクトボックス拡大
		lastList.find('li:last-child select').removeClass('size-s');
		lastList.find('li:last-child select').addClass('size-l');
		// 新規行追加
		lastLine.append(addList);
		
		return false;
	});
	
	// 基本シナリオ内　削除ボタン
	$(document).on('click', '[id^=scenarioConnect] a.deleteRow', function(e) {
		e.preventDefault();
		
		var _self = $(this);
		// 最終行は削除不可
		if (_self.closest('[id^=scenarioConnect] tbody > tr:last-child > td').children().length == 1) {
			alert('削除出来ません。');
			return false;
		}
		// 追加ボタンがある行を削除したケースを考慮
		if (_self.closest('ul').find('a.addRow').length != 0) {
			// 行削除
			_self.closest('ul').fadeOut('fast', function() {
				var lastList = _self.closest('[id^=scenarioConnect] tbody > tr:last-child > td > ul.ans_list:last-child').prev();
				// セレクトボック縮小
				lastList.find('li:last-child select').removeClass('size-l');
				lastList.find('li:last-child select').addClass('size-s');
				// 削除ボタン追加
				lastList.append('<li class="mgn-l0"><p class="add-row"><a href="javascript:void(0);" class="addRow">追加</a></p></li>');
				$(this).remove();
			});
		} else {
			// 行削除
			_self.closest('ul').fadeOut('fast', function() { $(this).remove(); });
		}
		
		return false;
	});
});