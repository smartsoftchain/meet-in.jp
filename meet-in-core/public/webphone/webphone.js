    if (document.getElementById('js_not_enabled') != null)  document.getElementById('js_not_enabled').style.display = 'none';

    var attributes = { id: 'webphone', code: 'webphone.webphone.class', name: 'webphone', archive: 'webphone.jar', codebase: '.', width: 1, height: 1, MAYSCRIPT: true };

    var parameters = {
					serveraddress: ''+voipServerAddress+'',
					JAVA_CODEBASE: '.',
					username: '',
					MAYSCRIPT: true,
					mayscript: 'yes',
					scriptable: true,
					jsscriptevent: 2,
					autocfgsave: 4,
//					loglevel: 4,
					hasincomingcall: true,
					jsscriptevent: 2		// to get EVENTs and user balance(credit)
					//classloader_cache: false
					};

document.write(''+
'<script src="/webphone/js/webphonedeploy.js"></script>'+
'<script type="text/JavaScript" src="/webphone/js/curvycorners.src.js"></script>'+
'<script type="text/JavaScript" src="/webphone/js/common_webphone.js"></script>'+
'<script type="text/javascript">var curvyCornersNoAutoScan = true;</script>'+

'<style type="text/css">'+
'#btn_callhangup{'+
'	height:51px; padding:0px; margin:0px; display:inline-block; cursor:pointer; float:left; text-align:center; '+
'	font-family: Arial, Verdana, Helvetica, sans-serif; font-size:16px; font-weight:bold;'+

'   border:2px solid;'+
'	border-radius: 5px;'+
'	-webkit-border-radius: 5px;'+
'	-moz-border-radius: 5px;'+
'}'+
'#btn_callhangup_inner{'+
'	height:47px; padding:0px; margin:0px; display:inline-block; cursor:pointer; text-align:center; '+
'}'+
'#info{'+
'	height:14px; width:100%; display:inline-block; padding:0px; margin:0px; font-size:11px; clear:both; text-align:right;'+
'}'+
'#info_event{'+
'	height:14px; width:100%; clear:both; display:inline-block; padding:0px; margin:0px; font-size:11px; text-align:center;'+
'}'+
'SPAN#credit{'+
'	font-size:11px; float:left; font-weight:bold;'+
'}'+
'SPAN#dtmf{'+
'	font-size:11px; float:left; font-weight:bold;'+
'}'+
'SPAN#status{'+
'	font-size:11px; color:#333333; font-weight:bold;'+
'}'+
'SPAN#displayEvent{'+
'	font-size:11px; float:left; display:inline; text-align:center; width:100%; font-weight:bold;'+
'}'+
'SPAN#button_title{'+
'   float:left; clear:both; text-align:center; width:100%;'+
'}'+
'</style>'+
'<div id="btn_callhangup" onclick="WJSAPI_RegisterCallHangup()">'+
'    <div id="btn_callhangup_inner">'+
'        <div id="info">'+
'            <span id="credit" title="My account balance / My number"></span><span id="dtmf"></span>&nbsp;<span id="status" title="Call status"></span>'+
'        </div>'+
'        <div id="info_event">'+
'            <span id="displayEvent">&nbsp;</span>'+
'        </div>'+
'        <span id="button_title"></span>'+
'    </div>'+
'</div>'+
'<span id="testtest" style="float:left; text-align:left;"></span>'+
'<script type="text/JavaScript" src="/webphone/js/Layout_click2call.js"></script>');
