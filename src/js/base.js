/* global Miso,moment */
// @codekit-append 'Libraries.js'
// @codekit-append 'eMapImporter.js'
// @codekit-append 'eMapToolTip.js'
// @codekit-append 'eMapFireworks.js'

;(function(window, undefined){

	var w = window;

	w.eMap = w.eMap || {};
	var eMap = w.eMap;

	var stateData = {}, eMI, eMTT, eMF, refreshAdsTimer,
		activateCallingEffects = false;

	function clearLog(){
		writeLoadingLog('');
	}
	function writeLoadingLog(str){
		var log = eMap.qs('.emap-loading-log');
		if (log) {
			log.innerHTML = str;
		}
	}

	function writeToLog(timestamp, str, logClass) {
		var log = eMap.qs('.emap-log'),
			hash = eMap.intHash(timestamp + str);
		if (log.innerHTML.indexOf('data-hash="' + hash + '"') > -1) {
			return;
		}
		var line = w.document.createElement('div');
			line.setAttribute('data-hash', hash);
			line.setAttribute('class', logClass);
		var time = w.document.createElement('time');
			time.setAttribute('class', 'emap-log-ts');
			time.setAttribute('datetime', timestamp.toDate().toISOString());
			line.appendChild(time);
		var body = w.document.createElement('span');
			body.setAttribute('class', 'emap-log-body');
			body.innerHTML = str;
			line.appendChild(body);

		log.insertBefore(line, log.firstChild);
	}

	var inits = {

		// Display the map when data is loaded
		displayMap: function(){
			eMap.aEL(w, 'emap.loaded', function(){
				clearLog();
				if (activateCallingEffects) {
					w.removeEventListener('emap.loaded', this);
					return;
				}

				activateCallingEffects = true;

				eMap.addClass(eMap.qs('#election-container'), 'loaded');
				clearLog();

				setTimeout(function(){
					eMap.qs('.emap-loading').style.display = 'none';
				}, 600);
			});
		},

		// Display a loading indicatior while loading
		showLoading: function(){
			eMap.aEL(w, 'emap.loading', function(){
				writeLoadingLog('Refreshing Data&hellip;');
			});
		},

		// Display an error
		showError: function(){
			eMap.aEL(w, 'emap.error', function(e){
				writeLoadingLog(e.detail);
			});
		},

		// Enable state tooltips
		stateTooltips: function(){

			var stateLayers = [].slice.call(eMap.qsa('g.em-state'));

			stateLayers.forEach(function(state){

				// show the tooltip on mouse over
				eMap.aEL(state, 'mouseover', function(e){
					var target = e.target;
					if (e.target.nodeName !== 'g') {
						target = e.target.parentNode;
					}

					// Make sure we've got a state group
					if (
						! target.getAttribute('data-state') ||
						! stateData[target.getAttribute('data-state')]
					) {
						return;
					}

					// Update and show the tooltip
					eMTT.update(stateData[target.getAttribute('data-state')]).show();
				});

				// Hide the tooltip on mouse out
				eMap.aEL(state, 'mouseout', eMTT.hide);
			});

		},

		// Fill in a state on the map when called
		callStateFill: function(){
			eMap.aEL(w, 'emap.state.called', function(e){
				if ( ! e.detail || ! e.detail.state || ! e.detail.for) {
					return;
				}

				var state = eMap.qs('.em-state[data-state="' + e.detail.state + '"]');

				// Don't call a state that's already called for the given team
				if (eMap.hasClass(state, 'called-' + e.detail.for)) {
					return;
				}

				// Fill the state with color
				eMap.removeClass(state, /called[\-DRLG\s]*/g);
				eMap.addClass(state, 'called');
				eMap.addClass(state, 'called-' + e.detail.for);

			});
		},

		// Launch fireworks when a state is called
		callStateFireworks: function(){
			eMap.aEL(w, 'emap.state.called', function(e){
				if (
					! activateCallingEffects ||
					! e.detail || ! e.detail.state || ! e.detail.for
				) {
					return;
				}
				if (e.detail.for === 'D' || e.detail.for === 'R') {
					eMap.log('LAUNCHING FIREWORKS!', e);
					w.launchFireworks(
						(e.detail.for === 'D' ? 'blue' : 'red'),
						eMF
					);
				}
			});
		},

		// Log a state call
		callStateLog: function(){
			eMap.aEL(w, 'emap.state.update', function(e){
				if (
					! e.detail || ! e.detail.State || ! e.detail.CalledFor || ! e.detail.timestamp
				) {
					eMap.log('Skipping log due to failed conditions.', e);
					return;
				}
				var candidates = {
					'D': 'Hillary Clinton',
					'R': 'Donald J. Trump',
					'L': 'Garry Johnson',
					'G': 'Jill Stein'
				};
				if ( ! candidates[e.detail.CalledFor]) {
					eMap.log('[' + e.detail.StateAbbr + '] Skipping log due to mismatched candidate.', e);
					return;
				}
				eMap.log('Updating log with call for ' + e.detail.StateAbbr, e);
				writeToLog(
					e.detail.timestamp,
					'<strong>' + e.detail.State + '</strong> called for ' + candidates[e.detail.CalledFor],
					'emap-log-' + e.detail.CalledFor
				);
			});
		},

		// Update general state info
		updateState: function(){
			eMap.aEL(w, 'emap.state.update', function(e){
				if ( ! e.detail || ! e.detail.StateAbbr) {
					return;
				}
				eMap.log('Caught updateState [' + e.detail.StateAbbr + ']', e);
				var state = eMap.qs('.em-state[data-state="' + e.detail.StateAbbr + '"]');

				// Remove a call if necessary
				if (
					state &&
					eMap.hasClass(state, 'called') &&
					! e.detail.CalledFor
				) {
					eMap.log('Removing call from state [' + e.detail.StateAbbr + ']');
					eMap.removeClass(state, /\s*called[\-DRLG\s]*/g);
					if ( ! e.detail.timestamp) {
						e.detail.timestamp = moment();
					}
					writeToLog(
						e.detail.timestamp,
						'<strong>' + e.detail.State + '</strong> recalled!'
					);
				}
			});
		},

		// Update bar graph
		updateBar: function(){
			eMap.aEL(w, 'emap.loaded', function(){
				if ( ! stateData.TOTALS) {
					eMap.log('Attempted to update bar without totals', stateData);
					return;
				}
				function makeUpdate(uBar, total){
					var totalText = eMap.qs('span', uBar);
					if (totalText.innerText !== total) {
						totalText.innerText = total;
						eMap.addClass(uBar, 'egraph-updating');
						uBar.style.width = 100 * (total / 538) + '%';
						setTimeout(function(){
							eMap.removeClass(uBar, 'egraph-updating');
						}, 1500);
					}
				}
				var bar;
				if (stateData.TOTALS.RVotes) {
					bar = eMap.qs('.egraph-bar-r');
					makeUpdate(bar, stateData.TOTALS.RVotes);
				}
				if (stateData.TOTALS.DVotes) {
					bar = eMap.qs('.egraph-bar-d');
					makeUpdate(bar, stateData.TOTALS.DVotes);
				}
			});
		},

		// Refresh ads when the graph is updated
		refreshAds: function(){
			eMap.aEL(w, 'emap.loaded', function(){
				if ( ! activateCallingEffects || ! w.googletag || ! stateData.TOTALS) {
					return;
				}
				try{
					// Put the refresh in a timer as a simple debounce
					clearTimeout(refreshAdsTimer);
					refreshAdsTimer = null;
					refreshAdsTimer = setTimeout(function(){
						w.googletag.cmd.push(function(){
							eMap.log('Refreshing ads.');
							w.googletag.pubads().refresh();
						});
					}, 200);
				} catch(e){}
			});
		},

		closeWelcome: function(){
			var close = eMap.qs('.emap-w-close');
			function closeWelcome(){
				eMap.log('Closing welcome message.');
				var welcome = eMap.qs('.emap-welcome');
				eMap.addClass(welcome, 'emap-closed');
				eMap.rEL(close, 'click', closeWelcome);
				eMap.rEL(w, 'click', closeWelcome);
			}
			eMap.aEL(close, 'click', closeWelcome);
			eMap.aEL(w, 'click', closeWelcome);
		},

		/**
		 * Launch fireworks for a candidate when their portrait is clicked
		 * @return {void}
		 */
		launchOnClick: function(){
			eMap.aEL(eMap.qs('.egraph-d img'), 'click', function(){
				w.launchFireworks('blue', undefined, 1);
			});
			eMap.aEL(eMap.qs('.egraph-r img'), 'click', function(){
				w.launchFireworks('red', undefined, 1);
			});
		}

	};

	// The room where it happens
	w.eMapInit = function(){

		// Initialize DataSet
		var ds = new Miso.Dataset({
			importer: Miso.Dataset.Importers.GoogleSpreadsheet,
			parser: Miso.Dataset.Parsers.GoogleSpreadsheet,
			key: '1BAZmjnL7qWjJeVykQG78Ol2C4fneULJVItTSYugZbiE',
			worksheet: '1',
			columns: [
				{name: 'State', type: 'string'},
				{name: 'StateAbbr', type: 'string'},
				{name: 'ElVotes', type: 'number'},
				{name: 'CalledFor', type: 'string'},
				{name: 'RVotes', type: 'string'},
				{name: 'DVotes', type: 'string'},
				{name: 'LVotes', type: 'string'},
				{name: 'GVotes', type: 'string'},
				{name: 'timestamp', type: 'time', format: 'YYYY-MM-DD[T]HH:mm:ssZ'},
			]
		});

		// Start the data importer
		eMI = new w.eMapImporter(ds, stateData, {autoInit: true, refreshTime: 120000});

		// Start the tooltip handler
		eMTT = new w.eMapToolTip();

		// Create the fireworks stage
		//eMF = new w.eMapFireworks();

		// Run our inits
		for(var i in inits){
			inits[i]();
		}

	};

	/**
	 * Update display times in log every second
	 * @return {void}
	 */
	function updateLogTimes(){
		if ( ! moment) {
			return;
		}
		var times = eMap.qsa('.emap-log time');
			times = [].slice.call(times);
		times.forEach(function(time){
			var thisTime = time.getAttribute('datetime');
			if (thisTime) {
				thisTime = moment(thisTime);
				time.innerText = thisTime.fromNow();
			}
		});
	}
	setInterval(updateLogTimes, 1000);

}(window.self));