$(function() {

    // メンバー画像のサイズ調整
    let imgWidth = $('.meeting__members--item').width();
    $('.meeting__members--img').css({'height': imgWidth + 'px'});
  
    // トップ人画像表示サンプル
    $('#onePerson').on('click', function() {
      $('#twoPersons').show('scale', {percent: 100}, 900);
      $('#meeting__members--wrap').addClass('threePersons');
    });
    $('#twoPersons').on('click', function() {
      $('#threePersons').show('scale', {percent: 100}, 900);
      $('#meeting__members--wrap').removeClass('threePersons');
      $('#meeting__members--wrap').addClass('fourPersons');
    });
    $('#threePersons').on('click', function() {
      $('#fourPersons').show('scale', {percent: 100}, 900);
      $('#meeting__members--wrap').removeClass('fourPersons');
      $('#meeting__members--wrap').addClass('fivePersons');
    });
    $('#fourPersons').on('click', function() {
      $('#fivePersons').show('scale', {percent: 100}, 900);
      $('#meeting__members--wrap').removeClass('fivePersons');
      $('#meeting__members--wrap').addClass('sixPersons');
    });
    $('#fivePersons').on('click', function() {
      $('#twoPersons, #threePersons, #fourPersons, #fivePersons').hide();
      $('#meeting__members--wrap').removeClass('sixPersons');
    });
  
    // 複数人表示モード切り替え
    $('#change_multiMember').on('click', function() {
      if($(this).hasClass('multi_member')) {
        $(this).removeClass('multi_member');
        $('.second_person, .third_person, .fourth_person, .fifth_person, .sixth_person').css({'width':'0', 'height':'0', 'opacity':'0'});
        $('.first_person').css({'width':'100%', 'height':'100%'});
        if($('#change_video').hasClass('off')  == false) {
          $('.meeting__members--wrap').show();
        }
      } else if($('#meeting__members--wrap').hasClass('sixPersons')) {
        $('.meeting__members--wrap').hide();
        $('.first_person, .second_person, .third_person, .fourth_person, .fifth_person, .sixth_person').css({'width':'50%', 'height':'33.3%', 'opacity':'1'});
        $(this).addClass('multi_member');
      } else if($('#meeting__members--wrap').hasClass('fivePersons')) {
        $('.meeting__members--wrap').hide();
        $('.first_person, .second_person, .third_person, .fourth_person, .fifth_person').css({'width':'50%', 'height':'33.3%', 'opacity':'1'});
        $(this).addClass('multi_member');
      } else if($('#meeting__members--wrap').hasClass('fourPersons')) {
        $('.meeting__members--wrap').hide();
        $('.first_person, .second_person, .third_person, .fourth_person').css({'width':'50%', 'height':'50%', 'opacity':'1'});
        $(this).addClass('multi_member');
      } else if($('#meeting__members--wrap').hasClass('threePersons')) {
        $('.meeting__members--wrap').hide();
        $('.first_person, .second_person, .third_person').css({'width':'100%', 'height':'33.3%', 'opacity':'1'});
        $(this).addClass('multi_member');
      } else {
        $('.meeting__members--wrap').hide();
        $('.first_person, .second_person').css({'width':'100%', 'height':'50%', 'opacity':'1'});
        $(this).addClass('multi_member');
      }
    });
  
    // サイドバーボタンの切り替え
    $('#meeting__menuBtn').on('click', function() {
      $(this).next().stop().slideToggle();
      $('#meeting__sidebar').toggleClass('open');
      if($('#meeting__sidebar').hasClass('open')) {
        $(this).children('img').attr('src', '../img/png/x_btn.png');
      } else {
        setTimeout(function(){
          $('#meeting__menuBtn').children('img').attr('src', '../img/png/transmission_logo.png');
        }, 350);
      }
      return false;
    });
  
    // サイドバーミュートボタンの切り替え
    $('#change_sidebarMute').on('click', function() {
      $(this).toggleClass('sidebarMute');
      if($(this).hasClass('sidebarMute')) {
        $(this).attr('src', '../img/png/unmute.png');
      } else {
        $(this).attr('src', '../img/png/mute.png');
      }
    });
  
    // VideoのONOFFの切り替え
    $('#change_video').on('click', function() {
      $(this).toggleClass('off');
      if($(this).hasClass('off')) {
        $(this).attr('src', '../img/png/movie.png');
        $('.first_person').attr('src', '../img/png/video_off.png');
        $('#meeting__members--wrap').hide();
      } else {
        $(this).attr('src', '../img/png/unmovie.png');
        $('.first_person').attr('src', '../img/png/full_screen_onePerson.png');
        if($('#change_multiMember').hasClass('multi_member') == false) {
          $('#meeting__members--wrap').show();
        }
      }
    });
  
    // ミュートボタンのONOFFの切り替え
    $('#change_mute').on('click', function() {
      $(this).toggleClass('mute');
      if($(this).hasClass('mute')) {
        $(this).attr('src', '../img/png/mike.png');
      } else {
        $(this).attr('src', '../img/png/unmike.png');
      }
    });
  
    // チャット画面の切り替え
    $('#change_chat').on('click', function() {
      $('#meeting__wrap').hide();
      $('#content__wrap').css('background-color', '#878787');
      $('.full_screen__wrap').css({'filter':'blur(15px)', 'opacity':'0.6'});
      $('#chat__wrap').show();
    });
  
    $('#chat__return').on('click', function() {
      $('#chat__wrap').hide();
      $('#content__wrap').css('background-color', '');
      $('.full_screen__wrap').css({'filter':'', 'opacity':''});
      $('#meeting__wrap').show();
    });
  
    // チャットコメント入力エリアの出現
    $('#chat__addComment').on('click', function() {
      $('#chat__footer').toggleClass('open');
      if($('#chat__footer').hasClass('open')) {
        $('.chat__footer').css('height', '140px');
        $('.chat__textArea').show();
      } else {
        $('.chat__textArea').hide();
        $('.chat__footer').css('height', '50px');
      }
      return false;
    });
  
    // ペイント画面の切り替え
    $('#change_paint').on('click', function() {
      $('#content__wrap').css('background-color', '#000000');
      $('.full_screen__wrap').css('opacity', '0.4');
      $('#chat__paint').show();
      let colorWidth = $('.color__white').width();
      $('.color__white, .color__green, .color__yellow, .color__red, .color__blue').css({'height': colorWidth + 'px'});
    });
  
    $('#paint_done').on('click', function() {
      $('#content__wrap').css('background-color', '');
      $('.full_screen__wrap').css('opacity', '');
      $('#chat__paint').hide();
    });
  
  });
  