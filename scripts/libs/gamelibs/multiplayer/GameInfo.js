/*
* Atari Arcade SDK
* Developed by gskinner.com in partnership with Atari
* Visit http://atari.com/arcade/developers for documentation, updates and examples.
*
* ©Atari Interactive, Inc. All Rights Reserved. Atari and the Atari logo are trademarks owned by Atari Interactive, Inc.
*
* Distributed under the terms of the MIT license.
* http://www.opensource.org/licenses/mit-license.html
*
* This notice shall be included in all copies or substantial portions of the Software.
*/

/** @module GameLibs */
(function(scope) {

	/**
	 * The GameInfo class provides information about the current single or multiplayer game.
	 * @class MultiPlayer
	 */
	function GameInfo(gameId, mode, roomName, players, multiplayer, gameModes) {
        this.initialize(gameId, mode, roomName, players, multiplayer, gameModes);
    }
	var s = GameInfo;

	/**
	 * The game mode for a single player game
	 * @property SINGLE_PLAYER
	 * @type {String}
	 * @default singlePlayer
	 * @static
	 */
	s.SINGLE_PLAYER = "singlePlayer";

	/**
	 * The game mode for a multi-player game, usually initiated with a random match-up.
	 * @property MULTI_PLAYER
	 * @type {String}
	 * @default multiPlayer
	 * @static
	 */
	s.MULTI_PLAYER = "multiPlayer";


	var p = GameInfo.prototype = {

		/**
		 * The game mode. Game modes are provided as static constants on the MultiPlayer class.
		 * <ol>
		 *     <li>MultiPlayer.SINGLE_PLAYER</li>
		 *     <li>MultiPlayer.MULTI_PLAYER</li>
		 * </ol>
		 * @property mode
		 * @type {String}
		 * @default MultiPlayer.SINGLE_PLAYER
		 */
		mode: s.SINGLE_PLAYER,

		/**
		 * The unique gameId for the current game, used for tracking scores and joining multi-player rooms.
		 * @property gameId
		 * @type {String}
		 */
		gameId: null,

		/**
		 * A list of <b>Player</b>s in the current game.
		 * @property players
		 * @type {Array}
		 */
		players: [],

		/**
		 * The name of the current room for multi-player games.
		 * @property roomName
		 * @type {String}
		 * @default null
		 */
		roomName: null,

		/**
		 * The different game modes to be shown at startup. This is defined in the manifest. If
		 * the modes is null, only a "start" button should be displayed.
		 * @property gameModes
		 * @type {Array}
		 * @default null
		 */
		gameModes: null,

		/**
		 * Indicates whether game should display touch controls. This is determined by checking
		 * the touch capabilities of the browser.
		 * @property touchEnabled
		 * @type {Boolean}
		 * @default false
		 */
		touchEnabled: false,

		/**
		 * Indicates if a game is running on mobile safari (ios), which has some limitations
		 * in terms of bitmap size, and may require workarounds.
		 */
		isIOS: false,

		/**
		 * The selected gameModes describes the optional gameplay type, and is chosen by the user
		 * before the startGame() is called. This can be ignored if there are no game modes.
		 * @property selectedMode
		 * @type {Number}
		 * @default 0
		 */
		selectedGameMode: 0,


		initialize: function(gameId, mode, roomName, players, multiPlayerGame, gameModes) {
			this.gameId = gameId;
			this.mode = mode || s.SINGLE_PLAYER;
			this.roomName = roomName;
			if (players != null) { this.players = players; }
			if (multiPlayerGame != null) {
				this.minPlayers = multiPlayerGame.minPlayers
				this.maxPlayers = multiPlayerGame.maxPlayers;
			}
			this.gameModes = gameModes;
		},

		/**
		 * Determine if the game mode is anything other than null or single player.
		 * @method isMultiPlayer
		 * @return {Boolean} If the game is multiplayer (true) or not (false)
		 * @default false
		 */
		isMultiPlayer: function() {
			return this.mode != null && this.mode != s.SINGLE_PLAYER;
		},

		/**
		 * Set the selected game mode index. Indexes are used so that game modes can contain
		 * any necessary information. If the mode is not in range, it is set to 0.
		 * @method setSelectedGameMode
		 * @param {Number} index The index of the game mode in the gameModes array.
		 * @default 0
		 */
		setSelectedGameMode: function(index) {
			if (this.gameModes == null) { return; }
			if (isNaN(index) || index < 0 || index > this.gameModes.length-1) { index = 0; }
			this.selectedGameMode = index;
		},

		/**
		 * Returns a reference to the the current player, relies on the player.isMe property.
		 */
		getMyPlayer: function() {
			if(!this.players){ return; }
			for(var i = 0, l = this.players.length; i < l; i++){
				if(this.players[i].isMe){
					return this.players[i];
				}
			}
			return null;
		},

		/**
		 * Get the selected game mode object (currently, just a string). Games should use this to get
		 * the actual values if they need them.
		 * @method getSelectedGameMode
		 * @return {String} The game mode value
		 */
		getSelectedGameMode: function() {
			if (this.gameModes == null) { return null; }
			var mode = this.gameModes[this.selectedGameMode];
			if (mode == null) { return null; }
			return mode.id;
		},

		toString: function() {
			return "[GameLibs.GameInfo]";
		}

	}

	scope.GameInfo = GameInfo;

}(window.GameLibs))