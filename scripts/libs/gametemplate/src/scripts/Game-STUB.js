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

(function(scope) {

	function Game() {}

	var s = Game;
	s.assets;
	s.width;
	s.height;

	var p = Game.prototype = {
		// props
		assets: null,
		stage: null,
		gameInfo: null,

/*************************************************
 * CORE ENGINE
 **************************************************/

		initialize: function(assets, stage, gameInfo) {
			this.assets = Game.assets = assets;
			this.stage = stage;
			this.gameInfo = gameInfo;

			Game.width = stage.canvas.width;
			Game.height = stage.canvas.height;

			new GameLibs.FPSMeter(stage);
		},

		startGame: function() {
			// Just do it!
		},

		tick: function() {
			this.camera.tick();
			this.tank.tick();
		},

/*************************************************
 * MULTIPLAYER
 **************************************************/

		//Apply full game state to all players including yourself.
		sync: function(packet) {

		},

		//Get syncPacket (Full State) for the entire game. This may never return null.
		getGamePacket: function() {

		},


		//Apply framePackets to other players
		updatePlayers: function(packets) {

		},

		//Get framePacket for yourself. This may frequently return null.
		getFramePacket: function() {

		},



/*************************************************
 * Public API for Framework
 **************************************************/
		pause: function(paused) {

		},

		continueGame: function() {

		},

		restart: function() {

		},

		destroy: function() {

		},

		getScore: function() {
			return null;
		},


/*************************************************
 * Framework Callbacks (these will all be injected for you)
 **************************************************/

		onGameOver: null,

		onLevelComplete: null,

		onGameComplete: null,

		onLifeLost: null,

		onGameAchievement: null,

		onGameError: null,

		onGameNotification: null

	}
	scope.Game = Game;

}(window.Atari.currentGame))