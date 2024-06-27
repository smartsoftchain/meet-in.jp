/*---------------------------------------
	File Nmae: private_add.js
	Last Modified: 2015-09-08
	加藤追加ファイルです
	-----------------------------------------*/

	/* アコーディオン内のモーダルで全選択が押された際の制御 */
	$(function(){
		$('.service_all').on("click",function(){
			$("input:checkbox[name='service']").prop("checked", $(this).prop("checked"));
		});
		$('.list_all').on("click",function(){
			$("input:checkbox[name='list-select']").prop("checked", $(this).prop("checked"));
		});
	})

	/*サービス/商品名の選択*/
	$(document).on('click', '#service_link', function(e) {
		var disp = $("#select-service").css('display');
		if(disp=='none'){
			$("#select-service").fadeIn('fast');
			$(".service_content li").autoHeight({column:3,clear:1,height:"height"});
		}
		var list_count = $(".service_content li").length;

		if(list_count % 3 == 0){
			$(".service_content li:nth-last-of-type(3)").css("padding-bottom","12px");
			$(".service_content li:nth-last-of-type(2)").css("padding-bottom","12px");
			$(".service_content li:nth-last-of-type(1)").css("padding-bottom","12px");
		}
		else if(list_count % 2 == 0){
			$(".service_content li:nth-last-of-type(2)").css("padding-bottom","12px");
			$(".service_content li:nth-last-of-type(1)").css("padding-bottom","12px");
		}
		else{
			$(".service_content li:nth-last-of-type(1)").css("padding-bottom","12px");
		}
	});

	/*リスト取得先の選択*/
	$(document).on('click', '#getlist_link', function(e) {
		var disp = $("#select-service").css('display');
		if(disp=='none'){
			$("#select-getlist").fadeIn('fast');
			$(".getlist_content li").autoHeight({column:3,clear:1,height:"height"});
		}
		var list_count = $(".getlist_content li").length;

		if(list_count % 3 == 0){
			$(".getlist_content li:nth-last-of-type(3)").css("padding-bottom","12px");
			$(".getlist_content li:nth-last-of-type(2)").css("padding-bottom","12px");
			$(".getlist_content li:nth-last-of-type(1)").css("padding-bottom","12px");
		}
		else if(list_count % 2 == 0){
			$(".getlist_content li:nth-last-of-type(2)").css("padding-bottom","12px");
			$(".getlist_content li:nth-last-of-type(1)").css("padding-bottom","12px");
		}
		else{
			$(".getlist_content li:nth-last-of-type(1)").css("padding-bottom","12px");
		}
	});

	// 業界・業種の選択切り替え
	$(document).on('click', 'div.industry ul li', function(e) {
		var cl = $(this).attr('id');
		$(".tab_content").addClass('disnon');
		$("#business_msg").addClass('disnon');
		$('.' + cl).removeClass('disnon');
		$('.' + cl + ' div.box').autoHeight({column:2, clear:1, height:'height'});
	});

	// 業界・業種の選択 全選択/全解除チェックボックス
	$(document).on('click', 'input[id^=all-industry]', function(e) {
		var target = $(this).attr('id').substr(4);
		$("input:checkbox[name='" + target + "']").prop("checked", $(this).prop("checked"));
	});

	// 業界・業種の選択 トップへスクロール
	$(document).on('click', '#select-business li[id^=industry]', function(e) {
		var st = $('#select-business div.popup-body').scrollTop();
		console.log(st);
		$('#select-business div.popup-body').animate({ scrollTop: 0 }, { duration: 'fast', easing: 'swing' });
	});

	//単価計算・解析
	//日付の表示方法を指定します
	jQuery( function() {
		jQuery( '.datepicker' ) . datepicker({
			dateFormat:"yy.mm.dd",
			showOn:"both",
			buttonImage:"/img/btn_calendar.png",
			buttonImageOnly: true,
			showOtherMonths: true,
		});
	} );

	//カレンダー表記欄に初期表示の日付を入力します
	function calender_box_default(){
		var today = new Date();
		var year = today.getFullYear();
		var month = today.getMonth()+1;
		var week = today.getDay();
		var day = today.getDate();

		if(month<=9){
			month="0"+month;
		}

		if(day<=9){
			day="0"+day;
		}

		var day_of_month = year+"."+month+"."+day
		var input = jQuery('.datepicker');

		for(var i = 0; i < input.length; i++){
			input[i].value=day_of_month
		}
	}

	//toggleメソッドを制御します
	$(document).ready(function(){
		$(".toggle-list p").click(function () {
			if ($(this).parent().hasClass('active-list')) {
				$(this).parent().removeClass("active-list");
			}
			else{
				$(".toggle-list").removeClass('active-list');
				$(".toggle-list .toggle-item").slideUp(120);
				$(this).parent().addClass("active-list");
			}
			$(this).parent().find(".toggle-item").slideToggle(120);
		});
	});

	//カスタム計算式モーダルで各項目がクリックされた時に背景色を制御します
	$(document).ready(function(){
		$(".custom-formula-edit li").click(function(){
			$(".custom-formula-edit li").removeClass('active-formula');
			$(this).addClass('active-formula');
		});
	})

	//解析設定に設定ボタンが押下された場合(解析)
	$(document).on('click','.analysis_set',function(e){
		if($(this).parents(".toggle-list").hasClass('first')){
			if($(".toggle-list").hasClass('second')){
				$(".first").removeClass("first");
				$(".second").addClass("first");
				$(".second").removeClass("second");
			}
			else{
				$(".first").removeClass("first");
			}
		}
		else if($(this).parents(".toggle-list").hasClass('second')){
			$(".second").removeClass("second");
		}
		else{
			var check1 = $(".analysis_set").parents(".toggle-list").hasClass('first');
			if(!check1){
				$(this).parents('.toggle-list').addClass('first');
				return;
			}
			var check2 = $(".analysis_set").parents(".toggle-list").hasClass('second');
			if(!check2){
				$(this).parents('.toggle-list').addClass('second');
				return;
			}
		}
	})