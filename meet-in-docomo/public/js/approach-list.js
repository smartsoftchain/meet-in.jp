/* Title:       Approach List Management
   ─────────────────────────
   Version:     1.0
━━━━━━━━━━━━━━━━━━━━━━━━━━ */

Handlebars.registerHelper('isChecked', function(checked_val, fixed_val){
	if (checked_val === fixed_val) {
        return ' checked';
    } else {
        return ''
    }
});

// ドラッグ中のコピー用画像を表示
var showDragCopyImage = function(e) {

	// マウスの位置を取得
	var x = e.clientX, y = e.clientY;
	
	// コピー用アイコンが存在していれば削除
	if (0 < $("#workItemCopyIcon").length) {
		$("#workItemCopyIcon").remove();
	}
	
	var $copyIcon = $("<img id='workItemCopyIcon' src='/img/btn_copy.png' width='30' height='30' />")
						.css({
							"position" : "fixed",
							"left"     : (x - 20),
							"top"      : (y - 20),
							"zIndex"   : 2
						});
	
	$("body").append($copyIcon);
};

// ドラッグ終了後にコピー用画像を消す
var hideDragCopyImage = function() {
	$("#workItemCopyIcon").remove();
};

// ドラッグ用のラップdivを付与する
var addWrapDiv = function(container) {
	
	// ドラッグする項目が多くなってもドラッグできるように対応。
	// ダミーの要素に入れてドラッグすると大丈夫になる。
	var dummyWrap = $("<div style='width: 300px; height: 50px;'>");
	dummyWrap.append(container);
	
	return dummyWrap;
};


// ドラッグ設定
var settingDraggable = function() {

	// フォルダ
	$('.dragFolder').draggable({
		revert: true,
		revertDuration: 200,
		helper: function() {
			var helper = $(this).clone();
			helper.css({'width':'300px'});
			return helper;
		},
		zIndex: 1
	});
	
	// フォルダ内リスト
	$('.dragFolderItem li').draggable({
		revert: true,
		revertDuration: 200,
		drag: function(e, ui) {
			showDragCopyImage(e);
		},
		stop : function() {
			hideDragCopyImage();
		},		
		helper: function() {
			var chk_name = $(this).find('input:checked').attr('name');
			var selected = $('.dragFolderItem input[name=' + chk_name + ']:checked').closest('li');
			
			// 選択されているものがない場合は、空divを返す。
			if (selected.length === 0) {
				return $("<div/>");
			}
			var container = $('<div class="disnon" />');
			container.append(selected.clone());
			
			// ドラッグ用のラップDIVを付与
			container = addWrapDiv(container);
			
			return container;
		},
		zIndex: 1
	});
	
	// 作業リスト
	$('.dragWorkListItem').draggable({
		revert: true,
		revertDuration: 200,
		drag: function(e, ui) {
			showDragCopyImage(e);
		},
		stop : function() {
			hideDragCopyImage();
		},
		helper: function() {
			
			var chk_name = $(this).find('input:checked').attr('name');
			var selected = $('.dragWorkListItem input[name=' + chk_name + ']:checked').closest('tr');
			if (selected.length === 0) {
				selected = $(this);
			}
			var container = $('<table class="disnon" />');
			var helper = selected.clone();
			helper.css({
				'background-color':'#ffffff'
			});
			
			container.append(helper);
			
			// ドラッグ用のラップDIVを付与
			container = addWrapDiv(container);
			
			return container;
		},
		zIndex: 1,
		opacity: 1.0
	});	

};

/**
 * アプリケーションリストIDをセッションに詰める。
 */
function saveApproachList(redirect_url, ui) {
	if(ui.helper.find('.dragFolder').context !== undefined){
		//フォルダごとならそのフォルダ以下全部
		var dropItems = ui.helper.find('span.chk input');
	}else{
		//チェックされた要素ならば、フォルダをまたいでチェックされたもの
		var dropItems = $("ul.submenu").children('li:has(input[type="checkbox"]:checked)').find('input');
	}
	var approachListIds = [];

	$(dropItems).each(function() {
		// 同じ番号のアプローチリストIDを入れない。
		if ($.inArray($(this).val(), approachListIds) == -1) {
			approachListIds.push($(this).val());
		}
	});

	ui.helper.remove();

	_U.showLoading();

	$.ajax({
		url: "add-search-approach-list-session",
		type: "POST",
		data: {
			"is_select"         : "1",	// セッションに追加する場合は「1」をつける。削除する場合は「0」になる。
			"is_edit_approach"  : "1",	// 別画面でアプローチ先を編集する場合は「1」をつける。
			"approach_list_ids" : approachListIds
		},
		dataType: 'json',
		success: function(result) {

			if (result !== "" && result["resultCode"] === TMO.CONST.AJAX.SUCCESS) {
				window.location.href = redirect_url;
			}
		}
	}).always(function () {
	    _U.hideLoading();
	});
}

// ドロップ設定
var settingDroppable = function() {
	
	// アプローチ実行
	$('.dropExecute').droppable({
		accept: ".dragFolder, .dragFolderItem li",
		hoverClass: "droppable-hover",
		drop: function(e, ui) {
			
			// アプリケーションリストIDをセッションに詰める。
			saveApproachList("/approach-single-telephone/approach", ui);
		}
	});
	
	// 重複チェック
	$('.dropDuplicateCheck').droppable({
		accept: ".dragFolder, .dragFolderItem li",
		hoverClass: "droppable-hover",
		drop: function(e, ui) {
			
			// アプリケーションリストIDをセッションに詰める。
			saveApproachList("/approach-list/duplicate", ui);
		}
	});
	
	// アプローチ禁止リストと照会
	$('.dropQueryBanList').droppable({
		accept: ".dragFolder, .dragFolderItem li",
		hoverClass: "droppable-hover",
		drop: function(e, ui) {

			// アプリケーションリストIDをセッションに詰める。
			saveApproachList("/approach-list/compare", ui);
		}
	});
	
	// 展開用
	$('.dropDeploy').droppable({
		accept: ".dragFolder, .dragFolderItem li",
		hoverClass: "droppable-hover",
		drop: function(e, ui) {
			if(ui.helper.find('.dragFolder').context !== undefined){
				//フォルダごとならそのフォルダ以下全部
				var dropItems = ui.helper.find('span.chk input');
			}else{
				//チェックされた要素ならば、フォルダをまたいでチェックされたもの
				var dropItems = $("#chkform").find('span.chk input:checked');
			}
			
			// アプローチリストに重複がないかチェック
			var approachListIds = [];
			$(dropItems).each(function() {
				
				// 同じ番号のアプローチリストIDを入れない。
				if ($.inArray($(this).val(), approachListIds) == -1) {
					approachListIds.push($(this).val());
				}
			});
			
			if (0 < approachListIds.length) {
				
				_U.showLoading();
				
				$.ajax({
					url: "add-search-approach-list-session",
					type: "POST",
					data: {
						"is_select"         : "1",
						"approach_list_ids" : approachListIds
					},
					dataType: 'json',
					success: function(result) {

						if (result !== "" && result["resultCode"] === TMO.CONST.AJAX.SUCCESS) {
							
							// 画面をリフレッシュ
							window.location.href = "/approach-list-manage/"
							
						} else {
							alert("アプローチリストの展開に失敗しました。");
						}
					}
				});
			}
			
			ui.helper.remove();
		}
	});


	// 削除用
	$('.dropDelete').droppable({
		accept: ".dragWorkListItem, .dragSaveListItem",
		hoverClass: "droppable-hover",
		drop: function(e, ui) {

			$.ajax({
				url: "get-approach-target-paths",
				type: "POST",
				dataType: 'json'
			}).done(
				function(treePathList){

					// アプローチ先を実際に削除する場合
					if (confirm("アプローチ先を削除しますか")) {

						$.ajax({
							url: "delete-approach-target",
							type: "POST",
							data: {
								"treePathList" : treePathList["path"]
							},
							dataType: 'json',
							success: function(result) {
								_U.hideLoading();

								if (result !== "" && result["resultCode"] === TMO.CONST.AJAX.SUCCESS) {

									alert("アプローチ先を削除しました");
									window.location.reload();

								} else {

									var errorMsgString = "";
									$.each(result["errorMsgList"], function() {
										errorMsgString += (this) + "\n\r";
									});
									alert(errorMsgString);
								}
							}
						});
					}
				}
			).fail(
				function(){
					alert("選択したアプローチ先が取得できませんでした。");
				}
			);
		}
	});
	
	// 保存ボックス⇒左リストのフォルダへ「マウスオーバー」
	$('[id^=folder]').droppable({
		accept: ".dragSaveFolder",
		over: function(e, ui) {
			// ドロップ対象がドラッグエリア外に
			var trigger = $(this).children('p.trigger');
			// アコーディオンを開く
			if($("+.submenu", trigger).css("display")=="none") {
				trigger.addClass("active-submenu");
				trigger.removeClass("none-submenu");
				$("+.submenu",trigger).slideDown( 120 );
			}
		}
	});
	
	// 左アプローチリストから左リストのフォルダへ「ドロップ」
	$('[id^=folder] p').droppable({
		accept: ".dragFolderItem li",
		hoverClass: "droppable-folder-hover",
		drop: function(e, ui) {
			// フォルダに任意で入れられるアプローチリストの最大数
			var maxFolder = 2;

			var dropItems        = $("ul.submenu").children('li:has(input[type="checkbox"]:checked)');
			var dropApproachList = dropItems.find('input[type="checkbox"]:checked');
			var toListItemAll = $(this).next("ul").find('li:has(input[type="checkbox"])');
			var toListItemCheck = $(this).next("ul").find('li:has(input[type="checkbox"]:checked)');
			
			var fromFolderId     = ui.draggable.closest(".dragFolder").data("folderId");	// 移動前フォルダ
			var toFolderId       = $(this).closest("li").data("folderId");					// 移動後フォルダ

			// 設定枚数以上に紐付けようとしたらエラー
			if(toListItemAll.length + dropApproachList.length - toListItemCheck.length > maxFolder){
				alert("紐付け最大件数は" + maxFolder + "件です");
				return false;
			}

			if (0 < dropApproachList.length) {
				
				// 選択されたアプローチターゲットIDを抽出
				var approachListIds = $.map(dropApproachList, function(elem) {
					return $(elem).val();
				});
				
				// アプローチリストを移動する
				moveApproachListToFolder(toFolderId, approachListIds, function() {
					
					// 移動先フォルダ内にアプローチリストを追加する
					$(dropItems).each(function(index) {
						
						// 移動先ではチェックされた状態を解除し、選択スタイルを外す
						$("input[type='checkbox']", this).prop("checked", false)
						$("label", this).css("background", "none");
						
						$('#folder-' + toFolderId + ' ul.dragFolderItem').append($(this));
					});
					
					// ドラッグイベントを追加
					settingDraggable();
					settingDroppable();
				});
	
				ui.helper.remove();
			}
		}
	});
	
	// 保存ボックス⇒左リスト内アプローチリスト
	$('[id^=approach-list] label').droppable({
		accept: ".dragSaveFolder",
		hoverClass: "droppable-approachlist-hover",
		drop: function(e, ui) {

			// 保存ボックスの中身
			var dropItems        = $("#saveBoxArea").find('tr:not(:first)');
			var dropApproachList = dropItems.find('input[type="checkbox"]');
			var approachListId   = $(this).closest("li").data("approachListId");

			$.ajax({
				url: "get-approach-target-paths",
				type: "POST",
				dataType: 'json',
			}).done(
				function(treePathList){
					if (0 < treePathList["id"].length) {

						// 選択されたアプローチリストのツリーパス
						var approachTreePaths = treePathList["path"];

						// 選択されたアプローチターゲットIDを抽出
						var approachTargetIds = treePathList["id"];

						if (1 < treePathList["id"].length) {
							// 重複情報削除
							approachTreePaths = $.unique(approachTreePaths);
							approachTargetIds = $.unique(approachTargetIds);
						}

						// モーダルを表示
						_U.modal("approach-target-dialog");

						// コピー処理。一度イベントを削除する
						$(document)
							.off("click", "#copy-approach-target")
							.on("click",  "#copy-approach-target", function() {
								copyApproachTarget(approachListId, approachTargetIds);
							});

						// 移動処理。一度イベントを削除する
						$(document)
							.off("click", "#move-approach-target")
							.on("click",  "#move-approach-target", function() {
								moveApproachTarget(approachListId, approachTargetIds, approachTreePaths);
							});

						ui.helper.remove();
						$(this).removeClass('droppable-approachlist-hover');
					}}
			).fail(
				function(){
					alert("選択したアプローチ先が取得できませんでした。");
				}
			);
		}
	});
};

/**
 * アプローチ先をフォルダに移動する
 * @param approachListIds
 * @param _successCallback 成功時のコールバック
 */
function moveApproachListToFolder(toFolderId, approachListIds, _successCallback) {
	
	var successCallback = _successCallback || function(){};
	
	_U.showLoading("アプローチリストを移動中です");
	
	$.ajax({
		url: "move-approach-list",
		type: "POST",
		data: {
			"after_folder_id"   : toFolderId,
			"approach_list_ids" : approachListIds
		},
		dataType: 'json',
		success: function(result) {
			
			_U.hideLoading();

			if (result !== "" && result["resultCode"] === TMO.CONST.AJAX.SUCCESS) {
				alert("アプローチリストに移動しました");
				successCallback();
			} else {
				
				var errorMsgString = "";
				$.each(result["errorMsgList"], function() {
					errorMsgString += (this) + "\n\r";
				});
				alert(errorMsgString);
			}
		}
	});
}

/**
 * アプローチ先をコピーする
 * @param approachListId
 * @param approachTargetIds
 */
function copyApproachTarget(approachListId, approachTargetIds) {
	
	$.ajax({
		url: "copy-approach-target",
		type: "POST",
		data: {
			"approach_list_id"    : approachListId,
			"approach_target_ids" : approachTargetIds
		},
		dataType: 'json',
		success: function(result) {

			if (result !== "" && result["resultCode"] === TMO.CONST.AJAX.SUCCESS) {
				alert("アプローチリストにコピーしました");
				sessionClear();
				// 画面をリフレッシュ
				window.location.href = "/approach-list-manage/?page=1";
			} else {
				
				var errorMsgString = "";
				$.each(result["errorMsgList"], function() {
					errorMsgString += (this) + "\n\r";
				});
				alert(errorMsgString);
				
				$(".modal-close").trigger("click");	// モーダルを閉じる
			}
		}
	});
}

/**
 * アプローチ先を移動する
 * @param approachListId
 * @param approachTargetIds
 */
function moveApproachTarget(approachListId, approachTargetIds, approachTreePaths) {
	
	$.ajax({
		url: "move-approach-target",
		type: "POST",
		data: {
			"approach_list_id"    : approachListId,			// 移動先のアプローチリストID
			"approach_target_ids" : approachTargetIds,		// アプローチターゲットの配列
			"approach_tree_paths" : approachTreePaths		// アプローチリスト(4)のツリーパス
		},
		dataType: 'json',
		success: function(result) {

			if (result !== "" && result["resultCode"] === TMO.CONST.AJAX.SUCCESS) {
				alert("アプローチリストに移動しました");
				sessionClear();
				// 画面をリフレッシュ
				window.location.href = "/approach-list-manage/?page=1";
			} else {
				
				var errorMsgString = "";
				$.each(result["errorMsgList"], function() {
					errorMsgString += (this) + "\n\r";
				});
				alert(errorMsgString);
				
				$(".modal-close").trigger("click");	// モーダルを閉じる
			}
		}
	});
}

function sessionClear(){
	// セッションを削除する
	$.ajax({
		url: "save-approach-id",
		type: "POST",
		data: { allFlg : false},
		success: function(result) {
		}
	});
}

/*---------------------------------------

      アプローチリスト関連（右ペイン）

-----------------------------------------*/

$(function() {
	
	// 詳細検索窓の開閉イベント
	$(document).on("click", ".detail-search-trigger", function() {
		
		var state      = $("#detail_search_flg").val() || 0;
		var toggle_val = Math.abs(state - 1);
		
		$("#detail_search_flg").val(toggle_val);
	});
	
	// 展開済みアプローチリスト削除
	$(document).on("click", ".delete-deploy-list", function() {
		
		// 対象のアプローチリストのIDを取得
		var id = $(this).data("approachListId");
		
		_U.showLoading();

		$.ajax({
			url: "add-search-approach-list-session",
			type: "POST",
			data: {
				"is_select"         : "0",
				"approach_list_ids" : [id]
			},
			dataType: 'json',
			success: function(result) {

				if (result !== "" && result["resultCode"] === TMO.CONST.AJAX.SUCCESS) {
					
					$('#deploylist' + id).fadeOut('fast', function() {
						
						// 画面をリフレッシュ。また必ず1ページ目になるようにする
						window.location.href = "/approach-list-manage/?page=1";
					});
					
				} else {
					alert("アプローチリストの削除に失敗しました。");
				}
			}
		});
	});

	
	// チェックしたアプローチ先を新規登録する場合
	$("#regist-approach-list").on("click", function(e) {
		$.ajax({
			url: "get-approach-target-paths",
			type: "POST",
			dataType: 'json'
		}).done(
			function(result){
				if (0 < result["id"].length) {
					// 選択されたアプローチターゲットIDを抽出
					var approach_target_ids = result["id"];

					$.ajax({
						url: "save-approach-target-ids",
						type: "POST",
						data: {
							"approach_target_ids" : approach_target_ids
						},
						dataType: 'json',
						success: function(result) {

							if (result !== "" && result["resultCode"] === TMO.CONST.AJAX.SUCCESS) {
								window.location.href = "/approach-list/approach-detail?registType=manage&returnFlg=0";
							} else {
								alert("アプローチ先の設定に失敗しました。");
							}
						}
					});
				} else {
					alert("アプローチ先を選択してください");
				}
			}
		).fail(
			function(){
				alert("選択したアプローチ先が取得できませんでした。");
			}
		);
	});
	
	// common.jsのイベントをオフにする
	$(document)
		.off('click', '.listtable :checkbox')
		.on('click', '.listtable :checkbox', function() {

			if($(this).hasClass("all_check")) {

				var target = $(this).closest(".listtable").find("input[type=checkbox]");

				if($(this).is(':checked')) {
			        $(target).prop('checked', true);
			    } else {
			        $(target).prop('checked', false);
			    }
			}
	    });


	// アプローチリストをチェックした際にサーバへ情報を送信する
	$("[name=check]").change(function(){

		var path = $(this).val();
		var checkFlg = 0;
		if ($(this).is(':checked')) {
			checkFlg = "1"
		}
		$.ajax({
			url: "save-approach-id",
			type: "POST",
			data: { path : path, check : checkFlg },
			//dataType: 'json',        // サーバーなどの環境によってこのオプションが必要なときがある
			success: function(arr) {
			}
		});
	});

	// 個別チェックボックス押下イベント
	$("[name=all_check]").click(function(){
		var allFlg = 0;
		if ($(this).is(':checked')) {
			allFlg = 1;
		}
		_U.showLoading("全チェック中です");
		$.ajax({
			url: "save-approach-id",
			type: "POST",
			data: { allFlg : allFlg},
			success: function(result) {
				_U.hideLoading();
			}
		});
	});


	// チェックボックスが押されたときに、common.jsの挙動を変えずにバブリングイベントが発生しないようにする。
	$(document).on("click", ".deploy-approach-list", function(e) {
		e.stopPropagation();
	});
	
	// チェックボックスが押されたときに、common.jsの挙動を変えずにバブリングイベントが発生しないようにする。
	$(document).on("click", ".save-approach-list", function(e) {
		e.stopPropagation();
	});
	
	// シフトチェック処理
	$('.deploy-approach-list').shiftcheckboxext();
});



/*---------------------------------------

           フォルダ関連（左ペイン）

-----------------------------------------*/

$(function() {
	
	/**
	 * フォルダ情報を取得し、フォルダモーダル内のコンテンツを作成する
	 */
	function getFolderInfo(folder_id) {
	
		var params = {};
		if (folder_id !== "") {
			params["folder_id"] = folder_id;
		}
		
		$.ajax({
			url: "folder",
			type: "GET",
			data: params,
			dataType: 'json',
			success: function(result) {

				if (result !== "") {

					var template = Handlebars.compile($('#folder-regist-template').html());
					
					$("#folder-regist-content").empty().append(template({
						"folder_id"       : result.folder_id,
						"folder_name"     : result.folder_name,
						"folder_auth_flg" : (result.folder_auth_flg || "1"),
						"author"          : result.author,
						"staffs"          : result.staffs
					}));
					
					// モーダル呼出
					_U.modal("folder-add");

				} else {
					alert("フォルダ情報が取得できませんでした");
				}
			}
		});		
	}
	
	// 「フォルダを追加」ボタン押下時のイベント
	$("#open-folder-add-modal").on("click", function() {
		
		// エラーメッセージを削除
		$("#folder-add .errmsg").empty().hide();
		
		getFolderInfo();
	});
	
	// 「フォルダ」の編集アイコン押下時のイベント
	$(document).on("click", ".open-folder-edit-modal", function(){
		
		// フォルダIDを取得
		var folder_id = $(this).data("folderId");
		getFolderInfo(folder_id);
	});
	
	// 現在、「フォルダーモーダル」内で設定されている値を取得する
	function _getCurrentFolderInfo(_folder_id) {
		
		var result = {};
		var folder_id = _folder_id || "";	// フォルダID初期化
		
		// フォルダID
		result["id"] = folder_id;
	
		// フォルダ名の取得
		result["name"]    = $("input[name='folder-name']").val();
		
		// アクセス
		result["auth_flg"] = $("input[name='access-right']:checked").val();
		
		var access_staff = [];
		$("input[name='access-staff']:checked").each(function(){
			access_staff.push({
				"staff_type" : $(this).data("staffType"),
				"staff_id"   : $(this).val()
			})
		});
		
		result["access_staff"] = access_staff;
		
		return result;
	}

	// 「フォルダの作成」モーダル内でで「登録」を押したときのイベント
	$(document).on("click", "#regist_folder", function(){
		
		var folder_id = $(this).data("folderId");	// 「フォルダ編集」の場合は、ここにフォルダIDが入る
		var params = _getCurrentFolderInfo(folder_id);
		
		// エラーメッセージを削除
		$("#folder-add .errmsg").empty().hide();
		
		$.ajax({
			url: "regist-folder",
			type: "POST",
			data: params,
			dataType: 'json',
			success: function(result) {

				if (result !== "") {

					// 成功の場合
					if (result["resultCode"] === TMO.CONST.AJAX.SUCCESS) {
						
						// 更新の場合は、既存のものを削除する。
						$("#folder-" + folder_id).remove();
						
						// 自分の権限を自分で外した場合を考慮。
						if (result["folder"]) {
						
							// 登録に成功したらフォルダを画面上に作成する
							var template = Handlebars.compile($('#folder-template').html());
							
							$("ul.folder-list").append(template({
								"folder_id"     : result["folder"]["id"],
								"folder_name"   : result["folder"]["name"],
								"approach_list" : result["folder"]["approach_list"]
							}));
							
							// ドラッグイベントを追加
							settingDraggable();
							settingDroppable();
						}
						
						$(".modal-close").trigger("click");
						
					} else {

						// 登録失敗
						$.each(result["errorMsgList"], function() {
							$("#folder-add .errmsg").append("<p>" + this + "</p>");
						})
						
						// エラーを表示
						$("#folder-add .errmsg").show();
					}

				} else {
					$(".modal-close").trigger("click");
				}
			}
		});	
	});
	
	// 「フォルダ」の削除アイコン押下時のイベント
	$(document).on("click", ".delete-folder", function() {
		
		// フォルダIDを取得
		var folder_id = $(this).data("folderId");
		
		if (confirm("対象のフォルダを削除します。よろしいですか？")) {
			
			$.ajax({
				url: "delete-folder",
				type: "POST",
				data: {
					"id" : folder_id
				},
				dataType: 'json',
				success: function(result) {

					if (result !== "" && result["resultCode"] === TMO.CONST.AJAX.SUCCESS) {
						
						$('#folder-' + folder_id).fadeOut('fast', function() { 
							$(this).remove(); 
						});

					} else {
						
						var errorMsg = result["errorMsg"] || "フォルダ削除に失敗しました。"; 
						alert(errorMsg);
					}
				}
			});	
		}
	});
	
	// 検索ボタンを押されたタイミングで検索をかけに行く
	$('.search-folder-name').on("click", function() {

		var name = $(this).prev("#keyword-s").val();
		var reg = new RegExp(name);
		var $self;

		// 検索前のリセット処理
		$("li.dragFolder").css("display", "none"); // フォルダをすべて非表示に
		$("li.dragFolder").children("p").addClass("none-submenu");// フォルダを非アクティブに
		$("li.dragFolder").children("p").removeClass("active-submenu");// フォルダを非アクティブに
		$("li.dragFolder").children(".submenu").css("display", "none");// フォルダをの中身を非アクティブに
		$("li[id^=approach-list]").css("display", "block");// リストを表示
		$("li[id^=approach-list]").removeClass("found");// リストの検索状態をリセット

		// 検索ワードが空なら初期状態にして終わる
		if(name == ""){
			$("li.dragFolder").css("display", "block");
			return false;
		}

		$("li.dragFolder").each(function (i) {
			$self=$(this);
			if($("p", this).text().match(reg)){
				//① フォルダが一致したら、フォルダを表示にして、リストの検索に入る
				$self.css("display", "block");

				//② 子要素のアプローチ先もヒットしたら色を付けてフォルダ展開
				$(this).find("li[id^=approach-list]").each(function (){
					if($("span.itm",this).text().match(reg)){
						$(this).addClass("found");
						$self.children("p").addClass("active-submenu");
						$self.children("p").removeClass("none-submenu");
						$self.children(".submenu").css("display", "block");
					}
				});
			}else{
				//③ フォルダ不一致で子要素のアプローチ先がヒットしたりフォルダを表示し色を付ける
				$(this).find("li[id^=approach-list]").each(function (){
					if($("span.itm",this).text().match(reg)){
						$self.css("display", "block");
						$(this).addClass("found");
						$self.children("p").addClass("active-submenu");
						$self.children("p").removeClass("none-submenu");
						$self.children(".submenu").css("display", "block");
					}else{
						$(this).css("display", "none");
					}
				});
			}
		});
	});
	
	// フォルダの編集モーダル内　選択ボタン
	$(document).on('click', '#select-access-permission', function(e) {
		
		var $span = $('span', this);
		var $area = $('#permission-members-area');
		if ($span.hasClass('dwnarw')) {
			$span.addClass('uparw');
			$span.removeClass('dwnarw');
			$area.slideDown(120);
		} else {
			$span.addClass('dwnarw');
			$span.removeClass('uparw');
			$area.slideUp(120);
		}
	});
	
	$(document).on("click", ".delete-appraoch-list", function() {
		
		var approachListId = $(this).closest("li").data("approachListId");
		
		if (confirm("対象のアプローチリストを削除します。よろしいですか？")) {
			
			$.ajax({
				url: "delete-approach-list",
				type: "POST",
				data: {
					"approach_list_id" : approachListId
				},
				dataType: 'json',
				success: function(result) {

					if (result !== "" && result["resultCode"] === TMO.CONST.AJAX.SUCCESS) {
						
						$('#approach-list' + approachListId).fadeOut('fast', function() { 
							$(this).remove(); 
						});

					} else {
						alert("アプローチリスト削除に失敗しました。");
					}
				}
			});	
		}
	});
	
	// シフトチェック処理
	$('.folder-approach-list').shiftcheckboxext();
});



/*---------------------------------------

               起動ポイント

-----------------------------------------*/

$(function() {

	/* --- ドラッグコンテンツ --- */
	settingDraggable();
	
	/* --- ドロップエリア --- */
	settingDroppable();
});
