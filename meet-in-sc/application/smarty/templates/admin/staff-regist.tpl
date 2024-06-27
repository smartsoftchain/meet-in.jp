{include file="./common/header.tpl"}

{literal}
	<meta name="viewport" content="width=960,maximum-scale=1.0">
	<meta http-equiv="Pragma" content="no-cache" />
	<meta http-equiv="cache-control" content="no-cache" />
	<meta http-equiv="expires" content="0" />
<script>
$(function (){
	// 写真ファイルを読む
	function readPictureFile(fileName, file, type) {
		// ファイルの内容は FileReader で読み込みます.
		var fileReader = new FileReader();
		fileReader.onloadend = function(event) {
			// HTMLに書き出し (src属性にデータURIを指定)
			if(type == "picture"){
				document.getElementById( "preview_picture" ).src = event.target.result;
				document.getElementById( "picture_flg" ).value = 1;
			} else if(type == "photo1"){
				document.getElementById( "preview_photo1" ).src = event.target.result;
				document.getElementById( "photo1_flg" ).value = 1;
			} else {
				document.getElementById( "preview_photo2" ).src = event.target.result;
				document.getElementById( "photo2_flg" ).value = 1;
			}
			// データURLスキームを取得
			var data_url_scheme = fileReader.result;
			var sType = null;
			var sId = null;
			if ( document.getElementById( "staffType" ) != null ) {
				sType = document.getElementById( "staffType" ).value;
			}
			if ( document.getElementById( "staffId" ) != null ) {
				sId = document.getElementById( "staffId" ).value;
			}
		}
		// ファイルをデータURIとして読み込む
		fileReader.readAsDataURL( file ) ;
	};

	// ファイルアップロード候補の情報を画面に表示する
	function showUploadPictureFile(files, type) {
		var file = files[0];
		var uploadFileName = file.name;
		if (uploadFileName.toLowerCase().match(/.+\.(jpe?g|png)$/)) {
			if (file.size / 1048576 <= 1) {
				// ファイルの内容は FileReader で読み込みます.
				readPictureFile(file.name, file, type);
				return true;
			} else {
				alert("アップロードできるのは1Mまでです。");
			}
		} else {
			alert("アップロード出来るのはJPEGまたはPNGファイルのみです。");
		}
		// 選択エラーのため未選択
		if(type == "picture"){
			var c = $("#picture").clone(true);
			c.val('');
			$("#picture").replaceWith(c);
		}else if(type == "photo1"){
			var c = $("#namecard_photo1").clone(true);
			c.val('');
			$("#namecard_photo1").replaceWith(c);
		}else{
			var c = $("#namecard_photo2").clone(true);
			c.val('');
			$("#namecard_photo2").replaceWith(c);
		}
		return false;
	}

	// 名刺ファイルアップロード候補の情報を画面に表示する
	function showUploadNamecardFile(files) {
		var file = files[0];
		var uploadFileName = file.name;
		if (uploadFileName.toLowerCase().match(/.+\.(jpe?g|pdf)$/)) {
			// ファイルをサーバへアップロード(プレビューでダウンロードさせるため)
			file_upload().done(function(result) {
				// 前の名刺データをクリア
				$("#namecard_image_file").empty();
				$("#namecard_image_file").append('<a href="'+ result['filename'] +'" target="_blank"><span class="icon-businesscard" alt="Namecard Image" id="namecardpreview"></span></a>');
				$("#tmp_namecard").val(result['filename']);
				$('#namecard_flg').val(1);
			}).fail(function(result) {
				// 異常の場合なにもしない！！
			});
			return true;
		} else {
			alert("アップロード出来るのはJPGとPDFファイルのみです。");
		}
		// 選択エラーのため未選択
		var c = $("#namecard").clone(true);
		c.val('');
		$("#namecard").replaceWith(c);
		return false;
	}

	/*================================================
		名刺データをサーバへ送信する処理
		戻り値：保存ファイル名(URLパス)
	=================================================*/
	function file_upload() {
		//Ajaxで飛ばすdata（FromDataオブジェクト）を生成する処理
		var formdata = new FormData();
		formdata.append( "namecard_file", $("#namecard").prop("files")[0] );
		formdata.append( "staff_type", $("[name=staff_type]").val() );
		formdata.append( "staff_id", $("[name=staff_id]").val() );
		formdata.append( "namecard_client_id", $("[name=namecard_client_id]").val() );
		// POSTでアップロード
		return $.ajax({
			url: "/admin/namecard-save",
			type: "POST",
			data: formdata,
			dataType: "json",
			cache: false,
			contentType: false,
			processData : false,
		})
	}

	/*================================================
		ファイルボタンを押した時の処理
	=================================================*/
	// プロフィール
	$('#picture').change(function(){
		// ファイル情報を取得
		var files = this.files;
		return showUploadPictureFile(files, "picture");
	});
	// 写真1のファイルボタン押下時
	$('#namecard_photo1').change(function(){
		// ファイル情報を取得
		var files = this.files;
		return showUploadPictureFile(files, "photo1");
	});
	// 写真2のファイルボタン押下時
	$('#namecard_photo2').change(function(){
		// ファイル情報を取得
		var files = this.files;
		return showUploadPictureFile(files, "photo2");
	});
	// 名刺ファイル変更イベント
	$('#namecard').change(function(){
		// ファイル情報を取得
		var files = this.files;
		return showUploadNamecardFile(files);
	});

	/*================================================
		削除ボタンを押した時の処理
	=================================================*/
	// プロフィール画像削除ボタン押下
	$("#profile-delete").on('click', function() {
		if (confirm("写真を削除しますが、よろしいでしょうか。")) {
			// 表示クリア
			$("#preview_picture").attr("src","/img/no-image.png?");
			$("#preview_picture").attr("alt","NoImage");
			// File 初期化(input type=file タグを再設定)
			var c = $("#picture").clone(true);
			c.val('');
			$("#picture").replaceWith(c);
			// hidden初期化
			$("#tmp_profile").val("");	// 一時ファイルクリア
			$("#picture_flg").val(0);	// 削除ON
		}
	});

	// 名刺データ削除ボタン押下
	$("#namecard_file-delete").on('click', function() {
		if (confirm("名刺データを削除しますが、よろしいでしょうか。")) {
			// 表示クリア
			$("#namecard_image_file").empty();
			// File 初期化(input type=file タグを再設定)
			var c = $("#namecard").clone(true);
			c.val('');
			$("#namecard").replaceWith(c);
			// hidden初期化
			$("#tmp_namecard").val("");	// 一時ファイルクリア
			$("#namecard_flg").val(0);	// 削除ON
		}
	});

	// 写真１データ削除ボタン押下
	$("#namecard_photo1-delete").on('click', function() {
		if (confirm("写真１を削除しますが、よろしいでしょうか。")) {
			// 表示クリア
			$("#preview_photo1").attr("src","/img/no_image.png");
			$("#preview_photo1").attr("alt","NoImage");
			// File 初期化(input type=file タグを再設定)
			var c = $("#namecard_photo1").clone(true);
			c.val('');
			$("#namecard_photo1").replaceWith(c);
			// hidden初期化
			$("#tmp_photo1").val("");	// 一時ファイルクリア
			$("#photo1_flg").val(0);	// 削除ON
		}
	});

	// 写真２データ削除ボタン押下
	$("#namecard_photo2-delete").on('click', function() {
		if (confirm("写真２を削除しますが、よろしいでしょうか。")) {
			// 表示クリア
			$("#preview_photo2").attr("src","/img/no_image.png");
			$("#preview_photo2").attr("alt","NoImage");
			// File 初期化(input type=file タグを再設定)
			var c = $("#namecard_photo2").clone(true);
			c.val('');
			$("#namecard_photo2").replaceWith(c);
			// hidden初期化
			$("#tmp_photo2").val("");	// 一時ファイルクリア
			$("#photo2_flg").val(0);	// 削除ON
		}
	});

	// 名刺プレビューボタン押下
	$("#preview_button").on('click', function() {
		// 表示項目が４より大きい場合はエラー
		var checkedCount = 0;
		if($('[name=address_public_flg]:checked').val() == 1) {
			checkedCount++;
		}
		if($('[name=email_public_flg]:checked').val() == 1) {
			checkedCount++;
		}
		if($('[name=url_public_flg]:checked').val() == 1) {
			checkedCount++;
		}
		if($('[name=tel_public_flg]:checked').val() == 1) {
			checkedCount++;
		}
		if($('[name=cell_public_flg]:checked').val() == 1) {
			checkedCount++;
		}
		if($('[name=fax_public_flg]:checked').val() == 1) {
			checkedCount++;
		}
		if(checkedCount > 4) {
			alert('名刺情報に表示できる連絡先項目は４種類です。');
			return;
		}
		// カテゴリ１のバリデーション等
		if($('[name=namecard_cate1_title_public_flg]:checked').val()){
			// 名前
			if(($('[name=name_public_flg]:checked').val() == 1)){
				if(($('[name=staff_firstname]').val() == '') || ($('[name=staff_lastname]').val() == '')){
					alert('名前に未入力の箇所があります。');
					return;
				}
			}
			// 名刺データ
			var namecard_img_none;
			if($('[name=namecard_public_flg]:checked').val() !== '1'){
				namecard_img_none = '1';
			}
			// 住所
			var namecard_address;
			var namecard_postcode;
			if($('[name=address_public_flg]:checked').val() == 1) {
				if($('[name=client_postcode1]').val() == '' || $('[name=client_postcode2]').val() == '' || $('[name=address]').val() == ''){
					alert('住所に未入力の箇所があります。');
					return;
				}
				namecard_postcode = '〒' + $('[name=client_postcode1]').val() + '-' + $('[name=client_postcode2]').val();
				namecard_address  = $('[name=address]').val();
			} else {
				namecard_postcode = '';
				namecard_address = '';
			}
			// 電話番号
			if($('[name=tel_public_flg]:checked').val() == 1) {
				if(($('[name=tel1]').val() == '') || ($('[name=tel2]').val() == '') || ($('[name=tel3]').val() == '')){
					alert('電話番号に未入力の箇所があります。');
					return;
				}
			}
			// 携帯番号
			var namecard_cell;
			if($('[name=cell_public_flg]:checked').val() == 1){
				if(($('[name=cell1]').val() == '') && ($('[name=cell2]').val() == '') && ($('[name=cell3]').val() == '')){
					namecard_cell = "";
				} else {
					namecard_cell = $('[name=cell1]').val() + '-' + $('[name=cell2]').val() + '-' + $('[name=cell3]').val();
				}
			}
			// fax番号
			var namecard_fax;
			if($('[name=fax_public_flg]:checked').val() == 1){
				if(($('[name=fax1]').val() == '') && ($('[name=fax2]').val() == '') && ($('[name=fax3]').val() == '')){
					namecard_fax = "";
				} else {
					namecard_fax = $('[name=fax1]').val() + '-' + $('[name=fax2]').val() + '-' + $('[name=fax3]').val();
				}
			}
		}

		// 写真がupされているか確認
		var picture_noimage;
		if($('[name=picture_public_flg]:checked').val() == 1){
			if($("#preview_picture").attr("src") !== ""){
			} else {
				picture_noimage = "/img/no-image.png?";
			}
		} else {
			picture_noimage = "/img/no-image.png?";
		}
		// 写真１がupされているか確認
		var photo1_url;
		if($('[name=namecard_photo1_public_flg]:checked').val() == 1){
			if($("#preview_photo1").attr("src") !== ""){
				photo1_url = $("#preview_photo1").attr('src');
			} else {
				photo1_url = '/img/no_image.png';
			}
		} else {
			photo1_url = '/img/no_image.png';
		}
		// 写真２がupされているか確認
		var photo2_url;
		if($('[name=namecard_photo2_public_flg]:checked').val() == 1){
			if($("#preview_photo2").attr("src") !== ""){
				photo2_url = $("#preview_photo2").attr('src');
			} else {
				photo2_url = '/img/no_image.png';
			}
		} else {
			photo2_url = '/img/no_image.png';
		}

		// 文字数のバリデーション-------------------------------------------------------------------
		if($('[name=namecard_cate1_title_public_flg]:checked').val()){
			// 名前
			if(($('[name=name_public_flg]:checked').val() == 1)){
				if($('[name=staff_firstname]').val().length > 8){
					alert('名前(姓)は8文字以内で入力してください。');
					return;
				}
				if($('[name=staff_lastname]').val().length > 8){
					alert('名前(名)は8文字以内で入力してください。');
					return;
				}
				// フリガナ
				if($('[name=staff_firstnamepy]').val().length > 8){
					alert('フリガナ(姓)は10文字以内で入力してください。');
					return;
				}
				if($('[name=staff_lastnamepy]').val().length > 8){
					alert('フリガナ(名)は10文字以内で入力してください。');
					return;
				}
			}
			// 会社名
			if($('[name=client_name_public_flg]:checked').val() == 1){
				if($('[name=client_name]').val().length > 22){
					alert('会社名は22文字以内で入力してください。');
					return;
				}
			}
			// 部署名
			if($('[name=department_name_public_flg]:checked').val() == 1){
				if($('[name=department]').val().length > 22){
					alert('部署名は22文字以内で入力してください。');
					return;
				}
			}
			// 役職
			if($('[name=executive_name_public_flg]:checked').val() == 1){
				if($('[name=executive]').val().length > 20){
					alert('役職は20文字以内で入力してください。');
					return;
				}
			}
			// 住所
			if($('[name=address_public_flg]:checked').val() == 1){
				if($('[name=client_postcode1]').val().length > 3){
					alert('郵便番号1は3文字以内で入力してください。');
					return;
				}
				if($('[name=client_postcode2]').val().length > 4){
					alert('郵便番号2は4文字以内で入力してください。');
					return;
				}
				if($('[name=address]').val().length > 26){
					alert('住所は26文字以内で入力してください。');
					return;
				}
			}
			// 名刺用メールアドレス
			if($('[name=email_public_flg]:checked').val() == 1){
				if($('[name=namecard_email]').val().length > 30){
					alert('名刺用メールアドレスは30文字以内で入力してください。');
					return;
				}
			}
			// URL
			if($('[name=url_public_flg]:checked').val() == 1){
				if($('[name=namecard_url]').val().length > 38){
					alert('URLは38文字以内で入力してください。');
					return;
				}
			}
			// 電話番号
			if($('[name=tel_public_flg]:checked').val() == 1){
				if($('[name=tel1]').val().length > 4){
					alert('電話番号1は4文字以内で入力してください。');
					return;
				}
				if($('[name=tel2]').val().length > 4){
					alert('電話番号2は4文字以内で入力してください。');
					return;
				}
				if($('[name=tel3]').val().length > 4){
					alert('電話番号3は4文字以内で入力してください。');
					return;
				}
			}
			// 携帯番号
			if($('[name=cell_public_flg]:checked').val() == 1){
				if($('[name=cell1]').val().length > 4){
					alert('携帯番号1は4文字以内で入力してください。');
					return;
				}
				if($('[name=cell2]').val().length > 4){
					alert('携帯番号2は4文字以内で入力してください。');
					return;
				}
				if($('[name=cell3]').val().length > 4){
					alert('携帯番号3は4文字以内で入力してください。');
					return;
				}
			}
			// FAX番号
			if($('[name=fax_public_flg]:checked').val() == 1){
				if($('[name=fax1]').val().length > 4){
					alert('FAX番号1は4文字以内で入力してください。');
					return;
				}
				if($('[name=fax2]').val().length > 4){
					alert('FAX番号2は4文字以内で入力してください。');
					return;
				}
				if($('[name=fax3]').val().length > 4){
					alert('FAX番号3は4文字以内で入力してください。');
					return;
				}
			}
			// Facebook
			if($('[name=facebook_public_flg]:checked').val() == 1){
				if($('[name=facebook]').val().length > 255){
					alert('Facebookは255文字以内で入力してください。');
					return;
				}
			}
			// SNS
			if($('[name=sns_public_flg]:checked').val() == 1){
				if($('[name=sns]').val().length > 255){
					alert('SNSは255文字以内で入力してください。');
					return;
				}
			}
		}

		// カテゴリー2
		if($('[name=namecard_cate2_title_public_flg]:checked').val()){
			// フリー項目１
			if($('[name=free1_public_flg]:checked').val() == 1){
				if($('[name=free_item_val1]').val().length > 20){
					alert('フリー項目１は20文字以内で入力してください。');
					return;
				}
			}
			// フリー項目２
			if($('[name=free2_public_flg]:checked').val() == 1){
				if($('[name=free_item_val2]').val().length > 20){
					alert('フリー項目２は20文字以内で入力してください。');
					return;
				}
			}
			// フリー項目３
			if($('[name=free3_public_flg]:checked').val() == 1){
				if($('[name=free_item_val3]').val().length > 20){
					alert('フリー項目３は20文字以内で入力してください。');
					return;
				}
			}
			// フリー項目４
			if($('[name=free4_public_flg]:checked').val() == 1){
				if($('[name=free_item_val4]').val().length > 20){
					alert('フリー項目４は20文字以内で入力してください。');
					return;
				}
			}
			// フリー項目５
			if($('[name=free5_public_flg]:checked').val() == 1){
				if($('[name=free_item_val5]').val().length > 20){
					alert('フリー項目５は20文字以内で入力してください。');
					return;
				}
			}
		}

		// カテゴリー3
		if($('[name=namecard_cate3_title_public_flg]:checked').val()){
			// 写真１／説明文
			if($('[name=namecard_photo1_desc_public_flg]:checked').val() == 1){
				if($('[name=namecard_photo1_desc]').val().length > 40){
					alert('写真１／説明文は40文字以内で入力してください。');
					return;
				}
			}
			// 写真２／説明文
			if($('[name=namecard_photo2_desc_public_flg]:checked').val() == 1){
				if($('[name=namecard_photo2_desc]').val().length > 40){
					alert('写真２／説明文は40文字以内で入力してください。');
					return;
				}
			}
		}

		// カテゴリー4
		if($('[name=namecard_cate4_title_public_flg]:checked').val()){
			if($('[name=namecard_introduction_public_flg]:checked').val() == 1){
				if($('[name=namecard_introduction]').val().length > 300){
					alert('カテゴリー４は300文字以内で入力してください。');
					return;
				}
			}
		}//-------------------------------------------------------------------------------------------------

		// レイアウトパターンを設定
		var cate1Flg = $('[name=namecard_cate1_title_public_flg]:checked').val();
		var cate2Flg = $('[name=namecard_cate2_title_public_flg]:checked').val();
		var cate3Flg = $('[name=namecard_cate3_title_public_flg]:checked').val();
		var cate4Flg = $('[name=namecard_cate4_title_public_flg]:checked').val();
		if(cate1Flg == undefined){cate1Flg = 0;}
		if(cate2Flg == undefined){cate2Flg = 0;}
		if(cate3Flg == undefined){cate3Flg = 0;}
		if(cate4Flg == undefined){cate4Flg = 0;}

		var wide_flg = parseInt(cate1Flg) + parseInt(cate2Flg) + parseInt(cate3Flg) + parseInt(cate4Flg);
		var narrow_flg = '';
		var contents_flg = '';

		// 表示フラグがない場合、暫定で名刺情報なしと表示する
		if(wide_flg == 0){
			contents_flg = 1;
			$('#namecard-area').css('height','340px').css('width', '590px');
		} else if(wide_flg !== 4){
			if(wide_flg == 1){
				$('#namecard-area').css('height','340px').css('width', '590px');
			} else {
				$('#namecard-area').css('height', '590px').css('width', '590px');
			}
			wide_flg = '';
			narrow_flg = 1;
		} else {
			$('#namecard-area').css('width', '98%').css('height', '98%');
			$('#mi_namecard_contents').css('height', 'auto');
		}
		var values = {
			wide_flg: wide_flg,
			narrow_flg: narrow_flg,
			contents_flg: contents_flg,
			namecard_cate1_public_flg: (cate1Flg == 1) ? cate1Flg : '',
			namecard_cate2_public_flg: (cate2Flg == 1) ? cate2Flg : '',
			namecard_cate3_public_flg: (cate3Flg == 1) ? cate3Flg : '',
			namecard_cate4_public_flg: (cate4Flg == 1) ? cate4Flg : '',
			cate1_title: ($('[name=namecard_cate1_title]').val() !== '') ? $('[name=namecard_cate1_title]').val() : 'カテゴリー１',
			cate2_title: ($('[name=namecard_cate2_title]').val() !== '') ? $('[name=namecard_cate2_title]').val() : 'カテゴリー２',
			cate3_title: ($('[name=namecard_cate3_title]').val() !== '') ? $('[name=namecard_cate3_title]').val() : 'カテゴリー３',
			cate4_title: ($('[name=namecard_cate4_title]').val() !== '') ? $('[name=namecard_cate4_title]').val() : 'カテゴリー４',
			picture_img: ($('[name=picture_public_flg]:checked').val() == 1) ? $('#preview_picture').attr('src') : picture_noimage,
			namecard_img: ($('[name=namecard_public_flg]:checked').val() == 1) ? $('#namecardpreview').parent().attr('href') : '',
			namecard_img_none: namecard_img_none,
			namecard_name: ($('[name=namecard_public_flg]:checked').val() == 1) ? $('[name=staff_firstname]').val() + ' ' + $('[name=staff_lastname]').val() : '',
			fb_url: ($('[name=facebook_public_flg]:checked').val() == 1) ? $('[name=facebook]').val() : '',
			sns_url: ($('[name=sns_public_flg]:checked').val() == 1) ? $('[name=sns]').val() : '',
			client_name: ($('[name=client_name_public_flg]:checked').val() == 1) ? $('[name=client_name]').val() : '',
			department: ($('[name=department_name_public_flg]:checked').val() == 1) ? $('[name=department]').val() : '',
			executive: ($('[name=executive_name_public_flg]:checked').val() == 1) ? $('[name=executive]').val() : '',
			staff_firstname: ($('[name=name_public_flg]:checked').val() == 1) ? $('[name=staff_firstname]').val() : '',
			staff_lastname: ($('[name=name_public_flg]:checked').val() == 1) ? $('[name=staff_lastname]').val() : '',
			staff_firstnamepy: ($('[name=name_public_flg]:checked').val() == 1) ? $('[name=staff_firstnamepy]').val() : '',
			staff_lastnamepy: ($('[name=name_public_flg]:checked').val() == 1) ? $('[name=staff_lastnamepy]').val() : '',
			client_postcode1: ($('[name=address_public_flg]:checked').val() == 1) ? $('[name=client_postcode1]').val() : '',
			client_postcode2: ($('[name=address_public_flg]:checked').val() == 1) ? $('[name=client_postcode2]').val() : '',
			client_postcode: namecard_postcode,
			address: namecard_address,
			tel: ($('[name=tel_public_flg]:checked').val() == 1) ? $('[name=tel1]').val() + '-' + $('[name=tel2]').val() + '-' + $('[name=tel3]').val() : '',
			cell: namecard_cell,
			fax: namecard_fax,
			namecard_email: ($('[name=email_public_flg]:checked').val() == 1) ? $('[name=namecard_email]').val() : '',
			namecard_url: ($('[name=url_public_flg]:checked').val() == 1) ? $('[name=namecard_url]').val() : '',
			namecard_free1_name: ($('[name=free1_public_flg]:checked').val() == 1) ? $('[name=free_item_name1]').val() : '',
			namecard_free1_val: ($('[name=free1_public_flg]:checked').val() == 1) ? $('[name=free_item_val1]').val() : '',
			namecard_free2_name: ($('[name=free2_public_flg]:checked').val() == 1) ? $('[name=free_item_name2]').val() : '',
			namecard_free2_val: ($('[name=free2_public_flg]:checked').val() == 1) ? $('[name=free_item_val2]').val() : '',
			namecard_free3_name: ($('[name=free3_public_flg]:checked').val() == 1) ? $('[name=free_item_name3]').val() : '',
			namecard_free3_val: ($('[name=free3_public_flg]:checked').val() == 1) ? $('[name=free_item_val3]').val() : '',
			namecard_free4_name: ($('[name=free4_public_flg]:checked').val() == 1) ? $('[name=free_item_name4]').val() : '',
			namecard_free4_val: ($('[name=free4_public_flg]:checked').val() == 1) ? $('[name=free_item_val4]').val() : '',
			namecard_free5_name: ($('[name=free5_public_flg]:checked').val() == 1) ? $('[name=free_item_name5]').val() : '',
			namecard_free5_val: ($('[name=free5_public_flg]:checked').val() == 1) ? $('[name=free_item_val5]').val() : '',
			namecard_photo1_flg: ($('[name=namecard_photo1_public_flg]:checked').val() == 1) ? $('[name=namecard_photo1_public_flg]:checked').val() : '',
			namecard_photo1_url: photo1_url,
			namecard_photo1_desc: ($('[name=namecard_photo1_desc_public_flg]:checked').val() == 1) ? $('[name=namecard_photo1_desc]').val() : '',
			namecard_photo2_flg: ($('[name=namecard_photo2_public_flg]:checked').val() == 1) ? $('[name=namecard_photo2_public_flg]:checked').val() : '',
			namecard_photo2_url: photo2_url,
			namecard_photo2_desc: ($('[name=namecard_photo2_desc_public_flg]:checked').val() == 1) ? $('[name=namecard_photo2_desc]').val() : '',
			namecard_introduction: ($('[name=namecard_introduction_public_flg]:checked').val() == 1) ? $('[name=namecard_introduction]').val() : '',
		};

		$("#modal-content-preview-namecard").show();
		// モーダル内のタグを削除する
		$("div.inner-wrap", "#modal-content-preview-namecard").empty();
		// テンプレート生成
		var template = Handlebars.compile($('#namecard-modal-template').html());

		$('div.inner-wrap', "#modal-content-preview-namecard").append(template(values));

		// モーダルを表示する為のクリックイベントを発生させる
		$('.modal-open').trigger("click");
	});

	//	パスワードの変更クリック
	$(".detail_open").click(function(){
		$("#modal-content-change-pass").show();
		// モーダル内のタグを削除する
		$("div.inner-wrap", "#modal-content-change-pass").empty();
		// テンプレート生成
		var template = Handlebars.compile($('#password-modal-template').html());
		$('div.inner-wrap', "#modal-content-change-pass").append(template());
		// モーダルを表示する為のクリックイベントを発生させる
		$('.modal-open').trigger("click");
	});

	$(document).on('click', '[id=cancel]', function(){
		$("#modal-content-change-pass").hide();
	});

	$(document).on('click', '[id=update]', function(){
		$("#alert_old_pass").text("");
		$("#alert_new_pass").text("");
		var old = document.getElementById( "staff_password_old" ).value;
		var ps = document.getElementById( "staff_password_new" ).value;
		var ps2 = document.getElementById( "staff_password_new2" ).value;
		if (old == "") {
			$("#alert_old_pass").text("現在のパスワードを入力してください");
			$("#alert_old_pass").show();
			return;
		}
		if (ps == "") {
			$("#alert_new_pass").text("新しいパスワードを入力してください");
			$("#alert_new_pass").show();
			return;
		}
		if (ps.length < 8) {
			$("#alert_new_pass").text("新しいパスワードの長さが8文字より小さいです");
			$("#alert_new_pass").show();
			return;
		}
		if (ps2 == "") {
			$("#alert_new_pass").text("確認パスワードを入力してください");
			$("#alert_new_pass").show();
			return;
		}
		if (ps != ps2) {
			$("#alert_new_pass").text("新しいパスワードと確認パスワードが一致しません");
			$("#alert_new_pass").show();
			document.getElementById( "staff_password_new" ).value = "";
			document.getElementById( "staff_password_new2" ).value = "";
			return;
		}
		// 旧パスワードの認証
		$.ajax({
			url: "check-staff-password",
			type: "POST",
			dataType: "text",
			data: {
				"staff_type"     : $("[name=staff_type]").val(),
				"staff_id"       : $("[name=staff_id]").val(),
				"staff_password" : old,
			},
		}).done(function(res) {
			var json = jQuery.parseJSON(res);
			if(json.result == 'true') {
				document.getElementById( "staff_password" ).value = ps;
				document.getElementById( "staff_password_mod" ).value = "1";
				$("#modal-content-change-pass").hide();
			} else {
			$("#alert_old_pass").text("現在パスワードの認証に失敗しました");
			$("#alert_old_pass").show();
			}
		}).fail(function(res) {
			$("#alert_old_pass").text("サーバ認証に失敗しました");
			$("#alert_old_pass").show();
		});
	});

	$(document).on('click', '.modal-close',function(){
		$("#modal-content-change-pass").hide();
		$("#modal-content-preview-namecard").hide();
	});

	// 名刺ダウンロード
	$(document).on('click', '.mi_pdf_dl_button',function(){
		// バイナリの送受信のためajaxではなくXMLHttpResquest
		var mime_types = {
			jpg:  'image/jpeg',
			jpeg: 'image/jpeg',
			pdf:  'application/pdf',
		};
		var namecard_url  = $(this).data('namecardUrl');
		var namecard_file = $(this).data('namecardName');

		if (namecard_url != '' && namecard_file != '' ) {
			var namecard_ext  = namecard_url.match(/(.*)(?:\.([^.]+$))/)[2];
			var xhr = new XMLHttpRequest();
			xhr.open('GET', namecard_url, true);
			xhr.responseType = 'arraybuffer';
			xhr.onload = function(e) {
				var blob = new Blob([xhr.response], {"type": mime_types[namecard_ext]});
				var fileName = namecard_file + '.' + namecard_ext;
				// IEの場合は、バイナリのダウンロード方法が変わるため、分岐
				if(getBrowserType() != "IE"){
					$("a[name=download_namcard_link]").attr("href", URL.createObjectURL(blob));
					$("a[name=download_namcard_link]").attr("download", fileName);
					$("a[name=download_namcard_link]")[0].click();
				} else {
					// IEでのダウンロード処理
					window.navigator.msSaveBlob(blob, fileName);
				}
			};
			xhr.send();
		}
		return false;
	});

	$("[name=submit_button]").click(function(){
		$("#submit_button").prop("disabled", true);
		$("#submit_button").text("登録中です...");
		$("#staff_form").submit();
	});

	// チェックボックスをクリックした際に他要素を選択しない
	$(".sample_label").click(function(){
		$(this).focusin();
	});
});
</script>

<style type="text/css">
<!--

/* 必須のスタイル */
.required {
	margin-left: 8px;
	padding: 0px 5px;
	font-size: 12px;
	line-height: 1.0;
	color: #fff;
	background: #df6b6e;
}

.mi_table_th{
	text-align: left !important;
	padding-left: 25px;
}
.mi_table_main_wrap{
	max-height: 100%;
}
.mi_table_main2 tr {
  border: 2px ridge;
}

.mi_table_main2 th {
  padding: 2px;
  height: 40px;
  color: #fff;
  background-color: #35a0d4;
  font-weight: normal;
  text-align: center;
  vertical-align: middle;
  white-space: nowrap;
  border-right: 2px ridge;
}

.mi_table_main2 td {
  width: auto;
  height: 40px;
  margin: 0px;
  padding: 0px;
  color: #6e6e6e;
  text-align: left;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  border-bottom: 1px solid #c8c8c8;
  vertical-align: middle;
}
.mi_table_input_right .mi_default_input.input_hidden{
	padding: 0 5px 0 15px;
}
.mi_table_input_right .mi_default_input.input_hidden:focus, .mi_table_input_right .mi_default_input{
	padding: 0 5px 0 15px;
}
.mi_content_title input[type=checkbox],
.mi_table_main2 input[type=checkbox] {
	width: 18px;
	height: 18px;
	margin: 1px;
	padding: 1px;
	vertical-align: middle;
	-moz-transform: scale( 1.8 , 1.8 );
}
.mi_table_main th{
	user-select: none;
	background-color: #fff4e1;
	color: #333333;
}
.mi_preview_button {
	width: 290px;
	float: right;
}
#namecardpreview_button{
	font-size: 25px;
	padding: 0;
	float: left;
	margin-left: 10px;
}
.preview_title{
	font-size: 15px;
	float: left;
	padding-top: 4px;
	margin-left: 16px;
}
.mi_free_input{
	width:152px !important;
}

.mi_check_th {
	background-color: #35a0d4;
	width: 50px;
	min-width: 50px;
	border-bottom: 1px solid #e8e8e8;
}

.mi_title_th {
	border-bottom: 1px solid #e8e8e8;
	text-align: left !important;
	padding-left: 10px;
}

.mi_subtitle_th {
	text-align: left !important;
	background-color: #35a0d4;
	border-bottom: 1px solid #e8e8e8;
	padding-left: 25px;
}

.mi_content_textarea {
	color: #6e6e6e;
	width: 340px;
	height: 50px;
	padding: 10px 10px 0px 10px;
	border: 1px solid #e8e8e8;
	resize: none;
	overflow: auto;
	white-space:pre-wrap;
	font-family: sans-serif;
	font-size: 13.3px;
}

.listtable {
	min-width: 100%;	/* ■ */
	background: #fff;
	padding: 10px;
}

.modal-content-preview {
	display: none;
	position: fixed;
	height: 100%;
	width: 100%;
	top: 0%;
	left: 0%;
	z-index: 501;
}
.mi_modal_shadow{
	opacity: 0.5;
}
.modal-content-preview .inner-wrap {
	position: absolute;
	z-index: 503;
	height: 92%;
	width: 80%;
	max-height: 600px;
	max-width: 1100px;
	background: #f5f5f5;
}

.modal-content .list-area .listtable th {
	padding: 6px 10px 3px 10px;
	font-size: 1em;
	line-height: 1.2;
	text-align: left;
}

.modal-content .list-area .listtable td {
	padding: 11px 10px 8px 10px;
	font-size: 0.9em;
	line-height: 1.2;
}
#picture ,
#namecard{
	padding: 4px 0;
}
@media all and (-ms-high-contrast: none){
	#picture ,
	#namecard{
		padding: 4px 0;
		width: 280px;
	}
}
.free_content_th{
	padding:0 5px !important;
}
.account_id_val{
	padding-left: 10px;
}
.namecard_photo{
	padding: 4px 0;
	vertical-align: bottom;
	padding-bottom: 10px;
}
@media all and (-ms-high-contrast: none){
	.namecard_photo{
		width: 200px;
		vertical-align: bottom;
		padding-bottom: 0;
	}
}
.namecard_photo_td{
	height: 130px;
	width: 260px;
}
#picture,#namecard,#namecard_photo1,#namecard_photo2{
	display: none;
}
.file{
	cursor: pointer;
	color: #ffffff;
	background-color: #b2b2b2;
	font-size: 11px;
	padding: 0 13.5px;
    border: solid 1px #b2b2b2;
}
.file-delete{
    cursor: pointer;
    color: #979797;
    background-color: #ffffff;
    font-size: 11px;
    padding: 0 13.5px;
    border: solid 1px #979797;
}
.file-button-area{
    float: right;
    margin-right: 256px;
    margin-top: 23px;
}
.file-button-namecard{
    float: right;
    margin-right: 256px;
}
.file-button-photo{
	float: right;
	margin-right: 198px;
	margin-top: 40px;
}
input::-webkit-input-placeholder {
	font-size: 13px;
}
input:-moz-placeholder {
	font-size: 13px;
}
input::-moz-placeholder {
	font-size: 13px;
}
input:-ms-input-placeholder {
	font-size: 12px !important;
	color: #a7a7a7 !important;
}

/*-------------------------------------
	（モーダル）基本型
--------------------------------------*/
.modal-content {
  display: none;
  position: fixed;
  height: 100%;
  width: 100%;
  top: 0%;
  left: 0%;
	z-index: 501;
}

.modal-content .inner-wrap {
	line-height: 1.2;
	position: absolute;
	z-index: 503;
	height: 70%;
  width: 30%;
	background: #fff;
	padding: 20px 30px;
}

.modal-content .list-area,
.modal-content .edit-area {
	width: 100%;
	max-width: 1180px;
	overflow: auto;
}

/* モーダル */
.modal-content .inner-wrap h5 {
    padding: 5px 0 10px 0;
    font-size: 1.3em;
    font-weight: bold;
    color: #215b82;
}

/*-----------------------
	モーダル領域
------------------------*/
.modal-content .inner-wrap {
	height: 320px;
  	width: 635px;
}

.mi_modal_default .mi_close_icon{
    width: 25px !important;
    height: 25px;
    padding: 0;
    background: #d8d8d8;
}
.asterisk{
	padding-left: 80px;
}
.free_title{
	width: 452.4px !important;
	height: 100%;
	padding: 0 10px;
}
.f_name_{
	display: inline-block !important;
	width: 155.2px !important;
	height: 100%;
	padding: 0 10px;
}
.text_short{
	width:85.2px !important;
	height: 100%;
	display: inline-block !important;
	padding: 0 10px;
}
.f_mail{
	width:340px !important;
	height: 100%;
	padding: 0 10px;
}
.f_account{
	width:420px !important;
	height: 100%;
	padding: 0 10px;
	ime-mode: disabled !important;
}
#mi_namecard_detail{
	overflow: auto;
	overflow-x: hidden;
	height: 90%;
}
.namecard_check_desc{
	font-size:14px;
}
.free_title_td{
	background-color: #fff4e1 !important;
}
input[type=checkbox] {
	display: none;
}
.sample_label {
	position: relative;		/* ボックスの位置を指定する */
	padding: 0 0 0 42px;	/* ボックス内側の余白を指定する */
}
.sample_label:after,  .sample_label:before{
	position: absolute;	/* ボックスの位置を指定する */
	content: "";		/* ボックスのコンテンツ */
	display: block;		/* ブロックレベル要素化する */
	top: 50%;			/* 上部から配置の基準位置を決める */
}
.sample_label:after {
	left: 15px;			/* 左から配置の基準位置を決める */
	margin-top: -10px;	/* チェック枠の位置 */
	width: 15px;		/* ボックスの横幅を指定する */
	height: 15px;		/* ボックスの高さを指定する */
	border: 1px solid #d5d4d4;	/* ボックスの境界線を実線で指定する */
	border-radius: 2px;		/* ボックスの角丸を指定する */
	background-color: white;
}
.sample_label:before {
	left: 20px;			/* 左から配置の基準位置を決める */
	margin-top: -9px;	/* チェックマークの位置 */
	width: 5px;			/* ボックスの横幅を指定する */
	height: 9px;		/* ボックスの高さを指定する */
	border-right: 2px solid #35a0d4;	/* 境界線（右）のスタイルを指定する */
	border-bottom: 2px solid #35a0d4;	/* 境界線（下）のスタイルを指定する */
	transform: rotate(45deg);	/* 要素を回転させる */
	opacity: 0;			/* 要素を透過指定する */
	z-index: 10;
}
input[type=checkbox]:checked + .sample_label:before {
	opacity: 1;		/* 要素を表示する */
}

/*名刺部分*/
@media (max-width: 960px){
	.modal-content-preview .inner-wrap{
		max-width: 40em !important;
        height: 92% !important;
	}
}
@media (max-height: 580px){
    .modal-content-preview .inner-wrap{
        height: 92% !important;
    }
    .mi_namecard_contents{
        height: 100%;
    }
}

.mi_namecard_title{
	padding-top: 0.8em;
	padding-bottom: 0.6em;
}
.mi_namecard_detail_header{
	padding: 0.6em 1em !important;
}
#feature-item-1,#feature-item-2, #feature-item-3, #feature-item-4{
	flex: 0 0 95%;
	max-width: none;
}
.icon-businesscard{
	font-size: 40px;
	padding-left: 20px;
	padding-right: 12px;
	line-height: 1.2;
	cursor: pointer;
}
#namecard{
	vertical-align: middle;
}

.namecard_url_href{
	color: #0e4fca;
	text-decoration: underline;
}
.namecard_contents_none{
	color:red;
	margin: 10px 14px;
}
#namecard_close{
	display: inline-block;
	width: 100%;
	height: 100%;
	text-indent: -9999px;
	background: #b6c3cc url("/img/btn_close.png") no-repeat center center;
}
#namecard_close:hover{
	background-color: #ffaa00
}
/* エラーメッセージ */
.errmsg {
	font-size: 0.95em;
	line-height: 1.6;
	color: #df6b6d;
	padding-bottom: 15px;
}
.f_password		{width:300px;}

-->
</style>


{/literal}


<!-- メインコンテンツ start -->
<div id="mi_main_contents">
	<!-- トップナビ start -->
	<div id="mi_top_nav" class="acount_manage_on">
	{if $user.staff_type == 'AA' && $user.staff_role == "AA_1" }
		<ul>
			<li class="mi_select">
				<a href="/admin/staff-list?staff_type=AA" class="hvr-underline-from-center">
					<span class="icon-parsonal mi_default_label_icon"></span>
					<div class="">AAアカウント管理</div>
				</a>
			</li>
			<li class="">
				<a href="/admin/client-list" class="hvr-underline-from-center">
					<span class="icon-company mi_default_label_icon"></span>
					<div class="">クライアント管理</div>
				</a>
			</li>
		</ul>
	{/if}
	<!-- パンくずリスト start -->
	{if $user.staff_type == 'AA' && $user.staff_role == "AA_1" }
		<div class="mi_breadcrumb_list">
			<a href="/index/menu">TOP</a>&nbsp;&gt;&nbsp;
			<a href="/admin/staff-list?staff_type={$staffDict.staff_type}">{$staffDict.staff_type}アカウント管理</a>&nbsp;&gt;&nbsp;
			<a href="/admin/staff-regist?staff_type={$staffDict.staff_type}{if $staffDict.staff_id!=''}&staff_id={$staffDict.staff_id}{/if}&client_id={$staffDict.client_id}">{$staffDict.staff_type}アカウント発行・編集</a>
		</div>
	{else}
		<div class="mi_breadcrumb_list">
			<a href="/index/menu">TOP</a>&nbsp;&gt;&nbsp;
			<a href="/admin/staff-regist?staff_type={$staffDict.staff_type}&staff_id={$staffDict.staff_id}&client_id={$user.client_id}">プロフィール設定</a>
		</div>
	{/if}
	<!-- パンくずリスト end -->
	</div>
	<!-- トップナビ end -->

	<!-- コンテンツエリア start -->
	<div id="mi_content_area">
		<!-- コンテンツタイトル start -->
		<div class="mi_content_title" id="namecard_table_desc">
			<h1>
				個人情報・接続設定
				<span class="icon-parsonal mi_content_title_icon"></span>
				<input type="checkbox" name="exp" id="exp" checked="checked" disabled="disabled" />
				<label for="exp" class="sample_label"></label>
				<span class="namecard_check_desc">名刺に表示する</span>
			</h1>
			{if ($user.client_id != 0) && ($user.staff_id == $staffDict.staff_id) && ($user.staff_type == $staffDict.staff_type) }
			<button type="button" name="preview_button" class="mi_preview_button hvr-fade" id="preview_button">
				<span class="icon-businesscard" id="namecardpreview_button"></span><span class="preview_title">プロフィールをプレビューする</span></button>
			{/if}
		</div>
		<!-- コンテンツタイトル end -->

		<!-- エラーメッセージ表示エリア begin -->
		{if $errorList|@count gt 0}
		<p class="errmsg mb10">
		下記にエラーがあります。<br />
			<strong>
				{foreach from=$errorList item=error}
					{foreach from=$error item=row}
						{$row}<br>
					{/foreach}
				{/foreach}
			</strong>
		</p>
		{/if}
		<!-- エラーメッセージ表示エリア end -->

		<form action="/admin/staff-regist" method="post" id="staff_form" enctype="multipart/form-data">
			<input type="password" name="dummypass" style="visibility: hidden; top: -100px; left: -100px;" />
			<!-- テーブル start -->
			<div class="mi_table_main_wrap mi_table_input_right_wrap_all">
				<table class="mi_table_input_right mi_table_main">
					<tbody>
						{if ($user.client_id != 0) && (($user.staff_id == $staffDict.staff_id) && ($user.staff_type == $staffDict.staff_type)) }
						<tr>
							<th class="mi_check_th">
								<input type="hidden" name="namecard_cate1_title_public_flg" value="0">
								{if ($staffDict.namecard_cate1_title_public_flg == 0)}
									<input type="checkbox" name="namecard_cate1_title_public_flg" value="1" id="checkbox-cate1">
									<label for="checkbox-cate1" class="sample_label"></label>
								{else}
									<input type="checkbox" name="namecard_cate1_title_public_flg" value="1" checked="checked" id="checkbox-cate1">
									<label for="checkbox-cate1" class="sample_label"></label>
								{/if}
							</th>
							<th colspan="4" class="mi_title_th">このカテゴリーを名刺に表示する</th>
							{*<td style="background-color: #35a0d4;" class="mi_tabel_content">*}
								{*<input style="background-color: #ffffff" placeholder="フリー項目タイトル(２０文字以内)" type="text" class="f_mail mi_default_input input_hidden" name="namecard_cate1_title" value="{$staffDict.namecard_cate1_title}" maxlength="20"/>*}
							{*</td>*}
						</tr>
						{/if}
						{if ($user.client_id != 0) && (($user.staff_id == $staffDict.staff_id) && ($user.staff_type == $staffDict.staff_type)) }
						<tr>
							<td colspan="5" class="mi_tabel_content free_title_td">
								<input style="background-color: #ffffff" placeholder="フリー項目タイトル (20文字以内)" type="text" class="free_title mi_default_input input_hidden" name="namecard_cate1_title" value="{$staffDict.namecard_cate1_title}" maxlength="20"/>
							</td>
						</tr>
						<tr>
							<th colspan="5" class="mi_subtitle_th">会社＆社員情報</th>
						</tr>
						{/if}
						<tr>
							<th class="mi_check_td">
							{if ($user.client_id != 0) && (($user.staff_id == $staffDict.staff_id) && ($user.staff_type == $staffDict.staff_type)) }
								<input type="hidden" name="name_public_flg" value="0">
								{if ($staffDict.namecard_name_public_flg == 0)}
									<input type="checkbox" name="name_public_flg" value="1" id="checkbox-name">
									<label for="checkbox-name" class="sample_label"></label>
								{else}
									<input type="checkbox" name="name_public_flg" value="1" checked="checked" id="checkbox-name">
									<label for="checkbox-name" class="sample_label"></label>
								{/if}
							{/if}
							</th>
							<th class="mi_tabel_title">名前<span class="required">必須</span></th>
							<td colspan="3" class="mi_tabel_content">
								<input type="text" class="f_name_ mi_default_input input_hidden" name="staff_firstname" value="{$staffDict.staff_firstname|escape}" autocomplete="off" placeholder="氏"/>
								<input type="text" class="f_name_ mi_default_input input_hidden" name="staff_lastname" value="{$staffDict.staff_lastname|escape}" autocomplete="off" placeholder="名"/>
							</td>
						<tr>
							<th class="mi_check_td"></th>
							<th class="mi_tabel_title">フリガナ</th>
							<td colspan="3" class="mi_tabel_content">
								<input type="text" class="f_name_ mi_default_input input_hidden" name="staff_firstnamepy" value="{$staffDict.staff_firstnamepy|escape}" autocomplete="off" placeholder="氏(カナ)"/>
								<input type="text" class="f_name_ mi_default_input input_hidden" name="staff_lastnamepy" value="{$staffDict.staff_lastnamepy|escape}" autocomplete="off" placeholder="名(カナ)"/>
							</td>
						</tr>
						<tr>
							<th class="mi_check_td">
							{if ($user.client_id != 0) && ($user.staff_id == $staffDict.staff_id) && ($user.staff_type == $staffDict.staff_type) }
								<input type="hidden" name="picture_public_flg" value="0">
								{if ($staffDict.namecard_picture_public_flg == 0)}
									<input type="checkbox" name="picture_public_flg" value="1" id="checkbox-photo-face">
									<label for="checkbox-photo-face" class="sample_label"></label>
								{else}
									<input type="checkbox" name="picture_public_flg" value="1" checked="checked" id="checkbox-photo-face">
									<label for="checkbox-photo-face" class="sample_label"></label>
								{/if}
							{/if}
							</th>
							<th class="mi_tabel_title">写真</th>
							<td colspan="3" class="mi_tabel_content">
								<div>
									{if $staffDict.staffImgPath != ""}
										<img src="{$staffDict.staffImgPath}?{$smarty.now}" alt="Image" id="preview_picture" class="namecard-profile-contain">
									{else}
										<img src="/img/no-image.png" alt="NoImage" id="preview_picture" class="namecard-profile-contain">
									{/if}
                                    <div class="file-button-area">
                                        <label for="picture" class="file">
                                            ファイルを選択
                                            <input type="file" id="picture" name="picture_file">
                                        </label>
                                        <div>
                                            <span class="file-delete" id="profile-delete">
                                                ファイルを削除
                                            </span>
                                        </div>
                                    </div>
									<input type="hidden" id="tmp_profile" name="tmp_profile" value="{$staffDict.tmpProfileImgPath}"/>
									<input type="hidden" id="picture_flg" name="picture_flg" {if $staffDict.picture_flg == 1}value="1"{/if} />
								</div>
							</td>
						</tr>
						{if ($user.client_id != 0) && ($user.staff_id == $staffDict.staff_id) && ($user.staff_type == $staffDict.staff_type) }
						<tr>
							<th class="mi_check_td">
								<input type="hidden" name="namecard_public_flg" value="0">
								{if ($staffDict.namecard_card_public_flg == 0)}
									<input type="checkbox" name="namecard_public_flg" value="1" id="checkbox-namecard-data">
									<label for="checkbox-namecard-data" class="sample_label"></label>
								{else}
									<input type="checkbox" name="namecard_public_flg" value="1" checked="checked" id="checkbox-namecard-data">
									<label for="checkbox-namecard-data" class="sample_label"></label>
								{/if}
							</th>
							<th class="mi_tabel_title">名刺データ</th>
							<td colspan="3" class="mi_tabel_content">
								<div>
									<span id="namecard_image_file">
									{if $staffDict.staffNamecardImgPath != ""}
										<a href="{$staffDict.staffNamecardImgPath}" target="_blank" id="namecard_namecard">
										<span class="icon-businesscard" alt="Namecard Image" id="namecardpreview"></span>
										</a>
									{/if}
									</span>
									<div class="file-button-namecard">
										<span id="namecard_file_name"></span>
										<label for="namecard" class="file">
											ファイルを選択
											<input type="file" id="namecard" name="namecard_file">
										</label>
										<div>
											<span class="file-delete" id="namecard_file-delete">
												ファイルを削除
											</span>
										</div>
									</div>
									<input type="hidden" id="tmp_namecard" name="tmp_namecard" value="{$staffDict.tmpNamecardImgPath}">
									<input type="hidden" id="namecard_flg" name="namecard_flg" {if $staffDict.staffNamecardImgPath != ''}value="1" {else}value="0" {/if} />
								</div>
							</td>
						</tr>
						{/if}
						{if ($user.client_id != 0) && ($user.staff_id == $staffDict.staff_id) && ($user.staff_type == $staffDict.staff_type) }
						<tr>
							<th class="mi_check_td">
								<input type="hidden" name="client_name_public_flg" value="0">
								{if ($staffDict.namecard_client_name_public_flg == 0)}
									<input type="checkbox" name="client_name_public_flg" value="1" id="checkbox-companyname">
									<label for="checkbox-companyname" class="sample_label"></label>
								{else}
									<input type="checkbox" name="client_name_public_flg" value="1" checked="checked" id="checkbox-companyname">
									<label for="checkbox-companyname" class="sample_label"></label>
								{/if}
							</th>
							<th class="mi_tabel_title">会社名</th>
							<td colspan="3" class="mi_tabel_content">
								<input type="text" class="f_mail mi_default_input input_hidden" name="client_name" value="{$staffDict.namecard_client_name}"/>
							</td>
						</tr>
						{/if}
						{if ($user.client_id != 0) && ($user.staff_id == $staffDict.staff_id) && ($user.staff_type == $staffDict.staff_type) }
						<tr>
							<th class="mi_check_td">
								<input type="hidden" name="department_name_public_flg" value="0">
								{if ($staffDict.namecard_department_public_flg == 0)}
									<input type="checkbox" name="department_name_public_flg" value="1" id="checkbox-deptname">
									<label for="checkbox-deptname" class="sample_label"></label>
								{else}
									<input type="checkbox" name="department_name_public_flg" value="1" checked="checked" id="checkbox-deptname">
									<label for="checkbox-deptname" class="sample_label"></label>
								{/if}
							</th>
							<th class="mi_tabel_title">部署名</th>
							<td colspan="3" class="mi_tabel_content">
								<input type="text" class="f_mail mi_default_input input_hidden" name="department" value="{$staffDict.namecard_department}"/>
							</td>
						</tr>
						{/if}
						{if ($user.client_id != 0) && ($user.staff_id == $staffDict.staff_id) && ($user.staff_type == $staffDict.staff_type) }
						<tr>
							<th class="mi_check_td">
								<input type="hidden" name="executive_name_public_flg" value="0">
								{if ($staffDict.namecard_executive_public_flg == 0)}
									<input type="checkbox" name="executive_name_public_flg" value="1" id="checkbox-executive">
									<label for="checkbox-executive" class="sample_label"></label>
								{else}
									<input type="checkbox" name="executive_name_public_flg" value="1" checked="checked" id="checkbox-executive">
									<label for="checkbox-executive" class="sample_label"></label>
								{/if}
							</th>
							<th class="mi_tabel_title">役職</th>
							<td colspan="3" class="mi_tabel_content">
								<input type="text" class="f_mail mi_default_input input_hidden" name="executive" value="{$staffDict.namecard_executive}"/>
							</td>
						</tr>
						{/if}
						{if ($user.client_id != 0) && (($user.staff_id == $staffDict.staff_id) && ($user.staff_type == $staffDict.staff_type)) }
						<tr>
							<th colspan="5" class="mi_table_th">連絡先<span class="asterisk">※名刺には、以下のうち４種類まで表示できます。</span></th>
						</tr>
						{/if}
						{if ($user.client_id != 0) && ($user.staff_id == $staffDict.staff_id) && ($user.staff_type == $staffDict.staff_type) }
						<tr>
							<th class="mi_check_td">
								<input type="hidden" name="address_public_flg" value="0">
								{if ($staffDict.namecard_address_public_flg == 0)}
									<input type="checkbox" name="address_public_flg" value="1" id="checkbox-address">
									<label for="checkbox-address" class="sample_label"></label>
								{else}
									<input type="checkbox" name="address_public_flg" value="1" checked="checked" id="checkbox-address">
									<label for="checkbox-address" class="sample_label"></label>
								{/if}
							</th>
							<th class="mi_tabel_title">住所<span class="required">必須</span></th>
							<td colspan="3" class="mi_tabel_content">
								&nbsp;〒&nbsp;
								<input type="text" class="text_short mi_default_input input_hidden" name="client_postcode1" value="{$staffDict.namecard_postcode1|escape}"/>
								&nbsp;-&nbsp;
								<input type="text" class="text_short mi_default_input input_hidden" name="client_postcode2" value="{$staffDict.namecard_postcode2|escape}"/>
								<br>
								<input type="text" class="mi_default_input input_hidden" name="address" value="{$staffDict.namecard_address|escape}" style="width: 420px;margin-top: 10px;"/>
							</td>
						</tr>
						{/if}
						{if ($user.client_id != 0) && ($user.staff_id == $staffDict.staff_id) && ($user.staff_type == $staffDict.staff_type) }
						<tr>
							<th class="mi_check_td">
								<input type="hidden" name="email_public_flg" value="0">
								{if ($staffDict.namecard_email_public_flg == 0)}
									<input type="checkbox" name="email_public_flg" value="1" id="checkbox-mail">
									<label for="checkbox-mail" class="sample_label"></label>
								{else}
									<input type="checkbox" name="email_public_flg" value="1" checked="checked" id="checkbox-mail">
									<label for="checkbox-mail" class="sample_label"></label>
								{/if}
							</th>
							<th class="mi_tabel_title">名刺用メールアドレス</th>
							<td colspan="3" class="mi_tabel_content">
								<input type="text" class="mi_default_input input_hidden" name="namecard_email" value="{$staffDict.namecard_email|escape}" style="width: 420px;"/>
							</td>
						</tr>
						{/if}
						{if ($user.client_id != 0) && ($user.staff_id == $staffDict.staff_id) && ($user.staff_type == $staffDict.staff_type) }
						<tr>
							<th class="mi_check_td">
								<input type="hidden" name="url_public_flg" value="0">
								{if ($staffDict.namecard_url_public_flg == 0)}
									<input type="checkbox" name="url_public_flg" value="1" id="checkbox-url">
									<label for="checkbox-url" class="sample_label"></label>
								{else}
									<input type="checkbox" name="url_public_flg" value="1" checked="checked" id="checkbox-url">
									<label for="checkbox-url" class="sample_label"></label>
								{/if}
							</th>
							<th class="mi_tabel_title">URL（自社HPなど）</th>
							<td colspan="3" class="mi_tabel_content">
								<input type="text" class="mi_default_input input_hidden" name="namecard_url" value="{$staffDict.namecard_url|escape}" style="width: 420px;"/>
							</td>
						</tr>
						{/if}
						{if ($user.client_id != 0) && ($user.staff_id == $staffDict.staff_id) && ($user.staff_type == $staffDict.staff_type) }
						<tr>
							<th class="mi_check_td">
								<input type="hidden" name="tel_public_flg" value="0">
								{if ($staffDict.namecard_tel_public_flg == 0)}
									<input type="checkbox" name="tel_public_flg" value="1" id="checkbox-tel">
									<label for="checkbox-tel" class="sample_label"></label>
								{else}
									<input type="checkbox" name="tel_public_flg" value="1" checked="checked" id="checkbox-tel">
									<label for="checkbox-tel" class="sample_label"></label>
								{/if}
							</th>
							<th class="mi_tabel_title">電話番号<span class="required">必須</span></th>
							<td colspan="3" class="mi_tabel_content">
								<input type="text" class="text_short mi_default_input input_hidden" name="tel1" value="{$staffDict.namecard_tel1|escape}"/>&nbsp;-&nbsp;
								<input type="text" class="text_short mi_default_input input_hidden" name="tel2" value="{$staffDict.namecard_tel2|escape}"/>&nbsp;-&nbsp;
								<input type="text" class="text_short mi_default_input input_hidden" name="tel3" value="{$staffDict.namecard_tel3|escape}"/>
							</td>
						</tr>
						{/if}
						{if ($user.client_id != 0) && ($user.staff_id == $staffDict.staff_id) && ($user.staff_type == $staffDict.staff_type) }
						<tr>
							<th class="mi_check_td">
								<input type="hidden" name="cell_public_flg" value="0">
								{if ($staffDict.namecard_cell_public_flg == 0)}
									<input type="checkbox" name="cell_public_flg" value="1" id="checkbox-cel">
									<label for="checkbox-cel" class="sample_label"></label>
								{else}
									<input type="checkbox" name="cell_public_flg" value="1" checked="checked" id="checkbox-cel">
									<label for="checkbox-cel" class="sample_label"></label>
								{/if}
							</th>
							<th class="mi_tabel_title">携帯番号</th>
							<td colspan="3" class="mi_tabel_content">
								<input type="text" class="text_short mi_default_input input_hidden" name="cell1" value="{$staffDict.namecard_cell1|escape}" />&nbsp;-&nbsp;
								<input type="text" class="text_short mi_default_input input_hidden" name="cell2" value="{$staffDict.namecard_cell2|escape}" />&nbsp;-&nbsp;
								<input type="text" class="text_short mi_default_input input_hidden" name="cell3" value="{$staffDict.namecard_cell3|escape}" />
							</td>
						</tr>
						{/if}
						{if ($user.client_id != 0) && ($user.staff_id == $staffDict.staff_id) && ($user.staff_type == $staffDict.staff_type) }
						<tr>
							<th class="mi_check_td">
								<input type="hidden" name="fax_public_flg" value="0">
								{if ($staffDict.namecard_fax_public_flg == 0)}
									<input type="checkbox" name="fax_public_flg" value="1" id="checkbox-fax">
									<label for="checkbox-fax" class="sample_label"></label>
								{else}
									<input type="checkbox" name="fax_public_flg" value="1" checked="checked" id="checkbox-fax">
									<label for="checkbox-fax" class="sample_label"></label>
								{/if}
							</th>
							<th class="mi_tabel_title">FAX番号</th>
							<td colspan="3" class="mi_tabel_content">
								<input type="text" class="text_short mi_default_input input_hidden" name="fax1" value="{$staffDict.namecard_fax1|escape}" />&nbsp;-&nbsp;
								<input type="text" class="text_short mi_default_input input_hidden" name="fax2" value="{$staffDict.namecard_fax2|escape}" />&nbsp;-&nbsp;
								<input type="text" class="text_short mi_default_input input_hidden" name="fax3" value="{$staffDict.namecard_fax3|escape}" />
							</td>
						</tr>
						{/if}
						{if ($user.client_id != 0) && (($user.staff_id == $staffDict.staff_id) && ($user.staff_type == $staffDict.staff_type)) }
						<tr>
							<th colspan="5" class="mi_table_th">SNS情報<span class="asterisk">※リンクがアイコンになって表示されます。</span></th>
						</tr>
						{/if}
						{if ($user.client_id != 0) && ($user.staff_id == $staffDict.staff_id) && ($user.staff_type == $staffDict.staff_type) }
						<tr>
							<th class="mi_check_td">
								<input type="hidden" name="facebook_public_flg" value="0">
								{if ($staffDict.namecard_facebook_public_flg == 0)}
									<input type="checkbox" name="facebook_public_flg" value="1" id="checkbox-facebook">
									<label for="checkbox-facebook" class="sample_label"></label>
								{else}
									<input type="checkbox" name="facebook_public_flg" value="1" checked="checked" id="checkbox-facebook">
									<label for="checkbox-facebook" class="sample_label"></label>
								{/if}
							</th>
							<th class="mi_tabel_title">Facebook</th>
							<td colspan="3" class="mi_tabel_content">
								<input type="text" class="f_account mi_default_input input_hidden" name="facebook" value="{$staffDict.namecard_facebook}"/>
							</td>
						</tr>
						{/if}
						{if ($user.client_id != 0) && ($user.staff_id == $staffDict.staff_id) && ($user.staff_type == $staffDict.staff_type) }
						<tr>
							<th class="mi_check_td">
								<input type="hidden" name="sns_public_flg" value="0">
								{if ($staffDict.namecard_sns_public_flg == 0)}
									<input type="checkbox" name="sns_public_flg" value="1" id="checkbox-sns">
									<label for="checkbox-sns" class="sample_label"></label>
								{else}
									<input type="checkbox" name="sns_public_flg" value="1" checked="checked" id="checkbox-sns">
									<label for="checkbox-sns" class="sample_label"></label>
								{/if}
							</th>
							<th class="mi_tabel_title">SNS</th>
							<td colspan="3" class="mi_tabel_content">
								<input type="text" class="f_account mi_default_input input_hidden" name="sns" value="{$staffDict.namecard_sns}"/>
							</td>
						</tr>
						{/if}
						{if ($user.client_id != 0) && (($user.staff_id == $staffDict.staff_id) && ($user.staff_type == $staffDict.staff_type)) }
						<tr>
							<th colspan="5" class="mi_table_th">アカウント情報<span class="asterisk">※名刺には表示されません。</span></th>
						</tr>
						{/if}
						<tr>
							<th class="mi_check_td"></th>
							<th class="mi_tabel_title">パスワード</th>
							<td colspan="3" class="mi_tabel_content">
								{if $staffDict.staff_id != ""}
									<input type="password" class="f_account mi_default_input input_hidden" name="staff_password" value="xxxxxxxx" readonly="readonly" />
									<span class="mi_profile_chage_link detail_open">変更する</span>
									<input type="hidden" name="staff_password" id="staff_password" value=""/>
									<input type="hidden" name="staff_password_mod" id="staff_password_mod" value="0"/>
								{else}
									<input type="password" class="f_account mi_default_input input_hidden" name="staff_password" id="staff_password" value="{$staffDict.staff_password|escape}" autocomplete="off"/>
									<p style="padding: 8px;"><span class="note">※パスワードを入力してください<br />※8文字以上の半角英数字</span></p>
									<input type="hidden" name="staff_password_mod" id="staff_password_mod" value="1"/>
								{/if}
							</td>
						</tr>
						<tr>
							<th class="mi_check_td"></th>
							<th class="mi_tabel_title">アカウントID</th>
							<td colspan="3" class="mi_tabel_content">
								<span class="account_id_val">
								{if $staffDict.staff_id != ''}{$staffDict.staff_type}
									{$staffDict.staff_id|string_format:"%05d"}</span>
									<input type="hidden" name="staffType" id="staffType" value="{$staffDict.staff_type|escape}" />
									<input type="hidden" name="staffId"   id="staffId"   value="{$staffDict.staff_id|escape}" />
								{else}
								新規
								{/if}
								<input type="hidden" name="client_id" value="{$staffDict.client_id|escape}" />
								{if ($user.client_id != 0) && (($user.staff_type == $staffDict.staff_type) && ($user.staff_id == $staffDict.staff_id)) }
								<input type="hidden" name="namecard_client_id" value="{$user.client_id|escape}" />
								{/if}
							</td>
						</tr>
						
						<tr>
							<th class="mi_check_td"></th>
							<th class="mi_tabel_title">メールアドレス<span class="required">必須</span></th>
							<td colspan="3" class="mi_tabel_content">
								<input type="text" class="f_account mi_default_input input_hidden" name="staff_email" value="{$staffDict.staff_email|escape}"/>
							</td>
						</tr>
						{if $user.staff_type == 'AA' && $user.staff_role == "AA_1"}
						<tr>
							<th class="mi_check_td"></th>
							<th class="mi_tabel_title">権限<span class="required">必須</span></th>
							<td colspan="3" class="mi_tabel_content">
								<input type="radio" name="staff_role" value="{$smarty.const.ROLE_ADM}" {if $staffDict.staff_role == $smarty.const.ROLE_ADM}checked{/if} {if $user.staff_type == "CE" && $user.staff_role != "AA_1"}disabled="disabled"{/if}>管理者
								<input type="radio" name="staff_role" value="{$smarty.const.ROLE_EMP}" {if $staffDict.staff_role == $smarty.const.ROLE_EMP}checked{/if} {if $user.staff_type == "CE" && $user.staff_role != "AA_1"}disabled="disabled"{/if}>一般社員
								{if $user.staff_type == 'AA'}
								<input type="radio" name="staff_role" value="{$smarty.const.ROLE_PRT}" {if $staffDict.staff_role == $smarty.const.ROLE_PRT}checked{/if} >アルバイト
								{/if}
								</td>
							</tr>
						{else}
						<tr>
							<th class="mi_check_td"></th>
							<th class="mi_tabel_title">権限<span class="required">必須</span></th>
							<td colspan="3" class="mi_tabel_content">
							{if $staffDict.staff_role == $smarty.const.ROLE_ADM }
								<input type="radio" name="staff_role" value="{$smarty.const.ROLE_ADM}" checked>管理者
							{elseif $staffDict.staff_role == $smarty.const.ROLE_EMP}
								<input type="radio" name="staff_role" value="{$smarty.const.ROLE_EMP}" checked>一般社員
							{else}
								<input type="radio" name="staff_role" value="{$smarty.const.ROLE_PRT}" checked>アルバイト
							{/if}
							</td>
						</tr>
						{/if}
						{if $user.staff_type == 'AA' && $user.staff_role == "AA_1" }
						<tr>
							<th class="mi_check_td"></th>
							<th class="mi_tabel_title">WebPhoneID</th>
							<td colspan="3" class="mi_tabel_content">
								<input type="text" class="f_WebPhoneID f_account mi_default_input input_hidden" name="webphone_id" value="{$staffDict.webphone_id|escape}"/>
							</td>
						</tr>
						<tr>
							<th class="mi_check_td"></th>
							<th class="mi_tabel_title">WebPhonePassword</th>
							<td colspan="3" class="mi_tabel_content">
								<input type="text" class="f_WebPhonePassword f_account mi_default_input input_hidden" name="webphone_pass" value="{$staffDict.webphone_pass|escape}"/>
							</td>
						</tr>
						<tr>
							<th class="mi_check_td"></th>
							<th class="mi_tabel_title">WebPhoneIp</th>
							<td colspan="3" class="mi_tabel_content">
								<input type="text" class="f_WebPhoneIp f_account mi_default_input input_hidden" name="webphone_ip" value="{$staffDict.webphone_ip|escape}"/>
							</td>
						</tr>
						{/if}
						<tr>
							<th class="mi_check_td"></th>
							<th class="mi_tabel_title">デスクトップ通知</th>
							<td colspan="3" class="mi_tabel_content">
								<label><input type="radio" name="desktop_notify_flg" value="0" {if $staffDict.desktop_notify_flg == 0}checked="checked" {/if}>無</label>
								<label><input type="radio" name="desktop_notify_flg" value="1" {if $staffDict.desktop_notify_flg == 1 || $staffDict.desktop_notify_flg == ""}checked="checked" {/if}>有</label>
							</td>
						</tr>
					</tbody>
				</table>
				<br>

				{if ($user.client_id != 0) && ($user.staff_id == $staffDict.staff_id) && ($user.staff_type == $staffDict.staff_type) }
				<table class="mi_table_input_right mi_table_main">
					<tbody>
						{if ($user.client_id != 0) && (($user.staff_id == $staffDict.staff_id) && ($user.staff_type == $staffDict.staff_type)) }
						<tr>
							<th class="mi_check_th">
								<input type="hidden" name="namecard_cate2_title_public_flg" value="0">
								{if ($staffDict.namecard_cate2_title_public_flg == 0)}
									<input type="checkbox" name="namecard_cate2_title_public_flg" value="1" id="checkbox-cate2">
									<label for="checkbox-cate2" class="sample_label"></label>
								{else}
									<input type="checkbox" name="namecard_cate2_title_public_flg" value="1" checked="checked" id="checkbox-cate2">
									<label for="checkbox-cate2" class="sample_label"></label>
								{/if}
							</th>
							<th colspan="4" class="mi_title_th">このカテゴリーを名刺に表示する</th>
							{*<td style="background-color: #35a0d4;" class="mi_tabel_content">*}
								{*<input style="background-color: #ffffff" placeholder="フリー項目タイトル(２０文字以内)" type="text" class="f_mail mi_default_input input_hidden" name="namecard_cate2_title" value="{$staffDict.namecard_cate2_title}" maxlength="20"/>*}
							{*</td>*}
						</tr>
						<tr>
							<td colspan="5" class="mi_tabel_content free_title_td">
								<input style="background-color: #ffffff" placeholder="フリー項目タイトル (20文字以内)" type="text" class="free_title mi_default_input input_hidden" name="namecard_cate2_title" value="{$staffDict.namecard_cate2_title}" maxlength="20"/>
							</td>
						</tr>
						{/if}
						{if ($user.client_id != 0) && ($user.staff_id == $staffDict.staff_id) && ($user.staff_type == $staffDict.staff_type) }
						<tr>
							<th class="mi_check_td">
								<input type="hidden" name="free1_public_flg" value="0">
								{if ($staffDict.namecard_free1_public_flg == 0)}
									<input type="checkbox" name="free1_public_flg" value="1" id="checkbox-free1">
									<label for="checkbox-free1" class="sample_label"></label>
								{else}
									<input type="checkbox" name="free1_public_flg" value="1" checked="checked" id="checkbox-free1">
									<label for="checkbox-free1" class="sample_label"></label>
								{/if}
							</th>
							<th class="mi_tabel_title free_content_th">
								<input type="text" name="free_item_name1" class="mi_default_input mi_free_input input_hidden" value="{$staffDict.namecard_free1_name}" placeholder="フリー項目1(6文字以内)" maxlength="6"/>
							</th>
							<td colspan="3" class="mi_tabel_content">
								<input type="text" class="f_mail mi_default_input input_hidden" name="free_item_val1" value="{$staffDict.namecard_free1_val}"/>
							</td>
						</tr>
						{/if}
						{if ($user.client_id != 0) && ($user.staff_id == $staffDict.staff_id) && ($user.staff_type == $staffDict.staff_type) }
						<tr>
							<th class="mi_check_td">
								<input type="hidden" name="free2_public_flg" value="0">
								{if ($staffDict.namecard_free2_public_flg == 0)}
									<input type="checkbox" name="free2_public_flg" value="1" id="checkbox-free2">
									<label for="checkbox-free2" class="sample_label"></label>
								{else}
									<input type="checkbox" name="free2_public_flg" value="1" checked="checked" id="checkbox-free2">
									<label for="checkbox-free2" class="sample_label"></label>
								{/if}
							</th>
							<th class="mi_tabel_title free_content_th">
								<input type="text" name="free_item_name2" class="mi_default_input mi_free_input input_hidden" value="{$staffDict.namecard_free2_name}" placeholder="フリー項目2(6文字以内)" maxlength="6" />
							</th>
							<td colspan="3" class="mi_tabel_content">
								<input type="text" class="f_mail mi_default_input input_hidden" name="free_item_val2" value="{$staffDict.namecard_free2_val}"/>
							</td>
						</tr>
						{/if}
						{if ($user.client_id != 0) && ($user.staff_id == $staffDict.staff_id) && ($user.staff_type == $staffDict.staff_type) }
						<tr>
							<th class="mi_check_td">
								<input type="hidden" name="free3_public_flg" value="0">
								{if ($staffDict.namecard_free3_public_flg == 0)}
									<input type="checkbox" name="free3_public_flg" value="1" id="checkbox-free3">
									<label for="checkbox-free3" class="sample_label"></label>
								{else}
									<input type="checkbox" name="free3_public_flg" value="1" checked="checked" id="checkbox-free3">
									<label for="checkbox-free3" class="sample_label"></label>
								{/if}
							</th>
							<th class="mi_tabel_title free_content_th">
								<input type="text" name="free_item_name3" class="mi_default_input mi_free_input input_hidden" value="{$staffDict.namecard_free3_name}" placeholder="フリー項目3(6文字以内)" maxlength="6"/>
							</th>
							<td colspan="3" class="mi_tabel_content">
								<input type="text" class="f_mail mi_default_input input_hidden" name="free_item_val3" value="{$staffDict.namecard_free3_val}"/>
							</td>
						</tr>
						{/if}
						{if ($user.client_id != 0) && ($user.staff_id == $staffDict.staff_id) && ($user.staff_type == $staffDict.staff_type) }
						<tr>
							<th class="mi_check_td">
								<input type="hidden" name="free4_public_flg" value="0">
								{if ($staffDict.namecard_free4_public_flg == 0)}
									<input type="checkbox" name="free4_public_flg" value="1" id="checkbox-free4">
									<label for="checkbox-free4" class="sample_label"></label>
								{else}
									<input type="checkbox" name="free4_public_flg" value="1" checked="checked" id="checkbox-free4">
									<label for="checkbox-free4" class="sample_label"></label>
								{/if}
							</th>
							<th class="mi_tabel_title free_content_th">
								<input type="text" name="free_item_name4" class="mi_default_input mi_free_input input_hidden" value="{$staffDict.namecard_free4_name}" placeholder="フリー項目4(6文字以内)" maxlength="6"/>
							</th>
							<td colspan="3" class="mi_tabel_content">
								<input type="text" class="f_mail mi_default_input input_hidden" name="free_item_val4" value="{$staffDict.namecard_free4_val}"/>
							</td>
						</tr>
						{/if}
						{if ($user.client_id != 0) && ($user.staff_id == $staffDict.staff_id) && ($user.staff_type == $staffDict.staff_type) }
						<tr>
							<th class="mi_check_td">
								<input type="hidden" name="free5_public_flg" value="0">
								{if ($staffDict.namecard_free5_public_flg == 0)}
									<input type="checkbox" name="free5_public_flg" value="1" id="checkbox-free5">
									<label for="checkbox-free5" class="sample_label"></label>
								{else}
									<input type="checkbox" name="free5_public_flg" value="1" checked="checked" id="checkbox-free5">
									<label for="checkbox-free5" class="sample_label"></label>
								{/if}
							</th>
							<th class="mi_tabel_title free_content_th">
								<input type="text" name="free_item_name5" class="mi_default_input mi_free_input input_hidden" value="{$staffDict.namecard_free5_name}" placeholder="フリー項目5(6文字以内)" maxlength="6"/>
							</th>
							<td colspan="3" class="mi_tabel_content">
								<input type="text" class="f_mail mi_default_input input_hidden" name="free_item_val5" value="{$staffDict.namecard_free5_val}"/>
							</td>
						</tr>
						{/if}
					</tbody>
				</table>
				<br>
				{/if}

				{if ($user.client_id != 0) && ($user.staff_id == $staffDict.staff_id) && ($user.staff_type == $staffDict.staff_type) }
				<table class="mi_table_input_right mi_table_main">
					<tbody>
						{if ($user.client_id != 0) && (($user.staff_id == $staffDict.staff_id) && ($user.staff_type == $staffDict.staff_type)) }
						<tr>
							<th class="mi_check_th">
								<input type="hidden" name="namecard_cate3_title_public_flg" value="0">
								{if ($staffDict.namecard_cate3_title_public_flg == 0)}
									<input type="checkbox" name="namecard_cate3_title_public_flg" value="1" id="checkbox-cate3">
									<label for="checkbox-cate3" class="sample_label"></label>
								{else}
									<input type="checkbox" name="namecard_cate3_title_public_flg" value="1" checked="checked" id="checkbox-cate3">
									<label for="checkbox-cate3" class="sample_label"></label>
								{/if}
							</th>
							<th colspan="4" class="mi_title_th">このカテゴリーを名刺に表示する</th>
							{*<td style="background-color: #35a0d4;" class="mi_tabel_content">*}
								{*<input style="background-color: #ffffff" placeholder="フリー項目タイトル(２０文字以内)" type="text" class="f_mail mi_default_input input_hidden" name="namecard_cate3_title" value="{$staffDict.namecard_cate3_title}" maxlength="20"/>*}
							{*</td>*}
						</tr>
						<tr>
							<td colspan="5" class="mi_tabel_content free_title_td">
								<input style="background-color: #ffffff" placeholder="写真紹介タイトル(20文字以内)" type="text" class="free_title mi_default_input input_hidden" name="namecard_cate3_title" value="{$staffDict.namecard_cate3_title}" maxlength="20"/>
							</td>
						</tr>
						{/if}
						{if ($user.client_id != 0) && ($user.staff_id == $staffDict.staff_id) && ($user.staff_type == $staffDict.staff_type) }
						<tr>
							<th class="mi_check_td">
								<input type="hidden" name="namecard_photo1_public_flg" value="0">
								{if ($staffDict.namecard_photo1_public_flg == 0)}
									<input type="checkbox" name="namecard_photo1_public_flg" value="1" id="checkbox-photo1">
									<label for="checkbox-photo1" class="sample_label"></label>
								{else}
									<input type="checkbox" name="namecard_photo1_public_flg" value="1" checked="checked" id="checkbox-photo1">
									<label for="checkbox-photo1" class="sample_label"></label>
								{/if}
							</th>
							<th class="mi_tabel_title">写真１</th>
							<td colspan="3" class="mi_tabel_content">
								<span class="namecard_photo_td">
                                    {if $staffDict.namecardPhoto1ImgPath != ""}
										<img src="{$staffDict.namecardPhoto1ImgPath}" alt="Image" id="preview_photo1" class="namecard-photo-contain">
                                    {else}
										<img src='/img/no_image.png' alt="NoImage" id="preview_photo1" class="namecard-photo-contain">
                                    {/if}
                                    <div class="file-button-photo">
                                        <label for="namecard_photo1" class="file">
                                            ファイルを選択
                                            <input type="file" id="namecard_photo1" name="namecard_photo1" class="namecard_photo">
                                        </label>
                                        <div>
                                            <span class="file-delete" id="namecard_photo1-delete">
                                                ファイルを削除
                                            </span>
                                        </div>
                                    </div>
									<input type="hidden" id="tmp_photo1" name="tmpNamecard_photo1" value="{$staffDict.tmpNamecardPhoto1ImgPath}"/>
									<input type="hidden" id="photo1_flg" name="photo1_flg" {if $staffDict.photo1_flg == 1}value="1"{/if} />
								</span>
							</td>
						</tr>
						{/if}
						{if ($user.client_id != 0) && ($user.staff_id == $staffDict.staff_id) && ($user.staff_type == $staffDict.staff_type) }
						<tr>
							<th class="mi_check_td">
								<input type="hidden" name="namecard_photo1_desc_public_flg" value="0">
								{if ($staffDict.namecard_photo1_desc_public_flg == 0)}
									<input type="checkbox" name="namecard_photo1_desc_public_flg" value="1" id="checkbox-photo1-desc">
									<label for="checkbox-photo1-desc" class="sample_label"></label>
								{else}
									<input type="checkbox" name="namecard_photo1_desc_public_flg" value="1" checked="checked" id="checkbox-photo1-desc">
									<label for="checkbox-photo1-desc" class="sample_label"></label>
								{/if}
							</th>
							<th class="mi_tabel_title">写真１／説明文</th>
							<td colspan="3" class="mi_tabel_content">
								<textarea class="mi_content_textarea" name="namecard_photo1_desc">{$staffDict.namecard_photo1_desc}</textarea>
							</td>
						</tr>
						{/if}
						{if ($user.client_id != 0) && ($user.staff_id == $staffDict.staff_id) && ($user.staff_type == $staffDict.staff_type) }
						<tr>
							<th class="mi_check_td">
								<input type="hidden" name="namecard_photo2_public_flg" value="0">
								{if ($staffDict.namecard_photo2_public_flg == 0)}
									<input type="checkbox" name="namecard_photo2_public_flg" value="1" id="checkbox-photo2">
									<label for="checkbox-photo2" class="sample_label"></label>
								{else}
									<input type="checkbox" name="namecard_photo2_public_flg" value="1" checked="checked" id="checkbox-photo2">
									<label for="checkbox-photo2" class="sample_label"></label>
								{/if}
							</th>
							<th class="mi_tabel_title">写真２</th>
							<td colspan="3" class="mi_tabel_content">
								<span class="namecard_photo_td">
									 {if $staffDict.namecardPhoto2ImgPath != ""}
										 <img src="{$staffDict.namecardPhoto2ImgPath}" alt="Image" id="preview_photo2" class="namecard-photo-contain">
                                    {else}
										<img src='/img/no_image.png' alt="NoImage" id="preview_photo2" class="namecard-photo-contain">
                                     {/if}
                                    <div class="file-button-photo">
                                        <label for="namecard_photo2" class="file">
                                            ファイルを選択
                                            <input type="file" id="namecard_photo2" name="namecard_photo2" class="namecard_photo">
                                        </label>
                                        <div>
                                                <span class="file-delete" id="namecard_photo2-delete">
                                                    ファイルを削除
                                                </span>
                                        </div>
                                    </div>
									<input type="hidden" id="tmp_photo2" name="tmpNamecard_photo2" value="{$staffDict.tmpNamecardPhoto2ImgPath}"/>
									<input type="hidden" id="photo2_flg" name="photo2_flg" {if $staffDict.photo2_flg == 1}value="1"{/if} />
								</span>
							</td>
						</tr>
						{/if}
						{if ($user.client_id != 0) && ($user.staff_id == $staffDict.staff_id) && ($user.staff_type == $staffDict.staff_type) }
						<tr>
							<th class="mi_check_td">
								<input type="hidden" name="namecard_photo2_desc_public_flg" value="0">
								{if ($staffDict.namecard_photo2_desc_public_flg == 0)}
									<input type="checkbox" name="namecard_photo2_desc_public_flg" value="1" id="checkbox-photo2-desc">
									<label for="checkbox-photo2-desc" class="sample_label"></label>
								{else}
									<input type="checkbox" name="namecard_photo2_desc_public_flg" value="1" checked="checked" id="checkbox-photo2-desc">
									<label for="checkbox-photo2-desc" class="sample_label"></label>
								{/if}
							</th>
							<th class="mi_tabel_title">写真２／説明文</th>
							<td colspan="3" class="mi_tabel_content">
								<textarea class="mi_content_textarea" name="namecard_photo2_desc">{$staffDict.namecard_photo2_desc}</textarea>
							</td>
						</tr>
						{/if}
					</tbody>
				</table>
				<br>
				{/if}
				{if ($user.client_id != 0) && ($user.staff_id == $staffDict.staff_id) && ($user.staff_type == $staffDict.staff_type) }
				<table class="mi_table_input_right mi_table_main">
					<tbody>
						{if ($user.client_id != 0) && (($user.staff_id == $staffDict.staff_id) && ($user.staff_type == $staffDict.staff_type)) }
						<tr>
							<th class="mi_check_th">
								<input type="hidden" name="namecard_cate4_title_public_flg" value="0">
								{if ($staffDict.namecard_cate4_title_public_flg == 0)}
									<input type="checkbox" name="namecard_cate4_title_public_flg" value="1" id="checkbox-cate4">
									<label for="checkbox-cate4" class="sample_label"></label>
								{else}
									<input type="checkbox" name="namecard_cate4_title_public_flg" value="1" checked="checked" id="checkbox-cate4">
									<label for="checkbox-cate4" class="sample_label"></label>
								{/if}
							</th>
							<th colspan="3" class="mi_title_th">このカテゴリーを名刺に表示する</th>
							{*<td style="background-color: #35a0d4;" class="mi_tabel_content">*}
								{*<input style="background-color: #ffffff" placeholder="フリー項目タイトル(２０文字以内)" type="text" class="f_mail mi_default_input input_hidden" name="namecard_cate4_title" value="{$staffDict.namecard_cate4_title}" maxlength="20"/>*}
							{*</td>*}
						</tr>
						<tr>
							<td colspan="4" class="mi_tabel_content free_title_td">
								<input style="background-color: #ffffff" placeholder="自由入力欄項目タイトル (20文字以内)" type="text" class="free_title mi_default_input input_hidden" name="namecard_cate4_title" value="{$staffDict.namecard_cate4_title}" maxlength="20"/>
							</td>
						</tr>
						{/if}
						{if ($user.client_id != 0) && ($user.staff_id == $staffDict.staff_id) && ($user.staff_type == $staffDict.staff_type) }
						<tr>
							<th class="mi_check_td">
								<input type="hidden" name="namecard_introduction_public_flg" value="0">
								{if ($staffDict.namecard_introduction_public_flg == 0)}
									<input type="checkbox" name="namecard_introduction_public_flg" value="1" id="checkbox-cate4-desc">
									<label for="checkbox-cate4-desc" class="sample_label"></label>
								{else}
									<input type="checkbox" name="namecard_introduction_public_flg" value="1" checked="checked" id="checkbox-cate4-desc">
									<label for="checkbox-cate4-desc" class="sample_label"></label>
								{/if}
							</th>
							<td colspan="3" class="mi_tabel_content">
								<textarea class="mi_content_textarea" name="namecard_introduction" id="namecard-introduction">{$staffDict.namecard_introduction}</textarea>
							</td>
						</tr>
						{/if}
					</tbody>
				</table>
				{/if}
			</div>
			<!-- テーブル end -->
			<div class="mi_tabel_btn_area">
        <!--<button type="button" class="mi_cancel_btn mi_btn_m">キャンセル</button>-->
        <button type="button" name="submit_button" class="mi_default_button mi_btn_m mi_btn_m hvr-fade" id="submit_button">登録する</button>
      </div>
			{if $ret.top == 1}
				<input type="hidden" name="ret" value="top"/>
			{/if}
			<input type="hidden" name="staff_type" value="{$staffDict.staff_type|escape}" />
			<input type="hidden" name="staff_id"   value="{$staffDict.staff_id|escape}" />
			{if $staffDict.meetin_number != ''}
				<input type="hidden" name="meetin_number" value="{$staffDict.meetin_number}"/>
			{/if}
		</form>
	</div>
	<!-- コンテンツエリア end -->
</div>
<!-- メインコンテンツ end -->

<!-- ====================================== モーダルコンテンツ[start] ====================================== -->
<div class="modal-content-preview" id="modal-content-preview-namecard">
	<div class="mi_modal_shadow"></div>
	<div class="inner-wrap mi_modal_default" id="namecard-area">
	</div>
</div>
<div class="modal-content" id="modal-content-change-pass">
	<div class="mi_modal_shadow"></div>
	<div class="inner-wrap mi_modal_default">
	</div>
</div>
<!-- ====================================== モーダルコンテンツ[end] ======================================== -->

{literal}
<script id="namecard-modal-template" type="text/x-handlebars-template">

{{#if wide_flg}}
<div class="mi_namecard_contents">
	<div class="mi_namecard_title">プロフィール</div>
	<div class="mi_namecard_detail" id="mi_namecard_detail">
		<div class="feature-list">
			<div class="feature-item">
				<div class="mi_namecard_detail_header">{{cate1_title}}</div>
				<div class="mi_namecard_detail_content" id="namecard_staff_info">
					<div class="left">
						<div class="namecard_user_icon" style="background: url('{{picture_img}}') center center no-repeat; background-size: contain;"></div>
						{{#if namecard_img}}
							<button type="button" name="button" class="mi_pdf_dl_button" id="namecard_download" data-namecard-name="{{namecard_name}}" data-namecard-url="{{namecard_img}}"><span class="namecard_download_title">名刺ダウンロード</span></button>
						{{/if}}
						{{#if namecard_img_none}}
						<div id="namecard_none">&nbsp;</div>
						{{/if}}
						<a href="" download="" name="download_namcard_link"></a>
						<div class="sns-icon">
							{{#if fb_url}}
							<a href="{{fb_url}}" id="a_facebook" value="{{fb_url}}" class="mi_facebook" target="_blank"><img src="/img/facebook_bl.png" class="mi_facebook_icon"></a>
							{{/if}}
							{{#if sns_url}}
							<a href="{{sns_url}}" id="a_sns" value="{{sns_url}}" class="mi_facebook" target="_blank"><img src="/img/sns.png" class="mi_facebook_icon"></a>
							{{/if}}
						</div>
					</div>
					<div class="contents">
						<div class="contents_client_name"><p>{{client_name}}</p></div>
						<div>{{department}}</div>
						<div class="contents_staff_executive">{{executive}}</div>
						<div class="contents_staff_name"><p>{{staff_firstname}} {{staff_lastname}}</p></div>
						<div class="contents_staff_nameph">{{staff_firstnamepy}} {{staff_lastnamepy}}</div>
						<div class="contents_small">
							{{#if client_postcode1}}
							<div>〒&nbsp;{{client_postcode1}}-{{client_postcode2}}&nbsp;{{address}}
							</div>
							{{/if}}
							{{#if namecard_email}}
							<span class="namecard-icon icon-mail"></span>&nbsp;Mail：
							<a href="mailto:{{namecard_email}}" target="_self" class="namecard_url_href">{{namecard_email}}</a>
							{{/if}}
							{{#if namecard_url}}
							<div>
								<span class="namecard-icon icon-connect"></span>&nbsp;URL：
								<a href="{{namecard_url}}" target="_blank" class="namecard_url_href">{{namecard_url}}</a>
							</div>
							{{/if}}
							{{#if tel}}
							<div>
								<span class="namecard-icon icon-call"></span>&nbsp;電話番号：{{tel}}
							</div>
							{{/if}}
							{{#if cell}}
							<div>
								<span class="namecard-icon icon-call"></span>&nbsp;携帯番号：{{cell}}
							</div>
							{{/if}}
							{{#if fax}}
							<div>
								<span class="namecard-icon icon-report"></span>&nbsp;FAX：{{fax}}
							</div>
							{{/if}}
						</div>
					</div>
				</div>
			</div>
			<div class="feature-item">
				<div class="mi_namecard_detail_header">{{cate2_title}}</div>
				<div class="mi_namecard_detail_content" id="namecard_table">
					<table class="namecard-table">
						<tbody>
							<tr class="namecard-table-tr">
								<th class="namecard-table-th"><p>{{namecard_free1_name}}</p></th>
								<td>&nbsp;{{namecard_free1_val}}</td>
							</tr>
							<tr class="namecard-table-tr">
								<th class="namecard-table-th"><p>{{namecard_free2_name}}</p></th>
								<td>&nbsp;{{namecard_free2_val}}</td>
							</tr>
							<tr class="namecard-table-tr">
								<th class="namecard-table-th"><p>{{namecard_free3_name}}</p></th>
								<td>&nbsp;{{namecard_free3_val}}</td>
							</tr>
							<tr class="namecard-table-tr">
								<th class="namecard-table-th"><p>{{namecard_free4_name}}</p></th>
								<td>&nbsp;{{namecard_free4_val}}</td>
							</tr>
							<tr class="namecard-table-tr">
								<th class="namecard-table-th"><p>{{namecard_free5_name}}</p></th>
								<td>&nbsp;{{namecard_free5_val}}</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
			<div class="feature-item">
				<div class="mi_namecard_detail_header">{{cate3_title}}</div>
				<div class="mi_namecard_detail_content">
					<div class="center">
						<span class="namecard-photo-contain-preview" alt="写真１" style="background-image: url('{{namecard_photo1_url}}');"></span>
						<div class="namecard-photo-text">{{namecard_photo1_desc}}</div>
					</div>
					<div class="center_br"></div>
					<div class="center">
						<span class="namecard-photo-contain-preview" alt="写真２" style="background-image: url('{{namecard_photo2_url}}');"></span>
						<div class="namecard-photo-text">{{namecard_photo2_desc}}</div>
					</div>
				</div>
			</div>
			<div class="feature-item">
				<div class="mi_namecard_detail_header">{{cate4_title}}</div>
				<div class="mi_namecard_detail_content">
					<div>{{namecard_introduction}}</div>
				</div>
			</div>
	</div>
	<div class="mi_close_icon modal-close">
		<span class="icon-close" id="namecard_close"></span>
	</div>
</div>
{{/if}}


{{#if narrow_flg}}
<div class="mi_namecard_contents">
	<div class="mi_namecard_title">プロフィール</div>
	<div class="mi_namecard_detail" id="mi_namecard_detail">
		<div class="feature-list">
			{{#if namecard_cate1_public_flg}}
			<div class="feature-item" id="feature-item-1">
				<div class="mi_namecard_detail_header">{{cate1_title}}</div>
				<div class="mi_namecard_detail_content" id="namecard_staff_info">
					<div class="left">
						<div class="namecard_user_icon" style="background: url('{{picture_img}}') center center no-repeat; background-size: contain;"></div>
						{{#if namecard_img}}
                        <button type="button" name="button" class="mi_pdf_dl_button" id="namecard_download" data-namecard-name="{{namecard_name}}" data-namecard-url="{{namecard_img}}"><span class="namecard_download_title">名刺ダウンロード</span></button>
						{{/if}}
                        {{#if namecard_img_none}}
                        <div id="namecard_none">&nbsp;</div>
                        {{/if}}
                        <a href="" download="" name="download_namcard_link"></a>
						<div class="sns-icon">
							{{#if fb_url}}
							<a href="{{fb_url}}" class="mi_facebook" target="_blank"><img src="/img/facebook_bl.png" class="mi_facebook_icon"></a>
							{{/if}}
							{{#if sns_url}}
							<a href="{{sns_url}}" class="mi_facebook" target="_blank"><img src="/img/sns.png" class="mi_facebook_icon"></a>
							{{/if}}
						</div>
					</div>
					<div class="contents">
						<div class="contents_client_name"><p>{{client_name}}</p></div>
						<div>{{department}}</div>
						<div class="contents_staff_executive">{{executive}}</div>
						<div class="contents_staff_name"><p>{{staff_firstname}} {{staff_lastname}}</p></div>
						<div class="contents_staff_nameph">{{staff_firstnamepy}} {{staff_lastnamepy}}</div>
						<div class="contents_small">
							{{#if client_postcode1}}
							<div>〒&nbsp;{{client_postcode1}}-{{client_postcode2}}&nbsp;{{address}}
							</div>
							{{/if}}
							{{#if namecard_email}}
							<span class="namecard-icon icon-mail"></span>&nbsp;Mail：
							<a href="mailto:{{namecard_email}}" target="_self" class="namecard_url_href">{{namecard_email}}</a>
							{{/if}}
							{{#if namecard_url}}
							<div>
								<span class="namecard-icon icon-connect"></span>&nbsp;URL：
								<a href="{{namecard_url}}" target="_blank" class="namecard_url_href">{{namecard_url}}</a>
							</div>
							{{/if}}
							{{#if tel}}
							<div>
								<span class="namecard-icon icon-call"></span>&nbsp;電話番号：{{tel}}
							</div>
							{{/if}}
							{{#if cell}}
							<div>
								<span class="namecard-icon icon-call"></span>&nbsp;携帯番号：{{cell}}
							</div>
							{{/if}}
							{{#if meetin_number}}
							<div>
								<span class="namecard-icon icon-meet-in"></span>&nbsp;meet in番号：{{meetin_number}}
							</div>
							{{/if}}
							{{#if fax}}
							<div>
								<span class="namecard-icon icon-report"></span>&nbsp;FAX：{{fax}}
							</div>
							{{/if}}
						</div>
					</div>
				</div>
			</div>
			{{/if}}
			{{#if namecard_cate2_public_flg}}
			<div class="feature-item" id="feature-item-2">
				<div class="mi_namecard_detail_header">{{cate2_title}}</div>
				<div class="mi_namecard_detail_content" id="namecard_table">
					<table class="namecard-table">
						<tbody>
						<tr class="namecard-table-tr">
							<th class="namecard-table-th"><p>{{namecard_free1_name}}</p></th>
							<td>&nbsp;{{namecard_free1_val}}</td>
						</tr>
						<tr class="namecard-table-tr">
							<th class="namecard-table-th"><p>{{namecard_free2_name}}</p></th>
							<td>&nbsp;{{namecard_free2_val}}</td>
						</tr>
						<tr class="namecard-table-tr">
							<th class="namecard-table-th"><p>{{namecard_free3_name}}</p></th>
							<td>&nbsp;{{namecard_free3_val}}</td>
						</tr>
						<tr class="namecard-table-tr">
							<th class="namecard-table-th"><p>{{namecard_free4_name}}</p></th>
							<td>&nbsp;{{namecard_free4_val}}</td>
						</tr>
						<tr class="namecard-table-tr">
							<th class="namecard-table-th"><p>{{namecard_free5_name}}</p></th>
							<td>&nbsp;{{namecard_free5_val}}</td>
						</tr>
						</tbody>
					</table>
				</div>
			</div>
			{{/if}}
			{{#if namecard_cate3_public_flg}}
			<div class="feature-item" id="feature-item-3">
				<div class="mi_namecard_detail_header">{{cate3_title}}</div>
				<div class="mi_namecard_detail_content">
					<div class="center">
						<span class="namecard-photo-contain-preview" alt="写真１" style="background-image: url('{{namecard_photo1_url}}');"></span>
						<div class="namecard-photo-text">{{namecard_photo1_desc}}</div>
					</div>
					<div class="center_br"></div>
					<div class="center">
						<span class="namecard-photo-contain-preview" alt="写真２" style="background-image: url('{{namecard_photo2_url}}');"></span>
						<div class="namecard-photo-text">{{namecard_photo2_desc}}</div>
					</div>
				</div>
			</div>
			{{/if}}
			{{#if namecard_cate4_public_flg}}
			<div class="feature-item" id="feature-item-4">
				<div class="mi_namecard_detail_header">{{cate4_title}}</div>
				<div class="mi_namecard_detail_content">
					<div>{{namecard_introduction}}</div>
				</div>
			</div>
			{{/if}}
		</div>
		<div class="mi_close_icon modal-close">
			<span class="icon-close"  id="namecard_close"></span>
		</div>
	</div>
{{/if}}


{{#if contents_flg}}
<div class="namecard_contents_none">
	名刺情報がありません
</div>
<div class="mi_close_icon modal-close">
	<span class="icon-close name_card_close" id="namecard_close"></span>
</div>
{{/if}}

</script>

<script id="password-modal-template" type="text/x-handlebars-template">
	<!-- モーダルタイトル start -->
	<div class="mi_content_title">
		<h2>パスワード変更</h2>
	</div>
	<!-- モーダルタイトル end -->
<div class="list-area hgt3">
	<table class="listtable">
		<tbody>
			<tr>
				<th>現在パスワード</th>
				<td>
					<input type="password" class="f_password" name="staff_password_old" id="staff_password_old" value="" /><br>
					<span class="errmsg mb10" id="alert_old_pass"></span>
				</td>
			</tr>
			<tr>
				<th>新しいパスワード</th>
				<td>
					<input type="password" class="f_password" name="staff_password_new" id="staff_password_new" value="" /><br>
					<span class="errmsg mb10" id="alert_new_pass"></span>
					<br>
					<span class="note">※確認のため新しいパスワードをもう一度入力してください<br>※８文字半角英数字</span></p>
					<input type="password" class="f_password" name="staff_password_new2" id="staff_password_new2" value="" />
				</td>
			</tr>
		</tbody>
	</table>
</div>

<div class="mi_tabel_btn_area">
  <button type="button" id="cancel" class="mi_cancel_btn mi_btn_m hvr-fade">キャンセル</button>
  <button type="button" id="update" class="mi_default_button mi_btn_m hvr-fade">更新</button>
</div>

<div class="mi_close_icon modal-close">
	<span class="icon-close"  id="namecard_close"></span>
</div>
</script>

{/literal}

{include file="./common/footer.tpl"}