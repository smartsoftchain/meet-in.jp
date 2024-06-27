/**
* オペレータもしくはゲストが商談画面にログインもしくは再読み込みした際に
* 共有メモ・ホワイトボード・資料のデータを同期する。
* その他、同期を行う処理を記述する。
*
*/

var syncRetryCount = 0;				// 他ユーザーとの接続完了待ちを行ったか回数
var syncDbRetryCount = 0;			// メンバー取得(DB)接続待ちを行ったか回数
var syncValRetryCount = 0;

const SYNC_RETRY_TIMER = 1000;			// 他ユーザーとの接続完了待ちを行うタイマー
const SYNC_RETRY_MAX_COUNT = 60;		// 接続完了待ちを行う最大回数

const SYNC_DB_RETRY_TIMER = 2000;		// リトライ時間(DB)
const SYNC_DB_RETRY_MAX_COUNT = 5;		// 接続完了待ちを行う最大回数(DB)

const SYNC_HIDE_MESSAGE_TIMER = 3000;	// 同期メッセージ表示時間
const SYNC_MAX_MESSAGE_TIMER = 20000;	// メッセージ最大表示時間

const SYNC_GUEST_TIMER = 10000;			// ゲストが入室した際に待つ時間

const SYNC_SHARE_MEMO_STATUS = 1;		// 共有メモの同期が完了したときのステータス
const SYNC_WHITE_BOARD_STATUS = 2;		// ホワイトボードの同期が完了したときのステータス
const SYNC_CHAT_BOARD_STATUS = 3.5;		// チャットボードの同期が完了したときのステータス
const SYNC_DOCUMENT_STATUS = 4;			// 資料の同期が完了したときのステータス
const SYNC_HIDE_MESSAGE_STATUS = 10.5;		// 初期化の同期メッセージを削除するステータス

var beforeUnload=0;
var getOldestUserIdTimer = null;		// 同期ユーザID取得タイムアウト

var chat_next_cnt = 0;

// ===============================================
// この処理が読み込まれた際に同期処理を実行する
// ===============================================
$(function () {

	// フラグ取得
	beforeUnload = sessionStorage.getItem("beforeUnload");

	// 同期開始のメッセージを表示
	initSyncSetting();

//console.log("initSyncVariable START");
	syncValRetryCount=0;
	var initSyncVariable = setInterval(function() {
		// 同期で参照している必要な変数がセットされるまで待機
		var peerId = $("#peer_id").val();	// 自分のpeerId
		var connectionInfoId = $("#connection_info_id").val();
		syncValRetryCount++;
		//終了条件
		if( peerId || syncValRetryCount >= 5) {
			clearInterval(initSyncVariable);
//console.log("initSyncVariable END");
//console.log("initSyncVariable peerId=("+peerId+") connectionInfoId=("+connectionInfoId+") cnt=("+syncValRetryCount+")");
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
		}
		catch (e) {
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
				// チャットボード初期化
				initChatBoard();
				// ルームへの最初の入室者はセッションストレージを初期化する
				sessionStorage.clear();

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
				// チャットボード初期化
				initChatBoard();
				// ルームへの最初の入室者はセッションストレージを初期化する
				sessionStorage.clear();

				initSync(roomMemberCount);
			}
			/**
			 * ※通常はありえないが、最大回数まったが(2sec * 5回 = 10秒)秒数待った後に再帰する
			 */
			else if(syncDbRetryCount == SYNC_DB_RETRY_MAX_COUNT){
//console.log("initSyncDb roomMemberCount == SYNC_RETRY_MAX_COUNT");
				// 新規接続時の初期化処理(強制:1)
				syncRetryCount=0;
				// チャットボード初期化
				initChatBoard();

				// ルームへの最初の入室者はセッションストレージを初期化する
				sessionStorage.clear();

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

	// console.log("initSync roomMemberCount[DB]=("+roomMemberCount+") connectionUserCount=("+connectionUserCount+") syncRetryCount=("+ syncRetryCount +")");
	// DBの値と同じであれば初期化処理を実施若しくは、最大回数待ったが(3sec * 5回=15秒)接続が完了しない場合も実施する
	if(roomMemberCount == connectionUserCount || syncRetryCount == SYNC_RETRY_MAX_COUNT){
		// 入室の一番古いユーザーに共有メモ・ホワイトボード・資料・チャットのデータを要求する
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
//console.log("initSync successCallback:["+responceUserId+"]");
		if (getOldestUserIdTimer) {
			clearTimeout(getOldestUserIdTimer);
			getOldestUserIdTimer = null;
		}

		// 入室が古いユーザーが自分だった場合も初期化要求は行わない(通常はありえない)
		if(responceUserId != $('#user_id').val()){
			// 資料で使用しているストレージの初期化を行う
			syncInitDocumenSessionStoraget();
			// 共有メモ・ホワイトボード・資料・チャットのデータ同期要求を行う
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

	console.log("initSync requestInitData:getOldestUserId() START");
	getOldestUserId(successCallback);

	// 指定さされた秒数で同期処理が終了しない場合、エラーメッセージを表示し、ユーザへ再度入室を促す
	var run = function() {
		console.log("initSync 失敗");

		$("#negotiation_sync_message_area").show();
		hideSyncMessage(0, 0);

//		clearOldestUserId();	// コールバッククリア
	};
	getOldestUserIdTimer = setTimeout(run, SYNC_GUEST_TIMER);	// 10秒
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
		message = "データの同期中です。<br>共有メモ同期中...<br>資料同期中...";
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
//console.log("data_cnt=("+result.length+")");
		if( result.length != 0 ) {
			// 確認
			var chatMessageList = [];
			chat_next_cnt = 0;
			for(var iCnt = 0; iCnt < result.length; iCnt++){
				result[iCnt]["id"] = Number(result[iCnt]["id"]);
				result[iCnt]["user_id"] = Number(result[iCnt]["user_id"]);
				result[iCnt]["uu_id"] = result[iCnt]["uuid"];
				// リロード時等の場合に連投表示にするため、 取得したuuidをsession値に詰め直す
				sessionStorage.UUID = result[iCnt]["uuid"];
				result[iCnt]["message"] = result[iCnt]["message"];

				// DBから取得したmessageから data-user-nameに格納されたユーザー名を切り出す
				const messageTextStr = result[iCnt]["message"];
				const splittedMessageTextStr = messageTextStr.split('data-user-name')[1];
				const userName = splittedMessageTextStr.substring(splittedMessageTextStr.indexOf('="')+2, splittedMessageTextStr.indexOf('">'));

				if (result[iCnt]["user_id"] == $('#user_id').val()) {
					// 自分の送信メッセージ
					var template = createMyTemplate(result[iCnt]["id"], result[iCnt]["user_id"], result[iCnt]["uuid"]);
				} else {
					template = createOthersTemplate(result[iCnt]["id"], result[iCnt]["user_id"], result[iCnt]["uuid"], userName);
				}
				$('#chat_board_messages').append(template);

				// 入力文字を出力((サニタイジング済み))
				$('#chat_board_message_text'+result[iCnt]["id"]).html(result[iCnt]["message"]);
			}
		}
		else {
//console.log("データなし");
		}
	}).fail(function(data) {
	});

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
		// 同席者ではない場合のみメッセージを表示する
		if(json.from_room_mode == 1){
			// 他のユーザーが自分と同期を始めたメッセージを出す
			showSyncResuponceMessage(json.requestUserId);
		}
		// 共有メモの情報を要求者へ返す
		responceShareMemoSync(json.requestUserId);
		// チャットの情報を要求者へ返す
		responceChatBoardSync(json.requestUserId);
		// ホワイトボードの情報を要求者へ返す
		responceWhiteBoardSync(json.requestUserId);
		// 資料の情報を要求者へ返す
		responceDocumentSync(json.requestUserId);
		// 電子契約書の情報を要求者へ返す
		responceEContractSync(json.requestUserId);
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
			// 共有メモのスクロール位置を設定
			$("div#share_memo_area").scrollTop(json.scrollTop);
			$("div#share_memo_area").scrollLeft(json.scrollLeft);
		}

		for (var key in mMeetinFlashSecurityPanelUserIdTable) {
			$('#negotiation_target_video_' + key).find('.video_big_icon').trigger("click");
			break;
		}
	}
	else if(json.type == "RESPONSE_CHAT"){
		// チャットの内容が送信されたので、反映する。

		// チャット相手方が入力中の場合の表示を追加する
		if (json.inputState) {
			const existInputStateElement = $('.input_state').length;
			if (!existInputStateElement) {
				const inputtingImgElement = '<img id="inputState'+'" src="/img/now_inputting.png">';
				addInputtingTemplate(inputtingImgElement, chatCnt, json);
				$('#chat_board_message_text'+chatCnt).addClass('input_state');
			}
		}

		// initStateを変更
		initState += SYNC_CHAT_BOARD_STATUS;
		// 初期化同期メッセージの制御
		hideSyncMessage(json.responceUserId, initState);

		// チャットが表示されている場合は表示する
		if(json.showFlg){
			NEGOTIATION.chatBoard();
		}

		// messages受け取り 自sessionに入れ直す 
		if (json.messages && json.messages !== "[]\n") {
			sessionStorage.setItem('chat_messages', json.messages);
		}

		// 新レイアウトで追加された関数の呼び出し
		swapToggleHide(NEGOTIATION.rightAreaDom,RIGHT_AREA_SHARE_MEMO);

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
//console.log("get-material-list");
				var myUUID = localStorage.UUID;
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
					// 資料データを同期後、自分でアップした資料が存在する場合はルームへの再入室なので
					// 再表示フラグをON(1)にする。
					// 自身がUPした資料の判定はUUIDの値により判定する
					if( myUUID ) {
						if( myUUID === materialDict[keyName][keyName]["UUID"] ) {
//console.log("MY資料データ::UUID["+ materialDict[keyName][keyName]["UUID"] +"]");
							beforeUnload = 1;
							sessionStorage.setItem("beforeUnload", beforeUnload);
						}
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

	} else if (json.type === "RESUPONCE_AUDIO_TEXT") {
		// 文字起こしの内容が送信されたら、反映する。
		syncAudioTextSpInterFace(json);
	}
}

/**
 * 他のユーザーが自分と同期を開始したときのメッセージを表示
 * @param responceUserId
 * @returns
 */
function showSyncResuponceMessage(requestUserId){
	var message = "データの同期を開始しました。<br>再接続や画面更新をお控えください。";
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
 * チャットの情報を要求者へ送信する
 * @returns
 */
function responceChatBoardSync(requestUserId){

	// 自session値に入れてる chat_messagesを取得する
	var messages = sessionStorage.getItem('chat_messages');

	// チャットの内容を要求者へ送信する
	var data = {
			command : "INIT_SYNC",
			type : "RESPONSE_CHAT",
			showFlg : $("#chat_board_messages").is(':visible'),
			messages: messages,
			top : $("#chat_board_area").css("top"),
			left : $("#chat_board_area").css("left"),
			height : $("#chat_board_area").css('height'),
			width : $("#chat_board_area").css("width"),
			scrollTop : $("#chat_board_area").scrollTop(),
			scrollLeft : $("#chat_board_area").scrollLeft(),
			responceUserId : $('#user_id').val(),
			inputState: chatInputState,
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
 * 電子契約書の情報を要求者へ送信する
 * @param requestUserId
 * @returns
 */
function responceEContractSync(requestUserId){
	// 電子契約書の入力情報を取得
	var partner = $("#partner-area").find('.partner_setting_input_area');

	var lastname = [];
	var firstname = [];
	var organization_name = [];
	var title = [];
	var email = [];
	$('.partner_setting_item').each(function(i, partner) {
		lastname[i] = $(partner).find('.partner_setting_input_name.lastname').val();
		firstname[i] = $(partner).find('.partner_setting_input_name.firstname').val();
		organization_name[i] = $(partner).find('.partner_setting_input.organization_name').val();
		title[i] = $(partner).find('.partner_setting_input.title').val();
		email[i] = $(partner).find('.partner_setting_input.email').val();
	});

	var data = {
		command: "E_CONTRACT",
		type: "TOGGLE_E_CONTRACT",
		display: $("#e_contract_area").css('display'),

		id:                     $('#caseId').val(),
		client_id:              $('#client_id').val(),
		staff_type:             $('#staff_type').val(),
		staff_id:               $('#staff_id').val(),
		case_title:             $('#case_title').val(),
		e_contract_document_id: $('#e_contract_document_id option:selected').val(),
		have_amount:            $('#have_amount:checked').val(),
		amount:                 $('#amount').val(),
		agreement_date:         $('#agreement_date').val(),
		effective_date:         $('#effective_date').val(),
		expire_date:            $('#expire_date').val(),
		auto_renewal:           $('#auto_renewal:checked').val(),
		management_number:      $('#management_number').val(),
		comment:                $('#comment').val(),
		partner:				partner,
		lastname:               lastname,
		firstname:              firstname,
		organization_name:      organization_name,
		title:                  title,
		email:                  email,
	};
	sendCommand(SEND_TARGET_ALL, data);
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
 * SPには2021/07/16時点で同期messageエリアない/negotiation/negotiation-sync-message.tpl
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
 * SPには2021/07/16時点で同期messageエリアない/negotiation/negotiation-sync-message.tpl
 * @param responceUserId		// 同期対象のユーザーID
 * @param initState				// 現在の同期状態
 * @returns
 */
function getSyncMessage(responceUserId, initState){
	var message = "";
	if(responceUserId in mUserIdAndUserInfoArray){
		if(SYNC_SHARE_MEMO_STATUS == initState){ //共有メモ: 1 ホワイトボード: 2, チャット3.5, 資料:4, 初期化:10.5
			message = "データの同期中です。<br>ホワイトボード同期中...<br>資料同期中...<br>チャット同期中..."; // 1
		}else if(SYNC_WHITE_BOARD_STATUS == initState){
			message = "データの同期中です。<br>共有メモ同期中...<br>資料同期中...<br>チャット同期中..."; // 2
		}else if(SYNC_CHAT_BOARD_STATUS == initState){
			message = "データの同期中です。<br>共有メモ同期中...<br>ホワイトボード同期中...<br>資料同期中..."; // 3.5
		}else if(SYNC_DOCUMENT_STATUS == initState){
			message = "データの同期中です。<br>共有メモ同期中...<br>ホワイトボード同期中...<br>チャット同期中..."; // 4
		}else if((SYNC_SHARE_MEMO_STATUS + SYNC_WHITE_BOARD_STATUS) == initState){ // 1+2
			message = "データの同期中です。<br>資料同期中...<br>チャット同期中...";
		}else if((SYNC_SHARE_MEMO_STATUS + SYNC_CHAT_BOARD_STATUS) == initState){ // 1+3.5
			message = "データの同期中です。<br>ホワイトボード同期中...<br>資料同期中...";
		}else if((SYNC_SHARE_MEMO_STATUS + SYNC_DOCUMENT_STATUS) == initState){ // 1+4
			message = "データの同期中です。<br>ホワイトボード同期中...<br>チャット同期中..."; 
		}else if((SYNC_WHITE_BOARD_STATUS + SYNC_CHAT_BOARD_STATUS == initState)){ // 2+3.5
			message = "データの同期中です。<br>共有メモ同期中...<br>資料同期中...";
		}else if((SYNC_WHITE_BOARD_STATUS + SYNC_DOCUMENT_STATUS) == initState){ // 2+4
			message = "データの同期中です。<br>共有メモ同期中...<br>チャット同期中...";
		}else if((SYNC_CHAT_BOARD_STATUS + SYNC_DOCUMENT_STATUS) == initState){ // 3.5+4
			message = "データの同期中です。<br>共有メモ同期中...<br>ホワイトボード同期中...";
		}else if((SYNC_SHARE_MEMO_STATUS + SYNC_WHITE_BOARD_STATUS + SYNC_CHAT_BOARD_STATUS) == initState){　//1+2+3.5 
			message = "データの同期中です。<br>資料同期中";
		}else if((SYNC_SHARE_MEMO_STATUS + SYNC_WHITE_BOARD_STATUS + SYNC_DOCUMENT_STATUS) == initState){ //1+2+4
			message = "データの同期中です。<br>チャット同期中";
		}else if((SYNC_WHITE_BOARD_STATUS + SYNC_CHAT_BOARD_STATUS + SYNC_DOCUMENT_STATUS) == initState){ //2+3.5+4
			message = "データの同期中です。<br>共有メモ同期中";
		}else if((SYNC_SHARE_MEMO_STATUS + SYNC_CHAT_BOARD_STATUS + SYNC_DOCUMENT_STATUS) == initState){ //1+3.5+4
			message = "データの同期中です。<br>ホワイトボード同期中";
		}
	}else{
		message = "同期対象ユーザーとの接続が切れたので、同期に失敗しました。（再接続をおすすめします）";
	}
	return message;
}
