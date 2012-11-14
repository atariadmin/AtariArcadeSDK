/*
* Atari Arcade SDK
* Developed by gskinner.com in partnership with Atari
* Visit http://atari.com/arcade/developers for documentation, updates and examples.
*
* Copyright (c) Atari Interactive, Inc. All Rights Reserved. Atari and the Atari logo are trademarks owned by Atari Interactive, Inc.
*
* Distributed under the terms of the MIT license.
* http://www.opensource.org/licenses/mit-license.html
*
* This notice shall be included in all copies or substantial portions of the Software.
*/

/** @module GameLibs */
(function(scope) {

	/**
	 * The StringUtils class provides common string formatting methods
	 * used throughout.
	 * @class StringUtils
	 */
	function StringUtils() {}
	var s = StringUtils;

	/**
	 * Supplant a number of key-value pairs into a string. This enables
	 * template-like formatting using {KEY_NAME} string injection.
	 * @method supplant
	 * @param {String} str The core string that contains {KEYS} to be replaced.
	 * @param {Object} params The replacement object, which contains <pre>{KEYS:"Value"}</pre> properties.
	 * @return {String} A string with all replaced string values. Note that values defined in the source string
	 * that are not found in the replacement object will remain with {CURLY_BRACES}.
	 * @static
	 */
	s.supplant = function(str, params) {
		var ret = str;
		for (var n in params) {
			var r = new RegExp("{"+n+"}", "ig");
			ret = ret.replace(r, params[n]);
		}
		return ret;
	};

	s.formatScore = function(score, prefix) {
		var scoreString = score.toString();

		// Add commas.
		scoreString = s.padLeft(scoreString, prefix, "0");
		if (score >= 1000) {
			for(i=scoreString.length-3; i >= 1; i-=3) {
				scoreString = scoreString.substring(0,i) + "," + scoreString.substring(i, scoreString.length);
			}
		}

		return scoreString;
	};

	s.padLeft = function(str, length, character) {
		if (character == null) { character = "0"; }
		while (str.length < length) {
			str = character + str;
		}
		return str;
	}

	s.padRigh = function(str, length, character) {
		if (character == null) { character = "0"; }
		while (str.length < length) {
			str = str + character;
		}
		return str;
	}

	scope.StringUtils = StringUtils;

}(window.GameLibs))