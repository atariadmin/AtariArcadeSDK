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
(function (scope) {

	/**
	 * The Particle Emitter creates a group of sprites that:
	 * <ol>
	 *     <li>have random x and y velocities</li>
	 *     <li>a velocity decays so they are affected by gravity</li>
	 *     <li>a lifespan and overall decay so they fade away over time and are removed.</li>
	 * </ol>
	 * The <b>emit()</b> method creates a specific number of particles on-demand,
	 * and adds them to the provided container. Using this function, the position,
	 * number of particles, particle properties, and particle graphics can be
	 * set for each emit call, creating different effects.
	 *
	 * @class ParticleEmitter
	 * @param {Container} container The EaselJS container that particles for this emitter will
	 * be drawn into.
	 * @constructor
	 */
	function ParticleEmitter(container) {
		this.initialize(container);
	}

	var s = ParticleEmitter;

	s.BRICKS = {variation: 1, rotation:false, life:20, decay:0.9, decayX: .99};
	s.SMALL_SPARKS = { speed: 10, decay: 0.45, rotation: false, gravity: true, decayX: .99}
	s.DEFAULT_PROPS = {
		speed: 10,
		decay: 0.94,
		life: 1,
		rotation: true,
		actualRotation: null,
		gravity: 0.5,
		decayX: 1,//0.51,
		decayY: 1,
		angle: 0,
		spread: 360,
		addOnBottom: false,
		minScale: 1,
		maxScale: 1,
		scaleDecay: 1,
		variation: null,
		stretchFactor: null
	};

	s.DEFAULT_PARTICLE = new createjs.Shape(new createjs.Graphics().s("#f00").ss(12).mt(0,0).lt(6,0));
	s.DEFAULT_PARTICLE.cache(0,-6,6,2);

	/**
	 * Will toggle visibility of particles outside the bounds of the viewPort
	 * @param x
	 * @param y
	 * @param width
	 * @param height
	 */
	s.cull = function(x, y, width, height){
		var p, px, py, pw, ph;
		var cullCount = 0;
		for(var i = 0, l = ParticlePool.activeSprites.length; i < l; i++){
			p = ParticlePool.activeSprites[i].sprite;
			pw = p.width * p.scaleX;
			ph = p.height * p.scaleY;
			px = p.x - pw/2;
			py = p.y - ph/2;
			//Out on X?
			if(px < x || px + pw > x + width){
				p.visible = false;
				cullCount++;
			}
			//Out on y?
			else if(py > y + height || py < y - ph){
				p.visible = false;
				cullCount++;
			} else {
				p.visible = true;
			}
		}
		//Atari.trace("[ParticleEmitter] Culled: " + cullCount);
	};

	var p = ParticleEmitter.prototype = {

		/**
		 * The EaselJS Container that particles are drawn into.
		 * @property container
		 * @type Container
		 */
		container: null,

		/**
		 * A list of all the currently active particles for animating each tick.
		 * @property particles
		 * @type Array
		 * @protected
		 */
		particles: null,

		/**
		 * The default EaselJS Graphics object that is used by this emitter when an emit() call
		 * is made with no Graphics instance.
		 * @property defaultGraphics
		 * @type Graphics
		 * @protected
		 */
		defaultParticle: null,

		/**
		 * The default properties for particles.
		 * @property defaultProps
		 * @type Object
		 * @protected
		 */
		defaultProps: null,

		/**
		 * The factor to multiply speed values on in order to accommodate framerate changes.
		 * @property tickFactor
		 * @type Number
		 * @default 1
		 */
		tickFactor: 1,

		/**
		 * Initialize the ParticleEmitter
		 * @method initialize
		 * @param {Container} container The EaselJS Container that holds particles.
		 * @protected
		 */
		initialize:function (container, defaultParticle) {
			this.container = container;
			this.particles = [];

			if (defaultParticle == null) { defaultParticle = s.DEFAULT_PARTICLE; }
			this.defaultParticle = defaultParticle;

			this.defaultProps = s.DEFAULT_PROPS;
			createjs.Ticker.addListener(this);
		},

		/**
		 * Emit a number of particles. The particles will last until their lifespan decays, or the leave
		 * the stage bounds.
		 * @method emit
		 * @param {Point} position The point (object with x and y properties) where the emit
		 *      originates. This enables a moving emitter.
		 * @param {Number} numParticles The number of particles to be emitted at once.
		 * @param {Object} props An object that contains the rules for emitted particles, including:
		 * <ol>
		 *     <li>speed: The maximum number of pixels to move in each direction. The default value is 10.</li>
		 *     <li>decay: The overall lifespan decay of the particle. A high decay will cause the particle to last longer.
		 *          This is a number between 0 and 1. The default value is 0.94.</li>
		 *     <li>life: The lifespan of a particle. The decay is multiplied on the life each tick. Numbers above 1
		 *          will ensure the particle lasts longer. The default value is 1.</li>
		 *     <li>rotation: If the particle's rotation is affected by its x and y speed. The default is true.</li>
		 *     <li>gravity: The gravity on the particle, which is the number of pixels added to the "y" position
		 *          each tick. The default is 0.5.</li>
		 *     <li>angle: (Optional) An angle in degrees that the emitter directs its particles. The default is 0.</li>
		 *     <li>spread: The number of degrees to add to the angle in both directions. The default is 360 which
		 *          means it emits in all directions.</li>
		 *     <li>addOnBottom: If new particles are added on the bottom. The default is false.</li>
		 *     <li>minScale: The minimum scale of the particle. The default is 1.</li>
		 *     <li>maxScale: the maximum scale of the particle. The default is 1.</li>
		 *     <li>scaleDecay: The amount to multiply the particle scale by each tick. The default is 1.</li>
		 *     <li>variation: The amount of variation to scale the particle height. The variation is multiplied by Math.random()
		 *          and then added to 1. The default is null (not applied).</li>
		 *     <li>stretchFactor: The amount to scale the particle scaleX. This value is multiplied
		 *          by the x any velocity which give is directional velocity. The default is null (not applied)</li>
		 * @param {Shape | Bitmap | Image | BitmapAnimation} particle A display object that is used for the particle. The emitter is
		 *      optimized so that it does not re-create the image object for each particle. Instead it will use the existing image,
		 *      bitmap.image, shape.cacheCanvas (shapes must be cached), or bitmapAnimation.spriteSheet.
		 */
		emit: function(position, numParticles, props, particle) {
			if (particle == null) { particle = this.defaultParticle; }
			for(var i = 0; i < numParticles; i++) {
				this.createParticle(position, props, particle);
			}
		},

		/**
		 * Emit multiple particles at once. This is the same as emit(), but takes an array of particles instead.
		 * @method emitMultiple
		 * @param {Point} position The point (object with x and y properties) where the emit originates.
		 *      This enables a moving emitter.
		 * @param {Number} numParticles The number of particles to be emitted at once.
		 * @param {Object} props An object that contains the rules for emitted particles. Please see the emit()
		 *      method for details.
		 * @param {Array} particles A list of particles to emit. Particles are emitted in the order they are specified.
		 *      Please see the emit() method for details on what constitutes a particle.
		 */
		emitMultiple: function(position, numParticles, props, particles) {
			var pl = particles.length;
			for(var i = 0; i < numParticles; i++) {
				this.createParticle(position, props, particles[pl*Math.random()|0]);
			}
		},

		/**
		 * Create a particle. The particles are pulled from an object pool and reset for use.
		 * @method createParticle
		 * @param {Point} position The origin of the particle
		 * @param {Object} props An object that contains the rules for emitted particles (see the emit() method)
		 * @param {Graphics} graphics An EaselJS Graphics object that draws each particle.
		 * @return {Object} A particle that will be animated until it dies.
		 * @protected
		 */
		createParticle: function(position, props, particle) {
			var p = ParticlePool.remove(particle instanceof createjs.BitmapAnimation);

			if (props == null) { props = this.defaultProps; }
			var defaultProps = this.defaultProps;

			var emitAngle = props.angle || defaultProps.angle;
			var angle;
			if (emitAngle == 360) {
				angle = Math.random() * 360 * GameLibs.Math2.DEG_TO_RAD;
			} else {
				var spread = props.spread || defaultProps.spread;
				angle = (Math.random() * spread*2 - spread + emitAngle) * GameLibs.Math2.DEG_TO_RAD;
			}

			var speed = (props.speed || defaultProps.speed);
			if (props.staticSpeed != true) { speed *= Math.random(); }
			p.vx = Math.cos(angle) * speed;
			p.vy = Math.sin(angle) * speed;

			p.life = (props.life || defaultProps.life);
			p.life = Math.random() * (p.life * 0.5) + p.life * 0.5;

			p.decay = props.decay != null ? props.decay : defaultProps.decay; // Lifespan decay
			p.decayX = props.decayX != null ? props.decayX : defaultProps.decayX;
			p.decayY = props.decayY != null ? props.decayY : defaultProps.decayY;
			p.rotate = props.rotation != null ? props.rotation : defaultProps.rotation;
			p.gravity = props.gravity != null ? props.gravity : defaultProps.gravity;
			p.stretchFactor = props.stretchFactor != null ? props.stretchFactor : defaultProps.stretchFactor;
			p.minScale = props.minScale != null ? props.minScale : defaultProps.minScale;
			p.maxScale = props.maxScale != null ? props.maxScale : defaultProps.maxScale;
			p.scaleDecay = props.scaleDecay != null ? props.scaleDecay : defaultProps.scaleDecay;

			var sprite = p.sprite;
			if (particle instanceof createjs.Bitmap) {
				sprite.image = particle.image;
				sprite.width = particle.width;
				sprite.height = particle.height;
				sprite.regX = particle.image.width/2;
				sprite.regY = particle.image.height/2;
			} else if (particle instanceof createjs.Shape) {
				sprite.image = particle.cacheCanvas;
			} else if(particle instanceof createjs.BitmapAnimation) {
				sprite.spriteSheet = particle.spriteSheet;
				sprite.width = particle.width;
				sprite.height = particle.height;
				sprite.regX = particle.regX;
				sprite.regY = particle.regY;
				sprite.gotoAndStop(particle.currentAnimation);
			} else {
				sprite.image = particle;
			}
			sprite.alpha = p.life;
			sprite.x = position.x;
			sprite.y = position.y;
			sprite.rotation = props.actualRotation || 0;
			sprite.scaleX = sprite.scaleY = p.minScale + (p.maxScale - p.minScale) * Math.random();

			if (props.variation != null) {
				sprite.scaleY = (Math.random() * props.variation) + 1;
			}

			this.particles.push(p);
			if(props.addOnBottom){
				this.container.addChildAt(p.sprite, 0);
			} else {
				this.container.addChild(p.sprite);
			}

			return p;
		},

		/**
		 * Tick all the active particles. This moves them and applies decay, rotation, etc.
		 * @method tick
		 * @protected.
		 */
		tick: function() {
			for(var i = 0, l = this.particles.length; i < l; i++) {
				var p = this.particles[i];

				try {
					var s = p.sprite;
				} catch(e){
					throw(e);
				}
				s.x += (p.vx*this.tickFactor);
				s.y += (p.vy*this.tickFactor);
				if (p.rotate) { s.rotation = Math.atan2(p.vy, p.vx) * GameLibs.Math2.RAD_TO_DEG; }

				s.alpha = p.life;

				p.life *= p.decay;
				p.vx *= p.decayX;
				p.vy *= p.decayY;
				if (p.gravity) {
					p.vy += p.gravity;
				}

				s.scaleX *= p.scaleDecay;
				s.scaleY *= p.scaleDecay;

				// A variation on the scaleX This ia factor of the speed.
				if (p.stretchFactor != null) {
					s.scaleX = (p.vx * p.vy) * p.stretchFactor;
				}
				if (p.life < 0.01 || p.scaleX < .02 || p.scaleX < .02) { //} || Math.abs(p.vx* p.vy)<0.01) { //TODO Check bounds and speed?
					//TODO: Also check stage bounds
					this.container.removeChild(s);
					this.particles.splice(i,1);
					ParticlePool.add(p);
					i--; l--;
				}
			}

		},

		toString:function () {
			return "[ParticleEmitter]";
		}

	}

	scope.ParticleEmitter = ParticleEmitter;


	/**
	 * A simple object pool to help re-use particles.
	 * @class Pool
	 * @static
	 */
	function ParticlePool() {}

	/**
	 * A list of available particles.
	 * @property sprites
	 * @type {Array}
	 * @static
	 * @protected
	 */
	ParticlePool.sprites = [];
	ParticlePool.animatedSprites = [];

	ParticlePool.activeSprites = [];
	/**
	 * Add a particle back into the pool.
	 * @method add
	 * @param {Object} particle The particle object.
	 */
	ParticlePool.add = function(particle) {
		particle.animated
				? ParticlePool.animatedSprites.push(particle)
				: ParticlePool.sprites.push(particle);
		//Remove from active sprites
		var activeIndex = ParticlePool.activeSprites.indexOf(particle);
		if (activeIndex != -1) {
			ParticlePool.activeSprites.splice(activeIndex, 1);
		}
	}

	/**
	 * Remove a particle from the pool for use.
	 * @method remove
	 * @return {Object} A particle object. If there are none in the list, a new one is created.
	 */
	ParticlePool.remove = function(animated) {
		var p;
		var pool = animated ? ParticlePool.animatedSprites : ParticlePool.sprites;
		if (pool.length == 0) {
			p = {

				vx: 0,
				vy: 0,
				decay: 0,
				life: 1,
				animated: animated,

				gravity: 0.1,//0.7,

				decayX: 0,
				decayY: 0,

				rotate: false,
				sprite: null,

				reset: function() {
					this.vx = this.vy = this.decay = this.decayX = this.decayY = 0;
					this.life = 1;
					this.gravity = 0.1;
					this.rotate = false;
				},

				toString: function() {
					return "[PaticleEmitter.Particle]";
				}
			};
			p.sprite = animated ? new createjs.BitmapAnimation() : new createjs.Bitmap();
		} else {
			p = pool.shift();
		}
		//Add to active sprites
		ParticlePool.activeSprites.push(p);
		return p;

	}

	// ParticlePool is not added to the scope.


}(window.GameLibs))