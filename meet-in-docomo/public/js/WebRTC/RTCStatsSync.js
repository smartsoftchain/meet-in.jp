var meetinUtility_camera_cnt=0;
var meetinUtility_mic_cnt=0;

	/**
	 * 経路情報取得
	 * getRTCStats()経路情報が取得で出来ない場合は、リトライを行う
	 * @param {*} mediaConnection 
	 */
	function RTCStatsSync(connectionObject){

		let mediaConnection = connectionObject;
//clientLog('INFO', "INFO,MediaType=["+ mediaConnection.metadata.media_type +"]");
		console.log( "MediaType=["+ mediaConnection.metadata.media_type +"]");

		// 総計情報を収集する
		// カメラ
		if ('camera' === mediaConnection.metadata.media_type) {
			meetinUtility_camera_cnt++;
//console.log( meetinUtility_camera_cnt );
//clientLog('DEBUG', "DEBUG,meetinUtility_camera_cnt=["+ meetinUtility_camera_cnt +"]");

			// 総計情報を収集する
			// getRTCStats()は同期メソッドのため、戻り値はPromistoとなるので注意
			const _PC = mediaConnection.getPeerConnection();
			getRTCStats(_PC.getStats(), 'camera')
			// getRTCStatsがPromiseを返し、resolve!!がresolveされるため
			// then()が実行されされる
			.then(value => {
//console.log("戻り値=");
//console.log(value);		// => resolve!!
				if (value !== 0) {
console.log( "MediaType=["+ mediaConnection.metadata.media_type +"]");
clientLog('ERROR', "ERROR,MediaType=["+ mediaConnection.metadata.media_type +"]");

					getCameraRTCStatsTimeoutId = setTimeout( function() {
						// 2秒数待った後に再帰する
						RTCStatsSync(connectionObject);
					}, 2000)
				}
			})
			// getRTCStatsがPromiseを返し、reject!!がrejectされるため
			// catch()が実行される
			.catch(err => {
console.log(err); // => reject!!
clientLog('ERROR', "ERROR,MediaType=["+ err +"]");
			});
		}
		else if ('mic' === mediaConnection.metadata.media_type) {
			meetinUtility_mic_cnt++;
//console.log( meetinUtility_mic_cnt );
//clientLog('DEBUG', "DEBUG,meetinUtility_mic_cnt=["+ meetinUtility_mic_cnt +"]");

			// 総計情報を収集する
			// getRTCStats()は同期メソッドのため、戻り値はPromistoとなるので注意
			const _PC = mediaConnection.getPeerConnection();
			getRTCStats(_PC.getStats(), 'mic')
			// getRTCStatsがPromiseを返し、resolve!!がresolveされるため
			// then()が実行されされる
			.then(value => {
//console.log("戻り値=");
//console.log(value);		// => resolve!!
				if (value !== 0) {
console.log( "MediaType=["+ mediaConnection.metadata.media_type +"]");
clientLog('ERROR', "ERROR,MediaType=["+ mediaConnection.metadata.media_type +"]");
					getCameraRTCStatsTimeoutId = setTimeout( function() {
						// 2秒数待った後に再帰する
						RTCStatsSync(connectionObject);
					}, 2000)
				}
			})
			// getRTCStatsがPromiseを返し、reject!!がrejectされるため
			// catch()が実行される
			.catch(err => {
console.log(err); // => reject!!
clientLog('ERROR', "ERROR,MediaType=["+ err +"]");
			});
		}
	}

	async function getRTCStats(statsObject, media_type){

		let trasportArray = [];			// RTCTransport情報
		let candidateArray = [];		// RTCIceCandidatePair
		let candidatePairArray = [];	// RTCIceCandidate_
		let candidatePairId = '';
		let localCandidateId = '';		// ローカルID
		let remoteCandidateId = '';		// リモートID
		let localCandidate = {};		// ローカル経路情報
		let remoteCandidate = {};		// リモート経路情報

		let stats = await statsObject;
		stats.forEach(stat => {
			if(stat.id.indexOf('RTCTransport') !== -1){
				trasportArray.push(stat);
			}
			if(stat.id.indexOf('RTCIceCandidatePair') !== -1){
				candidatePairArray.push(stat);
			}
			if(stat.id.indexOf('RTCIceCandidate_') !== -1){
				candidateArray.push(stat);
			}
		});

		// RTCTransportよりCandidatePairIdを取得する
		if( trasportArray.length == 0 ){
			// clientLog('DEBUG', 'RTCTransport NON DATA!!');
			return 1;
		}
		trasportArray.forEach(transport => {
			if(transport.dtlsState === 'connected'){
				candidatePairId = transport.selectedCandidatePairId;
			}
		});

		// ローカルID、リモートIDを取得する
		if( candidatePairArray.length == 0 ){
			// clientLog('DEBUG', 'RTCIceCandidatePair NON DATA!!');
			return 2;
		}
		candidatePairArray.forEach(candidatePair => {
			// clientLog('DEBUG', 'candidatePair.state=('+ candidatePair.state +")");
			if(candidatePair.state === 'succeeded' && candidatePair.id === candidatePairId){
				localCandidateId = candidatePair.localCandidateId;
				remoteCandidateId = candidatePair.remoteCandidateId;
			}
			else {
				return 3;
			}
		});

		// 経路情報を取得(ローカル＆リモート)
		if( candidateArray.length == 0 ){
			// clientLog('DEBUG', 'RTCIceCandidate NON DATA!!');
			return 4;
		}
		candidateArray.forEach(candidate => {
			if(candidate.id === localCandidateId){
				localCandidate = candidate;
			}
			if(candidate.id === remoteCandidateId){
				remoteCandidate = candidate;
			}
		});

		if( localCandidate.length == 0 ){
			return 5;
		}
		if( remoteCandidate.length == 0 ){
			return 6;
		}
		if( localCandidate.candidateType == null || localCandidate.candidateType.length == 0
		 || remoteCandidate.candidateType == null || remoteCandidate.candidateType.length == 0 ) {
			return 7;
		}
		if( typeof localCandidate.candidateType === "undefined" || typeof remoteCandidate.candidateType === "undefined" ) {
			return 8;
		}

		/**
		 host:LAN
		 prflx:UDPホールパンチング中に発見された接続候補のIPアドレス、ポート番号を元に接続している
		 srflx:STUNサーバを利用して入手したIPアドレス情報、ポート番号を元に接続している
		 relay:TURNサーバを経由して接続している
		*/
		clientLog('INFO', '#local-candidate ,IP=' + localCandidate.ip + ',PORT=' + localCandidate.port + ',protocol=' +localCandidate.protocol + ',type=' + localCandidate.candidateType + ',media=' + media_type);
		clientLog('INFO', '#remote-candidate ,IP=' + remoteCandidate.ip + ',PORT=' + remoteCandidate.port + ',protocol=' +remoteCandidate.protocol + ',type=' + remoteCandidate.candidateType + ',media='+ media_type);

		// console.log('#local-candidate' + localCandidate.ip + ':' + localCandidate.port + '(' +localCandidate.protocol + ')' + 'type:' + localCandidate.candidateType);
		// console.log('#remote-candidate' + remoteCandidate.ip + ':' + remoteCandidate.port + '(' +remoteCandidate.protocol + ')' + 'type:' + remoteCandidate.candidateType);

		$('.material-icons').removeClass('mi_turn_not_turn');
		$('.material-icons').removeClass('mi_turn_turn');
		if(localCandidate.candidateType.indexOf('relay') === -1) {
			// TURNサーバを経由して接続している
			$('.material-icons').removeClass('mi_turn_turn');
			$('.material-icons').addClass('mi_turn_not_turn');
		}
		else {
			// TURNサーバを経由して接続している
			$('.material-icons').removeClass('mi_turn_not_turn');
			$('.material-icons').addClass('mi_turn_turn');
		}

		// clientLog('INFO', '#local-candidate2 ,IP=' + localCandidate.ip + ',PORT=' + localCandidate.port + ',protocol=' +localCandidate.protocol + ',type=' + localCandidate.candidateType);
		// console.log('#local-candidate2,' + localCandidate.ip + ':' + localCandidate.port + '(' +localCandidate.protocol + ')' + 'type:' + localCandidate.candidateType);
		return 0;
	}
