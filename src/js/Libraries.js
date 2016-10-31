;(function(window, undefined){
	
	var w = window,
		doc = w.document,
		eMap = w.eMap || {};

	eMap.log = window._CMLS ? window._CMLS.logger : function(){
		if ( ! eMap.DEBUG) { return; }
		try {
			var ts = (new Date()),
				msg = [].slice.call(arguments);
			ts = ts.toISOString() ? ts.toISOString() : ts.toUTCString();
			msg.unshift('[eMap]');
			w.top.console.groupCollapsed.apply(w.top.console, msg);
			w.top.console.log('TIMESTAMP:', ts);
			w.top.console.trace();
			w.top.console.groupEnd();
		} catch(e){}
	};

	eMap.hasClass = function(obj, className){
		var classes = obj.getAttribute('class');
		if (classes) {
			classes = classes.split(' ');
			if (classes.indexOf(className) > -1) {
				return true;
			}
		}
		return false;
	};

	/**
	 * Adds a unique class to an object
	 * @param  {object} obj      Object to add a class to
	 * @param  {string} newClass New class to add
	 * @return {void}
	 */
	eMap.addClass = function(obj, newClass){
		var classes = obj.getAttribute('class');
		if (classes) {
			classes = classes.split(' ');
			if (classes.indexOf(newClass) > -1) {
				return;
			}
		} else {
			classes = [];
		}
		classes.push(newClass);
		obj.setAttribute('class', classes.join(' '));
	};

	/**
	 * Removes a class from an object
	 * @param  {object}        obj      Object to remove class from
	 * @param  {string|RegExp} oldClass Class name to remove
	 * @return {void}
	 */
	eMap.removeClass = function(obj, oldClass){
		obj.setAttribute('class', obj.getAttribute('class').replace(oldClass, ''));
	};

	/**
	 * Alias for document.querySelectorAll
	 * @param  {string} query  CSS query
	 * @param  {object} object Optional node to query under
	 * @return {NodeList}
	 */
	eMap.qsa = function(query, object){
		return (object||doc).querySelectorAll(query);
	};

	/**
	 * Alias for document.querySelector
	 * @param  {string} query  CSS query
	 * @param  {object} object Optional node to query under
	 * @return {Node}
	 */
	eMap.qs = function(query, object){
		return eMap.qsa(query, object)[0];
	};

	eMap.aEL = function(object, ev, callback, useCapture){
		return (object||w).addEventListener(ev, callback, useCapture);
	};

	eMap.rEL = function(object, ev, callback) {
		return (object||w).removeEventListener(ev, callback);
	};

	/**
	 * Fast string hashing
	 * From: https://github.com/darkskyapp/string-hash
	 * @param  {String} str
	 * @return {Number}
	 */
	/* jshint ignore:start */
	eMap.intHash = function(str) {
		var hash = 5381,
			i    = str.length;

		while(i) {
			hash = (hash * 33) ^ str.charCodeAt(--i);
		}

		/* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
		 * integers. Since we want the results to be always positive, convert the
		 * signed int to an unsigned by doing an unsigned bitshift. */
		return hash >>> 0;
	};
	/* jshint ignore:end */

}(window));