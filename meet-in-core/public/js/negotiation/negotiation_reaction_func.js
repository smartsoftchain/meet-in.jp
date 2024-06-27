//////////////////////////////////////////////////////////
// 挙手関連
//////////////////////////////////////////////////////////

// roomTOPのipadPC用表示のスタイル調整
  $(document).ready(function () {
    if (USER_PARAM_IS_IPAD_PC) {
      adjustStyleForIpadPc();
    }
  });
	$(window).bind('orientationchange', function() { 
    adjustStyleForIpadPc();
  });

  function adjustStyleForIpadPc() {
    if (Math.abs(window.orientation) === 90) {
      // ipad　横用の調整(縦用から戻す)
      $('.material-icons').css('font-size', '24px');
    }else {
      // ipad 縦用の調整
      $('.material-icons').css('font-size', '23px');
    }
  }

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

    // 自分が挙手したときに、roomヘッダー箇所のアイコンを着色のものに差し替える
    $('#button_raise_your_hand').find('span').addClass('icon-hand-active');
    $('#button_raise_your_hand').find('span').removeClass('icon-hand');

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
	const targetElements = $('#reaction_tooltips_area').find('.raise_hands_tooltip');
	let toolTipsCount = $('.raise_hands_tooltip').length + $('.good_reaction_tooltip').length;
	if (targetElements.length === 0) {
		// 表示0個の場合は、必ず新規
		existsPeerIdArray.push(peerId);
		insertRaiseHandTooltip(peerId, userName, 65*(toolTipsCount + 1));
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
			toolTipsCount = $('.raise_hands_tooltip').length + $('.good_reaction_tooltip').length;
			insertRaiseHandTooltip(peerId, userName, 65*(toolTipsCount + 1));
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
	const raiseHandTooltipElem = 
	`<div class="raise_hands_tooltip reaction_tooltip" data-hand-peerId="${peerId}" style="top:${topPosition}px;">
	<div class="raise_hands_modal_content">
		<span class="user_name_text_area">
			<img class="icon-hand-in-modal" src="/img/icon_raise_hand_in_tooltip.svg"/>
			<span class="user_name_text">${userName}</span>が挙手しています
		</span>
	</div>
	<span class="close_reaction_tooltip icon-close"></span>
</div>`;
	$('#reaction_tooltips_area').append(raiseHandTooltipElem);

	// 各ツールチップのsetTimeoutIdを個別に保持するため、dictionaryに入れる
		setTimeOutInsertRaiseHandToolTipVar[peerId]
		= setTimeout(() => {
      setTimeoutQueue('data-hand-peerId', peerId);
		}, 5000); // 5秒後にツールチップを消す
}

//////////////////////////////////////////////////////////
// リアクション関連
//////////////////////////////////////////////////////////

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
	const targetElements = $('#reaction_tooltips_area').find('.good_reaction_tooltip');
	let toolTipsCount = $('.raise_hands_tooltip').length + $('.good_reaction_tooltip').length;
	if (targetElements.length === 0) {
		// 表示0個の場合は、必ず新規
		existsPeerIdArray.push(peerId);
		insertGoodReactionTooltip(peerId, userName, 65*(toolTipsCount + 1));
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
			toolTipsCount = $('.raise_hands_tooltip').length + $('.good_reaction_tooltip').length;
			insertGoodReactionTooltip(peerId, userName, 65*(toolTipsCount + 1));
		}
	}
}

/**
 * いいねリアクションのツールチップDOMを作成する処理
 * @argument {number} peerId 
 * @argument {string} userName
 * @argument {number} topPosition
 * @return {*} 返り値なし 
 */
function insertGoodReactionTooltip(peerId, userName, topPosition) {
	const goodReactionTooltipElem = 
	`<div class="good_reaction_tooltip reaction_tooltip" data-good-peerId="${peerId}" style="top:${topPosition}px;">
	<div class="good_reaction_modal_content">
		<span class="user_name_text_area">
			<img class="icon-good-in-modal" src="/img/icon_good_reaction_in_tooltip.svg"/>
			<span class="user_name_text">${userName}</span>がいいねしました
		</span>
	</div>
	<span class="close_reaction_tooltip icon-close"></span>
</div>`;
	$('#reaction_tooltips_area').append(goodReactionTooltipElem);
	// 各ツールチップのsetTimeoutIdを個別に保持するため、dictionaryに入れる 
		setTimeOutInsertGoodReactionToolTipVar[peerId]
		= setTimeout(() => {
			setTimeoutQueue('data-good-peerId', peerId);
		}, 5000); // 5秒後にツールチップを消す
}

//////////////////////////////////////////////////////////
// 挙手・リアクション関連共通処理
//////////////////////////////////////////////////////////
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
 * 挙手・いいねツールチップのsetTimeout管理dictionaryにツールチップを消す処理を入れていく処理
 * @return {string} dataAttribute カスタムデータ属性名 
 * @return {string} peerId ユーザー識別用のpeerID 
 */
function setTimeoutQueue(dataAttribute, peerId) {
  $('#reaction_tooltips_area').find(`div[${dataAttribute}=${peerId}]`).fadeOut(300).queue(function() {
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
	// モニタリングモード時はなにもしない（音出さない、ツールチップ表示しない）
	if ($('#room_mode').val() === '2' ) {
		return;
	}

	// リアクション受取、受け取った分のツールチップを作成・表示する（５個まで　溢れたら一番上のもの消して詰めて表示）
	const peerId = json.from_peer_id;
	const userName = json.user_name;

	if (json.type === "RAISE_HANDS") {
	//挙手時に通知音を鳴らす いいねは音無し
	playSoundOfRaiseHand();
	showRaiseHandToolTip(peerId, userName);
	} else if (json.type === "GOOD_REACTION") {
		showGoodReactionToolTip(peerId, userName);
	}
}

// 挙手・いいねツールチップを×ボタンで消す処理
$('#reaction_tooltips_area').on('click', '.close_reaction_tooltip', function() {
	const deleteTargetElem = $(this).closest('.reaction_tooltip');

	const deleteTargetHandPeerId = deleteTargetElem.attr('data-hand-peerId');
	const deleteTargetGoodPeerId = deleteTargetElem.attr('data-good-peerId');

	// ×で消したものはsetTimeoutを止める　消さないと次出したものが５秒に引っかかって、すぐ消えた気がする
	if (typeof deleteTargetHandPeerId !== 'undefined') {
		clearTimeout(setTimeOutInsertRaiseHandToolTipVar[deleteTargetHandPeerId]);
	}
	if (typeof deleteTargetGoodPeerId !== 'undefined') {
		clearTimeout(setTimeOutInsertGoodReactionToolTipVar[deleteTargetGoodPeerId]);
	}

	$(this).closest('.reaction_tooltip').remove();
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
	const targetElements = $('#reaction_tooltips_area').find('.reaction_tooltip');
	if(targetElements.length > 0) {
		targetElements.each(function(index) {
			$(this).css('top', 65*(index + 1));
		});
	}

	// 自分の挙手がなくなったらroomヘッダー箇所のアイコンを未着色のものに戻す
	const ownPeerId = $('#peer_id').val();
	const raiseHandTooltipElementLength = $('#reaction_tooltips_area').find(`div[data-hand-peerId=${ownPeerId}]`).length;
		if (raiseHandTooltipElementLength === 0) {
			$('#button_raise_your_hand').find('span').addClass('icon-hand');
			$('#button_raise_your_hand').find('span').removeClass('icon-hand-active');
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
		const targetHandElem = $('#reaction_tooltips_area').find(`div[data-hand-peerId=${targetPeerId}]`);
		const targetGoodElem = $('#reaction_tooltips_area').find(`div[data-good-peerId=${targetPeerId}]`);
		
		if(targetHandElem.length) {
			clearTimeout(setTimeOutInsertRaiseHandToolTipVar[targetPeerId]);　// 挙手セットタイムアウトを削除する
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