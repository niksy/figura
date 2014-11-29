/*! kist-segment 0.1.1 - Simple UI view. | Author: Ivan Nikolić <niksy5@gmail.com> (http://ivannikolic.com/), 2014 | License: MIT */
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self);var n=f;n=n.jQuery||(n.jQuery={}),n=n.kist||(n.kist={}),n.segment=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
var $ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);
var pick = require(6);
var omit = require(2);
var Klass = require(4);

var plugin = {
	ns: {
		event: '.kist.segment'
	}
};
var instanceCount = 0;
var delegateEventSplitter = /^(\S+)\s*(.*)$/;
var eventListSplitter = /([^\|\s]+)/g;
var segmentOptions = ['el','events','childrenEl'];

var Segment = Klass.extend({

	constructor: function ( options ) {

		options = typeof(options) === 'object' ? options : {};

		this.uid = instanceCount++;
		this.ens = plugin.ns.event + '.' + this.uid;

		$.extend(this, pick(options, segmentOptions));

		this._ensureElement();
		this.init.apply(this, arguments);

		Segment._super.constructor.apply(this, arguments);

	},

	$html: $('html'),
	$body: $('body'),
	$doc: $(document),
	$win: $(window),

	_ensureElement: function () {
		if ( !this.el ) {
			return;
		}
		this.setElement(this.el);
	},

	/**
	 * @param {Mixed} el
	 */
	_setElement: function ( el ) {
		this.$el = $(typeof(el) === 'function' ? el.call(this) : el);
		this.el = this.$el[0];
	},

	_removeElement: function () {
		this.$el.remove();
	},

	events: {},

	childrenEl: {},

	/**
	 * @param  {Mixed} selector
	 *
	 * @return {jQuery}
	 */
	$: function ( selector ) {
		return this.$el.find(selector);
	},

	init: function () {

	},

	/**
	 * @return {Segment}
	 */
	render: function () {
		return this;
	},

	remove: function () {
		this._removeElement();
	},

	/**
	 * @param {Object} options
	 */
	setOptions: function ( options ) {
		this.options = $.extend({}, this.options, omit(options, segmentOptions));
	},

	/**
	 * @param {Element} el
	 */
	setElement: function ( el ) {
		this.undelegateEvents();
		this._setElement(el);
		this.delegateEvents();
		this.cacheChildrenEl();
	},

	/**
	 * @param  {Object} childrenEl
	 */
	cacheChildrenEl: function ( childrenEl ) {
		childrenEl = childrenEl || this.childrenEl;
		$.each(childrenEl, $.proxy(function ( name, selector ) {
			selector = this.$(typeof(selector) === 'function' ? selector.call(this) : selector);
			if ( !selector ) {
				return true;
			}
			this['$' + name] = selector;
		}, this));
	},

	/**
	 * @param  {Object} events
	 */
	delegateEvents: function ( events ) {
		events = events || this.events;
		var match;
		this.undelegateEvents();
		$.each(events, $.proxy(function ( list, method ) {
			if ( typeof(method) !== 'function' ) {
				method = this[method];
			}
			if ( !method ) {
				return true;
			}
			match = list.match(delegateEventSplitter);
			eventMatch = match[1].match(eventListSplitter);
			for ( var i = 0, eventMatchLength = eventMatch.length; i < eventMatchLength; i++ ) {
				this.delegate(eventMatch[i], match[2], $.proxy(method, this));
			}
		}, this));
	},

	undelegateEvents: function () {
		if ( this.$el ) {
			this.$el.off(this.ens);
		}
	},

	/**
	 * @param  {String} eventName
	 * @param  {String} selector
	 * @param  {Function} listener
	 */
	delegate: function ( eventName, selector, listener ) {
		this.$el.on(eventName + this.ens, selector, listener);
	},

	/**
	 * @param  {String} eventName
	 * @param  {String} selector
	 * @param  {Function} listener
	 *
	 * @return {}
	 */
	undelegate: function ( eventName, selector, listener ) {
		this.$el.off(eventName + this.ens, selector, listener);
	}

});

module.exports = Segment;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],2:[function(require,module,exports){
'use strict';

var ap      = Array.prototype;
var concat  = ap.concat;
var slice   = ap.slice;
var indexOf = require(3);

function except(object) {
  var result = {};
  var keys = concat.apply(ap, slice.call(arguments, 1));

  for (var key in object) {
    if (indexOf(keys, key) === -1) {
      result[key] = object[key];
    }
  }

  return result;
}

module.exports = except;

},{}],3:[function(require,module,exports){

var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
},{}],4:[function(require,module,exports){
var objExtend = require(5);

/**
 * @param  {Mixed} prop
 *
 * @return {Object}
 */
function supply ( prop ) {
	if ( typeof(prop) === 'string' && this.prototype.hasOwnProperty(prop) ) {
		prop = this.prototype[prop];
	} else {
		prop = typeof(prop) === 'object' ? prop : {};
	}
	return objExtend.apply(this, [].concat([{}, prop], [].slice.call(arguments, 1)));
}

/**
 * @param  {Object} protoProps
 * @param  {Object} staticProps
 *
 * @return {Function}
 */
function extend ( protoProps, staticProps ) {

	var self = this;
	var Child;

	if ( protoProps && protoProps.hasOwnProperty('constructor') ) {
		Child = protoProps.constructor;
	} else {
		Child = function () {
			Child._super.constructor.apply(this, arguments);
		};
	}

	objExtend(Child, self, staticProps);

	function ChildTemp () {}
	ChildTemp.prototype = self.prototype;
	Child.prototype = new ChildTemp();
	Child.prototype.constructor = Child;
	Child._super = self.prototype;

	if ( protoProps ) {
		objExtend(Child.prototype, protoProps);
	}

	return Child;

}

function Klass () {}
objExtend(Klass, {
	extend: extend,
	supply: supply
});

module.exports = Klass;

},{}],5:[function(require,module,exports){
module.exports = extend

function extend(target) {
    for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

},{}],6:[function(require,module,exports){
/*!
 * object.pick <https://github.com/jonschlinkert/object.pick>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT License
 */

'use strict';

module.exports = function pick(orig, keys) {
  if (orig == null) {
    return {};
  }

  if (typeof keys === 'string') {
    keys = [].slice.call(arguments, 1);
  }

  var len = keys.length;
  var o = {};

  for (var i = 0; i < len; i++) {
    var key = keys[i];

    if (orig.hasOwnProperty(key)) {
      o[key] = orig[key];
    }
  }
  return o;
};

},{}]},{},[1])(1)
});