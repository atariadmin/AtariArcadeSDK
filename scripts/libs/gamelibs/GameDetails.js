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
(function (scope) {

	/**
	 * A value object containing the player's score, level, lives, etc. This is used
	 * to communicate high scores when finishing a game, and also to synchronize the
	 * games together in multiplayer.
	 * @class GameDetails
	 * @param {Number} score The current game score.
	 * @param {Number} level The current level the player is playing. This will not increment when the
	 * player wins until the next level starts.
	 * @param {Number} lives How many lives the player has left.
	 * @constructor
	 */
	function GameDetails(score, level, lives) {
		this.initialize(score, level, lives);
	}

	var s = GameDetails;
	var p = GameDetails.prototype = {

		/**
		 * The player's score in the current game..
		 * @property score
		 * @type Number
		 */
		score: 0,

		/**
		 * The level that the player has achieved in the current game.
		 * @property level
		 * @type Number
		 */
		level: 1,

		/**
		 * The number of lives the player has remaining.
		 * @property lives
		 * @type Number
		 */
		lives: 3,

		initialize:function (score, level, lives) {
			this.score = score;
			this.level = level;
			this.lives = lives;
		},

		/**
		 * Convert the game details into a raw object to be sent over the socket.
		 * @method serialize
		 * @return {Object}
		 */
		serialize: function() {
			return {
				score: this.score,
				level: this.level,
				lives: this.lives
			}
		},

		/**
		 * Convert the socket data into GameDetails properties.
		 * @method deserialize
		 * @param {Object} data The socket data.
		 */
		deserialize: function(data) {
			this.score = data.score;
			this.level = data.level;
			this.lives = data.lives;
		},

		toString:function () {
			return "[GameDetails]";
		}

	}

	scope.GameDetails = GameDetails;

}(window.GameLibs))