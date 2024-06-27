{include file="./common/header.tpl"}

{literal}

<style>

#mi_main_contents {
  line-height: 1.2;
}

</style>

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
    var formText = document.getElementsByClassName('form_setting_parts_text_dammy_confirm ui-draggable ui-draggable-handle');
    for( var i=0 ; i < formText.length; i++){
      var formTextNum = formText[i];
    }
    // 配列に保存されているテキストエリアを1つずつ取り出す
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
    //配列に保存されているテキストフォームを1つずつ取り出す
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

  // 登録ボタン押下時
  function sendEContract() {
    var caseId = window.location.search.replace("?id=", "");
    var message = $('#message').val();
    // 1人目のパートナーに承認依頼メールを送信する
    $.ajax({
      url: "/e-contract-api/send-approval-request",
      type: "POST",
      dataType: "text",
      data: {
        "case_id"    : caseId,
        "message"    : message
      },
    }).done(function(res) {
      // 確認ボタンのdisabled化
      $('.only_once_button').attr('disabled', true);
      // 送信が成功したら送信完了画面に移動
      window.location.href = '/e-contract-api/sent';
    }).fail(function(res) {
    });
  }

  // 戻るボタン押下時
  function returnInput() {
    var query = window.location.search.replace("?id=", "");
    window.location.href = '/e-contract-api/inputs?id=' + query;
  }

</script>

{/literal}

<!-- メインコンテンツ[start] -->
<div id="mi_main_contents">
  <!-- トップナビ start -->
  <div id="mi_top_nav" class="acount_manage_on">
    <div class="mi_content_title mi_mgn-left40">
      <span class="icon-folder mi_content_title_icon"></span>
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
        <img src="/img/send_contract_3.png">
      </div>
      <!-- ステップエリア end -->

      <!-- タイトル表示エリア begin -->
      <div class="e_contract_title_area">
        <h2>3.内容確認</h2>
        <p>
          下記内容でよろしければ「送信」をクリックしてください。<br>
          入力した宛先に下記の電子契約書が送付されます。
        </p>
      </div>
      <!-- タイトル表示エリア end -->

      <!-- 契約書情報エリア begin -->
      <div class="form_setting_file_area">
        <p class="form_setting_label">契約書設定</p>
        <table class="form_setting_table">
          <tr>
            <th class="form_setting_table_label">テンプレート名</th>
            <td class="form_setting_table_item">{$document.name}</td>
          </tr>
          {if $case.have_amount == 1}
            <tr>
              <th class="form_setting_table_label">契約金額の有無</th>
              <td class="form_setting_table_item">あり</td>
            </tr>
            <tr>
              <th class="form_setting_table_label">契約金額</th>
              <td class="form_setting_table_item">{$case.amount} 円</td>
            </tr>
          {else}
            <tr>
              <th class="form_setting_table_label">契約金額の有無</th>
              <td class="form_setting_table_item">なし</td>
            </tr>
          {/if}
          <tr>
            <th class="form_setting_table_label">合意日</th>
            <td class="form_setting_table_item">{$case.agreement_date|date_format:"%Y/%m/%d"}</td>
          </tr>
          <tr>
            <th class="form_setting_table_label">期間</th>
            <td class="form_setting_table_item_date">
              <div class="form_setting_table_date">
                <span>発効日</span>{$case.effective_date|date_format:"%Y/%m/%d"}
              </div>
              <div class="form_setting_table_date">
                <span>終了日</span>{$case.expire_date|date_format:"%Y/%m/%d"}
              </div>
            </td>
          </tr>
          <tr>
            <th class="form_setting_table_label">契約自動更新の有無</th>
            {if $case.auto_renewal == 1}
              <td class="form_setting_table_item">あり</td>
            {else}
              <td class="form_setting_table_item">なし</td>
            {/if}
          </tr>
          <tr>
            <th class="form_setting_table_label">承認方法</th>
            {if $case.approval_method == 1}
              <td class="form_setting_table_item">二要素認証</td>
            {else}
              <td class="form_setting_table_item">通常</td>
            {/if}
          </tr>
          <tr>
            <th class="form_setting_table_label">任意の管理番号</th>
            <td class="form_setting_table_item">{$case.management_number}</td>
          </tr>
          <tr>
            <th class="form_setting_table_label">任意のコメント</th>
            <td class="form_setting_table_item">{$case.comment}</td>
          </tr>
        </table>
      </div>
      <!-- 契約書情報エリア end -->

      <!-- ファイル表示エリア begin -->
      <div class="form_setting_file_area">
        <!-- <p class="form_setting_label">契約書 {$fileList|@count}件</p> -->
        <div>
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
              <img src="/cmn-e-contract/{if $row|@count > 0}{$row[0].filename}{/if}" alt="資料画像" class="documentId" id="{$fileList[$smarty.foreach.loop.index].id}">
              {foreach from=$formList[$smarty.foreach.loop.index] item=form}
                {if $form.type == 'text'}
                  <div id="{$form.id}" class="form_setting_parts_text_dammy_confirm form_setting_parts" data-page="{$form.page}" style="position: absolute; top: {$form.y}px; left: {$form.x}px;">
                    {if $form.target == 'self'}
                      <div class="parts_inner_text_dammy" style="width: {$form.width}px; height: {$form.height}px; font-size: {$form.font_size}px">{$form.value}</div>
                    {else}
                      <div class="parts_inner_text_dammy" style="width: {$form.width}px; height: {$form.height}px;"></div>
                    {/if}

                    <div class="form_setting_partner_select_confirm">
                      <p class="form_setting_partner_select_label">入力者</p>
                      <div class="partner_select_confirm">
                        {if $form.target == 'self'}
                          {$user.header_username}
                        {else}
                          {$form.lastname}{$form.firstname}
                        {/if}
                      </div>
                    </div>
                  </div>
                {elseif $form.type == 'textarea'}
                  <div id="{$form.id}" class="form_setting_parts_textarea_dammy_confirm form_setting_parts" data-page="{$form.page}" style="position: absolute; top: {$form.y}px; left: {$form.x}px;">
                    {if $form.target == 'self'}
                      <div class="parts_inner_textarea_dammy" style="width: {$form.width}px; height: {$form.height}px; font-size: {$form.font_size}px;">{$form.value|nl2br}</div>
                    {else}
                      <div class="parts_inner_textarea_dammy" style="width: {$form.width}px; height: {$form.height}px;"></div>
                    {/if}

                    <div class="form_setting_partner_select_confirm">
                      <p class="form_setting_partner_select_label">入力者</p>
                      <div class="partner_select_confirm">
                        {if $form.target == 'self'}
                          {$user.header_username}
                        {else}
                          {$form.lastname}{$form.firstname}
                        {/if}
                      </div>
                    </div>
                  </div>
                {elseif $form.type == 'sign'}
                  <div id="{$form.id}" class="form_setting_parts_sign_dammy_confirm form_setting_parts" data-page="{$form.page}" style="position: absolute; top: {$form.y}px; left: {$form.x}px;">
                    {if $form.target == 'self'}
                      <img style="position: absolute; top: 6px; left: 6px; width: {$form.width}px; height: {$form.height}px; border: none; z-index: 100;" src="data:image/png;base64, {$form.img_data}">
                    {/if}
                    <div class="parts_inner_sign_dammy" style="position: absolute; top: 6px; left: 6px; width: {$form.width}px; height: {$form.height}px;"></div>

                    <div class="form_setting_partner_select_confirm sign">
                      <p class="form_setting_partner_select_label">入力者</p>
                      <div class="partner_select_confirm">
                        {if $form.target == 'self'}
                          {$user.header_username}
                        {else}
                          {$form.lastname}{$form.firstname}
                        {/if}
                      </div>
                    </div>
                  </div>
                {elseif $form.type == 'checkbox'}
                  <div id="{$form.id}" class="form_setting_parts_checkbox_dammy_confirm form_setting_parts" data-page="{$form.page}" style="position: absolute; top: {$form.y}px; left: {$form.x}px;">
                    {if $form.target == 'self'}
                      <img style="position: absolute; top: 10px; left: 14px; width: {$form.width}px; height: {$form.height}px; z-index: 100;" src="data:image/png;base64, {$form.img_data}">
                    {/if}
                    <div class="parts_inner_checkbox_dammy" style="position: absolute; top: 9px; left: 14px; width: {$form.width}px; height: {$form.height}px;"></div>

                    <div class="form_setting_partner_select_confirm checkbox">
                      <p class="form_setting_partsner_select_label">入力者</p>
                      <div class="partner_select_confirm">
                        {if $form.target == 'self'}
                          {$user.header_username}
                        {else}
                          {$form.lastname}{$form.firstname}
                        {/if}
                      </div>
                      {if $form.required == 'true'}
                        <input type="checkbox" checked="checked" disabled="disabled">
                      {else}
                        <input type="checkbox" disabled="disabled">
                      {/if}
                      <label>入力を必須にする</label>
                    </div>
                  </div>
                {/if}
              {/foreach}
            </div>
          </div>
        </div>
      {/foreach}
      <!-- 契約書エリア begin -->

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
          </div>
        {/foreach}
      </div>
      <!-- 契約者エリア begin -->

      <!-- メッセージエリア begin -->
      <div class="form_setting_message_area">
        <p class="form_setting_partner_description">電子契約書の送付メールにメッセージを挿入したい場合は、下記に入力してください。</p>
        <textarea id="message" class="form_setting_partner_textarea" placeholder="入力してください。"></textarea>
      </div>
      <!-- メッセージエリア end -->

      <!-- ボタンエリア begin -->
      <div class="button-wrapper">
        <div class="return-button-box">
          <p>戻る</p>
          <a href="javascript:void(0)" onClick="returnInput();"></a>
        </div>
        <div class="signup-button-box">
          <button id="submit_button" class="only_once_button">送信</button>
        </div>
      </div>
      <!-- ボタンエリア end -->

    </div>
    <!-- コンテンツ end -->

  </div>
  <!-- コンテンツエリア end -->

</div>
<!-- メインコンテンツ[end] -->



{include file="./common/footer.tpl"}

{literal}
<script>
 // 登録ボタン押下時
  $('#submit_button').on('click', function() {
    sendEContract();
  });

</script>
{/literal}