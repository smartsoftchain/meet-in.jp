{include file="./common/header.tpl"}

{literal}

<style type="text/css">
.main {
    width: 100%;
    max-width: 800px;
    overflow: auto;
    max-height: calc(100vh - 250px);
    min-height: 200px;
    clear: both;
    background-color: #fff;
    padding: 35px;
    box-sizing: border-box;
}

.main div {
    padding-bottom: 18px;
}

ul {
    list-style: none;
    padding-left: 5px;
}

a.download_url {
    color: #1a73e8;
}

.flow_list {
    padding-top: 5px;
}

.reminder {
    color: #df6b6d;
    font-weight: 900;
}

</style>

{/literal}

<!-- メインコンテンツ start -->
<div id="mi_main_contents">

    <!-- トップナビ start -->
    <div id="mi_top_nav">
        <!-- パンくずリスト start -->
        <div class="mi_breadcrumb_list"><a href="/index/menu">TOP</a>&nbsp;&gt;&nbsp;<a href="{$download_url}">録画ファイル作成中</a></div>
        <!-- パンくずリスト end -->
    </div>
    <!-- トップナビ end -->

    <!-- コンテンツエリア start -->
    <div id="mi_content_area">

        <!-- コンテンツタイトル start -->
        <div class="mi_content_title">
            <span class="icon-connect mi_content_title_icon"></span>
            <h1>録画ファイル作成中</h1>
        </div>
        <!-- コンテンツタイトル end -->

        <!-- メイン start -->
        <div class="main">
            <div>
                <p>録画機能をご利用頂きましてありがとうございます。</p>
                <p>ただいま録画ファイルを作成しておりますので、大変恐れ入りますが</p>
                <p>少し時間をおいてから、以下2点をご確認の上、ダウンロードして頂けますと幸いです。</p>
            </div>

            <div>
                <p><b>①録画ファイルの作成が完了したタイミングでご登録アカウントのメールアドレスに送信される通知を参照</b></p>
                <p><b>②以下の手順で、再度、録画ファイルをダウンロード</b></p>
                <p class="reminder">※録画データの保存期間は10日間です。</p>
            </div>

            <div>
                <ul class="flow_list">
                    <li>１．meet inにログイン
                    <li>２．TOP画面のヘッダーメニュー「履歴」⇒「接続履歴一覧」をクリック
                    <li>３．録画をした履歴の詳細をクリック
                    <li>４．録画ダウンロードURLの項目に記載されているURLをクリック
                </ul>
            </div>

            <div>
                <p>
                    ■「録画データ保存先URL」
                </p>
                <p>
                    <a href="{$download_url}" class="download_url line-bottom" target="_blank" rel="noopener noreferrer">{$download_url}</a>
                </p>
            </div>

            <div>
                <p>
                    ※リンクを<strong>数回クリック</strong>しても、別タブで同じ画面が<br>
                    開き続いてしまう場合は、録画ファイルが作成されていない状態でございます。<br>
                </p>
            </div>

            <div>
                <p>お手数お掛けしまして誠に恐れ入りますが、何卒宜しくお願い致します。</p>
            </div>
        </div>
        <!-- メイン end -->

    </div>
    <!-- コンテンツエリア end -->

</div>
<!-- メインコンテンツ end -->

{include file="./common/footer.tpl"}
