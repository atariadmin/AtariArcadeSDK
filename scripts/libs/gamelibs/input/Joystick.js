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
	 * The joystick component displays an on-screen joystick controller, which can be easily skinned.
	 * The controller provides 9-way keyboard-style controls (up, left, down, right, and 4 corners).
	 * Additionally, the joystick provides angle and distance information that can be polled, as
	 * well as a "buttonActive" state. Ensure that the joystick.sprite is added to the stage after it is created.
	 * @class JoyStick
	 * @param {Rectangle} rect A rectangle that defines the hit-area of the joystick when "autoHide" is true. The coordinates
	 *      of the rectangle are relative to the stage/container, not the joystick's position.
	 * @param {Object} params An object that defines additional properties of the joystick, including:
	 *  <ol><li>controlDirection: If the joystick should control the game direction by triggering button-down events.
	 *      The default value is true</li>
	 *  <li>autoHide: If the joystick should only show when the player presses the hitArea. It will appear where the
	 *      player presses. The default value is false.</li>
	 *  <li>showStick: If the joystick should add a "stick" line between the pad and thumb. The default value is true.</li>
	 *  <li>radius: The radius of the joystick draggable area. The default value is 50.</li>
	 *  <li>pullRadius: The amount you need to pull the joystick to bring it to 100% in any direction. This provides a less
	 *  precise drag area, or allows a smaller graphic. It is recommended that this is set whenever radius is set. The default
	 *  value is 100.</li>
	 *  <li>dragThreshold: The amount of the pullRadius that causes an actual drag. The default value is 0.3.</li></ol>
	 *  @param {SpriteSheet | Object} images A spritesheet that defines the joystick states, or an object containing images
	 *      and registration points (regX and regY) for each image. The available images are:
	 *      <ol><li>base: core graphic</li>
	 *      <li>thumb: draggable knob</li>
	 *      <li>pointer: points in joystick direction.</li></ol>
	 * @constructor
	 */
	function Joystick(stage, hitArea, params, images) {
		this.initialize(stage, hitArea, params, images);
	}
	var s = Joystick;

	s.RADIUS = 50;
	s.PULL_RADIUS = 100;
	s.DRAG_THRESHOLD = 0.2;

	var p = s.prototype = {


		hitArea: null,
		autoHide: false,
		autoMove: false,
		radius:s.RADIUS,
		pullRadius:s.PULL_RADIUS,
		dragThreshold:s.DRAG_THRESHOLD,
		currentState: null,
		newPosition: null,

		/**
		 * A reference to the joystick sprite, which needs to be added to an EaselJS container on the stage
		 * or the stage itself to be used.
		 * @property sprite
		 * @type Container
		 */
		sprite: null,

		/**
		 * The distance in "positive" pixels the joystick is currently dragged from center in positive pixels,
		 * regardless of direction.
		 * @property currentDistance
		 * @type Number
		 * @default 0
		 */
		currentDistance: 0,
		/**
		 * The distance the joystick is currently dragged from center in either direction,
		 * as a Point containing an X and Y ratios (-1 to 1) that the thumb is dragged from the center.
		 * @property currentAmount
		 * @type Point
		 * @default 0,0
		 */
		currentAmount: null,
		/**
		 * The current angle in degrees that the joystick is pointing.
		 * @property currentAngle
		 * @type Number
		 * @default 0
		 */
		currentAngle: 0,
		/**
		 * The current angle in radians that the joystick is pointing.
		 * @property currentRad`
		 * @type Number
		 * @default 0
		 */
		currentRad: 0,
		/**
		 * Detemines if the joystick is currently active (pressed by the user).
		 * @property buttonActive
		 * @type Boolean
		 * @default false
		 */
        buttonActive:false,

		/**
		 * Determines if the joystick is currently dragged passed the threshold.
		 * @property dragActive
		 * @type Boolean
		 * @default false
		 */
		dragActive: false,

		controlDirection: true,
		showStick: true,
		pullFactor: 1,

		spritesheet: null,
		thumb: null,
		pad: null,
		pointer: null,
		dragProps: null,


		initialize: function(hitArea, params, images) {
			this.controlDirection = (params.controlDirection != false);
			this.autoHide = (params.autoHide == true);
			this.autoMove = (params.autoMove == true);
			if (params.radius != null) { this.radius = params.radius; }
			if (params.pullRadius != null) { this.pullRadius = params.pullRadius; }
			if (params.dragThreshold != null) { this.dragThreshold = params.dragThreshold; }
			this.pullFactor = this.radius / this.pullRadius;
			this.showStick = (params.showStick != false);

			this.currentState = new createjs.Point(-1,-1);
			this.newPosition = new createjs.Point();
			this.currentAmount = new createjs.Point();
			this.dragProps = new createjs.Point();

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
				if (names.indexOf("pointer"+suffix) > -1) {
					this.pointer = new createjs.BitmapAnimation(this.spritesheet);
					this.pointer.gotoAndStop("pointer"+suffix);
				}
			} else if (images != null) {
				var img = images.base;
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
				img = images.pointer;
				if (img) {
					this.pointer = new createjs.Bitmap(img.src);
					this.pointer.regX = img.regX;
					this.pointer.regY = img.regY;
				}
			}


			this.sprite = new createjs.Container();
			var hs = this.sprite;
			if (this.autoHide || this.autoMove) {
				hs = new createjs.Shape();
				var ha = new createjs.Shape(new createjs.Graphics().f("#000000").dr(hitArea.x, hitArea.y, hitArea.width, hitArea.height));
				hs.hitArea = ha;
				this.sprite.addChild(hs);
			}
			hs.onPress = Atari.proxy(this.handleJoystickPress, this);
			this.draw();
			this.setState(0,0);
		},

		draw: function() {
			var joystick = this.joystick = new createjs.Container();

			if (this.autoHide || this.autoMove) {
				joystick.alpha = 0.5;
				if (this.autoHide) {
					joystick.visible = false;
				}
			}

			// Draw images
			var pad = this.pad;
			if (pad == null) {
				var pad = new createjs.Shape();
				var r = this.radius;
				pad.graphics.f("#666").drawRoundRect(-r,-r,r*2,r*2,10).ef();
				pad.graphics.f("#333").dc(0,0,15);
			}
			joystick.addChild(pad);

			var pointer = this.pointer;
			if (pointer != null) {
				joystick.addChild(pointer);
			}

			if (this.showStick) {
				this.stick = new createjs.Shape();
				joystick.addChild(this.stick);
			}

			var thumb = this.thumb;
			if (thumb == null) {
				this.thumb = new createjs.Shape(
					new createjs.Graphics().f("f00").dc(0,0,30).ef()
				);
			}
			joystick.addChild(this.thumb);

			this.sprite.addChild(joystick);
		},

		/**
		 * Set the joystick x and y position. This is only necessary if the "autoHide" property is false.
		 * @method setPosition
		 * @param {Number} x The horizontal position of the joystick center.
		 * @param {Number} y The vertical position of the joystick center.
		 */
		setPosition: function(x, y) {
			this.joystick.x = x;
			this.joystick.y = y;
		},

		handleJoystickPress: function(event) {
			if (this.autoHide || this.autoMove) {
				this.joystick.visible = true;
				this.setPosition(event.stageX, event.stageY);
			}
			event.onMouseMove = Atari.proxy(this.handleDrag, this);
			event.onMouseUp = Atari.proxy(this.handleRelease, this);
            this.buttonActive = true;
			this.dragProps.setTo(event.stageX-this.sprite.x-this.thumb.x, event.stageY-this.sprite.y-this.thumb.y);
		},

		handleDrag: function(event) {
			var pos = this.newPosition;
			pos.x = event.rawX - this.sprite.x - this.dragProps.x;
			pos.y = event.rawY - this.sprite.y - this.dragProps.y;

			this.currentRad = Math.atan2(pos.y, pos.x);
			var a = this.currentAngle = this.currentRad * GameLibs.Math2.RAD_TO_DEG;
			var d = this.currentDistance = Math.sqrt(pos.x*pos.x + pos.y*pos.y);

			if (this.pointer != null) {
				this.pointer.rotation = a;
			}

			this.dragActive = false;
			if (d < this.radius * this.dragThreshold) {
				this.setState(0,0);
				this.updateThumb();
				return;
			}

			this.dragActive = true;

			var h = 0, v = 0;
			var g = 27.5;
			if (a < g && a > -g) {
				// RIGHT
				h = 1;
			} else if (a > g && a < 90-g) {
				// DOWN-RIGHT
				h = 1;
				v = 1;
			} else if (a > 90-g && a < 90+g) {
				// DOWN
				v = 1;
			} else if (a > 90+g && a < 180-g) {
				// DOWN-LEFT
				h = -1;
				v = 1;
			} else if (a > 180-g || a < -180 + g) {
				// LEFT
				h = -1;
			} else if (a > -180+g && a < -90-g) {
				// UP-LEFT
				h = -1;
				v = -1;
			} else if (a > -90-g && a < -90+g) {
				// UP
				v = -1;
			} else {
				// UP-RIGHT
				h = 1;
				v = -1;
			}
			this.setState(h,v);
			this.updateThumb();
		},

		updateThumb: function() {
			var a = this.currentRad;
			var x = Math.cos(a) * Math.min(this.pullRadius, this.currentDistance);
			var y = Math.sin(a) * Math.min(this.pullRadius, this.currentDistance);
			this.currentAmount.setTo(x/this.pullRadius, y/this.pullRadius);
			this.thumb.x = x * this.pullFactor;
			this.thumb.y = y * this.pullFactor;
			this.showStick && this.stick.graphics.c().mt(0,0).ss(12).s("#000").lt(this.thumb.x,this.thumb.y);
		},

		setState: function(h, v) {
			if (this.currentState.x == h && this.currentState.y == v) { return; }
			this.currentState.x = h;
			this.currentState.y = v;

			if (!this.controlDirection) { return; }

			var player = GameLibs.GamePad.player;
			var pad = GameLibs.GamePad;
			switch(h) {
				case -1:
					player.setButtonDown(pad.LEFT);
					player.setButtonUp(pad.RIGHT);
					break;
				case 0:
					player.setButtonsUp(pad.LEFT, pad.RIGHT);
					break;
				case 1:
					player.setButtonDown(pad.RIGHT);
					player.setButtonUp(pad.LEFT);
					break;
			}
			switch (v) {
				case -1:
					player.setButtonDown(pad.UP);
					break;
				case 0:
					player.setButtonsUp(pad.UP, pad.DOWN);
					break;
				case 1:
					player.setButtonDown(pad.DOWN);
					player.setButtonUp(pad.UP);
					break;
			}
		},

		handleRelease: function(event) {
            this.buttonActive = this.dragActive = false;
			if (this.autoHide) { this.joystick.visible = false; }
			this.setState(0,0);
			this.currentDistance *= 0.5; // Reduce elastic
			createjs.Tween.get(this)
					.to({currentDistance:0}, 500, createjs.Ease.getElasticOut(1,0.1))
					.call(this.handleTweenComplete, null, this);
			createjs.Ticker.addListener(this);

			GameLibs.GameUI.stopDrag();
		},

		handleTweenComplete: function() {
			createjs.Ticker.removeListener(this);
		},

		tick: function() {
			this.updateThumb();
		},

		toString: function() {
			return "[GameLibs.Joystick]";
		}

	}

	scope.Joystick = Joystick;

}(window.GameLibs))