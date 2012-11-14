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
	 * The TouchBar is a user interface control that converts a draggable surface into keyboard controls
	 * using a "target" object. For example, as long as the target is to the left, the target will move towards it
	 * (using static motion or a simple ease-out motion) as long as the mouse is down.
	 * The TouchBar supports vertical and horizontal targeting, as well as target aligning, which is handy
	 * if the target shape has a centered or top-left registration point.
	 * @class TouchBar
	 * @param {Rectangle} hitArea The hitArea that is used relative to the stage.
	 * @param {DisplayObject} target A display object, which also contains a width & height property
	 * that the TouchBar moves towards the user's pointer.
	 * @param {String} targetAlignMode How the target aligns to the pointer. This will depend on the registration
	 *      point of the target. The default is top left ("TL"). Available modes are:
	 *      <ol><li>TL: Top Left (this can also be set using an empty value or empty string)</li>
	 *      <li>TC: Top Center (this can also be set just using "C")</li>
	 *      <li>TR: Top Right (this can also be set just using "R")</li>
	 *      <li>ML: Middle Left (this can also be set just using "M")</li>
	 *      <li>MC: Middle Center</li>
	 *      <li>MR: Middle Right</li>
	 *      <li>BL: Bottom Left (this can also be set just using "B")</li>
	 *      <li>BC: Bottom Center</li>
	 *      <li>BR: Bottom Right</li></ol>
	 * @param {Stage} stage The EaselJS stage to track mouseMove events.
	 * @constructor
	 */
	function TouchBar(hitArea, target, targetAlignMode, stage) {
		this.initialize(hitArea, target, targetAlignMode, stage);
	}

	var s = TouchBar;

	var pad = GameLibs.GamePad;

	/**
	 * A constant that defines horizontal-only movement when setting the targetDirection
	 * of the TouchBar.
	 * @property HORIZONTAL
	 * @type {String}
	 * @default horizontal
	 * @static
	 */
	s.HORIZONTAL = "horizontal";

	/**
	 * A constant that defines vertical-only movement when setting the targetDirection
	 * of the TouchBar.
	 * @property VERTICAL
	 * @type {String}
	 * @default vertical
	 * @static
	 */
	s.VERTICAL = "vertical";

	/**
	 * A constant that defines both horizontal and vertical movement when setting the
	 * targetDirection of the TouchBar.
	 * @property BOTH
	 * @type {String}
	 * @default both
	 * @static
	 */
	s.BOTH = "both";

	/**
	 * A constant that defines a static pixel-per-frame move motion when setting the
	 * targetMode of the TouchBar.
	 * @property MOVE_MODE
	 * @type {String}
	 * @default moveMode
	 * @static
	 */
	s.MOVE_MODE = "moveMode";

	/**
	 * A constant that defines a simple ease-out motion when setting the targetMode
	 * of the TouchBar.
	 * @property TWEEN_MODE
	 * @type {String}
	 * @default tweenMode
	 * @static
	 */
	s.TWEEN_MODE = "tweenMode";

	s.enabled = true;
	s.setEnabled = function(enabled) {
		s.enabled = enabled;
	}

	var p = TouchBar.prototype = {

		/**
		 * The hitArea of the generated shape that starts the touch-drag interaction.
		 * @property hitArea
		 * @type Rectangle
		 */
		hitArea: null,

		/**
		 * The target that the TouchBar moves towards the pointer. This can be any object with
		 * and x, y, width, and height property.
		 * @property target
		 * @type Object
		 */
		target: null,

		/**
		 * The generated EaselJS shape which should be added to the stage as the touch target.
		 * @property sprite
		 * @type Shape
		 * @protected
		 */
		sprite: null,

		/**
		 * The position that the user last interacted with, which the target object will move towards.
		 * @property targetPosition
		 * @type Point
		 * @protected
		 */
		targetPosition: null,

		/**
		 * The position that the target object is currently at.
		 * @property currentPosition
		 * @type Point
		 * @protected
		 */
		currentPosition: null,

		/**
		 * The pixel offset which assists with target alignment.
		 * @property offset
		 * @type Point
		 * @protected.
		 */
		offset: null,

		/**
		 * Determines if the mouse is currently pressed.
		 * @property mouseIsDown
		 * @type Boolean
		 * @default false
		 * @protected
		 */
		mouseIsDown: false,

		/**
		 * The mode in which the target moves towards the pointer. The available options are:
		 * <ol>
		 *     <li>TouchBar.MOVE_MODE: Move a specific pixel amount (specified by targetAmount) each tick.</li>
		 *     <li>TouchBar.TWEEN_MODE: Tween towards the pointer each tick using the targetAmount to determine the
		 *     speed.</li>
		 * </ol>
		 * The default value is moveMoveMode.
		 * @property targetMode
		 * @type String
		 * @default moveMode
		 */
		targetMode: s.MOVE_MODE,

		/**
		 * The speed to move the paddle. This changes behaviour depending on the target mode.
		 * <ol><li>In move mode (TouchBar.MOVE_MODE), it is the number of pixels to travel towards the target
		 *      each tick. The higher the number, the faster it moves.</li>
		 *      <li>In tween mode, it is the divisor, which the remaining distance between the target and the touch
		 *      position. This higher the number, the slower it moves.</li></ol>
		 * @property targetAmount
		 * @type Number
		 * @default 10
		 */
		targetAmount: 10,

		/**
		 * The direction to constrain motion to. The available options are:
		 * <ol>
		 *     <li>TouchBar.HORIZONTAL: Move only horizontally</li>
		 *     <li>TouchBar.VERTICAL: Move only vertically</li>
		 *     <li>TouchBar.BOTH: Move in any direction</li>
		 * </ol>
		 * @property targetDirection
		 * @type String
		 * @default both
		 */
		targetDirection:s.BOTH,

		/**
		 * The horizontal align mode. This is either R (right), L (left), or C (center), and is
		 * derived from the targetAlignMode passed in the constructor, or using setTargetAlignMode().
		 * @property horizontalAlign
		 * @type String
		 * @default C
		 * @protected
		 */
		horizontalAlign: "C",

		/**
		 * The vertical align mode. This is either T (top), B (bottom), or M (middle), and is
		 * derived from the targetAlignMode passed in the constructor, or using setTargetAlignMode().
		 * @property verticalAlign
		 * @type String
		 * @default M
		 * @protected.
		 */
		verticalAlign: "M",

		/**
		 * Determines if the target always reaches the last place the pointer was tapped. If true, the
		 * target will continue to move after the pointer is released. If false, the target will stop
		 * when the pointer is released.
		 * @property alwaysReachTarget
		 * @type Boolean
		 * @default false
		 */
		alwaysReachTarget: false,

		/**
		 * A tick factor will multiply the current targetAmount. To be used when doing
		 * framerate-based motion.
		 * @property tickFactor
		 * @type Number
		 * @default 1
		 */
		tickFactor: 1,

		hasMoved: false,

		/**
		 * Initialize the TouchBar. See the constructor for parameter descriptions.
		 * @method initialize
		 * @protected
		 */
		initialize: function(hitArea, target, targetAlignMode, stage) {
			this.hitArea = hitArea;
			this.target = target;
			if (targetAlignMode == null) { targetAlignMode = "TL"; }
			this.setTargetAlignMode(targetAlignMode);
			this.stage = stage;

			this.currentPosition = new createjs.Point();
			this.targetPosition = new createjs.Point();

			if (this.stage != null) {
				createjs.Ticker.addListener(this);
				//this.currentPosition.setTo(this.target.x, this.target.y);
				this.stage.onMouseMove = Atari.proxy(this.handleMouseMove, this);
			} else {
				var sprite = this.sprite = new createjs.Shape();
				sprite.onPress = Atari.proxy(this.handleMouseDown, this);
				var ha = new createjs.Shape(new createjs.Graphics().f("#f90").dr(hitArea.x,hitArea.y,hitArea.width,hitArea.height));
				sprite.hitArea = ha;
			}
		},

		/**
		 * Update the target, as the size or position has changed.
		 * @method updateTarget
		 */
		updateTarget: function() {
			this.updateOffset();
			this.currentPosition.setTo(this.sprite.x, this.sprite.y);
		},

		/**
		 * Set the align mode of the target. This helps align the target on the pointer
		 * if the shape is drawn using a centered or top-left position, or to align
		 * to the right of the pointer, etc.
		 * @method setTargetAlignMode
		 * @param {String} align A combined horizontal and vertical alignment string, similar
		 * to alignMode in Flash. The available values can be combined (any horizontal and vertical
		 * combination). If a horizontal or vertical value is not found, the default will be set to
		 * middle (vertical) and center (horizontal).
		 */
		setTargetAlignMode: function(align) {
			if (align == null) { return; }
			this.verticalAlign = "M";
			if (align.indexOf("T")>=0) {
				this.verticalAlign = "T";
			} else if (align.indexOf("B")>=0) {
				this.verticalAlign = "B";
			}

			this.horizontalAlign = "C";
			if (align.indexOf("R")>=0) {
				this.horizontalAlign = "R"
			} else if (align.indexOf("L")>=0) {
				this.horizontalAlign = "L";
			}

			this.updateOffset();
		},

		/**
		 * Update the offset based on the align mode and the size of the target.
		 * @method updateOffset
		 * @protected
		 */
		updateOffset: function() {
			if (this.offset == null) { this.offset = new createjs.Point(); }
			var o = this.offset;
			o.setTo(0, 0);
			switch (this.horizontalAlign) {
				case "C":
					o.x = this.target.width * 0.5; break;
				case "R":
					o.x = this.target.width; break;
			}
			switch (this.verticalAlign) {
				case "M":
					o.y = this.target.height * 0.5; break;
				case "B":
					o.y = this.target.height; break;
			}
		},

		/**
		 * Start a drag.
		 * @method handleMouseDown
		 * @param {Object} event The MouseEvent generated by EaselJS.
		 * @protected
		 */
		handleMouseDown: function(event) {
			if (!s.enabled) { return; }
			this.mouseIsDown = true;
			event.onMouseMove = Atari.proxy(this.handleMouseMove, this);
			event.onMouseUp = Atari.proxy(this.handleMouseUp, this);
			this.currentPosition.setTo(this.target.x, this.target.y);
			this.targetPosition.setTo(event.stageX-this.offset.x, event.stageY-this.offset.y);
			createjs.Ticker.addListener(this);
			GameLibs.GameUI.startDrag();
		},

		/**
		 * Update the target position as the mouse moves.
		 * @method handleMouseMove
		 * @param {Object} event The MouseEvent generated by EaselJS.
		 * @protected
		 */
		handleMouseMove: function(event) {
			if (this.stage != null &&
					(event.rawX < this.hitArea.x || event.rawX > this.hitArea.x+this.hitArea.width
						|| event.rawY < this.hitArea.y || event.rawY > this.hitArea.y+this.hitArea.height)) {
				return;
			}
			this.targetPosition.setTo(event.stageX-this.offset.x, event.stageY-this.offset.y);
			this.hasMoved = true;
		},

		/**
		 * Update the target's position based on the targetMode and targetAmount. This moves
		 * the target towards the pointer each tick.
		 * @method tick
		 * @protected
		 */
		tick: function() {
			if (this.stage != null && !this.hasMoved) { return; }
			if (this.targetMode == s.MOVE_MODE) {
				var amt = this.targetAmount || 15;
				var moved = GameLibs.Math2.moveTowardsTarget(this.currentPosition, this.targetPosition, amt*this.tickFactor,
						this.targetDirection != s.VERTICAL, this.targetDirection != s.HORIZONTAL);
			} else {
				var amt = this.targetAmount || 10;
				var moved = GameLibs.Math2.tweenTowardsTarget(this.currentPosition, this.targetPosition, amt*this.tickFactor,
						this.targetDirection != s.VERTICAL, this.targetDirection != s.HORIZONTAL);
			}
			if (!moved) {
				if (!this.mouseIsDown && this.alwaysReachTarget) {
					this.stopMoving();
				}
				if (this.stage != null) {
					this.stopMoving(false);
				}
			} else {
				this.update();
			}
		},

		/**
		 * Update the GamePad coordinate position (current position) and angle towards the target position.
		 * @method update
		 * @protected
		 */
		update: function() {
			var player = GameLibs.GamePad.player;
			player.setPosition(this.currentPosition.x, this.currentPosition.y); //TODO: use align mode
			var angle = Math.atan2(this.currentPosition.y - this.targetPosition.y, this.currentPosition.x - this.targetPosition.x);
			player.setAngle(angle);
		},

		/**
		 * The mouse has been released. This will stop the target from moving if the <b>alwaysReachTarget</b>
		 * property is false.
		 * @method handleMouseUp
		 * @param {Object} event The mouse event generated by EaselJS
		 * @protected
		 */
		handleMouseUp: function(event) {
			this.mouseIsDown = false;
			if (this.alwaysReachTarget) { return; }
			this.stopMoving();
			GameLibs.GameUI.stopDrag();
		},

		/**
		 * The move has been stopped, or the target has reached its destination.
		 * @method stopMoving
		 * @protected
		 */
		stopMoving: function(stopTick) {
			if (stopTick != false) {
				createjs.Ticker.removeListener(this);
			}
			this.hasMoved = false;
			var player = GameLibs.GamePad.player;
			player.setPosition(null);
			player.setAngle(null);

		},

		toString: function() {
			return "[GameLibs.TouchBar]";
		}

	}

	scope.TouchBar = TouchBar;

}(window.GameLibs))