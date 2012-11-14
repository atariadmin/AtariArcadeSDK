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

/** @module Atari */
(function(scope) {

	/**
	 * The GameMediator is the official communication layer for events between the Game Shell
	 * in the parent window, and the game instance running in the IFRAME. The game instance
	 * will receive a reference to the active GameMediator instance when initialized, and can
	 * call methods, which will be properly handled by the game framework. The Game Framework
	 * can also make calls that will be properly passed onto the game instance. Note that all
	 * calls on the game instance are wrapped in try/catch to avoid showing errors to the user
	 * and relevant methods are surfaced as system dialogs.
	 * @class GameMediator
	 * @constructor
	 */
	function GameMediator() {
		this.initialize();
	}
	var s = GameMediator;

	// Shell Events
	s.LEVEL_COMPLETE = "levelComplete";
	s.LIFE_LOST = "lifeLost";
	s.GAME_OVER = "gameOver";
	s.GAME_COMPLETE = "gameComplete";
	s.GAME_ERROR = "gameError";
	s.GAME_NOTIFICATION = "gameNotification";
	s.GAME_ACHIEVEMENT = "achievement";

	// Private shell events
	s.START_DRAG = "startDrag";
	s.STOP_DRAG = "stopDrag";

	// Game Commands
	s.START_GAME = "startGame";
	s.PAUSE_GAME = "pauseGame";
	s.GET_SCORE = "getScore";
	s.CONTINUE_GAME = "continueGame";
	s.RESTART_GAME = "restartGame";
	s.DESTROY_GAME = "destroyGame";
	s.REDUCE_FRAMERATE = "reduceFrameRate";
	s.REMOVE_PLAYER = "removePlayer";

	/**
	 * Defines the constant for a notify-level error, which can usually be ignored.
	 * @property ERROR_NOTIFY
	 * @type {String}
	 * @default errorNotify
	 */
	s.ERROR_NOTIFY = "errorNotify";

	/**
	 * Defines the constant for a warning-level error, which should probably be logged or displayed.
	 * @property ERROR_WARNING
	 * @type {String}
	 * @default errorWarning
	 */
	s.ERROR_WARNING = "errorWarning";

	/**
	 * Defines the constant for a critical-level error, which means the game can not recover. An error should
	 * be displayed
	 * @property ERROR_CRITICAL
	 * @type {String}
	 * @default errorCritical
	 */
	s.ERROR_CRITICAL = "errorCritical";

	s.callbacks = [
		{method: "onLevelComplete", callback: s.LEVEL_COMPLETE},
		{method: "onGameComplete", callback: s.GAME_COMPLETE},
		{method: "onGameOver", callback: s.GAME_OVER},
		{method: "onGameError", callback: s.GAME_ERROR},
		{method: "onLifeLost", callback: s.LIFE_LOST, required:false},
		{method: "onGameAchievement", callback: s.GAME_ACHIEVEMENT, required:false},
		{method: "onGameNotification", callback: s.GAME_NOTIFICATION, required:false}
	];

	var p = GameMediator.prototype = {

		/**
		 * A reference to the Game Shell.
		 * @property shell
		 * @type {Class}
		 * @protected
		 */
		shell: null,

		/**
		 * A reference to the game instance.
		 * @property gameInstance
		 * @type {Object}
		 * @protected
		 */
		gameInstance: null,

		/**
		 * A reference to the current multi-player game controller.
		 * @property multiPlayerGame
		 * @type MultiPlayerGame
		 * @protected
		 */
		multiPlayerGame: null,

		/**
		 * A reference to the EaselJS stage used for the game. This is set by the GameBootStrap when the
		 * game instance is registered.
		 * @property stage
		 * @type Stage
		 */
		stage: null,

		/**
		 * If the game is currently paused.
		 * @property isPaused
		 * @type Boolean
		 */
		isPaused: false,

		/**
		 * The last time tick was called.
		 * @property lastTick
		 * @type Number
		 * @protected
		 */
		lastTick: 0,

		tickThreshold: 3000, // Cheat threshold. Undocumented.

		/**
		 * The target FPS, defaults to 30, but can be overridden by the game manifest.
		 * @property targetFPS
		 * @type Number
		 * @default 30
		 */
		targetFPS: 30,

		/**
		 * The target time between frames in milliseconds, which is 1000 divided by the current
		 * FPS.
		 * @property targetMS
		 * @type Number
		 * @default 33.3
		 */
		targetMS: 1000 / 30,

		/**
		 * A reference to the current assets object.
		 * @property currentAssets
		 * @type Object
		 * @protected
		 */
		currentAssets: null,

		// Callbacks
		/**
		 * The game has dispatched an event (callback) that needs to be bubbled up to the site/framework.
		 * @event onGameEvent
		 * @param {String} method The name of the event/method the game has called.
		 * @param {Array} args A list of arguments.
		 */
		onGameEvent: null,

		/**
		 * This callback is fired when the game is ready to be played. This gives the site/framework
		 * a chance to show dialogs/options, or to play pre-roll ads.
		 * @event onGameReady
		 */
		onGameReady: null,

		/**
		 * This callback is fired as a game preloads. This gives the site/framework a chance to
		 * display loading progress to the user.
		 * @event onGameProgress
		 * @param {Object} event a PreloadJS progress event.
		 */
		onGameProgress: null,

		initialize: function() {},

		/**
		 * The game has completed, so clean up the mediator references. New mediators are created
		 * for each game, however it helps to clean up after ourselves.
		 * @method cleanUp
		 */
		cleanUp: function() {
			createjs.Ticker.removeListener(this);

			this.shell = null;
			this.multiPlayerGame = null;

			this.onGameReady = null;
			this.onGameProgress = null;
			this.onGameEvent = null;

			createjs.Touch.disable(this.stage);
			this.stage = null;
			this.currentAssets = null;

			if (this.gameInstance != null) {
				for(var i = 0, l = s.callbacks.length; i < l; i++) {
					var item = s.callbacks[i];
					this.gameInstance[item.method] = null;
				}
				this.destroyGame();

			}
			this.gameInstance = null;
		},

		destroyGame: function() {
			if (true || Atari.developerMode) {
				this.gameInstance.destroy();
			} else {
				try {
					this.gameInstance.destroy();
				} catch (error) {
					this.logError(error);
				}
			}

			if (!this.multiPlayerGame) { return; }

			if (true || Atari.developerMode) {
				this.multiPlayerGame.destroy();
			} else {
				try {
					this.multiPlayerGame.destroy();
				} catch (error) {
					this.logError(error);
				}
			}
		},

		toggleVisibility: function(visible) {
			// Consider throttling Tick...
			GameLibs.GamePad.reset();
		},

		/**
		 * Register the game instance with the GameMediator. This ensures that all the game has all the
		 * required methods and event handlers defined, and adds handlers for events. Note that the
		 * events are not <i>required</i> on the games, but code hinting will work properly when
		 * there are placeholder methods, and it implies the methods are being called.
		 * @method registerGameInstance
		 * @param {Object} gameInstance The game instance getting registered.
		 * @protected
		 */
		registerGameInstance: function(gameInstance, assets, stage) {
			this.gameInstance = gameInstance;
			this.currentAssets = assets;
			this.stage = stage;

			// Check for available methods
			var methods = ["tick", "pause", "getScore", "continueGame", "restart", "destroy"];
			for (var i=0, l=methods.length; i<l; i++) {
				var method = methods[i];
				if (gameInstance[method] == null || typeof(gameInstance[method]) != "function") {
					Atari.trace("Missing Method '"+method+"' on game class");
				}
			}

			// Check for available callbacks, and add handlers.
			var missing = [];
			for (i= 0, l= s.callbacks.length; i<l; i++) {
				var item = s.callbacks[i];
				var self = this;
				if (gameInstance[item.method] === undefined) {
					if (item.required != false) {
						missing.push(item.method);
					}
				}
				// Create closure to maintain references.
				(function(callback, method) {
					gameInstance[method] = function() {
						self.handleGameEvent(callback, arguments);
					}
				}(item.callback, item.method))
			}
			if (missing.length > 0) {
				Atari.trace("Warning: The game class is missing a number of callbacks (" +
						missing.join(",") +
						").\nCallback properties are not required to be defined in the game class, " +
						"however it is recommended - as their presence implies they " +
						"are getting called by the game class, which is required.");
			}

			// Notify the shell that the game is ready to start.
			if (this.onGameReady) { this.onGameReady(); }
		},

		/**
		 * Register the shell with the GameMediator.
		 * @method registerShell
		 * @param {Class} shell The game shell class (not instance). Game Shell has a static API.
		 * @protected
		 */
		initializeGame: function(shell, mpg) {
			this.shell = shell;
			this.multiPlayerGame = mpg;

			// Scale the canvas to fit the GameInfo.
			var canvas = this.stage.canvas;
			var gameInfo = this.shell.gameInfo;

			// Set the Canvas size
			canvas.width = gameInfo.width;
			canvas.height = gameInfo.height;

			// On hi-resolution platforms, we need to counter-scale.
			canvas.style.width = gameInfo.width * gameInfo.scaleFactor + "px";
			canvas.style.height = gameInfo.height * gameInfo.scaleFactor + "px";

			// Initialize the game itself.
			this.gameInstance.initialize(this.currentAssets, this.stage, gameInfo);
		},

		/**
		 * Start the game. This sets up the tick, and calls startGame on the game instance.
		 * @method startGame
		 */
		startGame: function() {
			var gameInfo = this.shell.gameInfo;

			var fps = this.shell.currentGameManifest.fps;
			if (fps == null || isNaN(fps)) { fps = 30; }
			createjs.Ticker.setFPS(fps);

			this.targetFPS = fps;
			this.targetMS = 1000 / fps;

			if (gameInfo.platform != GameLibs.GameInfo.PLATFORM_IPHONE) {
				createjs.Ticker.useRAF = true;
			}
			createjs.Ticker.addListener(this, false);

			Atari.trace("[GameMediator] Staring game. Total players: " + gameInfo.players.length);
			this.gameInstance.startGame();

		},

		/**
		 * Display an error to the player.
		 * @method showError
		 * @param {Error} error The error caught by the framework.
		 * @param {String} message A verbose message for the player.
		 * @protected
		 */
		showError: function(error, message) {
			this.onError && this.onError(error, message);
			this.logError(error, message);
		},

		/**
		 * Log an error silently.
		 * @method logError
		 * @param {Error} error The error caught by the framework.
		 * @param {String} message A verbose message for the logs.
		 */
		logError: function(error, message) {
			if(Atari.developerMode){
				throw(error);
			}
			Atari.trace(error);
		},

		/**
		 * Mute the game. Note that the game frame has a separate instance of SoundJS
		 * running, which manages all the game sounds.
		 * @method setMute
		 * @param {Boolean} muted If the framework should be muted or not.
		 */
		setMute: function(muted) {
			if (window == null || window.createjs == null) { return; }
			createjs.SoundJS.setMute(muted);
		},

		/**
		 * Tick the game. Each game frame is managed from the GameMediator, ensuring that the
		 * order of operations in multiplayer games is respected, and the stage update happens
		 * at the right time. The should make it easier for developers making multi-player
		 * games.
		 * @method tick
		 * @protected
		 */
		tick: function() {
			var now = createjs.Ticker.getTime();
			if(this.lastSyncTime == 0){	this.lastSyncTime = now; }
			if (now > this.lastTick + this.tickThreshold) {
				//LM: We will have to ensure we do automatic throttling when the user changes tabs.
				// Breakpoint or delay detected
				// Don't necessarily stop, but register possible cheat.
				//[SB] We could inject a fake submitScore() function so his score/win is never sent? :)
				Atari.trace("Breakpoint detected. Could be a cheater.");
			}

			var tickFactor = (now - this.lastTick) / this.targetMS;
			if (tickFactor > 3) { tickFactor = 3; } //Cap tickFactor in case framerate is <20, or a breakpoint was set, we don't want massive ticks to occur.
			this.lastTick = now;

			if (this.isPaused) { return; }

			var gameInfo = this.shell.gameInfo;
			if (gameInfo.isMultiPlayer()) {

				//Check for a pending sync event, if we have one, apply it to the game.
				var packet = this.multiPlayerGame.getLastSync();
				if (packet != null) {
                    try {
						this.gameInstance.sync(packet);
                    } catch(error) {
	                    this.logError(error, "Unable to sync game.");
                    }
                }

                //Check for framePackets from other players, if we have some, apply them to the game.
                packet = this.multiPlayerGame.getPackets();
                if(packet != null && packet.length > 0){
	                try {
                        this.gameInstance.updatePlayers(packet);
	                } catch (error) {
		                this.logError(error, "Unable to update players.");
	                }
                }
			}

			// Process the game tick
			if (true || Atari.developerMode) {
				this.gameInstance.tick(tickFactor);
			} else {
				try {
					this.gameInstance.tick(tickFactor);
				} catch (error) {
					this.logError(error, "errorOnTick")
				}
			}
			// Update the stage.
			this.stage.update();

			if (gameInfo.isMultiPlayer()) {
				//Check if the game has any packets that need to be sent.
				var data;

				if (true || Atari.developerMode) {
					data = this.gameInstance.getFramePacket();
				} else {
					try {
						data = this.gameInstance.getFramePacket();
					} catch (error) {
						this.logError(error, "Unable to get frame packet.");
					}
				}

                if(data != null){
					//Ask multiplayer game to send them out
					this.multiPlayerGame.sendPacket(data);
                }

				// Send the current game sync.
				if (true || Atari.developerMode) {
					data = this.gameInstance.getGamePacket();
				} else {
					try {
						data = this.gameInstance.getGamePacket();
					} catch(error) {
						//this.logError(error, "Unable to get game packet.");
					}
				}
				if(data != null){
					this.multiPlayerGame.sendGameState(data);
				}
			}

			//this.checkFPS(); //LM: Consider calling this less often.
		},

		poorFPSLog: 0,

		checkFPS: function() {
			//LM: Make sure we only measure when we want to.
			var fps = createjs.Ticker.getMeasuredFPS();
			if (fps < 15) {
				Atari.trace("* Low FPS", fps);
				this.poorFPSLog+=2;
			} else {
				this.poorFPSLog--;
			}
			this.poorFPSLog = Math.max(0, this.poorFPSLog);
			if (this.poorFPSLog > 100) {
				Atari.trace("*** Poor FPS Detected");
				// Notify Framework?
				//this.shell.poorFPSDetected();
			}
		},

		handleRelayedInput: function(type, event, data) {
			if (this.stage == null) { return; }
			if (type == "mousemove") {
				this.stage._handlePointerMove(data.id, null, data.frameX, data.frameY);
			} else if (type == "keypress" || type == "keyup" || type == "keydown") {
				//out.text = "key press: "+evt.charCode;
				GameLibs.GamePad.onExternalEvent(event);
			} else if (type == "touchmove") {
				createjs.Touch._handleMove(this.stage, data.id, event, data.frameX, data.frameY);
			} else if (type == "touchend" || type == "touchcancel") {
				createjs.Touch._handleEnd(this.stage, data.id, event);
			}
		},

		// Framework calls

		/**
		 * The game has called one of the injected callbacks to communicate with the game framework.
		 * See the Game class to determine the correct parameters for each callback.
		 * @method handleGameEvent
		 * @param {String} method The method constant to call.
		 * @param {Array} args The arguments called from the game.
		 * @protected
		 */
		handleGameEvent: function(method, args) {
			if (method == s.GAME_OVER || method == s.GAME_COMPLETE) {
				createjs.Ticker.removeListener(this);
				this.stage.update();
				GameLibs.GamePad.player.reset();
			}

			if (this.onGameEvent != null) {
				this.onGameEvent(method, args);
			} else {
				throw("No Listeners for GameEvents found.");
			}
		},

		/**
		 * The GameBootstrap is preloading a game instance, and the progress has changed.
		 * @method handlePreloadProgress
		 * @param {Object} event The event object generated by PreloadJS.
		 * @protected
		 */
		handleGameProgress: function(event) {
			if (this.onGameProgress) {
				this.onGameProgress(event);
			}
		},

		// Game Calls
		/**
		 * Framework commands are marshaled through the command method, and then called on the game instance
		 * methods.
		 * @method command
		 * @param {String} commandName The command name.  All command names are statically defined as properties
		 * of the GameMediator class. This is all handled internally so the values are not important to developers.
		 * @param {Object} args An object with named parameters to be passed into the game.
		 * @return {*} Some methods have a custom return value (such as <b>getScore</b>). Any methods that do not exist
		 * will return <b>false</b>. Otherwise, <b>true</b> is returned.
		 * @protected
		 */
		command: function(commandName, args) {
			Atari.trace("COMMAND:",commandName, args);
			var dev = true || Atari.developerMode;

			if (args == null) { args = {}; }
			var game = this.gameInstance;
			switch (commandName) {
				case s.START_GAME:
					createjs.Ticker.addListener(this, false);
					if (dev) {
						this.startGame();
					} else {
						try {
							this.startGame();
						} catch(error) {
							// TODO: Handle Error
							this.logError(error);
						}
					}
					break;

				case s.PAUSE_GAME:
					this.handlePause(args.paused);
					if (dev) {
						game.pause(args.paused);
					} else {
						try {
							game.pause(args.paused);
						} catch (error) {
							// TODO: Handle error
							this.logError(error);
						}
					}
					break;

				case s.REMOVE_PLAYER:
					if(game.removePlayer){
						game.removePlayer(args);
					}
					break;

				case s.CONTINUE_GAME:
					createjs.Ticker.addListener(this, false);
					if (dev) {
						game.continueGame(args.keepPoints);
					} else {
						try {
							game.continueGame(args.keepPoints);
						} catch(error) {
							this.showError(error, "Unable to continue game.");
						}
					}
					break;

				case s.RESTART_GAME:
					createjs.Ticker.addListener(this, false);
					if (dev) {
						game.restart(args.level);
					} else {
						try {
							game.restart(args.level);
						} catch (error) {
							this.showError(error, "Unable to restart game.");
						}
					}
					break;

				case s.GET_SCORE:
					if (dev) {
						return game.getScore();
					} else {
						try {
							return game.getScore();
						} catch(error) {
							this.logError(error);
							return null;
						}
					}
					break;

				case s.DESTROY_GAME:
					this.destroyGame();
					break;

				case s.REDUCE_FRAMERATE:
					if (dev) {
						game.reduceFrameRate(args.reduceFrameRate);
					} else {
						try {
							game.reduceFrameRate(args.reduceFrameRate);
						} catch(error) {
							this.logError(error);
						}
					}
					break;

				default: return false;
			}
			return true;
		},

		/**
		 * Pause is handled internally, and simply flags the game as paused so the game instance
		 * no longer receives tick calls.
		 * @method handlePause
		 * @param {Boolean} paused Whether the game should be paused or not.
		 * @protected
		 */
		handlePause: function(paused) {
			createjs.Ticker.setPaused(paused);
			this.stage.update();
			if (paused) {
				this.isPaused = true;
				//GameLibs.GameUI.blur(this.stage);
			} else {
				this.lastTick = createjs.Ticker.getTime();
				this.isPaused = false;
			}
		},

		toString: function() {
			return "[Atari.GameMediator]";
		}
	}

	scope.GameMediator = GameMediator;

}(window.Atari))
