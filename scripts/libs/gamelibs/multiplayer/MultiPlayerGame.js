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
	 * The MultiPlayerGame class manages the relationship between the socket server and the game. It
	 * connects to the server, and receives incoming packets, which are parsed and stored for retrieval
	 * by the GameMediator at the appropriate time. There is also a simple API to dispatch frame packets
	 * from the player, which the GameMediator also manages.
	 * @class MultiPlayerGame
	 * @param {GameInfo} gameInfo The game information object.
	 * @constructor
	 */
	function MultiPlayerGame(gameInfo) {
		this.gameInfo = gameInfo;
		//Delay a tick, so if the socket fails on connect, we still can pass the error up.
		setTimeout(Atari.proxy(this.initialize, this), 1);
	}

	var s = MultiPlayerGame;
	s.SOCKET_URL = "http://arcadeservice.atari.com:50000";

	var p = MultiPlayerGame.prototype = {

		/**
		 * A reference to the current GameInfo, which holds the active players, and other info
		 * about the current game.
		 * @property gameInfo
		 * @type GameInfo
		 * @protected
		 */
		gameInfo: null,

		/**
		 * The socket connection.
		 * @property socket
		 * @type Object
		 * @protected
		 */
		socket: null,

		/**
		 * This client's unique nickname, used to determine which packets belong to this client.
		 */
		clientId: null,

		/**
		 * Is this client the host of the game
		 */
		isHost: false,

		// Interval
		countDown: -1,

		// Amount of time remaining
		secondsLeft: -1,

		/**
		 * A list (or hash) of current packets since the last tick. This is collected, and then
		 * pulled out by the GameMediator when the game is ready to apply them.
		 * @property currentPackets
		 * @type Array
		 * @protected
		 */
		currentPackets: null,

		/**
		 * A game sync packet received by the server. This is collected, and then
		 * pulled out by the GameMediator when the game is ready to apply it.
		 * @property lastSync
		 * @type GamePacket
		 * @protected
		 */
		lastSyncPacket: null,

	// Callbacks
		/**
		 * The callback that is fired when the game counts down while waiting for players to connect.
		 * @event onCountDown
		 * @param {Number} seconds The number of seconds remaining.
		 */
		onCountDown: null,

		/**
		 * The callback that is fired when the game is ready to play.
		 * @event onGameReady
		 */
		onGameReady: null,

		/**
		 * The callback that is fired when we've connected to the server.
		 * @event onConnectionSuccess
		 */
		onConnectionSuccess: null,

		/**
		 * Called when the socket server is unavailable.
		 *
		 */
		onConnectionError: null,

		/**
		 * Called when the socket server returns an error, like room is full, or game not found.
		 */
		onSocketError: null,

		/**
		 * The callback that is fired the game has timed out, due to not enough players being in the game.
		 * @event onGameTimeout
		 */
		onGameTimeout: null,

		/**
		 * The callback that is fired when players have been added or removed from the game.
		 * @event onPlayersChanged
		 */
		onPlayersChanged: null,

		/**
		 * The callback that is fired when the game has been canceled. This happens when a game
		 * has already begun, and too many players leave.
		 * @event onGameCanceled
		 */
		onGameCanceled: null,

		initialize:function (gameInfo) {
			if (gameInfo) {
				this.gameInfo = gameInfo;
			}
			this.currentPackets = [];

			// Hook up socket.
			var isConnected = (s.socket != null);
			if(!isConnected){
				try {
					s.socket = io.connect(s.SOCKET_URL, {"force new connection": true});
				} catch(e){
					Atari.trace("ERROR: Unable to connect to multiplayer server.");
					if (this.onConnectionError) { this.onConnectionError(e); }
					return;
				}
			} else {
				this.cleanupSocket();
			}
			var socket = s.socket;

			// Listen for socket data
			socket.on("connect", Atari.proxy(this.handleConnect, this));
			socket.on("startCountDown", Atari.proxy(this.handleCountDown, this));
			socket.on("gameReady", Atari.proxy(this.handleGameReady, this));
			socket.on("joined", Atari.proxy(this.handleNewPlayer, this));
			socket.on("becomeHost", Atari.proxy(this.handleBecomeHost, this));
			socket.on("left", Atari.proxy(this.handlePlayerLeave, this));
			socket.on("joinSuccess", Atari.proxy(this.handleJoinSuccess, this));
			socket.on("gameCanceled", Atari.proxy(this.handleGameCanceled, this));

			socket.on("packet", Atari.proxy(this.handlePacket, this));
			socket.on("broadcast", Atari.proxy(this.handlePacket, this));
			socket.on("sync", Atari.proxy(this.handleSync, this));

			socket.on("error", Atari.proxy(this.handleError, this));

			//If we're already connected, join the game immediately
			if(isConnected){
				this.joinGame();
			}
		},

		// Placeholder for ticking.
		tick: function() {
			this.secondsLeft--;
			if (this.secondsLeft == 0) {
				clearInterval(this.countDown);
				// Wait for gameReady from socket.
			} else {
				if (this.onCountDown) { this.onCountDown(this.secondsLeft); }
			}
		},

		cleanupSocket: function() {
			if (!s.socket) { return; }
			s.socket.removeAllListeners("connect");
			s.socket.removeAllListeners("startCountDown");
			s.socket.removeAllListeners("gameReady");
			s.socket.removeAllListeners("joined");
			s.socket.removeAllListeners("becomeHost");
			s.socket.removeAllListeners("left");
			s.socket.removeAllListeners("joinSuccess");
			s.socket.removeAllListeners("gameCanceled");
			s.socket.removeAllListeners("packet");
			s.socket.removeAllListeners("broadcast");
			s.socket.removeAllListeners("sync");
			s.socket.removeAllListeners("error");
			s.socket = null;
		},


/*************************************************
 * PUBLIC METHODS
 **************************************************/

		/**
		 * Join a new game
		 * @param packet
		 */
		joinGame: function() {
			var player = this.gameInfo.getMyPlayer();
			//[SB] If no currentPlayer is defined, we'll inject one.
			// This is primarily a debugging hook so that the development site will work without a logged in user, should not be needed in production code.
			if(!player){
				var id = "Guest" + (Math.random() * 10000 | 0);
				var player = new GameLibs.Player(id, id);
				player.isMe = true;
				this.gameInfo.players = [player];
			}
			//Ask server to setup a game, it will create a room if one is needed, or add us to an existing room if possible.
			s.socket.emit("join", {
				gameType: this.gameInfo.gameId,
				roomName: this.gameInfo.roomName, //Atari.developerMode ? "A84" : this.gameInfo.roomName,
				userId:player.id,
				nickname:player.name,
				picture:player.getAvatar()
			});

			Atari.trace('[MultiplayerGame] gameInfo.roomName: ', this.gameInfo.roomName);
			Atari.trace('[MultiplayerGame] user: ', player.id);
			Atari.trace("[MultiplayerGame] Requesting to join game...");
		},

		/**
		 * Send the entire game state to the other players. Only host games will provide synchronization
		 * packets, and it should only be sent every so often.
		 * @method sendGameState
		 * @param {GamePacket} packet The game state object.
		 */
		sendGameState: function(packet) { // CALLED EXTERNALLY
			if(!packet){ Atari.trace("WARNING: SendGameState called with empty packet."); return; }
			var data = packet.serialize();
			s.socket.emit("sync", data);
			Atari.trace("[MultiplayerGame] SYNC: Sent");
		},

		/**
		 * Send a frame packet to the other players.
		 * This is called by by the mediator whenever the game has an available packet.
		 * This can happen as often as every tick, but an effort should be made to keep this to less than 10/second.
		 * @method sendPacket
		 * @param {FramePacket} packet The frame packet to send.
		 */
		sendPacket: function(packet) {
			//If we have no packets this frame, do nothing.
			if(!packet){ return; }

			//We have a packet, inject our clientId and emit
			packet.clientId = this.playerId;
			var data = packet.serialize();
			if(packet.returnToSender){
				s.socket.emit("broadcast", data);
			} else {
				s.socket.emit("packet", data);
			}
		},

		/**
		 * Get the current frame packets for all other players since last tick. Once it is retrieved
		 * it will be cleared for the next tick.
		 * @method getPackets
		 * @return {Array} packets A list of the other player's FramePackets received since last tick.
		 */
		getPackets: function(packets) {
			if (!this.currentPackets) { return []; }

			//TODO: May have received multiple frame packets from a player since last tick - so we should change how they are stored. Maybe an object.
			var packets = this.currentPackets.concat();
			this.currentPackets.length = 0; // Remove packets.
			return packets;
		},

		/**
		 * Get the last sync packet sent by the game host. If it is empty, it will be ignored. Once it is retrieved
		 * it will be cleared for the next tick.
		 * @method getLastSync
		 * @return {GamePacket} The last game packet from the host.
		 */
		getLastSync: function() {
			var packet = this.lastSyncPacket;
			this.lastSyncPacket = null;
			return packet;
		},

		destroy: function() {
			if (!s.socket) { return; }
			Atari.trace("[MultiplayerGame] Destroy");
			s.socket.emit("leave");
			s.socket.emit("disconnect");
			this.cleanupSocket();
		},

/*************************************************
 * SOCKET / EVENT HANDLERS
 **************************************************/

		// Socket Methods.
		/**
		 * The socket has connected.
		 * @method handleConnect
		 * @param {Object} data Socket data
		 * @protected
		 */
		handleConnect: function(data) {
			Atari.trace("[MultiPlayerGame] Connected.");
			this.joinGame();
			if (this.onConnectionSuccess) { this.onConnectionSuccess(); }
		},

		/**
		 * The socket has started the countdown.
		 * @method handleCountDown
		 * @param {Object} data Socket data
		 * @protected
		 */
		handleCountDown: function(data) {
			if (data.countDownTime < 0) { return; }
			this.secondsLeft = data.countDownTime/1000;
			if(this.countDown != null){ clearInterval(this.countDown); }
			this.countDown = setInterval(Atari.proxy(this.tick, this), 1000);
		},

		stopCountdown: function() {
			if(this.countDown != null){ clearInterval(this.countDown); }
		},

		/**
		 * The game is ready to start.
		 * @param {Object} data Socket data
		 * @protected
		 */
		handleGameReady: function() {
			clearInterval(this.countDown);
			if (this.onGameReady) { this.onGameReady(); }
		},

		/**
		 * This client has successfully joined a room.
		 * @param {Object} data A list of all players currently in the room, with you at the end.
		 * @protected
		 */
		handleJoinSuccess: function(data) {
			this.gameInfo.players = [];
			for(var i = 0, l = data.players.length; i < l; i++){
				this.gameInfo.players[i] = new GameLibs.Player(data.players[i].nickname, data.players[i].userId);
			}
			//Last player in list is us, save the clientId
			var lastPlayer = this.gameInfo.players[i-1];
			lastPlayer.isMe = true;
			this.playerId = lastPlayer.id;

			Atari.trace("[MultiplayerGame] JoinSucces: Joined as client '"+ this.playerId +"'. Total clients: " + this.gameInfo.players.length);
			if (this.onPlayersChanged) { this.onPlayersChanged(this.gameInfo.players); } //TODO: Dispatch actual roster?
		},

		/**
		 * The server has selected this client to be the host.
		 * @param data
		 */
		handleBecomeHost: function() {
			var players = this.gameInfo.players;
			for(var i = 0, l = players.length; i < l; i++){
				if(players[i].id == this.playerId){
					players[i].isHost = true;
					Atari.trace("[MultiplayerGame] Become Host received for clientId: " + this.playerId);
				}
			}
		},

		/**
		 * Another client has joined the room we're already in. We will not receive this for ourselves.
		 * @param data
		 */
		handleNewPlayer: function(data) {
			var player = new GameLibs.Player(data.nickname, data.userId);
			player.avatar = data.picture;
			this.gameInfo.players.push(player);
			Atari.trace("[MultiplayerGame] PlayerJoined: New Player Entered Room: '"+ data.id);
			if (this.onPlayersChanged) { this.onPlayersChanged(this.gameInfo.players); }
		},

		/**
		 * Client has left
		 * @param data data.nickname
		 */
		handlePlayerLeave: function(data) {
			for(var i = 0, l = this.gameInfo.players.length; i < l; i++){
				if(this.gameInfo.players[i].id == data.userId){
					this.gameInfo.players.splice(i, 1);
					Atari.trace("[MultiplayerGame] PlayerLeave: Player '"+data.nickname+"' Exited Room");
					break;
				}
			}
			if (this.onPlayerLeave) { this.onPlayerLeave(data.userId); }
			
		},

		/**
		 * The game has been canceled. This happens when a game has already started, but enough players
		 * leave that the game can not continue.
		 * @method handleGameCanceled
		 * @protected
		 */
		handleGameCanceled: function() {
			if (this.onGameCanceled) { this.onGameCanceled(); }
			if(s.socket){ s.socket.emit("leave"); }
			Atari.trace("[MultiplayerGame] Game Canceled - Leaving Room");
		},

		/**
		 * A frame packet was received from the socket server. It gets stored for retrieval. This ensures
		 * that the game can get all the packets at once each tick.
		 * @method handlePacket
		 * @param {Object} data The raw data from the socket.
		 * @protected
		 */
		handlePacket: function(data) {
			var packet = new GameLibs.FramePacket();
			packet.deserialize(data);
			this.currentPackets.push(packet);
		},

		/**
		 * A game packet was received from the socket server. It gets stored for retrieval. This ensures
		 * that the game can get the sync when it needs it.
		 * @method handleSync
		 * @param {Object} data The raw data from the socket.
		 * @protected
		 */
		handleSync: function(data) {
			var packet = new GameLibs.GamePacket();
			packet.deserialize(data);
			this.lastSyncPacket = packet;
			Atari.trace("[MultiplayerGame] SYNC: Received");
		},

		/**
		 * @param data
		 */
		handleError: function(data) {
			if (this.onSocketError) { this.onSocketError(data); }
		},

		toString:function () {
			return "[GameLibs.MultiPlayerGame]";
		}

	}

	scope.MultiPlayerGame = MultiPlayerGame;

}(window.GameLibs))