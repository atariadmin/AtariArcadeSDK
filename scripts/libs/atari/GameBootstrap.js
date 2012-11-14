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
	 * The GameBootstrap manages the initialization and preloading of the games.
	 * Only the <b>startGame()</b> method is necessary to begin a game.
	 *
	 * @class GameBootstrap
	 * @static
	 */
	function GameBootstrap() {}
	var s = GameBootstrap;

	/**
	 * The EaselJS stage element.
	 * @property stage
	 * @type HTMLCanvasElement
	 * @static
	 * @protected
	 */
	s.stage = null; // Reference to an Easel Stage

	/**
	 * A reference to the actual HTML canvas.
	 * @property canvas
	 * @type HTMLCanvasElement
	 * @static
	 * @protected
	 */
	s.canvas = null;

	/**
	 * The last-loaded game ID, such as "pong". The id determines the manifest that is loaded.
	 * @property gameId
	 * @type String
	 * @static
	 * @protected
	 */
	s.gameId = null; // ID of current game (eg: "pong")

	/**
	 * The baseUrl that the last game request used.
	 * @property baseUrl
	 * @type String
	 * @static
	 * @protected
	 */
	s.baseUrl = null;

	/**
	 * The id-based list of loaded assets for the last gameAssets.
	 * @property gameAssets
	 * @type Object
	 * @static
	 * @protected
	 */
	s.gameAssets = null; // The preloaded assets for the current game

	/**
	 * The game list manifest, which describes all games.
	 * @property manifest
	 * @type Object
	 * @static
	 * @protected
	 */
	s.manifest = null;

	/**
	 * The GameShell that owns the current game window that initialized the bootstrap.
	 * This property is looked up manually via window.parent.Atari.GameShell.
	 * @property owner
	 * @type Class
	 * @static
	 * @protected
	 */
	s.owner = null;

	s.mediator = null;

	s.startTime = 0;

	/**
	 * The minimum load time we allow. This ensures that if all we need to load is scripts,
	 * that the scripts have time to initialize before we start the game.
	 * @property MIN_LOAD_TIME
	 * @type {Number}
	 * @default 500
	 * @static
	 */
	s.MIN_LOAD_TIME = 500;

	/**
	 * Initialize the GameBootstrap.
	 * @method initialize
	 * @static
	 */
	s.initialize = function() {
		// Selectively set the plugins
		createjs.FlashPlugin.BASE_PATH = window.BASE_PATH + "scripts/soundjs/";
		if (createjs.PreloadJS.BrowserDetect.isIOS) {
			createjs.SoundJS.registerPlugin(createjs.FlashPlugin);
		}
	}

	/**
	 * Start a game. The canvas is resized based on the manifest loaded in the parent window.
	 * The game manifest is assumed to be loaded in the parent window, and can be looked up.
	 *
	 * @method startGame
	 * @param {String} gameId The id-based name of the game to start
	 * @param {String} baseUrl The relative path to the root of the project.
	 * @param {HTMLCanvasElement} canvas The canvas element that the game will use.
	 * @static
	 */
	s.startGame = function(gameId, baseUrl, canvas) {
		s.gameId = gameId;
		s.baseUrl = baseUrl;
		var stage = s.stage = new createjs.Stage(canvas);
		createjs.Touch.enable(stage);
		stage.mouseMoveOutside = true;
		stage.enableMouseOver(10);

		s.mediator = new Atari.GameMediator();
		var owner = window.parent.Atari.GameShell;
		if (owner != null) {
			this.owner = owner;
			owner.registerMediator(s.mediator);
		}
		scope.gameMediator = s.mediator;

		var manifest = s.manifest = this.owner.currentGameManifest;
		s.canvas = canvas;
		// LM: DEPRECATED FOR NOW
		//canvas.width = manifest.width;
		//canvas.height = manifest.height;

		// Append base to each path
		var assets = [];
		var base = s.manifest.base + "src/";
		var deps = !Atari.developerMode && manifest.deployDependencies?manifest.deployDependencies:manifest.dependencies;
		for (var i=0, l=deps.length; i<l; i++) {
			assets.push(s.baseUrl + base + deps[i]);
		}

		for (i=0, l=manifest.assets.length; i<l; i++) {
            if(typeof(manifest.assets[i]) == "string") {
                manifest.assets[i] = s.baseUrl + base + manifest.assets[i];
            } else {
                manifest.assets[i].src = s.baseUrl + base + manifest.assets[i].src;
            }
			assets.push(manifest.assets[i]);
		}

		s.gameAssets = {};
		var loader = new createjs.PreloadJS(false);
		loader.onProgress = Atari.proxy(s.handleGameProgress, s);
		loader.onFileLoad = Atari.proxy(s.handleAssetLoaded, s);
		loader.onError = Atari.proxy(s.handleAssetError, s);
		loader.onComplete = Atari.proxy(s.handleAssetsComplete, s);
		loader.installPlugin(s);
		loader.loadManifest(assets);

		s.startTime = new Date().getTime() + s.MIN_LOAD_TIME;
	}

	/**
	 * Bootstrap provides preload directions for sound.
	 * @method getPreloadHandlers
	 * @return {Object}
	 */
	s.getPreloadHandlers = function() {
		if (window.createjs == null) { return null; }
		var handlers = createjs.SoundJS.getPreloadHandlers();
		handlers.callback = Atari.proxy(s.initLoad, s);
		return handlers;
	}

	/**
	 * The callback that PreloadJS will make when audio items are preloaded. We override
	 * this to inject OGG path alternatives, and prevent preloading if audio is disabled.
	 * @param params See SouundJS.initLoad for parameter overview.
	 * @return {Boolean} If audio is disabled, will return false. Otherwise, uses SoundJS override.
	 */
	s.initLoad = function(src, type, id, data) {
		if (window.createjs == null) { return false; }
		if (this.owner.audioDisabled) { return false; }
		var path = src.substr(0, src.lastIndexOf("."));
		src += createjs.SoundJS.DELIMITER + path + ".ogg";
		return createjs.SoundJS.initLoad(src, type, id, data);
	}

	s.handleGameProgress = function(event) {
		event.progress = event.loaded / event.total;
		s.mediator.handleGameProgress(event);
	}

	/**
	 * An asset has been loaded.
	 * <ul>
	 *     <li>CSS and JavaScript are injected into the HEAD of the document.</li>
	 *     <li>JSON objects are parsed, and stored by ID in the <b>gameAssets</b></li>
	 *     <li>All other elements are stored by ID in the <b>gameAssets</b></li>
	 * </ul>
	 * @method handleAssetLoaded
	 * @param {Object} event The file event from PreloadJS
	 * @static
	 * @protected
	 */
	s.handleAssetLoaded = function(event) {
		switch (event.type) {
			case createjs.PreloadJS.JAVASCRIPT:
			case createjs.PreloadJS.CSS:
				// Inject into head as a SCRIPT or LINK
				document.getElementsByTagName("HEAD")[0].appendChild(event.result);
				break;
			case createjs.PreloadJS.JSON:
				s.gameAssets[event.id] = Atari.parseJSON(event.result);
				break;
			default:
				s.gameAssets[event.id] = event.result;
				break;
		}
	}

	/**
	 * All assets have completed loading.
	 * @method handleAssetsComplete
	 * @param {Object} event The complete event from PreloadJS
	 * @static
	 * @protected
	 */
	s.handleAssetsComplete = function(event) {
		var now = new Date().getTime()
		if (now >= s.startTime) {
			s.createGameInstance();
		} else {
			var dif = s.startTime - now;
			setTimeout(Atari.proxy(s.createGameInstance, s), dif);
		}
	}

	/**
	 * Create the game instance.
	 * @method createGameInstance
	 * @protected
	 */
	s.createGameInstance = function() {
		// Todo: TEST HARD!
		var gameInstance;
		try {
            // Create game instance using the gameClass property in the manifest.
			// Only allow names that are letters, numbers, underscore, or period; 32 characters long; and end in ".js".
			var match = s.manifest.gameClass.match(/([\w\.]{0,32})(?=\.js)/);
			var className = match[1];
			eval("gameInstance = new Atari.currentGame."+ className +"()");
		} catch (error) {
			Atari.trace("Unable to instantiate class. Please ensure it exists on Atari.currentGame namespace, contains only alpha-numeric characters, and is no longer than 32 characters.");
			throw(error);
		}

		GameLibs.GameUI.initialize(s.canvas.width, s.canvas.height);

        //Inject dependencies and bootstrap game
        scope.currentGame.instance = gameInstance;
		s.mediator.registerGameInstance(gameInstance, s.gameAssets, s.stage);
	}

	/**
	 * An asset could not be found, or was otherwise unable to load.
	 * @method handleAssetError
	 * @param {Object} event The error event from PreloadJS
	 * @static
	 * @protected
	 */
	s.handleAssetError = function(event) {
		Atari.trace("Unable to load",event.id);
	}

	scope.GameBootstrap = GameBootstrap;

}(window.Atari))
