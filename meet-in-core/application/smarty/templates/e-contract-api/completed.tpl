{include file="./common/header.tpl"}

{literal}

<style>
  #button-box-complete-id {
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

  .mi_content_title_option span:first-child {
    top: 5px;
  }

  .mi_content_title_option .icon-text {
    top: 24px;
    line-height: 1.2;
    width: 30px;
    left: 50%;
    transform: translateX(-50%);
  }

  .mi_content_title_option .mi_title_action_link {
    margin-left: 10px;
  }

  .button_wrap {
    height: auto;
  }

  .mi_pagenation {
    margin: 24px 0 0 0;
  }

  .table_list_wrap {
    height: auto;
  }

  .table-thead {
    display: flex;
    background: rgba(255, 170, 0, 1) 0% 0% no-repeat padding-box;
    height: 40px;

    color: #fff;
  }

  .select_all_checkbox {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 85px;
    margin-right: 30px;
  }

  table.document_list td:nth-child(1) {
    width: 85px;
  }

  table.document_list td:nth-child(2).mi_table_item_2 {
    width: 570px;
    padding: 0 30px;
  }


  .select_all_textbox {
    line-height: 1;
    font-size: 12px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .select_all_item {
    line-height: 1;
    font-size: 12px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  #file_all_download {
    margin: 0;
  }

  .mi_table_main .mi_table_item_11 {
      width: 55px;
      min-width: 55px;
      padding: 0;
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
</script>
{/literal}


<!-- メインコンテンツ start -->
<div id="mi_main_contents">

  <!-- トップナビ start -->
  <div id="mi_top_nav">
    <!-- パンくずリスト start -->
    <div class="mi_breadcrumb_list">
      <a href="/index/menu">TOP</a>&nbsp;&gt;&nbsp;
      <a href="/e-contract-api/completed">電子契約書一覧</a>
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
          <a class="mi_title_action_btn click-fade" onclick="submit_econtract_downdload()">
            <span class="icon-download" style="font-size: 15px;" ></span>
            <span class="icon-text">ダウンロード</span>
          </a>

          <a href="javascript:void(0)" onClick="sentContract();" class="mi_title_action_link">電子契約書送信</a>
          <div class="mi_flt-r" style="display:flex">
            <form id="search_form_tag" action="/e-contract-api/completed" method="get">
              <!-- TODO AHD-1935 -->
              <div class="search_box">
                <input type="text" id="tag_input" name="tag" value="{$tag}">

                <button class="mi_default_button hvr-fade click-fade" data-class="search_box">
                  <div class="icon-tag"></div>
                </button>
                <div class="icon-close search_close_button"></div>
              </div>
           </form>
            <form id="search_form" action="/e-contract-api/completed" method="get">
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

      <div class="file_count_wrap">
          <div class="mi_pagenation_result mi_flt-r">該当件数 <span>{$list->getCount()}</span>件</div>
      </div>

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
            <a href="https://{$serverAddress}/e-contract-api/completed"class="button_text-complete">完了　({$list->getCount()}件)</a>
          </div>
        </div>
        <div class="button-box-rejection" id="button-box-rejection-id">
          <div class="rejection_button">
            <a href="https://{$serverAddress}/e-contract-api/canceled"class="button_text-rejection">却下　({$canceledCount}件)</a>
          </div>
        </div>
      </div>

      <div class="table-thead">
        <div class="select_all_checkbox">
            <input type="checkbox" onchange="file_all_download();" id="file_all_download">
            <div class="select_all_textbox">全選択</div>
        </div>
        <div class="select_all_item">
          電子契約書タイトル/更新日
        </div>
      </div>


    </div>


    <!-- テーブル start -->
    <div class="mi_table_main_wrap">
        <table class="mi_table_main document_list">
          <tbody>
          {foreach from=$list->getList() item=row}
            <tr>
              <td class="mi_table_item_11">
                <input type="checkbox" name="chk_{$row.id}" value="{$row.id}" onchange="check_download(this);" class="document_ownload_select">
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

{literal}

<script>

const COOKIE_KEY_CHECK_ID_LIST   = "document_ownload_select";
$(function() {

  $(document).on("click", ".mi_table_main td", function () {
    var inputoj = $(this).parents("tr").find(".mi_table_item_11 input");
    if (inputoj.prop("checked")) {
      inputoj.prop("checked", false);
      saveSelectList(setSelectList(loadSelectList(), false, inputoj.val()));
    } else {
      inputoj.prop("checked", true);
      saveSelectList(setSelectList(loadSelectList(), true, inputoj.val()));
    }
  });

  if(null == new URL(window.location.href).searchParams.get('page')) {
    saveSelectList([]);
  }

  var checkList = loadSelectList();
  var countPageView  = 0;
  var coutnPageSelect = 0;
  $("input.document_ownload_select").each(function(index, element){
    if(checkList.indexOf(element.value) > 0) {
      $(element).prop('checked', true);
      coutnPageSelect++;
    }
    countPageView = index+1;
  });
  if(0.6 < (coutnPageSelect / countPageView)){
    $("#file_all_download").prop('checked', true);
  }


});

function loadSelectList() {
  let data = $.cookie(COOKIE_KEY_CHECK_ID_LIST);
  return data == undefined ? [] : data.split(',');
}
function saveSelectList(checkList) {
  $.cookie(COOKIE_KEY_CHECK_ID_LIST, checkList.join(','), {expires:1});
}
function setSelectList(checkList, checked, value) {
  let index = checkList.indexOf(value);
  if(checked && -1 == index) {
    checkList.push(value);
  } else if(!checked && -1 < index) {
    checkList.splice(index, 1);
  }
  return checkList;
}

function check_download(e) {
  saveSelectList(setSelectList(loadSelectList(), e.checked, e.value));
}

function file_all_download() {
  if(document.getElementById("file_all_download").checked){
    $('input.document_ownload_select').prop('checked', true);
  }else{
    $('input.document_ownload_select').prop('checked', false);
  }
  var checkList = loadSelectList();
  [].slice.call(document.querySelectorAll(".document_ownload_select")).map(function(e) {
    checkList = setSelectList(checkList, e.checked, e.value);
  });
  saveSelectList(checkList);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

var is_loading = false;
async function submit_econtract_downdload() {

  if(is_loading) {
    return;
  }

  var checkList = loadSelectList().filter(e=>e!="").join(',');

  if(checkList == "") {
    let title  = 'ダウンロードする電子契約書を選択してください';
    let text   = 'ダウンロードしたい電子契約書にチェックを入れ、<br> 再度ダウンロードボタンをクリックしてください。';
    let option = {z_index:9999};

    makeDefaultAlertDialog(title, text, option);

  } else {
    is_loading = true;
    location.href = "completed-file-download?id="+checkList;
    await sleep(3*1000);
    is_loading = false;
  }
}

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
