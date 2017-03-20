'use strict';

const $ = require('jquery');
const pick = require('mout/object/pick');
const morphdom = require('morphdom');
const View = require('./index');
const hasOwnProp = Object.prototype.hasOwnProperty;

/**
 * @param  {String|Number|Element|jQuery} template
 *
 * @return {jQuery}
 */
function getElementFromTemplate ( template ) {
	template = $(template);
	if ( template.length !== 1 ) {
		throw new Error('View must contain only one parent element.');
	}
	return template;
}

/**
 * @param  {View} ctx
 */
function handleSubviews ( ctx ) {

	for ( let key in ctx.subviews ) {
		if ( hasOwnProp.call(ctx.subviews, key) ) {
			const subview = ctx.subviews[key];
			if ( subview._usesRenderPlaceholder ) {
				ctx.assignSubview(key);
			}
		}
	}

}

module.exports = View.extend({

	constructor: function ( options ) {
		options = typeof options === 'object' ? options : {};
		$.extend(this, pick(options, 'fromTemplate'));
		View.prototype.constructor.apply(this, arguments);
	},

	/**
	 * Get subview placeholder
	 *
	 * @return {String}
	 */
	getRenderPlaceholder: function () {
		this._usesRenderPlaceholder = true;
		return View.prototype.getRenderPlaceholder.apply(this, arguments);
	},

	/**
	 * Renders DOM diffed content
	 *
	 * @param  {String|Number|Element|jQuery} content
	 * @param  {Function} cb
	 *
	 * @return {View}
	 */
	_renderDiff: function ( content, cb ) {

		if ( this.fromTemplate && !this._domDiffReady ) {
			this._domDiffReady = true;

			// If we’re getting the whole view DOM from template, we first
			// check if there is only one parent element; if it’s not,
			// inform implementor to correct that, otherwise set `this.$el` to
			// the parent element from template
			this.setElement(getElementFromTemplate(content)[0]);
			handleSubviews(this);

			return this;

		}

		this._domDiffReady = true;

		let newEl;
		if ( this.fromTemplate ) {
			newEl = getElementFromTemplate(content)[0];
		} else {
			newEl = this.$el.clone().html(content)[0];
		}

		if ( typeof cb === 'function' ) {
			morphdom(this.el, newEl, {
				onElUpdated: () => {
					handleSubviews(this);
					cb();
				}
			});
		} else {
			morphdom(this.el, newEl);
			handleSubviews(this);
		}

		return this;

	},

	/**
	 * Public _renderDiff method with optimized rendering via rAF where possible
	 *
	 * @return {View}
	 */
	renderDiff: function () {
		const args = [].slice.call(arguments);
		if ( window.requestAnimationFrame ) {
			window.requestAnimationFrame(() => {
				this._renderDiff.apply(this, args);
			});
		} else {
			this._renderDiff.apply(this, args);
		}
		return this;
	}

});
