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


function isPermissionMike()
{
	navigator.mediaDevices.getUserMedia({audio: true})
	.then(function(stream) {
		console.log(stream);
	}).catch(function(error) {
	  // 失敗時にはエラーログを出力
	  console.error('mediaDevice.getUserMedia() error:', error);
	  return;
	});
}


/* 電話のツールチップ表示 */
$(function () {
	$('.tel-tooltip').tooltipster({
		contentAsHTML: true,
		interactive: true,
		theme: 'Default',
		animation: 'fade',
		trigger: 'hover',
		zIndex: 200000001,
		content: '電話をかける',
		contentCloning: false
	});
});

/* お知らせのツールチップ表示 */
$(function () {
	$('.notification-tooltip').tooltipster({
		contentAsHTML: true,
		interactive: true,
		theme: 'Default',
		animation: 'fade',
		trigger: 'hover',
		zIndex: 200000001,
		content: 'お知らせ',
		contentCloning: false
	});
});

/* サポートのツールチップ表示 */
$(function () {
	$('.help-tooltip').tooltipster({
		contentAsHTML: true,
		interactive: true,
		theme: 'Default',
		animation: 'fade',
		trigger: 'hover',
		zIndex: 200000001,
		content: 'FAQ',
		contentCloning: false
	});
});
