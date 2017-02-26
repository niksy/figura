'use strict';

const $ = require('jquery');
const pick = require('mout/object/pick');
const omit = require('mout/object/omit');
const Klass = require('kist-klass');

const delegateEventSplitter = /^(\S+)\s*(.*)$/;
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
		this.initialize.apply(this, arguments);

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
		this.el = this.$el[0];
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

	initialize: function () {

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
				if ( method ) {
					const match = key.match(delegateEventSplitter);
					this.delegate(match[1], match[2], method.bind(this));
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
