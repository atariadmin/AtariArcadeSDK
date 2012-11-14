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
	 * The Throttle is a single-axis controller that can be used both vertically and
	 * horizontally. Ensure that the throttle.sprite is added to the stage after it is created.
	 * @class Throttle
	 * @param {Rectangle} hitArea The hit area that triggers the throttle action if autoHide=false.
	 * @param {String} direction The axis for the throttle (Throttle.HORIZONTAL or Throttle.VERTICAL). The default is vertical.
	 * @param {Object} params An object that defines the available parameters:
	 *      <ol><li>controlDirection: Whether the throttle causes buttonDown/buttonUp behaviour automatically. The default is true.</li>
	 *      <li>autoHide: If the throttle hides by default, and is displayed when the user presses the hit area. The default is false.
	 *          Note that a hitArea MUST be defined to use autoHide.</li>
	 *      <li>radius: The distance the throttle moves from the center. The default value is 45.</li>
	 *      <li>pullRadius: The distance the user can move in order to pull the thumb to 100%. The default value is 100.</li>
	 *      <li>minimumDistance: The minimum distance (as a percent) the user must pull the thumb to be considered a change in direction.
	 *          The default value is 0.1 (10%)</li></ol>
	 * @param {SpriteSheet | Object} images The images that define the Throttle skins:
	 *      <ol><li>base: The base skin</li>
	 *      <li>thumb: The draggable knob</li></ol>
	 * @constructor
	 */
	function Throttle(hitArea, direction, params, images) {
		this.initialize(hitArea, direction, params, images);
	}

	var s = Throttle;

	/**
	 * Defines the vertical throttle mode.
	 * @property VERTICAL
	 * @type {String}
	 * @default vertical
	 * @static
	 */
	s.VERTICAL = "vertical";
	/**
	 * Defines the horizontal throttle mode.
	 * @property HORIZONTAL
	 * @type {String}
	 * @default horizontal
	 * @static
	 */
	s.HORIZONTAL = "horizontal";

	// Defaults
	s.RADIUS = 45;
	s.PULL_RADIUS = 100;
	s.MINIMUM_DISTANCE = 0.1;

	var p = Throttle.prototype = {

		hitArea: null,
		direction:s.VERTICAL,

		radius:s.RADIUS,
		pullRadius:s.PULL_RADIUS,
		controlDirection: true,
		autoHide: false,
		minimumDistance:s.MINIMUM_DISTANCE,

		throttle: null,
		spritesheet: null,
		dragProps: null,

		pad: null,
		thumb: null,

		/**
		 * A reference to the throttle sprite, which needs to be added to an EaselJS container on the stage
		 * or the stage itself to be used.
		 * @property sprite
		 * @type Container
		 */
		sprite: null,

		/**
		 * The current distance from the center to the throttle position.
		 * @property currentDistance
		 * @type Number
		 * @default 0
		 */
		currentDistance: 0,

		/**
		 *  The current direction (1, 0, or -1) of the throttle.
		 *  @property currentDirection
		 *  @type Number
		 */
		currentDirection: 0,

		/**
		 * Determines if the throttle is currently being pressed.
		 * @property buttonActive
		 * @type Boolean
		 * @default false
		 */
		buttonActive: false,
		dragActive: false,

		isVertical: true,

		initialize:function (hitArea, direction, params, images) {
			this.direction = direction;

			// params
			this.controlDirection = (params.controlDirection != false);
			this.autoHide = (params.autoHide == true);
			if (params.radius != null) { this.radius = params.radius; }
			if (params.pullRadius != null) { this.pullRadius = params.pullRadius; }
			if (params.mininumDistance != null) { this.minimumDistance = params.minimumDistance; }

			this.isVertical = (direction == s.VERTICAL);
			this.dragProps = new createjs.Point();

			// Images
			if (images != null && images instanceof createjs.SpriteSheet) {
				this.spritesheet = images;
				var suffix = params.suffix || "";
				var names = this.spritesheet.getAnimations();
				if (names.indexOf("pad"+suffix) > -1) {
					this.pad = new createjs.BitmapAnimation(this.spritesheet);
					this.pad.gotoAndStop("pad"+suffix);
				}
				if (names.indexOf("thumb"+suffix) > -1) {
					this.thumb = new createjs.BitmapAnimation(this.spritesheet);
					this.thumb.gotoAndStop("thumb"+suffix);
				}
			} else if (images != null) {
				var img = images.pad;
				if (img) {
					this.pad = new createjs.Bitmap(img.src);
					this.pad.regX = img.regX;
					this.pad.regY = img.regY;
				}
				img = images.thumb;
				if (img) {
					this.thumb = new createjs.Bitmap(img.src);
					this.thumb.regX = img.regX;
					this.thumb.regY = img.regY;
				}
			}

			this.sprite = new createjs.Container();
			var hs = this.sprite;
			if (this.autoHide) {
				var hs = new createjs.Shape();
				var ha = this.hitArea = new createjs.Shape(new createjs.Graphics().f("#000000").dr(hitArea.x, hitArea.y, hitArea.width, hitArea.height));
				hs.hitArea = ha;
				this.sprite.addChild(hs);
			}
			this.sprite.onPress = Atari.proxy(this.handleThrottlePress, this);
			this.draw();
		},

		draw: function() {
			var throttle = this.throttle = new createjs.Container();
			if (this.autoHide) {
				throttle.visible = false;
				throttle.alpha = 0.5; //TODO: Make this a param.
			}

			var pad = this.pad;
			if (pad == null) {
				var pad = new createjs.Shape(new createjs.Graphics().f("#666").dr(-50,-50,100,100).f("#000").dr(-10,-45, 20, 90));
				if (!this.isVertical) { pad.rotation = 90; }
			}
			throttle.addChild(pad);

			var thumb = this.thumb;
			if (thumb == null) {
				var thumb = this.thumb = new createjs.Shape(new createjs.Graphics().f("#f00").dc(0,0,30));
			}
			throttle.addChild(thumb);

			this.sprite.addChild(throttle);
		},

		/**
		 * Set the throttle x and y position. This is only necessary if the "autoHide" property is false.
		 * @method setPosition
		 * @param {Number} x The horizontal position on pixels
		 * @param {Number} y The vertical position in pixels.
		 */
		setPosition: function(x, y) {
			this.sprite.x = x;
			this.sprite.y = y;
		},

		handlePress: function(event) {
			this.sprite.visible = true;
			this.setPosition(event.stageX, event.stageY);
			this.handleThrottlePress(event);
		},

		handleThrottlePress: function(event) {
			event.onMouseMove = Atari.proxy(this.handleDrag, this);
			event.onMouseUp = Atari.proxy(this.handleRelease, this);
			this.buttonActive = true;
			this.dragProps.setTo(event.stageX-this.thumb.x, event.stageY-this.thumb.y);
			GameLibs.GameUI.startDrag();
		},

		handleDrag: function(event) {
			var lastDirection = this.currentDirection;
			var prop = this.isVertical ? event.rawY - this.dragProps.y : event.rawX - this.dragProps.x;
			var dif = Math.max(-this.pullRadius, Math.min(this.pullRadius, prop));
			this.currentDistance = dif / this.pullRadius;
			if (Math.abs(this.currentDistance) > this.minimumDistance) {
				this.currentDirection = (dif > 0) ? 1 : -1;
				this.dragActive = true;
			} else {
				this.currentDirection = 0;
				this.dragActive = false;
			}

			if (this.isVertical) {
				this.thumb.y = this.currentDistance * this.radius;
			} else {
				this.thumb.x = this.currentDistance * this.radius;
			}

			var pad = GameLibs.GamePad;
			var player = pad.player;
			if (this.controlDirection && lastDirection != this.currentDirection) {
				if (this.currentDirection == 1) {
					player.setButtonDown(this.isVertical ? pad.DOWN : pad.RIGHT);
					player.setButtonUp(this.isVertical ? pad.UP : pad.LEFT);
				} else if (this.currentDirection == -1) {
					player.setButtonDown(this.isVertical ? pad.UP : pad.LEFT);
					player.setButtonUp(this.isVertical ? pad.DOWN : pad.RIGHT);
				} else {
					this.isVertical ? player.setButtonsUp(pad.UP, pad.DOWN) : player.setButtonsUp(pad.LEFT, pad.RIGHT);
				}
			}
		},

		handleRelease: function(event) {
			this.buttonActive = false;
			this.dragActive = false;
			if (this.autoHide) {
				this.sprite.visible = false;
				this.thumb.x = this.thumb.y = 0;
			} else {
				createjs.Tween.get(this.thumb).to({x:0, y:0}, 300, createjs.Ease.bounceOut);
			}

			var pad = GameLibs.GamePad;
			var player = pad.player;
			this.currentDirection = 0;
			this.isVertical ? player.setButtonsUp(pad.UP, pad.DOWN) : player.setButtonsUp(pad.LEFT, pad.RIGHT);
			GameLibs.GameUI.stopDrag();
		},

		toString:function () {
			return "[GameLibs.Throttle]";
		}

	}

	scope.Throttle = Throttle;

}(window.GameLibs))