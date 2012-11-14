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
	 * The ScoreManager provides the ability to track and update the user's score
	 * including automatically tweening the text field's value, and formatting
	 * the score with a prefix, leading zeroes, and commas.
	 * @class ScoreManager
	 * @param {Text} text The EaselJS text instance to update.
	 * @constructor
	 */
	function ScoreManager(text) {
		this.initialize(text);
	}

	var s = ScoreManager;
	var p = ScoreManager.prototype = {

		/**
		 * The current score.
		 * @property score
		 * @type Number
		 * @default 0
		 */
		score: 0,

		/**
		 * The score currently displayed.
		 * @property displayScore
		 * @type Number
		 * @default 0
		 * @protected
		 */
		displayScore: 0,

		/**
		 * The number of leading zeroes to use in the displayed score.
		 * @property leading
		 * @type Number
		 * @default 0
		 */
		leading: 0,

		/**
		 * A string prefix to display along with the score.
		 * @property prefix
		 * @type String
		 * @default ""
		 */
		prefix: "",

		/**
		 * A reference to the text instance that will be updated.
		 * @property text
		 * @type Text
		 * @protected
		 */
		text: null,

		milestones: null,

		/**
		 * Initialize the ScoreManager by creating a new Tween and setting the textRef.
		 * @method initialize
		 * @param {Text} text A reference to the EaselJS Text instance used to display the score.
		 * @protected
		 */
		initialize: function(text) {
			this.text = text;
			this.milestones = [];
		},

		/**
		 * Returns a properly formatted display string of the current score, even in mid-tween. Used to manually
		 * set a score Text object.
		 * @method getScore
		 * @param actualScore Get the actual score, not the display score, but formatted.
		 * @return {String} The current score, formatted.
		 */
		getScore: function(actualScore) {
			var score = (actualScore == true) ? this.score : this.displayScore;
			return this.prefix + GameLibs.StringUtils.formatScore(score|0, this.leading || 0, null);
		},

		/**
		 * Sets the score by running a tween.
		 * @method setScore
		 * @param {Number} newScore New score value.
		 * @param {Boolean} tween If the ScoreManager should tween the score (true) or just set it (false). The
		 * default is true.
		 */
		setScore: function(score, tween) {
			score = Math.max(0, score|0);
			this.score = score;
			if (tween == false) {
				this.displayScore = score;
				this.update();
				return;
			}
			var tween = createjs.Tween.get(this, {override:true});
			tween.onChange = Atari.proxy(this.update, this);
			tween.to({displayScore:score}, 500, createjs.Ease.sineInOut);//.call(this.checkMilestones, null, this);

			this.checkMilestones();
		},

		/**
		 * Add some score points to the overall score. This is the recommended method for scoring a game.
		 * @method addScore
		 * @param {Number} score The points to add
		 * @param {Boolean} tween If the score should tween or not. The default is true.
		 */
		addScore: function(score, tween) {
			if (isNaN(score)) { return; };
			this.setScore(this.score+score, tween);
		},

		/**
		 * Remove some score points from the overall score. This is the recommended method for
		 * giving a penalty to the player.
		 * @method subtractScore
		 * @param {Number} score The points to remove
		 * @param {Boolean} tween If the score should tween or not. The default it true.
		 */
		subtractScore: function(score, tween) {
			this.setScore(this.score-score, tween);
		},

		/**
		 * If there is a text reference, update it immediately.
		 * @method update
		 * @param {Number} prefix Minimum number of values for the score. Ex: If the score is 100, and prefix is 6, text is
		 * updated to read "000,100".
		 */
		update: function() {
			this.text && (this.text.text = this.getScore());
		},

		/**
		 * After the score update, check if it beats any milestones. If a milestone is beat, the array discards the
		 * milestone and informs the Achievement manager.
		 * @method checkMilestones
		 * @private
		 */
		checkMilestones: function() {
			var i, l = this.milestones.length, ms;
			for(i=0; i<l; i++) {
				ms = this.milestones[i];
				if(this.score > ms.score) {
					// TODO: Call the Achievement manager, check if achievement is available, and discard the milestone.
					Atari.trace("Achieved " + ms.score + " point milestone!");
					this.milestones.splice(i,1);
				}
			}
		},

		/**
		 * Set a score milestone, which includes score to beat and the game reference.
		 * @method setMilestone
		 * @param {Number} score Score value to beat.
		 * @param {game} game Reference to the game being played.
		 * @private
		 */
		setMilestone: function(score, game) {
			this.milestones.push({score:score, game:game});
		}

	};

	scope.ScoreManager = ScoreManager;

}(window.GameLibs))