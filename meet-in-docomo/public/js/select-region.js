
/* アコーディオン MENU */
$(function(){
	$(".pulmenu dd").css("display","none");
	$(".pulmenu dt").click(function(){
		if($("+dd",this).css("display")=="none"){
			$(".pulmenu dd").slideUp( 50 );
			$("+dd",this).slideDown( 50 );
		}
	});
});

/* 地域選択 TAB */
$(function() {
	$("p.area").click(function() {
		$(".tab_content").addClass('disnon');
		$(".tab li").removeClass('select');
		$("#slct_msg").removeClass('disnon');
	});

	$(".tab li").click(function() {
		$(".tab li").removeClass('select');
		$(this).addClass('select');
		$("#slct_msg").addClass('disnon');
	});
});

/* 都道府県選択 TAB */
$(function() {
	$("#hokkaido").click(function() {
		var num = $("#hokkaido").index(this);
		$(".tab_content").addClass('disnon');
		$(".hokkaido").eq(num).removeClass('disnon');
		$("#hokkaido").removeClass('select');
		$(this).addClass('select')
	});

	$("#aomori").click(function() {
		var num = $("#aomori").index(this);
		$(".tab_content").addClass('disnon');
		$(".aomori").eq(num).removeClass('disnon');
		$("#aomori").removeClass('select');
		$(this).addClass('select')
	});

	$("#iwate").click(function() {
		var num = $("#iwate").index(this);
		$(".tab_content").addClass('disnon');
		$(".iwate").eq(num).removeClass('disnon');
		$("#iwate").removeClass('select');
		$(this).addClass('select')
	});

	$("#miyagi").click(function() {
		var num = $("#miyagi").index(this);
		$(".tab_content").addClass('disnon');
		$(".miyagi").eq(num).removeClass('disnon');
		$("#miyagi").removeClass('select');
		$(this).addClass('select')
	});

	$("#akita").click(function() {
		var num = $("#akita").index(this);
		$(".tab_content").addClass('disnon');
		$(".akita").eq(num).removeClass('disnon');
		$("#akita").removeClass('select');
		$(this).addClass('select')
	});

	$("#yamagata").click(function() {
		var num = $("#yamagata").index(this);
		$(".tab_content").addClass('disnon');
		$(".yamagata").eq(num).removeClass('disnon');
		$("#yamagata").removeClass('select');
		$(this).addClass('select')
	});

	$("#fukushima").click(function() {
		var num = $("#fukushima").index(this);
		$(".tab_content").addClass('disnon');
		$(".fukushima").eq(num).removeClass('disnon');
		$("#fukushima").removeClass('select');
		$(this).addClass('select')
	});

	$("#ibaraki").click(function() {
		var num = $("#ibaraki").index(this);
		$(".tab_content").addClass('disnon');
		$(".ibaraki").eq(num).removeClass('disnon');
		$("#ibaraki").removeClass('select');
		$(this).addClass('select')
	});

	$("#tochigi").click(function() {
		var num = $("#tochigi").index(this);
		$(".tab_content").addClass('disnon');
		$(".tochigi").eq(num).removeClass('disnon');
		$("#tochigi").removeClass('select');
		$(this).addClass('select')
	});

	$("#gunnma").click(function() {
		var num = $("#gunnma").index(this);
		$(".tab_content").addClass('disnon');
		$(".gunnma").eq(num).removeClass('disnon');
		$("#gunnma").removeClass('select');
		$(this).addClass('select')
	});

	$("#saitama").click(function() {
		var num = $("#saitama").index(this);
		$(".tab_content").addClass('disnon');
		$(".saitama").eq(num).removeClass('disnon');
		$("#saitama").removeClass('select');
		$(this).addClass('select')
	});

	$("#chiba").click(function() {
		var num = $("#chiba").index(this);
		$(".tab_content").addClass('disnon');
		$(".chiba").eq(num).removeClass('disnon');
		$("#chiba").removeClass('select');
		$(this).addClass('select')
	});

	$("#tokyo").click(function() {
		var num = $("#tokyo").index(this);
		$(".tab_content").addClass('disnon');
		$(".tokyo").eq(num).removeClass('disnon');
		$("#tokyo").removeClass('select');
		$(this).addClass('select')
	});

	$("#tokyo2").click(function() {
		var num = $("#tokyo2").index(this);
		$(".tab_content").addClass('disnon');
		$(".tokyo2").eq(num).removeClass('disnon');
		$("#tokyo2").removeClass('select');
		$(this).addClass('select')
	});

	$("#kanagawa").click(function() {
		var num = $("#kanagawa").index(this);
		$(".tab_content").addClass('disnon');
		$(".kanagawa").eq(num).removeClass('disnon');
		$("#kanagawa").removeClass('select');
		$(this).addClass('select')
	});

	$("#niigata").click(function() {
		var num = $("#niigata").index(this);
		$(".tab_content").addClass('disnon');
		$(".niigata").eq(num).removeClass('disnon');
		$("#niigata").removeClass('select');
		$(this).addClass('select')
	});

	$("#yamanashi").click(function() {
		var num = $("#yamanashi").index(this);
		$(".tab_content").addClass('disnon');
		$(".yamanashi").eq(num).removeClass('disnon');
		$("#yamanashi").removeClass('select');
		$(this).addClass('select')
	});

	$("#nagano").click(function() {
		var num = $("#nagano").index(this);
		$(".tab_content").addClass('disnon');
		$(".nagano").eq(num).removeClass('disnon');
		$("#nagano").removeClass('select');
		$(this).addClass('select')
	});

	$("#toyama").click(function() {
		var num = $("#toyama").index(this);
		$(".tab_content").addClass('disnon');
		$(".toyama").eq(num).removeClass('disnon');
		$("#toyama").removeClass('select');
		$(this).addClass('select')
	});

	$("#ishikawa").click(function() {
		var num = $("#ishikawa").index(this);
		$(".tab_content").addClass('disnon');
		$(".ishikawa").eq(num).removeClass('disnon');
		$("#ishikawa").removeClass('select');
		$(this).addClass('select')
	});

	$("#fukui").click(function() {
		var num = $("#fukui").index(this);
		$(".tab_content").addClass('disnon');
		$(".fukui").eq(num).removeClass('disnon');
		$("#fukui").removeClass('select');
		$(this).addClass('select')
	});

	$("#gifu").click(function() {
		var num = $("#gifu").index(this);
		$(".tab_content").addClass('disnon');
		$(".gifu").eq(num).removeClass('disnon');
		$("#gifu").removeClass('select');
		$(this).addClass('select')
	});

	$("#shizuoka").click(function() {
		var num = $("#shizuoka").index(this);
		$(".tab_content").addClass('disnon');
		$(".shizuoka").eq(num).removeClass('disnon');
		$("#shizuoka").removeClass('select');
		$(this).addClass('select')
	});

	$("#aichi").click(function() {
		var num = $("#aichi").index(this);
		$(".tab_content").addClass('disnon');
		$(".aichi").eq(num).removeClass('disnon');
		$("#aichi").removeClass('select');
		$(this).addClass('select')
	});

	$("#mie").click(function() {
		var num = $("#mie").index(this);
		$(".tab_content").addClass('disnon');
		$(".mie").eq(num).removeClass('disnon');
		$("#mie").removeClass('select');
		$(this).addClass('select')
	});

	$("#shiga").click(function() {
		var num = $("#shiga").index(this);
		$(".tab_content").addClass('disnon');
		$(".shiga").eq(num).removeClass('disnon');
		$("#shiga").removeClass('select');
		$(this).addClass('select')
	});

	$("#kyoto").click(function() {
		var num = $("#kyoto").index(this);
		$(".tab_content").addClass('disnon');
		$(".kyoto").eq(num).removeClass('disnon');
		$("#kyoto").removeClass('select');
		$(this).addClass('select')
	});

	$("#oosaka").click(function() {
		var num = $("#oosaka").index(this);
		$(".tab_content").addClass('disnon');
		$(".oosaka").eq(num).removeClass('disnon');
		$("#oosaka").removeClass('select');
		$(this).addClass('select')
	});

	$("#hyougo").click(function() {
		var num = $("#hyougo").index(this);
		$(".tab_content").addClass('disnon');
		$(".hyougo").eq(num).removeClass('disnon');
		$("#hyougo").removeClass('select');
		$(this).addClass('select')
	});

	$("#nara").click(function() {
		var num = $("#nara").index(this);
		$(".tab_content").addClass('disnon');
		$(".nara").eq(num).removeClass('disnon');
		$("#nara").removeClass('select');
		$(this).addClass('select')
	});

	$("#wakayama").click(function() {
		var num = $("#wakayama").index(this);
		$(".tab_content").addClass('disnon');
		$(".wakayama").eq(num).removeClass('disnon');
		$("#wakayama").removeClass('select');
		$(this).addClass('select')
	});

	$("#tottori").click(function() {
		var num = $("#tottori").index(this);
		$(".tab_content").addClass('disnon');
		$(".tottori").eq(num).removeClass('disnon');
		$("#tottori").removeClass('select');
		$(this).addClass('select')
	});

	$("#shimane").click(function() {
		var num = $("#shimane").index(this);
		$(".tab_content").addClass('disnon');
		$(".shimane").eq(num).removeClass('disnon');
		$("#shimane").removeClass('select');
		$(this).addClass('select')
	});

	$("#okayama").click(function() {
		var num = $("#okayama").index(this);
		$(".tab_content").addClass('disnon');
		$(".okayama").eq(num).removeClass('disnon');
		$("#okayama").removeClass('select');
		$(this).addClass('select')
	});

	$("#hiroshima").click(function() {
		var num = $("#hiroshima").index(this);
		$(".tab_content").addClass('disnon');
		$(".hiroshima").eq(num).removeClass('disnon');
		$("#hiroshima").removeClass('select');
		$(this).addClass('select')
	});

	$("#yamaguchi").click(function() {
		var num = $("#yamaguchi").index(this);
		$(".tab_content").addClass('disnon');
		$(".yamaguchi").eq(num).removeClass('disnon');
		$("#yamaguchi").removeClass('select');
		$(this).addClass('select')
	});

	$("#tokushima").click(function() {
		var num = $("#tokushima").index(this);
		$(".tab_content").addClass('disnon');
		$(".tokushima").eq(num).removeClass('disnon');
		$("#tokushima").removeClass('select');
		$(this).addClass('select')
	});

	$("#kagawa").click(function() {
		var num = $("#kagawa").index(this);
		$(".tab_content").addClass('disnon');
		$(".kagawa").eq(num).removeClass('disnon');
		$("#kagawa").removeClass('select');
		$(this).addClass('select')
	});

	$("#ehime").click(function() {
		var num = $("#ehime").index(this);
		$(".tab_content").addClass('disnon');
		$(".ehime").eq(num).removeClass('disnon');
		$("#ehime").removeClass('select');
		$(this).addClass('select')
	});

	$("#kouchi").click(function() {
		var num = $("#kouchi").index(this);
		$(".tab_content").addClass('disnon');
		$(".kouchi").eq(num).removeClass('disnon');
		$("#kouchi").removeClass('select');
		$(this).addClass('select')
	});

	$("#fukuoka").click(function() {
		var num = $("#fukuoka").index(this);
		$(".tab_content").addClass('disnon');
		$(".fukuoka").eq(num).removeClass('disnon');
		$("#fukuoka").removeClass('select');
		$(this).addClass('select')
	});

	$("#saga").click(function() {
		var num = $("#saga").index(this);
		$(".tab_content").addClass('disnon');
		$(".saga").eq(num).removeClass('disnon');
		$("#saga").removeClass('select');
		$(this).addClass('select')
	});

	$("#nagasaki").click(function() {
		var num = $("#nagasaki").index(this);
		$(".tab_content").addClass('disnon');
		$(".nagasaki").eq(num).removeClass('disnon');
		$("#nagasaki").removeClass('select');
		$(this).addClass('select')
	});

	$("#kumamoto").click(function() {
		var num = $("#kumamoto").index(this);
		$(".tab_content").addClass('disnon');
		$(".kumamoto").eq(num).removeClass('disnon');
		$("#kumamoto").removeClass('select');
		$(this).addClass('select')
	});

	$("#ooita").click(function() {
		var num = $("#ooita").index(this);
		$(".tab_content").addClass('disnon');
		$(".ooita").eq(num).removeClass('disnon');
		$("#ooita").removeClass('select');
		$(this).addClass('select')
	});

	$("#miyazaki").click(function() {
		var num = $("#miyazaki").index(this);
		$(".tab_content").addClass('disnon');
		$(".miyazaki").eq(num).removeClass('disnon');
		$("#miyazaki").removeClass('select');
		$(this).addClass('select')
	});

	$("#kagoshima").click(function() {
		var num = $("#kagoshima").index(this);
		$(".tab_content").addClass('disnon');
		$(".kagoshima").eq(num).removeClass('disnon');
		$("#kagoshima").removeClass('select');
		$(this).addClass('select')
	});

	$("#okinawa").click(function() {
		var num = $("#okinawa").index(this);
		$(".tab_content").addClass('disnon');
		$(".okinawa").eq(num).removeClass('disnon');
		$("#okinawa").removeClass('select');
		$(this).addClass('select')
	});

});

/* チェックボックス全選択全解除（地域選択） */
$(function() {
  $('#hokkaido_all').on("click",function(){
    $("input:checkbox[name='hokkaido_city']").prop("checked", $(this).prop("checked"));
  });

  $('#aomori_all').on("click",function(){
    $("input:checkbox[name='aomori_city']").prop("checked", $(this).prop("checked"));
  });

  $('#iwate_all').on("click",function(){
    $("input:checkbox[name='iwate_city']").prop("checked", $(this).prop("checked"));
  });

  $('#miyagi_all').on("click",function(){
    $("input:checkbox[name='miyagi_city']").prop("checked", $(this).prop("checked"));
  });

  $('#akita_all').on("click",function(){
    $("input:checkbox[name='akita_city']").prop("checked", $(this).prop("checked"));
  });

  $('#yamagata_all').on("click",function(){
    $("input:checkbox[name='yamagata_city']").prop("checked", $(this).prop("checked"));
  });

  $('#fukushima_all').on("click",function(){
    $("input:checkbox[name='fukushima_city']").prop("checked", $(this).prop("checked"));
  });

  $('#ibaraki_all').on("click",function(){
    $("input:checkbox[name='ibaraki_city']").prop("checked", $(this).prop("checked"));
  });

  $('#tochigi_all').on("click",function(){
    $("input:checkbox[name='tochigi_city']").prop("checked", $(this).prop("checked"));
  });

  $('#gunnma_all').on("click",function(){
    $("input:checkbox[name='gunma_city']").prop("checked", $(this).prop("checked"));
  });

  $('#saitama_all').on("click",function(){
    $("input:checkbox[name='saitama_city']").prop("checked", $(this).prop("checked"));
  });

  $('#chiba_all').on("click",function(){
    $("input:checkbox[name='chiba_city']").prop("checked", $(this).prop("checked"));
  });

  $('#tokyo_all').on("click",function(){
    $("input:checkbox[name='tokyo_city']").prop("checked", $(this).prop("checked"));
  });

  $('#tokyo2_all').on("click",function(){
    $("input:checkbox[name='tokyo2_city']").prop("checked", $(this).prop("checked"));
  });

  $('#kanagawa_all').on("click",function(){
    $("input:checkbox[name='kanagawa_city']").prop("checked", $(this).prop("checked"));
  });

  $('#niigata_all').on("click",function(){
    $("input:checkbox[name='niigata_city']").prop("checked", $(this).prop("checked"));
  });

  $('#yamanashi_all').on("click",function(){
    $("input:checkbox[name='yamanashi_city']").prop("checked", $(this).prop("checked"));
  });

  $('#nagano_all').on("click",function(){
    $("input:checkbox[name='nagano_city']").prop("checked", $(this).prop("checked"));
  });

  $('#toyama_all').on("click",function(){
    $("input:checkbox[name='toyama_city']").prop("checked", $(this).prop("checked"));
  });

  $('#ishikawa_all').on("click",function(){
    $("input:checkbox[name='ishikawa_city']").prop("checked", $(this).prop("checked"));
  });

  $('#fukui_all').on("click",function(){
    $("input:checkbox[name='fukui_city']").prop("checked", $(this).prop("checked"));
  });

  $('#gifu_all').on("click",function(){
    $("input:checkbox[name='gifu_city']").prop("checked", $(this).prop("checked"));
  });

  $('#shizuoka_all').on("click",function(){
    $("input:checkbox[name='shizuoka_city']").prop("checked", $(this).prop("checked"));
  });

  $('#aichi_all').on("click",function(){
    $("input:checkbox[name='aichi_city']").prop("checked", $(this).prop("checked"));
  });

  $('#mie_all').on("click",function(){
    $("input:checkbox[name='mie_city']").prop("checked", $(this).prop("checked"));
  });

  $('#shiga_all').on("click",function(){
    $("input:checkbox[name='shiga_city']").prop("checked", $(this).prop("checked"));
  });

  $('#kyoto_all').on("click",function(){
    $("input:checkbox[name='kyoto_city']").prop("checked", $(this).prop("checked"));
  });

  $('#oosaka_all').on("click",function(){
    $("input:checkbox[name='oosaka_city']").prop("checked", $(this).prop("checked"));
  });

  $('#hyougo_all').on("click",function(){
    $("input:checkbox[name='hyougo_city']").prop("checked", $(this).prop("checked"));
  });

  $('#nara_all').on("click",function(){
    $("input:checkbox[name='nara_city']").prop("checked", $(this).prop("checked"));
  });

  $('#wakayama_all').on("click",function(){
    $("input:checkbox[name='wakayama_city']").prop("checked", $(this).prop("checked"));
  });

  $('#tottori_all').on("click",function(){
    $("input:checkbox[name='tottori_city']").prop("checked", $(this).prop("checked"));
  });

  $('#shimane_all').on("click",function(){
    $("input:checkbox[name='shimane_city']").prop("checked", $(this).prop("checked"));
  });

  $('#okayama_all').on("click",function(){
    $("input:checkbox[name='okayama_city']").prop("checked", $(this).prop("checked"));
  });

  $('#hiroshima_all').on("click",function(){
    $("input:checkbox[name='hiroshima_city']").prop("checked", $(this).prop("checked"));
  });

  $('#yamaguchi_all').on("click",function(){
    $("input:checkbox[name='yamaguchi_city']").prop("checked", $(this).prop("checked"));
  });

  $('#tokushima_all').on("click",function(){
    $("input:checkbox[name='tokushima_city']").prop("checked", $(this).prop("checked"));
  });

  $('#kagawa_all').on("click",function(){
    $("input:checkbox[name='kagawa_city']").prop("checked", $(this).prop("checked"));
  });

  $('#ehime_all').on("click",function(){
    $("input:checkbox[name='ehime_city']").prop("checked", $(this).prop("checked"));
  });

  $('#kouchi_all').on("click",function(){
    $("input:checkbox[name='kouchi_city']").prop("checked", $(this).prop("checked"));
  });

  $('#fukuoka_all').on("click",function(){
    $("input:checkbox[name='fukuoka_city']").prop("checked", $(this).prop("checked"));
  });

  $('#saga_all').on("click",function(){
    $("input:checkbox[name='saga_city']").prop("checked", $(this).prop("checked"));
  });

  $('#nagasaki_all').on("click",function(){
    $("input:checkbox[name='nagasaki_city']").prop("checked", $(this).prop("checked"));
  });

  $('#kumamoto_all').on("click",function(){
    $("input:checkbox[name='kumamoto_city']").prop("checked", $(this).prop("checked"));
  });

  $('#ooita_all').on("click",function(){
    $("input:checkbox[name='ooita_city']").prop("checked", $(this).prop("checked"));
  });

  $('#miyazaki_all').on("click",function(){
    $("input:checkbox[name='miyazaki_city']").prop("checked", $(this).prop("checked"));
  });

  $('#kagoshima_all').on("click",function(){
    $("input:checkbox[name='kagoshima_city']").prop("checked", $(this).prop("checked"));
  });

  $('#okinawa_all').on("click",function(){
    $("input:checkbox[name='okinawa_city']").prop("checked", $(this).prop("checked"));
  });
});

