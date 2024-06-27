console.log('import voice_analysis_commands.js');

/**
 * 文字起こし関連の状態を保存する
 * @type {{
 * isHost: boolean
 * isHostAlive: boolean,
 * peers: object,
 * peerTimeOffset: object,
 * hostVoiceAnalysisStartTime: number,
 * voiceAnalysisInstance: VoiceAnalysis,
 * isRunning: boolean
 * isStartWithMonitoringHost
 * isMonitoring: boolean,
 * isMicOn: boolean
 * }}
 */
const voiceAnalysisStatus = {
    isHost: false,
    isHostAlive: false,
    peers: {},
    peerTimeOffset: {}, // {[speakerNo: number]: number}
    hostVoiceAnalysisStartTime: 0,
    voiceAnalysisInstance: null,
    isRunning: function(){
        if(this.isMonitoring()) { return this.isStartWithMonitoringHost; }
        const instance = this.voiceAnalysisInstance;
        return instance !== null && instance.isRunning;
    },
    isStartWithMonitoringHost: false,
    isMonitoring: function(){
        const urlParam = location.search;
        const result = urlParam.split('&').filter((param) => param.includes('room_mode=2'));
        return (result.length > 0);
    },
    isMicOn: function(){
        const origin = location.origin;
        const isDevEnv =  origin.startsWith('https://192.168.33.12') || origin.startsWith('https://192.168.56.12') || origin.endsWith('https://dev3.meet-in.jp');
        return isDevEnv || NEGOTIATION.isMyMicOn;
    },
    conversationHostPeerId: 0
}

/**
 * コマンドを送信する
 * (sendCommand関数のPeerID指定がMCUで機能してないため
 * 宛先PeerIDをコマンドに乗せて送信する)
 * @param {string | null} targetPeerId
 * @param {object} command
 */
function sendVoiceAnalysisCommand(targetPeerId, command){
    command["to"] = targetPeerId;
    sendCommand(targetPeerId, command);
}

/**
 * 文字起こし関連のコマンドか判別する
 */
function isVoiceAnalysisCommand(command){
    const commands = [
        'PREPARE_VOICE_ANALYSIS',
        'PREPARE_VOICE_ANALYSIS_RESPONSE',
        'VOICE_ANALYSIS_START',
        'VOICE_ANALYSIS_STOP',
        'VOICE_ANALYSIS_RESULT',
        'SHARE_START_CONVERSATION_DATE_TIME'
    ];
    return (new Set(commands)).has(command);
}

/**
 * コマンドに応じて処理を実行する
 */
function executeVoiceAnalysisCommand(json){
    // 全員送信または自分宛てでない場合は即終了
    if(json.to !== null && json.to !== getMyPeerId()) return;

    if (json.command === "PREPARE_VOICE_ANALYSIS") {
        receiveRequestPrepareVoiceAnalysis(json);
    }
    else if (json.command === "PREPARE_VOICE_ANALYSIS_RESPONSE") {
        receiveResponsePrepareVoiceAnalysis(json);
    }
    else if (json.command === "VOICE_ANALYSIS_START") {
        receiveRequestVoiceAnalysisStart(json);
    }
    else if (json.command === "VOICE_ANALYSIS_STOP") {
        receiveRequestVoiceAnalysisStop(json);
    }
    else if (json.command === "VOICE_ANALYSIS_RESULT") {
        receiveVoiceAnalysisResult(json);
    }
    else if(json.command === "SHARE_START_CONVERSATION_DATE_TIME"){
        shareStartConversationDateTime(json);
    }
}

/**
 * 文字起こし開始シーケンスを行う
 */
function voiceAnalysisSequenceStart(initializeEventHandler = (conversationId, result) => {}){
    // ホスト側文字起こし開始
    if(!voiceAnalysisStatus.isRunning()){
        voiceAnalysisStatus.isHost = true;
        if(voiceAnalysisStatus.isMonitoring()) {
            voiceAnalysisStatus.isStartWithMonitoringHost = true;
        } else {
            const targetPeerId = null;
            const speakerNo = 0;
            const voiceAnalysisResultHandler = (_, result) => {
                const displayText = result.display_text;
                const startTime = result.start_time;
                getAudioTextData(displayText, startTime);
            };
            const voiceAnalysisInstance = new VoiceAnalysis(speakerNo, targetPeerId, initializeEventHandler, voiceAnalysisResultHandler, voiceAnalysisStatus.isMicOn);
            voiceAnalysisInstance.start().then();
            voiceAnalysisStatus.voiceAnalysisInstance = voiceAnalysisInstance;
        }
    }

    setTimeout(() => {
        if(voiceAnalysisStatus.isRunning()){
            voiceAnalysisSequenceStart();
        }
    }, 3 * 1000);

    return performance.now();
}

/**
 * 文字起こし開始前の準備要求
 */
function sendRequestPrepareVoiceAnalysis(shareConversationId){
    const request = {
        command: 'PREPARE_VOICE_ANALYSIS',
        shareConversationId: shareConversationId
    }
    sendVoiceAnalysisCommand(null, request);
}

/**
 * PREPARE_VOICE_ANALYSISコマンド受信時の処理
 */
function receiveRequestPrepareVoiceAnalysis(request){
    // グローバル変数のconversationIdを設定する
    conversationId = request.shareConversationId;
    // 感情解析実行者のpeerId保存
    voiceAnalysisStatus.conversationHostPeerId = request.from_mcu_peer_id;
    // 文字起こし開始前の準備要求者へデータを返す
    const targetPeerId = request.from_mcu_peer_id;
    const response = {
        command: "PREPARE_VOICE_ANALYSIS_RESPONSE",
        staffType: $("#staff_type").val(),
        staffId: $("#staff_id").val(),
        clientId: $("#client_id").val()
    }
    sendVoiceAnalysisCommand(targetPeerId, response);
}

/**
 * PREPARE_VOICE_ANALYSIS_RESPONSE受信時の処理
 */
function receiveResponsePrepareVoiceAnalysis(response){
    const fromPeerId = response.from_mcu_peer_id;
    const peers = voiceAnalysisStatus.peers;

    if(!(fromPeerId in peers)){
        const speakerNo = Object.keys(peers).length + 1;
        voiceAnalysisStatus.peers[fromPeerId] = {
            speakerNo: speakerNo,
            staffType: response.staffType, 
            staffId: response.staffId, 
            clientId: response.clientId
        }
    }
    sendRequestVoiceAnalysisStart(fromPeerId);
}

/**
 * 文字起こし開始リクエスト
 */
function sendRequestVoiceAnalysisStart(targetPeerId = null){
    const request = {
        command: 'VOICE_ANALYSIS_START',
        speaker_no: voiceAnalysisStatus.peers[targetPeerId].speakerNo
    }
    sendVoiceAnalysisCommand(targetPeerId, request);
}

/**
 * 文字起こし開始リクエスト受信時の処理
 */
function receiveRequestVoiceAnalysisStart(request){
    // 文字起こし開始
    if(!voiceAnalysisStatus.isRunning() && !voiceAnalysisStatus.isMonitoring()){
        const targetPeerId = request.from_mcu_peer_id;
        const speakerNo = request.speaker_no;
        const voiceAnalysisResultHandler = sendVoiceAnalysisResult;
        const voiceAnalysisInstance = new VoiceAnalysis(speakerNo, targetPeerId, (conversationId, result) => {}, voiceAnalysisResultHandler, voiceAnalysisStatus.isMicOn);
        voiceAnalysisInstance.start().then();
        voiceAnalysisStatus.voiceAnalysisInstance = voiceAnalysisInstance;

        // ホストが文字起こし停止または退出してる場合に文字起こし停止。一定時間で監視する。
        const monitoring = () => {
            setTimeout(() => {
                if(voiceAnalysisStatus.isRunning()){
                    if(voiceAnalysisStatus.isHostAlive){
                        voiceAnalysisStatus.isHostAlive = false;
                        monitoring();
                    } else {
                        console.log('host monitoring timeout');
                        voiceAnalysisStatus.voiceAnalysisInstance.stop();
                        voiceAnalysisStatus.voiceAnalysisInstance = null;
                    }
                }
            }, 60 * 1000);
        }
        monitoring();
    } else if(!voiceAnalysisStatus.isRunning() && voiceAnalysisStatus.isMonitoring()){
        voiceAnalysisStatus.isStartWithMonitoringHost = true;
    } else if(voiceAnalysisStatus.isRunning() && !voiceAnalysisStatus.isMonitoring()){
        // targetPeerIdの更新
        voiceAnalysisStatus.voiceAnalysisInstance.targetPeerId = request.from_mcu_peer_id;
    }
    voiceAnalysisStatus.isHostAlive = true;
}

/**
 * peerIdへ文字起こし結果を送信する
 * @param peerId
 * @param data {
 * start_time: number,
 * voice_analysis_start_time: number,
 * speaker_no: number,
 * text: string
 * }
 */
function sendVoiceAnalysisResult(peerId, result){
    const request = {
        command: 'VOICE_ANALYSIS_RESULT',
        result: result
    }
    sendVoiceAnalysisCommand(peerId, request);
}

/**
 * 文字起こし結果コマンド受信時の処理
 */
function receiveVoiceAnalysisResult(request){
    // 文字起こしの結果を表示
    console.log('voice analysis result');

    const result = request.result;
    const displayText = result.display_text;

    // 文字起こし結果がホストの文字起こし開始時間を基準に何ms後のものかを算出
    const startTime = result.start_time + (result.voice_analysis_start_time - voiceAnalysisStatus.voiceAnalysisInstance.recognizeStartTime);

    getAudioTextData(displayText, startTime);
}

/**
 * 文字起こし停止リクエスト
 */
function sendRequestVoiceAnalysisStop(){
    const request = {
        command: 'VOICE_ANALYSIS_STOP'
    }
    sendVoiceAnalysisCommand(null, request);

    // ホスト側文字起こし停止
    stopVoiceAnalysis();
}

/**
 * 文字起こし停止リクエスト受信時の処理
 */
function receiveRequestVoiceAnalysisStop(request){
    // ピア側文字起こし停止
    stopVoiceAnalysis();
}

/**
 * 文字起こし停止処理
 */
function stopVoiceAnalysis(){
    // 文字起こし停止
    voiceAnalysisStatus.isHost = false;
    if(voiceAnalysisStatus.isRunning) {
        if(voiceAnalysisStatus.isMonitoring()) {
            voiceAnalysisStatus.isStartWithMonitoringHost = false;
        } else {
            voiceAnalysisStatus.voiceAnalysisInstance.stop();
            voiceAnalysisStatus.voiceAnalysisInstance = null;
        }
    }
}

/**
 * 自分のPeerIDを取得する
 * @returns {{style: string, type: string}}
 */
function getMyPeerId(){
    return publisher.room.myId;
}

/**
 * 音声解析を実行した人へ、音声解析開始時間を送信する
 * @param {*} speakerNo 音声解析者番号
 * @param {*} startConversationDateTime 音声解析実施時間
 */
function sendStartConversationDateTime(speakerNo, startConversationDateTime){
    const request = {
        command: 'SHARE_START_CONVERSATION_DATE_TIME',
        speakerNo: speakerNo, 
        startConversationDateTime: startConversationDateTime, 
    }
    sendVoiceAnalysisCommand(voiceAnalysisStatus.conversationHostPeerId, request);
}
/**
 * SHARE_START_CONVERSATION_DATE_TIME受信時の処理
 */
function shareStartConversationDateTime(response){
    // 音声解析実行開始時間を保持する
    startConversationDateTimes[response.speakerNo] = response.startConversationDateTime;
}