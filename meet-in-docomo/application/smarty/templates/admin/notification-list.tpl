{include file="./common/header.tpl"}

{literal}

<script>
  $(function (){

    // お知らせの削除処理
    $("#del_chk").click(function(){
      if(!confirm('チェックされたお知らせを削除します。よろしいですか？')) {
        return;
      }
      var cnt = 0
      for (var i=0 ; i==i ; i++ ) {
        var doc = "del_" + i;
        if ( document.getElementById( doc ) == null ) {
          break;
        }
        if ( document.getElementById( doc ).checked ) {
          var ids = document.getElementById( doc ).value.split("_");
          cnt++;
          // 担当者削除処理を非同期にて行う
          $.ajax({
            url: "/admin/delete-notification",
            type: "POST",
            data: {id : ids[0]},
            //dataType: 'json',
            success: function(result) {
              if(result == 1){
                alert("削除に成功しました");
                location.reload();
              }else{
                alert(result);
                location.reload();
              }
            }
          });
        }
      }
    });

  });

</script>

{/literal}

<!-- メインコンテンツ start -->
<div id="mi_main_contents">

  <!-- トップナビ start -->
  <div id="mi_top_nav" class="acount_manage_on">

    <!-- パンくずリスト start -->
    <div class="mi_breadcrumb_list">
      <a href="/index/menu">TOP</a>&nbsp;&gt;&nbsp;
      <a href="/admin/notification-list">お知らせ管理</a>
    </div>
    <!-- パンくずリスト end -->

  </div>
  <!-- トップナビ end -->

  <!-- コンテンツエリア start -->
  <div id="mi_content_area">

    <!-- コンテンツタイトル start -->
    <div class="mi_content_title">
      <h1><span class="icon-notification mi_content_title_icon"></span>お知らせ一覧</h1>
      <div class="mi_flt-r">
        <div class="mi_content_title_option">
          <a href="/admin/notification-regist" class="mi_title_action_btn click-fade">
            <span class="icon-puls"></span>
            <span>追加</span>
          </a>
          <a href="javascript:void(0);" name="del_chk" class="mi_title_action_btn del_chk click-fade" id="del_chk">
            <span class="icon-delete"></span>
            <span>削除</span>
          </a>
        </div>
      </div>
    </div>
    <!-- コンテンツタイトル end -->

    <!-- ページネーション start -->
    <div class="mi_pagenation">
      <div class="mi_pagenation_result">該当件数 <span>{$list->getCount()}</span>件</div>
      {$list->getLinkParam($pram)}
      {$list->getPerPagePram($pram)}
    </div>
    <!-- ページネーション end -->

    <!-- テーブル start -->
    <div class="mi_table_main_wrap">
      <table class="mi_table_main">
        <thead>
          <tr>
            <th class="mi_table_item_1">選択</th>
            <th class="mi_table_item_1">編集</th>
            <th>{$list->getOrderArrow('タイトル', 'title')}</th>
            <th>{$list->getOrderArrow('投稿日', 'post_date')}</th>
            <th>{$list->getOrderArrow('表示状況', 'display_flg')}</th>
          </tr>
        </thead>
        <tbody>
          {assign var=i value="0" scope="global"}
          {foreach from=$list->getList() item=row}
            <tr>
              <td class="mi_table_item_1">
                <input type="checkbox" id="del_{$i++}" value="{$row.id}">
              </td>
              <td class="mi_edit_icon">
                <a href="/admin/notification-regist?id={$row.id}"><span class="icon-edit"></span></a>
              </td>
              <td>{$row.title}</td>
              <td>{$row.post_date}</td>
              <td>
                {if $row.display_flg == 1}
                  表示
                {else}
                  非表示
                {/if}
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

{include file="./common/footer.tpl"}
