{include file="./common/header.tpl"}

{literal}

<style type="text/css">
.main {
    width: 100%;
    max-width: 800px;
    overflow: auto;
    max-height: calc(100vh - 340px);
    min-height: 200px;
    clear: both;
    background-color: #fff;
    padding: 35px;
    box-sizing: border-box;
}

ul {
    list-style: none;
    padding-left: 5px;
}

.flow_list {
    padding-top: 5px;
}
</style>

{/literal}

<!-- メインコンテンツ start -->
<div id="mi_main_contents">

    <!-- トップナビ start -->
    <div id="mi_top_nav">
        <!-- パンくずリスト start -->
        <div class="mi_breadcrumb_list"><a href="/index/menu">TOP</a>&nbsp;&gt;&nbsp;<a href="/video/error">動画ファイル作成失敗</a></div>
        <!-- パンくずリスト end -->
    </div>
    <!-- トップナビ end -->

    <!-- コンテンツエリア start -->
    <div id="mi_content_area">

        <!-- コンテンツタイトル start -->
        <div class="mi_content_title">
            <span class="icon-connect mi_content_title_icon"></span>
            <h1>動画ファイル作成に失敗しました</h1>
        </div>
        <!-- コンテンツタイトル end -->

        <!-- メイン start -->
        <div class="main">
            <p>
                大変申し訳ありません。<br>
                動画ファイルの作成に失敗しました。<br>
            </p>
            <p>
                以下の手順から一度URLが正しいかご確認いただきますようお願いいたします。
            </p>
            <ul class="flow_list">
                <li>① meet-inにログイン</li>
                <li>② ヘッダーメニュー「履歴」の項目内の「接続履歴一覧」をクリック</li>
                <li>③ 録画をした履歴の詳細をクリック</li>
                <li>④ ダウンロードURLの項目に記載されているURLを確認</li>
            </ul>
        </div>
        <!-- メイン end -->

    </div>
    <!-- コンテンツエリア end -->

</div>
<!-- メインコンテンツ end -->

{include file="./common/footer.tpl"}
