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

(function(scope) {

	var LocalStorage = function() { }
	var s = LocalStorage;

	s.set =  function (name, value) {
		return $.jStorage.set(name, value);
	}

	s.get =  function (name, defaultValue) {
		var value = $.jStorage.get(name, defaultValue);
		return value;
	}

	window.LocalStorage = LocalStorage;

}(window));