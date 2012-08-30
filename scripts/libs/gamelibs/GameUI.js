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

/** @module GameLibs */
(function(scope) {

	/**
	 * The GameUI class provides an API to modify and control the user interface.
	 * @class GameUI
	 */
	function GameUI() {}
	var s = GameUI;

	s.background = null;

	/**
	 * Initializes the UI. This is called by the GameBootstrap before the game is instantiated.
	 * @method initialize
	 * @param {Number} w The stage width
	 * @param {Number} h The stage height
	 * @protected
	 */
	s.initialize = function(w, h) {
		this.width = w;
		this.height = h;
		s.background = document.getElementById("background");
		s.background.style.width = w + "px";
		s.background.style.height = h + "px";
	}

	/**
	 * Change the background. The background is better suited to live in an HTML DIV
	 * instead of the canvas. The background DIV is sized to the same dimensions as the
	 * Stage. Changing the background results in a "snap" change to the new image - there
	 * is no transition.
	 * @method changeBackground
	 * @param {HTMLImageElement|String} src The path or Image element to use as a background.
	 */
	s.changeBackground = function(src) {
		var path = src;
		if (src == null) { return; }
		if (typeof(src) == "string") {
			path = src;
		} else if (src.src != null) {
			path = src.src;
		}
		s.background.style.backgroundImage = "url('"+path+"')";
	}

	s.blur = function(stage) {
		var bg = new Container();
		var div = document.getElementById("background");

		this.drawChild(div, bg);

		var children = div.children;
		for(var i = 0, l = children.length; i < l; i++) {
			var child = children[i];
			if (child instanceof HTMLDivElement) {
				this.drawChild(child, bg);
			}
		}

		stage.addChildAt(bg, 0);
		stage.update();

		var bbf = new BoxBlurFilter(10,10, 1);
		bbf.applyFilter(stage.canvas.getContext('2d'), 0,0,this.width,this.height);
		stage.removeChild(bg);
	}

	s.drawChild = function(child, container) {
		if (child.style.backgroundImage == null) { return; }
		var match = child.style.backgroundImage.match(/\(([^)]+)/);
		if (match == null) { return; }
		var url = match[1];
		var left= 0, top = 0;
		var pos = child.style.backgroundPosition;
		if (pos != null) {
			var parts = pos.split(" ");
			match = parts[0].match(/(?:-)?(\d+)px/);
			var left = match ? match[1] : 0;
			if (parts[1] != null) {
				match = parts[1].match(/(?:-)?(\d+)px/);
				var top = match ? match[1] : 0;
			}
		}
		var bmp = new Bitmap(url);
		bmp.sourceRect = new Rectangle(-left,-top,this.width,this.height);
		container.addChild(bmp);
	}

	/**
	 * Notify the framework that the mouse is beginning to drag. This will ensure that the mouse focus
	 * can not get lost in iframes. Note that you MUST call stopDrag when the drag is complete.
	 * @method startDrag
	 */
	s.startDrag = function() {
		Atari.gameMediator.handleGameEvent(Atari.GameMediator.START_DRAG);
	}

	/**
	 * Notify the framework that a mouse drag has completed. This must be called if the startDrag was
	 * called at the start of a drag.
	 * @method stopDrag
	 */
	s.stopDrag = function() {
		Atari.gameMediator.handleGameEvent(Atari.GameMediator.STOP_DRAG);
	}

	scope.GameUI = GameUI;

}(window.GameLibs))