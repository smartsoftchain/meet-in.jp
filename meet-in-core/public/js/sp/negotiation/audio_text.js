/*
 * 文字起こしに使用するJS群
 *
 */
const PAGENATION_PARENT_ELEMENT_SP = 'audio-text-pagenation';
const CONETNTAREA_PARENT_ELEMENT_SP = "audio-text-boxarea";
const AUDIOTEXT_PAGEID_DATA_SP ='data-audio_text_page_id';

//文字起こしモーダルにテキストを追加するのための配列
var audioTextData = [];
//テキストエリアの切り替え用変数
var viewIndex = 0;
var viewFlg = false;
// １ページの最大文字数(超過で新ページ作成)
const audioTextDataMaxPageLengthSp = 1000;

$(function ()
{
	/**
	 * 文字起こし表示領域リサイズ処理
	 */
	$('#audio-textarea-resize-button').on('click', function(){
		sizeSwitchAudioTextFile();
	})

	/**
	 * 文字起こしモーダルドラッグ＆ドロップ処理
	 */
    $('#negotiation-audio-text-area').draggable( {
		handle: ".audio-text-header",
		containment: ".content__wrap"
    });

});

function receiveAudioTextSpJson(json)
{
	if($("#room_mode").val() == ROOM_MODE_2){
		return;
	}

	// 同期を受け取る.
	if(json.type == "SEND_TEXT") {
		audioTextData[json.viewIndex-1] = json.audioTextData;
		if (viewFlg) {
			// syncAudioTextSpInterFaceの後に実行されるようにする
			setAudioTextSpPagenation(json.viewIndex);
			formatAudioTextSpData(json.viewIndex);
		}

		// setAudioTextSpPagenationの後に実行する.
		$(".audio-text-boxarea-page.current").scrollTop(json.scrollTop);
		$(".audio-text-boxarea-page.current").scrollLeft(json.scrollLeft);
	} else if(json.type == "OPEN_WINDOW") {
		viewFlg = true;
		syncAudioTextSpInterFace(json);
	} else if(json.type == "CLOSE_WINDOW") {
		syncAudioTextSpInterFace(json);
	} else if(json.type == "END") {
		clearAudioTextData();
	}
}

function syncAudioTextSpInterFace(json)
{
	if($("#room_mode").val() == ROOM_MODE_2){
		return;
	}

	// ゲストか判定する.
	if(json.hostId == undefined || $.cookie('audio_text_host_id') == undefined || json.hostId != $.cookie('audio_text_host_id')) {
		setAudioTextGuestInterFace();
	}
	audioTextData = json.audioTextData == undefined ? [] : json.audioTextData;
	viewIndex = json.viewIndex == undefined ? 0 : json.viewIndex;
	viewFlg = true;
	formatAudioTextSpData(0);
    setAudioTextSpPagenation(viewIndex);

	if(json.showFlg){
		audioTextInfoOpenSp();
	} else {
		$('#negotiation-audio-text-area').css("visibility","hidden");
	}

}

function audioTextInfoOpenSp()
{
	// 商談がまだ終わってなければ
	if (!NEGOTIATION.isNegotiationFinish)
	{
		if($("#room_mode").val() == ROOM_MODE_2) {
			setAudioTextMonitoringInterFace();
		}

		if(!isAudioTextGuest())
		{
			audioTextOpen();
		} else {
			$('#negotiation-audio-text-area').css("visibility","visible");
		}
	}
}

// モニタリング状態.
function setAudioTextMonitoringInterFace() {
	$("#negotiation-audio-text-area").addClass("monitoring_mode");
}

function isAudioTextGuest() {
	return document.getElementById("negotiation-audio-text-area").classList.contains("guest_mode");
}
function setAudioTextGuestInterFace() {
	$("#negotiation-audio-text-area").addClass("guest_mode");
}

function getNegotiationAudioTextAreaHeightPx() {
	return $("#negotiation-audio-text-area").css('height');
}

/**
 * サーバ側の文字起こし中断処理を止める.
 */
const audioTextSpInfo = function(event)
{
	$.ajax({
		url: "/get-audio/audio-text-info",
		type: "POST",
		data: {}
	}).done(function (res) {
		let data = $.parseJSON(res);
		event(data);
	}).fail(function (res) {
		console.log('error')
	});
};

function audioTextOpen()
{
	let target = '#negotiation-audio-text-area';
	if ($(target).css("visibility") == 'hidden') {
		$(target).css("visibility","visible");

		sendAudioTextOpenWindow();
	} else {
		$(target).css("visibility","hidden");
		sendAudioTextCloseWindow();
	}
}

function sendAudioTextOpenWindow()
{
	if($("#room_mode").val() == ROOM_MODE_2){
		return;
	}

	var data = {
		command : "AUDIO_TEXT",
		type : "OPEN_WINDOW",
		hostId:$("#negotiation-audio-text-area").data('host_id'),
		top : $("#negotiation-audio-text-area").css("top"),
		left : $("#negotiation-audio-text-area").css("left"),
		height : getNegotiationAudioTextAreaHeightPx(),
		width : $("#negotiation-audio-text-area").css("width"),
		scrollTop : $(".audio-text-boxarea-page.current").scrollTop(),
		scrollLeft : $(".audio-text-boxarea-page.current").scrollLeft(),
		audioTextData : getAudioTextDataByTextArea(),
		showFlg: isSyncAudioText()
	};
	sendCommand(SEND_TARGET_ALL, data);
}

function sendAudioTextCloseWindow()
{
	if($("#room_mode").val() == ROOM_MODE_2){
		return;
	}

	var data = {
		command : "AUDIO_TEXT",
		type : "CLOSE_WINDOW",
		hostId:$("#negotiation-audio-text-area").data('host_id'),
		top : $("#negotiation-audio-text-area").css("top"),
		left : $("#negotiation-audio-text-area").css("left"),
		height : getNegotiationAudioTextAreaHeightPx(),
		width : $("#negotiation-audio-text-area").css("width"),
		scrollTop : $(".audio-text-boxarea-page.current").scrollTop(),
		scrollLeft : $(".audio-text-boxarea-page.current").scrollLeft(),
		showFlg: false
	};
	sendCommand(SEND_TARGET_ALL, data);
}

/*
 * 文字起こしの状態を初期化する(次文字起こしを押したユーザがホストになる).
 */
function clearAudioTextData()
{
	//元々の判定の状態次第.
    audioTextSpInfo(function(data)
    {
		audioTextData = [];
		viewIndex = 0;
		$("#"+PAGENATION_PARENT_ELEMENT_SP).empty();
		$("#"+CONETNTAREA_PARENT_ELEMENT_SP).empty();

		$("#negotiation-audio-text-area").removeClass("guest_mode");

		$("#negotiation-audio-text-area").data('host_id', null);
		$.removeCookie('audio_text_host_id')

		if(data.code == -1) {
			$('#button_audio_text').css("visibility","hidden");
		} else {
			$('#button_audio_text').css("visibility","visible");
		}

		$('#negotiation-audio-text-area').css("visibility","hidden");
    });

}

// Object生成.
function objectTextWithStartTime(text, startTime) {
	return {
		text: text,
		starttime: startTime
	}
}

function getAudioTextDataByTextArea()
{
	let _audioTextData = [];
	[].slice.call(document.getElementById(CONETNTAREA_PARENT_ELEMENT_SP).querySelectorAll('['+AUDIOTEXT_PAGEID_DATA_SP+']'))
	.map(function(e, index) {
		if(_audioTextData[index] == undefined) {
			_audioTextData.push([]);
		}
		let text = e.value.replace(/\r\n|\r/g, "\n");
		lines = text.split('\n');
		for (let i = 0; i < lines.length; i++) {
			_audioTextData[index].push(objectTextWithStartTime(lines[i], i+1));
		}
	});
	return _audioTextData.slice();
}

/**
 *  文字起こししたデータを文字列にして取得する.
 */
function getAudioTextDataString()
{
	let text = '';
	let _audioTextData = getAudioTextDataByTextArea(); // エンドユーザの編集を取得.
	if(_audioTextData[0] != undefined) {
		text = _audioTextData.map(function(xs) {
			return xs.map(function(x) {
				return x.text;
			}).join('\n');
		}).join('\n');
	}
	return text;
}

/**
 * 受診されたデータを表示用にフォーマットする関数
 * @param {*} viewPage
 */
function formatAudioTextSpData(viewPage)
{
	let makeNewPagination = function(page_id) {
		$("#"+PAGENATION_PARENT_ELEMENT_SP).append('<a class="audio-text-page-number" '+AUDIOTEXT_PAGEID_DATA_SP+'="'+ page_id + '"  onclick="audioTextPagenation(' + page_id + ');">'+ page_id +'</a>');
	};

	let makeNewPageTextArea = function(page_id) {
		$("#"+CONETNTAREA_PARENT_ELEMENT_SP).append('<textarea class="audio-text-boxarea-page" '+AUDIOTEXT_PAGEID_DATA_SP+'="' + page_id  + '"></textarea>');
	};

	let pageID = 0;
	let onePage = true;

	let _audioTextData = null;
	if(viewPage == 0) {
		_audioTextData = audioTextData.slice(0);
		onePage = false;
	} else if(viewPage == -1) {
		_audioTextData = audioTextData.slice(-1);
		pageID = audioTextData.length;
	} else {
		_audioTextData = audioTextData.slice(viewPage-1, viewPage);
		pageID = viewPage;
	}

	_audioTextData.map(function(page, n, array)
	{
		if(!onePage){
			pageID = n + 1;
		}
		let textBoard = null;
		let safeCount = 3; // 無限ループにならないようにする安全装置.
		while (textBoard == null && 0 < safeCount) {
			safeCount--;
			textBoard = document.getElementById(CONETNTAREA_PARENT_ELEMENT_SP).querySelector('['+AUDIOTEXT_PAGEID_DATA_SP+'="'+pageID+'"]');
			if(textBoard == null) {
				makeNewPagination(pageID);
				makeNewPageTextArea(pageID);
			}
		}
		let result = page.reduce(function(acc, x){
			if(acc === '') {
				return x.text;
			} else {
				return acc+"\n"+x.text;
			}
		}, '');
		textBoard.value = result;
		textBoard.scrollTop = textBoard.scrollHeight;

	});
}

function setAudioTextSpPagenation(page_id)
{
	let maxPage = audioTextData.length;
	if(maxPage < page_id) {
		page_id = maxPage;
	} else if(page_id < 1) {
		page_id = 1;
	}
	viewIndex = page_id;
	let viewPages = [];
	const viewPrevSp = 4;
	const viewNextSp = 4;
	let lostPages = [];
	for (var i = (viewIndex - viewPrevSp); i < (viewIndex + viewNextSp); i++) {
		if(i <= 0) {
			lostPages.push((i-1)*-1);
		} else if(maxPage < i) {
			lostPages.push((i - maxPage)*-1);
		} else {
			viewPages.push(i);
		}
	}
	const fastPageSp = viewPages[0];
	const lastPageSp = viewPages[viewPages.length -1];
	lostPages.map(function(p){
		if(0 < p && (lastPageSp + p) <= maxPage) {
			viewPages.push(lastPageSp + p);
	    } else if(p < 0 && 0 < (fastPageSp + p)) {
			viewPages.unshift(fastPageSp + p);
	    }
	});
	const readonlySp = isAudioTextGuest();

	[PAGENATION_PARENT_ELEMENT_SP, CONETNTAREA_PARENT_ELEMENT_SP].map(function(element_id) {
		[].slice.call(document.getElementById(element_id).querySelectorAll(('['+AUDIOTEXT_PAGEID_DATA_SP+']')))
		.map(function(e) {
			const set_current_page_class_sp = 'current';
			if(e.dataset.audio_text_page_id == viewIndex) {
				e.classList.add(set_current_page_class_sp);
			} else {
				e.classList.remove(set_current_page_class_sp);
			}
			if(element_id == CONETNTAREA_PARENT_ELEMENT_SP) {
				const set_boxarea_class_sp = 'readonly';
				if(readonlySp) {
					e.classList.add(set_boxarea_class_sp);
				} else {
					e.classList.remove(set_boxarea_class_sp);
				}
			}
			if(element_id == PAGENATION_PARENT_ELEMENT_SP) {
				const set_view_page_class_sp = 'view';
				if(viewPages.indexOf(Number(e.dataset.audio_text_page_id)) != -1){
					e.classList.add(set_view_page_class_sp);
				} else {
					e.classList.remove(set_view_page_class_sp);
				}
			}
	    });
	});
}

/**
 * 文字起こしモーダル内ダウンロードボタン押下処理
 */
const downloadAudioTextFile = function()
{
	let text = getAudioTextDataString();
	if (text !== ''){
		const blob = new Blob([text]);
		const blobURL = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = blobURL;
		a.download = '文字起こし.txt';
		a.click();
	}else{
		alert('ダウンロードするテキストがありません')
	}
};

// 文字起こしを同期する設定か確認する.
function isSyncAudioText()
{
    return document.getElementById("sync_audio_text").checked;
}

/**
 * 文字起こしの表示領域を変更する
 */
function　sizeSwitchAudioTextFile()
{
	let targetArea = $('#negotiation-audio-text-area').attr('class');
	let targetClass = /audio_textbox_area_short/;
	let resizeCheck = targetArea.match(targetClass);

	if(resizeCheck) {
		areaLarge();
	} else {
		areaSmall();
	}
}

function areaLarge() {

	$('#negotiation-audio-text-area').removeClass("audio_textbox_area_short");
	$('#negotiation-audio-text-area').css("height", "");

	$('.audio-text-content').removeClass("audio-text-content-small");
	$('.audio-text-pagenation-area').removeClass("audio-text-pagenation-area-small");

	$('.audio-text-footer').removeClass("audio-text-footer-small");
	$('#audio-textarea-resize-button').addClass("icon-upward");
	$('#audio-textarea-resize-button').removeClass("icon-downward");
}

function areaSmall() {

	$('#negotiation-audio-text-area').addClass("audio_textbox_area_short");
	$('#negotiation-audio-text-area').css("height", "");

	$('.audio-text-content').addClass("audio-text-content-small");
	$('.audio-text-footer').addClass("audio-text-footer-small");
	$('.audio-text-pagenation-area').addClass("audio-text-pagenation-area-small");

	$('#audio-textarea-resize-button').addClass("icon-downward");
	$('#audio-textarea-resize-button').removeClass("icon-upward");
}