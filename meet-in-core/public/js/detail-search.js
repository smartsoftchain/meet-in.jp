var TYPE_CONDITION_CITY					= "1";
var TYPE_CONDITION_CATEGORY				= "2";
var TYPE_CONDITION_SERVICE				= "3";
var TYPE_CONDITION_LIST					= "4";
var TYPE_CONDITION_ACQUISITION_SOURCE	= "5";

Handlebars.registerHelper('isChecked', function(checked_val, fixed_val){
	if (checked_val === fixed_val) {
        return ' checked';
    } else {
        return ''
    }
});

// 【地域】の選択
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
			url: "/detail-search/city",
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
			url: "/detail-search/save-city",
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
			url: "/detail-search/decision-condition",
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




// 【業種１・業種２・業種３】の選択
$(function() {

	// 業種１を取得し、画面にセットする。
	(function() {

		$.ajax({
			url: "/detail-search/category1",
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
			url: "/detail-search/category2",
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
			url: "/detail-search/category3",
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
	$(document).on('click', '.only-category1', function(){

		var check = ($(this).prop("checked") ? "1" : "0");
		var business_category1_id = $(this).val();
		var business_category2_id = $(this).data("category2Id");

		// チェックされた状態の場合は他のチェックを外す。
		if (check === "1") {
			$(".only-category2").prop("checked", false).change();
			$(".check-category3-all").prop("checked", false).change();
			$(".businesslist input[type='checkbox']").prop("checked", false).change();
		}

		$.ajax({
			url: "/detail-search/save-category1",
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

	// 「業種２のみを選択する」のチェック情報をサーバーへ送る
	$(document).on('click', '.only-category2', function(){

		var check = ($(this).prop("checked") ? "1" : "0");
		var business_category1_id = $(this).data("category1Id");
		var business_category2_id = $(this).val();

		// チェックされた状態の場合は他のチェックを外す。
		if (check === "1") {
			$(".only-category1").prop("checked", false).change();
			$(".check-category3-all").prop("checked", false).change();
			$(".businesslist input[type='checkbox']").prop("checked", false).change();
		}

		$.ajax({
			url: "/detail-search/save-category2",
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
			$categories3.prop("checked", true).change();
			check = "1";

			// チェックされた状態の場合は他のチェックを外す。
			$(".only-category1").prop("checked", false).change();
			$(".only-category2").prop("checked", false).change();

		} else {
			$categories3.prop("checked", false).change();
			check = "0";
		}

		requreSaveCategory3Session(category1_id, category2_id, category3_id, check, allFlg);
	});

	// 業種３の選択/非選択の情報をサーバーへ送る
	$(document).on('click', "input.check-category3", function() {

		var check        = $(this).prop("checked") ? "1" : "0";
		var category1_id = $(this).data("category1Id");
		var category2_id = $(this).data("category2Id");
		var category3_id = $(this).val();
		var allFlg       = "0";				// 全選択/全解除したイベントかどうかのフラグ


		// チェックされた状態の場合は他のチェックを外す。
		if (check === "1") {
			$(".only-category1").prop("checked", false).change();
			$(".only-category2").prop("checked", false).change();
		}

		requreSaveCategory3Session(category1_id, category2_id, category3_id, check, allFlg);
	});

	// 業種３の選択状況をサーバセッションに保存するリクエストを行う。
	function requreSaveCategory3Session(category1_id, category2_id, category3_id, check, allFlg) {

		$.ajax({
			url: "/detail-search/save-category3",
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
			url: "/detail-search/decision-condition",
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



//【サービス】の選択
$(function() {
	
	// 初期表示時にサービスを取得し、画面にセットする。
	(function() {

		$.ajax({
			url: "/detail-search/service",
			type: "GET",
			dataType: 'json',
			success: function(services) {

				if (services !== "") {

					var template = Handlebars.compile($('#service-row-template').html());

					$.each(services, function() {

						$('ul.service_content').append(template({
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
		
		var check       = ($(this).prop("checked") ? "1" : "0");
		var serviceName = $(this).val();
		var allFlg      = "0";
		
		$.ajax({
			url: "/detail-search/save-service",
			type: "POST",
			data: {
				"service_name" : serviceName,
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
			url: "/detail-search/save-service",
			type: "POST",
			data: {
				"service_name" : "",
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
	
	// 「選択する」を押下。サーバーから現在選択しているカテゴリを確定し取得する
	$(document).on("click", "#select-service .decision", function() {

		var type = $(this).data("type");	// タイプを取得

		$.ajax({
			url: "/detail-search/decision-condition",
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


//【リスト取得先カテゴリ】の選択
$(function() {
	
	// 初期表示時にリスト取得先リストを取得し、画面にセットする。
	(function() {
		
		$.ajax({
			url: "/detail-search/all-acquisition-source-category",
			type: "GET",
			dataType: 'json',
			success: function(acquisitionSourceCategoryList) {
				
				if (acquisitionSourceCategoryList !== "") {
					var template = Handlebars.compile($('#acquisition-source-category-template').html());
					$.each(acquisitionSourceCategoryList, function() {
						$('#acquisition_source_menu_link').append(template({
							"id"   : this.id,
							"name" : this.name
						}));
					});
				} else {
					alert("リスト取得先カテゴリが取得できませんでした");
				}
			}
		});
	})();
	
	// リスト取得先カテゴリを選択
	$(document).on("click", "#acquisition_source_menu_link .menu-link", function() {
		var acquisitionSourceCategoryId = $(this).data("acquisition-source-category-id");
		var acquisitionSourceCategoryName = $(this).text();
		$(".popup-right-content .slct_msg").addClass('disnon');
		
		$.ajax({
			url: "/detail-search/acquisition-source-list",
			type: "POST",
			data: {
				"acquisitionSourceCategoryId" : acquisitionSourceCategoryId
			},
			dataType: 'json',
			success: function(result) {

				if (result !== "") {

 					var template = Handlebars.compile($('#acquisition-source-content-template').html());

					$('#acquisition_source_content').empty().append(template({
						"type"							: TYPE_CONDITION_ACQUISITION_SOURCE, 
						"acquisitionSourceCategoryId"	: acquisitionSourceCategoryId,
						"acquisitionSourceCategoryName"	: acquisitionSourceCategoryName,
						"acquisitionSourceCategoryList"	: result
					}));

				} else {
					alert("リスト取得先が取得できませんでした");
				}
			}
		});
	});
	
	// 選択/非選択の情報をサーバーへ送る
	$(document).on('change', ".check-acquisition-source", function() {
		
		var check = ($(this).prop("checked") ? "1" : "0");
		var masterDbRelationId = $(this).val();
		var allFlg = "0";
		
		$.ajax({
			url: "/detail-search/save-acquisition-source",
			type: "POST",
			data: {
				"masterDbRelationId" 	: masterDbRelationId,
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
	
	// リスト取得先の「全選択/全解除」イベント
	$(document).on("click", ".check-acquisition-source-all", function() {
		
		var current_check_state = $(this).prop("checked");
		var check  = (current_check_state ? "1" : "0");
		var allFlg = "1";
		
		if (current_check_state) {
			$(".check-acquisition-source").prop("checked", true);
		} else {
			$(".check-acquisition-source").prop("checked", false);
		}
		
		$.ajax({
			url: "/detail-search/save-acquisition-source",
			type: "POST",
			data: {
				"masterDbRelationId" : "",
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
	
	// 「選択する」を押下。サーバーから現在選択しているリスト取得先を確定し取得する
	$(document).on("click", "#select-acquisition-source-category .decision", function() {

		var type = $(this).data("type");	// タイプを取得

		$.ajax({
			url: "/detail-search/decision-condition",
			type: "POST",
			data: { "type" : type },
			dataType: 'json',
			success: function(result) {
				$("#selected-acquisition-source").text(result);
				$(".modal-close").trigger("click");
			}
		});
	});
});


//【リスト取得先】の選択
$(function() {
	
	// 初期表示時にリスト取得先リストを取得し、画面にセットする。
	(function() {

		$.ajax({
			url: "/detail-search/acquisition-list",
			type: "GET",
			dataType: 'json',
			success: function(result) {

				if (result !== "" && result != null) {

					var template = Handlebars.compile($('#acquisition-row-template').html());

					$.each(result, function() {

						$('ul.getlist_content').append(template({
							"name" : this.name,
							"checked" : this.checked,
						}));
					});

				} else {
					alert("リスト取得名が取得できませんでした");
				}
			}
		});

	})();
	
	// 選択/非選択の情報をサーバーへ送る
	$(document).on('change', ".acquisition-select", function() {
		
		var check = ($(this).prop("checked") ? "1" : "0");
		var acquisitionSource = $(this).val();
		var allFlg = "0";
		
		$.ajax({
			url: "/detail-search/save-acquisition",
			type: "POST",
			data: {
				"acquisition_source" : acquisitionSource,
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
	
	// リスト取得先の「全選択/全解除」イベント
	$(document).on("click", ".check-list-all", function() {

		var $acquisitions = $(this).closest(".inner-wrap").find(".getlist_content  input[type='checkbox']");
		var current_check_state = $(this).prop("checked");
		var check  = (current_check_state ? "1" : "0");
		var allFlg = "1";

		if (current_check_state) {
			$acquisitions.prop("checked", true);
		} else {
			$acquisitions.prop("checked", false);
		}
		
		$.ajax({
			url: "/detail-search/save-acquisition",
			type: "POST",
			data: {
				"acquisition_source" : "",
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
	
	// 「選択する」を押下。サーバーから現在選択しているリスト取得先を確定し取得する
	$(document).on("click", "#select-getlist .decision", function() {

		var type = $(this).data("type");	// タイプを取得

		$.ajax({
			url: "/detail-search/decision-condition",
			type: "POST",
			data: { "type" : type },
			dataType: 'json',
			success: function(result) {
				$("#selected-list").text(result);
				$(".modal-close").trigger("click");
			}
		});
	});
	
	
	// 指定された文字列から表示と非表示を切り分ける
	function _checkToggle(name) {
		
		var reg = new RegExp("^"+name+"$");
		
		$("li.acquisition-row").each(function (i) {
			var listName = $(this).find(".acquisition-select").val();
			if(listName.match(reg)){
				$(this).toggle();
			}
		});
	}
	
	// 検索ボタンを押されたタイミングで検索をかけに行く
	$('#search-list-keyword').on("click", function() {
		
		var SEARCH_ACQUISITION_LIST     = "1";		// リスト取得名検索
		var SEARCH_INCLUDE_COMPANY_LIST = "2";		// 企業名を含むリスト検索
		
		var range = $("#acquisition-search-range").val();
		var name = $(this).prev("#keyword-s").val();		// 入力されたキーワード
		
		$("#select-getlist .errmsg").empty().hide();
		
		if (range === SEARCH_ACQUISITION_LIST) {
			
			$("li.acquisition-row").css("display", "none");
			_checkToggle(name);
			
		} else if (range === SEARCH_INCLUDE_COMPANY_LIST) {
			
			if (name != "") {
				
				$.ajax({
					url: "/detail-search/retrieval-acquisition",
					type: "POST",
					data: { "name" : name },
					dataType: 'json',
					success: function(parseAr) {

						if (parseAr["resultCode"] == "0") {
							
							// 登録失敗
							$.each(parseAr["msg"], function() {
								$.each(this, function(key, value) {
									$("#select-getlist .errmsg").append("<p>" + value + "</p>");
								});
							});
							
							$("#select-getlist .errmsg").show();
							
						} else if(parseAr["resultCode"] == "1") {
							
							// 検索結果によって表示を制限する
							$("li.acquisition-row").css("display", "none");
							var listNames = parseAr["listNames"];
							for (var j=0; j < listNames.length; j++) {
								_checkToggle(listNames[j]);
							}
						}
					}
				});
				
			} else {
				
				$("li.acquisition-row").css("display", "none");
				$("li.acquisition-row").each(function (i) {
					$(this).toggle();
				});
			}
		}
	});
});

//【その他抽出条件】の選択
$(function() {
	
	// 新規で検索条件リストボックスを作成するときに必要になるリスト情報
	var newSelectConditions = "";
	
	// 初期表示時にリスト取得先リストを取得し、画面にセットする。
	(function() {

		$.ajax({
			url: "/detail-search/other-condition",
			type: "GET",
			dataType: 'json',
			success: function(conditions) {

				if (conditions !== "") {

					var template = Handlebars.compile($('#other-condition-template').html());
					
					// 検索条件を追加するときに必要になる情報
					newSelectConditions = conditions["selectConditions"];
					
					$("#other-conditions-content").append(template({
						"isAdministrator"         : (conditions["staffType"] === "AA"),			// スタッフタイプ（AAかの確認）
						"allText"                 : conditions["allText"],						// フリーワード検索文字
						"radioMail"               : conditions["radioMail"],
						"radioUrl"                : conditions["radioUrl"],
						"radioFax"                : conditions["radioFax"],
						"radioRepresentativeName" : conditions["radioRepresentativeName"],
						"radioTantoname"          : conditions["radioTantoname"],
						"radioTantodept"          : conditions["radioTantodept"],
						"textTantodept"           : conditions["textTantodept"],
						"radioListing"            : conditions["radioListing"],
						"employee_count_from"     : conditions["employee_count_from"],
						"employee_count_to"       : conditions["employee_count_to"],
						"sales_volume_from"       : conditions["sales_volume_from"],
						"sales_volume_to"         : conditions["sales_volume_to"],
						"capital_stock_from"      : conditions["capital_stock_from"],
						"capital_stock_to"        : conditions["capital_stock_to"],
						"aliveSelectConditions"   : conditions["aliveSelectConditions"]
					}));

				} else {
					alert("リスト取得名が取得できませんでした");
				}
			}
		});

	})();
	
	// 「条件を追加する」ボタン押下時
	$(document).on("click", "#add_condition", function() {
		
		var template = Handlebars.compile($('#free-other-condition-template').html());
		
		$("#free_condition_area").append(template({
			"selectConditions" : newSelectConditions
		}));
	});
	
	// 検索条件の入力欄を削除
	$(document).on('click', '.delete-free-other-condition', function(){
		$(this).closest("ul").remove();
	});
	
	// その他の検索条件フォーム内の入力情報を返す
	function _getOtherConditions() {
		
		// 検索条件を取得する
		var conditionList = [];
		$("select.select_condition").each(function() {
			
			conditionList.push({
				"select_condition" : $(this).val(),
				"text_condition"   : $(this).closest("li").next("li").find("input").val()
			});
		});
		
		// 全項目検索のデータを取得する
		var allTextCondition = $("input[name='all_text_condition']").val();
		
		// 抽出設定のデータを取得
		var radioMail               = $("input[name=radio_mail_address]:checked").val();
		var radioUrl                = $("input[name=radio_url]:checked").val();
		var radioFax                = $("input[name=radio_fax]:checked").val();
		var radioRepresentativeName = $("input[name=radio_representative_name]:checked").val();
		var radioTantoname          = $("input[name=radio_tantoname]:checked").val();
		var radioTantodept          = $("input[name=radio_tantodept]:checked").val();
		
		// 「担当者名」設定箇所と「担当者部署」設定箇所は、スタッフタイプにより表示されないことがあるため以下対応
		if (typeof radioTantoname === "undefined"){
			radioTantoname = "1";
		}
		
		if (typeof radioTantodept === "undefined"){
			radioTantodept = "1";
		}
		
		// 上場区分のデータを取得
		var radioListing = $("input[name=radio_listing]:checked").val();
		
		// 担当部署フリーワードのデータを取得
		var textTantodept = $("input[name=text_tantodept]").val();
		if (typeof textTantodept === "undefined"){
			textTantodept = "";
		}
		
		// 従業員数のデータを取得
		var employeeCountDict = {
			"employee_count_from" : $("input[name=employee_count_from]").val(),
			"employee_count_to"   : $("input[name=employee_count_to]").val()
		};
		
		// 売上高のデータを取得
		var salesVolumeDict = {
			"sales_volume_from" : $("input[name=sales_volume_from]").val(),
			"sales_volume_to"   : $("input[name=sales_volume_to]").val()
		};
		
		// 資本金のデータを取得
		var capitalStockDict = {
			"capital_stock_from" : $("input[name=capital_stock_from]").val(),
			"capital_stock_to"   : $("input[name=capital_stock_to]").val()
		};
		
		return {
			"conditionList"           : conditionList,
			"allTextCondition"        : allTextCondition,
			"radioMail"               : radioMail,
			"radioUrl"                : radioUrl,
			"radioFax"                : radioFax,
			"radioRepresentativeName" : radioRepresentativeName,
			"radioTantoname"          : radioTantoname,
			"radioTantodept"          : radioTantodept,
			"radioListing"            : radioListing,
			"textTantodept"           : textTantodept,
			"employeeCountDict"       : employeeCountDict,
			"salesVolumeDict"         : salesVolumeDict,
			"capitalStockDict"        : capitalStockDict
		};
	}
	
	// 登録する。
	$("#save-other-condition").on("click", function() {
		
		$('input[name="all_text_condition"]').focus();
		$("#select-other .errmsg").empty().hide();
		
		var condition = _getOtherConditions();
		
		// サーバーから現在選択している地域情報を確定し取得する
		$.ajax({
			url: "/detail-search/save-other-condition",
			type: "POST",
			data: { "condition" : condition },
			dataType: 'json',
			success: function(result) {
				
				if(result["resultCode"] == "1"){
					// 登録成功
					$("#selected-other_condition").val(result["html"]);
					$(".modal-close").trigger("click");
					
				}else{
					
					// 登録失敗
					$.each(result["errorMsgList"], function() {
						$("#select-other .errmsg").append("<p>" + this + "</p>");
					})
					
					$("#select-other .errmsg").show();
				}
			}
		});
	});
});