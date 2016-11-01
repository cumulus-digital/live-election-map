/* global _ */
/**
 * Fireworks library adapted from https://github.com/paullewis/Fireworks
 */
;(function(window, undefined){
	var w = window,
		doc = w.document;

	w.requestAnimFrame = (function(){
		return  w.requestAnimationFrame       ||
		w.webkitRequestAnimationFrame ||
		w.mozRequestAnimationFrame    ||
		w.oRequestAnimationFrame      ||
		w.msRequestAnimationFrame     ||
		function( callback ){
			w.setTimeout(callback, 1000 / 60);
		};
	})();

	/**
	 * Use the logger from the CMLS or eMap library if it's available,
	 * otherwise sub in our own.
	 * @return {void}
	 */
	var log = window._CMLS ? window._CMLS.logger : (w.eMap && w.eMap.log) ? w.eMap.log : function(){
		if ( w.eMap && ! w.eMap.DEBUG) { return; }
		try {
			var ts = (new Date()),
				msg = [].slice.call(arguments);
			ts = ts.toISOString() ? ts.toISOString() : ts.toUTCString();
			msg.unshift('[eMF]');
			w.top.console.groupCollapsed.apply(w.top.console, msg);
			w.top.console.log('TIMESTAMP:', ts);
			w.top.console.trace();
			w.top.console.groupEnd();
		} catch(e){}
	};

	function Fireworks() {
		var FWInstance = this,
			particles = [],
			mainCanvas = null,
			mainContext = null,
			fireworkCanvas = null,
			fireworkContext = null,
			viewportWidth = 0,
			viewportHeight = 0,
			destroyTimer = 0;

		/**
		 * Stores a collection of functions that
		 * we can use for the firework explosions. Always
		 * takes a firework (Particle) as its parameter
		 */
		this.FireworkExplosions = {

			/**
			 * Explodes in a roughly circular fashion
			 */
			circle: function(firework) {

				var count = 130;
				var angle = (Math.PI * 2) / count;
				while (count--) {

					var randomVelocity = 4 + Math.random() * 4;
					var particleAngle = count * angle;


					FWInstance.createParticle(
						firework.pos,
						null, {
							x: Math.cos(particleAngle) * randomVelocity,
							y: Math.sin(particleAngle) * randomVelocity
						},
						firework.color,
						true);
				}
			},

			/**
			 * Explodes in a star shape
			 */
			star: function(firework) {

				// set up how many points the firework
				// should have as well as the velocity
				// of the exploded particles etc
				var points = 6 + Math.round(Math.random() * 15);
				var jump = 3 + Math.round(Math.random() * 7);
				var subdivisions = 12;
				var radius = 80;
				var randomVelocity = -(Math.random() * 3 - 6);

				var start = 0;
				var end = 0;
				var circle = Math.PI * 2;
				var adjustment = Math.random() * circle;

				do {

					// work out the start, end
					// and change values
					start = end;
					end = (end + jump) % points;

					var sAngle = (start / points) * circle - adjustment;
					var eAngle = ((start + jump) / points) * circle - adjustment;

					var startPos = {
						x: firework.pos.x + Math.cos(sAngle) * radius,
						y: firework.pos.y + Math.sin(sAngle) * radius
					};

					var endPos = {
						x: firework.pos.x + Math.cos(eAngle) * radius,
						y: firework.pos.y + Math.sin(eAngle) * radius
					};

					var diffPos = {
						x: endPos.x - startPos.x,
						y: endPos.y - startPos.y,
						a: eAngle - sAngle
					};

					// now linearly interpolate across
					// the subdivisions to get to a final
					// set of particles
					for (var s = 0; s < subdivisions; s++) {

						var sub = s / subdivisions;
						var subAngle = sAngle + (sub * diffPos.a);

						FWInstance.createParticle({
								x: startPos.x + (sub * diffPos.x),
								y: startPos.y + (sub * diffPos.y)
							},
							null, {
								x: Math.cos(subAngle) * randomVelocity,
								y: Math.sin(subAngle) * randomVelocity
							},
							firework.color,
							true);
					}

					// loop until we're back at the start
				} while (end !== 0);

			}

		};


		// Create a single firework
		this.createFirework = function createFirework(color) {
			destroyTimer = 0;
			FWInstance.createParticle(0,0,0,color);
		};

		/**
		 * Creates a block of colours for the
		 * fireworks to use as their colouring
		 */
		function createFireworkPalette(gridSize) {
			var size = gridSize * 10;

			fireworkCanvas.width = size;
			fireworkCanvas.height = size;
			fireworkContext.globalCompositeOperation = 'destination-over';

			// Create 100 blocks which cycle through the rainbow
			for (var c = 0; c < 100; c++) {
				var marker = (c * gridSize);
				var gridX = marker % size;
				var gridY = Math.floor(marker / size) * gridSize;

				var xAxis = gridX + (gridSize / 2),
					yAxis = gridY + (gridSize / 2),
					gradient = fireworkContext.createRadialGradient(
						xAxis,
						yAxis,
						gridSize/1.4,
						xAxis,
						yAxis,
						1
					);
				gradient.addColorStop(0,"hsla(" + Math.round(c * 3.6) + ", 150%, 0%, 0");
				gradient.addColorStop(1,"hsla(" + Math.round(c * 3.6) + ", 100%, 60%, 1");
				fireworkContext.fillStyle = gradient;
				fireworkContext.fillRect(gridX, gridY, gridSize, gridSize);
				/*
				fireworkContext.fillStyle = "hsl(" + Math.round(c * 3.6) + ", 100%, 60%)";
				fireworkContext.beginPath();
				fireworkContext.arc(gridX+(gridSize/2)-1, gridY+(gridSize/2)-1,(gridSize/2)-2, 0, 2*Math.PI);
				fireworkContext.fillStyle = gradient;
				fireworkContext.fill();
				/*
				fireworkContext.fillRect(gridX, gridY, gridSize, gridSize);
				fireworkContext.drawImage(
					bigGlow,
					gridX,
					gridY
				);
				*/
				//document.body.style.background = "url(" + fireworkCanvas.toDataURL() + ") no-repeat";
			}
		}

		/**
		 * Update the canvas based on the
		 * detected viewport size
		 */
		function setMainCanvasDimensions() {
			mainCanvas.width = viewportWidth;
			mainCanvas.height = viewportHeight;
		}

		/**
		 * The main loop where everything happens
		 */
		this.update = function update() {
			if (destroyTimer > 1000) {
				FWInstance.destroy();
				return;
			}
			if (particles.length < 1) {
				destroyTimer++;
			}
			w.requestAnimFrame(FWInstance.update);
			clearContext();
			drawFireworks();
		};

		this.destroy = function destroy(){
			log('Destroying previously created fireworks canvas.');
			mainCanvas.parentNode.removeChild(mainCanvas);
			w.removeEventListener('resize', resizeHandler);
		};

		/**
		 * Clears out the canvas with semi transparent
		 * black. The bonus of this is the trails effect we get
		 */
		function clearContext() {
			//mainContext.fillStyle = "rgba(3,20,56,0.5)";
			//mainContext.fillRect(0,0,viewportWidth, viewportHeight);
			//mainContext.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
			mainCanvas.width = mainCanvas.width;
		}

		/**
		 * Passes over all particles particles
		 * and draws them
		 */
		function drawFireworks() {
			var a = particles.length;

			while(a--) {
				var firework = particles[a];

				// if the update comes back as true,
				// then the firework should explode
				if (firework.update()) {

					// kill off the firework, replace it
					// with the particles for the exploded version
					particles.splice(a, 1);

					// if the firework isn't using physics, then
					// we know we can safely(!) explode it
					if ( ! firework.usePhysics) {
						if (Math.random() < 0.8) {
							FWInstance.FireworkExplosions.star(firework);
						} else {
							FWInstance.FireworkExplosions.circle(firework);
						}
					}
				}

				// pass the canvas context and the firework color
				// to the renderer
				firework.render(mainContext, fireworkCanvas);
			}
		}

		/**
		 * Creates a new particle / firework
		 */
		this.createParticle = function createParticle(pos, target, vel, color, usePhysics) {
			pos = pos || {};
			target = target || {};
			vel = vel || {};

			// Introduce some randomness to the color choice
			var rand = Math.floor(Math.random() * 5) * 12;
			rand *= Math.floor(Math.random()*2) === 1 ? 1 : -1;
			color += rand;

			particles.push(
				new Particle(
					// position
					{
						x: pos.x || viewportWidth * 0.5,
						y: pos.y || viewportHeight + 10
					},
					// target
					{
						y: target.y || 200 + Math.random() * 200
					},
					// velocity
					{
						x: vel.x || (Math.random() * 10) - 5,
						y: vel.y || 0
					},

					color || Math.floor(Math.random() * 100) * 12,

					usePhysics
				)
			);
		};

		function getContainerSize(){
			if (electionContainer) {
				return [
					electionContainer.innerWidth,
					electionContainer.innerHeight
				];
			}
			return [
				w.innerWidth,
				w.innerHeight
			];
		}

		/**
		 * Callback for window resizing -
		 * sets the viewport dimensions
		 */
		function onWindowResize() {
			var size = getContainerSize();
			viewportWidth = size[0];
			viewportHeight = size[1];
			if (mainCanvas) {
				setMainCanvasDimensions();
			}
		}

		// start by measuring the viewport
		onWindowResize();

		var resizeHandler = onWindowResize;
		if (w._) {
			resizeHandler = w._.throttle(onWindowResize, 100);
		}
		w.addEventListener('resize', resizeHandler);

		// create a canvas for the fireworks
		log('CREATING NEW CANVAS');
		mainCanvas = doc.createElement('canvas');
		mainCanvas.id = 'mainFireworksCanvas' + Math.floor(Math.random()*1000000);
		mainCanvas.style.position = 'absolute';
		mainCanvas.style.top = 0;
		mainCanvas.style.left = '50%';
		mainCanvas.style.transform = 'translateX(-50%)';
		mainContext = mainCanvas.getContext('2d');

		// add the canvas in
		var electionContainer = doc.querySelector('#election-container');
		if (electionContainer) {
			electionContainer.appendChild(mainCanvas);
		} else {
			doc.body.appendChild(mainCanvas);
		}

		// and another one for, like, an off screen buffer
		// because that's rad n all
		fireworkCanvas = doc.createElement('canvas');
		fireworkContext = fireworkCanvas.getContext('2d');

		// set up the colours for the fireworks
		createFireworkPalette(12);

		// set the dimensions on the canvas
		setMainCanvasDimensions();

		this.update();
	}

	/**
	 * Represents a single point, so the firework being fired up
	 * into the air, or a point in the exploded firework
	 */
	function Particle(pos, target, vel, marker, usePhysics) {

		// properties for animation and color
		this.GRAVITY = 0.2;
		this.alpha = 1;
		this.easing = Math.random() * 0.04;
		this.fade = (Math.random() * 0.1) + 0.018;
		this.gridX = marker % 120;
		this.gridY = Math.floor(marker / 120) * 12;
		this.color = marker;

		this.pos = {
			x: pos.x || 0,
			y: pos.y || 0
		};

		this.vel = {
			x: vel.x || 0,
			y: vel.y || 0
		};

		this.lastPos = {
			x: this.pos.x,
			y: this.pos.y
		};

		this.target = {
			y: target.y || 0
		};

		this.usePhysics = usePhysics || false;

		this.update = function update() {
			this.lastPos.x = this.pos.x;
			this.lastPos.y = this.pos.y;

			if (this.usePhysics) {
				this.vel.y += this.GRAVITY;
				this.pos.y += this.vel.y;

				// since this value will drop below zero
				// we'll occassionally see flicker
				this.alpha -= this.fade;
			} else {
				var distance = (this.target.y - this.pos.y);

				this.pos.y += distance * (0.03 + this.easing);

				// cap to 1
				this.alpha = Math.min(distance * distance * 0.00005, 1);
			}

			this.pos.x += this.vel.x;

			return (this.alpha < 0.005);
		};

		this.render = function render(context, fireworkCanvas) {
			var x = Math.round(this.pos.x),
				y = Math.round(this.pos.y),
				xVel = (x - this.lastPos.x) * -5,
				yVel = (y - this.lastPos.y) * -5;

			context.save();
			context.globalCompositeOperation = 'xor';
			context.globalAlpha = Math.random() * this.alpha;

			// draw a line from where we were to where we are now
			context.fillStyle = "rgba(255,255,255,0.3";
			context.beginPath();
			context.moveTo(this.pos.x, this.pos.y);
			context.lineTo(this.pos.x + 1.5, this.pos.y);
			context.lineTo(this.pos.x + xVel, this.pos.y + yVel);
			context.lineTo(this.pos.x - 1.5, this.pos.y);
			context.closePath();
			context.fill();

			// Draw in images
			context.drawImage(
				fireworkCanvas,
				this.gridX, this.gridY,
				12, 12, x - 6, y - 6, 12, 12
			);
			var gradient = context.createRadialGradient(
					x,
					y,
					4,
					x,
					y,
					0
				);
			gradient.addColorStop(0,"rgba(255,255,255,0)");
			gradient.addColorStop(1,"rgba(255,255,255,1)");
			context.fillStyle = gradient;
			context.fillRect(x-3, y-3, 6, 6);
			/*
			context.fillStyle = "#fff";
			context.arc(x,y,1,0,2*Math.PI);
			context.fill();
			*/
			/*
			context.drawImage(smallGlow, x - 3, y - 3);
			*/
			if (Math.floor(Math.random()*2) === 1) {
				//context.restore();
			}
		};

	}

	//w.eMapFireworks = Fireworks;

	var maxCount = 5,
		teams = {
			red: {
				currentCount: 0,
				color: 1092,
				timer: null,
				launching: false
			},
			blue: {
				currentCount: 0,
				color: 720,
				timer: null,
				launching: false,
			}
		};

	w.launchFireworks = function(team, tMF, numberOfFireworks) {
		var innerMaxCount = numberOfFireworks || maxCount;
		teams[team].currentCount = 0;
		if (teams[team].launching) {
			log('TEAM IS ALREADY LAUNCHING');
			return;
		}
		log('LAUNCHING FIREWORKS', team);
		var eMF = tMF || new Fireworks();
		function launch(team) {
			if (teams[team].currentCount >= innerMaxCount){
				log('DONE LAUNCHING');
				teams[team].currentCount = 0;
				teams[team].launching = false;
				clearTimeout(teams[team].timer);
				teams[team].timer = null;
				return;
			}
			log('FIREWORKS VOLLEY ' + teams[team].currentCount);
			function launchOne(){
				// add a random pad to launch time unless we're specifically requesting a launch
				var timeToLaunch = numberOfFireworks ? 0 : 100 + (Math.random()*2500);
				setTimeout(function(){
					eMF.createFirework(teams[team].color);
				}, timeToLaunch);
			}
			var toLaunch = numberOfFireworks || Math.floor(Math.random()*3) + 2;
			log('LAUNCHING ' + toLaunch + ' FIREWORKS');
			for(var i = toLaunch; i > 0; i--) {
				launchOne();
			}
			teams[team].currentCount++;
			teams[team].launching=true;
			clearTimeout(teams[team].timer);
			teams[team].timer = null;
			teams[team].timer = setTimeout(function() {
				launch(team);
			}, Math.random()*3200);
		}

		launch(team);
	};

}(window));