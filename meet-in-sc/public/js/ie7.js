/* To avoid CSS expressions while still supporting IE 7 and IE 6, use this script */
/* The script tag referencing this file must be placed before the ending body tag. */

/* Use conditional comments in order to target IE 7 and older:
	<!--[if lt IE 8]><!-->
	<script src="ie7/ie7.js"></script>
	<!--<![endif]-->
*/

(function() {
	function addIcon(el, entity) {
		var html = el.innerHTML;
		el.innerHTML = '<span style="font-family: \'meet-in\'">' + entity + '</span>' + html;
	}
	var icons = {
		'icon-account-parsonal': '&#xe900;',
		'icon-arrow': '&#xe901;',
		'icon-browse-out': '&#xe902;',
		'icon-browse': '&#xe903;',
		'icon-business-card': '&#xe904;',
		'icon-call-cut': '&#xe905;',
		'icon-call': '&#xe906;',
		'icon-close': '&#xe907;',
		'icon-code': '&#xe908;',
		'icon-coffe': '&#xe909;',
		'icon-comment-02': '&#xe90a;',
		'icon-comment-off': '&#xe90b;',
		'icon-comment': '&#xe90c;',
		'icon-company-puls': '&#xe90d;',
		'icon-company': '&#xe90e;',
		'icon-completion': '&#xe90f;',
		'icon-configuration-personal': '&#xe910;',
		'icon-configuration': '&#xe911;',
		'icon-connect': '&#xe912;',
		'icon-content': '&#xe913;',
		'icon-cursor02': '&#xe914;',
		'icon-delete': '&#xe915;',
		'icon-document-01': '&#xe916;',
		'icon-document': '&#xe917;',
		'icon-download': '&#xe918;',
		'icon-edit': '&#xe919;',
		'icon-expansion': '&#xe91a;',
		'icon-folder': '&#xe91b;',
		'icon-full-screen': '&#xe91c;',
		'icon-highlight': '&#xe91d;',
		'icon-history': '&#xe91e;',
		'icon-hold': '&#xe91f;',
		'icon-link': '&#xe920;',
		'icon-login': '&#xe921;',
		'icon-logout': '&#xe922;',
		'icon-memo': '&#xe923;',
		'icon-menu-01': '&#xe924;',
		'icon-menu-02': '&#xe925;',
		'icon-menu-03': '&#xe926;',
		'icon-menu-04': '&#xe927;',
		'icon-menu-05': '&#xe928;',
		'icon-menu-06': '&#xe929;',
		'icon-menu-07': '&#xe92a;',
		'icon-menu-08': '&#xe92b;',
		'icon-menu-down': '&#xe92c;',
		'icon-microphone-off': '&#xe92d;',
		'icon-microphone': '&#xe92e;',
		'icon-parsonal-puls': '&#xe92f;',
		'icon-parsonal': '&#xe930;',
		'icon-pc': '&#xe931;',
		'icon-pen': '&#xe932;',
		'icon-pointer': '&#xe933;',
		'icon-post-it': '&#xe934;',
		'icon-puls': '&#xe935;',
		'icon-rec': '&#xe936;',
		'icon-reduced-screen': '&#xe937;',
		'icon-reduction': '&#xe938;',
		'icon-report': '&#xe939;',
		'icon-reset': '&#xe93a;',
		'icon-search': '&#xe93b;',
		'icon-share': '&#xe93c;',
		'icon-sp': '&#xe93d;',
		'icon-tab': '&#xe93e;',
		'icon-upload': '&#xe93f;',
		'icon-url': '&#xe940;',
		'icon-video-off': '&#xe941;',
		'icon-video': '&#xe942;',
		'icon-whiteboard': '&#xe943;',
		'icon-window-share': '&#xe944;',
		'icon-window': '&#xe945;',
		'0': 0
		},
		els = document.getElementsByTagName('*'),
		i, c, el;
	for (i = 0; ; i += 1) {
		el = els[i];
		if(!el) {
			break;
		}
		c = el.className;
		c = c.match(/icon-[^\s'"]+/);
		if (c && icons[c[0]]) {
			addIcon(el, icons[c[0]]);
		}
	}
}());
