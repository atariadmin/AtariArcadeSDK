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
	 * The GamePacket represents a full synchronization of the current game,
	 * which is periodically passed by host game instances to all other players
	 * to ensure everyone is playing the same game.
	 * @class GamePacket
	 * @constructor
	 */
	function GamePacket(events, gameState, playersState) {
		this.initialize(events, gameState, playersState);
	}

	var s = GamePacket;
	var p = GamePacket.prototype = {

		/**
		 * An list of all the events in this sync packet
		 * @property details
		 * @type Array
		 */
		events: null,

		/**
		 * A description of the current game state other than player info. This might include a list
		 * of all asteroids, missiles, bricks, etc. The game must be able to interpret the information
		 * that is sends.
		 * @property game
		 * @type Object
		 */
		gameState: null,

		/**
		 * A description of all players current state. This might include position, player projectiles,
		 * rotation, etc. The game must be able to interpret the information that it sends.
		 * @property players
		 * @type Array
		 */
		playersState: null,

		initialize:function (events, gameState, playersState) {
			this.events = events;
			this.gameState = gameState;
			this.playersState = playersState;
		},

		/**
		 * Convert the packet information into a raw object to be sent over the socket.
		 * @method serialize
		 * @return {Object} The raw data.
		 */
		serialize: function() {
			return obj = {
				timestamp: new Date().getTime(),
				events: this.events,
				gameState: this.gameState,
				playersState: this.playersState
			};
		},

		/**
		 * Convert the socket data into properties on the GamePacket.
		 * @method deserialize
		 * @param {Object} data The data from the socket.
		 */
		deserialize: function(data) {
			this.events = data.events;
			this.timestamp = data.timestamp;
			this.gameState = data.gameState;
			this.playersState = data.playersState;
		},

		toString:function () {
			return "[GamePacket]";
		}

	}

	scope.GamePacket = GamePacket;

}(window.GameLibs))