/*
* Atari Arcade SDK
* Developed by gskinner.com in partnership with Atari
* Visit http://atari.com/arcade/developers for documentation, updates and examples.
*
* Copyright (c) (c) Atari Interactive, Inc. All Rights Reserved. Atari and the Atari logo are trademarks owned by Atari Interactive, Inc.
*
* Distributed under the terms of the MIT license.
* http://www.opensource.org/licenses/mit-license.html
*
* This notice shall be included in all copies or substantial portions of the Software.
*/

/**
 * The Atari module contains all the framework code for game development.
 * @module Atari
 */
(function(window) {

	/**
	 * The Atari Object stores all the library classes.
	 * For example, to access the Common.proxy method, use:
	 * <pre>Atari.Common.proxy(method, scope);</pre>
	 * <br/><br/>
	 * The window.Atari package is passed into libraries as the "scope"
	 * @class Atari
	 */
	function Atari() {}

	/**
	 * Holds a reference to the current game namespace. This includes all the classes and code
	 * that will used for the active game. Once the game is over, the entire namespace is wiped
	 * out.
	 * <br/><br/>
	 * The window.Atari.currentGame property is passed in to the game classes as the "scope".
	 * @property currentGame
	 * @type Object
	 * @static
	 */
	Atari.currentGame = {};

	/**
	 * Set the game framework into developer mode. This provides better errors in the console, as
	 * well as displaying log messages left in the source code.
	 * @property developerMode
	 * @type {Boolean}
	 * @default false
	 */
	Atari.developerMode = true;

	/**
	 * Output to the console during development. This method is IE-safe, so it can be used
	 * and left in after deployment without risk of crashes.  The arguments are send to console.log,
	 * they are in a try/catch statment to prevent errors.
	 *
	 * @method trace
	 * @param Arguments arguments All arguments are displayed as a space-separated string.
	 * @static
	 */
    Atari.trace = function() {
	    if (Atari.developerMode == false) {
			//console.log("supress");
			return;
		}
	    var str = [];
        for(var i = 0, l = arguments.length; i < l; i++){
			str.push(arguments[i]);
        }
		try {
			console.log(str.join(" "));
		} catch (e) { }
    }

	/**
	 * JavaScript does not provide method closure, so a proxy function can be used
	 * to maintain method scope. Any parameters called on the resulting function will be passed
	 * into the callback.
	 * @param {Function} method The method to call
	 * @param {Object} scope The object to call the method on
	 * @return {Function} A delegate (proxy) function that will maintain the proper scope when it is called.
	 * @static
	 */
    Atari.proxy = function(method, scope) {
        return function() {
			if (Atari.developerMode == false) {
				try {
					return method.apply(scope, arguments);
				} catch(e) { }
			} else {
				return method.apply(scope, arguments);
			}
        }
    }

	/**
	 * Parse a JSON string into an object.
	 * @param {String} str The raw JSON-formatted string.
	 * @return {Object} The JavaScript-formatted object.
	 * @static
	 */
    Atari.parseJSON = function(str) {
        var result;
        try {
            result = JSON.parse(str);
        } catch (error) {
            Atari.trace("Error:", error); return null;
        }
        return result;
    }

	// The Atari namespace is the only object stored on Window
	window.Atari = Atari;

}(window))
