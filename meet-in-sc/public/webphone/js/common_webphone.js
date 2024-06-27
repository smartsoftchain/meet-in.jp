function isIE() {
	var isIE11 = !!navigator.userAgent.match(/Trident.*rv[ :]*11\./);
	if (isIE11) {
		return isIE11;
	}
	
	return $.browser.msie;
};

function IEversion() {
	var isIE11 = !!navigator.userAgent.match(/Trident.*rv[ :]*11\./);
	if (isIE11) {
		return 11;
	}
	
	var msie=navigator.appVersion.toLowerCase();
	return (msie.indexOf('msie')>-1)?parseInt(msie.replace(/.*msie[ ]/,'').match(/^[0-9]+/)):0;
};

/*****************************  Webphone Javascript API Docummentation  *****************************************
*																												*
*																												*
*	var WJSAPI_isFullyCustomized = true; // put this Javascript line your html head section						*
*																												*
*	WJSAPI_LoadAppletAndRegister()																				*
*		// load the applet and register - with login page (haveLoginPge = true;)								*
*																												*
*	WJSAPI_LoadAppletAndRegisterParam('USERNAME', 'PASSWORD')													*
*		// load the applet and register - without login page (haveLoginPge = false;)							*
*																												*
*																												*
*	WJSAPI_Unregister()		// unregister webphone																*
*	WJSAPI_Call()			// call destination number															*
*	WJSAPI_CallContact(NUMBER)		// call destination number (for example from contact list)					*
*	WJSAPI_Hangup()			// hangup call																		*
*	WJSAPI_Accept()			// accept incoming call																*
*	WJSAPI_Reject()			// reject incoming call																*
*	WJSAPI_Hold()			// call hold																		*
*	WJSAPI_Voicemail()		// call voicemail number															*
*	WJSAPI_Conference()		// conference																		*
*	WJSAPI_CallTransfer()	// call transfer																	*
*	WJSAPI_Chat()			// bring chat settings window														*
*	WJSAPI_AudioDevice()		// bring up audio settings window													*
*	WJSAPI_Mute()			// mute speaker and microphone														*
*	WJSAPI_Redial()			// redial last dialed unmber														*
*	WJSAPI_RegisterCallHangup()  // used for Click to Call button                                                *
*	WJSAPI_BtnValue(value)	// Called in the onclick method of the numpad buttons.								*
*								Passed parameter can be an integer, or a string for non-numeric characters.		*
*								Ex. WJSAPI_BtnValue(1), WJSAPI_BtnValue('#')										*
*																												*
*	Following elements (div, span, p) with the below specified ids must be added to your html file:				*
*																												*
*		On login page:																							*
*			id="username_input"  text field for username														*
*			id="password_input"  text field for password														*
*			id="login_page_error_messages"  for showing error messages on login page							*
*																												*
*		On main (numpad) page:																					*
*			id="login_page_error_messages"  for showing error messages on login page							*
*																												*
*																												*
*		// for cases when applet loading and registering are needed to be achieved sepparatelly:				*
*								Note that WJSAPI_LoadApplet() must be called first !!!							*
*		WJSAPI_LoadApplet()																						*
*		WJSAPI_Register('USERNAME', 'PASSWORD')                                                                  *
*																												*
*																												*
*****************************************************************************************************************/

var isIphoneSkin = false;		//  if iPhone skin is used
var isMultiLineSkin = false;	//  if multiline mode is enabled (only for customized skin)
var nrOfLines = 4;				//  number of lines for Multiline skin
var isFullyCustomized = false;	//  if fully customized skin is used
var isClick2Call = true;       //  if it's used for click to call
var dtmfDelay = 8000;			//	how long(in ms) sent DTMF should be displayed after last DTMF sending
var cookieExpire = 365;			//	cookies Expire after 'value' days			
var eventDisplayTime = 5000;	//  time(in ms) an event should be displayed	
var veryLowCredit = 1;			//	treshold -> if credit less then 'value', appears in red	
var lowCredit = 3;				//	treshold -> if credit less then 'value', appears in white	
var reRegisterTime = 300000;	//	calls API_Register() every "reRegisterTime" miliseconds (5 min)
var pollingTimerIval = 500;     //	time interval (in ms) at which API_Getstatus() is called
var statusGreenColor = '#333333';   // #26b14a - ususally black for click to call
var def_register = true;        // used for click to call - wether to register with domain (default value)
var api_key = '';

var applethandle = null;
var webphoneStatus = null;
var checkCall;	//verify if in call
var checkDTMF;	//verify if sending DTMF
var alertTimerId;
var eventAlertTimerId;
var hold;
var redial;
var mute;
var realCredit;
var DTMFcount;
var callLengthTimerId;	//timer id for calculating call length
var boolCallLengthTimer;
var boolRingTimer;
var callStartTime;
var callLengthInSec;
var boolIncommingCall;	//	true if having incomming call
var currentPage;
var testFocused;
var tempUser;
var tempPassw;
var waitForWebphoneCount;
var appletLoadedBool;	// verify if applet loaded
var isAppletLoaded;		// used in new version
var serverInitBool;		// verify API_ServerInit()
var srvAddr;
var usrParam;
var pssw;
var md5Checksum;
var theRealm;
var boolReRegister;
var remoteHold;
var timerDisplayRinging;
var phoneNumberFieldValue;
var strTime;
var trialVersionDisplay;
var voicemailNr;
var userWJSAPI;
var passwordWJSAPI;
var serverAddress;
var callhangup_isInCall;	// WJSAPI_CallHangup() , when only one button is used for call and hangup
var isGetLine;              // wehter to call API_GetLine()
var globalStatus;
var isRegistered;           // used for click 2 call
var curr_register;


var isWebphoneToJsCalled;
var webphoneToJsCalledNr;
var checkIfPollingTierId;
var pollingTierId;
var getLineTimerId;

var currLine;   // current line - for multiline skin
var lineStatus; // status for every line
var callType;   // call type for every line (Incoming / Outgoing)

function atload()	//	function called on page load
{
	init();
}
window.onload=atload;

function init()	//	function to initialize all variables, called only on page load
{
    // display error message if JavaScript is disabled
    if (document.getElementById('js_not_enabled') != null)  document.getElementById('js_not_enabled').style.display = 'none';
    
    //check if jre is installed and install it
    if (deployJava.getJREs().length <= 0)
    {
        deployJava.returnPage = location.href; // return to this page after JRE is installed
        deployJava.installLatestJRE();
    }
    
	try{isFullyCustomized = WJSAPI_isFullyCustomized}catch (e) {isFullyCustomized = false;}

    currLine = 1;

	if (isFullyCustomized)
	{
		isIphoneSkin = false;
	}
	
	if (!isIphoneSkin)
	{
		if (!isFullyCustomized)
		{
			ApplyCustomSkin();
		}
	}else
	{
		isMultiLineSkin = false;
	}
    
	
	currentPage = 0;
	waitForWebphoneCount = 0;
	appletLoadedBool = false;
	remoteHold = false;
	srvAddr = "";
	usrParam = "";
	pssw = "";
	md5Checksum = "";
	theRealm = "";

	checkCall = false;
	checkDTMF = false;
	hold = false;
	redial = '';
	mute = false;
	realCredit = '';
	DTMFcount = 0;
	btnStatusControl('btn_hangup', 1, 'hangup');
	boolCallLengthTimer = true;
	boolRingTimer = true;
	boolIncommingCall = false;
	callLengthInSec = 0;
	testFocused = false;
	trialVersionDisplay = false;
	
	isWebphoneToJsCalled = false;
	webphoneToJsCalledNr = 0;
	voicemailNr = '';
	callhangup_isInCall = false;
	isAppletLoaded = false;
    globalStatus = '';
    isRegistered = false;
	
	userWJSAPI = '';
	passwordWJSAPI = '';
	serverAddress = '';
    
    lineStatus = new Array(nrOfLines);
    callType = new Array(nrOfLines);
    for (var i = 0; i < nrOfLines; i++)
    {
        lineStatus[i] = '';
        callType[i] = '';
    }
    
    if (isClick2Call)
    {
        try{
        if (register != null)   curr_register = register;   else    curr_register = def_register;
        }catch (e) {curr_register = def_register;}
    }
    
    
	phoneNumberFieldValue = 'Enter number';
	if (document.getElementById('PhoneNumber') != null)   document.getElementById('PhoneNumber').value = phoneNumberFieldValue;
	var callButtons = document.getElementById('callbuttons');
	var acceptReject = document.getElementById('acceptreject');
	if (callButtons != null)	callButtons.style.display = 'inline-block';
	if (acceptReject != null)	acceptReject.style.display = 'none';
	
	var usernameFiled = document.getElementById('username_input');	//get user and password from cookies 
	var passwordField = document.getElementById('password_input');	//if it was saved
	var saveSettings = document.getElementById('savesettings');
    
    var licKeyField = document.getElementById('license_key_input');
    var srvAddrField = document.getElementById('server_address_input');
    
	var usr = readCookie('MZwebPhoneUsr');
	var passw = readCookie('MZwebPhonePassw');
	
	if ((usr != null) && (passw != null) && (usernameFiled != null) && (passwordField != null) && (usr != "") && (passw != ""))	//get saved user and passw from cookies
	{
		usernameFiled.value = usr;
		passwordField.value = passw;
		saveSettings.checked = true;
	}
    
    if (licKeyField != null && readCookie('MZwebPhoneLicKey') != null && readCookie('MZwebPhoneLicKey') != "" && saveSettings.checked == true)
    {
        licKeyField.value = readCookie('MZwebPhoneLicKey');
    }
    
    if (srvAddrField != null && readCookie('MZwebPhoneSrvAddr') != null && readCookie('MZwebPhoneSrvAddr') != "" && saveSettings.checked == true)
    {
        srvAddrField.value = readCookie('MZwebPhoneSrvAddr');
    }
    
	boolReRegister = null;
	timerDisplayRinging = false;
	reRegister();

	try{
    if (!isClick2Call)
    {
        if (haveLoginPage)
        {
            pages(1);
        }else
        {
            pages(2);
        }
    }
	}catch(e) {pages(1);}
}
function onLogin()	//	reset afferent variables when registering: voipRegiste(), voipStatusRegiste()
{
	hold = false;
	mute = false;
	DTMFcount = 0;
	boolCallLengthTimer = true;
	boolRingTimer = true;
	boolIncommingCall = false;
	callLengthInSec = 0;
}
function onCallInit()
{
}
function onCallConnected()	
{
}
function onCallFinished()	//	reset afferent variables when call finished
{
	hold = false;
	mute = false;
	DTMFcount = 0;
	boolCallLengthTimer = true;
	boolRingTimer = true;
	boolIncommingCall = false;
	callLengthInSec = 0;
}
function getURLParameters()	// gets parameters from URL in case login page is not used
{
	var params = new Array();
	var url = window.location.href;
	try {url = url.slice(url.indexOf('?')+1, url.length);} catch (e) { }

	var index = 1;
	var i = 0;
	while (index > 0)
	{
		if (url.indexOf('&') >= 0 )
		{
			params[i] = url.slice(0,url.indexOf('='));
			params[i+1] = url.slice(url.indexOf('=')+1,url.indexOf('&'));
			url = url.slice(url.indexOf('&')+1, url.length);
			i = i + 2;
		}else
		{
			params[i] = url.slice(0,url.indexOf('='));
			params[i+1] = url.slice(url.indexOf('=')+1,url.length);
			index--;
		}
	}
	return params;                  //alert(params[0]+", "+params[1]+", "+params[2]);
}

function noLoginRegister()	//	register without login page, showing directly numpad  !!! DEPRECATED
{
        if(!initcheck()) {return false;}
    var parameters = new Array();
	var testParameters = true;
	try {parameters = getURLParameters();} catch(e) { }
	
	if(parameters  != null)
    {
		for (var i = 0; i < parameters.length; i++)
		{
			if (parameters[i] == null)	{testParameters = false;}
		}

		if (testParameters == true)
		{
			for (var j = 0; j < parameters.length; j = j + 2)
			{
				if (parameters[j] == 'serveraddress')	{srvAddr = parameters[j+1];}
				if (parameters[j] == 'username')		{usrParam = parameters[j+1];}
				if (parameters[j] == 'password')		{pssw = parameters[j+1];}
				if (parameters[j] == 'md5')				{md5Checksum = parameters[j+1];}
				if (parameters[j] == 'realm')			{theRealm = parameters[j+1];}
			}
		}
	}else
	{
		return false;
	}
		//applethandle.API_ServerInit(""+srvAddr+"");
		//setTimeout ( "noLoginRegister()", 300);

	if (md5Checksum.length > 2)
	{
		if (theRealm.length < 2)	{theRealm = srvAddr;}
                 
		applethandle.API_SetCredentialsMD5(""+srvAddr+"", ""+usrParam+"", ""+md5Checksum+"", ""+theRealm+"");
		applethandle.API_Register(""+srvAddr+"", ""+usrParam+"", "", "", "");
	}else
	{         
		applethandle.API_Register(""+srvAddr+"", ""+usrParam+"", ""+pssw+"", "", "");
	}
	tempUser = usrParam;tempPassw = pssw;
    return true;
}
function pages(pageNum)	//show login page(1) or Num. Pad page(2)
{
	currentPage = pageNum;
	var pageRegister = document.getElementById('container_register');
	var pageDial = document.getElementById('container_dial');
	
	if (pageRegister != null && pageDial != null)
	{
		
		if (pageNum == 1)
		{
			pageRegister.style.display = 'inline-block';
			pageDial.style.display = 'none';
		}
		else if (pageNum == 2)
		{
			pageRegister.style.display = 'none';
			pageDial.style.display = 'inline-block';
			
			clearTimeout (checkIfPollingTierId);
			checkIfPollingTierId = setTimeout ( "isPollingNeeded()", 2500 );
		}
	}
}
function btnControl(id, control)	// buttons hover effect
{
	if (document.getElementById(id) == null)	return;
    
    var imgPath = document.getElementById(id).getAttribute('src');
    imgPath = imgPath.substr(0, imgPath.lastIndexOf('/') + 1);
	
	if (voicemailNr.length > 0 && id == 'btn_hold')
	{
		if (control == 1)	{document.getElementById(id).setAttribute('src',imgPath+'btn_voicemail.jpg');}
		if (control == 2)	{document.getElementById(id).setAttribute('src',imgPath+'btn_voicemail_hover.jpg');}
	}else
	{
		var ext = '';
		if ((id == 'speaker' || id == 'logout') && isIphoneSkin == false) {ext = 'png';}else{ext = 'jpg';}
		
		if (control == 1)	{document.getElementById(id).setAttribute('src',imgPath + id+'.' + ext);}
		if (control == 2)	{document.getElementById(id).setAttribute('src',imgPath + id+'_hover.' + ext);}
	}
}
function btnStatusControl(id, control, btn)	// call, hangup buttons hover and disabled effect
{
    if (!isIphoneSkin)  return;
    var imgPath = document.getElementById(id).getAttribute('src');
    imgPath = imgPath.substr(0, imgPath.lastIndexOf('/') + 1);
    
	if (btn == 'call')
	{
		if (checkCall == true)
		{
			if (document.getElementById(id) != null)
			{
				document.getElementById(id).setAttribute('src',imgPath + id+'_disabled.jpg');
			}
		}else
		{
			btnControl(id, control);
		}
	}
	else if (btn == 'hangup')
	{
		if (checkCall == true)
		{
			btnControl(id, control);
		}else
		{
			if (document.getElementById(id) != null)
			{
				document.getElementById(id).setAttribute('src',imgPath + id+'_disabled.jpg');
			}
		}
	}
}
function testFocus(focusTest)
{
	if (focusTest == 0)	{testFocused = false;}
	if (focusTest == 1)	{testFocused = true;}
	
	var phoneNumVal = document.getElementById('PhoneNumber');
	if (phoneNumVal.value == phoneNumberFieldValue)
	{
		phoneNumVal.value = '';
	}
}
function onKeyPressEvent(event)
{
	var pressedKey = -1;
	if ((currentPage == 2) && (testFocused == false))
	{
		switch(event.keyCode)
		{
			case 48:pressedKey = 0;break;
			case 49:pressedKey = 1;break;
			case 50:pressedKey = 2;break;
			case 51:pressedKey = 3;break;
			case 52:pressedKey = 4;break;
			case 53:pressedKey = 5;break;
			case 54:pressedKey = 6;break;
			case 55:pressedKey = 7;break;
			case 56:pressedKey = 8;break;
			case 57:pressedKey = 9;break;
													// for numpad
			case 96:pressedKey = 0;break;
			case 97:pressedKey = 1;break;
			case 98:pressedKey = 2;break;
			case 99:pressedKey = 3;break;
			case 100:pressedKey = 4;break;
			case 101:pressedKey = 5;break;
			case 102:pressedKey = 6;break;
			case 103:pressedKey = 7;break;
			case 104:pressedKey = 8;break;
			case 105:pressedKey = 9;break;
													// backspace / delete
			case 8:pressedKey = 100;break;
			case 46:pressedKey = 200;break;
			
			case 13:WJSAPI_Call();break;
	
			default:pressedKey = -1;
		}
		if (pressedKey != -1)	{WJSAPI_BtnValue(pressedKey);}
	}else
	{
		if (event.keyCode == 13)
		{
			WJSAPI_Call();
		}else
		{
			return false;
		}
	}
    return true;
}
function WJSAPI_BtnValue(id)	// retrieving values of num pad buttons and sending DTMF if in call
{
	if (document.getElementById('PhoneNumber').value == phoneNumberFieldValue)
	{
		 document.getElementById('PhoneNumber').value = '';
	}

	var value;
	try
	{
		if (isNaN(id))
		{
			var id_length = id.length;
			value = id.charAt(id_length-1);
			if (id == 'btn_10') {value = '*'}
			if (id == 'btn_11') {value = '#'}
		}else
		{
			value = id.toString();
		}
	} catch (e) { }
	
	if (checkCall == true)
	{
		if ((value != 100) && (value != 200))
		{
			if(!initcheck()) {alert('Cannot find applet handle !');return false;}
			applethandle.API_Dtmf(-2,""+value+"");
			var dtmf = document.getElementById('dtmf');
			DTMFcount++;
			
			document.getElementById('credit').innerHTML = '';
			checkDTMF = true;
            if (dtmf != null)
            {
                if (dtmf.innerHTML == '')
                {
                    displayDTMF('DTMF <strong>'+value+'</strong> sent ok: <strong>'+value+'</strong>',dtmfDelay);
                }else
                {
                    var auxString = dtmf.innerHTML;
                    if (DTMFcount > 9)
                    {
                        displayDTMF('DTMF <strong>'+value+'</strong> sent ok: <strong>'+value+'</strong>',dtmfDelay);
                        DTMFcount = 0;
                    }else
                    {
                        auxString = auxString.replace(/DTMF <strong>\w/,'DTMF <strong>'+value);
                        displayDTMF(auxString+'<strong>'+value+'</strong>',dtmfDelay);
                    }
                }
            }
		}
	}else
	{
		var number = document.getElementById('PhoneNumber').value;
		if (value == 100)
		{
			document.getElementById('PhoneNumber').value = number.slice(0, number.length - 1);
		}else
		{
			if (value == 200)
			{
				document.getElementById('PhoneNumber').value = '';
			}else
			{
				document.getElementById('PhoneNumber').value = number+value;
			}
		}
	}
    return true;
}
function displayDTMF(strDTMF,delay)	// timer, displaying DTMF
{
	var dtmf = document.getElementById('dtmf');
    if (dtmf != null)	dtmf.innerHTML = strDTMF;
	clearTimeout (alertTimerId);
	alertTimerId = setTimeout ( "hideDTMF()", delay );
}
function hideDTMF()	{checkDTMF = false;if (document.getElementById('dtmf') != null)    document.getElementById('dtmf').innerHTML = '';}	//	hiding DTMF
function isPollingNeeded()
{
	if (isAppletLoaded)
	{
		if (!isWebphoneToJsCalled)
		{
			if(!initcheck()) {alert('Cannot find applet handle !');return false;}
			pollingStatus();
		}
	}else
	{
		setTimeout ( "isPollingNeeded()", pollingTimerIval );
	}
    return true;
}
function pollingStatus()
{
	var polledStatus = (applethandle.API_GetStatus(-2)).trim();

    globalStatus = polledStatus;
    preProcessNotifications(polledStatus);

	clearTimeout (pollingTierId);
	pollingTierId = setTimeout ( "pollingStatus()", pollingTimerIval );
}
function webphonetojs(varr)
{
	var evNot = '' + varr;
    
	if (isWebphoneToJsCalled == false)	{webphoneToJsCalledNr++;}
	if (webphoneToJsCalledNr > 1)		{isWebphoneToJsCalled = true;}
	
	preProcessNotifications(evNot);
}
function preProcessNotifications(eventNotif)
{
    if (eventNotif === "undefined" || eventNotif === null)    return;

    if (eventNotif.indexOf("EOL") > 0)	// break notification into lines
    {
        while (eventNotif.length > 5)
		{
			var pos = eventNotif.indexOf("STATUS");
			if (pos < 0 || (eventNotif.indexOf("EVENT") >= 0 && eventNotif.indexOf("EVENT") < pos))	pos = eventNotif.indexOf("EVENT");
			var posEnd = eventNotif.indexOf(",EOL");
			
			var eventTmp = eventNotif.substring(pos, posEnd);
			eventNotif = eventNotif.substring(posEnd + 4);

			processNotifications(eventTmp);
		}
    }else
    {
        processNotifications(eventNotif);
    }
}
function processNotifications(eventNotify)
{
	var callButtons = document.getElementById('callbuttons');
	var acceptReject = document.getElementById('acceptreject');
	var creditSpan = document.getElementById('credit');
    var chanelStatus = '';
    // belerakni if-be
	
	var eventCredit = eventNotify.match('EVENT,EVENT,Credit:');	//	get credit from EVENT messages
	if (eventCredit == 'EVENT,EVENT,Credit:')
	{
		var strCredit = eventNotify.slice(eventNotify.lastIndexOf(",")+1, eventNotify.length);
		var onlyCredit = eventNotify.slice(eventNotify.indexOf(" ")+1, eventNotify.lastIndexOf(" "));
		var numCredit = parseFloat(onlyCredit);
		
		if (onlyCredit != null && onlyCredit.length > 0)
		{
			if (numCredit < veryLowCredit)
			{
				realCredit = strCredit.replace(onlyCredit, '<strong style="color:#ff0000">'+onlyCredit+'</strong>');
			}else
			{
				if (numCredit < lowCredit)
				{
					realCredit = strCredit.replace(onlyCredit, '<strong>'+onlyCredit+'</strong>');
				}else
				{
					realCredit = strCredit.replace(onlyCredit, '<strong style="color:'+statusGreenColor+'">'+onlyCredit+'</strong>');
				}
			}
		}
	}else
	{
		if ((realCredit == '') && (tempUser != '') && (tempUser != null))
		{
			realCredit = '<strong style="color:'+statusGreenColor+'">'+tempUser+'</strong>';
		}
	}
	
    if (eventNotify.indexOf('STATUS') >= 0)
    {
        eventNotify = eventNotify.replace(/\s+/g,'');
        var theStatus = eventNotify.slice(eventNotify.indexOf(',') + 1, eventNotify.length);
        var statLine = theStatus.slice(0, theStatus.indexOf(','));
        
        theStatus = theStatus.slice(theStatus.indexOf(',') + 1, theStatus.length);
        
        if (theStatus.indexOf(',') > 0)
        {
            theStatus = theStatus.slice(0, theStatus.indexOf(','));
        }
        
        if (statLine == '-1')
        {
            globalStatus = theStatus;
        }
        
        if (statLine == '1')
        {
            chanelStatus = theStatus;
        }
    }
    
	// getting status
	//if(!initcheck()) {	/*alert('Cannot find applet handle !');*/return false;}
	//globalStatus = (applethandle.API_GetStatus(-2)).replace(/\s+/g,'');   //	get global status

    if (isMultiLineSkin && nrOfLines > 1)
    {
        var tempStat = eventNotify.replace(/\s+/g,'');
        if (tempStat.indexOf('STATUS') >= 0)
        {
            tempStat = tempStat.substr(tempStat.indexOf(',') + 1, tempStat.length);
            
            var theLine = tempStat.substr(0, tempStat.indexOf(','));
            
            for (var i = 1; i <= nrOfLines; i++)
            {
                if (theLine == ''+i)
                {
                    if (tempStat.indexOf('Ringing') >= 0)
                    {
                        var tempCallType = tempStat.substr(tempStat.indexOf(',') + 1, tempStat.length);
                        tempCallType = tempCallType.substr(tempCallType.indexOf(',') + 1, tempCallType.length);
                        tempCallType = tempCallType.substr(tempCallType.indexOf(',') + 1, tempCallType.length);
                        tempCallType = tempCallType.substr(tempCallType.indexOf(',') + 1, tempCallType.length);
                        tempCallType = tempCallType.substr(0, tempCallType.indexOf(','));
                        
                        callType[i - 1] = tempCallType;
                    }else
                    {
                        callType[i - 1] = '';
                    }
                    
                    //document.getElementById('testtest').innerHTML += ': '+ tempStat+'<br />';
                    tempStat = tempStat.substr(tempStat.indexOf(',') + 1, tempStat.length);
                
                    if (tempStat.indexOf(',') > 0)
                    {
                        tempStat = tempStat.substr(0, tempStat.indexOf(','));
                    }
                    lineStatus[i - 1] = tempStat;
                    
                    if (tempStat == 'Ringing' || tempStat == 'InCall' || tempStat == 'Speaking' || tempStat == 'Midcall')
                    {
                        document.getElementById('btn_line_'+i+'_span').innerHTML = tempStat;
                        
                        if (i != currLine)
                        {
                            $("span#btn_line_"+i+"_span").blink();
                        }else
                        {
                            $("span#btn_line_"+i+"_span").unblink();
                        }

                    }else
                    {
                        document.getElementById('btn_line_'+i+'_span').innerHTML = 'Line ' + i;
                        $("span#btn_line_"+i+"_span").unblink();
                    }
                    
                    break;
                }
            }
            
        }
    }

	//var chanelStat = applethandle.API_GetStatus(1);	//	get line status
	//var chanelStatus = chanelStat.replace(/\s+/g,'');

    var inCallStatus = '';
    if (globalStatus.lastIndexOf("(") >= 0)
    {
        inCallStatus = globalStatus.slice(0,globalStatus.lastIndexOf("("));
        inCallStatus = inCallStatus.trim();
    }else
    {
        inCallStatus = globalStatus;
    }

	if ((globalStatus == 'Startingcall') || (inCallStatus == 'InCall'))	//	call buttons control
	{	
		checkCall = true;
		onCallInit();
		btnStatusControl('btn_call', 1, 'call');
		btnStatusControl('btn_hangup', 1, 'hangup');
		
		if (document.getElementById("btn_callhangup") != null) // WJSAPI_CallHangup() , when only one button is used for call and hangup
		{
            if (isIE())
            {
                $("div#btn_callhangup").children().css("background-color",curr_hangup_button_color);
                $("div#btn_callhangup").children().css("border-color",HoverCalc(curr_hangup_button_color, -10));
            }else
            {
                $("div#btn_callhangup").css("background-color",curr_hangup_button_color);
                $("div#btn_callhangup").css("border-color",HoverCalc(curr_hangup_button_color, -10));
            }
			//document.getElementById("btn_callhangup").style.backgroundColor = curr_hangup_button_color;
			//document.getElementById("btn_callhangup").style.borderColor = HoverCalc(curr_hangup_button_color, -10);
            if (document.getElementById("button_title") != null)    document.getElementById("button_title").innerHTML = curr_hangup_button_text;   // for click2call
		}
		callhangup_isInCall = true;
	}
	if (inCallStatus == 'Speaking')	// used when polling the status
	{
		checkCall = true;
		if (!isWebphoneToJsCalled)
		{
			if (callButtons != null)	callButtons.style.display = 'inline-block';
			if (acceptReject != null)	acceptReject.style.display = 'none';
			btnStatusControl('btn_call', 1, 'call');
			btnStatusControl('btn_hangup', 1, 'hangup');
		}
		
		if (document.getElementById("btn_callhangup") != null) // WJSAPI_CallHangup() , when only one button is used for call and hangup
		{
            if (isIE())
            {
                $("div#btn_callhangup").children().css("background-color",curr_hangup_button_color);
                $("div#btn_callhangup").children().css("border-color",HoverCalc(curr_hangup_button_color, -10));
            }else
            {
                $("div#btn_callhangup").css("background-color",curr_hangup_button_color);
                $("div#btn_callhangup").css("border-color",HoverCalc(curr_hangup_button_color, -10));
            }
			//document.getElementById("btn_callhangup").style.backgroundColor = curr_hangup_button_color;
			//document.getElementById("btn_callhangup").style.borderColor = HoverCalc(curr_hangup_button_color, -10);
            if (document.getElementById("button_title") != null)    document.getElementById("button_title").innerHTML = curr_hangup_button_text;   // for click2call
		}
		callhangup_isInCall = true;
		
		// 20140110 ochi begin
		if($("#hold_button").size() == 0){
			$("#btn_callhangup_inner").append('<input type="button" id="hold_button" name="" value="hold" />');
			$("#hold_button").css({ position:'absolute',zIndex:1 });
		}
		// 20140110 ochi end
	}
	if (globalStatus == 'CallFinished' || globalStatus == 'Call Finished')
	{
		checkCall = false;
		onCallFinished();
		btnStatusControl('btn_call', 1, 'call');
		btnStatusControl('btn_hangup', 1, 'hangup');
		timerDisplayRinging = false;
		
		if (document.getElementById("btn_callhangup") != null) // WJSAPI_CallHangup() , when only one button is used for call and hangup
		{
            if (isIE())
            {
                $("div#btn_callhangup").children().css("background-color",curr_call_button_color);
                $("div#btn_callhangup").children().css("border-color",HoverCalc(curr_call_button_color, -10));
            }else
            {
                $("div#btn_callhangup").css("background-color",curr_call_button_color);
                $("div#btn_callhangup").css("border-color",HoverCalc(curr_call_button_color, -10));
            }
			//document.getElementById("btn_callhangup").style.backgroundColor = curr_call_button_color;
			//document.getElementById("btn_callhangup").style.borderColor = HoverCalc(curr_call_button_color, -10);
            if (document.getElementById("button_title") != null)    document.getElementById("button_title").innerHTML = curr_call_button_text;   // for click2call
		}
		callhangup_isInCall = false;
		// 20140110 ochi begin
		$("#hold_button").remove();
		// 20140110 ochi end
	}
	if (globalStatus == 'Incoming...')
	{
		if (callButtons != null)	callButtons.style.display = 'none';
		if (acceptReject != null)	acceptReject.style.display = 'inline-block';
	}
	if ((inCallStatus == 'InCall') || (globalStatus == 'CallFinished') || (globalStatus == 'Call Finished'))
	{
		if (callButtons != null)	callButtons.style.display = 'inline-block';
		if (acceptReject != null)	acceptReject.style.display = 'none';
	}
	if (inCallStatus == 'Hold')
	{
		remoteHold = true;
		displayEvent('<span style="color:'+statusGreenColor+';">Call In Hold</span>');
	}
	if ((remoteHold == true) && (inCallStatus == 'Speaking'))
	{
		remoteHold = false;
		displayEvent('<span style="color:'+statusGreenColor+';">Call Reloaded</span>');
	}
	if ((inCallStatus == 'Speaking') || (chanelStatus == 'Ringing'))	//	calculating call length
	{
		if (chanelStatus == 'Ringing')
		{
			if (boolRingTimer == true)
			{
				timerDisplayRinging = true;
				clearTimeout(callLengthTimerId);
				var time = new Date();
				if (boolIncommingCall == true)
				{
					callStartTime = time.getTime();
					callStartTime = callStartTime - 2000;	//	add 2 sec to call length, when incomming call
				}else
				{
					callStartTime = time.getTime();
				}
				dispCallLength();
				boolRingTimer = false;
			}
		}
		if (inCallStatus == 'Speaking')
		{
			if (boolCallLengthTimer == true)
			{
				timerDisplayRinging = false;
				clearTimeout(callLengthTimerId);
				var time = new Date();
				if (boolIncommingCall == true)
				{
					callStartTime = time.getTime();
					callStartTime = callStartTime - 2000;	//	add 2 sec to call length, when incomming call
				}else
				{
					callStartTime = time.getTime();
				}
				dispCallLength();
				boolCallLengthTimer = false;
			}
		}
	}else
	{
		if (checkCall == false)
		{
			boolCallLengthTimer = true;
			boolRingTimer = true;
			clearTimeout(callLengthTimerId);
			var realStatus = '';
			if (globalStatus == 'RegisterFailed')
			{
				realStatus = '<span style="color:#ff0000;">'+globalStatus+'</span>';
			}else
			{
				realStatus = '<span style="color:'+statusGreenColor+';">'+globalStatus+'</span>';
			}
			displaystatus(realStatus);
		}
	}
	var inCallingField = document.getElementById('PhoneNumber');	//get and display incomming caller
	if (chanelStatus == 'Ringing')
	{
		var incomming = eventNotify.slice(eventNotify.lastIndexOf(",")+1, eventNotify.length);
		if (incomming == '2')
		{
			var inCallingNum = eventNotify.split(",", 4);inCallingNum = inCallingNum.toString();
			inCallingNum = inCallingNum.slice(inCallingNum.lastIndexOf(",")+1, inCallingNum.length);
			inCallingField.value = inCallingNum;
			redial = inCallingNum;
			boolIncommingCall = true;
			displayEvent('Incomming call from: <span style="color:'+statusGreenColor+'; font-weight:bold;">'+inCallingNum+'</span>');
		}
	}
	if (globalStatus == 'CallFinished')
	{
		if (callLengthInSec > 2)	{inCallingField.value = '';}
		boolIncommingCall = false;
	}
// 20140110 ochi begin
//	if (checkCall == true) //	display credit
//	{
//		if (checkDTMF == false)	{if (creditSpan != null)  creditSpan.innerHTML = realCredit;}
//	}
//	else
//	{
//		if (creditSpan != null)     creditSpan.innerHTML = realCredit;
//	}
// 20140110 ochi end
	var eventName = eventNotify.slice(0, eventNotify.indexOf(","));		// displaying events
	var eventType = eventNotify.split(",",2);eventType = eventType.toString();
	eventType = eventType.slice(eventType.indexOf(",")+1,eventType.length);
	var eventCredit2 = eventNotify.match('EVENT,EVENT,Credit:');
	var eventDestroy = eventNotify.match('EVENT,EVENT, destroying');
	var eventCallDuration = eventNotify.match('EVENT,EVENT,Call duration:');

	if (eventName == 'EVENT')
	{
		if (eventNotify == 'EVENT,ERROR,trial version disconnect')
		{
			trialVersionDisplay = true;
			displayEvent('<span style="color:#ff0000;font-weight:bold;">'+eventNotify.slice(eventNotify.indexOf(",")+1,eventNotify.length)+'</span>');
		}
		
		if (trialVersionDisplay) {return true;}
		
		var evnt = eventNotify.slice(eventNotify.indexOf(",")+1,eventNotify.length);evnt = evnt.toString();
		evnt = evnt.slice(evnt.indexOf(",")+1,evnt.length);	
		evnt = evnt.substr(0,1).toUpperCase() + evnt.substr(1);evnt = evnt.toString();
		if (evnt.length > 36)								{evnt = evnt.slice(0, 36)}

		if ((eventType == 'EVENT') && (eventCredit2 != 'EVENT,EVENT,Credit:') && (eventDestroy != 'EVENT,EVENT, destroying'))
		{
			displayEvent(evnt);
		}
		if (eventType == 'WARNING')		{displayEvent('<span style="color:#a30000">'+evnt+'</span>');}
		if (eventType == 'ERROR')		{displayEvent('<span style="color:#ff0000">'+evnt+'</span>');}
		
		if (eventCallDuration == 'EVENT,EVENT,Call duration:')
		{
			strTime = '';
			var tmpDuration = evnt.slice(evnt.indexOf(":")+1,evnt.length);//alert(''+tmpDuration)
            if (tmpDuration != null && tmpDuration.length > 0 && tmpDuration.indexOf('undefined') < 0)
            {
                displayEvent('<span style="color:'+statusGreenColor+';font-weight:bold;">Call duration: '+tmpDuration+'</span>');
            }
		}
		
		// VOICEMAIL
		var eventVoicem = eventNotify.slice(eventNotify.indexOf(",")+1,eventNotify.length);eventVoicem = eventVoicem.toString();
		if (eventVoicem.indexOf('MWI') >= 0)
		{
			var areMessages = eventVoicem.slice(eventVoicem.indexOf(',')+1,eventVoicem.length);areMessages = areMessages.toString();
			areMessages = areMessages.slice(0,areMessages.indexOf(','));areMessages = areMessages.toString();
			
			if (areMessages == 'yes')
			{
				voicemailNr = eventVoicem.slice(eventVoicem.indexOf('MWI,yes')+8,eventVoicem.length);voicemailNr = voicemailNr.toString();
				voicemailNr = voicemailNr.slice(0,voicemailNr.indexOf(','));voicemailNr = voicemailNr.toString();
				
				ChangeHoldToVoicemail(true);
			}
		}
	}
	
	if (globalStatus == 'CallFinished' && strTime != '' && trialVersionDisplay == false)
	{
        var dispEvent = document.getElementById('displayEvent');
        if (dispEvent != null && ((dispEvent.innerHTML).trim()).length <= 0)
        {
            var durTemp = strTime;
            if (durTemp.indexOf('(Ringing)') >= 0)  durTemp = durTemp.substring(0, durTemp.indexOf('(Ringing)'));
            displayEvent('<span style="color:'+statusGreenColor+'">Call duration: '+durTemp+'</span>');
        }
	}
	
	if (voicemailNr.length > 0 && checkCall == false)
	{
		if (!isFullyCustomized)
		{
			ChangeHoldToVoicemail(true);
		}
	}else
	{
		if (!isFullyCustomized)
		{
			ChangeHoldToVoicemail(false);
		}
	}
	//var testtest = document.getElementById('testtest');		testtest.innerHTML += eventNotify+'<br />';
    return true;
}
function ChangeHoldToVoicemail(change)
{
	if (document.getElementById("btn_chat") == null) {return;}
    
    var imgPath = document.getElementById("btn_chat").getAttribute('src');
    
    if (imgPath == null)    return;
    
    imgPath = imgPath.substr(0, imgPath.lastIndexOf('/') + 1);
    
	if (change)
	{
		if (isIphoneSkin)
		{
			document.getElementById('btn_hold').setAttribute('src',imgPath + 'btn_voicemail.jpg');
			document.getElementById('btn_hold').title = 'Voicemail';
		}else
		{
			document.getElementById('btn_hold').title = 'Voicemail';
			document.getElementById('btn_hold_img').setAttribute('src',imgPath + 'voicemail.png');
			document.getElementById('btn_hold_span').innerHTML = 'Voicemail';
		}
	}else
	{
		if (isIphoneSkin)
		{
			document.getElementById('btn_hold').setAttribute('src',imgPath + 'btn_hold.jpg');
			document.getElementById('btn_hold').title = 'Call Hold';
		}else
		{
			document.getElementById('btn_hold').title = 'Call Hold';
			document.getElementById('btn_hold_img').setAttribute('src',imgPath + 'hold.png');
			document.getElementById('btn_hold_span').innerHTML = 'Hold';
		}
	}
}
function displaystatus(statustr)	//	display status massages
{
// 20140110 ochi begin
	if (webphoneStatus == null)
	{
		try{webphoneStatus =  document.getElementById('status');} catch (e) { }    
	}
	try{webphoneStatus.innerHTML = statustr;} catch (e) { }
// 20140110 ochi end
}
function displayEvent(evStr)	//	display event massages
{
	var displayEvent = document.getElementById('displayEvent');
	if (displayEvent != null)   displayEvent.innerHTML = evStr;
	clearTimeout (eventAlertTimerId);
	eventAlertTimerId = setTimeout ( "hideEvent()", eventDisplayTime);
}
function hideEvent()	//	hide event massages
{
	var displayEvent = document.getElementById('displayEvent');
	if (displayEvent != null)   displayEvent.innerHTML = '';
	trialVersionDisplay = false;
}
function dispCallLength()	//	display call length
{
	try
	{
		var currTime = new Date();
		currentTime = currTime.getTime();
		var callLengthSec = parseInt((currentTime - callStartTime)/1000);callLengthInSec = callLengthSec;
		var Sec = callLengthSec % 60;
		var callLengthMin = parseInt(callLengthSec / 60);
		var Min = callLengthMin % 60;
		var Hour = parseInt(callLengthMin / 60);
	} catch (e) { }
	
	strTime = '<span style="font-size:11px;font-weight:bold;">';
	if (Hour > 0)	{strTime += Hour+':';}strTime += Min+':';
	if (Sec < 10)	{strTime += '0';}strTime += Sec;
	if (Min < 0)	{Hour--;Min += 60;}
	if (hold == true)	{strTime += ' (In Hold)';}
	if (timerDisplayRinging == true)	{strTime += ' (Ringing)';}
	strTime += '</span>';
    if (timerDisplayRinging == true)
    {
        displaystatus('<span style="color: #444444">' + strTime + '</span>');
    }else
    {
        displaystatus(strTime);
    }
	callLengthTimerId = setTimeout ( "dispCallLength()", 500);
}
function initcheck()	// getting applet handle
{
	if (applethandle == null) 
	{
		displaystatus('webphone initializing');

		try{applethandle =  document.getElementById('webphone');} catch (e) { }  
			
		if(applethandle == null)
		{
		  var applets = null;            
		  try{
		  applets = document.applets; 

		  // Needed for FireFox
		  if (applets.length == 0) {
			  applets = document.getElementsByTagName("object");
		  }
		  if (applets.length == 0) {
			  applets = document.getElementsByTagName("applet");
		  }

		  //Find the active applet object
		  for (var i = 0; i < applets.length; ++i) {
			  try {
				if (typeof (applets[i].API_Call) != "undefined") {
					applethandle = applets[i];
					break;
				 }
			  } catch (e) { }
		  }
		  } catch (e) { }  
	 
		  if (applethandle == null) try{applethandle = document.applets[0];} catch (e) { }  

		  if (applethandle == null) {
			  displaystatus('3Cannot find the webphone applet!'); 
		  }
		}

		if (applethandle != null) 
		{              
		  // See if we're using the old Java Plug-In and the JNLPAppletLauncher
		  try {
			var newapplethandle = applethandle.getSubApplet();
			 if( newapplethandle != null) applethandle  = newapplethandle;
		  } catch (e) {
			  // Using new-style applet -- ignore
		  }
		}
	}
	try{
		var strApplethandle = applethandle.toString();
		} catch (e) {  }

	if ((strApplethandle == null) || (strApplethandle == ''))	
	{return false;}else{return true;}
}

function Encrypt(str, key)
{
    if(key == null || key.length <= 0)
    {
        alert("Please enter a key with which to encrypt the message.");
        return null;
    }
    
    var prand = "";
    for(var i=0; i<key.length; i++)
    {
        prand += key.charCodeAt(i).toString();
    }
    
    var sPos = Math.floor(prand.length / 5);
    var mult = parseInt(prand.charAt(sPos) + prand.charAt(sPos*2) + prand.charAt(sPos*3) + prand.charAt(sPos*4) + prand.charAt(sPos*5));
    var incr = Math.ceil(key.length / 2);
    var modu = Math.pow(2, 31) - 1;
    
    if(mult < 2)
    {
        alert("Algorithm cannot find a suitable hash. Please choose a different key. \nPossible considerations are to choose a more complex or longer key.");
        return null;
    }
    var salt = Math.round(Math.random() * 1000000000) % 100000000;
    prand += salt;
    
    while(prand.length > 10)
    {
        prand = (parseInt(prand.substring(0, 10)) + parseInt(prand.substring(10, prand.length))).toString();
    }
    
    prand = (mult * prand + incr) % modu;
    var enc_chr = "";
    var enc_str = "";
    
    for(var i=0; i<str.length; i++)
    {
        enc_chr = parseInt(str.charCodeAt(i) ^ Math.floor((prand / modu) * 255));
        if(enc_chr < 16)
        {
            enc_str += "0" + enc_chr.toString(16);
        }else
        {
            enc_str += enc_chr.toString(16);   
        }
    
        prand = (mult * prand + incr) % modu;
    }
    
    salt = salt.toString(16);
    while(salt.length < 8)salt = "0" + salt;
    enc_str += salt;
    return enc_str;
}

function Decrypt(str, key, name)
{
    if(str == null || str.length < 8)
    {
        //alert("A salt value could not be extracted from the encrypted message because it's length is too short. The message cannot be decrypted.");
        eraseCookie(name);
        return;
    }
    
    if(key == null || key.length <= 0)
    {
        alert("Please enter a key with which to decrypt the message.");
        return;
    }
    var prand = "";

    for(var i=0; i<key.length; i++)
    {
        prand += key.charCodeAt(i).toString();
    }
    
    var sPos = Math.floor(prand.length / 5);
    var mult = parseInt(prand.charAt(sPos) + prand.charAt(sPos*2) + prand.charAt(sPos*3) + prand.charAt(sPos*4) + prand.charAt(sPos*5));
    var incr = Math.round(key.length / 2);
    var modu = Math.pow(2, 31) - 1;
    var salt = parseInt(str.substring(str.length - 8, str.length), 16);
    str = str.substring(0, str.length - 8);
    prand += salt;
    
    while(prand.length > 10)
    {
        prand = (parseInt(prand.substring(0, 10)) + parseInt(prand.substring(10, prand.length))).toString();
    }
    
    prand = (mult * prand + incr) % modu;
    var enc_chr = "";
    var enc_str = "";
    
    for(var i=0; i<str.length; i+=2)
    {
        enc_chr = parseInt(parseInt(str.substring(i, i+2), 16) ^ Math.floor((prand / modu) * 255));
        enc_str += String.fromCharCode(enc_chr);
        prand = (mult * prand + incr) % modu;
    }
    return enc_str;
}

function createCookie(name,value,days)	//	create coockies
{
	try{
        value = Encrypt(value, 'ad5b6u8s');
		if (days)
		{
			var date = new Date();
			date.setTime(date.getTime()+(days*24*60*60*1000));
			var expires = "; expires="+date.toGMTString();
		}
		else var expires = "";
		document.cookie = name+"="+value+expires+"; path=/";
	} catch (e) { }
}

function readCookie(name)	//	read coockies
{
	try
	{
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for(var i=0;i < ca.length;i++)
        {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1,c.length);
			if (c.indexOf(nameEQ) == 0)
            {
                var value = c.substring(nameEQ.length,c.length);
                value = Decrypt(value, 'ad5b6u8s', name);
                return value;
            }
		}
		return null;
	} catch (e) { }
}

function eraseCookie(name)	//	delete coockies
{
	createCookie(name,"",-1);
}
function WJSAPI_LoadApplet()
{
	var appletString = function ()
	{
		var attr = [];
		var param = [];
		var a;
		
		for (a in attributes)
		{
			if (attributes.hasOwnProperty(a))
			{
				attr.push(a + "=\"" + attributes[a] + "\"");
			}
		}

		for (a in parameters)
		{
            /*if (isClick2Call && a == 'username')
            {
                tempUser = parameters[a];
            }*/
			param.push("<param name='" + a + "' value='" + parameters[a] + "'/>");
		}

		var out = "<applet " + attr.join(" ") + ">" + param.join("") + "</applet>";
		return out;
	};
	
	var sp = $("<div/>");
	sp.html(appletString());
	try{
		$("body").append(sp);
	}catch (e) {console.error(e);alert("Can't start applet: "+e);}

	isAppletLoaded = true;
}

function WJSAPI_LoadAppletAndRegisterParam(userLocal, pswLocal)
{
	try{
	if (userLocal != null && userLocal.length > 0 && pswLocal != null && pswLocal.length > 0)
	{
		userWJSAPI = userLocal;
		passwordWJSAPI = pswLocal;
	}
	WJSAPI_LoadAppletAndRegister();

	}catch (e) {WJSAPI_LoadAppletAndRegister();}
}

function WJSAPI_LoadAppletAndRegister()
{
	if(!isAppletLoaded) WJSAPI_LoadApplet();
	onLogin();
	//if(!initcheck()) {alert('Cannot find applet handle !');return false;}
	//applethandle.API_ServerInit(""+serverAddress+"");
	//setTimeout("voipDelayedRegister()",400);
    waitForWebphone();
    return true;
}

function WJSAPI_Register(userLocal, pswLocal) // in case you don't want to use WJSAPI_LoadAppletAndRegister
{
	onLogin();
	//if(!initcheck()) {alert('Cannot find applet handle !');return false;}
	
	if (userLocal != null && userLocal.length > 0 && pswLocal != null && pswLocal.length > 0)
	{
		userWJSAPI = userLocal;
		passwordWJSAPI = pswLocal;
	}else
	{
		return false;
	}
	
	//applethandle.API_ServerInit(""+serverAddress+"");
	//setTimeout("voipDelayedRegister()",400);
    waitForWebphone();
    return true;
}

function waitForWebphone()	//	delaying register, when login page not used  !!! DEPRECATED
{
	waitForWebphoneCount++;
	if ((appletLoadedBool == false) && (waitForWebphoneCount < 50))
	{
		appletLoadedBool = initcheck();
		setTimeout ( "waitForWebphone()", 100);
	}else
	{
		voipDelayedRegister();
	}
}

function voipDelayedRegister()	//	making delay for API_ServerInit()
{
	if(!initcheck()) {alert('Cannot find applet handle !');return false;}
	
	var userLocal = '';
	var pswLocal = '';
    var saveSettings = document.getElementById('savesettings');
	
	if (userWJSAPI != null && userWJSAPI.length > 0 && passwordWJSAPI != null && passwordWJSAPI.length > 0)
	{
		userLocal = userWJSAPI;
		pswLocal = passwordWJSAPI;
	}else
	{
        var licKey = document.getElementById('license_key_input');
        var srvAddr = document.getElementById('server_address_input');
        
        if (licKey != null)
        {
            var isLicenseOk = false;
            
            if (licKey.value == "")
            {
                try{document.getElementById('login_page_error_messages').innerHTML = 'Invalid license key';} catch (e) {}
                licKey.focus();
                return (false);
            }else
            {
                isLicenseOk = applethandle.API_SetKey(licKey.value);
                
                if (saveSettings != null && saveSettings.checked == true)
                {
                    createCookie('MZwebPhoneLicKey',""+licKey.value+"",""+cookieExpire+"");
                }else
                {
                    eraseCookie('MZwebPhoneLicKey');
                }
            }
            
            if (!isLicenseOk)
            {
                try{document.getElementById('login_page_error_messages').innerHTML = 'Invalid license key';} catch (e) {}
                return (false);
            }
        }
        
        // set api_key for webphone service
        if (api_key != null && api_key.length > 0)
        {
            applethandle.API_SetKey(api_key);
        }
        
        if (srvAddr != null)
        {
            if (srvAddr.value == "")
            {
                try{document.getElementById('login_page_error_messages').innerHTML = 'Invalid server address';} catch (e) {}
                srvAddr.focus();
                return (false);
            }else
            {
                serverAddress = srvAddr.value;
                
                if (saveSettings != null && saveSettings.checked == true)
                {
                    createCookie('MZwebPhoneSrvAddr',""+srvAddr.value+"",""+cookieExpire+"");
                }else
                {
                    eraseCookie('MZwebPhoneSrvAddr');
                }
            }
        }
        
        if (!isClick2Call)
        {
            var usernameFiled = document.getElementById('username_input');
            var passwordField = document.getElementById('password_input');

            if (usernameFiled.value == "")
            {
                try{document.getElementById('login_page_error_messages').innerHTML = 'Invalid username';} catch (e) {}
                usernameFiled.focus();
                return (false);
            }
            if (passwordField.value == "")
            {
                try{document.getElementById('login_page_error_messages').innerHTML = 'Invalid password';} catch (e) {}
                passwordField.focus();
                return (false);
            }

            userLocal = usernameFiled.value;
            pswLocal = passwordField.value;
        }
	}
	
    if (!isClick2Call)
    {
        if (saveSettings != null && saveSettings.checked == true)
        {
            createCookie('MZwebPhoneUsr',""+usernameFiled.value+"",""+cookieExpire+"");
            createCookie('MZwebPhonePassw',""+passwordField.value+"",""+cookieExpire+"");
        }else
        {
            eraseCookie('MZwebPhoneUsr');
            eraseCookie('MZwebPhonePassw');
        }

        if ((userLocal != tempUser) || (pswLocal != tempPassw))	{realCredit = '';}
        tempUser = userLocal;tempPassw = pswLocal;

        pages(2);

        isRegistered = applethandle.API_Register(""+serverAddress+"", ""+userLocal+"", ""+pswLocal+"");
    }else
    {               // used for click to call
        tempUser = username;
        pswLocal = '';
        
        if (voipServerAddress != null && voipServerAddress.length > 0)  {serverAddress = voipServerAddress;}
        
        if (realm.length <= 0 && serverAddress.length > 0)  {realm = serverAddress;}

        if (md5 != null && md5.lenngth > 2)
        {
            isRegistered = applethandle.API_SetCredentialsMD5(""+serverAddress+"", ""+username+"", ""+md5+"", ""+realm+"");
        }else
        {
            isRegistered = applethandle.API_SetCredentials(""+serverAddress+"", ""+username+"", ""+password+"", ""+username+"", ""+username+"");
        }
        
        if (curr_register)
        {
            isRegistered = applethandle.API_Register(""+serverAddress+"", ""+username+"", ""+password+"", "", "");
        }
    }

    if (isMultiLineSkin && nrOfLines > 1)
    {
        //WJSAPI_ChangeLine(currLine);
        applethandle.API_SetLine(currLine);
        isGetLine = true;
        setTimeout("StartGettingLine()",400);
    }
    
	return (true);
}
function voipStatusRegister()	//	register if double click on status and not in call
{
	if ((checkCall == false) && (tempUser != '') && (tempUser != null) && (tempPassw != '') && (tempPassw != null))
	{
		onLogin();
		pages(2);
		if(!initcheck()) {alert('Cannot find applet handle !');return false;}
		applethandle.API_Register(""+serverAddress+"", ""+tempUser+"", ""+tempPassw+"");
        
        if (isMultiLineSkin && nrOfLines > 1)
        {
            //WJSAPI_ChangeLine(currLine);
            applethandle.API_SetLine(currLine);
            isGetLine = true;
            setTimeout("StartGettingLine()",400);
        }
	}
    return true;
}
function reRegister()	//	calls API_Register() every "reRegisterTime" miliseconds
{
	if ((boolReRegister != null) && (currentPage == 2))
	{
		if ((checkCall == false) && (tempUser != '') && (tempUser != null) && (tempPassw != '') && (tempPassw != null))
		{
			if(!initcheck()) {alert('Cannot find applet handle !');return false;}
			applethandle.API_Register(""+serverAddress+"", ""+tempUser+"", ""+tempPassw+"");
		}
	}
	boolReRegister = setTimeout ( "reRegister()", reRegisterTime );
    return true;
}
function WJSAPI_Unregister()
{
	if(!initcheck()) {alert('Cannot find applet handle !');return false;}
	applethandle.API_Unregister();
	pages(1);
    isGetLine = false;
    
    return true;
}

function WJSAPI_Call()
{
	if(!initcheck()) {alert('Cannot find applet handle !');return false;}
	var boolCall = false;
	var calledNumber = document.getElementById('PhoneNumber');
	if (calledNumber.value != '' && calledNumber.value != phoneNumberFieldValue)
	{
        displayEvent('<span style="color:'+statusGreenColor+';">Starting...</span>');
		boolCall = applethandle.API_Call(currLine, ""+calledNumber.value+"");
		redial = calledNumber.value;
	}
	if (boolCall == false)
	{
		displayEvent('<span style="color:#'+statusGreenColor+';">Enter destination first.</span>');
	}
    return true;
}
function WJSAPI_CallContact(numberLocal)
{
	document.getElementById('PhoneNumber').value = numberLocal;
	WJSAPI_Call();
}

function WJSAPI_CallHangup()
{
	if(!initcheck()) {alert('Cannot find applet handle !');return false;}
	
	if (checkCall)
	{
		WJSAPI_Hangup();
		callhangup_isInCall = false;
	}else
	{
        displayEvent('<span style="color:#26b14a;">Starting...</span>');
		var boolCall = false;
		var calledNumber = document.getElementById('PhoneNumber');
		if (calledNumber.value != '' && calledNumber.value != phoneNumberFieldValue)
		{
			boolCall = applethandle.API_Call(currLine, ""+calledNumber.value+"");
			redial = calledNumber.value;
		}
		if (boolCall == false)
		{
			displayEvent('<span style="color:#ff0000;">Enter destination first.</span>');
		}else
		{
			callhangup_isInCall = true;
		}
	}
	
	if (document.getElementById("btn_callhangup") != null)
	{
		if (callhangup_isInCall)
		{
            if (isIE())
            {
                $("div#btn_callhangup").children().css("background-color",curr_hangup_button_color);
                $("div#btn_callhangup").children().css("border-color",HoverCalc(curr_hangup_button_color, -10));
            }else
            {
                $("div#btn_callhangup").css("background-color",curr_hangup_button_color);
                $("div#btn_callhangup").css("border-color",HoverCalc(curr_hangup_button_color, -10));
            }
			//document.getElementById("btn_callhangup").style.backgroundColor = curr_hangup_button_color;
			//document.getElementById("btn_callhangup").style.borderColor = HoverCalc(curr_hangup_button_color, -10);
		}else
		{
            if (isIE())
            {
                $("div#btn_callhangup").children().css("background-color",curr_call_button_color);
                $("div#btn_callhangup").children().css("border-color",HoverCalc(curr_call_button_color, -10));
            }else
            {
                $("div#btn_callhangup").css("background-color",curr_call_button_color);
                $("div#btn_callhangup").css("border-color",HoverCalc(curr_call_button_color, -10));
            }
			//document.getElementById("btn_callhangup").style.backgroundColor = curr_call_button_color;
			//document.getElementById("btn_callhangup").style.borderColor = HoverCalc(curr_call_button_color, -10);
		}
	}
    return true;
}

function WJSAPI_RegisterCallHangup() // used for click to call
{
    var wasAppletLoadind = false;
    if (!isRegistered)
    {
        WJSAPI_LoadAppletAndRegister();
        wasAppletLoadind = true;
    }
    
    if(!initcheck()) {alert('Cannot find applet handle !');return false;}
    
	if (checkCall)
	{
		WJSAPI_Hangup();
		callhangup_isInCall = false;
	}else
	{
        if (wasAppletLoadind)
        {
            setTimeout("ClickToCallDelayd()", 600);
        }else
        {
            ClickToCallDelayd();
        }
	}
	
	if (document.getElementById("btn_callhangup") != null)
	{
		if (callhangup_isInCall)
		{
            if (isIE())
            {
                $("div#btn_callhangup").children().css("background-color",curr_hangup_button_color);
                $("div#btn_callhangup").children().css("border-color",HoverCalc(curr_hangup_button_color, -10));
            }else
            {
                $("div#btn_callhangup").css("background-color",curr_hangup_button_color);
                $("div#btn_callhangup").css("border-color",HoverCalc(curr_hangup_button_color, -10));
            }
		}else
		{
            if (isIE())
            {
                $("div#btn_callhangup").children().css("background-color",curr_call_button_color);
                $("div#btn_callhangup").children().css("border-color",HoverCalc(curr_call_button_color, -10));
            }else
            {
                $("div#btn_callhangup").css("background-color",curr_call_button_color);
                $("div#btn_callhangup").css("border-color",HoverCalc(curr_call_button_color, -10));
            }            
		}
	}
    return true;
}

function ClickToCallDelayd()
{
    var boolCall = false;
    if (destination_number != null && destination_number.length > 1)
    {
        boolCall = applethandle.API_Call(currLine, ""+destination_number+"");
        redial = destination_number;
    }
    
    if (boolCall == false)
    {
        displayEvent('<span style="color:#ff0000;">Destination number is not defined.</span>');
    }else
    {
        callhangup_isInCall = true;
    }
}

function WJSAPI_Hangup()
{
	if(!initcheck()) {alert('Cannot find applet handle !');return false;}
	var boolHangup = false;
	boolHangup = applethandle.API_Hangup(currLine);
	if (document.getElementById('dtmf') != null)    document.getElementById('dtmf').innerHTML = '';
	checkDTMF = false;
	
	boolIncommingCall = false;
    return true;
}
function WJSAPI_Accept()
{
	if(!initcheck()) {alert('Cannot find applet handle !');return false;}
	var boolAccept = false;
	boolAccept = applethandle.API_Accept(currLine);
	if (boolAccept == false)
	{
		displayEvent('<span style="color:#ff0000;">Accept Failed</span>');
	}
    return true;
}
function WJSAPI_Reject()
{
	if(!initcheck()) {alert('Cannot find applet handle !');return false;}
	var boolReject = false;
	boolReject = applethandle.API_Reject(currLine);
    return true;
}
function WJSAPI_HoldOrVoicemail()
{
	if (voicemailNr.length > 0 && checkCall == false)
	{
		WJSAPI_Voicemail();
	}else
	{
		WJSAPI_Hold();
	}
}
function WJSAPI_Hold()
{
	if(!initcheck()) {alert('Cannot find applet handle !');return false;}
	var holdValue = !hold;
	var boolHold = applethandle.API_Hold(currLine,holdValue);

	if (boolHold == true)
 	{
		hold = !hold;
		if (hold == true)
  		{
			displayEvent('<span style="color:'+statusGreenColor+';">Call In Hold</span>');
		}else
		{
			displayEvent('<span style="color:'+statusGreenColor+';">Call Reloaded</span>');
		}
	}else 
	{
		if(checkCall == true)
		{
			displayEvent('<span style="color:#ff0000;">Hold failed</span>');
 		}else
		{
			displayEvent('<span style="color:#ff0000;">No call in progress</span>');
		}
	}
    return true;
}
function WJSAPI_Voicemail()
{
	if(!initcheck()) {alert('Cannot find applet handle !');return false;}
	applethandle.API_Call(-1, ""+voicemailNr+"");
    return true;
}
function voipRedial()
{
    var boolRedial = false; 
	if (checkCall == false)
	{
		if(!initcheck()) {alert('Cannot find applet handle !');return false;}
		if (redial != '')
		{
			boolRedial = applethandle.API_Call(-1, ""+redial+"");
			document.getElementById('PhoneNumber').value = redial;
		}
	}
	if (boolRedial == false)
	{
		displayEvent('<span style="color:#ff0000;">No previous call found</span>');
	}
    return true;
}
function WJSAPI_Conference()
{
	if(!initcheck()) {alert('Cannot find applet handle !');return false;}
    
    applethandle.API_SetLine(currLine);
	applethandle.API_Conf("");
    return true;
}
function WJSAPI_CallTransfer()
{
	if(!initcheck()) {alert('Cannot find applet handle !');return false;}    
	var boolTransfer = false;
    
    applethandle.API_SetLine(currLine);
	boolTransfer = applethandle.API_TransferDialog();
	if (boolTransfer == false)
	{
    	if(checkCall == true)
		{
		   displayEvent('<span style="color:#ff0000;">Transfer failed</span>');
        }  
		else
		{
		    displayEvent('<span style="color:#ff0000;">No call in progress</span>');
		}
	}
    return true;
}
function WJSAPI_Chat()
{
	var chatNumber = document.getElementById('PhoneNumber');
	var chatId = '';
	if ((chatNumber.value != '') && (chatNumber.value != null))	{chatId = chatNumber.value;}
	if(!initcheck()) {alert('Cannot find applet handle !');return false;}
	applethandle.API_Chat(chatId);
    return true;
}
function WJSAPI_AudioDevice()
{
	if(!initcheck()) {alert('Cannot find applet handle !');return false;}
	applethandle.API_AudioDevice();
    return true;
}
function WJSAPI_Mute()
{
	if(!initcheck()) {alert('Cannot find applet handle !');return false;}
	var muteValue = !mute;
	var boolMute = applethandle.API_MuteEx(currLine, mute, 0);

	if (boolMute == true)
 	{
		mute = !mute;
		if (mute == true)
  		{
			displayEvent('<span style="color:'+statusGreenColor+';">Muted</span>');
		}else
		{
			displayEvent('<span style="color:'+statusGreenColor+';">Unmuted</span>');
		}
	}else 
	{
		if(checkCall == true)
		{
			displayEvent('<span style="color:#ff0000;">Mute failed</span>');
 		}else
		{
			displayEvent('<span style="color:#ff0000;">No call in progress</span>');
		}
	}
    return true;
}
function WJSAPI_Redial()
{
	if(checkCall == true)
	{
		displayEvent('<span style="color:#ff0000;">Call in progress</span>');
	}else
	{
		if (redial != null && redial.length > 0)
		{
			document.getElementById('PhoneNumber').value = redial;
			WJSAPI_Call();
		}else
		{
			displayEvent('<span style="color:#ff0000;">No number to redial</span>');
		}
	}
}
function WJSAPI_ChangeLine(ln)
{
    if(!initcheck()) {alert('Cannot find applet handle !');return false;}
    var isLineSet = applethandle.API_SetLine(ln);
    
    if (isLineSet)
    {
        currLine = ln;

        for (var i = 1; i <= nrOfLines; i++)
        {
            if (isIE())
            {
                if (i == ln)
                {
                    $("div#btn_line_"+i).children().css("background-color",curr_call_button_color);
                    $("div#btn_line_"+i).children().css("border-color",HoverCalc(curr_call_button_color, -10));
                    $("div#btn_line_"+i).children().css("font-weight","bold");
                }else
                {
                    $("div#btn_line_"+i).children().css("background-color",curr_button_color);
                    $("div#btn_line_"+i).children().css("border-color",curr_button_border_color);
                    $("div#btn_line_"+i).children().css("font-weight","normal");
                }
            }else
            {
                if (i == ln)
                {
                    $("div#btn_line_"+i).css("background-color",curr_call_button_color);
                    $("div#btn_line_"+i).css("border-color",HoverCalc(curr_call_button_color, -10));
                    $("div#btn_line_"+i).css("font-weight","bold");
                }else
                {
                    $("div#btn_line_"+i).css("background-color",curr_button_color);
                    $("div#btn_line_"+i).css("border-color",curr_button_border_color);
                    $("div#btn_line_"+i).css("font-weight","normal");
                }
            }
            
            if (i == currLine)
            {
                $("span#btn_line_"+i+"_span").unblink();
            }
        }
        
        if (lineStatus[currLine - 1] == 'Ringing' && callType[currLine - 1].length > 0 && callType[currLine - 1] == '2')
        {
            document.getElementById('callbuttons').style.display = 'none';
            document.getElementById('acceptreject').style.display = 'inline-block';
        }else
        {
            document.getElementById('callbuttons').style.display = 'inline-block';
            document.getElementById('acceptreject').style.display = 'none';
        }
    }else
    {
        displayEvent('<span style="color:#ff0000;">Line could not be set !</span>');
        return false;
    }
    return true;
}

function StartGettingLine()
{
    if (isGetLine)
    {
        if(!initcheck()) {alert('Cannot find applet handle !');return false;}
        var recievedLine = applethandle.API_GetLine();
        
        if (recievedLine > 0 && currLine != recievedLine)
        {
            WJSAPI_ChangeLine(recievedLine);
        }
    }
    clearTimeout(getLineTimerId);
    getLineTimerId = setTimeout ( "StartGettingLine()", 2000 );
    return true;
}

// blink and unblink text for Multiline skin
(function($)
{
    $.fn.blink = function(options)
    {
        var defaults = {delay:500};
        var options = $.extend(defaults, options);

        return this.each(function()
        {
            var obj = $(this);
            if (obj.attr("timerid") > 0) return;
            var timerid=setInterval(function()
            {
                if($(obj).css("visibility") == "visible")
                {
                    $(obj).css('visibility','hidden');
                }
                else
                {
                    $(obj).css('visibility','visible');
                }
            }, options.delay);
            obj.attr("timerid", timerid);
        });
    }
    $.fn.unblink = function(options) 
    {
        var defaults = {visible:true};
        var options = $.extend(defaults, options);

        return this.each(function() 
        {
            var obj = $(this);
            if (obj.attr("timerid") > 0) 
            {
                clearInterval(obj.attr("timerid"));
                obj.attr("timerid", 0);
                obj.css('visibility', options.visible?'visible':'hidden');
            }
        });
    }
}(jQuery))
