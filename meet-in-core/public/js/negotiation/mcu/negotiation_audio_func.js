/**
 * 録音開始ボタンが押されたときの処理
 */
//音を拾い続けるための配列
var audioData = [];
// サンプリング周波数
var sampleRate = 0;

/**
 * AudioContext
 * @type {AudioContext}
 */
var audioContext = null;

/**
 * マイクと接続先の音声ストリームを合成する為のNode
 * @type {MediaStreamAudioDestinationNode}
 */
var mediaStreamDestination = null;

/**
 * マイクのストリームのSourceNode
 * @type {MediaStreamAudioSourceNode}
 */
var audioSource = null;

/**
 * マイクと接続先の音声ストリームを合成したストリーム
 * @type {MediaStream}
 */
var composedMediaStream = null;

/**
 * マイクと接続先の音声ストリームを合成したストリームのSourceNode
 * @type {MediaStreamAudioSourceNode}
 */
var composedAudioSource = null;

/**
 * マイクと接続先の音声を合成した音声をサンプリングするProcessor
 * @type {ScriptProcessorNode}
 */
var audioProcessor = null;
// ボタン連続クリック制御のためのフラグ
var click_flg = true;
$('#button_audioStart').click(function(){
	alert("〜録音を開始するにあたって〜\n録音内容が消去されてしまうため、録音中はブラウザの更新をしないでください。");
	if(click_flg){
		click_flg = false;
		$(this).css('background','#EEEEEE');
		$(this).css("color", "#ffaa00");
		$('#audio_text_modal').css('display','block');
		$('.mi_video_icon_wrap').css('margin-top','40px');
		$('.mi_header_getAudioStart').children('img').attr('src', '/img/sp/svg/get-text-main.svg');
		var start = new Date();
		var data = start.getTime();
		disp(data);

		// 音声データのバッファをクリアする
		audioData = [];

		//様々なブラウザでマイクへのアクセス権を取得する
		navigator.mediaDevices = navigator.mediaDevices || navigator.webkitGetUserMedia;

		//audioのみtrue。Web Audioが問題なく使えるのであれば、第二引数で指定した関数を実行
		navigator.getUserMedia({
			audio: true,
			video: false
		}, successFunc, errorFunc);

	} else {
		return false;
	}

    function successFunc(stream) {
		// // 各Nodeの接続関係をリセットする
		if(audioProcessor != null) audioProcessor.disconnect();
		if(composedAudioSource != null) composedAudioSource.disconnect();
		if(audioSource != null) audioSource.disconnect();

		// 初期化処理
		audioContext = null;
		mediaStreamDestination = null;
		audioSource = null;
		composedMediaStream = null;
		composedAudioSource = null;
		audioProcessor = null;

		// successFuncのメイン処理開始
		audioContext = new AudioContext();
		sampleRate = audioContext.sampleRate;

		// ストリームを合成するNodeを作成
		mediaStreamDestination = audioContext.createMediaStreamDestination();

		// マイクのstreamをMediaStreamNodeに入力
		audioSource = audioContext.createMediaStreamSource(stream);
		audioSource.connect(mediaStreamDestination);

		//　接続先のstreamをMediaStreamに入力
		for(let stream of remoteAudioStream){
			try{
				audioContext.createMediaStreamSource(stream).connect(mediaStreamDestination);
			} catch(e){
				console.log(e);
			}
		}

		// マイクと接続先を合成したMediaStreamを取得
		composedMediaStream = mediaStreamDestination.stream;
		// マイクと接続先を合成したMediaStreamSourceNodeを取得
		composedAudioSource = audioContext.createMediaStreamSource(composedMediaStream);

		// 音声のサンプリングをするNodeを作成
		audioProcessor = audioContext.createScriptProcessor(1024, 1, 1);
		// マイクと接続先を合成した音声をサンプリング
		composedAudioSource.connect(audioProcessor);

		// audioProcessor.addEventListener('audioprocess', event => {
		// audioData.push(event.inputBuffer.getChannelData(0).slice());
		// });
		audioDataPush = event => {
			audioData.push(event.inputBuffer.getChannelData(0).slice());
		}
		audioProcessor.addEventListener('audioprocess', audioDataPush);

		audioProcessor.connect(audioContext.destination);
	}
	function errorFunc() {
		console.log("error");
	}
});

//タイマー用グローバル変数
var timer

/**
 * 録音経過時間を取得するイベント
 */
function disp(data){
	var hour = 0;
	var min = 0;
	var sec = 0;
	var now = 0;
	var datet = 0;

	now = new Date();

	datet = parseInt((now.getTime() - data)/1000);
	console.log(datet)

	hour = parseInt(datet / 3600);
	min = parseInt((datet / 60) % 60);
	sec = datet % 60;

	// 数値が1桁の場合、頭に0を付けて2桁で表示する指定
	if(hour < 10) { hour = "0" + hour; }
	if(min < 10) { min = "0" + min; }
	if(sec < 10) { sec = "0" + sec; }

	// フォーマットを指定（不要な行を削除する）
	var timer2 = hour + ':' + min + ':' + sec; // パターン1
	console.log(timer2)

	// テキストフィールドにデータを渡す処理（不要な行を削除する）
	document.getElementById('audio_text_modal_middle_area').innerText = timer2;

	timer = setTimeout("disp("+ data +")", 1000);
}

/**
 * 録音停止ボタンが押されたときの処理
 */
$(document).on('click','#button_audioStop',function(){
	//録音停止後も音声取得処理が走り続けないよう制御
	audioProcessor.removeEventListener('audioprocess', audioDataPush);
	//モーダルバーの内容を変更
	$('#button_audioStart').css('background','#fff');
	$('#button_audioStart').css('color','#b4b4b4');
	$('.mi_header_getAudioStart').children('img').attr('src', '/img/sp/svg/get-text.svg');
	document.getElementById('status_text').innerText = "録音した音声をデータ化しています。そのまましばらくお待ちください。（処理に時間がかかる場合があります）";
	document.getElementById('audio_text_modal_middle_area').innerText = "";
	document.getElementById('audio_button_area').innerHTML ="";
	//タイマーを停止
	clearTimeout(timer);

	const waveArrayBuffer = exportWave(audioData);

	var oReq = new XMLHttpRequest();
	oReq.open("POST", '/get-audio/get-audio-data', true);
	oReq.onload = function (oEvent) {
		document.getElementById('status_text').innerText = "録音した音声データの文字起こしを開始しますか？";
		document.getElementById('audio_button_area').innerHTML = '<button class="audio_text_start_button" id="audio_text_start">開始</button><button class="audio_text_cancel_button" id="audio_text_cancel">行わない</button>';
		document.getElementById('audio_text_modal_middle_area').innerText = "";
	};
	const blob = new Blob([waveArrayBuffer], {type:'audio/wav'});
	oReq.setRequestHeader('Content-Type', 'application/octet-stream');
	oReq.send(blob);

	function exportWave(audioData) {
	// Float32Arrayの配列になっているので平坦化
	const audioWaveData = flattenFloat32Array(audioData);
	console.log(audioWaveData)
	// WAVEファイルのバイナリ作成用のArrayBufferを用意
	const buffer = new ArrayBuffer(44 + audioWaveData.length * 2);

	// ヘッダと波形データを書き込みWAVEフォーマットのバイナリを作成
	const dataView = writeWavHeaderAndData(new DataView(buffer), audioWaveData, sampleRate);

	return buffer;
	}

	// Float32Arrayを平坦化する
	function flattenFloat32Array(matrix) {
		const arraySize = matrix.reduce((acc, arr) => acc + arr.length, 0);
		let resultArray = new Float32Array(arraySize);
		let count = 0;
		for(let i = 0; i < matrix.length; i++) {
			for(let j = 0; j < matrix[i].length; j++) {
			resultArray[count] = audioData[i][j];
			count++;
			}
		}
		return resultArray;
	}
	// ArrayBufferにstringをoffsetの位置から書き込む
	function writeStringForArrayBuffer(view, offset, str) {
		for(let i = 0; i < str.length; i++) {
			view.setUint8(offset + i, str.charCodeAt(i));
		}
	}

	// モノラルのWAVEヘッダを書き込む
	function writeWavHeaderAndData(view, audioWaveData, samplingRate) {
		// WAVEのヘッダを書き込み(詳しくはWAVEファイルのデータ構造を参照)
		writeStringForArrayBuffer(view, 0, 'RIFF'); // RIFF識別子
		view.setUint32(4, 36 + audioWaveData.length * 2, true); // チャンクサイズ(これ以降のファイルサイズ)
		writeStringForArrayBuffer(view, 8, 'WAVE'); // フォーマット
		writeStringForArrayBuffer(view, 12, 'fmt '); // fmt識別子
		view.setUint32(16, 16, true); // fmtチャンクのバイト数(第三引数trueはリトルエンディアン)
		view.setUint16(20, 1, true); // 音声フォーマット。1はリニアPCM
		view.setUint16(22, 1, true); // チャンネル数。1はモノラル。
		view.setUint32(24, samplingRate, true); // サンプリングレート
		view.setUint32(28, samplingRate * 2, true); // 1秒あたりのバイト数平均(サンプリングレート * ブロックサイズ)
		view.setUint16(32, 2, true); // ブロックサイズ。チャンネル数 * 1サンプルあたりのビット数 / 8で求める。モノラル16bitなら2。
		view.setUint16(34, 16, true); // 1サンプルに必要なビット数。16bitなら16。
		writeStringForArrayBuffer(view, 36, 'data'); // サブチャンク識別子
		view.setUint32(40, audioWaveData.length * 2, true); // 波形データのバイト数(波形データ1点につき16bitなのでデータの数 * 2となっている)

		// WAVEのデータを書き込み
		floatTo16BitPCM(view, 44, audioWaveData); // 波形データ

		return view;
	}
});

/**
 * float -> 16bitPCMへ変換する関数(little endian)
 */
function floatTo16BitPCM(view, offset, audioWaveData) {
	for (let i = 0; i < audioWaveData.length; i++ , offset += 2) {
		let s = Math.max(-1, Math.min(1, audioWaveData[i]));
		view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
	}
}


/**
 * 文字起こし開始ボタン押下イベント
 */
//ボタン連打制御フラグ
var firstClick = true;
$(document).on('click','#audio_text_start',function(){
	$('.mi_video_icon_wrap').css('margin-top','');
	alert('文字起こし準備中です\n文字起こし処理が自動で開始されますので、OKを押してそのまましばらくお待ちください\n音声が長い場合、時間がかかることがあります\n例：1分の音声→約30秒の処理時間')
	if (firstClick){
		firstClick = false;
		$.ajax({
			url: "/get-audio/speech-to-text",
			type: 'GET',
			beforeSend: function(){
			document.getElementById('status_text').innerText = "文字起こし中です。しばらくお待ちください。";
			document.getElementById('audio_button_area').innerHTML ="";
			}
			}).done(function(res){

			if(res == "error"){
				alert('しばらく経ってからもう一度ボタンを押してください');
			}else{
				alert('文字起こし処理を開始しました\n詳細は管理画面からご確認ください');
				firstClick = true;
				click_flg = true;
				$('#audio_text_start').prop('disabled', false);
				document.getElementById('status_text').innerText = "会話内容を文字起こしするため録音しています。";
				document.getElementById('audio_button_area').innerHTML = '<button class="mi_header_getAudioStop" id="button_audioStop"><img class="audio_stop_icon" src="/img/sp/svg/audio_stop.svg">停止する</button>';
				document.getElementById('audio_text_modal_middle_area').innerText = "録音時間　00:00:00";
				$('#audio_text_modal').css('display','none');
				$('#button_audioStart').css("color","B4B4B4");
			}
			}).fail(function(res){
				if(res == "error"){
					alert('エラー');
				}
			})
	}else{
		$(this).prop('disabled', true);
	}
})

//文字起こしボタンホバー時の処理
$(document).on('mouseover','#button_audioStart',function(){
	$('.mi_header_getAudioStart').children('img').attr('src', '/img/sp/svg/get-text-main.svg');
	$(this).css('color','#ffaa00');
})
//文字起こしボタンホバーアウト時の処理
$(document).on('mouseout','#button_audioStart',function(){
	$('.mi_header_getAudioStart').children('img').attr('src', '/img/sp/svg/get-text.svg');
	$(this).css('color','#b4b4b4');
})


/**
 * 文字起こしキャンセルイベント
 */
$(document).on('click','#audio_text_cancel',function(){
	document.getElementById('status_text').innerText = "会話内容を文字起こししています。";
	document.getElementById('audio_button_area').innerHTML = '<button class="mi_header_getAudioStop" id="button_audioStop"><img class="audio_stop_icon" src="/img/sp/svg/audio_stop.svg">停止する</button>';
	document.getElementById('audio_text_modal_middle_area').innerText = "録音時間　00:00:00";
	$('#audio_text_modal').css('display','none');
	$('.mi_video_icon_wrap').css('margin-top','');
	click_flg = true;
});


// ************************
// リアルタイム音声認識
// ************************

// リアルタイム音声認識はAPIの関係で16kHz
const REALTIME_RECOGNIZE_SAMPLE_RATE = 16000;
const REALTIME_RECOGNIZE_API_SERVER_URL = 'wss://ik1-406-35452.vs.sakura.ne.jp/websocket/audio-recognize';
const REALTIME_RECOGNIZE_SAMPLING_BUFFER_SIZE = 16384;

// MeetinConnectionManager.jsのpeer接続イベントで使用
let connectFunction = (_stream, _speakerNo) => {};
let speakers = 1;

/**
 * リアルタイム音声認識開始時に実行するもの
 */
function onRecognizeStartFunc(){
	console.log('realtime recognize start...');
	// 音声認識処理開始時間を記録して時系列順に表示する基準時間とする
	const recognizeStartTime = performance.now();

	// 音声認識中かどうか
	let isRunning = true;

	//様々なブラウザでマイクへのアクセス権を取得する
	navigator.mediaDevices = navigator.mediaDevices || navigator.webkitGetUserMedia;

	//audioのみtrue。Web Audioが問題なく使えるのであれば、第二引数で指定した関数を実行
	navigator.getUserMedia({
		audio: true,
		video: false
	}, onSuccessFunc, onErrorFunc);

	// 各ストリームごとに接続を確立する
	let index = 1;
	for(let stream of remoteAudioStream) {
		try {
			if(stream.active){
				onSuccessFunc(stream, index);
				index++;
			}
		} catch(e) {
			console.log(e);
		}
	}

	// 後から接続してきたストリームに対して処理を行うため、onSuccessFuncを外に出す
	connectFunction = onSuccessFunc;
	speakers = index;

	/**
	 * マイクの取得成功時に実行
	 * @param stream
	 * @param speakerNo
	 */
	function onSuccessFunc(stream, speakerNo = 0){
		// モニタリングモードの時は自分の音声は文字起こししない
		if(isMonitoring() && speakerNo === 0) return true;

		console.log(stream);
		// リアルタイム音声認識用のAudioContextを生成
		const audioContext = new AudioContext({sampleRate: REALTIME_RECOGNIZE_SAMPLE_RATE});

		// streamをMediaStreamNodeに入力
		const audioSource = audioContext.createMediaStreamSource(stream);

		// 音声のサンプリングをするNodeを作成
		const audioProcessor = audioContext.createScriptProcessor(REALTIME_RECOGNIZE_SAMPLING_BUFFER_SIZE, 1, 1);

		// AudioSourceNodeの音声をサンプリングするためScriptProcessorNodeに接続
		audioSource.connect(audioProcessor);

		// APIサーバーへの接続準備
		const conn = new RealTimeAudioRecognize(REALTIME_RECOGNIZE_API_SERVER_URL);

		// 接続成功時に実行
		let offsetTime = 0;
		conn.onopen = () => {
			// (コネクション確立時刻 - 音声認識開始時刻)を用いて再接続時の発話開始時間のオフセットとする
			offsetTime = (performance.now() - recognizeStartTime);

			// AudioProcessorにイベントを設定
			audioProcessor.addEventListener('audioprocess', (event) => {
				const data = event.inputBuffer.getChannelData(0).slice();
				const buffer = new ArrayBuffer(data.length * 2);
				const view = new DataView(buffer);
				floatTo16BitPCM(view, 0, data);
				conn.send(buffer);
			});
			// 音声のサンプリング開始
			audioProcessor.connect(audioContext.destination);
		};

		// 認識結果取得時に実行
		conn.onmessage = (result) => {
			const text = result['text'];
			const displayText = `speaker${speakerNo}: ${text}`;
			const startTime = result['starttime'] + offsetTime;
			if(text !== '') {
				getAudioTextData(displayText, startTime);
			}
		};

		// 接続が閉じた時に実行
		conn.onclose = () => {
			//　音声認識中は再接続処理を行う
			if(isRunning){
				console.log("reconnecting...");
				// サンプリング停止
				audioContext.close().then(_ => {
					audioProcessor.disconnect();
					audioSource.disconnect();
				});

				// 停止イベントを削除
				document.getElementById('audio-text-stop').removeEventListener('click', onRecognizeStopFunc);

				// ストリームが有効な場合は再接続
				if(stream.active){
					onSuccessFunc(stream, speakerNo);
				} else {
					console.log("won't reconnecting because stream is not active");
				}
			}
		};

		// APIサーバーへ接続
		conn.connect();

		/**
		 * リアルタイム音声認識停止に実行するもの
		 */
		function onRecognizeStopFunc(){
			console.log('realtime recognize stop...');
			// 音声認識停止中
			isRunning = false;

			// 停止中は接続してきたストリームに対して処理を行わないので関数をリセット
			connectFunction = (_stream, _speakerNo) => {};
			speakers = 1;

			// 2回目以降の文字起こしで残ってしまうので停止イベントを削除
			document.getElementById('audio-text-stop').removeEventListener('click', onRecognizeStopFunc);

			// サンプリング停止
			audioContext.close().then(_ => {
				audioProcessor.disconnect();
				audioSource.disconnect();
			});
			// サーバーへ停止要求を送信
			conn.end();
		}
		// 停止イベントを設定
		document.getElementById('audio-text-stop').addEventListener('click', onRecognizeStopFunc);
		// document.getElementById('audio-text-header-close').addEventListener('click', onRecognizeStopFunc);
	}

	/**
	 * マイクの取得失敗時に実行
	 */
	function onErrorFunc(){
		console.log("getUserMedia Error");
	}

	/**
	 * 自分がモニタリングモードかを判別する
	 * @return boolean
	 */
	function isMonitoring(){
		const urlParam = location.search;
		const result = urlParam.split('&').filter((param) => param.includes('room_mode=2'));
		return (result.length > 0);
	}

	// 音声認識処理開始時間(ミリ秒)を返す.
	return recognizeStartTime;
}