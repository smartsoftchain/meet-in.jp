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
  $(".search_close_button").on("click", function() {
    $(this).siblings("[name=search]").addClass("mi_delete");
    $('#search_form').submit();
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
  var s_time = 1000;
  var stop = 3600;
  $(".mi_img_slide_wrap .mi_img_slide_list:first").css({zIndex: "4"});
  var loop = setInterval(function() {
      var sw = $(".mi_img_slide_wrap").width();
      $(".mi_img_slide_wrap .mi_img_slide_list").eq(1).css({marginLeft: sw + "px",zIndex: "3"});
      var clone = $(".mi_img_slide_wrap .mi_img_slide_list:first").clone(true);
      
      $(".mi_img_slide_wrap .mi_img_slide_list:first").css({zIndex: "4"});
      $(".mi_img_slide_list").eq(0).animate({
      marginLeft : "-" + sw +"px"
      }, {
        duration : s_time,
        queue: false,
      complete : function() {
        $(".mi_img_slide_wrap .mi_img_slide_list:first").remove();
        clone.clone(true).insertAfter($(".mi_img_slide_wrap .mi_img_slide_list:last")).css({zIndex: "1"});
      }
      });
      $(".mi_img_slide_list").eq(1).animate({
        marginLeft : "0px"
      }, {
        duration : s_time,
        queue: false
      });

  }, stop);
});
