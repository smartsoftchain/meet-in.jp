// Chrome拡張機能の設定
if((window.location.host === 'meet-in.jp') ||
   (window.location.host === 'stage.meet-in.jp') ||
   (window.location.host === 'delphinus.sense.co.jp') ||
   (window.location.host === 'delphinus2.sense.co.jp')) {
  // Meetin
  __CHROME_EXT_SCREENRECORDER__ = {
    name: 'Meetin録画',
    url: 'https://chrome.google.com/webstore/detail/meetin%E9%8C%B2%E7%94%BB/hcopbconjndiigkhpcgagggfhkiphacl?hl=ja',
  };
  __CHROME_EXT_SCREENSHARE__ = {
    name: 'Meetin画面共有',
    url: 'https://chrome.google.com/webstore/detail/meetin%E7%94%BB%E9%9D%A2%E5%85%B1%E6%9C%89/ccaipbdijoajhpfaolhchkccioimhifp?hl=ja',
  };
  __CHROME_EXT_SCREENCAPTURE__ = {
    name: 'Meetin画面キャプチャ',
    url: 'https://chrome.google.com/webstore/detail/meetin%E7%94%BB%E9%9D%A2%E3%82%AD%E3%83%A3%E3%83%97%E3%83%81%E3%83%A3/hjegbeikkgbhihmjcficdeiajeomkcnp?hl=ja',
  };
} else if((window.location.host === 'online.sales-crowd.jp') ||
          (window.location.host === 'demo.sales-crowd.jp')) {
  // SC
  __CHROME_EXT_SCREENRECORDER__ = {
    name: 'SalesCrowd録画',
    url: 'https://chrome.google.com/webstore/detail/salescrowd%E9%8C%B2%E7%94%BB/nkehmmgegkjipfcniihkakbcgnonkcio?hl=ja',
  };
  __CHROME_EXT_SCREENSHARE__ = {
    name: 'SalesCrowd画面共有',
    url: 'https://chrome.google.com/webstore/detail/salescrowd%E7%94%BB%E9%9D%A2%E5%85%B1%E6%9C%89/jhjohmfjbcmfpjbkjcclpcchhpfklhjm?hl=ja',
  };
  __CHROME_EXT_SCREENCAPTURE__ = {
    name: 'SalesCrowd画面キャプチャ',
    url: 'https://chrome.google.com/webstore/detail/salescrowd%E7%94%BB%E9%9D%A2%E3%82%AD%E3%83%A3%E3%83%97%E3%83%81%E3%83%A3/phpkganbpdbagdnhnhifpmchfnaffodd?hl=ja',
  };
} else {
  // その他
  __CHROME_EXT_SCREENRECORDER__ = {
    name: 'Meetin録画',
    url: 'https://chrome.google.com/webstore/detail/meetin%E9%8C%B2%E7%94%BB/hcopbconjndiigkhpcgagggfhkiphacl?hl=ja',
  };
  __CHROME_EXT_SCREENSHARE__ = {
    name: 'Meetin画面共有',
    url: 'https://chrome.google.com/webstore/detail/meetin%E7%94%BB%E9%9D%A2%E5%85%B1%E6%9C%89/ccaipbdijoajhpfaolhchkccioimhifp?hl=ja',
  };
  __CHROME_EXT_SCREENCAPTURE__ = {
    name: 'Meetin画面キャプチャ',
    url: 'https://chrome.google.com/webstore/detail/meetin%E7%94%BB%E9%9D%A2%E3%82%AD%E3%83%A3%E3%83%97%E3%83%81%E3%83%A3/hjegbeikkgbhihmjcficdeiajeomkcnp?hl=ja',
  };
}

$(function() {

  // headerのプルダウンメニュー
  $(".header_select").on("click", function() {
    $(this).children(".select_option").slideToggle("fast");
  })

  // 固定したheaderとfooterの横スクロール
  $(window).on("scroll", function(){
    $("header, footer, #mi_contents_display, .mi_left_sidebar").css("left", -$(window).scrollLeft());
  });

  // チェックボックス切り替え
  $(".table_main tr").on("click", function() {
    var checkBox = $(this).find("input[type='checkbox']");
    checkBox.prop("checked", !checkBox.prop("checked"));
  });


  //検索ボックスで入力があればデータを送信する
  var $form = $("#search_form");
  $form.submit(function(e) {
    //inputが空欄じゃない場合のみ送信
    var $input_box = $("#search_form .search_box");
    var $input = $input_box.children("input");

    if ($input.hasClass("mi_delete")) {
      $input.val("");
      return true;
    }

    if ($input.hasClass("mi_active")) {

      if($input.val() == ""){
        //inputが空欄の場合はinputを非表示
        $input_box.animate(
          {
            "width": "50",
          },
          {
            "duration": 150,
            "easing": "linear",
            "complete": function(){
              $input.removeClass("mi_active");
            }
          }
        );
        return false;
      } else {
        return true;
      }
    } else {
      $input_box.animate(
        {
          "width": "400px",
        },
        {
          "duration": 150,
          "easing": "linear",
          "complete": function(){
            $input.addClass("mi_active");
          }
        }
      );
      return false;
    }
  });

  // 検索ボックスでバツボタンを押した時にからデータを送信する
  $(".search_close_button").on("click", function(e) {
    $(this).siblings("[type=text]").addClass("mi_delete");
    $form.submit();s
  });

});

// 電話モーダルmeetin切り替え
function changeMeetinCall() {
  $("#mi_tel_modal").toggleClass("meetin_call");
}

function tel_modal() {
  $("#tel_modal").fadeToggle();
}

$(function(){
  //スライド用
  var s_time = 2600;
  var stop = 4000;
  $(".mi_img_slide_wrap .mi_img_slide_list").eq(0).addClass("is-visible");
  var loop = setInterval(function() {
      $(".mi_img_slide_wrap .mi_img_slide_list").eq(1).addClass("is-visible");
      setTimeout(function(){
        var clone = $(".mi_img_slide_wrap .mi_img_slide_list:first").clone(true);
        clone.clone(true).insertAfter($(".mi_img_slide_wrap .mi_img_slide_list:last"));
        $(".mi_img_slide_wrap .mi_img_slide_list:last").removeClass("is-visible");
        $(".mi_img_slide_wrap .mi_img_slide_list:first").remove();
      },stop-1000);
  }, stop);
});

// テーブルrowをクリックした時に先頭にcheckを入れる
$(function(){
  $(document).on("click",".mi_table_main td",function (){
    var inputoj = $(this).parents("tr").find(".mi_table_item_1 input");
    if(inputoj.prop("checked")){
      inputoj.prop("checked",false);
    }else{
      inputoj.prop("checked",true);
    }
  });
  $(".mi_table_main tr .mi_check_td").on("click",function (){
    var inputoj = $(this).parents("tr").find(".mi_check_td input");
    if(inputoj.prop("checked")){
      inputoj.prop("checked",false);
    }else{
      inputoj.prop("checked",true);
    }
  });
  $(document).on("click",".mi_table_main td input", function (e){
    e.stopPropagation();
  });
  $(".mi_table_main tr > * > *").on("click",function (e){
    e.stopPropagation();
  });
});
