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

/** @module Atari */
(function(scope){

	/** @class HighScores */
	function HighScores() {}

	//TODO: Poll scoreboard for a new high score.

	// Save to local storage
	// TODO: will need an iOS workaround
	HighScores.saveLocalScore = function(game, score) {
		var oldScore = HighScores.getLocalScore(game);
		if(score > oldScore){
			localStorage.setItem(game + ".score", score);
		}
	}

	// Load from local storage
	// Note: will need an iOS workaround
	HighScores.getLocalScore = function(game) {
		var score =  localStorage.getItem(game + ".score");
		return score || 0;
	}

	// Load display scores from server
	HighScores.loadScores = function(friendsOnly) {
		//TODO: Pass in current user token to get rank.
		//TODO: Optionally just load friends' scores.

		//LM: For now just return scores directly.

		// Temporary
		return [
			{
				name: "pong",
				scores: [
					{name:"LAN", score:1234, rank:1},
					{name:"SEB", score:321, rank:2},
					{name:"SDS", score:321, rank:3}
				]
			},
			{
				name: "centipede",
				scores: [
					{name:"SBS", score:1234, rank:1},
					{name:"LAN", score:1245, rank:2, me:true},
					{name:"SEB", score:1222, rank:3}
				]
			},
			{
				name: "breakout",
				scores: [
					{name:"SEB", score:1250, rank:300},
					{name:"LAN", score:1220, rank:301, me:true},
					{name:"SBS", score:12, rank:302}
				]
			}
		];
	}

	// Save to server
	// TODO: We will need to figure out how to do some obfuscation here.
	HighScores.submitScore = function(game, name, score) {
		// Send to server.
		// Get back result set
	}

	scope.HighScores = HighScores;

}(window.Atari))
