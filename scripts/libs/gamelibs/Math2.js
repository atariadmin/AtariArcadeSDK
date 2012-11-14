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
	 * Additional Math methods and functions.
	 * @class Math2
	 * @static
	 */
	function Math2() {}

	var s = Math2;

	/**
	 * A static multiplier to convert a radian angle to degrees.
	 * @property RAD_TO_DEG
	 * @type {Number}
	 * @default 180/Math.PI
	 * @static
	 */
	s.RAD_TO_DEG = 180 / Math.PI;

	/**
	 * A static multiplier to convert a degree angle to radians.
	 * @property DEG_TO_RAD
	 * @type {Number}
	 * @default Math.PI/180
	 * @static
	 */
	s.DEG_TO_RAD = Math.PI / 180;

	// Hit Detection
	/**
	 * No intersection
	 * @property INTERSECT_NONE
	 * @type {Number}
	 * @default 0
	 * @static
	 */
	s.INTERSECT_NONE = 0;

	/**
	 * Left intersection
	 * @property INTERSECT_LEFT
	 * @type {Number}
	 * @default 1
	 * @static
	 */
	s.INTERSECT_LEFT = 1;

	/**
	 * Right intersection
	 * @property INTERSECT_RIGHT
	 * @type {Number}
	 * @default 2
	 * @static
	 */
	s.INTERSECT_RIGHT = 2;

	/**
	 * Top intersection
	 * @property INTERSECT_TOP
	 * @type {Number}
	 * @default 4
	 * @static
	 */
	s.INTERSECT_TOP = 4;

	/**
	 * Bottom intersection
	 * @property INTERSECT_BOTTOM
	 * @type {Number}
	 * @default 8
	 * @static
	 */
	s.INTERSECT_BOTTOM = 8;

	/**
	 * Inside intersection (both points are inside the rectangle)
	 * @property INTERSECT_INSIDE
	 * @type {Number}
	 * @default 16
	 * @static
	 */
	s.INTERSECT_INSIDE = 16;

	/**
	 * No intersection
	 * @property INTERSECT_ANY
	 * @type {Number}
	 * @default 15 (1|2|4|8)
	 * @static
	 */
	s.INTERSECT_ANY = s.INTERSECT_LEFT | s.INTERSECT_RIGHT | s.INTERSECT_TOP | s.INTERSECT_BOTTOM;

	/**
	 * Horizontal (left and right) intersection
	 * @property INTERSECT_HORIZONTAL
	 * @type {Number}
	 * @default 3 (1|2)
	 * @static
	 */
	s.INTERSECT_HORIZONTAL = s.INTERSECT_LEFT | s.INTERSECT_RIGHT;

	/**
	 * Vertical (top and bottom) intersection
	 * @property INTERSECT_NONE
	 * @type {Number}
	 * @default 12 (4|8)
	 * @static
	 */
	s.INTERSECT_VERTICAL = s.INTERSECT_TOP | s.INTERSECT_LEFT;


	/**
	 * Check if a line intersects another line. Currently only returns true/false
	 * @method lineToLine
	 * @param {Number} p1 Line 1 start coordinates.
	 * @param {Number} p2 Line 1 end coordinates.
	 * @param {Number} p3 Line 2 start coordinates.
	 * @param {Number} p4 Line 2 end coordinates.
	 * @return {Boolean} If the lines intersect. Not that coincident and parallel lines never intersect.
	 * @static
	 */
	s.lineToLine = function(p1, p2, p3, p4 ) {
	    var denom = ((p4.y - p3.y) * (p2.x - p1.x)) - ((p4.x - p3.x) * (p2.y - p1.y));
	    var numerator = ((p4.x - p3.x) * (p1.y - p3.y)) - ((p4.y - p3.y) * (p1.x - p3.x));
	    var numerator2 = ((p2.x - p1.x) * (p1.y - p3.y)) - ((p2.y - p1.y) * (p1.x - p3.x));

	    if (denom == 0) {
	        if (numerator == 0 && numerator2 == 0) {
	            return false;//COINCIDENT;
	        }
	        return false;// PARALLEL;
	    }
	    var ua = numerator / denom;
	    var ub = numerator2/ denom;
	    return (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1);
	}

	/**
	 * Check if a line intersects a rectangle.
	 * @method lineToBox
	 * @param {Point} p1 Line starting point.
	 * @param {Point} p2 Line ending point.
	 * @param {Rectangle} rect The rectangle to intersect.
	 * @param {Number} checkDirection Determines which directions to test intersection. By default,
	 * all directions are checked, but this enables a quicker result if only testing a particular direction.
	 * Directions are bitwise numbers specified on the Math2 class, and can be combined using bitwise
	 * OR (Math2.CHECK_LEFT | Math2.CHECK_RIGHT). The accepted values are:<ul>
	 *     <li>Math2.INTERSECT_ALL: Check intersection on all sides (1|2|4|8)</li>
	 *     <li>Math2.INTERSECT_LEFT: Check intersection on the left side (1)</li>
	 *     <li>Math2.INTERSECT_RIGHT: Check intersection on the right side (2)</li>
	 *     <li>Math2.INTERSECT_BOTTOM: Check intersection on the bottom side (4)</li>
	 *     <li>Math2.INTERSECT_TOP: Check intersection on the top side (8)</li>
	 * </li>
	 * </ul>
	 * @return {Number} The hit result. Like directions, the hit result will return which sides were intersected.
	 * Note that only checked sides will be returned in the result. In addition to the intersection values
	 * described in the checkIntersect, there are a few additional result values:<ul>
	 *     <li>Math2.INTERSECT_HORIZONTAL: Intersect either the left or right side (1|2)</li>
	 *     <li>Math2.INTERSECT_VERTICAL: Intersect either the bottom or top side(4|8)</li>
	 *     <li>Math2.INTERSECT_NONE: No intersection found (0)</li>
	 *     <li>Math2.INTERSECT_INSIDE: The entire line is inside the rectangle (16)</li>
	 * </ul>
	 * @static
	 */
	s.lineToBox = function(p1, p2, rect, checkIntersect) {
		var lowerLeft = new createjs.Point(rect.x, rect.y+rect.height);
		var upperRight = new createjs.Point(rect.x+rect.width, rect.y);
		var upperLeft = new createjs.Point( rect.x, rect.y );
		var lowerRight= new createjs.Point( rect.x+rect.width, rect.y+rect.height);

		// check if it is inside
		if (p1.x > lowerLeft.x && p1.x < upperRight.x && p1.y < lowerLeft.y && p1.y > upperRight.y &&
			p2.x > lowerLeft.x && p2.x < upperRight.x && p2.y < lowerLeft.y && p2.y > upperRight.y ) {
			return s.INTERSECT_INSIDE;
		}

		if (checkIntersect == null) { checkIntersect = s.INTERSECT_ANY; }
		var hit = s.INTERSECT_NONE;
		// check each line for intersection
		if ((checkIntersect & s.INTERSECT_TOP) && s.lineToLine(p1, p2, upperLeft, upperRight) ) { hit |= s.INTERSECT_TOP; }
		if ((checkIntersect & s.INTERSECT_LEFT) && s.lineToLine(p1, p2, upperLeft, lowerLeft ) ) { hit |= s.INTERSECT_LEFT; }
		if ((checkIntersect & s.INTERSECT_BOTTOM) && s.lineToLine(p1, p2, lowerLeft, lowerRight) ) { hit |= s.INTERSECT_BOTTOM; }
		if ((checkIntersect & s.INTERSECT_RIGHT) && s.lineToLine(p1, p2, upperRight, lowerRight) ) { hit |= s.INTERSECT_RIGHT; }
		return hit;
	}

	s.hitTestPoint = function(rect, p) {
		var x = p.x; var y = p.y;
		return (x > rect.x
				&& x < rect.x+rect.width
				&& y > rect.y
				&& y < rect.y+rect.height);
	}

	/**
	 * Get a random number between a min and maximum range.
	 * @method getRange
	 * @param {Number} min The lowest possible number
	 * @param {Number} max The highest possible number
	 * @return {Number}
	 */
    s.getRange =  function(min, max) {
        var scale = max - min;
        return Math.random() * scale + min;
    }


	/**
	 * Tween an object (Sprite, Point, or anything with an x & y property) towards
	 * a target. This method moves the object towards the target using a simple follow ease.
	 * @method tweenTowardsTarget
	 * @param {Sprite|Point|Object} object The object that will be affected.
	 * @param {Number} factor The decay for easing. The default is 10. Higher numbers will tween slower.
	 * @param {Boolean} moveX If the tween should affect the x-axis. The default is true.
	 * @param {Boolean} moveY If the tween should affect the y-axis. The default is true.
	 * @return if the object already reached the target (false) or moved a certain amount (true)
	 * @static
	 */
	s.tweenTowardsTarget = function(object, target, factor, moveX, moveY) {
		if (object == null || target == null) { return false; }
		if (factor == null) { factor = 10; }
		var moved = false;
		if (moveX != false) {
			var difX = target.x - object.x;
			if (Math.abs(difX) < 0.01) {
				object.x = target.x;
			} else {
				object.x += difX / factor;
				moved = true;
			}
		}
		if (moveY != false) {
			var difY = target.y - object.y;
			if (Math.abs(difY) < 0.01) {
				object.y = target.y;
			} else {
				object.y += difY / factor;
				moved = true;
			}
		}
		return moved;
	},

	/**
	 * Move an object {Sprite, Point, or anything with an x & y property) towards
	 * a target (as long as it's not null). This method moves a specific
	 * amount towards the target until it reaches it.
	 * @method moveTowardsTarget
	 * @param {Sprite|Point|Object} object The object that will be affected.
	 * @param {Number} amount The maximum amount of pixels to move. The amount will be reduced
	 * if the object is too close, so it doesn't pass it.
	 * @param {Boolean} moveX If the move should affect the x-axis. The default is true.
	 * @param {Boolean} moveY If the move should affect the y-axis. The default is true.
	 * @return if the object already reached the target (false) or moved a certain amount (true)
	 * @static
	 */
	s.moveTowardsTarget = function(object, target, amount, moveX, moveY) {
		if (object == null || target == null) { return false; }
		if (amount == null) { amount = 15; }

		var dif, amt, gt;
		if (moveX != false && moveY != false) {
			var difX = target.x-object.x;
			var difY = target.y-object.y;
			dif = Math.sqrt(difX*difX+difY*difY);
			if (dif <= 1) {
				object.x = target.x;
				object.y = target.y;
				return false;
			}
			var a = Math.atan2(difY, difX);
			amt = Math.min(amount, dif);
			object.x += amt * Math.cos(a);
			object.y += amt * Math.sin(a);
		} else if (moveX != false) {
			dif = target.x - object.x;
			amt = Math.min(Math.abs(dif), amount);
			if (Math.abs(amt) < 1) {
				object.x = target.x;
				return false;
			}
			gt = dif > 0 ? 1 : -1;
			object.x += amt * gt;
		} else {
			dif = target.y - object.y;
			amt = Math.min(Math.abs(dif), amount);
			if (Math.abs(amt) < 1) {
				object.y = target.y;
				return false;
			}
			gt = dif > 0 ? 1 : -1;
			object.y += amt * gt;
		}
		return true;
	}

	/**
	 * Determine if a number is inside of a range.
	 * @param {Number} value The value to check.
	 * @param {Number} low The low end of the range
	 * @param {Number} high The high end of the range
	 * @return {Boolean}
	 */
	s.isBetween = function (value, low, high) {
		return value >= low && value <= high;
	}

	/**
	 * Interpolate between two numbers. This helps find a point between two numbers. For example:
	 * <ul><li>Interpolating between 10 and 20 with 0.5 would result in 15.</li>
	 *      <li>Interpolating between 10 and 20 with 0.25 would result in 12.5.</li>
	 *      <li>Interpolating between 10 and 20 with 2 would result in 30.</li>
	 *      <li>Interpolating between 10 and 20 with -0.5 would result in 5.</li>
	 * </ul>
	 * @param {Number} val1 The first number. It can be higher or lower than the second.
	 * @param {Number} val2 The second number.
	 * @param {Number} amount A percentage between the two numbers. The default is 0.5.
	 *      A lower number will fall closer to the second value. You can optionally pass
	 *      a number greater than one or less than zero to find values outside of the range.
	 * @return {Number} The derived value between the two points.
	 */
	s.interpolate = function(val1, val2, amount) {
		if (amount == null) { amount = 0.5; }
		return (val2 - val1) * amount + val1;
	}

	scope.Math2 = Math2;

}(window.GameLibs))