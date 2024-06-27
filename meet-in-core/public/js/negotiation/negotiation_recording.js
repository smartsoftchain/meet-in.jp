/**
 * // Apowersoft画面録画ソフトAPI 操作系JS
 */


// apowerSoft API KEY
const API_KEY = getApowerSoftApiKey();

// apowerSoft config
var apowerScreenRecorderConfig = {
  // Apowersoft画面録画ソフトAPI
  key:getApowerSoftApiKey(), // Key
  "recaudioinput": "3", // デフォルトで「システムサウンドとマイク」を選択にする用
  "uishowads": "0",// 広告消す用
};


$(document).ready(function() {
  if ($('.start-screen-recording').css('display') !== 'none') {
    // API利用型に見た目を整える処理
    setDisplayOfRecordApiMethod();
  }
});

// 録画APIのときに、見た目等を整える処理
function setDisplayOfRecordApiMethod() {
  var api_call_cnt = 0;
  var recordApiStyleChange = setInterval(function() {
    // 20回繰り返してApowersoftからのレスポンスがなければ録画エリアごと非表示のまま
    if (api_call_cnt < 20) {
      // レスポンスの判断はapower-powerbyがついた要素の有無
      if ($('.start-screen-recording').children().hasClass('apower-powerby')) {
        // 録画APIで、rec-dotなど不要なものを見えなくして、現行デザインに見た目を寄せる処理
        $("#record_method_api").css('display', '');
        $('.exit_record_caution_message').css('display', '');
        $('.start-screen-recording').find('.apower-powerby').remove();
        $('.rec-dot').css('display', 'none');
        $('.rec-dot').closest('div').css('display', 'none');
      
        const spanElement = `<span class="icon-rec mi_default_label_icon_2"></span><span class="record_label"></span>`;
        $('.start-screen-recording').append(spanElement);
      
        // 録画API方式のユーザーであったとしても、ipad PC chromebookの場合は使用できないため、表示を変える 
        if (USER_PARAM_IS_IPAD_PC || USER_PARAM_IS_CHROME_BOOK) {
          $('.start-screen-recording').css('display', 'none');
          $('.exit_record_caution_message').css('display', 'none');
        } else {
          // Mac safari用の見た目調整処理
          let classNameForSafari = '';
          if (getBrowserType() == 'Safari') {
            classNameForSafari = 'record_label_for_safari';
            $('.record_label').addClass(classNameForSafari);
            $('.record_label').removeClass('record_label');
          }
        }
        if ($('.exit_record_caution_message').css('display') !== 'none' && $('.exit_record_caution_message').length > 0) {
          //新録画APIのときに、退出モーダルのスタイルを整える
          $('.exit_modal_message_wrap').css("height", 260);
          $('.exit_message').css("margin-bottom", 26);
        }
        clearInterval(recordApiStyleChange);
      } else {
        api_call_cnt++;
      }
    } else {
      // 20回繰り返してもAPIのレスポンスがない場合は処理を終了、録画エリア非表示のままにする
      clearInterval(recordApiStyleChange);
    }
  },500);
}

// ルーム内ログインして、録画APIの場合（record_method_type = 1）に、録画APIを使用可能な状態にして、見た目等を整える処理
function setRecordApiInRoomLogin() {
    // API呼び出しsrc設定
    $('#apower_screen_recorder').attr('src', '//api.aoscdn.com/screen-recorder?lang=ja');

    // API利用型に見た目を整える処理
    setDisplayOfRecordApiMethod(); 
}



