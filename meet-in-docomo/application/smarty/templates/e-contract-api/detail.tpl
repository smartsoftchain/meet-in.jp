{include file="./common/header.tpl"}

{literal}

<style>

/* 各リスト項目のパディング設定 */
.ui-menu .ui-menu-item-wrapper {
  position: relative; padding: 3px 1em 3px .4em;
  margin-top:5px!important;
  margin-bottom:5px!important;
}
/* リスト全体の背景 */
.ui-widget-content {
  border: 1px solid #666!important;
  background: #fff!important;
  /*color: #393!important;*/
  box-shadow: none!important;
  border-radius: 4px!important;
  border: 1px solid #bbbbbb!important;
}
/* リスト hover 時のカラー */
.ui-state-focus {
  border: none!important;
  background: #E8E8E9!important;
  font-weight: 400!important;
  margin-top:5px!important;
  margin-bottom:5px!important;
  color:#585858!important;
}

.tag-delete {
    color: #fff;
    text-align: center;
    background-color: #0081CC;
    width: 14px;
    height: 14px;
    line-height: 14px;
    border: none;
    border-radius: 50%;
    margin-right: 5px;
    margin-left: 12px;
    margin-top: 6px;
    padding: 1px;
}

.tag_item {
  list-style: none;
}

.tag_item li {
    background-color: #E5F4FF;
    border: 1px solid rgb(237, 237, 237);
    border-radius: 2px;
    cursor: default;
    float: left;
    margin-right: 5px;
    padding: 0 5px;
    margin-top: 6px;
    display: flex;
    height:30px;
    line-height:30px;
}

.tag_button_add {
    color: #0081CC;
    font-weight: bold;
    text-align: center;
    width: 70px;
    height: 40px;
    line-height: 40px;
    background-color: #fff;
    border: 1px solid #0081CC;
    border-radius: 2px;
    cursor: pointer;
    margin-left: 10px;
}

.tag_button_save {
    color: #fff;
    font-weight: bold;
    text-align: center;
    width: 70px;
    height: 40px;
    line-height: 40px;
    background-color: #0081CC;
    border-radius: 2px;
    cursor: pointer;
    margin-left: 10px;
}

.ui-tooltip {
    background: #E1E3E4!important;
    word-break:break-all;
    font-size:10px;
    margin:0;
    border:none!important;
}

</style>

<script>

  $(function() {

    $( document ).tooltip({
      position : {
         my: "left top+5", at: "left bottom", collision: "flipfit"
      },
      tooltipClass : "ui-tooltip",
    });

    let case_id = {/literal}{$case.id}{literal}

    $("#tag_input").autocomplete({
      minLength: 0,
      source: function(req, resp){
          $.ajax({
              url: "/e-contract-api/get-tag-list",
              type: "POST",
              cache: false,
              dataType: "json",
              data: {
              param: req.term
              },
              success: function(o){
              resp(o);
              },
              error: function(xhr, ts, err){
              resp(['']);
              }
          });
      }
    });

    // テキストボックスがクリックされた際にautocomplete実行
    $("#tag_input").focusin(function(){
      // 第1引数：searchを設定した場合、データを絞り込みを実行
      // 第2引数：検索対象のキーワード。空文字を指定した場合、全ての入力候補を表示
      $(this).autocomplete("search","");
    });

    // TODO:AHD タグの追加
    $('#tag-add').on('click', function() {
      if ($("#tag_input").val() != "") {
        let text = $("#tag_input").val();
        let displayText = text;

        if (text.length >= 20) {
          displayText = text.substr(0, 17) + '...';
          $('.tag_item').append(
            '<li class="tag_element" title="' + text + '">' + displayText + ' <span class="tag-delete">✕</span>' + '<input type="hidden" class="tags" name="tags[]" value="' + text + '">' + '</li>'
            );
        } else {
          $('.tag_item').append(
            '<li class="tag_element">' + displayText + ' <span class="tag-delete">✕</span>' + '<input type="hidden" class="tags" name="tags[]" value="' + text + '">' + '</li>'
            );
        }

        $("#tag_input").val('');
      }
    });

    $(document).on("click", ".tag-delete", function (event) {
      $(this).parent().remove();
    });

    // TODO AHD タグ保存
    $('#tag-save').on('click', function() {
      var params = [];

      $(".tags").each(function(e) {
        params.push($(this).val());
      });

      // 保存処理
      $.ajax({
        url: "/e-contract-api/set-contract-tag",
        type: "POST",
        dataType: "json",
        data: {
          "id" : case_id,
          "tags" : params,
        },
        beforeSend: function(){
        }
      }).done(function(result) {
        alert("更新完了しました");
        return false;
      }).fail(function() {
      });
    });

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
        var getDocumentId = Number(IntDocumentId)+1;
        var Id = changeId + getDocumentId;
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
    var formText = document.getElementsByClassName('form_setting_parts_text_dammy_confirm ui-draggable ui-draggable-handle');
    for( var i=0 ; i < formText.length; i++){
      var formTextNum = formText[i];
    }
    // 配列に保存されているテキストフォームを1つずつ取り出す
    var formTextarea = document.getElementsByClassName('form_setting_parts_textarea_dammy_confirm ui-draggable ui-draggable-handle');
    for( var i=0 ; i < formTextarea.length; i++){
      var formTextareaNum = formTextarea[i];
    }
    // 配列に保存されているチェックボックスフォームを1つずつ取り出す
    var formCheck = document.getElementsByClassName('form_setting_parts_checkbox_dammy_confirm ui-draggable ui-draggable-handle');
    for(var i=0 ; i < formCheck.length; i++) {
      var formCheckNum = formCheck[i];
    }
    // 配列に保存されているサインフォームを1つずつ取り出す
    var formSign = document.getElementsByClassName('form_setting_parts_sign_dammy_confirm ui-draggable ui-draggable-handle');
    for(var i=0 ; i < formSign.length; i++){
      var formSignNum = formSign[i];
    }
    $(".form_setting_parts_text_dammy_confirm").css('display','none');
    $(".form_setting_parts_textarea_dammy_confirm").css('display','none');
    $(".form_setting_parts_checkbox_dammy_confirm").css('display','none');
    $(".form_setting_parts_sign_dammy_confirm").css('display','none');
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
    var formText = document.getElementsByClassName('form_setting_parts_text_dammy_confirm ui-draggable ui-draggable-handle');
    for( var i=0 ; i < formText.length; i++){
     var formTextNum = formText[i];
    }
    //配列に保存されているテキストエリアを1つずつ取り出す
    var formTextarea = document.getElementsByClassName('form_setting_parts_textarea_dammy_confirm ui-draggable ui-draggable-handle');
    for( var i=0 ; i < formTextarea.length; i++){
     var formTextareaNum = formTextarea[i];
    }
    //配列に保存されているチェックボックスフォームを1つずつ取り出す
    var formCheck = document.getElementsByClassName('form_setting_parts_checkbox_dammy_confirm ui-draggable ui-draggable-handle');
    for( var i=0 ; i < formCheck.length; i++){
      var formCheckNum = formCheck[i];
    }
    //配列に保存されているサインフォームを1つずつ取り出す
    var formSign = document.getElementsByClassName('form_setting_parts_sign_dammy_confirm ui-draggable ui-draggable-handle');
    for( var i=0 ; i < formSign.length; i++){
      var formSignNum = formSign[i];
    }
    if(IntPageCountMax>IntPageCount){
      $(".form_setting_parts_text_dammy_confirm").css('display','none');
      $(".form_setting_parts_textarea_dammy_confirm").css('display','none');
      $(".form_setting_parts_checkbox_dammy_confirm").css('display','none');
      $(".form_setting_parts_sign_dammy_confirm").css('display','none');
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
    var formText = document.getElementsByClassName('form_setting_parts_text_dammy_confirm ui-draggable ui-draggable-handle');
    for( var i=0 ; i < formText.length; i++){
     var formTextNum = formText[i];
    }
    //配列に保存されているテキストエリアを1つずつ取り出す
    var formTextarea = document.getElementsByClassName('form_setting_parts_textarea_dammy_confirm ui-draggable ui-draggable-handle');
    for( var i=0 ; i < formTextarea.length; i++){
     var formTextareaNum = formTextarea[i];
    }
    //配列に保存されているチェックボックスフォームを1つずつ取り出す
    var formCheck = document.getElementsByClassName('form_setting_parts_checkbox_dammy_confirm ui-draggable ui-draggable-handle');
    for( var i=0 ; i < formCheck.length; i++){
      var formCheckNum = formCheck[i];
    }
    //配列に保存されているサインフォームを1つずつ取り出す
    var formSign = document.getElementsByClassName('form_setting_parts_sign_dammy_confirm ui-draggable ui-draggable-handle');
    for( var i=0 ; i < formSign.length; i++){
      var formSignNum = formSign[i];
    }
    if(IntPageCount>0) {
      $(".form_setting_parts_text_dammy_confirm").css('display','none');
      $(".form_setting_parts_textarea_dammy_confirm").css('display','none');
      $(".form_setting_parts_checkbox_dammy_confirm").css('display','none');
      $(".form_setting_parts_sign_dammy_confirm").css('display','none');
      $("[data-page = " + IntPageCount + "]").css('display','');
    } else {
      return false;
    }
  })

  // PDFダウンロードボタンをクリック
  function fileDownload() {
    var fileCount = $('.download_file').length;
    var tryCount = 0;

    $('.download_file').each(function() {
      var href = $(this).attr('href');
      var filename = $(this).data('download-file');

      var a = document.createElement('a');
      a.download = filename;
      a.href = href;
      a.click();
    });
  }

  // 再送ボタンをクリック
  $(document).on('click', '.resend', function() {
    if(confirm('承認依頼メールを再送します。よろしいですか？')) {
      var partnerId = $("#partner_id").val();
      var approvalMethod = $("#approval_method").val();
      $.ajax({
        url: "/e-contract-api/resend-approval-request",
        type: "POST",
        dataType: "text",
        data: {
          "partner_id" : partnerId,
          "approval_method" : approvalMethod
        }
      }).done(function(res) {
        res = jQuery.parseJSON(res);
        if(res.status == 'sent') {
          alert('承認依頼メールが再送されました');
        } else {
          alert('承認依頼メールが再送に失敗しました');
        }
      }).fail(function(res) {
      });
    }
  });

  $(document).on('click', '#del_chk', function() {
    const documentID = $(this).data("id");
    makeDefaultConfirmDialog(
      "電子契約書を削除しますか？",
      "OKをクリックするとこの電子契約書は完全に削除されます。<br> 削除された電子契約書のデータは元に戻すことができません。",
      {
        submit_event: e=> {
          $.ajax({
            url: "/e-contract-api/delete-contract",
            type: "POST",
            dataType: "text",
            data: {
              "document_id" : documentID
            }
          }).done(function(res) {

            if(referer_url.value != null) {
              location.href = referer_url.value;
            } else {
              history.go(-1);
            }

          }).fail(function(res) {
            console.log(res);
          });

        },
        z_index:550
      });
  });




</script>

{/literal}

<!-- メインコンテンツ[start] -->
<div id="mi_main_contents">
  <input type="hidden" id="referer_url" value="{$referer_url}">
  <!-- トップナビ start -->
  <div id="mi_top_nav" class="acount_manage_on">
    <div class="mi_content_title mi_mgn-left40">
      <span class="icon-folder mi_content_title_icon"></span>
      <h1 class="mi_content_title_text">電子契約契約書詳細</h1>
    </div>
  </div>
  <!-- トップナビ end -->

  <!-- コンテンツエリア start -->
  <div id="mi_content_area">

    <!-- コンテンツ start -->
    <div class="e_contract_setting_area">

      <!-- タイトル表示エリア begin -->
      <div class="e_contract_title_area flex">
        <h2>電子契約契約書詳細</h2>


        <div class="button_area">
          {if $case.uid != null}
            <div class="e_contract_download_btn">
              <a href="/e_contract_documents/{$case.client_id}/{$case.uid}.pdf" download>PDFダウンロード</a>
            </div>

          {elseif $user !== null}
            <div class="mi_content_title_option">
              <a href="javascript:void(0);" name="del_chk" class="mi_title_action_btn" id="del_chk" data-id="{$case.id}">
                <span class="icon-delete"></span>
                <span class="icon-delete-text">削除</span>
              </a>
            </div>
          {/if}
        </div>
      </div>
      <!-- タイトル表示エリア end -->

      <!-- ファイル表示エリア begin -->
      <div class="form_setting_file_area">
        {* <p class="form_setting_label">契約書 {$fileList|@count}件</p> *}
        <div>
          {foreach from=$fileList item=row}
            <div class="form_template-name">
              <span class="template-name_text">
              {$row.name}
              <a class="file_target" id="0"></a>
              </span>
            </div>
            <a class="download_file" href="https://{$serverAddress}/cmn-e-contract/{$row.filename}" data-download-file="{$row.name}"></a>
          {/foreach}
        </div>
      </div>
      <!-- ファイル表示エリア end -->

      <!-- 契約書エリア begin -->
      {foreach from=$materialList item=row name=loop}
        <div class="form_setting_document_area">
          <div class="form_setting_document_img" id="0">
            <div class="form_setting_document_operation_area2">
              <div class="form_setting_document_operation_left">
                <div class="form_setting_document_status_area">
                  <div class="form_setting_document_operation_label">ステータス</div>
                  <div class="form_setting_document_operation_text">
                    {if $rejectedCount != 0}
                      却下
                    {elseif $case.uid != null}
                      完了
                    {else}
                      確認中
                    {/if}
                  </div>
                </div>
                <div class="form_setting_document_approved_area">
                  <div class="form_setting_document_operation_label">サイン済み</div>
                  <div class="form_setting_document_operation_text">
                    {$approvedCount}/{$partnerList|@count}人
                  </div>
                </div>
              </div>
              <div class="form_setting_document_operation_right">
                <div class="form_setting_document_page_area">
                  <div class="page-text">
                    <span class="form_setting_document_page_count" id="pageId" data-id="0">1</span>/<span class="form_setting_document_page_total">{$row|@count}</span>P
                  </div>
                  <div class="form_setting_document_pager">
                    <span class="form_setting_document_pager_prev">＜</span><span class="form_setting_document_pager_next">＞</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="form_setting_file_img">
              <img src="/cmn-e-contract/{if $row|@count > 0}{$row[0].filename}{/if}" alt="資料画像" class="documentId" id="{$fileList[$smarty.foreach.loop.index].id}">
              {foreach from=$formList[$smarty.foreach.loop.index] item=form}
                {if $form.type == 'text'}
                  <div id="{$form.id}" class="form_setting_parts_text_dammy_confirm form_setting_parts" data-page="{$form.page}" style="position: absolute; top: {$form.y}px; left: {$form.x}px;">
                    <div class="parts_inner_text_dammy" style="width: {$form.width}px; height: {$form.font_size+10}px; font-size: {$form.font_size}px; color: #222;">{$form.value}</div>
                  </div>
                {elseif $form.type == 'textarea'}
                  <div id="{$form.id}" class="form_setting_parts_textarea_dammy_confirm form_setting_parts" data-page="{$form.page}" style="position: absolute; top: {$form.y}px; left: {$form.x}px;">
                    <div class="parts_inner_textarea_dammy" style="width: {$form.width}px; height: {$form.height}px; font-size: {$form.font_size}px; color: #222;">{$form.value|nl2br}</div>
                  </div>
                {elseif $form.type == 'sign'}
                  <div id="{$form.id}" class="form_setting_parts_sign_dammy_confirm form_setting_parts" data-page="{$form.page}" style="position: absolute; top: {$form.y}px; left: {$form.x}px;">
                    {if $form.img_data != ''}
                      <img style="position: absolute; top: 5px; left: 16px; width: {$form.width}px; height: {$form.height}px; border: none; z-index: 100;" src="data:image/png;base64, {$form.img_data}">
                    {/if}
                    <div class="parts_inner_sign_dammy" style="position: absolute; top: 4px; left: 14px; width: {$form.width}px; height: {$form.height}px;"></div>
                  </div>
                {elseif $form.type == 'checkbox'}
                  <div id="{$form.id}" class="form_setting_parts_checkbox_dammy_confirm form_setting_parts" data-page="{$form.page}" style="position: absolute; top: {$form.y}px; left: {$form.x}px;">
                    {if $form.img_data != ''}
                      <img style="position: absolute; top: 10px; left: 15px; width: {$form.width}px; height: {$form.height}px; z-index: 100;" src="data:image/png;base64, {$form.img_data}">
                    {/if}
                    <div class="parts_inner_checkbox_dammy" style="position: absolute; top: 9px; left: 14px; width: {$form.width}px; height: {$form.height}px;"></div>
                  </div>
                {/if}
              {/foreach}
            </div>
          </div>
        </div>
      {/foreach}
      <!-- 契約書エリア begin -->

      <!-- タグエリア begin -->
      <div class="form_setting_partner_area">
        <p class="form_setting_partner_title">タグの編集</p>
        <p class="form_setting_partner_description">タグの編集、削除、追加をしてください</p>
        <div style="display:flex">
          <input type="text" name="tag_input" placeholder="入力してください" class="partner_setting_title_input" id="tag_input">
          <div id="tag-add" class="tag_button_add">追加</div>
          <div id="tag-save" class="tag_button_save">保存</div>
        </div>
        <ul class="tag_item">
          {foreach from=$tags item=tag}
          {if $tag|mb_strlen > 20}
            <li class="tag_element" title="{ $tag }">{$tag|mb_strimwidth:0:20:"..."}<span class="tag-delete">✕</span><input type="hidden" class="tags" name="tags[]" value="{ $tag }"></li>
          {else}
            <li class="tag_element">{ $tag }<span class="tag-delete">✕</span><input type="hidden" class="tags" name="tags[]" value="{ $tag }"></li>
          {/if}
          {/foreach}
        </ul>
        <br clear="both">
      </div>
      <!-- タグ契約者エリア begin -->

      <!-- 契約者エリア begin -->
      <div class="form_setting_partner_area">
        <p class="form_setting_partner_title">契約者</p>
        <p class="form_setting_partner_description">電子契約書の送付先と送付される順番です。</p>
        {foreach from=$partnerList item=partner name=loop}
          <div class="form_setting_partner_item">
            <div class="form_setting_partner_number">
              {$smarty.foreach.loop.index+1}
            </div>
            <div class="form_setting_partner_name">
              {$partner.lastname}{$partner.firstname}
            </div>
            <div class="form_setting_partner_organization">
              {$partner.organization_name}
            </div>
            <div class="form_setting_partner_email">
              {$partner.email}
            </div>
            {if $partner.approval_status == 1}
              <div class="form_setting_partner_check">
                <img src="/img/check.png">
              </div>
            {else}
              {if $resendFlg == 0}
                {assign var="resendFlg" value=1}
                <div class="form_setting_partner_resend">
                  <input type="hidden"  id = "partner_id" value="{$partner.id}">
                  <input type="hidden"  id = "approval_method" value="{$case.approval_method}">
                  <a href="javascript:void(0)" class="resend">再送</a>
                </div>
              {else}
                <div class="form_setting_partner_resend">未承認</div>
              {/if}
            {/if}
          </div>
        {/foreach}
      </div>
      <!-- 契約者エリア begin -->

    </div>
    <!-- コンテンツ end -->

  </div>
  <!-- コンテンツエリア end -->

</div>
<!-- メインコンテンツ[end] -->

{include file="./common/footer.tpl"}
