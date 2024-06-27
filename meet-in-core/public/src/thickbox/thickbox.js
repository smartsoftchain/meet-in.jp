/*
 * Thickbox 3.1 - One Box To Rule Them All.
 * By Cody Lindley (http://www.codylindley.com)
 * Copyright (c) 2007 cody lindley
 * Licensed under the MIT License: http://www.opensource.org/licenses/mit-license.php
*/
		  
var tb_pathToImage = "/src/thickbox/loadingAnimation.gif";
//width=0のとき現在のウィンドウ幅最大に
//height=0のとき現在のウィンドウ高最大に改良ants部分
/*!!!!!!!!!!!!!!!!! edit below this line at your own risk !!!!!!!!!!!!!!!!!!!!!!!*/

//on page load call tb_init
//$(document).ready(function(){   
//	tb_init('a.thickbox, area.thickbox, input.thickbox, tr.thickbox, td.thickbox');//pass where to apply thickbox
//	imgLoader = new Image();// preload image
//	imgLoader.src = tb_pathToImage;
//});

//add thickbox to href & area elements that have a class of .thickbox
function tb_init(domChunk){
	$(domChunk).click(function(){
	var t = this.title || this.name || null;
	var a = this.href || this.alt || this.title;
	var g = this.rel || false;
	tb_show(t,a,g);
	this.blur();
	return false;
	});
}
//↓URLをパースする(アンツが追加)getUrlVars()["cid"];
function tickbox_getUrlVars(url){//現在のurlはwindow.location.hrefで取得可能
	var vars = [], hash;
	var hashes = url.slice(url.indexOf('?') + 1).split('&');
	for(var i = 0; i <hashes.length; i++){
		hash = hashes[i].split('=');
		vars.push(hash[0]);
		vars[hash[0]] = hash[1];
	}
	return vars;
}

function tb_show(caption, url, imageGroup){
	oa_prefix	=tickbox_getUrlVars(url)["oa_prefix"];
	if(oa_prefix==undefined) oa_prefix= "";//引数のデフォルト
	
	//↓ants　もしTB_windowが開かれていたら一旦削除
	if(0<$("#"+oa_prefix+"TB_window").size()){
		$("#"+oa_prefix+"TB_window").remove();
	}
	try{
		if(typeof document.body.style.maxHeight === "undefined"){//if IE 6
			$("body","html").css({height: "100%", width: "100%"});
			$("html").css("overflow","hidden");
			if (document.getElementById("TB_HideSelect") === null){//iframe to hide select elements in ie6
				$("body").append("<iframe id='TB_HideSelect'></iframe><div id='"+oa_prefix+"TB_overlay'></div><div id='"+oa_prefix+"TB_window'></div>");
				$("#"+oa_prefix+"TB_overlay").click(tb_remove);
			}
		}else{//all others
			if(document.getElementById(""+oa_prefix+"TB_overlay") === null){
				$("body").append("<div id='"+oa_prefix+"TB_overlay'></div><div id='"+oa_prefix+"TB_window'></div>");
				$("#"+oa_prefix+"TB_overlay").click(tb_remove);
			}
		}
		
		if(tb_detectMacXFF()){
			$("#"+oa_prefix+"TB_overlay").addClass(""+oa_prefix+"TB_overlayMacFFBGHack");//use png overlay so hide flash
		}else{
			$("#"+oa_prefix+"TB_overlay").addClass(""+oa_prefix+"TB_overlayBG");//use background and opacity
		}

		
		if(caption===null){caption="";}
		$("body").append("<div id='TB_load'><img src='"+imgLoader.src+"' /></div>");//add loader to the page
		$('#TB_load').show();//show loader
		
		var baseURL;
	  if(url.indexOf("?")!==-1){ //ff there is a query string involved
			baseURL = url.substr(0, url.indexOf("?"));
	  }else{ 
	  	baseURL = url;
	  }
	   
	  var urlString = /\.jpg$|\.jpeg$|\.png$|\.gif$|\.bmp$/;
	  var urlType = baseURL.toLowerCase().match(urlString);
		if(urlType == '.jpg' || urlType == '.jpeg' || urlType == '.png' || urlType == '.gif' || urlType == '.bmp'){//code to show images
			TB_PrevCaption = "";
			TB_PrevURL = "";
			TB_PrevHTML = "";
			TB_NextCaption = "";
			TB_NextURL = "";
			TB_NextHTML = "";
			TB_imageCount = "";
			TB_FoundURL = false;
			if(imageGroup){
				TB_TempArray = $("a[@rel="+imageGroup+"]").get();
				for (TB_Counter = 0; ((TB_Counter < TB_TempArray.length) && (TB_NextHTML === "")); TB_Counter++) {
					var urlTypeTemp = TB_TempArray[TB_Counter].href.toLowerCase().match(urlString);
						if (!(TB_TempArray[TB_Counter].href == url)) {						
							if (TB_FoundURL) {
								TB_NextCaption = TB_TempArray[TB_Counter].title;
								TB_NextURL = TB_TempArray[TB_Counter].href;
								TB_NextHTML = "<span id='TB_next'>&nbsp;&nbsp;<a href='#'>Next &gt;</a></span>";
							} else {
								TB_PrevCaption = TB_TempArray[TB_Counter].title;
								TB_PrevURL = TB_TempArray[TB_Counter].href;
								TB_PrevHTML = "<span id='TB_prev'>&nbsp;&nbsp;<a href='#'>&lt; Prev</a></span>";
							}
						} else {
							TB_FoundURL = true;
							TB_imageCount = "Image " + (TB_Counter + 1) +" of "+ (TB_TempArray.length);											
						}
				}
			}

			imgPreloader				= new Image();
			imgPreloader.onload = function(){		
			imgPreloader.onload = null;
				
			// Resizing large images - orginal by Christian Montoya edited by me.
			var pagesize = tb_getPageSize();
			var x = pagesize[0] - 150;
			var y = pagesize[1] - 150;
			var imageWidth	= imgPreloader.width;
			var imageHeight	= imgPreloader.height;
			if (imageWidth > x) {
				imageHeight = imageHeight * (x / imageWidth); 
				imageWidth = x; 
				if (imageHeight > y) { 
					imageWidth = imageWidth * (y / imageHeight); 
					imageHeight = y; 
				}
			} else if (imageHeight > y) { 
				imageWidth = imageWidth * (y / imageHeight); 
				imageHeight = y; 
				if (imageWidth > x) { 
					imageHeight = imageHeight * (x / imageWidth); 
					imageWidth = x;
				}
			}
			// End Resizing
			
			TB_WIDTH	= imageWidth	+ 30;
			TB_HEIGHT = imageHeight + 60;
			$("#"+oa_prefix+"TB_window").append("<a href='' id='TB_ImageOff' title='Close'><img id='TB_Image' src='"+url+"' width='"+imageWidth+"' height='"+imageHeight+"' alt='"+caption+"'/></a>" + "<div id='TB_caption'>"+caption+"<div id='TB_secondLine'>" + TB_imageCount + TB_PrevHTML + TB_NextHTML + "</div></div><div id='TB_closeWindow'><a href='#' id='TB_closeWindowButton' title='Close'>close</a> or Esc Key</div>"); 		
			
			$("#TB_closeWindowButton").click(tb_remove);
			
			if (!(TB_PrevHTML === "")) {
				function goPrev(){
					if($(document).unbind("click",goPrev)){$(document).unbind("click",goPrev);}
					$("#"+oa_prefix+"TB_window").remove();
					$("body").append("<div id='"+oa_prefix+"TB_window'></div>");
					tb_show(TB_PrevCaption, TB_PrevURL, imageGroup);
					return false;	
				}
				$("#TB_prev").click(goPrev);
			}
			
			if (!(TB_NextHTML === "")) {		
				function goNext(){
					$("#"+oa_prefix+"TB_window").remove();
					$("body").append("<div id='"+oa_prefix+"TB_window'></div>");
					tb_show(TB_NextCaption, TB_NextURL, imageGroup);				
					return false;	
				}
				$("#TB_next").click(goNext);
				
			}

			document.onkeydown = function(e){ 	
				if (e == null) { // ie
					keycode = event.keyCode;
				} else { // mozilla
					keycode = e.which;
				}
				if(keycode == 27){ // close
					tb_remove();
				} else if(keycode == 190){ // display previous image
					if(!(TB_NextHTML == "")){
						document.onkeydown = "";
						goNext();
					}
				} else if(keycode == 188){ // display next image
					if(!(TB_PrevHTML == "")){
						document.onkeydown = "";
						goPrev();
					}
				}	
			};
			
			tb_position(oa_prefix);
			$("#TB_load").remove();
			$("#TB_ImageOff").click(tb_remove);
			$("#"+oa_prefix+"TB_window").css({display:"block"}); //for safari using css instead of show
			};
			
			imgPreloader.src = url;
		//↓画像ではなく、HTMLのとき
		}else{//code to show html
			
			var queryString = url.replace(/^[^\?]+\??/,'');
			var params = tb_parseQuery( queryString );
//↓ants　width=0のとき現在のウィンドウ幅最大にheight=0のとき現在のウィンドウ高最大に改良
if(params['width'		]==='0') params['width'		]=document.documentElement.clientWidth-35;
if(params['height'	]==='0') params['height'	]=window.innerHeight-20;
//console.log(self.window.innerHeight);
			TB_WIDTH	= (params['width'		]*1) + 30 || 630; //defaults to 630 if no paramaters were added to URL
			TB_HEIGHT	= (params['height'	]*1) + 40 || 440; //defaults to 440 if no paramaters were added to URL
			ajaxContentW = TB_WIDTH - 30;
			//ants変更：閉じるボタン・miniableボタン分の縮小は、layout_modal内で実行 ajaxContentH = TB_HEIGHT - 45;
			ajaxContentH=$(window).height();
			TB_HEIGHT	= ajaxContentH; 
			if(url.indexOf('TB_iframe') != -1){// either iframe or ajax window		
					urlNoQuery = url.split('TB_');
					$("#"+oa_prefix+"TB_iframeContent").remove();
					if(params['modal'] != "true"){//iframe no modal
						$("#"+oa_prefix+"TB_window").append("<div id='TB_title'><div id='TB_ajaxWindowTitle'>"+caption+"</div><div id='TB_closeAjaxWindow'><a href='#' id='TB_closeWindowButton' title='Close'>close</a> or Esc Key</div></div><iframe frameborder='0' hspace='0' src='"+urlNoQuery[0]+"' id='"+oa_prefix+"TB_iframeContent' name='TB_iframeContent"+Math.round(Math.random()*1000)+"' onload='tb_showIframe(oa_prefix=\""+oa_prefix+"\")' style='width:"+(ajaxContentW + 29)+"px;height:"+(ajaxContentH + 17)+"px;' > </iframe>");
					}else{//iframeのモーダル
						$("#"+oa_prefix+"TB_overlay").unbind();
						//$("#"+oa_prefix+"TB_overlay").click(function(){	if(window.confirm('本当にポップアップ画面を閉じてよろしいですか？')){tb_remove_parent();}});
						$("#"+oa_prefix+"TB_window").append("<iframe frameborder='0' hspace='0' src='"+urlNoQuery[0]+"' id='"+oa_prefix+"TB_iframeContent' name='TB_iframeContent"+Math.round(Math.random()*1000)+"' onload='tb_showIframe(oa_prefix=\""+oa_prefix+"\")' style='width:"+(ajaxContentW + 29)+"px;height:"+(ajaxContentH )+"px;'> </iframe>");
					}
			}else{// not an iframe, ajax
					if($("#"+oa_prefix+"TB_window").css("display") != "block"){
						if(params['modal'] != "true"){//ajax no modal
						$("#"+oa_prefix+"TB_window").append("<div id='TB_title'><div id='TB_ajaxWindowTitle'>"+caption+"</div><div id='TB_closeAjaxWindow'><a href='#' id='TB_closeWindowButton'>close</a> or Esc Key</div></div><div id='TB_ajaxContent' style='width:"+ajaxContentW+"px;height:"+ajaxContentH+"px'></div>");
						}else{//ajax modal
						$("#"+oa_prefix+"TB_overlay").unbind();
						$("#"+oa_prefix+"TB_window").append("<div id='TB_ajaxContent' class='TB_modal' style='width:"+ajaxContentW+"px;height:"+ajaxContentH+"px;'></div>");	
						}
					}else{//this means the window is already up, we are just loading new content via ajax
						$("#TB_ajaxContent")[0].style.width = ajaxContentW +"px";
						$("#TB_ajaxContent")[0].style.height = ajaxContentH +"px";
						$("#TB_ajaxContent")[0].scrollTop = 0;
						$("#TB_ajaxWindowTitle").html(caption);
					}
			}
					
			$("#TB_closeWindowButton").click(tb_remove);
			if(url.indexOf('TB_inline') != -1){	
				$("#TB_ajaxContent").append($('#' + params['inlineId']).children());
				$("#"+oa_prefix+"TB_window").unload(function () {
					$('#' + params['inlineId']).append( $("#TB_ajaxContent").children() ); // move elements back when you're finished
				});
				tb_position(oa_prefix);
				$("#TB_load").remove();
				$("#"+oa_prefix+"TB_window").css({display:"block"}); 
			}else if(url.indexOf('TB_iframe') != -1){
				tb_position(oa_prefix);
				if($.browser.safari){//safari needs help because it will not fire iframe onload
					$("#TB_load").remove();
					$("#"+oa_prefix+"TB_window").css({display:"block"});
				}
			}else{
				$("#TB_ajaxContent").load(url += "&random=" + (new Date().getTime()),function(){//to do a post change this load method
					tb_position(oa_prefix);
					$("#TB_load").remove();
					tb_init("#TB_ajaxContent a.thickbox");
					$("#"+oa_prefix+"TB_window").css({display:"block"});
				});
			}
		}
		//↓ants 閉じる関数(tb_remove())の為、#"+oa_prefix+"TB_windowにTB_windowクラスを追加
		$("#"+oa_prefix+"TB_window" ).addClass("TB_window");
		$("#"+oa_prefix+"TB_overlay").addClass("TB_overlay");

		if(!params['modal']){
			document.onkeyup = function(e){ 	
				if (e == null) { // ie
					keycode = event.keyCode;
				} else { // mozilla
					keycode = e.which;
				}
				if(keycode == 27){ // close
					tb_remove();
				}	
			};
		}
		
	} catch(e) {
		//nothing here
	}
}

//helper functions below
function tb_showIframe(oa_prefix){
	if(oa_prefix==undefined) oa_prefix= "";//引数のデフォルト

	$("#TB_load").remove();
	$("#"+oa_prefix+"TB_window").css({display:"block"});
}

function tb_remove() {
	if($('.TB_window'))oa_prefix= $('.TB_window').attr("id").replace("TB_window", "");
	if(oa_prefix==undefined) oa_prefix= "";//引数のデフォルト

 	$("#TB_imageOff").unbind("click");
	$("#TB_closeWindowButton").unbind("click");
	$("#"+oa_prefix+"TB_window").fadeOut("fast",function(){$("#"+oa_prefix+"TB_window,#"+oa_prefix+"TB_overlay,#TB_HideSelect").trigger("unload").unbind().remove();});
	$("#TB_load").remove();
	if (typeof document.body.style.maxHeight == "undefined") {//if IE 6
		$("body","html").css({height: "auto", width: "auto"});
		$("html").css("overflow","");
	}
	document.onkeydown = "";
	document.onkeyup = "";
	return false;
}

function tb_remove_parent() {
	if($('.TB_window',parent.document))oa_prefix= $('.TB_window',parent.document).attr("id").replace("TB_window", "");
	if(oa_prefix==undefined) oa_prefix= "";//引数のデフォルト
 	$("#TB_imageOff",parent.document).unbind("click");
	$("#TB_closeWindowButton",parent.document).unbind("click");
	$("#"+oa_prefix+"TB_window",parent.document).fadeOut("fast",function(){$("#"+oa_prefix+"TB_window,#"+oa_prefix+"TB_overlay,#TB_HideSelect",parent.document).trigger("unload").unbind().remove();});
	$("#TB_load",parent.document).remove();
	if (typeof parent.document.body.style.maxHeight == "undefined") {//if IE 6
		$("body","html",parent.document).css({height: "auto", width: "auto"});
		$("html",parent.document).css("overflow","");
	}
	document.onkeydown = "";
	document.onkeyup = "";
	return false;
}

function tb_remove_parent2() {
	if($('.TB_window',parent.document))oa_prefix= $('.TB_window',parent.document).attr("id").replace("TB_window", "");
	if(oa_prefix==undefined) oa_prefix= "";//引数のデフォルト
 	$("#TB_imageOff",parent.document).unbind("click");
	$("#TB_closeWindowButton",parent.document).unbind("click");
	$("#"+oa_prefix+"TB_window",parent.document).fadeOut(
		"fast",
		function(){
			$("#"+oa_prefix+"TB_window,#TB_HideSelect",parent.document).trigger("unload").unbind().remove();
		}
	);
//	$("#TB_load",parent.document).remove();
	if (typeof parent.document.body.style.maxHeight == "undefined") {//if IE 6
		$("body","html",parent.document).css({height: "auto", width: "auto"});
		$("html",parent.document).css("overflow","");
	}
	document.onkeydown = "";
	document.onkeyup = "";
	return false;
}

function tb_remove_parent_refresh() {
	if($('.TB_window',parent.document))oa_prefix= $('.TB_window',parent.document).attr("id").replace("TB_window", "");
	if(oa_prefix==undefined) oa_prefix= "";//引数のデフォルト
 	$("#TB_imageOff",parent.document).unbind("click");
	$("#TB_closeWindowButton",parent.document).unbind("click");
	$("#"+oa_prefix+"TB_window",parent.document).fadeOut(
			"fast",
			function(){
				$("#"+oa_prefix+"TB_window,#"+oa_prefix+"TB_overlay,#TB_HideSelect",parent.document).trigger("unload").unbind().remove();
			}
	);
	$("#TB_load",parent.document).remove();
	if (typeof parent.document.body.style.maxHeight == "undefined") {//if IE 6
		$("body","html",parent.document).css({height: "auto", width: "auto"});
		$("html",parent.document).css("overflow","");
	}
	parent.document.location.reload();
	// リロードに時間がかかるので、画面を押せない用にモーダルを表示
	$("div #contentsarea",parent.document).append('<div id="TB_overlay_tmp" class="TB_overlayBG TB_overlay"></div>');
	$("div #contentsarea",parent.document).append('<div id="TB_load_tmp" style="position: fixed;height:13px;width:208px;z-index:103;top: 50%;left: 50%;margin: -6px 0 0 -104px;"><img src="/src/thickbox/loadingAnimation.gif"></div>');
	document.onkeydown = "";
	document.onkeyup = "";
	return false;
}

function tb_position(oa_prefix) {
	if(oa_prefix==undefined) oa_prefix= "";//引数のデフォルト

	$("#"+oa_prefix+"TB_window").css({marginLeft: '-' + parseInt((TB_WIDTH / 2),10) + 'px', width: TB_WIDTH + 'px'});
	if(!(jQuery.browser.msie && jQuery.browser.version < 7)) { // take away IE6
		$("#"+oa_prefix+"TB_window").css({marginTop: '-' + parseInt((TB_HEIGHT / 2),10) + 'px'});
	}
}

function tb_parseQuery ( query ) {
   var Params = {};
   if ( ! query ) {return Params;}// return empty object
   var Pairs = query.split(/[;&]/);
   for ( var i = 0; i < Pairs.length; i++ ) {
      var KeyVal = Pairs[i].split('=');
      if ( ! KeyVal || KeyVal.length != 2 ) {continue;}
      var key = unescape( KeyVal[0] );
      var val = unescape( KeyVal[1] );
      val = val.replace(/\+/g, ' ');
      Params[key] = val;
   }
   return Params;
}

function tb_getPageSize(){
	var de = document.documentElement;
	var w = window.innerWidth  || self.innerWidth  || (de&&de.clientWidth ) || document.body.clientWidth ;
	var h = window.innerHeight || self.innerHeight || (de&&de.clientHeight) || document.body.clientHeight;
	arrayPageSize = [w,h];
	return arrayPageSize;
}

function tb_detectMacXFF() {
  var userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.indexOf('mac') != -1 && userAgent.indexOf('firefox')!=-1) {
    return true;
  }
}


