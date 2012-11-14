(function (scope) {

	var VendorPrefixUtil = function () { };

	var p = VendorPrefixUtil.prototype;
	var s = VendorPrefixUtil;
	var cache = {};

	var prefexs = ["webkit", "Moz", "ms", "O"];

	var style = document.createElement('div').style;

	s.getName = function(prop) {
		var startProp = prop;
		prop = prop.substr(0, 1).toUpperCase() + prop.substr(1);

		if (cache[prop]) { return cache[prop]; }

		for (var i= 0,l=prefexs.length;i<l;i++) {
			var newProp = null;
			var prefex = prefexs[i];
			if (prefex + prop in style) {
				newProp = prefex + prop;
				break;
			}
		}

		//We never found a prop. so return what was passed in.
		if (!newProp) {
			newProp = startProp;
		}

		cache[prop] = newProp;
		return newProp;
	};

	scope.VendorPrefixUtil = VendorPrefixUtil;

}(window));