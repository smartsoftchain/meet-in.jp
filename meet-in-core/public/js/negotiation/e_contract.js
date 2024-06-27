/*
 * 電子契約に使用するJS群
 *
 * */

const NO_NOTIFICATION2 = null;  // 契約書表示時にレスポンス通知を行わない場合の値

$(function() {

  // テンプレート名選択時のテキスト共有
  $('#e_contract_document_id').on('change', function() {
    var data = {
      command : "E_CONTRACT",
      type : "SEND_DOCUMENT_NAME",
      documentName : $("option:selected", this).text()
    };
    sendCommand(SEND_TARGET_ALL, data);
  });

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

  // ログインユーザーの印影画像を共有するイベント処理
  $(document).on('inview', '#e_contract_mysign_img', function(event, isInView){
    if(isInView) {
      var data = {
          command : "E_CONTRACT",
          type : "MYSIGN_IMG",
          src : src = $(this).attr('src')
      };
      sendCommand(SEND_TARGET_ALL, data);

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
      $("#e_contract_mysign_img").resizable({
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
    }
  });

  // // パートナーの印影画像を共有するイベント処理
  // $(document).on('inview', '#e_contract_partnersign_img', function(event, isInView){
  //   if(isInView) {
  //     var data = {
  //         command : "E_CONTRACT",
  //         type : "PARTNERSIGN_IMG",
  //         src : src = $(this).attr('src')
  //     };
  //     sendCommand(SEND_TARGET_ALL, data);
  //
  //     // 印影画像をドラッグできるようにする
  //     $('#e_contract_partnersign_img_area').draggable({
  //       containment: "#e_contract_area",
  //       scroll: false,
  //       drag : function(event, ui) {
  //         var data = {
  //             command : "E_CONTRACT",
  //             type : "MOVE_PARTNER_SIGN",
  //             top : $(this).css("top"),
  //             left : $(this).css("left")
  //         };
  //         sendCommand(SEND_TARGET_ALL, data);
  //       }
  //     });
  //
  //     // 印影画像のリサイズ処理
  //     $("#e_contract_partnersign_img").resizable({
  //       minHeight: 30,
  //       minWidth: 30,
  //       containment : "#e_contract_area",
  //       handles: "se",
  //       aspectRatio: true,
  //       resize: function(event, ui) {
  //         // サイズが変更されている場合
  //         var data = {
  //             command : "E_CONTRACT",
  //             type : "RESIZE_PARTNER_SIGN",
  //             height : $(this).css('height'),
  //             width : $(this).css("width")
  //         };
  //         sendCommand(SEND_TARGET_ALL, data);
  //       }
  //     });
  //   }
  // });

  /**
  * 契約一時情報の登録と承認依頼メールの送付
  **/
  $(document).on('click', '#e_contract_regist', function() {
    // ブラウザのセッションストレージから契約書データ取得
    var keyName = $('#document_material_id').val();
    var mtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));
    // 契約書画像が展開されているか判定
    if(mtSessionStorage === null) {
      $("div.upload_document_message").text("契約書が展開されていません");
      $("div.upload_document_message_area").show();
      setTimeout(function(){
        $("div.upload_document_message_area").hide();
      }, 3000);
      return false;
    } else {
      var fileName = mtSessionStorage[keyName]['canvas_document']['hashKey'] + '.pdf';
    }

    // 契約書展開エリアの位置取得
    var document_area = $('#e_contract_document_area').offset();

    // ログインユーザーの印影画像位置取得
    var mysign = $('#e_contract_mysign_img').offset();

    // 契約書が縦長か横長によって拡大倍率を変える
    var contractWidth = $('#contract_img').width();
    var contractHeight = $('#contract_img').height();
    if(contractWidth < contractHeight) {
      // 縦長の場合
      var scale = 1.42;
    } else {
      // 横長の場合
      var scale = 2;
    }

    // 一時登録用データ
    var contractData = {
      params: {
        name:             $('#e_contract_text[name=name]').val(),
        haveAmount:       $('.e_contract_info_radio[name=haveAmount]:checked').val(),
        amount:           $('#e_contract_text[name=amount]').val(),
        agreementDate:    $('#e_contract_text[name=agreementDate]').val(),
        effectiveDate:    $('#e_contract_text[name=effectiveDate]').val(),
        expireDate:       $('#e_contract_text[name=expireDate]').val(),
        autoRenewal:      $('.e_contract_info_radio[name=autoRenewal]:checked').val(),
        managementNumber: $('#e_contract_text[name=managementNumber]').val(),
        comment:          $('#e_contract_text[name=comment]').val()
      },
      signInfos: {
        self: {
          idDigitalSign: 1,
          signTurn: 2,
          signAreas: [
            {
              x: mysign.left - document_area.left,
              y: mysign.top - document_area.top,
              width: $('#e_contract_mysign_img').width(),
              height: $('#e_contract_mysign_img').height(),
              page: 1,
              docIdx: 0
            }
          ]
        },
        partners: [
          {
            info: {
              lastname:         $('#e_contract_text[name=lastname]').val(),
              firstname:        $('#e_contract_text[name=firstname]').val(),
              title:            $('#e_contract_text[name=title]').val(),
              organizationName: $('#e_contract_text[name=organizationName]').val(),
              message:          $('#e_contract_text[name=message]').val(),
              email:            $('#e_contract_text[name=email]').val()
            }
          }
        ]
      },
      documents: [
        {
          idx: 0,
          title: $('#e_contract_text[name=name]').val(),
          name:  mtSessionStorage[keyName]['material_basic']['material_name'] + '.pdf',
          type:  'application/pdf',
          fileName: fileName
        }
      ],
      scale: scale
    }

    // 入力データのバリデーション
    var errorCount = 0;
    var errorMessage;
    if(contractData.params.name == "") {
      errorMessage = '文書名称を入力してください';
      errorCount++;
    }
    if(contractData.signInfos.partners[0].info.email == "") {
      if(errorCount == 0) {
        errorMessage = 'メールアドレスを入力してください';
        errorCount++;
      } else {
        errorMessage += '<br>メールアドレスを入力してください';
        errorCount++;
      }
    } else {
      var mailResult = mailCheck(contractData.signInfos.partners[0].info.email);
      if(mailResult == false) {
        if(errorCount == 0) {
          errorMessage = 'メールアドレスが正しくありません';
          errorCount++;
        } else {
          errorMessage += '<br>メールアドレスが正しくありません';
          errorCount++;
        }
      }
    }

    if(contractData.signInfos.self.signAreas[0].x < 0 || contractData.signInfos.self.signAreas[0].x > contractWidth || contractData.signInfos.self.signAreas[0].y < 0 || contractData.signInfos.self.signAreas[0].y > contractHeight) {
      if(errorCount == 0) {
        errorMessage = '印影を契約書枠内に入れてください';
        errorCount++;
      } else {
        errorMessage += '<br>印影を契約書枠内に入れてください';
        errorCount++;
      }
    }
    if(errorCount !== 0) {
      $("div.upload_document_message").html(errorMessage);
      $("div.upload_document_message_area").show();
      setTimeout(function(){
        $("div.upload_document_message_area").hide();
      }, 3000);
      return false;
    }

    // 承認依頼メール送信のメッセージを表示する
    $("div.upload_document_message").text("承認依頼メールを送信しています");　
    $("div.upload_document_message_area").show();

    // 他のユーザーに電承認依頼メール送信を通知する
    var data = {
      command : "E_CONTRACT",
      type : "SEND_APPROVAL_MAIL_BEGIN"
    };
    sendCommand(SEND_TARGET_ALL, data);

    // 契約一時情報の登録と承認依頼メールの送付
    $.ajax({
      url: "https://" + location.host + "/e-contract-api/regist-tmp-data",
      type: "POST",
      data: contractData,
      dataType: 'json'
      }).done(function(res) {
        if(res.status == 200) {
          // 登録ボタンを非活性化させる
          $('.e_contract_regist').attr('id', '');
          $('.e_contract_regist').addClass('mi_inactive_btn');
          $('.e_contract_regist').removeClass('mi_default_button');

          // 電子契約登録完了メッセージを表示する
          $("div.upload_document_message").text("承認依頼メールを送信しました");
          $("div.upload_document_message_area").show();
          setTimeout(function(){
            $("div.upload_document_message_area").hide();
          }, 5000);
          // 他のユーザーに承認依頼メール送信完了を通知する
          var data = {
            command : "E_CONTRACT",
            type : "SEND_APPROVAL_MAIL_END"
          };
          sendCommand(SEND_TARGET_ALL, data);
        } else {
          // 承認依頼メール送信失敗メッセージを表示する
          $("div.upload_document_message").text("承認依頼メール送信に失敗しました");
          $("div.upload_document_message_area").show();
          setTimeout(function(){
            $("div.upload_document_message_area").hide();
          }, 5000);
          // 他のユーザーに電子契約登録失敗を通知する
          var data = {
            command : "E_CONTRACT",
            type : "SEND_APPROVAL_MAIL_FAIL"
          };
          sendCommand(SEND_TARGET_ALL, data);
        }
      }).fail(function(res) {
        // 承認依頼メール送信失敗メッセージを表示する
        $("div.upload_document_message").text("承認依頼メール送信に失敗しました");
        $("div.upload_document_message_area").show();
        setTimeout(function(){
          $("div.upload_document_message_area").hide();
        }, 5000);
        // 他のユーザーに電子契約登録失敗を通知する
        var data = {
          command : "E_CONTRACT",
          type : "SEND_APPROVAL_MAIL_FAIL"
        };
        sendCommand(SEND_TARGET_ALL, data);
      });
    });
  });

  /**
  * パートナー承認画面に設定済み印影を表示する
  **/
  $(window).bind("load", function(){
    if(document.URL.indexOf("e-contract-api/approval")) {
      // APIから設定済みの印影を取得して表示
      var credential = $("input[name=credential]").val();
      var signX      = $("input[name=sign_x]").val();
      var signY      = $("input[name=sign_y]").val();
      var signWidth  = $("input[name=sign_width]").val();
      var signHeight = $("input[name=sign_height]").val();
      $.ajax({
        url: "https://" + location.host + "/e-contract-api/get-sign-image-for-approval",
        type: "GET",
        data: {
          credential: credential
        }
      }).done(function(res) {
        var src = 'data:image/png;base64, ' + res;
        $('#client_stamp__area').html("<img class=\"client_stamp\" src=\"" + src + "\" style=\"width: " + signWidth + "px; height: " + signHeight + "px; top: " + signY + "px; left: " + signX + "px;\">");
      }).fail(function(res) {
      });
    }
  });

  /**
  * パートナー承認画面でパートナー企業印影作成ボタン押下時のイベント
  **/
  $(document).on('click', '#createPartnerSign', function() {
    // 連続クリック防止解除
    $("#createPartnerSign").prop("disabled", true);
    $("#createPartnerSign").text("作成中です...");
    var credential = $("input[name=credential]").val();
    var sign1 = $("input[name=sign1]").val();
    var sign2 = $("input[name=sign2]").val();
    var sign3 = $("input[name=sign3]").val();
    var sign4 = $("input[name=sign4]").val();
    if(sign1 == "" && sign3 == "" && sign3 == "" && sign4 == "") {
      setTimeout(function(){
        $("p.createPartnerSignMessage").text('文字を入力してください');
        $("div.createPartnerSignMessageArea").show();
        // 連続クリック防止解除
        $("#createPartnerSign").prop("disabled", false);
        $("#createPartnerSign").text("作成する");
      }, 500);
      return false;
    } else if(sign1.length > 10 || sign2.length > 10 || sign3.length > 10 || sign4.length > 10) {
      setTimeout(function(){
        $("p.createPartnerSignMessage").text('1行10文字以内にしてください');
        $("div.createPartnerSignMessageArea").show();
        // 連続クリック防止解除
        $("#createPartnerSign").prop("disabled", false);
        $("#createPartnerSign").text("作成する");
      }, 500);
      return false;
    }
    var texts = [sign1];
    if(sign2 != ""){
      texts.push(sign2);
    }
    if(sign3 != ""){
      texts.push(sign3);
    }
    if(sign4 != ""){
      texts.push(sign4);
    }
    $.ajax({
      url: "https://" + location.host + "/e-contract-api/create-sign-image",
      type: "POST",
      data: {
        texts: texts,
        credential: credential
      }
    }).done(function(res) {
      var src = 'data:image/png;base64, ' + res;

      $('#area__stamp').html("<img id=\"area__stamp--img\" src=\"" + src + "\" style=\"display: block;\">");

      // パートナー印影画像をドラッグできるようにする
      $('#area__stamp').draggable({
      });
      // パートナー印影画像のリサイズ
      $("#area__stamp--img").resizable({
        minHeight: 30,
        minWidth: 30,
        handles: "se",
        aspectRatio: true
      });
      setTimeout(function(){
        // 連続クリック防止解除
        $("#createPartnerSign").prop("disabled", false);
        $("#createPartnerSign").text("作成する");
      }, 500);
    }).fail(function(res) {
      setTimeout(function(){
        // 連続クリック防止解除
        $("#createPartnerSign").prop("disabled", false);
        $("#createPartnerSign").text("作成する");
      }, 500);
    });


  });

  /**
  * パートナー承認画面で電子契約を登録する
  **/
  $(document).on('click', '#e_contract_approval_regist', function() {
    // 連続クリック防止
    $("#e_contract_approval_regist").prop("disabled", true);
    $("#e_contract_approval_regist").val("登録中です...");
    // 契約書展開エリアの位置取得
    var document_area = $('#doc_img').offset();
    // パートナーの印影画像位置取得
    var partnersign = $('#area__stamp--img').offset();
    if( partnersign === void 0){
      $("div.upload_document_message").html("印影を作成して設置してください");
      $("div.upload_document_message_area").show();
      // setTimeout(function(){
      //   $("div.upload_document_message_area").hide();

      // }, 3000);
      // 連続クリック防止解除
      $("#e_contract_approval_regist").prop("disabled", false);
      $("#e_contract_approval_regist").val("承認する");

      return false;
    }

    // 契約書が縦長か横長によって拡大倍率を変える
    var contractWidth = $('#doc_img').width();
    var contractHeight = $('#doc_img').height();
    if(contractWidth < contractHeight) {
      // 縦長の場合
      var scale = 1.42;
    } else {
      // 横長の場合
      var scale = 2;
    }

    // パートナー印影画像のdataURI
    var partnersign_img_src = $('#area__stamp--img').attr('src');

    var contractData = {
      scale: scale,
      x: partnersign.left - document_area.left,
      y: partnersign.top - document_area.top,
      width: $('#area__stamp--img').width(),
      height: $('#area__stamp--img').height(),
      data: partnersign_img_src.replace('data:image/png;base64, ', ''),
      size: base64ToFile(partnersign_img_src).size,
    };

    //入力データのバリデーション
    var errorCount = 0;
    var errorMessage;
    if(contractData.x < 0 || contractData.x > contractWidth || contractData.y < 0 || contractData.y > contractHeight) {
      if(errorCount == 0) {
        errorMessage = '印影を契約書枠内に入れてください';
        errorCount++;
      } else {
        errorMessage += '<br>印影を契約書枠内に入れてください';
        errorCount++;
      }
    }
    if(errorCount !== 0) {
      $("div.upload_document_message").html(errorMessage);
      $("div.upload_document_message_area").show();
      // setTimeout(function(){
      //   $("div.upload_document_message_area").hide();
      // }, 3000);
      // 連続クリック防止解除
      $("#e_contract_approval_regist").prop("disabled", false);
      $("#e_contract_approval_regist").val("承認する");
      return false;
    }

    // 契約書登録API処理
    $.ajax({
      url: "https://" + location.host + "/e-contract-api/onestop-sign",
      type: "POST",
      data: contractData,
      dataType: 'json'
    }).done(function(res) {
      if(res.status == 200) {
        // 契約済み契約書のパスを追加してダウンロード
        var downloadFilePath = "https://" + location.host + res.filePath;
        $('#download_contract').attr('href', downloadFilePath);
        $('#download_contract')[0].click();

        // 電子契約登録完了メッセージを表示する
        // $("div.upload_document_message").text("電子契約登録が完了しました");
        // $("div.upload_document_message_area").show();
        // setTimeout(function(){
        //   $("div.upload_document_message_area").hide();
        // }, 3000);
        // 登録完了ページに遷移する
        window.location.href = "https://" + location.host + "/e-contract-api/approval-done";
      } else {
        // 電子契約登録失敗メッセージを表示する
        $("div.upload_document_message").text("電子契約登録に失敗しました");
        $("div.upload_document_message_area").show();
        // setTimeout(function(){
        //   $("div.upload_document_message_area").hide();
        // }, 5000);
      }
    }).fail(function(res) {
      // 電子契約登録失敗メッセージを表示する
      $("div.upload_document_message").text("電子契約登録に失敗しました");
      $("div.upload_document_message_area").show();
      // setTimeout(function(){
      //   $("div.upload_document_message_area").hide();
      // }, 5000);
    });
    // 連続クリック防止解除
    $("#e_contract_approval_regist").prop("disabled", false);
    $("#e_contract_approval_regist").val("承認する");
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

  // 契約書の拡大
  $(document).on('click', '#document_expansion_btn', function() {
    if($("#contract_img").attr("src")==""){
      alert("契約書が展開されていません");
      return;
    }
    var zoom = $(this).data("js_val") + 1;
    if(zoom > 5){var zoom = 1}
    $("#contract_canvas_contents").css('zoom',zoom);
    if(zoom == 1)
    { // 初期表示は一番上にする
      $(".contract_canvas_contents_wrap").scrollTop(0);
    }
    $(this).data("js_val",zoom);
  });

  $("#contract_canvas_contents").droppable({
    drop: function(e, ui) {
      var zoom = $("#document_expansion_btn").data("js_val");
      if(zoom > 1 ){
        alert("陰影を押す場合は拡大を戻してください")
      }
    }
  });

  // 入力欄を追加する
  $(document).on('click', '#document_add_text_btn', function() {
    if($("#contract_img").attr("src")==""){
      alert("契約書が展開されていません");
      return;
    }
    var no = $(this).data("js_val")+1;
    $("#contract_canvas_contents").append("<div class='draggable_input_wrap'><p class='draggable_input_title'>追加テキスト"+no+"</p><textarea name='' class='add_contract_textarea draggable_input'></textarea></div>")
    $('.draggable_input_wrap').draggable({
      cursor:'move',
      helper:'original'
      });
      $(this).data("js_val",no);
  });

/**
* ブラウザ標準のドロップ動作をキャンセル
**/
function documentDragOver(event) {
  event.preventDefault();
}

/**
* 契約書類がドロップされた場合の処理
**/
function documentDrop(event) {
  var localMaterialId = 0;

  try{
    localMaterialId = event.dataTransfer.getData("material_id");
  }catch (e) {
    // IEの場合.setData()でエラーが発生するのでグローバル変数にデータを保持させる
    localMaterialId = dragMaterialId;
  }
  if((typeof event.dataTransfer != "undefined") && localMaterialId && (typeof event.originalEvent == "undefined")) {

    // ドロップした書類のID
    currentDocumentId = localMaterialId;
    // 現在の表示ページを設定
    currentPage = 1;

    // データを取得するためのキーを作成する
    var keyName = "materialId_" + currentDocumentId;
    // ブラウザのセッションストレージからデータ取得
    var mtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));
    // URLの場合はダウンロード等を削除する
    var documentUrlFlg = 0;
    if((mtSessionStorage != null) && mtSessionStorage[keyName]["material_basic"]["material_url"]) {
      documentUrlFlg = 1;
    }

    // ファイル形式がPDFかチェックする
    var filePath = '/cmn-e-contract/'+ mtSessionStorage[keyName]['canvas_document']['hashKey'] + '.pdf';
    var isPdf = true;
    $.ajax({
      url: filePath
    }).done(function(data) {
      if(data.match(/PDF/) == null) {
        isPdf = false;
      }
    })
    .fail(function() {
      isPdf = false;
    });

    setTimeout(function() {
      if(isPdf == false) {
        $("div.upload_document_message").text("ファイル形式がPDFじゃありません");
        $("div.upload_document_message_area").show();
        setTimeout(function(){
          $("div.upload_document_message_area").hide();
        }, 3000);
        return false;
      }
      var documentCanvasLeft = LayoutCtrl.apiGetSubLength();

      // エリア内のコメントを非表示にする
      $('#e_contract_document_comment').hide();

      // 登録ボタンを活性化させる（1度登録していた場合）
      $('.e_contract_regist').attr('id', 'e_contract_regist');
      $('.e_contract_regist').removeClass('mi_inactive_btn');
      $('.e_contract_regist').addClass('mi_default_button');

      // キャンバスに契約書を表示する
      loadContract(NO_NOTIFICATION2, 1);

      // ボーター表示を修正
      $('#e_contract_document_area').css('border', 'none');
      $('#contract_canvas_contents_wrap').css('border', '2px dashed #888');
      $('#contract_canvas_contents_wrap').css('overflow', 'auto');

      // 最後にドロップイベントをキャンセルする
      documentDragOver(event);

      // 契約書をアップしたユーザ情報(表示している資料が自分が表示した資料かを判定するために使用する)
      $("#document_material_id").val(keyName);
      $("#document_uuid").val(mtSessionStorage[keyName]["UUID"]);
      $("#document_user_id").val($("#user_id").val());

      // 表示される契約書の幅と高さを取得するため1秒置いてから処理
      setTimeout(function() {
        var data = {
            command : "E_CONTRACT",
            type : "SHOW_DOCUMENT",
            keyName : keyName,
            currentDocumentId : currentDocumentId,
            currentPage : currentPage,
            documentUrlFlg : documentUrlFlg,
            documentCanvasLeft : documentCanvasLeft,
            documentCanvasWidth : canvasWidth,
            documentCanvasHeight : canvasHeight,
            documentMaterialId : $('#document_material_id').val(),
            document_user_id : $("#document_user_id").val(),
            documentUuId : $('#document_uuid').val()
        };
        sendCommand(SEND_TARGET_ALL, data);
      }, 1000);
    }, 1000);
  }
}

/**
 * キャンバスに契約書を表示する為の画像読み込み
 */
function loadContract(requestUserId, DropFirstFlg){
  // 資料のキーを作成
  var keyName = "materialId_" + currentDocumentId;
  var pageKey = "page" + currentPage;
  // ブラウザのセッションストレージからデータ取得する為の変数宣言
  var mtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));
  if(mtSessionStorage && keyName in mtSessionStorage && $("div#mi_contract_area").is(':visible') && currentDocumentId != 0){
    // 資料画像を非表示にする
    $("img#contract_img").hide();
    // 資料画像のスタイルを初期化する
    $("#contract_img").removeAttr("style");

    // 資料の存在するフォルダパス
    // 開発用に変更中
    // var documentPath = "/negotiation_"+ $("#connection_info_id").val() + "/";
    var documentPath = "/negotiation_document/negotiation_"+ $("#connection_info_id").val() + "/";
    // 資料とキャンバス画像の名前を作成
    var documentName = mtSessionStorage[keyName]["canvas_document"]["document"][pageKey]["fileName"];
    var canvasNames = mtSessionStorage[keyName]["canvas_document"]["document"][pageKey]["fileName"].split(".");
    var canvasName = canvasNames[0] + "-cvs.png";
    // 乱数の文字を取得
    var uuid = UUID.generate();
    var uniqueStr = uuid.replace(/\-/g, '');
    var loadedImgsInfo = [],
        loadedImgs = [],
        imagePaths = [
      {"src": documentPath + documentName + "?" + uniqueStr, "type": "doc"},
      {"src": documentPath + canvasName + "?" + uniqueStr, "type": "cvs"},
    ];
    cvsImgFlg = false;
    // 資料とキャンバスの読み込み
    loadContractImages(imagePaths, loadedImgsInfo, function(loadedImgsInfo) {
      // 読み込み完了
      var cvsImg, docImg;
      $.each(loadedImgsInfo, function(i, e) {
        if(e["type"] == "doc") {
          // 資料画像
          docImg = e["img"];
          // サイズ設定を行うために再度セッションストレージデータを取得する
          var localMtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));
          // 画像のサイズを保存する
          if(localMtSessionStorage[keyName]["canvas_document"]["document"][pageKey]["orgHeight"] == 0){
            localMtSessionStorage[keyName]["canvas_document"]["document"][pageKey]["orgHeight"] = docImg.height;
            // 資料のデータをセッションストレージに保存
            sessionStorage.setItem(keyName, JSON.stringify(localMtSessionStorage));
          }
          if(localMtSessionStorage[keyName]["canvas_document"]["document"][pageKey]["orgWidth"] == 0){
            localMtSessionStorage[keyName]["canvas_document"]["document"][pageKey]["orgWidth"] = docImg.width;
            // 資料のデータをセッションストレージに保存
            sessionStorage.setItem(keyName, JSON.stringify(localMtSessionStorage));
          }
          // imgタグに画像を設定する
          $("#contract_img").attr("src", e["img"].src);
        } else if(e["type"] == "cvs") {
          // キャンパス画像
          cvsImg = e["img"];
          cvsImgFlg = true;
        }
      });
      // 既存の描画処理
      viewContract(requestUserId, docImg, cvsImg, cvsImgFlg, DropFirstFlg);
    });
  }
}

/**
 * パートナーのキャンバスに同サイズの契約書を表示する為の画像読み込み
 */
function loadContractCommon(requestUserId, DropFirstFlg, documentCanvasWidth, documentCanvasHeight){
  // 資料のキーを作成
  var keyName = "materialId_" + currentDocumentId;
  var pageKey = "page" + currentPage;
  // ブラウザのセッションストレージからデータ取得する為の変数宣言
  var mtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));
  if(mtSessionStorage && keyName in mtSessionStorage && $("div#mi_contract_area").is(':visible') && currentDocumentId != 0){
    // 資料画像を非表示にする
    $("img#contract_img").hide();
    // 資料画像のスタイルを初期化する
    $("#contract_img").removeAttr("style");

    // 資料の存在するフォルダパス
    // 開発用に変更中
    // var documentPath = "/negotiation_"+ $("#connection_info_id").val() + "/";
    var documentPath = "/negotiation_document/negotiation_"+ $("#connection_info_id").val() + "/";
    // 資料とキャンバス画像の名前を作成
    var documentName = mtSessionStorage[keyName]["canvas_document"]["document"][pageKey]["fileName"];
    var canvasNames = mtSessionStorage[keyName]["canvas_document"]["document"][pageKey]["fileName"].split(".");
    var canvasName = canvasNames[0] + "-cvs.png";
    // 乱数の文字を取得
    var uuid = UUID.generate();
    var uniqueStr = uuid.replace(/\-/g, '');
    var loadedImgsInfo = [],
        loadedImgs = [],
        imagePaths = [
      {"src": documentPath + documentName + "?" + uniqueStr, "type": "doc"},
      {"src": documentPath + canvasName + "?" + uniqueStr, "type": "cvs"},
    ];
    cvsImgFlg = false;
    // 資料とキャンバスの読み込み
    loadContractImages(imagePaths, loadedImgsInfo, function(loadedImgsInfo) {
      // 読み込み完了
      var cvsImg, docImg;
      $.each(loadedImgsInfo, function(i, e) {
        if(e["type"] == "doc") {
          // 資料画像
          docImg = e["img"];
          // サイズ設定を行うために再度セッションストレージデータを取得する
          var localMtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));
          // 画像のサイズを保存する
          if(localMtSessionStorage[keyName]["canvas_document"]["document"][pageKey]["orgHeight"] == 0){
            localMtSessionStorage[keyName]["canvas_document"]["document"][pageKey]["orgHeight"] = docImg.height;
            // 資料のデータをセッションストレージに保存
            sessionStorage.setItem(keyName, JSON.stringify(localMtSessionStorage));
          }
          if(localMtSessionStorage[keyName]["canvas_document"]["document"][pageKey]["orgWidth"] == 0){
            localMtSessionStorage[keyName]["canvas_document"]["document"][pageKey]["orgWidth"] = docImg.width;
            // 資料のデータをセッションストレージに保存
            sessionStorage.setItem(keyName, JSON.stringify(localMtSessionStorage));
          }
          // imgタグに画像を設定する
          $("#contract_img").attr("src", e["img"].src);
        } else if(e["type"] == "cvs") {
          // キャンパス画像
          cvsImg = e["img"];
          cvsImgFlg = true;
        }
      });
      // 既存の描画処理
      viewContractCommon(requestUserId, docImg, cvsImg, cvsImgFlg, documentCanvasWidth, documentCanvasHeight, DropFirstFlg);
    });
  }
}

/**
 * 資料とキャンバス画像読み込み(すべての読み込みが完了するまで描画しないため)
 */
function loadContractImages(imagePaths, loadedImgsInfo, callback) {
  if(!imagePaths) { return; }
  var count = imagePaths.length;
  $.each(imagePaths, function(key, data) {
    var onLoad = function(e) {
      count--;
      if(0 == count) {
        callback(loadedImgsInfo);
      }
    }
    var img = new Image();
    img.onload = function() {
      data['img'] = this;
      loadedImgsInfo.push(data);
      onLoad();
    }
    img.onerror = function() {
      onLoad();
    }
    img.src = data["src"];
  });
}

/**
 * 契約書表示
 */
function viewContract(requestUserId, documentImg, canvasImg, canvasImgFlg, DropFirstFlg){
  // 資料のキーを作成
  var keyName = "materialId_" + currentDocumentId;
  var pageKey = "page" + currentPage;
  // ブラウザのセッションストレージからデータ取得する為の変数宣言
  var mtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));

  var material_user_id = mtSessionStorage[keyName]["userId"];
  // コメントの制御を行う
  // 自身のuseridと違う場合はメモアイコンは非表示
  var user_id = $('#user_id').val();
  $("div#contract_header_icon img.img_contract_comment").hide();
  if ($('#is_operator').val() == "1") {
    if(user_id == material_user_id) {
      // 新しい資料を表示する際はコメントを非表示にする
      $("p.mi_document_note").hide();
      // コメントの表示アイコンの制御
      if(getMaterialMemo()){
        // コメントが存在する場合
        $("div#contract_header_icon img.img_contract_comment").show();
      }
    }
  }

  // 資料ドロップ時は最大サイズとする
  if( DropFirstFlg == 1 ) {
    $("div#mi_contract_area").height($("div#e_contract_document_area").height()).width($("div#e_contract_document_area").width());
  }

  // 契約書表示領域を設定する
  setContractCanvasSize();

  // 画像のサイズを計算する
  getContractCanvasSize(mtSessionStorage[keyName]["canvas_document"]["document"][pageKey], (orgCanvasHeight * codumentViewState), (orgCanvasWidth * codumentViewState), (orgCanvasHeight * codumentViewState), (orgCanvasWidth * codumentViewState));
  // キャンバスのサイズを指定する
  resizeContract(DropFirstFlg);

  // キャンバスのオブジェクトを取得
  var element = document.getElementById("contract_canvas");

  // context取得
  var context = element.getContext('2d');
  context.fillStyle = "rgba(255, 255, 255, 0)";
  if(canvasImgFlg){
    // 画像を描画
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    context.drawImage(canvasImg, 0, 0, canvasWidth, canvasHeight);
  }
  // 資料の表示領域を表示
  $("img#contract_img").show();
  $("div#mi_contract_area").show();

  // 目次アイコンの制御
  if(mtSessionStorage[keyName]["viewFlg"] || mtSessionStorage[keyName]["userId"] == $('#user_id').val()){
    $("li.left_icon_content").removeClass("display_none");
  }else{
    $("li.left_icon_content").addClass("display_none");
  }

  // 初期化時の資料同期処理の場合、画像読み込み後にスクロール設定を行う
  if(syncDocumentScrollTop > 0){
    $("div#mi_docment_area").scrollTop(syncDocumentScrollTop);
    syncDocumentScrollTop = 0;
  }
  if(syncDocumentScrollLeft > 0){
    $("div#mi_docment_area").scrollLeft(syncDocumentScrollLeft);
    syncDocumentScrollLeft = 0;
  }
}


/**
 * パートナー側の契約書表示
 */
function viewContractCommon(requestUserId, documentImg, canvasImg, canvasImgFlg, documentCanvasWidth, documentCanvasHeigh, DropFirstFlg){
  // 資料のキーを作成
  var keyName = "materialId_" + currentDocumentId;
  var pageKey = "page" + currentPage;
  // ブラウザのセッションストレージからデータ取得する為の変数宣言
  var mtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));

  var material_user_id = mtSessionStorage[keyName]["userId"];
  // コメントの制御を行う
  // 自身のuseridと違う場合はメモアイコンは非表示
  var user_id = $('#user_id').val();
  $("div#contract_header_icon img.img_contract_comment").hide();
  if ($('#is_operator').val() == "1") {
    if(user_id == material_user_id) {
      // 新しい資料を表示する際はコメントを非表示にする
      $("p.mi_document_note").hide();
      // コメントの表示アイコンの制御
      if(getMaterialMemo()){
        // コメントが存在する場合
        $("div#contract_header_icon img.img_contract_comment").show();
      }
    }
  }

  // 資料ドロップ時は最大サイズとする
  if( DropFirstFlg == 1 ) {
    $("div#mi_contract_area").height($("div#e_contract_document_area").height()).width($("div#e_contract_document_area").width());
  }

  // 契約書表示領域を設定する
  orgCanvasWidth = documentCanvasWidth;
  orgCanvasHeight = documentCanvasHeigh;

  // 画像のサイズを計算する
  getContractCanvasSize(mtSessionStorage[keyName]["canvas_document"]["document"][pageKey], (orgCanvasHeight * codumentViewState), (orgCanvasWidth * codumentViewState), (orgCanvasHeight * codumentViewState), (orgCanvasWidth * codumentViewState));
  // キャンバスのサイズを指定する
  resizeContract(DropFirstFlg);

  // キャンバスのオブジェクトを取得
  var element = document.getElementById("contract_canvas");

  // context取得
  var context = element.getContext('2d');
  context.fillStyle = "rgba(255, 255, 255, 0)";
  if(canvasImgFlg){
    // 画像を描画
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    context.drawImage(canvasImg, 0, 0, canvasWidth, canvasHeight);
  }
  // 資料の表示領域を表示
  $("img#contract_img").show();
  $("div#mi_contract_area").show();

  // 目次アイコンの制御
  if(mtSessionStorage[keyName]["viewFlg"] || mtSessionStorage[keyName]["userId"] == $('#user_id').val()){
    $("li.left_icon_content").removeClass("display_none");
  }else{
    $("li.left_icon_content").addClass("display_none");
  }

  // 初期化時の資料同期処理の場合、画像読み込み後にスクロール設定を行う
  if(syncDocumentScrollTop > 0){
    $("div#mi_docment_area").scrollTop(syncDocumentScrollTop);
    syncDocumentScrollTop = 0;
  }
  if(syncDocumentScrollLeft > 0){
    $("div#mi_docment_area").scrollLeft(syncDocumentScrollLeft);
    syncDocumentScrollLeft = 0;
  }

}

/* 資料の表示領域を設定する
* @returns
*/
function setContractCanvasSize(){
  orgCanvasWidth = $("#e_contract_document_area").width();
  orgCanvasHeight = $("#e_contract_document_area").height();
}

/**
 * キャンバスのサイズを決める
 * サイズが合うまで再帰する
 * ※2017-04-26 仕様が変更になり元のサイズをそのまま出力するように変更
 */
function getContractCanvasSize(documentInfo, localCanvasHeight, localCanvasWidth, viewCanvasHeight, viewCanvasWidth){
  if(documentInfo["orgHeight"] > documentInfo["orgWidth"]){
    // 縦長画像の場合
    localCanvasWidth = documentInfo["orgWidth"] * localCanvasHeight / documentInfo["orgHeight"];
    if(localCanvasWidth > viewCanvasWidth){
      // 縦に合わせ横を計算した結果、横が枠より大きい場合は縦サイズを縮めて再計算する
      localCanvasHeight = localCanvasHeight - 1;
      getContractCanvasSize(documentInfo, localCanvasHeight, localCanvasWidth, viewCanvasHeight, viewCanvasWidth);
    }else{
      // グローバル変数に値を設定する
      canvasHeight = localCanvasHeight;
      canvasWidth = localCanvasWidth;
    }
  }else{
    // 横長画像の場合
    localCanvasHeight = documentInfo["orgHeight"] * localCanvasWidth / documentInfo["orgWidth"];
    if(localCanvasHeight > viewCanvasHeight){
      // 横に合わせ縦を計算した結果、縦が枠より大きい場合は横サイズを縮めて再計算する
      localCanvasWidth = localCanvasWidth - 1;
      // 自身の関数で再帰する
      getContractCanvasSize(documentInfo, localCanvasHeight, localCanvasWidth, viewCanvasHeight, viewCanvasWidth);
    }else{
      // グローバル変数に値を設定する
      canvasHeight = localCanvasHeight;
      canvasWidth = localCanvasWidth;
    }
  }
}

/**
 * キャンバスのサイズを動的に変更する
 */
function resizeContract(DropFirstFlg){
  // キャンバスのサイズを指定する
  var element = document.getElementById("contract_canvas");
  // context取得
  var context = element.getContext('2d');
  // キャンバスの内容を初期化する
  context.clearRect(0, 0, canvasWidth, canvasHeight);
  // キャンバスのサイズを指定する
  element.setAttribute("width", canvasWidth);
  element.setAttribute("height", canvasHeight);

  $("div.contract_canvas_contents").height(canvasHeight).width(canvasWidth);
  $('#contract_canvas_contents_wrap').height(canvasHeight).width(canvasWidth);
  // 資料画像のサイズを設定する
  $("img#contract_img").height(canvasHeight).width(canvasWidth);

  // 拡大時はスクロールが表示される前提なので、資料のフレームサイズを大きくしない
  if($("div#mi_contract_area").height() >= canvasHeight && $("div#mi_contract_area").width() >= canvasWidth){
    // キャンバスが資料フレーム表示領域より小さい場合はサイズをフィットさせる
    $("div#mi_contract_are").height(canvasHeight).width(canvasWidth);
    // キャンバスが資料フレーム領域にフィットするのでスクロールを削除する
  }else{
    // キャンバスが資料フレーム表示領域より大きい場合はスクロールを追加し表示する
    $("div#mi_contract_are").css("overflow", "scroll");
  }
}

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
 * 相手から送信された電子契約画面の情報を受取る関数
 * @param json
 */
function receiveEContractJson(json){
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
    $('#have_amount:checked').val(json.have_amount);
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
        let num = i+1;
        $('#partner-area').append('<div class="partner_setting_item"><div class="partner_setting_item_header"><p><span class="icon-parsonal"></span><span class="partner_setting_item_count">' + num + '人目</span>：' + num + '番目に契約書にサインを行う人</p><div id="partner-remove" class="partner_setting_item_remove">×</div></div><div class="partner_setting_input_area"><div class="partner_setting_input_row"><label>氏名<span class="require">必須</span></label><input type="text" name="lastname' + num + '" class="partner_setting_input_name lastname e_contract_info_text" placeholder="田中"><input type="text" name="firstname' + num + '" class="partner_setting_input_name firstname e_contract_info_text" placeholder="太郎"></div><div class="partner_setting_input_row"><label>企業名</label><input type="text" name="organization_name' + num + '" placeholder="入力してください" class="partner_setting_input organization_name e_contract_info_text"></div><div class="partner_setting_input_row"><label>役職</label><input type="text" name="title' + num + '" placeholder="入力してください" class="partner_setting_input title e_contract_info_text"></div><div class="partner_setting_input_row"><label>メールアドレス<span class="require">必須</span></label><input type="email" name="email' + num + '" placeholder="aaaaa@aaaaa.jp" class="partner_setting_input email e_contract_info_text"></div><div class="partner_setting_input_row"><label>認証コード<span class="note">（8文字以上の半角英数字）</span><span class="require">必須</span></label><p class="sign-text-note">認証コードを設定してください。作成した電子契約を閲覧したいときに使います。</p><input type="text" id="password" name="password' + num + '" class="partner_setting_input_name password e_contract_info_text"></div><div id="authorization-code" class="partner_setting_input_row"><label>電話番号<span class="note">（ハイフンなし）</span></label><p class="authorization-code-note">ルーム内で契約を完了させたい場合は、電話番号を入力して認証するを押下してください。</p><input type="number" id="tel" name="tel' + num + '" class="partner_setting_input_name e_contract_info_text"><span id="send-tel" class="partner_setting_send_code">認証する</span></div><input type="hidden" name="token' + num + '" id="token" class="token" value=""><div class="partner_setting_item_lifting"><p class="partner_setting_item_lifting_label">承認順の変更</p><div class="partner_setting_item_lifting_btnarea"><div id="approval_down" class="partner_setting_item_lifting_btn">▼</div><div id="approval_up" class="partner_setting_item_lifting_btn">▲</div></div></div></div></div>');
      }
      $('.partner_setting_item').eq(i).find('.lastname').val(json.lastname[i]);
      $('.partner_setting_item').eq(i).find('.firstname').val(json.firstname[i]);
      $('.partner_setting_item').eq(i).find('.organization_name').val(json.organization_name[i]);
      $('.partner_setting_item').eq(i).find('.title').val(json.title[i]);
      $('.partner_setting_item').eq(i).find('.email').val(json.email[i]);

      if ($('#client_id').val() !== '0') {
        $('.partner_setting_item').eq(i).find('#password').attr("readonly", true);
        $('.partner_setting_item').eq(i).find('#password').css("background-color", "#efefef");
        $('.partner_setting_item').eq(i).find('#tel').attr("readonly", true);
        $('.partner_setting_item').eq(i).find('#tel').css("background-color", "#efefef");
      }

    }

    if ($('#client_id').val() === '0') {
      // パートナー側で印影作成、登録ボタンを非表示にする
      $('#e_contract_document_td').parent().hide();
      $('#e_contract_document_td').append('<div id="e_contract_document_text"></div>');
      $('#e_contract_cancel').hide();
      $('#submit_button').hide();
      $('#e_contract_regist').hide();
      $('#createPartnerSign').hide();
      $('#e_contract_client_info').hide();
    }
    // 新レイアウトで追加された関数の呼び出し
    swapToggleHide(NEGOTIATION.rightAreaDom,RIGHT_AREA_E_CONTRACT);
  } else if(json.type == "SEND_DOCUMENT_NAME"){
    // テンプレート名を表示する
    $('#e_contract_document_text').text(json.documentName);
  } else if(json.type == "SHOW_DOCUMENT") {
    // ユーザー一覧ダイアログ表示中の場合は閉じる
    if($('#room-userlist-dialog').hasClass("ui-dialog-content") && $('#room-userlist-dialog').dialog('isOpen')) {
      $('#room-userlist-dialog').dialog('close');
    }
    // 資料を非表示にする
    hideContractCommon();

    // 表示する資料のIDとページを保存する
    currentDocumentId = json.currentDocumentId;
    currentPage = json.currentPage;

    // 資料を表示する
    showContractCommon(json.documentCanvasLeft, json.documentCanvasWidth, json.documentCanvasHeight, json.documentUrlFlg, json.document_user_id, json.documentUuId, json.documentMaterialId);
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
    if(authFlg == true && telAuthFlg == false) {
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
    if(authFlg == true && telAuthFlg == false) {
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
          $('#material' + i).append('<div id="' + form.id + '" class="form_setting_parts_text_dammy form_setting_parts" data-input="'+input.id+'" data-page="' + form.page + '" style="position: absolute; top: ' + form.y + 'px; left: ' + form.x + 'px;"><div class="parts_inner_text_dammy" style="width: ' + form.width + 'px; height: ' + form.height + 'px; font-size: ' + form.font_size + 'px;>テキストが入ります</div></div></div>');
        } else if(form.type == 'textarea') {
          $('#material' + i).append('<div id="' + form.id + '" class="form_setting_parts_textarea_dammy form_setting_parts" data-input="'+input.id+'" data-page="' + form.page + '" style="position: absolute; top: ' + form.y + 'px; left: ' + form.x + 'px;"><div class="parts_inner_textarea_dammy" style="width: ' + form.width + 'px; height: ' + form.height + 'px; font-size: ' + form.font_size + 'px;">複数行のテキストが入ります</div></div>');
        } else if(form.type == 'sign') {
          $('#material' + i).append('<div id="' + form.id + '" class="form_setting_parts_sign_dammy form_setting_parts" data-page="' + form.page + '" style="position: absolute; top: ' + form.y + 'px; left: ' + form.x + 'px;"><div class="parts_inner_sign_dammy" style="width: ' + form.width + 'px; height: ' + form.height + 'px;"></div></div>');
        } else if(form.type == 'checkbox') {
          $('#material' + i).append('<div id="' + form.id + '" class="form_setting_parts_checkbox_dammy form_setting_parts" data-page="' + form.page + '" style="position: absolute; top: ' + form.y + 'px; left: ' + form.x + 'px;"><div class="parts_inner_checkbox_dammy" style="width: ' + form.width + 'px; height: ' + form.height + 'px;"></div></div>');
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
    // 配列に保存されているテキストフォームを1つずつ取り出す
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
    $('#' + json.formId).prepend('<img class="sign_img" style="position: absolute; top: 11px; left: -1px; width: ' + json.inputRes.input.img_width + 'px; height: ' + json.inputRes.input.img_height + 'px;" src="data:image/png;base64, ' + json.res + '">');
    $('#' + json.formId).prepend('<p class="done self_sign">設定済み</p>');
    $('#' + json.formId).css({'background-color':'transparent'});
  } else if(json.type == "INPUT_PARTNER_SIGN") {
    // 設定済み背景に変更する
    $('#' + json.formId + ' .done').remove();
    // 印影画像を表示
    $('#' + json.formId).find('.sign_img').remove();
    $('#' + json.formId).prepend('<img class="sign_img" style="position: absolute; top: 11px; left: -1px; width: ' + json.inputRes.input.img_width + 'px; height: ' + json.inputRes.input.img_height + 'px;" src="data:image/png;base64, ' + json.res + '">');
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
    $('#' + json.formId).prepend('<input type="text" id="' + json.partnerId + '" class="parts_inner_text_dammy text_form" style="width: ' + json.res.input.width + 'px; height: ' + json.res.input.height + 'px; font-size: ' + json.res.input.font_size + 'px;">');
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
    $('#' + json.formId).prepend('<textarea id="'+ json.partnerId +'" class="parts_inner_textarea_dammy text_form" style="width: ' + json.res.input.width + 'px; height: ' + json.res.input.height + 'px; font-size: ' + json.res.input.font_size + 'px; resize: none;"></textarea>');
    if (json.partnerId == 0){
      // readonly 付与
      $('#' + json.formId + ' .parts_inner_textarea_dammy').attr('readonly',true);
    } else {
      // readonly 外す
      $('#' + json.formId + ' .parts_inner_textarea_dammy').attr('readonly',false);
      $('#' + json.formId + ' .parts_inner_textarea_dammy').focus();
    }
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
    $('#' + json.formId).off('click')
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
      amount = json.res['case'].amount;
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

// partner側はんこ選択時の処理
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
      $('#' + formId).find('.sign_img').remove();
      $('.form_setting_partner_sign').remove();
      // 印影画像を表示
      $('#' + formId).prepend('<img class="sign_img" style="position: absolute; top: 11px; left: -1px; width: ' + inputRes.input.width + 'px; height: ' + inputRes.input.height + 'px;" src="data:image/png;base64, ' + res + '">');
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

/**
 * 契約書を非表示にする場合の共通処理
 * @returns
 */
function hideContractCommon(){
  // 現在表示中の資料IDを初期化する
  currentDocumentId = 0;
  // 現在表示中のページを初期化する
  currentPage = 0;

  // 目次アイコンを非表示にする
  $("li.left_icon_content").addClass("display_none");

  $("#document_material_id").val("");
  $("#document_uuid").val("");
  $("#document_user_id").val("");
}

/**
 * 資料を表示する共通処理
 * 同期処理で呼び出されるため関数化
 * @returns
 */
function showContractCommon(documentCanvasLeft, documentCanvasWidth, documentCanvasHeight, documentUrlFlg, documentUserId, documentUuId, documentMaterialId){
  // 拡大表示をリセット
  codumentViewState = 1;  // [1:縮小, 1.7:拡大1, 2.4:拡大2, 3.1:拡大3]

  $("#document_user_id").val(documentUserId);
  $("#document_material_id").val(documentMaterialId);
  $("#document_uuid").val(documentUuId);

  // エリア内のコメントを非表示にする
  $('#e_contract_document_comment').hide();

  // キャンバスに契約書を表示する
  loadContractCommon(NO_NOTIFICATION2, 1, documentCanvasWidth, documentCanvasHeight);

  // ボーター表示を修正
  $('#e_contract_document_area').css('border', 'none');
  $('#contract_canvas_contents_wrap').css('border', '2px dashed #888');
  $('#contract_canvas_contents_wrap').css('overflow', 'auto');

  // URLの場合はページャーを削除し、ダウンロード等を消す
  if(documentUrlFlg){
    // ダウンロードアイコンを非表示にする
    $("div#document_header_icon").hide();
  }else{
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
* メールアドレスのチェック
**/
function mailCheck(mail) {
  var mail_regex1 = new RegExp( '(?:[-!#-\'*+/-9=?A-Z^-~]+\.?(?:\.[-!#-\'*+/-9=?A-Z^-~]+)*|"(?:[!#-\[\]-~]|\\\\[\x09 -~])*")@[-!#-\'*+/-9=?A-Z^-~]+(?:\.[-!#-\'*+/-9=?A-Z^-~]+)*' );
  var mail_regex2 = new RegExp( '^[^\@]+\@[^\@]+$' );
  if( mail.match( mail_regex1 ) && mail.match( mail_regex2 ) ) {
    // 全角チェック
    if( mail.match( /[^a-zA-Z0-9\!\"\#\$\%\&\'\(\)\=\~\|\-\^\\\@\[\;\:\]\,\.\/\\\<\>\?\_\`\{\+\*\} ]/ ) ) { return false; }
    // 末尾TLDチェック（〜.co,jpなどの末尾ミスチェック用）
    if( !mail.match( /\.[a-z]+$/ ) ) { return false; }
    return true;
  } else {
    return false;
  }
}

