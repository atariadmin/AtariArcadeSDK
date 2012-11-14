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
(function(window) {

	/**
	 * A seeded randomization class which returns a predictive set of random numbers for randomization which
	 * can be re-created consistently.
	 * @class Rnd
	 * @static
	 */
	var Rnd = function() {
		throw new Error('Rnd is static and cannot be instantiated.');
	};

	/**
	 * Set the seed value to get a different result set.
	 * @method setSeed
	 * @param {Number} value The seed value.
	 */
	Rnd.setSeed = function(value) {
		Rnd._currentSeed = value;
	};

	/**
	 * Get a random floating-point value between a range of 2 values.
	 * @method randFloat
	 * @param {Number} min The lower range
	 * @param {Number} max The upper range
	 * @return {Number} A floating point number.
	 */
	Rnd.randFloat = function(min,max) {
		if (isNaN(max)) { max = min; min=0; }
		return Rnd.random()*(max-min)+min;
	};

	/**
	 * Get a random boolean (true or false) value.
	 * <pre>
	 *     // boolean(); // returns true or false (50% chance of true)
	 *     // boolean(0.8); // returns true or false (80% chance of true)
	 * </pre>
	 * @method randBoolean
	 * @param {Number} chance The likelihood between 0 and 1 that the number will be true.
	 * @return {Boolean} true or false
	 */
	Rnd.randBoolean = function (chance) {
		if (isNaN(chance)) { chance = .5; }
		return (Rnd.random() < chance);
	};

	/**
	 * Get a random -1 or +1 value.
	 * <pre>
	 *     // sign(); // returns 1 or -1 (50% chance of 1)
	 *     // sign(0.8); // returns 1 or -1 (80% chance of 1)
	 * </pre>
	 * @method randSign
	 * @param {Number} chance The likelihood between 0 and 1 that the number will be 1.
	 * @return {Number} 1 or -1
	 */
	Rnd.randSign =  function(chance) {
		if (isNaN(chance)) { chance = .5; }
		return (Rnd.random() < chance) ? 1 : -1;
	}

	/**
	 * Return a random 1 or 0 value.
	 * <pre>
	 *     // bit(); // returns 1 or 0 (50% chance of 1)
	 *     // bit(0.8); // returns 1 or 0 (80% chance of 1)
	 * </pre>
	 * @method randBit
	 * @param {Number} chance The likelihood between 0 and 1 that the number will be 1
	 * @return {Number} 1 or 0.
	 */
	Rnd.randBit = function bit(chance) {
		if (isNaN(chance)) { chance = .5; }
		return (Rnd.random() < chance) ? 1 : 0;
	};

	/**
	 * Return a random integer between 2 values.
	 * <pre>
	 *     // integer(50); // returns an integer between 0-49 inclusive
	 *     // integer(20,50); // returns an integer between 20-49 inclusive
	 * </pre>
	 * @method randInteger
	 * @param {Number} min The lower range.
	 * @param {Number} max The upper range.
	 * @return {Number} An integer
	 */

	Rnd.randInteger = function (min,max) {
		if (isNaN(max)) { max = min; min=0; }
		// Need to use floor instead of bit shift to work properly with negative values:
		return Math.floor(Rnd.randFloat(min,max));
	};

	/**
	 * Return a random number using a seed.
	 * @return {Number}
	 */
	Rnd.random = function() {
		if(isNaN(Rnd._currentSeed)){ Rnd._currentSeed = Math.random() * 0x7FFFFFFF }
		var rand = (Rnd._currentSeed = (Rnd._currentSeed * 16807) % 2147483647)/0x7FFFFFFF+0.000000000233;
		return rand;
	}


	/**
	 * Weighted random function. Pass initial range as to/from, and then weightedRange and weightedStrengh as required.
	 * @param normalRange - Array of 2 values representing the normal range
	 * @param decimalPlaces - Precision
	 * @param weightedRange - Array of 2 values representing the weighted range
	 * @param weightStrength - Percentage of likelihood of returning something within the weighted range
	 */
	Rnd.weighted = function(normalRange, weightedRange, weightedStrength, decimalPlaces){
		var value;
		var to = normalRange[1];
		var from = normalRange[0];
		if(isNaN(decimalPlaces)){decimalPlaces = 0; }

		if(to == from){return(to);}
		if(weightedRange && Rnd.random()<=weightedStrength){
			value = Rnd.random()*(weightedRange[1]-weightedRange[0]) + weightedRange[0]
		}else{
			value = Rnd.random()*(to-from)+from, decimalPlaces;
		}
		var decimal = Math.pow(10, decimalPlaces);
		value =  Math.round(decimal * value) / decimal;
		return(value)
	}

	window.Rnd = Rnd;

}((typeof exports == 'undefined')?window:exports));