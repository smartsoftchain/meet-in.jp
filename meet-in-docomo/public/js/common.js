// Chrome拡張機能の設定
if (
  // window.location.host === "meet-in.jp" ||
  // window.location.host === "stage.meet-in.jp" ||
  // window.location.host === "dev2.meet-in.jp" ||
  // window.location.host === "delphinus.sense.co.jp" ||
  // window.location.host === "delphinus2.sense.co.jp" ||
  // window.location.host === "delphinus10.sense.co.jp" ||
  // window.location.host === "dev1.meet-in.jp"
  window.location.host === "docomodx.aidma-hd.jp"
) {
  // Meetin
  __CHROME_EXT_SCREENRECORDER__ = {
    name: "オンライン録画",
    url:
      "https://chrome.google.com/webstore/detail/%E3%82%AA%E3%83%B3%E3%83%A9%E3%82%A4%E3%83%[…]2%E7%94%BB/hnfbpimaiihmdfkokfhlpmadkilhdhee?hl=ja&authuser=0",
  };
  __CHROME_EXT_SCREENSHARE__ = {
    name: "オンライン画面共有",
    url:
      "https://chrome.google.com/webstore/detail/%E3%82%AA%E3%83%B3%E3%83%A9%E3%82%A4%E3%83%B3%E7%94%BB%E9%9D%A2%E5%85%B1%E6%9C%89/akgccelpfdgfonjmcappebaiigoacebp?hl=ja&authuser=0",
  };
  __CHROME_EXT_SCREENCAPTURE__ = {
    name: 'オンライン 画面キャプチャ',
    url: 'https://chrome.google.com/webstore/detail/meetin%E7%94%BB%E9%9D%A2%E3%82%AD%E3%83%A3%E3%83%97%E3%83%81%E3%83%A3/njmacjidknpkilakbkgkbejcnkefifcc?hl=ja',
  };
} else if (
  window.location.host === "online.sales-crowd.jp" ||
  window.location.host === "demo.sales-crowd.jp"
) {
  // SC
  __CHROME_EXT_SCREENRECORDER__ = {
    name: "SalesCrowd録画",
    url:
      "https://chrome.google.com/webstore/detail/salescrowd%E9%8C%B2%E7%94%BB/hmcpgbjldjigdjkapedccgnhdhkjicei?hl=ja",
  };
  __CHROME_EXT_SCREENSHARE__ = {
    name: "SalesCrowd画面共有",
    url:
      "https://chrome.google.com/webstore/detail/salescrowd%E7%94%BB%E9%9D%A2%E5%85%B1%E6%9C%89/ehdchpikfmofocoiglfkgfjhgncbbdap?hl=ja",
  };
  __CHROME_EXT_SCREENCAPTURE__ = {
    name: "SalesCrowd画面キャプチャ",
    url:
      "https://chrome.google.com/webstore/detail/salescrowd%E7%94%BB%E9%9D%A2%E3%82%AD%E3%83%A3%E3%83%97%E3%83%81%E3%83%A3/ogjpiafnciojnomdfkfdoibhnhmbjacl?hl=ja",
  };
} else {
  // その他
  __CHROME_EXT_SCREENRECORDER__ = {
    name: "オンライン録画",
    url:
      "https://chrome.google.com/webstore/detail/%E3%82%AA%E3%83%B3%E3%83%A9%E3%82%A4%E3%83%[…]2%E7%94%BB/hnfbpimaiihmdfkokfhlpmadkilhdhee?hl=ja&authuser=0",
  };
  __CHROME_EXT_SCREENSHARE__ = {
    name: "オンライン画面共有",
    url:
      "https://chrome.google.com/webstore/detail/%E3%82%AA%E3%83%B3%E3%83%A9%E3%82%A4%E3%83%B3%E7%94%BB%E9%9D%A2%E5%85%B1%E6%9C%89/akgccelpfdgfonjmcappebaiigoacebp?hl=ja&authuser=0",
  };
  __CHROME_EXT_SCREENCAPTURE__ = {
    name: 'オンライン 画面キャプチャ',
    url: 'https://chrome.google.com/webstore/detail/meetin%E7%94%BB%E9%9D%A2%E3%82%AD%E3%83%A3%E3%83%97%E3%83%81%E3%83%A3/njmacjidknpkilakbkgkbejcnkefifcc?hl=ja',
  };
}

$(function () {
  // headerのプルダウンメニュー
  $(".header_select").on("click", function () {
    $(this).children(".select_option").slideToggle("fast");
  });

  // 固定したheaderとfooterの横スクロール
  $(window).on("scroll", function () {
    $("header, footer, #mi_contents_display, .mi_left_sidebar").css(
      "left",
      -$(window).scrollLeft()
    );
  });

  // チェックボックス切り替え
  $(".table_main tr").on("click", function () {
    var checkBox = $(this).find("input[type='checkbox']");
    checkBox.prop("checked", !checkBox.prop("checked"));
  });

  //検索ボックスで入力があればデータを送信する
  var $form = $("#search_form_tag");
  $form.submit(function (e) {
    //inputが空欄じゃない場合のみ送信
    var $input_box = $("#search_form_tag .search_box");
    var $input = $input_box.children("input");

    $("#search_form .search_box").width(50);
    $("#search_form .search_box").children('input').removeClass('mi_active');
    $("#search_form .search_box").children('input').attr('placeholder', '');

    if ($input.hasClass("mi_delete")) {
      $input.val("");
      return true;
    }

    if ($input.hasClass("mi_active")) {
      if ($input.val() == "") {
        //inputが空欄の場合はinputを非表示
        $input_box.animate(
          {
            // 空欄でも入力欄を非表示にする処理は不要なのでコメントアウト
            // width: "50",
          },
          {
            duration: 150,
            easing: "linear",
            complete: function () {
              $input.removeClass("mi_active");
            },
          }
        );
        return false;
      } else {
        return true;
      }
    } else {
      $input_box.animate(
        {
          width: "300px",
        },
        {
          duration: 150,
          easing: "linear",
          complete: function () {
            $input.attr('placeholder', '検索内容(タグ)を入力してください...');
            $input.addClass("mi_active");
          },
        }
      );
      return false;
    }
  });

  var $form = $("#search_form");
  $form.submit(function (e) {
    //inputが空欄じゃない場合のみ送信
    var $input_box = $("#search_form .search_box");
    var $input = $input_box.children("input");

    $("#search_form_tag .search_box").width(50);
    $("#search_form_tag .search_box").children('input').removeClass('mi_active');
    $("#search_form_tag .search_box").children('input').attr('placeholder', '');

    if ($input.hasClass("mi_delete")) {
      $input.val("");
      return true;
    }

    if ($input.hasClass("mi_active")) {
      if ($input.val() == "") {
        //inputが空欄の場合はinputを非表示
        $input_box.animate(
          {
            // 空欄でも入力欄を非表示にする処理は不要なのでコメントアウト
            // width: "50",
          },
          {
            duration: 150,
            easing: "linear",
            complete: function () {
              $input.removeClass("mi_active");
            },
          }
        );
        return false;
      } else {
        return true;
      }
    } else {
      $input_box.animate(
        {
          width: "300px",
        },
        {
          duration: 150,
          easing: "linear",
          complete: function () {
            $input.attr('placeholder', '検索内容を入力してください...');
            $input.addClass("mi_active");
          },
        }
      );
      return false;
    }
  });

  // 検索ボックスでバツボタンを押した時にからデータを送信する
  $("#search_form_tag .search_close_button").on("click", function (e) {
    //$("#search_form_tag .search_box").width(50);
    $("#search_form_tag .search_box").children('input').val('');
    $("#search_form_tag .search_box").children('input').addClass('mi_delete');
    $("#search_form_tag").submit();

    /*$(this).siblings("[type=text]").addClass("mi_delete");
    $form.submit();
    s;*/
  });

  $("#search_form .search_close_button").on("click", function (e) {
    /*$(this).siblings("[type=text]").addClass("mi_delete");
    $form.submit();
    s;*/
    //$("#search_form .search_box").width(50);
    $("#search_form .search_box").children('input').val('');
    $("#search_form .search_box").children('input').addClass('mi_delete');
    $("#search_form").submit();
  });

  // ヘッダーメニューのウェビナー設定を押下した際のイベント
  $("#toggle_webinar_setting").on("click", function (e) {
    // 現在状態が、表示・非表示どちらかで処理を分岐する
    if($(this).find("span.icon-menu-06").length == 1){
      // 非表示なので表示処理を行う
      // アイコンを表示アイコンに変更
      $(this).find("span.icon-menu-06").addClass("icon-menu-07");
      $(this).find("span.icon-menu-06").removeClass("icon-menu-06");
      // オープンセミナーのメニューを表示する
      $("#menu_webinar_setting_default").show();
      $("#menu_webinar_setting_template").show();
    }else{
      // 表示なので非表示処理を行う
      // アイコンを非表示アイコンに変更
      $(this).find("span.icon-menu-07").addClass("icon-menu-06");
      $(this).find("span.icon-menu-07").removeClass("icon-menu-07");
      // オープンセミナーのメニューを非表示する
      $("#menu_webinar_setting_default").hide();
      $("#menu_webinar_setting_template").hide();
    }
  });
  
});

// 電話モーダルmeetin切り替え
function changeMeetinCall() {
  $("#mi_tel_modal").toggleClass("meetin_call");
}

function tel_modal() {
  $("#tel_modal").fadeToggle();
}

$(function () {
  //スライド用
  var s_time = 2600;
  var stop = 4000;
  $(".mi_img_slide_wrap .mi_img_slide_list").eq(0).addClass("is-visible");
  var loop = setInterval(function () {
    $(".mi_img_slide_wrap .mi_img_slide_list").eq(1).addClass("is-visible");
    setTimeout(function () {
      var clone = $(".mi_img_slide_wrap .mi_img_slide_list:first").clone(true);
      clone
        .clone(true)
        .insertAfter($(".mi_img_slide_wrap .mi_img_slide_list:last"));
      $(".mi_img_slide_wrap .mi_img_slide_list:last").removeClass("is-visible");
      $(".mi_img_slide_wrap .mi_img_slide_list:first").remove();
    }, stop - 1000);
  }, stop);
});

// テーブルrowをクリックした時に先頭にcheckを入れる
$(function () {
  $(document).on("click", ".mi_table_main td", function () {
    var inputoj = $(this).parents("tr").find(".mi_table_item_1 input");
    if (inputoj.prop("checked")) {
      inputoj.prop("checked", false);
    } else {
      inputoj.prop("checked", true);
    }
  });
  $(".mi_table_main tr .mi_check_td").on("click", function () {
    var inputoj = $(this).parents("tr").find(".mi_check_td input");
    if (inputoj.prop("checked")) {
      inputoj.prop("checked", false);
    } else {
      inputoj.prop("checked", true);
    }
  });
  $(document).on("click", ".mi_table_main td input", function (e) {
    e.stopPropagation();
  });
  $(".mi_table_main tr > * > *").on("click", function (e) {
    e.stopPropagation();
  });
});



if(!navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/)){
  // 動画をモーダルで表示
  $(function(){
    'use scrict';
    
    //プレイヤー変数
    var player;

    //オブジェクト生成
    function youtubeAPIInit(videoId) {
        var scriptTag = document.createElement('script');
        scriptTag.src = "https://www.youtube.com/iframe_api";
        var fsTag = document.getElementsByTagName('script')[0];
        fsTag.parentNode.insertBefore(scriptTag, fsTag);
        window.onYouTubeIframeAPIReady = function(){
            player = new YT.Player('player', {
                videoId: videoId,
                playerVars:{
                    controls:1,
                    modestbranding:1,
                    iv_load_policy:3,
                    rel:0,
                    autoplay:1
                }
            });
        };
    }

    //モーダル
    var modal = {}, $lay, $content;
    modal.inner = function(videoId) {
        if(!$("#modal-overlay")[0]) {
          $("body").append('<div id="modal-overlay"></div>');
          $lay = $("#modal-overlay");
          $content = $("#modal-content");
          $lay.fadeIn("slow");
        }
        youtubeAPIInit(videoId);
        this.resize();
        $content.fadeIn("fast");
        $lay.unbind().click(function() {
            player.pauseVideo();
            $content.add($lay).fadeOut("fast",function(){
                $lay.remove();
            });
        });
    };

    //リサイズ処理
    modal.resize = function(){
        var $winWidth = $(window).width();
        var $winHeight = $(window).height();
        var $contentOuterWidth = $("#modal-content").outerWidth();
        var $contentOuterHeight = $("#modal-content").outerHeight();
        $("#modal-content").css({
            "left": (($winWidth - $contentOuterWidth) / 2) + "px",
            "top": (($winHeight - $contentOuterHeight) / 2) + "px"
        });
    }

    //クリックイベント処理
    $("[data-video-id]").click(function(){
      var videoId = $(this).data("video-id")
        modal.inner(videoId);
        player.loadVideoById(videoId)
        player.playVideo();
    });
    
    $(window).resize(modal.resize);
  });
}


/*
 * 汎用 メッセージダイアログ
 * String title    タイトル
 * String text     文章 改行は <br>で行える
 * Object option   {z_index:int, stop_event:function }
 */
function makeDefaultAlertDialog(title, text, option) {

  // 重複作成の確認 = 画面全体を覆うダイアログなので２つ.
  if(document.getElementById("mi_alert_dialog_background") !== null) {
    return false;
  }

  // MEMO. デザインを変えたければ idを付与しているので各所スタイルを当ててください.
  let base   = 'mi_alert_dialog_background';
  let dialog = `
    <div id='mi_alert_dialog_area'>
      <div id='mi_alert_dialog_title'>
        ${title}
      </div>
      <div id='mi_alert_dialog_content'>
        ${text}
      </div>
      <div id='mi_alert_dialog_close'>閉じる</div>
    </div>
  `;

  // MEMO. ページ毎にz-index値が違うことからオプションとして引数で取り込めるようにしておく.
  let background_style = null;
  const optionNotNullAndZIndexIsUndefined = option !== null ? option.z_index : undefined;
  if(optionNotNullAndZIndexIsUndefined !== undefined) {
    background_style =  'z-index:'+option.z_index;
  } else {
    background_style =  'z-index:1000'; // default値.
  }

  document.getElementsByTagName('body')[0].insertAdjacentHTML("beforeend", "<div id='"+base+"' style='"+background_style+"'></div>");
  document.getElementById(base).insertAdjacentHTML("beforeend", dialog);

  // 閉じるボタン.
  document.getElementById('mi_alert_dialog_close').addEventListener('click', e => {
    const optionNotNullAndStopEventIsUndefined = option !== null ? option.stop_event : undefined;
    if(optionNotNullAndStopEventIsUndefined != undefined) {
      option.stop_event(); // 閉じる際に実行する Event.
    }
    document.getElementById(base).remove();
  });

  return true;
}

/*
 * 汎用 確認ダイアログ
 * String title    タイトル
 * String text     文章 改行は <br>で行える
 * Object option   {z_index:int, cancel_event:function, submit_event:function,
                    dialog_style:string[split(";")], background_style:string[split(";")],
                    checkbox: string, default_checkbox: boolean,
                   }
 */
function makeDefaultConfirmDialog(title, text, option) {

  // 既にダイアログが出現している状態の場合は 無視する.
  if(document.getElementById("mi_confirm_dialog_background") !== null) {
    return false;
  }

  // オプション z_index: z-indexを操作するオプション.
  let background_styles = [];
  if(typeof (option) !== 'undefined' && typeof (option.z_index) !== 'undefined') {
    background_styles.push('z-index:'+option.z_index);
  } else {
    background_styles.push('z-index:2000'); // default値.
  }

  // オプション background_style: 画面全体を覆う背景CSSを カンマ区切りで外から引き込めるようにしている.
  if(typeof (option) !== 'undefined' && typeof (option.background_style) !== 'undefined') {
    background_styles.push(option.background_style);
  }

  // オプション dialog_style: ダイアログボックスCSSを カンマ区切りで外から引き込めるようにしている.
  let dialog_style = null;
  if(typeof (option) !== 'undefined' && typeof (option.dialog_style) !== 'undefined') {
    dialog_style = option.dialog_style;
  }

  // オプション checkbox
  let checkbox = "";
  if(typeof (option) !== 'undefined' && typeof (option.checkbox) !== 'undefined') {

    // 初期状態から チェックを入れておくか.
    let default_checkstatus = "";
    if(typeof (option) !== 'undefined' && typeof (option.default_checkbox) !== 'undefined' && option.default_checkbox) {
      default_checkstatus = 'checked="checked"';
    }
    checkbox = `<div id='mi_confirm_dialog_checkbox'><label><input type="checkbox" id="mi_confirm_dialog_checkbox_val" ${default_checkstatus}><span id="mi_confirm_dialog_checkbox_text">${option.checkbox}<span></label></div>`;
  }

  let base   = 'mi_confirm_dialog_background';
  let dialog = `
    <div id='mi_confirm_dialog_area' style="${dialog_style}">
      <div id='mi_confirm_dialog_title'>
        ${title}
      </div>
      <div id='mi_confirm_dialog_content'>
        ${text}
      </div>
      ${checkbox}
      <div id='mi_confirm_dialog_button_area'>
        <div id='mi_confirm_dialog_cancel'>キャンセル</div>
        <div id='mi_confirm_dialog_submit'>OK</div>
      </div>

    </div>
  `;
  document.getElementsByTagName('body')[0].insertAdjacentHTML("beforeend", "<div id='"+base+"' style='"+background_styles.join(';')+"'></div>");
  document.getElementById(base).insertAdjacentHTML("beforeend", dialog);


  // キャンセル処理.
  document.getElementById('mi_confirm_dialog_cancel').addEventListener('click', e => {
    if(typeof (option) !== 'undefined' && typeof (option.cancel_event) !== 'undefined') {
      option.cancel_event(); //  イベント追加可能.
    }
    document.getElementById(base).remove();
  });
  // 実行処理.
  document.getElementById('mi_confirm_dialog_submit').addEventListener('click', e => {
    let isRemove = true;
    if(typeof (option) !== 'undefined' && typeof (option.submit_event) !== 'undefined') {
      isRemove = option.submit_event(); //  イベント追加可能.
    }
    // MEMO. submit_event() でバリデーションを行う想定で、return値がfalseの場合 ダイアログを閉じず開いたままにしている.
    if (isRemove || ['undefined','function'].indexOf(typeof(isRemove)) > -1) {
      document.getElementById(base).remove();
    }
  });

  return true;
}



$(function () {
  // MEETINタブ押下時のイベント
  $("#tab_meetin_room").on('click', function() {
    // 自身にカレントクラス追加
    $(this).addClass("current_room_content_tab");
    // 自身のアイコンにカレントクラス追加
    $(this).find(".room_content_tab_icon").addClass("current_room_content_tab_icon");
    // ウェビナーのタブのカレントクラスを削除
    $("#tab_webinar_room").removeClass("current_room_content_tab");
    // ウェビナーアイコンのカレントクラス削除
    $("#tab_webinar_room").find(".room_content_tab_icon").removeClass("current_room_content_tab_icon");
    // ウェビナールーム作成領域非表示
    $("#webinar_room_content").hide();
    // MEETINルーム作成領域表示
    $("#meetin_room_content").show();
  });
  // ウェビナータブ押下時のイベント
  $("#tab_webinar_room").on('click', function() {
    // 自身にカレントクラス追加
    $(this).addClass("current_room_content_tab");
    // 自身のアイコンにカレントクラス追加
    $(this).find(".room_content_tab_icon").addClass("current_room_content_tab_icon");
    // MEETINのタブのカレントクラスを削除
    $("#tab_meetin_room").removeClass("current_room_content_tab");
    // MEETINアイコンのカレントクラス削除
    $("#tab_meetin_room").find(".room_content_tab_icon").removeClass("current_room_content_tab_icon");
    // MEETINルーム作成領域非表示
    $("#meetin_room_content").hide();
    // ウェビナールーム作成領域表示
    $("#webinar_room_content").show();
  });
  /**
   * ウェビナー入場ボタンクリック
   */
  $('#connect_webinar_room').on('click', function() {
    let room_name = $("#room_webinar_name").val();
    connectWebianrRoom(room_name);
  });
  $(function(){
    $('#connect_webinar_room').keypress(function(event){
      if(event.keyCode === 13) {
        let room_name = $("#room_webinar_name").val();
        connectWebianrRoom(room_name);
      }
    })
  });
  /**
   * ウェビナー（オープンセミナー）入場ボタン処理
   */
  function connectWebianrRoom(openSeminarName){
    // 空欄or半角英数32文字以外はエラー
    if(openSeminarName.length === 0) {
      $(".webinar_connect_alert").text("ルーム名は未入力です");
      $(".webinar_connect_alert").show();
      setTimeout(function(){
        $(".webinar_connect_alert").fadeOut("slow");
        },1500);
      return;
    }
    if(!openSeminarName.match(/^[0-9a-zA-Z\-_]{1,32}$/)) {
      $(".webinar_connect_alert").text("ルーム名は半角英数字、アンダーバー(_)、ハイフン(-)で32文字以内で入力して下さい");
      $(".webinar_connect_alert").show();
      setTimeout(function(){
        $(".webinar_connect_alert").fadeOut("slow");
      },1500);
      return;
    }
    // テンプレートを取得
    let templateId = $("[name=select_webinar_template]").val();
    // 上限チェック
    $.ajax({
      url: '/api/publisher-open-seminar',
      type: 'POST',
      dataType: 'json',
      data: {
        openSeminarName: openSeminarName, templateId : templateId
      }
    }).done(function(res) {
      if(res.status == 1){
        // ウェビナーへリダイレクトする
        window.location.href = res.url;
      }else{
        // エラーを表示する
        let message = "";
        for (let i = 0; i < res.errorList.length; i++) {
          message += res.errorList[i];
          if((i+1) < res.errorList[i].length){
            message += "<br>";
          }
        }
        $(".webinar_connect_alert").html(message);
        $(".webinar_connect_alert").show();
      }
    }).fail(function() {
      // ロック状態
      $(".webinar_connect_alert").text("通信エラー");
      $(".webinar_connect_alert").show();
    });
  }
});