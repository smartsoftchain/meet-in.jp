{include file="./common/header.tpl"}

{literal}

<style>
  #button-box-rejection-id {
    background: #FFE1A0;
  }
</style>

{/literal}

<!-- メインコンテンツ start -->
<div id="mi_main_contents">

  <!-- コンテンツエリア start -->
  <div id="mi_content_area">
    <!-- コンテンツタイトル start -->
    <div class="mi_content_title">
      <span class="icon-folder mi_content_title_icon"></span>
      <h1>電子契約書一覧</h1>
      <div class="mi_flt-r">
        <form id="search_form" action="/e-contract-api/partner-canceled" method="get">
          <div class="search_box">
            <input type="text" name="free_word" value="{$freeWord}" placeholder="検索内容を入力してください...">

            <button class="mi_default_button hvr-fade click-fade">
              <div class="icon-search"></div>
            </button>
            <div class="icon-close search_close_button"></div>
          </div>
        </form>
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

    <div class="table_list_wrap">
      <div class="button_wrap">
        <div class="button-box-confirming" id="button-box-confirming-id">
          <div class="confirming_button">
            <a href="https://{$serverAddress}/e-contract-api/partner-confirming"class="button_text-confirming">確認中　({$confirmingCount}件)</a>
          </div>
        </div>
        <div class="button-box-complete" id="button-box-complete-id">
          <div class="complete_button">
            <a href="https://{$serverAddress}/e-contract-api/partner-completed"class="button_text-complete">完了　({$completedCount}件)</a>
          </div>
        </div>
        <div class="button-box-rejection" id="button-box-rejection-id">
          <div class="rejection_button">
            <a href="https://{$serverAddress}/e-contract-api/partner-canceled"class="button_text-rejection">却下　({$list->getCount()}件)</a>
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
