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
 * The Atari module contains all the framework code for game development.
 * @module Atari
 */
(function(scope) {

	function Fonts() {}

	/**
	 * MUST match fonts as defined in type.less
	 */
	Fonts.NORMAL = "'AvantGardeGothicITCW01B 731069'";
	Fonts.ITALIC = "'AvantGardeGothicITCW01B 731072'";
	Fonts.DEMI = "'AvantGardeGothicITCW01D 731075'";
	Fonts.DEMI_ITALIC = "'AvantGardeGothicITCW01D 731078'";

	scope.Fonts = Fonts;

}(window.Atari))