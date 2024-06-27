{include file="./common/header.tpl"}

{literal}

<script>
  $(function (){
    // 削除クリック
    $("[id=del_chk]").click(function() {
      // チェック数分idリスト生成
      var ids = [];
      $("input:checked").each(function() {
        ids.push(this.value);
      });
      if(ids.length == 0) {
        alert('削除対象がありません');
        return;
      }
      if(!confirm('チェックしたテンプレートを削除します。よろしいですか？')) {
        return;
      }
      $.ajax({
        url: "/e-contract-api/delete-document",
        type: "POST",
        dataType: "text",
        data: {
          "document_ids" : ids.join(','),
        },
      }).done(function(res) {
        location.reload(res);
      }).fail(function(res) {
      });
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
      <a href="/e-contract-api/templates">電子契約書テンプレート一覧</a>
    </div>
    <!-- パンくずリスト end -->
  </div>
  <!-- トップナビ end -->

  <!-- コンテンツエリア start -->
  <div id="mi_content_area">
    <!-- コンテンツタイトル start -->
    <div class="mi_content_title">
      <span class="icon-folder mi_content_title_icon"></span>
      <h1>電子契約書テンプレート一覧</h1>
      <div class="mi_flt-r">
        <div class="mi_content_title_option">
          {if ($user.staff_role == "AA_1" || $user.staff_role == "AA_2" || $user.staff_role == "CE_1")}
          <a href="javascript:void(0);" name="del_chk" class="mi_title_action_btn del_chk click-fade" id="del_chk">
            <span class="icon-delete"></span>
            <span>削除</span>
          </a>
          {/if}
          <a href="/e-contract-api/files" class="mi_title_action_link">テンプレート新規作成</a>
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

    <!-- テーブル start -->
    <div class="mi_table_main_wrap">
      <table class="mi_table_main document_list">
        <tbody>
        {foreach from=$list->getList() item=row}
          <tr>
            <td class="mi_table_item_1">
              <input type="checkbox" name="chk_{$row.id}" value="{$row.id}" id="chk_{$row.id}">
            </td>
            <td>
              {if ($row.material_type == 0 || $row.material_type == 1 || $row.material_type == 2)}
                <img src="/cmn-e-contract/{$row.material_filename}" alt="画像" class="mi_document_list_document_icon"/>
              {else}
                <img src="/img/test.jpg" alt="画像" class="mi_document_list_document_icon"/>
              {/if}
            </td>
            <td>
              <h2>{$row.name}</h2>
              <div>更新日 / <span> {$row.update_date}</span></div>
              <div>ファイルサイズ / <span>{$row.convTotalSize}</span></div>
            </td>
            <td></td>
            <td>
              <a href="/e-contract-api/files?id={$row.id}"><span class="icon-menu-06"></span></a>
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
