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
	 * Renders patched content with Virtual DOM
	 *
	 * @param  {String|Number|Element|jQuery} content
	 *
	 * @return {View}
	 */
	renderDiff: function ( content ) {

		if ( !this._vdomTree ) {
			// If we’re getting the whole view DOM from template, we first
			// check if there is only one parent element; if it’s not,
			// inform implementor to correct that, otherwise set `this.$el` to
			// the parent element from template
			if ( this.fromTemplate ) {
				this.setElement(getElementFromTemplate(content)[0]);
			} else {
				this.$el.html(content);
			}
			this._vdomTree = this.$el.clone()[0];
		} else {
			let newEl;
			if ( this.fromTemplate ) {
				newEl = getElementFromTemplate(content)[0];
			} else {
				newEl = this.$el.clone().html(content)[0];
			}
			const newTree = newEl;
			morphdom(this.el, newTree);
			this._vdomTree = this.el;
		}

		for ( let key in this.subviews ) {
			if ( hasOwnProp.call(this.subviews, key) ) {
				const subview = this.subviews[key];
				if ( subview._usesRenderPlaceholder ) {
					this.assignSubview(key);
				}
			}
		}

		return this;
	}

});
