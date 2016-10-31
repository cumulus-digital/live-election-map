/* global _,moment */
;(function(window, undefined){
	
	function ToolTip(options){
		options = options || {};
		this.settings = {
			template: options.template || '#tooltip-template',
			boundary: options.boundaryContainer || '.tooltip-boundary',
			ttBody: options.ttBody || '.tt-inner',
			ttArrow: options.ttArrow || '.tt-arrow'
		};

		var w = window,
			doc = w.document,
			eMap = w.eMap || {},
			qsa = function(s,o) { return (o||doc).querySelectorAll(s); },
			qs = function(s,o) { return (o||doc).querySelector(s); },
			TT = this;

		/**
		 * Use the logger from the CMLS library if it's available,
		 * otherwise sub in our own.
		 * @return {void}
		 */
		var log = window._CMLS ? window._CMLS.logger : function(){
			if ( ! eMap.DEBUG) { return; }
			try {
				var ts = (new Date()),
					msg = [].slice.call(arguments);
				ts = ts.toISOString() ? ts.toISOString() : ts.toUTCString();
				msg.unshift('[eMI]');
				w.top.console.groupCollapsed.apply(w.top.console, msg);
				w.top.console.log('TIMESTAMP:', ts);
				w.top.console.trace();
				w.top.console.groupEnd();
			} catch(e){}
		};

		/**
		 * Clear out the tooltip container
		 * @return {void}
		 */
		TT.clearTooltip = function(){
			//templateContainer.innerHTML = '';
			templateContainer.currentState = null;
		};

		/**
		 * Clears the tooltip on a slight delay to
		 * prevent excessive flashing and disables
		 * following the mouse.
		 * @return {void}
		 */
		TT.hide = function(){
			hideTimer = setTimeout(function(){
				log('Hiding tooltip.');
				templateContainer.style.display = 'none';
				TT.clearTooltip();
			}, 100);
			stopFollowing();
		};
		TT.show = function(){
			log('Displaying tooltip');
			clearTimeout(hideTimer);
			hideTimer = null;
			templateContainer.style.display = 'block';
			startFollowing();
		};

		/**
		 * Compiles the template with new data and
		 * inserts it into the container.
		 * @param  {object} data Data to apply to the template
		 * @return {ToolTip}
		 */
		TT.update = function(data) {
			if (templateContainer.currentState === data.State) {
				return TT;
			}
			log('Received new data for tooltip', data);
			templateContainer.className = '';
			var zones = [].slice.call(qsa('[data-var]', templateContainer));
			zones.forEach(function(zone){
				var v = zone.getAttribute('data-var');
				if ( ! data[v]) {
					zone.innerText = '';
					return;
				}
				if (v === 'timestamp' && moment) {
					zone.innerText = 'Updated ' + data[v].fromNow();
					return;
				}
				log(v, data[v]);
				if (data[v] === 'NOTONBALLOT' && v.indexOf('Votes') > -1) {
					templateContainer.className += ' hide-' + v.substr(0,1);
				}
				zone.innerText = data[v];
			});
			if (data.CalledFor) {
				templateContainer.className += ' called called-' + data.CalledFor;
			}
			templateContainer.currentState = data.State;
			return TT;
		};

		/**
		 * Enables following the mouse
		 * @return {void}
		 */
		function startFollowing(){
			this.movementListener = _.throttle(positionTooltip, 30);
			boundary.addEventListener(
				'mousemove',
				this.movementListener
			);
		}

		/**
		 * Disable following the mouse
		 * @return {void}
		 */
		function stopFollowing(){
			if ( ! this.movementListener) { return; }
			boundary.removeEventListener(
				'mousemove',
				this.movementListener
			);
		}

		/**
		 * Positions the tooltip above the mouse and the tooltip
		 * arrow to the mouse.  Contains the tooltip within the
		 * boundary, and contains the arrow within the width of
		 * the tooltip.
		 * @param  {MouseEvent} e
		 * @return {void}
		 */
		function positionTooltip(e){
			// Get current positions and widths
			var ttWidth = parseInt(ttBody.offsetWidth, 10),
				ttHeight = parseInt(ttBody.offsetHeight, 10),
				taWidth = parseInt(ttArrow.offsetWidth, 10),
				taHeight = parseInt(ttArrow.offsetHeight, 10),
				ttNewX = e.pageX - (ttWidth / 2),
				ttNewY = e.pageY - ttHeight - taHeight - 12,
				taNewX = e.pageX - (taWidth / 2);

			// Get boundary container rectangle
			var boxC = boundary.getBoundingClientRect();

			// Make sure we stay within the boundary
			if (ttNewX + ttWidth > boxC.right) {
				ttNewX = boxC.right - ttWidth;
			}
			if (ttNewX < boxC.left) {
				ttNewX = boxC.left;
			}

			ttBody.style.left = ttNewX + 'px';
			ttBody.style.top = ttNewY + 'px';

			// Make sure the arrow stays within the body width
			if (taNewX + taWidth > ttNewX + ttWidth) {
				taNewX = ttNewX + ttWidth - taWidth - 1;
			}
			if (taNewX < ttNewX) {
				taNewX = ttNewX + 1;
			}

			ttArrow.style.left = taNewX + 'px';
			ttArrow.style.top = ttNewY + ttHeight + 'px';
		}

		// Initialize!

		var templateNode = qs(TT.settings.template),
			boundary = qs(TT.settings.boundary),
			ttBody, ttArrow,
			hideTimer;

		// Insert the template at the body so we can position
		// it anywhere we need to.
		var templateContainer = doc.createElement('div');
			templateContainer.innerHTML = templateNode.innerHTML;
			templateContainer.style.display = 'none';
			templateContainer.id = 'ToolTip' + Math.floor(Math.random()*1000);
		qs('body').appendChild(templateContainer);
		ttBody = qs(TT.settings.ttBody, templateContainer);
		ttArrow = qs(TT.settings.ttArrow, templateContainer);

	}
	/**
	 * Check a variable with case insensitivity
	 * for strings.
	 * @param  {*} data Variable to check
	 * @param  {*} val  Value to confirm
	 * @return {boolean}
	 */
	ToolTip.prototype.checkForValue = function checkForValue(data, val){
		if (
			typeof data === 'string' &&
			data.toLowerCase() === val.toLowerCase()
		) {
			return true;
		}
		if (data === val) { return true; }
		return false;
	};

	// Export library
	window.eMapToolTip = ToolTip;

}(window));