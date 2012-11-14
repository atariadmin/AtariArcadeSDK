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

/** @module gskinner */
(function(scope) {

	/**
	 * The Proximity Manager breaks the canvas up into a grid of a specific size,
	 * and when updated, stores the contents (sprites) into their grid positions,
	 * making proximity detection a lot faster and lighter weight.
	 * @class ProximityManager
	 * @param {Number} gridSize The size of the grid to use. It should be larger than the
	 * width and height of the sprites that are added to it.
	 * @constructor
	 */
	function ProximityManager(gridSize) {
		this.initialize(gridSize);
	}

	ProximityManager.prototype = {

		/**
		 * The size of the current grid. This must be set when the ProximityManager is
		 * created, and can not be changed later. The proximity manager only deals in
		 * positions, and does not account for size, so the grid size should be larger than
		 * the full width or height of the largest sprite in the grid.
		 * @property gridSize
		 * @type Number
		 * @default 25
		 */
		gridSize: 25,

		/**
		 * A list of game sprites contained in the grid.
		 * @property sprites
		 * @type Array
		 * @protected
		 */
		sprites: null,

		/**
		 * A 2-dimensional list of "positions", which shows where the sprite lives on the grid.
		 * @property pos
		 * @type Array
		 * @protected
		 */
		pos: null,

	// initialization:
		initialize: function(gridSize) {
			this.gridSize = (gridSize != null && !isNaN(gridSize) && gridSize > 0) ? gridSize : this.gridSize;
			this.sprites = [];
			this.pos = [];
		},

		/**
		 * Return a string formatted list of the contents of the grid for debugging.
		 * @method list
		 * @return {String} The string output of the grid.
		 */
		list: function() {
			var t = "\nClips: " + this.sprites.length;
			for(var i= 0, l=this.sprites.length; i<l; i++) {
				var sprite = this.sprites[i];
				var x = Math.ceil(sprite.x/this.gridSize);
				var y = Math.ceil(sprite.y/this.gridSize);
				t += "\n* " + this.sprites[i] + " ("+x+","+y+")" + " sprite.x: " + sprite.x + ", sprite.y: " + sprite.y;
			}
			return t;
		},

		/**
		 * Get an object's neighbouring objects in the surrounding grid squares. Sprites in the same grid, and
		 * the squares above, below, left, right, and on all corners are returned.
		 * @method getNeighbours
		 * @param {Object} sprite A sprite in the grid.
		 * @return {Array} A list of neighbouring objects in the surrounding grid squares (9 total squares)
		 */
		getNeighbours: function(sprite) {
			var x = Math.ceil(sprite.x/this.gridSize);
			var y = Math.ceil(sprite.y/this.gridSize);
            
			var p = this.pos;
			var r = [];

			if (p[x-1]) {
				if (p[x-1][y-1]) { r = r.concat(p[x-1][y-1]); }
				if (p[x-1][y]) { r = r.concat(p[x-1][y]); }
				if (p[x-1][y+1]) { r = r.concat(p[x-1][y+1]); }
			}
			if (p[x]) {
				if (p[x][y]) { r = r.concat(p[x][y]); }
				if (p[x] && p[x][y-1]) { r = r.concat(p[x][y-1]); }
				if (p[x][y+1]) { r = r.concat(p[x][y+1]); }
			}
			if (p[x+1]) {
				if (p[x+1][y-1]) { r = r.concat(p[x+1][y-1]); }
				if (p[x+1][y]) { r = r.concat(p[x+1][y]); }
				if (p[x+1][y+1]) { r = r.concat(p[x+1][y+1]); }
			}

			return r;
		},

		/**
		 * Add a sprite to the grid.
		 * @method addItem
		 * @param {Object} sprite An object containing an x and y property.
		 */
		addItem: function(sprite) {
			this.sprites.push(sprite);
		},

		/**
		 * Remove a sprite from the grid.
		 * @method removeItem
		 * @param {Object} sprite An object that is on the grid.
		 */
		removeItem: function(sprite) {
			var i = this.sprites.length;
			while (i--) {
				if (this.sprites[i] == sprite) {
					this.sprites.splice(i,1);
					return;
				}
			}
		},

        /**
         * Remove a sprite from the grid.
         * @method removeItem
         * @param {Object} sprite An object that is on the grid.
         */
        removeAllItems: function() {
            this.sprites.length = 0;
        },

		/**
		 * Refresh the positions in the grid. This method is <b>not</b> called automatically
		 * so it is up to the developer to call it when sprite properties (x or y) change.
		 * Ensure that this method is called before <b>getNeighbours()</b> is called.
		 * @method refresh
		 */
		refresh: function() {
			// calculate grid positions:
			var m = this.sprites;
			var p = [];
			var i = m.length;
			while (i--) {
				var sprite = m[i];
				var x = Math.ceil(sprite.x/this.gridSize);
				var y = Math.ceil(sprite.y/this.gridSize);
				if (!p[x]) { p[x] = []; }
				if (!p[x][y]) { p[x][y] = [sprite]; continue; }
				p[x][y].push(sprite);
			}
			this.pos = p;
		},

		/**
		 * Get the number of sprites in the grid.
		 * @method getLength
		 * @return {Number} The number of sprites in the grid.
		 */
		getLength: function() {
			return this.sprites.length;
		}

	}

	scope.ProximityManager = ProximityManager;

}(window.GameLibs))