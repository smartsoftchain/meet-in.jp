/*
 * 電子契約に使用するJS群
 *
 * */
$(function() {

  // 初期表示設定
  $('#inputs').hide();

  // 契約金額表示
  $('#amount_row').hide();
  $('input[name="have_amount"]:radio').on('change', function() {
    var val = $(this).val();
    if(val == 1) {
      $('#amount_row').show();
      $('#amount').prop('disabled', false);
    } else {
      $('#amount_row').hide();
      $('#amount').prop('disabled', true);
    }
  });

  // ホストの場合、partner電話番号、認証コードを入力できないようにする
  if($('#client_id').val() != 0) {
    $('.sign-text-note').text('※ 認証コードはゲスト側で入力をお願いいたします。');
    $('#password').attr('readonly', true);
    $('#password').css('background-color', '#efefef');
    $('#password').attr('type', 'password');

    $('.authorization-code-note').text('※電話番号はゲスト側で入力をお願いいたします。');
    $('#tel').attr('readonly', true);
    $('#tel').css('background-color', '#efefef');
    $('#tel').attr('type', 'password');
  } else {
    $('.sign-text-note').text('認証コードを設定してください。作成した電子契約を閲覧したいときに使います。');
    $('.authorization-code-note').text('ルーム内で契約を完了させたい場合は、電話番号を入力して認証するを押下してください。');
    $('#authorization-code').append('<span id="send-tel" class="partner_setting_send_code">認証する</span>');
  }

  // テンプレート名選択時のテキスト共有
  $('#e_contract_document_id').on('change', function() {
    var data = {
      command : "E_CONTRACT",
      type : "SEND_DOCUMENT_NAME",
      documentName : $("option:selected", this).text()
    };
    sendCommand(SEND_TARGET_ALL, data);
  });

  // 認証するクリックでSmart-in APIを叩いて、パートナーフォームを固定する
  $(document).on('click', '#send-tel', function() {
    var partner = $(this).parents('.partner_setting_input_area');
    var lastname = partner.find("[name^='lastname']").val();
    var firstname = partner.find("[name^='firstname']").val();
    var email = partner.find("[name^='email']").val();
    var password = partner.find("[name^='password']").val();
    var tel = partner.find("[name^='tel']").val();
    $('.form_setting_error').remove();

    // 氏名、メールアドレス、認証コード、電話番号が不正の場合はバリデーション
    if(lastname != '' && firstname != '' && email != '' && password != '' && tel) {
      var errorCount = 0;
      if(password.match(/^[A-Za-z0-9]{8,}$/) == null) {
        $('.e_contract_title_area').append('<div class="form_setting_error">認証コードが不適切です</div>');
        errorCount++;
      }
      if(tel.match(/^[0-9]{11}$/) == null) {
        $('.e_contract_title_area').append('<div class="form_setting_error">電話番号が不適切です</div>');
        errorCount++;
      }
      if(errorCount != 0) {
        $('html, body').animate({scrollTop:0});
        return false;
      }

      // Smart inAPIを叩く
      var auth_cnt = 15; // 認証のリトライを行う回数
      var data = {
        tel: tel
      }
      var timer = setInterval(function () {
        $.ajax({
          url: "/e-contract-api/pre-call-auto",
          type: "POST",
          dataType: "json",
          data: data
        }).done(function(res) {
          if (res.result === "0") {
            // 戻ってきたtokenをidに入れて保管
            var token = res.token;
            partner.find('#token').val(token);
            // e_contract_authorizationを登録
            var data = {
              tel:   tel,
              token: token
            }
            $.ajax({
              url: "/e-contract-api/create-authorization",
              type: "POST",
              dataType: "json",
              data: data
            }).done(function(res) {
              // 050番号にかけるようにメッセージを表示
              partner.find('.tel-note').remove();
              partner.append('<p class="tel-note">上記番号から050-5213-3059にかけてください。<br>認証が成功すると自動で電話が切れます。</p>')
              // 氏名、企業名、役職、メールアドレス、認証コード、承認順を固定する
              partner.find("[name^='lastname']").attr('readonly', true);
              partner.find("[name^='lastname']").css('background-color', '#efefef');
              partner.find("[name^='firstname']").attr('readonly', true);
              partner.find("[name^='firstname']").css('background-color', '#efefef');
              partner.find("[name^='organization_name']").attr('readonly', true);
              partner.find("[name^='organization_name']").css('background-color', '#efefef');
              partner.find("[name^='title']").attr('readonly', true);
              partner.find("[name^='title']").css('background-color', '#efefef');
              partner.find("[name^='email']").attr('readonly', true);
              partner.find("[name^='email']").css('background-color', '#efefef');
              partner.find("[name^='password']").attr('readonly', true);
              partner.find("[name^='password']").css('background-color', '#efefef');
              // partner.parent().find('#partner-remove').remove();
              // partner.find('.partner_setting_item_lifting').remove();
              // 他ユーザーのidにtokenを保存とフォーム固定を同期する
              var areaIndex = partner.parent().index();
              var data = {
                command : "E_CONTRACT",
                type : "PARTNER_FIX",
                index : areaIndex,
                token : token
              };
              sendCommand(SEND_TARGET_ALL, data);
            }).fail(function(res) {
            })
            clearInterval(timer);
            return;

          } else {
            if (res.result === "9") {
              // ゲストが連続して同じ電話番号を使った場合、一定期間応答がなくなるためメッセージ表示
              auth_cnt -= 1;
              if (auth_cnt == 0) {
                // 認証タイムアウト
                partner.append('<p class="tel-note" style="color: red;">認証に失敗しました。数分お時間をあけてからお試しください。</p>')
                clearInterval(timer);
                return;
              }
            }
          }
        }).fail(function(res) {
          $('.e_contract_title_area').append('<div class="form_setting_error">接続に失敗しました。</div>');
          partner.append('<p class="tel-note">接続に失敗しました。</p>')
          clearInterval(timer);
          return;
        })
      }, 2000); // 2秒ごとにサーバへ問い合わせる　（リトライ回数と合わせて、この場合30秒待つこととなる）
    } else {
      $('.e_contract_title_area').append('<div class="form_setting_error">宛先の必須項目を入力してください</div>');
      $('html, body').animate({scrollTop:0});
    }
  });

  // 追加ボタンをクリックしてパートナーフォームを追加する
  $('#partner-add').on('click', function() {
    var i = $('.partner_setting_item').length + 1;
    if($('#client_id').val() == 0) {
      $('#partner-area').append('<div class="partner_setting_item"><div class="partner_setting_item_header"><p><span class="icon-parsonal"></span><span class="partner_setting_item_count">' + i + '人目</span>：' + i + '番目に契約書にサインを行う人</p><div id="partner-remove" class="partner_setting_item_remove">×</div></div><div class="partner_setting_input_area"><div class="partner_setting_input_row"><label>氏名<span class="require">必須</span></label><input type="text" name="lastname' + i + '" class="partner_setting_input_name lastname e_contract_info_text" placeholder="田中"><input type="text" name="firstname' + i + '" class="partner_setting_input_name firstname e_contract_info_text" placeholder="太郎"></div><div class="partner_setting_input_row"><label>企業名</label><input type="text" name="organization_name' + i + '" placeholder="入力してください" class="partner_setting_input organization_name e_contract_info_text"></div><div class="partner_setting_input_row"><label>役職</label><input type="text" name="title' + i + '" placeholder="入力してください" class="partner_setting_input title e_contract_info_text"></div><div class="partner_setting_input_row"><label>メールアドレス<span class="require">必須</span></label><input type="email" name="email' + i + '" placeholder="aaaaa@aaaaa.jp" class="partner_setting_input email e_contract_info_text"></div><div class="partner_setting_input_row"><label>認証コード<span class="note">（8文字以上の半角英数字）</span><span class="require">必須</span></label><p class="sign-text-note">認証コードを設定してください。作成した電子契約を閲覧したいときに使います。</p><input type="text" id="password" name="password' + i + '" class="partner_setting_input_name password e_contract_info_text"></div><div id="authorization-code" class="partner_setting_input_row"><label>電話番号<span class="note">（ハイフンなし）</span></label><p class="authorization-code-note">ルーム内で契約を完了させたい場合は、電話番号を入力して認証するを押下してください。</p><input type="number" id="tel" name="tel' + i + '" class="partner_setting_input_name e_contract_info_text"><span id="send-tel" class="partner_setting_send_code">認証する</span></div><input type="hidden" name="token' + i + '" id="token" class="token" value=""><div class="partner_setting_item_lifting"><p class="partner_setting_item_lifting_label">承認順の変更</p><div class="partner_setting_item_lifting_btnarea"><div id="approval_down" class="partner_setting_item_lifting_btn">▼</div><div id="approval_up" class="partner_setting_item_lifting_btn">▲</div></div></div></div></div>');
    } else {
      $('#partner-area').append('<div class="partner_setting_item"><div class="partner_setting_item_header"><p><span class="icon-parsonal"></span><span class="partner_setting_item_count">' + i + '人目</span>：' + i + '番目に契約書にサインを行う人</p><div id="partner-remove" class="partner_setting_item_remove">×</div></div><div class="partner_setting_input_area"><div class="partner_setting_input_row"><label>氏名<span class="require">必須</span></label><input type="text" name="lastname' + i + '" class="partner_setting_input_name lastname e_contract_info_text" placeholder="田中"><input type="text" name="firstname' + i + '" class="partner_setting_input_name firstname e_contract_info_text" placeholder="太郎"></div><div class="partner_setting_input_row"><label>企業名</label><input type="text" name="organization_name' + i + '" placeholder="入力してください" class="partner_setting_input organization_name e_contract_info_text"></div><div class="partner_setting_input_row"><label>役職</label><input type="text" name="title' + i + '" placeholder="入力してください" class="partner_setting_input title e_contract_info_text"></div><div class="partner_setting_input_row"><label>メールアドレス<span class="require">必須</span></label><input type="email" name="email' + i + '" placeholder="aaaaa@aaaaa.jp" class="partner_setting_input email e_contract_info_text"></div><div class="partner_setting_input_row"><label>認証コード<span class="note">（8文字以上の半角英数字）</span><span class="require">必須</span></label><p class="sign-text-note">※ 認証コードはゲスト側で入力をお願いいたします。</p><input type="password" id="password" name="password' + i + '" class="partner_setting_input_name password e_contract_info_text" readonly style="background-color: rgb(239, 239, 239);"></div><div id="authorization-code" class="partner_setting_input_row"><label>電話番号<span class="note">（ハイフンなし）</span></label><p class="authorization-code-note">※電話番号はゲスト側で入力をお願いいたします。</p><input type="password" id="tel" name="tel' + i + '" class="partner_setting_input_name e_contract_info_text" readonly style="background-color: rgb(239, 239, 239);"></div><input type="hidden" name="token' + i + '" id="token" class="token" value=""><div class="partner_setting_item_lifting"><p class="partner_setting_item_lifting_label">承認順の変更</p><div class="partner_setting_item_lifting_btnarea"><div id="approval_down" class="partner_setting_item_lifting_btn">▼</div><div id="approval_up" class="partner_setting_item_lifting_btn">▲</div></div></div></div></div>');
    }

    // 画面共有
    var data = {
       command : "E_CONTRACT",
       type : "PARTNER_ADD",
       index : i
    };
    sendCommand(SEND_TARGET_ALL, data);
  });

  // 承認順を上げる
  $(document).on('click', '#approval_up', function() {
    var inputArea = $(this).parents('.partner_setting_input_area');
    var clientId = $('#client_id').val();
    if(inputArea.find("[name^='lastname']").attr('readonly') == 'readonly') {
      var authFlg = true;
    } else {
      var authFlg = false;
    }
    if(inputArea.find("[name^='password']").attr('readonly') == 'readonly') {
      var passAuthFlg = true;
    } else {
      var passAuthFlg = false;
    }
    if(inputArea.find("[name^='tel']").attr('readonly') == 'readonly') {
      var telAuthFlg = true;
    } else {
      var telAuthFlg = false;
    }
    var lastName = inputArea.find("[name^='lastname']").val();
    var firstName = inputArea.find("[name^='firstname']").val();
    var organizationName = inputArea.find("[name^='organization_name']").val();
    var title = inputArea.find("[name^='title']").val();
    var email = inputArea.find("[name^='email']").val();
    var password = inputArea.find("[name^='password']").val();
    var tel = inputArea.find("[name^='tel']").val();
    var token = inputArea.find("#token").val();

    var preArea = $(this).parents('.partner_setting_item').prev();
    if(preArea.find("[name^='lastname']").attr('readonly') == 'readonly') {
      var preAuthFlg = true;
    } else {
      var preAuthFlg = false;
    }
    if(preArea.find("[name^='password']").attr('readonly') == 'readonly') {
      var prePassAuthFlg = true;
    } else {
      var prePassAuthFlg = false;
    }
    if(preArea.find("[name^='tel']").attr('readonly') == 'readonly') {
      var preTelAuthFlg = true;
    } else {
      var preTelAuthFlg = false;
    }
    var preLastName = preArea.find("[name^='lastname']").val();
    var preFirstName = preArea.find("[name^='firstname']").val();
    var preOrganizationName = preArea.find("[name^='organization_name']").val();
    var preTitle = preArea.find("[name^='title']").val();
    var preEmail = preArea.find("[name^='email']").val();
    var prePassword = preArea.find("[name^='password']").val();
    var preTel = preArea.find("[name^='tel']").val();
    var preToken = preArea.find("#token").val();

    inputArea.find("[name^='lastname']").val(preLastName);
    inputArea.find("[name^='firstname']").val(preFirstName);
    inputArea.find("[name^='organization_name']").val(preOrganizationName);
    inputArea.find("[name^='title']").val(preTitle);
    inputArea.find("[name^='email']").val(preEmail);
    inputArea.find("[name^='password']").val(prePassword);
    inputArea.find("[name^='tel']").val(preTel);
    if(preAuthFlg == true) {
      inputArea.find("[name^='lastname']").attr('readonly', true);
      inputArea.find("[name^='lastname']").css('background-color', '#efefef');
      inputArea.find("[name^='firstname']").attr('readonly', true);
      inputArea.find("[name^='firstname']").css('background-color', '#efefef');
      inputArea.find("[name^='organization_name']").attr('readonly', true);
      inputArea.find("[name^='organization_name']").css('background-color', '#efefef');
      inputArea.find("[name^='title']").attr('readonly', true);
      inputArea.find("[name^='title']").css('background-color', '#efefef');
      inputArea.find("[name^='email']").attr('readonly', true);
      inputArea.find("[name^='email']").css('background-color', '#efefef');
      inputArea.find("#token").val(preToken);
      inputArea.find('.tel-note').remove();
      if(clientId == 0) {
        inputArea.find('#authorization-code').append('<p class="tel-note">上記番号から050-5213-3059にかけてください。<br>認証が成功すると自動で電話が切れます。</p>');
      } else {
        inputArea.find('#authorization-code').append('<p class="tel-note">ただいま承認中</p>');
      }
    } else {
      inputArea.find("[name^='lastname']").attr('readonly', false);
      inputArea.find("[name^='lastname']").css('background-color', '#fff');
      inputArea.find("[name^='firstname']").attr('readonly', false);
      inputArea.find("[name^='firstname']").css('background-color', '#fff');
      inputArea.find("[name^='organization_name']").attr('readonly', false);
      inputArea.find("[name^='organization_name']").css('background-color', '#fff');
      inputArea.find("[name^='title']").attr('readonly', false);
      inputArea.find("[name^='title']").css('background-color', '#fff');
      inputArea.find("[name^='email']").attr('readonly', false);
      inputArea.find("[name^='email']").css('background-color', '#fff');
      inputArea.find("#token").val('');
      inputArea.find('.tel-note').remove();
    }
    if(prePassAuthFlg == true) {
      inputArea.find("[name^='password']").attr('readonly', true);
      inputArea.find("[name^='password']").css('background-color', '#efefef');
    } else {
      inputArea.find("[name^='password']").attr('readonly', false);
      inputArea.find("[name^='password']").css('background-color', '#fff');
    }
    if(preTelAuthFlg == true) {
      inputArea.find("[name^='tel']").attr('readonly', true);
      inputArea.find("[name^='tel']").css('background-color', '#efefef');
    } else {
      inputArea.find("[name^='tel']").attr('readonly', false);
      inputArea.find("[name^='tel']").css('background-color', '#fff');
    }

    preArea.find("[name^='lastname']").val(lastName);
    preArea.find("[name^='firstname']").val(firstName);
    preArea.find("[name^='organization_name']").val(organizationName);
    preArea.find("[name^='title']").val(title);
    preArea.find("[name^='email']").val(email);
    preArea.find("[name^='password']").val(password);
    preArea.find("[name^='tel']").val(tel);
    if(authFlg == true) {
      preArea.find("[name^='lastname']").attr('readonly', true);
      preArea.find("[name^='lastname']").css('background-color', '#efefef');
      preArea.find("[name^='firstname']").attr('readonly', true);
      preArea.find("[name^='firstname']").css('background-color', '#efefef');
      preArea.find("[name^='organization_name']").attr('readonly', true);
      preArea.find("[name^='organization_name']").css('background-color', '#efefef');
      preArea.find("[name^='title']").attr('readonly', true);
      preArea.find("[name^='title']").css('background-color', '#efefef');
      preArea.find("[name^='email']").attr('readonly', true);
      preArea.find("[name^='email']").css('background-color', '#efefef');
      preArea.find("#token").val(token);
      preArea.find('.tel-note').remove();
      if(clientId == 0) {
        preArea.find('#authorization-code').append('<p class="tel-note">上記番号から050-5213-3059にかけてください。<br>認証が成功すると自動で電話が切れます。</p>');
      } else {
        preArea.find('#authorization-code').append('<p class="tel-note">ただいま承認中</p>');
      }
    } else {
      preArea.find("[name^='lastname']").attr('readonly', false);
      preArea.find("[name^='lastname']").css('background-color', '#fff');
      preArea.find("[name^='firstname']").attr('readonly', false);
      preArea.find("[name^='firstname']").css('background-color', '#fff');
      preArea.find("[name^='organization_name']").attr('readonly', false);
      preArea.find("[name^='organization_name']").css('background-color', '#fff');
      preArea.find("[name^='title']").attr('readonly', false);
      preArea.find("[name^='title']").css('background-color', '#fff');
      preArea.find("[name^='email']").attr('readonly', false);
      preArea.find("[name^='email']").css('background-color', '#fff');
      preArea.find("#token").val('');
      preArea.find('.tel-note').remove();
    }
    if(passAuthFlg == true) {
      preArea.find("[name^='password']").attr('readonly', true);
      preArea.find("[name^='password']").css('background-color', '#efefef');
    } else {
      preArea.find("[name^='password']").attr('readonly', false);
      preArea.find("[name^='password']").css('background-color', '#fff');
    }
    if(telAuthFlg == true) {
      preArea.find("[name^='tel']").attr('readonly', true);
      preArea.find("[name^='tel']").css('background-color', '#efefef');
    } else {
      preArea.find("[name^='tel']").attr('readonly', false);
      preArea.find("[name^='tel']").css('background-color', '#fff');
    }

    // 画面共有
    var areaIndex = $(this).parents('.partner_setting_item').index();
    var data = {
       command : "E_CONTRACT",
       type : "APPROVAL_UP",
       index : areaIndex
    };
    sendCommand(SEND_TARGET_ALL, data);
  });

  // 承認順を下げる
  $(document).on('click', '#approval_down', function() {
    var areaCount = $('.partner_setting_item').length;
    var areaIndex = $(this).parents('.partner_setting_item').index();
    if(areaCount == areaIndex + 1) {
      return false;
    }

    var inputArea = $(this).parents('.partner_setting_input_area');
    var clientId = $('#client_id').val();
    if(inputArea.find("[name^='lastname']").attr('readonly') == 'readonly') {
      var authFlg = true;
    } else {
      var authFlg = false;
    }
    if(inputArea.find("[name^='password']").attr('readonly') == 'readonly') {
      var passAuthFlg = true;
    } else {
      var passAuthFlg = false;
    }
    if(inputArea.find("[name^='tel']").attr('readonly') == 'readonly') {
      var telAuthFlg = true;
    } else {
      var telAuthFlg = false;
    }
    var lastName = inputArea.find("[name^='lastname']").val();
    var firstName = inputArea.find("[name^='firstname']").val();
    var organizationName = inputArea.find("[name^='organization_name']").val();
    var title = inputArea.find("[name^='title']").val();
    var email = inputArea.find("[name^='email']").val();
    var password = inputArea.find("[name^='password']").val();
    var tel = inputArea.find("[name^='tel']").val();
    var token = inputArea.find("#token").val();

    var nextArea = $(this).parents('.partner_setting_item').next();
    if(nextArea.find("[name^='lastname']").attr('readonly') == 'readonly') {
      var nextAuthFlg = true;
    } else {
      var nextAuthFlg = false;
    }
    if(nextArea.find("[name^='password']").attr('readonly') == 'readonly') {
      var nextPassAuthFlg = true;
    } else {
      var nextPassAuthFlg = false;
    }
    if(nextArea.find("[name^='tel']").attr('readonly') == 'readonly') {
      var nextTelAuthFlg = true;
    } else {
      var nextTelAuthFlg = false;
    }
    var nextLastName = nextArea.find("[name^='lastname']").val();
    var nextFirstName = nextArea.find("[name^='firstname']").val();
    var nextOrganizationName = nextArea.find("[name^='organization_name']").val();
    var nextTitle = nextArea.find("[name^='title']").val();
    var nextEmail = nextArea.find("[name^='email']").val();
    var nextPassword = nextArea.find("[name^='password']").val();
    var nextTel = nextArea.find("[name^='tel']").val();
    var nextToken = nextArea.find("#token").val();

    inputArea.find("[name^='lastname']").val(nextLastName);
    inputArea.find("[name^='firstname']").val(nextFirstName);
    inputArea.find("[name^='organization_name']").val(nextOrganizationName);
    inputArea.find("[name^='title']").val(nextTitle);
    inputArea.find("[name^='email']").val(nextEmail);
    inputArea.find("[name^='password']").val(nextPassword);
    inputArea.find("[name^='tel']").val(nextTel);
    if(nextAuthFlg == true) {
      inputArea.find("[name^='lastname']").attr('readonly', true);
      inputArea.find("[name^='lastname']").css('background-color', '#efefef');
      inputArea.find("[name^='firstname']").attr('readonly', true);
      inputArea.find("[name^='firstname']").css('background-color', '#efefef');
      inputArea.find("[name^='organization_name']").attr('readonly', true);
      inputArea.find("[name^='organization_name']").css('background-color', '#efefef');
      inputArea.find("[name^='title']").attr('readonly', true);
      inputArea.find("[name^='title']").css('background-color', '#efefef');
      inputArea.find("[name^='email']").attr('readonly', true);
      inputArea.find("[name^='email']").css('background-color', '#efefef');
      inputArea.find("#token").val(nextToken);
      inputArea.find('.tel-note').remove();
      if(clientId == 0) {
        inputArea.find('#authorization-code').append('<p class="tel-note">上記番号から050-5213-3059にかけてください。<br>認証が成功すると自動で電話が切れます。</p>');
      } else {
        inputArea.find('#authorization-code').append('<p class="tel-note">ただいま承認中</p>');
      }
    } else {
      inputArea.find("[name^='lastname']").attr('readonly', false);
      inputArea.find("[name^='lastname']").css('background-color', '#fff');
      inputArea.find("[name^='firstname']").attr('readonly', false);
      inputArea.find("[name^='firstname']").css('background-color', '#fff');
      inputArea.find("[name^='organization_name']").attr('readonly', false);
      inputArea.find("[name^='organization_name']").css('background-color', '#fff');
      inputArea.find("[name^='title']").attr('readonly', false);
      inputArea.find("[name^='title']").css('background-color', '#fff');
      inputArea.find("[name^='email']").attr('readonly', false);
      inputArea.find("[name^='email']").css('background-color', '#fff');
      inputArea.find("#token").val('');
      inputArea.find('.tel-note').remove();
    }
    if(nextPassAuthFlg == true) {
      inputArea.find("[name^='password']").attr('readonly', true);
      inputArea.find("[name^='password']").css('background-color', '#efefef');
    } else {
      inputArea.find("[name^='password']").attr('readonly', false);
      inputArea.find("[name^='password']").css('background-color', '#fff');
    }
    if(nextTelAuthFlg == true) {
      inputArea.find("[name^='tel']").attr('readonly', true);
      inputArea.find("[name^='tel']").css('background-color', '#efefef');
    } else {
      inputArea.find("[name^='tel']").attr('readonly', false);
      inputArea.find("[name^='tel']").css('background-color', '#fff');
    }

    nextArea.find("[name^='lastname']").val(lastName);
    nextArea.find("[name^='firstname']").val(firstName);
    nextArea.find("[name^='organization_name']").val(organizationName);
    nextArea.find("[name^='title']").val(title);
    nextArea.find("[name^='email']").val(email);
    nextArea.find("[name^='password']").val(password);
    nextArea.find("[name^='tel']").val(tel);
    if(authFlg == true) {
      nextArea.find("[name^='lastname']").attr('readonly', true);
      nextArea.find("[name^='lastname']").css('background-color', '#efefef');
      nextArea.find("[name^='firstname']").attr('readonly', true);
      nextArea.find("[name^='firstname']").css('background-color', '#efefef');
      nextArea.find("[name^='organization_name']").attr('readonly', true);
      nextArea.find("[name^='organization_name']").css('background-color', '#efefef');
      nextArea.find("[name^='title']").attr('readonly', true);
      nextArea.find("[name^='title']").css('background-color', '#efefef');
      nextArea.find("[name^='email']").attr('readonly', true);
      nextArea.find("[name^='email']").css('background-color', '#efefef');
      nextArea.find("#token").val(token);
      nextArea.find('.tel-note').remove();
      if(clientId == 0) {
        nextArea.find('#authorization-code').append('<p class="tel-note">上記番号から050-5213-3059にかけてください。<br>認証が成功すると自動で電話が切れます。</p>');
      } else {
        nextArea.find('#authorization-code').append('<p class="tel-note">ただいま承認中</p>');
      }
    } else {
      nextArea.find("[name^='lastname']").attr('readonly', false);
      nextArea.find("[name^='lastname']").css('background-color', '#fff');
      nextArea.find("[name^='firstname']").attr('readonly', false);
      nextArea.find("[name^='firstname']").css('background-color', '#fff');
      nextArea.find("[name^='organization_name']").attr('readonly', false);
      nextArea.find("[name^='organization_name']").css('background-color', '#fff');
      nextArea.find("[name^='title']").attr('readonly', false);
      nextArea.find("[name^='title']").css('background-color', '#fff');
      nextArea.find("[name^='email']").attr('readonly', false);
      nextArea.find("[name^='email']").css('background-color', '#fff');
      nextArea.find("#token").val('');
      nextArea.find('.tel-note').remove();
    }
    if(passAuthFlg == true) {
      nextArea.find("[name^='password']").attr('readonly', true);
      nextArea.find("[name^='password']").css('background-color', '#efefef');
    } else {
      nextArea.find("[name^='password']").attr('readonly', false);
      nextArea.find("[name^='password']").css('background-color', '#fff');
    }
    if(telAuthFlg == true) {
      nextArea.find("[name^='tel']").attr('readonly', true);
      nextArea.find("[name^='tel']").css('background-color', '#efefef');
    } else {
      nextArea.find("[name^='tel']").attr('readonly', false);
      nextArea.find("[name^='tel']").css('background-color', '#fff');
    }

    // 画面共有
    var data = {
       command : "E_CONTRACT",
       type : "APPROVAL_DOWN",
       index : areaIndex
    };
    sendCommand(SEND_TARGET_ALL, data);
  });

  // バツボタンをクリックしてパートナーフォームを削除する
  $(document).on('click', '#partner-remove', function() {
    $(this).parents('.partner_setting_item').remove();
    // 画面共有
    var text = $(this).parent().find('.partner_setting_item_count').text();
    var data = {
       command : "E_CONTRACT",
       type : "PARTNER_REMOVE",
       text : text
    };
    sendCommand(SEND_TARGET_ALL, data);
  });

  $(function() {
    // 次のファイルに移動する
    $(document).on('click','.form_setting_file_pager_next', function() {
      // 現ファイルの数を取得
      var fileCountElement = $(this).parent().parent().find('.form_setting_file_page_count');
      var fileCount = fileCountElement.text();
      var fileTotal = $(this).parent().parent().find('.form_setting_file_page_total').text();
      // 最大ファイル数に達したら処理をしない
      if (fileCount >= fileTotal) return false;
        // 現ファイルの数に1を追加
        fileCount++;
        $(".form_setting_file_page_count").each(function(){
          $(this).text(fileCount);
        })

        var documentCount = document.getElementById('filePageId').innerText;
        var getId = $('.form_setting_document_img').attr('id');
        var documentNumOut = getId.substr( 0, 8 );
        var documentNum = documentNumOut + fileCount
        var getDocument = "document"+fileCount
        var changeColorZone = $('#'+fileCount).parents('.form_template-name');
        $('.form_template-name').removeClass('form_template-name-change');

      if(documentNum == getDocument){
        $('#'+getId).css('display','none');
        $('#'+getDocument).css('display','block');
        document.getElementById('filePageId').innerText = fileCount;
        $(changeColorZone).addClass('form_template-name-change');
      }
    });

    // 前のファイルに移動する
    $(document).on('click','.form_setting_file_pager_prev', function() {
      // 現ファイルの数を取得
      var fileCountElement = $(this).parent().parent().find('.form_setting_file_page_count');
      var fileCount = fileCountElement.text();
      var fileTotal = $(this).parent().parent().find('.form_setting_file_page_count').text();
      // 最少ファイル数に達したら処理をしない
      if (fileCount <= 1) return false;
        // 現ファイルの数に1減らす
        fileCount--;
        $(".form_setting_file_page_count").each(function(){
          $(this).text(fileCount);
        })

        var documentCount = document.getElementById('filePageId').innerText;
        var getId = $('.form_setting_document_img').attr('id');
        var documentNumOut = getId.substr( 0, 8 );
        var documentNum = documentNumOut + fileCount
        var getDocument = "document"+fileCount
        var changeColorZone = $('#'+fileCount).parents('.form_template-name');
        $('.form_template-name').removeClass('form_template-name-change');

      if(documentNum == getDocument){
        var changeId = getId.substr( 0, 8 );
        var beforeDocumentId = $('.form_setting_document_img').attr('id');　
        var IntDocumentId = beforeDocumentId.replace(/[^0-9]/g, '');　
        var getDocumentId = Number(IntDocumentId)+1　
        var Id = changeId + getDocumentId
        $('#'+Id).css('display','none');
        $('#'+getDocument).css('display','block');
        document.getElementById('filePageId').innerText = fileCount;
        $(changeColorZone).addClass('form_template-name-change');
      }
    });

    // 次のページに移動する
    $(document).on('click','.form_setting_document_pager_next', function() {
      // ページ数を取得
      var pageCountElement = $(this).parent().parent().find('.form_setting_document_page_count');
      var pageCount = Number(pageCountElement.text());
      var pageTotal = Number($(this).parent().parent().find('.form_setting_document_page_total').text());
      // 最大ページに達したら処理をしない
      if (pageCount >= pageTotal) return false;
      // ページ数を1追加する
      pageCount++;
      pageCountElement.text(pageCount);

      // 契約書srcを取得
      var imgElement = $(this).parents('.form_setting_document_img').find('.documentId');
      var src = imgElement.attr('src');
      // 契約書画像を変換
      src = src.replace(/\d+.jpg$/, pageCount + '.jpg');
      imgElement.attr('src', src);
    });

    // 前のページに移動する
    $(document).on('click','.form_setting_document_pager_prev', function() {
      // ページ数を取得
      var pageCountElement = $(this).parent().parent().find('.form_setting_document_page_count');
      var pageCount = Number(pageCountElement.text());
      var pageTotal = Number($(this).parent().parent().find('.form_setting_document_page_total').text());
      // 最少ページに達したら処理をしない
      if (pageCount <= 1) return false;
      // ページ数を1減らす
      pageCount--;
      pageCountElement.text(pageCount);

      // 契約書srcを取得
      var imgElement = $(this).parents('.form_setting_document_img').find('.documentId');
      var src = imgElement.attr('src');
      // 契約書画像を変換
      src = src.replace(/\d+.jpg$/, pageCount + '.jpg');
      imgElement.attr('src', src);
    });

    // ファイル名をクリックするとそれに対応するファイルを出力
    $(document).on('click','.file_target',function(){
      var getButtonId = $(this).attr('id');
      var getId = $(this).attr('id');
      var getPageNum = getId.replace(/[^0-9]/g, '');
      var changeId  = "document"+getButtonId;
      var changeColorZone = $('#'+getButtonId).parents('.form_template-name');
      $('.form_template-name').removeClass('form_template-name-change');

      if("document"+getButtonId == changeId){
        $('.form_setting_document_img').css('display','none');
        $(changeColorZone).addClass('form_template-name-change');
        $('#'+changeId).css('display','block');
        $(".form_setting_file_page_count").each(function(){
        $(this).text(getPageNum);
        })
      }
    });

    // パートナー選択フォームの開閉
    $(document).on('click', '.partner_select_open', function() {
      $(this).next().toggle();
    });

    // パートナー選択フォームを閉じる
    $(document).click(function(event) {
      if(!$(event.target).closest('.form_setting_parts').length) {
        $('.form_setting_partner_select').hide();
        $('.form_setting_parts').css({'background-color': 'transparent', 'z-index': '0'});
        $('.partner_select_open').css('display', 'none');
      }
    });

    // パートナー選択フォーム変更時に登録する
    $(document).on('change', '.partner_select', function() {
      var formId = $(this).parents('.form_setting_parts').attr('id');
      var partnerId = $(this).val();
      var className = $('#' + formId).attr('class');
      var caseId = $('#caseId').val();
      var filePage = $('#filePageId').text();

      // 入力者がselfの場合
      if(partnerId == 0){
        // 印影設定の場合
        $('#' + formId).css({'background-color':'#E5F4FF'});
        if(className.indexOf('form_setting_parts_sign_dammy') != -1) {
          // 設定印影画像の取得
          $.ajax({
            url: "/e-contract-api/get-sign-image",
            type: "GET",
            dataType: "text"
          }).done(function(res) {
            // 印影サイズを取得
            imgSize = base64ToFile('data:image/png;base64, ' + res).size;

            // 印影情報が登録されていれば更新、登録されていなければ登録する
            $.ajax({
              url: "/e-contract-api/set-input",
              type: "POST",
              dataType: "json",
              data: {
                "case_id"    : caseId,
                "form_id"    : formId,
                "partner_id" : partnerId,
                "filePage"   : filePage,
                "target"     : 'self',
                "img_data"   : res,
                "img_type"   : 'image/png',
                "img_size"   : imgSize
              },
              // ローディングを表示する
              beforeSend: function(){
                var fileCount = $('#filePageId').text() - 1;
                var position = $('#' + formId).position();
                var x = position.left;
                var y = position.top;
                $('#loading' + fileCount).css({'display':'block', 'top':y+'px', 'left':x+'px', 'height':'30px', 'width':'auto', 'border':'none', 'z-index':'100'});
              }
            }).done(function(inputRes) {
              // ローディングを非表示にする
              var fileCount = $('#filePageId').text() - 1;
              $('#loading' + fileCount).css({'display':'none'});
              // 設定済み背景に変更する
              $('#' + formId + ' .done').remove();
              $('#' + formId + ' .form_setting_partner_sign').remove();
              // 印影画像を表示
              $('#' + formId).find('.sign_img').remove();
              $('#' + formId).prepend('<img class="sign_img" style="position: absolute; top: 6px; left: 7px; width: ' + inputRes.input.img_width / 2 + 'px; height: ' + inputRes.input.img_height / 2 + 'px;" src="data:image/png;base64, ' + res + '">');
              $('#' + formId).prepend('<p class="done self_sign">設定済み</p>');
              $('#' + formId).css({'background-color':'#FFDE96'});

              // 画面共有
              var data = {
                  command : "E_CONTRACT",
                  type : "INPUT_HOST_SIGN",
                  res : res,
                  inputRes : inputRes,
                  fileCount : fileCount,
                  formId : formId
              };
              sendCommand(SEND_TARGET_ALL, data);
              return false;
            }).fail(function() {
            });
          }).fail(function(res) {
          });
        // テキストフォーム設定の場合
        } else if(className.indexOf('form_setting_parts_text_dammy') != -1) {
          // フォーム情報が登録されていれば更新、登録されていなければ登録する
          $.ajax({
            url: "/e-contract-api/set-input",
            type: "POST",
            dataType: "json",
            data: {
              "case_id"    : caseId,
              "form_id"    : formId,
              "partner_id" : partnerId,
              "filePage"   : filePage,
              "target"     : 'self'
            },
            // ローディングを表示する
            beforeSend: function(){
              var fileCount = $('#filePageId').text() - 1;
              var position = $('#' + formId).position();
              var x = position.left;
              var y = position.top;
              $('#loading' + fileCount).css({'display':'block', 'top':y+'px', 'left':x+'px', 'height':'30px', 'width':'auto', 'border':'none', 'z-index':'100'});
            }
          }).done(function(res) {
            // input_idを変更
            $('#'+formId).data('input', res.input.input_id);
            // ローディングを非表示にする
            var fileCount = $('#filePageId').text() - 1;
            $('#loading' + fileCount).css({'display':'none'});
            // 設定済み背景に戻す
            $('#' + formId + ' .done').remove();
            $('#' + formId + ' .text_form').remove();
            $('#' + formId).prepend('<input type="text" id="0" class="parts_inner_text_dammy text_form" style="width: ' + res.input.width / 2 + 'px; height: ' + res.input.height / 2 + 'px; font-size: ' + res.input.font_size / 2 + 'px;">');
            $('#' + formId + ' .parts_inner_text_dammy').focus();

            // 画面共有
            var data = {
                command : "E_CONTRACT",
                type : "CHANGE_HOST_CHECK",
                res : res,
                formId : formId
            };
            sendCommand(SEND_TARGET_ALL, data);
            return false;
          }).fail(function() {
          });
        // テキストエリア設定の場合
      } else if(className.indexOf('form_setting_parts_textarea_dammy') != -1) {
        // フォーム情報が登録されていれば更新、登録されていなければ登録する
        $.ajax({
          url: "/e-contract-api/set-input",
          type: "POST",
          dataType: "json",
          data: {
            "case_id"    : caseId,
            "form_id"    : formId,
            "partner_id" : partnerId,
            "filePage"   : filePage,
            "target"     : 'self'
          },
          // ローディングを表示する
          beforeSend: function(){
            var fileCount = $('#filePageId').text() - 1;
            var position = $('#' + formId).position();
            var x = position.left;
            var y = position.top;
            $('#loading' + fileCount).css({'display':'block', 'top':y+'px', 'left':x+'px', 'height':'30px', 'width':'auto', 'border':'none', 'z-index':'100'});
          }
        }).done(function(res) {
          // input_idを変更
          $('#'+formId).data('input', res.input.input_id);
          // ローディングを非表示にする
          var fileCount = $('#filePageId').text() - 1;
          $('#loading' + fileCount).css({'display':'none'});
          // 設定済み背景に戻す
          $('#' + formId + ' .done').remove();
          $('#' + formId + ' .text_form').remove();
          $('#' + formId).prepend('<textarea id="0" class="parts_inner_textarea_dammy text_form" style="width: ' + res.input.width / 2 + 'px; height: ' + res.input.height / 2 + 'px; font-size: ' + res.input.font_size / 2 + 'px; resize: none;"></textarea>');
          $('#' + formId + ' .parts_inner_textarea_dammy').focus();

          // 画面共有
          var data = {
              command : "E_CONTRACT",
              type : "CHANGE_HOST_TEXTREA",
              res : res,
              formId : formId
          };
          sendCommand(SEND_TARGET_ALL, data);
          return false;
        }).fail(function() {
        });
        // チェックボックス設定の場合
        } else if(className.indexOf('form_setting_parts_checkbox_dammy') != -1) {

          // チェックボックスデータ
          var imgData = 'iVBORw0KGgoAAAANSUhEUgAAACMAAAAjCAYAAAAe2bNZAAAAAXNSR0IArs4c6QAAAiRJREFUWAntmDtLA0EQx2fPnCQa0FgoBnyg2GrAR2OjILa+wFb9CBbmQ2jjN1BbBUmtCNfY+Iy2gkaF+AI90RhjfN0/yyYRsmcel0tzU1yW2dmZ3/5n0wwjw662gn6qaVj4+kxM/Xy+t8BnhymqJ6pUVa/T2+NS6+hilKVAPD7N6+/r8jZ1k1rbaAdHqkYydk8vt+H32M3RNcWfhlxQxNvc2+XrGLENQhTCxRs6R92MsZaX6GFQ+f76mIYilTRvU4/b4JhUvpNxv52tyXVp1MdbVXJtVsrnwMiUd5RxlEkpoIeJQj6i3QmZIGl/ed8MQLRhoqROpB+ni8oW5YPJBlHriAZDMoa0vzwwkdWMIgAZ0ojqA+misoVLtlG0HyD7c/x4XQ/RsEak1ueVzlplSgABrTnMg3GryFpet6ISQVDEvE2748Y/4ZkIUP0rcigLQJDcXJn2WQ6QXYx7Mt+z5aLfSCYJX5nDBIxCbTM8MhfQ3ixReJ7v+8cKeqz80N+veZsQO7DKT1wabwdAMLQMIPDBACziuKeo7/8wSCsKCaB7jegtgh3LQJDKvE2IEAYg0bIygKBM/jCIzgayqDVIKyy/Nolo/AJItC3bb8G6MGUsKGiWwoGRqeMoI1UGYwlMAyppqM9c7msF85HXu9NKslDs7iRhcGwqGNS8Rg/O9Isdslsh1NPPtxPGOOSKxZ8WGSTBwOjH4wtiLGH35Iop6gZAMLn6BTGLwMGnHwLyAAAAAElFTkSuQmCC';

          // フォーム情報が登録されていれば更新、登録されていなければ登録する
          $.ajax({
            url: "/e-contract-api/set-input",
            type: "POST",
            dataType: "json",
            data: {
              "case_id"    : caseId,
              "form_id"    : formId,
              "partner_id" : partnerId,
              "filePage"   : filePage,
              "target"     : 'self',
              "required"   : 'true',
              "img_data"   : imgData,
              "img_type"   : 'image/png'
            },
            // ローディングを表示する
            beforeSend: function(){
              var fileCount = $('#filePageId').text() - 1;
              var position = $('#' + formId).position();
              var x = position.left;
              var y = position.top;
              $('#loading' + fileCount).css({'display':'block', 'top':y+'px', 'left':x+'px', 'height':'30px', 'width':'auto', 'border':'none', 'z-index':'100'});
            }
          }).done(function(inputRes) {
            // ローディングを非表示にする
            var fileCount = $('#filePageId').text() - 1;
            $('#loading' + fileCount).css({'display':'none'});
            // 設定済み背景に変更する
            $('#' + formId + ' .done').remove();
            // チェックボックス画像を表示
            $('.parts_inner_checkbox_dammy').off('click');
            $('.parts_inner_checkbox_dammy').click(function(){
            let checked = false;
            let formId = $(this).parent().attr('id');
            let partnerId = $(this).nextAll(".form_setting_partner_select").children(".partner_select").val();
            if (partnerId == 0) {
              if($(this).children().hasClass('checkbox_img')){
                $(this).find('.checkbox_img').remove();
                $(this).find('.done').remove();
                checked = false;
              }else{
                $(this).prepend('<img class="checkbox_img" style="position: absolute; top: 11px; left: -1px; width: ' + inputRes.input.img_width + 'px; height: ' + inputRes.input.img_height + 'px;" src="data:image/png;base64, ' + imgData + '">');
                $(this).prepend('<p class="done">設定済み</p>');
                $(this).css({'background-color':'transparent'});
                checked = true;
              }
            }

            // 画面共有
            var data = {
                command : "E_CONTRACT",
                type : "INPUT_HOST_CHECK",
                imgData : imgData,
                inputRes : inputRes,
                fileCount : fileCount,
                formId : formId,
                checked : checked
            };
            sendCommand(SEND_TARGET_ALL, data);
            return false;
          })
          if (partnerId == 0) {
            var data = {
              command : "E_CONTRACT",
              type : "HOST_SELECT_CHECK",
              formId : formId,
            };
            sendCommand(SEND_TARGET_ALL, data);
              return false;
          }
          }).fail(function() {
          });
        }
      // 入力者がpartnerの場合
      } else {
        // パートナーが承認済みかチェック
        $.ajax({
          url: "/e-contract-api/get-partner-with-id",
          type: "GET",
          dataType: "json",
          data: {
            "partner_id" : partnerId
          }
        }).done(function(res) {
          if(res == 1 || res == 0) {
            $('#' + formId).css({'background-color':'#E5F4FF'});
            // 印影設定の場合
            if(className.indexOf('form_setting_parts_sign_dammy') != -1) {
              // フォーム入力者が登録されていれば更新、登録されていなければ登録する
              $.ajax({
                url: "/e-contract-api/set-input",
                type: "POST",
                dataType: "json",
                data: {
                  "case_id"    : caseId,
                  "form_id"    : formId,
                  "partner_id" : partnerId,
                  "filePage"   : filePage,
                  "required"    : "true",
                  "target"     : 'partner'
                },
                // ローディングを表示する
                beforeSend: function(){
                  var fileCount = $('#filePageId').text() - 1;
                  var position = $('#' + formId).position();
                  var x = position.left;
                  var y = position.top;
                  $('#loading' + fileCount).css({'display':'block', 'top':y+'px', 'left':x+'px', 'height':'30px', 'width':'auto', 'border':'none', 'z-index':'100'});
                }
              }).done(function(res) {
                // ローディングを非表示にする
                var fileCount = $('#filePageId').text() - 1;
                $('#loading' + fileCount).css({'display':'none'});
                $('.form_setting_partner_select').hide();
                $('#' + formId + ' .done').remove();
                $('#' + formId + ' .form_setting_partner_sign').remove();
                $('#' + formId + ' img.sign_img').remove();
                // 画面共有
                var data = {
                  command : "E_CONTRACT",
                  type : "INPUT_PARTNER",
                  res : res,
                  fileCount : fileCount,
                  formId : formId,
                  partnerId : partnerId
                };
                sendCommand(SEND_TARGET_ALL, data);
                return false;
              }).fail(function(res) {
              });
            // テキストフォーム設定の場合
            } else if(className.indexOf('form_setting_parts_text_dammy') != -1) {
              // フォーム情報が登録されていれば更新、登録されていなければ登録する
              $.ajax({
                url: "/e-contract-api/set-input",
                type: "POST",
                dataType: "json",
                data: {
                  "case_id"    : caseId,
                  "form_id"    : formId,
                  "partner_id" : partnerId,
                  "filePage"   : filePage,
                  "target"     : 'partner'
                },
                // ローディングを表示する
                beforeSend: function(){
                  var fileCount = $('#filePageId').text() - 1;
                  var position = $('#' + formId).position();
                  var x = position.left;
                  var y = position.top;
                  $('#loading' + fileCount).css({'display':'block', 'top':y+'px', 'left':x+'px', 'height':'30px', 'width':'auto', 'border':'none', 'z-index':'100'});
                }
              }).done(function(res) {
                // input_idを変更
                $('#'+formId).data('input', res.input.input_id);
                // ローディングを非表示にする
                var fileCount = $('#filePageId').text() - 1;
                $('#loading' + fileCount).css({'display':'none'});
                // 設定済み背景に戻す
                $('#' + formId + ' .done').remove();
                $('#' + formId + ' .text_form').remove();
                $('#' + formId).prepend('<input type="text" id="' + partnerId + '" class="parts_inner_text_dammy text_form" style="width: ' + res.input.width / 2 + 'px; height: ' + res.input.height / 2 + 'px; font-size: ' + res.input.font_size / 2 + 'px;">');
                $('#' + formId + ' .parts_inner_text_dammy').focus();

                // 画面共有
                var data = {
                    command : "E_CONTRACT",
                    type : "CHANGE_HOST_CHECK",
                    res : res,
                    formId : formId,
                    partnerId : partnerId
                };
                sendCommand(SEND_TARGET_ALL, data);
                return false;
              }).fail(function() {
              });
            // テキストエリア設定の場合
            } else if(className.indexOf('form_setting_parts_textarea_dammy') != -1) {
              // フォーム情報が登録されていれば更新、登録されていなければ登録する
              $.ajax({
                url: "/e-contract-api/set-input",
                type: "POST",
                dataType: "json",
                data: {
                  "case_id"    : caseId,
                  "form_id"    : formId,
                  "partner_id" : partnerId,
                  "filePage"   : filePage,
                  "target"     : 'partner'
                },
                // ローディングを表示する
                beforeSend: function(){
                  var fileCount = $('#filePageId').text() - 1;
                  var position = $('#' + formId).position();
                  var x = position.left;
                  var y = position.top;
                  $('#loading' + fileCount).css({'display':'block', 'top':y+'px', 'left':x+'px', 'height':'30px', 'width':'auto', 'border':'none', 'z-index':'100'});
                }
              }).done(function(res) {
                // input_idを変更
                $('#'+formId).data('input', res.input.input_id);
                // ローディングを非表示にする
                var fileCount = $('#filePageId').text() - 1;
                $('#loading' + fileCount).css({'display':'none'});
                // 設定済み背景に戻す
                $('#' + formId + ' .done').remove();
                $('#' + formId + ' .text_form').remove();
                $('#' + formId).prepend('<textarea id="' + partnerId + '" class="parts_inner_textarea_dammy text_form" style="width: ' + res.input.width / 2 + 'px; height: ' + res.input.height / 2 + 'px; font-size: ' + res.input.font_size / 2 + 'px; resize: none;></textarea>');
                //readonly 付与
                $('#' + formId + ' .parts_inner_textarea_dammy').attr('readonly',true);

                // 画面共有
                var data = {
                    command : "E_CONTRACT",
                    type : "CHANGE_HOST_TEXTREA",
                    res : res,
                    formId : formId,
                    partnerId : partnerId
                };
                sendCommand(SEND_TARGET_ALL, data);
                return false;
              }).fail(function() {
              });
            // チェックボックス設定の場合
            } else if(className.indexOf('form_setting_parts_checkbox_dammy') != -1) {
              // チェックボックスデータ
              var imgData = 'iVBORw0KGgoAAAANSUhEUgAAACMAAAAjCAYAAAAe2bNZAAAAAXNSR0IArs4c6QAAAiRJREFUWAntmDtLA0EQx2fPnCQa0FgoBnyg2GrAR2OjILa+wFb9CBbmQ2jjN1BbBUmtCNfY+Iy2gkaF+AI90RhjfN0/yyYRsmcel0tzU1yW2dmZ3/5n0wwjw662gn6qaVj4+kxM/Xy+t8BnhymqJ6pUVa/T2+NS6+hilKVAPD7N6+/r8jZ1k1rbaAdHqkYydk8vt+H32M3RNcWfhlxQxNvc2+XrGLENQhTCxRs6R92MsZaX6GFQ+f76mIYilTRvU4/b4JhUvpNxv52tyXVp1MdbVXJtVsrnwMiUd5RxlEkpoIeJQj6i3QmZIGl/ed8MQLRhoqROpB+ni8oW5YPJBlHriAZDMoa0vzwwkdWMIgAZ0ojqA+misoVLtlG0HyD7c/x4XQ/RsEak1ueVzlplSgABrTnMg3GryFpet6ISQVDEvE2748Y/4ZkIUP0rcigLQJDcXJn2WQ6QXYx7Mt+z5aLfSCYJX5nDBIxCbTM8MhfQ3ixReJ7v+8cKeqz80N+veZsQO7DKT1wabwdAMLQMIPDBACziuKeo7/8wSCsKCaB7jegtgh3LQJDKvE2IEAYg0bIygKBM/jCIzgayqDVIKyy/Nolo/AJItC3bb8G6MGUsKGiWwoGRqeMoI1UGYwlMAyppqM9c7msF85HXu9NKslDs7iRhcGwqGNS8Rg/O9Isdslsh1NPPtxPGOOSKxZ8WGSTBwOjH4wtiLGH35Iop6gZAMLn6BTGLwMGnHwLyAAAAAElFTkSuQmCC';
              // フォーム情報が登録されていれば更新、登録されていなければ登録する
              $.ajax({
                url: "/e-contract-api/set-input",
                type: "POST",
                dataType: "json",
                data: {
                  "case_id"    : caseId,
                  "form_id"    : formId,
                  "partner_id" : partnerId,
                  "filePage"   : filePage,
                  "target"     : 'self',
                  "required"   : 'true',
                  "img_data"   : imgData,
                  "img_type"   : 'image/png'
                },
                // ローディングを表示する
                beforeSend: function(){
                  var fileCount = $('#filePageId').text() - 1;
                  var position = $('#' + formId).position();
                  var x = position.left;
                  var y = position.top;
                  $('#loading' + fileCount).css({'display':'block', 'top':y+'px', 'left':x+'px', 'height':'30px', 'width':'auto', 'border':'none', 'z-index':'100'});
                }
              }).done(function(inputRes) {
                // ローディングを非表示にする
                var fileCount = $('#filePageId').text() - 1;
                $('#loading' + fileCount).css({'display':'none'});
                // 設定済み背景に変更する
                $('#' + formId + ' .done').remove();
                $('#' + formId + ' .checkbox_img').remove();
                // 画面共有
                var data = {
                    command : "E_CONTRACT",
                    type : "INPUT_PARTNER_CHECK",
                    imgData : imgData,
                    inputRes : inputRes,
                    fileCount : fileCount,
                    formId : formId,
                    partnerId : partnerId
                };
                sendCommand(SEND_TARGET_ALL, data);
                return false;
              }).fail(function() {
              });
            }
          } else {
            var required = "false";
            if($('[name=checkbox' + formId + ']').prop("checked") == true) {
              var required = "true";
            }
            // フォーム入力者が登録されていれば更新、登録されていなければ登録する
            $.ajax({
              url: "/e-contract-api/set-input",
              type: "POST",
              dataType: "text",
              data: {
                "case_id"    : caseId,
                "form_id"    : formId,
                "partner_id" : partnerId,
                "filePage"   : filePage,
                "required"    : required,
                "target"     : 'partner',
              },
              // ローディングを表示する
              beforeSend: function(){
                var fileCount = $('#filePageId').text() - 1;
                var position = $('#' + formId ).position();
                var x = position.left;
                var y = position.top;
                $('#loading' + fileCount).css({'display':'block', 'top':y+'px', 'left':x+'px', 'height':'30px', 'width':'auto', 'border':'none', 'z-index':'100'});
              }
            }).done(function(res) {
              // ローディングを非表示にする
              var fileCount = $('#filePageId').text() - 1;
              $('#loading' + fileCount).css({'display':'none'});
              // 設定済み背景に変更する
              $('#' + formId + ' .done').remove();

              if(className.indexOf('form_setting_parts_sign_dammy') != -1) {
                // 印影設定の場合
                $('#' + formId + ' img.sign_img').remove();
                $('#' + formId).prepend('<p class="done partner_sign">設定済み</p>');
              } else if(className.indexOf('form_setting_parts_text_dammy') != -1) {
                // テキストフォーム設定の場合
                $('#' + formId + ' input').remove();
                $('#' + formId).prepend('<p class="done">設定済み</p>');
              } else if(className.indexOf('form_setting_parts_textarea_dammy') != -1) {
                // テキストエリア設定の場合
                $('#' + formId + ' textarea').remove();
                $('#' + formId).prepend('<p class="done">設定済み</p>');
              } else if(className.indexOf('form_setting_parts_checkbox_dammy') != -1) {
                // チェックボックス設定の場合
                $('#' + formId + ' img.checkbox_img').remove();
                $('#' + formId).prepend('<p class="done">設定済み</p>');
              }
              $('#' + formId).css({'background-color':'transparent'});

              // 画面共有
              var data = {
                  command : "E_CONTRACT",
                  type : "INPUT_PARTNER_FORM",
                  className : className,
                  formId : formId
              };
              sendCommand(SEND_TARGET_ALL, data);
            }).fail(function(res) {
            });
          }
        }).fail(function(res) {
        });
        return false;
      }
    });

    // パートナーサイン押印時に登録する
    $(document).on('click', '.signning', function() {
      var formId = $(this).parents('.form_setting_parts').attr('id');
      var partnerId = $(this).parent().attr('id');
      var inputId = $(this).parent().data('input-id');

      var credential = $("#e_contract_credential").val();
      var texts = [];
      var text1 = $(this).prevAll('.text1').val();
      var text2 = $(this).prevAll('.text2').val();
      var text3 = $(this).prevAll('.text3').val();
      var text4 = $(this).prevAll('.text4').val();
      if(text1 == '' && text2 == '' && text3 == '' && text4 == '') {
        return false;
      }
      texts.push(text1);
      texts.push(text2);
      texts.push(text3);
      texts.push(text4);
      // 印影画像の取得
      $.ajax({
        url: "/e-contract-api/create-sign-image",
        type: "POST",
        dataType: "text",
        data: {
          "credential" : credential,
          "texts"      : texts
        }
      }).done(function(res) {
        // 印影サイズを取得
        imgSize = base64ToFile('data:image/png;base64, ' + res).size;

        var data = {};
        data['target']   = 'partner';
        data['img_data'] = res;
        data['img_type'] = 'image/png';
        data['img_size'] = imgSize;

        // 印影情報が登録されていれば更新、登録されていなければ登録する
         $.ajax({
          url: "/e-contract-api/value-input",
          type: "POST",
          dataType: "json",
          data: {
            "form_id"    : inputId,
            "partner_id" : partnerId,
            "data"       : data
          }
        }).done(function(inputRes) {
          var fileCount = $('#filePageId').text() - 1;
          // 設定済み背景に変更する
          $('#' + formId + ' .done').remove();
          $('.form_setting_partner_sign').remove();
          // 印影画像を表示
          $('#' + formId).prepend('<img class="sign_img" style="position: absolute; top: 6px; left: 7px; width: ' + inputRes.input.width / 2 + 'px; height: ' + inputRes.input.height / 2 + 'px;" src="data:image/png;base64, ' + res + '">');
          $('#' + formId).prepend('<p class="done partner_sign">入力済み</p>');
          $('#' + formId).css({'background-color':'transparent'});

          // 画面共有
          var data = {
              command : "E_CONTRACT",
              type : "INPUT_PARTNER_SIGN",
              res : res,
              inputRes : inputRes,
              fileCount : fileCount,
              formId : formId
          };
          sendCommand(SEND_TARGET_ALL, data);
          return false;
        }).fail(function() {
        });
      }).fail(function(res) {
      });
    });

    // テキストフォーム変更時に登録する
    $(document).on('change', '.text_form', function() {
      var partnerId = $(this).attr('id');
      var formId = $(this).parents(".form_setting_parts").attr('id');
      var text = $(this).val();
      var inputId = this.closest(".form_setting_parts").dataset.input;

      var data = {};
      data['value'] = text;
      if(partnerId == '0') {
        data['target'] = "self";
      } else {
        data['target'] = "partner";
      }
      data['size'] = Number($(this).css('font-size').replace('px', '')) * 2;

      // テキストが空じゃなければ登録する
      if(text != '') {
        $.ajax({
          url: "/e-contract-api/value-input",
          type: "POST",
          dataType: "text",
          data: {
            "form_id"    : inputId,
            "partner_id" : partnerId,
            "data"       : data
          },
          // ローディングを表示する
          beforeSend: function(){
            var fileCount = $('#filePageId').text() - 1;
            var position = $('#' + formId).position();
            var x = position.left;
            var y = position.top;
            $('#loading' + fileCount).css({'display':'block', 'top':y+'px', 'left':x+'px', 'height':'30px', 'width':'auto', 'border':'none', 'z-index':'100'});
          }
        }).done(function(res) {
          // ローディングを非表示にする
          var fileCount = $('#filePageId').text() - 1;
          $('#loading' + fileCount).css({'display':'none'});
          // 入力済み背景に変更する
          $('#' + formId).prepend('<p class="done">入力済み</p>');
          $('#' + formId).css({'background-color':'#FFDE96'});

          // 画面共有
          var data = {
              command : "E_CONTRACT",
              type : "INPUT_HOST_TEXT",
              text : text,
              formId : formId
          };
          sendCommand(SEND_TARGET_ALL, data);
        }).fail(function(res) {
        });
      } else {
        $('#' + formId + ' .done').remove();
        $('#' + formId).css({'background-color':'#E5F4FF'});
      }
    });

    //設置したフォームをページごとに表示する
    $(document).on('click', '.form_setting_document_pager_next', function(){
      var pageNumMax = $(this).parent().parent().find('.form_setting_document_page_total');
      var pageCountMax = pageNumMax.text()+ 1;
      var IntPageCountMax = parseInt(pageCountMax);
      //現在のページ数を取得
      var pageNum = $(this).parent().parent().find('.form_setting_document_page_count');
      var pageCount = pageNum.text();
      var IntPageCount = parseInt(pageCount);
      //配列に保存されているテキストフォームを1つずつ取り出す
      var formText = document.getElementsByClassName('form_setting_parts_text_dammy ui-draggable ui-draggable-handle');
      for( var i=0 ; i < formText.length; i++){
        var formTextNum = formText[i];
      }
      //配列に保存されているテキストエリアを1つずつ取り出す
      var formTextarea = document.getElementsByClassName('form_setting_parts_textarea_dammy ui-draggable ui-draggable-handle');
      for( var i=0 ; i < formTextarea.length; i++){
        var formTextareaNum = formTextarea[i];
      }
      //配列に保存されているチェックボックスフォームを1つずつ取り出す
      var formCheck = document.getElementsByClassName('form_setting_parts_checkbox_dammy ui-draggable ui-draggable-handle');
      for( var i=0 ; i < formCheck.length; i++){
        var formCheckNum = formCheck[i];
      }
      //配列に保存されているサインフォームを1つずつ取り出す
      var formSign = document.getElementsByClassName('form_setting_parts_sign_dammy ui-draggable ui-draggable-handle');
      for( var i=0 ; i < formSign.length; i++){
        var formSignNum = formSign[i];
      }

      if(IntPageCountMax>IntPageCount){
        $(".form_setting_parts_text_dammy").css('display','none');
        $(".form_setting_parts_textarea_dammy").css('display','none');
        $(".form_setting_parts_checkbox_dammy").css('display','none');
        $(".form_setting_parts_sign_dammy").css('display','none');
        $("[data-page = " + IntPageCount + "]").css('display','');
      } else {
        return false;
      }
    })

    // タッチイベントで背景、ボタンの表示非表示 
    $(document).on('touchend', '.parts_inner_text_dammy, .parts_inner_textarea_dammy, .parts_inner_sign_dammy, .parts_inner_checkbox_dammy, .checkbox_img, .sign_img', function() {
      $(this).parent().css({'background-color': '#E5F4FF', 'z-index': '100'});
      $(this).parent().find('.partner_select_open').css('display', 'block');
    });

    $(document).on('click', '.form_setting_document_pager_prev', function(){
      //現在のページ数を取得
      var pageNum = $(this).parent().parent().find('.form_setting_document_page_count');
      var pageCount = pageNum.text();
      var IntPageCount = parseInt(pageCount);
      //配列に保存されているテキストフォームを1つずつ取り出す
      var formText = document.getElementsByClassName('form_setting_parts_text_dammy ui-draggable ui-draggable-handle');
      for( var i=0 ; i < formText.length; i++){
        var formTextNum = formText[i];
      }
      //配列に保存されているテキストエリアを1つずつ取り出す
      var formTextarea = document.getElementsByClassName('form_setting_parts_textarea_dammy ui-draggable ui-draggable-handle');
      for( var i=0 ; i < formTextarea.length; i++){
        var formTextareaNum = formTextarea[i];
      }
      //配列に保存されているチェックボックスフォームを1つずつ取り出す
      var formCheck = document.getElementsByClassName('form_setting_parts_checkbox_dammy ui-draggable ui-draggable-handle');
      for( var i=0 ; i < formCheck.length; i++){
        var formCheckNum = formCheck[i];
      }
      //配列に保存されているサインフォームを1つずつ取り出す
      var formSign = document.getElementsByClassName('form_setting_parts_sign_dammy ui-draggable ui-draggable-handle');
      for( var i=0 ; i < formSign.length; i++){
        var formSignNum = formSign[i];
      }
      if(IntPageCount>0) {
        $(".form_setting_parts_text_dammy").css('display','none');
        $(".form_setting_parts_textarea_dammy").css('display','none');
        $(".form_setting_parts_checkbox_dammy").css('display','none');
        $(".form_setting_parts_sign_dammy").css('display','none');
        $("[data-page = " + IntPageCount + "]").css('display','');
      } else {
        return false;
      }
    })
  });

  // 入力者設定へボタンを押下時
  $('#submit_button').on('click', function() {
    // フォームデータの取得
    var lastname = [];
    var firstname = [];
    var organization_name = [];
    var title = [];
    var email = [];
    var password = [];
    var token = [];
    $('.partner_setting_item').each(function(i, partner) {
      lastname[i] = $(partner).find('.partner_setting_input_name.lastname').val();
      firstname[i] = $(partner).find('.partner_setting_input_name.firstname').val();
      organization_name[i] = $(partner).find('.partner_setting_input.organization_name').val();
      title[i] = $(partner).find('.partner_setting_input.title').val();
      email[i] = $(partner).find('.partner_setting_input.email').val();
      password[i] = $(partner).find('.partner_setting_input_name.password').val();
      token[i] = $(partner).find('.token').val();
    });

    $('.form_setting_error').remove();
    // API認証者バリデーション
    var tokenCount = 0;
    $.each(token, function() {
      if(this != '') {
        tokenCount++;
      }
    });
    var error = false;
    if(tokenCount != 0) {
      // API認証者の数を取得
      $.ajax({
        url: "/e-contract-api/get-auth-count",
        type: "GET",
        dataType: "json",
        data: {
          "token" : token
        }
      }).done(function(res) {
        if(tokenCount != res) {
          $('#e_contract_title_1').append('<div class="form_setting_error">電話番号認証が終わっていません。パートナー側で認証をお願いします。</div>');
          error = true;
        }
      }).fail(function(res) {
      });
    }
    setTimeout(function() {
      if(error) {
        $('html, body').animate({scrollTop:0});
        return false;
      }
      // バリデーション
      var errorCount = 0;
      var caseTitle = $('#case_title').val();
      var eContractDocumentId = $('#e_contract_document_id').val();
      if(caseTitle ==  '') {
        $('.e_contract_title_area').append('<div class="form_setting_error">契約書タイトルを入力してください</div>');
        errorCount++;
      }
      if(eContractDocumentId == null) {
        $('.e_contract_title_area').append('<div class="form_setting_error">テンプレート名を選択してください</div>');
        errorCount++;
      }
      $('.lastname').each(function(){
        if($(this).val() == '') {
          $('.e_contract_title_area').append('<div class="form_setting_error">苗字を入力してください</div>');
          errorCount++;
          return false;
        }
      });
      $('.firstname').each(function(){
        if($(this).val() == '') {
          $('.e_contract_title_area').append('<div class="form_setting_error">名前を入力してください</div>');
          errorCount++;
          return false;
        }
      });
      $('.email').each(function(){
        if($(this).val() == '') {
          $('.e_contract_title_area').append('<div class="form_setting_error">メールアドレスを入力してください</div>');
          errorCount++;
          return false;
        }
      });
      $('.password').each(function(){
        var password = $(this).val();
        if(password == '') {
          $('.e_contract_title_area').append('<div class="form_setting_error">認証コードを入力してください</div>');
          errorCount++;
          return false;
        } else if(password.match(/^[A-Za-z0-9]{8,}$/) == null) {
          $('.e_contract_title_area').append('<div class="form_setting_error">認証コードが不適切です</div>');
          errorCount++;
          return false;
        }
      });
      if(errorCount != 0) {
        $('html, body').animate({scrollTop:0});
        return false;
      }
      var data = {
        id:                     $('#caseId').val(),
        client_id:              $('#client_id').val(),
        staff_type:             $('#staff_type').val(),
        staff_id:               $('#staff_id').val(),
        case_title:             $('#case_title').val(),
        e_contract_document_id: $('#e_contract_document_id option:selected').val(),
        have_amount:            $('#have_amount:checked').val(),
        amount:                 $('#amount').val(),
        agreement_date:         $('#agreement_date').val(),
        effective_date:         $('#effective_date').val(),
        expire_date:            $('#expire_date').val(),
        auto_renewal:           $('#auto_renewal:checked').val(),
        management_number:      $('#management_number').val(),
        comment:                $('#comment').val(),
        lastname:               lastname,
        firstname:              firstname,
        organization_name:      organization_name,
        title:                  title,
        email:                  email,
        password:               password,
        token:                  token
      }

      // 契約書、パートナー情報を登録
      $.ajax({
        url: "/e-contract-api/partners",
        type: "POST",
        dataType: "text",
        data: data
      }).done(function(res) {

        // inputs画面表示に必要な情報を取得
        var caseId = res.match(/\d+$/);
        $.ajax({
          url: "/e-contract-api/inputs",
          type: "GET",
          dataType: "json",
          data: {
            "id" : caseId[0]
          }
        }).done(function(res) {
          $('#partners').hide();

          $('#inputs').show();

          // case_idを設定
          $('#caseId').val(res['case'].id);

          // 契約書件数表示
          $('#fileCount').text(res['fileList'].length);
          // 契約書名表示
          $('.form_template-name').remove();
          $.each(res['fileList'], function(i, file) {
            $('#fileNameList').append('<div class="form_template-name"><span class="template-name_text">' + file.name + '<a class="file_target" id="' + (i + 1) + '"></a></span></div>');
          });

          // ユーザー名を取得
          var myUserInfo = $('#my_user_info').val();

          // 資料表示
          $('.form_setting_document_area').remove();
          $.each(res['materialList'], function(i, material) {
            $('#documentArea').append('<div class="form_setting_document_area"><div class="form_setting_document_img" id="document' + (i + 1) + '"><div class="form_setting_document_operation_area"><div class="form_setting_document_page_area"><div class="page-text"><span class="form_setting_document_page_count" id="pageId" data-id="' + (i + 1) + '">1</span>/<span class="form_setting_document_page_total">' + material.length + '</span>P</div><div class="form_setting_document_pager"><span class="form_setting_document_pager_prev">＜</span><span class="form_setting_document_pager_next">＞</span></div></div></span></div><div id="material' + i + '" class="form_setting_file_img"><img src="/cmn-e-contract/' + material[0].material_filename + '" alt="資料画像" class="documentId" id="' + res['fileList'][i].id + '"><img id="loading' + i + '" src="/img/e_contract_loading.gif" class="e_contract_loading"></div></div></div>');

            // フォーム表示
            $.each(res['formList'][i], function(fi, form) {
              if(form.type == 'text') {
                $('#material' + i).append('<div id="' + form.id + '" class="form_setting_parts_text_dammy form_setting_parts" data-input="0" data-page="' + form.page + '" style="position: absolute; top: ' + form.y / 2 + 'px; left: ' + form.x / 2 + 'px;"><div class="parts_inner_text_dammy" style="width: ' + form.width / 2 + 'px; height: ' + form.height / 2 + 'px; font-size: ' + form.font_size / 2 + 'px;">テキストが入ります</div><img class="partner_select_open" src="/img/partner_select.png"><div class="form_setting_partner_select"><p class="form_setting_partner_select_label">入力者<span class="require">必須</span></p><select class="partner_select" id="select_' + i + '_' + fi + '"><option disabled selected value>選択してください</option><option value="0">' + myUserInfo + '</option></select></div></div>');
              } else if(form.type == 'textarea') {
                $('#material' + i).append('<div id="' + form.id + '" class="form_setting_parts_textarea_dammy form_setting_parts" data-input="0" data-page="' + form.page + '" style="position: absolute; top: ' + form.y / 2 + 'px; left: ' + form.x / 2 + 'px;"><div class="parts_inner_textarea_dammy" style="width: ' + form.width / 2 + 'px; height: ' + form.height / 2 + 'px; font-size: ' + form.font_size / 2 + 'px;">複数行のテキストが入ります</div><img class="partner_select_open" src="/img/partner_select.png"><div class="form_setting_partner_select"><p class="form_setting_partner_select_label">入力者<span class="require">必須</span></p><select class="partner_select" id="select_' + i + '_' + fi + '"><option disabled selected value>選択してください</option><option value="0">' + myUserInfo + '</option></select></div></div>');
              } else if(form.type == 'sign') {
                $('#material' + i).append('<div id="' + form.id + '" class="form_setting_parts_sign_dammy form_setting_parts" data-page="' + form.page + '" style="position: absolute; top: ' + form.y / 2 + 'px; left: ' + form.x / 2 + 'px;"><div class="parts_inner_sign_dammy" style="width: ' + form.width / 2 + 'px; height: ' + form.height / 2 + 'px;"></div><img class="partner_select_open" src="/img/partner_select.png"><div class="form_setting_partner_select"><p class="form_setting_partner_select_label">入力者<span class="require">必須</span></p><select class="partner_select"><option disabled selected value>選択してください</option><option value="0">' + myUserInfo + '</option></select></div></div>');
              } else if(form.type == 'checkbox') {
                $('#material' + i).append('<div id="' + form.id + '" class="form_setting_parts_checkbox_dammy form_setting_parts" data-page="' + form.page + '" style="position: absolute; top: ' + form.y / 2 + 'px; left: ' + form.x / 2 + 'px;"><div class="parts_inner_checkbox_dammy" style="width: ' + form.width / 2 + 'px; height: ' + form.height / 2 + 'px;"></div><img class="partner_select_open" src="/img/partner_select.png"><div class="form_setting_partner_select checkbox"><p class="form_setting_partner_select_label">入力者<span class="require">必須</span></p><select class="partner_select"><option disabled selected value>選択してください</option><option value="0">' + myUserInfo + '</option></select><input id="checkbox' + form.id + '" name="checkbox' + form.id + '" type="checkbox"><label for="checkbox{$form.id}">入力を必須にする</label></div></div>');
              }
            });
          });

          // パートナーオプション追加
          $('.partner_select').each(function(i, select) {
            $.each(res['partnerList'], function(pi, partner) {
              $(select).append('<option value="' + partner.id + '">' + partner.lastname + partner.firstname + '</option>');
            });
          });

          $('#document1').css('display','block');
          var changeColorZone = $('#1').parents('.form_template-name');
          $(changeColorZone).addClass('form_template-name-change');
          var IntPageCount = 1;
          // 配列に保存されているテキストフォームを1つずつ取り出す
          var formText = document.getElementsByClassName('form_setting_parts_text_dammy ui-draggable ui-draggable-handle');
          for( var i=0 ; i < formText.length; i++){
            var formTextNum = formText[i];
          }
          // 配列に保存されているテキストエリアを1つずつ取り出す
          var formTextarea = document.getElementsByClassName('form_setting_parts_textarea_dammy ui-draggable ui-draggable-handle');
          for( var i=0 ; i < formTextarea.length; i++){
            var formTextareaNum = formTextarea[i];
          }
          // 配列に保存されているチェックボックスフォームを1つずつ取り出す
          var formCheck = document.getElementsByClassName('form_setting_parts_checkbox_dammy ui-draggable ui-draggable-handle');
          for(var i=0 ; i < formCheck.length; i++) {
            var formCheckNum = formCheck[i];
          }
          // 配列に保存されているサインフォームを1つずつ取り出す
          var formSign = document.getElementsByClassName('form_setting_parts_sign_dammy ui-draggable ui-draggable-handle');
          for(var i=0 ; i < formSign.length; i++){
            var formSignNum = formSign[i];
          }

          $('.form_setting_parts').css('background-color', 'transparent');
          $('.partner_select_open').css('display', 'none');

          $(".form_setting_parts_text_dammy").css('display','none');
          $(".form_setting_parts_textarea_dammy").css('display','none');
          $(".form_setting_parts_checkbox_dammy").css('display','none');
          $(".form_setting_parts_sign_dammy").css('display','none');
          $("[data-page = " + IntPageCount + "]").css('display','');

          // ボタンエリアの表示
          $('#buttonArea').html('<div class="return-button-box"><p>戻る</p><a href="javascript:void(0)" onClick="returnPartner();"></a></div><div class="signup-button-box"><p>確認</p><a href="javascript:void(0)" onClick="confirmEContract();"></a></div>');

          $('html, body').animate({scrollTop:0});

          var eContractCredential = $('#e_contract_credential').val();

          // 画面共有
          var data = {
            command : "E_CONTRACT",
            type : "SHOW_INPUTS",
            res : res,
            myUserInfo : myUserInfo,
            eContractCredential : eContractCredential
          };
          sendCommand(SEND_TARGET_ALL, data);

        }).fail(function(res) {
        });

      }).fail(function() {
      });
      return false;
    }, 1000);
  });

  // 戻るボタン
  $('#return_partner').on('click', function() {
    $('#inputs').hide();
    $('#partners').show();

    var caseId = $('#caseId').val();

    $.ajax({
      url: "/e-contract-api/delete-input",
      type: "POST",
      data: {
        "case_id" : caseId
      }
    }).done(function(res) {
      // 画面共有
      var data = {
        command : "E_CONTRACT",
        type : "RETURN_PARTNER"
      };
      sendCommand(SEND_TARGET_ALL, data);
    }).fail(function(res) {
    });
  });

  // 確認ボタン押下時
  $('#confirm_e_contract').on('click', function() {
    // フォームを取得
    var forms = document.getElementsByClassName('form_setting_parts');
    // 設定済みフォームを取得
    var done = document.getElementsByClassName('done');
    // 印影self設定フォームを取得
    var selfSign = document.getElementsByClassName('self_sign');
    // 印影partner設定フォームを取得
    var partnerSign = document.getElementsByClassName('partner_sign');

    // 全て入力済みか.
    let isEntered = [].slice.call(document.getElementsByClassName('form_setting_parts')).map(e => {
      // チェックボックス型の場合は「入力を必須にする」の状態を考慮する.
      let isInputRequired = true;
      let id = e.getAttribute("id");
      let checkbox = document.getElementById("checkbox"+id);
      if( checkbox != null) {
        isInputRequired = checkbox.checked;
      }
      let isInputData = 0 < e.getElementsByClassName("done").length;
      return isInputData || isInputRequired == false;
    }).indexOf(false) == -1;

    if(!isEntered) {
      // 未設定済みのフォームがある場合
      $('.form_setting_error').remove();
      $('html, body').animate({scrollTop:0});
      $('.e_contract_title_area').append('<div class="form_setting_error">全てのフォームに入力者を設定してください</div>');
    } else if(selfSign.length < 1) {
      // self印影が１も無い場合
      $('.form_setting_error').remove();
      $('html, body').animate({scrollTop:0});
      $('.e_contract_title_area').append('<div class="form_setting_error">自身を印影入力者に設定してください</div>');
    } else if(partnerSign.length < 1) {
      // partner印影が１も無い場合
      $('.form_setting_error').remove();
      $('html, body').animate({scrollTop:0});
      $('.e_contract_title_area').append('<div class="form_setting_error">パートナーを印影入力者に設定してください</div>');
    } else {
      // 確認画面に変更
      $('.form_setting_error').remove();
      $('.e_contract_title_area h2').text('3.内容確認');
      $('.e_contract_title_area p').html('下記内容でよろしければ「送信」をクリックしてください。<br>入力した宛先に下記の電子契約書が送付されます。');

      var caseId = $('#caseId').val();
      $.ajax({
        url: '/e-contract-api/confirm',
        type: "GET",
        dataType: "json",
        data: {
          "id" : caseId
        }
      }).done(function(res) {

        // 契約書情報表示
        if(res['case'].auto_renewal == 1) {
          var autoRenewal = 'あり';
        } else {
          var autoRenewal = 'なし';
        }
        if(res['case'].amount == null) {
          var amount = '0';
        } else {
          var amount = separate(res['case'].amount);
        }
        if(res['case'].agreement_date == null) {
          var agreementDate = '';
        } else {
          var y = res['case'].agreement_date.substr(0, 4);
          var m = res['case'].agreement_date.substr(5, 2);
          var d = res['case'].agreement_date.substr(8);
          var agreementDate = y + '年' + m + '月' + d + '日';
        }
        if(res['case'].effective_date == null) {
          var effectiveDate = '';
        } else {
          var y = res['case'].effective_date.substr(0, 4);
          var m = res['case'].effective_date.substr(5, 2);
          var d = res['case'].effective_date.substr(8);
          var effectiveDate = y + '年' + m + '月' + d + '日';
        }
        if(res['case'].expire_date == null) {
          var expireDate = '';
        } else {
          var y = res['case'].expire_date.substr(0, 4);
          var m = res['case'].expire_date.substr(5, 2);
          var d = res['case'].expire_date.substr(8);
          var expireDate = y + '年' + m + '月' + d + '日';
        }

        if(res['case'].have_amount == 1) {
          $('#caseInfoArea').append('<div class="form_setting_file_area"><p class="form_setting_label">契約書設定</p><table class="form_setting_table"><tr><th class="form_setting_table_label">テンプレート名</th><td class="form_setting_table_item">' + res['document'].name + '</tr><tr><th class="form_setting_table_label">契約金額の有無</th><td class="form_setting_table_item">あり</td></tr><tr><th class="form_setting_table_label">契約金額</th><td class="form_setting_table_item">' + amount + ' 円</td></tr><tr><th class="form_setting_table_label">合意日</th><td class="form_setting_table_item">' + agreementDate + '</td></tr><tr><th class="form_setting_table_label">期間</th><td class="form_setting_table_item_date"><div class="form_setting_table_date"><span>発効日</span>' + effectiveDate + '</div><div class="form_setting_table_date"><span>終了日</span>' + expireDate + '</div></td></tr><tr><th class="form_setting_table_label">契約自動更新の有無</th><td class="form_setting_table_item">' + autoRenewal + '</tr><tr><th class="form_setting_table_label">任意の管理番号</th><td class="form_setting_table_item">' + res['case'].management_number + '</td></tr><tr><th class="form_setting_table_label">任意のコメント</th><td class="form_setting_table_item">' + res['case'].comment + '</td></tr></table></div>');
        } else {
          $('#caseInfoArea').append('<div class="form_setting_file_area"><p class="form_setting_label">契約書設定</p><table class="form_setting_table"><tr><th class="form_setting_table_label">テンプレート名</th><td class="form_setting_table_item">' + res['document'].name + '</tr><tr><th class="form_setting_table_label">契約金額の有無</th><td class="form_setting_table_item">なし</td></tr><tr><th class="form_setting_table_label">合意日</th><td class="form_setting_table_item">' + agreementDate + '</td></tr><tr><th class="form_setting_table_label">期間</th><td class="form_setting_table_item_date"><div class="form_setting_table_date"><span>発効日</span>' + effectiveDate + '</div><div class="form_setting_table_date"><span>終了日</span>' + expireDate + '</div></td></tr><tr><th class="form_setting_table_label">契約自動更新の有無</th><td class="form_setting_table_item">' + autoRenewal + '</tr><tr><th class="form_setting_table_label">任意の管理番号</th><td class="form_setting_table_item">' + res['case'].management_number + '</td></tr><tr><th class="form_setting_table_label">任意のコメント</th><td class="form_setting_table_item">' + res['case'].comment + '</td></tr></table></div>');
        }

        // 契約物情報表示
        $('#partnerArea').show();
        var partnerCount = 1;
        $.each(res['partnerList'], function(i, partner) {
          if(partner.approval_status == '1') {
            $('#partnerArea').append('<div class="form_setting_partner_item approval"><div class="form_setting_partner_number"><img src="/img/check_green.svg"></div><div class="form_setting_partner_name">' + partner.lastname + partner.firstname + '</div><div class="form_setting_partner_organization">' + partner.organization_name + '</div><div class="form_setting_partner_email">' + partner.email + '</div></div>');
          } else {
            $('#partnerArea').append('<div class="form_setting_partner_item unapproved"><div class="form_setting_partner_number">' + partnerCount + '</div><div class="form_setting_partner_name">' + partner.lastname + partner.firstname + '</div><div class="form_setting_partner_organization">' + partner.organization_name + '</div><div class="form_setting_partner_email">' + partner.email + '</div></div>');
            partnerCount++;
          }
        });

        // メッセージエリアの表示
        $('#messageArea').show();

        // ボタンエリアの表示
        $('#buttonArea').html('<div class="signup-button-box"><p>送信</p><a href="javascript:void(0)" onClick="sendEContract();"></a></div>');

        $('html, body').animate({scrollTop:0});

        // 画面共有
        var data = {
            command : "E_CONTRACT",
            type : "SHOW_CONFIRM",
            res : res
        };
        sendCommand(SEND_TARGET_ALL, data);
      }).fail(function(res) {
      });

    }
  });

  // 登録ボタン押下時
  function sendEContract() {
    // フォームを取得
    var forms = document.getElementsByClassName('form_setting_parts');
    // 設定済みフォームを取得
    var done = document.getElementsByClassName('done');
    // 印影self設定フォームを取得
    var selfSign = document.getElementsByClassName('self_sign');
    // 印影partner設定フォームを取得
    var partnerSign = document.getElementsByClassName('partner_sign');

    // 全て入力済みか.
    let isEntered = [].slice.call(document.getElementsByClassName('form_setting_parts')).map(e => {
      // チェックボックス型の場合は「入力を必須にする」の状態を考慮する.
      let isInputRequired = true;
      let id = e.getAttribute("id");
      let checkbox = document.getElementById("checkbox"+id);
      if( checkbox != null) {
        isInputRequired = checkbox.checked;
      }
      let isInputData = 0 < e.getElementsByClassName("done").length;
      return isInputData || isInputRequired == false;
    }).indexOf(false) == -1;

    if(!isEntered) {
      // 未設定済みのフォームがある場合
      $('.form_setting_error').remove();
      $('html, body').animate({scrollTop:0});
      $('.e_contract_title_area').append('<div class="form_setting_error">全てのフォームに入力者を設定してください</div>');
    } else if(selfSign.length < 1) {
      // self印影が１も無い場合
      $('.form_setting_error').remove();
      $('html, body').animate({scrollTop:0});
      $('.e_contract_title_area').append('<div class="form_setting_error">自身を印影入力者に設定してください</div>');
    } else if(partnerSign.length < 1) {
      // partner印影が１も無い場合
      $('.form_setting_error').remove();
      $('html, body').animate({scrollTop:0});
      $('.e_contract_title_area').append('<div class="form_setting_error">パートナーを印影入力者に設定してください</div>');
    } else {
      
      if($('.unapproved').length != 0) {
        // 未承認パートナーがいる場合
        // 1人目のパートナーに承認依頼メールを送信する
        var caseId = $('#caseId').val();
        var message = $('#message').val();

        $.ajax({
          url: "/e-contract-api/send-approval-request",
          type: "POST",
          dataType: "json",
          data: {
            "case_id"    : caseId,
            "message"    : message
          },
        }).done(function(res) {
          // 送信が成功したら送信完了画面を表示
          $('#inputs').hide();
          $('#done').show();

          // 画面共有
          var data = {
              command : "E_CONTRACT",
              type : "SENDED_APPROVAL"
          };
          sendCommand(SEND_TARGET_ALL, data);
        }).fail(function(res) {
        });
      } else {
        // 全員承認済みの場合、即時契約する
        var caseId = $('#caseId').val();
        var credential = $("#e_contract_credential").val();
        // 電子契約API登録と全員にメール送信
        $.ajax({
          url: "/e-contract-api/onestop-signing",
          type: "POST",
          dataType: "json",
          data: {
            "case_id" : caseId,
            "credential" : credential
          }
        }).done(function(res) {
          if(res.status == 200) {
            // 送信が成功したら契約完了画面を表示
            $('#inputs').hide();
            $('#done').show();
            // 契約済み契約書のパスを追加してダウンロード
            var downloadFilePath = "https://" + location.host + res.filePath;
            $('#download_contract').attr('href', downloadFilePath);
            $('#download_contract')[0].click();

            // 画面共有
            var data = {
              command : "E_CONTRACT",
              type : "DOWNLOAD_DOCUMENT",
              downloadFilePath : downloadFilePath
            };
            sendCommand(SEND_TARGET_ALL, data);
          }
        }).fail(function(res) {
        });
      }

    }
  }

  /**
  * base64から画像ファイルサイズを取得
  **/
  function base64ToFile(data) {
    try{
      let separetedDate = data.split(',');
      let mimeTypeData = separetedDate[0].match(/:(.*?);/);
      let mimeType = Array.isArray(mimeTypeData) ? mimeTypeData[0] : '';
      let decodedData = atob(separetedDate[1]);
      let dataLength = decodedData.length;
      let arrayBuffer = new ArrayBuffer(dataLength);
      let u8arr = new Uint8Array(arrayBuffer);

      for( let i = 0; i < dataLength; i +=1){
        u8arr[i] = decodedData.charCodeAt(i);
      }

      return new Blob([u8arr] , {type:mimeType});

    }catch (errors){
      console.log(errors);
      return new Blob([])
    }
  }

  /**
  * 電子契約画面キャンセルボタン押下時のイベント
  **/
  $(document).on('click', '#e_contract_cancel', function(){
    // ビデオチャット画面でビデオ展開されるように戻す
    $('#mi_content_area_negotiation').attr('ondrop', 'materialDrop(event)');
    $('#e_contract_area').toggle();
    var data = {
      command : "E_CONTRACT",
      type : "TOGGLE_E_CONTRACT",
      display : $("#e_contract_area").css('display')
    };
    sendCommand(SEND_TARGET_ALL, data);
  });

  /**
  * 電子契約完了画面で閉じるボタン押下時のイベント
  **/
  $(document).on('click', '#e_contract_done', function(){
    // 完了画面の非表示
    $('#e_contract_area').toggle();
    $('#partners').show();
    $('#done').hide();

    // 電子契約書を初期化
    initEContract();

    var data = {
      command : "E_CONTRACT",
      type : "INIT_E_CONTRACT",
      display : $("#e_contract_area").css('display')
    };
    sendCommand(SEND_TARGET_ALL, data);
  });


  // 契約情報、パートナー企業情報を書き込んだ場合のイベント処理
  $(document).on('input', '.e_contract_info_text, .e_contract_info_radio', function(){
    var name = $(this).attr('name');
    if (name === 'text') {
      // カードル位置を取得
      var p = $(this).get(0).selectionStart;
      var np = p + $(this).length;
    }

    if(name == 'have_amount' || name == 'auto_renewal') {
      var data = {
          command : "E_CONTRACT",
          type : "SEND_CHECK",
          input : $('[name='+name+']:checked').val(),
          name : name
      };
     } else {
      var data = {
          command : "E_CONTRACT",
          type : "SEND_INPUT",
          input : $(this).val(),
          name : name,
          focusPosition : np
      };
     }
    sendCommand(SEND_TARGET_ALL, data);
  });

  // 契約情報、パートナーメッセージを書き込んだ場合のイベント処理
  $(document).on('input', '.e_contract_info_message', function(){ 
    // カードル位置を取得
    var p = $(this).get(0).selectionStart;
    var np = p + $(this).length;
    var name = $(this).attr('name');

    var data = {
        command : "E_CONTRACT",
        type : "SEND_TEXT",
        input : $(this).val(),
        name : name,
        focusPosition : np
    };
    sendCommand(SEND_TARGET_ALL, data);
  });

  // 契約金額の有無で金額インプットの表示を操作
  $('#haveAmount0').on('click', function() {
    $('#contract_amount').addClass('hiddenInput');
    // 他のユーザーの金額インプットを非表示にする
    var data = {
      command : "E_CONTRACT",
      type : "HIDE_AMOUNT_INPUT"
    };
    sendCommand(SEND_TARGET_ALL, data);
  });
  $('#haveAmount1').on('click', function() {
    $('#contract_amount').removeClass('hiddenInput');
    // 他のユーザーの金額インプットを表示する
    var data = {
      command : "E_CONTRACT",
      type : "APPEAR_AMOUNT_INPUT"
    };
    sendCommand(SEND_TARGET_ALL, data);
  });

})

/**
 * 電子契約書フォーマットを初期化
 * @returns
 */
function initEContract(){

  $('.form_setting_error').remove();
  $('.e_contract_title_area h2').text('1.契約書・宛先の設定');
  $('.e_contract_title_area p').text('契約を交わす相手の情報を入力し、契約書にサインを行う順番を設定してください。<br>サインをする順番は、詳細情報パネルをドラッグ&ドロップで移動するか、位置変更ボタンをクリックしてください。');
  $('.tel-note').text();

  // 電子契約書を初期化
  $('#case_title').val("");
  $('input:radio[name="have_amount"]:eq(1)').prop('checked', true);
  $('#amount_row').hide();
  $('#amount').prop('disabled', true);
  $('#e_contract_document_id').attr("selected", false);
  $('#agreement_date').val("");
  $('#effective_date').val("");
  $('#expire_date').val("");
  $('input:radio[name="auto_renewal"]:eq(1)').prop('checked', true);
  $('#management_number').val("");
  $('#comment').val("");

  // 宛先を初期化
  let partners = $("#partner-area").find('.partner_setting_input_area');
  let inputArray = [
    '.lastname',
    '.firstname',
    '.organization_name',
    '.title',
    '.email',
    '#password',
    '#tel',
  ];
  for(var i = 0; i < partners.length; i++) {
    if (i !== 0) {
      $('.partner_setting_item').eq(1).remove();
      return;
    }
    $.each(inputArray, function(index, val) {
      if ($('#client_id').val() === '0') {
        $('.partner_setting_item').eq(i).find(val).val("");
        $('.partner_setting_item').eq(i).find(val).css("background-color", "");
        $('.partner_setting_item').eq(i).find(val).removeAttr("readonly");
      } else {
        if (val === '#password' || val === '#tel') {
          $('.partner_setting_item').eq(i).find(val).val("");
          $('.partner_setting_item').eq(i).find(val).val("");
        } else {
          $('.partner_setting_item').eq(i).find(val).val("");
          $('.partner_setting_item').eq(i).find(val).css("background-color", "");
          $('.partner_setting_item').eq(i).find(val).removeAttr("readonly");
        }
      }
    });
  }
}


/**
 * 相手から送信された電子契約の情報を受取る関数
 * @param json
 */
function receiveEContractJson(json) {
  if (json.type == "INIT_E_CONTRACT"){
    // 完了画面の非表示
    $('#partners').show();
    $('#done').hide();
    $('#e_contract_area').toggle();

    // 電子契約書を初期化
    initEContract();

  } else if(json.type == "TOGGLE_E_CONTRACT"){
    // 電子契約の表示非表示切替
    if(json.display == "table" || json.display ==  "block"){
      $("#e_contract_area").show();
    }else{
      $("#e_contract_area").hide();
    }

    // 入力データを同期
    $('#case_title').val(json.case_title);
    $('input[name=have_amount]:checked').val(json.have_amount);
    $('#amount').val(json.amount);
    $('#e_contract_document_id option:selected').val(json.e_contract_document_id);
    $('#agreement_date').val(json.agreement_date);
    $('#effective_date').val(json.effective_date);
    $('#expire_date').val(json.expire_date);
    $('#auto_renewal:checked').val(json.auto_renewal);
    $('#management_number').val(json.management_number);
    $('#comment').val(json.comment);

    // 宛先
    for(var i = 0; i < json.partner.length; i++) {
      let nextArea = $('.partner_setting_item').eq(i);
      if (nextArea.length == 0) {
        // ホストが宛先を複数追加している場合
        var num = i+1;
        $('#partner-area').append('<div class="partner_setting_item"><div class="partner_setting_item_header"><p><span class="icon-parsonal"></span><span class="partner_setting_item_count">' + num + '人目</span>：' + num + '番目に契約書にサインを行う人</p><div id="partner-remove" class="partner_setting_item_remove">×</div></div><div class="partner_setting_input_area"><div class="partner_setting_input_row"><label>氏名<span class="require">必須</span></label><input type="text" name="lastname' + num + '" class="partner_setting_input_name lastname e_contract_info_text" placeholder="田中"><input type="text" name="firstname' + num + '" class="partner_setting_input_name firstname e_contract_info_text" placeholder="太郎"></div><div class="partner_setting_input_row"><label>企業名</label><input type="text" name="organization_name' + num + '" placeholder="入力してください" class="partner_setting_input organization_name e_contract_info_text"></div><div class="partner_setting_input_row"><label>役職</label><input type="text" name="title' + num + '" placeholder="入力してください" class="partner_setting_input title e_contract_info_text"></div><div class="partner_setting_input_row"><label>メールアドレス<span class="require">必須</span></label><input type="email" name="email' + num + '" placeholder="aaaaa@aaaaa.jp" class="partner_setting_input email e_contract_info_text"></div><div class="partner_setting_input_row"><label>認証コード<span class="note">（8文字以上の半角英数字）</span><span class="require">必須</span></label><p class="sign-text-note">認証コードを設定してください。作成した電子契約を閲覧したいときに使います。</p><input type="text" id="password" name="password' + num + '" class="partner_setting_input_name password e_contract_info_text"></div><div id="authorization-code" class="partner_setting_input_row"><label>電話番号<span class="note">（ハイフンなし）</span></label><p class="authorization-code-note">ルーム内で契約を完了させたい場合は、電話番号を入力して認証するを押下してください。</p><input type="number" id="tel" name="tel' + num + '" class="partner_setting_input_name e_contract_info_text"><span id="send-tel" class="partner_setting_send_code">認証する</span></div><input type="hidden" name="token' + num + '" id="token" class="token" value=""><div class="partner_setting_item_lifting"><p class="partner_setting_item_lifting_label">承認順の変更</p><div class="partner_setting_item_lifting_btnarea"><div id="approval_down" class="partner_setting_item_lifting_btn">▼</div><div id="approval_up" class="partner_setting_item_lifting_btn">▲</div></div></div></div></div>');
      }
      $('.partner_setting_item').eq(i).find('.lastname').val(json.lastname[i]);
      $('.partner_setting_item').eq(i).find('.firstname').val(json.firstname[i]);
      $('.partner_setting_item').eq(i).find('.organization_name').val(json.organization_name[i]);
      $('.partner_setting_item').eq(i).find('.title').val(json.title[i]);
      $('.partner_setting_item').eq(i).find('.email').val(json.email[i]);

    }
    // ゲスト側非表示パーツ
    if ($('#client_id').val() === '0') {
      $('#e_contract_cancel').hide();
      $('#submit_button').hide();
      $('.partner_setting_template_select').hide();
      $('#e_contract_document_td').parent().hide();
    }
  } else if(json.type == "SEND_DOCUMENT_NAME"){
    // テンプレート名を表示する
    $('#e_contract_document_text').text(json.documentName);
	}else if(json.type == "SHOW_DOCUMENT"){
    // ユーザー一覧ダイアログ表示中の場合は閉じる
    //
    //
  } else if(json.type == "SEND_INPUT") {
    if(json.name.match(/password/)) {
      $("input[name=\"" + json.name + "\"]").css('background-color', '#efefef');
      $("input[name=\"" + json.name + "\"]").attr('type', 'password');
      $("input[name=\"" + json.name + "\"]").attr('readonly', true);
      $("input[name=\"" + json.name + "\"]").parent().parent().find('#tel').css('background-color', '#efefef');
      $("input[name=\"" + json.name + "\"]").parent().parent().find('#tel').attr('type', 'password');
      $("input[name=\"" + json.name + "\"]").parent().parent().find('#tel').attr('readonly', true);
    } else if(json.name.match(/tel/)) {
      $("input[name=\"" + json.name + "\"]").css('background-color', '#efefef');
      $("input[name=\"" + json.name + "\"]").attr('type', 'password');
      $("input[name=\"" + json.name + "\"]").attr('readonly', true);
      $("input[name=\"" + json.name + "\"]").parent().parent().find('#password').css('background-color', '#efefef');
      $("input[name=\"" + json.name + "\"]").parent().parent().find('#password').attr('type', 'password');
      $("input[name=\"" + json.name + "\"]").parent().parent().find('#password').attr('readonly', true);
    }
    // インプットテキスト
    $("input[name=\"" + json.name + "\"]").val(json.input);
    $("input[name=\"" + json.name + "\"]").attr('selectionEnd', json.focusPosition);
    $("input[name=\"" + json.name + "\"]").attr('selectionStart', json.focusPosition);
    $("input[name=\"" + json.name + "\"]").focus();
  } else if(json.type == "PARTNER_FIX") {
    var partner = $('.partner_setting_item').eq(json.index).find('.partner_setting_input_area');
    // tokenをidに入れて保管
    partner.find('#token').val(json.token);
    // 050番号にかけるようにメッセージを表示
    partner.find('.tel-note').remove();
    partner.append('<p class="tel-note">ただいま承認中</p>');

    // 氏名、企業名、役職、メールアドレス、認証コード、承認順を固定する
    partner.find("[name^='lastname']").attr('readonly', true);
    partner.find("[name^='lastname']").css('background-color', '#efefef');
    partner.find("[name^='firstname']").attr('readonly', true);
    partner.find("[name^='firstname']").css('background-color', '#efefef');
    partner.find("[name^='organization_name']").attr('readonly', true);
    partner.find("[name^='organization_name']").css('background-color', '#efefef');
    partner.find("[name^='title']").attr('readonly', true);
    partner.find("[name^='title']").css('background-color', '#efefef');
    partner.find("[name^='email']").attr('readonly', true);
    partner.find("[name^='email']").css('background-color', '#efefef');
    partner.find("[name^='password']").attr('readonly', true);
    partner.find("[name^='password']").css('background-color', '#efefef');
    // partner.parent().find('#partner-remove').remove();
    // partner.find('.partner_setting_item_lifting').remove();
  } else if(json.type == "PARTNER_ADD") {
    // 承認者追加
    if($('#client_id').val() == 0) {
      $('#partner-area').append('<div class="partner_setting_item"><div class="partner_setting_item_header"><p><span class="icon-parsonal"></span><span class="partner_setting_item_count">' + json.index + '人目</span>：' + json.index + '番目に契約書にサインを行う人</p><div id="partner-remove" class="partner_setting_item_remove">×</div></div><div class="partner_setting_input_area"><div class="partner_setting_input_row"><label>氏名<span class="require">必須</span></label><input type="text" name="lastname' + json.index + '" class="partner_setting_input_name lastname e_contract_info_text" placeholder="田中"><input type="text" name="firstname' + json.index + '" class="partner_setting_input_name firstname e_contract_info_text" placeholder="太郎"></div><div class="partner_setting_input_row"><label>企業名</label><input type="text" name="organization_name' + json.index + '" placeholder="入力してください" class="partner_setting_input organization_name e_contract_info_text"></div><div class="partner_setting_input_row"><label>役職</label><input type="text" name="title' + json.index + '" placeholder="入力してください" class="partner_setting_input title e_contract_info_text"></div><div class="partner_setting_input_row"><label>メールアドレス<span class="require">必須</span></label><input type="email" name="email' + json.index + '" placeholder="aaaaa@aaaaa.jp" class="partner_setting_input email e_contract_info_text"></div><div class="partner_setting_input_row"><label>認証コード<span class="note">（8文字以上の半角英数字）</span><span class="require">必須</span></label><p class="sign-text-note">認証コードを設定してください。作成した電子契約を閲覧したいときに使います。</p><input type="text" id="password" name="password' + json.index + '" class="partner_setting_input_name password e_contract_info_text"></div><div id="authorization-code" class="partner_setting_input_row"><label>電話番号<span class="note">（ハイフンなし）</span></label><p class="authorization-code-note">ルーム内で契約を完了させたい場合は、電話番号を入力して認証するを押下してください。</p><input type="number" id="tel" name="tel' + json.index + '" class="partner_setting_input_name e_contract_info_text"><span id="send-tel" class="partner_setting_send_code">認証する</span></div><input type="hidden" name="token' + json.index + '" id="token" class="token" value=""><div class="partner_setting_item_lifting"><p class="partner_setting_item_lifting_label">承認順の変更</p><div class="partner_setting_item_lifting_btnarea"><div id="approval_down" class="partner_setting_item_lifting_btn">▼</div><div id="approval_up" class="partner_setting_item_lifting_btn">▲</div></div></div></div></div>');
    } else {
      $('#partner-area').append('<div class="partner_setting_item"><div class="partner_setting_item_header"><p><span class="icon-parsonal"></span><span class="partner_setting_item_count">' + json.index + '人目</span>：' + json.index + '番目に契約書にサインを行う人</p><div id="partner-remove" class="partner_setting_item_remove">×</div></div><div class="partner_setting_input_area"><div class="partner_setting_input_row"><label>氏名<span class="require">必須</span></label><input type="text" name="lastname' + json.index + '" class="partner_setting_input_name lastname e_contract_info_text" placeholder="田中"><input type="text" name="firstname' + json.index + '" class="partner_setting_input_name firstname e_contract_info_text" placeholder="太郎"></div><div class="partner_setting_input_row"><label>企業名</label><input type="text" name="organization_name' + json.index + '" placeholder="入力してください" class="partner_setting_input organization_name e_contract_info_text"></div><div class="partner_setting_input_row"><label>役職</label><input type="text" name="title' + json.index + '" placeholder="入力してください" class="partner_setting_input title e_contract_info_text"></div><div class="partner_setting_input_row"><label>メールアドレス<span class="require">必須</span></label><input type="email" name="email' + json.index + '" placeholder="aaaaa@aaaaa.jp" class="partner_setting_input email e_contract_info_text"></div><div class="partner_setting_input_row"><label>認証コード<span class="note">（8文字以上の半角英数字）</span><span class="require">必須</span></label><p class="sign-text-note">※ 認証コードはゲスト側で入力をお願いいたします。</p><input type="password" id="password" name="password' + json.index + '" class="partner_setting_input_name password e_contract_info_text" readonly style="background-color: rgb(239, 239, 239);"></div><div id="authorization-code" class="partner_setting_input_row"><label>電話番号<span class="note">（ハイフンなし）</span></label><p class="authorization-code-note">※電話番号はゲスト側で入力をお願いいたします。</p><input type="password" id="tel" name="tel' + json.index + '" class="partner_setting_input_name e_contract_info_text" readonly style="background-color: rgb(239, 239, 239);"></div><input type="hidden" name="token' + json.index + '" id="token" class="token" value=""><div class="partner_setting_item_lifting"><p class="partner_setting_item_lifting_label">承認順の変更</p><div class="partner_setting_item_lifting_btnarea"><div id="approval_down" class="partner_setting_item_lifting_btn">▼</div><div id="approval_up" class="partner_setting_item_lifting_btn">▲</div></div></div></div></div>');
    }
  } else if(json.type == "APPROVAL_UP") {
    // 承認順を上げる
    var inputArea = $('.partner_setting_item').eq(json.index);
    var clientId = $('#client_id').val();
    if(inputArea.find("[name^='lastname']").attr('readonly') == 'readonly') {
      var authFlg = true;
    } else {
      var authFlg = false;
    }
    if(inputArea.find("[name^='password']").attr('readonly') == 'readonly') {
      var passAuthFlg = true;
    } else {
      var passAuthFlg = false;
    }
    if(inputArea.find("[name^='tel']").attr('readonly') == 'readonly') {
      var telAuthFlg = true;
    } else {
      var telAuthFlg = false;
    }
    var lastName = inputArea.find("[name^='lastname']").val();
    var firstName = inputArea.find("[name^='firstname']").val();
    var organizationName = inputArea.find("[name^='organization_name']").val();
    var title = inputArea.find("[name^='title']").val();
    var email = inputArea.find("[name^='email']").val();
    var password = inputArea.find("[name^='password']").val();
    var tel = inputArea.find("[name^='tel']").val();
    var token = inputArea.find("#token").val();

    var preArea = $('.partner_setting_item').eq(json.index - 1);
    if(preArea.find("[name^='lastname']").attr('readonly') == 'readonly') {
      var preAuthFlg = true;
    } else {
      var preAuthFlg = false;
    }
    if(preArea.find("[name^='password']").attr('readonly') == 'readonly') {
      var prePassAuthFlg = true;
    } else {
      var prePassAuthFlg = false;
    }
    if(preArea.find("[name^='tel']").attr('readonly') == 'readonly') {
      var preTelAuthFlg = true;
    } else {
      var preTelAuthFlg = false;
    }
    var preLastName = preArea.find("[name^='lastname']").val();
    var preFirstName = preArea.find("[name^='firstname']").val();
    var preOrganizationName = preArea.find("[name^='organization_name']").val();
    var preTitle = preArea.find("[name^='title']").val();
    var preEmail = preArea.find("[name^='email']").val();
    var prePassword = preArea.find("[name^='password']").val();
    var preTel = preArea.find("[name^='tel']").val();
    var preToken = preArea.find("#token").val();

    inputArea.find("[name^='lastname']").val(preLastName);
    inputArea.find("[name^='firstname']").val(preFirstName);
    inputArea.find("[name^='organization_name']").val(preOrganizationName);
    inputArea.find("[name^='title']").val(preTitle);
    inputArea.find("[name^='email']").val(preEmail);
    inputArea.find("[name^='password']").val(prePassword);
    inputArea.find("[name^='tel']").val(preTel);
    if(preAuthFlg == true) {
      inputArea.find("[name^='lastname']").attr('readonly', true);
      inputArea.find("[name^='lastname']").css('background-color', '#efefef');
      inputArea.find("[name^='firstname']").attr('readonly', true);
      inputArea.find("[name^='firstname']").css('background-color', '#efefef');
      inputArea.find("[name^='organization_name']").attr('readonly', true);
      inputArea.find("[name^='organization_name']").css('background-color', '#efefef');
      inputArea.find("[name^='title']").attr('readonly', true);
      inputArea.find("[name^='title']").css('background-color', '#efefef');
      inputArea.find("[name^='email']").attr('readonly', true);
      inputArea.find("[name^='email']").css('background-color', '#efefef');
      inputArea.find("#token").val(preToken);
      inputArea.find('.tel-note').remove();
    } else {
      inputArea.find("[name^='lastname']").attr('readonly', false);
      inputArea.find("[name^='lastname']").css('background-color', '#fff');
      inputArea.find("[name^='firstname']").attr('readonly', false);
      inputArea.find("[name^='firstname']").css('background-color', '#fff');
      inputArea.find("[name^='organization_name']").attr('readonly', false);
      inputArea.find("[name^='organization_name']").css('background-color', '#fff');
      inputArea.find("[name^='title']").attr('readonly', false);
      inputArea.find("[name^='title']").css('background-color', '#fff');
      inputArea.find("[name^='email']").attr('readonly', false);
      inputArea.find("[name^='email']").css('background-color', '#fff');
      inputArea.find("#token").val('');
      inputArea.find('.tel-note').remove();
    }
    if(prePassAuthFlg == true) {
      inputArea.find("[name^='password']").attr('readonly', true);
      inputArea.find("[name^='password']").css('background-color', '#efefef');
      inputArea.find("[name^='password']").attr('type', 'password');
    } else {
      inputArea.find("[name^='password']").attr('readonly', false);
      inputArea.find("[name^='password']").css('background-color', '#fff');
      inputArea.find("[name^='password']").attr('type', 'text');
    }
    if(preTelAuthFlg == true) {
      inputArea.find("[name^='tel']").attr('readonly', true);
      inputArea.find("[name^='tel']").css('background-color', '#efefef');
      inputArea.find("[name^='tel']").attr('type', 'password');
    } else {
      inputArea.find("[name^='tel']").attr('readonly', false);
      inputArea.find("[name^='tel']").css('background-color', '#fff');
      inputArea.find("[name^='tel']").attr('type', 'text');
    }
    if(preAuthFlg == true && preTelAuthFlg == true) {
      inputArea.find('#authorization-code').append('<p class="tel-note">ただいま承認中</p>');
    } else if(preAuthFlg == true && preTelAuthFlg == false) {
      inputArea.find('#authorization-code').append('<p class="tel-note">上記番号から050-5213-3059にかけてください。<br>認証が成功すると自動で電話が切れます。</p>');
    }

    preArea.find("[name^='lastname']").val(lastName);
    preArea.find("[name^='firstname']").val(firstName);
    preArea.find("[name^='organization_name']").val(organizationName);
    preArea.find("[name^='title']").val(title);
    preArea.find("[name^='email']").val(email);
    preArea.find("[name^='password']").val(password);
    preArea.find("[name^='tel']").val(tel);
    if(authFlg == true) {
      preArea.find("[name^='lastname']").attr('readonly', true);
      preArea.find("[name^='lastname']").css('background-color', '#efefef');
      preArea.find("[name^='firstname']").attr('readonly', true);
      preArea.find("[name^='firstname']").css('background-color', '#efefef');
      preArea.find("[name^='organization_name']").attr('readonly', true);
      preArea.find("[name^='organization_name']").css('background-color', '#efefef');
      preArea.find("[name^='title']").attr('readonly', true);
      preArea.find("[name^='title']").css('background-color', '#efefef');
      preArea.find("[name^='email']").attr('readonly', true);
      preArea.find("[name^='email']").css('background-color', '#efefef');
      preArea.find("#token").val(token);
      preArea.find('.tel-note').remove();
    } else {
      preArea.find("[name^='lastname']").attr('readonly', false);
      preArea.find("[name^='lastname']").css('background-color', '#fff');
      preArea.find("[name^='firstname']").attr('readonly', false);
      preArea.find("[name^='firstname']").css('background-color', '#fff');
      preArea.find("[name^='organization_name']").attr('readonly', false);
      preArea.find("[name^='organization_name']").css('background-color', '#fff');
      preArea.find("[name^='title']").attr('readonly', false);
      preArea.find("[name^='title']").css('background-color', '#fff');
      preArea.find("[name^='email']").attr('readonly', false);
      preArea.find("[name^='email']").css('background-color', '#fff');
      preArea.find("#token").val('');
      preArea.find('.tel-note').remove();
    }
    if(passAuthFlg == true) {
      preArea.find("[name^='password']").attr('readonly', true);
      preArea.find("[name^='password']").css('background-color', '#efefef');
      preArea.find("[name^='password']").attr('type', 'password');
    } else {
      preArea.find("[name^='password']").attr('readonly', false);
      preArea.find("[name^='password']").css('background-color', '#fff');
      preArea.find("[name^='password']").attr('type', 'text');
    }
    if(telAuthFlg == true) {
      preArea.find("[name^='tel']").attr('readonly', true);
      preArea.find("[name^='tel']").css('background-color', '#efefef');
      preArea.find("[name^='tel']").attr('type', 'password');
    } else {
      preArea.find("[name^='tel']").attr('readonly', false);
      preArea.find("[name^='tel']").css('background-color', '#fff');
      preArea.find("[name^='tel']").attr('type', 'text');
    }
    if(authFlg == true && telAuthFlg == true) {
      preArea.find('#authorization-code').append('<p class="tel-note">ただいま承認中</p>');
    } else if(authFlg == true && telAuthFlg == false) {
      preArea.find('#authorization-code').append('<p class="tel-note">上記番号から050-5213-3059にかけてください。<br>認証が成功すると自動で電話が切れます。</p>');
    }
  } else if(json.type == "APPROVAL_DOWN") {
    // 承認順を下げる
    var inputArea = $('.partner_setting_item').eq(json.index);
    var clientId = $('#client_id').val();
    if(inputArea.find("[name^='lastname']").attr('readonly') == 'readonly') {
      var authFlg = true;
    } else {
      var authFlg = false;
    }
    if(inputArea.find("[name^='password']").attr('readonly') == 'readonly') {
      var passAuthFlg = true;
    } else {
      var passAuthFlg = false;
    }
    if(inputArea.find("[name^='tel']").attr('readonly') == 'readonly') {
      var telAuthFlg = true;
    } else {
      var telAuthFlg = false;
    }
    var lastName = inputArea.find("[name^='lastname']").val();
    var firstName = inputArea.find("[name^='firstname']").val();
    var organizationName = inputArea.find("[name^='organization_name']").val();
    var title = inputArea.find("[name^='title']").val();
    var email = inputArea.find("[name^='email']").val();
    var password = inputArea.find("[name^='password']").val();
    var tel = inputArea.find("[name^='tel']").val();
    var token = inputArea.find("#token").val();

    var nextArea = $('.partner_setting_item').eq(json.index + 1);
    if(nextArea.find("[name^='lastname']").attr('readonly') == 'readonly') {
      var nextAuthFlg = true;
    } else {
      var nextAuthFlg = false;
    }
    if(nextArea.find("[name^='password']").attr('readonly') == 'readonly') {
      var nextPassAuthFlg = true;
    } else {
      var nextPassAuthFlg = false;
    }
    if(nextArea.find("[name^='tel']").attr('readonly') == 'readonly') {
      var nextTelAuthFlg = true;
    } else {
      var nextTelAuthFlg = false;
    }
    var nextLastName = nextArea.find("[name^='lastname']").val();
    var nextFirstName = nextArea.find("[name^='firstname']").val();
    var nextOrganizationName = nextArea.find("[name^='organization_name']").val();
    var nextTitle = nextArea.find("[name^='title']").val();
    var nextEmail = nextArea.find("[name^='email']").val();
    var nextPassword = nextArea.find("[name^='password']").val();
    var nextTel = nextArea.find("[name^='tel']").val();
    var nextToken = nextArea.find("#token").val();

    inputArea.find("[name^='lastname']").val(nextLastName);
    inputArea.find("[name^='firstname']").val(nextFirstName);
    inputArea.find("[name^='organization_name']").val(nextOrganizationName);
    inputArea.find("[name^='title']").val(nextTitle);
    inputArea.find("[name^='email']").val(nextEmail);
    inputArea.find("[name^='password']").val(nextPassword);
    inputArea.find("[name^='tel']").val(nextTel);
    if(nextAuthFlg == true) {
      inputArea.find("[name^='lastname']").attr('readonly', true);
      inputArea.find("[name^='lastname']").css('background-color', '#efefef');
      inputArea.find("[name^='firstname']").attr('readonly', true);
      inputArea.find("[name^='firstname']").css('background-color', '#efefef');
      inputArea.find("[name^='organization_name']").attr('readonly', true);
      inputArea.find("[name^='organization_name']").css('background-color', '#efefef');
      inputArea.find("[name^='title']").attr('readonly', true);
      inputArea.find("[name^='title']").css('background-color', '#efefef');
      inputArea.find("[name^='email']").attr('readonly', true);
      inputArea.find("[name^='email']").css('background-color', '#efefef');
      inputArea.find("#token").val(nextToken);
      inputArea.find('.tel-note').remove();
    } else {
      inputArea.find("[name^='lastname']").attr('readonly', false);
      inputArea.find("[name^='lastname']").css('background-color', '#fff');
      inputArea.find("[name^='firstname']").attr('readonly', false);
      inputArea.find("[name^='firstname']").css('background-color', '#fff');
      inputArea.find("[name^='organization_name']").attr('readonly', false);
      inputArea.find("[name^='organization_name']").css('background-color', '#fff');
      inputArea.find("[name^='title']").attr('readonly', false);
      inputArea.find("[name^='title']").css('background-color', '#fff');
      inputArea.find("[name^='email']").attr('readonly', false);
      inputArea.find("[name^='email']").css('background-color', '#fff');
      inputArea.find("#token").val('');
      inputArea.find('.tel-note').remove();
    }
    if(nextPassAuthFlg == true) {
      inputArea.find("[name^='password']").attr('readonly', true);
      inputArea.find("[name^='password']").css('background-color', '#efefef');
      inputArea.find("[name^='password']").attr('type', 'password');
    } else {
      inputArea.find("[name^='password']").attr('readonly', false);
      inputArea.find("[name^='password']").css('background-color', '#fff');
      inputArea.find("[name^='password']").attr('type', 'text');
    }
    if(nextTelAuthFlg == true) {
      inputArea.find("[name^='tel']").attr('readonly', true);
      inputArea.find("[name^='tel']").css('background-color', '#efefef');
      inputArea.find("[name^='tel']").attr('type', 'password');
    } else {
      inputArea.find("[name^='tel']").attr('readonly', false);
      inputArea.find("[name^='tel']").css('background-color', '#fff');
      inputArea.find("[name^='tel']").attr('type', 'text');
    }
    if(nextAuthFlg == true && nextTelAuthFlg == true) {
      inputArea.find('#authorization-code').append('<p class="tel-note">ただいま承認中</p>');
    } else if(nextAuthFlg == true && nextTelAuthFlg == false) {
      inputArea.find('#authorization-code').append('<p class="tel-note">上記番号から050-5213-3059にかけてください。<br>認証が成功すると自動で電話が切れます。</p>');
    }

    nextArea.find("[name^='lastname']").val(lastName);
    nextArea.find("[name^='firstname']").val(firstName);
    nextArea.find("[name^='organization_name']").val(organizationName);
    nextArea.find("[name^='title']").val(title);
    nextArea.find("[name^='email']").val(email);
    nextArea.find("[name^='password']").val(password);
    nextArea.find("[name^='tel']").val(tel);
    if(authFlg == true) {
      nextArea.find("[name^='lastname']").attr('readonly', true);
      nextArea.find("[name^='lastname']").css('background-color', '#efefef');
      nextArea.find("[name^='firstname']").attr('readonly', true);
      nextArea.find("[name^='firstname']").css('background-color', '#efefef');
      nextArea.find("[name^='organization_name']").attr('readonly', true);
      nextArea.find("[name^='organization_name']").css('background-color', '#efefef');
      nextArea.find("[name^='title']").attr('readonly', true);
      nextArea.find("[name^='title']").css('background-color', '#efefef');
      nextArea.find("[name^='email']").attr('readonly', true);
      nextArea.find("[name^='email']").css('background-color', '#efefef');
      nextArea.find("#token").val(token);
      nextArea.find('.tel-note').remove();
    } else {
      nextArea.find("[name^='lastname']").attr('readonly', false);
      nextArea.find("[name^='lastname']").css('background-color', '#fff');
      nextArea.find("[name^='firstname']").attr('readonly', false);
      nextArea.find("[name^='firstname']").css('background-color', '#fff');
      nextArea.find("[name^='organization_name']").attr('readonly', false);
      nextArea.find("[name^='organization_name']").css('background-color', '#fff');
      nextArea.find("[name^='title']").attr('readonly', false);
      nextArea.find("[name^='title']").css('background-color', '#fff');
      nextArea.find("[name^='email']").attr('readonly', false);
      nextArea.find("[name^='email']").css('background-color', '#fff');
      nextArea.find("#token").val('');
      nextArea.find('.tel-note').remove();
    }
    if(passAuthFlg == true) {
      nextArea.find("[name^='password']").attr('readonly', true);
      nextArea.find("[name^='password']").css('background-color', '#efefef');
      nextArea.find("[name^='password']").attr('type', 'password');
    } else {
      nextArea.find("[name^='password']").attr('readonly', false);
      nextArea.find("[name^='password']").css('background-color', '#fff');
      nextArea.find("[name^='password']").attr('type', 'text');
    }
    if(telAuthFlg == true) {
      nextArea.find("[name^='tel']").attr('readonly', true);
      nextArea.find("[name^='tel']").css('background-color', '#efefef');
      nextArea.find("[name^='tel']").attr('type', 'password');
    } else {
      nextArea.find("[name^='tel']").attr('readonly', false);
      nextArea.find("[name^='tel']").css('background-color', '#fff');
      nextArea.find("[name^='tel']").attr('type', 'text');
    }
    if(authFlg == true && telAuthFlg == true) {
      nextArea.find('#authorization-code').append('<p class="tel-note">ただいま承認中</p>');
    } else if(authFlg == true && telAuthFlg == false) {
      nextArea.find('#authorization-code').append('<p class="tel-note">上記番号から050-5213-3059にかけてください。<br>認証が成功すると自動で電話が切れます。</p>');
    }
  } else if(json.type == "PARTNER_REMOVE") {
    // 承認者削除
    $('.partner_setting_item_count:contains(' + json.text + ')').closest('.partner_setting_item').remove();
  } else if(json.type == "SEND_CHECK") {
    // インプットチェック
    $(".e_contract_info_radio[name=\"" + json.name + "\"][value=\"" + json.input + "\"]").prop('checked', true);
    if(json.name == 'have_amount') {
      if(json.input == 1) {
        $('#amount_row').show();
        $('#amount').prop('disabled', false);
      } else {
        $('#amount_row').hide();
        $('#amount').prop('disabled', true);
      }
    }
  } else if(json.type == "SHOW_INPUTS") {
    // 入力者設定画面表示
    $('.form_setting_error').remove();
    $('#partners').hide();

    $('#inputs').show();

    // ページ更新すると初期化するためアラート表示
    window.addEventListener('beforeunload', function (e) {
      if($('#inputs').css('display') === 'block') {
        e.preventDefault();
        e.returnValue = '';
      }
    });

    // 電子契約クレデンシャルデータを保持
    $('#e_contract_credential').val(json.eContractCredential);
    // セッションにクレデンシャルを保持させる
    $.ajax({
      url: "https://" + location.host + "/e-contract-api/hold-credential",
      type: "POST",
      data: {
        credential: json.eContractCredential
      }
    }).done(function() {
    }).fail(function() {
    });

    // case_idを設定
    $('#caseId').val(json.res['case'].id);

    // 契約書件数表示
    $('#fileCount').text(json.res['fileList'].length);
    // 契約書名表示
    $('.form_template-name').remove();
    $.each(json.res['fileList'], function(i, file) {
      $('#fileNameList').append('<div class="form_template-name form_template-name-change"><span class="template-name_text">' + file.name + '<a class="file_target" id="' + (i + 1) + '"></a></span></div>');
    });

    // 資料表示
    $('.form_setting_document_area').remove();
    $.each(json.res['materialList'], function(i, material) {
      $('#documentArea').append('<div class="form_setting_document_area"><div class="form_setting_document_img" id="document' + (i + 1) + '"><div class="form_setting_document_operation_area"><div class="form_setting_document_page_area"><div class="page-text"><span class="form_setting_document_page_count" id="pageId" data-id="' + (i + 1) + '">1</span>/<span class="form_setting_document_page_total">' + material.length + '</span>P</div><div class="form_setting_document_pager"><span class="form_setting_document_pager_prev">＜</span><span class="form_setting_document_pager_next">＞</span></div></div></span></div><div id="material' + i + '" class="form_setting_file_img"><img src="/cmn-e-contract/' + material[0].material_filename + '" alt="資料画像" class="documentId" id="' + json.res['fileList'][i].id + '"><img id="loading' + i + '" src="/img/e_contract_loading.gif" class="e_contract_loading"></div></div></div>');

      // フォーム表示
      $.each(json.res['formList'][i], function(fi, form) {
        let input = json.res['inputList'].filter(function(input) {  return input.e_contract_form_id == form.id })[0];
        // owner以外、ゲスト側の表示
        if(form.type == 'text') {
          $('#material' + i).append('<div id="' + form.id + '" class="form_setting_parts_text_dammy form_setting_parts" data-input="'+input.id+'" data-page="' + form.page + '" style="position: absolute; top: ' + form.y / 2 + 'px; left: ' + form.x / 2 + 'px;"><div class="parts_inner_text_dammy" style="width: ' + form.width / 2 + 'px; height: ' + form.height / 2 + 'px; font-size: ' + form.font_size / 2 + 'px;">テキストが入ります</div></div></div>');
        } else if(form.type == 'textarea') {
          $('#material' + i).append('<div id="' + form.id + '" class="form_setting_parts_textarea_dammy form_setting_parts" data-input="'+input.id+'" data-page="' + form.page + '" style="position: absolute; top: ' + form.y / 2 + 'px; left: ' + form.x / 2 + 'px;"><div class="parts_inner_textarea_dammy" style="width: ' + form.width / 2 + 'px; height: ' + form.height / 2 + 'px; font-size: ' + form.font_size / 2 + 'px;">複数行のテキストが入ります</div></div>');
        } else if(form.type == 'sign') {
          $('#material' + i).append('<div id="' + form.id + '" class="form_setting_parts_sign_dammy form_setting_parts" data-page="' + form.page + '" style="position: absolute; top: ' + form.y / 2 + 'px; left: ' + form.x / 2 + 'px;"><div class="parts_inner_sign_dammy" style="width: ' + form.width / 2 + 'px; height: ' + form.height / 2 + 'px;"></div></div>');
        } else if(form.type == 'checkbox') {
          $('#material' + i).append('<div id="' + form.id + '" class="form_setting_parts_checkbox_dammy form_setting_parts" data-page="' + form.page + '" style="position: absolute; top: ' + form.y / 2 + 'px; left: ' + form.x / 2 + 'px;"><div class="parts_inner_checkbox_dammy" style="width: ' + form.width / 2 + 'px; height: ' + form.height / 2 + 'px;"></div></div>');
        }
      });
    });

    // パートナーオプション追加
    $('.partner_select').each(function(i, select) {
      $.each(json.res['partnerList'], function(pi, partner) {
        $(select).append('<option value="' + partner.id + '">' + partner.lastname + partner.firstname + '</option>');
      });
    });

    $('#document1').css('display','block');
    var changeColorZone = $('#1').parents('.form_template-name');
    $(changeColorZone).addClass('form_template-name-change');
    var IntPageCount = 1;
    // 配列に保存されているテキストフォームを1つずつ取り出す
    var formText = document.getElementsByClassName('form_setting_parts_text_dammy ui-draggable ui-draggable-handle');
    for( var i=0 ; i < formText.length; i++){
      var formTextNum = formText[i];
    }
    // 配列に保存されているテキストエリアを1つずつ取り出す
    var formTextarea = document.getElementsByClassName('form_setting_parts_textarea_dammy ui-draggable ui-draggable-handle');
    for( var i=0 ; i < formTextarea.length; i++){
      var formTextareaNum = formTextarea[i];
    }
    // 配列に保存されているチェックボックスフォームを1つずつ取り出す
    var formCheck = document.getElementsByClassName('form_setting_parts_checkbox_dammy ui-draggable ui-draggable-handle');
    for(var i=0 ; i < formCheck.length; i++) {
      var formCheckNum = formCheck[i];
    }
    // 配列に保存されているサインフォームを1つずつ取り出す
    var formSign = document.getElementsByClassName('form_setting_parts_sign_dammy ui-draggable ui-draggable-handle');
    for(var i=0 ; i < formSign.length; i++){
      var formSignNum = formSign[i];
    }

    $('.form_setting_parts').css('background-color', 'transparent');
    $('.partner_select_open').css('display', 'none');

    $(".form_setting_parts_text_dammy").css('display','none');
    $(".form_setting_parts_textarea_dammy").css('display','none');
    $(".form_setting_parts_checkbox_dammy").css('display','none');
    $(".form_setting_parts_sign_dammy").css('display','none');
    $("[data-page = " + IntPageCount + "]").css('display','');

    // ボタンエリアの表示
    $('#buttonArea').html('<div class="return-button-box"><p>戻る</p><a href="javascript:void(0)" onClick="returnPartner();"></a></div>');

    $('html, body').animate({scrollTop:0});
  } else if(json.type == "RETURN_PARTNER") {
    $('#inputs').hide();
    $('#partners').show();
  } else if(json.type == "INPUT_HOST_SIGN") {
    // 設定済み背景に変更する
    $('#' + json.formId + ' .done').remove();
    // 印影画像を表示
    $('#' + json.formId).find('.sign_img').remove();
    $('#' + json.formId).prepend('<img class="sign_img" style="position: absolute; top: 6px; left: 7px; width: ' + json.inputRes.input.img_width / 2 + 'px; height: ' + json.inputRes.input.img_height / 2 + 'px;" src="data:image/png;base64, ' + json.res + '">');
    $('#' + json.formId).prepend('<p class="done self_sign">設定済み</p>');
    $('#' + json.formId).css({'background-color':'transparent'});
  } else if(json.type == "INPUT_PARTNER_SIGN") {
    // 設定済み背景に変更する
    $('#' + json.formId + ' .done').remove();
    // 印影画像を表示
    $('#' + json.formId).find('.sign_img').remove();
    $('#' + json.formId).prepend('<img class="sign_img" style="position: absolute; top: 6px; left: 7px; width: ' + json.inputRes.input.img_width / 2 + 'px; height: ' + json.inputRes.input.img_height / 2 + 'px;" src="data:image/png;base64, ' + json.res + '">');
    $('#' + json.formId).prepend('<p class="done partner_sign">設定済み</p>');
    $('#' + json.formId).css({'background-color':'transparent'});
  } else if(json.type == "INPUT_PARTNER") {
    $('#' + json.formId + ' .done').remove();
    $('#' + json.formId).find('.sign_img').remove();
    $('#' + json.formId).append('<div id="' + json.partnerId + '" data-input-id="' + json.res.input.input_id + '" class="form_setting_partner_sign partner"><input type="text" class="text1"><input type="text" class="text2"><input type="text" class="text3"><input type="text" class="text4"><button type="button" class="signning">押印</button></div>');
  } else if(json.type == "CHANGE_HOST_CHECK") {
    // input_idを変更
    $('#' + json.formId).data('input', json.res.input.input_id);
    // 設定済み背景に戻す
    $('#' + json.formId + ' .done').remove();
    $('#' + json.formId + ' .text_form').remove();
    $('#' + json.formId).prepend('<input type="text" id="'+ json.partnerId +'" class="parts_inner_text_dammy text_form" style="width: ' + json.res.input.width / 2 + 'px; height: ' + json.res.input.height / 2 + 'px; font-size: ' + json.res.input.font_size / 2 + 'px;">');
    if (json.partnerId == 0){
      // readonly 付与
      $('#' + json.formId + ' .parts_inner_text_dammy').attr('readonly',true);
    } else {
      // readonly 外す
      $('#' + json.formId + ' .parts_inner_text_dammy').attr('readonly',false);
      $('#' + json.formId + ' .parts_inner_text_dammy').focus();
    }
  } else if(json.type == "CHANGE_HOST_TEXTREA") {
    // input_idを変更
    $('#' + json.formId).data('input', json.res.input.input_id);
    // 設定済み背景に戻す
    $('#' + json.formId + ' .done').remove();
    $('#' + json.formId + ' .text_form').remove();
    $('#' + json.formId).prepend('<textarea id="'+ json.partnerId +'" class="parts_inner_textarea_dammy text_form" style="width: ' + json.res.input.width / 2 + 'px; height: ' + json.res.input.height / 2  + 'px; font-size: ' + json.res.input.font_size / 2 + 'px; resize: none;"></textarea>');
    $('#' + json.formId + ' .parts_inner_textarea_dammy').focus();
  } else if(json.type == "INPUT_HOST_TEXT") {
    // 入力済み背景に変更する
    $('#' + json.formId + ' input').val(json.text);
    $('#' + json.formId + ' textarea').val(json.text);
    $('#' + json.formId).prepend('<p class="done">入力済み</p>');
    $('#' + json.formId).css({'background-color':'transparent'});
  } else if(json.type == "INPUT_HOST_CHECK") {
    if (json.checked) {
      //トグル チェックボックス表示
      $('#' + json.formId).prepend('<img class="checkbox_img" style="position: absolute; top: 11px; left: -1px; width: ' + json.inputRes.input.img_width + 'px; height: ' + json.inputRes.input.img_height + 'px;" src="data:image/png;base64, ' + json.imgData + '">');
      $('#' + json.formId).prepend('<p class="done">設定済み</p>');
      $('#' + json.formId).css({'background-color':'transparent'});
    } else {
      // チェックボックス非表示
      $('#' + json.formId).find('.checkbox_img').remove();
      $('#' + json.formId).find('.done').remove();
    }
  } else if(json.type == "INPUT_PARTNER_CHECK") {
    // partner側チェックボックス選択時の処理
    $('#' + json.formId).off('click')
    $('#' + json.formId).click(function(){
    let checked = false;
    if (json.partnerId != 0) {
      if($(this).children().hasClass('checkbox_img')){
        $(this).find('.checkbox_img').remove();
        $(this).find('.done').remove();
        checked = false;
      }else{
        $(this).prepend('<img class="checkbox_img" style="position: absolute; top: 11px; left: -1px; width: ' + json.inputRes.input.img_width + 'px; height: ' + json.inputRes.input.img_height + 'px;" src="data:image/png;base64, ' + json.imgData + '">');
        $(this).prepend('<p class="done">設定済み</p>');
        $(this).css({'background-color':'transparent'});
        checked = true;
      }
    }
    var data = {
      command : "E_CONTRACT",
      type : "INPUT_HOST_CHECK",
      imgData : json.imgData,
      inputRes : json.inputRes,
      checked : checked,
      formId : json.formId
    };
    sendCommand(SEND_TARGET_ALL, data);
      return false;
    })
  } else if(json.type == "HOST_SELECT_CHECK") {
    $('#' + json.formId).off('click');
  } else if(json.type == "INPUT_PARTNER_FORM") {
    // 設定済み背景に変更する
    $('#' + json.formId + ' .done').remove();
    if(json.className.indexOf('form_setting_parts_sign_dammy') != -1) {
      // 印影設定の場合
      $('#' + json.formId + ' img.sign_img').remove();
      $('#' + json.formId).prepend('<p class="done partner_sign">設定済み</p>');
    } else if(json.className.indexOf('form_setting_parts_text_dammy') != -1) {
       // テキストフォーム設定の場合
      $('#' + json.formId + ' input').remove();
      $('#' + json.formId).prepend('<p class="done">設定済み</p>');
    } else if(json.className.indexOf('form_setting_parts_textarea_dammy') != -1) {
      // テキストエリア設定の場合
      $('#' + json.formId + ' textarea').remove();
      $('#' + json.formId).prepend('<p class="done">設定済み</p>');
    } else if(json.className.indexOf('form_setting_parts_checkbox_dammy') != -1) {
      // チェックボックス設定の場合
      $('#' + json.formId + ' img.checkbox_img').remove();
      $('#' + json.formId).prepend('<p class="done">設定済み</p>');
    }
    $('#' + json.formId).css({'background-color':'transparent'});
  } else if(json.type == "SHOW_CONFIRM") {
    // 確認画面に変更
    $('.form_setting_error').remove();
    $('.e_contract_title_area h2').text('3.内容確認');
    $('.e_contract_title_area p').html('下記内容でよろしければ「送信」をクリックしてください。<br>入力した宛先に下記の電子契約書が送付されます。');

     // 契約書情報表示
     if(json.res['case'].auto_renewal == 1) {
      var autoRenewal = 'あり';
    } else {
      var autoRenewal = 'なし';
    }
    if(json.res['case'].amount == null) {
      var amount = '0';
    } else {
      var amount = separate(json.res['case'].amount);
    }
    if(json.res['case'].agreement_date == null) {
      var agreementDate = '';
    } else {
      var y = json.res['case'].agreement_date.substr(0, 4);
      var m = json.res['case'].agreement_date.substr(5, 2);
      var d = json.res['case'].agreement_date.substr(8);
      var agreementDate = y + '年' + m + '月' + d + '日';
    }
    if(json.res['case'].effective_date == null) {
      var effectiveDate = '';
    } else {
      var y = json.res['case'].effective_date.substr(0, 4);
      var m = json.res['case'].effective_date.substr(5, 2);
      var d = json.res['case'].effective_date.substr(8);
      var effectiveDate = y + '年' + m + '月' + d + '日';
    }
    if(json.res['case'].expire_date == null) {
      var expireDate = '';
    } else {
      var y = json.res['case'].expire_date.substr(0, 4);
      var m = json.res['case'].expire_date.substr(5, 2);
      var d = json.res['case'].expire_date.substr(8);
      var expireDate = y + '年' + m + '月' + d + '日';
    }

    if(json.res['case'].have_amount == 1) {
      $('#caseInfoArea').append('<div class="form_setting_file_area"><p class="form_setting_label">契約書設定</p><table class="form_setting_table"><tr><th class="form_setting_table_label">テンプレート名</th><td class="form_setting_table_item">' + json.res['document'].name + '</tr><tr><th class="form_setting_table_label">契約金額の有無</th><td class="form_setting_table_item">あり</td></tr><tr><th class="form_setting_table_label">契約金額</th><td class="form_setting_table_item">' + amount + ' 円</td></tr><tr><th class="form_setting_table_label">合意日</th><td class="form_setting_table_item">' + agreementDate + '</td></tr><tr><th class="form_setting_table_label">期間</th><td class="form_setting_table_item_date"><div class="form_setting_table_date"><span>発効日</span>' + effectiveDate + '</div><div class="form_setting_table_date"><span>終了日</span>' + expireDate + '</div></td></tr><tr><th class="form_setting_table_label">契約自動更新の有無</th><td class="form_setting_table_item">' + autoRenewal + '</tr><tr><th class="form_setting_table_label">任意の管理番号</th><td class="form_setting_table_item">' + json.res['case'].management_number + '</td></tr><tr><th class="form_setting_table_label">任意のコメント</th><td class="form_setting_table_item">' + json.res['case'].comment + '</td></tr></table></div>');
    } else {
      $('#caseInfoArea').append('<div class="form_setting_file_area"><p class="form_setting_label">契約書設定</p><table class="form_setting_table"><tr><th class="form_setting_table_label">テンプレート名</th><td class="form_setting_table_item">' + json.res['document'].name + '</tr><tr><th class="form_setting_table_label">契約金額の有無</th><td class="form_setting_table_item">なし</td></tr><tr><th class="form_setting_table_label">合意日</th><td class="form_setting_table_item">' + agreementDate + '</td></tr><tr><th class="form_setting_table_label">期間</th><td class="form_setting_table_item_date"><div class="form_setting_table_date"><span>発効日</span>' + effectiveDate + '</div><div class="form_setting_table_date"><span>終了日</span>' + expireDate + '</div></td></tr><tr><th class="form_setting_table_label">契約自動更新の有無</th><td class="form_setting_table_item">' + autoRenewal + '</tr><tr><th class="form_setting_table_label">任意の管理番号</th><td class="form_setting_table_item">' + json.res['case'].management_number + '</td></tr><tr><th class="form_setting_table_label">任意のコメント</th><td class="form_setting_table_item">' + json.res['case'].comment + '</td></tr></table></div>');
    }

    // 契約者情報表示
    $('#partnerArea').show();
    var partnerCount = 1;
    $.each(json.res['partnerList'], function(i, partner) {
      if(partner.approval_status == '1') {
        $('#partnerArea').append('<div class="form_setting_partner_item approval"><div class="form_setting_partner_number"><img src="/img/check_green.svg"></div><div class="form_setting_partner_name">' + partner.lastname + partner.firstname + '</div><div class="form_setting_partner_organization">' + partner.organization_name + '</div><div class="form_setting_partner_email">' + partner.email + '</div></div>');
      } else {
        $('#partnerArea').append('<div class="form_setting_partner_item unapproved"><div class="form_setting_partner_number">' + partnerCount + '</div><div class="form_setting_partner_name">' + partner.lastname + partner.firstname + '</div><div class="form_setting_partner_organization">' + partner.organization_name + '</div><div class="form_setting_partner_email">' + partner.email + '</div></div>');
        partnerCount++;
      }
    });

    // メッセージエリアの表示
    $('#messageArea').show();

    // ボタンエリアの表示
    $('#buttonArea').html('');

    $('html, body').animate({scrollTop:0});
  } else if(json.type == "SEND_TEXT") {
    // インプットテキスト
    $("textarea[name=\"" + json.name + "\"]").val(json.input);
    $("textarea[name=\"" + json.name + "\"]").attr('selectionEnd', json.focusPosition);
    $("textarea[name=\"" + json.name + "\"]").attr('selectionStart', json.focusPosition);
    $("textarea[name=\"" + json.name + "\"]").focus();
  } else if(json.type == "SENDED_APPROVAL") {
    // 送信が成功したら送信完了画面を表示
    $('#inputs').hide();
    $('#done').show();
    // アラート解除
    window.beforeunload = null;
  } else if(json.type == "MYSIGN_IMG") {
    // ログインユーザー印影画像表示
    $('#e_contract_mysign_img_area').html("<img id=\"e_contract_mysign_img2\" src=\"" + json.src + "\">");
    setTimeout(function(){
      // 印影画像をドラッグできるようにする
      $('#e_contract_mysign_img_area').draggable({
        containment: "#e_contract_area",
        scroll: false,
        drag : function(event, ui) {
          var data = {
              command : "E_CONTRACT",
              type : "MOVE_MY_SIGN",
              top : $(this).css("top"),
              left : $(this).css("left")
          };
          sendCommand(SEND_TARGET_ALL, data);
        }
      });
      // 印影画像のリサイズ処理
      $("#e_contract_mysign_img2").resizable({
        minHeight: 30,
        minWidth: 30,
        containment : "#e_contract_area",
        handles: "se",
        aspectRatio: true,
        resize: function(event, ui) {
          // サイズが変更されている場合
          var data = {
              command : "E_CONTRACT",
              type : "RESIZE_MY_SIGN",
              height : $(this).css('height'),
              width : $(this).css("width")
          };
          sendCommand(SEND_TARGET_ALL, data);
        }
      });
    }, 500);
  } else if(json.type == "PARTNERSIGN_IMG") {
    // パートナー印影画像表示
    $('#e_contract_partnersign_img_area').html("<img id=\"e_contract_partnersign_img2\" src=\"" + json.src + "\">");
    setTimeout(function() {
      // 印影画像をドラッグできるようにする
      $('#e_contract_partnersign_img_area').draggable({
        containment: "#e_contract_area",
        scroll: false,
        drag : function(event, ui) {
          var data = {
              command : "E_CONTRACT",
              type : "MOVE_PARTNER_SIGN",
              top : $(this).css("top"),
              left : $(this).css("left")
          };
          sendCommand(SEND_TARGET_ALL, data);
        }
      });
      // 印影画像のリサイズ処理
      $("#e_contract_partnersign_img2").resizable({
        minHeight: 30,
        minWidth: 30,
        containment : "#e_contract_area",
        handles: "se",
        aspectRatio: true,
        resize: function(event, ui) {
          // サイズが変更されている場合
          var data = {
              command : "E_CONTRACT",
              type : "RESIZE_PARTNER_SIGN",
              height : $(this).css('height'),
              width : $(this).css("width")
          };
          sendCommand(SEND_TARGET_ALL, data);
        }
      });
    }, 500);
  } else if(json.type == "MOVE_MY_SIGN") {
    // ログインユーザー印影画像の移動
    $("#e_contract_mysign_img_area").css("top", json.top);
    $("#e_contract_mysign_img_area").css("left", json.left);
  } else if(json.type == "MOVE_PARTNER_SIGN") {
    // パートナー印影画像の移動
    $("#e_contract_partnersign_img_area").css("top", json.top);
    $("#e_contract_partnersign_img_area").css("left", json.left);
  } else if(json.type == "RESIZE_MY_SIGN") {
    // ログインユーザー印影画像のリサイズ
    $("#e_contract_mysign_img").parent().css("height", json.height);
    $("#e_contract_mysign_img").parent().css("width", json.height);
    $("#e_contract_mysign_img").css("height", json.height);
    $("#e_contract_mysign_img").css("width", json.height);
    $("#e_contract_mysign_img2").parent().css("height", json.height);
    $("#e_contract_mysign_img2").parent().css("width", json.height);
    $("#e_contract_mysign_img2").css("height", json.height);
    $("#e_contract_mysign_img2").css("width", json.height);
  } else if(json.type == "RESIZE_PARTNER_SIGN") {
    // パートナー印影画像のリサイズ
    $("#e_contract_partnersign_img").parent().css("height", json.height);
    $("#e_contract_partnersign_img").parent().css("width", json.height);
    $("#e_contract_partnersign_img").css("height", json.height);
    $("#e_contract_partnersign_img").css("width", json.height);
    $("#e_contract_partnersign_img2").parent().css("height", json.width);
    $("#e_contract_partnersign_img2").parent().css("width", json.width);
    $("#e_contract_partnersign_img2").css("height", json.width);
    $("#e_contract_partnersign_img2").css("width", json.width);
  } else if(json.type == "SEND_APPROVAL_MAIL_BEGIN") {
      $("div.upload_document_message").text("承認依頼メールを送信しています");
      $("div.upload_document_message_area").show();
  } else if(json.type == "SEND_APPROVAL_MAIL_END") {
    $("div.upload_document_message").text("承認依頼メールを送信しました");
    $("div.upload_document_message_area").show();
    setTimeout(function(){
      $("div.upload_document_message_area").hide();
    }, 5000);
  } else if(json.type == "SEND_APPROVAL_MAIL_FAIL") {
    $("div.upload_document_message").text("承認依頼メール送信に失敗しました");
    $("div.upload_document_message_area").show();
    setTimeout(function(){
      $("div.upload_document_message_area").hide();
    }, 5000);
  } else if(json.type == "HIDE_AMOUNT_INPUT") {
    $('#contract_amount').addClass('hiddenInput');
  } else if(json.type == "APPEAR_AMOUNT_INPUT") {
    $('#contract_amount').removeClass('hiddenInput');
  } else if(json.type == "DOWNLOAD_DOCUMENT") {
    // 送信が成功したら契約完了画面を表示
    $('#inputs').hide();
    $('#done').show();
    // 契約済み契約書のパスを追加してダウンロード
    $('#download_contract').attr('href', json.downloadFilePath);
    $('#download_contract')[0].click();
  }
}

/**
* 数値を3桁区切りにする
**/
function separate(num){
  return String(num).replace( /(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
}