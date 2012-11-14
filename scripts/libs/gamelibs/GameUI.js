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
	 * The GameUI class provides an API to modify and control the user interface.
	 * @class GameUI
	 */
	function GameUI() {}
	var s = GameUI;

	s.background = null;
	s.STRETCH = "stretch";
	s.SCALE = "scale";
	s.CROP = "crop";

	//Align
	s.CENTER = "C";
	//Specifies that the CLIP is aligned at the center.
	s.CENTER_TOP = "CT";
	//Specifies that the CLIP is aligned at center-top.
	s.CENTER_LEFT = "CL";
	//Specifies that the CLIP is aligned at center-left corner.
	s.CENTER_RIGHT = "CR";
	//Specifies that the CLIP is aligned at center-right corner.
	s.BOTTOM = "B";
	//Specifies that the CLIP is aligned at the bottom.
	s.BOTTOM_LEFT = "BL";
	//Specifies that the CLIP is aligned in the bottom-left corner.
	s.BOTTOM_RIGHT = "BR";
	//Specifies that the CLIP is aligned in the bottom-right corner.
	s.TOP_LEFT = "TL";
	//Specifies that the CLIP is aligned in the top-left corner.
	s.TOP_RIGHT = "TR";
	//Specifies that the CLIP is aligned in the top-right corner.

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
	 * @param {Number} width The width of the viewport.
	 * @param {Number} height The height of the viewport.
	 * @param {String} fit The mode to fit the image into the viewport.
	 * <ul>
	 *     <li>stretch (default): Match the width and height of the viewport. This will augement the image
	 *          if the ratios do not match.</li>
	 *     <li>scale: Scale the image to fit in the viewport. Additional space may be visible on the outer
	 *          edge of the image.</li>
	 *     <li>crop: Scale the image to fill the viewport. Parts of the image will be cropped out.</li>
	 * </ul>
	 * @param {String} align The mode to align the image if it does not fit perfectly.
	 */
	s.changeBackgroundOld = function(src) {
		var path = src;
		if (src == null) { return; }
		if (typeof(src) == "string") {
			path = src;
		} else if (src.src != null) {
			path = src.src;
		}
		s.background.style.backgroundImage = "url('"+path+"')";
	}
	s.changeBackground = function(src, width, height, fit, align) {
		var bmp = new createjs.Bitmap(src);

		var w = bmp.image.width;
		var h = bmp.image.height;
		var scale = 1;
		// For now just stretch
		if (fit == "stretch") {
			bmp.scaleX = width/w;
			bmp.scaleY = height/h;
		} else if (fit == "scale") {
			var ir = width/height;
			var r = w/h;
			if (ir < r) {
				bmp.scaleX = bmp.scaleY = width/w;
				//bmp.y = ?
			} else {
				bmp.scaleX = bmp.scaleY = height/h;
				//bmp.x = ?
			}
		} else if (fit == "crop") {
			var ir = width/height;
			var r = w/h;
			if (ir > r) {
				bmp.scaleX = bmp.scaleY = width/w;

			} else {
				bmp.scaleX = bmp.scaleY = height/h;
			}
			scale = bmp.scaleX;
		}
		//Alignment types.
		switch(align) {
			case s.BOTTOM:
				bmp.x = width - (w*scale)>>1;
				bmp.y = height - h;
				break;
			case s.BOTTOM_LEFT:
				bmp.x = 0;
				bmp.y = height - h;
				break;
			case s.BOTTOM_RIGHT:
				bmp.x = width - w*scale;
				bmp.y = height - h;
				break;
			case s.CENTER_TOP:
				bmp.x =  width - (w*scale) >> 1;
				bmp.y = 0;
				break;
			case s.CENTER_LEFT:
				bmp.x = 0;
				bmp.y = height - (h*scale)>>1;
				break;
			case s.CENTER_RIGHT:
				bmp.x = width - w*scale;
				bmp.y = height - (h*scale)>>1;
				break;
			case s.CENTER:
				bmp.x = width - (w*scale) >> 1;
				bmp.y = height - (h*scale) >> 1;
				break;
			case s.TOP_LEFT:
				bmp.x = 0;
				bmp.y = 0;
				break;
			case s.TOP_RIGHT:
				bmp.x =  width - w*scale;
				bmp.y = 0;
				break;
		}
		return bmp;
	}

	s.blur = function(stage) {
		var bg = new createjs.Container();
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

		var bbf = new createjs.BoxBlurFilter(10,10, 1);
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
		var bmp = new createjs.Bitmap(url);
		bmp.sourceRect = new createjs.Rectangle(-left,-top,this.width,this.height);
		container.addChild(bmp);
	}

	/**
	 * Notify the framework that the mouse is beginning to drag. This will ensure that the mouse focus
	 * can not get lost in iframes. Note that you MUST call stopDrag when the drag is complete.
	 * @method startDrag
	 */
	s.startDrag = function() {
		//Atari.gameMediator.handleGameEvent(Atari.GameMediator.START_DRAG);
	}

	/**
	 * Notify the framework that a mouse drag has completed. This must be called if the startDrag was
	 * called at the start of a drag.
	 * @method stopDrag
	 */
	s.stopDrag = function() {
		//Atari.gameMediator.handleGameEvent(Atari.GameMediator.STOP_DRAG);
	}

	scope.GameUI = GameUI;

}(window.GameLibs))