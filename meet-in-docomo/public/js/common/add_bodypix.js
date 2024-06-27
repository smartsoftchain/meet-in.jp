/*
 * 背景画像登録関連で使用するJS
 */
$(function () {
	/* 画像追加ボタン押下時のイベント */
	$("#btn_add_background_image").click(function () {
		// 背景画像選択モーダルを非表示にする
		$("#setting-bodypix-dialog").fadeOut(500);
		// 背景画像登録モーダルの初期化
		initAddBodypixModal();
		// 背景画像登録モーダル表示
		$("#modal-content-add-bodypix").fadeIn(500);
		// モーダル内のスクロールを最上段へ
		$(".modal_content_add_bodypix_area").scrollTop(0);
	});

	/**
	 * 背景画像登録モーダルの初期化
	 */
	function initAddBodypixModal(){
		// ファイル名の初期化
		$(".upload_file_bodypix_name").empty();
		// 背景画像登録モーダルの初期化
		cbbi = cvsBeforeBodypixImage.getContext('2d');
		cbbi.clearRect(0, 0, cbbiw, cbbih);
		cabi = canvasAfterBodypixImage.getContext('2d');
		cabi.clearRect(0, 0, cabiw, cabih);
		// 画像切り出し領域を非表示にする
		$(".bodypix_cutting_area").hide();
	}

	/* 背景画像登録キャンセルボタン押下時のイベント */
	$("#button_cancel_bodypix_image").click(function () {
		// 背景画像登録モーダル表示
		$("#modal-content-add-bodypix").fadeOut(500);
		// 背景画像選択モーダルを非表示にする
		$("#setting-bodypix-dialog").fadeIn(500);
	});
	/* ファイルアップロード関連 */
	var bodypixDragAndDrop = $("#upload_bodypix_image_area");
	bodypixDragAndDrop.on("dragenter", function(e){
		e.stopPropagation();
		e.preventDefault();
		$("#upload_bodypix_image_area").addClass("hover_upload_bodypix_image");
		return false;
	});
	bodypixDragAndDrop.on("dragover", function(e){
		e.stopPropagation();
		e.preventDefault();
		$("#upload_bodypix_image_area").addClass("hover_upload_bodypix_image");
		return false;
	});
	bodypixDragAndDrop.on("dragleave", function(e){
		e.stopPropagation();
		e.preventDefault();
		$("#upload_bodypix_image_area").removeClass("hover_upload_bodypix_image");
		return false;
	});
	bodypixDragAndDrop.on("drop", function(_e){
		_e.stopPropagation();
		_e.preventDefault();
		var e = _e;
		if( _e.originalEvent ) {
			e = _e.originalEvent;
		}
		// ファイルデータ取得
		var files = e.dataTransfer.files;
		// ファイルのチェックを行う
		validFile(files);
		$("#upload_bodypix_image_area").removeClass("hover_upload_bodypix_image");
		return false;
	});
	/* file input の状態が変わった時のイベント */
	$("#file_upload_bodypix").on("change", function() {
		validFile(this.files);
	});

	/**
	 * ファイルのチェックを行い、エラーがなければファイル名を画面上に表示する
	 */
	function validFile(files){
		$('#upload_file_bodypix_message').text('');
		// ドロップは1ファイルのみ
		if(files.length != 1) {
			$('#upload_file_bodypix_message').text('１つのファイルを選択してください');
			$("#file_upload_bodypix").val("");
			return;
		}
		if(files[0].size == 0){
			$('#upload_file_bodypix_message').text('ファイルサイズが0バイトです');
			$("#file_upload_bodypix").val("");
			return;
		}
		// ファイル拡張子チェック
		if (!files[0].name.toLowerCase().match(/.+\.(gif|jpg|jpeg|png)$/)) {
			$('#upload_file_bodypix_message').text('アップロード可能ファイルはgif/jpg/jpeg/pngです');
			$("#file_upload_bodypix").val("");
			return;
		}
		// エラーがない場合はファイル名を画面に設定する
		$(".upload_file_bodypix_name").empty();
		$(".upload_file_bodypix_name").append(files[0].name);
		
		// ファイルの内容はFileReaderで読み込む
		var fileReader = new FileReader();
		fileReader.onloadend = function (event) {
			// 画像切り出し領域を表示にする
			$(".bodypix_cutting_area").show();
			// 画像を画面に表示する
			img.src = event.target.result;
		};
		// ファイルをデータURIとして読み込む
		fileReader.readAsDataURL(files[0]);
	}

	/**
	 * 以下、画像切り出し機能
	 */
	// アップロードされた画像のcanvasオブジェクト
	const cvsBeforeBodypixImage = document.getElementById('canvas_before_bodypix_image');//$("#canvas_before_bodypix_image");
	// アップロードされた画像のcanvasオブジェクトの幅
	const cbbiw = cvsBeforeBodypixImage.width;
	// アップロードされた画像のcanvasオブジェクトの高さ
	const cbbih = cvsBeforeBodypixImage.height;
	// ４対３で切り出した画像のcanvasオブジェクト
	const canvasAfterBodypixImage = document.getElementById('canvas_after_bodypix_image');
	// ４対３で切り出した画像のcanvasオブジェクトの幅
	const cabiw = canvasAfterBodypixImage.width;
	// ４対３で切り出した画像のcanvasオブジェクトの高さ
	const cabih = canvasAfterBodypixImage.height;
	
	// 中心座標
	let ix = 0;
	let iy = 0;
	// 拡大縮小率
	let scalingValue = 1.0;

	/**
	 * 画像が読み込まれた際の処理
	 */
	const img  = new Image()
	img.onload = function( _ev ){   // 画像が読み込まれた
		ix = img.width  / 2;
		iy = img.height / 2;
		let scl = parseInt( cbbiw / img.width * 100 );
		$("#scal_bodypix_image").val(scl);
		scaling(scl);
	}
	/*
	function load_img( _url ){  // 画像の読み込み
		img.src = ( _url ? _url : 'https://delphinus2.sense.co.jp/img/ayutaya.jpeg' )
	}
	load_img();
	*/

	/**
	 * スライダーが変更された場合のイベント
	 * スライダー変更関数の呼び出しを行うのみ
	 */
	$('#scal_bodypix_image').on('input', function () {
		// スケール変更時の処理
		scaling($(this).val());
	});

	// スライダーが変更された場合の処理
	function scaling(_scalingValue) {
		// 拡大縮小率を更新する
		scalingValue = parseInt(_scalingValue) * 0.01;
		// 画像を更新する
		draw_canvas(ix, iy);
	}

	// 読み込み画像をキャンバスへ描画する
	function draw_canvas( _x, _y ){
		// context取得
		const ctx = cvsBeforeBodypixImage.getContext('2d');
		// 背景の塗り潰し設定と塗り潰し処理
		ctx.fillStyle = 'rgb(200, 200, 200)';
		ctx.fillRect(0, 0, cbbiw, cbbih);
		// 画像を描画する
		let dx       = (cbbiw / 2) - _x * scalingValue;
		let dy       = (cbbih / 2) - _y * scalingValue;
		let dWidth   = img.width  * scalingValue;
		let dHeight  = img.height * scalingValue;
		ctx.drawImage(img, 0, 0, img.width, img.height, dx, dy, dWidth , dHeight);
		// 枠のスタイル設定と枠を描画する処理
		ctx.strokeStyle = 'rgba(200, 0, 0, 0.8)';
		ctx.strokeRect( (cbbiw - cabiw) / 2, (cbbih - cabih) / 2, cabiw, cabih );
	}

	/**
	 * 画像の切り出しボタン押下時の処理
	 * 画像切り出し関数を呼び出す
	 */
	$("#btn_crop").click(function () {
		// 画像の切り出し処理
		crop_img();
	});

	// 画像の切り出し処理
	function crop_img(){
		// context取得
		const ctx = canvasAfterBodypixImage.getContext('2d');
		// 背景の塗り潰し設定と塗り潰し処理
		ctx.fillStyle = 'rgb(200, 200, 200)';
		ctx.fillRect( 0, 0, cabiw, cabih );
		// 画像を描画する
		let dx      = (cabiw / 2) - ix * scalingValue;
		let dy      = (cabih / 2) - iy * scalingValue;
		let dWidth  = img.width  * scalingValue;
		let dHeight = img.height * scalingValue;
		ctx.drawImage( img, 0, 0, img.width, img.height, dx, dy, dWidth, dHeight);
	}
	// canvas ドラッグ中フラグ
	let mouse_down = false;
	// canvas ドラッグ開始位置
	let sx = 0;
	let sy = 0;

	// canvas ドラッグ開始イベント（マウスとタッチ）
	cvsBeforeBodypixImage.ontouchstart =
	cvsBeforeBodypixImage.onmousedown = function (_ev){
		// ドラッグ開始フラグを立てる
		mouse_down = true;
		// ドラッグ開始座標取得
		sx = _ev.pageX;
		sy = _ev.pageY;
		// イベントを止める
		return false;
	}
	// canvas ドラッグ終了イベント（マウスとタッチ）
	cvsBeforeBodypixImage.ontouchend =
	cvsBeforeBodypixImage.onmouseout =
	cvsBeforeBodypixImage.onmouseup = function (_ev){
		// ドラッグを開始していなければ処理を中断する
		if ( mouse_down == false ){
			return;
		}
		// ドラッグ開始フラグを下ろす
		mouse_down = false;
		// 画像をキャンバスへ描画する
		draw_canvas( ix += (sx - _ev.pageX) / scalingValue, iy += (sy - _ev.pageY) / scalingValue );
		// イベントを止める
		return false;
	}
	// canvas ドラッグ中のイベント（マウスとタッチ）
	cvsBeforeBodypixImage.ontouchmove =
	cvsBeforeBodypixImage.onmousemove = function ( _ev ){
		// ドラッグを開始していなければ処理を中断する
		if ( mouse_down == false ){
			return;
		}
		// 画像をキャンバスへ描画する
		draw_canvas( ix + (sx - _ev.pageX) / scalingValue, iy + (sy - _ev.pageY) / scalingValue);
		// イベントを止める
		return false;
	}
	// canvas ホイールで拡大縮小イベント
	cvsBeforeBodypixImage.onmousewheel = function ( _ev ){
		// スケールバーが表示されている場合のみ、スケール変更を行う
		if($('#scal_bodypix_image').is(':visible')){
			let scl = parseInt( parseInt( $("#scal_bodypix_image").val() ) + _ev.wheelDelta * 0.05 );
			if (scl < 10){
				// 最小値より小さい場合は、最小値を設定する
				scl = 10;
			}
			if (scl > 400){
				// 最大値より大きい場合は、最大値を設定する
				scl = 400;
			} 
			// スケールを設定する（スケールバーの位置を変更する）
			$("#scal_bodypix_image").val(scl);
			// スライダーが変更された場合の処理を実行する
			scaling(scl);
		}
		// イベントを止める
		return false;
	}

	/**
	 * 画像登録処理
	 */
	$("#button_add_bodypix_image").click(function () {
		// 登録ボタンを連打できない様に制御する
		$('#button_add_bodypix_image').prop("disabled", true);
		// 画像をBlob化
		var canvas = document.getElementById("canvas_after_bodypix_image");
		var pngImg = canvas.toDataURL("image/png");
		// 商談画面の場合はゲストの登録を考慮し、ゲストIDを取得する
		var bodypixGuestId = sessionStorage.getItem('bodypixGuestId');
		if(!bodypixGuestId){
			// ゲストIDが存在しない場合は作成する
			sessionStorage.setItem('bodypixGuestId', localStorage.UUID);
			bodypixGuestId = sessionStorage.getItem('bodypixGuestId');
		}
		$.ajax({
			type: "POST",
			url: "/common/save-bodypix-image",
			dataType: "json",
			data: {"bodypixImg" : pngImg, bodypixGuestId : bodypixGuestId}
		}).done(function(result) {
			// jsonをオブジェクトに変換
			if(result.status == 1){
				// 画像削除ボタンの初期化を行う
				initBtnBackgroundImage();
				// 背景画像登録画面を非表示にする
				$("#modal-content-add-bodypix").fadeOut(500);
				// 背景選択ダイアログを開く
				onClickSettingBodypixDialog();
			}else{
				// 登録失敗時はエラーメッセージを表示する
				alert(result.error);
			}
			// ボタンを押せるようにする
			$('#button_add_bodypix_image').prop("disabled", false);
		}).fail(function(data) {
			// エラーを表示する
			alert("画像登録が失敗しました。時間を置いて再度実行してください。");
			// ボタンを押せるようにする
			$('#button_add_bodypix_image').prop("disabled", false);
		});
	});

	/**
	 * ユーザー登録画像が押下された場合
	 */
	$(document).on('click', '.gallery', function(){
		// ユーザー登録画像か判定する
		if($(this).hasClass("user_add_bodypix")){
			// 背景画像に設定中の画像パス取得
			let currentBodypixImage = "";
			if(location.pathname.indexOf('/admin/document-settings-background') != -1){
				// 管理画面の場合
				currentBodypixImage = $("#file_img").attr("src").split("?")[0];
			}else{
				// 商談画面の場合
				currentBodypixImage = $("#bodypix_background_path").val().split("?")[0];
			}
			// 編集・削除画像パスを取得
			let imgPath = $(this).find("img").attr("src").split("?")[0];
			// 選択した画像が、背景設定していない場合のみ削除機能を有効にする
			if(currentBodypixImage != imgPath){
				// ユーザー登録画像の場合は削除ボタンを表示する
				$("#btn_del_background_image").show();
				// 削除ボタンに削除対象の画像パスを設定する
				$("#btn_del_background_image").data("bodypixImagePath", imgPath);
			}else{
				// 選択画像と背景画像が同じ場合は、削除ボタンを初期化する
				initBtnBackgroundImage();
			}
		}else{
			// 画像削除ボタンの初期化を行う
			initBtnBackgroundImage();
		}
	});

	/**
	 * 画像削除処理
	 */
	$("#btn_del_background_image").click(function () {
		// 登録ボタンを連打できない様に制御する
		$('#btn_del_background_image').prop("disabled", true);
		// 画像パスが取得できた場合は編集処理
		var delImgPath = $("#btn_del_background_image").data("bodypixImagePath");
		$.ajax({
			type: "POST",
			url: "/common/del-bodypix-image",
			dataType: "json",
			data: {"delImgPath" : delImgPath}
		}).done(function(result) {
			// jsonをオブジェクトに変換
			if(result.status == 1){
				// 画像削除ボタンの初期化を行う
				initBtnBackgroundImage();
				// 背景画像選択モーダルを非表示にする
				$("#setting-bodypix-dialog").fadeOut(500);
				// 背景選択ダイアログを開く
				onClickSettingBodypixDialog();
			}else{
				// 登録失敗時はエラーメッセージを表示する
				alert(result.error);
			}
			// ボタンを押せるようにする
			$('#btn_del_background_image').prop("disabled", false);
		}).fail(function(data) {
			// エラーを表示する
			alert("画像削除が失敗しました。時間を置いて再度実行してください。");
			// ボタンを押せるようにする
			$('#btn_del_background_image').prop("disabled", false);
		});
	});

	
});

/**
 * 画像削除ボタンの初期化を行う
 */
function initBtnBackgroundImage(){
	// ユーザー登録画像の場合は削除ボタンを非表示する
	$("#btn_del_background_image").hide();
	// 削除ボタンの削除対象の画像パスを初期化する
	$("#btn_del_background_image").data("bodypixImagePath", "");
}

function changeGuestBodyPix(imagePath){
	// 選択中の背景画像を表すクラスを削除する
	$("div.setting_bodypix_contents_area").find(".gallery-selected").removeClass("gallery-selected");
	// 背景画像のタグをコピーし、画像パスなど必要な値を設定する
	let imgTag = $("div#bodypix_no_effect").clone();
	imgTag.attr("id", imagePath);
	imgTag.find("img").attr("src", imagePath);
	// 登録した画像を選択中にする
	imgTag.addClass("gallery-selected");
	// コピーした画像タグを画面に設定する
	$("#gallery-contents").append(imgTag);

	bodyPixCanvas.style.filter = 'brightness(125%)';
	var videoConstranints = getVideoConstraints('idealVga');
	cameraOff();
	cameraOn(videoConstranints);
	const is_operator = document.getElementById('is_operator').value || '0';
	if (is_operator != '1') {
		bodypix_dialog_after_load_event = false;
	}
	let internalResolutionVal = $('#internalResolutionInput').val();
	internalResolution = 45 / 100;

	let segmentationThresholdVal = $('#segmentationThresholdInput').val();
	segmentationThreshold = 75 / 100;

	let maskBlurAmountVal = $('#maskBlurAmountInput').val();
	maskBlurAmount = 0;

	const galleries = document.querySelector('.gallery-selected');
	checkboxBokehEffect = false;
	loadBodypixBkgndImage(imagePath);
	startBodyPixCanvasVideo();
	$("#setting-bodypix-dialog").fadeOut(500);
}