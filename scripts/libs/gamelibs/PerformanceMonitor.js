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
	 * A component which monitors the performance of the game, and toggles low quality
	 * mode if the
	 * @class PerformanceMonitor
	 * @param {Function} callback A function to fire when the performance is deemed to be unacceptable.
	 * @param {Number} threshold The amount of time in milliseconds that the game is allowed to have poor FPS
	 *      before it toggles low quality.
	 * @constructor
	 */
	var PerformanceMonitor = function(callback, minFPS, threshold) {
		this.initialize(callback, minFPS, threshold);
	}

	var s = PerformanceMonitor;

	/**
	 * The default threshold value
	 * @property DEFAULT_THRESHOLD
	 * @type {Number}
	 * @default 3000
	 * @static
	 */
	s.DEFAULT_THRESHOLD = 3000;

    var p = PerformanceMonitor.prototype = {

	    maxMs: null,

	    /**
	     * The minimum FPS allowed.
	     * @property minFPS
	     * @type Number
	     * @default 30
	     */
	    minFPS: 30,

	    /**
	     * The number of milliseconds that can pass before the low quality mode is toggled.
	     * @property threshold
	     * @type Number
	     * @default 3000
	     */
	    threshold:s.DEFAULT_THRESHOLD,

	    /**
	     * The method to call when the game enters low quality mode. It is recommended to use a proxy
	     * method to maintain scope. The callback takes a single argument, which indicates if the game
	     * is in low quality mode.
	     * @property callback
	     * @type Function
	     */
	    callback: null,

	    /**
	     * If the game is currently in low quality mode.
	     * @property lowQualityMode
	     * @type Boolean
	     * @default false
	     */
		lowQualityMode: false,

	    /**
	     * The amount of time that has elapsed since the framerate has been acceptable.
	     * @property timeOnLow
	     * @type Number
	     * @default 0
	     */
		timeOnLow: 0,

	    initialize: function(callback, minFPS, threshold) {

		    this.callback = callback;
		    if(!isNaN(threshold)) { this.threshold = threshold; }
		    if(!isNaN(minFPS)){ this.minFPS = minFPS; }

		    this.maxMs = 1000 / minFPS;

		    this.prevTime = createjs.Ticker.getTime();
		    createjs.Ticker.addListener(this);
	    },

	    /**
	     * Reset the PerformanceMonitor. This happens whenever a game is restarted or continued.
	     * Note: Currently NOT implemented in any games.
	     * @method reset
	     */
	    reset: function() {
			this.timeOnLow = 0;
		    this.lowQualityMode = false;
		    this.prevTime = createjs.Ticker.getTime();
		    createjs.Ticker.setFPS(60); //TODO: This should lookup the actual FPS we need.
		    createjs.Ticker.addListener(this);

		    this.callback(false);
	    },

	    tick: function(){
			var deltaT = createjs.Ticker.getTime() - this.prevTime;
		    this.prevTime = createjs.Ticker.getTime();
			if(deltaT < 200 && deltaT > this.maxMs){
				this.timeOnLow += deltaT;
				if(this.timeOnLow > this.threshold) {
					/*
					Atari.trace("*** Low Quality Mode toggled.")
					*/
					this.lowQualityMode = true;
					this.callback(true);
					createjs.Ticker.setFPS(30);
					createjs.Ticker.removeListener(this);
				}
			} else {
				this.timeOnLow = 0;
			}
	    }
	}

	scope.PerformanceMonitor = PerformanceMonitor;

}(window.GameLibs))