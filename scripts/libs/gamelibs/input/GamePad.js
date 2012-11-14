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
	 * The GamePad is a common interface that handles user input including keyboard, mouse,
	 * touch, and on-screen controls such as a joystick. Input is converted into useful constants
	 * and can be tracked via the button and position APIs.
	 * @class GamePad
	 */
	var GamePad = function(gameInfo) { //TODO: Convert back to fully static or Singleton.
		this.initialize(gameInfo);
	};

	var s = GamePad;

	/**
	 * A reference to the <i>current</i> player's GamePad. This is the interface all games
	 * should use for the local player input. Note that multiplayer input comes instead from
	 * the GameInfo (player info) and MultiPlayer API updatePlayers, which is called on
	 * each game every tick (or so).
	 * @property player
	 * @type {GamePad}
	 * @default null
	 */
	s.player = null;

	/**
	 * A list of the <i>other</i> players in the game. This list does <b>not</b> include
	 * the current player.
	 * @property players
	 * @type {Array}
	 * @default []
	 */
	s.players = [];

	/**
	 * Represents an upwards movement, which can also be an UP ARROW or W key
	 * @property DOWN
	 * @type {String}
	 * @default up
	 * @static
	 */
	s.UP = "up";

	/**
	 * Represents a downwards movement, which can also be a DOWN ARROW or S key
	 * @property DOWN
	 * @type {String}
	 * @default down
	 * @static
	 */
	s.DOWN = "down";

	/**
	 * Represents a left movement, which can also be a LEFT ARROW or A key
	 * @property UP
	 * @type {String}
	 * @default left
	 * @static
	 */
	s.LEFT = "left";


	/**
	 * Represents a right movement, which can also be a RIGHT ARROW or D key
	 * @property RIGHT
	 * @type {String}
	 * @default right
	 * @static
	 */
	s.RIGHT = "right";

	/**
	 * Represents a primary action, which can also be the SPACE key
	 * @property BUTTON_1
	 * @type {String}
	 * @default button1
	 * @static
	 */
	s.BUTTON_1 = "button1";

	/**
	 * Represents a secondary action.
	 * @property BUTTON_2
	 * @type {String}
	 * @default button2
	 * @static
	 */
	s.BUTTON_2 = "button2";

	/**
	 * Represents a tertiary action.
	 * @property BUTTON_3
	 * @type {String}
	 * @default button3
	 * @static
	 */
	s.BUTTON_3 = "button3";

	/**
	 * Represents a 4th action.
	 * @property BUTTON_4
	 * @type {String}
	 * @default button4
	 * @static
	 */
	s.BUTTON_4 = "button4";

	/**
	 * Static initialization happens automatically after everything has been defined.
	 * @method initialize
	 * @static
	 * @protected
	 */
	s.initialize = function(gameInfo) {
		document.onkeydown = Atari.proxy(s.handleButtonDown, s);
		document.onkeyup = Atari.proxy(s.handleButtonUp, s);
		s.player = new GamePad();
	};

	/**
	 * An event is fired from an external source, likely the site framework window.
	 * This ensures the game framework can receive input properly.
	 * @method onExternalEvent
	 * @param {Object} event The external event object.
	 * @static
	 * @protected
	 */
	s.onExternalEvent = function(event) {
		if (event.type == "keydown") {
			s.handleButtonDown(event);
		} else if(event.type == "keyup"){
			s.handleButtonUp(event);
		}
	};

	s.handleButtonDown = function(event) {
		s.player.handleButtonDown(event);
	};

	s.handleButtonUp = function(event) {
    	s.player.handleButtonUp(event);
	};


	var p = GamePad.prototype = {

		/**
		 * Callback to be fired when a key is pressed
		 * @event onButtonDown
		 */
		onButtonDown: null,

		/**
		 * Callback to be fired when a key is released
		 * @event onButtonUp
		 */
		onButtonUp: null,

		/**
		 * Callback to be fired when a button is manually tapped.
		 * This is nice for single events that do not actually store
		 * the button state.
		 * @event onTap
		 */
		onTap: null,

		/**
		 * Games may implement an easter egg, which is activated using the
		 * konami code UP, UP, DOWN, DOWN, LEFT, RIGHT, LEFT, RIGHT, B, A.
		 * Simply subscribe to this callback, and then make appropriate
		 * game changes
		 * @event onKonamiCode
		 */
		onKonamiCode: null,

		/**
		 * Where the use is currently targeting using mouse & touch gestures.
		 * The games should ignore NULL targets, as it indicates that either
		 * no target is set, or the user is using other input methods, such
		 * as the keyboard.
		 * @property target
		 * @type Point
		 * @default null
		 */
		target: null,

		/**
		 * The current touch angle. If this is null, the user is not interacting with
		 * the touch controls.
		 * @property angle
		 * @type Number
		 * @default null
		 * @protected
		 */
		angle: null,

		/**
		 * The last key pressed.
		 * @property lastPressed
		 * @type {Number}
		 */
		lastPressed: null, //TODO: Is this implemented?

		/**
		 * The current key map that maps code values to constant key values, such as
		 * directional arrows and action buttons.
		 * @property keyMap
		 * @type Object
		 * @protected
		 */
		keyMap: null,

		/**
		 * The hash of currently pressed buttons, indexed by key code or constant.
		 * @property downButtons
		 * @type Object
		 * @protected
		 */
		downButtons: null,

		/**
		 * Initialization sets the default key mapping, and initializes other values.
		 * @method initialize
		 * @protected
		 */
		initialize: function() {
			this.downButtons = {};
			// Default keyMappings: ARROWS, WASD, SPACE, ENTER, SHIFT, CTRL.
			var keyMap = {};
			keyMap[KeyCodes.W] = GamePad.UP;
			keyMap[KeyCodes.A] = GamePad.LEFT;
			keyMap[KeyCodes.S] = GamePad.DOWN;
			keyMap[KeyCodes.D] = GamePad.RIGHT;
			keyMap[KeyCodes.UP] = GamePad.UP;
			keyMap[KeyCodes.LEFT] = GamePad.LEFT;
			keyMap[KeyCodes.DOWN] = GamePad.DOWN;
			keyMap[KeyCodes.RIGHT] = GamePad.RIGHT;
			keyMap[KeyCodes.SPACE] = GamePad.BUTTON_1;
			keyMap[KeyCodes.ENTER] = GamePad.BUTTON_2;
			keyMap[KeyCodes.SHIFT] = GamePad.BUTTON_3;
			keyMap[KeyCodes.CTRL] = GamePad.BUTTON_4;
			this.setKeyMap(keyMap, true);
		},

		/**
		 * Set the current position of the "cursor".
		 * @method setPosition
		 * @param {Number} x The x-axis position.
		 * @param {Number} y The y-axis position.
		 */
		setPosition: function(x, y) {
			if (x == null) {
				this.target = null;
			} else if (this.target == null) {
				this.target = new createjs.Point(x, y);
			} else {
				this.target.setTo(x, y);
			}
		},

		/**
		 * Bet the current position of the cursor.
		 * @method getPosition
		 * @return {Point} The current position. If it is null, then it has not been set, or the
		 * user is interacting using another method.
		 */
		getPosition: function() {
			return this.target; // Clone?
		},

		/**
		 * Get the current angle that the player is indicating. If the player is using keys,
		 * then the angle will be one of 8 45-degree angles (counter-clockwise from left:
		 * 180, 135, 90, 45, 0, -45, -90, -135). If the player is using a touch control,
		 * the angle will be any degree between -179 and 180 (same rules as above). If there is no keys
		 * or touch input, the angle will be 0.
		 * @method getAngle
		 * @param {Boolean} degrees If the angle is to be returned in degress (true) or radians (false).
		 * @return {Number} The angle.
		 */
		getAngle: function(degrees) {
			var a = null;
			if (this.angle != null) {
				a = this.angle;
				if (degrees == true) {
					a *= GameLibs.Math2.RAD_TO_DEG;
				}
			} else {
				var down = this.downButtons[s.DOWN];
				var up = this.downButtons[s.UP]
				if (this.downButtons[s.LEFT]) {
					a = down ? -45 : up ? 45 : 180;
				} else if (this.downButtons[s.RIGHT]) {
					a = down ? -135 : up ? 135 : 0;
				} else {
					a = down ? -90 : up ? 90 : null;
				}
				if (!isNaN(a) && degrees != true) {
					a *= GameLibs.Math2.DEG_TO_RAD;
				}
			}
			if (degrees == true && !isNaN(a) && a < 0) { a += 360; }
			return a;
		},

		/**
		 * Set the current angle. Touch controls can use this API to control the game pad.
		 * @method setAngle
		 * @protected
		 */
		setAngle: function(angle) {
			if (angle == null || isNaN(angle)) { this.angle = null; }
			this.angle = angle;
		},

		/**
		 * Trigger a stage tap (mousedown, then mouseup) event manually.
		 * @method triggerTap
		 * @param {Number} x The x-axis coordinate of the tap.
		 * @param {Number} y The y-axis coordinate of the tap.
		 */
		triggerTap: function(x, y) {
			this.setPosition(x, y);
			//MP: Send tap data through socket
			if (this.onTap != null) { this.onTap(); }
			this.setPosition(null);
		},

		/**
		 * Trigger a button press manually (press, then release) - an action likely to be used by
		 * arcade button components.
		 * @method triggerButton
		 * @param {Number} code The keycode to trigger.
		 */
		triggerButton: function(code) {
			if (this.onButtonDown) {
				this.onButtonDown(code);
			}
			if (this.onButtonUp) {
				this.onButtonUp(code);
			}
		},

		/**
		 * Determine if a button is currently pressed.
		 * @method isButtonDown
		 * @param {String|Number} code The button code or constant.
		 * @return {Boolean} If the button is pressed (true) or not (false).
		 */
		isButtonDown: function(code) {
			return this.downButtons[code] == true;
		},

		/**
		 * Determine if all of the specified buttons are pressed. If any of the provided
		 * button codes are not pressed, then false is returned.
		 * @method isAllButtonsDown
		 * @return {Boolean} If all of the buttons are pressed (true) or not (false).
		 */
		isAllButtonsDown: function() {
			for(var i = 0, l = arguments.length; i < l; i++) {
				var code = arguments[i];
				if (!this.downButtons[code] != true) { return false; }
			}
			return true;
		},

		/**
		 * Determine if any of the specified buttons are pressed. If any of the provided
		 * button codes are pressed, then true is returned.
		 * @method isAnyButtonsDown
		 * @return {Boolean} If any of the buttons are pressed (true). If all buttons are released,
		 * then false is returned.
		 */
		isAnyButtonsDown: function() {
			for(var i = 0, l = arguments.length; i < l; i++) {
				var code = arguments[i];
				if (this.downButtons[code] == true) { return true; }
			}
			return false;
		},

		/**
		 * Return a list of codes/constants that are pressed.
		 * @method getDownButtons
		 * @return {Array} A list of the codes/constants that are pressed.
		 */
		getDownButtons: function() {
			var btns = [];
			for (var n in this.downButtons) {
				if (this.downButtons[n]) { btns.push(n); }
			}
			return btns;
		},

		/**
		 * Define keyBoard mappings for the GamePad. The mappings help determine which keyboard
		 * keys or string values map to directional and access keys, making it possible to have
		 * scenarios where both arrow keys and WASD keys handle direction, or mapping letters
		 * or arcade buttons to button constants.
		 * @method setKeyMap
		 * @param {Object} newKeys The key map object
		 * @param {Boolean} clearExisting If the new keymap should override (false) or append (true) to the
		 * current key map. The default value is <b>false</b>.
		 */
		setKeyMap: function(newKeys, clearExisting) {
			if(clearExisting) { this.keyMap = {}; }
			//Add new keyMappings
			var map = this.keyMap;
			for(var key in newKeys) {
			   map[key] = newKeys[key];
			}
		},

		/**
		 * Manually set a button down. If the button is not down already, the onButtonDown() callback
		 * is fired.
		 * @method setButtonDown
		 * @param {Number|String} code The button code to press.
		 */
		setButtonDown: function(code) {
			if (this.downButtons[code] != true) {
				if (this.onButtonDown && !createjs.Ticker.isPaused) { this.onButtonDown(code); }
			}
			this.downButtons[code] = true;
		},

		/**
		 * Manually set multiple buttons down.
		 * @method setButtonsDown
		 * @param {String|Number} args Pass multiple arguments to set multiple buttons down with one call.
		 */
		setButtonsDown: function() {
			for (var i= 0, l=arguments.length; i<l; i++) {
				this.setButtonDown(arguments[i]);
			}
		},

		/**
		 * Manueally set a button up. If the button is pressed, then the onButtonUp callback is fired.
		 * @method setButtonUp
		 * @param {Number|String} code The button code to release.
		 */
		setButtonUp: function(code) {
			if (this.downButtons[code] == true) {
				if (this.onButtonUp && !Ticker.isPaused) { this.onButtonUp(code); }
			}
			this.downButtons[code] = false;
		},

		/**
		 * Manually set multiple buttons up.
		 * @method setButtonsUp
		 * @param {Number|String} args Pass multiple arguments to set multiple buttons donw with one call.
		 */
		setButtonsUp: function() {
			for(var i = 0, l = arguments.length; i < l; i++) {
				this.setButtonUp(arguments[i]);
			}
		},

		/**
		 * Reset the game pad, which ensures that if the player is pressing buttons when the
		 * game ends, it will start out fresh.
		 * @method reset
		 */
		reset: function() {
			this.downButtons = {};
			this.angle = null;
			this.target = null;
		},

		handleButtonDown: function(event) {
            var code = this.getInternalCode(event.keyCode);
			this.setButtonDown(code);
			this.checkForCode(event.keyCode);
		},

		handleButtonUp: function(event) {
			var code = this.getInternalCode(event.keyCode);
			this.setButtonUp(code);
		},

		// KonamiCode
		password: "38384040373937396665",
		passwordSoFar: 0,
		konamiActivated: false,

		checkForCode: function(code) {
			if (this.onKonamiCode == null || this.konamiActivated) { return; }
			var key = code.toString();
			if (this.password.substr(this.passwordSoFar*2, 2) == key) {
				this.passwordSoFar++;
				if (this.passwordSoFar == this.password.length * 0.5) {
					this.onKonamiCode();
					this.konamiActivated = true;
				}
			} else {
				this.passwordSoFar = 0;
			}
		},

		/**
		 * Determine if the keycode matches any of the mapped keys.
		 * @param {Number} keyCode The key code to check
		 * @return {Number}
		 * @protected
		 */
		getInternalCode: function(keyCode) {
			return this.keyMap[keyCode] || keyCode;

		},

		toString: function() {
			return "[GameLibs.GamePad]";
		}

	}

	/**
	 * A helper object that enables easy look-up of common key codes. This class is not exposed
	 * to the docs.
	 * @class KeyCodes
	 * @private
	 */
	var KeyCodes = {};
	KeyCodes.SPACE = 32;
	KeyCodes.CTRL = 17;
	KeyCodes.SHIFT = 16;
	KeyCodes.ENTER = 13;

	KeyCodes.UP  = 38;
	KeyCodes.LEFT = 37;
	KeyCodes.DOWN = 40;
	KeyCodes.RIGHT  = 39;

	KeyCodes.W = 87; //Up
	KeyCodes.A = 65; //Left
	KeyCodes.S = 83; //Down
	KeyCodes.D = 68; //Right

	scope.GamePad = GamePad;

	GamePad.initialize();

}(window.GameLibs))
