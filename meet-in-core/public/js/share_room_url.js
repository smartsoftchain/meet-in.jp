/*
 * ルーム共有に関するJS群
 */

let roomUrl ='';
let showMsgDuration = 1500;
let sendMessage = [
	"いつも大変お世話になっております。\n",
	"__{{企業名}}__の__{{名前}}__です。\n",
	"\n",
	"お時間になりましたら、下記URLよりルームにアクセスください。\n",
	"※招待者がログインするまで入室はできません。\n",
	"\n",
	"■日時：00/00 00:00~00:00\n",
	"■URL：__{{URL}}__\n",
	"\n",
	"何卒宜しくお願い致します。"
].join("");

//　読込時にルーム名と招待文・SMSテンプレートを取得する
$(function() {
    const roomName = $("#Room_name").val();
    if ( roomName !== '' && typeof roomName !== 'undefined') {
        roomUrl = location.protocol + "//" + location.host + "/room/" + roomName;
    }

    sendMessage = getMessageTemplate();

});

// URLをコピー
$(document).on('click', '#copy_url_in_room', function(){
    const msgDisplayElement = $("#copy_msg");
    const showMsgText = "コピーしました";
    executeCopyTarget(roomUrl, msgDisplayElement, showMsgText, showMsgDuration);
});

// 招待文をコピー
$(document).on('click', '#copy_sentence_in_room', function(){

    const copyMessage = replaceTagAtSendMessage(sendMessage, roomUrl);

    const msgDisplayElement = $("#copy_msg");
    const showMsgText = "コピーしました";

    executeCopyTarget(copyMessage, msgDisplayElement, showMsgText, showMsgDuration);
});

// SMS送信
$(document).on('click', '#sms_send_in_room, #direct_sms_send_in_room', function(){
    // ルーム共有モーダルを閉じる
    $("div#room-share-close").trigger('click');

    const displayElement = $('div.sms_send_message_in_room');
    const showMsgText = 'SMSを送信しました';
    // SMS送信モーダル表示、送信
    sendSMS(roomUrl, displayElement, showMsgText, showMsgDuration);
});

/**
 * ルームURL又は招待文 をコピーする
 * @param {copyTarget} copyTarget ルーム名 や　招待文 
 * @param {displayElement} displayElement コピー完了メッセージ表示する箇所の要素 
 * @param {showMsgText} showMsgText コピー完了メッセージ本文 
 * @param {showMsgDuration} showMsgDuration コピー完了メッセージを表示する時間 
 */
function executeCopyTarget(copyTarget, displayElement, showMsgText, showMsgDuration) {    
    // ブラウザのコピー処理を実行する
    navigator.clipboard.writeText(copyTarget)
    .then(function () {
        // コピーメッセージの表示
        displayElement.text(showMsgText);
        displayElement.show();
        setTimeout(function(){
            displayElement.fadeOut("slow");
        }, showMsgDuration);
    }, function() {
        console.log(error);
    });
}
/**
 * SMS送信処理(POST送信)
 * @param {string} roomUrl ルームURL
 * @param {string} displayElement 完了メッセージの要素
 * @param {string} showMsgText 完了メッセージ本文
 * @param {number} showMsgDuration 完了メッセージの消える秒数
 * @return {boolean} 送信結果
 */
function sendSMS(roomUrl, displayElement, showMsgText, showMsgDuration) {
	// SMS送信モーダル表示
    let defaultMessage = replaceTagAtSendMessage(sendMessage, roomUrl);
	const smsModalTemplateText = 
    `
		<div class="sms_modal_content_wrapper">
            <div class="sms_modal_head_text">SMSにルームURLを送ります。送り先の電話番号を入力してください。</div>
            <div class="sms_input_error_area">ご入力頂いた番号が不正な値です。半角の数字11桁で入力してください。</div>
            <div class="sms_input_area">
                <span class="sms_modal_label_text">電話番号</span>
                <input id="send_tel_number" class="send_contents" type="text" name="send_tel_number" placeholder="00000000000" value="" maxlength="11"/>
            </div>
            <div class="sms_input_area input_textarea">
                <span class="sms_modal_label_text send_text_label">本文</span>
                <textarea id="send_text" class="send_contents" name="send_text" value=""></textarea>
            </div>
            <div class="sms_caution_message_area">
                <div class="caution_message">※SMSの受信拒否を設定している場合は届きません。解除方法につきましては</br>大変お手数ではございますが契約会社様へお問い合わせください。</div>
                <div class="caution_message">　※通信障害が発生していたり、電波が不安定な場合は送受信に影響が出ることが</br>ございます。場所を移動したり、しばらく時間を置いてから再度お試しください。</div>
            </div>
        </div>
		`;
	let isErrorFlg = false;

    makeDefaultConfirmDialog('SMS送信', smsModalTemplateText, {
        submit_event: e => {

            const sendNumber = $('#send_tel_number').val();
            const sendText = $('textarea[name="send_text"]').val();
            if (sendNumber == '' || !sendNumber.match(/^0[789]0[0-9]{4}[0-9]{4}$/)) {
                $('.sms_input_error_area').css('display', 'block');
                // エラー表示分 モーダルのheightに足す
                if (isErrorFlg === false) {
                    const modalHeightPlusErrorElemHeight = $('#mi_confirm_dialog_area').height() + $('.sms_input_error_area').height();
                    $('#mi_confirm_dialog_area').height(modalHeightPlusErrorElemHeight);
                    isErrorFlg = true;
                }

                return false;
            } else if (sendText.length >= 1600) {
                alert('SMSは1,600文字以上は送信できません。');
                return false;
            } else {

                $.ajax({
                        url: "/negotiation/send-sms",
                        type: "POST",
                        dataType: "text",
                        data: {
                        "send_number" : sendNumber,
                        "send_text" : sendText,
                        },
                }).done(function(res) {
                    if (isJSON(res)) {
                        res = jQuery.parseJSON(res);
                    } else {
                        console.log(res);
                        alert('SMS送信に失敗しました。');
                        return false;
                    }
                    if (res.status === 'sent') {
                        // 送信完了メッセージを表示
                        displayElement.text(showMsgText);
                        if ($('#sms_send_message_area_in_room').length) {
                            displayElement = $('#sms_send_message_area_in_room');
                        }
                        displayElement.show();
                        setTimeout(function(){
                            displayElement.fadeOut("slow");
                        }, showMsgDuration);
                        return true;
                    } else {
                        console.log(res);
                        alert('SMS送信に失敗しました。');
                        return false;
                    }
                }).fail(function(res) {
                    console.log(res);
                    alert('SMS送信に失敗しました。');
                    return false;
                });
            }
        }
    });

    $('#send_text').val(defaultMessage);
    $('#mi_confirm_dialog_button_area').addClass('sms_dialog_button_area'); // cssでデフォルトのモーダルに影響与えないようsms用のクラスを付与する
    $('#mi_confirm_dialog_submit').text('送信');

    if (USER_PARAM_IS_IPAD_PC){
        $('#send_text').css('font-size', '12px');
        toIPadVerticalOrHorizontalStyle();
    }

    // エラー表示された後で入力欄クリアしたときに、エラー非表示にする
    $(document).on('keyup', '#send_tel_number', function() {
        const sendNumber = $('#send_tel_number').val();
        if (sendNumber == '' && $('.sms_input_error_area').css('display') === 'block') {
            // エラー表示を消して、その分モーダルのheightから引く
            const modalHeihgtMinusErrorElemHeight = $('#mi_confirm_dialog_area').height() - $('.sms_input_error_area').height();
            $('.sms_input_error_area').css('display', 'none');
            $('#mi_confirm_dialog_area').height(modalHeihgtMinusErrorElemHeight);
            isErrorFlg === false;
        }
    });

}

/**
 * テンプレートの値を取得する処理（ajax）
 * @param {string} clientId クライアントID
 * @param {string} staffId スタッフID
 * @param {string} staffType スタッフタイプ (AA or CE)
 * @return {string} sendMessage 取得したテンプレート本文
 */
function getMessageTemplate() {
    const clientId = $('#client_id').val();
    const staffId = $('#staff_id').val();
    const staffType = $('#staff_type').val();

    // ゲスト（ログイン前）のときは投げない
    if ($('#is_operator').val() === '1' || (clientId !== '0' && staffId !== '0' && staffType !== 'ZZ')) {
        $.ajax({
        url: "/share-room-name-template/detail",
        type: "POST",
        data: {client_id: clientId, staff_id: staffId, staff_type: staffType},
        }).done(function(res) {
            if (isJSON(res)) {
                const parsedData = JSON.parse(res);
                sendMessage = parsedData["text"];
            } else {
                alert('招待文・SMSテンプレートの取得に失敗しました')
            }
        }).fail(function(res) {
            alert('招待文・SMSテンプレートの取得に失敗しました');
        });
    }

    return sendMessage;
}

/**
 * テンプレートのタグ置換処理
 * @param {string} sendMessage テンプレート本文
 * @param {string} roomUrl ルームURL
 * @return {string} replacedMessage　URL等置換後のテンプレート本文
 */
function replaceTagAtSendMessage(sendMessage, roomUrl) {

    let replacedMessage = sendMessage;

    const companyName = $('#client_name').val() !== '' ? $('#client_name').val() : " ";
    const userName = $('#operator_name').val() !== '' ? $('#operator_name').val() : " ";;
    // 企業名タグを置換
    replacedMessage = replacedMessage.replace(/__{{企業名}}__/gi, companyName);
    // 名前タグを置換
    replacedMessage = replacedMessage.replace(/__{{名前}}__/gi, userName);
    // URL箇所を置換
    replacedMessage = replacedMessage.replace(/__{{URL}}__/gi, " " + roomUrl + " ");

    return replacedMessage;
}

// ipad 縦横切り替え sms送信モーダルのスタイルを切り替える
$(window).bind('orientationchange', function() { 
    toIPadVerticalOrHorizontalStyle();
});

// ipad縦用と横用か見て、スタイルを一部書き換える処理
function toIPadVerticalOrHorizontalStyle() {
    // menu箇所の調整
    if ($('#mi_confirm_dialog_area').css('display') === 'block') {
        if (Math.abs(window.orientation) === 90) {
            // iPad横用のスタイルに部分的に書き換える。
            $('#send_text').css('width', '360px');

        } else {
            // iPad縦用のスタイルに部分的に書き換える。
            $('#mi_confirm_dialog_area').css('height', '525px');
            $('.sms_input_area').css({
                'width': '470px',
                'margin': '20px auto'
            });
            $('.input_textarea').css('margin', '10px 10px 10px 105px');
            $('.send_text_label').css('margin-right', '45px');
        }
    }

     // ルーム内 ルーム共有モーダル箇所の調整
	if ($('.negotiation_modal_roomshare').length && Math.abs(window.orientation) !== 90) {
		$('.room_copy_btn_in_room').css('width', '182px');
		$('.sms_send_btn_in_room').css('width', '182px');
	} else {
        // ルーム内　共有モーダルのボタン幅
        $('.room_copy_btn_in_room').css('width', '170px');
        $('.sms_send_btn_in_room').css('width', '170px');
    }
    
}
