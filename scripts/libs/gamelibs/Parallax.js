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
	 * The Parallax class creates and manages a set of layers to create a parallax effect.
	 * @class Parallax
	 * @param {Array} levels A list of parallax levels, which contains:
	 * <ol>
	 *     <li>A src path for displaying the background</li>
	 *     <li>A width which is the image width to be used when panning</li>
	 *     <li>...Other rules for scaling TBD</li>
	 * </ol>
	 * @constructor
	 */
	function Parallax(levels) {
		this.initialize(levels);
	}

	var s = Parallax;
	var p = Parallax.prototype = {

		/**
		 * A list of the layers that are created in the core background DIV class.
		 * @property layers
		 * @type Array
		 * @protected
		 */
		layers: null,

		/**
		 * A list of the parallax levels.
		 * @property levels
		 * @type Array
		 * @protected
		 */
		levels: null,

		/**
		 * The width of the effect, which is the width of the container DIV
		 * @property width
		 * @type Number
		 */
		width: 0,

		/**
		 * The height of the effect, which is the height of the container DIV
		 * @property height
		 * @type Number
		 */
		height: 0,

		/**
		 * Initialize the effect.
		 * @method initialize
		 * @param levels
		 * @protected
		 */
		initialize:function (levels) {
			var background = document.getElementById("background");
			this.width = background.style.width.split("px").join("");
			this.height = background.style.height.split("px").join("");

			this.levels = levels;
			this.layers = [];
			for(var i = 0, l = this.levels.length; i < l; i++) {
				var level = levels[i];
				var div = document.createElement("div");
				background.appendChild(div);
				div.id = "parallax_"+i;
				div.style.position = "absolute";
				div.style.backgroundImage = "url('" + level.src + "')";
				div.style.backgroundRepeat = "no-repeat";
				div.style.width = this.width+"px";
				div.style.height = this.height+"px";
				div.style.border = "1px solid #f00";
				this.layers.push(div);
			}

			this.setPosition(0.5, true);
			createjs.Ticker.addListener(this);
		},

		/**
		 * Set the position of the effect. Currently, this is just a horizontal position. The position
		 * will align all the layers.
		 * @method setPosition
		 * @param {Number} position The position (0-1) of the effect.
		 * @param {Boolean} Whether to refresh immediately (true), or tween to the new position (false). The
		 * default is false.
		 */
		setPosition: function(position, refresh) {
			this.targetPosition = position;
			if (refresh == true) {
				this.currentPosition = position;
				this.update();
			}
		},

		/**
		 * Tick the effect. When tweening, this moves the current position closer to the target. Once the target
		 * has reached ~1 pixel, it will stop.
		 * @method tick
		 * @protected
		 */
		tick: function() {
			var dif = this.targetPosition-this.currentPosition;
			var dist = Math.abs(dif);
			if (dist == 0) {
				return;
			} else if (dist < 0.001) {
				this.currentPosition = this.targetPosition;
			} else {
				this.currentPosition = this.currentPosition + dif/10;
			}
			this.update();
		},

		/**
		 * Update the effect. The position has changed, so redraw the layers.
		 * @method update
		 * @protected
		 */
		update: function() {
			for(var i = 0, l = this.levels.length; i < l; i++) {
				var level = this.levels[i];
				var layer = this.layers[i];
				// For now, horizontal
				layer.style.backgroundPosition = (-(level.width-this.width)*this.currentPosition+0.5|0) + "px " + level.align;
			}
		},

		toString:function () {
			return "[Parallax]";
		}

	}

	scope.Parallax = Parallax;

}(window.GameLibs))