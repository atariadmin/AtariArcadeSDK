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

(function(scope) {

	var s = createjs.Point;
	var DEG_TO_RAD = Math.PI / 180;

	s.getAngle = function(p1, p2) {
		return Math.atan2(p2.y-p1.y, p2.x-p1.x);
	}

	s.interpolate = function(p1, p2, amount) {
		var newX = p1.x+(p2.x-p1.x)*amount;
		var newY = p1.y+(p2.y-p1.y)*amount;
		return new s(newX, newY);
	}

	s.distance = function(p1, p2) {
		var dx = p2.x-p1.x;
		var dy = p2.y-p1.y;
		return Math.sqrt(dx*dx+dy*dy);
	}

	s.toDegrees = function(angle) { return angle / DEG_TO_RAD; }
	s.toRadians = function(angle) { return angle * DEG_TO_RAD; }

	var p = createjs.Point.prototype;

	p.add = function(p) {
		this.x += p.x;
		this.y += p.y;
	}
	p.copyFrom = function(p) {
		this.x = p.x;
		this.y = p.y;
	}
	//p.normalize = function(thickness) {}
	p.offset = function(dx, dy) {
		this.x += dx;
		this.y += dy;
	}
	//p.polar = function(len, angle) {}
	p.setTo = function(x, y) {
		this.x = x;
		this.y = y;
	}
	p.subtract = function(p) {
		this.x -= p.x;
		this.y -= p.y;
	}

}(window))