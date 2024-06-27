/*
 * 資料共有に使用するJS群
 *
 * */
// 現在表示中の資料
var currentDocumentId = 0;
// 現在表示中のページ
var currentPage = 0;

const SCROLL_MARGIN = 20;					// スクロールバーの領域

var orgCanvasWidth = 800;		// キャンバスのデフォルトサイズ幅
var orgCanvasHeight = 530;		// キャンバスのデフォルトサイズ丈

var canvasWidth = 800;			// キャンバスの実サイズ幅
var canvasHeight =  530;		// キャンバスの実サイズ丈

var docWidth, docHeight;		// 資料の最初の表示幅, 高さ

var codumentViewState = 1;			// 資料表示の倍率 1: 100%, 2: 200%, 0.5: 50% 等

var viewDocumentWhenVideoTop = 250;			// 資料表示時のビデオTOP表示位置
var viewDocumentWhenVideoRight = 124;		// 資料表示時のビデオRight表示位置

var guestTop = 0;
var guestLeft = 0;

const HIDE_ICON_FLG = 1;					// 資料のアイコン非表示フラグ
const SHOW_ICON_FLG = 0;					// 資料のアイコン表示フラグ

const DEFAULT_THUMBNAIL_UL_WIDTH = 170;		// サムネイル表示領域のULデフォルト幅
const MAX_THUMBNAIL_VIEW_COUNT = 3;			// 資料サムネイルの最大表示件数（超えた場合はスクロール表示）
const THUMBNAIL_LI_WIDTH = 50;				// サムネイルのLI幅の目安

var syncUserDict = {};						// 資料で同期が必要なユーザーIDを保存する
const RESPONSE_FLG = 1;						// レスポンス有り
const NO_RESPONSE_FLG = 0;					// レスポンス無し
var syncDocumentTimeoutId = null;			// ドキュメントの同期時に設定するタイマーID
var syncDocumentLoadTimeoutId = null;		// 画像を複数読み込む場合に設定するタイマーID
const NO_NOTIFICATION = null;				// 資料表示時にレスポンス通知を行わない場合の値
const MAX_SYNC_TIMER = 10000;				// 同期の最大時間は10秒
const MIN_SYNC_TIMER = 1000;				// 同期の最少時間は1秒
var syncMaterialScrollFlg = 0;				// 資料のスクロール同期フラグ
const MESSAGE_TIMER = 5000;					// 資料を保存できない場合に表示するメッセージの秒数
const IMG_LOAD_WAIE_TIMER = 1000;			// 別資料読み込み中の場合の待ち時間1秒
var dragMaterialId = 0;						// IEの場合.setData()でエラーが発生するのでグローバル変数にデータを保持させる
var currentZoomValue = 1.0;

// ダウンロードが存在しない場合 63px
// コメントが存在しない場合	50px
// 前/後が存在しない場合のそれぞれの組み合わせを考える 86px
const sideBarDisplayCss = {
	'1' : {
		'#doc_scale_zoomin' : {'display' : 'block', 'top' : '204px'},
		'#doc_scale_range' : {'display' : 'block', 'top' : '280px', 'left' : '50px'},
		'#doc_scale_zoomout' : {'display' : 'block', 'top' : '310px'},
		'#doc_scale_value' : {'display' : 'block', 'top' : '340px'},
		'#mi_scroll_arrow_left' : {'top' : '416px', 'left' : '50px'},
		'#mi_scroll_arrow_right' : {'top' : '459px', 'left' : '50px'},
		'.page_content' : {'top' : '383px', 'left' : '50px'},
		'#document_zoom_btn' : {'display' : 'none'},
		'#img_document_comment' : {'top' : '130px', 'left' : '50px'},
	},
	'2' : {
		'#doc_scale_zoomin' : {'display' : 'none', 'top' : '204px'},
		'#doc_scale_range' : {'display' : 'none', 'top' : '280px', 'left' : '50px'},
		'#doc_scale_zoomout' : {'display' : 'none', 'top' : '310px'},
		'#doc_scale_value' : {'display' : 'none', 'top' : '340px'},
		'#mi_scroll_arrow_left' : {'top' : '251px', 'left' : '50px'},
		'#mi_scroll_arrow_right' : {'top' : '294px', 'left' : '50px'},
		'.page_content' : {'top' : '218px', 'left' : '50px'},
		'#document_zoom_btn' : {'top' : '174px', 'left' : '50px', 'display' : 'block'},
		'#img_document_comment' : {'top' : '130px', 'left' : '50px'},
	}, 
	'3' : {
		'#doc_scale_zoomin' : {'display' : 'none', 'top' : '204px'},
		'#doc_scale_range' : {'display' : 'none', 'top' : '280px', 'left' : '50px'},
		'#doc_scale_zoomout' : {'display' : 'none', 'top' : '310px'},
		'#doc_scale_value' : {'display' : 'none', 'top' : '340px'},
		'#mi_scroll_arrow_left' : {'top' : '20px', 'left' : '0px'},
		'#mi_scroll_arrow_right' : {'top' : '63px', 'left' : '0px'},
		'.page_content' : {'top' : '-12px', 'left' : '0px'},
		'#document_zoom_btn' :  {'top' : '174px', 'left' : '50px', 'display': 'block'},
		'#img_document_comment' : {'top' : '130px', 'left' : '50px'},
	}
}

// 資料のキー名だけを保存するセッションストレージ
var sessionStorageKeys = $.parseJSON(sessionStorage.getItem("mtSessionStorageKeys"));
if(!sessionStorageKeys){
	sessionStorageKeys = [];
}
var materialBasicList = []; // 取得した資料一覧を保存する配列
var materialsId = []; // 選択した資料を管理する配列
var maxMaterialsNumber = 5; // 一度に選択可能な資料の数

// 資料領域のリサイズ時
var sideBarDisplayStyle = 1;
var paddingSize = 0;
var materialLeft = 0;

$(function () {
	// =====================================================================================================
	// tooltipの初期化
	// =====================================================================================================
	$('.material_button_tooltip').tooltipster({
		contentAsHTML: true,
		interactive: true,
		animation: 'fade',
		trigger: 'none',
		arrow : false,
		theme: 'tooltipster-light',
		content: '資料が追加されました',
		functionPosition: function(instance, helper, position) {
			position.coord.top -= 10; /* ここでtopの位置をオフセット変更 */
			return position;
		}
	});

	// =====================================================================================================
	// 資料選択モーダル関連のイベント
	// =====================================================================================================

	// 資料選択モーダル表示
	$(document).on('click', '.show_material_modal', function(){
		materialsId = [];
		materialBasicList = [];
		// サーバーから資料共有のファイル情報を取得する
		$.ajax({
			url: "https://" + location.host + "/negotiation/get-modal-material-list",
			type: "GET",
			data: {},
			success: function(resultJson) {
				let result = $.parseJSON(resultJson);
				// material_typeの値をここで判別するkeyを追加する
				for(var i = 0; i < result.length; i++){
					switch(result[i]["material_type"]) {
						case "0":
							result[i]["type_0"] = true;
							break;
						case "1":
							result[i]["type_1"] = true;
							break;
						case "2":
							result[i]["type_2"] = true;
							break;
						case "3":
							result[i]["type_3"] = true;
							break;
						default:
							break;
					}
					materialBasicList.push(result[i]);
				}

				// モーダル内のタグを削除する
				$("div.inner-wrap").empty();
				// テンプレート生成
				let template = Handlebars.compile($('#material-select-modal-template').html());
				// モーダルに内容をセットする
				$('div.inner-wrap').append(template({
					"materialBasicList" : materialBasicList,
				}));
				// モーダルの表示
				$("#modal-content").show();
				// モーダルを表示する為のクリックイベントを発生させる
				$('.modal-open').trigger("click");

			}
		});
			// メニューを閉じるために疑似クリックを発生させる
			$("div#negotiation_right_menu_button").trigger('click');
	});

	/**
	 * ============= 資料検索窓関連のイベント ================
	 */

	/**
	 * 資料検索窓のクリアボタンを押した場合のイベント
	 */
	$(document).on('click', '.search_close_button', function() {
		const inputBox = $('[name=free_word]');
		inputBox.val('');
		searchMaterials();
	});

	/**
	 * 資料検索窓の検索アイコンを押した場合のイベント(検索を実行する)
	 */
	$(document).on('click', '.search_button', searchMaterials);

	/**
	 * 資料検索窓でEnterを押した場合のイベント(検索を実行する)
	 */
	$(document).on('keypress', '.text_search', function(e) {
		if (e.which === 13) {
			searchMaterials();
		}
	});

　/**
	 * 検索窓に入力した値に応じて、資料選択リストの資料名を検索する関数
	 * @argument なし
	 * @return void 戻り値なし
	 */
	function searchMaterials() {
			// 入力値を取得
			const inputText = $('[name=free_word]').val();

			$('.material_name').each(function() {
				// リストの資料名を取得
				const targetText = $(this).text();

				// 検索対象の資料名リストに、入力した文字列が存在するかを判別
				const materialElem = $(this).parents('.modal_material');
				if(targetText.indexOf(inputText) !== -1) {
					materialElem.removeClass('hidden');
				} else {
					materialElem.addClass('hidden');
				}
			})
	}

	/**
	 * ============ 資料選択関連のイベント ============
	 */

	/**
	 * 資料のチェックボックスが押下された場合のイベント
	 */
	$(document).on('click', '.material_check', function() {
		// 押下されたチェックボックスを含む行全体の要素を取得
		const checkedMaterial = $(this).closest('.modal_material');
		if(!$(this).prop('checked') ) {
				// チェックされていない場合 => チェックをつける、背景着色
				$(this).prop('checked', true);
				checkedMaterial.addClass('checked_color');
				// チェックしたidを配列に追加
				if (!materialsId.includes($(this).val())) {
					materialsId.push($(this).val());
				}
		} else {
			// チェックされている状態の場合 => チェックを外す、背景着色解除
			$(this).prop('checked', false);
			checkedMaterial.removeClass('checked_color');
			// チェック外したidを配列から削除
				materialsId = materialsId.filter(id => id !== $(this).val());
		}
		toggleCheckLock(materialsId, maxMaterialsNumber);
	});

	/**
	 * 資料の行が押下された場合のイベント
	 */
	$(document).on('click', '.modal_material', function(){
		// 押下された子要素のチェックボックスの要素を取得
		const material_check = $(this).children('.material_check');
		if(!material_check.prop('checked') && !$(this).hasClass('locked')) {
				// チェックされていない場合 => チェックをつける、背景着色
				material_check.prop('checked', true);
				$(this).addClass('checked_color');
				// チェックしたidを配列に追加
				if(!materialsId.includes(material_check.val())) {
					materialsId.push(material_check.val());
				}
		} else {
				// チェックされている状態の場合 => チェックを外す、背景着色解除
				material_check.prop('checked', false);
				$(this).removeClass('checked_color');
				// チェック外したidを配列から削除
				materialsId = materialsId.filter(id => id !== material_check.val());
		}
		toggleCheckLock(materialsId, maxMaterialsNumber);
	});

		/**
	 * 資料のチェック数に応じて、チェックdisabled,チェック不可用classを切り替える関数
	 * @argument array チェックIDを格納した配列
	 * @argument maxCheckNumber チェックの上限数
	 * @return void 戻り値なし
	 */
	function toggleCheckLock(array, maxCheckNumber) {
		if(array.length >= maxCheckNumber) {
			// 上限より大きい場合 disabledとlockedクラス（css）を付与
			$('.material_check').each(function() {
				if(!$(this).prop('checked')) {
					$(this).prop('disabled', true);
					$(this).closest('.modal_material').addClass('locked');
					$(this).next().closest('.modal_material_icon').addClass('locked_img');
				}
			})
		} else {
			// 上限以下の場合付与したdisabledとクラスを解除
			$('.material_check').each(function() {
				if(!$(this).prop('checked')) {
					$(this).prop('disabled', false);
					$(this).closest('.modal_material').removeClass('locked');
					$(this).next().closest('.modal_material_icon').removeClass('locked_img');
				}
			})
		}
	}

	/**
	 * ファイル選択ボタンが押下された場合のイベント
	 */
	$(document).on('click', '[name=material_select]', function(){
		var materialSelectedListForSetting = [];　// 設定（ダウンロードフラグ）用資料リスト
		const clientId = parseInt($('#client_id').val());
		const staffRole = $('#staff_role').val();

		// 選択した資料に選択済みのものがあるかを判定
		var isDuplicatedMaterial = false;

		if(materialsId.length > 0){
			var newMaterialsId = [];
			materialsId.forEach(function(materialId){
				// 新規に選択された資料を格納する配列
				// キーを作成
				var keyName = "materialId_" + materialId;

				// ブラウザのセッションストレージからデータ取得
				var mtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));

				// 既に選択されていないかを判定
				if(!mtSessionStorage){
					newMaterialsId.push(materialId);
				} else{
					isDuplicatedMaterial = true;
				}
			});

			// if(newMaterialsId.length > 0) {
				// 設定（ダウンロードフラグ）用資料リストを作成（選択した資料idに対象を絞る）
				materialSelectedListForSetting = materialBasicList.filter( materialSelected => {
					// URL はダウンロード不要なため、material_type: 1 を弾く
					return (materialsId.includes(materialSelected.material_id) && materialSelected["material_type"] !== 1);
				});


			// URLのみ選択でmaterialSelectedListForSettingの数が　0の場合、資料情報設定モーダルは開けない
			if(materialSelectedListForSetting.length > 0) {

				loadMaterials(materialsId);

				// MEMO. 以前は「ダウンロード表示」という download_flg フラグがあり、 ゲストに「ダウンロード」UIを表示するかをコントロースしており、 複数資料を選択した場合、それぞれがDLボタンを表示 可か否かを設定するテンプレートが存在した.
				/*
				//資料共有設定モーダルを開く
				// モーダル内のタグを削除する
				$("div.inner-wrap").empty();
				// テンプレート生成
				var template = Handlebars.compile($('#material-share-setting-modal-template').html());
				// モーダルに内容をセットする
				$('div.inner-wrap').append(template({
					"materialSelectedListForSetting" : 	materialSelectedListForSetting,
				}));
				// 設定画面にて設定したダウンロード可否をモーダルの項目に反映する
				materialSelectedListForSetting.forEach(function(selectedMaterial){
					const materialId = selectedMaterial['material_id'];
					const downloadFlg = selectedMaterial['download_flg']
						if(downloadFlg === 1) {
							$(`.radio_material_${materialId}:eq(0)`).prop('checked', true);
						} else if (downloadFlg === 0) {
							$(`.radio_material_${materialId}:eq(1)`).prop('checked', true);
						}
				});
				// モーダルの表示
				$("#modal-content").show();
				// モーダルを表示する為のクリックイベントを発生させる
				$('.modal-open').trigger("click");
				*/
			} else if (materialSelectedListForSetting.length === 0) {
				// materialsId（選択した資料）中
				// materialSelectedListForSetting(選択した資料から URLを弾いたもの)が０ === 選択したものが全てURLを指す
				// 場合は設定画面に遷移させず、そのまま資料追加する。

				// 一つ前の資料選択ダイアログで選択した資料を取得する。
				loadMaterials(materialsId);
			}
		// }
		// else {
		// 	//資料完全重複エラーメッセージ
		// 	alert("既に選択された資料です。");
		// 	isDuplicatedMaterial = false;
		// }
			//重複資料エラーメッセージ
			if (isDuplicatedMaterial) {
				alert("既に選択された資料です。");
			}
		}else{
			alert("資料を選択して下さい。");
		}
	});

	/**
	 * 資料を１件ずつ取得する関数
	 * @param {array} materialsId 選択した資料idの配列
	 */
	function loadMaterials(materialsId) {
		if(materialsId.length > 0){
			materialsId.forEach(function(materialId){
				// // キーを作成
				var keyName = "materialId_" + materialId;

				// ブラウザのセッションストレージからデータ取得
				var mtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));

				// 既に選択されていないかを判定
				if(!mtSessionStorage){
					// サーバーから資料を１件取得する（選択されてないもののみ）
					var staffType = $("#staff_type").val();
					var staffId = $("#staff_id").val();
					var clientId = $("#client_id").val();
					var uuId = localStorage.UUID;
					if( !uuId ) {	// 空
						uuId = UUID.generate();
						localStorage.UUID = uuId;
					}
					materialIdNum = materialId.replace('materialId_', '');
					getMaterial(materialIdNum, $('#user_id').val(), staffType, staffId, clientId, uuId);

					// tooltip表示
					$('.material_button_tooltip').tooltipster('open');
					// アップロードメッセージを消すためのタイマーを設定
					setTimeout(function(){
						$('.material_button_tooltip').tooltipster('close');
					}, MESSAGE_TIMER);
				}
			});
		}
	}

		/**
	 * ダウンロード表示のラジオボタンが押下された場合のイベント
	 */
	$(document).on('click', '.input_radio', function(){
		if(!$(this).prop('checked')) {
			$(this).prop('checked', true);
		} else {
			$(this).prop('checked', false);
		}
	});

	/**
	 * ダウンロード表示の行が押下された場合のイベント
	 */
	$(document).on('click', '.download_select_area', function(){
		const flgRadioCheck = $(this).children('input:radio');
		if(!flgRadioCheck.prop('checked')) {
			flgRadioCheck.prop('checked', true);
		} else {
			flgRadioCheck.prop('checked', false);
		}
	});

	$(document).on('click', '[name=material_select_setting]', function(){
		// サーバーに設定した情報を送信する

		// ダウンロードフラグ更新処理

		// 送信データ
		var formData = $('form').serializeArray();
		// コントローラー呼んで、コントローラー内で、materialDao(model)のsetMaterialを実行
		$.ajax({
				url: "https://" + location.host + "/negotiation/set-material-download-option",
				type: "POST",
				data: formData,
				dataType: 'json',
				success: function(resultJson) {

					// 一つ前の資料選択ダイアログで選択した資料を取得する。
					// こちらでは、エラー表示しない。先に表示しているため。
					if(materialsId.length > 0){
						materialsId.forEach(function(materialId){
							// // キーを作成
							// var keyName = "materialId_" + materialId;

							// // ブラウザのセッションストレージからデータ取得
							// var mtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));

							// 既に選択されていないかを判定
							// if(!mtSessionStorage){
								// サーバーから資料を１件取得する（選択されてないもののみ）
								var staffType = $("#staff_type").val();
								var staffId = $("#staff_id").val();
								var clientId = $("#client_id").val();
								var uuId = localStorage.UUID;
								if( !uuId ) {	// 空
									uuId = UUID.generate();
									localStorage.UUID = uuId;
								}
								materialIdNum = materialId.replace('materialId_', '');
								getMaterial(materialIdNum, $('#user_id').val(), staffType, staffId, clientId, uuId);

								// tooltip表示
								$('.material_button_tooltip').tooltipster('open');
								// アップロードメッセージを消すためのタイマーを設定
								setTimeout(function(){
									$('.material_button_tooltip').tooltipster('close');
								}, MESSAGE_TIMER);
							// }
						});
					}
				}
			});

	});

	/**
	 * 資料選択及び資料情報設定ダイアログでキャンセルが押下された場合のイベント
	 */
	$(document).on('click', '[name=material_cancel]', function(){
		// モーダルの内容を削除する
		$("div.inner-wrap").empty();
		// モーダルを閉じる
		$("#modal-content").hide();
	});

	/**
	 * 資料ズームの決定が押された場合
	 */
	$(document).on('click', '[name=material_zoom_select]', function(){
		// ズーム処理
		if($('#modal-content').find('[name=materia_zoom_type]:checked').val() == 999) {
			currentZoomValue = $('#modal-content').find('[name=materia_zoom_value]').val() / 100;
		} else {
			currentZoomValue = $('#modal-content').find('[name=materia_zoom_type]:checked').val() / 100;
		}
		resizeDocumentExecute();

		// モーダルの内容を削除する
		$("div.inner-wrap").empty();
		// モーダルを閉じる
		$("#modal-content").hide();

		setTimeout(function(){
			sideBarUpdate(true)
		}, 1000);

	});

	// =====================================================================================================
	// サムネイル操作関連のイベント
	// =====================================================================================================
	/**
	 * サムネイル画像ホバー時の処理
	 */
	$(document).on({
		"mouseenter": function(){
			// 画像の要素を探す
			var imgTag = $(this).find("img");
			// アトリビュート取得
			var src = imgTag.attr("src");
			var alt = imgTag.attr("alt");

			// 拡大画像表示領域を作成する
			bigThumbnailImage = '<div class="big_thumbnail_area bottom_arrow"><img src="'+src+'" alt="'+alt+'" class="big_thumbnail_image"/></div>';
			$(this).closest("li").append(bigThumbnailImage);

			// サムネイルの位置を取得し、拡大画像の位置を調節する
			var liOffset =  $(this).closest("li").offset();
			$("div.big_thumbnail_area").css("left", liOffset.left);

		},
		"mouseleave": function(){
			// 拡大画像を削除する
			$("div.big_thumbnail_area").remove();
		}
	}, ".thumbnail_image");

	// サムネイルの移動ボタンを押下した場合のイベント処理
	$("[id^=move_thumbnail_]").click(function(){
		// 現在のスクロール位置を取得
		var scrollLeft = $("div#negotiation_bottom_document_select").scrollLeft();
		// どちらにスクロールするかの判定
		if($(this).attr("id") == "move_thumbnail_prev"){
			// 左にスクロール
			scrollLeft -= 30;
			$("div#negotiation_bottom_document_select").scrollLeft(scrollLeft);
		}else{
			// 右にスクロール
			scrollLeft += 30;
			$("div#negotiation_bottom_document_select").scrollLeft(scrollLeft);
		}
	});

	// =====================================================================================================
	// 資料に関するイベント
	// =====================================================================================================
	/**
	 * 資料のページ移動
	 */
	//ボタンの高速連打を制御するためのフラグを用意
	var clickFlag = true;
	$(document).on('click', '[id^=mi_scroll_arrow]', function(){
		if(clickFlag){
			//制御フラグを立てる
			clickFlag = false;

			// 次の資料を表示前に現在の資料を保存する
			//saveDocument();

			// 表示ページを設定
			if($(this).attr("id") == "mi_scroll_arrow_left"){
				if(currentPage == 1){
					clickFlag = true;
					return false;
				}
				currentPage--;
			}else{
				if(currentPage == getDocumentMaxPage()){
					clickFlag = true;
					return false;
				}
				currentPage++;
			}
			// 資料を表示
			loadDocument(NO_NOTIFICATION, 0 ,0);

			// ページャーの表示切替
			viewPager(SHOW_ICON_FLG);

			// ページ変更の同期処理
			syncMoveDocument();

			clickFlag = true;

			// サイドバーのアップデート
			setTimeout(function(){
				sideBarUpdate(true);
			}, 500);

		}else{
			return false;
		}
	});

	/**
	 * 資料がURLの場合は画像表示後、キャンバス領域をクリックでURL先を別ウインドウで表示する
	 */
	$(document).on('click', 'canvas#document_canvas', function(){
		var url = getDocumentUrl();
		if(url){
			// URLの資料を展開中の場合は別ウインドウでURL先を表示する
			window.open(url, '_blank');
		}
	});

	/**
	 * コメントの表示
	 */
	$(document).on('click', 'div#img_document_comment', function(){
		if(!$("p.mi_document_note").is(':visible')){
			// コメントが非表示の場合は表示する
			// メモを取得
			var materialMemo = getMaterialMemo();
			if(materialMemo){
				// コメントが存在する場合はコメントを設定し表示する
				$("p.mi_document_note").text(materialMemo);
				$("p.mi_document_note").show();
			}else{
				alert("コメントが設定されていません");
			}
		}else{
			// コメントが表示されていれば非表示にする
			$("p.mi_document_note").hide();
		}
	});

	/**
	 * 資料のダウンロード
	 */
	$(document).on('click', 'div#document_download', function(){

		if(!isCheckDocumentOwner()) {
			return false;
		}

		// MEMO. ダウンロードは資料を提供したユーザだけが実行できる. ソレ以外のユーザにはボタンがない 持ち主がボタンを押した時にダウンロードが勝手に始まる.

		// 現在の書き込みの状態を保存(タイムラグがある) サーバへの保存処理は一回だけでいいので ボタンを押したユーザの時に実施する.
		saveDocument();
		makeAndUploadDocumentInputImg(function() {

			var data = {
			 command : "DOCUMENT",
			 type : "DOWNLOAD_SHARE",
			 document: {
				materialId:currentDocumentId,
				clientId:$("#client_id").val(),
				staffType:$("#staff_type").val(),
				staffId:$("#staff_id").val(),
				connectionInfoId:$("#connection_info_id").val()
			 }
			};
			sendCommand(SEND_TARGET_ALL, data);
			makeDefaultConfirmDialog(
				"資料をダウンロードしますか？",
				"共有した資料をダウンロードできます。", {
				checkbox: "書き込みを表示した状態でダウンロードする",
				default_checkbox: true,
				submit_event: function() {
					$("div.upload_document_message").text("ダウンロード中です");
					$("div.upload_document_message_area").show();
					let isOriginal = !$("#mi_confirm_dialog_checkbox_val").prop("checked"); // チェックボックスの状態を取得 trueの場合はペン書き済みデータを希望.
					downloadDocument(currentDocumentId,$("#client_id").val(),$("#staff_type").val(),$("#staff_id").val(),$("#connection_info_id").val(),isOriginal);
				},
				z_index:100000010
			});
		});

	});


	/**
	 * ペンの書き込みをリセット
	 */
	 $(document).on('click', '#document_pen_reset', function() {
		 if(window.confirm("ペン描きした内容を全て削除します")) {
			 // ペンの書き込みをリセット
			 resetPen();
			 resetDocumentTextCurrentPage();
			 // 相手と同期する
			 var data = {
				 command : "DOCUMENT",
				 type : "RESET_PEN"
			 };
			 sendCommand(SEND_TARGET_ALL, data);
		 }
		  // テキスト入力モード時はモーダルが出現してしまうため消去する
		if(selectLeftTool == TOOL_DRAW_TEXT){
			$(".document_canvas_contents").find('#text_form_modal').remove();
		}
	 });

	/**
	 * 資料を閉じる
	 * 資料にビデオを被せてると消える挙動をクリックで再現する.
	 */
	 $(document).on('click', '#document_close', function(e) {

		if($("div#mi_docment_area").is(':visible')){
			// 資料を非表示にする
			hideDocumentCommon();
			// 資料の領域を非表示にする
			$("div#mi_docment_area").hide();

			// 資料レイアウトをリセットする
			resetMaterialLayout();

			$("#header_video_reset").trigger('click');　// レイアウトを元に戻す.

			// 相手と同期する
			sendCommand(SEND_TARGET_ALL, {command : "DOCUMENT", type : "CLOSE_DOCUMENT"});

			// SPユーザーに画像の非表示通知を行う
			sendCommand(SEND_TARGET_ALL, {command : "DOCUMENT", type : "SP_HIDE_DOCUMENT"});
		}
		//　親要素にクリックイベントが伝わってしまうのを防ぐ
		e.stopPropagation();
	 });


	/**
	 * キャンバスのスクロールイベント
	 */
	$("div#mi_docment_scroll").on("scroll", function() {
		// 他のユーザーのスクロール情報と同期時は、自身のスクロールイベントを発生させない
		if(syncMaterialScrollFlg == 0){
			// 資料の表示割合を計算する
			var proportionSize = getProportion();
			// スクロール位置を取得
			var scrollTop = $("div#mi_docment_scroll").scrollTop();
			var scrollLeft = $("div#mi_docment_scroll").scrollLeft();
			var data = {
					command : "DOCUMENT",
					type : "SCROLL_DOCUMENT",
					scrollTop : scrollTop / proportionSize,
					scrollLeft : scrollLeft / proportionSize
			};
			sendCommand(SEND_TARGET_ALL, data);

			// リサイズアイコンの位置を変更する
			changeResizeIconOffset(scrollTop, scrollLeft, 0);
		}else{
			// 同期された後にスクロールイベントが発生するので、その後フラグを落とす
			syncMaterialScrollFlg = 0;
		}
	});

	// 資料領域にホバー時のみ資料ヘッダーアイコンとページ変更アイコンを表示する
	$("div#mi_docment_area").hover(
		// マウスオーバーの処理
		function () {

			// データを取得する為のキーを作成する
			var keyName = "materialId_" + currentDocumentId;
			// ブラウザのセッションストレージからデータ取得
			var mtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));
			if(!mtSessionStorage[keyName]["material_basic"]["material_url"]){
				// ダウンロードアイコンを表示にする
				$("div#document_header_icon").show();
			}
			// ページ変更アイコンの表示
			viewPager(SHOW_ICON_FLG);

		},
		// マウスアウトの処理
		function () {
			// ダウンロードアイコンなどの非表示
			$("div#document_header_icon").hide();
			// ページ変更アイコンの非表示
			//viewPager(HIDE_ICON_FLG);
		}
	);

	// =====================================================================================================
	// 左メニューに関するイベント
	// =====================================================================================================
	/**
	 * 目次の表示
	 */
	$(document).on('click', '.left_icon_content', function(){
		// 資料を表示している場合のみ目次を表示する
		if($("div#mi_docment_area").is(':visible') && currentDocumentId != 0){
			if(!$("#mi_contents_display").is(':visible')){
				// トグル非表示の場合は表示
				// 全資料を画像化する
				var keyName = "materialId_" + currentDocumentId;
				// ブラウザのセッションストレージからデータ取得
				var mtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));
				// 資料の最大数を取得
				var maxPageCount = mtSessionStorage[keyName]["material_detail"].length;
				// ドロップした資料のハッシュキーを取得
				var materialIdHash = mtSessionStorage[keyName]["material_basic"]["md5_file_key"];

				// 画像を追加する前にulのデータを全て削除しておく
				$("div.mi_tag_list ul").empty();

				// 目次用画像を追加する
				for(var i = 0; i < maxPageCount; i++){
					// ページ番号を取得
					var pageNumber = mtSessionStorage[keyName]["material_detail"][i]["material_page"];
					// ファイルパスを作成
					var pageKey = "page" + mtSessionStorage[keyName]["material_detail"][i]["material_page"];
					var filePath = "/cmn-data/" + mtSessionStorage[keyName]["canvas_document"]["document"][pageKey]["fileName"];
					// altを作成
					var alt = mtSessionStorage[keyName]["material_detail"][i]["material_title"];
					// タグを作成
					var liTag = '<li id="'+pageNumber+'">';
					if(mtSessionStorage[keyName]["material_detail"][i]["material_tag_flg"] == 1){
						// 付箋有り
						liTag += '<div class="document_tag"></div>';
					}
					if(mtSessionStorage[keyName]["material_detail"][i]["material_memo"]){
						// コメント有り
						liTag += '<div class="document_comment"><img src="/img/1px_comment.svg" class="img_document_comment" alt="コメント"/></div>';
					}
					liTag += '<img src="'+filePath+'" alt="'+alt+'"/><div>'+pageNumber+'P</div></li>';
					// liタグを追加する
					$("div.mi_tag_list ul").append(liTag);
				}
				// 目次を表示する
				$("#mi_contents_display").show();
				setTimeout(function(){
					$("#mi_contents_display").addClass("mi_onview");
				}, 200);
			}else{
				// 目次を表示している場合は非表示にする
				$("#mi_contents_display").removeClass("mi_onview");
				setTimeout(function(){
					$("#mi_contents_display").hide();
				}, 300);
			}
		}
	});
	/**
	 * 目次の画像を選択
	 */
	$(document).on('click', 'div.mi_tag_list li', function(){
		// 次の資料を表示前に現在の資料を保存する
		saveDocument();
		// 表示する資料のページ番号を取得
		currentPage = $(this).attr("id");
		// 資料を表示
		loadDocument(NO_NOTIFICATION, 0, 1);
		// ページ変更の同期処理
		syncMoveDocument();
	});

	/**
	 * 目次を非表示する
	 */
	$(document).click(function(event) {
		// 目次表示時（mi_onviewもつ） && 目次以外をクリックで非表示にする
		if ($('#mi_contents_display').hasClass('mi_onview') 
			&&!$(event.target).closest('#mi_contents_display').length) {
			$("#mi_contents_display").removeClass("mi_onview");
			setTimeout(function(){
				$("#mi_contents_display").hide();
			}, 300);
		}
	});

	/**
	 * 目次のページ移動
	 * 最左又は最右に移動した場合でもイベントを拾いスクロールを行う簡易な作りになっている
	 */
	$(document).on('click', '[id^=contents_scroll_arrow]', function(){

		// 現在のスクロール位置を取得
		var scrollLeft = $("div.mi_tag_list").scrollLeft();
		// スクロール量を取得
		var scrollVolume = $("div#mi_contents_display li").outerWidth();

		// どちらにスクロールするかの判定
		if($(this).attr("id") == "contents_scroll_arrow_left"){
			// 左にスクロール
			scrollLeft -= scrollVolume;
			$("div.mi_tag_list").stop().animate({
				scrollLeft: $("div.mi_tag_list").scrollLeft()-scrollVolume
			});
		}else{
			// 右にスクロール
			scrollLeft += scrollVolume;
			$("div.mi_tag_list").stop().animate({
				scrollLeft: $("div.mi_tag_list").scrollLeft()+scrollVolume
			});
		}
	});

	/**
	 * 拡大/縮小ボタン
	 * 資料表示中は、倍率選択肢の表示非表示を切替える。
	 * 目次ボタン表示中は、選択肢の 下辺位置を0に設定する
	 */
	$(document).on('click', 'li.left_icon_size', function(){

		if ($("div#mi_docment_area").is(':visible') && currentDocumentId != 0) {
			$('> .doc_scale', $(this)).toggleClass('display_none');
		}
	});

	/**
	 * 資料倍率が選ばれたとき
	 * 資料を選ばれた倍率で表示しなおす。
	 */
	$('#mi_wrap > div.mi_left_sidebar > ul.mi_bottom_list > li.left_icon_size > .doc_scale > *'
	).on('click', function(){

		// 選択された選択肢だけ色を付ける
		$(this).addClass('active').siblings().removeClass('active');
		// 倍率をグローバル変数に設定する。倍率: 1=1倍, 2=2倍, 0.5=0.5倍, ...
		codumentViewState = $(this).attr('value');
		// 拡大縮小を行う前に画像を保存する
		//saveDocument();

		// 資料倍率を設定したユーザー用処理
		// 資料倍率が 100% の場合のみテキスト入力を許容する。
		checkCanDrawTextOnMaterial()

		// 資料を再描画するとコメントが消える: コメント表示中はコメント部品を取得する(オペレーターのみ)
		let note = $("p.mi_document_note");
		let hasNote = $('#is_operator').val() == "1" && note.is(':visible');

		// キャンバスの拡大・縮小処理
		resizeCanvas(NO_NOTIFICATION);

		// コメントを表示しなおす
		if (hasNote) {
			note.show();
		}
		// 拡大・縮小処理を同期する
		syncChangeSizeDocument();

		// スライダーの値を変更する
		$('#doc_scale_value').text(parseInt(currentZoomValue * 100) + '%');
		$('#doc_scale_range').val(parseInt(currentZoomValue * 100));

		// 資料のウィンドウががリサイズされている可能性がある
	});

	/**

	 * 資料拡大の処理

	 */

	function resizeDocumentExecute()
	{
		codumentViewState = currentZoomValue;

		if(selectLeftTool == TOOL_DRAW_TEXT && codumentViewState != 1){
			// レフトアイコンの選択アイコン変更
			changeSelectIcon(selectLeftTool, TOOL_CURSORE_SELECT);
			// 選択カーソルを選択中にする
			selectLeftTool = TOOL_CURSORE_SELECT;
			// 資料領域の移動イベント追加
			addDocumentAreaOperation();
			// 資料上でのカーソルをノーマルに変更
			$('#mi_docment_area').css('cursor','normal');
		}

		// 資料倍率を設定したユーザー用処理
		// 資料倍率が 100% の場合のみテキスト入力を許容する。
		checkCanDrawTextOnMaterial()

		// 資料を再描画するとコメントが消える: コメント表示中はコメント部品を取得する(オペレーターのみ)
		let note = $("p.mi_document_note");
		let hasNote = $('#is_operator').val() == "1" && note.is(':visible');

		// キャンバスの拡大・縮小処理
		resizeCanvas(NO_NOTIFICATION);

		// コメントを表示しなおす
		if (hasNote) {
			note.show();
		}

		// 拡大・縮小処理を同期する
		syncChangeSizeDocument();

		// スライダーの値を変更する
		$('#doc_scale_value').text(parseInt(currentZoomValue * 100) + '%');
		$('#doc_scale_range').val(parseInt(currentZoomValue * 100));
	}

	/**
	 * 資料拡大のスライダー動作(10%zoom)
	 */
	$(document).on('click', '#doc_scale_zoomin', function(e) {
		if (currentZoomValue <= 2.9) {
			currentZoomValue += 0.1;
		} else {
			currentZoomValue = 3.0;
		}
		resizeDocumentExecute();

		e.stopPropagation();
		e.preventDefault();
	});

	/**
	 * 資料拡大のスライダー動作(10%zoom)
	 */
	$(document).on('click', '#doc_scale_zoomout', function(e) {
		if (currentZoomValue >= 1.1) {
			currentZoomValue -= 0.1;
		} else {
			currentZoomValue = 1.0;
		}
		resizeDocumentExecute();

		e.stopPropagation();
		e.preventDefault();
	});

	/**
	 * 資料拡大のスライダー動作(10%zoom)
	 */
	$(document).on('mouseup', '#doc_scale_range', function() {
		const isIPad = /iPad|Macintosh/i.test(navigator.userAgent) && 'ontouchend' in document
		currentZoomValue = $(this).val() / 100;
		resizeDocumentExecute();
	});

	/**
	 * 資料拡大のボタンをクリック
	 */
	$(document).on('click', '#document_zoom_btn', function() {
		// モーダル内のタグを削除する
		$("div.inner-wrap").empty();
		// テンプレート生成
		var template = Handlebars.compile($('#material-zoom-modal-template').html());
		// モーダルに内容をセットする
		let zoom300 =  currentZoomValue * 100 == 300 ? true : false;
		let zoom200 =  currentZoomValue * 100 == 200 ? true : false;
		let zoom150 =  currentZoomValue * 100 == 150 ? true : false;
		let zoom125 =  currentZoomValue * 100 == 125 ? true : false;
		let zoom100 =  currentZoomValue * 100 == 100 ? true : false;
		$('div.inner-wrap').append(template({
			'zoomVal' : parseInt(currentZoomValue * 100),
		}));

		// 設定画面にて設定したダウンロード可否をモーダルの項目に反映する
		/*materialSelectedListForSetting.forEach(function(selectedMaterial){
			const materialId = selectedMaterial['material_id'];
			const downloadFlg = selectedMaterial['download_flg']
				if(downloadFlg === 1) {
					$(`.radio_material_${materialId}:eq(0)`).prop('checked', true);
				} else if (downloadFlg === 0) {
					$(`.radio_material_${materialId}:eq(1)`).prop('checked', true);
				}
		});*/
		// モーダルの表示
		$("#modal-content").show();
		// モーダルを表示する為のクリックイベントを発生させる
		$('.modal-open').trigger("click");

		switch (currentZoomValue * 100) {
			case 300:
				$('#modal-content').find("#zoom300").prop('checked', true);
				break;
			case 200:
				$('#modal-content').find("#zoom200").prop('checked', true);
				break;
			case 150:
				$('#modal-content').find("#zoom150").prop('checked', true);
				break;
			case 125:
				$('#modal-content').find("#zoom125").prop('checked', true);
				break;
			case 100:
				$('#modal-content').find("#zoom100").prop('checked', true);
				break;
			default:
				$('#modal-content').find("#zoom999").prop('checked', true);
				break;
		}

	});

	$(document).on('touchend', '#doc_scale_range', function() {
		currentZoomValue = $(this).val() / 100;
		resizeDocumentExecute();
		zoomDelay = false;
	});

	// =====================================================================================================
	// マウスポインターと線を描くに関するイベント
	// =====================================================================================================
	var onMouseFlg = false;		// マウスの押下フラグ
	var mouseMovePointData = [];
	/**
	 * マウスのポインターを相手の画面に表示する
	 */
	$(document).on('mousemove', 'canvas#document_canvas', function(e){
		// 資料を表示している場合のみ実行
		if($("div#mi_docment_area").is(':visible') && currentDocumentId != 0){

			var url = getDocumentUrl();
			if(url){
				onMouseFlg = false;
			}
			// 要素の位置を取得
			var element = document.getElementById("document_canvas");
			var rect = element.getBoundingClientRect();
			// 要素の位置座標を計算
			var positionX = rect.left + window.pageXOffset ;	// 要素のX座標
			var positionY = rect.top + window.pageYOffset ;		// 要素のY座標
			// 要素の左上からの距離を計算
			var drowX = e.pageX - positionX ;
			var drowY = e.pageY - positionY ;

			// 線を書いているのか、マウスの移動だけなのかを判定する
			var writeLineFlg = 0;
			if(onMouseFlg && (selectLeftTool == TOOL_PEN_NORMAL || selectLeftTool == TOOL_PEN_HIGHLIGHT || selectLeftTool == TOOL_PEN_ERASER)){
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
			// 描画処理の前は、資料の右上アイコン部分をクリックできるようにしておく
			$('#document_header_icon').css('pointer-events','');
			if(writeLineFlg){
				// 描画中は資料右上アイコン部分のみ線が書けなくなってしまうため、pointer-eventsを設定
				$('#document_header_icon').css('pointer-events','none');
				// フラグとは別に同じ条件で自分の資料に線を書く（先に書くとonMouseXとonMouseYが書き変わってしまう）
				writeLine("document_canvas", drowX, drowY, onMouseX, onMouseY, line, color, selectLeftTool);
				// リサイズイベントが検知できなくなっていたため、再設定する
				setDocumentResize();
			}

			// 通信量が負荷が高すぎるので数回に一度の通信にする.
			if(mouseMovePointData.length % 3 != 0) {
				return;
			}

			// マウスの位置を相手に送信する
			var data = {
				command : "DOCUMENT",
				type : "MOUSE_POINTER",
				//drowX : drowX / proportionSize,
				//drowY : drowY / proportionSize,
				//writeLineFlg : writeLineFlg,
				//onMouseX : onMouseX / proportionSize,
				//onMouseY : onMouseY / proportionSize,
				//line : line,
				//color : color,
				//selectLeftTool : selectLeftTool,
				userId : $('#user_id').val(),
				position: mouseMovePointData
			};
			mouseMovePointData = [];
			sendCommand(SEND_TARGET_ALL, data);
		}
	});


	// キャンバス押下時の処理(オペレーターのみ操作可能)
	$(document).on('mousedown', 'canvas#document_canvas', function(e){
		// 資料を表示している場合のみ実行
		if($("div#mi_docment_area").is(':visible') && currentDocumentId != 0){
			// 資料がURLではない場合のみ線を描けるようにする
			var url = getDocumentUrl();
			if(!url){
				// マウス押下のフラグを立てる
				onMouseFlg = true;
				// 要素の位置を取得
				var element = document.getElementById("document_canvas");
				var rect = element.getBoundingClientRect();
				// 要素の位置座標を計算
				var positionX = rect.left + window.pageXOffset ;	// 要素のX座標
				var positionY = rect.top + window.pageYOffset ;		// 要素のY座標
				// 要素の左上からの距離を計算し起点を設定
				onMouseX = e.pageX - positionX ;
				onMouseY = e.pageY - positionY ;
			}
		}
	});

	// キャンバス押下終了時の処理(オペレーターのみ操作可能)
	$(document).on('mouseup', 'canvas#document_canvas', function(){
		// 資料を表示している場合のみ実行
		if($("div#mi_docment_area").is(':visible') && currentDocumentId != 0){
			if(onMouseFlg && (selectLeftTool == TOOL_PEN_NORMAL || selectLeftTool == TOOL_PEN_HIGHLIGHT || selectLeftTool == TOOL_PEN_ERASER || selectLeftTool == TOOL_DRAW_TEXT)){
				// 線を書き終わったら資料を保存する
				saveDocument();
			}
			// 線を書く為の変数初期化
			onMouseFlg = false;
			onMouseX = 0;
			onMouseY = 0;
		}
	});
	// キャンバスからマウスが外れた場合の処理(オペレーターのみ操作可能)
	$(document).on('mouseout', 'canvas#document_canvas', function(){
		if(onMouseFlg && (selectLeftTool == TOOL_PEN_NORMAL || selectLeftTool == TOOL_PEN_HIGHLIGHT || selectLeftTool == TOOL_PEN_ERASER || selectLeftTool == TOOL_DRAW_TEXT)){
			// 線を書き終わったら資料を保存する
			saveDocument();
		}
		// 線を書く為の変数初期化
		onMouseFlg = false;
		onMouseX = 0;
		onMouseY = 0;
	});

	// =====================================================================================================
	// 資料の移動とリサイズイベント処理
	// =====================================================================================================
	addDocumentAreaOperation();

	setDocumentResize();

	// =====================================================================================================
	// その他のイベント処理
	// =====================================================================================================
	/**
	 * ブラウザのウインドウリサイズ後の処理
	 * キャンバスをリサイズする
	 */
	$(window).resize(function() {
		// 資料のアイコン位置を調整する処理
		redisplayDocumentIcon();
		// URLを展開した場合のみリサイズ処理
		if(getDocumentUrl()){
			resizeDocumentCanvas();
		}
	});

	/**
	 * ブラウザのスクロール時に実行する処理
	 */
	$(window).bind("scroll", function() {
		// 資料のアイコン位置を調整する処理
		redisplayDocumentIcon();
	});

});

/**
 * 資料のリサイズイベントを設定する処理
 */
function setDocumentResize() {
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
			sideBarUpdate();
		},
		stop: function() {
			// 資料領域のリサイズ時の処理
			documentResizeEvent();
			// 最終的にリサイズ終了時の大きさに合わせたいため、こちらにも資料メニューバー調整を入れる
			sideBarUpdate();
		}
	});
}

/**
 * 資料のサイドバーの更新
 */
function sideBarUpdate(refresh = false)
{
	let _self = $('div#mi_docment_area');

	// なぜかleft値がマイナスの場合は0にされるので、設定しなおす
	if(materialLeft < 0){
		materialLeft = $(_self).position().left + materialLeft;
		$(_self).css("left", materialLeft);
		// 一度設定すればよいので初期値に戻す
		materialLeft = 0;
	}

	let changeElements = false;
	if(parseInt($(_self).css('height')) <= 368 - paddingSize) {
		if(sideBarDisplayStyle != 3) {
			changeElements = true
			sideBarDisplayStyle = 3;
		}
	} else if (parseInt($(_self).css('height')) <= 515 - paddingSize) {
		if(sideBarDisplayStyle != 2) {
			changeElements = true
			sideBarDisplayStyle = 2;
		}
	} else {
		if (sideBarDisplayStyle != 1) {
			changeElements = true
			sideBarDisplayStyle = 1;
		}
	}

	if (changeElements == true || refresh == true) {
		paddingSize = 0;
		if($('div#document_download').css('display') == 'none'){
			paddingSize += 54;
		}
		if($('div#img_document_comment').css('display') == 'none'){
			paddingSize += 44;
		}

		Object.keys(sideBarDisplayCss[sideBarDisplayStyle]).forEach(function(key) {
			Object.keys(sideBarDisplayCss[sideBarDisplayStyle][key]).forEach(function(elementKey){
				if(elementKey == 'top') {
					let size = parseInt(sideBarDisplayCss[sideBarDisplayStyle][key][elementKey]);
					if(size > 100) {
						size -= paddingSize;
					}
					$(key).css(elementKey, size + 'px');
				} else {
					$(key).css(elementKey, sideBarDisplayCss[sideBarDisplayStyle][key][elementKey]);
				}
			});
		});
	}
}

/**
 * 展開しているのがURLである場合の資料リサイズ処理
 */
function resizeDocumentCanvas(){
	$(".document_img").css({
		'width':`${$("#mi_docment_area").width() - 100}px`,
		'height':`${$("#mi_docment_area").height() - 100}px`,
		'object-fit':'contain'
	});
	$("#document_canvas").css({
		'width':`${$("#mi_docment_area").width() - 100}px`,
		'height':`${$("#mi_docment_area").height() - 100}px`
	});
}

/**
 * サーバーから資料を１件取得する
 * @param materialId
 * 商談画面へUPしたユーザ情報(staffType, staffId, clientId)
 */
function getMaterial(localMaterialId, registUserId, staffType, staffId, clientId, uuId){

	var connectionInfoId = $("#connection_info_id").val();

	// サーバーから資料の情報を取得する
	$.ajax({
		url: "https://" + location.host + "/negotiation/get-material",
		type: "GET",
		data: { materialId : localMaterialId, clientId : clientId, staffType : staffType, staffId : staffId, connectionInfoId : connectionInfoId},
		success: function(resultJson) {
			// jsonをオブジェクトに変換
			var result = $.parseJSON(resultJson);
			if(result["status"] == 1){
				// 資料情報をサーバーから読み込む初期化処理
				loadDocumentInfo(result, registUserId, staffType, staffId, clientId, uuId);

				// サムネイル数が増えた場合にスクロールのボタンを表示しulの領域を増やす
				// オペレータの場合はsessionStorageKeys.lengthの数がサムネイル数となるが処理の共通化で、権限の数を数える
				var thumbnailviewCount = getThumbnailCount();
				// サムネイルの表示領域を変更する
				showMoveThumbnailIcon(thumbnailviewCount);
			}else{
				alert("資料を取得できませんでした。");
			}
		}
	});
}

/**
 * 資料を読み込む初期化処理
 * ダイアログで資料を選択した場合と、商談画面で資料アップロードの共通処理
 * @param result
 */
function loadDocumentInfo(result, registUserId, staffType, staffId, clientId, uuid){
	try{

		var materialId = result["material_basic"]["material_id"];

		// モーダルの内容を削除する
		$("div.inner-wrap").empty();
		// モーダルを閉じる
		$("#modal-content").hide();

		// 資料IDを変数に保存する
		keyName = "materialId_" + materialId;
		mtSessionStorage = {};
		mtSessionStorage[keyName] = result;

		//　ユーザ情報追加(staffType/staffId/clientId)
		mtSessionStorage[keyName]["staff_type"] = staffType;
		mtSessionStorage[keyName]["staff_id"] = staffId;
		mtSessionStorage[keyName]["client_id"] = clientId;
		mtSessionStorage[keyName]["UUID"] = uuid;

		// キャンバスで変更データを保存用の領域作成
		mtSessionStorage[keyName]["userId"] = registUserId;
		mtSessionStorage[keyName]["canvas_document"] = {};
		mtSessionStorage[keyName]["canvas_document"]["hashKey"] = result["material_basic"]["md5_file_key"];
		mtSessionStorage[keyName]["canvas_document"]["maxCount"] = result["material_detail"].length;
		mtSessionStorage[keyName]["canvas_document"]["document"] = {};

		// 資料データを保存するための領域を作成する
		for (var i = 0; i < result["material_detail"].length; i++) {
			var pageKey = "page" + result["material_detail"][i]["material_page"];
			mtSessionStorage[keyName]["canvas_document"]["document"][pageKey] = {};
			mtSessionStorage[keyName]["canvas_document"]["document"][pageKey]["img"] = "";
			mtSessionStorage[keyName]["canvas_document"]["document"][pageKey]["fileName"] = result["material_detail"][i]["material_filename"];
			mtSessionStorage[keyName]["canvas_document"]["document"][pageKey]["orgHeight"] = 0;
			mtSessionStorage[keyName]["canvas_document"]["document"][pageKey]["orgWidth"] = 0;
		}

		// 資料のデータをセッションストレージに保存
		sessionStorage.setItem(keyName, JSON.stringify(mtSessionStorage));
		// 資料のキーをセッションストレージに保存
		if( sessionStorageKeys.indexOf(keyName) >= 0 ) {
		} else {
			// keyの配列に存在しない場合は追加する
			sessionStorageKeys.push(keyName);
			sessionStorage.setItem("mtSessionStorageKeys", JSON.stringify(sessionStorageKeys));
		}

		// サムネイル表示
		viewThumbnail();

		// ゲストも資料の初期化を行う
		var data = {
				command : "DOCUMENT",
				type : "INIT_DOCUMENT",
				keyName : keyName,
				mtSessionStorage : JSON.stringify(mtSessionStorage)
		};
		sendCommand(SEND_TARGET_ALL, data);

	}catch (e) {
		if ($('#is_operator').val() == "1") {
			// 同期メッセージの表示領域にメッセージを表示
			$("#no_save_document_message_area").show();
			setTimeout(function (){
				// 5秒後にメッセージを削除
				$("#no_save_document_message_area").hide();
			} , MESSAGE_TIMER);
		}
	}
}

/**
 * 資料のドラッグを開始
 * @param event
 */
function materialDragStart(event){
	disableUploadDocument();
	try{
		event.dataTransfer.setData("material_id", event.target.id);
	}catch (e) {
		// IEの場合.setData()でエラーが発生するのでグローバル変数にデータを保持させる
		dragMaterialId = event.target.id;
	}
	// 目次が表示されている場合は資料をドラッグした時点で非表示にする
	if($("#mi_contents_display").is(':visible')){
		// 目次を非表示する
		$("#mi_contents_display").hide();
	}
}

/**
 * 資料のドラッグを終了
 * @param event
 */
function materialDragEnd(event){
	enableUploadDocument();
}

/**
 * 資料反映をタッチ認識で開始する処理（中身は空で問題なし）
 * @param event
 */
function TouchEvent(event){
}

/**
 * 資料の反映をタッチで対応させる処理
 * @param event
 */
function TouchEndEvent(event){
	enableUploadDocument();
	// $materialData = event.target.id
	var localMaterialId = 0;
	// 拡大表示をリセット
	codumentViewState = 1;
	$("li.left_icon_size div#icon-expansion").show();

		try{
			localMaterialId = event.target.id;
		}catch (e) {
			// IEの場合.setData()でエラーが発生するのでグローバル変数にデータを保持させる
			localMaterialId = dragMaterialId;
		}
		if((typeof event.target.id != "undefined") && localMaterialId && (typeof event.originalEvent === "undefined")){
			// 画面共有時は資料を表示させない

			if(!$("#negotiation_share_screen").isShow() && !$("#share_screen_modal").isShow()){
				// ドロップした資料のID
				currentDocumentId = localMaterialId;
				// 現在の表示ページを設定（資料表示の最初は１ページ目を表示なので1を指定）
				currentPage = 1;

				// データを取得する為のキーを作成する
				var keyName = "materialId_" + currentDocumentId;
				// ブラウザのセッションストレージからデータ取得
				var mtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));
				// URLの場合はダウンロード等を削除する
				var documentUrlFlg = 0;
				if( mtSessionStorage != null ) {
					if(mtSessionStorage[keyName]["material_basic"]["material_url"]){
						documentUrlFlg = 1;
					}
				}

				// ビデオを表示するために先に資料表示領域を表示
				$("div#mi_docment_area").show();

				// 資料を表示し、ビデオを資料用のビデオに変更する
				//LayoutCtrl.apiSetMaterial();
				// 2018/04/20 太田
				LayoutCtrl.apiSetMaterial2();	// レイアウト変更なし

				var documentCanvasLeft = LayoutCtrl.apiGetSubLength();

				// 資料表示の際に映像モーダルを表示するため、レイアウトをリセットする
				LayoutCtrl.apiMoveAllVideoFrameToShow();
				resetLayout(1);

				// キャンバスに資料を表示する
				loadDocument(NO_NOTIFICATION, 1, 1);

				// 最後にドロップイベントをキャンセルする（お作法かな）
				// materialDragOver(event);

				// 資料を商談画面へアップしたユーザ情報(表示している資料が自分が表示した資料かを判定するために使用する)
				$("#document_material_id").val(keyName);
				$("#document_uuid").val(mtSessionStorage[keyName]["UUID"]);
				$("#document_user_id").val( $("#user_id").val() );

				var data = {
						command : "DOCUMENT",
						type : "SHOW_DOCUMENT",
						keyName : keyName,
						currentDocumentId : currentDocumentId,
						currentPage : currentPage,
						documentUrlFlg : documentUrlFlg,
						documentCanvasLeft : documentCanvasLeft,

						documentMaterialId : $('#document_material_id').val(),
						document_user_id : $("#document_user_id").val(),
						documentUuId : $('#document_uuid').val()
				};
				sendCommand(SEND_TARGET_ALL, data);
			}
			else{
				// 画面共有時は資料表示ができないメッセージを表示
				$('.material_button_tooltip').tooltipster('content', '画面共有時は資料の表示を行えません');
				// tooltip表示
				$('.material_button_tooltip').tooltipster('open');
				// アップロードメッセージを消すためのタイマーを設定
				setTimeout(function(){
					$('.material_button_tooltip').tooltipster('close');
					// 元のメッセー時に戻す
					$('.material_button_tooltip').tooltipster('content', '資料が追加されました');
				}, MESSAGE_TIMER);
			}
		}
	}

/**
 * ブラウザ標準のドロップ動作をキャンセル
 */
function materialDragOver(event){
	event.preventDefault();
}
/**
 * 資料のドロップ
 * @param event
 */
// function materialTouchDrop(event) { //タッチ時のドロップイベント
// 	// 拡大表示をリセット
// 	codumentViewState = 1;	// [1:縮小, 1.7:拡大1, 2.4:拡大2, 3.1:拡大3]
// 	$("li.left_icon_size div#icon-expansion").show();
// 	$("li.left_icon_size div#icon-reduction").hide();
// }

function materialDrop(event) {  //クリック時のドロップイベント
	var localMaterialId = 0;
	//var orgCanvasWidth = MATERIAL_WIDTH;		// キャンバスのデフォルトサイズ幅
	//var orgCanvasHeight = MATERIAL_HEIGHT;	// キャンバスのデフォルトサイズ丈
	//var canvasWidth = MATERIAL_WIDTH;			// キャンバスの実サイズ幅
	//var canvasHeight =  MATERIAL_HEIGHT;		// キャンバスの実サイズ丈

	// 拡大表示をリセット
	codumentViewState = 1;

	currentZoomValue = 1.0;
	$('#doc_scale_value').text(parseInt(currentZoomValue * 100) + '%');
	$('#doc_scale_range').val(parseInt(currentZoomValue * 100));

	//var viewDocumentWhenVideoTop = 250;			// 資料表示時のビデオTOP表示位置
	//var viewDocumentWhenVideoRight = 10;		// 資料表示時のビデオRight表示位置

	try{
		localMaterialId = event.dataTransfer.getData("material_id");
	}catch (e) {
		// IEの場合.setData()でエラーが発生するのでグローバル変数にデータを保持させる
		localMaterialId = dragMaterialId;
	}
	if((typeof event.dataTransfer != "undefined") && localMaterialId && (typeof event.originalEvent === "undefined")){
		// 画面共有時は資料を表示させない
		if(!$("#negotiation_share_screen").isShow() && !$("#share_screen_modal").isShow()){

			// ドロップした資料のID
			currentDocumentId = localMaterialId;
			// 現在の表示ページを設定（資料表示の最初は１ページ目を表示なので1を指定）
			currentPage = 1;

			// データを取得する為のキーを作成する
			var keyName = "materialId_" + currentDocumentId;
			// ブラウザのセッションストレージからデータ取得
			var mtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));
			// URLの場合はダウンロード等を削除する
			var documentUrlFlg = 0;
			if( mtSessionStorage != null ) {
				if(mtSessionStorage[keyName]["material_basic"]["material_url"]){
					documentUrlFlg = 1;
				}
			}

			// ビデオを表示するために先に資料表示領域を表示
			$("div#mi_docment_area").show();

			// 資料を表示し、ビデオを資料用のビデオに変更する
//			LayoutCtrl.apiSetMaterial();
// 2018/04/20 太田
			LayoutCtrl.apiSetMaterial2();	// レイアウト変更なし

			var documentCanvasLeft = LayoutCtrl.apiGetSubLength();

			// キャンバスに資料を表示する
			loadDocument(NO_NOTIFICATION, 1, 1);
			// 資料表示の際に映像モーダルを表示するため、レイアウトをリセットする
			LayoutCtrl.apiMoveAllVideoFrameToShow();
			resetLayout(1);
			// ユーザー名表示箇所のwidthを調整 videoが小さくなる
			adjustUserNameWidth(userNamesOriginalWidthForVideo, true);

			//資料が横長の場合のみ処理を行う
			if ($(".document_canvas_contents").height() < $(".document_canvas_contents").width()){
				// 資料表示の際に映像モーダルを表示するため、レイアウトをリセットする
				LayoutCtrl.apiMoveAllVideoFrameToShow();
				resetLayout(1);
				// ユーザー名表示箇所のwidthを調整 videoが小さくなる
				adjustUserNameWidth(userNamesOriginalWidthForVideo, true);
			}

			// 最後にドロップイベントをキャンセルする（お作法かな）
			materialDragOver(event);

			// 資料を商談画面へアップしたユーザ情報(表示している資料が自分が表示した資料かを判定するために使用する)
			$("#document_material_id").val(keyName);
			$("#document_uuid").val(mtSessionStorage[keyName]["UUID"]);
			$("#document_user_id").val( $("#user_id").val() );

			var data = {
					command : "DOCUMENT",
					type : "SHOW_DOCUMENT",
					keyName : keyName,
					currentDocumentId : currentDocumentId,
					currentPage : currentPage,
					documentUrlFlg : documentUrlFlg,
					documentCanvasLeft : documentCanvasLeft,

					documentMaterialId : $('#document_material_id').val(),
					document_user_id : $("#document_user_id").val(),
					documentUuId : $('#document_uuid').val()
			};
			sendCommand(SEND_TARGET_ALL, data);

		}
		else{
			// 画面共有時は資料表示ができないメッセージを表示
			$('.material_button_tooltip').tooltipster('content', '画面共有時は資料の表示を行えません');
			// tooltip表示
			$('.material_button_tooltip').tooltipster('open');
			// アップロードメッセージを消すためのタイマーを設定
			setTimeout(function(){
				$('.material_button_tooltip').tooltipster('close');
				// 元のメッセー時に戻す
				$('.material_button_tooltip').tooltipster('content', '資料が追加されました');
			}, MESSAGE_TIMER);
		}
	}

	setTimeout(function(){
		sideBarUpdate(true);
	}, 1000);
}

/**
 * 資料とキャンバス画像読み込み(すべての読み込みが完了するまで描画しないため)
 */
function loadImages(imagePaths, loadedImgsInfo, callback) {
	if(!imagePaths) { return; }
	var count = imagePaths.length;
	$.each(imagePaths, function(key, data) {
		var onLoad = function(e) {
			count--;
			if(0 == count) {
				callback(loadedImgsInfo);
			}
		}
		var img = new Image();
		img.onload = function() {
			data['img'] = this;
			loadedImgsInfo.push(data);
			onLoad();
		}
		img.onerror = function() {
			onLoad();
		}
		img.src = data["src"];
	});
}


// 画像の読み込みを待つ処理
function loadImageSizePromise(src) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = (e) => reject(e);
		img.src = src;
	}); // then(res=>{}).
}

/**
 * キャンバスに資料を表示する為の画像読み込み
 */
function loadDocument(requestUserId, DropFirstFlg, MoveDocumentFlg){
	// 資料のキーを作成
	var keyName = "materialId_" + currentDocumentId;
	var pageKey = "page" + currentPage;
	// ブラウザのセッションストレージからデータ取得する為の変数宣言
	var mtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));
	if(mtSessionStorage && keyName in mtSessionStorage && $("div#mi_docment_area").is(':visible') && currentDocumentId != 0){
		// 資料画像を非表示にする
		$("img#document_img").hide();
		// 資料画像のスタイルを初期化する
		$("#document_img").removeAttr("style");

		// 資料の存在するフォルダパス
		// 開発用に変更中
		// var documentPath = "/negotiation_"+ $("#connection_info_id").val() + "/";
		var documentPath = "/negotiation_document/negotiation_"+ $("#connection_info_id").val() + "/";
		// 資料とキャンバス画像の名前を作成
		var documentName = mtSessionStorage[keyName]["canvas_document"]["document"][pageKey]["fileName"];
		var canvasNames = mtSessionStorage[keyName]["canvas_document"]["document"][pageKey]["fileName"].split(".");
		var canvasName = canvasNames[0] + "-cvs.png";
		// 乱数の文字を取得
		var uuid = UUID.generate();
		var uniqueStr = uuid.replace(/\-/g, '');
		var loadedImgsInfo = [],
				loadedImgs = [],
				imagePaths = [
			{"src": documentPath + documentName + "?" + uniqueStr, "type": "doc"},
			{"src": documentPath + canvasName + "?" + uniqueStr, "type": "cvs"},
		];
		cvsImgFlg = false;
		// 資料とキャンバスの読み込み
		loadImages(imagePaths, loadedImgsInfo, function(loadedImgsInfo) {
			// 読み込み完了
			var cvsImg, docImg;
			$.each(loadedImgsInfo, function(i, e) {
				if(e["type"] == "doc") {
					// 資料画像
					docImg = e["img"];
					// サイズ設定を行うために再度セッションストレージデータを取得する
					var localMtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));
					// 画像のサイズを保存する
					if(localMtSessionStorage[keyName]["canvas_document"]["document"][pageKey]["orgHeight"] == 0){
						localMtSessionStorage[keyName]["canvas_document"]["document"][pageKey]["orgHeight"] = docImg.height;
						// 資料のデータをセッションストレージに保存
						sessionStorage.setItem(keyName, JSON.stringify(localMtSessionStorage));
					}
					if(localMtSessionStorage[keyName]["canvas_document"]["document"][pageKey]["orgWidth"] == 0){
						localMtSessionStorage[keyName]["canvas_document"]["document"][pageKey]["orgWidth"] = docImg.width;
						// 資料のデータをセッションストレージに保存
						sessionStorage.setItem(keyName, JSON.stringify(localMtSessionStorage));
					}
					// imgタグに画像を設定する
					$("#document_img").attr("src", e["img"].src);
				} else if(e["type"] == "cvs") {
					// キャンパス画像
					cvsImg = e["img"];
					cvsImgFlg = true;
				}
			});

			// 画像のサイズが重要な処理なので 読み込み終わってから開始する.
			loadImageSizePromise($("#document_img").attr("src"))
			.then(res => {

				// 既存の描画処理
				viewDocument(requestUserId, docImg, cvsImg, cvsImgFlg, DropFirstFlg, MoveDocumentFlg);

				// テキスト入力を前回の状態に復元.
				loadDocumentTextData(function (documentTexts) {

					// 資料のページ以外のテキスト入力要素を隠す.
					setDocumentInputCurrentPageOnly(currentPage);

					Object.keys(documentTexts).map(function(index) {
						let documentText = documentTexts[index];
						if(documentText.document_text_input_id != null) {
							let target_element = `#text_form_modal[data-document_text_input_id="${documentText.document_text_input_id}"][data-page="${documentText.page}"]`;
							if(0 < $(target_element).length) {
								$(target_element).remove();
							}
							makeDocumentTextInputHtml(decodingCurrentSizeDocumentInputTextData(documentText));
						}
					});

					// 表示状態を設定する.
					setDocumentInputTextElementSelectIcon(selectLeftTool);
				});
			})
			.catch(e => {
				console.log('onload error', e);
			});


		});


	}
}


function downloadDocument(materialId, clientId, staffType, staffId, connectionInfoId, isOriginal = false) {
/*
	// 送信データ
	var materialId  = currentDocumentId;
	var clientId = $("#client_id").val();
	var staffType = $("#staff_type").val();
	var staffId = $("#staff_id").val();
	var connectionInfoId = $("#connection_info_id").val();
*/
	// $.ajaxだけではバイナリを扱うのが厳しいので代わりにXMLHttpRequestを使う（バイナリで取得しないとカメラの映像が消えてしまう為）
	var xhr = new XMLHttpRequest();
	xhr.open("POST", "/negotiation/download-document", true);
	// POST 送信の場合は Content-Type は固定.
	xhr.setRequestHeader( 'Content-Type', 'application/x-www-form-urlencoded' );
	xhr.responseType = 'arraybuffer';
	xhr.onload = function(e) {
		// Blobオブジェクトにファイルを格納する（コンテンツタイプをpdfとして指定）
		var blob = new Blob([xhr.response], {"type": "application/pdf"});
		// ダウンロードファイル名を設定(document_年月日時分秒.pdf)
		var now = new Date();
		var pdfFileName = "document_"+now.getFullYear()+(now.getMonth() + 1)+now.getDate()+now.getHours()+now.getMinutes()+now.getSeconds()+".pdf";

		if(getBrowserType() != "IE"){
			// Aタグのhref属性にBlobオブジェクトを設定する。
			$("a[name=download_document]").attr("href", URL.createObjectURL(blob));
			// ファイル名を設定
			$("a[name=download_document]").attr("download", pdfFileName);

			// デバイスがipadか判定
			const isIPad = /iPad|Macintosh/i.test(navigator.userAgent) && 'ontouchend' in document
			if(isIPad){
				//ipadの場合別タブでpdfを表示する
				window.open(
					$('a[name=download_document]')[0].getAttribute('href'),
					'_blank', 
					'noopener'
				);
			}else{
				// aタグのクリックイベントを発生させる
				$("a[name=download_document]")[0].click();
			}
		}else{
			// IE専用のダウンロード処理
			window.navigator.msSaveBlob(blob, pdfFileName);
		}
		// ダウンロードメッセージを削除
		$("div.upload_document_message_area").hide();
	};
	// サーバへリクエストを送信（POSTの場合は引数に設定する）
	xhr.send("materialId="+materialId+"&clientId="+clientId+"&staffType="+staffType+"&staffId="+staffId+"&connectionInfoId="+connectionInfoId+"&isOriginal="+isOriginal);
}


/**
 * キャンバスの画像が存在するかサーバーへ問い合わせる
 * @param imgPath
 * @returns
 */
function chackCanvasImg(imgPath){
	var result = $.ajax({
		url: "https://" + location.host + "/negotiation/chack-canvas-img",
		type: "GET",
		async: false,
		data: {imgPath : imgPath}
	}).responseText;
	return result;
}

/**
 * キャンバス画像が存在しない場合にデフォルトの透過画像を作成しサーバーに保存する
 * @param canvasDict
 * @returns
 */
function initCanvas(canvasDict){
	// キャンバスのサイズを指定する
	var element = document.getElementById("document_canvas");
	// context取得
	var context = element.getContext('2d');
	// キャンバスの内容を初期化する
	context.clearRect(0, 0, canvasDict["width"], canvasDict["Height"]);
	// キャンバスのサイズを指定する
	element.setAttribute("width", canvasDict["width"]);
	element.setAttribute("height", canvasDict["Height"]);
	context.fillStyle = "rgba(255, 255, 255, 0)";

	// 現在の表示内容をpng化
	var canvasData = element.toDataURL();
	// ルームID
	var connectionInfoId = $("#connection_info_id").val();
	// ファイル名を取得
	var pageKey = "page" + currentPage;
	var keyName = "materialId_" + currentDocumentId;
	var mtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));
	var fileNames = mtSessionStorage[keyName]["canvas_document"]["document"][pageKey]["fileName"].split(".");
	// キャンバス画像保存用に名前を変更する
	var fileName = fileNames[0] + "-cvs.png";
	// サーバーに画像を転送する
	var result = $.ajax({
		url: "https://" + location.host + "/negotiation/save-material",
		type: "POST",
		async: false,
		data: {canvasData : canvasData, connectionInfoId : connectionInfoId, fileName : fileName}
	}).responseText;
}

function viewDocument(requestUserId, documentImg, canvasImg, canvasImgFlg, DropFirstFlg, MoveDocumentFlg){
	// 資料のキーを作成
	var keyName = "materialId_" + currentDocumentId;
	var pageKey = "page" + currentPage;
	// ブラウザのセッションストレージからデータ取得する為の変数宣言
	var mtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));
	// ダウンロードフラグ
	var downloadFlg = mtSessionStorage[keyName]["material_basic"]["download_flg"];
	// 展開した資料がURLか判別
	var url = getDocumentUrl();

	var material_user_id = mtSessionStorage[keyName]["userId"];
	// コメントの制御を行う
	// 自身のuseridと違う場合はメモアイコンは非表示
	var user_id = $('#user_id').val();
	$("div#img_document_comment").hide();
	if ($('#is_operator').val() == "1") {
		if(user_id == material_user_id) {
			// 新しい資料を表示する際はコメントを非表示にする
			$("p.mi_document_note").hide();
			// コメントの表示アイコンの制御
			if(getMaterialMemo()){
				// コメントが存在する場合
				$("div#img_document_comment").show();
			}
		}
	}

	changeMaterialLayout();

	// 資料ドロップ時は最大サイズとする　By 太田
	if( DropFirstFlg == 1 ) {
		$("div#mi_docment_area").height($("div#fit_rate").height()).width($("div#fit_rate").width());
		resetLayout(0);
	}

	// 資料をページお送り時は下記の処理を行わない(MoveDocumentFlg==0)
	if( MoveDocumentFlg == 1 ){
		// 資料表示領域を設定する
		setOrgCanvasSize();
	}

	// 画像のサイズを計算する
	getCanvasSize(mtSessionStorage[keyName]["canvas_document"]["document"][pageKey], (orgCanvasHeight * codumentViewState), (orgCanvasWidth * codumentViewState), (orgCanvasHeight * codumentViewState), (orgCanvasWidth * codumentViewState));
	// 最初の表示寸法を保存する
	docWidth = canvasWidth;
	docHeight = canvasHeight;

	// 倍率選択肢の選択中の値を100% に設定する
	let rates = $(
		'#mi_wrap > div.mi_left_sidebar > .mi_bottom_list > .left_icon_size > .doc_scale');
	if( DropFirstFlg == 1 ) {
		$('> .active', rates).removeClass('active');
		$('> [value=1]', rates).addClass('active');
	} else {
		// 初期表示以外の時、ページ遷移時には倍率選択値も継承する
		rates.children().each(function(i, o) {
			o = $(o);
			o.removeClass('active');
			if (o.attr('value') == codumentViewState) {
				o.addClass('active');
				return;
			}
		});
	}

	// キャンバスのサイズを指定する
	resizeDocument(DropFirstFlg);

	// キャンバスのオブジェクトを取得
	var element = document.getElementById("document_canvas");
	// context取得
	var context = element.getContext('2d');
	context.fillStyle = "rgba(255, 255, 255, 0)";
	if(canvasImgFlg){
		// 画像を描画
		context.clearRect(0, 0, canvasWidth, canvasHeight);
		context.drawImage(canvasImg, 0, 0, canvasWidth, canvasHeight);
	}

	// 資料の表示領域を表示
	$("img#document_img").show();
	$("div#mi_docment_area").show();

	// ダウンロードアイコンの制御
	viewDownloadIcon(downloadFlg);

	// 目次アイコンの制御
	if(mtSessionStorage[keyName]["viewFlg"] || mtSessionStorage[keyName]["userId"] == $('#user_id').val()){
		$("li.left_icon_content").removeClass("display_none");
	}else{
		$("li.left_icon_content").addClass("display_none");
	}

	// 初期化時の資料同期処理の場合、画像読み込み後にスクロール設定を行う
	if(syncDocumentScrollTop > 0){
		$("div#mi_docment_area").scrollTop(syncDocumentScrollTop);
		syncDocumentScrollTop = 0;
	}
	if(syncDocumentScrollLeft > 0){
		$("div#mi_docment_area").scrollLeft(syncDocumentScrollLeft);
		syncDocumentScrollLeft = 0;
	}
	// 通知を必要としている場合のみ通知を送る
	if(requestUserId != NO_NOTIFICATION){
		// 相手に自分の資料表示完了通知を行う
		var data = {
				command : "DOCUMENT",
				type : "SHOW_DOCUMENT_COMPLET",
				responseUserId : $('#user_id').val()

		};
		// ページ変更を行ったユーザーにメッセージ送信
		sendCommandByUserId(requestUserId, data);
	}

	// 展開した資料がURLだった場合のみ、レイアウトを変更する
	if(url){
		// CORS問題回避のため、PHP側でURLのtitleをスクレイピング
		$.ajax({
			url:  "https://" + location.host + "/negotiation/get-page-title",
			type: "POST",
			data: { "url" : url },
			dataType: 'json',
		})
		.done(function(result) {
			// 取得したタイトルをフロントに反映
			let pageTitleArea = document.getElementById('document_title_area');
			pageTitleArea.innerText = result;
			pageTitleArea.href = url;
		})
		.fail(function() {
			console.log("error");
		});
		// 展開した資料によりレイアウトを変更する
		changeMaterialLayout();
		resizeDocumentCanvas();
	}

	// iPad横のときに、資料展開されたところに入室すると、widthとheightの値が変わってしまうため、リセットボタンで整える。
	const roomMembersCount = parseInt($('#room_members').text()); // 人数を取得

	if (USER_PARAM_IS_IPAD_PC && window.innerHeight < window.innerWidth 
		&& roomMembersCount === 2) {
			// 初期配置ボタン押す
			$("#header_video_reset").trigger('click');　// レイアウトを元に戻す.
	}

}

/**
 * 展開した資料がURLだった場合はレイアウトを変更し、URLでない場合は通常レイアウトに戻す
 */
function changeMaterialLayout() {
	if(getDocumentUrl()){
		// URL資料用レイアウト
		$(".document_canvas_contents").addClass('url_active');
		$("#document_title_block").addClass('display_block');
		$("div#mi_docment_area").css({
			'width':`${$("div#mi_docment_area").width() + 100}px`,
			'height':`${$("div#mi_docment_area").height() + 110}px`,
			'background':'white',
			'border':'1px solid #0081CC',
			'border-radius':'5px'
		});
		$(".document_canvas").css('border','1px solid #B2B2B2');
	}else{
		// 通常の資料用レイアウト
		$(".document_canvas_contents").removeClass('url_active');
		$("#document_title_block").removeClass('display_block');
		$("div#mi_docment_area").css({
			'width':'',
			'height':'',
			'background':'',
			'border':'none',
			'border-radius':'0px'
		});
		$(".document_canvas").css('border','none');
	}
}

/**
 * 資料の表示領域を設定する
 * @returns
 */
function setOrgCanvasSize(){
	orgCanvasWidth = $("#mi_docment_area").width();
	orgCanvasHeight = $("#mi_docment_area").height();
}

/**
 * 表示画像の割合を求める
 * 縦、横の比率は保った前提なので縦のみで計算を行う
 * @returns
 */
function getProportion(){
	// 資料のキーを作成
	var keyName = "materialId_" + currentDocumentId;
	// ページキーを作成
	var pageKey = "page" + currentPage;
	// ブラウザのセッションストレージからデータ取得する為の変数宣言
	var mtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));
	// 比率の計算を行う
	var proportion = canvasHeight / mtSessionStorage[keyName]["canvas_document"]["document"][pageKey]["orgHeight"] * 100;
	return proportion;
}


/**
 * キャンバスのサイズを決める
 * サイズが合うまで再帰する
 * ※2017-04-26 仕様が変更になり元のサイズをそのまま出力するように変更
 */
function getCanvasSize(documentInfo, localCanvasHeight, localCanvasWidth, viewCanvasHeight, viewCanvasWidth){
	const roomMembersCount = parseInt($('#room_members').text());　//room内人数を取得
	
	if(documentInfo["orgHeight"] > documentInfo["orgWidth"]){
		// 縦長画像の場合
		if (roomMembersCount >= 2) {
			$('.layout-0').css('left', '18%'); // 縦長資料の場合に資料とvideoが少し空きすぎてしまうため、調整する
		}
		localCanvasWidth = documentInfo["orgWidth"] * localCanvasHeight / documentInfo["orgHeight"];
		if(localCanvasWidth > viewCanvasWidth){
			// 縦に合わせ横を計算した結果、横が枠より大きい場合は縦サイズを縮めて再計算する
			localCanvasHeight = localCanvasHeight - 1;
			getCanvasSize(documentInfo, localCanvasHeight, localCanvasWidth, viewCanvasHeight, viewCanvasWidth);
		}else{
			// グローバル変数に値を設定する
			canvasHeight = localCanvasHeight;
			canvasWidth = localCanvasWidth;
		}
	}else{
		if ((roomMembersCount === 3 || roomMembersCount === 4) && $('#mi_docment_area').css('display') !== 'none'
		&& $('#fit_rate').hasClass('layout-narrow')) {
			$('.layout-0').css('top', '13%'); // iPad縦表示で 横資料の場合に videoとかぶることから資料のtopを調整する
		}

		// 横長画像の場合
		localCanvasHeight = documentInfo["orgHeight"] * localCanvasWidth / documentInfo["orgWidth"];
		if(localCanvasHeight > viewCanvasHeight){
			// 横に合わせ縦を計算した結果、縦が枠より大きい場合は横サイズを縮めて再計算する
			localCanvasWidth = localCanvasWidth - 1;
			// 自身の関数で再帰する
			getCanvasSize(documentInfo, localCanvasHeight, localCanvasWidth, viewCanvasHeight, viewCanvasWidth);
		}else{
			// グローバル変数に値を設定する
				canvasHeight = localCanvasHeight;
				canvasWidth = localCanvasWidth;
		}
	}
}

/**
 * キャンバスのサイズを動的に変更する
 *
 * 表示画像自体を倍率に合わせる。
 * 表示枠は、縮小時は倍率に合わせ、拡大時は資料の最初の大きさに合わせる。
 */
function resizeDocument(DropFirstFlg){
	// キャンバスのサイズを指定する
	var element = document.getElementById("document_canvas");
	// context取得
	var context = element.getContext('2d');
	// キャンバスの内容を初期化する
	context.clearRect(0, 0, canvasWidth, canvasHeight);
	// キャンバスのサイズを指定する
	element.setAttribute("width", canvasWidth);
	element.setAttribute("height", canvasHeight);

	$("div.document_canvas_contents").height(canvasHeight).width(canvasWidth);
	// 資料画像のサイズを設定する
	$("img#document_img").height(canvasHeight).width(canvasWidth);

	// 拡大時はスクロールが表示される前提なので、資料のフレームサイズを大きくしない
	if($("div#fit_rate").height() >= canvasHeight && $("div#fit_rate").width() >= canvasWidth){
		// キャンバスが資料フレーム表示領域より小さい場合はサイズをフィットさせる
		$("div#mi_docment_area").height(canvasHeight).width(canvasWidth);
		// キャンバスが資料フレーム領域にフィットするのでスクロールを削除する
		$("div#mi_docment_scroll").css("overflow", "");
	}else{
		$("div#mi_docment_area").height(orgCanvasHeight).width(orgCanvasWidth);
		// キャンバスが資料フレーム表示領域より大きい場合はスクロールを追加し表示する
		$("div#mi_docment_scroll").css("overflow", "scroll");
	}

	/**
	 * 資料をセンター表示する(横軸/縦軸)
	 * ただし、資料初期表示のみ
	 */
	if (DropFirstFlg==1) {	// 資料初期表示のみ(サムネイルドロップ時)
		var area_top = parseInt($('div#mi_docment_area').css('top'));
		var fit_height = parseInt($("#fit_rate").height());
		if( (area_top+canvasHeight) > fit_height ) {
			var top = ($("#fit_rate").height() - canvasHeight) / 2;
			$("div#mi_docment_area").css('top', top + 'px');
		}
	}
}

/**
 * ページャーの表示制御
 * @param hideScrollArrowFlg	フラグが立っている場合は資料の移動を非表示にする
 */
function viewPager(hideScrollArrowFlg){
	if(currentDocumentId > 0){
		// キーを作成
		var keyName = "materialId_" + currentDocumentId;
		// ブラウザのセッションストレージからデータ取得
		var mtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));
		// ページの最大数を取得
		var maxPageCount = getDocumentMaxPage();

		if(maxPageCount == 0 || hideScrollArrowFlg == HIDE_ICON_FLG){
			// 資料の中身が0件又は非表示フラグが立っている場合は両方非表示とする
			$("div#mi_scroll_arrow_left").css('background-color', 'rgba(30, 30, 30, 0.3)');
			$("div#mi_scroll_arrow_right").css('background-color', 'rgba(30, 30, 30, 0.3)');
		}else{
			// 1ページ目は前には戻れない
			if(currentPage == 1){
				$("div#mi_scroll_arrow_left").css('background-color', 'rgba(30, 30, 30, 0.3)');
			}else{
				//$("div#mi_scroll_arrow_left").css("left", getScrollArrowPosition("left"));
				$("div#mi_scroll_arrow_left").css('background-color', 'rgba(30, 30, 30, 0.6)');
			}
			// 最終ページは次に進めない
			if(currentPage == maxPageCount){
				$("div#mi_scroll_arrow_right").css('background-color', 'rgba(30, 30, 30, 0.3)');
			}else{
				//$("div#mi_scroll_arrow_right").css("left", getScrollArrowPosition("right"));
				$("div#mi_scroll_arrow_right").css('background-color', 'rgba(30, 30, 30, 0.6)');
			}
		}

		// ページの表示切替
		reloadPageNumber();
	}
}

/**
 * 拡大・縮小実行時にキャンバスのサイズを変更する処理
 * サーバーから画像を読み込まず、現在表示している画像を使用し拡大・縮小を行う
 * @returns
 */
function resizeCanvas(requestUserId){
	// 現在のキャンバスデータを取得する
	var canvasObj = document.getElementById("document_canvas");
	var canvasData = canvasObj.toDataURL();
	var canvasImg = new Image();
	canvasImg.onload = function(){
		// 資料のキーを作成
		var keyName = "materialId_" + currentDocumentId;
		var pageKey = "page" + currentPage;
		// ブラウザのセッションストレージからデータ取得する為の変数宣言
		var mtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));
		// 画像のサイズを計算する
		getCanvasSize(mtSessionStorage[keyName]["canvas_document"]["document"][pageKey], (orgCanvasHeight * codumentViewState), (orgCanvasWidth * codumentViewState), (orgCanvasHeight * codumentViewState), (orgCanvasWidth * codumentViewState));
		// キャンバスのサイズを指定する
		resizeDocument(0);
		// context取得
		var context = canvasObj.getContext('2d');
		context.fillStyle = "rgba(255, 255, 255, 0)";
		// 画像を描画
		context.drawImage(canvasImg, 0, 0, canvasWidth, canvasHeight);

		// ダウンロードフラグ
		var downloadFlg = mtSessionStorage[keyName]["material_basic"]["download_flg"];
		// ダウンロードアイコンの制御
		viewDownloadIcon(downloadFlg)

		// 通知を必要としている場合のみ通知を送る
		if(requestUserId != NO_NOTIFICATION){
			// 相手に自分の資料表示完了通知を行う
			var data = {
					command : "DOCUMENT",
					type : "SHOW_DOCUMENT_COMPLET",
					responseUserId : $('#user_id').val()

			};
			// ページ変更を行ったユーザーにメッセージ送信
			sendCommandByUserId(requestUserId, data);
		}
		// 倍率を倍率選択肢に反映する < 別のユーザが倍率を変えた時のため
		$('#mi_wrap > .mi_left_sidebar > .mi_bottom_list > li.left_icon_size > .doc_scale'
		).children().each(function(i, o) {
			o = $(o);
			o.removeClass('active');
			if (o.attr('value') == codumentViewState) {
				o.addClass('active');
				return;
			}
		});

		// テキスト入力の帳尻 フォントを拡大し、表示位置も調整する.
		resizeDocumentTextInputHtml();


	};
	canvasImg.src = canvasData;

}

/**
 * 拡大・縮小ボタンの表示制御
 * @param hideExpansionFlg
 * @returns
 */
function viewExpansion(hideExpansionFlg){
	if(hideExpansionFlg){
		$(".left_icon_size").hide();
	}else{
		$(".left_icon_size").show();
	}
}

/**
 * 資料のページ移動ボタンの位置をウインドウ左端からの絶対座標で取得する
 */
function getScrollArrowPosition(type){
	// 資料の表示領域が表示されていないと座標が取れないので一時的に表示する
	var hideFlg = false;
	if(!$("div#mi_docment_area").is(':visible')){
		$("div#mi_docment_area").show();
		hideFlg = true;
	}
	// キャンバス表示領域の座標
	var dosumentCanvasAreaLeft = document.getElementById("document_canvas_area").getBoundingClientRect().left;
	var dosumentCanvasAreaTop = document.getElementById("document_canvas_area").getBoundingClientRect().top;

	// 資料の位置とサイズを取得する
	var windowScrollLeft = 0;
	var docmentAreaScrollLeft = $("div#mi_docment_area").scrollLeft() - windowScrollLeft;		// 画像がスクロールされている事を考慮し、スクロール値を取得(ウインドウ自体がスクロールしている場合があるのでスクロール値を引く)
	//var documentLeft = $("div.document_canvas_area").position().left + docmentAreaScrollLeft;	// 資料表示領域のleft(スクロールしているとLeft値にずれが生じるのでスクロール位置を足す)
	var documentLeft = dosumentCanvasAreaLeft + docmentAreaScrollLeft;							// 資料表示領域のleft(スクロールしているとLeft値にずれが生じるのでスクロール位置を足す)
	var documenWidth = $("div#mi_docment_area").width();										// 資料表示領域のサイズ
	var scrollArrowImageWidth = 60;																// ページ遷移ボタンのサイズ
	var offset = 10;																			// 領域ピッタリになると見栄えが悪いのでオフセット
	var leftIconOffset = 60;																	// ツールバーの領域
	var left = 0;																				// 戻り値

	if(type == "left"){
		left = documentLeft + scrollArrowImageWidth + offset - leftIconOffset;
	}else{
		left = documentLeft + documenWidth - offset - SCROLL_MARGIN - leftIconOffset;
	}
	// 元々非表示だった場合は再度非表示にする
	if(hideFlg){
		$("div#mi_docment_area").hide();
	}
	return left;
}

/**
 * ビデオの映像がドラック&ドロップされた場合は資料の領域を非表示にする
 */
function hideDocument(){
	// 資料の領域が表示時のみ実行
	if($("div#mi_docment_area").is(':visible')){
		// 資料を非表示にする
		hideDocumentCommon();
		// 資料の領域を非表示にする
		$("div#mi_docment_area").hide();

		// 資料レイアウトをリセットする
		resetMaterialLayout();

		// 資料の非表示をゲストへ通知する
		var data = {
				command : "DOCUMENT",
				type : "HIDE_DOCUMENT"
		};
		sendCommand(SEND_TARGET_ALL, data);
		// SPユーザーに画像の非表示通知を行う
		var data = {
				command : "DOCUMENT",
				type : "SP_HIDE_DOCUMENT"
		};
		sendCommand(SEND_TARGET_ALL, data);
	}
}

/**
 * 資料を非表示にする場合の共通処理
 * @returns
 */
function hideDocumentCommon(){
	// 現在表示中の資料IDを初期化する
	currentDocumentId = 0;
	// 現在表示中のページを初期化する
	currentPage = 0;
	// 目次が表示されている場合は初期化
	if($("#mi_contents_display").is(':visible')){
		$("#mi_contents_display").hide();
	}
	// コメントが表示されている場合は初期化
	if($("p.mi_document_note").is(':visible')){
		$("p.mi_document_note").text("");
		$("p.mi_document_note").hide();
	}

	// 目次アイコンを非表示にする
	$("li.left_icon_content").addClass("display_none");

	$("#document_material_id").val("");
	$("#document_uuid").val("");
	$("#document_user_id").val("");
	// 倍率選択肢を閉じる
	$('li.left_icon_size> .doc_scale').addClass('display_none');
}

/**
 * 最大何ページの何ページ目かを再描画する
 */
function reloadPageNumber(){
	var maxPageCount = getDocumentMaxPage();
	if(maxPageCount == 0){
		// 資料を表示出来る時点で１つは必ず存在するので1を設定する
		maxPageCount = 1;
	}
	// ページの表示を設定する
	$("span.current_page").text(currentPage);
	$("span.max_page").text(maxPageCount);
}

/**
 * 資料の最大ページ数を取得する
 * @returns
 */
function getDocumentMaxPage(){
	var keyName = "materialId_" + currentDocumentId;
	// ブラウザのセッションストレージからデータ取得
	var mtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));
	var maxPageCount = mtSessionStorage[keyName]["material_detail"].length;
	return maxPageCount;
}

/**
 * 現在表示しているページのコメントを取得する
 */
function getMaterialMemo(){
	// keyを作成
	var keyName = "materialId_" + currentDocumentId;
	// ブラウザのセッションストレージからデータ取得
	var mtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));
	// メモを取得
	var materialMemo = "";
	for(var i = 0; i < mtSessionStorage[keyName]["material_detail"].length; i++){
		if(mtSessionStorage[keyName]["material_detail"][i]["material_page"] == currentPage){
			materialMemo = mtSessionStorage[keyName]["material_detail"][i]["material_memo"];
			break;
		}
	}
	return materialMemo;
}

/**
 * 強調ポインターの画像を返す
 * @param drowX
 * @param drowY
 * @returns
 */
function getMousePointTag(drowX, drowY, userId){
	// 強調ポインター
	//var mouserImg = '<span id="mouse_point_'+userId+'" style="position:absolute;z-index:26;left:'+drowX+'px;top:'+drowY+'px;"></span>';
	var mouserImg = '<span id="mouse_point_'+userId+'" class="span_emphasis_pointer" style="position:absolute;z-index:26;left:'+drowX+'px;top:'+drowY+'px;"><img src="/img/pointer.png" class="img_emphasis_pointer" /></span>';
	return mouserImg;
}

/**
 * キャンバスに表示している画像を変数に保存する
 */
function saveDocument(isReset = ''){
	// キャンバスのオブジェクト取得
	var saveCanvas = document.getElementById("document_canvas");
	// 現在の表示内容をpng化
	var canvasData = saveCanvas.toDataURL();
	if( !canvasData ) {
		return;
	}

	// ルームID
	var connectionInfoId = $("#connection_info_id").val();
	if( !connectionInfoId ) {
		return;
	}

	// ファイル名を取得
	var pageKey = "page" + currentPage;
	var keyName = "materialId_" + currentDocumentId;
	var mtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));
	if( !mtSessionStorage ) {
		return;
	}
	var fileNames = mtSessionStorage[keyName]["canvas_document"]["document"][pageKey]["fileName"].split(".");
	// キャンバス画像保存用に名前を変更する
	var fileName = fileNames[0] + "-cvs.png";
	// サーバーに画像を転送する
	$.ajax({
		url: "https://" + location.host + "/negotiation/save-material",
		type: "POST",
		data: {canvasData : canvasData, connectionInfoId : connectionInfoId, fileName : fileName, isReset : isReset},
		success: function(resultJson) {
		}
	});
}


// Htmlを画像化して サーバにアップロードする Promiseオブジェクトを生成する/
function makePromiseHtml2PngAndUploadDocumentInputImg(page, isReset='') {

	// ルームID
	var connectionInfoId = $("#connection_info_id").val();
	if( !connectionInfoId ) {
		return;
	}

	// ファイル名を取得
	var pageKey = "page" + page;
	var keyName = "materialId_" + currentDocumentId;
	var mtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));
	if( !mtSessionStorage ) {
		return;
	}

	// MEMO. Promiseを返す 非同期なので 終わりを待たなければならない.
	return html2canvas(document.querySelector("#document_text_field"), {backgroundColor:null}).then(saveCanvas => {

		// 現在の表示内容をpng化
		var canvasData = saveCanvas.toDataURL();
		if( !canvasData ) {
			return;
		}

		var fileNames = mtSessionStorage[keyName]["canvas_document"]["document"][pageKey]["fileName"].split(".");
		// キャンバス画像保存用に名前を変更する
		var fileName = fileNames[0] + "-txt.png";

		return new Promise((resolve, reject) => {
			// サーバーに画像を転送する
			$.ajax({
				url: "https://" + location.host + "/negotiation/save-material",
				type: "POST",
				data: {canvasData : canvasData, connectionInfoId : connectionInfoId, fileName : fileName, isReset : isReset},
				dataType: 'json',
			}).done(function(res) {
				resolve(res);
			}).fail(function(res) {
				reject(res);
			});
		});

	});

}


function loadDocumentTextData(event) {

	var connectionInfoId = $("#connection_info_id").val();
	var pageKey = "page" + currentPage;
	var keyName = "materialId_" + currentDocumentId;
	var mtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));
	var fileNames = mtSessionStorage[keyName]["canvas_document"]["document"][pageKey]["fileName"].split(".");
	var fileName = fileNames[0];

	let data = {
		fileName:fileName,
		connectionInfoId:connectionInfoId
	};

	$.ajax({
		url: "https://" + location.host + "/negotiation/load-document-text-data",
		type: "POST",
		data: data,
		dataType: 'json',
	}).done(function(res) {
		event(res);
	}).fail(function(res) {
		console.log(res);
	});
}

// 要素を登録して document_text_input_id を払い出す.
function saveDocumentTextData(data, event) {

	data = calculateBaseSizeDocumentInputTextData(data);

	var connectionInfoId = $("#connection_info_id").val();
	var pageKey = "page" + currentPage;
	var keyName = "materialId_" + currentDocumentId;
	var mtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));
	var fileNames = mtSessionStorage[keyName]["canvas_document"]["document"][pageKey]["fileName"].split(".");
	var fileName = fileNames[0];

	data.fileName           = fileName;
	data.page               = currentPage;
	data.connectionInfoId   = connectionInfoId;

	$.ajax({
		url: "https://" + location.host + "/negotiation/save-document-text-data",
		type: "POST",
		data: data,
		dataType: 'json',
	}).done(function(res) {
		event(res);
	}).fail(function(res) {
		console.log(res);
	});
}

function removeDocumentTextData(data, event) {

	var connectionInfoId = $("#connection_info_id").val();
	var pageKey = "page" + currentPage;
	var keyName = "materialId_" + currentDocumentId;
	var mtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));
	var fileNames = mtSessionStorage[keyName]["canvas_document"]["document"][pageKey]["fileName"].split(".");

	data.fileName           = fileNames[0];
	data.page               = currentPage;
	data.connectionInfoId   = connectionInfoId;

	$.ajax({
		url: "https://" + location.host + "/negotiation/remove-document-text-data",
		type: "POST",
		data: data,
		dataType: 'json',
	}).done(function(res) {
		event(res);
	}).fail(function(res) {
		console.log(res);
	});
}

// リセット機能用 現在飛来地るページの文字入力を消す.
function resetDocumentTextDataCurrentPage(event) {

	var connectionInfoId = $("#connection_info_id").val();
	var pageKey = "page" + currentPage;
	var keyName = "materialId_" + currentDocumentId;
	var mtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));
	var fileNames = mtSessionStorage[keyName]["canvas_document"]["document"][pageKey]["fileName"].split(".");
	var fileName = fileNames[0];

	let data = {
		fileName:fileName,
		connectionInfoId:connectionInfoId,
		page: currentPage
	};

	$.ajax({
		url: "https://" + location.host + "/negotiation/remove-document-text-page-data",
		type: "POST",
		data: data,
		dataType: 'json',
	}).done(function(res) {
		event(res);
	}).fail(function(res) {
		console.log(res);
	});

}




/**
 * 資料のダウンロードボタンの制御
 * @param downloadFlg
 */
function viewDownloadIcon(downloadFlg){
	// キャンバス表示領域のleft値
	var dosumentCanvasAreaLeft = document.getElementById("document_canvas_area").getBoundingClientRect().left;
	// 資料の位置とサイズを取得する
	var windowScrollLeft = 0;
	var docmentAreaScrollLeft = $("div#mi_docment_area").scrollLeft() - windowScrollLeft;		// 画像がスクロールされている事を考慮し、スクロール値を取得(ウインドウ自体がスクロールしている場合があるのでスクロール値を引く)
	//var documentLeft = $("div.document_canvas_area").position().left + docmentAreaScrollLeft;	// 資料表示領域のleft(スクロールしているとLeft値にずれが生じるのでスクロール位置を足す)
	var documentLeft = dosumentCanvasAreaLeft + docmentAreaScrollLeft;							// 資料表示領域のleft(スクロールしているとLeft値にずれが生じるのでスクロール位置を足す)
	var documenWidth = $("div#mi_docment_area").width();										// 資料表示領域のサイズ
	var commentIconOffset = 55;																	// オペレータの場合はコメントが存在するので、コメントが表示する場合のオフセット
	var downloadtIconOffset = 55;																// ダウンロードアイコンを表示する場合のオフセット
	var offset = 40;																			// 領域ピッタリになると見栄えが悪いのでオフセット(アイコンのDIV領域込み)
	var leftIconOffset = 160;																	// ツールバーの領域
	// 資料の最大ページ数を取得する
	var maxPageCount = getDocumentMaxPage();
	if(maxPageCount > 9){
		// 10ページ（2ケタ）を超える場合はoffsetを増やす
		offset = 60;
	}

	// 表示作業
	var left = 0;

	// オペレータの基本位置
	left = documentLeft + documenWidth - offset - SCROLL_MARGIN - leftIconOffset;

	if($('#is_operator').val() == "1" && getMaterialMemo()){
		// コメントアイコン分のオフセットを追加する
		left = left - commentIconOffset;
	}

	// ダウンロードアイコンの制御
	if(isCheckDocumentOwner()){
		// ダウンロードアイコン分のオフセットを追加する
		left = left - downloadtIconOffset;
		// ダウンロードが許可されている場合
		$("div#document_download").show();
		$("div.icon-download").show();
		$("div.mi_icon_download_text").show();
	}else{
		$("div#document_download").hide();
		$("div.icon-download").hide();
		$("div.mi_icon_download_text").hide();
	}

	// 表示位置を設定する
	$("div#document_header_icon").css("left", left);
}

function isCheckDocumentOwner() {

	let keyName = "materialId_" + currentDocumentId;
	let mtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));
	let materialInfo = mtSessionStorage[keyName];

	const clientId  = parseInt($('#client_id').val());
	const staffId   = parseInt($("#staff_id").val());
	const staffType = $("#staff_type").val();
	const staffRole = $('#staff_role').val();

	let check = [];
	check.push(materialInfo["client_id"] == clientId);
	check.push(materialInfo["staff_id"]  == staffId);
	check.push(['AA', 'CE'].indexOf(staffType) > -1);

	return check.indexOf(false) == -1;
}


/**
* 資料削除した際に空のliをulから除去する
* @param event
*/
function removeThumbEmptyElment() {
	// 表示されている資料数
	var documentCurrentCount = $(".mi_document_select ul li").length;
	// imgタグが中に存在しないli要素を削除
	for(i = 0; i < documentCurrentCount; i++){
		var num = i+1;
		var documentElement = $(".mi_document_select ul li:nth-child("+num+")");
		if(documentElement.children().length === 0){
			documentElement.remove();
		}
	}

}

/**
 * 資料の情報をDICTから削除する
 * @param event
 */
function removeMaterial(event) {
	var localMaterialId = 0;
	try{
		localMaterialId = event.dataTransfer.getData("material_id");
	}catch (e) {
		// IEの場合.setData()でエラーが発生するのでグローバル変数にデータを保持させる
		localMaterialId = dragMaterialId;
	}

	if(localMaterialId){
		if(localMaterialId != currentDocumentId){
			if(window.confirm("資料をサムネイルから削除します。\n手書きの情報は失われます。（ゲスト側も削除されます）")){
				// 削除時IEのローカル変数を初期化
				dragMaterialId = 0;
				var del_keyName = [];
				del_keyName.push(localMaterialId);
				// キーを作成
				var keyName = "materialId_" + localMaterialId;
				// ストレージの資料削除実行
				removeMaterialCommon(keyName, localMaterialId);
				var connectionInfoId = $("#connection_info_id").val();
				$.ajax({
					url: "https://" + location.host + "/negotiation/delete-canvas-material",
					type: "POST",
					dataType: "json",
					data: {connectionInfoId: connectionInfoId, materialIds : del_keyName},
				}).done(function(res) {
				});

				// サムネイル削除をゲストへ通知する（メモリー上の資料を削除する）
				var data = {
						command : "DOCUMENT",
						type : "DELETE_DOCUMENT",
						keyName : keyName,
						localMaterialId : localMaterialId
				};
				sendCommand(SEND_TARGET_ALL, data);
			}
		}else{
			alert("表示中の資料は削除できません。");
		}
	}
	// ブラウザ標準ドロップイベントを削除
	event.preventDefault();	
}

/**
 * キーを元に実際に資料の辞書を削除する
 * @returns
 */
function removeMaterialCommon(keyName, localMaterialId) {

	// 削除する資料が表示中の場合は非表示にする
	if( $("#document_material_id").val() == localMaterialId ) {
		// 資料を非表示にする
		hideDocumentCommon();
		// 資料の領域を非表示にする
		$("div#mi_docment_area").hide();

		// 資料レイアウトをリセットする
		resetMaterialLayout();
	}

	// ブラウザのセッションストレージからの削除
	sessionStorage.removeItem(keyName);
	// 資料のキーをセッションストレージから削除
	sessionStorageKeys.splice(sessionStorageKeys.indexOf(keyName), 1);
	sessionStorage.setItem("mtSessionStorageKeys", JSON.stringify(sessionStorageKeys));

	// サムネイルの削除
	$("li.thumbnail_image").find("img#"+localMaterialId).remove();
	// 吹き出しアイコンも削除
	$("div.big_thumbnail_area").remove();

	// 表示サムネイルのカウントを取得する
	var thumbnailviewCount = getThumbnailCount();
	// 削除したサムネイルのliをulから除去する
	removeThumbEmptyElment();
	// サムネイルの外矢印の幅を計算し、非表示にする
	hideMoveThumbnailIcon(thumbnailviewCount);
	// サムネイルをスクロールする為のアイコン表示とULの幅設定
	showMoveThumbnailIcon(thumbnailviewCount);
}

// サムネの矢印表示
function showThumbnailArrow(){
	$("div#move_thumbnail_prev").show();
	$("div#move_thumbnail_next").show();
}

// サムネの矢印非表示
function hideThumbnailArrow(){
	$("div#move_thumbnail_prev").hide();
	$("div#move_thumbnail_next").hide();
}

// 各種画面幅に対してのサムネ最大枠を設定
function arrowMaxWrap(leftsize,width){
	$('div#move_thumbnail_next').css('left',leftsize);
	$(".mi_document_select").width(width);
}

/**
 * サムネイルをスクロールする為のアイコン表示とULの幅設定
 */
function showMoveThumbnailIcon(thumbnailCount){
	var clirntWidth = document.documentElement.clientWidth;
	// ここでサムネの幅を画面幅と合わせてコントロールする
	if(thumbnailCount==1){
		var documentWidth = 100;
	}else if(clirntWidth<=1210 && thumbnailCount>=3){
		// 資料のwidth設定
		$(".mi_document_select ul").width(thumbnailCount*50);
	}else if(thumbnailCount<=3){
		// 資料が1枚以上の時
		var documentWidth = (thumbnailCount)*50;
		// 矢印の場所設定
		$('div#move_thumbnail_next').css('left',documentWidth);
	}

	// 資料のwidth設定
	$(".mi_document_select ul").width(documentWidth);
	$('div.mi_document_select').css('width',documentWidth-50);

	// 1080以下
	if(clirntWidth <= 1080){
		arrowMaxWrap('150px','100px');
		thumbnailCount <= 2 ? hideThumbnailArrow() : showThumbnailArrow();
	}

	// 1080以上1200以下、資料2枚以上
	if(clirntWidth > 1080 && clirntWidth <= 1200 && thumbnailCount>=2){
		arrowMaxWrap('150px','100px')
		thumbnailCount < 3 ? hideThumbnailArrow() : showThumbnailArrow();
	}

	// 1200以上1500以下、資料3枚以上
	if(clirntWidth > 1200 && clirntWidth <= 1500){
		if(thumbnailCount>3){
			arrowMaxWrap('200px','150px');
			showThumbnailArrow();
		}else if(thumbnailCount==3){
			arrowMaxWrap('200px','150px');
			hideThumbnailArrow();
		}else if(thumbnailCount==2){
			arrowMaxWrap('150px','100px');
		}
		$(".mi_document_select ul").width(thumbnailCount*50);
	}

	// 1500以上、資料４枚以上
	if(clirntWidth > 1500){
		if(thumbnailCount>4){
			arrowMaxWrap('250px','200px')
			showThumbnailArrow();
		}else if(thumbnailCount==4){
			arrowMaxWrap('250px','200px');
			hideThumbnailArrow();
		}else {
			arrowMaxWrap('250px','200px');
			thumbnailCount < 4 ? hideThumbnailArrow() : showThumbnailArrow();
		}
		$(".mi_document_select ul").width(thumbnailCount*50);
	}
}

/**
 * サムネイルをスクロールする為のアイコン非表示とULの幅初期化
 */
function hideMoveThumbnailIcon(thumbnailviewCount){
	var clirntWidth = document.documentElement.clientWidth;
	if(thumbnailviewCount!==0){
		// 資料が１枚の時のみ
		if(thumbnailviewCount==1){
			var documentWidth = 100;
			hideThumbnailArrow();
		}else{
			// 資料が１枚以上の時
			var documentWidth = (thumbnailviewCount+1)*50;
		}
		// 矢印の場所設定
		$('div#move_thumbnail_next').css('left',documentWidth);
		// 資料のwidth設定
		$('div.mi_document_select').css('width',documentWidth);
		$(".mi_document_select ul").width(documentWidth);
		// スクロール位置を左にする
		$("div#negotiation_bottom_document_select").scrollLeft(0);

		// 1080以下、資料1枚以下の場合矢印非表示
		if(clirntWidth > 1080 && thumbnailviewCount<=1){
			hideThumbnailArrow();
		}

		// 1080以上1200以下、資料2枚以下の場合矢印非表示
		if(clirntWidth > 1080 && clirntWidth <= 1200 && thumbnailviewCount<=2){
			hideThumbnailArrow();
		}

		// 1500以上、資料4枚以下の場合矢印非表示
		if(clirntWidth>1500&&thumbnailviewCount<=4){
			hideThumbnailArrow();
		}
	}
}

/**
 * 表示サムネイルのカウントを取得する
 * @returns
 * ※類いロジックが「negotiation_sysc.js[syncViewThumbnail()]」にも存在するので修正した場合は確認する事！！
 */
function getThumbnailCount(){
	var uuid = localStorage.UUID;
	if( !uuid ) {	// 空
		uuid = UUID.generate();
		localStorage.UUID = uuid;
	}

	// オペレータの場合はsessionStorageKeys.lengthの数がサムネイル数となるが処理の共通化で、権限の数を数える
	var thumbnailviewCount = 0;
	for ( var i = 0; i < sessionStorageKeys.length; i++) {
		// セッションストレージから資料データを取得する
		var mtSessionStorage = $.parseJSON(sessionStorage.getItem(sessionStorageKeys[i]));
		// keyとデータが一致しているかチェック
		if((mtSessionStorage != null) && (sessionStorageKeys[i] in mtSessionStorage)){
			if(uuid == mtSessionStorage[sessionStorageKeys[i]]["UUID"]) {
				thumbnailviewCount++;
			}
		}
	}
	return thumbnailviewCount;
}

/**
 * ウインドウのリサイズに時実行される資料用の関数
 */
function documentResizeEvent(){
	// 展開しているのがURLの場合はreturn
	if(getDocumentUrl()){
		return false;
	}
	// 資料が表示されている場合のみリサイズ処理を実行する
	if($("div#mi_docment_area").is(':visible') && currentDocumentId != 0){
		// 資料表示領域を設定する
		setOrgCanvasSize();
		// キャンバスのリサイズ処理
		resizeCanvas(NO_NOTIFICATION);
	}
}

/**
 * 展開した資料がURLの場合はURLを返す
 * @returns
 */
function getDocumentUrl(){
	var url = "";
	if($("div#mi_docment_area").is(':visible') && currentDocumentId != 0){
		// キーを作成
		var keyName = "materialId_" + currentDocumentId;
		// ブラウザのセッションストレージからデータ取得
		var mtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));
		if(mtSessionStorage && keyName in mtSessionStorage){
			url = mtSessionStorage[keyName]["material_basic"]["material_url"];
		}
	}
	return url;
}

/**
 * 資料のページ変更時の同期処理
 * １、ページ変更者から表示ページを通知
 * ２、その他ユーザーがページを描画したらページ変更者へメッセージ送信
 * ３、ページ変更者が全員のページ描画メッセージを受け取るか５秒たったら、全員にアイコン表示メッセージ送信
 * ４、全員がページ変更アイコンを表示する
 */
function syncMoveDocument(){
	var syncTimer = MIN_SYNC_TIMER;
	if(Object.keys(mUserIdAndUserInfoArray).length > 0){
		// 現在接続している全ユーザーにページ遷移を通知する（ただし、自分自身は除く）
		for(key in mUserIdAndUserInfoArray){
			if($('#user_id').val() != key){
				// 同期するユーザー情報を保存する
				syncUserDict[key] = NO_RESPONSE_FLG;
				// ページ移動を相手に送信する
				var data = {
						command : "DOCUMENT",
						type : "MOVE_DOCUMENT",
						currentPage : currentPage,
						requestUserId : $('#user_id').val()
				};
				sendCommandByUserId(key, data);
			}
		}
		syncTimer = MAX_SYNC_TIMER;
	}

	// ページ遷移を押下してから10秒間待ち、全員からレスポンスが無ければ強制的に全員のページ変更アイコンを表示する(全員からレスポンスがあればキャンセルする)
	syncDocumentTimeoutId = setTimeout(function (){
		// 同期ユーザーの初期化
		syncUserDict = {};
		// タイマーIDの初期化
		syncDocumentTimeoutId = null;
		// 全員のページ変更アイコンと拡大アイコンを表示
		allShowDocumentMoveIcon();
	} , syncTimer);

	// データコネクションの状態を調べる
	dataConnectionRequestAck();
}

/**
 * 資料の拡大・縮小時の同期処理
 * １、ページ変更者から拡大・縮小を通知
 * ２、その他ユーザーがページを拡大・縮小したらページ変更者へメッセージ送信
 * ３、ページ変更者が全員のページ拡大・縮小メッセージを受け取るか５秒たったら、全員にアイコン表示メッセージ送信
 * ４、全員が拡大・縮小アイコンを表示する
 */
function syncChangeSizeDocument(){
	var syncTimer = MIN_SYNC_TIMER;
	if(Object.keys(mUserIdAndUserInfoArray).length > 0){
		// 現在接続している全ユーザーにページ遷移を通知する（ただし、自分自身は除く）
		for(key in mUserIdAndUserInfoArray){
			if($('#user_id').val() != key){
				// 同期するユーザー情報を保存する
				syncUserDict[key] = NO_RESPONSE_FLG;

				// ページ拡大縮小を相手に送信する
				var data = {
						command : "DOCUMENT",
						type : "CHANGE_DOCUMENT_SIZE",
						codumentViewState : codumentViewState,
						requestUserId : $('#user_id').val()
				};
				sendCommandByUserId(key, data);
			}
		}
		syncTimer = MAX_SYNC_TIMER;
	}
	// ページ遷移を押下してから10秒間待ち、全員からレスポンスが無ければ強制的に全員のページ変更アイコンを表示する(全員からレスポンスがあればキャンセルする)
	syncDocumentTimeoutId = setTimeout(function (){
		// 同期ユーザーの初期化
		syncUserDict = {};
		// タイマーIDの初期化
		syncDocumentTimeoutId = null;
		// 全員のページ変更アイコンと拡大アイコンを表示
		allShowDocumentMoveIcon();
	} , syncTimer);

	// データコネクションの状態を調べる
	dataConnectionRequestAck();
}


/**
 * 全員の資料ページ変更アイコンを表示する
 */
function allShowDocumentMoveIcon(){
	// 拡大アイコンを表示する
	viewExpansion(SHOW_ICON_FLG);
	// 他のユーザーのページ変更アイコン表示メッセージ
	// サムネイル削除をゲストへ通知する（メモリー上の資料を削除する）
	var data = {
			command : "DOCUMENT",
			type : "SHOW_DOCUMENT_ICON"
	};
	sendCommand(SEND_TARGET_ALL, data);
}

/**
 * ウインドウリサイズやウインドウスクロールを行った際に
 * 資料のアイコンの位置を調整する処理
 * @returns
 */
function redisplayDocumentIcon(){
	// 資料が表示されている場合は、ページ変更ボタンなどの位置を変更する
	if($("div#mi_docment_area").is(':visible') && !$("#negotiation_sync_message_area").isShow()){
		// 資料のキーを作成
		var keyName = "materialId_" + currentDocumentId;
		// ブラウザのセッションストレージからデータ取得
		mtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));
		if(mtSessionStorage && keyName in mtSessionStorage){
			// ダウンロードアイコンフラグ取得
			downloadFlg = mtSessionStorage[keyName]["material_basic"]["download_flg"];
			// ダウンロードアイコンの表示制御
			viewDownloadIcon(downloadFlg);
		}
	}
}

/**
 * 資料のリサイズと移動イベントを付与する処理
 * @returns
 */
function addDocumentAreaOperation(){
	// 資料領域の移動時
	var viewLeftPager = false;
	var viewRightPager = false;
	$("div#mi_docment_area").draggable({
		containment: "#mi_video_area",
		scroll: false,
		snapMode: "inner",
		start: function(event, ui) {
			// ページ変更アイコンの状態を保持する
			if($("#mi_scroll_arrow_left").is(':visible')){
				viewLeftPager = true;
				//$("#mi_scroll_arrow_left").hide();
			}
			if($("#mi_scroll_arrow_right").is(':visible')){
				viewRightPager = true;
				//$("#mi_scroll_arrow_right").hide();
			}
			// ページ・コメント・ダウンロードアイコンを非表示化
			$("#document_header_icon").hide();
		},
		stop: function(event, ui) {
			// ページ変更アsイコンの表示制御
			if(viewLeftPager){
				//$("#mi_scroll_arrow_left").show();
				viewLeftPager = false;
			}
			if(viewRightPager){
				//$("#mi_scroll_arrow_right").show();
				viewRightPager = false;
			}
			// ページャーの表示切替
			viewPager(SHOW_ICON_FLG);
			// ページ・コメント・ダウンロードアイコンの表示位置変更
			var keyName = "materialId_" + currentDocumentId;
			var mtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));
			var downloadFlg = mtSessionStorage[keyName]["material_basic"]["download_flg"];
			viewDownloadIcon(downloadFlg);
			// ページ・コメント・ダウンロードアイコンを表示
			$("#document_header_icon").show();
		}
	});
	$(document).on('touchstart', 'div#mi_docment_area', function(){
		if($('div#mi_docment_area').data('uiDraggable')){
			$("div#mi_docment_area").draggable('disable');
		}
	})
	$(document).on('touchmove', 'div#mi_docment_area', function(){
		if ($("div#mi_docment_area").css('overflow') === 'scroll') {
			$("div#mi_docment_area").css('overflow', 'overlay');
			$("div#document_canvas_area").css('overflow', 'scroll');
		}
		if($('div#mi_docment_area').data('uiDraggable')){
			$("div#mi_docment_area").draggable('enable');
		}
	})
}

/**
 * リサイズアイコンを変更する
 * @param bottom	スクロールのTOP位置
 * @param right		スクロールのLEFT位置
 * @param resetFlg	1:初期化, 0:位置変更
 * @returns
 */
function changeResizeIconOffset(bottom, right, resetFlg){
	if(resetFlg){
		// リサイズアイコンのstyleを初期化する
		$("div#mi_docment_area").find(".ui-resizable-se").removeAttr('style');
		$("div#mi_docment_area").find(".ui-resizable-se").css("z-index", 90);
		// スクロール位置をリセットする
		$("div#mi_docment_area").scrollTop(0);
		$("div#mi_docment_area").scrollLeft(0);
	}else{
		// リサイズアイコンの位置を変更する
		if(bottom > 0){
			bottom = (-bottom) + 1;	// 初期値が + 1なのでスクロールの値に足す(スクロールは0から始まるので)
		}else{
			bottom = 1;
		}
		if(right > 0){
			right = (-right) + 1;	// 初期値が + 1なのでスクロールの値に足す(スクロールは0から始まるので)
		}else{
			right = 1;
		}
		// スクロールTOPは+の値になっているので、-に変換して設定する
		//$("div#mi_docment_area").find(".ui-resizable-se").css("bottom", bottom);
		// スクロールLEFTは+の値になっているので、-に変換して設定する
		//$("div#mi_docment_area").find(".ui-resizable-se").css("right", right);
	}
}

/**
 * 相手から送信された資料情報を受取る関数
 * @param json
 */
// ゲストが現在表示している資料のハッシュキー
//var guestCurrentMaterialIdHash = "";		// 資料を特定する為のmaterial_idのmd5値
//var guestCurrentDocumentMaxCount = 0;		// 資料の最大ページ数
//var guestOperatorVideoTop = 0;			// オペレータのビデオが表示されていたTOP値（資料終了後に戻すため）
//var guestDocumentUrl = "";				// 資料がURLの場合はURLが設定される
//var guestCurrentMaterialDownloadFlg = 0;	// 資料をダウンロード出来るかどうかのフラグ
function receiveDocumentJson(json){
	if(json.type == "INIT_DOCUMENT"){
		// 送信されたデータを保存
		var keyName = json.keyName;
		var mtSessionStorageJson = json.mtSessionStorage;

		if( sessionStorageKeys.indexOf(keyName) >= 0 ) {
		} else {
			// keyの配列に存在しない場合は追加する
			sessionStorageKeys.push(keyName);
			sessionStorage.setItem("mtSessionStorageKeys", JSON.stringify(sessionStorageKeys));
		}

		// 資料が初めて表示の場合のみDICTにarrayを設定する（このarrayはペン等でいじったデータを保存用）
		sessionStorage.setItem(json.keyName, mtSessionStorageJson);

	}else if(json.type == "SHOW_DOCUMENT"){
		// ユーザー一覧ダイアログ表示中の場合は閉じる
		if($('#room-userlist-dialog').hasClass("ui-dialog-content") && $('#room-userlist-dialog').dialog('isOpen')) {
			$('#room-userlist-dialog').dialog('close');
		}
		// 資料を非表示にする
		hideDocumentCommon();
		// 表示する資料のIDとページを保存する
		currentDocumentId = json.currentDocumentId;
		currentPage = json.currentPage;
		// 資料を表示する
		showDocumentCommon(json.documentCanvasLeft, json.documentUrlFlg, json.document_user_id, json.documentUuId, json.documentMaterialId);
		// レイアウトをリセットする
		LayoutCtrl.apiMoveAllVideoFrameToShow();
		resetLayout(1);

		//資料が横長の場合のみ処理を行う
		if ($(".document_canvas_contents").height() < $(".document_canvas_contents").width()){
			// 資料表示の際に映像モーダルを表示するため、レイアウトをリセットする
			LayoutCtrl.apiMoveAllVideoFrameToShow();
			resetLayout(1);
		}

		// 資料レイアウトをリセットする
		resetMaterialLayout();

		setTimeout(function(){
			// 資料の倍率を修正する
			currentZoomValue = 1.0;
			$('#doc_scale_value').text(parseInt(currentZoomValue * 100) + '%');
			$('#doc_scale_range').val(parseInt(currentZoomValue * 100))

			// ナンバーをアップデート
			reloadPageNumber();

			// サイドバーをアップデートする
			sideBarUpdate(true);

			viewPager(SHOW_ICON_FLG);
		}, 500);

	}else if(json.type == "MOVE_DOCUMENT"){
		// 表示するページを設定
		currentPage = json.currentPage;
		// 資料を表示
		loadDocument(json.requestUserId, 0, 0);
		// ページャーの表示切替
		viewPager(SHOW_ICON_FLG);
	}else if(json.type == "RESET_PEN"){
		// ペンの書き込みをリセット
		resetPen();
		clearDocumentTextCurrentPage();

	}else if(json.type == "SCROLL_DOCUMENT"){
		// 資料の表示割合を計算する
		var proportionSize = getProportion();

		// 他ユーザーのスクロールを同期中のフラグを立てる
		syncMaterialScrollFlg = 1;
		// スクロール位置を変更
		$("div#mi_docment_scroll").scrollTop((json.scrollTop * proportionSize));
		$("div#mi_docment_scroll").scrollLeft((json.scrollLeft * proportionSize));

		// リサイズアイコンの位置を変更する
		changeResizeIconOffset(json.scrollTop * proportionSize, json.scrollLeft * proportionSize, 0);
	}else if(json.type == "HIDE_DOCUMENT"){
		// 資料を非表示にする
		hideDocumentCommon();
		// 資料の領域を非表示にする
		$("div#mi_docment_area").hide();

		// ビデオレイアウトのリセット
		$.each(NEGOTIATION.videoArray.show,function(){
			var tagName = "#negotiation_target_video_" + $(this).data("id");
			$(tagName).find(".video_big_icon").trigger('click');
			return false;
		});
		// 同席者の場合、自分でビデオ表示ができないのでビデオレイアウトのリセットを行う
		if($("#room_mode").val() == ROOM_MODE_2){
			$("#header_video_reset").trigger('click');
		}
		// 資料レイアウトをリセットする
		resetMaterialLayout();

	}else if(json.type == "MOUSE_POINTER"){
		if($("div#mi_docment_area").is(':visible') && currentDocumentId != 0){
			for (var i = 0; i < json.position.length; i++)
			{

				// 資料の表示割合を計算する
				var proportionSize = getProportion();

				// 線を描いた人の比率と自分の比率を考慮し計算を行う
				var proportionDrowX = json.position[i].drowX * proportionSize;
				var proportionDrowY = json.position[i].drowY * proportionSize;
				var proportionOnMouseX = json.position[i].onMouseX * proportionSize;
				var proportionOnMouseY = json.position[i].onMouseY * proportionSize;

				// キャンバスの外に要素を配置しているので、キャンバスの場所を特定しその差を足す
				var element = document.getElementById("document_canvas");
				var rect = element.getBoundingClientRect();
				// 要素の位置座標を計算
				var positionX = rect.left + window.pageXOffset ;	// 要素のX座標
				var positionY = rect.top + window.pageYOffset ;		// 要素のY座標
				// 要素の左上からの距離を計算
				var drowX = proportionDrowX + positionX;
				var drowY = proportionDrowY + positionY;
				// 強調ポインターが画像になったので、画像の大きさ分座標を調整する(constでやっていたが、ブラウザーごとに違うので、マジックナンバーで対応に変更)
				if(USER_PARAM_BROWSER == "Chrome"){
					drowX = drowX + 8;
					drowY = drowY - 10;
				}else if(USER_PARAM_BROWSER == "IE"){
					drowX = drowX + 10;
					drowY = drowY - 5;
				}else{
					drowX = drowX + 10;
					drowY = drowY - 10;
				}


				// 相手が強調ポインターの場合のみ画面にポインター表示を行う
				var mousePointName = "span#mouse_point_" + json.userId;
				if(json.position[i].selectLeftTool == TOOL_CURSORE_EMPHASIS){
					// カーソル要素が存在するか調べる
					if($(mousePointName).length){
						// 要素が存在する場合
						$(mousePointName).offset({ top: drowY, left: drowX });
					}else{
						// 要素が存在しない場合は要素を追加
						var mouserImg = getMousePointTag(drowX, drowY, json.userId);
						$("div#mi_docment_area").append(mouserImg);
					}
				}else{
					// 強調ポインター以外の場合はカーソルアイコンを削除する
					$(mousePointName).remove();
				}
				// オペレータが線を書いている場合はゲストの画面に線を引く
				if(json.position[i].writeLineFlg){
					if(json.position[i].selectLeftTool === TOOL_DRAW_TEXT){
						return;
					}
					// 線を描いた人の比率と自分の比率を考慮し計算を行う
					writeLine("document_canvas", proportionDrowX, proportionDrowY, proportionOnMouseX, proportionOnMouseY, json.position[i].line, json.position[i].color, json.position[i].selectLeftTool);
				}

			}
		}
	}else if(json.type == "SAVE_DOCUMENT"){
		// 画像を保存する為のイベント
		//saveDocument();
	}else if(json.type == "DELETE_DOCUMENT"){
		// ブラウザのセッションストレージからの削除とサムネイルの制御
		removeMaterialCommon(json.keyName, json.localMaterialId);
	}else if(json.type == "SHOW_DOCUMENT_COMPLET"){
		// 資料の描画完了ユーザーを保存する
		syncUserDict[json.responseUserId] = RESPONSE_FLG;
		// レスポンス状況を調べる
		var allSyncFlg = true;
		for(key in syncUserDict){
			if(syncUserDict[key] == NO_RESPONSE_FLG){
				// 同期が終わっていないユーザーがいる場合は待つ
				allSyncFlg = false;
				break;
			}
		}
		// 全員からレスポンスがあった場合は全員に資料のページ変更ボタンを出すメッセージを送信する
		if(allSyncFlg){
			// 同期ユーザーの初期化
			syncUserDict = {};

			// タイマーをキャンセルする
			if(syncDocumentTimeoutId != null){
				clearTimeout(syncDocumentTimeoutId);
				syncDocumentTimeoutId = null;
			}
			// 全員のページ変更アイコンを表示する
			allShowDocumentMoveIcon();
		}
	}else if(json.type == "SHOW_DOCUMENT_ICON"){
		// 拡大アイコンを表示する
		viewExpansion(SHOW_ICON_FLG);
	}else if(json.type == "UPLOAD_DOCUMENT_BEGIN"){
		// 他のユーザーがアップロードを開始(material_upload.js)
		disableUploadDocument();
		$("div.upload_document_message").text("アップロード中です");
		$("div.upload_document_message_area").show();
	}else if(json.type == "UPLOAD_DOCUMENT_END"){
		// 他のユーザーがアップロードを完了(material_upload.js)
		enableUploadDocument();
		$("div.upload_document_message").text("アップロード完了しました");
		setTimeout(function(){
			$("div.upload_document_message_area").hide();
		}, MESSAGE_TIMER);
		// オペレーターの場合は資料をサーバーから読み込む
		if ($('#is_operator').val() == "1") {
			if(json.resultMaterialId != 0){
				// サーバーから資料を１件取得する
				getMaterial(json.resultMaterialId, json.registUserId, json.staff_type, json.staff_id, json.client_id, json.uu_id);
				// tooltip表示
				$('.material_button_tooltip').tooltipster('open');
				// アップロードメッセージを消すためのタイマーを設定
				setTimeout(function(){
					$('.material_button_tooltip').tooltipster('close');
				}, MESSAGE_TIMER);
			}else{
				alert("ゲストの資料アップロードが失敗しました。");
			}
		}
	}else if(json.type == "CHANGE_DOCUMENT_SIZE"){
		// 拡大アイコンを非表示にする
		viewExpansion(HIDE_ICON_FLG);

		// 送信された現在の拡縮値を設定
		codumentViewState = json.codumentViewState;

		// 資料の倍率を修正する
		currentZoomValue = codumentViewState;
		$('#doc_scale_value').text(parseInt(currentZoomValue * 100) + '%');
		$('#doc_scale_range').val(parseInt(currentZoomValue * 100));

		// 資料倍率を変更を受け取ったユーザー用処理
		// 資料倍率が 100% の場合のみテキスト入力を許容する。
		checkCanDrawTextOnMaterial()

		// 現在コメントを表示しているか判定(オペレーターのみ)
		var commentViewFlg = 0;
		if($('#is_operator').val() == "1" && $("p.mi_document_note").is(':visible')){
			commentViewFlg = 1;
		}

		// キャンバスの拡大・縮小処理
		resizeCanvas(json.requestUserId);

		// 資料を再描画するとコメントが消えるので、拡大・縮小前にコメントを表示していた場合は再度表示させる(オペレーターのみ)
		if($('#is_operator').val() == "1" && commentViewFlg == 1){
			$("p.mi_document_note").show();
		}

		// 拡大値の初期値となる1の場合はリサイズアイコンを初期化する
		if(codumentViewState == 1){
			// 縮小時はリサイズアイコンの位置を初期化
			changeResizeIconOffset(0, 0, 1);
		}

	}else if(json.type == "DOWNLOAD_SHARE"){

		makeDefaultConfirmDialog(
			"資料をダウンロードしますか？",
			"共有された資料をダウンロードできます。", {
			checkbox: "書き込みを表示した状態でダウンロードする",
			default_checkbox: true,
			submit_event: function() {
				$("div.upload_document_message").text("ダウンロード中です");
				$("div.upload_document_message_area").show();
				let isOriginal = !$("#mi_confirm_dialog_checkbox_val").prop("checked");
				downloadDocument(json.document.materialId, json.document.clientId, json.document.staffType, json.document.staffId, json.document.connectionInfoId, isOriginal);
			},
			z_index:100000010
		});

	}else if(json.type == "REQUEST_ACK"){
		// 通知を受け取ったユーザーは発信者に返す
		var data = {
				command : "DOCUMENT",
				type : "RESPONCE_ACK",
				responseUserId : $('#user_id').val()
		};
		// ページ変更を行ったユーザーにメッセージ送信
		sendCommandByUserId(json.requestUserId, data);
	}else if(json.type == "RESPONCE_ACK"){
		// 通知の応答があったユーザーを保存する
		ackUserDict[json.responseUserId] = RESPONSE_FLG;
		// レスポンス状況を調べる
		var allAckFlg = true;
		for(key in ackUserDict){
			if(ackUserDict[key] == NO_RESPONSE_FLG){
				// 同期が終わっていないユーザーがいる場合は待つ
				allAckFlg = false;
				break;
			}
		}
		// 全員からレスポンスがあった場合は全員に資料のページ変更ボタンを出すメッセージを送信する
		if(allAckFlg){
			// 同期ユーザーの初期化
			ackUserDict = {};
			// タイマーをキャンセルする
			if(ackTimeoutId != null){
				clearTimeout(ackTimeoutId);
				ackTimeoutId = null;
			}
			console.log("responce all user");
		}
	}else if(json.type == "INIT_AND_SHOW_DOCUMENT"){
		// ==============================================================
		// 資料を初期化し表示まで行う（INIT_DOCUMENTとSHOW_DOCUMENTを実行する）
		// ==============================================================
		// 送信されたデータを保存
		var keyName = json.keyName;
		var mtSessionStorageJson = json.mtSessionStorage;

		if( sessionStorageKeys.indexOf(keyName) >= 0 ) {
		} else {
			// keyの配列に存在しない場合は追加する
			sessionStorageKeys.push(keyName);
			sessionStorage.setItem("mtSessionStorageKeys", JSON.stringify(sessionStorageKeys));
		}
		// 資料が初めて表示の場合のみDICTにarrayを設定する（このarrayはペン等でいじったデータを保存用）
		sessionStorage.setItem(json.keyName, mtSessionStorageJson);

		// jsonからオブジェクトに変換
		var mtSessionStorage  = $.parseJSON(mtSessionStorageJson);

		// 資料を非表示にする
		hideDocumentCommon();
		// 表示する資料のIDとページを保存する
		currentDocumentId = json.documentId;
		currentPage = json.currentPage;
		// 資料を表示する
		showDocumentCommon(json.documentCanvasLeft, json.documentUrlFlg, mtSessionStorage[keyName]["userId"], mtSessionStorage[keyName]["UUID"], json.documentId);

		// 資料レイアウトをリセットする
		resetMaterialLayout();
		// 資料表示の際に映像モーダルを表示する
		LayoutCtrl.apiMoveAllVideoFrameToShow();

	} else if (json.type == "CLOSE_DOCUMENT"){

		if($("div#mi_docment_area").is(':visible')){
			// 資料を非表示にする
			hideDocumentCommon();
			// 資料の領域を非表示にする
			$("div#mi_docment_area").hide();

			// 資料レイアウトをリセットする
			resetMaterialLayout();

			$("#header_video_reset").trigger('click');　// レイアウトを元に戻す.
		}
	}
}

/**
 * 資料を表示する共通処理
 * 同期処理で呼び出されるため関数化
 * @returns
 */
function showDocumentCommon(documentCanvasLeft, documentUrlFlg, documentUserId, documentUuId, documentMaterialId){
	// 拡大表示をリセット
	codumentViewState = 1;

	// ビデオを表示するために先に資料表示領域を表示
	$("div#mi_docment_area").show();

	// 資料を表示し、ビデオを資料用のビデオに変更する
	//	LayoutCtrl.apiSetMaterial();
	// 2018/04/25 太田
	LayoutCtrl.apiSetMaterial2();

	$("#document_user_id").val(documentUserId);
	$("#document_material_id").val(documentMaterialId);
	$("#document_uuid").val(documentUuId);

	// キャンバスに資料を表示する
	loadDocument(NO_NOTIFICATION, 1, 1);

	// URLの場合はページャーを削除し、ダウンロード等を消す
	if(documentUrlFlg){
		// ダウンロードアイコンを非表示にする
		$("div#document_header_icon").hide();
	}else{
	}
	//資料共有した際に、ページャー部分の値をリセットするため一度非表示にする
	$("div#document_header_icon").hide();
	//$("#mi_scroll_arrow_right").hide();

	$("#header_video_reset").trigger('click');　// レイアウトを元に戻す.
}

/**
 * 現在データコネクションが接続されているメンバー全員に対し要求を投げる
 * その後、レスポンスを受け誰と接続しているかを確認する
 * @returns
 */
var ackUserDict = {};		// 自分がデータコネクションの接続を確立しているユーザー
function dataConnectionRequestAck(){
	if(Object.keys(ackUserDict).length == 0){
		var syncTimer = MIN_SYNC_TIMER;
		if(Object.keys(mUserIdAndUserInfoArray).length > 0){
			var keyStr = "";
			// 現在接続している全ユーザーにページ遷移を通知する（ただし、自分自身は除く）
			for(key in mUserIdAndUserInfoArray){
				if($('#user_id').val() != key){
					// 同期するユーザー情報を保存する
					ackUserDict[key] = NO_RESPONSE_FLG;
					// ページ移動を相手に送信する
					var data = {
							command : "DOCUMENT",
							type : "REQUEST_ACK",
							requestUserId : $('#user_id').val()
					};
					sendCommandByUserId(key, data);
					// キーを文字列にして保存する
					keyStr += "["+key+"]";
				}
			}
			syncTimer = MAX_SYNC_TIMER;
		}

		// ページ遷移を押下してから10秒間待つ
		ackTimeoutId = setTimeout(function (){
			for(key in ackUserDict){
				if(ackUserDict[key] == NO_RESPONSE_FLG){
					console.log(key + " no responce");
				}
			}
			// 同期ユーザーできていないユーザーを出力する
			ackUserDict = {};
			// タイマーIDの初期化
			ackTimeoutId = null;
		} , syncTimer);
	}
}

/**
 * レイアウトをリセットする処理の実体
 * @param DropFlg
 */
function resetLayout(DropFlg){
	// ビデオレイアウトのリセット
	$.each(NEGOTIATION.videoArray.show,function(){
		// ビデオタグのstyleを削除する（移動やリサイズすると付与される）
		this.removeAttr('style');
		// ビデオタグを表示するためにstyleを付与する
		this.css("display", "block");
	});
	// 資料のリセット
	if($("div#mi_docment_area").is(':visible') && currentDocumentId != 0){
		// 資料タグのstyleを削除する（移動やリサイズすると付与される）
		$("div#mi_docment_area").removeAttr('style');
		// 資料タグを表示するためにstyleを付与する
		$("div#mi_docment_area").css("display", "block");
		//　資料がドロップされた場合は下記処理を行わない
		if(DropFlg){
			// アイコンなどの表示位置をリセットする
			documentResizeEvent();

		}
	}
}
// ユーザー名表示エリアが videoFrame幅を超えそうな場合などにwidthを調整する処理
function adjustUserNameWidth(userNamesOriginalWidthForVideo, isEnlarge) {
	Object.keys(userNamesOriginalWidthForVideo).forEach(function(dataId) {

	let userNameAreaWidth;
	let originalWidth = userNamesOriginalWidthForVideo[dataId];

	// originalWidthでmaxWidthを指定　念のため設定しなおす。
	$("#negotiation_target_video_" + dataId).find(".no_video").css("max-width", originalWidth + 'px');
	$("#negotiation_target_video_" + dataId).find(".on_video").css("max-width", originalWidth + 'px');

	const videoFrameWidth = $("#negotiation_target_video_" + dataId).width();

	if (videoFrameWidth !== null && videoFrameWidth > 0) {
			// カメラのオンオフで取得する方を変更する
			if ($('#negotiation_target_video_relative_no_video_' + dataId).css('display') === 'block') {
				// カメラoff時
				userNameAreaWidth =  $("#negotiation_target_video_" + dataId).find(".no_video").width();
			} else {
					// カメラon時
					userNameAreaWidth =  $("#negotiation_target_video_" + dataId).find(".on_video").width();
				}
				let defaultAdjustWidth = 50;
				let leftAdjustValue = 10;

				const isShowIcon = $("#negotiation_target_video_" + dataId).find('.video_mic_off_icon').css('display') === 'block'
					|| $("#other_video_mic_off_icon_" + dataId).css('display') === 'block';
				
				const targetIconWrapElement = $('#negotiation_target_video_' + dataId).find('.mi_video_icon_wrap');
				const hasLessThanSmall = targetIconWrapElement.hasClass('small') || targetIconWrapElement.hasClass('more_small') || targetIconWrapElement.hasClass('extra_small');

				// 標準のときは小アイコンになる
				if (!isEnlarge) {
					hasLessThanSmall === true;
				}

				if (isShowIcon) {
					defaultAdjustWidth = 70;
					leftAdjustValue = 35;

					if (hasLessThanSmall) {
						leftAdjustValue = 28;
					}
					$("#negotiation_target_video_" + dataId).find(".on_video").css("left", leftAdjustValue);
				} else {
					$("#negotiation_target_video_" + dataId).find(".on_video").css("left", leftAdjustValue);
				}
				// 調整値を拡大用と、縮小（標準用で分ける）
				let totalAdjustValue = 0;
				if (isEnlarge) {
					totalAdjustValue = defaultAdjustWidth + leftAdjustValue;
				} else {
					totalAdjustValue = leftAdjustValue;
				}

				if( userNameAreaWidth < originalWidth) {
					// width0が入ることがあり、正しく判定されないことから、入れておく。
					userNameAreaWidth = originalWidth;
				}
				if (videoFrameWidth < userNameAreaWidth + totalAdjustValue) {
					$("#negotiation_target_video_" + dataId).find(".no_video").width(videoFrameWidth - defaultAdjustWidth);
					$("#negotiation_target_video_" + dataId).find(".on_video").width(videoFrameWidth - defaultAdjustWidth);
				} else {
					$("#negotiation_target_video_" + dataId).find(".no_video").width('auto');
					$("#negotiation_target_video_" + dataId).find(".on_video").width('auto');
				}
			}
	});
}

/**
 * 資料リセット
 */
function resetMaterialLayout(){
	// ビデオレイアウトのリセット
	$.each(NEGOTIATION.videoArray.show,function(){
// Video画面のレイアウトは変更しないため処理削除(コメント)
// 2018/04/20 太田
//		// ビデオタグのstyleを削除する（移動やリサイズすると付与される）
//		this.removeAttr('style');
		// ビデオタグを表示するためにstyleを付与する
		this.css("display", "block");
	});

	// 資料のリセット
	if($("div#mi_docment_area").is(':visible') && currentDocumentId != 0){
		// 資料タグのstyleを削除する（移動やリサイズすると付与される）
		$("div#mi_docment_area").removeAttr('style');
		// 資料タグを表示するためにstyleを付与する
		$("div#mi_docment_area").css("display", "block");
		// アイコンなどの表示位置をリセットする
		documentResizeEvent();
	}
}

/**
 * 資料の表示を閉じて情報をDICTから削除する
 */
function hideAndRremoveMaterial(material_id) {
	var localMaterialId = material_id;
  	hideDocument();

	if(localMaterialId){
		if(localMaterialId != currentDocumentId){
			// キーを作成
			var keyName = "materialId_" + localMaterialId;
			// ストレージの資料削除実行
			removeMaterialCommon(keyName, localMaterialId);

			// サムネイル削除をゲストへ通知する（メモリー上の資料を削除する）
			var data = {
					command : "DOCUMENT",
					type : "DELETE_DOCUMENT",
					keyName : keyName,
					localMaterialId : localMaterialId
			};
			sendCommand(SEND_TARGET_ALL, data);
		}else{
			//console.log("表示中の資料は削除できません。");
		}
	}
}

/**
 * 画面幅ごとにfooterのボタン幅を調整する
 */
function buttonSizeContorol(largeSize,smallSize){
	const footerLargeButton = $("button.footer_large_button");
	const footerSmallButton = $("button.footer_small_button");
	footerLargeButton.css('width',largeSize);
	footerSmallButton.css('width',smallSize);
}

/**
 * 資料の最大追加枚数width指定し、画面ごとに制御する
 */


/**
 * 画面幅を縮小した際にfooter部分のサイズを調整する
 */
$(function() {
	$(window).on('load resize', function() {
		// 画面幅
		var clirntWidth = document.documentElement.clientWidth;
		// 表示されている資料数
		var documentCurrentCount = $(".mi_document_select ul li").length;

		// 1200以上1500以下
		if(clirntWidth > 1200&&clirntWidth <= 1500){
			buttonSizeContorol('130px','110px')
			if(documentCurrentCount>=5){
				showThumbnailArrow();
			}

		// 1080以上1200以下
		}else if(clirntWidth <= 1200&&clirntWidth > 1080){
			buttonSizeContorol('130px','110px');
			if(documentCurrentCount>=3){
				showThumbnailArrow();
			}

		// 1080以下
		}else if(clirntWidth <= 1080){
			buttonSizeContorol('130px','110px');
			if(documentCurrentCount>=2){
				showThumbnailArrow();
			}
		// 1500以上
		}else {
			buttonSizeContorol('145px','145px');
			if(documentCurrentCount>=4){
				showThumbnailArrow();
			}
		}
	});
});

/**
 * 資料サムネイルを表示する
 * @returns
 * ※類いロジックが「material.js[getThumbnailCount()]」にも存在するので修正した場合は確認する事！！
 */
function viewThumbnail(){
	//資料がある場合のみdisplay:noneを解除する
	$('div.document_addition_wrap').css('display','block');
	$('footer.mi_video').css('text-align','left');
	$('div.remove_material').css('text-align','center');

	var uuid = localStorage.UUID;
	if( !uuid ) {	// 空
		uuid = UUID.generate();
		localStorage.UUID = uuid;
	}

	// サムネイル領域の初期化
	$("div.mi_document_select ul").empty();
	if( sessionStorageKeys.length > 0 ) {
		var thumbnailviewCount = 0;
		for ( var i = 0; i < sessionStorageKeys.length; i++) {
			var keyName = sessionStorageKeys[i];
			// セッションストレージから資料データを取得する
			var mtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));
			if( mtSessionStorage ){
				/***
				 * ゲストの場合(ローカルストレージのUUIDで判定)
				 */
				if( uuid == mtSessionStorage[keyName]["UUID"] ) {
					// サムネイル画像のパスを作成
					var ext = (mtSessionStorage[keyName]["material_basic"]["material_ext"] == '') ? 'jpg' : mtSessionStorage[keyName]["material_basic"]["material_ext"];
					var filePath = "/cmn-data/" + mtSessionStorage[keyName]["material_basic"]["md5_file_key"] + "-1." + ext;
					// サムネイルのタグを作成
					var thumbnailTag = '<li class="thumbnail_image"><img src="'+filePath+'" alt="'+ mtSessionStorage[keyName]["material_basic"]["material_name"] +'" class="mi_document_icon"  id="'+mtSessionStorage[keyName]["material_basic"]["material_id"]+'" draggable="true" ondragstart="materialDragStart(event)" ondragend="materialDragEnd(event)" ontouchmove="TouchEvent(event)" ontouchend="TouchEndEvent(event)" /></li>';
					// サムネイル画像の追加
					$("div.mi_document_select ul").append(thumbnailTag);
					// サムネイルの表示数をカウントアップする
					thumbnailviewCount++;
				}
			}
		} // for_end

		$(window).resize(function(){

			// 資料数と画面幅ごとにマージン調整
			var documentCurrentCount = $(".mi_document_select ul li").length;
			if(documentCurrentCount){
				showMoveThumbnailIcon(documentCurrentCount);
			}
		});
	}``
}

/**
 * 資料倍率が 100% の場合のみテキスト入力を許容する。
 */
function checkCanDrawTextOnMaterial() {
// MEMO.　仕様変更　資料拡大率100％以外でもテキスト入力できるようにする.
//	if (codumentViewState == 1) {
//		$('.left_icon_text').show();
//	} else {
//		$('.left_icon_text').hide();
//	}
}

/**
* 資料へのペンの書き込みをリセットする
*/
function resetPen() {
	// コンテキストを取得
	var canvas = document.getElementById("document_canvas");
	var context = canvas.getContext('2d');
	// 資料の高さ、横幅の取得
	var documentHeight = canvas.scrollHeight;
	var documentWidth = canvas.scrollWidth;
	// 現在の透過を取得する
	var tmpGlobalAlpha = context.globalAlpha;
	// 透過情報を初期化する
	context.globalAlpha = 1.0;
	// 塗りつぶしの色を設定
	context.fillStyle  = "#ffffff";  // なんでもOK
	context.globalCompositeOperation = 'destination-out';
	// 初期化
	context.fillRect(0, 0, documentWidth, documentHeight);
	// 透過情報を戻す
	context.globalAlpha = tmpGlobalAlpha;
	saveDocument('on');

}