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
	 * The GameInfo class provides information about the current single or multiplayer game.
	 * @class MultiPlayer
	 * @constructor
	 */
	function GameInfo(gameId, mode, roomName, players, multiplayer, gameModes, platform, width, height) {
        this.initialize(gameId, mode, roomName, players, multiplayer, gameModes, platform, width, height);
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



	// Platform ENUMs
	s.PLATFORM_DESKTOP = "desktop";
	s.PLATFORM_WP7 = "wp7";
	s.PLATFORM_WP8 = "wp8"; // Might be fine to use WP
	s.PLATFORM_IPHONE = "iPhone";
	s.PLATFORM_IPHONE3 = "iPhone3";
	s.PLATFORM_IPHONE_PINNED = "iPhonePinned";
	s.PLATFORM_IPHONE3_PINNED = "iPhone3Pinned";

	s.QUALITY_NORMAL = 0;
	s.QUALITY_HIGH = 1;
	s.QUALITY_LOW = 2;

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

		/**
		 * The width of the game in pixels. This is set by the game shell.
		 * @property width
		 * @type Number
		 * @default 1024
		 */
		width: 1024,

		/**
		 * The height of the game in pixels. This is set by the game shell.
		 * @property height
		 * @type Number
		 * @default 622
		 */
		height: 622,

		/**
		 * The amount the viewport is scaled to accommodated different pixel densities on devices. For example,
		 * the iPhone 4+ needs to be scaled to 0.5 to run properly.
		 * @property scaleFactor
		 * @type Number
		 * @default 1
		 */
		scaleFactor: 1,

		/**
		 * The platform the game is running on. This is detected by the game framework, and injected.
		 * @property platform
		 * @type Number
		 * @default null
		 */
		platform: null,

		/**
		 * The game quality is determined by the rough resolution and platform, which provides an
		 * idea on how much to scale assets in a game to be reasonable.
		 * <ul>
		 *     <li>Normal (0): This is the default, and what is shown on the desktop (1024x622)</li>
		 *     <li>High (1): A device with high resolution, it is recommended to draw assets a little larger (1.5x or so).
		 *      Devices with high resolution include the iPhone 4+, and Windows Phone 8 devices with 720p resolution.
		 *     <li>Low (2): A device with low resolution, it is recommended to draw assets a little smaller (0.75x).
		 *      Devices with low resolution include Windows Phone 7 & 8 (WVGA), and iPhone 3GS and lower.
		 * </ul>
		 * @property quality
		 * @type Number
		 * @default QUALITY_NORMAL (0)
		 */
		quality: s.QUALITY_NORMAL,

		initialize: function(gameId, mode, roomName, players, multiPlayerGame, gameModes, platform, width, height) {
			this.gameId = gameId;
			this.mode = mode || s.SINGLE_PLAYER;
			this.roomName = roomName;
			if (players != null) { this.players = players; }
			if (multiPlayerGame != null) {
				this.minPlayers = multiPlayerGame.minPlayers
				this.maxPlayers = multiPlayerGame.maxPlayers;
			}
			this.gameModes = gameModes;

			// Set the size if it was passed in.
			if (width != null) { this.width = width; }
			if (height != null) { this.height = height; }

			//TODO: Platform will have to be determined by the system.
			this.platform = platform;
			switch (platform) {
				case s.PLATFORM_DESKTOP:
					this.width = 1024;
					this.height = 622;
					break;

				case s.PLATFORM_WP7:
					this.width = 800;
					this.height = 410;
					this.scaleFactor = 0.6;
					this.quality = s.QUALITY_LOW;
					break;

				case s.PLATFORM_WP8:
					//TODO: Might have WVGA resolution as well, which is low-res
					this.width = 1280;
					this.height = 700;
					this.scaleFactor = 0.6;
					this.quality = s.QUALITY_HIGH;
					break;

				/* Mobile with browser chrome
				case s.PLATFORM_IPHONE:
					this.width = 960;
					this.height = 396;
					this.scaleFactor = 0.5;
					this.quality = s.QUALITY_HIGH;
					break;

				case s.PLATFORM_IPHONE3:
					this.width = 480;
					this.height = 196;
					this.quality = s.QUALITY_LOW;
					break;
				case s.PLATFORM_IPHONE3_PINNED:
					this.width = 480;
					this.height = 320;
					this.quality = s.QUALITY_LOW;
					break;
				*/

				case s.PLATFORM_IPHONE:
					this.width = 960;
					this.height = 640;
					this.scaleFactor = 0.5;
					this.quality = s.QUALITY_HIGH;
					break;

			}
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