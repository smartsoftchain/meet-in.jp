{literal}

<script>
  $(function() {

    // 初期表示設定
    $('#inputs').hide();
    // $('#partners').hide();

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

    // 認証コード送信クリックでコードをメール送信する
    $('#send-code').on('click', function() {
      var lastname = $('#lastname').val();
      var firstname = $('#firstname').val();
      var email = $('#email').val();
      if(lastname != '' && firstname != '' && email != '') {
        // 承認コード作成（ランダムな6桁の数字）
        var authorizationCode = Math.floor(Math.random() * 900000) + 100000;
        // 認証コード登録してメールを送信する
        var data = {
          email:              email,
          authorization_code: authorizationCode,
          client_id:          $('#client_id').val(),
          staff_type:         $('#staff_type').val(),
          staff_id:           $('#staff_id').val()
        }
        $.ajax({
          url: "/e-contract-api/set-authorization-code",
          type: "POST",
          dataType: "text",
          data: data
        }).done(function(res) {
          // 承認コードをメール送信する

        }).fail(function(res) {
        })
      } else {
        $('.form_setting_error').remove();
        $('.e_contract_title_area').append('<div class="form_setting_error">氏名とメールアドレスを入力してください</div>');
        $('html, body').animate({scrollTop:0});
      }

    });

    // 追加ボタンをクリックしてパートナーフォームを追加する
    $('#partner-add').on('click', function() {
      var i = $('.partner_setting_item').length + 1;
      $('#partner-area').append('<div class="partner_setting_item"><div class="partner_setting_item_header"><p><span class="icon-parsonal"></span><span class="partner_setting_item_count">' + i + '人目</span>：' + i + '番目に契約書にサインを行う人</p><div id="partner-remove" class="partner_setting_item_remove">×</div></div><div class="partner_setting_input_area"><div class="partner_setting_input_row"><label>氏名<span class="require">必須</span></label><input type="text" name="lastname' + i + '" class="partner_setting_input_name lastname e_contract_info_text" placeholder="田中"><input type="text" name="firstname' + i + '" class="partner_setting_input_name firstname e_contract_info_text" placeholder="太郎"></div><div class="partner_setting_input_row"><label>企業名</label><input type="text" name="organization_name' + i + '" placeholder="入力してください" class="partner_setting_input organization_name e_contract_info_text"></div><div class="partner_setting_input_row"><label>役職</label><input type="text" name="title' + i + '" placeholder="入力してください" class="partner_setting_input title e_contract_info_text"></div><div class="partner_setting_input_row"><label>メールアドレス<span class="require">必須</span></label><input type="email" name="email' + i + '" placeholder="aaaaa@aaaaa.jp" class="partner_setting_input email e_contract_info_text"></div></div></div>');
      // 画面共有
      var data = {
         command : "E_CONTRACT",
         type : "PARTNER_ADD",
         index : i
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
        var pageCount = pageCountElement.text();
        var pageTotal = $(this).parent().parent().find('.form_setting_document_page_total').text();
        // 最大ページに達したら処理をしない
        if (pageCount >= pageTotal) return false;
        // ページ数を1追加する
        pageCount++;
        pageCountElement.text(pageCount);

        // 契約書srcを取得
        var imgElement = $(this).parents('.form_setting_document_img').find('.documentId');
        var src = imgElement.attr('src');
        // 契約書画像を変換
        src = src.replace(/\d.jpg$/, pageCount + '.jpg');
        imgElement.attr('src', src);
      });

      // 前のページに移動する
      $(document).on('click','.form_setting_document_pager_prev', function() {
        // ページ数を取得
        var pageCountElement = $(this).parent().parent().find('.form_setting_document_page_count');
        var pageCount = pageCountElement.text();
        var pageTotal = $(this).parent().parent().find('.form_setting_document_page_total').text();
        // 最少ページに達したら処理をしない
        if (pageCount <= 1) return false;
        // ページ数を1減らす
        pageCount--;
        pageCountElement.text(pageCount);

        // 契約書srcを取得
        var imgElement = $(this).parents('.form_setting_document_img').find('.documentId');
        var src = imgElement.attr('src');
        // 契約書画像を変換
        src = src.replace(/\d.jpg$/, pageCount + '.jpg');
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
                dataType: "text",
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
              }).done(function() {
                // ローディングを非表示にする
                var fileCount = $('#filePageId').text() - 1;
                $('#loading' + fileCount).css({'display':'none'});
                // 設定済み背景に変更する
                $('#' + formId + ' .done').remove();
                // 印影画像を表示
                $('#' + formId).prepend('<img class="sign_img" style="position: absolute; top: 10px; left: 4px; width: 52px; height: 52px;" src="data:image/png;base64, ' + res + '">');
                $('#' + formId).prepend('<p class="done self_sign">設定済み</p>');
                $('#' + formId).css({'background-color':'#FFDE96'});

                // 画面共有
                var data = {
                    command : "E_CONTRACT",
                    type : "INPUT_HOST_SIGN",
                    res : res,
                    fileCount : fileCount,
                    formId : formId
                };
                sendCommand(SEND_TARGET_ALL, data);
                return false;
              }).fail(function() {
              });
            }).fail(function(res) {
            });
          // テキスト設定の場合
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
              $('#' + formId).prepend('<input type="text" class="parts_inner_text_dammy text_form">');
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
          // チェックボックス設定の場合
          } else if(className.indexOf('form_setting_parts_checkbox_dammy') != -1) {

            // チェックボックスデータ
            var imgData = 'iVBORw0KGgoAAAANSUhEUgAAACMAAAAjCAYAAAAe2bNZAAAAAXNSR0IArs4c6QAAAiRJREFUWAntmDtLA0EQx2fPnCQa0FgoBnyg2GrAR2OjILa+wFb9CBbmQ2jjN1BbBUmtCNfY+Iy2gkaF+AI90RhjfN0/yyYRsmcel0tzU1yW2dmZ3/5n0wwjw662gn6qaVj4+kxM/Xy+t8BnhymqJ6pUVa/T2+NS6+hilKVAPD7N6+/r8jZ1k1rbaAdHqkYydk8vt+H32M3RNcWfhlxQxNvc2+XrGLENQhTCxRs6R92MsZaX6GFQ+f76mIYilTRvU4/b4JhUvpNxv52tyXVp1MdbVXJtVsrnwMiUd5RxlEkpoIeJQj6i3QmZIGl/ed8MQLRhoqROpB+ni8oW5YPJBlHriAZDMoa0vzwwkdWMIgAZ0ojqA+misoVLtlG0HyD7c/x4XQ/RsEak1ueVzlplSgABrTnMg3GryFpet6ISQVDEvE2748Y/4ZkIUP0rcigLQJDcXJn2WQ6QXYx7Mt+z5aLfSCYJX5nDBIxCbTM8MhfQ3ixReJ7v+8cKeqz80N+veZsQO7DKT1wabwdAMLQMIPDBACziuKeo7/8wSCsKCaB7jegtgh3LQJDKvE2IEAYg0bIygKBM/jCIzgayqDVIKyy/Nolo/AJItC3bb8G6MGUsKGiWwoGRqeMoI1UGYwlMAyppqM9c7msF85HXu9NKslDs7iRhcGwqGNS8Rg/O9Isdslsh1NPPtxPGOOSKxZ8WGSTBwOjH4wtiLGH35Iop6gZAMLn6BTGLwMGnHwLyAAAAAElFTkSuQmCC';

            // フォーム情報が登録されていれば更新、登録されていなければ登録する
            $.ajax({
              url: "/e-contract-api/set-input",
              type: "POST",
              dataType: "text",
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
            }).done(function() {
              // ローディングを非表示にする
              var fileCount = $('#filePageId').text() - 1;
              $('#loading' + fileCount).css({'display':'none'});
              // 設定済み背景に変更する
              $('#' + formId + ' .done').remove();
              // チェックボックス画像を表示
              $('#' + formId).prepend('<img class="checkbox_img" style="position: absolute; top: 10px; left: 4px; width: 32px; height: 32px;" src="data:image/png;base64, ' + imgData + '">');
              $('#' + formId).prepend('<p class="done">設定済み</p>');
              $('#' + formId).css({'background-color':'#FFDE96'});

              // 画面共有
              var data = {
                  command : "E_CONTRACT",
                  type : "INPUT_HOST_CHECK",
                  imgData : imgData,
                  fileCount : fileCount,
                  formId : formId
              };
              sendCommand(SEND_TARGET_ALL, data);
              return false;
            }).fail(function() {
            });
          }
        // 入力者がpartnerの場合
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
              "required"    : required
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
            // 設定済み背景に変更する
            $('#' + formId + ' .done').remove();

            if(className.indexOf('form_setting_parts_sign_dammy') != -1) {
              // 印影設定の場合
              $('#' + formId + ' img.sign_img').remove();
              $('#' + formId).prepend('<p class="done partner_sign">設定済み</p>');
            } else if(className.indexOf('form_setting_parts_text_dammy') != -1) {
              // テキスト設定の場合
              $('#' + formId + ' input').remove();
              $('#' + formId).prepend('<p class="done">設定済み</p>');
            } else if(className.indexOf('form_setting_parts_checkbox_dammy') != -1) {
              // チェックボックス設定の場合
              $('#' + formId + ' img.checkbox_img').remove();
              $('#' + formId).prepend('<p class="done">設定済み</p>');
            }
            $('#' + formId).css({'background-color':'#FFDE96'});

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
      });

      // テキストフォーム変更時に登録する
      $(document).on('change', '.text_form', function() {

        var partnerId = 0;
        var formId = $(this).parent().attr('id');
        var text = $(this).val();
        var inputId = $('#'+formId).data('input');

        var data = {};
        data['value'] = text;
        data['target'] = "partners";
        data['size'] = "14";

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
        var pageCountMax = pageNumMax.text();
        var IntPageCountMax = parseInt(pageCountMax)+1;
        //現在のページ数を取得
        var pageNum = $(this).parent().parent().find('.form_setting_document_page_count');
        var pageCount = pageNum.text();
        var IntPageCount = parseInt(pageCount)+1;
        //配列に保存されているテキストフォームを1つずつ取り出す
        var formText = document.getElementsByClassName('form_setting_parts_text_dammy ui-draggable ui-draggable-handle');
        for( var i=0 ; i < formText.length; i++){
         var formTextNum = formText[i];
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
          $(".form_setting_parts_checkbox_dammy").css('display','none');
          $(".form_setting_parts_sign_dammy").css('display','none');
          $("[data-page = " + IntPageCount + "]").css('display','');
        } else {
          return false;
        }
      })

      $(document).on('click', '.form_setting_document_pager_prev', function(){
        //現在のページ数を取得
        var pageNum = $(this).parent().parent().find('.form_setting_document_page_count');
        var pageCount = pageNum.text();
        var IntPageCount = parseInt(pageCount)-1;
        //配列に保存されているテキストフォームを1つずつ取り出す
        var formText = document.getElementsByClassName('form_setting_parts_text_dammy ui-draggable ui-draggable-handle');
        for( var i=0 ; i < formText.length; i++){
         var formTextNum = formText[i];
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
      $('.partner_setting_item').each(function(i, partner) {
        lastname[i] = $(partner).find('.partner_setting_input_name.lastname').val();
        firstname[i] = $(partner).find('.partner_setting_input_name.firstname').val();
        organization_name[i] = $(partner).find('.partner_setting_input.organization_name').val();
        title[i] = $(partner).find('.partner_setting_input.title').val();
        email[i] = $(partner).find('.partner_setting_input.email').val();
      });

      // バリデーション
      $('.form_setting_error').remove();
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
      if(errorCount != 0) {
        $('html, body').animate({scrollTop:0});
        return false;
      }

      var data = {
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
        auto_renewal:          $('#auto_renewal:checked').val(),
        management_number:     $('#management_number').val(),
        comment:                $('#comment').val(),
        lastname:               lastname,
        firstname:              firstname,
        organization_name:      organization_name,
        title:                  title,
        email:                  email
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
          $.each(res['fileList'], function(i, file) {
            $('#fileNameList').append('<div class="form_template-name"><span class="template-name_text">' + file.name + '<a class="file_target" id="' + (i + 1) + '"></a></span></div>');
          });

          // ユーザー名を取得
          var myUserInfo = $('#my_user_info').val();

          // 資料表示
          $.each(res['materialList'], function(i, material) {
            $('#documentArea').append('<div class="form_setting_document_area"><div class="form_setting_document_img" id="document' + (i + 1) + '"><div class="form_setting_document_operation_area"><div class="form_setting_document_page_area"><div class="page-text"><span class="form_setting_document_page_count" id="pageId" data-id="' + (i + 1) + '">1</span>/<span class="form_setting_document_page_total">' + material.length + '</span>P</div><div class="form_setting_document_pager"><span class="form_setting_document_pager_prev">＜</span><span class="form_setting_document_pager_next">＞</span></div></div></span></div><div id="material' + i + '" class="form_setting_file_img"><img src="/cmn-e-contract/' + material[0].material_filename + '" alt="資料画像" class="documentId" id="' + res['fileList'][i].id + '"><img id="loading' + i + '" src="/img/e_contract_loading.gif" class="e_contract_loading"></div></div></div>');

            // フォーム表示
            $.each(res['formList'][i], function(fi, form) {
              if(form.type == 'text') {
                $('#material' + i).append('<div id="' + form.id + '" class="form_setting_parts_text_dammy form_setting_parts" data-input="0" data-page="' + form.page + '" style="position: absolute; top: ' + form.y + 'px; left: ' + form.x + 'px;"><div class="parts_inner_text_dammy"></div><img class="partner_select_open" src="/img/partner_select.png"><div class="form_setting_partner_select"><p class="form_setting_partner_select_label">入力者<span class="require">必須</span></p><select class="partner_select" id="select_' + i + '_' + fi + '"><option disabled selected value>選択してください</option><option value="0">' + myUserInfo + '</option></select></div></div>');
              } else if(form.type == 'sign') {
                $('#material' + i).append('<div id="' + form.id + '" class="form_setting_parts_sign_dammy form_setting_parts" data-page="' + form.page + '" style="position: absolute; top: ' + form.y + 'px; left: ' + form.x + 'px;"><div class="parts_inner_sign_dammy"></div><img class="partner_select_open" src="/img/partner_select.png"><div class="form_setting_partner_select"><p class="form_setting_partner_select_label">入力者<span class="require">必須</span></p><select class="partner_select"><option disabled selected value>選択してください</option><option value="0">' + myUserInfo + '</option></select></div></div>');
              } else if(form.type == 'checkbox') {
                $('#material' + i).append('<div id="' + form.id + '" class="form_setting_parts_checkbox_dammy form_setting_parts" data-page="' + form.page + '" style="position: absolute; top: ' + form.y + 'px; left: ' + form.x + 'px;"><div class="parts_inner_checkbox_dammy"></div><img class="partner_select_open" src="/img/partner_select.png"><div class="form_setting_partner_select checkbox"><p class="form_setting_partner_select_label">入力者<span class="require">必須</span></p><select class="partner_select"><option disabled selected value>選択してください</option><option value="0">' + myUserInfo + '</option></select><input id="checkbox' + form.id + '" name="checkbox' + form.id + '" type="checkbox"><label for="checkbox{$form.id}">入力を必須にする</label></div></div>');
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
          $(".form_setting_parts_text_dammy").css('display','none');
          $(".form_setting_parts_checkbox_dammy").css('display','none');
          $(".form_setting_parts_sign_dammy").css('display','none');
          $("[data-page = " + IntPageCount + "]").css('display','');

          $('html, body').animate({scrollTop:0});


          // 画面共有
          var myUserInfo = $('#my_user_info').val();
          var data = {
              command : "E_CONTRACT",
              type : "SHOW_INPUTS",
              res : res
          };
          sendCommand(SEND_TARGET_ALL, data);

        }).fail(function(res) {
        });

      }).fail(function() {
      });

      return false;

    });

  });

  // 確認ボタン押下時
  function confirmEContract() {
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
        $.each(res['partnerList'], function(i, partner) {
          $('#partnerArea').append('<div class="form_setting_partner_item"><div class="form_setting_partner_number">' + (i + 1) + '</div><div class="form_setting_partner_name">' + partner.lastname + partner.firstname + '</div><div class="form_setting_partner_organization">' + partner.organization_name + '</div><div class="form_setting_partner_email">' + partner.email + '</div></div>');
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
  }

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
</script>

{/literal}

<div id="e_contract_area" class="ui-widget-content e_contract_area mi_e_contract_area">

  <!-- コンテンツエリア start -->
  <div id="mi_content_area" class="room_e_contract">

    <!-- タイトルエリア begin -->
    <div class="e_contract_header_area">
      <span class="icon-folder"></span>
      <h2 class="e_contract_header_title">電子契約書新規作成</h1>
    </div>
    <!-- タイトルエリア end -->

    <!-- パートナーコンテンツエリア start -->
    <div id="partners">

      <!-- コンテンツ start -->
      <div class="e_contract_setting_area">

        <!-- ステップエリア begin -->
        <div class="e_contract_step_area">
          <img src="/img/send_contract_1.png">
        </div>
        <!-- ステップエリア end -->

        <!-- エラーメッセージ表示エリア begin -->
        <!-- エラーメッセージ表示エリア end -->

        <!-- タイトル表示エリア begin -->
        <div class="e_contract_title_area">
          <h2>1.契約書・宛先の設定</h2>
          <p>
            契約を交わす相手の情報を入力し、契約書にサインを行う順番を設定してください。<br>
            サインをする順番は、詳細情報パネルをドラッグ&ドロップで移動するか、位置変更ボタンをクリックしてください。
          </p>
        </div>
        <!-- タイトル表示エリア end -->

        <!-- フォームエリア begin -->
        <div class="partner_setting_form_area">

          <table class="partner_setting_table">
            <tbody>
              <tr class="partner_setting_template_row">
                <th class="partner_setting_table_label">契約書タイトル<span class="require">必須</span></th>
                <td>
                  <input type="text" name="case_title" id="case_title" placeholder="入力してください" class="partner_setting_title_input e_contract_info_text" value="{$form.name|escape}">
                </td>
              </tr>
              <tr class="partner_setting_template_row">
                <th class="partner_setting_table_label">契約書ファイル<span class="require">必須</span></th>
                <td>
                  <div class="partner_setting_template_select">
                    <select id="e_contract_document_id">
                      <option value='' disabled selected style='display:none;'>選択してください</option>
                      {foreach from=$documentList item=row}
                        <option value="{$row.id}" {if $row.id == $eContractDocumentId}selected{/if}>{$row.name}</option>
                      {/foreach}
                    </select>
                  </div>
                </td>
              </tr>
              <tr class="partner_setting_template_row">
                <th class="partner_setting_table_label">契約金額の有無</th>
                <td>
                  <input type="radio" id="have_amount" name="have_amount" value="1" class="e_contract_info_radio" /> あり
                  <input type="radio" id="have_amount" name="have_amount" value="0" class="e_contract_info_radio" checked="checked" /> なし
                </td>
              </tr>
              <tr class="partner_setting_template_row" id="amount_row">
                <th class="partner_setting_table_label">契約金額</th>
                <td>
                  <input id="amount" name="amount" type="number" placeholder="入力してください" class="partner_setting_title_input e_contract_info_text"> 円
                </td>
              </tr>
              <tr class="partner_setting_template_row">
                <th class="partner_setting_table_label">合意日</th>
                <td>
                  <input type="date" id="agreement_date" name="agreement_date" value="{$form.agreementDate|escape}" class="e_contract_info_text" />
                </td>
              </tr>
              <tr class="partner_setting_template_row">
                <th class="partner_setting_table_label">期間</th>
                <td class="partner_setting_table_date">
                  <div class="partner_setting_table_date_item">
                    <span>発効日</span>
                    <input type="date" id="effective_date" name="effective_date" value="{$form.effectiveDate|escape}" class="partner_setting_table_date_item e_contract_info_text" />
                  </div>
                  <div>
                    <span>終了日</span>
                    <input type="date" id="expire_date" name="expire_date" value="{$form.expireDate|escape}" class="partner_setting_table_date_item e_contract_info_text" />
                  </div>
                </td>
              </tr>
              <tr class="partner_setting_template_row">
                <th class="partner_setting_table_label">契約自動更新の有無</th>
                <td>
                  <input type="radio" name="auto_renewal" id="auto_renewal" value="1" class="e_contract_info_radio" /> あり
                  <input type="radio" name="auto_renewal" id="auto_renewal" value="0" class="e_contract_info_radio" checked="checked" /> なし
                </td>
              </tr>
              <tr class="partner_setting_template_row">
                <th class="partner_setting_table_label">任意の管理番号</th>
                <td>
                  <input type="text" id="management_number" name="management_number" placeholder="入力してください" class="partner_setting_title_input e_contract_info_text">
                </td>
              </tr>
              <tr class="partner_setting_template_row">
                <th class="partner_setting_table_label">任意のコメント</th>
                <td>
                  <input type="text" id="comment" name="comment" placeholder="入力してください" class="partner_setting_title_input e_contract_info_text">
                </td>
              </tr>
              <tr class="partner_setting_partner_row">
                <th class="partner_setting_table_label_partner">宛先</th>
                <td id="partner-area">

                  <div class="partner_setting_item">
                    <div class="partner_setting_item_header">
                      <p><span class="icon-parsonal"></span><span class="partner_setting_item_count">1人目</span>：1番目に契約書にサインを行う人</p>
                    </div>
                    <div class="partner_setting_input_area">
                      <div class="partner_setting_input_row">
                        <label>氏名<span class="require">必須</span></label>
                        <input type="text" id="lastname" name="lastname" class="partner_setting_input_name lastname e_contract_info_text" placeholder="田中"><input type="text" id="firstname" name="firstname" class="partner_setting_input_name firstname e_contract_info_text" placeholder="太郎">
                      </div>
                      <div class="partner_setting_input_row">
                        <label>企業名</label>
                        <input type="text" name="organization_name" placeholder="入力してください" class="partner_setting_input organization_name e_contract_info_text">
                      </div>
                      <div class="partner_setting_input_row">
                        <label>役職</label>
                        <input type="text" name="title" placeholder="入力してください" class="partner_setting_input title e_contract_info_text">
                      </div>
                      <div class="partner_setting_input_row">
                        <label>メールアドレス<span class="require">必須</span></label>
                        <input type="email" id="email" name="email" placeholder="aaaaa@aaaaa.jp" class="partner_setting_input email e_contract_info_text">
                      </div>

                      {* <div id="send-code" class="partner_setting_send_code">認証コード送信</div> *}
                    </div>
                  </div>

                </td>
              </tr>
              <tr>
                <th></th>
                <td>
                  <div id="partner-add" class="partner_setting_partner_add">追加</div>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="btn_client_submit_area">
            <button type="button" id="e_contract_cancel" class="mi_default_button mi_cancel_btn mi_btn_m hvr-fade">キャンセル</button>
            <button type="button" id="submit_button" class="mi_default_button">入力者設定へ</button>
          </div>

          <!-- データエリア begin -->
          <input type="hidden" name="client_id" value="{$user.client_id|escape}" />
          <input type="hidden" name="staff_type" value="{$user.staff_type|escape}" />
          <input type="hidden" name="staff_id" value="{$user.staff_id|escape}" />
          <!-- データエリア end -->

        </div>
        <!-- フォームエリア begin -->

      </div>
      <!-- コンテンツ end -->

    </div>
    <!-- パートナーコンテンツエリア end -->


    <!-- インプットコンテンツエリア start -->
    <div id="inputs">

      <!-- コンテンツ start -->
      <div class="e_contract_setting_area">

        <!-- ステップエリア begin -->
        <div class="e_contract_step_area">
          <img src="/img/send_contract_2.png">
        </div>
        <!-- ステップエリア end -->

        <!-- エラーメッセージ表示エリア begin -->
        <!-- エラーメッセージ表示エリア end -->

        <!-- タイトル表示エリア begin -->
        <div class="e_contract_title_area">
          <h2>2.入力者の設定</h2>
          <p>
            各パーツの入力者を設定し、自分が入力する部分へ入力をしてください。<br>
            各パーツの編集ボタンをクリックする事で、設定メニューを表示することができます。
          </p>
        </div>
        <!-- タイトル表示エリア end -->

        <!-- 契約書情報エリア begin -->
        <div id="caseInfoArea"></div>
        <!-- 契約書情報エリア end -->

        <!-- ファイル表示エリア begin -->
        <div class="form_setting_file_area">
          {* <p>契約書 <span id="fileCount"></span>件</p> *}
          <div id="fileNameList"></div>
        </div>
        <!-- ファイル表示エリア end -->

        <!-- 契約書エリア begin -->
        <div id="documentArea"></div>
        <!-- 契約書エリア begin -->

        <!-- 契約者エリア begin -->
        <div class="form_setting_partner_area" id="partnerArea">
          <p class="form_setting_partner_title">契約者</p>
          <p class="form_setting_partner_description">電子契約書の送付先と送付される順番です。</p>
        </div>
        <!-- 契約者エリア begin -->

        <!-- メッセージエリア begin -->
        <div id="messageArea" class="form_setting_message_area">
          <p class="form_setting_partner_description">電子契約書の送付メールにメッセージを挿入したい場合は、下記に入力してください。</p>
          <textarea id="message" name="message" class="form_setting_partner_textarea e_contract_info_message" placeholder="入力してください。"></textarea>
        </div>
        <!-- メッセージエリア end -->

        <!-- buttonエリア begin -->
        <div id="buttonArea" class="button-wrapper">
          <div class="signup-button-box">
            <p>確認</p>
            <a href="javascript:void(0)" onClick="confirmEContract();"></a>
          </div>
        </div>
        <!-- buttonエリア end -->

        <!-- データエリア begin -->
        <input type="hidden" id="caseId">
        <!-- データエリアend -->

      </div>
      <!-- コンテンツ end -->

    </div>
    <!-- インプットコンテンツエリア end -->

    <!-- 作成完了エリア begin-->
    <div id="done">
      <div class="e_contract_center">
        <p class="e_contract_item__medium">作成が完了しました</p>
        <p class="e_contract_item__small">電子契約書が作成され送信されました。契約が完了するまで送付した契約書は「電子契約書確認中一覧」にて確認することができます。</p><br>
        <img src="/img/icon___.svg" class="e_contract_img__section"><br>
      </div>

      <div class="button-wrapper">
        <button type="button" id="e_contract_cancel" class="mi_default_button">閉じる</button>
      </div>
    </div>
    <!-- 作成完了エリア end-->

  </div>
  <!-- コンテンツエリア end -->

</div>
