$(function (){

	//placeholderIE9対応
	if($('[placeholder]').length){
		$('[placeholder]').ahPlaceholder({
			placeholderColor : 'silver',
			placeholderAttr : 'placeholder',
			likeApple : false
		});
	}
	//リスト選択チェック
	if($('.idsselect').length){
		$('.idsselect').shiftcheckbox();
	}
	//リストホバー
	if($('.list_select tr').length){
		$('.list_select tr').hover(function (){
			$(this).addClass('hover_tr');
		},function (){
			$(this).removeClass('hover_tr');
		});
	}
	//チェックボックスデザイン
	if($('.pj_create1 input').length){
		$('.pj_create1 input').iCheck({
			radioClass: 'iradio_flat-red',
			increaseArea: '50%',
			hoverClass: 'hover',
			cursor: true,
			insert: '',
		});
	}
	//文字サイズ
	if($('#sizer a').length){
		$("#sizer a").textresizer({
				target				: "body"								,// 対象要素
				type					: "fontSize"						,// サイズ指定方法
				sizes					: ["8px","13px","17px"]	,// フォントサイズ
				selectedIndex	: 1                      // 初期表示
		});
	}
	//ページトップ
	$('#pagetop a').click(function () {
		$('body, html').animate({ scrollTop: 0 }, 500);
		return false;
	});
  // 日付選択
	if($('.f_date').length){
		$.datepicker.setDefaults($.datepicker.regional['ja']);
		$('.f_date').datepicker({ dateFormat: 'yy/mm/dd' });
	}
	//.main_cとlistの横幅揃える
	if($('.main_c').length){
//		if($('.list').width()>$('.main_c').width()) $('.main_c').width($('.list').width());
	}
	//.main_cとlistの横幅揃える
	if($('.main_r_').length){
//		if($('.list').width()>$('.main_r_').width()) $('.main_r_').width($('.list').width());
	}
	//↓トグル
	oa_toggle(".toggle_doc"			,".toggle_doc_hide"			,false);//詳細：資料送付
	oa_toggle(".toggle_apo"			,".toggle_apo_hide"			,false);//詳細：資料送付
	//oa_toggle(".toggle_mylist"	,".toggle_mylist_hide"	,false);//詳細：マイリスト
	oa_toggle(".toggle_default"	,".toggle_default_hide"	,false);//詳細：デフォルト設定
	oa_toggle(".toggle_detail"	,".toggle_detail_hide"	,false);//詳細：詳細
	oa_toggle(".toggle_edit"		,".toggle_edit_hide"		,false);//詳細：編集
	oa_toggle(".toggle_type2"		,".toggle_type2_hide"		,false);//集計：プロジェクト残り
	oa_toggle(".toggle_tanto"		,".toggle_tanto_hide"		,false);//集計：担当者の単価


	//↓タブ
	oa_tab('.tab_detail',".tab_detailbody p",false);

	//↓thickboxはサイズに影響されるので最後に
	if($('.thickbox').length){
		tb_init('a.thickbox, area.thickbox, input.thickbox, tr.thickbox, td.thickbox');
		imgLoader = new Image();// preload image
		imgLoader.src = tb_pathToImage;
	}
	//↓電話番号コピー
//	if($('#tel_copy').length){
//		setTimeout(function(){
//			$('#tel_copy').zclip({
//															path:'/src/ZeroClipboard.swf',
//															copy:$('#tel_copy').text(),
//															afterCopy	:function (){alert('電話番号をコピーしました');}
//														});
//		},200);
//	}


	//↓集計：第二要因を閉じておく
	if($('#total_con2').length){
		setTimeout(function(){
			$('#total_con2').css('display','none');
		},200);
	}
});


//タブメニュー
//				obj_target_elem:開かれる側<div class='aaa'><p>1</p><p>2</p></div> のとき「aaa p」
//				first_disp:最初に開いておくタブの番号false=デフォルト無
function oa_tab(obj_tab,obj_target_elem,first_disp){
	if($(obj_tab).length){
		$(obj_tab+" a").on("click", function() {
			$(obj_tab+" a").removeClass('current');
			if(first_disp===false && $($(this).attr("title")).css('display')=='block'){
				$(obj_target_elem).hide();
				return;
			}
			$(this).addClass('current');;
			$(obj_target_elem).hide();
			$($(this).attr("title")).fadeToggle();
		});
		//最初に開いておくタブ
		if(first_disp!==false){
			$(obj_tab+" a:eq("+first_disp+")").addClass('current');
			$(obj_target_elem+":eq("+first_disp+")").fadeToggle();
		}
	}
}


//トグル is_btnoffクリック時にボタン自体を消す
function oa_toggle(obj_btn,obj_target,is_btnoff){
	if($(obj_btn).length){
		$(obj_btn).attr("title", 'is_btnoff'+is_btnoff);
		$(obj_btn).on("click", function () {
			$(obj_target).slideToggle("fast");
			if($(this).attr("title")=='is_btnofftrue'){
				$(obj_btn).remove();
			}
		});
	}
}

function open_seach(){
	if($('.btn_area'	).css('display')=='none'){
		$('.btn_search'	).css('display','none'	);
		$('.search_tr').css('display',''			);
		$('.btn_area'	).css('display','block'	);
	}else{
		$('.btn_search'	).css('display',''	);
		$('.search_tr').css('display','none'		);
		$('.btn_area'	).css('display','none'	);
	}
}

//↓チェックボックスに対し、is_check=true全選択　is_check=false全選択解除　is_check=auto最初の値が選択済かどうかでその逆を行う
function setCheckboxAll(fldname,is_check){
	switch(is_check){
	case 'auto':$('[name=\''+fldname+'\']').attr('checked',($('[name=\''+fldname+'\']:first').attr('checked')=='checked')?false:true);break;
	default:$('[name=\''+fldname+'\']').attr('checked',is_check);break;
	}
}

//↓ZeroClipboard用
//function setZeroclip(text,id){
//alert(1);
//	ZeroClipboard.config( { moviePath: './src/ZeroClipboard.swf' } );
//alert(2);
//	var client = new ZeroClipboard($('#telephoneno'));
//alert(3);
//
//	client.on( 'load', function(client){
//		alert('ロードされた');
//		client.on( 'dataRequested', function (client, args) {
//			client.setText(text);
//		});
//		client.on( 'complete', function ( client, args ) {
//			alert("Copied text to clipboard: " + args.text );
//		});
//	});
//	//ZeroClipboard.setMoviePath("./src/ZeroClipboard.swf");
////  clip = new ZeroClipboard.Client();
////    clip.setText(text);
////    clip.addEventListener('mouseOver', function (client) {
////      // update the text on mouse over
////    });
////    clip.glue(id);
//		return false;
//}


//var copyTextToClipboard = function(txt){
//    var copyArea = $("<textarea/>");
//    copyArea.text(txt);
//    $("body").append(copyArea);
//    copyArea.select();
//    document.execCommand("copy");
//    copyArea.remove();
//}