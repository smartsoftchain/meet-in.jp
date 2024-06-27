/* Title:       File Upload
   ─────────────────────────
   Version:     1.0
━━━━━━━━━━━━━━━━━━━━━━━━━━ */

$(function() {
	
	// アップロードボタン
	$(document).on('click', '#uploadBtn', function(e) {
	    e.preventDefault()
	    $('input[type="file"]').click();
	    return false;
	});
	
	// ファイル情報取得
	$('input[type="file"]').change(function(){
		var files = this.files;
		uploadFiles(files);
	});
	
	// ファイルドロップ
	$('#drop-area').bind('drop', function(e){
		e.preventDefault();
		var files = e.originalEvent.dataTransfer.files;
		uploadFiles(files);
	}).bind('dragenter', function(){
		return false;
	}).bind('dragover', function(){
		return false;
	});
	
	// ファイルアップロード
	var uploadFiles = function(files) {
		var fd = new FormData();
		var view = $('#uploadFiles ul');
		var filesLength = files.length;
		for (var i = 0; i < filesLength; i++) {
			fd.append("files[]", files[i]);
			if ($('#file-template').length) {
				item = $('#file-template li').clone();
				$('span.filename', item).text(files[i].name);
				view.append(item);
			}
		}
		// ajaxでアップロード
		$.ajax({
			url: '',
			type: 'POST',
			data: fd,
			processData: false,
			contentType: false,
			success: function(data) {
			}
		});
	}
	
	// 削除
	$(document).on('click', '#uploadFiles a.deletefile', function(e) {
		e.preventDefault();
		$(this).closest('li').fadeOut('fast', function() { $(this).remove(); });
		return false;
	});
});