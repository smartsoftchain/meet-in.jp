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


    //ファイルを差し替え.
    var fileInput = $('.materialfileButton');
    var clickContractMaterialBasicId = 0;
    fileInput.on('change', function() {
      clickContractMaterialBasicId = $(this).parents(".form_setting_document_area").data("e_contract_material_basic_id");
      var files = this.files;
      var fileCheck = false;
      Array.prototype.forEach.call(
        files, function(file) {
          if(fileCheck == true) {
            return;
          }
          // ファイルサイズチェック
          if(file.size == 0) {
            alert('ファイルサイズは0バイトです');
            fileInput.val('');
            fileCheck = true;
            return;
          }

          if(10000000 < file.size) {
            alert('添付ファイルは最大容量は10Mです');
            fileInput.val('');
            fileCheck = true;
            return;
          }

          // ファイル拡張子チェック
          if(!file.name.toLowerCase().match(/.+\.pdf$/)) {
            alert('アップロード可能ファイルはPDF形式ファイルのみです');
            fileInput.val('');
            fileCheck = true;
            return;
          }
        }
      );
      if(!fileCheck){
        $("#modal-content").addClass('active');
      }

    });
    $(document).on('click','.modal-content .ask_form_parts_modal_close', function() {
      $("#modal-content").removeClass('active');
      $(fileInput).val('');
    });
    $(document).on('click','.modal-content .yes_btn', function() {
      sendChangeMaterialFile(clickContractMaterialBasicId, 1);
    });
    $(document).on('click','.modal-content .no_btn', function() {
      sendChangeMaterialFile(clickContractMaterialBasicId, -1);
    });

    function sendChangeMaterialFile(material_basic_id, leaveParts) {

      let client_id = $("#clientId").val();
      let case_id = $("#caseId").val();
      let fd = new FormData(document.querySelector('.change_material_file[data-e_contract_material_basic_id="'+material_basic_id+'"]'));
      fd.append("change_material_file", 1);
      fd.append("client_id", client_id);
      fd.append("leave_parts", leaveParts);
      fd.append("material_basic_id", material_basic_id);

      let request = new XMLHttpRequest();
      request.open("POST", location.href);
      request.onload = function () {
        if (request.readyState === request.DONE) {
          if (request.status === 200) {
            //console.log(request.responseText);
            location.reload();
          }
        }
      };
      request.send(fd);
    }

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
      var inputId = formTextNum.id;
      let parentDocumentId = "#" + formTextNum.closest(".form_setting_document_img").id;

      // ドラッグ、リサイズできるようにする
      $('#' + inputId).draggable({containment: parentDocumentId+' .form_setting_file_img_text', stop: function(event, ui){draggableStop(event, ui)}});
      var fontSize = $('#' + inputId).find('.parts_inner_form_dammy').css('font-size');
      fontSize = Number(fontSize.replace('px', ''));

      $('#' + inputId).find('.parts_inner_form_dammy').resizable({containment: parentDocumentId+' .form_setting_file_img', minHeight: fontSize + 10, maxHeight: fontSize + 10, stop: function(event, ui){resizableStop(event, ui)}});

      $('#' + inputId).find('.ui-icon-gripsmall-diagonal-se').css({'z-index':'100'}); // 「入力者をオーナにした場合 inputエリアが上に被さって見えなくなる」のを防ぐ.
    }

    // 配列に保存されているテキストエリアを1つずつ取り出す
    var formTextarea = document.getElementsByClassName('form_setting_parts_textarea_dammy ui-draggable ui-draggable-handle');
    for( var i=0 ; i < formTextarea.length; i++){
      var formTextareaNum = formTextarea[i];
      var inputId = formTextareaNum.id;
      let parentDocumentId =  "#" + formTextareaNum.closest(".form_setting_document_img").id;

      // ドラッグ、リサイズできるようにする
      $('#' + inputId).draggable({containment: parentDocumentId+' .form_setting_file_img_text', stop: function(event, ui){draggableStop(event, ui)}});
      var fontSize = $('#' + inputId).find('.parts_inner_form_dammy').css('font-size');
      fontSize = Number(fontSize.replace('px', ''));
      $('#' + inputId).find('.parts_inner_form_dammy').resizable({containment: parentDocumentId+' .form_setting_file_img', minHeight: fontSize + 10, stop: function(event, ui) {resizableStop(event, ui)}});

      $('#' + inputId).find('.ui-icon-gripsmall-diagonal-se').css({'z-index':'100'}); // 「入力者をオーナにした場合 textareaエリアが上に被さって見えなくなる」のを防ぐ.
    }
    // 配列に保存されているチェックボックスフォームを1つずつ取り出す
    var formCheck = document.getElementsByClassName('form_setting_parts_checkbox_dammy ui-draggable ui-draggable-handle');
    for(var i=0 ; i < formCheck.length; i++) {
      var formCheckNum = formCheck[i];
      var inputId = formCheckNum.id;
      let parentDocumentId =  "#" + formCheckNum.closest(".form_setting_document_img").id;

      // ドラッグ、リサイズできるようにする
      $('#' + inputId).draggable({containment: parentDocumentId+' .form_setting_file_img_sign', stop: function(event, ui){draggableStop(event, ui)}});
      $('#' + inputId).find('.parts_inner_form_dammy').resizable({aspectRatio: true, containment: parentDocumentId+' .form_setting_file_img', stop: function(event, ui) {resizableStop(event, ui)}});
    }
    // 配列に保存されているサインフォームを1つずつ取り出す
    var formSign = document.getElementsByClassName('form_setting_parts_sign_dammy ui-draggable ui-draggable-handle');
    for(var i=0 ; i < formSign.length; i++){
      var formSignNum = formSign[i];
      var inputId = formSignNum.id;
      let parentDocumentId =  "#" + formSignNum.closest(".form_setting_document_img").id;

      // ドラッグ、リサイズできるようにする
      $('#' + inputId).draggable({containment: parentDocumentId+' .form_setting_file_img_sign', stop: function(event, ui){draggableStop(event, ui)}});
      $('#' + inputId).find('.parts_inner_form_dammy').resizable({aspectRatio: true, containment: parentDocumentId+' .form_setting_file_img', stop: function( event, ui ) {resizableStop(event, ui)}});
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

    for (var i = 0; i < documentElements.length; i++) {

      // 書類にドラッグエンターで枠色を変える
      documentElements[i].addEventListener('dragenter', function() {
        $(this).css({
          'border': '1px solid #FFAA00'
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

        var caseId = $('#caseId').val();
        var filePage = $('#filePageId').text();

        let e_contract_material_basic_id = $(this).parents('.form_setting_document_area').data('e_contract_material_basic_id');

        var inputId = $(this).parent().attr('id');

        // 枠の色をグレーに戻す
        $(this).css({
          'border': '1px solid #888'
        });
        if(data == 'text') {
          // フォームデータの登録
          $.ajax({
            url: "/e-contract-api/regist-input",
            type: "POST",
            dataType: "json",
            data: {
              "case_id"    : caseId,
              "e_contract_material_basic_id": e_contract_material_basic_id,
              "form_id"    : 0,
              "type"       : "text",
              "x"          : x,
              "y"          : y,
              "width"      : 300,
              "height"     : 14,
              "font_size"  : 14,
              "page"       : pageCount,
              "doc_idx"    : fileCount
            },
            // ローディングを表示する
            beforeSend: function(){
              $('#loading' + fileCount).css({'display':'block', 'top':y+'px', 'left':x+'px', 'height':'30px', 'width':'auto', 'border':'none', 'z-index':'100'});
            }
          }).done(function(res) {

            // ファイルIdxを取得
            var fileCount = 1;
            // ページを取得
            var pageCount = $('#' + inputId + ' #pageId').text();

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

            let partner_select = '<img class="partner_select_open" src="/img/partner_select.png" style="display: none;">';
            partner_select += '<div class="form_setting_partner_select">';
            partner_select +=   makePartnerSelectBox(-1);
            partner_select += '</div>';

            $('#' + inputId + ' .form_setting_file_img').append('<div id="' + res.input.input_id + '" class="form_setting_parts_text_dammy ui-draggable ui-draggable-handle form_setting_parts" data-page="' + pageCount + '" style="position: absolute; top: ' + y + 'px; left: ' + x + 'px;"><div class="parts_inner_text_dammy parts_inner_form_dammy">テキストが入ります</div><div class="parts_inner_fontsize"><select class="change_fontsize">' + options + '</select></div>'+partner_select+'<div class="parts_inner_remove">×</div></div>');
            $('#' + res.input.input_id + '.form_setting_parts').css('background-color', 'transparent');
            $('#' + res.input.input_id + ' .parts_inner_fontsize, #' + res.input.input_id + ' .parts_inner_remove').css('display', 'none');

            // ドラッグ、リサイズできるようにする
            $('#' +  res.input.input_id).draggable({containment: '#' + inputId + ' .form_setting_file_img_text', stop: function(event, ui){draggableStop(event, ui)}});
            $('#' + res.input.input_id).find('.parts_inner_form_dammy').resizable({containment: '#' + inputId + ' .form_setting_file_img', minHeight: 24, maxHeight: 24, stop: function(event, ui){resizableStop(event, ui)}});

          }).fail(function(res) {
          });
        } else if(data == 'textarea') {
          // フォームデータの登録
          $.ajax({
            url: "/e-contract-api/regist-input",
            type: "POST",
            dataType: "json",
            data: {
              "case_id"   : caseId,
              "e_contract_material_basic_id": e_contract_material_basic_id,
              "form_id"   : 0,
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
            var pageCount = $('#' + inputId + ' #pageId').text();

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

            let partner_select = '<img class="partner_select_open" src="/img/partner_select.png" style="display: none;">';
            partner_select += '<div class="form_setting_partner_select">';
            partner_select +=   makePartnerSelectBox(-1);
            partner_select += '</div>';


            $('#' + inputId + ' .form_setting_file_img').append('<div id="' + res.input.input_id + '" class="form_setting_parts_textarea_dammy ui-draggable ui-draggable-handle form_setting_parts" data-page="' + pageCount + '" style="position: absolute; top: ' + y + 'px; left: ' + x + 'px;"><div class="parts_inner_textarea_dammy parts_inner_form_dammy">複数行のテキストが入ります</div><div class="parts_inner_fontsize"><select class="change_fontsize">' + options + '</select></div>'+partner_select+'<div class="parts_inner_remove">×</div></div>');
            $('#' + res.input.input_id + '.form_setting_parts').css('background-color', 'transparent');
            $('#' + res.input.input_id + ' .parts_inner_fontsize, #' + res.input.input_id + ' .parts_inner_remove').css('display', 'none');

            // ドラッグ、リサイズできるようにする
            $('#' +  res.input.input_id).draggable({containment: '#' + inputId + ' .form_setting_file_img_text', stop: function(event, ui){draggableStop(event, ui)}});
            $('#' + res.input.input_id).find('.parts_inner_form_dammy').resizable({containment: '#' + inputId + ' .form_setting_file_img', minHeight: 24, stop: function(event, ui){resizableStop(event, ui)}});
          }).fail(function(res) {
          });
        } else if(data == 'sign') {

          // フォームデータの登録
          $.ajax({
            url: "/e-contract-api/regist-input",
            type: "POST",
            dataType: "json",
            data: {
              "case_id" : caseId,
              "e_contract_material_basic_id": e_contract_material_basic_id,
              "form_id"   : 0,
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
            var pageCount = $('#' + inputId + ' #pageId').text();

            let partner_select = '<img class="partner_select_open" src="/img/partner_select.png" style="display: none;">';
            partner_select += '<div class="form_setting_partner_select">';
            partner_select +=   makePartnerSelectBox(-1);
            partner_select += '</div>';

            // ローディングを非表示にする
            $('#loading' + (fileCount - 1)).css({'display':'none'});
            // ダミー押印フォームの表示
            $('#' + inputId + ' .form_setting_file_img').append('<div id="' + res.input.input_id + '" class="form_setting_parts_sign_dammy ui-draggable ui-draggable-handle form_setting_parts" data-page="' + pageCount + '" style="position: absolute; top: ' + y + 'px; left: ' + x + 'px;"><div class="parts_inner_sign_dammy parts_inner_form_dammy"></div>'+partner_select+'<div class="parts_inner_remove">×</div></div>');
            $('#' + res.input.input_id + '.form_setting_parts').css('background-color', 'transparent');
            $('#' + res.input.input_id + ' .parts_inner_remove').css('display', 'none');

            // ドラッグ、リサイズできるようにする
            $('#' +  res.input.input_id).draggable({containment: '#' + inputId + ' .form_setting_file_img_sign', stop: function(event, ui){draggableStop(event, ui)}});
            $('#' + res.input.input_id).find('.parts_inner_form_dammy').resizable({aspectRatio: true, containment: '#' + inputId + ' .form_setting_file_img', stop: function(event, ui){resizableStop(event, ui)}});
          }).fail(function(res) {
          });
        } else if(data == 'checkbox') {
          // フォームデータの登録
          $.ajax({
            url: "/e-contract-api/regist-input",
            type: "POST",
            dataType: "json",
            data: {
              "case_id" : caseId,
              "e_contract_material_basic_id": e_contract_material_basic_id,
              "form_id" : 0,
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
            var pageCount = $('#' + inputId + ' #pageId').text();

            let partner_select = '<img class="partner_select_open" src="/img/partner_select.png" style="display: none;">';
            partner_select += '<div class="form_setting_partner_select checkbox">';
            partner_select +=  makePartnerSelectBox(-1);
            partner_select +=  '<input id="checkbox'+res.input.input_id+'" name="checkbox'+res.input.input_id+'" type="checkbox" onchange="setRequired(this)">';
            partner_select +=  '<label for="checkbox'+res.input.input_id+'">入力を必須にする</label>';
            partner_select += '</div>';


            // ローディングを非表示にする
            $('#loading' + (fileCount - 1)).css({'display':'none'});
            // ダミーチェックボックスの表示
            $('#' + inputId + ' .form_setting_file_img').append('<div id="' + res.input.input_id + '" class="form_setting_parts_checkbox_dammy ui-draggable ui-draggable-handle form_setting_parts" data-page="' + pageCount + '" style="position: absolute; top: ' + y + 'px; left: ' + x + 'px;"><div class="parts_inner_checkbox_dammy parts_inner_form_dammy"><img src="/img/checkbox_gray.svg" class="gray"></div>'+partner_select+'<div class="parts_inner_remove">×</div></div>');
            $('#' + res.input.input_id + '.form_setting_parts').css('background-color', 'transparent');
            $('#' + res.input.input_id + ' .parts_inner_remove').css('display', 'none');

            // ドラッグ、リサイズできるようにする
            $('#' +  res.input.input_id).draggable({containment: '#' + inputId + ' .form_setting_file_img_sign', stop: function(event, ui){draggableStop(event, ui)}});
            $('#' + res.input.input_id).find('.parts_inner_form_dammy').resizable({aspectRatio: true, containment: '#' + inputId + ' .form_setting_file_img', stop: function(event, ui){resizableStop(event, ui)}});
          }).fail(function(res) {
          });
        }
      });
    }
  });

  // ダミーフォームをクリックした際にフォームの削除とDBのフォーム情報を削除する
  $(document).on('click', '.parts_inner_remove', function() {
    // フォームIDを取得
    var inputId = $(this).parent().attr('id');

    // フォームデータを物理削除
    $.ajax({
      url: "/e-contract-api/delete-input",
      type: "POST",
      dataType: "text",
      data: {
        "id" : inputId
      },
      // ローディングを表示する
      beforeSend: function(){
        var fileCount = $('#filePageId').text() - 1;
        var position = $('#' + inputId).position();
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
      $('#' + inputId).remove();
    }).fail(function(res) {
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


  // 必須チェックの切り替え.
  function setRequired(element) {

    var inputId = $(element).parents('.form_setting_parts').attr('id');
    var required = $(element).prop("checked");
    // フォーム情報が登録されていれば更新、登録されていなければ登録する
    $.ajax({
      url: "/e-contract-api/regist-input",
      type: "POST",
      dataType: "json",
      data: {
        "id"         : inputId,
        "type"       : "required",
        "required"   : required,
      },
    }).done(function(resut) {
      return false;
    }).fail(function() {
      return false;
    });
  }

  // パートナー選択フォーム変更時に登録する
  $(document).on('change', '.partner_select', function() {

    var inputId = $(this).parents('.form_setting_parts').attr('id');
    var partnerId = $(this).val();
    var className = $('#' + inputId).attr('class');
    var caseId = $('#caseId').val();
    var filePage = $('#filePageId').text();

    var fontSize = $('#' + inputId).find('.parts_inner_form_dammy').css('font-size');
    fontSize = Number(fontSize.replace('px', ''));
    var width = $('#' + inputId).find('.parts_inner_form_dammy').css('width');
    width = Number(width.replace('px', ''));
    var height = $('#' + inputId).find('.parts_inner_form_dammy').css('height');
    height = Number(height.replace('px', ''));
    var position = $('#' + inputId).position();
    var x = position.left;
    var y = position.top;

    var inputType = null;
    if(0 < className.indexOf('sign')) {
      inputType = 'sign';
    } else if(0 < className.indexOf('textarea')) {
      inputType = 'textarea';
    } else if(0 < className.indexOf('text')) {
      inputType = 'text';
    } else if(0 < className.indexOf('checkbox')) {
      inputType = 'checkbox';
    }

    if( inputType == 'textarea' || inputType == 'text') {
      $('#' + inputId).find('.ui-icon-gripsmall-diagonal-se').css({'z-index':'100'}); // 「入力者をオーナにした場合 inputエリアが上に被さって見えなくなる」のを防ぐ.
    }

    // 入力者がselfの場合
    if(partnerId == 0){
      // 印影設定の場合
      $('#' + inputId).css({'background-color':'#FFF4E0'});
      if(inputType == 'sign') {
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
            url: "/e-contract-api/regist-input",
            type: "POST",
            dataType: "json",
            data: {
              "id"         : inputId,
              "type"       : inputType,
              "partner_id" : partnerId,
              "target"     : 'self',
              "img_data"   : res,
              "img_type"   : 'image/png',
              "img_size"   : imgSize,
              "width"      : width,
              "height"     : height,
              "x"          : x,
              "y"          : y
            },
            // ローディングを表示する
            beforeSend: function(){
              var fileCount = $('#filePageId').text() - 1;
              var position = $('#' + inputId).position();
              var x = position.left;
              var y = position.top;
              $('#loading' + fileCount).css({'display':'block', 'top':y+'px', 'left':x+'px', 'height':'30px', 'width':'auto', 'border':'none', 'z-index':'100'});
            }
          }).done(function(inputRes) {
            // ローディングを非表示にする
            var fileCount = $('#filePageId').text() - 1;
            $('#loading' + fileCount).css({'display':'none'});
            // 設定済み背景に変更する
            $('#' + inputId + ' .done').remove();
            // 印影画像を表示
            $('#' + inputId).append('<img class="sign_img" style="position: absolute; top: 11px; left: -1px; width: ' + inputRes.input.img_width + 'px; height: ' + inputRes.input.img_height + 'px;" src="data:image/png;base64, ' + res + '">');
            $('#' + inputId).prepend('<p class="done self_sign">設定済み</p>');
            $('#' + inputId).css({'background-color':'transparent'});
            return false;
          }).fail(function() {
          });
        }).fail(function(res) {
        });
      // テキスト設定の場合
      } else if(inputType == 'text') {
        // フォーム情報が登録されていれば更新、登録されていなければ登録する
        $.ajax({
          url: "/e-contract-api/regist-input",
          type: "POST",
          dataType: "json",
          data: {
            "id"         : inputId,
            "type"       : inputType,
            "partner_id" : partnerId,
            "required"   : 'true',
            "target"     : 'self',
            "font_size"  : fontSize,
            "width"      : width,
            "height"     : height,
            "x"          : x,
            "y"          : y
          },
          // ローディングを表示する
          beforeSend: function(){
            var fileCount = $('#filePageId').text() - 1;
            var position = $('#' + inputId).position();
            var x = position.left;
            var y = position.top;
            $('#loading' + fileCount).css({'display':'block', 'top':y+'px', 'left':x+'px', 'height':'30px', 'width':'auto', 'border':'none', 'z-index':'100'});
          }
        }).done(function(res) {
          // input_idを変更
          $('#'+inputId).data('input', res.input.input_id);
          // ローディングを非表示にする
          var fileCount = $('#filePageId').text() - 1;
          $('#loading' + fileCount).css({'display':'none'});
          // 設定済み背景に戻す
          $('#' + inputId + ' .done').remove();
          $('#' + inputId).prepend('<input type="text" class="parts_inner_text_dammy text_form" style="width: ' + res.input.width + 'px; height: ' + res.input.height + 'px; font-size: ' + res.input.font_size + 'px;">');
          $('#' + inputId + ' .parts_inner_text_dammy').focus();
          return false;
        }).fail(function() {
        });
      // テキストエリア設定の場合
      } else if(inputType == 'textarea') {
        // フォーム情報が登録されていれば更新、登録されていなければ登録する
        $.ajax({
          url: "/e-contract-api/regist-input",
          type: "POST",
          dataType: "json",
          data: {
            "id"         : inputId,
            "type"       : inputType,
            "partner_id" : partnerId,
            "required"   : 'true',
            "target"     : 'self',
            "font_size"  : fontSize,
            "width"      : width,
            "height"     : height,
            "x"          : x,
            "y"          : y
          },
          // ローディングを表示する
          beforeSend: function(){
            var fileCount = $('#filePageId').text() - 1;
            var position = $('#' + inputId).position();
            var x = position.left;
            var y = position.top;
            $('#loading' + fileCount).css({'display':'block', 'top':y+'px', 'left':x+'px', 'height':'30px', 'width':'auto', 'border':'none', 'z-index':'100'});
          }
        }).done(function(res) {
          // input_idを変更
          $('#'+inputId).data('input', res.input.input_id);
          // ローディングを非表示にする
          var fileCount = $('#filePageId').text() - 1;
          $('#loading' + fileCount).css({'display':'none'});
          // 設定済み背景に戻す
          $('#' + inputId + ' .done').remove();
          $('#' + inputId).prepend('<textarea class="parts_inner_textarea_dammy text_form" style="width: ' + res.input.width + 'px; height: ' + res.input.height + 'px; font-size: ' + res.input.font_size + 'px;"></textarea>');
          $('#' + inputId + ' .parts_inner_text_dammy').focus();
          return false;
        }).fail(function() {
        });
      // チェックボックス設定の場合
      } else if(inputType == 'checkbox') {

        // チェックボックスデータ
        var imgData = 'iVBORw0KGgoAAAANSUhEUgAAACMAAAAjCAYAAAAe2bNZAAAAAXNSR0IArs4c6QAAAiRJREFUWAntmDtLA0EQx2fPnCQa0FgoBnyg2GrAR2OjILa+wFb9CBbmQ2jjN1BbBUmtCNfY+Iy2gkaF+AI90RhjfN0/yyYRsmcel0tzU1yW2dmZ3/5n0wwjw662gn6qaVj4+kxM/Xy+t8BnhymqJ6pUVa/T2+NS6+hilKVAPD7N6+/r8jZ1k1rbaAdHqkYydk8vt+H32M3RNcWfhlxQxNvc2+XrGLENQhTCxRs6R92MsZaX6GFQ+f76mIYilTRvU4/b4JhUvpNxv52tyXVp1MdbVXJtVsrnwMiUd5RxlEkpoIeJQj6i3QmZIGl/ed8MQLRhoqROpB+ni8oW5YPJBlHriAZDMoa0vzwwkdWMIgAZ0ojqA+misoVLtlG0HyD7c/x4XQ/RsEak1ueVzlplSgABrTnMg3GryFpet6ISQVDEvE2748Y/4ZkIUP0rcigLQJDcXJn2WQ6QXYx7Mt+z5aLfSCYJX5nDBIxCbTM8MhfQ3ixReJ7v+8cKeqz80N+veZsQO7DKT1wabwdAMLQMIPDBACziuKeo7/8wSCsKCaB7jegtgh3LQJDKvE2IEAYg0bIygKBM/jCIzgayqDVIKyy/Nolo/AJItC3bb8G6MGUsKGiWwoGRqeMoI1UGYwlMAyppqM9c7msF85HXu9NKslDs7iRhcGwqGNS8Rg/O9Isdslsh1NPPtxPGOOSKxZ8WGSTBwOjH4wtiLGH35Iop6gZAMLn6BTGLwMGnHwLyAAAAAElFTkSuQmCC';

        // フォーム情報が登録されていれば更新、登録されていなければ登録する
        $.ajax({
          url: "/e-contract-api/regist-input",
          type: "POST",
          dataType: "json",
          data: {
            "id"         : inputId,
            "type"       : inputType,
            "partner_id" : partnerId,
            "required"   : 'true',
            "target"     : 'self',
            "img_data"   : imgData,
            "img_type"   : 'image/png',
            "width"      : width,
            "height"     : height,
            "x"          : x,
            "y"          : y
          },
          // ローディングを表示する
          beforeSend: function(){
            var fileCount = $('#filePageId').text() - 1;
            var position = $('#' + inputId).position();
            var x = position.left;
            var y = position.top;
            $('#loading' + fileCount).css({'display':'block', 'top':y+'px', 'left':x+'px', 'height':'30px', 'width':'auto', 'border':'none', 'z-index':'100'});
          }
        }).done(function(inputRes) {
          // ローディングを非表示にする
          var fileCount = $('#filePageId').text() - 1;
          $('#loading' + fileCount).css({'display':'none'});
          // 設定済み背景に変更する
          $('#' + inputId + ' .done').remove();
          // チェックボックス画像を表示
          $('#' + inputId).append('<img class="checkbox_img" style="position: absolute; top: 11px; left: -1px; width: ' + inputRes.input.img_width + 'px; height: ' + inputRes.input.img_height + 'px;" src="data:image/png;base64, ' + imgData + '">');
          $('#' + inputId).prepend('<p class="done">設定済み</p>');
          $('#' + inputId).css({'background-color':'transparent'});
          return false;
        }).fail(function() {
        });
      }
    // 入力者がpartnerの場合
    } else {
      var required = $('[name=checkbox'+inputId+']').prop("checked");
      if(required == undefined) {
        required = false;
      }

      // 前回の入力演出をクリア.
      $('#' + inputId+" .checkbox_img").remove();

      // フォーム入力者が登録されていれば更新、登録されていなければ登録する
      $.ajax({
        url: "/e-contract-api/regist-input",
        type: "POST",
        dataType: "json",
        data: {
          "id"         : inputId,
          "type"       : inputType,
          "target"     : "partner",
          "partner_id" : partnerId,
          "require"    : required,
          "img_data"   : "",
          "font_size"  : fontSize,
          "width"      : width,
          "height"     : height,
          "x"          : x,
          "y"          : y
        },
        // ローディングを表示する
        beforeSend: function(){
          var fileCount = $('#filePageId').text() - 1;
          var position = $('#' + inputId).position();
          var x = position.left;
          var y = position.top;
          $('#loading' + fileCount).css({'display':'block', 'top':y+'px', 'left':x+'px', 'height':'30px', 'width':'auto', 'border':'none', 'z-index':'100'});
        }
      }).done(function(res) {
        // ローディングを非表示にする
        var fileCount = $('#filePageId').text() - 1;
        $('#loading' + fileCount).css({'display':'none'});
        // 設定済み背景に変更する
        $('#' + inputId + ' .done').remove();

        if(className.indexOf('form_setting_parts_sign_dammy') != -1) {
          // 印影設定の場合
          $('#' + inputId + ' img.sign_img').remove();
          $('#' + inputId).prepend('<p class="done partner_sign">設定済み</p>');
        } else if(className.indexOf('form_setting_parts_text_dammy') != -1) {
          // テキストフォーム設定の場合
          // input_idを変更
          $('#'+inputId).data('input', res.input.input_id);
          $('#' + inputId + ' input').remove();
          $('#' + inputId).prepend('<p class="done">設定済み</p>');
        } else if(className.indexOf('form_setting_parts_textarea_dammy') != -1) {
          // テキストエリア設定の場合
          // input_idを変更
          $('#'+inputId).data('input', res.input.input_id);
          $('#' + inputId + ' textarea').remove();
          $('#' + inputId).prepend('<p class="done">設定済み</p>');
        } else if(className.indexOf('form_setting_parts_checkbox_dammy') != -1) {
          // チェックボックス設定の場合
          $('#' + inputId + ' img.checkbox_img').remove();
          $('#' + inputId).prepend('<p class="done">設定済み</p>');
        }
        $('#' + inputId).css({'background-color':'transparent'});
      }).fail(function(res) {
      });
    }
  });

  // テキストフォーム、テキストエリアのフォントサイズ変更
  $(document).on('change', '.change_fontsize', function() {
    var inputId = $(this).parents('.form_setting_parts').attr('id');
    var fontSize = Number($(this).val());
    var form = $(this).parent().prev();
    var width = Number(form.outerWidth());
    var height = Number(form.outerHeight());

    var formHeight = fontSize + 10;

    var className = form.attr('class');
    if(className.indexOf('parts_inner_text_dammy') != -1) {
      // テキストフォームの場合
      //form.attr('style', 'width: ' + width + 'px; height: ' + formHeight + 'px; font-size: ' + fontSize + 'px; line-height: ' + fontSize + 'px;');
      //form.attr('style', 'width: ' + width + 'px; height: ' + formHeight + 'px; font-size: ' + fontSize + 'px; line-height: 1.1;');
      $('#' + inputId).find('.parts_inner_text_dammy').attr('style', 'width: ' + width + 'px; height: ' + formHeight + 'px; font-size: ' + fontSize + 'px; line-height: 1.1;');
      $('#' + inputId).find('.parts_inner_form_dammy').resizable({containment: '.form_setting_file_img', minHeight: formHeight, maxHeight: formHeight});

      // parts_inner_text_dammy text_form
      // parts_inner_text_dammy parts_inner_form_dammy ui-resizable

    } else {
      // テキストエリアの場合
      if(height < formHeight) {
        //form.attr('style', 'width: ' + width + 'px; height: ' + formHeight + 'px; font-size: ' + fontSize + 'px; line-height: ' + fontSize + 'px;');
        //form.attr('style', 'width: ' + width + 'px; height: ' + formHeight + 'px; font-size: ' + fontSize + 'px; line-height: 1.1;');
        $('#' + inputId).find('.parts_inner_textarea_dammy').attr('style', 'width: ' + width + 'px; height: ' + formHeight + 'px; font-size: ' + fontSize + 'px; line-height: 1.1;');
      } else {
        //form.attr('style', 'width: ' + width + 'px; height: ' + height + 'px; font-size: ' + fontSize + 'px; line-height: ' + fontSize + 'px;');
        //form.attr('style', 'width: ' + width + 'px; height: ' + height + 'px; font-size: ' + fontSize + 'px; line-height: 1.1;');
        $('#' + inputId).find('.parts_inner_textarea_dammy').attr('style', 'width: ' + width + 'px; height: ' + height + 'px; font-size: ' + fontSize + 'px; line-height: 1.1;');
      }
      $('#' + inputId).find('.parts_inner_form_dammy').resizable({containment: '.form_setting_file_img', minHeight: formHeight});
    }

    // 確認ボタンの無効化
    $('.only_once_button').attr('disabled', true);

    $.ajax({
      url: "/e-contract-api/regist-input",
      type: "POST",
      dataType: "text",
      data: {
        "id" : inputId,
        "type" : "font_size",
        "font_size" : fontSize
      },
    }).done(function(res) {
      // 確認ボタンの有効化
      $('.only_once_button').attr('disabled', false);
    }).fail(function(res) {
    });
    inputId = 0;
  });

  // テキストフォーム変更時に登録する
  $(document).on('change', '.text_form', function() {

    var partnerId = 0;
    var formId = $(this).parent(".form_setting_parts").attr('id');
    var text = $(this).val();

    var data = {};
    data['value'] = text;
    data['target'] = "self";
    data['size'] = $(this).css('font-size').replace('px', '');

    // テキストが空じゃなければ登録する
    if(text != '') {
      $.ajax({
        url: "/e-contract-api/put-value-input",
        type: "POST",
        dataType: "text",
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
      }).done(function(res) {
        // ローディングを非表示にする
        var fileCount = $('#filePageId').text() - 1;
        $('#loading' + fileCount).css({'display':'none'});
        // 入力済み背景に変更する
        $('#' + formId).prepend('<p class="done">入力済み</p>');
        $('#' + formId).css({'background-color':'transparent'});
      }).fail(function(res) {
      });
    } else {
      $('#' + formId + ' .done').remove();
      $('#' + formId).css({'background-color':'#FFF4E0'});
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
      // 確認ボタンのdisabled化
      $('.only_once_button').attr('disabled', true);
      var query = window.location.search.replace("?id=", "");
      window.location.href = '/e-contract-api/confirm?id=' + query;
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

  // 戻るボタン押下時
  function returnPartner() {
    var query = window.location.search.replace("?id=", "");

    $.ajax({
      url: "/e-contract-api/delete-input",
      type: "POST",
      data: {
        "case_id" : query
      }
    }).done(function(res) {
      window.location.href = '/e-contract-api/partners?id=' + query;
    }).fail(function(res) {
    });

  }

  function makePartnerSelectBox(curentPartnerId) {
    let partner_select = '';

    partner_select += '<p class="form_setting_partner_select_label">入力者<span class="require">必須</span></p>';
    partner_select += '<select class="partner_select">';
    partner_select += '  <option disabled selected value>選択してください</option>';
    $('#partner-list').find('div').each(function(index, value) {
      if(curentPartnerId==value.dataset.partner_id) {
        partner_select += '<option value="'+value.dataset.partner_id+'" selected>'+value.dataset.full_name+'</option>';
      } else {
        partner_select += '<option value="'+value.dataset.partner_id+'">'+value.dataset.full_name+'</option>';
      }
    });
    partner_select += '</select>';
    return partner_select;
  }

  function draggableStop(event, ui) {

    let inputId = $(event.target).attr('id');
    $("#"+inputId).css({ 'width' : '' , 'height' : '' } );

    var width = $('#' + inputId).find('.parts_inner_form_dammy').css('width');
    width = Number(width.replace('px', ''));
    var height = $('#' + inputId).find('.parts_inner_form_dammy').css('height');
    height = Number(height.replace('px', ''));
    var position = $('#' + inputId).position();
    var x = position.left;
    var y = position.top;


    // フォーム入力者が登録されていれば更新、登録されていなければ登録する
    $.ajax({
      url: "/e-contract-api/regist-input",
      type: "POST",
      dataType: "json",
      data: {
        "id"         : inputId,
        "type"       : "position",
        "width"      : width,
        "height"     : height,
        "x"          : x,
        "y"          : y
      },
      beforeSend: function() {
      }
    }).done(function(res) {
    }).fail(function(res) {
    });
  }

  function resizableStop(event, ui) {

    let inputId = $(event.target).parents(".ui-draggable").attr('id');
    let partnerId = $(event.target).parents(".ui-draggable").val();

    var width = $('#' + inputId).find('.parts_inner_form_dammy').css('width');
    width = Number(width.replace('px', ''));
    var height = $('#' + inputId).find('.parts_inner_form_dammy').css('height');
    height = Number(height.replace('px', ''));
    var position = $('#' + inputId).position();
    var x = position.left;
    var y = position.top;

    var className = $(event.target).attr('class');
    var inputType = null;
    if(0 < className.indexOf('sign')) {
      inputType = 'sign';
    } else if(0 < className.indexOf('textarea')) {
      inputType = 'textarea';
    } else if(0 < className.indexOf('text')) {
      inputType = 'text';
    } else if(0 < className.indexOf('checkbox')) {
      inputType = 'checkbox';
    }

    if(inputType == 'sign') {
      $(event.target).parents(".ui-draggable").find(".sign_img").css({'height':height+'px', 'width':width+'px'});
    } else if(inputType == 'textarea') {
       $('#' + inputId).find('.parts_inner_textarea_dammy').css({'height':height+'px', 'width':width+'px'});
    } if(inputType == 'text') {
       $('#' + inputId).find('.parts_inner_text_dammy').css({'height':height+'px', 'width':width+'px'});
    }

    let data  = {
        "id"         : inputId,
        "type"       : "position",
        "width"      : width,
        "height"     : height,
        "x"          : x,
        "y"          : y
    };

    $.ajax({
      url: "/e-contract-api/regist-input",
      type: "POST",
      dataType: "json",
      data: data,
      beforeSend: function() {
      }
    }).done(function(res) {
    }).fail(function(res) {
    });
  }


</script>

<style>
  p.upload_file{
    margin-top: 25px;
    line-height: 1;
  }

  p.form_setting_error {
    margin-top: 5px;
  }

  .box{
    width:660px;
    height:130px;
    background: #FFF9EF 0% 0% no-repeat padding-box;
    padding:30px;
  }

  label.materialfile{
    display: inline-block;
    width:165px;
    height:45px;
    background: #EFEFEF 0% 0% no-repeat padding-box;
    font: normal normal normal 14px/21px Hiragino Sans;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top:8px;
    border:1px solid #c3c3c3;
    border-radius:4px;
    color: #000000;
    margin-right:420px;
    margin-bottom:30px;
    cursor: pointer;
  }

  .box p{
    margin-bottom: 28px;
  }

  td.input_form_text{
    font: normal normal normal 12px/21px Hiragino Sans;
    color:#333333;
  }

  .input_form{
    width:203px;
    height:58px;
    margin-right:20px;
  }

  .input_box{
    width:82px;
    height:58px;
    margin-right:20px;
  }

  input#materialfile{
    height: auto;
    color: #666666;
    display:none;
}

.modal-content{
  display: none;
  z-index: 100000003;
}

.active{
  display: block;
  position: fixed;
  height: 100%;
  width: 100%;
  top: 0%;
  left: 0%;
  z-index: 100000003;
}

.mi_modal_shadow {
    position: absolute;
    width: 100%;
    height: 100%;
    background: #000;
    opacity: 0.6;
    top: 0;
    left: 0;
}

.ask_form_parts {
    position: fixed;
    margin: auto;
    width: 474px;
    height: 232px;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #fff;
}

.ask_form_parts .title_header {
    margin-top: 40px;
    font: normal normal normal 18px/21px Hiragino Sans;
    font-weight: bold;
    line-height: 1.39;
    letter-spacing: 0px;
    text-align: center;
    color: #ffa000;
}

.ask_form_parts .message_label {
    margin-top: 8px;
    font-family: Hiragino Sans;
    font-size: 12px;
    font-weight: normal;
    font-style: normal;
    font-stretch: normal;
    line-height: 2;
    letter-spacing: normal;
    text-align: center;
    color: #333333;
}

p.caution{
  text-align: center;
  font: normal normal normal 11px Hiragino Kaku Gothic ProN;
  letter-spacing: 0px;
  color: #E16A6C;
}

.btn_area {
    margin-top: 20px;
    text-align: center;
}

button {
    cursor: pointer;
    outline: none;
    border: none;
    color: #fff;
    background-color: #ffaa00;
    text-align: center;
    height: 40px;
    width: 130px;
    font-size: 16px;
    cursor: pointer;
}

.no_btn {
    width: 160px;
    height: 40px;
    background: #A2A2A2 0% 0% no-repeat padding-box;
}

.no_btn_inner {
    font: normal normal normal 14px/24px Hiragino Sans;
    letter-spacing: normal;
    text-align: left;
    color: #ffffff;
}

.yes_btn {
    width: 160px;
    height: 40px;
    background: #FFA000 0% 0% no-repeat padding-box;
}

.yes_btn_inner {
    font: normal normal normal 14px/24px Hiragino Sans;
    letter-spacing: normal;
    text-align: left;
    color: #ffffff;
}

.ask_form_parts_modal_close {
    background: #ffa000 url(../img/btn_close.png) no-repeat center center;
    position: absolute;
    top: 0px;
    right: 0px;
    display: block;
    width: 40px;
    height: 40px;
    cursor: pointer;
}

</style>

{/literal}

<!-- メインコンテンツ[start] -->
<div id="mi_main_contents">
  <!-- トップナビ start -->
  <div id="mi_top_nav" class="acount_manage_on">
    <div class="mi_content_title">
      <span class="icon-folder mi_content_title_icon mi_pdn-left40"></span>
      <h1 class="mi_content_title_text">電子契約書新規作成</h1>
    </div>
  </div>
  <!-- トップナビ end -->

  <!-- コンテンツエリア start -->
  <div id="mi_content_area">

    <!-- コンテンツ start -->
    <div class="e_contract_setting_area">

      <!-- ステップエリア begin -->
      <div class="e_contract_step_area">
        <img src="/img/send_contract_2.png">
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
      <div class="e_contract_title_area">
        <h2>2.入力者設定・パーツ配置</h2>
        <p>
          各パーツの入力者を設定し、自分が入力する部分へ入力をしてください。<br>
          各パーツの編集ボタンをクリックする事で、設定メニューを表示することができます。<br>
          各パーツは自由に追加や位置の調整、削除を行うことができます。
        </p>
        <p class="upload_file">アップロードファイル</p>
      </div>
      <!-- タイトル表示エリア end -->

      <!-- ファイル表示エリア begin -->
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
      <div class="modal-content" id="modal-content" data-e_contract_material_basic_id="{$row[0].e_contract_material_basic_id}">
        <div class="mi_modal_shadow" id="form_parts" style="background: rgba(120, 120, 120, 0.5);"></div>
        <div class="inner-wrap">
          <div class="ask_form_parts">
          <div class="title_header">
            フォームパーツを残しますか？
          </div>
          <div class="message_label">
            押印箇所や記名欄をそのままにして<br>
            PDFのみ差し替えることができます。  
            <p class="caution">※再度フォームパーツ内容の設定をお願いいたします。</p>
          </div>
          <div class="btn_area" style="margin-top: 20px">
            <button type="button" class="no_btn">
              <span class="no_btn_inner">
              いいえ
              </span>
            </button>
            <button type="button" class="yes_btn">
              <span class="yes_btn_inner">
              はい
              </span>
            </button>
          </div>
          <div class="ask_form_parts_modal_close"></div>
          </div>
        </div>
      </div>
      <div class="form_setting_document_area" data-e_contract_material_basic_id="{$row[0].e_contract_material_basic_id}">
          <div class="form_setting_document_img" id="0">
            <div class="form_setting_document_operation_area">
              <label class="materialfile">
                ファイルを差し替え
                <form id="change_material_file" class="change_material_file" data-e_contract_material_basic_id="{$row[0].e_contract_material_basic_id}">
                <input type="file" accept="application/pdf" id="materialfile" class="materialfileButton" value="ファイルを差し替え" name="change_material_file[]">
                </form>
                </label>
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
              <img src="/cmn-e-contract/{if $row|@count > 0}{$row[0].filename}{/if}" alt="資料画像" class="documentId" id="{$fileList[$smarty.foreach.loop.index].id}">
              {foreach from=$inputList item=input}
                {if $row[0].e_contract_material_basic_id == $input.e_contract_material_basic_id}
                  {if $input.type == 'text'}
                    <div id="{$input.id}" class="form_setting_parts_text_dammy ui-draggable ui-draggable-handle form_setting_parts" data-input="{$input.id}" data-page="{$input.page}" style="position: absolute; top: {$input.y}px; left: {$input.x}px; height: {$input.font_size+10}px; font-size: {$input.font_size}px;">
                      {if $input.target != null}
                        <p class="done">設定済み</p>
                      {/if}
                      {if $input.target != null && $input.e_contract_partner_id == 0}
                        <input type="text" value="{$input.value}" class="parts_inner_text_dammy text_form" style="width: {$input.width}px; height: {$input.font_size+10}px; font-size: {$input.font_size+10}px;">
                      {/if}
                      <div class="parts_inner_text_dammy parts_inner_form_dammy" style="width: {$input.width}px; height: {$input.font_size+10}px; font-size: {$input.font_size}px;">テキストが入ります</div>

                      <img class="partner_select_open" src="/img/partner_select.png">
                      <div class="form_setting_partner_select">
                        <p class="form_setting_partner_select_label">入力者<span class="require">必須</span></p>
                        <select class="partner_select">

                          <option disabled selected value>選択してください</option>
                          {if $input.target != null && $input.e_contract_partner_id == 0}
                            <option value="0" selected>{$user.header_username}</option>
                            {foreach from=$partnerList item=partner}
                              <option value="{$partner.id}">{$partner.lastname}{$partner.firstname}</option>
                            {/foreach}
                          {else}
                            <option value="0">{$user.header_username}</option>
                            {foreach from=$partnerList item=partner}
                              {if $partner.id == $input.e_contract_partner_id}
                                <option value="{$partner.id}" selected>{$partner.lastname}{$partner.firstname}</option>
                              {else}
                                <option value="{$partner.id}">{$partner.lastname}{$partner.firstname}</option>
                              {/if}
                            {/foreach}
                          {/if}
                        </select>
                      </div>

                      <div class="parts_inner_fontsize">
                        <select class="change_fontsize">
                          {section name=i start=10 loop=55}
                            {if $smarty.section.i.index == $input.font_size}
                              <option value="{$smarty.section.i.index}" selected>{$smarty.section.i.index}px</option>
                            {else}
                              <option value="{$smarty.section.i.index}">{$smarty.section.i.index}px</option>
                            {/if}
                          {/section}
                        </select>
                      </div>
                      <div class="parts_inner_remove">×</div>

                    </div>
                    {assign var="formFlg" value="true"}
                    {if $formFlg != "true"}
                      <div id="{$input.id}" class="form_setting_parts_text_dammy form_setting_parts" data-input="0" data-page="{$input.page}" style="position: absolute; top: {$input.y}px; left: {$input.x}px;">
                        <div class="parts_inner_text_dammy" style="width: {$input.width}px; height: {$input.height}px; font-size: {$input.font_size}px;">テキストが入ります</div>
                        <img class="partner_select_open" src="/img/partner_select.png">

                        <div class="form_setting_partner_select">
                          <p class="form_setting_partner_select_label">入力者<span class="require">必須</span></p>
                          <select class="partner_select">
                            <option disabled selected value>選択してください</option>
                            <option value="0">{$user.header_username}</option>
                            {foreach from=$partnerList item=partner}
                              <option value="{$partner.id}">{$partner.lastname}{$partner.firstname}</option>
                            {/foreach}
                          </select>
                        </div>
                      </div>
                      {assign var="formFlg" value="false"}
                    {/if}
                  {elseif $input.type == 'textarea'}
                    <div id="{$input.id}" class="form_setting_parts_textarea_dammy ui-draggable ui-draggable-handle form_setting_parts" data-input="{$input.id}" data-page="{$input.page}" style="position: absolute; top: {$input.y}px; left: {$input.x}px;">
                      {if $input.target != null}
                        <p class="done">設定済み</p>
                      {/if}
                      {if $input.target != null && $input.e_contract_partner_id == 0}
                        <textarea class="parts_inner_textarea_dammy text_form" style="width: {$input.width}px; height: {$input.height}px; font-size: {$input.font_size}px;">{$input.value}</textarea>
                      {/if}
                      <div class="parts_inner_textarea_dammy parts_inner_form_dammy" style="width: {$input.width}px; height: {$input.height}px; font-size: {$input.font_size}px;">複数行のテキストが入ります</div>

                      <img class="partner_select_open" src="/img/partner_select.png">
                      <div class="form_setting_partner_select">
                        <p class="form_setting_partner_select_label">入力者<span class="require">必須</span></p>
                        <select class="partner_select">
                          <option disabled selected value>選択してください</option>
                          {if $input.target != null && $input.e_contract_partner_id == 0}
                            <option value="0" selected>{$user.header_username}</option>
                            {foreach from=$partnerList item=partner}
                              <option value="{$partner.id}">{$partner.lastname}{$partner.firstname}</option>
                            {/foreach}
                          {else}
                            <option value="0">{$user.header_username}</option>
                            {foreach from=$partnerList item=partner}
                              {if $partner.id == $input.e_contract_partner_id}
                                <option value="{$partner.id}" selected>{$partner.lastname}{$partner.firstname}</option>
                              {else}
                                <option value="{$partner.id}">{$partner.lastname}{$partner.firstname}</option>
                              {/if}
                            {/foreach}
                          {/if}
                        </select>
                      </div>

                      <div class="parts_inner_fontsize">
                        <select class="change_fontsize">
                          {section name=i start=10 loop=55}
                            {if $smarty.section.i.index == $input.font_size}
                              <option value="{$smarty.section.i.index}" selected>{$smarty.section.i.index}px</option>
                            {else}
                              <option value="{$smarty.section.i.index}">{$smarty.section.i.index}px</option>
                            {/if}
                          {/section}
                        </select>
                      </div>
                      <div class="parts_inner_remove">×</div>
                    </div>
                    {assign var="formFlg" value="true"}
                    {if $formFlg != "true"}
                      <div id="{$input.id}" class="form_setting_parts_textarea_dammy form_setting_parts" data-input="0" data-page="{$input.page}" style="position: absolute; top: {$input.y}px; left: {$input.x}px;">
                        <div class="parts_inner_textarea_dammy" style="width: {$input.width}px; height: {$input.height}px; font-size: {$input.font_size}px; line-height: {$input.font_size}px;">複数行のテキストが入ります</div>
                        <img class="partner_select_open" src="/img/partner_select.png">

                        <div class="form_setting_partner_select">
                          <p class="form_setting_partner_select_label">入力者<span class="require">必須</span></p>
                          <select class="partner_select">
                            <option disabled selected value>選択してください</option>
                            <option value="0">{$user.header_username}</option>
                            {foreach from=$partnerList item=partner}
                              <option value="{$partner.id}">{$partner.lastname}{$partner.firstname}</option>
                            {/foreach}
                          </select>
                        </div>
                      </div>
                      {assign var="formFlg" value="false"}
                    {/if}
                  {elseif $input.type == 'sign'}
                    <div id="{$input.id}" class="form_setting_parts_sign_dammy ui-draggable ui-draggable-handle form_setting_parts" data-input="{$input.id}" data-page="{$input.page}" style="position: absolute; top: {$input.y}px; left: {$input.x}px;">
                      {if $input.img_data != null || $input.target != null && $input.e_contract_partner_id == 0}
                        <p class="done self_sign">設定済み</p>
                      {elseif 0 < $input.e_contract_partner_id}
                        <p class="done partner_sign">設定済み</p>
                      {/if}
                      <div class="parts_inner_sign_dammy parts_inner_form_dammy" style="width: {$input.width}px; height: {$input.height}px;"></div>
                      {if $input.img_data != null}
                        <img class="sign_img" style="position: absolute; top: 11px; left: -1px; width: {$input.width}px; height: {$input.height}px;" src="data:image/png;base64, {$input.img_data}">
                      {/if}

                      <img class="partner_select_open" src="/img/partner_select.png">
                      <div class="form_setting_partner_select">
                        <p class="form_setting_partner_select_label">入力者<span class="require">必須</span></p>
                        <select class="partner_select">
                          <option disabled selected value>選択してください</option>
                          {if $input.target != null && $input.e_contract_partner_id == 0}
                            <option value="0" selected>{$user.header_username}</option>
                            {foreach from=$partnerList item=partner}
                              <option value="{$partner.id}">{$partner.lastname}{$partner.firstname}</option>
                            {/foreach}
                          {else}
                            <option value="0">{$user.header_username}</option>
                            {foreach from=$partnerList item=partner}
                              {if $partner.id == $input.e_contract_partner_id}
                                <option value="{$partner.id}" selected>{$partner.lastname}{$partner.firstname}</option>
                              {else}
                                <option value="{$partner.id}">{$partner.lastname}{$partner.firstname}</option>
                              {/if}
                            {/foreach}
                          {/if}
                        </select>
                      </div>

                      <div class="parts_inner_remove">×</div>
                    </div>
                    {assign var="formFlg" value="true"}
                    {if $formFlg != "true"}
                      <div id="{$input.id}" class="form_setting_parts_sign_dammy form_setting_parts" data-page="{$input.page}" style="position: absolute; top: {$input.y}px; left: {$input.x}px;">
                        <div class="parts_inner_sign_dammy" style="width: {$input.width}px; height: {$input.height}px;"></div>
                        <img class="partner_select_open" src="/img/partner_select.png">

                        <div class="form_setting_partner_select">
                          <p class="form_setting_partner_select_label">入力者<span class="require">必須</span></p>
                          <select class="partner_select">
                            <option disabled selected value>選択してください</option>
                            <option value="0">{$user.header_username}</option>
                            {foreach from=$partnerList item=partner}
                              <option value="{$partner.id}">{$partner.lastname}{$partner.firstname}</option>
                            {/foreach}
                          </select>
                        </div>
                      </div>
                      {assign var="formFlg" value="false"}
                    {/if}
                  {elseif $input.type == 'checkbox'}
                    <div id="{$input.id}" class="form_setting_parts_checkbox_dammy ui-draggable ui-draggable-handle form_setting_parts" data-input="{$input.id}" data-page="{$input.page}" style="position: absolute; top: {$input.y}px; left: {$input.x}px;">
                      {if $input.target != null}
                        <p class="done">設定済み</p>
                      {/if}
                      <div class="parts_inner_checkbox_dammy parts_inner_form_dammy" style="width: {$input.width}px; height: {$input.height}px;"></div>
                      {if $input.img_data != null}
                        <img class="checkbox_img" style="position: absolute; top: 11px; left: -1px; width: {$input.width}px; height: {$input.height}px;" src="data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAACMAAAAjCAYAAAAe2bNZAAAAAXNSR0IArs4c6QAAAiRJREFUWAntmDtLA0EQx2fPnCQa0FgoBnyg2GrAR2OjILa+wFb9CBbmQ2jjN1BbBUmtCNfY+Iy2gkaF+AI90RhjfN0/yyYRsmcel0tzU1yW2dmZ3/5n0wwjw662gn6qaVj4+kxM/Xy+t8BnhymqJ6pUVa/T2+NS6+hilKVAPD7N6+/r8jZ1k1rbaAdHqkYydk8vt+H32M3RNcWfhlxQxNvc2+XrGLENQhTCxRs6R92MsZaX6GFQ+f76mIYilTRvU4/b4JhUvpNxv52tyXVp1MdbVXJtVsrnwMiUd5RxlEkpoIeJQj6i3QmZIGl/ed8MQLRhoqROpB+ni8oW5YPJBlHriAZDMoa0vzwwkdWMIgAZ0ojqA+misoVLtlG0HyD7c/x4XQ/RsEak1ueVzlplSgABrTnMg3GryFpet6ISQVDEvE2748Y/4ZkIUP0rcigLQJDcXJn2WQ6QXYx7Mt+z5aLfSCYJX5nDBIxCbTM8MhfQ3ixReJ7v+8cKeqz80N+veZsQO7DKT1wabwdAMLQMIPDBACziuKeo7/8wSCsKCaB7jegtgh3LQJDKvE2IEAYg0bIygKBM/jCIzgayqDVIKyy/Nolo/AJItC3bb8G6MGUsKGiWwoGRqeMoI1UGYwlMAyppqM9c7msF85HXu9NKslDs7iRhcGwqGNS8Rg/O9Isdslsh1NPPtxPGOOSKxZ8WGSTBwOjH4wtiLGH35Iop6gZAMLn6BTGLwMGnHwLyAAAAAElFTkSuQmCC">
                      {/if}

                      <img class="partner_select_open" src="/img/partner_select.png">
                      <div class="form_setting_partner_select checkbox">
                        <p class="form_setting_partner_select_label">入力者<span class="require">必須</span></p>
                        <select class="partner_select">
                          <option disabled selected value>選択してください</option>
                          {if $input.target != null && $input.e_contract_partner_id == 0}
                            <option value="0" selected>{$user.header_username}</option>
                            {foreach from=$partnerList item=partner}
                              <option value="{$partner.id}">{$partner.lastname}{$partner.firstname}</option>
                            {/foreach}
                          {else}
                            <option value="0">{$user.header_username}</option>
                            {foreach from=$partnerList item=partner}
                              {if $partner.id == $input.e_contract_partner_id}
                                <option value="{$partner.id}" selected>{$partner.lastname}{$partner.firstname}</option>
                              {else}
                                <option value="{$partner.id}">{$partner.lastname}{$partner.firstname}</option>
                              {/if}
                            {/foreach}
                          {/if}
                        </select>
                        <input id="checkbox{$input.id}" name="checkbox{$input.id}" type="checkbox" onchange="setRequired(this)" {if $input.required == 'true'} checked="checked" {/if}>
                        <label for="checkbox{$input.id}">入力を必須にする</label>
                      </div>

                      <div class="parts_inner_remove">×</div>

                    </div>
                    {assign var="formFlg" value="true"}
                    {if $formFlg != "true"}
                      <div id="{$input.id}" class="form_setting_parts_checkbox_dammy form_setting_parts" data-page="{$input.page}" style="position: absolute; top: {$input.y}px; left: {$input.x}px;">
                        <div class="parts_inner_checkbox_dammy" style="width: {$input.width}px; height: {$input.height}px;"></div>

                        <img class="partner_select_open" src="/img/partner_select.png">
                        <div class="form_setting_partner_select checkbox">
                          <p class="form_setting_partner_select_label">入力者<span class="require">必須</span></p>
                          <select class="partner_select">
                            <option disabled selected value>選択してください</option>
                            <option value="0">{$user.header_username}</option>
                            {foreach from=$partnerList item=partner}
                              <option value="{$partner.id}">{$partner.lastname}{$partner.firstname}</option>
                            {/foreach}
                          </select>
                          <input id="checkbox{$input.id}" name="checkbox{$input.id}" type="checkbox" onchange="setRequired(this)"  {if $input.required == 'true'} checked="checked" {/if}>
                          <label for="checkbox{$input.id}">入力を必須にする</label>
                        </div>
                      </div>
                      {assign var="formFlg" value="false"}
                    {/if}
                  {/if}
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
          <a href="javascript:void(0)" onClick="returnPartner();"></a>
        </div>

        <div class="signup-button-box">
          <button id="submit_button" class="only_once_button">確認</button>
        </div>
      </div>
      <!-- 契約書エリア begin -->

      <!-- データエリア begin -->
      <input type="hidden" id="caseId" value="{$case.id}">
      <input type="hidden" id="clientId" value="{$user.client_id|escape}">
      <!-- データエリアend -->

    </div>
    <!-- コンテンツ end -->

  </div>
  <!-- コンテンツエリア end -->

</div>
<!-- メインコンテンツ[end] -->

<div id="partner-list">
  <div data-partner_id="0" data-full_name="{$user.header_username}"</div>
{foreach from=$partnerList item=partner}
  <div data-partner_id="{$partner.id}" data-full_name="{$partner.lastname}{$partner.firstname}"</div>
{/foreach}
</div>


{include file="./common/footer.tpl"}

{literal}
<script>

  // フォームホバーで背景、ボタンの表示非表示
  $('.form_setting_parts').css('background-color', 'transparent');
  $('.partner_select_open').css('display', 'none');
  $('.parts_inner_fontsize, .parts_inner_remove').css('display', 'none');

  $(document).on('mouseover', '.form_setting_parts', function() {
    $(this).css({'background-color': '#FFF4E0', 'z-index': '100'});
    $(this).find('.partner_select_open').css('display', 'block');
    $(this).find('.parts_inner_fontsize, .parts_inner_remove').css('display', 'block');
  });

  $(document).on('mouseout', '.form_setting_parts', function() {
    $(this).css({'background-color': 'transparent', 'z-index': '0'});
    $(this).find('.partner_select_open').css('display', 'none');
    $(this).find('.parts_inner_fontsize, .parts_inner_remove').css('display', 'none');
  });
  // 確認ボタン押下時
  $('#submit_button').on('click', function(e) {
    confirmEContract();
  });

</script>
{/literal}
