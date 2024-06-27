
/* Meetin録画のインストール有無 */
function isInstalledTabCapture() {
	if (!((typeof (window.TabCaptureExtentionExists) === 'boolean') && (window.TabCaptureExtentionExists))) {
		return false;
	} else {
		return true;
	}
}

/* Meetin画面共有のインストール有無 */
function isInstalledScreenShare() {
	if (!((typeof (window.ScreenShareExtentionExists) === 'boolean') && (window.ScreenShareExtentionExists))) {
		return false;
	} else {
		return true;
	}
}


