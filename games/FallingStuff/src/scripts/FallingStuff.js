(function(scope) {

    function FallingStuff() {}

	var s = FallingStuff;
	s.PADDLE_SPEED = 25;
	s.GAME_TIME = 30 * 1000;

    FallingStuff.prototype = {
        
       // Check out the documentation for details on the game format.

	    // Passed in via initialize
	    stage: null,
	    assets: null,
	    gameInfo: null,

	    // On-screen objects
	    catcher: null,          // The paddle
	    stuff: null,            // A list of falling stuff
	    scoreText: null,        // Text fields for score and time
	    timeText: null,
	    ballText: null,
	    ballContainer: null,

	    lastItem: 0,            // Help determine when to have the next item fall
	    itemDelay: 5,           // Time between items (in ticks)
	    numTicks: 0,            // Overall ticks elapsed in-game
	    paddleWidth: 100,       // Width of the paddle
	    ballColor: "#ffff00",

	    timeRemaining:s.GAME_TIME, // Remaining game time in milliseconds
	    startTime: 0,           // Time that the game started
	    hits: 0,                // Number of hits so far

	    scoreManager: null,     // Tracks the score

	    initialize: function(assets, stage, gameInfo) {
		    this.assets = assets;
		    this.stage = stage;
		    this.gameInfo = gameInfo;

			var bg = GameLibs.GameUI.changeBackground(assets.background, gameInfo.width, gameInfo.height, "stretch");
		    stage.addChild(bg);

		    this.ballContainer = new createjs.Container();
		    stage.addChild(this.ballContainer);

		    // Add a HUD background
		    var hud = new createjs.Shape(new createjs.Graphics().beginFill("rgba(0,0,0,0.4)").drawRect(0,0,this.gameInfo.width,55));
		    this.stage.addChild(hud);
	    },

	    startGame: function() {

		    // The mode is passed in with the gameInfo, but not ready until game start.
		    // Depending on the mode, set the game speed and difficulty.
		    this.paddleWidth = 100;
		    this.ballColor = "#ffff00";
		    if (this.gameInfo.selectedGameMode == 1) {
			    this.itemDelay = 2;
			    this.paddleWidth = 60;
			    this.ballColor = "#00ffff";
		    } else if (this.gameInfo.selectedGameMode == 2) {
			    this.itemDelay = 1;
			    this.ballColor = "#0000ff";
			    this.paddleWidth = 40;
		    }

		    // The paddle that catches the balls
		    this.catcher = new createjs.Shape(
				new createjs.Graphics().f("#000000").dr(-this.paddleWidth/2,0,this.paddleWidth,20)
		    );
		    this.catcher.cache(-this.paddleWidth/2,0,this.paddleWidth,20);
		    this.catcher.x = this.gameInfo.width >> 1;
		    this.catcher.y = this.gameInfo.height - 40;
		    this.stage.addChild(this.catcher);

		    // A list of stuff will be populated throughout
		    this.stuff = [];

		    // When touch-enabled, add the touch throttle.
		    if (this.gameInfo.touchEnabled) {
			    this.throttle = new GameLibs.Throttle(new createjs.Rectangle(0,0,this.gameInfo.width,this.gameInfo.height),
					    GameLibs.Throttle.HORIZONTAL,
			            {autoHide:false});
			    this.throttle.setPosition(this.gameInfo.width>>1, this.gameInfo.height-60);
			    this.stage.addChild(this.throttle.sprite);

			    // Move the paddle up to accommodate.
			    this.catcher.y = this.gameInfo.height - 150;
		    }

		    // Create the on-screen text
		    this.scoreText = new createjs.Text("Score: 0", "20px Arial", "#ffffff");
		    this.scoreText.x = 20
			this.scoreText.y = 15;
		    this.scoreManager = new GameLibs.ScoreManager(this.scoreText);
		    this.scoreManager.prefix = "Score: ";

		    this.timeText = new createjs.Text("1:00:00", "40px Arial", "#ffffff");
		    this.timeText.textAlign = "center";
		    this.timeText.y = 5;
		    this.timeText.x = this.gameInfo.width >> 1;

		    this.ballText = new createjs.Text("Hits: 0", "20px Arial", "#ffffff");
		    this.ballText.y = 15;
		    this.ballText.textAlign = "right";
		    this.ballText.x = this.gameInfo.width - 20;

		    this.stage.addChild(this.scoreText, this.timeText, this.ballText);

		    // Create the intro text
		    this.titleText = new createjs.Text("Avoid The Balls!", "80px Arial", "#ffffff");
		    this.titleText.x = -1500;
		    this.titleText.y = 150;
		    this.titleText.alpha = 0;
		    this.titleText.textAlign = "center";
		    this.stage.addChild(this.titleText);

		    // Tween in the intro text, then tween out.
		    createjs.Tween.get(this.titleText)
				    .wait(1000)
				    .to({x:this.gameInfo.width>>1, alpha:1},400,createjs.Ease.backOut)
				    .wait(2500)
				    .to({x:1500, alpha:0}, 400, Ease.backIn)
				    .call(this.startLevel, null, this);
	    },

	    // Start level resets everything.
	    startLevel: function() {
			this.timeRemaining = s.GAME_TIME;
		    this.startTime = new Date().getTime();
		    this.hits = 0;
		    this.ballText.text = "Hits: " + this.hits;
	    },

	    tick: function(tickFactor) {
		    // Increment the tick and decrement time remaining
		    this.numTicks += tickFactor;
		    this.timeRemaining = s.GAME_TIME - (new Date().getTime() - this.startTime);

		    // refresh the timer
		    this.updateTime();

		    // Occasionally spawn a new ball
		    if (this.timeRemaining > 0 && this.numTicks > this.lastItem + this.itemDelay) {
			    this.lastItem = this.numTicks;
			    this.spawnItem();
		    }

		    // Move the catcher and items.
		    this.moveCatcher();
		    this.moveItems(); // Also does hit detection
	    },

	    updateTime: function() {
		    if (this.timeRemaining < 0) {
			    this.timeText.text = "00:00:00";
			    return;
		    }
		    var seconds = "" + (this.timeRemaining / 1000 >> 0);
		    while (seconds.length < 2) { seconds = "0" + seconds; }
		    var ms = ""+((this.timeRemaining - seconds * 1000) / 10 | 0);
		    while (ms.length < 2) { ms = "0" + ms; }
		    this.timeText.text = "00:" + seconds + ":" + ms;
	    },

	    spawnItem: function() {
		    // First time, create a template, this helps speed up the game, since it uses the same image and can
		    // utilize the GPU, instead of drawing hundreds of shapes.
			if (this.itemTemplate == null) {
				this.itemTemplate = new createjs.Shape(
					new createjs.Graphics().f(this.ballColor).dc(0,0,15)
				);
				this.itemTemplate.cache(-15, -15, 30, 30);
			}

		    // The item is created from the cacheCanvas of the template (above)
		    var item = new createjs.Bitmap(this.itemTemplate.cacheCanvas);
		    item.scaleX = item.scaleY = Math.random() * 0.5 + 0.5;
		    item.x = Math.random() * (this.gameInfo.width - 50) + 25;
		    item.vy = Math.random() * 5 + 5;
		    this.stuff.push(item);
		    this.ballContainer.addChild(item);
		    return item;
	    },

	    moveCatcher: function() {
			var pad = GameLibs.GamePad;
		    var player = pad.player;

		    // Right now, the throttle controls the keyboard. Both arrows and W/D will work
		    var newX = this.catcher.x;
		    if (player.isButtonDown(pad.LEFT)) {
			    newX -= s.PADDLE_SPEED;
		    } else if (player.isButtonDown(pad.RIGHT)) {
			    newX += s.PADDLE_SPEED;
		    }

		    // Move the catcher, but keep in in-bounds
		    this.catcher.x = Math.max(this.paddleWidth, Math.min(this.gameInfo.width-this.paddleWidth, newX));
	    },

	    moveItems: function() {
		    for (var i=this.stuff.length-1; i>=0; i--) {
			    var item = this.stuff[i];

			    // Move all items straight down
			    var lastY = item.y;
			    item.y += item.vy;
			    item.vy *= 1.035;

			    // If the item is above the catcher, ignore it
			    if (item.y < this.catcher.y) { continue; }

			    // When below the catcher, use simple line-line to determine a hit.
			    if (this.timeRemaining > 0 && GameLibs.Math2.lineToLine(
					    new createjs.Point(item.x, lastY),
			            new createjs.Point(item.x, item.y),
			            new createjs.Point(this.catcher.x-this.paddleWidth, this.catcher.y),
		                new createjs.Point(this.catcher.x+this.paddleWidth, this.catcher.y)
		            )) {
				    this.catchItem(item);

				// Otherwise we are out of bounds, so remove the item
			    } else if (item.y > this.gameInfo.height) {
				    this.missItem(item);
			    }
		    }
	    },

	    catchItem: function(item) {
			this.removeItem(item);
		    this.scoreManager.subtractScore(5000);

		    this.hits++;
		    this.ballText.text = "Hits: " + this.hits;
		    // TODO: Play Sound
	    },

	    missItem: function(item) {
		    this.removeItem(item);
		    this.scoreManager.addScore(100);
		    // TODO: Play Sound
	    },

	    removeItem: function(item) {
		    this.ballContainer.removeChild(item);
            var index = this.stuff.indexOf(item);
            if (index > -1) {
                this.stuff.splice(index, 1);
            }

			// If time is up, and there are no balls, game is over. This lets the field get cleared.
		    if (this.timeRemaining < 0 && this.stuff.length == 0) {
			    this.gameOver();
		    }
	    },

	    gameOver: function() {
		    // We could do something fancy here...
			this.onGameOver();
	    },

	    pause: function(paused) {

	    },

	    getScore: function() {
		    return new GameLibs.GameDetails(this.scoreManager.score);
	    },

	    restart: function() {
		    this.scoreManager.setScore(0);
		    this.startLevel();
	    },

	    continueGame: function(keepPoints) {
		    if (!this.keepPoints) {
			    this.scoreManager.setScore(0);
		    }
			this.startLevel();
	    }

    }

    scope.FallingStuff = FallingStuff;

}(window.Atari.currentGame))