<!DOCTYPE html>
<html>
<head>
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>契約書捺印</title>
<meta charset="utf-8">
<meta name="description" content="">
<meta name="author" content="">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="shortcut icon" href="">
<link rel="stylesheet" href="/css/reset.css">
<link rel="stylesheet" href="/css/sp/e_contract.css">
<script src="/js/jquery-1.11.2.min.js?{$application_version}"></script>
<script src="/js/jquery-ui.min.js?{$application_version}"></script>
{literal}
  <script>
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
    });

    window.onload = function(){
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
      $(".form_setting_parts_text_dammy").css('display','none');
      $(".form_setting_parts_textarea_dammy").css('display','none');
      $(".form_setting_parts_checkbox_dammy").css('display','none');
      $(".form_setting_parts_sign_dammy").css('display','none');
      $("[data-page = " + IntPageCount + "]").css('display','');
    }

    // 出力されるデータ分だけ異なるidを付与
    $(function(){
      $('.file_target').each(function(i){
        $(this).attr('id',(i+1));
      });
    });

    $(function(){
      $('.form_setting_document_img').each(function(i){
        $(this).attr('id','document'+(i+1));
      });
    });

    $(function(){
      $('.form_setting_document_page_count').each(function(i){
        $(this).attr('data-id',(i+1));
      });
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

    // 押印入力フォームの開閉
    $(document).on('click', '.partner_select_open', function() {
      $(this).next().toggle();
    });

    // 押印入力フォームを閉じる
    $(document).click(function(event) {
      if(!$(event.target).closest('.form_setting_parts_sign_dammy').length) {
        $('.form_setting_partner_sign').hide();
        $('.form_setting_parts').css({'z-index': '0'});
        $('.form_setting_partner_sign').css('display', 'none');
        $('.partner_select_open').css('display', 'none');
      }
    });

    // テキストフォーム変更時に登録する
    $(document).on('change', '.text_form', function() {
      var partnerId = $('#partnerId').val();
      var formId = $(this).parent().attr('id');
      if(formId == undefined) {
        return false;
      }
      var text = $(this).val();

      var data = {};
      data['value'] = text;
      data['target'] = "partner";
      data['size'] = '14';
      data['required'] = "true";

      // テキストが空じゃなければ登録する
      if(text != '') {
        $.ajax({
          url: "/e-contract-api/value-input",
          type: "POST",
          dataType: "text",
          data: {
            "form_id"    : formId,
            "partner_id" : partnerId,
            "data"       : data
          },
        }).done(function(res) {
          $('#' + formId + ' .done').remove();
          $('#' + formId).prepend('<p class="done">入力済み</p>');
          $('#' + formId).css({'background-color':'transparent'});
          // 設定済みフォームを取得して、カウントを変更
          var done = document.getElementsByClassName('done');
          $('#done_form_count').text(done.length);

          $('#' + formId).css({'z-index': '0'});
          $('#' + formId).find('.form_setting_partner_sign').css('display', 'none');

        }).fail(function(res) {
        });
      } else {
      }
    });

    // サイン押印時に登録する
    $(document).on('click', '.signning', function() {
      var formId = $(this).parents('.form_setting_parts').attr('id');
      if(formId == undefined) {
        return false;
      }
      var partnerId = $('#partnerId').val();
      var credential = $("#credential").val();
      var texts = [];
      texts.push($(this).prevAll('.text1').val());
      texts.push($(this).prevAll('.text2').val());
      texts.push($(this).prevAll('.text3').val());
      texts.push($(this).prevAll('.text4').val());
      // 何も入力されていない場合は処理を止める
      if(!texts.filter(Boolean).length) {
        return false;
      }
      
      // 印影画像の取得
      $.ajax({
        url: "/e-contract-api/create-sign-image",
        type: "POST",
        dataType: "text",
        data: {
          "credential" : credential,
          "texts"      : texts
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
            "form_id"    : formId,
            "partner_id" : partnerId,
            "data"       : data
          }
        }).done(function(inputRes) {
          // ローディングを非表示にする
          var fileCount = $('#filePageId').text() - 1;
          $('#loading' + fileCount).css({'display':'none'});
          // 設定済み背景に変更する
          $('#' + formId + ' .done').remove();
          // 印影画像を表示
          $('#' + formId + ' .sign_img').remove();
          $('#' + formId).prepend('<img class="sign_img" style="position: absolute; top: 6px; left: 7px; width: ' + inputRes.input.width/2 + 'px; height: ' + inputRes.input.height/2 + 'px;" src="data:image/png;base64, ' + res + '">');
          $('#' + formId).prepend('<p class="done self_sign">設定済み</p>');
          $('#' + formId).css({'background-color':'transparent'});
          $('.partner_select_open').css('display', 'none');
          // 設定済みフォームを取得して、カウントを変更
          var done = document.getElementsByClassName('done');
          $('#done_form_count').text(done.length);
        }).fail(function() {
        });
      }).fail(function(res) {
      });
    });

    // チェックボックスクリック時に登録する
    $(document).on('click', '.parts_inner_checkbox_dammy.input', function() {
      var formId = $(this).parents('.form_setting_parts').attr('id');
      if(formId == undefined) {
        return false;
      }
      var partnerId = $('#partnerId').val();

      // チェックボックスデータ
      var imgData = 'iVBORw0KGgoAAAANSUhEUgAAACMAAAAjCAYAAAAe2bNZAAAAAXNSR0IArs4c6QAAAiRJREFUWAntmDtLA0EQx2fPnCQa0FgoBnyg2GrAR2OjILa+wFb9CBbmQ2jjN1BbBUmtCNfY+Iy2gkaF+AI90RhjfN0/yyYRsmcel0tzU1yW2dmZ3/5n0wwjw662gn6qaVj4+kxM/Xy+t8BnhymqJ6pUVa/T2+NS6+hilKVAPD7N6+/r8jZ1k1rbaAdHqkYydk8vt+H32M3RNcWfhlxQxNvc2+XrGLENQhTCxRs6R92MsZaX6GFQ+f76mIYilTRvU4/b4JhUvpNxv52tyXVp1MdbVXJtVsrnwMiUd5RxlEkpoIeJQj6i3QmZIGl/ed8MQLRhoqROpB+ni8oW5YPJBlHriAZDMoa0vzwwkdWMIgAZ0ojqA+misoVLtlG0HyD7c/x4XQ/RsEak1ueVzlplSgABrTnMg3GryFpet6ISQVDEvE2748Y/4ZkIUP0rcigLQJDcXJn2WQ6QXYx7Mt+z5aLfSCYJX5nDBIxCbTM8MhfQ3ixReJ7v+8cKeqz80N+veZsQO7DKT1wabwdAMLQMIPDBACziuKeo7/8wSCsKCaB7jegtgh3LQJDKvE2IEAYg0bIygKBM/jCIzgayqDVIKyy/Nolo/AJItC3bb8G6MGUsKGiWwoGRqeMoI1UGYwlMAyppqM9c7msF85HXu9NKslDs7iRhcGwqGNS8Rg/O9Isdslsh1NPPtxPGOOSKxZ8WGSTBwOjH4wtiLGH35Iop6gZAMLn6BTGLwMGnHwLyAAAAAElFTkSuQmCC';

      var data = {};
      data['target']   = 'partner';
      data['img_data'] = imgData;
      data['img_type'] = 'image/png';

      // フォーム情報が登録されていれば更新、登録されていなければ登録する
      $.ajax({
        url: "/e-contract-api/value-input",
        type: "POST",
        dataType: "json",
        data: {
          "form_id"    : formId,
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
      }).done(function(inputRes) {
        // ローディングを非表示にする
        var fileCount = $('#filePageId').text() - 1;
        $('#loading' + fileCount).css({'display':'none'});
        // 設定済み背景に変更する
        $('#' + formId + ' .done').remove();
        // チェックボックス画像を表示
        $('#' + formId).prepend('<img style="position: absolute; top: 5px; left: 0px; width: ' + inputRes.input.width/2 + 'px; height: ' + inputRes.input.width/2 + 'px;" src="data:image/png;base64, ' + imgData + '">');
        $('#' + formId).prepend('<p class="done">設定済み</p>');
        $('#' + formId).css({'background-color':'transparent'});
        // 設定済みフォームを取得して、カウントを変更
        var done = document.getElementsByClassName('done');
        $('#done_form_count').text(done.length);
      }).fail(function() {
      });
    });

    // 却下ボタン押下時
    function cancelEContract() {
      if(window.confirm('本当に却下してもよろしいですか？')) {
        var partnerId = $('#partnerId').val();
        var caseId = $('#caseId').val();
        $.ajax({
          url: "/e-contract-api/reject",
          type: "POST",
          datatype: "text",
          data: {
            "partner_id" : partnerId,
            "case_id"    : caseId
          }
        }).done(function(res) {
          window.location.href = '/e-contract-api/rejected';
        }).fail(function(res) {
        });
      }
    }

    // 承認ボタン押下時
    function approvalEContract() {
      var doneFormCount = $('#done_form_count').text();
      var totalFormCount = $('#total_form_count').text();
      var partnerId = $('#partnerId').val();
      var caseId = $('#caseId').val();
      var authenticationCode = $('#authenticationCode').val();

      // [設定済み・入力済み] もしくは 必須入力ではない場合.
      let notEnteredCnt = [].slice.call(document.querySelectorAll('[data-require]')).map(e=> {
        console.log(e);
        return e.querySelector(".done") != null || e.dataset.require=="false";
      }).filter(e => e == false).length;

      if(0 == notEnteredCnt) {

        if(authenticationCode == '') {
          $('.form_setting_error').remove();
          $('html, body').animate({scrollTop:0});
          $('.e_contract_title_area').append('<div class="form_setting_error">認証コードを設定してください</div>');
          return false;
        } else if(authenticationCode.match(/^[A-Za-z0-9]{8,}$/) == null) {
          $('.form_setting_error').remove();
          $('html, body').animate({scrollTop:0});
          $('.e_contract_title_area').append('<div class="form_setting_error">認証コードが不適切です</div>');
          return false;
        }

        $.ajax({
          url: "/e-contract-api/approval-and-next",
          type: "POST",
          dataType: "text",
          data: {
            "partner_id" : partnerId,
            "case_id" : caseId,
            "authentication_code" : authenticationCode
          }
        }).done(function(res) {
          res = jQuery.parseJSON(res);
          if(res.status == 'sent') {
            // 次の承認者にメール送信した場合
            window.location.href = '/e-contract-api/approved';
          } else if(res.status == 'unsent') {
            // 最後の承認者信の場合
            var credential = $("#credential").val();
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
                // 契約済み契約書のパスを追加してダウンロード
                var downloadFilePath = "https://" + location.host + res.filePath;
                $('#download_contract').attr('href', downloadFilePath);
                $('#download_contract')[0].click();

                // 電子契約登録完了メッセージを表示する
                $("div.upload_document_message").text("電子契約登録が完了しました");
                $("div.upload_document_message_area").show();
                setTimeout(function(){
                  $("div.upload_document_message_area").hide();
                }, 3000);
                // 契約完了ページに遷移する
                window.location.href = '/e-contract-api/contracted';
              } else {
                // 電子契約登録失敗メッセージを表示する
                $("div.upload_document_message").text("電子契約登録に失敗しました");
                $("div.upload_document_message_area").show();
                setTimeout(function(){
                  $("div.upload_document_message_area").hide();
                }, 5000);
              }
            }).fail(function(res) {
            });
          }
        }).fail(function(res) {
        });
      } else {
        // 未設定済みのフォームがある場合
        $('.form_setting_error').remove();
        $('html, body').animate({scrollTop:0});
        $('.e_contract_title_area').append('<div class="form_setting_error">全てのフォームを設定してください</div>');
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
</head>
<body>
	<div class="e_contract__wrap">
    <div class="e_contract__header">
      <img src="/img/logo_header.png" alt="meet in" class="e_contract__header--logo">
      <p class="e_contract__header--title">契約書捺印</p>
    </div>

    <div class="e_contract__content--wrap">
      <p class="e_contract__content--title">契約書にサインする</p>
      <p class="e_contract__content--description">契約書に設置されている入力フォームに内容を入力し、「承認」をクリックしてください。</p>

      <!-- サイン件数エリア begin -->
      <div class="e_contract__status--list">
        <div class="e_contract__status--row">
          <div class="e_contract__status--label">ステータス</div>
          <div class="e_contract__status--content">確認中</div>
        </div>
        <div class="e_contract__status--row">
          <div class="e_contract__status--label">サイン箇所</div>
          <div class="e_contract__status--content"><span id="done_form_count">0</span>件 / <span id="total_form_count">{$formCount}</span>件</div>
        </div>
        <div class="e_contract__content--reject">
          <a href="javascript:void(0)" onClick="cancelEContract();">却下する</a>
        </div>
      </div>
      <!-- サイン件数エリア end -->

      <!-- ファイル表示エリア begin -->
      <div class="e_contract__file--list">
        {* <p class="e_contract__file--count">契約書　全{$fileList|@count}件</p> *}
        {foreach from=$fileList item=row}
          <div class="form_template-name">
            <span class="template-name_text">
            {$row.name}
            <a class="file_target" id="0"></a>
            </span>
          </div>
        {/foreach}
      </div>
      <!-- ファイル表示エリア end -->

      <!-- エラー表示エリア end -->
      <div class="e_contract_title_area"></div>
      <!-- エラー表示エリア end -->

      <!-- 契約書エリア begin -->
      {foreach from=$materialList item=row name=loop}
        <div class="form_setting_document_area">
          <div class="form_setting_document_img" id="0">
            <div class="form_setting_document_operation_area">
              {* <div class="form_setting_document_count_area">
                <div class="count-text">
                  <span class="form_setting_file_page_count" id="filePageId">1</span>/<span class="form_setting_file_page_total">{$fileList|@count}</span>件
                </div>
                <div class="form_setting_file_pager">
                  <span class="form_setting_file_pager_prev">＜</span><span class="form_setting_file_pager_next">＞</span>
                </div>
              </div> *}
              <div class="form_setting_document_page_area">
                <div class="page-text">
                  <span class="form_setting_document_page_count" id="pageId" data-id="0">1</span>/<span class="form_setting_document_page_total">{$row|@count}</span>P
                </div>
                <div class="form_setting_document_pager">
                  <span class="form_setting_document_pager_prev">＜</span><span class="form_setting_document_pager_next">＞</span>
                </div>
              </div>
            </div>
            <div class="form_setting_file_img">
              <img src="/cmn-e-contract/{if $row|@count > 0}{$row[0].filename}{/if}" alt="資料画像" class="documentId" id="{$fileList[$smarty.foreach.loop.index].id}">
              {foreach from=$formList[$smarty.foreach.loop.index] item=form}

                {if $partner.id != $form.e_contract_partner_id && ($form.value != '' || $form.img_data != '')}

                  {if $form.type == 'text'}
                    <div class="form_setting_parts_text_dammy form_setting_parts" data-page="{$form.page}" style="position: absolute; top: {$form.y/2}px; left: {$form.x/2}px; width: {$form.width/2}px; height: {$form.height/2}px;">
                      <input type="text" readonly="readonly" class="parts_inner_text_dammy text_form"  style="width: {$form.width/2}px; height: {$form.height/2}px; font-size: {$form.font_size/2}px" value="{$form.value}">
                    </div>
                  {elseif $form.type == 'textarea'}
                    <div class="form_setting_parts_text_dammy form_setting_parts" data-page="{$form.page}" style="position: absolute; top: {$form.y/2}px; left: {$form.x/2}px; width: {$form.width/2}px; height: {$form.height/2}px;">
                      <div class="parts_inner_textarea_dammy text_form" style="width: {$form.width/2}px; height: {$form.height/2}px; font-size: {$form.font_size/2}px">{$form.value|nl2br}</div>
                    </div>
                  {elseif $form.type == 'sign'}
                    <div class="form_setting_parts_sign_dammy form_setting_parts" data-page="{$form.page}" style="position: absolute; top: {$form.y/2}px; left: {$form.x/2}px;">
                      <div class="parts_inner_sign_dammy" style="width: {$form.width/2}px; height: {$form.height/2}px;"></div>
                      <img class="sign_img" style="position: absolute; top: 6px; left: 7px; width: {$form.width/2}px; height: {$form.height/2}px;" src="data:image/png;base64, {$form.img_data}">
                    </div>
                  {elseif $form.type == 'checkbox'}
                    <div class="form_setting_parts_checkbox_dammy form_setting_parts" data-page="{$form.page}" style="position: absolute; top: {$form.y/2}px; left: {$form.x/2}px;">
                      <div class="parts_inner_checkbox_dammy" style="width: {$form.width/2}px; height: {$form.height/2}px;"></div>
                      <img style="position: absolute; top: 5px; left: 0px; width: {$form.width/2}px; height: {$form.height/2}px;" src="data:image/png;base64, {$form.img_data}">
                    </div>
                  {/if}

                {elseif $partner.id != $form.e_contract_partner_id}

                {else}

                  {if $form.type == 'text'}
                    <div id="{$form.id}" class="form_setting_parts_text_dammy form_setting_parts input" data-page="{$form.page}" data-require="{$form.required}"  style="position: absolute; top: {$form.y/2}px; left: {$form.x/2}px; width: {$form.width/2}px; height: {$form.height/2}px;">
                      <input type="text" class="parts_inner_text_dammy text_form"  style="width: {$form.width/2}px; height: {$form.height/2}px; font-size: {$form.font_size/2}px">
                    </div>
                  {elseif $form.type == 'textarea'}
                    <div id="{$form.id}" class="form_setting_parts_text_dammy form_setting_parts input" data-page="{$form.page}" data-require="{$form.required}" style="position: absolute; top: {$form.y/2}px; left: {$form.x/2}px; width: {$form.width/2}px; height: {$form.height/2}px;">
                      <textarea type="text" class="parts_inner_textarea_dammy text_form" style="width: {$form.width/2}px; height: {$form.height/2}px; font-size: {$form.font_size/2}px"></textarea>
                    </div>
                  {elseif $form.type == 'sign'}
                    <div id="{$form.id}" class="form_setting_parts_sign_dammy form_setting_parts" data-page="{$form.page}" data-require="{$form.required}" style="position: absolute; top: {$form.y/2}px; left: {$form.x/2}px;">
                      <div class="parts_inner_sign_dammy" style="width: {$form.width/2}px; height: {$form.height/2}px;"></div>
                      <img class="partner_select_open" src="/img/partner_select.png">

                      <div class="form_setting_partner_sign">
                        <input type="text" class="text1">
                        <input type="text" class="text2">
                        <input type="text" class="text3">
                        <input type="text" class="text4">
                        <button type="button" class="signning">押印</button>
                      </div>
                    </div>
                  {elseif $form.type == 'checkbox'}
                    <div id="{$form.id}" class="form_setting_parts_checkbox_dammy form_setting_parts" data-page="{$form.page}" data-require="{$form.required}" style="position: absolute; top: {$form.y/2}px; left: {$form.x/2}px;">
                      <div class="parts_inner_checkbox_dammy input" style="width: {$form.width/2}px; height: {$form.height/2}px;"></div>
                    </div>
                  {/if}
                {/if}
              {/foreach}
              <img id="loading{$smarty.foreach.loop.index}" src="/img/e_contract_loading.gif" class="e_contract_loading">
            </div>
          </div>
        </div>
      {/foreach}
      <div class="form-wrapper">
        <p class="sign-text-label">認証コード<span class="note">（8文字以上の半角英数字）</span><span class="required">必須</span></p>
        <p class="sign-text-note">認証コードを設定してください。<br>作成した電子契約を閲覧したいときに使います。</p>
        <input id="authenticationCode" type="text" class="sign-text-field">
      </div>
      <div class="e_contract__content--submit mgn-t20">
        <a href="javascript:void(0)" onClick="approvalEContract();">承認</a>
      </div>
      <!-- 契約書エリア begin -->

      <!-- データエリア begin -->
      <input type="hidden" id="caseId" value="{$partner.e_contract_case_id}">
      <input type="hidden" id="partnerId" value="{$partner.id}">
      <input type="hidden" id="credential" value="{$credential}">

      <a href="" id="download_contract" download></a>
      <!-- データエリア end -->
    </div>
	</div>
</body>
</html>

{literal}
<script>
  // タッチイベントで背景、ボタンの表示非表示 
  $('.form_setting_parts').css('background-color', 'transparent');
  $('.partner_select_open').css('display', 'none');

  $(document).on('touchend', '.text_form, .parts_inner_sign_dammy, .parts_inner_checkbox_dammy, .sign_img', function() {
    $(this).parent().css({'z-index': '100'});
    $(this).parent().find('.partner_select_open').css('display', 'block');
  });
</script>
{/literal}
