{include file="./common/header.tpl"}

{literal}

<style>
  #button-box-rejection-id {
    background: #FFE1A0;
  }

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
  }
</style>

<script>

  $(function() {
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

  });

  $(function() {

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

  });

  //電子契約送信ボタン押下時
  function sentContract() {
    // クレデンシャル発行と印影設定、証明書発行がされているかチェックする
    $.ajax({
      url: "/e-contract-api/check-credential",
      type: "GET",
      dataType: "text",
    }).done(function(res) {
      res = jQuery.parseJSON(res);
      if(res.is_e_conteact_credential == 0) {
        // クレデンシャルが未発行の場合
        $('.form_setting_error').remove();
        $('.error_message').append('<div class="form_setting_error">クレデンシャル発行をしてください</div>');
        return false;
      } else if(res.is_e_conteact_sign_image == 0) {
        // 印影未作成の場合
        $('.form_setting_error').remove();
        $('.error_message').append('<div class="form_setting_error">印影画像の作成・設定をしてください</div>');
        return false;
      } else if(res.is_e_conteact_certificate == 0) {
        // 電子証明書が未発行の場合
        $('.form_setting_error').remove();
        $('.error_message').append('<div class="form_setting_error">電子証明書が付与されていません</div>');
        return false;
      } else {
        window.location.href = '/e-contract-api/partners';
      }
    }).fail(function(res) {
    });
  }

</script>

{/literal}

<!-- メインコンテンツ start -->
<div id="mi_main_contents">

  <!-- トップナビ start -->
  <div id="mi_top_nav">
    <!-- パンくずリスト start -->
    <div class="mi_breadcrumb_list">
      <a href="/index/menu">TOP</a>&nbsp;&gt;&nbsp;
      <a href="/e-contract-api/canceled">電子契約書一覧</a>
    </div>
    <!-- パンくずリスト end -->
  </div>
  <!-- トップナビ end -->

  <!-- コンテンツエリア start -->
  <div id="mi_content_area">
    <!-- コンテンツタイトル start -->
    <div class="mi_content_title">
      <span class="icon-folder mi_content_title_icon"></span>
      <h1>電子契約書一覧</h1>
      <div class="mi_flt-r">
        <div class="mi_content_title_option">
          {* {if ($user.staff_role == "AA_1" || $user.staff_role == "AA_2" || $user.staff_role == "CE_1" || $user.is_e_contract_api_exception_auth_ce1_on_ce2 )}
          <a href="javascript:void(0);" name="del_chk" class="mi_title_action_btn del_chk click-fade" id="del_chk">
            <span class="icon-delete"></span>
            <span>削除</span>
          </a>
          {/if} *}
          <a href="javascript:void(0)" onClick="sentContract();" class="mi_title_action_link">電子契約書送信</a>
          <div class="mi_flt-r" style="display:flex">
            <form id="search_form_tag" action="/e-contract-api/canceled" method="get">
              <!-- TODO AHD-1935 -->
              <div class="search_box">
                <input type="text" id="tag_input" name="tag" value="{$tag}">

                <button class="mi_default_button hvr-fade click-fade" data-class="search_box">
                  <div class="icon-tag"></div>
                </button>
                <div class="icon-close search_close_button"></div>
              </div>
           </form>
            <form id="search_form" action="/e-contract-api/canceled" method="get">
              <div class="search_box">
                <input type="text" name="free_word" value="{$freeWord}">

                <button class="mi_default_button hvr-fade click-fade" data-class="search_box">
                  <div class="icon-search"></div>
                </button>
                <div class="icon-close search_close_button"></div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    <!-- コンテンツタイトル end -->

    <!-- ページネーション start -->
    <div class="mi_pagenation">
      <div class="mi_pagenation_result mi_flt-r">該当件数 <span>{$list->getCount()}</span>件</div>
      {$list->getLink()}
      {$list->getPerPage()}
    </div>
    <!-- ページネーション end -->

    <!-- エラーメッセージ表示エリア begin -->
    <div class="error_message">
    </div>
    <!-- エラーメッセージ表示エリア end -->

    <div class="table_list_wrap">
      <div class="button_wrap">
        <div class="button-box-confirming" id="button-box-confirming-id">
          <div class="confirming_button">
            <a href="https://{$serverAddress}/e-contract-api/confirming"class="button_text-confirming">確認中　({$confirmingCount}件)</a>
          </div>
        </div>
        <div class="button-box-complete" id="button-box-complete-id">
          <div class="complete_button">
            <a href="https://{$serverAddress}/e-contract-api/completed"class="button_text-complete">完了　({$completedCount}件)</a>
          </div>
        </div>
        <div class="button-box-rejection" id="button-box-rejection-id">
          <div class="rejection_button">
            <a href="https://{$serverAddress}/e-contract-api/canceled"class="button_text-rejection">却下　({$list->getCount()}件)</a>
          </div>
        </div>
      </div>
    </div>

    <!-- テーブル start -->
    <div class="mi_table_main_wrap">
        <table class="mi_table_main document_list">
          <tbody>
          {foreach from=$list->getList() item=row}
            <tr>
              <td class="mi_table_item_1">
                {* <input type="checkbox" name="chk_{$row.id}" value="{$row.id}" id="chk_{$row.id}"> *}
              </td>
              <td class="mi_table_item_2">
                <p class="table-item-name">{$row.case_title}</p>
                <p class="table-item-sign">サイン済み　<span>{$row.approval_count}</span> / <span>{$row.partner_count}</span></p>
                <p class="table-item-update">更新日 / {$row.update_date|date_format:'%Y.%m.%d'}</p>
              </td>
              <td class="mi_table_item_3"></td>
              <td class="mi_table_item_4"></td>
              <td>
                <a href="/e-contract-api/detail?id={$row.id}"><span class="icon-menu-06"></span></a>
              </td>
            </tr>
          {/foreach}
          </tbody>
        </table>
      </div>
    <!-- テーブル end -->
    </div>
  <!-- コンテンツエリア end -->
</div>
<!-- メインコンテンツ end -->

{include file="./common/footer.tpl"}
