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

/**
 * The GameLibs module contains all classes and methods shared by both
 * the framework and specific game code.
 * @module GameLibs
 */
(function(scope) {

	/**
	 * The GameLibs class is a namespace where all game libraries are stored.
	 * GameLibs is a statically-accessed, global object on window.
	 * @class GameLibs
	 */
	function GameLibs() {}

	scope.GameLibs = GameLibs;

}(window))