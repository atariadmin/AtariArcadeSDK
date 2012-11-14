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

(function (scope) {

	/**
	 * The ArcadeButton provides a simple way to show an on-screen button that is clickable,
	 * and interacts directly with the GamePad.
	 * @class ArcadeButton
	 * @param {String} button The button mapping in GamePad
	 * @param {Rectangle} hitArea
	 * @param {SpriteSheet | Object} image The SpriteSheet or image object (containing the source and regX, regY)
	 *      that defines the skin of the button.
	 * @param {String} name The button name, which will map to the spritesheet state
	 * @param {Object} params An object defining other button params, such as:
	 *      <ol><li>hoverSuffix: The suffix to add to provide a separate hover state. The default value is "-hover".</li>
	 *      <li>disabledSuffix: The suffix to add to provide a separate disabled state. The default value is "-disabled"</li>
	 *      <li>alpha: The default button alpha. The default value is 0.5. This is ignored when a hover state is defined.</li>
	 *      <li>hitAlpha: The alpha when the button is pressed. The default value is 1. This is ignored when a hover state is defined.</li>
	 *      <li>disabledAlpha: The alpha when the button is disabled. The default value is 0.2. This is ignored when a default state is defined.</li></ol>
	 * @constructor
	 */
	function ArcadeButton(button, hitArea, image, name, params) {
		this.initialize(button, hitArea, image, name, params);
	}

	// TODO: Figure out how to differentiate a click from a press-releaseoutside with GamePad.
	// Right now there is just press and release.

	var s = ArcadeButton;

	s.DEFAULT_ALPHA = 0.5;
	s.HOVER_ALPHA = 1;
	s.DISABLED_ALPHA = 0.2;

	var p = ArcadeButton.prototype = {

		button: null,
		hitArea: null,
		pressed: false,
		dragging: false,

		/**
		 * Determines if the button can be interacted with. Do not set this property, instead use the
		 * setDisabled() API.
		 * @property disabled
		 * @type Boolean
		 * @default false
		 * @readonly
		 */
		disabled: false,
		name: null,

		hoverSuffix: "-hover",
		disabledSuffix: "-disabled",

		/**
		 * The display sprite to add to stage. Do not add the ArcadeButton instance itself, that
		 * will cause errors in EaselJS.
		 * @property sprite
		 * @type Container
		 */
		sprite: null,
		buttonSprite: null,

		alpha:s.DEFAULT_ALPHA,
		hoverAlpha:s.HOVER_ALPHA,
		disabledAlpha:s.DISABLED_ALPHA,

		hoverState: null,
		disabledState: null,

		/**
		 * A callback to fire when the button is pressed.
		 * @property callback
		 * @type Function
		 */
		callback: null,

		initialize: function(button, hitArea, image, name, params) {
			this.button = button;
			this.hitArea = hitArea;
			this.image = image;
			this.name = name;

			if (params != null) {
				if (params.alpha != null) { this.alpha = params.alpha; }
				if (params.hoverAlpha != null) { this.hoverAlpha = params.hoverAlpha; }
				if (params.disabledAlpha != null) { this.disabledAlpha = params.disabledAlpha; }
				if (params.hoverSuffix != null) { this.hoverSuffix = params.hoverSuffix; }
				if (params.disabledSuffix != null) { this.disabledSuffix = params.disabledSuffix; }
			}

			if (image != null && image instanceof SpriteSheet) {
				this.buttonSprite = new createjs.BitmapAnimation(image);
				this.buttonSprite.gotoAndStop(name);
				var animations = image.getAnimations();
				if (animations.indexOf(name+this.hoverSuffix)>-1) {
					this.hoverState = name + this.hoverSuffix;
				}
				if (animations.indexOf(name+this.disabledSuffix)>-1) {
					this.disabledState = name + this.disabledSuffix;
				}

			} else if (image != null) {
				this.buttonSprite = new createjs.Bitmap(image.src);
				this.buttonSprite.regX = image.regX;
				this.buttonSprite.regY = image.regY;
			}

			this.sprite = new createjs.Container();
			var hs = this.sprite;
			if (hitArea != null) {
				hs = new createjs.Shape();
				var ha = new createjs.Shape(new createjs.Graphics().f("#000").dr(this.hitArea.x, this.hitArea.y, this.hitArea.width, this.hitArea.height));
				hs.hitArea = ha;
				this.sprite.addChild(hs);
			}
			hs.onPress = Atari.proxy(this.handlePress, this);
			this.draw();
		},

		draw: function() {
			if (this.buttonSprite == null) {
				this.buttonSprite = new createjs.Shape(new createjs.Graphics().f("#f00").dc(0,0,30));
			}
			if (this.hoverState == null) {
				this.buttonSprite.alpha = this.alpha;
			}
			this.sprite.addChild(this.buttonSprite);
		},

		handlePress: function(event) {
			if (this.disabled) { return; }
			this.pressed = true;
			this.dragging = false;

			if (this.hoverState != null) {
				this.buttonSprite.gotoAndStop(this.hoverState);
			} else {
				this.buttonSprite.alpha = this.hoverAlpha;
			}
			if (this.button != null) {
				GameLibs.GamePad.player.setButtonDown(this.button);
			}
			event.onMouseUp = Atari.proxy(this.handleRelease, this);
			event.onMouseMove = Atari.proxy(this.handleDrag, this);
		},

		handleDrag: function(event) {
			if (!this.dragging) {
				GameLibs.GameUI.startDrag();
				this.dragging = true;
			}
		},

		handleRelease: function(event) {
			if (this.disabled) { return; }
			this.pressed = false;
			if (this.hoverState != null) {
				this.buttonSprite.gotoAndStop(this.name);
			} else {
				this.buttonSprite.alpha = this.alpha;
			}
			if (this.button != null) {
				GameLibs.GamePad.player.setButtonUp(this.button);
			}
			if (this.callback != null) {
				this.callback();
			}
			GameLibs.GameUI.stopDrag();
		},

		setDisabled: function(value) {
			this.disabled = value;
			if (value && this.disabledSprite != null) {
				this.buttonSprite.gotoAndStop(this.disabledState);
			} else if (!value && this.hoverState != null) {
				this.buttonSprite.gotoAndStop(this.name);
			} else {
				this.buttonSprite.alpha = value ? this.disabledAlpha : this.alpha;
			}
		},

		setPosition: function(x, y) {
			this.buttonSprite.x = x;
			this.buttonSprite.y = y;
		},

		toString:function () {
			return "[GameLibs.ArcadeButton]";
		}

	}

	scope.ArcadeButton = ArcadeButton;

}(window.GameLibs))