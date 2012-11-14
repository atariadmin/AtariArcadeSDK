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
	 * A component which displays current FPS. It will display on top off all other children on the stage.
	 * The FPSMeter will only display when the games are running in developer mode.
	 * @class FPSMeter
	 * @param {Stage} stage The EaselJS Stage to add the FPS Meter
	 * @param {String} color The text color. The default is "#FFFFFF".
	 * @constructor
	 */
	var FPSMeter = function(stage, color) {
		if (!Atari.developerMode) { return; }
		this.initialize(stage, color);
	}

    var p = FPSMeter.prototype = {

	    text: null,
	    stage: null,

	    initialize: function(stage, color) {
		    createjs.Ticker.addListener(this);
			var text = this.text = new Text("--", "24px Arial bold", color==null?"#FFFFFF":color);
		    text.textBaseline = "alphabetic";
			text.maxWidth = 200;
			text.y = 24;
			text.x = 5;
			this.stage = stage;
			stage.addChild(text);
	    },

	    tick: function(){
	        //[SB] Why doesn't this work?
	        //stage.setChildIndex(text, stage.getNumChildren());
		    var stage = this.stage;
		    var text = this.text;
	        if(stage.getChildIndex(text)+1 < stage.getNumChildren()){
	            stage.addChild(text);
	        }
	        text.text = createjs.Ticker.getMeasuredFPS() + 0.5 | 0;
	    },

	    toString: function() {
		    return "[GameLibs.FPSMeter]";
	    }

	}

	scope.FPSMeter = FPSMeter;

}(window.GameLibs))