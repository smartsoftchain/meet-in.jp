// ************************
// リアルタイム文字起こし モーダル関係
// ************************
$(function ()
{
	/**
	 * 文字起こしモーダル出現処理
	 */
	$('#button_audio_text').on('click', function() {
		// MEMO. 同期が完了する前にクリックされると履歴を壊されてしまう(全員の画面から「文字起こし」UIと、これまでの履歴が消えてなくなる).
		let isSynchronized = (initState != 0 && initState < SYNC_HIDE_MESSAGE_STATUS); // 同期が完了しているか.
		if(isSynchronized){
			alert("現在の参加中のお客様と同期を行っています。\nもう少々お待ちください。");
		} else if(isAudioTextGuest() || (voiceAnalysisStatus.isRunning() && !voiceAnalysisStatus.isHost)) {
			$('.audio_text_button_tooltip').tooltipster('open');
		} else {
			audioTextInfoOpen();
		}
	});

	/**
	 * 文字起こしモーダル消去処理
	 */
	$('#audio-text-header-close').on('click', function() {
		$('#negotiation-audio-text-area').css("visibility","hidden");
		sendAudioTextCloseWindow();
	});

	/**
	 * 文字起こしモーダルリサイズ処理
	 */
	$("#negotiation-audio-text-area").resizable({
		minWidth: 284,
		minHeight: 180,
		stop: function( event, ui ) {
			sendAudioTextResizeWindow();
		}
	});

	/**
	 * 文字起こしモーダルドラッグ＆ドロップ処理
	 */
    $('#negotiation-audio-text-area').draggable( {
		handle: ".audio-text-header",
		containment: "#mi_video_area",
		drag: function( event, ui ) {
			sendAudioTextResizeWindow();
		}
    });

	/**
	 * 文字起こし開始ボタン押下処理
	 */
	$('#audio-text-start').on('click', function() {
		// 音声分析の実行判定
		console.log('sentimentAnalysisFlg', sentimentAnalysisFlg);
		console.log('voiceAnalysisStatus', JSON.stringify(voiceAnalysisStatus));
		if(!sentimentAnalysisFlg){
			if(voiceAnalysisStatus.isRunning()) {
				alert('別のユーザーが使用しています。\n使用したい場合は、他のユーザーの文字起こしを終了してください。');
				return;
			};

			// 録音用クラスインスタンス生成（MCUはconversationIdを録音ファイル名とするので、録音実行処理はVoiceAnalysis.jsの中に記述する）
			recorder = createMediaStreamRecorder();

			setAudioTextDataByTextArea();
			$('#audio-text-start').addClass('inactive');
			$('#audio-text-stop').removeClass('inactive');

			audioTextInfo(function(data) {
				if(data.code == -1){
					alert("ログインして下さい");
					return;
				} else if(!data.unrestricted && (data.lock || data.time_limit_second < 1)) {
					audioTextTimeLimitSecond = data.time_limit_second;
					audioTextLock();
					return;
				}
				// 文字起こしの実行フラグを真にする
				audioTextFlg = true;
				// 他の接続ユーザーに文字起こし開始を通知する
				sendAudioAndSentimentStatus(TYPE_AUDIO_TEXT, audioTextFlg);

				recognizeStartTimeMS = isMCU() ? voiceAnalysisSequenceStart() : onRecognizeStartFunc();
				if(!data.unrestricted){
					audioTextTimeLimitSecond = data.time_limit_second;
					audioTextTimeCountStart();
				}
			});
		}else{
			// 音声分析停止のメッセージ表示
			$("#tmp_message_audio_text").show();
			setTimeout(function (){
				$("#tmp_message_audio_text").fadeOut();
			} , 3000);
		}

	});

	$('#audio-text-stop').on('click', function() {
		$('#audio-text-start').removeClass('inactive');
		$('#audio-text-stop').addClass('inactive');

		// 文字起こしの実行フラグを偽にする
		audioTextFlg = false;
		// 他の接続ユーザーに文字起こし終了を通知する
		sendAudioAndSentimentStatus(TYPE_AUDIO_TEXT, audioTextFlg);

		setAudioTextPagenation(viewIndex);

		audioTextStop(function(data){
			audioTextTimeCountStop();
		});

		if(isMCU()){
			sendRequestVoiceAnalysisStop()
		}
	});

	/**
	 * 文字起こしデータ保存ボタン押下処理
	 */
	var save_flg = false; //保存ボタン制御用フラグ
	$('#audio-text-save').on('click', function() {
		if (save_flg == true){
			$(this).css('background','#B4B4B4');
			$('#audio-text-start').css('background','#ffaa00');
			alert('テキストデータの保存が完了しました。\n ファイル一覧画面からご確認ください。');
			save_flg = false;
		}
	});

	$('#icon-menu-left').on('click', function(){
		setAudioTextPagenation(viewIndex-1);
		sendAudioTextSendText();
	});
	$('#icon-menu-right').on('click', function(){
		setAudioTextPagenation(viewIndex+1);
		sendAudioTextSendText();
	});


	$("#audio-text-boxarea").keyup(function(e) {
		if(!isAudioTextMonitoringMode()){
			setAudioTextDataByTextArea();
			sendAudioTextSendText();
		}
	});

	$('#audio-text-save').on('click', audioTextSave);


    $('input[name="sync_audio_text"]').change(function() {
        if(isSyncAudioText()){
            sendAudioTextOpenWindow();
        } else {
            sendAudioTextCloseWindow();
        }
    });


});

function audioTextInfoOpen()
{
	// 商談がまだ終わってなければ
	if (!NEGOTIATION.isNegotiationFinish)
	{
		if($("#room_mode").val() == ROOM_MODE_2) {
			setAudioTextMonitoringInterFace();
		}

		if(!isAudioTextGuest())
		{
			// ホストの処理.
			audioTextInfo(function(data)
			{
				if(data.code == -1){
					alert("ログインして下さい");
					return;
				} else if(!data.unrestricted && (data.lock || data.time_limit_second < 1)) {
					audioTextTimeLimitSecond = data.time_limit_second;
					audioTextLock();
					return;
				}

				setAudioTextHostInterFace();

				if(data.unrestricted) {
					$("#audio-text-time").hide();
				} else {
					if(0 == audioTextTimeLimitSecond) {
						audioTextTimeLimitSecond = data.time_limit_second;
					}
					$("#negotiation-audio-text-area").removeClass("time_up");
					$("#audio-text-time").show();
					audioTextTimer(true);
				}
				audioTextOpen();
			});
		} else {
			$('#negotiation-audio-text-area').css("visibility","visible");
		}
	}
}


/*
 * 文字起こしページネーション
 */
function audioTextPagenation(page_id) {
	setAudioTextPagenation(page_id);
	sendAudioTextSendText();
}


//文字起こしモーダルにテキストを追加するのための配列
var audioTextData = [];
//テキストエリアの切り替え用変数
var viewIndex = 0;
// １ページの最大文字数(超過で新ページ作成)
const audioTextDataMaxPageLength = 1000;
// 文字起こしの開始から終了まで時間.
var recognizeStartTimeMS = 0;
// 残り時間の描画用.
var audioTextTimeLimitSecond = 0;

// Object生成.
function objectTextWithStartTime(text, startTime) {
	return {
		text: text,
		starttime: startTime
	}
}
/**
 * node側から文字起こし結果を受け取り、反映させる処理
 */
function getAudioTextData(text, startTime)
{
	// Object生成.
	const textWithStartTime = objectTextWithStartTime(text, startTime);

	// 文字数で何ページ目に代入するか判断する.
	let n = audioTextData.length == 0 ? 0 : audioTextData.length -1;
	let wordCount = 0;
	if(audioTextData[n] != undefined) {
		wordCount = audioTextData[n].reduce(function(acc, x){
			if(acc === '') {
				return x.text.length;
			}
			return acc+x.text.length;
		}, '');
	}
	if(audioTextDataMaxPageLength < parseInt(wordCount)) {
		n++;
	}
	if (audioTextData[n] == undefined){
		audioTextData.push([]);
	}

	// 代入して時系列に並び替え.
	audioTextData[n].push(textWithStartTime);
	audioTextData[n].sort(function(x, y){
		if (x.starttime < y.starttime) return -1;
		if (x.starttime > y.starttime) return 1;
		return 0;
	});

	formatAudioTextData(-1);
	setAudioTextPagenation(audioTextData.length);
	if($("#room_mode").val() != ROOM_MODE_2){
		sendAudioTextSendText();
	}
}
/**
 * 文字起こし中か判定する.
 */
function isPlayAudioText(){
	return document.getElementById("audio-text-start").classList.contains("inactive");
}
/*
 * 文字起こしの結果を表示する領域の作成.
 */
const PAGENATION_PARENT_ELEMENT = 'audio-text-pagenation';
const CONETNTAREA_PARENT_ELEMENT = "audio-text-boxarea";
const AUDIOTEXT_PAGEID_DATA ='data-audio_text_page_id';
const NEGOTIATION_AUDIO_TEXT_AREA = 'negotiation-audio-text-area';
function formatAudioTextData(viewPage)
{
	let makeNewPagination = function(page_id) {
		$("#"+PAGENATION_PARENT_ELEMENT).append('<a class="audio-text-page-number" '+AUDIOTEXT_PAGEID_DATA+'="'+ page_id + '"  onclick="audioTextPagenation(' + page_id + ');">'+ page_id +'</a>');
	};

	let makeNewPageTextArea = function(page_id) {
		$("#"+CONETNTAREA_PARENT_ELEMENT).append('<textarea class="audio-text-boxarea-page" '+AUDIOTEXT_PAGEID_DATA+'="' + page_id  + '"></textarea>');
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
			textBoard = document.getElementById(CONETNTAREA_PARENT_ELEMENT).querySelector('['+AUDIOTEXT_PAGEID_DATA+'="'+pageID+'"]');
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
/*
 * 文字起こしの状態を初期化する(次文字起こしを押したユーザがホストになる).
 */
function clearAudioTextData()
{
	//元々の判定の状態次第.
    audioTextInfo(function(data)
    {
		audioTextData = [];
		viewIndex = 0;
		$("#"+PAGENATION_PARENT_ELEMENT).empty();
		$("#"+CONETNTAREA_PARENT_ELEMENT).empty();

		$("#negotiation-audio-text-area").removeClass("guest_mode");
		$("#negotiation-audio-text-area").removeClass("time_up");

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
/*
 * 文字起こしのページネーション処理.
 */
function setAudioTextPagenation(page_id)
{
	let maxPage = audioTextData.length;
	if(maxPage < page_id) {
		page_id = maxPage;
	} else if(page_id < 1) {
		page_id = 1;
	}
	viewIndex = page_id;
	let viewPages = [];
	const viewPrev = 4;
	const viewNext = 4;
	let lostPages = [];
	for (var i = (viewIndex - viewPrev); i < (viewIndex + viewNext); i++) {
		if(i <= 0) {
			lostPages.push((i-1)*-1);
		} else if(maxPage < i) {
			lostPages.push((i - maxPage)*-1);
		} else {
			viewPages.push(i);
		}
	}
	const fastPage = viewPages[0];
	const lastPage = viewPages[viewPages.length -1];
	lostPages.map(function(p){
	    if(0 < p && (lastPage + p) <= maxPage) {
			viewPages.push(lastPage + p);
	    } else if(p < 0 && 0 < (fastPage + p)) {
			viewPages.unshift(fastPage + p);
	    }
	});
	const readonly = isPlayAudioText() || isAudioTextGuest();
	[PAGENATION_PARENT_ELEMENT, CONETNTAREA_PARENT_ELEMENT].map(function(element_id) {
		[].slice.call(document.getElementById(element_id).querySelectorAll(('['+AUDIOTEXT_PAGEID_DATA+']')))
		.map(function(e) {
			const set_current_page_class = 'current';
			if(e.dataset.audio_text_page_id == viewIndex) {
				e.classList.add(set_current_page_class);
			} else {
				e.classList.remove(set_current_page_class);
			}
			if(element_id == CONETNTAREA_PARENT_ELEMENT) {
				const set_boxarea_class = 'readonly';
				if(readonly) {
					e.classList.add(set_boxarea_class);
				} else {
					e.classList.remove(set_boxarea_class);
				}
			}
			if(element_id == PAGENATION_PARENT_ELEMENT) {
				const set_view_page_class = 'view';
				if(viewPages.indexOf(Number(e.dataset.audio_text_page_id)) != -1){
					e.classList.add(set_view_page_class);
				} else {
					e.classList.remove(set_view_page_class);
				}
			}
	    });
	});
}
/**
 * エンドユーザが 文字起こしを編集した結果を audioTextDataに反映する.
 */
function setAudioTextDataByTextArea() {
	if(audioTextData[0] != undefined) {
		audioTextData = getAudioTextDataByTextArea();
	}
}
function getAudioTextDataByTextArea()
{
	let _audioTextData = [];
	[].slice.call(document.getElementById(CONETNTAREA_PARENT_ELEMENT).querySelectorAll('['+AUDIOTEXT_PAGEID_DATA+']'))
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

function audioTextOpen()
{
	let target = '#negotiation-audio-text-area';
	if ($(target).css("visibility") == 'hidden') {
		$(target).css("visibility","visible");
		if(!isPlayAudioText()) {
			$('#audio-text-stop').addClass('inactive');
		}
		sendAudioTextOpenWindow();
	} else {
		$(target).css("visibility","hidden");
		sendAudioTextCloseWindow();
	}
}


var audioTextTimeLimitCounterId;
function audioTextTimeCountStart()
{
	audioTextTimeLimitCounterId = setInterval(function() {
		audioTextTimeLimitSecond--;
		audioTextTimer(audioTextTimeLimitSecond % 2 == 0);
		if(audioTextTimeLimitSecond < 1) {
			$('#audio-text-stop').trigger('click'); // 文字起こし中だった場合停止.
			audioTextSave();
		}
	}, 1000);
}
function audioTextTimeCountStop() {
	clearInterval(audioTextTimeLimitCounterId);
	audioTextTimer(true);
}
function audioTextTimer(isCarve)
{
	let convertHour = 3600;
	let hour = ('000'+Math.floor(audioTextTimeLimitSecond / convertHour)).slice(-3);
	let minute = ('00'+Math.floor((audioTextTimeLimitSecond % convertHour) / 60)).slice(-2);
	let second = ('00'+Math.floor(audioTextTimeLimitSecond % 60)).slice(-2);
	let left  = hour;
	let right = minute;
	if(hour < 1){
		left  = minute;
		right = second;
	}
	document.getElementById("audio-text-time-countdown-left").innerHTML = (Number(left) == NaN || Number(left) == -1) ? '00' : left;
	document.getElementById("audio-text-time-countdown-coron").style.opacity = isCarve ? 1 : 0;
	document.getElementById("audio-text-time-countdown-right").innerHTML = (Number(right) == NaN || Number(right) == -1) ? '00' : right;
}

function audioTextLock() {
	audioTextTimer(true);
	alert("文字起こしを行える時間を超えました。\n文字起こしを停止しました。\n文字起こしの残り時間は、ご契約に所属するアカウント共有の時間です。");
	$("#negotiation-audio-text-area").addClass("time_up");
}

/**
 * サーバ側の文字起こし中断処理を止める.
 */
const audioTextInfo = function(event)
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
/**
 * サーバ側の文字起こし中断処理を止める.
 */
const audioTextStop = function(event)
{
	$.ajax({
		url: "/get-audio/audio-text-stop",
		type: "POST",
		data: {
			"time": (performance.now() - recognizeStartTimeMS) * 0.001,
		}
	}).done(function (res) {
		recognizeStartTimeMS = 0;
		let data = $.parseJSON(res);
		if(data.code == -1){
			alert("ログインして下さい");
			return;
		}
		audioTextTimeLimitSecond = data.time_limit_second;
		event(data);
		if(!data.unrestricted && (data.lock || data.time_limit_second < 1)) {
			audioTextLock();
		}
	}).fail(function (res) {
		console.log('error')
	});
};
/**
 * リアルタイム文字起こしされたテキストをDBに保存するためのajax処理
 */
const audioTextSave = function()
{

	let text = getAudioTextDataString();
	if(text == '') {
		return;
	}
	$.ajax({
		url: "/get-audio/audio-text-save",
		type: "POST",
		data: {
			"text": text,
			"time": (recognizeStartTimeMS != 0 ? (performance.now() - recognizeStartTimeMS) * 0.001 : 0)
		}
	}).done(function (res) {
	}).fail(function (res) {
		console.log('error')
	});

};

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

function isAudioTextGuest() {
	return document.getElementById("negotiation-audio-text-area").classList.contains("guest_mode");
}

// ホスト(残り時間を使うユーザ).
function setAudioTextHostInterFace() {
	$("#negotiation-audio-text-area").removeClass("guest_mode");
	$("#negotiation-audio-text-area").data('host_id', $('#peer_id').val());
	$.cookie('audio_text_host_id', $('#peer_id').val());
}
// ゲスト(残り時間を使わないが見てるだけのユーザ).
function setAudioTextGuestInterFace() {
	$("#negotiation-audio-text-area").addClass("guest_mode");
	//$('#button_audio_text').css("visibility","hidden");
}

function syncAudioTextInterFace(json)
{
	if($("#room_mode").val() == ROOM_MODE_2){
		return;
	}

	// ゲストか判定する.
	if(json.hostId == undefined || $.cookie('audio_text_host_id') == undefined || json.hostId != $.cookie('audio_text_host_id')) {
		setAudioTextGuestInterFace();
	}

	syncAudioTextInterFacePosition(json);

	audioTextData = json.audioTextData == undefined ? [] : json.audioTextData;
	viewIndex = json.viewIndex == undefined ? 0 : json.viewIndex;
	formatAudioTextData(0);
	setAudioTextPagenation(viewIndex);

	if(json.showFlg){
		audioTextInfoOpen();
	} else {
		$('#negotiation-audio-text-area').css("visibility","hidden");
	}
}

function syncAudioTextInterFacePosition(json)
{
	$("#negotiation-audio-text-area").css("top", parseInt(json.top) < 0 ? '0px' : json.top);
	$("#negotiation-audio-text-area").css("left", json.left);
	$('#negotiation-audio-text-area').css("height", json.height);
	$('#negotiation-audio-text-area').css("width", json.width);
	$("#negotiation-audio-text-area").data('host_id', json.hostId);
}


function getNegotiationAudioTextAreaHeightPx() {
	return $("#negotiation-audio-text-area").css('height');
}

function sendShareAudioTextSync()
{
	return {
		command : "INIT_SYNC",
		type : "RESUPONCE_AUDIO_TEXT",
		audioTextData : getAudioTextDataByTextArea(),
		viewIndex: viewIndex,
		hostId : getAudioTextHostPeerid(),
		top : $("#negotiation-audio-text-area").css("top"),
		left : $("#negotiation-audio-text-area").css("left"),
		height : getNegotiationAudioTextAreaHeightPx(),
		width : $("#negotiation-audio-text-area").css("width"),
		scrollTop : $("#audio-text-boxarea-page current").scrollTop(),
		scrollLeft : $("#audio-text-boxarea-page current").scrollLeft(),
		responceUserId : $('#user_id').val(),
		showFlg : isSyncAudioText(),
	};
}

function sendAudioTextSendText(_audioTextData)
{
	if(_audioTextData == null) {
		_audioTextData = audioTextData[viewIndex-1];
	}

	var data = {
		command : "AUDIO_TEXT",
		type : "SEND_TEXT",
		audioTextData : _audioTextData,
		viewIndex: viewIndex,
		scrollTop : $(".audio-text-boxarea-page.current").scrollTop(),
		scrollLeft : $(".audio-text-boxarea-page.current").scrollLeft(),
	};

	sendCommand(SEND_TARGET_ALL, data);
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

function sendAudioTextResizeWindow()
{
	if($("#room_mode").val() == ROOM_MODE_2){
		return;
	}
	var isMobile = navigator.userAgent.match(/(iPhone|iPad)/gi) || [];

	if (isMobile.length == 0) {
		var data = {
			command : "AUDIO_TEXT",
			type : "RESIZE_WINDOW",
			top : $("#negotiation-audio-text-area").css("top"),
			left : $("#negotiation-audio-text-area").css("left"),
			height : getNegotiationAudioTextAreaHeightPx(),
			width : $("#negotiation-audio-text-area").css("width"),
			scrollTop : $(".audio-text-boxarea-page.current").scrollTop(),
			scrollLeft : $(".audio-text-boxarea-page.current").scrollLeft(),
		};
		sendCommand(SEND_TARGET_ALL, data);
	}
}

function sendAudioTextEnd()
{
	if($("#room_mode").val() == ROOM_MODE_2 || isAudioTextGuest()){
		return;
	}

	var data = {
		command : "AUDIO_TEXT",
		type : "END",
	};
	sendCommand(SEND_TARGET_ALL, data);
}

function receiveAudioTextJson(json)
{
	if($("#room_mode").val() == ROOM_MODE_2){
		return;
	}

	// 同期を受け取る.
	if(json.type == "SEND_TEXT") {
		audioTextData[json.viewIndex-1] = json.audioTextData;
		formatAudioTextData(json.viewIndex);
		setAudioTextPagenation(json.viewIndex);
		// setAudioTextPagenationの後に実行する.
		$(".audio-text-boxarea-page.current").scrollTop(json.scrollTop);
		$(".audio-text-boxarea-page.current").scrollLeft(json.scrollLeft);
	} else if(json.type == "OPEN_WINDOW") {
		syncAudioTextInterFace(json);
	} else if(json.type == "CLOSE_WINDOW") {
		syncAudioTextInterFace(json);
	} else if(json.type == "RESIZE_WINDOW") {
		syncAudioTextInterFacePosition(json);
	} else if(json.type == "END") {
		clearAudioTextData();

	}

}

function getAudioTextHostPeerid() {
	return $("#negotiation-audio-text-area").data('host_id');
}

// 文字起こしを同期する設定か確認する.
function isSyncAudioText(){
    return document.getElementById("sync_audio_text").checked;
}


function isAudioTextMonitoringMode() {
	return document.getElementById("negotiation-audio-text-area").classList.contains("monitoring_mode");
}

// モニタリング状態.
function setAudioTextMonitoringInterFace() {
	$("#negotiation-audio-text-area").addClass("monitoring_mode");
}
