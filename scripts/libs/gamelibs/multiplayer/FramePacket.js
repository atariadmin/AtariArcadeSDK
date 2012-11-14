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
	 * Frame Packets represent actions and data for a single player, which is
	 * passed over the socket each tick. This likely contains things like player position,
	 * projectiles, etc. Also included is player events, which are one-time actions
	 * such as firing a projectile, losing a life, etc.
	 * @class FramePacket
	 * @constructor
	 */
	function FramePacket(events, state) {
		this.initialize(events, state);
	}

	var s = FramePacket;
	var p = FramePacket.prototype = {

		/**
		 * The frame state. This is an object containing all the packet data about the
		 * frame. This should be customized by the game. Each game will have to be able
		 * to read the information that it provides.
		 * @property state
		 * @type Object
		 */
		state: null,

		/**
		 * If this is enabled, the player will receive his own packet back from the server.
		 * Otherwise everyone BUT the sender will receive it.
		 * @property state
		 * @type Object
		 */
		returnToSender: false,

		/**
		 * The clientId for this packet. MultiPlayerGame will inject this into any packets it sends out.
		 */
		clientId: null,

		/**
		 * Any events that take place in the frame, such as firing a projectile, losing a
		 * life, etc. This should be customized by the game. Each game will have to be able
		 * to read the information that it provides.
		 * @property events
		 * @type Object
		 * @default null
		 */
		events: null,

		initialize:function (events, state) {
			this.events = events;
			this.state = state;
		},

		/**
		 * Convert the properties of the packet into a raw object for serialization by
		 * the server.
		 * @return {Object} The frame data.
		 */
		serialize: function() {
			var obj = {
				state: this.state
			};
			if (this.events != null) {
				obj.events = this.events;
			}
			obj.clientId = this.clientId;
			obj.timestamp = new Date().getTime();
			return obj;
		},

		/**
		 * Read the socket data into the properties of the FramePacket. This can be used in
		 * place of the constructor in case the packet is re-used.
		 * @param {Object} data The socket data/
		 */
		deserialize: function(data) {
			this.timestamp = data.timestamp;
			this.state = data.state;
			this.events = data.events;
			this.clientId = data.clientId;
		},

		toString:function () {
			return "[FramePacket]";
		}

	}

	scope.FramePacket = FramePacket;

}(window.GameLibs))