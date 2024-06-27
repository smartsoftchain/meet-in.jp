var mPortWebSocket = 8080;
var mHostWebSocket = 'wss://' + location.host + ':' + mPortWebSocket + '/';
var mSocket = null;

function initWebSocketClient() {
	try {
		socketClose();
		mSocket = new WebSocket(mHostWebSocket, 'echo-protocol');
		mSocket.onopen = onSocketOpen;
		mSocket.onmessage = onSocketMessage;
		mSocket.onerror = onSocketError;
		mSocket.onclose = onSocketClose;
	} catch (exception) {
		console.log(exception); 
	}
}

function onSocketOpen(event) {
	if (onSocketOpenProc) {
		onSocketOpenProc(event);
	}
}

function onSocketMessage(event) {
	if (onSocketMessageProc) {
		onSocketMessageProc(event);
	}
}

function onSocketError(event) {
	if (onSocketErrorProc) {
		onSocketErrorProc(event);
	}
}

function onSocketClose(event) {
	if (onSocketCloseProc) {
		onSocketCloseProc(event);
	}
}

function socketSendMessage(message) {
	if (!mSocket || mSocket.readyState != WebSocket.OPEN) {
		return;
	}

	mSocket.send(message);
}

function socketSendBinaryData(binaryData) {
	if (!mSocket || mSocket.readyState != WebSocket.OPEN) {
		return;
	}

	mSocket.send(binaryData);
}

function socketClose() {
	if (!mSocket || mSocket.readyState != WebSocket.OPEN) {
		return;
	}
	
	mSocket.close();
	mSocket = null;
}