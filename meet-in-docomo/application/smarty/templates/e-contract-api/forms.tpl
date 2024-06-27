{include file="./common/header.tpl"}

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

  window.onload = function(){
    $('#document1').css('display','block');
    var changeColorZone = $('#1').parents('.form_template-name');
    $(changeColorZone).addClass('form_template-name-change');
    var IntPageCount = 1;
    //配列に保存されているテキストフォームを1つずつ取り出す
    var formText = document.getElementsByClassName('form_setting_parts_text_dammy ui-draggable ui-draggable-handle');
    for( var i=0 ; i < formText.length; i++){
      var formTextNum = formText[i];
      var formId = formTextNum.id;
      // ドラッグ、リサイズできるようにする
      $('#' + formId).draggable({containment: '#document1 .form_setting_file_img_text'});
      var fontSize = $('#' + formId).find('.parts_inner_form_dammy').css('font-size');
      fontSize = Number(fontSize.replace('px', ''));
      $('#' + formId).find('.parts_inner_form_dammy').resizable({containment: '.form_setting_file_img', minHeight: fontSize + 10, maxHeight: fontSize + 10});
    }
    //配列に保存されているテキストエリアを1つずつ取り出す
    var formTextarea = document.getElementsByClassName('form_setting_parts_textarea_dammy ui-draggable ui-draggable-handle');
    for( var i=0 ; i < formTextarea.length; i++){
      var formTextareaNum = formTextarea[i];
      var formId = formTextareaNum.id;
      // ドラッグ、リサイズできるようにする
      $('#' + formId).draggable({containment: '#document1 .form_setting_file_img_text'});
      var fontSize = $('#' + formId).find('.parts_inner_form_dammy').css('font-size');
      fontSize = Number(fontSize.replace('px', ''));
      $('#' + formId).find('.parts_inner_form_dammy').resizable({containment: '.form_setting_file_img', minHeight: fontSize + 10});
    }
    //配列に保存されているチェックボックスフォームを1つずつ取り出す
    var formCheck = document.getElementsByClassName('form_setting_parts_checkbox_dammy ui-draggable ui-draggable-handle');
    for( var i=0 ; i < formCheck.length; i++){
      var formCheckNum = formCheck[i];
      var formId = formCheckNum.id;
      // ドラッグ、リサイズできるようにする
      $('#' + formId).draggable({containment: '#document1 .form_setting_file_img_sign'});
      $('#' + formId).find('.parts_inner_form_dammy').resizable({aspectRatio: true, containment: '.form_setting_file_img'});
    }
    //配列に保存されているサインフォームを1つずつ取り出す
    var formSign = document.getElementsByClassName('form_setting_parts_sign_dammy ui-draggable ui-draggable-handle');
    for( var i=0 ; i < formSign.length; i++){
      var formSignNum = formSign[i];
      var formId = formSignNum.id;
      // ドラッグ、リサイズできるようにする
      $('#' + formId).draggable({containment: '#document1 .form_setting_file_img_sign'});
      $('#' + formId).find('.parts_inner_form_dammy').resizable({aspectRatio: true, containment: '.form_setting_file_img'});
    }
    $(".form_setting_parts_text_dammy").css('display','none');
    $(".form_setting_parts_textarea_dammy").css('display','none');
    $(".form_setting_parts_checkbox_dammy").css('display','none');
    $(".form_setting_parts_sign_dammy").css('display','none');
    $("[data-page = " + IntPageCount + "]").css('display','');

  }

  // 資料に各フォームをドラッグ&ドロップする処理
  $(function() {
    //ドラッグ対象以外の画像のドラッグを無効にする
    document.addEventListener('dragstart', function(e) {
      const draggable = e.target.getAttribute('draggable');
      // 明示的にdraggabeleにしている要素以外ドラッグ禁止
      if(!draggable || draggable === 'auto') {
        e.preventDefault();
      }
    });

    // ドラッグスタート時に各フォームにあったゴースト画像に変更する
    // テキストフォーム
    var textImg = document.createElement('img');
    textImg.src = '/img/e_contract_text.png';
    document.getElementById('text').addEventListener('dragstart', function(e) {
      e.dataTransfer.setDragImage(textImg, -10, -10);
      e.dataTransfer.setData('text/plain', 'text');
    });
    document.getElementById('textarea').addEventListener('dragstart', function(e) {
      e.dataTransfer.setDragImage(textImg, -10, -10);
      e.dataTransfer.setData('text/plain', 'textarea');
    });
    // 押印
    var signImg = document.createElement('img');
    signImg.src = '/img/e_contract_sign.png';
    document.getElementById('sign').addEventListener('dragstart', function(e) {
      e.dataTransfer.setDragImage(signImg, -10, -10);
      e.dataTransfer.setData('text/plain', 'sign');
    });
    // チェックボックス
    var checkboxImg = document.createElement('img');
    checkboxImg.src = '/img/e_contract_checkbox.png';
    document.getElementById('checkbox').addEventListener('dragstart', function(e) {
      e.dataTransfer.setDragImage(checkboxImg, -10, -10);
      e.dataTransfer.setData('text/plain', 'checkbox');
    });

    // 各書類にイベントを設定する
    var documentElements = document.getElementsByClassName('form_setting_file_img');

    for (var i = 0; documentElements.length; i++) {
      // 書類にドラッグエンターで枠色を変える
      documentElements[i].addEventListener('dragenter', function() {
        $(this).css({
          'border': '1px solid #0081CC'
        });
      });
      documentElements[i].addEventListener('dragleave', function() {
        $(this).css({
          'border': '1px solid #888'
        });
      });

      //dragoverイベントをキャンセルして、ドロップを受け付けるようにする
      documentElements[i].addEventListener('dragover', function() {
        event.preventDefault();
      });

      // ドロップ時にフォームを表示して、フォーム情報を登録する
      documentElements[i].addEventListener('drop', function(e) {
        event.preventDefault();

        var data = e.dataTransfer.getData("text");

        var dropX = e.pageX;
        var dropY = e.pageY;
        // 要素の位置を取得
        var clientRect = this.getBoundingClientRect();
        var positionX = clientRect.left + window.pageXOffset;
        var positionY = clientRect.top + window.pageYOffset;
        // 要素内におけるドロップ位置を計算
        var x = dropX - positionX;
        var y = dropY - positionY;


        // ファイルIdxを取得
        var fileCount = 0;
        // ページを取得
        var pageCount = $(this).parent().find('.form_setting_document_page_count').text();

        // e_contract_file_idを取得
        var file_id = $(this).find('.documentId').attr('id');

        // 枠の色をグレーに戻す
        $(this).css({
          'border': '1px solid #888'
        });

        if(data == 'text') {
          // フォームデータの登録
          $.ajax({
            url: "/e-contract-api/regist-form",
            type: "POST",
            dataType: "json",
            data: {
              "file_id"   : file_id,
              "type"      : "text",
              "x"         : x,
              "y"         : y,
              "width"     : 300,
              "height"    : 14,
              "font_size" : 14,
              "page"      : pageCount,
              "doc_idx"   : fileCount
            },
            // ローディングを表示する
            beforeSend: function(){
              $('#loading' + fileCount).css({'display':'block', 'top':y+'px', 'left':x+'px', 'height':'30px', 'width':'auto', 'border':'none', 'z-index':'100'});
            }
          }).done(function(res) {
            // ファイルIdxを取得
            var fileCount = 1;
            // ページを取得
            var pageCount = $('#document' + fileCount + ' #pageId').text();

            // ローディングを非表示にする
            $('#loading' + (fileCount - 1)).css({'display':'none'});
            // ダミーテキストフォームの表示
            var options = '';
            for(var i = 10; i < 55; i ++) {
              if(i == 14) {
                options += '<option value="' + i + '" selected>' + i + 'px</option>';
              } else  {
                options += '<option value="' + i + '">' + i + 'px</option>';
              }
            }
            $('#document' + fileCount + ' .form_setting_file_img').append('<div id="' + res.form.form_id + '" class="form_setting_parts_text_dammy ui-draggable ui-draggable-handle form_setting_parts" data-page="' + pageCount + '" style="position: absolute; top: ' + y + 'px; left: ' + x + 'px;"><div class="parts_inner_text_dammy parts_inner_form_dammy">テキストが入ります</div><div class="parts_inner_fontsize"><select class="change_fontsize">' + options + '</select></div><div class="parts_inner_remove">×</div></div>');            
            $('#' + res.form.form_id + '.form_setting_parts').css('background-color', 'transparent');
            $('#' + res.form.form_id + ' .parts_inner_fontsize, #' + res.form.form_id + ' .parts_inner_remove').css('display', 'none');

            // ドラッグ、リサイズできるようにする
            $('#' +  res.form.form_id).draggable({containment: '#document1 .form_setting_file_img_text'});
            $('#' + res.form.form_id).find('.parts_inner_form_dammy').resizable({containment: '.form_setting_file_img', minHeight: 24, maxHeight: 24});

          }).fail(function(res) {
          });
        } else if(data == 'textarea') {
          // フォームデータの登録
          $.ajax({
            url: "/e-contract-api/regist-form",
            type: "POST",
            dataType: "json",
            data: {
              "file_id"   : file_id,
              "type"      : "textarea",
              "x"         : x,
              "y"         : y,
              "width"     : 300,
              "height"    : 14,
              "font_size" : 14,
              "page"      : pageCount,
              "doc_idx"   : fileCount
            },
            // ローディングを表示する
            beforeSend: function(){
              $('#loading' + fileCount).css({'display':'block', 'top':y+'px', 'left':x+'px', 'height':'30px', 'width':'auto', 'border':'none', 'z-index':'100'});
            }
          }).done(function(res) {
            // ファイルIdxを取得
            var fileCount = 1;
            // ページを取得
            var pageCount = $('#document' + fileCount + ' #pageId').text();

            // ローディングを非表示にする
            $('#loading' + (fileCount - 1)).css({'display':'none'});
            // ダミーテキストフォームの表示
            var options = '';
            for(var i = 10; i < 55; i ++) {
              if(i == 14) {
                options += '<option value="' + i + '" selected>' + i + 'px</option>';
              } else  {
                options += '<option value="' + i + '">' + i + 'px</option>';
              }
            }
            $('#document' + fileCount + ' .form_setting_file_img').append('<div id="' + res.form.form_id + '" class="form_setting_parts_textarea_dammy ui-draggable ui-draggable-handle form_setting_parts" data-page="' + pageCount + '" style="position: absolute; top: ' + y + 'px; left: ' + x + 'px;"><div class="parts_inner_textarea_dammy parts_inner_form_dammy">複数行のテキストが入ります</div><div class="parts_inner_fontsize"><select class="change_fontsize">' + options + '</select></div><div class="parts_inner_remove">×</div></div>');
            $('#' + res.form.form_id + '.form_setting_parts').css('background-color', 'transparent');
            $('#' + res.form.form_id + ' .parts_inner_fontsize, #' + res.form.form_id + ' .parts_inner_remove').css('display', 'none');

            // ドラッグ、リサイズできるようにする
            $('#' +  res.form.form_id).draggable({containment: '#document1 .form_setting_file_img_text'});
            $('#' + res.form.form_id).find('.parts_inner_form_dammy').resizable({containment: '.form_setting_file_img', minHeight: 24});
          }).fail(function(res) {
          });
        } else if(data == 'sign') {
          // フォームデータの登録
          $.ajax({
            url: "/e-contract-api/regist-form",
            type: "POST",
            dataType: "json",
            data: {
              "file_id" : file_id,
              "type"    : "sign",
              "x"       : x,
              "y"       : y,
              "width"   : 52,
              "height"  : 52,
              "page"    : pageCount,
              "doc_idx" : fileCount
            },
            // ローディングを表示する
            beforeSend: function(){
              $('#loading' + fileCount).css({'display':'block', 'top':y+'px', 'left':x+'px', 'height':'30px', 'width':'auto', 'border':'none', 'z-index':'100'});
            }
          }).done(function(res) {
            // ファイルIdxを取得
            var fileCount = 1;
            // ページを取得
            var pageCount = $('#document' + fileCount + ' #pageId').text();

            // ローディングを非表示にする
            $('#loading' + (fileCount - 1)).css({'display':'none'});
            // ダミー押印フォームの表示
            $('#document' + fileCount + ' .form_setting_file_img').append('<div id="' + res.form.form_id + '" class="form_setting_parts_sign_dammy ui-draggable ui-draggable-handle form_setting_parts" data-page="' + pageCount + '" style="position: absolute; top: ' + y + 'px; left: ' + x + 'px;"><div class="parts_inner_sign_dammy parts_inner_form_dammy"></div><div class="parts_inner_remove">×</div></div>');
            $('#' + res.form.form_id + '.form_setting_parts').css('background-color', 'transparent');
            $('#' + res.form.form_id + ' .parts_inner_remove').css('display', 'none');

            // ドラッグ、リサイズできるようにする
            $('#' +  res.form.form_id).draggable({containment: '#document1 .form_setting_file_img_sign'});
            $('#' + res.form.form_id).find('.parts_inner_form_dammy').resizable({aspectRatio: true, containment: '.form_setting_file_img'});
          }).fail(function(res) {
          });
        } else if(data == 'checkbox') {
          // フォームデータの登録
          $.ajax({
            url: "/e-contract-api/regist-form",
            type: "POST",
            dataType: "json",
            data: {
              "file_id" : file_id,
              "type"    : "checkbox",
              "x"       : x,
              "y"       : y,
              "width"   : 32,
              "height"  : 32,
              "page"    : pageCount,
              "doc_idx" : fileCount
            },
            // ローディングを表示する
            beforeSend: function(){
              $('#loading' + fileCount).css({'display':'block', 'top':y+'px', 'left':x+'px', 'height':'30px', 'width':'auto', 'border':'none', 'z-index':'100'});
            }
          }).done(function(res) {
            // ファイルIdxを取得
            var fileCount = 1;
            // ページを取得
            var pageCount = $('#document' + fileCount + ' #pageId').text();

            // ローディングを非表示にする
            $('#loading' + (fileCount - 1)).css({'display':'none'});
            // ダミーチェックボックスの表示
            $('#document' + fileCount + ' .form_setting_file_img').append('<div id="' + res.form.form_id + '" class="form_setting_parts_checkbox_dammy ui-draggable ui-draggable-handle form_setting_parts" data-page="' + pageCount + '" style="position: absolute; top: ' + y + 'px; left: ' + x + 'px;"><div class="parts_inner_checkbox_dammy parts_inner_form_dammy"><img src="/img/checkbox_gray.svg" class="gray"></div><div class="parts_inner_remove">×</div></div>');
            $('#' + res.form.form_id + '.form_setting_parts').css('background-color', 'transparent');
            $('#' + res.form.form_id + ' .parts_inner_remove').css('display', 'none');

            // ドラッグ、リサイズできるようにする
            $('#' +  res.form.form_id).draggable({containment: '#document1 .form_setting_file_img_sign'});
            $('#' + res.form.form_id).find('.parts_inner_form_dammy').resizable({aspectRatio: true, containment: '.form_setting_file_img'});
          }).fail(function(res) {
          });
        }
      });
    }
  });

  // ダミーフォームをクリックした際にフォームの削除とDBのフォーム情報を削除する
  $(document).on('click', '.parts_inner_remove', function() {
    // フォームIDを取得
    var formId = $(this).parent().attr('id');
    // フォームデータを物理削除
    $.ajax({
      url: "/e-contract-api/delete-form",
      type: "POST",
      dataType: "text",
      data: {
        "form_id" : formId
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
      res = jQuery.parseJSON(res);

      // ローディングを非表示にする
      var fileCount = $('#filePageId').text() - 1;
      $('#loading' + fileCount).css({'display':'none'});

      // フォーム削除
      $('#' + res).remove();
    }).fail(function(res) {
    });
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

    if (IntPageCountMax>IntPageCount){
      $(".form_setting_parts_text_dammy").css('display','none');
      $(".form_setting_parts_textarea_dammy").css('display','none');
      $(".form_setting_parts_checkbox_dammy").css('display','none');
      $(".form_setting_parts_sign_dammy").css('display','none');
      $("[data-page = " + IntPageCount + "]").css('display','');
    }else {
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
    if (IntPageCount>0){
      $(".form_setting_parts_text_dammy").css('display','none');
      $(".form_setting_parts_textarea_dammy").css('display','none');
      $(".form_setting_parts_checkbox_dammy").css('display','none');
      $(".form_setting_parts_sign_dammy").css('display','none');
      $("[data-page = " + IntPageCount + "]").css('display','');
    }else{
      return false;
    }
  })

// 確認ボタン押下処理
  function confirmTemplate() {
    // 押印を取得
    var signs = document.getElementsByClassName('form_setting_parts_sign_dammy');

    // 押印が2つ以上ない場合はエラーメッセージを表示
    if(signs.length < 2) {
      $('.form_setting_error').remove();

      $('html, body').animate({scrollTop:0});
      $('.form_setting_title_area').append('<div class="form_setting_error">押印を2つ以上配置してください</div>');
    } else {
      // 確認ボタンのdisabled化
      $('.only_once_button').attr('disabled', true);

      var query = window.location.search.replace("?id=", "");
      window.location.href = '/e-contract-api/template-confirm?id=' + query;
    }
  }

</script>

{/literal}

<!-- メインコンテンツ[start] -->
<div id="mi_main_contents">
  <!-- トップナビ start -->
  <div id="mi_top_nav" class="acount_manage_on">
    <div class="mi_content_title mi_mgn-left40">
      <span class="icon-folder mi_content_title_icon"></span>
      <h1 class="mi_content_title_text">電子契約書テンプレート新規作成</h1>
    </div>
  </div>
  <!-- トップナビ end -->

  <!-- コンテンツエリア start -->
  <div id="mi_content_area">

    <!-- コンテンツ start -->
    <div class="e_contract_setting_area">

      <!-- ステップエリア begin -->
      <div class="e_contract_step_area">
        <img src="/img/create_template_2.png">
      </div>
      <!-- ステップエリア end -->

      <!-- エラーメッセージ表示エリア begin -->
      {if $errorList|@count gt 0}
        <p class="errmsg mb10">
        下記にエラーがあります。<br />
          <strong>
            {foreach from=$errorList item=error}
              {foreach from=$error item=row}
                {$row}<br>
              {/foreach}
            {/foreach}
          </strong>
        </p>
      {/if}
      <!-- エラーメッセージ表示エリア end -->

      <!-- タイトル表示エリア begin -->
      <div class="form_setting_title_area">
        <h2>2.パーツの配置</h2>
      </div>
      <!-- タイトル表示エリア end -->

      <!-- ファイル表示エリア begin -->
      <div class="form_setting_file_area">
        <!-- <p>アップロードファイル {$fileList|@count}件</p> -->
        <div class="">
          {foreach from=$fileList item=row}
            <div class="form_template-name">
              <span class="template-name_text">
              {$row.name}
              <!-- <button class="close_button">×</button> -->
              <a class="file_target" id="0"></a>
              </span>
            </div>
          {/foreach}
        </div>
      </div>
      <!-- ファイル表示エリア end -->

      <!-- パーツエリア begin -->
      <div class="form_setting_parts_area">
        <div class="form_setting_parts_text_area">
          <p>追加したいパーツを契約書にドラッグ＆ドロップしてください。</p>
          <div class="form_setting_parts_area_main">
            <div class="form_setting_parts_text_area">
              <p>入力フォーム（1行）</p>
              <div class="form_setting_parts_text" id="text" draggable="true">
                <div class="parts_inner_text"></div>
                <div class="dot-logo-text">
                  <img src="/img/sp/svg/dot.svg" draggable="true">
               </div>
              </div>
            </div>
            <div class="form_setting_parts_text_area">
              <p>入力フォーム（複数行）</p>
              <div class="form_setting_parts_text" id="textarea" draggable="true">
                <div class="parts_inner_text"></div>
                <div class="dot-logo-text">
                  <img src="/img/sp/svg/dot.svg" draggable="true">
               </div>
              </div>
            </div>
            <div class="form_setting_parts_sign_area">
              <p>押印</p>
              <div class="form_setting_parts_sign" id="sign" draggable="true">
                <div class ="parts_inner_sign"></div>
                <div class="dot-logo-sign">
                  <img src="/img/sp/svg/dot.svg" draggable="true">
                </div>
              </div>
            </div>
            <div class="form_setting_parts_checkbox_area">
              <p>チェックボックス</p>
              <div class="form_setting_parts_checkbox" id="checkbox" draggable="true">
                <div class ="parts_inner_checkbox"></div>
                <div class="dot-logo-checkbox">
                  <img src="/img/sp/svg/dot.svg" draggable="true">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- パーツエリア end -->

      <!-- 契約書エリア begin -->
      {foreach from=$materialList item=row name=loop}
        <div class="form_setting_document_area">
          <div class="form_setting_document_img" id="0">
            <div class="form_setting_document_operation_area">
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
              <div class="form_setting_file_img_text"></div>
              <div class="form_setting_file_img_sign"></div>
              <img src="/cmn-e-contract/{if $row|@count > 0}{$row[0].material_filename}{/if}" alt="資料画像" class="documentId" id="{$fileList[$smarty.foreach.loop.index].id}">
              {foreach from=$formList[$smarty.foreach.loop.index] item=form}
                {if $form.type == 'text'}
                  <div id="{$form.id}" class="form_setting_parts_text_dammy ui-draggable ui-draggable-handle form_setting_parts" data-page="{$form.page}" style="position: absolute; top: {$form.y}px; left: {$form.x}px;">
                    <div class="parts_inner_text_dammy parts_inner_form_dammy" style="width: {$form.width}px; height: {$form.height}px; font-size: {$form.font_size}px; line-height: {$form.font_size}px;">テキストが入ります</div>
                    <div class="parts_inner_fontsize">
                      <select class="change_fontsize">
                        {section name=i start=10 loop=55}
                          {if $smarty.section.i.index == $form.font_size}
                            <option value="{$smarty.section.i.index}" selected>{$smarty.section.i.index}px</option>
                          {else}
                            <option value="{$smarty.section.i.index}">{$smarty.section.i.index}px</option>
                          {/if}
                        {/section}
                      </select>
                    </div>
                    <div class="parts_inner_remove">×</div>
                  </div>
                {elseif $form.type == 'textarea'}
                  <div id="{$form.id}" class="form_setting_parts_textarea_dammy ui-draggable ui-draggable-handle form_setting_parts" data-page="{$form.page}" style="position: absolute; top: {$form.y}px; left: {$form.x}px;">
                    <div class="parts_inner_textarea_dammy parts_inner_form_dammy" style="width: {$form.width}px; height: {$form.height}px; font-size: {$form.font_size}px; line-height: {$form.font_size}px;">複数行のテキストが入ります</div>
                    <div class="parts_inner_fontsize">
                      <select class="change_fontsize">
                        {section name=i start=10 loop=55}
                          {if $smarty.section.i.index == $form.font_size}
                            <option value="{$smarty.section.i.index}" selected>{$smarty.section.i.index}px</option>
                          {else}
                            <option value="{$smarty.section.i.index}">{$smarty.section.i.index}px</option>
                          {/if}
                        {/section}
                      </select>
                    </div>
                    <div class="parts_inner_remove">×</div>
                  </div>
                {elseif $form.type == 'sign'}
                  <div id="{$form.id}" class="form_setting_parts_sign_dammy ui-draggable ui-draggable-handle form_setting_parts" data-page="{$form.page}" style="position: absolute; top: {$form.y}px; left: {$form.x}px;">
                    <div class="parts_inner_sign_dammy parts_inner_form_dammy" style="width: {$form.width}px; height: {$form.height}px;"></div>
                    <div class="parts_inner_remove">×</div>
                  </div>
                {elseif $form.type == 'checkbox'}
                  <div id="{$form.id}" class="form_setting_parts_checkbox_dammy ui-draggable ui-draggable-handle form_setting_parts" data-page="{$form.page}" style="position: absolute; top: {$form.y}px; left: {$form.x}px;">
                    <div class="parts_inner_checkbox_dammy parts_inner_form_dammy" style="width: {$form.width}px; height: {$form.height}px;"><img src="/img/checkbox_gray.svg" class="gray"></div>
                    <div class="parts_inner_remove">×</div>
                  </div>
                {/if}
              {/foreach}
              <img id="loading{$smarty.foreach.loop.index}" src="/img/e_contract_loading.gif" class="e_contract_loading">
            </div>
          </div>
        </div>
      {/foreach}

      <div class="button-wrapper">
        <div class="return-button-box">
          <p>戻る</p>
          <a href="/e-contract-api/files?id={$document.id}"></a>
        </div>
        <div class="signup-button-box">
          <button id="submit_button" class="only_once_button">確認</button>
        </div>
      </div>

      <!-- 契約書エリア begin -->

    </div>
    <!-- コンテンツ end -->

  </div>
  <!-- コンテンツエリア end -->

</div>
<!-- メインコンテンツ[end] -->



{include file="./common/footer.tpl"}

{literal}
<script>

  // フォームホバーで背景、ボタンの表示非表示 
  $('.form_setting_parts').css('background-color', 'transparent');
  $('.parts_inner_fontsize, .parts_inner_remove').css('display', 'none');

  $(document).on('mouseover', '.form_setting_parts', function() {
    $(this).css('background-color', '#E5F4FF');
    $(this).find('.parts_inner_fontsize, .parts_inner_remove').css('display', 'block');
  });

  $(document).on('mouseout', '.form_setting_parts', function() {
    $(this).css('background-color', 'transparent');
    $(this).find('.parts_inner_fontsize, .parts_inner_remove').css('display', 'none');
  });

  // フォームの拡大縮小
  var formId = 0;
  $(document).on('mousedown', '.form_setting_parts', function() {
    formId = $(this).attr('id');
  });

  $(document).on('mouseup', '.form_setting_file_img', function() {
    var form = $('#' + formId).find('.parts_inner_form_dammy');
    var width = form.outerWidth();
    var height = form.outerHeight();
    var off = $('#' + formId).position();
    var top = off.top;
    var left = off.left;

    $('#' + formId).attr('style', 'position: absolute; top: ' + top + 'px; left: ' + left + 'px;');

    // 確認ボタンの無効化
    $('.only_once_button').attr('disabled', true);
    
    $.ajax({
      url: "/e-contract-api/update-form",
      type: "POST",
      dataType: "text",
      data: {
        "id" : formId,
        "width"  : width,
        "height"  : height,
        "top" : top,
        "left" : left,
        "type" : "move"
      },
    }).done(function(res) {
      // 確認ボタンの有効化
      $('.only_once_button').attr('disabled', false);
    }).fail(function(res) {
    });
    formId = 0;
  });

  $(document).on('mouseup', '.documentId', function() {
    var form = $('#' + formId).find('.parts_inner_form_dammy');
    var width = form.outerWidth();
    var height = form.outereight();
    var off = $('#' + formId).position();
    var top = off.top;
    var left = off.left;

    // 確認ボタンの無効化
    $('.only_once_button').attr('disabled', true);

    $.ajax({
      url: "/e-contract-api/update-form",
      type: "POST",
      dataType: "text",
      data: {
        "id" : formId,
        "width"  : width,
        "height" : height,
        "top" : top,
        "left" : left,
        "type" : "move"
      },
    }).done(function(res) {
      // 確認ボタンの有効化
      $('.only_once_button').attr('disabled', false);
    }).fail(function(res) {
    });
    formId = 0;
  });

  // テキストフォーム、テキストエリアのフォントサイズ変更
  $(document).on('change', '.change_fontsize', function() {
    var fontSize = Number($(this).val());
    formId = $(this).parents('.form_setting_parts').attr('id');
    var form = $(this).parent().prev();
    var width = Number(form.outerWidth());
    var height = Number(form.outerHeight());

    var formHeight = fontSize + 10;

    var className = form.attr('class');
    if(className.indexOf('parts_inner_text_dammy') != -1) {
      // テキストフォームの場合
      form.attr('style', 'width: ' + width + 'px; height: ' + formHeight + 'px; font-size: ' + fontSize + 'px; line-height: ' + fontSize + 'px;');
      $('#' + formId).find('.parts_inner_form_dammy').resizable({containment: '.form_setting_file_img', minHeight: formHeight, maxHeight: formHeight});
    } else {
      // テキストエリアの場合
      if(height < formHeight) {
        form.attr('style', 'width: ' + width + 'px; height: ' + formHeight + 'px; font-size: ' + fontSize + 'px; line-height: ' + fontSize + 'px;');
      } else {
        form.attr('style', 'width: ' + width + 'px; height: ' + height + 'px; font-size: ' + fontSize + 'px; line-height: ' + fontSize + 'px;');
      }
      $('#' + formId).find('.parts_inner_form_dammy').resizable({containment: '.form_setting_file_img', minHeight: formHeight});
    }

    // 確認ボタンの無効化
    $('.only_once_button').attr('disabled', true);

    $.ajax({
      url: "/e-contract-api/update-form",
      type: "POST",
      dataType: "text",
      data: {
        "id" : formId,
        "font_size" : fontSize,
        "type" : "select"
      },
    }).done(function(res) {
      // 確認ボタンの有効化
      $('.only_once_button').attr('disabled', false);
    }).fail(function(res) {
    });
    formId = 0;
  });

  // 確認ボタン押下時
  $('#submit_button').on('click', function() {
    confirmTemplate();
  });

</script>
{/literal}
