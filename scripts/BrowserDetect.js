(function(scope) {

	/**
	 * BrowserDetect derived from http://www.quirksmode.org/js/detect.html
	 */
	var s = {};

// Public properties:

	s.browser = null;
	s.version = null;
	s.os = null;

	s.isIE = function () {
		return s.browser == 'Explorer';
	};

	s.isVista = function() {
		return navigator.userAgent.indexOf('Windows NT 6.0') != -1;
	};

	s.isXP = function() {
		return navigator.userAgent.indexOf('Windows NT 5') != -1;
	};

	s.isWindows = function() {
		return s.os == "Windows";
	};

	s.isWP8 = function () {
		return navigator.userAgent.indexOf('Windows Phone 8') != -1;
	};

	s.isWP7 = function () {
		return navigator.userAgent.indexOf('Windows Phone 7') != -1;
	};

	s.isAndroid = function() {
		return navigator.userAgent.indexOf('Android') != -1;
	};

	s.isIE9 = function () {
		return this.isIE() && this.getInternetExplorerVersion() == 9;
	};

	s.isMac = function() {
		return s.os == "Mac" || s.isIOS();
	};

	s.isIOS = function() {
		return s.os == "iPhone/iPod" || s.os == "iPad";
	};

	s.isIOSRetina = function () {
		return s.isIOS() && window.devicePixelRatio > 1;
	};

	s.isMobileSafari = function() {
		return s.isSafari() && s.isIOS();
	};

	s.isSafari = function() {
		return s.browser == "Safari";
	};

	s.isChrome = function() {
		return s.browser == "Chrome";
	};

	s.isFirefox = function() {
		return s.browser == "Firefox" || s.browser == "Mozilla";
	};

	s.isOpera = function () {
		return s.browser == "Opera";
	};

	s.getInternetExplorerVersion =  function()
	// Returns the version of Internet Explorer or a -1
	// (indicating the use of another browser).
	{
	  var rv = -1; // Return value assumes failure.
	  if (navigator.appName == 'Microsoft Internet Explorer')
	  {
	    var ua = navigator.userAgent;
	    var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
	    if (re.exec(ua) != null)
	      rv = parseFloat( RegExp.$1 );
	  }
	  return rv;
	}

// Protected properties:

	s._dataBrowser = [
		{
			string: navigator.userAgent,
			subString: "Chrome",
			identity: "Chrome"
		},
		{ 	string: navigator.userAgent,
			subString: "OmniWeb",
			versionSearch: "OmniWeb/",
			identity: "OmniWeb"
		},
		{
			string: navigator.vendor,
			subString: "Apple",
			identity: "Safari",
			versionSearch: "Version"
		},
		{
			prop: window.opera,
			identity: "Opera",
			versionSearch: "Version"
		},
		{
			string: navigator.vendor,
			subString: "iCab",
			identity: "iCab"
		},
		{
			string: navigator.vendor,
			subString: "KDE",
			identity: "Konqueror"
		},
		{
			string: navigator.userAgent,
			subString: "Firefox",
			identity: "Firefox"
		},
		{
			string: navigator.vendor,
			subString: "Camino",
			identity: "Camino"
		},
		{	// for newer Netscapes (6+)
			string: navigator.userAgent,
			subString: "Netscape",
			identity: "Netscape"
		},
		{
			string: navigator.userAgent,
			subString: "MSIE",
			identity: "Explorer",
			versionSearch: "MSIE"
		},
		{
			string: navigator.userAgent,
			subString: "Gecko",
			identity: "Mozilla",
			versionSearch: "rv"
		},
		{	// for older Netscapes (4-)
			string: navigator.userAgent,
			subString: "Mozilla",
			identity: "Netscape",
			versionSearch: "Mozilla"
		}
	];

	s._dataOS = [
		{
			string: navigator.platform,
			subString: "Win",
			identity: "Windows"
		},
		{
			string: navigator.platform,
			subString: "Mac",
			identity: "Mac"
		},
		{
			string: navigator.userAgent,
			subString: "iPhone",
			identity: "iPhone/iPod"
		},
		{
			string: navigator.userAgent,
			subString: "iPad",
			identity: "iPad"
		},
		{
			string: navigator.platform,
			subString: "Linux",
			identity: "Linux"
		}
	];

	s._versionSearchString = null;

// Public methods:

	s.init = function () {
		s.browser = s._searchString(s._dataBrowser) || "An unknown browser";
		s.version = s._searchVersion(navigator.userAgent) || s._searchVersion(navigator.appVersion) || "An unknown version";
		s.os = s._searchString(s._dataOS) || "An unknown OS";
	};

// Protected methods:

	s._searchString = function (data) {
		for (var i = 0, l = data.length; i < l; i++) {
			var dataString = data[i].string;
			var dataProp = data[i].prop;

			s._versionSearchString = data[i].versionSearch || data[i].identity;
			if (dataString) {
				if (dataString.indexOf(data[i].subString) != -1) { return data[i].identity; }
			} else if (dataProp) {
				return data[i].identity;
			}
		}
	};

	s._searchVersion = function (dataString) {
		var index = dataString.indexOf(s._versionSearchString);
		if (index == -1) { return; }
		return parseFloat(dataString.substring(index + s._versionSearchString.length + 1));
	};

scope.BrowserDetect = s;

s.init(); // Auto init class.

}(window.AtariSite!=null?window.AtariSite:window));