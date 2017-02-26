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

		this.subviews = {};
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
		this.removeSubviews();
		delete this.subviews;
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
	},

	/**
	 * Returns subview by supplied key
	 *
	 * @param  {String|Number} key
	 *
	 * @return {View}
	 */
	getSubview: function ( key ) {
		return this.subviews[key];
	},

	/**
	 * Adds a subview to the current view, which will
	 * ensure its removal when this view is removed,
	 * or when view.removeSubviews is called
	 *
	 * @param {View} view
	 * @param {String|Number} key
	 *
	 * @return {View}
	 */
	addSubview: function ( view, key ) {
		if ( !(view instanceof View) ) {
			throw new Error('Subview must be a View');
		}
		if ( typeof key === 'undefined' ) {
			key = view.uid;
		}
		this.subviews[key] = view;
		return view;
	},

	/**
	 * Removes any subviews associated with this view
	 * by `addSubview`, which will in-turn remove any
	 * children of those views, and so on
	 *
	 * @return {View}
	 */
	removeSubviews: function () {

		const hasOwnProp = Object.prototype.hasOwnProperty;

		for ( let key in this.subviews ) {
			if ( hasOwnProp.call(this.subviews, key) ) {
				const subview = this.subviews[key];
				if ( typeof subview.remove === 'function' ) {
					subview.remove();
				}
				delete this.subviews[key];
			}
		}

		return this;

	},

	/**
	 * Get subview placeholder
	 *
	 * @return {String}
	 */
	getRenderPlaceholder: function () {
		return `<div data-view-uid="${this.uid}"></div>`;
	},

	/**
	 * Replace subview placeholder with its real content
	 *
	 * @param  {String|Number} key
	 */
	assignSubview: function ( key ) {
		const view = this.getSubview(key);
		this.$(`[data-view-uid="${view.uid}"]`).replaceWith(view.render().el);
	}

});
