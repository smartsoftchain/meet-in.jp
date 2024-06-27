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
    cursor: pointer;
    margin-right: 5px;
    margin-left: 12px;
    margin-top: 7px;
    display: block;
    position: relative;
    width: 16px;
    height: 16px;
    border: none;
    border-radius: 50%;
    background: #ffaa00;
}

.tag-delete::before, .tag-delete::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 1.5px;
    height: 13px;
    background: #fff;
}

.tag-delete::before {
    transform: translate(-50%,-50%) rotate(45deg);
}

.tag-delete::after {
    transform: translate(-50%,-50%) rotate(-45deg);
}

.tag_item {
  list-style: none;
}

.tag_item li {
    background-color: #FFF4E0;
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
    margin-bottom: 10px;
}

.tag_button_add {
    color: #FFAA00;
    font-weight: bold;
    text-align: center;
    width: 70px;
    height: 40px;
    line-height: 40px;
    background-color: #fff;
    border: 1px solid #FFAA00;
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
    background-color: #FFAA00;
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
      }
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

        // textが20文字以上の場合は ... とつける
        if (text.length >= 20) {
          displayText = text.substr(0, 17) + '...';
          $('.tag_item').append(
            '<li class="tag_element" title="' + text + '">' + displayText + ' <span class="tag-delete"></span>' + '<input type="hidden" class="tags" name="tags[]" value="' + text + '">' + '</li>'
            );
        } else {
          $('.tag_item').append(
            '<li class="tag_element">' + displayText + ' <span class="tag-delete"></span>' + '<input type="hidden" class="tags" name="tags[]" value="' + text + '">' + '</li>'
            );
        }

        $("#tag_input").val('');
      }
    });

    $(document).on("click", ".tag-delete", function (event) {
      $(this).parent().remove();
    });

    // 契約書ファイル切り替え.
    $('input[name="callup_contract_type"]:radio').on('change', function() {
      if($(this).val() == 1) {
        $("#partner_setting_template_select").show();
        $("#document_drop_area").hide();
      } else {
        $("#partner_setting_template_select").hide();
        $("#document_drop_area").show();
      }
    });
    // 初期状態.
    if($('input:radio[name="callup_contract_type"]:checked').val() != "2") {
      $("#document_drop_area").hide();
    } else {
      $("#partner_setting_template_select").hide();
    }


    var dragdrop = $('#document_drop_area');
    var fileInput = $('#materialfile_drop');
    fileInput.on('change', function() {
      $('#document_drop_help').text('');
      var files = this.files;

      // ファイルバリデーション
      var fileCheck = false;
      Array.prototype.forEach.call(files, function(file, index) {
        if(fileCheck == true) {
          return;
        }

        // 添付ファイル件数.
        if(0 < index) {
          $('#document_drop_help').text('添付ファイルは最大1件です');
          fileInput.val('');
          fileCheck = true;
          return;
        }

        // ファイルサイズチェック
        if(file.size == 0) {
          $('#document_drop_help').text('ファイルサイズは0バイトです');
          fileInput.val('');
          fileCheck = true;
          return;
        }
        if(10000000 < file.size) {
          $('#document_drop_help').text('添付ファイルは最大容量は10Mです');
          fileInput.val('');
          fileCheck = true;
          return;
        }

        // ファイル拡張子チェック
        if(!file.name.toLowerCase().match(/.+\.pdf$/)) {
          $('#document_drop_help').text('アップロード可能ファイルはPDF形式ファイルのみです');
          fileInput.val('');
          fileCheck = true;
          return;
        }
      })
    });

    dragdrop.on("dragenter", function(e){
      e.stopPropagation();
      e.preventDefault();
      $("#document_drop_area").addClass("droppable");
      return false;
    });

    dragdrop.on("dragover", function(e){
      e.stopPropagation();
      e.preventDefault();
      $("#document_drop_area").addClass("droppable");
      return false;
    });

    dragdrop.on("dragleave", function(e){
      e.stopPropagation();
      e.preventDefault();
      $("#document_drop_area").removeClass("droppable");
      return false;
    });

    dragdrop.on("drop", function(_e){
      _e.stopPropagation();
      _e.preventDefault();
      var e = _e;
      if( _e.originalEvent ) {
        e = _e.originalEvent;
      }

      $('#document_drop_help').text('');
      var files = e.dataTransfer.files;

      fileInput[0].files = files;
      $("#document_drop_area").removeClass("droppable");

      // ファイルバリデーション
      var fileCheck = false;
      Array.prototype.forEach.call(files, function(file, index) {
        if(fileCheck == true) {
          return;
        }

        // 添付ファイル件数.
        if(0 < index) {
          $('#document_drop_help').text('添付ファイルは最大1件です');
          fileInput.val('');
          fileCheck = true;
          return;
        }

        // ファイルサイズチェック
        if(file.size == 0) {
          $('#document_drop_help').text('ファイルサイズは0バイトです');
          fileInput.val('');
          fileCheck = true;
          return;
        }
        if(10000000 < file.size) {
          $('#document_drop_help').text('添付ファイルは最大容量は10Mです');
          fileInput.val('');
          fileCheck = true;
          return;
        }

        // ファイル拡張子チェック
        if(!file.name.toLowerCase().match(/.+\.pdf$/)) {
          $('#document_drop_help').text('アップロード可能ファイルはPDF形式ファイルのみです');
          fileInput.val('');
          fileCheck = true;
          return;
        }
      })
      return false;
    });



    // 契約金額表示
    if($('input[name="have_amount"]:checked').val() == '0') {
      $('#amount_row').hide();
    }
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


    // 追加ボタンをクリックしてパートナーフォームを追加する
    $('#partner-add').on('click', function() {
      makePartnerItem($('.partner_setting_item').length + 1);
    });


    // 承認順を上げる
    $(document).on('click', '#approval_up', function() {
      var inputArea = $(this).parents('.partner_setting_input_area');
      var lastName = inputArea.find('input[name="lastname[]"]').val();
      var firstName = inputArea.find('input[name="firstname[]"]').val();
      var organizationName = inputArea.find('input[name="organization_name[]"]').val();
      var title = inputArea.find('input[name="title[]"]').val();
      var email = inputArea.find('input[name="email[]"]').val();

      var preArea = $(this).parents('.partner_setting_item').prev();
      var preLastName = preArea.find('input[name="lastname[]"]').val();
      var preFirstName = preArea.find('input[name="firstname[]"]').val();
      var preOrganizationName = preArea.find('input[name="organization_name[]"]').val();
      var preTitle = preArea.find('input[name="title[]"]').val();
      var preEmail = preArea.find('input[name="email[]"]').val();

      inputArea.find('input[name="lastname[]"]').val(preLastName);
      inputArea.find('input[name="firstname[]"]').val(preFirstName);
      inputArea.find('input[name="organization_name[]"]').val(preOrganizationName);
      inputArea.find('input[name="title[]"]').val(preTitle);
      inputArea.find('input[name="email[]"]').val(preEmail);

      preArea.find('input[name="lastname[]"]').val(lastName);
      preArea.find('input[name="firstname[]"]').val(firstName);
      preArea.find('input[name="organization_name[]"]').val(organizationName);
      preArea.find('input[name="title[]"]').val(title);
      preArea.find('input[name="email[]"]').val(email);
    });

    // 承認順を下げる
    $(document).on('click', '#approval_down', function() {
      var areaCount = $('.partner_setting_item').length;
      var areaIndex = $(this).parents('.partner_setting_item').index();
      if(areaCount == areaIndex + 1) {
        return false;
      }

      var inputArea = $(this).parents('.partner_setting_input_area');
      var lastName = inputArea.find('input[name="lastname[]"]').val();
      var firstName = inputArea.find('input[name="firstname[]"]').val();
      var organizationName = inputArea.find('input[name="organization_name[]"]').val();
      var title = inputArea.find('input[name="title[]"]').val();
      var email = inputArea.find('input[name="email[]"]').val();

      var nextArea = $(this).parents('.partner_setting_item').next();
      var nextLastName = nextArea.find('input[name="lastname[]"]').val();
      var nextFirstName = nextArea.find('input[name="firstname[]"]').val();
      var nextOrganizationName = nextArea.find('input[name="organization_name[]"]').val();
      var nextTitle = nextArea.find('input[name="title[]"]').val();
      var nextEmail = nextArea.find('input[name="email[]"]').val();

      inputArea.find('input[name="lastname[]"]').val(nextLastName);
      inputArea.find('input[name="firstname[]"]').val(nextFirstName);
      inputArea.find('input[name="organization_name[]"]').val(nextOrganizationName);
      inputArea.find('input[name="title[]"]').val(nextTitle);
      inputArea.find('input[name="email[]"]').val(nextEmail);

      nextArea.find('input[name="lastname[]"]').val(lastName);
      nextArea.find('input[name="firstname[]"]').val(firstName);
      nextArea.find('input[name="organization_name[]"]').val(organizationName);
      nextArea.find('input[name="title[]"]').val(title);
      nextArea.find('input[name="email[]"]').val(email);
    });

    // バツボタンをクリックしてパートナーフォームを削除する
    $(document).on('click', '#partner-remove', function() {
      $(this).parents('.partner_setting_item').remove();
    });

    // 必須項目バリデーション
    $('#submit_button').on('click', function() {
      $('.form_setting_error').remove();
      var errorCount = 0;
      var caseTitle = $('#case_title').val();
      var eContractDocumentId = $('#e_contract_document_id').val();
      var callupContractType = $('input:radio[name="callup_contract_type"]:checked').val();

      if(caseTitle ==  '') {
        $('.e_contract_title_area').append('<div class="form_setting_error">契約書タイトル 空欄に入力してください</div>');
        errorCount++;
      }
      if(callupContractType == "1" && eContractDocumentId == null) {
        $('.e_contract_title_area').append('<div class="form_setting_error">契約書ファイル テンプレートを選択してください</div>');
        errorCount++;
      }
      if(callupContractType == "2" && $('#materialfile_drop').get(0).files.length == 0) {
        $('.e_contract_title_area').append('<div class="form_setting_error">契約書ファイル 契約書のPDFファイルを設定してください</div>');
        errorCount++;
      }


      if($(".partner_setting_item").length < 1) {
        $('.e_contract_title_area').append('<div class="form_setting_error">宛先の追加ボタンを押し、宛名を入力してください</div>');
        errorCount++;
        return false;
      } else {
  
        $.ajax({
          url: "/e-contract-api/has-admin-check",
          type: "POST",
          dataType: "json",
          data: {
            "staff_role" : $('#staff_role').val(),
            "email" : $('.email').eq(0).val(),
          },
          async : false,
        }).done(function(res) {
          if (res.count == 0) {
            $('.e_contract_title_area').append('<div class="form_setting_error">宛先の１人目に管理者を含めてください</div>');
            errorCount++;

          }
        }).fail(function(res) {
        });

        $('.lastname').each(function(){
          if($(this).val() == '') {
            $('.e_contract_title_area').append('<div class="form_setting_error">宛先の氏名[苗字]空欄に入力してください</div>');
            errorCount++;
            return false;
          }
        });
        $('.firstname').each(function(){
          if($(this).val() == '') {
            $('.e_contract_title_area').append('<div class="form_setting_error">宛先の氏名[名前]空欄に入力してください</div>');
            errorCount++;
            return false;
          }
        });
        $('.email').each(function(){
          if($(this).val() == '') {
            $('.e_contract_title_area').append('<div class="form_setting_error">宛先のメールアドレス　空欄に入力してください</div>');
            errorCount++;
            return false;
          }
        });

      }


      if(errorCount != 0) {
        $("html,body").animate({scrollTop:0}, 700);
        return false;
      }　else {
        $('.setting_message').css('visibility', 'visible');
      }
    });

    // ボタン１回押下でdisabledにする処理
    $('#template_setting_form').submit(function() {
      $('.only_once_button').attr('disabled', true);
    });

    let e_contract_document_id_element = ':input[name="e_contract_document_id"]';
    $(e_contract_document_id_element).change(function(){
        getAddressList($(e_contract_document_id_element).val());
    });

    function getAddressList(e_contract_document_id) {
      $.ajax({
        url: "/e-contract-api/get-address-list",
        type: "POST",
        dataType: "json",
        data: {
          "id" : e_contract_document_id,
        },
        beforeSend: function(){
        }
      }).done(function(result) {
        $('#partner-area').empty();
        if(result.length==0){
          makePartnerItem(1);
        }
        $.each(result, function(index, data){
          makePartnerItem(index+1, data);
        })
        return false;
      }).fail(function() {
      });
    }


  });


  function makePartnerItem(i, data){
    let firstname = "";
    let lastname = "";
    let organization_name = "";
    let title = "";
    let email = "";
    if(data!=undefined) {
      firstname = data.firstname;
      lastname = data.lastname;
      organization_name = data.organization_name;
      title = data.title;
      email = data.email;
    }

    $('#partner-area').append('<div class="partner_setting_item"><div class="partner_setting_item_header"><p><span class="icon-parsonal"></span><span class="partner_setting_item_count">' + i + '人目</span>：' + i + '番目に契約書にサインを行う人</p><div id="partner-remove" class="partner_setting_item_remove">×</div></div><div class="partner_setting_input_area"><div class="partner_setting_input_row"><label>氏名<span class="require">必須</span></label><input type="text" name="lastname[]" class="partner_setting_input_name lastname" placeholder="田中" value="'+lastname+'"><input type="text" name="firstname[]" class="partner_setting_input_name firstname" placeholder="太郎" value="'+firstname+'"></div><div class="partner_setting_input_row"><label>企業名</label><input type="text" name="organization_name[]" placeholder="入力してください" value="'+organization_name+'" class="partner_setting_input"></div><div class="partner_setting_input_row"><label>役職</label><input type="text" name="title[]" placeholder="入力してください" value="'+title+'" class="partner_setting_input"></div><div class="partner_setting_input_row"><label>メールアドレス<span class="require">必須</span></label><input type="email" name="email[]" placeholder="aaaaa@aaaaa.jp" value="'+email+'" class="partner_setting_input email"></div><div class="partner_setting_item_lifting"><p class="partner_setting_item_lifting_label">承認順の変更</p><div class="partner_setting_item_lifting_btnarea"><div id="approval_down" class="partner_setting_item_lifting_btn">▼</div><div id="approval_up" class="partner_setting_item_lifting_btn">▲</div></div></div></div></div>');
  }


</script>

<style>
table {
  table-layout: fixed;
}

th.partner_setting_table_label{
  width:158px;
}

  #document_drop_area{
		padding: 30px;
		border: 1px dashed #666;
		border-radius: 4px;
    width: 396px;
    box-sizing: border-box;
  }

  #document_drop_area.droppable {
    background-color: #ffe1a0;
    opacity: 0.7;
  }

  #document_drop_label{
    height: auto;
    line-height: 20px;
    color: #666666;
  }

  .partner_setting_template_select {
    width: 396px;
  }

  #materialfile_drop {
    height: 35px;
    margin-top: 10px;
  }

  p#document_drop_help {
    color: #F44;
    margin-bottom: 15px;
  }

  .return-button-box{
    width:200px;
    height:50px;
    background: #A2A2A2 0% 0% no-repeat padding-box;
    border-radius: 4px;
    border:none;  
    text-align: center;
    font: normal normal normal 16px/27px Hiragino Sans;
    color:#ffffff;
    margin-right: 22px;
    line-height: 50px;
    margin-left: 220px;
  }

  #submit_button.mi_default_button{
    width:200px;
    height:50px;
    border-radius: 4px;
    background: #FFFFFF 0% 0% no-repeat padding-box;
    border: 1px solid #FFAA00;
    color: #FFAA00;
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
        <img src="/img/send_contract_1.png">
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
        <h2>1.契約書・宛先の設定</h2>
        <p>
          契約を交わす相手の情報を入力し、契約書にサインを行う順番を設定してください。<br>
          サインをする順番は、詳細情報パネルをドラッグ&ドロップで移動するか、位置変更ボタンをクリックしてください。
        </p>
      </div>
      <!-- タイトル表示エリア end -->

      <!-- フォームエリア begin -->
      <div class="partner_setting_form_area">
        <form id="template_setting_form" class="/e-contract-api/partners" method="post" enctype="multipart/form-data">
          <table class="partner_setting_table">
            <tbody>
              <tr class="partner_setting_template_row">
                <th class="partner_setting_table_label">契約書タイトル<span class="require">必須</span></th>
                <td>
                  <input type="text" name="case_title" id="case_title" placeholder="契約書名" class="partner_setting_title_input" value="{$case.case_title|escape}">
                </td>
              </tr>
              <tr class="partner_setting_template_row">
                <th class="partner_setting_table_label">契約書ファイル<span class="require">必須</span></th>
                <td>
                  <div>
                    <label><input type="radio" id="callup_contract_type" name="callup_contract_type" value="1" class="e_contract_info_radio" checked="checked"/> テンプレートから書類を設定する</label>
                  </div>
                  <div class="partner_setting_template_select" id="partner_setting_template_select">
                    <select name="e_contract_document_id" id="e_contract_document_id">
                      <option value='' disabled selected style='display:none;'>選択してください</option>
                      {foreach from=$documentList item=row}
                        <option value="{$row.id}" {if $row.id == $case.e_contract_document_id}selected{/if}>{$row.name}</option>
                      {/foreach}
                    </select>
                  </div>
                  <div>
                    <label><input type="radio" id="callup_contract_type" name="callup_contract_type" value="2" class="e_contract_info_radio" /> 新しく書類（PDF)をアップロードして設定する</label>
                  </div>

                  <div id="document_drop_area" {if $browser == "Edge"}style="border: none;"{/if}>
                    <p id="document_drop_label">{if $browser != "Edge"}契約書をドラッグ&ドロップしてください{/if}</p>
                    <input type="file" value="ファイルを選択" name="material_file[]" id="materialfile_drop">
                  </div>
                  <p id="document_drop_help"></p>
                </td>
              </tr>
              <tr class="partner_setting_template_row">
                <th class="partner_setting_table_label">契約金額の有無</th>
                <td>
                  <label class="my-radio">
                  <input type="radio" name="have_amount"  value="1" {if $case.have_amount == 1}checked="checked"{/if} />あり</label>
                  <input type="radio" name="have_amount"  value="0" {if $case.have_amount == 0}checked="checked"{/if} />なし
                </td>
              </tr>
              <tr class="partner_setting_template_row" id="amount_row">
                <th class="partner_setting_table_label">契約金額</th>
                <td>
                  <input id="amount" type="number" name="amount" placeholder="入力してください" class="partner_setting_title_input" value="{$case.amount|escape}"> 円
                </td>
              </tr>
              <tr class="partner_setting_template_row">
                <th class="partner_setting_table_label">合意日</th>
                <td>
                  <input type="date" name="agreement_date" value="{$case.agreement_date|escape}" />
                </td>
              </tr>
              <tr class="partner_setting_template_row">
                <th class="partner_setting_table_label">期間</th>
                <td class="partner_setting_table_date">
                  <div class="partner_setting_table_date_item">
                    <span>発効日</span>
                    <input type="date" name="effective_date" value="{$case.effective_date|escape}" class="partner_setting_table_date_item" />
                  </div>
                  <div>
                    <span>終了日</span>
                    <input type="date" name="expire_date" value="{$case.expire_date|escape}" class="partner_setting_table_date_item" />
                  </div>
                </td>
              </tr>
              <tr class="partner_setting_template_row">
                <th class="partner_setting_table_label">契約自動更新の有無</th>
                <td>
                  <input type="radio" name="auto_renewal" value="1" {if $case.auto_renewal == 1}checked="checked"{/if} /> あり
                  <input type="radio" name="auto_renewal" value="0" {if $case.auto_renewal == 0}checked="checked"{/if} /> なし
                </td>
              </tr>
              <tr class="partner_setting_template_row">
                <th class="partner_setting_table_label">承認方法</th>
                <td>
                  {if $user.staff_authenticate_flg == 1}
                    {if $user.two_factor_authenticate_flg == 1}
                      二要素認証
                      <input type="hidden" name="approval_method" value="1">
                    {else}
                      <label><input type="radio" name="approval_method" value="0" checked>通常</label>
                      <label><input type="radio" name="approval_method" value="1" >二要素認証</label>
                    {/if}
                  {else}
                    通常
                    <input type="hidden" name="approval_method" value="0">
                  {/if}
                </td>
              </tr>
              <tr class="partner_setting_template_row">
                <th class="partner_setting_table_label">任意の管理番号</th>
                <td>
                  <input type="text" name="management_number" placeholder="入力してください" class="partner_setting_title_input" value="{$case.management_number|escape}">
                </td>
              </tr>
              <tr class="partner_setting_template_row">
                <th class="partner_setting_table_label">任意のコメント</th>
                <td>
                  <input type="text" name="comment" placeholder="入力してください" class="partner_setting_title_input" value="{$case.comment|escape}">
                </td>
              </tr>
              <tr class="partner_setting_template_row">
                <th class="partner_setting_table_label">タグ</th>
                <td>
                  <div style="display:flex">
                    <input type="text" name="tag_input" placeholder="入力してください" class="partner_setting_title_input" id="tag_input">
                    <div id="tag-add" class="tag_button_add">追加</div>
                  </div>
                  <ul class="tag_item">
                    {foreach from=$tags item=tag}
                      {if $tag|mb_strlen > 20}
                        <li class="tag_element" title="{ $tag }">{$tag|mb_strimwidth:0:20:"..."}<span class="tag-delete"></span><input type="hidden" class="tags" name="tags[]" value="{ $tag }"></li>
                      {else}
                        <li class="tag_element">{ $tag }<span class="tag-delete"></span><input type="hidden" class="tags" name="tags[]" value="{ $tag }"></li>
                      {/if}
                    {/foreach}
                  </ul>
                </td>
              </tr>
              <tr class="partner_setting_partner_row">
                <th class="partner_setting_table_label_partner">宛先</th>
                <td>

                    {if $smarty.session.user.staff_role == 'CE_2'}
                    <font color="red">宛先には管理者を最低1名含めてください</font>
                    {/if}

                    <input type="hidden" id="staff_role" value="{$smarty.session.user.staff_role}">
                    <div id="partner-area">

                  {if $partnerList}

                    {foreach from=$partnerList key=i item=row name=partner}
                      <div class="partner_setting_item">
                        <div class="partner_setting_item_header">
                          <p><span class="icon-parsonal"></span><span class="partner_setting_item_count">{$smarty.foreach.partner.iteration}人目</span>：{$smarty.foreach.partner.iteration}番目に契約書にサインを行う人</p>
                          {if $i != 0}
                            <div id="partner-remove" class="partner_setting_item_remove">×</div>
                          {/if}
                        </div>
                        <div class="partner_setting_input_area">
                          <div class="partner_setting_input_row">
                          <div>
                            <label>氏名<span class="require">必須</span></label>
                            <input type="text" name="lastname[]" class="partner_setting_input_name lastname" placeholder="田中" value="{$row.lastname|escape}"><input type="text" name="firstname[]" class="partner_setting_input_name firstname" placeholder="太郎" value="{$row.firstname|escape}">
                          </div>
                          <div class="partner_setting_input_row">
                            <label>企業名</label>
                            <input type="text" name="organization_name[]" placeholder="入力してください" class="partner_setting_input" value="{$row.organization_name|escape}">
                          </div>
                          <div class="partner_setting_input_row">
                            <label>役職</label>
                            <input type="text" name="title[]" placeholder="入力してください" class="partner_setting_input" value="{$row.title|escape}">
                          </div>
                          <div class="partner_setting_input_row">
                            <label>メールアドレス<span class="require">必須</span></label>
                            <input type="email" name="email[]" placeholder="aaaaa@aaaaa.jp" class="partner_setting_input email" value="{$row.email|escape}">
                          </div>
                          </div>
                          {if $i != 0}
                            <div class="partner_setting_item_lifting">
                              <p class="partner_setting_item_lifting_label">承認順の変更</p>
                              <div class="partner_setting_item_lifting_btnarea">
                                <div id="approval_down" class="partner_setting_item_lifting_btn">▼</div>
                                <div id="approval_up" class="partner_setting_item_lifting_btn">▲</div>
                              </div>
                            </div>
                          {/if}
                        </div>
                      </div>
                    {/foreach}
                  {else}

                    <div class="partner_setting_item">
                      <div class="partner_setting_item_header">
                        <p><span class="icon-parsonal"></span><span class="partner_setting_item_count">1人目</span>：1番目に契約書にサインを行う人</p>
                      </div>
                      <div class="partner_setting_input_area">
                        <div class="partner_setting_input_row">
                          <label>氏名<span class="require">必須</span></label>
                          <input type="text" name="lastname[]" class="partner_setting_input_name lastname" placeholder="田中"><input type="text" name="firstname[]" class="partner_setting_input_name firstname" placeholder="太郎">
                        </div>
                        <div class="partner_setting_input_row">
                          <label>企業名</label>
                          <input type="text" name="organization_name[]" placeholder="入力してください" class="partner_setting_input">
                        </div>
                        <div class="partner_setting_input_row">
                          <label>役職</label>
                          <input type="text" name="title[]" placeholder="入力してください" class="partner_setting_input">
                        </div>
                        <div class="partner_setting_input_row">
                          <label>メールアドレス<span class="require">必須</span></label>
                          <input type="email" name="email[]" placeholder="aaaaa@aaaaa.jp" class="partner_setting_input email">
                        </div>
                      </div>
                    </div>
                  {/if}
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
          <div class="button-wrapper">
            <div class="return-button-box">
              <p>戻る</p>
              <a href="javascript:void(0)" onClick="returnConfirming();"></a>
            </div>
            <button type="submit" name="submit_button" id="submit_button" class="mi_default_button only_once_button">入力者設定へ</button>
          </div>
          <p class="setting_message">※設定中です。しばらくお待ちください。</p>

          <!-- データエリア begin -->
          <input type="hidden" name="client_id" value="{$user.client_id|escape}" />
          <input type="hidden" name="staff_type" value="{$user.staff_type|escape}" />
          <input type="hidden" name="staff_id" value="{$user.staff_id|escape}" />
          <input type="hidden" name="staff_authenticate_flg" value="{$user.staff_authenticate_flg|escape}" />
          <!-- データエリア end -->

        </form>
      </div>
      <!-- フォームエリア begin -->

    </div>
    <!-- コンテンツ end -->

  </div>
  <!-- コンテンツエリア end -->

</div>
<!-- メインコンテンツ[end] -->



{include file="./common/footer.tpl"}
