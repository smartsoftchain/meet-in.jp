/*
 * キャンバスへ線を描く共通関数
 *
 * */
const TOOL_CURSORE_SELECT = 1;				// 選択カーソル
const TOOL_CURSORE_EMPHASIS = 2;			// 強調ポインター
const TOOL_PEN_NORMAL = 3;					// ペン
const TOOL_PEN_HIGHLIGHT = 4;				// ハイライト
const TOOL_PEN_ERASER = 5;				// 消しゴム
const TOOL_DRAW_TEXT = 6;				// テキスト
var line = 8;								// 線の初期サイズ
var color = "#333333";						// 線の初期色
var onMouseX = 0;							// 線を描画する開始位置X
var onMouseY = 0;							// 線を描画する開始位置Y
var selectLeftTool = TOOL_CURSORE_SELECT;	// 選択中のツールステータス[1:選択カーソル, 2:強調ポインター, 3:ペン, 4:ハイライト]
var penLine = 8;							// ペンの線の大きさ
var highlightLine = 8;						// ハイライトの線の大きさ

const FONTSIZE_OPTIONS = [10,11,12,14,16,18,20,22,24,26,28,36,48,54];
const TEXTCOLOR_OPTIONS = ['blue', 'red', 'yellow', 'green', 'black'];

$(function () {

    let element = document.getElementById("document_canvas");
    element.addEventListener('touchmove', function(e) {
		if(selectLeftTool != TOOL_CURSORE_SELECT){
			e.preventDefault();
		}
    });

	// ========================================================================
	// ペンの種類や色の変更関連を以下に記述
	// ========================================================================
	// ペンを選択し太く、細くする(オペレーターのみ操作可能)
	$(document).on('click', '.left_icon_pen', function(e){
		// 前回が選択カーソルか強調ポインターの場合はドラッグイベントを削除する
		if(selectLeftTool == TOOL_CURSORE_SELECT){
			// 資料領域のドラッグイベント削除
			$("div#mi_docment_area").draggable('destroy');
			// ↓２行　ドラッグイベントを削除した際になぜかresizableも削除されてしまうみたいなので一度削除してから再度定義
			$("div#mi_docment_area").resizable('destroy');
			resizable()
		}
		if(selectLeftTool == TOOL_PEN_NORMAL){
			$(this).find("div.pen_msg").empty();
			if(line == 8){
				penLine = 4;
				$(this).find("div.pen_msg").append("ペン<br>(細い)");
			}else{
				penLine = 8;
				$(this).find("div.pen_msg").append("ペン<br>(太い)");
			}
		}else{
			// レフトアイコンの選択アイコン変更
			changeSelectIcon(selectLeftTool, TOOL_PEN_NORMAL);
			// ペンを選択中にする
			selectLeftTool = TOOL_PEN_NORMAL;
		}
		// 線の太さを設定
		line = penLine;
	});

	// ハイライトを選択し太く、細くする(オペレーターのみ操作可能)
	$(document).on('click', '.left_icon_highlight', function(e){
		// 前回が選択カーソルか強調ポインターの場合はドラッグイベントを削除する
		if(selectLeftTool == TOOL_CURSORE_SELECT){
			// 資料領域のドラッグイベント削除
			$("div#mi_docment_area").draggable('destroy');
			// ↓２行　ドラッグイベントを削除した際になぜかresizableも削除されてしまうみたいなので一度削除してから再度定義
			$("div#mi_docment_area").resizable('destroy');
			resizable()
		}
		if(selectLeftTool == TOOL_PEN_HIGHLIGHT){
			$(this).find("div.highlight_msg").empty();
			if(line == 8){
				highlightLine = 4;
				$(this).find("div.highlight_msg").append("ハイライト<br>(細い)");
			}else{
				highlightLine = 8;
				$(this).find("div.highlight_msg").append("ハイライト<br>(太い)");
			}
		}else{
			// レフトアイコンの選択アイコン変更
			changeSelectIcon(selectLeftTool, TOOL_PEN_HIGHLIGHT);
			// ハイライトを選択中にする
			selectLeftTool = TOOL_PEN_HIGHLIGHT;
		}
		// 線の太さを設定
		line = highlightLine;
	});

	/**
	 * 選択カーソルを選択
	 */
	$(document).on('click', 'li.left_icon_arrow', function(){
		// レフトアイコンの選択アイコン変更
		changeSelectIcon(selectLeftTool, TOOL_CURSORE_SELECT);
		// 選択カーソルを選択中にする
		selectLeftTool = TOOL_CURSORE_SELECT;
		// 資料領域の移動イベント追加
		addDocumentAreaOperation();
		// 資料上でのカーソルをノーマルに変更
		$('#mi_docment_area').css('cursor','normal');
	});
	/**
	 * 強調ポインターを選択
	 */
	$(document).on('click', 'li.left_icon_pointer', function(){

		// 前回が選択カーソルか強調ポインターの場合はドラッグイベントを削除する
		if(selectLeftTool == TOOL_CURSORE_SELECT){
			// 資料領域のドラッグイベント削除
			$("div#mi_docment_area").draggable('destroy');
			// ↓２行　ドラッグイベントを削除した際になぜかresizableも削除されてしまうみたいなので一度削除してから再度定義
			$("div#mi_docment_area").resizable('destroy');
			resizable()
		}

		// レフトアイコンの選択アイコン変更
		changeSelectIcon(selectLeftTool, TOOL_CURSORE_EMPHASIS);
		// 強調ポインターを選択中にする
		selectLeftTool = TOOL_CURSORE_EMPHASIS;
	});

	/**
	 * 消しゴムを選択
	 */
	$(document).on('click', 'li.left_icon_eraser', function(){
		// 前回が選択カーソルか強調ポインターの場合はドラッグイベントを削除する
		if(selectLeftTool == TOOL_CURSORE_SELECT){
			// 資料領域のドラッグイベント削除
			$("div#mi_docment_area").draggable('destroy');
			// ↓２行　ドラッグイベントを削除した際になぜかresizableも削除されてしまうみたいなので一度削除してから再度定義
			$("div#mi_docment_area").resizable('destroy');
			resizable()
		}
		changeSelectIcon(selectLeftTool, TOOL_PEN_ERASER);
		// 選択カーソルを選択中にする
		selectLeftTool = TOOL_PEN_ERASER;
		line = 16;
	});
	// カラーパレットの表示(オペレーターのみ操作可能)
	$(document).on('click', '.left_icon_color', function(e){
		$(this).find("div.mi_color_pad").toggleClass("mi_onview");
	});
	// 色の変更(テンプレートが変更される可能性を考えて冗長に記述)(オペレーターのみ操作可能)
	$(document).on('click', 'div.mi_blue', function(e){
		color = "#3498db";
		$("li.left_icon_color span.mi_select_color").css("background-color", color);
	});
	$(document).on('click', 'div.mi_red', function(e){
		color = "#c0392b";
		$("li.left_icon_color span.mi_select_color").css("background-color", color);
	});
	$(document).on('click', 'div.mi_yellow', function(e){
		color = "#f1c40f";
		$("li.left_icon_color span.mi_select_color").css("background-color", color);
	});
	$(document).on('click', 'div.mi_green', function(e){
		color = "#2ecc71";
		$("li.left_icon_color span.mi_select_color").css("background-color", color);
	});
	$(document).on('click', 'div.mi_black', function(e){
		color = "#333333";
		$("li.left_icon_color span.mi_select_color").css("background-color", color);
	});
	$(document).on('click', 'div.mi_white', function(e){
		color = "#ffffff";
		$("li.left_icon_color span.mi_select_color").css("background-color", color);
	});

	// 今はオペレータしか書きこめないが、ゲストも書きこめるようになると、CSSのホバーだけで対応可能となる TODO
	$(document).on({
		// 元々mouseenterだったがmousemoveに変更
		'mousemove' : function() {
			var url = "";
			// 資料の場合且つ、表示がURL資料の場合は指アイコンにするため、データを取得する
			if($("div#mi_docment_area").is(':visible') && $(this).attr("id") == "document_canvas"){
				// 資料がURLか判定用のデータを取得する
				url = getDocumentUrl();
			}
			if(!url){
				if(selectLeftTool == TOOL_CURSORE_SELECT){
					// 選択カーソル
					$(this).css("cursor", "");
				}else if(selectLeftTool == TOOL_CURSORE_EMPHASIS){
					// 強調ポインター
					$(this).css("cursor", "url('/img/icon_pointer_pc.svg'), pointer");
				}else if(selectLeftTool == TOOL_PEN_NORMAL || selectLeftTool == TOOL_PEN_HIGHLIGHT){
					// ペンアイコン
					if(getBrowserType() != "IE" && getBrowserType() != "Edge"){
						$(this).css("cursor", "url('../img/pen_upward.cur'), pointer");
					}else{
						$(this).css("cursor", "url('../img/pen_downward.cur'), pointer");
					}
				}else if(selectLeftTool == TOOL_PEN_ERASER){
					if(getBrowserType() != "IE" && getBrowserType() != "Edge"){
						$(this).css("cursor", "url('../img/icon_eraser_pointer.cur'), pointer");
					}else{
						$(this).css("cursor", "url('../img/icon_eraser_pointer.cur'), pointer");
					}
				}else if(selectLeftTool == TOOL_DRAW_TEXT){
					// マウスカーソルをテキスト用に変更
					$(this).css("cursor", "text");
				}
			}else{
				// マウスポインターを指アイコンに変更
				$(this).css("cursor", "pointer");
			}

		},
		'mouseleave' : function(){
			$(this).removeClass("mouse_pen_icon");

		}
	}, 'canvas');
});


/**
 * ホワイトボードの実際に線を描画する処理
 * @param drowX
 * @param drowY
 */
function writeLine(canvasId, localDrowX, localDrowY, localOnMouseX, localOnMouseY, localLine, localColor, localSelectLeftTool){
	// キャンバスオブジェクト
	var canvas = document.getElementById(canvasId);
	// canvasのcontextを取得
	var context = canvas.getContext('2d');
	// 線の設定
	context.lineWidth = localLine;		// 太さ
	context.strokeStyle = localColor;	// 色
	if(localSelectLeftTool == TOOL_PEN_ERASER) {
		if(canvasId == 'white_board') {
			// ホワイトボードの場合は白塗り
			context.strokeStyle = 'rgb(255,255,255)';
		} else {
			context.globalCompositeOperation = 'destination-out';
		}
	} else {
		if(canvasId == 'white_board') {
		} else {
			context.globalCompositeOperation = 'source-over';
		}
	}
	if(localSelectLeftTool == TOOL_PEN_HIGHLIGHT){
		// ハイライトを有効にする
		context.globalAlpha = 0.3;
	}else{
		// ハイライトを無効にする
		context.globalAlpha = 1.0;
	}
	// 新しいパスを開始する
	context.beginPath();
	// パスの開始座標を指定する
	context.moveTo(localOnMouseX, localOnMouseY);
	// 座標を指定してラインを引くが、ここでは点となる
	context.lineTo(localDrowX, localDrowY);
	// console.log(localDrowX, localDrowY)
	// パスを閉じる
	context.closePath();
	// 現在のパスを輪郭表示する
	context.stroke();
	// 次回の描画のために現在の座標を設定する
	onMouseX = localDrowX;
	onMouseY = localDrowY;
}
/**
 * ホワイトボードの実際に線を描画する処理（タッチ対応）
 * @param drowX
 * @param drowY
 */
var mouseMovePointData = [];
$(document).on('touchmove', '#document_canvas', function(e){
	// 要素の位置を取得
	var element = document.getElementById("document_canvas");
	var rect = element.getBoundingClientRect();
	// 要素の位置座標を計算
	var positionX = rect.left + window.pageXOffset ;	// 要素のX座標
	var positionY = rect.top + window.pageYOffset ;		// 要素のY座標
	// 要素の左上からの距離を計算
	var drowX = e.originalEvent.touches[0].pageX - positionX ;
	var drowY = e.originalEvent.touches[0].pageY - positionY ;

	// 線を書いているのか、マウスの移動だけなのかを判定する
	var writeLineFlg = 0;
	if(selectLeftTool != TOOL_CURSORE_EMPHASIS && selectLeftTool != TOOL_CURSORE_SELECT){
		// 線を書いているのでフラグを建てる
		writeLineFlg = 1;
	}

	// 資料の表示割合を計算する
	var proportionSize = getProportion();

	mouseMovePointData.push({
		drowX : drowX / proportionSize,
		drowY : drowY / proportionSize,
		writeLineFlg : writeLineFlg,
		onMouseX : onMouseX / proportionSize,
		onMouseY : onMouseY / proportionSize,
		line : line,
		color : color,
		selectLeftTool : selectLeftTool,
	});

	// 線の描画.
	if(writeLineFlg) {
		writeLineTouch("document_canvas", drowX, drowY, onMouseX, onMouseY, line, color, selectLeftTool);
	}

	// 通信量が負荷が高すぎるので数回に一度の通信にする.
	if(mouseMovePointData.length % 3 != 0) {
		return;
	}

	// マウスの位置を相手に送信する
	var data = {
		command : "DOCUMENT",
		type : "MOUSE_POINTER",
		userId : $('#user_id').val(),
		position: mouseMovePointData
	};
	mouseMovePointData = [];
	sendCommand(SEND_TARGET_ALL, data);

});

//タッチ時の描写処理
function writeLineTouch(canvasId, localDrowX, localDrowY, localOnMouseX, localOnMouseY, localLine, localColor, localSelectLeftTool){
// テキスト入力モードの時は、描画しない
	if (selectLeftTool !== TOOL_DRAW_TEXT) {
	// キャンバスオブジェクト
	var canvas = document.getElementById(canvasId);
	// canvasのcontextを取得
	var context = canvas.getContext('2d');
	// 線の設定
	context.lineWidth = localLine;		// 太さ
	context.strokeStyle = localColor;	// 色
	if(localSelectLeftTool == TOOL_PEN_ERASER) {
		if(canvasId == 'white_board') {
			// ホワイトボードの場合は白塗り
			context.strokeStyle = 'rgb(255,255,255)';
		} else {
			context.globalCompositeOperation = 'destination-out';
		}
	} else {
		if(canvasId == 'white_board') {
		} else {
			context.globalCompositeOperation = 'source-over';
		}
	}
	if(localSelectLeftTool == TOOL_PEN_HIGHLIGHT){
		// ハイライトを有効にする
		context.globalAlpha = 0.3;
	}else{
		// ハイライトを無効にする
		context.globalAlpha = 1.0;
	}
	// 新しいパスを開始する
	context.beginPath();
	// パスの開始座標を指定する
	context.moveTo(localOnMouseX, localOnMouseY);
	// 座標を指定してラインを引くが、ここでは点となる
	context.lineTo(localDrowX, localDrowY);
	// パスを閉じる
	context.closePath();
	// 現在のパスを輪郭表示する
	context.stroke();
	// 次回の描画のために現在の座標を設定する
	onMouseX = localDrowX;
	onMouseY = localDrowY;
	}
}

// キャンバス押下開始時の処理(オペレーターのみ操作可能)
$(document).on('touchend', '#document_canvas', function(e){
	// 要素の位置を取得
	var element = document.getElementById("document_canvas");
	var rect = element.getBoundingClientRect();
	// 要素の位置座標を計算
	var positionX = rect.left + window.pageXOffset ;	// 要素のX座標
	var positionY = rect.top + window.pageYOffset ;		// 要素のY座標
	// 要素の左上からの距離を計算し起点を設定
	onMouseX = e.originalEvent.changedTouches[0].pageX - positionX ;
	onMouseY = e.originalEvent.changedTouches[0].pageY - positionY ;

	// 線を書き終わったら資料を保存する
	if([TOOL_PEN_NORMAL, TOOL_PEN_HIGHLIGHT, TOOL_PEN_ERASER].indexOf(selectLeftTool) > -1){
		saveDocument();
	}

});

// キャンバス押下終了時の処理(オペレーターのみ操作可能)
$(document).on('touchstart', '#document_canvas', function(e){
	// 要素の位置を取得
	var element = document.getElementById("document_canvas");
	var rect = element.getBoundingClientRect();
	// 要素の位置座標を計算
	var positionX = rect.left + window.pageXOffset ;	// 要素のX座標
	var positionY = rect.top + window.pageYOffset ;		// 要素のY座標
	// 要素の左上からの距離を計算し起点を設定
	onMouseX = e.originalEvent.changedTouches[0].pageX - positionX ;
	onMouseY = e.originalEvent.changedTouches[0].pageY - positionY ;
});

// キャンバスからマウスが外れた場合の処理(オペレーターのみ操作可能)
$(document).on('touchend', '#document_canvas', function(){
	// 線を書く為の変数初期化
	onMouseX = 0;
	onMouseY = 0;
});

/**
 * 現在選択中のアイコンのスタイル変更
 * @param oldSelectIcon
 * @param newSelectIcon
 * @returns
 */
function changeSelectIcon(oldSelectIcon, newSelectIcon){
	// 前回の選択アイコンを未選択に変更
	if(oldSelectIcon == TOOL_CURSORE_SELECT){
		$(".left_icon_arrow").removeClass("on_left_icon");
	}else if(oldSelectIcon == TOOL_CURSORE_EMPHASIS){
		$(".left_icon_pointer").removeClass("on_left_icon");
		 // 強調ポインターが画面に残らないように消す,
		var data = {
			command : "DOCUMENT",
			type : "CLEAR_CURSORE_EMPHASIS_POINTER",
			userId : $('#user_id').val(),
		};
		sendCommand(SEND_TARGET_ALL, data);
	}else if(oldSelectIcon == TOOL_PEN_NORMAL){
		$(".left_icon_pen").removeClass("on_left_icon");
	}else if(oldSelectIcon == TOOL_PEN_HIGHLIGHT){
		$(".left_icon_highlight").removeClass("on_left_icon");
	}else if(oldSelectIcon == TOOL_PEN_ERASER){
		$(".left_icon_eraser").removeClass("on_left_icon");
	}else if(oldSelectIcon == TOOL_DRAW_TEXT){
		$(".left_icon_text").removeClass("on_left_icon");
		// テキスト入力用のモーダルを削除
		$(".document_canvas_contents").find('#text_form_modal.input').remove();
		// テキスト入力モーダルが資料上に存在しない場合は右上アイコンを通常に戻す
		$('#document_header_icon').css('visibility','');
	}
	// 現在の選択アイコンを選択中に変更
	if(newSelectIcon == TOOL_CURSORE_SELECT){
		$(".left_icon_arrow").addClass("on_left_icon");
	}else if(newSelectIcon == TOOL_CURSORE_EMPHASIS){
		$(".left_icon_pointer").addClass("on_left_icon");
	}else if(newSelectIcon == TOOL_PEN_NORMAL){
		$(".left_icon_pen").addClass("on_left_icon");
	}else if(newSelectIcon == TOOL_PEN_HIGHLIGHT){
		$(".left_icon_highlight").addClass("on_left_icon");
	}else if(newSelectIcon == TOOL_PEN_ERASER){
		$(".left_icon_eraser").addClass("on_left_icon");
	}else if(newSelectIcon == TOOL_DRAW_TEXT){
		$(".left_icon_text").addClass("on_left_icon");
	}

	setDocumentInputTextElementSelectIcon(newSelectIcon);

	// リサイズイベントが検知できなくなっていたため、再設定する
	setDocumentResize();
}

// 選択状態で テキスト入力の要素の状態を切り替える.
function setDocumentInputTextElementSelectIcon(selectIcon) {

	// 現在の選択アイコンを選択中に変更
	if(selectIcon == TOOL_CURSORE_SELECT){
		setSortDocumentTextFieldUp();
		setDocumentInputPenMode();
	}else if(selectIcon == TOOL_CURSORE_EMPHASIS){
		setSortDocumentAreaCanvasUp();
		setDocumentInputPenMode();
	}else if(selectIcon == TOOL_PEN_NORMAL){
		setSortDocumentAreaCanvasUp();
		setDocumentInputPenMode();
	}else if(selectIcon == TOOL_PEN_HIGHLIGHT){
		setSortDocumentAreaCanvasUp();
		setDocumentInputPenMode();
	}else if(selectIcon == TOOL_PEN_ERASER){
		setSortDocumentAreaCanvasUp();
		setDocumentInputPenMode();
	}else if(selectIcon == TOOL_DRAW_TEXT){
		setSortDocumentTextFieldEditUp();
		setDocumentInputKeybordMode();

		// MEMO. 左ペンエリアを操作すると何故か リサイズイベント機能が死ぬので再付与で帳尻を合わせせている.
		$(".document_text #canvas_text_area").each(function(index, target_element){
			applyResizableDocumentInputUI(target_element, true);
		});
	}

}

/**
 * 資料の上に置く Canvasエリアの深度を上げる.
 */
function setSortDocumentAreaCanvasUp() {
	$("#document_text_field").css("z-index","20");
	$("#document_text_input_trigger").css("z-index","unset");
	$("#document_canvas").css("z-index","21");
}

/**
 * 資料の上に置く テキスト入力エリアの深度を上げる.
 */
function setSortDocumentTextFieldUp() {
	$("#document_text_field").css("z-index","21");
	$("#document_text_input_trigger").css("z-index","unset");
	$("#document_canvas").css("z-index","20");
}
/**
 * 資料の上に置く テキスト入力エリアの深度を「編集」が他機能より上になるよう上げる.
 */
function setSortDocumentTextFieldEditUp() {
	// MEMO. setSortDocumentTextFieldUp()との違いは こちらは資料と入力インターフェースの間に他の要素が割り込むことを是としている.
	$("#document_text_field").css("z-index","unset"); // たっぷり隙間をあけている ビデオ要素の上に文字入力インターフェースが重なる.
	$("#document_text_input_trigger").css("z-index","21");
	$("#document_canvas").css("z-index","20");
}


function setDocumentInputPenMode() {
	document.querySelectorAll("#text_form_modal").forEach(function(e){
		e.classList.add('view_mode');
		e.classList.remove('edit_mode');
		e.classList.remove('select_mode');
		e.classList.remove('printout_mode');
	});
}

function setDocumentInputKeybordMode() {
	document.querySelectorAll("#text_form_modal").forEach(function(e){
		e.classList.add('select_mode');
		e.classList.remove('edit_mode');
		e.classList.remove('view_mode');
		e.classList.remove('printout_mode');
	});
}

function setDocumentInputCurrentPageOnly(page) {
	document.querySelectorAll("#text_form_modal").forEach(function(e){
		if(e.dataset.page == page && e.dataset.document_id == currentDocumentId) {
			e.classList.remove('hide_mode');
		} else {
			e.classList.add('hide_mode');
		}
	});
}



function resizable(){
	var materialLeft = 0;
	$("div#mi_docment_area").resizable({
		minHeight: 260,
		minWidth: 260,
		containment :  "#mi_video_area",
		handles: "ne, se, sw, nw",
		start: function() {
			// left座標がマイナスの場合のみ現在のleft設定する
			if($(this).position().left < 0){
				materialLeft = $(this).position().left;
			}
		},
		resize: function() {
			// なぜかleft値がマイナスの場合は0にされるので、設定しなおす
			if(materialLeft < 0){
				materialLeft = $(this).position().left + materialLeft;
				$(this).css("left", materialLeft);
				// 一度設定すればよいので初期値に戻す
				materialLeft = 0;
			}
		},
		stop: function() {
			// 資料領域のリサイズ時の処理
			documentResizeEvent();
		}
	});
}

// 資料へ文字を書き込む場合の処理
$(document).on('click', '.left_icon_text', function(e){
	// 前回が選択カーソルか強調ポインターの場合はドラッグイベントを削除する
	if(selectLeftTool == TOOL_CURSORE_SELECT){
		// 資料領域のドラッグイベント削除
		$("div#mi_docment_area").draggable('destroy');
		// ↓２行　ドラッグイベントを削除した際になぜかresizableも削除されてしまうみたいなので一度削除してから再度定義
		$("div#mi_docment_area").resizable('destroy');
		resizable();
	}
	// レフトアイコンの選択アイコン変更
	changeSelectIcon(selectLeftTool, TOOL_DRAW_TEXT);
	// テキストを選択中にする
	selectLeftTool = TOOL_DRAW_TEXT;

	// MEMO. これは「テキスト入力」機能  資料画像に被さるキャンバスをクリックすると、文字入力モーダルを出現させる 入力を追えたら#document_text_field 以下に文字Html要素を作る.
	$("#document_text_input_trigger").click(function(event){
		// テキスト入力モード時のみ利用可能
		if(selectLeftTool == TOOL_DRAW_TEXT){
			// 資料上にモーダルを複数同時生成しない
			if($(".document_canvas_contents").find('#text_form_modal.input').length == 1){
				return;
			}
			// テキスト入力モーダルが資料上に存在しているときは右上アイコンを表示しない
			$('#document_header_icon').css('visibility','hidden');
			// 資料上にモーダルを生成
			$(".document_canvas_contents").append(`
			<div id="text_form_modal" class="ui-draggable ui-draggable-handle input" style="position: absolute;z-index:100;">
				<textarea id="canvas_text_area" class="input_text_modal_textarea" placeholder="テキストを入力してください"></textarea>
				<div class="parts_inner_select dropdown_menu select_fontsize input">
					<span id="selected_fontsize">
						<span class="default_fontsize">14px</span>
						<img class="icon_arrow arrow_img" src="/img/icon_select_arrow.png"/>
					</span>
					<ul class="change_fontsize input"> </ul>
				</div>
				<div class="parts_inner_select dropdown_menu select_text_color input">
					<span id="selected_color">
						<img class="default_color" src="/img/input_text_modal_colors/selected_text_color_black.png"/>
						<img class="icon_arrow arrow_img" src="/img/icon_select_arrow.png"/>
					</span>
					<ul class="change_text_color input"> </ul>
				</div>
				<div class="input_text_modal_apply_btn" id="text_modal_apply">完了</div>
				<div class="input_text_modal_close" id="text_modal_remove"></div>
			</div>`);
			// モーダルの出現位置をcssで指定.
			let calculateTop = event.offsetY;
			let calculateLeft = event.offsetX;

			$('#text_form_modal.input').css({
				'top':`${calculateTop}px`,
				'left':`${calculateLeft}px`,
			});

			// モーダルにドラッグ・リサイズイベントを付与
			$('#text_form_modal.input').draggable({
				containment: '#mi_video_area',
				stop: function(event, ui) {
					event.target.style.width = "fit-content"; // プラグインが widthをいちいち付けるのが邪魔.
					event.target.style.height = "fit-content"; // プラグインが widthをいちいち付けるのが邪魔.
				}
			});
			$('#text_form_modal.input').resizable({
				minWidth: 400,
				minHeight: 40,
				maxWidth: ($('#mi_docment_area').innerWidth()),
				maxHeight: ($('#mi_docment_area').innerHeight())
				,stop: function(event, ui) {
					event.target.style.width  = "fit-content";
					event.target.style.height = "fit-content";
				}
			});

			// リサイズ時のminWidthの初期値を設定
			let resizedMinWidth = 50;// 初期値フォントサイズ 14px + 10pxだと潰れるため　微調整しました。

			// 初期状態のリサイズを設定
			$('#text_form_modal.input #canvas_text_area').resizable({
				minHeight: 30,
				minWidth: resizedMinWidth,
				maxHeight: $('#text_form_modal.input').innerHeight(),
				maxWidth: $('#text_form_modal.input').innerWidth()
			});

			// テキスト入力モーダルリサイズ時のテキストエリアのリサイズを設定
			$('#text_form_modal.input').on('resize', function() {
				// テキスト入力モーダルのheight, widthを取り直す。
				$('#text_form_modal.input #canvas_text_area').resizable({
					minHeight: 30,
					minWidth: resizedMinWidth,
					maxHeight: $('#text_form_modal.input').innerHeight(),
					maxWidth: $('#text_form_modal.input').innerWidth()
				});

				let textAreaWidth  = $('#text_form_modal.input #canvas_text_area').width();
				let textAreaHeight = $('#text_form_modal.input #canvas_text_area').height();

				// テキストエリアリサイズ時のwidthによって、arrow_iconが白枠から出ないようcssを書き換える
				if (textAreaWidth >= 330) {
					$('.arrow_img').removeClass('icon_arrow');
					$('#text_form_modal.input #selected_fontsize').css('margin-left', '');
					$('#text_form_modal.input #selected_color').css('margin-left', '5px');
				} else {
					$('.arrow_img').addClass('icon_arrow');
					$('#text_form_modal.input #selected_fontsize').css('margin-left', '8px');
					$('#text_form_modal.input #selected_color').css('margin-left', '13px');
				}

				// テキスト入力モーダルの最小値(height)を更新したリサイズイベントを設定（テキストエリアがモーダル内をはみでないようにするため）
				$('#text_form_modal.input').resizable({
					minHeight: textAreaHeight,
					minWidth: 400,
					maxWidth:  $('#mi_docment_area').innerHeight(),
					maxHeight: $('#mi_docment_area').innerWidth()
				});
			});


			// windowsタブレット, iPadデスクトップ表示用のタッチイベント　キーボードを表示させる
			$('#text_form_modal.input #canvas_text_area').on('touchstart', function() {
				// テキストエリアをタップしたが、フォーカスが当たっていない場合はフォーカスを当てる
				$("#text_form_modal.input #canvas_text_area").focus();
			});

			//フォントサイズ変更のoptionを入れる
			FONTSIZE_OPTIONS.forEach( function(fontSizeOption) {
				$('.change_fontsize.input').append(`<li id="fontsize_${fontSizeOption}" class="font_options"><img class="checked fontsize_checked" src="/img/icon_check_select_within_input_modal.png"/>${fontSizeOption}</li>`);
				// 初期値を設定（初期値のリストにチェックマークをつける）
				if (fontSizeOption === 14) {
					const targetListElem = $(`#text_form_modal.input #fontsize_${fontSizeOption}`);
					targetListElem.find('.checked').css('visibility', 'visible');
				}
			});

			//テキストカラー変更リストの中身listを入れる
			TEXTCOLOR_OPTIONS.forEach(function(color) {
				$('.change_text_color.input').append(`<li id="${color}"><img class="checked" src="/img/icon_check_select_within_input_modal.png"/><img class="color_option" src="/img/input_text_modal_colors/color_option_${color}.png"/></li>`);
				// 初期値リストのblackにチェックマークを入れる
				if(color === 'black') {
					const targetListElem = $(`#text_form_modal.input #${color}`);
					targetListElem.find('.checked').css('visibility', 'visible');
				}
			});


			// フォントサイズ変更ドロップダウン開閉イベント
			$('#text_form_modal.input .select_fontsize.input').on('click', function() {
				openCloseDropdownMenu($('#text_form_modal.input .select_fontsize.input'), 27.5);
			});

			// フォントサイズ変更
			$('#text_form_modal.input .change_fontsize').find('li').on('click', function() {

				let docScaleRange  = getDocScaleRangeValue();

				const changedFontSize = $(this).text();
				let textAreaWidth = $('#text_form_modal.input #canvas_text_area').width();
				let modalAreaWidth = $('#text_form_modal.input').width();
				let lines = ($('#text_form_modal.input #canvas_text_area').val() + '\n').match(/\n/g).length;
				// モーダル
				const inputModalStyle = $('#text_form_modal.input').attr('style');
				$('#text_form_modal.input').css({'cssText': `${inputModalStyle}` }); // テキストエリア
				$('.ui-wrapper').css('height', ''); // これが無いとheightが変更できない

				// 選択済みの箇所の表記を変更
				$('#text_form_modal.input .default_fontsize').text(`${changedFontSize}px`);

				// チェック付け直し
				$('#text_form_modal.input .select_fontsize').find('li').each(function() {
					$(this).find('.checked').css('visibility', 'hidden');
				});
				$(this).find('.checked').css('visibility', 'visible');

				// テキストエリアのフォントサイズ・カラーを変更.
				$('.ui-wrapper').css('height', ''); // これが無いとheightが変更できない

				$('#text_form_modal.input #canvas_text_area').css('color', fontColor);
				let fitFontSize = Math.max(10, changedFontSize*docScaleRange); // Chromeは10px Safariは9px以下を正しく表示しないので10px以下は丸める.
				let nowFontSize = parseFloat($('#text_form_modal.input #canvas_text_area').css("fontSize"));
				let nowHeight   = parseInt($('#text_form_modal.input #canvas_text_area').css("height"));
				let height = (nowHeight * fitFontSize) / nowFontSize;

				$('#text_form_modal.input #canvas_text_area').css('fontSize', fitFontSize + 'px');
				$('#text_form_modal.input #canvas_text_area').css('height', height + "px");
				$('#text_form_modal.input #canvas_text_area > .ui-wrapper').css('height', height + "px"); // textareaを包む ズーム要素も調整しないと　右下端のつまみが置き去りになる.

				resizedMinWidth = parseInt($('#text_form_modal.input .input_text_modal_textarea').css('font-size').replace('px', '')) + 36;　// fontsize + 10だと潰れてしまうため、調整しました
			});

			// テキストカラー変更ドロップダウンの開閉イベント
			$('#text_form_modal.input .select_text_color.input').on('click', function() {
				openCloseDropdownMenu($('#text_form_modal.input .select_text_color.input'), 36);
			});

			let fontColor = "black";
			// テキストカラー変更
			$('#text_form_modal.input .select_text_color').find('li').on('click', function() {
				const changedColor = $(this).attr('id');
				fontColor = changedColor;
				$('#text_form_modal.input .input_text_modal_textarea').css('color', changedColor);
				$('#text_form_modal.input img.default_color').attr('src', `/img/input_text_modal_colors/selected_text_color_${changedColor}.png`);

				// チェック付け直し
				$('#text_form_modal.input .select_text_color').find('li').each(function() {
					$(this).find('.checked').css('visibility', 'hidden');
				});
				$(this).find('.checked').css('visibility', 'visible');
			});

			// Shift+Enterでテキスト描画
			$('#text_form_modal.input #canvas_text_area').keyup(function(e){
				// シフト＋エンターでテキスト描画
				if(e.shiftKey && e.which == 13){
					getElemPosition(document.querySelector("#text_form_modal.input"));
				}
			});

			// 完了ボタン押下
			$('#text_form_modal.input #text_modal_apply').click(function(e){

				getElemPosition(e.target.closest("#text_form_modal.input"));
				//　親要素にクリックイベントが伝わってしまうのを防ぐ
				e.stopPropagation();
			});

			// モーダル消去ボタンクリック
			$('#text_form_modal.input #text_modal_remove').click(function(e){
				$(".document_canvas_contents").find('#text_form_modal.input').remove();
				// テキスト入力モーダルが資料上に存在しない場合は右上アイコンを通常に戻す
				$('#document_header_icon').css('visibility','');
				//　親要素にクリックイベントが伝わってしまうのを防ぐ
				e.stopPropagation();
				// リサイズイベントが検知できなくなっていたため、再設定する
				setDocumentResize();
			})
		}
	})
})

// 各要素の位置を求めて、適切な位置にテキスト要素を置く.
function getElemPosition(inputElement) {

	// テキストエリアの内容をcanvasに描画
	inputText(inputElement);
	// リサイズイベントが検知できなくなっていたため、再設定する
	setDocumentResize();
}


function inputText(inputElement){

	var input = getInputModalData(inputElement);

	//　描画が完了したらモーダルを消去
	inputElement.remove();

	if(input.text == "") {
		return; // 未入力.
	}

	// テキスト入力モーダルが資料上に存在しているときは右上アイコンを表示しない
	$('#document_header_icon').css('visibility','');

	saveDocumentTextData(input, documentText => {
		// 自分の画面に描画.
		makeDocumentTextInputHtml(decodingCurrentSizeDocumentInputTextData(documentText));
		// ルーム内のユーザーに同期.
		sendDocumentDrawTextData({command: "DRAW_TEXT", type: 'CREATE', input: documentText}, true);
	});

}

/*
 *	入力モーダルから情報を習得する.
 *  編集時や、ドラックしたり、リサイズした際に 同じことを繰り返し書くことからまとめた.
 */
function getInputModalData(inputElement) {

	let document_text_input_id = inputElement.dataset.document_text_input_id;
	if(document_text_input_id == undefined) {
		document_text_input_id = null;
	}

	let page = inputElement.dataset.page;

	// 文字の情報 表示する幅や高さ、文字sizeや色等.
	let canvas_text_area = inputElement.querySelector("#canvas_text_area");

	// セレクトボックス習得 inputElementのstyle値を見てもわかるが、エンドユーザがセレクトボックスを操作しない場合、状況がわかるのはここしかない.
	let font_option = [].slice.call(inputElement.querySelectorAll(".change_fontsize .font_options .checked")).find(e=>e.style.visibility == "visible");
	let text_color  = [].slice.call(inputElement.querySelectorAll(".select_text_color .checked")).find(e=>e.style.visibility == "visible");

	//　エンドユーザが 要素を置いた座標.
	let	modalTop    = parseInt(inputElement.style.top);                        // int.
	let	modalLeft   = parseInt(inputElement.style.left);                       // int.
	let	modalWidth  = parseInt(inputElement.style.width);                      // int.
	let	modalHeight = parseInt(inputElement.style.height);                     // int.

	let textWidth  = parseInt(canvas_text_area.style.width);                   // int.
	let textHeight = parseInt(canvas_text_area.style.height);                  // int.

	let fontSize   = parseInt(font_option.closest('.font_options').id.split('_')[1]); // int.

	let fontColor  = text_color.closest('li').id;    // TEXTCOLOR_OPTIONS の値を使っている 英文字.
	let inputText  = canvas_text_area.value;         // 改行を含む a\nbb\nccc.

	return {
		document_text_input_id: document_text_input_id,
		text: inputText,
		textWidth:textWidth,
		textHeight:textHeight,
		fontSize:fontSize,
		fontColor:fontColor,
		modalTop: modalTop,
		modalLeft: modalLeft,
		modalWidth:modalWidth,
		modalHeight:modalHeight,
		page:page
	};
}

/** 
* 入力文字を改行して資料canvasに描く処理
* @param {array} textList 入力文字を改行で区切った文字配列
* @param {number} x 描画するx座標
* @param {number} y 描画するy座標（規程値） このy座標に調整値を加えていく
* @param {number} fontSizeDifference 文字サイズ変更時の調整値
* @param {object} ctx 描画先の資料 canvas Object
*/
function fillTextLine(textList, x, y, fontSizeDifference, ctx) {
	textList.forEach (function (text, i) {
		ctx.fillText(text, x, y+((fontSizeDifference * i) + 8 ) + (i * 12));　// 変更したサイズとの差分を元に、反映されるテキストのy座標をここで微調整
	});
}

// 原寸の幅を取得する.
function getDocumentImageNaturalWidth() {
	return document.getElementById("document_img").naturalWidth;
}

// 原寸の高さを取得する.
function getDocumentImageNaturalHeight() {
	return document.getElementById("document_img").naturalHeight;
}


// doc_scale_range の値が適当なことから 原寸と現在の幅で倍率を計算する/
function getDocScaleRangeValue() {
	return parseInt($("#document_canvas").width() / getDocumentImageNaturalWidth() * 100) / 100; // 小数点題2位で切り捨て.
}


// 入力値を原寸サイズの場合、どこに置いた要素なのかを計算して共通知とする.
function calculateBaseSizeDocumentInputTextData(data, nowWidth = null, nowHeight = null) {

	// MEMO. 倍率100%が画像の原寸を表示しているわけではない。ブラウザーの縦横サイズに収まるサイズが100%なので ユーザごとに値が跳ねてしまう点注意.
	let baseWidth  = getDocumentImageNaturalWidth();
	let baseHeight = getDocumentImageNaturalHeight();

	// 現在のサイズから計算したいときもあるし、引数で過去のサイズを渡してそれから計算したい時もある.
	if(nowWidth == null) {
		nowWidth   = $("#document_canvas").width();   // 現在時の資料の横幅(int).
	}
	if(nowHeight == null) {
		nowHeight  = $("#document_canvas").height();  // 現在時の資料の横幅(int).
	}

	// 資料原寸サイズの時の座標やサイズを求める.
	data.modalLeft   = (baseWidth  * data.modalLeft  ) / nowWidth;
	data.textWidth   = (baseWidth  * data.textWidth  ) / nowWidth;
	data.modalWidth  = (baseWidth  * data.modalWidth ) / nowWidth;
	data.modalTop    = (baseHeight * data.modalTop   ) / nowHeight;
	data.textHeight  = (baseHeight * data.textHeight ) / nowHeight;
	data.modalHeight = (baseHeight * data.modalHeight) / nowHeight;

	// MEMO. 値は何倍の状態でフォントサイズを指定しようが同じだが、見た目は CSSでfont-sizeをdocScaleRange値で拡大して見せる（当然100％状態ならばしないが).
	data.fontSize    = data.fontSize;

	return data;
}

// 値を自分の画面の場合どこになるのかを計算する.
function decodingCurrentSizeDocumentInputTextData(data) {

	let docScaleRange = getDocScaleRangeValue();

	// MEMO. 倍率100%が画像の原寸を表示しているわけではない。ブラウザーの縦横サイズに収まるサイズが100%なので ユーザごとに値が跳ねてしまう点注意.
	let baseWidth  = getDocumentImageNaturalWidth();
	let baseHeight = getDocumentImageNaturalHeight();
	let nowWidth   = $("#document_canvas").width();                  // 現在時の資料の横幅(int).
	let nowHeight  = $("#document_canvas").height(); 			     // 現在時の資料の横幅(int).

	// 資料原寸サイズの場合の座標やサイズが、自分の画面ではどうなるかを計算する.
	data.modalLeft   = (nowWidth * data.modalLeft   ) /baseWidth;
	data.textWidth   = (nowWidth * data.textWidth   ) /baseWidth;
	data.modalWidth  = (nowWidth * data.modalWidth  ) /baseWidth;
	data.modalTop    = (nowHeight * data.modalTop    ) /baseHeight;
	data.textHeight  = (nowHeight * data.textHeight  ) /baseHeight;
	data.modalHeight = (nowHeight * data.modalHeight ) /baseHeight;

	data.modalPadding = (nowHeight * 10) / baseHeight; // パディングの調整 CSSで指定しているのは10pxなのでベタ書きしている.


	// MEMO. 値は何倍の状態でフォントサイズを指定しようが同じだが、見た目は CSSでfont-sizeをdocScaleRange値で拡大して見せる（当然100％状態ならばしないが).
	data.fontSize    = data.fontSize;

	return data;
}



// ルーム内で同期する際に、100％表示状態に調整したJsonデータを送る.
// 受け取る側[receiveDocumentDrawTextJson()]は、自分の倍率に拡大して描画する.
function sendDocumentDrawTextData(data, isCalculate = false) {
	if(isCalculate) {
		data.input = calculateBaseSizeDocumentInputTextData(data.input);
	}
	sendCommand(SEND_TARGET_ALL, data);
}


// 文字描画のコマンドを受け取って動く処理
function receiveDocumentDrawTextJson(json) {

	json.input = decodingCurrentSizeDocumentInputTextData(json.input);

	if(json.type == 'CREATE') {
		makeDocumentTextInputHtml(json.input);
	} else if(json.type == 'MODIFY') {
		editDocumentTextInputHtml(json.input);
	} else if(json.type == 'REMOVE') {
		$(`#text_form_modal[data-document_text_input_id="${json.input.document_text_input_id}"]`).remove();
	}
	sideBarUpdate(); // 同期された資料の大きさに合わせて、資料サイドバーを更新する
}

/** ドロップダウンメニューの開閉処理
 * @param {object} targetMenu 対象ドロップダウンリストのElement
 * @param {number} multipleNumber  ドロップダウンリストの長さ(height)を決める倍数
 */
function openCloseDropdownMenu(targetMenu, multipleNumber) {
	if (targetMenu.find('ul').height() == 0) {
		targetMenu.find('ul').css('border', '1px solid #DEBC79');
		targetMenu.find('ul').css('border-radius', '5px');
		targetMenu.find('ul').animate({height: targetMenu.find('li').length * multipleNumber},200); // 14px fontsize 倍数27.1
	} else {
		targetMenu.find('ul').animate({height: 0},200);
		targetMenu.find('ul').css('border', ''); // ボーダートップが残ってしまうため、消す
	}
}


function makeDocumentTextInputHtml(data) {

	let docScaleRange  = getDocScaleRangeValue();

	let modal_style    = `top: ${data.modalTop}px; left: ${data.modalLeft}px; width: fit-content; height: fit-content; padding: ${data.modalPadding}px;`;

	let fitFontSize = Math.max(10, data.fontSize*docScaleRange); // Chromeは10px Safariは9px以下を正しく表示しないので10px以下は丸める.
	let textarea_style = `width: ${data.textWidth}px; height: ${data.textHeight}px; font-size: ${fitFontSize}px; color: ${data.fontColor}`;

	//フォントサイズ変更のoptionを入れる
	let fontsize_options = "";
	FONTSIZE_OPTIONS.forEach(function(fontSize) {
		let checked = '';
		if(parseInt(data.fontSize) == fontSize) {
			checked = 'visibility: visible;';
		}
		fontsize_options += `<li id="fontsize_${fontSize}" class="font_options" data-val="${fontSize}"><img class="checked fontsize_checked" style="${checked}" src="/img/icon_check_select_within_input_modal.png"/>${fontSize}</li>`;
	});

	//テキストカラー変更リストの中身listを入れる
	let textcolor_options = "";
	TEXTCOLOR_OPTIONS.forEach(function(color) {
		let checked = '';
		if(data.fontColor == color) {
			checked = 'visibility: visible;';
		}
		textcolor_options += `<li id="${color}" data-val="${color}"><img class="checked" style="${checked}" src="/img/icon_check_select_within_input_modal.png"/><img class="color_option" src="/img/input_text_modal_colors/color_option_${color}.png"/></li>`;
	});

	// 作成時の縦横サイズを保持しておけば、ユーザの操作で拡縮した際にサーバに問い合わせなくても計算で原寸時の値を割り出せる.
	let nowWidth   = $("#document_canvas").width();
	let nowHeight  = $("#document_canvas").height();

	// 作成時のモーダルの状態.
	// MEMO. 作った側は ペンの選択が「テキスト入力」だが、ルーム内で同期された側はそうとはいえない為状態が変わる.
	let modal_mode = 'view_mode';   // 「テキスト入力」以外は 資料に文字だけが重なり出ている状態.
	if(selectLeftTool == TOOL_DRAW_TEXT){
		modal_mode = 'select_mode'; // 「テキスト入力」は、文字を 移動/拡大/再編集/削除 等のUIとセットで表示されている状態.
	}

	// 要素の作成.
	let element = `
	<div id="text_form_modal" class="document_text ${modal_mode}" style="${modal_style}" data-document_id="${currentDocumentId}" data-page="${data.page}" data-document_text_input_id="${data.document_text_input_id}">
		<textarea id="canvas_text_area" class="input_text_modal_textarea" placeholder="テキストを入力してください" style="${textarea_style}">${data.text}</textarea>
		<div id="text_modal_edit" class="input_text_modal_edit_btn">編集</div>
		<div id="text_modal_delete" class="input_text_modal_delete_btn">削除</div>

		<div class="parts_inner_select dropdown_menu select_fontsize">
			<span id="selected_fontsize" style="margin-left: 8px;">
			<span class="default_fontsize">${data.fontSize}px</span>
				<img class="arrow_img icon_arrow" src="/img/icon_select_arrow.png">
			</span>
			<ul class="change_fontsize">
				${fontsize_options}
			</ul>
		</div>
		<div class="parts_inner_select dropdown_menu select_text_color">
			<span id="selected_color" style="margin-left: 13px;">
				<img class="default_color" src="/img/input_text_modal_colors/selected_text_color_${data.fontColor}.png">
				<img class="arrow_img icon_arrow" src="/img/icon_select_arrow.png">
			</span>
			<ul class="change_text_color">
				${textcolor_options}
			</ul>
		</div>
		<div class="input_text_modal_apply_btn" id="text_modal_apply">完了</div>
		<div class="input_text_modal_close" id="text_modal_remove"></div>
		<input type="hidden" id="save" value=""/>
		<input type="hidden" id="width" value="${nowWidth}"/>
		<input type="hidden" id="height" value="${nowHeight}"/>
	</div>`;
	$('#document_text_field').append(element);


	var target_element = `#text_form_modal[data-document_id="${currentDocumentId}"][data-page="${data.page}"][data-document_text_input_id="${data.document_text_input_id}"]`;

	// 親要素(document_text_field) へのクリックイベントの伝播を封じる [重要].
	$(target_element).on('click', function(e) {

		clickTextInputObject(e.target);
		return false; // どこをクリックしても新規要素が作られる状態になるのを止めている.
	});


	// モーダルにドラッグ・リサイズイベントを付与
	$(target_element).draggable({
		containment: '#mi_video_area',
		stop: function(event, ui) {
			let input = getInputModalData(event.target);

			event.target.style.width  = "fit-content";
			event.target.style.height = "fit-content";
			saveDocumentTextData(input, documentText => {
				sendDocumentDrawTextData({command: "DRAW_TEXT", type: 'MODIFY', input: documentText});
			});
		}
	});

	applyResizableDocumentInputUI($(target_element + ' #canvas_text_area'), false);


	// ドラックエリアがtextarea(#canvas_text_area) を包む形で作成されるので広げてやる.
	$(`${target_element} > .ui-wrapper`).css({width: data.textWidth+"px", height: data.textHeight+"px", "font-size": fitFontSize+"px", color: data.fontColor});


	// フォントサイズ変更ドロップダウン開閉イベント
	$(target_element +' .select_fontsize').on('click', function(e) {
		openCloseDropdownMenu($(target_element+' .select_fontsize'), 27.5);
	});

	// フォントサイズ変更
	$(target_element+' .change_fontsize').find('li').on('click', function(e) {

		let docScaleRange  = getDocScaleRangeValue();

		const changedFontSize = $(this).text();
		const nowFontColor = $(target_element+' #canvas_text_area').css('color');
		let textAreaWidth  = $(target_element+' #canvas_text_area').width();
		let modalAreaWidth = $(target_element+' #text_form_modal').width();
		let lines = ($(target_element+' #canvas_text_area').val() + '\n').match(/\n/g).length;

		// モーダル
		const inputModalStyle = $(target_element+' #text_form_modal').attr('style');
		$(target_element+' #text_form_modal').css({'cssText': `${inputModalStyle}`});

		// 選択済みの箇所の表記を変更
		$(target_element+' .default_fontsize').text(`${changedFontSize}px`);
		// チェック付け直し
		$(target_element+' .select_fontsize').find('li').each(function() {
			$(this).find('.checked').css('visibility', 'hidden');
		});
		$(this).find('.checked').css('visibility', 'visible');


		// テキストエリアのフォントサイズ・カラーを変更
		let fitFontSize = Math.max(10, changedFontSize*docScaleRange); // Chromeは10px Safariは9px以下を正しく表示しないので10px以下は丸める.
		let nowFontSize = parseFloat($(target_element+' #canvas_text_area').css("fontSize"));
		let nowHeight   = parseInt($(target_element+' #canvas_text_area').css("height"));
		let height = (nowHeight * fitFontSize) / nowFontSize;
		$(target_element+' #canvas_text_area').css('fontSize', fitFontSize + 'px');
		$(target_element+' #canvas_text_area').css('height', height + "px");
		$(target_element+' > .ui-wrapper').css('height', height + "px"); // textareaを包む ズーム要素も調整しないと　右下端のつまみが置き去りになる.

		resizedMinWidth = parseInt($(target_element+' #canvas_text_area').css('font-size').replace('px', '')) + 36;　// fontsize + 10だと潰れてしまうため、調整しました
	});

	// テキストカラー変更ドロップダウンの開閉イベント
	$(target_element+' .select_text_color').on('click', function(e) {
		openCloseDropdownMenu($(target_element+' .select_text_color'), 36);
	});


	// テキストカラー変更
	$(target_element+' .select_text_color').find('li').on('click', function(e) {
		const changedColor = $(this).attr('id');
		$(target_element+' #canvas_text_area').css('color', changedColor);
		$(target_element+' img.default_color').attr('src', `/img/input_text_modal_colors/selected_text_color_${changedColor}.png`);

		// チェック付け直し
		$(target_element+' .select_text_color').find('li').each(function(e) {
			$(this).find('.checked').css('visibility', 'hidden');
		});
		$(this).find('.checked').css('visibility', 'visible');
	});

	$(target_element+' #text_modal_edit').on('click', function(e) {
		onClickInputTextModalEditBtn(this.closest('#text_form_modal'));
	});

	$(target_element+' #text_modal_delete').on('click', function(e) {
		onClickInputTextModalDeleteBtn(this.closest('#text_form_modal'));
	});

	$(target_element+' #text_modal_apply').on('click', function(e) {
		onClickInputTextModalApplyBtn(this.closest('#text_form_modal'));
	});

	$(target_element+' #text_modal_remove').on('click', function(e) {
		onClickInputTextModalRemoveBtn(this.closest('#text_form_modal'))
	});


	$(target_element+' .dropdown_menu').on('click', function(e) {
		clickTextInputObject(e.target.closest("#text_form_modal"));
		return false;
	});

	$(target_element+' .input_text_modal_textarea').on('click', function(e) {
		clickTextInputObject(e.target.closest("#text_form_modal"));
		return false;
	});


}

// クリックした要素を一時的に一番手間に配置する.
function clickTextInputObject(element) {
	if(0 < $("#text_form_modal.click").length) {
		$("#text_form_modal.click").removeClass('click');
	}
	if(element.classList.contains("document_text")) {
		$(element).addClass('click');
	} else {
		$(element).parent(".document_text").addClass('click');
	}
}



// リサイズイベントを場合によっては既についている リサイズイベントを消してから付与する.
function applyResizableDocumentInputUI(target_element, isDestroy) {

	if(isDestroy) {
		$(target_element).resizable('destroy');
	}
	$(target_element).resizable({
		maxWidth: $('#mi_docment_area').innerWidth(),
		maxHeight: $('#mi_docment_area').innerHeight(),

		stop: function(event, ui) {
			event.target.style.width  = "fit-content";
			event.target.style.height = "fit-content";

			let input = getInputModalData(event.target.closest("#text_form_modal"));
			saveDocumentTextData(input, documentText => {
				sendDocumentDrawTextData({command: "DRAW_TEXT", type: 'MODIFY', input: documentText});
			});

		}
	});

}


// 状態を書き換える.
function editDocumentTextInputHtml(data) {

	let docScaleRange  = getDocScaleRangeValue();

	var target_element = `#text_form_modal[data-document_id="${currentDocumentId}"][data-page="${data.page}"][data-document_text_input_id="${data.document_text_input_id}"]`;

	// モーダルと、textareaの復元
	$(`${target_element}`).removeAttr('style');
	$(`${target_element}`).css({top: data.modalTop+"px", left: data.modalLeft+"px", width: "fit-content", height: "fit-content", padding: data.modalPadding+"px"});
	$(`${target_element} #canvas_text_area`).removeAttr('style');
	let fitFontSize = Math.max(10, data.fontSize*docScaleRange); // Chromeは10px Safariは9px以下を正しく表示しないので10px以下は丸める.
	$(`${target_element} > .ui-wrapper`).css({width: data.textWidth+"px", height: data.textHeight+"px", "font-size": fitFontSize+"px", color: data.fontColor});
	$(`${target_element} #canvas_text_area`).css({width: data.textWidth+"px", height: data.textHeight+"px", "font-size": fitFontSize+"px", color: data.fontColor});
	$(`${target_element} #canvas_text_area`).val(data.text);

	// セレクトボックスの復元.
	$(`${target_element} .default_fontsize`).html(data.fontSize+"px");
	$(`${target_element} .change_fontsize li`).each(function(e) {
		if(parseInt(this.dataset.val) == parseInt(data.fontSize)) {
			$(this).find(".fontsize_checked").css({visibility: "visible"});
		} else {
			$(this).find(".fontsize_checked").removeAttr('style');
		}
	});
	$(`${target_element} .default_color`).attr("src", `/img/input_text_modal_colors/selected_text_color_${data.fontColor}.png`)
	$(`${target_element} .change_text_color li`).each(function(e) {
		if(parseInt(this.dataset.val) == parseInt(data.fontColor)) {
			$(this).find(".fontsize_checked").css({visibility: "visible"});
		} else {
			$(this).find(".fontsize_checked").removeAttr('style');
		}
	});

	// 編集時の縦横サイズを保持しておけば、ユーザの操作で拡縮した際にサーバに問い合わせなくても計算で原寸時の値を割り出せる.
	$(`${target_element} #width`).val($("#document_canvas").width());
	$(`${target_element} #height`).val($("#document_canvas").height());

}


function resizeDocumentTextInputHtml() {

	// 場にある テキスト入力要素全部を対象に処理の実施.
	document.querySelectorAll("#text_form_modal").forEach(e=> {
		let input = getInputModalData(e);
		input = calculateBaseSizeDocumentInputTextData(input, $(e).find("#width").val(), $(e).find("#height").val());
		input = decodingCurrentSizeDocumentInputTextData(input);
		editDocumentTextInputHtml(input);
	});
}


function onClickInputTextModalEditBtn(e) {
	e.classList.remove('select_mode');
	e.classList.add('edit_mode');
	e.classList.remove('view_mode');
	e.querySelector("#save").value = JSON.stringify(getInputModalData(e)); // 元の状態に戻す為に状態を保持.
}

function onClickInputTextModalDeleteBtn(e) {
	var document_text_input_id = e.dataset.document_text_input_id;
	makeDefaultConfirmDialog("テキストを削除しますか？","資料上のテキストを削除します。<br>削除されたテキストは元に戻すことができません。", {
		z_index: 100000003,
		submit_event: function() {
			removeDocumentTextData({
				document_text_input_id: document_text_input_id
			}, res => {
				e.remove();
				sendDocumentDrawTextData({command: "DRAW_TEXT", type: 'REMOVE', input: {document_text_input_id: document_text_input_id}});
			});
		}
	});
}

function onClickInputTextModalApplyBtn(e){

	let input = getInputModalData(e);
	saveDocumentTextData(input, documentText => {
		sendDocumentDrawTextData({command: "DRAW_TEXT", type: 'MODIFY', input: documentText});
	});
	e.classList.add('select_mode');
	e.classList.remove('edit_mode');
	e.classList.remove('view_mode');
}

function onClickInputTextModalRemoveBtn(e) {

	let save = e.querySelector("#save").value;
	if(save !== "") {
		editDocumentTextInputHtml($.parseJSON(save));

		saveDocumentTextData($.parseJSON(save), documentText => {
			sendDocumentDrawTextData({command: "DRAW_TEXT", type: 'MODIFY', input: documentText});
		});

	}
	e.classList.add('select_mode');
	e.classList.remove('edit_mode');
	e.classList.remove('view_mode');
	e.querySelector("#canvas_text_area").blur(); // フォーカスを外す.
}

// リセットする.
function resetDocumentTextCurrentPage() {

	// サーバサイド削除.
	resetDocumentTextDataCurrentPage(function(res) {
		if(res.result!=false) {
			// 要素を削除.
			clearDocumentTextCurrentPage();
		}

	});
}

function clearDocumentTextCurrentPage() {
	document.querySelectorAll("#text_form_modal").forEach(e=> {
		if(e.dataset.page == currentPage) {
			e.remove();
		}
	});
}

/**
 * 資料のテキスト入力の結果を 各ページダウンロード用にpngデータにする.
 */
function makeAndUploadDocumentInputImg(event) {

	// 何も「テキスト入力」を行っていない場合は そのまま 既存の処理を「資料ダウンロード」を実行する.
	if( 0 == $(".document_text").length) {
		event();
	} else {
		// ツールの選択状態を無視して 強引に view_modeに切り替える.
		document.querySelectorAll("#text_form_modal").forEach(function(e){
			e.classList.add('view_mode');
			e.classList.add('printout_mode');
			e.classList.remove('edit_mode');
			e.classList.remove('select_mode');

			// MEMO. textareaだと htmlをCanvas(png)化するプラグイン html2canvas が改行しない、見切れるなどの不具合が起きるので回避策で div要素にする.
			let textarea = e.querySelector("textarea");
			e.insertAdjacentHTML("afterbegin", `<div id="canvas_text_area" class="input_text_modal_textarea" style="width: ${textarea.style.width}; height: ${textarea.style.height}; font-size: ${textarea.style["font-size"]}; color: ${textarea.style.color}; white-space:break-spaces;">${textarea.value}</div>`);

		});

		let pages = [];
		[...Array(getDocumentMaxPage())].map((_, _page) => {
			let page = _page + 1;
			setDocumentInputCurrentPageOnly(page);// 指定のページ以外を隠す.
			pages.push(makePromiseHtml2PngAndUploadDocumentInputImg(page));// その状態の画像を作る.
		})
		Promise.all(pages).then((responses)=> {

			// html2canvas のバグ回避の為に 一時的に textareaから作ったdivを削除する.
			document.querySelectorAll("#text_form_modal div.input_text_modal_textarea").forEach(function(e){
			    e.remove();
			})

			setDocumentInputTextElementSelectIcon(selectLeftTool); // 強引に printout_modeに切り替えたのを戻す.
			setDocumentInputCurrentPageOnly(currentPage); // 指定のページ以外を隠す.
			event();
		});
	}

}


