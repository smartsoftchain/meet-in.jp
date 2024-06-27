var TYPE_CONDITION_CITY     = "1";
var TYPE_CONDITION_CATEGORY = "2";
var TYPE_CONDITION_SERVICE  = "3";
var TYPE_CONDITION_LIST     = "4";

Handlebars.registerHelper('isChecked', function(checked_val, fixed_val){
	if (checked_val === fixed_val) {
        return ' checked';
    } else {
        return ''
    }
});

/********************************************************************
	担当者の単価設定ダイアログ
********************************************************************/
$(function() {
	
	// 初期表示時に担当者の一時単価を取得
	(function() {

		$.ajax({
			url: "/appointment-unit-cost/result-relation-staff-with-cost",
			type: "GET",
			dataType: 'json',
			success: function(services) {
				if (services !== "") {
					// 担当者の単価設定
					var template = Handlebars.compile($('#staff-tmp-cost-template').html());
					$.each(services, function() {
						$('table.staff_tmp_cost_content').append(template({
							"name"				: this.staff_name,
							"telephone_cost"	: this.telephone_call_price,
							"staff_type"		: this.staff_type,
							"staff_id"			: this.staff_id				
						}));
					});
				} else {
					alert("担当者（登録者）が取得できませんでした");
				}
			}
		});

	})();

	// 「選択する」を押下。サーバーから現在選択している地域情報を確定し取得する
	$(document).on("click", "#staff-tmp-cost .decision", function() {

		var costs = [];
		var error = false;

		var id_list = $(".staff_tmp_cost_content .staff_id").each(function(){
			var staff_id = $(this).val();
			try {
				var staff_price = parseInt($(this).next().val());
				if(isNaN(staff_price)) {
					alert("単価は数値を入力してください。");
					error = true;
					return;
				}
				if(staff_price < 0 || 2147483647 < staff_price) {
					alert("2147483647以内で入力してください。");
					error = true;
					return;
				}
			} catch(e) {
				alert("単価は数値を入力してください。");
				error = true;
				return;
			}
			//alert(staff_id + " " + staff_price);
			costs.push({"staff_id" : staff_id, "staff_price" : staff_price});
		});

		if(error == true) return;
		//var str = JSON.stringify(costs);
		//alert(str);

		$.ajax({
			url: "/appointment-unit-cost/save-tmp-cost",
			type: "POST",
			data: {"costs": costs},
			//dataType: 'json',
			success: function(result) {
				$("#select-location").text(result);
				$(".modal-close").trigger("click");
			}
		});
	});

	// 検索ボタンを押されたタイミングで検索をかけに行く
	$('#search-staff-tmp-cost').on("click", function() {
		var name = $(this).prev("#keyword-s").val();
		var reg = new RegExp(name);
		$("tr.staff-cost-row").css("display", "none");
		$("tr.staff-cost-row").each(function (i) {
			if($(this).text().match(reg)){
				$(this).toggle();
			}
		});
	});


	// 	// 検索ボタンを押されたタイミングで検索をかけに行く
	// $('#search-staff-keyword').on("click", function() {
	// 	var name = $(this).prev("#keyword-s").val();
	// 	var reg = new RegExp(name);
	// 	$("li.staff-row").css("display", "none");
	// 	$("li.staff-row").each(function (i) {
	// 		if($(this).text().match(reg)){
	// 			$(this).toggle();
	// 		}
	// 	});
	// });

});



/*****************************************************************************
*
* 【地域】の選択
* 
*****************************************************************************/
$(function() {

	/* アコーディオン MENU */
	$(function(){
		$(".region .pulmenu dd").css("display","none");
		$(".region .pulmenu dt").click(function(){
			if($("+dd",this).css("display")=="none"){
				$(".pulmenu dd").slideUp( 50 );
				$("+dd",this).slideDown( 50 );
			}
		});
	});

	// 地域選択 TAB
	$(".region p.area").click(function() {
		$(".region .tab li").removeClass('select');
		$(".region #slct_msg").removeClass('disnon');
	});

	// 都道府県名をクリック
	$(".region .tab li").click(function() {
		$(".region .tab li").removeClass('select');
		$(this).addClass('select');

		var state_name = $(this).text();

		$.ajax({
			url: "/analysis/city",
			type: "POST",
			data: { state : state_name },
			dataType: 'json',
			success: function(cities) {

				if (cities !== "") {

					var template = Handlebars.compile($('#city-template').html());
					$('#city_content').empty().append(template({
						"type"   : TYPE_CONDITION_CITY,
						"state"  : state_name,
						"cities" : cities
					}));

				} else {
					alert("都市名が取得できませんでした");
				}
			}
		});

		$("#slct_msg").addClass('disnon');
	});

	// 全選択/全解除イベント
	$(document).on("click", ".check-city-all", function() {

		var $cities = $(this).closest(".tab_content").find(".citylist input[type='checkbox']");
		var current_check_state = $(this).prop("checked");

		var localCode = "";
		var check = "";
		var allFlg = "1";

		if (current_check_state) {
			$cities.prop("checked", true);
			check = "1";
		} else {
			$cities.prop("checked", false);
			check = "0";
		}

		requreSaveCitySession(localCode, check, allFlg);
	});

	// 市区町村の選択/非選択の情報をサーバーへ送る
	$(document).on('change', "input.check-city", function() {

		var check     = $(this).prop("checked") ? "1" : "0";
		var localCode = $(this).val();
		var allFlg    = "0";				// 全選択/全解除したイベントかどうかのフラグ

		requreSaveCitySession(localCode, check, allFlg);
	});

	// 市区町村の選択状況をサーバセッションに保存するリクエストを行う。
	function requreSaveCitySession(localCode, check, allFlg) {

		$.ajax({
			url: "/analysis/save-city",
			type: "POST",
			data: {
				"local_code" : localCode,
				"check"      : check,
				"allFlg"     : allFlg
			},
			dataType: 'json',
			success: function(result) {

				if(result != "" && result != null){
					alert(result);
				}
			}
		});
	}

	// 「選択する」を押下。サーバーから現在選択している地域情報を確定し取得する
	$(document).on("click", ".cities .decision", function() {

		var type = $(this).data("type");	// タイプを取得

		$.ajax({
			url: "/analysis/decision-condition",
			type: "POST",
			data: { "type" : type },
			dataType: 'json',
			success: function(result) {
				$("#select-location").text(result);
				$(".modal-close").trigger("click");
			}
		});
	});
});


/*****************************************************************************
*
* 【業種１・業種２・業種３】の選択
* 
*****************************************************************************/

$(function() {

	// 業種１を取得し、画面にセットする。
	(function() {

		$.ajax({
			url: "/analysis/category1",
			type: "GET",
			dataType: 'json',
			success: function(category1) {

				if (category1 !== "") {

					var template = Handlebars.compile($('#category1-row-template').html());

					$.each(category1, function() {

						$('#category1_menu_link').append(template({
							"id"   : this.id,
							"name" : this.name
						}));
					});

				} else {
					alert("業種１が取得できませんでした");
				}
			}
		});

	})();


	/* アコーディオン MENU */
	$(function(){
		$(".popup-left-menu .pulmenu dd").css("display","none");
		$(document).on("click", ".popup-left-menu .pulmenu dt", function(){
			if($("+dd",this).css("display")=="none"){
				$(".popup-left-menu .pulmenu dd").slideUp( 50 );
				$("+dd",this).slideDown( 50 );
			}
		});
	});

	// 業種１を選択（共通）
	$(document).on("click", ".popup-left-menu p.menu-link", function() {
		$(".popup-left-menu .tab li").removeClass('select');
		$(".popup-right-content .slct_msg").removeClass('disnon');
	});

	// 業種１を選択
	$(document).on("click", "#category1_menu_link .menu-link", function() {

		var business_category1_id = $(this).data("businessCategory1Id");
		var $append_point = $(this).closest("dt").next("dd");

		$.ajax({
			url: "/analysis/category2",
			type: "POST",
			data: { "business_category1_id" : business_category1_id },
			dataType: 'json',
			success: function(result) {

				if (result !== "") {

					var template = Handlebars.compile($('#category2-row-template').html());

					$append_point.empty().append(template({
						"category2" : result.category2
					})).slideDown( 50 );;

				} else {
					alert("業種２が取得できませんでした");
				}
			}
		});
	});

	// 業種２を選択
	$(document).on("click", ".category .tab li", function() {

		var category2_name = $(this).text();

		$(".category .tab li").removeClass('select');
		$(this).addClass('select');
		$(".popup-right-content .slct_msg").addClass('disnon');

		var business_category1_id = $(this).data("category1Id");
		var business_category2_id = $(this).data("id");

		$.ajax({
			url: "/analysis/category3",
			type: "POST",
			data: {
				"business_category1_id" : business_category1_id,
				"business_category2_id" : business_category2_id
			},
			dataType: 'json',
			success: function(result) {

				if (result !== "") {

 					var template = Handlebars.compile($('#category3-content-template').html());

					$('#category3_content').empty().append(template({
						"type"                          : TYPE_CONDITION_CATEGORY,		// 「選択」ボタン押下時のタイプ
						"category2_name"                : category2_name,
						"is_checked_only_category1"     : result.is_checked_category1,
						"is_checked_only_category2"     : result.is_checked_category2,
						"current_business_category1_id" : business_category1_id,
						"current_business_category2_id" : business_category2_id,
						"category3"                     : result.category3
					}));

				} else {
					alert("業種３が取得できませんでした");
				}
			}
		});

		$(".slct_msg").addClass('disnon');
	});

	// 「業種１のみを選択する」のチェック情報をサーバーへ送る
	$(document).on('change', '.only-category1', function(){

		var check = ($(this).prop("checked") ? "1" : "0");
		var business_category1_id = $(this).val();

		// チェックされた状態の場合は他のチェックを外す。
		if (check === "1") {
			$(".only-category2").prop("checked", false);
			$(".check-category3-all").prop("checked", false);
			$(".businesslist input[type='checkbox']").prop("checked", false);
		}

		$.ajax({
			url: "/analysis/save-category1",
			type: "POST",
			data: {
				"business_category1_id" : business_category1_id,
				"check"                 : check
			},
			dataType: 'json',
			success: function(result) {

				if(result != "" && result != null){
					alert(result);
				}
			}
		});
	});

	// 「業種２のみを選択する」のチェック情報をサーバーへ送る
	$(document).on('change', '.only-category2', function(){

		var check = ($(this).prop("checked") ? "1" : "0");
		var business_category1_id = $(this).data("category1Id");
		var business_category2_id = $(this).val();

		// チェックされた状態の場合は他のチェックを外す。
		if (check === "1") {
			$(".only-category1").prop("checked", false);
			$(".check-category3-all").prop("checked", false);
			$(".businesslist input[type='checkbox']").prop("checked", false);
		}

		$.ajax({
			url: "/analysis/save-category2",
			type: "POST",
			data: {
				"business_category1_id" : business_category1_id,
				"business_category2_id" : business_category2_id,
				"check"                 : check
			},
			dataType: 'json',
			success: function(result) {

				if(result != "" && result != null){
					alert(result);
				}
			}
		});
	});

	// 業種３の「全選択/全解除」イベント
	$(document).on("click", ".check-category3-all", function() {

		var $categories3 = $(this).closest(".tab_content").find(".businesslist input[type='checkbox']");
		var current_check_state = $(this).prop("checked");

		var category1_id = $(this).data("category1Id");
		var category2_id = $(this).data("category2Id");
		var category3_id = "";
		var check        = "";
		var allFlg       = "1";

		if (current_check_state) {
			$categories3.prop("checked", true);
			check = "1";

			// チェックされた状態の場合は他のチェックを外す。
			$(".only-category1").prop("checked", false);
			$(".only-category2").prop("checked", false);

		} else {
			$categories3.prop("checked", false);
			check = "0";
		}

		requreSaveCategory3Session(category1_id, category2_id, category3_id, check, allFlg);
	});

	// 業種３の選択/非選択の情報をサーバーへ送る
	$(document).on('change', "input.check-category3", function() {

		var check        = $(this).prop("checked") ? "1" : "0";
		var category1_id = $(this).data("category1Id");
		var category2_id = $(this).data("category2Id");
		var category3_id = $(this).val();
		var allFlg       = "0";				// 全選択/全解除したイベントかどうかのフラグ


		// チェックされた状態の場合は他のチェックを外す。
		if (check === "1") {
			$(".only-category1").prop("checked", false);
			$(".only-category2").prop("checked", false);
		}

		requreSaveCategory3Session(category1_id, category2_id, category3_id, check, allFlg);
	});

	// 業種３の選択状況をサーバセッションに保存するリクエストを行う。
	function requreSaveCategory3Session(category1_id, category2_id, category3_id, check, allFlg) {

		$.ajax({
			url: "/analysis/save-category3",
			type: "POST",
			data: {
				"category1_id" : category1_id,
				"category2_id" : category2_id,
				"id"           : category3_id,
				"check"        : check,
				"allFlg"       : allFlg
			},
			dataType: 'json',
			success: function(result) {

				if(result != "" && result != null){
					alert(result);
				}
			}
		});
	}

	// 「選択する」を押下。サーバーから現在選択しているカテゴリを確定し取得する
	$(document).on("click", ".category .decision", function() {

		var type = $(this).data("type");	// タイプを取得

		$.ajax({
			url: "/analysis/decision-condition",
			type: "POST",
			data: { "type" : type },
			dataType: 'json',
			success: function(result) {
				$("#selected-category").text(result);
				$(".modal-close").trigger("click");
			}
		});
	});
});

/*****************************************************************************
*
* 【サービス】の選択
* 
*****************************************************************************/

$(function() {
	
	// 初期表示時にサービスを取得し、画面にセットする。
	(function() {

		$.ajax({
			url: "/analysis/service",
			type: "GET",
			dataType: 'json',
			success: function(services) {

				if (services !== "") {

					var template = Handlebars.compile($('#service-row-template').html());

					$.each(services, function() {

						$('ul.service_content').append(template({
							"id" : this.id,
							"name" : this.name,
							"checked" : this.checked,
						}));
					});

				} else {
					alert("サービス/商品名が取得できませんでした");
				}
			}
		});

	})();
	
	// 選択/非選択の情報をサーバーへ送る
	$(document).on('change', ".check_service", function() {
		
		var check		= ($(this).prop("checked") ? "1" : "0");
		var serviceId	= $(this).attr("id");
		var allFlg		= "0";
		
		$.ajax({
			url: "/analysis/save-service",
			type: "POST",
			data: {
				"service_id"	: serviceId,
				"check"			: check,
				"allFlg"		: allFlg
			},
			dataType: 'json',
			success: function(result) {
				
				if(result != "" && result != null){
					alert(result);
				}
			}
		});
	});
	
	// サービス/商品名の「全選択/全解除」イベント
	$(document).on("click", ".check-service-all", function() {

		var $services = $(this).closest(".inner-wrap").find(".service_content  input[type='checkbox']");
		var current_check_state = $(this).prop("checked");
		var check  = (current_check_state ? "1" : "0");
		var allFlg = "1";

		if (current_check_state) {
			$services.prop("checked", true);
		} else {
			$services.prop("checked", false);
		}
		
		$.ajax({
			url: "/analysis/save-service",
			type: "POST",
			data: {
				"service_id"	: "",
				"check"			: check,
				"allFlg"		 : allFlg
			},
			dataType: 'json',
			success: function(result) {
				if(result != "" && result != null){
					alert(result);
				}
			}
		});
	});
	
	// 「選択する」を押下。サーバーから現在選択しているカテゴリを確定し取得する
	$(document).on("click", "#select-service .decision", function() {

		var type = $(this).data("type");	// タイプを取得

		$.ajax({
			url: "/analysis/decision-condition",
			type: "POST",
			data: { "type" : type },
			dataType: 'json',
			success: function(result) {
				$("#selected-service").text(result);
				$(".modal-close").trigger("click");
			}
		});
	});
	
	
	// 検索ボタンを押されたタイミングで検索をかけに行く
	$('#search-service-keyword').on("click", function() {
		
		var name = $(this).prev("#keyword-s").val();
		var reg = new RegExp(name);
		
		$("li.service-row").css("display", "none");
		$("li.service-row").each(function (i) {

			if($(this).text().match(reg)){
				$(this).toggle();
			}
		});
	});
	
	// 検索文字列が変わったタイミングで検索をかけに行く
	$('#select-service #keyword-s').on("keydown", function() {
		
		var name = $(this).val();
		var reg  = new RegExp(name);
		
		$("li.service-row").css("display", "none");
		$("li.service-row").each(function (i) {

			if($(this).text().match(reg)){
				$(this).toggle();
			}
		});
	});	
});


/*****************************************************************************
 *
 * 【アプローチリスト】の選択
 * 
 *****************************************************************************/

$(function() {
	
	// 初期表示時にアプローチリストを取得し、画面にセットする。
	(function() {

		$.ajax({
			url: "/analysis/approach-list",
			type: "GET",
			dataType: 'json',
			success: function(approachlist) {
				if (approachlist !== "") {
					var template = Handlebars.compile($('#approachlist-row-template').html());
					var count = 0;
					$.each(approachlist, function() {
						$('ul.approachlist_content').append(template({
							"id" : this.id,
							"name" : this.name,
							"checked" : this.checked,
							"style" : getLiStyle(count)
						}));
						count++;
					});
				} else {
					alert("アプローチリストが取得できませんでした");
				}
			}
		});
	})();
	
	// 選択/非選択の情報をサーバーへ送る
	$(document).on('change', ".check_approachlist", function() {
		var check = ($(this).prop("checked") ? "1" : "0");
		var approachlistId = $(this).attr("id");
		var allFlg = "0";
		
		$.ajax({
			url: "/analysis/save-approachlist",
			type: "POST",
			data: {
				"approachlist_id"	: approachlistId,
				"check"				: check,
				"allFlg"			: allFlg
			},
			dataType: 'json',
			success: function(result) {
				
				if(result != "" && result != null){
					alert(result);
				}
			}
		});
	});
	
	// アプローチリストの「全選択/全解除」イベント
	$(document).on("click", ".check-approachlist-all", function() {

		var $approachlists = $(this).closest(".inner-wrap").find(".approachlist_content  input[type='checkbox']");
		var current_check_state = $(this).prop("checked");
		var check  = (current_check_state ? "1" : "0");
		var allFlg = "1";

		if (current_check_state) {
			$approachlists.prop("checked", true);
		} else {
			$approachlists.prop("checked", false);
		}
		
		$.ajax({
			url: "/analysis/save-approachlist",
			type: "POST",
			data: {
				"approachlist_id" : "",
				"check"              : check,
				"allFlg"             : allFlg
			},
			dataType: 'json',
			success: function(result) {
				
				if(result != "" && result != null){
					alert(result);
				}
			}
		});
	});

	// 「選択する」を押下。サーバーから現在選択しているカテゴリを確定し取得する
	$(document).on("click", "#select-approachlist .decision", function() {

		var type = $(this).data("type");	// タイプを取得

		$.ajax({
			url: "/analysis/decision-condition",
			type: "POST",
			data: { "type" : type },
			dataType: 'json',
			success: function(result) {
				$(".modal-close").trigger("click");
			}
		});
	});
	
	
	// 検索ボタンを押されたタイミングで検索をかけに行く
	$('#search-approachlist-keyword').on("click", function() {
		
		var name = $(this).prev("#keyword-s").val();
		var reg = new RegExp(name);
		
		$("li.approachlist-row").css("display", "none");
		$("li.approachlist-row").each(function (i) {

			if($(this).text().match(reg)){
				$(this).toggle();
			}
		});
	});
	
	// 検索文字列が変わったタイミングで検索をかけに行く
	$('#select-approachlist #keyword-s').on("keydown", function() {
		
		var name = $(this).val();
		var reg  = new RegExp(name);
		
		$("li.service-row").css("display", "none");
		$("li.service-row").each(function (i) {

			if($(this).text().match(reg)){
				$(this).toggle();
			}
		});
	});	
	
});


function getLiStyle(count){
	var style = "margin-bottom:10px;";
	if(count < 2){
		if((count%3) == 0){
			style = "margin-bottom: 10px;clear:both;";
		}
	}else{
		var style = "margin-bottom:10px;padding-top:12px;";
		if((count%3) == 0){
			style = "margin-bottom: 10px;padding-top:12px;clear:both;";
		}
	}
	return style;
}










/*モーダル内のデザイン調整*/
$(document).on('click', '.analysis_condition_link', function(e) {
	
	var id    = $(this).data("target");
	var $elem = $("#" + id);
	
	var disp = $elem.css('display');
	if (disp=='none') {
		$elem.fadeIn('fast');
		
		// 高さを同じにする。「３列」で同じ高さの項目にする
		$(".modal_content_li li").autoHeight({column:3,clear:1,height:"height"});
	}

	var $parent = $(".modal_content_li");
	var list_count = $("li", $parent).length;
	
	for (var i=1; i<(list_count+1); i++) {
		
		if (3 < i) {
			$("li:nth-child(" + i + ")", $parent).css({
				"margin-top"     : "12px",
				"padding-top"    : "12px",
				"padding-bottom" : "12px"
			});
		} else {
			$("li:nth-child(" + i + ")", $parent).css({
				"padding-bottom" : "12px"
			});
		}
	}
});

/*****************************************************************************
*
* 【台本】の選択
* 
*****************************************************************************/

$(function() {
	
	// 初期表示時に台本を取得し、画面にセットする。
	(function() {
		$.ajax({
			url: "/analysis/script",
			type: "GET",
			dataType: 'json',
			success: function(services) {
				if (services !== "") {
					var template = Handlebars.compile($('#script-row-template').html());
					var count = 0;
					$.each(services, function() {
						$('ul.script_content').append(template({
							"id" : this.id,
							"name" : this.name,
							"checked" : this.checked,
							"style" : getLiStyle(count)
						}));
						count++;
					});
				} else {
					alert("台本名が取得できませんでした");
				}
			}
		});
	})();
	
	// 選択/非選択の情報をサーバーへ送る
	$(document).on('change', ".check_script", function() {
		
		var check       = ($(this).prop("checked") ? "1" : "0");
		var talkBindId  = $(this).attr("id");
		var allFlg      = "0";
		
		$.ajax({
			url: "/analysis/save-script",
			type: "POST",
			data: {
				"talk_bind_id" : talkBindId,
				"check"        : check,
				"allFlg"       : allFlg
			},
			dataType: 'json',
			success: function(result) {
				if(result != "" && result != null){
					alert(result);
				}
			}
		});
	});
	
	//「全選択/全解除」イベント
	$(document).on("click", ".check-script-all", function() {
		var $scripts = $(this).closest(".inner-wrap").find(".script_content  input[type='checkbox']");
		var current_check_state = $(this).prop("checked");
		var check  = (current_check_state ? "1" : "0");
		var allFlg = "1";
		if (current_check_state) {
			$scripts.prop("checked", true);
		} else {
			$scripts.prop("checked", false);
		}
		$.ajax({
			url: "/analysis/save-script",
			type: "POST",
			data: {
				"talk_bind_id"	: "",
				"check"			: check,
				"allFlg"		: allFlg
			},
			dataType: 'json',
			success: function(result) {
				if(result != "" && result != null){
					alert(result);
				}
			}
		});
	});
	
	// 「選択する」を押下。サーバーから現在選択している台本を確定し取得する
	$(document).on("click", "#select-script .decision", function() {
		var type = $(this).data("type");	// タイプを取得
		$.ajax({
			url: "/analysis/decision-condition",
			type: "POST",
			data: { "type" : type },
			dataType: 'json',
			success: function(result) {
				$(".modal-close").trigger("click");
			}
		});
	});
	
	
	// 検索ボタンを押されたタイミングで検索をかけに行く
	$('#search-script-keyword').on("click", function() {
		var name = $(this).prev("#keyword-s").val();
		var reg = new RegExp(name);
		$("li.script-row").css("display", "none");
		$("li.script-row").each(function (i) {
			if($(this).text().match(reg)){
				$(this).toggle();
			}
		});
	});
});


/*****************************************************************************
*
* 【DMテンプレート】の選択
* 
*****************************************************************************/

$(function() {
	
	// 初期表示時にDMテンプレートを取得し、画面にセットする。
	(function() {

		// TODO 初期処理が必要な用であれば取得。クリックしたときに取得してもよいか（？）
		$.ajax({
			url: "/analysis/mail-template",
			type: "GET",
			dataType: 'json',
			success: function(mailTemplateList) {
				if (mailTemplateList !== "") {
					var template = Handlebars.compile($('#mail-template-row-template').html());
					var count = 0;
					$.each(mailTemplateList, function() {
						$('ul.mail-template_content').append(template({
							"id" : this.id,
							"name" : this.name,
							"checked" : this.checked,
							"style" : getLiStyle(count)
						}));
						count++;
					});
				} else {
					alert("DMテンプレートが取得できませんでした");
				}
			}
		});

	})();
	
	// 選択/非選択の情報をサーバーへ送る
	$(document).on('change', ".check_mail_template", function() {
		
		var check				= ($(this).prop("checked") ? "1" : "0");
		var mailTemplateId		= $(this).attr("id");
		var allFlg				= "0";
		
		$.ajax({
			url: "/analysis/save-mail-template",
			type: "POST",
			data: {
				"mail_template_id"	: mailTemplateId,
				"check"				: check,
				"allFlg"			: allFlg
			},
			dataType: 'json',
			success: function(result) {
				
				if(result != "" && result != null){
					alert(result);
				}
			}
		});
	});
	
	// 「全選択/全解除」イベント
	$(document).on("click", ".check-mail-template-all", function() {

		var $mailTemplates = $(this).closest(".inner-wrap").find(".mail-template_content  input[type='checkbox']");
		var current_check_state = $(this).prop("checked");
		var check  = (current_check_state ? "1" : "0");
		var allFlg = "1";

		if (current_check_state) {
			$mailTemplates.prop("checked", true);
		} else {
			$mailTemplates.prop("checked", false);
		}
		
		$.ajax({
			url: "/analysis/save-mail-template",
			type: "POST",
			data: {
				"mail_template_id"  : "",
				"check"               : check,
				"allFlg"              : allFlg
			},
			dataType: 'json',
			success: function(result) {
				
				if(result != "" && result != null){
					alert(result);
				}
			}
		});
	});
	
	// 「選択する」を押下。サーバーから現在選択している台本を確定し取得する
	$(document).on("click", "#select-mail-template .decision", function() {

		var type = $(this).data("type");	// タイプを取得

		$.ajax({
			url: "/analysis/decision-condition",
			type: "POST",
			data: { "type" : type },
			dataType: 'json',
			success: function(result) {
				
				// TODO 選択ボタン押して成功した時の処理
				//$("#selected-mail-template").text(result);
				
				$(".modal-close").trigger("click");
			}
		});
	});
	
	
	// 検索ボタンを押されたタイミングで検索をかけに行く
	$('#search-mail-template-keyword').on("click", function() {
		
		var name = $(this).prev("#keyword-s").val();
		var reg = new RegExp(name);
		
		$("li.mail-template-row").css("display", "none");
		$("li.mail-template-row").each(function (i) {

			if($(this).text().match(reg)){
				$(this).toggle();
			}
		});
	});
});


/*****************************************************************************
*
* 【担当者（登録者）】の選択
* 
*****************************************************************************/

$(function() {
	
	// 初期表示時に担当者（登録者）を取得し、画面にセットする。
	(function() {

		// TODO 初期処理が必要な用であれば取得。クリックしたときに取得してもよいか（？）
		$.ajax({
			url: "/analysis/regist-staff",
			type: "GET",
			dataType: 'json',
			success: function(services) {
				if (services !== "") {
					var template = Handlebars.compile($('#staff-row-template').html());
					var count = 0;
					$.each(services, function() {
						$('ul.staff_content').append(template({
							"staff_key"	: this.staff_key,
							"name"		: this.name,
							"checked"	: this.checked,
							"style" : getLiStyle(count)
						}));
						count++;
					});

					// // 担当者の単価設定
					// var template = Handlebars.compile($('#staff-tmp-cost-template').html());
					// $.each(services, function() {
					// 	$('table.staff_tmp_cost_content').append(template({
					// 		"name"		: this.name,							
					// 	}));
					// });
				} else {
					alert("担当者（登録者）が取得できませんでした");
				}
			}
		});

	})();
	
	// 選択/非選択の情報をサーバーへ送る
	$(document).on('change', ".check_staff", function() {
		var check      = ($(this).prop("checked") ? "1" : "0");
		var staffKey  = $(this).attr("id");
		var allFlg     = "0";
		$.ajax({
			url: "/analysis/save-regist-staff",
			type: "POST",
			data: {
				"staff_key" : staffKey,
				"check"      : check,
				"allFlg"     : allFlg
			},
			dataType: 'json',
			success: function(result) {
				if(result != "" && result != null){
					alert(result);
				}
			}
		});
	});
	
	// 「全選択/全解除」イベント
	$(document).on("click", ".check-staff-all", function() {

		var $staffs = $(this).closest(".inner-wrap").find(".staff_content  input[type='checkbox']");
		var current_check_state = $(this).prop("checked");
		var check  = (current_check_state ? "1" : "0");
		var allFlg = "1";

		if (current_check_state) {
			$staffs.prop("checked", true);
		} else {
			$staffs.prop("checked", false);
		}
		
		$.ajax({
			url: "/analysis/save-staff",
			type: "POST",
			data: {
				"staff_key"  : "",
				"check"       : check,
				"allFlg"      : allFlg
			},
			dataType: 'json',
			success: function(result) {
				if(result != "" && result != null){
					alert(result);
				}
			}
		});
	});
	
	// 「選択する」を押下。サーバーから現在選択している台本を確定し取得する
	$(document).on("click", "#select-staff .decision", function() {
		var type = $(this).data("type");	// タイプを取得
		$.ajax({
			url: "/analysis/decision-condition",
			type: "POST",
			data: { "type" : type },
			dataType: 'json',
			success: function(result) {
				$(".modal-close").trigger("click");
			}
		});
	});
	
	
	// 検索ボタンを押されたタイミングで検索をかけに行く
	$('#search-staff-keyword').on("click", function() {
		var name = $(this).prev("#keyword-s").val();
		var reg = new RegExp(name);
		$("li.staff-row").css("display", "none");
		$("li.staff-row").each(function (i) {
			if($(this).text().match(reg)){
				$(this).toggle();
			}
		});
	});
});

/*****************************************************************************
*
* 【呼出部署（拠点）】の選択
* 
*****************************************************************************/

$(function() {
	
	// 初期表示時に呼出部署（拠点）を取得し、画面にセットする。
	(function() {
		// TODO 初期処理が必要な用であれば取得。クリックしたときに取得してもよいか（？）
		$.ajax({
			url: "/analysis/call-division",
			type: "GET",
			dataType: 'json',
			success: function(callDivision) {
				if (callDivision !== "") {
					var template = Handlebars.compile($('#call-division-row-template').html());
					var count = 0;
					$.each(callDivision, function() {
						$('ul.call-division_content').append(template({
							"name" : this.name,
							"checked" : this.checked,
							"style" : getLiStyle(count)
						}));
						count++;
					});
				} else {
					alert("呼出部署が取得できませんでした");
				}
			}
		});
	})();
	
	// 選択/非選択の情報をサーバーへ送る
	$(document).on('change', ".check_call_division", function() {
		
		var check             = ($(this).prop("checked") ? "1" : "0");
		var callDivisionName  = $(this).val();
		var allFlg            = "0";
		
		$.ajax({
			url: "/analysis/save-call-division",
			type: "POST",
			data: {
				"call_division_name" : callDivisionName,
				"check"              : check,
				"allFlg"             : allFlg
			},
			dataType: 'json',
			success: function(result) {
				
				if(result != "" && result != null){
					alert(result);
				}
			}
		});
	});
	
	// 「全選択/全解除」イベント
	$(document).on("click", ".check-call-division-all", function() {
		var $callDivisions = $(this).closest(".inner-wrap").find(".call-division_content  input[type='checkbox']");
		var current_check_state = $(this).prop("checked");
		var check  = (current_check_state ? "1" : "0");
		var allFlg = "1";
		if (current_check_state) {
			$callDivisions.prop("checked", true);
		} else {
			$callDivisions.prop("checked", false);
		}
		
		$.ajax({
			url: "/analysis/save-call-division",
			type: "POST",
			data: {
				"call_division_name" : "",
				"check"              : check,
				"allFlg"             : allFlg
			},
			dataType: 'json',
			success: function(result) {
				
				if(result != "" && result != null){
					alert(result);
				}
			}
		});
	});
	
	// 「選択する」を押下。サーバーから現在選択している台本を確定し取得する
	$(document).on("click", "#select-call-division .decision", function() {
		var type = $(this).data("type");	// タイプを取得
		$.ajax({
			url: "/analysis/decision-condition",
			type: "POST",
			data: { "type" : type },
			dataType: 'json',
			success: function(result) {
				$(".modal-close").trigger("click");
			}
		});
	});
	
	// 検索ボタンを押されたタイミングで検索をかけに行く
	$('#search-call-division-keyword').on("click", function() {
		var name = $(this).prev("#keyword-s").val();
		var reg = new RegExp(name);
		$("li.call-division-row").css("display", "none");
		$("li.call-division-row").each(function (i) {
			if($(this).text().match(reg)){
				$(this).toggle();
			}
		});
	});
});


/*****************************************************************************
*
* 【上場区分】の選択
* 
*****************************************************************************/

$(function() {
	
	// 初期表示時に上場区分を取得し、画面にセットする。
	(function() {

		// TODO 初期処理が必要な用であれば取得。クリックしたときに取得してもよいか（？）
		$.ajax({
			url: "/analysis/listing",
			type: "GET",
			dataType: 'json',
			success: function(services) {
				if (services !== "") {
					var template = Handlebars.compile($('#listing-row-template').html());
					var count = 0;
					$.each(services, function() {
						$('ul.listing_content').append(template({
							"name" : this.name,
							"checked" : this.checked,
							"style" : getLiStyle(count)
						}));
						count++;
					});
				} else {
					alert("上場区分が取得できませんでした");
				}
			}
		});

	})();
	
	// 選択/非選択の情報をサーバーへ送る
	$(document).on('change', ".check_listing", function() {
		var check        = ($(this).prop("checked") ? "1" : "0");
		var listingName  = $(this).val();
		var allFlg       = "0";
		$.ajax({
			url: "/analysis/save-listing",
			type: "POST",
			data: {
				"listing_name" : listingName,
				"check"        : check,
				"allFlg"       : allFlg
			},
			dataType: 'json',
			success: function(result) {
				
				if(result != "" && result != null){
					alert(result);
				}
			}
		});
	});
	
	// 「全選択/全解除」イベント
	$(document).on("click", ".check-listing-all", function() {
		var $listings = $(this).closest(".inner-wrap").find(".listing_content  input[type='checkbox']");
		var current_check_state = $(this).prop("checked");
		var check  = (current_check_state ? "1" : "0");
		var allFlg = "1";
		if (current_check_state) {
			$listings.prop("checked", true);
		} else {
			$listings.prop("checked", false);
		}
		$.ajax({
			url: "/analysis/save-listing",
			type: "POST",
			data: {
				"listing_name" : "",
				"check"        : check,
				"allFlg"       : allFlg
			},
			dataType: 'json',
			success: function(result) {
				
				if(result != "" && result != null){
					alert(result);
				}
			}
		});
	});
	
	// 「選択する」を押下。サーバーから現在選択している台本を確定し取得する
	$(document).on("click", "#select-listing .decision", function() {
		var type = $(this).data("type");	// タイプを取得
		$.ajax({
			url: "/analysis/decision-condition",
			type: "POST",
			data: { "type" : type },
			dataType: 'json',
			success: function(result) {
				$(".modal-close").trigger("click");
			}
		});
	});
	
	
	// 検索ボタンを押されたタイミングで検索をかけに行く
	$('#search-listing-keyword').on("click", function() {
		var name = $(this).prev("#keyword-s").val();
		var reg = new RegExp(name);
		$("li.listing-row").css("display", "none");
		$("li.listing-row").each(function (i) {
			if($(this).text().match(reg)){
				$(this).toggle();
			}
		});
	});
});

/*****************************************************************************
*
* 【設立年月日】の選択
* 
*****************************************************************************/

$(function() {
	
	// 初期表示時に呼出部署（拠点）を取得し、画面にセットする。
	(function() {
		// TODO 初期処理が必要な用であれば取得。クリックしたときに取得してもよいか（？）
		$.ajax({
			url: "/analysis/establishment-date",
			type: "GET",
			dataType: 'json',
			success: function(establishmentDate) {
				if (establishmentDate !== "") {
					var template = Handlebars.compile($('#establishment-date-row-template').html());
					var count = 0;
					$.each(establishmentDate, function() {
						$('ul.establishment-date_content').append(template({
							"name" : this.name,
							"checked" : this.checked,
							"style" : getLiStyle(count)
						}));
						count++;
					});
				} else {
					alert("設立年月日が取得できませんでした");
				}
			}
		});
	})();
	
	// 選択/非選択の情報をサーバーへ送る
	$(document).on('change', ".check_establishment_date", function() {
		
		var check = ($(this).prop("checked") ? "1" : "0");
		var establishmentDateName = $(this).val();
		var allFlg = "0";
		
		$.ajax({
			url: "/analysis/save-establishment-date",
			type: "POST",
			data: {
				"establishment_date"	: establishmentDateName,
				"check"					: check,
				"allFlg"				: allFlg
			},
			dataType: 'json',
			success: function(result) {
				
				if(result != "" && result != null){
					alert(result);
				}
			}
		});
	});
	
	// 「全選択/全解除」イベント
	$(document).on("click", ".check-establishment-date-all", function() {
		var $establishmentDates = $(this).closest(".inner-wrap").find(".establishment-date_content  input[type='checkbox']");
		var current_check_state = $(this).prop("checked");
		var check  = (current_check_state ? "1" : "0");
		var allFlg = "1";
		if (current_check_state) {
			$establishmentDates.prop("checked", true);
		} else {
			$establishmentDates.prop("checked", false);
		}
		
		$.ajax({
			url: "/analysis/save-establishment-date",
			type: "POST",
			data: {
				"establishment_date"	: "",
				"check"					: check,
				"allFlg"				: allFlg
			},
			dataType: 'json',
			success: function(result) {
				
				if(result != "" && result != null){
					alert(result);
				}
			}
		});
	});
	
	// 「選択する」を押下。サーバーから現在選択している台本を確定し取得する
	$(document).on("click", "#select-establishment-date .decision", function() {
		var type = $(this).data("type");	// タイプを取得
		$.ajax({
			url: "/analysis/decision-condition",
			type: "POST",
			data: { "type" : type },
			dataType: 'json',
			success: function(result) {
				$(".modal-close").trigger("click");
			}
		});
	});
	
	// 検索ボタンを押されたタイミングで検索をかけに行く
	$('#search-establishment-date-keyword').on("click", function() {
		var name = $(this).prev("#keyword-s").val();
		var reg = new RegExp(name);
		$("li.establishment-date-row").css("display", "none");
		$("li.establishment-date-row").each(function (i) {
			if($(this).text().match(reg)){
				$(this).toggle();
			}
		});
	});
});
