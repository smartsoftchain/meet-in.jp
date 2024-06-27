/**
 * JQuery shiftcheckbox plugin enhanced to two or more checkbox groups.
 *
 * shiftcheckbox provides a simpler and faster way to select/unselect multiple checkboxes within a given range with just two clicks.
 * Inspired from GMail checkbox functionality
 *
 * Just call $('.<class-name>').shiftcheckbox() in $(document).ready
 *
 * @name shiftcheckbox
 * @type jquery
 * @cat Plugin/Form
 * @return JQuery
 *
 * @URL http://www.sanisoft.com/blog/2009/07/02/jquery-shiftcheckbox-plugin
 *
 * Copyright (c) 2009 Aditya Mooley <adityamooley@sanisoft.com>
 * Dual licensed under the MIT (MIT-LICENSE.txt) and GPL (GPL-LICENSE.txt) licenses
 *
 *
 * Powered by en-pc service <info@en-pc.jp>
 * Copyright (c) 2010 en-pc service <info@en-pc.jp>

 */
(function ($){
	var selectorStr = [];
	$.fn.shiftcheckbox= function(){
		var prevChecked	= [];
		var classname		= this.attr('class');//クラス名
		var endChecked 	= [];  // wheather checked 'end point'
		var startStatus	= [];  // status of 'start point' (checked or not)
		prevChecked[classname] = null;//前回にチェックが押されているか？
		selectorStr[classname] = this;
		endChecked[classname]  = null;
		startStatus[classname] = null;

		this.bind("click", function(event) {
			var val					= $(this).find('[type=checkbox]').val();//チェックボックスの値
			var checkStatus	= $(this).find('[type=checkbox]').attr('checked');//チェックボックスがチェックされちるか？
			if( checkStatus == undefined ) checkStatus = false;
			//↓シフトキーが押されている
			if(event.shiftKey){
				// シフトが押されている場合はモーダルを表示する
				if(typeof saveId == "function"){
					$("#TB_custom_overlay").show();
					$("#TB_custom_load").show();
				}
				// if check 'end point'
				if(prevChecked[classname] != null){
					var ind = 0, found = 0, currentChecked;//現在のチェックボックスのインデックス
					currentChecked = getSelected(val,classname);
					var changeCount = 0;
					//↓現在のインデックス＜シフト押す前のインデックス
					if (currentChecked < prevChecked[classname]) {
						$(selectorStr[classname]).each(function(i) {
							if (i >= currentChecked && i <= prevChecked[classname]) {
								$(this).find('[type=checkbox]').attr('checked' , startStatus[classname]);
								$(this).find('[type=checkbox]').change();
								changeCount++;
							}
						});
					//↓現在のインデックス＞シフト押す前のインデックス
					}else{
						$(selectorStr[classname]).each(function(i) {
							if (i >= prevChecked[classname] && i <= currentChecked) {
								$(this).find('[type=checkbox]').attr('checked' , startStatus[classname]);
								$(this).find('[type=checkbox]').change();
								changeCount++;
							}
						});
					}
					prevChecked[classname] = currentChecked;
					endChecked[classname]  = true;
					if(typeof saveId == "function"){
						saveId(changeCount);
					}
				//↓ if check 'start point'
				}else{
					prevChecked[classname] = getSelected(val,classname);
					endChecked[classname]  = null;
					startStatus[classname] = checkStatus;
				}
			//↓シフトキーが押されてない
			}else{                                   // considered to be 'start point'(if not press ShiftKey)
				prevChecked[classname] = getSelected(val,classname);
				endChecked[classname]  = null;
				//クリックをする
				$(this).find('[type=checkbox]').attr('checked',($(this).find('[type=checkbox]').attr('checked')?false:true));
				checkStatus	= $(this).find('[type=checkbox]').attr('checked');//チェックボックスがチェックされちるか？
				if( checkStatus == undefined ) checkStatus = false;
				startStatus[classname] = checkStatus;

				$(this).find('[type=checkbox]').change();
				if(typeof saveId == "function"){
					saveId(1);
				}
			}
			//↓選択された背景を変更する
			changeTr(classname);
		});
		this.bind("keyup", function(event) {
			if (endChecked[classname]) {
				prevChecked[classname] = null;
			}
		});
	};
	function getSelected(val,classname){
		var ind = 0, found = 0, checkedIndex;
		$(selectorStr[classname]).each(function(i) {
			if (val == $(this).find('[type=checkbox]').val() && found != 1) {
				checkedIndex	= ind;
				found					= 1;
			}
			ind++;
		});
		return checkedIndex;
	};
	function changeTr(classname){
		$(selectorStr[classname]).each(function() {
			if($(this).find('[type=checkbox]').attr('checked')){
	    		$(this).addClass('checked_tr');
	//				$(this).find('[class=select]').attr('checked')
			}else{
			    $(this).removeClass('checked_tr');
			}
		});
	};

})(jQuery);

