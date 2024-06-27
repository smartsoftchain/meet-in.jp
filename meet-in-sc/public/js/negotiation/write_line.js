/*
 * キャンバスへ線を描く共通関数
 * 
 * */
const TOOL_CURSORE_SELECT = 1;				// 選択カーソル
const TOOL_CURSORE_EMPHASIS = 2;			// 強調ポインター
const TOOL_PEN_NORMAL = 3;					// ペン
const TOOL_PEN_HIGHLIGHT = 4;				// ハイライト
const TOOL_PEN_ERASER = 5;				// 消しゴム
var line = 8;								// 線の初期サイズ
var color = "#333333";						// 線の初期色
var onMouseX = 0;							// 線を描画する開始位置X
var onMouseY = 0;							// 線を描画する開始位置Y
var selectLeftTool = TOOL_CURSORE_SELECT;	// 選択中のツールステータス[1:選択カーソル, 2:強調ポインター, 3:ペン, 4:ハイライト]
var penLine = 8;							// ペンの線の大きさ
var highlightLine = 8;						// ハイライトの線の大きさ

$(function () {
	
	// ========================================================================
	// ペンの種類や色の変更関連を以下に記述
	// ========================================================================
	// ペンを選択し太く、細くする(オペレーターのみ操作可能)
	$(document).on('click', '.left_icon_pen', function(e){
		// 前回が選択カーソルか強調ポインターの場合はドラッグイベントを削除する
		if(selectLeftTool == TOOL_CURSORE_SELECT || selectLeftTool == TOOL_CURSORE_EMPHASIS){
			// 資料領域のドラッグイベント削除
			$("div#mi_docment_area").draggable('destroy');
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
		if(selectLeftTool == TOOL_CURSORE_SELECT || selectLeftTool == TOOL_CURSORE_EMPHASIS){
			// 資料領域のドラッグイベント削除
			$("div#mi_docment_area").draggable('destroy');
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
	});
	/**
	 * 強調ポインターを選択
	 */
	$(document).on('click', 'li.left_icon_pointer', function(){
		// レフトアイコンの選択アイコン変更
		changeSelectIcon(selectLeftTool, TOOL_CURSORE_EMPHASIS);
		// 強調ポインターを選択中にする
		selectLeftTool = TOOL_CURSORE_EMPHASIS;
		// 資料領域の移動イベント追加
		addDocumentAreaOperation();
	});
	
	/**
	 * 消しゴムを選択
	 */
	$(document).on('click', 'li.left_icon_eraser', function(){
		// 前回が選択カーソルか強調ポインターの場合はドラッグイベントを削除する
		if(selectLeftTool == TOOL_CURSORE_SELECT || selectLeftTool == TOOL_CURSORE_EMPHASIS){
			// 資料領域のドラッグイベント削除
			$("div#mi_docment_area").draggable('destroy');
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
					$(this).css("cursor", "");
				}else if(selectLeftTool == TOOL_PEN_NORMAL || selectLeftTool == TOOL_PEN_HIGHLIGHT){
					// ペンアイコン
					if(getBrowserType() != "IE"){
						$(this).css("cursor", "url('../img/pen_upward.cur'), pointer");
					}else{
						$(this).css("cursor", "url('../img/pen_downward.cur'), pointer");
					}
				}else if(selectLeftTool == TOOL_PEN_ERASER){
					if(getBrowserType() != "IE"){
						$(this).css("cursor", "url('../img/icon_eraser_pointer.cur'), pointer");
					}else{
						$(this).css("cursor", "url('../img/icon_eraser_pointer.cur'), pointer");
					}
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
	// パスを閉じる
	context.closePath();
	// 現在のパスを輪郭表示する
	context.stroke();
	// 次回の描画のために現在の座標を設定する
	onMouseX = localDrowX;
	onMouseY = localDrowY;
}

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
	}else if(oldSelectIcon == TOOL_PEN_NORMAL){
		$(".left_icon_pen").removeClass("on_left_icon");
	}else if(oldSelectIcon == TOOL_PEN_HIGHLIGHT){
		$(".left_icon_highlight").removeClass("on_left_icon");
	}else if(oldSelectIcon == TOOL_PEN_ERASER){
		$(".left_icon_eraser").removeClass("on_left_icon");
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
	}
}