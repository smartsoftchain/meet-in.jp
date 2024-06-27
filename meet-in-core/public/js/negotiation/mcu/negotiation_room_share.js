/*
 * ルーム共有に関するJS群
 */

$(document).on('click', '#icon_copy_url', function(){
    if(getBrowserType() =='IE') {
        var meetin_room_url = location.protocol + "//" + location.host + "/rooms/" + $("#meetin_room_name").text();
        window.clipboardData.setData('text', meetin_room_url);

        $("#copy_msg").text("コピーしました");

        setTimeout(function(){
            $("#copy_msg").text("");
        }, 1500);
    }
    else if(getBrowserType() == 'Safari') {
		var meetin_room_url = location.protocol + "//" + location.host + "/rooms/" + $("#meetin_room_name").text();

        // MacOS(Safari)

        // 選択用のテキストエリアを作成
        textArea = document.createElement('textArea');
        textArea.value = meetin_room_url;
        document.body.appendChild(textArea);

        // 選択
        textArea.select();

        // クリップボードへコピー
        document.execCommand('copy');

        // コピー用のテキストエリア削除
        document.body.removeChild(textArea);

        $("#copy_msg").text("コピーしました");
        setTimeout(function(){
			$("#copy_msg").text("");
        }, 1500);

        return false;
    }
    else {
        document.addEventListener('copy', function(event) {
            event.preventDefault();
            var meetin_room_url = location.protocol + "//" + location.host + "/rooms/" + $("#meetin_room_name").text();
            event.clipboardData.setData('text', meetin_room_url);

            $("#copy_msg").text("コピーしました");

            setTimeout(function(){
                $("#copy_msg").text("");
            }, 1500);
        }, {once:true});
    }
    // ブラウザのコピー処理を実行する
    document.execCommand("copy");
});

$(document).on('click', '#icon_copy_sentence', function(){
    var meetin_room_url = location.protocol + "//" + location.host + "/rooms/" + $("#meetin_room_name").text();

    var copyMessage = [
        "いつも大変お世話になっております。\n",
        "下記の日程でオンラインビデオチャットをお願いいたします。\n",
        "\n",
        "■00/00　00:00～00:00\n",
        "\n",
        "時間になりましたら、下記URLよりルームにアクセスください。\n",
        "招待者がログインするまで入室はできません。\n",
        "",
        meetin_room_url+"\n",
        "\n",
        "以上、ご不明点がございましたら下記までお問い合わせくださいませ。\n",
        "\n",
        "担当者：\n",
        "連絡先：\n",
        "メールアドレス：\n"
    ].join("");

    if(getBrowserType() =='IE') {
        window.clipboardData.setData('text', copyMessage);
        $("#copy_msg").text("コピーしました");
        setTimeout(function(){
            $("#copy_msg").text("");
        }, 1500);
    }
    else if(getBrowserType() == 'Safari') {

        // 選択用のテキストエリアを作成
        textArea = document.createElement('textArea');
        textArea.value = copyMessage;
        document.body.appendChild(textArea);

        // 選択
        textArea.select();

        // クリップボードへコピー
        document.execCommand('copy');

        // コピー用のテキストエリア削除
        document.body.removeChild(textArea);

		$("#copy_msg").text("コピーしました");
		setTimeout(function(){
			$("#copy_msg").text("");
		}, 1500);

        return false;
    }
    else {
        document.addEventListener('copy', function(event) {
            event.preventDefault();
            event.clipboardData.setData('text', copyMessage);
            $("#copy_msg").text("コピーしました");
            setTimeout(function(){
                $("#copy_msg").text("");
            }, 1500);
        }, {once:true});
    }
    // ブラウザのコピー処理を実行する
    document.execCommand("copy");
});

function copyStringToClipboard (string) {
    function handler (event){
        event.clipboardData.setData('text/plain', string);
        event.preventDefault();
        document.removeEventListener('copy', handler, true);
    }

    document.addEventListener('copy', handler, true);
    document.execCommand('copy');
}
