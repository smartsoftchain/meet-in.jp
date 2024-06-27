/**
 * 挙手関連 
 */
// 挙手イベントで使用するグローバル変数
// 挙手ツールチップ作成のセットタイムアウトを格納するグローバル変数(dictionary)
const setTimeOutInsertRaiseHandToolTipVar = {};
// いいねツールチップ作成のセットタイムアウトを格納するグローバル変数(dictionary)
const setTimeOutInsertGoodReactionToolTipVar = {};

/**
 * 「挙手をする」ボタンの押下イベント
 */
NEGOTIATION.buttonRaiseHands = function () {
	// 商談がまだ終わってなければ
	if (!NEGOTIATION.isNegotiationFinish) {

		const peerId = $('#peer_id').val();
		const userName = setUserName();

		// 自分のツールチップ出現させる
		showRaiseHandToolTip(peerId, userName);

		// 相手に挙手したことを送る　user_name, peer_idはfrom_peer_idに入ってる
		var data = {
			command: "REACTION",
			type: "RAISE_HANDS",
			user_name : userName,
		};
		sendCommand(SEND_TARGET_ALL, data);
	}
};


/**
 * 挙手の通知音を鳴らす処理
 * @return {*} 返り値なし 
 */
function playSoundOfRaiseHand() {
	
	// iOSでも音が鳴るようにしたやり方(Web Audio API方式)
	wa.loadFile("/webrtc/sounds/raise-hands-bell.wav", function(buffer) {
		wa.play(buffer);
	});
}

/**
 * 表示されている挙手・いいねツールチップの個数に応じて、ツールチップを追加等する処理
 * @argument {number} peerId 
 * @argument {string} userName
 * @return {*} 返り値なし 
 */
function showRaiseHandToolTip(peerId, userName) {
	// 表示管理用の、peerIdを格納していく配列
	const existsPeerIdArray = [];
	// 現在表示されているツールチップ要素
	const targetElements = $('#reaction_tooltips_area_sp').find('.raise_hands_tooltip_sp');
	let toolTipsCount = $('.raise_hands_tooltip_sp').length + $('.good_reaction_tooltip_sp').length;
	if (targetElements.length === 0) {
		// 表示0個の場合は、必ず新規
		existsPeerIdArray.push(peerId);
		insertRaiseHandTooltip(peerId, userName, 70*(toolTipsCount + 1));
	}
	else if(targetElements.length > 0) {
		// peerId配列に、現在表示されているツールチップのdata-hand-peerIdを詰め直す
		targetElements.each(function() {
			if (!existsPeerIdArray.includes($(this).attr('data-hand-peerId'))) {
				existsPeerIdArray.push($(this).attr('data-hand-peerId'));
			}
		});

		// 新規のpeer_idであればツールチップを追加
		if (!existsPeerIdArray.includes(peerId)) {
			// 5個以上のとき、一番上を消してツールチップを詰める
			if (toolTipsCount >= 5) {
				deleteAndRearrangeReactionTooltips(targetElements);
			}
			toolTipsCount = $('.raise_hands_tooltip_sp').length + $('.good_reaction_tooltip_sp').length;
			insertRaiseHandTooltip(peerId, userName, 70*(toolTipsCount + 1));
		}
	}
}

/**
 * 挙手のツールチップDOMを作成する処理
 * @argument {number} peerId 
 * @argument {string} userName
 * @argument {number} topPosition
 * @return {*} 返り値なし 
 */
function insertRaiseHandTooltip(peerId, userName, topPosition) {
	let nameTemplate = `<span class="user_name_text">${userName}</span>が挙手しています`;
	const userNameCount = userName.replace(/\s+/g, '').length;
	if(userNameCount > 10) { // iPhone8(4.7inch) 11文字で少し切れる
		nameTemplate = `<span class="user_name_text">${userName}</span><br><span class="adjust_next_line_template">が挙手しています</span>`;
	}
	const raiseHandTooltipElem = 
	`<div class="raise_hands_tooltip_sp reaction_tooltip_sp" data-hand-peerId="${peerId}" style="top:${topPosition}px;">
	<div class="raise_hands_modal_content">
		<span class="user_name_text_area">
			<img class="icon-hand-in-modal" src="/img/sp/svg/sp_raise_hand_icon_in_tooltip.svg"/>
			${nameTemplate}
		</span>
	</div>
	<span class="close_reaction_tooltip_sp icon-close"></span>
</div>`;
	$('#reaction_tooltips_area_sp').append(raiseHandTooltipElem);

	// 各ツールチップのsetTimeoutIdを個別に保持するため、dictionaryに入れる
		setTimeOutInsertRaiseHandToolTipVar[peerId]
		= setTimeout(() => {
			setTimeoutQueue('data-hand-peerId', peerId);
		}, 5000); // 5秒後にツールチップを消す
}


/**
 * いいねリアクション関連 
 */

/**
 * 「リアクション」ボタンの押下イベント
 */
NEGOTIATION.buttonReaction = function () {
	// 商談がまだ終わってなければ
	if (!NEGOTIATION.isNegotiationFinish) {

		const peerId = $('#peer_id').val();
		const userName = setUserName();

		// 自分のツールチップ出現させる
		showGoodReactionToolTip(peerId, userName);

		// 相手に挙手したことを送る　user_name, peer_idはfrom_peer_idに入ってる
		var data = {
			command: "REACTION",
			type: "GOOD_REACTION",
			user_name : userName,
		};
		sendCommand(SEND_TARGET_ALL, data);
	}
};



/**
 * 表示されている挙手・いいねツールチップの個数に応じて、いいねツールチップを追加等する処理
 * @argument {number} peerId 
 * @argument {string} userName
 * @return {*} 返り値なし 
 */
function showGoodReactionToolTip(peerId, userName) {
	// 表示管理用の、peerIdを格納していく配列
	const existsPeerIdArray = [];
	// 現在表示されているツールチップ要素
	const targetElements = $('#reaction_tooltips_area_sp').find('.good_reaction_tooltip_sp');
	let toolTipsCount = $('.raise_hands_tooltip_sp').length + $('.good_reaction_tooltip_sp').length;
	if (targetElements.length === 0) {
		// 表示0個の場合は、必ず新規
		existsPeerIdArray.push(peerId);
		insertGoodReactionTooltip(peerId, userName, 70*(toolTipsCount + 1));
	}
	else if(targetElements.length > 0) {
		// peerId配列に、現在表示されているツールチップのdata-good-peerIdを詰め直す
		targetElements.each(function() {
			if (!existsPeerIdArray.includes($(this).attr('data-good-peerId'))) {
				existsPeerIdArray.push($(this).attr('data-good-peerId'));
			}
		});

		// 新規のpeer_idであればツールチップを追加
		if (!existsPeerIdArray.includes(peerId)) {
			// 5個以上のとき、一番上を消してツールチップを詰める
			if (toolTipsCount >= 5) {
				deleteAndRearrangeReactionTooltips(targetElements);
			}
			toolTipsCount = $('.raise_hands_tooltip_sp').length + $('.good_reaction_tooltip_sp').length;
			insertGoodReactionTooltip(peerId, userName, 70*(toolTipsCount + 1));
		}
	}
}

/**
 * リアクションのツールチップDOMを作成する処理
 * @argument {number} peerId 
 * @argument {string} userName
 * @argument {number} topPosition
 * @return {*} 返り値なし 
 */
function insertGoodReactionTooltip(peerId, userName, topPosition) {
	let nameTemplate = `<span class="user_name_text">${userName}</span>がいいねしました`;
	const userNameCount = userName.replace(/\s+/g, '').length;
	if(userNameCount > 10) { // iPhone8(4.7inch) 11文字で少し切れる
		nameTemplate = `<span class="user_name_text">${userName}</span><br><span class="adjust_next_line_template">がいいねしました</span>`;
	}

	const goodReactionTooltipElem = 
	`<div class="good_reaction_tooltip_sp reaction_tooltip_sp" data-good-peerId="${peerId}" style="top:${topPosition}px;">
	<div class="good_reaction_modal_content">
		<span class="user_name_text_area">
			<img class="icon-good-in-modal" src="/img/sp/svg/sp_good_reaction_icon_in_tooltip.svg"/>
				${nameTemplate}
		</span>
	</div>
	<span class="close_reaction_tooltip_sp icon-close"></span>
</div>`;
	$('#reaction_tooltips_area_sp').append(goodReactionTooltipElem);
	// 各ツールチップのsetTimeoutIdを個別に保持するため、dictionaryに入れる
		setTimeOutInsertGoodReactionToolTipVar[peerId]
		= setTimeout(() => {
			setTimeoutQueue('data-good-peerId', peerId);
		}, 5000); // 5秒後にツールチップを消す
}

/**
 * 挙手・リアクション関連共通処理
 */

/**
 * ユーザー名を判定する処理
 * @return {string} userName ユーザー名（ユーザー一覧と同値） 
 */
function setUserName() {
	let userName = '匿名ユーザー';

	if ($("#user_name").length && $("#user_name").val() !== '') {
		userName = $("#user_name").val();
	} 
	else if ($("#my_user_info").val() !== '') {
		userName = $("#my_user_info").val();
	}

	return userName;
}

/**
 * 挙手・いいねツールチップのsetTimeoutに入れる処理
 * @return {string} dataAttribute カスタムデータ属性名 
 * @return {string} peerId ユーザー識別用のpeerID 
 */
function setTimeoutQueue(dataAttribute, peerId) {
  $('#reaction_tooltips_area_sp').find(`div[${dataAttribute}=${peerId}]`).fadeOut(300).queue(function() {
    $(this).remove();
    // 消した後に、ツールチップを詰める
    rearrangeReactionTooltips();
  });
}

/**
 * 相手のリアクションイベント通知を受け取って、挙手・いいねツールチップを自画面に表示する
 * @argument {object} json　イベント通知時に送られてくるjson
 * @return {*} 返り値なし 
 */
function receiveReactionCommandJson(json) {
	// モニタリングモード時は、何もしない（音出ない、ツールチップ出ない）
	if ($('#room_mode').val() === '2' ) {
		return;
	}
	// リアクション受取、受け取った分のツールチップを作成・表示する（５個まで　溢れたら一番上のもの消して詰めて表示）
	const peerId = json.from_peer_id;
	const userName = json.user_name;

	if (json.type === "RAISE_HANDS") {
		//挙手時に通知音を鳴らす
		playSoundOfRaiseHand();
		showRaiseHandToolTip(peerId, userName);
	} else if (json.type === "GOOD_REACTION") {
		showGoodReactionToolTip(peerId, userName);
	}
}

// 挙手ツールチップを×ボタンで消す処理
$('#reaction_tooltips_area_sp').on('click', '.close_reaction_tooltip_sp', function() {
	const deleteTargetElem = $(this).closest('.reaction_tooltip_sp');

	const deleteTargetHandPeerId = deleteTargetElem.attr('data-hand-peerId');
	const deleteTargetGoodPeerId = deleteTargetElem.attr('data-good-peerId');

	// ×で消したものはsetTimeoutを止める
	if (typeof deleteTargetHandPeerId !== 'undefined') {
		clearTimeout(setTimeOutInsertRaiseHandToolTipVar[deleteTargetHandPeerId]);
	}
	if (typeof deleteTargetGoodPeerId !== 'undefined') {
		clearTimeout(setTimeOutInsertGoodReactionToolTipVar[deleteTargetGoodPeerId]);
	}
	$(this).closest('.reaction_tooltip_sp').remove();
	// 消した後に、ツールチップを詰める
	rearrangeReactionTooltips();
});

/**
 * 挙手・いいねツールチップが５個以上のとき、一番上を消して詰める処理
 * @return {*} none 返り値なし 
 */
function deleteAndRearrangeReactionTooltips(targetElements) {
	// 5個以上のとき、一番上を消す
	targetElements.first().remove();
	// 消した後に、ツールチップを詰める
	rearrangeReactionTooltips();
}

/**
 * 挙手・いいねツールチップの表示位置を整理する処理
 * @return {*} none 返り値なし 
 */
function rearrangeReactionTooltips() {
	const targetElements = $('#reaction_tooltips_area_sp').find('.reaction_tooltip_sp');
	if(targetElements.length > 0) {
		targetElements.each(function(index) {
			$(this).css('top', 70*(index + 1));
		});
	}
}

/**
 * 相手の接続停止イベント通知を受け取って、自画面に表示されている該当挙手・いいねツールチップを消す
 * @argument {object} json　イベント通知時に送られてくるjson
 * @return {*} 返り値なし 
 */
function receiveCloseConnectionJson(json) {
	if (json.command === "CLOSE_CONNECTION") {
		const targetPeerId = json.from_peer_id;
		const targetHandElem = $('#reaction_tooltips_area_sp').find(`div[data-hand-peerId=${targetPeerId}]`);
		const targetGoodElem = $('#reaction_tooltips_area_sp').find(`div[data-good-peerId=${targetPeerId}]`);
		
		if(targetHandElem.length) {
			clearTimeout(setTimeOutInsertRaiseHandToolTipVar[targetPeerId]); // セットタイムアウトを削除する
			targetHandElem.remove();
		}
		if(targetGoodElem.length) {
			clearTimeout(setTimeOutInsertGoodReactionToolTipVar[targetPeerId]);　// いいねセットタイムアウトを削除する
			targetGoodElem.remove();
		}
		// 消した後に、ツールチップを詰める
		rearrangeReactionTooltips();
	}
}