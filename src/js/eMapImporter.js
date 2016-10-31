/* global _,moment */
;(function(window, undefined){
	/**
	 * Handles fetching and parsing of state data.  Fires the following
	 * window events on updates:
	 * 	'emap.state.update'		New data for a state
	 * 	'emap.state.called'		When a state is called for a candidate
	 * 	'emap.loading'			Data is currently being fetched
	 * 	'emap.loaded'			Data is loaded and parsed
	 * 	
	 * @param  {object} dataSource
	 * @param  {object} stateData  Persistant store of state data
	 * @param  {object} options    Optional arguments
	 * @return {eMapImporter}
	 */
	function eMapImporter(dataSource, stateData, options){
		options = options || {};
		this.settings = {
			dataSource: dataSource || null,
			stateData: stateData || {},
			refreshTime: options.refreshTime || 60000,
			randomPad: options.randomPad || 60000,
			autoInit : options.autoInit || false
		};

		var w = window,
			doc = w.document,
			eMap = w.eMap || {},
			eMI = this,
			hidden, visibilityChange,
			fetchTimer, fetchErrorCount, restartTimerNote, refreshAtTime;

		/**
		 * Use the logger from the CMLS or eMap library if it's available,
		 * otherwise sub in our own.
		 * @return {void}
		 */
		var log = window._CMLS ? window._CMLS.logger : (eMap && eMap.log) ? eMap.log : function(){
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
		 * Generic event firing
		 * @param  {object} el   Element to fire event on
		 * @param  {string} name Name of the event
		 * @param  {*} data [description]
		 * @return {[type]}      [description]
		 */
		eMI.fireEvent = function fireEvent(el, name, data) {
			var ev;
			if (doc.createEvent) {
				ev = doc.createEvent('CustomEvent');
				ev.initCustomEvent(name, true, true, data);
			} else {
				ev = new CustomEvent(name, {'detail': data});
			}
			el.dispatchEvent(ev);
		};

		function updateStateData(state, data){
			var originalData = stateData[state] || {};
			stateData[state] = data;
			eMI.fireEvent(w, 'emap.state.update', data);
			log('Updating state [' + state + ']', originalData, data);
			if ( 
				data.CalledFor &&
				(
					! originalData.CalledFor || 
					originalData.CalledFor !== data.CalledFor
				)
			) {
				var callData = {
					state: data.StateAbbr,
					elVotes: data.ElVotes,
					for: data.CalledFor
				};
				log('STATE CALLED', callData);
				eMI.fireEvent(w, 'emap.state.called', callData);
			}
		}

		function clearFetchTimer(){
			clearTimeout(fetchTimer);
			fetchTimer = null;
			return fetchTimer;			
		}

		function fetchData(){
			if ( ! dataSource) {
				log('No datasource provided.');
				return;
			}
			log('Fetching new data...');
			eMI.fireEvent(w, 'emap.loading');
			clearFetchTimer();
			eMI.settings.dataSource.reset();
			eMI.settings.dataSource.fetch({
				success: function(){
					parseData();
				},
				error: function(){
					if (fetchErrorCount > 10) {
						eMI.fireEvent(w, 'emap-error', {
							message: 'Too many errors fetching data, please reload the page at a later time.'
						});
						return;
					}
					fetchErrorCount++;
					clearFetchTimer();
					fetchTimer = setTimeout(fetchData, 2000);
				}
			});
		}
		this.forceFetchData = fetchData;

		function parseData(){
			log('Data received');
			fetchErrorCount = 0;

			// Sort data by timestamp
			eMI.settings.dataSource.sort(function(rowA, rowB){
				if (rowA.timestamp > rowB.timestamp) {
					return 1;
				}
				if (rowA.timestamp < rowB.timestamp) {
					return -1;
				}
				return 0;
			});

			var rows = eMI.settings.dataSource.rows(),
				loaded = _.after(rows.length, function(){
					log('New Totals: ', stateData.TOTALS);
					if ( ! doc[hidden]) {
						eMI.startFetchTimer();
					} else {
						log('Document is hidden, will not start timer.');
					}
					eMI.fireEvent(w, 'emap.loaded');
				});

			stateData.TOTALS = {
				RVotes: 0,
				DVotes: 0,
				LVotes: 0,
				GVotes: 0
			};
			log('Pre-fetch Totals:', stateData.TOTALS);

			rows.each(function(row){
				if (row.StateAbbr) {
					updateStateData.call(eMI, row.StateAbbr, row);
				}
				if (row.State === 'TOTALS') {
					stateData.TOTALS = {
						RVotes: row.RVotes,
						DVotes: row.DVotes,
						LVotes: row.LVotes,
						GVotes: row.GVotes
					};
				}
				loaded();
			});
		}

		eMI.stopFetchTimer = function(){
			clearFetchTimer();
		};
		eMI.startFetchTimer = function(forceTime){
			if (eMI.settings.refreshTime) {
				var mS = forceTime || eMI.settings.refreshTime + Math.floor(Math.random() * eMI.settings.randomPad);
				log('Refreshing data in ' + mS/1000 + ' seconds.');
				fetchTimer = setTimeout(fetchData, mS);
				refreshAtTime = new Date((new Date()).getTime() + mS);
			}
		};

		/**
		 * Determine visibility API for the current browser
		 */
		if (typeof doc.hidden !== 'undefined') {
			hidden = 'hidden';
			visibilityChange = 'visibilitychange';
		} else if (typeof doc.msHidden !== 'undefined') {
			hidden = 'msHidden';
			visibilityChange = 'msvisibilitychange';
		} else if (typeof doc.webkitHidden !== 'undefined') {
			hidden = 'webkitHidden';
			visibilityChange = 'webkitvisibilitychange';
		}

		/**
		 * Handles visibility changes on tab. If tab is hidden, timer
		 * is paused.  If tab is re-focused before original timer runs
		 * out, timer continues.  If tab is re-focused after original
		 * timer's expiry, fetch new data immediately.
		 * @return {void}
		 */
		function handleVisibilityChange(){
			var now = new Date();
			if (doc[hidden]) {
				if (fetchTimer){
					log(
						'Tab is hidden.  Pausing timer with ' +
						(
							(refreshAtTime.getTime() - now.getTime())/1000 ||
							'unknown'
						) +
						' seconds remaining.'
					);
					eMI.stopFetchTimer();
					restartTimerNote = true;
				}
			} else {
				if (restartTimerNote) {
					var setTime;
					if (refreshAtTime && now.getTime() < refreshAtTime.getTime()) {
						setTime = refreshAtTime.getTime() - now.getTime();
						eMI.startFetchTimer(setTime);
						restartTimerNote = false;
					} else {
						log('Tab was focused after original refresh time, fetching new data immediately.');
						fetchData();
					}
				} else {
					eMI.startFetchTimer();
				}
			}
		}

		// Set visibility change handler
		if (
			typeof doc.addEventListener !== 'undefined' &&
			typeof doc[hidden] !== 'undefined'
		) {
			doc.addEventListener(visibilityChange, handleVisibilityChange, false);
		}

		// Handle focus changes without visibility changes
		var originalRandomPad = eMI.settings.randomPad;
		w.addEventListener('blur', function(){
			eMI.settings.randomPad = originalRandomPad*2;
			log('Window lost focus, slowing down updates.', eMI.settings.refreshTime, eMI.settings.randomPad);
		});
		w.addEventListener('focus', function(){
			eMI.settings.randomPad = originalRandomPad;
			log('Window regained focus, restoring original update speed.', eMI.settings.refreshTime, eMI.settings.randomPad);
		});

		log('eMapImporter initialized.');

		eMI.init = function(){
			fetchData();
		};

		if (eMI.settings.autoInit === true) {
			eMI.init();
		}

		w.emapForceFetchData = eMI.forceFetchData;
	}

	window.eMapImporter = eMapImporter;
}(window));