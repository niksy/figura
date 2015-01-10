var $ = require('jquery');
var pick = require('object.pick');
var omit = require('except');
var Klass = require('kist-klass');
var meta = require('./meta');

var instanceCount = 0;
var delegateEventSplitter = /^(\S+)\s*(.*)$/;
var eventListSplitter = /([^\|\s]+)/g;
var viewOptions = ['el','events','childrenEl'];

var View = module.exports = Klass.extend({

	constructor: function ( options ) {

		View.prototype.$body = View.prototype.$body.length ? View.prototype.$body : $('body');

		options = typeof(options) === 'object' ? options : {};

		this.uid = instanceCount++;
		this.ens = meta.ns.event + '.' + this.uid;

		$.extend(this, pick(options, viewOptions));

		this._ensureElement();
		this.init.apply(this, arguments);

		View._super.constructor.apply(this, arguments);

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
	 * @return {View}
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
		this.options = $.extend({}, this.options, omit(options, viewOptions));
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
			selector = typeof(selector) === 'function' ? selector.call(this) : this.$(selector);
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
		this.undelegateEvents();
		$.each(events, $.proxy(function ( list, method ) {
			if ( typeof(method) !== 'function' ) {
				method = this[method];
			}
			if ( !method ) {
				return true;
			}
			var match = list.match(delegateEventSplitter);
			var eventMatch = match[1].match(eventListSplitter);
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
