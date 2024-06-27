/**
* オペレータもしくはゲストが商談画面にログインもしくは再読み込みした際に
* 共有メモ・ホワイトボード・資料のデータを同期する。
* その他、同期を行う処理を記述する。
*
*/

var syncRetryCount = 0;				// 他ユーザーとの接続完了待ちを行ったか回数
var syncDbRetryCount = 0;			// メンバー取得(DB)接続待ちを行ったか回数
var syncValRetryCount = 0;

const SYNC_RETRY_TIMER = 3000;			// 他ユーザーとの接続完了待ちを行うタイマー
const SYNC_DB_RETRY_TIMER = 2000;		// リトライ時間(DB)
const SYNC_RETRY_MAX_COUNT = 5;			// 接続完了待ちを行う最大回数
const SYNC_HIDE_MESSAGE_TIMER = 3000;	// 同期メッセージ表示時間
const SYNC_MAX_MESSAGE_TIMER = 20000;	// メッセージ最大表示時間

//const SYNC_VAL_TIMER = 500;			// 入室した際に待つ時間
//const SYNC_GUEST_TIMER = 2000;		// ゲストが入室した際に待つ時間

const SYNC_SHARE_MEMO_STATUS = 1;		// 共有メモの同期が完了したときのステータス
const SYNC_WHITE_BOARD_STATUS = 2;		// ホワイトボードの同期が完了したときのステータス
const SYNC_DOCUMENT_STATUS = 4;			// 資料の同期が完了したときのステータス
const SYNC_HIDE_MESSAGE_STATUS = 7;		// 初期化の同期メッセージを削除するステータス

var beforeUnload=0;
var getOldestUserIdTimer = null;		// 同期ユーザID取得タイムアウトコールバック

var chat_next_cnt = 0;

// ===============================================
// この処理が読み込まれた際に同期処理を実行する
// ===============================================
$(function () {

	// フラグ取得
	beforeUnload = sessionStorage.getItem("beforeUnload");

	// 同期開始のメッセージを表示
	initSyncSetting();

	syncValRetryCount=0;
	var initSyncVariable = setInterval(function() {
		// 同期で参照している必要な変数がセットされるまで待機
		var peerId = $("#peer_id").val();	// 自分のpeerId
		var connectionInfoId = $("#connection_info_id").val();
//console.log("initSyncVariable peerId=("+peerId+") connectionInfoId=("+connectionInfoId+") cnt=("+syncValRetryCount+")");
		syncValRetryCount++;
		//終了条件
		if( peerId || syncValRetryCount >= SYNC_RETRY_MAX_COUNT) {
			clearInterval(initSyncVariable);
//console.log("initSyncVariable END");
			// 同期
			syncDbRetryCount = 0;
			initSyncDb();
			var secretMemo = sessionStorage.getItem("secretMemo");
			if(secretMemo){
				// ストレージにデータが存在すれば設定する
				$("textarea.secret_memo_text").val(secretMemo);
			}
		}
	}, 500);

	// ========================================================
	// シークレットメモの同期処理を行うための処理
	// ========================================================
	// シークレットメモにメッセージを書き込んだ場合のイベント処理
	$(document).on('keyup', 'textarea.secret_memo_text', function(){
		try{
			// ストレージにデータを保存する
			sessionStorage.setItem("secretMemo", $("textarea.secret_memo_text").val());
		}catch (e) {
			// 同期メッセージの表示領域にメッセージを表示
			$("#no_save_document_message_area").show();
			setTimeout(function (){
				// 3秒後にメッセージを削除
				$("#no_save_document_message_area").hide();
			} , NO_SAVE_TIMER);
		}
	});
});

/**
 * 同期を行う前にボタンの制御とメッセージ表示を行う
 * @returns
 */
function initSyncSetting(){
	// 同期開始のメッセージを表示
	viewMessageInit("");
	// 共有メモボタンを押せなくする
	$("#button_share_memo").prop("disabled", true);
	// ホワイトボードのボタンを押せなくする
	$("#button_white_board").prop("disabled", true);
}

/**
 * オペレータとゲストで初期化のタイミングを変えるため関数化
 * @returns
 */
function initSyncDb(){
	// 再接続などでも使用するのでinitStateを初期化する
	initState = 0;
	// DBを参照し、商談ルームに何人いるのかを取得する
	var peerId = $("#peer_id").val();	// 自分のpeerId
	var syncConnectionInfoId = $("#connection_info_id").val();

	$.ajax({
		url: "https://" + location.host + "/negotiation/get-room-member-count",
		type: "GET",
		data: {peerId : peerId, connectionInfoId : syncConnectionInfoId},
		success: function(roomMemberCount) {
/**
 * ルームメンバー取得処理
 * ※DBから取得するルームのメンバ数は自分以外の数
 *
 * ルームのメンバ = 0 の初期入室者(同期は不要！)
 * ルームのメンバ > 1 の場合は1以上(同期あり)
 * リトライ間隔はSYNC_GUEST_TIMER(2sec:2000)で最大:SYNC_RETRY_MAX_COUNT(5回)
 *
 */
			if(roomMemberCount == 0){
//console.log("initSyncDb roomMemberCount == 0");
				// 共有メモのデフォルト文字を追加
				initShareMemo();
				// ルームへの最初の入室者はセッションストレージを初期化する
				sessionStorage.clear();

				// チャットボード初期化
				initChatBoard();

				// 同期メッセージを削除
				hideSyncResuponceMessage();
				// 共有メモボタンを押せるようにする
				$("#button_share_memo").prop("disabled", false);
				// ホワイトボードのボタンを押せるようにする
				$("#button_white_board").prop("disabled", false);
			}
			else if(roomMemberCount > 0){
//console.log("initSyncDb roomMemberCount > 0 Count=("+roomMemberCount+")");
				// 新規接続時の初期化処理
				syncRetryCount=0;
				// ルームへの最初の入室者はセッションストレージを初期化する
				sessionStorage.clear();

				// チャットボード初期化
				initChatBoard();

				initSync(roomMemberCount);
			}
			/**
			 * ※通常はありえないが、最大回数まったが(2sec * 5回 = 10秒)秒数待った後に再帰する
			 */
			else if(syncDbRetryCount == SYNC_RETRY_MAX_COUNT){
//console.log("initSyncDb roomMemberCount == SYNC_RETRY_MAX_COUNT");
				// 新規接続時の初期化処理(強制:1)
				syncRetryCount=0;
				// ルームへの最初の入室者はセッションストレージを初期化する
				sessionStorage.clear();

				// チャットボード初期化
				initChatBoard();

				initSync(1);
			}
			else {
//console.log("initSyncDb etc... syncDbRetryCount=("+syncDbRetryCount+")");
				syncDbRetryCount++;
				// 取得リトライ(オペレータのピアIDが未設定の場合は設定されるまでリトライする)
				syncDbDocumentTimeoutId = setTimeout(function (){
					// SYNC_DB_RETRY_TIMERの(2sec)秒数待った後に再帰する
					initSyncDb();
				} , SYNC_DB_RETRY_TIMER);
			}
		}
	});
}

/**
 * 新規接続時の初期化処理
 * 再帰処理を行うので関数化
 * @returns
 */
function initSync(roomMemberCount){
	// 初期化処理のカウントを増加する
	syncRetryCount++;
	// 現在peerの接続が確立しているユーザー数を取得する
	var connectionUserCount = 0;
	try{
		// 初期化が終わっている場合のみカウントを取得する
		connectionUserCount = Object.keys(mUserIdAndUserInfoArray).length;
	}catch(e){
		// 本来であれば mUserIdAndUserInfoArrayを初期化すればいい話だが、
		// 私が作っていないので、カウントを取得し例外が発生した場合はここでキャッチする。
		// ※例外を正常系とするありえない作りだが、まぁこれを見た他の方は察してください。
	}

//console.log("initSync roomMemberCount[DB]=("+roomMemberCount+") connectionUserCount=("+connectionUserCount+")");
	// DBの値と同じであれば初期化処理を実施若しくは、最大回数待ったが(3sec * 5回=15秒)接続が完了しない場合も実施する
	if(roomMemberCount == connectionUserCount || syncRetryCount == SYNC_RETRY_MAX_COUNT){
		// 入室の一番古いユーザーに共有メモ・ホワイトボード・資料のデータを要求する
		requestInitData();

		// 初期化処理のカウントを初期化する
		hideSyncMessage(0, SYNC_HIDE_MESSAGE_STATUS);
		syncRetryCount = 0;
	} else {
		// DBの値と数が違う場合はpeerの接続を待つ
		syncDocumentTimeoutId = setTimeout(function (){
			// SYNC_RETRY_TIMERの3秒数待った後に再帰する
			initSync(roomMemberCount);
		} , SYNC_RETRY_TIMER);
	}
}

/**
 * 入室の一番古いユーザーに共有メモ・ホワイトボード・資料のデータを要求する
 * @returns
 */
function requestInitData(){
	// 現在の接続ユーザーの中で入室が一番古いユーザーのIDを取得する
	var successCallback = function(responceUserId) {
		// 同期先ユーザIDが取得タイマークリア
console.log("initSync successCallback:["+getOldestUserIdTimer+"]");
		if (getOldestUserIdTimer) {
			clearTimeout(getOldestUserIdTimer);
			getOldestUserIdTimer = null;
		}

		// 入室が古いユーザーが自分だった場合も初期化要求は行わない(通常はありえない)
console.log("initSync successCallback: responceUserId("+responceUserId+") / ("+ $('#user_id').val() +")");
		if(responceUserId != $('#user_id').val()){
			// 資料で使用しているストレージの初期化を行う
			syncInitDocumenSessionStoraget();
			// 共有メモ・ホワイトボード・資料のデータ同期要求を行う
			var data = {
					command : "INIT_SYNC",
					type : "REQUEST_SYNC",
					requestUserId : $('#user_id').val()
			};
			sendCommandByUserId(responceUserId, data);
			// 自分が同期を行っているメッセージを出す(同期相手の名前を入れる)
			viewMessageInit(mUserIdAndUserInfoArray[responceUserId]);
		}
		else{
			// 資料のサムネイル表示を行う
//			syncViewThumbnail();
			// 同期メッセージを削除
			hideSyncResuponceMessage();
			// 共有メモボタンを押せるようにする
			$("#button_share_memo").prop("disabled", false);
			// ホワイトボードのボタンを押せるようにする
			$("#button_white_board").prop("disabled", false);
		}
	}
	getOldestUserId(successCallback);
console.log("initSync requestInitData:getOldestUserId() START");

//	// 指定さされた秒数で同期先ユーザIDが取得できなかった場合、同期エラーメッセージを表示し再接続を促す。
// 	var run = function() {
// 		clearOldestUserId();	// コールバッククリア
// 		// エラーメッセージを作成する
// 		var buttonNameAndFunctionArray = {};
// 		buttonNameAndFunctionArray["OK"] = function() {
// //			$("#negotiation_sync_message_area").hide();
// 			window.location.href =  "https://" + location.host + "/";
// 		};
// 		createModalDialogWithButtonFunction("お知らせ", "同期に失敗しました。<br/>一度終了し再度ルームへ接続してください。", buttonNameAndFunctionArray);
// 	};
// 	getOldestUserIdTimer = setTimeout(run, 10000);	// 10秒

	// 指定さされた秒数で同期先ユーザIDが取得できなかった場合、同期ユーザなしとする
	var run = function() {
		clearOldestUserId();	// コールバッククリア

		// 資料のサムネイル表示を行う
//		syncViewThumbnail();
		// 同期メッセージを削除
		hideSyncResuponceMessage();
		// 共有メモボタンを押せるようにする
		$("#button_share_memo").prop("disabled", false);
		// ホワイトボードのボタンを押せるようにする
		$("#button_white_board").prop("disabled", false);
	};
	getOldestUserIdTimer = setTimeout(run, 10000);	// 10秒
console.log("initSync requestInitData:getOldestUserIdTimer 10sec START:["+getOldestUserIdTimer+"]");
}


/**
 * 自分が同期中のメッセーを表示する
 * @returns
 */
function viewMessageInit(responceUserName){
	var message = "";
	if(!responceUserName){
		message = "初期化を開始します。<br>共有メモ初期化中...<br>ホワイトボード初期化中...<br>資料初期化中...";
	}
	else{
		// 文字数が多き場合は8文字で切る
		if(responceUserName.length > 8){
			responceUserName = responceUserName.substring(0, 7) + "...";
		}
		message = responceUserName + "さんのデータと同期中です。<br>共有メモ同期中...<br>資料同期中...";
	}
	$(".negotiation_sync_message").html(message);
	$("#negotiation_sync_message_area").show();
}

/**
 * 共有メモの初期化処理
 * @returns
 */
function initShareMemo(){
	if ($("textarea.share_memo_text").val() == "") {
		// デフォルトテンプレート追加
		var now = new Date();
		var bigenDate = "開始日時：" + now.getFullYear() + "年" + (now.getMonth() + 1) + "月" + now.getDate() + "日\n";
		$("textarea.share_memo_text").val(bigenDate);
	}
}

function initChatBoard(){
	var connectionInfoId = $("#connection_info_id").val();

	$.ajax({
		type: "POST",
		url: "https://" + location.host + "/negotiation/get-chat-message-list",
		dataType: "json",
		data: {
			"connection_info_id" : connectionInfoId
		}
	}).done(function(result) {
		// jsonをオブジェクトに変換
console.log("data_cnt=("+result.length+")");
		if( result.length != 0 ) {
			// 確認
			var chatMessageList = [];
			chat_next_cnt = 0;
			for(var iCnt = 0; iCnt < result.length; iCnt++){
				result[iCnt]["id"] = Number(result[iCnt]["id"]);
				result[iCnt]["user_id"] = Number(result[iCnt]["user_id"]);
				result[iCnt]["uu_id"] = result[iCnt]["uuid"];
				result[iCnt]["message"] = result[iCnt]["message"];

				var template = createOthersTemplate(result[iCnt]["id"], result[iCnt]["user_id"], result[iCnt]["uuid"]);
				$('#chat_board_messages').append(template);

				// 入力文字を出力((サニタイジング済み))
				$('#chat_board_message_text'+result[iCnt]["id"]).html(result[iCnt]["message"]);
			}
		}
		else {
console.log("データなし");
		}
	}).fail(function(data) {
	});

}

function createOthersTemplate(chatCnt, userid, uuid) {
	if( chat_userid == userid && chat_uuid == uuid ) {
		chat_next_cnt++;
	}
	else {
		chat_next_cnt = 0;
	}
	chat_userid = userid;
	chat_uuid = uuid;

	var message = '';
	message += '<div class="chat_board_message chat_board_message_forced">';

	if( chat_next_cnt == 0 ) {
		message += '<div class="chat_board_left_img">';
		message += '<div class="chat_board_userimg_left chat_board_userimg_left_forced">';
		message += '<div class="chat_board_userimg_wrap_left chat_board_userimg_wrap_left_forced">';
		message += '<div class="chat_board_userimg_wrap_left_inner">';
		message += '<img id="image'+ chatCnt +'" src="/img/icon_face.png" style="position:absolute; width:100%; height:66%; object-fit:scale-down;\">';
		message += '</div></div></div>';
			// 初回(１件のみのメッセージ)
		message += '<div class="chat_board_message_box">';
	}
	else {
		// 連続２件目以降
		message += '<div class="chat_board_left">';
		if( chat_next_cnt == 1 ) {
			// ２件目(初回メッセージを開始吹き出しへ)
			$("div.chat_board_message_box:last").removeClass("chat_board_message_box").addClass("chat_board_message_box_start");
		}
		else {
			// ３件目以降(メッセージ、終了吹き出しを継続吹き出しへ)
			$("div.chat_board_message_box_end:last").removeClass("chat_board_message_box_end").addClass("chat_board_message_box_next");
		}
		// 2件目以降(終了吹き出し出力)
		message += '<div class="chat_board_message_box_end chat_board_message_box_end_forced">';
	}
	message += '<div class="chat_board_message_content chat_message_padding_forced chat_message_size_forced">';
	message += '<div id="chat_board_message_text'+ chatCnt +'" class="chat_board_message_text">';
	message += '</div></div></div>';

	message += '</div>';
	message += '</div>';
	message += '<div class="chat_board_clear"></div><!-- 回り込みを解除（スタイルはcssで充てる） -->';
	return message;
}

/**
 * 相手から送信された初期化処理の情報を受取る関数
 * @param json
 */
var initState = 0;
var syncDocumentScrollTop = 0;		// 資料の同期時にスクロール値を設定する
var syncDocumentScrollLeft = 0;
function receiveSyncJson(json){
	if(json.type == "REQUEST_SYNC"){
		// ====================================
		// 同期要求が来た際の処理
		// ====================================
		// 他のユーザーが自分と同期を始めたメッセージを出す
		showSyncResuponceMessage(json.requestUserId);
		// 共有メモの情報を要求者へ返す
		responceShareMemoSync(json.requestUserId);
		// ホワイトボードの情報を要求者へ返す
		responceWhiteBoardSync(json.requestUserId);
		// 資料の情報を要求者へ返す
		responceDocumentSync(json.requestUserId);
		// 必要なデータを返し終えたらメッセージを閉じる
		hideSyncResuponceMessage();
	}
	else if(json.type == "RESUPONCE_SHARE_MEMO"){
		// 共有メモの内容が送信されたので、反映する。
		$("textarea.share_memo_text").val(json.shareMemo);
		// initStateを変更
		initState += SYNC_SHARE_MEMO_STATUS;
		// 初期化同期メッセージの制御
		hideSyncMessage(json.responceUserId, initState);

		// 共有メモボタンを押せるようにする
		$("#button_share_memo").prop("disabled", false);

		// 共有メモが表示されている場合は表示する
		if(json.showFlg){
			$("#share_memo_area").show();
			// ホワイトボードのスクロール位置を設定
			$("div#share_memo_area").scrollTop(json.scrollTop);
			$("div#share_memo_area").scrollLeft(json.scrollLeft);
		}

		for (var key in mMeetinFlashSecurityPanelUserIdTable) {
			$('#negotiation_target_video_' + key).find('.video_big_icon').trigger("click");
			break;
		}
	}
	else if(json.type == "RESUPONCE_WHITE_BOARD"){
		// ホワイトボードの内容が送信されたので、反映する。
		var img = new Image();
		img.onload = function(){
			// キャンバスのオブジェクトを取得
			var element = document.getElementById("white_board");
			// context取得
			var context = element.getContext('2d');
			// 画像を描画
			context.drawImage(img, 0, 0, whiteBoardWidth, whiteBoardHeight);
			// initStateを変更
			initState += SYNC_WHITE_BOARD_STATUS;
			// 初期化同期メッセージの制御
			hideSyncMessage(json.responceUserId, initState);
			// ホワイトボードが表示されている場合は表示する
			if(json.showFlg){
				// SP用のホワイトボード表示処理
				showWhiteBord();
			}
		};
		// ホワイトボード画像の読み込み
		var uuid = UUID.generate();
		var uniqueStr = uuid.replace(/\-/g, '');
		img.src = "/negotiation_document/negotiation_"+ $("#connection_info_id").val() + "/white_board.png" + '?' + uniqueStr;
	}
	else if(json.type == "RESUPONCE_DOCUMENT"){
console.log("RESUPONCE_DOCUMENT");
		// json化した資料をオブジェクト化する
		var materialDict = $.parseJSON(json.materialDictJson);
		// サーバーから資料の情報を取得する
		var materialIds = [];
		for(var keyName in materialDict){
			// materialId_xxx の形式なので_でsplitして1番目を保持する
			var keyNames = keyName.split("_");
			materialIds.push(keyNames[1]);
		}

		// サーバーから資料共有のファイル情報を取得する
		$.ajax({
			url: "https://" + location.host + "/negotiation/get-material-list",
			type: "GET",
			data: {materialIds : JSON.stringify(materialIds)},
			success: function(resultJson) {
console.log("get-material-list");
				var resultMaterialList = $.parseJSON(resultJson);
				for (var i = 0; i < resultMaterialList.length; i++) {
					var keyName = "materialId_" + resultMaterialList[i]["material_basic"]["material_id"];
					materialDict[keyName][keyName] = $.extend(materialDict[keyName][keyName], resultMaterialList[i]);
					materialDict[keyName][keyName]["canvas_document"] = {};
					materialDict[keyName][keyName]["canvas_document"]["hashKey"] = resultMaterialList[i]["material_basic"]["md5_file_key"];
					materialDict[keyName][keyName]["canvas_document"]["maxCount"] = resultMaterialList[i]["material_detail"].length;
					materialDict[keyName][keyName]["canvas_document"]["document"] = {};
					// 資料データを保存するための領域を作成する
					for (var j = 0; j < resultMaterialList[i]["material_detail"].length; j++) {
						var pageKey = "page" + resultMaterialList[i]["material_detail"][j]["material_page"];
						materialDict[keyName][keyName]["canvas_document"]["document"][pageKey] = {};
						materialDict[keyName][keyName]["canvas_document"]["document"][pageKey]["img"] = "";
						materialDict[keyName][keyName]["canvas_document"]["document"][pageKey]["fileName"] = resultMaterialList[i]["material_detail"][j]["material_filename"];
						materialDict[keyName][keyName]["canvas_document"]["document"][pageKey]["orgHeight"] = 0;
						materialDict[keyName][keyName]["canvas_document"]["document"][pageKey]["orgWidth"] = 0;
					}
					// 資料のデータをセッションストレージに保存
					sessionStorage.setItem(keyName, JSON.stringify(materialDict[keyName]));
					// 資料のキーをセッションストレージに保存
					if( sessionStorageKeys.indexOf(keyName) >= 0 ) {
//					if(keyName in sessionStorageKeys){
						continue;
					}else{
						sessionStorageKeys.push(keyName);
						sessionStorage.setItem("mtSessionStorageKeys", JSON.stringify(sessionStorageKeys));
					}
				}	// for_end

				// 資料のサムネイル表示を行う
//				syncViewThumbnail();

				// initStateを変更
				initState += SYNC_DOCUMENT_STATUS;
				// 初期化同期メッセージの制御
				hideSyncMessage(json.responceUserId, initState);
				// 現在の拡大値を設定する
				codumentViewState = json.codumentViewState;
				if(codumentViewState == MAX_EXPANSION_VALUE){
					$("li.left_icon_size div#icon-expansion").hide();
					$("li.left_icon_size div#icon-reduction").show();
				}else{
					$("li.left_icon_size div#icon-expansion").show();
					$("li.left_icon_size div#icon-reduction").hide();
				}
				// 資料が表示されている場合は表示する
//console.log("RESUPONCE_DOCUMENT showFlg=("+json.showFlg+") beforeUnload=["+ beforeUnload +"]");
				if(json.showFlg){
					// 表示する資料のIDとページを保存する
					currentDocumentId = json.currentDocumentId;
					currentPage = json.currentPage;
					// 資料を表示する
					showDocumentCommon(json.documentCanvasLeft, json.documentUrlFlg, json.documentUserId, json.documentUuId, json.documentMaterialId);
					// 現在のスクロール位置を設定する
					syncDocumentScrollTop = json.scrollTop;
					syncDocumentScrollLeft = json.scrollLeft;
				}
			}	// success_end
		});

	}
}

/**
 * 他のユーザーが自分と同期を開始したときのメッセージを表示
 * @param responceUserId
 * @returns
 */
function showSyncResuponceMessage(requestUserId){
	var requestUserName = mUserIdAndUserInfoArray[requestUserId];
	var message = "";
	if(requestUserName == "" || requestUserName == null || (typeof requestUserName === "undefined")){
		requestUserName = "匿名ユーザー";
	}
	else{
		// 文字数が多き場合は8文字で切る
		if(requestUserName.length > 8){
			requestUserName = requestUserName.substring(0, 7) + "...";
		}
		requestUserName = requestUserName + "さん";
	}
	message = requestUserName + "が同期を開始しました。<br>再接続や画面更新をお控えください。";
	$(".negotiation_sync_message").html(message);
	$("#negotiation_sync_message_area").show();

	// 特定時間で消えない場合は、強制的にメッセージを非表示にする(20秒)
	setTimeout(function (){
		hideSyncResuponceMessage();
	} , SYNC_MAX_MESSAGE_TIMER);
}

/**
 * 他のユーザーが自分と同期を開始したときのメッセージを非表示
 * @param requestUserId
 * @returns
 */
function hideSyncResuponceMessage(){
	setTimeout(function (){
		// 一瞬で消える可能性があるので最少でも3秒表示する
		$(".negotiation_sync_message").html("");
		$("#negotiation_sync_message_area").hide();
	} , SYNC_HIDE_MESSAGE_TIMER);
}

/**
 * 共有メモの情報を要求者へ送信する
 * @returns
 */
function responceShareMemoSync(requestUserId){
	// 共有メモの内容を要求者へ送信する
	var data = {
			command : "INIT_SYNC",
			type : "RESUPONCE_SHARE_MEMO",
			shareMemo : $("textarea.share_memo_text").val(),
			showFlg : $("#share_memo_area").is(':visible'),
			top : 80,
			left : 70,
			height : 250,
			width : 300,
			scrollTop : 0,
			scrollLeft : 0,
			responceUserId : $('#user_id').val()
	};
	sendCommandByUserId(requestUserId, data);
}

/**
 * ホワイトボードの情報を要求者へ送信する
 * @param requestUserId
 * @returns
 */
function responceWhiteBoardSync(requestUserId){
	// ホワイトボードのキャンバス情報を取得
	var canvas = document.getElementById("white_board");
	var canvasData = canvas.toDataURL("image/png");
	var connectionInfoId = $("#connection_info_id").val();
	// サーバーに画像を転送する
	$.ajax({
		url: "https://" + location.host + "/negotiation/sync-white-board",
		type: "POST",
		data: {canvasData : canvasData, connectionInfoId : connectionInfoId},
		success: function(resultJson) {
			// ホワイトボード内容を要求者へ送信する
			var data = {
					command : "INIT_SYNC",
					type : "RESUPONCE_WHITE_BOARD",
					showFlg : $("#white_board_area").is(':visible'),
					top : 80,
					left : 70,
					height : 370,
					width : 280,
					scrollTop : 0,
					scrollLeft : 0,
					responceUserId : $('#user_id').val()
			};
			sendCommandByUserId(requestUserId, data);
		}
	});
}

/**
 * 資料の情報を要求者へ送信する
 */
function responceDocumentSync(requestUserId){
	// 戻り値
	var result = {};
	for (var i = 0; i < sessionStorageKeys.length; i++) {
		// セッションストレージから資料データを取得する
		var mtSessionStorage = $.parseJSON(sessionStorage.getItem(sessionStorageKeys[i]));
//		// 表示権限を全て無しに変更する
//		mtSessionStorage[sessionStorageKeys[i]]["viewFlg"] = 0;
		// データ量が多すぎるとpeerでデータを送信できないため削る
		mtSessionStorage[sessionStorageKeys[i]]["material_basic"] = {};
		mtSessionStorage[sessionStorageKeys[i]]["material_detail"] = {};
		mtSessionStorage[sessionStorageKeys[i]]["canvas_document"] = {};
		result[sessionStorageKeys[i]] = mtSessionStorage;
	}

	// 現在資料を表示している場合はURLのフラグを取得する
	var documentUrlFlg = 0;
	if($("div#mi_docment_area").is(':visible') && currentDocumentId != 0){
		// データを取得する為のキーを作成する
		var keyName = "materialId_" + currentDocumentId;
		// ブラウザのセッションストレージからデータ取得
		var mtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));
		// URLの場合はダウンロード等を削除する
		if(mtSessionStorage[keyName]["material_basic"]["material_url"]){
			documentUrlFlg = 1;
		}
	}

	// 資料の内容を要求者へ送信する
	var data = {
			command : "INIT_SYNC",
			type : "RESUPONCE_DOCUMENT",
			materialDictJson : JSON.stringify(result),
			currentDocumentId : currentDocumentId,
			currentPage : currentPage,
			documentCanvasLeft : LayoutCtrl.apiGetSubLength(),
			documentUrlFlg : documentUrlFlg,
			codumentViewState : codumentViewState,
			scrollTop : $("div#mi_docment_area").scrollTop(),
			scrollLeft : $("div#mi_docment_area").scrollLeft(),
			responceUserId : $('#user_id').val(),
			showFlg : $("div#mi_docment_area").is(':visible'),

			documentMaterialId : $('#document_material_id').val(),
			documentUserId : $('#document_user_id').val(),
			documentUuId : $('#document_uuid').val()
	};
	sendCommandByUserId(requestUserId, data);
}

/**
 * 資料の同期を行う場合は初期化を行う
 * @returns
 */
function syncInitDocumenSessionStoraget(){
	if(sessionStorageKeys.length > 0){
		var thumbnailviewCount = 0;
		for ( var i = 0; i < sessionStorageKeys.length; i++) {
			// 資料本体のsessionStorage初期化を行う
			sessionStorage.removeItem(sessionStorageKeys[i]);
		}
		// keyのsessionStorage初期化を行う
		sessionStorage.removeItem("mtSessionStorageKeys");
		sessionStorageKeys = [];
	}
}

/**
 * 初期化時に同期されたデータを元に資料サムネイルを表示する
 * @returns
 * ※類いロジックが「material.js[getThumbnailCount()]」にも存在するので修正した場合は確認する事！！
 */
function syncViewThumbnail(){

	var uuid = localStorage.UUID;
	if( !uuid ) {	// 空
		uuid = UUID.generate();
		localStorage.UUID = uuid;
	}

	// サムネイル領域の初期化
	$("div.mi_document_select ul").empty();

//console.log("syncViewThumbnail beforeUnload=["+ beforeUnload +"]");
	if( beforeUnload == 1 ) {
		/**
		 * 再表示
		 */
//console.log("syncViewThumbnail 再表示");
		if( sessionStorageKeys.length > 0 ) {
			var thumbnailviewCount = 0;
			for ( var i = 0; i < sessionStorageKeys.length; i++) {
				var keyName = sessionStorageKeys[i];
				// セッションストレージから資料データを取得する
				var mtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));
				if( mtSessionStorage ){
					// 自分の資料のサムネイルを再表示
					if( uuid == mtSessionStorage[keyName]["UUID"] ) {
//console.log("sync SHOW keyName=["+keyName+"] material_id=("+material_id+")");
						// サムネイル画像のパスを作成
						var ext = (mtSessionStorage[keyName]["material_basic"]["material_ext"] == '') ? 'jpg' : mtSessionStorage[keyName]["material_basic"]["material_ext"];
						var filePath = "/cmn-data/" + mtSessionStorage[keyName]["material_basic"]["md5_file_key"] + "-1." + ext;
						// サムネイルのタグを作成
						var thumbnailTag = '<li class="thumbnail_image"><img src="'+filePath+'" alt="'+ mtSessionStorage[keyName]["material_basic"]["material_name"] +'" class="mi_document_icon"  id="'+mtSessionStorage[keyName]["material_basic"]["material_id"]+'" draggable="true" ondragstart="materialDragStart(event)" /></li>';
						 // サムネイル画像の追加
						 $("div.mi_document_select ul").append(thumbnailTag);
						 // サムネイルの表示数をカウントアップする
						 thumbnailviewCount++;
					}
				}
			} // for_end
			// サムネイル数が増えた場合にスクロールのボタンを表示しulの領域を増やす
			if(thumbnailviewCount > MAX_THUMBNAIL_VIEW_COUNT){
				showMoveThumbnailIcon(thumbnailviewCount);
			}
		}
	}
	else {
//console.log("syncViewThumbnail 初期化");
		// 初期表示
		if( sessionStorageKeys.length > 0 ) {
			var thumbnailviewCount = 0;
			var del_keyName = [];
			var del_material_id = [];
			for ( var i = 0; i < sessionStorageKeys.length; i++) {
				var keyName = sessionStorageKeys[i];
				// セッションストレージから資料データを取得する
				var mtSessionStorage = $.parseJSON(sessionStorage.getItem(keyName));
				if( mtSessionStorage ){
					if( uuid == mtSessionStorage[keyName]["UUID"] ) {
//console.log("sync DELETE uuid=["+uuid+"] UUID=("+mtSessionStorage[keyName]["UUID"]+")");
						var material_id = mtSessionStorage[keyName]["material_basic"]["material_id"];
						 // サムネイル削除をゲストへ通知する（メモリー上の資料を削除する）
						 var data = {
							 command : "DOCUMENT",
							 type : "DELETE_DOCUMENT",
							 keyName : keyName,
							 localMaterialId : material_id
						 };
						 sendCommand(SEND_TARGET_ALL, data);
						 del_keyName.push(keyName);
						 del_material_id.push(material_id);
					}	// if_END
				}
			}	// for_END

			// ストレージの資料削除実行
			for ( var i = 0; i < del_keyName.length; i++) {
				removeMaterialCommon(del_keyName[i], del_material_id[i]);
			}

			// サーバのキャンバス削除実行(存在しないとは思われるが)
			var connectionInfoId = $("#connection_info_id").val();
			$.ajax({
					url: "https://" + location.host + "/negotiation/delete-canvas-material",
					type: "POST",
					dataType: "json",
					data: {connectionInfoId: connectionInfoId, materialIds : del_material_id},
				}).done(function(res) {
			});

		}	// if_END
		sessionStorage.setItem("beforeUnload", 1);	// true:リロードON
	}	//	else_END
}

/**
 * 初期化同期メッセージの非表示処理
 * @param initState
 * @returns
 */
function hideSyncMessage(responceUserId, initState){
	if(SYNC_HIDE_MESSAGE_STATUS == initState){
		// 同期が一瞬で終わるとモーダルが出て消えるのが一瞬なため、同期成功後でも3秒は表示する
		setTimeout(function (){
			// 削除ステータスになったので、初期化の同期メッセージを初期化し非表示にする
			$(".negotiation_sync_message").text("");
			$("#negotiation_sync_message_area").hide();
		} , SYNC_HIDE_MESSAGE_TIMER);
	}else{
		// 初期化途中なのでメッセージを作成する
		var syncMessage = getSyncMessage(responceUserId, initState);
		$(".negotiation_sync_message").html(syncMessage);
	}
}

/**
 * 現在の同期状態によりメッセージを変更する。
 * @param responceUserId		// 同期対象のユーザーID
 * @param initState				// 現在の同期状態
 * @returns
 */
function getSyncMessage(responceUserId, initState){
	var message = "";
	if(responceUserId in mUserIdAndUserInfoArray){
		responceUserName = mUserIdAndUserInfoArray[responceUserId];
		if(responceUserName == ""){
			responceUserName = "匿名ユーザー";
		}
		else{
			// 文字数が多き場合は8文字で切る
			if(responceUserName.length > 8){
				responceUserName = responceUserName.substring(0, 7) + "...";
			}
			responceUserName = responceUserName + "さん";
		}
		if(SYNC_SHARE_MEMO_STATUS == initState){
			message = responceUserName + "のデータと同期中です。<br>ホワイトボード同期中...<br>資料同期中...";
		}else if((SYNC_SHARE_MEMO_STATUS + SYNC_WHITE_BOARD_STATUS) == initState){
			message = responceUserName + "のデータと同期中です。<br>資料同期中...";
		}else if((SYNC_SHARE_MEMO_STATUS + SYNC_DOCUMENT_STATUS) == initState){
			message = responceUserName + "のデータと同期中です。<br>ホワイトボード同期中...";
		}else if(SYNC_WHITE_BOARD_STATUS == initState){
			message = responceUserName + "のデータと同期中です。<br>共有メモ同期中...<br>資料同期中...";
		}else if((SYNC_WHITE_BOARD_STATUS + SYNC_DOCUMENT_STATUS) == initState){
			message = responceUserName + "のデータと同期中です。<br>共有メモ同期中...";
		}else if(SYNC_DOCUMENT_STATUS == initState){
			message = responceUserName + "のデータと同期中です。<br>共有メモ同期中...<br>ホワイトボード同期中";
		}
	}else{
		message = "同期対象ユーザーとの接続が切れたので、同期に失敗しました。（再接続をおすすめします）";
	}
	return message;
}
