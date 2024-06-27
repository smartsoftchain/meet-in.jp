/*
 * 名刺に関するJS群
 * 
 * */

/**
 * 名刺関連のレシーバー関数
 * @param json
 * @returns
 */
function receiveNameCardJson(json){
	if(json.type == "SHOW_NAME_CARD"){
		// 名刺を表示依頼を受けて名刺を表示するための処理
		showNameCard(json.staff_type, json.staff_id, json.client_id);
	}
	else if(json.type == "HIDE_NAME_CARD"){
		hideNameCard();
	}
}

/**
 * 名刺を非表示にする処理
 * @returns
 */
function hideNameCard(){
	$('#ShowNameCard_staff_type').val("");
	$('#ShowNameCard_client_id').val("");
	$('#ShowNameCard_staff_id').val("");
	// 名刺の非表示
	$('#modal-content-preview-namecard').hide();
	// オーバーレイの非表示
	$(".namecard_overlay").hide();
}

/**
 * SEND_TARGET_ALL受信データセット処理
 * SEND_TARGET_ALLコマンドで受信したデータをtarget_video_ダグへそれぞれ設定する
 * 
 * 対象タグ ( ?部分は 0～5 までの値 )
 * <input type="hidden" id="target_video_staff_type_?" value=""/>
 * <input type="hidden" id="target_video_staff_id_?" value=""/>
 * <input type="hidden" id="target_video_client_id_?" value=""/>
 * @returns なし
 */

// 名刺ダイアログ表示
// var staff_type
// var staff_id
// var client_id
//
// 注意：名刺ダイアログのテンプレート(html)は、サーバ(PHP)側にて設定(negotiation-namecard.tpl)
function showNameCard(staff_type, staff_id, client_id) {
//console.log('showNameCard staff_type=('+staff_type+') staff_id=('+staff_id+') client_id=('+client_id+')');
	if(staff_type && staff_id && client_id){
		$('#ShowNameCard_staff_type').val(staff_type);
		$('#ShowNameCard_staff_id').val(staff_id);
		$('#ShowNameCard_client_id').val(client_id);
		// サーバーから名刺の情報を取得する
		$.ajax({
			url: "https://" + location.host + "/negotiation/get-staff-namecard",
			dataType: 'text',
			data: {
				staff_type: staff_type,
				staff_id: staff_id,
				client_id: client_id
			}
		}).done(function(res) {
			// jsonをオブジェクトに変換
			var res = JSON.parse(res);
			// レイアウトパターンを設定
			var wide_flg = parseInt(res.namecard_cate1_title_public_flg) + parseInt(res.namecard_cate2_title_public_flg) + parseInt(res.namecard_cate3_title_public_flg) + parseInt(res.namecard_cate4_title_public_flg);
			var narrow_flg = '';
			var contents_flg = '';
			//表示フラグがない場合、暫定で名刺情報なしと表示する
			if(!isFinite(wide_flg) || (wide_flg == 0)){
				contents_flg = 1;
				$('#namecard-area').css('width', '590px').css('height','340px');
			} else if(wide_flg !== 4){
				if(wide_flg == 1){
					$('#namecard-area').css('width', '590px').css('height','340px');
				}else{
					$('#namecard-area').css('width', '590px').css('height','590px');
				}
				wide_flg = '';
				narrow_flg = 1;
			}else{
				$('#namecard-area').css('width', '98%').css('height','98%');
				$('#mi_namecard_contents').css('height', 'auto');
			}
			// プロフィール写真の表示と存在チェック
			var staff_photo_url;
			if(res.picture_public_flg == 1){
				if(res.staffImgPath){
					staff_photo_url = res.staffImgPath;
				}else{
					staff_photo_url = '/img/no-image.png?';
				}
			}else{
				staff_photo_url = '/img/no-image.png?';
			}
			// 名刺データ
			var namecard_img_none;
			if(res.namecard_card_public_flg !== '1'){
				namecard_img_none = '1';
			}
			// 携帯番号
			var namecard_cell;
			if(res.namecard_cell_public_flg == 1){
				if(res.namecard_cell1 == "" && res.namecard_cell2 == "" && res.namecard_cell3 == ""){
					namecard_cell = "";
				}else{
					namecard_cell = res.namecard_cell1 + '-' + res.namecard_cell2 + '-' + res.namecard_cell3;
				}
			}
			//fax番号
			var namecard_fax;
			if(res.namecard_fax_public_flg == 1){
				if(res.namecard_fax1 == "" && res.namecard_fax2 == "" && res.namecard_fax3 == ""){
					namecard_fax = "";
				}else{
					namecard_fax = res.namecard_fax1 + '-' + res.namecard_fax2 + '-' + res.namecard_fax3;
				}
			}
			// 写真1の表示と存在チェック
			var namecard_photo1_url;
			if(res.namecard_photo1_public_flg == 1){
				if(res.namecardPhoto1ImgPath){
					namecard_photo1_url = res.namecardPhoto1ImgPath;
				}else{
					namecard_photo1_url = '/img/no_image.png';
				}
			}else{
				namecard_photo1_url = '/img/no_image.png';
			}
			// 写真2の表示と存在チェック
			var namecard_photo2_url;
			if(res.namecard_photo2_public_flg == 1){
				if(res.namecardPhoto2ImgPath){
					namecard_photo2_url = res.namecardPhoto2ImgPath;
				}else{
				namecard_photo2_url = '/img/no_image.png';
				}
			}else{
				namecard_photo2_url = '/img/no_image.png';
			}

			// 値を設定
			var values = {
				wide_flg: wide_flg,
				narrow_flg: narrow_flg,
				contents_flg: contents_flg,
				namecard_cate1_public_flg: (res.namecard_cate1_title_public_flg == 1) ? res.namecard_cate1_title_public_flg : '',
				namecard_cate1_public_flg: (res.namecard_cate1_title_public_flg == 1) ? res.namecard_cate1_title_public_flg : '',
				namecard_cate2_public_flg: (res.namecard_cate2_title_public_flg == 1) ? res.namecard_cate2_title_public_flg : '',
				namecard_cate3_public_flg: (res.namecard_cate3_title_public_flg == 1) ? res.namecard_cate3_title_public_flg : '',
				namecard_cate4_public_flg: (res.namecard_cate4_title_public_flg == 1) ? res.namecard_cate4_title_public_flg : '',
				namecard_cate1_title: (res.namecard_cate1_title !== '') ? res.namecard_cate1_title : 'カテゴリー１',
				namecard_cate2_title: (res.namecard_cate2_title !== '') ? res.namecard_cate2_title : 'カテゴリー２',
				namecard_cate3_title: (res.namecard_cate3_title !== '') ? res.namecard_cate3_title : 'カテゴリー３',
				namecard_cate4_title: (res.namecard_cate4_title !== '') ? res.namecard_cate4_title : 'カテゴリー４',
				// 写真
				namecard_picture_img: staff_photo_url,
				// 名刺データ
				namecard_img: (res.namecard_card_public_flg == 1) ? res.staffNamecardImgPath : '',
				namecard_img_none: namecard_img_none,
				// 名前(姓名)
				namecard_name: (res.namecard_public_flg == 1) ? res.staff_firstname + ' ' + res.staff_lastname : '',
				fb_url: (res.namecard_facebook_public_flg == 1) ? res.namecard_facebook : '',
				sns_url: (res.namecard_sns_public_flg == 1) ? res.namecard_sns : '',
				// 会社情報(会社名・部署・役職)
				client_name: (res.namecard_client_name_public_flg == 1) ? res.namecard_client_name : '',
				department: (res.namecard_department_public_flg == 1) ? res.namecard_department : '',
				executive: (res.namecard_executive_public_flg == 1) ? res.namecard_executive : '',
				// 名前(姓名)
				staff_firstname: (res.name_public_flg == 1) ? res.staff_firstname : '',
				staff_lastname: (res.name_public_flg == 1) ? res.staff_lastname : '',
				staff_firstnamepy: (res.name_public_flg == 1) ? res.staff_firstnamepy : '',
				staff_lastnamepy: (res.name_public_flg == 1) ? res.staff_lastnamepy : '',
				// 住所(郵便番号+住所)
				client_postcode1: (res.namecard_address_public_flg == 1) ? res.namecard_postcode1 : '',
				client_postcode2: (res.namecard_address_public_flg == 1) ? res.namecard_postcode2 : '',
				address: (res.namecard_address_public_flg == 1) ? res.namecard_address : '',
				room_name: (res.namecard_room_public_flg == 1) ? location.protocol + '//' + location.host + '/room/' + res.room_name : '',
				// 電話 携帯 FAX				
				tel: (res.namecard_tel_public_flg == 1) ? res.namecard_tel1 + '-' + res.namecard_tel2 + '-' + res.namecard_tel3 : '',
				cell: namecard_cell,
				fax: namecard_fax,
				// Mail
				namecard_email: (res.namecard_email_public_flg == 1) ? res.namecard_email : '',
				// URL
				namecard_url: (res.namecard_url_public_flg == 1) ? res.namecard_url : '',
				// フリー項目
				namecard_free1_name: (res.namecard_free1_public_flg == 1) ? res.namecard_free1_name : '',
				namecard_free1_val: (res.namecard_free1_public_flg == 1) ? res.namecard_free1_val : '',
				namecard_free2_name: (res.namecard_free2_public_flg == 1) ? res.namecard_free2_name : '',
				namecard_free2_val: (res.namecard_free2_public_flg == 1) ? res.namecard_free2_val : '',
				namecard_free3_name: (res.namecard_free3_public_flg == 1) ? res.namecard_free3_name : '',
				namecard_free3_val: (res.namecard_free3_public_flg == 1) ? res.namecard_free3_val : '',
				namecard_free4_name: (res.namecard_free4_public_flg == 1) ? res.namecard_free4_name : '',
				namecard_free4_val: (res.namecard_free4_public_flg == 1) ? res.namecard_free4_val : '',
				namecard_free5_name: (res.namecard_free5_public_flg == 1) ? res.namecard_free5_name : '',
				namecard_free5_val: (res.namecard_free5_public_flg == 1) ? res.namecard_free5_val : '',
				// 写真カテゴリ
				namecard_photo1_url: namecard_photo1_url,
				namecard_photo1_desc: (res.namecard_photo1_desc_public_flg == 1) ? res.namecard_photo1_desc : '',
				namecard_photo2_url: namecard_photo2_url,
				namecard_photo2_desc: (res.namecard_photo2_desc_public_flg == 1) ? res.namecard_photo2_desc : '',
				namecard_introduction: (res.namecard_introduction_public_flg == 1) ? res.namecard_introduction : '',

			};	// values_end

			// 名刺の情報を初期化する
			$("#modal-content-preview-namecard").show();
			// モーダル内のタグを削除する
			$("div.inner-wrap", "#modal-content-preview-namecard").empty();
			// テンプレート生成
			var template = Handlebars.compile($('#namecard-modal-template').html());
			$('div.inner-wrap', "#modal-content-preview-namecard").append(template(values));
			// モーダルを表示する為のクリックイベントを発生させる
			$('.modal-open').trigger("click");
			// オーバーレイの表示
			$(".namecard_overlay").show();

		});	// ajax.done_end
	} // if_end
}
