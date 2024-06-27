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

var wp_layout = function ( )
{
// private members and methods

//default layout values
var def_background_color = '#94c23f';
var def_background_border_color = ''; //wp_layout.wp_layout.HoverCalc(def_background_color, -10);
var def_general_text_color = '#444444';
var def_button_color = '#01afd4';
var def_button_border_color = ''; //wp_layout.wp_layout.HoverCalc(def_button_color, -10);
var def_button_text_color = "#ffffff";
var def_webphone_width = 100;
var def_webphone_height = 65;
var def_call_button_color = '#00ff00';
var def_hangup_button_color = '#ff0000';
var def_brandname = 'Mizutech';
var def_company_webpage = 'http://www.mizu-voip.com';
var def_button_width = 100;
var def_status_text_color = '#333333';
var def_call_button_text = 'Call';      // text showed on call button (click to call)
var def_hangup_button_text = 'Hangup';  // text showed on hangup button (click to call)

function SetBgColor()
{
	try{
	try{
		if (wp_api.general_text_color != null && wp_api.general_text_color.length > 2)
		{
			curr_general_text_color = wp_api.general_text_color;
		}else
		{
			curr_general_text_color = def_general_text_color;
		}
	}catch (e) {curr_general_text_color = def_general_text_color;}


	try{
		if (wp_api.background_color != null && wp_api.background_color.length > 2)
		{
			curr_background_color = wp_api.background_color;
		}else
		{
			curr_background_color = def_background_color;
		}
	}catch (e) {curr_background_color = def_background_color;}

	curr_background_border_color = wp_layout.HoverCalc(curr_background_color, -10);


	try{
		if (wp_api.button_color != null && wp_api.button_color.length > 2)
		{
			curr_button_color = wp_api.button_color;
		}else
		{
			curr_button_color = def_button_color;
		}
	}catch (e) {curr_button_color = def_button_color;}

	curr_button_border_color = wp_layout.HoverCalc(curr_button_color, -10);


	try{
		if (wp_api.button_text_color != null && wp_api.button_text_color.length > 2)
		{
			curr_button_text_color = wp_api.button_text_color;
		}else
		{
			curr_button_text_color = def_button_text_color;
		}
	}catch (e) {curr_button_text_color = def_button_text_color;}

	try{
		if (wp_api.webphone_width != null && wp_api.webphone_width > 0 && !isNaN(wp_api.webphone_width))
		{
			curr_webphone_width = wp_api.webphone_width;
		}else
		{
			curr_webphone_width = def_webphone_width;
		}
	}catch (e) {curr_webphone_width = def_webphone_width;}

	try{
		if (wp_api.webphone_height != null && wp_api.webphone_height > 0 && !isNaN(wp_api.webphone_height))
		{
			curr_webphone_height = wp_api.webphone_height;
		}else
		{
			curr_webphone_height = def_webphone_height;
		}
	}catch (e) {curr_webphone_height = def_webphone_height;}

	try{
		if (wp_api.call_button_color != null && wp_api.call_button_color.length > 2)
		{
			wp_layout.curr_call_button_color = wp_api.call_button_color;
		}else
		{
			wp_layout.curr_call_button_color = def_call_button_color;
		}
	}catch (e) {wp_layout.curr_call_button_color = def_call_button_color;}

	try{
		if (wp_api.hangup_button_color != null && wp_api.hangup_button_color.length > 2)
		{
			curr_hangup_button_color = wp_api.hangup_button_color;
		}else
		{
			curr_hangup_button_color = def_hangup_button_color;
		}
	}catch (e) {curr_hangup_button_color = def_hangup_button_color;}

	try{
		if (wp_api.status_text_color == null && wp_api.status_text_color.length < 2)
		{
			wp_api.status_text_color = def_status_text_color;
		}
	}catch (e) {wp_api.status_text_color = def_status_text_color;}

	try{
		if (wp_api.brandname != null && wp_api.brandname.length > 1)
		{
			curr_brandname = wp_api.brandname;
		}else
		{
			curr_brandname = def_brandname;
		}
	}catch (e) {curr_brandname = def_brandname;}

	try{
		if (wp_api.company_webpage != null && wp_api.company_webpage.length > 2)
		{
			curr_company_webpage = wp_api.company_webpage;
		}else
		{
			curr_company_webpage = def_company_webpage;
		}
	}catch (e) {curr_company_webpage = def_company_webpage;}

    try{
		if (wp_api.button_width != null && wp_api.button_width > 0 && !isNaN(wp_api.button_width))
		{
			curr_button_width = wp_api.button_width;
		}else
		{
			curr_button_width = def_button_width;
		}
	}catch (e) {curr_button_width = def_button_width;}

    if (wp_api.isClick2Call)
    {
        try{
        if (wp_api.call_button_text != null)   curr_call_button_text = wp_api.call_button_text;   else    curr_call_button_text = def_call_button_text;
        }catch (e) {curr_call_button_text = def_call_button_text;}

        try{
        if (wp_api.hangup_button_text != null)   curr_hangup_button_text = wp_api.hangup_button_text;   else    curr_hangup_button_text = def_hangup_button_text;
        }catch (e) {curr_hangup_button_text = def_hangup_button_text;}
    }


	var loginTextBoxBorderColor = wp_layout.HoverCalc(curr_background_color, -20);
	loginTextBoxBorderColor = wp_layout.HoverCalc(loginTextBoxBorderColor, -20);
	loginTextBoxBorderColor = wp_layout.HoverCalc(loginTextBoxBorderColor, -20);

    if (document.getElementById("webphone_bg_container") != null)
    {
        var widthHeightPlus = 0;
        if (isIE()) {widthHeightPlus = 4;}

        var widthTmp = curr_webphone_width + widthHeightPlus;
        var heightTmp = curr_webphone_height + widthHeightPlus

        // takeda 削った
        //document.getElementById("webphone_bg_container").style.width = widthTmp + 'px';
        //document.getElementById("webphone_bg_container").style.height = heightTmp + 'px';
    }

    if (document.getElementById("container_register") != null)
    {
        var container_register_width = Math.floor(curr_webphone_width * 0.7);
        document.getElementById("container_register").style.width = container_register_width + 'px';
        document.getElementById("register_form").style.width = container_register_width + 'px';

        document.getElementById("username_input").style.borderColor = loginTextBoxBorderColor;
        document.getElementById("password_input").style.borderColor = loginTextBoxBorderColor;
    }

    if (document.getElementById("container_dial") != null)
    {
        var container_dial_width = Math.floor(curr_webphone_width * 0.9);
        document.getElementById("container_dial").style.width = container_dial_width + 'px';

        document.getElementById("webphone_bg_container").style.backgroundColor = curr_background_color;
        document.getElementById("webphone_bg_container").style.borderColor = curr_background_border_color;
    }

	document.body.style.color = curr_general_text_color;

    if (document.getElementById("PhoneNumber") != null)
    {
        if (document.getElementById("btn_callhangup") != null)
        {
            document.getElementById("PhoneNumberDiv").style.backgroundColor = '#ffffff';
            document.getElementById("PhoneNumberDiv").style.borderColor = curr_background_border_color;

            document.getElementById("PhoneNumber").style.color = curr_general_text_color;
            document.getElementById("PhoneNumber").style.backgroundColor = '#ffffff';
        }else
        {
            document.getElementById("PhoneNumberDiv").style.backgroundColor = wp_layout.HoverCalc(curr_background_color, 30);
            document.getElementById("PhoneNumberDiv").style.borderColor = curr_background_border_color;

            document.getElementById("PhoneNumber").style.color = curr_general_text_color;
            document.getElementById("PhoneNumber").style.backgroundColor = wp_layout.HoverCalc(curr_background_color, 30);
        }
    }


	if (document.getElementById('logo_a') != null)		document.getElementById("logo_a").style.color = curr_general_text_color;
	if (document.getElementById('logo2_a') != null)		document.getElementById("logo2_a").style.color = curr_general_text_color;

    if (document.getElementById("btn_connect") != null)
    {
        document.getElementById("btn_connect").style.color = curr_button_text_color;
        document.getElementById("btn_connect").style.backgroundColor = curr_button_color;
        document.getElementById("btn_connect").style.borderColor = curr_button_border_color;
    }

	var logoDivWidth = container_dial_width - 62;
	if (document.getElementById('logo') != null)		document.getElementById("logo").style.width = logoDivWidth + 'px';

	if (curr_company_webpage.indexOf("http://") < 0)
	{
		curr_company_webpage = "http://" + curr_company_webpage;
	}
	if (document.getElementById('logo_a') != null)		document.getElementById("logo_a").href = curr_company_webpage;
	if (document.getElementById('logo_a') != null)		document.getElementById("logo_a").innerHTML = curr_brandname;
	if (document.getElementById('logo_a') != null)		$("a#logo_a").attr("title",curr_brandname + ' Home Page');

	if (document.getElementById('logo2_a') != null)		document.getElementById("logo2_a").href = curr_company_webpage;
	if (document.getElementById('logo2_a') != null)		document.getElementById("logo2_a").innerHTML = curr_brandname;
	if (document.getElementById('logo2_a') != null)		$("a#logo2_a").attr("title",curr_brandname + ' Home Page');

//	document.getElementById("callfunctions").style.backgroundColor = curr_button_color;



	// numpad
	var borderDial = 0;
	var borderCallHangup = 0;
	var borderCallfunction = 0;
	if (isIE())
	{
		var browserVersion = parseInt($.browser.version, 10);
		if (browserVersion > 6)
		{						// IE 7,8,9,...
			borderDial = 20;
			borderCallHangup = 16;
			borderCallfunction = 10;

			// add <br> between img and span in all IE versions but 6
			if (document.getElementById("btn_mute") != null && document.getElementById("btn_hold") != null && document.getElementById("btn_redial") != null)
			{
				$("#btn_mute img").after("<br />");
				$("#btn_hold img").after("<br />");
				$("#btn_redial img").after("<br />");
			}
		}else
		{						// IE 6
			borderDial = 24;
			borderCallHangup = 23;
			borderCallfunction = 15;

			if (document.getElementById("btn_mute") != null && document.getElementById("btn_hold") != null && document.getElementById("btn_redial") != null)
			{
				document.getElementById("btn_mute").firstChild.style.display = 'none';
				document.getElementById("btn_mute").style.lineHeight = '31px';

				document.getElementById("btn_hold").firstChild.style.display = 'none';
				document.getElementById("btn_hold").style.lineHeight = '31px';

				document.getElementById("btn_redial").firstChild.style.display = 'none';
				document.getElementById("btn_redial").style.lineHeight = '31px';
			}
		}
		if (document.getElementById("numpad") != null)   document.getElementById("numpad").style.paddingLeft = '2px';
		if (document.getElementById("callfunctions") != null)
		{
			document.getElementById("callfunctions").style.width = (Math.floor((container_dial_width - borderCallfunction + 4) / 4) * 4) + 'px';
		}
	}else
	{							// Other browsers
		borderDial = 31;
		borderCallHangup = 25;
		borderCallfunction = 12;

		if (document.getElementById("callfunctions") != null)
		{
			document.getElementById("callfunctions").style.marginLeft = '-2px';
		}

		// add <br> between img and span in all other browsers
		if (document.getElementById("btn_mute") != null && document.getElementById("btn_hold") != null && document.getElementById("btn_redial") != null)
		{
			$("#btn_mute img").after("<br />");
			$("#btn_hold img").after("<br />");
			$("#btn_redial img").after("<br />");
		}
	}
	var buton_width = Math.floor((container_dial_width - borderDial) / 3)
	var buton_call_width = Math.floor((container_dial_width - borderCallHangup) / 2)
	var buton_callfunctions_width = Math.floor((container_dial_width - borderCallfunction) / 3)

    if (button != null)
    {
        for (var i = 0; i < 12; i++)
        {
            var currId = "btn_"+i;
            var button = document.getElementById(currId);

            button.style.backgroundColor = curr_button_color;
            button.style.borderColor = curr_button_border_color;
            button.style.color = curr_button_text_color;

            button.style.width = buton_width + 'px';
        }
    }

	if (document.getElementById("callbuttons") != null)
	{
		document.getElementById("btn_call").style.backgroundColor = wp_layout.curr_call_button_color;
		document.getElementById("btn_call").style.borderColor = wp_layout.HoverCalc(wp_layout.curr_call_button_color, -10);
		document.getElementById("btn_call").style.color = curr_button_text_color;
		document.getElementById("btn_call").style.width = buton_call_width + 'px';

		document.getElementById("btn_hangup").style.backgroundColor = curr_hangup_button_color;
		document.getElementById("btn_hangup").style.borderColor = wp_layout.HoverCalc(curr_hangup_button_color, -10);
		document.getElementById("btn_hangup").style.color = curr_button_text_color;
		document.getElementById("btn_hangup").style.width = buton_call_width + 'px';
	}

	if (document.getElementById("acceptreject") != null)
	{
		document.getElementById("btn_accept").style.backgroundColor = wp_layout.curr_call_button_color;
		document.getElementById("btn_accept").style.borderColor = wp_layout.HoverCalc(wp_layout.curr_call_button_color, -10);
		document.getElementById("btn_accept").style.color = curr_button_text_color;
		document.getElementById("btn_accept").style.width = buton_call_width + 'px';

		document.getElementById("btn_reject").style.backgroundColor = curr_hangup_button_color;
		document.getElementById("btn_reject").style.borderColor = wp_layout.HoverCalc(curr_hangup_button_color, -10);
		document.getElementById("btn_reject").style.color = curr_button_text_color;
		document.getElementById("btn_reject").style.width = buton_call_width + 'px';
	}

	if (document.getElementById("btn_save") != null)
	{/*
		if (isIE())
		{
			var browserVersion = parseInt($.browser.version, 10);
			if (browserVersion > 6)
			{						// IE 7,8,9,...
				document.getElementById("btn_callhangup").style.width = Math.floor((container_dial_width - 36) / 3) + 'px';
			}else
			{						// IE 6
				document.getElementById("btn_callhangup").style.width = Math.floor((container_dial_width - 45) / 3) + 'px';
			}
		}else
		{							// Other browsers

		}*/

		document.getElementById("btn_save").style.width = buton_call_width + 'px';
		document.getElementById("btn_save").style.backgroundColor = curr_button_color;
		document.getElementById("btn_save").style.borderColor = curr_button_border_color;
		document.getElementById("btn_save").style.color = curr_button_text_color;
	}

	if (document.getElementById("btn_callhangup") != null)
	{/*
		if (isIE())
		{
			var browserVersion = parseInt($.browser.version, 10);
			if (browserVersion > 6)
			{						// IE 7,8,9,...
				document.getElementById("btn_callhangup").style.width = Math.floor((container_dial_width - 36) / 3) + 'px';
			}else
			{						// IE 6
				document.getElementById("btn_callhangup").style.width = Math.floor((container_dial_width - 45) / 3) + 'px';
			}
		}else
		{							// Other browsers

		}*/
		document.getElementById("btn_callhangup").style.width = curr_button_width + 'px';
		document.getElementById("btn_callhangup").style.backgroundColor = wp_layout.curr_call_button_color;
		document.getElementById("btn_callhangup").style.borderColor = wp_layout.HoverCalc(wp_layout.curr_call_button_color, -10);
		document.getElementById("btn_callhangup").style.color = curr_button_text_color;

        if (document.getElementById("button_title") != null)    document.getElementById("button_title").innerHTML = curr_call_button_text;   // for click2call

        if (wp_api.isClick2Call)
        {
            if (document.getElementById('info') != null)
            {
                var infoWidth = curr_button_width - 4;
                document.getElementById('info').style.width = infoWidth + 'px';
            }
        }
	}

	if (document.getElementById("callfunctions") != null)
	{
		document.getElementById("callfunctions").style.backgroundColor = curr_button_color;
		document.getElementById("callfunctions").style.borderColor = curr_button_border_color;
		document.getElementById("callfunctions").style.color = curr_button_text_color;
	}

	if (document.getElementById("btn_chat") != null && document.getElementById("btn_transfer") != null && document.getElementById("btn_hold") != null && document.getElementById("btn_conference") != null)
	{
		document.getElementById("btn_mute").style.backgroundColor = curr_button_color;
		document.getElementById("btn_mute").style.borderColor = curr_button_border_color;
		document.getElementById("btn_mute").style.width = buton_callfunctions_width + 'px';

		document.getElementById("btn_hold").style.backgroundColor = curr_button_color;
		document.getElementById("btn_hold").style.borderColor = curr_button_border_color;
		document.getElementById("btn_hold").style.width = buton_callfunctions_width + 'px';

		document.getElementById("btn_redial").style.backgroundColor = curr_button_color;
		document.getElementById("btn_redial").style.borderColor = curr_button_border_color;
		document.getElementById("btn_redial").style.width = buton_callfunctions_width + 'px';

		var spanWidth = buton_callfunctions_width - 2;
		$("#btn_mute span").css('width', spanWidth + 'px');
		$("#btn_hold span").css('width', spanWidth + 'px');
		$("#btn_redial span").css('width', spanWidth + 'px');
	}


	}catch (e) {  }

	if (document.getElementById('logo') != null)			disableSelection(document.getElementById('logo'));
	if (document.getElementById('logo2') != null)			disableSelection(document.getElementById('logo2'));
	if (document.getElementById('btn_connect') != null)		disableSelection(document.getElementById('btn_connect'));
	if (document.getElementById('header') != null)			disableSelection(document.getElementById('header'));
	if (document.getElementById('info') != null)			disableSelection(document.getElementById('info'));
	if (document.getElementById('numpad') != null)			disableSelection(document.getElementById('numpad'));
	if (document.getElementById('callbuttons') != null)		disableSelection(document.getElementById('callbuttons'));
	if (document.getElementById('acceptreject') != null)	disableSelection(document.getElementById('acceptreject'));
	if (document.getElementById('callfunctions') != null)	disableSelection(document.getElementById('callfunctions'));

	curvyCorners.init();
}

function disableSelection(target)
{
	if (typeof target.onselectstart!="undefined") //For IE
	    target.onselectstart=function(){return false}

	else if (typeof target.style.MozUserSelect!="undefined") //For Firefox
    	target.style.MozUserSelect="none"
	else //All other route (For Opera)
    	target.onmousedown=function(){return false}

	target.style.cursor = "default"
}

// public interface
return {

	//current layout values
	curr_background_color: '',
	curr_background_border_color: '',
	curr_general_text_color: '',
	curr_button_color: '',
	curr_button_border_color: '',
	curr_button_text_color: '',
	curr_webphone_width: 0,
	curr_webphone_height: 0,
	curr_call_button_color: '',
	curr_hangup_button_color: '',
	curr_brandname: '',
	curr_company_webpage: '',
	curr_button_width: 0,
	curr_call_button_text: '',      // text showed on call button (click to call)
	curr_hangup_button_text: '',    // text showed on hangup button (click to call)

	ApplyCustomSkin: function () // called on page loading from Common.js
	{
		SetBgColor();
	},

	HoverCalc: function (color, modifyValue) // vilagosabb szint csinal
	{
		try{
	//	var modifyValue = 15; // the value that every color (RGB) is modified when hover
		var origColor = color;
		var pos = color.indexOf('#');
		if (pos >= 0)
		{
			color = color.substring(pos+1);
		}

		if (color.length == 6)
		{
			var red = parseInt(color.substring(0,2), 16);
			var green = parseInt(color.substring(2,4), 16);
			var blue = parseInt(color.substring(4,6), 16);

			if ((red  + modifyValue) > 255)		{red = red - modifyValue;}	else if ((red  + modifyValue) < 0)		{red = red - modifyValue;}	else {red = red + modifyValue;}
			if ((green  + modifyValue) > 255)	{green = green - modifyValue;}	else if ((green  + modifyValue) < 0)	{green = green - modifyValue;}	else {green = green + modifyValue;}
			if ((blue  + modifyValue) > 255) 	{blue = blue - modifyValue;}	else if ((blue  + modifyValue) < 0)		{blue = blue - modifyValue;}	else {blue = blue + modifyValue;}

			red = red.toString(16);
			green = green.toString(16);
			blue = blue.toString(16);

			if (red.length < 2)		{red = '0' + red;}
			if (green.length < 2)	{green = '0' + green;}
			if (blue.length < 2)	{blue = '0' + blue;}

			color = '#' + red + green + blue;
		}else if (color.length == 3)
		{
			var red = parseInt(color.substring(0,1), 16);
			var green = parseInt(color.substring(1,2), 16);
			var blue = parseInt(color.substring(2,3), 16);

			if ((red  + modifyValue) > 255)		{red = red - modifyValue;}	else if ((red  + modifyValue) < 0)		{red = red - modifyValue;}	else {red = red + modifyValue;}
			if ((green  + modifyValue) > 255)	{green = green - modifyValue;}	else if ((green  + modifyValue) < 0)	{green = green - modifyValue;}	else {green = green + modifyValue;}
			if ((blue  + modifyValue) > 255) 	{blue = blue - modifyValue;}	else if ((blue  + modifyValue) < 0)		{blue = blue - modifyValue;}	else {blue = blue + modifyValue;}

			red = red.toString(16);
			green = green.toString(16);
			blue = blue.toString(16);

			if (red.length < 2)		{red = '0' + red;}
			if (green.length < 2)	{green = '0' + green;}
			if (blue.length < 2)	{blue = '0' + blue;}

			color = '#' + red + green + blue;
		}else
		{
			return origColor;
		}
		return color;
		}catch (e){}
		return '';
	}
}
}( ); // namespace END

// button mouseover and mouseout event management

$("div#btn_connect").mouseenter(function()
{
	if (isIE())
	{
		$(this).children().css("background-color",wp_layout.HoverCalc(curr_button_color, 15));
	}else
	{
		$(this).css("background-color",wp_layout.HoverCalc(curr_button_color, 15));
	}
}).mouseleave(function()
{
	if (isIE())
	{
		$(this).children().css("background-color",curr_button_color);
	}else
	{
		$(this).css("background-color",curr_button_color);
	}
});

$("div#btn_0").mouseenter(function()
{
	if (isIE())
	{
		$(this).children().css("background-color",wp_layout.HoverCalc(curr_button_color, 15));
	}else
	{
		$(this).css("background-color",wp_layout.HoverCalc(curr_button_color, 15));
	}
}).mouseleave(function()
{
	if (isIE())
	{
		$(this).children().css("background-color",curr_button_color);
	}else
	{
		$(this).css("background-color",curr_button_color);
	}
});

$("div#btn_1").mouseenter(function()
{
	if (isIE())
	{
		$(this).children().css("background-color",wp_layout.HoverCalc(curr_button_color, 15));
	}else
	{
		$(this).css("background-color",wp_layout.HoverCalc(curr_button_color, 15));
	}
}).mouseleave(function()
{
	if (isIE())
	{
		$(this).children().css("background-color",curr_button_color);
	}else
	{
		$(this).css("background-color",curr_button_color);
	}
});

$("div#btn_2").mouseenter(function()
{
	if (isIE())
	{
		$(this).children().css("background-color",wp_layout.HoverCalc(curr_button_color, 15));
	}else
	{
		$(this).css("background-color",wp_layout.HoverCalc(curr_button_color, 15));
	}
}).mouseleave(function()
{
	if (isIE())
	{
		$(this).children().css("background-color",curr_button_color);
	}else
	{
		$(this).css("background-color",curr_button_color);
	}
});

$("div#btn_3").mouseenter(function()
{
	if (isIE())
	{
		$(this).children().css("background-color",wp_layout.HoverCalc(curr_button_color, 15));
	}else
	{
		$(this).css("background-color",wp_layout.HoverCalc(curr_button_color, 15));
	}
}).mouseleave(function()
{
	if (isIE())
	{
		$(this).children().css("background-color",curr_button_color);
	}else
	{
		$(this).css("background-color",curr_button_color);
	}
});

$("div#btn_4").mouseenter(function()
{
	if (isIE())
	{
		$(this).children().css("background-color",wp_layout.HoverCalc(curr_button_color, 15));
	}else
	{
		$(this).css("background-color",wp_layout.HoverCalc(curr_button_color, 15));
	}
}).mouseleave(function()
{
	if (isIE())
	{
		$(this).children().css("background-color",curr_button_color);
	}else
	{
		$(this).css("background-color",curr_button_color);
	}
});

$("div#btn_5").mouseenter(function()
{
	if (isIE())
	{
		$(this).children().css("background-color",wp_layout.HoverCalc(curr_button_color, 15));
	}else
	{
		$(this).css("background-color",wp_layout.HoverCalc(curr_button_color, 15));
	}
}).mouseleave(function()
{
	if (isIE())
	{
		$(this).children().css("background-color",curr_button_color);
	}else
	{
		$(this).css("background-color",curr_button_color);
	}
});

$("div#btn_6").mouseenter(function()
{
	if (isIE())
	{
		$(this).children().css("background-color",wp_layout.HoverCalc(curr_button_color, 15));
	}else
	{
		$(this).css("background-color",wp_layout.HoverCalc(curr_button_color, 15));
	}
}).mouseleave(function()
{
	if (isIE())
	{
		$(this).children().css("background-color",curr_button_color);
	}else
	{
		$(this).css("background-color",curr_button_color);
	}
});

$("div#btn_7").mouseenter(function()
{
	if (isIE())
	{
		$(this).children().css("background-color",wp_layout.HoverCalc(curr_button_color, 15));
	}else
	{
		$(this).css("background-color",wp_layout.HoverCalc(curr_button_color, 15));
	}
}).mouseleave(function()
{
	if (isIE())
	{
		$(this).children().css("background-color",curr_button_color);
	}else
	{
		$(this).css("background-color",curr_button_color);
	}
});

$("div#btn_8").mouseenter(function()
{
	if (isIE())
	{
		$(this).children().css("background-color",wp_layout.HoverCalc(curr_button_color, 15));
	}else
	{
		$(this).css("background-color",wp_layout.HoverCalc(curr_button_color, 15));
	}
}).mouseleave(function()
{
	if (isIE())
	{
		$(this).children().css("background-color",curr_button_color);
	}else
	{
		$(this).css("background-color",curr_button_color);
	}
});

$("div#btn_9").mouseenter(function()
{
	if (isIE())
	{
		$(this).children().css("background-color",wp_layout.HoverCalc(curr_button_color, 15));
	}else
	{
		$(this).css("background-color",wp_layout.HoverCalc(curr_button_color, 15));
	}
}).mouseleave(function()
{
	if (isIE())
	{
		$(this).children().css("background-color",curr_button_color);
	}else
	{
		$(this).css("background-color",curr_button_color);
	}
});

$("div#btn_10").mouseenter(function()
{
	if (isIE())
	{
		$(this).children().css("background-color",wp_layout.HoverCalc(curr_button_color, 15));
	}else
	{
		$(this).css("background-color",wp_layout.HoverCalc(curr_button_color, 15));
	}
}).mouseleave(function()
{
	if (isIE())
	{
		$(this).children().css("background-color",curr_button_color);
	}else
	{
		$(this).css("background-color",curr_button_color);
	}
});

$("div#btn_11").mouseenter(function()
{
	if (isIE())
	{
		$(this).children().css("background-color",wp_layout.HoverCalc(curr_button_color, 15));
	}else
	{
		$(this).css("background-color",wp_layout.HoverCalc(curr_button_color, 15));
	}
}).mouseleave(function()
{
	if (isIE())
	{
		$(this).children().css("background-color",curr_button_color);
	}else
	{
		$(this).css("background-color",curr_button_color);
	}
});

$("div#btn_call").mouseenter(function()
{
	if (isIE())
	{
		$(this).children().css("background-color",wp_layout.HoverCalc(wp_layout.curr_call_button_color, 15));
	}else
	{
		$(this).css("background-color",wp_layout.HoverCalc(wp_layout.curr_call_button_color, 15));
	}
}).mouseleave(function()
{
	if (isIE())
	{
		$(this).children().css("background-color",wp_layout.curr_call_button_color);
	}else
	{
		$(this).css("background-color",wp_layout.curr_call_button_color);
	}
});

$("div#btn_hangup").mouseenter(function()
{
	if (isIE())
	{
		$(this).children().css("background-color",wp_layout.HoverCalc(curr_hangup_button_color, 15));
	}else
	{
		$(this).css("background-color",wp_layout.HoverCalc(curr_hangup_button_color, 15));
	}
}).mouseleave(function()
{
	if (isIE())
	{
		$(this).children().css("background-color",curr_hangup_button_color);
	}else
	{
		$(this).css("background-color",curr_hangup_button_color);
	}
});

$("div#btn_accept").mouseenter(function()
{
	if (isIE())
	{
		$(this).children().css("background-color",wp_layout.HoverCalc(wp_layout.curr_call_button_color, 15));
	}else
	{
		$(this).css("background-color",wp_layout.HoverCalc(wp_layout.curr_call_button_color, 15));
	}
}).mouseleave(function()
{
	if (isIE())
	{
		$(this).children().css("background-color",wp_layout.curr_call_button_color);
	}else
	{
		$(this).css("background-color",wp_layout.curr_call_button_color);
	}
});

if (document.getElementById("btn_save") != null)
{
	$("div#btn_save").mouseenter(function()
	{
		if (isIE())
		{
			$(this).children().css("background-color",wp_layout.HoverCalc(curr_button_color, 15));
		}else
		{
			$(this).css("background-color",wp_layout.HoverCalc(curr_button_color, 15));
		}
	}).mouseleave(function()
	{
		if (isIE())
		{
			$(this).children().css("background-color",curr_button_color);
		}else
		{
			$(this).css("background-color",curr_button_color);
		}
	});
}

if (document.getElementById("btn_callhangup") != null)
{
	$("div#btn_callhangup").mouseenter(function()
	{
		if (isIE())
		{
			if (wp_common.callhangup_isInCall)
			{
				$(this).children().css("background-color",wp_layout.HoverCalc(curr_hangup_button_color, 15));
			}else
			{
				$(this).children().css("background-color",wp_layout.HoverCalc(wp_layout.curr_call_button_color, 15));
			}
		}else
		{
			if (wp_common.callhangup_isInCall)
			{
				$(this).css("background-color",wp_layout.HoverCalc(curr_hangup_button_color, 15));
			}else
			{
				$(this).css("background-color",wp_layout.HoverCalc(wp_layout.curr_call_button_color, 15));
			}
		}
	}).mouseleave(function()
	{
		if (isIE())
		{
			if (wp_common.callhangup_isInCall)
			{
				$(this).children().css("background-color",curr_hangup_button_color);
			}else
			{
				$(this).children().css("background-color",wp_layout.curr_call_button_color);
			}
		}else
		{
			if (wp_common.callhangup_isInCall)
			{
				$(this).css("background-color",curr_hangup_button_color);
			}else
			{
				$(this).css("background-color",wp_layout.curr_call_button_color);
			}
		}
	});
}

if (document.getElementById("btn_mute") != null && document.getElementById("btn_hold") != null && document.getElementById("btn_redial") != null)
{
	$("div#btn_mute").mouseenter(function()
	{
		if (isIE())
		{
			$(this).children().css("background-color",wp_layout.HoverCalc(curr_button_color, 15));
		}else
		{
			$(this).css("background-color",wp_layout.HoverCalc(curr_button_color, 15));
		}
	}).mouseleave(function()
	{
		if (isIE())
		{
			$(this).children().css("background-color",curr_button_color);
		}else
		{
			$(this).css("background-color",curr_button_color);
		}
	});

	$("div#btn_hold").mouseenter(function()
	{
		if (isIE())
		{
			$(this).children().css("background-color",wp_layout.HoverCalc(curr_button_color, 15));
		}else
		{
			$(this).css("background-color",wp_layout.HoverCalc(curr_button_color, 15));
		}
	}).mouseleave(function()
	{
		if (isIE())
		{
			$(this).children().css("background-color",curr_button_color);
		}else
		{
			$(this).css("background-color",curr_button_color);
		}
	});

	$("div#btn_redial").mouseenter(function()
	{
		if (isIE())
		{
			$(this).children().css("background-color",wp_layout.HoverCalc(curr_button_color, 15));
		}else
		{
			$(this).css("background-color",wp_layout.HoverCalc(curr_button_color, 15));
		}
	}).mouseleave(function()
	{
		if (isIE())
		{
			$(this).children().css("background-color",curr_button_color);
		}else
		{
			$(this).css("background-color",curr_button_color);
		}
	});
}

/*
function ButtonHover(id, status)
{
	//if (status == 0)
		//alert("id = "+id+"; status = "+status);
	//try{
	if (status == 1)
	{
		var hover;
		var border_hover;

		if (wp_api.button_color.length > 0)
		{
			hover = wp_layout.HoverCalc(wp_api.button_color);
		}else
		{
			hover = wp_layout.HoverCalc(def_button_color);
		}

		if (button_border_color.length > 0)
		{
			border_hover = wp_layout.HoverCalc(button_border_color);
		}else
		{
			border_hover = wp_layout.HoverCalc(def_button_border_color);
		}

//		document.getElementById(id).style.backgroundColor = hover;
//		document.getElementById(id).style.borderColor = border_hover;

		curvyCorners.adjust(id, "style.backgroundColor", ""+hover);
		curvyCorners.adjust(id, "style.borderColor", ""+border_hover);
	}

	if (status == 0)
	{
//		document.getElementById(id).style.backgroundColor = wp_api.button_color;
//		document.getElementById(id).style.borderColor = button_border_color;

		curvyCorners.adjust(id, "style.backgroundColor", ""+wp_api.button_color);
		curvyCorners.adjust(id, "style.borderColor", ""+button_border_color);
	}
	//curvyCorners.redraw();
	//}catch (e) {	}
}*/
