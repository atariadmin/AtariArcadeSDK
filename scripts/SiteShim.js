(function(scope) {

	var currentGame = null;
	var shell = Atari.GameShell;
	var progress = null;
	var gameInfo = null;

	var forceTouch = false;
	var platform = null;

	function quickPlay(gameId, basePath, p_forceTouch, p_platform) {
		currentGame = gameId;
		forceTouch = p_forceTouch;
		platform = null;
		if (p_platform != "") { platform = p_platform; }

		progress = document.getElementById("progress");
		progress.innerHTML = "Loading Game Manifest...";
		progress.style.display = "block";

		// Initialize is mandatory now.
		shell.onManifestLoaded = handleManifestLoaded;
		shell.initialize(basePath);
	}

	function handleManifestLoaded(gameManifest) {
		// It is safe to show an arcade layout here.
		shell.onGameSetup = handleGameSetup;
		shell.setupGame(currentGame);
		progress.style.display = "auto";
		progress.innerHTML = "Setting Up Game...";
	}

	// Game manifest (and possibly start screen assets) are loaded.
	function handleGameSetup(manifest) {
		// Once a game is preloaded, it is ready to be started.
		shell.onGameReady = handleGameReady;
		shell.onPlayersChanged = handlePlayersChanged;

		progress.innerHTML = "Loading Game..."

		// All games also provide progress. It is important to check progress even on multiplayer games.
		shell.onGameProgress = handleProgress;

		// Create the game.
		shell.createGame(document.body);
		if (platform != null) { document.getElementById("gameFrame").className = "mobile"; }

		setTimeout(function() {
			$(parent).fadeIn(750);
		}, 1000)
	}

	function handleGameReady() {
		initializeGame();
	}

	function initializeGame() {
		var roomName = null;
		var mode = GameLibs.GameInfo.SINGLE_PLAYER;
		var manifest = shell.currentGameManifest;

		// Prompt user to start a multiplayer game
		var mp = manifest.multiplayer;
		if (mp && platform == null) {
			if (confirm("Play Multiplayer?")) {
				mode = GameLibs.GameInfo.MULTI_PLAYER;
			}
		}
		// If we're not in multiplayer, inject 1 player into the GameInfo
		if(mode == GameLibs.GameInfo.SINGLE_PLAYER){
			var players = [new GameLibs.Player("Player 1", "sp")];
		}

		// Initialize GameInfo class
		gameInfo = new GameLibs.GameInfo(manifest.id, mode, roomName, players, mp, manifest.modes, platform, 1024, 622);
		Atari.trace("Joining room: " + roomName);

		// Check whether touch support is enabled and inject into gameInfo
		if(forceTouch || 'ontouchstart' in document.documentElement || (window.navigator && window.navigator.msMaxTouchPoints > 0)){
			gameInfo.touchEnabled = true;
		}

		// TODO: Works for now.
		gameInfo.isIOS = createjs.PreloadJS.BrowserDetect.isIOS;

		// Initialize the MultiPlayerGame
		if (mode != GameLibs.GameInfo.SINGLE_PLAYER) {
			var mpg = new GameLibs.MultiPlayerGame(gameInfo);
		}

		// Pass both mpg and gameInfo to the shell to initialize the game.
		shell.initializeGame(gameInfo, mpg);

		// Multiplayer games return a room which is connected to the socket. It will provide
		// some nice handlers to manage the UI state.
		if (mpg) {
			mpg.onCountDown = handleCountDown;
			mpg.onTimeout = handleTimeout;
			mpg.onGameReady = startGame;
			mpg.onPlayersChanged = handlePlayersChanged;
			mpg.onPlayerLeave = handlePlayerLeave;
			mpg.onConnectionSuccess = handleConnectionSuccess;
			mpg.onGameCanceled = handleGameCancelled;

			progress.innerHTML += "<br />Waiting for players...";
		} else {
			startGame();
		}
	}

	// The game is ready to play. Either call startGame(), or show a button that does it.
	function startGame() {
		// Set the selected mode!
		// Note: No mode is set for mobile.
		if (gameInfo.gameModes != null && platform == null) {
			var msg = "Choose a game mode:";
			var modes = gameInfo.gameModes;
			for(var i = 0, l = modes.length; i < l; i++) {
				var mode = modes[i];
				msg += "\n * " + modes[i].label + " (" + i + ")";
			}
			var mode = parseInt(prompt(msg, 0));
			gameInfo.setSelectedGameMode(mode);
		}

		progress.innerHTML = "";
		progress.style.display = "none";

		setTimeout(function(){
			shell.startGame();
		}, 50);
	}

	// The game is stil loading assets. Show a progress bar (optional if we are in a multiplayer room)
	function handleProgress(event) {
		//Atari.trace("Loading:", event.progress);
		progress.innerHTML = "Loading: " + (event.progress*100|0) + "%";
	}

	// TBD: A countdown waiting for players to join.
	function handleCountDown(seconds) {
		if(seconds == 14999){
			progress.innerHTML += "<br />Battle will commence in 15 seconds. Prepare yourself!! <br />";
		}
		var countdown = (-14985 + seconds);
		if(countdown >= 0){
			progress.innerHTML += "..." + (-14985 + seconds);
		}
	}

	// The room has timed out because not enough players joined. Either provide a "retry" button
	// or return them to the lobby/arcade.
	function handleTimeout() {
		alert("Multiplayer timeout");
	}

	// Players left or joined the room, either during the pre-game, or during the game.
	function handlePlayersChanged(roster) {
		Atari.trace("[SiteShim] PlayersChanged: There are now "+ roster.length +" people in the room.");
		progress.innerHTML += "<br />[Multiplayer] Player Joined! There are now "+ roster.length +" people in the room.";
	}

	// Players left the room, either during the pre-game, or during the game.
	function handlePlayerLeave(playerId) {
		shell.removePlayer(playerId);
	}

	// Players left or joined the room, either during the pre-game, or during the game.
	function handleConnectionSuccess(roster) {
		progress.innerHTML += "<br />[Multiplayer] Connected to server...";
	}

    // The game was canceled because not enough players are present. This will only happen in-game when players leave.
    function handleGameCancelled(roster) {
        Atari.trace("Game cancelled. Too many players left.");
	    shell.destroyGame();
    }

	window.quickPlay = quickPlay;

}(window));
