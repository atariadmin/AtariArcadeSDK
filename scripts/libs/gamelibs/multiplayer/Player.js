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
	 * A player in a game. This will help determine who you are playing with
	 * @class Player
	 * @param {String} name The player's name
	 * @param {String} id The player's unique ID.
	 * @constructor
	 */
	function Player(name, id) {
		this.initialize(name, id);
	}

	var s = Player;
	s.DEVELOPER_AVATARS = [
		"http://graph.facebook.com/855155122/picture?type=square",
		"http://graph.facebook.com/gaboury/picture?type=square",
		"http://graph.facebook.com/lanny.mcnie/picture?type=square",
		"http://graph.facebook.com/michaelgraves/picture?type=square",
		"http://graph.facebook.com/mlabunka/picture?type=square",
		"http://graph.facebook.com/christopher.caldwell.589/picture?type=square",
		"http://graph.facebook.com/wes.gorgichuk/picture?type=square",
		"http://graph.facebook.com/rovertnnud/picture?type=square",
		"http://graph.facebook.com/grant.skinner/picture?type=square",
		"http://graph.facebook.com/bhendel1/picture?type=square"
	];
	s.DEFAULT_AVATAR = "/sites/all/themes/atari_arcade/static/images/avatar-computer.jpg";

	var p = Player.prototype = {

		/**
		 * The player's name.
		 * @property name
		 * @type String
		 */
		name: null,

		/**
		 * The player's unique ID.
		 * @property id
		 * @type String
		 */
		id: null,

		/**
		 * This player is a clientHost
		 */
		isHost: false,

		/**
		 * If the player is your player.
		 * @property isMe
		 * @type Boolean
		 */
		isMe: false,

		/**
		 * If the player is currently AI controlled
		 */
		isComputer: false,

		/**
		 * If the player is your Facebook friend.
		 * @property isFriend
		 * @type Boolean
		 */
		isFriend: false,

		/**
		 * Reference to the player's input gamepad.
		 * @property gamePad
		 * @type GamePad
		 */
		gamePad: null,

		/**
		 * A url to the player's avatar. This will be hosted on Atari, or pulled from Facebook.
		 * @property avatar
		 * @type String
		 */
		avatar: null,

		/** If either id or name is not passed, Player will use one for both */
		initialize: function(name, id) {
			if(name){ this.name = name; }
			else { this.name = id; }

			if(id){ this.id = id; }
			else { this.id = name; }
		},

		/**
		 * Return an avatar for the player. If no avatar is found, a default one will be returned.
		 * @method getAvatar
		 * @return {String}
		 */
		getAvatar: function() {
			if (this.avatar != null && this.avatar != "") {
				return this.avatar;
			//} else if (Atari.developerMode) {
			//	return s.DEVELOPER_AVATARS[Math.random() * s.DEVELOPER_AVATARS.length | 0];
			} else {
				return s.DEFAULT_AVATAR;
			}
		},

		toString: function() {
			return "[GameLibs.Player " + this.name + "]";
		}
	}

	scope.Player = Player;

}(window.GameLibs))