'use strict';

const $ = require('jquery');
const pick = require('object.pick');
const omit = require('except');
const Klass = require('kist-klass');

const delegateEventSplitter = /^(\S+)\s*(.*)$/;
const eventListSplitter = /([^\|\s]+)/g;
const viewOptions = ['el', 'events', 'childrenEl'];
const eventNamespace = '.kist.view';
let instanceCount = 0;

const View = module.exports = Klass.extend({

	constructor: function ( options ) {

		View.prototype.$body = View.prototype.$body.length ? View.prototype.$body : $('body');

		options = typeof options === 'object' ? options : {};

		this.uid = instanceCount++;
		this.ens = `${eventNamespace}.${this.uid}`;

		$.extend(this, pick(options, viewOptions));

		this._ensureElement();
		this.init.apply(this, arguments);

		View._super.constructor.apply(this, arguments);

	},

	$html: $('html'),
	$body: $('body'),
	$doc: $(document),
	$win: $(window),

	events: {},
	childrenEl: {},

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
		this.$el = $(el);
	},

	_removeElement: function () {
		if ( !this.el ) {
			return;
		}
		this.$el.remove();
	},

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

		Object.keys(childrenEl)
			.forEach(( key ) => {
				const selector = this.$(childrenEl[key]);
				this[`$${key}`] = selector;
			});

	},

	/**
	 * @param  {Object} events
	 */
	delegateEvents: function ( events ) {

		events = events || this.events;
		this.undelegateEvents();

		Object.keys(events)
			.forEach(( key ) => {

				let method = events[key];

				if ( typeof method !== 'function' ) {
					method = this[method];
				}
				if ( !method ) {
					return true;
				}

				const match = key.match(delegateEventSplitter);
				const eventMatch = match[1].match(eventListSplitter);

				for ( let i = 0, eventMatchLength = eventMatch.length; i < eventMatchLength; i++ ) {
					this.delegate(eventMatch[i], match[2], $.proxy(method, this));
				}

			});

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
	 */
	undelegate: function ( eventName, selector, listener ) {
		this.$el.off(eventName + this.ens, selector, listener);
	}

});
