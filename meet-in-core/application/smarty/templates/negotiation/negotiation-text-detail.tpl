{include file="./common/header.tpl"}

{literal}

<style>



/* .main_text_content_area textarea {
    resize: none;
    border: 1px solid #E9E8E7;
}


#mi_content_area {
    margin: 0 auto;
    display: block;
    width: 885px;
    padding: 30px 0 25px 0;
}

.main_text_detail_area {
    border: none;
}

.text_detail_title {
    display: flex;
    margin-top: 10px;
    justify-content: space-between;
}


.mi_title_csv_btn:hover .file_download_text{
    color: #ffaa00;
}

.mi_text_content_button_area {
    width: 67px;
    height: 100%;
    float: right;
    margin-top: -10px;
    margin-right: -29px;
}

.mi_title_action_btn span {
    font-size: 8px;
    white-space: nowrap;
    width: auto;
    height: auto;
    left: 50%;
    transform: translate(-50%);
    top: 32px;
}

#text_icon_download{
    display: block;
    text-align: center;
} */

.main_text_content_area {
    width: 885px;
    background: white;
}

.text_navigation_area {
    width: 180px;
    height: 50px;
    display: flex;
    margin-left: 55px;
    padding-top: 40px;
}

.text_data_name {
    font-size: 16px;
}

.navigation_box {
    width: 31px;
    height: 17px;
    color: #fff;
    background: #df6b6e;
    padding-left: 6px;
    line-height: 19px;
    font-size: 13px;
    margin-left: 5px;
    margin-top: 5px;
}

.main_text_title_form {
    margin-left: 54px;
    margin-top: -13px;
    width: 500px;
    height: 40px;
    font-size: 14px;
    border-radius: 5px;
    border: 1px solid #e1e1e1;
}

.text_detail_form {
    margin-left: 55px;
    margin-top: 30px;
    width: 765px;
    height: 450px;
    border-radius: 5px;
    margin-bottom: 40px;
    overflow: scroll;
    border: 1px solid #e1e1e1;
}

input:focus{
    outline:none;
}

textarea:focus{
    outline:none;
}

.text_file_add_button {
    margin: 0 auto;
}

.audio_text_download {
    width: 100px;
}

.mi_title_action_btn {
    width: 70px!important;
    margin-top: 70px;
    margin-right: ;
}

.icon-download {
    margin-left: 18px;
}

.mi_title_action_btn span {
    font-size: 8px;
    white-space: nowrap;
    width: 100px;
    height: auto;
    left: 50%;
    transform: translate(-50%);
    top: 32px;
}

.audio_text_detail_title {
    color: #555;
    font-size: 20px;
    margin-bottom: 35px;
}

.audio_text_detail_icon {
    margin-bottom: 6px;
    width: 25px;
}

.text_file_button_area {
    text-align: center;
    width: 885px;
    margin-top: 45px;
}


</style>

<script>

/**
 * ダウンロードボタン押下イベント
 */
function audioTextDownload() {
    var id = document.getElementById('data_text_id').value;
	$.ajax({
		url: "/negotiation/download",
        type: 'GET',
        data: {
            'id':id
        }
	}).done(function(res){
        //コントローラからjsonで返ってくるため、整形
        const obj = JSON.parse(res);
        const text = obj[0]['text'];
        const title = obj[0]['title'];
		//エラーが返ってきた場合は、処理中のアラートを出す
		if (res == "error"){
			alert('現在処理中です');
		//ファイルをダウンロード
		}else{
			var element = document.createElement("a");
			element.download = title+".txt";
			element.href = window.URL.createObjectURL(new Blob([text], {type: "text/plain"}));
			element.click();
		}
	}).fail(function(){
		console.log("error");
	})
}

</script>
{/literal}

<div id="mi_main_contents">
    <!-- トップナビ start -->
    <div id="mi_top_nav">
        <!-- パンくずリスト start -->
        <div class="mi_breadcrumb_list">
            <a href="/index/menu">TOP</a>&nbsp;&gt;&nbsp;
            <a href="/negotiation/negotiation-text-list">文字起こしファイル一覧</a>&nbsp;&gt;&nbsp;
            <a href="/negotiation/negotiation-text-detail?id={$data.id}">文字起こしファイル詳細</a>
        </div>
        <!-- パンくずリスト end -->
    </div>

    <div id="mi_content_area">

        <!-- コンテンツタイトル start -->
        <div class="text_detail_title">

            <h1 class="audio_text_detail_title"><img src="/img/audio_text3.png" class="audio_text_detail_icon"> 文字起こしファイル詳細</h1>
            <div class="mi_flt-r">
                <div class="mi_content_title_option">
                    <a href="javascript:audioTextDownload();" class="mi_title_action_btn">
                        <span class="icon-download"></span>
                        <span class="audio_text_download">ダウンロード</span>
                    </a>
                </div>
            </div>
        </div>

        <div class="main_text_content_area">
            <div class="main_text_title_area">
                <div class="text_navigation_area">
                    <span class="text_data_name">データ名</span>
                    <div class="navigation_box">必須</div>
                </div>
                <form action="/negotiation/negotiation-text-edit" method="post">
                    <input type="text" class="main_text_title_form" value="{$data.title}" name="edit_title">
                    <input type="hidden" value="{$data.id}" name="id" id="data_text_id">
                </div>
                <div class="main_text_detail_area">
                    <textarea class="text_detail_form" name="edit_text">{$data.text}</textarea>
                </div>
            </div>
        <div class="text_file_button_area">
            <button class="text_file_add_button">登録</button>
        </form>
        </div>
    </div>
</div>
    

{include file="./common/footer.tpl"}